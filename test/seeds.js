// Immutable fingerprints captured from the original 28.5.1 page, before cleanup or library changes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');
const { cases, caseId, play, fingerprint } = require('./lib/season');
const baseline = require('./fixtures/seasons.json');
const origin = require('./fixtures/recovery.json');

test('all 48 seeded seasons preserve original choices, state and both dice streams', async () => {
  assert.equal(baseline.referenceSha256, origin.sha256);
  assert.equal(Object.keys(baseline.seasons).length, cases.length);
  for (const input of cases) {
    const { page, errors } = await openNode(null, { seed: input.seed, mathSeed: input.seed });
    try {
      const result = await page.evaluate(play, input);
      assert.ok(result.ended, `unfinished season ${caseId(input)}`);
      assert.deepEqual(fingerprint(result), baseline.seasons[caseId(input)], `changed season ${caseId(input)}`);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
});
