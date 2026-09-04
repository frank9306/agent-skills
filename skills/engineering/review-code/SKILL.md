---
name: review-code
description: Review a fixed Git change range against repository standards and the originating local Issue, prioritizing correctness, regressions, security, compatibility, and missing verification. Use when the user asks for code review or when implementation needs a read-only completion gate before closing an Issue.
---

# Review Code Changes

Review only; do not modify files, fix findings, stage, commit, or push.

## Fix the review range

Use the commit, branch, tag, or merge-base supplied by the caller. If none is supplied, infer the tracked default branch only when Git makes it unambiguous; otherwise ask for the base. Record the exact diff command and included commits.

Read the related local Issue, root agent instructions, docs/agents/, Context, relevant ADRs, project standards, and test configuration. Read references/review-rubric.md.

## Review two axes

Standards review checks whether the diff follows documented project rules, established interfaces, data compatibility, security boundaries, and local conventions. For material structural changes, also check for duplicated business knowledge, leaky interfaces, caller-coordinated internal steps, terminology that conflicts with Context, unnecessary pass-through layers, change diffusion across unrelated modules, and tests coupled to internal structure. Report these only when the diff provides a concrete failure or maintenance scenario, not as aesthetic preference.

Requirements review checks whether the diff implements every acceptance criterion, respects out-of-scope boundaries, handles material edge cases, and provides evidence that would fail if the behavior regressed.

Inspect the diff before relying on test results. Treat passing tests as evidence only for behavior they actually cover.

## Report findings

Report only actionable findings, ordered by severity. Give each finding a short title, exact file and tight line range, concrete failure scenario, and why existing verification does not protect against it. Do not report style preferences unless a project standard requires them.

If there are no findings, say so and list residual risks or checks not run. Do not approve Issue closure when a P0 or P1 finding remains or required verification evidence is missing.
