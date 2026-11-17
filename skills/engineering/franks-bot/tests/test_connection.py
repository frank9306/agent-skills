import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from session import run_case
from session_targets import BrowserTarget


class Socket:
    def __init__(self):
        self.sent = []
        self.closed = False

    def settimeout(self, seconds):
        pass

    def send(self, value):
        self.sent.append(json.loads(value))

    def recv(self):
        request = self.sent[-1]
        method = request['method']
        if method == 'Target.getTargets':
            result = {'targetInfos': [{'type': 'page', 'targetId': 'demo', 'url': 'http://localhost/demo'}]}
        elif method == 'Target.attachToTarget':
            result = {'sessionId': 'bound'}
        elif method == 'Runtime.evaluate':
            expr = request['params']['expression']
            value = 'http://localhost/demo' if expr == 'location.href' else ({'x': 20, 'y': 40} if 'elementFromPoint' in expr else True)
            result = {'result': {'value': value}}
        else:
            result = {}
        return json.dumps({'id': request['id'], 'result': result, **({'sessionId': request['sessionId']} if 'sessionId' in request else {})})

    def close(self):
        self.closed = True


class ConnectionTest(unittest.TestCase):
    def test_disconnect_never_reconnects_or_repeats_input(self):
        socket = Socket()
        with tempfile.TemporaryDirectory() as directory, patch.dict(sys.modules, {'websocket': types.SimpleNamespace()}):
            with patch('websocket.create_connection', return_value=socket, create=True) as connect:
                target = BrowserTarget({'webSocketDebuggerUrl': 'ws://localhost:9222/devtools/page/demo',
                                        'url': 'http://localhost/demo'}, Path(directory))
                with patch.object(socket, 'recv', side_effect=ConnectionError('lost')):
                    with self.assertRaises(ConnectionError):
                        target.click(20, 40)
                    with self.assertRaises(ConnectionError):
                        target.check({'text': 'done'})
                target.close()
                target.close()
                self.assertEqual(1, connect.call_count)
                self.assertEqual(1, sum(x['method'] == 'Input.dispatchMouseEvent' for x in socket.sent))
                self.assertTrue(all('sessionId' not in x for x in socket.sent))

    def test_ambiguous_url_closes_without_attaching(self):
        socket = Socket()
        with tempfile.TemporaryDirectory() as directory, patch.dict(sys.modules, {'websocket': types.SimpleNamespace()}):
            with patch('websocket.create_connection', return_value=socket, create=True):
                with self.assertRaisesRegex(ValueError, 'exactly one'):
                    BrowserTarget({'webSocketDebuggerUrl': 'ws://localhost:9913/devtools/browser/demo',
                                   'url': 'http://localhost/other'}, Path(directory))
        self.assertTrue(socket.closed)
        self.assertEqual(['Target.getTargets'], [x['method'] for x in socket.sent])

    def test_one_authorized_connection_serves_every_step(self):
        socket = Socket()
        with tempfile.TemporaryDirectory() as directory, patch.dict(sys.modules, {'websocket': types.SimpleNamespace()}):
            with patch('websocket.create_connection', return_value=socket, create=True) as connect:
                target = BrowserTarget({'webSocketDebuggerUrl': 'ws://127.0.0.1:9913/devtools/browser/test',
                                        'url': 'http://localhost/demo'}, Path(directory))
                try:
                    self.assertTrue(run_case({'steps': [dict(id=str(i), action='click', target={'css': '#button'},
                                                           expect={'text': 'done'}) for i in range(3)]}, target, Path(directory)))
                finally:
                    target.close()
                self.assertEqual(1, connect.call_count)
        self.assertTrue(socket.closed)
        commands = [x for x in socket.sent if not x['method'].startswith('Target.')]
        self.assertTrue(all(x.get('sessionId') == 'bound' for x in commands))
        self.assertEqual(6, sum(x['method'] == 'Input.dispatchMouseEvent' for x in commands))


if __name__ == '__main__':
    unittest.main()
