import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/foreground-fixture.mjs';
import {AppClient} from '../scripts/client.mjs';
import {resolveTarget} from '../scripts/assertions.mjs';
import {Evidence,inspectRun} from '../scripts/evidence.mjs';

test('real desktop focus preserves a maximized background target and verifies literal foreground HWND',async()=>{
  const a=await fixture('A'),c=await AppClient.connect();let session,b,bs;
  const evidence=await Evidence.begin({version:1,id:'foreground-desktop',inputs:['skills/engineering/app-use/native/Fixture/ForegroundFixture.cs']});
  try {
    await a.state('maximize');b=await fixture('B');
    session=(await c.request('prepare',{kind:'desktop',hwnd:String(a.hwnd),pid:a.pid})).session;
    assert.notEqual((await a.state()).foreground,a.hwnd,'target starts in background');
    let o=await c.request('observe',{session});
    const focused=await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    const actual=await a.state();evidence.event('focus',{diagnostics:focused.diagnostics,actual});
    assert.equal(actual.foreground,a.hwnd,'independent fixture readback');
    assert.equal(actual.maximized,true,'foreground activation preserves maximized state');
    assert.equal(focused.diagnostics.foreground.verified,true);
    assert.equal(Number(focused.diagnostics.foreground.hwnd),a.hwnd);
    await a.state('minimize');
    o=await c.request('observe',{session});
    const restored=await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    const restoredState=await a.state();
    assert.equal(restoredState.minimized,false);
    assert.equal(restoredState.foreground,a.hwnd);
    evidence.event('restored',{diagnostics:restored.diagnostics,actual:restoredState});
    o=restored.observation;
    assert.equal(resolveTarget(o,{name:'app-use-focus-fixture-v1'}).name,'app-use-focus-fixture-v1');
    evidence.report.build={status:'verified',readback:'app-use-focus-fixture-v1'};
    bs=(await c.request('prepare',{kind:'desktop',hwnd:String(b.hwnd),pid:b.pid})).session;
    const bo=await c.request('observe',{session:bs});
    await c.request('act',{session:bs,observation:bo.id,action:{type:'focus'}});
    o=await c.request('observe',{session});
    await c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{name:'Focus apply',role:'button'}).id}});
    o=await c.request('observe',{session});assert.equal(resolveTarget(o,{name:'Focus result',role:'edit'}).value,'Focused action complete');
    const report=await evidence.finish('pass',{assertion:'independent HWND, maximized state, native verification and literal click result'});
    assert.equal((await inspectRun(report.runDir)).integrity,'verified');console.log('Foreground evidence: '+report.runDir);
  }catch(e){console.log('Foreground failure: '+(await evidence.finish('error',{error:e.message})).runDir);throw e;}
  finally{if(session)await c.request('stop',{session}).catch(()=>{});if(bs)await c.request('stop',{session:bs}).catch(()=>{});c.close();a.close();b?.close();}
});

test('focus rejects a target that closes before the result is returned',async()=>{
  const a=await fixture('Closing target'),c=await AppClient.connect();let session;
  try {
    session=(await c.request('prepare',{kind:'desktop',hwnd:String(a.hwnd),pid:a.pid})).session;
    let o=await c.request('observe',{session});
    o=(await c.request('act',{session,observation:o.id,action:{type:'focus'}})).observation;
    assert.equal((await a.state('close-soon')).foreground,a.hwnd);
    await assert.rejects(c.request('act',{session,observation:o.id,action:{type:'focus'}}),/expired|changed|foreground|exited|process/i);
  }finally{if(session)await c.request('stop',{session}).catch(()=>{});c.close();a.close();}
});
