// Every conversation option with every person, in Russian, printed for proofreading.  usage: node test/rutalk.js
const { run, open } = require('./lib/harness');

run(async browser => {
  const { page, errors } = await open(browser, { seed: 77, lang: 'ru', helpers: false });
  const out = await page.evaluate(() => {
    newGame('Marlowe', 'occultist');
    S.day = 2;
    startSlot();
    ['bowl'].concat(S.charms.slice(0, 2)).forEach(gain);
    const res = [],
      say = () => document.querySelector('#sceneText').innerText;
    CHARS.forEach(ch => {
      const c = C(ch.id);
      c.rapport = 2;
      S.loc = 'camp';
      S.here.camp = [c.id];
      [
        ['about', 'night'],
        ['show', 'distrust'],
        ['diary', 'title'],
        ['confide', 'press']
      ].forEach(pair => {
        talk(c.id);
        pair.forEach(k => {
          const cc = S_ui.scene.choices.find(x => DIALOG[k] && X(x.label) === X(DIALOG[k].label(c)));
          if (cc) cc.fn();
          if (/Что вы положите|О каком титуле/.test(say())) S_ui.scene.choices[0].fn();
        });
        res.push(
          '### ' +
            X(S_ui.scene.title) +
            ' — ' +
            pair.join('+') +
            '\n' +
            say() +
            '\n[' +
            [...document.querySelectorAll('#choices .choice')].map(e => e.innerText.replace(/\s+/g, ' ')).join(' | ') +
            ']'
        );
        S_ui.scene.choices[S_ui.scene.choices.length - 1].fn();
        res.push(say().split('\n').slice(-1)[0]);
      });
    });
    return res.join('\n\n');
  });
  return out + (errors.length ? '\nerrors: ' + JSON.stringify(errors) : '');
});
