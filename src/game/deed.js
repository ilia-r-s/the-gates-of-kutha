// game/deed.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const deedOffered = () =>
  !S.log.deed && atEvening() && !S.inquiryDone && freeChars().length > 0 && S.day >= RULES.deed.from && S.day < RULES.start.days;
const DEED_THOUGHTS = TX.deed.theTrusteesSentYou();
function deedScene() {
  S.phase = 'deed';
  const th = DEED_THOUGHTS[(S.day + S.salt) % DEED_THOUGHTS.length];
  show({
    kicker: dayStamp(),
    title: __text('onlyOneWay'),
    body: [`<p>${bi(th[0], th[1])}</p><p class="dim">${bi(...TX.deed.onceThisSeasonAnd())}</p>`],
    choices: freeChars()
      .map(c => ({ label: __text('goToSTentTonightG'), sub: () => markSay(c), cls: 'danger', fn: () => deedMeans(c) }))
      .concat([
        {
          label: __text('thinkBetterOfIt'),
          cls: 'minor',
          fn: () => (backedDown(), goTo('camp'))
        }
      ])
  });
}
function deedMeans(t) {
  const ch = [];
  if (has('revolver'))
    ch.push({ label: __text('yourRevolver'), sub: __text('sureAndLoud'), cls: 'danger', fn: () => deedPlant(t, 'revolver') });
  ch.push(
    { label: __text('aKnifeFromTheCookHouse'), sub: __text('quietIfYourHandIsSteady'), cls: 'danger', fn: () => deedPlant(t, 'knife') },
    { label: __text('thinkBetterOfIt2'), cls: 'minor', fn: () => (backedDown(), goTo('camp')) }
  );
  show({ kicker: dayStamp(), title: __text('onlyOneWay2'), body: [`<p>${__text('thenWithWhat')}</p>`], choices: ch });
}
function deedPlant(t, means) {
  const can = freeChars()
    .filter(o => o.id !== t.id)
    .flatMap(o => CATS.filter(k => o.known[k]).map(k => ({ o: o, cat: k, val: o.known[k] })));
  const named = new Set(),
    some = shuffle(can)
      .filter(p => !named.has(p.o.id) && named.add(p.o.id))
      .slice(0, 4);
  show({
    kicker: dayStamp(),
    title: __text('onlyOneWay3'),
    body: [`<p>${bi(...TX.deed.oneMoreThingWhatever())}</p>`],
    choices: some
      .map(p => ({ label: __text('leaveSomethingOfSG'), sub: bi(TRAITS[p.cat].vals[p.val].name), fn: () => deedSet(t, means, p) }))
      .concat([
        { label: __text('leaveNothingOfAnyoneS'), fn: () => deedSet(t, means, null) },
        { label: __text('thinkBetterOfIt3'), cls: 'minor', fn: () => (backedDown(), goTo('camp')) }
      ])
  });
}
function deedSet(t, means, plant) {
  S.inquiryDone = true;
  S.act = 'deed';
  S.log.deed = { day: S.day, id: t.id, means: means, plant: plant ? { owner: plant.o.id, cat: plant.cat, val: plant.val } : null };
  Record.journal(bi(...TX.deed.youResolvedToGo(t)));
  endSlot(bi(...TX.deed.youEatWithThe()), __text('waitingForTheDark'));
}
const deedTonight = () => (S.log.deed && S.log.deed.day === S.day && !S.log.deed.outcome ? S.log.deed : null);
function awayTonight(night, t) {
  const A = RULES.deed.away,
    rec = S.nights[S.day],
    tr = rec && rec.truth[t.id];
  if (!isFree(t)) return 'gone';
  if (t === night.watcher && night.guard === 'player') return 'watch';
  if (rec && rec.actor === t.id && chance(A.errand)) return 'errand';
  if (tr && tr.loc !== 'camp' && t.role === 'smuggler' && chance(A.thief)) return 'thief';
  if (tr && tr.with && rec.actor !== t.id && QUIET.includes(tr.loc) && chance(A.tryst)) return 'tryst';
  return chance(A.restless) ? 'restless' : null;
}
function deedNight(night) {
  const d = deedTonight();
  if (!d) return '';
  const t = C(d.id);
  let h = '';
  DEED_NIGHT.forEach(step => {
    h += step(night, d, t);
  });
  return h;
}
const DEED_NIGHT = [deedReach, deedSeen, deedLeft, deedBack];
const reachedThem = d => d.outcome === 'killed' || d.outcome === 'failed';
function deedReach(night, d, t) {
  const D = RULES.deed,
    away = awayTonight(night, t);
  let h = '';
  if (away) {
    d.outcome = 'away';
    d.away = away;
    h = bi(...TX.deed.inTheSmallHours(t));
    h += hurt(...D.cost.away, { k: 'deed', how: 'away' });
  } else if (night.watcher && isFree(night.watcher) && Watch.holds(night, t.id)) {
    d.outcome = 'watched';
    d.knewBy = chance(D.knows) ? night.watcher.id : null;
    S.log.guarded.push({ day: S.day, id: t.id, you: true });
    h = bi(...TX.deed.youAreAStep(t));
    if (!(night.target === t.id && night.saved === 'watch')) night.found.push(watchedOff(t));
    h += hurt(...D.cost.watched, { k: 'deed', how: 'watched' });
  } else if (chance(clamp(D.kill[d.means] + (S.bg === 'soldier' ? D.soldier : 0)))) {
    d.outcome = 'killed';
    fixMark(t);
    t.status = 'taken';
    t.takenDay = S.day;
    t.takenBy = 'you';
    S.stats.taken++;
    night.deedDead = t.id;
    Record.journal(__text('youKilledInTheNightA'));
    h = d.means === 'revolver' ? bi(...TX.deed.oneShotDogsAll(t)) : bi(...TX.deed.doesNotWakeIt(t));
    night.found.push(d.means === 'revolver' ? bi(...TX.deed.atFirstLightThey(t)) : bi(...TX.deed.atFirstLightIs(t)));
    h += hurt(...D.cost.done, { k: 'deed', how: 'done' });
  } else {
    d.outcome = 'failed';
    d.knewBy = chance(D.wakes) ? t.id : null;
    h = d.means === 'revolver' ? bi(...TX.deed.wakesAsYouRaise(t)) : bi(...TX.deed.wakesAsYouReach(t));
    night.found.push(bi(...TX.deed.comesToBreakfastWith(t, d)));
    h += hurt(...D.cost.failed, { k: 'deed', how: 'failed' });
    S.hurtBy = 'deed';
  }
  return h;
}
function deedSeen(night, d, t) {
  const D = RULES.deed,
    pool = freeChars().filter(o => o.id !== t.id);
  if (pool.length && chance(clamp(D.seen * (reachedThem(d) ? D.noise[d.means] : D.quietly))))
    d.seenBy = (night.guard === 'player' && night.watcher && isFree(night.watcher) ? night.watcher : pick(pool)).id;
  return d.seenBy ? bi(...TX.deed.onTheWayBack()) : '';
}
function deedLeft(night, d) {
  if (!reachedThem(d)) return '';
  d.trace = chance(RULES.deed.trace);
  if (!d.plant) return '';
  d.planted = true;
  const clue = TRAITS[d.plant.cat].vals[d.plant.val].clue,
    o = C(d.plant.owner);
  return bi(...TX.deed.youLeaveByThe(clue, o));
}
function deedBack(night, d) {
  if (night.youOut === 'guarded') {
    const w = night.watcher,
      seen = Watch.seen();
    if (seen) {
      S.revealed[w.id] = 'warden';
      fixMark(w);
      if (!d.knewBy && !d.seenBy) d.seenBy = w.id;
    }
    return seen ? bi(...TX.deed.whenYouGetBack(w)) : bi(...TX.deed.whenYouGetBack2());
  }
  return night.youOut ? bi(...TX.deed.whenYouGetBack3()) : '';
}
function deedMorning() {
  const d = S.log.deed;
  if (!d || d.day !== S.day - 1 || d.morning) return '';
  d.morning = true;
  const t = C(d.id),
    happened = d.outcome === 'killed' || d.outcome === 'failed' || d.outcome === 'watched';
  let h = '';
  DEED_MORNING.forEach(step => {
    h += step(d, t, happened);
  });
  const judged = d.caught || (happened && chance(RULES.deed.vote[Suspicion.youLevel()]));
  return judged ? h + youVote() : h;
}
const DEED_MORNING = [deedKnown, deedButton, deedEmptyTent, deedShot, deedPlantRead, deedCultHears];
function deedKnown(d, t, happened) {
  const D = RULES.deed,
    knower = d.knewBy ? C(d.knewBy) : d.seenBy ? C(d.seenBy) : null;
  if (!knower || !isFree(knower)) return '';
  const surely = !!d.knewBy,
    tell = clamp(D.tell[Math.max(0, Math.min(3, knower.rapport + 1))] + (knower.role === 'cult' ? D.cultTells : 0) + (surely ? D.sure : 0));
  if (happened && chance(tell)) {
    d.caught = knower.id;
    return bi(...TX.deed.beforeBreakfastStandsUp(knower, surely));
  }
  if (!chance(D.hint)) return '';
  d.hinted = knower.id;
  Suspicion.suspectYou(happened ? D.onYou.hinted : D.onYou.hintedNothing);
  const hm = C('hamid'),
    asked = knower.id !== hm.id && isFree(hm) ? ['Hamid', __text('text')] : __text('theCook');
  return bi(...TX.deed.watchesYouOverBreakfast(knower, asked));
}
function deedButton(d, t, happened) {
  const D = RULES.deed;
  if (!(happened && d.trace && chance(D.link))) return '';
  d.linked = true;
  Suspicion.suspectYou(D.onYou.linked);
  return bi(...TX.deed.someoneFoundAHorn(t));
}
function deedEmptyTent(d, t, happened) {
  if (!(happened && S.log.attacks.some(a => a.day === d.day && a.how === 'out'))) return '';
  Suspicion.suspectYou(RULES.deed.onYou.out);
  return bi(...TX.deed.theWholeCampKnows());
}
function deedShot(d) {
  const D = RULES.deed;
  if (reachedThem(d) && d.means === 'revolver' && chance(D.shot)) Suspicion.suspectYou(D.onYou.shot);
  return '';
}
function deedPlantRead(d, t) {
  if (!d.planted) return '';
  const D = RULES.deed,
    owners = freeChars().filter(o => o.traits[d.plant.cat] === d.plant.val && o.id !== t.id),
    sp = pick(freeChars().filter(o => o.id !== t.id));
  if (sp && chance(D.plantSeen)) {
    d.plantSeen = sp.id;
    if (chance(D.plantLink)) Suspicion.suspectYou(D.onYou.plantLink);
    return bi(...TX.deed.looksForALong(sp, t));
  }
  if (!owners.length) return '';
  const o = owners.find(x => x.id === d.plant.owner) || owners[0];
  d.plantTook = o.id;
  return Moments.stir('planted', { about: o.id, at: t.id, cat: d.plant.cat });
}
function deedCultHears(d, t, happened) {
  const D = RULES.deed;
  if (happened) Suspicion.alertCult(D.cultKnows * (d.caught || d.hinted || d.linked ? 1 : D.unseen), freeCult());
  return '';
}
function deedDawn() {
  const d = S.log.deed;
  if (!d || !d.morning || d.judged || S.ended) return '';
  return chance(RULES.deed.later * RULES.deed.vote[Suspicion.youLevel()]) ? youVote() : '';
}
function youVote() {
  const d = S.log.deed,
    J = RULES.deed.judge,
    VR = RULES.verdict,
    crowd = freeChars(),
    cs = Suspicion.onYou() + (d.caught ? J.caught : 0),
    h = handsRaised(
      crowd,
      o =>
        cs +
        (Ties.fond(o.id, d.id) ? J.friend : 0) +
        (o.id === d.id ? J.victim : 0) -
        J.trust * o.rapport +
        VR.fear * Math.min(S.stats.taken, VR.fearCap) +
        VR.anger * (S.anger || 0) +
        (o.role === 'cult' ? J.cult * craft(o).push : 0),
      () => 0,
      J.expel,
      J.keep,
      'against'
    ),
    out = { expel: h.for, keep: h.against, silent: h.silent, passed: h.passed };
  d.judged = S.day;
  d.vote = { expel: out.expel, keep: out.keep, silent: out.silent, passed: out.passed, day: S.day };
  const corporal = !crowd.length;
  const hands = corporal
    ? `<p class="notice">${bi(...TX.deed.thereIsNobodyLeft())}</p>`
    : `<p class="notice">${bi(...TX.deed.theCampSitsIn(out))}</p>`;
  if (out.passed) {
    endDecide('expelled');
    return hands + `<p class="notice">${bi(...TX.deed.itIsDecidedAt())}</p>`;
  }
  const sour = out.expel.map(C).filter(o => o.rapport > RULES.scale.trustMin && chance(RULES.deed.sour));
  sour.forEach(o => Ties.moveTrust(o, -1, 'deed'));
  S.anger = (S.anger || 0) + vary(RULES.deed.angered);
  Suspicion.clearYou(vary(RULES.deed.cleared));
  return (
    hands +
    (corporal ? '' : `<p class="notice">${bi(...TX.deed.theCampWillNot())}</p>`) +
    trustNote(
      [],
      sour.map(o => o.id)
    )
  );
}
const deedTalk = () => (S.log.deed && S.log.deed.day === S.day - 1 ? RULES.deed.talk : 1);
