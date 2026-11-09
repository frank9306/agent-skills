import asyncio
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('gateway', Path(__file__).resolve().parents[1] / 'scripts/gateway.py')
gateway = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gateway)


class GatewayContract(unittest.IsolatedAsyncioTestCase):
    async def test_http_host_rewrite_and_response(self):
        requests = []

        async def backend(reader, writer):
            requests.append(await reader.readuntil(b'\r\n\r\n'))
            writer.write(b'HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok')
            await writer.drain()
            writer.close()

        async with await asyncio.start_server(backend, '127.0.0.1', 0) as server:
            port = server.sockets[0].getsockname()[1]
            async with await asyncio.start_server(lambda r,w: gateway.forward(r,w,('127.0.0.1',port)), '127.0.0.1',0) as proxy:
                reader, writer = await asyncio.open_connection('127.0.0.1',proxy.sockets[0].getsockname()[1])
                writer.write(b'GET /assets/app.js HTTP/1.1\r\nHost: private.example.ts.net:18450\r\nConnection: keep-alive\r\n\r\n')
                await writer.drain()
                response = await asyncio.wait_for(reader.read(), 3)
                self.assertTrue(response.endswith(b'\r\n\r\nok'))
                self.assertIn(f'Host: localhost:{port}'.encode(), requests[0])
                self.assertIn(b'Connection: close', requests[0])
                self.assertIn(b'GET /assets/app.js ', requests[0])
                writer.close()
                await writer.wait_closed()

    async def test_websocket_upgrade_and_bidirectional_bytes(self):
        async def backend(reader, writer):
            request = await reader.readuntil(b'\r\n\r\n')
            self.assertIn(b'Upgrade: websocket', request)
            writer.write(b'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n')
            await writer.drain()
            writer.write(await reader.readexactly(6))
            await writer.drain()
            writer.close()

        async with await asyncio.start_server(backend,'127.0.0.1',0) as server:
            target=('127.0.0.1',server.sockets[0].getsockname()[1])
            async with await asyncio.start_server(lambda r,w: gateway.forward(r,w,target),'127.0.0.1',0) as proxy:
                reader,writer=await asyncio.open_connection('127.0.0.1',proxy.sockets[0].getsockname()[1])
                writer.write(b'GET /hmr HTTP/1.1\r\nHost: private.example.ts.net\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n')
                await writer.drain()
                self.assertIn(b'101 Switching Protocols',await asyncio.wait_for(reader.readuntil(b'\r\n\r\n'),3))
                writer.write(b'\x81\x04ping')
                await writer.drain()
                self.assertEqual(await asyncio.wait_for(reader.readexactly(6),3),b'\x81\x04ping')
                writer.close()
                await writer.wait_closed()

    async def test_unregistered_slot_returns_unavailable(self):
        async with await asyncio.start_server(lambda r,w: gateway.forward(r,w,None),'127.0.0.1',0) as proxy:
            reader,writer=await asyncio.open_connection('127.0.0.1',proxy.sockets[0].getsockname()[1])
            self.assertIn(b'503 Service Unavailable',await asyncio.wait_for(reader.read(),3))
            writer.close()
            await writer.wait_closed()


if __name__ == '__main__':
    unittest.main()
