#!/usr/bin/env python3
"""Create the next immutable, sequential architecture decision record."""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
import re
import sys
import unicodedata


ADR_PATTERN = re.compile(r"^(\d{4})-[a-z0-9][a-z0-9-]*\.md$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--context", required=True)
    parser.add_argument("--decision", required=True)
    parser.add_argument("--rationale", required=True)
    parser.add_argument("--alternative", action="append", default=[])
    parser.add_argument("--consequence", action="append", default=[])
    parser.add_argument("--supersedes")
    return parser.parse_args()


def slugify(title: str) -> str:
    normalized = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug[:80].rstrip("-") or "decision"


def next_number(adr_dir: Path) -> int:
    numbers = []
    for path in adr_dir.glob("*.md"):
        match = ADR_PATTERN.match(path.name)
        if match:
            numbers.append(int(match.group(1)))
    return max(numbers, default=0) + 1


def bullet_list(items: list[str], empty: str) -> str:
    return "\n".join(f"- {item}" for item in items) if items else f"- {empty}"


def create_adr(
    project: Path,
    title: str,
    context: str,
    decision: str,
    rationale: str,
    alternatives: list[str],
    consequences: list[str],
    supersedes: str | None,
    template_path: Path,
) -> Path:
    project = project.resolve()
    if not (project / "AGENTS.md").is_file():
        raise ValueError("project is not governed: AGENTS.md is missing")
    adr_dir = project / "docs" / "adr"
    if not adr_dir.is_dir():
        raise ValueError("project is not governed: docs/adr is missing")
    if supersedes:
        if Path(supersedes).name != supersedes or not ADR_PATTERN.match(supersedes):
            raise ValueError("--supersedes must be an ADR filename such as 0001-use-vite.md")
        if not (adr_dir / supersedes).is_file():
            raise ValueError(f"superseded ADR does not exist: {supersedes}")

    number = next_number(adr_dir)
    filename = f"{number:04d}-{slugify(title)}.md"
    destination = adr_dir / filename
    if destination.exists():
        raise FileExistsError(f"ADR already exists: {destination}")

    values = {
        "NUMBER": f"{number:04d}",
        "TITLE": title.strip(),
        "DATE": date.today().isoformat(),
        "SUPERSEDES": f"- Supersedes: [{supersedes}]({supersedes})" if supersedes else "",
        "CONTEXT": context.strip(),
        "DECISION": decision.strip(),
        "ALTERNATIVES": bullet_list(alternatives, "No viable alternative was retained."),
        "RATIONALE": rationale.strip(),
        "CONSEQUENCES": bullet_list(consequences, "No additional consequence was identified."),
    }
    content = template_path.read_text(encoding="utf-8")
    for key, value in values.items():
        content = content.replace("{{" + key + "}}", value)
    destination.write_text(content.rstrip() + "\n", encoding="utf-8", newline="\n")
    return destination


def main() -> int:
    args = parse_args()
    template = Path(__file__).resolve().parent.parent / "assets" / "governance" / "adr.md.tmpl"
    try:
        destination = create_adr(
            args.project,
            args.title,
            args.context,
            args.decision,
            args.rationale,
            args.alternative,
            args.consequence,
            args.supersedes,
            template,
        )
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
