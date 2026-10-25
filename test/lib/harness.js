// Shared plumbing for the browser tests and simulators: one Chromium, pages with the game loaded and web fonts
// blocked (or, for pictures, served from the @fontsource packages), page errors collected, and the in-page helpers
// (test/lib/inpage.js) installed as window.__T.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FILES = { standalone: path.join(ROOT, 'standalone.html'), artifact: path.join(ROOT, 'kutha.html') };

const launch = () => chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

// The game's typefaces as Google Fonts serves them (src/page/head.html), from the @fontsource packages instead, so that
// a picture of the page looks as a player sees it without any network: each package's style sheets, their files
// answered from node_modules.
const FONTS = [
  ['im-fell-english-sc', ['400']],
  ['spectral', ['400', '400-italic', '600']],
  ['courier-prime', ['400', '700']],
  ['noto-sans-cuneiform', ['400']]
];
const fontDir = pkg => path.join(ROOT, 'node_modules', '@fontsource', pkg);
async function serveFonts(page) {
  const css = FONTS.flatMap(([pkg, styles]) =>
    styles.map(st =>
      fs
        .readFileSync(path.join(fontDir(pkg), `${st}.css`), 'utf8')
        .replace(/url\(\.\/files\/([^)]+)\)/g, (m, f) => `url(https://fonts.gstatic.com/local/${pkg}/${f})`)
    )
  ).join('\n');
  const cors = { 'Access-Control-Allow-Origin': '*' };
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', headers: cors, body: css }));
  await page.route(/fonts\.gstatic\.com/, r => {
    const m = r
      .request()
      .url()
      .match(/\/local\/([\w-]+)\/([\w.-]+)$/);
    if (!m) return r.abort();
    r.fulfill({
      status: 200,
      contentType: m[2].endsWith('.woff2') ? 'font/woff2' : 'font/woff',
      headers: cors,
      body: fs.readFileSync(path.join(fontDir(m[1]), 'files', m[2]))
    });
  });
}

// A page with the game on it. seed fixes the game's dice; mathSeed fixes Math.random too (music, test policies);
// fonts: 'block' (the tests: the system's fonts, the same everywhere) or 'local' (the game's own, for pictures).
async function open(
  browser,
  { file = FILES.standalone, seed = null, mathSeed = null, width = 1280, height = 900, lang = null, helpers = true, fonts = 'block' } = {}
) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(`${e.message} ${(e.stack || '').split('\n').slice(1, 3).join(' ')}`.trim()));
  page.on('console', m => {
    if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text());
  });
  if (fonts === 'local') await serveFonts(page);
  else await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  if (seed != null)
    await page.addInitScript(s => {
      window.__seed = s;
    }, seed);
  if (mathSeed != null) {
    await page.addInitScript(s => {
      let m = (s * 2654435761) >>> 0;
      Math.random = () => {
        m = (m + 0x6d2b79f5) | 0;
        let t = Math.imul(m ^ (m >>> 15), 1 | m);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }, mathSeed);
  }
  await page.goto('file://' + (FILES[file] || file));
  if (helpers) await page.addScriptTag({ path: path.join(__dirname, 'inpage.js') });
  if (lang) await page.evaluate(l => setLang(l), lang);
  return { page, errors };
}

// Run a test body with a browser and print what it returns, as JSON unless it is already text.
async function run(body) {
  const browser = await launch();
  try {
    const out = await body(browser);
    if (out !== undefined) console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
  } finally {
    await browser.close();
  }
}

// Words kept in both languages so the page does not move when the language changes (ui/lang.js, twin): in captured
// HTML both versions are present, one of them hidden. This strips the hidden ones, leaving what a reader of lang sees.
const shownOnly = (html, lang) =>
  html.replace(new RegExp(`<span class="tw tw-(?:${lang === 'ru' ? 'en' : 'ru'}|ghost)"[^>]*>[^<]*</span>`, 'g'), '');
// command-line arguments: positional values and --name=value options
function args(defaults = {}) {
  const a = { _: [], ...defaults };
  process.argv.slice(2).forEach(s => {
    const m = s.match(/^--([\w-]+)(?:=(.*))?$/);
    if (m) a[m[1]] = m[2] == null ? true : isNaN(+m[2]) ? m[2] : +m[2];
    else a._.push(isNaN(+s) ? s : +s);
  });
  return a;
}

module.exports = { ROOT, FILES, launch, open, run, args, shownOnly };
