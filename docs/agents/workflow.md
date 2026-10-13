# AI Engineering Workflow

Use these sources of truth:

- `docs/meetings/`: what a meeting established, questioned, or assigned.
- `docs/issues/`: why work exists, its acceptance criteria, progress, and verification.
- `docs/changelog/`: completed or cancelled outcomes, linked to Issues.
- `docs/context/CONTEXT.md`: stable domain language and business invariants.
- `docs/adr/`: accepted, lasting technical decisions.
- `docs/handoffs/`: temporary cross-session continuation state.
- `docs/research/`: cited investigation artifacts.

Preserve source facts separately from agent inference. Promote information only after it is verified: meeting input to an Issue, stable domain knowledge to Context, and accepted technical decisions to ADRs. Store actual implementation history in code, tests, and Git.

Use the engineering flow:

- New or ambiguous work: clarify requirements, then create one or more local Issues.
- Ready Issue: implement one Issue through TDD and read-only code review.
- Reported failure: diagnose the root cause, then create a proposed Issue for the fix.

When terminology or concept boundaries materially affect behavior, model the domain before finalizing requirements and promote only confirmed durable knowledge to Context. Before generating implementation or behavior tests, apply the shared [pre-generation module design gate](../../skills/engineering/implement-issue/references/module-depth-gate.md). Reuse the project's valid design record; the gate owns applicability and required design evidence, so do not copy its checklist into this workflow. Prefer the installed implement-issue reference when available, otherwise read the linked source; unavailable instructions must be reported before implementation. Architecture review remains a separate read-only survey and produces candidates rather than automatic refactors.

Before implementation, read the project-owned architecture contract and fast/full check commands when present. Use `init-checks` when establishing missing checks is requested; documentation initialization alone does not install them. Update owners, public exports, allowed dependencies, infrastructure access, and test boundaries with material boundary changes. Run fast structure checks during implementation and the full project verification against final inputs before completion. Do not weaken rules, exclusions, or legacy exceptions merely to pass; review deliberate contract changes with the code.

Continue to the next stage while the original user-authorized goal remains incomplete. A design or newly created Issue does not complete an implementation request; discussion and design alone do not authorize implementation. Projects using another tracker retain that lifecycle and the same conditional design, structure-check, and review gates without requiring this documentation workspace.

Do not create separate Spec or Ticket files. Keep desired behavior and acceptance criteria in each self-contained Issue.
