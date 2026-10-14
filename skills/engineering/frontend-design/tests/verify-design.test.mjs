// frontend-design-scan-ignore-file -- intentional source fixtures.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
const execute=promisify(execFile);
const verifier=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../scripts/verify-design.mjs');

test('read-only UI audit continues without DESIGN.md and retains actionable UI leads',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ui-scan-'));t.after(()=>fs.rm(root,{recursive:true}));
  await fs.writeFile(path.join(root,'view.html'),'<div onClick="run()">Action</div><img src="sample.png"><style>button{transition:all 1s}</style>');
  const {stdout}=await execute(process.execPath,[verifier,root,'--json']);
  const result=JSON.parse(stdout),rules=new Set(result.findings.map(f=>f.rule));
  assert.equal(result.counts.error,0);
  for(const rule of ['design-contract.absent','accessibility.nonsemantic-click','accessibility.image-alt','motion.transition-all'])assert.ok(rules.has(rule));
  assert.ok(result.findings.every(f=>f.classification==='inferred'));
});

test('general API/security/architecture audit is outside the static UI checker',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ui-scan-'));t.after(()=>fs.rm(root,{recursive:true}));
  await fs.writeFile(path.join(root,'code.tsx'),'const data:any = fetch("/api"); localStorage.setItem("token",data); const html = node.innerHTML;');
  const {stdout}=await execute(process.execPath,[verifier,root,'--json']);
  assert.ok(JSON.parse(stdout).findings.every(f=>! /^(security|architecture|api|state|type)\./.test(f.rule)));
});

test('an unreadable scan root is an execution error, not a successful audit',async()=>{
  await assert.rejects(execute(process.execPath,[verifier,path.join(os.tmpdir(),'missing-ui-root-'+Date.now()),'--json']),error=>error.code===2);
});

test('plain Markdown project design contracts are not forced into a foreign heading schema',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ui-scan-'));t.after(()=>fs.rm(root,{recursive:true}));
  await fs.writeFile(path.join(root,'DESIGN.md'),'# 界面约定\n\n运行数值见 src/tokens.css；组件变体见 src/ui。');
  const {stdout}=await execute(process.execPath,[verifier,root,'--json']);
  assert.equal(JSON.parse(stdout).findings.length,0);
});
