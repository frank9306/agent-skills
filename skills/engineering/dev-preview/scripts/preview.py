#!/usr/bin/env python3
"""Persistent Linux dev services. CLI JSON is the public interface; state/logs are private."""
import argparse
from contextlib import contextmanager
import fcntl
import http.client
import json
import os
from pathlib import Path
import re
import signal
import socket
import subprocess
import sys
import time


class PreviewError(Exception):
    pass


class Preview:
    def __init__(self, directory):
        self.directory = Path(directory).resolve()
        self.config = json.loads((self.directory / 'config.json').read_text())

    @contextmanager
    def registry(self):
        with (self.directory / 'registry.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            path = self.directory / 'registry.json'
            data = json.loads(path.read_text()) if path.exists() else {'projects': {}}
            yield data['projects']
            temporary = path.with_suffix('.tmp')
            temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2))
            temporary.replace(path)

    @staticmethod
    def identity(pid):
        try:
            fields = Path(f'/proc/{pid}/stat').read_text().rsplit(') ', 1)[1].split()
            return None if fields[0] == 'Z' else fields[19]
        except (FileNotFoundError, ProcessLookupError):
            return None

    def owned(self, item):
        pid = item.get('pid')
        try:
            return bool(pid and item.get('start_ticks') and
                        self.identity(pid) == item['start_ticks'] and os.getpgid(pid) == pid)
        except ProcessLookupError:
            return False

    @staticmethod
    def port_free(port):
        with socket.socket() as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(('0.0.0.0', port))
                return True
            except OSError:
                return False

    @staticmethod
    def reachable(item):
        connection = http.client.HTTPConnection('127.0.0.1', item['port'], timeout=1)
        try:
            connection.request('GET', item['health_path'])
            return connection.getresponse().status == 200
        except Exception:
            return False
        finally:
            connection.close()

    def view(self, item):
        result = dict(item)
        result['owned_process_alive'] = self.owned(item)
        result['reachable'] = result['owned_process_alive'] and self.reachable(item)
        result['local_url'] = f'http://127.0.0.1:{item["port"]}/'
        result['preview_url'] = f'{self.config["scheme"]}://{self.config["preview_host"]}:{item["slot_port"]}/'
        result['log_path'] = str(self.directory / 'logs' / (item['project'] + '.log'))
        if result['status'] == 'ready' and not result['reachable']:
            result['status'] = 'unavailable'
        return result

    def terminate(self, item):
        if self.owned(item):
            os.killpg(item['pid'], signal.SIGTERM)
            deadline = time.monotonic() + 3
            while self.owned(item) and time.monotonic() < deadline:
                time.sleep(0.05)
            if self.owned(item):
                os.killpg(item['pid'], signal.SIGKILL)

    def spawn(self, item):
        if not self.port_free(item['port']):
            item.update(status='failed', last_error='port_occupied')
            return
        if item['attempts'] >= 3:
            item.update(status='failed', last_error='recovery_budget_exhausted')
            return
        logs = self.directory / 'logs'
        logs.mkdir(exist_ok=True)
        # Never inherit temporary Agent identity, board credentials, or model API keys.
        env = {k: v for k, v in os.environ.items()
               if not k.startswith(('PAPERCLIP_', 'OPENAI_', 'ANTHROPIC_', 'CODEX_'))}
        env.update(NODE_ENV='development', PORT=str(item['port']), BROWSER='none')
        item['attempts'] += 1
        try:
            with (logs / (item['project'] + '.log')).open('ab', buffering=0) as log:
                log.write(f'\n[dev-preview launch {item["attempts"]} {time.time()}]\n'.encode())
                child = subprocess.Popen(item['command'], cwd=item['cwd'], env=env,
                                         stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                                         start_new_session=True, close_fds=True)
            item.update(pid=child.pid, start_ticks=self.identity(child.pid),
                        status='starting', launched_at=time.time(), health_failures=0,
                        last_error=None)
        except (OSError, ValueError) as error:
            item.update(pid=None, start_ticks=None, status='starting',
                        launched_at=time.time(), last_error=type(error).__name__)

    def reconcile(self):
        with self.registry() as projects:
            for item in projects.values():
                if item['desired'] != 'running':
                    self.terminate(item)
                    item['status'] = 'stopped'
                    continue
                if item['status'] == 'failed':
                    continue
                if not self.owned(item):
                    self.spawn(item)
                    continue
                if self.reachable(item):
                    item.update(status='ready', health_failures=0, last_error=None)
                elif item['status'] == 'starting':
                    if time.time() - item['launched_at'] > item['ready_timeout']:
                        self.terminate(item)
                        item.update(last_error='readiness_timeout', status='recovering')
                else:
                    item['health_failures'] = item.get('health_failures', 0) + 1
                    if item['health_failures'] >= 3:
                        self.terminate(item)
                        item.update(last_error='health_check_failed', status='recovering')
            return {'projects': [self.view(item) for item in projects.values()]}

    def start(self, args):
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,47}', args.project):
            raise PreviewError('invalid_project_alias')
        cwd = Path(args.cwd).resolve()
        roots = [Path(root).resolve() for root in self.config['allowed_roots']]
        if not cwd.is_dir() or not any(cwd == root or root in cwd.parents for root in roots):
            raise PreviewError('project_directory_not_authorized')
        command = args.command[1:] if args.command[:1] == ['--'] else args.command
        if not command or not 1024 <= args.port <= 65535 or args.port == 3100:
            raise PreviewError('invalid_command_or_port')
        if not args.health_path.startswith('/') or any(c in args.health_path for c in '\r\n?#'):
            raise PreviewError('invalid_health_path')
        spec = dict(project=args.project, cwd=str(cwd), port=args.port, command=command,
                    revision=args.revision, health_path=args.health_path,
                    ready_timeout=args.ready_timeout)
        with self.registry() as projects:
            old = projects.get(args.project)
            if old and old['desired'] == 'running':
                if any(old[k] != value for k, value in spec.items()):
                    raise PreviewError('registration_conflict')
            else:
                active = [item for item in projects.values() if item['desired'] == 'running']
                if any(item['port'] == args.port for item in active):
                    raise PreviewError('dev_port_already_registered')
                used = {item['slot_port'] for item in active}
                slot = next((port for port in self.config['slot_ports'] if port not in used), None)
                if slot is None:
                    raise PreviewError('preview_capacity_exhausted')
                projects[args.project] = dict(spec, slot_port=slot, desired='running',
                                             status='registered', attempts=0, pid=None,
                                             start_ticks=None, last_error=None)
        deadline = time.monotonic() + args.ready_timeout * 3 + 4
        while True:
            self.reconcile()
            result = self.status(args.project)
            if result['status'] in ('ready', 'failed') or time.monotonic() >= deadline:
                return result
            time.sleep(0.2)

    def status(self, project=None):
        with self.registry() as projects:
            if project is None:
                return {'projects': [self.view(item) for item in projects.values()]}
            if project not in projects:
                raise PreviewError('project_not_registered')
            return self.view(projects[project])

    def stop(self, project):
        with self.registry() as projects:
            if project not in projects:
                raise PreviewError('project_not_registered')
            projects[project]['desired'] = 'stopped'
        # Desired state reaches disk before signalling, so a crash cannot re-enable recovery.
        self.reconcile()
        return self.status(project)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir', default='/paperclip/runtime/dev-preview/state')
    commands = parser.add_subparsers(dest='operation', required=True)
    start = commands.add_parser('start')
    start.add_argument('--project', required=True)
    start.add_argument('--cwd', required=True)
    start.add_argument('--port', type=int, required=True)
    start.add_argument('--revision', required=True)
    start.add_argument('--health-path', default='/')
    start.add_argument('--ready-timeout', type=float, default=30)
    start.add_argument('command', nargs=argparse.REMAINDER)
    for operation in ('status', 'stop'):
        commands.add_parser(operation).add_argument('--project', required=True)
    commands.add_parser('list')
    commands.add_parser('reconcile')
    args = parser.parse_args()
    try:
        manager = Preview(args.state_dir)
        if manager.config.get('home'):
            os.environ['HOME'] = manager.config['home']
        run_uid = manager.config.get('run_uid')
        if run_uid is not None and os.geteuid() == 0:
            os.setgroups([int(run_uid)])
            os.setgid(int(run_uid))
            os.setuid(int(run_uid))
        if args.operation == 'start':
            if not 0.1 <= args.ready_timeout <= 120:
                raise PreviewError('invalid_readiness_timeout')
            result = manager.start(args)
        elif args.operation == 'stop':
            result = manager.stop(args.project)
        elif args.operation == 'reconcile':
            result = manager.reconcile()
        else:
            result = manager.status(args.project if args.operation == 'status' else None)
        print(json.dumps(result, ensure_ascii=False))
        return 0 if args.operation != 'start' or result['status'] == 'ready' else 2
    except (PreviewError, OSError, ValueError) as error:
        print(json.dumps({'error': str(error)}))
        return 2


if __name__ == '__main__':
    sys.exit(main())
