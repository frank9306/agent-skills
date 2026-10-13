#!/usr/bin/env node
// Project-owned CLI and Codex Hook adapter. No Python runtime is required.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LIMIT = 3500;
const ignored = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', '.cache', '.next', 'coverage', 'dist', 'build', 'vendor', '.pytest_cache', '.mypy_cache', '.ruff_cache']);
const events = new Set(['SessionStart', 'UserPromptSubmit', 'PostToolUse', 'Stop']);
const compact = value => String(value).length > LIMIT ? String(value).slice(0, LIMIT) + '\n[output truncated]' : String(value);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function git(cwd, ...args) {
  const result = spawnSync('git', ['-C', cwd, ...args], { timeout: 15000, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('Git root/input discovery failed: ' + compact(result.error ?? result.stderr));
  return result.stdout.toString('utf8');
}

function snapshot(root) {
  const inputs = new Set(git(root, 'ls-files', '-c', '-o', '--exclude-standard', '-z').split('\0').filter(Boolean));
  for (const name of ['.architecture.json', '.codex/checks.json', 'scripts/check-architecture.mjs', 'scripts/codex-checks.mjs']) inputs.add(name);
  const self = path.relative(root, fileURLToPath(import.meta.url)).replaceAll('\\', '/');
  if (!self.startsWith('../') && !path.isAbsolute(self)) inputs.add(self);
  const digest = crypto.createHash('sha256');
  for (const relative of [...inputs].sort()) {
    if (relative.split('/').some(part => ignored.has(part))) continue;
    const target = path.join(root, relative);
    digest.update(relative + '\0');
    let stat;
    try { stat = fs.lstatSync(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!stat) digest.update('deleted\0');
    else if (stat.isSymbolicLink()) digest.update('symlink\0' + hash(fs.readlinkSync(target)));
    else if (stat.isFile()) digest.update('file\0' + hash(fs.readFileSync(target)));
    else throw new Error('Cannot snapshot non-file Git input: ' + relative);
  }
  return digest.digest('hex');
}

function configuration(root) {
  const value = JSON.parse(fs.readFileSync(path.join(root, '.codex/checks.json'), 'utf8'));
  if (!value || Array.isArray(value) || value.schemaVersion !== 1 || Object.keys(value).some(key => !['schemaVersion', 'quick', 'full', 'timeoutSeconds'].includes(key))) throw new Error('Invalid .codex/checks.json fields or schemaVersion');
  for (const name of ['quick', 'full']) {
    if (!Array.isArray(value[name]) || !value[name].length || value[name].some(part => typeof part !== 'string' || !part || part.includes('\0'))) throw new Error(name + ' must be a nonempty executable/argument array');
  }
  value.timeoutSeconds ??= 300;
  if (typeof value.timeoutSeconds !== 'number' || !Number.isFinite(value.timeoutSeconds) || value.timeoutSeconds <= 0 || value.timeoutSeconds > 2147483) throw new Error('timeoutSeconds must be a finite positive supported number');
  return value;
}

function command(argv, root) {
  let [executable, ...args] = argv;
  if (['node', 'node.exe'].includes(executable.toLowerCase())) executable = process.execPath;
  const hasDirectory = executable.includes('/') || executable.includes('\\');
  const bases = hasDirectory ? [path.resolve(root, executable)] : (process.env.PATH ?? '').split(path.delimiter).filter(Boolean).map(dir => path.resolve(dir, executable));
  const extensions = process.platform === 'win32' && !path.extname(executable) ? ['', ...(process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';')] : [''];
  let resolved;
  for (const base of bases) {
    for (const extension of extensions) {
      const candidate = base + extension;
      try {
        if (!fs.statSync(candidate).isFile()) continue;
        fs.accessSync(candidate, process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK);
        resolved = candidate;
        break;
      } catch { /* Try the next executable candidate. */ }
    }
    if (resolved) break;
  }
  if (!resolved) throw new Error('Missing check tool: ' + argv[0]);
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(resolved)) {
    if ([resolved, ...args].some(part => /[\r\n"%!^&|<>]/.test(part))) throw new Error('Unsafe character in Windows batch argv; invoke the actual executable/script instead.');
    const shell = process.env.ComSpec || path.join(process.env.SystemRoot || 'C:\\Windows', 'System32/cmd.exe');
    return { executable: shell, args: ['/d', '/s', '/c', '"' + [resolved, ...args].map(part => '"' + part + '"').join(' ') + '"'], verbatim: true };
  }
  return { executable: resolved, args, verbatim: false };
}

function health(root) {
  const config = configuration(root);
  for (const mode of ['quick', 'full']) command(config[mode], root);
  return config;
}

async function execute(argv, root, timeout) {
  const resolved = command(argv, root);
  return await new Promise(resolve => {
    const child = spawn(resolved.executable, resolved.args, { cwd: root, windowsHide: true, windowsVerbatimArguments: resolved.verbatim, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', expired = false;
    const append = data => { if (output.length < LIMIT) output += data.toString('utf8').slice(0, LIMIT - output.length); };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    const timer = setTimeout(() => {
      expired = true;
      if (process.platform === 'win32') {
        const result = spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { timeout: 10000, windowsHide: true });
        if (result.error || result.status !== 0) child.kill();
      } else {
        try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
      }
    }, timeout * 1000);
    child.on('error', error => { clearTimeout(timer); resolve({ ok: false, detail: compact(error) }); });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ ok: !expired && code === 0, detail: compact((expired ? 'Check timeout after ' + timeout + ' seconds.' : 'exit ' + code) + '\n' + output) });
    });
  });
}

async function check(root, mode) {
  try {
    const config = health(root), before = snapshot(root), details = [];
    let ok = true;
    for (const current of mode === 'full' ? ['quick', 'full'] : ['quick']) {
      const report = await execute(config[current], root, config.timeoutSeconds);
      details.push(current + ': ' + report.detail);
      if (!report.ok) { ok = false; break; }
    }
    if (before !== snapshot(root)) { ok = false; details.push('Worktree inputs changed during checks; run verification again against stable final inputs.'); }
    return { ok, mode, detail: compact(details.join('\n')) };
  } catch (error) { return { ok: false, mode, detail: compact(error) }; }
}

function loadState(file) {
  if (!fs.existsSync(file)) return null;
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!state || state.schemaVersion !== 1 || typeof state.chain !== 'string' || !state.chain || typeof state.dirty !== 'boolean' || !Number.isInteger(state.attempts) || state.attempts < 0 || state.attempts > 2 || ['baseline', 'seen'].some(key => typeof state[key] !== 'string' || !/^[a-f0-9]{64}$/.test(state[key]))) throw new Error('Invalid session check state; inspect it before recovery.');
  return state;
}

function saveState(file, state) {
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  try { fs.writeFileSync(temporary, JSON.stringify(state) + '\n', { encoding: 'utf8', flag: 'wx', mode: 0o600 }); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

async function native(root, directory, event) {
  const name = event.hook_event_name;
  if (typeof event.session_id !== 'string' || !event.session_id) throw new Error('Native Hook input requires session_id');
  const file = path.join(directory, hash(event.session_id) + '.json'), current = snapshot(root);
  let state = loadState(file);
  const continuation = Boolean(event.stop_hook_active) || (state && typeof event.prompt === 'string' && event.prompt.startsWith('[codex-checks:' + state.chain + ']'));
  const preserve = state && ['compact', 'resume'].includes(event.source);
  if ((name === 'SessionStart' && !preserve) || (name === 'UserPromptSubmit' && !continuation)) {
    state = { schemaVersion: 1, baseline: current, seen: current, dirty: false, attempts: 0, chain: crypto.randomUUID(), failure: null };
    saveState(file, state);
  }
  if (!state) return { systemMessage: 'FAILED: Missing session baseline; start a genuine user prompt before claiming native verification.' };
  if (name === 'SessionStart' || name === 'UserPromptSubmit') {
    try { health(root); return {}; } catch (error) { return { systemMessage: 'FAILED: check setup is unavailable. ' + compact(error) }; }
  }
  const changed = current !== state.seen;
  if (changed) { state.dirty = true; state.seen = current; }
  if (name === 'PostToolUse') {
    if (!changed) return {};
    const report = await check(root, 'quick');
    state.seen = snapshot(root); state.failure = report.ok ? null : report.detail;
    saveState(file, state);
    return { hookSpecificOutput: { hookEventName: name, additionalContext: compact((report.ok ? 'PASSED' : 'FAILED') + ': quick structure check.\n' + report.detail) } };
  }
  if (name === 'Stop' && state.dirty) {
    const report = await check(root, 'full');
    state.seen = snapshot(root); state.failure = report.ok ? null : report.detail;
    if (report.ok) { saveState(file, state); return {}; }
    if (state.attempts < 2) {
      state.attempts++;
      saveState(file, state);
      return { decision: 'block', reason: compact('[codex-checks:' + state.chain + '] FAILED: full delivery check. Repair the implementation, then verify again; do not weaken rules, exclusions, exports, or baselines to pass.\n' + report.detail) };
    }
    saveState(file, state);
    return { systemMessage: compact('FAILED: unfinished after two automatic repair continuations. Report the failing command and remaining work honestly.\n' + report.detail) };
  }
  return {};
}

async function withLock(directory, action) {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'worktree.lock'), token = crypto.randomUUID(), deadline = Date.now() + 2000;
  let acquired = false;
  while (!acquired) {
    try { fs.writeFileSync(file, token, { flag: 'wx', mode: 0o600 }); acquired = true; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (Date.now() >= deadline) throw new Error('Worktree check lock is busy; inspect its owner before manual recovery. Existing locks are never deleted automatically.');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  try { return await action(); }
  finally { if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === token) fs.unlinkSync(file); }
}

let mode = null, event = null;
try {
  const args = process.argv.slice(2);
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--run' || !['quick', 'full'].includes(args[1])) throw new Error('Usage: codex-checks.mjs --run quick|full, or one native Hook JSON object on stdin');
    mode = args[1];
  } else {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    event = JSON.parse(input);
    if (!event || Array.isArray(event) || typeof event !== 'object') throw new Error('Expected a native Hook JSON object');
    if (!events.has(event.hook_event_name)) { console.log('{}'); process.exit(0); }
  }
  const root = path.resolve(git(event?.cwd || process.cwd(), 'rev-parse', '--show-toplevel').trim());
  const directory = path.resolve(root, git(root, 'rev-parse', '--git-path', 'codex-checks').trim());
  const result = await withLock(directory, () => mode ? check(root, mode) : native(root, directory, event));
  console.log(JSON.stringify(result));
  process.exitCode = mode && !result.ok ? 1 : 0;
} catch (error) {
  console.log(JSON.stringify(mode ? { ok: false, mode, detail: compact(error) } : { systemMessage: 'FAILED: ' + compact(error) }));
  process.exitCode = mode || !event ? 1 : 0;
}
