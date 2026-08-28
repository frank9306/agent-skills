# Installation and lifecycle

Use the current [Windows installation guide](https://tailscale.com/docs/install/windows), [Linux guide](https://tailscale.com/docs/install/linux), and [official stable packages](https://pkgs.tailscale.com/stable/). Check the target's architecture and support before selecting an artifact. Do not apply Debian package commands to every NAS or OpenWrt system.

## Windows

1. Discover `tailscale` with `Get-Command`; check the standard `C:\Program Files\Tailscale\tailscale.exe` location and the `Tailscale` service. Inspect alternate installation records only if needed. Use the existing client when healthy.
2. If absent, download the architecture-matched MSI from the official stable page into a unique task-owned temporary directory. Require `Get-AuthenticodeSignature` to return `Valid` and the expected Tailscale publisher before execution. Do not disable Windows reputation or signature checks.
3. Use the existing elevation mechanism. An elevated process can run `msiexec.exe /i <verified-msi> /qn /norestart /L*v <protected-log>`; otherwise an authorized `Start-Process -Verb RunAs -WindowStyle Hidden` may request user UAC approval. Shell arguments must quote paths correctly. Do not claim unattended install when UAC is waiting.
4. Wait for process completion. Interpret MSI exit 0 as success, 3010 as success with reboot required, and other codes as failures requiring diagnosis. Never reboot automatically. Verify installed version and service state independently of exit code.
5. Reopen executable discovery or use the known absolute path; the current shell's PATH may be stale. Reuse an existing authenticated profile after checking it is the intended tailnet.

For requested operation while the Windows user is logged out, use `tailscale set --unattended=true` if the installed CLI supports it. This changes execution to system mode and may require elevation. Record the previous setting, verify it, and distinguish configured startup from an actual reboot/logoff test. Do not log off or reboot a user's active machine to prove it. See [unattended mode](https://tailscale.com/docs/how-to/run-unattended).

## Linux and NAS

Check OS release, architecture, init system, `command -v tailscale`, the relevant package record, service status, and `/dev/net/tun` when kernel networking is intended. For a NAS, check the known app-manager installation path before introducing another owner. Never run two daemons against one node state. Container userspace networking does not provide host-wide inbound access automatically.

On supported Debian/Ubuntu installations, use the exact distribution's official signing key and source entry. Before writing, inspect whether those files already exist; preserve unrelated entries and do not overwrite administrator-managed content. Obtain authority for the named package and service changes.

- Download to task-owned files; check each command's exit status and non-empty output before installing source/key files. In Bash, use `set -euo pipefail` for pipelines. `curl | tee` without pipe failure handling can install an empty key even when the download failed.
- Refresh the intended source with normal signature verification. Install only Tailscale and required dependencies; inspect the package plan for removals or unrelated upgrades first. Do not run a general upgrade or autoremove.
- Enable/start `tailscaled` with the native service manager and verify both active and enabled state. Do not change authentication yet until the identity reference has been read.
- If HTTPS fetches fail, diagnose the named endpoint, DNS, clock, and proxy. One corrected retry can use verified official artifacts transferred over the already trusted management channel. Do not bypass TLS/GPG verification or use unaudited mirrors. An unverified `.deb` is not equivalent to an authenticated APT repository package.
- When sending shell scripts from Windows, use LF and check the remote exit code. A trailing CR can become part of a unit name. Prefer small, quoted, exact commands for sensitive mutations.

For unsupported NAS/app-manager setups, select the documented platform installation rather than forcing this recipe. A working native app is preferable to unnecessary migration. If only a container deployment is appropriate, explicitly evaluate required TUN access, network mode, persistent node state, and privileges; do not grant blanket privileged mode by default.

## Updates, rollback, removal

Use the existing installation owner and current [update guidance](https://tailscale.com/docs/install). Avoid changing release channels or automatically updating a healthy client for unrelated work. Preserve node identity and user preferences. Verify the same service URL after an upgrade; a package version check alone is insufficient.

Record inverse preference changes before applying them. For connectivity-affecting operations, keep an independent channel and a recovery plan. Roll back only task-owned deltas; never issue `tailscale down`, logout, stop the daemon, or uninstall over the sole remaining control channel.

Uninstall, device deletion, key revocation, and local state deletion are separate actions. Ask for the intended scope if ambiguous; follow the active deletion policy and never silently erase identity to resolve a login failure. A stale offline device does not authorize its deletion.

Clean only exact task-created artifacts after verification. Do not delete shared temp directories, user-provided key files, or existing package caches. If cleanup is denied, stop rather than switching languages or shells to evade the restriction.
