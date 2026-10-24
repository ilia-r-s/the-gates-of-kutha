// Random play with the language flipped back and forth: Russian screens must hold no English, English screens no
// Russian, and nothing may leak template syntax or markers. Reads the page as a person sees it (innerText, labels,
// titles), at desktop and phone widths.  usage: node test/rubot.js [games]
const { run, open, args } = require('./lib/harness');
const GAMES = args()._[0] || 30;

// One game, played in the page: the language flipped now and then, a casebook tab opened now and then, what a person
// sees read at every step and checked, a mark or a notebook chip clicked now and then, and a choice made, all by the
// same seeded generator. Played in one go, so the page is asked once per game, not several times a step.
const game = ({ gi, steps }) => {
  const read = () => ({
    lang: LANG,
    text: [
      document.querySelector('header').innerText.replace(/English|Русский/, ''),
      document.querySelector('#stage').innerText,
      document.querySelector('.casebook').innerText,
      document.querySelector('#mapDyn') ? document.querySelector('#mapDyn').textContent : '',
      document.querySelector('.plan figcaption').innerText,
      [...document.querySelectorAll('[aria-label],[title]')]
        .filter(e => e.id !== 'langBtn')
        .map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))
        .join(' ')
    ].join('\n'),
    title: document.querySelector('#sceneTitle').innerText,
    ended: typeof S !== 'undefined' && S && S.ended
  });
  const bad = [],
    seen = { ru: 0, en: 0 },
    ends = {};
  let x = gi * 7919 + 17,
    n = 0;
  const rnd = m => (x = (x * 1103515245 + 12345) % 2147483648) % m;
  for (let k = 0; k < steps; k++) {
    if (rnd(100) < 6) setLang(LANG === 'ru' ? 'en' : 'ru');
    if (rnd(4) === 0) {
      const t = ['people', 'evidence', 'omens', 'kit'][rnd(4)];
      if (typeof S !== 'undefined' && S) {
        S_ui.tab = t;
        renderBook();
      }
    }
    const snap = read();
    n++;
    seen[snap.lang]++;
    const t = snap.text.replace(/♪[^\n]*/g, '');
    if (snap.lang === 'ru') {
      const words = (t.match(/[A-Za-z][A-Za-z’'\-]+/g) || []).filter(v => v !== 'English');
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
    // sometimes mark people or notebook chips, which re-renders the casebook
    if (rnd(10) === 0) {
      const mk = document.querySelector('[data-mark],[data-gm]');
      if (mk) mk.click();
    }
    document.querySelectorAll('#choices .choice')[choice].click();
  }
  return { bad, seen, ends, steps: n, missing: [...MISSING] };
};

run(async browser => {
  const bad = [],
    seen = { ru: 0, en: 0 },
    ends = {};
  let steps = 0;
  for (let gi = 0; gi < GAMES; gi++) {
    const { page, errors } = await open(browser, { width: gi % 3 === 2 ? 390 : 1280, seed: 1000 + gi, lang: 'ru', helpers: false });
    const r = await page.evaluate(game, { gi, steps: 140 });
    bad.push(...r.bad);
    steps += r.steps;
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
  return { games: GAMES, steps, seen, ends, problems: bad.length, sample: bad.slice(0, 25) };
});
