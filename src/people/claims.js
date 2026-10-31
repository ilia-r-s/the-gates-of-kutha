// people/claims.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function assignClaims() {
  S.claim = {};
  S.order.forEach(id => {
    const c = C(id),
      honest = temperOf(c) === 'honest' && !chance(RULES.scale.rarest);
    const { role: role, why: why } = Parts.move(c, 'claim')(c, TP(c), honest);
    S.claim[id] = { role: role, why: why, said: null, recanted: null };
  });
}
const claimHidden = (c, hide, honest) =>
  chance(hide) ? { role: honest ? 'evade' : 'none', why: 'conceal' } : { role: c.role, why: 'truth' };
function claimAsAnyone(t, honest, why = { liked: 'liked', evade: 'reticent', none: 'truth' }) {
  const K = RULES.claims;
  if (!honest && chance(t.liked)) return { role: chance(K.likedSeer) ? 'seer' : 'warden', why: why.liked };
  if (chance(honest ? K.evadeHonest : K.evadeAny)) return { role: 'evade', why: why.evade };
  return { role: 'none', why: why.none };
}
const CLAIM_AS = {
  seer: (c, t, honest) => claimHidden(c, t.hideSeer, honest),
  warden: (c, t, honest) =>
    !honest && chance(t.liked) && chance(RULES.claims.likedSeer) ? { role: 'seer', why: 'liked' } : claimHidden(c, t.hideWarden, honest),
  smuggler: (c, t, honest) =>
    !honest && chance(t.cover)
      ? { role: 'warden', why: 'conceal' }
      : claimAsAnyone(t, honest, { liked: 'liked', evade: 'conceal', none: 'conceal' }),
  cult: (c, t, honest) => claimAsAnyone(t, honest, { liked: 'deceit', evade: 'conceal', none: 'conceal' }),
  anyone: (c, t, honest) => claimAsAnyone(t, honest)
};
const claimOf = c => S.claim[typeof c === 'string' ? c : c.id];
const trueClaim = c => (c.role === 'seer' ? 'seer' : c.role === 'warden' ? 'warden' : 'none');
const lying = c => claimOf(c).role !== trueClaim(c);
function sayClaim(c) {
  const cl = claimOf(c);
  if (!cl) return;
  if (cl.said == null) cl.said = S.day;
  Record.testify(c.id, c.id, 'claim', cl.role);
}
function claimSay(c, role) {
  const k = sayPick([0, 1, 2]),
    g = (m, f) => ru.gs(c, m, f);
  if (role === 'seer') return bi(...TX.claims.craneMeantMeI(k, g));
  if (role === 'warden') return bi(...TX.claims.iSleepVeryLittle(k));
  if (role === 'evade') return bi(...TX.claims.iWouldRatherNot(k, g));
  return bi(...TX.claims.iAmNotIn(k, g));
}
function claimTell(c) {
  if (claimOf(c).role === 'evade') return chance(RULES.talk.evadeNote) ? bi(...TX.claims.doesNotMakeAnything(c)) : null;
  if (!chance(lying(c) ? TP(c).tell : temperOf(c) === 'suspicious' ? RULES.talk.tellSuspicious : RULES.talk.tellTruthful)) return null;
  Record.testify(c.id, c.id, 'tell', 'quick');
  const k = sayPick([0, 1]);
  return bi(...TX.claims.answersAShadeToo(c, k));
}
const dreamEn = (t, cult, veil = null) =>
  veil
    ? __text('someoneStoodInsideTheSeventhUnder')
    : cult
      ? `${t.short} stood inside the seventh, and the god’s hand was on ${t.pp} shoulder.`
      : __text('stoodOutsideThemWeepingWhateverIs');
const dreamRu = (t, cult, veil = null) => (veil ? __text('text') : cult ? __text('text2') : __text('text3'));
const dreamSaid = (c, d) => TX.claims.iDreamtOfThe(c, d);
const dreamVerdict = d => (d.cult ? 'cult' : 'clean') + (d.veil ? ':' + d.veil : '');
function tellDream(c, d) {
  sayClaim(c);
  Record.testify(c.id, d.t.id, d.veil ? 'veiled' : 'vision', dreamVerdict(d));
  return d;
}
function dreamToYou(c, d, at) {
  if (!d) return null;
  tellDream(c, d);
  Suspicion.toldYou(c, d.t, 'dream', at, d.veil ? 'veiled' : d.cult ? 'cult' : 'clean');
  return d;
}
const claimToYou = (c, at) => claimOf(c).role === 'seer' && Suspicion.toldYou(c, c, 'claim', at);
const claimsToDream = c => c.role !== 'seer' && claimOf(c).role === 'seer';
function trueDream(c, fresh = false) {
  if (c.role !== 'seer' || claimOf(c).role !== 'seer') return null;
  const v = c.visions.filter(x => isFree(C(x.about)) && !(fresh && x.told)).pop();
  return v ? dreamToYou(c, visionFor(c, v), S.loc) : null;
}
const dreamFor = (c, d) => (c.dreamt = { day: S.day, d: d }).d;
function visionFor(c, v) {
  v.told = true;
  return dreamFor(c, { t: C(v.about), cult: v.cult, ...(v.veil ? { veil: v.veil } : {}) });
}
const dreamtToday = c => !!c.dreamt && c.dreamt.day === S.day;
const dreamNow = (c, d) => tellDream(c, dreamFor(c, d));
function dreamtSince(c) {
  for (let n = 0; n < S.day; n++) if (!chance(RULES.night.dreamless)) c.dreams.push({ night: n, d: null });
}
function claimOnTheSpot(c) {
  Object.assign(claimOf(c), { role: 'seer', why: c.role === 'cult' ? 'deceit' : 'liked', heat: true });
  dreamtSince(c);
}
function cornerClaims() {
  const K = RULES.claims;
  freeChars().forEach(c => {
    const cl = claimOf(c);
    if (c.role === 'seer' || cl.role !== 'none' || cl.said != null || !Suspicion.looksLost(c)) return;
    if (!chance(K.cornered * TP(c).liked)) return;
    const role = chance(K.likedSeer) ? 'seer' : 'warden';
    if (role === trueClaim(c)) return;
    Object.assign(cl, { role: role, why: c.role === 'cult' ? 'deceit' : 'liked' });
    if (role === 'seer') dreamtSince(c);
  });
}
function madeUpDream(c, fresh = false, night = null) {
  if (dreamtToday(c)) return c.dreamt.d;
  const s = c.dreams.filter(x => (night == null || x.night === night) && (!x.d || (!fresh && isFree(x.d.t)))).pop();
  if (!s) return null;
  if (!s.d) {
    const d = Parts.move(c, 'dream')(c);
    if (!d) return null;
    const veil = veiled();
    s.d = veil ? { ...d, veil: veil } : d;
  }
  return dreamFor(c, s.d);
}
const dreamersHeard = pool => pool.filter(Suspicion.hasDreamtAloud);
function fakeDream(c) {
  const K = RULES.claims,
    pool = freeChars().filter(o => o.id !== c.id);
  if (!pool.length) return null;
  if (!chance(K.fakeGuilty)) return { t: Ties.pickByLike(c, pool, 1), cult: false };
  const rivals = dreamersHeard(pool);
  if (rivals.length && chance(K.atDreamer)) return { t: pick(rivals), cult: true };
  return { t: fearOf(c, pool), cult: true };
}
function fearOf(c, pool) {
  const w = {};
  pool.forEach(o => {
    w[o.id] = Math.max(RULES.likes.floor, 1 - RULES.likes.pull * Ties.likes(c.id, o.id)) * (1 + Suspicion.level(c.id, o.id));
  });
  return C(wpick(w));
}
function closingIn(dec, pool) {
  const w = {};
  pool.forEach(o => {
    const v = Suspicion.threat.closingIn(o);
    if (v > 0) w[o.id] = v;
  });
  return Object.keys(w).length ? C(wpick(w)) : null;
}
function cultDream(dec) {
  const K = RULES.claims,
    inno = freeChars().filter(o => o.id !== dec.id && o.role !== 'cult'),
    mate = freeChars().find(o => o.id !== dec.id && o.role === 'cult'),
    told = d => {
      if ((d.t.role === 'cult') === d.cult) S.log.cultTruth++;
      return d;
    };
  const gone = busFor(dec, freeChars());
  if (gone) return told({ t: gone, cult: true });
  const watched = mate && Suspicion.threat.watched(mate, dec);
  if (watched && chance(K.shield * craft(dec).defend)) return told({ t: mate, cult: false });
  const threat = closingIn(dec, inno);
  if (threat && chance(K.frame * TP(dec).frame)) return told({ t: threat, cult: true });
  const friends = inno.concat(mate ? [mate] : []);
  if (!friends.length) return null;
  if (!chance(K.fakeGuilty + K.cultGuilty) || !inno.length) return told({ t: Ties.pickByLike(dec, friends, 1), cult: false });
  if (mate && !watched && chance(K.distance * (K.distanceBase + craft(dec).sacrifice))) return told({ t: mate, cult: true });
  const rivals = dreamersHeard(inno);
  return told({ t: rivals.length && chance(K.atDreamer) ? pick(rivals) : fearOf(dec, inno), cult: true });
}
function partingDream(c) {
  if (claimOf(c).role !== 'seer' || dreamtToday(c)) return null;
  if (!chance(c.promised || Ties.cordial(c) ? RULES.talk.partingDream : RULES.talk.partingUnpromised)) return null;
  if (c.role === 'seer') return trueDream(c, true);
  return dreamToYou(c, madeUpDream(c, true), S.loc);
}
function defenderOf(t, c) {
  const K = RULES.claims;
  return (
    shuffle(freeChars()).find(a => {
      if (a.id === t.id || a.id === c.id || claimOf(a).role !== 'seer') return false;
      const mate = a.role === 'cult' && t.role === 'cult';
      if (!(Ties.fond(a.id, t.id) || mate)) return false;
      const can = a.role === 'seer' ? a.visions.some(v => v.about === t.id && !v.cult && !v.veil) : !dreamtToday(a);
      return can && chance(K.defend * craft(a).defend * (mate ? mateOdds(a, t) : 1));
    }) || null
  );
}
const mateGamble = (a, t) => Suspicion.looksLost(t) && Suspicion.hasDreamtAloud(a) && !Suspicion.suspectedBy(a).length;
const mateOdds = (a, t) => (mateGamble(a, t) ? 1 : Math.min(1, TP(a).counter));
function recantTrust(c) {
  const k = pretence(c);
  if (!k || k.indexOf('hid') !== 0 || c.rapport < RULES.scale.trustMax || S.recantTried[c.id] === S.day) return null;
  S.recantTried[c.id] = S.day;
  const hide = c.role === 'seer' ? TP(c).hideSeer : TP(c).hideWarden;
  return chance(RULES.confess.atTrust * (1 - hide / 2)) ? comeClean(c, 'trust') : null;
}
function recantPressed(c) {
  const cl = claimOf(c),
    k = cl && cl.said != null && pretence(c);
  return k && k !== 'staged' && chance(clamp(RULES.claims.pressed + TP(c).confess)) ? comeClean(c, 'pressed') : null;
}
function failedWatch(id) {
  const c = C(id);
  if (!isFree(c)) return '';
  Record.testify(c.id, c.id, 'failwatch', 'slept');
  const [own, deny] = RULES.claims.slept[temperOf(c)],
    how = chance(own) ? 'own' : chance(deny / (1 - own)) ? 'deny' : 'avoid',
    swore = bi(...TX.claims.sworeToKeepWatch(c)),
    said = {
      own: bi(...TX.claims.thisMorningWillNot(c)),
      deny: bi(...TX.claims.iSatUpTill(c)),
      avoid: bi(...TX.claims.thisMorningKeepsOut(c))
    }[how];
  return `<p>${swore} ${said}</p>` + Moments.stir('sleptWatch', { about: c.id, how: how });
}
