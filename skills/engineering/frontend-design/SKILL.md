---
name: frontend-design
description: Design, redesign, refine, review, and verify user interfaces for websites, web apps, and native apps. Use for visual direction, interaction, layout, typography, motion, responsive behavior, accessibility, and UI acceptance.
---

# Frontend Design

Read the brief and project rules. Inspect the running surface and nearby screens, components, and tokens. Reuse the project’s PRODUCT.md, DESIGN.md, or equivalent when available. If the surface cannot run yet, use current code and trusted captures to guide decisions and record any missing acceptance evidence.

## Choose the scope

- **Design or redesign.** Ground the visual direction in the audience, content, and intended action. For marketing, support the decision and next action. For tools, optimize task flow and scanning. For documentation, prioritize reading. For showcases, give the work room to lead. Choose hierarchy, layout, typography, color, imagery, and motion accordingly. Honor the brief and reuse relevant project components and tokens.
- **Targeted refinement.** Preserve the visual identity and existing behavior outside the requested change. Inspect comparable screens, fix shared causes within scope, and check affected consumers.
- **Read-only review.** Inspect and measure the actual surface. Report the issue, its impact, the evidence, and coverage gaps. Keep fixes within a separately authorized implementation request.

Read [layout and scroll](references/layout-scroll.md) for layout and scroll ownership, [responsive and accessibility](references/responsive-accessibility.md) for reflow, zoom, localization, and access, and [design system](references/design-system.md) when defining or extending shared design rules.

## Define and verify acceptance

Before editing, define the actual entry point, action, and expected observable result for each required UI check. Select the viewports, themes, states, and input methods affected by the change. Keep the project’s unit and integration checks alongside UI verification.

Inspect the final render at the relevant sizes and exercise the required actions on the final build. Use authorized, available tools. Native UI needs observations and assertions from the actual window. Record the target and build, checks, observed results, and evidence. Rerun affected checks when relevant inputs change.

For existing browser contracts, read [visual review and executable verification](references/visual-review.md). Reuse checkUI, verifyUIReport, and the existing CLI and report formats. The CLI takes prepared URL states. The static verify-design.mjs scan supplies review leads. Runtime acceptance requires evidence from the actual target.

If any required check lacks passing evidence, state that acceptance is incomplete (「验收未完成」 in Chinese) in the first sentence of the final reply. Keep the Issue in progress or blocked and identify the missing evidence.

See [sources](references/sources.md) for provenance.
