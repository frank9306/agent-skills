# Support and validation

V1 scope: Windows x64, Chromium 125+ debugger flat sessions, Windows apps exposing UIA. No mobile/macOS/Linux UI, universal Canvas/game recognition, or screenshot pixel baseline engine. Restricted browser pages, enterprise policy, protected desktop, elevated integrity mismatches and providers lacking patterns fail explicitly.

Real verification records belong in the linked repository Issues and local run artifacts. A successful fixture proves its tested behavior and runtime only; it does not prove every application/provider, browser version, DPI or frame type.

Controlled Windows fixture: input, combo selection, real pointer click, read-only result readback, menu and modal dialog, stale/disabled/obstructed target rejection, window movement, password omission and masked screenshot. Verify DPI at the actual session's `identity.dpi`; untested monitor/DPI transitions remain unverified.

Browser acceptance requires the installed unpacked extension and Native Messaging in the user's normal browser. An isolated Chromium test or mock API can validate adapter/transport contracts but cannot satisfy that acceptance. Shared login/session state is retained; each case must document preparation, restoration, source inputs and its build assertion.

Declared layout checks depend on sibling `frontend-design/scripts/check-ui.mjs`; app-use does not own a duplicate layout rule set. Missing browser/runtime/checker, incomplete observation, absent assertion or all N/A produces unverified/error, never pass.

Repository checks: `npm run check`, `npm run test:app-use` (deterministic transport/runner/evidence contracts). Opt-in actual integrations: `npm run test:app-use:desktop` (prepared fixture), `npm run test:app-use:browser` (normal connected Chrome), `npm run test:app-use:laya` (prepared worker/weights and normal Chrome). Missing prerequisites fail these commands. Keep physical UI suites serial so they do not steal each other's foreground. The original frontend-design browser suite is unchanged and remains part of `npm test`.
