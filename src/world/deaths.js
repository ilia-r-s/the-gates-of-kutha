// ===================== HOW THE DEAD ARE FOUND =====================
// The night's dead seldom look alike (the words are in data/deaths.js). Someone or other finds them, at the place of the
// attack. Mostly the cult did it with its own hands (now and then in a way only that place allows), and the power left
// its mark on the body all the same; but the power below takes its own, in its own colour, the more often the further
// the rite has gone and the later in the season it is (and as the season's mood will have it: game/tenor.js), though
// never as often as the cult kills. So a death all but always tells something of the power below. Now and then the cult signs its work besides. Within a season no state of the body is
// told twice while another is left. RULES.night says how often each way comes.
// What is put together agrees with itself: a mark or a signature is only one that how the body lies leaves room for
// (data/deaths.js: is, not, makes); and nothing is told that calls to mind a sign in play not yet seen (echo, tellableNow).

// The sign a telling calls to mind (data/deaths.js: echo; data/world.js: attackEcho), by its short name, is told only
// once that sign has been seen, or when it is none of the season's at all: told before, it would point at a sign the
// tablets give to two other powers, or show one of the power's own before its time.
const SIGN_NAMED = Object.fromEntries(SIGN_POOL.map((s, i) => [s.short, i]));
function tellableNow(echo) {
  return [].concat(echo || []).every(sh => {
    const si = SIGN_NAMED[sh];
    return !S.signPair[si] || S.omenLog.some(o => o.si === si);
  });
}
// (every name an echo gives must be a sign's, or the telling would never be held back: checked as the page loads)
[...Object.values(DEATH_BODY), ...Object.values(DEATH_MARK)]
  .flat()
  .flatMap(t => [].concat((t[2] && t[2].echo) || []))
  .concat(Object.values(ASPECT_TEXT).flatMap(a => (a.attackEcho || []).flat().filter(Boolean)))
  .forEach(sh => {
    if (!(sh in SIGN_NAMED)) throw new Error(`world/deaths.js: no sign is called “${sh}”`);
  });
const tagsOf = t => t[2] || {};
// how the body lies, as the tellings put together say (a state, and the mark on it, which may add to it)
const howItLies = (...ts) => ts.filter(Boolean).flatMap(t => [...(tagsOf(t).is || []), ...(tagsOf(t).makes || [])]);
// the places in a list of the tellings that may be told now and agree with how the body lies (lies: as above)
const agreeing = (list, lies = []) =>
  list.map((t, k) => k).filter(k => tellableNow(tagsOf(list[k]).echo) && !(tagsOf(list[k]).not || []).some(x => lies.includes(x)));

// The manner the dead are found in: the power below's own, all but always (night.manner); now and then another power's
// of the season, by some chance nobody can account for (the ending tells it).
function mannerOf() {
  const asp = S.aspectOf[S.patron];
  if (chance(RULES.night.manner)) return asp;
  const others = [...new Set(S.gods.map(g => S.aspectOf[g]))].filter(a => a !== asp);
  return pick(others.length ? others : Object.keys(ASPECTS).filter(a => a !== asp));
}
// How a death will be told: { kind ('body', 'hand', or 'at:<place>'), k (which), mark (the power's mark, for a death by
// the cult's hand), asp (whose manner it is in), f (who found them, or null), open (how they were found), sign (the
// cult's signature, or null) }. byHand: one of the cult killed by another (people/cunning.js), the killer's own work.
function deathHow(v, loc, byHand = false) {
  const N = RULES.night,
    asp = mannerOf(),
    told = S.deathsTold;
  // the states of a list that may be told now, those not yet told this season first, then all of those again (and, were
  // none fit to tell, any at all)
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
    how = { kind, k, mark: marks.length ? pick(marks) : null };
    if (!chance(N.mark)) how.mark = null; // (now and then the power leaves no mark on the cult's own work)
  } else how = { kind: 'body', k: pick(fresh('body', DEATH_BODY[asp])) };
  how.asp = asp;
  told.push(how.kind + how.k);
  // who comes on the body at first light: anyone up and about, but not one who spent the night in your tent, nor the one
  // you go for yourself tonight (who may not see the dawn: game/deed.js)
  const deed = deedTonight(),
    others = freeChars().filter(c => c.id !== v.id && !inYourTent(c.id) && !(deed && deed.id === c.id));
  how.f = others.length ? pick(others).id : null;
  const finder = how.f ? C(how.f) : null;
  how.open = pick(DEATH_FOUND.map((o, i) => i).filter(i => DEATH_FOUND[i](v, '', finder)));
  // the signature, one that how the body lies leaves room for (no sherds on open eyes, no swept circle round a body
  // bricked up in a wall)
  const signs = agreeing(DEATH_SIGN, howItLies(...partsOf(how)));
  how.sign = chance(N.signed) && signs.length ? pick(signs) : null;
  return how;
}
// the tellings a death is put together from: how the body lies, and the power's mark on it (or null)
function partsOf(how) {
  const asp = how.asp || S.aspectOf[S.patron];
  if (how.kind === 'body') return [DEATH_BODY[asp][how.k], null];
  const hand = how.kind === 'hand' ? DEATH_HAND[how.k] : DEATH_HAND_AT[how.kind.slice(3)][how.k];
  return [hand, how.mark != null ? DEATH_MARK[asp][how.mark] : null];
}
// the state of the body, as [en, ru]
function deathState(how) {
  const [st, mark] = partsOf(how);
  return mark ? [`${st[0]}, ${mark[0]}`, `${st[1]}, ${mark[1]}`] : [st[0], st[1]];
}
// The death, as the morning tells it.
function deathText(v, loc, how) {
  const st = deathState(how),
    finder = how.f ? C(how.f) : null,
    en = DEATH_FOUND[how.open](v, LOCS[loc].at, finder)[0],
    rus = DEATH_FOUND[how.open](v, R(LOCS[loc].at), finder)[1],
    sg = how.sign != null ? DEATH_SIGN[how.sign] : null;
  return bi(`${en}, ${st[0]}.${sg ? ' ' + sg[0] : ''}`, `${rus}: ${st[1]}.${sg ? ' ' + sg[1] : ''}`);
}
// How Crane died, the night before you came, at the foot of the ziggurat: by the power's own touch, mostly
// (night.craneTaken); otherwise by the cult's hands, with the power's mark on him all the same, mostly; in the power's own
// manner, all but always (night.manner).
function craneDeath() {
  const N = RULES.night,
    asp = mannerOf();
  let how;
  // (no sign has been seen yet: nothing that calls one in play to mind, and a mark that agrees with how he lies)
  if (chance(N.craneTaken)) {
    const now = agreeing(DEATH_BODY[asp]);
    how = { kind: 'body', k: pick(now.length ? now : DEATH_BODY[asp].map((t, k) => k)) };
  } else {
    const here = chance(N.handHere),
      kind = here ? 'at:ziggurat' : 'hand',
      list = here ? DEATH_HAND_AT.ziggurat : DEATH_HAND,
      k = pick(list.map((t, i) => i)),
      marks = agreeing(DEATH_MARK[asp], howItLies(list[k]));
    how = { kind, k, mark: chance(N.mark) && marks.length ? pick(marks) : null };
  }
  how.asp = asp;
  if (asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: 0, id: 'crane', asp });
  S.deathsTold.push(how.kind + how.k); // no later death looks like his while another way is left
  return how;
}
function craneFound() {
  const st = deathState(S.craneHow);
  return bi(`Crane was found ${LOCS.ziggurat.at}, ${st[0]}.`, `Крейна нашли ${R(LOCS.ziggurat.at)}: ${st[1]}.`);
}
