---
id: ISSUE-0013
title: Add audit-codex-harness skill
status: in-progress
priority: high
created: 2026-09-04
updated: 2026-09-04
closed:
sources:
  - User-approved implementation plan in the originating Codex task
related_adrs: []
depends_on: []
---

# ISSUE-0013: Add audit-codex-harness skill

## Problem

Codex projects expose token totals and session traces, but the repository has no reusable Skill that isolates one project's records and evaluates whether its instructions, tools, context strategy, delegation, and verification workflow use those tokens effectively.

## Desired outcome

Add a portable, read-only Skill that discovers the active Codex home, attributes sessions to the current checkout and confirmed worktrees, produces evidence-backed operational and quality-aware scores, and recommends focused harness improvements without exposing transcript content.

## Acceptance criteria

- [x] Resolve the data root from an explicit option, `CODEX_HOME`, or `~/.codex`, in that order.
- [x] Read session JSONL and `state_5.sqlite` without modifying Codex data or reading authentication files.
- [x] Exclude unrelated projects; group the current checkout separately from confirmed worktrees and deduplicate active/archived sessions.
- [x] Analyze token, context, cache, tool, retry, delegation, verification, interruption, model, and reasoning signals.
- [x] Produce an operational-efficiency score and emit a composite Harness score only when objective completion evidence exists.
- [x] Report coverage, confidence, deductions, evidence, prioritized findings, and limitations without leaking transcript content or stable identifiers.
- [x] Support the default 30-day audit plus explicit home, date range, checkout-only, worktree detail, and JSON output controls.
- [x] Cover discovery, isolation, parsing, scoring, redaction, malformed input, and deduplication with automated tests.
- [x] Update repository discovery, installation, and test documentation and pass all repository checks.
- [ ] Push the feature branch, fast-forward remote `main`, and globally install the published Skill.

## Out of scope

- Reading server-side subscription usage or authentication data.
- Claiming causal harness improvements from uncontrolled historical comparisons.
- Modifying project files, Codex logs, or Codex account settings during an audit.

## Decisions

- Same-repository worktrees are included in the aggregate but reported separately.
- Project identity uses `project_id` first and normalized `git_origin_url` second; otherwise matching remains path-only.
- Scoring rules are versioned and distinguish operational efficiency from outcome-aware quality.

## Implementation notes

- Added a standard-library-only read-only collector and versioned scoring model.
- Added project/worktree identity, active/archive deduplication, privacy-preserving aggregates, human and JSON reports, and nine synthetic CLI tests.
- Added Skill instructions, progressive references, repository discovery, installation, and test integration.

## Verification

- `python -m py_compile skills/engineering/audit-codex-harness/scripts/audit_codex_harness.py`
- `python -m unittest discover -s skills/engineering/audit-codex-harness/scripts/tests -p "test_*.py" -v` — 9 passed.
- `python .../skill-creator/scripts/quick_validate.py skills/engineering/audit-codex-harness` — valid.
- `npm run check` — 21 Skills validated.
- `npm test` — full repository suite passed.
- Live read-only isolation check used environment `CODEX_HOME`: 64 candidates, 1 current-project match, 63 excluded, 0 duplicates.
- Read-only review of the staged change found no actionable P0–P3 findings; residual compatibility and Git-origin fallback risks are documented.

## Activity log

### 2026-09-04 — Implemented and verified

Completed red-green-refactor slices for discovery, isolation, worktree grouping, deduplication, scoring, privacy, and output modes; all repository checks passed.

### 2026-09-04 — Created

Issue created from the approved implementation plan.

### 2026-09-04 — Status changed from proposed to ready.

### 2026-09-04 — Status changed from ready to in-progress.

## Completion summary

Not completed.
