# Support and validation

V1 scope: Windows x64, Chromium 125+ debugger flat sessions, and Windows screenshot sessions with a bound window. [Visual fallback](visual.md) adds a screenshot-selected click for stable visible image/Canvas or desktop painted controls; browser visual targets are limited to the main document. No mobile/macOS/Linux UI, unattended OCR/vision service, universal game control, or screenshot pixel baseline engine. Restricted browser pages, enterprise policy, protected desktop, elevated integrity mismatches and unavailable provider patterns fail explicitly.

Real verification records belong in the linked repository Issues and local run artifacts. A successful fixture proves its tested behavior and runtime only; it does not prove every application/provider, browser version, DPI or frame type.

Desktop checks cover bound-window focus, fresh screenshots, guarded coordinate input, and credential capture pause. Verify DPI at the bound window.

Run `npm run test:ui-automation:desktop-guard` on an interactive Windows desktop. Set `UI_AUTOMATION_FOREGROUND_FIXTURE` to the current published Fixture.exe and set `UI_AUTOMATION_BASELINE_CONFIG` and `UI_AUTOMATION_REPAIRED_CONFIG` to the previous and repaired native runtime.json files. The test uses the same controlled window and measures the CLI request round trip separately for screenshot and click operations. Each case reports nine samples after one warmup. It checks click delivery, session revocation, temporary image removal, and task and capsule exit after explicit finish and stdin EOF.

Browser acceptance requires the installed unpacked extension and Native Messaging in the user's normal browser. An isolated Chromium test or mock API can validate adapter/transport contracts but cannot satisfy that acceptance. Shared login/session state is retained; each case must document preparation, restoration, source inputs and its build assertion.

Declared layout checks depend on sibling `frontend-design/scripts/check-ui.mjs`; ui-automation does not own a duplicate layout rule set. Missing browser/runtime/checker, incomplete observation, absent assertion or all N/A produces unverified/error, never pass.

Repository checks: `npm run check`, `npm run test:ui-automation` (deterministic transport/runner/evidence contracts). Opt-in actual integrations: `npm run test:ui-automation:browser` (normal connected Chrome), `npm run test:ui-automation:laya` (prepared worker/weights and normal Chrome). Missing prerequisites fail these commands. Keep physical UI suites serial so they do not steal each other's foreground. The original frontend-design browser suite is unchanged and remains part of `npm test`.

Visual acceptance uses the browser visual suite and a fresh Windows screenshot with an AI-selected region and observable result.

Foreground acceptance: `npm run test:ui-automation:foreground` requires `UI_AUTOMATION_FOREGROUND_FIXTURE` pointing to the published Fixture and the current normal-Chrome bridge. It serially checks independent Win32 HWND readback, maximized preservation, minimized restoration, alternating background targets, browser marker removal, and foreground recovery with a literal action result. Native proof is independent of Chrome's focused flag. Protected/locked desktops, integrity mismatches and concurrent user input can still deny activation; they must never produce verified success.

## Task capsule

The [capsule contract](status-events.md) documents task lifetime, placement, and the prebuilt Win32 renderer. Run the native smoke fixture on an interactive Windows desktop to verify actual window behavior. Exercise target movement between monitors with different effective DPI before claiming mixed-DPI acceptance. The default Node suite checks the runner contract only.
