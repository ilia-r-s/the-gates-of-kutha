// How much does what people do say about whether they are of the cult? For each thing a player can see, its rate among
// the cult and among the innocent, and the likelihood ratio (cult ÷ innocent). The design target is about 0.5–2.
// Passing measured rows is not proof about every behavior; uncertainty and insufficient coverage remain explicit.
//   node sim/tells.js                      200 seasons, every family
//   node sim/tells.js 400 --only=nights,faces --seed=7
// Families:
//   nights   each person's account of each night: company, borne out or belied, alone in camp, out alone, out where it
//            happened, would not say, named by others as their company, a sighting given (bystanders compared: the
//            Watcher keeps the camp and the thief is out on business, by design)
//   dreams   among those who say they dream: how often they tell a dream on a given day (any way: before breakfast,
//            aloud, in parting), the true Dreamer and pretenders apart
//   faces    the face in the place picture, the greeting's words and face, an answer's face, at trust 0 and 1
//   replies  actual returned reply portraits: four exclusive expression categories for each of eight public topics
//   answers  answering a dream told aloud for the one it named (people/claims.js, defenderOf), among pretenders
//   pairs    same public target/verdict or influence theme, within each initial relationship stratum
//   clock    public speech by temperament/timing and observed listener-outcome consistency
//   influence second voices, steering, doubt, recalled sources and older ways/doubts
//   pressure attacks/harm after confiding or pressing, including fatal nights
//   nature   visible luck and good/bad outcomes, per person-day and conditional on an observation
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { getHeapStatistics } = require('node:v8');
const { rateRatio, checkExit } = require('../test/lib/statistics');
const { runFast: run, openFast: open, args, FILE } = require('../test/lib/harness');
const { LIMITS, createProbe, budget } = require('../tools/resources');
const A = args({
  seed: 4242,
  only: 'nights,dreams,faces,replies,answers,pairs,clock,influence,pressure,nature',
  file: '',
  out: '',
  rules: '',
  scenarios: '',
  policy: 'human',
  batch: 1000
});
const N = +(A._[0] || 200);
const ONLY = String(A.only).split(',');

function measure([N, only, seed, rules, offset = 0, total = N, policy = 'human']) {
  const patch = (base, changes) => {
    for (const [k, v] of Object.entries(changes)) {
      if (!Object.hasOwn(base, k)) throw Error('Unknown rule override ' + k);
      if (v && typeof v === 'object' && !Array.isArray(v)) patch(base[k], v);
      else base[k] = v;
    }
  };
  if (rules) patch(RULES, JSON.parse(rules));
  window.sfx = () => {};
  window.musicChange = () => {};
  const counts = __tellCounts.collector(),
    T = counts.table,
    add = counts.add;
  const fixedRows = {
    nights: [
      'claims company',
      'company belied',
      'company borne out',
      'gave a sighting',
      'named as company',
      'alone in camp',
      'out alone',
      'out where it happened',
      'would not say'
    ],
    dreams: ['tells a dream on a day'],
    answers: ['answered a dream for the one it named (pretenders)'],
    faces: [0, 1].flatMap(rapport =>
      ['place picture smiles', 'warm greeting', 'warm face in answer'].map(name => `${name} (trust ${rapport})`)
    ),
    pairs: ['close', 'hostile', 'other'].map(tie => 'pair same target and verdict on a day (' + tie + ')'),
    clock: [
      ...TEMPER_IDS.map(temper => 'public accusation or defence per day (' + temper + ')'),
      'public words on other days',
      'public words the day after a camp event',
      'named speaker of camp rumour per day',
      'rumour changed a hearer'
    ],
    influence: [
      ...['second', 'steer', 'doubt', 'recall'].map(kind => 'camp influence ' + kind + ' per person-day'),
      ...['close', 'hostile', 'other'].map(tie => 'pair same influence target or theme (' + tie + ')'),
      'older style allegation per person-day',
      'older dream doubt per person-day',
      'named as source in a recalled rumour per day',
      'second voice targets an innocent',
      'second voice changed a hearer',
      'steers against a cult suspect',
      'steers against an innocent suspect'
    ],
    nature: [
      'nature luck observed per person-day',
      'good nature luck per person-day',
      'bad nature luck per person-day',
      'good outcome when nature luck was observed',
      'bad outcome when nature luck was observed'
    ]
  };
  for (const family of only)
    if (!(family === 'influence' && typeof CampInfluence === 'undefined') && !(family === 'nature' && typeof NatureSigns === 'undefined'))
      for (const name of fixedRows[family] || []) counts.ensure(name);
  const replies = only.includes('replies') ? __replyTells.install(counts, FACE_OF, MOODS) : null;
  let cluster;
  const isCult = c => c.role === 'cult';
  // answers to dreams told aloud, as they are given
  const answered = [],
    told = new Set(),
    jointAnswers = [],
    feuds = [];
  const td = window.tellDream;
  window.tellDream = function (c, d) {
    told.add(`${c.id}@${S.day}`);
    return td.apply(this, arguments);
  };
  const ow = window.answerWith;
  window.answerWith = function (a, d, c, forOther) {
    if (forOther) answered.push(a.id);
    return ow.apply(this, arguments);
  };
  if (only.includes('answers')) {
    for (const name of ['prior public accusation', 'no prior public accusation', 'prior public feud'])
      counts.ensure('third-party dream answer / ' + name);
    const blame = window.blameAloud,
      answer = window.answerDream;
    window.blameAloud = function (s, t, feud) {
      const html = blame.apply(this, arguments);
      if (feud && html) feuds.push({ by: s.id, about: t.id, day: S.day });
      return html;
    };
    window.answerDream = function (c, d) {
      const candidates =
          d.cult && !d.veil && isFree(d.t)
            ? freeChars()
                .filter(a => a.id !== c.id && a.id !== d.t.id && a.role !== 'seer' && claimsToDream(a))
                .map(a => ({
                  id: a.id,
                  group: isCult(a) ? 'cult' : 'innocent',
                  accused: S.said.some(w => w.by === a.id && w.about === d.t.id && w.verdict === 'cult' && w.how !== 'vote'),
                  feud:
                    feuds.some(f => f.by === a.id && f.about === d.t.id) ||
                    S.testimony.some(
                      t =>
                        t.kind === 'quarrel' && ((t.about === a.id && t.verdict === d.t.id) || (t.about === d.t.id && t.verdict === a.id))
                    )
                }))
            : [],
        before = answered.length;
      const html = answer.apply(this, arguments),
        actual = answered.slice(before);
      jointAnswers.push(...candidates.map(a => ({ ...a, defended: actual.includes(a.id) })));
      return html;
    };
  }
  if (only.includes('pairs'))
    for (const tie of ['close', 'hostile', 'other'])
      for (const kind of ['same ballot verdict', 'same separately spoken target and verdict'])
        counts.ensure('pair ' + kind + ' on a day (' + tie + ')');
  if (only.includes('influence')) {
    for (const outcome of ['persuaded a listener against its target', 'provoked visible backlash against its speaker'])
      counts.ensure('second voice ' + outcome);
    for (const kind of ['same target', 'same style']) counts.ensure('history diagnostic / successive-day influence repeats ' + kind);
  }
  const secondReactions = [];
  if (only.includes('influence') && typeof CampInfluence !== 'undefined')
    for (const name of ['breakfast', 'inquiry']) {
      const original = CampInfluence[name];
      CampInfluence[name] = function () {
        const before = CampInfluence.records().length,
          moments = (S.stirs || []).length,
          result = original.apply(this, arguments);
        for (const rec of CampInfluence.records()
          .slice(before)
          .filter(r => r.kind === 'second')) {
          const reaction = S.stirs.slice(moments).find(m => m.kind === 'blame' && m.by === rec.by && m.about === rec.about);
          if (!reaction) throw Error('A second voice has no actual public listener reaction');
          secondReactions.push({ rec, moved: reaction.moved });
        }
        return result;
      };
    }
  const contacts = [],
    nightsRun = new Set();
  if (only.includes('pressure'))
    for (const kind of ['confide', 'press'])
      for (const outcome of ['attacked', 'harmed or killed'])
        T['player ' + outcome + ' that night after ' + kind] = { totals: {}, clusters: {} };
  if (only.includes('clock'))
    for (const name of [
      'public blame changed a visible listener',
      'all public blames had the same listener outcome (at least two)',
      'public blames had varied listener outcomes (at least two)'
    ])
      T[name] = { totals: {}, clusters: {} };
  for (const kind of ['confide', 'press']) {
    const original = DIALOG[kind].run;
    DIALOG[kind].run = function (c) {
      contacts.push({ kind, day: S.day, slot: S.slot, id: c.id, group: isCult(c) ? 'cult' : 'innocent' });
      return original.apply(this, arguments);
    };
  }
  const originalNight = window.resolveNight;
  window.resolveNight = function () {
    nightsRun.add(S.day);
    return originalNight.apply(this, arguments);
  };
  for (let g = offset; g < offset + N; g++) {
    cluster = g;
    counts.cluster(cluster);
    contacts.length = 0;
    nightsRun.clear();
    answered.length = 0;
    jointAnswers.length = 0;
    feuds.length = 0;
    secondReactions.length = 0;
    told.clear();
    const season = (seed + Math.imul(g, 2654435761)) >>> 0,
      human =
        policy === 'public-inquiry'
          ? __publicInquiry(__T.rng(season ^ 31337))
          : __T.policies.human(__T.rng(season ^ 31337), /Ask where they were|Ask whom they distrust|Make conversation|Speak with/),
      days = {};
    __T.start(g % 3, false, season);
    if (
      !__T.play(human, {
        maxSteps: 1500,
        each() {
          if (days[S.day]) return;
          const alive = freeChars().map(c => c.id),
            pairs = [];
          alive.forEach((a, i) =>
            alive.slice(i + 1).forEach(b => {
              const l = Ties.likes(a, b) + Ties.likes(b, a);
              pairs.push({ a, b, tie: l >= RULES.gossip.bond ? 'close' : l <= -RULES.gossip.bond ? 'hostile' : 'other' });
            })
          );
          days[S.day] = { alive, pairs };
        }
      })
    )
      throw new Error('Tell policy stuck in season ' + season);
    if (only.includes('pairs') || only.includes('clock') || only.includes('influence') || only.includes('nature')) {
      const said = S.said || [],
        events = new Set([
          ...S.order
            .map(C)
            .filter(c => c.takenDay != null)
            .map(c => c.takenDay),
          ...(S.inquiries || []).map(x => x.day),
          ...(S.stirs || []).filter(x => x.kind === 'scandal').map(x => x.day)
        ]);
      Object.entries(days).forEach(([day, { alive, pairs }]) => {
        const d = +day,
          today = said.filter(x => x.day === d);
        if (only.includes('pairs'))
          pairs.forEach(({ a, b, tie }) => {
            const ac = isCult(C(a)),
              bc = isCult(C(b));
            if (ac !== bc) return;
            const aa = today.filter(x => x.by === a),
              bb = today.filter(x => x.by === b);
            add(
              'pair same target and verdict on a day (' + tie + ')',
              ac ? 'cult' : 'innocent',
              aa.some(x => bb.some(y => x.about === y.about && x.verdict === y.verdict))
            );
            for (const [kind, votes] of [
              ['same ballot verdict', true],
              ['same separately spoken target and verdict', false]
            ]) {
              const x = aa.filter(w => (w.how === 'vote') === votes),
                y = bb.filter(w => (w.how === 'vote') === votes);
              add(
                'pair ' + kind + ' on a day (' + tie + ')',
                ac ? 'cult' : 'innocent',
                x.some(w => y.some(v => w.about === v.about && w.verdict === v.verdict))
              );
            }
          });
        if (only.includes('influence') && typeof CampInfluence !== 'undefined') {
          const records = CampInfluence.records().filter(r => r.day === d);
          alive.forEach(id => {
            const group = isCult(C(id)) ? 'cult' : 'innocent',
              own = records.filter(r => r.by === id);
            for (const kind of ['second', 'steer', 'doubt', 'recall'])
              add(
                'camp influence ' + kind + ' per person-day',
                group,
                own.some(r => r.kind === kind)
              );
            add(
              'older style allegation per person-day',
              group,
              (S.log.ways || []).some(r => r.by === id && r.day === d)
            );
            add(
              'older dream doubt per person-day',
              group,
              (S.log.doubts || []).some(r => r.by === id && r.day === d)
            );
            add(
              'named as source in a recalled rumour per day',
              group,
              records.some(r => r.kind === 'recall' && r.source === id)
            );
            own
              .filter(r => r.kind === 'second')
              .forEach(r => {
                add('second voice targets an innocent', group, !isCult(C(r.about)));
                add('second voice changed a hearer', group, !!r.listeners?.length);
              });
            own
              .filter(r => r.kind === 'steer')
              .forEach(r => add('steers against ' + (isCult(C(r.about)) ? 'a cult suspect' : 'an innocent suspect'), group, r.support));
          });
          pairs.forEach(({ a, b, tie }) => {
            const ac = isCult(C(a)),
              bc = isCult(C(b));
            if (ac !== bc) return;
            const aa = records.filter(r => r.by === a),
              bb = records.filter(r => r.by === b);
            add(
              'pair same influence target or theme (' + tie + ')',
              ac ? 'cult' : 'innocent',
              aa.some(x => bb.some(y => x.kind === y.kind && (x.about ? x.about === y.about : x.style === y.style)))
            );
          });
        }
        if (only.includes('nature') && typeof NatureSigns !== 'undefined') {
          const luck = NatureSigns.record().filter(r => r.day === d && r.channel === 'luck');
          alive.forEach(id => {
            const group = isCult(C(id)) ? 'cult' : 'innocent',
              own = luck.filter(r => r.by === id);
            add('nature luck observed per person-day', group, own.length > 0);
            add(
              'good nature luck per person-day',
              group,
              own.some(r => r.good)
            );
            add(
              'bad nature luck per person-day',
              group,
              own.some(r => !r.good)
            );
            own.forEach(r => {
              add('good outcome when nature luck was observed', group, r.good);
              add('bad outcome when nature luck was observed', group, !r.good);
            });
          });
        }
        if (only.includes('clock'))
          alive.forEach(id => {
            const c = C(id),
              group = isCult(c) ? 'cult' : 'innocent',
              publicWords = today.filter(x => x.by === id && x.how !== 'vote');
            add('public accusation or defence per day (' + temperOf(c) + ')', group, publicWords.length > 0);
            add(
              events.has(d - 1) ? 'public words the day after a camp event' : 'public words on other days',
              group,
              publicWords.length > 0
            );
            const rumours = (S.rumors || []).filter(x => x.by === id && x.day === d);
            add('named speaker of camp rumour per day', group, rumours.length > 0);
            if (rumours.length)
              add(
                'rumour changed a hearer',
                group,
                rumours.some(x => x.up?.length || x.down?.length)
              );
          });
      });
      if (only.includes('clock')) {
        // These are the reactions printed after public accusations, not whether
        // the accusation was correct or a concealed cult plan achieved its goal.
        const blames = (S.stirs || []).filter(r => r.kind === 'blame' && r.by),
          moved = r => r.moved.some(m => m[3].length > 0);
        for (const r of blames) add('public blame changed a visible listener', isCult(C(r.by)) ? 'cult' : 'innocent', moved(r));
        for (const id of new Set(blames.map(r => r.by))) {
          const own = blames.filter(r => r.by === id);
          if (own.length < 2) continue;
          const same = own.every(r => moved(r) === moved(own[0])),
            group = isCult(C(id)) ? 'cult' : 'innocent';
          add('all public blames had the same listener outcome (at least two)', group, same);
          add('public blames had varied listener outcomes (at least two)', group, !same);
        }
      }
      if (only.includes('influence') && typeof CampInfluence !== 'undefined') {
        for (const { rec, moved } of secondReactions) {
          const group = isCult(C(rec.by)) ? 'cult' : 'innocent';
          add(
            'second voice persuaded a listener against its target',
            group,
            moved.some(([what, whom, d, ids]) => what === 'sus' && whom === rec.about && d > 0 && ids.length)
          );
          add(
            'second voice provoked visible backlash against its speaker',
            group,
            moved.some(([what, whom, d, ids]) => what === 'sus' && whom === rec.by && d > 0 && ids.length)
          );
        }
        for (const id of S.order) {
          const records = CampInfluence.records().filter(r => r.by === id),
            group = isCult(C(id)) ? 'cult' : 'innocent';
          for (let i = 1; i < records.length; i++) {
            const a = records[i - 1],
              b = records[i];
            if (b.day !== a.day + 1) continue;
            if (a.about && b.about) add('history diagnostic / successive-day influence repeats same target', group, a.about === b.about);
            if (a.style && b.style) add('history diagnostic / successive-day influence repeats same style', group, a.style === b.style);
          }
        }
      }
    }
    if (only.includes('answers'))
      for (const a of jointAnswers) {
        add('third-party dream answer / ' + (a.accused ? 'prior public accusation' : 'no prior public accusation'), a.group, a.defended);
        if (a.feud) add('third-party dream answer / prior public feud', a.group, a.defended);
      }
    if (only.includes('pressure')) {
      const distinct = new Map(contacts.map(c => [c.kind + ':' + c.day + ':' + c.id, c]));
      for (const c of distinct.values()) {
        // Include an exposure only when its following night was actually played;
        // death in that night remains an outcome, never an exclusion criterion.
        if (!nightsRun.has(c.day)) continue;
        const attacks = S.log.attacks.filter(a => a.day === c.day && !a.power),
          attacked = attacks.length > 0,
          harmed = attacks.some(
            a => a.how === 'hurt' || (a.how === 'visit' && (['you', 'both'].includes(a.k) || (!a.k && S.log.visit?.struck === 'killed')))
          );
        add('player attacked that night after ' + c.kind, c.group, attacked);
        add('player harmed or killed that night after ' + c.kind, c.group, harmed);
      }
    }
    if (only.includes('nights'))
      Object.entries(S.nights || {}).forEach(([n, rec]) => {
        if (!rec || +n === 0) return;
        Object.keys(rec.claim || {}).forEach(id => {
          const c = C(id),
            cl = rec.claim[id];
          if (cl.attacked || (typeof inYourTent === 'function' && inYourTent(id, +n))) return;
          if (c.role !== 'cult' && c.role !== 'bystander') return;
          const grp = isCult(c) ? 'cult' : 'innocent',
            other = cl.with && rec.claim[cl.with];
          add('claims company', grp, !!cl.with);
          if (cl.with) {
            add('company belied', grp, !!other && other.loc !== 'evade' && other.with !== id);
            add('company borne out', grp, !!other && other.with === id);
          }
          add('alone in camp', grp, !cl.with && cl.loc === 'camp');
          add('out alone', grp, !cl.with && cl.loc !== 'camp' && cl.loc !== 'evade');
          if (rec.crimeLoc && rec.crimeLoc !== 'camp') add('out where it happened', grp, cl.loc === rec.crimeLoc);
          add('would not say', grp, cl.loc === 'evade');
          add(
            'named as company',
            grp,
            Object.keys(rec.claim).some(k => k !== id && rec.claim[k].with === id)
          );
          add('gave a sighting', grp, !!(rec.saw && rec.saw[id]));
        });
      });
    if (only.includes('dreams'))
      S.order.map(C).forEach(c => {
        const cl = claimOf(c);
        if (!(cl.role === 'seer' || cl.was === 'seer') || cl.said == null) return;
        const grp = c.role === 'seer' ? 'true Dreamer' : isCult(c) ? 'cult' : 'innocent';
        for (let d = Math.max(1, cl.said); d <= S.day; d++) add('tells a dream on a day', grp, told.has(`${c.id}@${d}`));
      });
    if (only.includes('answers'))
      S.order.map(C).forEach(c => {
        const cl = claimOf(c);
        if (!(cl.role === 'seer' || cl.was === 'seer') || c.role === 'seer') return;
        add('answered a dream for the one it named (pretenders)', isCult(c) ? 'cult' : 'innocent', answered.includes(c.id));
      });
  }
  if (only.includes('faces')) {
    const warm = new Set(
      Object.values(GREET_WARM)
        .flat()
        .map(t => X(t))
    );
    for (let s = Math.ceil(offset / 2); s < Math.ceil((offset + N) / 2); s++) {
      cluster = total + s;
      counts.cluster(cluster);
      newGame('Marlowe', 'philologist', false, (seed + Math.imul(total + s, 2654435761)) >>> 0);
      freeChars().forEach(c =>
        [0, 1].forEach(rap => {
          c.rapport = rap;
          const grp = isCult(c) ? 'cult' : 'innocent';
          for (let d = 1; d <= 5; d++)
            for (let sl = 0; sl < 3; sl++) {
              S.day = d;
              S.slot = sl;
              const m = pictureFace(c);
              add(`place picture smiles (trust ${rap})`, grp, m === 'smile');
              delete c.greeted;
              const gr = greeting(c);
              add(`warm greeting (trust ${rap})`, grp, warm.has(X(gr.text)));
              add(`warm face in answer (trust ${rap})`, grp, ['smile', 'warm'].includes(faceFor(c, 'neutral')));
            }
        })
      );
    }
  }
  replies?.stop();
  return { counts: T, coverage: { completeSeasons: N, ...replies?.coverage } };
}

const FAMILIES = ['nights', 'dreams', 'faces', 'replies', 'answers', 'pairs', 'clock', 'influence', 'pressure', 'nature'];
const SCENARIOS = A.scenarios === 'rare' ? ['defence', 'inquiry', 'methods', 'history'] : String(A.scenarios).split(',').filter(Boolean);
if (
  !Number.isInteger(N) ||
  N < 1 ||
  !Number.isInteger(A.seed) ||
  A.seed < 0 ||
  A.seed > 0xffffffff ||
  !Number.isInteger(A.batch) ||
  A.batch < 1 ||
  A.batch > 1000 ||
  ONLY.some(x => !FAMILIES.includes(x)) ||
  SCENARIOS.some(x => !['defence', 'inquiry', 'methods', 'history', 'defence-tactic'].includes(x)) ||
  !['human', 'public-inquiry'].includes(A.policy) ||
  (SCENARIOS.length && (A.rules || A.policy !== 'human'))
)
  throw new Error('Invalid season count, unsigned 32-bit seed, or tell family');
run(async browser => {
  const artifactSha256 = createHash('sha256')
      .update(fs.readFileSync(A.file || FILE))
      .digest('hex'),
    T = {},
    coverage = {},
    examples = [],
    probe = createProbe(),
    resources = { batch: A.batch, peakHeapBytes: 0, peakRssBytes: 0 };
  const checkResources = () => {
    const p = budget(probe(), [], 1),
      memory = process.memoryUsage();
    resources.peakHeapBytes = Math.max(resources.peakHeapBytes, memory.heapUsed);
    resources.peakRssBytes = Math.max(resources.peakRssBytes, memory.rss);
    if (
      p.critical ||
      p.warning ||
      p.memory < LIMITS.nodeBytes ||
      memory.heapUsed > Math.min(getHeapStatistics().heap_size_limit * 0.7, LIMITS.nodeBytes / 2)
    )
      throw Error('Resource guard: tell study is incomplete; no passing report was written');
  };
  let available;
  for (let offset = 0; offset < N; offset += A.batch) {
    checkResources();
    const { page, errors } = await open(browser, { file: A.file, seed: A.seed, mathSeed: A.seed });
    try {
      await page.addScriptTag({ path: path.resolve(__dirname, 'lib/tell-counts.js') });
      if (!SCENARIOS.length && ONLY.includes('replies')) await page.addScriptTag({ path: path.resolve(__dirname, 'lib/reply-tells.js') });
      if (SCENARIOS.length) await page.addScriptTag({ path: path.resolve(__dirname, 'lib/tell-scenarios.js') });
      if (A.policy === 'public-inquiry') await page.addScriptTag({ path: path.resolve(__dirname, 'lib/public-inquiry.js') });
      if (A.threat) {
        const report = JSON.parse(fs.readFileSync(String(A.threat), 'utf8'));
        await page.addScriptTag({ path: path.resolve(__dirname, 'lib/threat.js') });
        await page.evaluate(model => {
          __threatStudy.install(model);
        }, report.fitted?.model || report);
      }
      available ||= await page.evaluate(() => ({
        influence: typeof CampInfluence !== 'undefined',
        nature: typeof NatureSigns !== 'undefined'
      }));
      const result = SCENARIOS.length
        ? await page.evaluate(p => __tellScenarios.measure(p), {
            n: Math.min(A.batch, N - offset),
            seed: A.seed,
            offset,
            families: SCENARIOS
          })
        : await page.evaluate(measure, [Math.min(A.batch, N - offset), ONLY, A.seed, A.rules, offset, N, A.policy]);
      for (const [k, v] of Object.entries(result.coverage)) coverage[k] = (coverage[k] || 0) + v;
      examples.push(...(result.examples || []).slice(0, Math.max(0, 20 - examples.length)));
      for (const [name, row] of Object.entries(result.counts)) {
        const t = (T[name] ||= { totals: {}, clusters: {}, method: row.method || 'cluster' });
        Object.assign(t.clusters, row.clusters);
        for (const [group, [hits, tries]] of Object.entries(row.totals)) {
          const into = (t.totals[group] ||= [0, 0]);
          into[0] += hits;
          into[1] += tries;
        }
      }
      if (errors.length) throw new Error(`${errors.length} page errors, first: ${errors[0]}`);
      if (A.progress) console.error(`measured ${Math.min(N, offset + A.batch)}/${N} seasons`);
    } finally {
      await page.close();
    }
  }
  checkResources();
  const missingFamilies = SCENARIOS.length ? [] : ['influence', 'nature'].filter(family => ONLY.includes(family) && !available[family]);
  const allRows = Object.entries(T)
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([name, t]) => ({
      name,
      ...rateRatio(
        Object.values(t.clusters).map(g => [...(g.cult || [0, 0]), ...(g.innocent || [0, 0])]),
        { comparisons: Object.keys(T).length + missingFamilies.length, method: t.method }
      ),
      dreamer: t.totals['true Dreamer'] || null
    }));
  const diagnostics = allRows
      .filter(r => r.name.startsWith('history diagnostic /'))
      .map(({ status, ...r }) => ({ ...r, interpretation: 'Descriptive multi-observation sequence; the single-tell band is not applied' })),
    rows = allRows.filter(r => !r.name.startsWith('history diagnostic /'));
  for (const family of missingFamilies)
    rows.push({
      name: family + ' (absent from this preserved artifact)',
      totals: [0, 0, 0, 0],
      ratio: NaN,
      interval: [0, Infinity],
      clusters: 0,
      eventClusters: [0, 0],
      status: 'insufficient'
    });
  const pct = ([k, n]) => (n ? `${k}/${n} (${((100 * k) / n).toFixed(1)}%)` : `${k}/${n}`),
    number = x => (Number.isNaN(x) ? 'undefined' : Number.isFinite(x) ? x.toFixed(2) : 'infinity');
  const lines = [
    `${N} fixed-seed ${SCENARIOS.length ? 'conditional scenarios' : 'seasons'} (seed ${A.seed}); cult / innocent rate ratio; fairness band 0.5–2.`,
    ...(SCENARIOS.length
      ? [
          'Conditional mechanism probabilities in constructed contexts, not whole-expedition rates. Exact Bernoulli rows use simultaneous Clopper–Pearson marginal bounds; other rows retain season clustering.'
        ]
      : ['Observable player policy: ' + A.policy]),
    ...(!SCENARIOS.length && ONLY.includes('replies')
      ? [
          'Reply rows condition on an actually answered public topic; four exclusive rendered expression categories, with the whole expedition retained as the cluster.'
        ]
      : []),
    ...(A.rules ? ['Temporary rule override: ' + A.rules] : []),
    `Bonferroni family: ${rows.length + diagnostics.length} predeclared comparisons; simultaneous 95% coverage target.`,
    'Paired-Bernoulli rows use exact marginal bounds, including zero events. Cluster rows use asymptotic season-clustered log-ratio intervals; sparse cluster rows remain insufficient with [0,infinity].',
    ''
  ];
  rows.forEach(r => {
    const [a, b, c, d] = r.totals;
    lines.push(
      `${r.name}: cult ${pct([a, b])}; innocent ${pct([c, d])}; LR ${number(r.ratio)} [${r.interval.map(number).join(', ')}]; ${r.status}; ${r.method || 'cluster'}; independent seeds ${r.clusters}; both groups present ${r.pairedClusters || 0}; event seeds ${r.eventClusters.join('/')}${r.dreamer ? '; true Dreamer ' + pct(r.dreamer) : ''}`
    );
  });
  const status = Object.fromEntries(['inside', 'outside', 'insufficient'].map(k => [k, rows.filter(r => r.status === k).length]));
  lines.push('', JSON.stringify({ seasons: N, seed: A.seed, ...status }));
  if (A.out) {
    // Keep every raw cluster without constructing a second, whole-report JSON
    // string in memory. A pressure/error abort never installs a partial report.
    const target = String(A.out),
      temporary = target + '.tmp-' + process.pid,
      finite = (_, x) => (typeof x === 'number' && !Number.isFinite(x) ? String(x) : x),
      header = {
        seasons: N,
        seed: A.seed,
        artifactSha256,
        rules: A.rules ? JSON.parse(A.rules) : null,
        families: SCENARIOS.length ? SCENARIOS : ONLY,
        design: SCENARIOS.length ? 'conditional' : 'expedition',
        policy: A.policy,
        status,
        coverage,
        examples,
        rows,
        diagnostics
      };
    let descriptor,
      owned = false;
    try {
      descriptor = fs.openSync(temporary, 'wx');
      owned = true;
      fs.writeSync(descriptor, JSON.stringify(header, finite).slice(0, -1) + ',"counts":{');
      let first = true;
      for (const [name, row] of Object.entries(T)) {
        checkResources();
        fs.writeSync(descriptor, (first ? '' : ',') + JSON.stringify(name) + ':' + JSON.stringify(row, finite));
        first = false;
      }
      fs.writeSync(descriptor, '},"resources":' + JSON.stringify(resources) + '}\n');
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.renameSync(temporary, target);
    } catch (error) {
      if (descriptor !== undefined) fs.closeSync(descriptor);
      if (owned) fs.rmSync(temporary, { force: true });
      throw error;
    }
  }
  if (A.check) process.exitCode = checkExit(rows, !!A['allow-insufficient']);
  return lines.join('\n');
});
