import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {appendFileSync} from 'node:fs';
import { skillRoot, stateRoot } from './client.mjs';

const digest = b => createHash('sha256').update(b).digest('hex');
async function scoped(root, name) {
  if (typeof name !== 'string' || !name || path.isAbsolute(name) || path.win32.isAbsolute(name) || name.includes(':')) throw new Error('relative input path required');
  const base=await fs.realpath(root), file=await fs.realpath(path.resolve(base,name)), rel=path.relative(base,file);
  if(rel==='..'||rel.startsWith(`..${path.sep}`)||path.isAbsolute(rel)||(await fs.stat(file)).isDirectory())throw new Error('input escapes root or is not a file');
  return file;
}
async function fingerprints(root, names) {
  if(!Array.isArray(names)||new Set(names).size!==names.length)throw new Error('unique input list required');
  return Promise.all(names.map(async name=>({path:name,sha256:digest(await fs.readFile(await scoped(root,name)))})));
}
async function toolDigest(root=skillRoot) {
  const entries=[];
  async function walk(dir) {
    for(const item of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(['bin','obj','.local','runs','node_modules'].includes(item.name))continue;
      const p=path.join(dir,item.name);
      if(item.isDirectory())await walk(p);
      else if(item.isFile())entries.push([path.relative(root,p).replaceAll('\\','/'),digest(await fs.readFile(p))]);
    }
  }
  await walk(root); return digest(JSON.stringify(entries));
}
export class Evidence {
  static async begin(script,{outDir=path.join(stateRoot,'runs'),secrets=[],runtime}={}) {
    await fs.mkdir(outDir,{recursive:true});
    const dir=await fs.mkdtemp(path.join(path.resolve(outDir),'run-'));
    const e=new Evidence(); e.dir=dir;e.secrets=secrets.filter(s=>typeof s==='string'&&s.length);
    e.root=await fs.realpath(script.projectRoot||process.cwd());
    e.report={version:1,status:'unverified',started:new Date().toISOString(),script:e.clean(script),toolRoot:skillRoot,toolSha256:await toolDigest(),projectRoot:e.root,inputs:await fingerprints(e.root,script.inputs||[]),events:[],artifacts:[],build:script.build||{status:'unverified',reason:'No running build readback declared'}};
    if(runtime)e.report.runtime=e.clean(runtime);
    await fs.writeFile(path.join(dir,'script.json'),JSON.stringify(e.report.script,null,2),'utf8');
    e.report.artifacts.push({path:'script.json',sha256:digest(await fs.readFile(path.join(dir,'script.json')))});
    await fs.writeFile(path.join(dir,'events.jsonl'),'','utf8');
    return e;
  }
  clean(value) {
    let json=JSON.stringify(value);
    for(const s of this.secrets)json=json.split(JSON.stringify(s).slice(1,-1)).join('[redacted]');
    return JSON.parse(json);
  }
  event(kind,value) { const event={at:new Date().toISOString(),kind,...this.clean(value)};appendFileSync(path.join(this.dir,'events.jsonl'),JSON.stringify(event)+'\n','utf8');this.report.events.push(event); }
  async capture(client,session,options={}) {
    const image=await client.request('capture',{session,...options});
    const name=`capture-${this.report.artifacts.length}.${image.mime==='image/png'?'png':'jpg'}`;
    const data=Buffer.from(image.data,'base64');
    await fs.writeFile(path.join(this.dir,name),data);
    this.report.artifacts.push({path:name,sha256:digest(data)});
  }
  async finish(status,detail={}) {
    this.report.status=status;Object.assign(this.report,this.clean(detail));this.report.ended=new Date().toISOString();
    try{
      if(JSON.stringify(this.report.inputs)!==JSON.stringify(await fingerprints(this.root,this.report.inputs.map(x=>x.path))))throw Error('inputs changed during run');
      if(this.report.toolSha256!==await toolDigest())throw Error('tool changed during run');
    }catch(e){this.report.status='unverified';this.report.error=e.message;}
    this.report.artifacts.push({path:'events.jsonl',sha256:digest(await fs.readFile(path.join(this.dir,'events.jsonl')))});
    this.report.reportSha256=digest(JSON.stringify(this.report));
    await fs.writeFile(path.join(this.dir,'report.json'),JSON.stringify(this.report,null,2),'utf8');
    return { ...this.report, runDir:this.dir };
  }
}
export async function inspectRun(dir) {
  try {
    const r=JSON.parse(await fs.readFile(path.join(dir,'report.json'),'utf8'));
    const sha=r.reportSha256;delete r.reportSha256;
    if(sha!==digest(JSON.stringify(r)))throw new Error('report changed');
    if(r.toolSha256!==await toolDigest(r.toolRoot))throw new Error('tool changed');
    if(JSON.stringify(r.inputs)!==JSON.stringify(await fingerprints(r.projectRoot,r.inputs.map(x=>x.path))))throw new Error('inputs changed');
    for(const item of r.artifacts)if(digest(await fs.readFile(await scoped(dir,item.path)))!==item.sha256)throw new Error('artifact changed');
    return {...r,reportSha256:sha,integrity:'verified'};
  } catch(e) {return {status:'unverified',error:e.message};}
}
