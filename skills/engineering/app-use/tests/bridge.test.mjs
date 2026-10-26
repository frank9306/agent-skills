import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BrowserBridge} from '../extension/bridge.mjs';

function boundary(){
  const listeners={},calls=[];const event=k=>({addListener:f=>{listeners[k]=f;}});
  const tab={id:7,windowId:2,url:'https://fixture.invalid/',title:'Controlled',active:true};
  const api={debugger:{onEvent:event('event'),onDetach:event('detach'),async attach(t){calls.push(['attach',t]);},async detach(t){calls.push(['detach',t]);listeners.detach?.(t);},async sendCommand(t,m){calls.push([m,t]);return {};}},tabs:{onCreated:event('created'),async get(id){assert.equal(id,7);return tab;},async query(){return [tab];},async remove(id){calls.push(['remove',id]);}}};
  return {bridge:new BrowserBridge(api),calls,listeners,tab};
}
test('browser transport refuses expired/unbound commands and requires an explicit selected tab',async()=>{
  const {bridge,calls}=boundary();
  await assert.rejects(bridge.handle('prepare',{}),/explicit tabId/);
  await assert.rejects(bridge.handle('prepare',{tabId:7,allowOrigins:['https://fixture.invalid/path']}),/exact origins/);
  await assert.rejects(bridge.handle('sessions',{expiresAt:1}),/expired/);
  await assert.rejects(bridge.handle('act',{session:'missing'}),/unavailable/);
  assert.equal(calls.length,0);
});
test('disconnect invalidates sessions; stop detaches and preserves pre-existing tabs',async()=>{
  const {bridge,calls,listeners}=boundary();
  let s=await bridge.handle('prepare',{tabId:7});
  await assert.rejects(bridge.handle('act',{session:s.session,observation:'old',action:{type:'click'}}),/stale/);
  listeners.detach({tabId:7});await assert.rejects(bridge.handle('observe',{session:s.session}),/unavailable/);
  s=await bridge.handle('prepare',{tabId:7});
  await bridge.handle('stop',{session:s.session,closeCreated:true});
  assert.equal(calls.filter(c=>c[0]==='remove').length,0);
  assert.equal(calls.filter(c=>c[0]==='detach').length,1);
});
