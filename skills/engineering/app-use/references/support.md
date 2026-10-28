# Support and validation

V1 scope: Windows x64, Chromium 125+ debugger flat sessions, and Windows UIA sessions with a bound window. [Visual fallback](visual.md) adds a screenshot-selected click for stable visible image/Canvas or desktop painted controls; browser visual targets are limited to the main document. No mobile/macOS/Linux UI, unattended OCR/vision service, universal game control, or screenshot pixel baseline engine. Restricted browser pages, enterprise policy, protected desktop, elevated integrity mismatches and unavailable provider patterns fail explicitly.

Real verification records belong in the linked repository Issues and local run artifacts. A successful fixture proves its tested behavior and runtime only; it does not prove every application/provider, browser version, DPI or frame type.

Controlled Windows fixture: input, combo selection, real pointer click, read-only result readback, menu and modal dialog, stale/disabled/obstructed target rejection, window movement, password omission and masked screenshot. Verify DPI at the actual session's `identity.dpi`; untested monitor/DPI transitions remain unverified.

Browser acceptance requires the installed unpacked extension and Native Messaging in the user's normal browser. An isolated Chromium test or mock API can validate adapter/transport contracts but cannot satisfy that acceptance. Shared login/session state is retained; each case must document preparation, restoration, source inputs and its build assertion.

Declared layout checks depend on sibling `frontend-design/scripts/check-ui.mjs`; app-use does not own a duplicate layout rule set. Missing browser/runtime/checker, incomplete observation, absent assertion or all N/A produces unverified/error, never pass.

Repository checks: `npm run check`, `npm run test:app-use` (deterministic transport/runner/evidence contracts). Opt-in actual integrations: `npm run test:app-use:desktop` (prepared fixture), `npm run test:app-use:browser` (normal connected Chrome), `npm run test:app-use:laya` (prepared worker/weights and normal Chrome). Missing prerequisites fail these commands. Keep physical UI suites serial so they do not steal each other's foreground. The original frontend-design browser suite is unchanged and remains part of `npm test`.

Visual acceptance: `npm run test:app-use:visual:browser` exercises real Canvas/PNG targets and literal readback in normal Chrome; `npm run test:app-use:visual:desktop` exercises the prepared fixture's `--visual` mode (`APP_USE_VISUAL_FIXTURE` can select its executable), repaint, geometry, hover, disabled and password-mask guards. Fixed fixture coordinates test the runtime; a separate actual screenshot inspection and model-selected rectangle exercises vision selection.

Foreground acceptance: `npm run test:app-use:foreground` requires `APP_USE_FOREGROUND_FIXTURE` pointing to the published Fixture and the current normal-Chrome bridge. It serially checks independent Win32 HWND readback, maximized preservation, minimized restoration, alternating background targets, browser marker removal, and foreground recovery with a literal action result. Native proof is independent of Chrome's focused flag. Protected/locked desktops, integrity mismatches and concurrent user input can still deny activation; they must never produce verified success.
