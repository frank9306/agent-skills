import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BrowserBridge} from '../extension/bridge.mjs';

// Only the external Chrome/CDP boundary is simulated; exercise the public session operations.
function browser() {
  const listeners={},inputs=[];
  const state={active:true,focused:true,url:'https://fixture.invalid/',paint:0,sensitive:false,disabled:false,width:800,height:600,dpr:2};
  const event=k=>({addListener:f=>{listeners[k]=f;}});
  const api={debugger:{onEvent:event('event'),onDetach:event('detach'),async attach(){},async detach(){},async sendCommand(source,method,p={}) {
    if(method==='Runtime.enable')listeners.event(source,'Runtime.executionContextCreated',{context:{id:1,auxData:{isDefault:true,frameId:'main'}}});
    if(method==='Page.createIsolatedWorld')return {executionContextId:2};
    if(method==='Page.getFrameTree')return {frameTree:{frame:{id:'main'},...(state.extraFrame?{childFrames:[{frame:{id:'unscanned-frame'}}]}:{})}};
    if(method==='Runtime.evaluate') {
      if(p.expression.includes('"sensitive"'))return {result:{value:state.sensitive}};
      if(p.expression.includes('"visual-viewport"'))return {result:{value:{width:state.width,height:state.height,scrollX:0,scrollY:0,dpr:state.dpr,scale:1,offsetLeft:0,offsetTop:0}}};
      if(p.expression.includes('"visual-probe"')) {
        if(state.disabled)throw Error('visual target disabled');
        return {result:{value:{id:'canvas',role:'generic',name:'',bounds:{x:0,y:0,width:800,height:600}}}};
      }
      return {result:{value:{complete:true,nodes:[],viewport:{width:state.width,height:state.height}}}};
    }
    if(method==='Page.captureScreenshot') {
      const b=Buffer.alloc(32);Buffer.from('89504e470d0a1a0a0000000d49484452','hex').copy(b);b.writeUInt32BE(1600,16);b.writeUInt32BE(1200,20);b[31]=state.paint;
      state.afterCapture?.();return {data:b.toString('base64')};
    }
    if(method.startsWith('Input.')){inputs.push({method,...p});if(p.type==='mouseMoved')state.afterMouseMove?.();}
    return {};
  }},tabs:{onCreated:event('created'),async get(){return {id:7,windowId:2,title:'Fixture',url:state.url,active:state.active};},async query(){return [];}},windows:{async get(){return {focused:state.focused};}}};
  const bridge=new BrowserBridge(api);
  return {bridge,state,inputs,listeners};
}
const region={x:200,y:100,width:160,height:80,description:'Single painted play icon'};

test('visual observation binds image pixels to a single current browser click',async()=>{
  const {bridge,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  const o=await bridge.handle('visual-observe',{session});
  assert.equal(o.coordinateSpace,'image-pixels');assert.equal(o.image.width,1600);assert.equal(o.image.height,1200);
  const result=await bridge.handle('visual-click',{session,observation:o.id,target:region});
  assert.equal(result.actionExecuted,true);assert.equal(result.goalVerified,false);
  assert.deepEqual(inputs.filter(i=>i.type==='mousePressed').map(i=>({x:i.x,y:i.y})),[{x:140,y:70}]);
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
});

test('visual click refuses foreground loss while recapturing and consumes its token',async()=>{
  const {bridge,state,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  const o=await bridge.handle('visual-observe',{session});
  state.afterCapture=()=>{state.focused=false;};
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/focused|foreground/);
  assert.equal(inputs.length,0);
  state.afterCapture=null;state.focused=true;
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
});

test('visual click rejects changed pixels, geometry, privacy, disabled hits and invalid rectangles without input',async()=>{
  const {bridge,state,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  for(const [mutate,restore,pattern] of [
    [()=>state.paint++,()=>state.paint--,/changed/],
    [()=>state.width--,()=>state.width++,/changed/],
    [()=>state.sensitive=true,()=>state.sensitive=false,/sensitive/],
    [()=>state.disabled=true,()=>state.disabled=false,/disabled/],
    [()=>state.active=false,()=>state.active=true,/active/],
    [()=>state.url='https://outside.invalid/',()=>state.url='https://fixture.invalid/',/origin/]
  ]) {
    const o=await bridge.handle('visual-observe',{session});mutate();
    await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),pattern);restore();
    await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
  }
  for(const target of [{...region,x:-1},{...region,width:0},{...region,x:1599},{...region,x:NaN},{...region,description:''},{}]) {
    const o=await bridge.handle('visual-observe',{session});
    await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target}),/rectangle/);
    await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
  }
  assert.equal(inputs.length,0);
});

test('normal observation, pending stop and navigation invalidate visual tokens',async()=>{
  const {bridge,inputs,listeners}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  let o=await bridge.handle('visual-observe',{session});
  await bridge.handle('observe',{session});
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
  o=await bridge.handle('visual-observe',{session});
  listeners.event({tabId:7},'Page.frameNavigated',{});
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
  o=await bridge.handle('visual-observe',{session});
  const pending=bridge.handle('visual-click',{session,observation:o.id,target:region});
  await bridge.handle('stop',{session});await assert.rejects(pending,/unavailable|stopped/);
  assert.equal(inputs.length,0);
});

test('expired click attempts consume the visual token',async()=>{
  const {bridge,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  const o=await bridge.handle('visual-observe',{session});
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region,expiresAt:1}),/expired/);
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/stale|consumed/);
  assert.equal(inputs.length,0);
});

test('visual capture refuses sensitive content that appears during screenshot acquisition',async()=>{
  const {bridge,state,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  state.afterCapture=()=>{state.sensitive=true;};
  await assert.rejects(bridge.handle('visual-observe',{session}),/sensitive/);
  assert.equal(inputs.length,0);
});

test('visual observation cannot expire during recapture and then dispatch input',async()=>{
  const {bridge,state,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  const now=Date.now;let elapsed=0;Date.now=()=>now()+elapsed;
  try {
    const o=await bridge.handle('visual-observe',{session});
    state.afterCapture=()=>{elapsed=60001;};
    await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/expired|stale/);
    assert.equal(inputs.length,0);
  } finally {Date.now=now;}
});

test('visual capture refuses a frame appearing before its privacy context is available',async()=>{
  const {bridge,state}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  state.afterCapture=()=>{state.extraFrame=true;};
  await assert.rejects(bridge.handle('visual-observe',{session}),/frame coverage incomplete/);
});

test('visual click refuses a pointer-induced repaint before pressing the button',async()=>{
  const {bridge,state,inputs}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  const o=await bridge.handle('visual-observe',{session});state.afterMouseMove=()=>{state.paint++;};
  await assert.rejects(bridge.handle('visual-click',{session,observation:o.id,target:region}),/changed/);
  assert.equal(inputs.filter(i=>i.type==='mousePressed').length,0);
});

test('navigation during screenshot acquisition cannot issue a new visual token',async()=>{
  const {bridge,state,listeners}=browser();const {session}=await bridge.handle('prepare',{tabId:7});
  state.afterCapture=()=>listeners.event({tabId:7},'Page.frameNavigated',{});
  await assert.rejects(bridge.handle('visual-observe',{session}),/changed/);
});
