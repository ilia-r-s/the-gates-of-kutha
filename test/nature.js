const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('nature signs are uncertain, role-blind and recorded only when experienced', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 71);
      const c = freeChars()[0];
      const a = NatureSigns.probability('bold');
      const before = [_seed, _words];
      c.role = c.role === 'cult' ? 'bystander' : 'cult';
      const b = NatureSigns.probability('bold');
      const pure = before[0] === _seed && before[1] === _words;
      const rates = Object.keys(NATURE).flatMap(k => {
        S.aspectOf[S.patron] = k;
        return NatureSigns.ways.map(NatureSigns.probability);
      });
      RULES.natureSigns.channel.tablet = 1;
      RULES.scale.surest = 1;
      const html = NatureSigns.tell('tablet', 'bold');
      const record = NatureSigns.record().at(-1);
      return { a, b, pure, rates, html, record, journal: S.journal.length };
    });
    assert.equal(result.a, result.b);
    assert.equal(result.pure, true);
    assert.ok(result.rates.every(p => p >= 0.35 && p <= 0.65));
    assert.equal(result.record.way, 'bold');
    assert.equal(typeof result.record.good, 'boolean');
    assert.ok(result.html.length > 30 && result.journal > 0);
    assert.equal('nature' in result.record, false);
  } finally {
    await page.close();
  }
});

test('conversation signs follow the last supported approach in this slot without changing the action cause', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 71);
      RULES.natureSigns.channel.action = 1;
      RULES.scale.surest = 1;
      S.act = 'talk';
      S.acts = [{ kind: 'confide', day: S.day, slot: S.slot - 1 }];
      const before = [_seed, _words];
      const stale = NatureSigns.action(S.act);
      const unchanged = before[0] === _seed && before[1] === _words;
      S.acts.push({ kind: 'press', day: S.day, slot: S.slot });
      const press = NatureSigns.action(S.act);
      const pressed = NatureSigns.record().at(-1)?.way;
      S.acts.push({ kind: 'confide', day: S.day, slot: S.slot });
      const confide = NatureSigns.action(S.act);
      return { stale, unchanged, press, pressed, confide, confided: NatureSigns.record().at(-1)?.way, act: S.act };
    });
    assert.equal(result.stale, '');
    assert.equal(result.unchanged, true);
    assert.equal(result.pressed, 'bold');
    assert.equal(result.confided, 'truth');
    assert.equal(result.act, 'talk');
    assert.ok(result.press.length > 20 && result.confide.length > 20);
    assert.doesNotMatch(result.press + result.confide, /canvas|палатк/);
  } finally {
    await page.close();
  }
});

test('real press and confidence choices deliver one sign on leaving the conversation', async () => {
  const { page, errors } = await openNode(null);
  try {
    const rows = await page.evaluate(() => {
      const results = [];
      for (const [topic, way] of [
        ['press', 'bold'],
        ['confide', 'truth']
      ]) {
        RULES.scale.surest = 0.99;
        __T.start(0, false, 4242);
        __T.buttons()[0].click();
        const destination = __T.buttons().find(b => /Hamid|Anselm|Constance|Ashby|Yusuf|Ilse|Zahrun/.test(b.textContent));
        if (!destination) throw Error('No visible company to visit');
        destination.click();
        const person = __T.buttons().find(b => /Speak with/.test(b.textContent));
        if (!person) throw Error('The displayed company has no conversation choice');
        person.click();
        const label = X(DIALOG[topic].label(C(S.talkId))),
          question = __T.buttons().find(b => b.textContent.includes(label));
        if (!question) throw Error('Missing real ' + topic + ' choice');
        question.click();
        const action = S.act,
          recorded = S.acts.at(-1)?.kind;
        RULES.natureSigns.channel.action = 1;
        RULES.scale.surest = 1;
        const before = NatureSigns.record().filter(r => r.channel === 'action').length;
        const leave = __T.buttons().find(b => /Take your leave/.test(b.textContent));
        if (!leave) throw Error('Conversation cannot be left');
        leave.click();
        const signs = NatureSigns.record().filter(r => r.channel === 'action');
        results.push({ topic, way, action, recorded, delivered: signs.length - before, actual: signs.at(-1)?.way });
      }
      return results;
    });
    assert.deepEqual(errors, []);
    for (const row of rows) {
      assert.equal(row.action, 'talk');
      assert.equal(row.recorded, row.topic);
      assert.equal(row.delivered, 1);
      assert.equal(row.actual, row.way);
    }
  } finally {
    await page.close();
  }
});
