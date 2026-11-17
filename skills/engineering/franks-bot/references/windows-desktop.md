# Windows 桌面执行参考

## 目标和观察

在交互式 Windows 会话运行 `powershell.exe -NoProfile -File "<技能目录>/scripts/desktop.ps1"`。

| 动作 | 参数和结果 |
| --- | --- |
| `list` | 返回可见窗口的 `windowId`、`processId`、标题和可读的可执行文件路径。 |
| `launch` | `-Executable <已授权的绝对 exe 路径>`。随后用 list 确认窗口或检查已有实例。 |
| `observe` | `-WindowId <ID> -ProcessId <PID> -Screenshot <PNG>`。可附 `-Observation <JSON>` 保存同轮坐标映射。输出控件的名称、AutomationId、类型、可操作性、状态、非密码值和窗口内物理边界。 |
| `window-state` | `-WindowId <ID> -ProcessId <PID>`。返回窗口是否可见、是否前景。隐藏到托盘后使用原窗口 ID。 |

动作都需绑定观察所得的窗口和 PID。每一步之后重读。名称或 ID 只能匹配一个可用控件。观察为坐标动作保存 JSON 后，读取同一截图并使用图像像素坐标，脚本会按截图比例换算并核对实际命中窗口。坐标从左上角算起。按显示器 DPI 适配的窗口用窗口截图。其他缩放窗口须处于前景，脚本从对应屏幕区域捕获，确保坐标与实际点击位置一致。

## 控件和键鼠

| 动作 | 参数和结果 |
| --- | --- |
| `invoke`、`toggle` | `-ControlId <AutomationId>` 或 `-ControlName <唯一名称>`。使用 UIA 对应模式。 |
| `click` | 控件 ID、唯一名称，或 `-Observation <JSON> -X <列> -Y <行>`。可选 `-MouseButton right`、`-ClickCount 2`。 |
| `hover` | 同 click 定位，不点击。回读 Windows 光标 `hand`、`ibeam`、`arrow`、`custom` 或 `hidden`。 |
| `type` | 控件 ID、唯一编辑框名称，或截图坐标。用 `-TextFile <UTF-8 文件>` 或 `-Text <普通文本>`。可加 `-ReplaceText` 清除旧值。参数和回执不复述文本。 |
| `key` | `-Keys <组合键>`，如 `Ctrl+A`、`Tab` 或 `Alt+F4`。先确认实际焦点。 |
| `scroll` | 同 click 定位，指定 `-WheelDelta <有符号值>`。正值上滚，负值下滚，以 120 为一档。 |
| `drag` | `-Observation <JSON> -X <起始列> -Y <起始行> -ToX <结束列> -ToY <结束行>`。起点与终点都须在已观察的绑定窗口。 |

## Windows 托盘

1. 保存主窗口的 ID 和 PID。隐藏后用 `window-state` 核对状态。
2. 用 `tray-open` 恢复窗口，或用 `tray-menu` 读右键菜单。两个动作都传 `-TrayName <托盘提示名>` 及 `-TrayIconId <已知注册 ID>` 或 `-TrayIconGuid <已知 GUID>`。脚本使用 Shell 注册位置与同一图标的名称双重核对，需要时展开隐藏图标。
3. 菜单动作使用 `tray-select -MenuId <上次返回的 ID> -MenuItem <准确标签>`，以及原窗口和 PID。确认菜单属于同一进程。菜单失效时重新打开。
4. 恢复验证窗口 ID 和可见状态。退出验证窗口、该应用的后台进程与监听端口。

注册 ID 以应用的配置或平台源码为准。NSH 0.5.x Windows 的 `Tray` 注册 ID 为 `1`，应用负责托盘提示名。该入口支持 Explorer 的原生图标和 HWND 所有的原生弹出菜单。自绘菜单用窗口观察和坐标动作。

## 状态栏与控件光环

状态栏边缘的亮点沿圆角边框循环移动。蓝色双描边光圈跟随真实鼠标，白色光环标记自动化正在操作的控件。启用 Windows 减少动效时，使用静态边框和光圈。任务结束时鼠标光圈立即收起。

单次键鼠或托盘动作默认显示状态栏、指针光圈和位置反馈。连续验收为已绑定窗口创建 UTF-8 事件文件，使用其绝对路径启动一次浮层进程，再把同一个文件传给本轮各动作。

```powershell
Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @(
    '-NoProfile', '-STA', '-File', '"<技能目录>/scripts/feedback.ps1"',
    '-Events', '"<事件文件绝对路径>"', '-WindowId', '<ID>', '-OwnerId', '<PID>',
    '-StartedTick', '<首次检查目标前记录的 Stopwatch.GetTimestamp()>'
)
```

向文件追加 UTF-8 JSON 行。普通事件包含 `phase` 和 `message`。状态可用 `observe`（观察）、`decide`（决策）、`wait`（等待）、`fallback`（接手）、`verify`（核验）、`success`（成功）、`failure`（失败）或 `cancel`（取消）。向各个键鼠、控件和托盘动作传入 `-FeedbackEvents <同一事件文件绝对路径>`，由桌面入口发布操作位置和结果。只有明确需要无浮层时才传 `-NoFeedback`。

任务结束时追加结束事件，可附上 `elapsedSeconds`，让状态栏冻结在报告使用的耗时。等待浮层退出后清理事件文件。关闭到托盘时保持浮层跟踪。目标进程或窗口销毁时浮层关闭，连续 90 秒无事件也会退出。验收可传入 `-EvidenceDirectory <空目录>` 保存浮层渲染截图。浮层使用独立窗口，目标窗口截图仍由桌面入口生成。

## Jev 决策

运行 `python "<技能目录>/scripts/jev-next.py" "<PNG 路径>" "<决策 JSON 路径>"`。用 UTF-8 保存决策 JSON。以下示例对应计算器已输入 `7` 的一轮。候选动作及其目标须来自实际观察。可使用控件 ID、唯一名称或截图位置。

```json
{
  "goal": "在 Windows 计算器中计算 7 + 5 并核验结果",
  "progress": "已输入 7，显示区读回 7",
  "candidates": {
    "plusButton": "按下加号",
    "num5Button": "按下数字 5",
    "equalButton": "按下等号",
    "no_match": "没有合适的操作"
  }
}
```

成功时脚本输出 `choice` 和 `confidence`，例如 `{"choice":"plusButton","confidence":1.0}`。将选中动作的参数交给桌面入口。若候选包含等待或核验等流程动作，由当前对话按其含义处理，再观察窗口。失败时脚本以非零退出码返回 `fallback` 和原因。

脚本通过 TypeSafe System One 的 `POST https://api.typesafe.ai/v1/systemone` 调用 `jev-latest`，从 `TYPESAFE_API_KEY` 读取凭据。截图作为图片资源在 `state` 中引用，请求头包含 `TypeSafe-Danger-Zone-Images: true`。候选通过 Choice 的 `criteria` 提交。 [图片请求契约](https://docs.typesafe.ai/images.md) · [Choice 契约](https://docs.typesafe.ai/primitives/choice.md)

## 故障注入

验收兜底时，在指定轮次的 Jev 命令末尾追加 `--simulate-failure`。脚本在发出请求前注入超时，退出码为 `1`，输出：

```json
{"fallback": true, "reason": "Injected Jev timeout; no request sent"}
```

当前 LLM 根据最新截图和已确认进度判断下一步，仍通过桌面入口执行。重新观察并核验结果，在报告中注明故障为本地注入。
