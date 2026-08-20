"""Tests for manage-credentials pwmgr.py — run with synthetic data only.

These tests exercise the vault in an isolated temporary directory via VAULT_DIR.
No real credentials are used.
"""

import importlib.util
import json
import os
import pathlib
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "pwmgr.py"
SPEC = importlib.util.spec_from_file_location("pwmgr", SCRIPT)
pwmgr = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(pwmgr)


class VaultTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.env = {"VAULT_DIR": self.tmp.name}
        self._saved = os.environ.copy()
        os.environ.update(self.env)

    def tearDown(self) -> None:
        os.environ.clear()
        os.environ.update(self._saved)

    def _run(self, *argv: str) -> int:
        return pwmgr.main(list(argv))

    def _seed(self) -> None:
        # Synthetic data — never any real credentials
        self._run(
            "add", "--category", "api", "--tags", "llm,test",
            "demo-api", "demo-account",
            "sk-cp-" + "a" * 50,
            "synthetic test key",
        )
        self._run(
            "add", "--category", "identity",
            "demo-id", "1234567890",
            "this-is-a-fake-id-not-a-real-one",
            "synthetic",
        )

    def test_add_and_get_roundtrip(self) -> None:
        self.assertEqual(self._run("add", "demo", "user", "a" * 50), 0)
        self.assertEqual(self._run("get", "demo"), 0)

    def test_add_rejects_pre_masked(self) -> None:
        self.assertEqual(self._run("add", "bad", "u", "sk-cp-...G720"), 2)

    def test_add_rejects_short_password_for_api(self) -> None:
        self.assertEqual(self._run("add", "--category", "api", "bad", "u", "short"), 2)

    def test_list_filters_by_category(self) -> None:
        self._seed()
        self.assertEqual(self._run("list"), 0)
        self.assertEqual(self._run("list", "--category", "identity"), 0)

    def test_search_finds_match(self) -> None:
        self._seed()
        self.assertEqual(self._run("search", "demo"), 0)
        self.assertEqual(self._run("search", "nonexistent-xyz"), 1)

    def test_audit_detects_pre_masked(self) -> None:
        # bypass add() validation by writing entry file directly (simulating legacy corrupt data)
        vdir = pathlib.Path(self.tmp.name)
        # bootstrap vault via add() so .master_key exists
        self._run("add", "--category", "other", "bootstrap", "b", "b" * 50)
        key = (vdir / ".master_key").read_bytes()
        from cryptography.fernet import Fernet
        ct = Fernet(key).encrypt(json.dumps({"password": "sk-cp-...G720"}).encode()).decode()
        (vdir / "entries" / "corrupt.json").write_text(json.dumps({"ct": ct}), encoding="utf-8")
        manifest = json.loads((vdir / "manifest.json").read_text(encoding="utf-8"))
        manifest["corrupt"] = {
            "name": "corrupt",
            "account": "x",
            "category": "other",
            "tags": [],
            "created_at": "2026-01-01T00:00:00+00:00",
            "updated_at": "2026-01-01T00:00:00+00:00",
            "length": 12,
        }
        (vdir / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        self.assertEqual(self._run("audit"), 1)

    def test_migrate_legacy_flat_store(self) -> None:
        legacy = pathlib.Path(self.tmp.name) / "legacy.json"
        legacy.write_text(json.dumps({
            "legacy-1": {"account": "u1", "password": "z" * 50, "note": "from legacy"},
            "legacy-masked": {"account": "u2", "password": "sk-...abc"},
        }), encoding="utf-8")
        self.assertEqual(self._run("migrate", "--from", str(legacy)), 0)
        # legacy-masked is skipped, legacy-1 present
        self.assertEqual(self._run("get", "legacy-1"), 0)
        # legacy-masked was skipped, get returns "未找到"
        self.assertEqual(self._run("get", "legacy-masked"), 1)


if __name__ == "__main__":
    unittest.main()
