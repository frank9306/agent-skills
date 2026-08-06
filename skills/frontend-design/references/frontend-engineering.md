# Frontend Engineering

Apply framework-specific guidance only after detecting the project's stack and version. Project conventions and compiler feedback override generic preferences.

## Component architecture

- Keep each component responsible for one cohesive visual or interaction concern.
- Prefer composition and explicit variants over accumulating boolean mode props.
- Separate reusable primitives from product-specific assemblies.
- Keep state close to its consumers; introduce shared providers only for genuine cross-tree coordination.
- Define controlled and uncontrolled behavior deliberately.
- Preserve the project's public component APIs unless a breaking change is approved.

## Type and data boundaries

- Keep strict types and validate untrusted data at system boundaries.
- Distinguish transport data, domain models, and display models when their semantics differ.
- Model meaningful states explicitly instead of relying on ambiguous nullable fields.
- Do not use casts or `any` to hide an unresolved contract.

## React guidance

- Derive render-time state during render instead of synchronizing it with effects.
- Put interaction logic in event handlers when it is caused by an interaction.
- Parallelize independent requests and avoid request waterfalls.
- Minimize data crossing server/client boundaries.
- Avoid defining components inside render functions.
- Memoize measured expensive work, not simple expressions by reflex.
- Use stable keys representing identity, never array position for reorderable data.
- Prevent stale async results and clean up subscriptions, timers, and requests.

## Performance

- Keep routes and imports statically analyzable; defer genuinely heavy optional features.
- Declare image dimensions and serve appropriate formats and sizes.
- Subset and preload only critical fonts.
- Avoid layout-property animation and layout thrashing.
- Virtualize or progressively render large collections when measurement proves the need.
- Preserve usable server-rendered or loading output during hydration.

## Testing

Test observable behavior and meaningful states. Use unit tests for pure rules, component tests for interaction, and browser tests for critical flows and layout-sensitive behavior. Include keyboard behavior and failure recovery in the smallest relevant layer.
