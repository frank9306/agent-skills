import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Evidence, inspectRun, runningBinary } from '../scripts/evidence.mjs';

const digest = b => createHash('sha256').update(b).digest('hex');

async function makeRun() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ui-automation-evidence-'));
  const project = path.join(root, 'project');
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, 'input.txt'), 'hello');
  const outDir = path.join(root, 'runs');
  const evidence = await Evidence.begin({ projectRoot: project, inputs: ['input.txt'] }, { outDir });
  const done = await evidence.finish('pass', {});
  return { root, outDir, runDir: done.runDir };
}

test('finish writes a ledger entry and inspectRun verifies it', async () => {
  const { outDir, runDir } = await makeRun();
  const result = await inspectRun(runDir);
  assert.equal(result.integrity, 'verified');
  assert.equal(result.ledger, 'verified');
  const ledger = await fs.readFile(path.join(outDir, 'ledger.jsonl'), 'utf8');
  assert.match(ledger, new RegExp(path.basename(runDir)));
  assert.match(ledger, /reportSha256/);
});

test('tampering with report.json breaks verification', async () => {
  const { runDir } = await makeRun();
  const file = path.join(runDir, 'report.json');
  const report = JSON.parse(await fs.readFile(file, 'utf8'));
  report.status = 'pass';
  report.ended = '2000-01-01T00:00:00.000Z';
  await fs.writeFile(file, JSON.stringify(report, null, 2), 'utf8');
  const result = await inspectRun(runDir);
  assert.equal(result.status, 'unverified');
});

test('tampering with the ledger entry breaks verification', async () => {
  const { outDir, runDir } = await makeRun();
  const file = path.join(outDir, 'ledger.jsonl');
  const rows = (await fs.readFile(file, 'utf8')).trim().split('\n').map(line => {
    const row = JSON.parse(line);
    if (row.run === path.basename(runDir)) row.reportSha256 = '0'.repeat(64);
    return JSON.stringify(row);
  });
  await fs.writeFile(file, rows.join('\n') + '\n', 'utf8');
  const result = await inspectRun(runDir);
  assert.equal(result.status, 'unverified');
});

test('a legacy run without a ledger still verifies with ledger absent', async () => {
  const { outDir, runDir } = await makeRun();
  await fs.rm(path.join(outDir, 'ledger.jsonl'));
  const result = await inspectRun(runDir);
  assert.equal(result.integrity, 'verified');
  assert.equal(result.ledger, 'absent');
});

test('runningBinary is null or a valid sha256 record', async () => {
  const binary = await runningBinary();
  assert.ok(binary === null || (typeof binary.sha256 === 'string' && binary.sha256.length === 64));
});

test('runningBinary reads the published executable from runtime.json', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ui-automation-runtime-'));
  const exe = path.join(root, 'ui-automation.exe');
  await fs.writeFile(exe, 'fake published broker');
  await fs.writeFile(path.join(root, 'runtime.json'), JSON.stringify({ executable: exe, pipe: 'test-pipe' }));
  const modPath = fileURLToPath(new URL('../scripts/evidence.mjs', import.meta.url));
  const code = `const m = await import(${JSON.stringify(pathToFileURL(modPath).href)}); console.log(JSON.stringify(await m.runningBinary()));`;
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    env: { ...process.env, UI_AUTOMATION_HOME: root }, encoding: 'utf8'
  });
  const binary = JSON.parse(out.trim());
  assert.equal(binary.sha256, digest('fake published broker'));
  assert.equal(binary.pipe, 'test-pipe');
});
