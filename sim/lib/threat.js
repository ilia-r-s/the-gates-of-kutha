// Experimental common danger score. Loaded only by research scripts, never built
// into the game. No private belief grid or unresolved hearing is consulted.
(function (root) {
  function predict(row, model) {
    const scores = row.x.map(f => f.reduce((n, v, i) => n + v * model.weights[i], 0));
    if (row.kind === 'watched') return scores.some(n => n >= model.threshold);
    if (row.kind === 'suspects') {
      const max = Math.max(...scores);
      return max >= model.threshold ? scores.indexOf(max) : -1;
    }
    return row.kind === 'weight' ? 1 + model.share * scores[0] : scores[0];
  }
  function install(model = null, record = null) {
    const t = Suspicion.threat,
      keys = ['closingIn', 'harm', 'watched', 'suspects', 'weight'],
      original = Object.fromEntries(keys.map(k => [k, t[k]])),
      id = c => c?.id || c,
      features = (o, k) => {
        const words = S.said.filter(x => x.by === id(o) && x.about === id(k) && x.verdict === 'cult'),
          dreams = new Set(words.filter(x => x.how === 'dream').map(x => `${x.by}:${x.about}:${x.verdict}`)),
          heard = S.words.filter(
            w => w.by === id(o) && w.about === id(k) && w.verdict === 'cult' && w.heard === true && (w.knew || []).some(i => isFree(C(i)))
          );
        heard.filter(w => w.kind === 'dream').forEach(w => dreams.add(`${w.by}:${w.about}:${w.verdict}`));
        return [
          t.shown(o, k),
          dreams.size,
          heard.filter(w => w.kind !== 'dream').length,
          new Set(words.filter(w => w.how !== 'dream').map(w => `${w.day}:${w.how}`)).size
        ];
      };
    keys.forEach(kind => {
      t[kind] = (...args) => {
        // Preserve the reviewed rule's hearing resolution and discarded rolls.
        // The score then reads only the resulting, actually recorded knowledge.
        const baseline = original[kind](...args);
        let x;
        if (kind === 'watched')
          x = freeChars()
            .filter(o => o.id !== id(args[0]) && o.id !== id(args[1]))
            .map(o => features(o, args[0]));
        else if (kind === 'suspects') x = args[1].map(k => features(args[0], k));
        else if (kind === 'weight') x = [features(args[0], args[1])];
        else
          x = [
            freeCult()
              .map(k => features(args[0], k))
              .reduce((a, f) => a.map((n, i) => n + f[i]), [0, 0, 0, 0])
          ];
        const row = { kind, x, y: kind === 'suspects' ? args[1].findIndex(k => k.id === baseline?.id) : baseline };
        if (record) record(row);
        if (!model) return baseline;
        const value = predict(row, model);
        return kind === 'suspects' ? args[1][value] : value;
      };
    });
    return () =>
      keys.forEach(k => {
        t[k] = original[k];
      });
  }
  function loss(rows, model) {
    const sums = {},
      counts = {},
      mismatches = {};
    for (const row of rows) {
      const p = predict(row, model),
        n = row.count || 1,
        l = ['watched', 'suspects'].includes(row.kind) ? Number(p !== row.y) : Math.abs(p - row.y) / Math.max(1, row.y);
      sums[row.kind] = (sums[row.kind] || 0) + n * l;
      counts[row.kind] = (counts[row.kind] || 0) + n;
      mismatches[row.kind] = (mismatches[row.kind] || 0) + n * Number(p !== row.y);
    }
    const by = Object.fromEntries(
      Object.keys(counts).map(k => [k, { loss: sums[k] / counts[k], changed: mismatches[k] / counts[k], count: counts[k] }])
    );
    return { mean: Object.values(by).reduce((n, r) => n + r.loss, 0) / Object.keys(by).length, by };
  }
  function fit(rows) {
    let best;
    for (const a of [0, 0.5, 1, 2])
      for (const b of [0, 0.5, 1, 2])
        for (const c of [0, 0.5, 1, 2])
          for (const e of [0, 0.5, 1, 2])
            for (const threshold of [0.5, 1, 2])
              for (const share of [0.125, 0.25, 0.5]) {
                const model = { weights: [a, b, c, e], threshold, share },
                  score = loss(rows, model);
                if (!best || score.mean < best.score.mean) best = { model, score };
              }
    return best;
  }
  const api = { install, predict, loss, fit };
  if (typeof module !== 'undefined') module.exports = api;
  else root.__threatStudy = api;
})(globalThis);
