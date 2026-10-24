// Every ending, forced from a half-played game, in English and in Russian. Checks the right ending is reached,
// nothing leaks across languages, no template syntax shows, and every ending has its own picture.
// usage: node test/endings.js [seed]   SHOW=regex prints matching endings in both languages
const { run, open, args } = require('./lib/harness');
const SEED = args()._[0] || 7;
const PLAN = [
  ['unopened', 'exposed'],
  ['sealed', 'triumph', 'ward'],
  ['banished', 'triumph', 'rite'],
  ['emptied', 'triumph'],
  ['emptied', 'triumph', 'buried'],
  ['shot', 'pyrrhic', 'shoot'],
  ['burned', 'pyrrhic', 'fire'],
  ['scarred', 'pyrrhic', 'ward'],
  ['scarred', 'pyrrhic', 'rite'],
  ['fallen-night', 'death'],
  ['fallen-night', 'death', 'deed'],
  ['fallen-night', 'death', 'wrist'],
  ['fallen-below', 'death'],
  ['bethlem', 'madness'],
  ['canal', 'madness'],
  ['counting', 'madness'],
  ['doom-fire', 'doom'],
  ['doom-dust', 'doom'],
  ['doom-sea', 'doom'],
  ['doom-teeth', 'doom'],
  ['doom-plague', 'doom'],
  ['doom-madness', 'doom'],
  ['truck', 'expelled', 'killed'],
  ['truck', 'expelled', 'failed']
];
run(async browser => {
  const out = [],
    bad = [];
  for (let i = 0; i < PLAN.length; i++) {
    const [want, kind, how] = PLAN[i];
    const { page: p, errors: errs } = await open(browser, { seed: SEED * 100 + i, helpers: false });
    const r = await p.evaluate(
      ([want, kind, how, i]) => {
        // play part of a season with a fixed hand, then set up the last fight
        let x = 977 + i * 31;
        const rnd = k => (x = (x * 1103515245 + 12345) % 2147483648) % k;
        document.querySelectorAll('#choices .choice')[i % 3].click();
        // your reply to the Trustees: the casebook kept the usual way, or (every other pair of endings) hardcore
        document.querySelectorAll('#choices .choice')[(i >> 1) % 2].click();
        for (let n = 0; n < 70; n++) {
          if (S.ended || ['finale', 'descent', 'sanctum'].includes(S.phase)) break;
          if (S.day >= 4 && S.slot === 2 && S.phase === 'result') break;
          if (rnd(8) === 0) {
            const m = document.querySelectorAll('[data-mark]');
            if (m.length) m[rnd(m.length)].click();
          }
          const bs = [...document.querySelectorAll('#choices .choice')],
            pool = bs.filter(e => !/Go somewhere else|Never mind|Think better/.test(e.textContent));
          (pool.length ? pool : bs)[rnd((pool.length ? pool : bs).length)].click();
        }
        if (S.ended) {
          S.ended = null;
        }
        const cult = () => freeCult();
        const below = !['unopened', 'fallen-night', 'bethlem', 'canal', 'truck'].includes(want);
        if (want === 'truck') {
          // the deed done (or tried) on one of the cult, then the camp's judgement (game/deed.js)
          const t = cult()[0];
          S.log.deed = { day: S.day, id: t.id, means: 'knife', plant: null, outcome: how, morning: true, seenBy: freeChars().find(c => c !== t).id };
          S.log.deed.caught = S.log.deed.seenBy;
          S.log.deed.vote = { expel: [S.log.deed.seenBy], keep: [], silent: [], passed: true, day: S.day };
          if (how === 'killed') {
            t.status = 'taken';
            t.takenDay = S.day;
            t.takenBy = 'you';
          }
          S.fin = null;
          S.phase = 'loc';
        }
        if (below) {
          const loyalOne = freeChars().find(c => c.role !== 'cult');
          S.fin = S.fin || {
            early: i % 4 === 0,
            named: i % 3 ? S.patron : S.gods.find(g => g !== S.patron),
            comp: loyalOne ? [loyalOne.id] : [],
            left: [],
            tries: 0,
            betrayed: [],
            acts: [],
            g1: 'slow',
            g2: 'eyes',
            g3: i % 2 ? { kind: 'self' } : { kind: 'item', it: S.items[0] || 'brandy' }
          };
          S.phase = 'sanctum';
        }
        if (want === 'unopened')
          cult().forEach(c => {
            c.status = 'exposed';
            S.stats.right++;
            S.log.accused.push({ id: c.id, day: S.day, right: true });
          });
        if (want === 'emptied' && how === 'buried') {
          // one of them unmasked at an inquiry, and the last of them dead by your own hand (game/deed.js)
          const [a, b] = cult();
          a.status = 'exposed';
          S.stats.right++;
          S.log.accused.push({ id: a.id, day: 1, right: true });
          if (b) {
            b.status = 'taken';
            b.takenDay = 2;
            b.takenBy = 'you';
            S.log.deed = { day: 2, id: b.id, means: 'knife', plant: null, outcome: 'killed', morning: true };
          }
        } else if (want === 'emptied')
          cult().forEach(c => {
            c.status = 'exposed';
            S.stats.right++;
          });
        if (['sealed', 'scarred'].includes(want) && how === 'ward') {
          gain(S.wardOf[S.patron]);
          S.fin.acts.push({ kind: 'ward', it: S.wardOf[S.patron], ok: true });
        }
        if (how === 'rite') S.fin.acts.push({ kind: 'rite', g: S.patron, ok: true });
        if (how === 'shoot') {
          const h = isFree(C(S.hierophant)) ? S.hierophant : cult()[0].id;
          S.fin.acts.push({ kind: 'shoot', id: h, ok: true });
        }
        if (how === 'fire') S.fin.acts.push({ kind: 'fire', ok: true });
        if (want === 'fallen-night' || want === 'bethlem' || want === 'canal') {
          S.fin = null;
          S.phase = want === 'fallen-night' ? 'night' : 'loc';
        }
        if (how === 'deed') {
          // the night you went out yourself, and whoever you went for fought you off with a knife of their own
          const t = freeChars()[0];
          S.log.deed = { day: S.day, id: t.id, means: 'knife', plant: null, outcome: 'failed', knewBy: t.id };
          S.hurtBy = 'deed';
        }
        if (how === 'wrist') {
          // the one who came to your tent was of the cult; you caught her wrist, but not her blade (people/visit.js)
          const h = S.order.map(C).find(c => c.p === 'she' && isFree(c)) || freeChars()[0];
          h.status = 'exposed';
          h.exposedHow = 'night';
          S.log.visit = { id: h.id, day: S.day, agreed: true, chill: false, hurt: 0, struck: 'failed' };
          S.hurtBy = 'wrist';
        }
        if (want === 'bethlem') S.hurtBy = 'study';
        if (want === 'canal') S.hurtBy = 'search';
        if (kind === 'doom') {
          S.aspectOf[S.patron] = want.slice(5);
          S.fin.acts.push({ kind: 'ward', it: S.charms.find(w => w !== S.wardOf[S.patron]), ok: false }, { kind: 'fire', ok: false });
        }
        if (kind === 'death' && S.fin) S.fin.acts.push({ kind: 'fire', ok: false });
        ending(kind, how);
        const grab = () => ({
          kicker: document.querySelector('#kicker').textContent,
          title: document.querySelector('#sceneTitle').textContent,
          sub: document.querySelector('#sceneSub').textContent,
          text: document.querySelector('#sceneText').innerText,
          html: document.querySelector('#sceneText').innerHTML,
          art: document.querySelector('#sceneArt').innerHTML.length,
          choices: [...document.querySelectorAll('#choices .choice')].map(e => e.innerText).join(' | ')
        });
        const en = grab();
        setLang('ru');
        const rus = grab();
        setLang('en');
        const back = grab();
        return { id: S.endId, en, rus, back, missing: [...MISSING], asp: S.aspectOf[S.patron] };
      },
      [want, kind, how, i]
    );
    if (r.id !== want) bad.push([want, 'reached ' + r.id]);
    if (!r.en.art || r.en.art < 2000) bad.push([want, 'no picture']);
    const lat = (r.rus.kicker + r.rus.title + r.rus.sub + r.rus.text + r.rus.choices).match(/[A-Za-z][A-Za-z’'\-]+/g);
    if (lat) bad.push([want, 'ru latin', [...new Set(lat)].slice(0, 12)]);
    const cyr = (r.en.kicker + r.en.title + r.en.sub + r.en.text + r.en.choices).match(/[А-Яа-яЁё]+/g);
    if (cyr) bad.push([want, 'en cyrillic', [...new Set(cyr)].slice(0, 12)]);
    [r.en, r.rus].forEach(v => {
      const m = (v.text + v.sub + v.kicker).match(/.{0,30}(?:[\u0001\u0002\u0003]|undefined|NaN|null|\[object|\{[a-z.:]+).{0,30}/);
      if (m) bad.push([want, 'marker', m[0]]);
    });
    if (r.back.text !== r.en.text) bad.push([want, 'english changed after a round trip']);
    if (r.missing.length) bad.push([want, 'missing', r.missing.slice(0, 4)]);
    if (errs.length) bad.push([want, 'errors', errs.slice(0, 3)]);
    out.push([want, r.en.kicker, r.en.title, r.en.sub, r.rus.title, r.rus.sub, r.asp]);
    const cut = t => (process.env.FULL ? t : t.split(/\n(?:What became of them|Что стало с ними)\n/)[0]);
    if (process.env.SHOW && new RegExp(process.env.SHOW).test(want))
      console.log(
        `\n==================== ${want} (${r.asp})\n--- EN\n${r.en.kicker}\n${r.en.title}\n${r.en.sub}\n${cut(r.en.text)}\n--- RU\n${r.rus.kicker}\n${r.rus.title}\n${r.rus.sub}\n${cut(r.rus.text)}`
      );
    await p.close();
  }
  return out.map(o => o.join(' | ')).join('\n') + '\n' + JSON.stringify({ problems: bad.length, bad }, null, 1);
});
