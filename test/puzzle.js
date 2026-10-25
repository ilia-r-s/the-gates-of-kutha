// A logician who sees only the casebook: how often can the power and its ward be pinned down by the finale?
// It examines scenes, accuses on strong evidence, asks scholars about titles and charms, studies with a purpose
// (a sign it has seen, a title it cannot place, a charm that might be the ward) and searches when idle.
// usage: node test/puzzle.js [games] [half,rel,title,lines ...]   (with no configurations, the tablets as the game deals
// them: PUZ in src/rules.js)
const path = require('path');
const { run, open } = require('./lib/harness');
const N = +(process.argv[2] || 200);
const CFGS = process.argv.slice(3).length ? process.argv.slice(3).map(s => s.split(',').map(Number)) : [null];
const MODE = process.env.MODE || 'mixed'; // cult: hunt the cult first; puzzle: work the tablets first; mixed: a scene in the morning, the tablets by day
run(async browser => {
  const { page: p, errors: errs } = await open(browser, { file: 'artifact', helpers: false });
  await p.addScriptTag({ path: path.resolve(__dirname, 'solver.js') });
  const res = await p.evaluate(
    ({ N, CFGS, MODE }) => {
      window.show = () => {};
      window.sfx = () => {};
      const runGame = () => {
        newGame('Sim', pick(['philologist', 'soldier', 'occultist']));
        const matches = c => S.clues.filter(cl => cl.status !== 'thief' && cl.status !== 'planted' && c.known[cl.cat] === cl.val);
        const score = c => {
          let s = 0;
          matches(c).forEach(cl => {
            s += cl.status === 'genuine' ? 2 : 1;
          });
          S.testimony
            .filter(t => t.about === c.id)
            .forEach(t => {
              if (t.kind === 'slip') s += 3;
              if (t.kind === 'react' && t.verdict === 'fear') s += 1;
              if (t.kind === 'vision') s += t.verdict === 'cult' ? 1 : -1;
              if (t.kind === 'chill') s += 1;
              if (t.kind === 'failwatch') s += 1;
            });
          if (S.revealed[c.id]) s -= 99;
          return s;
        };
        const pinned = r => r.P.length === 1 && Object.keys(r.wardP).length === 1 && has(Object.keys(r.wardP)[0]);
        let end = null;
        const use = { talk: 0, exam: 0, acc: 0, study: 0, gloss: 0, read: 0, search: 0 };
        for (let d = 1; d <= 5 && !end; d++) {
          S.day = d;
          for (S.slot = 0; S.slot < S.slotsToday; S.slot++) {
            placeChars();
            S.inquiryDone = S.slot !== 2;
            const free = freeChars(),
              r = solve();
            const cand = free.map(c => [c, score(c)]).sort((a, b2) => b2[1] - a[1])[0];
            if (S.crime && !S.crime.examined && (MODE === 'cult' || (MODE === 'mixed' && S.slot === 0))) {
              use.exam++;
              S.loc = S.crime.loc;
              doExamine();
              continue;
            }
            if (S.slot === 2 && cand && cand[1] >= 3) {
              use.acc++;
              S.loc = 'camp';
              accuse(cand[0].id);
              if (S.ended) {
                end = S.ended;
                break;
              }
              continue;
            }
            const who = free.find(c => !S.claims.some(x => x.night === d - 1 && x.id === c.id));
            if (who && S.slot === 1 && MODE === 'cult') {
              use.talk++;
              S.loc = who.loc;
              DIALOG.night.run(who);
              if (unknownCats(who).length) DIALOG.about.run(who);
              else if (canShow()) DIALOG.show.run(who);
              continue;
            }
            if (pinned(r)) {
              use.search++;
              const un = LOC_IDS.filter(l => LOCS[l].search && !S.searched[l]);
              const l = un.length ? pick(un) : pick(['trench', 'store']);
              S.loc = l;
              doSearch(l);
              continue;
            }
            // a title that would settle something, and someone who can explain it
            const vague = Object.keys(r.titles).filter(e => r.titles[e].length > 1);
            const gl =
              vague.length &&
              free.find(c => GLOSSERS.includes(c.id) && S.revealed[c.id] !== 'cult' && titlesToAsk(c).some(e => vague.includes(e)));
            if (gl) {
              use.gloss++;
              S.loc = gl.loc;
              DIALOG.title.run(
                gl,
                titlesToAsk(gl).find(e => vague.includes(e))
              );
              continue;
            }
            if (S.fragments > 0) {
              use.study++;
              S.loc = 'camp';
              const t = studyTopics();
              const sg = t.filter(x => x.sign != null),
                tl = t.filter(x => x.title && vague.includes(x.title)),
                ch = t.filter(x => x.ward && (r.wardP[x.ward] || 0) > 0 && (r.wardP[x.ward] || 0) < 1);
              doStudy(r.P.length > 1 && sg.length ? pick(sg) : tl.length ? pick(tl) : ch.length ? pick(ch) : sg.length ? pick(sg) : null);
              continue;
            }
            const sch = free.find(c => SCHOLARS.includes(c.id) && S.items.some(w => CHARMS.includes(w) && !S.readings[c.id + ':' + w]));
            if (sch) {
              use.read++;
              const w = S.items.find(x => CHARMS.includes(x) && !S.readings[sch.id + ':' + x]);
              S.loc = sch.loc;
              DIALOG.show.run(sch, w);
              continue;
            }
            const un = LOC_IDS.filter(l => LOCS[l].search && !S.searched[l]);
            use.search++;
            const l = un.length && rand() < 0.5 ? pick(un) : pick(['trench', 'store']);
            S.loc = l;
            doSearch(l);
          }
          if (end) break;
          if (S.wounds >= S.woundsMax) {
            end = 'death';
            break;
          }
          if (S.nerve <= 0) {
            end = 'madness';
            break;
          }
          if (d < 5) {
            resolveNight();
            if (S.wounds >= S.woundsMax) end = 'death';
            else if (S.nerve <= 0) end = 'madness';
            else if (S.doom >= S.doomMax) break;
          }
        }
        const r = solve();
        // (down to two, and the ward pinned, only when what is left holds the truth: a casebook misled by a lie, a
        // stray sign or a scribe's error may pin the wrong one, or leave nothing at all)
        const stat = {
          use,
          god1: r.P.length === 1 && r.P[0] === S.patron,
          god2: r.P.length <= 2 && r.P.includes(S.patron),
          ward1: Object.keys(r.wardP).length === 1 && Object.keys(r.wardP)[0] === S.wardOf[S.patron],
          had: has(S.wardOf[S.patron]),
          seen: r.seen,
          facts: r.facts,
          glosses: S.glosses.length
        };
        if (end) return { end, ...stat };
        if (!freeCult().length) return { end: 'exposed', ...stat };
        // the descent: name the likeliest power, raise the likeliest carried charm, and a second if the first fails
        const named = pick(r.P.length ? r.P : S.gods);
        S.fin = { named, comp: [], left: [], tries: 0, betrayed: [], acts: [] };
        const o = sanctumOdds();
        const pg = r.P.includes(named) ? 1 / r.P.length : 0,
          shownW = clamp(o.ward(null) + 0.15),
          shownR = o.rite();
        const acts = S.items
          .filter(x => CHARMS.includes(x))
          .map(it => ({ it, ev: (r.wardP[it] || 0) * shownW }))
          .concat([{ it: null, ev: pg * shownR }])
          .sort((a, c) => c.ev - a.ev);
        const tryAct = it => (it ? (S.godOfWard[it] === S.patron ? o.ward(it) : 0.03) : named === S.patron ? o.rite() : 0.04);
        const p1 = tryAct(acts[0].it);
        const q = it => (it ? r.wardP[it] || 0 : pg),
          sp = it => (it ? shownW : shownR);
        const q1 = q(acts[0].it),
          post = (q1 * (1 - sp(acts[0].it))) / (q1 * (1 - sp(acts[0].it)) + (1 - q1));
        const alt = acts[1] ? (q(acts[1].it) / (1 - q1 + q1 * (1 - sp(acts[0].it)))) * sp(acts[1].it) : 0;
        const p2 = (post * sp(acts[0].it) >= alt ? tryAct(acts[0].it) : acts[1] ? tryAct(acts[1].it) : 0) * 0.8;
        return { end: Math.random() < 1 - (1 - p1) * (1 - p2) ? 'won below' : 'lost below', ...stat };
      };
      const out = {};
      for (const cfg of CFGS) {
        if (cfg) {
          const [half, rel, title, lines] = cfg;
          PUZ.half = half;
          PUZ.rel = rel;
          PUZ.title = title;
          if (lines) PUZ.lines = lines;
        }
        const { half, rel, title, lines } = PUZ;
        const U = {};
        const t = { n: 0, win: 0, exposed: 0, god1: 0, god2: 0, ward1: 0, had: 0, seen: 0, facts: 0, glosses: 0, ends: {} };
        for (let i = 0; i < N; i++) {
          const g = runGame();
          t.n++;
          t.ends[g.end] = (t.ends[g.end] || 0) + 1;
          if (g.end === 'exposed' || g.end === 'won below') t.win++;
          if (g.end === 'exposed') t.exposed++;
          ['god1', 'god2', 'ward1', 'had'].forEach(k => {
            if (g[k]) t[k]++;
          });
          t.seen += g.seen;
          t.facts += g.facts;
          t.glosses += g.glosses;
          Object.keys(g.use).forEach(k => {
            U[k] = (U[k] || 0) + g.use[k] / N;
          });
        }
        const pc = k => ((100 * t[k]) / t.n).toFixed(0) + '%';
        out[`${MODE}: half ${half}, rel ${rel}, title ${title}, lines ${lines}`] = {
          win: pc('win'),
          exposedBoth: pc('exposed'),
          godPinned: pc('god1'),
          godDownToTwo: pc('god2'),
          wardPinned: pc('ward1'),
          hadWard: pc('had'),
          avgSigns: (t.seen / t.n).toFixed(1),
          avgLines: (t.facts / t.n).toFixed(1),
          avgGlosses: (t.glosses / t.n).toFixed(1),
          use: Object.fromEntries(Object.entries(U).map(([k, v]) => [k, +v.toFixed(2)])),
          ends: t.ends
        };
      }
      return out;
    },
    { N, CFGS, MODE }
  );
  return { ...res, errors: errs.slice(0, 3) };
});
