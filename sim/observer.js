// Paired actual play: the same casebook policy with/without visible-condition
// recovery, separately for cult, puzzle and mixed priorities. No hidden answers.
// Default: 1,050 seeds × 3 modes × 2 policies = 6,300 complete expeditions.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openNode, args, FILE } = require('../test/lib/harness');
const A = args({ seasons: 1050, seed: 19073, out: '', file: '' });
const n = +A.seasons,
  seed = +A.seed;
if (!Number.isInteger(n) || n < 1 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Invalid seasons or seed');
async function main() {
  const { page, errors } = await openNode(null, { file: A.file });
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    const result = await page.evaluate(
      ({ n, seed }) => {
        const rows = [],
          totals = [];
        for (const careful of [false, true])
          for (const mode of ['cult', 'puzzle', 'mixed']) {
            const t = { careful, mode, seasons: n, finished: 0, wins: 0, madness: 0, rest: 0, brandy: 0, descent: 0, ends: {} };
            for (let i = 0; i < n; i++) {
              const season = (seed + Math.imul(i, 2654435761)) >>> 0,
                policy = __observer(__T.rng(season ^ 0x9e3779b9), mode, { careful });
              let rest = 0,
                brandy = 0;
              __T.start(i % 3, false, season);
              if (
                __T.play(
                  bs => {
                    const chosen = policy(bs),
                      label = __T.observe(bs).choices[bs.indexOf(chosen)];
                    if (/Rest in your tent/.test(label)) rest++;
                    if (/Drink from the brandy/.test(label)) brandy++;
                    return chosen;
                  },
                  { maxSteps: 1500 }
                )
              )
                t.finished++;
              const won = ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
                madness = S.ended === 'madness';
              t.wins += won;
              t.madness += madness;
              t.rest += rest;
              t.brandy += brandy;
              t.descent += !!S.fin;
              t.ends[S.ended] = (t.ends[S.ended] || 0) + 1;
              rows.push({ careful, mode, season, won, madness, ended: S.ended, rest, brandy, descended: !!S.fin });
            }
            totals.push(t);
          }
        return { seed, totals, rows };
      },
      { n, seed }
    );
    if (errors.length || result.totals.some(t => t.finished !== t.seasons)) throw Error('Observer study did not finish every season');
    const paired = ['cult', 'puzzle', 'mixed'].map(mode => {
      const base = result.rows.filter(r => !r.careful && r.mode === mode),
        changed = new Map(result.rows.filter(r => r.careful && r.mode === mode).map(r => [r.season, r]));
      const compare = field => {
        const differences = base.map(r => Number(changed.get(r.season)[field]) - Number(r[field])),
          mean = differences.reduce((a, b) => a + b, 0) / differences.length,
          se =
            differences.length > 1
              ? Math.sqrt(differences.reduce((v, d) => v + (d - mean) ** 2, 0) / (differences.length * (differences.length - 1)))
              : Infinity;
        return {
          difference: mean,
          interval95: [mean - 1.96 * se, mean + 1.96 * se],
          gained: differences.filter(d => d > 0).length,
          lost: differences.filter(d => d < 0).length
        };
      };
      return { mode, seasons: base.length, wins: compare('won'), madness: compare('madness') };
    });
    const report = {
      ...result,
      paired,
      artifactSha256: crypto
        .createHash('sha256')
        .update(fs.readFileSync(A.file || FILE))
        .digest('hex')
    };
    if (A.out) fs.writeFileSync(A.out, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ seed, totals: result.totals, paired }, null, 2));
  } finally {
    await page.close();
  }
}
main().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
