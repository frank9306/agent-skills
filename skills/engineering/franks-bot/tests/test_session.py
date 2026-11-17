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
        pass


class SessionTest(unittest.TestCase):
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
