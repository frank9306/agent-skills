---
id: ISSUE-0043
title: "Add fix recurrence prevention to project docs"
status: done
priority: medium
created: 2026-11-16
updated: 2026-11-16
closed: 2026-11-16
related_adrs: []
depends_on: []
---

# ISSUE-0043: Add fix recurrence prevention to project docs

## Problem

Projects initialized by init-docs lack a fix-specific step for deciding how to prevent recurrence.

## Desired outcome

Fresh projects receive the rule before final verification, and explicit documentation updates can add it to existing projects while preserving their guidance.

## Acceptance criteria

- [x] Fresh initialization makes the recurrence decision discoverable from root AGENTS.md and a second run is unchanged.
- [x] Explicit updates can add the rule to an existing project while preserving its instructions and skipping equivalent coverage.
- [x] Ordinary initialization still refuses conflicting files, and the update uses documentation only.

## Out of scope

Executable Hooks, new project check tooling, and bulk migration of existing projects.

## Decisions

Keep the reusable rule in the workflow template. Use a short root pointer and a selective edit for explicitly requested updates.

## Implementation notes

Updated the generated root pointer, the workflow template, and the skill's selective update guidance. Applied those same changes to the installed copy used by the current Codex environment.

## Verification

npm run check, npm run test:ai-docs, and quick_validate.py passed. The installed initializer created 12 files and reported 12 unchanged on rerun. A conflict fixture confirmed ordinary initialization refuses writes. A manual selective update of the fixture preserved existing guidance and left one reachable copy of the rule.

## Activity log

### 2026-11-16 — Created

Issue created from the supplied project input.

### 2026-11-16 — Status changed from proposed to ready.

### 2026-11-16 — Status changed from ready to in-progress.

### 2026-11-16 — Status changed from in-progress to done.

## Completion summary

Generated projects discover the recurrence rule before final verification. Explicit workflow updates reuse that rule while preserving existing project guidance.
