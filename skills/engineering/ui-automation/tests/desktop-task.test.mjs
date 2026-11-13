import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { runDesktopTask } from '../scripts/desktop-task.mjs';
import { createJevGoalDecision } from '../scripts/jev.mjs';

test('a goal uses Jev across stages and hands off one decision in memory', async () => {
  const events = [], calls = [], decisions = [];
  const region = { x: 0, y: 0, width: 320, height: 280, description: 'Safe controls' };
  const target = { x: 30, y: 30, width: 40, height: 20, description: 'Open' };
  const image = { mime: 'image/png', data: 'YQ==', width: 640, height: 320 };
  const goal = { op: 'goal', goal: 'Open and verify', stages: [
    { name: 'open', instruction: 'Open', region, candidates: [target] },
    { name: 'verify', instruction: 'Verify completion', region, verify: true },
  ] };
  await runDesktopTask({
    input: Readable.from([JSON.stringify(goal) + '\n', '{"op":"resume-goal","observation":"latest","verified":true}\n']),
    target: { pid: 7 }, emit: event => events.push(event),
    capsule: { start() {}, push() {}, stop() {} },
    decideGoal: async request => {
      decisions.push(request);
      return decisions.length === 1 ? { target } : { reason: 'low-confidence' };
    },
    connect: async () => ({
      async request(method, params) {
        calls.push({ method, params });
        if (method === 'prepare') return { session: 'bound', hwnd: 1, pid: 7 };
        if (method === 'act') return { diagnostics: { foreground: { verified: true } } };
        if (method === 'visual-observe') return { id: 'latest', image };
        if (method === 'visual-crop') return { image: { ...image, data: 'Yg==', width: 320, height: 280 } };
        if (method === 'visual-click') return { actionExecuted: true };
      },
    }),
  });
  assert.deepEqual(events.map(event => event.kind).filter(Boolean), ['ready', 'fallback', 'goal-result']);
  assert.equal(events[1].image.data, 'YQ==');
  assert.equal(events[2].status, 'pass');
  assert.equal(decisions.length, 2);
  assert.ok(decisions.every(request => request.frame.data === 'Yg=='));
  assert.equal(calls.filter(call => call.method === 'visual-click').length, 1);
  assert.equal(calls.at(-1).method, 'stop');
});

test('a goal with no stage list stops on Jev visual completion', async () => {
  const events = [], calls = [];
  const region = { x: 0, y: 0, width: 320, height: 280, description: 'Safe controls' };
  const image = { mime: 'image/png', data: 'YQ==', width: 640, height: 320 };
  let clicks = 0;
  const result = await runDesktopTask({
    input: Readable.from([JSON.stringify({ op: 'goal', goal: 'Open the panel', completion: 'Panel open is shown', region }) + '\n']),
    target: { pid: 7 }, emit: event => events.push(event),
    capsule: { start() {}, push() {}, stop() {} },
    decideGoal: async ({ stage }) => {
      assert.equal(stage.completion, 'Panel open is shown');
      return clicks ? { verified: true } : { target: { x: 30, y: 30, width: 40, height: 20, description: 'Open panel' } };
    },
    connect: async () => ({
      async request(method) {
        calls.push(method);
        if (method === 'prepare') return { session: 'bound', hwnd: 1, pid: 7 };
        if (method === 'act') return { diagnostics: { foreground: { verified: true } } };
        if (method === 'visual-observe') return { id: 'latest', image };
        if (method === 'visual-crop') return { image: { ...image, data: clicks ? 'Yg==' : 'YQ==' } };
        if (method === 'visual-click') { clicks++; return { actionExecuted: true }; }
      },
    }),
  });
  assert.equal(result.status, 'pass');
  assert.equal(clicks, 1);
  assert.deepEqual(events.map(event => event.kind), ['ready', 'goal-result']);
  assert.deepEqual(events[1].stages.map(stage => stage.provider), ['jev', 'jev']);
  assert.equal(calls.at(-1), 'stop');
});

test('Jev boxes are mapped to the approved crop and padding cannot receive input', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = 'test-only';
  const frame = { data: 'YQ==', width: 280, height: 280 };
  const stage = { name: 'Open', instruction: 'Find Open', region: { x: 80, y: 30, width: 150, height: 100 } };
  let bottom = 0.25;
  globalThis.fetch = async (_url, { body }) => {
    const sent = JSON.parse(body);
    if (sent.questions.probe) return Response.json({ answers: {
      probe: { type: 'choice', choice: 'yes', confidence: 0.99 },
    } });
    assert.equal(sent.assets.screenshot.data_base64, frame.data);
    assert.equal(sent.questions.locate.type, 'box');
    return Response.json({ answers: {
      visible: { type: 'choice', choice: 'yes', confidence: 0.99 },
      locate: { type: 'box', box: { left: 0.1, right: 0.2, top: 0.1, bottom }, confidence: null },
    } });
  };
  try {
    const decide = createJevGoalDecision();
    assert.deepEqual(await decide({ frame, stage }), { target: { x: 108, y: 58, width: 28, height: 42, description: 'Open' } });
    bottom = 0.9;
    assert.deepEqual(await decide({ frame, stage }), { reason: 'box-outside-visible-region' });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test('a rejected Jev preflight never transmits the task crop', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = 'test-only';
  const sent = [];
  globalThis.fetch = async (_url, { body }) => {
    sent.push(JSON.parse(body));
    return Response.json({ status: 451 }, { status: 451 });
  };
  try {
    const decide = createJevGoalDecision();
    const frame = { data: 'task-crop', width: 280, height: 280 };
    const stage = { name: 'Private', instruction: 'Private task', verify: true, region: { x: 0, y: 0, width: 280, height: 280 } };
    for (let i = 0; i < 2; i++) assert.equal((await decide({ frame, stage })).status, 451);
    assert.equal(sent.length, 1);
    assert.ok(sent[0].questions.probe);
    assert.doesNotMatch(JSON.stringify(sent[0]), /task-crop|Private task/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test('Jev selects only a declared click and preserves the frame on fallback', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TYPESAFE_API_KEY;
  const originalLocalAppData = process.env.LOCALAPPDATA;
  process.env.TYPESAFE_API_KEY = 'test-only';
  delete process.env.LOCALAPPDATA;
  const candidates = [
    { x: 10, y: 10, width: 30, height: 20, description: 'Leaderboard' },
    { x: 50, y: 10, width: 30, height: 20, description: 'Yesterday' },
  ];
  const op = { op: 'jev-click', observation: 'frame', question: 'Which opens the leaderboard?', candidates };
  try {
    for (const answer of [
      { type: 'choice', choice: 'candidate_1', confidence: 0.99 },
      { type: 'choice', choice: 'candidate_1', confidence: 0.70 },
      { type: 'choice', choice: 'candidate_9', confidence: 1 },
      null,
      undefined,
    ]) {
      const clicks = [];
      const events = [];
      const manual = !answer || answer.confidence < 0.95 || answer.choice === 'candidate_9';
      globalThis.fetch = async (url, { body }) => {
        assert.notEqual(answer, undefined, 'missing credentials must skip HTTP');
        assert.equal(url, 'https://api.typesafe.ai/v1/systemone');
        const sent = JSON.parse(body);
        if (sent.questions.probe) return Response.json({ answers: {
          probe: { type: 'choice', choice: 'yes', confidence: 0.99 },
        } });
        assert.equal(sent.assets.screenshot.data_base64, 'YQ==');
        return Response.json({ answers: { next: answer } }, { status: answer ? 200 : 503 });
      };
      if (answer === undefined) delete process.env.TYPESAFE_API_KEY;
      await runDesktopTask({
        input: Readable.from([
          '{"op":"capture","inline":true}\n', JSON.stringify(op) + '\n',
          ...(manual ? [JSON.stringify({ op: 'click', observation: 'frame', target: candidates[0] }) + '\n'] : []),
          '{"op":"finish","outcome":"pass"}\n',
        ]),
        target: {}, emit: event => events.push(event),
        capsule: { start() {}, push() {}, stop() {} },
        connect: async () => ({
          async request(method, params) {
            if (method === 'prepare') return { session: 'bound' };
            if (method === 'act') return { diagnostics: { foreground: { verified: true } } };
            if (method === 'visual-observe') return { id: 'frame', image: { mime: 'image/png', data: 'YQ==', width: 640, height: 320 } };
            if (method === 'visual-click') {
              clicks.push(params.target);
              return { actionExecuted: true };
            }
          },
        }),
      });
      assert.equal(events[2].kind, manual ? 'jev-fallback' : 'action');
      if (answer === undefined) assert.equal(events[2].reason, 'credential-unavailable');
      assert.deepEqual(clicks, [candidates[0]]);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = originalKey;
    if (originalLocalAppData !== undefined) process.env.LOCALAPPDATA = originalLocalAppData;
  }
});

test('inline screenshot and one batch are emitted without an intermediate capture', async () => {
  const events = [];
  const calls = [];
  const input = Readable.from([
    '{"op":"capture","inline":true}\n',
    '{"op":"batch","observation":"frame","steps":[{"target":{}},{"target":{}}]}\n',
    '{"op":"finish","outcome":"pass"}\n',
  ]);
  await runDesktopTask({
    input, target: {}, emit: event => events.push(event),
    capsule: { start() {}, push() {}, stop() {} },
    connect: async () => ({
      async request(method, params) {
        calls.push(method);
        if (method === 'prepare') return { session: 'bound' };
        if (method === 'act') return { diagnostics: { foreground: { verified: true } } };
        if (method === 'visual-observe') return { id: 'frame', image: { mime: 'image/png', data: 'YQ==' } };
        if (method === 'visual-batch') return { completed: params.steps.length };
      },
    }),
  });
  assert.deepEqual(calls, ['prepare', 'act', 'visual-observe', 'visual-batch', 'stop']);
  assert.equal(events[1].image.data, 'YQ==');
  assert.equal(events[1].image.path, undefined);
  assert.equal(events[2].completed, 2);
});

test('a live desktop task owns one capsule, screenshot and broker session through wait and finish', async () => {
  const phases = [];
  const commands = [];
  let image;
  const client = {
    async request(method) {
      commands.push(method);
      if (method === 'prepare') return { kind: 'desktop', session: 'bound', hwnd: 42, pid: 7 };
      if (method === 'visual-observe') return { id: 'frame', image: { mime: 'image/png', data: 'YQ==' } };
      return { diagnostics: { foreground: { verified: true } } };
    },
  };
  const capsule = {
    start: () => phases.push('launch'),
    push: ({ action }) => phases.push(action),
    stop: async () => phases.push('close'),
  };
  const result = await runDesktopTask({
    connect: async () => client, capsule, target: { hwnd: '42', pid: 7 },
    input: Readable.from(['{"op":"capture"}\n{"op":"wait"}\n{"op":"finish","outcome":"pass"}\n']),
    emit: result => { image ??= result.image; },
  });
  assert.equal(result.status, 'pass');
  assert.deepEqual(phases, ['launch', 'start', 'target', 'focus', 'capture', 'wait', 'pass', 'close']);
  assert.deepEqual(commands, ['prepare', 'act', 'visual-observe', 'stop']);
  assert.equal(image.data, 'YQ==');
  assert.equal(image.path, undefined);
});
