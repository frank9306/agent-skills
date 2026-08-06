# State and Effects

Classify each value before changing it: server cache, URL state, form state, local interaction state, cross-tree client state, or render-time derivation.

- Keep server data in the project's server-state mechanism and local UI state near its consumers.
- Derive values during render when possible; do not store copies of props, query data, or other state.
- Use effects only to synchronize with an external system. Put interaction consequences in event handlers.
- Audit effect dependencies, cleanup, stale closures, request ordering, subscriptions, timers, and Strict Mode behavior.
- Model multi-step transitions explicitly when booleans permit impossible combinations.
- Define optimistic-update ownership, conflict behavior, rollback, and user feedback before implementation.
- Avoid adding a new store or state library when the existing project mechanism fits.

Exercise rapid navigation, repeated actions, out-of-order responses, unmounting, permission changes, and rollback failure. Do not claim a race is fixed without controlling request order in a test or browser trace.
