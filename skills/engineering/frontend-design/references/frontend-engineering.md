# Interface Implementation

## Components and states

Use existing primitives and explicit variants for stable visual concerns. Keep feature assemblies near consumers. Extract markup only when semantics, states and change cadence match; preserve public behavior during repairs.

Model reachable states. Loading is not empty; refresh can preserve visibly stale content. Preserve input on recoverable failure and offer a next action. Labels, error association, focus and disabled feedback belong to the interface contract. Server authorization and API semantics stay with the engineering workflow.

## Layout-sensitive work

State changes should not accidentally resize toolbars or shift actions. Use stable slots and shared type roles. Lists preserve identity; UI subscriptions/timers use established lifecycle mechanisms.

Declare image dimensions/aspect ratios and eagerly load only critical assets. Add virtualization or heavy animation dependencies for measured needs. Keep interaction transitions enabled during behavior checks; screenshot stabilization is separate.

## Tests

Component tests prove actions/feedback; browser tests prove layout, scrolling, focus and integrated states. Use roles/names for interaction and stable dedicated selectors for contract measurements. Prepare data/permissions through project infrastructure. Run project-owned typecheck, tests and build appropriate to the change.
