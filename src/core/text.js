let LANG = 'en';
const RUMAP = new Map(),
  MISSING = new Set();
const TK = '\u0001',
  TE = '\u0002';
const PAIRKEY = new Map();
let seasonTextBase = null;
// Keep tokens created while modules initialize; generated names and accounts belong to one season.
function resetSeasonText() {
  if (!seasonTextBase) seasonTextBase = { ru: new Map(RUMAP), pairs: new Map(PAIRKEY) };
  else {
    RUMAP.clear();
    PAIRKEY.clear();
    seasonTextBase.ru.forEach((v, k) => RUMAP.set(k, v));
    seasonTextBase.pairs.forEach((v, k) => PAIRKEY.set(k, v));
  }
  // Missing-text diagnostics span seasons so leak/forced-scene tests cannot lose an earlier failure.
}
function bi(en, ru) {
  en = String(en);
  if (ru == null) return TK + en + TE;
  ru = String(ru);
  const cur = RUMAP.get(en);
  if (cur === undefined || cur === ru) {
    RUMAP.set(en, ru);
    return TK + en + TE;
  }
  const pk = en + '\u0004' + ru;
  let key = PAIRKEY.get(pk);
  if (!key) {
    key = en + '\u0003' + PAIRKEY.size.toString(36);
    PAIRKEY.set(pk, key);
    RUMAP.set(key, ru);
  }
  return TK + key + TE;
}
const oneOf = (...pairs) => bi(...sayPick(pairs));
const TX = {},
  enRu = ([en, ru]) => ({ en: en, ru: ru });
function tellAt(key, list, i) {
  const n = list.length;
  if (n < 2 || !S) return list[0];
  let order = null,
    last = null;
  for (let r = 0; r <= Math.floor(i / n); r++) {
    order = [...Array(n).keys()].sort((a, b) => hash01(S.salt, key, r, a) - hash01(S.salt, key, r, b));
    if (order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    last = order[n - 1];
  }
  return list[order[i % n]];
}
function tellOne(key, list) {
  if (!S) return list[0];
  const T = S.told || (S.told = {}),
    i = T[key] || 0;
  T[key] = i + 1;
  return tellAt(key, list, i);
}
function tellNext(key, list, may) {
  const ok = list.map((t, k) => k).filter(k => may(list[k], k));
  if (!S || !ok.length) return list[0];
  const T = S.told || (S.told = {}),
    t = T[key] || (T[key] = { round: 0, done: [], last: null });
  let left = ok.filter(k => !t.done.includes(k));
  if (!left.length) {
    t.round++;
    t.done = [];
    left = ok.length > 1 ? ok.filter(k => k !== t.last) : ok;
  }
  const k = left.sort((a, b) => hash01(S.salt, key, t.round, a) - hash01(S.salt, key, t.round, b))[0];
  t.done.push(k);
  t.last = k;
  return list[k];
}
function R(en) {
  if (RUMAP.has(en)) return RUMAP.get(en);
  MISSING.add(en);
  return en;
}
function X(s) {
  if (s == null) return '';
  s = String(s);
  if (s.indexOf(TK) < 0) return s;
  if (LANG !== 'ru')
    return s.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, k) => (k.indexOf('\u0003') < 0 ? k : k.slice(0, k.indexOf('\u0003'))));
  return s.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, k) => R(k)).replace(/\.(“?)»/g, '$1».');
}
function zipRU(en, ru) {
  if (typeof en === 'string' && typeof ru === 'string') {
    RUMAP.set(en, ru);
    return;
  }
  if (en && ru && typeof en === 'object' && typeof ru === 'object') Object.keys(ru).forEach(k => zipRU(en[k], ru[k]));
}
const CASE = { n: 0, g: 1, d: 2, a: 3, i: 4, p: 5 };
const ru = {
  ch: c => RU_CH[typeof c === 'string' ? c : c.id],
  c: (c, k = 'n') => ru.ch(c).short[CASE[k]],
  cf: (c, k = 'n') => ru.ch(c).name[CASE[k]],
  f: c => ru.ch(c).g === 'f',
  gs: (c, m, f) => (ru.f(c) ? f : m),
  god: (g, k = 'n') => RU_GOD[g].name[CASE[k]],
  gf: g => RU_GOD[g].g === 'f',
  item: (it, k = 'n') => RU_ITEM[it].f[CASE[k]],
  Item: (it, k = 'n') => capS(RU_ITEM[it].f[CASE[k]]),
  ig: (it, m, f, n, pl) => ({ m: m, f: f, n: n, pl: pl })[RU_ITEM[it].g],
  loc: (l, k = 'name') => RU_LOC[l][k],
  list: a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + __text('andRu') + a[a.length - 1]),
  ob: c => (/^[АЭИОУЫ]/.test(ru.c(c, 'p')) ? __text('aboutBeforeVowelRu') : __text('aboutRu')) + ru.c(c, 'p'),
  name: () => (S.name === 'Marlowe' || S.name === __text('marloweRu') ? __text('marloweRu') : esc(S.name)),
  dayStamp: () => __text('dayStampRu')
};
function fmtR(s, m) {
  return String(s).replace(/\{(\w+)(?:\.([ngdaip]))?(?::([^|}]*)\|([^}]*))?\}/g, (x, k, cs, a, b) => {
    const c = m[k];
    if (c == null) return x;
    if (a != null) return ru.f(c) ? b : a;
    return ru.c(c, cs || 'n');
  });
}
const enName = () => (S.name === __text('marloweRu') ? 'Marlowe' : esc(S.name));
const fmt = (s, m) => s.replace(/\{(\w+)\}/g, (x, k) => (k in m ? m[k] : x));
const P = c => ({ n: c.short, pp: c.pp, p: c.p });
const listNames = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const NUM_EN = __text('NUM_EN'),
  NUM_RU = __text('NUM_RU');
const enNum = n => NUM_EN[n] || String(n),
  ruNum = (n, g = 'm') =>
    n === 1
      ? { m: __text('oneMasculineRu'), f: __text('oneFeminineRu'), n: __text('oneNeuterRu') }[g]
      : n === 2
        ? g === 'f'
          ? __text('twoFeminineRu')
          : __text('twoMasculineRu')
        : NUM_RU[n] || String(n);
const capS = s => s.charAt(0).toUpperCase() + s.slice(1);
function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
}
const ruN = (n, one, few, many) => {
  const a = n % 10,
    b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
const TIMES_EN = __text('TIMES_EN'),
  TIMES_RU = __text('TIMES_RU');
const enTimes = n => TIMES_EN[n - 1] || `${n} times`;
const ruTimes = n => TIMES_RU[n - 1] || `${n} ${ruN(n, __text('timeSingularRu'), __text('timesFewRu'), __text('timesManyRu'))}`;
const EP = { He: c => (c.p === 'she' ? 'She' : 'He'), him: c => (c.p === 'she' ? 'her' : 'him') };
