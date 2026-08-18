---
name: tdd
description: Implement or change concrete software behavior through disciplined red-green-refactor loops, one observable slice at a time. Use for feature work and bug fixes when an automated test can provide a reliable feedback loop at a stable public seam.
---

# Test-Driven Development

Build one behavior at a time. Never batch all tests before all implementation.

## Choose the seam

Read the requirement, affected code, existing tests, and project test commands. Select the highest stable public seam that can prove the behavior without coupling the test to internal structure. Read references/test-quality.md before adding a new testing mechanism or mock.

If the change has no meaningful runtime behavior, explain why a new automated test would add no signal and use the project's applicable static or build checks instead.

## Red

Write one focused test for one acceptance behavior. Run the narrowest command that executes it and observe failure for the intended reason. If it passes immediately, prove the test reaches the target behavior or strengthen it; do not count an accidental pass as red.

## Green

Make the smallest production change that satisfies the failing behavior. Run the focused test until it passes. Do not add speculative flexibility, unrelated cleanup, or behavior for later slices.

## Refactor

Refactor only while green. Preserve behavior, keep the public seam stable, and rerun the focused test after each meaningful change. Then select the next behavior and repeat.

## Close the loop

Run affected test files, typechecking or linting required by the project, and the full relevant suite once at the end. Report each red observation, the behavior added, commands actually run, skipped checks, and remaining risks. Never claim TDD if the initial failure was not observed.
