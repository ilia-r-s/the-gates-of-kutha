const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

async function check(fn) {
  const { page, errors } = await openNode(null, { seed: 4242 });
  try {
    assert.deepEqual(await page.evaluate(fn), []);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

test('fractional injuries and nerve loss have monotone, accurate condition descriptions in both languages', () =>
  check(() => {
    const problems = [],
      nodes = { '#meters': {}, '#conditionCue': {} };
    document.querySelector = selector => nodes[selector] || null;
    for (const bg of ['philologist', 'soldier', 'occultist']) {
      newGame('Marlowe', bg, false, 4242);
      const dice = [_seed, _words];
      let previous = 0;
      for (let tenth = 0; tenth <= S.woundsMax * 10; tenth++) {
        S.wounds = tenth / 10;
        const severity = meterState().wounds[0];
        if (severity < previous) problems.push('More wounds appeared less serious');
        if (tenth === 1 && severity !== 1) problems.push('A graze was not slight');
        if (S.wounds === S.woundsMax - 1 && severity !== 3) problems.push('Near-fatal wounds were not grave');
        previous = severity;
      }
      previous = 0;
      S.wounds = 0;
      for (let tenth = S.nerveMax * 10; tenth >= 0; tenth--) {
        S.nerve = tenth / 10;
        const severity = meterState().nerve[0];
        if (severity < previous) problems.push('Lower nerve appeared steadier');
        previous = severity;
      }
      S.nerve = S.nerveMax;
      for (const lang of ['en', 'ru']) {
        setLang(lang);
        for (const [left, word] of [
          [2.9, ''],
          [2, lang === 'en' ? 'need attention' : 'требуют ухода'],
          [1, lang === 'en' ? 'grave' : 'тяжёлые']
        ]) {
          S.wounds = S.woundsMax - left;
          renderMeters();
          const cue = $('#conditionCue');
          if (word ? cue.hidden || !cue.textContent.includes(word) : !cue.hidden)
            problems.push('Incorrect injury warning: ' + lang + '/' + left);
        }
        S.wounds = 0;
        renderMeters();
        if (!$('#conditionCue').hidden || $('#conditionCue').textContent) problems.push('Healed wounds retained a warning');
      }
      if (JSON.stringify(dice) !== JSON.stringify([_seed, _words])) problems.push('Condition presentation used dice');
    }
    return [...new Set(problems)];
  }));

test('season codes accept the full documented forms and reject malformed input without truncating it', () =>
  check(() => {
    const problems = [];
    for (const [text, expected] of [
      ['0', 0],
      ['FFFFFFFF', 0xffffffff],
      ['c0de-0001', 0xc0de0001],
      ['  aBc123  ', 0xabc123],
      ['bad', 0xbad]
    ])
      if (parseSeed(text) !== expected) problems.push('valid code: ' + text);
    for (const text of [
      '',
      null,
      undefined,
      'invalid',
      'C0DE-OOO1',
      'C0DE-0001junk',
      '12-34',
      '1-2345678',
      '123456789',
      '0xDEADBEEF',
      '0000–0001',
      '0000 0001',
      '+1',
      '-1'
    ])
      if (parseSeed(text) !== null) problems.push('malformed code accepted: ' + text);
    for (let i = 0; i < 256; i++) {
      const seed = Math.imul(i, 2654435761) >>> 0;
      if (parseSeed(seedCode(seed)) !== seed) problems.push('round trip: ' + seed);
    }
    for (const [search, hash, expected] of [
      ['?seed=C0DE-0001', '', 0xc0de0001],
      ['', '#seed=deadbeef', 0xdeadbeef],
      ['?x=1&seed=1234%2Dabcd', '', 0x1234abcd],
      ['?seed=invalid', '', null],
      ['?seed=C0DE-0001oops', '', null],
      ['?seed=C0DE-0001%ZZ', '', null],
      ['?seed=123456789', '', null],
      ['?seed=00000000', '#seed=ffffffff', 0]
    ]) {
      location.search = search;
      location.hash = hash;
      if (seedInAddress() !== expected) problems.push('address: ' + search + hash);
    }
    return problems;
  }));

test('new expeditions release generated translations while preserving initialized catalogs and both dice streams', () =>
  check(() => {
    const problems = [];
    resetSeasonText();
    const fixed = [...RUMAP],
      pairs = [...PAIRKEY];
    const before = [_seed, _words];
    bi('temporary surname', 'временная фамилия');
    bi('temporary surname', 'другой перевод');
    MISSING.add('temporary missing token');
    resetSeasonText();
    if (JSON.stringify([_seed, _words]) !== JSON.stringify(before)) problems.push('cache reset used dice');
    if (JSON.stringify([...RUMAP]) !== JSON.stringify(fixed) || JSON.stringify([...PAIRKEY]) !== JSON.stringify(pairs))
      problems.push('static cache was changed or generated text survived');
    if (!MISSING.has('temporary missing token')) problems.push('cache reset lost a missing-translation diagnostic');
    MISSING.delete('temporary missing token');
    let expectedSize;
    for (let season = 0; season < 40; season++) {
      newGame('Marlowe', 'philologist', false, 4242);
      const size = [RUMAP.size, PAIRKEY.size];
      if (!season) expectedSize = size;
      if (JSON.stringify(size) !== JSON.stringify(expectedSize)) problems.push('cache grows across seasons: ' + season);
      for (const [key, value] of fixed) if (RUMAP.get(key) !== value) problems.push('lost initialized translation: ' + key);
      for (let i = 0; i < 100; i++) bi('season ' + season + ' name ' + i, 'фамилия ' + i);
    }
    introScene(null);
    if ([...RUMAP.keys()].some(k => k.startsWith('season '))) problems.push('title retained the previous season');
    return problems;
  }));

test('recorded choices reconstruct complete expeditions and live scene closures across backgrounds and modes', () =>
  check(() => {
    const problems = [],
      phases = new Set(),
      storage = new Map();
    localStorage = {
      getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    };
    Session.init();
    let checks = 0;
    for (const seed of [0, 4242])
      for (let bg = 0; bg < 3; bg++)
        for (const hardcore of [false, true]) {
          __T.start(bg, hardcore, seed);
          const policy = __T.policies.human(__T.rng(seed ^ (bg + 19)));
          for (let step = 0; step < 1500 && !S.ended; step++) {
            const buttons = __T.buttons();
            if (!buttons.length) {
              problems.push('no choices: ' + S.phase);
              break;
            }
            const b = policy(buttons) || buttons[0];
            b.click();
            const unseen = !phases.has(S.phase);
            phases.add(S.phase);
            if (unseen || step % 31 === 0 || S.ended) {
              const dice = [_seed, _words],
                phase = S.phase;
              if (!Session.restore()) {
                problems.push('resume: ' + [seed, bg, hardcore, step, phase].join('/'));
                break;
              }
              if (JSON.stringify([_seed, _words]) !== JSON.stringify(dice)) problems.push('resumed dice: ' + phase);
              checks++;
            }
          }
          if (!S.ended) problems.push('unfinished expedition: ' + [seed, bg, hardcore]);
          if (S.ended && S.phase !== 'end') chooseScene(0);
          if (!Session.restore()) problems.push('ending resume: ' + [seed, bg, hardcore]);
        }
    if (checks < 48) problems.push('too few checkpoints: ' + checks);
    for (const phase of ['plan', 'loc', 'talk', 'result', 'end']) if (!phases.has(phase)) problems.push('unexercised phase: ' + phase);
    return problems;
  }));

test('music restores the original Bayati timing and keeps every track step without game dice', () =>
  check(() => {
    const problems = [],
      dice = [_seed, _words];
    for (const [id, track] of Object.entries(TRACKS)) {
      const scheduled = [];
      AU.ctx = { state: 'running', currentTime: 0 };
      AU.cur = { tr: { ...track, tick: (step, time) => scheduled.push([step, time]) } };
      AU.next = 0.25;
      AU.step = 0;
      for (let time = 0; scheduled.length < 34 && time < 100; time += 0.05) {
        AU.ctx.currentTime = time;
        auTick();
      }
      if (scheduled.length < 34 || scheduled.some(([step], i) => step !== i)) problems.push(id + ': lost or repeated melody steps');
      if (id === 'bayati') {
        for (const [step, time] of [
          [0, 0.25],
          [1, 0.69],
          [15, 6.85],
          [16, 7.29],
          [31, 13.89],
          [32, 14.33]
        ])
          if (Math.abs(scheduled[step][1] - time) > 1e-8) problems.push(id + ': wrong original timing at ' + step);
      } else if (scheduled.some(([, time], i) => Math.abs(time - (0.25 + i * track.dur)) > 1e-8)) problems.push(id + ': timing changed');
    }
    if (JSON.stringify(dice) !== JSON.stringify([_seed, _words])) problems.push('music scheduling used game dice');
    return problems;
  }));
