#!/usr/bin/env python3
"""Initialize repository-owned AI engineering documentation without overwrites."""

from __future__ import annotations

import argparse
from pathlib import Path


FILES = {
    "AGENTS.md": "AGENTS.md.tmpl",
    "docs/agents/README.md": "agents-README.md.tmpl",
    "docs/agents/workflow.md": "workflow.md.tmpl",
    "docs/agents/domain.md": "domain.md.tmpl",
    "docs/agents/issue-tracker.md": "issue-tracker.md.tmpl",
    "docs/context/CONTEXT.md": "CONTEXT.md.tmpl",
    "docs/issues/README.md": "issues-README.md.tmpl",
    "docs/changelog/README.md": "changelog-README.md.tmpl",
    "docs/meetings/README.md": "meetings-README.md.tmpl",
    "docs/adr/README.md": "adr-README.md.tmpl",
    "docs/handoffs/README.md": "handoffs-README.md.tmpl",
    "docs/research/README.md": "research-README.md.tmpl",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path)
    return parser.parse_args()


def render(template: str, project_name: str) -> str:
    return template.replace("{{PROJECT_NAME}}", project_name)


def initialize(project: Path, template_dir: Path) -> tuple[list[Path], list[Path]]:
    project = project.resolve()
    if not project.is_dir():
        raise ValueError(f"project must be an existing directory: {project}")
    if project == Path(project.anchor) or project == Path.home().resolve():
        raise ValueError(f"refusing broad project path: {project}")

    rendered: dict[Path, str] = {}
    conflicts: list[Path] = []
    for relative, template_name in FILES.items():
        destination = project / relative
        content = render(
            (template_dir / template_name).read_text(encoding="utf-8"), project.name
        )
        rendered[destination] = content
        if destination.exists() and destination.read_text(encoding="utf-8") != content:
            conflicts.append(destination)

    if conflicts:
        joined = "\n".join(f"- {path}" for path in conflicts)
        raise FileExistsError(f"conflicting documentation files:\n{joined}")

    created: list[Path] = []
    unchanged: list[Path] = []
    for destination, content in rendered.items():
        if destination.exists():
            unchanged.append(destination)
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8", newline="\n")
        created.append(destination)
    return created, unchanged


def main() -> int:
    args = parse_args()
    template_dir = Path(__file__).resolve().parent.parent / "assets" / "project-docs"
    try:
        created, unchanged = initialize(args.project, template_dir)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}")
        return 1
    for path in created:
        print(f"CREATED {path}")
    for path in unchanged:
        print(f"UNCHANGED {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
