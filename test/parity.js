// Compare real Chrome and Node with each other and the separately reviewed release fingerprints.
const assert = require('node:assert/strict');
const { run, open, openNode, args } = require('./lib/harness');
const { play, cases, caseId, fingerprint } = require('./lib/season');
const a = args({});
const selected = require('./lib/baselines').baseline('seasons', { version: a.baseline });
const baseline = require(selected.file);

run(async browser => {
  let dice = 0;
  for (const input of cases) {
    const options = { seed: input.seed, mathSeed: input.seed, file: a.page };
    const browserGame = await open(browser, options);
    const nodeGame = await openNode(null, options);
    try {
      const actual = await nodeGame.page.evaluate(play, input);
      const rendered = await browserGame.page.evaluate(play, input);
      const expected = baseline.seasons[caseId(input)];
      assert.deepEqual(fingerprint(actual), expected, `Node changed ${selected.version} season ${caseId(input)}`);
      assert.deepEqual(fingerprint(rendered), expected, `Chrome changed ${selected.version} season ${caseId(input)}`);
      assert.ok(actual.ended, 'season must finish');
      assert.deepEqual(browserGame.errors, []);
      assert.deepEqual(nodeGame.errors, []);
      dice += actual.dice.length;
    } finally {
      await Promise.all([browserGame.page.close(), nodeGame.page.close()]);
    }
  }
  return { problems: 0, seasons: cases.length, dice };
});
