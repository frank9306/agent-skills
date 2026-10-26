import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {AppClient,stateRoot} from '../scripts/client.mjs';
import {runCase} from '../scripts/runner.mjs';
import {createPageAdapter} from '../scripts/page-adapter.mjs';
import {checkUI,verifyUIReport} from '../../frontend-design/scripts/check-ui.mjs';

test('normal browser: frozen cases and unchanged layout checker detect defects and restoration',async()=>{
  const input='skills/engineering/app-use/tests/fixtures/browser.html',html=await fs.readFile(input,'utf8');
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}`,c=await AppClient.connect();let session,page;
  const logs=[];
  try{
    const connection=(await c.request('doctor')).extensions[0];assert.ok(connection,'real extension required');
    session=(await c.request('prepare',{kind:'browser',connection,createUrl:url,allowOrigins:[url]})).session;
    let o=await c.request('observe',{session});await c.request('act',{session,observation:o.id,action:{type:'focus'}});
    page=await createPageAdapter(c,session);
    const script={version:1,id:'fixture-result',session,projectRoot:process.cwd(),inputs:[input],build:{expected:'Ready v1',readbackState:'build'},start:'build',states:{
      build:{assert:{target:{selector:'#ready'},property:'name',equals:'Ready v1'},next:'enabled'},
      enabled:{assert:{target:{selector:'#apply'},property:'enabled',equals:true},next:'input'},
      input:{action:{type:'fill',match:{selector:'#input'},text:'Controlled result'},next:'apply'},
      apply:{action:{type:'click',match:{selector:'#apply'}},next:'goal'},
      goal:{assert:{target:{selector:'#result'},property:'name',equals:'Controlled result'},next:'done'},done:{finish:'complete'}}};
    async function replay(expected){const r=await runCase(c,script);logs.push({kind:'case',status:r.status,dir:r.runDir});assert.equal(r.status,expected,r.error);return r;}
    await replay('pass');
    await page.locator('#apply').evaluate(el=>el.disabled=true);await replay('fail');
    await page.locator('#apply').evaluate(el=>el.disabled=false);await replay('pass');
    await page.locator('#apply').evaluate(el=>el.onclick=()=>document.querySelector('#result').textContent='Wrong');await replay('fail');
    await page.locator('#apply').evaluate(el=>el.onclick=()=>document.querySelector('#result').textContent=document.querySelector('#input').value);await replay('pass');
    await page.locator('#cover').evaluate(el=>el.style.display='block');await replay('error');
    await page.locator('#cover').evaluate(el=>el.style.display='none');await replay('pass');
    const colorScheme=await page.evaluate(()=>matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    const make=checks=>({version:1,id:'adapter-layout',viewport:page.viewportSize(),colorScheme,state:'ready',ready:{selector:'#ready',text:'Ready v1'},targets:{main:'#main',side:'#side',header:'#header',last:'#last',apply:'#apply',inside:'#inside',modal:'#modal',open:'#open'},checks});
    const contract=make([{id:'size',type:'size',target:'apply',dimension:'width',min:139,max:141},{id:'style',type:'style',target:'apply',property:'color',value:'rgb(1,2,3)'},{id:'main-scroll',type:'scroll',target:'main',axis:'y',stationary:['document','side'],boundary:{edge:'end',behavior:'contain',ancestor:'document'}},{id:'side-scroll',type:'scroll',target:'side',axis:'y',stationary:['document','main']},{id:'pinned',type:'pinned',target:'header',scroller:'main',axis:'y'},{id:'reachable',type:'reachable',target:'last',scroller:'main',stationary:['document']}]);
    async function layout(contract,expected){const r=await checkUI(page,contract,{projectRoot:process.cwd(),inputs:[input],outDir:path.join(stateRoot,'layout-runs')});logs.push({kind:'layout',status:r.status,path:r.evidence.reportPath});assert.equal(r.status,expected,JSON.stringify(r));assert.equal((await verifyUIReport(r.evidence.reportPath)).status,expected);return r;}
    await layout(contract,'pass');
    await page.locator('#apply').evaluate(el=>el.style.cssText='width:200px;color:red');await layout(contract,'fail');await page.locator('#apply').evaluate(el=>el.removeAttribute('style'));await layout(contract,'pass');
    await page.locator('#main').evaluate(el=>el.style.overflow='hidden');await layout(contract,'fail');await page.locator('#main').evaluate(el=>el.removeAttribute('style'));await layout(contract,'pass');
    await page.locator('#open').evaluate(el=>el.click());
    const modal=make([{id:'overlay',type:'overlay',target:'modal',stationary:['document']},{id:'focus',type:'focus',target:'inside',method:'current'},{id:'modal-scroll',type:'scroll',target:'modal',axis:'y',stationary:['document']}]);
    await layout(modal,'pass');await page.evaluate(()=>document.body.style.overflow='auto');await layout(modal,'fail');await page.evaluate(()=>document.body.style.overflow='hidden');await layout(modal,'pass');
    await page.locator('#inside').evaluate(el=>el.click());await layout(make([{id:'focus-restored',type:'focus',target:'open',method:'current'}]),'pass');
    console.log('Acceptance evidence: '+JSON.stringify(logs));
  }finally{await page?.dispose();if(session)await c.request('stop',{session,closeCreated:true});c.close();await new Promise(r=>server.close(r));}
});
