const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('hazard costs belong to rules and preserve every original outcome', async () => {
  const { page } = await openNode(null, { seed: 4242 });
  try {
    const actual = await page.evaluate(() => ({ perils: RULES.peril.costs, spite: RULES.spite.costs }));
    assert.deepEqual(actual, {
      perils: {
        shoring: [0, 1],
        pickman: [0, 1],
        brick: [0, 1],
        gust: [2, 0],
        grave: [1, 1],
        lost: [1, 0],
        water: [2, 0],
        snake: [0, 1],
        dog: [0, 1],
        woman: [1, 0],
        shelf: [0, 1],
        locked: [1, 0],
        pole: [0, 1],
        primus: [0, 1],
        heat: [2, 0],
        sun: [1, 0]
      },
      spite: { scorpion: [0, 1], water: [2, 0], lamp: [1, 0] }
    });
  } finally {
    await page.close();
  }
});
