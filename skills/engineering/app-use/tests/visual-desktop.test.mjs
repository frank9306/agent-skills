import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {AppClient,stateRoot} from '../scripts/client.mjs';
import {resolveTarget,validateObservation} from '../scripts/assertions.mjs';
import {Evidence} from '../scripts/evidence.mjs';

test('desktop visual screenshot locates a painted button with no per-button UIA node',async()=>{
  let app,c,session,evidence;
  try{
    evidence=await Evidence.begin({version:1,id:'desktop-visual-painted',inputs:['skills/engineering/app-use/native/Fixture/Program.cs','skills/engineering/app-use/tests/visual-desktop.test.mjs']});
    c=await AppClient.connect();
    app=spawn(process.env.APP_USE_VISUAL_FIXTURE||path.join(stateRoot,'fixture/Fixture.exe'),['--visual'],{stdio:'ignore',windowsHide:false});
    let w;for(let i=0;i<60;i++){w=(await c.request('sessions',{discoverDesktop:true})).find(w=>w.pid===app.pid&&w.title==='app-use visual fixture');if(w)break;await new Promise(r=>setTimeout(r,100));}
    assert.ok(w,'controlled painted fixture appeared');session=(await c.request('prepare',w)).session;
    await new Promise(r=>setTimeout(r,300));
    let o=await c.request('observe',{session});
    o=(await c.request('act',{session,observation:o.id,action:{type:'focus'}})).observation;
    const buildAssertion={target:{name:'app-use-visual-desktop-v1',role:'text'},property:'name',equals:'app-use-visual-desktop-v1'};
    const buildReadback=validateObservation(o,buildAssertion);assert.equal(buildReadback.status,'pass','running fixture exposes literal build identity');
    evidence.report.build={status:'verified',readback:{assertion:buildAssertion,...buildReadback}};
    const shot=await c.request('visual-observe',{session});
    assert.equal(shot.coordinateSpace,'image-pixels');assert.equal(shot.image.mime,'image/png');
    assert.ok(shot.image.width>0&&shot.image.height>0);assert.equal(shot.identity.session,session);
    const screenshot=Buffer.from(shot.image.data,'base64'),screenshotName='visual-initial.png';
    await fs.writeFile(path.join(evidence.dir,screenshotName),screenshot);
    evidence.report.artifacts.push({path:screenshotName,sha256:createHash('sha256').update(screenshot).digest('hex')});
    const surface=resolveTarget(o,{name:'Painted surface'}),root=o.nodes.find(n=>n.role==='window').bounds;
    assert.equal(o.nodes.some(n=>n.role==='button'&&n.name==='Painted action'),false,'painted icon has no separate semantic button');
    const region={x:surface.bounds.x-root.x+surface.bounds.width*.1,y:surface.bounds.y-root.y+surface.bounds.height*.2,width:surface.bounds.width*.4,height:surface.bounds.height*.6,description:'Blue rectangle with white play triangle'};
    evidence.event('visual-observation',{id:shot.id,identity:shot.identity,width:shot.image.width,height:shot.image.height});
    const clicked=await c.request('visual-click',{session,observation:shot.id,target:region});
    assert.equal(clicked.actionExecuted,true);assert.equal(clicked.goalVerified,false);
    assert.equal(validateObservation(clicked.observation,{target:{name:'Visual result',role:'edit'},property:'value',equals:'Painted action complete'}).status,'pass');
    evidence.event('visual-click',{target:region,result:clicked});
    const click=(snapshot,target=region)=>c.request('visual-click',{session,observation:snapshot?.id,target});
    const observe=()=>c.request('visual-observe',{session});
    const ordinary=async action=>{const current=await c.request('observe',{session});return c.request('act',{session,observation:current.id,action:{...action,...(action.match?{target:resolveTarget(current,action.match).id}:{})}});};
    await assert.rejects(click(shot),/stale visual/,'used token cannot click twice');
    let v=await observe();await assert.rejects(click(v,{...region,x:-1}),/outside captured/);await assert.rejects(click(v),/stale visual/,'failed attempt consumes token');
    v=await observe();await assert.rejects(c.request('visual-click',{session,target:region}),/stale visual/);await assert.rejects(click(v),/stale visual/);
    for(const method of ['observe','capture']){v=await observe();await c.request(method,{session});await assert.rejects(click(v),/stale visual/,`${method} invalidates visual token`);}
    v=await observe();await assert.rejects(c.request('act',{session,observation:'stale',action:{type:'key',key:'Tab'}}),/stale observation/);await assert.rejects(click(v),/stale visual/,'even a failed ordinary action invalidates visual token');
    o=await c.request('observe',{session});
    const password=o.nodes.find(n=>n.sensitive),windowBounds=o.nodes.find(n=>n.role==='window').bounds;
    assert.ok(password,'password control is present but its value omitted');
    v=await observe();await assert.rejects(click(v,{x:password.bounds.x-windowBounds.x,y:password.bounds.y-windowBounds.y,width:password.bounds.width,height:password.bounds.height,description:'Masked password region'}),/sensitive masked/);
    await ordinary({type:'click',match:{name:'Arm repaint',role:'button'}});
    v=await observe();await new Promise(r=>setTimeout(r,1700));await assert.rejects(click(v),/screenshot changed/);
    await ordinary({type:'click',match:{name:'Arm move',role:'button'}});
    v=await observe();await new Promise(r=>setTimeout(r,1700));await assert.rejects(click(v),/geometry or DPI changed/);
    await ordinary({type:'click',match:{name:'Arm hover',role:'button'}});
    v=await observe();await assert.rejects(click(v),/screenshot changed/,'a pointer hover repaint must stop before mouse-down');
    await ordinary({type:'click',match:{name:'Arm disable',role:'button'}});
    await new Promise(r=>setTimeout(r,1700));v=await observe();await assert.rejects(click(v),/disabled/);
    o=await c.request('observe',{session});assert.equal(validateObservation(o,{target:{name:'Visual result',role:'edit'},property:'value',equals:'Painted action complete'}).status,'pass','rejected visual actions preserve literal result');
    evidence.event('guard-verification',{singleUse:true,invalidRegion:true,missingToken:true,ordinaryInvalidation:true,passwordOverlap:true,repaint:true,geometry:true,hoverRepaint:true,disabled:true});
    await evidence.capture(c,session);
    const report=await evidence.finish('pass',{identity:o.identity});console.log(`Desktop visual evidence: ${report.runDir}`);
  }catch(e){if(evidence){const report=await evidence.finish('error',{error:e.message});console.log(`Failed desktop visual evidence: ${report.runDir}`);}throw e;}
  finally{if(session)await c.request('stop',{session}).catch(()=>{});c?.close();app?.kill();}
});
