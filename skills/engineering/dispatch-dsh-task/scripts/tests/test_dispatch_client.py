import unittest
from pathlib import Path
import sys

SCRIPTS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRIPTS))

import dispatch_task


class ClientPayloadTests(unittest.TestCase):
    def test_build_payload_preserves_schedule_identity(self):
        payload = dispatch_task.build_payload(
            request="更新知识库首页",
            source="hermes-cron",
            schedule_id="daily-update",
            requested_at="2026-08-28T02:00:00+08:00",
        )
        self.assertEqual(payload["repository"], "frank9306/my-knowledge")
        self.assertEqual(payload["schedule_id"], "daily-update")

    def test_rejects_blank_request(self):
        with self.assertRaisesRegex(ValueError, "request"):
            dispatch_task.build_payload(request="   ", source="wechat")

    def test_signature_is_stable_and_body_sensitive(self):
        secret = b"test-secret"
        self.assertEqual(
            dispatch_task.sign_body(b'{"a":1}', secret),
            dispatch_task.sign_body(b'{"a":1}', secret),
        )
        self.assertNotEqual(
            dispatch_task.sign_body(b'{"a":1}', secret),
            dispatch_task.sign_body(b'{"a":2}', secret),
        )


if __name__ == "__main__":
    unittest.main()
