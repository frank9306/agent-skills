"""Public CLI and native Hook-protocol tests using actual subprocesses and Git."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
RUNNER = HERE.parent / "assets/python/codex_checks.py"


class PythonHooksTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "project with spaces"
        self.root.mkdir()
        self.git("init", "--quiet")
        (self.root / "src").mkdir()
        (self.root / "src/item.py").write_text("value = 1\n", encoding="utf-8")
        (self.root / ".cache").mkdir()
        (self.root / ".codex").mkdir()
        self.probe = self.root / ".cache/probe.py"
        self.probe.write_text(
            "from pathlib import Path\nimport sys\n"
            "p = Path('.cache/calls.log')\n"
            "with p.open('a', encoding='utf-8') as stream: stream.write(sys.argv[1] + '\\n')\n"
            "sys.exit(1 if Path('.cache/fail-' + sys.argv[1]).exists() else 0)\n",
            encoding="utf-8",
        )
        self.config = {"schemaVersion": 1,
                       "quick": [sys.executable, str(self.probe), "quick"],
                       "full": [sys.executable, str(self.probe), "full"],
                       "timeoutSeconds": 10}
        self.save_config()

    def git(self, *args, cwd=None):
        result = subprocess.run(["git", *args], cwd=cwd or self.root,
                                text=True, capture_output=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return result.stdout.strip()

    def save_config(self):
        (self.root / ".codex/checks.json").write_text(json.dumps(self.config), encoding="utf-8")

    def invoke(self, event=None, mode=None, cwd=None):
        args = [sys.executable, str(RUNNER)]
        if mode:
            args += ["--run", mode]
        result = subprocess.run(args, cwd=cwd or self.root,
                                input=json.dumps(event) if event is not None else None,
                                text=True, capture_output=True, encoding="utf-8", timeout=20)
        self.assertTrue(result.stdout.strip(), result.stderr)
        self.assertEqual(result.stderr, "", result.stderr)
        return result.returncode, json.loads(result.stdout)

    def hook(self, name, **fields):
        event = {"hook_event_name": name, "session_id": "test-session",
                 "cwd": str(self.root), **fields}
        status, report = self.invoke(event)
        self.assertEqual(status, 0, report)
        return report

    def edit(self, value=2):
        (self.root / "src/item.py").write_text(f"value = {value}\n", encoding="utf-8")

    def calls(self):
        file = self.root / ".cache/calls.log"
        return file.read_text(encoding="utf-8").splitlines() if file.exists() else []

    def state_directory(self, cwd=None):
        value = Path(self.git("rev-parse", "--git-path", "codex-checks", cwd=cwd))
        return value if value.is_absolute() else (cwd or self.root) / value

    def test_full_cli_always_runs_quick_before_project_command(self):
        status, result = self.invoke(mode="full")
        self.assertEqual(status, 0, result)
        self.assertTrue(result["ok"])
        self.assertEqual(self.calls(), ["quick", "full"])
        (self.root / ".cache/fail-quick").touch()
        status, result = self.invoke(mode="full")
        self.assertEqual(status, 1, result)
        self.assertFalse(result["ok"])
        self.assertEqual(self.calls(), ["quick", "full", "quick"])

    def test_initial_dirty_worktree_and_read_only_turn_do_not_repair(self):
        self.edit(7)
        self.hook("SessionStart")
        self.hook("UserPromptSubmit", prompt="Read the files and explain them.")
        self.assertNotIn("hookSpecificOutput", self.hook("PostToolUse"))
        self.assertNotIn("decision", self.hook("Stop"))
        self.assertEqual(self.calls(), [])

    def test_post_edit_provides_nonblocking_quick_feedback(self):
        self.hook("SessionStart")
        self.hook("UserPromptSubmit", prompt="Implement the requested behavior.")
        self.edit()
        (self.root / ".cache/fail-quick").touch()
        report = self.hook("PostToolUse")
        self.assertNotIn("decision", report)
        self.assertEqual(report["hookSpecificOutput"]["hookEventName"], "PostToolUse")
        self.assertIn("FAILED", report["hookSpecificOutput"]["additionalContext"])
        self.assertEqual(self.calls(), ["quick"])

    def test_stop_runs_fresh_full_and_preserves_two_retry_limit(self):
        self.hook("SessionStart")
        self.hook("UserPromptSubmit", prompt="Implement behavior.")
        self.edit()
        self.hook("PostToolUse")
        (self.root / ".cache/fail-full").touch()
        first = self.hook("Stop", turn_id="first")
        self.assertEqual(first["decision"], "block")
        self.assertIn("[codex-checks:", first["reason"])
        self.hook("UserPromptSubmit", prompt=first["reason"], turn_id="continuation")
        self.edit(3)
        second = self.hook("Stop", turn_id="second", stop_hook_active=True)
        self.assertEqual(second["decision"], "block")
        self.edit(4)
        third = self.hook("Stop", turn_id="third", stop_hook_active=True)
        self.assertNotIn("decision", third)
        self.assertIn("FAILED", third["systemMessage"])
        self.assertIn("unfinished", third["systemMessage"])
        self.assertEqual(self.calls(), ["quick", "quick", "full", "quick", "full", "quick", "full"])

    def test_new_real_user_prompt_resets_retry_and_dirty_state(self):
        self.hook("SessionStart")
        self.edit()
        (self.root / ".cache/fail-full").touch()
        for _ in range(3):
            self.hook("Stop", stop_hook_active=True)
        self.hook("UserPromptSubmit", prompt="Only summarize the remaining failure.")
        self.assertNotIn("decision", self.hook("Stop"))
        before = len(self.calls())
        self.hook("UserPromptSubmit", prompt="Now fix it.")
        self.edit(3)
        self.assertEqual(self.hook("Stop")["decision"], "block")
        self.assertEqual(len(self.calls()), before + 2)

    def test_inputs_changed_by_full_command_are_not_a_pass(self):
        self.config["full"] = [sys.executable, "-c", "from pathlib import Path; Path('src/item.py').write_text('value = 99\\n')"]
        self.save_config()
        status, report = self.invoke(mode="full")
        self.assertEqual(status, 1, report)
        self.assertIn("changed", report["detail"])

    def test_ignored_check_configuration_still_invalidates_verification(self):
        (self.root / ".gitignore").write_text(".codex/\n", encoding="utf-8")
        self.config["full"] = [sys.executable, "-c", "from pathlib import Path; p=Path('.codex/checks.json'); p.write_text(p.read_text() + ' ')"]
        self.save_config()
        status, report = self.invoke(mode="full")
        self.assertEqual(status, 1, report)
        self.assertIn("changed", report["detail"])

    def test_compaction_preserves_edit_state_and_retry_limit(self):
        self.hook("SessionStart")
        self.edit()
        (self.root / ".cache/fail-full").touch()
        self.assertEqual(self.hook("Stop")["decision"], "block")
        self.hook("SessionStart", source="compact")
        self.assertEqual(self.hook("Stop", stop_hook_active=True)["decision"], "block")
        self.hook("SessionStart", source="resume")
        self.assertNotIn("decision", self.hook("Stop", stop_hook_active=True))

    def test_missing_tool_and_timeout_are_failures(self):
        self.config["quick"] = ["codex-checks-missing-command-8f42"]
        self.save_config()
        self.assertIn("FAILED", self.hook("SessionStart")["systemMessage"])
        self.assertEqual(self.invoke(mode="full")[0], 1)
        self.config["quick"] = [sys.executable, "-c", "import time; time.sleep(1)"]
        self.config["timeoutSeconds"] = 0.05
        self.save_config()
        status, report = self.invoke(mode="quick")
        self.assertEqual(status, 1, report)
        self.assertIn("timeout", report["detail"].lower())

    def test_subdirectory_root_and_deleted_tracked_input(self):
        self.git("add", "src/item.py")
        self.hook("SessionStart", cwd=str(self.root / "src"))
        (self.root / "src/item.py").unlink()
        report = self.hook("PostToolUse", cwd=str(self.root / "src"))
        self.assertIn("hookSpecificOutput", report)
        self.assertEqual(self.calls(), ["quick"])
        self.assertTrue(self.state_directory().is_dir())

    def test_worktree_state_uses_its_own_git_directory(self):
        self.git("add", ".codex/checks.json", "src/item.py")
        self.git("-c", "user.name=Hook test", "-c", "user.email=hooks@example.invalid", "commit", "--quiet", "-m", "fixture")
        sibling = self.root.parent / "linked"
        self.git("worktree", "add", "--detach", str(sibling), "HEAD")
        report = self.hook("SessionStart", cwd=str(sibling))
        self.assertNotIn("FAILED", report.get("systemMessage", ""))
        self.assertTrue(self.state_directory(sibling).is_dir())
        self.assertFalse(self.state_directory().exists())

    def test_existing_lock_fails_without_deleting_it(self):
        self.hook("SessionStart")
        lock = self.state_directory() / "worktree.lock"
        lock.write_text("another-owner", encoding="utf-8")
        try:
            report = self.hook("PostToolUse")
            self.assertIn("FAILED", report.get("systemMessage", ""))
            self.assertEqual(lock.read_text(encoding="utf-8"), "another-owner")
        finally:
            lock.unlink()

    @unittest.skipUnless(os.name == "nt", "Windows batch launcher behavior")
    def test_windows_cmd_launcher_and_unsafe_argument_rejection(self):
        launcher = self.root / ".cache/check probe.cmd"
        launcher.write_text('@echo off\r\n"' + sys.executable + '" "' + str(self.probe) + '" %*\r\n', encoding="utf-8")
        self.config["quick"] = [str(launcher), "quick"]
        self.save_config()
        status, result = self.invoke(mode="quick")
        self.assertEqual(status, 0, result)
        self.assertEqual(self.calls(), ["quick"])
        self.config["quick"] = [str(launcher), "quick&echo UNSAFE"]
        self.save_config()
        status, result = self.invoke(mode="quick")
        self.assertEqual(status, 1, result)
        self.assertIn("unsafe", result["detail"].lower())
        self.assertEqual(self.calls(), ["quick"])


if __name__ == "__main__":
    unittest.main()
