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

Do not create separate Spec or Ticket files. Keep desired behavior and acceptance criteria in each self-contained Issue.
