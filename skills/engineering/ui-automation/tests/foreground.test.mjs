import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BrowserBridge} from '../extension/bridge.mjs';

function boundary({denied=false,nativeFocus}={}) {
  const listeners={},calls=[],tabs=new Map([[7,{id:7,windowId:2,title:'Fixture',url:'https://fixture.invalid/',active:false}]]);
  const win={id:2,focused:false,state:'normal'};
  const event=k=>({addListener:f=>{listeners[k]=f;}});
  const api={debugger:{onEvent:event('event'),onDetach:event('detach'),async attach(){},async detach(){},async sendCommand(source,method,p={}) {
    if(method==='Runtime.enable')listeners.event(source,'Runtime.executionContextCreated',{context:{id:1,auxData:{isDefault:true,frameId:'main'}}});
    if(method==='Page.createIsolatedWorld')return {executionContextId:2};
    if(method==='Page.getFrameTree')return {frameTree:{frame:{id:'main'}}};
    if(method==='Runtime.evaluate')return {result:{value:{complete:true,nodes:[],viewport:{width:800,height:600}}}};
    return {};
  }},tabs:{onCreated:event('created'),async get(id){if(!tabs.has(id))throw Error('tab closed');return {...tabs.get(id)};},async update(id,p){calls.push(['tab',id,p]);if(p.active)for(const t of tabs.values())t.active=false;Object.assign(tabs.get(id),p);return {...tabs.get(id)};}},windows:{async get(){return {...win};},async update(id,p){calls.push(['window',id,p]);if(!denied)Object.assign(win,p);return {...win};}}};
  return {bridge:new BrowserBridge(api,nativeFocus),calls,tabs,win,api,listeners};
}

function markerTabs(b) {
  b.api.runtime={getURL:p=>'chrome-extension://controlled/'+p};
  b.api.tabs.create=async p=>{const tab={id:8,windowId:p.windowId,url:p.url,active:true};for(const t of b.tabs.values())t.active=false;b.tabs.set(8,tab);return tab;};
  b.api.tabs.remove=async id=>{b.tabs.delete(id);};
  return b;
}

test('focus refuses success when Chrome did not acquire the foreground',async()=>{
  const {bridge}=boundary({denied:true});
  const {session}=await bridge.handle('prepare',{tabId:7});
  const o=await bridge.handle('observe',{session});
  await assert.rejects(bridge.handle('act',{session,observation:o.id,action:{type:'focus'}}),/foreground|focus/i);
});

test('focus uses a native fallback for the exact window and removes its marker tab',async()=>{
  let requested;
  const b=markerTabs(boundary({denied:true,nativeFocus:async p=>{requested=p;b.win.focused=true;return {verified:true,hwnd:1234,pid:42};}}));
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  const r=await b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}});
  assert.equal(requested.session,session);
  assert.match(requested.marker,/^[0-9a-f-]{36}$/);
  assert.equal(r.diagnostics.foreground.verified,true);
  assert.equal(r.diagnostics.foreground.method,'native');
  assert.equal(b.tabs.size,1);
  assert.equal(b.tabs.get(7).active,true);
});

test('native failure still removes its marker when the target tab closed',async()=>{
  const b=markerTabs(boundary({denied:true,nativeFocus:async()=>{b.tabs.delete(7);throw Error('native denied');}}));
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  await assert.rejects(b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}}));
  assert.equal(b.tabs.has(8),false,'no orphan activation tab');
});

test('ordinary input acquires the bound foreground before dispatch',async()=>{
  const b=boundary();
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  const r=await b.bridge.handle('act',{session,observation:o.id,action:{type:'key',key:'Tab'}});
  assert.equal(b.win.focused,true);
  assert.equal(b.tabs.get(7).active,true);
  assert.equal(r.diagnostics.foreground.verified,true);
});

test('stop during native activation removes its marker and cannot report focus success',async()=>{
  let session;
  const b=markerTabs(boundary({denied:true,nativeFocus:async()=>{await b.bridge.handle('stop',{session});return {verified:true};}}));
  ({session}=await b.bridge.handle('prepare',{tabId:7}));
  const o=await b.bridge.handle('observe',{session});
  await assert.rejects(b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}}),/stopped/);
  assert.equal(b.tabs.has(8),false);
  assert.equal(b.tabs.has(7),true);
});

test('focus restores a minimized browser and verifies the active target tab',async()=>{
  const b=boundary();b.win.state='minimized';
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  const r=await b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}});
  assert.equal(b.win.state,'normal');
  assert.equal(b.tabs.get(7).active,true);
  assert.equal(r.diagnostics.foreground.verified,true);
});

test('focus cannot report success when foreground is lost during its final observation',async()=>{
  const b=boundary();const send=b.api.debugger.sendCommand;
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  b.api.debugger.sendCommand=async(...args)=>{const result=await send(...args);if(args[1]==='Runtime.evaluate')b.win.focused=false;return result;};
  await assert.rejects(b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}}),/foreground.*lost|lost.*foreground/i);
});

test('a connected native host independently verifies focus even when Chrome reports success',async()=>{
  let nativeCalls=0;
  const b=markerTabs(boundary({nativeFocus:async()=>{nativeCalls++;return {verified:true,hwnd:1234,pid:42};}}));
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  const r=await b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}});
  assert.equal(nativeCalls,1);
  assert.equal(r.diagnostics.foreground.native.hwnd,1234);
  assert.equal(b.tabs.size,1);
});

test('detach during native activation cleans its marker exactly once',async()=>{
  const b=markerTabs(boundary({denied:true,nativeFocus:async()=>{b.listeners.detach({tabId:7});return {verified:true};}}));
  let removed=0;
  b.api.tabs.remove=async id=>{removed++;await new Promise(r=>setTimeout(r,20));b.tabs.delete(id);};
  const {session}=await b.bridge.handle('prepare',{tabId:7});
  const o=await b.bridge.handle('observe',{session});
  await assert.rejects(b.bridge.handle('act',{session,observation:o.id,action:{type:'focus'}}),/stopped/);
  assert.equal(b.tabs.has(8),false);
  assert.equal(removed,1);
});
