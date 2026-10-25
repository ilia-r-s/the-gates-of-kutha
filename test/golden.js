// Golden transcripts: seeded scripted playthroughs that capture everything a player can read (the scene, the
// choices, the meters, the site plan, every casebook tab, the page's own words) at every step.
//   node test/golden.js record [--lang=ru]   record from the current build into test/golden/<lang>.json.gz
//   node test/golden.js check  [--lang=ru]   replay and report every difference from the recording
//   node test/golden.js leaks  [switchAt]    replay in Russian (switching at step switchAt) and report untranslated text
// --page=path plays another build instead of standalone.html.
// A refactor must leave both recordings identical; a change to the game must be re-recorded on purpose.
const fs = require('fs'),
  path = require('path'),
  zlib = require('zlib');
const { run, open, args, shownOnly } = require('./lib/harness');
const a = args({ lang: 'en' }),
  mode = a._[0] || 'check',
  switchAt = a._[1] || 0,
  lang = mode === 'leaks' ? 'ru' : a.lang;
const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number) : [11, 23, 37, 41, 59, 73, 97, 131],
  STEPS = 170;
const FILE = path.join(__dirname, 'golden', `${lang}.json.gz`);

// One season, played in the page from start to end: what a player can read at every step (everything, the casebook
// tabs and the page's own words included, every fifth step), then a choice made by a seeded generator. Russian from
// step switchAt, when lang is Russian. Played in one go, so the page is asked once per season, not twice a step.
const season = ({ seed, lang, switchAt, steps }) => {
  const snapshot = full => {
    const q = s => document.querySelector(s),
      tabs = {};
    if (full && typeof S !== 'undefined' && S) {
      const keep = S_ui.tab;
      ['people', 'evidence', 'omens', 'kit'].forEach(t => {
        S_ui.tab = t;
        renderBook();
        tabs[t] = q('#tabPanel').innerHTML;
      });
      S_ui.tab = keep;
      renderBook();
    } else if (full) tabs.none = q('#tabPanel').innerHTML;
    return {
      kicker: q('#kicker').textContent,
      title: q('#sceneTitle').textContent,
      sub: q('#sceneSub').textContent,
      body: q('#sceneText').innerHTML,
      choices: [...document.querySelectorAll('#choices .choice')].map(e => e.innerHTML),
      meters: q('#meters').innerHTML,
      // (the music's now-playing label is left out: it follows real-time timers, not the game)
      map: q('#mapDyn') ? q('#mapDyn').innerHTML : '',
      art: q('#sceneArt').innerHTML,
      tabs,
      // the page's own words; the music's now-playing label follows real-time timers, not the game, so it is left out,
      // and so is the language button; the build's number changes with every release, so only its words are kept
      chrome: full
        ? [...document.querySelectorAll('header, .tabs, #map .base, figcaption')]
            .map(e => {
              const k = e.cloneNode(true),
                np = k.querySelector('#nowPlaying'),
                lb = k.querySelector('#langBtn');
              if (np) np.textContent = '';
              if (lb) lb.remove(); // it names the other language, so it differs between the two recordings
              k.querySelectorAll('#build .tw').forEach(t => (t.textContent = t.textContent.replace(/\d+(\.\d+)*$/, '#')));
              return k.innerHTML;
            })
            .join('|')
        : '',
      doc: document.title
    };
  };
  let x = seed * 7919 + 1;
  // the player's own dice (mulberry32): every bit of them as good as any other
  const pick = n => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) % n;
  };
  const rec = [];
  for (let step = 0; step < steps; step++) {
    if (lang === 'ru' && step === switchAt) setLang('ru');
    const snap = snapshot(step % 5 === 0);
    rec.push(snap);
    const n = snap.choices.length;
    if (!n) break;
    document.querySelectorAll('#choices .choice')[pick(n)].click();
  }
  return { rec, missing: lang === 'ru' ? [...MISSING] : [] };
};

run(async browser => {
  const out = {};
  for (const seed of SEEDS) {
    // the game's own seed, and a seeded Math.random so the music playlist is the same every run
    const { page, errors } = await open(browser, { file: a.page || 'standalone', seed, mathSeed: seed, helpers: false });
    const { rec, missing } = await page.evaluate(season, { seed, lang, switchAt: mode === 'leaks' ? switchAt : 0, steps: STEPS });
    out[seed] = { rec, errors, missing };
    await page.close();
  }
  if (mode === 'record') {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, zlib.gzipSync(JSON.stringify(out)));
    return `recorded ${lang}: ${Object.values(out)
      .map(o => o.rec.length)
      .join(',')} steps; errors: ${JSON.stringify(Object.values(out).flatMap(o => o.errors))}`;
  }
  if (mode === 'check') {
    const gold = JSON.parse(zlib.gunzipSync(fs.readFileSync(FILE)).toString('utf8'));
    let diffs = 0;
    const byField = {}; // (where the differences are: a change to the page's own words shows in chrome only)
    for (const seed of SEEDS) {
      const A = gold[seed].rec,
        B = out[seed].rec;
      if (A.length !== B.length) {
        console.log(`seed ${seed}: ${A.length} steps recorded, ${B.length} now`);
        diffs++;
      }
      for (let i = 0; i < Math.min(A.length, B.length); i++) {
        for (const k of Object.keys(A[i])) {
          const was = JSON.stringify(A[i][k]),
            now = JSON.stringify(B[i][k]);
          if (was === now) continue;
          byField[k] = (byField[k] || 0) + 1;
          if (++diffs <= 6) {
            let j = 0;
            while (j < was.length && was[j] === now[j]) j++;
            console.log(
              `seed ${seed} step ${i} field ${k}:\n  was: …${was.slice(Math.max(0, j - 80), j + 120)}\n  now: …${now.slice(Math.max(0, j - 80), j + 120)}`
            );
          }
        }
      }
      if (out[seed].errors.length) console.log('page errors', seed, out[seed].errors.slice(0, 3));
    }
    return diffs
      ? `${diffs} differences from the ${lang} recording (by field: ${Object.entries(byField)
          .map(([k, n]) => `${k} ${n}`)
          .join(', ')})`
      : `${lang}: identical to the recording (${SEEDS.length} seasons)`;
  }
  // leaks: everything visible must be translated, with no markers or template syntax left over
  const allowLatin = /^(?:N|m|I|II|III|IV|V|VI|VII|B|E)$/,
    leaks = [];
  for (const seed of SEEDS) {
    out[seed].rec.forEach((s, i) => {
      if (i < switchAt) return;
      const text = shownOnly(
        [s.kicker, s.title, s.sub, s.body, ...s.choices, s.meters, s.map, ...Object.values(s.tabs), s.chrome, s.doc].join(' '),
        'ru'
      )
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;/g, ' ');
      const words = (text.replace(/\b[0-9A-F]{4}-[0-9A-F]{4}\b/g, '').match(/[A-Za-z][A-Za-z’'\-]+/g) || []).filter(
        w => !allowLatin.test(w)
      ); // (a season's code is the same in both)
      if (words.length)
        leaks.push({
          seed,
          step: i,
          words: [...new Set(words)].slice(0, 12),
          ctx: text.slice(Math.max(0, text.indexOf(words[0]) - 60), text.indexOf(words[0]) + 80)
        });
      if (/[\u0001\u0002]|undefined|NaN|\{[a-z.]+\}|\[[^\]]*\|[^\]]*\]/.test(text))
        leaks.push({
          seed,
          step: i,
          marker: (text.match(/.{0,50}(?:[\u0001\u0002]|undefined|NaN|\{[a-z.]+\}|\[[^\]]*\|[^\]]*\]).{0,50}/) || [''])[0]
        });
    });
    if (out[seed].errors.length) console.log('page errors', seed, out[seed].errors.slice(0, 3));
  }
  const byWord = {};
  leaks.forEach(l =>
    (l.words || []).forEach(w => {
      byWord[w] = (byWord[w] || 0) + 1;
    })
  );
  const missing = [...new Set(SEEDS.flatMap(sd => out[sd].missing))];
  return {
    leakSteps: leaks.length,
    words: Object.entries(byWord)
      .sort((p, q) => q[1] - p[1])
      .slice(0, 60),
    samples: leaks.slice(0, 12),
    missing: missing.slice(0, 30),
    nMissing: missing.length
  };
});
