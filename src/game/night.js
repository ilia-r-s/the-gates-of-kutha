// game/night.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function nightfall() {
  emit('nightfall');
  if (S.day >= RULES.start.days) {
    finaleIntro(false);
    return;
  }
  if (S.doom >= S.doomMax) {
    finaleIntro(true);
    return;
  }
  const her = visitTonight();
  if (her) visitScene(her);
  else nightComes();
}
function nightComes() {
  S.phase = 'night';
  const n = S.day,
    out = resolveNight();
  if (S.ended || !out) return;
  const early = S.doom >= S.doomMax;
  show({
    kicker: early ? __text('nightBeforeDawn') : __text('nightDawnOfDay'),
    title: early ? __text('theGateIsOpening') : __text('nightAndMorning'),
    body: out,
    choices: [
      {
        label: early ? __text('goToTheZiggurat') : __text('beginDay'),
        cls: early ? 'danger' : '',
        fn: early ? () => finaleIntro(true) : startDay
      }
    ]
  });
}
function resolveNight() {
  const night = theNight();
  if (checkEnd()) return null;
  const parts = [[__text('inTheNight'), night.out]];
  if (night.unmasked && !freeCult().length && !S.ended) {
    lastOfThem(__text('nightBeforeDawn2'), partsTold(parts), C(night.unmasked), 'night');
    return null;
  }
  if (S.doom < S.doomMax) {
    const turn = dawn(night),
      found = toldAtFirstLight(night.found),
      after = visitMorning(night),
      m = theMorning(night),
      morning = [
        [__text('atFirstLight'), [after, ...found, diedInTentSaid(), m.grief, turn, ...m.first]],
        [__text('atBreakfast'), m.breakfast]
      ];
    if (S.ended === 'expelled') {
      momentShow({ kicker: bi(...TX.night.nightDawnOfDay()), title: __text('nightAndMorning2'), body: partsTold(parts.concat(morning)) });
      return null;
    }
    if (checkEnd()) return null;
    parts.push(...morning, [__text('theDaySNews'), m.news]);
  } else parts.push([__text('beforeDawn'), toldAtFirstLight(night.found)]);
  return partsTold(parts);
}
const firstLight = tell => ({ tell: tell }),
  toldAtFirstLight = found => found.map(f => (f && f.tell ? f.tell() : f));
const partsTold = parts =>
  parts.flatMap(([head, lines]) => {
    const said = lines.filter(Boolean);
    return said.length ? [`<p class="part">${head}</p>`, ...said] : [];
  });
const tookSomeone = night =>
  !!night.dead || !!night.deedDead || (!!night.target && night.target !== 'player' && C(night.target).status === 'taken');
function dawn(night) {
  S.day++;
  S.slot = 0;
  S.inquiryDone = false;
  coolOff();
  Ties.easeHounding();
  return driftTenor() + relentAtDawn(tookSomeone(night));
}
function startDay() {
  startSlot();
  emit('dawn');
}
function theNight() {
  const night = nightFalls();
  NIGHT_STEPS.some(([, step]) => step(night) === true);
  return night;
}
function nightFalls() {
  const sworn = Watch.promises();
  return {
    out: [tenorNight()],
    found: [],
    cult: freeCult(),
    npcs: freeChars().filter(c => c.role !== 'cult'),
    sworn: sworn,
    falseGuards: sworn.filter(id => C(id).role === 'cult'),
    smugOut: sworn.some(id => C(id).role === 'smuggler')
  };
}
const NIGHT_STEPS = [
  ['whom it comes for, and who watches', nightChooses],
  ['your dream', night => void night.out.push(yourDream(night))],
  [
    'the one in your tent',
    night => {
      if (!night.quiet) night.out.push(guestStrikes(night));
      return S.wounds >= S.woundsMax;
    }
  ],
  ['who is left', nightRecounts],
  ['the attack', nightStrikes],
  [
    'the small hours',
    night => {
      guestAccount(night);
      night.out.push(deedNight(night));
    }
  ],
  [
    'the night’s dreams',
    night => {
      night.vision = dreamsOfTheNight(S.day);
    }
  ],
  [
    'a quiet night',
    night => {
      if (night.quiet || night.foiled) night.found.unshift(quietSaid());
    }
  ],
  ['the rite grows', riteGrows],
  ['what more the night holds', nightHolds],
  ['the circle', night => void night.found.push(riteNote())]
];
function nightChooses(night) {
  const N = RULES.night;
  night.guest = visitGuest();
  night.power = !night.cult.length && chance(N.priestless);
  night.quiet = !night.power && (!night.cult.length || Parts.of('cult').lieLow(night));
  night.target = night.quiet ? null : Parts.of('cult').victim(night);
  if (night.power && night.target !== 'player')
    night.why = {
      kind: 'power'
    };
  const others = night.npcs.filter(c => c !== night.guest);
  if (night.target === 'player' && night.guest) {
    if (others.length && chance(RULES.visit.spares)) {
      night.target = wpick(victimWeights(others));
      night.why = victimWhy(C(night.target), night.cult);
      S.log.visit.spared = night.target;
    } else if (night.guest.role === 'cult' && night.cult.length === 1) {
      night.power = true;
      night.why = { kind: 'power' };
    }
  }
  if (night.target && night.target !== 'player') night.falseGuards.forEach(id => S.log.keptWatch.push({ day: S.day, id: id }));
  night.watcher = night.npcs.find(c => c.role === 'warden');
  night.guard = night.watcher ? Parts.of('warden').watch(night) : null;
  Watch.release();
  night.seer = night.npcs.find(c => c.role === 'seer');
  night.loc = wpick(N.where);
  night.deed = deedTonight();
}
function nightRecounts(night) {
  night.cult = freeCult();
  if (night.unmasked && !night.cult.length) return true;
  if (night.target && night.target !== 'player' && !isFree(C(night.target))) {
    night.target = null;
    night.foiled = true;
  }
}
function nightStrikes(night) {
  const out = night.out;
  if (night.quiet || night.foiled) quietNight(night);
  else if (night.target === 'player' && night.deed) {
    night.loc = 'camp';
    if (Watch.holds(night, 'player')) {
      night.youOut = 'guarded';
      S.log.attacks.push({ day: S.day, how: 'guard', out: true, power: !!night.power });
    } else {
      night.youOut = true;
      S.log.attacks.push({ day: S.day, how: 'out', power: !!night.power });
    }
    night.found.push(leaveTrace(night));
    if (night.youOut === true && night.guard !== 'player') night.sworn.forEach(id => night.found.push(firstLight(() => failedWatch(id))));
  } else if (night.target === 'player') {
    night.loc = 'camp';
    out.push(attackOnYou(night));
    if (S.wounds >= S.woundsMax) return true;
    night.found.push(leaveTrace(night));
    if (night.guard !== 'player')
      night.sworn.filter(id => !inYourTent(id)).forEach(id => night.found.push(firstLight(() => failedWatch(id))));
  } else if (night.guest && night.target === night.guest.id) {
    night.loc = 'camp';
    out.push(herNight(night));
    night.found.push(leaveTrace(night));
  } else night.found.push(attackOnThem(night), leaveTrace(night));
}
function riteGrows() {
  const idle = 1 + RULES.adapt.idleRite * (cultTurns('quiet') - 1);
  freeCult().forEach(() => {
    S.doom += vary(RULES.night.rite * idle);
  });
}
function nightHolds(night) {
  const N = RULES.night,
    calm = night.target === 'player' ? N.calm : 1,
    dread = dreadNight(calm),
    words = wordsAtNight();
  night.out.push(dread, words, spiteNight(calm * (dread && words ? N.calm : 1), night.deed));
}
function quietNight(night) {
  S.crime = null;
  if (night.cult.length && !night.foiled) {
    S.log.quiet.push(S.day);
    if (night.low) S.log.low[S.day] = night.low;
  }
  planAlibis(S.day, null, null);
}
function quietSaid() {
  const d = S.log.deed,
    v = S.log.visit;
  if ((d && d.day === S.day && d.outcome && d.outcome !== 'away') || (v && v.day === S.day && v.struck === 'failed')) return '';
  return bi(...TX.night.nothingComesInThe());
}
function theMorning(night) {
  S.tenor.crowd = 0;
  cornerClaims();
  const v0 = night.target && night.target !== 'player' && C(night.target),
    victim = night.dead || (v0 && v0.status === 'taken' && v0.takenBy !== 'you' ? v0.id : null),
    m = {
      grief: (victim ? griefFor(victim) : '') + (night.deedDead ? griefFor(night.deedDead) : ''),
      first: [chance(RULES.night.dawnSign) ? omenP(nextOmen()) : ''],
      breakfast: [S.log.deed && S.log.deed.day === S.day - 1 ? deedMorning() : deedDawn()],
      news: []
    };
  if (S.ended) return m;
  const order = Object.keys(MORNING_EXTRAS),
    first = order.filter(k => TENOR.moods[S.tenor.mood][k] > 1);
  first.concat(order.filter(k => !first.includes(k))).forEach(k => MORNING_EXTRAS[k](m, night, victim));
  return m;
}
const MORNING_EXTRAS = {
  dread: m =>
    m.first.push(
      S.omenSeen.length < 4 && chance(room('dread') * TENOR.omen * Math.max(TENOR.floor, rateOf('dread') - 1))
        ? brought(omenP(nextOmen()))
        : ''
    ),
  finds: m => m.news.unshift(findsTray()),
  talk: (m, night, victim) => m.breakfast.push(keptSaid(night) + breakfastDreams(night).join('') + socialMorning(victim)),
  news: m => m.news.push(morningEvent())
};
function chooseVictim(night) {
  const N = RULES.night,
    { cult: cult, npcs: npcs } = night,
    holds = night.falseGuards.length ? 1 - N.holds : 1;
  if (Suspicion.cultAlerted() && chance(N.alerted * holds)) return 'player';
  if (cult.some(k => Ties.against(k)) && chance(N.enemy * holds * cultTurns('inquisitor'))) return 'player';
  if (chance((N.you + N.youDay * (S.day - 1)) * Math.max(cultTurns('scholar'), cultTurns('delver')))) return 'player';
  const b = betrayal(cult);
  if (b) {
    night.betrayer = b.killer.id;
    night.why = { kind: 'betrayal' };
    return b.victim.id;
  }
  const dr = meetDreamer(night);
  if (dr) {
    night.why = dr.why;
    return dr.id;
  }
  const named = c => Suspicion.accusations(c).filter(x => isFree(C(x.about)) && C(x.about).role !== 'cult'),
    accuser = pick(npcs.filter(c => named(c).length));
  if (accuser && cult.length && chance(N.frame * Math.max(...cult.map(k => craft(k).plant)))) {
    night.why = { kind: 'frame', of: named(accuser).pop().about };
    return accuser.id;
  }
  if (!npcs.length) return 'player';
  const t = wpick(victimWeights(npcs));
  night.why = victimWhy(C(t), cult);
  return t;
}
function victimWhy(v, cult) {
  const k = cult.filter(c => Ties.dislikes(c.id, v.id)).sort((a, b) => Ties.likes(a.id, v.id) - Ties.likes(b.id, v.id))[0];
  if (k) return { kind: Ties.cannotBear(k.id, v.id) ? 'cannotBear' : 'dislike', by: k.id };
  const s = Suspicion.threat.suspects(v, cult);
  if (s) return { kind: 'suspects', of: s.id };
  return Ties.friend(v) ? { kind: 'stood' } : { kind: 'none' };
}
function dreamsOfTheNight(day) {
  let vision = null;
  freeChars().forEach(c => {
    const own = c.role === 'seer';
    if ((!own && !claimsToDream(c)) || chance(RULES.night.dreamless)) return;
    if (own) vision = dreamTonight(c);
    else c.dreams.push({ night: day, d: null });
  });
  return vision;
}
const veiled = () => (chance(RULES.night.veiled) ? pick(CATS) : null);
function dreamTonight(seer) {
  const cand = freeChars().filter(c => c.id !== seer.id && !seer.visions.some(v => v.about === c.id));
  if (!cand.length) return null;
  const t = pick(cand),
    clear = chance(RULES.night.dreamTrue),
    dark = clear && t.role === 'smuggler' && chance(RULES.night.thiefDark),
    veil = veiled(),
    vision = {
      about: t.id,
      cult: dark || (t.role === 'cult') === clear,
      ...(clear ? {} : { muddied: true }),
      ...(dark ? { dark: dark } : {}),
      ...(veil ? { veil: veil } : {})
    };
  seer.visions.push(vision);
  return vision;
}
function attackOnYou(night) {
  const { watcher: w } = night;
  const N = RULES.night;
  if (Watch.holds(night, 'player')) {
    S.log.attacks.push({ day: S.day, how: 'guard', power: !!night.power });
    if (!Watch.seen()) return bi(...TX.night.inTheSmallHours());
    S.revealed[w.id] = 'warden';
    fixMark(w);
    return bi(...TX.night.inTheSmallHours2(w));
  }
  let spent = null;
  if (has('bowl')) {
    const held = chance(N.bowl),
      broke = chance(N.bowlBreaks);
    if (held) {
      if (broke) lose('bowl');
      S.log.attacks.push({ day: S.day, how: 'bowl', broke: broke, power: !!night.power });
      return broke ? bi(...TX.night.inTheNightThe()) : bi(...TX.night.inTheMorningThe());
    }
    spent = () => {
      if (broke) lose('bowl');
      return broke ? bi(...TX.night.inTheNightThe2()) : bi(...TX.night.theIncantationBowlUnder());
    };
  }
  const pre = () => (spent ? spent() : '');
  if (has('revolver') && chance(N.revolver)) {
    S.log.attacks.push({ day: S.day, how: 'revolver', power: !!night.power });
    return pre() + bi(...TX.night.somethingSlidesUnderThe()) + hurt(...RULES.harm.fired, { k: 'attack' });
  }
  if (Watch.spared()) {
    S.log.attacks.push({ day: S.day, how: 'woke', power: !!night.power });
    return pre() + bi(...TX.night.youWakeInThe()) + hurt(...RULES.harm.woke, { k: 'attack' });
  }
  const asp = mannerOf();
  const told = () => {
    if (asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: S.day, id: 'you', asp: asp });
    return (
      pre() +
      `<p class="horror">${bi(tellNext('attack-' + asp, ASPECTS[asp].attack, (t, k) => tellableNow((ASPECTS[asp].attackEcho || [])[k])))}</p>`
    );
  };
  if (night.guest) return guestThrough(night, told);
  S.log.attacks.push({ day: S.day, how: 'hurt', power: !!night.power });
  const html = told() + hurt(...RULES.harm.attacked, { k: 'attack' });
  Record.journal(__text('youWereAttackedInTheNight'));
  return html;
}
const watchedOff = v => bi(...TX.night.someoneCameForIn(v));
function attackOnThem(night) {
  const { target: target, loc: loc, betrayer: betrayer } = night,
    v = C(target);
  const saved = Watch.holds(night, target) ? 'watch' : Watch.spared() ? 'luck' : null;
  night.saved = saved;
  if (betrayer) S.betrayals.push({ day: S.day, by: betrayer, victim: v.id, saved: saved });
  if (saved === 'watch') {
    S.log.guarded.push({ day: S.day, id: v.id });
    return watchedOff(v);
  }
  if (saved) {
    S.log.spared.push({ day: S.day, id: v.id });
    return bi(...TX.night.someoneCameForIn2(v));
  }
  fixMark(v);
  v.status = 'taken';
  v.takenDay = S.day;
  S.stats.taken++;
  const how = deathHow(v, loc, !!betrayer);
  if (how.asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: S.day, id: v.id, asp: how.asp });
  const own = how.kind === 'body',
    N = RULES.night,
    shaken = chance(clamp(N.shaken + (how.you ? N.shakenFound : 0) + N.shakenTrust * Math.max(0, v.rapport))),
    blow = how.you ? [RULES.harm.foundIt, 'found'] : [RULES.harm.shaken, 'death'],
    html = `<p class="horror">${deathText(v, loc, how)}</p>` + (shaken ? hurt(...blow[0], { k: blow[1], id: v.id }) : '');
  pullTo(own ? 'haunted' : 'tongues', own ? TENOR.pulls.taken : TENOR.pulls.murder);
  Record.journal(__text('wasTakenInTheNightA'));
  night.finder = how.f;
  return html;
}
function leaveTrace({
  cult: cult,
  target: target,
  loc: loc,
  smugOut: smugOut,
  betrayer: betrayer,
  why: why,
  finder: finder,
  saved: saved,
  at: at,
  guest: guest,
  power: power
}) {
  const by = guest && target === 'player' ? cult.filter(k => k !== guest) : cult,
    actor = betrayer ? C(betrayer) : power ? null : pick(by.length ? by : cult);
  planAlibis(S.day, loc, actor ? actor.id : null, target, saved || 'watch');
  const rec = S.nights[S.day];
  rec.target = target;
  rec.why = why || null;
  rec.finder = finder || null;
  rec.saved = saved || null;
  rec.power = !!power;
  return sceneTrace(S.day, loc, actor, target, smugOut, at);
}
function sceneTrace(n, loc, actor, target, smugOut = false, at = null) {
  const N = RULES.night,
    rec = S.nights[n],
    smug = freeChars().find(c => c.role === 'smuggler' && c.id !== target && c.id !== guestOn(n)),
    [atEn, atRu] = at || [LOCS[loc].at, R(LOCS[loc].at)];
  if (chance(N.swept * cultTurns('sleuth'))) {
    S.crime = { loc: loc, clue: null, examined: true, swept: true };
    rec.scene = { loc: loc, how: 'swept' };
    if (actor) thiefSees(n, loc, actor.id, false);
    return bi(...TX.night.sceneSwept(atEn, atRu));
  }
  const thief = smug && chance(smugOut ? N.smugglerTraceOut : N.smugglerTrace),
    byDay = n === S.day && loc !== 'camp' && S.visits && S.visits.day === S.day ? S.visits.at[loc] || [] : [],
    there = Object.keys(rec.truth).filter(id => (!actor || id !== actor.id) && id !== target && (wasAbout(rec, id) || byDay.includes(id))),
    anyone = actor ? [] : freeChars().filter(c => c.id !== target && c.id !== guestOn(n)),
    stray = thief ? null : there.length && (!actor || chance(N.strayTrace)) ? C(pick(there)) : anyone.length ? pick(anyone) : null,
    framed = thief || stray || !actor ? null : framedBy(actor, target),
    src = thief ? smug : stray || framed || actor;
  if (!src) {
    S.crime = { loc: loc, clue: null, examined: true, bare: true };
    rec.scene = { loc: loc, how: 'bare' };
    return bi(...TX.night.sceneEmpty(atEn, atRu));
  }
  const clue = Record.addTrace({
    owner: src.id,
    cat: pick(CATS),
    source: thief ? 'thief' : stray ? 'stray' : framed ? 'plant' : 'cult',
    loc: loc,
    status: 'unverified',
    by: actor ? actor.id : null,
    day: n
  });
  S.crime = { loc: loc, clue: clue, examined: false };
  const own = actor && src === actor,
    second = own ? sloppy(actor) : framed ? chance(N.pairPlant * craft(actor).plant) : chance(N.pairOther);
  if (second)
    S.crime.more = Record.addTrace({
      owner: src.id,
      cat: pick(CATS.filter(k => k !== clue.cat)),
      source: clue.source,
      loc: loc,
      status: 'unverified',
      by: actor ? actor.id : null,
      ...(own ? { careless: true } : { pair: true }),
      day: n
    });
  if (actor) thiefSees(n, loc, actor.id, !!thief);
  const more = S.crime.more;
  return bi(...TX.night.atTheSceneYou(atEn, clue, more, atRu));
}
function findsTray() {
  const unfound = charmsToFind();
  if (!unfound.length || !chance(room('finds') * RULES.night.findsTray * tenorOf('finds'))) return '';
  const w = pick(unfound),
    fm = C('hamid'),
    who = isFree(fm) ? 'Hamid' : 'One of the pickmen';
  gain(w);
  Record.journal(bi(...TX.night.theDiggersBroughtIn(w)));
  return brought(bi(...TX.night.bringsYouTheFinds(who, w, fm)) + gained(w));
}
function keptSaid(night) {
  if (night.target === 'player') return '';
  const id = night.sworn.find(
      x =>
        isFree(C(x)) &&
        !inYourTent(x, S.day - 1) &&
        !(C(x) === night.watcher && night.guard !== 'player') &&
        chance(room('talk') * RULES.night.kept)
    ),
    a = id && C(id);
  if (!a) return '';
  S.log.kept.push({ day: S.day - 1, id: id });
  return brought(bi(...TX.night.atBreakfastTellsAnyone(a))) + Moments.stir('kept', { about: id });
}
const BRINGS_DREAM = odds('brings you the night’s dream', [
  ['base', () => RULES.bring.odds],
  ['* trust in you', c => RULES.bring.trust[Ties.trust(c)]],
  ['* promised', c => (c.promised ? RULES.bring.promised : 1)],
  ['* temperament', c => TP(c).bring],
  ['* the night', () => (S.log.attacks.some(a => a.day === S.day - 1) ? RULES.bring.attack : RULES.bring.quiet)],
  ['* suspected', c => (Suspicion.suspected(c.id) ? RULES.bring.suspected : 1)],
  ['* the camp suspects you', () => RULES.bring.onYou ** Suspicion.youLevel()],
  ['* came lately', c => RULES.bring.again ** S.log.brought.filter(b => b.id === c.id && b.day >= S.day - 2).length],
  ['* the rite', () => 1 + (RULES.bring.rite * S.doom) / S.doomMax],
  [
    '* mourning',
    c => {
      const m = Ties.mourning(c);
      return m && S.day - m.day <= 1 ? RULES.bring.mourning : 1;
    }
  ],
  ['clamp', () => [RULES.bring.min, RULES.bring.max]]
]);
const KEEPS_DREAM = odds('keeps the night’s dream to themself after a death', [
  ['base', () => RULES.keepDream.odds],
  ['* trust in you', c => RULES.keepDream.trust[Ties.trust(c)]],
  ['* promised', c => (c.promised ? RULES.keepDream.promised : 1)],
  ['* temperament', c => TP(c).keep],
  [
    '* mourning',
    c => {
      const m = Ties.mourning(c);
      return m && m.day === S.day ? RULES.keepDream.mourning : 1;
    }
  ],
  ['* the rite', () => 1 - (RULES.keepDream.rite * S.doom) / S.doomMax],
  ['clamp', () => [RULES.keepDream.min, RULES.keepDream.max]]
]);
function breakfastDreams(night) {
  const { seer: seer, vision: vision } = night;
  const N = RULES.night,
    out = [],
    told = [],
    died = tookSomeone(night);
  freeChars()
    .filter(c => claimOf(c).role === 'seer')
    .forEach(c => {
      const own = c.role === 'seer';
      if (own ? c !== seer || !vision : !c.dreams.some(x => x.night === S.day - 1 && !x.d)) return;
      if (died && KEEPS_DREAM.roll(c, night)) return;
      const dream = () => (own ? visionFor(c, vision) : madeUpDream(c, true, S.day - 1));
      if (BRINGS_DREAM.roll(c, night)) {
        const d = dream();
        if (!d) return;
        S.log.brought.push({ day: S.day, id: c.id });
        dreamToYou(c, d, null);
        const [en, rus] = dreamSaid(c, d);
        out.push(brought(bi(...TX.night.findsYouBeforeBreakfast(c, en, rus))));
      } else if (chance(room('talk') * N.dreamAloud * talkSoft())) {
        const d = dream();
        if (!d) return;
        if (own) S.seerPublic = true;
        told.push(brought([c, d]));
      }
    });
  shuffle(told).forEach(([c, d], i) => {
    const [en, rus] = dreamSaid(c, tellDream(c, d));
    out.push(
      i ? bi(...TX.night.thenSpeaksUp(c, en, rus)) : bi(...TX.night.atBreakfastSpeaksUp(c, en, rus)),
      Moments.dreamAloud(c.id, d.t.id, d.cult, null, d.veil),
      answerDream(c, d)
    );
  });
  return out;
}
function answerDream(c, d) {
  const t = d.t,
    K = RULES.claims;
  if (!d.cult || d.veil || !isFree(t)) return '';
  const def = defenderOf(t, c);
  if (def) {
    if (def.role === 'seer') def.visions.filter(v => v.about === t.id && !v.cult && !v.veil).forEach(v => (v.told = true));
    return answerWith(def, { t: t, cult: false }, c, true);
  }
  let a = null;
  if (t.role === 'seer') {
    const v = claimOf(t).role === 'seer' && t.visions.filter(x => x.about === c.id && x.cult && !x.veil).pop();
    if (v && chance(K.counterTrue)) {
      v.told = true;
      a = { t: c, cult: true };
    }
  } else if (claimsToDream(t)) {
    if (
      !dreamtToday(t) &&
      chance(K.counter[Suspicion.hasDreamtAloud(t) ? 1 : 0] * TP(t).counter * (Suspicion.looksLost(t) ? K.desperate : 1))
    )
      a = { t: c, cult: true };
  } else if (claimOf(t).role === 'none' && chance(K.counterSpot * TP(t).counter)) {
    claimOnTheSpot(t);
    a = { t: c, cult: true };
  }
  if (a) return answerWith(t, a, c, false);
  return chance(K.retort * TP(t).retort) ? retortAloud(t, c) : '';
}
function answerWith(a, d, c, forOther) {
  const first = !Suspicion.hasDreamtAloud(a);
  if (forOther && a.role === 'cult' && d.t.role === 'cult') claimOf(a).stood = d.t.id;
  dreamNow(a, d);
  return (
    (forOther ? bi(...TX.night.shakesHeadThenWe(a, d)) : bi(...TX.night.isOnFeetBefore(a, c, d))) +
    Moments.dreamAloud(a.id, d.t.id, d.cult, forOther ? null : { first: first })
  );
}
function retortAloud(t, c) {
  return Moments.blame('retort', t.id, c.id, () => retortSaid(t, c));
}
function retortSaid(t, c) {
  const keyed = ['suspicious', 'liar', 'lightheaded'].includes(temperOf(t)) ? 0 : ['calculating', 'detached'].includes(temperOf(t)) ? 1 : 2,
    way = chance(RULES.claims.retortLine) ? keyed : pick([0, 1, 2].filter(k => k !== keyed));
  return way === 0 ? bi(...TX.night.isOnFeetThat(t, c)) : way === 1 ? bi(...TX.night.doesNotLookUp(t)) : bi(...TX.night.thatIsNotTrue(t));
}
