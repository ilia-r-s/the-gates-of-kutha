// The top panel and the casebook tabs stay where they are when the language changes, or the music is switched off:
// every indicator is measured before and after, at desktop, tablet and phone widths (the tabs within the casebook's own
// bar, which on a narrow screen sits below the scene and goes down with a longer telling of it).
//   usage: node test/topbar.js [--page=path]   (another build instead of standalone.html)
const { run, open, args } = require('./lib/harness');
const PAGE = args().page;
const SEL = ['.brand', '#musicBtn', '#sfxBtn', '#langBtn', '#nowPlaying', '#meters', '.meter', '.m-label', '.m-say', '.tab'];

run(async browser => {
  const bad = [];
  let n = 0;
  for (const width of [1280, 820, 390]) {
    const { page, errors } = await open(browser, { file: PAGE || 'standalone', width, seed: 7, helpers: false });
    await page.evaluate(() => {
      newGame('Marlowe', 'soldier');
      arrivalScene();
      startSlot();
      AU.on.music = true;
      AU.cur = { id: 'hijaz' };
      auButtons();
    });
    const measure = () =>
      page.evaluate(
        sel =>
          sel.flatMap(s =>
            [...document.querySelectorAll(s)].map((e, i) => {
              // (the casebook's tabs, where its bar is: below the scene on a narrow screen, they go down with a longer
              // telling of it, as they should, but never move within their own bar)
              const r = e.getBoundingClientRect(),
                bar = s === '.tab' && e.closest('.casebook'),
                top = bar ? bar.getBoundingClientRect().y : 0;
              return [`${s}[${i}]`, r.x, r.y - top, r.width, r.height];
            })
          ),
        SEL
      );
    const compare = (a, b, what) => {
      n += a.length;
      a.forEach((x, i) => {
        const y = b[i];
        if (!y || x[0] !== y[0] || x.slice(1).some((v, j) => Math.abs(v - y[j + 1]) > 0.5))
          bad.push({ width, what, el: x[0], before: x.slice(1).map(Math.round), after: y && y.slice(1).map(Math.round) });
      });
    };
    const en = await measure();
    await page.evaluate(() => setLang('ru'));
    compare(en, await measure(), 'language');
    const ru = await measure();
    await page.evaluate(() => {
      AU.on.music = false;
      AU.on.sfx = false;
      auButtons();
      AU.on.music = true;
      npUpdate();
    });
    compare(ru, await measure(), 'sound off');
    if (errors.length) bad.push({ width, errors });
    await page.close();
  }
  return { measured: n, problems: bad.length, sample: bad.slice(0, 12) };
});
