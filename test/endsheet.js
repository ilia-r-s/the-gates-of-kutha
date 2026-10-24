// One contact sheet of all eighteen ending pictures, titled.  usage: node test/endsheet.js [out.png]
const path = require('path');
const { run, open } = require('./lib/harness');

run(async browser => {
  const { page, errors } = await open(browser, { width: 1700, height: 1200, helpers: false });
  await page.evaluate(() => {
    const asp = {
      sealed: 'fire',
      banished: 'dust',
      emptied: 'sea',
      shot: 'teeth',
      'fallen-night': 'dust',
      'doom-fire': 'fire',
      'doom-dust': 'dust',
      'doom-sea': 'sea',
      'doom-teeth': 'teeth',
      'doom-plague': 'plague',
      'doom-madness': 'madness'
    };
    document.body.innerHTML =
      '<div id="sheet" style="display:grid;grid-template-columns:repeat(4,400px);gap:14px 12px;padding:16px;background:#0e121b"></div>';
    END_IDS.forEach((id, i) => {
      const a = asp[id] || 'fire',
        d = document.createElement('div');
      d.style.cssText = 'font:15px Georgia,serif;color:#efe3c8';
      d.innerHTML = `<div style="line-height:0;border:1px solid #283246">${sceneSVG({ bg: 'end', end: id, aspect: a, time: END_TIME[id] }, `end${i}-`)}</div><div style="margin-top:6px"><span style="font:11px monospace;color:#c9a44c;letter-spacing:.1em">${i + 1} · </span>${X(endTitle(id))}</div>`;
      document.getElementById('sheet').appendChild(d);
    });
  });
  const out = process.argv[2] || path.resolve(__dirname, 'shots/endsheet.png');
  await (await page.$('#sheet')).screenshot({ path: out });
  return `wrote ${out}` + (errors.length ? `\nerrors: ${JSON.stringify(errors)}` : '');
});
