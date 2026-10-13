"""Acceptance tests exercise the copied Python checker with the real import engine."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
CHECKER = HERE.parent / "assets/python/check_architecture.py"
PYTHON = os.environ.get("INIT_CHECKS_PYTHON", sys.executable)


class PythonChecksTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        shutil.copytree(HERE / "fixtures/python", self.root, dirs_exist_ok=True)

    def run_check(self, expected=0):
        result = subprocess.run([PYTHON, str(CHECKER), str(self.root), "--json"],
                                text=True, capture_output=True, encoding="utf-8")
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return json.loads(result.stdout)

    def write(self, path, text):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    def config(self, update):
        path = self.root / ".architecture.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        update(data)
        path.write_text(json.dumps(data), encoding="utf-8")

    def test_legal_project_and_private_import_red_green(self):
        self.assertTrue(self.run_check()["ok"])
        self.write("src/billing/_internal.py", "from orders._internal import place\n")
        report = self.run_check(1)
        self.assertIn("private-import", {v["rule"] for v in report["violations"]})
        self.write("src/billing/_internal.py", "from orders import place\n")
        self.assertTrue(self.run_check()["ok"])

    def test_type_guard_and_external_test_private_imports_fail(self):
        for path, text in [
            ("src/billing/_internal.py", "from typing import TYPE_CHECKING\nif TYPE_CHECKING:\n    from orders._internal import place\n"),
            ("tests/contracts/test_orders.py", "from orders import _internal\n"),
        ]:
            with self.subTest(path=path):
                self.write(path, text)
                report = self.run_check(1)
                self.assertIn("private-import", {v["rule"] for v in report["violations"]})

    def test_reverse_dependency_and_cycle_are_distinct_failures(self):
        self.write("src/orders/_internal.py", "from billing import invoice\n\ndef place():\n    return 'placed'\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("forbidden-dependency", rules)
        self.assertIn("module-cycle", rules)
        self.config(lambda c: c["modules"][0]["allow"].append("billing"))
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("module-cycle", rules)
        self.assertNotIn("forbidden-dependency", rules)

    def test_new_source_and_unresolved_internal_import_cannot_escape(self):
        self.write("src/unowned/__init__.py", "")
        self.write("src/billing/_internal.py", "import orders.missing\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("unclassified-source", rules)
        self.assertIn("unresolved-import", rules)

    def test_public_surface_change_and_star_import_fail(self):
        self.write("src/orders/__init__.py", "from ._internal import *\n__all__ = ['place', 'extra']\nextra = 1\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("undeclared-export", rules)
        self.assertIn("wildcard-export", rules)

    def test_literal_dynamic_import_obeys_private_boundary(self):
        self.write("src/billing/_internal.py", "from importlib import import_module as load\nload('orders._internal')\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("private-import", rules)

    def test_nonliteral_loader_and_all_mutation_cannot_bypass_contract(self):
        self.write("src/billing/_internal.py", "from importlib import import_module\nloader = import_module\nloader(input())\n")
        self.write("src/orders/__init__.py", "from ._internal import place\n__all__ = ['place']\n__all__.append('extra')\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("computed-import", rules)
        self.assertIn("undeclared-export", rules)

    def test_external_package_has_one_owner(self):
        self.write("src/billing/_internal.py", "import sqlite3\n")
        self.assertIn("external-owner", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_exact_baseline_becomes_stale_when_violation_removed(self):
        self.write("src/billing/_internal.py", "from orders._internal import place\n")
        self.config(lambda c: c["baseline"].append({"rule": "private-import", "from": "src/billing/_internal.py", "to": "src/orders/_internal.py", "reason": "existing coupling; remove during migration"}))
        self.assertTrue(self.run_check()["ok"])
        self.write("src/billing/_internal.py", "from orders import place\n")
        self.assertIn("unused-baseline", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_unknown_allowed_module_fails_closed(self):
        self.config(lambda c: c["modules"][0]["allow"].append("missing"))
        self.assertTrue(self.run_check(2)["errors"])

    def test_wildcard_and_non_edge_baselines_fail_closed(self):
        for rule, source in [("private-import", "src/**"), ("undeclared-export", "src/orders/__init__.py"), ("computed-import", "src/orders/_internal.py")]:
            with self.subTest(rule=rule):
                self.config(lambda c: c.update(baseline=[{"rule": rule, "from": source, "to": "src/orders/_internal.py", "reason": "must not exempt broader changes"}]))
                self.assertTrue(self.run_check(2)["errors"])

    def test_missing_dependency_is_an_error_and_not_a_skipped_pass(self):
        result = subprocess.run([PYTHON, "-S", str(CHECKER), str(self.root), "--json"], text=True, capture_output=True, encoding="utf-8")
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertFalse(report["ok"])
        self.assertTrue(report["errors"])

    def test_public_module_attribute_cannot_expose_undeclared_symbol(self):
        self.write("src/billing/_internal.py", "import orders as api\napi._internal.place()\n")
        self.assertIn("undeclared-export", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_resolvable_relative_dynamic_import_cannot_enter_private_module(self):
        self.write("src/billing/_internal.py", "import importlib\nimportlib.import_module('._internal', package='orders')\n")
        self.assertIn("private-import", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_getattr_and_builtin_fromlist_cannot_hide_private_dependency(self):
        self.write("src/billing/_internal.py", "import importlib as il\ngetattr(il, 'import_module')('orders._internal')\n__import__('orders', fromlist=['_internal'])\n")
        rules = {v["rule"] for v in self.run_check(1)["violations"]}
        self.assertIn("private-import", rules)

    def test_computed_module_attribute_access_requires_declared_loader(self):
        self.write("src/billing/_internal.py", "import orders\ngetattr(orders, input())\n")
        self.assertIn("computed-import", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_module_internal_tests_are_allowed_but_production_cannot_import_contract_tests(self):
        self.write("src/orders/test_internal.py", "from ._internal import place\n")
        self.assertTrue(self.run_check()["ok"])
        self.write("src/billing/_internal.py", "from tests.contracts import test_orders\n")
        self.assertIn("forbidden-dependency", {v["rule"] for v in self.run_check(1)["violations"]})

    def test_baseline_cannot_suppress_its_own_control_diagnostic(self):
        self.config(lambda c: c["baseline"].append({"rule": "unused-baseline", "from": "missing", "to": "missing", "reason": "must not self-suppress"}))
        self.assertTrue(self.run_check(2)["errors"])

    def test_parent_package_bootstrap_can_have_explicit_file_owner(self):
        (self.root / "src/sample").mkdir()
        for package in ("orders", "billing"):
            (self.root / "src" / package).rename(self.root / "src/sample" / package)
        self.write("src/sample/__init__.py", "__all__ = []\nraise AssertionError('the checker must not execute project code')\n")
        self.write("src/sample/billing/_internal.py", "from sample.orders import place\n\ndef invoice():\n    return place()\n")
        self.write("tests/contracts/test_orders.py", "from sample.orders import place\n")

        def update(config):
            for module in config["modules"]:
                module["path"] = module["path"].replace("src/", "src/sample/")
                module["public"] = [p.replace("src/", "src/sample/") for p in module["public"]]
                module["exports"] = {p.replace("src/", "src/sample/"): values for p, values in module["exports"].items()}
            config["modules"].append({"name": "bootstrap", "path": "src/sample/__init__.py", "public": ["src/sample/__init__.py"], "exports": {"src/sample/__init__.py": []}, "allow": [], "testPaths": []})
        self.config(update)
        self.assertTrue(self.run_check()["ok"])


if __name__ == "__main__":
    unittest.main()
