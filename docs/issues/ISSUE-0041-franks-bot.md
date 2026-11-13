---
id: ISSUE-0041
title: "封版并采用 franks-bot 桌面自动化"
status: done
priority: medium
created: 2026-11-13
updated: 2026-11-13
closed: 2026-11-13
related_adrs: []
depends_on: []
---

# ISSUE-0041: 封版并采用 franks-bot 桌面自动化

## Problem

个人自动化入口仍指向旧实现

## Desired outcome

验证 Windows 桌面流程，发布 franks-bot，并让浏览器任务转交环境默认工具。

## 模块设计

桌面入口负责窗口定位、执行和观察。Jev 负责选择动作，浮层脚本负责本地状态显示。浏览器转交是 Skill 的路由分支，沿用用户授权和环境默认工具。使用计算器实跑和浏览器只读用例验收。

## Acceptance criteria

- [x] Windows 计算器读回 7 + 5 = 12，浮层三种反馈和退出可核验。
- [x] 浏览器请求提示后由环境默认工具完成只读用例。
- [x] 仓库检查通过，当前发布树移除旧入口及其测试。

## Out of scope

Not defined.

## Decisions

No decisions recorded.

## Implementation notes

独立检出替换技能包、测试入口和使用指南，保留旧工作区的未提交变更。

## Verification

仓库结构与全量测试通过，计算器实跑及浏览器导航通过。

## Activity log

### 2026-11-13 — Created

Issue created from the supplied project input.

### 2026-11-13 — Status changed from proposed to ready.

### 2026-11-13 — Status changed from ready to in-progress.

### 2026-11-13 — Status changed from in-progress to done.

## Completion summary

封版 Windows 桌面技能，浏览器转交默认工具，移除旧发布入口。
