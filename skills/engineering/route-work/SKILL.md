---
name: route-work
description: Select the correct existing project Skill and workflow entry point for a broad, underspecified, or stage-dependent request. Use when work may involve requirements, local Issues, implementation, bug diagnosis, code review, meetings, research, project context, architecture decisions, documentation setup, or project scaffolding and the user has not already named the owning Skill.
---

# Route Project Work

Choose one primary workflow entry point without reproducing or executing the owning Skill's procedure.

## Inspect before routing

Read the root agent instructions and the project workflow. Inspect only enough repository state to distinguish the request type and its current stage, including the active Issue when one exists. Respect explicit user intent: when the user names an available Skill whose scope matches the request, route to it directly.

Do not treat routing as authorization to create artifacts, change code, fix findings, publish, deploy, or perform another materially different action. Preserve any confirmation or safety boundary imposed by the owning Skill.

## Select one primary route

Use the first matching route:

| Input or current state | Primary Skill |
|---|---|
| Ambiguous domain terminology or concept boundaries that materially affect behavior | `$model-domain` |
| New or ambiguous requirement with unresolved behavior, boundaries, or acceptance | `$clarify-requirements` |
| Clear requirement that must be recorded or decomposed into local Issues | `$manage-issues` |
| Explicit request to design module ownership, a public interface, or an architectural seam | `$design-modules` |
| One local Issue whose status is `ready` and whose dependencies are done | `$implement-issue` |
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

Select exactly one primary Skill. Mention later workflow stages only as an expected continuation; do not invoke several Skills in advance. For example, route a ready Issue to `$implement-issue`, which owns its use of `$tdd`, `$review-code`, and `$manage-issues`.

## Enforce stage gates

Do not route implementation to `$implement-issue` unless one concrete Issue is `ready`, every dependency is done, and its desired outcome and acceptance criteria are actionable. Route unresolved requirements to `$clarify-requirements`; route a clear but unrecorded requirement to `$manage-issues`.

Do not route a reported failure directly to implementation while its root cause remains unconfirmed. Do not route an unconfirmed inference to `$maintain-context` or `$to-adr`. Route domain ambiguity to `$model-domain`; route only confirmed results onward to durable documentation.

If several routes appear applicable, choose the earliest unmet stage in the durable project workflow. Ask one decisive question only when repository evidence cannot distinguish materially different routes.

## Hand off

Invoke the selected Skill when it is available and the requested action is authorized. Otherwise report:

- The selected route and the evidence for it.
- The missing Skill, unmet gate, or decision that prevents handoff.
- The single next action needed to continue.

Do not invent a substitute workflow, a Task or Worker artifact, or a second lifecycle beside local Issues.
