#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { AppClient, prepareRuntime, skillRoot, stateRoot } from './client.mjs';
import { validateObservation } from './assertions.mjs';

const execute = promisify(execFile);
const args = process.argv.slice(2), command = args.shift();
let client;
try {
  const flags = {};
  while (args.length) {
    const key = args.shift();
    if (!key.startsWith('--') || flags[key] !== undefined) throw new Error('expected unique --flag value');
    flags[key] = args[0] && !args[0].startsWith('--') ? args.shift() : true;
  }
  const p = flags['--request'] ? JSON.parse(await fs.readFile(flags['--request'], 'utf8')) : {};
  for (const k of ['session','kind','connection','hwnd','pid','tabId']) if (flags[`--${k}`] !== undefined) p[k] = ['pid','tabId'].includes(k) ? Number(flags[`--${k}`]) : flags[`--${k}`];
  let result;
  if (command === 'prepare' && flags['--runtime']) {
    result = await prepareRuntime({ dotnet: flags['--dotnet'] || 'dotnet', laya:flags['--laya']===true,packages:flags['--packages'],source:flags['--package-source'],...(flags['--runtime-dir']?{out:flags['--runtime-dir']}:{}) });
    if (flags['--register']) {
      const id = (await fs.readFile(path.join(skillRoot, 'extension/extension-id.txt'),'utf8')).trim();
      const registrationDir=flags['--registration-dir']||stateRoot;await fs.mkdir(registrationDir,{recursive:true});
      const manifest = path.join(registrationDir, 'com.frank9306.app_use.json');
      await fs.writeFile(manifest, JSON.stringify({ name: 'com.frank9306.app_use', description: 'app-use current-user bridge', path: result.executable, type: 'stdio', allowed_origins: [`chrome-extension://${id}/`] }, null, 2));
      for (const browser of ['Google\\Chrome','Microsoft\\Edge']) {
        await execute('reg.exe', ['ADD', `HKCU\\Software\\${browser}\\NativeMessagingHosts\\com.frank9306.app_use`, '/ve', '/t', 'REG_SZ', '/d', manifest, '/f'], { windowsHide: true });
      }
      result = { ...result, extensionId: id, loadUnpacked: path.join(skillRoot, 'extension'), registered: 'HKCU Chrome and Edge' };
    }
  } else if (command === 'prepare' && flags['--model-source']) {
    const {prepareModel}=await import('./model-cache.mjs');result=await prepareModel(flags['--model-source'],flags['--model-out']?{out:flags['--model-out']}:{});
  } else if (command === 'inspect') {
    const { inspectRun } = await import('./evidence.mjs'); result = await inspectRun(flags['--run']);
  } else {
    client = await AppClient.connect();
    if (command === 'validate') {
      const observation = await client.request('observe', { session: p.session });
      result = validateObservation(observation, p.assertion);
    } else if (command === 'run') {
      const { runCase } = await import('./runner.mjs');
      const { LocalLaya } = await import('./laya.mjs');
      const controller = new AbortController();
      process.once('SIGINT', () => controller.abort(new Error('stopped')));
      const judge=Object.values(p.states||{}).some(s=>s.judge)?await LocalLaya.create(flags['--model-dir']):undefined;
      try{result = await runCase(client, p, { signal: controller.signal, outDir: flags['--out'],judge });}finally{judge?.close();}
    } else if (['doctor','sessions','prepare','observe','act','stop'].includes(command)) {
      if (command === 'act' && p.action?.secretEnv) {
        const secret = process.env[p.action.secretEnv];
        if (secret === undefined) throw new Error('secret environment variable unavailable');
        p.action.text = secret;p.action.sensitive=true; delete p.action.secretEnv;
      }
      result = await client.request(command, p);
    } else throw new Error('commands: doctor prepare sessions observe act validate run inspect stop; use --request JSON-file');
  }
  console.log(JSON.stringify(result));
  if (result?.status && !['pass'].includes(result.status)) process.exitCode = result.status === 'fail' ? 1 : 2;
} catch (e) { console.log(JSON.stringify({ status:'error', error:e.message })); process.exitCode = 2; }
finally { client?.close(); }
