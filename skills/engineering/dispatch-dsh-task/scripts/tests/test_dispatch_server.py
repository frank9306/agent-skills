import unittest
from pathlib import Path
import sys

SCRIPTS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRIPTS))

import dispatch_task
import dsh_dispatch_server


class AuthenticationTests(unittest.TestCase):
    def test_accepts_valid_hmac_and_rejects_invalid_hmac(self):
        body = b'{"request":"safe"}'
        secret = b"shared-secret"
        signature = dispatch_task.sign_body(body, secret)
        self.assertTrue(dsh_dispatch_server.valid_signature(body, signature, secret))
        self.assertFalse(dsh_dispatch_server.valid_signature(body, "bad", secret))


if __name__ == "__main__":
    unittest.main()
