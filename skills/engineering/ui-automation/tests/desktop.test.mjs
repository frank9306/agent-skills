import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppClient } from '../scripts/client.mjs';

test('current-user broker diagnoses readiness and rejects an expired window identity', async () => {
  const c = await AppClient.connect();
  try {
    assert.equal((await c.request('doctor')).userScoped, true);
    await assert.rejects(c.request('prepare', { kind: 'desktop', hwnd: '0', pid: 0 }), /window identity mismatch/);
    await assert.rejects(c.request('observe', { session: 'expired' }), /session unavailable/);
  } finally { c.close(); }
});
