# Issue Completion Gate

An Issue may become done only when:

- The shared [pre-generation module design gate](module-depth-gate.md) passed with a recorded design or valid reuse reference before implementation and behavior-test generation.
- Every acceptance criterion is checked and supported by evidence.
- Each changed behavior has an appropriate automated test, or the documented reason for omission is sound.
- Focused tests and the full relevant suite passed.
- Required typecheck, lint, build, and static checks passed against the final inputs, including project-owned structure and full delivery checks.
- New modules, exports, and dependencies are covered by the architecture contract and rules; no source root escapes classification or checking.
- Rule, exclusion, and exact legacy-baseline changes were reviewed as contract changes rather than used to conceal new violations.
- Code review has no unresolved P0 or P1 finding.
- Out-of-scope work did not leak into the diff.
- Implementation notes, verification, and completion summary reflect the actual result.
- No required migration, manual step, or compatibility risk is hidden.

A missing toolchain, timeout, environment failure, or check whose inputs changed while it ran does not count as a pass. Exhausting automatic Hook retries also does not satisfy this gate. Record the exact skipped command and leave the Issue in-progress or blocked according to whether external action is required.
