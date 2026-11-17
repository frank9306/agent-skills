# 任务会话

`scripts/session.py --version` 返回运行文件版本和 SHA-256。使用 `python scripts/session.py --case case.json --output <新目录>` 执行。Windows 端需要 Windows PowerShell。CDP 使用 Python 的 `websocket-client`。本地 OCR 使用 Pillow 和 WinRT 的 Windows.Media.Ocr、Windows.Globalization、Windows.Graphics.Imaging 和 Windows.Security.Cryptography Python 包，模板另需 opencv-python-headless。用已授权的运行环境或 `uv run --with` 加载依赖。

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

浏览器对象使用 `kind: chromium`、`webSocketDebuggerUrl`（本机具体页面的授权调试端点）及 `url`（准确 URL）。选择器支持 `css` 或可访问 `name`。断言可按 `text`、选择器的 `count` 或 `equals` 回读，也可用 `all` 组合。浏览器操作同样必须使用任务级浮层。配合经验证的 Windows 窗口绑定浮层。混合桌面与浏览器的任务复用同一个浮层，切换时更新其窗口绑定。CDP 不移动系统鼠标。

## 视觉分支

在步骤的 `target.visual` 中提供 `text`（OCR 默认语言 zh-CN）、`template`（模板的绝对路径）或两者。查找落空立即进下一层，一轮共享截图。只有存在候选且 `allowRemoteVision: true` 时才请求 Jev。在隔离演示数据上显式启用远程请求。模型兜底用 `aiReplyMs` 给当前模型一个有界等待时间。用例打印视觉请求 JSON 路径，模型读取其中指定的 PNG，并写入请求指定的回复文件，回复是 `{"box":[left,top,right,bottom]}` 或 `{"box":null}`。远程选择后重新截图并验证目标像素，再用受限坐标操作。

`actions.jsonl` 记录派发时间、与上次派发的毫秒间隔、视觉探测、技术和断言结果。`manifest.json` 将证据绑定到实际脚本哈希。关键状态和失败截图写入报告目录。

需前台的定位、输入、UIA 操作和截图在每次执行时检查窗口，按需置前并回读。`feedback.jsonl` 的 `foreground` 事件记录检查/置前耗时、是否原已置前和是否超过 200 ms。窗口无法置前或坐标仍被遮挡时停止，属于目标的模态对话框需按其自身 HWND/PID 重新绑定。系统置前调用可能超过等待预算，按实际耗时报告。

CDP 每条命令默认总期限 2000 ms，可用目标的 `commandTimeoutMs` 配置，异步事件不延长期限。目标唯一后滚动到可视区域，仍须命中校验。Jev 保留原始 `choice`、概率、模型版本及失败原因，`no_match` 属于模型判断，按降级处理。编号截图保留最高 1568 像素边长，避免缩小界面文字造成无法识别。

## Chrome 授权连接

Chrome 的 `chrome://inspect/#remote-debugging` 开启后，由用户确认连接授权。读取该 Chrome 资料目录的 `DevToolsActivePort` 两行（端口、browser 路径），拼为本机 `webSocketDebuggerUrl`；不要硬编码端口或从空白独立资料误认日常浏览器。browser 端点按用例 `url` 精确绑定已打开页面；同 URL 多页时提供 `targetId`，不任意挑选。支持 flatten session 的 Chrome 可直接使用，无需 `/json/version` 或 `/json/list`。

一个任务写成一个 case、多条 steps，并只启动一次 session.py。构造时建立一个 socket，定位、输入、断言和截图全部复用；任务结束关闭。`connectTimeoutMs` 默认 60000，留给用户授权；`commandTimeoutMs` 默认 2000。断线或命令失败停止，不自动重连，不重复输入；新任务需重新授权。`connection.jsonl` 记录 opened/bound/closed 与命令数，actions.jsonl 另记录 CDP 命中/落空耗时。该方式不承诺跨任务或浏览器重启免授权。
