// Paired fixed-seed experiments, using actual shipped seasons. No tuning is
// written back automatically. --study=soldier (4000 each) or pressure (3150 each).
const fs = require('node:fs');
const path = require('node:path');
const { openNode, args } = require('../test/lib/harness');
const A = args({ study: 'soldier', seasons: 0, seed: 27449, file: '', out: '' });
async function main() {
  const { page, errors } = await openNode(null, { file: A.file });
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    const result = await page.evaluate(
      ({ study, count, seed }) => {
        const variants =
            study === 'soldier'
              ? {
                  current: {},
                  noPress: { talk: { pressSoldier: 0 } },
                  eye: { talk: { pressSoldier: 0.05 }, examine: { soldier: 0.15 } }
                }
              : {
                  reviewed: { adapt: { gain: 0.5 }, night: { target: { base: 0.06, day: 0.01 } } },
                  adaptive: { adapt: { gain: 0.75 }, night: { target: { base: 0.08, day: 0.012 } } }
                },
          n = count || (study === 'soldier' ? 4000 : 3150),
          original = JSON.stringify(RULES),
          rows = [],
          totals = [];
        const deep = (a, b) =>
          Object.entries(b).forEach(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? deep(a[k], v) : (a[k] = v)));
        for (const [variant, patch] of Object.entries(variants)) {
          Object.assign(RULES, JSON.parse(original));
          deep(RULES, patch);
          const t = { variant, seasons: n, wins: 0, finished: 0, press: 0, examined: 0, attacks: 0, taken: 0, quiet: 0, ends: {} };
          for (let i = 0; i < n; i++) {
            const season = (seed + Math.imul(i, 2654435761)) >>> 0,
              random = __T.rng(season ^ 0x9e3779b9),
              policy =
                study === 'soldier'
                  ? __T.policies.human(random, __T.LEANS.inquisitor)
                  : __observer(random, ['cult', 'puzzle', 'mixed'][i % 3], { careful: true });
            __T.start(study === 'soldier' ? 1 : i % 3, false, season);
            if (__T.play(policy, { maxSteps: 1500 })) t.finished++;
            const won = ['exposed', 'triumph', 'pyrrhic'].includes(S.ended);
            if (won) t.wins++;
            t.press += S.log.press;
            t.examined += S.log.examineOk;
            t.attacks += S.log.attacks.length;
            t.taken += S.stats.taken;
            t.quiet += S.log.quiet.length;
            t.ends[S.ended] = (t.ends[S.ended] || 0) + 1;
            rows.push({ variant, season, won, ended: S.ended, wounds: S.wounds, nerve: S.nerve });
          }
          totals.push(t);
        }
        return { study, seed, variants, totals, rows };
      },
      { study: A.study, count: +A.seasons, seed: +A.seed }
    );
    if (errors.length || result.totals.some(t => t.finished !== t.seasons)) throw Error('Difficulty study did not finish every season');
    if (A.out) fs.writeFileSync(A.out, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ study: result.study, seed: result.seed, variants: result.variants, totals: result.totals }, null, 2));
  } finally {
    await page.close();
  }
}
main().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
