import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LocalLaya} from '../scripts/laya.mjs';
import {Evidence} from '../scripts/evidence.mjs';

test('fixed official local Laya executes real inference, refuses overflow, and stops its worker',async()=>{
  const worker=process.env.APP_USE_LAYA_WORKER;
  const judge=worker?new LocalLaya(worker,process.env.APP_USE_LAYA_MODEL):await LocalLaya.create(process.env.APP_USE_LAYA_MODEL);
  const e=await Evidence.begin({version:1,id:'laya-live',inputs:['skills/engineering/app-use/tests/laya-live.test.mjs']});
  const input={state:'The screen says: Result Ready. The Apply button is enabled and visible.',question:'Which screen state is directly described?',options:[{id:'ready',meaning:'The screen displays Result Ready and Apply is enabled.'},{id:'blocked',meaning:'The screen displays an error and Apply is disabled.'},{id:'unknown',meaning:'The available screen does not establish either state.'}]};
  try{
    const r=await judge.judge(input,{timeoutMs:60000});e.event('model',{request:input,reply:r});
    assert.equal(r.error,null,JSON.stringify(r));assert.equal(r.choice,'ready');assert.ok(r.probabilities.ready>.9,JSON.stringify(r));
    const overflow=await judge.judge({...input,state:'A complete observation. '.repeat(2000)},{timeoutMs:60000});e.event('overflow',{reply:overflow});assert.match(overflow.error,/context/);
    const a=new AbortController();setTimeout(()=>a.abort(Error('controlled cancellation')),20);
    await assert.rejects(judge.judge(input,{signal:a.signal}),/cancellation/);assert.equal(judge.child,null);assert.equal(judge.busy,false);
    const report=await e.finish('pass',{modelRevision:'1720e3e3357cfe1e281542e223f8273b0890ca34',sdkRevision:'6f0496f797dc7127265d62e1543a62de507d943c'});console.log(`Laya evidence: ${report.runDir}`);
  }catch(error){const r=await e.finish('error',{error:error.message});console.log(`Failed Laya evidence: ${r.runDir}`);throw error;}finally{judge.close();}
});
