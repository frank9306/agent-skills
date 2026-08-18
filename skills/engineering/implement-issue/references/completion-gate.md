# Issue Completion Gate

An Issue may become done only when:

- Every acceptance criterion is checked and supported by evidence.
- Each changed behavior has an appropriate automated test, or the documented reason for omission is sound.
- Focused tests and the full relevant suite passed.
- Required typecheck, lint, build, and static checks passed.
- Code review has no unresolved P0 or P1 finding.
- Out-of-scope work did not leak into the diff.
- Implementation notes, verification, and completion summary reflect the actual result.
- No required migration, manual step, or compatibility risk is hidden.

A missing toolchain or environment does not count as a pass. Record the exact skipped command and leave the Issue in-progress or blocked according to whether external action is required.
