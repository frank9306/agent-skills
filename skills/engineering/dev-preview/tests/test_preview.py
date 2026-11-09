import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'preview.py'


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


@unittest.skipUnless(sys.platform.startswith('linux'), 'Linux process ownership contract')
class PreviewContract(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.project = self.root / 'project'
        self.project.mkdir()
        self.state = self.root / 'state'
        self.state.mkdir()
        (self.state / 'config.json').write_text(json.dumps({
            'allowed_roots': [str(self.project)], 'preview_host': 'fixture.example.ts.net',
            'scheme': 'http', 'slot_ports': [18450, 18451],
        }))

    def cli(self, *args, ok=True):
        r = subprocess.run([sys.executable, str(SCRIPT), '--state-dir', str(self.state), *args],
                           capture_output=True, text=True, timeout=20)
        if ok:
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        return json.loads(r.stdout)

    def start(self, name='one', port=None, command=None, ok=True, cwd=None):
        port = port or free_port()
        command = command or [sys.executable, '-m', 'http.server', str(port), '--bind', '0.0.0.0']
        return self.cli('start', '--project', name, '--cwd', str(cwd or self.project),
                        '--port', str(port), '--revision', 'fixture-v1', '--ready-timeout', '2',
                        '--', *command, ok=ok)

    def tearDown(self):
        if SCRIPT.exists():
            try:
                for item in self.cli('list')['projects']:
                    self.cli('stop', '--project', item['project'])
            except Exception:
                pass
        self.tmp.cleanup()

    def test_ready_persists_after_caller_exit_and_start_is_idempotent(self):
        first = self.start()
        self.assertEqual(first['status'], 'ready')
        self.assertTrue(first['reachable'])
        self.assertEqual(first['preview_url'], 'http://fixture.example.ts.net:18450/')
        second = self.start(port=first['port'])
        self.assertEqual(first['pid'], second['pid'])
        self.assertEqual(second['attempts'], 1)
        conflict = self.start(port=free_port(), ok=False)
        self.assertEqual(conflict['error'], 'registration_conflict')
        self.assertEqual(self.cli('status', '--project', 'one')['pid'], first['pid'])

    def test_stop_disables_recovery_and_preserves_other_project(self):
        one = self.start()
        two = self.start('two')
        self.cli('stop', '--project', 'one')
        self.cli('reconcile')
        self.assertEqual(self.cli('status', '--project', 'one')['status'], 'stopped')
        self.assertTrue(self.cli('status', '--project', 'two')['reachable'])
        with self.assertRaises(ProcessLookupError):
            os.kill(one['pid'], 0) if not Path(f'/proc/{one["pid"]}/stat').exists() else self._assert_dead(one['pid'])
        self.assertEqual(two['slot_port'], 18451)

    def _assert_dead(self, pid):
        if Path(f'/proc/{pid}/stat').read_text().split(') ', 1)[1].split()[0] == 'Z':
            raise ProcessLookupError()
        self.fail('owned process remains alive')

    def test_occupied_port_is_not_adopted_or_killed(self):
        with socket.socket() as listener:
            listener.bind(('0.0.0.0', 0))
            listener.listen()
            result = self.start(port=listener.getsockname()[1], ok=False)
            self.assertEqual(result['last_error'], 'port_occupied')
            self.assertIsNone(result.get('pid'))
            self.assertEqual(listener.fileno() >= 0, True)

    def test_failed_command_and_restart_budget_are_bounded(self):
        result = self.start(command=[sys.executable, '-c', 'raise SystemExit(7)'], ok=False)
        for _ in range(8):
            self.cli('reconcile')
            time.sleep(0.05)
        result = self.cli('status', '--project', 'one')
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['attempts'], 3)
        before = result['attempts']
        self.start(port=result['port'], command=[sys.executable, '-c', 'raise SystemExit(7)'], ok=False)
        self.assertEqual(self.cli('status', '--project', 'one')['attempts'], before)

    def test_crashed_owned_process_recovers(self):
        first = self.start()
        os.killpg(first['pid'], signal.SIGKILL)
        time.sleep(0.05)
        self.cli('reconcile')
        time.sleep(0.3)
        self.cli('reconcile')
        recovered = self.cli('status', '--project', 'one')
        self.assertEqual(recovered['status'], 'ready')
        self.assertNotEqual(first['pid'], recovered['pid'])
        self.assertEqual(recovered['attempts'], 2)

    def test_allowed_root_and_slot_capacity(self):
        result = self.start(cwd=self.root, ok=False)
        self.assertEqual(result['error'], 'project_directory_not_authorized')
        self.start()
        self.start('two')
        self.assertEqual(self.start('three', ok=False)['error'], 'preview_capacity_exhausted')

    def test_configured_home_development_and_no_agent_credentials(self):
        config=json.loads((self.state/'config.json').read_text())
        config['home']=str(self.project)
        (self.state/'config.json').write_text(json.dumps(config))
        port=free_port()
        command=[sys.executable,'-c',
                 'import os;from http.server import HTTPServer,SimpleHTTPRequestHandler;'
                 'assert os.environ["HOME"]==os.getcwd();'
                 'assert os.environ["NODE_ENV"]=="development";'
                 'assert "OPENAI_API_KEY" not in os.environ and "PAPERCLIP_API_KEY" not in os.environ;'
                 f'HTTPServer(("0.0.0.0",{port}),SimpleHTTPRequestHandler).serve_forever()']
        with patch.dict(os.environ,{'HOME':'/wrong','NODE_ENV':'production',
                                    'OPENAI_API_KEY':'test-sentinel','PAPERCLIP_API_KEY':'test-sentinel'}):
            self.assertEqual(self.start(port=port,command=command)['status'],'ready')


if __name__ == '__main__':
    unittest.main()
