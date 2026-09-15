import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


SKILL_ROOT = Path(__file__).resolve().parents[1]
CLI = SKILL_ROOT / "scripts" / "visual_fidelity.py"


class VisualFidelityCliTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.reference = self.root / "reference.png"
        self.actual = self.root / "actual.png"
        Image.new("RGB", (100, 80), "#202020").save(self.reference)
        Image.new("RGB", (100, 80), "#202020").save(self.actual)

    def tearDown(self):
        self.temp.cleanup()

    def manifest(self, **overrides):
        data = {
            "version": 1,
            "case": "fixture",
            "reference": {
                "path": "reference.png",
                "sha256": hashlib.sha256(self.reference.read_bytes()).hexdigest(),
            },
            "capture": {
                "url": "http://127.0.0.1:4173/",
                "projectRoot": ".",
                "viewport": {"width": 100, "height": 80},
                "deviceScaleFactor": 1,
                "colorScheme": "dark",
                "readySelector": "body",
                "stableState": "fixture",
            },
            "assets": {"status": "complete", "inventory": {"fonts": False, "icons": False, "images": False}, "files": [], "fonts": []},
            "coverage": {"requiredAnchorRoles": ["primary"], "requiredRegionRoles": ["primary"]},
            "anchors": [{"name": "primary", "role": "primary", "selector": "#primary", "expected": {"x": 10, "y": 10, "width": 40, "height": 20}, "tolerancePx": 2}],
            "geometryPoints": [],
            "regions": [{"name": "critical", "role": "primary", "rect": {"x": 0, "y": 0, "width": 50, "height": 40}, "threshold": 0.99, "weight": 2}],
            "masks": [],
            "thresholds": {"overall": 0.985, "critical": 0.99, "anchorTolerancePx": 2, "stabilityDelta": 0.001},
            "outputs": {"actual": "actual.png", "anchors": "anchors.json", "captureMeta": "capture-meta.json", "report": "report.json", "history": "history.json", "overlay": "overlay.png", "diff": "diff.png"},
        }
        data.update(overrides)
        path = self.root / "manifest.json"
        path.write_text(json.dumps(data), encoding="utf-8")
        (self.root / "capture-meta.json").write_text(json.dumps({
            "manifestSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "referenceSha256": hashlib.sha256(self.reference.read_bytes()).hexdigest(),
            "stabilityDelta": 0.0,
            "anchorsStabilityPx": 0.0,
            "browser": "fixture",
            "stableState": "fixture",
        }), encoding="utf-8")
        return path

    def run_cli(self, command, manifest):
        return subprocess.run([sys.executable, str(CLI), command, "--manifest", str(manifest)], text=True, capture_output=True)

    def test_compare_passes_identical_images_and_writes_artifacts(self):
        (self.root / "anchors.json").write_text(json.dumps({"primary": {"x": 10, "y": 10, "width": 40, "height": 20}}), encoding="utf-8")
        result = self.run_cli("compare", self.manifest())
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads((self.root / "report.json").read_text(encoding="utf-8"))
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["metrics"]["overallSimilarity"], 1.0)
        self.assertTrue((self.root / "overlay.png").exists())
        self.assertTrue((self.root / "diff.png").exists())

    def test_compare_fails_when_anchor_is_shifted_three_pixels(self):
        (self.root / "anchors.json").write_text(json.dumps({"primary": {"x": 13, "y": 10, "width": 40, "height": 20}}), encoding="utf-8")
        result = self.run_cli("compare", self.manifest())
        self.assertNotEqual(result.returncode, 0)
        report = json.loads((self.root / "report.json").read_text(encoding="utf-8"))
        self.assertEqual(report["status"], "fail")
        self.assertIn("anchor:primary", report["failures"])

    def test_compare_blocks_incomplete_or_missing_assets(self):
        missing = {"status": "complete", "inventory": {"fonts": True, "icons": False, "images": False}, "files": [{"path": "missing.woff2", "kind": "font", "purpose": "brand", "required": True}], "fonts": [{"family": "Brand", "files": ["missing.woff2"], "weights": [400], "styles": ["normal"], "required": True}]}
        result = self.run_cli("compare", self.manifest(assets=missing))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing required asset", result.stderr)
        report = json.loads((self.root / "report.json").read_text(encoding="utf-8"))
        self.assertEqual(report["status"], "blocked")

    def test_compare_rejects_wrong_reference_dimensions(self):
        capture = {"url": "http://127.0.0.1:4173/", "projectRoot": ".", "viewport": {"width": 101, "height": 80}, "deviceScaleFactor": 1, "colorScheme": "dark", "readySelector": "body", "stableState": "fixture"}
        result = self.run_cli("compare", self.manifest(capture=capture))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("reference dimensions", result.stderr)

    def test_contract_rejects_lowered_gates_and_unjustified_masks(self):
        low = {"overall": 0.8, "critical": 0.8, "anchorTolerancePx": 10, "stabilityDelta": 0.01}
        result = self.run_cli("compare", self.manifest(thresholds=low))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("weaker than high-fidelity defaults", result.stderr)

        masks = [{"rect": {"x": 60, "y": 50, "width": 10, "height": 10}}]
        result = self.run_cli("compare", self.manifest(masks=masks))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("mask reason", result.stderr)

    def test_contract_requires_declared_coverage(self):
        result = self.run_cli("compare", self.manifest(anchors=[], regions=[]))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("required anchor role", result.stderr)

    def test_report_rejects_stale_manifest(self):
        (self.root / "anchors.json").write_text(json.dumps({"primary": {"x": 10, "y": 10, "width": 40, "height": 20}}), encoding="utf-8")
        manifest = self.manifest()
        self.assertEqual(self.run_cli("compare", manifest).returncode, 0)
        data = json.loads(manifest.read_text(encoding="utf-8"))
        data["case"] = "changed"
        manifest.write_text(json.dumps(data), encoding="utf-8")
        result = self.run_cli("report", manifest)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("stale", result.stderr)

    def test_capture_is_stable_and_blocks_a_missing_font(self):
        playwright_root = Path(os.environ.get("VISUAL_FIDELITY_PLAYWRIGHT_ROOT", Path.cwd() / "frontend"))
        if not (playwright_root / "node_modules" / "@playwright" / "test").exists():
            self.skipTest("set VISUAL_FIDELITY_PLAYWRIGHT_ROOT to a project with @playwright/test")
        capture = {
            "url": "data:text/html,<style>html,body{margin:0;background:%23202020}main{width:40px;height:20px}</style><main id='primary'></main>",
            "projectRoot": str(playwright_root),
            "viewport": {"width": 100, "height": 80},
            "deviceScaleFactor": 1,
            "colorScheme": "dark",
            "readySelector": "main",
            "stableState": "static-fixture",
        }
        manifest = self.manifest(capture=capture)
        result = self.run_cli("capture", manifest)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(self.actual.exists())
        payload = json.loads(result.stdout)
        self.assertLessEqual(payload["stabilityDelta"], 0.001)

        data = json.loads(manifest.read_text(encoding="utf-8"))
        data["assets"]["fonts"] = [{"family": "Definitely Missing Font 987", "required": True}]
        manifest.write_text(json.dumps(data), encoding="utf-8")
        result = self.run_cli("capture", manifest)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("required font inventory is incomplete", result.stderr)


if __name__ == "__main__":
    unittest.main()
