"""Flag common article-draft risks without rewriting the file."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


VAGUE_PHRASES = (
    "众所周知", "不难发现", "值得注意的是", "毋庸置疑", "在当今社会",
    "随着时代的发展", "引发了广泛关注", "意义重大", "赋能", "抓手",
    "it goes without saying", "in today's world", "game changer",
)


def check(text: str) -> list[str]:
    findings: list[str] = []
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]

    for phrase in VAGUE_PHRASES:
        count = text.lower().count(phrase.lower())
        if count:
            findings.append(f"vague/canned phrase: {phrase!r} ({count})")

    for index, paragraph in enumerate(paragraphs, 1):
        plain = re.sub(r"[#>*_`\[\]()]", "", paragraph)
        if len(plain) > 500:
            findings.append(f"paragraph {index} is long ({len(plain)} characters)")
        sentences = [s for s in re.split(r"(?<=[。！？.!?])\s*", plain) if s]
        for sentence_index, sentence in enumerate(sentences, 1):
            if len(sentence) > 120:
                findings.append(
                    f"paragraph {index}, sentence {sentence_index} is long "
                    f"({len(sentence)} characters)"
                )

    placeholders = re.findall(r"(?:TODO|TBD|待补|待核实|图片占位|\[IMAGE[^\]]*\])", text, re.I)
    if placeholders:
        findings.append(f"unresolved placeholders: {len(placeholders)}")

    bare_numbers = re.findall(r"\d+(?:\.\d+)?%", text)
    if bare_numbers:
        findings.append(
            "percentages require source/baseline review: " + ", ".join(bare_numbers[:8])
        )

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("draft", type=Path)
    args = parser.parse_args()
    text = args.draft.read_text(encoding="utf-8")
    findings = check(text)
    if findings:
        print("Review findings:")
        for item in findings:
            print(f"- {item}")
        return 1
    print("No configured draft risks found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
