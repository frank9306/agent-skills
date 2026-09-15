---
id: ISSUE-0018
title: "Add screenshot fidelity gates to frontend-design"
status: done
priority: high
created: 2026-09-15
updated: 2026-09-15
closed: 2026-09-15
related_adrs: []
depends_on: []
---

# ISSUE-0018: Add screenshot fidelity gates to frontend-design

## Problem

The frontend-design Skill can accept visually similar screenshot reproductions without quantitative geometry, asset, stability, or perceptual fidelity gates.

## Desired outcome

Synchronize the validated Screenshot fidelity workflow, manifest contract, deterministic comparison CLI, and regression tests into the source repository.

## Acceptance criteria

- [x] `frontend-design` routes screenshot and design-source reproduction through a mandatory quantitative fidelity workflow.
- [x] The Skill includes a reusable manifest contract, deterministic Playwright capture, perceptual comparison, geometry and asset gates, diagnostic artifacts, and stale-report protection.
- [x] Focused Python and existing Node tests pass, including 3px anchor drift, missing assets/fonts, weak thresholds, unjustified masks, coverage gaps, capture stability, and stale reports.
- [x] Repository-wide Skill validation and tests pass without unrelated changes.

## Out of scope

- Changing the example frontend implementation or accepting its current fidelity regression.
- Adding a hosted visual-testing service or downloading replacement design assets.

## Decisions

- Preserve the existing `frontend-design` structure and add progressive-disclosure reference and script resources.
- Use Pillow for local perceptual comparison and target-project Playwright for deterministic Chromium capture.
- Treat the current Shadcn UI reference as external regression evidence; do not copy that project-specific baseline into this reusable Skill repository.

## Implementation notes

- Synchronized the validated global Skill changes into `skills/engineering/frontend-design/`.
- Added the Screenshot fidelity route, detailed reference, manifest example, deterministic capture helper, comparison CLI, and eight Python tests.
- Added the Python fidelity tests to the repository-owned `test:frontend` command after read-only review identified that CI would otherwise omit them.

## Verification

8 Python fidelity tests, 3 Node frontend tests, quick_validate, npm run check (25 Skills), full npm test, git diff --check, and read-only review passed.

## Activity log

### 2026-09-15 — Created

Issue created from the supplied project input.

### 2026-09-15 — Status changed from proposed to ready.

### 2026-09-15 — Status changed from ready to in-progress.

### 2026-09-15 — Implemented and verified

Synchronized the high-fidelity workflow and closed the automated verification and review gates.

### 2026-09-15 — Status changed from in-progress to done.

## Completion summary

Added deterministic, quantitative screenshot fidelity gates to frontend-design and integrated their regression tests into the repository test suite.
