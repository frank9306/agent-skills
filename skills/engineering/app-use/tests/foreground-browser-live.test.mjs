import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {fixture} from './helpers/foreground-fixture.mjs';
import {AppClient} from '../scripts/client.mjs';
import {resolveTarget} from '../scripts/assertions.mjs';
import {Evidence,inspectRun} from '../scripts/evidence.mjs';

test('normal Chrome focus verifies the OS HWND, restores minimization and cleans native marker tabs',async()=>{
  const token=randomUUID(),title='app-use focus browser '+token;
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><title>${title}</title><h1 id="build">app-use-focus-browser-v1</h1><button id="apply" onclick="document.querySelector('#result').textContent='Browser foreground action complete'">Apply focus fixture</button><output id="result">Pending</output>`);});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}`,c=await AppClient.connect();let session,ds,blocker;
  const evidence=await Evidence.begin({version:1,id:'foreground-normal-chrome',inputs:['skills/engineering/app-use/tests/foreground-browser-live.test.mjs','skills/engineering/app-use/native/Fixture/ForegroundFixture.cs']});
  try {
    const {extensions}=await c.request('doctor');assert.ok(extensions.length,'normal Chrome bridge required');
    ({session}=await c.request('prepare',{kind:'browser',connection:extensions[0],createUrl:url,allowOrigins:[url]}));
    blocker=await fixture('Browser blocker');
    ds=(await c.request('prepare',{kind:'desktop',hwnd:String(blocker.hwnd),pid:blocker.pid})).session;
    const allBefore=(await c.request('sessions')).filter(t=>t.kind==='browser').map(t=>t.tabId).sort();
    let nativeHwnd;
    for(let round=0;round<3;round++) {
      let d=await c.request('observe',{session:ds});await c.request('act',{session:ds,observation:d.id,action:{type:'focus'}});
      assert.equal((await blocker.state()).foreground,blocker.hwnd,'controlled blocker is foreground');
      let o=await c.request('observe',{session});
      const r=await c.request('act',{session,observation:o.id,action:{type:'focus'}});
      const actual=await blocker.state();nativeHwnd=r.diagnostics.foreground.native.hwnd;
      assert.equal(r.diagnostics.foreground.verified,true);
      assert.equal(r.diagnostics.foreground.markerRemoved,true,'Chrome readback confirms marker tab is gone');
      assert.equal(actual.foreground,nativeHwnd,'independent Win32 foreground HWND');
      assert.ok(actual.controlledTitle.startsWith(title+' - '),'literal target browser caption');
      assert.equal(resolveTarget(r.observation,{selector:'#build'}).name,'app-use-focus-browser-v1');
      const tabs=(await c.request('sessions')).filter(t=>t.kind==='browser');
      assert.deepEqual(tabs.map(t=>t.tabId).sort(),allBefore,'original tabs preserved');
      assert.equal(tabs.some(t=>t.title?.startsWith('app-use focus ')&&t.title!==title),false);
      evidence.event('background-focus',{round,diagnostics:r.diagnostics,actual});
    }
    await blocker.state(`browser-minimize:${nativeHwnd}:${token}`);
    let minimized;
    for(let retry=0;retry<20;retry++){minimized=await blocker.state(`browser-state:${nativeHwnd}:${token}`);if(minimized.browserMinimized)break;await new Promise(r=>setTimeout(r,25));}
    assert.equal(minimized.browserMinimized,true);
    let o=await c.request('observe',{session});
    const restored=await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    const actual=await blocker.state(`browser-state:${nativeHwnd}:${token}`);
    assert.equal(actual.browserMinimized,false);assert.equal(actual.foreground,nativeHwnd);
    evidence.event('minimized-focus',{diagnostics:restored.diagnostics,actual});
    o=await c.request('observe',{session});
    const d=await c.request('observe',{session:ds});await c.request('act',{session:ds,observation:d.id,action:{type:'focus'}});
    const input=await c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{selector:'#apply'}).id}});
    assert.equal(resolveTarget(input.observation,{selector:'#result'}).name,'Browser foreground action complete');
    assert.equal((await blocker.state()).foreground,nativeHwnd);
    evidence.event('input-recovery',{diagnostics:input.diagnostics,result:'Browser foreground action complete'});
    evidence.report.build={status:'verified',readback:'app-use-focus-browser-v1; app-use-focus-fixture-v1'};
    const report=await evidence.finish('pass',{assertion:'three background switches, minimized restoration, independent native HWND/caption, marker cleanup, literal click result'});
    assert.equal((await inspectRun(report.runDir)).integrity,'verified');console.log('Browser foreground evidence: '+report.runDir);
  }catch(e){console.log('Browser foreground failure: '+(await evidence.finish('error',{error:e.message})).runDir);throw e;}
  finally{if(session)await c.request('stop',{session,closeCreated:true}).catch(()=>{});if(ds)await c.request('stop',{session:ds}).catch(()=>{});blocker?.close();c.close();await new Promise(r=>server.close(r));}
});
