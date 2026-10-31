// A contact sheet of every person in every mood (ui/art.js MOODS), to look at.  usage: node test/faces.js [out.png]
const path = require('path');
const { run, open } = require('./lib/harness');

run(async browser => {
  const { page, errors } = await open(browser, { width: 1400, height: 1000, helpers: false });
  await page.evaluate(() => {
    const ids = CHARS.map(c => c.id);
    const cell = (id, m) =>
      `<svg viewBox="40 24 120 132" width="112" height="123" style="background:#e9d9b6;border:1px solid #283246">${portrait(id, m, 0, `${id}-${m}-`)}</svg>`;
    document.body.innerHTML =
      `<table id="sheet" style="border-collapse:separate;border-spacing:6px;background:#0e121b;color:#efe3c8;font:12px monospace">` +
      `<tr><td></td>${MOODS.map(m => `<td style="text-align:center">${m}</td>`).join('')}</tr>` +
      ids.map(id => `<tr><td>${id}</td>${MOODS.map(m => `<td>${cell(id, m)}</td>`).join('')}</tr>`).join('') +
      '</table>';
  });
  const out = process.argv[2] || path.resolve(__dirname, 'shots/faces.png');
  await (await page.$('#sheet')).screenshot({ path: out });
  return `wrote ${out}` + (errors.length ? `\nerrors: ${JSON.stringify(errors)}` : '');
});
