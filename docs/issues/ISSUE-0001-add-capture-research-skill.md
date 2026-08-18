---
id: ISSUE-0001
title: "Add capture-research skill"
status: done
priority: high
created: 2026-08-18
updated: 2026-08-18
closed: 2026-08-18
sources: ["docs/agents/workflow.md"]
related_adrs: []
depends_on: []
---

# ISSUE-0001: Add capture-research skill

## Problem

Project research has a durable docs/research location but no skill owns turning external evidence and experiments into a traceable project record.

## Desired outcome

Provide a capture-research skill that records sourced research and routes confirmed outcomes to ADRs, Issues, or durable context.

## Acceptance criteria

- [x] Add a `capture-research` Skill that writes one dated, topic-named Markdown record under `docs/research/` from supplied research material.
- [x] Require every material claim to retain its source and clearly label source facts, agent inference, and unresolved questions.
- [x] Record conclusions, applicability limits, risks, and open questions without promoting unverified information to project truth.
- [x] Route confirmed architecture decisions to `to-adr`, actionable work to `manage-issues`, and durable domain knowledge to `maintain-context`.
- [x] Add the Skill to repository documentation and pass the repository Skill validator and tests.

## Out of scope

- Fetching private or inaccessible sources without user-provided access.
- Making architecture decisions, creating implementation work, or modifying durable context directly.
- Replacing source documents with an uncited summary.

## Decisions

- Implementation was authorized after project work required a reusable research record rather than a one-time web summary.
- Name the Skill `capture-research` because it imports external evidence into the repository.

## Implementation notes

Implemented the Skill with a concise workflow, an evidence policy reference, a reusable research record template, OpenAI UI metadata, and README discovery and installation entries.

## Verification

skill-creator quick_validate passed; npm run check validated 15 skills; npm test passed all suites; git diff --check passed.

## Activity log

### 2026-08-18 — Created

Issue created from the supplied project input.

### 2026-08-18 — Status changed from proposed to ready.

### 2026-08-18 — Status changed from ready to in-progress.

### 2026-08-18 — Status changed from in-progress to done.

## Completion summary

Added capture-research with a cited research workflow, evidence policy, reusable record template, OpenAI metadata, and README entries.
