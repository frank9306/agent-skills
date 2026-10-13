---
name: init-checks
description: Initialize or preview updates to project-owned TypeScript or Python architecture contracts, executable structure checks, Codex Hooks, and CI gates. Use when the user asks to enforce module boundaries automatically; not for routine implementation or semantic architecture review.
---

# Initialize Project Checks

Make an agreed module design executable in the project. Reuse existing checks and workflow; do not introduce local Issues, a global dispatcher, or another environment manager.

## Ground the contract

Read project instructions, Git status, source roots, public entry points, callers, tests, dependency configuration, and current lint/test/build/CI commands. Resolve the actual Git worktree root; do not assume the current directory is the root. A non-Git project can receive files and run the direct structure checker, but the generated quick/full wrapper and native Hook discovery require a Git repository; do not run `git init` automatically. Preserve unrelated changes.

Read [adoption and verification](references/adoption.md), then only the relevant [TypeScript](references/typescript.md) or [Python](references/python.md) reference. For a mixed repository, integrate each language through the project's existing verification command; initialize one declared profile per contract rather than pretending that one scanner covers both languages.

Establish owners, public exports, allowed dependencies, infrastructure access, and test boundaries from actual behavior and architecture decisions. Resolve material boundary questions from the project requirements and architecture workflow before writing the contract. Never infer ownership solely from folders or generate permissive rules merely to make a repository pass.

Prefer the project's existing boundary tool. Reuse its quick command only after deliberate violations prove that it covers the agreed contract. Otherwise use the supplied profile checker and the language reference's project-local dependencies. The initializer itself requires Python; generated TypeScript checks use Node, and generated Python checks use Python without adding the other runtime to that project.

## Prepare and apply

Prepare a real JSON contract outside the destination or use the existing project contract as input. New projects enforce it completely. For legacy projects, first inspect violations read-only, then agree exact existing rule/from/to/reason exceptions; never introduce a wildcard or blanket directory baseline. New violations must fail, and repaired exceptions must be removed.

Resolve this Skill's script relative to `SKILL.md`:

```text
python <skill-directory>/scripts/init_checks.py --project <absolute-project-root> --profile typescript|python --contract <absolute-contract-json> --full-command <json-argv> [--quick-command <json-argv>] [--plan] [--ci]
```

Pass each command as one JSON argument array, not shell code. Supply the project's existing required tests/types/lint/build entry as the full command. The generated wrapper always runs the quick structure command before that full command, so structure verification cannot be omitted accidentally. The initializer does not rewrite package manifests or install dependencies.

Run `--plan` and inspect every proposed change before applying the same arguments without `--plan`. Reuse existing CI when available. `--ci` is for adding an independent GitHub Actions workflow when the project has no suitable gate; it invokes the same full wrapper and must not duplicate existing verification.

The initializer preflights all destinations, merges Hook entries and a managed `AGENTS.md` pointer block, preserves unrelated content, and refuses conflicting local edits before writing. Repeated application must be unchanged. For changed templates or contracts, use `--plan` to inspect differences and update deliberately through the project workflow; this initialization Skill does not own ongoing architecture maintenance.

## Prove enforcement

Run `node scripts/codex-checks.mjs --run full` for TypeScript or `python scripts/codex_checks.py --run full` for Python to establish a pass. Use the same wrapper with `--run quick` for structure-only feedback. In an isolated copy or reversible test edit, introduce representative forbidden dependencies, a private import, and an undeclared export; require failure, restore the exact original inputs, and require another pass. Cover alias/type imports and scan coverage for TypeScript, and import/package behavior for Python as specified by the relevant reference. Missing tools, timeouts, or changed inputs are failures, not skipped passes.

Validate the actual Codex integration after the native Hook trust review: a source edit triggers the quick check, a failing full check causes Stop continuation, and at most two automatic continuations occur before an honest incomplete report. A read-only turn must not start fixing pre-existing dirty files. Never copy trust state or bypass the platform's review. Simulated Hook stdin tests do not prove native integration.

Run the same full wrapper independently of Hooks, including in CI. Required branch/status-check protection is configured by the repository owner or an explicitly authorized host operation; creating workflow YAML alone does not protect merging.

Report generated and preserved files, exact commands and results, any legacy exceptions, dependency changes, and native Hook/CI evidence still missing. Distinguish executable boundary enforcement from semantic review: these checks cannot prove that an interface is deep, that business ownership is correct, or that Hooks provide security isolation.
