// Diagnose public speech opportunities and compare the isolated removal of a
// role-only silence gate. Targets, camp slots and all actual seasons are retained.
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const { openNode, args } = require('../test/lib/harness');
const { rateRatio } = require('../test/lib/statistics');
const A = args({ seasons: 3150, seed: 51701, file: '', out: '' });
if (!A.file) throw Error('--file must identify the preserved artifact with the original public-speech filter');
async function main() {
  const reports = [];
  for (const variant of ['original', 'shared']) {
    const { page, errors } = await openNode(null, { file: A.file });
    try {
      if (!(await page.evaluate(() => String(window.cultNamesAloud).includes('frame'))))
        throw Error('The supplied artifact already removed the framing filter; it cannot serve as this experiment’s baseline');
      const result = await page.evaluate(
        ({ n, seed, variant }) => {
          let atBreakfast = false;
          const opportunities = {},
            kinds = {},
            clusters = {},
            direct = window.innocentBlames,
            cult = window.cultNamesAloud,
            breakfast = window.breakfastBlame,
            count = (box, key) => (box[key] = (box[key] || 0) + 1);
          window.breakfastBlame = function () {
            atBreakfast = true;
            try {
              return breakfast.apply(this, arguments);
            } finally {
              atBreakfast = false;
            }
          };
          window.innocentBlames = function (c, others) {
            if (atBreakfast && c.role !== 'cult') count(opportunities, 'innocent/' + temperOf(c));
            return direct.apply(this, arguments);
          };
          window.cultNamesAloud = function (c, others) {
            count(opportunities, 'cult/' + temperOf(c));
            if (variant === 'original') return cult.apply(this, arguments);
            const bus = busFor(c, others),
              eligible = others.filter(o => o.role !== 'cult');
            return bus || (eligible.length ? direct(c, eligible) : null);
          };
          let finished = 0;
          for (let i = 0; i < n; i++) {
            const season = (seed + Math.imul(i, 2654435761)) >>> 0,
              days = {};
            __T.start(i % 3, false, season);
            const policy = __T.policies.human(
              __T.rng(season ^ 31337),
              /Ask where they were|Ask whom they distrust|Make conversation|Speak with/
            );
            if (
              __T.play(policy, {
                maxSteps: 1500,
                each() {
                  days[S.day] ||= freeChars().map(c => c.id);
                }
              })
            )
              finished++;
            for (const [day, ids] of Object.entries(days))
              for (const id of ids) {
                const c = C(id),
                  group = c.role === 'cult' ? 'cult' : 'innocent',
                  temper = temperOf(c),
                  words = S.said.filter(w => w.by === id && w.day === +day && w.how !== 'vote'),
                  row = ((clusters[temper] ||= {})[i] ||= { cult: [0, 0], innocent: [0, 0] });
                row[group][1]++;
                row[group][0] += words.length > 0;
                for (const how of new Set(words.map(w => w.how))) count(kinds, temper + '/' + group + '/' + how);
              }
          }
          return { variant, seasons: n, finished, opportunities, kinds, clusters };
        },
        { n: +A.seasons, seed: +A.seed, variant }
      );
      if (errors.length || result.finished !== result.seasons) throw Error('Speech study did not complete every season');
      const ratios = Object.entries(result.clusters).map(([temper, rows]) => ({
        temper,
        ...rateRatio(
          Object.values(rows).map(r => [...r.cult, ...r.innocent]),
          { comparisons: Object.keys(result.clusters).length }
        )
      }));
      reports.push({ ...result, ratios });
    } finally {
      await page.close();
    }
  }
  if (A.out)
    fs.writeFileSync(
      A.out,
      JSON.stringify(
        { seed: +A.seed, artifactSha256: createHash('sha256').update(fs.readFileSync(A.file)).digest('hex'), reports },
        (_, x) => (typeof x === 'number' && !Number.isFinite(x) ? String(x) : x)
      )
    );
  console.log(
    JSON.stringify(
      reports.map(({ clusters, ...r }) => r),
      null,
      2
    )
  );
}
main().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});
