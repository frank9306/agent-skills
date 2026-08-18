#!/usr/bin/env python3
"""Create and transition repository-local Markdown Issues."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import date
from pathlib import Path


STATES = ("proposed", "ready", "in-progress", "blocked", "done", "cancelled")
TRANSITIONS = {
    "proposed": {"ready", "cancelled"},
    "ready": {"in-progress", "cancelled"},
    "in-progress": {"blocked", "done", "cancelled"},
    "blocked": {"ready", "in-progress", "cancelled"},
    "done": set(),
    "cancelled": set(),
}
CATEGORIES = ("Added", "Changed", "Fixed", "Removed", "Security", "Documentation")
HEADINGS = {
    "proposed": "Proposed",
    "ready": "Ready",
    "in-progress": "In progress",
    "blocked": "Blocked",
    "done": "Done",
    "cancelled": "Cancelled",
}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "issue"


def issue_files(project: Path) -> list[Path]:
    return sorted((project / "docs" / "issues").glob("ISSUE-[0-9][0-9][0-9][0-9]-*.md"))


def field(content: str, name: str) -> str:
    match = re.search(rf"^{re.escape(name)}:\s*(.*)$", content, re.MULTILINE)
    if not match:
        raise ValueError(f"missing frontmatter field: {name}")
    return match.group(1).strip().strip('"')


def replace_field(content: str, name: str, value: str) -> str:
    updated, count = re.subn(
        rf"^{re.escape(name)}:\s*.*$", f"{name}: {value}", content, count=1, flags=re.MULTILINE
    )
    if count != 1:
        raise ValueError(f"missing frontmatter field: {name}")
    return updated


def section(content: str, heading: str) -> str:
    match = re.search(
        rf"^## {re.escape(heading)}\s*\n\n(.*?)(?=\n## |\Z)",
        content,
        re.MULTILINE | re.DOTALL,
    )
    if not match:
        raise ValueError(f"missing section: {heading}")
    return match.group(1).strip()


def replace_section(content: str, heading: str, value: str) -> str:
    pattern = rf"(^## {re.escape(heading)}\s*\n\n)(.*?)(?=\n## |\Z)"
    updated, count = re.subn(
        pattern,
        lambda match: match.group(1) + value.strip() + "\n",
        content,
        count=1,
        flags=re.MULTILINE | re.DOTALL,
    )
    if count != 1:
        raise ValueError(f"missing section: {heading}")
    return updated


def find_issue(project: Path, issue_id: str) -> Path:
    matches = list((project / "docs" / "issues").glob(f"{issue_id}-*.md"))
    if len(matches) != 1:
        raise ValueError(f"expected one file for {issue_id}, found {len(matches)}")
    return matches[0]


def next_id(project: Path) -> str:
    numbers = [int(path.name[6:10]) for path in issue_files(project)]
    return f"ISSUE-{max(numbers, default=0) + 1:04d}"


def reindex(project: Path) -> Path:
    grouped = {state: [] for state in STATES}
    for path in issue_files(project):
        content = path.read_text(encoding="utf-8")
        state = field(content, "status")
        if state not in grouped:
            raise ValueError(f"unknown status in {path}: {state}")
        grouped[state].append((field(content, "id"), field(content, "title"), path.name))

    lines = ["# Issues", "", "This index is generated from local Issue files.", ""]
    for state in STATES:
        lines.extend([f"## {HEADINGS[state]}", ""])
        entries = grouped[state]
        if not entries:
            lines.extend(["None.", ""])
            continue
        lines.extend(["| ID | Title |", "|---|---|"])
        for issue_id, title, filename in entries:
            lines.append(f"| [{issue_id}]({filename}) | {title} |")
        lines.append("")
    destination = project / "docs" / "issues" / "README.md"
    destination.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    return destination


def create_issue(
    project: Path,
    template: Path,
    title: str,
    problem: str,
    outcome: str,
    priority: str,
    sources: list[str],
) -> Path:
    issues_dir = project / "docs" / "issues"
    if not issues_dir.is_dir():
        raise ValueError("docs/issues is missing; run $init-docs first")
    issue_id = next_id(project)
    today = date.today().isoformat()
    replacements = {
        "{{ID}}": issue_id,
        "{{TITLE}}": title,
        "{{TITLE_YAML}}": json.dumps(title, ensure_ascii=False),
        "{{PRIORITY}}": priority,
        "{{DATE}}": today,
        "{{SOURCES}}": json.dumps(sources, ensure_ascii=False),
        "{{PROBLEM}}": problem,
        "{{OUTCOME}}": outcome,
    }
    content = template.read_text(encoding="utf-8")
    for marker, value in replacements.items():
        content = content.replace(marker, value)
    destination = issues_dir / f"{issue_id}-{slugify(title)}.md"
    destination.write_text(content, encoding="utf-8", newline="\n")
    reindex(project)
    return destination


def append_activity(content: str, message: str) -> str:
    current = section(content, "Activity log")
    entry = f"### {date.today().isoformat()} — {message}"
    return replace_section(content, "Activity log", f"{current}\n\n{entry}")


def append_changelog(project: Path, issue_path: Path, content: str, category: str) -> Path:
    changelog_dir = project / "docs" / "changelog"
    if not changelog_dir.is_dir():
        raise ValueError("docs/changelog is missing; run $init-docs first")
    month = date.today().strftime("%Y-%m")
    destination = changelog_dir / f"{month}.md"
    issue_id = field(content, "id")
    marker = f"<!-- {issue_id} -->"
    existing = destination.read_text(encoding="utf-8") if destination.exists() else f"# {month}\n"
    if marker in existing:
        return destination
    title = field(content, "title")
    summary = " ".join(section(content, "Completion summary").splitlines())
    entry = (
        f"\n## {date.today().isoformat()}\n\n### {category}\n\n"
        f"{marker}\n- {summary} ([{issue_id}](../issues/{issue_path.name}))\n"
    )
    destination.write_text(existing.rstrip() + "\n" + entry, encoding="utf-8", newline="\n")
    return destination


def transition(
    project: Path,
    issue_id: str,
    target: str,
    summary: str | None,
    verification: str | None,
    category: str,
) -> tuple[Path, Path | None]:
    issue_path = find_issue(project, issue_id)
    content = issue_path.read_text(encoding="utf-8")
    current = field(content, "status")
    if target not in TRANSITIONS.get(current, set()):
        raise ValueError(f"illegal transition: {current} -> {target}")

    if summary:
        content = replace_section(content, "Completion summary", summary)
    if verification:
        content = replace_section(content, "Verification", verification)

    acceptance = section(content, "Acceptance criteria")
    if target == "ready":
        if "Define concrete acceptance criteria." in acceptance or "- [" not in acceptance:
            raise ValueError("ready requires concrete acceptance criteria")
    if target == "blocked" and not summary:
        raise ValueError("blocked requires --summary describing the blocker")
    if target == "done":
        if "- [ ]" in acceptance or "- [x]" not in acceptance.lower():
            raise ValueError("done requires every acceptance checkbox to be checked")
        if section(content, "Verification") == "Not verified.":
            raise ValueError("done requires verification evidence")
        if section(content, "Completion summary") == "Not completed.":
            raise ValueError("done requires a completion summary")
    if target == "cancelled" and section(content, "Completion summary") == "Not completed.":
        raise ValueError("cancelled requires a completion summary")
    if target in {"done", "cancelled"} and not (project / "docs" / "changelog").is_dir():
        raise ValueError("docs/changelog is missing; run $init-docs first")

    today = date.today().isoformat()
    content = replace_field(content, "status", target)
    content = replace_field(content, "updated", today)
    if target in {"done", "cancelled"}:
        content = replace_field(content, "closed", today)
    content = append_activity(content, f"Status changed from {current} to {target}.")
    issue_path.write_text(content, encoding="utf-8", newline="\n")

    changelog = None
    if target in {"done", "cancelled"}:
        changelog = append_changelog(
            project, issue_path, content, "Cancelled" if target == "cancelled" else category
        )
    reindex(project)
    return issue_path, changelog


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    subparsers = root.add_subparsers(dest="command", required=True)

    create = subparsers.add_parser("create")
    create.add_argument("--project", required=True, type=Path)
    create.add_argument("--title", required=True)
    create.add_argument("--problem", required=True)
    create.add_argument("--outcome", required=True)
    create.add_argument("--priority", default="medium")
    create.add_argument("--source", action="append", default=[])

    move = subparsers.add_parser("transition")
    move.add_argument("--project", required=True, type=Path)
    move.add_argument("--id", required=True)
    move.add_argument("--status", required=True, choices=STATES)
    move.add_argument("--summary")
    move.add_argument("--verification")
    move.add_argument("--category", choices=CATEGORIES, default="Changed")

    index = subparsers.add_parser("reindex")
    index.add_argument("--project", required=True, type=Path)
    return root


def main() -> int:
    args = parser().parse_args()
    project = args.project.resolve()
    try:
        if args.command == "create":
            template = Path(__file__).resolve().parent.parent / "assets" / "issue.md.tmpl"
            path = create_issue(
                project, template, args.title, args.problem, args.outcome, args.priority, args.source
            )
            print(f"CREATED {path}")
        elif args.command == "transition":
            path, changelog = transition(
                project, args.id, args.status, args.summary, args.verification, args.category
            )
            print(f"UPDATED {path}")
            if changelog:
                print(f"CHANGELOG {changelog}")
        else:
            print(f"REINDEXED {reindex(project)}")
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
