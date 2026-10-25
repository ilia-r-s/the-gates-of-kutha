// ===================== ODDS: every chance written as named steps =====================
// A chance the rules take is written as odds: a list of steps from a base, each a named factor and what it does to the
// odds so far. "+" adds it, "-" takes it away, "*" multiplies by it, floor and cap hold the odds to at least or at most
// it, clamp between two. The steps run in their order, as the arithmetic they stand for would, so that odds written so
// give the very numbers the expressions they replace gave. Each step is a function of the decision's arguments that reads
// RULES as it runs (a test may change any number) and throws no die.
//   const TAKES_CONFIDENCE = odds('takes your confidence', [
//     ['base', () => RULES.confide.odds], ['+ trust in you', c => RULES.confide.trust * c.rapport], …,
//     ['clamp', () => [RULES.confide.min, RULES.confide.max]]]);
//   TAKES_CONFIDENCE.p(c)       the odds
//   TAKES_CONFIDENCE.roll(c)    one die on them (none on odds of nothing: core/random.js, chance)
// While the dice trace is on, a die rolled on odds carries their name and every step's share (core/random.js,
// TRACE_WHY), so that any chance taken can be read back to its parts. byCase picks the odds by what a decision is
// about: a part, a pretence, a kind of moment.
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
    name,
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
// odds by the case a decision falls in: which(...args) names the case, and cases[case] holds its odds
const byCase = (name, which, cases) => ({
  name,
  p: (...a) => cases[which(...a)].p(...a),
  roll: (...a) => cases[which(...a)].roll(...a)
});
