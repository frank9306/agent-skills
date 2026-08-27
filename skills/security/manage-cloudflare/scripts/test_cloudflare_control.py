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


class Tests(unittest.TestCase):
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

    def test_access_dry_run_does_not_create(self):
        client = FakeClient()
        args = argparse.Namespace(command="ensure-access-email", account_id="a", domain="router.example.com", name="Router", session_duration="24h", apply=False)
        with mock.patch.dict(os.environ, {"CLOUDFLARE_ACCESS_EMAIL": "owner@example.com"}, clear=True):
            result = cf.run(args, client)
        self.assertTrue(result["dry_run"])
        self.assertEqual([call[0] for call in client.calls], ["GET_ALL"])


if __name__ == "__main__":
    unittest.main()
