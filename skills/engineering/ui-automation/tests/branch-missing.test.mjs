import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCase } from '../scripts/runner.mjs';

const observation = () => ({
  id: 'fresh', complete: true, identity: { kind: 'controlled', version: '1' },
  nodes: [
    { id: 'button', name: 'Apply', role: 'button', enabled: true, visible: true },
    { id: 'result', name: 'Result', role: 'textbox', value: 'Ready', enabled: true, visible: true }
  ]
});

function boundary() {
  return {
    async request(method) {
      if (method === 'observe') return observation();
      if (method === 'act') return { actionExecuted: true, goalVerified: false, observation: observation() };
      if (method === 'capture') return { mime: 'image/png', data: Buffer.from('controlled').toString('base64') };
      if (method === 'stop') return { stopped: true };
      throw Error('unsupported boundary method');
    }
  };
}

test('a branch rule whose target is absent falls through to otherwise instead of aborting the case', async () => {
  const script = {
    version: 1, id: 'branch-missing', session: 'controlled-session', start: 'decide',
    states: {
      decide: {
        branch: {
          rules: [{ when: { target: { name: 'AbsentControl' }, property: 'value', equals: 'anything' }, next: 'done' }],
          otherwise: 'goal'
        }
      },
      goal: { assert: { target: { name: 'Result' }, property: 'value', equals: 'Ready' }, next: 'done' },
      done: { finish: 'complete' }
    }
  };
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'app-use-branch-'));
  const result = await runCase(boundary(), script, { outDir });
  assert.equal(result.status, 'pass');
  assert.ok(result.events.some(e => e.kind === 'rule' && e.next === 'goal'));
});
