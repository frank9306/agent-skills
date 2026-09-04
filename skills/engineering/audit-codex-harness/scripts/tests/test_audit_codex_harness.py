import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[2]
CLI = SKILL_ROOT / "scripts" / "audit_codex_harness.py"


def write_session(home: Path, name: str, cwd: Path, *, tokens=None, calls=None, final=True, malformed=False):
    path = home / "sessions" / "2026" / "09" / "04" / f"{name}.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    records = [
        {"timestamp": "2026-09-04T01:00:00Z", "type": "session_meta", "payload": {"id": name, "cwd": str(cwd)}},
        {"timestamp": "2026-09-04T01:00:01Z", "type": "turn_context", "payload": {"model": "gpt-test", "effort": "medium"}},
    ]
    for index, item in enumerate(tokens or []):
        records.append({
            "timestamp": f"2026-09-04T01:01:{index:02d}Z",
            "type": "event_msg",
            "payload": {"type": "token_count", "info": {"last_token_usage": item}},
        })
    for index, (name_, arguments, output) in enumerate(calls or []):
        call_id = f"call-{index}"
        records.extend([
            {"timestamp": "2026-09-04T01:02:00Z", "type": "response_item", "payload": {"type": "function_call", "name": name_, "arguments": arguments, "call_id": call_id}},
            {"timestamp": "2026-09-04T01:02:01Z", "type": "response_item", "payload": {"type": "function_call_output", "call_id": call_id, "output": output}},
        ])
    if final:
        records.append({"timestamp": "2026-09-04T01:03:00Z", "type": "event_msg", "payload": {"type": "agent_message", "phase": "final_answer", "message": "private"}})
    with path.open("w", encoding="utf-8") as stream:
        for record in records:
            stream.write(json.dumps(record) + "\n")
        if malformed:
            stream.write("{not json}\n")
    return path


def write_state(home: Path, rows):
    db = sqlite3.connect(home / "state_5.sqlite")
    db.execute("CREATE TABLE threads (id TEXT PRIMARY KEY, rollout_path TEXT, cwd TEXT, project_id TEXT, git_origin_url TEXT, git_sha TEXT, git_branch TEXT, tokens_used INTEGER)")
    db.executemany("INSERT INTO threads VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rows)
    db.commit()
    db.close()


def clone_to_archive(home: Path, source: Path):
    relative = source.relative_to(home / "sessions")
    target = home / "archived_sessions" / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
    return target


class AuditCliTests(unittest.TestCase):
    def run_cli(self, project, home=None, env_home=None, *extra):
        env = os.environ.copy()
        if env_home is None:
            env.pop("CODEX_HOME", None)
        else:
            env["CODEX_HOME"] = str(env_home)
        command = [sys.executable, str(CLI), "--project", str(project), "--now", "2026-09-04T12:00:00Z", "--json", *extra]
        if home:
            command.extend(["--codex-home", str(home)])
        return subprocess.run(command, text=True, encoding="utf-8", capture_output=True, env=env)

    def test_explicit_home_wins_and_unrelated_sessions_are_excluded(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            explicit = root / "explicit"
            env_home = root / "environment"
            write_session(explicit, "included", project, tokens=[{"input_tokens": 100, "cached_input_tokens": 20, "output_tokens": 10, "reasoning_output_tokens": 5, "total_tokens": 135}])
            write_session(explicit, "excluded", root / "other", tokens=[{"input_tokens": 9999, "total_tokens": 9999}])
            write_session(env_home, "wrong-home", project, tokens=[{"input_tokens": 8888, "total_tokens": 8888}])

            result = self.run_cli(project, explicit, env_home)

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["coverage"]["matched_sessions"], 1)
            self.assertEqual(report["coverage"]["excluded_sessions"], 1)
            self.assertEqual(report["tokens"]["input_tokens"], 100)
            self.assertEqual(report["data_source"]["selection"], "explicit")

    def test_same_project_worktree_is_grouped_and_archive_copy_is_deduplicated(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            worktree = root / "worktrees" / "repo-feature"
            unrelated = root / "repo-copy"
            for directory in (project, worktree, unrelated):
                directory.mkdir(parents=True)
            current_path = write_session(root / "home", "current", project, tokens=[{"input_tokens": 10, "total_tokens": 10}])
            worktree_path = write_session(root / "home", "worktree", worktree, tokens=[{"input_tokens": 20, "total_tokens": 20}])
            other_path = write_session(root / "home", "other", unrelated, tokens=[{"input_tokens": 500, "total_tokens": 500}])
            clone_to_archive(root / "home", current_path)
            write_state(root / "home", [
                ("current", str(current_path), str(project), "project-1", "https://example/repo.git", "a", "main", 10),
                ("worktree", str(worktree_path), str(worktree), "project-1", "https://example/repo.git", "b", "feature", 20),
                ("other", str(other_path), str(unrelated), "project-2", "https://example/other.git", "c", "main", 500),
            ])

            result = self.run_cli(project, root / "home")

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["coverage"]["matched_sessions"], 2)
            self.assertEqual(report["coverage"]["duplicate_sessions"], 1)
            self.assertEqual(report["groups"]["current_checkout"]["sessions"], 1)
            self.assertEqual(report["groups"]["worktrees"]["sessions"], 1)
            self.assertEqual(report["tokens"]["input_tokens"], 30)

    def test_checkout_only_excludes_confirmed_worktrees(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            worktree = root / "worktree"
            project.mkdir()
            worktree.mkdir()
            a = write_session(root / "home", "a", project, tokens=[{"input_tokens": 10, "total_tokens": 10}])
            b = write_session(root / "home", "b", worktree, tokens=[{"input_tokens": 20, "total_tokens": 20}])
            write_state(root / "home", [
                ("a", str(a), str(project), "same", "https://example/repo", "a", "main", 10),
                ("b", str(b), str(worktree), "same", "https://example/repo", "b", "topic", 20),
            ])

            result = self.run_cli(project, root / "home", None, "--checkout-only")

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["coverage"]["matched_sessions"], 1)
            self.assertEqual(report["groups"]["worktrees"]["sessions"], 0)

    def test_scores_tool_waste_and_requires_objective_evidence_for_composite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            private_argument = "SECRET-PROMPT-CONTENT"
            tokens = [
                {"input_tokens": 1000, "cached_input_tokens": 100, "output_tokens": 100, "reasoning_output_tokens": 50, "total_tokens": 1250},
                {"input_tokens": 90000, "cached_input_tokens": 10000, "output_tokens": 100, "reasoning_output_tokens": 2000, "total_tokens": 102100},
            ]
            calls = [
                ("exec_command", json.dumps({"cmd": f"rg {private_argument}"}), '{"exit_code":1,"output":"failed"}'),
                ("exec_command", json.dumps({"cmd": f"rg {private_argument}"}), '{"exit_code":1,"output":"failed"}'),
            ]
            write_session(root / "home", "waste", project, tokens=tokens, calls=calls)

            result = self.run_cli(project, root / "home")

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertNotIn(private_argument, result.stdout)
            report = json.loads(result.stdout)
            self.assertLess(report["scores"]["operational_efficiency"], 100)
            self.assertIsNone(report["scores"]["composite_harness"])
            codes = {finding["code"] for finding in report["findings"]}
            self.assertIn("tool_failures", codes)
            self.assertIn("repeated_calls", codes)
            self.assertIn("context_growth", codes)

    def test_successful_test_command_enables_composite_score(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            write_session(
                root / "home",
                "verified",
                project,
                tokens=[{"input_tokens": 100, "output_tokens": 10, "reasoning_output_tokens": 5, "total_tokens": 115}],
                calls=[("exec_command", '{"cmd":"npm test"}', '{"exit_code":0,"output":"all tests passed"}')],
            )

            result = self.run_cli(project, root / "home")

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertIsNotNone(report["scores"]["composite_harness"])
            self.assertEqual(report["evidence"]["successful_verifications"], 1)

    def test_malformed_log_is_reported_with_low_confidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            write_session(root / "home", "broken", project, tokens=[{"input_tokens": 10, "total_tokens": 10}], malformed=True)

            result = self.run_cli(project, root / "home")

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["scores"]["confidence"], "low")
            self.assertTrue(any(item.startswith("malformed_json:") for item in report["coverage"]["warnings"]))

    def test_worktree_detail_is_anonymized_and_grouped_by_branch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project, worktree = root / "repo", root / "secret-worktree-path"
            project.mkdir()
            worktree.mkdir()
            a = write_session(root / "home", "a", project, tokens=[{"input_tokens": 10, "total_tokens": 10}])
            b = write_session(root / "home", "b", worktree, tokens=[{"input_tokens": 20, "total_tokens": 20}])
            write_state(root / "home", [
                ("a", str(a), str(project), "same", "https://example/repo", "a", "main", 10),
                ("b", str(b), str(worktree), "same", "https://example/repo", "b", "feature/private", 20),
            ])

            result = self.run_cli(project, root / "home", None, "--worktree-detail")

            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["worktree_breakdown"][0]["branch"], "feature/private")
            self.assertNotIn(str(worktree), result.stdout)

    def test_flags_low_cache_reuse_and_excessive_delegation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            calls = [("spawn_agent", json.dumps({"message": f"private-{i}"}), '{"exit_code":0}') for i in range(4)]
            write_session(root / "home", "delegated", project, tokens=[{"input_tokens": 120000, "cached_input_tokens": 0, "output_tokens": 10, "total_tokens": 120010}], calls=calls)

            result = self.run_cli(project, root / "home")

            self.assertEqual(result.returncode, 0, result.stderr)
            codes = {item["code"] for item in json.loads(result.stdout)["findings"]}
            self.assertIn("low_cache_reuse", codes)
            self.assertIn("heavy_delegation", codes)

    def test_default_output_is_human_readable_and_json_is_opt_in(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "repo"
            project.mkdir()
            write_session(root / "home", "readable", project, tokens=[{"input_tokens": 10, "total_tokens": 10}])
            env = os.environ.copy()
            env.pop("CODEX_HOME", None)

            result = subprocess.run(
                [sys.executable, str(CLI), "--project", str(project), "--codex-home", str(root / "home"), "--now", "2026-09-04T12:00:00Z"],
                text=True, encoding="utf-8", capture_output=True, env=env,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(result.stdout.startswith("Codex Harness Audit\n"))
            with self.assertRaises(json.JSONDecodeError):
                json.loads(result.stdout)


if __name__ == "__main__":
    unittest.main()
