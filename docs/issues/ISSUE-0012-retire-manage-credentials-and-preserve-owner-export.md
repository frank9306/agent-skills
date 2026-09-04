---
id: ISSUE-0012
title: "Retire manage-credentials and preserve owner export"
status: done
priority: high
created: 2026-09-01
updated: 2026-09-01
closed: 2026-09-01
related_adrs: []
depends_on: []
---

# ISSUE-0012: Retire manage-credentials and preserve owner export

## Problem

The owner no longer wants manage-credentials to store personal information and requires a verified local plaintext export before removing vault data and the Skill from Hermes, local clones, and GitHub.

## Desired outcome

One owner-only local JSON export preserves all decryptable records; vault data and keys are removed from Hermes and local storage; tracked vault data and manage-credentials source are removed and pushed without mixing unrelated work.

## Acceptance criteria

- [x] Export every decryptable vault entry to `E:\private-store\credential-export-20260901.json` without printing plaintext to command output, chat, logs, or any repository.
- [x] Restrict the export to the current Windows user and verify its JSON structure, entry count, unique names, and successful decryption before deleting any source.
- [x] Remove vault entries, manifest, and master key from Hermes and the local `frank-store` clone after export verification.
- [x] Remove tracked vault data from `frank9306/frank-store@main` and verify the remote no longer exposes current vault files.
- [x] Remove `manage-credentials` from Hermes and the local `agent-skills` clone.
- [x] Commit and push only the `manage-credentials` deletion to `frank9306/agent-skills@main`, preserving unrelated Cloudflare worktree changes and keeping the local retirement record uncommitted with the existing documentation work.
- [x] Verify Hermes remains healthy after retirement and no temporary plaintext or migration files remain.

## Out of scope

- Rewriting Git history or force-pushing either repository.
- Removing unrelated Hermes Skills, personal data, or uncommitted Cloudflare work.
- Retaining plaintext on the NAS or in Git.

## Decisions

- The sole retained plaintext copy is the owner-only Windows file `E:\private-store\credential-export-20260901.json`.
- The owner explicitly authorized destructive cleanup across Hermes, local clones, and current GitHub `main` branches on 2026-09-01.

## Implementation notes

Exported 11 records directly over SSH from the Hermes vault to the owner-only Windows file without creating a plaintext NAS file. After verification, removed the live Hermes vault manifest, encrypted entry files, master key, Skill source/link, Skill backup, and prompt snapshot. Removed current tracked vault data plus its migration report from `frank-store`, and removed the Skill source from `agent-skills`. Existing unrelated Cloudflare worktree changes were not staged or committed.

## Verification

Verified ACL-restricted JSON export SHA-256 C428E9F52E41E958EB2F3BCD27C6425E1F234303E0E05AF011EA0AC1AA8BC2FE; frank-store main 1ef4f5f and agent-skills main ad19b58 match origin; targeted Hermes paths are absent and container/channel health recovered.

## Activity log

### 2026-09-01 — Created

Issue created from the supplied project input.

### 2026-09-01 — Status changed from proposed to ready.

### 2026-09-01 — Status changed from ready to in-progress.

### 2026-09-01 — Status changed from in-progress to done.

## Completion summary

Exported and verified 11 owner records locally, then removed current vault data and manage-credentials from Hermes, local clones, and GitHub without rewriting history.
