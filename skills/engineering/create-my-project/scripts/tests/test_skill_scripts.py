from __future__ import annotations

import importlib.util
from pathlib import Path
import tempfile
import unittest


SCRIPT_DIR = Path(__file__).resolve().parents[1]
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATE_DIR = SKILL_DIR / "assets" / "governance"


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


init_governance = load_module("init_project_governance", SCRIPT_DIR / "init_project_governance.py")
create_adr = load_module("create_adr", SCRIPT_DIR / "create_adr.py")


class GovernanceTests(unittest.TestCase):
    def test_initializes_each_profile_without_overwriting_readme(self) -> None:
        for profile in init_governance.PROFILE_VALUES:
            with self.subTest(profile=profile), tempfile.TemporaryDirectory() as temp:
                project = Path(temp)
                project.joinpath("README.md").write_text("# Existing scaffold\n", encoding="utf-8")
                init_governance.initialize(project, profile, "sample-project", TEMPLATE_DIR)

                self.assertTrue(project.joinpath("AGENTS.md").is_file())
                self.assertTrue(project.joinpath("CLAUDE.md").is_symlink())
                self.assertEqual(project.joinpath("CLAUDE.md").readlink(), Path("AGENTS.md"))
                self.assertTrue(project.joinpath("docs/agents/architecture.md").is_file())
                self.assertTrue(project.joinpath("docs/agents/development.md").is_file())
                self.assertTrue(project.joinpath("docs/agents/testing.md").is_file())
                self.assertTrue(project.joinpath("docs/adr/README.md").is_file())
                readme = project.joinpath("README.md").read_text(encoding="utf-8")
                self.assertTrue(readme.startswith("# Existing scaffold\n"))
                self.assertEqual(readme.count("create-my-project:governance:start"), 1)

    def test_refuses_existing_governance(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            project.joinpath("README.md").write_text("# Existing scaffold\n", encoding="utf-8")
            init_governance.initialize(project, "typescript-react-vite", "sample", TEMPLATE_DIR)
            original = project.joinpath("AGENTS.md").read_text(encoding="utf-8")
            with self.assertRaises(FileExistsError):
                init_governance.initialize(project, "typescript-react-vite", "sample", TEMPLATE_DIR)
            self.assertEqual(project.joinpath("AGENTS.md").read_text(encoding="utf-8"), original)


class AdrTests(unittest.TestCase):
    def create_governed_project(self, path: Path) -> None:
        path.joinpath("README.md").write_text("# Example\n", encoding="utf-8")
        init_governance.initialize(path, "python-fastapi", "example", TEMPLATE_DIR)

    def test_creates_sequential_adrs_and_supersedes(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            self.create_governed_project(project)
            template = TEMPLATE_DIR / "adr.md.tmpl"
            first = create_adr.create_adr(
                project, "Use Vite", "Need a build tool.", "Use Vite.", "Fast feedback.",
                ["Webpack"], ["Vite becomes required."], None, template,
            )
            second = create_adr.create_adr(
                project, "Replace Vite", "Requirements changed.", "Use another tool.", "New constraints.",
                ["Keep Vite"], ["Migration is required."], first.name, template,
            )
            self.assertEqual(first.name, "0001-use-vite.md")
            self.assertEqual(second.name, "0002-replace-vite.md")
            self.assertIn(f"Supersedes: [{first.name}]({first.name})", second.read_text(encoding="utf-8"))
            self.assertNotIn("Supersedes:", first.read_text(encoding="utf-8"))

    def test_chinese_title_uses_safe_fallback_slug(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            self.create_governed_project(project)
            result = create_adr.create_adr(
                project, "选择模块边界", "Context.", "Decision.", "Rationale.", [], [], None,
                TEMPLATE_DIR / "adr.md.tmpl",
            )
            self.assertEqual(result.name, "0001-decision.md")


if __name__ == "__main__":
    unittest.main()
