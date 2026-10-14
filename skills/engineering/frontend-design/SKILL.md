---
name: frontend-design
description: Design, extend, repair, or review interfaces for product-specific aesthetics, consistent components, layout, scrolling, responsive behavior, and accessibility. Use for new visual directions, existing-screen improvements, or UI quality checks.
---

# Frontend Design

Deliver an interface whose choices serve the product and whose declared behavior is checked in a real browser. Project identity and observable usability guide the work; familiar styles can be deliberate and novel styles can be wrong.

## 1. Observe

Read project instructions, Git state, the affected surface, tokens, sibling components, layout shell and verification entrypoints. Inspect the running UI or supplied screenshots when available. User requirements lead; project decisions and implementations follow; this skill supplies the method.

For a visual complaint, name the defect and affected viewport/state. Record the repair target, adjacent behavior to preserve and evidence of improvement. A read-only review remains read-only; missing DESIGN.md is a finding, not a reason to stop inspecting.

**Complete:** current behavior, relevant owners and available evidence are identified. Separate observed defects, inferred risks and unverified behavior.

## 2. Frame the task

Choose the applicable branches and load their references:

| Task | Read when this branch applies |
|---|---|
| New product or uncertain visual direction | [Design philosophy](references/design-philosophy.md) |
| Extend a product or change shared visual rules | [Design system](references/design-system.md) |
| Repair or review a templated-looking interface | [Anti-slop review](references/anti-slop.md) |
| Components, feedback or state transitions | [Interface implementation](references/frontend-engineering.md) and [Interaction/content](references/interaction-content.md) |
| Layout, scrolling, sticky regions or overlays | [Layout and scroll](references/layout-scroll.md) |
| Responsive behavior, zoom, localization or accessibility | [Responsive/accessibility](references/responsive-accessibility.md) |
| Data-dense/chart surfaces | [Data visualization](references/data-visualization.md) |

Before generating implementation, runnable prototypes or behavior tests, read the shared [pre-generation module gate](../implement-issue/references/module-depth-gate.md); reuse an existing valid record. If installed alone, use its [canonical source](https://github.com/frank9306/agent-skills/blob/main/skills/engineering/implement-issue/references/module-depth-gate.md).

An established product's same-class components supply the direction. For a new direction, build two or three structurally different runnable prototypes with realistic content in the intended application context. Let the user select or combine them; record why. Respect a session preference for images or direct implementation instead. Prototype shortcuts do not become production code by default.

**Complete:** user, primary job, hierarchy and direction are settled; material choices are resolved. General architecture, API, security and dependency audits return to the project's engineering workflow.

## 3. Establish the contract

Keep durable visual decisions and source pointers in DESIGN.md for new products or lasting system changes. Local repairs reuse valid tokens and components. Use the [Markdown template](assets/DESIGN.template.md) when needed. A project adopting Google's format uses its actual schema and checks instead.

Name the runtime token authority, canonical variants and shell. State content-growth, wrapping, reflow, scrolling and overlay behavior for the affected surface. Read [layout and scroll](references/layout-scroll.md) before changing those behaviors. Small repairs need the relevant contract, not a new documentation system.

**Complete:** expected behavior and authority are concrete enough to test, including viewports, themes, content states and reasoned exceptions.

## 4. Design and implement

Read-only reviews skip this implementation step and report proposed repairs. In verification, inspect and measure within the authorized read-only scope without applying fixes.

Use the product's material, vocabulary and real content to determine composition. Reuse components and semantic tokens. Expressive emphasis serves the primary task; supporting surfaces stay coherent. Distinguish sample content from facts, testimonials and business results.

Preserve the established stack and public behavior. Build reachable loading, empty, partial, failure and permission states with useful next actions. Fix shared causes at their owner and inspect affected consumers instead of tuning each screenshot independently.

**Complete:** the interface and reachable states are implemented within the contract. Project feedback has no unresolved task-caused failure.

## 5. Verify in the browser

Read [visual review and executable verification](references/visual-review.md). Exercise the declared matrix, long content, narrow and low-height layouts, keyboard focus, actual scrolling and overlays. Use project browser tests; `checkUI(page, contract)` supplies reusable assertions without owning authentication or data setup. The CLI supports already-prepared URL states.

When browser access is unavailable, complete the other authorized work and mark runtime checks unverified.

Review actual screenshots against the brief. In implementation tasks, repair consequential defects, then rerun affected checks. Repeated numerical tuning without improvement calls for re-examining structure. Static `scripts/verify-design.mjs <project> --json` yields review leads only. Project visual regression uses approved rendered baselines; baseline changes are design decisions.

**Complete:** every declared check has measured evidence or an explicit gap. Missing tooling, readiness failures and untouched states are unverified. Image resemblance is not a pass criterion; browser evidence does not verify pure native UI.

## 6. Hand off evidence

Report separately: design-system consistency; layout/scroll/interaction results; screenshot-based aesthetic judgment; and project visual regression when configured. Include checked scope, changes, commands, evidence paths and remaining gaps. Revalidate file-bound reports after inputs change.

Return results to the owning workflow. Installing this skill does not configure project dependencies, Hooks or CI. Provenance and deliberate departures from upstream defaults live in [sources](references/sources.md).

**Complete:** the user and owning workflow can locate the evidence, scope and remaining gaps.
