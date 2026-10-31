// people/social.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const cultPair = (a, b) => a.role === 'cult' && b.role === 'cult';
function victimWeights(npcs) {
  const cult = freeCult(),
    w = {};
  const vw = RULES.victims;
  npcs.forEach(v => {
    let x = 1 + vw.yourFriend * closeSeen(v) * cultTurns('confidant');
    cult.forEach(k => {
      x *= (1 - vw.cultLike * Ties.likes(k.id, v.id)) * Suspicion.threat.weight(v, k);
    });
    x *= 1 - vw.scapegoat * Suspicion.suspectedBy(v).length;
    w[v.id] = Math.max(vw.floor, x);
  });
  return w;
}
const cultOf = (c, k) => (c.role === 'cult' && S.bg === 'occultist' ? RULES.cunning[k] : 0);
const TAKES_CONFIDENCE = odds('takes your confidence', [
  ['base', () => RULES.confide.odds],
  ['+ trust in you', c => RULES.confide.trust * c.rapport],
  ['+ temperament', c => TP(c).confide],
  ['+ the cult, to an occultist', c => cultOf(c, 'listen')],
  ['- confidences taken already', c => RULES.confide.again * Ties.confidences(c)],
  ['clamp', () => [RULES.confide.min, RULES.confide.max]]
]);
const quoted = (lead, text) => lead + text + bi('”', '»');
function breakfastBlame() {
  const free = freeChars(),
    grudge = c => free.some(o => o.id !== c.id && Ties.cannotBear(c.id, o.id));
  const pool = free.filter(c => temperOf(c) === 'suspicious' || grudge(c) || free.some(o => Suspicion.sure(c, o)));
  if (!pool.length) return '';
  const s = pick(pool),
    seen = thiefSaw(s),
    outright = !!seen && chance(RULES.thief.outright),
    others = free.filter(o => o.id !== s.id && (!seen || o.id !== seen.actor));
  const t = outright ? C(seen.actor) : Parts.move(s, 'nameAloud')(s, others);
  return t ? blameAloud(s, t) : '';
}
function cultNamesAloud(s, others) {
  const inno = others.filter(o => o.role !== 'cult'),
    t = busFor(s, others);
  if (t) return t;
  return !inno.length || !chance(TP(s).frame) ? null : innocentBlames(s, inno);
}
function feudAgain() {
  const f = S.tenor.feud;
  if (!f || f.day >= S.day || !chance(room('talk') * TENOR.feud)) return '';
  S.tenor.feud = null;
  const [a, b] = f.pair.map(C),
    seen = thiefSaw(a);
  if (!isFree(a) || !isFree(b) || (seen && seen.actor === b.id)) return '';
  return blameAloud(a, b, true);
}
function blameAloud(s, t, feud = false) {
  return Moments.blame('breakfast', s.id, t.id, () => {
    const lead = feud ? bi(...TX.social.atBreakfastTheQuarrel(s, t)) : bi(...TX.social.overBreakfastSaysLoudly(s));
    return `<p class="notice">${lead} ${(temperOf(s) === 'suspicious') === chance(RULES.talk.ownWay) ? bi(...TX.social.iSawGoOut(t, s)) : bi(...TX.social.iWillSayIt(t))}</p>`;
  });
}
function volunteerSighting() {
  const n = S.day - 1,
    rec = S.nights[n];
  if (!rec) return '';
  const c = pick(
    freeChars().filter(
      o => Ties.friend(o) && rec.saw[o.id] && S.chars[rec.saw[o.id].who] && !S.claims.some(x => x.night === n && x.id === o.id)
    )
  );
  if (!c || !chance(room('talk') * RULES.talk.volunteer)) return '';
  const sw = rec.saw[c.id],
    cl = rec.claim[c.id] || { loc: 'camp', with: null };
  Record.addSighting({ night: n, id: c.id, where: sw.where, to: sw.to, cat: sw.cat, val: sawVal(sw) });
  return `<p class="notice">${bi(...TX.social.beforeBreakfastTakesYou(c))} ${sightLine(cl, sw, c)}${bi('”', '»')}</p>`;
}
const nameList = ids => listNames(ids.map(id => C(id).short)),
  nameListRu = (ids, k = 'n') => ru.list(ids.map(id => ru.c(id, k)));
function trustNote(up, down) {
  let h = '';
  if (down.length) h += `<p class="loss">${bi(...TX.social.youLessNow(down))}</p>`;
  if (up.length) h += `<p class="gain">${bi(...TX.social.youMoreNow(up))}</p>`;
  return h;
}
function tipLine(t) {
  const k = sayPick([0, 1]);
  return bi(...TX.social.ifYouWantSomeone(t, k));
}
function mourners(victim) {
  const who = freeChars().filter(c => Ties.fond(c.id, victim) && chance(RULES.morning.mourn));
  who.forEach(c => Ties.mourn(c, victim));
  const last = Moments.last(),
    m = who.length ? C(wpick(Object.fromEntries(who.map(c => [c.id, Ties.likes(c.id, victim) ** 2])))) : null;
  if (!m || (last && last.kind === 'grief' && last.by === m.id)) return '';
  const v = C(victim);
  return `<p class="notice">${bi(...tellOne('hardest', SAY.hardest)(m, v))}</p>`;
}
function consoled(c) {
  const m = Ties.mourning(c);
  if (!m || m.day !== S.day || m.done || !chance(RULES.talk.comfort)) return null;
  Ties.comfort(c);
  const v = C(m.victim);
  return bi(...TX.social.youSitWithA(c, v));
}
function griefFor(victim) {
  return (
    Moments.stir('grief', { about: victim }) +
    mourners(victim) +
    (Suspicion.suspected(victim) && chance(RULES.morning.withhold) ? '' : Moments.settle(victim, false)) +
    ontoSaid(victim)
  );
}
function ontoSaid(victim) {
  const named = Suspicion.accusations(victim).filter(x => isFree(C(x.about)));
  return named.length && chance(RULES.camp.onto.odds) ? Moments.stir('onto', { about: named.pop().about, dead: victim }) : '';
}
function socialMorning(victim) {
  let h = chance(Math.min(1, room('talk') * visitTalk() * deedTalk())) ? brought(Gossip.rumours()) : '';
  h += brought(volunteerSighting());
  const c = shuffle(freeChars()).find(o => chance(room('talk') * confessChance(o, !!victim)));
  if (c) h += brought(morningConfession(c));
  h += brought(feudAgain());
  h += brought(complaint());
  h += brought(wayTalk());
  h += brought(doubtTalk());
  const t = rateOf('talk');
  if (chance(room('talk') * clamp(RULES.morning.talk * t))) {
    const k = breakfastKind();
    h += brought(breakfastTalk(k));
    if (chance(room('talk') * TENOR.second * Math.min(1, Math.max(TENOR.floor, t - 1)))) h += brought(breakfastTalk(breakfastKind(k)));
  }
  return h;
}
function complaint() {
  const H = RULES.hound,
    pr = RULES.camp.complained,
    after = S.log.ways.some(w => w.k === 'inquisitor') ? RULES.counter.complaints : 1,
    c = shuffle(freeChars().filter(o => Ties.hounded(o) >= pr.from)).find(o =>
      chance(room('talk') * Math.min(pr.max, pr.odds * after * (Ties.hounded(o) - pr.from + 1)))
    );
  if (!c) return '';
  Ties.hound(c, -pr.eases);
  angerRises(H.complainAnger);
  if (chance(H.complainSusOdds)) Suspicion.suspectYou(vary(H.complainSus));
  return Moments.stir('complained', { by: c.id });
}
const WAY_TALK = {
  inquisitor: () => TX.social.theDoctorWillHave(),
  confidant: () => TX.social.theDoctorTellsEverything(),
  scholar: s => TX.social.iHaveHeardThe(s),
  delver: () => TX.social.diggingForCraneAre(),
  sleuth: (s, f) => TX.social.didYouKnowWas(f)
};
function wayTalk() {
  const K = RULES.counter,
    said = k => S.log.ways.some(w => w.k === k),
    k = Object.keys(WAY_TALK)
      .filter(x => !said(x) && cultReads(x) >= RULES.adapt.told)
      .sort((a, b) => cultReads(b) - cultReads(a))[0];
  if (!k || !freeChars().length) return '';
  const t = S.turned && S.turned[k],
    cultOdds = freeCult().length && t && t.day != null && S.day > t.day ? K.odds * cultReads(k) : 0,
    camp = chance(room('talk') * K.camp),
    cult = !camp && chance(room('talk') * cultOdds);
  if (!camp && !cult) return '';
  const friends = freeChars().filter(c => Ties.friend(c)),
    f = k === 'sleuth' ? pick(friends) : null;
  if (k === 'sleuth' && !f) return '';
  const w = {};
  freeChars()
    .filter(c => !f || c.id !== f.id)
    .forEach(c => {
      w[c.id] = Math.abs(c.rapport) + RULES.rumours.talkBase;
    });
  if (!Object.keys(w).length) return '';
  const s = C(wpick(w)),
    line = WAY_TALK[k](s, f),
    hear = freeChars().filter(o => o.id !== s.id && Ties.fond(o.id, s.id)),
    down = [];
  S.log.ways.push({ day: S.day, k: k, by: s.id, cult: cult, about: f ? f.id : null });
  if (k === 'confidant') friends.filter(o => o.id !== s.id && chance(K.cools) && Ties.moveTrust(o, -1)).forEach(o => down.push(o.id));
  if (k === 'scholar' || k === 'delver') {
    Suspicion.suspectYou(vary(K.onYou));
    hear.filter(o => chance(K.thinks) && Ties.moveTrust(o, -1)).forEach(o => down.push(o.id));
  }
  if (k === 'sleuth') hear.filter(o => o.id !== f.id && chance(K.wonder)).forEach(o => Suspicion.move(o, f, 1));
  return `<p class="notice">${bi(...TX.social.overBreakfastYouCatch(s, line))}</p>` + trustNote([], down);
}
function doubtTalk() {
  const K = RULES.doubt,
    plot = S.plots.find(p => p.kind === 'discredit' && !p.done && p.day < S.day),
    lately = freeChars().filter(c => S.said.some(x => x.by === c.id && x.how === 'dream' && x.day >= S.day - K.lately)),
    could = d => freeChars().filter(c => c.id !== d.id && !Ties.fond(c.id, d.id));
  if (plot) plot.done = true;
  let d = plot && isFree(C(plot.id)) ? C(plot.id) : null;
  const cult = !!d && chance(room('talk') * K.cult);
  if (!cult) {
    if (!lately.length) return '';
    d = pick(lately);
    if (!chance(1 - (1 - Math.min(1, room('talk') * K.camp)) ** could(d).length)) return '';
  }
  const pool = could(d);
  if (!pool.length) return '';
  const s = pick(pool),
    k = sayPick([0, 1, 2]);
  if (cult) plot.said = S.day;
  S.log.doubts.push({ day: S.day, by: s.id, about: d.id, cult: cult, k: k });
  freeChars()
    .filter(o => o.id !== d.id && o.id !== s.id && !Ties.fond(o.id, d.id) && !Suspicion.wonders(o, d))
    .forEach(o => chance(K.wonder) && Suspicion.move(o, d, 1));
  return `<p class="notice">${bi(...TX.social.overBreakfastDreamsFrom(s, d, k))}</p>`;
}
function breakfastKind(not = null) {
  const w = {};
  ['you', 'gossip', 'blame']
    .filter(k => k !== not)
    .forEach(k => {
      w[k] = RULES.morning[k];
    });
  return wpick(w);
}
const breakfastTalk = k => (k === 'you' ? Gossip.ofYou() : k === 'gossip' ? Gossip.speak('breakfast') : breakfastBlame());
