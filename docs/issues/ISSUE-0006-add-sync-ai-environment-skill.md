---
id: ISSUE-0006
title: "Add sync-ai-environment skill"
status: done
priority: high
created: 2026-08-26
updated: 2026-08-26
closed: 2026-08-26
related_adrs: []
depends_on: []
---

# ISSUE-0006: Add sync-ai-environment skill

## Problem

Users need a reusable natural-language entry point for initializing, checking, synchronizing, and upgrading the public ai-environment manager without embedding its implementation in the Skills repository.

## Desired outcome

Add a focused sync-ai-environment Skill and make the repository validator support the existing and new Skill categories.

## Acceptance criteria

- [x] Add a valid, focused `sync-ai-environment` Skill under an `environment` category with OpenAI UI metadata.
- [x] Route initialize, check, sync, upgrade, recommend, doctor, and schedule intents to the corresponding public `ai-env` command.
- [x] Require target discovery, plan visibility, local-change protection, and explicit authorization before mutation; never handle credentials.
- [x] Keep the Skill as a thin interface and do not copy the environment manager implementation into this repository.
- [x] Update repository discovery, installation documentation, and validation so `security` and `environment` categories are supported.
- [x] Pass Skill validation and the full repository test suite.

## Out of scope

- Implementing environment synchronization inside the Skill.
- Bundling AGENTS.md, plugins, MCP configuration, or credentials in this repository.

## Decisions

- Name the Skill `sync-ai-environment` to follow the repository's action-oriented naming standard.
- Keep automatic discovery enabled and require confirmation at the point of mutation.
- Link to the public `frank9306/ai-environment` repository as the implementation source.

## Implementation notes

Added the instruction-only environment entry Skill and OpenAI UI metadata. Expanded the repository validator's supported categories to include the pre-existing security category and the new environment category, and updated public discovery and installation documentation.

## Verification

Skill validation, npm run check, npm test, isolated npx installation, and git diff --check passed.

## Activity log

### 2026-08-26 — Created

Issue created from the supplied project input.

### 2026-08-26 — Status changed from proposed to ready.

### 2026-08-26 — Status changed from ready to in-progress.

### 2026-08-26 — Status changed from in-progress to done.

## Completion summary

Added the thin sync-ai-environment Skill, supported security and environment categories, and documented installation without coupling the Skills repository to the environment manager implementation.
