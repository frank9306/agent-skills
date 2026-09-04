---
name: manage-cloudflare
description: Inspect and safely manage Cloudflare Tunnel ingress, proxied DNS records, and Access applications or policies through the official REST API. Use for Cloudflare public-hostname discovery, guarded updates, rollback, and least-privilege troubleshooting; do not use for unrelated Cloudflare products or browser-only administration.
---

# Manage Cloudflare

Use `scripts/cloudflare_control.py` as the deterministic interface. Prefer the REST API for remotely managed Tunnels. Use `cloudflared` only for locally managed configuration, and Terraform only when the resource is already owned by Terraform; never let two backends manage the same resource.

## Credentials

Accept only a scoped API token from `CLOUDFLARE_API_TOKEN` or a path in `CLOUDFLARE_API_TOKEN_FILE`. Never request the token in chat, pass it on the command line, print it, or store it in a repository. A Tunnel run token is not an account API token.

Use the narrowest permissions and resources that fit the operation:

- Tunnel discovery/change: target account, `Cloudflare Tunnel Read` or `Edit`.
- Access discovery/change: target account, `Access: Apps and Policies Read` or `Edit`.
- DNS discovery/change: target zone, `DNS Read` or `Write`; add `Zone Read` only when zone discovery is required.

Read [references/api-and-recovery.md](references/api-and-recovery.md) before a write, credential rotation, or recovery operation.

## Workflow

1. Discover exact account, zone, Tunnel, DNS, Access application, and policy IDs with read commands. Never guess IDs.
2. Read the complete current Tunnel configuration before editing ingress. Determine whether `config_src` is Cloudflare-managed.
3. For a write, state the exact account, zone, resource, old value, new value, verification, and rollback action. Follow the active project's authorization policy.
4. Run the mutation command without `--apply` first. Review its JSON plan.
5. For an existing Tunnel ingress rule, require an exact `--expected-service`; omit it only when the hostname must be absent. Keep every unrelated rule unchanged, keep the catch-all rule last, and provide `--snapshot-file` when applying.
6. For a Tunnel DNS CNAME, require an exact `--expected-target`; omit it only when the record must be absent. Always use the discovered Tunnel ID and a proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
7. Apply only after scoped authorization, then re-read the resource and test both the origin path and the public hostname. Verify Access blocks an unauthenticated request before treating a private origin as safely published.
8. If verification fails, restore from the protected snapshot or apply the explicitly recorded inverse change. Stop after one failed retry unless the project authorizes further investigation.

## Commands

Run `python scripts/cloudflare_control.py --help`. Discovery commands cover accounts, zones, DNS records, Tunnels, Tunnel configuration, Access applications, and Access policies. `update-ingress-service` updates an existing service. `ensure-ingress-hostname` creates an absent hostname rule before the final catch-all or updates one exact existing rule. `ensure-dns-tunnel-cname` creates an absent proxied Tunnel CNAME or updates one exact existing CNAME. All mutation commands default to dry-run and require `--snapshot-file` with `--apply`.

Do not expose an internal administration UI through Tunnel without an Access application and restrictive allow policy. Do not alter the final catch-all ingress rule, overwrite a configuration assembled from partial data, or put credentials into rollback evidence.
