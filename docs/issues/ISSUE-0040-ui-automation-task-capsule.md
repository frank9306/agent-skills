---
id: ISSUE-0040
title: "Keep the UI automation capsule visible for a full task"
status: in-progress
priority: medium
created: 2026-11-11
updated: 2026-11-11
related_adrs: []
depends_on: []
---

# ISSUE-0040: Keep the UI automation capsule visible for a full task

The existing command-scoped window flashes for individual operations, uses primary-screen coordinates, and treats dispatch as verification. Apply the approved Windows capsule design to the existing case runner.

## Module design

The case runner owns the task boundary and reports an allowlisted action category before dispatch, plus the final outcome after evidence and cleanup. It does not send raw requests, observations, or sensitive values to the presentation process. The CLI owns one renderer per run and keeps it alive during waits. The Win32 renderer owns window lifetime, geometry, and painting. It tracks the validated desktop HWND/PID when available and uses the starting foreground monitor as the fallback. The overlay is informational. Authorization and acceptance evidence remain in the existing broker and case runner.

## Acceptance criteria

- [x] One continuous capsule for a multi-step run, including waits, evidence and cleanup. Standalone probes do not flash, and only a verified final result shows success.
- [ ] Native Windows window is click-through and does not take focus. Verify work-area placement and DPI on multiple monitors.
- [x] Prebuilt Go renderer runs without installing an SDK on the user machine. Document NSH project verification.

- [x] Verify the rotating lightband during waits, the stationary reduced-motion state, and the static disconnect and terminal borders.
- [x] Verify the redesigned extension and native bridge in the machine's default Chrome executable.

## Verification

- All 53 deterministic UI Automation tests, the 28-Skill structure check, and Go placement tests passed. Placement cases cover negative monitor coordinates, top taskbar work area, constrained width, and 100%, 150%, and 200% scale.
- The live capsule test passed at 96 DPI. It observed the same visible HWND for 53 samples across a 3.3-second wait, checked click-through, focus and work-area geometry, then observed a passing assertion and capsule dismissal. The existing real UIA fixture and broker tests passed on rerun. The first fixture run missed an item in the window menu.
- The machine exposed a single display. Actual cross-display movement and mixed DPI are still required. Desktop placement is tied to a validated HWND/PID. Chromium currently uses the monitor of the foreground window when the capsule starts because its session identity has no native HWND.
- The current Codex installation matched all 15 changed and built files byte-for-byte. The installed renderer passed the same live check and the installed broker passed doctor. No Chromium extension was connected, so live browser placement remains unverified.

- Final Go renderer passed native pixel checks at 96 and 144 DPI. The installed renderer passed the 144-DPI case with a 660 × 66 window, 52 continuous wait samples, work-area centering, click-through, and normal completion. Restored the machine to its original 100% scale.
- Chrome 156 in an isolated local test profile passed the three live suites for browser actions, frozen-case/layout acceptance and visual clicks. The real CLI case also passed, and the extension UI reflected the connected state and an active session. The normal profile's tabs and cookies were preserved.
- Windows display detection and extend mode found no second active output. The mixed-DPI transition between simultaneous displays remains open.- The installed UI Automation tool bound Windows Settings and invoked Detect. A fresh UIA observation reported no additional display. The installed mixed-DPI acceptance flag rejects this setup before opening a test window.
- The owner will run the remaining cross-display check when a second display is available. Leave the criterion open and run the live fixture with the mixed-DPI requirement enabled.

### 2026-11-12 — Single-run UI tasks with visual fallback

The CLI owns one capsule and one runner per GUI task. Read-only discovery can precede dispatch. Runner waits retry incomplete observations within their existing timeout. A frozen case may route unresolved structured decisions to a visual state. The runner requests one broker-bound visual frame, persists the PNG as evidence, and asks the current Codex model for a declared route through a per-frame local JSON reply. Routes can cover several subsequent structured actions. A route declared as a visual click accepts one image-relative region, dispatched through the existing guarded broker token before continuing. Unknown choices, stale tokens, malformed replies and cancellation cannot dispatch input. The runner owns budgets, verification and final outcome. The CLI transports the image path and reply file while the capsule heartbeats. Test through runCase, CLI and a controlled Windows UI fixture.

- Verified the visual route contract red-to-green. One frame chooses a route with a guarded visual click and two freshly resolved structured actions.
- Structure check passed for 28 skills and all 54 configured deterministic app-use tests passed.
- Live Windows CLI evidence run-uJcdkL: the AI read the screenshot of Mole's review pane, the capsule stayed open during the reply wait, and the same run performed two read-only UIA actions and passed its final assertion. An earlier probe correctly stopped on a disabled/offscreen target.
- Copied the modified skill files into the current Codex installation after verifying the installed baseline and the final file hashes. The existing mixed-DPI criterion remains open.
### 2026-11-12 — Refresh the browser extension identity and popup

The MV3 manifest owns the toolbar name and PNG icon sizes. The popup owns the visual identity, connection status, session count, connection action and recovery controls. The extension key and existing service-worker message contract remain in place. Acceptance covers the toolbar entry, popup in light and dark themes at its normal and narrow widths, keyboard focus, and checking/offline/connecting/connected/error states. The real extension popup and native connection are the final integration checks.

Verification: the final ui-automation manifest keeps the extension ID and permissions and declares four correctly sized icons. Isolated Edge loaded the real extension, displayed the new popup, and reported a connected native bridge. Browser fixture checks passed for 320/360 CSS px, light/dark themes, keyboard focus, offline/connecting/connected/error, and reload dispatch. Chrome rejected command-line extension loading in the isolated profile, so its actual toolbar popup remains unverified. All 54 configured app-use tests and the 28-Skill structure check passed. The installed extension files match the source.