// A fixed-seed casebook reader, playing the actual choices, descent and finale.
// node test/puzzle.js [seasons] [half,rel,title,lines ...] [--seed=4242]
// MODE=cult|puzzle|mixed controls priorities. Node is default; --engine=browser
// runs the same policy in Chrome. No result is estimated from hidden success odds.
const path = require('node:path');
const { runFast: run, openFast: open, args } = require('./lib/harness');
const A = args({ seed: 4242, file: '' }),
  N = +(A._[0] || 200),
  CFGS = A._.slice(1).length ? A._.slice(1).map(s => String(s).split(',').map(Number)) : [null],
  MODE = process.env.MODE || 'mixed';
if (
  !['cult', 'puzzle', 'mixed'].includes(MODE) ||
  !Number.isInteger(N) ||
  N < 1 ||
  !Number.isInteger(A.seed) ||
  A.seed < 0 ||
  A.seed > 0xffffffff
)
  throw new Error('Invalid mode, season count, or unsigned 32-bit seed');
run(async browser => {
  const { page, errors } = await open(browser, { file: A.file, seed: A.seed, mathSeed: A.seed });
  await page.addScriptTag({ path: path.resolve(__dirname, 'solver.js') });
  await page.addScriptTag({ path: path.resolve(__dirname, 'lib/observer.js') });
  const results = await page.evaluate(
    ({ N, CFGS, MODE, seed }) => {
      const out = {};
      for (const cfg of CFGS) {
        if (cfg) {
          const [half, rel, title, lines] = cfg;
          Object.assign(PUZ, { half, rel, title, ...(lines ? { lines } : {}) });
        }
        const t = { n: 0, win: 0, exposed: 0, god1: 0, god2: 0, ward1: 0, had: 0, seen: 0, facts: 0, glosses: 0, ends: {}, stuck: 0 },
          coverage = { descent: 0, gates: [0, 0, 0], sanctum: 0, acts: 0 },
          use = {};
        for (let i = 0; i < N; i++) {
          const season = (seed + Math.imul(i, 2654435761)) >>> 0,
            policy = __observer(__T.rng(season ^ 0x9e3779b9), MODE);
          __T.start(i % 3, false, season);
          if (
            !__T.play(
              bs => {
                const chosen = policy(bs),
                  label = __T.observe(bs).choices[bs.indexOf(chosen)],
                  kind = /Examine/.test(label)
                    ? 'exam'
                    : /Translate|Look for|Read it as/.test(label)
                      ? 'study'
                      : /Search/.test(label)
                        ? 'search'
                        : /Ask .*title/.test(label)
                          ? 'gloss'
                          : /Show /.test(label)
                            ? 'read'
                            : /Accuse/.test(label)
                              ? 'acc'
                              : /Speak with/.test(label)
                                ? 'talk'
                                : null;
                if (kind) use[kind] = (use[kind] || 0) + 1;
                return chosen;
              },
              { maxSteps: 1500 }
            )
          )
            t.stuck++;
          // Truth is used only after the last choice, to score the evidence.
          const r = solve(),
            ward = S.wardOf[S.patron];
          t.n++;
          t.ends[S.ended || 'stuck'] = (t.ends[S.ended || 'stuck'] || 0) + 1;
          if (['exposed', 'triumph', 'pyrrhic'].includes(S.ended)) t.win++;
          if (S.ended === 'exposed') t.exposed++;
          if (r.P.length === 1 && r.P[0] === S.patron) t.god1++;
          if (r.P.length <= 2 && r.P.includes(S.patron)) t.god2++;
          if (Object.keys(r.wardP).length === 1 && Object.keys(r.wardP)[0] === ward) t.ward1++;
          if (has(ward)) t.had++;
          t.seen += r.seen;
          t.facts += r.facts;
          t.glosses += S.glosses.length;
          if (S.fin) {
            coverage.descent++;
            ['g1', 'g2', 'g3'].forEach((k, j) => {
              if (S.fin[k] != null) coverage.gates[j]++;
            });
            if (S.fin.acts.length) coverage.sanctum++;
            coverage.acts += S.fin.acts.length;
          }
        }
        const pc = k => ((100 * t[k]) / t.n).toFixed(0) + '%',
          { half, rel, title, lines } = PUZ;
        out[`${MODE}: half ${half}, rel ${rel}, title ${title}, lines ${lines}`] = {
          seasons: t.n,
          seed,
          policy: 'observer (public evidence only)',
          win: pc('win'),
          exposedBoth: pc('exposed'),
          godPinned: pc('god1'),
          godDownToTwo: pc('god2'),
          wardPinned: pc('ward1'),
          hadWard: pc('had'),
          avgSigns: (t.seen / t.n).toFixed(1),
          avgLines: (t.facts / t.n).toFixed(1),
          avgGlosses: (t.glosses / t.n).toFixed(1),
          use: Object.fromEntries(Object.entries(use).map(([k, v]) => [k, +(v / N).toFixed(2)])),
          coverage,
          ends: t.ends,
          stuck: t.stuck,
          problems: N >= 200 && (!coverage.sanctum || coverage.gates.some(n => !n)) ? 1 : 0
        };
      }
      return out;
    },
    { N, CFGS, MODE, seed: A.seed }
  );
  await page.close();
  return { ...results, errors };
});
