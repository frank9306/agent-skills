#!/usr/bin/env python3
"""Manage Credentials - local Fernet-encrypted vault with split storage.

Layout (env VAULT_DIR, default ~/.agent-vault):
  manifest.json          plain metadata index
  entries/<name>.json    one Fernet-encrypted JSON per entry
  .master_key            local-only Fernet key (chmod 600)

Commands:
  add [--category C] [--tags t1,t2] <name> <account> <password> [note]
  list [--category C] [--tag T]
  search <keyword>
  get <name>
  audit
  delete <name>
  migrate --from <legacy.json>
  sync (status|push|pull) [--remote <git-url>]
  genkey

Encryption: Fernet (AES-128-CBC + HMAC-SHA256) using a single master key.
Backward compatible with the legacy single-file `passwords.json` store.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    from cryptography.fernet import Fernet, InvalidToken
except ImportError:
    sys.stderr.write(
        "ERROR: 'cryptography' package is required. Install with: pip install cryptography\n"
    )
    raise SystemExit(2)


VALID_CATEGORIES = ("api", "account", "payment", "identity", "note", "other")
MIN_LENGTH = {"api": 40, "account": 6, "payment": 8, "identity": 8, "note": 1, "other": 1}


def vault_dir() -> Path:
    raw = os.environ.get("VAULT_DIR", "").strip()
    return Path(raw).expanduser() if raw else Path.home() / ".agent-vault"


def manifest_path(vdir: Path) -> Path:
    return vdir / "manifest.json"


def entries_dir(vdir: Path) -> Path:
    return vdir / "entries"


def key_path(vdir: Path) -> Path:
    return vdir / ".master_key"


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def ensure_vault(vdir: Path) -> None:
    vdir.mkdir(parents=True, exist_ok=True)
    entries_dir(vdir).mkdir(exist_ok=True)
    if not manifest_path(vdir).exists():
        manifest_path(vdir).write_text(
            json.dumps({}, indent=2, ensure_ascii=False), encoding="utf-8"
        )
    if not key_path(vdir).exists():
        key_path(vdir).write_bytes(Fernet.generate_key())
    try:
        os.chmod(key_path(vdir), stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass


def load_master_key(vdir: Path) -> bytes:
    ensure_vault(vdir)
    return key_path(vdir).read_bytes().strip()


def load_manifest(vdir: Path) -> dict[str, Any]:
    ensure_vault(vdir)
    return json.loads(manifest_path(vdir).read_text(encoding="utf-8"))


def save_manifest(vdir: Path, manifest: dict[str, Any]) -> None:
    manifest_path(vdir).write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def encrypt_entry(key: bytes, payload: dict[str, str]) -> str:
    raw = json.dumps(payload, ensure_ascii=False)
    return Fernet(key).encrypt(raw.encode()).decode()


def decrypt_entry(key: bytes, token: str) -> dict[str, str]:
    try:
        raw = Fernet(key).decrypt(token.encode()).decode()
    except InvalidToken as exc:
        raise ValueError("master key mismatch or corrupt entry") from exc
    return json.loads(raw)


def cmd_add(args: argparse.Namespace) -> int:
    vdir = vault_dir()
    ensure_vault(vdir)
    key = load_master_key(vdir)
    manifest = load_manifest(vdir)

    name = args.name
    category = args.category
    if category not in VALID_CATEGORIES:
        sys.stderr.write(f"ERROR: category must be one of {VALID_CATEGORIES}\n")
        return 2
    tags = [t.strip() for t in (args.tags or "").split(",") if t.strip()]

    password = args.password
    if "..." in password:
        sys.stderr.write(
            "ERROR: plaintext contains '...' - looks pre-masked. "
            "Please paste the full value, not a truncated copy.\n"
        )
        return 2
    if len(password) < MIN_LENGTH[category]:
        sys.stderr.write(
            f"ERROR: password length {len(password)} below minimum {MIN_LENGTH[category]} "
            f"for category '{category}'. Refusing to save a suspect value.\n"
        )
        return 2

    payload: dict[str, str] = {"password": password}
    if args.note:
        payload["note"] = args.note
    token = encrypt_entry(key, payload)

    (entries_dir(vdir) / f"{name}.json").write_text(
        json.dumps({"ct": token}, ensure_ascii=False), encoding="utf-8"
    )

    stamp = now_iso()
    prior = manifest.get(name, {})
    manifest[name] = {
        "name": name,
        "account": args.account,
        "category": category,
        "tags": tags,
        "created_at": prior.get("created_at", stamp),
        "updated_at": stamp,
        "length": len(password),
    }
    save_manifest(vdir, manifest)
    print(f"[ok] {name} saved (category={category}, length={len(password)})")
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    manifest = load_manifest(vault_dir())
    items = list(manifest.values())
    if args.category:
        items = [m for m in items if m.get("category") == args.category]
    if args.tag:
        items = [m for m in items if args.tag in (m.get("tags") or [])]
    if not items:
        print("(empty)")
        return 0
    items.sort(key=lambda m: m["name"])
    for m in items:
        tags = ",".join(m.get("tags") or [])
        print(f"  {m['name']:30s}  [{m.get('category', '?'):8s}]  tags=[{tags}]")
    return 0


def cmd_search(args: argparse.Namespace) -> int:
    needle = args.keyword.lower()
    manifest = load_manifest(vault_dir())
    hits = []
    for m in manifest.values():
        haystack = " ".join(
            [
                m["name"],
                m.get("account", ""),
                m.get("category", ""),
                " ".join(m.get("tags") or []),
            ]
        ).lower()
        if needle in haystack:
            hits.append(m)
    if not hits:
        print(f"(no matches for {args.keyword!r})")
        return 1
    for m in sorted(hits, key=lambda x: x["name"]):
        print(f"  {m['name']:30s}  account={m.get('account', '')}")
    return 0


def cmd_get(args: argparse.Namespace) -> int:
    vdir = vault_dir()
    key = load_master_key(vdir)
    manifest = load_manifest(vdir)
    if args.name not in manifest:
        print(f"not found: {args.name}")
        return 1
    meta = manifest[args.name]
    token_path = entries_dir(vdir) / f"{args.name}.json"
    if not token_path.exists():
        print(f"ERROR: manifest references {args.name} but no entry file exists")
        return 2
    try:
        entry = decrypt_entry(key, json.loads(token_path.read_text(encoding="utf-8"))["ct"])
    except ValueError as exc:
        print(f"decrypt failed: {exc}")
        return 2
    pw = entry.get("password", "")
    flags = []
    if "..." in pw:
        flags.append("PRE-MASKED")
    if len(pw) < MIN_LENGTH.get(meta.get("category", "other"), 1):
        flags.append(f"SHORT(len={len(pw)})")
    print(f"name:     {args.name}")
    print(f"account:  {meta.get('account', '')}")
    print(f"category: {meta.get('category', '')}")
    print(f"tags:     {','.join(meta.get('tags') or [])}")
    print(f"password: {pw}")
    if entry.get("note"):
        print(f"note:     {entry['note']}")
    print(f"updated:  {meta.get('updated_at', '')}")
    if flags:
        print(f"[warn] {' | '.join(flags)}")
    return 0


def cmd_audit(_: argparse.Namespace) -> int:
    vdir = vault_dir()
    key = load_master_key(vdir)
    manifest = load_manifest(vdir)
    findings: list[tuple[str, str]] = []
    account_index: dict[tuple[str, str], str] = {}

    for name, meta in manifest.items():
        token_path = entries_dir(vdir) / f"{name}.json"
        if not token_path.exists():
            findings.append((name, "missing entry file"))
            continue
        try:
            entry = decrypt_entry(key, json.loads(token_path.read_text(encoding="utf-8"))["ct"])
        except ValueError as exc:
            findings.append((name, f"decryption failed: {exc}"))
            continue
        pw = entry.get("password", "")
        category = meta.get("category", "other")
        if "..." in pw:
            findings.append((name, "PRE-MASKED plaintext (contains '...')"))
        if len(pw) < MIN_LENGTH.get(category, 1):
            findings.append(
                (name, f"SHORT plaintext (len={len(pw)} < {MIN_LENGTH.get(category, 1)} for {category})")
            )
        pair = (meta.get("account", ""), category)
        if pair in account_index:
            findings.append(
                (name, f"DUPLICATE account with {account_index[pair]} (account={pair[0]}, category={pair[1]})")
            )
        else:
            account_index[pair] = name
        try:
            ts = dt.datetime.fromisoformat(meta.get("updated_at", ""))
            if (dt.datetime.now(dt.timezone.utc) - ts).days > 365:
                findings.append((name, f"STALE (last updated {ts.date()}, >365d)"))
        except ValueError:
            findings.append((name, "unparseable updated_at"))

    if not findings:
        print("[ok] vault clean - no findings")
        return 0
    print(f"{len(findings)} finding(s):")
    for name, msg in findings:
        print(f"  - {name}: {msg}")
    return 1


def cmd_delete(args: argparse.Namespace) -> int:
    vdir = vault_dir()
    manifest = load_manifest(vdir)
    if args.name not in manifest:
        print(f"not found: {args.name}")
        return 1
    del manifest[args.name]
    save_manifest(vdir, manifest)
    token_path = entries_dir(vdir) / f"{args.name}.json"
    if token_path.exists():
        token_path.unlink()
    print(f"[ok] {args.name} deleted")
    return 0


def cmd_migrate(args: argparse.Namespace) -> int:
    vdir = vault_dir()
    ensure_vault(vdir)
    key = load_master_key(vdir)
    legacy = Path(args.source).expanduser()
    if not legacy.exists():
        sys.stderr.write(f"ERROR: legacy file not found: {legacy}\n")
        return 2
    raw = json.loads(legacy.read_text(encoding="utf-8"))
    manifest = load_manifest(vdir)
    migrated = 0
    skipped = 0
    for name, entry in raw.items():
        if name in manifest:
            skipped += 1
            continue
        pw = entry.get("password", "")
        if "..." in pw:
            print(f"  skip {name}: pre-masked plaintext")
            skipped += 1
            continue
        payload: dict[str, str] = {"password": pw}
        if entry.get("note"):
            payload["note"] = entry["note"]
        token = encrypt_entry(key, payload)
        (entries_dir(vdir) / f"{name}.json").write_text(
            json.dumps({"ct": token}, ensure_ascii=False), encoding="utf-8"
        )
        stamp = now_iso()
        manifest[name] = {
            "name": name,
            "account": entry.get("account", ""),
            "category": "other",
            "tags": [],
            "created_at": stamp,
            "updated_at": stamp,
            "length": len(pw),
        }
        migrated += 1
    save_manifest(vdir, manifest)
    print(f"[ok] migrated {migrated} entries, skipped {skipped}")
    return 0


def _git(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        check=False,
    )


def _sync_gitignore(vdir: Path) -> None:
    gi = vdir / ".gitignore"
    if not gi.exists():
        gi.write_text(".master_key\n", encoding="utf-8")


def cmd_sync_status(_: argparse.Namespace) -> int:
    vdir = vault_dir()
    _sync_gitignore(vdir)
    result = _git("status", "--porcelain", cwd=vdir)
    print(result.stdout or "[ok] working tree clean")
    return 0 if not result.stdout else 1


def cmd_sync_push(args: argparse.Namespace) -> int:
    vdir = vault_dir()
    _sync_gitignore(vdir)
    if not (vdir / ".git").exists():
        init = _git("init", cwd=vdir)
        if init.returncode != 0:
            sys.stderr.write(f"git init failed: {init.stderr}\n")
            return 2
    if args.remote:
        remotes = _git("remote", "-v", cwd=vdir).stdout
        if "origin" not in remotes:
            _git("remote", "add", "origin", args.remote, cwd=vdir)
    _git("add", "manifest.json", "entries", ".gitignore", cwd=vdir)
    msg = f"vault: sync at {now_iso()}"
    commit = _git("commit", "-m", msg, cwd=vdir)
    if commit.returncode != 0 and "nothing to commit" not in commit.stdout:
        sys.stderr.write(f"commit failed: {commit.stderr}\n")
        return 2
    push = _git("push", "origin", "HEAD", cwd=vdir)
    if push.returncode != 0:
        sys.stderr.write(
            f"push failed (configure remote first or run 'git remote add origin <url>'): {push.stderr}\n"
        )
        return 2
    print("[ok] pushed")
    return 0


def cmd_sync_pull(_: argparse.Namespace) -> int:
    vdir = vault_dir()
    if not (vdir / ".git").exists():
        sys.stderr.write("ERROR: vault not under git. Run 'sync push' first to initialize.\n")
        return 2
    result = _git("pull", "--rebase", "--autostash", cwd=vdir)
    if result.returncode != 0:
        sys.stderr.write(f"pull failed: {result.stderr}\n")
        return 2
    print(result.stdout or "[ok] up to date")
    return 0


def cmd_sync(args: argparse.Namespace) -> int:
    return {
        "status": cmd_sync_status,
        "push": cmd_sync_push,
        "pull": cmd_sync_pull,
    }[args.action](args)


def cmd_genkey(_: argparse.Namespace) -> int:
    print(Fernet.generate_key().decode())
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="add or update an entry")
    p_add.add_argument("--category", default="other", choices=VALID_CATEGORIES)
    p_add.add_argument("--tags", default="")
    p_add.add_argument("name")
    p_add.add_argument("account")
    p_add.add_argument("password")
    p_add.add_argument("note", nargs="?", default="")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="list entries")
    p_list.add_argument("--category")
    p_list.add_argument("--tag")
    p_list.set_defaults(func=cmd_list)

    p_search = sub.add_parser("search", help="search by name/account/tag/note")
    p_search.add_argument("keyword")
    p_search.set_defaults(func=cmd_search)

    p_get = sub.add_parser("get", help="retrieve one entry")
    p_get.add_argument("name")
    p_get.set_defaults(func=cmd_get)

    p_audit = sub.add_parser("audit", help="audit vault for pre-masked/short/duplicate/stale")
    p_audit.set_defaults(func=cmd_audit)

    p_del = sub.add_parser("delete", help="delete an entry")
    p_del.add_argument("name")
    p_del.set_defaults(func=cmd_delete)

    p_mig = sub.add_parser("migrate", help="migrate legacy flat store")
    p_mig.add_argument("--from", dest="source", required=True)
    p_mig.set_defaults(func=cmd_migrate)

    p_sync = sub.add_parser("sync", help="sync to remote (git-based)")
    p_sync.add_argument("action", choices=("status", "push", "pull"))
    p_sync.add_argument("--remote")
    p_sync.set_defaults(func=cmd_sync)

    p_gen = sub.add_parser("genkey", help="print a new Fernet key (for diagnostics)")
    p_gen.set_defaults(func=cmd_genkey)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
