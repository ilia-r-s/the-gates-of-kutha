// ===================== THE DICE =====================
// One seeded generator (mulberry32) throws every die in the game. Every season is dealt and played from a seed of its
// own (S.seed: game/state.js, newGame), so that the same seed deals the same season, and the same choices play it the
// same way. The page keeps a stream of its own from which each new season's seed is drawn (newSeed): the page may set
// window.__seed before the game loads, or the clock decides. Only the rules throw these dice; music and pictures use
// Math.random, so that sound and drawing never change what happens.
let _seed = ((typeof window !== 'undefined' && window.__seed) || Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0,
  _page = _seed;
function rand() {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const v = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  if (TRACE && !_inDie) traceDie('R', null, v);
  return v;
}
// The dice trace (test/trace.js): while a test holds an array in TRACE, every die thrown is written into it, as [kind,
// what was asked, what came up]: C a chance (its odds after the clamp, and yes or no), P a pick (how many to choose
// from, and which), W a weighted pick (the weights, and the key), S a shuffle (how many), R a bare throw. With TRACE_WHO
// set, each entry also names the functions that threw it. The trace throws nothing itself, and in play it is off.
let TRACE = null,
  TRACE_WHO = false,
  _inDie = false;
function traceDie(kind, asked, got) {
  const e = [kind, typeof asked === 'number' ? +asked.toPrecision(12) : asked, got]; // (odds to 12 places)
  if (TRACE_WHO)
    e.push(
      String(new Error().stack)
        .split('\n')
        .slice(3, 9)
        .map(l => (/at (\S+)/.exec(l) || [])[1] || '?')
        .join(' < ')
    );
  TRACE.push(e);
}
// No die is ever certain (the project's rule, RULES.md): whatever the odds asked, a chance is at least scale.rarest and
// at most scale.surest, so that nothing anyone does, and nothing that happens, is ever sure. Odds of nothing at all are
// for what cannot happen at all (nothing to confess, no one to name): the tables never ask for them otherwise.
const chance = p => {
  if (!(p > 0)) return false;
  const q = Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, p));
  _inDie = true;
  const yes = rand() < q;
  _inDie = false;
  if (TRACE) traceDie('C', q, yes);
  return yes;
};
// How much something costs or gives back, as it turns out: n mostly, now and then one more or one less (at spread),
// never less than nothing. Nerve lost and regained and the rite's steps vary at RULES.scale.spread; wounds, which
// weigh more, at the narrower RULES.scale.graze (game/state.js: hurt, regain, heal).
const vary = (n, spread = RULES.scale.spread) => (n > 0 && chance(spread) ? Math.max(0, n + (chance(0.5) ? 1 : -1)) : n);
const pick = a => {
  _inDie = true;
  const i = Math.floor(rand() * a.length);
  _inDie = false;
  if (TRACE) traceDie('P', a.length, i);
  return a[i];
};
function shuffle(a) {
  a = a.slice();
  _inDie = true;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  _inDie = false;
  if (TRACE && a.length > 1) traceDie('S', a.length, null);
  return a;
}
// ---------- seeds ----------
// the dice from a season's seed onward (game/state.js, newGame)
const reseed = n => {
  _seed = n >>> 0;
};
// a new season's seed, from the page's own stream (so that how one season went never changes the next one's seed)
function newSeed() {
  const keep = _seed;
  _seed = _page;
  _inDie = true; // (the page's stream, not the season's: kept out of the dice trace)
  const n = Math.floor(rand() * 4294967296) >>> 0;
  _inDie = false;
  _page = _seed;
  _seed = keep;
  return n;
}
// a seed as the casebook and the ending page write it, and as the title screen takes it: eight hex digits, two groups of
// four (any other characters are ignored when it is read back; null if there is no seed in it)
const seedCode = n => {
  const h = (n >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return h.slice(0, 4) + '-' + h.slice(4);
};
function parseSeed(t) {
  const h = String(t == null ? '' : t).replace(/[^0-9a-f]/gi, '');
  return h.length && h.length <= 8 ? parseInt(h, 16) >>> 0 : null;
}
// a key of o, chosen with probability in proportion to its value
function wpick(o) {
  let tot = 0;
  for (const k in o) tot += o[k];
  _inDie = true;
  let r = rand() * tot,
    got = null;
  _inDie = false;
  for (const k in o) {
    r -= o[k];
    if (r <= 0) {
      got = k;
      break;
    }
  }
  if (got === null) got = Object.keys(o)[0];
  if (TRACE)
    traceDie(
      'W',
      Object.keys(o)
        .map(k => k + ':' + +(+o[k]).toPrecision(12))
        .join(','),
      got
    );
  return got;
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
