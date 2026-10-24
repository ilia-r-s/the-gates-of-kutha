// ===================== MANNER: what shows of a feeling, and what does not =====================
// A feeling does not always show, in the face or in what is said. How readily it shows depends on how strong it is
// (RULES.manner), on temperament (MANNER: the honest and the light-headed wear theirs openly, the calculating and the
// detached hardly at all), and on the moment: anyone can have a good or a bad day for reasons that have nothing to do
// with you. The cult, courting your trust, may put on a warm face it does not feel. None of this changes what anyone
// feels: the casebook's word for their trust always tells the truth.
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
// a cultist's warm mask: put on for you while it courts your trust, when it feels nothing much either way
const courting = c => c.role === 'cult' && c.rapport >= 0 && c.rapport < 2;
const masks = c => courting(c) && chance(MANNER[temperOf(c)].mask);
// the faces of flirting: coy mostly, but now and then another (a smile, a sly look, a wink); and of a joke about love and
// marriage: sly mostly. A priest's vows keep the flirtation out of it.
const flirtFace = c => wpick(temperOf(c) === 'lightheaded' ? { ...FACES.flirt, wink: FACES.winkLight } : FACES.flirt);
const jokeFace = c => wpick(VOWS.includes(c.id) ? FACES.jokeVows : FACES.joke);

// ---------- greetings, answers and partings ----------
// How they greet you, and the face they greet you with. A flirtatious word now and then, from a woman with a soft spot
// for you; warm words from anyone who likes you, cold ones from someone against you, if they let it show; a warm mask
// from the cult; a good or a bad day, from anyone (warm words, or cold); otherwise an ordinary greeting, though a feeling
// held back may show in the face.
function greeting(c) {
  const M = RULES.manner;
  if (flirtsWithYou(c) && chance(RULES.flirt.greet * showMul(c) * talkSoft())) return { text: flirtGreet(c), face: flirtFace(c) };
  // (each person's greetings of each kind gone through in turn, none twice running: core/text.js, tellOne)
  const warm = () => bi(tellOne('greetWarm-' + c.id, GREET_WARM[c.id])),
    cold = () => bi(tellOne('greetCold-' + c.id, GREET_COLD[c.id]));
  if (c.rapport >= 1 && shows(c, 'warm')) return { text: warm(), face: wpick(FACES.warm) };
  if (c.rapport <= -1 && shows(c, 'cold')) return { text: cold(), face: c.rapport <= -2 && chance(FACES.angry) ? 'angry' : 'cold' };
  if (masks(c)) return { text: warm(), face: wpick(FACES.mask) };
  // a good day or a bad one, whatever they feel about you: a friend can be curt, and someone against you civil
  if (chance(M.whim * showMul(c)))
    return chance(FACES.goodDay) ? { text: warm(), face: wpick(FACES.good) } : { text: cold(), face: wpick(FACES.bad) };
  const line = tellOne('greet-' + c.id, GREET[c.id]);
  return { text: bi(line), face: plainFace(c, line) };
}
function plainFace(c, line) {
  const M = RULES.manner;
  if (JOKES.has(line) && chance(M.joke)) return jokeFace(c);
  if (c.rapport >= 2) return chance(M.leak * showMul(c)) ? 'warm' : 'smile';
  if (c.rapport <= -1) return chance(M.leak * showMul(c)) ? 'cold' : 'neutral';
  return c.rapport >= 1 ? 'smile' : 'neutral';
}
// The face they make as they answer: the answer's own, warmed or cooled by how they feel about you if it shows, now and
// then a flirtatious look, the cult's warm mask, or a good day or a bad one (anyone's, as at a greeting).
function faceFor(c, e) {
  if (e === 'smile' || e === 'neutral') {
    if (flirtsWithYou(c) && chance(RULES.flirt.face * showMul(c))) return flirtFace(c);
    if (c.rapport >= 1 && shows(c, 'warm')) return 'warm';
    if (c.rapport <= -1 && shows(c, 'cold')) return 'cold';
    if (masks(c)) return 'smile';
    if (chance(RULES.manner.whim * showMul(c))) return wpick(chance(FACES.goodDay) ? FACES.good : FACES.bad);
    return e;
  }
  if (e === 'thoughtful' && c.rapport <= -1 && shows(c, 'cold')) return 'cold';
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
// all from someone against you. Returns [the note, the face], or null.
function parting(c) {
  if (flirtsWithYou(c) && chance(RULES.flirt.parting * showMul(c))) return [pick(FLIRT_PARTING)(c), flirtFace(c)];
  if (c.rapport >= 2 && chance(RULES.manner.parting * showMul(c))) return [pick(WARM_PARTING)(c), 'warm'];
  if (c.rapport <= -1 && chance(RULES.talk.coldParting * showMul(c))) return [pick(COLD_PARTING)(c), 'cold'];
  return null;
}

// ---------- the faces drawn about the dig ----------
// Decided without the dice (a picture may be redrawn at any moment), fixed for the slot: whom someone is sweet on, what
// the camp suspects of them, how they feel about you, the cult's mask, or the mood of the moment.
function castMood(c) {
  const h = k => hash01(S.salt, c.id, S.day, S.slot, k),
    M = RULES.manner;
  if (flirtsWithYou(c) && h('flirt') < M.flirt * showMul(c) * FACES.castFlirt)
    return hashPick(FACES.castFlirtFaces, S.salt, c.id, S.day, S.slot);
  if (suspectedBy(c.id).length >= 2 && h('sus') < FACES.suspected * showMul(c)) return h('fear') < FACES.sad ? 'sad' : 'fear';
  if (c.rapport >= 1 && h('warm') < showP(c, 'warm')) return 'warm';
  if (c.rapport <= -1 && h('cold') < showP(c, 'cold')) return 'cold';
  if (courting(c) && h('mask') < MANNER[temperOf(c)].mask) return 'smile';
  if (h('whim') < M.whim * showMul(c)) return hashPick(FACES.castWhim, S.salt, c.id, S.day, S.slot, 'whimFace'); // (its own key: the whim's would always pick the first)
  return 'neutral';
}
// at an inquiry: your friends worried; everyone else grim, mostly (the faces never tell who the camp suspects: what
// the case comes to is for you to judge)
function inquiryMood(c) {
  const k = hash01(S.salt, c.id, S.day, 'inquiry'),
    I = FACES.inquiry;
  return byShare(k, c.rapport >= 2 ? I.friend : I.other);
}
// the face whose share of [0, 1) holds k, the shares taken in order: [[face, share], ...]
function byShare(k, shares) {
  let at = 0;
  for (const [face, s] of shares) if (k < (at += s)) return face;
  return shares[shares.length - 1][0];
}
