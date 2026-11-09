---
name: check-delivery
description: Inspect a bounded engineering delivery against its originating requirement, frozen change identity, independent review and test evidence, runtime instructions, and recovery notes. Use when preparing an owner acceptance handoff or checking whether a delivery is ready. Does not authorize deployment, publication, code changes, or acceptance on the owner's behalf.
---

# Check Delivery Evidence

Check one delivery using actual artifacts. Keep the project's existing tracker and required checks authoritative. A role's stage completion is distinct from owner acceptance and from permission to publish.

## Establish the inputs

Read the originating Issue and acceptance criteria, repository instructions, final change identity, implementation handoff, independent review, QA evidence, and run/recovery notes. Inspect only the authorized scope. Identify each required input by path or task ID and an immutable revision or content hash. Redact secrets and private user data from the report.

When an input is missing, ambiguous, or inaccessible, list the exact gap and its owner. Do not invent an artifact or infer success from task status, a screenshot of a green badge, or another agent's unsupported summary.

## Reconcile the evidence

Produce a compact matrix: acceptance criterion, artifact/check, exact input revision, observed result, and remaining gap. Apply these rules:

- Evidence must match the final inputs. A changed file or configuration that affects a check invalidates that check until rerun. A successful check against an older revision is stale.
- Separate implementation checks, independent review, and user-behavior QA. Verify the reviewers and their bounded inputs; a developer's self-check cannot substitute for required independent review or QA.
- Read actual logs/reports and their exit status. Missing tools, timeouts, skipped checks, and unsupported environments are gaps, not passes. Run a missing bounded non-mutating check only when authorized and available; otherwise identify the executor and next action. Respect test side effects and external-service authorization.
- For applicable UI criteria, require meaningful browser assertions and retained evidence from a supported environment. Build, lint, unit tests and static design checks do not replace browser behavior verification. Record desktop/mobile coverage and exclusions as the project requires.
- Check required build/type/lint/tests/structure/design gates according to the project. Do not add unrelated gates or weaken existing ones to obtain a pass. Unresolved P0/P1 findings prevent readiness; disclose other findings and uncovered cases.
- Distinguish an explicit owner-approved acceptance exception from missing verification. Cite its authorization, scope and remaining risk; never create the exception yourself.

## Check the handoff

Confirm that another authorized operator can identify the delivery version, prerequisites, configuration variable names without values, build/run steps, health check, and the prior recoverable version or backup. For deployments, inspect the proposed deploy and rollback procedure, including data compatibility and a smoke-check step; checking a procedure does not execute it. Mark recovery as documented, rehearsed, or untested according to the evidence. For a code-diff-only delivery, mark deploy-specific items not applicable with a reason.

Do not create archives, edit code/configuration, install dependencies, migrate data, commit, push, publish, or change permissions through this Skill. A needed mutation goes to its authorized owner as a separate action.

## Return a bounded verdict

Report one of:

- **Ready for owner acceptance**: all required criteria have current evidence, independent gates passed, and the handoff is usable. This is not owner acceptance or publication authorization.
- **Ready with an owner-approved exception**: cite the explicit exception and list residual gaps separately. This is not a waiver you can grant.
- **Not ready**: list the failing, missing or stale evidence, concrete next action, and responsible role. Keep an implementation failure distinct from an external environment blocker.

End with a concise owner-facing handoff: what changed, where the artifacts are, how the owner can accept it, remaining risks, and whether any publication action is separately authorized. Do not close the business Issue or declare the owner accepted it.

For an explicitly approved plan, follow its recorded completion mode. When all required evidence passes and engineering closure is authorized, report **Ready for engineering closure** to the owning manager, who closes and notifies. Do not request or fabricate human acceptance. Explicit human review, risk exceptions and publication retain their own gates.
