// Screenshots of a forced ending page. usage: node test/endshot.js <ending-id> [lang] [width]
const path = require('path');
const { run, open } = require('./lib/harness');
const [want = 'sealed', lang = 'en', width = '1280'] = process.argv.slice(2);
const KIND = {
  unopened: ['exposed'],
  sealed: ['triumph', 'ward'],
  banished: ['triumph', 'rite'],
  emptied: ['triumph'],
  shot: ['pyrrhic', 'shoot'],
  burned: ['pyrrhic', 'fire'],
  scarred: ['pyrrhic', 'rite'],
  'fallen-night': ['death'],
  'fallen-below': ['death'],
  bethlem: ['madness'],
  canal: ['madness'],
  counting: ['madness'],
  'doom-fire': ['doom'],
  'doom-dust': ['doom'],
  'doom-sea': ['doom'],
  'doom-teeth': ['doom'],
  'doom-plague': ['doom'],
  'doom-madness': ['doom'],
  truck: ['expelled']
};
run(async browser => {
  const { page: p, errors: errs } = await open(browser, { width: +width, seed: 31337, helpers: false });
  await p.evaluate(
    ([want, kind, how]) => {
      let x = 99;
      const rnd = k => (x = (x * 1103515245 + 12345) % 2147483648) % k;
      document.querySelectorAll('#choices .choice')[1].click();
      document.querySelectorAll('#choices .choice')[0].click(); // the casebook kept the usual way
      for (let n = 0; n < 60; n++) {
        if (S.ended || ['finale', 'descent', 'sanctum'].includes(S.phase) || (S.day >= 4 && S.slot === 2 && S.phase === 'result')) break;
        if (rnd(6) === 0) {
          const m = document.querySelectorAll('[data-mark]');
          if (m.length) m[rnd(m.length)].click();
        }
        const bs = [...document.querySelectorAll('#choices .choice')],
          pool = bs.filter(e => !/Go somewhere else|Never mind|Think better/.test(e.textContent));
        (pool.length ? pool : bs)[rnd((pool.length ? pool : bs).length)].click();
      }
      S.ended = null;
      const below = !['unopened', 'fallen-night', 'bethlem', 'canal', 'truck'].includes(want);
      if (want === 'truck') {
        // the deed on one of the cult, and the camp's judgement (game/deed.js)
        const t = freeCult()[0];
        S.log.deed = { day: S.day, id: t.id, means: 'knife', plant: null, outcome: 'killed', morning: true };
        S.log.deed.vote = { expel: [], keep: [], silent: [], passed: true, day: S.day };
        Object.assign(t, { status: 'taken', takenDay: S.day, takenBy: 'you' });
      }
      if (below) {
        const l = freeChars().find(c => c.role !== 'cult');
        S.fin = S.fin || {
          early: false,
          named: S.patron,
          comp: l ? [l.id] : [],
          left: [],
          tries: 0,
          betrayed: [],
          acts: [],
          g1: 'slow',
          g2: 'eyes',
          g3: { kind: 'self' }
        };
        S.phase = 'sanctum';
      } else {
        S.fin = null;
        S.phase = 'loc';
      }
      if (want === 'unopened' || want === 'emptied')
        freeCult().forEach(c => {
          c.status = 'exposed';
          S.stats.right++;
          if (want === 'unopened') S.log.accused.push({ id: c.id, day: S.day, right: true });
        });
      if (how === 'ward') {
        gain(S.wardOf[S.patron]);
        S.fin.acts.push({ kind: 'ward', it: S.wardOf[S.patron], ok: true });
      }
      if (how === 'rite') S.fin.acts.push({ kind: 'rite', g: S.patron, ok: true });
      if (how === 'shoot') S.fin.acts.push({ kind: 'shoot', id: isFree(C(S.hierophant)) ? S.hierophant : freeCult()[0].id, ok: true });
      if (how === 'fire') S.fin.acts.push({ kind: 'fire', ok: true });
      if (want === 'bethlem') S.hurtBy = 'study';
      if (want === 'canal') S.hurtBy = 'night';
      if (want === 'fallen-night') S.phase = 'night';
      if (kind === 'doom') {
        S.aspectOf[S.patron] = want.slice(5);
        S.fin.acts.push({ kind: 'fire', ok: false }, { kind: 'rite', g: S.patron, ok: false });
      }
      ending(kind, how);
    },
    [want, ...KIND[want]]
  );
  if (lang === 'ru') await p.evaluate(() => setLang('ru'));
  await p.evaluate(() => window.scrollTo(0, 0));
  const f = path.resolve(__dirname, `shots/end-${want}-${lang}-${width}.png`);
  await p.screenshot({ path: f, fullPage: true });
  return `${f} ${JSON.stringify(errs)}`;
});
