#!/usr/bin/env python3
"""Private Docker-bridge HTTP front end for dsh_dispatcher."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import dsh_dispatcher

MAX_BODY = 128_000


def valid_signature(body: bytes, supplied: str, secret: bytes) -> bool:
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, supplied)


class DispatcherServer(ThreadingHTTPServer):
    secret: bytes
    config: dsh_dispatcher.RuntimeConfig


class Handler(BaseHTTPRequestHandler):
    server: DispatcherServer

    def log_message(self, format: str, *args: Any) -> None:
        # Do not log request bodies, signatures, query strings, or identities.
        print(f"dispatcher-http: {self.command} {self.path} {args[1] if len(args) > 1 else ''}")

    def _json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path != "/health":
            self._json(404, {"status": "not-found"})
            return
        self._json(200, {"status": "ok"})

    def do_POST(self) -> None:
        if self.path != "/v1/tasks":
            self._json(404, {"status": "not-found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._json(400, {"status": "rejected", "message": "invalid content length"})
            return
        if length <= 0 or length > MAX_BODY:
            self._json(413, {"status": "rejected", "message": "invalid payload size"})
            return
        body = self.rfile.read(length)
        signature = self.headers.get("X-Dispatch-Signature", "")
        if not valid_signature(body, signature, self.server.secret):
            self._json(401, {"status": "rejected", "message": "invalid signature"})
            return
        try:
            raw = json.loads(body)
            if not isinstance(raw, dict):
                raise ValueError("payload must be a JSON object")
            payload = dsh_dispatcher.validate_payload(raw)
            with dsh_dispatcher.exclusive_lock(
                self.server.config.root / "state/dispatcher.lock"
            ):
                result = dsh_dispatcher.execute(payload, self.server.config)
            status = 200 if result.get("status") == "done" else 409
            self._json(status, result)
        except RuntimeError as exc:
            status = "busy" if str(exc) == "dispatcher is busy" else "blocked"
            self._json(409, {"status": status, "message": str(exc)})
        except (ValueError, json.JSONDecodeError) as exc:
            self._json(400, {"status": "rejected", "message": str(exc)})


def load_secret(path: Path) -> bytes:
    secret = path.read_bytes().strip()
    if len(secret) < 32:
        raise RuntimeError("dispatcher secret is missing or too short")
    return secret


def main() -> None:
    host = os.environ.get("DSH_DISPATCH_HOST", "172.21.0.1")
    port = int(os.environ.get("DSH_DISPATCH_PORT", "9121"))
    secret_file = Path(
        os.environ.get(
            "DSH_DISPATCH_SECRET_FILE",
            "/vol2/1000/myprojects/ai-task-dispatcher/secrets/hmac.key",
        )
    )
    server = DispatcherServer((host, port), Handler)
    server.secret = load_secret(secret_file)
    server.config = dsh_dispatcher.RuntimeConfig.from_env()
    server.serve_forever(poll_interval=0.5)


if __name__ == "__main__":
    main()
