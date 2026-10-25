// ===================== CLAIMS: who says they are what =====================
// Crane's diary names a Dreamer and a Watcher. The true Dreamer and Watcher claim their part, or hide it (afraid of the
// knife; a watcher works better unseen); the honest among them evade the question rather than lie. Everyone else may
// claim a part that is not theirs, and what decides it is their temperament and nothing else: the cult claims as cover,
// anyone else to be listened to, but at the same odds, so that a claim alone says nothing of who makes it (the thief
// may claim the watch as a cover for his nights besides). Later, one who begins to look lost may claim a part they never
// spoke of (cornerClaims), and one named guilty in a dream told aloud may claim to dream on the spot (game/night.js):
// the cult as anyone. What the cult does with a claim is where it differs: people/claims.js, cultDream.
function assignClaims() {
  S.claim = {};
  S.loud = null;
  S.fakeGuard = null;
  S.order.forEach(id => {
    const c = C(id),
      t = TP(c),
      K = RULES.claims,
      honest = temperOf(c) === 'honest' && !chance(RULES.scale.rarest); // (the honest evade rather than lie, nearly always)
    let role = 'none',
      why = 'truth';
    if (c.role === 'seer' || c.role === 'warden') {
      if (chance(c.role === 'seer' ? t.hideSeer : t.hideWarden)) {
        why = 'conceal';
        role = honest ? 'evade' : 'none';
      } else role = c.role;
    } else if (c.role === 'smuggler' && !honest && chance(t.cover)) {
      role = 'warden'; // (his nights out explained)
      why = 'conceal';
    } else if (!honest && chance(t.liked)) {
      role = chance(K.likedSeer) ? 'seer' : 'warden';
      why = c.role === 'cult' ? 'deceit' : 'liked';
    } else if (chance(honest ? K.evadeHonest : K.evadeAny)) {
      role = 'evade'; // (nothing to claim, and will not say all the same)
      why = c.role === 'smuggler' || c.role === 'cult' ? 'conceal' : 'reticent';
    } else if (c.role === 'smuggler' || c.role === 'cult') why = 'conceal'; // (no part, as they say; not all they are)
    S.claim[id] = { role, why, said: null, recanted: null };
  });
}
const claimOf = c => S.claim[typeof c === 'string' ? c : c.id];
const trueClaim = c => (c.role === 'seer' ? 'seer' : c.role === 'warden' ? 'warden' : 'none');
const lying = c => claimOf(c).role !== trueClaim(c);
// a claim becomes known to you: the first time someone states it, to you or to the whole camp
function sayClaim(c) {
  const cl = claimOf(c);
  if (!cl) return;
  if (cl.said == null) cl.said = S.day;
  Record.testify(c.id, c.id, 'claim', cl.role);
}
function claimSay(c, role) {
  const k = pick([0, 1, 2]),
    g = (m, f) => ru.gs(c, m, f);
  if (role === 'seer')
    return bi(
      [
        'Crane meant me, I think. I dream, Doctor, and what I dream comes to pass.',
        'I did not want to say it in front of the others. I dream. I have always dreamed true.',
        'You are looking at the Dreamer. Since the tablets came up, I have dreamed of those seven gates every night.'
      ][k],
      [
        'Думаю, Крейн имел в виду меня. Мне снятся сны, доктор, и то, что мне снится, сбывается.',
        `Я не ${g('хотел', 'хотела')} говорить при остальных. Мне снятся сны. И они всегда сбывались.`,
        `${g('Сновидец', 'Сновидица')} перед вами. С тех пор как подняли таблички, мне каждую ночь снятся эти семь врат.`
      ][k]
    );
  if (role === 'warden')
    return bi(
      [
        'I sleep very little, Doctor. Someone has to sit up with a lamp in this camp, and it has been me.',
        'Crane asked me to keep watch, the week before he died. I have not stopped.',
        'The one who keeps watch? That part is mine, God help me.'
      ][k],
      [
        'Я почти не сплю, доктор. Кто-то должен сидеть ночью с лампой в этом лагере — и сижу я.',
        'За неделю до смерти Крейн попросил меня присматривать за лагерем. С тех пор я не перестаю.',
        'Тот, кто стоит на страже? Это моя доля, помоги мне Господь.'
      ][k]
    );
  if (role === 'evade')
    return bi(
      [
        'I would rather not answer that, Doctor.',
        'Crane wrote a great many things. I will not say which of them were about me.',
        'Ask me something else, Doctor. Please.'
      ][k],
      [
        `Я бы ${g('предпочёл', 'предпочла')} не отвечать на этот вопрос, доктор.`,
        'Крейн много чего писал. Что из этого обо мне — я не скажу.',
        'Спросите меня о чём-нибудь другом, доктор. Пожалуйста.'
      ][k]
    );
  return bi(
    [
      'I am not in that diary, Doctor. I do my work, I sleep, and I dream of nothing at all.',
      'Crane wrote a great many things that spring. None of them about me.',
      'Dreams and watchmen. No, Doctor. I am exactly what I seem.'
    ][k],
    [
      'Меня в этом дневнике нет, доктор. Я делаю свою работу, сплю, и мне ничего не снится.',
      'Той весной Крейн много чего писал. Но не обо мне.',
      `Сны и дозорные. Нет, доктор. Я ровно ${g('тот', 'та')}, кем кажусь.`
    ][k]
  );
}
// Liars sometimes give themselves away, some far more than others; now and then an honest answer looks the same.
// The honest do not lie, so there is nothing to give away: they simply will not answer.
function claimTell(c) {
  if (claimOf(c).role === 'evade')
    return chance(RULES.talk.evadeNote)
      ? bi(
          `${c.short} does not make anything up. ${EP.He(c)} simply will not answer.`,
          `${ru.c(c)} ничего не выдумывает — просто не отвечает.`
        )
      : null;
  if (!chance(lying(c) ? TP(c).tell : temperOf(c) === 'suspicious' ? RULES.talk.tellSuspicious : RULES.talk.tellTruthful)) return null;
  Record.testify(c.id, c.id, 'tell', 'quick');
  const k = pick([0, 1]);
  return bi(
    [`${c.short} answers a shade too quickly.`, `${c.short} looks at the lamp, not at you, while answering.`][k],
    [`${ru.c(c)} отвечает чуть поспешнее, чем следовало бы.`, `Отвечая, ${ru.c(c)} смотрит на лампу, а не на вас.`][k]
  );
}
// ---------- dreams ----------
// The true Dreamer dreams the truth about one person a night (game/night.js, dreamTonight), the night Crane died
// among them. Whoever only says they dream makes one up: a pretender at a guess (fakeDream), the cult for the cult
// (cultDream), lying only where a lie pays; a dream made up is dreamt once a night, and told again the same day (at
// breakfast, asked, or in parting) it is the same dream. Told, a dream speaks their claim and is noted for or against
// the one dreamt of.
// d: { t: the one dreamt of, cult: guilty }; t told with their own pronoun after the name, as the Russian does
const dreamEn = (t, cult) =>
  cult
    ? `${t.short} stood inside the seventh, and the god’s hand was on ${t.pp} shoulder.`
    : `${t.short} stood outside them, weeping. Whatever ${t.p} is, ${t.p} is not one of theirs.`;
const dreamRu = (t, cult) =>
  cult
    ? `${ru.c(t)} ${ru.gs(t, 'стоял', 'стояла')} за седьмыми, и рука бога лежала у ${ru.gs(t, 'него', 'неё')} на плече.`
    : `${ru.c(t)} ${ru.gs(t, 'стоял', 'стояла')} снаружи и ${ru.gs(t, 'плакал', 'плакала')}. Кем бы ${ru.gs(t, 'он ни был', 'она ни была')}, ${ru.gs(t, 'он', 'она')} не из них.`;
// a dream as told at breakfast, by c, named just before: [English, Russian]
const dreamSaid = (c, d) => [
  `“I dreamt of the seven gates,” ${c.p} says. “${dreamEn(d.t, d.cult)}”`,
  `«Мне снились семь врат, — говорит ${ru.gs(c, 'он', 'она')}. — ${dreamRu(d.t, d.cult)}»`
];
function tellDream(c, d) {
  sayClaim(c);
  Record.testify(c.id, d.t.id, 'vision', d.cult ? 'cult' : 'clean');
  return d;
}
// who says they dream and does not: anyone at all, the cult's own as anyone's. Nobody outside can tell them apart by
// what they do, only, now and then, by what they dream.
const claimsToDream = c => c.role !== 'seer' && claimOf(c).role === 'seer';
// the true Dreamer's dream to tell, if they own the gift: the latest about someone still here (fresh: not yet told);
// once told, it is the Dreamer's dream of the day, as a made-up one is anyone else's (dreamtToday)
function trueDream(c, fresh = false) {
  if (c.role !== 'seer' || claimOf(c).role !== 'seer') return null;
  const v = c.visions.filter(x => isFree(C(x.about)) && !(fresh && x.told)).pop();
  if (!v) return null;
  v.told = true;
  c.dreamt = { day: S.day, d: { t: C(v.about), cult: v.cult } };
  return tellDream(c, c.dreamt.d);
}
// today's made-up dream (dreamtToday: one has been told already today)
const dreamtToday = c => !!c.dreamt && c.dreamt.day === S.day;
// a dream dreamt for the occasion (an answer at breakfast): today's, from now on, and told
const dreamNow = (c, d) => {
  c.dreamt = { day: S.day, d };
  return tellDream(c, d);
};
// Someone who claimed no part, named guilty in a dream told aloud, may claim on the spot to dream as well (heat: in a
// temper, not to be liked): from now on one who claims to dream like any other, of the cult or not.
function claimOnTheSpot(c) {
  Object.assign(claimOf(c), { role: 'seer', why: c.role === 'cult' ? 'deceit' : 'liked', heat: true });
}
// Someone who has said nothing of the diary yet, and begins to look lost (people/cunning.js, looksLost: a strong case, or
// two of the camp suspecting them in earnest), may claim a part they never spoke of, a dawn at cornered × their
// readiness to claim one (TEMPERS liked): the cult to cover itself, anyone else in fear; the same odds for both. Nobody
// hears of it until they say it (asked, or dreaming aloud).
function cornerClaims() {
  const K = RULES.claims;
  freeChars().forEach(c => {
    const cl = claimOf(c);
    if (c.role === 'seer' || c.role === 'warden' || cl.role !== 'none' || cl.said != null || !Suspicion.looksLost(c)) return;
    if (!chance(K.cornered * TP(c).liked)) return;
    Object.assign(cl, { role: chance(K.likedSeer) ? 'seer' : 'warden', why: c.role === 'cult' ? 'deceit' : 'liked' });
  });
}
// A dream made up for the occasion, dreamt once a day and told the same way again that day: the cult's (cultDream) or
// anyone else's (fakeDream).
function madeUpDream(c) {
  if (!dreamtToday(c)) c.dreamt = { day: S.day, d: c.role === 'cult' ? cultDream(c) : fakeDream(c) };
  return c.dreamt.d;
}
// those who have dreamt aloud before everyone, of a pool
const dreamersHeard = pool => pool.filter(Suspicion.hasDreamtAloud);
// A pretender's dream, guilty or clean at a guess: guilty for someone they dislike or suspect (dreaming their own fears),
// or, now and then, a rival who has dreamt aloud too; clean for a friend.
function fakeDream(c) {
  const K = RULES.claims,
    pool = freeChars().filter(o => o.id !== c.id);
  if (!pool.length) return null;
  if (!chance(K.fakeGuilty)) return { t: Ties.pickByLike(c, pool, 1), cult: false };
  const rivals = dreamersHeard(pool);
  if (rivals.length && chance(K.atDreamer)) return { t: pick(rivals), cult: true };
  return { t: fearOf(c, pool), cult: true };
}
// whom someone's fears settle on, of a pool: those they dislike, the more, and those they suspect, the more
function fearOf(c, pool) {
  const w = {};
  pool.forEach(o => {
    w[o.id] = Math.max(RULES.likes.floor, 1 - RULES.likes.pull * Ties.likes(c.id, o.id)) * (1 + Suspicion.level(c.id, o.id));
  });
  return C(wpick(w));
}
// Who is closing in on the cult, as one of it sees it: anyone outside it who suspects one of it in earnest, or a dreamer
// heard to name one of it guilty; the more suspicion, and the more such dreams, the likelier.
function closingIn(dec, pool) {
  const w = {};
  pool.forEach(o => {
    const v = Suspicion.threat.closingIn(o);
    if (v > 0) w[o.id] = v;
  });
  return Object.keys(w).length ? C(wpick(w)) : null;
}
// The cult's own dreamer dreams, by default, as any pretender would: guilty now and then, clean otherwise, of a friend
// (and the other of it is a friend), so that its dreams, taken together, look like anyone's. Where a dream can pay, it
// pays (RULES.claims):
// - the other of it, once that one looks lost, given up by one ruthless enough (people/cunning.js, busFor): true;
// - the other of it, once it is watched (anyone suspects it in earnest, or someone named it aloud), cleared (shield): a lie;
// - whoever is closing in on it, named guilty (frame): a lie;
// - and a guilty dream otherwise names, as often as not, the other of it while that one is not watched, to stand apart
//   from it at no cost (distance × (½ + CRAFT sacrifice)): true; else one it dislikes or fears, or a rival dreamer: a lie.
// A true dream told by the cult counts as one of its truths (S.log.cultTruth).
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
// A dream told as you take your leave, by anyone who says they dream and has told none today, the true Dreamer by the
// same odds as anyone who only says so: now and then if they promised you their dreams or trust you
// (talk.partingDream), seldom if not (partingUnpromised). The true Dreamer tells one you have not heard yet, if there is
// one; anyone else, the day's made-up dream.
function partingDream(c) {
  if (claimOf(c).role !== 'seer' || dreamtToday(c)) return null;
  if (!chance(c.promised || Ties.cordial(c) ? RULES.talk.partingDream : RULES.talk.partingUnpromised)) return null;
  if (c.role === 'seer') return trueDream(c, true);
  const d = madeUpDream(c);
  return d && tellDream(c, d);
}
// Who answers for one named guilty in a dream told aloud (t, by c): anyone else here who claims to dream, the true
// Dreamer among them, for one they would protect (a friend; for the cult, the other of it as well), as readily as they
// stand up for anyone (CRAFT defend); the true Dreamer only with a clean dream of them to tell, anyone else with no
// dream told yet today. The cult answering for the other of it is the exception (mateOdds).
function defenderOf(t, c) {
  const K = RULES.claims;
  return (
    shuffle(freeChars()).find(a => {
      if (a.id === t.id || a.id === c.id || claimOf(a).role !== 'seer') return false;
      const mate = a.role === 'cult' && t.role === 'cult';
      if (!(Ties.fond(a.id, t.id) || mate)) return false;
      const can = a.role === 'seer' ? a.visions.some(v => v.about === t.id && !v.cult) : !dreamtToday(a);
      return can && chance(K.defend * craft(a).defend * (mate ? mateOdds(a, t) : 1));
    }) || null
  );
}
// One of the cult answering a dream told aloud for the other of it is, as a rule, a poor gamble: it ties the two of
// them together before everyone, a dream that names the answerer next makes its story dangerous, and a story given up
// later undoes the answer and gives it away. So mostly only the rash fall into it, as readily as they would answer a
// dream against themselves (TEMPERS counter, at most 1: the light-headed, the liar, the suspicious; seldom the
// calculating, the detached, the conscientious, the honest). It pays only when the other of it is all but lost already
// and the answerer's word is worth something: it has dreamt aloud before, and nobody suspects it; then anyone of the
// cult may stake its word on it. (Measured: answering for a partner not yet lost, or late in the season, helped you
// rather than the cult; for one already lost, by one already believed, it helped the cult.)
const mateGamble = (a, t) => Suspicion.looksLost(t) && Suspicion.hasDreamtAloud(a) && !Suspicion.suspectedBy(a).length;
const mateOdds = (a, t) => (mateGamble(a, t) ? 1 : Math.min(1, TP(a).counter));
// The true Dreamer and Watcher who hid their part come clean once they trust you enough, mostly (confess.atTrust, the
// less the more they would hide it): a chance a day, however often you come to talk (S.recantTried).
function recantTrust(c) {
  const k = pretence(c);
  if (!k || k.indexOf('hid') !== 0 || c.rapport < RULES.scale.trustMax || S.recantTried[c.id] === S.day) return null;
  S.recantTried[c.id] = S.day;
  const hide = c.role === 'seer' ? TP(c).hideSeer : TP(c).hideWarden;
  return chance(RULES.confess.atTrust * (1 - hide / 2)) ? comeClean(c, 'trust') : null;
}
// Pressed hard enough, anyone keeping up a story may give it up: a part claimed that is not theirs, a watch that was a
// smuggler's cover, or a true part hidden; at claims.pressed + their readiness to come clean (TEMPERS confess), the
// cult as anyone (a cover story given up before it is broken: the same words, and the cult's lie goes on underneath).
function recantPressed(c) {
  const cl = claimOf(c),
    k = cl && cl.said != null && pretence(c); // (a coming clean staged of a morning is not something pressing brings out)
  return k && k !== 'staged' && chance(clamp(RULES.claims.pressed + TP(c).confess)) ? comeClean(c, 'pressed') : null;
}
// a sworn watch that did not happen, seen the morning after you were attacked; the camp hears of it
function failedWatch(id) {
  const c = C(id);
  if (!isFree(c)) return '';
  Record.testify(c.id, c.id, 'failwatch', 'slept');
  // owned up to, denied, or not spoken of at all, as their temperament runs (RULES.claims.slept: [own, deny])
  const [own, deny] = RULES.claims.slept[temperOf(c)],
    how = chance(own) ? 'own' : chance(deny / (1 - own)) ? 'deny' : 'avoid',
    swore = bi(
      `${c.short} swore to keep watch over your tent last night.`,
      `${ru.c(c)} ${ru.gs(c, 'клялся', 'клялась')} этой ночью стеречь вашу палатку.`
    ),
    said = {
      own: bi(
        `This morning ${c.p} will not meet your eye. “I must have slept,” ${c.p} says.`,
        `Утром ${ru.gs(c, 'он', 'она')} не смотрит вам в глаза. «Должно быть, я ${ru.gs(c, 'заснул', 'заснула')}», — говорит ${ru.gs(c, 'он', 'она')}.`
      ),
      deny: bi(
        `“I sat up till dawn,” ${c.p} says this morning. “Nothing came past me.” Something did.`,
        `«Я до рассвета глаз не ${ru.gs(c, 'сомкнул', 'сомкнула')}, — говорит ${ru.gs(c, 'он', 'она')} утром. — Мимо меня никто не проходил». Кто-то всё же прошёл.`
      ),
      avoid: bi(
        `This morning ${c.p} keeps out of your way, and is off to the trench before breakfast is over.`,
        `Утром ${ru.gs(c, 'он', 'она')} старательно избегает вас и уходит на раскоп, не дождавшись конца завтрака.`
      )
    }[how];
  return `<p>${swore} ${said}</p>` + Moments.stir('sleptWatch', { about: c.id, how });
}
