---
name: maintain-context
description: Maintain verified, durable project domain knowledge in docs/context/CONTEXT.md, including terminology, concept boundaries, relationships, and business invariants. Use when meetings, Issues, implementation evidence, or user confirmation establishes knowledge that future project work must consistently understand.
---

# Maintain Project Context

Keep docs/context/CONTEXT.md concise, factual, and useful beyond the current task.

## Establish evidence

Read the proposed source plus the relevant Issue, meeting record, implementation, tests, existing Context, and ADRs. Read references/evidence-policy.md before deciding whether information is durable. Distinguish explicit user or source confirmation from model inference.

If sources conflict, stop and report the conflict with links. Do not choose a winner silently.

## Update the domain model

Add or revise only:

- Canonical domain terms and definitions.
- Boundaries between commonly confused concepts.
- Relationships between domain concepts.
- Business invariants and meaningful exceptions.
- Explicitly rejected synonyms when they cause recurring ambiguity.

Preserve useful existing prose. Make the smallest coherent edit and cite the local source when the fact would otherwise be hard to trace.

Do not add task progress, debugging notes, complete meeting summaries, speculative statements, code-change history, commands, or technical decisions that belong in ADRs.

## Verify

Re-read the affected Issue and ADRs for contradictions. Search the project for terminology that makes the new definition obviously false. Report the changed terms, supporting evidence, conflicts checked, and anything intentionally left unresolved.
