// Shared opportunity counts for expedition and conditional tell studies.
(function (root) {
  function collector() {
    const table = {};
    let cluster = null;
    const ensure = (name, method = 'cluster') => (table[name] ||= { totals: {}, clusters: {}, method });
    return {
      table,
      ensure,
      cluster(id) {
        cluster = id;
      },
      add(name, group, hit) {
        if (cluster === null) throw Error('A tell observation needs an independent scenario/season cluster');
        const row = ensure(name),
          local = (row.clusters[cluster] ||= {});
        for (const counts of [row.totals, local]) {
          const g = (counts[group] ||= [0, 0]);
          g[1]++;
          if (hit) g[0]++;
        }
      }
    };
  }
  const api = { collector };
  if (typeof module !== 'undefined') module.exports = api;
  else root.__tellCounts = api;
})(globalThis);
