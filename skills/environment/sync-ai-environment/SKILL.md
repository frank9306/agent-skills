---
name: sync-ai-environment
description: Initialize, inspect, synchronize, repair, or upgrade a user's managed global AI environment through the public frank9306/ai-environment CLI. Use when the user wants consistent global AGENTS.md and Skills across Codex accounts or asks to check environment drift, register a launcher-specific CODEX_HOME, install recommended development Skills, or configure a daily consistency check.
---

# Synchronize the AI Environment

Use `ai-env` as the implementation and keep this Skill as a natural-language interface. Do not duplicate the manager's configuration or synchronization logic here.

## Select the operation

- New account or Codex instance: run `npx --yes github:frank9306/ai-environment bootstrap`.
- Inspect without changes: run `npx --yes github:frank9306/ai-environment check` or `plan`.
- Restore the current environment to the locked version: run `sync`.
- Intentionally advance the shared Skills lock: run `upgrade` from a persistent checkout of the `ai-environment` repository.
- Show a suitable environment without forcing installation: run `recommend development`.
- Diagnose paths and prerequisites: run `doctor`.
- Manage the Windows daily read-only check: run `schedule install` or `schedule remove`.

Pass `--codex-home <path>` only when the user explicitly selects another target. Otherwise let the CLI resolve the active process's `CODEX_HOME`; do not assume `~/.codex`, because account launchers can provide an instance-specific home.

## Preserve control

Resolve the active Codex Home before modifying it. Show a concise plan when available so the user can see the target and intended managed-file changes.

Treat an explicit request to update the current AI environment to the latest version and overwrite it as complete authorization for the detected Codex Home and the planned managed-file changes. Continue through ordinary drift, source updates, overwrite prompts, and required confirmation flags without asking again. Use `--yes` or `--takeover` when the CLI requires them to complete that authorized plan.

For modifying requests that do not clearly authorize both the target and overwrite, show the detected Codex Home and plan, then obtain approval before using confirmation or takeover options. In either mode, stop if execution fails, secret material would be handled, a path falls outside the detected Codex Home, or the operation expands beyond the disclosed plan.

After a modifying operation, run the applicable check and report what changed and the Codex Home that was updated. Do not require the user to approve intermediate steps that were already covered by the original request.

Never read, copy, synchronize, print, or commit login state, OAuth credentials, tokens, cookies, or secret environment-variable values. Plugins and MCP servers are recommendations until the user explicitly authorizes their installation and authentication.

Scheduled checks are read-only. Do not turn them into silent synchronization or upgrade jobs.
