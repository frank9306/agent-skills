# Windows 桌面执行参考

## 桌面入口

在交互式 Windows 会话中运行 `powershell.exe -NoProfile -File "<技能目录>/scripts/desktop.ps1"`，追加对应参数：

| 参数 | 行为与输出 |
| --- | --- |
| `-Action list` | 返回可见窗口的 `windowId`、`processId` 和标题。 |
| `-Action launch-calculator` | 启动系统计算器并返回窗口列表。 |
| `-Action observe -WindowId <ID> -ProcessId <PID> -Screenshot <PNG 路径>` | 使用绑定窗口的 ID 和 PID。返回控件的 ID、名称和可调用状态，保存最长边不超过 1500 像素的窗口截图。过程截图使用临时路径。 |
| `-Action invoke -WindowId <ID> -ProcessId <PID> -ControlId <控件 ID>` | 通过 Windows UI Automation 调用一个支持 Invoke 的控件。使用本轮观察中唯一且可调用的 ID，调用后重新观察。 |

## 状态栏与控件光环

状态栏边缘的亮点沿圆角边框循环移动。蓝色双描边光圈跟随真实鼠标，白色光环标记自动化正在操作的控件。启用 Windows 减少动效时，使用静态边框和光圈。任务结束时鼠标光圈立即收起。

为当前任务创建空的 UTF-8 事件文件，使用其绝对路径启动一次浮层进程。

```powershell
Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @(
    '-NoProfile', '-STA', '-File', '"<技能目录>/scripts/feedback.ps1"',
    '-Events', '"<事件文件绝对路径>"', '-WindowId', '<ID>', '-OwnerId', '<PID>',
    '-StartedTick', '<首次检查目标前记录的 Stopwatch.GetTimestamp()>'
)
```

向文件追加 UTF-8 JSON 行。普通事件包含 `phase` 和 `message`。状态可用 `observe`（观察）、`decide`（决策）、`wait`（等待）、`fallback`（接手）、`verify`（核验）、`success`（成功）、`failure`（失败）或 `cancel`（取消）。每次 `invoke` 传入 `-FeedbackEvents <同一事件文件绝对路径>`，由桌面入口发布控件定位与调用反馈。

任务结束时追加结束事件，可附上 `elapsedSeconds`，让状态栏冻结在报告使用的耗时。等待浮层退出后清理事件文件。目标窗口消失时浮层自行关闭，连续 90 秒无事件也会退出。验收可传入 `-EvidenceDirectory <空目录>` 保存浮层渲染截图。浮层使用独立窗口，目标窗口截图仍由桌面入口生成。

## Jev 决策

运行 `python "<技能目录>/scripts/jev-next.py" "<PNG 路径>" "<决策 JSON 路径>"`。用 UTF-8 保存决策 JSON。以下示例对应计算器已输入 `7` 的一轮。控件 ID 须来自实际观察。

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

成功时脚本输出 `choice` 和 `confidence`，例如 `{"choice":"plusButton","confidence":1.0}`。控件 ID 交给桌面入口执行。若候选包含等待或核验等流程动作，由当前对话按其含义处理，再观察窗口。失败时脚本以非零退出码返回 `fallback` 和原因。

脚本通过 TypeSafe System One 的 `POST https://api.typesafe.ai/v1/systemone` 调用 `jev-latest`，从 `TYPESAFE_API_KEY` 读取凭据。截图作为图片资源在 `state` 中引用，请求头包含 `TypeSafe-Danger-Zone-Images: true`。候选通过 Choice 的 `criteria` 提交。 [图片请求契约](https://docs.typesafe.ai/images.md) · [Choice 契约](https://docs.typesafe.ai/primitives/choice.md)

## 故障注入

验收兜底时，在指定轮次的 Jev 命令末尾追加 `--simulate-failure`。脚本在发出请求前注入超时，退出码为 `1`，输出：

```json
{"fallback": true, "reason": "Injected Jev timeout; no request sent"}
```

当前 LLM 根据最新截图和已确认进度判断下一步，仍通过桌面入口执行。重新观察并核验结果，在报告中注明故障为本地注入。
