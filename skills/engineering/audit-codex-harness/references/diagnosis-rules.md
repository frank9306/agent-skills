# Diagnosis rules

Use collector findings as leads and inspect only the project-owned harness surface needed to explain them.

| Finding | Plausible harness causes | Candidate experiment |
|---|---|---|
| `context_growth` / `large_context` | Broad file reads, generated artifacts, oversized instructions, unrelated work in one session | Exclude generated paths, load summaries first, split unrelated tasks |
| `low_cache_reuse` | Rebuilt prefixes, many fresh sessions, frequently changing system context | Stabilize shared context and compare repeated identical tasks |
| `tool_failures` | Invalid schemas, platform-specific commands, missing preconditions | Improve tool descriptions and validate inputs before calls |
| `repeated_calls` | Weak state tracking, polling, ignored errors | Preserve prior results or add bounded retry/poll policy |
| `long_trajectories` | Poor planning, unclear completion condition, repeated exploration | Add explicit acceptance checks and compare successful-task turns |
| `heavy_delegation` | Unnecessary fan-out or duplicated context | Compare one-agent and delegated runs on the same tasks |
| `reasoning_overhead` | Excessive effort for task class or unclear instructions | Hold model fixed and A/B the reasoning setting |
| `missing_final_answers` / `interruptions` | Timeout, context exhaustion, user cancellation, harness crash | Separate cancellations from failures before changing the harness |

High cached input is not itself waste: a necessary stable prefix can be cheaper when cached. Identical calls can be legitimate polling. High reasoning can be appropriate for hard tasks. Describe these caveats when relevant.
