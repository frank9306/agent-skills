import { setTimeout as delay } from 'node:timers/promises';

function contains(outer, inner) {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

function rectangle(value) {
  return value && [value.x, value.y, value.width, value.height].every(Number.isSafeInteger) &&
    value.x >= 0 && value.y >= 0 && value.width > 0 && value.height > 0 &&
    typeof value.description === 'string' && value.description.trim() && value.description.length <= 160;
}

function validateGoal({ goal, stages }) {
  if (typeof goal !== 'string' || !goal.trim() || goal.length > 600 ||
      !Array.isArray(stages) || !stages.length || stages.length > 24 || stages.at(-1)?.verify !== true)
    throw Error('a desktop goal requires bounded stages and a final visual verification');
  for (const stage of stages) {
    if (!stage || typeof stage.name !== 'string' || !stage.name.trim() || stage.name.length > 80 ||
        typeof stage.instruction !== 'string' || !stage.instruction.trim() || stage.instruction.length > 600 ||
        !rectangle(stage.region) || (stage.guardRegion && !rectangle(stage.guardRegion)) ||
        (stage.candidates && (stage.verify || !Array.isArray(stage.candidates) || !stage.candidates.length ||
          stage.candidates.length > 5 || !stage.candidates.every(candidate => rectangle(candidate) && contains(stage.region, candidate))))) {
      throw Error('invalid desktop goal stage');
    }
  }
}

export async function runDesktopGoal({ operation, request, bind, window, operations, decide, capsule, emit, signal }) {
  const automatic = operation.stages === undefined;
  const { goal, completion, region, size, guardRegion } = operation;
  if (automatic && (typeof completion !== 'string' || !completion.trim() || completion.length > 600))
    throw Error('an automatic desktop goal requires a visible completion condition');
  const route = automatic ? Array.from({ length: 24 }, (_, index) => ({
    name: `Decision ${index + 1}`, instruction: goal, completion, region, size, guardRegion, verify: index === 23,
  })) : operation.stages;
  validateGoal({ goal, stages: route });
  const started = performance.now();
  const stages = [];
  let unavailableStatus, previousCrop;
  const finish = status => ({ status, stages, elapsedMs: performance.now() - started });

  async function selectWindow(title) {
    if (!title || window().title === title) return;
    const pid = window().pid;
    const until = performance.now() + 2500;
    do {
      const visible = await request('desktop-windows');
      const matches = visible.filter(item => item.pid === pid && item.title === title);
      if (matches.length > 1) throw Error('ambiguous same-process window');
      if (matches.length === 1) {
        await bind(matches[0]);
        return;
      }
      await delay(75, undefined, { signal });
    } while (performance.now() < until);
    throw Error('same-process window did not appear');
  }

  for (const stage of route) {
    const began = performance.now();
    const timing = { name: stage.name, windowMs: 0, captureMs: 0, jevMs: 0, dispatchMs: 0, fallbackMs: 0, jevCalls: 0 };
    const measure = async (key, run) => {
      const t = performance.now();
      try { return await run(); } finally { timing[key] += performance.now() - t; }
    };
    let snapshot, reason, providerStatus = unavailableStatus, verified = false, completed = false;
    const observe = () => measure('captureMs', () => request('visual-observe'));
    const dispatch = async target => {
      const image = snapshot?.image;
      if (!image || !rectangle(target) || !contains({ x: 0, y: 0, ...image }, target))
        throw Error('click target is outside the current screen');
      capsule.push({ action: 'click' });
      const clicked = await measure('dispatchMs', () => request('visual-click', {
        observation: snapshot.id, target, guardRegion: stage.guardRegion,
      }));
      if (!clicked.actionExecuted) throw Error('click was not dispatched');
    };
    try {
      await measure('windowMs', () => selectWindow(stage.windowTitle));
      for (let attempt = 0; attempt < 2; attempt++) {
        if (unavailableStatus) {
          reason = 'provider-unavailable-for-task';
          break;
        }
        capsule.push({ action: 'capture' });
        snapshot = await observe();
        const { image } = snapshot;
        if (stage.size && (stage.size.width !== image.width || stage.size.height !== image.height))
          throw Error('screen dimensions changed; crop withheld');
        if (!contains({ x: 0, y: 0, ...image }, stage.region)) throw Error('permitted crop is outside the screen');
        const crop = await measure('captureMs', () => request('visual-crop', { observation: snapshot.id, target: stage.region }));
        if (automatic && attempt === 0 && crop.image.data === previousCrop) {
          reason = 'screen-unchanged';
          break;
        }
        capsule.push({ action: 'judge' });
        timing.jevCalls++;
        const decision = await measure('jevMs', () => decide({ frame: crop.image, stage, signal }));
        signal?.throwIfAborted();
        if (decision.verified === true && (stage.verify || automatic)) {
          verified = true;
          completed = true;
          break;
        }
        if (!stage.verify && decision.target && contains(stage.region, decision.target)) {
          try {
            await dispatch(decision.target);
            if (automatic) previousCrop = crop.image.data;
            verified = true;
            break;
          } catch (error) {
            if (attempt !== 0 || !/^screenshot changed/.test(error.message)) throw error;
            continue;
          }
        }
        reason = decision.reason ?? 'invalid-decision';
        providerStatus = decision.status;
        if (providerStatus === 451) unavailableStatus = providerStatus;
        break;
      }
    } catch (error) {
      signal?.throwIfAborted();
      reason = error.message;
    }

    if (!verified) {
      capsule.push({ action: 'wait' });
      const outcome = await measure('fallbackMs', async () => {
        for (let refresh = 0; refresh < 4; refresh++) {
          // Dispatch attempts consume the old token, so handoff gets a new observation.
          try { snapshot = await observe(); } catch { snapshot = undefined; }
          emit({ kind: 'fallback', goal: operation.goal, stage: stage.name, instruction: stage.instruction,
            reason, providerStatus, window: window(), observation: snapshot?.id, image: snapshot?.image });
          const next = await operations.next();
          const reply = next.done ? undefined : JSON.parse(next.value);
          signal?.throwIfAborted();
          if (reply?.op === 'refresh-goal') continue;
          if (reply?.op === 'cancel-goal' || !reply) return 'stopped';
          if (reply.op !== 'resume-goal' || reply.observation !== snapshot?.id || !snapshot ||
              (stage.windowTitle && window().title !== stage.windowTitle)) return 'unverified';
          if ((stage.verify || automatic) && reply.verified === true) {
            completed = true;
            return 'pass';
          }
          if (stage.verify) return 'unverified';
          if (!reply.target) return 'unverified';
          try {
            await dispatch(reply.target);
            return 'pass';
          } catch (error) {
            if (!/^screenshot changed/.test(error.message)) throw error;
            reason = error.message;
          }
        }
        return 'unverified';
      });
      if (outcome !== 'pass') {
        stages.push({ ...timing, provider: 'fallback', elapsedMs: performance.now() - began });
        return finish(outcome);
      }
      timing.provider = 'llm';
    } else timing.provider = 'jev';
    if (!stage.verify && !completed) await delay(200, undefined, { signal });
    stages.push({ ...timing, elapsedMs: performance.now() - began });
    if (automatic && completed) return finish('pass');
  }
  return finish('pass');
}
