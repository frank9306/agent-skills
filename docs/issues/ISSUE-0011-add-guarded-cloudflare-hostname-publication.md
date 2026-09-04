---
id: ISSUE-0011
title: "Add guarded Cloudflare hostname publication"
status: done
priority: high
created: 2026-09-01
updated: 2026-09-01
closed: 2026-09-01
related_adrs: []
depends_on: []
---

# ISSUE-0011: Add guarded Cloudflare hostname publication

## Problem

The manage-cloudflare CLI can only update an existing Tunnel ingress service and inspect DNS. It cannot safely add a missing hostname ingress rule or create/update its proxied Tunnel CNAME, which blocks restoring state.webfrank.top through the current online Tunnel.

## Desired outcome

Add deterministic dry-run-first commands that safely ensure a hostname ingress rule and a proxied Tunnel CNAME while preserving unrelated configuration, enforcing exact preconditions, and writing rollback snapshots before apply.

## Acceptance criteria

- [x] Add a guarded Tunnel ingress ensure operation that inserts a missing hostname before the final catch-all or updates exactly one matching rule.
- [x] Preserve unrelated ingress rules and reject duplicate hostnames, missing catch-all rules, and unexpected existing services.
- [x] Add a guarded DNS ensure operation for a proxied CNAME to `<tunnel-id>.cfargotunnel.com`, with explicit absent/existing preconditions.
- [x] Keep both writes dry-run by default and require a protected rollback snapshot plus `--apply` for mutation.
- [x] Document the new commands and least-privilege API permissions without weakening credential handling.
- [x] Add deterministic tests for create, update, rejection, preservation, snapshot, dry-run, and apply behavior.
- [x] Pass focused tests, repository checks, diff checks, and a sensitive-value scan.

## Out of scope

- Changing nameservers, account billing, Tunnel credentials, Access policy, or unrelated DNS records.
- Persisting Cloudflare API tokens or sensitive account data in the repository.

## Decisions

- Reuse the existing dependency-free REST client and full-config read/modify/write model.
- Require callers to state whether DNS and ingress resources are expected to be absent or to match an exact old value before replacement.

## Implementation notes

Added `ensure-ingress-hostname` and `ensure-dns-tunnel-cname` to the dependency-free REST CLI. Both commands enforce explicit absence or exact-old-value preconditions, default to dry-run, and require an exclusive protected snapshot before apply. Tunnel writes preserve the complete configuration and final catch-all; DNS writes use an exact hostname lookup and a proxied Tunnel CNAME payload.

## Verification

16 focused tests, py_compile, 21-Skill validation, full npm test, diff check, sensitive-value scan, and read-only review passed; live API use awaits an injected scoped token.

## Activity log

### 2026-09-01 — Created

Issue created from the supplied project input.

### 2026-09-01 — Status changed from proposed to ready.

### 2026-09-01 — Status changed from ready to in-progress.

### 2026-09-01 — Status changed from in-progress to done.

## Completion summary

Added guarded dry-run-first Tunnel hostname ingress and proxied Tunnel CNAME ensure operations with exact preconditions and rollback snapshots.
