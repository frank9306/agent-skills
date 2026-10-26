import net from 'node:net';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const stateRoot = process.env.APP_USE_HOME || path.join(process.env.LOCALAPPDATA || os.homedir(), 'app-use');
const execute = promisify(execFile);

export class AppClient {
  constructor(config) { this.config = config; }
  static async connect(options = {}) {
    const config = options.config || JSON.parse(await fs.readFile(path.join(stateRoot, 'runtime.json'), 'utf8'));
    const client = new AppClient(config);
    try { await client.open(); }
    catch {
      const child = spawn(config.executable, ['--serve'], { detached: true, stdio: 'ignore', windowsHide: true });
      child.unref();
      const deadline = Date.now() + 10000;
      for (;;) {
        try { await client.open(); break; }
        catch (e) { if (Date.now() > deadline) throw e; await new Promise(r => setTimeout(r, 150)); }
      }
    }
    return client;
  }
  async open() {
    this.pending = new Map(); this.buffer = '';
    this.socket = net.createConnection(`\\\\.\\pipe\\${this.config.pipe}`);
    this.socket.setEncoding('utf8');
    await new Promise((resolve, reject) => { this.socket.once('connect', resolve); this.socket.once('error', reject); });
    this.socket.on('data', data => {
      this.buffer += data.toString('utf8');
      if (this.buffer.length > 4_000_000) { this.socket.destroy(new Error('reply too large')); return; }
      let end;
      while ((end = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1);
        try {
          const reply = JSON.parse(line), item = this.pending.get(reply.id);
          if (item) { this.pending.delete(reply.id); reply.error ? item.reject(new Error(reply.error)) : item.resolve(reply.result); }
        } catch (e) { this.socket.destroy(e); }
      }
    });
    const fail = e => { for (const p of this.pending.values()) p.reject(e); this.pending.clear(); };
    this.socket.on('error', fail); this.socket.on('close', () => fail(new Error('broker disconnected')));
  }
  async request(method, params = {}, { signal, timeoutMs = 15000 } = {}) {
    signal?.throwIfAborted();
    const id = randomUUID();
    let timer, onAbort;
    try {
      return await new Promise((resolve, reject) => {
        timer = setTimeout(() => { this.pending.delete(id); reject(new Error('request timed out; observe before retrying an action')); }, timeoutMs);
        onAbort = () => { this.pending.delete(id); reject(signal.reason || new Error('stopped')); };
        signal?.addEventListener('abort', onAbort, { once: true });
        this.pending.set(id, { resolve, reject });
        this.socket.write(JSON.stringify({ id, method, params: { ...params, expiresAt: Date.now() + timeoutMs } }) + '\n');
      });
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); }
  }
  close() { this.socket?.destroy(); }
  async stop(session) {
    const control=await AppClient.connect({config:this.config});
    try{return await control.request('stop',{session},{timeoutMs:1000});}finally{control.close();}
  }
}

export async function prepareRuntime({ dotnet = 'dotnet', out = path.join(stateRoot, 'runtime', String(Date.now())), laya=false, packages, source } = {}) {
  if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('app-use v1 requires Windows x64');
  await fs.mkdir(out, { recursive: true });
  await execute(dotnet, ['publish', path.join(skillRoot, 'native/AppUse/AppUse.csproj'), '-c', 'Release', '-r', 'win-x64', '--self-contained', 'true', '-o', out], { windowsHide: true, maxBuffer: 4_000_000 });
  const executable = path.join(out, 'AppUse.exe');
  await fs.copyFile(path.join(skillRoot, 'extension/extension-id.txt'), path.join(out, 'extension-id.txt'));
  const { stdout } = await execute(executable, ['--doctor'], { windowsHide: true });
  const identity = JSON.parse(stdout);
  let previous={};try{previous=JSON.parse(await fs.readFile(path.join(stateRoot,'runtime.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  const config = { ...previous, executable, pipe: identity.pipe, version: identity.version };
  if(laya){
    const worker=path.join(out,'laya');
    await execute(dotnet,['publish',path.join(skillRoot,'native/LayaWorker/LayaWorker.csproj'),'-c','Release','-r','win-x64','--self-contained','true','-o',worker,'--packages',packages||path.join(stateRoot,'nuget'),...(source?['--source',source]:[])],{windowsHide:true,maxBuffer:4_000_000});
    config.layaExecutable=path.join(worker,'LayaWorker.exe');
  }
  await fs.mkdir(stateRoot, { recursive: true });
  await fs.writeFile(path.join(stateRoot, 'runtime.json'), JSON.stringify(config, null, 2), 'utf8');
  return config;
}
