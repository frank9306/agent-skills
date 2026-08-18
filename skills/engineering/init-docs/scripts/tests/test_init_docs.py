from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "init_docs.py"
TEMPLATES = Path(__file__).resolve().parents[2] / "assets" / "project-docs"
SPEC = importlib.util.spec_from_file_location("init_docs", SCRIPT)
assert SPEC and SPEC.loader
init_docs = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(init_docs)


class InitDocsTests(unittest.TestCase):
    def test_initializes_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "demo"
            project.mkdir()
            created, unchanged = init_docs.initialize(project, TEMPLATES)
            self.assertEqual(len(created), len(init_docs.FILES))
            self.assertEqual(unchanged, [])
            self.assertTrue((project / "AGENTS.md").is_file())
            self.assertTrue((project / "docs" / "context" / "CONTEXT.md").is_file())

            created_again, unchanged_again = init_docs.initialize(project, TEMPLATES)
            self.assertEqual(created_again, [])
            self.assertEqual(len(unchanged_again), len(init_docs.FILES))

    def test_conflict_preflight_writes_nothing_else(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "demo"
            project.mkdir()
            (project / "AGENTS.md").write_text("user content\n", encoding="utf-8")

            with self.assertRaises(FileExistsError):
                init_docs.initialize(project, TEMPLATES)
            self.assertFalse((project / "docs").exists())
            self.assertEqual(
                (project / "AGENTS.md").read_text(encoding="utf-8"), "user content\n"
            )


if __name__ == "__main__":
    unittest.main()
