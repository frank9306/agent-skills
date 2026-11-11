#!/usr/bin/env node
import { setTimeout as pause } from 'node:timers/promises';
import { StatusBarHost } from './statusbar-host.mjs';

const capsule = new StatusBarHost();
capsule.start({
  task: '胶囊显示测试',
  onError: error => {
    console.error(error);
    process.exitCode = 1;
  },
});
try {
  capsule.push({ action: 'start' });
  await pause(500);
  capsule.push({ action: 'wait' });
  await pause(4000);
  capsule.push({ action: 'assert' });
  await pause(800);
  capsule.push({ action: 'unverified' });
} finally {
  await capsule.stop();
}
