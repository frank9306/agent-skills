# Supported Codex trace data

The collector reads only:

- `<CODEX_HOME>/sessions/**/*.jsonl`
- `<CODEX_HOME>/archived_sessions/**/*.jsonl`
- `<CODEX_HOME>/state_5.sqlite`, table `threads`

It expects `session_meta.payload.cwd`, `event_msg` token-count records with `info.last_token_usage`, response-item tool calls and outputs, and optional turn context. SQLite is opened read-only and supplies rollout path, project/worktree identity, branch, model, effort, and agent role when columns exist.

Current checkout membership requires an exact/descendant canonical `cwd`. Parent directories never match. Other worktrees require the same non-empty `project_id`, or the same normalized Git origin when project ID is unavailable. When SQLite is absent or incompatible, the collector deliberately falls back to path-only matching.

Active sessions are discovered before archived sessions. Duplicate session identities keep the active copy. Malformed lines are skipped and reported without including their contents.

When Codex changes its internal format, add a synthetic fixture for the new record shape before changing the parser. Do not silently guess fields or present unverified totals.
