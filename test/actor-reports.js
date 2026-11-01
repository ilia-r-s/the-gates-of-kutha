const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');
const { protocol } = require('../sim/lib/decision-policy');
const { pairedInterval } = require('../sim/actor-knowledge');

test('paired outcome intervals retain uncertainty with zero discordances', () => {
  const r = pairedInterval(0, 0, 1500),
    edge = 1 - (0.05 / 32) ** (1 / 1500);
  assert.equal(r.difference, 0);
  assert.ok(Math.abs(r.interval[0] + edge) < 1e-12);
  assert.ok(Math.abs(r.interval[1] - edge) < 1e-12);
  assert.ok(pairedInterval(1500, 0, 1500).interval[0] > 0);
  assert.throws(() => pairedInterval(3, 3, 5), /paired counts/);
});

test('confession pressure ignores unreceived private testimony and rival claims', async () => {
  const { page } = await openNode();
  try {
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      const c = freeChars().find(a => a.role === 'bystander'),
        others = freeChars().filter(a => a.id !== c.id);
      S.temper[c.id] = 'calculating';
      c.rapport = 0;
      for (const a of freeChars()) Object.assign(claimOf(a), { role: 'none', said: null, recanted: null });
      Object.assign(claimOf(c), { role: 'warden', said: S.day });
      S.testimony = [];
      S.said = [];
      S.words = [];
      const before = DROPS_PRETENCE.p(c),
        dice = [_seed, _words];
      Record.testify(others[0].id, c.id, 'vision', 'cult');
      Record.testify(others[0].id, c.id, 'distrust', 'cult');
      Record.testify(others[1].id, c.id, 'distrust', 'cult');
      Object.assign(claimOf(others[0]), { role: 'warden', said: S.day });
      return { before, after: DROPS_PRETENCE.p(c), dice, afterDice: [_seed, _words] };
    });
    assert.equal(r.after, r.before);
    assert.deepEqual(r.afterDice, r.dice);
  } finally {
    await page.close();
  }
});

test('dream disclosure does not read exact ritual progress, hidden attacks or private camp suspicion', async () => {
  const { page } = await openNode();
  try {
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      S.day = 2;
      const c = freeChars().find(a => a.role === 'seer');
      c.rapport = 1;
      c.promised = false;
      c.visions = [];
      S.log.attacks = [];
      S.onYou = 0;
      S.mourning = {};
      for (const row of Object.values(S.sus)) for (const target of S.order) row[target] = 0;
      const values = () => [BRINGS_DREAM.p(c), KEEPS_DREAM.p(c)],
        before = values(),
        dice = [_seed, _words];
      S.doom = S.doomMax;
      S.log.attacks.push({ day: S.day - 1, how: 'hurt' });
      S.onYou = RULES.scale.suspicion;
      for (const other of freeChars().filter(a => a.id !== c.id)) S.sus[other.id][c.id] = RULES.scale.suspicion;
      return { before, after: values(), dice, afterDice: [_seed, _words] };
    });
    assert.deepEqual(r.after, r.before);
    assert.deepEqual(r.afterDice, r.dice);
  } finally {
    await page.close();
  }
});

test('public claims and accusations reach only their recorded audience and keep their source', async () => {
  const { page } = await openNode();
  try {
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      const c = freeChars().find(a => a.role === 'bystander'),
        w = freeChars().find(a => a.role === 'warden'),
        others = freeChars().filter(a => a.id !== c.id && a.id !== w.id);
      S.temper[c.id] = 'calculating';
      c.rapport = 0;
      Object.assign(claimOf(c), { role: 'warden', said: S.day, recanted: null });
      Object.assign(claimOf(w), { role: 'none', said: S.day, recanted: null });
      const before = DROPS_PRETENCE.p(c),
        output = [];
      output.push(comeClean(w, 'aside'));
      const privateClaim = DROPS_PRETENCE.p(c);
      Object.assign(claimOf(w), { role: 'none', said: S.day, recanted: null });
      output.push(comeClean(w, 'public'));
      const publicClaim = DROPS_PRETENCE.p(c),
        claims = Knowledge.knownClaims(c);
      const old = c.status;
      c.status = 'exposed';
      Suspicion.sayAloud(others[0].id, c.id, 'cult', 'blame');
      c.status = old;
      const absentPressure = Knowledge.pressure(c),
        dice = [_seed, _words];
      Suspicion.sayAloud(others[1].id, c.id, 'cult', 'blame');
      S.said.at(-1).settled = true;
      const heardPressure = Knowledge.pressure(c),
        words = Knowledge.knownWords(c),
        bad = [];
      output.forEach(text => __T.scan(text, 'known public claim', bad));
      return { before, privateClaim, publicClaim, claims, absentPressure, heardPressure, words, dice, afterDice: [_seed, _words], bad };
    });
    assert.equal(r.privateClaim, r.before);
    assert.ok(r.publicClaim > r.before);
    assert.ok(r.claims.some(c => c.value === 'warden' && c.source && c.route && c.day === 1));
    assert.equal(r.absentPressure, 0);
    assert.equal(r.heardPressure, 1);
    assert.equal(r.words.length, 1);
    assert.equal(r.words[0].route, 'heard in person');
    assert.deepEqual(Object.keys(r.words[0]).sort(), [
      'about',
      'by',
      'confidence',
      'day',
      'kind',
      'received',
      'route',
      'slot',
      'source',
      'value'
    ]);
    assert.deepEqual(r.afterDice, r.dice);
    assert.deepEqual(r.bad, []);
  } finally {
    await page.close();
  }
});

test('cached private hearing is reused without acquiring new information during inspection', async () => {
  const { page } = await openNode();
  try {
    const r = await page.evaluate(() => {
      let heard = 0,
        missed = 0;
      for (let seed = 0; seed < 32; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const c = freeCult()[0],
          speaker = freeChars().find(a => a.role === 'seer');
        S.here.camp = [c.id, speaker.id];
        Suspicion.toldYou(speaker, c, 'dream', 'camp', 'cult');
        const dice = [_seed, _words];
        if (Knowledge.knownWords(c).length || S.words[0].heard !== null || _seed !== dice[0] || _words !== dice[1])
          throw Error('Inspection acquired a private report');
        Suspicion.dreamsKnown(speaker);
        const afterHearing = [_seed, _words],
          words = Knowledge.knownWords(c);
        if (S.words[0].heard) {
          heard++;
          if (words.length !== 1 || words[0].value !== 'cult' || words[0].route !== 'recorded overhearing')
            throw Error('Actual overhearing was not available');
        } else {
          missed++;
          if (words.length) throw Error('Failed overhearing became knowledge');
        }
        Knowledge.pressure(c);
        Knowledge.knownClaims(c);
        if (_seed !== afterHearing[0] || _words !== afterHearing[1]) throw Error('A cached read rolled again');
      }
      return { heard, missed };
    });
    assert.equal(r.heard + r.missed, 32);
    assert.ok(r.heard > 0);
    assert.ok(r.missed > 0);
  } finally {
    await page.close();
  }
});

test('ordinary suspect selection never prepares a hidden role filter and a thief tip first requires its own sighting route', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      let unseen = 0,
        witnessed = 0;
      for (let seed = 0; seed < 32; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const saw = c => Object.values(S.nights).some(rec => (rec.thiefSeen || []).includes(c.id)),
          smug = freeChars().find(c => c.role === 'smuggler'),
          witness = freeChars().find(c => c.role !== 'smuggler' && saw(c)),
          actor = freeChars().find(c => !['cult', 'smuggler'].includes(c.role) && !saw(c));
        if (witness) {
          if (thiefKnownTo(witness)?.id !== smug.id) throw Error('An actual recorded sighting lost its subject');
          witnessed++;
        }
        if (!actor) throw Error('No ordinary actor without a sighting for seed ' + seed);
        const others = freeChars().filter(c => c.id !== actor.id),
          saved = others.map(c => [c, Object.getOwnPropertyDescriptor(c, 'role')]);
        try {
          for (const c of others)
            Object.defineProperty(c, 'role', {
              configurable: true,
              get() {
                throw Error('Unreceived role consulted for ordinary actor: ' + c.id);
              }
            });
          if (thiefKnownTo(actor)) throw Error('An unseen thief became known');
          whomToBlame(actor, others);
          unseen++;
        } finally {
          saved.forEach(([c, descriptor]) => Object.defineProperty(c, 'role', descriptor));
        }
      }
      return { unseen, witnessed };
    });
    assert.equal(result.unseen, 32);
    assert.ok(result.witnessed > 0);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('actual thief accounts and hints use varied recollection expressions in both languages', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const cases = [],
        bad = [];
      for (const lang of ['en', 'ru']) {
        const found = { witness: 0, distrust: 0 };
        for (let seed = 0; seed < 512 && Math.min(...Object.values(found)) < 4; seed++) {
          setLang(lang);
          __T.start(0, false, seed);
          const c = freeChars().find(actor => actor.role === 'smuggler'),
            w = thiefSaw(c);
          if (!w) continue;
          S.loc = placeOf(c) || 'camp';
          S.phase = 'talk';
          S.talkId = c.id;
          const before = S.testimony.length,
            original = window.askOf;
          let reply;
          window.askOf = function () {
            return (reply = original.apply(this, arguments));
          };
          try {
            askThem(c, { asked: [], lines: [], chill: false, limit: null, cool: false }, 'distrust');
          } finally {
            window.askOf = original;
          }
          if (reply.themE !== 'uneasy') continue;
          const report = S.testimony
            .slice(before)
            .find(t => t.from === c.id && t.about === w.actor && ['witness', 'distrust'].includes(t.kind));
          if (!report) throw Error('A claimed witness reply lacks its actual testimony');
          if (reply.intent !== 'recounting') throw Error('A witnessed account was forced into fear');
          if (!Object.hasOwn(FACES.reply.recounting, moodNow()) || S.cv.themE !== reply.face)
            throw Error('Actual portrait ignored the reply');
          __T.scan(S_ui.scene.body.join(''), 'thief report/' + lang, bad);
          found[report.kind]++;
          cases.push({ lang, kind: report.kind, mood: moodNow(), text: X(reply.them) });
        }
        if (Math.min(...Object.values(found)) < 4) throw Error('Both natural report forms were not covered: ' + lang);
      }
      return { cases, bad };
    });
    for (const lang of ['en', 'ru'])
      for (const kind of ['witness', 'distrust']) {
        const rows = result.cases.filter(r => r.lang === lang && r.kind === kind);
        assert.ok(rows.length >= 4);
        assert.ok(new Set(rows.map(r => r.mood)).size > 1);
        assert.ok(rows.every(r => r.text.length > 20));
      }
    assert.deepEqual(result.bad, []);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('beliefs follow remembered initiation, troubling visions and announced losses rather than hidden correctness', async () => {
  const { page } = await openNode();
  try {
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4242);
      const c = freeCult()[0],
        mate = freeCult()[1],
        seer = freeChars().find(a => a.role === 'seer');
      S.day = 3;
      seer.visions = [{ about: mate.id, cult: true, muddied: true, dark: true }];
      const before = [Knowledge.cultCompany(c), Knowledge.ritualExpectation(c), Knowledge.ritualExpectation(seer)];
      mate.status = 'taken';
      mate.role = 'bystander';
      S.doom = S.doomMax;
      seer.visions[0].muddied = false;
      seer.visions[0].dark = false;
      seer.role = 'bystander';
      const hidden = [Knowledge.cultCompany(c), Knowledge.ritualExpectation(c), Knowledge.ritualExpectation(seer)];
      griefFor(mate.id);
      const after = [Knowledge.cultCompany(c), Knowledge.ritualExpectation(c), Knowledge.ritualExpectation(seer)],
        losses = Knowledge.knownLosses(c),
        dice = [_seed, _words];
      Knowledge.knownThreat(c);
      Knowledge.ritualExpectation(c);
      Knowledge.cultCompany(c);
      Knowledge.knownLosses(c);
      return { before, hidden, after, losses, dice, afterDice: [_seed, _words] };
    });
    assert.deepEqual(r.hidden, r.before);
    assert.equal(r.after[0].length, r.before[0].length - 1);
    assert.equal(r.after[1], r.before[1]);
    assert.ok(r.after[2] > r.before[2]);
    assert.equal(r.losses.length, 1);
    assert.equal(r.losses[0].route, 'heard at the dawn gathering');
    assert.deepEqual(r.afterDice, r.dice);
  } finally {
    await page.close();
  }
});

test('withholding requires an announced loss and preserves the actual available-dream gate', async () => {
  const { page } = await openNode(),
    records = [];
  try {
    for (const known of [false, true]) {
      await page.connectDecisions({ record: raw => records.push({ known, ...JSON.parse(raw) }) });
      const r = await page.evaluate(known => {
        newGame('Marlowe', 'philologist', false, 4);
        S.day = 2;
        const c = freeChars().find(a => a.role === 'seer'),
          victim = freeChars().find(a => a.role === 'bystander'),
          vision = { about: S.order.find(k => k !== c.id && k !== victim.id), cult: false };
        for (const a of freeChars()) claimOf(a).role = 'none';
        claimOf(c).role = 'seer';
        c.visions = [vision];
        victim.status = 'taken';
        if (known) griefFor(victim.id);
        const html = breakfastDreams({ seer: c, vision, dead: victim.id }),
          bad = [];
        html.forEach(s => __T.scan(s, 'actual morning report', bad));
        return { id: c.id, bad };
      }, known);
      assert.deepEqual(r.bad, []);
    }
    assert.equal(records.filter(r => !r.known && r.decision === 'night.dream.keep').length, 0);
    assert.equal(records.filter(r => r.known && r.decision === 'night.dream.keep').length, 1);
  } finally {
    await page.close();
  }
});

test('real confession opportunities accept policies while retaining their zero gates and one final draw', async () => {
  const { page } = await openNode(),
    inputs = [],
    records = [];
  try {
    await page.connectDecisions({
      policy: raw => {
        const input = JSON.parse(raw);
        inputs.push(input);
        return input.decision === 'pretence.drop' ? JSON.stringify({ schema: 1, decision: input.decision, probability: 0.99 }) : null;
      },
      record: raw => records.push(JSON.parse(raw))
    });
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      for (const c of freeChars()) Object.assign(claimOf(c), { role: c.role === 'seer' ? 'none' : 'warden', said: S.day, recanted: null });
      const text = inquiryConfession(),
        bad = [];
      __T.scan(text, 'inquiry confession', bad);
      const c = freeChars().find(a => !pretence(a)),
        seed = _seed;
      if (!c) throw Error('No actual confession completed');
      TRACE = [];
      const impossible = DROPS_PRETENCE.roll(c, 'inquiry');
      return { text: !!text, bad, impossible, noDraw: _seed === seed, trace: TRACE.length };
    });
    assert.ok(r.text);
    assert.equal(r.impossible, false);
    assert.equal(r.noDraw, true);
    assert.equal(r.trace, 0);
    assert.deepEqual(r.bad, []);
    assert.ok(inputs.some(i => i.decision === 'pretence.drop' && i.observation.occasion === 'inquiry'));
    assert.ok(records.some(r => r.decision === 'pretence.drop' && r.accepted?.probability === 0.99 && r.result));
  } finally {
    await page.close();
  }
});

test('confession context resolution computes its baseline once and consumes exactly one final gate draw', async () => {
  const { page } = await openNode();
  try {
    const results = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      const c = freeChars().find(a => a.role === 'bystander');
      Object.assign(claimOf(c), { role: 'warden', said: S.day, recanted: null });
      const out = [],
        original = PRETENCE_BASE.p;
      for (const occasion of ['morning', 'inquiry']) {
        const p = DROPS_PRETENCE.p(c, occasion),
          seed = _seed,
          words = _words;
        TRACE = [];
        const expected = chance(p),
          after = _seed;
        _seed = seed;
        TRACE = [];
        let computed = 0;
        PRETENCE_BASE.p = (...args) => {
          computed++;
          return original(...args);
        };
        const actual = DROPS_PRETENCE.roll(c, occasion);
        PRETENCE_BASE.p = original;
        out.push({ expected, actual, after, seed: _seed, words, finalWords: _words, computed, draws: TRACE.length });
      }
      return out;
    });
    for (const r of results) {
      assert.equal(r.actual, r.expected);
      assert.equal(r.seed, r.after);
      assert.equal(r.finalWords, r.words);
      assert.equal(r.computed, 1);
      assert.equal(r.draws, 1);
    }
  } finally {
    await page.close();
  }
});

test('all three actor report observations are typed and invariant under unavailable world facts', async () => {
  const { page } = await openNode(),
    inputs = [];
  try {
    const meta = await page.evaluate(() => ({ descriptions: Decisions.descriptions(), bounds: [RULES.scale.rarest, RULES.scale.surest] })),
      contract = protocol(meta.descriptions, meta.bounds);
    await page.connectDecisions({
      policy: raw => {
        inputs.push(contract.request(raw));
        throw Error('Captured actor input');
      }
    });
    const r = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4);
      const c = freeChars().find(a => a.role === 'bystander'),
        seer = freeChars().find(a => a.role === 'seer');
      Object.assign(claimOf(c), { role: 'warden', said: S.day, recanted: null });
      const capture = () => {
        for (const act of [() => DROPS_PRETENCE.roll(c, 'morning'), () => BRINGS_DREAM.roll(seer), () => KEEPS_DREAM.roll(seer)])
          try {
            act();
          } catch (e) {
            if (e.message !== 'Captured actor input') throw e;
          }
      };
      const dice = [_seed, _words];
      capture();
      S.doom = S.doomMax;
      S.onYou = RULES.scale.suspicion;
      S.patron = S.gods.find(g => g !== S.patron);
      S.log.attacks.push({ day: S.day - 1, how: 'hurt' });
      for (const other of freeChars().filter(a => a.id !== c.id && a.id !== seer.id)) {
        other.role = other.role === 'cult' ? 'bystander' : 'cult';
        other.status = 'taken';
        S.sus[other.id][c.id] = RULES.scale.suspicion;
        Object.assign(claimOf(other), { role: 'warden', said: S.day });
        Record.testify(other.id, c.id, 'vision', 'cult');
      }
      capture();
      return { dice, afterDice: [_seed, _words] };
    });
    assert.equal(inputs.length, 6);
    assert.deepEqual(inputs.slice(0, 3), inputs.slice(3));
    assert.deepEqual(r.afterDice, r.dice);
  } finally {
    await page.close();
  }
});
