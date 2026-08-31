---
id: ISSUE-0010
title: "Add dispatch-dsh-task Hermes skill and dispatcher runtime"
status: done
priority: high
created: 2026-08-28
updated: 2026-08-31
closed: 2026-08-31
related_adrs: []
depends_on: []
---

# ISSUE-0010: Add dispatch-dsh-task Hermes skill and dispatcher runtime

## Problem

Hermes has no scoped, repeatable capability for turning WeChat or cron requests into auditable my-knowledge Issues executed by DeepSeek Harness.

## Desired outcome

Provide a validated dispatch-dsh-task skill, deterministic client and host dispatcher scripts, tests, and deployment instructions constrained to frank9306/my-knowledge.

## Acceptance criteria

- [x] Add a discoverable `dispatch-dsh-task` Skill with immediate and Hermes-cron routing instructions and a fixed request schema.
- [x] Add a deterministic client that validates and submits signed JSON over the private Docker bridge and returns a bounded structured result.
- [x] Add a host dispatcher that only permits `frank9306/my-knowledge`, provides locking and idempotency, maintains target local Issues, invokes DSH headless, independently verifies the build, and emits redacted JSON results.
- [x] Cover payload validation, allowlisting, idempotency, Issue creation/indexing, locking, and failure behavior with focused automated tests.
- [x] Pass the Skill validator and the full `agent-skills` check suite.

## Out of scope

- Generic multi-repository dispatch, parallel execution, GitHub Apps, PR creation, and direct Docker control from Hermes.

## Decisions

- Use HMAC-authenticated JSON over a dispatcher bound only to the private Docker bridge. This is the owner-authorized and deployed boundary; it does not expose an unauthenticated public HTTP service and never shell-composes user text.
- Keep runtime scripts in this Skill so the deployed dispatcher is versioned with its caller contract.
- Use one write-enabled SSH deploy key scoped to `frank9306/my-knowledge` for the MVP.

## Implementation notes

The runtime target is the existing fnOS host and the existing `deepseek-harness` container. The dispatcher workspace maps to the container's `/workspace` volume.

## Verification

2026-08-31: npm run test:dispatch-dsh-task passed 14 tests; node scripts/check-skills.mjs validated 21 Skills; full npm test passed. Earlier live verification completed owner-assisted ISSUE-0012 and real WeChat ISSUE-0013.

## Activity log

### 2026-08-28 — Created

Issue created from the supplied project input.

### 2026-08-28 — Requirements settled

The owner approved the implementation plan and automatic verified push policy.

### 2026-08-28 — Status changed from proposed to ready.

### 2026-08-28 — Status changed from ready to in-progress.

### 2026-08-28 — Launch and independent-verification regressions fixed

- NAS recovery identified three runtime defects: missing Node `--expose-internals` required by HMR; wrong `DSH_HOME` hiding the web model/credential configuration; pnpm verifier inheriting an unusable HOME. Fixed the launcher to use `--expose-internals` and `DSH_HOME=/data/dsh`, and verification Docker calls to use `HOME=/data/dsh/home`.
- Added three regression tests at the subprocess boundary; each failed before its fix and passed afterward. Full `npm test` passed (27 tests, including 14 dispatcher tests); `node scripts/check-skills.mjs` passed (21 Skills). Encoding checks found no BOM, replacement characters, or mixed line endings in edited runtime/test/template files.
- Aligned the service template with the earlier owner-authorized live removal of RestrictAddressFamilies, which had implicitly prevented sudo execution. No additional live service restart was performed; the existing HTTP process still needs an authorized restart to load the patched Python module.
- Deployed runtime script changes with backups under the NAS backup directory. Owner-assisted resume completed my-knowledge ISSUE-0012 with DSH commit `f56413452be3210086821a270ad1db2931602879`; independent build and evidence correction completed at `50074fd2dafc08c1da57393402b6a226db5f766f`, with a clean target worktree and HEAD equal to origin/main.
- The initial shared-home run remained blocked on its verifier failure; the later successful owner-assisted verification is recorded separately. This is not evidence of a complete HTTP/WeChat/cron roundtrip. Transport mismatch with the original forced-command SSH criteria, resume/retry semantics, service reload, and remaining acceptance tests are still open. No changes in this source repository were committed or pushed.

### 2026-08-28 — Patched dispatcher activated and HTTP replay verified

- With explicit owner approval, restarted only `feiniu-dsh-dispatcher.service`. MainPID changed from 256969 to 284000; service active/enabled, running as admin with runtime NoNewPrivs=0. The new process loads the patched launcher and verifier module.
- The first HTTP probe used an incorrect loopback port and was refused. Read the actual service source/listener, then performed one corrected probe against the configured private Docker-bridge endpoint; no additional service restart was needed.
- Health endpoint returned HTTP 200. Unsigned task submission returned HTTP 401. Before signed replay, confirmed the exact original payload already existed in the idempotency store; replay returned HTTP 409 with the original blocked run `20260828-105957-dec2b1f3`, ISSUE-0012, and `idempotent_replay=true`. Run-directory inventory was unchanged.
- The cached blocked response preserves the original failed attempt; it does not reverse the later completed and published ISSUE-0012. No new Issue, task execution, content change, commit, push, or cron schedule was created by this verification.
- Service activation is now complete. Real WeChat/Hermes submission and result delivery, cron execution, explicit existing-Issue resume/retry handling, remaining failure cases, and reconciliation of HTTP/HMAC with the original SSH criteria remain open. Overall MVP status stays in-progress.

### 2026-08-28 — Real WeChat task completed; launcher HOME omission corrected locally

- Owner supplied the actual WeChat/Hermes final response for run `20260828-143853-6842fdfd`. NAS result independently confirmed `done`, ISSUE-0013, `pnpm docs:build passed`, deployment `success`, final commit `ad20e7d468f1ebcdc84b7cb0c9dd019cc20e672b`, and duration 1080.76 seconds. Target worktree was clean. This verifies one real immediate WeChat request through Hermes/Dispatcher/DSH and result delivery back to the originating conversation.
- Commit semantics: `f0ce0c9` creates the Issue; `4f63c4d` claims it; `e4d9916` implements the reporting rule; `ad20e7d` records push status/commit evidence. The WeChat summary mislabeled the creation commit as a document implementation and the final evidence commit as a merge; those labels are not authoritative Git facts.
- During the 18-minute run, DSH encountered 18 environment-error events and repeatedly attempted pnpm workarounds. Evidence included read-only `/root/.gitconfig`, inability to create `/root/.local`, and EACCES under temporary pnpm paths. Its main process lacked explicit HOME even though the independent verifier already had one. The task ultimately recovered; no duplicate task was dispatched or active process interrupted by this investigation.
- Extended the existing launcher regression test to require writable `HOME=/data/dsh/home`; observed failure with HOME absent, then added the Docker environment argument to `run_dsh`. Full `npm test` passed (27 tests) and the Skill validator passed (21 Skills).
- This additional HOME fix is LOCAL ONLY: it has not been deployed, committed, pushed, or loaded by the live service. Deployment plus restart of `feiniu-dsh-dispatcher.service` requires owner confirmation. No fresh performance run has verified the expected reduction in environment detours.
- Remaining MVP work: cron-path verification, transport-criteria reconciliation, existing-Issue resume/retry semantics, remaining safety/failure checks, and clearer stage/commit labels in result reporting. One successful immediate run does not close the entire MVP.

### 2026-08-28 — Launcher HOME fix deployed and activated

- With explicit owner authorization, confirmed the dispatcher exclusive lock was available, backed up the live script to `/vol2/1000/backup/ai-task-dispatcher/20260828-150135-launcher-home/dsh_dispatcher.py`, deployed the launcher HOME argument, and restarted only `feiniu-dsh-dispatcher.service` while holding the lock. No task was interrupted or newly submitted.
- Deployed SHA-256 matches the tested local source: `7c5231aed32b17015ae512475efa089a582707786b21d0ba761fe1c9a7ed5ae8`. New MainPID 291182; service active/running and enabled, NRestarts=0.
- The health probe immediately after restart received connection refused. Targeted service status/journal showed no crash or auto-restart; one subsequent health probe returned HTTP 200 without another restart.
- A container shell using the launcher's HOME, DSH_HOME, and PATH confirmed `HOME=/data/dsh/home`, writable HOME, and pnpm 10.14.0 with exit 0. The target repository remained clean. This is an environment smoke check, not a new full-task timing measurement.
- No local source/documentation changes were committed or pushed. Cron verification and the remaining MVP acceptance items are still open.

### 2026-08-31 — Status changed from in-progress to done.

## Completion summary

Delivered the versioned dispatch-dsh-task Skill, authenticated private-bridge client/server boundary, restricted dispatcher, systemd template, focused tests, and repository integration. Live cron operations remain tracked separately in feiniu-control ISSUE-0010.
