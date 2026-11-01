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
    x *= 1 - vw.scapegoat * Suspicion.threat.exposure(v).length;
    if (Suspicion.knownAloud(v) && !Suspicion.threat.harm(v)) x *= 1 - RULES.influence.loudSpared;
    w[v.id] = Math.max(vw.floor, x);
  });
  return w;
}
const cultOf = (c, k) => (c.role === 'cult' && S.bg === 'occultist' ? RULES.cunning[k] : 0);
const TAKES_CONFIDENCE = Decisions.define({
  id: 'dialog.confidence',
  action: 'accept-confidence',
  subject: c => c.id,
  object: 'player',
  authority: 'actor',
  knowledge: ['own trust, temperament and role', 'player background and confidences personally received'],
  consequences: ['trust', 'confidence remembered', 'reply'],
  features: { trust: 'number', temper: 'string', role: 'string', background: 'string', confidences: 'number' },
  observe: c => ({ trust: c.rapport, temper: temperOf(c), role: c.role, background: S.bg, confidences: Ties.confidences(c) }),
  probability: odds('takes your confidence', [
    ['base', () => RULES.confide.odds],
    ['+ trust in you', c => RULES.confide.trust * c.rapport],
    ['+ temperament', c => TP(c).confide],
    ['+ the cult, to an occultist', c => cultOf(c, 'listen')],
    ['- confidences taken already', c => RULES.confide.again * Ties.confidences(c)],
    ['clamp', () => [RULES.confide.min, RULES.confide.max]]
  ])
});
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
  // This is an already granted public opportunity. An honest member can voice a
  // real grievance; willingness to fabricate in private must not silence them.
  return inno.length ? innocentBlames(s, inno) : null;
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
    const lead = feud ? bi(...TX.social.atBreakfastTheQuarrel(s, t)) : bi(...TX.social.overBreakfastSaysLoudly(s)),
      firsthand = (temperOf(s) === 'suspicious') === chance(RULES.talk.ownWay),
      basis = firsthand ? Knowledge.outing(s, t) : null;
    Object.assign(S.said[S.said.length - 1], { claim: basis ? 'sighting' : 'judgment', basis });
    return `<p class="notice">${lead} ${basis ? bi(...TX.social.iSawGoOut(t, s)) : bi(...TX.social.iWillSayIt(t))}</p>`;
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
  Knowledge.publicLoss(victim);
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
function socialMorning() {
  let h = chance(Math.min(1, room('talk') * visitTalk() * deedTalk())) ? brought(Gossip.rumours()) : '';
  h += brought(volunteerSighting());
  const c = shuffle(freeChars()).find(o => DROPS_PRETENCE.roll(o, 'morning'));
  if (c) h += brought(morningConfession(c));
  h += brought(feudAgain());
  h += brought(complaint());
  h += brought(wayTalk());
  h += brought(doubtTalk());
  h += brought(CampInfluence.breakfast());
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
  scholar: () => TX.social.doctorStudiesTablets(),
  delver: () => TX.social.diggingForCraneAre(),
  sleuth: (s, f) => TX.social.oftenSeenWithDoctor(f)
};
function wayTalk() {
  const K = RULES.counter,
    said = k => S.log.ways.some(w => w.k === k),
    eligible = freeChars()
      .map(c => ({
        c,
        styles: Knowledge.styles(c, Object.keys(WAY_TALK)).filter(k => !said(k) && (k !== 'sleuth' || Knowledge.contacts(c).length))
      }))
      .filter(r => r.styles.length);
  if (!eligible.length || !chance(room('talk') * K.camp)) return '';
  const s = C(wpick(Object.fromEntries(eligible.map(({ c }) => [c.id, Math.abs(c.rapport) + RULES.rumours.talkBase])))),
    styles = eligible.find(r => r.c.id === s.id).styles,
    planned = k => s.role === 'cult' && S.turned?.[k]?.day != null && S.turned[k].day < S.day && cultReads(k) >= RULES.adapt.told,
    k = wpick(boundedAim(styles, () => 1, planned, K.aim)),
    cult = !!planned(k),
    contact = k === 'sleuth' ? pick(Knowledge.contacts(s)) : null,
    f = contact ? C(contact.id) : null,
    line = WAY_TALK[k](s, f),
    hear = freeChars().filter(o => o.id !== s.id && Ties.fond(o.id, s.id)),
    down = [];
  S.log.ways.push({
    day: S.day,
    k,
    by: s.id,
    cult,
    about: f ? f.id : null,
    basis: Knowledge.styleBasis(s, k),
    contact: contact?.basis || null,
    plan: cult ? { source: 'shared observations of player conduct', route: 'discussed among the cult', day: S.turned[k].day } : null
  });
  if (k === 'confidant')
    freeChars()
      .filter(o => o.id !== s.id && Ties.friend(o) && chance(K.cools) && Ties.moveTrust(o, -1))
      .forEach(o => down.push(o.id));
  if (k === 'scholar' || k === 'delver') {
    Suspicion.suspectYou(vary(K.onYou));
    hear.filter(o => chance(K.thinks) && Ties.moveTrust(o, -1)).forEach(o => down.push(o.id));
  }
  if (k === 'sleuth') hear.filter(o => o.id !== f.id && chance(K.wonder)).forEach(o => Suspicion.move(o, f, 1));
  return `<p class="notice">${bi(...TX.social.overBreakfastYouCatch(s, line))}</p>` + trustNote([], down);
}
function doubtTalk() {
  const K = RULES.doubt,
    publicDream = c => S.said.filter(x => x.by === c.id && x.how === 'dream' && x.day >= S.day - K.lately).slice(-1)[0],
    lately = freeChars().filter(publicDream),
    targets = s => lately.filter(d => d.id !== s.id && !Ties.fond(s.id, d.id)),
    pool = freeChars().filter(c => targets(c).length);
  if (!pool.length || !chance(1 - (1 - Math.min(1, room('talk') * K.camp)) ** pool.length)) return '';
  const s = pick(pool),
    plot =
      s.role === 'cult'
        ? S.plots.find(p => p.kind === 'discredit' && !p.done && p.day < S.day && p.until >= S.day && targets(s).some(d => d.id === p.id))
        : null,
    d = C(
      wpick(
        boundedAim(
          targets(s),
          () => 1,
          c => plot && c.id === plot.id,
          K.aim
        )
      )
    ),
    cult = !!plot && plot.id === d.id,
    source = publicDream(d),
    k = sayPick([0, 1, 2]);
  if (cult) Object.assign(plot, { done: true, said: S.day });
  S.log.doubts.push({
    day: S.day,
    by: s.id,
    about: d.id,
    cult,
    k,
    basis: { source: 'public dream', route: 'heard in camp', day: source.day, by: d.id },
    plot: cult ? { by: plot.by, day: plot.day, route: 'a plan agreed by the cult at night' } : null
  });
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
