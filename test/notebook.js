// Screens of the new notebook, the claims and a conversation, mid-season. usage: node test/notebook.js [lang] [width]
const path = require('path');
const { run, open } = require('./lib/harness');
const [lang = 'en', width = '1280'] = process.argv.slice(2);
run(async browser => {
  const { page: p, errors: errs } = await open(browser, { width: +width, height: 1000, seed: 2026, helpers: false });
  await p.evaluate(() => {
    document.querySelectorAll('#choices .choice')[0].click(); // philologist
    document.querySelectorAll('#choices .choice')[0].click(); // the casebook kept the usual way
    // a season's worth of work, done quickly
    for (let i = 0; i < 3; i++) {
      S.omenLog.push({ day: i + 1, i, si: S.signsOf[S.patron][i] });
      S.omenSeen.push(i);
    }
    S.fragments = 6;
    for (let i = 0; i < 4; i++) {
      S.loc = 'camp';
      const t = studyTopics();
      doStudy(t.length ? t[i % t.length] : null);
    }
    S.charms.slice(0, 3).forEach(gain);
    ['anselm', 'ilse', 'zahrun'].forEach(id => {
      const c = C(id);
      const e = titlesToAsk(c)[0];
      if (e) DIALOG.title.run(c, e);
    });
    S.order.forEach((id, k) => {
      if (k % 2 === 0) {
        DIALOG.diary.run(C(id));
      }
    });
    const sch = C('anselm');
    DIALOG.show.run(
      sch,
      S.items.find(w => CHARMS.includes(w))
    );
    S.gm['p:' + S.gods[1]] = 2;
    const t0 = titlesMet()[0];
    if (t0) S.gm['t' + t0 + ':' + S.titleOf[t0]] = 1;
    startSlot();
    goTo('camp');
    talk(S.order[1]);
  });
  if (lang === 'ru') await p.evaluate(() => setLang('ru'));
  const shot = async (tab, name) => {
    await p.evaluate(t => {
      S_ui.tab = t;
      renderBook();
      const tp = document.getElementById('tabPanel');
      tp.style.maxHeight = 'none';
      tp.style.height = 'auto';
      tp.style.overflow = 'visible';
      document.querySelector('.casebook').scrollIntoView();
    }, tab);
    const el = await p.$('.casebook');
    await el.screenshot({ path: path.resolve(__dirname, `shots/nb-${name}-${lang}-${width}.png`) });
  };
  await shot('omens', 'omens');
  await shot('evidence', 'evidence');
  await shot('people', 'people');
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: path.resolve(__dirname, `shots/nb-talk-${lang}-${width}.png`) });
  return 'done ' + JSON.stringify(errs);
});
