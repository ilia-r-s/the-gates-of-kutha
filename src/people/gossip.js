// Private words, overhearing, rumours and their routes through camp.
const Gossip = (() => {
  function deal() {
    S.rumors = [];
    S.pending = [];
  }
  const record = () => S.rumors || [];
  function toldTrue(s, { sure: sure = false, bias: bias = 0, slip: slip = null } = {}) {
    if (sure) return true;
    if (slip != null) return !chance((1 - TP(s).gossipTrue) * slip);
    return chance(TP(s).gossipTrue - RULES.gossip.likeBias * bias);
  }
  const misread = (real, invented, turned) =>
    real === null ? (chance(RULES.gossip.inventBond) ? invented() : null) : chance(RULES.gossip.flipBond) ? turned() : null;
  function temperGossip(s, g) {
    const t = Ties.pickByLike(s, g.pool, coin() ? -1 : 1),
      l = Ties.likes(s.id, t.id),
      real = Knowledge.temper(s, t).value,
      v = toldTrue(s, { sure: g.sure, bias: Math.abs(l) })
        ? real
        : pick((l < 0 || temperOf(s) === 'suspicious' ? NEG : l > 0 ? POS : TEMPER_IDS).filter(k => k !== real));
    Record.testify(s.id, t.id, 'temper', v);
    const aside = Ties.sweetOn(s.id, t.id) ? chance(RULES.flirt.aside) : Ties.mayFlirt(s, t) && chance(RULES.flirt.asideFalse);
    return { t: t, text: tellOne('said-' + v, TEMPER_SAID[v])(t) + (aside ? flirtAside(t) : '') };
  }
  const bondSay = (a, b, close) => (close ? bi(...TX.gossip.andAreThickAs(a, b)) : bi(...TX.gossip.cannotBearWatchThem(a, b)));
  function bondGossip(s, g) {
    const a = pick(g.pool),
      b = pick(g.pool.filter(o => o.id !== a.id)),
      impression = Knowledge.bond(s, a, b);
    let close = impression.value;
    if (!toldTrue(s, { sure: g.sure }))
      close = misread(
        close,
        () => coin(),
        () => !close
      );
    if (close === null) return null;
    Record.testify(s.id, a.id, 'bond', (close ? 'close:' : 'feud:') + b.id);
    return { t: a, text: bondSay(a, b, close) };
  }
  const THINKS_SAID = {
    bad: [
      (s, t) => bi(...TX.gossip.doesNotTrustYou(t)),
      (s, t) => bi(...TX.gossip.youShouldHearWhat(t)),
      (s, t) => bi(...TX.gossip.wouldBeGladTo(t))
    ],
    good: [
      (s, t) => bi(...TX.gossip.thinksTheWorldOf(t)),
      (s, t) => bi(...TX.gossip.speaksUpForYou(t)),
      (s, t) => bi(...TX.gossip.ifItComesTo(t))
    ]
  };
  const THINKS_HEARD = {
    bad: [
      (s, t) => bi(...TX.gossip.doesNotTrustThe(t)),
      (s, t) => bi(...TX.gossip.youShouldHearWhat2(t)),
      (s, t) => bi(...TX.gossip.wouldBeGladTo2(t))
    ],
    good: [
      (s, t) => bi(...TX.gossip.thinksTheWorldOf2(t)),
      (s, t) => bi(...TX.gossip.speaksUpForThe(t)),
      (s, t) => bi(...TX.gossip.ifItComesTo2(t))
    ]
  };
  function thinksGossip(s, g) {
    const t = Ties.pickByLike(s, g.pool, coin() ? -1 : 1),
      l = Ties.likes(s.id, t.id),
      real = Knowledge.opinion(s, t).value;
    let v = real;
    if (!toldTrue(s, { sure: g.sure, bias: Math.abs(l) })) {
      const lean = l > 0 ? 'good' : l < 0 || temperOf(s) === 'suspicious' ? 'bad' : null;
      v = misread(
        real,
        () => lean || pick(['good', 'bad']),
        () => lean || (real === 'good' ? 'bad' : 'good')
      );
    }
    if (!v) return null;
    Record.testify(s.id, t.id, 'thinks', v);
    return { t: t, text: tellOne(`thinks-${v}${g.heard ? '-heard' : ''}`, (g.heard ? THINKS_HEARD : THINKS_SAID)[v])(s, t) };
  }
  const VISIT_SAID = {
    bad: [
      h => bi(...TX.gossip.youHaveNotBeen(h)),
      h => bi(...TX.gossip.hardlyKnowsYouDoctor(h)),
      h => bi(...TX.gossip.peopleAreSayingDid(h))
    ],
    kind: [h => bi(...TX.gossip.goodForHerDoctor(h)), h => bi(...TX.gossip.neverMindWhatThey(h))]
  };
  const VISIT_HEARD = {
    bad: [h => bi(...TX.gossip.theDoctorHasNot(h)), h => bi(...TX.gossip.hardlyKnowsTheDoctor(h)), h => bi(...TX.gossip.didYouHearDid(h))],
    kind: [h => bi(...TX.gossip.andTheDoctorGood(h)), h => bi(...TX.gossip.letThemTalkAbout(h))]
  };
  const TALKED_OF = Decisions.define({
      id: 'gossip.visit.available',
      action: 'repeat-visit',
      authority: 'world',
      subject: (v, s) => s,
      object: v => v.id,
      knowledge: ['world: agreed visit with a recorded morning appearance', 'world: elapsed time controls rumour availability'],
      consequences: ['testimony'],
      probability: odds('the camp talks of a night in your tent', [
        ['base', () => RULES.gossip.visit.odds],
        ['* fading, each day after the first', v => RULES.gossip.visit.fade ** Math.max(0, S.day - v.day - 1)]
      ])
    }),
    TOLD_BADLY = Decisions.define({
      id: 'gossip.visit.tone',
      action: 'speak-unkindly',
      authority: 'actor',
      subject: s => s,
      object: (s, h) => h,
      knowledge: ['heard: available rumour of a morning departure', 'self: liking, attraction, player trust, temperament and vows'],
      consequences: ['testimony', 'trust'],
      probability: odds('a night in your tent, told badly', [
        ['base', () => RULES.gossip.visit.bad],
        ['+ spite, a step they dislike her', (s, h, l) => RULES.gossip.visit.spite * Math.max(0, -l)],
        ['- a friend of hers, a step they like her', (s, h, l) => RULES.gossip.visit.friend * Math.max(0, l)],
        ['+ jealous, sweet on you or on her', (s, h) => (Ties.sweetOnYou(s) || Ties.sweetOn(s.id, h.id) ? RULES.gossip.visit.jealous : 0)],
        ['+ against you, a step', (s, h, l, tr) => RULES.gossip.visit.foe * Math.max(0, -tr)],
        ['- your friend, a step past warm', (s, h, l, tr) => RULES.gossip.visit.ally * Math.max(0, tr - RULES.ties.friend)],
        ['+ prudish by temperament', s => TP(s).prude],
        ['+ a priest', s => (Ties.vowed(s) ? RULES.gossip.visit.vows : 0)],
        ['clamp', () => [RULES.scale.least, RULES.scale.most]]
      ])
    });
  function visitGossip(s, g) {
    const v = S.log && S.log.visit;
    if (!v || !v.agreed || !v.morning || !S.chars[v.id]) return null;
    const h = C(v.id);
    if (!isFree(h) || h.id === s.id || g.not.includes(h.id) || !TALKED_OF.roll(v, s)) return null;
    const bad = TOLD_BADLY.roll(s, h, Ties.likes(s.id, h.id), Ties.trust(s)),
      k = bad ? 'bad' : 'kind';
    Record.testify(s.id, h.id, 'scandal', k);
    return {
      t: h,
      text: tellOne(`visit-${k}${g.heard ? '-heard' : ''}`, (g.heard ? VISIT_HEARD : VISIT_SAID)[k])(h),
      hear: { kind: 'scandal', o: { by: s.id, about: h.id, bad: bad } }
    };
  }
  const KINDS = [
    {
      kind: 'hint',
      odds: (s, g) => (g.seen && !g.not.includes(g.seen.actor) ? RULES.thief.gossip : 0),
      say: (s, g) => thiefGossip(s, g.seen),
      last: true
    },
    { kind: 'scandal', say: visitGossip },
    { kind: 'flirt', odds: () => RULES.flirt.gossip, say: (s, g) => flirtGossip(s, g.not, g.heard) },
    { kind: 'thinks', pool: true, odds: () => RULES.gossip.you, say: thinksGossip },
    { kind: 'temper', pool: true, odds: (s, g) => (g.pool.length < 2 ? null : RULES.gossip.temper), say: temperGossip, last: true },
    { kind: 'bond', pool: true, say: bondGossip, last: true }
  ];
  function line(s, not = [], sure = false, heard = false) {
    const g = {
      not: not,
      sure: sure,
      heard: heard,
      seen: thiefSaw(s),
      pool: freeChars().filter(o => o.id !== s.id && !not.includes(o.id))
    };
    for (const K of KINDS) {
      if (K.pool && !g.pool.length) return null;
      const p = K.odds ? K.odds(s, g) : null;
      if (p != null && !chance(p)) continue;
      const said = K.say(s, g);
      if (said || K.last) return said || null;
    }
    return null;
  }
  const CHANNELS = {
    breakfast: {
      speaker: () => {
        const pool = freeChars().filter(c => chance(TP(c).gossip));
        return pool.length ? { s: pick(pool), not: [] } : null;
      },
      weighs: true,
      none: '',
      tell: (g, { s: s }, heavy) =>
        `<p class="notice">${quoted(bi(...TX.gossip.overBreakfastSaysOf(s, g)), g.text)}</p>` +
        (g.hear ? Moments.stir(g.hear.kind, { ...g.hear.o, heavy: heavy, before: true }) : '')
    },
    overheard: {
      speaker: here => {
        if (here.length < 2) return null;
        const w = {};
        here.forEach(c => {
          w[c.id] = TP(c).gossip;
        });
        const s = C(wpick(w)),
          l = pick(here.filter(o => o.id !== s.id));
        return { s: s, l: l, not: [l.id] };
      },
      weighs: true,
      heard: true,
      none: '',
      tell: (g, { s: s, l: l }, heavy) =>
        `<p class="notice">${quoted(bi(...TX.gossip.asYouGoYou(s, l)), g.text)}</p>` +
        (g.hear ? Moments.stir(g.hear.kind, { ...g.hear.o, heavy: heavy, only: [l.id] }) : '')
    },
    talk: { speaker: c => (chance(TP(c).gossip) ? { s: c, not: [] } : null), none: null, tell: g => g }
  };
  function speak(ch, ...args) {
    const K = CHANNELS[ch],
      who = K.speaker(...args);
    if (!who) return K.none;
    const heavy = K.weighs ? weighty('talk') : false,
      g = line(who.s, who.not, heavy, !!K.heard);
    if (!g) return K.none;
    if (K.weighs) stirred('talk');
    return K.tell(g, who, heavy);
  }
  const FEEL_SAY = {
    like: [(c, t) => bi(...TX.gossip.isTheOnlyOne(t, c)), (c, t) => bi(...TX.gossip.ifYouWantSense(t))],
    dislike: [(c, t) => bi(...TX.gossip.keepAwayFromMy(t)), (c, t) => bi(...TX.gossip.andIDoNot(t))],
    flirt: [(c, t) => bi(...TX.gossip.insufferableAndRatherI(t)), (c, t) => bi(...TX.gossip.isGoodCompanyThat(t))]
  };
  const FEEL_FACE = { like: ['warm', 'smile'], dislike: ['cold', 'neutral'], flirt: ['coy', 'thoughtful'] };
  const feelShows = k => ({ like: RULES.manner.warm[1], dislike: RULES.manner.cold[0], flirt: RULES.manner.flirt })[k];
  function feelRemark(c) {
    const pool = freeChars().filter(o => o.id !== c.id);
    const taken = pool.filter(o => Ties.sweetOn(c.id, o.id)),
      strong = pool.filter(o => Ties.close(c, o) || Ties.cannotBear(c, o));
    const t = taken.length && chance(RULES.flirt.feel) ? pick(taken) : strong.length ? pick(strong) : null;
    if (!t) return null;
    const own = Ties.sweetOn(c.id, t.id) ? 'flirt' : Ties.fond(c.id, t.id) ? 'like' : 'dislike',
      k = toldTrue(c, { slip: RULES.talk.feelFalse }) ? own : own === 'dislike' ? 'like' : 'dislike';
    Record.testify(c.id, t.id, 'feel', k);
    const face = chance(Math.min(RULES.scale.most, feelShows(k) * showMul(c)))
      ? k === 'flirt'
        ? flirtFace(c)
        : FEEL_FACE[k][0]
      : FEEL_FACE[k][1];
    return { text: sayPick(FEEL_SAY[k])(c, t), face: face };
  }
  const GOSSIP_YOU = { bad: TX.gossip.theDoctorBulliesPeople(), good: TX.gossip.ofAllOfUs() };
  const HEARS_TALK_OF_YOU = Decisions.define({
    id: 'gossip.player.reception',
    action: 'receive-player-rumour',
    authority: 'world',
    subject: (bad, heavy, h) => h,
    object: 'player',
    knowledge: ['heard: current public rumour from a liked speaker', 'world: the existing heavy-talk reception weight'],
    consequences: ['trust'],
    probability: odds('hears talk of you', [
      ['base', bad => (bad ? RULES.rumours.listenBad : RULES.rumours.listenGood)],
      ['* heavy talk', (bad, heavy) => (heavy ? RULES.camp.heavy : 1)],
      ['cap', () => RULES.scale.most]
    ])
  });
  function ofYou() {
    const sly = c => c.role === 'cult' && temperOf(c) === 'calculating',
      U = RULES.rumours;
    const pool = freeChars();
    if (!pool.length) return '';
    const heavy = weighty('talk');
    stirred('talk');
    const w = {};
    pool.forEach(c => {
      w[c.id] = Math.abs(c.rapport) + U.talkBase;
    });
    const s = C(wpick(w)),
      bad = Ties.against(s) ? !chance(U.flip) : Ties.cordial(s) ? chance(sly(s) ? U.slyWarm : U.flip) : sly(s) ? chance(U.slyBad) : coin(),
      said = sayPick(GOSSIP_YOU[bad ? 'bad' : 'good']),
      heard = Moments.hear(
        freeChars().filter(o => o.id !== s.id && Ties.fond(o.id, s.id)),
        () => ['trust', null, bad ? -1 : 1, HEARS_TALK_OF_YOU],
        { cap: RULES.camp.cap, rollWhenFull: false, args: h => [bad, heavy, h] }
      ).moved,
      moved = heard.length ? heard[0][3] : [];
    S.rumors.push({
      day: S.day,
      kind: bad ? 'bad' : 'good',
      by: s.id,
      heardBy: freeChars().map(c => c.id),
      up: bad ? [] : moved,
      down: bad ? moved : []
    });
    return `<p class="notice">${bi(...TX.gossip.overBreakfastYouCatch(s, said))}</p>` + (bad ? trustNote([], moved) : trustNote(moved, []));
  }
  function wordOf(c, kind, strength = 1) {
    if (S.pending && !S.pending.some(r => r.kind === kind && r.about === c.id))
      S.pending.push({ day: S.day, slot: S.slot, kind: kind, about: c.id, strength: strength });
  }
  const DEED_SAID = {
    pressed: c => __text('thatYouPressedHardA'),
    confided: c => TX.gossip.thatYouHaveTaken(c),
    visited: c => TX.gossip.thatSpentTheNight(c),
    diedInTent: c => __text('thatDiedInYourTent'),
    turnedAway: c => TX.gossip.thatYouWouldNot(c)
  };
  function deedMoves(kind, o, c, l, k = 1) {
    const U = RULES.rumours;
    if (kind === 'diedInTent') return chance(Math.min(RULES.scale.most, k * (Math.max(0, l) * U.visitFriend + U.diedAny))) ? -1 : 0;
    if (kind === 'pressed') return l >= 1 && chance(U.pressFriend * l) ? -1 : l <= -1 && chance(U.pressFoe) ? 1 : 0;
    if (kind === 'confided') return l >= 1 && chance(U.confideFriend * l) ? 1 : 0;
    if (kind === 'visited')
      return Ties.sweetOn(o.id, c.id) && chance(U.rival) ? -1 : l >= 1 && chance(U.visitFriend * l) ? pick([-1, 1]) : 0;
    return l >= 1 && chance(U.visitFriend * l) ? -1 : 0;
  }
  function rumours() {
    if (!S.pending || !S.pending.length) return '';
    const net = {},
      said = [],
      now = S.pending.slice(0, RULES.rumours.told);
    S.pending = S.pending.slice(RULES.rumours.told);
    now.forEach(r => {
      const c = C(r.about),
        up = [],
        down = [];
      Moments.hear(
        freeChars().filter(o => o.id !== c.id),
        o => {
          const d = deedMoves(r.kind, o, c, Ties.likes(o.id, c.id), r.strength || 1);
          return d ? ['trust', null, d, null] : null;
        }
      ).steps.forEach(([id, , , d]) => {
        (d > 0 ? up : down).push(id);
        net[id] = (net[id] || 0) + d;
      });
      if (!up.length && !down.length) return;
      S.rumors.push({
        day: S.day,
        kind: r.kind,
        about: r.about,
        sourceDay: r.day,
        sourceSlot: r.slot,
        heardBy: freeChars().map(actor => actor.id),
        up: up,
        down: down
      });
      said.push(DEED_SAID[r.kind](c));
    });
    const ids = Object.keys(net);
    if (!said.length) return '';
    stirred('talk', TENOR.stirs.rumour);
    return (
      `<p class="notice">${bi(...TX.gossip.wordHasGotRound(said))}</p>` +
      trustNote(
        ids.filter(id => net[id] > 0),
        ids.filter(id => net[id] < 0)
      )
    );
  }
  const told = r =>
    r.by
      ? r.kind === 'bad'
        ? bi(...TX.gossip.spokeAgainstYouAt(r))
        : bi(...TX.gossip.spokeWellOfYou(r))
      : (([en, rus]) => __text('wordGotRound'))(DEED_SAID[r.kind](C(r.about)));
  return {
    deal: deal,
    record: record,
    toldTrue: toldTrue,
    line: line,
    speak: speak,
    feelRemark: feelRemark,
    ofYou: ofYou,
    wordOf: wordOf,
    rumours: rumours,
    told: told
  };
})();
