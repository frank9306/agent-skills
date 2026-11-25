---
id: ISSUE-0049
title: "franks-bot 隐藏桌面自动化"
status: done
priority: high
created: 2026-11-25
updated: 2026-11-25
closed: 2026-11-25
related_adrs: []
depends_on: []
---

# ISSUE-0049: franks-bot 隐藏桌面自动化

## Problem

桌面测试占用日用前台及键鼠。

## Desired outcome

在独立 Win32 非活动桌面执行并保留 AI 视觉兜底，成功关闭，异常保留。

## Acceptance criteria

- [x] Win32 实机接收隐藏窗口点击和中文，经过实际 AI 选框与回读，活动桌面及前台输入独立。
- [x] KOI 使用隔离服务的合成账户，打开原生附件对话框并选中合成文本，回到聊天界面确认草稿附件，自动关窗。
- [x] 成功关闭并释放桌面，失败、超时和取消保留现场且可按任务显式正常关闭，已运行 KOI 被跳过。
- [x] franks-bot 专项、全仓测试、结构检查、前台回归及代码审查通过。

## Out of scope

屏幕级输入、真实输入法和系统快捷键、后台对话框以外的应用进程自动化、同时运行日用 KOI、发布和安装覆盖。

## Decisions

- 会话入口拥有任务结果和生命周期。Windows 隐藏目标拥有隔离桌面、进程、窗口识别、截图回读及正常关闭。现有视觉搜索拥有识图协议和像素重验。前台目标保留原行为。
- 输入接口为 session.py --case --output，target.kind 为 windows-hidden，另给绝对 executable、可选 args 和精确 title、singleInstance。步骤可声明同进程的精确 windowTitle 以绑定模态窗口。失败后 --retained-status / --cancel-hidden / --close-retained 接收同一任务的输出目录。退出码 0 为通过或关闭，1 为执行/关窗失败，3 为单实例跳过。
- 启动隐藏 PowerShell 执行进程，在调用 UIA 前绑定新 Win32 桌面。原生层拥有 Win32 启动、窗口身份、定向消息和截图。Python 生命周期监督进程拥有状态、取消、等待和显式收尾。只向本次启动进程的同桌面窗口派发动作和关闭消息。不切换桌面、不注入全局输入、不终止被测进程。
- 文件边界为 session.py 入口和现有用例驱动，session_hidden.py 生命周期与目标实现，session-bridge.ps1/desktop.ps1 和独立 C# 承载 Win32 能力。沿用测试目录及系统依赖，无新增第三方依赖。
- 成功用例先持久化证据再关闭；失败用例从输出目录读状态并通过明确命令关窗。不存在可用画面、被测进程已退出、窗口身份变化和关窗超时均有独立的可观察结果。用 CLI 行为测试、真实 Win32/KOI 实机、npm run test:franks-bot、npm test、npm run check、git diff --check 验证。仓库采用 check-skills 结构检查，没有独立架构配置。

## Implementation notes

v0.3.0 增加 windows-hidden，使用独立 Win32 桌面执行并保留 AI 兜底。首次尝试确认 PowerShell 运行后再绑定桌面会报资源占用，最终启动器在创建执行进程时指定桌面。非活动桌面中的原生 Edit 和标准推送按钮用经过所有权校验的定向消息处理， WebView2 控件沿用 UI Automation。取消处理先写日志和截图再留存现场。

## Verification

Windows 实机 Win32 与 KOI 原生附件验证，用户确认前台操作正常，最终全仓 npm test、npm run check 和 git diff --check 均通过。

## Activity log

### 2026-11-25 — Created

Issue created from the supplied project input.

### 2026-11-25 — Status changed from proposed to ready.

### 2026-11-25 — Status changed from ready to in-progress.

### 2026-11-25 — Status changed from in-progress to done.

## Completion summary

实现独立 Win32 隐藏桌面、AI 视觉兜底、成功关窗及失败现场保留。
