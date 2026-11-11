---
id: ISSUE-0038
title: "Unify personal frontend design and acceptance"
status: done
priority: medium
created: 2026-11-11
updated: 2026-11-11
closed: 2026-11-11
related_adrs: []
depends_on: []
---

# ISSUE-0038: Unify personal frontend design and acceptance

## Problem

Personal Codex used two entries for frontend design and UI verification. The owner approved a single frontend-design workflow.

## Acceptance criteria

- [x] The new entry covers design, targeted refinement, and read-only review with final-build acceptance.
- [x] Existing checker APIs, CLI, contract, and report formats remain compatible.
- [x] Global instructions, route-work, and the personal handbook use the unified entry.
- [x] Current Codex files match source and the standalone Impeccable folder is outside active Skill discovery.

## Verification

Skill structure validation passed for 28 Skills. The existing frontend suite passed all 16 tests using installed Chrome and Playwright, including CLI report generation and stale evidence rejection. The instruction synchronization suite passed all 8 tests. The installed prompt passed its consistency check and all four changed Skill files matched source hashes. The former standalone installation was moved to the task's local backup.

## Completion summary

Consolidated personal frontend design and acceptance in frontend-design. The checker implementation and team-specific Skill bindings retain their existing scope.
