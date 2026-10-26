import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {AppClient} from '../scripts/client.mjs';
import {LocalLaya} from '../scripts/laya.mjs';
import {runCase} from '../scripts/runner.mjs';
test('real browser observation uses the real local worker to select a frozen branch',async()=>{
  const server=http.createServer((req,res)=>res.end('<title>app-use semantic fixture</title><h1 id="result">Result Ready</h1><button id="apply" onclick="this.textContent=\'Applied\'">Apply</button>'));await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}`,c=await AppClient.connect(),judge=await LocalLaya.create();let session;
  try{
    const connection=(await c.request('doctor')).extensions[0];assert.ok(connection);
    session=(await c.request('prepare',{kind:'browser',connection,createUrl:url,allowOrigins:[url]})).session;
    const o=await c.request('observe',{session});await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    const r=await runCase(c,{version:1,id:'semantic-browser',session,inputs:['skills/engineering/app-use/tests/semantic-live.test.mjs'],start:'decide',states:{decide:{judge:{question:'Which state does this UI directly establish?',timeoutMs:60000,minProbability:.9,options:[{id:'ready',meaning:'The screen displays Result Ready and an enabled Apply button.',next:'apply'},{id:'unknown',meaning:'The screen does not establish that result or available action.',unknown:true}]}},apply:{action:{type:'click',match:{selector:'#apply'}},next:'goal'},goal:{assert:{target:{selector:'#apply'},property:'name',equals:'Applied'},next:'done'},done:{finish:'complete'}}},{judge});
    console.log('Semantic browser evidence: '+r.runDir);assert.equal(r.status,'pass',r.error);assert.ok(r.events.some(e=>e.kind==='model'&&e.reply.choice==='ready'));
  }finally{judge.close();if(session)await c.request('stop',{session,closeCreated:true});c.close();await new Promise(r=>server.close(r));}
});
