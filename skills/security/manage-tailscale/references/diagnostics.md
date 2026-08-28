# Diagnostics and verification

Use bounded checks for the requested path, not an inventory sweep. Match command flags to installed `--help` and keep raw account/state information out of logs and repositories.

## Layered checks

| Layer | Focused evidence | What it does not prove |
|---|---|---|
| Installation | Executable version, package owner, service active/enabled | Enrolled or reachable |
| Identity | Backend state, current self ID/IP, expected tailnet, relevant peer online | Route approval or application access |
| Overlay | `tailscale ping --c 3 <peer>` and selected status fields | TCP port, application login, or permanent direct connectivity |
| Route/service | Route to exact target and targeted TCP/HTTP check | All services on that host work |
| Web response | Status, redirect destination, title or known marker | Browser rendering or authenticated workflows |
| User experience | Page renders on actual client, expected login/UI visible | Performance from other networks or survival through reboot |

For Windows HTTP testing, use the real `curl.exe` rather than the PowerShell alias. Example: `curl.exe --noproxy '*' --connect-timeout 10 --max-time 20 -sS -o NUL -w 'HTTP=%{http_code}\n' <verified-url>`. On Linux use `/dev/null`. Disable unrelated proxy use only for this diagnostic, not globally.

Inspect a redirect's destination before following it: it may point back to Cloudflare, an unreachable private host, or a different service. Verify that the final request still exercises the intended VPN path. Do not attach credentials to an untrusted redirect. Inspect a small application marker without dumping the entire page or cookies. A protected service's 401/403 can prove transport reachability but not successful authorized use.

Use available browser tools for visible acceptance only if allowed. A URL security denial is a stop condition: no alternate browser, forwarding tunnel, renamed host, raw CDP, or other workaround. Keep previously obtained CLI evidence distinct, ask the user to confirm rendering, and leave that acceptance item open.

## Diagnose the failing layer

- **No command but app directory exists:** verify package/app owner and documented executable path; do not install a duplicate daemon based on a PATH miss.
- **Service active, NeedsLogin/NeedsMachineAuth:** handle identity/approval; repeated reinstall cannot fix it.
- **Peer online, service unavailable:** check the actual listener and binding, published container port, host firewall, and tailnet policy. Do not treat ICMP/ping failure alone as proof that HTTP fails.
- **VPN host works, VM fails:** verify host-to-VM reachability, forwarding, approved route, client acceptance, return path, and overlapping subnet. The VM port is not automatically a host port.
- **IP works, name fails:** inspect the client's DNS acceptance and expected name source. Do not replace a functioning OpenWrt or corporate DNS setup merely to make one short name work.
- **HTTP works, browser fails:** inspect redirects, HTTPS certificate/name, required secure context, Host/Origin, and WebSocket behavior. Preserve security checks and authentication.
- **Key/route API request denied:** distinguish invalid credential type, scope, and resource ownership. No blind token rotation, privilege expansion, or repeated writes.
- **Package source fails TLS/GPG:** inspect the exact downloaded artifact and authentication chain. No `--insecure`, trusted unsigned source, or unrelated system upgrade.

## Direct versus relay

Use `tailscale ping`, `tailscale status`, and when justified `tailscale netcheck` on the affected endpoints. Treat netcheck's public endpoint information as sensitive. Tailscale can relay encrypted traffic when direct connectivity is unavailable; relay use is not enrollment failure. See [connection types](https://tailscale.com/docs/reference/connection-types).

Report the path and measured latency for this test only. Investigate UDP/NAT, firewall restrictions, proxy/TUN interactions, and network reachability before proposing changes. Never promise guaranteed direct connectivity. Do not globally disable a proxy, expose a public UDP port, or deploy paid/custom relay infrastructure without the corresponding scope and authorization. Offer these only if evidence and the user's performance need justify them.

## Close or hand off

For successful private Web access, deliver a tested URL plus whether the client needs Tailscale and whether additional application login remains. Record actual versions, minimal preference changes, route/approval evidence when applicable, direct/relay observation, HTTP result, and visual acceptance separately.

If blocked, state what already works, the exact missing permission/action, and the safe resume check. Do not rerun installation after a user completes login: check status first. Do not label the entire task complete from an installer exit code, a submitted browser navigation, or a ping. Report unremoved temporary artifacts without exposing their secret contents.
