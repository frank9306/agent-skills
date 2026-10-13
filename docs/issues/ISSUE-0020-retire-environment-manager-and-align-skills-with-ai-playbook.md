---
id: ISSUE-0020
title: "Retire environment manager and align skills with ai-playbook"
status: blocked
priority: high
created: 2026-10-13
updated: 2026-10-13
closed:
sources: ["codex://threads/01a132ec-ae48-7aa0-a3a6-1c9d65f799ec"]
related_adrs: []
depends_on: []
---

# ISSUE-0020: Retire environment manager and align skills with ai-playbook

## Problem

Obsolete environment management and stale skill listings conflict with the new ai-playbook source of truth; prior deep-module work is incomplete.

## Desired outcome

Remove retired environment skill, correct skill discovery and verification, and document the development workflow in ai-playbook while preserving prior work.

## Acceptance criteria

- [x] Retired environment Skill is removed from source and active local discovery; stale credential listings are removed.
- [x] ai-playbook owns global instructions, development/deep-module/adoption guidance, and an accurate Skill catalog without copying executable Skills.
- [ ] Local environment manager is removed only after Git and instruction migration checks; remote deletion follows the owner's explicit scope decision.
- [x] Prior deep-module work is preserved; incomplete integration is disclosed and relevant executable checks are verified.
- [x] Skill validation, applicable tests, documentation links, and migration consistency are checked; Git publication follows explicit owner authorization.

## Out of scope

No business-project migrations, new global environment manager, login-state copying, unrequested publication, branch changes, or remote protection-policy changes. The owner subsequently authorized committing and pushing the prepared changes to both repositories.

## Decisions

ai-playbook owns personal Agent documentation and the global instruction source; agent-skills remains the installable Skill implementation source. Project-owned contracts and engineering records remain with their projects. Preserve historical Issues and Changelog entries. Owner explicitly authorized permanent remote repository deletion and, after the 403 response, adding the required delete_repo scope through official GitHub authorization.

## Implementation notes

Removed sync-ai-environment from source and shared local discovery, removed stale manage-credentials listings and the obsolete category, refreshed development guidance, and added project setup/usage/retirement documentation in ai-playbook. Updated eight related installed Skills (44 files initially, plus subsequent task-owned corrections) with backups. Migrated all five registered Codex Homes with original-byte backups and checked consistency; deleted old state/target-registration files. No old Windows daily-check task was found. Local recursive repository deletion was rejected by automatic approval with only 'blocked by policy'; the directory is retained and the denial was not bypassed. After owner-authorized delete_repo scope expansion and official device authorization, `gh repo delete frank9306/ai-environment --yes` completed successfully; a subsequent repository API request returned 404. Fixed continuation of authorized in-progress Issues without duplicate creation or invalid same-state transitions.

## Verification

Publication verification: 25 Skills across three categories passed validation. Windows npm test passed (111 passed, one pre-existing frontend test skipped), including six generated-project initialization tests. ai-playbook: node syntax check and eight real filesystem synchronization tests passed. The 64 changed/new UTF-8 files were checked for common credential signatures, encoding defects and local Markdown links without findings. All five global targets passed sync-prompts --check during migration. Prior uncommitted work was preserved during cleanup; committing and pushing are now separately authorized by the owner. No branch or remote policy changes were made. Native Hook, Linux and executed remote CI evidence remain tracked in ISSUE-0019.

## Activity log

### 2026-10-13 — Created

Issue created from the supplied project input.

### 2026-10-13 — Status changed from proposed to ready.

### 2026-10-13 — Status changed from ready to in-progress.

### 2026-10-13 — Status changed from in-progress to blocked.

### 2026-10-13 — Publication authorized

The owner requested synchronizing the prepared agent-skills and ai-playbook changes to GitHub. This authorizes staging, committing and pushing this bounded work on their existing main branches. Local old-directory cleanup and the remaining ISSUE-0019 rollout checks remain incomplete; publication does not close either Issue.

## Completion summary

Local ai-environment recursive deletion was rejected by automatic approval (blocked by policy); remove the retained local directory manually or explicitly revise that acceptance criterion. Remote deletion, Skill retirement and instruction migration are verified.
