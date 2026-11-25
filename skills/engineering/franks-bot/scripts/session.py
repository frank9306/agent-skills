"""Run a case against one bound window or Chromium tab and record decisions."""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys
import time

SCRIPT_DIR = Path(__file__).resolve().parent
RELEASE = "0.3.2"
POLL_SECONDS = 0.05


def run_case(case, target, output, *, finalize=True):
    previous = None
    start = time.perf_counter()
    output.mkdir(parents=True, exist_ok=True)
    with (output / "actions.jsonl").open("x", encoding="utf-8") as journal:
        def record(event, step, **fields):
            value = {"event": event, "step": step, "elapsedMs": round((time.perf_counter() - start) * 1000, 2), **fields}
            journal.write(json.dumps(value, ensure_ascii=False) + "\n")
            journal.flush()

        for step in case["steps"]:
            key = step["id"]
            if not re.fullmatch(r"[A-Za-z0-9_-]+", key):
                raise ValueError(f"Invalid step id: {key!r}")
            technique = None
            evidence = None
            status = "failed"
            target.feedback("decide", f"{key} · 定位")
            try:
                check_cancelled = getattr(target, "check_cancelled", None)
                if check_cancelled:
                    check_cancelled()
                probe_start = time.perf_counter()
                location = target.locate(step)
                if hasattr(target, "spec"):
                    record("probe", key, technique="CDP" if target.spec.get("kind") == "chromium" else "native",
                           durationMs=round((time.perf_counter() - probe_start) * 1000, 2),
                           status="matched" if location else "miss")
                if not location and hasattr(target, "visual_locate") and step["action"] in ("click", "type", "hover"):
                    location = target.visual_locate(step, output, lambda by, ms, result: record(
                        "probe", key, technique=by, durationMs=ms, status=result))
                if location is None:
                    status = "unresolved"
                    raise LookupError("No unique target")
                dispatched = time.perf_counter()
                technique = location["by"]
                record("dispatch", key, technique=technique, action=step["action"],
                       monotonicNs=time.perf_counter_ns(), utc=datetime.now(timezone.utc).isoformat(),
                       sincePreviousMs=None if previous is None else round((dispatched - previous) * 1000, 2))
                previous = dispatched
                target.feedback("decide", f"{key} · {technique}")
                target.perform(step, location)
                deadline = time.perf_counter() + step.get("timeoutMs", 2000) / 1000
                target.feedback("verify", f"{key} · 核验")
                while not target.check(step["expect"]):
                    remaining = deadline - time.perf_counter()
                    if remaining <= 0:
                        status = "timeout"
                        raise TimeoutError("Expected state not observed")
                    time.sleep(min(POLL_SECONDS, remaining))
                status = "passed"
                if step.get("capture"):
                    evidence = key + ".png"
                    target.screenshot(output / evidence)
                record("result", key, status=status, technique=technique, screenshot=evidence)
            except (Exception, KeyboardInterrupt) as exc:
                if isinstance(exc, KeyboardInterrupt):
                    status = "cancelled"
                try:
                    evidence = key + "-failure.png"
                    target.screenshot(output / evidence)
                except (Exception, KeyboardInterrupt):
                    evidence = None
                record("result", key, status=status if status != "passed" else "failed",
                       technique=technique, screenshot=evidence, error=str(exc))
                phase = ("cancel" if status == "cancelled" else "failure") if finalize else "fallback"
                target.feedback(phase, f"{key} · {status}")
                return False

        target.feedback("success" if finalize else "wait", "所有步骤已核验")
        return True


def build_manifest():
    files = sorted(p for p in SCRIPT_DIR.iterdir() if p.suffix in {".ps1", ".cs", ".py"})
    files += sorted((SCRIPT_DIR.parent / "bin").glob("*.exe"))
    return {"version": RELEASE, "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", action="store_true")
    parser.add_argument("--case", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--retained-status", type=Path, metavar="OUTPUT")
    parser.add_argument("--close-retained", type=Path, metavar="OUTPUT")
    parser.add_argument("--cancel-hidden", type=Path, metavar="OUTPUT")
    parser.add_argument("--hidden-worker", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    manifest = build_manifest()
    if args.version:
        print(json.dumps(manifest))
        return 0
    controls = (args.retained_status, args.close_retained, args.cancel_hidden)
    if any(controls):
        from session_hidden import cancel_run, read_status, request_close
        if any((args.case, args.output, args.hidden_worker)) or sum(p is not None for p in controls) != 1:
            parser.error("Choose one hidden task command")
        try:
            if args.retained_status:
                print(json.dumps(read_status(args.retained_status), ensure_ascii=True))
                return 0
            if args.cancel_hidden:
                return cancel_run(args.cancel_hidden)
            return request_close(args.close_retained)
        except (OSError, ValueError) as exc:
            parser.error(str(exc))
    if args.hidden_worker:
        from session_hidden import worker
        if args.output is None:
            parser.error("Missing hidden worker output")
        return worker(json.load(sys.stdin), args.output, run_case)
    if args.case is None or args.output is None:
        parser.error("Specify --case and --output, or --version")
    case = json.loads(args.case.read_text(encoding="utf-8-sig"))
    if not case.get("steps"):
        parser.error("The case must contain at least one step")
    ids = [step["id"] for step in case["steps"]]
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r"[A-Za-z0-9_-]+", key) for key in ids):
        parser.error("Every step needs a unique id containing only letters, digits, - and _")
    mode = case["target"]["kind"]
    if mode == "windows-hidden":
        from session_hidden import run_hidden, validate
        try:
            validate(case)
        except ValueError as exc:
            parser.error(str(exc))
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / "manifest.json").write_text(
        json.dumps({"build": manifest, "startedAt": datetime.now(timezone.utc).isoformat()}, indent=2), encoding="utf-8")
    from session_targets import BrowserTarget, DesktopTarget
    if mode == "windows-hidden":
        return run_hidden(case, args.output)
    adapter = {"windows": DesktopTarget, "chromium": BrowserTarget}[mode]
    with closing(adapter(case["target"], args.output)) as target:
        return 0 if run_case(case, target, args.output) else 1


if __name__ == "__main__":
    sys.exit(main())
