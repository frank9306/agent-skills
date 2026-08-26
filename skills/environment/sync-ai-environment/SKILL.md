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

Before a modifying operation, show the detected Codex Home and the plan. Use `--yes` or `--takeover` only after the user approves that exact target and change. If the CLI reports an unmanaged file, local drift, a source change, or expanded permissions, stop and surface the conflict instead of bypassing it.

Never read, copy, synchronize, print, or commit login state, OAuth credentials, tokens, cookies, or secret environment-variable values. Plugins and MCP servers are recommendations until the user explicitly authorizes their installation and authentication.

Scheduled checks are read-only. Do not turn them into silent synchronization or upgrade jobs.
