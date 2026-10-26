import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { AppClient, stateRoot, skillRoot } from '../scripts/client.mjs';
import { resolveTarget, validateObservation } from '../scripts/assertions.mjs';
import { Evidence } from '../scripts/evidence.mjs';

test('normal Chrome native bridge: existing session, controls, frames, files, tabs and reconnect', async () => {
  const server=http.createServer((req,res)=>{
    res.setHeader('Content-Type','text/html; charset=utf-8');
    if(req.url==='/cleanup'){res.setHeader('Set-Cookie','app_use_fixture_session=; Max-Age=0; Path=/; HttpOnly');res.end('<p>Cleaned</p>');return;}
    if(req.url.startsWith('/frame')){res.end('<button id="frame-button" onclick="this.textContent=\'Frame done\'">Frame action</button>');return;}
    if(req.url==='/setup')res.setHeader('Set-Cookie','app_use_fixture_session=controlled; Path=/; HttpOnly; SameSite=Lax');
    const port=server.address().port;
    res.end(`<!doctype html><title>app-use browser fixture</title><style>body{font:16px Arial}button,input,select{margin:8px}#cover{position:fixed;inset:0;z-index:100;background:#aaa;display:none}</style><h1 id="ready">Ready</h1><p id="login">${req.headers.cookie?.includes('app_use_fixture_session=controlled')?'Session reused':'Session prepared'}</p><input id="input" aria-label="Fixture input"><select id="choice" aria-label="Fixture choice"><option value="a">Alpha</option><option value="b">Beta</option></select><button id="apply" onclick="document.querySelector('#result').textContent=document.querySelector('#input').value+':'+document.querySelector('#choice').value">Apply fixture</button><output id="result">Pending</output><button id="dynamic" onclick="this.outerHTML='<button id=dynamic>Replacement</button>'">Replace fixture</button><button id="disabled" disabled>Disabled fixture</button><input type="file" id="upload" aria-label="Fixture file" onchange="this.files[0].text().then(text=>document.querySelector('#file-result').textContent=this.files[0].name+':'+text)"><output id="file-result">No file</output><button id="alert" onclick="alert('Controlled alert')">Alert fixture</button><button id="popup" onclick="const active=navigator.userActivation.isActive;const w=window.open('/popup','_blank');document.querySelector('#popup-status').textContent=active+':'+!!w">Popup fixture</button><output id="popup-status">Unattempted</output><button id="toggle" onclick="document.querySelector('#apply').disabled=!document.querySelector('#apply').disabled">Toggle disabled</button><iframe title="same frame" src="/frame-same"></iframe><iframe title="cross frame" src="http://127.0.0.2:${port}/frame-cross"></iframe><div id="cover"></div>`);
  });
  await new Promise(r=>server.listen(0,'0.0.0.0',r));
  const url=`http://127.0.0.1:${server.address().port}`,c=await AppClient.connect();
  const evidence=await Evidence.begin({version:1,id:'browser-native-live',inputs:['skills/engineering/app-use/tests/browser-live.test.mjs']});
  let session;
  try {
    const doctor=await c.request('doctor');assert.ok(doctor.extensions.length,'real bridge must already be connected in normal Chrome');
    const created=await c.request('prepare',{kind:'browser',connection:doctor.extensions[0],createUrl:url+'/setup',allowOrigins:[url,'http://127.0.0.2:'+server.address().port],trackPopups:true});
    session=created.session;const tab={tabId:created.tabId,connection:doctor.extensions[0]};
    let o=await c.request('observe',{session});
    const act=async action=>{let result;try{result=await c.request('act',{session,observation:o.id,action});}catch(e){throw Error(`${action.type}: ${e.message}`);}o=result.observation;evidence.event('action',{action,observation:o,diagnostics:result.diagnostics});assert.equal(result.goalVerified,false);return result;};
    await act({type:'focus'});
    await act({type:'navigate',url:url+'/'});
    o=await c.request('observe',{session});
    assert.equal(validateObservation(o,{target:{selector:'#login',context:o.nodes.find(n=>n.selector==='#login').context},property:'name',equals:'Session reused'}).status,'pass');
    await act({type:'fill',target:resolveTarget(o,{selector:'#input'}).id,text:'Controlled'});
    await act({type:'select',target:resolveTarget(o,{selector:'#choice'}).id,value:'b'});
    await act({type:'click',target:resolveTarget(o,{selector:'#apply'}).id});
    assert.equal(validateObservation(o,{target:{selector:'#result'},property:'name',equals:'Controlled:b'}).status,'pass',JSON.stringify(o.nodes.filter(n=>['#input','#choice','#result'].includes(n.selector))));
    assert.equal(validateObservation(o,{target:{selector:'#result'},property:'name',equals:'wrong'}).status,'fail');
    await assert.rejects(c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{selector:'#disabled'}).id}}),/disabled/);
    o=await c.request('observe',{session});
    const frameButtons=o.nodes.filter(n=>n.selector==='#frame-button');assert.equal(frameButtons.length,2,'same-process and cross-site frame contexts observed');
    assert.ok(o.contexts.some(c=>c.sessionId),'actual OOPIF session observed');
    for(const frame of frameButtons){await act({type:'click',target:resolveTarget(o,{selector:'#frame-button',context:frame.context}).id});assert.equal(resolveTarget(o,{selector:'#frame-button',context:frame.context}).name,'Frame done');}
    const file=path.join(skillRoot,'.local','controlled-upload.txt');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,'sanitized fixture');
    await act({type:'files',target:resolveTarget(o,{selector:'#upload'}).id,files:[file]});
    assert.equal(resolveTarget(o,{selector:'#file-result'}).name,'controlled-upload.txt:sanitized fixture');
    await c.request('adapter',{session,operation:'eval',fn:'()=>{document.querySelector("#dynamic").outerHTML="<button id=dynamic>Replaced externally</button>"}'});
    await assert.rejects(c.request('act',{session,observation:o.id,action:{type:'click',target:resolveTarget(o,{selector:'#dynamic'}).id}}),/expired/);
    o=await c.request('observe',{session});
    await act({type:'click',target:resolveTarget(o,{selector:'#alert'}).id});
    assert.ok(o.nodes.some(n=>n.role==='dialog'&&n.name==='Controlled alert'));
    await act({type:'dialog',accept:true});
    await act({type:'click',target:resolveTarget(o,{selector:'#popup'}).id});
    let popup;for(let i=0;i<50;i++){popup=(await c.request('sessions')).find(t=>t.url===url+'/popup');if(popup)break;await new Promise(r=>setTimeout(r,100));}assert.ok(popup,'real popup tab discovered: '+resolveTarget(o,{selector:'#popup-status'}).name);
    // Explicit new scope for the task-created popup; do not adopt unrelated tabs.
    const ps=(await c.request('prepare',{kind:'browser',connection:popup.connection,tabId:popup.tabId,allowOrigins:[url]})).session;
    await c.request('stop',{session:ps});
    await evidence.capture(c,session);
    // Stop/reprepare preserves the tab unless closeCreated was explicitly requested.
    await c.request('stop',{session});
    await assert.rejects(c.request('observe',{session}),/unavailable/);
    session=(await c.request('prepare',{kind:'browser',connection:tab.connection,tabId:tab.tabId,allowOrigins:[url]})).session;
    o=await c.request('observe',{session});assert.equal(resolveTarget(o,{selector:'#login'}).name,'Session reused');
    await act({type:'focus'});
    await act({type:'fill',target:resolveTarget(o,{selector:'#input'}).id,text:'CONTROLLED_PRIVATE_INPUT',sensitive:true});
    assert.equal(JSON.stringify(o).includes('CONTROLLED_PRIVATE_INPUT'),false,'sensitive fill is redacted from returned observations');
    await assert.rejects(c.request('capture',{session}),/sensitive/);
    await act({type:'navigate',url:url+'/cleanup'});
    await c.request('stop',{session,closeCreated:true});session=null;
    const report=await evidence.finish('pass',{identity:o.identity,sharedState:'Controlled HttpOnly session set before attach and reused; fixture cookie cleaned. Original profile/tabs retained.',taskCreatedTabs:[tab.tabId,popup.tabId]});
    console.log(`Browser evidence: ${report.runDir}`);
  } catch(e){const r=await evidence.finish('error',{error:e.message});console.log(`Failed browser evidence: ${r.runDir}`);throw e;}
  finally {if(session)await c.request('stop',{session,closeCreated:true}).catch(()=>{});c.close();await new Promise(r=>server.close(r));}
});
