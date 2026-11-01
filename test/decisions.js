const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');
const { play, fingerprint } = require('./lib/season');

test('named floor and cap steps preserve existing operators, evaluation order and discarded draws', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4242);
      const oldOperator = label => (ODDS_STEP[label] ? label : label.charAt(0)),
        newOperator = label => (ODDS_STEP[label.split(/\s/, 1)[0]] ? label.split(/\s/, 1)[0] : label.charAt(0)),
        existing = Decisions.descriptions()
          .filter(d => !d.id.startsWith('dialog.object.'))
          .flatMap(d => d.influences),
        order = [],
        steps = [
          [
            'base',
            () => {
              order.push('base');
              return 0.2;
            }
          ],
          [
            'floor',
            () => {
              order.push('strong');
              return 0.25;
            }
          ],
          [
            'floor',
            () => {
              order.push('weak');
              return 0.22;
            }
          ],
          [
            'cap',
            () => {
              order.push('cap');
              return 0.3;
            }
          ],
          [
            '* discarded draw',
            () => {
              order.push('discard');
              chance(0.5);
              return 1;
            }
          ]
        ],
        prior = odds('test floor', steps),
        named = odds(
          'test floor',
          steps.map(([label, f], i) => [
            label === 'floor' ? label + ' remembered ' + i : label === 'cap' ? 'cap permitted range' : label,
            f
          ])
        ),
        dice = [_seed, _words];
      TRACE = [];
      const expected = { result: prior.roll(), order: [...order], dice: TRACE.map(d => [...d]), final: [_seed, _words] };
      [_seed, _words] = dice;
      order.length = 0;
      TRACE = [];
      const actual = { result: named.roll(), order: [...order], dice: TRACE.map(d => [...d]), final: [_seed, _words] },
        explanation = TRACE.at(-1).why;
      TRACE = null;
      return {
        expected,
        actual,
        explanation,
        existing: existing.length,
        changed: existing.filter(label => oldOperator(label) !== newOperator(label))
      };
    });
    assert.deepEqual(result.actual, result.expected);
    assert.equal(result.actual.dice.length, 2);
    assert.deepEqual(result.changed, []);
    assert.ok(result.existing > 100);
    assert.ok(result.explanation.some(step => step[0] === 'floor remembered 1'));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

async function fixture() {
  const env = await openNode();
  await env.page.evaluate(() => {
    if (Decisions.schema !== 1) throw Error('Unexpected decision schema');
    newGame('Marlowe', 'philologist', false, 4242);
    window.__decisionTest = { order: [], p: 0.25 };
    window.__testDecision = Decisions.define({
      id: 'test.actor',
      action: 'fixture',
      authority: 'actor',
      subject: () => {
        __decisionTest.order.push('subject');
        return 'player';
      },
      object: () => {
        __decisionTest.order.push('object');
        return null;
      },
      knowledge: ['The subject observes the supplied fixture signal.'],
      features: { signal: 'number' },
      observe: () => {
        __decisionTest.order.push('observe');
        return { signal: 7 };
      },
      probability: () => {
        __decisionTest.order.push('baseline');
        return __decisionTest.p;
      },
      apply: yes => {
        __decisionTest.order.push('apply');
        return { yes };
      }
    });
  });
  return env;
}

test('decision descriptions are static and default execution remains lazy', async () => {
  const { page, errors } = await fixture();
  try {
    const r = await page.evaluate(() => {
      const before = [JSON.stringify(S), _seed, _words];
      const descriptions = Decisions.descriptions();
      const inspected = [JSON.stringify(S), _seed, _words];
      const staticCalls = [...__decisionTest.order];
      const result = __testDecision.run();
      return {
        before,
        inspected,
        staticCalls,
        order: __decisionTest.order,
        result,
        descriptor: descriptions.find(d => d.id === 'test.actor')
      };
    });
    assert.deepEqual(r.before, r.inspected);
    assert.deepEqual(r.staticCalls, []);
    assert.deepEqual(r.order, ['baseline', 'apply']);
    assert.equal(typeof r.result.yes, 'boolean');
    assert.deepEqual(r.descriptor.features, { signal: 'number' });
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('host policy sees only serialized actor input and evaluator records arrive separately', async () => {
  const { page, errors } = await fixture(),
    requests = [],
    records = [];
  try {
    let hostGlobal;
    await page.connectDecisions({
      policy(raw) {
        hostGlobal = typeof globalThis.S;
        assert.equal(typeof raw, 'string');
        const request = JSON.parse(raw);
        requests.push(request);
        return JSON.stringify({ schema: 1, decision: request.decision, probability: 0.73 });
      },
      record(raw) {
        records.push(JSON.parse(raw));
      }
    });
    const result = await page.evaluate(() => {
      const seed = _seed,
        words = _words;
      TRACE = [];
      const expected = chance(0.73),
        expectedSeed = _seed;
      _seed = seed;
      TRACE = [];
      const actual = __testDecision.run();
      return {
        expected,
        expectedSeed,
        actual,
        seed: _seed,
        words,
        finalWords: _words,
        order: __decisionTest.order,
        trace: TRACE,
        leakedBridge: typeof __decisionBridge
      };
    });
    assert.equal(hostGlobal, 'undefined');
    assert.equal(result.leakedBridge, 'undefined');
    assert.equal(result.actual.yes, result.expected);
    assert.equal(result.seed, result.expectedSeed);
    assert.equal(result.words, result.finalWords);
    assert.deepEqual(result.order, ['baseline', 'subject', 'object', 'observe', 'apply']);
    assert.equal(requests.length, 1);
    assert.deepEqual(Object.keys(requests[0]).sort(), [
      'action',
      'bounds',
      'decision',
      'mode',
      'object',
      'observation',
      'outcomes',
      'schema',
      'subject'
    ]);
    assert.deepEqual(requests[0].observation, { signal: 7 });
    assert.equal(requests[0].mode, 'chance');
    assert.deepEqual(requests[0].outcomes, ['apply', 'skip']);
    assert.equal(records.length, 1);
    assert.equal(records[0].baseline, 0.25);
    assert.equal(records[0].probability, 0.73);
    assert.equal(records[0].result, result.expected);
    assert.deepEqual(records[0].accepted, { schema: 1, decision: 'test.actor', probability: 0.73 });
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('invalid, asynchronous and throwing policies reject before the gate draw', async () => {
  const variants = [
    () => '{',
    () => JSON.stringify({ schema: 2, decision: 'test.actor', probability: 0.5 }),
    () => JSON.stringify({ schema: 1, decision: 'other', probability: 0.5 }),
    () => JSON.stringify({ schema: 1, decision: 'test.actor', probability: 0 }),
    () => JSON.stringify({ schema: 1, decision: 'test.actor', probability: 1 }),
    () => JSON.stringify({ schema: 1, decision: 'test.actor', probability: null }),
    () => JSON.stringify({ schema: 1, decision: 'test.actor', probability: 0.5, hidden: true }),
    () => ({ schema: 1, decision: 'test.actor', probability: 0.5 }),
    () => Promise.resolve(null),
    () => {
      throw Error('Controller failure');
    }
  ];
  for (const policy of variants) {
    const { page } = await fixture();
    try {
      const before = await page.evaluate(() => [_seed, _words, JSON.stringify(S)]);
      await page.connectDecisions({ policy });
      await assert.rejects(page.evaluate(() => __testDecision.run()));
      assert.deepEqual(await page.evaluate(() => [_seed, _words, JSON.stringify(S)]), before);
      assert.deepEqual(await page.evaluate(() => __decisionTest.order), ['baseline', 'subject', 'object', 'observe']);
    } finally {
      await page.close();
    }
  }
  const { page } = await fixture();
  try {
    await assert.rejects(page.connectDecisions({ policy: async () => null }), /synchronous/);
  } finally {
    await page.close();
  }
});

test('impossible gates, world resolution and unaudited legacy rules never reach a policy', async () => {
  const { page } = await fixture(),
    records = [];
  let called = 0;
  try {
    await page.connectDecisions({
      policy: () => {
        called++;
        return null;
      },
      record: raw => records.push(JSON.parse(raw))
    });
    const r = await page.evaluate(() => {
      __decisionTest.p = 0;
      const seed = _seed,
        result = __testDecision.run(),
        afterImpossible = _seed;
      for (const authority of ['world', 'legacy']) {
        const d = Decisions.define({
          id: 'test.' + authority,
          action: 'fixture',
          authority,
          subject: 'world',
          knowledge: ['Explicitly outside the audited actor boundary.'],
          probability: () => 0.5
        });
        d.run();
      }
      const rejected = [];
      for (const authority of ['world', 'legacy']) {
        try {
          Decisions.define({
            id: 'test.invalid.' + authority,
            action: 'fixture',
            authority,
            subject: 'world',
            knowledge: ['Invalid actor observation.'],
            features: { signal: 'number' },
            observe: () => ({ signal: 1 }),
            probability: () => 0.5
          });
        } catch {
          rejected.push(authority);
        }
      }
      return { seed, afterImpossible, result, rejected };
    });
    assert.equal(called, 0);
    assert.equal(r.seed, r.afterImpossible);
    assert.equal(r.result.yes, false);
    assert.deepEqual(r.rejected, ['world', 'legacy']);
    assert.equal(records.length, 3);
    assert.deepEqual(
      records.map(r => r.authority),
      ['actor', 'world', 'legacy']
    );
  } finally {
    await page.close();
  }
});

test('named influences retain order, read late state and preserve existing TRACE annotations', async () => {
  const { page } = await fixture();
  try {
    const r = await page.evaluate(() => {
      const order = [],
        base = odds('fixture ordered odds', [
          [
            'base',
            () => {
              order.push('base');
              return 0.2;
            }
          ],
          [
            '+late',
            () => {
              order.push('late');
              return __decisionTest.p;
            }
          ],
          [
            '*last',
            () => {
              order.push('last');
              return 0.5;
            }
          ]
        ]),
        d = Decisions.define({
          id: 'test.ordered',
          action: 'fixture',
          authority: 'actor',
          subject: 'player',
          object: 'player',
          knowledge: ['An explicit test of ordered existing arithmetic.'],
          probability: base
        });
      const seed = _seed,
        words = _words;
      __decisionTest.p = 0.4;
      TRACE = [];
      const expected = base.roll(),
        expectedTrace = JSON.stringify(TRACE.map(d => ({ values: [...d], why: d.why || null }))),
        expectedSeed = _seed;
      _seed = seed;
      _words = words;
      order.length = 0;
      TRACE = [];
      const actual = d.roll();
      return {
        expected,
        actual,
        expectedSeed,
        seed: _seed,
        words,
        finalWords: _words,
        expectedTrace,
        trace: JSON.stringify(TRACE.map(d => ({ values: [...d], why: d.why || null }))),
        order,
        why: TRACE_WHY
      };
    });
    assert.equal(r.actual, r.expected);
    assert.equal(r.seed, r.expectedSeed);
    assert.equal(r.finalWords, r.words);
    assert.equal(r.trace, r.expectedTrace);
    assert.deepEqual(r.order, ['base', 'late', 'last']);
    assert.equal(r.why, null);
  } finally {
    await page.close();
  }
});

test('a rejected policy does not leave a named trace attached to an unrelated later roll', async () => {
  const { page } = await fixture();
  try {
    await page.connectDecisions({
      policy: () => {
        throw Error('Rejected deliberately');
      }
    });
    const r = await page.evaluate(() => {
      TRACE = [];
      const seed = _seed;
      try {
        TAKES_CONFIDENCE.roll(freeChars()[0]);
      } catch (e) {
        if (e.message !== 'Rejected deliberately') throw e;
      }
      const unchanged = _seed === seed,
        why = TRACE_WHY;
      chance(0.4);
      return { unchanged, why, trace: TRACE };
    });
    assert.equal(r.unchanged, true);
    assert.equal(r.why, null);
    assert.equal(r.trace.length, 1);
    assert.equal(r.trace[0].why, undefined);
  } finally {
    await page.close();
  }
});

test('typed consequences delegate synchronously to existing state owners', async () => {
  const { page } = await fixture();
  try {
    const r = await page.evaluate(() => {
      const a = S.order[0],
        b = S.order[1];
      C(a).rapport = RULES.ties.friend - 1;
      const saved = JSON.stringify(S),
        seed = _seed,
        words = _words,
        snapshot = () => [JSON.stringify(S), _seed, _words];
      Ties.moveTrust(C(a), 1);
      if (Ties.friend(C(a))) Ties.shiftLike(a, b, 1);
      Suspicion.move(a, b, 1);
      Ties.hound(a, 1);
      const expected = snapshot();
      S = JSON.parse(saved);
      _seed = seed;
      _words = words;
      Decisions.effect('trust', a, null, 1);
      if (Ties.friend(C(a))) Decisions.effect('like', a, b, 1);
      Decisions.effect('suspicion', a, b, 1);
      Decisions.effect('hounding', a, null, 1);
      return { expected, actual: snapshot() };
    });
    assert.deepEqual(r.actual, r.expected);
  } finally {
    await page.close();
  }
});

test('null policy and evaluator-only logging preserve complete expeditions and both streams', async () => {
  const { page, errors } = await openNode();
  try {
    let requests = 0,
      records = 0;
    for (const [i, seed] of [3, 4242, 0xffffffff].entries())
      for (const lang of ['en', 'ru']) {
        const args = { seed, bg: i, hardcore: i === 1, lang };
        await page.connectDecisions();
        const baseline = fingerprint(await page.evaluate(play, args));
        await page.connectDecisions({
          record: () => {
            records++;
          }
        });
        assert.deepEqual(fingerprint(await page.evaluate(play, args)), baseline);
        await page.connectDecisions({
          policy: () => {
            requests++;
            return null;
          },
          record: () => {
            records++;
          }
        });
        assert.deepEqual(fingerprint(await page.evaluate(play, args)), baseline);
      }
    assert.ok(records > 100, `Only ${records} actual decisions recorded`);
    assert.ok(requests > 0, 'No audited actor opportunity exercised');
    await page.evaluate(() => Decisions.connect());
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('choice overrides resolve once through the original command before nested gates', async () => {
  const { page } = await fixture(),
    requests = [],
    records = [];
  try {
    await page.evaluate(() => {
      window.__testChoice = Decisions.define({
        id: 'test.choice',
        action: 'choose',
        authority: 'actor',
        subject: 'player',
        knowledge: ['Two supplied visible choices.'],
        features: { scene: 'string' },
        observe: () => ({ scene: 'Two paths.' }),
        offer: () => [
          { id: 'a', label: 'Left' },
          { id: 'b', label: 'Right' }
        ],
        selection: i => (i ? 'b' : 'a'),
        accept: id => [id === 'b' ? 1 : 0],
        execute: i => {
          __decisionTest.order.push('choice:' + i);
          return __testDecision.run();
        }
      });
    });
    await page.connectDecisions({
      policy: raw => {
        const r = JSON.parse(raw);
        requests.push(r);
        return r.mode === 'choice' ? JSON.stringify({ schema: 1, decision: r.decision, choice: 'b' }) : null;
      },
      record: raw => records.push(JSON.parse(raw))
    });
    const r = await page.evaluate(() => {
      TRACE = [];
      const words = _words;
      __testChoice.run(0);
      return { order: __decisionTest.order, dice: TRACE, words, finalWords: _words };
    });
    assert.deepEqual(
      requests.map(x => x.mode),
      ['choice', 'chance']
    );
    assert.deepEqual(
      records.map(x => [x.sequence, x.decision]),
      [
        [0, 'test.choice'],
        [1, 'test.actor']
      ]
    );
    assert.equal(records[0].phase, 'selected');
    assert.equal(records[0].baseline, 'a');
    assert.equal(records[0].selected, 'b');
    assert.equal(Object.hasOwn(records[0], 'result'), false);
    assert.equal(r.order[0], 'choice:1');
    assert.equal(r.order.filter(x => x === 'choice:1').length, 1);
    assert.equal(r.dice.length, 1);
    assert.equal(r.words, r.finalWords);
    for (const choice of ['missing', 1, null]) {
      await page.connectDecisions({ policy: raw => JSON.stringify({ schema: 1, decision: JSON.parse(raw).decision, choice }) });
      const before = await page.evaluate(() => [JSON.stringify(S), _seed, _words, __decisionTest.order]);
      await assert.rejects(
        page.evaluate(() => __testChoice.run(0)),
        /unavailable/
      );
      assert.deepEqual(await page.evaluate(() => [JSON.stringify(S), _seed, _words, __decisionTest.order]), before);
    }
  } finally {
    await page.close();
  }
});

test('audited ordinary actors and offered player choices ignore unavailable hidden truth', async () => {
  const { page } = await fixture(),
    requests = [];
  try {
    await page.connectDecisions({
      policy: raw => {
        requests.push(JSON.parse(raw));
        throw Error('Captured without resolution');
      }
    });
    const r = await page.evaluate(() => {
      const c = freeChars().find(a => a.role !== 'cult'),
        t = freeChars().find(a => a.id !== c.id);
      const capture = () => {
        for (const call of [
          () => PRESS_COOPERATES.roll(c),
          () => PRESS_TRUST.roll(c),
          () => TAKES_CONFIDENCE.roll(c),
          () => DEFENDS_DREAM.roll(c, t, false),
          () => PLAYER_CHOICE.run(0)
        ])
          try {
            call();
          } catch (e) {
            if (e.message !== 'Captured without resolution') throw e;
          }
      };
      planScene();
      const seed = _seed,
        words = _words;
      capture();
      // None of these hidden facts belongs to this ordinary NPC's view, or
      // to a player who is looking at the already displayed planning scene.
      S.patron = S.gods.find(g => g !== S.patron);
      S.wardOf[S.patron] = S.charms.find(w => w !== S.wardOf[S.patron]);
      for (const other of freeChars().filter(a => a.id !== c.id)) {
        other.role = other.role === 'cult' ? 'ordinary' : 'cult';
        other.rapport = other.rapport === 4 ? -4 : 4;
        S.sus[other.id] = Object.fromEntries(S.order.map(id => [id, RULES.scale.suspicion]));
      }
      planScene();
      capture();
      return { seed, words, finalSeed: _seed, finalWords: _words };
    });
    assert.equal(requests.length, 10);
    assert.deepEqual(requests.slice(0, 5), requests.slice(5));
    assert.equal(requests[3].observation.targetCult, null);
    assert.equal(requests[4].mode, 'choice');
    assert.ok(requests[4].choices.length > 1);
    assert.equal(Object.hasOwn(requests[4], 'image'), false);
    assert.equal(r.finalSeed, r.seed);
    assert.equal(r.finalWords, r.words);
  } finally {
    await page.close();
  }
});
