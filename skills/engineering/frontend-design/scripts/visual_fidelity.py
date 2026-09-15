#!/usr/bin/env python3
"""Deterministic screenshot capture and fidelity comparison for frontend-design."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat
except ImportError as exc:
    raise SystemExit("Pillow is required; visual fidelity cannot fall back to subjective review") from exc


def load_manifest(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("version") != 1:
        raise ValueError("manifest version must be 1")
    return data, path.parent


def resolve(root: Path, value: str) -> Path:
    return (root / value).resolve()


DEFAULT_GATES = {"overall": 0.985, "critical": 0.99, "anchorTolerancePx": 2, "stabilityDelta": 0.001}


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_contract(manifest, root: Path):
    for key in ("reference", "capture", "assets", "coverage", "thresholds", "outputs"):
        if key not in manifest:
            raise ValueError(f"manifest is missing required field: {key}")
    exception = manifest.get("thresholdException", {})
    weakened = []
    thresholds = manifest["thresholds"]
    for key in ("overall", "critical"):
        if thresholds.get(key, 0) < DEFAULT_GATES[key]:
            weakened.append(key)
    for key in ("anchorTolerancePx", "stabilityDelta"):
        if thresholds.get(key, float("inf")) > DEFAULT_GATES[key]:
            weakened.append(key)
    if weakened and not (exception.get("userApproved") is True and exception.get("reason") and exception.get("source")):
        raise ValueError(f"thresholds are weaker than high-fidelity defaults: {', '.join(weakened)}")

    anchors = manifest.get("anchors", [])
    regions = manifest.get("regions", [])
    anchor_roles = {item.get("role") for item in anchors}
    region_roles = {item.get("role") for item in regions}
    for role in manifest["coverage"].get("requiredAnchorRoles", []):
        if role not in anchor_roles:
            raise ValueError(f"required anchor role is not covered: {role}")
    for role in manifest["coverage"].get("requiredRegionRoles", []):
        if role not in region_roles:
            raise ValueError(f"required region role is not covered: {role}")
    if not manifest["coverage"].get("requiredAnchorRoles") or not manifest["coverage"].get("requiredRegionRoles"):
        raise ValueError("coverage must declare non-empty required anchor and region roles")
    perspective = manifest.get("perspective", {})
    if perspective.get("required"):
        points = manifest.get("geometryPoints", [])
        for plane in perspective.get("planes", []):
            plane_points = [point for point in points if point.get("plane") == plane]
            if len(plane_points) < 4:
                raise ValueError(f"perspective plane requires at least four geometry points: {plane}")

    width = manifest["capture"]["viewport"]["width"]
    height = manifest["capture"]["viewport"]["height"]
    for mask in manifest.get("masks", []):
        if not mask.get("reason") or not mask.get("source"):
            raise ValueError("every mask reason and source must be recorded")
        rect = mask["rect"]
        if rect["width"] <= 0 or rect["height"] <= 0 or rect["x"] < 0 or rect["y"] < 0 or rect["x"] + rect["width"] > width or rect["y"] + rect["height"] > height:
            raise ValueError("mask rectangle is outside the capture viewport")
        for anchor in anchors:
            expected = anchor["expected"]
            separated = rect["x"] + rect["width"] <= expected["x"] or expected["x"] + expected["width"] <= rect["x"] or rect["y"] + rect["height"] <= expected["y"] or expected["y"] + expected["height"] <= rect["y"]
            if not separated:
                raise ValueError(f"mask overlaps structural anchor: {anchor['name']}")

    assets = manifest["assets"]
    inventory = assets.get("inventory", {})
    files = assets.get("files", [])
    kinds = {item.get("kind") for item in files}
    for category, kind in (("fonts", "font"), ("icons", "icon"), ("images", "image")):
        if inventory.get(category) and kind not in kinds:
            raise ValueError(f"asset inventory declares {category} but lists no {kind} file")
    listed_paths = {item.get("path") for item in files}
    for font in assets.get("fonts", []):
        if font.get("required", True):
            if not font.get("files") or not font.get("weights") or not font.get("styles"):
                raise ValueError(f"required font inventory is incomplete: {font.get('family')}")
            if not set(font["files"]).issubset(listed_paths):
                raise ValueError(f"font files are not present in asset inventory: {font.get('family')}")


def validate_inputs(manifest, root: Path):
    validate_contract(manifest, root)
    reference = resolve(root, manifest["reference"]["path"])
    if not reference.is_file():
        raise ValueError(f"reference image is missing: {reference}")
    expected_hash = manifest["reference"].get("sha256")
    actual_hash = file_sha256(reference)
    if expected_hash and actual_hash.lower() != expected_hash.lower():
        raise ValueError("reference SHA-256 does not match manifest")
    if manifest.get("assets", {}).get("status") != "complete":
        raise ValueError("asset inventory is incomplete; high-fidelity verification is blocked")
    for asset in manifest.get("assets", {}).get("files", []):
        path = resolve(root, asset["path"])
        if asset.get("required", True) and not path.is_file():
            raise ValueError(f"missing required asset: {path}")
        if path.is_file() and asset.get("sha256"):
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest.lower() != asset["sha256"].lower():
                raise ValueError(f"asset SHA-256 mismatch: {path}")
    capture = manifest["capture"]
    expected_size = (
        round(capture["viewport"]["width"] * capture["deviceScaleFactor"]),
        round(capture["viewport"]["height"] * capture["deviceScaleFactor"]),
    )
    with Image.open(reference) as image:
        if image.size != expected_size:
            raise ValueError(f"reference dimensions {image.size} do not match capture dimensions {expected_size}")
    return reference


def masked_pair(reference: Image.Image, actual: Image.Image, masks, scale: float):
    left, right = reference.copy(), actual.copy()
    for mask in masks:
        rect = mask["rect"]
        box = tuple(round(rect[key] * scale) for key in ("x", "y", "width", "height"))
        box = (box[0], box[1], box[0] + box[2], box[1] + box[3])
        right.paste(left.crop(box), box)
    return left, right


def similarity(reference: Image.Image, actual: Image.Image) -> float:
    # A small blur discounts browser anti-aliasing noise while preserving geometry and tone.
    left = reference.convert("RGB").filter(ImageFilter.GaussianBlur(0.6))
    right = actual.convert("RGB").filter(ImageFilter.GaussianBlur(0.6))
    means = ImageStat.Stat(ImageChops.difference(left, right)).mean
    return round(max(0.0, 1.0 - sum(means) / (len(means) * 255.0)), 6)


def crop_css(image: Image.Image, rect, scale: float):
    x, y, width, height = (round(rect[key] * scale) for key in ("x", "y", "width", "height"))
    return image.crop((x, y, x + width, y + height))


def compare(manifest_path: Path) -> int:
    manifest, root = load_manifest(manifest_path)
    reference_path = validate_inputs(manifest, root)
    actual_path = resolve(root, manifest["outputs"]["actual"])
    anchors_path = resolve(root, manifest["outputs"]["anchors"])
    capture_meta_path = resolve(root, manifest["outputs"]["captureMeta"])
    if not actual_path.is_file():
        raise ValueError(f"actual screenshot is missing: {actual_path}")
    if not anchors_path.is_file():
        raise ValueError(f"actual anchors are missing: {anchors_path}")
    if not capture_meta_path.is_file():
        raise ValueError(f"capture metadata is missing: {capture_meta_path}")
    capture_meta = json.loads(capture_meta_path.read_text(encoding="utf-8"))
    manifest_hash = file_sha256(manifest_path)
    if capture_meta.get("manifestSha256") != manifest_hash:
        raise ValueError("capture metadata is stale for the current manifest")
    if capture_meta.get("referenceSha256") != file_sha256(reference_path):
        raise ValueError("capture metadata is stale for the current reference")
    if capture_meta.get("stabilityDelta", 1) > manifest["thresholds"]["stabilityDelta"]:
        raise ValueError("capture stability gate did not pass")
    if capture_meta.get("anchorsStabilityPx", float("inf")) > manifest["thresholds"]["anchorTolerancePx"]:
        raise ValueError("anchor stability gate did not pass")
    reference = Image.open(reference_path).convert("RGB")
    actual = Image.open(actual_path).convert("RGB")
    if actual.size != reference.size:
        raise ValueError(f"actual dimensions {actual.size} do not match reference dimensions {reference.size}")
    scale = manifest["capture"]["deviceScaleFactor"]
    reference, actual = masked_pair(reference, actual, manifest.get("masks", []), scale)
    failures = []
    thresholds = manifest["thresholds"]
    overall = similarity(reference, actual)
    if overall < thresholds["overall"]:
        failures.append("overall-similarity")

    actual_anchors = json.loads(anchors_path.read_text(encoding="utf-8"))
    anchor_results = []
    for anchor in manifest.get("anchors", []):
        observed = actual_anchors.get(anchor["name"])
        if observed is None:
            failures.append(f"anchor:{anchor['name']}")
            anchor_results.append({"name": anchor["name"], "pass": False, "reason": "missing"})
            continue
        tolerance = anchor.get("tolerancePx", thresholds["anchorTolerancePx"])
        deltas = {key: round(observed[key] - anchor["expected"][key], 3) for key in ("x", "y", "width", "height")}
        passed = all(abs(value) <= tolerance for value in deltas.values())
        if not passed:
            failures.append(f"anchor:{anchor['name']}")
        anchor_results.append({"name": anchor["name"], "pass": passed, "tolerancePx": tolerance, "deltas": deltas})

    point_results = []
    actual_points = capture_meta.get("geometryPoints", {})
    for point in manifest.get("geometryPoints", []):
        observed = actual_points.get(point["name"])
        tolerance = point.get("tolerancePx", thresholds["anchorTolerancePx"])
        if observed is None:
            failures.append(f"geometry-point:{point['name']}")
            point_results.append({"name": point["name"], "pass": False, "reason": "missing"})
            continue
        deltas = {key: round(observed[key] - point["expected"][key], 3) for key in ("x", "y")}
        passed = all(abs(value) <= tolerance for value in deltas.values())
        if not passed:
            failures.append(f"geometry-point:{point['name']}")
        point_results.append({"name": point["name"], "plane": point.get("plane"), "pass": passed, "tolerancePx": tolerance, "deltas": deltas})

    region_results = []
    for region in manifest.get("regions", []):
        score = similarity(crop_css(reference, region["rect"], scale), crop_css(actual, region["rect"], scale))
        threshold = region.get("threshold", thresholds["critical"])
        passed = score >= threshold
        if not passed:
            failures.append(f"region:{region['name']}")
        region_results.append({"name": region["name"], "similarity": score, "threshold": threshold, "weight": region.get("weight", 1), "pass": passed})

    overlay = Image.blend(reference, actual, 0.5)
    overlay.save(resolve(root, manifest["outputs"]["overlay"]))
    raw_diff = ImageChops.difference(reference, actual).convert("L")
    heat = ImageOps.colorize(ImageOps.autocontrast(raw_diff), black="#050505", white="#ff2b2b")
    heat.save(resolve(root, manifest["outputs"]["diff"]))
    report = {
        "status": "pass" if not failures else "fail",
        "case": manifest["case"],
        "metrics": {"overallSimilarity": overall, "rawPixelMeanDifference": round(sum(ImageStat.Stat(raw_diff).mean) / 255.0, 6)},
        "anchors": anchor_results,
        "geometryPoints": point_results,
        "regions": region_results,
        "failures": failures,
        "evidence": {
            "manifestSha256": manifest_hash,
            "referenceSha256": file_sha256(reference_path),
            "actualSha256": file_sha256(actual_path),
            "captureMetaSha256": file_sha256(capture_meta_path),
            "stabilityDelta": capture_meta["stabilityDelta"],
            "browser": capture_meta.get("browser"),
            "stableState": capture_meta.get("stableState"),
        },
    }
    report_path = resolve(root, manifest["outputs"]["report"])
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    history_path = resolve(root, manifest["outputs"]["history"])
    history = json.loads(history_path.read_text(encoding="utf-8")) if history_path.is_file() else []
    previous = history[-1]["overallSimilarity"] if history else None
    improvement = None if previous is None else round(overall - previous, 6)
    stagnant = 0 if improvement is None or improvement > 0.0001 else (history[-1].get("stagnantPasses", 0) + 1)
    history.append({"at": datetime.now(timezone.utc).isoformat(), "status": report["status"], "overallSimilarity": overall, "improvement": improvement, "stagnantPasses": stagnant, "failures": failures})
    history_path.write_text(json.dumps(history, indent=2), encoding="utf-8")
    if report["status"] == "fail" and stagnant >= 3:
        report["status"] = "blocked"
        report["failures"].append("three-passes-without-improvement")
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if not failures else 1


def capture(manifest_path: Path) -> int:
    manifest, root = load_manifest(manifest_path)
    validate_inputs(manifest, root)
    helper = Path(__file__).with_name("visual_fidelity_capture.mjs")
    result = subprocess.run(["node", str(helper), str(manifest_path)], text=True, capture_output=True)
    if result.returncode:
        raise ValueError(result.stderr.strip() or "browser capture failed")
    payload = json.loads(result.stdout)
    images = [Image.open(path).convert("RGB") for path in payload["captures"]]
    scores = [similarity(images[index - 1], images[index]) for index in range(1, len(images))]
    delta = max(1.0 - score for score in scores)
    threshold = manifest["thresholds"]["stabilityDelta"]
    measurements = payload["measurements"]
    anchor_names = set().union(*(entry["anchors"].keys() for entry in measurements))
    anchor_stability = 0.0
    for name in anchor_names:
        values = [entry["anchors"][name] for entry in measurements]
        for key in ("x", "y", "width", "height"):
            anchor_stability = max(anchor_stability, max(item[key] for item in values) - min(item[key] for item in values))
    for path in payload["captures"][:-1]:
        Path(path).unlink(missing_ok=True)
    if delta > threshold:
        raise ValueError(f"capture is unstable: delta {delta:.6f} exceeds {threshold:.6f}")
    anchor_limit = manifest["thresholds"]["anchorTolerancePx"]
    if anchor_stability > anchor_limit:
        raise ValueError(f"anchors are unstable: delta {anchor_stability:.3f}px exceeds {anchor_limit:.3f}px")
    final = measurements[-1]
    resolve(root, manifest["outputs"]["anchors"]).write_text(json.dumps(final["anchors"], indent=2), encoding="utf-8")
    meta = {
        "manifestSha256": file_sha256(manifest_path), "referenceSha256": file_sha256(resolve(root, manifest["reference"]["path"])),
        "stabilityDelta": round(delta, 6), "anchorsStabilityPx": round(anchor_stability, 3),
        "browser": payload["browser"], "stableState": payload["stableState"], "stateAssertions": payload["stateAssertions"],
        "geometryPoints": final["geometryPoints"],
    }
    resolve(root, manifest["outputs"]["captureMeta"]).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps({"status": "captured", "actual": payload["actual"], "stabilityDelta": round(delta, 6), "anchorsStabilityPx": round(anchor_stability, 3)}, indent=2))
    return 0


def report(manifest_path: Path) -> int:
    manifest, root = load_manifest(manifest_path)
    path = resolve(root, manifest["outputs"]["report"])
    if not path.is_file():
        raise ValueError(f"report is missing: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    validate_inputs(manifest, root)
    if data.get("evidence", {}).get("manifestSha256") != file_sha256(manifest_path):
        raise ValueError("report is stale for the current manifest")
    if data.get("evidence", {}).get("referenceSha256") != file_sha256(resolve(root, manifest["reference"]["path"])):
        raise ValueError("report is stale for the current reference")
    print(json.dumps(data, indent=2))
    return 0 if data.get("status") == "pass" else 1


def write_blocked_report(manifest_path: Path, error: Exception):
    try:
        manifest, root = load_manifest(manifest_path)
        output = manifest.get("outputs", {}).get("report")
        if not output:
            return
        data = {
            "status": "blocked",
            "case": manifest.get("case"),
            "failures": ["input-gate"],
            "error": str(error),
            "evidence": {"manifestSha256": file_sha256(manifest_path)},
        }
        resolve(root, output).write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        return


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("capture", "compare", "report"))
    parser.add_argument("--manifest", required=True, type=Path)
    args = parser.parse_args()
    try:
        return {"capture": capture, "compare": compare, "report": report}[args.command](args.manifest.resolve())
    except (KeyError, OSError, ValueError, json.JSONDecodeError) as exc:
        write_blocked_report(args.manifest.resolve(), exc)
        print(f"visual-fidelity error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
