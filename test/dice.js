// Rule 4 of README.md, checked at run time: the dice are the game's alone.
// - The screen throws none of them and changes nothing: a season is played twice, once plainly and once with, before
//   every click, the language switched there and back, every casebook tab opened, and everything repainted. The two
//   must play out alike, step for step and word for word, the screen must throw no die, and the state must not move.
// - The ending throws none of them either: which line of a fate is told is fixed by the season (hash01 on its salt), so
//   the next expedition is dealt exactly as it would have been.
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
  const snap = () => JSON.stringify(S);
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
  return {
    problems: problems.length + errors.length,
    seasons: SEEDS.length * 2 + N,
    endingKinds: end.kinds,
    list: problems,
    errors: errors.slice(0, 5)
  };
});
