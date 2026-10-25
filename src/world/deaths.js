// ===================== HOW THE DEAD ARE FOUND =====================
// The night's dead seldom look alike (the words are in data/deaths.js). Someone or other finds them, at the place of the
// attack. Mostly the cult did it with its own hands (now and then in a way only that place allows), and the power left
// its mark on the body all the same; but the power below takes its own, in its own colour, the more often the further
// the rite has gone and the later in the season it is (and as the season's mood will have it: game/tenor.js), though
// never as often as the cult kills. So a death all but always tells something of the power below. Now and then the cult signs its work besides. Within a season no state of the body is
// told twice while another is left. RULES.night says how often each way comes.

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
  const fresh = (kind, n) => {
    const all = [...Array(n).keys()],
      left = all.filter(k => !told.includes(kind + k));
    return left.length ? left : all;
  };
  const taken = Math.min(N.takenMax, (N.taken + N.takenDay * (S.day - 1) + (N.takenRite * S.doom) / S.doomMax) * tenorOf('taken'));
  let how;
  if (byHand || !chance(taken)) {
    const here = !!DEATH_HAND_AT[loc] && chance(N.handHere),
      kind = here ? 'at:' + loc : 'hand';
    how = { kind, k: pick(fresh(kind, (here ? DEATH_HAND_AT[loc] : DEATH_HAND).length)), mark: pick([0, 1, 2]) };
    if (!chance(N.mark)) how.mark = null; // (now and then the power leaves no mark on the cult's own work)
  } else how = { kind: 'body', k: pick(fresh('body', DEATH_BODY[asp].length)) };
  how.asp = asp;
  told.push(how.kind + how.k);
  // who comes on the body at first light: anyone up and about, but not one who spent the night in your tent, nor the one
  // you go for yourself tonight (who may not see the dawn: game/deed.js)
  const deed = deedTonight(),
    others = freeChars().filter(c => c.id !== v.id && !inYourTent(c.id) && !(deed && deed.id === c.id));
  how.f = others.length ? pick(others).id : null;
  const finder = how.f ? C(how.f) : null;
  how.open = pick(DEATH_FOUND.map((o, i) => i).filter(i => DEATH_FOUND[i](v, '', finder)));
  how.sign = chance(N.signed) ? pick(DEATH_SIGN.map((t, i) => i)) : null;
  return how;
}
// the state of the body, as [en, ru]
function deathState(how) {
  const asp = how.asp || S.aspectOf[S.patron];
  if (how.kind === 'body') return DEATH_BODY[asp][how.k];
  const hand = how.kind === 'hand' ? DEATH_HAND[how.k] : DEATH_HAND_AT[how.kind.slice(3)][how.k],
    mark = how.mark != null ? DEATH_MARK[asp][how.mark] : null;
  return mark ? [`${hand[0]}, ${mark[0]}`, `${hand[1]}, ${mark[1]}`] : hand;
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
  if (chance(N.craneTaken)) how = { kind: 'body', k: pick(DEATH_BODY[asp].map((t, k) => k)) };
  else {
    const here = chance(N.handHere),
      kind = here ? 'at:ziggurat' : 'hand';
    how = { kind, k: pick((here ? DEATH_HAND_AT.ziggurat : DEATH_HAND).map((t, k) => k)), mark: chance(N.mark) ? pick([0, 1, 2]) : null };
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
