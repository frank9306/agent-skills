#!/usr/bin/env python3
"""Hermes-side client for the restricted DSH task dispatcher."""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import urllib.error
import urllib.request

REPOSITORY = "frank9306/my-knowledge"
ALLOWED_SOURCES = {"wechat", "hermes-cron"}


def build_payload(
    *,
    request: str,
    source: str,
    schedule_id: str | None = None,
    requested_at: str | None = None,
) -> dict[str, Any]:
    request = request.strip()
    if not request:
        raise ValueError("request must not be blank")
    if source not in ALLOWED_SOURCES:
        raise ValueError(f"source must be one of {sorted(ALLOWED_SOURCES)}")
    if source == "hermes-cron" and not (schedule_id or "").strip():
        raise ValueError("schedule_id is required for hermes-cron")
    return {
        "repository": REPOSITORY,
        "request": request,
        "source": source,
        "schedule_id": schedule_id.strip() if schedule_id else None,
        "requested_at": requested_at
        or datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
    }


def sign_body(body: bytes, secret: bytes) -> str:
    return hmac.new(secret, body, hashlib.sha256).hexdigest()


def submit(
    payload: dict[str, Any],
    *,
    endpoint: str,
    secret_file: str,
    timeout_seconds: int,
) -> dict[str, Any]:
    secret = Path(secret_file).read_bytes().strip()
    if len(secret) < 32:
        raise RuntimeError("dispatcher secret is missing or too short")
    body = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Dispatch-Signature": sign_body(body, secret),
            "User-Agent": "hermes-dispatch-dsh-task",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        try:
            result = json.loads(exc.read().decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as parse_exc:
            raise RuntimeError(f"dispatcher returned HTTP {exc.code}") from parse_exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f"dispatcher request failed: {exc.reason if hasattr(exc, 'reason') else exc}") from exc
    if not isinstance(result, dict):
        raise RuntimeError("dispatcher returned invalid JSON")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request")
    parser.add_argument("--source", choices=sorted(ALLOWED_SOURCES), default="wechat")
    parser.add_argument("--schedule-id")
    parser.add_argument("--requested-at")
    parser.add_argument("--endpoint", default="http://172.21.0.1:9121/v1/tasks")
    parser.add_argument("--secret-file", default="/opt/data/dispatch/hmac.key")
    parser.add_argument("--timeout", type=int, default=3900)
    parser.add_argument("--print-payload", action="store_true")
    args = parser.parse_args()

    try:
        payload = build_payload(
            request=args.request,
            source=args.source,
            schedule_id=args.schedule_id,
            requested_at=args.requested_at,
        )
        if args.print_payload:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            return 0
        result = submit(
            payload,
            endpoint=args.endpoint,
            secret_file=args.secret_file,
            timeout_seconds=args.timeout,
        )
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result.get("status") in {"done", "noop"} else 2
    except (ValueError, RuntimeError) as exc:
        print(json.dumps({"status": "error", "message": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    sys.exit(main())
