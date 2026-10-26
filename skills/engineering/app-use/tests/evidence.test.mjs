import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Evidence,inspectRun} from '../scripts/evidence.mjs';
test('evidence rejects changed inputs, deleted inputs and altered artifacts',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'app-use-evidence-'));await fs.writeFile(path.join(root,'input.txt'),'initial');
  const begin=()=>Evidence.begin({id:'integrity',projectRoot:root,inputs:['input.txt']},{outDir:root,secrets:['controlled-secret']});
  const a=await begin();a.event('value',{value:'controlled-secret'});const r=await a.finish('pass');
  assert.equal((await inspectRun(r.runDir)).integrity,'verified');assert.equal(JSON.stringify(r).includes('controlled-secret'),false);
  await fs.appendFile(path.join(r.runDir,'script.json'),' ');assert.equal((await inspectRun(r.runDir)).status,'unverified');
  const b=await begin();await fs.writeFile(path.join(root,'input.txt'),'changed');assert.equal((await b.finish('pass')).status,'unverified');
  const c=await begin();await fs.unlink(path.join(root,'input.txt'));assert.equal((await c.finish('pass')).status,'unverified');
});
