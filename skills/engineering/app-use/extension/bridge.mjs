import { dom } from './dom.mjs';

export class BrowserBridge {
  constructor(api) {
    this.api=api;this.sessions=new Map();this.tabs=new Map();this.ownership=new Map();
    api.debugger.onEvent.addListener((source,method,p)=>this.event(source,method,p));
    api.debugger.onDetach.addListener(source=>{const s=this.tabs.get(source.tabId);if(s){s.stopped=true;s.observation=null;this.tabs.delete(source.tabId);this.sessions.delete(s.id);}});
    api.tabs.onCreated.addListener(tab=>{const s=this.tabs.get(tab.openerTabId);if(s?.trackPopups&&s.activeAction){s.createdTabs.add(tab.id);s.allowedTabs.add(tab.id);}});
  }
  protect(s,value){let json=JSON.stringify(value);for(const secret of s.secrets||[])json=json.split(JSON.stringify(secret).slice(1,-1)).join('[redacted]');return JSON.parse(json);}
  source(s,sessionId){return {tabId:s.tabId,...(sessionId?{sessionId}:{})};}
  async command(s,method,params={},sessionId) {
    if(s.stopped)throw Error('session stopped or disconnected');
    const pending=this.api.debugger.sendCommand(this.source(s,sessionId),method,params);
    if(!method.startsWith('Input.'))return pending;
    let release;
    const dialog=new Promise(resolve=>{release=resolve;s.dialogWaiters.add(resolve);});
    try{return await Promise.race([pending,dialog]);}finally{s.dialogWaiters.delete(release);}
  }
  event(source,method,p) {
    const s=this.tabs.get(source.tabId);if(!s)return;
    const sid=source.sessionId||'';
    if(method==='Runtime.executionContextCreated'&&p.context.auxData?.isDefault&&p.context.auxData.frameId) {
      s.contexts.set(`${sid}:${p.context.id}`,{sessionId:sid,defaultId:p.context.id,frameId:p.context.auxData.frameId});
    }
    if(method==='Runtime.executionContextDestroyed')for(const [k,c]of s.contexts)if(c.sessionId===sid&&c.defaultId===p.executionContextId)s.contexts.delete(k);
    if(method==='Runtime.executionContextsCleared')for(const [k,c]of s.contexts)if(c.sessionId===sid)s.contexts.delete(k);
    if(['Runtime.executionContextsCleared','Page.frameNavigated','Page.frameDetached'].includes(method))s.observation=null;
    if(method==='Target.attachedToTarget'&&p.targetInfo.type==='iframe') {
      const task=this.enable(s,p.sessionId).catch(e=>{s.frameError=e.message;});s.pending.push(task);
    }
    if(method==='Target.detachedFromTarget')for(const [k,c]of s.contexts)if(c.sessionId===p.sessionId)s.contexts.delete(k);
    if(method==='Page.javascriptDialogOpening'){s.dialog=p;s.observation=null;for(const resolve of s.dialogWaiters)resolve({dialogPending:true});}
    if(method==='Page.javascriptDialogClosed'){s.dialog=null;s.observation=null;}
  }
  async enable(s,sid) {
    await this.command(s,'Page.enable',{},sid);await this.command(s,'Runtime.enable',{},sid);
    await this.command(s,'Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:false,flatten:true,filter:[{type:'iframe',exclude:false}]},sid);
  }
  async identity(s) {
    const tab=await this.api.tabs.get(s.tabId);
    const u=new URL(tab.url||tab.pendingUrl||s.initialUrl);return {kind:'browser',session:s.id,tabId:s.tabId,windowId:tab.windowId,title:tab.title,url:u.origin+u.pathname,browser:navigator.userAgent};
  }
  async context(s,c) {
    if(c.isolatedId)return c;
    const world=await this.command(s,'Page.createIsolatedWorld',{frameId:c.frameId,worldName:'app-use.v1',grantUniveralAccess:false},c.sessionId);
    c.isolatedId=world.executionContextId;return c;
  }
  async evaluate(s,c,fn,args=[],byValue=true) {
    await this.context(s,c);
    const result=await this.command(s,'Runtime.evaluate',{expression:`(${fn.toString()})(...${JSON.stringify(args)})`,contextId:c.isolatedId,returnByValue:byValue,awaitPromise:true},c.sessionId);
    if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'browser evaluation failed');
    return byValue?result.result.value:result.result;
  }
  async observe(s,p={}) {
    s.frameError=null;
    for(let depth=0;s.pending.length&&depth<10;depth++)await Promise.all(s.pending.splice(0));
    const identity=await this.identity(s),id=crypto.randomUUID(),nodes=[],targets=new Map();
    if(s.dialog) {
      const node={id:'dialog',role:'dialog',name:s.dialog.message,context:'dialog',enabled:true,visible:true};
      s.observation={id,at:Date.now(),complete:true,targets:new Map(),dialog:true};
      return {id,at:new Date().toISOString(),complete:true,identity,nodes:[node]};
    }
    const contexts=[...s.contexts.values()].filter(c=>!p.context||c.frameId===p.context);
    if(!contexts.length)throw Error('no live frame context; observe after load');
    const frames=[];function collect(tree){frames.push(tree.frame.id);for(const child of tree.childFrames||[])collect(child);}
    collect((await this.command(s,'Page.getFrameTree')).frameTree);
    if(frames.filter(id=>!p.context||p.context===id).some(id=>!contexts.some(c=>c.frameId===id)))s.frameError='frame context coverage incomplete';
    let complete=!s.frameError,viewport;
    for(const c of contexts) {
      try {
        const snapshot=await this.evaluate(s,c,dom,['snapshot',{selector:p.selector,limit:p.limit||1000}]);
        complete&&=snapshot.complete;viewport||=snapshot.viewport;
        for(const row of snapshot.nodes) {
          const target=`${c.frameId}:${row.id}`,item={...row,id:target,context:c.frameId};delete item.signature;
          for(const secret of s.secrets||[])for(const key of ['name','value'])if(typeof item[key]==='string')item[key]=item[key].split(secret).join('[redacted]');
          nodes.push(item);targets.set(target,{...row,ctx:c});
        }
      } catch(e){complete=false;s.frameError=e.message;}
    }
    if(s.frameError)complete=false;
    s.observation={id,at:Date.now(),complete,targets};
    return this.protect(s,{id,at:new Date().toISOString(),complete,identity,nodes,viewport,contexts:contexts.map(c=>({frameId:c.frameId,sessionId:c.sessionId})),...(s.frameError?{error:s.frameError}:{})});
  }
  async handle(method,p={}) {
    if(p.expiresAt&&Date.now()>=p.expiresAt)throw Error('request expired before dispatch');
    if(method==='sessions')return (await this.api.tabs.query({})).filter(t=>/^https?:|^file:|^about:blank$/.test(t.url||'')).map(t=>({kind:'browser',tabId:t.id,windowId:t.windowId,title:t.title,url:(()=>{try{const u=new URL(t.url);return u.origin+u.pathname;}catch{return 'unavailable';}})(),session:this.tabs.get(t.id)?.id}));
    if(method==='prepare') {
      let created;
      if(p.createUrl){const u=new URL(p.createUrl);if(!['http:','https:','file:'].includes(u.protocol)||!p.allowOrigins?.includes(u.origin))throw Error('createUrl needs declared origin');created=await this.api.tabs.create({url:u.href,active:false});p={...p,tabId:created.id};const until=Date.now()+5000;while((await this.api.tabs.get(created.id)).status!=='complete'){if(Date.now()>until)throw Error('created tab did not finish initial load');await new Promise(r=>setTimeout(r,50));}}
      if(!Number.isInteger(p.tabId))throw Error('explicit tabId or createUrl required');
      if(this.tabs.has(p.tabId))throw Error('tab already has a session; stop it before preparing');
      const tab=await this.api.tabs.get(p.tabId);
      const origin=new URL(tab.url||tab.pendingUrl||p.createUrl).origin;
      const origins=p.allowOrigins||[origin];
      if(!Array.isArray(origins)||!origins.length||origins.some(o=>typeof o!=='string'||(o!=='null'&&new URL(o).origin!==o)))throw Error('allowOrigins must contain exact origins');
      const s={id:crypto.randomUUID(),tabId:p.tabId,initialUrl:tab.url||p.createUrl,allowedTabs:new Set([p.tabId,...(p.allowedTabIds||[])]),createdTabs:new Set(created?[created.id]:[]),origins:new Set(origins),contexts:new Map(),pending:[],stopped:false,dialogWaiters:new Set(),trackPopups:p.trackPopups===true};
      if(this.ownership.has(s.tabId))s.createdTabs=this.ownership.get(s.tabId);
      this.ownership.set(s.tabId,s.createdTabs);
      await this.api.debugger.attach({tabId:s.tabId},'1.3');this.tabs.set(s.tabId,s);this.sessions.set(s.id,s);
      try{await this.enable(s);return await this.identity(s);}catch(e){await this.stop(s);throw e;}
    }
    const s=this.sessions.get(p.session);if(!s||s.stopped)throw Error('session unavailable or disconnected');
    if(method==='stop')return this.stop(s,p);
    if(method==='observe')return this.observe(s,p);
    if(method==='capture') {
      if(!s.observation)throw Error('observe before capture');
      if(s.secrets?.length||[...s.observation.targets.values()].some(n=>n.sensitive))throw Error('capture refused: sensitive fields present; use a sanitized fixture');
      for(const c of s.contexts.values())if(await this.evaluate(s,c,dom,['sensitive']))throw Error('capture refused: sensitive fields outside observation scope');
      const png=p.format==='png';
      const image=await this.command(s,'Page.captureScreenshot',{format:png?'png':'jpeg',...(png?{}:{quality:65}),fromSurface:true,captureBeyondViewport:false});
      if(image.data.length>900000)throw Error('screenshot exceeds Native Messaging limit');
      return {mime:png?'image/png':'image/jpeg',data:image.data};
    }
    if(method==='adapter')return this.adapter(s,p);
    if(method!=='act')throw Error('unsupported browser method');
    s.activeAction=true;
    try{return await this.act(s,p);}finally{s.activeAction=false;}
  }
  async stop(s,p={}) {
    s.stopped=true;s.observation=null;this.sessions.delete(s.id);this.tabs.delete(s.tabId);
    try{await this.api.debugger.detach({tabId:s.tabId});}catch{}
    if(p.closeCreated){for(const id of s.createdTabs)try{await this.api.tabs.remove(id);}catch{}for(const [tab,owned]of this.ownership)if(owned===s.createdTabs)this.ownership.delete(tab);}
    return {stopped:true};
  }
  async act(s,p) {
    const diagnostics={};
    const o=s.observation;
    if(!o||o.id!==p.observation||Date.now()-o.at>30000)throw Error('stale observation; observe again');
    if(!o.complete)throw Error('observation incomplete; observe a complete authorized scope');
    const a=p.action;if(!a||typeof a.type!=='string')throw Error('action required');
    const tab=await this.api.tabs.get(s.tabId);
    if(!s.origins.has(new URL(tab.url).origin))throw Error('current origin outside declared scope; prepare a new authorized scope');
    if(['click','fill','key','scroll','drag','files'].includes(a.type)&&!tab.active)throw Error('target tab is not active; explicitly focus first');
    s.observation=null;
    const guard=()=>{if(s.stopped||p.expiresAt&&Date.now()>=p.expiresAt)throw Error('stopped or expired before dispatch');};
    const allowed=['click','fill','key','scroll','select','drag','read','navigate','newTab','switchTab','focus','scrollIntoView','files','dialog'];
    if(!allowed.includes(a.type))throw Error('unsupported browser action');
    if(a.type==='dialog') {
      if(!s.dialog)throw Error('no dialog');guard();await this.command(s,'Page.handleJavaScriptDialog',{accept:a.accept===true,...(a.text?{promptText:a.text}:{})});
    } else if(a.type==='navigate'||a.type==='newTab') {
      const url=new URL(a.url);if(!['http:','https:','file:'].includes(url.protocol)||!s.origins.has(url.origin)||url.username||url.password)throw Error('navigation outside declared origins');
      guard();
      if(a.type==='newTab'){const tab=await this.api.tabs.create({url:url.href,active:false});s.allowedTabs.add(tab.id);s.createdTabs.add(tab.id);}
      else await this.command(s,'Page.navigate',{url:url.href});
    } else if(a.type==='switchTab') {
      if(!s.allowedTabs.has(a.tabId)||this.tabs.has(a.tabId))throw Error('tab outside scope or already attached');
      const next=await this.api.tabs.get(a.tabId);if(!s.origins.has(new URL(next.url).origin))throw Error('tab origin outside scope');
      guard();const previous=s.tabId;await this.api.debugger.detach({tabId:previous});s.stopped=false;this.sessions.set(s.id,s);this.tabs.delete(previous);s.tabId=a.tabId;this.ownership.set(s.tabId,s.createdTabs);s.contexts.clear();s.pending=[];s.frameError=null;
      await this.api.debugger.attach({tabId:s.tabId},'1.3');this.tabs.set(s.tabId,s);await this.enable(s);
    } else if(a.type==='focus') {
      guard();const tab=await this.api.tabs.get(s.tabId);await this.api.windows.update(tab.windowId,{focused:true});await this.api.tabs.update(s.tabId,{active:true});
    } else if(a.type==='key') {
      const c=[...s.contexts.values()].find(c=>!c.sessionId);if(!c)throw Error('main context unavailable');
      guard();await this.press(s,a.key,c.sessionId);
    } else {
      const t=o.targets.get(a.target);if(!t)throw Error('target outside observation');
      await this.evaluate(s,t.ctx,dom,['probe',{id:t.id,signature:t.signature,focus:a.type==='fill',scrollIntoView:a.type==='scrollIntoView'}]);
      guard();
      if(a.type==='read'||a.type==='scrollIntoView'){}
      else if(a.type==='select')await this.evaluate(s,t.ctx,dom,['select',{id:t.id,value:a.value}]);
      else if(a.type==='fill') {
        if(typeof a.text!=='string')throw Error('fill text required');
        if((a.sensitive||t.sensitive)&&a.text){s.secrets||=[];s.secrets.push(a.text);}
        await this.press(s,'Ctrl+A',t.ctx.sessionId);guard();await this.command(s,'Input.insertText',{text:a.text},t.ctx.sessionId);
      } else {
        const object=await this.evaluate(s,t.ctx,dom,['element',{id:t.id}],false);
        try {
          if(a.type==='files') {
            if(!Array.isArray(a.files)||!a.files.length||a.files.some(f=>typeof f!=='string'||!/^[a-zA-Z]:[\\/]/.test(f)))throw Error('absolute local file list required');
            guard();await this.command(s,'DOM.setFileInputFiles',{objectId:object.objectId,files:a.files},t.ctx.sessionId);
          } else {
            const {quads}=await this.command(s,'DOM.getContentQuads',{objectId:object.objectId},t.ctx.sessionId);
            if(quads?.length!==1)throw Error('target geometry missing or ambiguous');
            const q=quads[0],x=(q[0]+q[2]+q[4]+q[6])/4,y=(q[1]+q[3]+q[5]+q[7])/4;
            diagnostics.geometry={quad:q,bounds:t.bounds,x,y,context:t.ctx.frameId};
            let end={x,y};
            if(a.type==='drag') {
              const dest=o.targets.get(a.to);if(!dest||dest.ctx!==t.ctx)throw Error('drag requires same frame observed destination');
              await this.evaluate(s,dest.ctx,dom,['probe',{id:dest.id,signature:dest.signature}]);guard();
              const obj=await this.evaluate(s,dest.ctx,dom,['element',{id:dest.id}],false);
              try{const {quads:d}=await this.command(s,'DOM.getContentQuads',{objectId:obj.objectId},t.ctx.sessionId);if(d?.length!==1)throw Error('drag destination ambiguous');const q=d[0];end={x:(q[0]+q[2]+q[4]+q[6])/4,y:(q[1]+q[3]+q[5]+q[7])/4};}finally{await this.command(s,'Runtime.releaseObject',{objectId:obj.objectId},t.ctx.sessionId);}
            }
            guard();await this.command(s,'Input.dispatchMouseEvent',{type:'mouseMoved',x,y},t.ctx.sessionId);
            guard();
            if(a.type==='scroll')await this.command(s,'Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:a.deltaX||0,deltaY:a.deltaY??180},t.ctx.sessionId);
            else {
              await this.command(s,'Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1},t.ctx.sessionId);
              try {if(a.type==='drag'){guard();await this.command(s,'Input.dispatchMouseEvent',{type:'mouseMoved',...end,button:'left',buttons:1},t.ctx.sessionId);}}
              finally {await this.command(s,'Input.dispatchMouseEvent',{type:'mouseReleased',...end,button:'left',clickCount:1},t.ctx.sessionId);}
            }
          }
        } finally {if(!s.dialog)await this.command(s,'Runtime.releaseObject',{objectId:object.objectId},t.ctx.sessionId);}
      }
    }
    await new Promise(r=>setTimeout(r,80));guard();
    return {actionExecuted:true,goalVerified:false,observation:await this.observe(s),diagnostics};
  }
  async press(s,key,sid) {
    const parts=key?.split('+');if(!parts?.length)throw Error('key required');
    const last=parts.at(-1),modifiers=parts.slice(0,-1).reduce((v,k)=>v|({Alt:1,Ctrl:2,Meta:4,Shift:8}[k]||0),0);
    if(modifiers&5)throw Error('system/global keys outside scope');
    const code={Tab:9,Enter:13,Escape:27,Backspace:8,Delete:46,Home:36,End:35,Space:32,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40}[last]||(last?.length===1?last.toUpperCase().charCodeAt(0):0);
    if(!code)throw Error('unsupported key');
    const params={key:last==='Space'?' ':last,windowsVirtualKeyCode:code,modifiers};
    await this.command(s,'Input.dispatchKeyEvent',{type:'keyDown',...params},sid);
    await this.command(s,'Input.dispatchKeyEvent',{type:'keyUp',...params},sid);
  }
  async adapter(s,p) {
    const tab=await this.api.tabs.get(s.tabId);if(!s.origins.has(new URL(tab.url).origin))throw Error('adapter origin outside declared scope');
    const guard=()=>{if(s.stopped||p.expiresAt&&Date.now()>=p.expiresAt)throw Error('stopped or expired before adapter dispatch');};
    if(['key','mouse'].includes(p.operation)&&!tab.active)throw Error('adapter input requires active tab');
    const tree=await this.command(s,'Page.getFrameTree');
    const c=[...s.contexts.values()].find(c=>c.frameId===tree.frameTree.frame.id);
    if(!c)throw Error('main frame unavailable');await this.context(s,c);
    s.handles||=new Map();
    if(p.operation==='release') {const h=s.handles.get(p.handle);if(h){s.handles.delete(p.handle);await this.command(s,'Runtime.releaseObject',{objectId:h},c.sessionId);}return true;}
    if(p.operation==='key'){guard();await this.press(s,p.key,c.sessionId);return true;}
    if(p.operation==='mouse') {
      const view=await this.evaluate(s,c,()=>({width:innerWidth,height:innerHeight}));
      if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.y<0||p.x>=view.width||p.y>=view.height)throw Error('pointer outside viewport');
      guard();await this.command(s,'Input.dispatchMouseEvent',{type:p.wheel?'mouseWheel':'mouseMoved',x:p.x,y:p.y,...(p.wheel?{deltaX:p.deltaX,deltaY:p.deltaY}:{})},c.sessionId);return true;
    }
    if(p.operation!=='eval')throw Error('unsupported adapter operation');
    if(typeof p.fn!=='string'||p.fn.length>20000)throw Error('bounded function required');
    const args=(p.args||[]).map(a=>a?.__appUseHandle?{objectId:s.handles.get(a.__appUseHandle)||(()=>{throw Error('expired handle')})()}:{value:a});
    let functionDeclaration;
    if(p.handle) {
      const h=s.handles.get(p.handle);if(!h)throw Error('expired handle');
      functionDeclaration=`function(...args){return (${p.fn})(this,...args)}`;
      p={...p,objectId:h};
    } else if(p.selector!==undefined)functionDeclaration=`function(...args){const nodes=document.querySelectorAll(${JSON.stringify(p.selector)});if(nodes.length!==1)throw Error('selector must match exactly once');return (${p.fn})(nodes[0],...args)}`;
    else functionDeclaration=`function(...args){return (${p.fn})(...args)}`;
    guard();const result=await this.command(s,'Runtime.callFunctionOn',{functionDeclaration,...(p.objectId?{objectId:p.objectId}:{executionContextId:c.isolatedId}),arguments:args,awaitPromise:true,returnByValue:p.byValue!==false},c.sessionId);
    if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
    if(p.byValue===false){if(!result.result.objectId)throw Error('value is not a remote handle');const id=crypto.randomUUID();s.handles.set(id,result.result.objectId);return {handle:id};}
    return result.result.value??null;
  }
}
