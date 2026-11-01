// Conditional mechanism studies, not estimates of whole-expedition prevalence.
// Every outcome uses shipped rules with unchanged probabilities. A seed is the
// cluster even when several counterfactual contexts reuse its initial world.
(function (root) {
  const DEFAULT_FAMILIES = ['defence', 'inquiry', 'methods', 'history'],
    FAMILIES = [...DEFAULT_FAMILIES, 'defence-tactic'];
  const DEFENCE_CONTEXTS = ['fond', 'public accusation stimulus, unmodified affinity', 'feud stimulus, stipulated non-fond'];
  function measure({ n, seed, offset = 0, families = DEFAULT_FAMILIES }) {
    const count = __tellCounts.collector(),
      coverage = {},
      examples = [],
      scanned = new Set(),
      add = count.add,
      seen = (key, amount = 1) => (coverage[key] = (coverage[key] || 0) + amount),
      group = c => (c.role === 'cult' ? 'cult' : 'innocent'),
      clone = () => ({ state: JSON.stringify(S), dice: [_seed, _words] }),
      restore = saved => {
        S = JSON.parse(saved.state);
        [_seed, _words] = saved.dice;
      },
      start = s => {
        newGame('Marlowe', 'philologist', false, s);
        S.day = 2;
        S.slot = 0;
        S.loc = 'camp';
        S.tenor.crowd = 0;
      },
      tie = (a, b) => {
        const v = Ties.likes(a, b) + Ties.likes(b, a);
        return v >= RULES.gossip.bond ? 'close' : v <= -RULES.gossip.bond ? 'hostile' : 'other';
      },
      example = data => {
        if (examples.filter(x => x.kind === data.kind).length < 3) examples.push(data);
      },
      inspect = (html, kind, data = null) => {
        if (!html) return;
        const bad = [];
        __T.scan(html, 'conditional ' + kind, bad, scanned);
        if (bad.length) throw Error(bad.join('\n'));
        seen('bilingual passages/' + kind);
        if (data) {
          const keep = LANG,
            text = {};
          try {
            for (const lang of ['en', 'ru']) {
              LANG = lang;
              text[lang] = X(html)
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            }
          } finally {
            LANG = keep;
          }
          example({ ...data, kind, text });
        }
      };
    // A finite family is fixed before sampling. Empty strata remain visible and
    // count toward multiplicity; batch boundaries cannot change this family.
    if (families.includes('defence'))
      for (const target of ['cult target', 'innocent target'])
        for (const context of DEFENCE_CONTEXTS) {
          const name = 'conditional dream defence / ' + target + ' / ' + context;
          count.ensure(name, 'paired-bernoulli');
          if (target === 'cult target' && context === DEFENCE_CONTEXTS[2])
            for (const temper of TEMPER_IDS) count.ensure(name + ' / ' + temper, 'paired-bernoulli');
        }
    if (families.includes('defence'))
      for (const context of ['all targets', 'cult target', 'innocent target'])
        count.ensure('conditional dream defence / actual quarrel selection / ' + context);
    if (families.includes('defence-tactic'))
      for (const pool of ['single focal', 'competing pretenders'])
        for (const target of ['cult target', 'innocent target'])
          count.ensure('conditional tactical dream defence / ' + pool + ' / ' + target, 'paired-bernoulli');
    if (families.includes('inquiry'))
      for (const target of ['cult target', 'innocent target'])
        for (const outcome of ['steering opportunity', 'granted steer supports accusation', 'granted steer opposes accusation'])
          count.ensure('conditional inquiry ' + outcome + ' / ' + target);
    if (families.includes('methods')) count.ensure('conditional method allegation / personally observed conduct');
    if (families.includes('history')) {
      for (const relationship of ['close', 'hostile', 'other'])
        count.ensure('conditional same-day second voice repeats public target / ' + relationship);
      for (const outcome of [
        'real moved listener and wrong backed vote',
        'persuaded listener and wrong backed vote',
        'backlash listener and wrong backed vote'
      ])
        count.ensure('conditional recall / ' + outcome);
      count.ensure('conditional named source / real earlier public accusation');
    }
    function defence(season, g) {
      start(season);
      const saved = clone(),
        desiredTemper = TEMPER_IDS[__T.rng(season ^ 0x71521).int(TEMPER_IDS.length)],
        cultIds = freeCult().map(c => c.id),
        ordinaryId = freeChars().find(c => c.role === 'bystander').id,
        innocentTarget = freeChars().find(c => c.role !== 'cult' && c.role !== 'seer' && c.id !== ordinaryId).id;
      for (const targetKind of ['cult target', 'innocent target'])
        for (const context of DEFENCE_CONTEXTS) {
          const name = 'conditional dream defence / ' + targetKind + ' / ' + context;
          count.ensure(name, 'paired-bernoulli');
          const byTemper = name + ' / ' + desiredTemper;
          const nonFond = context === DEFENCE_CONTEXTS[2];
          for (const faction of ['cult', 'innocent']) {
            restore(saved);
            const a = C(faction === 'cult' ? cultIds[0] : ordinaryId),
              t = C(targetKind === 'cult target' ? cultIds[1] : innocentTarget),
              c = freeChars().find(x => x.role !== 'seer' && x.id !== a.id && x.id !== t.id);
            // Temperaments are independently dealt; condition the focal actor
            // on a predeclared stratum without changing any rule probability.
            S.temper[a.id] = desiredTemper;
            for (const x of freeChars())
              Object.assign(claimOf(x), { role: x.id === a.id || x.id === c.id ? 'seer' : 'none', said: 1, recanted: null });
            a.dreamt = null;
            if (context === 'fond') S.like[a.id][t.id] = 1;
            else {
              if (nonFond) S.like[a.id][t.id] = -1;
              S.day = 1;
              S.sus[a.id][t.id] = RULES.scale.suspicion;
              inspect(blameAloud(a, t, nonFond), 'public antecedent');
              S.day = 2;
            }
            // The incoming public claim is a pretender's accusation. It need
            // not be true; no impossible true-Dreamer vision is constructed.
            Moments.dreamAloud(c.id, t.id, true);
            const publicPrior = S.said.some(w => w.by === a.id && w.about === t.id && w.day < S.day),
              eligible = Ties.fond(a, t),
              before = S.said.length;
            const html = answerDream(c, { t, cult: true });
            const defended = S.said
              .slice(before)
              .some(w => w.by === a.id && w.about === t.id && w.verdict === 'clean' && w.how === 'dream');
            if (context !== 'fond' && !publicPrior) throw Error('Defence scenario lost its public antecedent');
            add(name, faction, defended);
            if (targetKind === 'cult target' && nonFond) add(byTemper, faction, defended);
            seen('defence opportunities/' + faction);
            seen('defence eligible/' + faction, +eligible);
            inspect(
              html,
              'dream answer',
              defended && nonFond ? { season, actor: a.id, target: t.id, faction, targetKind, temper: desiredTemper } : null
            );
          }
        }
      restore(saved);
      S.day = 1;
      const quarrel = EVENT_DO.quarrel(false),
        pair = S.tenor.feud?.pair;
      inspect(quarrel, 'actual quarrel');
      seen('quarrel event contexts');
      if (!pair) return;
      const afterQuarrel = clone();
      for (const id of pair) {
        restore(afterQuarrel);
        const a = C(id),
          t = C(pair.find(x => x !== id)),
          c = freeChars().find(x => x.role !== 'seer' && x.id !== a.id && x.id !== t.id);
        if (a.role === 'seer') continue;
        S.day = 2;
        for (const x of freeChars())
          Object.assign(claimOf(x), { role: x.id === a.id || x.id === c.id ? 'seer' : 'none', said: 1, recanted: null });
        a.dreamt = null;
        const before = S.said.length;
        Moments.dreamAloud(c.id, t.id, true);
        const html = answerDream(c, { t, cult: true }),
          defended = S.said.slice(before).some(w => w.by === a.id && w.about === t.id && w.verdict === 'clean' && w.how === 'dream');
        for (const context of ['all targets', t.role === 'cult' ? 'cult target' : 'innocent target'])
          add('conditional dream defence / actual quarrel selection / ' + context, group(a), defended);
        seen('actual quarrel focal opportunities/' + group(a));
        seen('actual quarrel fond focal opportunities/' + group(a), +Ties.fond(a, t));
        inspect(
          html,
          'dream answer after actual quarrel',
          defended ? { season, actor: a.id, target: t.id, faction: group(a), fond: Ties.fond(a, t) } : null
        );
      }
    }
    function inquiry(season) {
      start(season);
      const saved = clone(),
        targets = [freeCult()[0].id, freeChars().find(c => c.role === 'bystander').id];
      for (const target of targets) {
        restore(saved);
        const t = C(target),
          context = t.role === 'cult' ? 'cult target' : 'innocent target';
        for (const c of freeChars()) c.rapport = RULES.ties.friend;
        S.slot = 2;
        const beforeCandidates = freeChars().filter(c => c.id !== target && Ties.friend(c)),
          before = CampInfluence.records().length;
        const ballot = campVote(t);
        inspect(ballot.preface, 'inquiry');
        const records = CampInfluence.records().slice(before),
          steer = records.find(r => r.kind === 'steer'),
          candidates = beforeCandidates.filter(c => !records.some(r => r.kind === 'second' && r.by === c.id));
        for (const c of candidates) {
          add('conditional inquiry steering opportunity / ' + context, group(c), steer?.by === c.id);
          if (steer?.by === c.id) {
            add('conditional inquiry granted steer supports accusation / ' + context, group(c), steer.support);
            add('conditional inquiry granted steer opposes accusation / ' + context, group(c), !steer.support);
          }
        }
        seen('inquiries');
        seen('inquiry candidates', candidates.length);
        seen('steers', +!!steer);
      }
    }
    function defenceTactic(season) {
      start(season);
      const saved = clone(),
        cults = freeCult().map(c => c.id),
        ordinary = freeChars().find(c => c.role === 'bystander').id,
        innocentTarget = freeChars().find(c => c.role !== 'cult' && c.role !== 'seer' && c.id !== ordinary).id,
        neutral = freeChars().find(c => c.role === 'seer').id,
        others = freeChars().filter(c => ![...cults, ordinary, innocentTarget, neutral].includes(c.id)),
        accuser = others[0].id,
        witness = others[1].id,
        temper = TEMPER_IDS[__T.rng(season ^ 0x655929).int(TEMPER_IDS.length)];
      for (const pool of ['single focal', 'competing pretenders'])
        for (const targetKind of ['cult target', 'innocent target'])
          for (const faction of ['cult', 'innocent']) {
            restore(saved);
            const a = C(faction === 'cult' ? cults[0] : ordinary),
              t = C(targetKind === 'cult target' ? cults[1] : innocentTarget),
              c = C(accuser),
              claimants = pool === 'single focal' ? [a] : freeChars().filter(x => x.role !== 'seer' && x.id !== c.id && x.id !== t.id);
            S.temper[a.id] = temper;
            for (const x of freeChars())
              Object.assign(claimOf(x), {
                role: x.id === c.id || claimants.some(p => p.id === x.id) ? 'seer' : 'none',
                said: 1,
                recanted: null
              });
            S.day = 1;
            for (const x of claimants) {
              S.like[x.id][t.id] = 1;
              // A supplied prior public dream is a shared, fallible claimant
              // premise. The production functions record its claim, testimony,
              // day and actual public reactions; no private plan is fabricated.
              dreamNow(x, { t: C(neutral), cult: false });
              inspect(Moments.dreamAloud(x.id, neutral, false), 'tactical prior public dream');
            }
            S.day = 2;
            inspect(blameAloud(C(witness), t), 'tactical public pressure');
            dreamNow(c, { t, cult: true });
            inspect(Moments.dreamAloud(c.id, t.id, true), 'tactical public pressure');
            if (!Ties.fond(a, t) || a.dreamt?.day !== 1 || dreamtToday(a) || !mateGamble(a, t))
              throw Error('Tactical defence lost its shared fondness, prior dream or clear public-standing premise');
            const before = S.said.length,
              html = answerDream(c, { t, cult: true }),
              defended = S.said.slice(before).some(w => w.by === a.id && w.about === t.id && w.verdict === 'clean' && w.how === 'dream');
            add('conditional tactical dream defence / ' + pool + ' / ' + targetKind, faction, defended);
            seen('tactical focal opportunities/' + faction);
            seen('tactical eligible competitors/' + pool, claimants.length - 1);
            inspect(html, 'tactical dream answer', defended ? { season, actor: a.id, target: t.id, faction, pool, temper } : null);
          }
    }
    function methods(season) {
      start(season);
      const kinds = ['examine', 'study', 'search', 'press', 'confide', 'examine', 'study', 'search', 'press', 'confide'];
      kinds.forEach((kind, i) => {
        S.day = 1 + Math.floor(i / 3);
        S.slot = i % 3;
        const at = ['examine', 'search'].includes(kind) ? 'trench' : 'camp',
          participant = ['press', 'confide'].includes(kind) ? C(S.order[i % S.order.length]) : null;
        for (const k of Object.keys(S.here)) S.here[k] = [];
        S.here[at] = [...S.order];
        S.loc = at;
        Suspicion.sawYou(kind, at, participant);
      });
      S.day = 5;
      S.slot = 0;
      const candidates = freeChars().filter(c =>
        Knowledge.styles(c, Object.keys(WAY_TALK)).some(k => k !== 'sleuth' || Knowledge.contacts(c).length)
      );
      inspect(wayTalk(), 'method allegation');
      const said = S.log.ways[0];
      for (const c of candidates) add('conditional method allegation / personally observed conduct', group(c), said?.by === c.id);
      seen('method contexts');
      seen('method eligible actors', candidates.length);
      seen('method statements', +!!said);
    }
    function history(season) {
      start(season);
      const target = freeChars().find(c => c.role === 'bystander'),
        authors = freeChars()
          .filter(c => c.id !== target.id)
          .slice(0, 3);
      // Construct a mistaken public case, not a player's hidden-answer policy.
      // Each speaker owns the suspicion they express; subsequent listener changes,
      // influence, ballots and public dismissal are all resolved by the engine.
      for (const c of freeChars()) {
        c.rapport = 1;
        S.sus[c.id][target.id] = RULES.suspects.earnest;
      }
      for (const c of authors) inspect(blameAloud(c, target), 'public antecedent');
      const before = CampInfluence.records().length,
        momentsBeforeBreakfast = S.stirs.length,
        reactions = new Map(),
        rememberReaction = (r, from) => {
          if (!r) return;
          const moment = S.stirs.slice(from).find(m => m.kind === 'blame' && m.by === r.by && m.about === r.about);
          if (!moment) throw Error('Second voice lacks its own public reaction');
          reactions.set(r, moment.moved);
        };
      inspect(brought(CampInfluence.breakfast()), 'first breakfast');
      const breakfast = CampInfluence.records()
          .slice(before)
          .find(r => r.kind === 'second'),
        pairCandidates = breakfast
          ? freeChars()
              .filter(c => c.id !== target.id && c.id !== breakfast.by)
              .map(c => ({
                id: c.id,
                by: breakfast.by,
                relationship: tie(c.id, breakfast.by),
                same: (c.role === 'cult') === (C(breakfast.by).role === 'cult')
              }))
          : [];
      rememberReaction(breakfast, momentsBeforeBreakfast);
      S.slot = 2;
      S.inquiryDone = false;
      const atInquiry = CampInfluence.records().length,
        momentsBeforeInquiry = S.stirs.length;
      accuse(target.id);
      const second = CampInfluence.records()
        .slice(atInquiry)
        .find(r => r.kind === 'second');
      rememberReaction(second, momentsBeforeInquiry);
      if (breakfast) {
        seen('breakfast seconds');
        for (const p of pairCandidates.filter(p => p.same))
          add(
            'conditional same-day second voice repeats public target / ' + p.relationship,
            group(C(p.id)),
            second?.by === p.id && second.about === breakfast.about
          );
      }
      seen('constructed histories');
      const wrong = S.log.accused.find(a => a.id === target.id && !a.right),
        vote = S.inquiries.find(v => v.id === target.id);
      if (!wrong || !vote?.passed || target.status !== 'dismissed' || S.revealed[target.id] !== 'innocent') return;
      seen('actual wrong dismissals');
      if (S.ended) {
        seen('histories ended before next breakfast');
        return;
      }
      if (!Number.isInteger(vote.saidBeforeVote)) throw Error('Recall study requires the actual pre-vote speech boundary');
      const original = CampInfluence.breakfast,
        policy = __T.policies.human(__T.rng(season ^ 0x31573));
      let reached = false;
      CampInfluence.breakfast = function () {
        if (S.day <= wrong.day || reached) return original.apply(this, arguments);
        reached = true;
        seen('histories reaching actual next breakfast');
        const records = CampInfluence.records(),
          routes = records.filter(r => r.kind === 'second' && !r.recalled && r.day < S.day && isFree(C(r.by)) && r.about === target.id),
          unused = c => !records.some(r => r.by === c.id && r.day === S.day),
          eligible = freeChars().filter(c => unused(c) && vote.back.includes(c.id) && routes.some(r => r.listeners.includes(c.id))),
          routeFor = c => routes.filter(r => r.listeners.includes(c.id)),
          sourcesFor = (c, r) => [
            r.by,
            ...freeChars()
              .filter(
                a =>
                  a.id !== c.id &&
                  a.id !== r.by &&
                  S.said
                    .slice(0, vote.saidBeforeVote)
                    .some(w => w.by === a.id && w.about === r.about && w.verdict === 'cult' && w.day <= vote.day)
              )
              .map(a => a.id)
          ],
          sources = [...new Set(eligible.flatMap(c => routeFor(c).flatMap(r => sourcesFor(c, r))))],
          moved = (c, persuasion) =>
            routeFor(c).some(r =>
              (reactions.get(r) || []).some(
                ([what, whom, d, ids]) =>
                  ids.includes(c.id) &&
                  (persuasion ? what === 'sus' && whom === r.about && d > 0 : what === 'sus' && whom === r.by && d > 0)
              )
            ),
          baseline = records.length,
          html = original.apply(this, arguments),
          recalled = records.slice(baseline).filter(r => r.kind === 'recall');
        for (const c of eligible) {
          const hit = recalled.some(r => r.by === c.id);
          add('conditional recall / real moved listener and wrong backed vote', group(c), hit);
          for (const [context, persuasion] of [
            ['persuaded', true],
            ['backlash', false]
          ])
            if (moved(c, persuasion)) add('conditional recall / ' + context + ' listener and wrong backed vote', group(c), hit);
        }
        for (const id of sources)
          add(
            'conditional named source / real earlier public accusation',
            group(C(id)),
            recalled.some(r => r.source === id)
          );
        seen('recall eligible actors', eligible.length);
        seen('source eligible actors', sources.length);
        seen('recalls', recalled.length);
        for (const r of recalled) {
          const actor = eligible.find(c => c.id === r.by),
            prior = routes.find(x => x.recalled && x.about === r.about && x.listeners.includes(r.by));
          if (!actor || !prior || !sourcesFor(actor, prior).includes(r.source) || S.day <= wrong.day)
            throw Error('Recall without a real earlier influence, backed wrong vote and eligible source');
          seen(r.source === prior.by ? 'accurate recalled sources' : 'alternative earlier recalled sources');
          inspect(html, 'recall', {
            season,
            actor: r.by,
            source: r.source,
            original: prior.by,
            about: r.about,
            day: S.day,
            voteDay: vote.day,
            saidBeforeVote: vote.saidBeforeVote
          });
        }
        if (!recalled.length) inspect(html, 'next breakfast');
        return html;
      };
      try {
        for (let i = 0; i < 40 && !S.ended && !reached; i++) {
          const buttons = __T.buttons();
          if (!buttons.length) throw Error('History lost the real night choice route');
          (policy(buttons) || buttons[0]).click();
        }
        if (!reached && !S.ended) throw Error('History did not reach the next breakfast or an ending');
        if (!reached) seen('histories ended during actual night');
      } finally {
        CampInfluence.breakfast = original;
      }
    }
    for (let g = offset; g < offset + n; g++) {
      count.cluster(g);
      const season = (seed + Math.imul(g, 2654435761)) >>> 0;
      for (const family of families) ({ defence, inquiry, methods, history, 'defence-tactic': defenceTactic })[family](season, g);
      seen('complete scenarios');
    }
    return { counts: count.table, coverage, examples };
  }
  root.__tellScenarios = { families: FAMILIES, measure };
})(globalThis);
