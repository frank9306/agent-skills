import { EventEmitter } from 'node:events';

export const PHASES = Object.freeze(['armed', 'observe', 'act', 'validate', 'verified', 'blocked', 'unknown']);

const FIELDS = Object.freeze([
  'session', 'runId', 'seq', 'at', 'phase', 'verb', 'target',
  'app', 'actionExecuted', 'goalVerified', 'expiresAt'
]);

export function normalize(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'event must be an object' };
  const value = {};
  for (const key of FIELDS) if (raw[key] !== undefined) value[key] = raw[key];
  if (typeof value.session !== 'string' || !value.session) return { error: 'session required' };
  if (!Number.isInteger(value.seq) || value.seq < 0) return { error: 'seq must be a non-negative integer' };
  if (typeof value.at !== 'number' || !Number.isFinite(value.at)) return { error: 'at must be a timestamp' };
  if (!PHASES.includes(value.phase)) return { error: 'unknown phase' };
  if (typeof value.verb !== 'string' || !value.verb || value.verb.length > 32) return { error: 'verb must be a bounded string' };
  if (typeof value.target === 'string') value.target = value.target.slice(0, 80);
  value.actionExecuted = value.actionExecuted === true;
  value.goalVerified = value.goalVerified === true;
  return { value };
}

export class StatusBarState extends EventEmitter {
  #current = null;
  #lastSeq = -1;
  #heartbeat = null;
  #hide = null;
  #heartbeatMs;
  #hideMs;
  #stopped = false;

  constructor({ heartbeatMs = 2000, hideMs = 3000 } = {}) {
    super();
    if (!Number.isFinite(heartbeatMs) || heartbeatMs <= 0) throw new Error('heartbeatMs must be positive');
    if (!Number.isFinite(hideMs) || hideMs < heartbeatMs) throw new Error('hideMs must be >= heartbeatMs');
    this.#heartbeatMs = heartbeatMs;
    this.#hideMs = hideMs;
  }

  get current() { return this.#current; }
  get stopped() { return this.#stopped; }

  push(raw) {
    if (this.#stopped) return { accepted: false, reason: 'stopped' };
    const parsed = normalize(raw);
    if (parsed.error) return { accepted: false, reason: parsed.error };
    const event = parsed.value;
    if (event.seq <= this.#lastSeq) return { accepted: false, reason: 'stale sequence' };
    if (event.expiresAt && Date.now() >= event.expiresAt) return { accepted: false, reason: 'expired' };
    this.#lastSeq = event.seq;
    this.#current = event;
    this.emit('change', { ...event });
    this.#armHeartbeat();
    return { accepted: true };
  }

  #armHeartbeat() {
    this.#clearHide();
    clearTimeout(this.#heartbeat);
    this.#heartbeat = setTimeout(() => this.#onSilence(), this.#heartbeatMs);
    this.#heartbeat.unref?.();
  }

  #onSilence() {
    if (this.#stopped) return;
    this.#current = { ...(this.#current || {}), phase: 'unknown', actionExecuted: false, goalVerified: false };
    this.emit('change', { ...this.#current });
    this.#hide = setTimeout(() => this.stop(), Math.max(0, this.#hideMs - this.#heartbeatMs));
    this.#hide.unref?.();
  }

  #clearHide() {
    if (this.#hide) { clearTimeout(this.#hide); this.#hide = null; }
  }

  stop() {
    if (this.#stopped) return;
    this.#stopped = true;
    clearTimeout(this.#heartbeat);
    this.#clearHide();
    this.emit('hide');
  }
}
