---
id: ISSUE-0034
title: "Add managed dev preview"
status: done
priority: high
created: 2026-11-03
updated: 2026-11-03
closed: 2026-11-03
sources: ["Owner request in fubufu-agent-control on 2026-11-03"]
related_adrs: []
depends_on: []
---

# ISSUE-0034: Add managed dev preview

## Outcome

Provide a reusable dev-preview skill with persistent project service management, bounded recovery, explicit stop, per-project logs, readiness and private acceptance routing. Deployment belongs to fubufu-agent-control ISSUE-0027. Existing business source and other pending skill work remain intact.

## Module contract (pre-generation design)

`scripts/preview.py` owns CLI start/status/list/stop/reconcile, a locked atomic registry, allowed project roots, owned process-group identities, health polling and two recoveries. argv commands execute inside the project container with development environment; no shell or host execution. start is idempotent; a different registration requires explicit stop before replacement. Occupied ports fail without adopting/killing their processes. Stop persists desired=stopped before termination. State survives the invoking CLI and process death; startup/health failures are bounded, and logs remain private.

`scripts/gateway.py` owns the WSL service and five loopback preview slots. It invokes only `docker exec paperclip-local python3 <fixed preview path> reconcile` and reads the fixed container IP. HTTP/WebSocket forwarding goes only to registered ports; the HTTP Host is rewritten for the local dev server, with response bytes and upgrades forwarded unchanged. No arbitrary host commands, credential access, Docker socket for Agents, new third-party packages, or production hosting. Tailscale Serve setup is deployment administration, not an Agent CLI operation.

Source files: SKILL.md, agents/openai.yaml, these two scripts, tests/test_preview.py and tests/test_gateway.py. Public behavior tests use CLI subprocesses and the gateway connection entry, not registry-private helpers. Success: start→ready→HTTP→caller exits→still ready→stop. Failure: conflicting spec/occupied port/cwd outside roots/failed startup/restart limit; separate projects stay unaffected. Recovery uses process start ticks and pgid to avoid PID reuse. A private runtime config supplies allowed roots, preview base and five slot ports. There is no adopted Python architecture check; report this gap. Fast verification: Python compilation and focused unittest discovery. Full relevant verification: all new tests, `node scripts/check-skills.mjs`, skill-creator quick_validate, live isolated fixture plus real project preview. Existing unrelated app-use Windows suites are outside this change.

## Acceptance criteria

- [x] Lifecycle and forwarding behavior tests pass.
- [x] Skill validates and uses real deployed commands.
- [x] Live deployment evidence and retained preview linked from control ISSUE-0027.

## Authorization

Owner explicitly requested implementation and operational deployment of this workflow; no Git commit/push or production release requested.

## Verification

2026-11-03: `python3 -m unittest discover -s skills/engineering/dev-preview/tests -p 'test_*.py'` passed10tests on Linux. Python syntax, skill-creator quick_validate and `node scripts/check-skills.mjs` passed (27skills). Public-interface tests cover lifecycle, identity-preserving stop, concurrency, occupied ports, startup failure and bounded crash recovery, configured environment and HTTP/WebSocket forwarding. Fixed-source read-only review found no remaining P0/P1 issue. No Python architecture checker is configured.

Deployment and real project verification are in fubufu-agent-control `docs/operations/evidence/2026-11-03-managed-dev-preview.md`, source hashes in `managed-dev-preview-lock.json`, operational lifecycle in `docs/operations/dev-preview.md`, all linked by control ISSUE-0027. Real retained dev, build, six browser steps, Tailnet HTTP/assets/WebSocket and host-reconciler recovery passed; no independent remote-device or seven-role run is claimed.

## Completion summary

Added the dev-preview skill, persistent CLI manager, private WSL gateway, canonical systemd asset and10behavior tests. Installed deployment uses explicit role instructions without changing pre-existing native Skill bindings. Source remains uncommitted; no dependency upgrade or production release.

## Activity log

- 2026-11-03: Owner-authorized implementation and live deployment verification completed; evidence recorded before closure.

### 2026-11-03 — Status changed from in-progress to done.
