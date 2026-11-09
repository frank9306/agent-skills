# Status bar event contract

状态条只消费本文件定义的事件。**事件只能由 .NET broker 在真实 dispatch 前后发出；CLI、扩展页面适配器与任何调用方都不得自报状态。** 原因是当前 `Broker.cs` 的桌面会话还缺调用方绑定，若允许客户端自报，状态条会变成可伪造的「正在操作」指示器；访问控制补齐前这条约束尤其重要。

## Schema

单行 JSON，字段白名单如下，其余字段一律丢弃（防止页面正文、`secretEnv` 值、凭据进入状态条）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `session` | string | 必填，会话 id |
| `runId` | string | 可选，冻结用例的 run id |
| `seq` | integer ≥ 0 | 必填，broker 单调序号，用于丢弃乱序／重复事件 |
| `at` | number | 必填，broker 时间戳（Unix ms） |
| `phase` | enum | 必填：`armed` / `observe` / `act` / `validate` / `verified` / `blocked` / `unknown` |
| `verb` | string ≤ 32 | 必填，动作白名单名，如 `click` / `validate` / `guard` |
| `target` | string ≤ 80 | 可选，结构化目标短名，超长截断；不得放页面正文原文 |
| `app` | string | 可选，绑定窗口／浏览器名 |
| `actionExecuted` | boolean | 动作是否已发出，默认 false |
| `goalVerified` | boolean | 目标是否经新观察验证，默认 false |
| `expiresAt` | number | 可选，事件有效期；消费端丢弃过期事件 |

`phase` 与两个布尔值的语义必须分开：`actionExecuted:true, goalVerified:false` 只表示动作已发出，不代表目标达成。终态 `verified` / `blocked` 触发描边定格。

## Transport and lifecycle

- broker 在 `prepare` 成功后发首个 `armed` 事件，在 `observe` / `act` / `validate` 前后各发一条，终态发 `verified` 或 `blocked`。
- 无论有无动作，broker 每 500ms 发一次心跳（可复用最新 `seq` 的 `armed`/`act` 事件或专用 `heartbeat` 行）。
- 事件同时写入 `evidence.mjs` 的 `events.jsonl`，与 `runId` 绑定，便于 `inspectRun` 回放。
- 消费端 `scripts/statusbar-client.mjs` 负责：丢弃乱序／重复／过期事件、2s 无心跳转 `unknown`、3s 后隐藏、`stop` 立即隐藏。
- **心跳静默时禁止保留行进动画**：`unknown` 一律用灰色静止虚线，绝不留下一条仍在跑的胶囊。

## Privacy

`verb` 走白名单，`target` 只放短名并在 broker 侧截断；密码字段、`secretEnv` 值、页面正文一律不发。`capture refused` 期间的截图不进入事件。状态条进程不接触明文。

## Status

**协议设计已定稿，broker 侧推送尚未实现**（需要 C# 改动与 .NET 10 SDK 构建）。`statusbar-client.mjs` 消费端已实现并有单元测试；在 broker 接入前不要把它接到生产 CLI，否则会因为没有事件源而一直处于隐藏状态。

## Overlay backends（已实现）

状态条的窗口由两个后端之一实现，事件协议完全一致，host 会自动选择：

| 后端 | 文件 | 说明 |
|---|---|---|
| Go | `native/StatusBar/main.go` → `status-bar.exe` | Win32 + GDI 直接实现；机器允许运行未签名 exe 时优先使用 |
| PowerShell | `native/StatusBar/status-bar-native.ps1` | `Add-Type` 内存编译 C# P/Invoke，等价实现同一窗口 |

**为什么需要降级**：开启 Smart App Control（Windows Defender Application Control 强制模式）的机器会拦截所有新编译／未签名 exe——包括 Go 产物和任何 Node 原生模块（`.node` 同样被拦）。`powershell.exe` 由 Microsoft 签名因而可信，`Add-Type` 在内存中编译，不受 SAC 约束。`scripts/statusbar-host.mjs` 先探测 Go 产物是否可运行，不可运行则回退到 PowerShell。

窗口扩展样式（两个后端一致）：`WS_EX_NOACTIVATE | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_LAYERED`，实测 `exStyle=0x080800A8`。

### 实现注意事项（踩过的坑）

- **`ShowWindow` 必须从窗口自己的线程发起**。跨线程调用（含在消息循环启动前调用）会被静默丢弃，窗口不会显示。正确做法是 `PostMessage(hwnd, WM_APP_SHOW, ...)`，在 `WndProc` 里执行。
- **`.ps1` 必须是 UTF-8 with BOM**。Windows PowerShell 5.1 按 ANSI(GBK) 读取无 BOM 文件，C# 源码里的中文字面量会被解成乱码并破坏字符串边界。
- **`Add-Type` 里的 `DllImport` 必须显式 `CharSet.Unicode`**。`CreateFontIndirect` 漏写会解析到 ANSI 版本，传 LOGFONTW 布局导致字形被拉伸变形。`LOGFONT` 结构体本身也要标 `CharSet = CharSet.Unicode`，字段上的 `MarshalAs` 没有 `CharSet` 属性。
- **PowerShell scriptblock 不能在没有 runspace 的线程上执行**。stdin 读取必须写在 C# 里用 `System.Threading.Thread`。
- **`UIAutomationClient` / `UIAutomationTypes` 不在 GAC**，需从 `Framework64\v4.0.30319\WPF\` 按完整路径加载；`Rect` 需要额外引用 `WindowsBase.dll`。注意命名空间是 `System.Windows.Automation`，`UIAutomationClient` 只是程序集名。

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

