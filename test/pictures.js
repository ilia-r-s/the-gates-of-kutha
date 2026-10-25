// The README's pictures, taken from the built page into docs/images/ (DEVELOPING.md, "Pictures for the README").
// Each comes from seasons dealt from fixed seeds and played by the test policies (test/lib/inpage.js), with the game's
// own typefaces served from the @fontsource packages, so the same build takes the same pictures. A picture is the first
// moment of its kind in those seasons; one whose moment never came is reported, never faked.
//   node test/pictures.js                 all of them
//   node test/pictures.js --only=talk     one (title, day, talk, morning, casebook, below, ending, russian)
const fs = require('fs');
const path = require('path');
const { run, open, args, ROOT } = require('./lib/harness');
const A = args({ only: '' });
const OUT = path.join(ROOT, 'docs', 'images');
const W = 1280,
  H = 800;
// the seasons tried, in turn, until every moment has been found: [seed, lean (a way of playing; null: plain)]
const SEASONS = [
  [7, null],
  [2026, null],
  [1926, 'quiet'],
  [11, 'quiet'],
  [13, 'quiet'],
  [17, 'confidant'],
  [19, 'quiet'],
  [23, 'quiet'],
  [29, 'delver'],
  [31, 'quiet']
];
// the moments, as the page sees them: [name, predicate on the season, what to photograph]
const MOMENTS = [
  ['day', `S.phase === 'loc' && (S.here[S.loc] || []).length >= 3`, 'page'],
  ['talk', `S.phase === 'talk' && document.querySelectorAll('#sceneText p').length >= 5`, 'page'],
  ['morning', `S.phase === 'night' && S.day >= 3`, 'page'],
  ['casebook', `S.phase === 'plan' && S.day >= 3`, 'casebook'],
  ['below', `S.phase === 'descent' && /first gate/i.test(X(S_ui.scene.title))`, 'page'],
  ['ending', `!!S.ended`, 'page']
];
const want = name => !A.only || String(A.only).split(',').includes(name);

async function settle(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(450); // (the scene's short fade: ui/scene.js, entrance)
}
async function shoot(page, name, what) {
  await settle(page);
  const file = path.join(OUT, `${name}.png`);
  if (what === 'casebook') {
    // (the casebook's people, the page scrolled down to them, so that the picture is as wide as the others)
    await page.evaluate(() => {
      S_ui.tab = 'people';
      renderBook();
      const tp = document.getElementById('tabPanel');
      tp.style.maxHeight = 'none';
      tp.style.height = 'auto';
      tp.style.overflow = 'visible';
      window.scrollTo(0, document.querySelector('.casebook').getBoundingClientRect().top + window.scrollY - 24);
    });
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: file });
  return file;
}
// a season from its seed: through the title screen and the reply as a player would, then played by the policy until
// every moment still wanted has been photographed, or the season is over
async function season(browser, [seed, lean], lang, moments, found) {
  const { page, errors } = await open(browser, { width: W, height: H, seed, mathSeed: seed, fonts: 'local', lang });
  await page.evaluate(() => {
    window.sfx = () => {};
  });
  if (want('title') && !found.title && !lang) found.title = await shoot(page, 'title', 'page');
  await page.evaluate(() => document.querySelectorAll('#choices .choice')[0].click()); // (the philologist)
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelectorAll('#choices .choice')[0].click()); // (the casebook kept the usual way)
  await page.waitForFunction(() => S !== null);
  await page.evaluate(l => (window.__P = __T.policies.human(__T.lcg(99), __T.LEANS[l] || null)), lean);
  for (let step = 0; step < 1500; step++) {
    const due = moments.filter(([name]) => !found[name]);
    if (!due.length) break;
    const hit = await page.evaluate(
      preds => preds.map(p => (S.ended && !/S\.ended/.test(p) ? false : !!eval(p))), // (eval: the predicates above)
      due.map(m => m[1])
    );
    for (let i = 0; i < due.length; i++) if (hit[i]) found[due[i][0]] = await shoot(page, lang === 'ru' ? 'russian' : due[i][0], due[i][2]);
    const more = await page.evaluate(() => {
      const bs = __T.buttons();
      if (!bs.length || S.ended) return false;
      (window.__P(bs) || bs[0]).click();
      return true;
    });
    if (!more) {
      // (the season is over: the ending, if it was wanted, was photographed above, before this check)
      const end = moments.find(([name]) => name === 'ending' && !found.ending);
      if (end && (await page.evaluate(() => !!S.ended))) found.ending = await shoot(page, 'ending', 'page');
      break;
    }
  }
  await page.close();
  return errors;
}

run(async browser => {
  fs.mkdirSync(OUT, { recursive: true });
  const found = {},
    errors = [];
  const moments = MOMENTS.filter(([name]) => want(name));
  for (const s of SEASONS) {
    if (moments.every(([name]) => found[name]) && (!want('title') || found.title)) break;
    errors.push(...(await season(browser, s, null, moments, found)));
  }
  // a conversation in Russian
  if (want('russian')) {
    const ru = {};
    for (const s of SEASONS) {
      if (ru.talk) break;
      errors.push(
        ...(await season(
          browser,
          s,
          'ru',
          MOMENTS.filter(([name]) => name === 'talk'),
          ru
        ))
      );
    }
    found.russian = ru.talk;
  }
  const names = ['title', ...MOMENTS.map(m => m[0]), 'russian'].filter(want);
  return {
    pictures: names.map(n => (found[n] ? path.relative(ROOT, found[n]) : `${n}: never came`)),
    errors: errors.slice(0, 5)
  };
});
