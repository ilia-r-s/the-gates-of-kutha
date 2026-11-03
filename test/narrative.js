const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('daytime omens retain their observation date and do not report a future noon or invent yesterday', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const checked = [
          ASPECTS.fire.signs[5],
          ASPECTS.fire.signs[6],
          ASPECTS.dust.signs[0],
          ASPECTS.dust.signs[5],
          ASPECTS.dust.signs[6],
          ASPECTS.sea.signs[2],
          ASPECTS.sea.signs[5],
          ASPECTS.plague.signs[0],
          ASPECTS.plague.signs[6],
          ASPECTS.madness.signs[5]
        ],
        texts = checked.flatMap(s => s.texts),
        seen = new Set(),
        problems = [];
      let records = 0;
      for (let seed = 0; seed < 96; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.day = 2;
        for (let n = 0; n < 16; n++) {
          const count = S.omenLog.length,
            text = nextOmen();
          if (!texts.includes(text)) continue;
          seen.add(text);
          if (S.omenLog.length > count) {
            const record = S.omenLog.at(-1);
            records++;
            if (record.day !== 2) problems.push('Omen recorded for the wrong day');
            for (const lang of ['en', 'ru']) {
              LANG = lang;
              const dice = [_seed, _words],
                passage = X(bi(text)),
                before = X(bookOmens());
              S.day++;
              const after = X(bookOmens());
              S.day--;
              if (!before.includes(passage) || !after.includes(passage)) problems.push('Notebook changed the recorded observation');
              if (dice[0] !== _seed || dice[1] !== _words) problems.push('Reading the omen consumed dice');
            }
          }
        }
      }
      const passages = ['en', 'ru'].flatMap(lang => {
        LANG = lang;
        return [
          ...checked.flatMap(s => [s.short, s.formula, ...s.texts]),
          ...EVENTS.filter(e => ['shadows', 'mirage', 'song'].includes(e.id)).map(e => e.text),
          bi(...TX.events.theShamalBlowsOn()),
          bi(...TX.events.theDiggersSitBy()),
          ...SAY.hardest.map(f => bi(...f(CHARS[0], CHARS[1])))
        ].map(t => ({ lang, text: X(bi(t)) }));
      });
      return { problems, records, covered: seen.size, expected: texts.length, passages };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.records > 50, 'natural omen selection must exercise the dated notebook');
    assert.equal(result.covered, result.expected, 'all variants of the reviewed omens were generated');
    for (const { lang, text } of result.passages) {
      assert.doesNotMatch(
        text,
        /yesterday|noon|midday|afternoon|sunset|dusk|all morning|all day|вчера|полд[её]н|полуд|послеполуд|закат|сумерк|всё утро|весь день/i,
        `${lang}: ${text}`
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

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
