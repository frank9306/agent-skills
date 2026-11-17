import json
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import urlsplit

from session_visual import VisualSearch

SCRIPTS = Path(__file__).resolve().parent
POWERSHELL = Path(os.environ.get("SystemRoot", "C:/Windows")) / "System32/WindowsPowerShell/v1.0/powershell.exe"


class ObservationUnavailable(RuntimeError):
    """UIA is replacing the observed tree; the assertion is not yet known."""


class DesktopTarget(VisualSearch):
    def __init__(self, spec, output):
        self.spec = spec
        self.no_feedback = bool(spec.get("noFeedback"))
        self.finished = False
        self.events = output / "feedback.jsonl"
        self.overlay = None
        self.process = subprocess.Popen([str(POWERSHELL), "-NoProfile", "-File", str(SCRIPTS / "session-bridge.ps1")],
                                        stdin=subprocess.PIPE, stdout=subprocess.PIPE, encoding="utf-8",
                                        creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            self.bind_window(spec)
            if not self.no_feedback:
                evidence = output / "overlay"
                evidence.mkdir()
                ready = evidence / "ready"
                self.feedback("observe", "目标已绑定")
                self.overlay = subprocess.Popen(
                    [str(POWERSHELL), "-NoProfile", "-STA", "-File", str(SCRIPTS / "feedback.ps1"),
                     "-Events", str(self.events), "-WindowId", str(spec["windowId"]),
                     "-OwnerId", str(spec["processId"]), "-TaskOwnerId", str(os.getpid()),
                     "-EvidenceDirectory", str(evidence), "-ReadyFile", str(ready)],
                    creationflags=subprocess.CREATE_NO_WINDOW,
                )
                deadline = time.monotonic() + 8
                while not ready.is_file():
                    if self.overlay.poll() is not None or time.monotonic() >= deadline:
                        raise RuntimeError("The desktop feedback overlay did not become visible")
                    time.sleep(.05)
        except Exception:
            self.close()
            raise

    def bind_window(self, spec):
        windows = self.call("list", bind=False)
        wanted = Path(spec["executable"]).resolve()
        bound = [item for item in windows if item["windowId"] == spec["windowId"]
                 and item["processId"] == spec["processId"] and item["executable"]
                 and Path(item["executable"]).resolve() == wanted]
        if len(bound) != 1:
            raise ValueError("The window, PID and executable did not match")
        self.spec = dict(spec, kind="windows")
        if self.overlay:
            self.write_feedback(phase="bind", windowId=spec["windowId"], processId=spec["processId"])

    def call(self, action, bind=True, **values):
        if self.overlay and not self.finished and self.overlay.poll() is not None:
            raise RuntimeError("The desktop feedback overlay stopped before task completion")
        params = dict(values, Action=action)
        if bind:
            params.update(WindowId=self.spec["windowId"], ProcessId=self.spec["processId"])
        if action not in ("list", "observe", "window-state"):
            params.update(FeedbackEvents=str(self.events), NoFeedback=self.no_feedback)
        self.process.stdin.write(json.dumps({"params": params}) + "\n")
        self.process.stdin.flush()
        response = self.process.stdout.readline()
        if not response:
            raise RuntimeError("Windows automation worker disconnected")
        message = json.loads(response)
        if not message["ok"]:
            if message.get("retryable"):
                raise ObservationUnavailable(message["error"])
            raise RuntimeError(message["error"])
        return json.loads(message["json"])

    def write_feedback(self, **event):
        with self.events.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(event, ensure_ascii=False) + "\n")

    def feedback(self, phase, message):
        if self.no_feedback or self.finished:
            return
        self.write_feedback(phase=phase, message=message)
        self.finished = phase in ("success", "failure", "cancel")

    def close(self):
        if self.overlay and self.overlay.poll() is None and not self.finished:
            self.feedback("cancel", "桌面任务已结束")
        if self.process.stdin:
            self.process.stdin.close()
        if self.process.stdout:
            self.process.stdout.close()
        try:
            self.process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait()
        if self.overlay:
            try:
                self.overlay.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.overlay.terminate()
                self.overlay.wait()

    @staticmethod
    def match(controls, selector):
        return [control for control in controls
                if (not selector.get("name") or control["name"] == selector["name"])
                and (not selector.get("controlId") or control["id"] == selector["controlId"])
                and (not selector.get("kind") or control["controlType"] == "ControlType." + selector["kind"])]

    def locate(self, step):
        action = step["action"]
        if action in ("key", "tray-open", "tray-menu", "tray-select"):
            return {"by": "Win32/Shell", "action": action}
        self.call("focus")
        selector = step["target"]
        if not (selector.get("name") or selector.get("controlId")):
            return None
        observed = self.call("observe", ControlsOnly=True)["controls"]
        choices = [c for c in self.match(observed, selector) if c["enabled"]]
        if len(choices) != 1:
            return None
        control = choices[0]
        if control["invokable"] and action == "click":
            action = "invoke"
        elif action == "click" and control["toggleState"] is not None:
            action = "toggle"
        elif control["bounds"] is None:
            return None
        locator = {"ControlId": control["id"]} if control["id"] else {"ControlName": control["name"]}
        return {"by": "UIA" if action in ("invoke", "toggle") else "UIA + Win32 input",
                "action": action, **locator, "ControlType": control["controlType"].split(".")[-1]}

    def perform(self, step, location):
        action = location.get("action", step["action"])
        params = {key: value for key, value in location.items() if key not in ("by", "action")}
        if action == "type":
            if "textEnv" in step:
                params["Text"] = os.environ[step["textEnv"]]
            else:
                params["Text"] = step["text"]
            params["ReplaceText"] = True
        if action == "key":
            params["Keys"] = step["keys"]
        if action.startswith("tray-"):
            params.update(step["target"]["trayArgs"])
        if action == "scroll":
            params["WheelDelta"] = step["wheelDelta"]
        self.call(action, **params)

    def check(self, condition):
        if "all" in condition:
            return all(self.check(entry) for entry in condition["all"])
        if "visibleWindow" in condition:
            if condition["visibleWindow"] is False:
                return not any(item["windowId"] == self.spec["windowId"] and item["processId"] == self.spec["processId"]
                               for item in self.call("list", bind=False))
            return self.call("window-state")["visible"] == condition["visibleWindow"]
        if "file" in condition:
            path = Path(condition["file"])
            return path.is_file() and path.stat().st_size > 0
        if not (condition.get("name") or condition.get("controlId") or condition.get("kind")):
            raise ValueError("A desktop assertion must select a control")
        try:
            controls = self.call("observe", ControlsOnly=True)["controls"]
        except ObservationUnavailable:
            return False
        matches = self.match(controls, condition)
        if "equals" in condition:
            return len(matches) == 1 and matches[0]["value"] == condition["equals"]
        if "enabled" in condition:
            return len(matches) == 1 and matches[0]["enabled"] == condition["enabled"]
        return len(matches) == condition.get("count", 1)

    def screenshot(self, path):
        self.call("observe", Screenshot=str(path))

    def snapshot(self, path):
        source = path.with_suffix(".json")
        self.call("observe", Screenshot=str(path), Observation=str(source))
        return {"Observation": str(source)}


class BrowserTarget(VisualSearch):
    def __init__(self, spec, output):
        import websocket

        self.spec = spec
        self.output = output
        self.serial = 0
        self.overlay = None
        self.session_id = None
        self.closed = False
        self.broken = False
        endpoint = urlsplit(spec["webSocketDebuggerUrl"])
        if (endpoint.scheme != "ws" or endpoint.hostname not in ("127.0.0.1", "localhost", "::1")
                or not endpoint.path.startswith(("/devtools/page/", "/devtools/browser/"))
                or endpoint.username or endpoint.password):
            raise ValueError("Bind a local DevTools page or browser endpoint")
        timeout = spec.get("connectTimeoutMs", 60000) / 1000
        if timeout <= 0 or spec.get("commandTimeoutMs", 2000) <= 0:
            raise ValueError("CDP timeouts must be positive")
        started = time.perf_counter()
        self.socket = websocket.create_connection(endpoint.geturl(), timeout=timeout, suppress_origin=True)
        try:
            self.connection_event("opened", durationMs=round((time.perf_counter() - started) * 1000, 2))
            if endpoint.path.startswith("/devtools/browser/"):
                targets = self.rpc("Target.getTargets")["targetInfos"]
                matches = [t for t in targets if t["type"] == "page" and t["url"] == spec["url"]
                           and (not spec.get("targetId") or t["targetId"] == spec["targetId"])]
                if len(matches) != 1:
                    raise ValueError("Bind exactly one existing page by URL and optional targetId")
                self.session_id = self.rpc("Target.attachToTarget", targetId=matches[0]["targetId"],
                                           flatten=True)["sessionId"]
            self.ensure_url()
            self.connection_event("bound")
            if "window" in spec:
                self.overlay = DesktopTarget(spec["window"], output)
        except Exception:
            self.close()
            raise

    def rpc(self, method, **fields):
        if self.closed or self.broken:
            raise ConnectionError("CDP connection ended; start a new authorized task")
        try:
            return self._rpc(method, **fields)
        except Exception:
            self.broken = True
            raise

    def _rpc(self, method, **fields):
        self.serial += 1
        ident = self.serial
        seconds = self.spec.get("commandTimeoutMs", 2000) / 1000
        if seconds <= 0:
            raise ValueError("commandTimeoutMs must be positive")
        deadline = time.perf_counter() + seconds
        self.socket.settimeout(seconds)
        request = {"id": ident, "method": method, "params": fields}
        if self.session_id:
            request["sessionId"] = self.session_id
        self.socket.send(json.dumps(request))
        while True:
            remaining = deadline - time.perf_counter()
            if remaining <= 0:
                raise TimeoutError(f"CDP command deadline exceeded: {method}")
            self.socket.settimeout(remaining)
            message = json.loads(self.socket.recv())
            if message.get("id") != ident or message.get("sessionId") != self.session_id:
                continue
            if "error" in message:
                raise RuntimeError(message["error"].get("message", method))
            return message["result"]

    def evaluate(self, expression):
        reply = self.rpc("Runtime.evaluate", expression=expression, returnByValue=True)
        if "exceptionDetails" in reply:
            raise ValueError("Browser selector or expression failed")
        return reply["result"].get("value")

    def ensure_url(self):
        if self.evaluate("location.href") != self.spec["url"]:
            raise ValueError("The bound Chromium tab URL changed")

    @staticmethod
    def selector_source(selector):
        if "css" in selector:
            return "Array.from(document.querySelectorAll(" + json.dumps(selector["css"]) + "))"
        name = json.dumps(selector["name"])
        return """Array.from(document.querySelectorAll("button,[role=button],input,textarea,select,a,[role=tab]"))
            .filter(el => (el.getAttribute('aria-label') || (el.innerText || '').trim() || el.placeholder) === """ + name + ")"

    def locate(self, step):
        self.ensure_url()
        selector = step["target"]
        if not ("css" in selector or "name" in selector):
            return None
        source = self.selector_source(selector)
        point = self.evaluate("""(() => {
            const matches = (""" + source + """).filter(el => el.getClientRects().length && !el.disabled &&
              el.getAttribute('aria-disabled') !== 'true');
            if (matches.length !== 1) return null;
            const el = matches[0];
            el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
            const box = el.getBoundingClientRect();
            const x = box.left + box.width / 2, y = box.top + box.height / 2;
            const hit = document.elementFromPoint(x,y);
            return hit && (el === hit || el.contains(hit)) ? {x,y} : null;
        })()""")
        return {"by": "CDP", **point} if point else None

    def click(self, x, y):
        for kind in ("mousePressed", "mouseReleased"):
            self.rpc("Input.dispatchMouseEvent", type=kind, x=x, y=y, button="left", clickCount=1)

    def perform(self, step, location):
        self.ensure_url()
        x, y = location["x"], location["y"]
        if location["by"] == "CDP":
            if self.locate(step) != location:
                raise LookupError("Chromium control moved before input dispatch")
        else:
            if self.evaluate("!document.elementFromPoint(" + json.dumps(x) + "," + json.dumps(y) + ")"):
                raise LookupError("Visual target outside the bound viewport")
        action = step["action"]
        # CDP input uses viewport coordinates. It leaves the Windows pointer alone.
        if action == "hover":
            self.rpc("Input.dispatchMouseEvent", type="mouseMoved", x=x, y=y)
            return
        if action not in ("click", "type"):
            raise ValueError(f"Unsupported CDP action: {action}")
        self.click(x, y)
        if action == "type":
            self.rpc("Input.dispatchKeyEvent", type="rawKeyDown", modifiers=2, windowsVirtualKeyCode=65, key="a")
            self.rpc("Input.dispatchKeyEvent", type="keyUp", modifiers=2, windowsVirtualKeyCode=65, key="a")
            text = os.environ[step["textEnv"]] if "textEnv" in step else step["text"]
            if text:
                self.rpc("Input.insertText", text=text)
            else:
                self.rpc("Input.dispatchKeyEvent", type="rawKeyDown", windowsVirtualKeyCode=8, key="Backspace")
                self.rpc("Input.dispatchKeyEvent", type="keyUp", windowsVirtualKeyCode=8, key="Backspace")

    def check(self, condition):
        self.ensure_url()
        if "all" in condition:
            return all(self.check(entry) for entry in condition["all"])
        if "text" in condition:
            return self.evaluate("document.body.innerText.includes(" + json.dumps(condition["text"]) + ")")
        source = self.selector_source(condition)
        if "equals" in condition:
            expectation = "items.length === 1 && items[0].value === " + json.dumps(condition["equals"])
        else:
            expectation = "items.length === " + json.dumps(condition.get("count", 1))
        return self.evaluate("(() => { const items = " + source + "; return " + expectation + "; })()")

    def screenshot(self, path):
        import base64
        self.ensure_url()
        path.write_bytes(base64.b64decode(self.rpc("Page.captureScreenshot", format="png")["data"]))

    def snapshot(self, path):
        self.screenshot(path)
        return {"viewport": self.evaluate("({width:innerWidth,height:innerHeight})")}

    def feedback(self, phase, message):
        if self.overlay:
            self.overlay.feedback(phase, message)

    def close(self):
        if not self.closed:
            self.closed = True
            try:
                self.socket.close()
            finally:
                self.connection_event("closed", commands=self.serial)
                if self.overlay:
                    self.overlay.close()

    def connection_event(self, event, **fields):
        with (self.output / "connection.jsonl").open("a", encoding="utf-8") as stream:
            stream.write(json.dumps({"event": event, "monotonicNs": time.perf_counter_ns(), **fields}) + "\n")
