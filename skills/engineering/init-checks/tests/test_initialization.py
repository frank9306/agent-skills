from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


SKILL = Path(__file__).resolve().parents[1]
SCRIPT = SKILL / "scripts" / "init_checks.py"


class InitializationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "project with spaces"
        self.root.mkdir()
        (self.root / "src" / "orders").mkdir(parents=True)
        (self.root / "src" / "orders" / "__init__.py").write_text(
            '__all__ = ["place_order"]\ndef place_order(): return 1\n', encoding="utf-8"
        )
        self.contract = Path(self.temporary.name) / "contract.json"
        self.contract.write_text(json.dumps({
            "schemaVersion": 1, "profile": "python", "sourceRoots": ["src"],
            "modules": [{"name": "orders", "path": "src/orders", "public": ["src/orders/__init__.py"],
                         "exports": {"src/orders/__init__.py": ["place_order"]}, "allow": [], "testPaths": []}],
            "externalOwners": {}, "dynamicLoaders": [], "baseline": [], "excludedPaths": [],
        }), encoding="utf-8")

    def initialize(self, *extra, profile="python"):
        contract = json.loads(self.contract.read_text(encoding="utf-8"))
        contract["profile"] = profile
        self.contract.write_text(json.dumps(contract), encoding="utf-8")
        return subprocess.run([
            sys.executable, str(SCRIPT), "--project", str(self.root), "--profile", profile,
            "--contract", str(self.contract), "--full-command", json.dumps([sys.executable, "-c", "print('suite passed')"]),
            *extra,
        ], capture_output=True, text=True, encoding="utf-8")

    def test_plan_has_no_writes_and_names_changes(self):
        result = self.initialize("--plan")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(".architecture.json", result.stdout)
        self.assertFalse((self.root / ".codex").exists())
        self.assertFalse((self.root / "AGENTS.md").exists())

    def test_typescript_plan_has_complete_runtime_assets(self):
        result = self.initialize("--plan", profile="typescript")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("scripts/codex-checks.mjs", result.stdout)
        self.assertFalse((self.root / "scripts").exists())

    def test_apply_preserves_prose_and_unrelated_hooks_and_is_idempotent(self):
        (self.root / "AGENTS.md").write_text("# User instructions\n\nKeep this.\n", encoding="utf-8")
        (self.root / ".codex").mkdir()
        unrelated = {"hooks": [{"type": "command", "command": "echo user-hook"}]}
        hooks = self.root / ".codex/hooks.json"
        hooks.write_text(json.dumps({"hooks": {"Stop": [unrelated]}}), encoding="utf-8")
        result = self.initialize()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.root / "scripts/codex_checks.py").exists())
        self.assertIn("Keep this.", (self.root / "AGENTS.md").read_text(encoding="utf-8"))
        self.assertIn(unrelated, json.loads(hooks.read_text(encoding="utf-8"))["hooks"]["Stop"])
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(self.initialize().returncode, 0)
        self.assertEqual(before, {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()})

    def test_conflicting_script_prevents_all_writes(self):
        (self.root / "scripts").mkdir()
        custom = self.root / "scripts/codex_checks.py"
        custom.write_text("# User-owned implementation\n", encoding="utf-8")
        result = self.initialize()
        self.assertEqual(result.returncode, 2)
        self.assertFalse((self.root / ".architecture.json").exists())
        self.assertFalse((self.root / ".codex").exists())
        self.assertEqual(custom.read_text(encoding="utf-8"), "# User-owned implementation\n")

    def test_generated_typescript_project_runs_real_checks_and_public_behavior(self):
        shutil.copytree(SKILL / "tests/fixtures/typescript", self.root, dirs_exist_ok=True)
        (self.root / ".architecture.json").replace(self.contract)
        node = shutil.which("node")
        subprocess.run([node, "-e", "require('node:fs').symlinkSync(process.argv[1],process.argv[2],process.argv[3])",
                        str(SKILL.parents[2] / "node_modules"), str(self.root / "node_modules"),
                        "junction" if os.name == "nt" else "dir"], check=True, capture_output=True)
        full = [node, "--test", "tests/orders/contract.test.ts", "tests/payments/contract.test.ts"]
        self.run_generated_project("typescript", full, node, "scripts/codex-checks.mjs",
                                   "src/orders/index.ts", "import { charge } from '../payments/internal.ts';\nexport function placeOrder() { return charge(); }\n")

    def test_generated_python_project_runs_real_checks_and_public_behavior(self):
        shutil.copytree(SKILL / "tests/fixtures/python", self.root, dirs_exist_ok=True)
        (self.root / ".architecture.json").replace(self.contract)
        python = os.environ.get("INIT_CHECKS_PYTHON", sys.executable)
        full = [python, "-c", "import sys; sys.path.insert(0, 'src'); from orders import place; assert place() == 'placed'"]
        self.run_generated_project("python", full, python, "scripts/codex_checks.py",
                                   "src/billing/_internal.py", "from orders._internal import place\n")

    def run_generated_project(self, profile, full, runtime, runner, source, illegal):
        args = [sys.executable, str(SCRIPT), "--project", str(self.root), "--profile", profile,
                "--contract", str(self.contract), "--full-command", json.dumps(full)]
        result = subprocess.run(args, capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stderr)
        subprocess.run(["git", "init", "--quiet"], cwd=self.root, check=True, capture_output=True)
        def verify(expected):
            result = subprocess.run([runtime, runner, "--run", "full"], cwd=self.root,
                                    capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
            return json.loads(result.stdout)
        self.assertTrue(verify(0)["ok"])
        target = self.root / source
        original = target.read_bytes()
        target.write_text(illegal, encoding="utf-8")
        self.assertIn("private-import", verify(1)["detail"])
        target.write_bytes(original)
        self.assertTrue(verify(0)["ok"])


if __name__ == "__main__":
    unittest.main()
