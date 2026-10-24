// Shared plumbing for the browser tests and simulators: one Chromium, pages with the game loaded and web fonts
// blocked, page errors collected, and the in-page helpers (test/lib/inpage.js) installed as window.__T.
const { chromium } = require('playwright');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FILES = { standalone: path.join(ROOT, 'standalone.html'), artifact: path.join(ROOT, 'kutha.html') };

const launch = () => chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

// A page with the game on it. seed fixes the game's dice; mathSeed fixes Math.random too (music, test policies).
async function open(
  browser,
  { file = FILES.standalone, seed = null, mathSeed = null, width = 1280, height = 900, lang = null, helpers = true } = {}
) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(`${e.message} ${(e.stack || '').split('\n').slice(1, 3).join(' ')}`.trim()));
  page.on('console', m => {
    if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text());
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
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
