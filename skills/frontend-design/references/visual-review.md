# Visual Review

Rendered output is authoritative for visual claims. Source code and static scans only identify review targets.

## Compare against intent

Re-read the brief and visual thesis. Check whether the first viewport communicates the product and primary task. Identify the first element that drifted—type, color, spacing, depth, hierarchy, copy, or imagery—then repair that cause rather than decorating around it.

## Review passes

### Structure

- Can a user orient and find the primary action quickly?
- Does each section have one clear job?
- Does the layout express real relationships?
- Are cards, tabs, dividers, labels, and badges necessary?

### Craft

- Is the type hierarchy deliberate and consistent?
- Do spacing, alignment, radii, borders, and surfaces follow tokens?
- Are icons from one coherent family and optically aligned?
- Are text blocks free of accidental orphans, near-wraps, and destructive truncation?

### Behavior

- Exercise hover, focus, pressed, selected, disabled, loading, empty, error, and success states that exist in the flow.
- Verify scrolling, sticky regions, dialogs, popovers, menus, and escape behavior.
- Check reduced motion and keyboard-only use.

### Viewports and content stress

- Check the project breakpoints and 375px unless another minimum is declared.
- Test long realistic content, zoom, localization expansion, and absent imagery.
- Inspect layout shift, overflow, clipped focus rings, and virtual-keyboard collisions.

### Runtime

- Inspect console errors and warnings.
- Confirm network failure and slow-loading behavior where material.
- Run project-owned lint, typecheck, tests, build, and browser checks.

## Report evidence

For audit findings include severity, `file:line` when applicable, rendered evidence, violated project or accessibility rule, user impact, and smallest repair. Separate observed behavior from inferred risk and unverified areas.
