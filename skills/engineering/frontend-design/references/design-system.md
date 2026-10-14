# Design System

## Authority

DESIGN.md explains decisions and links to owners. Runtime values belong to token/theme files or their generation source; components own anatomy, variants and states; the shell owns common layout. Avoid duplicate numeric authorities. Projects generating CSS from Google's DESIGN.md follow its actual format/linter rather than this skill's Markdown template.

Primitive tokens hold scales, semantic tokens express intent, and component tokens capture stable distinctions. Application code prefers semantic roles. Preserve legitimate chart, media and geometry literals instead of banning every number.

## Evolution

Inspect same-class components before extending. Compare copy, density, type, semantic colors, radii, depth and interaction. Add shared variants for stable needs. Record exceptions with scope/reason. Before changing shared tokens, identify consumers, themes and states.

New products and lasting visual changes maintain DESIGN.md. Local repairs reuse design evidence; read-only reviews record missing authority without creating files. Separate facts, unresolved decisions and proposals.

## Consumption

Source lint checks declared conventions; browser assertions compare named same-class components or expected properties within a theme/variant/state. Buttons need not all be identical. Check light/dark mapping, font fallback, long labels and affected consumers. A valid document alone does not establish that running CSS consumes it.
