import test from 'node:test';
import assert from 'node:assert/strict';
import { StatusBarState, normalize, PHASES } from '../scripts/statusbar-client.mjs';

const base = (over = {}) => ({
  session: 's1', runId: 'r1', seq: 1, at: Date.now(), phase: 'act',
  verb: 'click', target: '「提交订单」按钮', app: 'Chrome',
  actionExecuted: true, goalVerified: false, ...over
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('normalize keeps only whitelisted fields', () => {
  const { value, error } = normalize({ ...base(), cookie: 'secret', pageText: 'body', secretEnv: 'p@ss' });
  assert.equal(error, undefined);
  assert.equal(value.cookie, undefined);
  assert.equal(value.pageText, undefined);
  assert.equal(value.secretEnv, undefined);
  assert.equal(value.verb, 'click');
});

test('normalize bounds target and rejects malformed events', () => {
  assert.equal(normalize(base({ target: 'x'.repeat(500) })).value.target.length, 80);
  assert.match(normalize(base({ phase: 'nope' })).error, /unknown phase/);
  assert.match(normalize(base({ session: '' })).error, /session required/);
  assert.match(normalize({ ...base(), seq: -1 }).error, /seq/);
  assert.equal(PHASES.includes('unknown'), true);
});

test('accepts a valid event, emits change and exposes current', () => {
  const state = new StatusBarState();
  const seen = [];
  state.on('change', e => seen.push(e));
  assert.deepEqual(state.push(base()), { accepted: true });
  assert.equal(state.current.phase, 'act');
  assert.equal(seen.length, 1);
  state.stop();
});

test('drops stale sequence, duplicate and expired events', () => {
  const state = new StatusBarState();
  assert.deepEqual(state.push(base({ seq: 5 })), { accepted: true });
  assert.match(state.push(base({ seq: 5 })).reason, /stale/);
  assert.match(state.push(base({ seq: 3 })).reason, /stale/);
  assert.match(state.push(base({ seq: 6, expiresAt: Date.now() - 1 })).reason, /expired/);
  assert.equal(state.current.seq, 5);
  state.stop();
});

test('heartbeat silence turns state to unknown then hides', async () => {
  const state = new StatusBarState({ heartbeatMs: 20, hideMs: 50 });
  const phases = [];
  let hides = 0;
  state.on('change', e => phases.push(e.phase));
  state.on('hide', () => hides++);
  state.push(base());
  await wait(90);
  assert.deepEqual(phases, ['act', 'unknown']);
  assert.equal(hides, 1);
  assert.equal(state.stopped, true);
  assert.equal(state.current.actionExecuted, false);
  assert.equal(state.current.goalVerified, false);
});

test('a fresh event cancels the pending hide', async () => {
  const state = new StatusBarState({ heartbeatMs: 30, hideMs: 120 });
  let hides = 0;
  state.on('hide', () => hides++);
  state.push(base({ seq: 1 }));
  await wait(40);
  assert.equal(state.current.phase, 'unknown');
  state.push(base({ seq: 2, phase: 'validate' }));
  assert.equal(state.current.phase, 'validate');
  await wait(50);
  assert.equal(hides, 0);
  state.stop();
});

test('stop clears timers and emits hide exactly once', async () => {
  const state = new StatusBarState({ heartbeatMs: 20, hideMs: 40 });
  let hides = 0;
  state.on('hide', () => hides++);
  state.push(base());
  state.stop();
  state.stop();
  await wait(80);
  assert.equal(hides, 1);
  assert.equal(state.stopped, true);
  assert.equal(state.push(base({ seq: 2 })).reason, 'stopped');
});
