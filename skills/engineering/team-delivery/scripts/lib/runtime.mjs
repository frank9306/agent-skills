import { openSync, closeSync } from 'node:fs';
import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { atomic, snapshot } from './io.mjs';

export async function preflight(env) {
  for (const command of new Set(env.plan.checks.map(c=>c.command === 'node' ? process.execPath : c.command))) await access(command,constants.X_OK);
  const inputs = await snapshot(env.project, env.plan, env.planRelative);
  return {ok: true, platform: process.platform, node: process.execPath, nodeVersion: process.version, project: env.project, planHash: env.planHash, inputIdentity: inputs.identity, inputFiles: inputs.files.length, requiredDelivery: env.plan.requiredDelivery};
}
async function execute(env, check, directory) {
  const stdout = path.join(directory, `${check.id}.stdout.log`);
  const stderr = path.join(directory, `${check.id}.stderr.log`);
  const handles = [openSync(stdout, 'wx'), openSync(stderr, 'wx')];
  const startedAt = new Date().toISOString();
  const start = performance.now();
  let timedOut = false;
  try {
    const result = await new Promise(resolve => {
      const child = spawn(check.command === 'node' ? process.execPath : check.command, check.args, {cwd: env.project, shell: false, windowsHide: true, stdio: ['ignore', ...handles]});
      const timer = setTimeout(() => {timedOut = true; child.kill();}, check.timeoutMs ?? 120000);
      child.once('error', error => {clearTimeout(timer); resolve({exitCode: null, error: error.message});});
      child.once('close', (exitCode, signal) => {clearTimeout(timer); resolve({exitCode, signal});});
    });
    return {id: check.id, ...result, timedOut, passed: result.exitCode === 0 && !timedOut, startedAt, durationMs: Math.round((performance.now() - start)*100)/100, stdout, stderr};
  } finally { handles.forEach(closeSync); }
}
export async function check(env, options) {
  const stage = options.stage;
  if (!['slice','module','delivery'].includes(stage)) throw new Error('--stage must be slice, module or delivery');
  const only = options.only?.split(',');
  if (only && (new Set(only).size !== only.length || only.some(id => !env.plan.checks.some(c => c.id === id && c.stages.includes(stage))))) throw new Error('Unknown check for requested stage');
  if (stage === 'delivery' && only && env.plan.requiredDelivery.some(id => !only.includes(id))) throw new Error('Cannot omit required delivery gates');
  const selected = env.plan.checks.filter(c => c.stages.includes(stage) && (!only || only.includes(c.id)));
  if (!selected.length) throw new Error('No checks selected');
  const input = await snapshot(env.project, env.plan, env.planRelative);
  const runId = `${Date.now()}-${randomUUID()}`;
  const directory = path.join(env.out, 'runs', runId);
  await mkdir(directory, {recursive: true});
  const startedAt = new Date().toISOString();
  const start = performance.now();
  const checks = [];
  for (const c of selected) checks.push(await execute(env, c, directory));
  const after = await snapshot(env.project, env.plan, env.planRelative);
  const receipt = {version: 1, project: env.project, planHash: env.planHash, inputIdentity: input.identity, stage, runId, startedAt, durationMs: Math.round((performance.now()-start)*100)/100, checks, sourceUnchanged: after.identity === input.identity};
  receipt.ok = checks.every(c => c.passed) && receipt.sourceUnchanged;
  const file = path.join(directory, 'receipt.json');
  await atomic(file, receipt);
  return {...receipt, receipt: file};
}
