---
id: ISSUE-0037
title: "Keep frontend-design as compatibility verification alongside Impeccable"
status: done
priority: medium
created: 2026-11-06
updated: 2026-11-06
closed: 2026-11-06
related_adrs: []
depends_on: []
---

# ISSUE-0037: Keep frontend-design as compatibility verification alongside Impeccable

## Problem

Personal consolidation adopts Impeccable for visual design while projects still depend on frontend-design verification APIs; broad duplicate design instructions and a retired UI dependency remain in its entrypoint.

## Desired outcome

Keep all existing verifier interfaces and resources, limit adoption metadata and entrypoint to verification, and route UI control to project-authorized available tooling.

## Acceptance criteria

- [x] Entry metadata and instructions select existing frontend verification rather than duplicate Impeccable design direction.
- [x] Existing checkUI/verifyUIReport/static checker APIs, scripts, assets and references remain unchanged.
- [x] Remove the retired hardcoded UI-tool dependency from the active entrypoint; retain project authorization and real evidence requirements.
- [x] Run Skill structure validation and existing frontend tests; deploy the reviewed source and verify its hash.

## Out of scope

No verifier behavior/API changes, reference deletion, dependency updates or publication.

## Decisions

Reuse the existing frontend verifier contract unchanged. This is an instruction/metadata-only adoption correction: Impeccable owns design; frontend-design is an explicitly selected compatibility checker for existing consumers. No new implementation or module boundary. Existing public API tests are the relevant regression gate; no tests that mirror the prose are added.

## Implementation notes

Changed only adoption prose and agents/openai.yaml, plus the route-work design route. Preserved all existing checker APIs, scripts, assets and references. Installed frontend-design entrypoint/metadata match source hashes; the five engineering packages are selected from the immutable Windows bundle.

## Verification

Skill structure: 28 pass; existing real-browser frontend suite: 16 pass; deployment hashes match. No API implementation changed.

## Activity log

### 2026-11-06 — Created

Issue created from the supplied project input.

### 2026-11-06 — Status changed from proposed to ready.

### 2026-11-06 — Status changed from ready to in-progress.

### 2026-11-06 — Status changed from in-progress to done.

## Completion summary

Keep frontend verification interfaces compatible, make Impeccable the adopted visual owner, remove the obsolete UI dependency and verify deployed source hashes.
