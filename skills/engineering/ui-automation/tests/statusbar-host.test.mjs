import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { StatusBarHost } from '../scripts/statusbar-host.mjs';

test('capsule host accepts progress and stop before starting', async () => {
  const host = new StatusBarHost();
  host.push({ action: 'start' });
  await host.stop();
});

test('missing renderer is reported and its failed launch can be closed', async () => {
  const host = new StatusBarHost();
  const errors = [];
  host.start({
    program: path.join(os.tmpdir(), 'missing-capsule-' + randomUUID()),
    onError: error => errors.push(error),
  });
  host.push({ action: 'start' });
  await host.stop();
  assert.ok(errors.some(error => error.includes('ENOENT')), errors.join('\n'));
});
