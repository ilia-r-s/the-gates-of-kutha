// Local actor-policy experiments through the shipped engine's serialized bridge.
// No training, network, executable model files or changes to production rules.
// node sim/decisions.js --mode=baseline --out=baseline.json
// node sim/decisions.js --mode=shadow --policy=sim/policies/example.json --against=baseline.json --out=shadow.json
// node sim/decisions.js --mode=distilled --policy=sim/policies/example.json --against=baseline.json --out=trial.json
// node sim/decisions.js --mode=replay --input=trial.json --out=replayed.json
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { openNode, FILE, args } = require('../test/lib/harness');
const { fingerprint } = require('../test/lib/season');
const { protocol, compilePolicy, controller, canonical } = require('./lib/decision-policy');
const { LIMITS, createProbe, budget } = require('../tools/resources');

const hash = value => createHash('sha256').update(value).digest('hex');
const POLICIES = ['human', 'sleuth', 'scholar', 'quiet', 'inquisitor', 'confidant', 'delver', 'careful'];

// Only trusted validation code is installed in the VM. External policy code is
// called by connectDecisions in the host realm and receives strings, never S.
function expedition({ seed, bg, opponent, lang = 'en' }) {
  setLang(lang);
  TRACE = [];
  const rnd = __T.rng(seed ^ 0x9e3779b9),
    policy = opponent === 'careful' ? __observer(rnd, 'mixed', { careful: true }) : __T.policies.human(rnd, __T.LEANS[opponent] || null),
    trail = [];
  __T.start(bg, false, seed);
  const ended = __T.play(
    buttons => {
      const chosen = policy(buttons) || buttons[0];
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
  const met = new Map(),
    state = JSON.stringify(S, function (_, value) {
      if (typeof value === 'string') return X(value);
      if (!value || typeof value !== 'object') return value;
      if (met.has(value)) return '#' + met.get(value);
      met.set(value, met.size);
      return value;
    });
  return {
    fingerprint: { ended, trail, state, dice: TRACE.map(d => ({ values: [...d], why: d.why || null })), seed: _seed, words: _words },
    outcome: {
      ended: !!ended,
      ending: S.ended || null,
      endingId: S.endId || null,
      day: S.day,
      // A player's death is not evidence that the rite later completed.
      riteCompleted: S.ended === 'doom',
      playerStoppedCult: ['exposed', 'triumph', 'pyrrhic'].includes(S.ended),
      riteProgress: S.doom,
      riteLimit: S.doomMax,
      cultExposed: S.order.filter(id => C(id).role === 'cult' && C(id).status === 'exposed').length,
      cultFree: freeCult().length,
      wrongInquiries: S.log.accused.filter(a => !a.right).length
    }
  };
}

function summarize(episodes) {
  const by = {};
  for (const episode of episodes) {
    const r = episode.evaluation.outcome,
      b = (by[episode.opponent] ||= {
        seasons: 0,
        complete: 0,
        riteCompleted: 0,
        playerStoppedCult: 0,
        endings: {},
        actorInputs: 0,
        proposals: 0,
        accepted: 0,
        decisions: {}
      });
    b.seasons++;
    b.complete += Number(r.ended);
    b.riteCompleted += Number(r.riteCompleted);
    b.playerStoppedCult += Number(r.playerStoppedCult);
    b.endings[r.ending || 'incomplete'] = (b.endings[r.ending || 'incomplete'] || 0) + 1;
    for (const input of episode.inputs) {
      b.actorInputs++;
      b.proposals += Number(input.proposal !== null);
      b.accepted += Number(input.accepted !== null);
      const d = (b.decisions[input.request.decision] ||= { inputs: 0, proposals: 0, accepted: 0 });
      d.inputs++;
      d.proposals += Number(input.proposal !== null);
      d.accepted += Number(input.accepted !== null);
    }
  }
  return by;
}

function compare(episodes, reference, mode) {
  const prior = new Map(reference.episodes.map(e => [e.opponent + '/' + e.seed + '/' + e.bg + '/' + e.lang, e]));
  const paired = {};
  for (const episode of episodes) {
    const old = prior.get(episode.opponent + '/' + episode.seed + '/' + episode.bg + '/' + episode.lang);
    if (!old) throw Error('Comparison lacks a paired episode');
    if (mode === 'shadow') assert.deepEqual(episode.fingerprint, old.fingerprint, 'Shadow proposals changed the expedition');
    const b = (paired[episode.opponent] ||= { pairs: 0, riteGained: 0, riteLost: 0, playerWinGained: 0, playerWinLost: 0, identical: 0 }),
      now = episode.evaluation.outcome,
      before = old.evaluation.outcome;
    b.pairs++;
    b.riteGained += Number(now.riteCompleted && !before.riteCompleted);
    b.riteLost += Number(!now.riteCompleted && before.riteCompleted);
    b.playerWinGained += Number(now.playerStoppedCult && !before.playerStoppedCult);
    b.playerWinLost += Number(!now.playerStoppedCult && before.playerStoppedCult);
    b.identical += Number(canonical(episode.fingerprint) === canonical(old.fingerprint));
  }
  if (episodes.length !== reference.episodes.length) throw Error('Comparison requires the same complete episode set');
  return paired;
}

async function experiment(options = {}) {
  const {
    mode = 'baseline',
    seasons = 12,
    seed = 4242,
    opponents = ['human', 'careful'],
    policy: policyDocument = null,
    input = null,
    against = null,
    file = FILE
  } = options;
  if (!['baseline', 'shadow', 'distilled', 'replay'].includes(mode)) throw Error('Choose baseline, shadow, distilled or replay');
  if (!Number.isInteger(seasons) || seasons < 1 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Positive season count and unsigned 32-bit seed required');
  if (
    !Array.isArray(opponents) ||
    !opponents.length ||
    new Set(opponents).size !== opponents.length ||
    opponents.some(p => !POLICIES.includes(p))
  )
    throw Error('Choose distinct opponents from ' + POLICIES.join(', '));
  if (!input && seasons * opponents.length > 256) throw Error('At most 256 episodes per saved experiment; use disjoint batches');
  if ((mode === 'replay') !== !!input) throw Error('Replay requires exactly one saved experiment');
  if (mode === 'replay' && policyDocument) throw Error('Replay uses accepted records, never another policy');
  const artifact = hash(fs.readFileSync(file));
  for (const source of [input, against].filter(Boolean)) {
    if (source.schema !== 1 || source.kind !== 'decision-experiment' || source.artifact?.sha256 !== artifact)
      throw Error('Experiment artifact or schema differs; this is not an exact replay/comparison');
    if (!Array.isArray(source.episodes) || !source.episodes.length || source.episodes.length > 256)
      throw Error('Expected 1–256 saved episodes');
  }
  const { page, errors } = await openNode(null, { file });
  try {
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/solver.js') });
    await page.addScriptTag({ path: path.resolve(__dirname, '../test/lib/observer.js') });
    const meta = await page.evaluate(() => ({
        schema: Decisions.schema,
        bounds: [RULES.scale.rarest, RULES.scale.surest],
        descriptions: Decisions.descriptions()
      })),
      contract = protocol(meta.descriptions, meta.bounds),
      policy = policyDocument ? compilePolicy(policyDocument, contract) : null,
      episodes = [],
      schedule = input
        ? input.episodes.map(e => ({ seed: e.seed, bg: e.bg, opponent: e.opponent, lang: e.lang }))
        : opponents.flatMap(opponent =>
            Array.from({ length: seasons }, (_, g) => ({ seed: (seed + Math.imul(g, 2654435761)) >>> 0, bg: g % 3, opponent, lang: 'en' }))
          );
    // This is a bounded review runner, not an unbounded in-memory training store.
    // Larger evaluations should be explicitly split into disjoint seed batches.
    if (schedule.length > 256) throw Error('At most 256 episodes per saved experiment; use disjoint batches');
    const probe = createProbe();
    let retained = 0;
    if (input && canonical(input.contract) !== canonical(meta)) throw Error('Replay decision catalogue changed');
    for (let i = 0; i < schedule.length; i++) {
      const resources = budget(probe(), [], 1);
      if (resources.critical || resources.warning || resources.memory < LIMITS.nodeBytes)
        throw Error('Resource guard stopped the experiment; the requested batch is incomplete');
      const config = schedule[i],
        saved = input?.episodes[i],
        // A record-only baseline has no policy calls to replay.
        effectiveMode = mode === 'replay' && saved.inputs.length === 0 ? 'baseline' : mode,
        control = controller({ mode: effectiveMode, policy, contract, replay: saved?.inputs });
      await page.connectDecisions(control.bridge);
      const played = await page.evaluate(expedition, config),
        { inputs, evaluation } = control.finish();
      if (!played.outcome.ended) throw Error('Incomplete expedition: ' + config.opponent + '/' + config.seed);
      if (errors.length) throw Error(errors[0]);
      const episode = {
        ...config,
        inputs,
        evaluation: { decisions: evaluation, outcome: played.outcome },
        fingerprint: fingerprint(played.fingerprint)
      };
      if (saved) assert.deepEqual(episode, saved, 'Accepted-proposal replay differs at ' + config.opponent + '/' + config.seed);
      retained += Buffer.byteLength(JSON.stringify(episode));
      if (retained > LIMITS.outputBytes) throw Error('Saved episode data exceeded 16 MiB; use smaller disjoint batches');
      episodes.push(episode);
    }
    const summary = summarize(episodes);
    if (mode === 'distilled' && !Object.values(summary).some(x => x.accepted))
      throw Error('No proposal was exercised; increase coverage before evaluating this policy');
    return {
      schema: 1,
      kind: 'decision-experiment',
      mode,
      artifact: { sha256: artifact },
      contract: meta,
      policy: policyDocument
        ? { sha256: hash(canonical(policyDocument)), language: 'decision-tree', stochastic: false }
        : input?.policy || null,
      interpretation:
        'Actor inputs and privileged evaluation are separate. Rite completion is observed doom only; death is not a cult-victory label. Conditional policies are experiments, not production tuning or fairness certification.',
      summary,
      ...(against ? { paired: compare(episodes, against, mode) } : {}),
      episodes
    };
  } finally {
    await page.close();
  }
}

async function main() {
  const a = args({
    mode: 'baseline',
    seasons: 12,
    seed: 4242,
    opponents: 'human,careful',
    policy: '',
    input: '',
    against: '',
    file: FILE,
    out: ''
  });
  const read = name => {
    if (!name) return null;
    if (fs.statSync(name).size > LIMITS.outputBytes * 4) throw Error('Input exceeds the bounded experiment-file size');
    return JSON.parse(fs.readFileSync(name, 'utf8'));
  };
  const result = await experiment({
    mode: a.mode,
    seasons: a.seasons,
    seed: a.seed,
    opponents: String(a.opponents).split(','),
    policy: read(a.policy),
    input: read(a.input),
    against: read(a.against),
    file: a.file
  });
  if (a.out) fs.writeFileSync(a.out, JSON.stringify(result, null, 2) + '\n');
  console.log(
    JSON.stringify(
      { mode: result.mode, artifact: result.artifact, summary: result.summary, paired: result.paired, output: a.out || null },
      null,
      2
    )
  );
}
if (require.main === module)
  main().catch(e => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { experiment, expedition };
