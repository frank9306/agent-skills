// Bounded real workload: identical final regression gates; only intermediate feedback differs.
import { mkdtemp, mkdir, cp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
const skill=fileURLToPath(new URL('../',import.meta.url));
const destination=process.argv[2];
if(!destination||!path.isAbsolute(destination)) throw new Error('Provide an absolute private measurement output directory');
const root=await mkdtemp(path.join(tmpdir(),'team-delivery-measure-'));
const project=path.join(root,'project');
await mkdir(project);
await cp(skill,path.join(project,'skill'),{recursive:true});
await writeFile(path.join(project,'authority.md'),'Bounded FT-EFFICIENCY-v1 measurement. Independent QA remains mandatory.\n');
await writeFile(path.join(project,'context.md'),'Measured retained project context.\n'.repeat(300));
const cli=path.join(project,'skill/scripts/team-delivery.mjs');
const testFile='skill/tests/team-delivery.test.mjs';
const cases=[{name:'normal',patterns:['preflight','context']},{name:'repair',patterns:['freeze','failed']}];
await mkdir(destination,{recursive:true});
const results=[];
function command(args){
  const start=performance.now();
  const r=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8',timeout:60000});
  if(r.status!==0) throw new Error(`Measurement command failed: ${r.stderr}\n${r.stdout}`);
  return {durationMs:performance.now()-start,stdout:r.stdout};
}
for(const scenario of cases){
  const plan={version:1,inputs:['skill','authority.md','context.md'],checks:[
    ...scenario.patterns.map((p,i)=>({id:`feedback${i}`,command:'node',args:['--test','--test-name-pattern',p,testFile],stages:[i===0?'slice':'module']})),
    {id:'regression',command:'node',args:['--test',testFile],stages:['delivery']},
    {id:'syntax',command:'node',args:['--check','skill/scripts/team-delivery.mjs'],stages:['delivery']}
  ],requiredDelivery:['regression','syntax'],context:{always:['authority.md'],documents:[{path:'context.md',phases:['implement']}]}};
  const planPath=path.join(project,'delivery.json');
  await writeFile(planPath,JSON.stringify(plan));
  // Baseline uses full regression for each of the same two feedback cycles, plus final delivery syntax.
  const baselineStart=performance.now();
  for(let i=0;i<3;i++) command(['--test',testFile]);
  command(['--check','skill/scripts/team-delivery.mjs']);
  const baselineMs=performance.now()-baselineStart;
  const out=path.join(destination,scenario.name);
  const common=['--project',project,'--plan',planPath,'--out',out];
  const optimizedStart=performance.now();
  const outputs=[];
  for(const stage of ['slice','module','delivery']) outputs.push(JSON.parse(command([cli,'check',...common,'--stage',stage]).stdout));
  const optimizedMs=performance.now()-optimizedStart;
  const final=outputs.at(-1);
  // Retain immutable inputs/logs now, before the next scenario changes the plan.
  const frozen=JSON.parse(command([cli,'freeze',...common,'--receipt',final.receipt]).stdout);
  results.push({scenario:scenario.name,baselineMs,optimizedMs,savedPercent:(baselineMs-optimizedMs)/baselineMs*100,baselineFullRuns:3,optimizedFullRuns:1,finalRequired:plan.requiredDelivery,bundle:frozen.bundle,bundleId:frozen.bundleId,checkReceipts:outputs.map(o=>o.receipt)});
}
// Same task/session scope: current authority always emitted, large retained context omitted only on resume.
const planPath=path.join(project,'delivery.json');
const common=['--project',project,'--plan',planPath,'--out',path.join(destination,'resume'),'--task','measurement','--session','retained-1','--agreement','FT-EFFICIENCY-v1','--actor','developer','--phase','implement'];
const first=JSON.parse(command([cli,'context',...common]).stdout);
const resume=JSON.parse(command([cli,'context',...common]).stdout);
const reset=JSON.parse(command([cli,'context',...common,'--reset']).stdout);
const report={measuredAt:new Date().toISOString(),node:process.version,project,results,context:{firstBytes:first.loadedBytes,resumeBytes:resume.loadedBytes,resetBytes:reset.loadedBytes,savedPercent:(first.loadedBytes-resume.loadedBytes)/first.loadedBytes*100},limitations:'Single bounded local replay, same final regression/syntax gates. Intermediate unrelated checks are avoided; this is not a historical whole-project A/B result. Model/native orchestration and environment/manual waiting are excluded.'};
await writeFile(path.join(destination,'measurement.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
