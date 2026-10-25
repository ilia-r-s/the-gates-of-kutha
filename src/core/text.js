// ===================== TEXT: English is the game; Russian is a translation laid over it =====================
// Every visible string travels as a token holding its English text. The screen shows the English unless Russian is
// chosen, in which case the Russian remembered for that exact English is shown instead. The game always opens in
// English; switching language mid-game repaints whatever is on screen without touching the game itself.
// Here too is the grammar both languages need: Russian cases and genders, English pronouns, lists and counts.
let LANG = 'en';
const RUMAP = new Map(),
  MISSING = new Set();
const TK = '\u0001',
  TE = '\u0002';
// bi(en, ru): a piece of text in both languages. Without ru, the Russian comes from the translation tables.
// The same English can need different Russian ("them" is его or её), so a second translation of an English string
// gets its own key, marked with an invisible suffix that the English display drops.
const PAIRKEY = new Map();
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
// one of several wordings, each [English, Russian]: one die picks the same one in both languages
const oneOf = (...pairs) => bi(...pick(pairs));
// The i-th telling of a list of tellings (key: whose list), without the dice: the list is gone through in an order of
// its own, fixed by the season, the whole of it before any of it again, and a new round never begins with the telling
// the last one ended with. For what is told once an occasion (the afternoon of each day: i, the day), and may be drawn
// again on the same occasion and must read the same.
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
// the next telling of a list, as above (S.told: how many of each list have been told so far this season)
function tellOne(key, list) {
  if (!S) return list[0];
  const T = S.told || (S.told = {}),
    i = T[key] || 0;
  T[key] = i + 1;
  return tellAt(key, list, i);
}
// R(en): the Russian for a known English string, for building Russian sentences out of translated parts.
function R(en) {
  if (RUMAP.has(en)) return RUMAP.get(en);
  MISSING.add(en);
  return en;
}
// X(s): what the reader actually sees, in the current language.
function X(s) {
  if (s == null) return '';
  s = String(s);
  if (s.indexOf(TK) < 0) return s;
  if (LANG !== 'ru')
    return s.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, k) => (k.indexOf('\u0003') < 0 ? k : k.slice(0, k.indexOf('\u0003'))));
  // Russian puts a closing full stop after the quotation marks: «Я приду». and „…“».
  return s.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, k) => R(k)).replace(/\.(“?)»/g, '$1».');
}
// pair English and Russian tables of the same shape: every string at the same place is a translation
function zipRU(en, ru) {
  if (typeof en === 'string' && typeof ru === 'string') {
    RUMAP.set(en, ru);
    return;
  }
  if (en && ru && typeof en === 'object' && typeof ru === 'object') Object.keys(ru).forEach(k => zipRU(en[k], ru[k]));
}
// ---------- Russian grammar for people, gods, places and things ----------
const CASE = { n: 0, g: 1, d: 2, a: 3, i: 4, p: 5 }; // именительный, родительный, дательный, винительный, творительный, предложный
const ru = {
  ch: c => RU_CH[typeof c === 'string' ? c : c.id],
  c: (c, k = 'n') => ru.ch(c).short[CASE[k]], // short name, in a case
  cf: (c, k = 'n') => ru.ch(c).name[CASE[k]], // full name, in a case
  f: c => ru.ch(c).g === 'f',
  gs: (c, m, f) => (ru.f(c) ? f : m), // masculine or feminine form
  god: (g, k = 'n') => RU_GOD[g].name[CASE[k]],
  gf: g => RU_GOD[g].g === 'f',
  item: (it, k = 'n') => RU_ITEM[it].f[CASE[k]],
  Item: (it, k = 'n') => capS(RU_ITEM[it].f[CASE[k]]),
  ig: (it, m, f, n, pl) => ({ m, f, n, pl })[RU_ITEM[it].g], // agreement with a thing's gender or number
  loc: (l, k = 'name') => RU_LOC[l][k],
  list: a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' и ' + a[a.length - 1]),
  ob: c => (/^[АЭИОУЫ]/.test(ru.c(c, 'p')) ? 'об ' : 'о ') + ru.c(c, 'p'), // "about someone": о Хамиде, об Ильзе
  name: () => (S.name === 'Marlowe' || S.name === 'Марлоу' ? 'Марлоу' : esc(S.name)),
  dayStamp: () => `День ${S.day} из ${RULES.start.days} · ${RU_SLOT[S.slot]}`
};
// Fill a Russian template: {n} {n.g} {n.d} {n.a} {n.i} {n.p} take a person's name in a case; {n:он|она} picks by their sex.
function fmtR(s, m) {
  return String(s).replace(/\{(\w+)(?:\.([ngdaip]))?(?::([^|}]*)\|([^}]*))?\}/g, (x, k, cs, a, b) => {
    const c = m[k];
    if (c == null) return x;
    if (a != null) return ru.f(c) ? b : a;
    return ru.c(c, cs || 'n');
  });
}
// ---------- English: names, pronouns, lists, counts ----------
const enName = () => (S.name === 'Марлоу' ? 'Marlowe' : esc(S.name)); // the default name follows the language
const fmt = (s, m) => s.replace(/\{(\w+)\}/g, (x, k) => (k in m ? m[k] : x));
const P = c => ({ n: c.short, pp: c.pp, p: c.p });
const listNames = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const capS = s => s.charAt(0).toUpperCase() + s.slice(1);
function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
}
const ruN = (n, one, few, many) => {
  const a = n % 10,
    b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
// how many times, in words up to ten (as a reader would write it), in figures beyond
const TIMES_EN = [
    'once',
    'twice',
    'three times',
    'four times',
    'five times',
    'six times',
    'seven times',
    'eight times',
    'nine times',
    'ten times'
  ],
  TIMES_RU = [
    'один раз',
    'два раза',
    'три раза',
    'четыре раза',
    'пять раз',
    'шесть раз',
    'семь раз',
    'восемь раз',
    'девять раз',
    'десять раз'
  ];
const enTimes = n => TIMES_EN[n - 1] || `${n} times`;
const ruTimes = n => TIMES_RU[n - 1] || `${n} ${ruN(n, 'раз', 'раза', 'раз')}`;
const EP = { He: c => (c.p === 'she' ? 'She' : 'He'), him: c => (c.p === 'she' ? 'her' : 'him') };
