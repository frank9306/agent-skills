import { BrowserBridge } from './bridge.mjs';
const nativePending=new Map();
const bridge=new BrowserBridge(chrome,p=>new Promise((resolve,reject)=>{
  if(!port){reject(Error('native activation disconnected'));return;}
  const id=crypto.randomUUID(),timer=setTimeout(()=>{nativePending.delete(id);reject(Error('native activation timed out'));},Math.max(1,p.expiresAt-Date.now()));
  nativePending.set(id,{resolve,reject,timer});
  try{port.postMessage({nativeRequest:id,method:'activate-browser',params:p});}
  catch(e){clearTimeout(timer);nativePending.delete(id);reject(e);}
}));
let port,error,connection;
function connect() {
  if(port)return;
  port=chrome.runtime.connectNative('com.frank9306.app_use');error=null;
  port.onMessage.addListener(async message=>{
    if(message.connected){connection=message.connected;return;}
    if(message.nativeReply){const pending=nativePending.get(message.nativeReply);if(pending){nativePending.delete(message.nativeReply);clearTimeout(pending.timer);message.error?pending.reject(Error(message.error)):pending.resolve(message.result);}return;}
    const current=port;
    try{const result=await bridge.handle(message.method,message.params);current?.postMessage({id:message.id,result});}
    catch(e){try{current?.postMessage({id:message.id,error:e.message});}catch{}}
  });
  port.onDisconnect.addListener(()=>{error=chrome.runtime.lastError?.message||'native host disconnected';port=null;connection=null;for(const p of nativePending.values()){clearTimeout(p.timer);p.reject(Error(error));}nativePending.clear();for(const s of bridge.sessions.values())bridge.stop(s).catch(()=>{});});
}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{
  if(message.type==='connect')connect();
  reply({connected:!!connection,error,sessions:bridge.sessions.size});
});
chrome.runtime.onInstalled.addListener(connect);
chrome.runtime.onStartup.addListener(connect);
connect();
