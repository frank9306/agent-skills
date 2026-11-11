/**
 * mole-cleanup.mjs — End-to-end verification: drive the Mole cleanup app
 * through its real UI (Windows UI Automation) while the native status bar
 * overlay shows progress.
 *
 * Flow:
 *   1. start the native Win32 status bar overlay
 *   2. spawn the Mole UI automation driver (native/MoleUI/mole-ui.ps1)
 *   3. mirror every driver status line onto the overlay
 *   4. report the cleanup result
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { StatusBarHost } from './statusbar-host.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POWERSHELL = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const driverScript = path.join(__dirname, '..', 'native', 'MoleUI', 'mole-ui.ps1');
const assetsDir = path.join(__dirname, '..', 'assets');
if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
const shotPath = path.join(assetsDir, 'mole-cleanup-run.png');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Grab the top strip of the screen (where the status bar lives) plus the
 *  Mole window region, so the run has a visual artefact. */
async function capture(label) {
    const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$src = New-Object System.Drawing.Bitmap(1920, 240)
$g = [System.Drawing.Graphics]::FromImage($src)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1920, 240)))
$g.Dispose()
$dst = New-Object System.Drawing.Bitmap(1440, 180)
$g2 = [System.Drawing.Graphics]::FromImage($dst)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($src, 0, 0, 1440, 180)
$g2.Dispose()
$dst.Save('${shotPath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
$src.Dispose()
Write-Host 'ok'
`;
    const p = spawn(POWERSHELL, ['-NoProfile', '-Command', script], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    await new Promise(r => p.on('exit', r));
    console.log(`  [shot] ${label}: ${existsSync(shotPath) ? statSync(shotPath).size + ' bytes' : 'FAILED'}`);
}

const bar = new StatusBarHost();

console.log('=== app-use · Mole UI 自动化验证 ===\n');

console.log('[1/4] 启动原生 Win32 状态栏...');
await bar.start({
    task: 'Mole 清理',
    onError: (msg) => console.error('  [bar error]', msg),
});
bar.push({ action: 'start' });
await sleep(600);

console.log('[2/4] 启动 Mole UI 自动化驱动...');
const child = spawn(POWERSHELL, [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', driverScript,
], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: false });

let stdoutBuf = '';
let result = null;
let captured = false;
const logs = [];

child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
    stdoutBuf += chunk;
    let idx;
    while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
        const line = stdoutBuf.slice(0, idx).trim();
        stdoutBuf = stdoutBuf.slice(idx + 1);
        if (!line) continue;

        let evt;
        try { evt = JSON.parse(line); } catch {
            console.log('  [driver]', line);
            continue;
        }

        if (evt.kind === 'status') {
            const action = { preview: 'read', act: 'click', execute: 'wait', validate: 'assert' }[evt.phase];
            if (action) bar.push({ action });
            console.log(`  [bar ${evt.phase}] ${evt.verb}${evt.target ? ' · ' + evt.target : ''}`);
            if (!captured && evt.phase === 'execute') {
                captured = true;
                capture('during-cleanup').catch(() => {});
            }
        } else if (evt.kind === 'log') {
            logs.push(evt.message);
            console.log('  [ui]', evt.message);
        } else if (evt.kind === 'result') {
            result = evt;
        }
    }
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (d) => console.error('  [driver err]', d.trim()));

const exitCode = await new Promise((resolve) => {
    child.on('exit', (code) => resolve(code));
    setTimeout(() => { try { child.kill(); } catch {} resolve(-1); }, 120000);
});

console.log('\n[3/4] 驱动退出，code =', exitCode);

console.log('[4/4] 停止状态栏...');
bar.push({ action: result?.ok ? 'pass' : 'error' });
await bar.stop();

console.log('\n=== 结果 ===');
if (result?.ok) {
    console.log('状态: 成功');
    console.log('Mole PID:', result.pid, ' hwnd: 0x' + result.hwnd);
    console.log('UI 操作路径:', result.clicked);
    console.log('operations.jsonl:', result.opsBefore, '->', result.opsAfter, '行');

    if (result.newOps?.length) {
        console.log('\n本次新增操作记录:');
        for (const raw of result.newOps) {
            try {
                const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
                const mb = o.Bytes ? (o.Bytes / 1048576).toFixed(2) : '0';
                console.log(`  · ${o.Operation}/${o.Stage} → ${o.Result || '-'} | 条目 ${o.Items} | 成功 ${o.Succeeded} 失败 ${o.Failed} 跳过 ${o.Skipped} | ${mb} MB | ${o.DurationMs ?? '-'} ms`);
            } catch {
                console.log('  · ' + raw);
            }
        }
    }

    const sb = result.statsBefore, sa = result.statsAfter;
    if (sb && sa) {
        const fmt = (n) => (n / 1073741824).toFixed(3) + ' GiB';
        const delta = (sa.LifetimeCleaned || 0) - (sb.LifetimeCleaned || 0);
        console.log('\nMole stats.json:');
        console.log(`  LifetimeCleaned: ${fmt(sb.LifetimeCleaned)} -> ${fmt(sa.LifetimeCleaned)}  (本次 +${(delta / 1048576).toFixed(2)} MB)`);
        console.log(`  AppsRemoved:     ${sb.AppsRemoved} -> ${sa.AppsRemoved}`);
        console.log(`  OptimizeRuns:    ${sb.OptimizeRuns} -> ${sa.OptimizeRuns}`);
    }
} else {
    console.log('状态: 失败 —', result?.reason || 'driver produced no result');
    if (result?.elements != null) console.log('发现的元素数:', result.elements);
}

process.exit(result?.ok ? 0 : 1);
