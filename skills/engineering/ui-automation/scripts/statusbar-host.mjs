import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const executable = fileURLToPath(new URL('../native/StatusBar/dist/status-bar.exe', import.meta.url));
const actions = new Set([
  'start', 'target', 'click', 'invoke', 'fill', 'key', 'scroll', 'select',
  'drag', 'read', 'focus', 'move', 'navigate', 'newTab', 'switchTab',
  'scrollIntoView', 'files', 'dialog', 'assert', 'wait', 'branch', 'judge',
  'capture', 'pass', 'fail', 'error', 'unverified', 'stopped',
]);
const terminal = new Set(['pass', 'fail', 'error', 'unverified', 'stopped']);

export class StatusBarHost {
  #child;
  #exited;
  #timer;
  #event;
  #task;
  #finishedAt;

  start({ task, onError, program = executable } = {}) {
    if (this.#child) return;
    this.#task = [...String(task || 'Automation').replace(/[\p{C}\s]+/gu, ' ').trim()].slice(0, 56).join('');
    const child = spawn(program, [], { stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true });
    this.#child = child;
    this.#exited = new Promise(resolve => child.once('close', code => {
      clearInterval(this.#timer);
      if (code && code !== 0) onError?.('renderer exited with code ' + code);
      resolve();
    }));
    child.once('error', error => onError?.(error.message));
    child.stdin.on('error', () => {}); // Exit and pipe closure can race.
    this.#timer = setInterval(() => this.#send(), 500);
  }

  push({ action, hwnd, pid }) {
    if (!this.#child || !actions.has(action) || this.#finishedAt) return;
    const identity = Number.isSafeInteger(hwnd) && hwnd > 0 && Number.isSafeInteger(pid) && pid > 0
      ? { hwnd, pid }
      : {};
    this.#event = {
      ...this.#event,
      ...identity,
      task: this.#task,
      action: action === 'target' ? this.#event?.action || 'start' : action,
    };
    if (terminal.has(action)) this.#finishedAt = Date.now();
    this.#send();
  }

  #send() {
    const input = this.#child?.stdin;
    if (this.#event && input?.writable && !input.writableNeedDrain) {
      input.write(JSON.stringify(this.#event) + '\n');
    }
  }

  async stop() {
    if (!this.#child) return;
    if (this.#finishedAt) await delay(Math.max(0, 650 - (Date.now() - this.#finishedAt)));
    clearInterval(this.#timer);
    const child = this.#child;
    child.stdin.end();
    const timeout = setTimeout(() => child.kill(), 1000);
    try { await this.#exited; } finally { clearTimeout(timeout); }
  }
}
