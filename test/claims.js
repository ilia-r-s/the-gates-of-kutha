// Claims: who claims what, how often each kind of lie is told, and that every claim behaves as it should: true
// Dreamers dream true, the cult's dreamers lie where it pays and tell the truth where it is cheap, a pretend Dreamer
// guesses; hidden parts come out with trust; a false claim broken by pressing is given up now and then, the cult's as
// anyone's; a sworn watch that fails is noticed in the morning. Every line is checked in both languages.
// usage: node test/claims.js [games]
const { run, open, args } = require('./lib/harness');
const N = args()._[0] || 300;

run(async browser => {
  const { page, errors } = await open(browser, { file: 'artifact' });
  const res = await page.evaluate(N => {
    window.sfx = () => {};
    const bad = [],
      dist = {},
      dreams = { seer: [0, 0], cult: [0, 0], pretend: [0, 0] },
      atTrust = { n: 0, kept: 0 },
      pressed = { cult: [0, 0], other: [0, 0] }, // [false claims pressed, given up]
      scan = (s, where) => __T.scan(s, where, bad);
    for (let k = 0; k < N; k++) {
      newGame('T', pick(['philologist', 'soldier', 'occultist']));
      S.order.map(C).forEach(c => {
        const cl = claimOf(c),
          key = `${c.id === S.hierophant ? 'hierophant' : c.role}:${cl.role}:${cl.why}`;
        dist[key] = (dist[key] || 0) + 1;
        const r = DIALOG.diary.run(c);
        [r.you, r.them, r.note].filter(Boolean).forEach(s => scan(s, 'diary ' + c.id));
        if (claimOf(c).said == null) bad.push('claim not recorded');
      });
      // dreams: who dreams what, and how often it is true
      const seer = S.order.map(C).find(c => c.role === 'seer');
      for (let n = 0; n < 6; n++) {
        S.testimony = [];
        const pre = S.order.map(C).find(c => c.role === 'bystander' && claimOf(c).role === 'seer');
        if (pre) {
          const d = fakeDream(pre);
          if (d) {
            dreams.pretend[0]++;
            if ((d.t.role === 'cult') === d.cult) dreams.pretend[1]++;
            scan(bi(...dreamSaid(pre, d)), 'pretend dream');
          }
        }
      }
      // four nights: the dreams told, the watches failed, the mornings
      S.slot = 2;
      for (let d = 1; d <= 4 && !S.ended; d++) {
        S.day = d;
        S.phase = 'night';
        const sworn = S.order.map(C).find(c => isFree(c) && claimOf(c).role === 'warden' && c.role !== 'warden');
        if (sworn && d === 2) {
          sworn.rapport = 2;
          if (sworn.role === 'cult') S.sworn.cult = sworn.id;
          else S.sworn.other = sworn.id;
        }
        const before = S.testimony.length;
        (resolveNight() || []).forEach(s => scan(s, 'night'));
        S.testimony
          .slice(before)
          .filter(t => t.kind === 'vision')
          .forEach(t => {
            const truth = C(t.about).role === 'cult',
              said = t.verdict === 'cult';
            const who = t.from === (seer && seer.id) ? 'seer' : C(t.from).role === 'cult' ? 'cult' : 'pretend';
            dreams[who][0]++;
            if (truth === said) dreams[who][1]++;
            if (who === 'seer' && claimOf(seer).role !== 'seer') bad.push('a hidden Dreamer told a dream');
          });
        if (S.wounds >= S.woundsMax || S.nerve <= 0) break;
      }
      // trust and pressure
      S.order
        .map(C)
        .filter(isFree)
        .forEach(c => {
          const cl = claimOf(c);
          if (cl.why === 'conceal' && (c.role === 'seer' || c.role === 'warden') && cl.recanted == null) {
            c.rapport = 3;
            const t = recantTrust(c); // (mostly, at trust 3: RULES.confess.atTrust, the less the more they would hide it)
            atTrust.n++;
            if (!t) atTrust.kept++;
            else {
              scan(t, 'recant trust');
              if (claimOf(c).role !== c.role) bad.push('recant did not take');
            }
          }
          if ((cl.role === 'seer' || cl.role === 'warden') && cl.role !== c.role && cl.said != null && cl.recanted == null) {
            const k = c.role === 'cult' ? 'cult' : 'other',
              t = recantPressed(c);
            pressed[k][0]++;
            if (t) {
              pressed[k][1]++;
              scan(t, 'recant press');
              if (claimOf(c).role !== trueClaim(c)) bad.push('a pressed recant did not take');
            }
          }
        });
      ['people', 'evidence', 'omens'].forEach(t => {
        S_ui.tab = t;
        scan({ people: bookPeople, evidence: bookEvidence, omens: bookOmens }[t](), 'book ' + t);
      });
      if (k % 10 === 0) {
        S.ended = null;
        S.phase = 'loc';
        ending('madness');
        scan(S_ui.scene.body.join('') + S_ui.scene.title + S_ui.scene.sub + S_ui.scene.kicker, 'ending');
      }
    }
    const pc = ([n, t]) => (n ? `${((100 * t) / n).toFixed(0)}% true of ${n}` : 'none'),
      pg = ([n, t]) => (n ? `${((100 * t) / n).toFixed(0)}% of ${n}` : 'none');
    return {
      games: N,
      claims: Object.fromEntries(Object.entries(dist).sort((p, q) => q[1] - p[1])),
      dreams: { seer: pc(dreams.seer), cult: pc(dreams.cult), pretend: pc(dreams.pretend) },
      pressedGivenUp: { cult: pg(pressed.cult), other: pg(pressed.other) },
      hiddenKeptAtTrust3: `${atTrust.kept} of ${atTrust.n}`,
      problems: [...new Set(bad)]
        .concat(
          atTrust.n >= 20 && (atTrust.kept === 0 || atTrust.kept > atTrust.n / 2)
            ? ['hidden parts kept at trust 3: ' + atTrust.kept + '/' + atTrust.n]
            : []
        )
        .slice(0, 12),
      nProblems: bad.length
    };
  }, N);
  return { ...res, errors };
});
