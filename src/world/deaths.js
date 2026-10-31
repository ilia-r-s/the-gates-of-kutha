// world/deaths.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const SIGN_NAMED = Object.fromEntries(SIGN_POOL.map((s, i) => [s.short, i]));
function tellableNow(echo) {
  return [].concat(echo || []).every(sh => {
    const si = SIGN_NAMED[sh];
    return !S.signPair[si] || S.omenLog.some(o => o.si === si);
  });
}
[...Object.values(DEATH_BODY), ...Object.values(DEATH_MARK)]
  .flat()
  .flatMap(t => [].concat((t[2] && t[2].echo) || []))
  .concat(Object.values(ASPECT_TEXT).flatMap(a => (a.attackEcho || []).flat().filter(Boolean)))
  .forEach(sh => {
    if (!(sh in SIGN_NAMED)) throw new Error(`world/deaths.js: no sign is called “${sh}”`);
  });
const tagsOf = t => t[2] || {};
const howItLies = (...ts) => ts.filter(Boolean).flatMap(t => [...(tagsOf(t).is || []), ...(tagsOf(t).makes || [])]);
const agreeing = (list, lies = []) =>
  list.map((t, k) => k).filter(k => tellableNow(tagsOf(list[k]).echo) && !(tagsOf(list[k]).not || []).some(x => lies.includes(x)));
function mannerOf() {
  const asp = S.aspectOf[S.patron];
  if (chance(RULES.night.manner)) return asp;
  const others = [...new Set(S.gods.map(g => S.aspectOf[g]))].filter(a => a !== asp);
  return pick(others.length ? others : Object.keys(ASPECTS).filter(a => a !== asp));
}
function deathHow(v, loc, byHand = false) {
  const N = RULES.night,
    asp = mannerOf(),
    told = S.deathsTold;
  const fresh = (kind, list) => {
    const now = agreeing(list),
      left = now.filter(k => !told.includes(kind + k));
    return left.length ? left : now.length ? now : list.map((t, k) => k);
  };
  const taken = Math.min(N.takenMax, (N.taken + N.takenDay * (S.day - 1) + (N.takenRite * S.doom) / S.doomMax) * tenorOf('taken'));
  let how;
  if (byHand || !chance(taken)) {
    const here = !!DEATH_HAND_AT[loc] && chance(N.handHere),
      kind = here ? 'at:' + loc : 'hand',
      list = here ? DEATH_HAND_AT[loc] : DEATH_HAND,
      k = pick(fresh(kind, list)),
      marks = agreeing(DEATH_MARK[asp], howItLies(list[k]));
    how = { kind: kind, k: k, mark: chance(N.mark) && marks.length ? pick(marks) : null };
  } else how = { kind: 'body', k: pick(fresh('body', DEATH_BODY[asp])) };
  how.asp = asp;
  told.push(how.kind + how.k);
  const deed = deedTonight();
  if (!deed && chance(N.youFind)) {
    how.you = true;
    how.f = null;
    how.open = pick(DEATH_FOUND_YOU.map((o, i) => i));
  } else {
    const others = freeChars().filter(c => c.id !== v.id && !inYourTent(c.id) && !(deed && deed.id === c.id));
    how.f = others.length ? pick(others).id : null;
    const finder = how.f ? C(how.f) : null;
    how.open = pick(DEATH_FOUND.map((o, i) => i).filter(i => DEATH_FOUND[i](v, '', finder)));
  }
  const signs = agreeing(DEATH_SIGN, howItLies(...partsOf(how)));
  how.sign = chance(N.signed) && signs.length ? pick(signs) : null;
  return how;
}
function partsOf(how) {
  const asp = how.asp || S.aspectOf[S.patron];
  if (how.kind === 'body') return [DEATH_BODY[asp][how.k], null];
  const hand = how.kind === 'hand' ? DEATH_HAND[how.k] : DEATH_HAND_AT[how.kind.slice(3)][how.k];
  return [hand, how.mark != null ? DEATH_MARK[asp][how.mark] : null];
}
function deathState(how) {
  const [st, mark] = partsOf(how);
  return mark ? [`${st[0]}, ${mark[0]}`, `${st[1]}, ${mark[1]}`] : [st[0], st[1]];
}
function deathText(v, loc, how) {
  const st = deathState(how),
    finder = how.f ? C(how.f) : null,
    found = how.you ? DEATH_FOUND_YOU : DEATH_FOUND,
    en = found[how.open](v, LOCS[loc].at, finder)[0],
    rus = found[how.open](v, R(LOCS[loc].at), finder)[1],
    sg = how.sign != null ? DEATH_SIGN[how.sign] : null;
  return __text('text');
}
function craneDeath() {
  const N = RULES.night,
    asp = mannerOf();
  let how;
  if (chance(N.craneTaken)) {
    const now = agreeing(DEATH_BODY[asp]);
    how = { kind: 'body', k: pick(now.length ? now : DEATH_BODY[asp].map((t, k) => k)) };
  } else {
    const here = chance(N.handHere),
      kind = here ? 'at:ziggurat' : 'hand',
      list = here ? DEATH_HAND_AT.ziggurat : DEATH_HAND,
      k = pick(list.map((t, i) => i)),
      marks = agreeing(DEATH_MARK[asp], howItLies(list[k]));
    how = { kind: kind, k: k, mark: chance(N.mark) && marks.length ? pick(marks) : null };
  }
  how.asp = asp;
  if (asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: 0, id: 'crane', asp: asp });
  S.deathsTold.push(how.kind + how.k);
  return how;
}
function craneFound() {
  const st = deathState(S.craneHow);
  return bi(...TX.deaths.craneWasFound(st));
}
