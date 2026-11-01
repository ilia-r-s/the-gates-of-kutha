// Random play with the language flipped back and forth: Russian screens must hold no English, English screens no
// Russian, and nothing may leak template syntax or markers. Reads the page as a person sees it (innerText, labels,
// titles), at desktop and phone widths.  usage: node test/rubot.js [games]
const { run, open, args } = require('./lib/harness');
const GAMES = args()._[0] || 30;

// One game, played in the page: the language flipped now and then, a casebook tab opened now and then, what a person
// sees read at every step and checked, a mark or a notebook chip clicked now and then, and a choice made, all by the
// same seeded generator. Played in one go, so the page is asked once per game, not several times a step.
const game = ({ gi, steps }) => {
  const visible = el => !!el && !!el.getClientRects().length && getComputedStyle(el).visibility === 'visible';
  const textOf = selector => {
    const el = document.querySelector(selector);
    return visible(el) ? el.innerText : '';
  };
  const openBook = () => {
    if (!document.getElementById('notebookDialog').open) document.getElementById('casebookBtn').click();
  };
  const closeBook = () => {
    if (document.getElementById('notebookDialog').open) document.getElementById('closeCasebook').click();
  };
  const read = () => ({
    lang: LANG,
    text: [
      textOf('header'),
      textOf('#stage'),
      textOf('#notebookDialog'),
      [...document.querySelectorAll('#mapDyn text')]
        .filter(visible)
        .map(e => e.textContent)
        .join(' '),
      [...document.querySelectorAll('[aria-label],[title]')]
        .filter(e => e.id !== 'langBtn' && visible(e))
        .map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))
        .join(' ')
    ].join('\n'),
    title: textOf('#sceneTitle'),
    ended: typeof S !== 'undefined' && S && S.ended
  });
  const bad = [],
    seen = { ru: 0, en: 0 },
    ends = {},
    coverage = { tabs: [0, 0, 0, 0], languageSwitches: 0, marks: 0, choiceIndices: {} };
  let n = 0;
  const rnd = __testRandom.random(gi * 7919 + 17).int;
  for (let k = 0; k < steps; k++) {
    if (rnd(100) < 6) {
      const before = LANG;
      openBook();
      document.getElementById('langBtn').click();
      if (LANG === before) bad.push({ gi, k, action: 'language button did not switch language' });
      coverage.languageSwitches++;
    }
    if (rnd(4) === 0) {
      const index = rnd(4),
        t = ['people', 'evidence', 'omens', 'kit'][index];
      if (typeof S !== 'undefined' && S) {
        openBook();
        const tab = document.getElementById('tab-' + t);
        tab.click();
        if (
          !visible(tab) ||
          tab.getAttribute('aria-selected') !== 'true' ||
          S_ui.tab !== t ||
          !visible(document.getElementById('tabPanel'))
        )
          bad.push({ gi, k, action: 'notebook tab was not visibly selected', tab: t });
        coverage.tabs[index]++;
      }
    }
    const snap = read();
    n++;
    seen[snap.lang]++;
    const t = snap.text.replace(/♪[^\n]*/g, '');
    if (snap.lang === 'ru') {
      const words = (t.replace(/\b[0-9A-F]{4}-[0-9A-F]{4}\b/g, '').match(/[A-Za-z][A-Za-z’'\-]+/g) || []).filter(v => v !== 'English'); // (a season's code is the same in both)
      if (words.length) bad.push({ gi, k, lang: 'ru', title: snap.title, words: [...new Set(words)].slice(0, 8) });
    } else {
      const cyr = (t.match(/[А-Яа-яЁё][А-Яа-яЁё\-]+/g) || []).filter(v => v !== 'Русский');
      if (cyr.length) bad.push({ gi, k, lang: 'en', title: snap.title, words: [...new Set(cyr)].slice(0, 8) });
    }
    // (the marker is looked for first on its own, and only then with the words around it, which is slow on a long page)
    const m =
      /[\u0001\u0002\u0003]|undefined|NaN|\{[a-z.:]+|\[[^\]\n]*\|/.test(t) &&
      t.match(/.{0,40}(?:[\u0001\u0002\u0003]|undefined|NaN|\{[a-z.:]+|\[[^\]\n]*\|).{0,40}/);
    if (m) bad.push({ gi, k, lang: snap.lang, marker: m[0] });
    if (snap.ended) ends[snap.ended] = (ends[snap.ended] || 0) + 1;
    const choices = document.querySelectorAll('#choices .choice').length;
    if (!choices) break;
    const choice = rnd(choices);
    coverage.choiceIndices[choice] = (coverage.choiceIndices[choice] || 0) + 1;
    // sometimes mark people or notebook chips, which re-renders the casebook
    if (rnd(10) === 0) {
      openBook();
      const mk = document.querySelector('[data-mark],[data-gm]');
      if (mk) {
        const before = mk.hasAttribute('data-mark') ? C(mk.dataset.mark).mark : S.gm[mk.dataset.gm] || 0;
        if (!visible(mk)) bad.push({ gi, k, action: 'notebook mark was hidden' });
        mk.click();
        const after = mk.hasAttribute('data-mark') ? C(mk.dataset.mark).mark : S.gm[mk.dataset.gm] || 0;
        if (after === before) bad.push({ gi, k, action: 'notebook mark did not change' });
        coverage.marks++;
      }
    }
    closeBook();
    const button = document.querySelectorAll('#choices .choice')[choice];
    if (document.getElementById('notebookDialog').open || !visible(button)) bad.push({ gi, k, action: 'scene choice was blocked' });
    button.click();
  }
  return { bad, seen, ends, coverage, steps: n, missing: [...MISSING] };
};

run(async browser => {
  const bad = [],
    seen = { ru: 0, en: 0 },
    ends = {},
    coverage = { tabs: [0, 0, 0, 0], languageSwitches: 0, marks: 0, choiceIndices: {} };
  let steps = 0;
  for (let gi = 0; gi < GAMES; gi++) {
    const { page, errors } = await open(browser, { width: gi % 3 === 2 ? 390 : 1280, seed: 1000 + gi, lang: 'ru', helpers: false });
    const r = await page.evaluate(game, { gi, steps: 140 });
    bad.push(...r.bad);
    steps += r.steps;
    coverage.tabs = coverage.tabs.map((v, i) => v + r.coverage.tabs[i]);
    coverage.languageSwitches += r.coverage.languageSwitches;
    coverage.marks += r.coverage.marks;
    Object.entries(r.coverage.choiceIndices).forEach(([i, n]) => {
      coverage.choiceIndices[i] = (coverage.choiceIndices[i] || 0) + n;
    });
    ['ru', 'en'].forEach(l => {
      seen[l] += r.seen[l];
    });
    Object.entries(r.ends).forEach(([e, k]) => {
      ends[e] = (ends[e] || 0) + k;
    });
    if (r.missing.length) bad.push({ gi, missing: r.missing.slice(0, 5) });
    if (errors.length) bad.push({ gi, errors: errors.slice(0, 3) });
    await page.close();
  }
  if (GAMES >= 8 && (coverage.tabs.some(n => !n) || !coverage.languageSwitches || !coverage.marks || !seen.en || !seen.ru))
    bad.push({ coverage: 'Language switching, every casebook tab, and marking must be exercised' });
  return { games: GAMES, steps, seen, ends, coverage, problems: bad.length, sample: bad.slice(0, 25) };
});
