// The god puzzle is sound: every deal is well formed, every tablet line is true but for a scribe's error, no single line
// names the power, and all the lines together (with every sign seen) pin down the power, its ward and every title in
// play. Played with exact dice and no scribe's errors, to prove the shape; then with every line a scribe's error, each
// of which must be false; then as the game deals them, to count how often a line is.
const path = require('path');
const { run, open } = require('./lib/harness');
const N = +(process.argv[2] || 400);
run(async browser => {
  const { page: p, errors: errs } = await open(browser, { file: 'artifact', helpers: false });
  await p.addScriptTag({ path: path.resolve(__dirname, 'solver.js') });
  const res = await p.evaluate(N => {
    window.show = () => {};
    window.sfx = () => {};
    const exact = scribe => {
      Object.assign(RULES.scale, { rarest: 0, surest: 1 });
      PUZ.scribe = scribe;
    };
    const keep = { scale: { ...RULES.scale }, scribe: PUZ.scribe };
    exact(0);
    const bad = [],
      combos = new Set(),
      kinds = {};
    let soloPins = 0,
      n = 0,
      factCount = 0,
      titleLines = 0,
      refs = 0,
      titled = 0;
    for (let k = 0; k < N; k++) {
      newGame('T', pick(['philologist', 'soldier', 'occultist']));
      n++;
      S.glosses = [];
      const sp = S.signPair,
        signs = Object.keys(sp).map(Number),
        G = refGod;
      if (signs.length !== 8) bad.push('signs ' + signs.length);
      S.gods.forEach(g => {
        if (S.signsOf[g].length !== 4) bad.push('signsOf ' + g);
        if (S.titlesOf[g].length !== 2 || S.titlesOf[g].some(e => S.titleOf[e] !== g)) bad.push('titles ' + g);
      });
      if (new Set(Object.values(S.wardAt)).size < 5) bad.push('spots'); // (one to a place, or two sharing one: PUZ.share)
      if (S.decoys.length !== 2 || S.decoys.some(w => S.godOfWard[w])) bad.push('decoys');
      S.gods.forEach(g => {
        if (S.godOfWard[S.wardOf[g]] !== g) bad.push('ward map');
      });
      combos.add(S.patron + S.wardOf[S.patron] + S.signsOf[S.patron].slice().sort().join() + S.titlesOf[S.patron].join());
      factCount += S.facts.length;
      S.facts.forEach(f => {
        kinds[f.kind] = (kinds[f.kind] || 0) + 1;
        factRefs(f).forEach(r => {
          refs++;
          if (r[0] === 't') titled++;
        });
        if (['gname', 'geq', 'gneq'].includes(f.kind)) titleLines++;
        const w = f.ward,
          gw = w && S.godOfWard[w];
        const ok =
          f.kind === 'sign'
            ? f.in.every(r => sp[f.sign].includes(G(r))) &&
              f.out.every(r => !sp[f.sign].includes(G(r))) &&
              new Set(f.in.map(G)).size === f.in.length &&
              new Set(f.out.map(G)).size === f.out.length
            : f.kind === 'gname'
              ? S.titleOf[f.e] === f.g
              : f.kind === 'geq'
                ? S.titleOf[f.e1] === S.titleOf[f.e2]
                : f.kind === 'gneq'
                  ? S.titleOf[f.e1] !== S.titleOf[f.e2]
                  : f.kind === 'ward'
                    ? sp[f.sign].includes(gw)
                    : f.kind === 'wref'
                      ? gw === G(f.ref)
                      : f.kind === 'wardor'
                        ? f.refs.map(G).includes(gw)
                        : f.kind === 'notward'
                          ? gw !== G(f.ref)
                          : f.kind === 'wpair'
                            ? (!S.godOfWard[f.wards[0]] && S.godOfWard[f.wards[1]] === G(f.ref)) ||
                              (!S.godOfWard[f.wards[1]] && S.godOfWard[f.wards[0]] === G(f.ref))
                            : f.kind === 'decoy'
                              ? !gw
                              : false;
        if (!ok !== !!f.scribe) bad.push((f.scribe ? 'a scribe’s error true: ' : 'false line: ') + f.kind + ' ' + f.text);
        if (/undefined|NaN|\{|\}/.test(f.text)) bad.push('broken text: ' + f.text);
      });
      // all four signs seen and every line read
      S.omenLog = [0, 1, 2, 3].map(i => ({ day: 1, i, si: S.signsOf[S.patron][i] }));
      S.factKnown = S.facts.map((f, i) => i);
      const all = solve(false);
      if (all.P.length !== 1 || all.P[0] !== S.patron) bad.push('not pinned by everything: ' + all.P.join());
      if (Object.keys(all.wardP).length !== 1 || Object.keys(all.wardP)[0] !== S.wardOf[S.patron])
        bad.push('ward not pinned by everything');
      Object.keys(all.titles).forEach(e => {
        if (all.titles[e].length !== 1 || all.titles[e][0] !== S.titleOf[e]) bad.push('title not pinned: ' + e);
      });
      // each line alone, with all signs seen, never pins the power and its ward
      if (k < 120)
        S.facts.forEach((f, i) => {
          S.factKnown = [i];
          const r = solve(false);
          if (r.P.length === 1 && Object.keys(r.wardP).length === 1) soloPins++;
        });
    }
    // every line a scribe's error: each false, each well written; then as dealt, how often a line is one
    exact(1);
    let wrongLines = 0;
    for (let k = 0; k < 120; k++) {
      newGame('T', 'occultist');
      S.facts.forEach(f => {
        if (!f.scribe || /undefined|NaN|\{|\}/.test(f.text) || f.text === f.scribe) bad.push('scribe line ' + f.form + ': ' + f.text);
        wrongLines++;
      });
    }
    Object.assign(RULES.scale, keep.scale);
    PUZ.scribe = keep.scribe;
    let dealt = 0,
      erred = 0;
    for (let k = 0; k < 300; k++) {
      newGame('T', 'philologist');
      dealt += S.facts.length;
      erred += S.facts.filter(f => f.scribe).length;
    }
    return {
      scribeLinesChecked: wrongLines,
      scribeShare: (erred / dealt).toFixed(4),
      games: n,
      avgLines: (factCount / n).toFixed(1),
      kinds: Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, +(v / n).toFixed(2)])),
      titleLinesPerGame: (titleLines / n).toFixed(1),
      shareOfRefsByTitle: (titled / refs).toFixed(2),
      distinctDeals: combos.size,
      soloPins,
      problems: [...new Set(bad)].slice(0, 8),
      nProblems: bad.length
    };
  }, N);
  return { ...res, errors: errs.slice(0, 3) };
});
