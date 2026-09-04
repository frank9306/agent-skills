import argparse
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import cloudflare_control as cf


def response(service="http://192.168.122.2:52521"):
    return {"success": True, "result": {"version": 12, "config": {"ingress": [
        {"hostname": "ssh.example.com", "service": "ssh://127.0.0.1:22"},
        {"hostname": "openwrt.example.com", "service": service},
        {"service": "http_status:404"},
    ]}}}


class FakeClient:
    def __init__(self):
        self.calls = []

    def request(self, method, path, body=None):
        self.calls.append((method, path, body))
        return response() if method == "GET" else {"success": True, "result": {"version": 13}}

    def get_all(self, path, query=None):
        self.calls.append(("GET_ALL", path, query))
        return []


class FakeDnsClient(FakeClient):
    def __init__(self, records):
        super().__init__()
        self.records = records

    def get_all(self, path, query=None):
        self.calls.append(("GET_ALL", path, query))
        return self.records


class Tests(unittest.TestCase):
    def test_ensure_ingress_inserts_missing_hostname_before_catch_all(self):
        updated, plan = cf.build_ingress_ensure(
            response(),
            "state.example.com",
            "http://127.0.0.1:3000",
            None,
        )

        self.assertEqual(updated["ingress"][-2]["hostname"], "state.example.com")
        self.assertEqual(updated["ingress"][-2]["service"], "http://127.0.0.1:3000")
        self.assertEqual(updated["ingress"][-1], {"service": "http_status:404"})
        self.assertEqual(plan["action"], "create")

    def test_ensure_ingress_updates_exact_expected_service(self):
        updated, plan = cf.build_ingress_ensure(
            response(),
            "openwrt.example.com",
            "https://192.168.122.2:52521",
            "http://192.168.122.2:52521",
        )
        self.assertEqual(updated["ingress"][1]["service"], "https://192.168.122.2:52521")
        self.assertEqual(plan["action"], "update")

    def test_ensure_ingress_rejects_duplicate_hostname(self):
        payload = response()
        payload["result"]["config"]["ingress"].insert(1, {
            "hostname": "openwrt.example.com",
            "service": "http://duplicate",
        })
        with self.assertRaises(cf.CloudflareError):
            cf.build_ingress_ensure(
                payload,
                "openwrt.example.com",
                "https://new",
                "http://192.168.122.2:52521",
            )

    def test_ensure_dns_creates_absent_proxied_tunnel_cname(self):
        payload, plan = cf.build_dns_ensure(
            [], "state.example.com", "new-tunnel.cfargotunnel.com", None
        )
        self.assertEqual(payload, {
            "type": "CNAME",
            "name": "state.example.com",
            "content": "new-tunnel.cfargotunnel.com",
            "proxied": True,
        })
        self.assertEqual(plan["action"], "create")

    def test_ensure_dns_updates_only_exact_expected_target(self):
        records = [{
            "id": "record-1", "type": "CNAME", "name": "state.example.com",
            "content": "old-tunnel.cfargotunnel.com", "proxied": True,
        }]
        payload, plan = cf.build_dns_ensure(
            records, "state.example.com", "new-tunnel.cfargotunnel.com",
            "old-tunnel.cfargotunnel.com",
        )
        self.assertEqual(payload["content"], "new-tunnel.cfargotunnel.com")
        self.assertEqual(plan["action"], "update")
        self.assertEqual(plan["record_id"], "record-1")

    def test_ensure_dns_rejects_unexpected_existing_target(self):
        records = [{
            "id": "record-1", "type": "CNAME", "name": "state.example.com",
            "content": "unexpected.cfargotunnel.com", "proxied": True,
        }]
        with self.assertRaises(cf.CloudflareError):
            cf.build_dns_ensure(
                records, "state.example.com", "new-tunnel.cfargotunnel.com",
                "old-tunnel.cfargotunnel.com",
            )

    def test_load_token_from_environment(self):
        with mock.patch.dict(os.environ, {"CLOUDFLARE_API_TOKEN": "synthetic-token"}, clear=True):
            self.assertEqual(cf.load_token(), "synthetic-token")

    def test_update_preserves_rules_and_catch_all(self):
        updated, plan = cf.build_ingress_update(response(), "openwrt.example.com", "http://192.168.122.2:52521", "https://192.168.122.2:52521", True)
        self.assertEqual(updated["ingress"][0]["service"], "ssh://127.0.0.1:22")
        self.assertEqual(updated["ingress"][1]["service"], "https://192.168.122.2:52521")
        self.assertTrue(updated["ingress"][1]["originRequest"]["noTLSVerify"])
        self.assertEqual(updated["ingress"][-1], {"service": "http_status:404"})
        self.assertTrue(plan["catch_all_last"])

    def test_rejects_changed_expected_service(self):
        with self.assertRaises(cf.CloudflareError):
            cf.build_ingress_update(response(), "openwrt.example.com", "http://wrong", "https://new")

    def test_rejects_nonfinal_catch_all(self):
        payload = response()
        payload["result"]["config"]["ingress"].reverse()
        with self.assertRaises(cf.CloudflareError):
            cf.build_ingress_update(payload, "openwrt.example.com", "http://192.168.122.2:52521", "https://new")

    def test_dry_run_does_not_put(self):
        client = FakeClient()
        args = argparse.Namespace(command="update-ingress-service", account_id="a", tunnel_id="t", hostname="openwrt.example.com", expected_service="http://192.168.122.2:52521", new_service="https://192.168.122.2:52521", no_tls_verify=True, snapshot_file=None, apply=False)
        result = cf.run(args, client)
        self.assertTrue(result["dry_run"])
        self.assertEqual([call[0] for call in client.calls], ["GET"])

    def test_apply_writes_snapshot_before_put(self):
        client = FakeClient()
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / "rollback.json"
            args = argparse.Namespace(command="update-ingress-service", account_id="a", tunnel_id="t", hostname="openwrt.example.com", expected_service="http://192.168.122.2:52521", new_service="https://192.168.122.2:52521", no_tls_verify=True, snapshot_file=snapshot, apply=True)
            result = cf.run(args, client)
            self.assertFalse(result["dry_run"])
            self.assertEqual([call[0] for call in client.calls], ["GET", "PUT"])
            self.assertEqual(json.loads(snapshot.read_text(encoding="utf-8"))["result"]["version"], 12)

    def test_ensure_ingress_apply_writes_snapshot_before_put(self):
        client = FakeClient()
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / "ingress-rollback.json"
            args = argparse.Namespace(
                command="ensure-ingress-hostname", account_id="a", tunnel_id="t",
                hostname="state.example.com", service="http://127.0.0.1:3000",
                expected_service=None, snapshot_file=snapshot, apply=True,
            )
            result = cf.run(args, client)
            self.assertFalse(result["dry_run"])
            self.assertEqual([call[0] for call in client.calls], ["GET", "PUT"])
            self.assertTrue(snapshot.exists())

    def test_ensure_dns_dry_run_does_not_write(self):
        client = FakeDnsClient([])
        args = argparse.Namespace(
            command="ensure-dns-tunnel-cname", zone_id="z", hostname="state.example.com",
            tunnel_id="new-tunnel", expected_target=None, snapshot_file=None, apply=False,
        )
        result = cf.run(args, client)
        self.assertTrue(result["dry_run"])
        self.assertEqual([call[0] for call in client.calls], ["GET_ALL"])

    def test_ensure_dns_apply_snapshots_and_creates(self):
        client = FakeDnsClient([])
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / "dns-rollback.json"
            args = argparse.Namespace(
                command="ensure-dns-tunnel-cname", zone_id="z", hostname="state.example.com",
                tunnel_id="new-tunnel", expected_target=None, snapshot_file=snapshot, apply=True,
            )
            result = cf.run(args, client)
            self.assertFalse(result["dry_run"])
            self.assertEqual([call[0] for call in client.calls], ["GET_ALL", "POST"])
            self.assertEqual(json.loads(snapshot.read_text(encoding="utf-8")), {"records": []})

    def test_access_dry_run_does_not_create(self):
        client = FakeClient()
        args = argparse.Namespace(command="ensure-access-email", account_id="a", domain="router.example.com", name="Router", session_duration="24h", apply=False)
        with mock.patch.dict(os.environ, {"CLOUDFLARE_ACCESS_EMAIL": "owner@example.com"}, clear=True):
            result = cf.run(args, client)
        self.assertTrue(result["dry_run"])
        self.assertEqual([call[0] for call in client.calls], ["GET_ALL"])


if __name__ == "__main__":
    unittest.main()
