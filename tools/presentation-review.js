#!/usr/bin/env node
// Local review artifacts only: genuine play captures, SVG studies and offline music comparisons.
// node tools/presentation-review.js [--only=layout,art,music] [--out=.local/review]
// node tools/presentation-review.js --only=music --all-tracks --music-seconds=90 --out=.local/music/29.0.0
const fs = require('node:fs');
const path = require('node:path');
const { run, open, args, ROOT } = require('../test/lib/harness');
const options = args(),
  out = path.resolve(ROOT, options.out || '.local/review'),
  selected = String(options.only || 'layout,art,music').split(',');
const file = name => path.join(out, name);
const write = (name, data) => fs.writeFileSync(file(name), data);
const reviewStyle =
  'body{margin:0;padding:24px;background:#101520;color:#e7d9bc;font:16px Georgia;line-height:1.5}h1{font-size:25px;font-weight:normal;color:#d3b15e;margin:0 0 8px}p,small{color:#aaa18d}p{margin:0 0 22px}section{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}h2{font-size:18px;font-weight:normal;margin:0 0 8px}svg{display:block;width:100%;border:1px solid #3d4961;border-radius:3px}small{display:block;margin-top:6px}audio{width:100%}';
const html = (title, body) => `<!doctype html><meta charset="utf-8"><title>${title}</title><style>${reviewStyle}</style>${body}`;

async function layout(browser) {
  const { page, errors } = await open(browser, { fonts: 'local', helpers: false });
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#seedKey').click();
    await page.locator('#pseed').fill('0000-1092');
    for (let i = 0; i < 3; i++) await page.locator('#choices .choice').first().click();
    await page.locator('#casebookBtn').click();
    await page.locator('#map [data-loc=camp]').press('Enter');
    await page.locator('#choices .choice').filter({ hasText: 'Speak with' }).first().click();
    const scene = await page.evaluate(() => ({ seed: S.seed, title: X(S_ui.scene.title), dice: [_seed, _words] }));
    for (const lang of ['en', 'ru']) {
      if (lang === 'ru') {
        await page.locator('#casebookBtn').click();
        await page.locator('#langBtn').click();
        await page.locator('#closeCasebook').click();
      }
      for (const [size, width, height] of [
        ['desktop', 1280, 900],
        ['mobile', 390, 844]
      ]) {
        await page.setViewportSize({ width, height });
        await page.evaluate(async () => {
          await document.fonts.load('16px Spectral', 'The Gates of Kutha Врата Куты');
          await document.fonts.ready;
          window.scrollTo(0, 0);
        });
        await page.screenshot({ path: file(`29-scene-${lang}-${size}.png`), fullPage: true });
        await page.locator('#casebookBtn').click();
        await page.screenshot({ path: file(`29-notebook-${lang}-${size}.png`) });
        await page.locator('#closeCasebook').click();
      }
    }
    const dice = await page.evaluate(() => [_seed, _words]);
    if (JSON.stringify(dice) !== JSON.stringify(scene.dice)) throw new Error('Layout capture consumed dice');
    return { scene, errors };
  } finally {
    await page.close();
  }
}

async function art(browser) {
  const { page, errors } = await open(browser, { helpers: false, seed: 4242, width: 1120, height: 850 });
  try {
    const result = await page.evaluate(() => {
      newGame('Marlowe', 'philologist', false, 4242);
      const before = [_seed, _words],
        scene = { bg: 'camp', time: 'night', talk: 'constance', mood: 'thoughtful', you: true },
        night = sceneSVG(scene, 'night-current-'),
        originalPortrait = portrait;
      portrait = (...a) => '<g filter="url(#night-cast)">' + originalPortrait(...a) + '</g>';
      const cool = sceneSVG(scene, 'night-cool-').replace(
        '<defs>',
        '<defs><filter id="night-cast" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".88 0 0 0 -.01 0 .91 0 0 -.01 0 0 1 0 .025 0 0 0 1 0"/></filter>'
      );
      portrait = originalPortrait;
      const gate = sceneSVG({ bg: 'gate', time: 'deep', you: true }, 'gate-current-'),
        originalGate = BG.gate.draw;
      BG.gate.draw = (...a) =>
        originalGate(...a) +
        pth('M0 340V304L54 294 101 305 147 289 184 303 219 301 242 340Z', '#493126', 4) +
        pth('M800 340V302L758 290 710 301 660 284 612 302 573 298 552 340Z', '#493126', 4) +
        ln('M54 296L65 321 42 340M145 291L132 316 151 340M709 302L696 321 719 340M611 303L627 322 604 340', '#30231e', 3);
      const depth = sceneSVG({ bg: 'gate', time: 'deep', you: true }, 'gate-depth-');
      BG.gate.draw = originalGate;
      return { night, cool, gate, depth, diceUnchanged: JSON.stringify(before) === JSON.stringify([_seed, _words]) };
    });
    if (!result.diceUnchanged) throw new Error('Art study consumed dice');
    const pageHtml = html(
      'Kutha art studies',
      '<h1>Two small art studies · review only</h1><p>Established drawings, colours and linework. Neither experiment is applied to the game.</p>' +
        '<section><div><h2>Current night portrait</h2>' +
        result.night +
        '<small>The background receives night shading; the portrait retains daylight colour.</small></div><div><h2>A · A little night colour on the portrait</h2>' +
        result.cool +
        '<small>A restrained cool tint connects figure and setting without hiding the face.</small></div></section>' +
        '<section><div><h2>Current threshold</h2>' +
        result.gate +
        '<small>The nested arches have clear geometry but little foreground depth.</small></div><div><h2>B · Broken stone at the threshold</h2>' +
        result.depth +
        '<small>Low foreground stones add scale and depth without new symbols or clues.</small></div></section>'
    );
    write('art-studies.html', pageHtml);
    await page.setContent(pageHtml);
    await page.screenshot({ path: file('art-studies.png'), fullPage: true });
    return { diceUnchanged: result.diceUnchanged, errors };
  } finally {
    await page.close();
  }
}

async function music(browser) {
  const { page, errors } = await open(browser, { helpers: false, seed: 4242, mathSeed: 2601 });
  const results = [],
    seconds = Number(options['music-seconds'] || 24),
    all = !!options['all-tracks'];
  if (!Number.isFinite(seconds) || seconds < 5 || seconds > 300) throw new Error('Music duration must be 5–300 seconds');
  try {
    const tracks = await page.evaluate(() => Object.keys(TRACKS).map(id => ({ id, label: TRACK_NAMES[id] })));
    const variants = all
      ? [
          { key: 'bayati-old', id: 'bayati', label: 'Bayati at Dusk · original arrangement, selected' },
          { key: 'bayati-new', id: 'bayati', kind: 'spacious', label: 'Bayati at Dusk · spacious experiment, not selected' },
          ...tracks.filter(t => t.id !== 'bayati').map(t => ({ ...t, key: t.id })),
          { key: 'deep-experiment', id: 'deep', kind: 'experiment', label: 'Below Kutha · uneven pulse proposal, not shipped' }
        ]
      : [
          { key: 'music-camp-reference', id: 'bayati', label: 'Selected: Original Bayati at Dusk' },
          { key: 'music-camp-spacious', id: 'bayati', kind: 'spacious', label: 'Not selected: More space between phrases' },
          { key: 'music-deep-reference', id: 'deep', label: 'Current: Below Kutha' },
          { key: 'music-deep-uneven', id: 'deep', kind: 'experiment', label: 'Proposal: An uneven distant pulse' }
        ];
    for (const variant of variants) {
      await page.reload();
      await page.addScriptTag({ path: path.join(ROOT, 'test/lib/random.js') });
      const rendered = await page.evaluate(
        async ({ variant, seconds }) => {
          const dice = [_seed, _words],
            rate = 44100;
          Math.random = __testRandom.random(2601);
          window.AudioContext = function () {
            return new OfflineAudioContext(2, seconds * rate, rate);
          };
          if (!auInit()) throw new Error('Offline audio initialization failed');
          const ctx = AU.ctx,
            original = TRACKS[variant.id],
            track = variant.kind === 'spacious' ? { ...original, dur: 0.52, phrase: { steps: 16, gap: 2 } } : original;
          SCL = MAQ[track.scale];
          ROOT = track.root;
          const cur = { song: track.song() };
          track.init();
          AU.mbus.gain.setTargetAtTime(0.34, 0, 0.9);
          AU.master.gain.setValueAtTime(0.9, seconds - 2);
          AU.master.gain.linearRampToValueAtTime(0, seconds);
          for (
            let k = 0, t = 0.25;
            t < seconds - 3;
            k++, t += track.dur + (track.phrase && k % track.phrase.steps === 0 ? track.phrase.gap : 0)
          ) {
            if (variant.kind === 'experiment') {
              const i = k % 24;
              if ([0, 7, 12, 20].includes(i)) {
                dum(t, 0.075, AU.mbus, 80);
                dum(t + 0.38, 0.035, AU.mbus, 80);
              }
              if (i === 12) ney(fq(cur.song[0][Math.floor(k / 24) % 4], -1), t, 4, 0.035, AU.mbus);
              if (k % 48 === 30) bell(fq(0, -1), t, 0.03, AU.mbus);
            } else track.tick(k, t, cur, AU.mbus);
          }
          const buffer = await ctx.startRendering(),
            left = buffer.getChannelData(0),
            right = buffer.getChannelData(1),
            raw = new Uint8Array(44 + left.length * 4),
            view = new DataView(raw.buffer);
          const str = (offset, value) => {
            for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
          };
          str(0, 'RIFF');
          view.setUint32(4, raw.length - 8, true);
          str(8, 'WAVE');
          str(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 2, true);
          view.setUint32(24, rate, true);
          view.setUint32(28, rate * 4, true);
          view.setUint16(32, 4, true);
          view.setUint16(34, 16, true);
          str(36, 'data');
          view.setUint32(40, left.length * 4, true);
          let peak = 0,
            sum = 0;
          for (let i = 0; i < left.length; i++)
            for (let ch = 0; ch < 2; ch++) {
              const x = (ch ? right[i] : left[i]) * 2;
              if (!Number.isFinite(x)) throw new Error('Non-finite audio sample');
              peak = Math.max(peak, Math.abs(x));
              sum += x * x;
              view.setInt16(44 + i * 4 + ch * 2, Math.max(-32768, Math.min(32767, Math.round(x * 32767))), true);
            }
          if (peak >= 0.98) throw new Error('Preview gain would clip');
          let binary = '';
          for (let i = 0; i < raw.length; i += 32768) binary += String.fromCharCode(...raw.subarray(i, i + 32768));
          return {
            data: btoa(binary),
            seconds,
            rate,
            channels: 2,
            bits: 16,
            presentationSeed: 2601,
            gain: 2,
            track: { id: variant.id, scale: track.scale, root: track.root, step: track.dur, phrase: track.phrase || null },
            arrangement:
              variant.kind === 'spacious' ? 'proposal-not-selected' : variant.kind === 'experiment' ? 'proposal-not-shipped' : 'production',
            peak,
            rms: Math.sqrt(sum / (left.length * 2)),
            diceUnchanged: JSON.stringify([_seed, _words]) === JSON.stringify(dice)
          };
        },
        { variant, seconds }
      );
      const { data, ...meta } = rendered;
      if (!meta.diceUnchanged) throw new Error('Music study consumed dice');
      const name = variant.key + '.wav';
      write(name, Buffer.from(data, 'base64'));
      results.push({ file: name, label: variant.label, ...meta });
    }
    write(
      all ? 'index.html' : 'music-previews.html',
      html(
        'Kutha music · 29.0.0',
        '<h1>Kutha music · 29.0.0</h1><p>Local recordings of the actual instruments and scales. The original Bayati arrangement is selected for the game; its spacious experiment is retained for comparison. The uneven underground pulse remains a proposal. Every recording uses the same presentation seed and gain.</p>' +
          results
            .map(
              r =>
                `<h2>${r.label}</h2><p>${r.seconds} seconds · stereo · 44.1 kHz</p><audio controls preload="none" src="${r.file}"></audio>`
            )
            .join('')
      )
    );
    write(all ? 'manifest.json' : 'music-previews.json', JSON.stringify({ results, errors }, null, 2) + '\n');
    return { results, errors };
  } finally {
    await page.close();
  }
}

run(async browser => {
  const tasks = { layout, art, music },
    results = {};
  for (const name of selected) if (!tasks[name]) throw new Error(`Unknown presentation review: ${name}`);
  fs.mkdirSync(out, { recursive: true });
  for (const name of selected) results[name] = await tasks[name](browser);
  write('presentation-review.json', JSON.stringify({ browser: browser.version(), results }, null, 2) + '\n');
  return results;
});
