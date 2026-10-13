# Adopt project-owned checks

## Inputs and ownership

The project owns `.architecture.json`, check scripts, `.codex/checks.json`, Hook definitions, and CI. Templates are a starting implementation, not a global runtime or a service that silently upgrades projects. Keep the contract's reasoning in existing architecture documentation; keep executable owners, exports, and dependencies in the contract. `AGENTS.md` should point to the real files and commands without duplicating them.

Read the selected language reference for its supported contract and tool prerequisites. Follow the project's package manager and lockfile. Install dependencies only as part of authorized setup; the initializer installs nothing and does not modify `package.json`, `pyproject.toml`, lockfiles, or existing CI.

The initializer takes absolute project and input-contract paths. `--full-command` and optional `--quick-command` each accept a JSON array of executable and arguments. Commands run from the project root. They must be non-interactive, must not rewrite code or install packages, and must exit nonzero when a required check fails. Use an executable available in both the intended Codex environment and CI; verify Windows package-manager launchers instead of assuming a POSIX shell.

A reused quick checker must cover the same declared owners, public surfaces, dependency directions, infrastructure access, test boundaries, source classification, and export policy. Demonstrate failures before selecting it. If it covers only part of the contract, compose it with the missing checks rather than replacing complete coverage with a narrower command.

## Legacy example

For a TypeScript order application with `src/orders` and `src/payments`, inspect actual callers and persistence access before declaring two module owners. A directory may contain several domains, and a workflow spread across directories may have one owner. Do not convert every folder into an independently public module.

First run the candidate checker read-only and capture exact violations. Suppose one existing `src/orders/legacy.ts` import of `src/payments/internal.ts` is approved for gradual removal. Record only that exact `private-import` rule, source, target, and a meaningful reason in the baseline. A new caller or target must still fail. If the old caller is repaired or removed, delete the stale exception; never baseline new violations during normal implementation.

Prepare the real contract and preview initialization with the existing full argv of `["npm", "run", "check"]`. The generated full wrapper runs structure checks first and then that command; no package-script rewrite is required. Leave the optional quick argument unset to use the supplied checker, unless the existing tool has passed the deliberate-violation tests. Review the plan, apply it, and require pass → deliberate failure → restored pass. Existing failures must be reported accurately rather than relabelled as new regressions or automatically fixed outside scope.

## Generated integration

The initializer copies the chosen contract and profile scripts, creates `.codex/checks.json`, merges project `.codex/hooks.json` entries, and adds a managed `AGENTS.md` pointer. TypeScript projects receive `scripts/check-architecture.mjs` and `scripts/codex-checks.mjs`; Python projects receive `scripts/check_architecture.py` and `scripts/codex_checks.py`.

The quick command runs after relevant source edits. Before an implementation turn finishes, the full wrapper runs quick structure checking followed by the configured full command. Manual and CI entry points are `node scripts/codex-checks.mjs --run full` for TypeScript or `python scripts/codex_checks.py --run full` for Python; use `--run quick` for quick-only checks. `.codex/checks.json` stores quick/full argv arrays and `timeoutSeconds`, which defaults to 300. Stop may request at most two automatic repair continuations. Exhausting that allowance does not turn failure into a pass. Initial dirty files are a baseline for detecting work in the current turn, not permission to repair them during read-only work. Check inputs include configuration and deletions; a check whose inputs change while running must not be accepted as final evidence.

Keep the existing CI workflow when it can invoke the full wrapper. Otherwise `--ci` adds `.github/workflows/architecture.yml` with that same wrapper; review runtime setup and project dependency installation for the chosen package manager before relying on it. Enable the resulting status check as required through the host's normal repository policy. The initializer does not change branch protection.

Native Codex project Hooks require trust review on first enablement and definition changes. A Hook is feedback after an edit and before turn completion; it cannot undo an edit or cover every possible writing tool. Test actual events in the target desktop/CLI. Local Hooks can be disabled, so run CI independently and never claim that Hooks establish a security boundary.

## Repeat runs and updates

Use `--plan` for a read-only list and diff of proposed changes. All conflicts must be identified before any file is written. Applying the same inputs twice must preserve unrelated Hook entries, prose, and project files and report the second run unchanged.

If a destination differs from the generated candidate, inspect the diff and preserve the project's changes. Apply a reviewed project-specific update through its normal workflow, then re-run relevant checks. Do not delete a destination to bypass conflict detection, overwrite local content, add blanket exclusions, or change a baseline just to obtain a green result. Initializing checks does not authorize a repository-wide refactor.

## Evidence to retain

- Exact fast and full commands, environment prerequisites, and final input/result evidence.
- Deliberate violation and repair results, including source-root coverage and relevant language-specific bypass cases.
- Native PostToolUse and Stop observations, retry-limit behavior, and read-only dirty-worktree behavior; mark these pending when only simulation was available.
- Windows/Linux results and independent CI results; distinguish a workflow file from an executed or required status check.
- Existing exceptions, user configuration preserved, and any intentionally reviewed contract change.
