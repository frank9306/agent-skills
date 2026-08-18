# Business Correctness

Write the operation as states, transitions, preconditions, side effects, and recovery before judging whether the UI is correct.

- Identify the authority for every rule: product requirement, API contract, backend enforcement, or existing tested behavior.
- Cover empty data, duplicate actions, partial failure, concurrent changes, stale permissions, deleted records, and interrupted flows.
- Disablement is interaction feedback, not authorization or concurrency control.
- Preserve user input when recovery is possible and make destructive outcomes explicit.
- For multi-step operations, define which steps are atomic, compensating, retryable, or manually recoverable.
- Check whether success UI reflects confirmed server state or an explicitly reversible optimistic state.

Use a transition table for non-trivial workflows. Tests must assert forbidden transitions and recovery, not only successful clicks. Label any rule without authoritative evidence as a question, not a finding.
