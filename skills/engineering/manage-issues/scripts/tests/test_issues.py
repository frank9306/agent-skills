from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "issues.py"
TEMPLATE = Path(__file__).resolve().parents[2] / "assets" / "issue.md.tmpl"
SPEC = importlib.util.spec_from_file_location("issues", SCRIPT)
assert SPEC and SPEC.loader
issues = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(issues)


class IssueTests(unittest.TestCase):
    def project(self, temporary: str) -> Path:
        project = Path(temporary)
        (project / "docs" / "issues").mkdir(parents=True)
        (project / "docs" / "changelog").mkdir(parents=True)
        return project

    def test_create_transition_close_and_changelog(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = self.project(temporary)
            first = issues.create_issue(
                project, TEMPLATE, "Payment retry", "Duplicates occur.", "One capture.", "high", []
            )
            second = issues.create_issue(
                project, TEMPLATE, "Order cancellation", "Orders leak.", "Stop fulfillment.", "medium", []
            )
            self.assertTrue(first.name.startswith("ISSUE-0001-"))
            self.assertTrue(second.name.startswith("ISSUE-0002-"))

            with self.assertRaises(ValueError):
                issues.transition(project, "ISSUE-0001", "ready", None, None, "Changed")

            content = first.read_text(encoding="utf-8").replace(
                "- [ ] Define concrete acceptance criteria.", "- [x] Duplicate requests create one capture."
            )
            first.write_text(content, encoding="utf-8")
            issues.transition(project, "ISSUE-0001", "ready", None, None, "Changed")
            issues.transition(project, "ISSUE-0001", "in-progress", None, None, "Changed")
            issue_path, changelog = issues.transition(
                project,
                "ISSUE-0001",
                "done",
                "Added idempotent payment capture.",
                "Focused and full tests passed.",
                "Added",
            )
            self.assertIn("status: done", issue_path.read_text(encoding="utf-8"))
            self.assertIsNotNone(changelog)
            changelog_text = changelog.read_text(encoding="utf-8")
            self.assertEqual(changelog_text.count("<!-- ISSUE-0001 -->"), 1)
            self.assertIn("ISSUE-0001", (project / "docs" / "issues" / "README.md").read_text(encoding="utf-8"))

    def test_rejects_illegal_transition(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = self.project(temporary)
            issues.create_issue(project, TEMPLATE, "Example", "Problem.", "Outcome.", "low", [])
            with self.assertRaises(ValueError):
                issues.transition(project, "ISSUE-0001", "done", "Done.", "Passed.", "Changed")

    def test_cancelled_issue_is_recorded_in_changelog(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = self.project(temporary)
            issues.create_issue(project, TEMPLATE, "Discarded option", "Option exists.", "Decide.", "low", [])
            issue_path, changelog = issues.transition(
                project, "ISSUE-0001", "cancelled", "Rejected after review.", None, "Changed"
            )
            self.assertIn("status: cancelled", issue_path.read_text(encoding="utf-8"))
            self.assertIsNotNone(changelog)
            self.assertIn("### Cancelled", changelog.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
