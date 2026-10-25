// ===================== THE SEASON'S MOOD =====================
// A season has a mood (TENOR, rules.js): still, uneasy, haunted, full of talk (tongues), or full of comings and goings
// (world). The mood decides how often things happen of themselves, strand by strand (dread, talk, news), and how much
// they weigh when they do: what comes seldom comes heavy. One happening warms its strand, so that one thing tends to
// bring another; and each dawn the mood may drift into a neighbouring one, drawn by what has happened. Nothing of it is
// ever said outright: the nights, the first light, and now and then a morning tell it. The words are in data/tenor.js.
// S.tenor: mood, heat (each strand's warmth, from 0), pull (what drew the mood where, since the last dawn), quiet (nothing
// has happened of itself since the last dawn), log (the moods the season went through, and from which day), crowd (the
// extras this morning has brought so far); and what earlier news left behind: after (news made likelier, game/events.js),
// feud (a quarrel that may flare up again, people/social.js), dust (the day a shamal blows on).

const STRAND_MOOD = { dread: 'haunted', talk: 'tongues', news: 'world' };
function dealTenor() {
  const mood = wpick(TENOR.start);
  S.tenor = {
    mood,
    heat: { dread: 0, talk: 0, news: 0 },
    pull: {},
    quiet: true,
    log: [{ day: 1, mood }],
    crowd: 0,
    after: {},
    feud: null,
    dust: null
  };
}
const tenorMood = () => (S && S.tenor ? S.tenor.mood : 'uneasy'); // (the title screen has no season yet)
// A morning's extras crowd one another out (TENOR.crowd), what the mood favours less so (crowdFav: a strand, or the
// finds, that the mood itself runs above the usual): room(s) is what is left of the chance of another, of strand s;
// brought(h) counts one that came (h: what it says, or nothing if it did not come).
const room = (s = null) => (s && TENOR.moods[S.tenor.mood][s] > 1 ? TENOR.crowdFav : TENOR.crowd) ** S.tenor.crowd;
const brought = h => {
  if (h) S.tenor.crowd++;
  return h;
};
// the mood's own measure of something that is not a strand (finds, watch, taken, swing)
const tenorOf = k => TENOR.moods[tenorMood()][k];
// how often a strand comes now, × the usual: the mood, the strand's warmth, and (for talk and news) the first days' ramp
function rateOf(s) {
  const tn = S.tenor,
    ramp = s === 'talk' || s === 'news' ? TENOR.ramp[Math.min(S.day, TENOR.ramp.length) - 1] : 1;
  return TENOR.moods[tn.mood][s] * (1 + tn.heat[s]) * ramp;
}
// whether a happening of a strand is heavy: the more seldom the strand comes now, the likelier
const weighty = s => chance(TENOR.heavy * Math.max(TENOR.floor, 1 - rateOf(s)));
// a softer measure of talk, for what talk only tilts (dreams told aloud, remarks in passing)
const talkSoft = () => Math.min(TENOR.soft.max, Math.max(TENOR.soft.min, TENOR.soft.base + TENOR.soft.per * rateOf('talk')));
// something of a strand happened (k: how much of a happening it was): the strand warms, and draws the mood toward its own
function stirred(s, k = 1) {
  const tn = S.tenor;
  tn.heat[s] = Math.min(TENOR.heatMax, tn.heat[s] + TENOR.heat * k);
  tn.quiet = false;
  pullTo(STRAND_MOOD[s], TENOR.pulls.strand * k);
}
// something drew the mood toward another (or held it where it is)
function pullTo(mood, w) {
  S.tenor.pull[mood] = (S.tenor.pull[mood] || 0) + w;
}
// At dawn (game/night.js): the strands cool, a quiet day draws the mood toward stillness and the stirring rite toward
// the haunted; then the mood may drift into a neighbouring one, toward whatever drew it. Returns the line that tells of
// a turn, when one is told.
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
    const to = next[m] ? m : next.uneasy ? 'uneasy' : null; // no neighbour: by way of unease (as the table stands, every mood neighbours every other)
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
// the night as it opens the morning's page (in the mood of the day that ended), and a day's first light (fixed for the
// day without the dice, since the site plan may be drawn again; on a short day, the strike or the dust)
const tenorNight = () => `<p class="dim">${bi(...tellOne('night-' + tenorMood(), TENOR_SAY.night[tenorMood()]))}</p>`;
const tenorDawn = () =>
  S.slotsToday < RULES.start.slots
    ? TENOR_SAY.short[S.strikeDay === S.day ? 'strike' : 'dust']
    : tellAt('dawn-' + tenorMood(), TENOR_SAY.dawn[tenorMood()], S.day - 1);
// The season's course, for the ending: the moods it went through, and from which day, as [English, Russian].
function tenorStory() {
  const log = S.tenor.log,
    n = m => TENOR_SAY.name[m];
  if (log.length === 1)
    return [`The season was ${n(log[0].mood)[0]} from first to last.`, `Сезон был ${n(log[0].mood)[1]} от начала до конца.`];
  const rest = log.slice(1);
  return [
    `The season was ${n(log[0].mood)[0]} at first; ${rest.map((x, i) => `${i ? '' : 'it turned '}${n(x.mood)[0]} on day ${x.day}`).join(', then ')}.`,
    `Поначалу сезон был ${n(log[0].mood)[1]}; ${rest.map((x, i) => `в день ${x.day} ${i ? '— ' : 'он стал '}${n(x.mood)[1]}`).join(', потом ')}.`
  ];
}
