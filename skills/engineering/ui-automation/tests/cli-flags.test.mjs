import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../scripts/app-use.mjs', import.meta.url));

function run(args) {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 10000 });
  return { status: r.status, body: JSON.parse(r.stdout.trim()) };
}

test('unknown flag is rejected before any broker connection', () => {
  const r = run(['doctor', '--bogus']);
  assert.equal(r.status, 2);
  assert.equal(r.body.status, 'error');
  assert.match(r.body.error, /unknown flag: --bogus/);
});

test('a misspelled runtime flag is rejected instead of silently ignored', () => {
  const r = run(['prepare', '--runtim']);
  assert.equal(r.status, 2);
  assert.match(r.body.error, /unknown flag: --runtim/);
});

test('duplicate flag is rejected', () => {
  const r = run(['doctor', '--session', 'a', '--session', 'b']);
  assert.equal(r.status, 2);
  assert.match(r.body.error, /unique --flag value/);
});

test('unknown command is rejected without connecting to the broker', () => {
  const r = run(['not-a-command']);
  assert.equal(r.status, 2);
  assert.match(r.body.error, /^commands: /);
});

test('missing command is rejected without connecting to the broker', () => {
  const r = run([]);
  assert.equal(r.status, 2);
  assert.match(r.body.error, /^commands: /);
});
