// The odds framework (core/odds.js): odds written as named steps give exactly what the arithmetic would, roll one die,
// and tell the dice trace each step's share; and the decisions written as odds give the odds their old expressions gave.
const assert = require('assert');

module.exports = {
  'the steps run in their order, as the arithmetic would'(k) {
    const [a, b] = k.value(`(() => {
      const o = odds('t', [['base', x => x], ['+ a', () => 0.1], ['- b', () => 0.3], ['* c', () => 2],
        ['floor', () => 0.05], ['cap', () => 0.9], ['clamp', () => [0.2, 0.8]]]);
      return [o.p(0.4), Math.max(0.2, Math.min(0.8, Math.min(0.9, Math.max(0.05, (0.4 + 0.1 - 0.3) * 2))))];
    })()`);
    assert.strictEqual(a, b);
  },
  'a step it cannot take is refused when the odds are written'(k) {
    assert.throws(() => k.run(`odds('t', [['base', () => 1], ['/ half', () => 2]])`), /cannot take/);
  },
  'a roll throws one die and tells the trace its steps'(k) {
    const r = k.value(`(() => {
      reseed(5); TRACE = [];
      const o = odds('t', [['base', () => 0.3], ['+ x', () => 0.2]]), yes = o.roll(), d = TRACE;
      TRACE = null;
      return { n: d.length, asked: d[0][1], why: JSON.stringify(d[0].why), yes, left: TRACE_WHY };
    })()`);
    assert.strictEqual(r.n, 1);
    assert.strictEqual(r.asked, 0.5);
    assert.strictEqual(r.why, JSON.stringify(['t', ['base', 0.3], ['+ x', 0.2], ['=', 0.5]]));
    assert.strictEqual(r.left, null);
  },
  'odds of nothing throw no die, and leave nothing behind'(k) {
    const r = k.value(`(() => {
      TRACE = [];
      const yes = odds('t', [['base', () => 0]]).roll(), d = TRACE.length, w = TRACE_WHY;
      TRACE = null;
      return [yes, d, w];
    })()`);
    assert.deepStrictEqual(r, [false, 0, null]);
  },
  'takes your confidence: the odds its old expression gave, for anyone, any trust, any number of confidences'(k) {
    const bad = k.value(`(() => {
      const bad = [];
      for (const bg of ['philologist', 'soldier', 'occultist']) {
        newGame('Marlowe', bg, false, 7);
        for (const c of S.order.map(C))
          for (let r = -2; r <= 3; r++)
            for (let n = 0; n < 4; n++) {
              c.rapport = r;
              S.confided[c.id] = n;
              const old = clamp(RULES.confide.odds + RULES.confide.trust * c.rapport + TP(c).confide + cultOf(c, 'listen') -
                RULES.confide.again * n, RULES.confide.min, RULES.confide.max);
              if (old !== TAKES_CONFIDENCE.p(c)) bad.push([bg, c.id, r, n, old, TAKES_CONFIDENCE.p(c)]);
            }
      }
      return bad;
    })()`);
    assert.deepStrictEqual(bad, []);
  },
  'drops a pretence: the odds the old function gave, in every case it knew'(k) {
    // (the old function, as it was before 28.0.0)
    k.run(`globalThis.__oldConfess = function (c, takenToday) {
      const k = pretence(c);
      if (!k) return 0;
      const tp = TP(c), about = f => S.testimony.filter(t => t.about === c.id && f(t)).length, K = RULES.confess;
      const held = c.role === 'cult' && claimOf(c).stood ? Math.min(1, tp.counter) : 1;
      if (k === 'staged') return K.staged;
      if (k === 'thief') return Math.min(K.cap, tp.confess * K.thief + (c.rapport >= 2 ? K.trusting : 0));
      if (k.indexOf('hid') === 0)
        return Math.min(K.cap, tp.confess * K.hidden + (takenToday ? K.afterDeath : 0) + (c.rapport >= 2 ? K.trusting : 0));
      return held * Math.min(K.cap, tp.confess + (rivalClaim(c) ? K.rival : 0) +
        (about(t => t.kind === 'vision' && t.verdict === 'cult') ? K.dreamt : 0) + (about(t => t.kind === 'failwatch') ? K.caught : 0) +
        (about(t => t.kind === 'distrust') >= 2 ? K.blamed : 0) + (c.rapport >= 2 ? K.trusting : 0));
    };`);
    const r = k.value(`(() => {
      const bad = [], seen = new Set();
      for (let seed = 1; seed <= 60; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        for (const c of S.order.map(C)) {
          const cl = claimOf(c);
          for (const said of [null, 1])
            for (const stood of [null, 'x'])
              for (const r of [0, 2])
                for (const tt of [false, true])
                  for (const extra of [0, 1, 2]) {
                    cl.said = said; cl.stood = stood; c.rapport = r;
                    S.testimony = [];
                    if (extra >= 1) S.testimony.push({ day: 1, from: 'x', about: c.id, kind: 'vision', verdict: 'cult' }, { day: 1, from: 'x', about: c.id, kind: 'failwatch', verdict: 'x' });
                    if (extra >= 2) S.testimony.push({ day: 1, from: 'y', about: c.id, kind: 'distrust', verdict: 'cult' }, { day: 1, from: 'z', about: c.id, kind: 'distrust', verdict: 'cult' });
                    seen.add(pretence(c) || 'none');
                    const a = __oldConfess(c, tt), b = confessChance(c, tt);
                    if (a !== b) bad.push([seed, c.id, pretence(c), a, b]);
                  }
        }
      }
      return { bad: bad.slice(0, 5), seen: [...seen].sort() };
    })()`);
    assert.deepStrictEqual(r.bad, []);
    // every case was met: nothing to drop, a part hidden, a part claimed, a cover, the trade, a staged confession
    for (const k2 of ['none', 'hid-seer', 'hid-warden', 'liked-seer', 'liked-warden', 'cover', 'staged'])
      assert.ok(r.seen.includes(k2), 'never met: ' + k2 + ' (met: ' + r.seen.join(', ') + ')');
  }
};
