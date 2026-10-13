#!/usr/bin/env python3
"""Preview or initialize project-owned checks without replacing user files."""
from __future__ import annotations

import argparse
import difflib
import json
from pathlib import Path
import sys


ASSETS = Path(__file__).resolve().parents[1] / "assets"
BEGIN = "<!-- init-checks:begin -->"
END = "<!-- init-checks:end -->"


def argv(value: str) -> list[str]:
    parsed = json.loads(value)
    if not isinstance(parsed, list) or not parsed or any(not isinstance(x, str) or not x for x in parsed):
        raise ValueError("commands must be nonempty JSON arrays of nonempty strings")
    return parsed


def dump(value) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def hook_command(profile: str, windows: bool = False) -> str:
    # No shell interpolation, personal absolute paths, or cwd-relative script lookup.
    if profile == "typescript":
        return ('node -e "const c=require(\'node:child_process\'),p=require(\'node:path\'),'
                'u=require(\'node:url\');import(u.pathToFileURL(p.join(c.execFileSync(\'git\','
                '[\'rev-parse\',\'--show-toplevel\'],{encoding:\'utf8\'}).trim(),'
                '\'scripts/codex-checks.mjs\')).href).catch(e=>{console.error(e);process.exit(1)})"')
    executable = "python" if windows else "python3"
    return (executable + ' -c "import pathlib,runpy,subprocess;runpy.run_path(str(pathlib.Path('
            'subprocess.check_output([\'git\',\'rev-parse\',\'--show-toplevel\'],text=True).strip())'
            '/\'scripts/codex_checks.py\'),run_name=\'__main__\')"')


def generated_hooks(profile: str) -> dict:
    handlers = {}
    for event in ("SessionStart", "UserPromptSubmit", "PostToolUse", "Stop"):
        handler = {"type": "command", "command": hook_command(profile), "timeout": 650,
                   "statusMessage": "Checking project structure"}
        if profile == "python":
            handler["commandWindows"] = hook_command(profile, windows=True)
        # Snapshot after every supported tool; non-writing calls are cheap no-ops.
        handlers[event] = [{"hooks": [handler]}]
    return {"hooks": handlers}


def ci_text(profile: str) -> str:
    setup = ("      - uses: actions/setup-node@v7\n        with:\n          node-version: '24'\n"
             "      - run: npm ci\n" if profile == "typescript" else
             "      - uses: actions/setup-python@v7\n        with:\n          python-version: '3.12'\n"
             "      - run: python -m pip install import-linter==2.15\n")
    command = "node scripts/codex-checks.mjs --run full" if profile == "typescript" else "python scripts/codex_checks.py --run full"
    return ("# Adapt dependency installation to the project's lockfile; required-check policy is separate.\n"
            "name: architecture\non: [push, pull_request]\npermissions:\n  contents: read\njobs:\n"
            "  architecture:\n    runs-on: ${{ matrix.os }}\n    strategy:\n      matrix:\n"
            "        os: [ubuntu-latest, windows-latest]\n    steps:\n"
            "      - uses: actions/checkout@v7\n" + setup + f"      - run: {command}\n")


def prepare(project: Path, profile: str, contract: Path, full: list[str], quick: list[str] | None,
            ci: bool) -> dict[str, str]:
    if not project.is_dir() or project == Path(project.anchor) or project == Path.home():
        raise ValueError("project must be an existing, specific project directory")
    data = json.loads(contract.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict) or data.get("schemaVersion") != 1 or not data.get("modules"):
        raise ValueError("contract must have schemaVersion 1 and explicit module ownership")
    if data.get("profile", profile) != profile:
        raise ValueError("contract profile does not match --profile")
    data["profile"] = profile
    checker = "check-architecture.mjs" if profile == "typescript" else "check_architecture.py"
    runner = "codex-checks.mjs" if profile == "typescript" else "codex_checks.py"
    quick = quick or (["node", f"scripts/{checker}"] if profile == "typescript" else ["python", f"scripts/{checker}"])
    for managed in (f"scripts/{checker}", f"scripts/{runner}"):
        if managed not in data.setdefault("excludedPaths", []):
            data["excludedPaths"].append(managed)
    wrapped = f"node scripts/{runner}" if profile == "typescript" else f"python scripts/{runner}"
    block = (f"{BEGIN}\n## Project structure checks\n\n"
             "Read `.architecture.json` before code changes. Preserve module ownership, declared public entries, "
             "allowed dependencies, and public behavior test seams. Clarify ownership, public contracts and dependencies before materially "
             "changing those boundaries. Follow the project's existing task tracker; local Issues are not required.\n\n"
             f"Run `{wrapped} --run quick` during implementation and `{wrapped} --run full` before delivery. "
             "The full command runs structure checks before the existing project suite. Failing or skipped checks "
             "mean unfinished work. Do not weaken rules, exports, scan coverage, or baselines to obtain a pass. "
             "Review configuration and public contract changes explicitly.\n\n"
             "Codex project Hooks need native review and trust. CI must run the same full command and be configured "
             f"as required before claiming merge enforcement.\n{END}\n")
    files = {".architecture.json": dump(data), ".codex/checks.json": dump({"schemaVersion": 1, "quick": quick,
             "full": full, "timeoutSeconds": 300}), "AGENTS.md": block}
    for filename in (checker, runner):
        files[f"scripts/{filename}"] = (ASSETS / profile / filename).read_text(encoding="utf-8")
    hooks_path = project / ".codex/hooks.json"
    hooks = json.loads(hooks_path.read_text(encoding="utf-8-sig")) if hooks_path.exists() else {"hooks": {}}
    if not isinstance(hooks, dict) or not isinstance(hooks.get("hooks", {}), dict):
        raise ValueError("existing hooks.json has an invalid shape")
    hooks.setdefault("hooks", {})
    for event, groups in generated_hooks(profile)["hooks"].items():
        current = hooks["hooks"].setdefault(event, [])
        if not isinstance(current, list):
            raise ValueError(f"existing {event} hooks must be an array")
        if groups[0] not in current:
            # A previous generated adapter definition must be reconciled, not duplicated.
            if any("codex-checks.mjs" in json.dumps(g) or "codex_checks.py" in json.dumps(g) for g in current):
                raise ValueError(f"existing {event} init-checks hook differs; reconcile its diff explicitly")
            current.extend(groups)
    files[".codex/hooks.json"] = dump(hooks)
    agents_path = project / "AGENTS.md"
    if agents_path.exists():
        original = agents_path.read_text(encoding="utf-8")
        if BEGIN in original or END in original:
            if original.count(BEGIN) != 1 or original.count(END) != 1 or original.index(BEGIN) > original.index(END):
                raise ValueError("AGENTS.md has malformed init-checks markers")
            start, stop = original.index(BEGIN), original.index(END) + len(END)
            files["AGENTS.md"] = original[:start] + block.rstrip("\n") + original[stop:]
        else:
            files["AGENTS.md"] = original.rstrip("\n") + "\n\n" + block
    if ci:
        files[".github/workflows/architecture.yml"] = ci_text(profile)
    return files


def initialize(project: Path, files: dict[str, str], plan: bool) -> list[str]:
    changes, conflicts = [], []
    for name, content in files.items():
        target = project / name
        if target.is_symlink() or any(parent.is_symlink() for parent in target.parents if parent != project.parent):
            raise ValueError(f"refuse symlink destination: {name}")
        current = target.read_text(encoding="utf-8") if target.exists() else ""
        if target.exists() and current == content:
            print(f"UNCHANGED {name}")
            continue
        changes.append(name)
        print(f"{'UPDATE' if target.exists() else 'CREATE'} {name}")
        if target.exists():
            print("".join(difflib.unified_diff(current.splitlines(True), content.splitlines(True),
                                              fromfile=name, tofile=f"{name} (proposed)")), end="")
            if name not in ("AGENTS.md", ".codex/hooks.json"):
                conflicts.append(name)
            elif name == "AGENTS.md" and BEGIN in current:
                old_block = current[current.index(BEGIN):current.index(END) + len(END)]
                new_block = content[content.index(BEGIN):content.index(END) + len(END)]
                if old_block != new_block:
                    conflicts.append(name)
    if plan:
        return changes
    if conflicts:
        raise FileExistsError("No files written. Preserve/reconcile existing changes first: " + ", ".join(conflicts))
    for name in changes:
        target = project / name
        newline = "\r\n" if target.exists() and b"\r\n" in target.read_bytes() else "\n"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(files[name], encoding="utf-8", newline=newline)
    return changes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--profile", required=True, choices=["typescript", "python"])
    parser.add_argument("--contract", required=True, type=Path)
    parser.add_argument("--full-command", required=True, type=argv)
    parser.add_argument("--quick-command", type=argv)
    parser.add_argument("--plan", action="store_true")
    parser.add_argument("--ci", action="store_true")
    args = parser.parse_args()
    try:
        project = args.project.resolve()
        files = prepare(project, args.profile, args.contract.resolve(), args.full_command, args.quick_command, args.ci)
        initialize(project, files, args.plan)
        print("PLAN ONLY; no files written." if args.plan else "Initialized. Validate dependencies, negative fixtures, native Hook trust, and required CI policy before enabling enforcement.")
        return 0
    except (ValueError, OSError) as error:
        print(f"ERROR {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
