from __future__ import annotations

import argparse
import struct
import sys
from pathlib import Path


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def inspect_png(path: Path) -> list[str]:
    findings: list[str] = []
    try:
        with path.open("rb") as handle:
            signature = handle.read(8)
            if signature != PNG_SIGNATURE:
                return [f"{path}: not a PNG file"]
            length = struct.unpack(">I", handle.read(4))[0]
            chunk_type = handle.read(4)
            if chunk_type != b"IHDR" or length < 13:
                return [f"{path}: invalid PNG IHDR"]
            width, height = struct.unpack(">II", handle.read(8))
    except OSError as exc:
        return [f"{path}: cannot read file: {exc}"]

    if width != 1600 or height != 900:
        findings.append(f"{path}: expected 1600x900, found {width}x{height}")
    if width * 9 != height * 16:
        findings.append(f"{path}: dimensions are not exactly 16:9")
    if path.stat().st_size < 20_000:
        findings.append(f"{path}: file is unusually small; inspect for blank or incomplete rendering")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate final article infographic PNG files.")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()

    findings = [finding for path in args.paths for finding in inspect_png(path)]
    if findings:
        print("Image specification findings:")
        for finding in findings:
            print(f"- {finding}")
        return 1

    print(f"Validated {len(args.paths)} PNG file(s): 1600x900, exact 16:9, plausible file size.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
