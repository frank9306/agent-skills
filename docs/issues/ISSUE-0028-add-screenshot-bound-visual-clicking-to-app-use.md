---
id: ISSUE-0028
title: "Add screenshot-bound visual clicking to app-use"
status: done
priority: high
created: 2026-10-27
updated: 2026-10-27
closed: 2026-10-27
sources: ["Owner request in this chat on 2026-10-27"]
related_adrs: []
depends_on: []
---

# ISSUE-0028: Add screenshot-bound visual clicking to app-use

## Problem

Pure image and Canvas controls without DOM or UIA child nodes cannot be operated by the current structured target actions.

## Desired outcome

Let Codex inspect a fresh screenshot and dispatch one guarded click inside the selected visual region on the bound browser tab or desktop window.

## Acceptance criteria

- [x] Browser and Windows desktop expose a fresh screenshot with image-pixel dimensions and a single-use visual observation token; the CLI saves it locally for Codex to view.
- [x] A screenshot-selected bounded region can dispatch one left click on a main-frame Canvas/image surface or a desktop painted surface, with literal result readback on real controlled fixtures.
- [x] Missing/reused/expired tokens, invalid regions, changed screenshots/geometry, wrong foreground/tab/origin, disabled hits, and sensitive content fail before input; a click never claims goal verification.
- [x] Skill guidance describes vision selection, ambiguity and post-action verification; deterministic contracts, native builds, real integrations and an independent read-only review are recorded.

## Out of scope

No autonomous vision service, OCR/model download, Laya vision changes, frozen-case vision branching, arbitrary screen/global coordinates, browser iframe visual targets, pixel baselines, publishing, installation or Git mutations. Visual selection uses the current Codex model's image understanding; no model confidence score is treated as proof of correctness.

## Decisions

### Pre-generation module design — 2026-10-27

The browser bridge and Desktop session remain authoritative owners of their target identity, screenshot/privacy checks, freshness and physical input. Two public session operations are added: `visual-observe` returns `{id,identity,coordinateSpace:"image-pixels",image:{mime,data,width,height}}`; `visual-click` takes `{session,observation,target:{x,y,width,height,description}}`, clicks the region center, and returns `{actionExecuted:true,goalVerified:false,observation,diagnostics}`. All coordinates refer to the exact returned full image, not screen or CSS coordinates. A new visual observation replaces previous tokens; ordinary observation/actions, adapter operations, stop and disconnect invalidate them. Tokens expire after 60 seconds and are consumed on any visual-click attempt. Input cannot bypass the session owner with a caller-supplied capture or hash.

Hidden lifecycle: capture only the bound foreground window/active browser viewport, retain identity/geometry/DPI or viewport metrics and PNG bytes inside that session, then validate a fresh recapture and the live hit point immediately before input. Exact PNG equality is deliberately conservative: animation or any changed visible content requires a new look. Desktop uses physical pixels and window-relative coordinates, rejects masked password-region overlap and checks hit window/UIA ownership; browser maps actual PNG dimensions to the main-frame CSS viewport, rejects frame hits, disabled/inert/sensitive hits and scans all known frame contexts for sensitive fields. The runtime bounds and freshness checks do not prove a model's semantic target choice; the agent must view the image and select one clear target, or stop. A subsequent screenshot/readback verifies the goal independently.

File ownership: extension/bridge.mjs owns browser lifecycle and serialization, extension/visual.mjs (if useful) owns browser-private capture/region guards; native/AppUse/Desktop.cs plus private Visual.cs owns desktop lifecycle. scripts/app-use.mjs exposes the two CLI commands and saves images with explicit `--out`; tests/visual.test.mjs uses only the existing external Chrome API boundary, tests/visual-live.test.mjs covers real normal Chrome, and tests/visual-desktop.test.mjs plus native/Fixture supports real Windows. No new runtime dependency or generic locator/model adapter is needed. Commands, support and a conditional visual reference document the workflow; SKILL.md only routes this fallback.

Representative caller: bind/focus session, `visual-observe --out <PNG>`, view the returned local PNG, send its token and one image-pixel target rectangle to `visual-click`, then validate a literal app result or inspect a new screenshot. Invalid point, foreground loss, repaint, navigation or a concurrent command returns an error and requires reobservation. Callers never capture or compare state themselves.

Verification: one requirement slice at a time through public bridge/CLI/live session operations, observing red before implementation; `npm run test:app-use`, native/fixture publish, actual serial browser/desktop vision acceptance, `npm run check`, skill quick_validate, syntax and diff checks; full repository suite if its existing dependencies are available. No project architecture/check configuration exists for ESM/C#; this existing coverage gap is recorded rather than installing governance. Review base: 372dcd6c7d7ffe8dc4f84cb90d027556ee55dd3d.

## Implementation notes

Implemented screenshot-bound browser and desktop session operations, local non-overwriting PNG CLI output and conditional visual guidance. Browser sessions serialize requests while stop remains interruptible; screenshots check complete frame/privacy coverage before and after acquisition and bind navigation generation. Both owners recapture after pointer movement to reject hover-triggered repaint before pressing. No external model or dependency was added; Codex views the returned PNG and supplies one described rectangle.

TDD red observations: browser unsupported method, foreground loss during capture, expired-request token reuse, sensitive content appearing during capture, token expiring while recapturing, newly unscanned frame, pointer-induced repaint, navigation during screenshot acquisition; each corresponding focused test became green. CLI missing output and unsupported visual command were red before implementation; clean-checkout missing `.local` failure was reproduced in an isolated copy and fixed. Desktop public method was red against the original broker; pointer-hover red setup was interrupted by foreground loss and is not claimed as a valid behavior red. Earlier integration failures are retained.

## Verification

Final verification on 2026-10-27:

- `npm test` PASS, 139 tests (117 original plus 22 app-use contracts). Existing frontend tests used the bundled runtime via `FRONTEND_PLAYWRIGHT_ROOT` and `FRONTEND_BROWSER_CHANNEL=chrome`; existing Python architecture tests used the already-prepared `.local/verify/Scripts/python.exe` via `INIT_CHECKS_PYTHON`. The initial sandbox full run encountered subprocess errors/stalled and was stopped; the real-user-context full run passed without rule, dependency or exclusion changes. All 22 affected contracts passed again after the final diagnostic-message edit.
- `npm run check` PASS (24 Skills), skill-creator `quick_validate.py` PASS, 7 changed JavaScript modules parsed, UTF-8/replacement-character and `git diff --check` checks passed. Native AppUse and Fixture .NET 10 self-contained publish passed using the existing read-only SDK; outputs/config remain under `.local/visual-desktop`. No ESM/C# architecture scanner is configured; that prior coverage gap remains explicit.
- Final normal Chrome 155.0.8059.85: `npm run test:app-use:visual:browser` PASS, `.local/visual-browser-state/runs/run-UCIClN`. Actual Canvas/PNG clicks read back literal `Canvas play selected` / `Image check selected`; consumed-token/repaint guards passed. `inspectRun` confirmed pass/integrity verified/build verified with exact initial PNG artifact hashes. A prior attempt `run-9SibFi` stopped on surface change and was preserved; no freshness guard was removed. Earlier `run-63hgL8` and actual Codex original-PNG inspection/green-play selection (`manual-browser.png`, `manual-result.json`, literal `Canvas play selected`) remain historical usage evidence, not replacements for the final source-bound report.
- Final Windows: `npm run test:app-use:visual:desktop` PASS, `.local/visual-desktop/state-final/runs/run-B1XWQn`, DPI 96. Painted click/readback, consumed/missing token, invalid region, ordinary-command invalidation, password-mask overlap, timed repaint, geometry, pointer-hover repaint and disabled hit passed. `inspectRun` confirmed pass/integrity verified/build verified, literal `app-use-visual-desktop-v1` build readback and hashed initial PNG. User paused interaction for this run; earlier foreground-loss runs remain errors. Separate manual screenshot-view attempts `run-MW9MWg` / `run-X2XPKB` stopped on foreground/image change and are not claimed as successful desktop vision actions.
- Additional unchanged browser regression tests PASS, 2 tests: frozen cases/layout checker detect defects/restoration; real OOPIF/file-content/dialog/popup/session/secret behavior (`run-dJAfAt` and associated acceptance/layout reports). Additional original desktop regressions: broker diagnosis PASS; `windows-live.test.mjs:43` failed after movement when UIA returned root/system chrome but omitted client controls (`run-pew8VX`). The move/Observe paths are unchanged and ISSUE-0025 records a similar prior failure; no new root cause is asserted. This optional regression remains a limitation, not a pass or a visual-feature fix. Multi-monitor DPI transitions, real Edge and arbitrary providers remain unverified.
- Independent read-only review against 372dcd6c7d7ffe8dc4f84cb90d027556ee55dd3d passed after fixes; no outstanding P0/P1 or new actionable code finding. It also checked that the instructions support visual selection without fixture coordinates. Clean-clone test setup, token expiry, hover and post-capture frame/privacy findings were fixed and tested.

The existing unpacked bridge was reloaded through its supported UI for testing. No installed Skill copy, global runtime configuration, registry, dependencies, Git index, commits, branches or remotes were changed. Task-created Chrome tabs and temporary CLI test folders were cleaned; original tabs were preserved. Build outputs and evidence are intentionally retained locally. Animation, hover styling, foreground loss or any changed PNG requires a new look; this does not promise atomic rendering or semantic enabled-state detection from pixels.

## Activity log

### 2026-10-27 — Created

Issue created from the supplied project input.

### 2026-10-27 — Status changed from proposed to ready.

### 2026-10-27 — Status changed from ready to in-progress.

### 2026-10-27 — Status changed from in-progress to done.

### 2026-10-27 — Follow-up installation authorized by owner

The owner explicitly requested updating the installed app-use copy after implementation delivery. Backed up the complete prior 72-file installation, original runtime.json and original Native Messaging manifest under `C:/Users/frank/AppData/Local/app-use/backups/app-use-visual-20261027-095517`. Installed all 79 authoritative Skill files into `C:/Users/frank/.agents/skills/app-use`; independent read-only comparison verified every SHA256 and the old backup bytes. Copied the validated 474-file runtime to `.local/runtime-installed-app-use-visual-20261027-095517`, also fully hash-verified. Updated only executable/pipe in the user runtime configuration and the executable path in the already-registered E-drive native-host manifest; Laya, model settings, registry values and allowed extension origins were preserved.

Reloaded the existing bridge through its supported UI and verified the new pipe ending `17ceac4ad68e` has one connected extension. Verified the serving broker's actual executable path matches the new installed runtime. Installation smoke invoked `visual-observe` from the installed CLI, saved a valid 1600x788 PNG of a controlled localhost page, and confirmed browser/desktop visual-click invalid-token guards without dispatching a click. The smoke-created tab was closed using its recorded ownership; no user browser tab was closed. Metadata and smoke results are retained in `.local/last-install-visual.json` and `.local/installed-visual-smoke-result.json`. No implementation code, dependencies, commits or global Agent instructions were changed by this installation follow-up.

## Completion summary

Added Codex screenshot-selected browser/desktop visual clicks with single-use freshness, geometry, privacy and hover guards; bounded real visual acceptance passed, old UIA post-move provider instability remains disclosed.
