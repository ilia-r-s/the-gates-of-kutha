const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { protocol, compilePolicy, controller } = require('../sim/lib/decision-policy');
const { experiment } = require('../sim/decisions');
const example = require('../sim/policies/example.json');

const descriptions = [
  { id: 'talk', authority: 'actor', experiment: true, mode: 'chance', features: { trust: 'number', role: 'string', ally: 'boolean?' } },
  { id: 'player', authority: 'actor', experiment: true, mode: 'choice', features: { scene: 'string' } },
  { id: 'world', authority: 'world', experiment: false, mode: 'chance', features: {} },
  { id: 'legacy', authority: 'legacy', experiment: false, mode: 'chance', features: {} }
];
const contract = () => protocol(descriptions, [0.01, 0.99]);
const request = (observation = { trust: 2, role: 'ordinary', ally: null }) => ({
  schema: 1,
  mode: 'chance',
  decision: 'talk',
  subject: 'a',
  action: 'talk',
  object: 'player',
  observation,
  outcomes: ['apply', 'skip'],
  bounds: [0.01, 0.99]
});
const choice = () => ({
  schema: 1,
  mode: 'choice',
  decision: 'player',
  subject: 'player',
  action: 'choose',
  object: null,
  observation: { scene: 'A tent.' },
  choices: [
    { id: '0', label: 'Leave' },
    { id: '1', label: 'Speak' }
  ]
});
const document = tree => ({ schema: 1, kind: 'decision-tree', rules: [{ decision: 'talk', tree }] });
const proposal = p => ({ schema: 1, decision: 'talk', probability: p });
const record = (accepted = null, sequence = 0) =>
  JSON.stringify({
    schema: 1,
    mode: 'chance',
    sequence,
    decision: 'talk',
    subject: 'a',
    object: 'player',
    accepted,
    result: true,
    baseline: 0.4
  });

test('declarative policies use typed, per-decision observations and no executable values', () => {
  const c = contract(),
    policy = compilePolicy(
      document({
        if: { all: [{ field: 'trust', op: 'gte', value: 2 }, { not: { field: 'ally', op: 'eq', value: false } }] },
        then: { probability: 0.7 },
        else: { probability: 0.2 }
      }),
      c
    );
  assert.deepEqual(JSON.parse(policy(JSON.stringify(request()))), proposal(0.7));
  assert.deepEqual(JSON.parse(policy(JSON.stringify(request({ trust: -2, role: 'cult', ally: true })))), proposal(0.2));
  assert.equal(policy(JSON.stringify(choice())), null);
  for (const field of ['scene', 'seed', 'patron', 'constructor', '__proto__'])
    assert.throws(
      () => compilePolicy(document({ if: { field, op: 'eq', value: 1 }, then: { probability: 0.2 }, else: { probability: 0.4 } }), c),
      /not available/
    );
  for (const [op, value] of [
    ['contains', 2],
    ['gt', '2'],
    ['eval', 2]
  ])
    assert.throws(
      () => compilePolicy(document({ if: { field: 'trust', op, value }, then: { probability: 0.2 }, else: { probability: 0.4 } }), c),
      /typed comparison/
    );
  for (const tree of [
    { probability: Infinity },
    { probability: 0 },
    { probability: 1 },
    { probability: () => 0.4 },
    { probability: 0.5, execute: 'globalThis.secret' },
    { choice: '0' }
  ])
    assert.throws(() => compilePolicy(document(tree), c));
  for (const decision of ['world', 'legacy', 'missing'])
    assert.throws(
      () => compilePolicy({ ...document({ probability: 0.4 }), rules: [{ decision, tree: { probability: 0.4 } }] }, c),
      /no audited/
    );
});

test('policy complexity, shape, primitive types and chance bounds are enforced', () => {
  const c = contract();
  let tree = { probability: 0.4 };
  for (let i = 0; i < 13; i++) tree = { if: { field: 'trust', op: 'gt', value: 0 }, then: tree, else: { probability: 0.2 } };
  assert.throws(() => compilePolicy(document(tree), c), /depth/);
  let wide = { field: 'trust', op: 'eq', value: 0 };
  for (let i = 0; i < 3; i++) wide = { all: Array(16).fill(wide) };
  assert.throws(() => compilePolicy(document({ if: wide, then: { probability: 0.2 }, else: { probability: 0.3 } }), c), /512 nodes/);
  assert.throws(() => compilePolicy({ ...document({ probability: 0.4 }), code: 'arbitrary' }, c), /expected only/);
  assert.throws(() => compilePolicy({ ...document({ probability: 0.4 }), schema: 2 }, c), /schema/);
  assert.throws(
    () => compilePolicy({ ...document({ probability: 0.4 }), rules: Array(65).fill({ decision: 'talk', tree: { probability: 0.4 } }) }, c),
    /1–64/
  );
  const duplicate = document({ probability: 0.4 });
  duplicate.rules.push(duplicate.rules[0]);
  assert.throws(() => compilePolicy(duplicate, c), /Duplicate/);
  for (const observation of [
    { trust: 1, role: 'ordinary' },
    { trust: 1, role: 'ordinary', ally: null, private: true },
    { trust: '1', role: 'ordinary', ally: null },
    { trust: 1, role: 'ordinary', ally: 1 }
  ])
    assert.throws(() => c.request(JSON.stringify(request(observation))));
  for (const patch of [{ seed: 4242 }, { baseline: 0.8 }, { bounds: [0, 1] }, { mode: 'other' }, { subject: null }, { schema: 2 }])
    assert.throws(() => c.request(JSON.stringify({ ...request(), ...patch })));
  assert.throws(
    () => protocol([{ ...descriptions[0], features: JSON.parse('{"__proto__":"number"}') }], [0.01, 0.99]),
    /feature descriptor/
  );
});

test('choice leaves select only an offered ID, never an arbitrary action', () => {
  const c = contract(),
    doc = {
      schema: 1,
      kind: 'decision-tree',
      rules: [
        {
          decision: 'player',
          tree: { if: { field: 'scene', op: 'contains', value: 'tent' }, then: { choice: '1' }, else: { choice: '0' } }
        }
      ]
    },
    policy = compilePolicy(doc, c);
  assert.deepEqual(JSON.parse(policy(JSON.stringify(choice()))), { schema: 1, decision: 'player', choice: '1' });
  assert.throws(() => policy(JSON.stringify({ ...choice(), choices: [{ id: '0', label: 'Leave' }] })), /offered choice/);
  assert.throws(() => c.request(JSON.stringify({ ...choice(), choices: [choice().choices[0], choice().choices[0]] })), /duplicate/);
  assert.throws(() => compilePolicy({ ...doc, rules: [{ decision: 'player', tree: { probability: 0.3 } }] }, c));
});

test('shadow and replay keep actor inputs apart from privileged evaluation and do not requery', () => {
  const c = contract(),
    raw = JSON.stringify(request());
  let calls = 0;
  const policy = () => {
    calls++;
    return JSON.stringify(proposal(0.7));
  };
  const shadow = controller({ mode: 'shadow', policy, contract: c });
  assert.equal(shadow.bridge.policy(raw), null);
  shadow.bridge.record(record());
  assert.equal(shadow.finish().inputs[0].proposal.probability, 0.7);
  assert.equal(shadow.inputs[0].accepted, null);
  assert.equal(Object.hasOwn(shadow.inputs[0], 'baseline'), false);
  assert.equal(shadow.evaluation[0].baseline, 0.4);
  const applying = controller({ mode: 'distilled', policy, contract: c });
  assert.equal(applying.bridge.policy(raw), JSON.stringify(proposal(0.7)));
  applying.bridge.record(record(proposal(0.7)));
  applying.finish();
  const replay = controller({
    mode: 'replay',
    contract: c,
    replay: applying.inputs,
    policy: () => {
      throw Error('Must not requery');
    }
  });
  assert.equal(replay.bridge.policy(raw), JSON.stringify(proposal(0.7)));
  replay.bridge.record(record(proposal(0.7)));
  assert.deepEqual(replay.finish(), applying.finish());
  assert.equal(calls, 2);
  const baseline = controller({ mode: 'baseline', contract: c, policy });
  assert.equal(baseline.bridge.policy, undefined);
  baseline.bridge.record(record());
  assert.deepEqual(baseline.finish().inputs, []);
});

test('replay fails closed for changed observations, accepted responses and incomplete journals', () => {
  const c = contract(),
    saved = [{ request: request(), proposal: proposal(0.7), accepted: proposal(0.7) }];
  const fresh = () => controller({ mode: 'replay', contract: c, replay: saved });
  assert.throws(() => fresh().bridge.policy(JSON.stringify(request({ trust: 3, role: 'ordinary', ally: null }))), /diverged/);
  assert.throws(() => fresh().finish(), /prematurely/);
  const pending = fresh();
  pending.bridge.policy(JSON.stringify(request()));
  assert.throws(() => pending.finish(), /prematurely/);
  assert.throws(() => pending.bridge.record(record(proposal(0.2))), /changed inside/);
  const badSequence = fresh();
  assert.throws(() => badSequence.bridge.record(record(null, 2)), /sequence/);
  assert.throws(() => fresh().bridge.record(record(proposal(0.7))), /without an actor input/);
});

test('actual expeditions preserve shadow baselines and replay accepted chance and player-choice proposals', async () => {
  const setup = { seasons: 2, seed: 4242, opponents: ['human', 'careful'] },
    baseline = await experiment({ ...setup, mode: 'baseline' }),
    shadow = await experiment({ ...setup, mode: 'shadow', policy: example, against: baseline }),
    applied = await experiment({ ...setup, mode: 'distilled', policy: example, against: baseline }),
    replay = await experiment({ mode: 'replay', input: applied });
  assert.equal(
    Object.values(shadow.paired).reduce((n, x) => n + x.identical, 0),
    4
  );
  assert.ok(Object.values(shadow.summary).reduce((n, x) => n + x.proposals, 0) > 0);
  assert.equal(
    Object.values(shadow.summary).reduce((n, x) => n + x.accepted, 0),
    0
  );
  assert.ok(Object.values(applied.summary).reduce((n, x) => n + x.accepted, 0) > 0);
  assert.deepEqual(replay.episodes, applied.episodes);
  const chooseFirst = { schema: 1, kind: 'decision-tree', rules: [{ decision: 'player.choice', tree: { choice: '0' } }] },
    chosen = await experiment({ mode: 'distilled', seasons: 2, opponents: ['human'], policy: chooseFirst }),
    chosenReplay = await experiment({ mode: 'replay', input: chosen });
  assert.deepEqual(chosenReplay.episodes, chosen.episodes);
  const commands = chosen.episodes.flatMap(e => e.evaluation.decisions).filter(d => d.decision === 'player.choice' && d.accepted);
  assert.ok(commands.length > 50, 'No meaningful real choice coverage');
  assert.ok(
    commands.some(d => d.baseline !== d.selected),
    'The model did not change an actual offered choice'
  );
  assert.ok(chosen.episodes.every(e => e.evaluation.outcome.ended));
  assert.ok(chosen.episodes.every(e => e.inputs.every(i => !Object.hasOwn(i.request, 'seed') && !Object.hasOwn(i.request, 'baseline'))));
  const changed = structuredClone(applied);
  changed.episodes[0].inputs[0].request.observation.scene += ' changed';
  await assert.rejects(experiment({ mode: 'replay', input: changed }), /input diverged/);
  await assert.rejects(experiment({ mode: 'baseline', seasons: 1000000000 }), /256 episodes/);
  const otherArtifact = structuredClone(applied);
  otherArtifact.artifact.sha256 = 'different';
  await assert.rejects(experiment({ mode: 'replay', input: otherArtifact }), /artifact or schema/);
  await assert.rejects(experiment({ mode: 'replay', input: applied, against: otherArtifact }), /artifact or schema/);
});

test('the artifact hashed by the experiment is the artifact actually executed', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-decision-artifact-'));
  try {
    const file = path.join(dir, 'different.html');
    fs.writeFileSync(file, '<script>\nthrow Error("Selected artifact was executed");\n</script>');
    await assert.rejects(experiment({ mode: 'baseline', seasons: 1, opponents: ['human'], file }), /Selected artifact was executed/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
