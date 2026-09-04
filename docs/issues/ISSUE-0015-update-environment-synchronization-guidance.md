---
id: ISSUE-0015
title: "Update environment synchronization guidance"
status: done
priority: high
created: 2026-09-04
updated: 2026-09-04
closed: 2026-09-04
related_adrs: []
depends_on: []
---

# ISSUE-0015: Update environment synchronization guidance

## Problem

The sync-ai-environment Skill still describes locked-source synchronization and a separate upgrade command after ai-environment changed to latest-source sync with category selection and confirmation.

## Desired outcome

Align the Skill with category-aware latest-source sync while preserving explicit confirmation, local override, drift, credential, and scheduled-check safety boundaries.

## Acceptance criteria

- [x] Describe latest-source resolution and pre-mutation confirmation as the normal `sync` behavior.
- [x] Document category, all-Skills, individual-Skill, and required-only selection modes without making one category mandatory.
- [x] Remove obsolete fixed-lock and separate-upgrade guidance.
- [x] Preserve target resolution, local source override, drift protection, credential exclusion, and read-only schedule boundaries.
- [x] Pass Skill and repository validation, full tests, encoding checks, and read-only review.

## Out of scope

- Implementing synchronization logic in the Skill instead of the `ai-env` CLI.
- Installing or authenticating plugins, MCP servers, or credentials.

## Decisions

- Keep `sync-ai-environment` as a thin natural-language interface to the CLI.
- Treat interactive confirmation or explicit `--yes` as the required authorization boundary for latest-source updates.

## Implementation notes

Updated the thin Skill interface to describe latest-source resolution, interactive category selection, `--categories`, `--all-skills`, individual selection, `--required-only`, explicit `--yes`, and the retained takeover and safety boundaries. No CLI logic was duplicated in the Skill.

## Verification

quick_validate.py passed; npm run check validated 25 Skills; full npm test, UTF-8, whitespace, and read-only review checks passed.

## Activity log

### 2026-09-04 — Created

Issue created from the supplied project input.

### 2026-09-04 — Status changed from proposed to ready.

### 2026-09-04 — Status changed from ready to in-progress.

### 2026-09-04 — Status changed from in-progress to done.

## Completion summary

Updated sync-ai-environment to guide latest-source synchronization, category or all-Skills selection, and explicit confirmation while retaining existing safety boundaries.
