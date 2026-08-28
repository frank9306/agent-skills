---
id: ISSUE-0009
title: "Add manage-tailscale skill"
status: done
priority: medium
created: 2026-08-28
updated: 2026-08-28
closed: 2026-08-28
related_adrs: []
depends_on: []
---

# ISSUE-0009: Add manage-tailscale skill

## Problem

需要可复用的 Tailscale 检查、安装、无人值守入网、私网服务访问和维护流程，减少手动操作并保留必要授权边界。

## Desired outcome

新增独立 manage-tailscale 技能及按需参考，覆盖 Windows、Linux/NAS 和虚拟机服务路由，验证技能格式与安全场景。

## Acceptance criteria

- [x] 独立技能和 UI 元数据可发现，README 索引更新，引用可解析，仓库与 Skill 校验通过。
- [x] 覆盖检查、Windows/Linux/NAS 安装、已有状态复用、受保护凭据无人值守入网、开机运行、更新与撤销。
- [x] 区分宿主机、容器、虚拟机与内网服务；覆盖最小私网路由、审批/访问控制和端到端验收。
- [x] 明确不绕过 UAC/MFA/浏览器策略，不泄露密钥、不破坏现有网络；无凭据时只请求必要配合。
- [x] 完成实际 CLI 帮助核对、静态场景推演和固定基线只读审查；明确未运行真实安装或网络变更。

## Out of scope

不在本次执行真实设备安装、改网、创建密钥或全局安装技能；不嵌入个人设备、域名或凭据；不提交或推送 Git。

## Decisions

复用官方 CLI/API 和平台包管理器，不新建重复的安装器或守护进程。技能为提示词与参考资料，操作行为以场景推演和官方帮助核对验证；本次不添加可执行脚本，无适用的代码 red-green 循环。

## Implementation notes

实施前 Git 工作区干净；固定审查基线 fad17ae622dd4a88e7d11368a255b1bd731d0578。主技能 skill-creator，使用 manage-issues 跟踪和 review-code 完成只读审查。

## Verification

Skill validator, npm run check (20 skills), npm test (13 tests), UTF-8/local-link checks, local CLI help verification, static scenarios and read-only review passed; no live network mutations.

## Activity log

### 2026-08-28 — Created

Issue created from the supplied project input.

### 2026-08-28 — Status changed from proposed to ready.

### 2026-08-28 — Status changed from ready to in-progress.

### 2026-08-28 — Status changed from in-progress to done.

## Completion summary

Added manage-tailscale with guarded automation for installation, enrollment, private service access, diagnostics, and lifecycle maintenance.
