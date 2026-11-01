const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('night atmosphere spends only its own budget and preserves a single seeded opportunity', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const rows = [];
      for (let season = 0; season < 64; season++) {
        newGame('Marlowe', 'philologist', false, season);
        S.tenor.crowd = 3;
        S.tenor.nightCrowd = 2;
        let called = 0;
        const prose = _words,
          expected = 0.6 * room(null, 2);
        TRACE = [];
        const html = nightAtmosphere(0.6, () => {
          called++;
          return '<p>A delivered event.</p>';
        });
        rows.push({
          called,
          html,
          expected,
          dice: TRACE.map(r => [...r]),
          proseSame: prose === _words,
          investigation: S.tenor.crowd,
          atmosphere: S.tenor.nightCrowd
        });
      }
      return rows;
    });
    assert.ok(result.some(r => r.called) && result.some(r => !r.called));
    for (const row of result) {
      assert.equal(row.dice.length, 1);
      assert.equal(row.dice[0][0], 'C');
      assert.ok(Math.abs(row.dice[0][1] - row.expected) < 1e-10);
      assert.equal(row.investigation, 3);
      assert.equal(row.atmosphere, 2 + row.called);
      assert.equal(row.proseSame, true);
      assert.equal(Boolean(row.html), Boolean(row.called));
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('only added morning nature scenes use atmospheric pacing; visible observations alone are recorded', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const rows = [];
      for (const channel of ['omen', 'death', 'luck', 'action', 'tablet', 'dream'])
        for (let season = 0; season < 256; season++) {
          newGame('Marlowe', 'philologist', false, season);
          S.tenor.crowd = 2;
          S.tenor.nightCrowd = 3;
          const paced = ['omen', 'death', 'luck'].includes(channel),
            before = NatureSigns.record().length;
          TRACE = [];
          const html = NatureSigns.tell(channel, 'truth', freeChars()[0]),
            rolls = TRACE.filter(r => r[0] === 'C');
          rows.push({
            channel,
            paced,
            html: !!html,
            expected: RULES.natureSigns.channel[channel] * (paced ? room(null, 3) : 1),
            first: rolls[0][1],
            records: NatureSigns.record().length - before,
            atmosphere: S.tenor.nightCrowd,
            investigation: S.tenor.crowd
          });
        }
      return rows;
    });
    for (const row of result) {
      assert.ok(Math.abs(row.first - Math.max(0.01, row.expected)) < 1e-10);
      assert.equal(row.records, Number(row.html));
      assert.equal(row.atmosphere, 3 + Number(row.paced && row.html));
      assert.equal(row.investigation, 2);
    }
    for (const channel of ['omen', 'death', 'luck', 'action', 'tablet', 'dream'])
      assert.ok(
        result.some(r => r.channel === channel && r.html),
        channel + ' has a delivered example'
      );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('a real eventful morning keeps death, trace and primary clue before suppressing atmospheric additions', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      __T.start(0, false, 1);
      const original = nightAtmosphere,
        calls = [];
      nightAtmosphere = function (odds, make) {
        const used = S.tenor.nightCrowd,
          investigation = S.tenor.crowd,
          html = original(odds, make);
        calls.push({ odds, used, investigation, after: S.tenor.crowd, shown: !!html });
        return html;
      };
      try {
        for (const i of [0, 2, 0, 0, 3, 1, 1, 0, 0, 4, 0, 0]) {
          const choice = __T.buttons()[i];
          if (!choice) throw Error('Missing real route choice ' + i);
          choice.click();
        }
        return { phase: S.phase, text: X(S_ui.scene.body.join('')), calls, primary: RULES.night.dawnSign };
      } finally {
        nightAtmosphere = original;
      }
    });
    assert.equal(result.phase, 'night');
    // The approved initiation-belief rolls changed this route's victim and trace;
    // the real morning must still deliver both before optional atmosphere is paced.
    assert.match(result.text, /Hamid al-Shergati/);
    assert.match(result.text, /lingering scent of attar of roses/);
    assert.equal(result.calls[0].odds, result.primary);
    assert.equal(result.calls[0].used, 0);
    assert.ok(result.calls.slice(1).every(c => c.used >= 1));
    assert.ok(result.calls.every(c => c.investigation === c.after));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
