const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');
const { protocol } = require('../sim/lib/decision-policy');

async function check(fn) {
  const { page, errors } = await openNode();
  try {
    const value = await page.evaluate(fn);
    assert.deepEqual(errors, []);
    return value;
  } finally {
    await page.close();
  }
}

test('all authored object reactions obey shared probability bounds even when motives coincide', async () => {
  const r = await check(() => {
    newGame('Marlowe', 'philologist', false, 17);
    const fear = TEMPER_IDS.map(t => TEMPERS[t].fear),
      greed = TEMPER_IDS.map(t => TEMPERS[t].greed),
      f0 = Math.min(...fear),
      f1 = Math.max(...fear) * (1 + RULES.objectReaction.bias),
      g0 = Math.min(...greed),
      g1 = Math.max(...greed) * (1 + RULES.objectReaction.bias),
      bounds = { greed: [g0, g1], fear: [(1 - g1) * f0, (1 - g0) * f1], calm: [(1 - g1) * (1 - f1), (1 - g0) * (1 - f0)] },
      c = freeChars()[0],
      memo = S.knowledge.people[c.id],
      rows = [];
    for (const weights of [RULES.objectReaction.fear, RULES.objectReaction.greed])
      if (Object.values(weights).some(x => x < 0 || x > 1)) throw Error('Motive exceeds the common budget');
    for (const temper of TEMPER_IDS)
      for (const item of Object.keys(RULES.objectReaction.objects)) {
        S.temper[c.id] = temper;
        c.role = 'bystander';
        c.rapport = 0;
        c.visions = [];
        memo.doctrine = null;
        memo.luck = [];
        S.witness = [];
        const base = ObjectReactions.probabilities(c, item);
        if (Math.abs(base.greed - TP(c).greed) > 1e-12 || Math.abs(base.fear / (1 - base.greed) - TP(c).fear) > 1e-12)
          throw Error('The base depends on an unavailable role or motive');
        memo.doctrine = {
          value: { power: 'nergal', ward: item, nature: 'fire' },
          source: 'initiation',
          route: 'remembered',
          day: 0,
          slot: null,
          confidence: 'assured'
        };
        const ward = ObjectReactions.probabilities(c, item);
        c.role = 'smuggler';
        c.rapport = RULES.scale.trustMin;
        c.visions.push({ night: 0, about: c.id, cult: true });
        S.witness.push({ night: 0, actor: c.id, sure: 'unsure' });
        Knowledge.observedLuck(c, { day: S.day, slot: S.slot, way: 'word', good: false });
        const combined = ObjectReactions.probabilities(c, item);
        if (Math.abs(ward.fear / (1 - ward.greed) - combined.fear / (1 - combined.greed)) > 1e-12)
          throw Error('Fear motives stacked beyond the strongest ward association');
        for (const p of [base, ward, combined]) {
          if (Math.abs(p.greed + p.fear + p.calm - 1) > 1e-12) throw Error('Reaction probabilities do not partition the outcome');
          for (const [kind, value] of Object.entries(p))
            if (value < bounds[kind][0] - 1e-12 || value > bounds[kind][1] + 1e-12) throw Error('Reaction outside structural bounds');
        }
        rows.push([temper, item]);
      }
    return { bounds, cases: rows.length };
  });
  assert.equal(r.cases, 7 * 15);
  for (const [lo, hi] of Object.values(r.bounds)) {
    assert.ok(lo > 0 && hi < 1);
    assert.ok(hi / lo < 2 && lo / hi > 0.5);
  }
  assert.ok(Math.abs(r.bounds.fear[0] - 0.132) < 1e-12);
  assert.ok(Math.abs(r.bounds.fear[1] - 0.2475) < 1e-12);
});

test('object reactions read remembered belief and own experience without consulting inaccessible truth', async () => {
  const r = await check(() => {
    let contexts = 0;
    for (let seed = 0; seed < 16; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      for (const c of freeChars()) {
        const items = ['head', 'seal', 'line'],
          sample = () => items.map(item => [Knowledge.objectBeliefs(c, item), ObjectReactions.probabilities(c, item)]),
          before = JSON.stringify(sample()),
          dice = [_seed, _words],
          saved = [];
        const hide = (o, key) => {
          const descriptor = Object.getOwnPropertyDescriptor(o, key);
          saved.push(() => (descriptor ? Object.defineProperty(o, key, descriptor) : delete o[key]));
          Object.defineProperty(o, key, {
            configurable: true,
            get() {
              throw Error('Inaccessible input read: ' + key);
            }
          });
        };
        for (const key of ['patron', 'aspectOf', 'wardOf', 'natureSigns', 'omenLog', 'you', 'doom', 'sus']) hide(S, key);
        for (const other of freeChars().filter(other => other.id !== c.id)) hide(other, 'role');
        try {
          if (JSON.stringify(sample()) !== before) throw Error('Unavailable truth changed an object reaction');
          if (_seed !== dice[0] || _words !== dice[1]) throw Error('Reading knowledge consumed dice');
          contexts += items.length;
        } finally {
          saved.reverse().forEach(restore => restore());
        }
      }
    }
    return contexts;
  });
  assert.equal(r, 16 * 7 * 3);
});

test('nature doctrine is acquired once, may be confidently wrong, and never refreshes from the real nature', async () => {
  const r = await check(() => {
    let correct = 0,
      mistaken = 0;
    for (let seed = 0; seed < 128; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      for (const c of freeCult()) {
        const belief = Knowledge.doctrine(c),
          actual = S.aspectOf[S.patron];
        if (belief.value.nature === actual) correct++;
        else mistaken++;
        if (!belief.source || !belief.route || belief.day !== 0 || belief.confidence !== 'assured')
          throw Error('Missing initiation provenance');
        const before = Knowledge.objectBeliefs(c, 'head').observation,
          dice = [_seed, _words];
        S.aspectOf[S.patron] = Object.keys(NATURE).find(n => n !== actual);
        const after = Knowledge.objectBeliefs(c, 'head').observation;
        if (JSON.stringify(before) !== JSON.stringify(after) || _seed !== dice[0] || _words !== dice[1])
          throw Error('Belief refreshed from truth');
        S.aspectOf[S.patron] = actual;
      }
    }
    return { correct, mistaken };
  });
  assert.equal(r.correct + r.mistaken, 256);
  assert.ok(r.correct > 0 && r.mistaken > 0);
});

test('only a delivered luck participant remembers a sign; private player channels never become NPC knowledge', async () => {
  const r = await check(() => {
    const delivered = {};
    for (let seed = 0; seed < 64; seed++) {
      newGame('Marlowe', 'philologist', false, seed);
      const person = freeChars()[0],
        others = freeChars().filter(c => c.id !== person.id);
      for (const channel of ['luck', 'omen', 'death', 'tablet', 'dream', 'action']) {
        const before = NatureSigns.record().length,
          memories = S.order.reduce((n, id) => n + S.knowledge.people[id].luck.length, 0),
          text = NatureSigns.tell(channel, channel === 'luck' ? null : 'word', person);
        if (!text) continue;
        delivered[channel] = (delivered[channel] || 0) + 1;
        const sign = NatureSigns.record()[before],
          current = S.order.reduce((n, id) => n + S.knowledge.people[id].luck.length, 0);
        if (current !== memories + Number(channel === 'luck')) throw Error('A private channel became shared knowledge');
        if (channel === 'luck') {
          const memory = S.knowledge.people[person.id].luck.at(-1);
          if (
            memory.value.good !== sign.good ||
            memory.value.way !== sign.way ||
            memory.day !== sign.day ||
            !memory.source ||
            !memory.route
          )
            throw Error('The observed luck lost its source or delivery time');
          if (others.some(c => S.knowledge.people[c.id].luck.length))
            throw Error('An absent listener inherited another person’s experience');
        }
      }
    }
    return delivered;
  });
  for (const channel of ['luck', 'omen', 'death', 'tablet', 'dream', 'action']) assert.ok(r[channel] > 0, channel);
});

test('actual show replies resolve through audited policies and retain greed-first conditional draw order', async () => {
  const { page, errors } = await openNode();
  const inputs = [],
    records = [];
  try {
    const descriptors = await page.evaluate(() => Decisions.descriptions()),
      contract = protocol(descriptors, [0.01, 0.99]);
    await page.connectDecisions({
      policy(raw) {
        const request = contract.request(raw);
        if (!request.decision.startsWith('dialog.object.')) return null;
        inputs.push(request);
        return JSON.stringify({ schema: 1, decision: request.decision, probability: request.decision.endsWith('.greed') ? 0.01 : 0.99 });
      },
      record(raw) {
        const r = JSON.parse(raw);
        if (r.decision.startsWith('dialog.object.')) records.push(r);
      }
    });
    const r = await page.evaluate(() => {
      const outcomes = {},
        bad = [];
      for (let seed = 0; seed < 32; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        setLang(seed % 2 ? 'ru' : 'en');
        S.items.push('head');
        const c = freeChars().find(c => !SCHOLARS.includes(c.id));
        S.loc = 'camp';
        const before = S.testimony.length,
          reply = DIALOG.show.run(c, 'head');
        const r = S.testimony.slice(before).find(t => t.kind === 'react');
        if (!r) throw Error('Actual object reaction was not recorded');
        outcomes[r.verdict] = (outcomes[r.verdict] || 0) + 1;
        __T.scan(reply.them, 'object reaction', bad);
      }
      return { outcomes, bad };
    });
    assert.ok(r.outcomes.fear >= 28);
    assert.deepEqual(r.bad, []);
    assert.equal(records.filter(r => r.decision === 'dialog.object.greed').length, 32);
    assert.equal(records.filter(r => r.decision === 'dialog.object.fear').length, 32 - (r.outcomes.greed || 0));
    assert.equal(inputs.length, records.length);
    assert.ok(records.every(r => r.accepted && r.authority === 'actor' && r.object === 'head'));
    await page.connectDecisions();
    const normal = await page.evaluate(() => {
      const seen = {};
      for (let seed = 0; seed < 128; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const c = freeChars()[0],
          prose = _words;
        TRACE = [];
        const kind = ObjectReactions.choose(c, 'head');
        if (TRACE.length !== (kind === 'greed' ? 1 : 2) || _words !== prose)
          throw Error('Object resolver changed the conditional gate sequence');
        seen[kind] = (seen[kind] || 0) + 1;
      }
      TRACE = null;
      return seen;
    });
    for (const kind of ['greed', 'fear', 'calm']) assert.ok(normal[kind] > 0, kind);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
