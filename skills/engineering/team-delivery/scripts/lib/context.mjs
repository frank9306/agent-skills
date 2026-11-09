import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { atomic, digest, existingFile, json, sha } from './io.mjs';

export async function context(env, options) {
  for (const key of ['task','session','agreement','actor','phase']) if (!options[key]) throw new Error(`--${key} required for context`);
  const config = env.plan.context;
  if (!config || !Array.isArray(config.always) || !config.always.length || !Array.isArray(config.documents)) throw new Error('Context plan needs mandatory always and documents lists');
  const budget = Number(options.budget ?? 24000);
  if (!Number.isSafeInteger(budget) || budget < 1) throw new Error('Invalid context byte budget');
  const scope = digest({project: env.project, planHash: env.planHash, task: options.task, session: options.session, agreement: options.agreement, actor: options.actor});
  const statePath = path.join(env.out, 'context', `${scope}.json`);
  let state = {scope, read: {}};
  if (!options.reset) {
    try {state = await json(statePath);} catch (error) {if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;}
    if (state.scope !== scope || !state.read || typeof state.read !== 'object') state = {scope, read:{}};
  }
  const always = new Set(config.always);
  const documents = [...new Set([...always, ...config.documents.filter(d => Array.isArray(d.phases) && d.phases.includes(options.phase)).map(d => d.path)])];
  const loaded = [], retained = [], deferred = [];
  let bytes = 0;
  for (const relative of documents) {
    const data = await readFile(await existingFile(env.project, relative));
    const hash = sha(data);
    const item = {path: relative, sha256: hash, bytes: data.length};
    if (!always.has(relative) && state.read[relative] === hash) {retained.push(item); continue;}
    if (!always.has(relative) && bytes + data.length > budget) {deferred.push(item); continue;}
    // Mandatory current authority is never hidden to fit a token/byte budget.
    loaded.push({...item, mandatory: always.has(relative), content: new TextDecoder('utf-8',{fatal:true}).decode(data)});
    bytes += data.length;
    state.read[relative] = hash;
  }
  await atomic(statePath, state);
  return {ok: true, scope, loaded, retained, deferred, loadedBytes: bytes, budgetExceededByMandatory: bytes > budget, instruction: 'Retained means already emitted in this same retained actor session. After reset/compaction or uncertain retention, use --reset. Deferred content is unread; load it explicitly before dependent work.'};
}
