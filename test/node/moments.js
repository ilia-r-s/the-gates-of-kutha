// The moments machinery (people/moments.js, Moments): one helper for whoever hears of a thing, in each of its ways (a
// public moment's, talk of you, word of what you did), and every reaction of every moment written as odds, against the
// expression it replaced, for everyone at every sixth step of twenty seasons, as played and with everyone's
// feelings and suspicions dealt at random.
const assert = require('assert');
const { chooser } = require('../lib/kernel');

// the moments' reactions as they stood before they were written as odds (27.1), and their helpers
const OLD = `const OLD_REACT = {
  calledOut: (l, o, pr) =>
      Suspicion.earnest(l.id, o.about)
        ? ['trust', null, 1, pr.defend]
        : [
            'trust',
            null,
            -1,
            pr.p +
              (Ties.fond(l, o.about) ? pr.friend : 0) +
              (isSusp(l) ? pr.suspicious : 0) -
              (Ties.friend(l) ? pr.loyal : 0) -
              (Suspicion.onlyWonders(l.id, o.about) ? pr.suspected : 0) -
              (o.thief ? pr.thief : 0)
          ],
  praised: (l, o, pr) =>
      Ties.fond(l, o.about)
        ? (o.backed || []).includes(l.id)
          ? null
          : ['trust', null, -1, pr.grudge]
        : ['trust', null, 1, pr.p + (Suspicion.wonders(l.id, o.about) || Ties.dislikes(l, o.about) ? pr.doubted : 0)],
  grief: (l, o, pr) => [
      'trust',
      null,
      -1,
      pr.p +
        (Ties.fond(l, o.about) ? pr.friend : 0) +
        pr.late * (S.day - 1) +
        (Ties.confidedIn(o.about) ? pr.confided : 0) -
        (S.stats.right ? pr.progress : 0) -
        (Ties.friend(l) ? pr.loyal : 0)
    ],
  sleptWatch: (l, o, pr) => [
      'sus',
      o.about,
      1,
      pr.p + (Ties.dislikes(l, o.about) ? pr.dislike : 0) - (Ties.fond(l, o.about) ? pr.friend : 0) + (isSusp(l) ? pr.suspicious : 0)
    ],
  dreamt: (l, o, pr) => {
      if (Ties.fond(l, o.about) || Suspicion.earnest(l.id, o.by) || (o.answer && !Ties.fond(l, o.by)))
        return [
          'sus',
          o.by,
          1,
          pr.back +
            (Ties.fond(l, o.about) ? pr.friend : 0) +
            (isSusp(l) ? pr.suspicious : 0) +
            (o.answer ? pr.answer[o.answer.first ? 0 : 1] : 0)
        ];
      return [
        'sus',
        o.about,
        1,
        pr.p +
          (Ties.fond(l, o.by) ? pr.believe : 0) +
          pr.credit * Suspicion.credit(o.by) +
          (Ties.dislikes(l, o.about) ? pr.dislike : 0) -
          (Suspicion.onlyWonders(l.id, o.by) ? pr.doubt : 0)
      ];
    },
  dreamtClean: (l, o, pr) =>
      Suspicion.wonders(l.id, o.about)
        ? ['sus', o.about, -1, pr.p + (Ties.fond(l, o.by) ? pr.believe : 0) + pr.credit * Suspicion.credit(o.by)]
        : null,
  blame: (l, o, pr) => {
      if (Ties.fond(l, o.about)) return ['sus', o.by, 1, pr.back];
      return [
        'sus',
        o.about,
        1,
        pr.p + (Ties.dislikes(l, o.about) ? pr.dislike : 0) + (Ties.fond(l, o.by) ? pr.believe : 0) + pr.credit * Suspicion.credit(o.by)
      ];
    },
  song: (l, o, pr) =>
      Ties.fond(l, o.about)
        ? ['sus', o.about, 1, 0] // (a friend, hardly ever)
        : ['sus', o.about, 1, pr.p + (Ties.dislikes(l, o.about) ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
  confessed: (l, o, pr) =>
      Ties.fond(l, o.about)
        ? Suspicion.wonders(l.id, o.about)
          ? ['sus', o.about, -1, pr.respect]
          : null
        : ['sus', o.about, 1, pr.liar + (isSusp(l) ? pr.suspicious : 0)],
  onto: (l, o, pr) =>
      !o.by
        ? null
        : Ties.fond(l, o.about)
          ? ['sus', o.by, 1, pr.back]
          : ['sus', o.about, 1, pr.p + (Ties.dislikes(l, o.about) ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
  planted: (l, o, pr) =>
      Ties.fond(l, o.about)
        ? null
        : ['sus', o.about, 1, pr.p + (Ties.dislikes(l, o.about) ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
  kept: (l, o, pr) => (Suspicion.wonders(l.id, o.about) ? ['sus', o.about, -1, pr.p] : null),
  proven: (l, o, pr) => (Suspicion.wonders(l.id, o.by) ? ['sus', o.by, -1, pr.clear] : null),
  scandal: (l, o, pr) => {
      const v = S.log.visit,
        heard = (v.heard = v.heard || []);
      if (heard.includes(l.id)) return null;
      heard.push(l.id);
      const h = o.about,
        lh = ofPair(l, h),
        ls = ofPair(l, o.by),
        hi = Ties.pastBetween(l.id, h),
        prude = TP(l).prude + (Ties.vowed(l) ? pr.vows : 0),
        easy = pr.easy * Math.max(0, -prude),
        believe = pr.believe * ls + pr.credit * Suspicion.credit(o.by),
        past = pr.quarrel * hi.quarrels + pr.suspect * hi.suspects + (hi.accused || hi.accusedBy ? pr.named : 0) - pr.feast * hi.feasts,
        jealous = Ties.sweetOnYou(l) || Ties.sweetOn(l.id, h) ? pr.jealous : 0;
      const her = o.bad
          ? eitherWay(
              'like',
              h,
              pr.cool + believe + prude + past + pr.dislike * Math.max(0, -lh) - pr.friend * Math.max(0, lh),
              pr.rally * Math.max(0, lh) + pr.spurn * Math.max(0, -ls) + easy,
              -1
            )
          : eitherWay(
              'like',
              h,
              pr.coolKind + prude + past + pr.dislike * Math.max(0, -lh),
              pr.warm + believe + pr.friend * Math.max(0, lh) + easy,
              1
            ),
        you = eitherWay(
          'trust',
          null,
          (o.bad ? pr.youCool + believe : pr.youCoolKind) + prude + jealous - pr.loyal * Math.max(0, l.rapport - 1),
          pr.youWarm + easy + (o.bad ? pr.spurn * Math.max(0, -ls) : pr.glad * Math.max(0, lh)),
          o.bad ? -1 : 1
        );
      return [her, you];
    },
  disproven: (l, o, pr) => ['sus', o.by, 1, pr.p + (Ties.fond(l, o.about) && o.verdict === 'cult' ? pr.friend : 0)]
};
`;
const BEFORE = `(() => {
const isSusp = l => temperOf(l) === 'suspicious';
const ofPair = (l, x) => Ties.likes(l.id, x);
function eitherWay(what, whom, down, up, d) {
  const t = Math.max(0, down) + Math.max(0, up);
  return [what, whom, t > 0 ? (chance(Math.max(0, down) / t) ? -1 : 1) : d, t];
}
@OLD@
// the chance a reaction was rolled on: its own, held to the rarest, × a heavy moment, never surer than most
const was = (r, o) => [r[0], r[1], r[2], Math.min(RULES.scale.most, Math.max(RULES.scale.rarest, r[3]) * (o.heavy ? RULES.camp.heavy : 1))];
const now = (r, l, o, pr) => [r[0], r[1], r[2], r[3].p(l, o, pr, ...r.slice(4))];
const list = rs => (rs && Array.isArray(rs[0]) ? rs : [rs]).filter(Boolean);
// every moment but the scandal, about each of the camp, by each other (or nobody), each onlooker, both ways: the first
// that differs, or null
globalThis.__momentsDiffer = () => {
  const all = S.order.map(C), free = freeChars();
  let n = 0;
  for (const kind of Object.keys(OLD_REACT)) {
    if (kind === 'scandal') continue;
    const K = Moments.rows[kind], pr = RULES.camp[kind];
    for (const a of all)
      for (const b of [null, ...all]) {
        if (b === a) continue;
        n++;
        const o = { about: a.id, by: b ? b.id : null, heavy: n % 2 === 0, thief: n % 3 === 0, verdict: n % 4 === 0 ? 'clean' : 'cult',
          backed: n % 5 === 0 ? free.slice(0, 3).map(c => c.id) : [], answer: n % 3 === 1 ? { first: n % 2 === 1 } : null };
        for (const l of free) {
          if (l.id === o.about || l.id === o.by) continue;
          const x = JSON.stringify(list(OLD_REACT[kind](l, o, pr)).map(r => was(r, o))),
            y = JSON.stringify(list(K.react(l, o, pr, K.odds)).map(r => now(r, l, o, pr)));
          if (x !== y) return kind + ' about ' + o.about + ' by ' + o.by + ', ' + l.id + ': ' + x + ' then ' + y;
        }
      }
  }
  return null;
};
// the scandal, which throws its own dice for the way each reaction goes and remembers who has heard: both told the same
// dice, from the same state
globalThis.__scandalDiffers = seed => {
  const all = S.order.map(C), free = freeChars(), pr = RULES.camp.scandal, K = Moments.rows.scandal;
  const keep = S.log.visit;
  try {
    let n = 0;
    for (const h of all)
      for (const s of all) {
        if (s === h) continue;
        n++;
        const o = { about: h.id, by: s.id, bad: n % 2 === 0, heavy: n % 3 === 0 };
        for (const l of free) {
          if (l.id === h.id || l.id === s.id) continue;
          S.log.visit = { id: h.id, heard: [] };
          reseed(seed + n);
          const x = JSON.stringify(list(OLD_REACT.scandal(l, o, pr)).map(r => was(r, o)));
          S.log.visit = { id: h.id, heard: [] };
          reseed(seed + n);
          const y = JSON.stringify(list(K.react(l, o, pr, K.odds)).map(r => now(r, l, o, pr)));
          if (x !== y) return 'scandal about ' + h.id + ' by ' + s.id + ', ' + l.id + ': ' + x + ' then ' + y;
        }
      }
    return null;
  } finally {
    S.log.visit = keep;
  }
};
// ... and again with everyone's liking and suspicion of everyone dealt at random (seeded), then put back as it was
globalThis.__shook = (seed, f) => {
  const keep = JSON.stringify([S.like, S.sus]);
  let x = (seed * 2654435761) >>> 0;
  const next = () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296;
  S.order.forEach(a => S.order.forEach(b => a !== b && ((S.like[a][b] = Math.floor(next() * 5) - 2), (S.sus[a][b] = Math.floor(next() * 4)))));
  try {
    return f();
  } finally {
    [S.like, S.sus] = JSON.parse(keep);
  }
};
})()`.replace('@OLD@', OLD);

module.exports = {
  'a public moment throws a die for every reaction, even with the cap full; talk of you asks no more once it is full'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const all = S.order.map(C), sure = odds('test: all but sure', [['base', () => 0.99]]), out = {};
      for (const rollWhenFull of [true, false]) {
        all.forEach(c => (c.rapport = 0));
        TRACE = [];
        const h = Moments.hear(all, () => ['trust', null, 1, sure], { cap: 2, rollWhenFull });
        out[rollWhenFull] = { dice: TRACE.length, moved: h.moved.map(g => g[3].length), steps: h.steps.map(x => all.findIndex(c => c.id === x[0])) };
        TRACE = null;
      }
      return out;
    })()`);
    assert.strictEqual(r.true.dice, 7);
    assert.deepStrictEqual(r.true.moved, [2]);
    assert.deepStrictEqual(r.false.moved, [2]);
    assert.strictEqual(r.false.dice, r.false.steps[1] + 1, 'no die once the cap is full');
  },
  'a reaction decided already throws no die of its own; suspicion moved is told by how far it now goes'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [x, a, b, c] = S.order.map(C);
      S.sus[a.id][x.id] = 0;
      S.sus[b.id][x.id] = 1;
      S.sus[c.id][x.id] = 0;
      TRACE = [];
      const h = Moments.hear([a, b, c], () => ['sus', x.id, 1, null]);
      const dice = TRACE.length;
      TRACE = null;
      return { dice, moved: h.moved, steps: h.steps, ids: [x.id, a.id, b.id, c.id] };
    })()`);
    const [x, a, b, c] = r.ids;
    assert.strictEqual(r.dice, 0);
    assert.deepStrictEqual(r.moved, [
      ['sus', x, 1, [a, c], 1],
      ['sus', x, 1, [b], 2]
    ]);
    assert.deepStrictEqual(r.steps, [
      [a, 'sus', x, 1],
      [b, 'sus', x, 1],
      [c, 'sus', x, 1]
    ]);
  },
  'every moment has its row in RULES.camp and its line in the casebook'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [a, b] = S.order;
      return Object.keys(Moments.rows).map(kind => {
        const said = Moments.told({ kind, by: a, about: b, moved: [], bad: true, to: null });
        return [kind, !!RULES.camp[kind], Array.isArray(said) && said.length === 2 && said.every(s => typeof s === 'string' && s.length > 0)];
      });
    })()`);
    assert.strictEqual(r.length, 15);
    r.forEach(([kind, rules, told]) => {
      assert.ok(rules, `${kind}: RULES.camp.${kind}`);
      assert.ok(told, `${kind}: its line in the casebook`);
    });
  },
  'every reaction of every moment, written as odds, as it was, at every sixth step of twenty seasons'(k) {
    k.run(BEFORE);
    let asked = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const pick = chooser(seed);
      k.start(seed, ['philologist', 'soldier', 'occultist'][seed % 3], seed % 2 === 1);
      for (let n = 0; n < 400 && !k.ended() && k.choices(); n++) {
        if (n % 6 === 0) {
          asked++;
          const d = k.value('__momentsDiffer()'),
            e = k.value(`__shook(${seed * 1000 + n}, __momentsDiffer)`),
            s = n % 18 === 0 ? k.value(`__shook(${seed * 1000 + n}, () => __scandalDiffers(${seed * 7 + n}))`) : null;
          assert.strictEqual(d, null, `seed ${seed}, step ${n}: ${d}`);
          assert.strictEqual(e, null, `seed ${seed}, step ${n}, feelings dealt at random: ${e}`);
          assert.strictEqual(s, null, `seed ${seed}, step ${n}: ${s}`);
        }
        k.choose(pick(k.choices()));
      }
    }
    assert.ok(asked > 200, `asked ${asked} times`);
  }
};
