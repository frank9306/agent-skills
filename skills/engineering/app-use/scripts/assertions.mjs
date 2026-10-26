export function resolveTarget(observation, match, {allowSensitive=false,allowMissing=false}={}) {
  if (!observation?.complete) throw new Error('observation incomplete');
  if (!match || typeof match !== 'object' || !Object.keys(match).length) throw new Error('target match required');
  const allowed = ['id', 'role', 'name', 'value', 'automationId', 'context', 'selector'];
  if (Object.keys(match).some(k => !allowed.includes(k))) throw new Error('unsupported target match');
  const nodes = observation.nodes.filter(n => Object.entries(match).every(([k,v]) => n[k] === v));
  if (!nodes.length && allowMissing) return null;
  if (nodes.length !== 1) throw new Error(`target must be unique: ${nodes.length} matches`);
  if (nodes[0].sensitive&&!allowSensitive) throw new Error('sensitive target cannot be read or persisted');
  return nodes[0];
}

export function validateObservation(observation, assertion, options={}) {
  if (assertion?.type === 'not-applicable') {
    if (!assertion.reason?.trim()) throw new Error('N/A needs a reason');
    return { status: 'unverified', reason: assertion.reason };
  }
  const node = resolveTarget(observation, assertion?.target, options);
  if (!node) return {status:'fail',reason:'target not present yet'};
  if (!['name','value','enabled','visible','focused','selected','role'].includes(assertion.property)) throw new Error('unsupported assertion property');
  if (!Object.hasOwn(assertion, 'equals') || assertion.equals === null || assertion.equals === undefined) throw new Error('literal assertion equals required');
  if (!Object.hasOwn(node, assertion.property) || node[assertion.property] === null) throw new Error('property unavailable');
  const actual = node[assertion.property];
  return { status: actual === assertion.equals ? 'pass' : 'fail', actual, expected: assertion.equals, observation: observation.id, target: node.id };
}
