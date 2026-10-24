// Personas that lean toward one way of working, on top of a human-like base policy, plus a balanced player. Reports
// the raw style tallies of every season (to set the normalising constants in rules.js) and which style each persona
// ends up with.  usage: node test/endstyle.js [gamesPerPersona]   OUT=file writes the JSON there
const fs = require('fs');
const { run, open, args } = require('./lib/harness');
const N = args()._[0] || 30;

run(async browser => {
  const { page, errors } = await open(browser, { seed: 777, mathSeed: 777 });
  const res = await page.evaluate(N => {
    window.sfx = () => {};
    window.musicChange = () => {};
    const rnd = __T.lcg(31337),
      out = {};
    ['balanced', ...Object.keys(__T.LEANS)].forEach(pk => {
      const policy = __T.policies.human(rnd, __T.LEANS[pk] || null);
      const o = (out[pk] = {
        styles: {},
        ids: {},
        tiers: {},
        haunt: {},
        rawAll: [],
        expo: [],
        acts: {
          talk: 0,
          search: 0,
          examine: 0,
          study: 0,
          rest: 0,
          accused: 0,
          friends: 0,
          enemies: 0,
          confess: 0,
          gossip: 0,
          cultTruth: 0,
          won: 0
        }
      });
      for (let g = 0; g < N; g++) {
        __T.start(g % 3);
        // a person marks suspects and allies now and then
        if (
          !__T.play(policy, {
            maxSteps: 500,
            each: () => {
              if (rnd() < 0.08) {
                const m = document.querySelectorAll('[data-mark]');
                if (m.length) m[Math.floor(rnd() * m.length)].click();
              }
            }
          })
        )
          continue;
        const r = endReckon(),
          won = ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
          L = S.log,
          A = o.acts;
        ['talk', 'search', 'examine', 'study', 'rest', 'confess', 'gossip', 'cultTruth'].forEach(k => {
          A[k] += L[k];
        });
        A.accused += L.accused.length;
        A.friends += r.friends.length;
        A.enemies += r.enemies.length;
        A.won += won ? 1 : 0;
        const st = endStyle(r);
        o.styles[st] = (o.styles[st] || 0) + 1;
        o.rawAll.push(endStyleScores(r));
        o.ids[S.endId] = (o.ids[S.endId] || 0) + 1;
        const tr = endTier(won, r.score);
        o.tiers[tr] = (o.tiers[tr] || 0) + 1;
        const h = won ? endHaunt() : -1;
        o.haunt[h] = (o.haunt[h] || 0) + 1;
        o.expo.push(+endExposure().toFixed(1));
      }
      const n = o.rawAll.length;
      Object.keys(o.acts).forEach(k => {
        o.acts[k] = +(o.acts[k] / n).toFixed(2);
      });
      o.expo.sort((p, q) => p - q);
      o.expoQ = [0, 0.25, 0.5, 0.75, 1].map(f => o.expo[Math.min(n - 1, Math.floor(f * n))]);
      delete o.expo;
    });
    return out;
  }, N);
  if (process.env.OUT) {
    fs.writeFileSync(process.env.OUT, JSON.stringify(res));
    return `written to ${process.env.OUT}; errors: ${JSON.stringify(errors)}`;
  }
  return { ...res, errors };
});
