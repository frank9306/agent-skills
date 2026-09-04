---
name: sync-ai-environment
description: Initialize, inspect, or synchronize a user's managed global AI environment through the public frank9306/ai-environment CLI. Use when the user wants consistent global AGENTS.md and current Skills across Codex accounts, category-based Skill selection, environment drift checks, launcher-specific CODEX_HOME registration, or a daily consistency check.
---

# Synchronize the AI Environment

Use `ai-env` as the implementation and keep this Skill as a natural-language interface. Do not duplicate the manager's configuration or synchronization logic here.

## Select the operation

- New account or Codex instance: run `npx --yes github:frank9306/ai-environment bootstrap`.
- Inspect without changes: run `npx --yes github:frank9306/ai-environment check` or `plan`.
- Check configured Skill repositories for their latest revisions, review the plan, and synchronize: run `sync`.
- Choose repository categories with `--categories engineering,content`, or every discovered category with `--all-skills`.
- Keep individual control with `--skills tdd,review-code` or `--required-only` when category selection is too broad.
- Show a suitable environment without forcing installation: run `recommend development`.
- Diagnose paths and prerequisites: run `doctor`.
- Manage the Windows daily read-only check: run `schedule install` or `schedule remove`.

Pass `--codex-home <path>` only when the user explicitly selects another target. Otherwise let the CLI resolve the active process's `CODEX_HOME`; do not assume `~/.codex`, because account launchers can provide an instance-specific home.

## Preserve control

Resolve the active Codex Home before modifying it. Show the target, previous and latest source revisions, available and selected categories, resulting Skill list, and intended managed-file changes.

Normal interactive synchronization asks the user to choose categories or all Skills and confirms the complete latest-source plan immediately before mutation. Treat an explicit request to apply that disclosed plan as authorization for the detected Codex Home and planned managed-file changes; pass `--yes` only when the user already gave that authorization. Use `--takeover` only when the disclosed plan includes replacing unmanaged or drifted managed files.

For modifying requests that do not clearly authorize both the target and overwrite, show the detected Codex Home and plan, then obtain approval before using confirmation or takeover options. In either mode, stop if execution fails, secret material would be handled, a path falls outside the detected Codex Home, or the operation expands beyond the disclosed plan.

After a modifying operation, run the applicable check and report the resolved source commit, selected categories, installed Skills, and Codex Home. Do not require the user to approve intermediate steps already covered by confirmation of the complete plan.

Never read, copy, synchronize, print, or commit login state, OAuth credentials, tokens, cookies, or secret environment-variable values. Plugins and MCP servers are recommendations until the user explicitly authorizes their installation and authentication.

Scheduled checks are read-only. Do not turn them into silent synchronization jobs.
