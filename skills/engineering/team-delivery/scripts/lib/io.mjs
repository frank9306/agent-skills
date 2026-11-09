import { readFile, writeFile, mkdir, rename, lstat, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const sha = data => createHash('sha256').update(data).digest('hex');
export const digest = value => sha(JSON.stringify(value));
export const json = async file => JSON.parse(await readFile(file, 'utf8'));
export function safeRelative(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes(':') || value.includes('\0') || path.posix.isAbsolute(value) || value.split('/').some(p => !p || p === '..' || p === '.')) throw new Error(`Unsafe relative path: ${value}`);
  return value;
}
export function contains(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}
export async function atomic(file, value) {
  await mkdir(path.dirname(file), {recursive: true});
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
  await rename(temp, file);
}
export async function existingFile(root, rel) {
  safeRelative(rel);
  let file = root;
  for (const part of rel.split('/')) {
    file = path.join(file, part);
    if ((await lstat(file)).isSymbolicLink()) throw new Error(`Symbolic link input is unsupported: ${rel}`);
  }
  if (!contains(root, await realpath(file))) throw new Error(`Path escapes project: ${rel}`);
  return file;
}
export async function snapshot(project, plan, planRelative) {
  const names = new Set();
  const ignored = new Set(['.git', 'node_modules', '.codex']);
  async function walk(rel) {
    const file = await existingFile(project, rel);
    const stat = await lstat(file);
    if (stat.isDirectory()) {
      for (const name of (await readdir(file)).sort()) {
        if (!ignored.has(name)) await walk(`${rel}/${name}`);
      }
    } else if (stat.isFile()) {
      if (/^(\.env(?:\..*)?|id_rsa|id_ed25519|credentials\.json)$/i.test(path.basename(rel))) throw new Error(`Private credential input refused: ${rel}`);
      names.add(rel);
    } else throw new Error(`Unsupported input: ${rel}`);
  }
  for (const rel of [...plan.inputs, planRelative]) await walk(rel);
  const files = [];
  for (const rel of [...names].sort()) {
    const data = await readFile(await existingFile(project, rel));
    files.push({path: rel, bytes: data.length, sha256: sha(data)});
  }
  return {files, identity: digest(files)};
}
export async function loadEnvironment(options) {
  if (!options.project || !options.plan || !options.out) throw new Error('--project, --plan and --out are required');
  const project = await realpath(path.resolve(options.project));
  const planPath = await realpath(path.resolve(options.plan));
  if (!contains(project, planPath)) throw new Error('Plan must be inside project');
  const outRequested = path.resolve(options.out);
  if (contains(project, outRequested) || contains(outRequested, project)) throw new Error('Output must be outside and disjoint from project');
  await mkdir(outRequested, {recursive: true});
  const out = await realpath(outRequested);
  if (contains(project, out) || contains(out, project)) throw new Error('Output resolves into project');
  const plan = await json(planPath);
  if (plan.version !== 1 || !Array.isArray(plan.inputs) || !plan.inputs.length || !Array.isArray(plan.checks) || !Array.isArray(plan.requiredDelivery) || !plan.requiredDelivery.length) throw new Error('Invalid plan: version, inputs, checks and requiredDelivery required');
  const ids = new Set();
  for (const c of plan.checks) {
    if (!/^[a-zA-Z0-9_-]+$/.test(c.id) || ids.has(c.id) || typeof c.command !== 'string' || (c.command !== 'node' && !path.isAbsolute(c.command)) || !Array.isArray(c.args) || c.args.some(a => typeof a !== 'string') || !Array.isArray(c.stages) || c.stages.some(s => !['slice','module','delivery'].includes(s)) || (c.timeoutMs !== undefined && (!Number.isFinite(c.timeoutMs) || c.timeoutMs < 1))) throw new Error('Invalid check declaration');
    ids.add(c.id);
  }
  if (new Set(plan.requiredDelivery).size !== plan.requiredDelivery.length || plan.requiredDelivery.some(id => !plan.checks.some(c => c.id === id && c.stages.includes('delivery')))) throw new Error('Invalid required delivery gates');
  const planRelative = path.relative(project, planPath).split(path.sep).join('/');
  return {project, planPath, planRelative, plan, planHash: sha(await readFile(planPath)), out};
}
