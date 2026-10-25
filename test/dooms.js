// After a doom: what it did to each of the camp (game/fates.js, doomFates), in English and in Russian, and every way it
// can go turning up. First every line of DOOM_FATE for each of the seven; then doom endings forced from half-played
// seasons, every nature in turn: the epilogue scanned in both languages, nobody told twice, no line told twice, the dead
// told as dead, and the ways counted by where the end found each of them. A way that comes seldom may not have come in the
// seasons asked for, by the luck of the deal: then it plays on, to three times as many, until every way has turned up.
// usage: node test/dooms.js [seasons]
const { run, open, args } = require('./lib/harness');
const A = args(),
  N = +(A._[0] || 120);

run(async browser => {
  const { page, errors } = await open(browser, { seed: 6161, mathSeed: 6161 });
  const res = await page.evaluate(N => {
    window.sfx = () => {};
    window.musicChange = () => {};
    const bad = [],
      seen = new Set();
    // ---------- every line, for each of the seven ----------
    __T.start(0);
    let lines = 0;
    const one = (where, en, rus) => {
      lines++;
      if (/[А-Яа-яЁё]/.test(en)) bad.push(`${where}: Cyrillic in the English`);
      if (/[A-Za-z]/.test(rus.replace(/Dr /g, ''))) bad.push(`${where}: Latin in the Russian`);
      [en, rus].forEach(t => {
        if (/undefined|NaN|\bnull\b|\[object|\$\{|[\u0001\u0002\u0003]/.test(t)) bad.push(`${where}: marker: ${t}`);
        if (!/^[A-ZА-ЯЁ«“]/.test(t)) bad.push(`${where}: no capital: ${t}`);
        if (!/[.!?»”]$/.test(t)) bad.push(`${where}: no full stop: ${t}`);
        if (/ {2}|\s[,.;:]/.test(t)) bad.push(`${where}: spacing: ${t}`);
      });
    };
    const walk = (o, path) =>
      Array.isArray(o)
        ? o.forEach((f, i) =>
            S.order.map(C).forEach(c => {
              const [en, rus] = f(c);
              one(`${path}[${i}] ${c.id}`, en, rus);
            })
          )
        : Object.keys(o).forEach(k => walk(o[k], `${path}.${k}`));
    walk(DOOM_FATE, 'DOOM_FATE');
    walk(DOOM_CULT_NONE, 'DOOM_CULT_NONE');
    // ---------- doom endings, forced ----------
    const NATS = Object.keys(DOOM_FATE),
      ways = {},
      byNat = {},
      tally = (o, k) => (o[k] = (o[k] || 0) + 1);
    let x = 4242;
    const rnd = k => (x = (x * 1103515245 + 12345) % 2147483648) % k;
    // every way, by place, that must turn up at least once (but those that come seldom there: helping, of those below
    // with you)
    const want = {
      heart: ['taken', 'marked', 'fled', 'none'],
      camp: ['taken', 'marked', 'fled', 'helped', 'helpedDied', 'none'],
      away: ['taken', 'marked', 'fled', 'helped', 'helpedDied', 'none'],
      cult: ['joined', 'taken', 'waits', 'fled', 'marked', 'none'],
      cell: ['freed', 'taken', 'none'],
      dead: ['unburied', 'buried']
    };
    const missing = () =>
      Object.entries(want).flatMap(([pool, kinds]) => kinds.filter(k => !(ways[pool] && ways[pool][k])).map(k => `${k} (${pool})`));
    let g = 0;
    for (; g < N || (g < 3 * N && missing().length); g++) {
      __T.start(g % 3);
      // part of a season, any old how (a third of it to most of it), then the end
      const steps = 30 + rnd(200);
      for (let n = 0; n < steps && !S.ended; n++) {
        const bs = __T.buttons();
        if (!bs.length) break;
        const pool = bs.filter(b => !/Go somewhere else|Never mind|Think better/.test(b.textContent));
        const from = pool.length && rnd(10) ? pool : bs;
        from[rnd(from.length)].click();
      }
      S.ended = null;
      // now and then the end found some of them below with you (heart), or on the stair (left), or holding the gate
      if (!S.fin && rnd(3) === 0) {
        const loyal = freeChars().filter(c => c.role !== 'cult'),
          took = loyal.slice(0, rnd(3)).map(c => c.id);
        S.fin = {
          early: false,
          named: S.patron,
          comp: took.slice(),
          took,
          left: took.length > 1 && rnd(2) ? [took[1]] : [],
          tries: 0,
          betrayed: [],
          acts: [],
          g1: 'slow',
          g2: 'eyes',
          g3: took.length && rnd(3) === 0 ? { kind: 'comp', id: took[0] } : { kind: 'self' }
        };
      }
      // now and then one of the cult sits in a cell at Hillah, and one of the camp has been sent away
      if (rnd(4) === 0) {
        const k = freeCult()[0];
        if (k) k.status = 'exposed';
      }
      if (rnd(3) === 0) {
        const o = freeChars().filter(c => c.role !== 'cult' && !(S.fin && (S.fin.took || []).includes(c.id)))[0];
        if (o) o.status = 'dismissed';
      }
      const nat = NATS[g % NATS.length];
      S.aspectOf[S.patron] = nat;
      S.ended = 'doom';
      S.romance = romances(); // (decided at the end, as ending() decides it: game/endings.js)
      const D = doomFates(),
        used = new Set();
      Object.entries(D).forEach(([id, d]) => {
        const c = C(id),
          key = `${d.kind}:${d.cell ? 'cell' : d.cult ? 'cult' : d.at}:${d.line}`,
          pool = d.cell ? 'cell' : d.cult ? 'cult' : d.at;
        if (used.has(key)) bad.push(`${nat}: a line told twice (${key})`);
        used.add(key);
        if (c.status === 'taken' && d.kind !== 'unburied') bad.push(`${nat}: one of the night's dead told as ${d.kind}`);
        if (c.status !== 'taken' && d.kind === 'unburied') bad.push(`${nat}: one alive told as unburied`);
        if (c.takenBy === 'you') bad.push(`${nat}: the one you killed has a doom`);
        if (c.role === 'cult' && !d.cult && !d.cell && d.kind !== 'unburied') bad.push(`${nat}: one of the cult told as the camp`);
        if (c.role !== 'cult' && (d.cult || d.cell)) bad.push(`${nat}: one of the camp told as the cult`);
        if (!doomLines(d, d.kind)[d.line]) bad.push(`${nat}: no words for ${key}`);
      });
      // every one of the seven, by where the end found them: the way it went, or none
      S.order.map(C).forEach(c => {
        const d = D[c.id],
          pool = c.status === 'taken' ? 'dead' : c.role === 'cult' ? (c.status === 'exposed' ? 'cell' : 'cult') : doomAt(c),
          kind = d ? d.kind : c.status === 'taken' ? 'buried' : 'none';
        tally((ways[pool] = ways[pool] || {}), kind);
        tally((byNat[nat] = byNat[nat] || {}), kind);
      });
      // the epilogue as it reads
      const html = endAfter('doom-' + nat, false);
      __T.scan(html, `doom-${nat} epilogue`, bad, seen);
      const items = html.split('<li').length - 1;
      if (items !== S.order.length) bad.push(`${nat}: ${items} told of, not ${S.order.length}`);
    }
    missing().forEach(m => bad.push(`never: ${m}`));
    return { lines, seasons: g, asked: N, ways, byNature: byNat, problems: bad.length, bad: bad.slice(0, 40) };
  }, N);
  if (errors.length) res.errors = errors.slice(0, 5);
  return res;
});
