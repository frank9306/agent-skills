# Responsive Design and Accessibility

## Responsive behavior

Design hierarchy at each supported width; do not merely shrink the desktop composition.

- Establish the product's real minimum width and supported breakpoints.
- Test content growth, long words, translated strings, zoom, and dynamic type.
- Reflow controls before truncating essential labels.
- Preserve primary actions and context when columns collapse.
- Keep touch targets usable and separate enough to avoid accidental activation.
- Avoid viewport-height traps around mobile browser chrome and virtual keyboards.
- Verify overlays, sticky regions, tables, charts, and horizontal scrolling explicitly.

## Semantic foundation

Use native elements and landmarks before ARIA. Maintain a logical heading structure and DOM order. Give every input an accessible name, every error a programmatic association, and every meaningful image useful alternative text.

## Keyboard and focus

Make all interactive behavior keyboard-operable. Use a visible `:focus-visible` treatment with sufficient contrast. Manage focus when dialogs, popovers, navigation, or asynchronous changes alter context. Do not remove outlines without an equivalent replacement.

## Perception and motion

- Meet the project's declared contrast target; default to WCAG AA when none exists.
- Do not rely on color alone for state or error communication.
- Respect `prefers-reduced-motion` and avoid forced smooth scrolling.
- Keep animation transform/opacity based where possible and avoid flashing.
- Announce important asynchronous status changes without making routine updates noisy.

## Localization

Use locale-aware date, time, number, and plural formatting. Check expansion and right-to-left implications for layouts that may be localized. Do not embed meaning in icon direction without mirroring or explanation.
