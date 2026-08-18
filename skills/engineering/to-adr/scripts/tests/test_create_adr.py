from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "create_adr.py"
TEMPLATE = Path(__file__).resolve().parents[2] / "assets" / "adr.md.tmpl"
SPEC = importlib.util.spec_from_file_location("create_adr", SCRIPT)
assert SPEC and SPEC.loader
create_adr = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(create_adr)


class AdrTests(unittest.TestCase):
    def test_numbering_references_and_supersedes(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            (project / "docs" / "adr").mkdir(parents=True)
            (project / "docs" / "issues").mkdir(parents=True)
            (project / "docs" / "meetings").mkdir(parents=True)
            (project / "docs" / "issues" / "ISSUE-0001-example.md").write_text("# Issue\n", encoding="utf-8")
            (project / "docs" / "meetings" / "2026-08-18-review.md").write_text("# Meeting\n", encoding="utf-8")

            first = create_adr.create_adr(
                project,
                TEMPLATE,
                "Use PostgreSQL",
                "Persistence is required.",
                "Use PostgreSQL.",
                "Transactional behavior is required.",
                ["Redis"],
                ["Operate PostgreSQL"],
                ["docs/meetings/2026-08-18-review.md"],
                ["ISSUE-0001"],
                None,
            )
            second = create_adr.create_adr(
                project,
                TEMPLATE,
                "Use managed PostgreSQL",
                "Operations changed.",
                "Use a managed service.",
                "Reduce operations.",
                ["Self-hosting"],
                ["Vendor dependency"],
                [],
                [],
                first.name,
            )
            self.assertTrue(first.name.startswith("ADR-0001-"))
            self.assertTrue(second.name.startswith("ADR-0002-"))
            self.assertIn(first.name, second.read_text(encoding="utf-8"))

    def test_rejects_missing_local_source(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            (project / "docs" / "adr").mkdir(parents=True)
            with self.assertRaises(ValueError):
                create_adr.create_adr(
                    project, TEMPLATE, "Decision", "Context", "Decision", "Reason", [], [], ["missing.md"], [], None
                )


if __name__ == "__main__":
    unittest.main()
