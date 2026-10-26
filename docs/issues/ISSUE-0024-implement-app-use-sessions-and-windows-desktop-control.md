---
id: ISSUE-0024
title: "Implement app-use sessions and Windows desktop control"
status: done
priority: high
created: 2026-10-26
updated: 2026-10-26
closed: 2026-10-26
related_adrs: []
depends_on: []
---

# ISSUE-0024: Implement app-use sessions and Windows desktop control

## Problem

No self-contained application UI execution standard exists.

## Desired outcome

Ship scoped observe-act-validate sessions and Windows UIA control with real evidence.

## Acceptance criteria

- [x] CLI doctor/prepare/sessions/observe/act/validate/inspect/stop produce structured JSON; sessions bind HWND/PID and observation identities.
- [x] Windows UIA action guards reject stale, ambiguous, disabled, outside-scope targets; physical input is serialized and foreground/hit-tested.
- [x] Controlled real Windows fixture verifies input, selection, menus/dialogs, focus/occlusion, movement and DPI; record support matrix.

## Out of scope

No phones, macOS/Linux UI, pixel baseline engine, general Canvas recognition, business-site writes, profile export, system services or unrelated repository changes.

## Decisions

### Pre-generation module design — 2026-10-26

Owner: app-use. Node scripts/app-use.mjs is the CLI; scripts/client.mjs exposes AppClient.connect/request/close and owns broker startup/discovery. Native/AppUse owns a current-user-only named-pipe broker, desktop sessions, UIA observations/target identity, physical-input mutex and Native Messaging framing. CLI never exposes arbitrary shell execution. Session state lives in broker memory; restart invalidates sessions. Each observation has a fresh ID and per-target stable identity; actions validate the observation and target again, then return a new observation. Text values in password fields are omitted; secret input is passed only by environment reference and suppressed from evidence. Dependencies: Node built-ins -> local .NET broker -> Windows UIAutomationClient/UIAutomationTypes/Win32. No project-specific checks exist for new ESM/C# sources: use syntax/build/public behavior tests and report this coverage gap without installing governance. Files: SKILL.md, agents/openai.yaml, references/{commands,scripts,support}.md, scripts/{app-use,client,evidence,runner,page-adapter}.mjs, native/AppUse/{Program,Broker,Desktop,NativeBridge}.cs, native/AppUse/AppUse.csproj, tests/*.test.mjs and native/Fixture. Caller walkthrough: prepare target -> observe -> act using ID -> validate fresh result; duplicate/stale targets fail without dispatch; stop removes session/connection but preserves application. Deleting broker would duplicate pipe ACL, target guards and input serialization in callers. Public tests use CLI/client and a real controlled UIA fixture; no mock pretends UIA support.

Scope and product choices are confirmed by the owner handoff in this chat. The four vertical slices share this recorded contract.

## Implementation notes

Implemented the public CLI/client, current-user broker, UIA guarded sessions, per-user physical-input mutex, target signatures and fresh observations. Native callback, combo collapse, popup ownership, closed-target and expired-session regressions were observed red then repaired. The independent runtime is self-contained and version-scoped. Local evidence capture masks password fields.

## Verification

2026-10-26: native self-contained publish PASS (.NET SDK 10.0.402); node --test desktop.test.mjs/windows-live.test.mjs PASS. Actual DPI 192; input/select/click/result assertions, stale and disabled guards, obstruction fail/restoration pass, menu/modal, movement, redaction and screenshot PASS. Evidence C:/Users/frank/AppData/Local/app-use/runs/run-9LOlWT (source/tool-bound, inspected). npm run check PASS (24 Skills), quick_validate PASS, npm test PASS (117 pre-existing tests; explicit bundled Playwright runtime/installed Chrome and isolated import-linter 2.15). git diff --check and CLI syntax PASS. Fixed-base read-only review of new public/native files against 6f30ad3 found version cross-talk, UTF-8 chunking and cross-build input-lock risks; fixed and affected tests rerun. No remaining known P0/P1 in this slice. Multi-monitor DPI transitions and arbitrary third-party providers remain unverified, not claimed supported by fixture evidence. No architecture scan is configured for ESM/C#; syntax/build/public behavior checks are coverage evidence, not a substitute claim.

Final dependent-slice regression on 2026-10-26: npm run test:app-use:desktop PASS, run-alpUfe at DPI 192. The final source-bound report supersedes earlier tool-version reports for delivery. Later hardening rechecks expiry immediately before mutations and refuses capture after sensitive input; see ISSUE-0026.

## Activity log

### 2026-10-26 — Created

Issue created from the supplied project input.

### 2026-10-26 — Status changed from proposed to ready.

### 2026-10-26 — Status changed from ready to in-progress.

### 2026-10-26 — Status changed from in-progress to done.

## Completion summary

Delivered scoped CLI and Windows UIA execution with real controlled-app verification at DPI 192; multi-monitor transitions remain unverified.
