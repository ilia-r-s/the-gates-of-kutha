// Exact artifact-to-artifact comparison for a behavior-preserving framework change.
// node sim/framework.js --before=.local/review/29/rare-integrated.html --out=.local/review/29/framework-proof.json
// One bounded expedition is held at a time; only digests and concise differences are retained.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { openNode, args, FILE } = require('../test/lib/harness');
const { cases, caseId, play, fingerprint } = require('../test/lib/season');
const A = args({ before: '', after: FILE, fresh: 48, seed: 79213, out: '' });
if (!A.before || !A.out || !Number.isInteger(+A.fresh) || +A.fresh < 0 || !Number.isInteger(+A.seed))
  throw Error('--before, --out, nonnegative --fresh and integer --seed required');
const sha = text => createHash('sha256').update(text).digest('hex');
async function run(file, input) {
  const { page, errors } = await openNode(null, { file, seed: input.seed, mathSeed: input.seed });
  try {
    await page.evaluate('window.__equivalencePlay = ' + play.toString() + '; null;');
    const start = performance.now();
    const result = await page.evaluate(input => {
      const scenes = [],
        explanations = [],
        originalShow = show,
        originalTrace = traceDie;
      show = sc => {
        originalShow(sc);
        const dice = [_seed, _words];
        scenes.push([
          X(sc.kicker || ''),
          X(sc.title || ''),
          X(sc.sub || ''),
          X((sc.body || []).join('')),
          (sc.choices || []).map(c => [X(c.label || c.html || ''), X(typeof c.sub === 'function' ? c.sub() : c.sub || ''), c.cls || '']),
          sceneSVG(artFor(sc), 'equivalence-')
        ]);
        if (_seed !== dice[0] || _words !== dice[1]) throw Error('Presentation consumed seeded dice');
      };
      traceDie = (...values) => {
        originalTrace(...values);
        if (TRACE) explanations.push(TRACE_WHY ? JSON.parse(JSON.stringify(TRACE_WHY)) : null);
      };
      try {
        return { ...__equivalencePlay(input), scenes, explanations };
      } finally {
        show = originalShow;
        traceDie = originalTrace;
      }
    }, input);
    if (!result.ended || errors.length) throw Error('Unfinished/error expedition ' + caseId(input));
    return { hashes: fingerprint(result), scenes: result.scenes.length, dice: result.dice.length, ms: performance.now() - start };
  } finally {
    await page.close();
  }
}
async function main() {
  const inputs = cases.concat(
    Array.from({ length: +A.fresh }, (_, i) => ({
      seed: (+A.seed + Math.imul(i, 2654435761)) >>> 0,
      bg: i % 3,
      hardcore: i % 4 === 0,
      lang: i % 2 ? 'ru' : 'en'
    }))
  );
  const rows = [],
    timings = { before: 0, after: 0 };
  let observedRss = 0;
  for (const [i, input] of inputs.entries()) {
    const result = {};
    for (const side of i % 2 ? ['after', 'before'] : ['before', 'after']) {
      result[side] = await run(A[side], input);
      timings[side] += result[side].ms;
      observedRss = Math.max(observedRss, process.memoryUsage().rss);
    }
    const changed = Object.keys(result.before.hashes).filter(k => result.before.hashes[k] !== result.after.hashes[k]);
    rows.push({ case: caseId(input), changed, scenes: result.after.scenes, dice: result.after.dice, hashes: result.after.hashes });
  }
  const artifact = file => ({ bytes: fs.statSync(file).size, sha256: sha(fs.readFileSync(file)) });
  const report = {
    before: artifact(A.before),
    after: artifact(A.after),
    originalCases: cases.length,
    freshCases: +A.fresh,
    freshSeed: +A.seed,
    cases: rows.length,
    mismatches: rows.filter(r => r.changed.length),
    scenes: rows.reduce((n, r) => n + r.scenes, 0),
    dice: rows.reduce((n, r) => n + r.dice, 0),
    timings,
    observedRss,
    rows
  };
  fs.mkdirSync(path.dirname(A.out), { recursive: true });
  fs.writeFileSync(A.out, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, rows: undefined }));
  if (report.mismatches.length) process.exitCode = 1;
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
