#!/usr/bin/env python3
"""Initialize non-destructive project governance files from bundled templates."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import sys


PROFILE_VALUES = {
    "typescript-react-vite": {
        "PROJECT_DESCRIPTION": "A React and TypeScript web application built with Vite.",
        "INSTALL_COMMAND": "pnpm install",
        "DEV_COMMAND": "pnpm dev",
        "TEST_COMMAND": "pnpm test",
        "BUILD_COMMAND": "pnpm build",
        "PREREQUISITES": "- Node.js\n- pnpm",
        "ARCHITECTURE_DESCRIPTION": "The Vite entry point under `src/` mounts the React application. Keep application code and assets under `src/` unless the build configuration requires otherwise.",
        "ARCHITECTURE_BOUNDARIES": "- Keep browser entry and application composition explicit.\n- Keep reusable UI and behavior separate from test code.\n- Add feature boundaries only when real features establish them.",
        "TEST_LAYOUT": "- `tests/unit/` contains Vitest and React Testing Library tests.\n- `tests/e2e/` contains Playwright browser tests.",
        "ADDITIONAL_TEST_COMMANDS": "pnpm test:unit\npnpm test:e2e",
    },
    "tauri-react": {
        "PROJECT_DESCRIPTION": "A Tauri desktop application with a React and TypeScript frontend.",
        "INSTALL_COMMAND": "pnpm install",
        "DEV_COMMAND": "pnpm tauri dev",
        "TEST_COMMAND": "pnpm test",
        "BUILD_COMMAND": "pnpm build && cargo check --manifest-path src-tauri/Cargo.toml",
        "PREREQUISITES": "- Node.js\n- pnpm\n- Rust toolchain with `cargo` and `rustc`\n- Tauri platform prerequisites",
        "ARCHITECTURE_DESCRIPTION": "The React frontend lives under `src/`; the Tauri Rust application and native configuration live under `src-tauri/`.",
        "ARCHITECTURE_BOUNDARIES": "- Keep web UI concerns under `src/`.\n- Keep native commands, capabilities, and Rust configuration under `src-tauri/`.\n- Treat the Tauri command boundary as an explicit public interface.",
        "TEST_LAYOUT": "- `tests/unit/` contains Vitest and React Testing Library tests.\n- `tests/e2e/` contains Playwright tests for the Vite web surface only.\n- Native code is checked with Cargo; no native WebDriver suite is configured.",
        "ADDITIONAL_TEST_COMMANDS": "pnpm test:unit\npnpm test:e2e\ncargo check --manifest-path src-tauri/Cargo.toml",
    },
    "python-typer": {
        "PROJECT_DESCRIPTION": "A packaged Python command-line application built with Typer and managed by uv.",
        "INSTALL_COMMAND": "uv sync",
        "DEV_COMMAND": "uv run {{PROJECT_NAME}} --help",
        "TEST_COMMAND": "uv run pytest",
        "BUILD_COMMAND": "uv build",
        "PREREQUISITES": "- Python supported by the generated project\n- uv",
        "ARCHITECTURE_DESCRIPTION": "Application code lives in the generated package under `src/`; the command entry point is declared in `pyproject.toml`.",
        "ARCHITECTURE_BOUNDARIES": "- Keep command parsing at the Typer entry point.\n- Move reusable behavior into package modules as features emerge.\n- Keep the installed command name and import package mapping explicit.",
        "TEST_LAYOUT": "- `tests/` contains pytest tests.\n- CLI behavior is exercised with `typer.testing.CliRunner`.",
        "ADDITIONAL_TEST_COMMANDS": "uv run {{PROJECT_NAME}} --help",
    },
    "python-fastapi": {
        "PROJECT_DESCRIPTION": "A Python HTTP API built with FastAPI and managed by uv.",
        "INSTALL_COMMAND": "uv sync",
        "DEV_COMMAND": "uv run fastapi dev",
        "TEST_COMMAND": "uv run pytest",
        "BUILD_COMMAND": "uv run python -c \"from main import app; assert app is not None\"",
        "PREREQUISITES": "- Python supported by the generated project\n- uv",
        "ARCHITECTURE_DESCRIPTION": "The FastAPI application entry point is `main:app`, as configured in `pyproject.toml`.",
        "ARCHITECTURE_BOUNDARIES": "- Keep the application entry point explicit.\n- Add routers or service boundaries only when implemented behavior requires them.\n- Keep HTTP contracts covered by tests.",
        "TEST_LAYOUT": "- `tests/` contains pytest tests.\n- HTTP behavior is exercised through FastAPI `TestClient`.",
        "ADDITIONAL_TEST_COMMANDS": "uv run python -X utf8 -m fastapi --help",
    },
}

OUTPUTS = {
    "AGENTS.md": "AGENTS.md.tmpl",
    "docs/agents/architecture.md": "architecture.md.tmpl",
    "docs/agents/development.md": "development.md.tmpl",
    "docs/agents/testing.md": "testing.md.tmpl",
    "docs/adr/README.md": "adr-index.md.tmpl",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--profile", required=True, choices=sorted(PROFILE_VALUES))
    parser.add_argument("--name", required=True)
    return parser.parse_args()


def render(template: str, values: dict[str, str]) -> str:
    result = template
    for key, value in values.items():
        result = result.replace("{{" + key + "}}", value)
    unresolved = [part.split("}}", 1)[0] for part in result.split("{{")[1:] if "}}" in part]
    if unresolved:
        raise ValueError(f"unresolved template values: {', '.join(unresolved)}")
    return result.rstrip() + "\n"


def initialize(project: Path, profile: str, name: str, template_dir: Path) -> list[Path]:
    project = project.resolve()
    if not project.is_dir():
        raise ValueError(f"project directory does not exist: {project}")

    values = {**PROFILE_VALUES[profile], "PROFILE": profile, "PROJECT_NAME": name}
    values = {key: value.replace("{{PROJECT_NAME}}", name) for key, value in values.items()}

    destinations = [project / relative for relative in OUTPUTS]
    claude = project / "CLAUDE.md"
    conflicts = [path for path in [*destinations, claude] if path.exists() or path.is_symlink()]
    if conflicts:
        rendered = ", ".join(str(path.relative_to(project)) for path in conflicts)
        raise FileExistsError(f"refusing to overwrite existing governance paths: {rendered}")

    readme = project / "README.md"
    existing_readme = readme.read_text(encoding="utf-8") if readme.exists() else ""
    if "<!-- create-my-project:governance:start -->" in existing_readme:
        raise FileExistsError("README.md already contains the governance section")

    created: list[Path] = []
    for relative, template_name in OUTPUTS.items():
        destination = project / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        content = render((template_dir / template_name).read_text(encoding="utf-8"), values)
        destination.write_text(content, encoding="utf-8", newline="\n")
        created.append(destination)

    section_template = (template_dir / "README-section.md.tmpl").read_text(encoding="utf-8")
    section = render(section_template, values)
    if readme.exists():
        separator = "" if not existing_readme or existing_readme.endswith("\n\n") else "\n" if existing_readme.endswith("\n") else "\n\n"
        readme.write_text(existing_readme + separator + section, encoding="utf-8", newline="\n")
    else:
        readme.write_text(f"# {name}\n\n{section}", encoding="utf-8", newline="\n")
    created.append(readme)

    try:
        os.symlink("AGENTS.md", claude)
    except OSError as exc:
        raise OSError(f"created governance files but could not create CLAUDE.md -> AGENTS.md: {exc}") from exc
    created.append(claude)
    return created


def main() -> int:
    args = parse_args()
    template_dir = Path(__file__).resolve().parent.parent / "assets" / "governance"
    try:
        created = initialize(args.project, args.profile, args.name, template_dir)
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    for path in created:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
