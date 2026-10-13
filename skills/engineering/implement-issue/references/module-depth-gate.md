# Pre-generation Module Design Gate

This is the single execution reference for module design before code generation. Implementation, TDD, frontend generation, routing, and generated project workflows link here; do not maintain separate copies of its criteria or record template. It applies to authorized implementation with any tracker and in any language.

## Decide whether to design or reuse

Apply this gate before generating implementation code or behavior tests, including prototypes and sample business logic. Neutral framework scaffolding and test-tool setup may precede it when already authorized; do not put business behavior into that scaffold before the gate passes. Read-only analysis and review do not authorize creating design artifacts or changing code.

A new project or first implementation of a named product capability needs a recorded module design. Revisit the affected design when work:

- Adds or materially changes a module's ownership or public interface.
- Makes callers coordinate internal sequencing, intermediate state, or failure recovery.
- Moves business rules, lifecycle, persistence, or third-party integration across owners.
- Duplicates one rule across owners or makes unrelated callers change for an internal decision.
- Lacks a stable public interface through which required behavior can be verified.

An internal fix, mechanical edit, or behavior change within a valid existing contract reuses that contract. Identify the affected owner and contract reference; established public entries and behavior tests can provide that evidence when no formal architecture document exists. Do not create a second design document or repeat the design exercise. On continuation, inspect the existing record and actual code before deciding that design is missing.

## Record the design before generation

Resolve the following for the affected scope, using the request and repository evidence. Record the result in the project's existing architecture contract and link it from the active Issue or equivalent tracker. If no architecture artifact exists, use that tracker's design/decisions section or the project's normal architecture document; do not introduce a new tracker, separate Spec/Ticket, or mandatory ADR merely to pass this gate. Keep one authoritative record of each project decision.

| Design item | Concrete result required |
|---|---|
| Responsibility | Named business capability, authoritative owner of each rule, and relevant scope exclusions |
| Public interface | Planned entry points and exported operations/types, inputs, outputs, failure behavior, and caller-visible lifecycle |
| Hidden implementation | Internal state and invariants, sequencing, persistence and third-party details that callers must not coordinate |
| Dependencies | Allowed owner-to-owner direction, infrastructure access, and any genuinely varying dependency that needs an adapter |
| File organization | A proposed file tree or file map identifying ownership, public entries, private implementation, and test locations |
| Behavior verification | Requirement-derived scenarios and the public interface each test or integration check will exercise; actual project check commands or explicit gaps |

Use native visibility and organization for TypeScript, Python, Rust, Go, or the project's language. Several cohesive entry points are valid. Do not impose identical folders, an index barrel, file-size limits, or a new abstraction solely to fit this record. A proposed contract does not claim that executable checks or language adapters are installed.

## Check callers before emitting code

Walk representative success and material failure/lifecycle scenarios through the planned public interface. Confirm that callers can complete each scenario without manipulating internal state, reproducing a rule, or learning a storage/SDK protocol. Apply the deletion test: removing an abstraction should make meaningful complexity reappear in callers; otherwise absorb or simplify it before implementation. Do not add hypothetical seams or expose private helpers just to make tests convenient.

The gate passes when the affected design items are resolved, the caller walkthrough works, and the authoritative record or valid reuse reference exists. Fill routine design choices autonomously within the user's authorization; ask only for a material unresolved product decision or missing authorization. Design completion is not a new approval ceremony and does not authorize unrelated refactors, tool installation, or deployment.

## Generate against that contract

Generate the first implementation, callers, and behavior tests against the same recorded interface and file map. Use the existing TDD flow one behavior at a time. Do not default to implementing the feature first and restructuring it into deep modules afterward, or defer known ownership/interface problems to the refactor phase. Public contract tests use public entries; preserve the project's deliberate internal-unit-test policy without exporting helpers for tests.

If new evidence invalidates the design, revise the affected record before generating more dependent code, then make the smallest necessary change. Do not silently bypass the interface, broaden exports for convenience, or regenerate unrelated modules. Routine cleanup inside an unchanged contract remains valid refactoring.

Run the project's actual checks as early feedback and at delivery. They detect implementation drift; they do not replace this pre-generation design or prove semantic depth. Establish missing checks only when authorized, and report unsupported tooling or languages honestly.
