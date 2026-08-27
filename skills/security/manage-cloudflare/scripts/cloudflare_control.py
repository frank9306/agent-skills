#!/usr/bin/env python3
"""Dependency-free, secret-safe Cloudflare REST helper."""

from __future__ import annotations

import argparse
import json
import os
import stat
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

API_BASE = "https://api.cloudflare.com/client/v4"


class CloudflareError(RuntimeError):
    pass


def load_token() -> str:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    token_file = os.environ.get("CLOUDFLARE_API_TOKEN_FILE", "").strip()
    if token and token_file:
        raise CloudflareError("Set only one of CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_TOKEN_FILE")
    if token:
        return token
    if token_file:
        path = Path(token_file).expanduser()
        if os.name != "nt" and stat.S_IMODE(path.stat().st_mode) & 0o077:
            raise CloudflareError("Token file must not be readable by group or others")
        value = path.read_text(encoding="utf-8").strip()
        if value:
            return value
    raise CloudflareError("Provide a scoped token through CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_TOKEN_FILE")


def load_access_email() -> str:
    value = os.environ.get("CLOUDFLARE_ACCESS_EMAIL", "").strip().replace("\\@", "@")
    if not value or "@" not in value:
        raise CloudflareError("Provide the allowed identity through CLOUDFLARE_ACCESS_EMAIL")
    return value


class Client:
    def __init__(self, token: str, base_url: str = API_BASE):
        self.token = token
        self.base_url = base_url.rstrip("/")

    def request(self, method: str, path: str, body: Any | None = None) -> dict[str, Any]:
        data = None if body is None else json.dumps(body, separators=(",", ":")).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + path,
            data=data,
            method=method,
            headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:2000]
            raise CloudflareError(f"Cloudflare API HTTP {exc.code}: {detail}") from None
        except urllib.error.URLError as exc:
            raise CloudflareError(f"Cloudflare API connection failed: {exc.reason}") from None
        if not payload.get("success", False):
            raise CloudflareError(f"Cloudflare API rejected request: {payload.get('errors', [])}")
        return payload

    def get_all(self, path: str, query: dict[str, str] | None = None) -> list[Any]:
        query = dict(query or {})
        query.setdefault("per_page", "100")
        page = 1
        results: list[Any] = []
        while True:
            query["page"] = str(page)
            payload = self.request("GET", path + "?" + urllib.parse.urlencode(query))
            result = payload.get("result", [])
            if not isinstance(result, list):
                return [result]
            results.extend(result)
            total_pages = int((payload.get("result_info") or {}).get("total_pages") or 1)
            if page >= total_pages:
                return results
            page += 1


def validate_ingress(ingress: list[dict[str, Any]]) -> None:
    if not ingress:
        raise CloudflareError("Tunnel configuration has no ingress rules")
    catch_all = [i for i, rule in enumerate(ingress) if not rule.get("hostname") and not rule.get("path")]
    if catch_all != [len(ingress) - 1]:
        raise CloudflareError("Tunnel must contain exactly one catch-all rule in the final position")


def build_ingress_update(
    response: dict[str, Any], hostname: str, expected_service: str, new_service: str,
    no_tls_verify: bool = False,
) -> tuple[dict[str, Any], dict[str, Any]]:
    result = response.get("result") or {}
    config = result.get("config")
    if not isinstance(config, dict) or not isinstance(config.get("ingress"), list):
        raise CloudflareError("Unexpected Tunnel configuration response")
    updated = json.loads(json.dumps(config))
    ingress = updated["ingress"]
    validate_ingress(ingress)
    matches = [rule for rule in ingress if rule.get("hostname") == hostname]
    if len(matches) != 1:
        raise CloudflareError(f"Expected exactly one ingress rule for {hostname}, found {len(matches)}")
    rule = matches[0]
    if rule.get("service") != expected_service:
        raise CloudflareError(
            f"Ingress service changed: expected {expected_service!r}, found {rule.get('service')!r}"
        )
    rule["service"] = new_service
    if no_tls_verify:
        origin_request = rule.setdefault("originRequest", {})
        if not isinstance(origin_request, dict):
            raise CloudflareError("Ingress originRequest must be an object")
        origin_request["noTLSVerify"] = True
    validate_ingress(ingress)
    return updated, {
        "action": "update_tunnel_ingress_service",
        "hostname": hostname,
        "old_service": expected_service,
        "new_service": new_service,
        "no_tls_verify": no_tls_verify,
        "config_version": result.get("version"),
        "unrelated_rules_preserved": len(ingress) - 1,
        "catch_all_last": True,
    }


def write_snapshot(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("accounts")
    zones = sub.add_parser("zones")
    zones.add_argument("--account-id")
    zones.add_argument("--name")
    dns = sub.add_parser("dns-records")
    dns.add_argument("--zone-id", required=True)
    dns.add_argument("--name")
    tunnels = sub.add_parser("tunnels")
    tunnels.add_argument("--account-id", required=True)
    config = sub.add_parser("tunnel-config")
    config.add_argument("--account-id", required=True)
    config.add_argument("--tunnel-id", required=True)
    apps = sub.add_parser("access-apps")
    apps.add_argument("--account-id", required=True)
    policies = sub.add_parser("access-policies")
    policies.add_argument("--account-id", required=True)
    policies.add_argument("--app-id", required=True)
    access = sub.add_parser("ensure-access-email")
    access.add_argument("--account-id", required=True)
    access.add_argument("--domain", required=True)
    access.add_argument("--name", required=True)
    access.add_argument("--session-duration", default="24h")
    access.add_argument("--apply", action="store_true")
    update = sub.add_parser("update-ingress-service")
    update.add_argument("--account-id", required=True)
    update.add_argument("--tunnel-id", required=True)
    update.add_argument("--hostname", required=True)
    update.add_argument("--expected-service", required=True)
    update.add_argument("--new-service", required=True)
    update.add_argument("--no-tls-verify", action="store_true")
    update.add_argument("--snapshot-file", type=Path)
    update.add_argument("--apply", action="store_true")
    return parser


def run(args: argparse.Namespace, client: Client) -> Any:
    if args.command == "accounts":
        return client.get_all("/accounts")
    if args.command == "zones":
        query = {key: value for key, value in {"account.id": args.account_id, "name": args.name}.items() if value}
        return client.get_all("/zones", query)
    if args.command == "dns-records":
        return client.get_all(f"/zones/{args.zone_id}/dns_records", {"name": args.name} if args.name else None)
    if args.command == "tunnels":
        return client.get_all(f"/accounts/{args.account_id}/cfd_tunnel", {"is_deleted": "false"})
    if args.command == "tunnel-config":
        return client.request("GET", f"/accounts/{args.account_id}/cfd_tunnel/{args.tunnel_id}/configurations")
    if args.command == "access-apps":
        return client.get_all(f"/accounts/{args.account_id}/access/apps")
    if args.command == "access-policies":
        return client.get_all(f"/accounts/{args.account_id}/access/apps/{args.app_id}/policies")
    if args.command == "ensure-access-email":
        email = load_access_email()
        apps = client.get_all(f"/accounts/{args.account_id}/access/apps")
        matches = [app for app in apps if app.get("domain") == args.domain]
        if len(matches) > 1:
            raise CloudflareError(f"Multiple Access applications found for {args.domain}")
        plan = {
            "action": "ensure_access_email_policy",
            "domain": args.domain,
            "application": "reuse" if matches else "create",
            "allowed_identity_configured": True,
            "session_duration": args.session_duration,
        }
        if not args.apply:
            return {"dry_run": True, "plan": plan}
        created_app = False
        if matches:
            app = matches[0]
        else:
            payload = client.request("POST", f"/accounts/{args.account_id}/access/apps", {
                "name": args.name,
                "domain": args.domain,
                "type": "self_hosted",
                "session_duration": args.session_duration,
            })
            app = payload.get("result") or {}
            created_app = True
        app_id = app.get("id")
        if not app_id:
            raise CloudflareError("Access application response did not contain an id")
        policies = client.get_all(f"/accounts/{args.account_id}/access/apps/{app_id}/policies")
        allow_matches = [policy for policy in policies if policy.get("decision") == "allow"]
        created_policy = False
        if not allow_matches:
            policy_result = client.request(
                "POST", f"/accounts/{args.account_id}/access/apps/{app_id}/policies",
                {"name": "Allow owner email", "decision": "allow", "include": [{"email": {"email": email}}]},
            ).get("result") or {}
            created_policy = True
            policy_id = policy_result.get("id")
        else:
            policy_id = allow_matches[0].get("id")
        return {
            "dry_run": False,
            "plan": plan,
            "application_id": app_id,
            "policy_id": policy_id,
            "created_application": created_app,
            "created_policy": created_policy,
        }
    if args.command == "update-ingress-service":
        path = f"/accounts/{args.account_id}/cfd_tunnel/{args.tunnel_id}/configurations"
        current = client.request("GET", path)
        updated, plan = build_ingress_update(
            current, args.hostname, args.expected_service, args.new_service, args.no_tls_verify
        )
        if not args.apply:
            return {"dry_run": True, "plan": plan}
        if args.snapshot_file is None:
            raise CloudflareError("--snapshot-file is required with --apply")
        write_snapshot(args.snapshot_file, current)
        result = client.request("PUT", path, {"config": updated})
        return {"dry_run": False, "plan": plan, "snapshot_file": str(args.snapshot_file), "result": result.get("result")}
    raise CloudflareError(f"Unsupported command: {args.command}")


def main() -> int:
    try:
        args = build_parser().parse_args()
        print(json.dumps(run(args, Client(load_token())), ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except (CloudflareError, OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
