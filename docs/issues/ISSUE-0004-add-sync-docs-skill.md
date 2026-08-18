---
id: ISSUE-0004
title: "Add sync-docs skill"
status: proposed
priority: low
created: 2026-08-18
updated: 2026-08-18
closed:
sources: ["docs/agents/workflow.md"]
related_adrs: []
depends_on: []
---

# ISSUE-0004: Add sync-docs skill

## Problem

Projects with recurring divergence between implementation and documentation need a safe way to detect discrepancies and update documentation from verified facts.

## Desired outcome

Provide a sync-docs skill that reconciles project documentation with verified code and test evidence without inventing project truth.

## Acceptance criteria

- [ ] Add a `sync-docs` Skill that compares selected project documentation with verified code, configuration, tests, and accepted ADRs.
- [ ] Report contradictions and ambiguous ownership before editing instead of silently choosing a source of truth.
- [ ] Update only documentation claims supported by current evidence while preserving historical meeting, Issue, ADR, and Changelog records.
- [ ] Record changed claims, their supporting evidence, unresolved discrepancies, and intentionally untouched files.
- [ ] Avoid broad prose rewrites when a smaller factual correction restores consistency.
- [ ] Add the Skill to repository documentation and pass the repository Skill validator and tests.

## Out of scope

- Treating generated documentation or agent inference as authoritative without verification.
- Rewriting historical records to match current implementation.
- Modifying implementation merely to make it agree with documentation.

## Decisions

- Keep this Issue proposed until documentation drift becomes recurrent rather than an isolated correction.
- Require an explicit sync scope so the Skill does not rewrite the entire documentation tree by default.

## Implementation notes

No implementation has started.

## Verification

Not verified.

## Activity log

### 2026-08-18 — Created

Issue created from the supplied project input.

## Completion summary

Not completed.
