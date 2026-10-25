// Each part's playbook (people/parts.js, Parts) and the watch (people/watch.js, Watch): every decision point has
// anyone's move, a part's own moves only where it has them; the claim at the start, part by part, die for die as it
// was; and the promises to watch your tent, one record, each kind in its place.
const assert = require('assert');

// the claim at the start as it stood before the playbook (27.1), one person's
const BEFORE = `globalThis.__oldClaim = (c, t, honest) => {
  const K = RULES.claims;
  let role = 'none', why = 'truth';
  if (c.role === 'seer' || c.role === 'warden') {
    if (chance(c.role === 'seer' ? t.hideSeer : t.hideWarden)) {
      why = 'conceal';
      role = honest ? 'evade' : 'none';
    } else role = c.role;
  } else if (c.role === 'smuggler' && !honest && chance(t.cover)) {
    role = 'warden';
    why = 'conceal';
  } else if (!honest && chance(t.liked)) {
    role = chance(K.likedSeer) ? 'seer' : 'warden';
    why = c.role === 'cult' ? 'deceit' : 'liked';
  } else if (chance(honest ? K.evadeHonest : K.evadeAny)) {
    role = 'evade';
    why = c.role === 'smuggler' || c.role === 'cult' ? 'conceal' : 'reticent';
  } else if (c.role === 'smuggler' || c.role === 'cult') why = 'conceal';
  return { role, why };
};`;

module.exports = {
  'every decision point has anyone’s move; a part’s own, only where it has one'(k) {
    const r = k.value(`(() => {
      const P = Parts.playbook, points = Object.keys(P.anyone), out = { points, own: {} };
      Object.keys(P).forEach(part => (out.own[part] = Object.keys(P[part])));
      return out;
    })()`);
    assert.deepStrictEqual(r.points, ['claim', 'name', 'nameAloud', 'dream', 'pressed']);
    assert.deepStrictEqual(r.own, {
      anyone: ['claim', 'name', 'nameAloud', 'dream', 'pressed'],
      cult: ['claim', 'name', 'nameAloud', 'dream', 'pressed', 'lieLow', 'victim'],
      seer: ['claim'],
      warden: ['claim', 'watch'],
      smuggler: ['claim', 'pressed']
    });
    const falls = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]), keep = c.role, out = {};
      for (const role of ['cult', 'seer', 'warden', 'smuggler', 'none']) {
        c.role = role;
        out[role] = ['claim', 'name', 'nameAloud', 'dream', 'pressed'].map(p => Parts.move(c, p) === (Parts.playbook[role] || {})[p] ? 'own' : Parts.move(c, p) === Parts.playbook.anyone[p] ? 'anyone' : '?');
      }
      c.role = keep;
      return out;
    })()`);
    assert.deepStrictEqual(falls, {
      cult: ['own', 'own', 'own', 'own', 'own'],
      seer: ['own', 'anyone', 'anyone', 'anyone', 'anyone'],
      warden: ['own', 'anyone', 'anyone', 'anyone', 'anyone'],
      smuggler: ['own', 'anyone', 'anyone', 'anyone', 'own'],
      none: ['anyone', 'anyone', 'anyone', 'anyone', 'anyone']
    });
  },
  'the claim at the start, part by part, die for die as it was, for every part, temperament and honesty'(k) {
    k.run(BEFORE);
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]), keep = [c.role, S.temper[c.id]], bad = [];
      let n = 0;
      for (const role of ['cult', 'seer', 'warden', 'smuggler', 'none'])
        for (const temper of TEMPER_IDS)
          for (const honest of [false, true])
            for (let i = 0; i < 12; i++) {
              c.role = role;
              S.temper[c.id] = temper;
              const t = TP(c), seed = 1000 + n++;
              TRACE = [];
              reseed(seed);
              const a = __oldClaim(c, t, honest), da = TRACE.splice(0).map(e => e.slice(0, 3));
              reseed(seed);
              const b = Parts.move(c, 'claim')(c, t, honest), db = TRACE.splice(0).map(e => e.slice(0, 3));
              TRACE = null;
              if (JSON.stringify([a, da]) !== JSON.stringify([b, db])) bad.push([role, temper, honest, a, b]);
            }
      [c.role, S.temper[c.id]] = keep;
      return { asked: n, bad: bad.slice(0, 3) };
    })()`);
    assert.deepStrictEqual(r.bad, []);
    assert.ok(r.asked >= 5 * 6 * 2 * 12, `asked ${r.asked}`);
  },
  'promises to watch your tent: one record, each kind in its place, the Watcher’s kept as their trust allows'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [a, b, c] = S.order.map(C), keep = [a.role, b.role, c.role];
      a.role = 'warden';
      b.role = 'cult';
      c.role = 'none';
      [a, b, c].forEach(x => Watch.swear(x));
      const sworn = { ...S.sworn };
      Watch.unswear('cult');
      const after = { ...S.sworn };
      Watch.swear(b, 'warden');
      const staged = Watch.sworn('warden');
      [a.role, b.role, c.role] = keep;
      // the Watcher who promised, and trusts you: watches your tent at watchKept, otherwise anyone at all
      Watch.swear(a, 'warden');
      a.rapport = 2;
      RULES.night.watchKept = 1;
      const kept = Watch.choose({ watcher: a });
      a.rapport = 1;
      TRACE = [];
      Watch.choose({ watcher: a });
      const anyone = TRACE.map(e => e[0]);
      TRACE = null;
      return { sworn, after, staged, ids: [a.id, b.id, c.id], kept, anyone };
    })()`);
    const [a, b, c] = r.ids;
    assert.deepStrictEqual(r.sworn, { warden: a, cult: b, other: c });
    assert.deepStrictEqual(r.after, { warden: a, cult: null, other: c });
    assert.strictEqual(r.staged, b, 'one who stages coming clean swears as the Watcher would');
    assert.strictEqual(r.kept, 'player');
    assert.deepStrictEqual(r.anyone, ['P'], 'not trusting you enough, the Watcher watches anyone at all, by one pick');
  },
  'the watch holds only for the one watched over, on a die; luck and being seen, a die each'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const night = { guard: S.order[1] }, out = [];
      TRACE = [];
      out.push(Watch.holds(night, S.order[2]), TRACE.length);
      Watch.holds(night, S.order[1]);
      out.push(TRACE.length, TRACE[0][1] === +Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, RULES.night.watched)).toPrecision(12));
      Watch.spared();
      Watch.seen();
      out.push(TRACE.map(e => e[0]).join(''));
      TRACE = null;
      return out;
    })()`);
    assert.deepStrictEqual(r, [false, 0, 1, true, 'CCC']);
  }
};
