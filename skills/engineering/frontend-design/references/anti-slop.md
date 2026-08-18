# Anti-Slop Review

Treat these patterns as prompts for contextual review, never automatic defects. Keep a pattern when it is supported by the brief, brand, content, or existing system.

## Common visual defaults

- reflex purple-blue gradients, gradient-clipped headlines, and atmospheric blobs
- interchangeable centered hero, two calls to action, and three identical feature cards
- glass surfaces, excessive blur, oversized shadows, and uniformly large radii
- cards nested inside cards when spacing or headings would express the hierarchy
- badge and pill proliferation, pastel icon tiles, glowing status dots, and ornamental kickers
- default font choices used without a typographic rationale
- decorative `01/02/03` markers for content that is not sequential
- generic abstract SVG illustrations and meaningless dashboard statistics

## Common interaction defaults

- `transition: all`
- animation on every hover and scroll event
- layout-property animation that causes reflow
- modal dialogs used to escape ordinary layout decisions
- hover-only feedback without pressed or keyboard states
- skeletons, spinners, and toasts used without matching task duration or importance

## Common copy defaults

- claims that substitute enthusiasm for specific product value
- "not just X—it's Y" and similar contrast formulas
- repeated adjectives such as seamless, powerful, effortless, and next-generation
- headings that label a section without helping users understand it
- invented stats or testimonials used as decoration

## Repair method

1. Identify the product decision the pattern is trying to express.
2. Preserve any deliberate brand choice.
3. Remove before replacing.
4. Prefer hierarchy from content, type, spacing, and structure.
5. Make the smallest shared-token or shared-component repair.
6. Verify the result in the browser; a lower scan count is not proof of better design.
