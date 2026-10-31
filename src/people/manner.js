// people/manner.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const showMul = c => MANNER[temperOf(c)].shows;
function showP(c, kind) {
  const M = RULES.manner,
    base =
      kind === 'warm'
        ? M.warm[Math.min(RULES.scale.trustMax, c.rapport) - 1] || 0
        : kind === 'cold'
          ? M.cold[Math.min(-RULES.scale.trustMin, -c.rapport) - 1] || 0
          : M.flirt;
  return Math.min(RULES.scale.most, base * showMul(c));
}
const shows = (c, kind) => chance(showP(c, kind));
const slotRoll = (c, k) => hash01(S.salt, c.id, S.day, S.slot, k);
const slotChance = (c, k, p) => p > 0 && slotRoll(c, k) < Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, p));
const slotPick = (c, k, w) => weighted(Object.entries(w), slotRoll(c, k));
const courteous = c => !Ties.against(c) && !Ties.friend(c);
function masked(c, roll) {
  if (!courteous(c)) return false;
  return roll('mask') < Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, MANNER[temperOf(c)].mask));
}
const masks = c => masked(c, () => rand());
const flirtFaces = c => (temperOf(c) === 'lightheaded' ? { ...FACES.flirt, sly: FACES.slyLight } : FACES.flirt),
  jokeFaces = c => (Ties.vowed(c) ? FACES.jokeVows : FACES.joke);
function slyFace(c, ctx) {
  const by = FACES.sly[ctx],
    looks = by[c.id] || by[c.p === 'she' ? 'she' : 'he'];
  return hashPick(looks, S.salt, c.id, S.day, S.slot, 'sly-' + ctx);
}
const slyOr = (c, ctx, f) => (f === 'sly' ? slyFace(c, ctx) : f);
function ownLot(c, at) {
  const F = RULES.feel,
    L = RULES.ties,
    anyOf = xs => 1 - xs.reduce((q, x) => q * (1 - Math.max(0, Math.min(1, x))), 1),
    others = freeChars().filter(o => o.id !== c.id),
    m = Ties.mourning(c),
    lost = m && S.day - m.day <= 1 && S.chars[m.victim] ? Ties.likes(c, m.victim) : 0,
    grief = (lost >= L.close ? F.grief.close : lost >= L.fond ? F.grief.fond : 0) * (m && m.done ? F.comforted : 1),
    against = others.reduce((n, o) => n + (Ties.likes(o, c) <= L.cannotBear ? 2 : Ties.likes(o, c) <= L.dislike ? 1 : 0), 0),
    v = S.log && S.log.visit,
    shamed = !!v && v.shamed === S.day && v.id === c.id,
    trouble = anyOf([
      F.suspicion * others.reduce((n, o) => n + Suspicion.level(o, c), 0),
      grief,
      Math.min(F.dislikedMax, F.disliked * Math.max(0, against - F.dislikedFrom)),
      shamed ? F.shame : 0
    ]),
    near = at && S.here && S.here[at] ? S.here[at].filter(id => id !== c.id && isFree(C(id))) : [],
    glad = anyOf(near.map(id => (Ties.likes(c, id) >= L.close ? F.close : Ties.likes(c, id) >= L.fond ? F.fond : 0)));
  return { trouble: Math.min(F.max, trouble), glad: Math.min(F.max, glad) };
}
const placeOf = c => (S.here ? Object.keys(S.here).find(l => S.here[l].includes(c.id)) : null) || null;
function lotFace(c, at, k = 1) {
  const o = MANNER[temperOf(c)].open,
    f = ownLot(c, at);
  if (slotChance(c, 'trouble', f.trouble * o * k)) return FACES.troubled;
  if (slotChance(c, 'glad', f.glad * o * k)) return slotPick(c, 'gladFace', FACES.glad);
  return null;
}
function dayFace(c) {
  if (!slotChance(c, 'whim', RULES.manner.whim * MANNER[temperOf(c)].open)) return null;
  const good = slotChance(c, 'goodDay', FACES.goodDay);
  return { good: good, face: good ? slotPick(c, 'face', FACES.good) : FACES.bad };
}
function pictureFace(c, at = placeOf(c)) {
  const lot = lotFace(c, at),
    d = lot ? null : dayFace(c);
  return lot || (d ? d.face : 'neutral');
}
const flirtFace = c => slyOr(c, 'flirt', wpick(flirtFaces(c)));
const jokeFace = c => slyOr(c, 'joke', wpick(jokeFaces(c)));
function greeting(c) {
  const at = S.day + ':' + S.slot;
  if (!c.greeted || c.greeted.at !== at) c.greeted = { at: at, g: greetNow(c) };
  return c.greeted.g;
}
function greetNow(c) {
  if (Ties.sweetOnYou(c) && slotChance(c, 'flirt', RULES.flirt.greet * showMul(c) * talkSoft()))
    return { text: flirtGreet(c), face: slyOr(c, 'flirt', slotPick(c, 'face', flirtFaces(c))) };
  const lot = lotFace(c, placeOf(c) || S.loc, 1 + RULES.feel.trust * (Ties.trust(c) - 1));
  if (lot && !slotChance(c, 'compose', RULES.feel.compose)) {
    const line = tellOne('greet-' + c.id, GREET[c.id]);
    return { text: bi(line), face: lot, cool: HURRIED.has(line) };
  }
  const warm = () => bi(tellOne('greetWarm-' + c.id, GREET_WARM[c.id])),
    cold = () => bi(tellOne('greetCold-' + c.id, GREET_COLD[c.id]));
  if (Ties.cordial(c) && slotChance(c, 'warm', showP(c, 'warm'))) return { text: warm(), face: slotPick(c, 'face', FACES.warm) };
  if (Ties.against(c) && slotChance(c, 'cold', showP(c, 'cold')))
    return { text: cold(), face: Ties.hostile(c) && slotChance(c, 'angry', FACES.angry) ? 'angry' : 'cold', cool: true };
  if (masked(c, k => slotRoll(c, k))) return { text: warm(), face: slotPick(c, 'face', FACES.mask) };
  const d = dayFace(c);
  if (d) return d.good ? { text: warm(), face: d.face } : { text: cold(), face: d.face, cool: true };
  const line = tellOne('greet-' + c.id, GREET[c.id]);
  return { text: bi(line), face: plainFace(c, line), cool: HURRIED.has(line) };
}
function plainFace(c, line) {
  const M = RULES.manner;
  if (JOKES.has(line) && slotChance(c, 'joke', M.joke)) return slyOr(c, 'joke', slotPick(c, 'face', jokeFaces(c)));
  if (Ties.friend(c)) return slotChance(c, 'leak', M.leak * showMul(c)) ? 'warm' : 'smile';
  if (Ties.against(c)) return slotChance(c, 'leak', M.leak * showMul(c)) ? 'cold' : 'neutral';
  return Ties.cordial(c) ? 'smile' : 'neutral';
}
function faceFor(c, e) {
  if (e === 'smile' || e === 'neutral') {
    if (Ties.sweetOnYou(c) && chance(RULES.flirt.face * showMul(c))) return flirtFace(c);
    if (Ties.cordial(c) && shows(c, 'warm')) return 'warm';
    if (Ties.against(c) && shows(c, 'cold')) return 'cold';
    if (masks(c)) return 'smile';
    if (chance(RULES.manner.whim * showMul(c))) {
      if (chance(FACES.goodDay)) return wpick(FACES.good);
      rand();
      return FACES.bad;
    }
    return e;
  }
  if (e === 'thoughtful' && Ties.against(c) && shows(c, 'cold')) return 'cold';
  return e;
}
const WARM_PARTING = [
  c => bi(...TX.manner.walksYouAsFar(c)),
  c => bi(...TX.manner.pressesATwistOf(c)),
  c => bi(...TX.manner.liftsAHandAs(c))
];
const COLD_PARTING = [c => bi(...TX.manner.hasTurnedBackTo(c)), c => __text('doesNotWatchYouGo')];
function parting(c) {
  if (Ties.sweetOnYou(c) && chance(RULES.flirt.parting * showMul(c))) return [sayPick(FLIRT_PARTING)(c), flirtFace(c), 'flirt'];
  if (Ties.friend(c) && chance(RULES.manner.parting * showMul(c))) {
    const w = sayPick(WARM_PARTING);
    return [w(c), 'warm', w === WARM_PARTING[0] ? 'walk' : 'warm'];
  }
  if (Ties.against(c) && chance(RULES.talk.coldParting * showMul(c))) return [sayPick(COLD_PARTING)(c), 'cold', 'cold'];
  return null;
}
