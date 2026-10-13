---
name: route-work
description: Select the correct existing project Skill and workflow entry point for a broad, underspecified, or stage-dependent request. Use when work may involve requirements, local Issues, implementation, bug diagnosis, code review, meetings, research, project context, architecture decisions, documentation setup, structure-check setup, or project scaffolding and the user has not already named the owning Skill.
---

# Route Project Work

Choose one primary workflow entry point per stage without reproducing the owning Skill's procedure. Invoke that Skill for authorized work, then reassess the stage until the original authorized goal is fulfilled or a real gate prevents continuation.

## Inspect before routing

Read the root agent instructions and the project workflow. Inspect only enough repository state to distinguish the request type and its current stage, including the active Issue when one exists. Respect explicit user intent: when the user names an available Skill whose scope matches the request, route to it directly.

Do not treat routing as authorization to create artifacts, change code, fix findings, publish, deploy, or perform another materially different action. Preserve any confirmation or safety boundary imposed by the owning Skill.

## Select one primary route

Use the first matching route:

| Input or current state | Primary Skill |
|---|---|
| Explicit request to establish or upgrade project-owned structure checks, Codex Hooks, or CI gates | `$init-checks` |
| Ambiguous domain terminology or concept boundaries that materially affect behavior | `$model-domain` |
| New or ambiguous requirement with unresolved behavior, boundaries, or acceptance | `$grill-me` |
| Clear, unrecorded requirement in a project using local Issues | `$manage-issues` |
| Explicit request to design module ownership, a public interface, or an architectural seam | `$design-modules` |
| One local Issue whose status is `ready`, or `in-progress` for an authorized continuation, with dependencies done and actionable scope | `$implement-issue` |
| Authorized concrete implementation in a project using another tracker, with behavior and any bug root cause confirmed and its own readiness gates met | `$tdd`, with the project's design, structure-check, and review gates |
| Reported failure whose root cause is not confirmed | `$diagnose-bug` |
| Explicit request to review a fixed Git change range | `$review-code` |
| Explicit repository or subsystem architecture assessment | `$review-architecture` |
| Meeting notes, transcript, or meeting summary entering the project | `$capture-meeting` |
| External evidence or investigation findings entering the project | `$capture-research` |
| Verified durable domain knowledge | `$maintain-context` |
| Confirmed lasting technical decision | `$to-adr` |
| Explicit request to initialize missing AI engineering documentation | `$init-docs` |
| Explicit request to scaffold a supported new project | `$init-project` |
| Explicit request to create or revise project-facing agent instructions | `$write-agent-docs` |
| Explicit frontend design, implementation, polish, or visual audit | `$frontend-design` |
| Public URL content extraction | `$read-web-content` |
| Evidence-led article creation | `$write-articles` |

Select exactly one primary Skill for the current stage; do not invoke several Skills in advance. Re-route after it completes when the user already authorized a larger goal. Creating an Issue or completing a design does not by itself finish an implementation request. For example, route a ready Issue to `$implement-issue`, which owns its use of `$tdd`, `$review-code`, and `$manage-issues`.

## Enforce stage gates

Route new implementation to `$implement-issue` only when one concrete Issue is `ready`, every dependency is done, and its desired outcome and acceptance criteria are actionable. An explicit continuation may resume an unambiguous `in-progress` Issue after reading its evidence and inspecting existing changes; do not reset it to ready or create a duplicate Issue. Route unresolved requirements to `$grill-me`; in a local-Issue project, route a clear but unrecorded requirement to `$manage-issues`. For a project using another tracker, follow its own readiness and authorization gates; do not force `$init-docs` or create local Issues. Apply the same conditional module-design gate, project-owned structure checks, and read-only completion review.

Do not route a reported failure directly to implementation while its root cause remains unconfirmed. Do not route an unconfirmed inference to `$maintain-context` or `$to-adr`. Route domain ambiguity to `$model-domain`; route only confirmed results onward to durable documentation.

If several routes appear applicable, choose the earliest unmet stage in the durable project workflow. Ask one decisive question only when repository evidence cannot distinguish materially different routes.

## Hand off

Invoke the selected Skill when it is available and the requested action is authorized. Otherwise report:

- The selected route and the evidence for it.
- The missing Skill, unmet gate, or decision that prevents handoff.
- The single next action needed to continue.

Do not invent a substitute workflow, a Task or Worker artifact, or a second lifecycle beside the project's existing tracker. Requests for discussion, design, or review remain in that scope; stage continuation does not grant new implementation authorization.
