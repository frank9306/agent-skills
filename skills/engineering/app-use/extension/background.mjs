import { BrowserBridge } from './bridge.mjs';
const bridge=new BrowserBridge(chrome);
let port,error,connection;
function connect() {
  if(port)return;
  port=chrome.runtime.connectNative('com.frank9306.app_use');error=null;
  port.onMessage.addListener(async message=>{
    if(message.connected){connection=message.connected;return;}
    const current=port;
    try{const result=await bridge.handle(message.method,message.params);current?.postMessage({id:message.id,result});}
    catch(e){try{current?.postMessage({id:message.id,error:e.message});}catch{}}
  });
  port.onDisconnect.addListener(()=>{error=chrome.runtime.lastError?.message||'native host disconnected';port=null;connection=null;for(const s of bridge.sessions.values())bridge.stop(s).catch(()=>{});});
}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{
  if(message.type==='connect')connect();
  reply({connected:!!connection,error,sessions:bridge.sessions.size});
});
chrome.runtime.onInstalled.addListener(connect);
chrome.runtime.onStartup.addListener(connect);
connect();
