---
name: init-docs
description: Initialize a repository-owned AI engineering documentation workspace under docs/ with a minimal root AGENTS.md, or selectively update an existing project's engineering workflow. Use for project documentation setup, local issue tracking, meeting records, domain context, changelog, ADRs, handoffs, research, or adding the defect recurrence rule to existing project docs.
---

# Initialize Project Docs

Create the durable documentation baseline once. Documentation setup does not install lint tools, structure checks, Hooks, or CI; use `$init-checks` when that work is requested. Do not invent domain knowledge, issues, meetings, or architecture decisions.

## Inspect the destination

Resolve the project root to an absolute path. Refuse a filesystem root, home directory, missing directory, or non-directory. Read any existing `AGENTS.md` and `docs/` content before initialization.

When asked to update an existing project's engineering workflow or add the defect recurrence rule, follow [Update defect recurrence guidance](#update-defect-recurrence-guidance).

For initialization, run:

```text
python <this-skill-directory>/scripts/init_docs.py --project <absolute-project-path>
```

Resolve the script relative to this `SKILL.md`. It creates a minimal root `AGENTS.md` plus the documentation contract under `docs/`. It is idempotent when generated files are unchanged and performs a preflight conflict check before writing anything.

## Handle conflicts

If any destination file already differs, stop and report every conflicting path. Do not overwrite, merge, rename, or delete existing content automatically. Ask the user to resolve the conflict or explicitly authorize a later migration task.

## Verify

Run the initializer a second time and require an unchanged result. Confirm that all paths named by root `AGENTS.md` exist. The workflow template must point to the shared [pre-generation module design gate](https://github.com/frank9306/agent-skills/blob/main/skills/engineering/implement-issue/references/module-depth-gate.md) through its portable canonical URL, rather than embed a second checklist; keep project-owned check gates aligned with the engineering workflow. Add architecture/check pointers only after the actual project files and commands exist; never claim the template initialized executable checks. Report created and unchanged files; never claim initialization succeeded if either run fails.

## Update defect recurrence guidance

Read the applicable `AGENTS.md` and the existing verification workflow it points to. Compare their guidance with the **Prevent defect recurrence** section of [the workflow template](assets/project-docs/workflow.md.tmpl). If equivalent guidance is already reachable, report its location. Otherwise, merge the missing guidance into the existing verification workflow and add a pointer from `AGENTS.md` if needed. If `AGENTS.md` owns the verification workflow directly, put the rule there.

Edit the existing documents in place and preserve project-specific instructions. Verify the diff, confirm the guidance is reachable before final verification, and check that repeating this update would require no further edits.
