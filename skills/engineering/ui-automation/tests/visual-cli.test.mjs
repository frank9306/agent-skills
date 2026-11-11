import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {skillRoot} from '../scripts/client.mjs';
import net from 'node:net';
import {randomUUID} from 'node:crypto';

const execute=promisify(execFile),cli=path.join(skillRoot,'scripts/app-use.mjs');
test('visual CLI requires an explicit output file before accessing the runtime',async()=>{
  const missing=path.join(skillRoot,'.local','missing-visual-cli-config');
  const error=await execute(process.execPath,[cli,'visual-observe','--session','fixture'],{env:{...process.env,APP_USE_HOME:missing}}).then(()=>null,e=>e);
  assert.equal(error?.code,2);
  const result=JSON.parse(error.stdout);
  assert.match(result.error,/--out.*PNG/);
});

test('visual CLI saves the exact screenshot without base64 output or overwriting a file',async()=>{
  await fs.mkdir(path.join(skillRoot,'.local'),{recursive:true});
  const dir=await fs.mkdtemp(path.join(skillRoot,'.local','visual-cli-'));
  const pipe='AppUse-cli-test-'+randomUUID(),methods=[];
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII=','base64');
  const server=net.createServer(socket=>{
    let input='';socket.setEncoding('utf8');socket.on('data',chunk=>{
      input+=chunk;let end;
      while((end=input.indexOf('\n'))>=0){const message=JSON.parse(input.slice(0,end));input=input.slice(end+1);methods.push(message.method);
        socket.write(JSON.stringify({id:message.id,result:{id:'fresh-visual',identity:{session:'fixture',kind:'browser'},coordinateSpace:'image-pixels',image:{mime:'image/png',data:png.toString('base64'),width:1,height:1}}})+'\n');}
    });
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen('\\\\.\\pipe\\'+pipe,resolve);});
  await fs.writeFile(path.join(dir,'runtime.json'),JSON.stringify({pipe,executable:'not-needed'}),'utf8');
  const out=path.join(dir,'observed.png'),env={...process.env,APP_USE_HOME:dir};
  try {
    const {stdout}=await execute(process.execPath,[cli,'visual-observe','--session','fixture','--out',out],{env});
    const result=JSON.parse(stdout);
    assert.equal(result.id,'fresh-visual');assert.equal(result.image.path,out);assert.equal(result.image.data,undefined);
    assert.deepEqual(await fs.readFile(out),png);
    const error=await execute(process.execPath,[cli,'visual-observe','--session','fixture','--out',out],{env}).then(()=>null,e=>e);
    assert.equal(error?.code,2);assert.match(JSON.parse(error.stdout).error,/EEXIST/);
    assert.deepEqual(await fs.readFile(out),png);
    assert.deepEqual(methods,['visual-observe','visual-observe']);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
