// How seasons end, played as people would: every policy plays its seasons on the built page, and the summary gives the
// odds of defeat, a hard win and a clean win (Wilson 95% intervals), how the defeats come, and every ending's odds. The
// figures in RULES.md ("How seasons end") and the rulebook ("How often each ending comes") are this script's output.
//   node sim/balance.js                       the published run: 7 ways of playing × 150 seasons × 3 seeds = 3,150
//   node sim/balance.js --seasons=50 --seeds=1 --pols=human,cheat
//   node sim/balance.js --rules='{"night":{"priestless":0.5}}'    the same with numbers in rules.js changed
//   node sim/balance.js --by=bg,nature,mood,mood0,power,style --out=rows.json  breakdowns (mood: the one that lasted
//        longest; mood0: the one the season began in), and every season as JSON
// Policies (test/lib/inpage.js): human (a person's habits) and the same with a lean (sleuth, scholar, quiet, inquisitor,
// confidant, delver); cheat (knows the cult) and random, for comparison only. Each seed's policies play side by side.
const fs = require('fs');
const path = require('path');
const { launch, open, args } = require('../test/lib/harness');
const A = args({
  seasons: 150,
  seeds: '7001,8001,9001',
  pols: 'human,sleuth,scholar,quiet,inquisitor,confidant,delver',
  file: 'standalone',
  rules: '',
  by: '',
  out: ''
});
const SEEDS = String(A.seeds).split(',').map(Number),
  POLS = String(A.pols).split(',');

// every season's ending, as a row
async function play(browser, seed) {
  return (
    await Promise.all(
      POLS.map(async (pol, pi) => {
        const s = seed + 37 * pi;
        const { page, errors } = await open(browser, { file: A.file, seed: s, mathSeed: s });
        const rows = await page.evaluate(
          ([N, pol, rules]) => {
            const deep = (a, b) =>
              Object.keys(b).forEach(k => (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? deep(a[k], b[k]) : (a[k] = b[k])));
            if (rules) deep(RULES, JSON.parse(rules));
            window.sfx = () => {};
            window.musicChange = () => {};
            const rnd = __T.lcg(17);
            const P =
              pol === 'cheat'
                ? __T.policies.cheat(rnd)
                : pol === 'random'
                  ? __T.policies.random(rnd)
                  : __T.policies.human(rnd, __T.LEANS[pol] || null);
            const out = [];
            for (let g = 0; g < N; g++) {
              __T.start(g % 3);
              const ok = __T.play(P, { maxSteps: 1500 });
              // the mood that lasted longest
              const days = {};
              S.tenor.log.forEach((x, i) => {
                const end = i + 1 < S.tenor.log.length ? S.tenor.log[i + 1].day : S.day + 1;
                days[x.mood] = (days[x.mood] || 0) + (end - x.day);
              });
              const r = S.ended ? endReckon() : null,
                won = ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
                // (the deaths that came later and the end you chose, as the ending page told them: decided without the
                // dice, so asking again changes nothing: game/fates.js)
                later = S.ended ? Object.values(afterDeaths()) : [],
                // (after a doom, what it did to each of the seven, by where it found them: game/fates.js, doomFates)
                dooms = S.ended === 'doom' ? doomFates() : null,
                last = S.ended ? yourLast(won, Object.fromEntries(later.map(o => [o.id, o]))) : null;
              out.push({
                pol,
                ok,
                id: S.endId || 'stuck',
                kind: S.ended || 'stuck',
                day: S.day,
                fin: !!S.fin,
                mood: Object.entries(days).sort((a, b) => b[1] - a[1])[0][0],
                mood0: S.tenor.log[0].mood, // (the mood the season began in)
                power: S.patron,
                nature: S.aspectOf[S.patron],
                bg: S.bg,
                taken: S.order.filter(id => C(id).status === 'taken').length,
                later: later.length,
                laterChosen: later.filter(o => o.kind === 'chosen').length,
                chose: last ? last.where : null,
                style: r ? endStyle(r) : null,
                score: r ? r.score : null,
                tier: r ? endTier(won, r.score, RULES.reckoning.tiers, !!r.blood) : null,
                // the season in numbers, and its rarer turns: a scribe's error read, a stray sign seen, a habit noted
                // that was only that day's
                wounds: S.log.woundsTaken,
                nerveLost: S.log.nerveLost,
                scribe: S.factKnown.some(i => S.facts[i].scribe),
                stray: S.omenLog.some(o => o.stray),
                misnoted: S.order.map(C).some(c => CATS.some(k => c.known[k] && c.known[k] !== c.traits[k])),
                doom: dooms
                  ? S.order.map(id => {
                      const c = C(id),
                        d = dooms[id];
                      if (c.status === 'taken') return ['dead', d ? 'unburied' : 'buried'];
                      return [c.role === 'cult' ? (c.status === 'exposed' ? 'cell' : 'cult') : doomAt(c), d ? d.kind : 'none'];
                    })
                  : null
              });
            }
            return out;
          },
          [A.seasons, pol, A.rules]
        );
        if (errors.length) console.error(`${pol} (seed ${s}): ${errors.length} page errors, first: ${errors[0]}`);
        await page.close();
        return rows;
      })
    )
  ).flat();
}

// ---------- the summary ----------
const CLEAN = ['unopened', 'sealed', 'banished', 'emptied'],
  HARD = ['shot', 'burned', 'scarred'];
const cls = r => (CLEAN.includes(r.id) ? 'clean' : HARD.includes(r.id) ? 'hard' : 'defeat');
function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0, 0];
  const p = k / n,
    d = 1 + (z * z) / n,
    c = (p + (z * z) / (2 * n)) / d,
    h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [p, Math.max(0, c - h), Math.min(1, c + h)];
}
const pct = (k, n) => {
  const [p, lo, hi] = wilson(k, n);
  return `${(100 * p).toFixed(1).padStart(5)}% (${(100 * lo).toFixed(1)}–${(100 * hi).toFixed(1)})`;
};
const count = (rs, f) => rs.reduce((m, r) => ((m[f(r)] = (m[f(r)] || 0) + 1), m), {});
function line(title, rs) {
  const n = rs.length,
    c = count(rs, cls),
    k = count(rs, r => r.kind);
  return (
    `${title.padEnd(12)} n=${String(n).padStart(5)}  defeat ${pct(c.defeat || 0, n)}  hard ${pct(c.hard || 0, n)}  clean ${pct(c.clean || 0, n)}` +
    `   rite ${pct(k.doom || 0, n)}  death ${pct(k.death || 0, n)}  madness ${pct(k.madness || 0, n)}  sent away ${pct(k.expelled || 0, n)}` +
    `  went down ${pct(rs.filter(r => r.fin).length, n)}`
  );
}
function summary(rows) {
  const out = [line('ALL', rows)];
  POLS.forEach(p =>
    out.push(
      line(
        p,
        rows.filter(r => r.pol === p)
      )
    )
  );
  const n = rows.length,
    ended = rows.filter(r => r.ok),
    mad = rows.filter(r => r.kind === 'madness'),
    chose = rows.filter(r => r.chose),
    later = rows.filter(r => r.later),
    deaths = rows.reduce((t, r) => t + r.later, 0);
  out.push(
    '',
    `Taken by the night: ${(rows.reduce((t, r) => t + r.taken, 0) / n).toFixed(2)} of the camp a season`,
    `The end you chose: ${pct(chose.length, n)} of seasons; ${chose.filter(r => r.kind === 'madness').length} of them after a madness ending (${pct(chose.filter(r => r.kind === 'madness').length, mad.length || 1)} of those)`,
    `A death that came later: ${pct(later.length, n)} of seasons (two or more: ${pct(rows.filter(r => r.later > 1).length, n)}); by their own hand ${deaths ? ((100 * rows.reduce((t, r) => t + r.laterChosen, 0)) / deaths).toFixed(0) : 0}% of ${deaths}`,
    `Ended: ${ended.length} of ${n}`
  );
  // the season in numbers, on average, and its rarer turns
  const mean = f => (rows.reduce((t, r) => t + (r[f] || 0), 0) / n).toFixed(1);
  out.push(
    '',
    `On average: ${mean('wounds')} wounds taken, ${mean('nerveLost')} nerve lost`,
    `A scribe's error read: ${pct(rows.filter(r => r.scribe).length, n)}; a stray sign seen: ${pct(rows.filter(r => r.stray).length, n)}; a habit noted that was only that day's: ${pct(rows.filter(r => r.misnoted).length, n)}`
  );
  // how cleanly each outcome was done (the conduct score's tier: game/endings.js, endTier)
  out.push('', 'Conduct, by outcome:');
  ['clean', 'hard', 'defeat'].forEach(o => {
    const rs = rows.filter(r => r.tier && cls(r) === o),
      t = count(rs, r => r.tier);
    out.push(
      `  ${o.padEnd(7)} n=${String(rs.length).padStart(4)}  ` +
        ['clean', 'steady', 'costly', 'ruinous', 'close', 'far']
          .filter(k => t[k])
          .map(k => `${k} ${((100 * t[k]) / rs.length).toFixed(0)}%`)
          .join(' · ')
    );
  });
  out.push('', 'The style the ending names:');
  Object.entries(
    count(
      rows.filter(r => r.style),
      r => r.style
    )
  )
    .sort((a, b) => b[1] - a[1])
    .forEach(([st, k]) => out.push(`  ${st.padEnd(14)} ${pct(k, n)}`));
  // after a doom: what it did to each of the seven, by where the end found them
  const dooms = rows.filter(r => r.doom);
  if (dooms.length) {
    out.push('', `After a doom (${dooms.length} seasons), by where the end found each of the seven:`);
    const by = {};
    dooms.forEach(r =>
      r.doom.forEach(([at, kind]) => {
        const b = (by[at] = by[at] || {});
        b[kind] = (b[kind] || 0) + 1;
      })
    );
    ['heart', 'stair', 'camp', 'away', 'cult', 'cell', 'dead']
      .filter(at => by[at])
      .forEach(at => {
        const n = Object.values(by[at]).reduce((a, b) => a + b, 0);
        out.push(
          `  ${at.padEnd(6)} n=${String(n).padStart(4)}  ` +
            Object.entries(by[at])
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => `${k} ${((100 * v) / n).toFixed(0)}%`)
              .join(' · ')
        );
      });
  }
  out.push('', 'Every ending:');
  Object.entries(count(rows, r => r.id))
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, k]) => out.push(`  ${id.padEnd(14)} ${pct(k, rows.length)}`));
  String(A.by)
    .split(',')
    .filter(Boolean)
    .forEach(f => {
      out.push('', `By ${f}:`);
      [...new Set(rows.map(r => r[f]))].sort().forEach(v =>
        out.push(
          line(
            '  ' + v,
            rows.filter(r => r[f] === v)
          )
        )
      );
    });
  const stuck = rows.filter(r => !r.ok).length;
  if (stuck) out.push('', `${stuck} seasons got stuck`);
  return out.join('\n');
}

(async () => {
  const browser = await launch();
  const rows = [];
  try {
    for (const seed of SEEDS) rows.push(...(await play(browser, seed)));
  } finally {
    await browser.close();
  }
  if (A.out) fs.writeFileSync(path.resolve(A.out), JSON.stringify(rows));
  console.log(summary(rows));
})();
