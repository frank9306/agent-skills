---
name: to-adr
description: Convert a confirmed, lasting, and hard-to-reverse technical decision into a numbered Architecture Decision Record under docs/adr/. Use when a framework, persistence model, module boundary, security policy, deployment approach, data compatibility rule, or public interface decision will constrain future work.
---

# Convert a Decision to an ADR

Record accepted technical decisions, not brainstorming or ordinary implementation details.

## Qualify the decision

Require a confirmed decision, context, rationale, at least one meaningful alternative when one existed, and consequences. Do not create an ADR for routine bug fixes, styling, local refactors, patch upgrades, or unresolved choices.

Read relevant Issues, meeting records, Context, and existing ADRs. Surface contradictions and ask for resolution before writing.

## Create the record

Run scripts/create_adr.py with the absolute project path, the explicit confirmed flag, title, context, decision, and rationale. Supply alternatives, consequences, local sources, related Issue IDs, and a superseded ADR when applicable. Repeat list options as needed.

The script validates local references, allocates the next number, and renders assets/adr.md.tmpl.

Never edit an accepted ADR to change history. When a decision changes, create a new ADR with supersedes; the new record points to the old one, while the old file remains intact.

## Verify

Confirm the number is unique, every local source exists, the decision is stated unambiguously, and consequences include costs or constraints. Report the new ADR, related Issue and sources, and any superseded decision.
