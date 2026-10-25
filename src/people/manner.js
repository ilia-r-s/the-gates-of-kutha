// ===================== MANNER: what shows of a feeling, and what does not =====================
// A feeling does not always show, in the face or in what is said. How readily it shows depends on how strong it is
// (RULES.manner), on temperament (MANNER: the honest and the light-headed wear theirs openly, the calculating and the
// detached hardly at all), and on the moment: anyone can have a good or a bad day for reasons that have nothing to do
// with you. Anyone who feels nothing much either way about you may put on a pleasant face, the cult, courting your
// trust, a little more readily. None of this changes what anyone feels: the casebook's word for their trust always tells
// the truth.
const showMul = c => MANNER[temperOf(c)].shows;
// the chance that how someone feels about you shows just now: warmth, coldness, or a flirtatious look
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
// What shows of someone this slot, fixed without the dice (k: what it decides): the face in the picture of the place and
// the greeting you get if you go up to them agree, and neither changes when the picture is drawn again or the
// conversation opened again (thinking better of it before you ask anything is no conversation, and learns you nothing).
const slotRoll = (c, k) => hash01(S.salt, c.id, S.day, S.slot, k);
// a chance fixed for the slot (no surer than scale.surest, no rarer than scale.rarest, as any chance)
const slotChance = (c, k, p) => p > 0 && slotRoll(c, k) < Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, p));
// one of some faces by weight, fixed for the slot
function slotPick(c, k, w) {
  let r = slotRoll(c, k) * Object.values(w).reduce((a, b) => a + b, 0);
  for (const f in w) if ((r -= w[f]) < 0) return f;
  return Object.keys(w)[0];
}
// A pleasant face put on for you without the feeling behind it, by anyone who feels nothing much either way about you
// (trust 0 or 1), as readily as their temperament puts on faces (MANNER.mask: the calculating and the liar the most, the
// honest hardly ever). One of the cult, courting your trust, puts it on as anyone of its temperament might and then, as
// it were, a second time over: a little more readily than anyone, never twice as readily, so that a pleasant face from
// someone who feels nothing for you says little of what they are. roll(k): a number in [0, 1) for each try (k: mask,
// court), from the dice or fixed for the slot.
const courteous = c => !Ties.against(c) && !Ties.friend(c); // (reserved or cordial)
function masked(c, roll) {
  if (!courteous(c)) return false;
  const m = Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, MANNER[temperOf(c)].mask));
  return roll('mask') < m || (c.role === 'cult' && roll('court') < m);
}
const masks = c => masked(c, () => rand());
// the faces of flirting: coy mostly, but now and then another (a smile, a smirk, a sly look); and of a joke about love
// and marriage: a smirk mostly. A priest's vows keep the flirtation out of it.
const flirtFaces = c => (temperOf(c) === 'lightheaded' ? { ...FACES.flirt, sly: FACES.slyLight } : FACES.flirt),
  jokeFaces = c => (Ties.vowed(c) ? FACES.jokeVows : FACES.joke);
// The sly look, in a joke (ctx 'joke') or a flirtation ('flirt'): which looks it may be is whose it is (FACES.sly: in a
// joke, a man's a wink, a sidelong glance or an arched brow, Constance's a wink or an arched brow, Ilse's a sidelong
// glance or an arched brow; flirting, Constance's a sidelong glance, an arched brow or heavy lids, Ilse's those or a look
// from under the lashes), and which of them, fixed for the slot without the dice, as a greeting is.
function slyFace(c, ctx) {
  const by = FACES.sly[ctx],
    looks = by[c.id] || by[c.p === 'she' ? 'she' : 'he'];
  return hashPick(looks, S.salt, c.id, S.day, S.slot, 'sly-' + ctx);
}
const slyOr = (c, ctx, f) => (f === 'sly' ? slyFace(c, ctx) : f);
// the day the camp heard the night she spent in your tent told badly before her (people/camp.js, STIRS.scandal), it
// shows in her face, mostly (FACES.shamed): in the picture of the place and as she greets you, fixed for the slot
const shamed = c =>
  !!S.log && !!S.log.visit && S.log.visit.shamed === S.day && S.log.visit.id === c.id && slotChance(c, 'shamed', FACES.shamed);
const flirtFace = c => slyOr(c, 'flirt', wpick(flirtFaces(c)));
const jokeFace = c => slyOr(c, 'joke', wpick(jokeFaces(c)));

// ---------- greetings, answers and partings ----------
// How they greet you, and the face they greet you with. A flirtatious word now and then, from a woman with a soft spot
// for you; warm words from anyone who likes you, cold ones from someone against you, if they let it show; a pleasant face
// put on (above); a good or a bad day, from anyone (warm words, or cold); otherwise an ordinary greeting, though a
// feeling held back may show in the face. Settled once a slot, for the slot (above): a conversation opened again, after
// thinking better of it, opens the same way. cool: a cold greeting, or one in a hurry (ui/talk.js).
function greeting(c) {
  const at = S.day + ':' + S.slot;
  if (!c.greeted || c.greeted.at !== at) c.greeted = { at, g: greetNow(c) };
  return c.greeted.g;
}
function greetNow(c) {
  const M = RULES.manner;
  if (shamed(c)) {
    const line = tellOne('greet-' + c.id, GREET[c.id]);
    return { text: bi(line), face: 'sad', cool: HURRIED.has(line) };
  }
  if (Ties.sweetOnYou(c) && slotChance(c, 'flirt', RULES.flirt.greet * showMul(c) * talkSoft()))
    return { text: flirtGreet(c), face: slyOr(c, 'flirt', slotPick(c, 'face', flirtFaces(c))) };
  // (each person's greetings of each kind gone through in turn, none twice running: core/text.js, tellOne)
  const warm = () => bi(tellOne('greetWarm-' + c.id, GREET_WARM[c.id])),
    cold = () => bi(tellOne('greetCold-' + c.id, GREET_COLD[c.id]));
  if (Ties.cordial(c) && slotChance(c, 'warm', showP(c, 'warm'))) return { text: warm(), face: slotPick(c, 'face', FACES.warm) };
  if (Ties.against(c) && slotChance(c, 'cold', showP(c, 'cold')))
    return { text: cold(), face: Ties.hostile(c) && slotChance(c, 'angry', FACES.angry) ? 'angry' : 'cold', cool: true };
  if (masked(c, k => slotRoll(c, k))) return { text: warm(), face: slotPick(c, 'face', FACES.mask) };
  // a good day or a bad one, whatever they feel about you: a friend can be curt, and someone against you civil
  if (slotChance(c, 'whim', M.whim * showMul(c)))
    return slotChance(c, 'goodDay', FACES.goodDay)
      ? { text: warm(), face: slotPick(c, 'face', FACES.good) }
      : { text: cold(), face: slotPick(c, 'face', FACES.bad), cool: true };
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
// The face they make as they answer: the answer's own, warmed or cooled by how they feel about you if it shows, now and
// then a flirtatious look, a pleasant face put on (above), or a good day or a bad one (anyone's, as at a greeting).
function faceFor(c, e) {
  if (e === 'smile' || e === 'neutral') {
    if (Ties.sweetOnYou(c) && chance(RULES.flirt.face * showMul(c))) return flirtFace(c);
    if (Ties.cordial(c) && shows(c, 'warm')) return 'warm';
    if (Ties.against(c) && shows(c, 'cold')) return 'cold';
    if (masks(c)) return 'smile';
    if (chance(RULES.manner.whim * showMul(c))) return wpick(chance(FACES.goodDay) ? FACES.good : FACES.bad);
    return e;
  }
  if (e === 'thoughtful' && Ties.against(c) && shows(c, 'cold')) return 'cold';
  return e;
}
const WARM_PARTING = [
  c =>
    bi(
      `${c.short} walks you as far as the light railway, talking about nothing in particular.`,
      `${ru.c(c)} провожает вас до узкоколейки, болтая о пустяках.`
    ),
  c => bi(`${c.short} presses a twist of dates into your hand for the road.`, `${ru.c(c)} суёт вам в руку кулёк фиников — на дорогу.`),
  c =>
    bi(
      `${c.short} lifts a hand as you go, and keeps it raised a moment longer than ${c.p} needs to.`,
      `${ru.c(c)} поднимает руку вам вслед и не опускает её чуть дольше, чем нужно.`
    )
];
const COLD_PARTING = [
  c =>
    bi(
      `${c.short} has turned back to ${c.pp} work before you are out of earshot.`,
      `${ru.c(c)} возвращается к работе, не дожидаясь, пока вы отойдёте.`
    ),
  c => bi(`${c.short} does not watch you go.`, `${ru.c(c)} не смотрит вам вслед.`)
];
// A last look as you go, if anything shows: a lingering one from someone sweet on you, a warm one from a friend, none at
// all from someone against you. Returns [the note, the face, its kind (flirt, warm, walk: they walk you to the railway,
// cold), for the leave line not to gainsay it: ui/talk.js], or null.
function parting(c) {
  if (Ties.sweetOnYou(c) && chance(RULES.flirt.parting * showMul(c))) return [pick(FLIRT_PARTING)(c), flirtFace(c), 'flirt'];
  if (Ties.friend(c) && chance(RULES.manner.parting * showMul(c))) {
    const w = pick(WARM_PARTING);
    return [w(c), 'warm', w === WARM_PARTING[0] ? 'walk' : 'warm'];
  }
  if (Ties.against(c) && chance(RULES.talk.coldParting * showMul(c))) return [pick(COLD_PARTING)(c), 'cold', 'cold'];
  return null;
}

// ---------- the faces drawn about the dig ----------
// Decided without the dice (a picture may be redrawn at any moment), fixed for the slot (slotRoll, above: the same rolls
// as the greeting's, so that the face in the picture is the face they greet you with): whom someone is sweet on, what
// the camp suspects of them, how they feel about you, a pleasant face put on, or the mood of the moment.
function castMood(c) {
  const h = k => slotRoll(c, k),
    M = RULES.manner;
  if (shamed(c)) return 'sad';
  if (Ties.sweetOnYou(c) && h('flirt') < M.flirt * showMul(c) * FACES.castFlirt)
    return slyOr(c, 'flirt', hashPick(FACES.castFlirtFaces, S.salt, c.id, S.day, S.slot));
  if (suspectedBy(c.id).length >= 2 && h('sus') < FACES.suspected * showMul(c)) return h('fear') < FACES.sad ? 'sad' : 'fear';
  if (Ties.cordial(c) && slotChance(c, 'warm', showP(c, 'warm'))) return 'warm';
  if (Ties.against(c) && slotChance(c, 'cold', showP(c, 'cold'))) return 'cold';
  if (masked(c, h)) return slotPick(c, 'face', FACES.mask);
  if (slotChance(c, 'whim', M.whim * showMul(c))) return hashPick(FACES.castWhim, S.salt, c.id, S.day, S.slot, 'whimFace'); // (its own key: the whim's would always pick the first)
  return 'neutral';
}
// at an inquiry: your friends worried; everyone else grim, mostly (the faces never tell who the camp suspects: what
// the case comes to is for you to judge)
function inquiryMood(c) {
  const k = hash01(S.salt, c.id, S.day, 'inquiry'),
    I = FACES.inquiry;
  return byShare(k, Ties.friend(c) ? I.friend : I.other);
}
// the face whose share of [0, 1) holds k, the shares taken in order: [[face, share], ...]
function byShare(k, shares) {
  let at = 0;
  for (const [face, s] of shares) if (k < (at += s)) return face;
  return shares[shares.length - 1][0];
}
