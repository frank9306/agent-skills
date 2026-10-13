import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const checker = resolve(here, '../assets/typescript/check-architecture.mjs');
const repository = resolve(here, '../../../..');

async function fixture(t, files = {}, contract) {
  const root = await mkdtemp(join(tmpdir(), 'deep-modules-ts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), value, 'utf8');
  }
  if (contract) await writeFile(join(root, '.architecture.json'), JSON.stringify(contract), 'utf8');
  await symlink(join(repository, 'node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  return root;
}

function run(root) {
  const result = spawnSync(process.execPath, [checker, root, '--json'], { encoding: 'utf8' });
  return { status: result.status, data: result.stdout.trim() ? JSON.parse(result.stdout) : null, stderr: result.stderr };
}

const contract = () => ({
  schemaVersion: 1, profile: 'typescript', sourceRoots: ['src', 'tests'],
  modules: [
    { name: 'orders', path: 'src/orders', public: ['src/orders/index.ts'], exports: { 'src/orders/index.ts': ['placeOrder'] }, allow: ['payments'], testPaths: ['tests/orders'] },
    { name: 'payments', path: 'src/payments', public: ['src/payments/index.ts'], exports: { 'src/payments/index.ts': ['charge', 'Receipt'] }, allow: [], testPaths: ['tests/payments'] },
  ],
  externalOwners: {}, dynamicLoaders: [], baseline: [], excludedPaths: [],
});

const validFiles = {
  'package.json': '{"type":"module"}',
  'tsconfig.json': '{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","baseUrl":".","paths":{"@payments/*":["src/payments/*"]}}}',
  'src/orders/index.ts': "import { charge } from '../payments/index'; export function placeOrder() { return charge(); }",
  'src/payments/index.ts': "export { charge } from './internal'; export type Receipt = { id: string };",
  'src/payments/internal.ts': "export function charge() { return 'paid'; } export const secret = 'private';",
  'tests/orders/contract.ts': "import { placeOrder } from '../../src/orders/index'; placeOrder();",
  'tests/payments/contract.ts': "import { charge } from '../../src/payments/index'; charge();",
};

test('missing architecture contract fails as a configuration error', async t => {
  const root = await fixture(t);
  const result = run(root);
  assert.equal(result.status, 2, result.stderr);
  assert.equal(result.data.ok, false);
  assert.match(result.data.errors[0], /architecture/i);
});

test('unknown contract keys and blanket baselines fail closed', async t => {
  const config = contract();
  config.ignoreEverything = true;
  const root = await fixture(t, validFiles, config);
  assert.equal(run(root).status, 2);
  delete config.ignoreEverything;
  config.baseline = [{ rule: 'private-import', from: 'src/**', to: 'src/payments/internal.ts', reason: 'legacy' }];
  await writeFile(join(root, '.architecture.json'), JSON.stringify(config));
  assert.equal(run(root).status, 2);
});

test('a new source root outside the declared scan cannot silently pass', async t => {
  const root = await fixture(t, { ...validFiles, 'app/forgotten.ts': 'export const forgotten = 1;' }, contract());
  const result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'unscanned-source' && v.from === 'app/forgotten.ts'));
});

test('legal public dependencies pass and a direct private import fails then passes after repair', async t => {
  const root = await fixture(t, validFiles, contract());
  const good = run(root);
  assert.equal(good.status, 0, JSON.stringify(good));
  await writeFile(join(root, 'src/orders/index.ts'), "import { charge } from '../payments/internal'; export function placeOrder() { return charge(); }");
  const bad = run(root);
  assert.equal(bad.status, 1);
  assert.ok(bad.data.violations.some(v => v.rule === 'private-import' && v.to === 'src/payments/internal.ts'));
  await writeFile(join(root, 'src/orders/index.ts'), validFiles['src/orders/index.ts']);
  assert.equal(run(root).status, 0);
});

test('aliases, import types, literal dynamic imports, CommonJS and reexports cannot bypass private boundaries', async t => {
  const cases = [
    "import type { Secret } from '@payments/internal'; export function placeOrder(): Secret { return { id: 'x' }; }",
    "export async function placeOrder() { return (await import('../payments/internal')).charge(); }",
    "const { charge } = require('../payments/internal'); export function placeOrder() { return charge(); }",
    "export { charge as placeOrder } from '../payments/internal';",
  ];
  for (const content of cases) {
    const root = await fixture(t, { ...validFiles, 'src/orders/index.ts': content, 'src/payments/internal.ts': `${validFiles['src/payments/internal.ts']} export type Secret = { id: string };` }, contract());
    const result = run(root);
    assert.equal(result.status, 1, JSON.stringify(result));
    assert.ok(result.data.violations.some(v => v.rule === 'private-import' && v.to === 'src/payments/internal.ts'), JSON.stringify(result));
  }
});

test('reverse dependencies and domain cycles across separate files fail', async t => {
  const config = contract();
  const root = await fixture(t, { ...validFiles, 'src/payments/other.ts': "import { placeOrder } from '../orders/index'; export const later = () => placeOrder();" }, config);
  const result = run(root);
  assert.equal(result.status, 1, JSON.stringify(result));
  assert.ok(result.data.violations.some(v => v.rule === 'forbidden-dependency'));
  assert.ok(result.data.violations.some(v => v.rule === 'module-cycle'));
  config.modules[1].allow = ['orders'];
  await writeFile(join(root, '.architecture.json'), JSON.stringify(config));
  const allowed = run(root);
  assert.equal(allowed.status, 1);
  assert.ok(allowed.data.violations.some(v => v.rule === 'module-cycle'));
  assert.ok(!allowed.data.violations.some(v => v.rule === 'forbidden-dependency'));
});

test('external contract tests use public entries while internal unit tests may use internals', async t => {
  const root = await fixture(t, { ...validFiles, 'src/payments/internal.test.ts': "import { charge } from './internal'; charge();" }, contract());
  assert.equal(run(root).status, 0);
  await writeFile(join(root, 'tests/payments/contract.ts'), "import { charge } from '../../src/payments/internal'; charge();");
  const result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'private-import' && v.from === 'tests/payments/contract.ts'));
});

test('public export additions and export-star fail even when imports are legal', async t => {
  const root = await fixture(t, { ...validFiles, 'src/payments/index.ts': `${validFiles['src/payments/index.ts']} export const leak = 1;` }, contract());
  let result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'undeclared-export'));
  await writeFile(join(root, 'src/payments/index.ts'), "export * from './internal'; export type Receipt = { id: string };");
  result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'wildcard-export'));
});

test('SDK ownership includes subpaths and unresolved imports fail closed', async t => {
  const config = contract();
  config.externalOwners = { 'node:fs': ['payments'] };
  const root = await fixture(t, { ...validFiles, 'src/orders/adapter.ts': "import { readFile } from 'node:fs/promises'; export { readFile };" }, config);
  let result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'external-owner'));
  await writeFile(join(root, 'src/orders/adapter.ts'), "export { nope } from './not-found';");
  result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'unresolved-import'));
});

test('computed loading must be registered but literal imports in adapters remain checked', async t => {
  const config = contract();
  const root = await fixture(t, { ...validFiles, 'src/orders/loader.ts': 'export const load = (path: string) => import(path);' }, config);
  let result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'computed-import'));
  config.dynamicLoaders.push('src/orders/loader.ts');
  await writeFile(join(root, '.architecture.json'), JSON.stringify(config));
  assert.equal(run(root).status, 0);
  await writeFile(join(root, 'src/orders/loader.ts'), "export const load = () => import('../payments/internal');");
  result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'private-import'));
});

test('exact legacy baselines permit only the existing edge and expire when repaired', async t => {
  const config = contract();
  config.baseline = [{ rule: 'private-import', from: 'src/orders/index.ts', to: 'src/payments/internal.ts', reason: 'Legacy caller, migrate to the public entry.' }];
  const root = await fixture(t, { ...validFiles, 'src/orders/index.ts': "import { charge } from '../payments/internal'; export function placeOrder() { return charge(); }" }, config);
  assert.equal(run(root).status, 0);
  await writeFile(join(root, 'src/orders/extra.ts'), "export { charge } from '../payments/internal';");
  assert.equal(run(root).status, 1);
  await rm(join(root, 'src/orders/extra.ts'));
  await writeFile(join(root, 'src/orders/index.ts'), validFiles['src/orders/index.ts']);
  const result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'unused-baseline'));
});

test('new unclassified modules and managed-script exclusions are checked without Git or hooks', async t => {
  const config = contract();
  config.excludedPaths = ['scripts/check-architecture.mjs'];
  const root = await fixture(t, { ...validFiles, 'scripts/check-architecture.mjs': 'export const managed = true;', 'src/forgotten/index.ts': 'export const forgotten = true;' }, config);
  const result = run(root);
  assert.equal(result.status, 1);
  assert.ok(result.data.violations.some(v => v.rule === 'unclassified-source' && v.from === 'src/forgotten/index.ts'));
  assert.ok(!result.data.violations.some(v => v.from === 'scripts/check-architecture.mjs'));
});

test('baseline and exclusions cannot hide source directories or configurations', async t => {
  const config = contract();
  config.excludedPaths = ['src/orders'];
  const root = await fixture(t, validFiles, config);
  assert.equal(run(root).status, 2);
  config.excludedPaths = ['tool.config.ts'];
  await writeFile(join(root, '.architecture.json'), JSON.stringify(config));
  assert.equal(run(root).status, 2);
  config.excludedPaths = [];
  config.baseline = [{ rule: 'undeclared-export', from: 'src/orders/index.ts', to: 'src/orders/index.ts', reason: 'Too broad to distinguish new exports' }];
  await writeFile(join(root, '.architecture.json'), JSON.stringify(config));
  assert.equal(run(root).status, 2);
});

test('file-owned configuration modules are scanned and their exports checked', async t => {
  const config = contract();
  config.sourceRoots = ['.'];
  config.excludedPaths = ['scripts/check-architecture.mjs'];
  config.modules.push({ name: 'tooling', path: 'tool.config.ts', public: ['tool.config.ts'], exports: { 'tool.config.ts': ['default'] }, allow: [] });
  const root = await fixture(t, { ...validFiles, 'tool.config.ts': 'export default { strict: true };', 'scripts/check-architecture.mjs': 'console.log("managed")' }, config);
  const result = run(root);
  assert.equal(result.status, 0, JSON.stringify(result));
});

test('case changes cannot bypass private ownership on Windows', { skip: process.platform !== 'win32' }, async t => {
  const root = await fixture(t, { ...validFiles, 'src/orders/index.ts': "import { charge } from '../Payments/internal'; export function placeOrder() { return charge(); }" }, contract());
  const result = run(root);
  assert.equal(result.status, 1, JSON.stringify(result));
  assert.ok(result.data.violations.some(v => v.rule === 'private-import' && v.to === 'src/payments/internal.ts'));
});

test('missing native dependencies and syntax failures never count as passed', async t => {
  const root = await fixture(t, validFiles, contract());
  await rm(join(root, 'node_modules'), { recursive: true, force: true });
  const missing = run(root);
  assert.equal(missing.status, 2, JSON.stringify(missing));
  assert.equal(missing.data.ok, false);
  await symlink(join(repository, 'node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await writeFile(join(root, 'src/orders/index.ts'), 'export function placeOrder( {');
  const invalid = run(root);
  assert.equal(invalid.status, 2, JSON.stringify(invalid));
});

test('JavaScript and CommonJS public surfaces are checked', async t => {
  const config = contract();
  config.modules[1].public = ['src/payments/index.cjs'];
  config.modules[1].exports = { 'src/payments/index.cjs': ['charge'] };
  const files = { ...validFiles };
  delete files['src/payments/index.ts'];
  files['src/payments/index.cjs'] = "exports.charge = require('./internal').charge;";
  files['src/orders/index.ts'] = "import { charge } from '../payments/index.cjs'; export function placeOrder() { return charge(); }";
  files['tests/payments/contract.ts'] = "import { charge } from '../../src/payments/index.cjs'; charge();";
  const root = await fixture(t, files, config);
  const good = run(root);
  assert.equal(good.status, 0, JSON.stringify(good));
  await writeFile(join(root, 'src/payments/index.cjs'), `${files['src/payments/index.cjs']} exports.leak = 1;`);
  const bad = run(root);
  assert.equal(bad.status, 1, JSON.stringify(bad));
  assert.ok(bad.data.violations.some(v => v.rule === 'undeclared-export'));
});
