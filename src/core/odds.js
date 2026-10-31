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
    const op = ODDS_STEP[label] ? label : label.charAt(0);
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
  return {
    name: name,
    p: (...a) => work(a, null),
    roll(...a) {
      const why = TRACE ? [name] : null,
        p = work(a, why);
      if (why) why.push(['=', p]);
      TRACE_WHY = why;
      const yes = chance(p);
      TRACE_WHY = null;
      return yes;
    }
  };
}
const byCase = (name, which, cases) => ({
  name: name,
  p: (...a) => cases[which(...a)].p(...a),
  roll: (...a) => cases[which(...a)].roll(...a)
});
