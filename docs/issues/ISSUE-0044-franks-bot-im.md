---
id: ISSUE-0044
title: "franks-bot 分层定位与 IM 采集器实机验收"
status: in-progress
priority: medium
created: 2026-11-17
updated: 2026-11-17
closed:
sources: ["2026-11-17 Codex 对话，用户确认实施并要求验证全部功能"]
related_adrs: []
depends_on: []
---

# ISSUE-0044: franks-bot 分层定位与 IM 采集器实机验收

## Problem

单步命令重复初始化，缺少统一定位降级、动作计时和持续浮层。

## Desired outcome

固定技能版本，导出实机功能覆盖、截图、技术、动作间隔和问题报告。

## Acceptance criteria

- [ ] 分层定位、超时与无候选跳过 Jev 可重放。

- [ ] 一次运行维持一个浮层及动作间隔日志，动作仅派发一次。
- [ ] 固定技能文件哈希，再用本机安装版 IM 采集器覆盖全部功能并提供截图、层级、缺陷和浮层证据。

## 模块设计

已有 desktop.ps1 继续拥有 HWND/PID 校验、Windows 输入和观察，增加进程内请求入口。反馈脚本独占浮层和鼠标读回。新 session.py 作为运行入口，接受目标与步骤 JSON，按顺序定位并以断言驱动推进，输出 JSONL 动作时序、截图和结果。CDP 仅连接指定标签页。视觉适配器只读取本次绑定窗口或标签页的截图，OCR 与图像模板在本地执行，Jev 仅在有候选且经用例启用时接手，最终模型以局部视觉请求和有界回复接手。计时使用单调时钟，已派发动作只回读。保留原 CLI，反馈与动作解耦。回归从入口测试优先级、动作与等待、日志时序；运行仓库 npm run check、npm test，再进行冻结版本实机覆盖。

## Out of scope

录屏、字幕、旁白，以及修改 IM 采集器产品代码。

## Decisions

2026-11-17 用户明确接受 CDP 实页验收延期，待提供已开启 CDP 的测试页面后再测。本轮不继续排查启动策略，也不将延期项记为通过。其他既有验收缺口不因该决定自动取消。

2026-11-17 继续验收：复用上述模块边界。desktop.ps1 拥有每次需前台操作的检查、按需置前和耗时回读，200 ms 为用户关注阈值，超限明确报告，不能跳过窗口身份与命中校验。session_targets 拥有浏览器定位、滚动与输入，session_visual/jev-next 拥有候选选择和结构化失败原因。修复以真实遮挡窗口、CDP 本地页面和脱敏 IM 截图验证，再冻结文件哈希复测。生产账号采集、中心连接与签名更新依赖另列，不能用模拟通过替代。IM 产品缺陷只记录。

## Implementation notes

实现与复测已进行，最终用户级安装版本为 0.2.5。窗口操作每次检查前台、禁用状态和命中，模态窗口可发现并独立绑定；Jev 候选截图保留清晰文字与结构化结果；CDP 总期限不被异步事件延长；浮层共享读取与 UIA 断言期瞬态重读已修复。

## Verification

2026-11-17 最终 0.2.5：41 次任务动作回读通过，包含密码修改重登、计划编辑保存、Jev 同名控件选择、附件和日志实际保存及内容校验、AI 截图兜底。60 次前台/遮挡/最小化场景全部成功，桥接端到端最高32.023 ms，最终136次原生检查最高20.7462 ms，无超过200 ms样本。浮层425次采样均显示，253次指针可见采样覆盖49个位置，中心偏差0 px。

5项Python定向测试、Windows前台/模态回归、npm run check、npm test、Skill校验和git diff --check通过。首次全仓测试缺import-linter==2.15，独立环境补齐后最终复跑通过，17项既有浏览器测试仍按仓库配置跳过。保留中间失败及修正依据，不覆盖原始证据。

CDP真实页因隔离Chrome调试启动命令被执行策略拒绝仍未验证。真实账号采集、真实定时运行、中心注册/心跳、Agent兑换吊销、签名升级回退仍缺测试前提，事件唤醒、MSAA、浏览器高亮未交付。全功能验收未完成，Issue保持in-progress。

## Activity log

### 2026-11-17 — Created

Issue created from the supplied project input.

### 2026-11-17 — Status changed from proposed to ready.

### 2026-11-17 — Status changed from ready to in-progress.

## Completion summary

Not completed.

最新报告：`C:/Users/frank/.codex/visualizations/2026/11/17/01a1e72c-4f67-74a1-809b-4e49555d9176/franks-bot验收/复测报告.html`。冻结包、安装一致性哈希、最终动作CSV及所有中间版本记录同目录。IM两项问题仅记录，未修改产品代码。未暂存、提交或推送。



### 2026-11-17 实机证据

- 运行入口 0.2.0 的脚本 SHA-256 在实机用例前固定，用户级 Skill 文件已逐项校验。复制本机安装目录的 0.5.4 程序与 NSH 包，哈希一致，使用独立存储与回环端口。实机共 115 次派发尝试、119 个结果，104 个结果通过。归档 ZIP 实际落盘并核查条目，原安装实例保留。
- `npm run check`、`npm test`、franks-bot focused unittest 两项及已安装 Skill UTF-8 校验通过。仓库测试中的 17 项 Frank's Design 浏览器专用用例按现有配置跳过。IM 源码 NSH Web 八项、Windows 两项及类型检查通过。
- 完整报告包含截图、技术、应用问题、跨用例动作间隔和浮层样本，见用户交付目录的验收报告。当前产品真实正向采集、真实中心连接、全量文件流程和更新回退仍有缺口。工具的生产 CDP 调试启动被命令执行策略拦截，本轮 Jev 实机歧义用例未返回可用选择，事件唤醒和浏览器高亮未完成。Issue 保持 in-progress。


### 2026-11-17 CDP 任务连接设计补充

用户授权补齐 CDP 并在通过后固定版本、提交推送至 origin。BrowserTarget 继续独占 CDP 生命周期：构造时连接一次，支持现有 page 端点及新增 browser 端点；browser 模式按精确 URL 和可选 targetId 唯一绑定现有页面，通过 flatten sessionId 路由全部页面命令。一个 case 的定位、输入、断言和截图共享该 socket，结束关闭；断线、超时或目标变化立即失败，不自动重连或重放输入。授权握手使用独立 connectTimeoutMs（默认60秒），命令仍默认2秒。连接日志记录打开/绑定/关闭和命令数，不记录私人标签页列表。session.py 保持一个 case 一个 adapter；tests 在公开 BrowserTarget/run_case 边界验证连接次数、路由、歧义、断线及旧 page 兼容；实页使用脱敏本地页面验证输入/点击/滚动/命中/查找落空耗时及截图。此范围不取消 IM 真实服务与签名升级等既有缺口。

### 2026-11-17 — 0.2.6 CDP 专项通过并固定

- 用户本轮授权任务级连接复用、补齐 CDP 专项，成功后提交推送 GitHub。0.2.6 支持 Chrome browser 端点和 flatten session，按精确 URL/可选 targetId 唯一绑定；保持旧 page 端点兼容。所有步骤复用一个 socket，断线/超时停止，不重连或重放。
- TDD：新增任务复用测试在旧版报“Bind a local DevTools page endpoint”，实现后通过；8项Python回归通过，覆盖单连接多步、旧端点、断线不重复输入、未匹配页面拒绝、异步事件不能延长期限等。计时改用 perf_counter，避免本机 Python 3.12 monotonic 的粗粒度。
- 实机：Chrome 156.0.8078.73 日常资料；首轮用户明确确认只授权一次。最终冻结版一条连接/180命令/7动作/40负向定位通过，查找落空0.404–8.056ms；CDP落空后OCR无候选、Jev跳过、AI截图接手并回读通过。进入AI前478.27ms，AI交接15522.76ms含工具与模型等待，不是纯推理时间。测试两批动作共享同一适配器；正常任务用一个case。保留中间120秒授权等待超时记录，超时轮没有执行输入。
- 全仓 npm test（已纳入 test:franks-bot）、npm run check、Skill验证、git diff --check通过。17项既有 Frank's Design 浏览器测试按原配置跳过。原生前台/模态复测最高9.403ms，未超过200ms。
- 源码、安装版及最终冻结包18文件SHA-256一致。只在 agent-skills 修改；IM产品问题仍只记录。CDP不移动系统鼠标，浏览器控件高亮未交付；本轮两批次的状态证据不能证明AI等待全程显示。原有IM生产账号、真实中心/Agent、签名升级回退、事件唤醒和MSAA缺口仍保留，Issue不关闭。
- 脱敏可审计证据：[摘要](evidence/ISSUE-0044-cdp-0.2.6/summary.json)、[全部派发间隔](evidence/ISSUE-0044-cdp-0.2.6/最终动作时序.csv)、[打开归档截图](evidence/ISSUE-0044-cdp-0.2.6/open-archive.png)、[AI兜底截图](evidence/ISSUE-0044-cdp-0.2.6/fallback-ai-fallback.png)。本地完整报告：`C:/Users/frank/.codex/visualizations/2026/11/17/01a1e72c-4f67-74a1-809b-4e49555d9176/franks-bot验收/0.2.6-CDP/CDP复测报告.html`。
- 提交前审查范围：HEAD=df44e63429fed94f730ed4584d84ffb73a9bf372 至本次 franks-bot、package.json、ISSUE-0044/索引及脱敏证据工作树（包含既有未提交的0.2.5整合）。对照设计和实际测试证据，当前CDP专项无阻断问题；未将原始全功能验收缺口记为通过。
- 暂存后的完整 diff --check 发现原未跟踪文件的末尾空行；发布前仅移除5个文件末尾额外换行，逐文件证明除此之外字节不变，Python AST相等，见证据 release-equivalence.json。原实测冻结包和manifest保留，发布包 release-frozen-skill 与安装/源码一致；重新运行定向回归和静态检查。
