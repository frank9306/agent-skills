---
name: team-delivery
description: "Run approved team delivery mechanics with a reviewed project plan: fixed tool entry, session-scoped context reads, staged test execution and immutable evidence handoff. Use during implementation, QA, repair or resumption; does not authorize scope, waive mandatory checks or replace independent QA."
---

# Team delivery

Use the actual runtime skill directory and its `scripts/team-delivery.mjs`. Read [plan contract](references/plan.md) once when authoring or changing a plan. Keep full project instructions authoritative; this skill automates mechanics, not authorization or verdicts.

1. Verify current host/tool target. Use the runtime's known absolute Node executable, `login=false` on Windows, and argv arrays. `node` inside a check resolves to that executable. Do not probe npm repeatedly: use the verified Node + npm CLI path, or the project's installed executable module directly. Preserve existing source/worktree and permissions.
2. Author/reuse one reviewed project-local JSON plan enumerating complete relevant inputs, exact commands, stage membership and every mandatory final gate. Input directories include new/untracked files. Exclude generated output, dependencies and credentials; output must be outside the project. A wrong input inventory is an invalid handoff even if hashing succeeds.
3. Run `preflight --project P --plan P/delivery.json --out PRIVATE`. Read current task/authorization/project binding/handoff every run. For large project documents, use `context` with current task/session/agreement/actor/phase. Reuse only content retained in that same session. On compaction, reset, missing state or uncertain retention, add `--reset`. Deferred content is unread and must be loaded before dependent work. Independent QA uses its own actor/session/output.
4. Use `check --stage slice --only ID` for one red-green behavior, `module` for affected integration, and `delivery` on final inputs. Do not run full UI per red-green loop. Delivery retains all required checks. Default sequential execution avoids shared-state races; project-owned isolated runners may parallelize explicitly. UI remains serial. Do not repeat green checks without new changes, failures or evidence. A deterministic failure gets one diagnosis; no blind retries.
5. `freeze --receipt FILE` seals final inputs, complete check logs and receipt. Pass the exact bundle path/ID, approved agreement, acceptance mapping and remaining risks in the existing native task handoff. Never rewrite a sealed bundle. A repair generates a new receipt and bundle; stale evidence fails verification.
6. Receiver runs `verify --bundle DIR --bundle-id TRUSTED_ID`, independently reviews changes and runs its own required checks. This integrity result is not a QA verdict or business acceptance. Keep independent native QA identity, mandatory browser/design/structure checks, thresholds and repair limits unchanged. `check-delivery` remains read-only.

Every command also needs `--project`, `--plan`, `--out`. JSON output contains exact exit status, timings and private full-log paths; failures exit nonzero. Timeout kills the direct check process; checks must not start unmanaged services or descendants. Project-owned preview lifecycle remains separate.

Use `browser-kit` to emit the self-contained batch helper into an already authorized evidence directory. Read the MCP wrapper in the plan reference. It reports actual painted ancestor contrast and refuses unsupported effects; retain project-specific assertions, interaction cases, responsive matrix and independent visual judgment. No `require`, imports or `process` in the browser VM.

Report command wall time, native Agent elapsed time, context bytes and environment/manual waiting separately. A bounded replay measures that workload only; it cannot establish a previous project's total delivery time.
