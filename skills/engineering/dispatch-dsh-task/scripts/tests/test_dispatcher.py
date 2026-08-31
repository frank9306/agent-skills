import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from subprocess import CompletedProcess
from dataclasses import replace

import sys

SCRIPTS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRIPTS))

import dsh_dispatcher


class PayloadTests(unittest.TestCase):
    def test_accepts_fixed_repository_and_source(self):
        payload = dsh_dispatcher.validate_payload(
            {
                "repository": "frank9306/my-knowledge",
                "request": "更新首页的一处说明文案",
                "source": "wechat",
                "schedule_id": None,
                "requested_at": "2026-08-28T10:00:00+08:00",
            }
        )
        self.assertEqual(payload["repository"], "frank9306/my-knowledge")

    def test_rejects_unknown_repository(self):
        with self.assertRaisesRegex(ValueError, "repository"):
            dsh_dispatcher.validate_payload(
                {
                    "repository": "frank9306/other",
                    "request": "update",
                    "source": "wechat",
                    "schedule_id": None,
                    "requested_at": "2026-08-28T10:00:00+08:00",
                }
            )

    def test_rejects_destructive_request_but_allows_explicit_prohibition(self):
        base = {
            "repository": "frank9306/my-knowledge",
            "source": "wechat",
            "schedule_id": None,
            "requested_at": "2026-08-28T10:00:00+08:00",
        }
        with self.assertRaisesRegex(ValueError, "high-risk"):
            dsh_dispatcher.validate_payload({**base, "request": "删除所有旧文章"})
        allowed = dsh_dispatcher.validate_payload(
            {**base, "request": "更新文章，不要删除任何文件"}
        )
        self.assertIn("不要删除", allowed["request"])

    def test_idempotency_key_is_stable_and_includes_requested_at(self):
        payload = {
            "repository": "frank9306/my-knowledge",
            "request": "更新文案",
            "source": "hermes-cron",
            "schedule_id": "daily-docs",
            "requested_at": "2026-08-28T10:00:00+08:00",
        }
        first = dsh_dispatcher.idempotency_key(payload)
        self.assertEqual(first, dsh_dispatcher.idempotency_key(dict(reversed(payload.items()))))
        self.assertNotEqual(
            first,
            dsh_dispatcher.idempotency_key(
                {**payload, "requested_at": "2026-08-29T10:00:00+08:00"}
            ),
        )


class IssueTests(unittest.TestCase):
    def test_create_issue_allocates_next_number_and_reindexes(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp)
            issues = repo / "docs" / "issues"
            issues.mkdir(parents=True)
            (issues / "ISSUE-0011-existing.md").write_text(
                "---\nid: ISSUE-0011\ntitle: Existing\nstatus: done\n---\n",
                encoding="utf-8",
            )
            (issues / "README.md").write_text("# Issues\n", encoding="utf-8")
            issue = dsh_dispatcher.create_issue(
                repo,
                {
                    "request": "新增一篇关于任务闭环的文章",
                    "source": "wechat",
                    "schedule_id": None,
                    "requested_at": "2026-08-28T10:00:00+08:00",
                },
                "run-123",
            )
            self.assertEqual(issue.issue_id, "ISSUE-0012")
            self.assertEqual(issue.path.name, "ISSUE-0012-task-loop.md")
            content = issue.path.read_text(encoding="utf-8")
            self.assertIn("status: ready", content)
            self.assertIn("run-123", content)
            index = (issues / "README.md").read_text(encoding="utf-8")
            self.assertIn("## Ready", index)
            self.assertIn("ISSUE-0012", index)
            self.assertIn("## Done", index)
            self.assertIn("ISSUE-0011", index)

    def test_transition_updates_frontmatter_and_index(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp)
            issues = repo / "docs" / "issues"
            issues.mkdir(parents=True)
            issue_path = issues / "ISSUE-0001-test.md"
            issue_path.write_text(
                "---\nid: ISSUE-0001\ntitle: Test task\nstatus: ready\n---\n",
                encoding="utf-8",
            )
            dsh_dispatcher.transition_issue(repo, issue_path, "in-progress")
            self.assertIn("status: in-progress", issue_path.read_text(encoding="utf-8"))
            self.assertIn(
                "ISSUE-0001", (issues / "README.md").read_text(encoding="utf-8")
            )


class DshLaunchTests(unittest.TestCase):
    def test_launches_node_with_internals_required_by_hmr(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            config = dsh_dispatcher.RuntimeConfig.from_env()
            issue = dsh_dispatcher.IssueRecord(
                "ISSUE-0012", "Documentation rule",
                config.workspace / "docs/issues/ISSUE-0012-task-loop.md",
            )
            with patch("dsh_dispatcher.subprocess.run") as process:
                process.return_value = CompletedProcess([], 0, "ok", "")
                dsh_dispatcher.run_dsh(config, issue, root)
            command = process.call_args.args[0]
            node = command.index("node")
            self.assertEqual(command[node + 1], "--expose-internals")

    def test_uses_web_harness_credentials_and_writable_process_home(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = dsh_dispatcher.RuntimeConfig.from_env()
            issue = dsh_dispatcher.IssueRecord(
                "ISSUE-0012", "Documentation rule",
                config.workspace / "docs/issues/ISSUE-0012-task-loop.md",
            )
            with patch("dsh_dispatcher.subprocess.run") as process:
                process.return_value = CompletedProcess([], 0, "ok", "")
                dsh_dispatcher.run_dsh(config, issue, Path(tmp))
            command = process.call_args.args[0]
            environment = dict(
                command[i + 1].split("=", 1)
                for i, value in enumerate(command) if value == "-e"
            )
            self.assertEqual(environment["DSH_HOME"], "/data/dsh")
            self.assertEqual(environment.get("HOME"), "/data/dsh/home")


class VerificationTests(unittest.TestCase):
    def test_build_uses_existing_writable_home(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            config = replace(dsh_dispatcher.RuntimeConfig.from_env(), workspace=root)
            (root / "node_modules").mkdir()
            issue_path = root / "issue.md"
            issue_path.write_text("---\nstatus: done\n---\n", encoding="utf-8")
            issue = dsh_dispatcher.IssueRecord("ISSUE-0012", "Rule", issue_path)

            def process(command, **kwargs):
                if "docs:build" in command and "HOME=/data/dsh/home" not in command:
                    return CompletedProcess(command, 1, "", "Cannot write /root/.local")
                output = "abc123" if "rev-parse" in command else ""
                return CompletedProcess(command, 0, output, "")

            with patch("dsh_dispatcher.subprocess.run", side_effect=process):
                self.assertEqual(dsh_dispatcher.verify_result(config, issue, root), "abc123")


class StateTests(unittest.TestCase):
    def test_completed_request_is_returned_without_new_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = dsh_dispatcher.StateStore(Path(tmp) / "requests.json")
            state.complete("abc", {"status": "done", "run_id": "run-1"})
            self.assertEqual(state.get("abc")["run_id"], "run-1")
            parsed = json.loads((Path(tmp) / "requests.json").read_text(encoding="utf-8"))
            self.assertIn("abc", parsed)


if __name__ == "__main__":
    unittest.main()
