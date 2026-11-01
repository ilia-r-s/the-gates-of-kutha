// Paired whole-expedition measurement of the approved P07 knowledge repair.
// node --max-old-space-size=512 sim/actor-knowledge.js --out=study.json --rows=seasons.json
// Frozen design: 4 observation-only policies × 1,500 fresh paired seeds; 8
// primary comparisons. Secondary supply/gate counts are descriptive, not a
// conditional-rate substitute for sim/tells.js or a cult-win label for death.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { openNode, args } = require('../test/lib/harness');
const { fingerprint } = require('../test/lib/season');
const { binomialInterval } = require('../test/lib/statistics');
const { LIMITS, createProbe, budget } = require('../tools/resources');
const POLICIES = ['human', 'careful', 'inquisitor', 'confidant'];
const PRIMARY = ['playerStoppedCult', 'riteCompleted'];
const GATES = ['dialog.slip', 'pretence.drop', 'night.dream.bring', 'night.dream.keep'];
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// Trusted evaluator only. Labels stay here; player policies receive no role,
// ritual-progress, ward or experimental evaluation input.
function batch({ from, count, seed, policy: pol, instrument = true, proof = false }) {
  const rows = [],
    gateIds = new Set(['dialog.slip', 'pretence.drop', 'night.dream.bring', 'night.dream.keep']),
    legacy = Decisions.descriptions().find(d => d.id === 'pretence.drop').authority === 'legacy',
    original = DROPS_PRETENCE.p;
  let pending = null,
    gates = {};
  const gate = (decision, role, yes) => {
    const key = decision + '/' + role,
      row = (gates[key] ||= [0, 0]);
    row[0]++;
    row[1] += Number(yes);
  };
  // The old confession rule exposed p(), then its real caller rolled chance.
  // Observe the immediately following real trace; never draw a replacement.
  if (instrument && legacy)
    DROPS_PRETENCE.p = (c, ...context) => {
      const p = original(c, ...context);
      if (pending) throw Error('An earlier confession gate was not resolved');
      if (p > 0) pending = { role: c.role };
      return p;
    };
  try {
    for (let g = from; g < from + count; g++) {
      const season = (seed + Math.imul(g, 2654435761)) >>> 0,
        rnd = __T.rng(season ^ 0x9e3779b9),
        policy = pol === 'careful' ? __observer(rnd, 'mixed', { careful: true }) : __T.policies.human(rnd, __T.LEANS[pol] || null),
        trail = [];
      gates = {};
      pending = null;
      Decisions.connect(
        instrument
          ? {
              record: raw => {
                const r = JSON.parse(raw);
                if (r.mode === 'chance' && gateIds.has(r.decision) && r.baseline > 0) gate(r.decision, C(r.subject).role, r.result);
              }
            }
          : {}
      );
      TRACE = proof || (instrument && legacy) ? [] : null;
      if (instrument && legacy)
        TRACE.push = function (event) {
          if (pending) {
            if (event[0] !== 'C') throw Error('Confession probability was not followed by its chance');
            gate('pretence.drop', pending.role, event[2]);
            pending = null;
          }
          return proof ? Array.prototype.push.call(this, event) : 0;
        };
      setLang('en');
      __T.start(g % 3, false, season);
      const ended = __T.play(
        buttons => {
          const chosen = policy(buttons) || buttons[0];
          if (proof)
            trail.push([
              S.phase,
              X([S_ui.scene.title, ...(S_ui.scene.body || [])].join('\n')),
              buttons.map(b => b.textContent),
              buttons.indexOf(chosen)
            ]);
          return chosen;
        },
        { maxSteps: 1500 }
      );
      if (!ended || pending) throw Error('Incomplete or unresolved season: ' + pol + '/' + season);
      const row = {
        seed: season,
        bg: g % 3,
        complete: true,
        ending: S.ended,
        playerStoppedCult: ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
        riteCompleted: S.ended === 'doom',
        supply: {
          brought: S.log.brought.length,
          privateDreams: S.words.filter(w => w.kind === 'dream').length,
          publicDreams: S.said.filter(w => w.how === 'dream').length,
          recantations: Object.values(S.claim).filter(c => c.recanted != null).length,
          publicConfessions: S.log.confess,
          slips: S.log.slips.length,
          clues: S.clues.length,
          facts: S.factKnown.length,
          charmsFound: S.log.charms.length,
          searches: S.log.search,
          examinations: S.log.examineOk,
          presses: S.log.presses.length,
          days: S.day
        },
        gates
      };
      if (proof) {
        const met = new Map(),
          state = JSON.stringify(S, function (_, value) {
            if (typeof value === 'string') return X(value);
            if (!value || typeof value !== 'object') return value;
            if (met.has(value)) return '#' + met.get(value);
            met.set(value, met.size);
            return value;
          });
        row.proof = { trail, state, dice: TRACE.map(d => ({ values: [...d], why: d.why || null })), seed: _seed, words: _words };
      }
      rows.push(row);
    }
    return rows;
  } finally {
    DROPS_PRETENCE.p = original;
    Decisions.connect();
    TRACE = null;
  }
}

function pairedInterval(gained, lost, n, comparisons = 8) {
  if (
    !Number.isSafeInteger(gained) ||
    !Number.isSafeInteger(lost) ||
    gained < 0 ||
    lost < 0 ||
    gained + lost > n ||
    !Number.isSafeInteger(comparisons) ||
    comparisons < 1
  )
    throw Error('Invalid paired counts or comparison family');
  const alpha = 0.05 / (2 * comparisons),
    up = binomialInterval(gained, n, alpha),
    down = binomialInterval(lost, n, alpha);
  return { difference: (gained - lost) / n, interval: [up[0] - down[1], up[1] - down[0]], gained, lost, pairs: n };
}
const sum = (target, values) => {
  for (const [key, value] of Object.entries(values)) target[key] = (target[key] || 0) + value;
};

async function study({ before, after, seasons = 1500, seed = 667819, batchSize = 24, raw = false, progress = () => {} }) {
  if (![before, after].every(f => typeof f === 'string' && fs.existsSync(f))) throw Error('Two preserved HTML artifacts are required');
  if (
    !Number.isSafeInteger(seasons) ||
    seasons < 1 ||
    seasons > 1500 ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xffffffff ||
    !Number.isInteger(batchSize) ||
    batchSize < 1 ||
    batchSize > 32
  )
    throw Error('Use 1–1500 seasons per policy, a uint32 seed and batches of1–32');
  const files = { before, after },
    hashes = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, sha(f)])),
    envs = {},
    probe = createProbe(),
    rows = [];
  const checkResources = () => {
    const p = budget(probe(), [], 1);
    if (p.critical || p.warning || p.memory < LIMITS.nodeBytes) throw Error('Resource guard: paired study is incomplete');
  };
  checkResources();
  try {
    for (const [variant, file] of Object.entries(files)) {
      envs[variant] = await openNode(null, { file });
      await envs[variant].page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
      await envs[variant].page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    }
    // Prove that gate instrumentation itself changes no state, output or die.
    let proved = 0;
    for (const env of Object.values(envs))
      for (const policy of POLICIES) {
        const a = await env.page.evaluate(batch, { from: 0, count: 2, seed: 4242, policy, instrument: false, proof: true }),
          b = await env.page.evaluate(batch, { from: 0, count: 2, seed: 4242, policy, instrument: true, proof: true });
        for (let i = 0; i < a.length; i++) {
          const difference = a[i].proof.dice.findIndex((d, j) => JSON.stringify(d) !== JSON.stringify(b[i].proof.dice[j]));
          if (difference >= 0)
            throw Error(
              'Gate instrumentation changed die ' +
                difference +
                ': ' +
                JSON.stringify({ before: a[i].proof.dice[difference], after: b[i].proof.dice[difference] })
            );
          assert.deepEqual(fingerprint(a[i].proof), fingerprint(b[i].proof), 'Gate instrumentation changed a real expedition');
          assert.deepEqual(a[i].supply, b[i].supply);
          proved++;
        }
      }
    const results = {};
    for (const policy of POLICIES) {
      const result = (results[policy] = {
        pairs: 0,
        before: { complete: 0, endings: {}, supply: {}, gates: {}, playerStoppedCult: 0, riteCompleted: 0 },
        after: { complete: 0, endings: {}, supply: {}, gates: {}, playerStoppedCult: 0, riteCompleted: 0 },
        primary: Object.fromEntries(PRIMARY.map(k => [k, { gained: 0, lost: 0 }]))
      });
      for (let from = 0; from < seasons; from += batchSize) {
        checkResources();
        const pair = {};
        for (const variant of ['before', 'after'])
          pair[variant] = await envs[variant].page.evaluate(batch, { from, count: Math.min(batchSize, seasons - from), seed, policy });
        for (let i = 0; i < pair.before.length; i++) {
          const a = pair.before[i],
            b = pair.after[i];
          assert.equal(a.seed, b.seed);
          assert.equal(a.bg, b.bg);
          result.pairs++;
          for (const [variant, r] of [
            ['before', a],
            ['after', b]
          ]) {
            const totals = result[variant];
            totals.complete += Number(r.complete);
            totals.endings[r.ending] = (totals.endings[r.ending] || 0) + 1;
            sum(totals.supply, r.supply);
            for (const [gate, counts] of Object.entries(r.gates)) {
              const target = (totals.gates[gate] ||= [0, 0]);
              target[0] += counts[0];
              target[1] += counts[1];
            }
            for (const key of PRIMARY) totals[key] += Number(r[key]);
          }
          for (const key of PRIMARY) {
            result.primary[key].gained += Number(b[key] && !a[key]);
            result.primary[key].lost += Number(!b[key] && a[key]);
          }
          if (raw) rows.push({ policy, before: a, after: b });
        }
      }
      for (const key of PRIMARY) result.primary[key] = pairedInterval(result.primary[key].gained, result.primary[key].lost, result.pairs);
      assert.equal(result.pairs, seasons);
      assert.equal(result.before.complete, seasons);
      assert.equal(result.after.complete, seasons);
      progress(policy, result.pairs);
    }
    for (const env of Object.values(envs)) assert.deepEqual(env.errors, []);
    for (const [variant, file] of Object.entries(files))
      assert.equal(sha(file), hashes[variant], 'Frozen artifact changed during the study');
    for (const variant of ['before', 'after'])
      for (const gate of GATES) {
        const opportunities = Object.values(results).reduce(
          (n, r) =>
            n +
            Object.entries(r[variant].gates)
              .filter(([key]) => key.startsWith(gate + '/'))
              .reduce((m, [, v]) => m + v[0], 0),
          0
        );
        if (!opportunities) throw Error('Missing real gate coverage: ' + variant + '/' + gate);
      }
    const output = {
      schema: 1,
      study: 'actor-knowledge',
      seed,
      seasonsPerPolicy: seasons,
      policies: POLICIES,
      files,
      hashes,
      completePairs: seasons * POLICIES.length,
      instrumentationProofs: proved,
      primaryFamily: {
        comparisons: 8,
        familyAlpha: 0.05,
        method:
          'Paired risk difference; simultaneous exact Clopper–Pearson bounds on gain-only and loss-only proportions, with Bonferroni alpha/(2*8) per marginal. Independent seed pairs; no within-pair independence assumption.'
      },
      interpretation:
        'Observed doom is ritual completion; an earlier death is not credited as cult victory. Supply and role-labelled gate opportunity/success totals are descriptive conditional measurements, not a no-single-tell certification.',
      results
    };
    if (
      Buffer.byteLength(JSON.stringify(output)) > LIMITS.outputBytes ||
      (raw && Buffer.byteLength(JSON.stringify(rows)) > LIMITS.outputBytes)
    )
      throw Error('Study data exceeded16MiB; requested output is incomplete');
    return { output, rows };
  } finally {
    for (const env of Object.values(envs)) await env.page.close();
  }
}

async function main() {
  const a = args({
    before: '.local/review/29/pre-actor-knowledge/game.html',
    after: '.local/review/29/actor-knowledge/game.html',
    seasons: 1500,
    seed: 667819,
    batch: 24,
    out: '',
    rows: ''
  });
  const { output, rows } = await study({
    before: a.before,
    after: a.after,
    seasons: a.seasons,
    seed: a.seed,
    batchSize: a.batch,
    raw: !!a.rows,
    progress: (policy, n) => console.error(policy + ': ' + n + ' complete pairs')
  });
  if (a.out) fs.writeFileSync(a.out, JSON.stringify(output, null, 2) + '\n');
  if (a.rows) fs.writeFileSync(a.rows, JSON.stringify(rows) + '\n');
  console.log(
    JSON.stringify(
      {
        hashes: output.hashes,
        completePairs: output.completePairs,
        instrumentationProofs: output.instrumentationProofs,
        primary: Object.fromEntries(Object.entries(output.results).map(([k, v]) => [k, v.primary]))
      },
      null,
      2
    )
  );
}
if (require.main === module)
  main().catch(e => {
    console.error(e.stack);
    process.exitCode = 1;
  });
module.exports = { study, pairedInterval };
