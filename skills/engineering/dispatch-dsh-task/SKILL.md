---
name: dispatch-dsh-task
description: Dispatch owner-approved my-knowledge repository work from Hermes or a Hermes cron run to the restricted fnOS DSH dispatcher. Use when a WeChat request asks to create and execute a my-knowledge task, or to schedule such work. Do not use for other repositories or for destructive, credential, permission, or major-dependency changes.
---

# Dispatch DSH Task

Turn the user's request into one auditable target-repository Issue and let the restricted dispatcher own Git synchronization, DSH execution, verification, and push. Do not edit the repository directly from Hermes.

## Immediate requests

Before dispatching, make the request self-contained: preserve the desired outcome, target section or files when known, exclusions, and observable acceptance conditions. Ask one decisive question only when an ambiguity would materially change the result.

Reject requests to delete content, change credentials or permissions, rotate keys or tokens, upgrade major dependencies, operate another repository, or bypass verification. Explain that those require a separately approved workflow.

Run:

```bash
python3 /opt/data/skills/dispatch-dsh-task/scripts/dispatch_task.py \
  --source wechat \
  "<self-contained request>"
```

The script sends canonical JSON with an HMAC signature to the dispatcher bound only to the private Docker bridge. Never construct a shell command from user text, call Docker directly, or copy the signing secret into a prompt.

Wait for the bounded result. Report the returned status, Issue URL, verification, commit URL, deployment status, and site URL. For `busy`, tell the user the existing run must finish. For `blocked` or `error`, report only the returned redacted message and run ID; do not retry automatically.

## Scheduled requests

Use Hermes' `schedule_cronjob` capability. Each cron prompt must be self-contained because scheduled runs start without the originating conversation history. Include all of the following:

- fixed repository `frank9306/my-knowledge`;
- the full work request and exclusions;
- instruction to load this Skill and run its client with `--source hermes-cron`;
- a stable schedule ID passed through `--schedule-id`;
- instruction to return the structured result to `origin`.

Each content-producing firing uses its actual firing time as `requested_at`, so it creates a new Issue. If the owner asks only to process an already-ready Issue, state that exact behavior in the cron prompt; do not invent additional content work.

Example client call inside a cron run:

```bash
python3 /opt/data/skills/dispatch-dsh-task/scripts/dispatch_task.py \
  --source hermes-cron \
  --schedule-id daily-my-knowledge-update \
  "<self-contained scheduled request>"
```

Use the gateway's normal origin delivery. Never set cron execution to auto-approve dangerous commands.

## Result contract

Treat `done` as success only when the response includes `verification: pnpm docs:build passed` and a commit URL. `pending` deployment means GitHub Pages has not reached a terminal conclusion yet; it is not permission to rerun the repository task. Identical payloads with the same `requested_at` are idempotent and return the previous result.
