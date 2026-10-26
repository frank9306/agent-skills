---
id: ISSUE-0026
title: "Run frozen app-use UI cases and bounded Laya branches"
status: done
priority: high
created: 2026-10-26
updated: 2026-10-26
closed: 2026-10-26
related_adrs: []
depends_on: [ISSUE-0024, ISSUE-0025]
---

# ISSUE-0026: Run frozen app-use UI cases and bounded Laya branches

## Problem

UI tasks need replayable assertions and bounded semantic decisions.

## Desired outcome

Ship frozen scripts, outcomes, evidence, Laya worker and frontend checker adapter.

## Acceptance criteria

- [x] Frozen scripts support prepare/steps/waits/assertions/declared semantic branches/cleanup with bounded execution and cancellation.
- [x] Outcomes pass/fail/unverified/error/stopped are distinguished; no assertions/all N/A cannot pass; evidence binds inputs/tool/target/build declarations.
- [x] Fixed official local Laya SDK/weights provenance and real inference; invalid/low/unknown/incomplete/stale/cancelled results halt without actions.
- [x] Provide a contract-tested page adapter for existing checkUI/verifyUIReport; defect injection gives pass/fail/restored-pass.

## Out of scope

No phones, macOS/Linux UI, pixel baseline engine, general Canvas recognition, business-site writes, profile export, system services or unrelated repository changes.

## Decisions

### Pre-generation module design — 2026-10-26

Runner owner scripts/runner.mjs exports runCase(client,script,options), validateCase(script), inspectRun(path). It freezes a JSON-cloned validated script, bounded defaults 5s step/120s case/100 steps. Script states carry one action/wait/assert/branch; branch options and next states are frozen. Rules choose before semantic judgment; unknown/low confidence stops unverified. Laya never owns next/assertions/actions. Cleanup only declared actions, runs on ordinary completion/failure; cancellation dispatches none. Evidence owner scripts/evidence.mjs records script/tool/input digests and append-only observations/actions/assertions/screenshot hashes; inspect verifies all artifacts and source fingerprints. Source hashes do not establish running build identity: required build readback assertion must do that. Sensitive actions use environment references and redacted metadata. Native/LayaWorker loads vendored fixed upstream SDK in independent worker with validated local model manifest, token budget and no download; Node kills worker tree on timeout/cancellation and discards late replies. page-adapter.mjs exports createPageAdapter scoped to session; implements only methods actually used by checkUI, preserving rule ownership. Rules stay in frontend-design; missing sibling is an explicit diagnostic. Tests at stable runner/client/adapter seams plus actual broker/browser/worker validation. No model-weight files in Git.

Scope and product choices are confirmed by the owner handoff in this chat. The four vertical slices share this recorded contract.

## Implementation notes

Implemented frozen version-1 cases, bounded actions/waits/rules/semantic candidates, durable event logs and integrity-bound evidence. Added the checker-only page adapter without changing frontend-design checkUI/verifyUIReport or its original tests. Vendored 26 unchanged official SDK source/project files at the fixed revision with license/provenance, an isolated self-contained worker and a verified independent model cache. Runtime inference neither launches Python nor downloads weights. Case validation rejects invalid future budgets before preparation; model output cannot introduce destinations/actions/assertions.

2026-10-26 contract clarification before generation: a case may freeze an optional `observation` scope (browser selector/frame context/limit or unique desktop subtree). Every runner observation reuses that scope; completeness describes that declared scope. This lets a bounded case inspect a large app without silently truncating the model input or widening its target set.

## Verification

2026-10-26: npm test PASS (127 tests: 117 unchanged original tests + 10 new deterministic contracts). npm run check PASS (24 Skills); quick_validate PASS; 21 JS files node --check PASS; self-contained native and Laya worker publish PASS using SDK 10.0.402. NuGet network restore stalled: cancelled the owned build and verified 72 cached nupkg SHA-512 files into an independent local feed/cache, then restored/published successfully. No package-policy or architecture-rule change was made. The offline validation invocation disabled NuGet network auditing only for that invocation; online vulnerability audit was not completed.

Observed red/green regressions include no assertions/all N/A, step timeout dispatch, missing wait target, rejected-model evidence retention, deleted-source evidence finalization, and invalid future budgets executing preparation. Tests cover low/unknown/malformed/overflow/stale/cancelled/late model results and forbid following actions/cleanup. Frozen cases in normal Chrome exercised baseline pass, disabled-button fail, wrong-result fail, obstruction execution error and restored passes. Final case evidence run-wmY5sb / run-KqtvcB / run-O29cwH / run-yzWe7L / run-QiralW / run-e6qUhx / run-tkXgb0 under C:/Users/frank/AppData/Local/app-use/runs; final pass reports inspected with integrity verified. Build readback is the required Ready v1 assertion, not a claim from source hashes.

The unchanged checker ran via the real adapter: size/style, main/side wheel scroll, boundary containment, pinned header, reachability, modal lock/focus/scroll and restored focus PASS; size/style/scroll/overlay defects FAIL and restoration PASS. Final layout reports ui-IBqsua / ui-TPTcSS / ui-leqv3c / ui-HPXqTv / ui-FOFAuL / ui-qY8K6Q / ui-ofj9zr / ui-T3bo3h / ui-T8wZiM under C:/Users/frank/AppData/Local/app-use/layout-runs. verifyUIReport revalidated pass/fail/pass and PNG bytes; screenshots visually inspected. A centered-scroll adapter defect was observed in the real checker and fixed with nearest scrolling, preserving the stationary-region expectation. An installed extension's delayed style injection initially invalidated a semantic snapshot correctly; non-UI script/style nodes/text are now excluded from semantic DOM observations, and truncated labels halt semantic dispatch.

npm run test:app-use:desktop PASS (2 tests, actual DPI 192; run-alpUfe). npm run test:app-use:browser PASS (2 tests; run-0aOQVB) including normal-profile session reuse, OOPIF, file contents, popup/dialog, sensitive-fill redaction and capture refusal. npm run test:app-use:laya PASS (2 tests): actual fixed-model inference/complete-context overflow refusal/cancellation run-WsgHIR; actual browser observation -> real local worker -> fixed branch -> real click -> literal goal run-XeBM06. All six selected final run reports re-inspected with integrity verified. Prior reports bind prior tool versions and are retained as history, not final evidence.

Read-only fixed-base review: git diff 6f30ad3eb1d3e5dd7425501bc326f32098359724 plus every untracked first-party app-use file, fixed vendor provenance/license and Issue contract. Found and repaired missing deadline rechecks, drag prevalidation/release coordinates, sensitive descendants/out-of-scope screenshot handling, and task-created ownership across reprepare. Relevant checks rerun; no unresolved P0/P1 in the tested scope. No ESM/C# architecture scan is configured; syntax/build/contract tests are the explicit validation coverage, not a claim that a structure checker exists. Edge, monitor transitions, nested OOPIF depth, arbitrary third-party providers and fresh upstream model re-export remain unverified.

## Activity log

### 2026-10-26 — Created

Issue created from the supplied project input.

### 2026-10-26 — Status changed from proposed to ready.

### 2026-10-26 — Status changed from ready to in-progress.

### 2026-10-26 — Status changed from in-progress to done.

## Completion summary

Delivered frozen bounded UI cases, integrity-bound local evidence, real fixed Laya decisions and an adapter verified through unchanged frontend layout checks; final contract/full/live suites pass.
