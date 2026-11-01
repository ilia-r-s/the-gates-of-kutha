const endTitle = id => (END_OLD[id] ? bi(ENDINGS[END_OLD[id]].title) : bi(END_TITLES[id][0], END_TITLES[id][1]));
const endNames = ids => listNames(ids.map(id => C(id).name));
const endNamesRu = (ids, k = 'n') => ru.list(ids.map(id => ru.cf(C(id), k)));
function endingId(kind, how) {
  if (kind === 'exposed') return 'unopened';
  if (kind === 'expelled') return 'truck';
  if (kind === 'triumph') return how === 'ward' ? 'sealed' : how === 'rite' ? 'banished' : 'emptied';
  if (kind === 'pyrrhic') return how === 'shoot' ? 'shot' : how === 'fire' ? 'burned' : 'scarred';
  if (kind === 'death') return S.fin ? 'fallen-below' : 'fallen-night';
  if (kind === 'madness')
    return S.fin
      ? 'counting'
      : S.hurtBy === 'study' || (S.log.studyCost >= END_SAYS.study && S.log.studyCost > S.log.horrorNerve)
        ? 'bethlem'
        : 'canal';
  return 'doom-' + S.aspectOf[S.patron];
}
function endReckon() {
  const L = S.log,
    f = S.fin;
  const cult = S.order.filter(id => C(id).role === 'cult');
  const inq = L.accused.filter(a => a.right),
    wrong = L.accused.filter(a => !a.right);
  const night = cult.filter(id => C(id).status === 'exposed' && C(id).exposedHow === 'night'),
    gate = cult.filter(id => C(id).status === 'exposed' && !inq.some(a => a.id === id) && !night.includes(id));
  const dead = S.order.filter(id => C(id).status === 'taken'),
    taken = dead.filter(id => C(id).takenBy !== 'you');
  let mR = 0,
    mW = 0;
  S.order.forEach(id => {
    const m = markOf(C(id));
    if (m === '?') return;
    if ((m === 'foe') === (C(id).role === 'cult')) mR++;
    else mW++;
  });
  const first = inq.length ? Math.min(...inq.map(a => a.day)) : null;
  const named = f ? f.named : null,
    namedOk = !!named && named === S.patron;
  const hierX = C(S.hierophant).status === 'exposed';
  const failed = f ? f.acts.filter(a => a.ok === false).length : 0;
  const friends = Ties.friendsNow().map(c => c.id),
    enemies = Ties.enemiesNow().map(c => c.id);
  const W = RULES.reckoning,
    rep = Math.max(-W.reputation, Math.min(W.reputation, friends.length - enemies.length));
  const steady = S.nerve >= Math.ceil(W.steady * S.nerveMax),
    frayed = L.minNerve <= W.frayed;
  const refused = L.refusedInq.length,
    walkout = !!S.log.walkedOut;
  const deed = L.deed && L.deed.outcome ? L.deed : null,
    blood = deed && deed.outcome === 'killed' ? deed.id : null,
    deedScore = deed ? -W.deed + (blood ? (C(blood).role === 'cult' ? W.deedCult : -W.deedInnocent) : 0) : 0;
  const score =
    W.inquiry * inq.length +
    W.gate * (gate.length + night.length) +
    (hierX ? W.hierophant : 0) -
    W.wrong * wrong.length -
    W.refused * refused -
    (walkout ? W.walkout : 0) -
    W.taken * taken.length +
    mR -
    mW +
    (named ? (namedOk ? W.named : -W.misnamed) : 0) +
    (first && first <= W.earlyDay ? W.early : 0) -
    W.wound * S.wounds +
    (steady ? 1 : 0) -
    (frayed ? 1 : 0) -
    failed +
    rep +
    (L.confess ? W.confession : 0) +
    deedScore;
  return {
    cult: cult,
    inq: inq,
    wrong: wrong,
    refused: refused,
    walkout: walkout,
    gate: gate,
    night: night,
    taken: taken,
    dead: dead,
    mR: mR,
    mW: mW,
    first: first,
    named: named,
    namedOk: namedOk,
    hierX: hierX,
    failed: failed,
    friends: friends,
    enemies: enemies,
    rep: rep,
    steady: steady,
    frayed: frayed,
    blood: blood,
    score: score
  };
}
const END_TIER = __text('END_TIER');
const endTier = (won, s, t = RULES.reckoning.tiers, blood = false) =>
  won
    ? s >= t.clean && !blood
      ? 'clean'
      : s >= t.steady && !blood
        ? 'steady'
        : s >= t.costly
          ? 'costly'
          : 'ruinous'
    : s >= t.close
      ? 'close'
      : 'far';
function endConduct(won, tier, r, id) {
  const ward = S.wardOf[S.patron],
    found = S.log.charms.includes(ward),
    done = r.cult.every(x => C(x).status !== 'present');
  return won
    ? endConductWon(tier, r, id)
    : done
      ? endConductDone(r, id)
      : tier === 'close'
        ? endConductClose(r, ward, found)
        : endConductFar(r, ward, found);
}
function endConductWon(tier, r, id) {
  const open = {
    clean: __text('itWasCleanWorkByAny'),
    steady: TX.endings.itWasNotClean(),
    costly: TX.endings.youWonAndKutha(),
    ruinous: TX.endings.itWillBeCalled()
  }[tier];
  const close = {
    clean: TX.endings.yearsLaterThePeople(),
    steady: TX.endings.theTrusteesThankYou(),
    costly: TX.endings.theTrusteesCallIt(),
    ruinous: TX.endings.theRiteWasStopped()
  }[tier];
  const t = r.dead,
    w = r.wrong.map(a => a.id);
  const dead = !t.length
    ? id === 'shot' || id === 'burned'
      ? bi(...TX.endings.apartFromTheCult())
      : bi(...TX.endings.noOneElseDied())
    : t.length === 1
      ? bi(...TX.endings.didNotLiveTo(t))
      : bi(...TX.endings.didNotLiveTo2(t));
  const refusedWrong = S.log.refusedInq.some(a => C(a.id).role !== 'cult');
  const wronged = !w.length
    ? S.log.accused.length
      ? refusedWrong
        ? bi(...TX.endings.everyoneYouSentAway())
        : __text('everyAccusationYouMadeWasTrue')
      : S.log.refusedInq.length
        ? bi(...TX.endings.theCampNeverOnce())
        : bi(...TX.endings.youNeverOnceStood())
    : w.length === 1
      ? bi(...TX.endings.leftTheDigIn(w))
      : bi(...TX.endings.leftTheDigIn2(w));
  const quick = !r.first
    ? ''
    : r.first < RULES.reckoning.earlyDay
      ? bi(...TX.endings.youHadTheFirst(r))
      : r.first > RULES.reckoning.earlyDay
        ? bi(...TX.endings.itTookYouUntil(r))
        : '';
  const camp =
    r.friends.length >= END_SAYS.friends
      ? bi(...TX.endings.byTheEndMost())
      : r.enemies.length >= END_SAYS.enemies
        ? bi(...TX.endings.byTheEndHalf())
        : '';
  return `<p>${bi(open[0], open[1])} ${quick ? quick + ' ' : ''}${dead} ${wronged} ${camp ? camp + ' ' : ''}${endBody(r)} ${bi(close[0], close[1])}</p>`;
}
function endBody(r) {
  const w = S.wounds,
    en = w === 0 ? __text('youCameOutOfItUnhurt') : w === 1 ? __text('youCameOutOfItWith') : __text('oneTwoThreeFourYouCame'),
    rus = w === 0 ? __text('unwoundedRu') : w === 1 ? __text('oneWoundRu') : __text('severalWoundsRu');
  const mind = r.steady
    ? r.frayed
      ? TX.endings.andWithYourNerve()
      : __text('andWithYourNerveWhole')
    : r.frayed
      ? TX.endings.thoughThereWasA()
      : __text('andWithYourNerveShaken');
  return bi(en + mind[0], rus + mind[1]);
}
function endConductDone(r, id) {
  const ex = r.inq.map(a => a.id).concat(r.gate, r.night),
    had = ex.length ? __text('youHadUnmaskedA') : bi(...TX.endings.noneOfThemWas()),
    then = id === 'truck' ? bi(...TX.endings.itWasTheCamp()) : bi(...TX.endings.kuthaDidTheRest());
  return `<p>${bi(...TX.endings.byTheEndThere())} ${had} ${then}</p>`;
}
function endConductClose(r, ward, found) {
  const en = [],
    rus = [],
    ex = r.inq.map(a => a.id).concat(r.gate, r.night);
  if (ex.length) {
    en.push(`unmasked ${endNames(ex)}`);
    rus.push(__text('a2'));
  }
  if (r.namedOk) {
    en.push(`named ${GODS[S.patron].name} rightly`);
    rus.push(__text('a3'));
  }
  if (found) {
    en.push(`found ${theItem(ward)}, the one charm that mattered`);
    rus.push(__text('a'));
  }
  if (r.mR >= END_SAYS.marks) {
    en.push(`marked ${r.mR} of the seven truly`);
    rus.push(__text('correctMarksRu'));
  }
  const mid = en.length ? __text('youHad') : __text('youHadComeFurtherThanMost');
  return `<p>${bi(...TX.endings.itWasCloserThan())} ${mid} ${bi(...TX.endings.oneMoreDayOne())}</p>`;
}
function endConductFar(r, ward, found) {
  const s = [];
  if (!r.inq.length && !r.gate.length && !r.night.length) s.push(bi(...TX.endings.youNeverUnmaskedAny()));
  if (r.named && !r.namedOk) s.push(bi(...TX.endings.youNamedAndIt(r)));
  if (!found) s.push(bi(...TX.endings.layAllAlong(ward)));
  if (r.wrong.length) {
    const w = r.wrong.map(a => a.id);
    s.push(bi(...TX.endings.paidForYourMistakes(w)));
  }
  if (r.taken.length >= 2) s.push(bi(...TX.endings.theNightTookWhile(r)));
  if (!s.length) s.push(bi(...TX.endings.theOddsTurnedAgainst()));
  return `<p>${__text('youWereNeverClose')} ${s.slice(0, 3).join(' ')} ${bi(...TX.endings.whateverWasUnderKutha())}</p>`;
}
const seenActs = kind => () => Suspicion.knownActs(kind);
const STYLE_FACTS = {
  press: { count: L => L.press, seen: seenActs('press') },
  accused: { count: L => L.accused.length + L.refusedInq.length, seen: true },
  distrust: { count: L => L.distrust, seen: seenActs('distrust') },
  enemies: { count: (L, r) => r.enemies.length, seen: () => enemiesSeen() },
  faced: { count: (L, r, f) => (f.g2 === 'face' ? 1 : 0) },
  shot: { count: (L, r, f, acts) => (acts.some(a => a.kind === 'shoot') ? 1 : 0) },
  rest: { count: L => L.rest, seen: seenActs('rest') },
  backDown: { count: L => L.backDown },
  slowStair: { count: (L, r, f) => (f.g1 === 'slow' ? 1 : 0) },
  unseen: { count: (L, r, f) => (f.g2 === 'listen' || f.g2 === 'blind' ? 1 : 0) },
  neverAccused: {
    count: L => (L.accused.length + L.refusedInq.length ? 0 : 1),
    seen: (L, part) => part * (L.accused.length + L.refusedInq.length ? 0 : 1)
  },
  study: { count: L => L.study, seen: seenActs('study') },
  readings: { count: L => L.readings, seen: seenActs('readings') },
  facts: { count: () => S.factKnown.length },
  rite: { count: (L, r, f, acts) => (acts.some(a => a.kind === 'rite') ? 1 : 0) },
  examine: { count: L => L.examine, seen: seenActs('examine') },
  night: { count: L => L.night, seen: seenActs('night') },
  sights: { count: () => S.sights.length },
  marksRight: { count: (L, r) => r.mR },
  diary: { count: L => L.diary || 0, seen: seenActs('diary') },
  search: { count: L => L.search, seen: seenActs('search') },
  charms: { count: L => L.charms.length, seen: seenActs('charm') },
  confide: { count: L => L.confide, seen: seenActs('confide') },
  about: { count: L => L.about, seen: seenActs('about') },
  trust: {
    count: () => S.order.reduce((s, id) => s + Math.max(0, C(id).rapport), 0),
    seen: () => freeChars().reduce((s, c) => s + closeSeen(c), 0)
  },
  friends: {
    count: (L, r) => r.friends.length,
    seen: () => freeChars().filter(c => c.role !== 'cult' && closeSeen(c) >= RULES.cunning.friend).length
  },
  confess: { count: L => L.confess, seen: true },
  went: { count: (L, r, f) => (f.took || []).length }
};
function endStyleFacts(r) {
  const f = S.fin || {},
    acts = f.acts || [],
    x = {};
  Object.entries(STYLE_FACTS).forEach(([k, t]) => {
    x[k] = t.count(S.log, r, f, acts);
  });
  return x;
}
function styleSeen(style, L, part) {
  const w = END_STYLE_W[style];
  return Object.keys(w).reduce((s, k) => {
    const t = STYLE_FACTS[k];
    return t.seen ? s + w[k] * (t.seen === true ? t.count(L) : t.seen(L, part)) : s;
  }, 0);
}
function endStyleScores(r) {
  const x = endStyleFacts(r),
    sc = {};
  Object.entries(END_STYLE_W).forEach(([style, w]) => {
    sc[style] = Object.keys(w).reduce((s, k) => s + w[k] * x[k], 0);
  });
  return sc;
}
function endStyle(r) {
  if (S.log.deed && S.log.deed.outcome === 'killed') return 'avenger';
  const sc = endStyleScores(r);
  let best = 'director',
    v = END_STYLE_MIN;
  Object.keys(END_STYLE_MU).forEach(k => {
    const z = (sc[k] - END_STYLE_MU[k]) / END_STYLE_SD[k];
    if (z > v) {
      v = z;
      best = k;
    }
  });
  return best;
}
function endExposure() {
  const L = S.log,
    f = S.fin,
    W = END_HAUNT_W;
  return (
    W.horror * (L.horror + L.dread) +
    W.studyCost * L.studyCost +
    S.factKnown.length / W.factPer +
    W.wound * L.attacks.filter(a => a.how === 'hurt').length +
    S.omenSeen.length / W.signPer +
    L.charms.length / W.charmPer +
    (f && f.g3 && f.g3.kind === 'self' ? W.self : 0) +
    (S.bg === 'occultist' ? W.occultist : 0) +
    Math.max(0, W.nerveLow - L.minNerve)
  );
}
const endHaunt = () => {
  const x = endExposure();
  return x >= END_HAUNT[1] ? 2 : x >= END_HAUNT[0] ? 1 : 0;
};
function endSeen(id) {
  try {
    const k = 'kutha.endings',
      a = JSON.parse(localStorage.getItem(k) || '[]').filter(x => END_IDS.includes(x));
    if (!a.includes(id)) a.push(id);
    localStorage.setItem(k, JSON.stringify(a));
    return a.length;
  } catch (e) {
    return null;
  }
}
function endDecide(kind, how) {
  S.endId = endingId(kind, how);
  S.ended = kind;
  S.endHow = how;
}
function ending(kind, how) {
  endDecide(kind, how);
  endShow();
}
function momentBefore(scene, kind, how) {
  endDecide(kind, how);
  momentShow(scene);
}
const momentShow = ({ kicker: kicker, title: title, body: body }) =>
  show({ kicker: kicker, title: title, body: body, choices: [{ label: __text('goOn'), fn: endShow }] });
const wonEnding = kind => kind === 'exposed' || kind === 'triumph' || kind === 'pyrrhic';
function endShow() {
  const kind = S.ended,
    how = S.endHow,
    id = S.endId;
  emit('ending-start', kind);
  S.phase = 'end';
  const won = wonEnding(kind);
  S.romance = romances();
  const r = endReckon(),
    tier = endTier(won, r.score, RULES.reckoning.tiers, !!r.blood),
    style = endStyle(r),
    asp = S.aspectOf[S.patron],
    st = END_STYLE[style],
    seen = endSeen(id);
  const mad = ['bethlem', 'canal', 'counting'].includes(id),
    haunt = mad ? 0 : endHaunt(),
    later = afterDeaths(),
    last = yourLast(won, later);
  const body = endStory(id, how);
  if (won && id !== 'burned') body.push(`<p>${bi(END_CALM[asp][0], END_CALM[asp][1])}</p>`);
  body.push(endConduct(won, tier, r, id));
  body.push(`<p>${__text('winLoseWinLose')}</p>`);
  body.push(endSelf(r, won, last, later));
  if (!won && haunt === 2) body.push(`<p class="omen">${bi(...TX.endings.byTheEndYou())}</p>`);
  if (won && haunt === 1) body.push(`<p class="omen">${bi(...TX.endings.somethingOfKuthaCame())}</p>`);
  if (won && haunt === 2) body.push(`<p class="omen">${bi(...TX.endings.somethingOfKuthaCame2())}</p>`);
  body.push(lastSaid(last));
  body.push(
    `<div class="debrief"><h3>${__text('whatBecameOfThem')}</h3>${endAfter(id, won, later)}` +
      `<h3>${__text('whatShapedThisEnding')}</h3>${endFactors(id, r, haunt, won)}` +
      `<h4>${__text('drSSeasonInNumbers')}</h4>${endNumbers(r)}` +
      (seen ? `<p class="dim">${bi(...TX.endings.endingsReachedSoFar(seen))}</p>` : '') +
      `<h3>${__text('whatWasTrue')}</h3>${endTruth()}` +
      (seedOpen ? `<p class="dim">${bi(...TX.endings.seasonTheSameCode())}</p>` : '') +
      '</div>'
  );
  const n = END_IDS.indexOf(id) + 1,
    inBed = id === 'fallen-night' && NIGHT_IN_BED.includes(nightDeath()),
    how_ = won ? (kind === 'pyrrhic' ? __text('aHardVictory') : __text('victory')) : __text('defeat');
  show({
    kicker: bi(...TX.endings.endingOf(n, how_)),
    title: endTitle(id),
    sub: __text('tierAndStyle'),
    art: inBed ? { bg: 'end', end: id, aspect: asp, time: 'dawn', inBed: true } : { bg: 'end', end: id, aspect: asp, time: END_TIME[id] },
    body: body,
    choices: [
      {
        label: __text('beginANewExpedition'),
        sub: bi(...TX.endings.newRolesNewTraits()),
        fn: () => {
          emit('expedition');
          introScene(null);
        }
      },
      ...(seedOpen
        ? [{ label: __text('playThisSeasonAgain'), sub: bi(...TX.endings.seasonTheSamePeople()), cls: 'minor', fn: replaySeason }]
        : [])
    ]
  });
  emit('ending', kind);
}
