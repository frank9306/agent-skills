---
id: ISSUE-0047
title: "Limit franks-design to DESIGN.md"
status: done
priority: medium
created: 2026-11-19
updated: 2026-11-19
closed: 2026-11-19
related_adrs: []
depends_on: []
---

# ISSUE-0047: Limit franks-design to DESIGN.md

## Problem

The skill still prescribes a complete Hallmark design and validation workflow.

## Desired outcome

Keep only project DESIGN.md discovery and maintenance in the source and the current Codex installation.

## Acceptance criteria

- [x] 源码和 Codex 安装包只保留 DESIGN.md 工作流，技能内容和界面元数据一致。
- [x] 移除旧主题、脚本、设计验收和仓库调用入口，仓库验证通过。

## Out of scope

业务项目文件、其他 Agent 安装和 ai-playbook。

## Decisions

新增 DESIGN.md 仅在明确要求时写入。读取时兼容已有小写文件名，保留上游署名和许可证。

## Implementation notes

精简源码与本机 Codex 安装，更新仓库技能索引、route-work 路由和 npm 测试入口。

## Verification

两份技能包通过 quick_validate.py，内容清单和文本一致。npm run check 验证 29 个技能，npm test 全量通过。

## Activity log

### 2026-11-19 — Created

Issue created from the supplied project input.

### 2026-11-19 — Status changed from proposed to ready.

### 2026-11-19 — Status changed from ready to in-progress.

### 2026-11-19 — Status changed from in-progress to done.

## Completion summary

将 franks-design 精简为项目 DESIGN.md 的查找、遵循与维护。
