---
id: ISSUE-0022
title: "Require shared deep-module design before code generation"
status: done
priority: high
created: 2026-10-13
updated: 2026-10-13
closed: 2026-10-13
related_adrs: []
depends_on: []
---

# ISSUE-0022: Require shared deep-module design before code generation

## Problem

Current entry points describe conditional module design but do not share a concrete pre-generation contract; callers can generate implementation first and rely on later restructuring.

## Desired outcome

Use one shared pre-generation design gate from implementation, TDD, frontend generation, routing, and new-project documentation; align ai-playbook global instructions and adoption guidance without touching business projects.

## Acceptance criteria

- [x] One canonical pre-generation gate defines when to design, the concrete project record required before implementation and behavior tests, caller walkthroughs, and contract reuse.
- [x] implement-issue, tdd, and frontend-design apply the same gate; independently installed callers can resolve its canonical source instead of maintaining copies.
- [x] route-work routes to that gate; review-code and the completion gate verify its evidence without duplicating its criteria.
- [x] init-docs generates a reference to the shared gate, preserves opt-in checks, and remains idempotent without updating any existing business project.
- [x] ai-playbook global instructions, existing deep-module handbook, and development workflow require design before first generation and link to the implementation authority.
- [x] Routine changes reuse valid existing contracts; design does not imply new approvals, dependency installation, a new tracker, or identical directories across languages.
- [x] Repository validation, affected tests, reference/encoding checks, and fixed-base read-only review pass; actual distribution and model-behavior evidence are reported honestly.

## Out of scope

No business-project edits, global-client synchronization, installed Skill changes, commits, pushes, branches, new standalone design Skill, or Rust/Go checker implementation. Existing private-unit-test policy and opt-in init-checks authorization remain unchanged.

## Decisions

The execution authority remains `skills/engineering/implement-issue/references/module-depth-gate.md`. Handbooks explain adoption and link to it; callers reference it. Project design facts live in their existing architecture contract or Issue/tracker design section, not copied workflow text. The gate is language-neutral and does not imply all languages already have executable check profiles.

Before editing the workflow, the file ownership and dependency plan is:

| Owner | Files and public entry | Hidden detail / dependency |
|---|---|---|
| Canonical gate | implement-issue reference | Owns applicability, required design record, readiness decision, and generation discipline |
| Code-generation callers | implement-issue, tdd, frontend-design SKILL.md | Read the gate through local reference or canonical-source fallback; do not reproduce criteria |
| Router and delivery review | route-work, review-code, completion-gate | Route to / verify evidence of the same gate |
| Project documentation setup | init-docs Skill and workflow template | Emit a portable source pointer, not a private copy or automatic business migration |
| Personal handbook | ai-playbook global prompt, docs/deep-modules.md, docs/development-workflow.md | Short policy and adoption guidance; single execution source in agent-skills |

Representative paths: a new React/Rust/Python/Go capability records a design before any behavior-test or implementation generation; an internal bug fix reuses the current contract; direct TDD/frontend calls cannot skip the gate; a standalone Skill resolves its missing sibling source before code generation; read-only reviews do not create project design files. Verification uses existing repository validators and initializer tests plus manual path walkthroughs. No new executable module or dependency is introduced.

## Implementation notes

Strengthened the existing implement-issue module-depth reference as the single pre-generation execution authority. It now requires an affected-scope design record and caller walkthrough before implementation or behavior tests, with explicit reuse for internal changes and continuation. Neutral scaffolding is permitted without business behavior; known ownership/interface problems cannot be deferred to a later refactor phase.

Implementation, direct TDD, frontend generation, routing, delivery review, and init-docs now reference that authority. Code-generation callers provide a canonical-source fallback when installed without the sibling Skill. The router delegates design execution to the implementation owner rather than creating a second lifecycle. The project workflow template emits a portable pointer only; existing business projects and installed client files were not migrated.

ai-playbook reuses its existing docs/deep-modules.md as the handbook entry, removes the duplicate criteria table, and aligns its global instruction source and development workflow. Source ownership remains: short global policy / handbook adoption / one Skill execution reference / project-specific design facts. No new executable checker, dependency, standalone Skill, or language profile was introduced.

## Verification

- ai-playbook: `node --check scripts/sync-prompts.mjs` passed; `node --test test/sync-prompts.test.mjs` passed 8 tests. No real client synchronization was run.
- agent-skills: `npm run check` passed for all 23 Skills; quick_validate.py passed for implement-issue, tdd, frontend-design, route-work, review-code, and init-docs.
- `npm run test:ai-docs` passed all 7 tests (2 initialization, 3 Issue lifecycle, 2 ADR).
- An isolated actual init-docs initialization created 12 files, then reported all 12 unchanged; the rendered workflow retained the canonical pointer without copying the gate body.
- Changed-file audit checked 73 local/cross-repository source links before closure and 75 in the final audit, UTF-8 without BOM or replacement characters, original working-tree LF/CRLF conventions, and no staged changes. `git diff --check` passed in both repositories.
- Scope check: all 51 files in the earlier focus-timer delivery archive still match the business project byte for byte. Writes were restricted to the two authorized source repositories and temporary work scripts.
- Fixed-base read-only review used `git diff 51f38b66e28fa96dc44b021b76ea3cfcffb4cd07 -- ...` in agent-skills and `git diff 811e80578b07654f71ba1bc5b085390512e8500c -- ...` in ai-playbook, plus the new Issue. No unresolved P0/P1 finding. Manual scenarios covered new capabilities in TS/Python/Rust/Go, internal fixes without formal architecture documents, continuation, direct TDD/frontend entry, standalone-reference fallback, and read-only requests. These are policy/call-path reviews, not live model-generation trials.

The unrelated executable checker/frontend/service suites were not rerun: this change modifies instructions, references, and a project-documentation template only; no executable implementation or dependency changed. The existing full init-checks rollout and native Hook/CI gaps remain in ISSUE-0019. Rust/Go checker support, actual model adherence, remote publication, and installed-client activation are not claimed.

## Activity log

### 2026-10-13 — Created

Issue created from the supplied project input.

### 2026-10-13 — Status changed from proposed to ready.

### 2026-10-13 — Status changed from ready to in-progress.

### 2026-10-13 — Status changed from in-progress to done.

## Completion summary

Unified a shared pre-generation deep-module design gate across code-generation workflows and the ai-playbook handbook/global source. Design records precede first implementation and behavior tests; valid contracts are reused. Source validation, 15 affected tests, isolated initialization, links/encoding, and fixed-base review passed. No business-project edits or client synchronization.

### 2026-10-13 — Publication and local adoption follow-up authorized

After the source-only completion above, the owner explicitly authorized committing and pushing both repositories, then synchronizing installed Skills and managed global instructions. The earlier distribution exclusions and verification statements describe that initial delivery, not this newly authorized follow-up. Local adoption preserves exact-byte backups, updates existing repository-owned Skill copies, and verifies source equality; it does not migrate business projects or claim live model adherence. Publication and machine-specific synchronization results belong in the follow-up delivery report, without adding private installation paths to this repository.
