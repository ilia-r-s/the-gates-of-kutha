// Host-only protocol checks and a small declarative policy language. Nothing in
// this file is loaded into the shipped game or evaluates user-supplied JavaScript.
const TYPES = new Set(['number', 'string', 'boolean', 'boolean?']);
const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor']);
const COMPARE = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  contains: (a, b) => a.includes(b)
};
const plain = value =>
  value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function shape(value, keys, where) {
  if (!plain(value) || Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k)))
    throw Error(where + ': expected only ' + keys.join(', '));
}
const scalar = (value, type) =>
  type === 'number' ? Number.isFinite(value) : type === 'boolean?' ? value === null || typeof value === 'boolean' : typeof value === type;
const canonical = value =>
  JSON.stringify(value, (_, v) =>
    plain(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map(k => [k, v[k]])
        )
      : v
  );

function protocol(descriptions, bounds) {
  if (
    !Array.isArray(descriptions) ||
    !Array.isArray(bounds) ||
    bounds.length !== 2 ||
    !bounds.every(Number.isFinite) ||
    bounds[0] <= 0 ||
    bounds[1] >= 1 ||
    bounds[0] > bounds[1]
  )
    throw Error('A decision catalogue and finite, positive chance bounds are required');
  const limits = Object.freeze([...bounds]),
    contracts = new Map(),
    ids = new Set();
  for (const d of descriptions) {
    if (!d || typeof d.id !== 'string' || ids.has(d.id)) throw Error('Invalid or duplicate decision descriptor');
    ids.add(d.id);
    if (!d.experiment) continue;
    if (d.authority !== 'actor' || !['chance', 'choice'].includes(d.mode) || !plain(d.features))
      throw Error('Only audited actor definitions expose policy features');
    for (const [name, type] of Object.entries(d.features))
      if (FORBIDDEN.has(name) || !/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || !TYPES.has(type))
        throw Error('Invalid feature descriptor: ' + name);
    contracts.set(d.id, { mode: d.mode, features: Object.freeze({ ...d.features }) });
  }
  const features = id => {
    if (!contracts.has(id)) throw Error('Decision has no audited policy observation: ' + id);
    return contracts.get(id).features;
  };
  const response = (value, request) => {
    if (value === null) return null;
    const key = request.mode === 'choice' ? 'choice' : 'probability';
    shape(value, ['schema', 'decision', key], 'Policy response');
    if (value.schema !== 1 || value.decision !== request.decision) throw Error('Invalid response identity');
    if (
      key === 'choice'
        ? !request.choices.some(c => c.id === value.choice)
        : !Number.isFinite(value.probability) || value.probability < limits[0] || value.probability > limits[1]
    )
      throw Error('Invalid policy probability or offered choice');
    return value;
  };
  return {
    bounds: limits,
    features,
    mode: id => {
      features(id);
      return contracts.get(id).mode;
    },
    response,
    request(raw) {
      if (typeof raw !== 'string') throw Error('Policy input must be serialized JSON');
      const r = JSON.parse(raw);
      shape(
        r,
        [
          'schema',
          'mode',
          'decision',
          'subject',
          'action',
          'object',
          'observation',
          ...(r?.mode === 'choice' ? ['choices'] : ['outcomes', 'bounds'])
        ],
        'Policy input'
      );
      if (
        r.schema !== 1 ||
        typeof r.subject !== 'string' ||
        typeof r.action !== 'string' ||
        !(r.object === null || typeof r.object === 'string')
      )
        throw Error('Incompatible policy input contract');
      const fields = features(r.decision);
      if (r.mode !== contracts.get(r.decision).mode) throw Error('Wrong decision mode');
      if (r.mode === 'choice') {
        if (!Array.isArray(r.choices) || !r.choices.length) throw Error('A choice policy needs offered actions');
        const offered = new Set();
        for (const choice of r.choices) {
          shape(choice, ['id', 'label'], 'Offered choice');
          if (typeof choice.id !== 'string' || typeof choice.label !== 'string' || offered.has(choice.id))
            throw Error('Invalid or duplicate offered choice');
          offered.add(choice.id);
        }
      } else if (canonical(r.outcomes) !== '["apply","skip"]' || canonical(r.bounds) !== canonical(limits))
        throw Error('Incompatible chance bounds or outcomes');
      shape(r.observation, Object.keys(fields), 'Actor observation');
      for (const [name, type] of Object.entries(fields))
        if (!scalar(r.observation[name], type)) throw Error('Invalid observed primitive: ' + name);
      return r;
    }
  };
}

function compilePolicy(document, contract) {
  const doc = typeof document === 'string' ? JSON.parse(document) : document;
  shape(doc, ['schema', 'kind', 'rules'], 'Policy document');
  if (doc.schema !== 1 || doc.kind !== 'decision-tree' || !Array.isArray(doc.rules) || !doc.rules.length || doc.rules.length > 64)
    throw Error('Expected schema 1 decision-tree with 1–64 rules');
  let nodes = 0;
  const visit = depth => {
    if (depth > 12 || ++nodes > 512) throw Error('Policy exceeds depth 12 or 512 nodes');
  };
  function predicate(node, fields, depth) {
    visit(depth);
    if (!plain(node)) throw Error('Expected a declarative predicate');
    for (const op of ['all', 'any'])
      if (Object.hasOwn(node, op)) {
        shape(node, [op], 'Logical predicate');
        if (!Array.isArray(node[op]) || !node[op].length || node[op].length > 16) throw Error('Logical predicates require 1–16 children');
        const children = node[op].map(x => predicate(x, fields, depth + 1));
        return o => (op === 'all' ? children.every(f => f(o)) : children.some(f => f(o)));
      }
    if (Object.hasOwn(node, 'not')) {
      shape(node, ['not'], 'Negated predicate');
      const child = predicate(node.not, fields, depth + 1);
      return o => !child(o);
    }
    shape(node, ['field', 'op', 'value'], 'Feature predicate');
    if (!Object.hasOwn(fields, node.field) || FORBIDDEN.has(node.field))
      throw Error('Feature is not available to this decision: ' + node.field);
    const type = fields[node.field];
    if (
      !scalar(node.value, type) ||
      !Object.hasOwn(COMPARE, node.op) ||
      (node.op === 'contains' ? type !== 'string' : !['eq', 'ne'].includes(node.op) && type !== 'number')
    )
      throw Error('Invalid typed comparison');
    const { field, op, value } = node;
    return o => COMPARE[op](o[field], value);
  }
  function tree(node, fields, mode, depth) {
    visit(depth);
    const key = mode === 'choice' ? 'choice' : 'probability';
    if (plain(node) && Object.hasOwn(node, key)) {
      shape(node, [key], 'Policy leaf');
      const value = node[key];
      if (
        key === 'choice' ? typeof value !== 'string' : !Number.isFinite(value) || value < contract.bounds[0] || value > contract.bounds[1]
      )
        throw Error('Leaf is outside the declared choice/chance contract');
      return () => ({ [key]: value });
    }
    shape(node, ['if', 'then', 'else'], 'Decision tree');
    const condition = predicate(node.if, fields, depth + 1),
      yes = tree(node.then, fields, mode, depth + 1),
      no = tree(node.else, fields, mode, depth + 1);
    return o => (condition(o) ? yes : no)(o);
  }
  const rules = new Map();
  for (const rule of doc.rules) {
    shape(rule, ['decision', 'tree'], 'Decision rule');
    if (rules.has(rule.decision)) throw Error('Duplicate policy decision');
    rules.set(rule.decision, tree(rule.tree, contract.features(rule.decision), contract.mode(rule.decision), 0));
  }
  return raw => {
    const r = contract.request(raw),
      choose = rules.get(r.decision);
    return choose ? JSON.stringify(contract.response({ schema: 1, decision: r.decision, ...choose(r.observation) }, r)) : null;
  };
}

function controller({ mode, policy = null, contract, replay = [] }) {
  if (!['baseline', 'shadow', 'distilled', 'replay'].includes(mode)) throw Error('Unknown decision experiment mode');
  if (mode === 'distilled' && typeof policy !== 'function') throw Error('Distilled mode requires a validated declarative policy');
  const inputs = [],
    evaluation = [];
  let cursor = 0,
    pending = null;
  const choose =
    mode === 'baseline'
      ? null
      : raw => {
          const request = contract.request(raw);
          let proposal = null,
            accepted = null;
          if (mode === 'replay') {
            const saved = replay[cursor++];
            if (!saved || canonical(saved.request) !== canonical(request)) throw Error('Replay actor input diverged at request ' + cursor);
            accepted = contract.response(saved.accepted, request);
            proposal = saved.proposal == null ? null : contract.response(saved.proposal, request);
          } else {
            const result = policy ? policy(raw) : null;
            if (result != null) {
              if (typeof result !== 'string') throw Error('Host policy must return serialized JSON or null');
              proposal = contract.response(JSON.parse(result), request);
            }
            if (mode === 'distilled') accepted = proposal;
          }
          if (pending !== null) throw Error('A previous actor input has not been resolved');
          pending = inputs.length;
          inputs.push({ request, proposal, accepted });
          return accepted === null ? null : JSON.stringify(accepted);
        };
  return {
    inputs,
    evaluation,
    bridge: {
      ...(choose ? { policy: choose } : {}),
      record(raw) {
        if (typeof raw !== 'string') throw Error('Evaluation record must be serialized separately');
        const record = JSON.parse(raw);
        if (record.schema !== 1 || record.sequence !== evaluation.length) throw Error('Evaluation sequence diverged');
        if (pending !== null) {
          const r = inputs[pending].request;
          if (r.decision !== record.decision || r.subject !== record.subject || r.object !== record.object || r.mode !== record.mode)
            throw Error('Actor input and subsequent evaluation record disagree');
          if (canonical(record.accepted) !== canonical(inputs[pending].accepted))
            throw Error('Accepted proposal changed inside the resolver');
        } else if (record.accepted != null) throw Error('A proposal was accepted without an actor input');
        evaluation.push({ ...record, inputIndex: pending });
        pending = null;
      }
    },
    finish() {
      if (pending !== null || (mode === 'replay' && cursor !== replay.length)) throw Error('Replay or decision record ended prematurely');
      return { inputs, evaluation };
    }
  };
}

module.exports = { protocol, compilePolicy, controller, canonical };
