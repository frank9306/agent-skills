import { createInterface } from 'node:readline';
import { setTimeout as pause } from 'node:timers/promises';
import { createJevDecision, createJevGoalDecision } from './jev.mjs';
import { runDesktopGoal } from './desktop-goal.mjs';

const outcomes = new Set(['pass', 'fail', 'unverified', 'stopped']);

export async function runDesktopTask({ connect, capsule, target, input, emit, signal, onError, decideGoal = createJevGoalDecision() }) {
  const lines = createInterface({ input, terminal: false, crlfDelay: Infinity });
  const operations = lines[Symbol.asyncIterator]();
  const interrupt = () => lines.close();
  signal?.addEventListener('abort', interrupt, { once: true });
  let client, session, identity, frame;
  let status = 'stopped';
  const startedAt = performance.now();
  const decideWithJev = createJevDecision();

  const request = (method, params) => {
    signal?.throwIfAborted();
    return client.request(method, { session, ...params }, { signal });
  };
  const focus = async () => {
    capsule.push({ action: 'focus' });
    const result = await request('act', { action: { type: 'focus' } });
    if (result.diagnostics?.foreground?.verified !== true) throw new Error('desktop focus unverified');
  };
  const publish = ({ image, ...snapshot }, started) => {
    if (!snapshot.id || image?.mime !== 'image/png' || !image.data) throw new Error('desktop capture returned no PNG');
    frame = { id: snapshot.id, data: image.data, width: image.width, height: image.height, shownAt: performance.now() };
    emit({ kind: 'capture', ...snapshot, image, elapsedMs: frame.shownAt - started });
  };
  const capture = async operation => {
    frame = undefined;
    const started = performance.now();
    capsule.push({ action: 'capture' });
    let snapshot;
    try {
      snapshot = await request('visual-observe');
    } catch (error) {
      if (error.message !== 'foreground window required for capture' || operation.refocus === false) throw error;
      await focus();
      capsule.push({ action: 'capture' });
      snapshot = await request('visual-observe');
    }
    publish(snapshot, started);
  };
  const actionFor = input => {
    const action = input ? { ...input } : undefined;
    if (!action?.secretEnv) return action;
    if (action.text !== undefined) throw new Error('provide secretEnv for sensitive input');
    action.text = process.env[action.secretEnv];
    if (action.text === undefined) throw new Error('secret environment variable unavailable');
    action.sensitive = true;
    delete action.secretEnv;
    return action;
  };
  const click = async (operation, batch = false, decision) => {
    if (!frame || operation.observation !== frame.id) throw new Error('action requires the latest screenshot');
    const reviewed = frame;
    frame = undefined;
    const started = performance.now();
    if (batch && (!Array.isArray(operation.steps) || operation.steps.length < 2 || operation.steps.length > 5))
      throw new Error('desktop batch requires 2–5 steps');
    const payload = batch
      ? { steps: operation.steps.map(step => ({ target: step.target, action: actionFor(step.action) })) }
      : { target: operation.target, action: actionFor(operation.action), guardRegion: operation.guardRegion };
    const dispatch = observation => request(batch ? 'visual-batch' : 'visual-click', { observation, ...payload });
    const phase = batch || payload.action ? 'fill' : 'click';
    capsule.push({ action: phase });
    let result;
    try {
      result = await dispatch(reviewed.id);
    } catch (error) {
      if (error.message !== 'foreground window required for capture') throw error;
      // This broker error occurs before pointer input. Rebind only identical pixels.
      await focus();
      const fresh = await request('visual-observe');
      if (fresh.image?.data !== reviewed.data) throw new Error('desktop pixels changed after refocus; capture again');
      capsule.push({ action: phase });
      result = await dispatch(fresh.id);
    }
    emit({ kind: 'action', ...result, ...decision, decisionMs: started - reviewed.shownAt, elapsedMs: performance.now() - started });
  };
  const jevClick = async ({ observation, question, candidates }) => {
    if (!frame || observation !== frame.id) throw new Error('Jev requires the latest screenshot');
    const validRegion = target => target && [target.x, target.y, target.width, target.height].every(Number.isInteger) &&
      target.x >= 0 && target.y >= 0 && target.width > 0 && target.height > 0 &&
      target.x + target.width <= frame.width && target.y + target.height <= frame.height &&
      typeof target.description === 'string' && target.description.trim() && target.description.length <= 160;
    if (typeof question !== 'string' || !question.trim() || question.length > 400 ||
        !Array.isArray(candidates) || candidates.length < 2 || candidates.length > 5 || !candidates.every(validRegion))
      throw new Error('Jev requires a short question and 2–5 bounded click regions');
    if (frame.jevTried) {
      emit({ kind: 'jev-fallback', reason: 'already-tried', observation });
      return;
    }
    frame.jevTried = true;
    const started = performance.now();
    const decision = await decideWithJev({ frame, question, candidates, signal });
    signal?.throwIfAborted();
    const jevMs = performance.now() - started;
    if (decision.index === undefined) {
      emit({ kind: 'jev-fallback', ...decision, observation, jevMs });
      return;
    }
    const { x, y, width, height, description } = candidates[decision.index];
    await click({ observation, target: { x, y, width, height, description } }, false, {
      provider: 'jev', candidateIndex: decision.index, confidence: decision.confidence, jevMs,
    });
  };
  const waitForChange = async operation => {
    const timeout = operation.timeoutMs ?? 10000;
    if (!Number.isInteger(timeout) || timeout < 200 || timeout > 30000) throw new Error('wait-change timeout must be 200–30000 ms');
    const started = performance.now();
    capsule.push({ action: 'wait' });
    const observation = frame?.id ?? (await request('visual-baseline')).id;
    frame = undefined;
    while (performance.now() - started < timeout) {
      await pause(Math.min(300, Math.max(1, timeout - (performance.now() - started))), undefined, { signal });
      const next = await request('visual-change', { observation });
      if (next.changed !== false) return publish(next, started);
    }
    emit({ kind: 'waiting', changed: false, elapsedMs: performance.now() - started });
  };

  const bind = async window => {
    if (session) {
      await request('stop');
      session = undefined;
    }
    identity = await request('prepare', { hwnd: window.hwnd, pid: window.pid, kind: 'desktop' });
    session = identity.session;
    capsule.push({ action: 'target', hwnd: identity.hwnd, pid: identity.pid });
    await focus();
  };

  try {
    capsule.start({ task: 'Windows desktop', onError });
    capsule.push({ action: 'start' });
    client = await connect();
    await bind(target);
    emit({ kind: 'ready', identity });
    for await (const line of operations) {
      if (signal?.aborted) break;
      try {
        const operation = JSON.parse(line);
        switch (operation.op) {
          case 'goal': {
            frame = undefined;
            const result = await runDesktopGoal({ operation, request, bind, window: () => identity,
              operations, decide: decideGoal, capsule, emit, signal });
            status = result.status;
            emit({ kind: 'goal-result', ...result });
            return { status, elapsedMs: performance.now() - startedAt };
          }
          case 'capture':
            await capture(operation);
            break;
          case 'click':
            await click(operation);
            break;
          case 'jev-click':
            await jevClick(operation);
            break;
          case 'batch':
            await click(operation, true);
            break;
          case 'wait-change':
            await waitForChange(operation);
            break;
          case 'wait':
            capsule.push({ action: 'wait' });
            emit({ kind: 'waiting' });
            break;
          case 'resume-capture':
            if (operation.userConfirmed !== true) throw new Error('owner confirmation required');
            await request('act', { action: { type: 'resume-capture', userConfirmed: true } });
            emit({ kind: 'capture-resumed' });
            break;
          case 'finish':
            if (!outcomes.has(operation.outcome)) throw new Error('invalid desktop task outcome');
            status = operation.outcome;
            return { status, elapsedMs: performance.now() - startedAt };
          default:
            throw new Error('unknown desktop task operation');
        }
      } catch (error) {
        if (signal?.aborted) break;
        emit({ kind: 'operation-error', error: error.message });
      }
    }
    return { status };
  } catch (error) {
    status = signal?.aborted ? 'stopped' : 'error';
    return { status, error: error.message };
  } finally {
    lines.close();
    signal?.removeEventListener('abort', interrupt);
    try {
      if (session) await client.request('stop', { session }, { timeoutMs: 1000 });
    } finally {
      client?.close?.();
      frame = undefined;
      capsule.push({ action: status });
      await capsule.stop();
    }
  }
}
