---
id: ISSUE-0048
title: "Route franks-bot browser testing to ego-browser"
status: done
priority: medium
created: 2026-11-24
updated: 2026-11-24
closed: 2026-11-24
related_adrs: []
depends_on: []
---

# ISSUE-0048: Route franks-bot browser testing to ego-browser

## Problem

franks-bot still offers Chromium/CDP as an entry point for live browser tests.

## Desired outcome

Route all live browser testing to ego-browser in the source and current Codex installation, while preserving the native Windows and legacy fixture contracts.

## Acceptance criteria

- [x] 源码和当前 Codex 安装版统一将真实浏览器网页测试交给 ego-browser，混合任务按步骤选用工具。
- [x] Windows 桌面和旧 CDP 用例接口保持兼容，仓库检查和回归通过。
- [x] 在已安装的 ego lite 中完成一次真实页面交互和回读，并校验两份技能变更一致。

## Out of scope

其他机器的安装、ego-browser 上游技能、franks-bot 运行脚本或旧用例接口变更。

## Decisions

真实浏览器网页测试统一走 ego-browser。混合用例按步骤分配工具，桌面反馈由 franks-bot 提供，网页反馈随 ego-browser 会话。

## Implementation notes

更新仓库技能入口、旧用例参考、仓库索引及当前 Codex 安装。旧 CDP 接口继续用于现有兼容用例和回归夹具。

## Verification

两份 Skill 均通过 UTF-8 校验，两处改动文本一致。npm run check 校验 29 个 Skill，全量 npm test 通过。ego lite 0.6.3.17 实际打开本地样页，点击按钮并回读 Interaction verified。验收在本机完成。

## Activity log

### 2026-11-24 — Created

Issue created from the supplied project input.

### 2026-11-24 — Status changed from proposed to ready.

### 2026-11-24 — Status changed from ready to in-progress.

### 2026-11-24 — Status changed from in-progress to done.

## Completion summary

真实浏览器网页测试统一使用 ego-browser，已更新 franks-bot 源码和当前 Codex 安装。保留原生桌面和旧 CDP 接口。
