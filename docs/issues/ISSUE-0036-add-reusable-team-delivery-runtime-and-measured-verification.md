---
id: ISSUE-0036
title: "Add reusable team delivery runtime and measured verification"
status: done
priority: high
created: 2026-11-04
updated: 2026-11-04
closed: 2026-11-04
related_adrs: []
depends_on: []
---

# ISSUE-0036: Add reusable team delivery runtime and measured verification

## Problem

Repeated tool discovery, context loading, manual evidence packaging and ad hoc test orchestration slow Frank team delivery.

## Desired outcome

A reusable delivery CLI and concise skill provide reliable tool checks, session-aware context deltas, immutable evidence handoffs and staged verification; independently validate real use and elapsed times.

## Acceptance criteria

- [x] A dependency-free Node CLI executes declared slice/module/delivery checks with fixed executable resolution, exact exit status, private complete logs, bounded summaries and measured durations; delivery cannot filter out required gates.
- [x] Context reads are scoped to project/task/session/agreement and document content hashes; mandatory inputs are always returned, reset/changed inputs reload, deferred content is never marked read, and independent roles do not inherit each other's read receipts.
- [x] Immutable evidence bundles include every declared input (including new source files), check receipt and hashes; receivers reject drift, tampering, missing files, unsafe paths and stale receipts. Creation is idempotent and never overwrites an accepted bundle.
- [x] Reusable browser helpers support real background contrast and batched assertions without Node-only globals; staged tests retain mandatory final checks and independent QA.
- [x] Deploy a fixed native skill version and concise three-role instructions, preserve other selected skills/configuration, and verify actual native role use and independent QA.
- [x] Record real normal/repair/resume timings with fixed inputs/checks and distinguish controlled helper measurements, native Agent overhead and unproved full-project estimates.

## Out of scope

Business feature edits, old-company changes, global personal installation, permissions/model/concurrency changes, dependency installation/upgrades, removal of independent QA or acceptance requirements, Git staging/commits/branches/pushes and site publication. Keep check-delivery read-only. Do not claim the historical 80–95 minute budget has been proved by a smaller replay.

## Decisions

Owner accepted the previously discussed four-part plan in the fubufu-agent-control chat on 2026-11-04, explicitly retaining independent QA and existing acceptance standards. Control ISSUE-0031 owns platform rollout/evidence; this Issue owns the implementation. Team prompt sources remain ai-playbook; upstream Impeccable remains unchanged.

### Pre-generation module design — 2026-11-04

| Item | Contract |
| --- | --- |
| Responsibility | `team-delivery` owns mechanical execution, context read receipts and immutable evidence identity; project plans own actual commands/required checks; native task records own authorization and QA verdicts. |
| Public interface | `scripts/team-delivery.mjs preflight/check/context/freeze/verify/browser-kit` with explicit project, reviewed plan, private output, task/session/agreement and stage arguments. JSON success/error output and nonzero exit on failure. It never accepts a delivery or changes native task state. |
| Hidden implementation | Resolve Node to its actual executable; spawn argv without a shell; preserve logs and duration; compute declared input identity; atomically update scoped context receipts; seal bundles only after source/receipt validation. No automatic test-pass cache or automatic environment repair. |
| Dependencies | CLI → private runtime/context/evidence modules → Node standard library. Browser helper source is self-contained Playwright code, with no imports/require/process. No new third-party dependencies or project toolchain changes. |
| File map | SKILL.md and agents/openai.yaml; scripts/team-delivery.mjs; scripts/lib/{io,runtime,context,evidence}.mjs; scripts/browser-kit.js; references/plan.md; tests/team-delivery.test.mjs and a bounded measurement script. Supporting implementation is not injected into model context. |
| Verification | Public CLI/API with real temporary filesystem and child processes: required gate omission, failed/timeout checks, source drift; context new/reset/changed/oversize/cross-session cases; new-file capture/tampering/unsafe paths/idempotency; actual team native read/use and independent QA. Node test runner, node --check, scripts/check-skills.mjs and ai-playbook's existing checks. No architecture checker is installed here; this scoped design does not claim one. |

Caller walkthrough: developer preflights a reviewed project plan, runs slice feedback then required delivery checks, freezes receipt-bound inputs and gives bundle ID/path to QA. QA verifies immutable/current inputs and executes its own checks in a separate output directory, using the same mechanical helpers; its native identity/verdict remains independently reviewable. A resumed actor reads mandatory current authorization and only relevant changed/unseen documents; a missing session or deferred document reloads. A failed or stale check cannot produce a valid accepted receipt; drift/tampering stops the handoff without overwriting existing data.

## Implementation notes

Before generation, captured source prompt bytes/hashes and three repository worktree states in a private maintenance directory. Existing uncommitted work is the baseline; add one new skill and narrowly edit current team instructions, with no reset or staging. Use skill-creator for packaging and write-agent-docs for role instructions; TDD proceeds one public behavior at a time.

## Verification

4 regression tests, 11 independent QA cases, 28-skill validation, ai-playbook 8 tests, actual native developer/QA/chief and same-final-gate timing completed.

## Activity log

### 2026-11-04 — Created

Issue created from the supplied project input.

### 2026-11-04 — Status changed from proposed to ready.

### 2026-11-04 — Status changed from ready to in-progress.

### 2026-11-04 — Status changed from in-progress to done.

## Completion summary

Implemented and deployed fixed team-delivery for all three roles; independent review, adversarial checks and real browser validation passed; bounded measured savings recorded.
