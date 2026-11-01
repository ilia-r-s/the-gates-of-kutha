// Paired actual seasons: a reader of delivered nature signs versus the same
// observer ignoring them. No hidden nature or role enters either policy.
// node sim/nature.js --seasons=3150 --seed=19073 --out=results.json
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openNode, args, FILE } = require('../test/lib/harness');
const A = args({ seasons: 3150, seed: 19073, out: '', file: '' });
if (!Number.isInteger(+A.seasons) || +A.seasons < 1 || !Number.isInteger(+A.seed) || +A.seed < 0 || +A.seed > 0xffffffff)
  throw Error('Positive season count and unsigned seed required');
async function main() {
  const { page, errors } = await openNode(null, { file: A.file });
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    const result = await page.evaluate(
      ({ n, seed }) => {
        const ways = {
          bold: /face|strike|knock|stand your ground/i,
          humble: /bow|kneel|lower your head/i,
          truth: /truth|your own name/i,
          guile: /lie|false name|invent/i,
          haste: /hurry|run|leap|quick/i,
          patience: /slow|wait|listen|careful/i,
          offer: /offer|give|leave .* behind/i,
          water: /water|drink|pour/i,
          light: /raise .*lamp|light .*lamp|keep .*light/i,
          take: /take .*seal|take .*bread|steal/i,
          refuse: /refuse|do not drink|leave .*untouched/i,
          bronze: /bronze|knife|blade/i,
          word: /read|recite|written|speak .*word/i,
          break: /break|smash|shatter/i
        };
        const totals = [],
          rows = [];
        for (const reads of [false, true]) {
          const t = {
            reads,
            seasons: n,
            wins: 0,
            descended: 0,
            finished: 0,
            choicesChanged: 0,
            encounters: { favorable: 0, costly: 0, neutral: 0 },
            favor: 0,
            signs: 0,
            observedWays: 0,
            correctObserved: 0,
            wrongObserved: 0,
            neutralObserved: 0,
            channels: {},
            byWay: Object.fromEntries(
              NatureSigns.ways.map(way => [way, { signs: 0, seasons: 0, tied: 0, correct: 0, wrong: 0, neutral: 0 }])
            )
          };
          for (let i = 0; i < n; i++) {
            const season = (seed + Math.imul(i, 2654435761)) >>> 0,
              base = __observer(__T.rng(season ^ 0x9e3779b9), 'mixed', { careful: true });
            __T.start(i % 3, false, season);
            const policy = bs => {
              const ordinary = base(bs);
              if (!reads || S.phase !== 'descent') return ordinary;
              const evidence = {};
              NatureSigns.record().forEach(r => (evidence[r.way] = (evidence[r.way] || 0) + (r.good ? 1 : -1)));
              const labels = __T.observe(bs).choices,
                scores = labels.map(label =>
                  Object.entries(ways).reduce((v, [way, re]) => v + (re.test(label) ? evidence[way] || 0 : 0), 0)
                ),
                best = Math.max(...scores),
                old = scores[bs.indexOf(ordinary)];
              if (best <= (old || 0)) return ordinary;
              t.choicesChanged++;
              return bs[scores.indexOf(best)];
            };
            if (__T.play(policy, { maxSteps: 1500 })) t.finished++;
            const won = ['exposed', 'triumph', 'pyrrhic'].includes(S.ended);
            if (won) t.wins++;
            if (S.fin) t.descended++;
            t.favor += S.fin?.favour || 0;
            for (const encounter of S.fin?.enc || [])
              t.encounters[encounter.sign === 'p' ? 'favorable' : encounter.sign === 'm' ? 'costly' : 'neutral']++;
            const evidence = {};
            for (const r of NatureSigns.record()) {
              evidence[r.way] = (evidence[r.way] || 0) + (r.good ? 1 : -1);
              t.signs++;
              t.byWay[r.way].signs++;
              t.channels[r.channel] = (t.channels[r.channel] || 0) + 1;
            }
            // Truth is accessed only after play to score what the signs suggested.
            for (const [way, tally] of Object.entries(evidence)) {
              const w = t.byWay[way];
              w.seasons++;
              if (!tally) {
                w.tied++;
                continue;
              }
              const truth = NATURE[S.aspectOf[S.patron]][way] || 0;
              t.observedWays++;
              if (!truth) {
                t.neutralObserved++;
                w.neutral++;
              } else if (Math.sign(tally) === truth) {
                t.correctObserved++;
                w.correct++;
              } else {
                t.wrongObserved++;
                w.wrong++;
              }
            }
            rows.push({ reads, season, won, end: S.ended, descended: !!S.fin, encounters: S.fin?.enc?.length || 0 });
          }
          totals.push(t);
        }
        return { seed, totals, rows };
      },
      { n: +A.seasons, seed: +A.seed }
    );
    if (errors.length || result.totals.some(t => t.finished !== t.seasons)) throw Error('Nature study did not finish every season');
    const baseline = result.rows.filter(r => !r.reads),
      reader = new Map(result.rows.filter(r => r.reads).map(r => [r.season, r]));
    const differences = baseline.map(r => Number(reader.get(r.season).won) - Number(r.won)),
      mean = differences.reduce((a, b) => a + b, 0) / differences.length,
      se =
        differences.length > 1
          ? Math.sqrt(differences.reduce((sum, d) => sum + (d - mean) ** 2, 0) / (differences.length * (differences.length - 1)))
          : Infinity;
    result.pairedWins = {
      difference: mean,
      interval95: [mean - 1.96 * se, mean + 1.96 * se],
      gained: differences.filter(d => d > 0).length,
      lost: differences.filter(d => d < 0).length
    };
    result.artifactSha256 = crypto
      .createHash('sha256')
      .update(fs.readFileSync(A.file || FILE))
      .digest('hex');
    if (A.out) fs.writeFileSync(A.out, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ seed: result.seed, totals: result.totals, pairedWins: result.pairedWins }, null, 2));
  } finally {
    await page.close();
  }
}
main().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
