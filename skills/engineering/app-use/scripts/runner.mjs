import {createHash} from 'node:crypto';
import {setTimeout as pause} from 'node:timers/promises';
import {resolveTarget,validateObservation} from './assertions.mjs';
import {Evidence} from './evidence.mjs';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const kinds=['action','assert','wait','branch','judge','finish'];
const actionTypes=['click','invoke','fill','key','scroll','select','drag','read','focus','move','navigate','newTab','switchTab','scrollIntoView','files','dialog'];
function fields(obj,allowed,label){if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error(`${label} must be an object`);for(const key of Object.keys(obj))if(!allowed.includes(key))throw Error(`unknown ${label} field: ${key}`);}
function freeze(obj){if(obj&&typeof obj==='object'){Object.freeze(obj);for(const v of Object.values(obj))freeze(v);}return obj;}
async function bounded(promise,signal){
  signal.throwIfAborted();let abort;
  try{return await Promise.race([promise,new Promise((_,reject)=>{abort=()=>reject(signal.reason||Error('stopped'));signal.addEventListener('abort',abort,{once:true});})]);}
  finally{signal.removeEventListener('abort',abort);}
}
function assertion(a){
  fields(a,['type','reason','target','property','equals'],'assertion');
  if(a.type==='not-applicable'){if(!a.reason?.trim())throw Error('N/A needs reason');return;}
  if(a.type!==undefined)throw Error('unsupported assertion type');
  if(!a.target||!Object.keys(a.target).length||!['name','value','enabled','visible','focused','selected','role'].includes(a.property)||!['string','boolean','number'].includes(typeof a.equals)||typeof a.equals==='number'&&!Number.isFinite(a.equals))throw Error('literal goal assertion required');
  match(a.target);
}
function match(m){fields(m,['id','role','name','value','automationId','context','selector'],'target match');if(!Object.keys(m).length||Object.values(m).some(v=>typeof v!=='string'))throw Error('exact string target match required');}
function budget(n,min=1,max=60000){if(!Number.isInteger(n)||n<min||n>max)throw Error('invalid declared time/interval budget');}
function action(a){
  fields(a,['type','match','toMatch','text','secretEnv','key','value','x','y','deltaX','deltaY','direction','url','tabId','files','accept'],'action');
  if(!actionTypes.includes(a.type))throw Error('unsupported action type');
  if(['click','invoke','fill','scroll','select','drag','read','scrollIntoView','files'].includes(a.type)&&!a.match)throw Error('action match required');
  if(a.type==='fill'&&((typeof a.text==='string')=== (typeof a.secretEnv==='string')))throw Error('fill needs exactly text or secretEnv');
  if(a.secretEnv!==undefined&&!/^[A-Za-z_][A-Za-z0-9_]*$/.test(a.secretEnv))throw Error('invalid secretEnv name');
  if(a.match)match(a.match);if(a.toMatch)match(a.toMatch);
  if(a.type==='key'&&!/^(?:(?:Ctrl|Shift)\+){0,2}(?:[a-zA-Z0-9]|Tab|Enter|Escape|Space|Backspace|Delete|Home|End|ArrowLeft|ArrowUp|ArrowRight|ArrowDown)$/.test(a.key))throw Error('unsupported key');
  if(a.type==='select'&&typeof a.value!=='string')throw Error('select value required');
  for(const key of ['x','y','deltaX','deltaY'])if(a[key]!==undefined&&!Number.isFinite(a[key]))throw Error('finite action coordinates required');
  if(a.type==='move'&&(!Number.isFinite(a.x)||!Number.isFinite(a.y)))throw Error('move coordinates required');
  if(['navigate','newTab'].includes(a.type)&&typeof a.url!=='string')throw Error('navigation URL required');
  if(a.type==='switchTab'&&!Number.isInteger(a.tabId))throw Error('tabId required');
  if(a.type==='files'&&(!Array.isArray(a.files)||!a.files.length||a.files.some(f=>typeof f!=='string'||!/^[a-zA-Z]:[\\/]/.test(f))))throw Error('absolute file list required');
  if(a.type==='dialog'&&typeof a.accept!=='boolean')throw Error('dialog accept required');
  if(a.type==='drag'&&!a.toMatch)throw Error('drag destination match required');
}
export function validateCase(input){
  const s=JSON.parse(JSON.stringify(input));
  fields(s,['version','id','session','start','states','prepare','cleanup','inputs','projectRoot','build','observation','stepTimeoutMs','timeoutMs','maxSteps'],'case');
  if(s.version!==1||!s.id?.trim()||!s.session?.trim())throw Error('version 1, id and prepared session required');
  s.stepTimeoutMs??=5000;s.timeoutMs??=120000;s.maxSteps??=100;
  if(s.observation){fields(s.observation,['selector','context','limit','scope'],'observation scope');for(const key of ['selector','context'])if(s.observation[key]!==undefined&&typeof s.observation[key]!=='string')throw Error('scope selector/context must be strings');if(s.observation.limit!==undefined&&(!Number.isInteger(s.observation.limit)||s.observation.limit<1||s.observation.limit>1000))throw Error('invalid observation limit');if(s.observation.scope){fields(s.observation.scope,['name','role'],'desktop scope');if(!Object.keys(s.observation.scope).length||Object.values(s.observation.scope).some(v=>typeof v!=='string'||!v.trim()))throw Error('unique desktop scope required');}}
  for(const [key,max]of [['stepTimeoutMs',60000],['timeoutMs',3600000],['maxSteps',10000]])if(!Number.isInteger(s[key])||s[key]<1||s[key]>max)throw Error(`invalid ${key}`);
  fields(s.states,Object.keys(s.states||{}),'states');
  const ids=Object.keys(s.states);if(!ids.length||!ids.includes(s.start))throw Error('start state required');
  const next=id=>{if(!ids.includes(id))throw Error(`unknown next state: ${id}`);};
  for(const [id,state]of Object.entries(s.states)){
    fields(state,[...kinds,'next'],`state ${id}`);
    if(kinds.filter(k=>Object.hasOwn(state,k)).length!==1)throw Error('each state must own exactly one operation');
    if(state.finish!==undefined){if(state.finish!=='complete'||state.next!==undefined)throw Error('finish must be complete without next');continue;}
    if(state.action)action(state.action);
    if(state.assert)assertion(state.assert);
    if(state.wait){fields(state.wait,['assertion','timeoutMs','intervalMs'],'wait');assertion(state.wait.assertion);if(state.wait.assertion.type==='not-applicable')throw Error('wait cannot be N/A');}
    if(state.branch){fields(state.branch,['rules','otherwise'],'branch');if(!Array.isArray(state.branch.rules)||!state.branch.rules.length)throw Error('branch rules required');for(const r of state.branch.rules){fields(r,['when','next'],'rule');assertion(r.when);if(r.when.type==='not-applicable')throw Error('rule cannot be N/A');next(r.next);}next(state.branch.otherwise);}
    if(state.judge){const j=state.judge;fields(j,['question','options','minProbability','timeoutMs'],'judge');if(!j.question?.trim()||!Array.isArray(j.options)||j.options.length<2||j.options.length>12||new Set(j.options.map(o=>o.id)).size!==j.options.length||!Number.isFinite(j.minProbability)||j.minProbability<=0||j.minProbability>1)throw Error('bounded judge declaration required');if(j.options.filter(o=>o.unknown===true).length!==1)throw Error('judge needs exactly one unknown candidate');for(const o of j.options){fields(o,['id','meaning','next','unknown'],'candidate');if(!/^[a-z][a-z0-9_-]{0,31}$/.test(o.id)||!o.meaning?.trim())throw Error('candidate id/meaning required');if(o.unknown){if(o.next!==undefined)throw Error('unknown cannot dispatch next');}else next(o.next);}}
    if((state.branch||state.judge)&&state.next!==undefined)throw Error('branch/judge destinations must be declared only by candidates');
    if(!state.branch&&!state.judge)next(state.next);
  }
  for(const name of ['prepare','cleanup']){s[name]??=[];if(!Array.isArray(s[name])||s[name].length>100)throw Error(`${name} must be a bounded action list`);s[name].forEach(action);}
  for(const state of Object.values(s.states)){if(state.wait){budget(state.wait.timeoutMs??s.stepTimeoutMs);budget(state.wait.intervalMs??100,10,1000);}if(state.judge)budget(state.judge.timeoutMs??60000);}
  return freeze(s);
}

export async function runCase(client,input,options={}){
  let script;try{script=validateCase(input);}catch(e){return {status:'error',error:e.message};}
  const secrets=[...script.prepare,...script.cleanup,...Object.values(script.states).map(s=>s.action).filter(Boolean)].map(a=>a.secretEnv?process.env[a.secretEnv]:undefined).filter(Boolean);
  const evidence=await Evidence.begin(script,{outDir:options.outDir,secrets,runtime:client.config?{version:client.config.version,pipe:client.config.pipe}:undefined});
  const budget=new AbortController(),timer=setTimeout(()=>budget.abort(Error('case timeout')),script.timeoutMs);
  const signal=options.signal?AbortSignal.any([options.signal,budget.signal]):budget.signal;
  const required=Object.entries(script.states).filter(([,s])=>s.assert&&s.assert.type!=='not-applicable').map(([id])=>id),passed=new Set();
  let steps=0,status='unverified',error,finished=false,last,stepSignal=signal;
  const beginStep=ms=>{stepSignal=AbortSignal.any([signal,AbortSignal.timeout(ms)]);};
  const check=()=>{signal.throwIfAborted();if(steps>=script.maxSteps)throw Error('maximum steps reached');};
  const request=(method,p,timeoutMs=script.stepTimeoutMs)=>{stepSignal.throwIfAborted();return bounded(client.request(method,{session:script.session,...p},{signal:stepSignal,timeoutMs}),stepSignal);};
  const observe=async()=>{last=await request('observe',script.observation||{});if(!last?.complete)throw Error('observation incomplete');evidence.event('observation',{observation:last});return last;};
  async function perform(a){
    check();beginStep(script.stepTimeoutMs);steps++;const o=await observe(),actual={...a};delete actual.match;delete actual.toMatch;
    if(a.match)actual.target=resolveTarget(o,a.match,{allowSensitive:a.type==='fill'&&!!a.secretEnv}).id;
    if(a.toMatch)actual.to=resolveTarget(o,a.toMatch).id;
    if(a.secretEnv){actual.text=process.env[a.secretEnv];if(actual.text===undefined)throw Error('secret environment variable unavailable');actual.sensitive=true;delete actual.secretEnv;}
    evidence.event('action-request',{action:a,observation:o.id});
    signal.throwIfAborted();const r=await request('act',{observation:o.id,action:actual});
    if(!r?.actionExecuted)throw Error('action execution unconfirmed');
    evidence.event('action',{action:a,result:r});last=r.observation;
  }
  try{
    for(const a of script.prepare)await perform(a);
    let id=script.start;
    while(!finished){
      check();const state=script.states[id];
      if(state.action){await perform(state.action);id=state.next;continue;}
      beginStep(state.wait?.timeoutMs??state.judge?.timeoutMs??script.stepTimeoutMs);steps++;const o=await observe();
      if(state.assert){const result=validateObservation(o,state.assert);evidence.event('assertion',{state:id,assertion:state.assert,...result});if(result.status==='fail'){status='fail';finished=true;}else if(result.status==='pass')passed.add(id);id=state.next;}
      else if(state.wait){
        const limit=state.wait.timeoutMs??script.stepTimeoutMs,interval=state.wait.intervalMs??100;
        if(!Number.isInteger(limit)||limit<1||limit>60000||!Number.isInteger(interval)||interval<10||interval>1000)throw Error('invalid wait budget');
        const until=Date.now()+limit;let current=o;
        for(;;){const r=validateObservation(current,state.wait.assertion,{allowMissing:true});if(r.status==='pass')break;if(Date.now()>=until)throw Error('wait timed out');await pause(Math.min(interval,Math.max(1,until-Date.now())),undefined,{signal:stepSignal});current=await observe();}
        evidence.event('wait',{state:id,status:'ready'});id=state.next;
      }
      else if(state.branch){let chosen=state.branch.otherwise;for(const rule of state.branch.rules)if(validateObservation(o,rule.when).status==='pass'){chosen=rule.next;break;}evidence.event('rule',{state:id,next:chosen});id=chosen;}
      else if(state.judge){
        if(o.nodes.some(n=>n.truncated)){status='unverified';error='semantic observation has truncated text; declare a complete narrower scope';finished=true;continue;}
        if(!options.judge)throw Error('local Laya worker unavailable');
        const j=state.judge,timeoutMs=j.timeoutMs??60000;
        if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw Error('invalid model timeout');
        const token=AbortSignal.any([stepSignal,AbortSignal.timeout(timeoutMs)]),snapshot=hash({nodes:o.nodes,identity:o.identity});
        const modelRequest={state:JSON.stringify(o.nodes.filter(n=>!n.sensitive).map(n=>({role:n.role,name:n.name,value:n.value,enabled:n.enabled,visible:n.visible}))),question:j.question,options:j.options.map(({id,meaning})=>({id,meaning}))};
        const reply=await bounded(options.judge.judge(modelRequest,{signal:token,timeoutMs}),token);
        token.throwIfAborted();signal.throwIfAborted();
        evidence.event('model',{state:id,request:modelRequest,reply,threshold:j.minProbability});
        const p=reply?.probabilities,ids=j.options.map(x=>x.id);
        if(reply?.error||!p||Object.keys(p).length!==ids.length||ids.some(k=>!Object.hasOwn(p,k))||!ids.includes(reply.choice)||Object.values(p).some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(Object.values(p).reduce((a,b)=>a+b,0)-1)>.002||p[reply.choice]+.0001<Math.max(...Object.values(p)))throw Error('invalid local model candidates/probabilities');
        const fresh=await observe();
        if(snapshot!==hash({nodes:fresh.nodes,identity:fresh.identity})){status='unverified';error='observation changed during judgment';finished=true;continue;}
        const chosen=j.options.find(x=>x.id===reply.choice);
        if(chosen.unknown||p[reply.choice]<j.minProbability){status='unverified';error=chosen.unknown?'unknown state':'low confidence';finished=true;}
        else id=chosen.next;
      }
      else {finished=true;status=required.length&&required.every(id=>passed.has(id))?'pass':'unverified';if(status==='unverified')error='no valid goal assertions or required assertions not reached';}
    }
  }catch(e){status=options.signal?.aborted?'stopped':'error';error=e.message;if(stepSignal.aborted&&!signal.aborted)budget.abort(e);}
  finally{
    // Never dispatch cleanup after cancellation or the case budget expires.
    if(!signal.aborted){
      beginStep(script.stepTimeoutMs);
      try{await evidence.capture({request:(method,p)=>request(method,p)},script.session);}
      catch(e){evidence.event('evidence-error',{error:e.message});if(status==='pass'){status='unverified';error='screenshot evidence unavailable';}}
      for(const a of script.cleanup){try{await perform(a);}catch(e){evidence.event('cleanup-error',{error:e.message});if(status==='pass'){status='error';error='cleanup failed';}break;}}
    }
    else {try{if(client.stop)await client.stop(script.session);else await client.request('stop',{session:script.session},{timeoutMs:1000});}catch(e){evidence.event('stop-error',{error:e.message});}}
    clearTimeout(timer);
  }
  return evidence.finish(status,{error,steps,assertions:{required,passed:[...passed]},identity:last?.identity});
}
