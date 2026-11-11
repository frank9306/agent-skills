---
id: ISSUE-0039
title: "Adopt the cross-platform UI design standard"
status: done
priority: medium
created: 2026-11-11
updated: 2026-11-11
closed: 2026-11-11
related_adrs: []
depends_on: []
---

# ISSUE-0039: Adopt the cross-platform UI design standard

The owner approved a shared Apple HIG foundation with official platform guidance for Web, desktop GUI, and mobile apps. Make the standard mandatory for frontend-design and include applicable rules in final-build acceptance.

## Acceptance criteria

- [x] Cover Web, macOS, Windows, iOS, iPadOS, and Android with official sources and clearly identified Web defaults.
- [x] Require the installed Skill to read the standard and verify applicable requirements.
- [x] Validate the Skill package and confirm that both installed files match the source.

## Verification

`git diff --check` passed and `node scripts/check-skills.mjs` validated 28 Skills. Checked the installed reference path and its local links. SHA-256 matched for the installed entry and standard.

## Completion summary

Published the cross-platform standard to the current Codex installation through frontend-design.
