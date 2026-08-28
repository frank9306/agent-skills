# Private service access

Map the complete path before choosing configuration:

`client -> Tailscale peer -> optional private hop -> actual listener -> application`

Use the owning project's service inventory and a targeted source-side request to establish where the service actually runs. Do not copy example addresses or historical peer addresses into a live configuration.

## Choose the narrowest path

| Actual service location | Preferred path |
|---|---|
| Tailscale node, listening on its VPN or wildcard address | VPN IP plus actual protocol/port; verify firewall and access policy |
| Container with a published host port | Node VPN IP plus published port, not container-only port |
| Loopback-only Web service on the node | Authorized Tailscale Serve or an existing private reverse proxy |
| VM/router/other LAN machine | Client on that machine, a narrow subnet route through a reachable gateway, or a single-service private proxy |

A hypervisor's VPN IP does not expose guest ports. In particular, macvtap can block host-to-guest LAN communication even when another LAN client can connect; use a verified hostlink or another reachable gateway. If only one Web service is requested, do not automatically expose an entire guest subnet.

## Subnet routing

Follow the current [subnet router guide](https://tailscale.com/docs/features/subnet-routers). Four distinct controls must agree: router advertisement, administrative route approval, tailnet access policy, and client route acceptance. Advertising alone is not success.

1. Confirm the gateway can reach the exact target IP/port and identify overlapping client LAN routes. Prefer a host route (`/32` IPv4 or `/128` IPv6) for a single device when sufficient; a host route still exposes multiple ports unless policy narrows access.
2. Read existing advertised routes and forwarding/firewall settings. Add only the requested route, preserving the rest. `tailscale set --advertise-routes=<merged-list>` replaces the advertised set rather than appending it.
3. Enable only required IP forwarding, persist it through the native configuration owner, and allow only the needed forwarding path. Save old values and use a task-owned config file only when appropriate. Do not flush firewall rules or disable the NAS firewall.
4. Approve the exact new route using authorized API rights or an already applicable auto-approval policy. Preserve other enabled routes. If approval rights are missing, request the one required approval instead of loosening policy.
5. Ensure least-privilege grants/ACLs allow the intended client identity to the target protocol and port. Do not assume the default policy is restrictive; explicitly inspect effective access before calling the result private to its owner.
6. Inspect route acceptance on the client; enable it only for this workflow with awareness that it may accept other approved routes too. Check overlap/priority and test the selected route. Do not enable an exit node for ordinary subnet access.
7. Keep default subnet SNAT unless there is a confirmed source-IP requirement. Disabling SNAT requires a verified return route and target firewall changes; do not silently introduce asymmetric routing.
8. Test from the actual remote client using the target's private address and service port. Verify that the control channel and unrelated DNS/default routes still work.

## Serve and reverse proxies

Read [Serve CLI documentation](https://tailscale.com/docs/reference/tailscale-cli/serve) and installed help before editing. Inspect `tailscale serve status --json` and save the exact affected configuration. Do not reset all Serve configuration.

For an already verified loopback Web listener, an authorized example is `tailscale serve --bg --https=443 http://127.0.0.1:3000`. Check for existing listener/path conflicts first. Obtain any required HTTPS/MagicDNS approval; return the actual URL reported by Serve and test it. Do not fabricate a `.ts.net` name from the hostname.

Serve is private; Funnel is public and is outside this skill's default scope. Keep application login protections. Do not use a directory or static-text placeholder as a substitute for the user's real Web service. Certificate issuance may disclose the device DNS name in public certificate transparency logs; account for that before enabling HTTPS names.

Do not assume Serve's HTTP proxy supports arbitrary remote VM targets. Use its documented local target support, or deploy an approved local reverse proxy to the VM first. Bind the proxy only to loopback/VPN as appropriate, handle WebSockets and required Host/Origin values, and persist through the existing service owner. Do not introduce a new proxy stack when an existing one suffices.

## URLs, DNS, and rollback

IP access does not supply a valid HTTPS certificate or bypass Host-based routing. Prefer a valid application hostname with scoped DNS where needed. Preserve existing DNS policy; MagicDNS alone does not define arbitrary application subdomains. A returned HTTP login page is not proof that application authentication works.

Record the original route lists, approvals, relevant policies, preference values, and changed proxy listeners. Rollback removes only the new listener/route and restores exact previous values without deleting other routes. Disabling forwarding can break unrelated workloads, so restore it only when this task changed it and no new dependency exists. Never close the fallback management channel before remote acceptance.
