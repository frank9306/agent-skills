---
id: ISSUE-0014
title: "Improve AI-friendly engineering skills"
status: done
priority: high
created: 2026-09-04
updated: 2026-09-04
closed: 2026-09-04
related_adrs: []
depends_on: []
---

# ISSUE-0014: Improve AI-friendly engineering skills

## Problem

The engineering workflow has strong issue, TDD, review, and documentation gates but lacks explicit module-design, active domain-modeling, repository-wide architecture review, and agent-facing writing guidance.

## Desired outcome

Add narrowly scoped, naming-compliant Skills for those gaps and integrate them conditionally into the existing workflow without duplicating current lifecycle Skills.

## Acceptance criteria

- [x] Add naming-compliant `design-modules`, `model-domain`, `review-architecture`, and `write-agent-docs` Skills with concise discovery metadata and clear scope boundaries.
- [x] Keep exploration, durable context maintenance, architecture assessment, code review, and implementation as separate responsibilities without duplicating existing lifecycle Skills.
- [x] Integrate the new Skills conditionally into `clarify-requirements`, `implement-issue`, `review-code`, and `route-work` at the relevant stage gates.
- [x] Update repository discovery and installation documentation for every new Skill.
- [x] Validate all changed Skills, run repository checks and tests, and check text encoding and Git whitespace integrity.

## Out of scope

- Replacing the repository's local Issue workflow with Matt Pocock's workflow.
- Copying third-party Skill instructions verbatim or installing the complete third-party Skill collection.
- Refactoring unrelated Skills or modifying the existing Cloudflare and credential-retirement work.

## Decisions

- Follow `docs/skill-naming.md`: use action-oriented `<verb>-<artifact>` names instead of `codebase-design`, `domain-modeling`, `improve-codebase-architecture`, or `writing-for-agents`.
- Use `design-modules` for bounded design decisions, `model-domain` for active concept discovery, `review-architecture` for read-only codebase assessment, and `write-agent-docs` because agent documentation is an established compound artifact.
- Trigger module design only when a change materially affects module ownership, public interfaces, persistence ownership, or cross-module behavior.

## Implementation notes

Added four independent engineering Skills using the repository's action-oriented naming convention. Extended the naming standard with `model-`, `design-`, and `write-`; added conditional routing and implementation gates; strengthened structural checks in code review; and updated workflow, discovery, and installation documentation. No scripts or references were added because each workflow is concise and procedural.

## Verification

All eight affected Skills passed quick_validate.py; npm run check passed for 24 Skills; npm test passed; focused UTF-8, BOM, replacement-character, whitespace, naming, and read-only review checks passed.

## Activity log

### 2026-09-04 — Created

Issue created from the supplied project input.

### 2026-09-04 — Status changed from proposed to ready.

### 2026-09-04 — Status changed from ready to in-progress.

### 2026-09-04 — Status changed from in-progress to done.

## Completion summary

Added four naming-compliant AI-friendly engineering Skills and integrated them conditionally into the existing requirement, implementation, review, routing, and documentation workflow.
