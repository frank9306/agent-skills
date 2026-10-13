---
name: implement-issue
description: Implement one ready repository-local Issue or resume one authorized in-progress Issue, driving behavior through TDD, project verification, and review without automatically committing. Use for an explicitly authorized implementation or continuation request whose matching local Issue is unambiguous. Do not infer implementation authorization from discussion or design.
---

# Implement a Local Issue

Implement or resume exactly one actionable local Issue. Do not reopen settled scope or combine unrelated work.

## Preflight

Read the Issue, root agent instructions, docs/agents/, Context, relevant ADRs, affected code, tests, and Git status. Read the project-owned architecture contract, boundary configuration, and fast/full verification commands; use `.architecture.json` and `.codex/checks.json` when the project has adopted `init-checks`, otherwise use its existing equivalents. Read references/completion-gate.md. Before generating implementation code or behavior tests, apply the shared [pre-generation module design gate](references/module-depth-gate.md).

Require $manage-issues, $tdd, and $review-code to be available. If any is missing, stop and report the missing Skill instead of silently replacing its workflow.

Require:

- Status is ready for new implementation, or in-progress for an authorized continuation of the same scope.
- Every dependency names a done Issue.
- Problem, desired outcome, and acceptance criteria are concrete.
- The requested behavior fits the stated scope.

Require the shared gate to pass with a recorded project design or a valid existing-contract reuse reference. Reuse that decision when handing off to $tdd; do not run a second design lifecycle or maintain a separate checklist here.

Confirm that structure checks cover every affected source root, public export, and dependency direction. If the requested implementation includes establishing missing checks, use `$init-checks`; otherwise report the missing contract or check as a verification gap instead of silently installing governance.

Preserve unrelated uncommitted changes. If they overlap the required files and cannot be isolated safely, stop and report the collision.

Use $manage-issues to transition a ready Issue to in-progress and record the start. When resuming an in-progress Issue, read its implementation and verification notes, inspect the actual worktree, and record continuation without attempting an invalid same-state transition. Do not discard prior work or assume its checks passed.

## Implement one vertical slice at a time

Map acceptance criteria to observable behaviors. Use $tdd for each behavior that can be automated. Keep changes inside the Issue boundary, run focused feedback frequently, and update implementation notes when a discovery changes the approach without changing scope. When adding a module, public export, or dependency, update the project-owned architecture contract and rules with the design. Run fast structure checks after meaningful edits; do not require the full suite after every partial TDD edit.

If implementation reveals a missing product decision or materially different scope, stop before guessing and return to $grill-me. Route confirmed durable knowledge to $maintain-context and lasting technical decisions to $to-adr.

## Verify and review

Run every project check required by the Issue and repository, including the fast structure check and full delivery check, then the full relevant suite. Require a fresh pass against the final inputs; missing tools, timeouts, or input changes during a check are not a pass. Do not widen exclusions, add baseline exceptions, or weaken dependency/export rules merely to make checks pass. Review an intentional contract change as part of the implementation. Invoke $review-code against the fixed pre-implementation Git base and this Issue.

Address confirmed review findings that are within scope, rerun affected verification, and repeat review until no P0 or P1 finding remains. Do not conceal residual P2 or P3 findings; record them.

For a material boundary change, confirm that each new business rule has one authoritative owner, public interfaces do not leak unnecessary implementation details, and automated tests exercise stable seams rather than internal structure.

## Close or stop honestly

Use $manage-issues to mark acceptance checkboxes, record exact commands and results, write the completion summary, and transition to done only when the completion gate passes. This transition owns the Changelog update.

For an external blocker, record the blocker and transition to blocked. For incomplete code or failing checks that still need engineering work, leave the Issue in-progress and report the next failing command.

Do not stage, commit, push, publish, deploy, or migrate production data unless the user explicitly requests that separate action.
