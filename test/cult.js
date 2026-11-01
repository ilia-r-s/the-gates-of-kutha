const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('cult threat follows witnessed accusations, not another person’s private suspicion', async () => {
  const { page } = await openNode(null, { seed: 4242 });
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 23);
      const k = freeCult()[0],
        o = freeChars().find(c => c.role !== 'cult');
      S.said = [];
      S.words = [];
      S.inquiries = [];
      S.log.refusedInq = [];
      for (const row of Object.values(S.sus)) for (const id of Object.keys(row)) row[id] = 0;
      const read = () => [
        Suspicion.threat.closingIn(o),
        Suspicion.threat.harm(o),
        Suspicion.threat.watched(k, k),
        Suspicion.threat.suspects(o, [k])?.id || null,
        Suspicion.threat.weight(o, k),
        Suspicion.caught(k),
        Suspicion.clear(k)
      ];
      const before = read();
      Suspicion.move(o, k, RULES.scale.suspicion);
      const privateOnly = read();
      Suspicion.sayAloud(o.id, k.id, 'cult', 'blame');
      const publicWord = read();
      const dice = [_seed, _words];
      read();
      return { before, privateOnly, publicWord, pure: dice[0] === _seed && dice[1] === _words };
    });
    assert.deepEqual(result.privateOnly, result.before);
    assert.equal(result.publicWord[2], true);
    assert.notEqual(result.publicWord[3], null);
    assert.ok(result.publicWord[4] > result.before[4]);
    assert.equal(result.pure, true);
  } finally {
    await page.close();
  }
});

test('every threat setting states its decision and knowledge source', async () => {
  const { page } = await openNode(null);
  try {
    const notes = await page.evaluate(() => Suspicion.threat.explain());
    assert.deepEqual(Object.keys(notes), ['closingIn', 'harm', 'watched', 'suspects', 'weight']);
    for (const note of Object.values(notes)) {
      assert.ok(note.why.length > 20);
      assert.ok(note.knows.length > 20);
    }
  } finally {
    await page.close();
  }
});

test('strategic targeting retains ordinary alternatives and a bounded probability ratio', async () => {
  const { page } = await openNode(null);
  try {
    const rows = await page.evaluate(() => {
      const pool = ['a', 'b', 'c'];
      return [
        boundedAim(
          pool,
          k => ({ a: 1, b: 3, c: 7 })[k],
          k => k === 'a',
          0.35
        ),
        boundedAim(
          pool,
          k => ({ a: 1, b: 3, c: 7 })[k],
          () => false,
          0.35
        )
      ];
    });
    const totals = rows.map(r => Object.values(r).reduce((a, b) => a + b, 0));
    for (const k of Object.keys(rows[0])) {
      const ratio = rows[0][k] / totals[0] / (rows[1][k] / totals[1]);
      assert.ok(ratio >= 1 / 1.35 && ratio <= 1.35);
      assert.ok(rows[0][k] > 0);
    }
  } finally {
    await page.close();
  }
});

test('private alarm can only nudge the shared player-target odds', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 23);
      const night = { cult: freeCult(), falseGuards: [] };
      night.cult.forEach(c => (c.rapport = 0));
      Suspicion.knownActs = () => 0;
      S.alerted = [];
      const normal = PLAYER_TARGET.p(night);
      S.alerted = night.cult.map(c => c.id);
      night.cult.forEach(c => (c.rapport = -2));
      Suspicion.knownActs = () => 100;
      return { normal, alarm: PLAYER_TARGET.p(night) };
    });
    assert.ok(result.normal > 0);
    assert.ok(result.alarm > result.normal);
    assert.ok(result.alarm / result.normal <= 1.5 + Number.EPSILON);
  } finally {
    await page.close();
  }
});

test('each actor plants at most one item across complete expeditions', async () => {
  const { page, errors } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      const violations = [];
      let plants = 0;
      for (let seed = 0; seed < 100; seed++) {
        __T.start(seed % 3, false, seed);
        if (!__T.play(__T.policies.human(__T.rng(seed ^ 12345)), { maxSteps: 1500 })) throw Error('Unfinished expedition');
        const by = {};
        for (const c of S.clues.filter(c => c.source === 'plant')) {
          plants++;
          by[c.by] = (by[c.by] || 0) + 1;
        }
        if (Object.values(by).some(n => n > 1)) violations.push({ seed, by });
      }
      return { plants, violations };
    });
    assert.deepEqual(errors, []);
    assert.ok(result.plants > 10, 'The check must exercise actual planted clues');
    assert.deepEqual(result.violations, []);
  } finally {
    await page.close();
  }
});

test('second voices cite a public source and each friend spends influence only once', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      RULES.scale.surest = 1;
      Object.assign(RULES.influence, { breakfast: 1, second: 1, doubt: 0, recall: 0 });
      const [target, source] = freeChars();
      Suspicion.sayAloud(source.id, target.id, 'cult', 'blame');
      for (let i = 0; i < 30; i++) CampInfluence.breakfast();
      const seconds = CampInfluence.records().filter(r => r.kind === 'second');
      Object.assign(RULES.influence, { inquirySecond: 0, steer: 1 });
      freeChars().forEach(c => (c.rapport = RULES.scale.trustMax));
      for (let day = 2; day <= 5; day++) {
        S.day = day;
        for (let i = 0; i < 10; i++) CampInfluence.inquiry(target);
      }
      return { seconds, steers: CampInfluence.records().filter(r => r.kind === 'steer'), words: S.said, target: target.id };
    });
    assert.ok(result.seconds.length > 1);
    assert.equal(new Set(result.seconds.map(r => r.by)).size, result.seconds.length);
    assert.ok(
      result.seconds.every(
        r =>
          r.about === result.target &&
          r.by !== r.source &&
          result.words.some(w => w.by === r.source && w.about === r.about && w.day <= r.day)
      )
    );
    assert.ok(result.steers.length > 1);
    assert.equal(new Set(result.steers.map(r => r.by)).size, result.steers.length);
  } finally {
    await page.close();
  }
});

test('remembered influence cannot be attributed to a later accusation', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      const [speaker, original, later, target] = freeChars();
      S.day = 2;
      Object.assign(RULES.scale, { surest: 1, rarest: 0 });
      Object.assign(RULES.influence, { breakfast: 1, second: 0, doubt: 0, recall: 1, remembers: 0 });
      S.log.influence = [{ kind: 'second', by: original.id, about: target.id, day: 1, listeners: [speaker.id] }];
      freeChars()
        .filter(c => c !== speaker)
        .forEach(c => S.log.influence.push({ kind: 'doubt', by: c.id, day: 2 }));
      S.inquiries = [{ id: target.id, day: 1, back: [speaker.id], saidBeforeVote: 1 }];
      S.log.accused = [{ id: target.id, day: 1, right: false }];
      S.said = [
        { by: original.id, about: target.id, verdict: 'cult', day: 1 },
        { by: later.id, about: target.id, verdict: 'cult', day: 2 }
      ];
      for (let i = 0; i < 10; i++) CampInfluence.breakfast();
      return { recalls: CampInfluence.records().filter(r => r.kind === 'recall'), expected: original.id };
    });
    assert.equal(result.recalls.length, 1);
    assert.equal(result.recalls[0].source, result.expected);
  } finally {
    await page.close();
  }
});

test('remembered influence excludes simultaneous co-votes as earlier sources', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      const target = freeChars().find(c => c.role !== 'cult'),
        [speaker, original] = freeChars().filter(c => c !== target);
      S.day = 1;
      Object.assign(RULES.scale, { surest: 1, rarest: 0 });
      Object.assign(RULES.influence, { inquirySecond: 0, steer: 0 });
      Object.assign(RULES.verdict, { back: -100, against: -101, contrary: 0 });
      S.said = [{ by: original.id, about: target.id, verdict: 'cult', day: 1 }];
      S.log.influence = [{ kind: 'second', by: original.id, about: target.id, day: 1, listeners: [speaker.id] }];
      const vote = campVote(target),
        record = S.inquiries.at(-1),
        coVotes = S.said.filter(x => x.how === 'vote' && x.by !== speaker.id && x.by !== original.id);
      S.log.accused = [{ id: target.id, day: 1, right: false }];
      S.revealed[target.id] = 'innocent';
      target.status = 'dismissed';
      S.day = 2;
      Object.assign(RULES.influence, { breakfast: 1, second: 0, doubt: 0, recall: 1, remembers: 0 });
      freeChars()
        .filter(c => c !== speaker)
        .forEach(c => S.log.influence.push({ kind: 'doubt', by: c.id, day: 2 }));
      CampInfluence.breakfast();
      return {
        passed: vote.passed,
        backed: vote.back.includes(speaker.id),
        coVotes: coVotes.length,
        boundary: record.saidBeforeVote,
        sources: CampInfluence.records()
          .filter(r => r.kind === 'recall')
          .map(r => r.source),
        expected: original.id
      };
    });
    assert.equal(result.passed, true);
    assert.equal(result.backed, true);
    assert.ok(result.coVotes >= 2, 'The vote must add alternative speakers after the real influence');
    assert.deepEqual(result.sources, [result.expected]);
    assert.equal(result.boundary, 1);
  } finally {
    await page.close();
  }
});

test('a scene with no cult actor cannot adapt its traces to the cult’s information', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      cultTurns = () => {
        throw Error('No actor is present to use the cult’s information');
      };
      const rows = [];
      for (let i = 0; i < 20; i++) rows.push(sceneTrace(0, 'camp', null, null));
      return rows.length;
    });
    assert.equal(result, 20);
  } finally {
    await page.close();
  }
});

test('dream defenders share fondness eligibility instead of revealing secret loyalty', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      const [actor, target] = freeCult(),
        dreamer = freeChars().find(c => c.role === 'seer');
      for (const c of freeChars()) claimOf(c).role = c === actor ? 'seer' : 'none';
      S.like[actor.id][target.id] = 0;
      TRACE = [];
      const cult = defenderOf(target, dreamer);
      actor.role = 'bystander';
      const innocent = defenderOf(target, dreamer);
      return { cult: cult?.id || null, innocent: innocent?.id || null, rolls: TRACE.filter(r => r[0] === 'C').length };
    });
    assert.deepEqual(result, { cult: null, innocent: null, rolls: 0 });
  } finally {
    await page.close();
  }
});

test('a dream defence uses a shared base and only a bounded public tactical adjustment', async () => {
  const { page } = await openNode(null);
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 163);
      const [actor, target] = freeCult(),
        dreamer = freeChars().find(c => c.role === 'seer');
      for (const c of freeChars()) claimOf(c).role = c === actor ? 'seer' : 'none';
      S.like[actor.id][target.id] = 1;
      const read = () => {
        TRACE = [];
        defenderOf(target, dreamer);
        const rolls = TRACE.filter(r => r[0] === 'C');
        if (rolls.length > 1) throw Error('Only the focal actor is eligible to defend');
        return rolls[0]?.[1] ?? null;
      };
      actor.role = 'bystander';
      const ordinary = read();
      actor.role = 'cult';
      const unplanned = read();
      Suspicion.sayAloud(actor.id, target.id, 'clean', 'dream');
      S.day++;
      for (const c of freeChars().filter(c => c !== actor && c !== target)) Suspicion.sayAloud(c.id, target.id, 'cult', 'blame');
      Suspicion.suspectedBy = () => {
        throw Error('Another actor’s private suspicion is unavailable');
      };
      const planned = read();
      for (const c of freeChars().filter(c => c !== actor)) S.sus[c.id][actor.id] = RULES.scale.suspicion;
      const privateChange = read();
      Suspicion.sayAloud(dreamer.id, actor.id, 'cult', 'blame');
      const publiclyQuestioned = read();
      actor.dreamt = { day: S.day };
      const spentDream = read();
      actor.role = 'seer';
      dreamer.role = 'bystander';
      actor.dreamt = null;
      actor.visions = [];
      const noVision = read();
      actor.visions = [{ about: target.id, cult: false, veil: 'voice' }];
      const veiledVision = read();
      actor.visions = [{ about: target.id, cult: false }];
      const clearVision = read();
      return {
        ordinary,
        unplanned,
        planned,
        privateChange,
        publiclyQuestioned,
        spentDream,
        noVision,
        veiledVision,
        clearVision,
        bound: RULES.claims.defendAim
      };
    });
    assert.equal(result.unplanned, result.ordinary);
    assert.ok(result.planned > result.ordinary);
    assert.ok(result.planned / result.ordinary <= 1 + result.bound + 1e-12);
    assert.equal(result.privateChange, result.planned);
    assert.equal(result.publiclyQuestioned, result.ordinary);
    assert.equal(result.spentDream, null);
    assert.equal(result.noVision, null);
    assert.equal(result.veiledVision, null);
    assert.equal(result.clearVision, result.ordinary);
  } finally {
    await page.close();
  }
});
