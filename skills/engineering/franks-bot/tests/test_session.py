import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from session import run_case


class BrowserFixture:
    def __init__(self, value=""):
        self.dispatched = []
        self.phases = []
        self.value = value

    def locate(self, step):
        return {"by": "CDP", "selector": step["target"]["css"]}

    def perform(self, step, location):
        self.dispatched.append(step["id"])

    def check(self, condition):
        return condition.get("equals") == self.value

    def screenshot(self, path):
        path.write_bytes(b"fixture")

    def feedback(self, phase, message):
        self.phases.append(phase)


class SessionTest(unittest.TestCase):
    def test_subcases_leave_feedback_alive_until_task_completion(self):
        fixture = BrowserFixture(value="demo")
        step = {"id": "check", "action": "click", "target": {"css": "#button"}, "timeoutMs": 10}
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            good = {"steps": [dict(step, expect={"equals": "demo"})]}
            bad = {"steps": [dict(step, expect={"equals": "other"})]}
            self.assertTrue(run_case(good, fixture, root / "good", finalize=False))
            self.assertFalse(run_case(bad, fixture, root / "bad", finalize=False))
            self.assertEqual({"success", "failure", "cancel"} & set(fixture.phases), set())
            self.assertTrue(run_case(good, fixture, root / "final"))
            self.assertEqual(fixture.phases.count("success"), 1)
            self.assertEqual(fixture.phases[-1], "success")

    def test_timeout_does_not_repeat_a_dispatched_action(self):
        fixture = BrowserFixture()
        case = {"steps": [{"id": "search", "action": "type", "text": "demo",
                           "target": {"css": "#q"}, "timeoutMs": 30,
                           "expect": {"equals": "demo"}}]}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            self.assertFalse(run_case(case, fixture, output))
            actions = [json.loads(line) for line in (output / "actions.jsonl").read_text().splitlines()]
        self.assertEqual(["search"], fixture.dispatched)
        self.assertEqual(["dispatch", "result"], [entry["event"] for entry in actions])
        self.assertEqual("timeout", actions[-1]["status"])
        self.assertEqual("CDP", actions[0]["technique"])
        self.assertIsNone(actions[0]["sincePreviousMs"])

    def test_next_action_records_delta_and_capture(self):
        fixture = BrowserFixture(value="demo")
        step = {"action": "click", "target": {"css": "#q"}, "expect": {"equals": "demo"}, "capture": True}
        case = {"steps": [dict(step, id="one"), dict(step, id="two")]}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            self.assertTrue(run_case(case, fixture, output))
            self.assertTrue((output / "two.png").is_file())
            actions = [json.loads(line) for line in (output / "actions.jsonl").read_text().splitlines()]
        self.assertEqual(["one", "two"], fixture.dispatched)
        self.assertGreaterEqual(actions[2]["sincePreviousMs"], 0)


if __name__ == "__main__":
    unittest.main()
