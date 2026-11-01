const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

async function fixture(run) {
  const { page, errors } = await openNode();
  try {
    await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4242);
      window.__slipActor = freeCult()[0];
      S.log.presses.push({ day: S.day, id: __slipActor.id });
    });
    const result = await page.evaluate(run);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await page.close();
  }
}

test('unseen evidence, private pressure and exact rite progress cannot change a revealing slip', async () => {
  const r = await fixture(() => {
    const c = __slipActor,
      secret = { secret: 'cult' },
      before = [SLIPS.p(c, secret), pressFear(c)],
      dice = [_seed, _words],
      other = freeChars().find(o => o.id !== c.id);
    Record.caseAgainst = () => {
      throw Error('Private case read');
    };
    S.doom = S.doomMax - 1;
    S.said.push({ day: S.day, by: other.id, about: c.id, verdict: 'cult', how: 'dream', audience: [other.id] });
    S.testimony.push({ day: S.day, from: other.id, about: c.id, kind: 'vision', verdict: 'cult' });
    for (let i = 0; i < 30; i++) S.log.presses.push({ day: S.day, id: other.id });
    for (const a of S.order) if (a !== c.id) S.sus[a][c.id] = RULES.scale.suspicion;
    return { before, after: [SLIPS.p(c, secret), pressFear(c)], dice, finalDice: [_seed, _words], pressure: Knowledge.pressure(c) };
  });
  assert.deepEqual(r.after, r.before);
  assert.deepEqual(r.finalDice, r.dice);
  assert.equal(r.pressure, 0);
});

test('a received accusation changes pressure regardless of whether its speaker secretly believes it', async () => {
  const r = await fixture(() => {
    const c = __slipActor,
      other = freeChars().find(o => o.id !== c.id),
      secret = { secret: 'cult' },
      before = SLIPS.p(c, secret),
      dice = [_seed, _words];
    Suspicion.sayAloud(other.id, c.id, 'cult', 'blame');
    const after = SLIPS.p(c, secret),
      pressure = Knowledge.pressure(c);
    S.sus[other.id][c.id] = 0;
    return {
      before,
      after,
      doubtingSpeaker: SLIPS.p(c, secret),
      pressure,
      words: Knowledge.knownWords(c),
      dice,
      finalDice: [_seed, _words]
    };
  });
  assert.equal(r.pressure, 1);
  assert.ok(r.after > r.before);
  assert.equal(r.doubtingSpeaker, r.after);
  assert.ok(r.words.some(w => w.source && w.route && w.kind === 'blame'));
  assert.deepEqual(r.finalDice, r.dice);
});

test('pressure on other people counts only when witnessed or received, and the same occasion counts once', async () => {
  const r = await fixture(() => {
    const c = __slipActor,
      other = freeChars().find(o => o.id !== c.id),
      before = pressFear(c);
    S.knowledge.people[c.id].actions.push({
      value: 'press',
      day: 1,
      slot: 1,
      with: other.id,
      source: 'nearby questioning',
      route: 'overheard'
    });
    S.rumors.push({ kind: 'pressed', day: 2, sourceDay: 1, sourceSlot: 1, about: other.id, heardBy: [c.id] });
    const received = Knowledge.knownPresses(c),
      after = pressFear(c);
    S.rumors.push({ kind: 'pressed', day: 2, sourceDay: 1, sourceSlot: 2, about: c.id, heardBy: [c.id] });
    return { before, after, received, withoutOwnDoubleCount: Knowledge.knownPresses(c) };
  });
  assert.equal(r.received, 1);
  assert.equal(r.withoutOwnDoubleCount, 1);
  assert.ok(r.after > r.before);
});

test('an initiate remembers membership and the ritual calendar without consulting hidden current truth', async () => {
  const r = await fixture(() => {
    const c = __slipActor,
      companion = Knowledge.cultCompany(c).find(k => k !== c.id),
      secret = { secret: 'cult' },
      initialCompany = Knowledge.cultCompany(c),
      initialExpectation = Knowledge.ritualExpectation(c);
    S.day = 4;
    const expectation = Knowledge.ritualExpectation(c),
      before = SLIPS.p(c, secret);
    for (const id of S.order) if (id !== c.id) C(id).role = 'anyone';
    if (companion) C(companion).status = 'taken';
    S.doom = 0;
    const lowRite = SLIPS.p(c, secret),
      hiddenCompany = Knowledge.cultCompany(c);
    S.doom = S.doomMax;
    const highRite = SLIPS.p(c, secret);
    if (companion) Knowledge.publicLoss(companion);
    return {
      initialCompany,
      hiddenCompany,
      knownCompany: Knowledge.cultCompany(c),
      companion,
      before,
      lowRite,
      highRite,
      initialExpectation,
      expectation
    };
  });
  assert.ok(r.companion);
  assert.deepEqual(r.hiddenCompany, r.initialCompany);
  assert.ok(!r.knownCompany.includes(r.companion));
  assert.equal(r.lowRite, r.before);
  assert.equal(r.highRite, r.before);
  assert.ok(r.expectation > r.initialExpectation && r.expectation < 1);
});
