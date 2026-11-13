import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { AppClient } from '../scripts/client.mjs';
import { fixture } from './helpers/foreground-fixture.mjs';

const cli = fileURLToPath(new URL('../scripts/ui-automation.mjs', import.meta.url));
const execute = promisify(execFile);
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const clock = () => performance.now();
const median = values => Number([...values].sort((a, b) => a - b)[Math.floor(values.length / 2)].toFixed(2));

async function assertClicks(window, expected, label) {
  const deadline = clock() + 500;
  let count = (await window.state()).clicks;
  while (count < expected && clock() < deadline) {
    await delay(10);
    count = (await window.state()).clicks;
  }
  assert.equal(count, expected, label);
}

async function rendererIds(taskPid) {
  const { stdout } = await execute('pwsh', ['-NoProfile', '-Command',
    `(Get-CimInstance Win32_Process -Filter "ParentProcessId = ${taskPid} AND Name = 'status-bar.exe'").ProcessId`],
  { windowsHide: true, timeout: 5000 });
  return stdout.trim().split(/\s+/).filter(Boolean).map(Number);
}

async function runTask(config, target, outcome, run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-guard-test-'));
  const file = path.join(dir, 'runtime.json');
  await fs.writeFile(file, JSON.stringify(config));
  const started = clock();
  const child = spawn(process.execPath, [cli, 'desktop-task', '--hwnd', String(target.hwnd), '--pid', String(target.pid)], {
    env: { ...process.env, UI_AUTOMATION_HOME: dir }, windowsHide: true,
  });
  const closed = once(child, 'close');
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  let stderr = '';
  child.stderr.on('data', data => { stderr += data; });
  let session;
  try {
    const next = async () => {
      const result = await lines.next();
      assert.equal(result.done, false, stderr || 'desktop task closed before its reply');
      return JSON.parse(result.value);
    };
    const send = data => child.stdin.write(JSON.stringify(data) + '\n');
    const op = async data => { send(data); return next(); };
    const ready = await next();
    const startupMs = clock() - started;
    assert.equal(ready.kind, 'ready');
    session = ready.identity.session;
    const renderers = await rendererIds(child.pid);
    assert.equal(renderers.length, 1, 'expected one live capsule');
    const capture = await op({ op: 'capture' });
    assert.equal(capture.kind, 'capture');
    assert.equal(capture.image.path, undefined);
    assert.ok(capture.image.data);
    const result = await run(op);
    const finish = clock();
    if (outcome === 'pass') send({ op: 'finish', outcome });
    child.stdin.end();
    const response = await next();
    const [code, signal] = await closed;
    const exitMs = clock() - finish;
    assert.deepEqual([code, signal], [outcome === 'pass' ? 0 : 2, null], stderr);
    assert.equal(response.status, outcome);
    assert.throws(() => process.kill(renderers[0], 0), { code: 'ESRCH' }, 'capsule must exit');
    assert.throws(() => process.kill(child.pid, 0), { code: 'ESRCH' }, 'task must exit');
    const client = await AppClient.connect({ config });
    try { await assert.rejects(client.request('visual-observe', { session }), /session/i); }
    finally { client.close(); }
    return { ...result, startupMs, exitMs, totalMs: clock() - started };
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.stdin.end();
      await Promise.race([closed, new Promise(resolve => setTimeout(resolve, 2500))]);
      if (child.exitCode === null && child.signalCode === null) child.kill();
      await closed;
    }
    await fs.unlink(file);
    await fs.rmdir(dir);
  }
}

test('Windows scoped click safety, before/after timing, and process teardown', { timeout: 55_000 }, async () => {
  assert.ok(process.env.UI_AUTOMATION_BASELINE_CONFIG && process.env.UI_AUTOMATION_REPAIRED_CONFIG,
    'baseline and repaired runtime.json paths are required');
  const { executable, pipe, version } = await read(process.env.UI_AUTOMATION_BASELINE_CONFIG);
  const baseline = { executable, pipe, version };
  const repaired = await read(process.env.UI_AUTOMATION_REPAIRED_CONFIG);
  const window = await fixture('scoped-guard');
  const fixtureClosed = once(window.child, 'close');
  try {
    assert.ok(window.target && window.guardRegion, 'use the scoped-guard fixture build');
    for (const [version, config] of [['baseline', baseline], ['repaired', repaired]]) {
      const result = await runTask(config, window, 'pass', async op => {
        const timings = {};
        for (const scenario of ['stable', 'outside', 'inside']) {
          const captureMs = [], clickMs = [];
          let retries = 0;
          const shouldClick = scenario === 'stable' || (scenario === 'outside' && version === 'repaired');
          for (let i = 0; i < 10; i++) {
            const before = await window.state();
            let captureTime = 0, clickTime = 0, action;
            for (let attempt = 0; attempt < 3; attempt++) {
              let start = clock();
              const capture = await op({ op: 'capture', inline: true });
              captureTime += clock() - start;
              assert.equal(capture.kind, 'capture');
              if (scenario !== 'stable') await window.state(scenario);
              start = clock();
              action = await op({ op: 'click', observation: capture.id, target: window.target,
                ...(version === 'repaired' ? { guardRegion: window.guardRegion } : {}),
              });
              clickTime += clock() - start;
              if (!shouldClick || attempt === 2 ||
                  !/pointer moved before dispatch|after pointer placement/.test(action.error ?? '')) break;
              await assertClicks(window, before.clicks, 'interrupted pointer did not click');
              retries++;
            }
            if (shouldClick) assert.equal(action.actionExecuted, true, `${version}/${scenario}: ${JSON.stringify(action)}`);
            else assert.match(action.error, /screenshot changed/);
            await assertClicks(window, before.clicks + Number(shouldClick), `${version}/${scenario}: click count`);
            if (i > 0) { captureMs.push(captureTime); clickMs.push(clickTime); }
          }
          timings[scenario] = { samples: 9, retries, clicked: shouldClick, captureMedianMs: median(captureMs), clickMedianMs: median(clickMs) };
        }
        if (version === 'repaired') {
          const before = await window.state();
          const capture = await op({ op: 'capture', inline: true });
          await window.state('outside');
          const action = await op({ op: 'click', observation: capture.id, target: window.target });
          assert.match(action.error, /screenshot changed/, 'the repaired runtime still uses the full window by default');
          await assertClicks(window, before.clicks, 'default full-window rejection did not click');
        }
        return { timings };
      });
      console.log(JSON.stringify({ version, ...result }));
    }
    const eof = await runTask(repaired, window, 'stopped', async () => ({}));
    console.log(JSON.stringify({ version: 'repaired-eof', ...eof }));
  } finally {
    window.close();
    await fixtureClosed;
  }
});
