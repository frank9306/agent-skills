---
name: implement-issue
description: Implement one repository-local Issue that is ready for work, driving behavior through TDD, running project verification, reviewing the resulting Git changes, and returning evidence to the Issue without automatically committing. Use when the user asks to build or complete a specific docs/issues/ISSUE-NNNN file.
---

# Implement a Local Issue

Implement exactly one ready Issue. Do not reopen settled scope or combine unrelated work.

## Preflight

Read the Issue, root agent instructions, docs/agents/, Context, relevant ADRs, affected code, tests, and Git status. Read references/completion-gate.md.

Require $manage-issues, $tdd, and $review-code to be available. If any is missing, stop and report the missing Skill instead of silently replacing its workflow.

Require:

- Status is ready.
- Every dependency names a done Issue.
- Problem, desired outcome, and acceptance criteria are concrete.
- The requested behavior fits the stated scope.

When the Issue introduces a module, changes a public interface, moves business rules across boundaries, changes persistence ownership, or adds material cross-module behavior, require `$design-modules` to be available and use it before the first TDD slice. Routine behavior inside an established boundary does not need a separate design pass.

Preserve unrelated uncommitted changes. If they overlap the required files and cannot be isolated safely, stop and report the collision.

Use $manage-issues to transition the Issue to in-progress and record the start.

## Implement one vertical slice at a time

Map acceptance criteria to observable behaviors. Use $tdd for each behavior that can be automated. Keep changes inside the Issue boundary, run focused feedback frequently, and update implementation notes when a discovery changes the approach without changing scope.

If implementation reveals a missing product decision or materially different scope, stop before guessing and return to $clarify-requirements. Route confirmed durable knowledge to $maintain-context and lasting technical decisions to $to-adr.

## Verify and review

Run every project check required by the Issue and repository, then the full relevant suite. Invoke $review-code against the fixed pre-implementation Git base and this Issue.

Address confirmed review findings that are within scope, rerun affected verification, and repeat review until no P0 or P1 finding remains. Do not conceal residual P2 or P3 findings; record them.

For a material boundary change, confirm that each new business rule has one authoritative owner, public interfaces do not leak unnecessary implementation details, and automated tests exercise stable seams rather than internal structure.

## Close or stop honestly

Use $manage-issues to mark acceptance checkboxes, record exact commands and results, write the completion summary, and transition to done only when the completion gate passes. This transition owns the Changelog update.

For an external blocker, record the blocker and transition to blocked. For incomplete code or failing checks that still need engineering work, leave the Issue in-progress and report the next failing command.

Do not stage, commit, push, publish, deploy, or migrate production data unless the user explicitly requests that separate action.
