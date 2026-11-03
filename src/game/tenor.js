const STRAND_MOOD = { dread: 'haunted', talk: 'tongues', news: 'world' };
function dealTenor() {
  const mood = wpick(TENOR.start);
  S.tenor = {
    mood: mood,
    heat: { dread: 0, talk: 0, news: 0 },
    pull: {},
    quiet: true,
    log: [{ day: 1, mood: mood }],
    crowd: 0,
    nightCrowd: 0,
    after: {},
    feud: null,
    dust: null
  };
}
const tenorMood = () => (S && S.tenor ? S.tenor.mood : 'uneasy');
const room = (s = null, used = S.tenor.crowd, decay = s && TENOR.moods[S.tenor.mood][s] > 1 ? TENOR.crowdFav : TENOR.crowd) =>
  decay ** used;
// Atmospheric additions share the same crowd formula without spending the
// separate opportunities for investigation finds and character testimony.
// Their steeper decay allows rare doubles without crowding ordinary mornings.
const NIGHT_ATMOSPHERE = Decisions.define({
  id: 'night.atmosphere',
  action: 'deliver-optional-atmosphere',
  subject: 'world',
  authority: 'world',
  knowledge: ['already delivered atmospheric passages and required night consequences'],
  consequences: ['optional passage delivered'],
  probability: baseChance => baseChance * room(null, S.tenor.nightCrowd, TENOR.nightCrowd)
});
function nightAtmosphere(baseChance, make) {
  if (!NIGHT_ATMOSPHERE.roll(baseChance)) return '';
  const html = make();
  if (html) S.tenor.nightCrowd++;
  return html;
}
const brought = h => {
  if (h) S.tenor.crowd++;
  return h;
};
const tenorOf = k => TENOR.moods[tenorMood()][k];
function rateOf(s) {
  const tn = S.tenor,
    ramp = s === 'talk' || s === 'news' ? TENOR.ramp[Math.min(S.day, TENOR.ramp.length) - 1] : 1;
  return TENOR.moods[tn.mood][s] * (1 + tn.heat[s]) * ramp;
}
const weighty = s => chance(TENOR.heavy * Math.max(TENOR.floor, 1 - rateOf(s)));
const talkSoft = () => Math.min(TENOR.soft.max, Math.max(TENOR.soft.min, TENOR.soft.base + TENOR.soft.per * rateOf('talk')));
function stirred(s, k = 1) {
  const tn = S.tenor;
  tn.heat[s] = Math.min(TENOR.heatMax, tn.heat[s] + TENOR.heat * k);
  tn.quiet = false;
  pullTo(STRAND_MOOD[s], TENOR.pulls.strand * k);
}
function pullTo(mood, w) {
  S.tenor.pull[mood] = (S.tenor.pull[mood] || 0) + w;
}
function driftTenor() {
  const tn = S.tenor;
  Object.keys(tn.heat).forEach(s => {
    tn.heat[s] *= TENOR.cool;
  });
  if (tn.quiet) pullTo('still', TENOR.pulls.calm);
  if (S.doom >= RULES.start.doomStir) pullTo('haunted', TENOR.pulls.rite);
  tn.quiet = true;
  const next = TENOR.next[tn.mood],
    toward = {};
  let away = 0;
  Object.entries(tn.pull).forEach(([m, p]) => {
    if (m === tn.mood) return;
    away += p;
    const to = next[m] ? m : next.uneasy ? 'uneasy' : null;
    if (to) toward[to] = (toward[to] || 0) + p;
  });
  const hold = tn.pull[tn.mood] || 0;
  tn.pull = {};
  if (!chance(Math.max(TENOR.floor, Math.min(TENOR.driftMax, TENOR.drift + TENOR.pull * (away - hold))))) return '';
  const w = {};
  Object.keys(next).forEach(m => {
    w[m] = next[m] * (1 + (toward[m] || 0));
  });
  tn.mood = wpick(w);
  tn.log.push({ day: S.day, mood: tn.mood });
  return chance(TENOR.told) ? `<p class="dim">${bi(...tellOne('turn-' + tn.mood, TENOR_SAY.turn[tn.mood]))}</p>` : '';
}
const tenorNight = () => `<p class="dim">${bi(...tellOne('night-' + tenorMood(), TENOR_SAY.night[tenorMood()]))}</p>`;
const tenorDawn = () =>
  S.slotsToday < RULES.start.slots
    ? TENOR_SAY.short[S.strikeDay === S.day ? 'strike' : 'dust']
    : tellAt('dawn-' + tenorMood(), TENOR_SAY.dawn[tenorMood()], S.day - 1);
function tenorStory() {
  const log = S.tenor.log,
    n = m => TENOR_SAY.name[m];
  if (log.length === 1) return TX.tenor.theSeasonWasFrom(n, log);
  const rest = log.slice(1);
  return TX.tenor.theSeasonWasAt(n, log, rest);
}
