import json
from pathlib import Path
import sys
import time
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from session_targets import BrowserTarget


class EventSocket:
    def send(self, data):
        self.last = json.loads(data)

    def settimeout(self, seconds):
        self.timeout = seconds

    def recv(self):
        time.sleep(.003)
        if time.monotonic() - self.started > .04:
            return json.dumps({'id': self.last['id'], 'result': {}})
        return json.dumps({'method': 'Runtime.consoleAPICalled'})


class BrowserTest(unittest.TestCase):
    def test_unsolicited_events_cannot_extend_command_deadline(self):
        target = BrowserTarget.__new__(BrowserTarget)
        target.spec = {'commandTimeoutMs': 10}
        target.serial = 0
        target.closed = False
        target.broken = False
        target.session_id = None
        target.socket = EventSocket()
        target.socket.started = time.monotonic()
        with self.assertRaises(TimeoutError):
            target.rpc('Page.captureScreenshot')
