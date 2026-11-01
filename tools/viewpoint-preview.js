#!/usr/bin/env node
// Complete local games for visual comparison. Never changes production source or the shipped HTML.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const { parse, walk } = require('./syntax');
const { LIMITS, createProbe, budget } = require('./resources');
const { ROOT, FILE, args, openNode } = require('../test/lib/harness');
const { play, cases, fingerprint } = require('../test/lib/season');
const options = args(),
  sourceFile = path.resolve(ROOT, options.file || FILE),
  out = path.resolve(ROOT, options.out || '.local/preview/29-viewpoints'),
  source = fs.readFileSync(sourceFile, 'utf8'),
  seed = Number(options.seed ?? 4242),
  storageKeys = ['kutha.endings', 'kutha.expedition', 'kutha.language', 'kutha-audio', 'kutha.viewpoint'];
if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Preview seed must be an unsigned 32-bit integer');
const hex = seed.toString(16).toUpperCase().padStart(8, '0'),
  code = hex.slice(0, 4) + '-' + hex.slice(4),
  variants = [
    { id: 'over-shoulder', label: 'Over the shoulder', ru: 'От третьего лица' },
    { id: 'first-person', label: 'First person', ru: 'От первого лица' }
  ];
const digest = text => createHash('sha256').update(text).digest('hex');

function preview(v) {
  const start = source.indexOf('<script>\n') + '<script>\n'.length,
    end = source.lastIndexOf('</script>');
  if (start < '<script>\n'.length || end < start) throw Error('Missing game script');
  let script = source.slice(start, end);
  const replacements = [],
    counts = Object.fromEntries(storageKeys.map(k => [k, 0]));
  walk(parse(script, { ecmaVersion: 'latest' }), n => {
    if (n.type === 'Literal' && storageKeys.includes(n.value)) {
      counts[n.value]++;
      replacements.push([n.start, n.end, JSON.stringify('kutha.preview.29.' + v.id + '.' + n.value)]);
    }
  });
  for (const key of storageKeys) assert.ok(counts[key], 'Storage key missing: ' + key);
  for (const [a, b, text] of replacements.sort((a, b) => b[0] - a[0])) script = script.slice(0, a) + text + script.slice(b);
  script +=
    '\n// Local preview only: matching default season; independent saves and preferences.\n' +
    `(() => { const original = seedAddressValue; seedAddressValue = () => original() ?? ${JSON.stringify(code)}; })();\n`;
  script += `(() => { const init = Viewpoint.init; Viewpoint.init = () => init('${v.id === 'first-person' ? 'first' : 'third'}'); })();\n`;
  const ribbon = `<aside class="preview-ribbon"><span class="preview-en">${v.label}</span><span class="preview-ru">${v.ru}</span> · <a href="index.html">Compare / Сравнить</a></aside>`;
  return (source.slice(0, start) + script + source.slice(end))
    .replace('</title>', ' · ' + v.label + '</title>')
    .replace(
      '</head>',
      '<style>.preview-ribbon{max-width:980px;margin:8px auto 0;padding:5px 9px;background:#101520;color:#e7d9bc;border:1px solid #8c763f;font:12px Georgia;opacity:.92}@media(max-width:640px){.preview-ribbon{margin:8px 16px 0}}.preview-ribbon a{color:#d6b565}.preview-ru,html[lang="ru"] .preview-en{display:none}html[lang="ru"] .preview-ru{display:inline}</style></head>'
    )
    .replace('<body>', '<body>' + ribbon);
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const probe = createProbe(),
    headroom = () => {
      const plan = budget(probe(), [], 1);
      if (plan.critical || plan.warning || plan.memory < LIMITS.nodeBytes)
        throw Error('Resource guard stopped preview verification; this build is incomplete');
    };
  headroom();
  // A newly generated HTML file must not inherit an older verification claim
  // or screenshot when the requested checks have not yet completed.
  for (const file of [
    'manifest.json',
    'browser-verification.json',
    ...variants.flatMap(v => ['group', 'talk', 'mobile-ru'].map(kind => v.id + '-' + kind + '.png'))
  ])
    fs.rmSync(path.join(out, file), { force: true });
  const manifest = {
    status: 'Both shipped viewpoints; third person is the default; original character staging retained',
    sourceSha256: digest(source),
    seed,
    code,
    variants: variants.map(v => {
      const html = preview(v),
        file = path.join(out, v.id + '.html');
      fs.writeFileSync(file, html);
      return {
        ...v,
        file: path.basename(file),
        sha256: digest(html),
        storageKeys: storageKeys.map(k => 'kutha.preview.29.' + v.id + '.' + k)
      };
    })
  };
  fs.writeFileSync(
    path.join(out, 'index.html'),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Gates of Kutha · viewpoint comparison</title><style>body{max-width:850px;margin:10vh auto;padding:24px;background:#101520;color:#e7d9bc;font:18px/1.6 Georgia}h1{color:#c9a44c;font-weight:normal}a{color:#dfbd6e}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}.views a{padding:24px;border:1px solid #8c763f;border-radius:8px;text-decoration:none}small{display:block;color:#a9a18f;font-size:14px}</style><h1>The Gates of Kutha</h1><p>Two complete, playable views of the same expedition. Both use the shipped renderer. Third person is the default, with the original over-the-shoulder composition. First person keeps the same people, positions and scale, viewed through the protagonist’s eyes.</p><div class="views">${variants.map(v => `<a href="${v.id}.html">${v.label}<small>${v.ru}</small></a>`).join('')}</div><p>Both begin with the same expedition. Choose the same background and notebook mode, then make the same choices to compare matching scenes. You can change either view in the casebook. Each copy remembers its own expedition, viewpoint, language, sound preferences and endings. The main game’s save is untouched.</p><p>Обе версии начинают одну и ту же экспедицию. Выберите одинаковые предысторию и режим записной книжки, затем повторите решения, чтобы сравнить те же сцены. Вид можно изменить в журнале. Сохранения и настройки каждой версии независимы; основная игра не затронута.</p><small>Both views use the same production renderer and 29.0.0 rules. These local copies do not alter the main game.</small></html>`
  );
  const opened = [];
  try {
    for (const file of [sourceFile, ...manifest.variants.map(v => path.join(out, v.file))]) opened.push(await openNode(null, { file }));
    // The Node adapter does not dispatch browser boot events. Select the same
    // initial preference each complete HTML game loads in a real browser.
    await opened[2].page.evaluate(() => {
      Viewpoint.set('first', false);
    });
    for (const { page } of opened)
      await page.evaluate(() => {
        globalThis.__previewArtFrames = [];
        listen('scene', sc => {
          const dice = [_seed, _words];
          __previewArtFrames.push(sceneSVG(artFor(sc)));
          if (_seed !== dice[0] || _words !== dice[1]) throw Error('Preview art consumed seeded dice');
        });
      });
    for (const c of cases) {
      headroom();
      for (const { page } of opened)
        await page.evaluate(() => {
          __previewArtFrames.length = 0;
        });
      const expected = fingerprint(await opened[0].page.evaluate(play, c));
      for (let i = 1; i < opened.length; i++)
        assert.deepEqual(
          fingerprint(await opened[i].page.evaluate(play, c)),
          expected,
          JSON.stringify({ variant: variants[i - 1].id, case: c })
        );
      assert.deepEqual(
        await opened[1].page.evaluate(() => __previewArtFrames),
        await opened[0].page.evaluate(() => __previewArtFrames),
        'Over-the-shoulder scene SVG changed: ' + JSON.stringify(c)
      );
    }
    for (const { errors } of opened) assert.deepEqual(errors, []);
    manifest.verification = {
      matchingFullSeasonsPerVariant: cases.length,
      stateChoicesAndBothDiceIdentical: true,
      sceneRenderingDoesNotRoll: true,
      overShoulderSceneSvgIdentical: true
    };
  } finally {
    for (const { page } of opened) await page.close();
  }
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ out, sourceSha256: manifest.sourceSha256, ...manifest.verification }));
}
main().catch(error => {
  console.error(error.stack);
  process.exitCode = 1;
});
