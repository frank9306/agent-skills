# Task capsule

The capsule is an advisory progress display for one `app-use run`. A case starts after validation and stays visible through its actions, waits, assertions, capture, and cleanup. Individual commands are available for read-only preparation and diagnostics. Execute each GUI task in a single run, including visual decisions and the final verification. Use `--no-statusbar` only for headless test harnesses.

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

For a live check, point `APP_USE_HOME` at a prepared test broker and place the published Fixture at `fixture/Fixture.exe` under that directory. Run `pwsh -File tests/statusbar-live.ps1 -Work <evidence-directory>` from the Skill directory. The fixture holds a case in a wait, verifies native styles and geometry, and moves to a second display when one is available. Use `-RequireMixedDpi` for acceptance. The check fails if fewer than two displays are active or the capsule does not move between different effective DPI values. A null `secondaryDpi` in a diagnostic run means no secondary display was tested.

## Desktop UI automation（已验证）

`native/MoleUI/mole-ui.ps1` 用 UI Automation 驱动 WinUI 3 应用（Mole 清理工具），验证脚本 `scripts/mole-cleanup.mjs`。

WinUI 3 的控件对 Win32 子窗口枚举不可见，必须走 UIA。已验证的 Mole 界面状态机（AutomationId）：

| 状态 | AutomationId | 说明 |
|---|---|---|
| 清理标签页 | `tab.clean` | |
| 起始页 | `clean.scan` | "扫描电脑" |
| 扫描完成 | `ReviewResultsButton` / `FoundRescanLink` | "查看结果" / "重新扫描" |
| 评审面板 | `PresetAll` / `PresetRecommended` | "全选" / "推荐"——**未选中任何分类时不会渲染清理按钮** |
| 清理按钮 | `clean.review.clean` | "永久清理 N GB"，仅在有选中项时出现 |
| 完成页 | `CompletedDetail` / `ReturnButton` | "返回地球" |

注意评审面板与扫描完成页在**同一个顶层窗口**内共存，自动化时需按上表逐级推进，不能只找按钮文案。

