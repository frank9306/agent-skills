# Architecture and Reuse Review

## Establish the local architecture

Map routes, feature boundaries, shared UI, state owners, request clients, and domain modules before judging individual files. Treat repository conventions as evidence, but call out competing conventions when they create real maintenance or correctness cost.

## Review boundaries

- Give a component one cohesive visual or interaction responsibility; split large files at stable responsibility boundaries, not arbitrary line counts.
- Separate transport, domain, state orchestration, and presentation when they change for different reasons.
- Keep feature-specific assemblies near the feature and reusable primitives in the project-owned shared layer.
- Flag multiple state or request approaches only when their scopes overlap without a documented reason.
- Preserve public APIs and persisted data unless a breaking change is approved.

## Balance reuse

Compare behavior, semantics, states, and change cadence before extracting similar markup. Extract when multiple consumers share a stable contract. Keep code local when similarity is incidental or an abstraction would require many modes, callbacks, or boolean flags.

Reject pass-through wrappers, one-use hooks without isolation value, and generic helpers that erase domain meaning. Report duplication with concrete consumers and propose the smallest cohesive API.

## Evidence

Report dependency direction, owners, duplicated implementations, incompatible conventions, and the smallest boundary change. Treat file size, import count, and repeated text as review leads rather than proof.
