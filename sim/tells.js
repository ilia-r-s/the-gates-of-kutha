// How much does what people do say about whether they are of the cult? For each thing a player can see, its rate among
// the cult and among the innocent, and the likelihood ratio (cult ÷ innocent). The project keeps every single tell
// between about 0.5 and 2, so that the cult is found by reasoning over many things, never by counting one.
//   node sim/tells.js                      200 seasons, every family
//   node sim/tells.js 400 --only=nights,faces --seed=7
// Families:
//   nights   each person's account of each night: company, borne out or belied, alone in camp, out alone, out where it
//            happened, would not say, named by others as their company, a sighting given (bystanders compared: the
//            Watcher keeps the camp and the thief is out on business, by design)
//   dreams   among those who say they dream: how often they tell a dream on a given day (any way: before breakfast,
//            aloud, in parting), the true Dreamer and pretenders apart
//   faces    the face in the place picture, the greeting's words and face, an answer's face, at trust 0 and 1
//   answers  answering a dream told aloud for the one it named (people/claims.js, defenderOf), among pretenders
const { run, open, args } = require('../test/lib/harness');
const A = args({ seed: 4242, only: 'nights,dreams,faces,answers', file: 'standalone' });
const N = +(A._[0] || 200);
const ONLY = String(A.only).split(',');

function measure([N, only]) {
  window.sfx = () => {};
  window.musicChange = () => {};
  const T = {}; // name -> group -> [hits, of]
  const add = (name, group, hit) => {
    const t = (T[name] = T[name] || {});
    const g = (t[group] = t[group] || [0, 0]);
    g[1]++;
    if (hit) g[0]++;
  };
  const isCult = c => c.role === 'cult';
  // answers to dreams told aloud, as they are given
  const answered = [],
    told = new Set();
  const td = window.tellDream;
  window.tellDream = function (c, d) {
    told.add(`${c.id}@${S.day}`);
    return td.apply(this, arguments);
  };
  const ow = window.answerWith;
  window.answerWith = function (a, d, c, forOther) {
    if (forOther) answered.push(a.id);
    return ow.apply(this, arguments);
  };
  const rnd = __T.lcg(31337),
    human = __T.policies.human(rnd, /Ask where they were|Ask whom they distrust|Make conversation|Speak with/);
  for (let g = 0; g < N; g++) {
    answered.length = 0;
    told.clear();
    __T.start(g % 3);
    if (!__T.play(human, { maxSteps: 1500 })) continue;
    if (only.includes('nights'))
      Object.entries(S.nights || {}).forEach(([n, rec]) => {
        if (!rec || +n === 0) return;
        Object.keys(rec.claim || {}).forEach(id => {
          const c = C(id),
            cl = rec.claim[id];
          if (cl.attacked || (typeof inYourTent === 'function' && inYourTent(id, +n))) return;
          if (c.role !== 'cult' && c.role !== 'bystander') return;
          const grp = isCult(c) ? 'cult' : 'innocent',
            other = cl.with && rec.claim[cl.with];
          add('claims company', grp, !!cl.with);
          if (cl.with) {
            add('company belied', grp, !!other && other.loc !== 'evade' && other.with !== id);
            add('company borne out', grp, !!other && other.with === id);
          }
          add('alone in camp', grp, !cl.with && cl.loc === 'camp');
          add('out alone', grp, !cl.with && cl.loc !== 'camp' && cl.loc !== 'evade');
          if (rec.crimeLoc && rec.crimeLoc !== 'camp') add('out where it happened', grp, cl.loc === rec.crimeLoc);
          add('would not say', grp, cl.loc === 'evade');
          add(
            'named as company',
            grp,
            Object.keys(rec.claim).some(k => k !== id && rec.claim[k].with === id)
          );
          add('gave a sighting', grp, !!(rec.saw && rec.saw[id]));
        });
      });
    if (only.includes('dreams'))
      S.order.map(C).forEach(c => {
        const cl = claimOf(c);
        if (!(cl.role === 'seer' || cl.was === 'seer') || cl.said == null) return;
        const grp = c.role === 'seer' ? 'true Dreamer' : isCult(c) ? 'cult' : 'innocent';
        for (let d = Math.max(1, cl.said); d <= S.day; d++) add('tells a dream on a day', grp, told.has(`${c.id}@${d}`));
      });
    if (only.includes('answers'))
      S.order.map(C).forEach(c => {
        const cl = claimOf(c);
        if (!(cl.role === 'seer' || cl.was === 'seer') || c.role === 'seer') return;
        add('answered a dream for the one it named (pretenders)', isCult(c) ? 'cult' : 'innocent', answered.includes(c.id));
      });
  }
  if (only.includes('faces')) {
    const warm = new Set(
      Object.values(GREET_WARM)
        .flat()
        .map(t => X(t))
    );
    for (let s = 0; s < Math.ceil(N / 2); s++) {
      newGame('Marlowe', 'philologist');
      freeChars().forEach(c =>
        [0, 1].forEach(rap => {
          c.rapport = rap;
          const grp = isCult(c) ? 'cult' : 'innocent';
          for (let d = 1; d <= 5; d++)
            for (let sl = 0; sl < 3; sl++) {
              S.day = d;
              S.slot = sl;
              const m = castMood(c);
              add(`place picture smiles (trust ${rap})`, grp, m === 'smile');
              delete c.greeted;
              const gr = greeting(c);
              add(`warm greeting (trust ${rap})`, grp, warm.has(X(gr.text)));
              add(`warm face in answer (trust ${rap})`, grp, ['smile', 'warm'].includes(faceFor(c, 'neutral')));
            }
        })
      );
    }
  }
  return T;
}

run(async browser => {
  const { page, errors } = await open(browser, { file: A.file, seed: A.seed, mathSeed: A.seed });
  const T = await page.evaluate(measure, [N, ONLY]);
  const pct = ([k, n]) => (n ? `${((100 * k) / n).toFixed(1)}%`.padStart(6) : '   n/a');
  const lines = [`${N} seasons; likelihood ratio = rate among the cult ÷ rate among the innocent (aim: about 0.5–2)`, ''];
  Object.entries(T).forEach(([name, g]) => {
    const c = g.cult || [0, 0],
      i = g.innocent || [0, 0],
      lr = c[1] && i[1] && i[0] ? c[0] / c[1] / (i[0] / i[1]) : NaN,
      flag = Number.isFinite(lr) && (lr < 0.5 || lr > 2) ? '   <-- outside the band' : '';
    const extra = g['true Dreamer'] ? `   true Dreamer ${pct(g['true Dreamer'])}` : '';
    lines.push(
      `${name.padEnd(52)} cult ${pct(c)}   innocent ${pct(i)}   LR ${Number.isFinite(lr) ? lr.toFixed(2) : ' n/a'}${extra}${flag}`
    );
  });
  if (errors.length) lines.push('', `${errors.length} page errors, first: ${errors[0]}`);
  return lines.join('\n');
});
