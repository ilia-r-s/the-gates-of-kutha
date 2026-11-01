// Compare with the reviewed current release, keeping original fingerprints immutable.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode, args } = require('./lib/harness');
const { cases, caseId, play, fingerprint } = require('./lib/season');
const a = args({});
const selected = require('./lib/baselines').baseline('seasons', { version: a.baseline });
const baseline = require(selected.file);
const origin = require('./fixtures/recovery.json');

test(`all 48 seeded seasons preserve reviewed ${selected.version} choices, state and both dice streams`, async () => {
  assert.equal(selected.original ? baseline.referenceSha256 : baseline.originalReferenceSha256, origin.sha256);
  assert.equal(Object.keys(baseline.seasons).length, cases.length);
  for (const input of cases) {
    const { page, errors } = await openNode(null, { seed: input.seed, mathSeed: input.seed, file: a.page });
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
