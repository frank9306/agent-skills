---
name: tdd
description: Implement or change concrete software behavior through disciplined red-green-refactor loops, one observable slice at a time. Use for feature work and bug fixes when an automated test can provide a reliable feedback loop at a stable public seam.
---

# Test-Driven Development

Build one behavior at a time. Never batch all tests before all implementation.

## Choose the seam

Read the requirement, affected code, existing tests, project-owned module boundaries, and project test/check commands. Before writing behavior tests or implementation, apply the shared [pre-generation module design gate](../implement-issue/references/module-depth-gate.md), reusing any valid design already recorded by the owning workflow. Select the highest stable public seam in that contract. Read references/test-quality.md before adding a new testing mechanism or mock.

If this Skill is installed alone and the sibling reference is missing, read its [canonical source](https://github.com/frank9306/agent-skills/blob/main/skills/engineering/implement-issue/references/module-depth-gate.md) before implementation; an unavailable reference is a missing prerequisite, not permission to skip the gate.

When an owning module already exists, exercise its supported public entry. Do not export an internal helper or make implementation state public solely to make a narrow unit test convenient; prefer observable behavior at the module seam.

If the change has no meaningful runtime behavior, explain why a new automated test would add no signal and use the project's applicable static or build checks instead.

## Red

Write one focused test for one acceptance behavior. Run the narrowest command that executes it and observe failure for the intended reason. If it passes immediately, prove the test reaches the target behavior or strengthen it; do not count an accidental pass as red.

## Green

Make the smallest production change that satisfies the failing behavior. Run the focused test until it passes. Do not add speculative flexibility, unrelated cleanup, or behavior for later slices.

## Refactor

Refactor only while green and within the recorded contract; the shared design gate owns material contract revisions. Preserve behavior and rerun the focused test after each meaningful change. Then select the next behavior and repeat.

## Close the loop

When the change needs browser/desktop acceptance, use [app-use](../app-use/SKILL.md) at a meaningful UI milestone after the focused behavior is green. Freeze the case and literal goal assertions before replay, then return evidence to the owning workflow. This complements stable unit/integration tests; do not replace them or run the full UI suite on every red-green cycle.

Run affected test files, typechecking or linting required by the project, and the full relevant suite once at the end. Report each red observation, the behavior added, commands actually run, skipped checks, and remaining risks. Never claim TDD if the initial failure was not observed.
