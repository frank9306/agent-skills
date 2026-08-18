# Code Review Rubric

Severity:

- P0: data loss, severe security exposure, or failure that makes the release unusable.
- P1: likely incorrect behavior, regression, authorization flaw, or broken compatibility in normal use.
- P2: real defect under a narrower condition, missing important validation, or maintainability problem with a concrete failure path.
- P3: low-impact issue worth fixing but not a release blocker.

Review in this order:

1. Requirement coverage and unintended scope.
2. Correctness, error paths, state transitions, and concurrency.
3. Authentication, authorization, secret handling, and trust boundaries.
4. Persisted data, API, configuration, and migration compatibility.
5. Tests and observability that prove or expose behavior.
6. Documented architecture and coding standards.

Do not praise unaffected code, summarize the diff instead of reviewing it, or inflate speculative concerns into findings.
