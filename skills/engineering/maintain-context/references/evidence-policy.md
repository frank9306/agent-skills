# Context Evidence Policy

Promote information into Context only when all are true:

1. It is supported by an explicit user confirmation, a confirmed source record, or verified system behavior.
2. It will remain useful beyond the current Issue.
3. It describes the domain rather than implementation progress.
4. It does not contradict an accepted ADR or another unresolved source.

Strong evidence includes accepted requirements, confirmed meeting decisions, tests that encode a business invariant, and behavior verified against the running system. Model inference, a single code name, an unfinished proposal, and a temporary workaround are not sufficient by themselves.

When a source is later disproved, update Context and identify the evidence that invalidated the old statement. Context records current truth, not decision history.
