const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

async function check(fn) {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(fn);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await page.close();
  }
}

test('reply expression composition retains the existing game and prose draw sequence', async () => {
  const r = await check(() => {
    const problems = [];
    let examples = 0;
    for (let seed = 0; seed < 24; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      for (const c of freeChars())
        for (const [intent, pool] of Object.entries(FACES.reply)) {
          for (const themE of ['neutral', 'stern', 'grave', 'uneasy']) {
            const dice = [_seed, _words];
            TRACE = [];
            faceFor(c, themE);
            const expected = [_seed, _words, JSON.stringify(TRACE)];
            [_seed, _words] = dice;
            TRACE = [];
            const result = replyFace(c, { intent, themE }, 'distrust', 2);
            if (JSON.stringify(expected) !== JSON.stringify([_seed, _words, JSON.stringify(TRACE)])) problems.push('Extra expression draw');
            if (!Object.hasOwn(pool, result) || !MOODS.includes(result)) problems.push('Expression outside its semantic palette');
            examples++;
          }
        }
    }
    return { problems, examples };
  });
  assert.deepEqual(r.problems, []);
  assert.equal(r.examples, 24 * 7 * 8 * 4);
});

test('a cautious refusal never inherits a smile from trust or a cached greeting', async () => {
  const r = await check(() => {
    const faces = new Set(),
      problems = [];
    for (let seed = 0; seed < 96; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      const c = C('anselm');
      c.rapport = RULES.scale.trustMax;
      const reply = { themE: 'neutral', intent: 'reserved' },
        dice = [_seed, _words];
      c.greeted = { at: S.day + ':' + S.slot, g: { text: 'Hello.', face: 'warm' } };
      S.cv = { themE: 'warm' };
      const warm = replyFace(c, reply, 'distrust', 1);
      [_seed, _words] = dice;
      c.greeted.g.face = 'angry';
      S.cv.themE = 'angry';
      const angry = replyFace(c, reply, 'distrust', 1);
      if (warm !== angry) problems.push('Greeting leaked into reply');
      if (['smile', 'warm', 'smirk', 'coy', 'sultry', 'wink'].includes(warm)) problems.push('Inappropriate cheerful refusal');
      faces.add(warm);
    }
    return { problems, faces: [...faces] };
  });
  assert.deepEqual(r.problems, []);
  assert.ok(r.faces.length > 1);
});

test('actual proof replies carry their intent in either language and update the conversation portrait', async () => {
  const r = await check(() => {
    const rows = [];
    for (const lang of ['en', 'ru']) {
      setLang(lang);
      let found = false;
      for (let seed = 0; seed < 40 && !found; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        for (const c of freeChars()) {
          const result = DIALOG.distrust.run(c);
          if (result.intent !== 'reserved' || X(result.them) !== X(bi(...TX.dialog.iWillNotPut()))) continue;
          const old = DIALOG.distrust.run;
          DIALOG.distrust.run = () => result;
          S.cv = { youE: 'smile', themE: 'warm', speaking: 'them' };
          S.talkId = c.id;
          S.phase = 'talk';
          S.loc = 'camp';
          try {
            askThem(c, { asked: [], lines: [], chill: false, limit: null, cool: false }, 'distrust');
            rows.push({ lang, intent: result.intent, mood: moodNow(), text: X(S_ui.scene.body.join('')) });
          } finally {
            DIALOG.distrust.run = old;
          }
          found = true;
          break;
        }
      }
      if (!found) throw Error('A natural cautious reply was not reached');
    }
    return rows;
  });
  assert.equal(r.length, 2);
  for (const row of r) {
    assert.ok(['thoughtful', 'neutral', 'cold'].includes(row.mood));
    assert.match(row.text, row.lang === 'en' ? /without proof/ : /Без доказательств/);
  }
});

test('reply presentation is stable, can change with the next response, and ignores inaccessible truth', async () => {
  const r = await check(() => {
    let changed = 0;
    const problems = [];
    for (let seed = 0; seed < 48; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      const c = C('anselm'),
        reply = { themE: 'grave', intent: 'serious' },
        dice = [_seed, _words];
      const first = replyFace(c, reply, 'distrust', 1);
      [_seed, _words] = dice;
      const same = replyFace(c, reply, 'distrust', 1);
      S.doom = S.doomMax;
      for (const id of S.order)
        if (id !== c.id) {
          C(id).role = 'cult';
          S.sus[id][c.id] = RULES.scale.suspicion;
          S.like[id][c.id] = RULES.ties.cannotBear;
        }
      [_seed, _words] = dice;
      if (replyFace(c, reply, 'distrust', 1) !== same || first !== same) problems.push('Hidden truth or repaint changed expression');
      if (replyFace(c, { themE: 'stern', intent: 'firm' }, 'press', 2) !== first) changed++;
    }
    return { problems, changed };
  });
  assert.deepEqual(r.problems, []);
  assert.ok(r.changed > 24);
});

test('declining a trusted confidence is cautious, without anger or calling a friend a stranger', async () => {
  const r = await check(() => {
    const problems = [],
      faces = new Set(),
      accept = TAKES_CONFIDENCE.roll;
    let checked = 0;
    TAKES_CONFIDENCE.roll = () => false;
    try {
      for (const lang of ['en', 'ru']) {
        setLang(lang);
        for (let seed = 0; seed < 96; seed++) {
          newGame('Marlowe', 'philologist', false, seed);
          for (const c of freeChars()) {
            c.rapport = RULES.scale.trustMax;
            const reply = DIALOG.confide.run(c),
              face = replyFace(c, reply, 'confide', 2),
              text = X(reply.them);
            if (['angry', 'cold', 'stern'].includes(face)) problems.push('Hostile response to a trusted confidence');
            if (/stranger|чужого человека/.test(text)) problems.push('A trusted friend was called a stranger');
            faces.add(face);
            checked++;
          }
        }
      }
    } finally {
      TAKES_CONFIDENCE.roll = accept;
    }
    return { problems: [...new Set(problems)], faces: [...faces], checked };
  });
  assert.deepEqual(r.problems, []);
  assert.equal(r.checked, 2 * 96 * 7);
  assert.ok(r.faces.length > 1);
});
