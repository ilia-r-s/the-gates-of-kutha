// Seasons from their seeds (core/random.js). Every season is dealt and played from one seed, so a seed and a way of
// playing it are a whole scenario: the same seed deals the same season, and the same choices play it the same way.
//   node test/replay.js 1A2B-3C4D [--pol=human] [--bg=1] [--lang=ru] [--steps=1500]
//        one season from its code (as the casebook and the ending page write it), played by a policy whose own choices
//        are seeded by the same code: what a player reads, scene by scene, and how it ended
//   node test/replay.js --fuzz=300 [--from=1A2B-3C4D] [--pol=random]
//        that many seasons, their seeds dealt from one code (or the clock): every scene and casebook page scanned in both
//        languages, page errors caught; the seeds that went wrong are printed, to replay one by one
// Policies (test/lib/inpage.js): human (a person's habits; a lean: --pol=human:sleuth), random, cheat.
const { run, open, args } = require('./lib/harness');
const A = args({ pol: 'human', bg: 1, lang: 'en', steps: 1500, fuzz: 0, from: '' });

run(async browser => {
  const { page, errors } = await open(browser, { lang: A.lang === 'ru' ? 'ru' : null });
  const res = await page.evaluate(
    ([A, code]) => {
      window.sfx = () => {};
      window.musicChange = () => {};
      const [pol, lean] = String(A.pol).split(':');
      const policy = rnd =>
        pol === 'random'
          ? __T.policies.random(rnd)
          : pol === 'cheat'
            ? __T.policies.cheat(rnd)
            : __T.policies.human(rnd, __T.LEANS[lean] || null);
      const plain = h =>
        X(h)
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      // ---------- one season, as it reads ----------
      if (!A.fuzz) {
        const seed = parseSeed(code);
        if (seed == null) return { error: `not a season code: ${code}` };
        __T.start(+A.bg, false, seed);
        const P = policy(__T.lcg(seed)),
          lines = [];
        let step = 0;
        for (; step < A.steps && !S.ended; step++) {
          const bs = __T.buttons();
          if (!bs.length) break;
          const sc = S_ui.scene;
          lines.push(`--- ${plain(sc.kicker || '')} · ${plain(sc.title || '')}`, plain((sc.body || []).join(' ')));
          const b = P(bs) || bs[0];
          lines.push(`> ${b.textContent.trim()}`);
          b.click();
        }
        if (S.ended) lines.push(`--- ${plain(S_ui.scene.title || '')}`, plain((S_ui.scene.body || []).join(' ')).slice(0, 4000));
        return { season: seedCode(seed), steps: step, ended: S.ended ? S.endId : 'not ended', text: lines.join('\n') };
      }
      // ---------- many seasons, checked ----------
      let x = parseSeed(A.from);
      if (x == null) x = Date.now() >>> 0;
      const from = seedCode(x),
        next = () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0),
        failing = [],
        ends = {};
      let current = null,
        thrown = [];
      window.addEventListener('error', e => thrown.push(`${e.message}`));
      // every scene scanned as it is shown, into the season's own record (installed once, pointed at each season in turn)
      const sink = { bad: [], seen: new Set() };
      __T.watchScenes({ push: (...a) => sink.bad.push(...a) }, { has: k => sink.seen.has(k), add: k => sink.seen.add(k) });
      for (let g = 0; g < A.fuzz; g++) {
        const seed = next(),
          bad = (sink.bad = []),
          seen = (sink.seen = new Set());
        current = seedCode(seed);
        thrown = [];
        try {
          __T.start(g % 3, g % 7 === 0, seed);
          const ok = __T.play(policy(__T.lcg(seed)), {
            maxSteps: A.steps,
            each: s => {
              if (s % 9 === 0) __T.scanBook(bad, seen);
            }
          });
          if (!ok) bad.push('the season did not end');
          else ends[S.endId] = (ends[S.endId] || 0) + 1;
        } catch (e) {
          bad.push(`threw: ${e.message}`);
        }
        bad.push(...thrown.map(t => 'page error: ' + t));
        if (bad.length) failing.push({ season: current, bg: g % 3, hardcore: g % 7 === 0, problems: [...new Set(bad)].slice(0, 6) });
      }
      return { from, seasons: A.fuzz, policy: A.pol, endings: ends, failing: failing.length, seeds: failing.slice(0, 40) };
    },
    [A, String(A._[0] || '')]
  );
  if (res.text) return `season ${res.season} · ${res.steps} steps · ${res.ended}\n${res.text}`;
  if (errors.length) res.errors = errors.slice(0, 5);
  return res;
});
