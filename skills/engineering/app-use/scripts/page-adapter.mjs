import fs from 'node:fs/promises';
import {setTimeout as pause} from 'node:timers/promises';

// This intentionally implements only the public subset consumed by check-ui.mjs.
// Layout rules and report integrity stay owned by frontend-design.
export async function createPageAdapter(client,session,{timeoutMs=15000,signal}={}) {
  const rpc=p=>client.request('adapter',{session,...p},{timeoutMs,signal});
  const handles=new Set();
  const arg=v=>v instanceof Handle?{__appUseHandle:v.id}:v;
  class Handle {
    constructor(id){this.id=id;handles.add(this);}
    evaluate(fn,value){if(!handles.has(this))throw Error('handle disposed');return rpc({operation:'eval',handle:this.id,fn:fn.toString(),args:[arg(value)]});}
    async dispose(){if(handles.delete(this))await rpc({operation:'release',handle:this.id});}
  }
  class Locator {
    constructor(selector){if(typeof selector!=='string'||!selector.trim())throw Error('selector required');this.selector=selector;}
    count(){return page.evaluate(s=>document.querySelectorAll(s).length,this.selector);}
    evaluate(fn,value){return rpc({operation:'eval',selector:this.selector,fn:fn.toString(),args:[arg(value)]});}
    async isVisible(){if(await this.count()!==1)return false;return this.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !!(r.width&&r.height)&&s.visibility!=='hidden'&&s.display!=='none';});}
    async waitFor({state='visible',timeout=5000}={}){if(state!=='visible')throw Error('adapter supports visible waits only');await poll(()=>this.isVisible(),timeout);}
    textContent(){return this.evaluate(el=>el.textContent);}
    inputValue(){return this.evaluate(el=>{if(!('value'in el))throw Error('target has no input value');return el.value;});}
    boundingBox(){return this.evaluate(el=>{const r=el.getBoundingClientRect();return r.width&&r.height?{x:r.x,y:r.y,width:r.width,height:r.height}:null;});}
    async elementHandle(){const h=await rpc({operation:'eval',selector:this.selector,fn:'el=>el',byValue:false});return new Handle(h.handle);}
    scrollIntoViewIfNeeded(){return this.evaluate(el=>{const r=el.getBoundingClientRect();if(r.x<0||r.y<0||r.right>innerWidth||r.bottom>innerHeight)el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});});}
  }
  async function poll(predicate,timeout){const until=Date.now()+timeout;for(;;){signal?.throwIfAborted();if(await predicate())return;if(Date.now()>=until)throw Error('adapter wait timed out');await pause(50,undefined,{signal});}}
  let pointer={x:0,y:0};
  const o=await client.request('observe',{session},{timeoutMs,signal});
  if(!o.complete)throw Error('adapter needs a complete browser observation');
  const page={
    evaluate:(fn,value)=>rpc({operation:'eval',fn:fn.toString(),args:[arg(value)]}),
    async evaluateHandle(fn,value){const h=await rpc({operation:'eval',fn:fn.toString(),args:[arg(value)],byValue:false});return new Handle(h.handle);},
    locator:selector=>new Locator(selector),
    waitForFunction:(fn,value,{timeout=5000}={})=>poll(()=>page.evaluate(fn,value),timeout),
    viewportSize:()=>({...o.viewport}),
    url:()=>o.identity.url,
    context:()=>({browser:()=>({version:()=>o.identity.browser})}),
    content:()=>page.evaluate(()=>document.documentElement.outerHTML),
    keyboard:{press:key=>rpc({operation:'key',key})},
    mouse:{async move(x,y){await rpc({operation:'mouse',x,y});pointer={x,y};},wheel:(deltaX,deltaY)=>rpc({operation:'mouse',...pointer,wheel:true,deltaX,deltaY})},
    async screenshot({path,fullPage=false}={}){if(fullPage)throw Error('adapter supports viewport screenshots only');await client.request('observe',{session},{timeoutMs,signal});const image=await client.request('capture',{session,format:'png'},{timeoutMs,signal});const buffer=Buffer.from(image.data,'base64');if(path)await fs.writeFile(path,buffer);return buffer;},
    async dispose(){await Promise.all([...handles].map(h=>h.dispose()));},
  };
  return page;
}
