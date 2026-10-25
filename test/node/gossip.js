// The gossip machinery (people/gossip.js, Gossip): one model of how true a speaker's word runs, each kind of gossip its
// own parameters of it; the kinds tried in their order, falling through; the channels it is told on; and the talk of
// you, kept and told by morning.
const assert = require('assert');

// the dice a call throws, as the trace keeps them: [kind, the odds asked, what came up]
const DICE = `globalThis.__dice = f => {
  TRACE = [];
  try {
    const out = f();
    return { out, dice: TRACE.map(e => e.slice(0, 3)) };
  } finally {
    TRACE = null;
  }
};`;
const near = (a, b) => Math.abs(a - b) < 1e-9;

module.exports = {
  'how true it is: one model, and each kind its own parameters of it'(k) {
    k.run(DICE);
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const out = {};
      for (const temper of TEMPER_IDS) {
        const s = C(S.order[0]);
        S.temper[s.id] = temper;
        const t = TP(s).gossipTrue;
        out[temper] = {
          t,
          sure: __dice(() => Gossip.toldTrue(s, { sure: true, bias: 2, slip: 0.5 })),
          bias: __dice(() => Gossip.toldTrue(s, { bias: 2 })),
          plain: __dice(() => Gossip.toldTrue(s)),
          slip: __dice(() => Gossip.toldTrue(s, { slip: RULES.flirt.invent }))
        };
      }
      return { out, likeBias: RULES.gossip.likeBias, invent: RULES.flirt.invent, rarest: RULES.scale.rarest, surest: RULES.scale.surest };
    })()`);
    const held = p => Math.min(r.surest, Math.max(r.rarest, p));
    Object.entries(r.out).forEach(([temper, x]) => {
      assert.deepStrictEqual(x.sure, { out: true, dice: [] }, `${temper}: as true as they know it, with no die`);
      [
        ['bias', x.t - r.likeBias * 2, false],
        ['plain', x.t, false],
        ['slip', (1 - x.t) * r.invent, true]
      ].forEach(([what, p, slip]) => {
        const d = x[what].dice;
        if (!(p > 0)) return assert.strictEqual(d.length, 0, `${temper}, ${what}: odds of nothing throw no die`);
        assert.strictEqual(d.length, 1, `${temper}, ${what}: one die`);
        assert.ok(near(d[0][1], held(p)), `${temper}, ${what}: asked ${d[0][1]}, not ${held(p)}`);
        assert.strictEqual(
          x[what].out,
          slip ? !d[0][2] : d[0][2],
          `${temper}, ${what}: told true ${slip ? 'unless it slips' : 'if the die says so'}`
        );
      });
    });
  },
  'what it comes to, when not told true: a nothing made up now and then, a something turned about now and then'(k) {
    k.run(DICE);
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const out = [];
      for (let i = 0; i < 40; i++) {
        const none = __dice(() => Gossip.misread(null, () => 'made up', () => 'turned')),
          some = __dice(() => Gossip.misread('real', () => 'made up', () => 'turned'));
        out.push([none, some]);
      }
      return { out, invent: RULES.gossip.inventBond, flip: RULES.gossip.flipBond };
    })()`);
    r.out.forEach(([none, some]) => {
      assert.strictEqual(none.dice.length, 1);
      assert.ok(near(none.dice[0][1], r.invent));
      assert.strictEqual(none.out, none.dice[0][2] ? 'made up' : null);
      assert.strictEqual(some.dice.length, 1);
      assert.ok(near(some.dice[0][1], r.flip));
      assert.strictEqual(some.out, some.dice[0][2] ? 'turned' : null);
    });
    assert.ok(r.out.some(([n]) => n.out) && r.out.some(([n]) => !n.out), 'both ways, over forty');
  },
  'the kinds, in their order: each tried at its odds, falling through to the next, the last ending the talk'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const K = Gossip.kinds, keep = K.map(x => ({ ...x })), s = C(S.order[0]), out = {};
      out.order = K.map(x => [x.kind, !!x.pool, !!x.last]);
      try {
        const tried = [];
        // every kind tried without a die, and saying nothing: each in turn, until the first that is the last
        K.forEach(x => {
          x.odds = null;
          x.say = () => (tried.push(x.kind), null);
        });
        out.none = [Gossip.line(s), tried.slice()];
        // the thief passed over (odds of nothing: no die), and the third saying something: it is told
        tried.length = 0;
        K[0].odds = () => 0;
        K[2].say = () => (tried.push(K[2].kind), { t: s, text: 'said' });
        out.third = [Gossip.line(s).text, tried.slice()];
        // the third passed over too: the rest are tried, to the first that is the last
        tried.length = 0;
        K[2].odds = () => 0;
        out.passed = [Gossip.line(s), tried.slice()];
        // nobody to talk about: the talk ends where it would need someone
        tried.length = 0;
        out.alone = [Gossip.line(s, S.order.filter(id => id !== s.id)), tried.slice()];
      } finally {
        K.forEach((x, i) => Object.assign(x, keep[i]));
      }
      return out;
    })()`);
    assert.deepStrictEqual(r.order, [
      ['hint', false, true],
      ['scandal', false, false],
      ['flirt', false, false],
      ['thinks', true, false],
      ['temper', true, true],
      ['bond', true, true]
    ]);
    assert.deepStrictEqual(r.none, [null, ['hint']]);
    assert.deepStrictEqual(r.third, ['said', ['scandal', 'flirt']]);
    assert.deepStrictEqual(r.passed, [null, ['scandal', 'thinks', 'temper']]);
    assert.deepStrictEqual(r.alone, [null, ['scandal']]);
  },
  'the kinds fall through: with the thief passed over, each of the rest until one speaks'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const K = Gossip.kinds, keep = K.map(x => ({ ...x })), s = C(S.order[0]), out = {};
      try {
        const tried = [];
        K.forEach(x => {
          x.odds = x.kind === 'hint' ? () => 0 : null;
          x.say = () => (tried.push(x.kind), null);
        });
        out.all = [Gossip.line(s), tried.slice()];
        tried.length = 0;
        out.alone = [Gossip.line(s, S.order.filter(id => id !== s.id)), tried.slice()];
      } finally {
        K.forEach((x, i) => Object.assign(x, keep[i]));
      }
      return out;
    })()`);
    assert.deepStrictEqual(r.all, [null, ['scandal', 'flirt', 'thinks', 'temper']]);
    assert.deepStrictEqual(r.alone, [null, ['scandal', 'flirt']]);
  },
  'in conversation the talk is never heavy and stirs nothing; at breakfast it stirs the talk when something is said'(k) {
    k.run(DICE);
    const r = k.value(`(() => {
      const out = [];
      for (let seed = 1; seed <= 30; seed++) {
        newGame('Marlowe', 'soldier', false, seed);
        const s = C(S.order[0]),
          heat = JSON.stringify(S.tenor.heat),
          t = __dice(() => Gossip.speak('talk', s));
        out.push(['talk', !!t.out, JSON.stringify(S.tenor.heat) === heat, t.dice.length ? t.dice[0][1] : null, clamp(TP(s).gossip, RULES.scale.rarest, RULES.scale.surest)]);
        const before = JSON.stringify(S.tenor.heat),
          b = Gossip.speak('breakfast');
        out.push(['breakfast', !!b, JSON.stringify(S.tenor.heat) !== before]);
      }
      return out;
    })()`);
    r.filter(x => x[0] === 'talk').forEach(([, , calm, first, mood]) => {
      assert.ok(calm, 'the talk in conversation stirs nothing');
      assert.ok(first !== null && near(first, mood), 'the first die is the speaker’s mood to gossip');
    });
    r.filter(x => x[0] === 'breakfast').forEach(([, said, stirred]) => assert.strictEqual(stirred, said, 'stirred when something is said'));
    assert.ok(r.some(x => x[0] === 'talk' && x[1]) && r.some(x => x[0] === 'breakfast' && x[1]), 'something is said, now and then');
  },
  'word of what you did: once a deed and a person, had by morning, and kept with who it moved'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 5);
      const [a, b] = S.order.map(C);
      S.order.map(C).forEach(c => (c.rapport = 0));
      S.order.forEach(x => S.order.forEach(y => x !== y && (S.like[x][y] = 2)));
      Gossip.wordOf(a, 'pressed');
      Gossip.wordOf(a, 'pressed');
      Gossip.wordOf(b, 'confided');
      const pending = S.pending.map(p => [p.kind, p.about]);
      let h = '';
      for (let i = 0; i < 20 && !Gossip.record().length; i++) {
        S.pending = [{ day: S.day, kind: 'pressed', about: a.id, strength: 1 }];
        h = Gossip.rumours();
      }
      const rec = Gossip.record()[0];
      return { pending, left: S.pending.length, said: !!h, rec: rec && [rec.kind, rec.about, rec.up.length + rec.down.length > 0], told: rec && Gossip.told(rec) };
    })()`);
    const ids = k.value('S.order.slice(0, 2)');
    assert.deepStrictEqual(r.pending, [
      ['pressed', ids[0]],
      ['confided', ids[1]]
    ]);
    assert.strictEqual(r.left, 0);
    assert.ok(r.said);
    assert.deepStrictEqual(r.rec, ['pressed', ids[0], true]);
    assert.ok(/pressed/.test(r.told), r.told);
  }
};
