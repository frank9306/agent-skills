#!/usr/bin/env node
/**
 * statusbar-demo.mjs — End-to-end demo of the status bar during a real operation.
 *
 * Launches the status bar, performs a cache cleanup operation (equivalent to
 * what Mole does), pushes live status events throughout, then reports results.
 */
import { StatusBarHost } from '../scripts/statusbar-host.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getDirSize(p) {
  return getDirSizeAsync(p);
}

async function getDirSizeAsync(dirPath) {
  let total = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      try {
        if (e.isDirectory()) total += await getDirSizeAsync(full);
        else if (e.isFile()) { const st = await fs.stat(full); total += st.size; }
      } catch {}
    }
  } catch {}
  return total;
}

async function cleanDir(dirPath, label) {
  let removed = 0;
  let freed = 0;
  const before = await getDirSizeAsync(dirPath);
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const e of entries) {
      try {
        const full = path.join(dirPath, e.name);
        await fs.rm(full, { recursive: true, force: true });
        removed++;
      } catch {}
    }
  } catch {}
  const after = await getDirSizeAsync(dirPath);
  freed = before - after;
  return { label, before, after, freed, removed };
}

async function main() {
  const sb = new StatusBarHost();
  
  console.log('=== 启动状态条 ===');
  await sb.start({ task: '缓存清理演示' });
  
  // Phase 1: Armed
  sb.push({ action: 'start' });
  console.log('[status] armed: prepare');
  await sleep(1500);
  
  const targets = [
    { path: path.join(os.tmpdir()), label: 'User Temp' },
    { path: 'C:/Users/frank/AppData/Local/Google/Chrome/User Data/Default/Cache', label: 'Chrome Cache' },
    { path: 'C:/Users/frank/AppData/Local/Google/Chrome/User Data/Default/Code Cache', label: 'Chrome Code Cache' },
    { path: 'C:/Users/frank/AppData/Local/Google/Chrome/User Data/Default/GPUCache', label: 'Chrome GPU Cache' },
    { path: 'C:/Users/frank/.codex/cache', label: 'Codex Cache' },
  ];
  
  const results = [];
  for (const t of targets) {
    sb.push({ action: 'read' });
    console.log(`[status] observe: scan ${t.label}`);
    await sleep(300);
    
    const beforeSize = await getDirSizeAsync(t.path);
    if (beforeSize === 0) {
      console.log(`  ${t.label}: already clean, skipping`);
      results.push({ label: t.label, before: 0, after: 0, freed: 0, removed: 0, skipped: true });
      continue;
    }
    
    sb.push({ action: 'wait' });
    console.log(`[status] act: clean ${t.label} (${(beforeSize / 1048576).toFixed(1)} MB)`);
    const result = await cleanDir(t.path, t.label);
    
    sb.push({ action: 'assert' });
    await sleep(300);
    
    console.log(`  Freed: ${(result.freed / 1048576).toFixed(1)} MB`);
    results.push(result);
    await sleep(500);
  }
  
  // Summary
  const totalFreed = results.reduce((s, r) => s + r.freed, 0);
  sb.push({ action: 'pass' });
  console.log(`\n[status] verified: complete, total freed: ${(totalFreed / 1073741824).toFixed(2)} GB`);
  await sleep(2000);
  
  console.log('\n=== 关闭状态条 ===');
  await sb.stop();
  
  // Print results
  console.log('\n=== 清理结果 ===');
  for (const r of results) {
    const mb = (v) => (v / 1048576).toFixed(1) + ' MB';
    if (r.skipped) {
      console.log(`  ${r.label}: 已清理，跳过`);
    } else {
      console.log(`  ${r.label}: ${mb(r.before)} → ${mb(r.after)} (释放 ${mb(r.freed)}, 删除 ${r.removed} 项)`);
    }
  }
  console.log(`\n  总计释放: ${(totalFreed / 1073741824).toFixed(2)} GB`);
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
