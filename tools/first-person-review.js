#!/usr/bin/env node
// Compare both production viewpoint modes without changing the shipped game or launching a browser.
// node tools/first-person-review.js --out=.local/review/29/first-person
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openNode, args, FILE, ROOT } = require('../test/lib/harness');
const options = args(),
  out = path.resolve(ROOT, options.out || '.local/review/29/first-person');

async function main() {
  const { page, errors } = await openNode(null, { file: options.file, helpers: false });
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4242);
      const dice = [_seed, _words],
        scenes = [
          {
            id: 'conversation',
            label: 'Conversation · face the speaker',
            art: { bg: 'camp', time: 'evening', talk: 'ilse', mood: 'thoughtful' }
          },
          {
            id: 'camp',
            label: 'Company in camp · stand among them',
            art: { bg: 'camp', time: 'morning', cast: ['ashby', 'ilse', 'hamid', 'constance'], you: true }
          },
          ...['truck', 'sealed', 'banished', 'shot', 'scarred', 'canal'].map(end => ({
            id: end,
            label: end,
            art: { bg: 'end', end, time: END_TIME[end], aspect: 'dust' }
          })),
          ...['fire', 'dust', 'sea', 'teeth', 'plague', 'madness'].map(aspect => ({
            id: 'fallen-' + aspect,
            label: 'Last sight through the torn tent · ' + aspect,
            art: { bg: 'end', end: 'fallen-night', time: 'night', aspect }
          })),
          {
            id: 'fallen-bed',
            label: 'Last sight from the cot',
            art: { bg: 'end', end: 'fallen-night', time: 'dawn', aspect: 'dust', inBed: true }
          }
        ];
      const previous = Viewpoint.mode;
      Viewpoint.set('third', false);
      const thirdPerson = scenes.map(s => sceneSVG(s.art, 'before-' + s.id + '-'));
      Viewpoint.set('first', false);
      try {
        const firstPerson = scenes.map(s => sceneSVG(s.art, 'after-' + s.id + '-'));
        // Reject the old full-body, reflected-face and raised-arm silhouettes
        // in these first-person compositions; contextual held props remain allowed.
        for (const svg of firstPerson)
          if (/M10 262C14 202|M134 200Q158 124|M-12 0L-10 -28Q0 -34/.test(svg)) throw Error('Protagonist geometry remains');
        for (const scene of scenes) {
          S.bg = 'philologist';
          const a = sceneSVG(scene.art, 'profile-');
          for (const bg of ['soldier', 'occultist']) {
            S.bg = bg;
            if (a !== sceneSVG(scene.art, 'profile-')) throw Error('First-person view still depends on protagonist costume: ' + scene.id);
          }
        }
        if (_seed !== dice[0] || _words !== dice[1]) throw Error('Viewpoint rendering consumed seeded dice');
        return {
          scenes: scenes.map((s, i) => ({ ...s, thirdPerson: thirdPerson[i], firstPerson: firstPerson[i] })),
          diceUnchanged: true,
          unchangedEndings: Object.keys(END_ART).filter(
            k => !['truck', 'sealed', 'banished', 'shot', 'scarred', 'canal', 'fallen-night'].includes(k)
          )
        };
      } finally {
        Viewpoint.set(previous, false);
      }
    });
    if (errors.length) throw Error(errors.join('\n'));
    fs.mkdirSync(out, { recursive: true });
    const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    for (const s of result.scenes) {
      fs.writeFileSync(path.join(out, s.id + '-before.svg'), s.thirdPerson);
      fs.writeFileSync(path.join(out, s.id + '-after.svg'), s.firstPerson);
    }
    fs.writeFileSync(
      path.join(out, 'index.html'),
      '<!doctype html><meta charset="utf-8"><title>Viewpoint SVG comparison</title><style>' +
        'body{margin:24px;background:#101520;color:#e7d9bc;font:16px Georgia;line-height:1.5}h1{color:#c9a44c;font-weight:normal}h2{font-weight:normal;font-size:20px;margin:28px 0 8px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}svg{display:block;width:100%;border:1px solid #3d4961}small{display:block;margin:6px 0 16px;color:#aaa18d}</style>' +
        '<h1>Third-person and first-person views</h1><p>The same production renderer and expedition state in both modes. Third person remains the default; the casebook changes the view at any time.</p>' +
        result.scenes
          .map(
            s =>
              '<h2>' +
              escape(s.label) +
              '</h2><div class="pair"><div>' +
              s.thirdPerson +
              '<small>Third person</small></div><div>' +
              s.firstPerson +
              '<small>First person</small></div></div>'
          )
          .join('')
    );
    const manifest = {
      status: 'both production viewpoints; third person is the default',
      artifactSha256: crypto
        .createHash('sha256')
        .update(fs.readFileSync(options.file || FILE))
        .digest('hex'),
      diceUnchanged: result.diceUnchanged,
      protagonistCostumeIndependent: true,
      firstPerson: result.scenes.map(({ id, label, art }) => ({ id, label, art })),
      unchangedEndings: result.unchangedEndings
    };
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(JSON.stringify({ out, studies: result.scenes.length, diceUnchanged: result.diceUnchanged }));
  } finally {
    await page.close();
  }
}
main().catch(error => {
  console.error(error.stack);
  process.exitCode = 1;
});
