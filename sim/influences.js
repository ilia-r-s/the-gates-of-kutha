// Tooling-only sparse registry prototype: one real odds decision, identical step
// order and trace. This is not a second production rules engine.
const assert = require('node:assert/strict');
const { openNode } = require('../test/lib/harness');
async function main() {
  const { page } = await openNode(null);
  try {
    const r = await page.evaluate(() => {
      const registry = {
          base: { knows: 'rule', value: () => RULES.confide.odds },
          trust: { knows: 'subject: own trust', value: c => RULES.confide.trust * c.rapport },
          temper: { knows: 'subject: own temperament', value: c => TP(c).confide },
          affinity: { knows: 'subject: own part; player background', value: c => cultOf(c, 'listen') },
          repeated: { knows: 'subject: confidences received', value: c => RULES.confide.again * Ties.confidences(c) },
          bounds: { knows: 'rule', value: () => [RULES.confide.min, RULES.confide.max] }
        },
        steps = [
          ['base', 'base'],
          ['+ trust in you', 'trust'],
          ['+ temperament', 'temper'],
          ['+ the cult, to an occultist', 'affinity'],
          ['- confidences taken already', 'repeated'],
          ['clamp', 'bounds']
        ],
        candidate = odds(
          TAKES_CONFIDENCE.name,
          steps.map(([label, key]) => [label, registry[key].value])
        ),
        baseline = { ...TAKES_CONFIDENCE },
        mismatch = [];
      function play(use, seed) {
        Object.assign(TAKES_CONFIDENCE, use);
        __T.start(seed % 3, false, seed);
        TRACE = [];
        const finished = __T.play(__T.policies.human(__T.rng(seed)), { maxSteps: 1500 });
        const r = JSON.stringify([finished, S, _seed, _words, TRACE]);
        TRACE = null;
        return r;
      }
      for (let i = 0; i < 48; i++) {
        const seed = (4242 + Math.imul(i, 2654435761)) >>> 0;
        if (play(baseline, seed) !== play(candidate, seed)) mismatch.push(seed);
      }
      Object.assign(TAKES_CONFIDENCE, baseline);
      newGame('Marlowe', 'occultist', false, 4242);
      const c = freeChars()[0],
        loops = 500000;
      function timing(fn) {
        let sum = 0;
        const start = Date.now();
        for (let i = 0; i < loops; i++) sum += fn(c);
        return { ms: Date.now() - start, sum };
      }
      timing(baseline.p);
      timing(candidate.p);
      const measurements = Array.from({ length: 5 }, (_, i) =>
        i % 2
          ? { candidate: timing(candidate.p), baseline: timing(baseline.p) }
          : { baseline: timing(baseline.p), candidate: timing(candidate.p) }
      );
      return {
        seasons: 48,
        mismatch,
        loops,
        measurements,
        registry: Object.fromEntries(Object.entries(registry).map(([k, v]) => [k, v.knows]))
      };
    });
    assert.deepEqual(r.mismatch, []);
    for (const m of r.measurements) assert.equal(m.baseline.sum, m.candidate.sum);
    console.log(JSON.stringify(r, null, 2));
  } finally {
    await page.close();
  }
}
main().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
