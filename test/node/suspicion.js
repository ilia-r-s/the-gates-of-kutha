// The suspicion machinery (people/suspicion.js, Suspicion): its levels and bounds, the record of what was said before
// everyone, and the seven ways the cult measures who is closing in, each against the expression it replaced, at every
// other step of forty seasons played (as the season stands, and again with everyone's suspicion dealt at random).
const assert = require('assert');
const { chooser } = require('../lib/kernel');

// the expressions as they stood before the machinery (27.1), over the game's own state
const BEFORE = `globalThis.__was = {
  sus: (a, b) => (S.sus && S.sus[a] ? S.sus[a][b] || 0 : 0),
  suspectedBy: id => freeChars().filter(o => o.id !== id && __was.sus(o.id, id) >= 2).map(o => o.id),
  mostSuspected(c, pool) {
    const top = pool
      .filter(o => __was.sus(c.id, o.id) >= (Ties.close(c.id, o.id) ? RULES.scale.suspicion : 2))
      .sort((a, b) => __was.sus(c.id, b.id) - __was.sus(c.id, a.id) || Ties.likes(c.id, a.id) - Ties.likes(c.id, b.id));
    return top[0] || null;
  },
  looksLost: c => caseAgainst(c) >= RULES.verdict.someCase || __was.suspectedBy(c.id).length >= 2,
  caught: k => caseAgainst(k) >= RULES.verdict.strongCase || __was.suspectedBy(k.id).length >= 2 || S.log.refusedInq.some(r => r.id === k.id),
  clear: k => caseAgainst(k) < RULES.verdict.someCase && !__was.suspectedBy(k.id).length && !S.log.refusedInq.some(r => r.id === k.id),
  closingIn: o =>
    freeCult().reduce((a, k) => a + Math.max(0, __was.sus(o.id, k.id) - 1), 0) +
    S.said.filter(x => x.by === o.id && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult').length,
  harm: c =>
    S.said.filter(x => x.by === c.id && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult' && isFree(C(x.about))).length,
  threatened: npcs =>
    npcs.some(c => S.said.some(x => x.by === c.id && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult' && isFree(C(x.about)))),
  watched: (mate, dec) =>
    __was.suspectedBy(mate.id).length > 0 || S.said.some(x => x.about === mate.id && x.verdict === 'cult' && x.by !== dec.id),
  accuser: (o, c) =>
    __was.sus(o.id, c.id) >= 2 ||
    S.testimony.some(t => t.from === o.id && t.about === c.id && (t.kind === 'distrust' || (t.kind === 'vision' && t.verdict === 'cult'))),
  suspects: (v, cult) => cult.find(c => __was.sus(v.id, c.id) >= 2),
  weight: (v, k) => 1 + RULES.victims.suspects * __was.sus(v.id, k.id),
  named: (x, y) => S.said.some(z => z.by === x && z.about === y && z.verdict === 'cult'),
  accusations: c => S.said.filter(x => x.by === c.id && x.verdict === 'cult' && x.how !== 'vote'),
  aloudBefore: c => S.said.some(x => x.by === c.id && x.how === 'dream')
};
// every question, asked both ways, of everyone about everyone: the first that differs, or null
globalThis.__differs = () => {
  const W = __was, U = Suspicion, all = S.order.map(C), cult = all.filter(c => c.role === 'cult'), free = freeChars();
  const same = (what, a, b) => (JSON.stringify(a) === JSON.stringify(b) ? null : what + ': ' + JSON.stringify([a, b]));
  const ids = x => (x ? x.id : null);
  for (const c of all) {
    const r =
      same('suspectedBy ' + c.id, W.suspectedBy(c.id), U.suspectedBy(c)) ||
      same('looksLost ' + c.id, W.looksLost(c), U.looksLost(c)) ||
      same('caught ' + c.id, W.caught(c), U.caught(c)) ||
      same('clear ' + c.id, W.clear(c), U.clear(c)) ||
      same('closingIn ' + c.id, W.closingIn(c), U.threat.closingIn(c)) ||
      same('harm ' + c.id, W.harm(c), U.threat.harm(c)) ||
      same('aloud ' + c.id, W.aloudBefore(c), U.hasDreamtAloud(c)) ||
      same('accusations ' + c.id, W.accusations(c), U.accusations(c)) ||
      same('mostSuspected ' + c.id, ids(W.mostSuspected(c, free)), ids(U.mostSuspected(c, free))) ||
      same('suspects ' + c.id, ids(W.suspects(c, cult)), ids(U.threat.suspects(c, cult)));
    if (r) return r;
    for (const o of all) {
      const q =
        same('level ' + c.id + ' ' + o.id, W.sus(c.id, o.id), U.level(c, o)) ||
        same('accuser ' + o.id + ' ' + c.id, W.accuser(o, c), U.threat.accuser(o, c)) ||
        same('weight ' + c.id + ' ' + o.id, W.weight(c, o), U.threat.weight(c, o)) ||
        same('named ' + c.id + ' ' + o.id, W.named(c.id, o.id), U.named(c, o)) ||
        (o !== c ? same('watched ' + c.id + ' ' + o.id, W.watched(c, o), U.threat.watched(c, o)) : null);
      if (q) return q;
    }
  }
  return same('threatened', W.threatened(free), U.threat.threatened(free));
};
// ... and again with everyone's suspicion of everyone dealt at random (seeded), then put back as it was
globalThis.__shaken = seed => {
  const keep = JSON.stringify(S.sus);
  let x = seed * 2654435761 >>> 0;
  const next = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
  S.order.forEach(a => S.order.forEach(b => a !== b && (S.sus[a][b] = Math.floor(next() * 4))));
  try {
    return __differs();
  } finally {
    S.sus = JSON.parse(keep);
  }
};`;

module.exports = {
  'suspicion moves a step, from none to all but sure, and each level answers as RULES.suspects names it'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [a, b] = S.order.map(C), out = [];
      for (let l = 0; l <= 3; l++)
        for (const d of [1, -1]) {
          S.sus[a.id][b.id] = l;
          const asked = [Suspicion.wonders(a, b), Suspicion.onlyWonders(a.id, b), Suspicion.earnest(a, b.id), Suspicion.sure(a.id, b.id)];
          const moved = Suspicion.move(a.id, b.id, d);
          out.push([l, d, asked, moved, Suspicion.level(a, b)]);
        }
      return out;
    })()`);
    r.forEach(([l, d, asked, moved, now]) => {
      assert.deepStrictEqual(asked, [l >= 1, l === 1, l >= 2, l >= 3], `level ${l}`);
      assert.strictEqual(now, Math.max(0, Math.min(3, l + d)), `level ${l}, ${d}`);
      assert.strictEqual(moved, now !== l, `level ${l}, ${d}: moved`);
    });
  },
  "the camp's suspicion: those still here who suspect someone in earnest, and from two of them on"(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [x, a, b, c] = S.order.map(C), out = [];
      S.sus[a.id][x.id] = 2;
      out.push([Suspicion.suspectedBy(x), Suspicion.suspected(x)]);
      S.sus[b.id][x.id] = 3;
      S.sus[c.id][x.id] = 1;
      out.push([Suspicion.suspectedBy(x.id), Suspicion.suspected(x.id)]);
      a.status = 'taken';
      out.push([Suspicion.suspectedBy(x), Suspicion.suspected(x)]);
      return [out, [a.id, b.id]];
    })()`);
    const [out, [a, b]] = r;
    const inOrder = k.value(`S.order.filter(i => ${JSON.stringify([a, b])}.includes(i))`);
    assert.deepStrictEqual(out, [
      [[a], false],
      [inOrder, true],
      [[b], false]
    ]);
  },
  'what was said before everyone is settled once, by the last word of each, in the order each first spoke'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [x, a, b] = S.order;
      Suspicion.sayAloud(a, x, 'cult', 'dream');
      S.day = 2;
      Suspicion.sayAloud(b, x, 'clean', 'vote');
      Suspicion.sayAloud(a, x, 'clean', 'blame');
      const first = Suspicion.settle(x, true).map(({ x: w, right }) => [w.by, w.verdict, w.how, w.day, right]);
      const again = Suspicion.settle(x, true).length;
      return { first, again, credit: [Suspicion.credit(a), Suspicion.credit(b), Suspicion.credit(x)], ids: [a, b] };
    })()`);
    const [a, b] = r.ids;
    assert.deepStrictEqual(r.first, [
      [a, 'clean', 'blame', 2, false],
      [b, 'clean', 'vote', 2, false]
    ]);
    assert.strictEqual(r.again, 0);
    assert.deepStrictEqual(r.credit, [-1, -1, 0]);
  },
  "the camp's suspicion of you stays within the scale, and goes by steps where a table does"(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const out = [[Suspicion.onYou(), Suspicion.youLevel()]];
      Suspicion.suspectYou(1.6);
      out.push([Suspicion.onYou(), Suspicion.youLevel()]);
      Suspicion.suspectYou(5);
      out.push([Suspicion.onYou(), Suspicion.youLevel()]);
      Suspicion.clearYou(2.5);
      out.push([Suspicion.onYou(), Suspicion.youLevel()]);
      Suspicion.clearYou(9);
      out.push([Suspicion.onYou(), Suspicion.youLevel()]);
      return out;
    })()`);
    assert.deepStrictEqual(r, [
      [0, 0],
      [1.6, 1],
      [3, 3],
      [0.5, 0],
      [0, 0]
    ]);
  },
  "the cult's alert: never at odds of nothing, and once it knows, it knows"(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      Suspicion.alertCult(0);
      const before = Suspicion.cultAlerted();
      S.alerted = true;
      Suspicion.alertCult(0);
      return [before, Suspicion.cultAlerted()];
    })()`);
    assert.deepStrictEqual(r, [false, true]);
  },
  'every measure of suspicion and of who is closing in, as it was, at every other step of forty seasons'(k) {
    k.run(BEFORE);
    let asked = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const pick = chooser(seed);
      k.start(seed, ['philologist', 'soldier', 'occultist'][seed % 3], seed % 2 === 1);
      for (let n = 0; n < 400 && !k.ended() && k.choices(); n++) {
        if (n % 2 === 0) {
          asked++;
          const d = k.value('__differs()'),
            e = k.value(`__shaken(${seed * 1000 + n})`);
          assert.strictEqual(d, null, `seed ${seed}, step ${n}: ${d}`);
          assert.strictEqual(e, null, `seed ${seed}, step ${n}, suspicion dealt at random: ${e}`);
        }
        k.choose(pick(k.choices()));
      }
    }
    assert.ok(asked > 1000, `asked ${asked} times`);
  }
};
