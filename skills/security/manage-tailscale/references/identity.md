# Identity and unattended automation

## Prefer an existing identity

Read the backend state and relevant self/peer identity from `tailscale status --json` inside the tool runtime. Return only the minimal selected fields. `Running`, an IP address, or a historical peer name alone does not prove membership in the intended network. Compare the control server and expected owner/tailnet; do not switch accounts automatically when they differ.

If already authenticated to the intended network, configure only the required delta. If stopped but enrolled, bring it online without forcing reauthentication. Treat `NeedsLogin` and `NeedsMachineAuth` separately: the latter needs device approval, not repeated credential submission.

## Noninteractive enrollment

Use an existing user-authorized secret provider first. Discover a credentials skill/connector only when available; it is an optional integration, not a prerequisite for this skill. Accept a protected auth-key file path or retrieve the authorized key directly into a protected temporary file without returning its value through tool output.

Before enrollment verify the selected credential is intended for this tailnet and node role. Prefer a short-lived, single-use auth key. Persistent NAS nodes should not be made ephemeral merely to simplify cleanup. Tags change device ownership and access policy: use only approved existing tags and verify that the user's client can reach tagged nodes. Auth-key expiry and node-key expiry are different; do not disable node expiry globally to avoid maintenance.

Current CLI help supports `--auth-key=file:<absolute-path>` on `up`. Check local support first. An illustrative fresh Linux enrollment is:

```bash
sudo tailscale up --auth-key=file:/run/private/tailscale-auth-key --hostname=nas-node --accept-dns=false --accept-routes=false --timeout=30s
```

The file must already exist with access restricted to the invoking account/root; it is not a filename to copy blindly. On Windows, pass a single quoted argument such as `--auth-key=file:C:\protected\tailscale-auth-key` to the discovered executable and restrict its ACL first. Do not expand the key into command arguments, shell history, logs, a `set -x` trace, or chat. An environment variable expanded on a command line can still reveal its value in process arguments. If the installed CLI lacks a safe file mechanism, use an approved secret-safe mechanism or stop; do not fall back to printing the key.

For a fresh private-access-only deployment, leaving current DNS and default routes intact is the starting point. Do not impose these flags on an existing node with deliberately configured DNS/routes. Observe the resulting state and expected node identity after enrollment; a timeout can mean approval is still pending, not an installation failure.

No existing session or authorized key means initial login is interactive. Present the official enrollment page to the user and request only login/approval, never passwords, MFA codes, or keys in chat. Do not repeatedly regenerate the login URL. Browser login success is not proof that the device enrollment was approved: recheck backend state.

## Control-plane operations

An enrollment auth key is not an API credential. If route/device approval or policy editing is needed, use an existing, appropriately scoped OAuth/API credential through the official [API](https://tailscale.com/api). Resolve device IDs from authenticated discovery; do not guess them from display names or IPs.

Automatic creation of auth keys or changes to device/route approval require explicit scope and the necessary API privileges. Inspect current state, send credentials via a protected in-process HTTP client/header without logging them, apply the exact intended delta, and reread the resource. Do not put expanded bearer tokens in `curl` command arguments. OAuth token exchange and key creation must follow the current official schema; do not invent endpoints, grant types, tags, or scopes.

Preserve unrelated approvals and policies. A route-list update can replace the complete enabled set; merge deliberately and account for concurrent changes. Do not install broad `autoApprovers` or allow-all grants to avoid a one-time human approval. If credentials are absent or permissions are denied, stop that mutation and identify the exact approval needed. Never scrape browser storage or use another account to evade access control.

## Sources

- [Auth keys](https://tailscale.com/docs/features/access-control/auth-keys): enrollment properties and approval behavior.
- [Secure auth-key handling](https://tailscale.com/docs/features/access-control/auth-keys/how-to/secure-auth-keys): credential exposure risks.
- [OAuth clients](https://tailscale.com/docs/features/oauth-clients): scoped automation prerequisites.
- [Server setup](https://tailscale.com/docs/how-to/set-up-servers): server identity and tags.
- [CLI](https://tailscale.com/kb/1080/cli): verify flags against the installed CLI; `up --help` file-key and `set --help` behavior checked with 1.102.3 on 2026-08-28, not a required minimum version.
