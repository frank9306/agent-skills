---
name: design-modules
description: Design or reshape module boundaries, ownership, and public interfaces before implementation when a change materially affects cross-module behavior, persistence ownership, or architectural seams. Do not use for routine changes inside an established boundary.
---

# Design Modules

Design the smallest stable boundary that keeps related knowledge together and makes future changes local.

## Ground the design

Read the requirement or Issue, root agent instructions, project Context, relevant ADRs, affected interfaces, callers, persistence code, and tests. Reuse the project's canonical domain terms and established boundaries unless evidence shows they no longer fit.

Identify the behavior being added, the knowledge required to implement it, and the component that should own that knowledge. Treat a new abstraction as justified only when it hides meaningful complexity or protects a stable seam.

## Shape the module

Define:

- One clear responsibility and authoritative owner for each business rule.
- A small public interface expressed in domain terms.
- Internal state, algorithms, and dependencies that callers should not know.
- Error, lifecycle, concurrency, and compatibility behavior visible at the boundary.
- A stable public seam through which the behavior can be tested.

Prefer change locality over file-count reduction. Avoid interfaces that expose storage schemas, force callers to coordinate internal steps, duplicate policy across modules, or add pass-through layers without hiding knowledge.

Evaluate the proposed module's depth explicitly:

- Identify its single discoverable public entry and the smallest useful input, output, and failure contract.
- State which sequencing, intermediate data, framework details, and failure handling become internal knowledge.
- Apply the deletion test: removing a shallow abstraction should concentrate knowledge behind the proposed interface, not merely spread its code across callers.
- Name the likely future changes that should remain local while the public contract stays stable.
- Identify imports or dependency directions that callers must not use to bypass the owner.
- Define a public behavior test that protects the seam without exposing an internal helper solely for testability.

Do not infer depth from a long file, a large class, many internal files, or short functions. A directory or wrapper whose interface is nearly as complex as the implementation is still shallow.

Stress-test the proposed boundary with a new rule, a changed persistence or third-party detail, a failure path, and a second caller. Revise it when those changes would spread unnecessarily, expose internal sequencing, or bypass the owner.

## Hand off the design

Return the proposed ownership, public interface, hidden decisions, dependencies, test seam, compatibility constraints, and rejected alternatives. Keep the result proportional to the decision; do not create a separate design artifact unless the project workflow requires one.

Do not implement code. Record a confirmed, lasting boundary decision through `$to-adr` when available and authorized. Return unresolved behavior to `$grill-me`; do not decide product policy from architectural preference.
