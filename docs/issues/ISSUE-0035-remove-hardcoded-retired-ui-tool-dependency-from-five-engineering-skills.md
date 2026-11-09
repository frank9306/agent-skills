---
id: ISSUE-0035
title: "Remove hardcoded retired UI tool dependency from five engineering skills"
status: done
priority: medium
created: 2026-11-04
updated: 2026-11-04
closed: 2026-11-04
related_adrs: []
depends_on: []
---

# ISSUE-0035: Remove hardcoded retired UI tool dependency from five engineering skills

## Problem

Five engineering skill entrypoints hardcode one UI tool that is absent from the authorized target team, leaving misleading calls and broken dependencies.

## Desired outcome

Use project-authorized browser and desktop tooling while retaining evidence, TDD and review requirements; deploy only to the approved Frank team scope through the control project.

## Acceptance criteria

- [x] Remove the six hardcoded retired-tool references from route-work, tdd, review-code, diagnose-bug and implement-issue.
- [x] Route UI work through project-authorized browser/desktop tooling while retaining observable assertions, target/build evidence, test requirements and read-only review scope.
- [x] Validate the five packages and repository structure; retain unrelated working-tree changes.

## Out of scope

Deleting or changing the retired skill itself, global/team installations outside Frank team, business behavior, dependencies and unrelated frontend routing.

## Decisions

Owner authorized the identified remnants to be removed on 2026-11-04. Reusable skills use project-authorized tooling rather than a platform-specific MCP name. Replace obsolete checker references in the same affected paragraphs with the selected design workflow's layout/scroll/focus evidence requirements.

## Implementation notes

Control deployment and verification are tracked by fubufu-agent-control ISSUE-0040. Only the identified paragraphs/table row changed; the existing modified route-work content and other working-tree changes were preserved. Five new native versions replaced seven existing Frank team version selections. Three existing team roles actually read the assigned new versions in bounded read-only native tasks FRA-21/22/23; no business UI acceptance or global installation change was performed.

## Verification

Five quick_validate passes; node scripts/check-skills.mjs passed for 27 skills. Source support files and prior working-tree changes preserved. Native roles FRA-21/22/23 read seven assigned new-version instances and verified hashes; all succeeded/exit0. Instruction-only changes: no business behavior or UI acceptance tests required.

## Activity log

### 2026-11-04 — Created

Issue created from the supplied project input.

### 2026-11-04 — Status changed from proposed to ready.

### 2026-11-04 — Status changed from ready to in-progress.

### 2026-11-04 — Status changed from in-progress to done.

## Completion summary

Removed six retired UI-tool directives from five engineering skills while retaining evidence, TDD and read-only review requirements; deployed only the approved Frank team versions through control ISSUE-0040.
