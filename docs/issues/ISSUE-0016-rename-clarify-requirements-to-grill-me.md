---
id: ISSUE-0016
title: "Rename clarify-requirements to grill-me"
status: done
priority: medium
created: 2026-09-10
updated: 2026-09-10
closed: 2026-09-10
related_adrs: []
depends_on: []
---

# ISSUE-0016: Rename clarify-requirements to grill-me

## Problem

The owner wants a more expressive name for the requirement clarification Skill.

## Desired outcome

Rename the Skill to grill-me and update active references while preserving behavior and historical records.

## Acceptance criteria

- [x] Rename the directory, frontmatter, heading, display name, and invocation to grill-me.
- [x] Update active documentation and cross-Skill references; preserve historical records.
- [x] Preserve the questioning workflow, supporting resources, and explicit-only invocation policy.
- [x] Pass Skill validation, repository checks, encoding checks, and read-only review.

## Out of scope

Global Skill installation or synchronization, Git publication, and behavioral changes.

## Decisions

The owner selected grill-me. Use Grill Me as the display name and retain the existing functional description.

## Implementation notes

Renamed the Skill folder, frontmatter, heading, display name, and default invocation. Updated README, naming guidance, and four referring Skills. Preserved historical Issue text and all workflow content and supporting resources.

## Verification

quick_validate.py passed; npm run check passed for 25 Skills; git diff --check passed. Byte comparison against HEAD confirmed all renamed resources retain their contents except name substitutions; UTF-8 and line endings verified. Read-only review of git diff HEAD and new files found no actionable issues; remaining old names occur only in historical or rename-tracking records. Full runtime tests were not needed for this name-only change.

## Activity log

### 2026-09-10 — Created

Issue created from the supplied project input.

### 2026-09-10 — Status changed from proposed to ready.

### 2026-09-10 — Status changed from ready to in-progress.

### 2026-09-10 — Status changed from in-progress to done.

## Completion summary

Renamed clarify-requirements to grill-me with matching display metadata, installation examples, naming guidance, and cross-Skill references.
