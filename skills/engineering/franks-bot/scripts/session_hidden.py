"""Own a hidden test desktop and retain failed runs for explicit cleanup."""
import json
import os
from pathlib import Path
from queue import Empty, Queue
import subprocess
import sys
from threading import Thread
import time
import uuid

from session_targets import DesktopTarget, ObservationUnavailable, POWERSHELL, SCRIPTS


HIDDEN_ACTIONS = frozenset({"click", "type", "toggle", "assert"})


def validate(case):
    spec = case["target"]
    for step in case["steps"]:
        action = step.get("action")
        if not isinstance(action, str) or action not in HIDDEN_ACTIONS:
            raise ValueError(f"Hidden step {step['id']!r} does not support action {action!r}")
    program = Path(spec.get("executable", ""))
    if not program.is_absolute() or not program.is_file() or program.suffix.lower() != ".exe":
        raise ValueError("windows-hidden requires an existing absolute executable path")
    args = spec.get("args", [])
    if not isinstance(args, list) or not all(isinstance(arg, str) and "\0" not in arg for arg in args):
        raise ValueError("windows-hidden args must be an array of strings")
    if os.name != "nt":
        raise ValueError("windows-hidden requires Windows")


def write_json(path, value):
    temp = path.with_name(f"{path.name}.{uuid.uuid4().hex}.tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)


def read_status(output):
    value = json.loads((output / "hidden-status.json").read_text(encoding="utf-8"))
    if value.get("taskId") != str(output.resolve()):
        raise ValueError("Hidden task status does not belong to this output directory")
    return value


def run_hidden(case, output):
    output = output.resolve()
    cancel = output / "hidden-cancel"
    command = [sys.executable, str(SCRIPTS / "session.py"), "--hidden-worker",
               "--output", str(output)]
    with (output / "hidden-worker.log").open("xb") as log:
        worker = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=log, stderr=log,
                                  creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP)
    with worker.stdin:
        worker.stdin.write(json.dumps(case).encode("ascii"))
    try:
        while worker.poll() is None:
            if (output / "hidden-status.json").is_file():
                state = read_status(output)
                if state["phase"] in ("passed", "retained", "skipped", "failed"):
                    return report(state)
            time.sleep(0.1)
    except KeyboardInterrupt:
        cancel.touch()
        deadline = time.monotonic() + 15
        while worker.poll() is None and time.monotonic() < deadline:
            if (output / "hidden-status.json").is_file():
                state = read_status(output)
                if state["phase"] == "retained":
                    return report(state)
            time.sleep(0.1)
        return 130
    if (output / "hidden-status.json").is_file():
        state = read_status(output)
        if state["phase"] in ("passed", "retained", "skipped", "failed"):
            return report(state)
    print("Hidden worker exited without a result. See hidden-worker.log.", file=sys.stderr)
    return 1


def report(state):
    print(json.dumps(state, ensure_ascii=True), flush=True)
    return {"passed": 0, "closed": 0, "skipped": 3}.get(state["phase"], 1)


def cancel_run(output):
    current = read_status(output)
    if current["phase"] != "running":
        raise ValueError("Only a running hidden task can be cancelled")
    (output / "hidden-cancel").touch()
    print(json.dumps({"taskId": current["taskId"], "cancelRequested": True}, ensure_ascii=True))
    return 0


def request_close(output):
    current = read_status(output)
    if current["phase"] == "closed":
        return report(current)
    if current["phase"] != "retained":
        raise ValueError("Only retained hidden tasks can be closed")
    request = output / "hidden-close.request"
    request.touch(exist_ok=False)
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        state = read_status(output)
        if state.get("closeAttempt", 0) > current.get("closeAttempt", 0):
            return report(state)
        time.sleep(0.1)
    raise TimeoutError("Hidden worker did not acknowledge cleanup; check its status and log")


class HiddenTarget(DesktopTarget):
    def __init__(self, spec, output):
        self.events = output / "feedback.jsonl"
        self.cancel = output / "hidden-cancel"
        self.process = subprocess.Popen(
            [str(POWERSHELL), "-NoProfile", "-STA", "-File", str(SCRIPTS / "hidden-launcher.ps1")],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, encoding="utf-8",
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        self.responses = Queue()
        self.pending = False
        self.cancel_enabled = True
        self.worker_reader = Thread(target=self.read_responses, daemon=True)
        self.worker_reader.start()
        self.spec = spec
        self.main = None
        self.preview = None

    def read_responses(self):
        for line in self.process.stdout:
            self.responses.put(line)
        self.responses.put(None)

    def check_cancelled(self):
        if self.cancel_enabled and self.cancel.exists():
            self.cancel_enabled = False
            raise KeyboardInterrupt()

    def call(self, action, bind=True, **values):
        self.check_cancelled()
        if self.pending:
            self.receive()
        self.check_cancelled()
        params = dict(values, Action=action)
        if bind:
            params.update(WindowId=self.spec["windowId"], ProcessId=self.spec["processId"])
        self.process.stdin.write(json.dumps({"params": params}) + "\n")
        self.process.stdin.flush()
        self.pending = True
        message = json.loads(self.receive())
        if not message["ok"]:
            if message.get("retryable"):
                raise ObservationUnavailable(message["error"])
            raise RuntimeError(message["error"])
        return json.loads(message["json"])

    def receive(self):
        try:
            line = self.responses.get(timeout=5)
        except Empty as exc:
            raise TimeoutError("Hidden window operation timed out") from exc
        self.pending = False
        if line is None:
            raise RuntimeError("Hidden desktop bridge disconnected")
        return line

    def feedback(self, phase, message):
        self.write_feedback(phase=phase, message=message)

    def start(self):
        program = str(Path(self.spec["executable"]).resolve())
        result = self.call("hidden-launch", bind=False, Executable=program,
                           CommandLine=subprocess.list2cmdline([program, *self.spec.get("args", [])]),
                           SingleInstance=self.spec.get("singleInstance", Path(program).stem.lower() == "koi"))
        if result.get("skipped"):
            return result
        self.main = self.find_window(self.spec.get("title"), main=True)
        self.spec = dict(self.spec, **self.binding(self.main))
        return result

    def windows(self):
        return self.call("hidden-list", bind=False)["windows"]

    def find_window(self, title, *, main=False):
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline:
            windows = self.windows()
            if main:
                matches = [w for w in windows if w["visible"] and not w["ownerId"]
                           and w["title"] and (title is None or w["title"] == title)]
            else:
                parent_ids = {self.main["windowId"]}
                for _ in windows:
                    parent_ids.update(w["windowId"] for w in windows if w["ownerId"] in parent_ids)
                matches = [w for w in windows if w["visible"] and w["ownerId"] in parent_ids
                           and w["title"] == title]
            if len(matches) == 1:
                return matches[0]
            if len(matches) > 1:
                raise ValueError("More than one owned window matched the exact title")
            if self.call("hidden-exited", bind=False)["exited"]:
                raise RuntimeError("Test application exited before its window appeared")
            time.sleep(0.1)
        raise TimeoutError(f"Expected hidden window did not appear: {title!r}")

    @staticmethod
    def binding(window):
        return {key: window[key] for key in ("windowId", "processId")}

    def select_window(self, title):
        window = self.find_window(title) if title else self.main
        self.spec.update(self.binding(window))

    def locate(self, step):
        self.select_window(step.get("windowTitle"))
        action = step["action"]
        if action == "assert":
            return {"by": "assertion"}
        if action not in HIDDEN_ACTIONS:
            raise ValueError(f"Unsupported hidden desktop action: {action}")
        selector = step.get("target", {})
        if not (selector.get("name") or selector.get("controlId") or selector.get("kind")):
            return None
        observed = self.call("observe", ControlsOnly=True)["controls"]
        choices = [c for c in self.match(observed, selector) if c["enabled"]]
        if len(choices) != 1:
            return None
        control = choices[0]
        if action == "type" and control.get("nativeEditId"):
            return {"action": "type", "by": "native Edit", "NativeEditId": control["nativeEditId"]}
        if action == "click" and control["invokable"]:
            action = "invoke"
        if action == "click" and control.get("nativeButtonId"):
            return {"action": "invoke", "by": "native push button", "NativeButtonId": control["nativeButtonId"]}
        if action == "click" and not control["bounds"]:
            return None
        locator = {}
        if control["id"]:
            locator["ControlId"] = control["id"]
        elif control["name"]:
            locator["ControlName"] = control["name"]
        technique = "targeted window message" if action == "click" else "UIA"
        return dict(locator, by=technique, action=action, ControlType=control["controlType"].split(".")[-1])

    def perform(self, step, location):
        if step["action"] != "assert":
            if self.preview:
                self.preview.action(self, step, location)
            super().perform(step, location)
            if self.preview:
                time.sleep(.65)

    def check(self, condition):
        if "visibleWindow" in condition:
            visible = any(w["windowId"] == self.spec["windowId"] and w["visible"] for w in self.windows())
            return visible == condition["visibleWindow"]
        return super().check(condition)

    def screenshot(self, path):
        self.snapshot(path)

    def snapshot(self, path):
        from PIL import Image

        observation = path.with_suffix(".json")
        frame = self.call("observe", Screenshot=str(path), Observation=str(observation))
        with Image.open(path) as image:
            extremes = image.convert("RGB").getextrema()
            if all(low == high for low, high in extremes):
                raise RuntimeError("Hidden capture returned a uniform frame")
        return {"Observation": str(observation), "viewport": {
            "window": frame["windowId"], "process": frame["processId"], "dpi": frame["dpi"],
            "bounds": frame["bounds"], "width": frame["imageWidth"], "height": frame["imageHeight"],
        }}

    def close_application(self):
        self.cancel_enabled = False
        if self.call("hidden-exited", bind=False)["exited"]:
            return
        self.call("hidden-close", bind=False)
        deadline = time.monotonic() + 5
        while time.monotonic() < deadline:
            if self.call("hidden-exited", bind=False)["exited"]:
                return
            time.sleep(0.1)
        raise TimeoutError("The owned application did not exit after WM_CLOSE")

    def close(self):
        try:
            self.process.stdin.close()
        except BrokenPipeError:
            pass
        code = self.process.wait(timeout=5)
        self.worker_reader.join(timeout=1)
        self.process.stdout.close()
        if code != 0 and self.main is not None:
            raise RuntimeError(f"Hidden desktop launcher exited with code {code}")


def worker(case, output, run_case):
    status_path = output / "hidden-status.json"
    state = {"taskId": str(output.resolve()), "phase": "running", "closeAttempt": 0,
             "actions": "actions.jsonl", "workerLog": "hidden-worker.log"}

    def status(phase, **fields):
        state.update(phase=phase, **fields)
        write_json(status_path, state)

    status("running")
    try:
        validate(case)
        target = HiddenTarget(case["target"], output)
    except (OSError, ValueError) as exc:
        status("failed", reason=str(exc))
        return 1
    launched = False
    try:
        try:
            launched = True
            result = target.start()
            if result.get("skipped"):
                target.close()
                status("skipped", reason=result["reason"])
                return 3
            status("running", processId=result["processId"])
            preview = None
            try:
                if "preview" in case:
                    from session_preview import HiddenPreview
                    preview = HiddenPreview(case["preview"], output, write_json)
                    preview.start(result["desktopName"], target.main)
                    target.preview = preview
                passed = run_case(case, target, output, finalize=False)
                if preview:
                    video = preview.finish("测试步骤已通过" if passed else "测试步骤失败")
                    state["recording"] = video
            finally:
                if preview:
                    preview.close(keep_player="recording" in state)
            if passed:
                target.check_cancelled()
                target.close_application()
                target.close()
                target.feedback("success", "测试应用已关闭，隐藏桌面已释放")
                status("passed", desktopReleased=True)
                return 0
            raise RuntimeError("Test did not pass. See actions.jsonl.")
        except (Exception, KeyboardInterrupt) as exc:
            target.cancel_enabled = False
            reason = str(exc) or "Test cancelled"
            try:
                retained = launched and not target.call("hidden-exited", bind=False)["exited"]
            except Exception:
                retained = launched and target.process.poll() is None and not isinstance(exc, (BrokenPipeError, OSError))
            if not retained:
                try:
                    target.close()
                except (OSError, RuntimeError, subprocess.TimeoutExpired) as close_error:
                    status("failed", reason=reason, cleanupError=str(close_error))
                else:
                    status("failed", reason=reason, desktopReleased=True)
                return 1
            status("retained", reason=reason, evidence=sorted(p.name for p in output.glob("*.png")))

        request = output / "hidden-close.request"
        while target.process.poll() is None:
            if request.is_file():
                request.unlink()
                try:
                    target.close_application()
                    target.close()
                    status("closed", closeAttempt=state["closeAttempt"] + 1, desktopReleased=True)
                    return 0
                except Exception as exc:
                    status("retained", closeAttempt=state["closeAttempt"] + 1, cleanupError=str(exc))
            time.sleep(0.25)
        status("failed", reason="Hidden desktop bridge disconnected during retention")
        return 1
    finally:
        if target.process.poll() is not None and not target.process.stdin.closed:
            target.close()
