# Visual Review and Executable Verification

## Review the rendered surface

Check orientation, hierarchy, task access, content grouping, type, spacing, surfaces and imagery against the brief. Name the consequential defect and its owner; repair only in authorized implementation tasks. Read-only reviews propose fixes. Compare the before/after at the same viewport/state. Exercise focus, selected/disabled, pending, empty/partial/error and success states that are reachable. Include narrow and low-height layouts, long/localized content and zoom.

Source scans are inferred leads. Real screenshots inform aesthetic judgment; project browser assertions establish declared behavior. Approved rendered baselines support project visual regression. This skill has no universal similarity score or pixel-reproduction gate.

## Public checker

Import `checkUI` from `scripts/check-ui.mjs` using the installed skill path. The caller creates the Playwright Page and prepares data, theme, authentication and state. `checkUI(page, contract, options)` returns `status`, `findings`, `measurements`, `coverage`, `environment` and `evidence`. Status is pass, fail or unverified. Reasoned not-applicable checks appear in coverage; an all-N/A case is unverified.

Options: `timeout` (readiness, default 5000ms); `projectRoot`; `inputs` (nonempty unique project-relative source, fixture and resource files); `outDir` (local evidence directory). Bound evidence requires explicit inputs. Include every relevant source, data and asset plus the contract file; input completeness is the caller's responsibility. An in-memory pass without inputs proves only the measured checks, not a reusable delivery report. Screenshot output gets a new run directory, never overwriting a baseline.

## Contract version 1

Start from [the example](../assets/UI.contract.example.json). Required fields: `version:1`, `id`, positive integer `viewport:{width,height}`, `colorScheme:light|dark`, `state`, `ready`, `targets` and nonempty `checks`. Page viewport/media theme must already match. `ready` is a unique visible selector or `{selector,text?,value?}`; use a state-specific condition rather than merely naming a state. Targets map names to stable selectors; selectors used for measurement must match exactly once and be visible.

Each check has a unique `id` and a `type`:

| Type | Fields and behavior |
|---|---|
| style | target, property, value (CSS string); compare resolved CSS |
| equal-style | target, other, properties; compare same theme/variant/state |
| within | target, container; target rectangle stays inside container |
| align | target, other, edge: left/right/top/bottom/centerX/centerY |
| size | target, dimension: width/height, min, max |
| page-overflow | document horizontal overflow stays within tolerance; intentional local scroll is allowed |
| scroll | target (or reserved document), axis:x/y, optional positive delta, stationary target names; optional boundary:{edge:start|end,behavior:contain|chain,ancestor:name} |
| pinned | target, scroller, axis; scroller moves while target's axis coordinate stays fixed |
| reachable | target, scroller, optional stationary; scroll into view and center hit-test |
| focus | target, method:current|tab; tab checks keyboard reachability, optional maxTabs (1..200, default 50) |
| overlay | target, stationary background names; exposed-backdrop wheel and current focus containment; needs overflowing background data |
| not-applicable | reason explaining this named check's absence in this state |

Unknown fields are configuration errors. Geometric/scroll tolerance defaults to 1 CSS px. Overrides are nonnegative and carry `reason`. CSS values compare using browser normalization; use size/align for geometry. Intended overlap is represented by appropriate scoped checks, not a blanket suppression. Boundary chaining requires a distinct ancestor with room in the tested direction. Scroll positions are restored after probes; keyboard focus is intentionally left at the tested target, so callers manage test isolation.

The checker does not click business controls, log in or run JSON scripts. Project tests own opening/closing, focus trapping, refresh and transition sequences. Invoke checks before/after those actions. Keep actual transitions enabled for behavior tests. It does not infer every unmarked defect, verify remote backend data, or prove native/touch/keyboard-device behavior.

## CLI and report lifetime

```sh
node <skill>/scripts/verify-ui.mjs --contract <project>/ui-case.json --project-root <project> --runtime-root <existing-playwright-root> --out <project>/.ui-evidence
node <skill>/scripts/verify-ui.mjs --verify-report <report.json>
```

CLI contracts add `url` (already-prepared state) and `inputs`; the contract itself is also fingerprinted. The contract is inside projectRoot. Runtime defaults to projectRoot; an explicit runtime root overrides it. Resolve existing @playwright/test or playwright. `--channel chrome` or `--channel msedge` selects an installed browser; otherwise use installed Playwright Chromium. No dependencies/browser downloads occur. Complex state setup uses the module in project tests.

Exit codes: 0 declared checks pass, 1 expectation failures, 2 invalid contract/environment/execution or unverified evidence. Report verification rechecks source/data/resource inputs, contract, checker version, report contents and screenshots. Digests detect stale/changed evidence; they are not signed authenticity guarantees. Serve/build the declared sources before checking: a source hash cannot establish which remote build is deployed.

Keep evidence local. Screenshots may show application data; prepare sanitized test states. Never put credentials, storage state or private payloads in contracts. URL query/fragment credentials must not enter shared reports. Do not update visual baselines, weaken checks, hide content or remove tests to obtain a pass.

## Handoff

Report design-system consistency, layout/scroll/interaction results, aesthetic observations and configured visual regression separately. State checked viewports/themes/states and exact unverified areas. A JSON record or passing source scan does not replace browser inspection.
