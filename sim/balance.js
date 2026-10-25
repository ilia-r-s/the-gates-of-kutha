// How seasons end, played as people would: every policy plays its seasons on the built page, and the summary gives the
// odds of defeat, a hard win and a clean win (Wilson 95% intervals), how the defeats come, and every ending's odds. The
// figures in RULES.md ("How seasons end") and the rulebook ("How often each ending comes") are this script's output.
//   node sim/balance.js                       the published run: 7 ways of playing × 150 seasons × 3 seeds = 3,150
//   node sim/balance.js --seasons=50 --seeds=1 --pols=human,cheat
//   node sim/balance.js --rules='{"night":{"priestless":0.5}}'    the same with numbers in rules.js changed
//   node sim/balance.js --by=mood,power,bg,style --out=rows.json  breakdowns, and every season as JSON
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
              const r = S.ended ? endReckon() : null;
              out.push({
                pol,
                ok,
                id: S.endId || 'stuck',
                kind: S.ended || 'stuck',
                day: S.day,
                fin: !!S.fin,
                mood: Object.entries(days).sort((a, b) => b[1] - a[1])[0][0],
                power: S.patron,
                bg: S.bg,
                style: r ? endStyle(r) : null,
                score: r ? r.score : null
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
