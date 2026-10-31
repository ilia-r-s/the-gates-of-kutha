// people/thief.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const FROM_EN = __text('FROM_EN');
function thiefSees(n, loc, actorId, robbed) {
  const smug = freeChars().find(c => c.role === 'smuggler'),
    rec = S.nights[n];
  if (!smug || inYourTent(smug.id, n) || !rec || !rec.truth[smug.id] || rec.truth[smug.id].attacked || loc === 'camp') return;
  const th = RULES.thief,
    p = rec.truth[smug.id].loc === loc ? th.near : robbed ? th.robbed : th.witness;
  if (!chance(p)) return;
  const others = freeChars().filter(c => c.id !== smug.id && c.id !== actorId && c.id !== rec.target),
    w = { night: n, actor: chance(th.sure) || !others.length ? actorId : pick(others).id, real: actorId, loc: loc };
  w.sure = believes(smug, w);
  S.witness.push(w);
}
const SURENESS = ['unsure', 'fairly', 'sure'],
  rightly = w => w.actor === w.real,
  likesSeen = (c, w) => Ties.likes(c.id, w.actor);
const SURE_OF_IT = odds('the thief is sure of whom he saw', [
    ['base', () => RULES.thief.sureOf],
    ['+ saw rightly (- not)', (c, w) => (rightly(w) ? 1 : -1) * RULES.thief.clear],
    ['- a muddled head', c => RULES.thief.muddled * TP(c).mistake],
    ['+ cannot like them', (c, w) => RULES.thief.dislike * Math.max(0, -likesSeen(c, w))],
    ['- likes them', (c, w) => RULES.thief.fond * Math.max(0, likesSeen(c, w))],
    ['clamp', () => [RULES.scale.least, RULES.scale.most]]
  ]),
  DOUBTS_IT = odds('the thief doubts whom he saw', [
    ['base', () => RULES.thief.doubt],
    ['- saw rightly (+ not)', (c, w) => (rightly(w) ? 1 : -1) * RULES.thief.clear],
    ['+ a muddled head', c => RULES.thief.muddled * TP(c).mistake],
    ['- cannot like them', (c, w) => RULES.thief.dislike * Math.max(0, -likesSeen(c, w))],
    ['+ likes them', (c, w) => RULES.thief.fond * Math.max(0, likesSeen(c, w))],
    ['clamp', () => [RULES.scale.least, RULES.scale.most]]
  ]),
  TELLS_IT_LESS = odds('the thief tells it less sure than he is', [['base', c => (Ties.against(c) ? RULES.thief.guarded : 0)]]),
  TELLS_IT_MORE = odds('the thief tells it surer than he is', [
    ['base', c => RULES.thief.overstate * (1 - TP(c).truth)],
    ['* to a friend', c => (Ties.friend(c) ? RULES.thief.candid : 1)]
  ]);
const believes = (c, w) => (SURE_OF_IT.roll(c, w) ? 'sure' : DOUBTS_IT.roll(c, w) ? 'unsure' : 'fairly'),
  surer = (k, d) => SURENESS[Math.max(0, Math.min(SURENESS.length - 1, SURENESS.indexOf(k) + d))],
  tellsIt = (c, w) => (TELLS_IT_LESS.roll(c) ? surer(w.sure, -1) : TELLS_IT_MORE.roll(c) ? surer(w.sure, 1) : w.sure);
function thiefLeans(c, x) {
  const w = c.role === 'smuggler' && S.witness.filter(v => v.actor === x.id).pop();
  return w ? RULES.thief.leans[w.sure] : 0;
}
const thiefSaw = c =>
  c.role === 'smuggler' && (!S.witnessTold || S.witnessMore)
    ? S.witness
        .filter(w => isFree(C(w.actor)) && !S.witnessNamed.includes(w.actor))
        .slice(-1)
        .pop() || null
    : null;
function thiefHint(c, w) {
  const a = C(w.actor),
    k = sayPick([0, 1]);
  Record.testify(c.id, a.id, 'distrust', 'cult');
  return { them: bi(...TX.thief.ifIWereYou(a, k, c)), note: bi(...TX.thief.saysItLightlyAnd(c)) };
}
function thiefGossip(c, w) {
  const a = C(w.actor),
    k = sayPick([0, 1]);
  Record.testify(c.id, a.id, 'hint', 'night');
  return { t: a, text: bi(...TX.thief.keepsVeryLateHours(a, k, c)) };
}
function nightAgo(n) {
  const k = S.day - n;
  if (n === 0) return __text('theNightCraneDied');
  if (k <= 1) return __text('lastNight');
  if (k === 2) return __text('twoNightsAgo');
  return __text('nightsAgo');
}
function thiefNames(c, lead = ['', '']) {
  const w = thiefSaw(c);
  if (!w) return '';
  const a = C(w.actor),
    [en, rus] = nightAgo(w.night),
    told = (w.told = tellsIt(c, w));
  S.witnessTold = a.id;
  S.witnessNamed.push(a.id);
  S.witnessMore = chance(RULES.thief.again);
  Record.testify(c.id, a.id, 'witness', told);
  Record.journal(bi(...NAMED_JOURNAL[told](c, a, en, rus)));
  const [said, saidRu] = NAMED[told](c, a, en, rus, FROM_EN[w.loc], ru.loc(w.loc, 'from'), w.night === 0 ? ',' : '');
  return bi(...TX.thief.andSinceWeAre(lead, said, saidRu, c));
}
const NAMED = {
  sure: (c, a, en, rus, from, fromRu, comma) => TX.thief.iSawComingBack(en, comma, a, from, rus, c, fromRu),
  fairly: (c, a, en, rus, from, fromRu, comma) => TX.thief.iSawSomeoneComing(en, comma, from, a, rus, c, fromRu),
  unsure: (c, a, en, rus, from, fromRu, comma) => TX.thief.iSawSomeoneComing2(en, comma, from, a, rus, c, fromRu)
};
const NAMED_JOURNAL = {
  sure: (c, a, en, rus) => TX.thief.sawNearTheScene(c, a, en, rus),
  fairly: (c, a, en, rus) => TX.thief.saidAtLastThat(c, en, a, rus),
  unsure: (c, a, en, rus) => TX.thief.saidAtLastThat2(c, en, a, rus)
};
