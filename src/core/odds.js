// Named probability steps, evaluated in order and optionally traced.
const ODDS_STEP = {
  base: (p, v) => v,
  '+': (p, v) => p + v,
  '-': (p, v) => p - v,
  '*': (p, v) => p * v,
  floor: (p, v) => Math.max(v, p),
  cap: (p, v) => Math.min(v, p),
  clamp: (p, v) => Math.max(v[0], Math.min(v[1], p))
};
function odds(name, steps) {
  const plan = steps.map(([label, f]) => {
    const token = label.split(/\s/, 1)[0],
      op = ODDS_STEP[token] ? token : label.charAt(0);
    if (!ODDS_STEP[op] || typeof f !== 'function') throw new Error(`odds "${name}": a step it cannot take: ${label}`);
    return [op, label, f];
  });
  const work = (a, why) => {
    let p = 0;
    for (const [op, label, f] of plan) {
      const v = f(...a);
      p = ODDS_STEP[op](p, v);
      if (why) why.push([label, v]);
    }
    return p;
  };
  const roll = (a, decision = null) => {
    const why = TRACE || (decision && Decisions.recording) ? [name] : null,
      p = work(a, why);
    if (why) why.push(['=', p]);
    TRACE_WHY = why;
    if (decision) {
      try {
        return Decisions.draw(decision, p, a, why);
      } finally {
        TRACE_WHY = null;
      }
    }
    const yes = chance(p);
    TRACE_WHY = null;
    return yes;
  };
  return {
    name: name,
    steps: plan.map(([, label]) => label),
    p: (...a) => work(a, null),
    roll: (...a) => roll(a),
    rollFor: (decision, ...a) => roll(a, decision)
  };
}
const byCase = (name, which, cases) => ({
  name: name,
  p: (...a) => cases[which(...a)].p(...a),
  roll: (...a) => cases[which(...a)].roll(...a),
  rollFor: (decision, ...a) => cases[which(...a)].rollFor(decision, ...a)
});
// A strategic preference can multiply an ordinary weight only within this budget.
// Normalization therefore cannot move any target's probability by more than 1 + budget.
const boundedAim = (pool, ordinary, useful, budget) =>
  Object.fromEntries(pool.map(k => [typeof k === 'string' ? k : k.id, ordinary(k) * (1 + budget * (useful(k) ? 1 : 0))]));
