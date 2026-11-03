const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { random, legacyLcg } = require('./lib/random');
const { normalQuantile, binomialInterval, rateRatio, checkExit } = require('./lib/statistics');
const { collector } = require('../sim/lib/tell-counts');
const replyTells = require('../sim/lib/reply-tells');
const { openNode } = require('./lib/harness');
const { fingerprint } = require('./lib/season');

test('macOS sandbox checks fail before browser spawn while shared and ordinary launches remain usable', () => {
  execFileSync(
    process.execPath,
    [
      '-e',
      `
      const assert = require('node:assert/strict');
      const engine = require('playwright').chromium;
      let launches = 0, connects = 0;
      engine.launch = async () => { launches++; return 'launched'; };
      engine.connect = async endpoint => { connects++; assert.equal(endpoint, 'ws://test-server'); return 'connected'; };
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
      process.env.KUTHA_BROWSER = 'chromium';
      process.env.CODEX_SANDBOX = 'seatbelt';
      delete process.env.KUTHA_BROWSER_WS;
      const harness = require('./test/lib/harness');
      (async () => {
        assert.throws(() => harness.launch(), /blocked before starting Chrome/);
        assert.equal(launches, 0);
        process.env.KUTHA_BROWSER_WS = 'ws://test-server';
        assert.equal(await harness.launch(), 'connected');
        assert.equal(connects, 1);
        assert.equal(launches, 0);
        delete process.env.KUTHA_BROWSER_WS;
        delete process.env.CODEX_SANDBOX;
        assert.equal(await harness.launch(), 'launched');
        Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
        process.env.CODEX_SANDBOX = 'seatbelt';
        assert.equal(await harness.launch(), 'launched');
        assert.equal(launches, 2);
      })().catch(error => { console.error(error.message); process.exitCode = 1; });
      `
    ],
    { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }
  );
});

test('test randomness reaches every integer choice without low-bit bias', () => {
  for (const n of [2, 3, 4, 6, 8, 10, 13]) {
    const r = random(17),
      counts = Array(n).fill(0);
    for (let k = 0; k < 10000; k++) counts[r.int(n)]++;
    for (const count of counts) assert.ok(Math.abs(count - 10000 / n) < (10000 / n) * 0.15, `${n} choices: ${counts}`);
  }
  const a = random(0),
    b = random(0);
  for (let k = 0; k < 100; k++) assert.equal(a(), b());
  assert.throws(() => a.int(0), RangeError);
  let x = 17;
  const legacy = legacyLcg(17);
  for (let k = 0; k < 100; k++) assert.equal(legacy(), (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
});

test('tell intervals preserve clustering, flag supported violations and distinguish missing evidence', () => {
  assert.ok(Math.abs(normalQuantile(0.975) - 1.95996398454) < 1e-7);
  const rows = Array.from({ length: 1000 }, (_, k) => [1, 2, k % 4 === 0 ? 1 : 0, 2]),
    r = rateRatio(rows),
    repeated = rateRatio(rows.map(row => row.map(n => 20 * n)));
  assert.equal(r.status, 'outside');
  assert.equal(r.ratio, 4);
  assert.deepEqual(repeated.interval, r.interval);
  assert.equal(checkExit([r]), 1);
  assert.equal(checkExit([], true), 2);
  const corrected = rateRatio(rows, { comparisons: 50 });
  assert.ok(corrected.interval[0] < r.interval[0] && corrected.interval[1] > r.interval[1]);
  const fair = rateRatio(rows.map((r, i) => [i % 2, 1, i % 2, 1]));
  assert.equal(fair.status, 'inside');
  const zero = rateRatio(rows.map(r => [r[0], r[1], 0, r[3]]));
  assert.equal(zero.ratio, Infinity);
  assert.deepEqual(zero.interval, [0, Infinity]);
  assert.equal(zero.status, 'insufficient');
  assert.equal(checkExit([zero]), 2);
  assert.equal(checkExit([zero], true), 0);
  assert.equal(checkExit([zero, r], true), 1);
});

test('exact paired intervals cover zero counts and match independently published binomial references', () => {
  // R binom.test(20,25), the more precise counterpart to NIST's rounded example.
  const expected = [0.592962567721323, 0.931688535987516];
  binomialInterval(20, 25).forEach((x, i) => assert.ok(Math.abs(x - expected[i]) < 1e-11));
  for (const n of [1, 25, 1000, 1000000]) {
    const zero = binomialInterval(0, n),
      all = binomialInterval(n, n);
    assert.equal(zero[0], 0);
    assert.equal(all[1], 1);
    assert.ok(Math.abs(zero[1] - (1 - 0.025 ** (1 / n))) < 1e-14);
    assert.ok(Math.abs(all[0] - 0.025 ** (1 / n)) < 1e-14);
    const middle = binomialInterval(Math.floor(n / 2), n, 1e-12);
    assert.ok(middle[0] <= Math.floor(n / 2) / n && middle[1] >= Math.floor(n / 2) / n);
  }
  const extreme = binomialInterval(1, 1000000, 1e-12);
  assert.ok(Math.abs(extreme[0] / 5e-19 - 1) < 1e-8);
  let prior = [0, 0];
  for (let k = 0; k <= 25; k++) {
    const interval = binomialInterval(k, 25),
      opposite = binomialInterval(25 - k, 25);
    interval.forEach((x, i) => {
      assert.ok(x >= prior[i]);
      assert.ok(Math.abs(x - (1 - opposite[1 - i])) < 1e-12);
    });
    prior = interval;
  }
  for (const args of [
    [1, 25, 1e-100],
    [1, 25, Number.MIN_VALUE],
    [1, 1000001],
    [-1, 25],
    [26, 25],
    [0, 0]
  ])
    assert.throws(() => binomialInterval(...args), RangeError);
  const rows = Array.from({ length: 10000 }, (_, i) => [+(i < 1000), 1, 0, 1]),
    violation = rateRatio(rows, { method: 'paired-bernoulli', comparisons: 50 });
  assert.equal(violation.status, 'outside');
  assert.ok(violation.interval[0] > 2);
  assert.equal(checkExit([violation], true), 1);
  assert.equal(rateRatio([[0, 1, 0, 1]], { method: 'paired-bernoulli' }).status, 'insufficient');
  assert.throws(() => rateRatio([[1, 2, 0, 2]], { method: 'paired-bernoulli' }), /one Bernoulli/);
  assert.throws(() => rateRatio([[0, 1, 0, 0]], { method: 'paired-bernoulli' }), /one Bernoulli/);
});

test('shared tell counts retain empty rows and the original independent cluster', () => {
  const c = collector();
  c.ensure('empty', 'paired-bernoulli');
  assert.throws(() => c.add('event', 'cult', true), /independent/);
  c.cluster(7);
  c.add('event', 'cult', true);
  c.add('event', 'cult', false);
  c.add('event', 'innocent', true);
  c.cluster(8);
  c.add('event', 'innocent', false);
  assert.deepEqual(c.table.event.totals, { cult: [1, 2], innocent: [1, 2] });
  assert.deepEqual(c.table.event.clusters[7], { cult: [1, 2], innocent: [1, 1] });
  assert.deepEqual(c.table.empty.clusters, {});
  assert.equal(c.table.empty.method, 'paired-bernoulli');
});

test('actual reply tells retain every declared topic/category and match the rendered mood aliases', async () => {
  const { page } = await openNode();
  try {
    for (const file of ['tell-counts.js', 'reply-tells.js']) await page.addScriptTag({ path: path.resolve(__dirname, '../sim/lib', file) });
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 11);
      const counts = __tellCounts.collector(),
        empty = __replyTells.install(counts, FACE_OF, MOODS);
      empty.stop();
      const renderings = [...MOODS, ...Object.keys(FACE_OF)].map(face => {
        S.cv = { themE: face };
        return [face, __replyTells.categoryOf(FACE_OF[face] || face), __replyTells.categoryOf(moodNow())];
      });
      let unknownRejected = false;
      try {
        __replyTells.install(counts, FACE_OF, [...MOODS, 'new-unclassified-mood']);
      } catch (error) {
        unknownRejected = /Unclassified/.test(error.message);
      }
      return { rows: Object.keys(counts.table), coverage: empty.coverage, renderings, unknownRejected };
    });
    assert.equal(replyTells.topics.length, 8);
    assert.equal(Object.keys(replyTells.categories).length, 4);
    assert.equal(new Set(replyTells.rows).size, 32);
    assert.deepEqual(result.rows, replyTells.rows);
    assert.deepEqual(result.coverage, {});
    assert.equal(result.unknownRejected, true);
    for (const [face, counted, rendered] of result.renderings) {
      assert.ok(counted, face);
      assert.equal(counted, rendered, face);
    }
  } finally {
    await page.close();
  }
});

test('actual reply instrumentation preserves complete play and covers both roles in all eight public topics', async () => {
  const before = await openNode(),
    after = await openNode();
  try {
    for (const file of ['tell-counts.js', 'reply-tells.js'])
      await after.page.addScriptTag({ path: path.resolve(__dirname, '../sim/lib', file) });
    await after.page.evaluate(() => {
      window.__replyCounts = __tellCounts.collector();
      window.__replyProbe = __replyTells.install(__replyCounts, FACE_OF, MOODS);
    });
    function playReplySeason(g) {
      const season = (386819 + Math.imul(g, 2654435761)) >>> 0;
      if (window.__replyCounts) __replyCounts.cluster(g);
      setLang(g % 2 ? 'ru' : 'en');
      TRACE = [];
      __T.start(g % 3, false, season);
      const trail = [],
        human = __T.policies.human(__T.rng(season ^ 31337), /Ask where they were|Ask whom they distrust|Make conversation|Speak with/);
      const ended = __T.play(
        buttons => {
          const chosen = human(buttons) || buttons[0];
          trail.push([S.phase, X((S_ui.scene.body || []).join('')), buttons.map(b => b.textContent), buttons.indexOf(chosen), S.cv]);
          return chosen;
        },
        { maxSteps: 1500 }
      );
      const met = new Map(),
        state = JSON.stringify(S, function (key, value) {
          if (typeof value === 'string') return X(value);
          if (!value || typeof value !== 'object') return value;
          if (met.has(value)) return '#' + met.get(value);
          met.set(value, met.size);
          return value;
        });
      return { ended, state, trail, dice: TRACE, seed: _seed, words: _words };
    }
    // Retain the original 64 expeditions. Quieter mornings change later routes;
    // another fixed block keeps rare title replies covered in both role groups.
    for (let g = 0; g < 128; g++) {
      const baseline = await before.page.evaluate(playReplySeason, g),
        measured = await after.page.evaluate(playReplySeason, g);
      assert.equal(baseline.ended, true, 'baseline season ' + g);
      assert.equal(measured.ended, true, 'measured season ' + g);
      assert.deepEqual(fingerprint(measured), fingerprint(baseline), 'reply instrumentation season ' + g);
    }
    const result = await after.page.evaluate(() => {
      __replyProbe.stop();
      return { counts: __replyCounts.table, coverage: __replyProbe.coverage };
    });
    assert.equal(Object.keys(result.counts).length, 32);
    for (const [name, row] of Object.entries(result.counts))
      for (const group of ['cult', 'innocent']) assert.ok(row.totals[group]?.[1] > 0, name + '/' + group);
    for (const category of Object.keys(replyTells.categories))
      assert.ok(result.coverage['actual reply categories/' + category] > 0, category);
    assert.equal(result.coverage['actual reply render fallbacks'] || 0, 0);
    assert.deepEqual(before.errors, []);
    assert.deepEqual(after.errors, []);
  } finally {
    await before.page.close();
    await after.page.close();
  }
});

test('tell CLI keeps batching and strict failure semantics while memory pressure cannot yield a passing report', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-reply-tells-')),
    options = { cwd: path.resolve(__dirname, '..'), encoding: 'utf8', env: { ...process.env, KUTHA_ENGINE: 'node' } };
  try {
    const reports = [];
    for (const batch of [1, 2]) {
      const file = path.join(directory, 'batch-' + batch + '.json'),
        result = spawnSync(
          process.execPath,
          [
            '--max-old-space-size=512',
            'sim/tells.js',
            '2',
            '--only=replies',
            '--seed=386819',
            '--batch=' + batch,
            '--out=' + file,
            '--check',
            ...(batch === 1 ? [] : ['--allow-insufficient'])
          ],
          options
        );
      assert.equal(result.status, batch === 1 ? 2 : 0, result.stderr);
      const report = JSON.parse(fs.readFileSync(file, 'utf8'));
      assert.equal(report.rows.length, 32);
      assert.equal(report.coverage.completeSeasons, 2);
      assert.ok(report.resources.peakHeapBytes > 0 && report.resources.peakRssBytes > 0);
      delete report.resources;
      reports.push(report);
    }
    assert.deepEqual(reports[1], reports[0]);
    // The last case fails after the temporary report has been opened.
    for (const stopAfter of [0, 1, 3]) {
      const file = path.join(directory, 'blocked-' + stopAfter + '.json'),
        script = `
          const resources = require('./tools/resources');
          let calls = 0;
          resources.createProbe = () => () => ({total:36*resources.GiB,available:20*resources.GiB,parallelism:14,load:0,pressure:calls++ < ${stopAfter} ? 'normal' : 'critical'});
          process.argv = [process.execPath, 'sim/tells.js', '2', '--only=replies', '--batch=1', '--out=' + ${JSON.stringify(file)}];
          require('./sim/tells');
        `,
        result = spawnSync(process.execPath, ['--max-old-space-size=512', '-e', script], options);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Resource guard: tell study is incomplete/);
      assert.equal(fs.existsSync(file), false);
      assert.equal(
        fs.readdirSync(directory).some(name => name.startsWith('blocked-')),
        false
      );
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('rare tell cohorts execute real ballots, nights, listener changes and bilingual recalls', async () => {
  const { page, errors } = await openNode();
  try {
    for (const file of ['tell-counts.js', 'tell-scenarios.js'])
      await page.addScriptTag({ path: path.resolve(__dirname, '../sim/lib', file) });
    const result = await page.evaluate(() => {
      const smoke = __tellScenarios.measure({ n: 64, seed: 263167 }),
        accurate = __tellScenarios.measure({ n: 1, seed: 3701569910, families: ['history'] }),
        alternative = __tellScenarios.measure({ n: 1, seed: 1310020443, families: ['history'] }),
        tiny = __tellScenarios.measure({ n: 1, seed: 7, families: ['defence'] }),
        tactic = __tellScenarios.measure({ n: 32, seed: 263167, families: ['defence-tactic'] });
      return { smoke, accurate, alternative, tiny, tactic };
    });
    const c = result.smoke.coverage;
    assert.equal(c['complete scenarios'], 64);
    assert.equal(c.inquiries, 128);
    assert.equal(c['constructed histories'], 64);
    assert.equal(c['actual wrong dismissals'], 64);
    assert.equal(c['histories reaching actual next breakfast'] + (c['histories ended during actual night'] || 0), 64);
    for (const kind of ['steers', 'method statements', 'breakfast seconds', 'recall eligible actors', 'source eligible actors'])
      assert.ok(c[kind] > 0, kind);
    assert.equal(Object.keys(result.smoke.counts).length, 30);
    assert.equal(Object.keys(result.tiny.counts).length, 16);
    assert.equal(Object.keys(result.tactic.counts).length, 4);
    assert.equal(result.tactic.coverage['tactical focal opportunities/cult'], 128);
    assert.equal(result.tactic.coverage['tactical focal opportunities/innocent'], 128);
    assert.ok(result.tactic.coverage['tactical eligible competitors/competing pretenders'] > 0);
    assert.equal(result.tactic.coverage['tactical eligible competitors/single focal'], 0);
    for (const r of Object.values(result.tactic.counts)) {
      assert.equal(r.method, 'paired-bernoulli');
      assert.equal(Object.keys(r.clusters).length, 32);
      for (const group of ['cult', 'innocent']) {
        assert.equal(r.totals[group][1], 32);
        assert.ok(r.totals[group][0] > 0, group);
      }
    }
    for (const r of Object.values(result.tiny.counts).filter(r => r.method === 'paired-bernoulli'))
      for (const c of Object.values(r.clusters)) {
        assert.equal(c.cult[1], 1);
        assert.equal(c.innocent[1], 1);
      }
    assert.equal(result.accurate.coverage.recalls, 1);
    assert.equal(result.accurate.coverage['accurate recalled sources'], 1);
    assert.equal(result.alternative.coverage.recalls, 1);
    assert.equal(result.alternative.coverage['alternative earlier recalled sources'], 1);
    for (const sample of [result.accurate, result.alternative]) {
      const r = sample.examples.find(x => x.kind === 'recall');
      assert.ok(r.day > r.voteDay && r.saidBeforeVote > 0);
      assert.ok(r.text.en.length > 30 && r.text.ru.length > 30);
      assert.equal(sample.coverage['bilingual passages/recall'], 1);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('public second-voice policy reaches a natural recall opportunity without private-state steering', async () => {
  const { page, errors } = await openNode();
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../sim/lib/public-inquiry.js') });
    // Keep the previous doctrine route and add a natural opportunity after the
    // authorized pacing change. Both policies use only public observations.
    const results = [];
    for (const season of [413271940, 3664299901])
      results.push(
        await page.evaluate(season => {
          __T.start(0, false, season);
          let eligible = 0;
          const original = CampInfluence.breakfast;
          CampInfluence.breakfast = function () {
            for (const c of freeChars())
              if (
                !CampInfluence.records().some(r => r.by === c.id && r.day === S.day) &&
                CampInfluence.records().some(
                  r =>
                    r.kind === 'second' &&
                    !r.recalled &&
                    r.day < S.day &&
                    isFree(C(r.by)) &&
                    r.listeners.includes(c.id) &&
                    S.log.accused.some(a => a.id === r.about && !a.right && a.day >= r.day) &&
                    S.inquiries.some(v => v.id === r.about && v.day >= r.day && v.back.includes(c.id))
                )
              )
                eligible++;
            return original.apply(this, arguments);
          };
          try {
            const ended = __T.play(__publicInquiry(__T.rng(season ^ 31337)), { maxSteps: 1500 });
            return { ended, eligible, inquiries: S.inquiries.length };
          } finally {
            CampInfluence.breakfast = original;
          }
        }, season)
      );
    assert.ok(
      results.every(r => r.ended),
      'both expeditions finish'
    );
    assert.ok(results[1].eligible > 0 && results[1].inquiries > 0, JSON.stringify(results));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('human and observer choices are language independent and cannot read secret answers', async () => {
  const { page, errors } = await openNode();
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, 'solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, 'lib/observer.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../sim/lib/public-inquiry.js') });
    const result = await page.evaluate(() => {
      let decisions = 0;
      const phases = new Set();
      for (let seed = 0; seed < 12; seed++) {
        __T.start(seed % 3, false, seed);
        const driver = __observer(__T.rng(seed + 97));
        if (
          !__T.play(
            bs => {
              const saved = [],
                deny = (object, key) => {
                  const descriptor = Object.getOwnPropertyDescriptor(object, key);
                  saved.push(() => Object.defineProperty(object, key, descriptor));
                  Object.defineProperty(object, key, {
                    configurable: true,
                    get() {
                      throw new Error('Policy read hidden ' + key);
                    }
                  });
                };
              const dice = [_seed, _words],
                lang = LANG;
              try {
                ['patron', 'wardOf', 'godOfWard', 'knowledge', 'acts', 'sus', 'like', 'flirt'].forEach(k => deny(S, k));
                S.order.forEach(id => deny(C(id), 'role'));
                for (const policy of [
                  () => __T.policies.human(__T.rng(67)),
                  () => __publicInquiry(__T.rng(67)),
                  () => __observer(__T.rng(67)),
                  () => __observer(__T.rng(67), 'mixed', { careful: true })
                ]) {
                  LANG = 'en';
                  const en = bs.indexOf(policy()(bs));
                  LANG = 'ru';
                  const ru = bs.indexOf(policy()(bs));
                  if (en !== ru || en < 0) throw new Error('Different or absent policy choice after language switch');
                }
                if (_seed !== dice[0] || _words !== dice[1]) throw new Error('Policy consumed game or prose dice');
                decisions++;
                phases.add(S.phase);
              } finally {
                saved.reverse().forEach(restore => restore());
                LANG = lang;
              }
              return driver(bs);
            },
            { maxSteps: 1500 }
          )
        )
          throw new Error('Observer stuck');
      }
      return { decisions, phases: [...phases] };
    });
    assert.ok(result.decisions >= 500, JSON.stringify(result));
    for (const phase of ['plan', 'talk', 'finale', 'descent', 'sanctum']) assert.ok(result.phases.includes(phase), phase);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('careful observers recover from visible condition words without reading exact health', async () => {
  const { page, errors } = await openNode();
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, 'solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, 'lib/observer.js') });
    const result = await page.evaluate(() => {
      const choices = [];
      for (const mode of ['cult', 'puzzle', 'mixed']) {
        newGame('Marlowe', 'philologist', false, 42);
        S.nerve = 2;
        S.items.push('brandy');
        S.fragments = 2;
        const choose = () => {
          const bs = __T.buttons(),
            observe = __T.observe,
            observation = observe(bs),
            saved = [];
          const dice = [_seed, _words];
          // The adapter has read exactly the words the notebook displays. From
          // here the policy receives only those words, never numerical health.
          __T.observe = () => observation;
          try {
            for (const k of ['nerve', 'nerveMax', 'wounds', 'woundsMax', 'doom', 'doomMax']) {
              const descriptor = Object.getOwnPropertyDescriptor(S, k);
              saved.push(() => Object.defineProperty(S, k, descriptor));
              Object.defineProperty(S, k, {
                configurable: true,
                get() {
                  throw Error('Policy read exact ' + k);
                }
              });
            }
            const chosen = __observer(__T.rng(7), mode, { careful: true })(bs);
            if (dice[0] !== _seed || dice[1] !== _words) throw Error('Recovery choice consumed game dice');
            return observation.choices[bs.indexOf(chosen)];
          } finally {
            saved.reverse().forEach(f => f());
            __T.observe = observe;
          }
        };
        planScene();
        choices.push(choose());
        lose('brandy');
        planScene();
        choices.push(choose());
        goTo('camp');
        choices.push(choose());
      }
      return choices;
    });
    assert.equal(result.length, 9);
    for (let i = 0; i < result.length; i += 3) {
      assert.match(result[i], /Drink from the brandy/);
      assert.match(result[i + 1], /Expedition camp/);
      assert.match(result[i + 2], /Rest in your tent/);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
