---
name: manage-tailscale
description: Inspect, install, configure, troubleshoot, and maintain Tailscale on Windows, Linux, NAS devices, and private service gateways. Use for unattended enrollment, private Web or SSH access, subnet routing, and direct-versus-relay diagnosis; not for public service publishing or unrelated proxy configuration.
---

# Manage Tailscale

Own the requested result through verification: a working private service URL or a diagnosed connectivity problem, not merely an installed package. Execute authorized steps using official CLI/API and the existing platform package manager. Do not hand the user a command list when the available tools can do the work.

## Automation contract

- Reuse working installations, authenticated sessions, existing authorized secret providers, and known topology. Do not reinstall or ask for login simply because a GUI is absent.
- An explicit install/configure request authorizes ordinary in-scope steps subject to project policy. Explain the concrete change once; do not repeatedly request the same granted permission. Inspection or advice alone does not authorize mutation.
- Unattended completion requires OS privileges, a usable authenticated session or authorized enrollment credential, and any required device/route approval rights. If these are absent, finish independent safe work, then ask for the smallest specific action. Never promise to bypass UAC, MFA, device approval, secret-store unlock, or tool restrictions.
- Private service access does not imply authority to enable Funnel, open public ports, change an exit node, replace DNS, enable Tailscale SSH, admit other users, or publish the entire LAN. Preserve the current control channel until the requested replacement is verified and its retirement is authorized.
- Never place auth keys, OAuth secrets, login URLs, complete state/debug dumps, or personal device inventories in a reusable skill or repository. Read sensitive output into the tool runtime, select only required evidence, and redact before returning it.

## Select the mode

Read only the reference needed for the next action:

| Request or evidence | Reference |
|---|---|
| Check/install/update client, configure startup, or remove it | [Installation and lifecycle](references/installation.md) |
| Log in, enroll without interaction, approve a device, or access the API | [Identity and automation](references/identity.md) |
| Reach a Web UI, container, VM, SSH service, or private subnet | [Private service access](references/private-access.md) |
| Offline peer, slow relay, failed routing/DNS/HTTP, or incomplete acceptance | [Diagnostics and verification](references/diagnostics.md) |

## Inspect before changing

1. Read target project instructions and its known host/service inventory. Resolve the caller's client, Tailscale node, actual service host, protocol, port, and desired account/control server. Never infer a VM's address from its host's VPN address. Do targeted checks, not network or filesystem sweeps.
2. Check executable discovery, version, package ownership, daemon status, and `tailscale status --json` on the relevant devices. An old NAS app directory is not proof of a usable installation; a missing PATH entry is not proof of absence.
3. Inspect only relevant preferences and network state: DNS, default routes, existing advertised/accepted routes, Serve listeners, firewall restrictions, and an independent management path. Keep a protected, non-repository baseline for settings this task will change; do not copy full secret-bearing state files.
4. Compare desired and actual state. For a connected node, use `tailscale set` to change only requested preferences. `tailscale up` with flags requires a complete settings set; never add `--reset` to silence that warning or `--force-reauth` to make the workflow look fresh.
5. Resolve fresh install URLs and version-dependent flags from official docs and local `--help`, not a remembered release number. Sources are linked in each reference. No package upgrade is necessary merely to inspect a working client.

## Execute and finish

State the target, minimal delta, acceptance check, and rollback before mutation. Apply only that delta, inspect the result, and preserve unrelated settings. Retry a failed step at most once after a specific correction; do not retry authorization denials or disabled security checks through another tool or surface.

Enrollment, route advertisement, route approval, access policy, client route acceptance, service binding, and application login are separate gates. Verify all gates relevant to the request. Retain the normal service authentication; joining a tailnet does not make every device trustworthy.

Return the tested URL or command, client prerequisites, observed direct/relay path, what changed, and any remaining blocker. Distinguish package installation, online state, TCP reachability, HTTP response, rendered UI, and authenticated application use. If a browser policy blocks inspection, stop browser work and report the missing visual check; do not bypass it through another browser or a proxy.

Record confirmed target-specific facts only in the owning project's operational docs/Issue. Remove only temporary artifacts created by this operation when permitted, using verified exact paths; report leftovers if cleanup is blocked. Do not commit, globally install this skill, or schedule monitoring unless requested.
