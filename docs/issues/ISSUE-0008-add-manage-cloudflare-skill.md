---
id: ISSUE-0008
title: "Add manage-cloudflare skill"
status: done
priority: high
created: 2026-08-27
updated: 2026-08-27
closed: 2026-08-27
related_adrs: []
depends_on: []
---

# ISSUE-0008: Add manage-cloudflare skill

## Problem

Cloudflare Tunnel, DNS, and Access configuration lacks a reusable least-privilege API workflow and currently depends on browser UI changes.

## Desired outcome

Provide a validated manage-cloudflare Skill with a deterministic REST API CLI for discovery, safe tunnel ingress updates, DNS and Access inspection, rollback planning, and secret-safe credential injection.

## Acceptance criteria

- [x] Add a valid `manage-cloudflare` Skill with concise workflow and least-privilege guidance.
- [x] Add a dependency-free CLI that reads API tokens only from `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_API_TOKEN_FILE`.
- [x] Support account, zone, DNS record, Tunnel, Tunnel ingress, Access application, and Access policy discovery.
- [x] Support a guarded Tunnel ingress service update that preserves all rules and keeps the catch-all last.
- [x] Emit a protected rollback snapshot and require an explicit apply flag for writes.
- [x] Add deterministic tests for credential handling, ingress preservation, catch-all validation, and dry-run/apply behavior.
- [x] Pass Skill validation, repository checks, tests, diff checks, and a sensitive-value scan.

## Out of scope

- Creating Cloudflare accounts, changing nameservers or billing, or managing unrelated Cloudflare products.
- Storing API tokens, tunnel tokens, credentials JSON, Access service tokens, or Terraform state.
- Managing the same resources concurrently through Terraform and the REST workflow.

## Decisions

- Use Cloudflare REST API as the default backend for remotely managed Tunnels.
- Keep the first implementation dependency-free and JSON-oriented so it works on Windows, macOS, and Linux.
- Require exact account, Tunnel, hostname, expected service, and replacement service for ingress writes.

## Implementation notes

Added `skills/security/manage-cloudflare/` with a concise Skill entrypoint, official API and recovery reference, and dependency-free Python CLI. The CLI supports discovery for accounts, zones, DNS records, remotely managed Tunnels and their full configuration, Access applications, and Access policies. The guarded ingress update requires an exact old service, defaults to dry-run, preserves unrelated rules, validates the final catch-all, and requires a protected snapshot for apply.

## Verification

quick_validate passed; npm run check validated 19 Skills; 7 focused tests and the full npm test suite passed; py_compile, diff check, and focused secret scan passed.

## Activity log

### 2026-08-27 — Created

Issue created from the supplied project input.

### 2026-08-27 — Status changed from proposed to ready.

### 2026-08-27 — Status changed from ready to in-progress.

### 2026-08-27 — Implementation verified

Implemented and locally verified the first REST-backed `manage-cloudflare` workflow. No live Cloudflare write was attempted because no scoped account API token is currently injected or stored in the available credential locations.

### 2026-08-27 — First live workflow completed

Extended the CLI with guarded Access Application and owner-email policy creation plus origin `noTLSVerify` support. The consuming `feiniu-control` project used it to protect and publish an OpenWrt LuCI hostname; API readback, origin reachability, and unauthenticated Access interception passed without recording credentials or the allowed identity in this repository.

### 2026-08-27 — Status changed from in-progress to done.

## Completion summary

Delivered and validated manage-cloudflare with guarded REST discovery and Tunnel ingress updates; live use requires an externally injected scoped token.
