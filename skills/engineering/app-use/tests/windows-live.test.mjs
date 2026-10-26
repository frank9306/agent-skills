import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { AppClient, stateRoot } from '../scripts/client.mjs';
import { resolveTarget, validateObservation } from '../scripts/assertions.mjs';
import { Evidence, inspectRun } from '../scripts/evidence.mjs';

test('real UIA fixture: input/select/click/readback, stale and disabled guards, movement and secret redaction', async () => {
  const app = spawn(path.join(stateRoot, 'fixture/Fixture.exe'), [], { stdio:'ignore' });
  const c = await AppClient.connect();
  let session;
  const evidence=await Evidence.begin({version:1,id:'windows-fixture',inputs:['skills/engineering/app-use/native/Fixture/Program.cs']});
  try {
    let window;
    for (let i=0;i<40;i++) {
      window=(await c.request('sessions',{discoverDesktop:true})).find(w=>w.pid===app.pid && w.title==='app-use controlled fixture');
      if(window)break;
      await new Promise(r=>setTimeout(r,100));
    }
    assert.ok(window, 'controlled fixture appeared');
    session=(await c.request('prepare', window)).session;
    let o=await c.request('observe',{session});
    assert.equal(JSON.stringify(o).includes('CONTROLLED_SECRET'),false);
    const act=async a=>{let r;try{r=await c.request('act',{session,observation:o.id,action:a});}catch(e){throw new Error(`${a.type} ${a.target||''}: ${e.message}`);}o=r.observation;evidence.event('action',{action:a,observation:o});assert.equal(r.goalVerified,false);return r;};
    await act({type:'focus'});
    const old=o.id;
    await act({type:'fill',target:resolveTarget(o,{name:'Fixture input',role:'edit'}).id,text:'Controlled'});
    await assert.rejects(c.request('act',{session,observation:old,action:{type:'key',key:'Enter'}}),/stale/);
    o=await c.request('observe',{session});
    await act({type:'select',target:resolveTarget(o,{name:'Fixture choice',role:'combobox'}).id,value:'Beta'});
    await act({type:'click',target:resolveTarget(o,{name:'Apply fixture',role:'button'}).id});
    assert.equal(validateObservation(o,{target:{name:'Fixture result',role:'edit'},property:'value',equals:'Controlled:Beta'}).status,'pass');
    assert.equal(validateObservation(o,{target:{name:'Fixture result',role:'edit'},property:'value',equals:'wrong'}).status,'fail');
    await assert.rejects(c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{name:'Disabled fixture',role:'button'}).id}}),/disabled/);
    o=await c.request('observe',{session});
    const before=o.nodes.find(n=>n.role==='window').bounds;
    await act({type:'move',x:before.x+30,y:before.y+20});
    const after=o.nodes.find(n=>n.role==='window').bounds;
    assert.equal(Math.round(after.x-before.x),30);
    assert.ok(o.identity.dpi>=96);
    for(let retry=0;retry<20&&!o.nodes.some(n=>n.name==='Obstruct action'&&n.role==='checkbox');retry++){await new Promise(r=>setTimeout(r,100));o=await c.request('observe',{session});}
    await act({type:'click',target:resolveTarget(o,{name:'Obstruct action',role:'checkbox'}).id});
    await assert.rejects(c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{name:'Apply fixture',role:'button'}).id}}),/occluded/);
    o=await c.request('observe',{session});
    await act({type:'click',target:resolveTarget(o,{name:'Obstruct action',role:'checkbox'}).id});
    await act({type:'click',target:resolveTarget(o,{name:'Apply fixture',role:'button'}).id});
    await act({type:'click',target:resolveTarget(o,{name:'Fixture',role:'menuitem'}).id});
    assert.ok(o.nodes.some(n=>n.name==='Open dialog'));
    await act({type:'click',target:resolveTarget(o,{name:'Open dialog',role:'menuitem'}).id});
    const dialog=(await c.request('sessions',{discoverDesktop:true})).find(w=>w.pid===app.pid&&w.title==='app-use dialog');
    assert.ok(dialog,'real modal dialog appeared');
    const ds=(await c.request('prepare',dialog)).session;
    let d=await c.request('observe',{session:ds});
    const focus=await c.request('act',{session:ds,observation:d.id,action:{type:'focus'}});d=focus.observation;
    await c.request('act',{session:ds,observation:d.id,action:{type:'click',target:resolveTarget(d,{automationId:'2',role:'button'}).id}});
    await c.request('stop',{session:ds});
    o=await c.request('observe',{session});await act({type:'focus'});
    const shot=await c.request('capture',{session});
    assert.equal(shot.mime,'image/png');assert.ok(shot.data.length>100);
    await evidence.capture(c,session);
    const report=await evidence.finish('pass',{identity:o.identity,assertions:'literal result, stale/disabled/obstructed rejection, menu/modal, movement and current DPI'});
    assert.equal((await inspectRun(report.runDir)).integrity,'verified');
    console.log(`Windows evidence: ${report.runDir}; DPI ${o.identity.dpi}`);
  } catch(e){const report=await evidence.finish('error',{error:e.message});console.log(`Failed Windows evidence: ${report.runDir}`);throw e;}
  finally {
    if(session)await c.request('stop',{session});
    c.close();app.kill();
  }
});
