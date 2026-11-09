/**
 * statusbar-host.mjs — Node-side host for the app-use status bar overlay.
 *
 * Two interchangeable backends produce the same overlay and the same JSON
 * event protocol:
 *
 *   1. `native/StatusBar/status-bar.exe` — a Go build of the Win32 overlay.
 *      Preferred when it is present *and* the machine allows it to run.
 *   2. `native/StatusBar/status-bar-native.ps1` — the same Win32 window
 *      implemented with Add-Type (C# P/Invoke compiled in-memory) and driven
 *      by Windows PowerShell.
 *
 * Why the fallback exists: on machines with Smart App Control (Windows
 * Defender Application Control) in enforcement mode, every newly compiled or
 * unsigned executable is blocked — including the Go build and any Node native
 * addon. `powershell.exe` is Microsoft-signed and therefore trusted, and
 * Add-Type compiles in memory where SAC does not apply. The Go build stays
 * the primary path for machines where SAC is off or disabled.
 *
 * Both backends create the window with the required extended styles:
 *   WS_EX_NOACTIVATE    — no focus stealing
 *   WS_EX_TRANSPARENT   — mouse click-through
 *   WS_EX_TOOLWINDOW    — no Alt-Tab entry
 *   WS_EX_TOPMOST       — session-scoped topmost
 *   WS_EX_LAYERED       — smooth repaint
 *
 * The overlay reads JSON status events from stdin (one per line).
 *
 * On heartbeat timeout (2s) → switches to "unknown" state.
 * On extended silence (3s) → hides the window.
 * On stdin EOF or "stop" event → destroys the window and exits.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const POWERSHELL = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';

const PHASE_MAP = Object.freeze({
  armed: 'preview',
  observe: 'executing',
  act: 'executing',
  validate: 'executing',
  verified: 'verified',
  blocked: 'blocked',
  unknown: 'unknown',
});

export class StatusBarHost {
  #process = null;
  #seq = 0;
  #session = null;
  #started = false;
  #backend = null;
  #stderr = [];

  /**
   * Start the overlay window.
   * @param {{ session?: string, onError?: (msg: string) => void,
   *           prefer?: 'auto' | 'go' | 'powershell' }} opts
   */
  async start({ session, onError, prefer = 'auto' } = {}) {
    if (this.#started) return;
    this.#started = true;
    this.#session = session || `sb-${Date.now().toString(36)}`;

    const nativeDir = path.join(__dirname, '..', 'native', 'StatusBar');
    const goExe = path.join(nativeDir, 'status-bar.exe');
    const psScript = path.join(nativeDir, 'status-bar-native.ps1');

    const tryGo = async () => {
      try {
        await fs.access(goExe);
      } catch {
        return false;
      }
      const child = spawn('"' + goExe + '"', [], {
        stdio: ['pipe', 'ignore', 'pipe'],
        windowsHide: false,
        shell: true,
      });
      // Smart App Control kills the process outright; detect it via exit.
      const blocked = await new Promise((resolve) => {
        const t = setTimeout(() => resolve(false), 1200);
        child.on('exit', (code) => {
          clearTimeout(t);
          resolve(code !== null && code !== 0);
        });
        child.on('error', () => {
          clearTimeout(t);
          resolve(true);
        });
      });
      if (blocked) {
        try { child.kill(); } catch {}
        return false;
      }
      this.#process = child;
      this.#backend = 'go';
      return true;
    };

    const tryPowerShell = async () => {
      try {
        await fs.access(psScript);
      } catch {
        return false;
      }
      this.#process = spawn(POWERSHELL, [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', psScript,
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: false,
      });
      this.#backend = 'powershell';
      return true;
    };

    let started = false;
    if (prefer === 'go' || prefer === 'auto') started = await tryGo();
    if (!started && prefer !== 'go') started = await tryPowerShell();
    if (!started && prefer === 'go') started = await tryPowerShell();

    if (!started) {
      this.#started = false;
      throw new Error(
        'no usable status bar backend found (expected status-bar.exe or status-bar-native.ps1 under native/StatusBar)'
      );
    }

    this.#process.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      this.#stderr.push(text);
      if (this.#stderr.length > 40) this.#stderr.shift();
      if (text.includes('error') || text.includes('failed')) onError?.(text.trim());
    });
    this.#process.stdout?.on('data', () => {});
    this.#process.on('error', (err) => {
      this.#started = false;
      onError?.(err.message);
    });
    this.#process.on('exit', (code) => {
      this.#started = false;
      if (code !== 0) onError?.(`status bar exited with code ${code}`);
    });

    // Give the window time to compile the helper and create the overlay.
    await new Promise(r => setTimeout(r, 900));
  }

  /** Which backend actually got used: 'go' or 'powershell'. */
  get backend() {
    return this.#backend;
  }

  /**
   * Push a status event to the overlay via stdin.
   * @param {{ phase: string, verb: string, target?: string, app?: string,
   *           actionExecuted?: boolean, goalVerified?: boolean }} event
   */
  push(event) {
    if (!this.#started || !this.#process?.stdin) return;
    const mapped = {
      session: this.#session,
      seq: ++this.#seq,
      at: Date.now(),
      phase: PHASE_MAP[event.phase] || event.phase || 'unknown',
      verb: (event.verb || '').slice(0, 32),
      target: typeof event.target === 'string' ? event.target.slice(0, 80) : undefined,
      app: event.app,
      actionExecuted: event.actionExecuted === true,
      goalVerified: event.goalVerified === true,
      expiresAt: Date.now() + 15000,
    };
    try {
      this.#process.stdin.write(JSON.stringify(mapped) + '\n');
    } catch {
      // pipe may have closed; ignore
    }
  }

  /** Last stderr output from the overlay (diagnostics). */
  get diagnostics() {
    return this.#stderr.join('');
  }

  /**
   * Stop the overlay and destroy the window.
   */
  async stop() {
    if (!this.#started && !this.#process) return;
    this.#started = false;
    try {
      this.#process?.stdin?.write(JSON.stringify({ phase: 'stop', verb: 'stop' }) + '\n');
      this.#process?.stdin?.end();
    } catch {}
    setTimeout(() => {
      try {
        if (this.#process && !this.#process.killed) {
          this.#process.kill();
        }
      } catch {}
      this.#process = null;
    }, 500);
    await new Promise(r => setTimeout(r, 600));
  }
}

export default StatusBarHost;
