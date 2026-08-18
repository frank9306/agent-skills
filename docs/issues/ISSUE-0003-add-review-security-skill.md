---
id: ISSUE-0003
title: "Add review-security skill"
status: proposed
priority: medium
created: 2026-08-18
updated: 2026-08-18
closed:
sources: ["docs/agents/workflow.md"]
related_adrs: []
depends_on: []
---

# ISSUE-0003: Add review-security skill

## Problem

Projects handling authentication, authorization, payments, secrets, or sensitive data need a focused read-only security review workflow.

## Desired outcome

Provide a review-security skill that reports concrete, locatable, and verifiable security findings without silently remediating them.

## Acceptance criteria

- [ ] Add a read-only `review-security` Skill for changes or systems involving authentication, authorization, payments, secrets, or sensitive data.
- [ ] Report each finding with severity, affected location, exploit or failure scenario, supporting evidence, and a concrete verification method.
- [ ] Cover trust boundaries, access control, secret handling, input validation, dependency exposure, and sensitive-data lifecycle when applicable.
- [ ] Separate confirmed vulnerabilities from uncertain risks and explicitly report the reviewed scope and unreviewed areas.
- [ ] Do not modify code, dependencies, credentials, or security configuration unless a separate remediation task is explicitly authorized.
- [ ] Add the Skill to repository documentation and pass the repository Skill validator and tests.

## Out of scope

- Penetration testing against systems without explicit authorization.
- Automatic remediation, dependency upgrades, secret rotation, or production configuration changes.
- Claiming comprehensive security certification from a bounded code review.

## Decisions

- Keep this Issue proposed until a project handles a listed sensitive capability or explicitly requests a security review.
- Keep review and remediation separate so findings remain auditable and changes require explicit authorization.

## Implementation notes

No implementation has started.

## Verification

Not verified.

## Activity log

### 2026-08-18 — Created

Issue created from the supplied project input.

## Completion summary

Not completed.
