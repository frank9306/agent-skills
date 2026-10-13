---
id: ISSUE-0019
title: "Add project-owned deep-module checks and Codex feedback"
status: in-progress
priority: high
created: 2026-10-13
updated: 2026-10-13
closed:
sources: []
related_adrs: []
depends_on: []
---

# ISSUE-0019: Add project-owned deep-module checks and Codex feedback

## Problem

Existing deep-module guidance has no reusable project-owned structural checks or Codex and CI feedback loop.

## Desired outcome

Ship init-checks for TypeScript and Python and integrate enforced project contracts into existing engineering Skills without ai-environment.

## Acceptance criteria

- [x] Existing Skills and documentation templates route authorized implementation through project structure contracts and verified checks.
- [x] init-checks safely initializes TypeScript and Python check templates, project Hooks, and optional CI without overwriting user changes.
- [x] Real dependency engines reject private imports, aliases/types, dependency cycles/directions, export drift, and unscanned source.
- [x] Native hook adapters detect worktree input changes, run quick/full checks, and cap failed Stop continuations at two.
- [x] Exact legacy baselines cannot hide new violations and stale entries fail.
- [ ] Reference fixtures demonstrate pass/fail/restored-pass; Windows and Linux checks and independent review evidence are recorded.

## Out of scope

No ai-environment changes, broad business-repository migration, global hook installation, or remote repository-policy changes. Committing and publishing were excluded from the original implementation request and subsequently authorized separately by the owner during the reorganization follow-up.

## Decisions

Reuse native dependency engines; project contracts own semantics. Native Hook trust and required CI protection are owner-controlled prerequisites. Semantic module depth still requires design and review.

## Implementation notes

Prior interrupted work was preserved. Both dependency-engine adapters and references were already present. Reorganization added the missing Node-only Hook adapter, shared observable Hook acceptance tests, initialization/idempotency/conflict tests, and generated-project integration tests. The full suite now includes init-checks, with the pinned Python test dependency recorded in requirements-dev.txt. The adapters' behavior was verified using synthetic Hook stdin; actual client event delivery and trust are still pending.

## Verification

Windows publication verification: `npm run check` and `npm test` passed with INIT_CHECKS_PYTHON selecting the existing isolated Import Linter 2.15 environment (111 passed, one existing frontend test skipped). The full suite includes all six initialization tests, including TypeScript and Python generated projects with real checks, public behavior assertions, deliberate private-import failure and restored success. The checker suites cover TypeScript aliases/types, public exports, dependency directions/cycles, source coverage and exact baselines; Python uses the actual pinned engine. Both Hook adapter suites passed 13 tests each. The Skill validator passed for 25 Skills. No native Codex trust/event, Linux, executed remote CI, required-check policy or independent-review evidence is claimed. The Issue remains in-progress until the final acceptance item is satisfied.

## Activity log

### 2026-10-13 — Created

Issue created from the supplied project input.

### 2026-10-13 — Status changed from proposed to ready.

### 2026-10-13 — Status changed from ready to in-progress.

## Completion summary

Templates and Windows executable verification are implemented. Native integration, Linux and independent rollout verification remain incomplete; do not describe this Issue as done or all projects as protected.
