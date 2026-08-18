#!/usr/bin/env python3
"""Create an accepted Architecture Decision Record from a confirmed decision."""

from __future__ import annotations

import argparse
import re
import unicodedata
from datetime import date
from pathlib import Path


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "decision"


def bullets(values: list[str], empty: str) -> str:
    return "\n".join(f"- {value}" for value in values) if values else empty


def next_id(adr_dir: Path) -> str:
    numbers = []
    for path in adr_dir.glob("ADR-[0-9][0-9][0-9][0-9]-*.md"):
        numbers.append(int(path.name[4:8]))
    return f"ADR-{max(numbers, default=0) + 1:04d}"


def validate_sources(project: Path, sources: list[str]) -> None:
    for source in sources:
        if re.match(r"https?://", source):
            continue
        resolved = (project / source).resolve()
        if not resolved.is_relative_to(project) or not resolved.is_file():
            raise ValueError(f"source does not exist inside project: {source}")


def validate_issues(project: Path, issues: list[str]) -> None:
    for issue_id in issues:
        matches = list((project / "docs" / "issues").glob(f"{issue_id}-*.md"))
        if len(matches) != 1:
            raise ValueError(f"expected one local Issue for {issue_id}, found {len(matches)}")


def create_adr(
    project: Path,
    template: Path,
    title: str,
    context: str,
    decision: str,
    rationale: str,
    alternatives: list[str],
    consequences: list[str],
    sources: list[str],
    issues: list[str],
    supersedes: str | None,
) -> Path:
    project = project.resolve()
    adr_dir = project / "docs" / "adr"
    if not adr_dir.is_dir():
        raise ValueError("docs/adr is missing; run $init-docs first")
    validate_sources(project, sources)
    validate_issues(project, issues)

    supersedes_text = "None."
    if supersedes:
        old = adr_dir / supersedes
        if not old.is_file() or not re.fullmatch(r"ADR-\d{4}-.+\.md", old.name):
            raise ValueError(f"superseded ADR does not exist: {supersedes}")
        supersedes_text = f"- [{old.stem}]({old.name})"

    adr_id = next_id(adr_dir)
    replacements = {
        "{{ID}}": adr_id,
        "{{TITLE}}": title,
        "{{DATE}}": date.today().isoformat(),
        "{{CONTEXT}}": context,
        "{{DECISION}}": decision,
        "{{RATIONALE}}": rationale,
        "{{ALTERNATIVES}}": bullets(alternatives, "No viable alternative was identified."),
        "{{CONSEQUENCES}}": bullets(consequences, "No additional consequence recorded."),
        "{{ISSUES}}": bullets(
            [f"[{value}](../issues/{next((project / 'docs' / 'issues').glob(f'{value}-*.md')).name})" for value in issues],
            "None.",
        ),
        "{{SOURCES}}": bullets(sources, "No external source."),
        "{{SUPERSEDES}}": supersedes_text,
    }
    content = template.read_text(encoding="utf-8")
    for marker, value in replacements.items():
        content = content.replace(marker, value)
    destination = adr_dir / f"{adr_id}-{slugify(title)}.md"
    destination.write_text(content, encoding="utf-8", newline="\n")
    return destination


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--confirmed", required=True, action="store_true")
    parser.add_argument("--title", required=True)
    parser.add_argument("--context", required=True)
    parser.add_argument("--decision", required=True)
    parser.add_argument("--rationale", required=True)
    parser.add_argument("--alternative", action="append", default=[])
    parser.add_argument("--consequence", action="append", default=[])
    parser.add_argument("--source", action="append", default=[])
    parser.add_argument("--issue", action="append", default=[])
    parser.add_argument("--supersedes")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    template = Path(__file__).resolve().parent.parent / "assets" / "adr.md.tmpl"
    try:
        destination = create_adr(
            args.project,
            template,
            args.title,
            args.context,
            args.decision,
            args.rationale,
            args.alternative,
            args.consequence,
            args.source,
            args.issue,
            args.supersedes,
        )
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}")
        return 1
    print(f"CREATED {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
