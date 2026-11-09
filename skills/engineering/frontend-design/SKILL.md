---
name: frontend-design
description: Verify existing frontend contracts using the bundled layout, scrolling, focus, responsive and accessibility checkers when a project explicitly depends on them. Use Impeccable for visual design and implementation direction; this compatibility skill does not select a new aesthetic or run a second design workflow.
---

# Frontend Verification Compatibility

This package preserves existing project verification interfaces. Impeccable and the project's established design system own visual decisions. Do not load historical design references as a competing default workflow.

## Read the declared contract

Read project instructions, the affected surface, design contract and verification commands. Identify the actual target, build, viewport, theme and content states. A read-only review remains read-only. Missing design documentation is a finding, not permission to create a new visual direction.

For layout/scrolling read [layout and scroll](references/layout-scroll.md); for zoom, localization and access read [responsive/accessibility](references/responsive-accessibility.md). These references support the project's requirements. They do not enable Hooks, CI or new dependencies.

## Verify observable behavior

Read [visual review and executable verification](references/visual-review.md). Reuse `checkUI(page, contract)` and `verifyUIReport` where the project depends on them. Preserve established public APIs, report schemas and source resources. The CLI accepts prepared URL states; it does not own authentication or test data setup.

Use the project's currently authorized, available browser or desktop tooling. Bind evidence to the actual target/build and literal assertions. Browser layout checks do not verify native windows; native UI needs its own observations and assertions. Preserve unit/integration tests and TDD. Missing tooling, untested states and readiness failures remain unverified.

`node scripts/verify-design.mjs <project> --json` produces static review leads, not aesthetic approval or runtime acceptance. Revalidate reports after their inputs change. Approved visual-regression baselines remain project design decisions.

## Return evidence

Report the checked contract, commands, measured layout/scroll/focus/accessibility results and remaining gaps. Refer aesthetic questions and implementation changes back to Impeccable and the project's owner. Historical design references and templates remain available for explicit existing consumers; they are not a second source of visual authority.

Provenance remains in [sources](references/sources.md). Installing this package does not configure project governance.
