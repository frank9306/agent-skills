import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {AppClient,skillRoot} from '../scripts/client.mjs';
import {resolveTarget} from '../scripts/assertions.mjs';
import {Evidence,inspectRun} from '../scripts/evidence.mjs';

test('normal Chrome visual click reaches painted Canvas and raster-image controls with literal readback',async()=>{
  const html=await fs.readFile(new URL('visual-fixture.html',import.meta.url));
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}`,c=await AppClient.connect();let session;
  const evidence=await Evidence.begin({version:1,id:'visual-browser-live',inputs:['skills/engineering/app-use/tests/visual-fixture.html','skills/engineering/app-use/tests/visual-live.test.mjs']});
  try {
    const {extensions}=await c.request('doctor');assert.ok(extensions.length,'normal Chrome bridge required');
    ({session}=await c.request('prepare',{kind:'browser',connection:extensions[0],createUrl:url,allowOrigins:[url]}));
    let o=await c.request('observe',{session});
    await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    o=await c.request('observe',{session});assert.equal(resolveTarget(o,{selector:'#build'}).name,'app-use-visual-v1');
    evidence.report.build={status:'verified',readback:'app-use-visual-v1'};
    for(const [selector,cx,cy,result,expected]of [['#surface',130,90,'#canvas-result','Canvas play selected'],['#raster',130,80,'#image-result','Image check selected']]) {
      o=await c.request('observe',{session});
      await c.request('act',{session,observation:o.id,action:{type:'scrollIntoView',target:resolveTarget(o,{selector}).id}});
      o=await c.request('observe',{session});
      const node=resolveTarget(o,{selector});assert.equal(o.nodes.filter(n=>n.name==='Play'||n.name==='Check').length,0,'painted controls have no text nodes');
      const v=await c.request('visual-observe',{session});
      const name=selector.slice(1)+'.png',bytes=Buffer.from(v.image.data,'base64');
      await fs.writeFile(path.join(evidence.dir,name),bytes);
      evidence.report.artifacts.push({path:name,sha256:createHash('sha256').update(bytes).digest('hex')});
      // Fixed fixture geometry is test input; daily operation must instead view the returned screenshot.
      const sx=v.image.width/o.viewport.width,sy=v.image.height/o.viewport.height;
      const target={x:(node.bounds.x+cx-20)*sx,y:(node.bounds.y+cy-20)*sy,width:40*sx,height:40*sy,description:selector==='#surface'?'Painted play icon':'Raster check icon'};
      const action=await c.request('visual-click',{session,observation:v.id,target});
      assert.equal(action.actionExecuted,true);assert.equal(action.goalVerified,false);
      assert.equal(resolveTarget(action.observation,{selector:result}).name,expected);
      evidence.event('visual-action',{target,diagnostics:action.diagnostics,result:expected});
      await assert.rejects(c.request('visual-click',{session,observation:v.id,target}),/stale|consumed/);
    }
    let v=await c.request('visual-observe',{session});
    await c.request('adapter',{session,operation:'eval',fn:'()=>document.querySelector("#repaint").click()'});
    await assert.rejects(c.request('visual-click',{session,observation:v.id,target:{x:10,y:10,width:20,height:20,description:'Old image'}}),/stale|consumed/);
    v=await c.request('visual-observe',{session});
    // A repaint outside app-use must be caught by the actual screenshot comparison.
    await c.request('adapter',{session,operation:'eval',fn:'()=>setTimeout(()=>{document.body.style.background="#ddeeff"},150)'});
    v=await c.request('visual-observe',{session});await new Promise(r=>setTimeout(r,250));
    await assert.rejects(c.request('visual-click',{session,observation:v.id,target:{x:10,y:10,width:20,height:20,description:'Changed image'}}),/changed/);
    const report=await evidence.finish('pass',{identity:o.identity,assertions:'Canvas and PNG-image real clicks, literal results, consumed token and actual repaint refusal'});
    assert.equal((await inspectRun(report.runDir)).integrity,'verified');console.log('Visual browser evidence: '+report.runDir);
  } catch(e){console.log('Visual browser failure: '+(await evidence.finish('error',{error:e.message})).runDir);throw e;}
  finally{if(session)await c.request('stop',{session,closeCreated:true}).catch(()=>{});c.close();await new Promise(r=>server.close(r));}
});
