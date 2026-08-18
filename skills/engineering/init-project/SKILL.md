---
name: init-project
description: "Create a minimal tested project with an official scaffold using one of four preferred profiles: pnpm + React + TypeScript + Vite, Tauri + React + TypeScript, uv + Typer, or uv + FastAPI. Use when the user asks to create, initialize, or scaffold a new project with one of these stacks."
---

# Initialize Project

Create a minimal runnable project from an official scaffold, add the profile's test setup, and verify the result. Do not add project-governance files, AI context, agent instructions, ADRs, deployment configuration, or unrelated application features.

## Select the profile

Infer one profile from the request:

- React, web, or frontend: `typescript-react-vite`
- Tauri, desktop, or GUI: `tauri-react`
- Typer or Python CLI: `python-typer`
- FastAPI or Python API: `python-fastapi`

Prefer an explicitly named framework. Ask the user to choose only when multiple profiles match or none matches. Resolve the project name and destination, defaulting to `<current-working-directory>/<project-name>`.

## Protect the destination

Before running a generator:

1. Resolve and display the absolute target path.
2. Refuse a filesystem root, home directory, workspace root, or another broad target.
3. Refuse a target containing files or directories. Never pass `--force` or overwrite content.
4. Use the target parent when the target does not exist. Use the supported dot-target form inside an existing empty target.
5. Do not initialize Git. Do not stage, commit, publish, or deploy.

Project creation is authorized when the absolute target follows directly from the user's explicit destination or the documented default. Do not add another confirmation unless path resolution exposes material ambiguity or risk.

## Scaffold and verify

Read only the selected profile and follow it exactly:

- `typescript-react-vite`: [references/typescript-react-vite.md](references/typescript-react-vite.md)
- `tauri-react`: [references/tauri-react.md](references/tauri-react.md)
- `python-typer`: [references/python-typer.md](references/python-typer.md)
- `python-fastapi`: [references/python-fastapi.md](references/python-fastapi.md)

Use current stable dependency resolution. Do not pin versions in this Skill. Check the linked official documentation before adapting a stale generator command.

Run every verification command specified by the selected profile. Never claim a check passed unless it ran successfully. If a prerequisite or native toolchain is unavailable, leave generated files intact and report the exact skipped command and reason.

## Report

Report the selected profile, absolute project path, generated stack, commands run, failures or skipped checks, and the next development command.
