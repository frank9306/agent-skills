---
name: clarify-requirements
description: Clarify a project idea, meeting outcome, feature request, or ambiguous local Issue through focused questioning until it is ready to become one or more self-contained local Issues. Use before implementation when goals, behavior, boundaries, edge cases, decisions, or acceptance criteria remain unresolved.
---

# Clarify Requirements

Resolve uncertainty before creating work. Do not implement code or invent answers for product decisions.

## Ground the discussion

Read root agent instructions, docs/agents/, docs/context/CONTEXT.md, relevant meetings, Issues, ADRs, and affected code. Investigate discoverable repository facts yourself; ask the user only for preferences, priorities, and decisions that evidence cannot settle.

Read references/questioning.md and maintain a frontier of unresolved branches. Ask one focused question at a time unless a small group of tightly coupled choices is easier to answer together. Lead with a recommendation and explain only the tradeoff that changes the decision.

## Stress-test the requirement

Resolve:

- The problem, audience, and desired outcome.
- Observable behavior and representative examples.
- Failure, empty, permission, concurrency, and compatibility cases that matter.
- In-scope and out-of-scope boundaries.
- Constraints from Context, ADRs, existing interfaces, and persisted data.
- Concrete acceptance criteria and verification evidence.

Separate facts, user decisions, assumptions, and unresolved questions. Challenge contradictions explicitly.

Identify the canonical domain terms used by the requested behavior and check them against Context. When ambiguous terminology, concept boundaries, relationships, or invariants could materially change behavior or design, use `$model-domain` if available before declaring the requirement ready. Route only confirmed durable knowledge to `$maintain-context`.

## Finish with an Issue-ready brief

Stop only when no unresolved branch can materially change implementation or acceptance. Return a concise brief containing problem, desired behavior, acceptance criteria, out of scope, decisions, assumptions, sources, and any natural vertical split.

Do not create a separate Spec. When the user wants the work recorded, hand the brief to `$manage-issues` to create one self-contained Issue or several independent Issues. Propose `$maintain-context` or `$to-adr` only when confirmed durable knowledge or a lasting technical decision emerged.
