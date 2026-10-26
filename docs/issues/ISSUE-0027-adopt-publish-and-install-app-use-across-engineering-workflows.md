---
id: ISSUE-0027
title: "Adopt publish and install app-use across engineering workflows"
status: done
priority: high
created: 2026-10-26
updated: 2026-10-26
closed: 2026-10-26
related_adrs: []
depends_on: [ISSUE-0024, ISSUE-0025, ISSUE-0026]
---

# ISSUE-0027: Adopt publish and install app-use across engineering workflows

## Problem

Existing Skills and global instructions do not route application UI work consistently.

## Desired outcome

Integrate workflows, preserve testing rules, publish verified changes and install locally.

## Acceptance criteria

- [x] Integrate route-work, implement-issue, diagnose-bug, frontend-design, tdd and review-code with narrow app-use pointers.
- [x] Preserve installed 2026-10-23 global rules while adding default UI routing in ai-playbook source and usage guide.
- [x] Final checks/review and scope-only commit/push; install changed Skills and synchronize current Codex Home with backups and hash verification.

## Out of scope

No phones, macOS/Linux UI, pixel baseline engine, general Canvas recognition, business-site writes, profile export, system services or unrelated repository changes.

## Decisions

### Pre-generation module design — 2026-10-26

Instruction owner remains each existing Skill; app-use owns execution semantics, frontend-design owns layout rules, tdd owns red-green-refactor, review-code remains read-only. ai-playbook prompts/global/AGENTS.md owns personal global instructions, scripts/sync-prompts.mjs owns preview/backup/sync. Read local copies and diff against source before install; preserve unknown local customization. Publish/install only after relevant acceptance; incomplete integrations stay explicitly open. No branch/PR/system service/store publication.

Scope and product choices are confirmed by the owner handoff in this chat. The four vertical slices share this recorded contract.

## Implementation notes

Added narrow app-use entrypoints to the six existing Skills, preserving their original ownership, authorization and tests. Added package test entrypoints and the source catalog. ai-playbook now has an adoption guide/catalog/workflow link and merges the complete installed 2026-10-23 global body before adding one UI default rule. No installed rule was lost. Publication is in progress; no branch/PR or force push.

## Verification

2026-10-26: agent-skills npm test PASS (127), npm run check PASS (24), quick_validate PASS, final real desktop/browser/Laya suites PASS (2 each); exact evidence is in ISSUE-0026. Six installed Skill copies compared to tracked pre-change source: no unknown customization or extra files. Backed them up at C:/Users/frank/AppData/Local/app-use/backups/skills-20261026-210522, copied 7 Skills (including new app-use), and verified every installed file SHA-256. Installed app-use CLI doctor confirms the actual final current-user broker/normal Chrome connection. The unpacked bridge currently loads the same verified extension bytes from this source checkout; no phone-pilot path is required at runtime.

ai-playbook node --check and 8 real filesystem sync tests PASS; changed local links and UTF-8 checked. Preview targeted only C:/Users/frank/.codex. Existing scripts/sync-prompts.mjs --agent codex --home C:/Users/frank/.codex --apply --overwrite wrote an exact-byte backup AGENTS.md.ai-playbook-1793019924274-6dcc7257-b6f6-4144-b55f-c165bc8d6e4c.bak; --check returns in-sync. Every bullet in the previous installed global body is preserved. Current instruction refresh includes the new UI rule; no claim is made for other agents/accounts.

Read-only fixed-base review covers the six narrow Skill pointers, test/case evidence ownership, source/manual separation and sync changes. No remaining P0/P1 in the tested scope; ESM/C# architecture scan, Edge and DPI transitions remain explicit gaps. Fetch found ai-playbook remote additions; preserve both histories through ordinary merge and rerun its checks before publication.

Publication verified on 2026-10-26: agent-skills implementation commit 49d1c63c238c4d4687f3566286bf5316fdcc3e88 pushed to origin/main and confirmed with git ls-remote. ai-playbook task commit 1292525 was merged normally with remote e0e8ade (only a date conflict, resolved to 2026-10-26; every remote rule preserved), producing 66a63d3bda946d17c7765fbe6d83ba2ffe035eda. It was pushed and its remote hash confirmed. Eight sync tests, node syntax and --check=in-sync reran after the merge. No branch switch, force push or PR. Both worktrees were clean after those pushes. The credential helper printed a stale-helper warning but authenticated push and remote hash verification succeeded; no Git configuration was modified.

## Activity log

### 2026-10-26 — Created

Issue created from the supplied project input.

### 2026-10-26 — Status changed from proposed to ready.

### 2026-10-26 — Status changed from ready to in-progress.

### 2026-10-26 — Status changed from in-progress to done.

## Completion summary

Integrated app-use across six engineering Skills, published both repositories, preserved and synchronized global rules, installed seven verified Skill copies with backups; remaining platform/check gaps are explicit.
