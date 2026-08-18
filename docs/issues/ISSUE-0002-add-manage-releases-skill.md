---
id: ISSUE-0002
title: "Add manage-releases skill"
status: proposed
priority: low
created: 2026-08-18
updated: 2026-08-18
closed:
sources: ["docs/agents/workflow.md"]
related_adrs: []
depends_on: []
---

# ISSUE-0002: Add manage-releases skill

## Problem

Projects that begin formal versioned releases need a consistent local workflow for release readiness, evidence, release records, and Changelog coordination.

## Desired outcome

Provide a manage-releases skill that owns the lifecycle of repository-local release records when formal releases are adopted.

## Acceptance criteria

- [ ] Add a `manage-releases` Skill that owns repository-local release preparation, readiness, publication evidence, and release record lifecycle.
- [ ] Define explicit release states and prevent a release from being marked complete without version, verification, and publication evidence.
- [ ] Keep release records linked to completed Issues and summarize user-visible outcomes from the existing Changelog without duplicating Issue history.
- [ ] Preserve the project's existing versioning, package manager, and publishing conventions instead of imposing a release platform.
- [ ] Add the Skill to repository documentation and pass the repository Skill validator and tests.

## Out of scope

- Publishing a release without explicit user authorization.
- Choosing a versioning policy or release platform for a project that has not adopted one.
- Replacing `manage-issues` or the project Changelog.

## Decisions

- Keep this Issue proposed until the repository performs formal, versioned releases.
- Use the plural `manage-releases` because the Skill owns a collection and its lifecycle.

## Implementation notes

No implementation has started.

## Verification

Not verified.

## Activity log

### 2026-08-18 — Created

Issue created from the supplied project input.

## Completion summary

Not completed.
