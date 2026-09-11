---
name: review-architecture
description: Review a repository or bounded subsystem for evidence-backed architecture problems that increase change cost or obscure ownership. Report prioritized candidates only; do not refactor code or replace diff-based code review.
---

# Review Architecture

Survey the requested codebase or subsystem and identify the few structural problems most worth investigating.

## Fix the scope

Read root agent instructions, project Context, relevant ADRs and Issues, dependency manifests, module entry points, representative callers, persistence boundaries, and tests. State the inspected scope and important areas not inspected.

When the user does not select a subsystem and Git history is available, inspect recent changed paths before choosing representative flows. Prioritize active capabilities where a deeper boundary could reduce recurring change cost; do not recommend restructuring dormant code merely because it looks untidy.

Do not infer architecture from directory names alone. Trace representative behavior across its actual call, data, and dependency paths before reporting a finding.

## Assess structural evidence

Look for:

- One business rule or policy duplicated across owners.
- Small changes that predictably require coordinated edits across unrelated modules.
- Public interfaces that leak storage, transport, framework, or internal sequencing details.
- Callers coordinating steps that should be owned behind one boundary.
- Cycles, temporal coupling, hidden global state, or unclear dependency direction.
- Pass-through abstractions that add indirection without hiding knowledge.
- Domain terminology that conflicts with project Context or changes meaning across modules.
- Important behavior that has no stable, observable test seam.

Distinguish confirmed evidence from hypotheses. Do not report aesthetic preferences, generic best practices, or a large-module finding without demonstrating the change cost it causes.

Apply the deletion test before reporting a shallow-module candidate. The candidate qualifies only when removing or absorbing the current abstraction would allow related policy, sequencing, state, or failure handling to sit behind a smaller stable interface. If deletion would only duplicate or scatter implementation across callers, the abstraction is providing real leverage and should not be reported as shallow.

## Report candidates

Order findings by expected impact and confidence. For each, provide exact code evidence, recent-change evidence when used, the change scenario it makes difficult, the knowledge or responsibility lacking one owner, the deletion-test result, a candidate boundary or seam, compatibility constraints, and the smallest useful next investigation.

This Skill is read-only: do not modify code, create Issues, or record ADRs unless the user separately authorizes that action. Use `$review-code` for a fixed Git change range; use `$design-modules` after the user selects a candidate that needs a concrete boundary design.
