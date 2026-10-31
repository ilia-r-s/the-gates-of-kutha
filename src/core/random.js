// Seeded game dice, separate prose dice, replay codes and optional die tracing.
const _given = typeof window !== 'undefined' && typeof window.__seed === 'number' ? window.__seed : null;
let _seed = (_given !== null ? _given : Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0,
  _page = _seed;
function rand() {
  _seed = (_seed + 1831565813) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const v = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  if (TRACE && !_inDie) traceDie('R', null, v);
  return v;
}
let TRACE = null,
  TRACE_WHO = false,
  TRACE_WHY = null,
  _inDie = false;
function traceDie(kind, asked, got) {
  const e = [kind, typeof asked === 'number' ? +asked.toPrecision(12) : asked, got];
  if (TRACE_WHY) e.why = TRACE_WHY;
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
const chance = p => {
  if (!(p > 0)) return false;
  const q = Math.min(RULES.scale.surest, Math.max(RULES.scale.rarest, p));
  _inDie = true;
  const yes = rand() < q;
  _inDie = false;
  if (TRACE) traceDie('C', q, yes);
  return yes;
};
const coin = () => chance(0.5);
const vary = (n, spread = RULES.scale.spread) => (n > 0 && chance(spread) ? Math.max(0, n + (coin() ? 1 : -1)) : n);
const pick = a => {
  if (a.length < 2) return a[0];
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
let _words = 0;
const WORDS = { shared: false, salt: 0 };
function inWords(f) {
  return (...a) => {
    if (WORDS.shared) return f(...a);
    const seed = _seed,
      trace = TRACE;
    _seed = _words;
    TRACE = null;
    try {
      return f(...a);
    } finally {
      _words = _seed;
      _seed = seed;
      TRACE = trace;
    }
  };
}
const sayPick = inWords(pick),
  sayChance = inWords(chance),
  sayShuffle = inWords(shuffle);
const reseed = n => {
  _seed = n >>> 0;
  _words = Math.floor(hash01(_seed, 'words', WORDS.salt) * 4294967296) >>> 0;
};
function newSeed() {
  const keep = _seed;
  _seed = _page;
  _inDie = true;
  const n = Math.floor(rand() * 4294967296) >>> 0;
  _inDie = false;
  _page = _seed;
  _seed = keep;
  return n;
}
const seedCode = n => {
  const h = (n >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return h.slice(0, 4) + '-' + h.slice(4);
};
function parseSeed(t) {
  const h = String(t == null ? '' : t).replace(/[^0-9a-f]/gi, '');
  return h.length && h.length <= 8 ? parseInt(h, 16) >>> 0 : null;
}
function weighted(entries, r, { edge: edge = 'open', zero: zero = 'take', by: by = 'subtract', fallback: fallback = 'first' } = {}) {
  if (by === 'sum') {
    let at = 0;
    for (const [key, w] of entries) if (r < (at += w)) return key;
  } else {
    let x = r * entries.reduce((a, [, w]) => a + w, 0);
    for (const [key, w] of entries) {
      if (zero === 'skip' && !(w > 0)) continue;
      x -= w;
      if (edge === 'closed' ? x <= 0 : x < 0) return key;
    }
  }
  const pool = fallback === 'weighted' ? entries.filter(([, w]) => w > 0) : entries,
    e = fallback === 'last' ? pool[pool.length - 1] : pool[0];
  return e && e[0];
}
function wpick(o) {
  const keys = Object.keys(o);
  if (keys.length < 2) return keys[0];
  _inDie = true;
  const r = rand();
  _inDie = false;
  const got = weighted(Object.entries(o), r, { edge: 'closed' });
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
const clamp = (x, a = RULES.scale.least, b = RULES.scale.most) => Math.max(a, Math.min(b, x));
function hash01(...keys) {
  const s = keys.join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const hashPick = (a, ...keys) => a[Math.floor(hash01(...keys) * a.length)];
