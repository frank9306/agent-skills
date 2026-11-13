# Task capsule

The capsule is an advisory progress display for one browser `ui-automation run` or interactive Windows `ui-automation desktop-task`. The CLI starts the capsule before broker binding and keeps it visible through actions, AI decisions, waits and cleanup. For a desktop task, finish or close stdin to end the capsule. Individual commands are available for diagnostics. Use `--no-statusbar` only for headless browser test harnesses.

The runner provides only the validated desktop HWND/PID, allowlisted action categories, and its final outcome. The renderer's stdin is private to its launcher and carries only those fields and the operator-supplied case ID. Use a short, non-sensitive case ID. Do not pass request payloads, page content, window titles, or credentials. The display has no authority over dispatch or verification. Only the runner's final `pass` shows “已验证”. Evidence is authoritative.

The host refreshes the last state every 500 ms, including during waits. The window reports a lost connection after two seconds, hides after three seconds, and closes on EOF. It is click-through and uses the desktop target monitor's work area and effective DPI. Chromium session IDs are not Win32 handles. Without a validated desktop target, the capsule uses the foreground monitor recorded at launch.

The lightband runs clockwise on a three-second cycle during active work and waits. The capsule reads the Windows client-area animation preference and uses a stationary highlight when animations are disabled. Terminal results and heartbeat loss use a static border. Run the pixel-level motion check on an interactive desktop with `pwsh -File tests/statusbar-lightband-live.ps1 -Executable native/StatusBar/dist/status-bar.exe`.

## Windows x64 distribution

Build once on a Windows x64 development machine from `native/StatusBar`:

```powershell
go test ./...
go build -trimpath -ldflags '-H=windowsgui -s -w' -o dist/status-bar.exe .
```

Distribute the resulting executable at `native/StatusBar/dist/status-bar.exe` with the Skill. End users only run the executable. Windows application control must allow the binary. A missing or blocked renderer is reported on stderr while the automation retains its normal result and evidence contract.
