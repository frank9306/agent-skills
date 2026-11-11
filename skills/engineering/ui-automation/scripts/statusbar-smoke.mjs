#!/usr/bin/env node
// Smoke test: launch the status bar overlay, keep it alive for 8 seconds.
import { StatusBarHost } from '../scripts/statusbar-host.mjs';

const sb = new StatusBarHost();
console.log('[smoke] Starting status bar overlay...');
try {
  await sb.start({ session: 'smoke-test' });
  console.log('[smoke] Overlay started OK');
} catch(e) {
  console.log('[smoke] Start failed:', e.message);
  process.exit(1);
}

console.log('[smoke] Pushing: armed/prepare');
sb.push({ phase: 'armed', verb: 'prepare', target: 'smoke test' });
await sleep(1000);

console.log('[smoke] Pushing: executing/click');
sb.push({ phase: 'act', verb: 'click', target: 'test button', actionExecuted: true });
await sleep(3000);

console.log('[smoke] Pushing: validate/validate');
sb.push({ phase: 'validate', verb: 'validate' });
await sleep(1000);

console.log('[smoke] Pushing: verified/done');
sb.push({ phase: 'verified', verb: 'done', goalVerified: true });
await sleep(2000);

console.log('[smoke] Stopping overlay...');
await sb.stop();
console.log('[smoke] Done.');
process.exit(0);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
