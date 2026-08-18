---
name: manage-issues
description: Manage repository-local engineering Issues under docs/issues/, including creation, state transitions, implementation progress, verification, index maintenance, closure, cancellation, and monthly Changelog entries. Use when project work is tracked in Markdown instead of an online Issue tracker.
---

# Manage Local Issues

Treat each Issue as the source of truth for why work exists, what done means, current progress, and verification. Read docs/agents/issue-tracker.md before changing state.

## Create an Issue

Gather a concrete title, problem, desired outcome, acceptance criteria, scope exclusions, priority, and source links. Run scripts/issues.py with the create command, an absolute project path, title, problem, outcome, and optional priority and sources.

The script allocates the next number, creates the file from assets/issue.md.tmpl, and regenerates the index. Edit the new file to replace the acceptance placeholder before moving it to ready.

For a requirement that cannot be completed and verified safely as one task, read references/decomposition.md and create several Issues by repeating the create command. Record dependencies in each Issue. Do not introduce a separate Spec or Ticket artifact.

## Update and transition

Keep implementation notes and evidence in the Issue. Use only the transition graph in references/lifecycle.md. Run scripts/issues.py with the transition command, project path, Issue ID, target status, and any completion summary, verification, or Changelog category.

The script rejects illegal transitions. Done requires every acceptance checkbox to be checked plus non-placeholder verification and completion summary. Cancelled requires a summary. Both terminal states update the monthly Changelog idempotently.

Run the reindex command after any manual frontmatter edit.

## Protect history

Do not delete or move Issue files. Do not reuse numbers. Preserve meeting, ADR, research, and handoff links. Report the changed Issue, previous and new state, index update, Changelog entry, and verification evidence.
