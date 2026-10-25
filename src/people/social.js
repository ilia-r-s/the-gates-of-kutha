// ===================== MORNINGS: the camp at breakfast =====================
// Each morning puts the camp's life together: word of what you did (people/gossip.js), grief for the night's dead, a
// friend's word, a confession (people/pretences.js), an old quarrel flaring up, and the day's talk: gossip, talk of you,
// or someone blaming another aloud. Here too: whom the cult would rather take of a night, and how readily someone takes
// your confidence.

// ---------- who likes whom ----------
// (dealt, moved and asked about by the ties: people/ties.js)
const cultPair = (a, b) => a.role === 'cult' && b.role === 'cult';
// The night's victim: a cultist hesitates over someone they like and not over someone they don't; the cult would
// rather take the people who stand by you, and those who have begun to suspect one of its own, and would rather spare
// someone the camp already suspects, who is more use to it alive.
function victimWeights(npcs) {
  const cult = freeCult(),
    w = {};
  const vw = RULES.victims;
  npcs.forEach(v => {
    let x = 1 + vw.yourFriend * Math.max(0, v.rapport) * cultTurns('confidant'); // (your friends the more, once it knows you lean on them)
    cult.forEach(k => {
      x *= (1 - vw.cultLike * Ties.likes(k.id, v.id)) * Suspicion.threat.weight(v, k);
    });
    x *= 1 - vw.scapegoat * Suspicion.suspectedBy(v).length;
    w[v.id] = Math.max(vw.floor, x);
  });
  return w;
}
// The cult's own leaning toward you, beyond anyone's (RULES.cunning): only toward an occultist, whose interests it may
// half share.
const cultOf = (c, k) => (c.role === 'cult' && S.bg === 'occultist' ? RULES.cunning[k] : 0);
// how readily someone takes your confidence: by their trust in you and their temperament (and the cult, a little more
// readily, an occultist's: cultOf), the less for each confidence they have taken already
const TAKES_CONFIDENCE = odds('takes your confidence', [
  ['base', () => RULES.confide.odds],
  ['+ trust in you', c => RULES.confide.trust * c.rapport],
  ['+ temperament', c => TP(c).confide],
  ['+ the cult, to an occultist', c => cultOf(c, 'listen')],
  ['- confidences taken already', c => RULES.confide.again * Ties.confidences(c)],
  ['clamp', () => [RULES.confide.min, RULES.confide.max]]
]);

const quoted = (lead, text) => lead + text + bi('”', '»');
// someone suspicious, or with a grudge, or sure of someone, blames another out loud: rightly now and then, mostly not
function breakfastBlame() {
  const free = freeChars(),
    grudge = c => free.some(o => o.id !== c.id && Ties.cannotBear(c.id, o.id));
  const pool = free.filter(c => temperOf(c) === 'suspicious' || grudge(c) || free.some(o => Suspicion.sure(c, o)));
  if (!pool.length) return '';
  const s = pick(pool),
    seen = thiefSaw(s), // the thief who saw who did it mostly only hints (people/thief.js); now and then he says it aloud
    outright = !!seen && chance(RULES.thief.outright),
    others = free.filter(o => o.id !== s.id && (!seen || o.id !== seen.actor));
  const t = outright ? C(seen.actor) : Parts.move(s, 'nameAloud')(s, others); // (people/parts.js)
  return t ? blameAloud(s, t) : '';
}
// the cult, blaming aloud: the other of it, once it looks lost, by one ruthless enough (busFor); else, as it frames, an
// innocent it dislikes; or nobody
function cultNamesAloud(s, others) {
  const inno = others.filter(o => o.role !== 'cult'),
    t = busFor(s, others);
  if (t) return t;
  return !inno.length || !chance(TP(s).frame) ? null : Ties.pickByLike(s, inno, -1);
}
// After a quarrel (game/events.js), each morning it may flare up again: the one who feels it more blames the other
// before everyone (unless both are of the cult, or it would name the one the thief saw). Once, or never.
function feudAgain() {
  const f = S.tenor.feud;
  if (!f || !chance(room('talk') * TENOR.feud)) return '';
  S.tenor.feud = null;
  const [a, b] = f.map(C),
    seen = thiefSaw(a);
  if (!isFree(a) || !isFree(b) || cultPair(a, b) || (seen && seen.actor === b.id)) return '';
  return blameAloud(a, b, true);
}
// s says before everyone that they do not trust t (heavy: it comes seldom in the season's mood, and more of the camp
// listens); feud: it is an old quarrel flaring up again
function blameAloud(s, t, feud = false) {
  const heavy = weighty('talk');
  stirred('talk');
  Suspicion.blame(s.id, t.id);
  const lead = feud
    ? bi(
        `At breakfast the quarrel between ${s.short} and ${t.short} flares up again. ${s.short} says, loudly enough for everyone:`,
        `За завтраком ссора между ${ru.c(s, 'i')} и ${ru.c(t, 'i')} вспыхивает снова. ${ru.c(s)} говорит так, чтобы слышали все:`
      )
    : bi(`Over breakfast, ${s.short} says, loudly enough for everyone:`, `За завтраком ${ru.c(s)} говорит так, чтобы слышали все:`);
  return `<p class="notice">${lead} ${
    (temperOf(s) === 'suspicious') === chance(RULES.talk.ownWay) // (the suspicious mostly say they saw something)
      ? bi(
          `“I saw ${t.short} go out after dark. Ask ${EP.him(t)} why.”`,
          `«Я ${ru.gs(s, 'видел', 'видела')}, как ${ru.c(t)} ${ru.gs(t, 'уходил', 'уходила')} куда-то затемно. Спросите ${ru.gs(t, 'его', 'её')} зачем».`
        )
      : bi(
          `“I will say it if no one else will. I do not trust ${t.short}.”`,
          `«Скажу, раз больше никто не решается: я не доверяю ${ru.c(t, 'd')}».`
        )
  }</p>${Moments.stir('blame', { by: s.id, about: t.id, heavy })}`;
}
// A friend who saw someone in the dark last night tells you before breakfast, unasked: only what they saw (where they
// were and with whom is for when you ask them).
function volunteerSighting() {
  const n = S.day - 1,
    rec = S.nights[n];
  if (!rec) return '';
  const c = pick(
    freeChars().filter(
      o => Ties.friend(o) && rec.saw[o.id] && S.chars[rec.saw[o.id].who] && !S.claims.some(x => x.night === n && x.id === o.id)
    )
  );
  if (!c || !chance(room('talk') * RULES.talk.volunteer)) return '';
  const sw = rec.saw[c.id],
    cl = rec.claim[c.id] || { loc: 'camp', with: null };
  Record.addSighting({ night: n, id: c.id, where: sw.where, to: sw.to, cat: sw.cat, val: sawVal(sw) });
  return `<p class="notice">${bi(`Before breakfast, ${c.short} takes you aside. “I did not want to say it in front of the others.`, `Ещё до завтрака ${ru.c(c)} отводит вас в сторону. «Не ${ru.gs(c, 'хотел', 'хотела')} говорить при остальных.`)} ${sightLine(cl, sw, c)}${bi('”', '»')}</p>`;
}
const nameList = ids => listNames(ids.map(id => C(id).short)),
  nameListRu = (ids, k = 'n') => ru.list(ids.map(id => ru.c(id, k)));
function trustNote(up, down) {
  let h = '';
  if (down.length)
    h += `<p class="loss">${bi(`${nameList(down)} ${down.length > 1 ? 'trust' : 'trusts'} you less now`, `${nameListRu(down)} теперь ${down.length > 1 ? 'доверяют' : 'доверяет'} вам меньше`)}</p>`;
  if (up.length)
    h += `<p class="gain">${bi(`${nameList(up)} ${up.length > 1 ? 'trust' : 'trusts'} you more now`, `${nameListRu(up)} теперь ${up.length > 1 ? 'доверяют' : 'доверяет'} вам больше`)}</p>`;
  return h;
}
// a true word the cult can spare: the thief is out at night, and saying so turns eyes away from the mound
function tipLine(t) {
  const k = pick([0, 1]);
  return bi(
    [
      `If you want someone who wanders at night, Doctor, ask ${t.short} what is in those crates by the magazine.`,
      `${t.short} is out every night, and it is not to pray. Look under ${t.pp} bedroll.`
    ][k],
    [
      `Если вам нужен тот, кто бродит по ночам, доктор, спросите ${ru.c(t, 'a')}, что лежит в ящиках у хранилища.`,
      `${ru.c(t)} каждую ночь куда-то ходит — и не молиться. Загляните под ${ru.gs(t, 'его', 'её')} походную постель.`
    ][k]
  );
}
// ---------- grief ----------
// Those who liked the night's dead mourn them today, nearly all; the one who takes it hardest (the fonder, the likelier)
// is named, unless they spoke.
function mourners(victim) {
  const who = freeChars().filter(c => Ties.fond(c.id, victim) && chance(RULES.morning.mourn));
  who.forEach(c => Ties.mourn(c, victim));
  const last = Moments.last(),
    m = who.length ? C(wpick(Object.fromEntries(who.map(c => [c.id, Ties.likes(c.id, victim) ** 2])))) : null;
  if (!m || (last && last.kind === 'grief' && last.by === m.id)) return '';
  const v = C(victim);
  return `<p class="notice">${bi(...tellOne('hardest', SAY.hardest)(m, v))}</p>`;
}
// Sitting with someone who mourns the night's dead, the day it happened: it may comfort them, and they will not forget
// it.
function consoled(c) {
  const m = Ties.mourning(c);
  if (!m || m.day !== S.day || m.done || !chance(RULES.talk.comfort)) return null;
  Ties.comfort(c);
  const v = C(m.victim);
  return bi(
    `You sit with ${c.short} a while and talk about ${v.short}. ${EP.He(c)} will not forget it.`,
    `Вы долго сидите рядом с ${ru.c(c, 'i')} и говорите ${ru.ob(v)}. ${ru.gs(c, 'Он', 'Она')} этого не забудет.`
  );
}
// ---------- mornings ----------
// The grief for the night's dead, told with the death itself (game/night.js): the camp's grief; those who liked them
// mourn today, and the one who takes it hardest is named, unless they have spoken already; what was said of them is
// settled, the camp taking the dead for innocent, mostly (one whom two of them suspected in earnest, it may not:
// morning.withhold); and if the dead had named someone guilty before everyone, someone may say aloud what the camp is
// thinking (ontoSaid).
function griefFor(victim) {
  return (
    Moments.stir('grief', { about: victim }) +
    mourners(victim) +
    (Suspicion.suspected(victim) && chance(RULES.morning.withhold) ? '' : Moments.settle(victim, false)) +
    ontoSaid(victim)
  );
}
// The dead had named someone guilty before everyone (the last they named, if more than one, and still here), and now
// they are dead: someone says so aloud (camp.onto), whoever draws the line first. It may be what the cult killed them
// for, and it may be what it wanted the camp to think (game/night.js, chooseVictim): the line is the same either way.
function ontoSaid(victim) {
  const named = Suspicion.accusations(victim).filter(x => isFree(C(x.about)));
  return named.length && chance(RULES.camp.onto.odds) ? Moments.stir('onto', { about: named.pop().about, dead: victim }) : '';
}
// The rest of breakfast: each one of the morning's extras, crowded out by those that came before it (game/tenor.js,
// room). victim: whoever the night took, if anyone.
function socialMorning(victim) {
  let h = chance(Math.min(1, room('talk') * visitTalk() * deedTalk())) ? brought(Gossip.rumours()) : ''; // (the more after a night visit, or the deed)
  h += brought(volunteerSighting());
  const c = shuffle(freeChars()).find(o => chance(room('talk') * confessChance(o, !!victim)));
  if (c) h += brought(morningConfession(c));
  h += brought(feudAgain());
  // the morning's talk, as often as talk comes in the season's mood, and when it runs high, now and then a second piece
  const t = rateOf('talk');
  if (chance(room('talk') * clamp(RULES.morning.talk * t))) {
    const k = breakfastKind();
    h += brought(breakfastTalk(k));
    if (chance(room('talk') * TENOR.second * Math.min(1, Math.max(TENOR.floor, t - 1)))) h += brought(breakfastTalk(breakfastKind(k)));
  }
  return h;
}
// what kind of talk (not: one already heard this morning)
function breakfastKind(not = null) {
  const w = {};
  ['you', 'gossip', 'blame']
    .filter(k => k !== not)
    .forEach(k => {
      w[k] = RULES.morning[k];
    });
  return wpick(w);
}
const breakfastTalk = k => (k === 'you' ? Gossip.ofYou() : k === 'gossip' ? Gossip.speak('breakfast') : breakfastBlame());
