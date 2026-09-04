---
name: write-agent-docs
description: Create or revise AGENTS.md and other agent-facing project instructions so agents can discover authoritative context and act within clear scope. Do not use for creating Skill packages or ordinary human documentation.
---

# Write Agent Docs

Make project instructions easy for an agent to discover, apply, and verify without loading unrelated context.

## Inspect the instruction hierarchy

Read every applicable parent and project instruction file, the repository workflow, and the authoritative documents the proposed text will reference. Inspect existing tools and commands before describing them. Treat current code and configuration as evidence, not permission to invent a policy.

Place each rule at the narrowest scope where it remains true. Prefer a short root `AGENTS.md` that points to maintained domain or workflow documents over duplicating their contents.

## Write operational guidance

Include only guidance that changes an agent's decisions:

- Authoritative sources and when they must be read.
- Scope, authorization, safety, and stopping boundaries not already imposed globally.
- Project-specific workflow gates and ownership.
- Exact commands that have been verified or are owned by the project.
- Clear routing pointers for detailed or conditional guidance.

Use direct, testable language. Separate requirements from recommendations. Remove stale, contradictory, duplicated, or purely motivational prose. Never place credentials, private endpoints, transient task state, or speculative facts in agent instructions.

Keep long schemas, policies, and mode-specific procedures in focused referenced documents. Make each pointer explain when its target is needed so agents do not load every reference by default.

## Verify the result

Check instruction precedence, links, paths, command accuracy, and consistency with Context, ADRs, and repository behavior. Search for conflicting copies of changed rules. Preserve unrelated user instructions and established authorization boundaries.

Report the changed instruction scopes, removed contradictions or duplication, commands checked, and remaining assumptions. Use the system `$skill-creator` for creating or restructuring a reusable Skill; this Skill owns project-facing agent documentation, not Skill packaging.
