---
name: dev-preview
description: Start and retain authorized project dev services, inspect readiness and logs, and hand over a verified private acceptance URL. Use for development previews and acceptance testing in a configured Linux runtime; production deployment and Tailscale administration remain separate.
---

# Managed dev preview

Read the project's AGENTS, active Issue, package scripts and approved execution contract. Use the project's actual startup and test commands. Fixed-lock dependency setup, authorized dev startup and recovery within the existing contract do not need repeated owner approval.

The Fubufu deployment installs the manager at `/paperclip/runtime/dev-preview/bin/preview.py`. It owns detached process groups, persistent registrations, logs, health and two automatic recoveries; the WSL service restores registered dev services when the container returns. Use the CLI rather than a foreground terminal, `nohup`, arbitrary port forwarders, or broad process termination. For a standalone Linux installation these same scripts require administrator-provided state/config and a periodic reconciler; the skill alone does not install hosting.

Start an authorized project using argv (substitute its real scripts, directory, port and final input identity):

```sh
python3 /paperclip/runtime/dev-preview/bin/preview.py start \
  --project project-alias --cwd /authorized/project --port 17450 \
  --revision final-input-digest --ready-timeout 45 \
  -- pnpm run dev --host 0.0.0.0 --port 17450 --strictPort
python3 /paperclip/runtime/dev-preview/bin/preview.py status --project project-alias
python3 /paperclip/runtime/dev-preview/bin/preview.py list
```

Choose the real framework's arguments; the example is for a compatible Vite script. Service must listen on `0.0.0.0`, use its assigned port without fallback, and have an HTTP200 health path (`--health-path /path` if needed). NODE_ENV=development and PORT are supplied. Do not insert credentials into argv or the registration. Read the returned private `log_path` for diagnosis. Same registration reuses the service; changed command/port/revision fails rather than replacing an owner's running preview. Coordinate explicit stop/replacement through the current task and retain previous evidence. Five preview slots are currently provisioned in Fubufu; exhaustion is an infrastructure blocker, not permission to publish an arbitrary port.

`status=ready` and `reachable=true` prove HTTP readiness only. Before handover:

- Run required project checks against frozen final inputs. Independent QA uses the current container `local_url` with the authorized browser, records actual user flows, console/page errors and failed requests, and captures relevant evidence. Changed inputs invalidate affected checks.
- Inspect the returned `preview_url` from Windows, checking page identity and assets. Verify that the Tailscale Serve route exists and that no Funnel route was introduced. Record the actual network path tested; local access is not a second-device result. If no Windows channel is available to the role, hand this check to chief through the original task.
- Report the final revision, checks, independent QA evidence, known gaps, exact clickable preview URL, responsible project/task, and retention policy. Failed or missing tests must not be presented as passed. A URL alone is not acceptance.

Keep the preview running while the owner reviews it, including after Agent runs and engineering task completion. No default expiry. Stop only on owner stop/replacement instruction or an explicitly recorded expiry; never infer stop from task done. Budget exhaustion leaves the registration failed and requires diagnosis; changing aliases or re-registering to reset retry counts is forbidden. Recovery does not renew acceptance evidence after source changes. Existing role authorization and source write ownership remain in force.

Stop the specific owned project when authorized:

```sh
python3 /paperclip/runtime/dev-preview/bin/preview.py stop --project project-alias
```

Tailscale names, raw logs, project absolute paths and local state stay in the private runtime. Do not copy them into public repositories. The gateway exposes only provisioned Tailnet routes via loopback; do not enable Funnel, change Tailnet ACLs or broaden host permissions.
