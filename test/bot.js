// Bots that play the real page: a random clicker at desktop and phone widths, in both casebook modes (it must never get
// stuck or throw), and a cheat who knows the cult and makes a case against it before accusing (it must never accuse an
// innocent, and must win by inquiry at least now and then: the camp backs a case, not a hunch).
// usage: node test/bot.js [games]
const path = require('path');
const { run, open, args } = require('./lib/harness');
const G = args()._[0] || 60;

run(async browser => {
  const out = {};
  for (const [w, h, games] of [
    [1280, 900, G],
    [390, 844, Math.ceil(G / 3)]
  ]) {
    const { page, errors } = await open(browser, { width: w, height: h, seed: 2024 + w, mathSeed: w });
    out[`${w}px random`] = await page.evaluate(games => {
      const rnd = __T.lcg(7),
        random = __T.policies.random(rnd),
        r = { endings: {}, stuck: 0, steps: 0, maxSteps: 0 };
      for (let g = 0; g < games; g++) {
        __T.start(g % 3, g % 4 >= 2); // half of them with the casebook kept hardcore
        let steps = 0;
        // now and then the casebook, a mark, the site plan, as a person would
        const ok = __T.play(random, {
          maxSteps: 600,
          each: () => {
            steps++;
            if (rnd() < 0.1) {
              const tabs = document.querySelectorAll('.tab');
              tabs[Math.floor(rnd() * tabs.length)].click();
            }
            if (rnd() < 0.08) {
              const m = document.querySelectorAll('[data-mark]');
              if (m.length) m[Math.floor(rnd() * m.length)].click();
            }
            if (rnd() < 0.05) {
              const l = document.querySelectorAll('#map [data-loc]');
              if (l.length) l[Math.floor(rnd() * l.length)].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          }
        });
        if (!ok) r.stuck++;
        else r.endings[S.endId] = (r.endings[S.endId] || 0) + 1;
        r.steps += steps;
        r.maxSteps = Math.max(r.maxSteps, steps);
      }
      r.avgSteps = +(r.steps / games).toFixed(1);
      delete r.steps;
      return r;
    }, games);
    out[`${w}px random`].errors = errors.slice(0, 8);
    await page.screenshot({ path: path.join(__dirname, 'shots', `bot-${w}.png`) }).catch(() => {});
    await page.close();
  }
  const { page, errors } = await open(browser, { seed: 99 });
  out.cheat = await page.evaluate(() => {
    const rnd = __T.lcg(41),
      r = { endings: {}, stuck: 0, innocentsAccused: 0, refused: 0 };
    for (let g = 0; g < 40; g++) {
      __T.start(g % 3);
      if (!__T.play(__T.policies.cheat(rnd), { maxSteps: 900 })) r.stuck++;
      r.endings[S.endId] = (r.endings[S.endId] || 0) + 1;
      r.innocentsAccused += (S.inquiries || []).filter(v => C(v.id).role !== 'cult').length;
      r.refused += S.log.refusedInq.length;
    }
    r.cheatOk = !r.stuck && !r.innocentsAccused && (r.endings.unopened || 0) >= 8;
    return r;
  });
  out.cheat.errors = errors.slice(0, 5);
  return out;
});
