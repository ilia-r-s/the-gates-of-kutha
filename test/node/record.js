// The record (game/record.js, Record): one registry of the kinds of testimony, against every kind the code writes; each
// kind telling itself on a card and in the casebook's lists, in both languages; testimony kept once whatever the day;
// and the case against someone, by the registry's weights, against the expression it replaced, at every fourth step of
// twenty seasons, as played and with testimony and habits noted at random.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chooser, ROOT } = require('../lib/kernel');

// every kind of testimony the code writes: the quoted words in the third argument of each Record.testify(...)
function kindsWritten() {
  const kinds = new Set(),
    files = [];
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) files.push(p);
    });
  walk(path.join(ROOT, 'src'));
  files.forEach(f => {
    const s = fs.readFileSync(f, 'utf8');
    let i = 0;
    while ((i = s.indexOf('Record.testify(', i)) >= 0) {
      i += 'Record.testify('.length;
      const args = [''];
      for (let depth = 0; i < s.length; i++) {
        const ch = s[i];
        if ('([{'.includes(ch)) depth++;
        if (')]}'.includes(ch)) {
          if (depth === 0) break;
          depth--;
        }
        if (ch === ',' && depth === 0) args.push('');
        else args[args.length - 1] += ch;
      }
      (args[2] || '').replace(/'([a-z]+)'/g, (m, k) => kinds.add(k));
    }
  });
  return [...kinds].sort();
}

// the case as it stood before the registry (27.1)
const BEFORE = `globalThis.__oldCase = x => {
  const VR = RULES.verdict;
  let s = VR.sight * Record.sightedAs(x).length + VR.lie * Record.belied(x).length + VR.there * S.claims.filter(cl => cl.id === x.id && Record.wasThere(cl)).length;
  S.clues.forEach(cl => {
    if (cl.status === 'thief' || cl.status === 'stray' || cl.status === 'planted' || x.known[cl.cat] !== cl.val) return;
    s += cl.source === 'spite' ? VR.spite : cl.status === 'genuine' ? VR.genuine : VR.trace;
  });
  S.testimony
    .filter(t => t.about === x.id && !Record.discredited(t))
    .forEach(t => {
      if (t.kind === 'slip' || t.kind === 'blurt' || t.kind === 'witness') s += VR.strong;
      else if (t.kind === 'vision') s += t.verdict === 'cult' ? VR.dream : -VR.dream;
      else if (t.kind === 'failwatch') s += VR.failwatch;
      else if (((t.kind === 'react' || t.kind === 'words') && t.verdict === 'fear') || t.kind === 'hint') s += VR.flinch;
      else if (t.kind === 'distrust') s += VR.distrust;
      else if (t.kind === 'spite') s += VR.spite;
    });
  return Math.max(0, Math.min(VR.caseCap, s));
};
// a testimony of each kind, as the code writes it (each way it can go)
globalThis.__samples = (from, about, other) => {
  const T = TEMPER_IDS[0];
  return {
    vision: ['cult', 'clean'], distrust: ['cult'], react: ['fear', 'greed', 'calm'], words: ['fear', 'greed', 'calm'],
    slip: ['cult'], blurt: ['1', '1:found'], chill: ['chill'], spite: ['you'], thief: ['smuggler'],
    claim: ['seer', 'warden', 'evade', 'none'], recant: ['seer'], confess: ['2'], tell: ['tell'], failwatch: ['1'],
    mien: [T], temper: [T], bond: ['close:' + other, 'feud:' + other], tip: ['smuggler'], feel: ['like', 'dislike', 'flirt'],
    flirt: ['you', other], hint: ['night'], thinks: ['good', 'bad'], scandal: ['bad', 'kind'], quarrel: [other],
    feast: [other], witness: ['1']
  };
};
// every question asked both ways of everyone: the first that differs, or null
globalThis.__caseDiffers = () => {
  for (const x of S.order.map(C)) {
    const a = __oldCase(x), b = Record.caseAgainst(x);
    if (a !== b) return x.id + ': ' + a + ' then ' + b;
  }
  return null;
};
// ... and again with testimony of every kind, and habits noted, at random (seeded), then all put back as it was
globalThis.__shaken = seed => {
  const keep = [S.testimony.slice(), S.order.map(id => ({ ...C(id).known }))];
  let x = (seed * 2654435761) >>> 0;
  const next = () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296,
    any = a => a[Math.floor(next() * a.length)];
  try {
    const ids = S.order;
    for (let i = 0; i < 40; i++) {
      const from = any(ids), about = any(ids), other = any(ids), all = __samples(from, about, other), kind = any(Object.keys(all));
      S.testimony.push({ day: S.day, from: kind === 'quarrel' || kind === 'feast' ? 'you' : from, about, kind, verdict: any(all[kind]) });
    }
    ids.map(C).forEach(c => Object.keys(c.traits).forEach(k => next() < 0.5 && (c.known[k] = next() < 0.8 ? c.traits[k] : c.known[k])));
    return __caseDiffers();
  } finally {
    S.testimony = keep[0];
    S.order.forEach((id, i) => (C(id).known = keep[1][i]));
  }
};`;

module.exports = {
  'the registry has a row for every kind of testimony the code writes, and none it does not'(k) {
    const written = kindsWritten(),
      registry = k.value('Record.kinds().sort()');
    assert.deepStrictEqual(registry, written);
    assert.strictEqual(written.length, 26);
  },
  'testimony is kept once, whatever the day: the same word again keeps its first day'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [a, b] = S.order, n = S.testimony.length;
      Record.testify(a, b, 'distrust', 'cult');
      S.day = 3;
      Record.testify(a, b, 'distrust', 'cult');
      Record.testify(a, b, 'distrust', 'clean');
      return S.testimony.slice(n).map(t => [t.kind, t.verdict, t.day]);
    })()`);
    assert.deepStrictEqual(r, [
      ['distrust', 'cult', 1],
      ['distrust', 'clean', 3]
    ]);
  },
  'every kind tells itself: on the card, and in its list of the casebook, in both languages'(k) {
    k.run(BEFORE);
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const [from, about, other] = S.order, a = C(about), out = [];
      const all = __samples(from, about, other);
      for (const kind of Record.kinds())
        for (const verdict of all[kind]) {
          const t = { day: 1, from: kind === 'quarrel' || kind === 'feast' ? 'you' : from, about, kind, verdict }, K = Record.kind(kind);
          S.testimony.push(t);
          for (const lang of ['en', 'ru'])
            __k.inLang(lang, () => {
              const chip = K.chip(t, a, C(from).short, from);
              const told = ['noticed', 'testimony', 'saying'].filter(w => K[w]).map(w => (w === 'noticed' ? K.noticed(t, a) : K[w](t)));
              out.push([kind, verdict, lang, chip === null || (Array.isArray(chip) && typeof chip[1] === 'string' && X(chip[1]).length > 0), told.every(s => typeof s === 'string' && X(s).length > 0)]);
            });
        }
      return out;
    })()`);
    assert.ok(r.length >= 26 * 2, `told ${r.length}`);
    r.forEach(([kind, verdict, lang, chip, told]) => {
      assert.ok(chip, `${kind}, ${verdict}: its chip (${lang})`);
      assert.ok(told, `${kind}, ${verdict}: its lines (${lang})`);
    });
  },
  'the case against someone, by the registry, as it was, at every fourth step of twenty seasons'(k) {
    k.run(BEFORE);
    let asked = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const pick = chooser(seed);
      k.start(seed, ['philologist', 'soldier', 'occultist'][seed % 3], seed % 2 === 1);
      for (let n = 0; n < 400 && !k.ended() && k.choices(); n++) {
        if (n % 4 === 0) {
          asked++;
          const d = k.value('__caseDiffers()'),
            e = k.value(`__shaken(${seed * 1000 + n})`);
          assert.strictEqual(d, null, `seed ${seed}, step ${n}: ${d}`);
          assert.strictEqual(e, null, `seed ${seed}, step ${n}, testimony and habits at random: ${e}`);
        }
        k.choose(pick(k.choices()));
      }
    }
    assert.ok(asked > 300, `asked ${asked} times`);
  }
};
