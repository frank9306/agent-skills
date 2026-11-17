---
id: ISSUE-0046
title: "修复 franks-bot 多屏反馈显示与任务生命周期"
status: done
priority: medium
created: 2026-11-17
updated: 2026-11-17
closed: 2026-11-17
related_adrs: []
depends_on: []
---

# ISSUE-0046: 修复 franks-bot 多屏反馈显示与任务生命周期

## Problem

实机副屏的状态文字消失，状态栏端部变形。按用例分别完成会提前收起反馈，且等待和最小化可能中断。

## Desired outcome

同一桌面测试任务持续显示状态栏和鼠标光圈。浮层跟随目标窗口所在显示器，并正确处理 DPI 和可用屏宽。

## Acceptance criteria

- [x] Win32/WPF 实机渲染在本机不同 DPI 和分辨率下验证状态文字、半圆端部、光圈尺寸及屏幕定位。
- [x] 同一任务跨用例、长等待、弹窗绑定和窗口最小化持续显示反馈，任务结束才收起光圈；所有操作使用实际绑定窗口所在屏幕。
- [x] 通过回归、仓库检查和只读代码审查，固定并核对本机安装版脚本。

## Out of scope

正式 IM 采集器登录、数据采集、产品修改、系统显示设置和远程发布。

## Decisions

复用 ISSUE-0044 的所有权。feedback.ps1 独占浮层和鼠标渲染，将显示器物理尺寸转换为当前 WPF 布局坐标；独立动作保留原生命周期。DesktopTarget 持有任务浮层，启动时确认可见，校验每次重绑定的 HWND/PID/可执行文件，并保持任务事件流。run_case 保留单用例终止默认行为，支持同一任务内的用例报告；多用例调用方在最终确认、失败或取消时结束反馈。浮层在任务进程存活时跨人工等待和暂时不可见的目标保留，光圈跟踪当前指针。脚本测试验证多用例反馈和进程边界，Windows 交互集成通过实屏证据验证 DPI、屏幕定位和等待行为。验证运行 npm test、npm run check、Windows 专项及 git diff --check。

## Implementation notes

0.2.7 按实际显示器 DPI 与 WPF 布局比例换算；集中管理整场反馈，保持同一渲染进程，支持校验后切换原生窗口。新用例可以共享原任务的浮层和事件流。

## Verification

旧版红灯：副屏 96 DPI 下 WPF 实际使用 2 倍缩放，状态列被压到约 10 DIP，渲染图无状态文字且端部超出半圆阈值。旧生命周期在最小化时停止采样，旧用例接口无法保留父任务反馈。

最终绿灯：2880×1800、192 DPI 与 1920×1080、96 DPI 双屏实际渲染通过。状态栏分别为 880×88 与 440×44，鼠标光圈为 72×72 与 36×36。两个屏幕最小化期间均保持反馈。94 秒空闲后重新绑定另一屏的原生弹窗，738 次采样中状态栏和光圈持续可见，121 个位置偏差为 0 像素，结束事件后光圈收起。Windows 前台和模态测试通过。安装版在正式 IM 采集器登录页复测中文状态文字。

npm run check、npm test（独立 Python 环境补齐项目已有 import-linter==2.15，17 项既有浏览器测试按原配置跳过）、Skill 校验、git diff --check 通过。只读审查依据 45bc9b17d89a234848615d19a0da3be7c89d1af8 至当前 franks-bot 工作树，含新回归文件。源文件、安装版和 ZIP 中 19 个文件哈希一致。证据位于本次 Codex 工作区的 work/task-lifetime-v4、work/lifetime-green、work/installed-smoke 和 outputs。

## Activity log

### 2026-11-17 — Created

Issue created from the supplied project input.

### 2026-11-17 — Status changed from proposed to ready.

### 2026-11-17 — Status changed from ready to in-progress.

### 2026-11-17 — Status changed from in-progress to done.

## Completion summary

franks-bot 0.2.7 在本机两个不同缩放的显示器验收通过并安装，交付已核对的 ZIP 与实屏截图。
