# Testing Reliability

Choose the smallest layer that can prove observable behavior: pure-rule tests, component interaction tests, contract tests, and browser tests for critical integrated flows.

- Cover empty, permission, validation, duplicate submission, timeout, cancellation, partial failure, retry, rollback, and out-of-order response cases where applicable.
- Prefer roles, names, labels, and user-visible outcomes over DOM structure, CSS classes, internal state, or implementation calls.
- Make mocks conform to recorded fixtures, schemas, generated clients, or contract tests; include realistic error shapes and latency control.
- Control time and request order deterministically for debounce, retry, race, and optimistic-update tests.
- Assert recovery and final state, not merely that an error appeared.
- Keep critical authorization and business-rule enforcement tested on the server; frontend tests cannot prove those boundaries.

Report missing cases against reachable product states. Test-file counts and coverage percentages alone do not establish useful protection.
