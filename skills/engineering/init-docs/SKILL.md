---
name: init-docs
description: Initialize a repository-owned AI engineering documentation workspace under docs/ and a minimal root AGENTS.md pointer. Use when the user asks to set up local project documentation, local issue tracking, meeting records, domain context, changelog, ADRs, handoffs, or research without an online issue tracker.
---

# Initialize Project Docs

Create the durable documentation baseline once. Do not invent domain knowledge, issues, meetings, or architecture decisions.

## Inspect the destination

Resolve the project root to an absolute path. Refuse a filesystem root, home directory, missing directory, or non-directory. Read any existing `AGENTS.md` and `docs/` content before initialization.

Run:

```text
python <this-skill-directory>/scripts/init_docs.py --project <absolute-project-path>
```

Resolve the script relative to this `SKILL.md`. It creates a minimal root `AGENTS.md` plus the documentation contract under `docs/`. It is idempotent when generated files are unchanged and performs a preflight conflict check before writing anything.

## Handle conflicts

If any destination file already differs, stop and report every conflicting path. Do not overwrite, merge, rename, or delete existing content automatically. Ask the user to resolve the conflict or explicitly authorize a later migration task.

## Verify

Run the initializer a second time and require an unchanged result. Confirm that all paths named by root `AGENTS.md` exist. Report created and unchanged files; never claim initialization succeeded if either run fails.
