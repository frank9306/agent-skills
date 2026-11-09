import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { contains, digest, existingFile, json, safeRelative, sha, snapshot } from './io.mjs';

function validateReceipt(env, receipt, identity) {
  if (receipt.version !== 1 || !receipt.ok || !receipt.sourceUnchanged || receipt.stage !== 'delivery' || receipt.project !== env.project || receipt.planHash !== env.planHash || receipt.inputIdentity !== identity || !Array.isArray(receipt.checks) || env.plan.requiredDelivery.some(id => !receipt.checks.some(c => c.id === id && c.passed && c.exitCode === 0 && !c.timedOut))) throw new Error('Stale, failed or incomplete required delivery receipt');
}
async function allFiles(root, prefix = '') {
  const result = [];
  for (const name of (await readdir(path.join(root,prefix), {withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    const rel = prefix ? `${prefix}/${name.name}` : name.name;
    if (name.isSymbolicLink()) throw new Error('Bundle contains symbolic link');
    if (name.isDirectory()) result.push(...await allFiles(root, rel));
    else if (name.isFile()) result.push(rel);
    else throw new Error('Bundle contains unsupported entry');
  }
  return result;
}
export async function verify(env, options) {
  if (!options.bundle || !/^[a-f0-9]{64}$/.test(options['bundle-id'] ?? '')) throw new Error('--bundle and trusted --bundle-id required');
  const root = path.resolve(options.bundle);
  const manifest = await json(await existingFile(root, 'manifest.json'));
  const {bundleId, ...body} = manifest;
  if (bundleId !== options['bundle-id'] || digest(body) !== bundleId || body.version !== 1 || !Array.isArray(body.entries)) throw new Error('Bundle identity mismatch');
  const expectedNames = ['manifest.json'];
  for (const item of body.entries) {
    safeRelative(item.path);
    if (expectedNames.includes(item.path)) throw new Error('Duplicate bundle entry');
    expectedNames.push(item.path);
    const data = await readFile(await existingFile(root,item.path));
    if (data.length !== item.bytes || sha(data) !== item.sha256) throw new Error(`Bundle content mismatch: ${item.path}`);
  }
  if (JSON.stringify((await allFiles(root)).sort()) !== JSON.stringify(expectedNames.sort())) throw new Error('Unexpected or missing bundle files');
  const current = await snapshot(env.project,env.plan,env.planRelative);
  if (body.inputIdentity !== current.identity || body.planHash !== env.planHash) throw new Error('Current source drifted from bundle');
  const receipt = await json(path.join(root,'receipt.json'));
  validateReceipt(env,receipt,current.identity);
  if (JSON.stringify(body.inputs) !== JSON.stringify(current.files)) throw new Error('Bundle input inventory mismatch');
  for (const file of current.files) {
    if (!body.entries.some(e => e.path === `files/${file.path}` && e.bytes === file.bytes && e.sha256 === file.sha256)) throw new Error('Missing frozen input');
  }
  for (const c of receipt.checks) {
    if (!body.entries.some(e=>e.path===`logs/${c.id}.stdout.log`) || !body.entries.some(e=>e.path===`logs/${c.id}.stderr.log`)) throw new Error('Missing check logs');
  }
  return {ok:true, bundle:root, bundleId, inputIdentity:current.identity, inputFiles:current.files.length, requiredDelivery:env.plan.requiredDelivery, verdict:'Integrity/current-input verification only; independent QA still required.'};
}
export async function freeze(env, options) {
  if (!options.receipt) throw new Error('--receipt required');
  const receiptPath = path.resolve(options.receipt);
  const runsRoot = path.join(env.out,'runs');
  if (!contains(runsRoot,receiptPath)) throw new Error('Receipt must belong to this output runs directory');
  const receipt = await json(receiptPath);
  const input = await snapshot(env.project,env.plan,env.planRelative);
  validateReceipt(env,receipt,input.identity);
  const data = new Map();
  for (const file of input.files) data.set(`files/${file.path}`, await readFile(await existingFile(env.project,file.path)));
  data.set('receipt.json',await readFile(receiptPath));
  for (const c of receipt.checks) {
    if (!/^[a-zA-Z0-9_-]+$/.test(c.id)) throw new Error('Invalid receipt check ID');
    for (const stream of ['stdout','stderr']) {
      const relative = path.relative(runsRoot,path.resolve(c[stream])).split(path.sep).join('/');
      data.set(`logs/${c.id}.${stream}.log`,await readFile(await existingFile(runsRoot,relative)));
    }
  }
  const entries = [...data].map(([name,bytes])=>({path:name,bytes:bytes.length,sha256:sha(bytes)}));
  for (const file of input.files) if (entries.find(e=>e.path===`files/${file.path}`).sha256 !== file.sha256) throw new Error('Input changed during freeze');
  if ((await snapshot(env.project,env.plan,env.planRelative)).identity !== input.identity) throw new Error('Input changed during freeze');
  const body = {version:1,inputIdentity:input.identity,planHash:env.planHash,inputs:input.files,entries};
  const bundleId = digest(body);
  const bundle = path.join(env.out,'bundles',bundleId);
  await mkdir(path.dirname(bundle),{recursive:true});
  try {await mkdir(bundle);} catch(error) {
    if (error.code !== 'EEXIST') throw error;
    return {...await verify(env,{bundle,'bundle-id':bundleId}), reused:true};
  }
  for (const [name,bytes] of data) {
    const target = path.join(bundle,...name.split('/'));
    await mkdir(path.dirname(target),{recursive:true});
    await writeFile(target,bytes,{flag:'wx'});
  }
  // The manifest is the final seal. A partial directory is never a valid handoff.
  await writeFile(path.join(bundle,'manifest.json'),JSON.stringify({...body,bundleId},null,2)+'\n',{flag:'wx'});
  return {...await verify(env,{bundle,'bundle-id':bundleId}),reused:false};
}
