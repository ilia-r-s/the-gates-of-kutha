// The levels of feeling (people/ties.js, RULES.ties): each question answers as its threshold says, at every level.
const assert = require('assert');

module.exports = {
  'trust in you, at every level from hostile to devoted'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]), out = [];
      for (let t = -2; t <= 3; t++) {
        c.rapport = t;
        out.push([t, Ties.friend(c), Ties.cordial(c), Ties.against(c), Ties.hostile(c)]);
      }
      return out;
    })()`);
    assert.deepStrictEqual(r, [
      [-2, false, false, true, true],
      [-1, false, false, true, false],
      [0, false, false, false, false],
      [1, false, true, false, false],
      [2, true, true, false, false],
      [3, true, true, false, false]
    ]);
  },
  'liking, at every level from cannot bear to close, by person or by id'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const a = C(S.order[0]), b = C(S.order[1]), out = [];
      for (let l = -2; l <= 2; l++) {
        S.like[a.id][b.id] = l;
        out.push([l, Ties.fond(a, b), Ties.close(a.id, b.id), Ties.dislikes(a, b.id), Ties.cannotBear(a.id, b)]);
      }
      return out;
    })()`);
    assert.deepStrictEqual(r, [
      [-2, false, false, true, true],
      [-1, false, false, true, false],
      [0, false, false, false, false],
      [1, true, false, false, false],
      [2, true, true, false, false]
    ]);
  },
  'the levels are read from RULES when asked'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]);
      c.rapport = 1;
      const before = Ties.friend(c);
      RULES.ties.friend = 1;
      const after = Ties.friend(c);
      RULES.ties.friend = 2;
      return [before, after];
    })()`);
    assert.deepStrictEqual(r, [false, true]);
  },
  'trust moves a step: by talk never past warm, by deed as far as devoted, down never past hostile'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]), out = [];
      for (let t = -2; t <= 3; t++)
        for (const by of ['talk', 'deed'])
          for (const d of [1, -1]) {
            c.rapport = t;
            const moved = Ties.moveTrust(c, d, by);
            out.push([t, by, d, moved, c.rapport]);
          }
      return out;
    })()`);
    r.forEach(([t, by, d, moved, now]) => {
      const top = by === 'talk' ? 2 : 3,
        want = d > 0 ? Math.min(top, t + 1) : Math.max(-2, t - 1);
      assert.strictEqual(now, t > top && d > 0 ? t : want, `trust ${t}, ${by}, ${d}`);
      assert.strictEqual(moved, now !== t, `trust ${t}, ${by}, ${d}: moved`);
    });
    // (talk moves nobody to devoted, and leaves the devoted as they are, going up)
    assert.ok(r.some(([t, by, d, moved, now]) => t === 3 && by === 'talk' && d === 1 && !moved && now === 3));
  },
  'set outright, trust stays within the scale'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]);
      return [9, 3, 0, -2, -9].map(v => (Ties.setTrust(c, v), c.rapport));
    })()`);
    assert.deepStrictEqual(r, [3, 3, 0, -2, -2]);
  },
  'liking moves a step, from cannot bear to close, by person or by id'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const a = C(S.order[0]), b = C(S.order[1]), out = [];
      for (let l = -2; l <= 2; l++)
        for (const d of [1, -1]) {
          S.like[a.id][b.id] = l;
          const moved = l % 2 ? Ties.shiftLike(a, b, d) : Ties.shiftLike(a.id, b.id, d);
          out.push([l, d, moved, Ties.likes(a, b), Ties.likes(b.id, a.id) === S.like[b.id][a.id]]);
        }
      return out;
    })()`);
    r.forEach(([l, d, moved, now, other]) => {
      assert.strictEqual(now, Math.max(-2, Math.min(2, l + d)), `liking ${l}, ${d}`);
      assert.strictEqual(moved, now !== l, `liking ${l}, ${d}: moved`);
      assert.ok(other, 'the other way left alone');
    });
  },
  'sweet on you while she trusts you and is at the dig; drawn to you wherever she is; the priest keeps his vows'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const her = S.order.map(C).find(c => c.p === 'she'), him = C('anselm'), out = {};
      S.flirt[her.id].you = true;
      her.rapport = RULES.flirt.trust - 1;
      out.cool = [Ties.sweetOnYou(her), Ties.drawnToYou(her)];
      her.rapport = RULES.flirt.trust;
      out.warm = [Ties.sweetOnYou(her), Ties.drawnToYou(her)];
      her.status = 'taken';
      out.taken = [Ties.sweetOnYou(her), Ties.drawnToYou(her)];
      her.status = 'present';
      out.vows = [Ties.vowed(him), Ties.vowed('anselm'), Ties.vowed(her), Ties.mayFlirt(her, him), Ties.mayFlirt(him, her)];
      // (dealt: never a streak from the priest toward anyone)
      out.dealt = Object.keys(S.flirt.anselm).filter(x => x !== 'you');
      return out;
    })()`);
    assert.deepStrictEqual(r, {
      cool: [false, false],
      warm: [true, true],
      taken: [false, true],
      vows: [true, true, false, false, false],
      dealt: []
    });
  },
  'every two of a list: each pair once, in the order of the list, or each way about'(k) {
    const r = k.value(`[Ties.pairs(['a', 'b', 'c']), Ties.eachWay(['a', 'b', 'c']), Ties.pairs(['a']), Ties.eachWay([])]`);
    assert.deepStrictEqual(r, [
      [
        ['a', 'b'],
        ['a', 'c'],
        ['b', 'c']
      ],
      [
        ['a', 'b'],
        ['a', 'c'],
        ['b', 'a'],
        ['b', 'c'],
        ['c', 'a'],
        ['c', 'b']
      ],
      [],
      []
    ]);
  },
  'grief and confidences: mourned since the day, comforted once, confidences counted, each a step of trust by deed'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [a, b, v] = S.order.map(C);
      a.rapport = 2;
      b.rapport = 2;
      const out = { before: [Ties.mourning(a) || null, Ties.confidences(b), Ties.confidedIn(b)] };
      Ties.mourn(a, v.id);
      out.mourns = { ...Ties.mourning(a) };
      Ties.comfort(a);
      out.comforted = [Ties.mourning(a.id).done, a.rapport];
      Ties.confide(b);
      Ties.confide(b);
      out.confided = [Ties.confidences(b), Ties.confidences(b.id), Ties.confidedIn(b), b.rapport, S.confidedIn.slice()];
      return out;
    })()`);
    const ids = k.value('S.order.slice(0, 3)');
    assert.deepStrictEqual(r, {
      before: [null, 0, false],
      mourns: { day: 1, victim: ids[2] },
      comforted: [true, 3],
      confided: [2, 2, true, 3, [ids[1]]]
    });
  },
  'the deal: every liking between cannot bear and close, every trust from hostile to warm, as each arrived'(k) {
    const r = k.value(`(() => {
      const bad = [];
      for (let seed = 1; seed <= 40; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.order.forEach(a =>
          S.order.forEach(b => {
            const l = Ties.likes(a, b);
            if (a !== b && !(l >= -2 && l <= 2 && Number.isInteger(l))) bad.push([seed, a, b, l]);
          })
        );
        S.order.map(C).forEach(c => {
          if (!(c.rapport >= RULES.scale.trustMin && c.rapport <= RULES.scale.talkMax) || S.rap0[c.id] !== c.rapport)
            bad.push([seed, c.id, c.rapport]);
          if (S.flirt[c.id].you && c.p !== 'she') bad.push([seed, c.id, 'a streak toward you, from a man']);
          Object.keys(S.flirt[c.id]).forEach(b => b !== 'you' && C(b).p === c.p && bad.push([seed, c.id, b, 'the same sex']));
        });
      }
      return bad;
    })()`);
    assert.deepStrictEqual(r, []);
  }
};
