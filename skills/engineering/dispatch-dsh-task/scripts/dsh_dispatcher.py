#!/usr/bin/env python3
"""Forced-command dispatcher for one audited my-knowledge DSH task."""

from __future__ import annotations

import contextlib
import dataclasses
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Iterator

try:
    import fcntl
except ImportError:  # pragma: no cover - Windows unit-test import only
    fcntl = None

ALLOWED_REPOSITORY = "frank9306/my-knowledge"
ALLOWED_SOURCES = {"wechat", "hermes-cron"}
VALID_STATUSES = ("proposed", "ready", "in-progress", "blocked", "done", "cancelled")
STATUS_HEADINGS = {
    "proposed": "Proposed",
    "ready": "Ready",
    "in-progress": "In progress",
    "blocked": "Blocked",
    "done": "Done",
    "cancelled": "Cancelled",
}
HIGH_RISK = re.compile(
    r"(?:\brm\s+-rf\b|\bdelete\b|删除(?:所有|全部|文件|文章)|修改.{0,8}(?:密码|凭据|密钥|token)|(?:密码|凭据|密钥|token).{0,8}(?:修改|替换|轮换))",
    re.IGNORECASE,
)
EXPLICIT_PROHIBITION = re.compile(r"(?:不要|不得|禁止|不允许).{0,12}(?:删除|密码|凭据|密钥|token)", re.IGNORECASE)


@dataclasses.dataclass(frozen=True)
class IssueRecord:
    issue_id: str
    title: str
    path: Path


@dataclasses.dataclass(frozen=True)
class RuntimeConfig:
    root: Path
    workspace: Path
    container_workspace: str
    deploy_key: Path
    container_deploy_key: str
    known_hosts: Path
    container_known_hosts: str
    container: str = "deepseek-harness"
    timeout_seconds: int = 3600

    @classmethod
    def from_env(cls) -> "RuntimeConfig":
        root = Path(os.environ.get("DSH_DISPATCH_ROOT", "/vol2/1000/myprojects/ai-task-dispatcher"))
        return cls(
            root=root,
            workspace=Path(
                os.environ.get(
                    "DSH_WORKSPACE",
                    "/vol2/@appdata/1Panel/1panel/apps/deepseek-harness/deepseek-harness/data/workspace/repos/my-knowledge",
                )
            ),
            container_workspace=os.environ.get(
                "DSH_CONTAINER_WORKSPACE", "/workspace/repos/my-knowledge"
            ),
            deploy_key=Path(os.environ.get("DSH_DEPLOY_KEY", str(root / "secrets/id_ed25519_my_knowledge"))),
            container_deploy_key=os.environ.get(
                "DSH_CONTAINER_DEPLOY_KEY", "/data/dsh/home/.ssh/id_ed25519_my_knowledge"
            ),
            known_hosts=Path(os.environ.get("DSH_KNOWN_HOSTS", str(root / "secrets/known_hosts"))),
            container_known_hosts=os.environ.get(
                "DSH_CONTAINER_KNOWN_HOSTS", "/data/dsh/home/.ssh/known_hosts"
            ),
            timeout_seconds=int(os.environ.get("DSH_TASK_TIMEOUT", "3600")),
        )


def validate_payload(raw: dict[str, Any]) -> dict[str, Any]:
    expected = {"repository", "request", "source", "schedule_id", "requested_at"}
    if set(raw) != expected:
        raise ValueError(f"payload fields must be exactly {sorted(expected)}")
    if raw.get("repository") != ALLOWED_REPOSITORY:
        raise ValueError("repository is not allowlisted")
    request = raw.get("request")
    if not isinstance(request, str) or not request.strip():
        raise ValueError("request must not be blank")
    request = request.strip()
    if len(request) > 12_000:
        raise ValueError("request exceeds 12000 characters")
    if HIGH_RISK.search(request) and not EXPLICIT_PROHIBITION.search(request):
        raise ValueError("high-risk request requires separate explicit approval")
    source = raw.get("source")
    if source not in ALLOWED_SOURCES:
        raise ValueError("source is not allowed")
    schedule_id = raw.get("schedule_id")
    if schedule_id is not None and (not isinstance(schedule_id, str) or not schedule_id.strip()):
        raise ValueError("schedule_id must be null or nonblank text")
    if source == "hermes-cron" and not schedule_id:
        raise ValueError("schedule_id is required for hermes-cron")
    requested_at = raw.get("requested_at")
    if not isinstance(requested_at, str):
        raise ValueError("requested_at must be ISO-8601 text")
    try:
        datetime.fromisoformat(requested_at.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("requested_at must be ISO-8601 text") from exc
    return {
        "repository": ALLOWED_REPOSITORY,
        "request": request,
        "source": source,
        "schedule_id": schedule_id.strip() if schedule_id else None,
        "requested_at": requested_at,
    }


def idempotency_key(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


class StateStore:
    def __init__(self, path: Path):
        self.path = path

    def _load(self) -> dict[str, Any]:
        if not self.path.exists():
            return {}
        return json.loads(self.path.read_text(encoding="utf-8"))

    def get(self, key: str) -> dict[str, Any] | None:
        return self._load().get(key)

    def complete(self, key: str, result: dict[str, Any]) -> None:
        data = self._load()
        data[key] = result
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=self.path.parent, delete=False
        ) as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2, sort_keys=True)
            handle.write("\n")
            temp_path = Path(handle.name)
        os.replace(temp_path, self.path)


@contextlib.contextmanager
def exclusive_lock(path: Path) -> Iterator[None]:
    if fcntl is None:
        raise RuntimeError("dispatcher lock requires Linux fcntl")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a+", encoding="utf-8") as handle:
        try:
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise RuntimeError("dispatcher is busy") from exc
        yield


def _frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}
    result: dict[str, str] = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip().strip('"')
    return result


def reindex_issues(repo: Path) -> None:
    issues_dir = repo / "docs" / "issues"
    groups: dict[str, list[tuple[str, str, str]]] = {status: [] for status in VALID_STATUSES}
    for path in sorted(issues_dir.glob("ISSUE-*.md")):
        meta = _frontmatter(path)
        status = meta.get("status")
        if status not in groups:
            continue
        issue_id = meta.get("id", path.name.split("-", 2)[0])
        title = meta.get("title") or issue_id
        groups[status].append((issue_id, title, path.name))
    lines = ["# Issues", "", "This index is generated from local Issue files.", ""]
    for status in VALID_STATUSES:
        lines.extend([f"## {STATUS_HEADINGS[status]}", ""])
        if groups[status]:
            lines.extend(["| ID | Title |", "|---|---|"])
            for issue_id, title, filename in groups[status]:
                lines.append(f"| [{issue_id}]({filename}) | {title} |")
        else:
            lines.append("None.")
        lines.append("")
    (issues_dir / "README.md").write_text("\n".join(lines), encoding="utf-8", newline="\n")


def _slug(_: str) -> str:
    return "task-loop"


def create_issue(repo: Path, payload: dict[str, Any], run_id: str) -> IssueRecord:
    issues_dir = repo / "docs" / "issues"
    numbers = [
        int(match.group(1))
        for path in issues_dir.glob("ISSUE-*.md")
        if (match := re.match(r"ISSUE-(\d+)-", path.name))
    ]
    number = max(numbers, default=0) + 1
    issue_id = f"ISSUE-{number:04d}"
    title = payload["request"].splitlines()[0].strip()[:100]
    path = issues_dir / f"{issue_id}-{_slug(title)}.md"
    created = payload["requested_at"][:10]
    schedule = payload.get("schedule_id") or "none"
    content = f'''---
id: {issue_id}
title: "{title.replace('"', "'")}"
status: ready
priority: medium
created: {created}
updated: {created}
closed:
sources: ["{payload['source']}"]
related_adrs: []
depends_on: []
---

# {issue_id}: {title}

## Problem

Hermes received the following owner request and dispatched it as run `{run_id}`:

> {payload['request'].replace(chr(10), chr(10) + '> ')}

## Desired outcome

Implement the owner's request in this repository while preserving project instructions and existing behavior outside the requested scope.

## Acceptance criteria

- [ ] The requested repository change is implemented within the stated scope.
- [ ] `pnpm docs:build` passes.
- [ ] Verification evidence and the resulting commit are recorded below.

## Out of scope

- Destructive operations, credential changes, dependency major upgrades, and changes outside this repository.

## Decisions

- Source: `{payload['source']}`
- Schedule ID: `{schedule}`
- Run ID: `{run_id}`

## Implementation notes

No implementation has started.

## Verification

Not verified.

## Activity log

### {created} — Created by Hermes dispatcher

Request received at `{payload['requested_at']}`.

## Completion summary

Not completed.
'''
    path.write_text(content, encoding="utf-8", newline="\n")
    reindex_issues(repo)
    return IssueRecord(issue_id=issue_id, title=title, path=path)


def transition_issue(repo: Path, issue_path: Path, status: str) -> None:
    if status not in VALID_STATUSES:
        raise ValueError(f"invalid status: {status}")
    text = issue_path.read_text(encoding="utf-8")
    updated, count = re.subn(r"(?m)^status:\s*[^\n]+$", f"status: {status}", text, count=1)
    if count != 1:
        raise ValueError("Issue has no status field")
    today = datetime.now().astimezone().date().isoformat()
    updated = re.sub(r"(?m)^updated:\s*[^\n]+$", f"updated: {today}", updated, count=1)
    issue_path.write_text(updated, encoding="utf-8", newline="\n")
    reindex_issues(repo)


def _run(
    command: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    timeout: int = 300,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )
    if check and completed.returncode != 0:
        detail = (completed.stderr or completed.stdout).strip()[-2000:]
        raise RuntimeError(f"command failed ({command[0]}): {detail}")
    return completed


def _git_env(config: RuntimeConfig) -> dict[str, str]:
    env = os.environ.copy()
    env["GIT_SSH_COMMAND"] = (
        f"ssh -i {config.deploy_key} -p 443 -o Hostname=ssh.github.com "
        f"-o HostKeyAlias=github.com -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes "
        f"-o UserKnownHostsFile={config.known_hosts}"
    )
    return env


def sync_repository(config: RuntimeConfig) -> None:
    config.workspace.parent.mkdir(parents=True, exist_ok=True)
    env = _git_env(config)
    if not (config.workspace / ".git").exists():
        _run(
            ["git", "clone", "git@github.com:frank9306/my-knowledge.git", str(config.workspace)],
            env=env,
            timeout=300,
        )
    status = _run(["git", "status", "--porcelain"], cwd=config.workspace, env=env).stdout
    if status.strip():
        raise RuntimeError("workspace is not clean")
    _run(["git", "fetch", "origin", "main"], cwd=config.workspace, env=env)
    _run(["git", "merge", "--ff-only", "origin/main"], cwd=config.workspace, env=env)
    _run(["git", "config", "user.name", "Hermes DSH Dispatcher"], cwd=config.workspace, env=env)
    _run(["git", "config", "user.email", "dsh-dispatcher@webfrank.top"], cwd=config.workspace, env=env)


def commit_and_push(config: RuntimeConfig, message: str, paths: list[str]) -> str:
    env = _git_env(config)
    _run(["git", "add", "--", *paths], cwd=config.workspace, env=env)
    _run(["git", "commit", "-m", message], cwd=config.workspace, env=env)
    _run(["git", "push", "origin", "main"], cwd=config.workspace, env=env, timeout=300)
    return _run(["git", "rev-parse", "HEAD"], cwd=config.workspace, env=env).stdout.strip()


def run_dsh(config: RuntimeConfig, issue: IssueRecord, run_dir: Path) -> None:
    prompt = f"""Implement {issue.issue_id} in the current repository.
Read AGENTS.md, docs/agents/workflow.md, docs/context/CONTEXT.md, relevant ADRs, BRAIN.md, and {issue.path.relative_to(config.workspace).as_posix()} before acting.
Work only on this Issue. Do not delete files, change credentials, upgrade major dependencies, create branches, force push, or modify unrelated content.
Run pnpm install --frozen-lockfile if dependencies are absent, then run pnpm docs:build.
If verification passes, complete every acceptance checkbox, record concrete verification, set the Issue to done, update docs/issues/README.md and the current monthly changelog, commit all intended changes with a message referencing {issue.issue_id}, and push main.
If blocked or verification fails, do not push implementation changes; explain the blocker in the final answer.
"""
    git_ssh = (
        f"ssh -i {config.container_deploy_key} -p 443 -o Hostname=ssh.github.com "
        f"-o HostKeyAlias=github.com -o IdentitiesOnly=yes "
        f"-o StrictHostKeyChecking=yes -o UserKnownHostsFile={config.container_known_hosts}"
    )
    command = [
        "sudo",
        "docker",
        "exec",
        "-e",
        f"GIT_SSH_COMMAND={git_ssh}",
        "-e",
        "HOME=/data/dsh/home",
        "-e",
        "DSH_HOME=/data/dsh",
        "-e",
        "PATH=/data/dsh/home/tools/brain-md/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        "-w",
        config.container_workspace,
        config.container,
        "node",
        "--expose-internals",
        "/usr/local/lib/node_modules/@deepseek-ai/dsh/lib/bin.js",
        "--profile",
        "headless",
        prompt,
    ]
    completed = _run(command, timeout=config.timeout_seconds, check=False)
    (run_dir / "dsh.stdout.log").write_text(completed.stdout, encoding="utf-8")
    (run_dir / "dsh.stderr.log").write_text(completed.stderr, encoding="utf-8")
    if completed.returncode != 0:
        raise RuntimeError(f"DSH exited with code {completed.returncode}")


def verify_result(config: RuntimeConfig, issue: IssueRecord, run_dir: Path) -> str:
    install = [
        "sudo", "docker", "exec", "-e", "HOME=/data/dsh/home",
        "-w", config.container_workspace, config.container,
    ]
    if not (config.workspace / "node_modules").exists():
        result = _run(install + ["pnpm", "install", "--frozen-lockfile"], timeout=900, check=False)
        (run_dir / "pnpm-install.log").write_text(result.stdout + result.stderr, encoding="utf-8")
        if result.returncode != 0:
            raise RuntimeError("pnpm install verification failed")
    result = _run(install + ["pnpm", "docs:build"], timeout=1200, check=False)
    (run_dir / "docs-build.log").write_text(result.stdout + result.stderr, encoding="utf-8")
    if result.returncode != 0:
        raise RuntimeError("pnpm docs:build verification failed")
    status = _run(["git", "status", "--porcelain"], cwd=config.workspace, env=_git_env(config)).stdout
    if status.strip():
        raise RuntimeError("DSH left uncommitted changes")
    meta = _frontmatter(issue.path)
    if meta.get("status") != "done":
        raise RuntimeError("DSH did not mark the Issue done")
    local = _run(["git", "rev-parse", "HEAD"], cwd=config.workspace, env=_git_env(config)).stdout.strip()
    _run(["git", "fetch", "origin", "main"], cwd=config.workspace, env=_git_env(config))
    remote = _run(["git", "rev-parse", "origin/main"], cwd=config.workspace, env=_git_env(config)).stdout.strip()
    if local != remote:
        raise RuntimeError("verified commit is not present on origin/main")
    return local


def workflow_status(commit: str, timeout_seconds: int = 600) -> str:
    import urllib.request

    url = (
        "https://api.github.com/repos/frank9306/my-knowledge/actions/runs"
        f"?head_sha={commit}&event=push&per_page=10"
    )
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        request = urllib.request.Request(url, headers={"User-Agent": "feiniu-dsh-dispatcher"})
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                data = json.load(response)
            runs = data.get("workflow_runs", [])
            if runs:
                conclusion = runs[0].get("conclusion")
                if conclusion:
                    return conclusion
        except Exception:
            pass
        time.sleep(15)
    return "pending"


def execute(payload: dict[str, Any], config: RuntimeConfig) -> dict[str, Any]:
    key = idempotency_key(payload)
    state = StateStore(config.root / "state/requests.json")
    prior = state.get(key)
    if prior:
        return {**prior, "idempotent_replay": True}
    run_id = f"{datetime.now().astimezone():%Y%m%d-%H%M%S}-{key[:8]}"
    run_dir = config.root / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    (run_dir / "request.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    started = time.monotonic()
    issue: IssueRecord | None = None
    try:
        sync_repository(config)
        issue = create_issue(config.workspace, payload, run_id)
        task_commit = commit_and_push(
            config,
            f"task: create {issue.issue_id}",
            [str(issue.path.relative_to(config.workspace)), "docs/issues/README.md"],
        )
        transition_issue(config.workspace, issue.path, "in-progress")
        claim_commit = commit_and_push(
            config,
            f"chore: claim {issue.issue_id} [{run_id}]",
            [str(issue.path.relative_to(config.workspace)), "docs/issues/README.md"],
        )
        run_dsh(config, issue, run_dir)
        final_commit = verify_result(config, issue, run_dir)
        result = {
            "status": "done",
            "run_id": run_id,
            "issue": issue.issue_id,
            "issue_url": f"https://github.com/frank9306/my-knowledge/blob/main/docs/issues/{issue.path.name}",
            "task_commit": task_commit,
            "claim_commit": claim_commit,
            "commit": final_commit,
            "commit_url": f"https://github.com/frank9306/my-knowledge/commit/{final_commit}",
            "verification": "pnpm docs:build passed",
            "deployment": workflow_status(final_commit),
            "site_url": "https://knowledge.webfrank.top/",
            "duration_seconds": round(time.monotonic() - started, 2),
        }
    except Exception as exc:
        message = str(exc).replace(str(config.deploy_key), "<deploy-key>")[-1500:]
        result = {
            "status": "blocked",
            "run_id": run_id,
            "issue": issue.issue_id if issue else None,
            "message": message,
            "duration_seconds": round(time.monotonic() - started, 2),
        }
    (run_dir / "result.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    state.complete(key, result)
    return result


def main() -> int:
    try:
        raw_text = sys.stdin.read(128_001)
        if len(raw_text) > 128_000:
            raise ValueError("payload is too large")
        raw = json.loads(raw_text)
        if not isinstance(raw, dict):
            raise ValueError("payload must be a JSON object")
        payload = validate_payload(raw)
        config = RuntimeConfig.from_env()
        with exclusive_lock(config.root / "state/dispatcher.lock"):
            result = execute(payload, config)
        print(json.dumps(result, ensure_ascii=False))
        return 0 if result.get("status") == "done" else 2
    except RuntimeError as exc:
        status = "busy" if str(exc) == "dispatcher is busy" else "blocked"
        print(json.dumps({"status": status, "message": str(exc)}, ensure_ascii=False))
        return 3
    except (ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "rejected", "message": str(exc)}, ensure_ascii=False))
        return 4


if __name__ == "__main__":
    sys.exit(main())
