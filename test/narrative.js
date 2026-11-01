const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('a companion lost in the doom cannot also fetch help at noon', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [];
      let gone = 0,
        survived = 0,
        rescues = 0;
      for (let seed = 0; seed < 80; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const c = freeChars().find(c => c.role !== 'cult');
        S.fin = { named: S.gods[0], comp: [c.id], took: [c.id], left: [c.id], acts: [], g3: null };
        S.ended = 'doom';
        for (const nature of Object.keys(DOOM_FATE)) {
          S.aspectOf[S.patron] = nature;
          const fate = doomFates()[c.id],
            lost = fate && DOOM_GONE.has(fate.kind);
          if (lost) gone++;
          else survived++;
          for (const lang of ['en', 'ru']) {
            LANG = lang;
            const dice = [_seed, _words],
              html = X(youCodas(false));
            const rescue = /waited at the top of the stair until noon|у верхней ступени до полудня/.test(html);
            if (rescue) rescues++;
            if (lost && rescue) problems.push(`${seed}/${nature}/${lang}: ${fate.kind} companion fetched help`);
            if (dice[0] !== _seed || dice[1] !== _words) problems.push('Coda consumed dice');
          }
        }
      }
      return { problems, gone, survived, rescues };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.gone >= 50 && result.survived >= 50 && result.rescues >= 50, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('every eligible player romance has its own coda, without an unreachable generic guest', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => ({
      eligible: CHARS.filter(c => c.p === 'she' && !Ties.vowed(c))
        .map(c => c.id)
        .sort(),
      codas: Object.keys(FATE_LOVE).sort()
    }));
    assert.deepEqual(result.codas, result.eligible);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('intentional guest betrayals record death, watch, luck and absence without changing either die', async () => {
  const { page, errors } = await openNode();
  try {
    const results = await page.evaluate(() => {
      const rows = [];
      for (const outcome of ['dead', 'watch', 'luck', 'away']) {
        newGame('Marlowe', 'philologist', false, 0);
        // Pin the historical post-deal streams: this regression isolates the unchanged
        // night path from the later, authorized rolls for fallible initiation beliefs.
        [_seed, _words] = [93331691, -1694113610];
        S.day = 2;
        S.phase = 'night';
        const cult = freeCult(),
          guest = cult.find(c => c.p === 'she'),
          killer = cult.find(c => c !== guest);
        S.log.visit = { id: guest.id, day: S.day, agreed: true, hurt: 0, heard: [] };
        RULES.scale.surest = 1;
        RULES.visit.found = outcome === 'away' ? 0 : 1;
        RULES.night.watched = outcome === 'watch' ? 1 : 0;
        RULES.night.spared = outcome === 'luck' ? 1 : 0;
        const night = {
          guest,
          target: guest.id,
          betrayer: killer.id,
          why: { kind: 'betrayal' },
          guard: outcome === 'watch' ? 'player' : null,
          watcher: freeChars().find(c => c.role === 'warden'),
          cult,
          loc: 'camp',
          out: [],
          found: [],
          sworn: [],
          power: false,
          smugOut: false
        };
        nightStrikes(night);
        const dice = [_seed, _words],
          lines = betrayalLines(),
          fate = ['en', 'ru'].map(lang => {
            LANG = lang;
            return X(fateText(guest));
          });
        rows.push({ outcome, status: guest.status, dice, afterText: [_seed, _words], records: S.betrayals, lines, fate });
      }
      return rows;
    });
    // Captured from the unmodified night paths in d6de7516… before repairing the ledger.
    const priorDice = {
      dead: [1541250322, -1694113610],
      watch: [-290315491, -1694113610],
      luck: [1541250322, -1694113610],
      away: [-290315491, -1694113610]
    };
    const savedWords = { watch: /watcher/, luck: /dogs/, away: /tent was empty/ };
    const savedWordsRu = { watch: /страж/, luck: /собаки/, away: /палатка была пуста/ };
    for (const row of results) {
      assert.deepEqual(row.dice, priorDice[row.outcome], row.outcome);
      assert.deepEqual(row.afterText, row.dice, `${row.outcome} debrief consumed dice`);
      assert.deepEqual(row.records, [{ day: 2, by: 'ashby', victim: 'constance', saved: row.outcome === 'dead' ? null : row.outcome }]);
      assert.equal(row.status, row.outcome === 'dead' ? 'taken' : 'present');
      assert.equal(row.lines.length, 1);
      if (row.outcome === 'dead') {
        assert.match(row.lines[0][0], /killed Constance/);
        assert.match(row.fate[0], /Ashby/);
      } else {
        assert.match(row.lines[0][0], savedWords[row.outcome]);
        assert.match(row.lines[0][1], savedWordsRu[row.outcome]);
        assert.doesNotMatch(row.fate.join(' '), /Ashby|Эшби/);
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
