// README pictures from genuine seeded play. Routes contain only choices a player can make; no roles or dice are forced.
// node test/pictures.js [--only=talk,tablet]   Inspect the resulting PNGs before updating the README.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { run, open, args, ROOT } = require('./lib/harness');
const scenes = require('./fixtures/pictures.json');
const only = args().only?.split(',');
const OUT = path.join(ROOT, 'docs', 'images');

async function picture(browser, name, scene) {
  const { page, errors } = await open(browser, {
    seed: scene.pageSeed,
    mathSeed: scene.pageSeed,
    width: 1280,
    height: 1600,
    deviceScaleFactor: 2,
    fonts: 'local'
  });
  try {
    const actual = await page.evaluate(scene => {
      sfx = musicChange = () => {};
      if (scene.clicks) {
        __T.start(scene.background, scene.hardcore, scene.seed);
        for (const i of scene.clicks) {
          const choice = __T.buttons()[i];
          if (!choice) throw new Error(`Missing choice ${i}`);
          choice.click();
        }
      }
      return {
        phase: S?.phase,
        title: X(S_ui.scene.title),
        mood: S ? moodNow() : null,
        text: document.querySelector('#sceneText').innerText
      };
    }, scene);
    if (scene.phase) assert.equal(actual.phase, scene.phase, `${name}: phase`);
    if (scene.title) assert.equal(actual.title, scene.title, `${name}: title`);
    if (scene.mood) assert.equal(actual.mood, scene.mood, `${name}: expression`);
    if (scene.contains) assert.ok(actual.text.includes(scene.contains), `${name}: dialogue`);
    const dice = await page.evaluate(() => [_seed, _words]);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const animation of document.getAnimations()) {
        if (Number.isFinite(animation.effect.getComputedTiming().endTime)) animation.finish();
        else animation.cancel();
      }
      window.scrollTo(0, 0);
    });
    const clip = await page.evaluate(frame => {
      if (frame === 'evidence') {
        document.querySelector('.tab[data-tab="evidence"]').click();
        const panel = document.querySelector('#tabPanel'),
          cards = [...panel.querySelectorAll(':scope > .clue')].slice(0, 2);
        if (cards.length < 2) throw new Error('Two complete evidence cards required');
        // Omit later notebook sections; keep the two cards, their heading, tabs and complete enclosing border.
        const keep = new Set([panel.firstElementChild, ...cards]);
        for (const node of panel.children) if (!keep.has(node)) node.hidden = true;
        panel.style.maxHeight = 'none';
        panel.style.overflow = 'visible';
      } else if (frame === 'dawn') {
        const nodes = [...document.querySelector('#sceneText').children];
        const start = nodes.findIndex(n => n.matches('.part') && /At first light/i.test(n.textContent));
        if (start < 0) throw new Error('First-light chapter missing');
        let end = nodes.findIndex((n, i) => i > start && n.matches('.part'));
        if (end < 0) end = nodes.length;
        nodes.forEach((n, i) => {
          if (i < start || i >= end) n.hidden = true;
        });
      }
      const top = document.querySelector(frame === 'evidence' ? '.casebook' : '#sceneArt').getBoundingClientRect();
      const bottom = document
        .querySelector({ art: '#sceneArt', story: '#sceneText', dawn: '#sceneText', stage: '#stage', evidence: '.casebook' }[frame])
        .getBoundingClientRect();
      const pad = 16;
      return {
        x: Math.floor(top.left - pad),
        y: Math.floor(top.top + scrollY - pad),
        width: Math.ceil(top.width + pad * 2),
        height: Math.ceil(bottom.bottom - top.top + pad * 2)
      };
    }, scene.frame);
    const file = path.join(OUT, `${name}.png`);
    await page.screenshot({ path: file, clip, animations: 'disabled' });
    assert.deepEqual(await page.evaluate(() => [_seed, _words]), dice, `${name}: framing consumed dice`);
    return { file: path.relative(ROOT, file), errors };
  } finally {
    await page.close();
  }
}

run(async browser => {
  for (const name of only || []) assert.ok(scenes[name], `Unknown picture ${name}`);
  fs.mkdirSync(OUT, { recursive: true });
  const pictures = [],
    errors = [];
  for (const [name, scene] of Object.entries(scenes)) {
    if (only && !only.includes(name)) continue;
    const result = await picture(browser, name, scene);
    pictures.push(result.file);
    errors.push(...result.errors);
  }
  return { pictures, errors };
});
