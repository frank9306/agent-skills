# 任务会话

`scripts/session.py --version` 返回运行文件版本和 SHA-256。使用 `python scripts/session.py --case case.json --output <新目录>` 执行。Windows 端需要 Windows PowerShell。本地 OCR 使用 Pillow 和 WinRT 的 Windows.Media.Ocr、Windows.Globalization、Windows.Graphics.Imaging 和 Windows.Security.Cryptography Python 包，模板另需 opencv-python-headless。用已授权的运行环境或 `uv run --with` 加载依赖。

## 用例

```json
{
  "target": {"kind": "windows", "windowId": 123, "processId": 456, "executable": "C:/path/app.exe"},
  "steps": [
    {"id": "archive", "action": "click", "target": {"name": "归档", "kind": "Button"},
     "expect": {"name": "搜索归档会话", "kind": "Edit"}, "capture": true},
    {"id": "search", "action": "type", "text": "星河", "target": {"name": "搜索归档会话", "kind": "Edit"},
     "expect": {"name": "搜索归档会话", "kind": "Edit", "equals": "星河"}, "capture": true}
  ]
}
```

Windows 选择器支持 `name`、`controlId`、`kind`、`key` 动作用 `keys`，托盘动作使用 `target.trayArgs` 传单步入口的参数。用 `textEnv` 指定敏感输入的环境变量名。原生断言包括控件 `count`、`equals`、`enabled`，以及 `visibleWindow`、`file`、`all`。默认回读限时 2 秒，步骤可设置 `timeoutMs`。同一任务只启动一次任务级浮层。输入动作派发前后都写日志，完成以断言通过为准。

多个已知步骤写入同一份用例，执行一次 `session.py`。遇到步骤需动态决定、等待人工操作、分批执行或切换软件、窗口与屏幕时，在一个长驻 Python 进程内持有同一个 `DesktopTarget`。分批调用 `run_case(case, target, output, finalize=False)`，每批写入独立输出目录。等待时用 `target.feedback("wait", message)` 更新说明。用 `target.bind_window(spec)` 按实际 HWND、PID 和程序路径绑定已观察到的新目标窗口，包括不同软件的窗口和原生弹窗。原窗口关闭或目标未就绪时维持浮层，并显示等待状态。切换后核验状态栏已跟到目标屏幕且鼠标光圈仍跟随指针，再操作新目标。只在整场结束时发送 `success`、`failure` 或 `cancel`，然后关闭目标。整个任务必须保持反馈开启，禁止使用 `noFeedback`。

## Windows 隐藏桌面

用户明确选择备用模式后，仍使用 `session.py --case <用例> --output <新目录>`。目标包含 `kind: "windows-hidden"`、`executable`（已授权的绝对 EXE 路径）、可选 `args`（参数数组）和 `title`（主窗口精确标题）。可用 `singleInstance: true` 跳过同名程序已运行的情况，KOI 默认启用。每步可用 `windowTitle` 绑定主窗口拥有的同进程弹窗，省略时作用于主窗口。

- 支持普通左击、控件切换、可写控件文本赋值及 `assert`（仅等待 `expect`，可选截图）。文本赋值走 UI Automation 或 Windows 原生 Edit 控件。截图走目标窗口，返回空白时该步骤失败。AI 视觉选框用于定向点击。
- 用例输出中的 `feedback.jsonl`、`actions.jsonl`、截图及 `hidden-status.json` 提供进度与证据。任务 ID 为输出目录的绝对路径。
- `--retained-status <输出目录>` 查看状态，`--cancel-hidden <输出目录>` 请求取消运行，`--close-retained <输出目录>` 尝试正常关闭保留的测试应用。全部步骤通过且应用退出后才返回 0，同名单实例跳过返回 3。其他测试或清理失败返回非零并保留可检查的现场。
- 自动关闭和显式关闭只作用于本任务启动的进程。遇到保存提示或应用拒绝正常退出时，读取状态中的清理错误和留存截图。

## 视觉分支

在步骤的 `target.visual` 中提供 `text`（OCR 默认语言 zh-CN）、`template`（模板的绝对路径）或两者。查找落空立即进下一层，一轮共享截图。只有存在候选且 `allowRemoteVision: true` 时才请求 Jev。在隔离演示数据上显式启用远程请求。模型兜底用 `aiReplyMs` 给当前模型一个有界等待时间。用例打印视觉请求 JSON 路径，模型读取其中指定的 PNG，并写入请求指定的回复文件，回复是 `{"box":[left,top,right,bottom]}` 或 `{"box":null}`。远程选择后重新截图并验证目标像素，再用受限坐标操作。

`actions.jsonl` 记录派发时间、与上次派发的毫秒间隔、视觉探测、技术和断言结果。`manifest.json` 将证据绑定到实际脚本哈希。关键状态和失败截图写入报告目录。

前台模式的定位、输入、UIA 操作和截图在每次执行时检查窗口，按需置前并回读。`feedback.jsonl` 的 `foreground` 事件记录检查/置前耗时、是否原已置前和是否超过 200 ms。窗口无法置前或坐标仍被遮挡时停止，属于目标的模态对话框需按其自身 HWND/PID 重新绑定。系统置前调用可能超过等待预算，按实际耗时报告。

Jev 保留原始 `choice`、概率、模型版本及失败原因，`no_match` 属于模型判断，按降级处理。编号截图保留最高 1568 像素边长，避免缩小界面文字造成无法识别。

## 旧 Chromium 用例兼容

真实浏览器网页测试按 [技能入口的工具选择](../SKILL.md#工具选择) 使用 `ego-browser`。以下契约供维护既有 CDP 接口和回归夹具时查阅。

旧浏览器对象使用 `kind: chromium`、`webSocketDebuggerUrl` 和准确的页面 `url`，依赖 Python 的 `websocket-client`。选择器与断言支持 `css`、可访问 `name`、`text`、`count`、`equals` 和 `all`。旧用例的任务级反馈沿用已验证的 Windows 窗口绑定。CDP 不移动系统鼠标，异步事件不延长命令期限。

Chrome 的 `chrome://inspect/#remote-debugging` 开启后，由用户确认连接授权。读取该 Chrome 资料目录的 `DevToolsActivePort` 两行（端口、browser 路径），拼为本机 `webSocketDebuggerUrl`；不要硬编码端口或从空白独立资料误认日常浏览器。browser 端点按用例 `url` 精确绑定已打开页面；同 URL 多页时提供 `targetId`，不任意挑选。支持 flatten session 的 Chrome 可直接使用，无需 `/json/version` 或 `/json/list`。

一个任务写成一个 case、多条 steps，并只启动一次 session.py。构造时建立一个 socket，定位、输入、断言和截图全部复用；任务结束关闭。`connectTimeoutMs` 默认 60000，留给用户授权；`commandTimeoutMs` 默认 2000。断线或命令失败停止，不自动重连，不重复输入；新任务需重新授权。`connection.jsonl` 记录 opened/bound/closed 与命令数，actions.jsonl 另记录 CDP 命中/落空耗时。该方式不承诺跨任务或浏览器重启免授权。

### 隐藏桌面直播与录像

Windows 预览组件放在 Skill 的 bin 目录，从 GitHub 检出后可按[构建说明](../desktop-preview/README.md)生成。在隐藏用例顶层增加 `"preview": {"ffmpeg": "C:/ffmpeg/bin/ffmpeg.exe"}`。批量验收可增加 `"headless": true` 避免打开播放窗口。通过或失败时封存 `recording/replay.mp4` 和步骤索引，正常关闭被测应用仍由隐藏会话管理。输入默认隐藏；仅在合成用例中可用 `previewSample` 指定公开样本文字。录像可用 `bin/desktop-player.exe --replay <recording目录>` 重新打开。
 # 任务会话

`scripts/session.py --version` 返回运行文件版本和 SHA-256。使用 `python scripts/session.py --case case.json --output <新目录>` 执行。Windows 端需要 Windows PowerShell。本地 OCR 使用 Pillow 和 WinRT 的 Windows.Media.Ocr、Windows.Globalization、Windows.Graphics.Imaging 和 Windows.Security.Cryptography Python 包，模板另需 opencv-python-headless。用已授权的运行环境或 `uv run --with` 加载依赖。

## 用例

```json
{
  "target": {"kind": "windows", "windowId": 123, "processId": 456, "executable": "C:/path/app.exe"},
  "steps": [
    {"id": "archive", "action": "click", "target": {"name": "归档", "kind": "Button"},
     "expect": {"name": "搜索归档会话", "kind": "Edit"}, "capture": true},
    {"id": "search", "action": "type", "text": "星河", "target": {"name": "搜索归档会话", "kind": "Edit"},
     "expect": {"name": "搜索归档会话", "kind": "Edit", "equals": "星河"}, "capture": true}
  ]
}
```

Windows 选择器支持 `name`、`controlId`、`kind`、`key` 动作用 `keys`，托盘动作使用 `target.trayArgs` 传单步入口的参数。用 `textEnv` 指定敏感输入的环境变量名。原生断言包括控件 `count`、`equals`、`enabled`，以及 `visibleWindow`、`file`、`all`。默认回读限时 2 秒，步骤可设置 `timeoutMs`。同一任务只启动一次任务级浮层。输入动作派发前后都写日志，完成以断言通过为准。

多个已知步骤写入同一份用例，执行一次 `session.py`。遇到步骤需动态决定、等待人工操作、分批执行或切换软件、窗口与屏幕时，在一个长驻 Python 进程内持有同一个 `DesktopTarget`。分批调用 `run_case(case, target, output, finalize=False)`，每批写入独立输出目录。等待时用 `target.feedback("wait", message)` 更新说明。用 `target.bind_window(spec)` 按实际 HWND、PID 和程序路径绑定已观察到的新目标窗口，包括不同软件的窗口和原生弹窗。原窗口关闭或目标未就绪时维持浮层，并显示等待状态。切换后核验状态栏已跟到目标屏幕且鼠标光圈仍跟随指针，再操作新目标。只在整场结束时发送 `success`、`failure` 或 `cancel`，然后关闭目标。整个任务必须保持反馈开启，禁止使用 `noFeedback`。

## Windows 隐藏桌面

仍使用 `session.py --case <用例> --output <新目录>`。目标包含 `kind: "windows-hidden"`、`executable`（已授权的绝对 EXE 路径）、可选 `args`（参数数组）和 `title`（主窗口精确标题）。可用 `singleInstance: true` 跳过同名程序已运行的情况，KOI 默认启用。每步可用 `windowTitle` 绑定主窗口拥有的同进程弹窗，省略时作用于主窗口。

- 适用用例应能用独立实例启动并唯一绑定目标窗口，能核对结果并正常退出。新应用先用合成数据验证启动、绑定和关闭。遇到已有同名单实例、启动后窗口转交其他进程或不能释放桌面时，报告该项结果，由用户决定使用何种执行方式。
- 启动前校验动作，仅接受 `click`、`toggle`、`type` 和 `assert`。遇到不支持的动作，退出码为 2，错误包含步骤 ID 和动作名称。
- 支持普通左击、控件切换、可写控件文本赋值及 `assert`（仅等待 `expect`，可选截图）。文本赋值走 UI Automation 或 Windows 原生 Edit 控件。截图走目标窗口，返回空白时该步骤失败。AI 视觉选框用于定向点击。
- 用例输出中的 `feedback.jsonl`、`actions.jsonl`、截图及 `hidden-status.json` 提供进度与证据。任务 ID 为输出目录的绝对路径。
- `--retained-status <输出目录>` 查看状态，`--cancel-hidden <输出目录>` 请求取消运行，`--close-retained <输出目录>` 尝试正常关闭保留的测试应用。全部步骤通过且应用退出后才返回 0，同名单实例跳过返回 3。其他测试或清理失败返回非零并保留可检查的现场。
- 自动关闭和显式关闭只作用于本任务启动的进程。遇到保存提示或应用拒绝正常退出时，读取状态中的清理错误和留存截图。

## 视觉分支

在步骤的 `target.visual` 中提供 `text`（OCR 默认语言 zh-CN）、`template`（模板的绝对路径）或两者。查找落空立即进下一层，一轮共享截图。只有存在候选且 `allowRemoteVision: true` 时才请求 Jev。在隔离演示数据上显式启用远程请求。模型兜底用 `aiReplyMs` 给当前模型一个有界等待时间。用例打印视觉请求 JSON 路径，模型读取其中指定的 PNG，并写入请求指定的回复文件，回复是 `{"box":[left,top,right,bottom]}` 或 `{"box":null}`。远程选择后重新截图并验证目标像素，再用受限坐标操作。

`actions.jsonl` 记录派发时间、与上次派发的毫秒间隔、视觉探测、技术和断言结果。`manifest.json` 将证据绑定到实际脚本哈希。关键状态和失败截图写入报告目录。

前台模式的定位、输入、UIA 操作和截图在每次执行时检查窗口，按需置前并回读。`feedback.jsonl` 的 `foreground` 事件记录检查/置前耗时、是否原已置前和是否超过 200 ms。窗口无法置前或坐标仍被遮挡时停止，属于目标的模态对话框需按其自身 HWND/PID 重新绑定。系统置前调用可能超过等待预算，按实际耗时报告。

Jev 保留原始 `choice`、概率、模型版本及失败原因，`no_match` 属于模型判断，按降级处理。编号截图保留最高 1568 像素边长，避免缩小界面文字造成无法识别。

## 旧 Chromium 用例兼容

真实浏览器网页测试按 [技能入口的工具选择](../SKILL.md#工具选择) 使用 `ego-browser`。以下契约供维护既有 CDP 接口和回归夹具时查阅。

旧浏览器对象使用 `kind: chromium`、`webSocketDebuggerUrl` 和准确的页面 `url`，依赖 Python 的 `websocket-client`。选择器与断言支持 `css`、可访问 `name`、`text`、`count`、`equals` 和 `all`。旧用例的任务级反馈沿用已验证的 Windows 窗口绑定。CDP 不移动系统鼠标，异步事件不延长命令期限。

Chrome 的 `chrome://inspect/#remote-debugging` 开启后，由用户确认连接授权。读取该 Chrome 资料目录的 `DevToolsActivePort` 两行（端口、browser 路径），拼为本机 `webSocketDebuggerUrl`；不要硬编码端口或从空白独立资料误认日常浏览器。browser 端点按用例 `url` 精确绑定已打开页面；同 URL 多页时提供 `targetId`，不任意挑选。支持 flatten session 的 Chrome 可直接使用，无需 `/json/version` 或 `/json/list`。

一个任务写成一个 case、多条 steps，并只启动一次 session.py。构造时建立一个 socket，定位、输入、断言和截图全部复用；任务结束关闭。`connectTimeoutMs` 默认 60000，留给用户授权；`commandTimeoutMs` 默认 2000。断线或命令失败停止，不自动重连，不重复输入；新任务需重新授权。`connection.jsonl` 记录 opened/bound/closed 与命令数，actions.jsonl 另记录 CDP 命中/落空耗时。该方式不承诺跨任务或浏览器重启免授权。

### 隐藏桌面直播与录像

Windows 预览组件放在 Skill 的 bin 目录，从 GitHub 检出后可按[构建说明](../desktop-preview/README.md)生成。在隐藏用例顶层增加 `"preview": {"ffmpeg": "C:/ffmpeg/bin/ffmpeg.exe"}`。批量验收可增加 `"headless": true` 避免打开播放窗口。通过或失败时封存 `recording/replay.mp4` 和步骤索引，正常关闭被测应用仍由隐藏会话管理。输入默认隐藏；仅在合成用例中可用 `previewSample` 指定公开样本文字。录像可用 `bin/desktop-player.exe --replay <recording目录>` 重新打开。
