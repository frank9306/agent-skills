---
id: ISSUE-0017
title: "Integrate deep-module gates into engineering Skills"
status: done
priority: high
created: 2026-09-11
updated: 2026-09-11
closed: 2026-09-11
related_adrs: []
depends_on: []
---

# ISSUE-0017: Integrate deep-module gates into engineering Skills

## Problem

The engineering Skills can design and review module boundaries, but implementation preflight lacks concrete depth criteria and architecture review does not prioritize active change hotspots or apply the deletion test.

## Desired outcome

Make code generation and code inspection consistently evaluate deep-module ownership, narrow interfaces, locality, public test seams, and shallow abstractions without forcing architecture work for routine changes.

## Acceptance criteria

- [x] `implement-issue` applies a concise module-depth gate before coding and invokes `design-modules` only when a change introduces or materially reshapes a capability boundary.
- [x] `design-modules` evaluates deletion, interface depth, change locality, prohibited imports, and public behavior tests without equating depth with file size.
- [x] `review-architecture` prioritizes recently changing paths when no subsystem is selected and reports only candidates that pass the deletion test.
- [x] `review-code` checks module depth when a diff adds a capability, public interface, module, or cross-module dependency.
- [x] `tdd` prefers public behavior seams and does not expose internal helpers solely for testing.
- [x] The deep-module criteria have one focused reference, remain conditional, and do not force whole-repository architecture work during routine implementation.
- [x] Every changed Skill passes quick validation and repository checks; encoding and Git whitespace checks pass.

## Out of scope

- Installing or copying the third-party Skill collection.
- Generating HTML architecture reports or depending on Claude-specific exploration tools.
- Replacing the local Issue lifecycle or requiring a directory module for every change.

## Decisions

- Strengthen the existing engineering workflow rather than add a second overlapping architecture Skill.
- Keep implementation-time checks lightweight and use full architecture review as an explicit or periodic read-only workflow.

## Implementation notes

Added an implementation-time module-depth gate under `implement-issue` and linked it from preflight. Strengthened `design-modules` with interface-depth, deletion, locality, prohibited-import, and public-test-seam criteria; strengthened `review-architecture` with recent-change prioritization and the deletion test; strengthened `review-code` for diffs that introduce capabilities or boundaries; and clarified public-seam testing in `tdd`. Reused the existing lifecycle instead of adding an overlapping third-party-style survey Skill.

## Verification

5 个受影响 Skill quick_validate 通过；npm run check（25 Skills）通过；npm test 通过；git diff --check 与 UTF-8 扫描通过；只读审查无 P0/P1。

## Activity log

### 2026-09-11 — Created

Issue created from the supplied project input.

### 2026-09-11 — Status changed from proposed to ready.

### 2026-09-11 — Status changed from ready to in-progress.

### 2026-09-11 — Status changed from in-progress to done.

## Completion summary

将条件式深模块门禁接入实现、模块设计、架构审查、差异审查与 TDD 公共测试接缝。
