---
id: ISSUE-0007
title: "Streamline AI environment update authorization"
status: done
priority: high
created: 2026-08-26
updated: 2026-08-26
closed: 2026-08-26
related_adrs: []
depends_on: []
---

# ISSUE-0007: Streamline AI environment update authorization

## Problem

The sync-ai-environment Skill pauses on ordinary managed-file drift even when the user explicitly requests updating the current AI environment to the latest version and authorizes overwrite.

## Desired outcome

Treat an explicit update-to-latest-with-overwrite request as complete authorization for the detected current Codex Home, run through without intermediate confirmation, and report what changed and where after verification.

## Acceptance criteria

- [x] Treat an explicit request to update the current AI environment to the latest version with overwrite as complete authorization for the detected Codex Home and planned managed-file changes.
- [x] Do not pause for ordinary managed-file drift or confirmation flags after that authorization; stop only for execution failure, secret handling, or changes outside the detected Codex Home and planned scope.
- [x] Require a post-update check and report what changed and the target Codex Home after completion.
- [x] Preserve explicit authorization requirements for requests that do not authorize overwrite or do not identify the intended target sufficiently.
- [x] Pass Skill validation and the repository checks.

## Out of scope

- Changing the `ai-environment` CLI implementation.
- Automatically installing or authenticating plugins and MCP servers.
- Synchronizing credentials, login state, tokens, cookies, or secret environment-variable values.

## Decisions

- Interpret update-to-latest plus overwrite language as full authorization for the current detected Codex Home and the planned managed-file changes.
- Report the plan before execution when available, but do not wait for another confirmation after complete authorization has already been given.

## Implementation notes

Updated the Skill's control-preservation rules so an explicit update-to-latest-with-overwrite request authorizes the complete planned update without intermediate confirmation. Retained hard stops for execution failures, secrets, out-of-target paths, and plan expansion, and added post-update verification and reporting requirements.

## Verification

Skill validation, npm run check, npm test, and git diff --check passed.

## Activity log

### 2026-08-26 — Created

Issue created from the supplied project input.

### 2026-08-26 — Status changed from proposed to ready.

### 2026-08-26 — Status changed from ready to in-progress.

### 2026-08-26 — Status changed from in-progress to done.

## Completion summary

Streamlined sync-ai-environment so an explicit request to update the current AI environment to the latest version with overwrite authorizes the full planned update without intermediate confirmation, followed by verification and a concise report of changes and target location.
