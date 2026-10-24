// ===================== THE DICE =====================
// One seeded generator (mulberry32) throws every die in the game, so a season can be replayed from its seed: the page
// may set window.__seed before the game loads, or the clock decides. Only the rules throw these dice; music and
// pictures use Math.random, so that sound and drawing never change what happens.
let _seed = ((typeof window !== 'undefined' && window.__seed) || Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
function rand() {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
// No die is ever certain (the project's rule, RULES.md): whatever the odds asked, a chance is at least scale.rarest and
// at most scale.surest, so that nothing anyone does, and nothing that happens, is ever sure. Odds of nothing at all are
// for what cannot happen at all (nothing to confess, no one to name): the tables never ask for them otherwise.
const chance = p => p > 0 && rand() < Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, p));
// How much something costs or gives back, as it turns out: n mostly, now and then one more or one less (at spread),
// never less than nothing. Nerve lost and regained and the rite's steps vary at RULES.scale.spread; wounds, which
// weigh more, at the narrower RULES.scale.graze (game/state.js: hurt, regain, heal).
const vary = (n, spread = RULES.scale.spread) => (n > 0 && chance(spread) ? Math.max(0, n + (chance(0.5) ? 1 : -1)) : n);
const pick = a => a[Math.floor(rand() * a.length)];
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// a key of o, chosen with probability in proportion to its value
function wpick(o) {
  let tot = 0;
  for (const k in o) tot += o[k];
  let r = rand() * tot;
  for (const k in o) {
    r -= o[k];
    if (r <= 0) return k;
  }
  return Object.keys(o)[0];
}
// (between RULES.scale.least and .most, unless told otherwise)
const clamp = (x, a = RULES.scale.least, b = RULES.scale.most) => Math.max(a, Math.min(b, x));
// A number in [0, 1) fixed by its keys, for choices that must not throw the dice: a face drawn in a picture (which may
// be redrawn at any moment), or a word chosen for the ending page (whose next season must be dealt as before).
function hash01(...keys) {
  const s = keys.join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// one of a list, fixed by its keys (as above)
const hashPick = (a, ...keys) => a[Math.floor(hash01(...keys) * a.length)];
