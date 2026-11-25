"""Record one owned hidden desktop through the packaged v0.3 preview tools."""
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import time
from urllib.request import Request, urlopen

from session_targets import SCRIPTS, ObservationUnavailable


class HiddenPreview:
    def __init__(self, config, output, write_json):
        if not isinstance(config, dict):
            raise ValueError("preview must be an object")
        self.output = output
        self.write_json = write_json
        self.ffmpeg = config.get("ffmpeg") or shutil.which("ffmpeg")
        if not self.ffmpeg or not Path(self.ffmpeg).is_file():
            raise ValueError("preview requires an FFmpeg executable")
        self.headless = config.get("headless", False)
        self.source = self.player = None
        self.endpoint = None
        self.serial = 0

    def process(self, name, args, env, log):
        program = SCRIPTS.parent / "bin" / name
        with (self.output / log).open("w", encoding="utf-8") as stream:
            return subprocess.Popen([str(program), *map(str, args)], env=env, stdout=stream,
                                    stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW)

    def start(self, desktop, window):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            address = f"127.0.0.1:{probe.getsockname()[1]}"
        env = os.environ.copy()
        token = secrets.token_urlsafe(32)
        env["FRANKS_PREVIEW_TOKEN"] = token
        self.step("已连接隐藏测试桌面")
        self.source = self.process("desktop-capture.exe", [
            "--listen", address, "--fps", "10", "--steps", self.output / "preview-step.json",
            "--actions", self.output / "preview-action.json", "--hidden-desktop", desktop,
            "--hidden-window", window["windowId"], "--hidden-pid", window["processId"],
        ], env, "preview-source.log")
        health = Request("http://" + address + "/health", headers={"Authorization": "Bearer " + token})
        self.wait(lambda: self.source.poll() is None and self.get(health), 10, "capture source")
        arguments = ["--connect", "http://" + address, "--record", self.output / "recording",
                     "--ffmpeg", self.ffmpeg]
        if self.headless:
            arguments.append("--headless")
        self.player = self.process("desktop-player.exe", arguments, env, "preview-player.log")
        self.endpoint = self.wait(self.find_endpoint, 10, "preview player")
        self.wait(lambda: self.phase() == "live", 15, "live capture")

    def find_endpoint(self):
        lines = (self.output / "preview-player.log").read_text(encoding="utf-8", errors="replace").splitlines()
        return next((line for line in lines if line.startswith("http://127.0.0.1:")), None)

    @staticmethod
    def get(request):
        with urlopen(request, timeout=1) as reply:
            return reply.read()

    @staticmethod
    def wait(probe, timeout, label):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                if value := probe():
                    return value
            except OSError:
                pass
            time.sleep(.10)
        raise TimeoutError(f"Timed out waiting for {label}; see preview logs")

    def phase(self):
        state = json.loads(self.get(self.endpoint + "/api/session"))
        if state["phase"] == "failed":
            raise RuntimeError(state.get("error", "Preview failed"))
        return state["phase"]

    def step(self, name, finished=False):
        self.write_json(self.output / "preview-step.json", {"name": name, "finished": finished})

    def action(self, target, step, location):
        kind = step["action"]
        if kind not in ("click", "type", "toggle"):
            return
        selector = step.get("target", {})
        label = selector.get("name") or selector.get("controlId") or step["id"]
        self.serial += 1
        mark = {"id": self.serial, "kind": kind, "label": label.encode()[:145].decode(errors="ignore")}
        if kind == "type" and "textEnv" not in step and isinstance(step.get("previewSample"), str):
            mark["sample"] = step["previewSample"].encode()[:145].decode(errors="ignore")
        try:
            observed = target.call("observe", ControlsOnly=True)
            origin = observed["bounds"]
            if all(key in location for key in ("Observation", "X", "Y")):
                snapshot = json.loads(Path(location["Observation"]).read_text(encoding="utf-8-sig"))
                left = origin["left"] + location["X"] * snapshot["bounds"]["width"] // snapshot["imageWidth"]
                top = origin["top"] + location["Y"] * snapshot["bounds"]["height"] // snapshot["imageHeight"]
                mark["bounds"] = dict(Left=round(left-5), Top=round(top-5),
                                      Right=round(left+5), Bottom=round(top+5))
            else:
                matches = target.match(observed["controls"], selector)
                if len(matches) == 1 and matches[0].get("bounds"):
                    rect = matches[0]["bounds"]
                    left, top = origin["left"] + rect["left"], origin["top"] + rect["top"]
                    mark["bounds"] = dict(Left=round(left), Top=round(top),
                                          Right=round(left + rect["width"]), Bottom=round(top + rect["height"]))
        except ObservationUnavailable:
            pass
        self.write_json(self.output / "preview-action.json", mark)
        self.step(("键盘输入" if kind == "type" else "鼠标点击") + " · " + mark["label"])
        time.sleep(.25)

    def finish(self, name):
        self.step(name, finished=True)
        self.wait(lambda: self.phase() == "ready", 45, "replay encoding")
        return str(self.output / "recording" / "replay.mp4")

    def close(self, *, keep_player=False):
        for process in (self.source, None if keep_player and not self.headless else self.player):
            if process is not None and process.poll() is None:
                process.terminate()
                process.wait(timeout=5)
