const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

test('expressions react to public pressure, not private beliefs or unexpressed dislike', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [];
      let publicFaces = 0;
      for (let seed = 0; seed < 48; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const c = C(S.order[0]),
          others = freeChars().filter(o => o.id !== c.id);
        S.said = [];
        for (const id of S.order) {
          S.sus[id] = {};
          S.like[id] = {};
        }
        const dice = [_seed, _words],
          before = ownLot(c, placeOf(c)),
          face = pictureFace(c);
        for (const o of others) {
          S.sus[o.id][c.id] = RULES.scale.suspicion;
          S.like[o.id][c.id] = RULES.ties.cannotBear;
        }
        if (JSON.stringify(before) !== JSON.stringify(ownLot(c, placeOf(c))) || face !== pictureFace(c))
          problems.push('Private information affected expression at ' + seed);
        others.forEach(o => Suspicion.sayAloud(o.id, c.id, 'cult', 'blame'));
        if (!(ownLot(c, placeOf(c)).trouble > before.trouble)) problems.push('Public accusations had no effect at ' + seed);
        if (pictureFace(c) !== face) publicFaces++;
        if (_seed !== dice[0] || _words !== dice[1]) problems.push('Expression consumed dice');
      }
      return { problems, publicFaces };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.publicFaces > 0);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('ordinary accusation, Watcher choice and Dreamer retelling do not consult another role', async () => {
  const { page, errors } = await openNode();
  try {
    const count = await page.evaluate(() => {
      let decisions = 0;
      for (let seed = 0; seed < 32; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const actors = [
          freeChars().find(c => c.role === 'bystander'),
          freeChars().find(c => c.role === 'warden'),
          freeChars().find(c => c.role === 'seer')
        ];
        for (let i = 0; i < actors.length; i++) {
          const actor = actors[i],
            others = freeChars().filter(c => c.id !== actor.id),
            restores = [];
          if (i === 2) {
            claimOf(actor).role = 'seer';
            actor.visions = [{ about: others[0].id, cult: true }];
            S.loc = null;
          }
          try {
            for (const c of others) {
              const role = Object.getOwnPropertyDescriptor(c, 'role');
              restores.push(() => Object.defineProperty(c, 'role', role));
              Object.defineProperty(c, 'role', {
                configurable: true,
                get() {
                  throw new Error('Actor read inaccessible role of ' + c.id);
                }
              });
            }
            if (i === 0) innocentBlames(actor, others);
            if (i === 1) Watch.choose({ watcher: actor });
            if (i === 2) {
              const dream = trueDream(actor, true);
              if (!dream || !dream.cult) throw new Error('Dreamer changed recorded belief');
            }
            decisions++;
          } finally {
            restores.forEach(restore => restore());
          }
        }
      }
      return decisions;
    });
    assert.equal(count, 96);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('gossip uses remembered impressions without reading other private traits, ties or rapport', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const kinds = {},
        problems = [];
      let decisions = 0;
      for (let seed = 0; seed < 48; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const speaker = freeChars().find(c => c.role === 'bystander'),
          id = speaker.id;
        // Give each subject an observed opinion so the thinks branch is exercised.
        S.rumors = S.order.filter(k => k !== id).map(by => ({ day: 1, kind: 'good', by, heardBy: [id] }));
        const saved = JSON.stringify(S),
          dice = [_seed, _words];
        const sample = guarded => {
          S = JSON.parse(saved);
          [_seed, _words] = dice;
          const deny = name => ({
            configurable: true,
            get() {
              throw new Error('Gossip read ' + name);
            }
          });
          if (guarded)
            for (const other of S.order.filter(k => k !== id)) {
              Object.defineProperty(S.temper, other, deny('private temperament'));
              Object.defineProperty(C(other), 'rapport', deny('private rapport'));
              Object.defineProperty(S.like, other, deny('another person’s private affinity'));
              Object.defineProperty(S.flirt, other, deny('another person’s private attraction'));
            }
          const lines = [];
          for (let n = 0; n < 50; n++) {
            lines.push(Gossip.line(C(id), [], n % 2 === 0));
            lines.push(flirtGossip(C(id), [], n % 2 === 0));
          }
          return {
            lines: JSON.stringify(lines.map(g => g && { target: g.t.id, text: g.text, hear: g.hear })),
            dice: [_seed, _words],
            testimony: S.testimony
          };
        };
        const before = sample(false),
          guarded = sample(true);
        if (before.lines !== guarded.lines || JSON.stringify(before.dice) !== JSON.stringify(guarded.dice)) problems.push(seed);
        for (const t of guarded.testimony) kinds[t.kind] = (kinds[t.kind] || 0) + 1;
        decisions += 100;
      }
      return { problems, kinds, decisions };
    });
    assert.deepEqual(result.problems, []);
    assert.equal(result.decisions, 4800);
    for (const kind of ['temper', 'bond', 'flirt', 'thinks']) assert.ok(result.kinds[kind] >= 20, JSON.stringify(result.kinds));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('opinions require a recorded route and doctrine can be confidently wrong', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      let wrong = 0,
        right = 0,
        memories = 0;
      const problems = [];
      for (let seed = 0; seed < 80; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const [a, b, absent] = S.order.map(C);
        S.rumors = [{ day: 1, kind: 'good', by: b.id, heardBy: [absent.id] }];
        const unknown = Knowledge.opinion(a, b),
          dice = [_seed, _words];
        if (unknown.value !== null || unknown.route !== 'unknown') problems.push('Unheard gossip became knowledge');
        C(b.id).rapport = RULES.scale.trustMax;
        Knowledge.opinion(a, b);
        if (_seed !== dice[0] || _words !== dice[1]) problems.push('Private rapport triggered an inference');
        S.rumors[0].heardBy.push(a.id);
        const heard = Knowledge.opinion(a, b),
          after = [_seed, _words];
        if (!['good', 'bad'].includes(heard.value) || heard.day !== 1 || heard.route !== 'heard in person')
          problems.push('Missing heard source');
        if (Knowledge.opinion(a, b) !== heard || _seed !== after[0] || _words !== after[1]) problems.push('Remembered inference rerolled');
        for (const c of S.order.map(C)) {
          const m = S.knowledge.people[c.id];
          for (const section of ['temper', 'bonds', 'flirts'])
            for (const r of Object.values(m[section])) {
              memories++;
              if (!r.source || !r.route || r.day > S.day || r.confidence !== 'tentative') problems.push('Missing impression provenance');
            }
          if (c.role !== 'cult') {
            if (m.doctrine) problems.push('Nonmember received cult doctrine');
            continue;
          }
          const d = Knowledge.doctrine(c);
          if (d.day !== 0 || d.route !== 'remembered doctrine' || d.confidence !== 'assured' || d.value.power !== S.patron)
            problems.push('Missing initiation circumstances');
          if (d.value.ward === S.wardOf[S.patron]) right++;
          else wrong++;
        }
      }
      return { problems, wrong, right, memories };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.wrong >= 10 && result.right >= 50, JSON.stringify(result));
    assert.ok(result.memories >= 10000);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('scholarly reports use presented inscriptions and preserve interpretation separately from deception', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      let studies = 0,
        falseReports = 0,
        rejected = 0;
      const problems = [];
      for (let seed = 0; seed < 64; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.day = 3;
        S.slot = 1;
        S.items.push(...S.charms);
        const truth = { titles: { ...S.titleOf }, wards: { ...S.godOfWard } };
        for (const k of ['patron', 'wardOf', 'godOfWard', 'titleOf'])
          Object.defineProperty(S, k, {
            configurable: true,
            get() {
              throw new Error('Scholar consulted hidden current truth: ' + k);
            }
          });
        try {
          Knowledge.study(C('hamid'), 'ward', S.charms[0]);
        } catch {
          rejected++;
        }
        try {
          Knowledge.study(C('zahrun'), 'ward', S.charms[0]);
        } catch {
          rejected++;
        }
        for (const id of GLOSSERS) {
          const c = C(id),
            e = Object.keys(truth.titles)[0],
            report = glossBy(c, e),
            memory = S.knowledge.people[id].studies['title:' + e];
          if (memory.day !== 3 || memory.slot !== 1 || !memory.source || !memory.route || memory.report !== report.g)
            problems.push('Missing title interpretation source');
          if (c.role === 'cult' && memory.value !== report.g) falseReports++;
          studies++;
        }
        for (const id of SCHOLARS) {
          const c = C(id),
            w = S.charms[0],
            report = scholarRead(c, w),
            memory = S.knowledge.people[id].studies['ward:' + w],
            dice = [_seed, _words];
          if (memory.day !== 3 || memory.slot !== 1 || !memory.source || !memory.route || !memory.report)
            problems.push('Missing charm interpretation source');
          if (scholarRead(c, w) !== report || _seed !== dice[0] || _words !== dice[1]) problems.push('Repeated study rerolled');
          if (c.role === 'cult' && JSON.stringify(memory.value) !== JSON.stringify(memory.report)) falseReports++;
          studies++;
        }
      }
      return { problems, studies, falseReports, rejected };
    });
    assert.deepEqual(result.problems, []);
    assert.equal(result.studies, 320);
    assert.equal(result.rejected, 128);
    assert.ok(result.falseReports >= 10);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('sanctum theft chooses from doctrine before the world resolves the ward’s real effect', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [];
      let thefts = 0,
        mistaken = 0;
      for (let seed = 0; seed < 160; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const c = freeCult()[0],
          belief = Knowledge.doctrine(c).value.ward;
        S.items = [...S.charms];
        S.fin = { comp: [c.id], left: [], acts: [] };
        const saved = JSON.stringify(S),
          dice = [_seed, _words],
          choices = [];
        for (const changed of [false, true]) {
          S = JSON.parse(saved);
          [_seed, _words] = dice;
          if (changed) S.wardOf[S.patron] = S.charms.find(w => w !== belief);
          const action = turnAtTheEnd();
          choices.push(JSON.stringify({ action, stolen: S.fin.theft?.burnt, pretending: S.fin.theft?.pretending, dice: [_seed, _words] }));
          if (S.fin.theft) {
            thefts++;
            if (!S.fin.theft.belief.source || S.fin.theft.by !== c.id) problems.push('Missing theft motive');
            if (S.fin.mistakenTheft) {
              mistaken++;
              if (S.fin.theft.pretending || S.fin.stolen || S.fin.feint) problems.push('Mistake confused with deliberate feint');
            }
          }
        }
        if (choices[0] !== choices[1]) problems.push('Hidden true ward changed the actor’s action at seed ' + seed);
      }
      return { problems, thefts, mistaken };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.thefts >= 50 && result.mistaken >= 20, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('activity impressions require local observation and never borrow the cult’s ledger', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [],
        styles = {};
      let memories = 0;
      for (let seed = 0; seed < 48; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const [a, b, absent] = S.order.map(C);
        S.here.camp = [a.id, b.id];
        for (const c of S.order.map(C))
          Object.defineProperty(c, 'role', {
            configurable: true,
            get() {
              throw Error('Witnessing consulted a role');
            }
          });
        for (let n = 0; n < 12; n++) {
          S.day = 1 + Math.floor(n / 3);
          S.slot = n % 3;
          Knowledge.witnessAction(['examine', 'study', 'search'][n % 3], 'camp');
          Knowledge.witnessAction('night', 'camp', a);
        }
        if (Knowledge.knownActions(absent).length) problems.push('Absent actor acquired a memory');
        Object.defineProperty(S, 'acts', {
          configurable: true,
          get() {
            throw Error('Actor borrowed cult observations');
          }
        });
        const dice = [_seed, _words];
        for (const c of [a, b]) {
          for (const r of Knowledge.knownActions(c)) {
            memories++;
            if (!r.source || !r.route || r.at !== 'camp' || r.day > S.day) problems.push('Missing activity provenance');
          }
          const once = Knowledge.styles(c),
            twice = Knowledge.styles(c);
          if (JSON.stringify(once) !== JSON.stringify(twice)) problems.push('Repeated style assessment changed');
          for (const s of once) styles[s] = (styles[s] || 0) + 1;
        }
        if (_seed !== dice[0] || _words !== dice[1]) problems.push('Style assessment rolled dice');
      }
      return { problems, styles, memories };
    });
    assert.deepEqual(result.problems, []);
    for (const style of ['sleuth', 'scholar', 'delver']) assert.ok(result.styles[style] >= 20, JSON.stringify(result));
    assert.ok(result.memories >= 500);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('volunteering does not react to unexpressed suspicions', async () => {
  const { page, errors } = await openNode();
  try {
    const problems = await page.evaluate(() => {
      const problems = [];
      for (let seed = 0; seed < 80; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.said = [];
        const dice = [_seed, _words],
          before = volunteers();
        [_seed, _words] = dice;
        for (const row of Object.values(S.sus)) for (const id of S.order) row[id] = RULES.scale.suspicion;
        if (JSON.stringify(before) !== JSON.stringify(volunteers())) problems.push(seed);
      }
      return problems;
    });
    assert.deepEqual(problems, []);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('deed allegations follow what a witness saw and public violence, not actual private guilt', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [];
      let accusations = 0,
        falseAccusations = 0,
        unsupported = 0;
      for (let seed = 0; seed < 96; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        const [witness, victim] = freeChars();
        S.day = 2;
        victim.status = 'taken';
        victim.takenDay = 1;
        const saved = JSON.stringify(S),
          dice = [_seed, _words],
          results = [];
        for (const outcome of ['away', 'killed']) {
          S = JSON.parse(saved);
          [_seed, _words] = dice;
          C(victim.id).takenBy = outcome === 'killed' ? 'you' : 'cult';
          const d = { day: 1, id: victim.id, seenBy: witness.id, outcome },
            html = deedKnown(d, C(victim.id), outcome === 'killed');
          if (d.caught) {
            accusations++;
            if (outcome === 'away') falseAccusations++;
          }
          results.push(JSON.stringify({ html, caught: d.caught, hinted: d.hinted, allegation: d.allegation, dice: [_seed, _words] }));
        }
        if (results[0] !== results[1]) problems.push('Private guilt changed the same witnessed circumstances');
        S = JSON.parse(saved);
        [_seed, _words] = dice;
        C(victim.id).status = 'present';
        const hidden = { day: 1, id: victim.id, seenBy: witness.id, outcome: 'killed' };
        deedKnown(hidden, C(victim.id), true);
        if (hidden.caught) unsupported++;
      }
      return { problems, accusations, falseAccusations, unsupported };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.accusations >= 30 && result.falseAccusations >= 15, JSON.stringify(result));
    assert.equal(result.unsupported, 0);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('a granted public accusation does not silence honest cultists with a private framing roll', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const bus = window.busFor,
        problems = [];
      let named = 0;
      window.busFor = () => null;
      try {
        for (let seed = 0; seed < 96; seed++) {
          newGame('Marlowe', 'philologist', false, seed);
          const s = freeCult()[0],
            others = freeChars().filter(c => c.role !== 'cult');
          S.temper[s.id] = 'honest';
          for (const c of others) S.sus[s.id][c.id] = RULES.scale.suspicion;
          const dice = [_seed, _words],
            ordinary = innocentBlames(s, others),
            after = [_seed, _words];
          [_seed, _words] = dice;
          const actual = cultNamesAloud(s, others);
          if (actual?.id !== ordinary?.id || JSON.stringify(after) !== JSON.stringify([_seed, _words])) problems.push(seed);
          if (actual) named++;
        }
      } finally {
        window.busFor = bus;
      }
      return { named, problems };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.named >= 80, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('firsthand public accusations require the speaker’s own shared outing, never an anonymous hidden identity', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      let sightings = 0,
        judgments = 0;
      const problems = [];
      for (let seed = 0; seed < 96; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.day = 2;
        const [s, t, other] = freeChars(),
          saved = JSON.stringify(S),
          dice = [_seed, _words],
          results = [];
        for (const variant of ['absent', 'anonymous', 'shared']) {
          S = JSON.parse(saved);
          [_seed, _words] = dice;
          const own = { loc: variant === 'shared' ? 'trench' : 'camp', with: variant === 'shared' ? t.id : null };
          S.nights[1] = {
            truth: new Proxy(
              { [s.id]: own },
              {
                get(target, key) {
                  if (key !== s.id) throw Error('Read someone else’s actual outing');
                  return target[key];
                }
              }
            ),
            saw: { [s.id]: { who: variant === 'anonymous' ? t.id : other.id, cat: 'hair', where: 'camp', to: 'trench' } }
          };
          const html = blameAloud(C(s.id), C(t.id)),
            record = S.said[S.said.length - 1];
          results.push({ html, record, dice: [_seed, _words] });
          if (record.claim === 'sighting') {
            sightings++;
            if (variant !== 'shared' || record.basis.source !== 'shared outing' || record.basis.day !== 1)
              problems.push('Unsupported sighting');
          } else judgments++;
        }
        if (JSON.stringify(results[0]) !== JSON.stringify(results[1])) problems.push('Anonymous world identity changed the utterance');
        if (JSON.stringify(results[0].dice) !== JSON.stringify(results[2].dice)) problems.push('Wording changed existing dice consumption');
      }
      return { problems, sightings, judgments };
    });
    assert.deepEqual(result.problems, []);
    assert.ok(result.sightings >= 15 && result.judgments >= 192, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('ordinary style allegations use only personal observations, and contact claims use witnessed conversations', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [],
        kinds = {},
        deny = k => ({
          configurable: true,
          get() {
            throw Error('Ordinary speaker read ' + k);
          }
        });
      let spoke = 0,
        unsupported = 0;
      for (let seed = 0; seed < 160; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.day = 3;
        const s = freeChars().find(c => c.role === 'bystander'),
          f = freeChars().find(c => c.id !== s.id),
          style = ['sleuth', 'scholar', 'delver', 'inquisitor', 'confidant'][seed % 5],
          kind = RULES.knowledge.styles[style][0];
        for (const c of freeChars()) S.knowledge.people[c.id].actions = [];
        S.knowledge.people[s.id].actions = [0, 1].map(slot => ({
          value: kind,
          source: 'player’s action',
          route: 'noticed in person',
          day: 2,
          slot,
          at: 'camp',
          with: style === 'sleuth' ? f.id : null
        }));
        const defaults = Knowledge.styles(s);
        if (defaults.some(k => !['sleuth', 'scholar', 'delver'].includes(k))) problems.push('Influence default styles expanded');
        const dice = [_seed, _words],
          contacts = Knowledge.contacts(s);
        if ((style === 'sleuth') !== contacts.length > 0) problems.push('Contact inferred without two witnessed conversations');
        if (_seed !== dice[0] || _words !== dice[1]) problems.push('Contact assessment consumed dice');
        for (const k of ['acts', 'turned', 'plots']) Object.defineProperty(S, k, deny(k));
        for (let attempt = 0; attempt < 15 && !S.log.ways.length; attempt++) wayTalk();
        const r = S.log.ways[0];
        if (r) {
          spoke++;
          kinds[r.k] = (kinds[r.k] || 0) + 1;
          if (r.by !== s.id || r.cult || !r.basis.every(b => b.day === 2 && b.source && b.route) || (r.k === 'sleuth' && r.about !== f.id))
            problems.push('Missing actor source');
        }
        S.log.ways = [];
        S.knowledge.people[s.id].actions = [];
        for (let attempt = 0; attempt < 8; attempt++) if (wayTalk()) unsupported++;
      }
      return { problems, kinds, spoke, unsupported };
    });
    assert.deepEqual(result.problems, []);
    assert.equal(result.unsupported, 0);
    assert.ok(result.spoke >= 100, JSON.stringify(result));
    for (const k of ['sleuth', 'scholar', 'delver', 'inquisitor', 'confidant']) assert.ok(result.kinds[k] >= 15, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('dream doubts need a public dream and never make an ordinary speaker execute a private cult plot', async () => {
  const { page, errors } = await openNode();
  try {
    const result = await page.evaluate(() => {
      const problems = [];
      let ordinary = 0,
        planned = 0,
        privateSilences = 0;
      for (let seed = 0; seed < 96; seed++) {
        newGame('Marlowe', 'philologist', false, seed);
        S.day = 3;
        const d = freeChars().find(c => c.role === 'seer'),
          s = freeChars().find(c => c.role === 'bystander'),
          k = freeCult()[0];
        S.said = [];
        S.plots = [{ kind: 'discredit', id: d.id, by: k.id, day: 2, until: 5, done: false }];
        if (doubtTalk() || S.plots[0].done) problems.push('Private dream or plot acquired a public opportunity');
        else privateSilences++;
        S.said = [{ day: 2, by: d.id, about: s.id, verdict: 'cult', how: 'dream' }];
        for (const c of freeChars()) S.like[c.id][d.id] = c.id === s.id ? -2 : 2;
        const plots = S.plots;
        Object.defineProperty(S, 'plots', {
          configurable: true,
          get() {
            throw Error('Ordinary actor read private cult plot');
          }
        });
        for (let attempt = 0; attempt < 100 && !S.log.doubts.length; attempt++) doubtTalk();
        const a = S.log.doubts[0];
        if (a) {
          ordinary++;
          if (a.by !== s.id || a.cult || a.plot || a.basis.source !== 'public dream' || a.basis.day !== 2)
            problems.push('Invalid ordinary doubt source');
        }
        Object.defineProperty(S, 'plots', { configurable: true, writable: true, value: plots });
        S.log.doubts = [];
        for (const c of freeChars()) S.like[c.id][d.id] = c.id === k.id ? -2 : 2;
        for (let attempt = 0; attempt < 100 && !S.log.doubts.length; attempt++) doubtTalk();
        const b = S.log.doubts[0];
        if (b) {
          planned++;
          if (b.by !== k.id || !b.cult || b.plot.by !== k.id || !S.plots[0].done || b.basis.day !== 2)
            problems.push('Invalid coordinated source');
        }
      }
      return { problems, ordinary, planned, privateSilences };
    });
    assert.deepEqual(result.problems, []);
    assert.equal(result.privateSilences, 96);
    assert.ok(result.ordinary >= 80 && result.planned >= 80, JSON.stringify(result));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
