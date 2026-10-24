// ===================== DREAD: horrors outside the tomb, and the rite's progress =====================
// Something may find you whatever you are doing, not only when you dig for it: rarely at first, more often as the days
// pass and the rite gains, and worse the further it has come (RULES.dread); as often as dread comes in the season's mood
// (game/tenor.js), and a degree worse when it comes seldom. By day, after anything you do, of the place you are in or of
// anywhere; at night, when nothing else came for you. The words are in data/dread.js.
const dreadTier = () => (S.doom >= RULES.dread.tiers[1] ? 2 : S.doom >= RULES.dread.tiers[0] ? 1 : 0);
function dreadP() {
  const D = RULES.dread;
  return (D.base + D.day * (S.day - 1) + D.doom * S.doom) * rateOf('dread');
}
// what it costs: one nerve at first, sometimes two in the middle degree, two once the rite is close
function dreadCost(t) {
  S.log.dread++;
  return horrorCost(t === 2 || (t === 1 && chance(RULES.dread.worse)) ? 2 : 1, 'dread');
}
// a horror's cost in nerve; where dread comes often you grow used to it, and now and then it costs nothing (game/tenor.js).
// by: what to blame, should it break you
function horrorCost(n, by = null) {
  if (chance(TENOR.numb * Math.max(TENOR.floor, rateOf('dread') - 1)))
    return `<p class="dim">${bi('You find you are growing used to it.', 'Вы замечаете, что начинаете к этому привыкать.')}</p>`;
  const was = S.nerve,
    h = hurt(n, 0);
  S.log.horrorNerve += was - S.nerve;
  if (by) S.hurtBy = by;
  return h;
}
// What reading costs you, n nerve: counted as the reading's (should it break you, the ending says so: game/endings.js).
function readingCost(n) {
  const was = S.nerve,
    h = hurt(n, 0);
  S.log.studyCost += was - S.nerve;
  S.hurtBy = 'study';
  return h;
}
// At night the words you know may come back, the likelier the more you know (RULES.study.linger).
function wordsAtNight() {
  const ST = RULES.study;
  if (!chance(Math.min(ST.lingerMax, ST.linger * S.factKnown.length))) return '';
  return `<p class="horror">${bi(tellOne('wordsNight', WORDS_NIGHT))}</p>` + readingCost(1);
}
// A horror of one of the lists (by degree: the rite's, or one worse when dread comes seldom), told and paid for; then it
// warms dread for what follows.
function dreadOf(list) {
  const t = Math.min(2, dreadTier() + (weighty('dread') ? 1 : 0)),
    [en, rus] = pick(list(t)),
    h = `<p class="horror">${bi(en, rus)}</p>` + dreadCost(t);
  stirred('dread');
  return h;
}
function dreadNow(where) {
  if (!chance(dreadP())) return '';
  const here = DREAD.at[where],
    mine = here && chance(RULES.dread.here); // one of the place you are in, or of anywhere
  return dreadOf(t => (mine ? here[t] : DREAD.any[t]));
}
// (k: × the usual chance: seldom on a night the cult came for you)
const dreadNight = (k = 1) => (chance(dreadP() * RULES.dread.night * k) ? dreadOf(t => DREAD.night[t]) : '');
// At dawn, the scorched circle at the foot of E-meslam: now and then once the rite is stirring, every dawn once it is close.
function riteNote() {
  const R0 = RULES.start;
  if (S.doom >= S.doomMax) return '';
  if (S.doom >= R0.doomWarn) return `<p class="warn">${bi(...tellOne('riteWarn', RITE_NOTE.warn))}</p>`;
  if (S.doom >= R0.doomStir && chance(RULES.night.riteNote)) return `<p class="dim">${bi(...tellOne('riteStir', RITE_NOTE.stir))}</p>`;
  return '';
}
