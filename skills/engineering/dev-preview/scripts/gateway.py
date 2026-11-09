#!/usr/bin/env python3
"""WSL loopback preview gateway. Requires fixed-container Docker access on the host only."""
import argparse
import asyncio
import json
from pathlib import Path
import subprocess

CONTAINER = 'paperclip-local'
MANAGER = '/paperclip/runtime/dev-preview/bin/preview.py'


async def forward(reader, writer, target):
    upstream = None
    tasks = []
    try:
        if target is None:
            raise ConnectionError('unavailable')
        header = await asyncio.wait_for(reader.readuntil(b'\r\n\r\n'), 10)
        if len(header) > 65536:
            raise ValueError('header_too_large')
        lines = header.split(b'\r\n')
        upgrade = any(line.lower().startswith(b'upgrade:') for line in lines)
        lines = [line for line in lines if not line.lower().startswith(b'host:')
                 and (upgrade or not line.lower().startswith(b'connection:'))]
        lines = lines[:-2] + [f'Host: localhost:{target[1]}'.encode()]
        if not upgrade:
            lines.append(b'Connection: close')
        request = b'\r\n'.join(lines) + b'\r\n\r\n'
        up_reader, upstream = await asyncio.wait_for(asyncio.open_connection(*target), 5)
        upstream.write(request)
        await upstream.drain()

        async def pump(source, destination):
            while chunk := await source.read(65536):
                destination.write(chunk)
                await destination.drain()

        tasks = [asyncio.create_task(pump(reader, upstream)),
                 asyncio.create_task(pump(up_reader, writer))]
        await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    except (OSError, ValueError, asyncio.TimeoutError, asyncio.IncompleteReadError,
            asyncio.LimitOverrunError):
        if upstream is None:
            writer.write(b'HTTP/1.1 503 Service Unavailable\r\nContent-Length: 19\r\nConnection: close\r\n\r\nPreview unavailable')
            try:
                await writer.drain()
            except OSError:
                pass
    finally:
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        for stream in (upstream, writer):
            if stream:
                stream.close()
                try:
                    await stream.wait_closed()
                except OSError:
                    pass


def snapshot():
    # Commands and container identity are constants, never values from Agent-written records.
    output = subprocess.run(['docker', 'exec', '--user', '1000:1000', CONTAINER, 'python3', MANAGER, 'reconcile'],
                            check=True, capture_output=True, text=True, timeout=45)
    projects = json.loads(output.stdout)['projects']
    inspected = subprocess.run(['docker', 'inspect', '--format', '{{json .NetworkSettings.Networks}}', CONTAINER],
                               check=True, capture_output=True, text=True, timeout=10)
    networks = json.loads(inspected.stdout)
    network = networks.get('fubufu-internal')
    if not network:
        raise ValueError('expected_container_network_missing')
    return {item['slot_port']: (network['IPAddress'], item['port']) for item in projects
            if item['desired'] == 'running' and item['status'] == 'ready' and item['reachable']}


async def serve(ports, backend_offset=1000):
    routes = {}
    servers = []
    for port in ports:
        async def handle(reader, writer, slot=port):
            await forward(reader, writer, routes.get(slot))
        servers.append(await asyncio.start_server(handle, '127.0.0.1', port + backend_offset))
    print(json.dumps({'gateway': 'listening', 'slots': len(ports)}), flush=True)
    previous_error = None
    try:
        while True:
            try:
                current = await asyncio.to_thread(snapshot)
                routes.clear()
                routes.update(current)
                previous_error = None
            except Exception as error:
                routes.clear()
                name = type(error).__name__
                if previous_error != name:
                    print(json.dumps({'gateway': 'unavailable', 'error': name}), flush=True)
                previous_error = name
            await asyncio.sleep(5)
    finally:
        for server in servers:
            server.close()
            await server.wait_closed()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default='/opt/fubufu-dev-preview/config.json')
    args = parser.parse_args()
    config = json.loads(Path(args.config).read_text())
    asyncio.run(serve(config['slot_ports'], config.get('backend_offset', 1000)))
