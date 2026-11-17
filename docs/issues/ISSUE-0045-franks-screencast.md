---
id: ISSUE-0045
title: "franks-screencast 自动产品演示成片"
status: done
priority: medium
created: 2026-11-17
updated: 2026-11-17
closed: 2026-11-17
related_adrs: []
depends_on: []
---

# ISSUE-0045: franks-screencast 自动产品演示成片

## Problem

录屏、自动操作、字幕和旁白缺少可复用且由实际状态驱动的时间轴。

## Desired outcome

独立 Skill 调用 franks-bot，默认云扬，输出同步视频、字幕、旁白和可追溯时间轴。

## Acceptance criteria

- [x] 独立 Skill 可安装，默认云扬 zh-CN-YunyangNeural，允许显式换声音；不修改产品或 franks-bot。
- [x] 每个场景先执行并确认动作成功，再开始旁白；字幕依据同一份TTS时间边界，任务共用一个bot适配器/CDP连接。
- [x] 自动录制指定Windows窗口，输出MP4、SRT、旁白音轨、时间轴及动作证据；失败保留材料且不发布完成视频。
- [x] 单元/真实媒体集成、仓库检查通过；用脱敏演示窗口制作约30秒云扬中文字幕样片，抽帧核对同步。

## Out of scope

修改IM产品、改动franks-bot核心、全桌面/麦克风录音、发布视频及自动Git推送。

## Decisions

用户明确指定franks-screencast名称，按用户指令作为仓库动词前缀惯例的例外。采用独立content Skill与Windows HWND采集；按操作成功后的时间轴讲解，默认云扬。DPI问题依据真实样片改为Pillow捕获，详见设计修订。

## Implementation notes

已实现并安装0.1.0。9个文件含三个运行模块、技能入口、计划文档、UI元数据、两组测试和独立演示窗口。源码/安装/冻结包哈希一致。调用原franks-bot 0.2.6，不修改其文件。

## Verification

5项时间轴及真实FFmpeg回归、全仓npm test、29项Skill结构检查、Skill validator通过；三场景实录与失败停止验证通过，源码安装冻结哈希一致。

## Activity log

### 2026-11-17 — Created

Issue created from the supplied project input.

### 2026-11-17 — Status changed from proposed to ready.

### 2026-11-17 — Status changed from ready to in-progress.

### 2026-11-17 — Status changed from in-progress to done.

## Completion summary

独立franks-screencast 0.1.0已创建安装，默认云扬、中文字幕与状态驱动时间轴；30秒脱敏样片通过。

## 模块设计（生成前）

责任边界：franks-screencast 拥有场景编排、录制、TTS和媒体合成；franks-bot 0.2.6 的 DesktopTarget/BrowserTarget 与 run_case 保持操作及断言所有权。产品功能只由输入场景配置表达。不同产品复用相同运行入口，不生成产品私有分支。
公开接口：scripts/screencast.py --plan plan.json --output 新目录 --bot-path 技能目录；--version 查询。plan含target、scenes（id、narration、steps、可选durationSeconds）、voice/rate。Windows目标或带window绑定的Chromium目标支持窗口录制；只建立一次适配器。scene是动作集合加一段讲解；不接收任意shell命令。
实现隐藏：scripts/media.py管理edge-tts音频/句边界、FFmpeg gdigrab HWND录制就绪/停止、ffprobe核验、逐场景合成和拼接。scripts/timeline.py拥有音频时间、字幕偏移、最小时长和溢出校验的纯逻辑。screencast.py把run_case输出串成场景；反馈代理把中间success转wait，最终才结束浮层。动作失败即停止后续动作与合成，不自动重放。
同步：录制先等FFmpeg首个progress确认帧，使用gdigrab实际输入Unix时间戳映射到高精度时钟作为媒体起点，动作回读后再预留0.3秒开始旁白；录制到语音结束+0.4秒。云扬旁白先生成，字幕使用edge返回的SentenceBoundary时间，同起点移位。只采用结果后讲解模式，不承诺任意实时讲解；可通过多个短场景表现操作过程。固定scene时长不足时失败，不截断语音。
依赖：Python标准库编排；edge-tts通过官方PyPI包调用在线服务，仅发送演示讲解文案；外部已安装FFmpeg/ffprobe；复用已安装franks-bot。不添加服务、后台常驻或业务项目依赖。媒体文件输出到指定新目录。默认窗口录制，不录桌面全屏或麦克风。
文件：SKILL.md、agents/openai.yaml、references/plan.md、scripts/{screencast,media,timeline}.py、tests/test_*.py、tests/demo-window.ps1。测试在公开时间轴/渲染入口验证延迟、超长拒绝、实际字幕与AAC音轨时长；真实demo窗口通过franks-bot操作。运行npm run check、npm test和Skill验证；最终样片ffprobe与抽帧验证，人工听感留给用户。
明确边界：首版Windows；不把演示fixture冒充真实IM产品，不上传视频或修改真实数据。本轮“按约定实施”授权创建安装，不自动沿用前一任务的一次性提交推送授权。

### 实机发现后的设计修订

gdigrab 在此混合DPI环境只采集逻辑尺寸的左上部分，真实样片不通过。media.py 改为专用采集线程设置 per-monitor-v2 DPI context，Pillow HWND捕获完整目标窗口后按比例缩至1280×720，固定15fps帧序列送FFmpeg编码；高精度时钟从首张实际捕获帧开始，补齐间隔使用前帧，记录最大采集间隔与重复帧。捕获线程不执行输入，操作仍属于franks-bot。尺寸变化、窗口消失或采集错误停止。保留失败样片；首版不绘制系统鼠标（HWND快照不带光标），交付时明确。依赖增加Pillow>=11.2.1，与现有bot使用的库一致；不增加新服务。

### 最终验收与审查

2026-11-17：原生Windows三场景实际操作回读通过；云扬SentenceBoundary来自在线服务。成片30.021333秒、1280×720、H.264/AAC；三个旁白起点均为核验时间+0.3秒。抽看每段首句字幕时画面，搜索框、结果、归档正文均完整对应。源窗口2174×1329，15fps采集、30fps输出，最大间隔84.69ms，无重复补帧；音轨峰值-4.9dB，音频完整性与偏移使用FFmpeg验证，不冒充人工听感评价。

负向真实测试：故意设置错误断言，第一段失败后停止，没有录第二段或输出demo.mp4。保留原始动作、语音和failure.json。前期失败（句边界50ms重叠、gdigrab混合DPI裁切）均保留并修复；相关边界回归和最终录制证据均可检查。

验证：5项时间轴/真实FFmpeg测试、npm test、npm run check（29 Skills）、Skill quick_validate通过。17项既有franks-design浏览器测试按原配置跳过。单连接复用由同一franks-bot适配器贯穿所有场景；新Skill端到端实测范围为原生Windows，Chromium接入沿用bot 0.2.6已验收适配器，未新增Chromium成片实测。首版窗口视频不带系统光标或窗口外浮层，已在执行参考及报告声明。

review-code只读审查范围：HEAD=0d26fc8dfdc899263ba7a66d9af1a749070f06f8 + 本次未提交的franks-screencast、package脚本、README目录及ISSUE-0045证据。按设计、实际录制和失败测试复核，原生Windows交付范围无阻断发现。源码不包含产品专属选择器，测试fixture明确标为非IM产品；用户媒体只留本地，不上传。

本地交付：`C:/Users/frank/.codex/visualizations/2026/11/17/01a1e72c-4f67-74a1-809b-4e49555d9176/franks-screencast验收/验收报告.html`，最终样片为`release-run/demo.mp4`。仓库证据：[summary.json](evidence/ISSUE-0045-screencast-0.1.0/summary.json)、[时间轴](evidence/ISSUE-0045-screencast-0.1.0/timeline.json)、[归档画面](evidence/ISSUE-0045-screencast-0.1.0/qa-3.png)。当前任务未暂存、提交或推送。

### 2026-11-17 — 版本固定与 GitHub 同步授权

用户明确要求固定本版本、提交并同步 GitHub，覆盖此前本轮不推送的范围约定。运行文件保持已验收的0.1.0不变；9个源码/安装/冻结文件SHA-256一致，运行文件与30秒最终样片manifest一致。提交前再次通过5项定向测试、29项Skill结构检查及Skill验证；全仓测试沿用同一运行文件版本上一轮通过证据。发布标记使用franks-screencast-v0.1.0，目标为origin/main（frank9306/agent-skills）。视频与音轨继续保留本地，仓库仅纳入实现、文档、测试及脱敏截图和时间轴证据。
