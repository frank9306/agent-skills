import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';

export async function fixture(name) {
  assert.ok(process.env.APP_USE_FOREGROUND_FIXTURE,'APP_USE_FOREGROUND_FIXTURE required');
  const child=spawn(process.env.APP_USE_FOREGROUND_FIXTURE,['--foreground',name],{stdio:['pipe','pipe','pipe']});
  const lines=createInterface({input:child.stdout}),queue=[],waiters=[];
  lines.on('line',line=>{const data=JSON.parse(line);const next=waiters.shift();next?next(data):queue.push(data);});
  const next=()=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('fixture timed out')),5000);const receive=x=>{clearTimeout(timer);resolve(x);};queue.length?receive(queue.shift()):waiters.push(receive);});
  try {
    const ready=await next();
    return {child,...ready,async state(command='state'){child.stdin.write(command+'\n');const r=await next();if(r.error)throw Error(r.error);return r;},close(){lines.close();child.kill();}};
  }catch(e){lines.close();child.kill();throw e;}
}
