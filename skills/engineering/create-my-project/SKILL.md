---
name: create-my-project
description: "Create or maintain a governed project using one of four preferred profiles: pnpm + React + TypeScript + Vite, Tauri + React + TypeScript, uv + Typer, or uv + FastAPI. Use when the user asks to create or scaffold one of these projects, or while implementing work in a project created with this skill when governance docs must stay aligned and durable architecture decisions should be recorded as ADRs."
---

# Create My Project

Create a runnable project with tests and concise, durable project governance. Maintain those records when later work changes verified project facts or establishes a lasting architecture decision. Never claim background monitoring: maintenance happens only while this Skill participates in a task.

## Select the workflow

For a new project, infer one profile:

- React, web, frontend, or 前端: `typescript-react-vite`
- Tauri, desktop, GUI, or 桌面: `tauri-react`
- Typer or Python CLI: `python-typer`
- FastAPI or Python API: `python-fastapi`

Prefer an explicit framework name. Ask the user to choose only when multiple profiles or no profile matches. Resolve the project name and destination, defaulting to `<current-working-directory>/<project-name>`.

For an existing governed project, use the maintenance workflow. Do not reinterpret a request to modify an unrelated existing project as permission to retrofit this system.

## Protect a new destination

Before running a generator:

1. Resolve and display the absolute target path.
2. Refuse a filesystem root, home directory, workspace root, or another broad target.
3. Refuse a target containing files or directories. Never pass `--force` or overwrite content.
4. Use the target parent when the target does not exist. Use the supported dot-target form inside an existing empty target.
5. Do not initialize Git. Do not stage, commit, publish, or deploy.

Project creation is authorized when the absolute target follows directly from the user's explicit destination or the documented default. Do not add an extra confirmation unless resolution exposes material ambiguity or risk.

## Create a project

Read only the selected profile and follow it exactly:

- `typescript-react-vite`: [references/typescript-react-vite.md](references/typescript-react-vite.md)
- `tauri-react`: [references/tauri-react.md](references/tauri-react.md)
- `python-typer`: [references/python-typer.md](references/python-typer.md)
- `python-fastapi`: [references/python-fastapi.md](references/python-fastapi.md)

After the official scaffold and test setup succeed, run:

```text
python <this-skill-directory>/scripts/init_project_governance.py --project <absolute-project-path> --profile <profile> --name <project-name>
```

Resolve the script relative to this `SKILL.md`, not the generated project. Run it using an available Python 3 interpreter without installing one. It creates `AGENTS.md`, a real relative `CLAUDE.md` symlink, `docs/agents/`, `docs/adr/`, and appends a marked governance section to the scaffold README. It never overwrites governance files or replaces an existing `CLAUDE.md`.

If symlink creation fails, keep the files already created, stop before verification, and report the platform error. Do not copy `AGENTS.md` or create a pointer file as a fallback.

Use current stable dependency resolution. Do not pin versions in this Skill. Check the linked official documentation before adapting a stale generator command.

## Maintain a governed project

At task start, read:

- `AGENTS.md` and relevant files under `docs/agents/`
- ADR filenames and any ADR relevant to the task
- the package manifest, build/test configuration, and affected code

Complete and verify the requested implementation before documenting it. At task end, compare the verified result with the documentation and update only facts that changed:

- `AGENTS.md`: stable global commands, boundaries, and constraints
- `README.md`: human installation, development, testing, and usage instructions
- `docs/agents/architecture.md`: current architecture and module boundaries
- `docs/agents/development.md`: current toolchain and development workflow
- `docs/agents/testing.md`: current test layout, commands, and completion checks

Never document a plan as implemented state. Preserve useful existing prose and marked README content.

## Record architecture decisions

Create an ADR automatically after verified work when the task actually:

- introduces or replaces a framework, major dependency, or persistence approach;
- changes module boundaries, dependency direction, or public-interface policy;
- establishes authentication, authorization, security, deployment, or data-compatibility policy; or
- selects among viable alternatives in a way that constrains future work.

Do not create an ADR for ordinary bug fixes, styling, local refactors, or patch dependency upgrades.

Prepare concise context, decision, rationale, alternatives, and consequences, then run:

```text
python <this-skill-directory>/scripts/create_adr.py --project <absolute-project-path> --title <title> --context <context> --decision <decision> --rationale <rationale> --alternative <alternative> --consequence <consequence>
```

Resolve the script relative to this `SKILL.md`. Repeat `--alternative` and `--consequence` as needed. Use `--supersedes <ADR filename>` when replacing an accepted decision. Never rewrite an accepted ADR to change history; create a new ADR and mark the old record as superseded only through the new record.

## Verify and report

Run every verification command specified by the selected profile. Never claim a check passed unless it ran successfully. If a prerequisite or native toolchain is unavailable, leave generated files intact and report the exact skipped command and reason.

Report the profile, absolute project path, generated stack and governance files, commands run, failures or skipped checks, and next development command. During maintenance, report documentation and ADR changes alongside code verification.
