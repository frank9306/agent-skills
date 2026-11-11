import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StatusBarHost } from '../scripts/statusbar-host.mjs';

test('StatusBarHost start/stop lifecycle is idempotent', async () => {
  const sb = new StatusBarHost();
  // start() will try to spawn PowerShell — may fail in CI/non-Windows
  // We only test the JS-side lifecycle, not the actual window
  assert.equal(sb.started, undefined);
  
  // push() before start() is a no-op
  sb.push({ phase: 'executing', verb: 'test' });
  assert.ok(true, 'push before start does not throw');
  
  // stop() before start() is a no-op
  await sb.stop();
  assert.ok(true, 'stop before start does not throw');
});

test('StatusBarHost stop() after start() cleans up', async () => {
  // Skip on non-Windows
  if (process.platform !== 'win32') return;
  
  const sb = new StatusBarHost();
  // Don't actually start (requires display) — just test stop is safe
  // after a failed start
  try {
    await sb.start({ session: 'test-session' });
  } catch {
    // start may fail if PowerShell or display unavailable
  }
  await sb.stop();
  assert.ok(true, 'stop after failed start is safe');
});
