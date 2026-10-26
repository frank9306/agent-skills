import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runCase,validateCase} from '../scripts/runner.mjs';

const observation=()=>({id:'fresh',complete:true,identity:{kind:'controlled',version:'1'},nodes:[{id:'button',name:'Apply',role:'button',enabled:true,visible:true},{id:'result',name:'Result',role:'textbox',value:'Ready',enabled:true,visible:true}]});
function boundary(){const calls=[];return {calls,async request(method,p){calls.push([method,p]);if(method==='observe')return observation();if(method==='act')return {actionExecuted:true,goalVerified:false,observation:observation()};if(method==='capture')return {mime:'image/png',data:Buffer.from('controlled image boundary').toString('base64')};if(method==='stop')return {stopped:true};throw Error('unsupported boundary method');}};}
const base=states=>({version:1,id:'controlled',session:'controlled-session',start:Object.keys(states)[0],states});
async function run(script,options={}){const outDir=await fs.mkdtemp(path.join(os.tmpdir(),'app-use-case-'));return runCase(boundary(),script,{outDir,...options});}
test('no goal assertions and all N/A cannot pass',async()=>{
  assert.equal((await run(base({done:{finish:'complete'}}))).status,'unverified');
  assert.equal((await run(base({na:{assert:{type:'not-applicable',reason:'No collection'},next:'done'},done:{finish:'complete'}}))).status,'unverified');
});
test('literal goals distinguish pass/fail and unreachable required assertions cannot disappear',async()=>{
  const goal={target:{name:'Result'},property:'value',equals:'Ready'};
  assert.equal((await run(base({goal:{assert:goal,next:'done'},done:{finish:'complete'}}))).status,'pass');
  assert.equal((await run(base({goal:{assert:{...goal,equals:'Wrong'},next:'done'},done:{finish:'complete'}}))).status,'fail');
  const s=base({done:{finish:'complete'},missed:{assert:goal,next:'done'}});
  assert.equal((await run(s)).status,'unverified');
  const frozen=validateCase(s);assert.equal(Object.isFrozen(frozen.states.missed.assert),true);assert.equal(s.maxSteps,undefined);
});
test('a step deadline bounds a stalled tool and never dispatches following actions',async()=>{
  const c=boundary();c.request=async(method,p)=>{c.calls.push([method,p]);if(method==='observe')await new Promise(r=>setTimeout(r,150));return observation();};
  const s={...base({click:{action:{type:'click',match:{name:'Apply'}},next:'done'},done:{finish:'complete'}}),stepTimeoutMs:20,timeoutMs:500};
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'app-use-timeout-'));
  const start=Date.now(),r=await runCase(c,s,{outDir:dir});
  assert.equal(r.status,'error');assert.equal(c.calls.some(([m])=>m==='act'),false);assert.ok(Date.now()-start<400);
});
const goal={target:{name:'Result'},property:'value',equals:'Ready'};
const semantic=()=>base({decide:{judge:{question:'Is the result ready?',minProbability:.9,options:[{id:'ready',meaning:'Result is Ready',next:'click'},{id:'unknown',meaning:'Unknown or incomplete state',unknown:true}] }},click:{action:{type:'click',match:{name:'Apply'}},next:'goal'},goal:{assert:goal,next:'done'},done:{finish:'complete'}});
test('wait allows an absent target to become ready; ambiguous observations still stop',async()=>{
  const c=boundary();let n=0;const request=c.request.bind(c);c.request=async(m,p)=>m==='observe'&&n++===0?{...observation(),nodes:[]}:request(m,p);
  const s=base({wait:{wait:{assertion:goal,timeoutMs:1000,intervalMs:10},next:'goal'},goal:{assert:goal,next:'done'},done:{finish:'complete'}});
  assert.equal((await runCase(c,s,{outDir:await fs.mkdtemp(path.join(os.tmpdir(),'app-use-wait-'))})).status,'pass');
});
test('unknown, low, malformed, overflow and stale model results cannot dispatch',async()=>{
  for(const reply of [{choice:'unknown',probabilities:{ready:.01,unknown:.99}},{choice:'ready',probabilities:{ready:.6,unknown:.4}},{choice:'invented',probabilities:{invented:1}},{error:'observation exceeds complete context'}]){
    const c=boundary(),r=await runCase(c,semantic(),{judge:{judge:async()=>reply},outDir:await fs.mkdtemp(path.join(os.tmpdir(),'app-use-model-'))});
    assert.notEqual(r.status,'pass');assert.equal(c.calls.some(([m])=>m==='act'),false);assert.ok(r.events.some(e=>e.kind==='model'),'rejected model evidence must be retained');
  }
  const c=boundary();let n=0,req=c.request.bind(c);c.request=async(m,p)=>m==='observe'&&n++>0?{...observation(),nodes:[...observation().nodes,{id:'changed',name:'Changed'}]}:req(m,p);
  const r=await runCase(c,semantic(),{judge:{judge:async()=>({choice:'ready',probabilities:{ready:.99,unknown:.01}})},outDir:await fs.mkdtemp(path.join(os.tmpdir(),'app-use-stale-'))});
  assert.equal(r.status,'unverified');assert.equal(c.calls.some(([m])=>m==='act'),false);
});
test('model cancellation discards a late reply and never runs actions or cleanup',async()=>{
  const c=boundary(),a=new AbortController(),s=semantic();s.cleanup=[{type:'click',match:{name:'Apply'}}];
  const r=await runCase(c,s,{signal:a.signal,judge:{judge:async()=>{setTimeout(()=>a.abort(Error('stopped')),10);await new Promise(r=>setTimeout(r,60));return {choice:'ready',probabilities:{ready:.99,unknown:.01}};}},outDir:await fs.mkdtemp(path.join(os.tmpdir(),'app-use-stop-'))});
  assert.equal(r.status,'stopped');await new Promise(r=>setTimeout(r,80));assert.equal(c.calls.some(([m])=>m==='act'),false);assert.ok(c.calls.some(([m])=>m==='stop'));
});
test('invalid future budgets are rejected before preparation and declared observation scope is preserved',async()=>{
  const c=boundary(),s=semantic();s.prepare=[{type:'click',match:{name:'Apply'}}];s.states.decide.judge.timeoutMs=0;
  const r=await runCase(c,s);assert.equal(r.status,'error');assert.equal(c.calls.length,0);
  const scoped=base({goal:{assert:goal,next:'done'},done:{finish:'complete'}});scoped.observation={selector:'#test-root',limit:100};
  const d=boundary();await runCase(d,scoped,{outDir:await fs.mkdtemp(path.join(os.tmpdir(),'app-use-scope-'))});assert.ok(d.calls.filter(([m])=>m==='observe').every(([,p])=>p.selector==='#test-root'&&p.limit===100));
});
