import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest


SKILL = Path(__file__).resolve().parents[1]
SESSION = SKILL / "scripts" / "session.py"
FIXTURE = Path(__file__).with_name("hidden-fixture.ps1")


def run_session(*args):
    return subprocess.run(
        [sys.executable, str(SESSION), *map(str, args)],
        capture_output=True, text=True, timeout=30,
    )


class HiddenDesktopCliTests(unittest.TestCase):
    def test_hidden_target_refuses_relative_program_before_starting(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            case = root / "case.json"
            output = root / "result"
            case.write_text(json.dumps({
                "target": {"kind": "windows-hidden", "executable": "notepad.exe"},
                "steps": [{"id": "first", "action": "click"}],
            }), encoding="utf-8")
            result = run_session("--case", case, "--output", output)
            self.assertEqual(result.returncode, 2, result.stderr)
            self.assertIn("absolute executable path", result.stderr)
            self.assertFalse(output.exists())


    @unittest.skipUnless(os.name == "nt", "requires Windows path validation")
    def test_hidden_target_refuses_global_key_step_before_launch(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            case = root / "case.json"
            output = root / "result"
            executable = Path(os.environ["SystemRoot"]) / "System32/where.exe"
            self.assertTrue(executable.is_file())
            case.write_text(json.dumps({
                "target": {"kind": "windows-hidden", "executable": str(executable)},
                "steps": [{"id": "system_shortcut", "action": "key", "keys": "ALT+TAB",
                           "expect": {"visibleWindow": True}}],
            }), encoding="utf-8")
            result = run_session("--case", case, "--output", output)
            self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
            self.assertIn("system_shortcut", result.stderr)
            self.assertIn("key", result.stderr)
            self.assertFalse(output.exists())


@unittest.skipUnless(os.name == "nt", "requires a Windows interactive session")
class HiddenDesktopWindowsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.case = root / "case.json"
        self.output = root / "result"
        self.target = {
            "kind": "windows-hidden",
            "executable": str(Path(os.environ["SystemRoot"]) /
                              "System32/WindowsPowerShell/v1.0/powershell.exe"),
            "args": ["-NoProfile", "-STA", "-File", str(FIXTURE)],
            "title": "Franks Bot Hidden Fixture",
        }

    def make_case(self, expected="中文", timeout=1000):
        self.case.write_text(json.dumps({
            "target": self.target,
            "steps": [{"id": "type", "action": "type", "target": {"kind": "Edit"},
                       "text": "中文", "expect": {"kind": "Edit", "equals": expected},
                       "timeoutMs": timeout}],
        }), encoding="utf-8")

    def result(self, command):
        self.assertTrue(command.stdout, command.stderr)
        return json.loads(command.stdout)

    def close_if_retained(self):
        checked = run_session("--retained-status", self.output)
        if checked.returncode == 0 and self.result(checked)["phase"] == "retained":
            run_session("--close-retained", self.output)

    def test_success_readbacks_unicode_and_closes_owned_windows(self):
        self.make_case()
        self.addCleanup(self.close_if_retained)
        result = run_session("--case", self.case, "--output", self.output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIs(self.result(result)["desktopReleased"], True)
        events = (self.output / "actions.jsonl").read_text(encoding="utf-8")
        self.assertIn('"status": "passed"', events)

    def test_assertion_timeout_retains_window_until_explicit_close(self):
        self.make_case(expected="Wrong result")
        self.addCleanup(self.close_if_retained)
        result = run_session("--case", self.case, "--output", self.output)
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(self.result(result)["phase"], "retained")
        self.assertIn('"status": "timeout"', (self.output / "actions.jsonl").read_text(encoding="utf-8"))
        closed = run_session("--close-retained", self.output)
        self.assertEqual(closed.returncode, 0, closed.stdout + closed.stderr)
        self.assertEqual(self.result(closed)["phase"], "closed")

    def test_cancelling_an_active_case_preserves_the_window(self):
        self.make_case(expected="Wrong result", timeout=20000)
        self.addCleanup(self.close_if_retained)
        with subprocess.Popen([sys.executable, str(SESSION), "--case", str(self.case), "--output",
                               str(self.output)], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              text=True) as runner:
            action_log = self.output / "actions.jsonl"
            deadline = time.monotonic() + 15
            while time.monotonic() < deadline:
                if action_log.is_file() and '"event": "dispatch"' in action_log.read_text(encoding="utf-8"):
                    break
                if runner.poll() is not None:
                    self.fail(runner.communicate())
                time.sleep(0.1)
            else:
                runner.kill()
                self.fail("Timed out waiting for the fixture to receive its input")
            self.assertEqual(run_session("--cancel-hidden", self.output).returncode, 0)
            out, err = runner.communicate(timeout=15)
            self.assertEqual(runner.returncode, 1, out + err)
            self.assertEqual(json.loads(out)["phase"], "retained")
            self.assertIn('"status": "cancelled"', action_log.read_text(encoding="utf-8"))

    def test_single_instance_guard_skips_an_already_running_program(self):
        self.target["singleInstance"] = True
        self.make_case()
        self.addCleanup(self.close_if_retained)
        result = run_session("--case", self.case, "--output", self.output)
        self.assertEqual(result.returncode, 3, result.stdout + result.stderr)
        self.assertEqual(self.result(result)["phase"], "skipped")
        self.assertFalse((self.output / "actions.jsonl").exists())
