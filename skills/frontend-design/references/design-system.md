# Design System

Use `DESIGN.md` as durable project memory: the Skill stores the method; the project stores its design decisions.

## Discover before defining

Extract evidence from tokens, CSS variables, Tailwind configuration, component variants, theme files, screenshots, and repeated patterns. Do not invent a clean-room system when a coherent one already exists.

## Maintain three token layers

1. Primitive tokens describe raw values such as palette steps and numeric scales.
2. Semantic tokens describe intent such as `action-primary`, `surface-raised`, or `text-muted`.
3. Component tokens describe durable component decisions such as `button-primary-background`.

Prefer semantic tokens in application code. Add a component token only when a component needs a stable distinction that semantic tokens cannot express. Avoid one-off tokens named after a page or temporary feature.

## Keep DESIGN.md useful

For a new multi-surface product, use `assets/DESIGN.template.md`. For an existing product, update only evidence-backed sections. Capture both values and rationale:

- overview and visual identity
- colors and usage boundaries
- typography roles and hierarchy
- layout, density, spacing, and breakpoints
- elevation, depth, borders, and shapes
- component variants and states
- interaction and motion
- responsive behavior
- content terminology
- accessibility baseline
- data visualization when applicable
- explicit do and don't rules

Use prose for judgment and tokens for stable values. Negative constraints are valuable when they protect identity.

## Control evolution

Before adding a token or variant, check whether an existing semantic distinction fits. Before changing a shared token, inspect all consumers. Record deliberate exceptions with scope and rationale instead of silently forking the system.

When the project adopts Google's `design.md` CLI, use its lint, diff, and export commands as project-owned checks. Do not install it or alter dependencies without authorization. Static conformance does not replace rendered review.
