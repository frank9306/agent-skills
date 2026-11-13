---
id: ISSUE-0042
title: "Replace frontend design skill with franks-design"
status: done
priority: medium
created: 2026-11-13
updated: 2026-11-13
closed: 2026-11-13
related_adrs: []
depends_on: []
---

# ISSUE-0042: Replace frontend design skill with franks-design

## Problem

The personal frontend design entry still points to the retired package and its verification scripts.

## Desired outcome

Ship the localized Hallmark skill, remove the retired package, and update active routing and validation.

## Acceptance criteria

- [x] Publish the complete localized Hallmark package with attribution.
- [x] Remove the retired package and active references in both source repositories.
- [x] Validate the package and repository checks.

## Out of scope

Business project migrations and the separate team skill binding. Historical Issues and Changelog entries remain records of their original changes.

## Decisions

Use the locally validated Hallmark 2.0.0 translation as the source package. Replace the personal routing and remove the retired verifier and its repository commands.

## Implementation notes

Copied the complete 187-file package, including the upstream license and pinned provenance. Updated the repository catalog, test entry point and route-work. Updated the personal global rules and usage guide in ai-playbook.

## Verification

npm run check validated 28 skills. npm test passed, including all 23 Hallmark tests with Chrome and 101 reference files checked. ai-playbook passed its 8 sync tests. Local Codex prompts are in sync.

## Activity log

### 2026-11-13 — Created

Issue created from the supplied project input.

### 2026-11-13 — Status changed from proposed to ready.

### 2026-11-13 — Status changed from ready to in-progress.

### 2026-11-13 — Status changed from in-progress to done.

## Completion summary

Adopt franks-design for personal frontend work, with the complete Hallmark localization and its verification suite. Remove the retired skill and active entry points.
