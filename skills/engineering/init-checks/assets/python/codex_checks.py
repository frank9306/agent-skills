#!/usr/bin/env python3
"""Project-owned Codex check adapter; native Hooks and the public CLI use JSON."""
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time
import uuid
from contextlib import contextmanager

LIMIT = 3500
IGNORED = {".git", "node_modules", ".venv", "venv", "__pycache__", ".cache",
           ".next", "coverage", "dist", "build", "vendor", ".pytest_cache",
           ".mypy_cache", ".ruff_cache"}
EVENTS = {"SessionStart", "UserPromptSubmit", "PostToolUse", "Stop"}


def compact(value):
    text = str(value)
    return text if len(text) <= LIMIT else text[:LIMIT] + "\n[output truncated]"


def git(cwd, *arguments):
    result = subprocess.run(["git", "-C", str(cwd), *arguments],
                            capture_output=True, timeout=15)
    if result.returncode:
        raise RuntimeError("Git root/input discovery failed: " + compact(result.stderr.decode("utf-8", "replace")))
    return result.stdout


def project_root(cwd):
    return Path(os.fsdecode(git(cwd, "rev-parse", "--show-toplevel").rstrip(b"\r\n"))).resolve()


def state_directory(root):
    value = Path(os.fsdecode(git(root, "rev-parse", "--git-path", "codex-checks").rstrip(b"\r\n")))
    return (value if value.is_absolute() else root / value).resolve()


def snapshot(root):
    paths = set(git(root, "ls-files", "-c", "-o", "--exclude-standard", "-z").split(b"\0"))
    # These executable contract inputs remain relevant even if a local ignore hides them.
    paths.update({b".architecture.json", b".codex/checks.json", b"scripts/check_architecture.py"})
    try:
        paths.add(os.fsencode(Path(__file__).resolve().relative_to(root).as_posix()))
    except ValueError:
        pass
    digest = hashlib.sha256()
    for raw in sorted(paths):
        if not raw:
            continue
        relative = os.fsdecode(raw).replace("\\", "/")
        if any(part in IGNORED for part in relative.split("/")):
            continue
        path = root / relative
        digest.update(raw + b"\0")
        if path.is_symlink():
            digest.update(b"symlink\0" + hashlib.sha256(os.fsencode(os.readlink(path))).digest())
        elif path.is_file():
            content = hashlib.sha256()
            with path.open("rb") as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    content.update(block)
            digest.update(b"file\0" + content.digest())
        elif not path.exists():
            digest.update(b"deleted\0")
        else:
            raise RuntimeError(f"Cannot snapshot non-file Git input: {relative}")
    return digest.hexdigest()


@contextmanager
def worktree_lock(directory):
    directory.mkdir(parents=True, exist_ok=True)
    lock = directory / "worktree.lock"
    token = uuid.uuid4().hex
    deadline = time.monotonic() + 2
    while True:
        try:
            descriptor = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            break
        except FileExistsError:
            if time.monotonic() >= deadline:
                raise RuntimeError("Worktree check lock is busy; inspect its owner before manual recovery. Existing locks are never deleted automatically.")
            time.sleep(0.05)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            stream.write(token)
        yield
    finally:
        try:
            if lock.read_text(encoding="utf-8") == token:
                lock.unlink()
        except FileNotFoundError:
            pass


def configuration(root):
    value = json.loads((root / ".codex/checks.json").read_text(encoding="utf-8"))
    if not isinstance(value, dict) or set(value) - {"schemaVersion", "quick", "full", "timeoutSeconds"}:
        raise ValueError("Invalid .codex/checks.json fields")
    if value.get("schemaVersion") != 1:
        raise ValueError("Expected .codex/checks.json schemaVersion 1")
    for name in ("quick", "full"):
        command = value.get(name)
        if not isinstance(command, list) or not command or any(not isinstance(part, str) or not part or "\0" in part for part in command):
            raise ValueError(f"{name} must be a nonempty executable/argument array")
    timeout = value.get("timeoutSeconds", 300)
    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
        raise ValueError("timeoutSeconds must be a finite positive number")
    value["timeoutSeconds"] = timeout
    return value


def resolved_command(command, root):
    executable, *arguments = command
    if executable.lower() in {"python", "python3", "python.exe", "python3.exe"}:
        executable = sys.executable
    if os.path.dirname(executable):
        candidate = Path(executable)
        candidate = candidate if candidate.is_absolute() else root / candidate
        executable = shutil.which(str(candidate))
    else:
        executable = shutil.which(executable)
    if not executable:
        raise RuntimeError(f"Missing check tool: {command[0]}")
    argv = [executable, *arguments]
    if os.name == "nt" and Path(executable).suffix.lower() in {".cmd", ".bat"}:
        if any(any(character in part for character in '\r\n"%!^&|<>') for part in argv):
            raise ValueError("Unsafe character in Windows batch argv; invoke the actual executable/script instead.")
        shell = shutil.which("cmd.exe")
        if not shell:
            raise RuntimeError("Missing Windows cmd.exe launcher")
        # /d disables AutoRun. Every argument is quoted; metacharacters above fail closed.
        inner = " ".join('"' + part + '"' for part in argv)
        return subprocess.list2cmdline([shell]) + ' /d /s /c "' + inner + '"'
    return argv


def health(root):
    config = configuration(root)
    for mode in ("quick", "full"):
        resolved_command(config[mode], root)
    return config


def execute(command, root, timeout):
    options = {"cwd": root, "stdout": subprocess.PIPE, "stderr": subprocess.PIPE,
               "text": True, "encoding": "utf-8", "errors": "replace"}
    if os.name == "nt":
        options["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
    else:
        options["start_new_session"] = True
    process = subprocess.Popen(command, **options)
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        if os.name == "nt":
            try:
                subprocess.run(["taskkill", "/pid", str(process.pid), "/t", "/f"],
                               capture_output=True, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW)
            except (OSError, subprocess.TimeoutExpired):
                process.kill()
        else:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        stdout, stderr = process.communicate()
        return False, "Check timeout after " + str(timeout) + " seconds.\n" + compact(stdout + stderr)
    detail = compact(stdout + ("\n" if stdout and stderr else "") + stderr).strip()
    return process.returncode == 0, f"exit {process.returncode}" + ("\n" + detail if detail else "")


def check(root, mode):
    try:
        config = health(root)
        before = snapshot(root)
        details = []
        success = True
        for current in (["quick", "full"] if mode == "full" else ["quick"]):
            passed, detail = execute(resolved_command(config[current], root), root, config["timeoutSeconds"])
            details.append(current + ": " + detail)
            if not passed:
                success = False
                break
        after = snapshot(root)
        if before != after:
            success = False
            details.append("Worktree inputs changed during checks; run verification again against stable final inputs.")
        return {"ok": success, "mode": mode, "detail": compact("\n".join(details))}
    except Exception as error:
        return {"ok": False, "mode": mode, "detail": compact(error)}


def new_state(current):
    return {"schemaVersion": 1, "baseline": current, "seen": current,
            "dirty": False, "attempts": 0, "chain": uuid.uuid4().hex, "failure": None}


def load_state(path):
    if not path.exists():
        return None
    state = json.loads(path.read_text(encoding="utf-8"))
    if (not isinstance(state, dict) or state.get("schemaVersion") != 1
            or not isinstance(state.get("chain"), str) or not state["chain"]
            or not isinstance(state.get("dirty"), bool)
            or isinstance(state.get("attempts"), bool) or not isinstance(state.get("attempts"), int)
            or state["attempts"] not in range(3)
            or any(not isinstance(state.get(key), str) or len(state[key]) != 64 for key in ("baseline", "seen"))):
        raise ValueError("Invalid session check state; inspect it before recovery.")
    return state


def save_state(path, state):
    temporary = path.with_name(path.name + "." + uuid.uuid4().hex + ".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def native(root, directory, event):
    name = event["hook_event_name"]
    session = event.get("session_id")
    if not isinstance(session, str) or not session:
        raise ValueError("Native Hook input requires session_id")
    path = directory / (hashlib.sha256(session.encode("utf-8")).hexdigest() + ".json")
    current = snapshot(root)
    state = load_state(path)
    marker = "[codex-checks:" + state["chain"] + "]" if state else None
    prompt = event.get("prompt", "")
    continuation = bool(event.get("stop_hook_active")) or (isinstance(prompt, str) and marker is not None and prompt.startswith(marker))
    preserve_session = state is not None and event.get("source") in {"compact", "resume"}
    if name == "SessionStart" and not preserve_session or name == "UserPromptSubmit" and not continuation:
        state = new_state(current)
        save_state(path, state)
        try:
            health(root)
            return {}
        except Exception as error:
            state["failure"] = compact(error)
            save_state(path, state)
            return {"systemMessage": "FAILED: check setup is unavailable. " + compact(error)}
    if state is None:
        state = new_state(current)
        state["failure"] = "Missing session baseline; start a genuine user prompt before claiming native verification."
        save_state(path, state)
        return {"systemMessage": "FAILED: " + state["failure"]}
    if name in {"SessionStart", "UserPromptSubmit"}:
        try:
            health(root)
            return {}
        except Exception as error:
            return {"systemMessage": "FAILED: check setup is unavailable. " + compact(error)}
    changed = current != state["seen"]
    if changed:
        state["dirty"] = True
        state["seen"] = current
    if name == "PostToolUse":
        if not changed:
            return {}
        report = check(root, "quick")
        state["seen"] = snapshot(root)
        state["failure"] = None if report["ok"] else report["detail"]
        save_state(path, state)
        feedback = ("PASSED" if report["ok"] else "FAILED") + ": quick structure check.\n" + report["detail"]
        return {"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": compact(feedback)}}
    if name == "Stop":
        if not state["dirty"]:
            return {}
        report = check(root, "full")
        state["seen"] = snapshot(root)
        state["failure"] = None if report["ok"] else report["detail"]
        if report["ok"]:
            save_state(path, state)
            return {}
        if state["attempts"] < 2:
            state["attempts"] += 1
            save_state(path, state)
            reason = ("[codex-checks:" + state["chain"] + "] FAILED: full delivery check. "
                      "Repair the implementation, then verify again; do not weaken rules, exclusions, exports, or baselines to pass.\n" + report["detail"])
            return {"decision": "block", "reason": compact(reason)}
        save_state(path, state)
        return {"systemMessage": compact("FAILED: unfinished after two automatic repair continuations. Report the failing command and remaining work honestly.\n" + report["detail"])}
    return {}


def main():
    mode = None
    event = None
    try:
        if sys.argv[1:]:
            if len(sys.argv) != 3 or sys.argv[1] != "--run" or sys.argv[2] not in {"quick", "full"}:
                raise ValueError("Usage: codex_checks.py --run quick|full, or one native Hook JSON object on stdin")
            mode = sys.argv[2]
            root = project_root(Path.cwd())
        else:
            event = json.load(sys.stdin)
            if not isinstance(event, dict):
                raise ValueError("Expected a native Hook JSON object")
            if event.get("hook_event_name") not in EVENTS:
                print("{}")
                return 0
            root = project_root(event.get("cwd") or Path.cwd())
        directory = state_directory(root)
        with worktree_lock(directory):
            result = check(root, mode) if mode else native(root, directory, event)
        print(json.dumps(result, ensure_ascii=True))
        return (0 if result["ok"] else 1) if mode else 0
    except Exception as error:
        result = {"ok": False, "mode": mode, "detail": compact(error)} if mode else {"systemMessage": "FAILED: " + compact(error)}
        print(json.dumps(result, ensure_ascii=True))
        return 1 if mode or event is None else 0


if __name__ == "__main__":
    raise SystemExit(main())
