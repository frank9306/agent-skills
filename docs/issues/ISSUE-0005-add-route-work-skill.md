---
id: ISSUE-0005
title: "Add route-work skill"
status: done
priority: medium
created: 2026-08-18
updated: 2026-08-18
closed: 2026-08-18
sources: ["task:01a013be-96a9-7ef2-919f-ddc9aa9711fa"]
related_adrs: []
depends_on: []
---

# ISSUE-0005: Add route-work skill

## Problem

Broad development requests can bypass requirement clarification, local Issue readiness gates, diagnosis, or evidence-capture workflows because the repository has no single routing entry point.

## Desired outcome

Provide a lightweight route-work Skill that classifies project work, checks stage gates, and hands off to the appropriate existing Skill without duplicating or executing that Skill workflow.

## Acceptance criteria

- [x] Add a `route-work` Skill that classifies broad project requests and selects exactly one primary existing workflow entry point.
- [x] Route new or ambiguous requirements, ready Issues, reported failures, explicit reviews, meetings, research, durable context, architecture decisions, and uninitialized documentation to their owning Skills.
- [x] Enforce readiness and authorization gates without duplicating or directly performing the selected Skill's workflow.
- [x] Keep routing guidance concise, report missing Skills or decisive ambiguity, and avoid introducing Task or Worker artifacts.
- [x] Add discoverability and installation documentation, valid OpenAI UI metadata, and pass repository validation and tests.

## Out of scope

- Implementing any routed workflow inside `route-work`.
- Creating a task scheduler, worker pool, subagent orchestrator, or new project artifact type.
- Changing the behavior or lifecycle contract of existing Skills.

## Decisions

- Name the Skill `route-work` to describe workflow selection without introducing a second task vocabulary.
- Select one primary entry point per request; describe later stages only as an expected continuation.
- Keep the routing table in the Skill itself because it is small and central to correct operation.

## Implementation notes

Added a concise routing Skill with one primary route per request, explicit readiness and authorization gates, standard OpenAI UI metadata, README discovery and installation entries, and a documented `route-` naming convention. No scripts or assets were added because routing is a procedural selection contract rather than deterministic data transformation.

## Verification

- `python .../skill-creator/scripts/quick_validate.py skills/engineering/route-work` — passed (`Skill is valid!`).
- `npm run check` — passed; 16 Skills validated across 2 categories.
- `npm test` — passed; frontend, web-content, init-docs, manage-issues, and to-adr suites all passed.
- `git diff --check` — passed.
- UTF-8 strict decoding, BOM, and replacement-character checks — passed for every changed text file.
- Read-only review against `ISSUE-0005`, project standards, and the `review-code` rubric found no actionable P0–P3 findings.
- Residual risk: prose routing behavior has no executable runtime seam, so realistic invocation behavior depends on host Skill selection and model instruction following.

## Activity log

### 2026-08-18 — Created

Issue created from the supplied project input.

### 2026-08-18 — Status changed from proposed to ready.

### 2026-08-18 — Status changed from ready to in-progress.

### 2026-08-18 — Status changed from in-progress to done.

## Completion summary

Added route-work as the lightweight workflow-selection entry point without duplicating existing Skill procedures or introducing Task or Worker artifacts.
