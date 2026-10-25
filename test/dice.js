// Rules 4 and 5 of README.md, checked at run time: the dice are the game's alone, and none of them is ever sure.
// - The screen throws none of them and changes nothing: a season is played twice, once plainly and once with, before
//   every click (and once more on the ending's page), the language switched there and back, every casebook tab opened,
//   and everything repainted. The two must play out alike, step for step and word for word, the screen must throw no
//   die, and the state must not move.
// - The ending throws none of them either: which line of a fate is told is fixed by the season (hash01 on its salt), so
//   the next expedition is dealt exactly as it would have been.
// - The caps (core/random.js): odds of nothing throw no die at all; no chance is surer than scale.surest or rarer than
//   scale.rarest, whatever is asked; vary stays within one of what is asked and never below nothing, and throws no die
//   for nothing; clamp keeps to scale.least and scale.most.
// usage: node test/dice.js [seasons for the ending check]   seeds for the screen check: --seeds=3,5,8
const { run, open, args } = require('./lib/harness');
const A = args({ seeds: '3,5,8' });
const N = +(A._[0] || 60);
const SEEDS = String(A.seeds).split(',').map(Number);

// one season, by the human policy; with ui, the screen is worked between every two clicks
function play({ seed, ui }) {
  const T = window.__T,
    pol = T.policies.human(T.lcg(seed * 31 + 7));
  window.sfx = () => {};
  window.musicChange = () => {};
  let inUI = false,
    uiDice = 0;
  const where = [],
    moved = [],
    orig = rand;
  rand = function () {
    if (inUI) {
      uiDice++;
      if (where.length < 3) where.push(new Error().stack.split('\n').slice(2, 6).join(' | '));
    }
    return orig();
  };
  // the state as text: each object written out where it is first met, and only named after that (two dreamers' dreams of
  // each other hold each other's person, a loop JSON.stringify will not follow)
  const snap = () => {
    const met = new Map();
    return JSON.stringify(S, function (k, v) {
      if (!v || typeof v !== 'object') return v;
      if (met.has(v)) return `#${met.get(v)}`;
      met.set(v, met.size);
      return v;
    });
  };
  const work = () => {
    inUI = true;
    const before = snap();
    setLang('ru');
    setLang('en');
    ['evidence', 'omens', 'kit', 'people'].forEach(t => {
      const el = document.querySelector(`.tab[data-tab="${t}"]`);
      if (el) el.click();
    });
    renderAll();
    if (S_ui.scene) paintScene(S_ui.scene);
    const after = snap();
    if (before !== after && moved.length < 3) {
      let j = 0;
      while (j < before.length && before[j] === after[j]) j++;
      moved.push(`${S.phase}: …${before.slice(Math.max(0, j - 80), j + 40)}… became …${after.slice(Math.max(0, j - 80), j + 40)}…`);
    }
    inUI = false;
  };
  T.start(seed % 3, seed % 2 === 0);
  const trail = [];
  for (let s = 0; s < 1500 && !S.ended; s++) {
    if (ui) work();
    const bs = T.buttons();
    if (!bs.length) break;
    const b = pol(bs) || bs[0];
    trail.push(`${S.phase}:${b.textContent.slice(0, 50)}`);
    b.click();
  }
  if (ui && S.ended) work(); // (the ending's page, worked like any other)
  rand = orig;
  return { end: S.endId, trail, journal: S.journal.map(j => X(j.t)).join('\n'), uiDice, where, moved };
}

// dice thrown while the ending is told, over many seasons of both kinds of play
function endings(N) {
  const T = window.__T;
  window.sfx = () => {};
  window.musicChange = () => {};
  const orig = rand,
    told = ending;
  let inEnd = false,
    n = 0;
  const where = [],
    ends = {};
  rand = function () {
    if (inEnd) {
      n++;
      if (where.length < 3) where.push(new Error().stack.split('\n').slice(2, 6).join(' | '));
    }
    return orig();
  };
  ending = function (...a) {
    inEnd = true;
    try {
      return told.apply(this, a);
    } finally {
      inEnd = false;
    }
  };
  for (let g = 0; g < N; g++) {
    T.start(g % 3, g % 4 === 3);
    T.play(g % 2 ? T.policies.cheat(T.lcg(g)) : T.policies.human(T.lcg(g)), { maxSteps: 1500 });
    ends[S.endId] = (ends[S.endId] || 0) + 1;
  }
  rand = orig;
  ending = told;
  return { dice: n, where, kinds: Object.keys(ends).length };
}

// the caps on every die, with the dice made to fall where the test wants them, then with the real ones
function caps() {
  const R = RULES.scale,
    bad = [],
    orig = rand;
  let next = 0.5,
    thrown = 0;
  rand = () => {
    thrown++;
    return next;
  };
  const at = (r, f) => {
    next = r;
    thrown = 0;
    return [f(), thrown];
  };
  [0, -0, -0.5, NaN].forEach(p => {
    const [v, n] = at(0, () => chance(p));
    if (v || n) bad.push(`chance(${p}) threw ${n} dice and came out ${v}`);
  });
  [1, 5, R.surest + 0.005].forEach(p => {
    if (at(R.surest + 0.001, () => chance(p))[0]) bad.push(`chance(${p}) came true at ${R.surest + 0.001}: surer than surest`);
    if (!at(R.surest - 0.001, () => chance(p))[0]) bad.push(`chance(${p}) failed at ${R.surest - 0.001}`);
  });
  [1e-9, R.rarest / 2].forEach(p => {
    if (!at(R.rarest - 0.001, () => chance(p))[0]) bad.push(`chance(${p}) failed at ${R.rarest - 0.001}: rarer than rarest`);
    if (at(R.rarest + 0.001, () => chance(p))[0]) bad.push(`chance(${p}) came true at ${R.rarest + 0.001}`);
  });
  [
    [0, undefined, 0],
    [3, 0, 3]
  ].forEach(([x, s, want]) => {
    const [v, n] = at(0, () => vary(x, s));
    if (v !== want || n) bad.push(`vary(${x}, ${s}) came out ${v}, with ${n} dice`);
  });
  rand = orig;
  const N = 20000;
  let sure = 0,
    rare = 0;
  for (let i = 0; i < N; i++) {
    const v = vary(1);
    if (![0, 1, 2].includes(v)) bad.push(`vary(1) came out ${v}`);
    if (chance(1)) sure++;
    if (chance(1e-9)) rare++;
  }
  // (20,000 throws: each within half a point of its mark, all but always)
  if (Math.abs(sure / N - R.surest) > 0.005) bad.push(`chance(1) came true ${sure / N} of the time, not about ${R.surest}`);
  if (Math.abs(rare / N - R.rarest) > 0.005) bad.push(`chance(1e-9) came true ${rare / N} of the time, not about ${R.rarest}`);
  if (clamp(2) !== R.most || clamp(-1) !== R.least) bad.push(`clamp gave ${clamp(2)} and ${clamp(-1)}`);
  return [...new Set(bad)].slice(0, 10);
}

run(async browser => {
  const problems = [],
    errors = [];
  for (const seed of SEEDS) {
    const r = {};
    for (const ui of [false, true]) {
      const { page, errors: e } = await open(browser, { seed, mathSeed: seed });
      r[ui ? 'ui' : 'plain'] = await page.evaluate(play, { seed, ui });
      errors.push(...e);
      await page.close();
    }
    const a = r.plain,
      b = r.ui;
    const at = a.trail.findIndex((x, i) => x !== b.trail[i]);
    if (at >= 0 || a.trail.length !== b.trail.length)
      problems.push(`seed ${seed}: the screen changed the season at step ${at}: ${a.trail[at]} / ${b.trail[at]}`);
    else if (a.journal !== b.journal) problems.push(`seed ${seed}: same steps, different journal`);
    if (b.uiDice) problems.push(`seed ${seed}: the screen threw ${b.uiDice} dice: ${b.where.join(' ;; ')}`);
    b.moved.forEach(m => problems.push(`seed ${seed}: the screen moved the state: ${m}`));
  }
  const { page, errors: e } = await open(browser, { seed: 8, mathSeed: 8 });
  const end = await page.evaluate(endings, N);
  errors.push(...e);
  if (end.dice) problems.push(`the ending threw ${end.dice} dice: ${end.where.join(' ;; ')}`);
  problems.push(...(await page.evaluate(caps)));
  return {
    problems: problems.length + errors.length,
    seasons: SEEDS.length * 2 + N,
    endingKinds: end.kinds,
    list: problems,
    errors: errors.slice(0, 5)
  };
});
