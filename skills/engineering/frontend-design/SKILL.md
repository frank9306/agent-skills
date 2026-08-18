---
name: frontend-design
description: Design, build, reshape, polish, or audit production frontend interfaces and design systems. Use for pages, components, web apps, dashboards, responsive UI, screenshot refinement, visual consistency, accessibility, frontend architecture, state and API reliability, type safety, testing, performance, security boundaries, observability, dependency risk, or requests to remove generic AI-looking design. Supports new and existing products across frameworks while preserving project-owned conventions.
---

# Frontend Design

Create interfaces with a specific point of view, preserve product coherence, implement production-quality code, and verify the rendered result. Treat design as the combined quality of visual direction, information architecture, interaction, content, accessibility, responsiveness, performance, and implementation craft.

## Resolve authority

Apply guidance in this order:

1. Follow the user's explicit brief and constraints.
2. Follow applicable repository instructions and the required root `DESIGN.md`.
3. Reuse existing tokens, components, layouts, copy patterns, and sibling screens.
4. Preserve accessibility, correctness, platform conventions, and framework constraints.
5. Apply this Skill's design and engineering guidance.

Do not trade an established product identity for novelty. Do not use consistency as an excuse for repeating a broken pattern; explain the conflict and make the smallest coherent repair.

## Require the design contract

Treat `<project-root>/DESIGN.md` as a hard prerequisite for every frontend design, implementation, polish, screenshot, system, review, engineering-audit, and de-slop task. Confirm that the file exists before analyzing or changing the frontend.

If `DESIGN.md` is absent, create it from `assets/DESIGN.template.md` before continuing. For an existing product, replace template prompts with evidence from the repository and rendered product; mark genuinely unresolved decisions explicitly instead of inventing them. If the task is read-only or file creation is not authorized, stop and report the missing prerequisite. Do not substitute another design document, inferred conventions, or a verbal brief for the required root file.

## Gate new-surface implementation

For every new page or site, require an explicit decision on whether the user wants to review a design image before implementation. If the request already says to show or skip a design image, use that answer. Otherwise ask, in the user's language, "Do you want to review a design image before implementation?" and stop until the user answers. Do not infer consent from silence and do not write implementation code before this gate is resolved.

If the user chooses preview-first:

1. Capture the minimum product brief and create or update a provisional root `DESIGN.md` with the known direction and constraints.
2. Generate one to three design images that differ materially in layout, typography, density, or interaction direction; do not produce color-only variants.
3. Present the images with concise tradeoffs and wait for the user to select or revise a direction.
4. Record the approved decisions in `DESIGN.md`, then implement against the approved image.

If the user skips the preview, complete `DESIGN.md`, state the chosen direction, and proceed to implementation. A skipped preview does not waive the required design contract or rendered browser verification.

## Inspect before designing

After satisfying the design-contract prerequisite, inspect the repository, current changes, runtime, package manager, and verification commands. Locate:

- `AGENTS.md`, `DESIGN.md`, token and theme files
- lockfiles, `packageManager`, `tsconfig.json`, and Tailwind configuration or CSS entry points
- global styles, layout shells, routes, and same-class components
- fonts, icons, imagery, component libraries, and existing states
- screenshots or rendered output when available

For an existing surface, name the concrete visual or interaction problem before editing it. For a mature product, treat sibling components as the default design direction.

## Prefer the frontend stack

When starting a frontend project or when the project leaves the choice open, prefer:

1. `pnpm` for dependency installation and package scripts. Set and honor the project's `packageManager` field and commit the pnpm lockfile.
2. TypeScript for application, component, configuration, and test code. Enable the strictest settings supported by the chosen framework and avoid weakening type safety for convenience.
3. Tailwind CSS for styling. Express durable design decisions through project tokens, theme configuration, CSS variables, and reusable component variants rather than scattered arbitrary values.

These are defaults, not authorization to migrate an existing project. If a repository already establishes another package manager, language, or styling system, preserve it unless the user explicitly requests a migration. Do not install Tailwind CSS or any other dependency without approval when dependency addition requires approval.

## Route the task

Choose the smallest matching route and load only its required references:

| Route | Typical request | Required references |
|---|---|---|
| Create | New page, component, product, or visual direction | `design-philosophy.md`, `interaction-content.md`, `responsive-accessibility.md` |
| Extend | Add a surface to an established product | `design-system.md`, `frontend-engineering.md`, `responsive-accessibility.md` |
| Polish | Fix hierarchy, spacing, typography, density, or visual drift | `design-philosophy.md`, `visual-review.md` |
| Screenshot | Reproduce or improve against visual evidence | `visual-review.md`, then the reference matching the observed problem |
| System | Create, extract, or update a design system or `DESIGN.md` | `design-system.md` and `assets/DESIGN.template.md` |
| Review | Audit without modifying implementation | `visual-review.md`, `responsive-accessibility.md`, `frontend-engineering.md` |
| Engineering audit | Review architecture, state, API, business rules, types, tests, security, recovery, or dependency risk | Load only the matching engineering references listed below |
| De-slop | Remove templated visual or copy patterns | `anti-slop.md`, `visual-review.md` |

Load `data-visualization.md` for dashboards and chart-heavy interfaces. A task may use several routes, but avoid loading unrelated references.

For an engineering audit, load references by concern:

- Architecture and reuse: `architecture-review.md`
- State and effects: `state-and-effects.md`
- API integration: `api-reliability.md`
- Business transitions and exceptional paths: `business-correctness.md`
- Type boundaries: `type-runtime-safety.md`
- Tests and mocks: `testing-reliability.md`
- Browser security boundaries: `frontend-security.md`
- Error recovery and telemetry: `observability-recovery.md`
- Dependencies and project configuration: `dependency-config-risk.md`

## Lock the direction

Before substantial implementation, resolve from evidence or state a reasonable assumption for:

1. User and usage context.
2. The surface's single primary job.
3. Visual thesis: mood, material, typography, and energy.
4. Content hierarchy: orientation, status, actions, details, and recovery.
5. One signature element; use `none` for quiet utility UI.
6. Interaction thesis; high-frequency actions should usually be immediate and restrained.
7. Hard constraints: framework, responsiveness, accessibility, performance, and localization.

Ask only when an unresolved choice would materially change the result. Do not use vague directions such as "clean and modern" without translating them into concrete type, spacing, surface, color, and motion decisions.

## Implement the interface

- Use real content or clearly marked realistic placeholders.
- Build semantic structure before decoration.
- Derive values from project tokens; introduce a new token only for a durable distinction.
- Include loading, empty, error, disabled, success, permission, and destructive states when the flow can reach them.
- Keep component APIs explicit and cohesive. Detect the framework before applying framework-specific rules.
- Prefer the smallest owner-aligned change. Do not add dependencies or replace a component system without approval.
- Update `DESIGN.md` only when the work establishes a reusable project decision, not for a one-off exception.

## Verify rendered behavior

Open the interface in a real browser when the environment supports it. Inspect at the project's supported breakpoints and at 375px unless the product targets a different minimum. Exercise keyboard navigation and relevant interaction states. Check console errors, overflow, near-wraps, localization stress, reduced motion, and loading or failure behavior.

Run project-owned lint, typecheck, tests, build, and browser checks appropriate to the changed surface. The bundled cross-platform static helper is supplementary:

```bash
node <skill-directory>/scripts/verify-design.mjs <project-root>
```

Use `--json` for structured output. Treat warnings as review leads, not proof of a visual defect. Never claim visual quality from static scanning alone.

For audit work, classify every result as `observed`, `inferred`, or `unverified`. Confirm business rules against product evidence and API behavior; never infer them from field names. A passing static scan does not establish architectural quality, runtime safety, security, or business correctness.

## Review and hand off

Re-read the brief and visual thesis against the final rendering. Fix material drift before handoff. Report:

- chosen direction and why it fits the product
- reused and newly introduced design decisions
- responsive, accessibility, state, and browser evidence
- commands actually exercised and any unverified areas
- remaining placeholders, risks, or decisions requiring the user

Stop after handoff. Do not publish, deploy, or alter shared state unless requested.
