---
id: ISSUE-0025
title: "Connect app-use to the existing Chromium browser"
status: done
priority: high
created: 2026-10-26
updated: 2026-10-26
closed: 2026-10-26
related_adrs: []
depends_on: [ISSUE-0024]
---

# ISSUE-0025: Connect app-use to the existing Chromium browser

## Problem

Default browser profiles cannot be controlled through remote debugging switches.

## Desired outcome

Ship a stable-ID MV3 debugger extension and user-scoped Native Messaging bridge.

## Acceptance criteria

- [x] Stable-ID MV3 extension, official debugger transport and HKCU Native Messaging registration with exact extension allowlist.
- [x] Explicit browser/tab scope, same-process/OOPIF contexts, dynamic target checks, navigation/popups/files and disconnect recovery.
- [x] Existing real Chrome profile acceptance and login-state reuse are recorded; no alternate profile substitutes for acceptance.

## Out of scope

No phones, macOS/Linux UI, pixel baseline engine, general Canvas recognition, business-site writes, profile export, system services or unrelated repository changes.

## Decisions

### Pre-generation module design — 2026-10-26

Browser owner: extension/{manifest.json,background.mjs,popup.html,popup.mjs} owns debugger sessions, default execution contexts per frame, recursive Target auto-attach for OOPIF and DOM observation/action guards. Native broker routes commands to connected extension by connection identity, rejects disconnected sessions and correlates bounded replies. Popup explicitly selects/connects tab; no auto-attach all tabs. Tab list metadata is only returned on explicit sessions discovery. Node exposes public session methods rather than arbitrary CDP commands to scripts. Browser adapter restricted to measured page operations; it is not Playwright transport. File inputs use DOM.setFileInputFiles on an observed file node. Popup tabs require explicit adopt/switch and new scope; stop detaches only, closes only declared task-created tabs. Public contract tests use a fake Chrome boundary only for deterministic transport lifecycle; acceptance requires actual Chrome extension/native link. Native host uses length-prefixed UTF-8 framing with 1 MiB limit and validates extension origin; service IPC uses PipeOptions.CurrentUserOnly. Stable public manifest key is retained; private key is discarded. No cookies/storage export or profile copy.

Scope and product choices are confirmed by the owner handoff in this chat. The four vertical slices share this recorded contract.

## Implementation notes

Implemented the stable-key MV3 extension, isolated DOM worlds, recursive debugger flat sessions, complete frame coverage, scoped actions, target signature validation, dialogs, files, task-created tab tracking, disconnect guards, and HKCU registration. Browser input requires explicit tab activation. Native bridge uses current-user pipe ACL and exact extension allowlist. Added configurable runtime and registration directories.

## Verification

2026-10-26 normal existing Chrome 155.0.8059.85: extension ehhjpeefojhaamfoiknmhkaijbhopope loaded via supported developer UI and connected through Native Messaging. Controlled HttpOnly session created before attach was reused without export; input/select/real click/readback, same-process frame plus actual OOPIF session, file contents (not filename only), dynamic detached target rejection, disabled target rejection, JS dialog, popup, explicit new scope, stop/reprepare and task-created cleanup PASS. Latest browser evidence: C:/Users/frank/AppData/Local/app-use/runs/run-tze19Y; screenshot visually inspected. Windows regression PASS: run-CpUiAE at DPI 192. Two transport-boundary tests PASS. Syntax, npm run check and git diff --check PASS. Existing 117-test suite remains passed with unchanged original test inputs; final repository suite will rerun in the dependent delivery slice. Initial C-drive registration produced host-not-found; E-drive local runtime/manifest achieved a real handshake. Both paths are generic overrides, no private project path is hardcoded. Edge registration is present but real Edge behavior is unverified. Review against 6f30ad3 plus all new extension/native files found inactive-tab input, alert-blocked replies, missing frame coverage, expiry, and owned-popup lifecycle risks; fixed and live/transport checks rerun. No remaining known P0/P1 for the tested scope. Broader third-party controls, nested OOPIF depth and policy-restricted pages remain unverified. A transient UIA post-move observation omitted a control on one run; a subsequent unchanged-behavior run passed. Preserve the failure and use explicit waits rather than assuming immediate provider stability.

Final dependent-slice regression on 2026-10-26: npm run test:app-use:browser PASS, run-0aOQVB, with sensitive fill observation redaction and capture refusal. Final source-bound report supersedes earlier tool-version reports for delivery. Existing normal Chrome 155.0.8059.85 reconnected to the final version-scoped broker; see ISSUE-0026.

## Activity log

### 2026-10-26 — Created

Issue created from the supplied project input.

### 2026-10-26 — Status changed from proposed to ready.

### 2026-10-26 — Status changed from ready to in-progress.

### 2026-10-26 — Status changed from in-progress to done.

## Completion summary

Delivered and verified normal-profile Chrome debugger/native bridge with frame, file-content, popup/dialog and reconnect evidence; Edge and broader provider variants remain unverified.
