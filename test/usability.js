// Real keyboard/pointer input, local typefaces, and reloads of the actual self-contained document.
// --file=path checks a preserved artifact, including the Node route finder and reload destinations.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launch, open, openNode, FILE: DEFAULT_FILE, ROOT, args } = require('./lib/harness');
const FILE = path.resolve(ROOT, args().file || DEFAULT_FILE);
let browser;
before(async () => {
  browser = await launch();
  console.log('browser:', browser.version());
});
after(async () => {
  if (browser) await browser.close();
});

async function withPage(fn, options = {}, owner = browser) {
  const { page, errors } = await open(owner, { file: FILE, fonts: 'local', helpers: false, ...options });
  try {
    assert.deepEqual(errors, [], 'browser startup');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(async () => {
      // Load both script subsets explicitly: Firefox can finish `ready` before a newly used subset is requested.
      await document.fonts.load('16px Spectral', 'The Gates of Kutha Врата Куты');
      await document.fonts.ready;
    });
    await fn(page);
    assert.deepEqual(errors, [], 'browser errors');
  } finally {
    await page.close();
  }
}
async function start(page, seed = '0000-1092', background = 0, hardcore = false) {
  await page.getByRole('button', { name: 'Enter a season code', exact: true }).click();
  await page.locator('#pseed').fill(seed);
  await page.locator('#choices .choice').nth(background).click();
  await page
    .locator('#choices .choice')
    .nth(hardcore ? 1 : 0)
    .click();
}
async function openBook(page) {
  if (!(await page.locator('#notebookDialog').isVisible())) await page.locator('#casebookBtn').click();
}
async function switchLanguage(page) {
  await openBook(page);
  await page.locator('#langBtn').click();
  await page.locator('#closeCasebook').click();
}
async function travel(page, loc) {
  await openBook(page);
  await page.locator('#map [data-loc="' + loc + '"]').press('Enter');
  assert.equal(await page.locator('#notebookDialog').isVisible(), false);
}
async function capture(page) {
  return page.evaluate(() => {
    const seen = new Map(),
      lang = LANG;
    LANG = 'en';
    const state = JSON.stringify(S, (k, v) => {
      if (typeof v === 'string') return X(v);
      if (!v || typeof v !== 'object') return v;
      if (seen.has(v)) return '#' + seen.get(v);
      seen.set(v, seen.size);
      return v;
    });
    LANG = lang;
    return {
      state,
      dice: [_seed, _words],
      playlist: AU.playlist,
      track: AU.want || trackNow(),
      lang,
      tab: S_ui.tab,
      ui: ['sceneTitle', 'sceneText', 'choices', 'mapDyn', 'tabPanel', 'sceneArt'].map(id => document.getElementById(id).innerHTML)
    };
  });
}
async function reloadUnchanged(page) {
  const saved = await capture(page);
  await page.reload();
  assert.equal(await page.locator('#sessionNotice').isVisible(), false, 'resume warning');
  assert.deepEqual(await capture(page), saved, 'reloaded expedition');
}

test('revealed typed and linked season codes retain invalid input and explain it in both languages', () =>
  withPage(async p => {
    await p.getByRole('button', { name: 'Enter a season code', exact: true }).click();
    await p.locator('#pseed').fill('C0DE-OOO1');
    await p.locator('#choices .choice').first().click();
    assert.equal(await p.locator('#pseed').getAttribute('aria-invalid'), 'true');
    assert.match(await p.locator('#seedError').textContent(), /hexadecimal/);
    assert.equal(await p.evaluate(() => S), null);
    await switchLanguage(p);
    assert.match(await p.locator('#seedError').textContent(), /шестнадцатеричных/);
    assert.equal(await p.locator('#pseed').inputValue(), 'C0DE-OOO1');
    await p.locator('#pseed').fill('C0DE-0001');
    assert.equal(await p.locator('#pseed').getAttribute('aria-invalid'), 'false');
    await p.locator('#choices .choice').first().click();
    await p.locator('#choices .choice').first().click();
    assert.equal(await p.evaluate(() => S.seed), 0xc0de0001);
    await p.evaluate(() => localStorage.removeItem('kutha.expedition'));
    // pagehide must not write the explicitly superseded save back.
    await p.goto(pathToFileURL(FILE).href + '?seed=C0DE-0001junk');
    assert.equal(await p.locator('#seedRow').isVisible(), false);
    await p.locator('#seedKey').click();
    assert.equal(await p.locator('#pseed').inputValue(), 'C0DE-0001junk');
    assert.equal(await p.locator('#pseed').getAttribute('aria-invalid'), 'true');
    await p.locator('#choices .choice').first().click();
    assert.equal(await p.evaluate(() => S), null);
  }));

test('linked season codes remain hidden in the title, casebook and ending until the secret control is pressed', async () => {
  for (const reveal of [false, true])
    await withPage(async p => {
      await p.goto(pathToFileURL(FILE).href + '?seed=C0DE-0001');
      assert.equal(await p.locator('#seedRow').isVisible(), false);
      if (reveal) await p.locator('#seedKey').click();
      await p.locator('#choices .choice').first().click();
      await p.locator('#choices .choice').first().click();
      assert.equal(await p.evaluate(() => S.seed), 0xc0de0001);
      await openBook(p);
      await p.locator('#tab-kit').click();
      assert.equal(await p.locator('#tabPanel .seedcode').count(), reveal ? 1 : 0);
      await p.locator('#closeCasebook').click();
      await p.evaluate(() => ending('death'));
      assert.equal((await p.locator('#sceneText').innerText()).includes('C0DE-0001'), reveal);
      assert.equal(await p.locator('#choices .choice').filter({ hasText: 'Play this season again' }).count(), reveal ? 1 : 0);
      await switchLanguage(p);
      assert.equal((await p.locator('#sceneText').innerText()).includes('C0DE-0001'), reveal);
    });
});

test('keyboard map travel keeps focus in the new choices; tabs use roving focus and named panels', () =>
  withPage(async p => {
    await start(p);
    await p.locator('#choices .choice').first().click();
    await openBook(p);
    await p.locator('#map [data-loc="camp"]').focus();
    await p.keyboard.press('Enter');
    assert.equal(await p.evaluate(() => S.loc), 'camp');
    assert.equal(await p.evaluate(() => document.activeElement === document.querySelector('#choices .choice')), true);
    await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => document.activeElement === document.querySelectorAll('#choices .choice')[1]), true);
    const dice = await p.evaluate(() => [_seed, _words]);
    await openBook(p);
    await p.locator('#tab-people').focus();
    await p.keyboard.press('ArrowLeft');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'tab-kit');
    assert.equal(await p.locator('#tab-kit').getAttribute('aria-selected'), 'true');
    await p.keyboard.press('ArrowRight');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'tab-people');
    await p.keyboard.press('End');
    await p.keyboard.press('Home');
    await p.keyboard.press('ArrowRight');
    assert.deepEqual(await p.locator('.tab').evaluateAll(ts => ts.map(t => t.tabIndex)), [-1, 0, -1, -1]);
    assert.equal(await p.locator('#tabPanel').getAttribute('aria-labelledby'), 'tab-evidence');
    assert.equal(await p.locator('#tab-evidence').getAttribute('aria-controls'), 'tabPanel');
    await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'tabPanel');
    assert.deepEqual(await p.evaluate(() => [_seed, _words]), dice);
  }));

test('a conversation, notebook decisions, language and both dice streams resume and continue identically', () =>
  withPage(async p => {
    await start(p);
    await p.locator('#choices .choice').first().click();
    await openBook(p);
    const person = await p.locator('[data-mark]').first().getAttribute('data-mark');
    await p.locator('[data-mark]').first().click();
    assert.equal(await p.evaluate(id => C(id).mark, person), 'ally', 'person mark changed');
    await p.locator('#tab-omens').click();
    const note = await p.locator('[data-gm]').first().getAttribute('data-gm');
    await p.locator('[data-gm]').first().press('Enter');
    assert.equal(await p.evaluate(key => S.gm[key], note), 1, 'omen note changed');
    assert.equal(await p.evaluate(() => document.activeElement.dataset.gm), note, 'note focus retained');
    assert.deepEqual(await p.evaluate(() => JSON.parse(localStorage.getItem('kutha.expedition')).actions.at(-1)), ['note', note]);
    await travel(p, 'camp');
    await p.locator('#choices .choice').filter({ hasText: 'Speak with' }).first().click();
    await p.locator('#choices .choice').first().click();
    await switchLanguage(p);
    const currentSave = await p.evaluate(() => localStorage.getItem('kutha.expedition'));
    await reloadUnchanged(p);
    assert.equal(await p.evaluate(() => S.phase), 'talk');
    assert.equal(await p.locator('html').getAttribute('lang'), 'ru');
    assert.equal(await p.locator('#tabPanel').getAttribute('aria-labelledby'), 'tab-omens');
    await p.keyboard.press('7');
    const continued = await capture(p);
    // Replay the same saved conversation, then make the same real choice again.
    await p.evaluate(save => localStorage.setItem('kutha.expedition', save), currentSave);
    await p.reload();
    await p.locator('#choices .choice').nth(6).click();
    assert.deepEqual(await capture(p), continued);
  }));

test('the scene leads; the casebook is a keyboard-contained overlay that never takes a scene choice', () =>
  withPage(async p => {
    await start(p);
    assert.equal(await p.locator('#map').isVisible(), false);
    assert.equal(await p.locator('.casebook').isVisible(), false);
    assert.equal(await p.locator('#sceneArt').isVisible(), true);
    const before = await capture(p);
    await p.locator('#casebookBtn').focus();
    await p.keyboard.press('Enter');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'notebookTitle');
    assert.equal(await p.locator('#casebookBtn').getAttribute('aria-expanded'), 'true');
    await p.keyboard.press('Shift+Tab');
    assert.equal(await p.evaluate(() => document.getElementById('notebookDialog').contains(document.activeElement)), true);
    await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'closeCasebook');
    await p.keyboard.press('1');
    assert.deepEqual(await capture(p), before, 'shortcut behind modal');
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('#notebookDialog').isVisible(), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'casebookBtn');
    assert.equal(await p.locator('#casebookBtn').getAttribute('aria-expanded'), 'false');
  }));

test('a casebook drink is recorded even between scenes', async () => {
  // Locate the branch through genuine fixed-seed play; intended rule changes may move its first occurrence.
  const { page, errors } = await openNode(null, { file: FILE });
  let seed;
  try {
    seed = await page.evaluate(() => {
      for (let seed = 0; seed < 64; seed++) {
        __T.start(0, false, seed);
        chooseScene(0);
        mapGo('store');
        const i = S_ui.scene.choices.findIndex(c => X(c.label).includes('Search the area'));
        if (i < 0 || has('brandy')) throw new Error('Unexpected search setup');
        chooseScene(i);
        if (has('brandy')) return seed;
      }
      return null;
    });
    assert.deepEqual(errors, [], 'seed discovery');
    assert.notEqual(seed, null, 'a genuine first search must find brandy within the fixed 64-season sample');
  } finally {
    await page.close();
  }
  await withPage(async p => {
    await start(p, seed.toString(16));
    await p.locator('#choices .choice').first().click();
    await travel(p, 'store');
    await p.locator('#choices .choice').filter({ hasText: 'Search the area' }).click();
    await openBook(p);
    await p.locator('#tab-kit').click();
    assert.equal(await p.locator('#drinkBtn').count(), 1, 'fixed seeded search must find brandy');
    await p.locator('#drinkBtn').press('Enter');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'tabPanel', 'focus after consumed item');
    assert.equal(await p.evaluate(() => has('brandy')), false);
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('kutha.expedition')).actions.at(-1)[0]), 'drink');
    await reloadUnchanged(p);
  });
});

test('an unfinished expedition can be kept or deliberately replaced from the notebook', () =>
  withPage(async p => {
    await start(p);
    const saved = await p.evaluate(() => localStorage.getItem('kutha.expedition'));
    await openBook(p);
    await p.locator('#newExpedition').click();
    assert.equal(await p.locator('#leaveExpedition').isVisible(), true);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'keepExpedition');
    await p.locator('#keepExpedition').click();
    assert.equal(await p.evaluate(() => localStorage.getItem('kutha.expedition')), saved);
    await p.locator('#newExpedition').click();
    await p.locator('#confirmNewExpedition').click();
    assert.equal(await p.locator('#notebookDialog').isVisible(), false);
    assert.equal(await p.evaluate(() => S), null);
    assert.equal(await p.evaluate(() => localStorage.getItem('kutha.expedition')), null);
    await p.reload();
    assert.equal(await p.locator('#pname').isVisible(), true);
  }));

test('damaged, incompatible and divergent saves fail gracefully without trapping the title', () =>
  withPage(async p => {
    await start(p);
    const good = await p.evaluate(() => localStorage.getItem('kutha.expedition'));
    for (const [save, words] of [
      ['{bad json', /could not be resumed/],
      [JSON.stringify({ ...JSON.parse(good), release: '28.5.2' }), /another edition/],
      [JSON.stringify({ ...JSON.parse(good), release: '29.0.0' }), /another edition/],
      [JSON.stringify({ ...JSON.parse(good), actions: [['choice', 99]] }), /could not be resumed/],
      [JSON.stringify({ ...JSON.parse(good), check: [0, 0, 0] }), /could not be resumed/]
    ]) {
      await p.evaluate(value => localStorage.setItem('kutha.expedition', value), save);
      await p.reload();
      assert.equal(await p.evaluate(() => S), null);
      assert.match(await p.locator('#sessionNotice').textContent(), words);
      assert.equal(await p.locator('#choices .choice').count(), 3);
      assert.equal(await p.evaluate(() => localStorage.getItem('kutha.expedition')), null);
    }
  }));

test('storage denial and quota errors preserve playable controls with clear feedback', async () => {
  for (const mode of ['read', 'write'])
    await withPage(async p => {
      await p.addInitScript(m => {
        if (m === 'read')
          Object.defineProperty(window, 'localStorage', {
            get() {
              throw new DOMException('Blocked', 'SecurityError');
            }
          });
        else
          Storage.prototype.setItem = () => {
            throw new DOMException('Full', 'QuotaExceededError');
          };
      }, mode);
      await p.reload();
      await start(p);
      await p.locator('#choices .choice').first().click();
      assert.equal(await p.evaluate(() => S.phase), 'plan');
      assert.match(await p.locator('#sessionNotice').textContent(), /cannot save/);
      await switchLanguage(p);
      assert.match(await p.locator('#sessionNotice').textContent(), /не может сохранить/);
      const before = await p.evaluate(() => [JSON.stringify(S), _seed, _words]);
      await openBook(p);
      await p.locator('#viewpointBtn').click();
      assert.equal(await p.evaluate(() => Viewpoint.mode), 'first');
      assert.deepEqual(await p.evaluate(() => [JSON.stringify(S), _seed, _words]), before);
    });
});

test('the keyboard viewpoint toggle preserves a live expedition, language, focus and exact reload', () =>
  withPage(async p => {
    await start(p);
    await p.locator('#choices .choice').first().click();
    await travel(p, 'camp');
    const original = await capture(p);
    const withoutArt = ({ ui, ...rest }) => ({ ...rest, ui: ui.slice(0, -1) });
    await openBook(p);
    const toggle = p.getByRole('button', { name: 'First-person view', exact: true });
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    await toggle.focus();
    await toggle.press('Space');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'viewpointBtn');
    assert.deepEqual(withoutArt(await capture(p)), withoutArt(original));
    assert.notEqual((await capture(p)).ui.at(-1), original.ui.at(-1));
    await toggle.press('Space');
    assert.deepEqual(await capture(p), original);
    await toggle.press('Space');
    await p.locator('#langBtn').click();
    assert.equal(await p.getByRole('button', { name: 'Вид от первого лица', exact: true }).getAttribute('aria-pressed'), 'true');
    await p.locator('#closeCasebook').click();
    await reloadUnchanged(p);
    assert.equal(await p.evaluate(() => Viewpoint.mode), 'first');
    assert.equal(await p.evaluate(() => localStorage.getItem('kutha.viewpoint')), 'first');
    await p.setViewportSize({ width: 320, height: 844 });
    await openBook(p);
    assert.equal(await p.locator('#notebookDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    await p.locator('#closeCasebook').click();
    const before = withoutArt(await capture(p));
    await p.evaluate(() => localStorage.setItem('kutha.viewpoint', 'invalid'));
    await p.reload();
    assert.equal(await p.evaluate(() => Viewpoint.mode), 'third');
    assert.deepEqual(withoutArt(await capture(p)), before);
  }));

test('a stale tab cannot overwrite a more recent expedition, and closing a tab retains the save', async () => {
  const context = await browser.newContext();
  try {
    await withPage(
      async p => {
        await start(p);
        const other = await p.context().newPage();
        try {
          await other.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
          await other.goto(p.url());
          await other.emulateMedia({ reducedMotion: 'reduce' });
          await p.locator('#choices .choice').first().click();
          const latest = await p.evaluate(() => localStorage.getItem('kutha.expedition'));
          await other.locator('#choices .choice').first().click();
          assert.match(await other.locator('#sessionNotice').textContent(), /another tab/);
          assert.equal(await p.evaluate(() => localStorage.getItem('kutha.expedition')), latest);
          await other.reload();
          assert.equal(await other.evaluate(() => S.phase), 'plan');
          assert.equal(await other.locator('#sessionNotice').isVisible(), false);
          await p.close();
          await other.reload();
          assert.equal(await other.evaluate(() => S.phase), 'plan');
        } finally {
          await other.close();
        }
      },
      {},
      context
    );
  } finally {
    await context.close();
  }
});

test('closing every expedition tab and reopening restores the track set and resumes the requested music', async () => {
  const context = await browser.newContext();
  let saved;
  try {
    await withPage(
      async p => {
        await start(p);
        await p.locator('#choices .choice').first().click();
        await travel(p, 'camp');
        saved = await capture(p);
      },
      {},
      context
    );
    assert.equal(context.pages().length, 0);
    await withPage(
      async p => {
        assert.deepEqual(await capture(p), saved, 'reopened expedition and music');
        await openBook(p);
        await p.waitForFunction(() => AU.cur?.id === AU.want);
        assert.equal(await p.evaluate(() => AU.cur.id), saved.track, 'playback after a gesture');
        assert.deepEqual(await p.evaluate(() => [_seed, _words]), saved.dice, 'audio does not consume either stream');
      },
      {},
      context
    );
  } finally {
    await context.close();
  }
});

test('local fonts fit narrow English and Russian screens, and the no-JavaScript explanation remains usable', async () => {
  await withPage(async p => {
    await start(p);
    for (const width of [320, 390, 820, 1280]) {
      await p.setViewportSize({ width, height: 900 });
      for (const lang of ['en', 'ru']) {
        if ((await p.locator('html').getAttribute('lang')) !== lang) await switchLanguage(p);
        await p.evaluate(() => document.fonts.ready);
        assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${lang} at ${width}`);
        assert.equal(await p.evaluate(() => document.fonts.check('16px Spectral')), true, 'local Spectral font');
        await openBook(p);
        assert.equal(
          await p.locator('#notebookDialog').evaluate(dialog => {
            const rect = dialog.getBoundingClientRect();
            return dialog.scrollWidth <= dialog.clientWidth && rect.left >= 0 && rect.right <= innerWidth;
          }),
          true,
          `${lang} notebook at ${width}`
        );
        await p.locator('#closeCasebook').click();
      }
    }
  });
  await withPage(
    async p => {
      await start(p);
      await p.locator('#choices .choice').first().click();
      await p.setViewportSize({ width: 320, height: 844 });
      for (const lang of ['en', 'ru']) {
        if ((await p.locator('html').getAttribute('lang')) !== lang) await switchLanguage(p);
        await p.reload();
        await openBook(p);
        assert.equal(
          await p.locator('#notebookDialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth),
          true,
          `${lang} notebook with unavailable web fonts`
        );
        await p.locator('#closeCasebook').click();
      }
    },
    { fonts: 'block' }
  );
  const p = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
  try {
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(pathToFileURL(FILE).href);
    assert.equal(await p.locator('.app').isVisible(), false);
    assert.match(await p.locator('.noscript').innerText(), /JavaScript is turned off/);
    assert.match(await p.locator('.noscript').innerText(), /выключен/);
  } finally {
    await p.close();
  }
});
