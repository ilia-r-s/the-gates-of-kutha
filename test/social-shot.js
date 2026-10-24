// Screens of the social layer mid-season: the People tab's chips, the Evidence tab's gossip and rumours, and a
// conversation. usage: node test/social-shot.js [lang] [width]
const path = require('path');
const { run, open } = require('./lib/harness');
const [lang = 'en', width = '1280'] = process.argv.slice(2);
run(async browser => {
  const { page: p, errors: errs } = await open(browser, { width: +width, height: 1000, seed: 808, helpers: false });
  await p.evaluate(() => {
    window.sfx = () => {};
    document.querySelectorAll('#choices .choice')[1].click();
    document.querySelectorAll('#choices .choice')[0].click(); // the casebook kept the usual way
    // two days of talk: everyone is asked about the diary and whom they distrust; some small talk, a press, a confidence
    S.order.map(C).forEach(c => {
      DIALOG.diary.run(c);
      DIALOG.about.run(c);
      DIALOG.about.run(c);
      DIALOG.distrust.run(c);
      mienNote(c, 1);
    });
    DIALOG.press.run(C(S.order[1]));
    DIALOG.confide.run(C(S.order[4]));
    for (let d = 1; d <= 2; d++) {
      S.day = d;
      S.phase = 'night';
      resolveNight();
    }
    S.day = 3;
    S.slot = 0;
    startSlot();
    goTo('camp');
    const c = freeChars()[0];
    talk(c.id);
  });
  if (lang === 'ru') await p.evaluate(() => setLang('ru'));
  const shot = async tab => {
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
    await el.screenshot({ path: path.resolve(__dirname, `shots/soc-${tab}-${lang}-${width}.png`) });
  };
  await shot('people');
  await shot('evidence');
  return 'done ' + JSON.stringify(errs);
});
