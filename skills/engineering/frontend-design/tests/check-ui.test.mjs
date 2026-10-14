import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { checkUI } from '../scripts/check-ui.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRoot = process.env.FRONTEND_PLAYWRIGHT_ROOT || path.resolve(skillRoot, '../../..');
const execute=promisify(execFile);
async function cli(args){
  try{const r=await execute(process.execPath,[path.join(skillRoot,'scripts/verify-ui.mjs'),...args]);return {code:0,...r};}
  catch(error){return {code:error.code,stdout:error.stdout,stderr:error.stderr};}
}
let browser;
before(async () => {
  const require = createRequire(path.join(runtimeRoot, 'package.json'));
  let pw;
  try { pw = require('playwright'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    try { pw = require('@playwright/test'); }
    catch { throw new Error('Browser tests require Playwright. Set FRONTEND_PLAYWRIGHT_ROOT; missing runtime is not a skipped pass.'); }
  }
  browser = await pw.chromium.launch({ headless: true, ...(process.env.FRONTEND_BROWSER_CHANNEL ? { channel: process.env.FRONTEND_BROWSER_CHANNEL } : {}) });
});
after(async () => { await browser?.close(); });

async function withPage(html, run) {
  const page = await browser.newPage({ viewport: { width: 500, height: 360 } });
  try { await page.setContent(html); await run(page); }
  finally { await page.close(); }
}
function contract(checks, targets = { first: '#first', second: '#second' }) {
  return { version: 1, id: 'fixture', viewport: { width: 500, height: 360 }, colorScheme: 'light', state: 'ready', ready: '#first', targets, checks };
}

test('declared and equal styles detect drift and accept restoration in a real browser', async () => {
  await withPage('<button id="first" style="color:rgb(1, 2, 3)">Save</button><button id="second" style="color:rgb(1, 2, 3)">Cancel</button>', async page => {
    const c = contract([{ id: 'brand', type: 'style', target: 'first', property: 'color', value: 'rgb(1, 2, 3)' }, { id: 'siblings', type: 'equal-style', target: 'first', other: 'second', properties: ['color', 'font-size'] }]);
    const good = await checkUI(page, c);
    assert.equal(good.status, 'pass');
    await page.locator('#second').evaluate(el => el.style.color = 'red');
    const bad = await checkUI(page, c);
    assert.equal(bad.status, 'fail');
    assert.ok(bad.findings.some(f => f.check === 'siblings'));
    await page.locator('#second').evaluate(el => el.style.color = 'rgb(1, 2, 3)');
    assert.equal((await checkUI(page, c)).status, 'pass');
  });
});

test('geometry contracts catch containment, alignment, size and page overflow without rejecting local overflow', async () => {
  await withPage('<style>body{margin:0}#first{width:300px;height:120px}#second{width:100px;height:40px}#local{width:150px;overflow:auto}#wide{width:900px}</style><main id="first"><div id="second">content</div></main><div id="local"><div id="wide">wide table</div></div>', async page => {
    const c = contract([{ id: 'inside', type: 'within', target: 'second', container: 'first' }, { id: 'alignment', type: 'align', target: 'first', other: 'second', edge: 'left' }, { id: 'width', type: 'size', target: 'second', dimension: 'width', min: 99, max: 101 }, { id: 'page', type: 'page-overflow' }]);
    assert.equal((await checkUI(page, c)).status, 'pass');
    await page.locator('#second').evaluate(el => el.style.cssText = 'width:600px;height:40px;margin-left:20px');
    const bad = await checkUI(page, c);
    assert.equal(bad.status, 'fail');
    assert.deepEqual(new Set(bad.findings.map(f => f.check)), new Set(['inside', 'alignment', 'width', 'page']));
    await page.locator('#second').evaluate(el => el.removeAttribute('style'));
    assert.equal((await checkUI(page, c)).status, 'pass');
  });
});

test('container wheel scrolling, boundary containment, pinned header and final action survive good/bad/restored layout', async () => {
  const html = '<style>body{margin:0;height:900px}.shell{height:360px;overflow:hidden;display:grid;grid-template-rows:40px minmax(0,1fr)}.panes{min-height:0;display:grid;grid-template-columns:100px minmax(0,1fr)}#first,#side{overflow:auto;min-height:0;overscroll-behavior:contain}.content{height:1000px}button{height:30px}</style><div class="shell"><header id="header">Toolbar</header><div class="panes"><aside id="side"><div class="content">Navigation</div></aside><main id="first"><div class="content">Tasks</div><button id="last">Last action</button></main></div></div>';
  await withPage(html, async page => {
    const c = contract([
      { id:'main-scroll',type:'scroll',target:'main',axis:'y',stationary:['document','side'],boundary:{edge:'end',behavior:'contain',ancestor:'document'} },
      { id:'side-scroll',type:'scroll',target:'side',axis:'y',stationary:['document','main'] },
      { id:'header-pinned',type:'pinned',target:'header',scroller:'main',axis:'y' },
      { id:'last-reachable',type:'reachable',target:'last',scroller:'main',stationary:['document'] }
    ], {main:'#first',side:'#side',header:'#header',last:'#last'});
    const good = await checkUI(page,c);
    assert.equal(good.status,'pass',JSON.stringify(good));
    assert.equal(await page.locator('#first').evaluate(el=>el.scrollTop),0,'checker restores scroll position');
    await page.locator('#first').evaluate(el=>el.style.overflow='hidden');
    const bad = await checkUI(page,c);
    assert.equal(bad.status,'fail');
    assert.ok(bad.findings.some(f=>f.check==='main-scroll'));
    await page.locator('#first').evaluate(el=>el.removeAttribute('style'));
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.locator('#first').evaluate(el=>el.prepend(document.getElementById('header')));
    assert.ok((await checkUI(page,c)).findings.some(f=>f.check==='header-pinned'));
    await page.locator('.shell').evaluate(el=>el.prepend(document.getElementById('header')));
    assert.equal((await checkUI(page,c)).status,'pass');
  });
});

test('overlay lock and keyboard focus are measured; caller-owned closing restores page scrolling and focus', async () => {
  const html='<style>body{margin:0;height:1600px}#backdrop{position:fixed;inset:0;background:#8888;display:none}#first{position:fixed;top:40px;left:100px;width:260px;height:180px;overflow:auto;overscroll-behavior:contain;background:white;display:none}.long{height:700px}</style><button id="open">Open</button><div id="backdrop"></div><section id="first" role="dialog"><button id="inside">Close</button><div class="long">Dialog content</div></section>'+`<script>
    document.getElementById('open').onclick=()=>{
      document.getElementById('first').style.display='block';document.getElementById('backdrop').style.display='block';
      document.body.style.overflow='hidden';document.getElementById('inside').focus();
    };
    document.getElementById('inside').onclick=()=>{
      document.getElementById('first').style.display='none';document.getElementById('backdrop').style.display='none';
      document.body.style.overflow='auto';document.getElementById('open').focus();
    };
  </script>`;
  await withPage(html,async page=>{
    await page.locator('#open').click();
    const c=contract([{id:'modal',type:'overlay',target:'modal',stationary:['document']},{id:'modal-scroll',type:'scroll',target:'modal',axis:'y',stationary:['document']},{id:'focus',type:'focus',target:'inside',method:'current'}],{modal:'#first',inside:'#inside'});
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.evaluate(()=>document.body.style.overflow='auto');
    assert.equal((await checkUI(page,c)).status,'fail');
    await page.evaluate(()=>document.body.style.overflow='hidden');
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.locator('#inside').click();
    const closed=contract([{id:'restored-focus',type:'focus',target:'open',method:'current'},{id:'document-scroll',type:'scroll',target:'document',axis:'y'}],{open:'#open'});
    closed.ready='#open';
    assert.equal((await checkUI(page,closed)).status,'pass');
    await page.keyboard.press('Tab');
    const tab=contract([{id:'tab-focus',type:'focus',target:'open',method:'tab'}],{open:'#open'});tab.ready='#open';
    assert.equal((await checkUI(page,tab)).status,'pass');
  });
});

test('durable evidence rejects changed source, contract and screenshot instead of reusing a stale pass', async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ui-evidence-'));
  t.after(()=>fs.rm(root,{recursive:true}));
  await fs.writeFile(path.join(root,'source.html'),'<button>Save</button>','utf8');
  await withPage('<button id="first">Save</button>',async page=>{
    const c=contract([{id:'width',type:'size',target:'first',dimension:'width',min:1,max:300}]);
    const report=await checkUI(page,c,{projectRoot:root,inputs:['source.html'],outDir:path.join(root,'evidence')});
    assert.equal(report.status,'pass',JSON.stringify(report));
    assert.equal(report.evidence.status,'bound');
    const {verifyUIReport}=await import('../scripts/check-ui.mjs');
    assert.equal((await verifyUIReport(report.evidence.reportPath)).status,'pass');
    await fs.writeFile(path.join(root,'source.html'),'changed','utf8');
    assert.equal((await verifyUIReport(report.evidence.reportPath)).status,'unverified');
    await fs.writeFile(path.join(root,'source.html'),'<button>Save</button>','utf8');
    const saved=await fs.readFile(report.evidence.reportPath,'utf8');
    const mutated=JSON.parse(saved);mutated.contract.state='other';
    await fs.writeFile(report.evidence.reportPath,JSON.stringify(mutated),'utf8');
    assert.equal((await verifyUIReport(report.evidence.reportPath)).status,'unverified');
    await fs.writeFile(report.evidence.reportPath,saved,'utf8');
    const image=path.join(path.dirname(report.evidence.reportPath),report.evidence.artifacts[0].path);
    await fs.writeFile(image,'not the screenshot','utf8');
    assert.equal((await verifyUIReport(report.evidence.reportPath)).status,'unverified');
  });
});

test('CLI produces bound evidence, revalidates it and distinguishes violations from missing runtime',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ui-cli-'));t.after(()=>fs.rm(root,{recursive:true}));
  const html=path.join(root,'page.html');await fs.writeFile(html,'<button id="first" style="color:rgb(1,2,3)">Save</button>');
  const c=contract([{id:'color',type:'style',target:'first',property:'color',value:'rgb(1,2,3)'}]);
  c.url=pathToFileURL(html).href;c.inputs=['page.html'];
  const casePath=path.join(root,'case.json');await fs.writeFile(casePath,JSON.stringify(c));
  const args=['--contract',casePath,'--project-root',root,'--runtime-root',runtimeRoot,'--out',path.join(root,'out')];
  if(process.env.FRONTEND_BROWSER_CHANNEL)args.push('--channel',process.env.FRONTEND_BROWSER_CHANNEL);
  const good=await cli(args);assert.equal(good.code,0,good.stderr||good.stdout);
  const report=JSON.parse(good.stdout);assert.equal(report.status,'pass');
  assert.equal((await cli(['--verify-report',report.evidence.reportPath])).code,0);
  await fs.writeFile(html,'<button id="first" style="color:red">Save</button>');
  assert.equal((await cli(['--verify-report',report.evidence.reportPath])).code,2);
  assert.equal((await cli(args)).code,1);
  const missing=[...args];missing[missing.indexOf('--runtime-root')+1]=path.join(root,'missing');
  assert.equal((await cli(missing)).code,2);
  c.url='http://127.0.0.1:1/?token=PRIVATE_NAVIGATION_TOKEN';
  await fs.writeFile(casePath,JSON.stringify(c));
  const unavailable=await cli(args);
  assert.equal(unavailable.code,2);
  assert.equal(unavailable.stdout.includes('PRIVATE_NAVIGATION_TOKEN'),false);
});

test('invalid or ambiguous contracts never become successful measurements and reports redact URL secrets',async()=>{
  await withPage('<button id="first">One</button><button id="second">Two</button>',async page=>{
    const invalid=contract([{id:'typo',type:'equal-style',target:'first',other:'second',properties:['not-a-css-property']}]);
    assert.equal((await checkUI(page,invalid)).status,'unverified');
    const c=contract([{id:'size',type:'size',target:'first',dimension:'width',min:1,max:300}]);
    c.url='https://example.test/?token=SECRET_TOKEN#private';
    assert.equal(JSON.stringify(await checkUI(page,c)).includes('SECRET_TOKEN'),false);
    const ambiguous=structuredClone(c);ambiguous.targets.first='button';
    assert.equal((await checkUI(page,ambiguous)).status,'unverified');
    const missing=structuredClone(c);missing.ready='#absent';
    assert.equal((await checkUI(page,missing,{timeout:40})).status,'unverified');
    const na=contract([{id:'scroll',type:'not-applicable',reason:'No content in this empty state'}]);
    assert.equal((await checkUI(page,na)).status,'unverified');
    const wider=structuredClone(c);wider.viewport.width=600;
    assert.equal((await checkUI(page,wider)).status,'unverified');
    const typo=structuredClone(c);typo.checks[0].stationay=['document'];
    assert.equal((await checkUI(page,typo)).status,'unverified','unknown expectations cannot silently disappear');
  });
});

test('scroll chaining and containment need a distinct ancestor with actual scroll capacity',async()=>{
  await withPage('<style>body{margin:0;height:1800px}#first{width:300px;height:150px;overflow:auto}.long{height:800px}</style><main id="first"><div class="long">long</div></main>',async page=>{
    const c=contract([{id:'boundary',type:'scroll',target:'first',axis:'y',boundary:{edge:'end',behavior:'chain',ancestor:'document'}}]);
    assert.equal((await checkUI(page,c)).status,'pass');
    c.checks[0].boundary.behavior='contain';
    assert.equal((await checkUI(page,c)).status,'fail');
    await page.locator('#first').evaluate(el=>el.style.overscrollBehavior='contain');
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.evaluate(()=>document.body.style.height='200px');
    assert.equal((await checkUI(page,c)).status,'unverified');
  });
});

test('relative declared styles use the target parent context and cannot borrow an overriding declaration',async()=>{
  await withPage('<div style="font-size:10px"><button id="first" style="font-size:2em!important">Save</button></div>',async page=>{
    const c=contract([{id:'relative-type',type:'style',target:'first',property:'font-size',value:'2em'}]);
    assert.equal((await checkUI(page,c)).status,'pass');
    c.checks[0].value='3em';assert.equal((await checkUI(page,c)).status,'fail');
    c.checks[0].value='2em';assert.equal((await checkUI(page,c)).status,'pass');
  });
});

test('intentional horizontal scrolling is interactive and does not cause document overflow',async()=>{
  await withPage('<style>body{margin:0}#first{width:300px;overflow:auto}#wide{width:1000px;height:100px}</style><div id="first"><div id="wide">Wide table</div></div>',async page=>{
    const c=contract([{id:'page',type:'page-overflow'},{id:'table-scroll',type:'scroll',target:'first',axis:'x',stationary:['document']}]);
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.locator('#first').evaluate(el=>el.style.overflow='hidden');
    assert.equal((await checkUI(page,c)).status,'fail');
    await page.locator('#first').evaluate(el=>el.style.removeProperty('overflow'));
    assert.equal((await checkUI(page,c)).status,'pass');
  });
});

test('reachable actions reject an unrelated scroll owner and detect sticky obstruction',async()=>{
  await withPage('<style>body{margin:0}#first{height:180px;overflow:auto}#content{height:700px}#block{display:none;position:fixed;inset:0;z-index:2}</style><main id="first"><div id="content">Rows</div><button id="last">Final action</button></main><aside id="other">Independent panel</aside><div id="block"></div>',async page=>{
    const c=contract([{id:'last',type:'reachable',target:'last',scroller:'main',stationary:['document']}],{main:'#first',last:'#last',other:'#other'});
    assert.equal((await checkUI(page,c)).status,'pass');
    await page.locator('#block').evaluate(el=>el.style.display='block');
    assert.equal((await checkUI(page,c)).status,'fail');
    await page.locator('#block').evaluate(el=>el.style.display='none');
    assert.equal((await checkUI(page,c)).status,'pass');
    c.checks[0].scroller='other';assert.equal((await checkUI(page,c)).status,'unverified');
  });
});

test('public and workspace fixtures cover themes, narrow and low-height content pressure with restored defects',async()=>{
  const fixture=pathToFileURL(path.join(skillRoot,'tests/fixtures/surfaces.html'));
  for(const surface of ['public','workspace'])for(const [width,height,colorScheme] of [[900,650,'light'],[360,500,'dark'],[900,240,'light']]){
    const page=await browser.newPage({viewport:{width,height},colorScheme});
    try{
      const url=new URL(fixture);url.searchParams.set('surface',surface);url.searchParams.set('state','stress');
      await page.goto(url.href);
      const targets={ready:'#ready',queue:'#queue',last:surface==='public'?'#public-last':'#work-last',primary:'#primary',secondary:'#secondary'};
      const checks=[{id:'page',type:'page-overflow'},{id:'last',type:'reachable',target:'last',scroller:surface==='public'?'document':'queue',stationary:surface==='public'?[]:['document']}];
      if(surface==='workspace')checks.push({id:'owner',type:'scroll',target:'queue',axis:'y',stationary:['document']},{id:'header',type:'pinned',target:'ready',scroller:'queue',axis:'y'},{id:'siblings',type:'equal-style',target:'primary',other:'secondary',properties:['font-size','color','border-radius']});
      else checks.push({id:'owner',type:'scroll',target:'document',axis:'y'});
      const c={version:1,id:`${surface}-${width}-${height}`,viewport:{width,height},colorScheme,state:'stress',ready:'#ready[data-state="loaded"]',targets,checks};
      assert.equal((await checkUI(page,c)).status,'pass',`${surface} ${width} ${height}`);
      // Remove the constraint that keeps long content in the declared scroll owner.
      const selector=surface==='workspace'?'#queue':'.public';
      await page.locator(selector).evaluate(el=>el.style.minWidth='1200px');
      assert.equal((await checkUI(page,c)).status,'fail');
      await page.locator(selector).evaluate(el=>el.style.removeProperty('min-width'));
      assert.equal((await checkUI(page,c)).status,'pass');
      url.searchParams.set('state','empty');await page.goto(url.href);
      c.state='empty';c.ready='#ready[data-state="empty"]';
      c.checks=[{id:'page',type:'page-overflow'},{id:'scroll-content',type:'not-applicable',reason:'Empty collection has no long list; stress state checks scrolling.'}];
      assert.equal((await checkUI(page,c)).status,'pass');
    }finally{await page.close();}
  }
});
