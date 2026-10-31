// Sound reasoning over what the casebook shows: signs seen, tablet lines, glosses and readings from people not known
// to be cultists. The tablets name powers by titles, so the logician also has to work out which title is which power:
// every power goes by exactly two titles, and the titles met so far are assigned in every way the lines allow.
// Not run on its own: test/gods.js and test/puzzle.js load it into the page, beside the game.
const perms = a => (a.length < 2 ? [a] : a.flatMap((x, i) => perms(a.filter((y, j) => j !== i)).map(r => [x, ...r])));
// every way to choose two decoys among the season's six charms and give the other four to its four powers
const wardAssigns = gods => {
  const out = [],
    pm = perms(gods);
  for (let a = 0; a < 6; a++)
    for (let c = a + 1; c < 6; c++) {
      const rest = [0, 1, 2, 3, 4, 5].filter(i => i !== a && i !== c);
      pm.forEach(p => {
        const m = {};
        m[a] = 'none';
        m[c] = 'none';
        rest.forEach((i, k) => {
          m[i] = p[k];
        });
        out.push(m);
      });
    }
  return out;
};
window.solve = function solve(useSoft = true) {
  const POWERS = S.gods, // the season's four, and its six charms
    CH = S.charms,
    WARD_ASSIGNS = wardAssigns(POWERS);
  const seen = [...new Set(S.omenLog.map(o => o.si))];
  const known = S.factKnown.map(i => S.facts[i]);
  const trusted = by => by === 'you' || (S.revealed[by] !== 'cult' && C(by).status !== 'exposed');
  const glosses = useSoft ? S.glosses.filter(gl => trusted(gl.by)) : [];
  const reads = useSoft ? Object.values(S.readings).filter(r => trusted(r.by)) : [];
  const met = titlesMet();
  // every assignment of the titles met so far to powers, at most two titles to a power, that the glosses allow
  const assigns = [];
  const cnt = {};
  POWERS.forEach(g => {
    cnt[g] = 0;
  });
  const A = {};
  const okSoFar = () =>
    known.every(f => {
      if (f.kind === 'gname') return A[f.e] == null || A[f.e] === f.g;
      if (f.kind === 'geq') return A[f.e1] == null || A[f.e2] == null || A[f.e1] === A[f.e2];
      if (f.kind === 'gneq') return A[f.e1] == null || A[f.e2] == null || A[f.e1] !== A[f.e2];
      return true;
    }) && glosses.every(gl => A[gl.e] == null || A[gl.e] === gl.g);
  (function rec(i) {
    if (i === met.length) {
      assigns.push({ ...A });
      return;
    }
    POWERS.forEach(g => {
      if (cnt[g] >= 2) return;
      A[met[i]] = g;
      cnt[g]++;
      if (okSoFar()) rec(i + 1);
      cnt[g]--;
      delete A[met[i]];
    });
  })(0);
  const res = { P: new Set(), ward: {}, titles: {}, worlds: 0 };
  met.forEach(e => {
    res.titles[e] = new Set();
  });
  assigns.forEach(A => {
    const R = r => (r[0] === 'g' ? r.slice(2) : A[r.slice(2)]);
    // signs under this assignment
    const PK = {};
    let bad = false;
    known
      .filter(f => f.kind === 'sign')
      .forEach(f => {
        const k = PK[f.sign] || (PK[f.sign] = { in: new Set(), out: new Set() });
        const ins = f.in.map(R),
          outs = f.out.map(R);
        if (ins.length === 2 && ins[0] === ins[1]) bad = true;
        if (outs.length === 2 && outs[0] === outs[1]) bad = true;
        ins.forEach(g => k.in.add(g));
        outs.forEach(g => k.out.add(g));
      });
    Object.values(PK).forEach(k => {
      if (k.in.size > 2 || k.out.size > 2 || [...k.in].some(g => k.out.has(g))) bad = true;
    });
    if (bad) return;
    const members = si => {
      const k = PK[si];
      if (!k) return new Set(POWERS);
      if (k.in.size >= 2) return new Set(k.in);
      return new Set(POWERS.filter(g => !k.out.has(g)));
    };
    const surely = si => {
      const k = PK[si];
      if (!k) return new Set();
      if (k.in.size >= 2 || k.out.size >= 2) return members(si);
      return new Set(k.in);
    };
    let P = POWERS.filter(g => seen.every(si => members(si).has(g)));
    if (seen.length >= 4)
      P = P.filter(g =>
        Object.keys(PK)
          .map(Number)
          .filter(si => !seen.includes(si))
          .every(si => !surely(si).has(g))
      );
    if (!P.length) return;
    // charms under this assignment
    const dom = {};
    CH.forEach(w => {
      dom[w] = new Set([...POWERS, 'none']);
    });
    const keep = (w, f) => {
      dom[w] = new Set([...dom[w]].filter(f));
    };
    const pairs = [];
    known.forEach(f => {
      if (f.kind === 'ward') {
        const m = members(f.sign);
        keep(f.ward, x => m.has(x));
      }
      if (f.kind === 'wref') keep(f.ward, x => x === R(f.ref));
      if (f.kind === 'wardor') {
        const two = f.refs.map(R);
        keep(f.ward, x => two.includes(x));
      }
      if (f.kind === 'notward') dom[f.ward].delete(R(f.ref));
      if (f.kind === 'decoy') keep(f.ward, x => x === 'none');
      if (f.kind === 'wpair') pairs.push(f);
    });
    reads.forEach(r => keep(r.w, x => (r.none ? x === 'none' : r.refs.map(R).includes(x))));
    const ms = WARD_ASSIGNS.filter(
      m =>
        CH.every((w, i) => dom[w].has(m[i])) &&
        pairs.every(f => {
          const a = m[CH.indexOf(f.wards[0])],
            b = m[CH.indexOf(f.wards[1])],
            g = R(f.ref);
          return (a === 'none' && b === g) || (b === 'none' && a === g);
        })
    );
    if (!ms.length) return;
    res.worlds++;
    P.forEach(g => {
      res.P.add(g);
      ms.forEach(m => {
        const i = [0, 1, 2, 3, 4, 5].find(k => m[k] === g);
        const w = CH[i];
        res.ward[w] = (res.ward[w] || 0) + 1;
      });
    });
    met.forEach(e => res.titles[e].add(A[e]));
  });
  if (useSoft && !res.worlds) return solve(false);
  const tot = Object.values(res.ward).reduce((a, b) => a + b, 0),
    wardP = {};
  Object.keys(res.ward).forEach(w => {
    wardP[w] = res.ward[w] / tot;
  });
  const titles = {};
  met.forEach(e => {
    titles[e] = [...res.titles[e]];
  });
  return { P: [...res.P], wardP, titles, worlds: res.worlds, seen: seen.length, facts: known.length };
};
