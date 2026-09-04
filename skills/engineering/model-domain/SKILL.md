---
name: model-domain
description: Discover and stress-test domain terminology, concept boundaries, relationships, and invariants when ambiguous language would materially affect requirements or code design. Use maintain-context only after the resulting knowledge is confirmed.
---

# Model Domain

Build a precise shared language before ambiguous concepts spread into requirements, interfaces, and code.

## Establish the evidence

Read root agent instructions, existing Context and ADRs, relevant Issues, source material, code, and tests. Separate established facts, user decisions, code evidence, model inference, and open questions. Never treat the current implementation as proof of intended business meaning.

Start from the terms people already use. Identify synonyms, overloaded names, hidden state transitions, unclear ownership, and concepts that are being represented only as technical fields or flags.

## Stress-test the model

For each material concept, clarify:

- Its canonical name and concise definition.
- What it includes, excludes, and is commonly confused with.
- Its identity, lifecycle, state transitions, and owner.
- Relationships to adjacent concepts.
- Business invariants, meaningful exceptions, and failure cases.

Test the vocabulary with concrete scenarios, including empty, invalid, permission, concurrency, retry, and historical-data cases when relevant. Challenge a term when two people could reasonably use it to mean different things or when the same rule would acquire multiple owners.

Ask the user only for domain decisions that repository evidence cannot settle. Do not invent terminology merely to make the model appear complete.

## Return confirmed and unresolved knowledge

Report the proposed glossary, boundaries, relationships, invariants, supporting evidence, conflicts, and unresolved questions. State which items are confirmed and which remain hypotheses.

Use `$maintain-context` when available and authorized to record only confirmed durable knowledge. Use `$to-adr` for confirmed technical decisions. Return unresolved behavior that changes acceptance criteria to `$clarify-requirements` rather than encoding it in Context or code.
