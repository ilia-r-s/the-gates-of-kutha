// Visible night/morning density from genuine fixed-seed expeditions.
// Optional omen/nature/world beats are counted separately from clues and consequences.
// node sim/night-density.js --seasons=1000 --seed=19073 --out=results.json
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { openNode, args, FILE } = require('../test/lib/harness');
const A = args({ seasons: 1000, seed: 19073, policies: 'human,careful', verify: 24, out: '', file: '', rules: '' });
const policies = String(A.policies).split(',');
if (
  !Number.isInteger(+A.seasons) ||
  +A.seasons < 1 ||
  !Number.isInteger(+A.seed) ||
  +A.seed < 0 ||
  +A.seed > 0xffffffff ||
  !Number.isInteger(+A.verify) ||
  +A.verify < 0 ||
  policies.some(p => !['human', 'careful'].includes(p))
)
  throw Error('Positive season count, unsigned seed, nonnegative verification count and known policies required');

async function main() {
  const { page, errors } = await openNode(null, { file: A.file });
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    const result = await page.evaluate(
      ({ n, seed, policies, verify, changes }) => {
        const patch = (base, edits) => {
          for (const [key, value] of Object.entries(edits)) {
            if (!Object.hasOwn(base, key)) throw Error('Unknown pacing override ' + key);
            if (value && typeof value === 'object' && !Array.isArray(value)) patch(base[key], value);
            else base[key] = value;
          }
        };
        if (changes) {
          if (changes.rules) patch(RULES, changes.rules);
          if (changes.tenor) patch(TENOR, changes.tenor);
        }
        let active = null,
          phase = null,
          route = [],
          season = 0,
          background = 0,
          policyName = '';
        const rows = [],
          examples = [],
          restores = [],
          snapshots = [],
          outcomes = {};
        const english = h => {
          const lang = LANG;
          try {
            LANG = 'en';
            return X(h);
          } finally {
            LANG = lang;
          }
        };
        const plain = h =>
          english(h)
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const beat = (kind, group, html, extra = {}) => {
          if (!active || !html || (Array.isArray(html) && !html.some(Boolean))) return;
          active.beats.push({ kind, group, phase, ...extra });
        };
        const watch = (object, key, after, scope = null) => {
          const original = object[key];
          if (typeof original !== 'function') throw Error('Missing density observation point ' + key);
          object[key] = function (...args) {
            const prior = phase;
            if (scope) phase = scope;
            try {
              const value = original.apply(this, args),
                dice = [_seed, _words];
              after?.(value, args);
              if (_seed !== dice[0] || _words !== dice[1]) throw Error('Density observation consumed dice: ' + key);
              return value;
            } finally {
              phase = prior;
            }
          };
          restores.push(() => {
            object[key] = original;
          });
        };
        for (let i = 0; i < NIGHT_STEPS.length; i++) {
          const step = NIGHT_STEPS[i],
            original = step[1];
          step[1] = function (...args) {
            const prior = phase;
            phase = step[0];
            try {
              return original.apply(this, args);
            } finally {
              phase = prior;
            }
          };
          restores.push(() => {
            step[1] = original;
          });
        }
        watch(window, 'nextOmen', h => beat('patron omen', 'omen', h));
        watch(NatureSigns, 'tell', (h, [channel]) => beat('nature ' + channel, 'nature', h));
        watch(window, 'yourDream', h => beat('player dream', 'clue', h));
        watch(window, 'dreadOf', h => beat('night horror', 'hazard', h));
        watch(window, 'wordsAtNight', h => beat('reading aftermath', 'consequence', h));
        watch(window, 'spiteNight', h => beat('night hazard', 'hazard', h));
        watch(window, 'riteNote', h => beat(/class="warn"/.test(h) ? 'urgent rite warning' : 'rite warning', 'consequence', h));
        watch(window, 'newsToday', h => {
          if (h) beat('world event', 'world', h.html, { id: h.id, strand: h.strand });
        });
        for (const [name, label] of [
          ['griefFor', 'grief'],
          ['visitMorning', 'guest aftermath'],
          ['deedMorning', 'deed aftermath'],
          ['deedDawn', 'deed aftermath'],
          ['diedInTentSaid', 'guest death'],
          ['strikeAtDawn', 'strike consequence'],
          ['dustAtDawn', 'weather consequence']
        ])
          watch(window, name, h => beat(label, 'consequence', h));
        for (const [name, label] of [
          ['volunteerSighting', 'volunteered sighting'],
          ['morningConfession', 'confession'],
          ['feudAgain', 'renewed feud'],
          ['complaint', 'complaint'],
          ['wayTalk', 'method allegation'],
          ['doubtTalk', 'doubt'],
          ['breakfastBlame', 'breakfast accusation'],
          ['keptSaid', 'watch report'],
          ['findsTray', 'finds tray'],
          ['answerDream', 'answer to public dream']
        ])
          watch(window, name, h => beat(label, 'clue', h));
        watch(Gossip, 'rumours', h => beat('rumour', 'clue', h));
        watch(Gossip, 'ofYou', h => beat('breakfast conversation', 'clue', h));
        watch(Gossip, 'speak', h => beat('breakfast conversation', 'clue', h));
        watch(CampInfluence, 'breakfast', h => beat('camp influence', 'clue', h));
        watch(window, 'dreamToYou', (h, [c]) => {
          if (phase === 'breakfast dreams') beat('private character dream', 'clue', true, { by: c.id });
        });
        watch(window, 'tellDream', (h, [c]) => {
          if (phase === 'breakfast dreams') beat('public character dream', 'clue', true, { by: c.id });
        });
        watch(window, 'breakfastDreams', null, 'breakfast dreams');
        for (const key of Object.keys(MORNING_EXTRAS)) watch(MORNING_EXTRAS, key, null, 'morning ' + key);
        watch(
          window,
          'theMorning',
          (m, [night]) => {
            if (!active) return;
            active.morning = true;
            active.mood = S.tenor.mood;
            active.death =
              !!night.dead || !!night.deedDead || !!(night.target && night.target !== 'player' && C(night.target).status === 'taken');
            active.attackedPlayer = night.target === 'player' && !night.quiet && !night.foiled;
            active.guest = !!S.log.visit && S.log.visit.day === S.day - 1 && S.log.visit.agreed;
            active.deed = !!S.log.deed && S.log.deed.day === S.day - 1;
          },
          'first light'
        );
        const originalResolve = resolveNight;
        window.resolveNight = function (...args) {
          if (active) throw Error('Nested night resolution');
          active = { season, background, policy: policyName, day: S.day, mood: S.tenor.mood, beats: [], route: [...route] };
          try {
            const value = originalResolve.apply(this, args),
              row = active;
            row.displayed = !!value;
            const html = value ? english(value.join('')) : '';
            row.paragraphs = (html.match(/<p(?:\s|>)/g) || []).length - (html.match(/<p class="part"/g) || []).length;
            row.words = plain(html).split(/\s+/).filter(Boolean).length;
            row.omens = row.beats.filter(b => b.group === 'omen' || b.group === 'nature').length;
            row.optional = row.beats.filter(b => ['omen', 'nature', 'world', 'hazard'].includes(b.group)).length;
            row.clues = row.beats.filter(b => b.group === 'clue').length;
            row.consequences = row.beats.filter(b => b.group === 'consequence').length;
            row.busy = !!(row.death || row.attackedPlayer || row.guest || row.deed);
            const { route: clicks, ...small } = row;
            rows.push(small);
            if (value) {
              examples.push({ ...row, text: plain(html) });
              examples.sort((a, b) => b.optional - a.optional || b.words - a.words);
              examples.length = Math.min(examples.length, 8);
            }
            return value;
          } finally {
            active = null;
          }
        };
        restores.push(() => {
          window.resolveNight = originalResolve;
        });
        const choose = (policy, s) =>
          policy === 'human' ? __T.policies.human(__T.rng(s ^ 31337)) : __observer(__T.rng(s ^ 0x9e3779b9), 'mixed', { careful: true });
        const snapshot = () => {
          const seen = new Map();
          return JSON.stringify({ state: S, dice: [_seed, _words], phase: S_ui.scene?.title, body: S_ui.scene?.body }, (key, value) => {
            if (!value || typeof value !== 'object') return value;
            if (seen.has(value)) return { reference: seen.get(value) };
            seen.set(value, seen.size);
            return value;
          });
        };
        for (const policy of policies) {
          policyName = policy;
          outcomes[policy] = {};
          for (let i = 0; i < n; i++) {
            season = (seed + Math.imul(i, 2654435761)) >>> 0;
            route = [];
            background = i % 3;
            __T.start(background, false, season);
            const policy = choose(policyName, season);
            if (
              !__T.play(
                bs => {
                  const b = policy(bs) || bs[0];
                  route.push(bs.indexOf(b));
                  return b;
                },
                { maxSteps: 1500 }
              )
            )
              throw Error('Density expedition did not finish: ' + season);
            outcomes[policyName][S.ended] = (outcomes[policyName][S.ended] || 0) + 1;
            if (i < verify) snapshots.push({ season, background: i % 3, policy: policyName, expected: snapshot() });
          }
        }
        restores.reverse().forEach(f => f());
        for (const saved of snapshots) {
          __T.start(saved.background, false, saved.season);
          if (!__T.play(choose(saved.policy, saved.season), { maxSteps: 1500 }) || snapshot() !== saved.expected)
            throw Error('Density instrumentation changed the expedition: ' + saved.policy + '/' + saved.season);
        }
        return { rows, examples, outcomes, instrumentationVerified: snapshots.length };
      },
      { n: +A.seasons, seed: +A.seed, policies, verify: Math.min(+A.verify, +A.seasons), changes: A.rules ? JSON.parse(A.rules) : null }
    );
    if (errors.length) throw Error(errors.join('\n'));
    const distribution = values => {
      const sorted = [...values].sort((a, b) => a - b),
        count = sorted.length;
      return {
        count,
        mean: count ? values.reduce((a, b) => a + b, 0) / count : 0,
        median: sorted[Math.floor(count * 0.5)] || 0,
        p90: sorted[Math.floor(count * 0.9)] || 0,
        p95: sorted[Math.floor(count * 0.95)] || 0,
        max: sorted[count - 1] || 0,
        histogram: values.reduce((out, v) => {
          out[v] = (out[v] || 0) + 1;
          return out;
        }, {})
      };
    };
    const summarize = rows => ({
      nights: rows.length,
      paragraphs: distribution(rows.map(r => r.paragraphs)),
      words: distribution(rows.map(r => r.words)),
      optional: distribution(rows.map(r => r.optional)),
      omens: distribution(rows.map(r => r.omens)),
      clues: distribution(rows.map(r => r.clues)),
      consequences: distribution(rows.map(r => r.consequences)),
      threeOrMoreOmens: rows.filter(r => r.omens >= 3).length,
      fourOrMoreOptional: rows.filter(r => r.optional >= 4).length,
      kinds: rows
        .flatMap(r => r.beats)
        .reduce((out, b) => {
          out[b.kind] = (out[b.kind] || 0) + 1;
          return out;
        }, {})
    });
    const displayed = result.rows.filter(r => r.displayed);
    result.summary = Object.fromEntries(
      policies.map(p => {
        const rows = displayed.filter(r => r.policy === p);
        return [
          p,
          {
            all: summarize(rows),
            morning: summarize(rows.filter(r => r.morning)),
            busy: summarize(rows.filter(r => r.busy)),
            quieter: summarize(rows.filter(r => !r.busy)),
            byDay: Object.fromEntries(
              [...new Set(rows.map(r => r.day))].sort((a, b) => a - b).map(day => [day, summarize(rows.filter(r => r.day === day))])
            )
          }
        ];
      })
    );
    result.artifactSha256 = crypto
      .createHash('sha256')
      .update(fs.readFileSync(A.file || FILE))
      .digest('hex');
    result.settings = { seasonsPerPolicy: +A.seasons, seed: +A.seed, policies, changes: A.rules ? JSON.parse(A.rules) : null };
    if (A.out) fs.writeFileSync(A.out, JSON.stringify(result, null, 2) + '\n');
    console.log(
      JSON.stringify(
        {
          artifactSha256: result.artifactSha256,
          settings: result.settings,
          instrumentationVerified: result.instrumentationVerified,
          outcomes: result.outcomes,
          summary: Object.fromEntries(
            Object.entries(result.summary).map(([p, s]) => [
              p,
              Object.fromEntries(
                ['all', 'busy', 'quieter'].map(k => {
                  const r = s[k];
                  return [
                    k,
                    {
                      nights: r.nights,
                      paragraphs: r.paragraphs.mean,
                      words: r.words.mean,
                      optional: r.optional.mean,
                      omens: r.omens.mean,
                      threeOrMoreOmens: r.threeOrMoreOmens,
                      fourOrMoreOptional: r.fourOrMoreOptional
                    }
                  ];
                })
              )
            ])
          )
        },
        null,
        2
      )
    );
  } finally {
    await page.close();
  }
}
main().catch(error => {
  console.error(error.stack);
  process.exitCode = 1;
});
