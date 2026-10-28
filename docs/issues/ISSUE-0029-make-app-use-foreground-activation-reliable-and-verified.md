---
id: ISSUE-0029
title: "Make app-use foreground activation reliable and verified"
status: done
priority: high
created: 2026-10-28
updated: 2026-10-28
closed: 2026-10-28
related_adrs: []
depends_on: []
---

# ISSUE-0029: Make app-use foreground activation reliable and verified

## Problem

Browser focus can report execution without acquiring the foreground; desktop focus repeatedly fails in real runs and later input loses foreground between commands.

## Desired outcome

Scoped focus restores and activates the exact target, verifies actual foreground before reporting success, and recovers foreground for authorized input without accepting stale target evidence.

## Acceptance criteria

- [x] Browser focus verifies the actual active tab/focused window, restores minimized targets, and uses a scoped native fallback when Chrome activation is refused; fallback-created marker tabs are removed on success, error, cancellation and disconnect.
- [x] Desktop focus acquires the exact bound foreground window through bounded native activation including an input-assisted fallback, preserves maximized state, records literal foreground readback, and never reports success on failure.
- [x] Supported foreground recovery for ordinary input stays within session scope and rechecks observed targets after activation; screenshot-selected clicks retain their existing focus/freshness rejection contract.
- [x] Deterministic failure/cleanup/cancellation tests and serial real desktop/normal-Chrome foreground acceptance pass against the final build; required repository checks and read-only review are recorded.

## Out of scope

No elevation, security/registry changes, global focus-policy edits, permanent topmost state, arbitrary ambient key API, locked/protected desktop control, external service, new dependency, unrelated refactor, Git mutations, or publication. A native denial remains an error; success is a point-in-time verified foreground result.

## Decisions

### Pre-generation module design — 2026-10-28

Reuse the desktop session/input ownership recorded in ISSUE-0024 and browser lifecycle ownership in ISSUE-0025. Foreground activation is private native infrastructure shared by Desktop and the browser bridge; no new public CLI or caller-coordinated protocol. The established `act {action:{type:"focus"}}` returns `actionExecuted:true`, `goalVerified:false` plus `diagnostics.foreground` only after literal readback; failed acquisition consumes the observation and returns an error. Existing session/target/expiry/foreground guards remain authoritative.

`native/AppUse/Foreground.cs` owns identity checks, current-user input serialization, minimized-only asynchronous restoration, bounded attempts, paired ALT input as a private final activation aid, and exact HWND/PID/readback. It avoids AttachThreadInput and cannot silently leave modifier keys pressed. Native denial/held modifiers/expired request/stopped target are explicit failures. Desktop.cs uses it for explicit focus and ordinary physical input before revalidating targets; visual-click still rejects foreground loss rather than repairing an old screenshot. Visual-observe/capture preparation may explicitly focus through the normal action flow.

`extension/bridge.mjs` owns Chrome window/tab activation and result polling. With a connected native host, explicit focus independently verifies OS foreground even if Chrome reports success: it opens a task-owned extension `focus.html#<random-token>` tab inside the exact bound window; the title is derived only from the random token by focus.mjs. A private callback supplied by background.mjs asks the existing authenticated Native Messaging link for activation; Broker.cs accepts it only for a browser session attached to that same link. Native code uniquely matches the marker caption and Chromium window class, checks process identity, activates it, and returns HWND/PID/readback. The bridge restores the bound tab and removes only its marker in finally, then rereads Chrome focus. Stop/disconnect also clean markers; user page titles/content never change. Unknown/ambiguous windows fail instead of guessing. Native reply traffic uses the existing serialized link writer and a separate reply discriminator, never a new socket or permissive public command.

Ordinary structured input may recover its already-authorized window/tab before fresh target probing; it must not reuse signatures across a changed layout. Browser visual-click and desktop visual-click retain strict no-recovery freshness behavior. Per-session queue and per-user physical-input mutex prevent overlapping input; callbacks remain cancellable through session stop/expiry. The native operation has a bounded deadline and no synchronous attachment to another process's input queue.

Files: Foreground.cs, Desktop.cs, Broker.cs; extension/{bridge,background,focus}.mjs and focus.html; tests/foreground.test.mjs and foreground-live.test.mjs plus controlled Fixture flags; commands/support and a concise SKILL workflow update. No runtime dependency. Tests enter through BrowserBridge.handle or real AppClient requests; a Chrome API test double covers a refused focus and native callback behavior but never claims OS acceptance. Real Windows/Chrome tests record independently queried foreground HWND, minimized/maximized/background restoration, alternating targets, marker cleanup, stale observations and input result readback. Baseline Git commit: 372dcd6c7d7ffe8dc4f84cb90d027556ee55dd3d; existing dirty-file snapshots are retained under app-use/.local/foreground/baseline to isolate this task.

Verification: focused red/green contracts, .NET 10 native/fixture publish with the existing read-only SDK, serial real focus acceptance, `npm run test:app-use`, `npm run check`, `npm test` with already-installed runtimes where available, skill validation and diff/encoding checks. Existing ESM/C# architecture scanning gap remains explicit; no governance installation is authorized. Computer Use's published window2 API documents automatic target activation plus activate_window; its closed native implementation is not asserted to use this strategy.

## Implementation notes

Implemented the recorded private foreground owner, authenticated browser callback and independently verified focus diagnostics without changing the public action contract. Ordinary input recovers foreground before fresh target checks; visual clicks keep strict screenshot/focus rejection. The marker page is task-owned and cleanup is shared across focus, stop, detach and disconnect. No new dependency or Git mutation.

The visual browser regression case now scrolls each declared target into view before taking its single-use screenshot. Its earlier fixed rectangle exceeded the small viewport; failure `run-pGiwXU` is retained. The original desktop movement test initially returned only nonclient UIA nodes (`run-d5oTvz`); direct diagnostic reproduction and two complete 192-DPI runs subsequently passed without changing production movement code. This intermittent provider behavior is not claimed to have been repaired.

Computer Use's URL policy check could not identify the current Chrome URL, so no further input was dispatched through it. The owner manually reloaded the normal-Chrome bridge after the final native build. Final tests use the existing profile and authenticated bridge, not a substitute browser.

## Verification

148 automated tests, 9 serial live regressions, 3 installed-path live foreground smoke tests, source/runtime SHA-256 equality, evidence integrity, layout revalidation, Skill checks and read-only review passed.

## Activity log

### 2026-10-28 — Created

Issue created from the supplied project input.

### 2026-10-28 — Status changed from proposed to ready.

### 2026-10-28 — Status changed from ready to in-progress.

### 2026-10-28 — Status changed from in-progress to done.

## Completion summary

Repaired and independently verified exact-window foreground activation for browser and desktop, then updated the installed app-use Skill and immutable runtime with backups.
