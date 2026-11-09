import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../scripts/team-delivery.mjs', import.meta.url));
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'team-delivery-test-'));
  const project = path.join(root, 'project');
  const out = path.join(root, 'evidence');
  await mkdir(project);
  await writeFile(path.join(project, 'new.txt'), 'first\n');
  const plan = path.join(project, 'delivery.json');
  const spec = {version: 1, inputs: ['new.txt', 'delivery.json'], checks: [
    {id: 'unit', command: 'node', args: ['-e', 'console.log("unit passed")'], stages: ['slice','module','delivery']},
    {id: 'full', command: 'node', args: ['-e', 'console.log("full passed")'], stages: ['delivery']}
  ], requiredDelivery: ['unit','full']};
  await writeFile(plan, JSON.stringify(spec));
  return {root, project, out, plan, spec};
}
function run(f, command, args = []) {
  const result = spawnSync(process.execPath, [cli, command, '--project', f.project, '--plan', f.plan, '--out', f.out, ...args], {encoding: 'utf8'});
  assert.ok(result.stdout.trim(), result.stderr);
  return {code: result.status, data: JSON.parse(result.stdout)};
}
test('preflight resolves actual Node and delivery retains all mandatory gates', async () => {
  const f = await fixture();
  const preflight = run(f, 'preflight');
  assert.equal(preflight.code, 0);
  assert.equal(preflight.data.node, process.execPath);
  const omitted = run(f, 'check', ['--stage', 'delivery', '--only', 'unit']);
  assert.equal(omitted.code, 1);
  assert.match(omitted.data.error, /required/i);
  const checked = run(f, 'check', ['--stage', 'delivery']);
  assert.equal(checked.code, 0);
  assert.deepEqual(checked.data.checks.map(c => c.id), ['unit','full']);
  assert.ok(checked.data.checks.every(c => c.exitCode === 0 && c.durationMs > 0));
  assert.match(await readFile(checked.data.checks[0].stdout, 'utf8'), /unit passed/);
});
test('context reloads mandatory, changed, deferred and independent-session documents', async () => {
  const f = await fixture();
  await writeFile(path.join(f.project, 'authority.md'), 'current authority');
  await writeFile(path.join(f.project, 'design.md'), 'design details');
  f.spec.context = {always: ['authority.md'], documents: [{path:'design.md', phases:['implement','qa']}]};
  await writeFile(f.plan, JSON.stringify(f.spec));
  const scope = ['--task','T1','--session','S1','--agreement','v1','--actor','developer','--phase','implement'];
  const first = run(f,'context',scope);
  assert.equal(first.code,0);
  assert.equal(first.data.loaded.length,2);
  const second = run(f,'context',scope);
  assert.deepEqual(second.data.loaded.map(d=>d.path),['authority.md']);
  assert.deepEqual(second.data.retained.map(d=>d.path),['design.md']);
  await writeFile(path.join(f.project,'design.md'),'changed');
  assert.equal(run(f,'context',scope).data.loaded.length,2);
  assert.equal(run(f,'context',[...scope,'--reset']).data.loaded.length,2);
  assert.equal(run(f,'context',[...scope,'--session','S2']).data.loaded.length,2);
  assert.equal(run(f,'context',[...scope,'--actor','qa']).data.loaded.length,2);
  const limited = run(f,'context',[...scope,'--session','S3','--budget','17']);
  assert.deepEqual(limited.data.deferred.map(d=>d.path),['design.md']);
  assert.equal(run(f,'context',[...scope,'--session','S3']).data.loaded.length,2);
});
test('freeze includes new inputs and logs, is idempotent, rejects source drift and tampering', async () => {
  const f = await fixture();
  const receipt = run(f,'check',['--stage','delivery']).data.receipt;
  const frozen = run(f,'freeze',['--receipt',receipt]);
  assert.equal(frozen.code,0,JSON.stringify(frozen.data));
  assert.equal(await readFile(path.join(frozen.data.bundle,'files','new.txt'),'utf8'),'first\n');
  assert.equal(run(f,'freeze',['--receipt',receipt]).data.bundleId,frozen.data.bundleId);
  const verifyArgs = ['--bundle',frozen.data.bundle,'--bundle-id',frozen.data.bundleId];
  assert.equal(run(f,'verify',verifyArgs).code,0);
  await writeFile(path.join(f.project,'new.txt'),'changed');
  assert.equal(run(f,'verify',verifyArgs).code,1);
  assert.equal(run(f,'freeze',['--receipt',receipt]).code,1);
  await writeFile(path.join(f.project,'new.txt'),'first\n');
  await writeFile(path.join(frozen.data.bundle,'files','new.txt'),'tampered');
  assert.equal(run(f,'verify',verifyArgs).code,1);
});
test('failed, timed-out and mutating checks cannot seal evidence; unsafe inputs fail', async () => {
  const f=await fixture();
  f.spec.checks[0].args=['-e','process.exit(7)'];
  await writeFile(f.plan,JSON.stringify(f.spec));
  const failed=run(f,'check',['--stage','delivery']);
  assert.equal(failed.code,1);
  assert.equal(failed.data.checks[0].exitCode,7);
  assert.equal(run(f,'freeze',['--receipt',failed.data.receipt]).code,1);
  f.spec.checks[0].args=['-e','setInterval(()=>{},1000)'];
  f.spec.checks[0].timeoutMs=100;
  await writeFile(f.plan,JSON.stringify(f.spec));
  assert.equal(run(f,'check',['--stage','delivery']).data.checks[0].timedOut,true);
  f.spec.checks[0].args=['-e','require("node:fs").writeFileSync("new.txt","mutated")'];
  f.spec.checks[0].timeoutMs=1000;
  await writeFile(f.plan,JSON.stringify(f.spec));
  assert.equal(run(f,'check',['--stage','delivery']).data.sourceUnchanged,false);
  f.spec.inputs=['../escaped'];
  await writeFile(f.plan,JSON.stringify(f.spec));
  assert.match(run(f,'preflight').data.error,/Unsafe/);
});
