import { parseArgs } from 'node:util';
import { loadEnvironment } from './lib/io.mjs';
import { preflight, check } from './lib/runtime.mjs';
import { context } from './lib/context.mjs';
import { freeze, verify } from './lib/evidence.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

try {
  const {values, positionals} = parseArgs({allowPositionals: true, options: Object.fromEntries(['project','plan','out','stage','only','task','session','agreement','actor','phase','budget','receipt','bundle','bundle-id'].map(k => [k,{type:'string'}]).concat([['reset',{type:'boolean'}]]))});
  if (positionals.length !== 1) throw new Error('One command required');
  const env = await loadEnvironment(values);
  let result;
  if (positionals[0] === 'preflight') result = await preflight(env);
  else if (positionals[0] === 'check') result = await check(env, values);
  else if (positionals[0] === 'context') result = await context(env, values);
  else if (positionals[0] === 'freeze') result = await freeze(env, values);
  else if (positionals[0] === 'verify') result = await verify(env, values);
  else if (positionals[0] === 'browser-kit') {
    const source = await readFile(new URL('browser-kit.js',import.meta.url));
    const file=path.join(env.out,'browser-kit.js');
    try {await writeFile(file,source,{flag:'wx'});} catch(error) {
      if(error.code!=='EEXIST') throw error;
      if(!(await readFile(file)).equals(source)) throw new Error('Existing browser-kit differs; use a new output directory');
    }
    result={ok:true,file,instruction:'Read references/plan.md for the MCP wrapper; supply project-owned cases. No Node globals are needed in the browser VM.'};
  }
  else throw new Error('Unknown command');
  console.log(JSON.stringify(result));
  if (!result.ok) process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({ok: false, error: error.message}));
  process.exitCode = 1;
}
