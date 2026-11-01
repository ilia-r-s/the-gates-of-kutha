// Research only: fit one danger score to the five reviewed decisions, then compare
// paired 3,150-season training and fresh sets. Never changes the shipped game.
// node sim/threat.js --file=reviewed.html --out=study.json
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { openNode, args } = require('../test/lib/harness');
const { fit, loss } = require('./lib/threat');
const A = args({ file: '', out: '', seasons: 150, seeds: '7001,8001,9001', fresh: '17001,18001,19001' }),
  POLS = ['human', 'sleuth', 'scholar', 'quiet', 'inquisitor', 'confidant', 'delver'];
if (!A.file || !A.out) throw new Error('An explicitly preserved --file and an --out report are required');
const seeds = name => String(A[name]).split(',').map(Number);
async function measure(set, model, collect) {
  const { page, errors } = await openNode(null, { file: A.file, seed: 4242 });
  await page.addScriptTag({ path: path.resolve(__dirname, 'lib/threat.js') });
  try {
    const result = await page.evaluate(
      ({ seeds, N, pols, model, collect }) => {
        const examples = new Map(),
          rows = [];
        __threatStudy.install(
          model,
          collect
            ? row => {
                const key = JSON.stringify(row),
                  previous = examples.get(key);
                if (previous) previous.count++;
                else examples.set(key, { ...row, count: 1 });
              }
            : null
        );
        for (const base of seeds)
          for (const pol of pols)
            for (let g = 0; g < N; g++) {
              const seed = (base + Math.imul(g, 2654435761)) >>> 0,
                policy = __T.policies.human(__T.rng(seed ^ 0x9e3779b9), __T.LEANS[pol] || null);
              __T.start(g % 3, false, seed);
              if (!__T.play(policy, { maxSteps: 1500 })) throw new Error('Stuck season ' + seed + '/' + pol);
              const seer = S.order.map(C).find(c => c.role === 'seer'),
                nights = Object.entries(S.nights)
                  .filter(([d, n]) => +d > 0 && n.target)
                  .map(([day, n]) => ({ day: +day, target: n.target, why: n.why }));
              rows.push({
                seed,
                pol,
                ending: S.ended,
                id: S.endId,
                day: S.day,
                won: ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
                seerAlive: !!seer && seer.status !== 'taken',
                quiet: S.log.quiet.length,
                dreamerTargets: nights.filter(n => n.why?.kind === 'dreamer').length,
                publicAccuserTargets: nights.filter(n => n.why?.kind === 'suspects').length,
                nights,
                debrief: (() => {
                  const lines = [];
                  fxVictims({ add: (_, en) => lines.push(X(en)) });
                  return lines;
                })()
              });
            }
        return { rows, decisions: [...examples.values()] };
      },
      { seeds: set, N: A.seasons, pols: POLS, model, collect }
    );
    if (errors.length) throw new Error(errors.join('\n'));
    return result;
  } finally {
    await page.close();
  }
}
function summary(rows) {
  const n = rows.length,
    sum = k => rows.reduce((a, r) => a + Number(r[k]), 0);
  return {
    seasons: n,
    wins: sum('won'),
    seerAlive: sum('seerAlive'),
    quietNights: sum('quiet'),
    dreamerTargets: sum('dreamerTargets'),
    publicAccuserTargets: sum('publicAccuserTargets'),
    endings: rows.reduce((a, r) => {
      a[r.id] = (a[r.id] || 0) + 1;
      return a;
    }, {})
  };
}
function compare(a, b) {
  if (a.length !== b.length || a.some((r, i) => r.seed !== b[i].seed || r.pol !== b[i].pol)) throw new Error('Unpaired experiment');
  return {
    reviewed: summary(a),
    common: summary(b),
    changedEnding: a.filter((r, i) => r.id !== b[i].id).length,
    changedNightTargets: a.filter((r, i) => JSON.stringify(r.nights.map(n => n.target)) !== JSON.stringify(b[i].nights.map(n => n.target)))
      .length,
    changedReasons: a.filter((r, i) => JSON.stringify(r.nights) !== JSON.stringify(b[i].nights)).length
  };
}
(async () => {
  const start = performance.now(),
    reviewed = await measure(seeds('seeds'), null, true);
  console.log('Reviewed training seasons completed: ' + reviewed.rows.length);
  const fitted = fit(reviewed.decisions);
  console.log('Fitted model: ' + JSON.stringify(fitted));
  const fresh = await measure(seeds('fresh'), null, true),
    common = await measure(seeds('seeds'), fitted.model, false),
    commonFresh = await measure(seeds('fresh'), fitted.model, false),
    report = {
      artifact: path.resolve(A.file),
      sha256: createHash('sha256').update(fs.readFileSync(A.file)).digest('hex'),
      seeds: seeds('seeds'),
      freshSeeds: seeds('fresh'),
      seasonsPerPolicyAndSeed: A.seasons,
      features: [
        'shown public opposition',
        'distinct known guilty dreams',
        'recorded heard private non-dream words',
        'public non-dream accusations'
      ],
      fitted,
      activeFidelity: loss(
        reviewed.decisions.filter(r => r.x.some(f => f.some(Boolean))),
        fitted.model
      ),
      freshActiveFidelity: loss(
        fresh.decisions.filter(r => r.x.some(f => f.some(Boolean))),
        fitted.model
      ),
      freshFidelity: loss(fresh.decisions, fitted.model),
      training: compare(reviewed.rows, common.rows),
      fresh: compare(fresh.rows, commonFresh.rows),
      pairedReasons: reviewed.rows
        .map((r, i) => ({ seed: r.seed, pol: r.pol, reviewed: r, common: common.rows[i] }))
        .sort(
          (a, b) =>
            Number(JSON.stringify(b.reviewed.nights) !== JSON.stringify(b.common.nights)) -
            Number(JSON.stringify(a.reviewed.nights) !== JSON.stringify(a.common.nights))
        )
        .slice(0, 20),
      seconds: (performance.now() - start) / 1000
    };
  fs.writeFileSync(path.resolve(A.out), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ model: fitted.model, training: report.training, fresh: report.fresh, seconds: report.seconds }, null, 2));
})();
