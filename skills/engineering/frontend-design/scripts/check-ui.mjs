const types = new Set(['style', 'equal-style', 'within', 'align', 'size', 'page-overflow', 'scroll', 'pinned', 'reachable', 'focus', 'overlay', 'not-applicable']);

function fields(value, allowed, label) {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${label} must be an object`);
  for(const key of Object.keys(value))if(!allowed.includes(key))throw new Error(`unknown ${label} field: ${key}`);
}
function validate(contract) {
  fields(contract,['version','id','url','inputs','viewport','colorScheme','state','ready','targets','checks'],'contract');
  if (contract?.version !== 1) throw new Error('contract.version must be 1');
  for (const key of ['id', 'state']) if (typeof contract[key] !== 'string' || !contract[key].trim()) throw new Error(`${key} is required`);
  fields(contract.viewport,['width','height'],'viewport');
  if (!contract.viewport || !['width', 'height'].every(k => Number.isInteger(contract.viewport[k]) && contract.viewport[k] > 0)) throw new Error('positive integer viewport is required');
  if (!['light', 'dark'].includes(contract.colorScheme)) throw new Error('colorScheme must be light or dark');
  if (!contract.ready || !contract.targets || !Array.isArray(contract.checks) || !contract.checks.length) throw new Error('ready, targets and nonempty checks are required');
  if(typeof contract.ready!=='string')fields(contract.ready,['selector','text','value'],'ready');
  if(typeof contract.targets!=='object'||Array.isArray(contract.targets))throw new Error('targets must be a selector map');
  for(const selector of Object.values(contract.targets))if(typeof selector!=='string'||!selector.trim())throw new Error('target selectors must be nonempty strings');
  const byType={style:['target','property','value'],'equal-style':['target','other','properties'],within:['target','container'],align:['target','other','edge'],size:['target','dimension','min','max'],'page-overflow':[],scroll:['target','axis','delta','stationary','boundary'],pinned:['target','scroller','axis','delta','stationary'],reachable:['target','scroller','stationary'],focus:['target','method','maxTabs'],overlay:['target','stationary'],'not-applicable':[]};
  const ids = new Set();
  for (const check of contract.checks) {
    if (typeof check?.id!=='string'||!check.id.trim() || ids.has(check.id)) throw new Error('check ids must be nonempty and unique');
    ids.add(check.id);
    if (!types.has(check.type)) throw new Error(`unsupported check type: ${check.type}`);
    fields(check,['id','type','reason','tolerance',...byType[check.type]],'check');
    if(check.stationary!==undefined&&(!Array.isArray(check.stationary)||!check.stationary.every(n=>typeof n==='string'&&n.trim())||new Set(check.stationary).size!==check.stationary.length))throw new Error('stationary must be a unique target-name list');
    if (check.tolerance !== undefined && (!Number.isFinite(check.tolerance) || check.tolerance < 0 || (check.tolerance !== 1 && !check.reason?.trim()))) throw new Error('non-default tolerance needs a reason and must be nonnegative');
    if (check.type === 'not-applicable' && !check.reason?.trim()) throw new Error('not-applicable needs a reason');
    if (check.type === 'align' && !['left','right','top','bottom','centerX','centerY'].includes(check.edge)) throw new Error('invalid alignment edge');
    if (check.type === 'size' && (!['width','height'].includes(check.dimension) || ![check.min,check.max].every(Number.isFinite) || check.min > check.max)) throw new Error('size needs dimension and finite ordered min/max');
    if (['scroll','pinned'].includes(check.type) && !['x','y'].includes(check.axis)) throw new Error('scroll/pinned axis must be x or y');
    if (check.delta !== undefined && (!Number.isFinite(check.delta) || check.delta <= 1)) throw new Error('delta must exceed 1 CSS px');
    if(check.boundary)fields(check.boundary,['edge','behavior','ancestor'],'boundary');
    if (check.boundary && (!['start','end'].includes(check.boundary.edge) || !['contain','chain'].includes(check.boundary.behavior) || !check.boundary.ancestor)) throw new Error('boundary requires edge, behavior and ancestor');
    if (check.type==='focus' && !['current','tab'].includes(check.method)) throw new Error('focus method must be current or tab');
    if (check.maxTabs!==undefined && (!Number.isInteger(check.maxTabs)||check.maxTabs<1||check.maxTabs>200)) throw new Error('maxTabs must be between 1 and 200');
    if (check.type==='overlay' && (!Array.isArray(check.stationary)||!check.stationary.length)) throw new Error('overlay needs stationary background targets');
  }
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => {
    const start = performance.now(); let previous = '', stable = 0;
    const tick = () => {
      const now = [...document.querySelectorAll('*')].filter(el=>el.scrollTop || el.scrollLeft).map(el=>[el.scrollTop,el.scrollLeft]).flat().join(',');
      stable = now === previous ? stable + 1 : 0; previous = now;
      if ((stable >= 5 && performance.now() - start >= 140) || performance.now() - start > 1200) resolve();
      else requestAnimationFrame(tick);
    }; requestAnimationFrame(tick);
  }));
}

async function scrollElement(page, contract, name) {
  return name === 'document' ? null : unique(page, contract.targets[name]);
}
async function containsTarget(container,target) {
  if(!container)return target.evaluate(el=>el!==document.scrollingElement&&document.scrollingElement.contains(el));
  const child=await target.elementHandle();
  try{return await container.evaluate((el,child)=>el!==child&&el.contains(child),child);}
  finally{await child.dispose();}
}
async function position(page, locator) {
  const measure = el => ({ x:el.scrollLeft,y:el.scrollTop,maxX:el.scrollWidth-el.clientWidth,maxY:el.scrollHeight-el.clientHeight });
  return locator ? locator.evaluate(measure) : page.evaluate(()=>{const el=document.scrollingElement;return {x:el.scrollLeft,y:el.scrollTop,maxX:el.scrollWidth-el.clientWidth,maxY:el.scrollHeight-el.clientHeight};});
}

async function focusCheck(page, target, check) {
  const focused=()=>target.evaluate(el=>el.matches(':focus')||el.contains(document.activeElement));
  let tabs=0;
  while(!await focused()&&check.method==='tab'&&tabs<(check.maxTabs??50)){await page.keyboard.press('Tab');tabs++;}
  const actual={focused:await focused(),tabs};
  return {actual,expected:'target receives keyboard focus',pass:actual.focused};
}

async function overlayCheck(page,contract,check,target,tolerance){
  return preservingScroll(page,async()=>{
    const names=check.stationary;
    // A positive wheel input must have room to reveal an unlocked background.
    for(const name of names)await moveTo(page,await scrollElement(page,contract,name),'y',0);
    const before=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
    if(!names.some(n=>before[n].maxY>tolerance))throw new Error('overlay lock needs overflowing background data or an explicit not-applicable check');
    const point=await target.evaluate(el=>{
      for(const [x,y] of [[2,2],[innerWidth-2,innerHeight-2],[2,innerHeight-2],[innerWidth-2,2]]){
        const top=document.elementFromPoint(x,y);if(top&&!el.contains(top))return {x,y};
      }return null;
    });
    if(!point)throw new Error('overlay has no exposed backdrop for wheel input; use a project-owned interaction test');
    await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,180);await settle(page);
    const after=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
    const focused=await target.evaluate(el=>el.contains(document.activeElement));
    const pass=focused&&names.every(n=>Math.abs(after[n].x-before[n].x)<=tolerance&&Math.abs(after[n].y-before[n].y)<=tolerance);
    return {actual:{before,after,focused,point},expected:'background remains stationary and focus is inside the overlay',pass};
  });
}
async function moveTo(page, locator, axis, value) {
  const move = (el, {axis,value}) => el.scrollTo({ left:axis==='x'?value:el.scrollLeft, top:axis==='y'?value:el.scrollTop, behavior:'instant' });
  if (locator) await locator.evaluate(move,{axis,value});
  else await page.evaluate(({axis,value})=>document.scrollingElement.scrollTo({left:axis==='x'?value:scrollX,top:axis==='y'?value:scrollY,behavior:'instant'}),{axis,value});
  await settle(page);
}
async function wheel(page, locator, axis, delta) {
  const v = page.viewportSize(); const box = locator ? await locator.boundingBox() : {x:0,y:0,width:v.width,height:v.height};
  if (!box || box.x >= v.width || box.y >= v.height || box.x+box.width <= 0 || box.y+box.height <= 0) throw new Error('scroll target is outside viewport');
  const x = (Math.max(0,box.x)+Math.min(v.width,box.x+box.width))/2;
  const y = (Math.max(0,box.y)+Math.min(v.height,box.y+box.height))/2;
  await page.mouse.move(x,y); await page.mouse.wheel(axis==='x'?delta:0,axis==='y'?delta:0); await settle(page);
}
async function preservingScroll(page, run) {
  const saved = await page.evaluateHandle(()=>[...new Set([document.scrollingElement,...document.querySelectorAll('*')])].map(el=>({el,x:el.scrollLeft,y:el.scrollTop})));
  try { return await run(); }
  finally {
    await saved.evaluate(rows=>rows.forEach(({el,x,y})=>{if(el.isConnected && (el.scrollLeft!==x || el.scrollTop!==y))el.scrollTo({left:x,top:y,behavior:'instant'});}));
    await saved.dispose(); await settle(page);
  }
}

async function scrollCheck(page, contract, check, target, tolerance) {
  return preservingScroll(page, async()=>{
    if (check.type==='reachable') {
      const scroller=await scrollElement(page,contract,check.scroller);
      if(!await containsTarget(scroller,target))throw new Error('reachable scroller must contain the action');
      const names=check.stationary??[];
      const before=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
      await target.scrollIntoViewIfNeeded(); await settle(page);
      const box=await target.boundingBox(), v=page.viewportSize();
      const hit=await target.evaluate(el=>{const r=el.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!top&&(el===top||el.contains(top));});
      const after=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
      const stationary=names.every(n=>Math.abs(after[n].x-before[n].x)<=tolerance&&Math.abs(after[n].y-before[n].y)<=tolerance);
      return {actual:{box,hit,before,after,scroll:await position(page,scroller)},expected:'visible, unobscured, with declared regions stationary',pass:!!box&&box.x>=-tolerance&&box.y>=-tolerance&&box.x+box.width<=v.width+tolerance&&box.y+box.height<=v.height+tolerance&&hit&&stationary};
    }
    const scroller=check.type==='pinned'?await scrollElement(page,contract,check.scroller):target;
    const axis=check.axis;
    await moveTo(page,scroller,axis,0);
    const before=await position(page,scroller);
    const pinnedBefore=check.type==='pinned'?await target.boundingBox():null;
    const names=check.stationary??[];
    const stationaryBefore=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
    await wheel(page,scroller,axis,check.delta??180);
    const after=await position(page,scroller);
    const stationaryAfter=Object.fromEntries(await Promise.all(names.map(async n=>[n,await position(page,await scrollElement(page,contract,n))])));
    let pass=after[axis]-before[axis]>tolerance&&names.every(n=>Math.abs(stationaryAfter[n].x-stationaryBefore[n].x)<=tolerance&&Math.abs(stationaryAfter[n].y-stationaryBefore[n].y)<=tolerance);
    const actual={before,after,stationaryBefore,stationaryAfter};
    if(check.type==='pinned'){
      actual.pinnedBefore=pinnedBefore;actual.pinnedAfter=await target.boundingBox();
      const coordinate=axis==='x'?'x':'y';pass=pass&&Math.abs(actual.pinnedAfter[coordinate]-pinnedBefore[coordinate])<=tolerance;
    }
    if(check.boundary){
      const ancestor=await scrollElement(page,contract,check.boundary.ancestor);
      const ancestorPos=await position(page,ancestor);
      const edge=check.boundary.edge;const max=axis==='x'?'maxX':'maxY';
      if(!scroller)throw new Error('document cannot declare a scroll ancestor');
      if(!await containsTarget(ancestor,scroller))throw new Error('boundary ancestor must be a distinct containing region');
      if(ancestorPos[max]<=tolerance)throw new Error('boundary ancestor has no scroll capacity; prepare overflowing data or declare not-applicable');
      // Give the declared ancestor room in the wheel direction before testing chaining.
      await moveTo(page,ancestor,axis,edge==='end'?0:ancestorPos[max]);
      await moveTo(page,scroller,axis,edge==='end'?after[max]:0);
      const boundaryBefore=await position(page,ancestor);
      await wheel(page,scroller,axis,(edge==='end'?1:-1)*(check.delta??180));
      const boundaryAfter=await position(page,ancestor);
      actual.boundary={before:boundaryBefore,after:boundaryAfter};
      const movement=Math.abs(boundaryAfter[axis]-boundaryBefore[axis]);
      pass=pass&&(check.boundary.behavior==='contain'?movement<=tolerance:movement>tolerance);
    }
    return {actual,expected:check.type==='pinned'?'scroller moves; target remains pinned':'target moves; stationary and boundary rules hold',pass};
  });
}

async function unique(page, selector) {
  if (typeof selector !== 'string' || !selector.trim()) throw new Error('target needs a selector');
  const locator = page.locator(selector);
  if (await locator.count() !== 1) throw new Error(`selector must match exactly once: ${selector}`);
  if (!await locator.isVisible()) throw new Error(`target is not visible: ${selector}`);
  return locator;
}

export async function checkUI(page, contract, options = {}) {
  const result = { version: 1, case: contract?.id, status: 'unverified', findings: [], measurements: [], coverage: [], evidence: { status: 'unverified', reason: 'No file-bound evidence requested.' } };
  let initialInputs,root;
  try {
    contract=JSON.parse(JSON.stringify(contract));
    result.contract={...contract,...(contract.url?{url:safeURL(contract.url)}:{})};
    validate(contract);
    if(options.inputs){root=await fs.realpath(options.projectRoot??process.cwd());initialInputs=await fingerprint(root,options.inputs);}
    const viewport = page.viewportSize();
    if (viewport?.width !== contract.viewport.width || viewport?.height !== contract.viewport.height) throw new Error('page viewport does not match contract');
    const ready = typeof contract.ready === 'string' ? { selector: contract.ready } : contract.ready;
    await page.locator(ready.selector).waitFor({ state: 'visible', timeout: options.timeout ?? 5000 });
    const readyLocator = await unique(page, ready.selector);
    if (ready.text !== undefined && (await readyLocator.textContent())?.trim() !== ready.text) throw new Error('ready text mismatch');
    if (ready.value !== undefined && await readyLocator.inputValue() !== ready.value) throw new Error('ready value mismatch');
    await page.waitForFunction(()=>document.fonts.status==='loaded',{},{timeout:options.timeout??5000});
    const dark=await page.evaluate(()=>matchMedia('(prefers-color-scheme: dark)').matches);
    if(dark!==(contract.colorScheme==='dark'))throw new Error('page media colorScheme does not match contract');
    result.environment = { url: safeURL(page.url()), viewport, colorScheme: contract.colorScheme, state: contract.state, browser: page.context().browser()?.version() ?? 'external', node:process.version,platform:process.platform };
    for (const check of contract.checks) {
      if (check.type === 'not-applicable') { result.coverage.push({ check: check.id, status: 'not-applicable', reason: check.reason }); continue; }
      const target = check.type === 'page-overflow' || (check.type==='scroll'&&check.target==='document') ? null : await unique(page, contract.targets[check.target]);
      const tolerance = check.tolerance ?? 1;
      let actual, expected, pass;
      if(['style','equal-style'].includes(check.type)){
        const properties=check.type==='style'?[check.property]:check.properties;
        if(!Array.isArray(properties)||!properties.length||!properties.every(p=>typeof p==='string'&&p.trim()))throw new Error('CSS properties must be nonempty strings');
        const supported=await page.evaluate(properties=>properties.every(p=>CSS.supports(p,'initial')),properties);
        if(!supported)throw new Error('unsupported CSS property');
      }
      if(check.type==='focus'){
        ({actual,expected,pass}=await focusCheck(page,target,check));
      } else if(check.type==='overlay'){
        ({actual,expected,pass}=await overlayCheck(page,contract,check,target,tolerance));
      } else if (['scroll','pinned','reachable'].includes(check.type)) {
        ({actual,expected,pass}=await scrollCheck(page,contract,check,target,tolerance));
      } else if (check.type === 'style') {
        if (typeof check.property !== 'string' || typeof check.value !== 'string') throw new Error('style requires property and string value');
        actual = await target.evaluate((el, property) => getComputedStyle(el).getPropertyValue(property).trim(), check.property);
        expected = await target.evaluate((el, { property, value }) => {
          if(!CSS.supports(property,value))throw new Error('invalid CSS value');
          const probe = document.createElement('span');
          // Resolve relative values beside the target, with its computed context.
          // Do not let a target's existing !important rule override the expectation.
          const context=getComputedStyle(el);
          for(const name of context)probe.style.setProperty(name,context.getPropertyValue(name));
          probe.style.setProperty('position','fixed');
          probe.style.setProperty('visibility','hidden');
          probe.style.setProperty('transition','none');
          probe.style.setProperty('animation','none');
          el.parentNode.appendChild(probe);
          try { probe.style.setProperty(property, value, 'important'); return getComputedStyle(probe).getPropertyValue(property).trim(); }
          finally { probe.remove(); }
        }, { property: check.property, value: check.value });
        pass = actual === expected;
      } else if (check.type === 'equal-style') {
        if (!Array.isArray(check.properties) || !check.properties.length) throw new Error('equal-style requires properties');
        const other = await unique(page, contract.targets[check.other]);
        const read = (el, properties) => Object.fromEntries(properties.map(p => [p, getComputedStyle(el).getPropertyValue(p).trim()]));
        actual = await target.evaluate(read, check.properties);
        expected = await other.evaluate(read, check.properties);
        if(Object.values(actual).includes('')||Object.values(expected).includes(''))throw new Error('CSS property has no measurable computed value');
        pass = JSON.stringify(actual) === JSON.stringify(expected);
      } else if (check.type === 'page-overflow') {
        actual = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0) - document.documentElement.clientWidth);
        expected = 0;
        pass = actual <= tolerance;
      } else {
        const rect = await target.boundingBox();
        if (!rect) throw new Error('target cannot be measured');
        if (check.type === 'size') {
          actual = rect[check.dimension]; expected = { min: check.min, max: check.max };
          pass = actual >= check.min - tolerance && actual <= check.max + tolerance;
        } else {
          const other = await unique(page, contract.targets[check.type === 'within' ? check.container : check.other]);
          const box = await other.boundingBox();
          if (!box) throw new Error('comparison target cannot be measured');
          if (check.type === 'within') {
            actual = rect; expected = box;
            pass = rect.x >= box.x - tolerance && rect.y >= box.y - tolerance && rect.x + rect.width <= box.x + box.width + tolerance && rect.y + rect.height <= box.y + box.height + tolerance;
          } else {
            const edge = r => ({ left:r.x, right:r.x+r.width, top:r.y, bottom:r.y+r.height, centerX:r.x+r.width/2, centerY:r.y+r.height/2 })[check.edge];
            actual = edge(rect); expected = edge(box); pass = Math.abs(actual - expected) <= tolerance;
          }
        }
      }
      result.measurements.push({ check: check.id, type: check.type, actual, expected });
      result.coverage.push({ check: check.id, status: pass ? 'pass' : 'fail' });
      if (!pass) result.findings.push({ check: check.id, type: check.type, actual, expected });
    }
    result.status = result.findings.length ? 'fail' : result.measurements.length ? 'pass' : 'unverified';
  } catch (error) { result.error = error.message; }
  try {
    if(initialInputs){
      const finalInputs=await fingerprint(root,options.inputs);
      if(JSON.stringify(initialInputs)!==JSON.stringify(finalInputs))throw new Error('inputs changed during check');
      result.evidence={status:'bound',projectRoot:root,inputs:initialInputs,contractSha256:digest(JSON.stringify(result.contract)),toolSha256:digest(await fs.readFile(toolFile)),documentSha256:digest(await page.content()),artifacts:[]};
    }
    if(options.outDir){
      await fs.mkdir(options.outDir,{recursive:true});
      const directory=await fs.mkdtemp(path.join(path.resolve(options.outDir),'ui-'));
      const screenshot=path.join(directory,'actual.png');
      await page.screenshot({path:screenshot,fullPage:false});
      if(initialInputs&&JSON.stringify(initialInputs)!==JSON.stringify(await fingerprint(root,options.inputs)))throw new Error('inputs changed during capture');
      result.evidence.artifacts=[{path:'actual.png',sha256:digest(await fs.readFile(screenshot))}];
      result.evidence.reportPath=path.join(directory,'report.json');
      result.evidence.reportDigest=reportDigest(result);
      await fs.writeFile(result.evidence.reportPath,JSON.stringify(result,null,2)+'\n','utf8');
    }
  } catch(error){result.status='unverified';result.error=error.message;result.evidence.status='unverified';}
  return result;
}
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const toolFile = fileURLToPath(import.meta.url);
const digest = value => createHash('sha256').update(value).digest('hex');
const reportDigest = report => digest(JSON.stringify({ ...report, evidence: { ...report.evidence, reportDigest: undefined } }));

async function scopedFile(root, name) {
  if (typeof name!=='string'||!name||path.isAbsolute(name)||path.win32.isAbsolute(name)||name.includes(':')) throw new Error('input/artifact paths must be relative');
  const resolved=await fs.realpath(path.resolve(root,name));
  const relative=path.relative(await fs.realpath(root),resolved);
  if(relative==='..'||relative.startsWith(`..${path.sep}`)||path.isAbsolute(relative))throw new Error('input/artifact path escapes its root');
  const stat=await fs.stat(resolved);if(!stat.isFile())throw new Error('input/artifact must be a file');
  return resolved;
}
async function fingerprint(root, inputs) {
  if(!Array.isArray(inputs)||!inputs.length||new Set(inputs).size!==inputs.length)throw new Error('inputs must be a nonempty unique file list');
  return Promise.all(inputs.map(async name=>({path:name,sha256:digest(await fs.readFile(await scopedFile(root,name)))})));
}
function safeURL(raw) {
  if(raw.startsWith('data:'))return `data:sha256:${digest(raw)}`;
  try{const u=new URL(raw);u.username='';u.password='';u.search='';u.hash='';return u.toString();}catch{return 'external-page';}
}


export async function verifyUIReport(reportPath, options={}) {
  try {
    const report=JSON.parse(await fs.readFile(reportPath,'utf8'));
    if(report.version!==1||report.evidence?.status!=='bound'||!report.evidence.artifacts?.length)throw new Error('report has no bound screenshot evidence');
    if(report.evidence.reportDigest!==reportDigest(report))throw new Error('report changed after verification');
    if(report.evidence.contractSha256!==digest(JSON.stringify(report.contract)))throw new Error('stale contract');
    if(report.evidence.toolSha256!==digest(await fs.readFile(toolFile)))throw new Error('stale checker version');
    const inputs=await fingerprint(options.projectRoot??report.evidence.projectRoot,report.evidence.inputs.map(x=>x.path));
    if(JSON.stringify(inputs)!==JSON.stringify(report.evidence.inputs))throw new Error('stale source/data/resource inputs');
    for(const item of report.evidence.artifacts){
      const file=await scopedFile(path.dirname(path.resolve(reportPath)),item.path);
      if(digest(await fs.readFile(file))!==item.sha256)throw new Error('stale or changed screenshot');
    }
    if(!['pass','fail','unverified'].includes(report.status))throw new Error('invalid report status');
    return report;
  } catch(error){return {version:1,status:'unverified',error:error.message};}
}
