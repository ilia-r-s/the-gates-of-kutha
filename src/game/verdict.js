// game/verdict.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function angerSay() {
  const a = S.anger || 0,
    W = RULES.verdict.walkoutFrom;
  if (a >= W) return `<p class="warn">${bi(...TX.verdict.theCampPatienceIs())}</p>`;
  if (a >= W / 2) return `<p class="warn">${bi(...TX.verdict.theCampIsRestless())}</p>`;
  if (wearyOf()) return `<p class="warn">${bi(...TX.verdict.theyComeSlowlyAnd())}</p>`;
  return '';
}
function dealWord() {
  const VR = RULES.verdict;
  S.standing = {};
  S.order.forEach(id => {
    S.standing[id] = VR.word + TP(C(id)).word + VR.wordSpread * (2 * hash01(S.salt, id, 'word') - 1);
  });
}
const word = o => (S.standing && S.standing[o.id]) || 0;
function weighWord(x, vote, outcome) {
  const VR = RULES.verdict;
  freeChars()
    .filter(o => o.id !== x.id && !(outcome === 'refused' && vote.back.includes(o.id)))
    .forEach(o => {
      const backed = vote.back.includes(o.id);
      const [p, d] =
        outcome === 'right'
          ? [VR.proven + (backed ? VR.provenBacked : 0), VR.gain]
          : outcome === 'wrong'
            ? [
                VR.doubt +
                  (Ties.fond(o.id, x.id) ? VR.doubtFriend : 0) -
                  (backed ? VR.doubtShared : 0) -
                  (VR.doubtCase * vote.case) / VR.caseCap,
                -VR.loss
              ]
            : [VR.doubtRefused, -VR.lossRefused];
      if (chance(clamp(p))) S.standing[o.id] = Math.max(VR.wordMin, Math.min(VR.wordMax, word(o) + d));
    });
}
function leaning(o, x, cs) {
  const VR = RULES.verdict;
  return (
    Math.max(Suspicion.level(o.id, x.id), thiefLeans(o, x)) +
    cs +
    VR.trust * o.rapport +
    word(o) -
    VR.like * Ties.likes(o.id, x.id) +
    VR.fear * Math.min(S.stats.taken, VR.fearCap) -
    VR.anger * (S.anger || 0) -
    VR.again * wearyOf() -
    Math.min(RULES.hound.handsMax, RULES.hound.hands * Ties.hounded(o)) -
    RULES.hound.handsOnYou * Suspicion.onYou()
  );
}
function angerRises(n) {
  S.anger = (S.anger || 0) + vary(n);
}
const wearyOf = () =>
  S.inquiries.filter(v => v.day < S.day && v.day >= S.day - RULES.verdict.againDays && !(v.passed && C(v.id).role === 'cult')).length;
function cultLean(o, x) {
  const k = craft(o),
    VC = RULES.verdict.cult;
  if (x.role !== 'cult') return VC.push * k.push * cultTurns('inquisitor');
  return Suspicion.looksLost(x) && chance(VC.bus * k.sacrifice) ? VC.give : -VC.defend * k.defend;
}
function handsRaised(crowd, lean, extra, hi, lo, mine) {
  const VR = RULES.verdict,
    out = { for: [], against: [], silent: [] },
    mood = VR.mood * tenorOf('swing') * (2 * rand() - 1);
  crowd.forEach(o => {
    const s = lean(o) + mood + VR.whim * (2 * rand() - 1) + extra(o);
    let v = s >= hi ? 'for' : s < lo ? 'against' : 'silent';
    if (chance(VR.contrary)) v = pick(['for', 'against', 'silent'].filter(h => h !== v));
    out[v].push(o.id);
  });
  if (crowd.length) out.passed = out.for.length >= Math.min(VR.need, crowd.length) && out.for.length > out.against.length;
  else {
    const taken = chance(VR.alone);
    out.passed = mine === 'for' ? taken : !taken;
  }
  return out;
}
function campVote(x) {
  const VR = RULES.verdict,
    cs = Record.caseAgainst(x),
    h = handsRaised(
      freeChars().filter(o => o.id !== x.id),
      o => leaning(o, x, cs),
      o => (o.role === 'cult' ? cultLean(o, x) : 0),
      VR.back,
      VR.against,
      'for'
    ),
    out = { back: h.for, against: h.against, silent: h.silent, case: cs, passed: h.passed };
  out.back.forEach(id => Suspicion.sayAloud(id, x.id, 'cult', 'vote'));
  out.against.forEach(id => Suspicion.sayAloud(id, x.id, 'clean', 'vote'));
  S.inquiries.push({ day: S.day, id: x.id, back: out.back, against: out.against, silent: out.silent, passed: out.passed });
  return out;
}
function voteLine(v) {
  const n = ids => nameList(ids),
    nr = ids => nameListRu(ids);
  const nobody = !v.back.length && !v.against.length && !v.silent.length;
  if (nobody) return `<p class="notice">${bi(...TX.verdict.youLayOutYour(v))}</p>`;
  const en = [
      v.back.length ? `${n(v.back)} ${v.back.length > 1 ? 'side' : 'sides'} with you.` : 'Nobody sides with you.',
      v.against.length ? `${n(v.against)} ${v.against.length > 1 ? 'speak' : 'speaks'} against it.` : '',
      v.silent.length ? `${n(v.silent)} ${v.silent.length > 1 ? 'say' : 'says'} nothing.` : ''
    ],
    rus = __text('text');
  return `<p class="notice">${bi(...TX.verdict.youLayOutYour2(en, rus))}</p>`;
}
function refusedInquiry(x, v) {
  S.log.refusedInq.push({ id: x.id, day: S.day });
  Ties.hound(x, RULES.hound.accused);
  Suspicion.suspectYou(vary(RULES.hound.refusedSus));
  weighWord(x, v, 'refused');
  pullTo('tongues', TENOR.pulls.refused);
  const grudge = grudgeOf(x);
  if (x.role === 'cult') Suspicion.alertCult(RULES.verdict.alerts, freeCult());
  const likedBest = ids => ids.slice().sort((a, b) => Ties.likes(b, x.id) - Ties.likes(a, x.id))[0],
    against = likedBest(v.against),
    sp = C(against || likedBest(v.silent)),
    many = v.back.length + v.against.length + v.silent.length > 1,
    says = !sp ? null : against ? (many ? __text('saysItForAllOfThem') : __text('saysItPlainly')) : TX.verdict.atLastBreaksThe(sp);
  const wronged = S.log.accused.filter(a => !a.right).map(a => C(a.id));
  let line;
  if (wronged.length) {
    const w = wronged[wronged.length - 1];
    line = TX.verdict.youSentAwayOn(w);
  } else if (!v.case) line = TX.verdict.youHaveNothingOn(x);
  else line = sayPick([TX.verdict.notOnThatDoctor(), S.stats.taken ? TX.verdict.weHaveBuriedEnough(x) : null].filter(Boolean));
  S.anger = (S.anger || 0) + vary(RULES.verdict.refused);
  return (
    `<p>${sp ? __text('theCampWillNotDoIt') + ' ' + bi(`${says[0]} ${line[0]}`, `${says[1]} ${line[1]}`) : bi(...TX.verdict.heWillNotTake())}</p>` +
    `<p>${grudge === 'none' ? bi(...TX.verdict.staysAtTheDig(x)) : grudge === 'half' ? bi(...TX.verdict.staysAtTheDig2(x)) : bi(...TX.verdict.staysAtTheDig3(x))}</p>` +
    hurt(RULES.inquiry.nerveRefused, 0, { k: 'refused' }) +
    walkoutIf()
  );
}
function grudgeOf(c) {
  const VR = RULES.verdict,
    soft = ['honest', 'conscientious'].includes(temperOf(c)) || Ties.friend(c);
  if (chance(RULES.scale.rarest)) return 'none';
  if (chance(VR.forgive * (soft ? 2 : 1))) {
    Ties.moveTrust(c, -1, 'deed');
    return 'half';
  }
  Ties.setTrust(c, chance(VR.grudge) ? RULES.ties.hostile : Math.min(c.rapport, RULES.ties.against));
  return 'full';
}
function angerAfter(right) {
  const VR = RULES.verdict;
  S.anger = Math.max(0, (S.anger || 0) + (right ? -vary(VR.right) : vary(VR.wrong)));
  return right ? '' : walkoutIf();
}
function coolOff() {
  const VR = RULES.verdict,
    a = S.anger || 0;
  if (S.inquiries.some(v => v.day === S.day - 1)) return;
  S.anger = Math.max(a - vary(VR.cool), chance(VR.forget) ? 0 : Math.min(a, VR.wrong * S.stats.wrong));
}
function relentAtDawn(death) {
  const VR = RULES.verdict;
  if (!S.walkout || S.walkout >= S.day || !chance(VR.relent + (death ? VR.relentDeath : 0))) return '';
  S.log.relented = S.day;
  S.walkout = null;
  const hm = isFree(C('hamid'));
  return `<p class="event">${bi(...TX.verdict.atBreakfastToYour(hm))}</p>`;
}
function walkoutIf() {
  const VR = RULES.verdict,
    anger = S.anger || 0;
  if (S.walkout || anger < VR.walkoutFrom || !chance(Math.min(RULES.scale.most, (anger - VR.walkoutFrom + 1) * VR.walkoutStep))) return '';
  S.walkout = S.day;
  if (!S.log.walkedOut) S.log.walkedOut = S.day;
  const last = S.day >= RULES.start.days;
  if (!last) S.strikeDay = S.day + 1;
  const pool = freeChars(),
    sp = pool.find(c => c.id === 'hamid') || pool.sort((a, b) => a.rapport - b.rapport)[0];
  const strike = last ? ['', ''] : TX.verdict.tomorrowTheySayThe();
  return (
    (sp
      ? `<p class="event">${bi(...TX.verdict.thatNightComesTo(sp, strike))}</p>`
      : `<p class="event">${bi(...TX.verdict.thatNightTheDiggers(last))}</p>`) +
    `<p class="loss">${bi(...TX.verdict.noMoreInquiries(last))}</p>`
  );
}
