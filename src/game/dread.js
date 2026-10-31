// game/dread.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const dreadTier = () => (S.doom >= RULES.dread.tiers[1] ? 2 : S.doom >= RULES.dread.tiers[0] ? 1 : 0);
function dreadP() {
  const D = RULES.dread;
  return (D.base + D.day * (S.day - 1) + D.doom * S.doom) * rateOf('dread');
}
function dreadCost(t) {
  S.log.dread++;
  return horrorCost(t === 2 || (t === 1 && chance(RULES.dread.worse)) ? RULES.harm.horrorHeavy : RULES.harm.horror, 'dread');
}
function horrorCost(n, by = null) {
  if (chance(TENOR.numb * Math.max(TENOR.floor, rateOf('dread') - 1))) return `<p class="dim">${__text('youFindYouAreGrowingUsed')}</p>`;
  const was = S.nerve,
    h = hurt(n, 0, { k: 'horror', at: S.phase === 'night' ? 'night' : S.loc || 'camp' });
  S.log.horrorNerve += was - S.nerve;
  if (by) S.hurtBy = by;
  return h;
}
function readingCost(n) {
  const was = S.nerve,
    h = hurt(n, 0, { k: 'reading' });
  S.log.studyCost += was - S.nerve;
  S.hurtBy = 'study';
  return h;
}
function wordsAtNight() {
  const ST = RULES.study;
  if (!chance(Math.min(ST.lingerMax, ST.linger * S.factKnown.length))) return '';
  return `<p class="horror">${bi(tellOne('wordsNight', WORDS_NIGHT))}</p>` + readingCost(RULES.harm.reading);
}
function dreadOf(list) {
  const t = Math.min(2, dreadTier() + (weighty('dread') ? 1 : 0)),
    [en, rus] = sayPick(list(t)),
    h = `<p class="horror">${bi(en, rus)}</p>` + dreadCost(t);
  stirred('dread');
  return h;
}
function dreadNow(where) {
  if (!chance(dreadP())) return '';
  const here = DREAD.at[where],
    mine = here && sayChance(RULES.dread.here);
  return dreadOf(t => (mine ? here[t] : DREAD.any[t]));
}
const dreadNight = (k = 1) => (chance(dreadP() * RULES.dread.night * k) ? dreadOf(t => DREAD.night[t]) : '');
function riteNote() {
  const R0 = RULES.start;
  if (S.doom >= S.doomMax) return '';
  if (S.doom >= R0.doomWarn) return `<p class="warn">${bi(...tellOne('riteWarn', RITE_NOTE.warn))}</p>`;
  if (S.doom >= R0.doomStir && chance(RULES.night.riteNote)) return `<p class="dim">${bi(...tellOne('riteStir', RITE_NOTE.stir))}</p>`;
  return '';
}
