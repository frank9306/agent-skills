---
id: ISSUE-0021
title: "Retire init-project and design-modules skills"
status: done
priority: high
created: 2026-10-13
updated: 2026-10-13
closed: 2026-10-13
related_adrs: []
depends_on: []
---

# ISSUE-0021: Retire init-project and design-modules skills

## Problem

The owner no longer uses the scaffold and standalone module-design Skills; active callers and documentation still reference them.

## Desired outcome

Remove both Skills from source and local discovery, clean active dependencies and handbook/global instructions, and preserve historical records.

## Acceptance criteria

- [x] Both Skill packages are removed from the source repository and active local discovery.
- [x] Remaining Skills and generated project instructions no longer call or require either retired Skill.
- [x] ai-playbook catalogs 23 source Skills and its managed global instructions have no retired call sites.
- [x] Related validation passes, historical records remain intact, and the bounded retirement is synchronized through the previously authorized GitHub publication flow.

## Out of scope

No removal of unrelated Skills, archived backups or historical Issues; no business-project refactors or new replacement Skill.

## Decisions

The user's singular design-module refers to the installed design-modules package. Retain project-owned contracts and verification; resolve module questions through the project workflow instead of requiring a standalone design Skill. Continue the previously authorized GitHub synchronization for this reorganization.

## Implementation notes

Removed all eight package files from source and the corresponding shared local installations, then removed only verified empty directories. Cleaned README entries/install commands, route-work, implementation/TDD/architecture-review references, the module contract gate, init-checks references and its generated AGENTS.md text. Updated ai-playbook's catalog, development guide, deep-module guide and global instruction source. Eight surviving installed Skill files and five already-managed Codex Homes were synchronized with backups. Historical Issues, Changelog entries and archived backups remain intact.

## Verification

23 Skills validated; six initialization tests and eight synchronization tests passed; 177 active text files and local links checked; five Codex Homes synchronized; remote commits and 23-Skill source tree verified.

## Activity log

### 2026-10-13 — Created

Issue created from the supplied project input.

### 2026-10-13 — Status changed from proposed to ready.

### 2026-10-13 — Status changed from ready to in-progress.

### 2026-10-13 — Status changed from in-progress to done.

## Completion summary

Removed init-project and design-modules from source and local discovery, cleaned active callers and managed instructions, and synchronized both repositories to GitHub.
