---
id: ISSUE-0023
title: "Redesign frontend-design around UI quality and browser contracts"
status: done
priority: high
created: 2026-10-14
updated: 2026-10-14
closed: 2026-10-14
related_adrs: []
depends_on: []
---

# ISSUE-0023: Redesign frontend-design around UI quality and browser contracts

## Problem

The frontend skill mixes UI quality with general engineering audit and strict screenshot fidelity, while layout and scroll correctness have no executable behavior contract.

## Desired outcome

A focused six-step skill, Playwright UI contract checker and CLI, real Chromium regression tests, and ai-playbook migration guidance; retire strict fidelity tools.

## Acceptance criteria

- [x] Focus the six-step skill on UI quality, with conditional references and read-only audits without DESIGN.md.
- [x] Retire the nine general-audit references and strict fidelity toolchain; preserve historical records and product baselines.
- [x] Deliver checkUI(page, contract), CLI, versioned example and input-bound local evidence with explicit outcomes.
- [x] Prove style, geometry, scroll, pinned/overlay/focus and error scenarios in real Chromium, including good/bad/restored cases.
- [x] Document usage/migration in ai-playbook and retain pinned upstream provenance.
- [x] Pass repository checks, relevant full tests and read-only review; report runtime and native-platform limits.

## Out of scope

No commits, pushes, publication, installation sync, production data, native-UI automation, business-project migration or Hook/CI installation.

## Decisions

### Pre-generation module contract (2026-10-14)

The user-approved plan is the scope authority. Module design is recorded before tests or implementation.

| Owner | Responsibility and public interface | Hidden implementation / dependencies |
|---|---|---|
| UI checker (`scripts/check-ui.mjs`) | `checkUI(page, contract, options?)` returns status, findings, measurements, coverage, environment and optional local screenshot evidence. `verifyUIReport(reportPath, options?)` revalidates input/artifact digests; rejects stale results. | Contract validation, unique locators, normalized CSS comparisons, geometry, real wheel/key input, restoration, readiness and source/resource hashing. Caller owns the Playwright Page, authentication/data/state setup and browser lifecycle. Node built-ins only; no Playwright import in core. |
| CLI (`scripts/verify-ui.mjs`) | `--contract`, `--project-root`, optional `--runtime-root`, `--out`; `--verify-report` revalidation. Exit 0 pass, 1 failed expectations, 2 invalid contract/runtime/execution or unverified evidence. | Resolves caller-provided runtime (explicit override, otherwise project), launches Chromium, owns page/context cleanup, navigates and prepares each declared viewport/theme/state case. CLI supports already-prepared URL states only, not arbitrary JS/actions. |
| Static scan (`scripts/verify-design.mjs`) | Existing root/`--json` interface; only UI/a11y/motion/aesthetic review leads. Missing DESIGN.md is a warning. | Regex leads remain inferred, never claim UI correctness. General engineering/security heuristics are removed. |

Contract version 1: id, URL (CLI), viewport, colorScheme, state, ready selector; named targets; checks (style/equal-style, within, align, size, page-overflow, scroll, pinned, reachable, focus, overlay); reasoned N/A checks; tolerance default 1 CSS px. Scroll specifies axis, target (`document` supported), forbidden movers and optional boundary behavior. Every check is named, and targets used for measurement resolve uniquely. Optional tolerance changes require reasons. No arbitrary code in JSON. Exceptions are scoped declared checks or N/A with reasons, not global ignore lists.

Evidence: required input file list (source, contract, fixtures, relevant assets; paths are project-relative), content digests, contract digest, observed URL/state/viewport/theme/browser, screenshot digests. Core verifies file inputs unchanged during run. Report revalidation checks all bound inputs and artifacts. An in-memory run without explicit file inputs can report measurements but is unverified as durable evidence. Evidence never contains authentication/storage state or request payloads. Screenshots preserve actual interactivity; no forced animation suppression for behavior checks. The checker restores scroll positions where possible after each check. Scenarios using live business mutations belong to caller-owned tests, not generic CLI.

Dependency direction: CLI -> core -> Playwright Page public methods + Node built-ins. Tests -> core/CLI public entrypoints. No exported internal helpers. Core errors carry measured context; failed expectations are findings, configuration/readiness/ambiguous selectors are execution errors. Missing runtime is never skipped as a pass.

File map: core and CLI in existing scripts/; browser/public-contract tests and static tests in existing tests/; a HTML fixture in tests/fixtures/; contract example in assets/; layout/verification reference in references/. No separate framework or schema dependency.

Caller walkthroughs: an existing project prepares/authenticates a Page, invokes checkUI, reads outcomes and attaches artifacts; CLI consumes a prepared URL and contract with inputs; good/bad/restored fixture uses the same public assertions; expired report is rejected through verifyUIReport. Callers do not sequence internal probes or reproduce digest/scroll logic. The abstraction hides repeated measurement, action synchronization and evidence integrity. Removing it would duplicate these policies in callers.

Validation: Node public-interface tests with installed Playwright/Chromium via explicit FRONTEND_PLAYWRIGHT_ROOT; existing Node suite/check scripts; skill quick_validate; ai-playbook checks. No repo architecture checker is configured outside init-checks fixtures; do not install one under this task. Strict-fidelity Python tests are retired, not treated as new-tool coverage.

## Implementation notes

Implemented the six-step UI-only skill, narrowed discovery metadata and conditional references. Kept runtime value/component authority and four task branches; read-only review no longer creates or requires DESIGN.md. Independent forward instruction walkthrough covered a public page, workspace, small component repair and audit without DESIGN.md. It found prototype/module-gate ordering and read-only wording issues; both were corrected. This is instruction-level evidence, not an empirical production design evaluation.

Retired nine general-audit references and the strict screenshot/Pillow pipeline, including its manifest and Python tests. No product baseline, historical Issue or old Changelog was rewritten. Static CLI retains project/--json invocation, marks missing design authority as a warning and no longer imposes foreign heading schemas. Root test:frontend now runs Node tests only.

Added the Node-builtins checker/CLI, version-1 contract example, local file-bound reports, input/artifact/report invalidation and source/contract/runtime measurements. Existing caller-owned Playwright prepares the Page; explicit runtime overrides and missing-runtime errors are supported. No arbitrary JSON scripts or bundled browser driver. Scroll/focus probes use real wheel/key/click interactions; project action fixtures open and close overlays.

Red-green slices observed for declared/equal style, geometry, scroll ownership/boundaries, pinned/reachable, overlay/focus, evidence/CLI and read-only static scanning. Additional failing regressions exposed vacuous boundary containment without ancestor capacity, relative CSS context, unrelated reachability scrollers, ignored contract fields and navigation-URL leakage; each was repaired and its focused test passed. Public/workspace fixtures also accept legal local horizontal scrolling/overlap, independent panes, theme changes and empty-state N/A.

Added ai-playbook docs/frontend-design.md and linked it from the skill catalog; source README records browser-test prerequisites. Pinned provenance distinguishes taste-skill public workflow, redesign and product-UI alternatives. Existing installed Skills were not synchronized.

The initial automatic approval review rejected temporary test-dependency installation; no installation occurred at that stage. The user subsequently explicitly authorized these dependencies and full acceptance. Created a temporary workspace virtual environment, installed the unchanged requirements-dev.txt (import-linter==2.15 and its dependencies), and selected that Python for the entire acceptance run. Skill installation/synchronization and repository dependency changes remain out of scope.

## Verification

- `npm run check`: PASS, 23 Skills; `npm run check:frontend`: exit 0 with the expected missing-DESIGN warning in this non-UI repository.
- `npm run test:frontend` with explicit existing Playwright root and installed Chrome: PASS, 16 tests (12 real-browser groups and 4 static CLI groups), zero skipped. Final CLI/overlay refinements were rerun with focused tests and passed.
- Matrix: public and workspace fixtures at 900x650/light, 360x500/dark and 900x240/light, stress and empty states; defects fail and restoration passes. Other public-contract tests run at 500x360/light.
- Same-content 900x650/light stress screenshots were inspected before/after width-constraint repair: the broken public specimen/right workspace column are clipped; restoration contains the composition and wraps long localized text. Synthetic fixtures validate these behaviors, not production aesthetics.
- Initial `npm test` without the required Python engine: NOT ALL PASS. Frontend, read-web-content (3), dispatch (14), audit (9), AI-docs (2+3+2), and init-checks TypeScript (17) pass. Final Python init-checks run: 51 tests, 17 failures, all reporting missing import-linter==2.15. `git diff --exit-code 25d78c83460054ffb101e0a8310242ac0b2f129b -- skills/engineering/init-checks requirements-dev.txt` passed, confirming that subsystem and pinned dependency list are unchanged.
- Final `npm test` with the authorized temporary environment: PASS, 117 tests across all included suites. Frontend 16; read-web-content 3; dispatch 14; audit 9; AI-docs 2+3+2; init-checks TypeScript 17 and Python 51. The previous 17 dependency-related failures are resolved. Full output: C:/Users/frank/Documents/Codex/2026-10-14/xue/outputs/full-acceptance.log; exact test dependencies: outputs/test-dependencies.txt.
- Final source checks, skill validation and bound public/workspace evidence revalidation: PASS. No implementation changes were needed after providing the required test environment.
- ai-playbook: syntax check and 8 sync-prompts tests PASS; both repositories `git diff --check` PASS. Skill quick_validate PASS. All 12 source Markdown files' local references resolve; deleted tool/reference names are absent from live skill/scripts/package/instruction pointers.
- Read-only source review: `git diff 25d78c83460054ffb101e0a8310242ac0b2f129b` plus all new frontend-design files, and ai-playbook working diff/new guide. No remaining actionable source finding after the listed fixes. No project architecture checker is configured beyond init-checks fixtures; none was installed.
- Delivery evidence: C:/Users/frank/Documents/Codex/2026-10-14/xue/outputs/frontend-design-verification.json; linked public/workspace screenshot reports were generated and revalidated against current checker/source inputs.
- Not exercised: actual business projects, a connected WebView/device, pure native UI, touch physics, virtual keyboard, full focus trapping and a production visual-regression baseline. Human aesthetic judgment remains required.

## Activity log

### 2026-10-14 — Created

Issue created from the supplied project input.

### 2026-10-14 — Status changed from proposed to ready.

### 2026-10-14 — Status changed from ready to in-progress.

### 2026-10-14 — Implementation and UI verification recorded; full Python acceptance pending environment authorization.

### 2026-10-14 — User authorized temporary test dependencies; complete repository acceptance passed.

### 2026-10-14 — Status changed from in-progress to done.

### 2026-10-14 — Follow-up commit and installation authorization

After acceptance and closure, the user authorized local commits in both source repositories and synchronization of the installed frontend-design. The installed copy matches the original source baseline without local customization; generated Python caches are the only extras. Installation will use the accepted local source. No remote push was requested. Follow-up evidence is recorded in the task delivery report.

## Completion summary

Delivered the focused frontend-design workflow, scoped Playwright UI contracts/checker and CLI, real-browser regression fixtures, provenance and handbook migration guide. Full repository acceptance passes after installing the authorized pinned test dependencies in a temporary workspace environment. No commit, push, publication, Skill installation sync, business migration or Hook/CI changes were performed.
