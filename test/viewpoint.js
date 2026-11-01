const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');
const { cases, play, fingerprint } = require('./lib/season');

test('viewpoint changes are reversible across scenes/endings and preserve NPC staging, live state and dice', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      __T.start(0, false, 4242);
      const scene = S_ui.scene,
        before = JSON.stringify(S),
        dice = [_seed, _words];
      const scenes = [
        { bg: 'camp', time: 'morning', you: true, cast: [...S.order] },
        ...MOODS.map(mood => ({ bg: 'camp', time: 'evening', talk: 'ilse', mood })),
        ...Object.keys(END_ART).flatMap(end =>
          ['fire', 'dust', 'sea', 'teeth', 'plague', 'madness'].map(aspect => ({ bg: 'end', end, aspect, time: END_TIME[end] }))
        ),
        { bg: 'end', end: 'fallen-night', aspect: 'dust', time: 'dawn', inBed: true }
      ];
      const original = scenes.map(a => sceneSVG(a));
      Viewpoint.set('first', false);
      const first = scenes.map(a => sceneSVG(a));
      const fullBodyAbsent = first.every(svg => !/M10 262C14 202|M134 200Q158 124|M-12 0L-10 -28Q0 -34/.test(svg));
      const staging = svg =>
        [...svg.matchAll(/<g transform="(translate\([\d.-]+ [\d.-]+\) scale\((?:\.62|\.72|0\.62|0\.72|1\.42)\))"/g)].map(m => m[1]);
      const sameNpcStaging =
        JSON.stringify(staging(original[0])) === JSON.stringify(staging(first[0])) && first[1].includes('translate(470 18) scale(1.42)');
      Viewpoint.set('third', false);
      return {
        count: scenes.length,
        defaultMode: Viewpoint.mode,
        fullBodyAbsent,
        sameNpcStaging,
        changed: first.filter((svg, i) => svg !== original[i]).length,
        restored: scenes.every((a, i) => sceneSVG(a) === original[i]),
        stateSame: before === JSON.stringify(S),
        sceneSame: S_ui.scene === scene,
        diceSame: JSON.stringify(dice) === JSON.stringify([_seed, _words]),
        invalidRejected: Viewpoint.set('unsupported', false) === false
      };
    });
    assert.equal(result.defaultMode, 'third');
    for (const k of ['fullBodyAbsent', 'sameNpcStaging', 'restored', 'stateSame', 'sceneSame', 'diceSame', 'invalidRejected'])
      assert.equal(result[k], true, k);
    assert.ok(result.changed > 20);
    assert.ok(result.count > 100);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('all 48 season cases keep exact state, choices and both streams in first-person and repeated-toggle play', async () => {
  const opened = [];
  try {
    for (let i = 0; i < 3; i++) opened.push(await openNode());
    await opened[1].page.evaluate(() => {
      Viewpoint.set('first', false);
    });
    await opened[2].page.evaluate(() => {
      listen('scene', () => {
        Viewpoint.set(Viewpoint.mode === 'first' ? 'third' : 'first', false);
      });
    });
    for (const c of cases) {
      const expected = fingerprint(await opened[0].page.evaluate(play, c));
      for (let i = 1; i < opened.length; i++)
        assert.deepEqual(fingerprint(await opened[i].page.evaluate(play, c)), expected, JSON.stringify({ case: c, mode: i }));
    }
    for (const { errors } of opened) assert.deepEqual(errors, []);
  } finally {
    for (const { page } of opened) await page.close();
  }
});
