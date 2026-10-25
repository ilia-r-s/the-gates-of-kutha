// ===================== SYMPATHIES, GOSSIP, MORNINGS =====================
// Everyone likes or dislikes everyone else, and you. Likes colour gossip and blame, lead friends to cover for each
// other, decide where people go and with whom, and help the cult choose its victims. What you do to one person, their
// friends hear about by morning; what is said of you at breakfast moves the trust of those who listen. Each morning puts
// it together: rumours, grief, a friend's word, a confession (people/pretences.js), and the day's talk.

// ---------- who likes whom ----------
const cultPair = (a, b) => a.role === 'cult' && b.role === 'cult';
function assignLikes() {
  S.like = {};
  S.order.forEach(a => {
    S.like[a] = {};
  });
  S.order.forEach((a, i) =>
    S.order.slice(i + 1).forEach(b => {
      const v = +wpick(LIKE_W),
        w = chance(RULES.likes.mutual) ? v : +wpick(LIKE_W),
        pact = cultPair(C(a), C(b)) && chance(RULES.likes.pact) ? 1 : 0;
      S.like[a][b] = Math.min(2, v + pact);
      S.like[b][a] = Math.min(2, w + pact);
    })
  );
  // and how each of them feels about you when you arrive
  S.rap0 = {};
  S.order.forEach(id => {
    const c = C(id),
      t = TP(c);
    let r = +wpick(RULES.likes.toYou);
    if (chance(t.warm)) r++;
    if (chance(t.sour)) r--;
    c.rapport = Math.max(RULES.scale.trustMin, Math.min(RULES.scale.talkMax, r));
    S.rap0[id] = c.rapport;
  });
  S.rumors = [];
  S.pending = [];
}
const likes = (a, b) => (S.like && S.like[a] ? S.like[a][b] || 0 : 0);
// a's liking for b moves a step (d), from cannot bear (−2) to fond (2); false if it could not move (people/camp.js:
// resent, and what the camp makes of a night in your tent, STIRS.scandal)
function likeShift(a, b, d) {
  if (!S.like || !S.like[a]) return false;
  const v = Math.max(-2, Math.min(2, likes(a, b) + d));
  if (v === likes(a, b)) return false;
  S.like[a][b] = v;
  return true;
}
// What has passed between two of the camp, as far as anyone could see: quarrels between them and feasts they sat
// through together (game/events.js), how far a suspects b (people/camp.js), and whether either named the other guilty
// before everyone (S.said: accused, a named b; accusedBy, b named a). An old score colours how someone takes what they
// hear (people/camp.js, STIRS.scandal).
function pastBetween(a, b) {
  const pair = t => (t.about === a && t.verdict === b) || (t.about === b && t.verdict === a),
    named = (x, y) => S.said.some(z => z.by === x && z.about === y && z.verdict === 'cult');
  return {
    quarrels: S.testimony.filter(t => t.kind === 'quarrel' && pair(t)).length,
    feasts: S.testimony.filter(t => t.kind === 'feast' && pair(t)).length,
    suspects: sus(a, b),
    accused: named(a, b),
    accusedBy: named(b, a)
  };
}
// someone from a pool, leaning toward those the chooser feels strongly about: sign -1 seeks out the disliked, +1 the liked
function pickByLike(from, pool, sign) {
  if (!pool.length) return null;
  const w = {};
  pool.forEach(o => {
    w[o.id] = Math.max(RULES.likes.floor, 1 + RULES.likes.pull * sign * likes(from.id, o.id));
  });
  return C(wpick(w));
}
// move someone's feeling for you one step if it can move; talk alone never makes anyone devoted, or worse than hostile
function nudge(o, d) {
  if ((d > 0 && o.rapport >= RULES.scale.talkMax) || (d < 0 && o.rapport <= RULES.scale.trustMin)) return false;
  o.rapport += d;
  return true;
}
// trust moved by what happens rather than by talk: up as far as devoted, down as far as hostile
const trustUp = c => (c.rapport = Math.min(RULES.scale.trustMax, c.rapport + 1)),
  trustDown = c => (c.rapport = Math.max(RULES.scale.trustMin, c.rapport - 1)),
  trustOf = c => Math.max(RULES.scale.trustMin, Math.min(RULES.scale.trustMax, c.rapport));
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
      x *= (1 - vw.cultLike * likes(k.id, v.id)) * (1 + vw.suspects * sus(v.id, k.id));
    });
    x *= 1 - vw.scapegoat * suspectedBy(v.id).length;
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
  ['- confidences taken already', c => RULES.confide.again * ((S.confided && S.confided[c.id]) || 0)],
  ['clamp', () => [RULES.confide.min, RULES.confide.max]]
]);

// ---------- gossip: what people say of each other, true or slanted by their likes ----------
const bondSay = (a, b, close) =>
  close
    ? bi(
        `${a.short} and ${b.short} are thick as thieves. Have you not noticed?`,
        `${ru.c(a)} и ${ru.c(b)} — не разлей вода. Неужели вы не заметили?`
      )
    : bi(
        `${a.short} cannot bear ${b.short}. Watch them at dinner.`,
        `${ru.c(a)} терпеть не может ${ru.c(b, 'a')}. Посмотрите на них за ужином.`
      );
// One piece of gossip from s, about anyone but s and those listening; it goes into your casebook as testimony. sure:
// the talk is heavy (it comes seldom in the season's mood, game/tenor.js), and true to what the speaker knows; heard:
// said to someone else, and overheard. Returns { t: whom it is about, text, hear?: how those who hear it may take it
// (people/camp.js, a row of STIRS, and what it is told with) } or null (nothing worth saying).
function gossipLine(s, not = [], sure = false, heard = false) {
  // a thief who saw something hints at it; while the camp still talks of it, of the night someone spent in your tent;
  // now and then, the talk is of who is sweet on whom, or of what someone thinks of you
  const w = thiefSaw(s);
  if (w && !not.includes(w.actor) && chance(RULES.thief.gossip)) return thiefGossip(s, w);
  const vg = visitGossip(s, not, heard);
  if (vg) return vg;
  const f = chance(RULES.flirt.gossip) && flirtGossip(s, not, heard);
  if (f) return f;
  const pool = freeChars().filter(o => o.id !== s.id && !not.includes(o.id));
  if (!pool.length) return null;
  const y = chance(RULES.gossip.you) && thinksGossip(s, pool, sure, heard);
  if (y) return y;
  if (pool.length < 2 || chance(RULES.gossip.temper)) {
    const t = pickByLike(s, pool, coin() ? -1 : 1),
      l = likes(s.id, t.id),
      real = temperOf(t);
    let v = real;
    if (!sure && !chance(TP(s).gossipTrue - RULES.gossip.likeBias * Math.abs(l)))
      v = pick((l < 0 || temperOf(s) === 'suspicious' ? NEG : l > 0 ? POS : TEMPER_IDS).filter(k => k !== real));
    addTest(s.id, t.id, 'temper', v);
    // (no cultist speaks of what it feels for the other: feelRemark)
    // (an aside about one they are taken with, mostly; now and then about one they are not: flirt.asideFalse)
    const aside =
      !cultPair(s, t) && (flirtsWith(s.id, t.id) ? chance(RULES.flirt.aside) : mayFlirt(s, t) && chance(RULES.flirt.asideFalse));
    return { t, text: tellOne('said-' + v, TEMPER_SAID[v])(t) + (aside ? flirtAside(t) : '') };
  }
  // a friendship or a feud, as the speaker sees it
  const a = pick(pool),
    b = pick(pool.filter(o => o.id !== a.id)),
    real = likes(a.id, b.id) + likes(b.id, a.id);
  let close = real >= 2 ? true : real <= -2 ? false : null;
  // a strong friendship or feud is reported, or now and then misreported; a weak one is sometimes invented
  if (!sure && !chance(TP(s).gossipTrue))
    close = close === null ? (chance(RULES.gossip.inventBond) ? coin() : null) : chance(RULES.gossip.flipBond) ? !close : null;
  if (close === null) return null; // nothing worth saying
  addTest(s.id, a.id, 'bond', (close ? 'close:' : 'feud:') + b.id);
  return { t: a, text: bondSay(a, b, close) };
}
// ---------- what someone thinks of you ----------
// Gossip about what someone else thinks of you (gossip.you of the time it could be told): a strong feeling, for you
// (trust 2 or more: good) or against you (−1 or less: bad), told true at the speaker's gossipTrue, the less so of someone
// they feel strongly about (gossip.likeBias); when it is not, misreported, or made up where there is nothing much
// either way, leaning as the speaker does (kind to a friend, hard on someone they dislike, the suspicious hard on
// anyone), at the odds gossip about a friendship or a feud has (gossip.flipBond, inventBond). Your casebook's word for
// their trust always tells the truth: gossip is only as true as the gossip.
const THINKS_SAID = {
  bad: [
    (s, t) => bi(`${t.short} does not trust you, Doctor. Not an inch.`, `${ru.c(t)} вам не доверяет, доктор. Ни на грош.`),
    (s, t) =>
      bi(
        `You should hear what ${t.short} says of you when you are out of earshot.`,
        `Послушали бы вы, что ${ru.c(t)} говорит о вас за глаза.`
      ),
    (s, t) =>
      bi(
        `${t.short} would be glad to see you on the lorry to Hillah, Doctor. ${EP.He(t)} has as good as said so.`,
        `${ru.c(t)} ${ru.gs(t, 'был бы рад', 'была бы рада')} увидеть вас в грузовике до Хиллы, доктор. ${ru.gs(t, 'Он', 'Она')} почти так и ${ru.gs(t, 'сказал', 'сказала')}.`
      )
  ],
  good: [
    (s, t) =>
      bi(
        `${t.short} thinks the world of you, Doctor, though ${t.p} would never say so to your face.`,
        `${ru.c(t)} о вас самого высокого мнения, доктор, хоть в глаза никогда этого и не скажет.`
      ),
    (s, t) =>
      bi(`${t.short} speaks up for you whenever the others grumble.`, `${ru.c(t)} всякий раз заступается за вас, когда остальные ворчат.`),
    (s, t) =>
      bi(
        `If it comes to it, ${t.short} will stand by you. ${EP.He(t)} told me as much.`,
        `Если дойдёт до дела, ${ru.c(t)} будет на вашей стороне. ${ru.gs(t, 'Он мне сам так сказал', 'Она мне сама так сказала')}.`
      )
  ]
};
// ... said of you to someone else, and overheard
const THINKS_HEARD = {
  bad: [
    (s, t) => bi(`${t.short} does not trust the Doctor. Not an inch.`, `${ru.c(t)} не доверяет доктору. Ни на грош.`),
    (s, t) =>
      bi(
        `You should hear what ${t.short} says of the Doctor behind the Doctor’s back.`,
        `Послушали бы вы, что ${ru.c(t)} говорит о докторе за глаза.`
      ),
    (s, t) =>
      bi(
        `${t.short} would be glad to see the Doctor on the lorry to Hillah.`,
        `${ru.c(t)} ${ru.gs(t, 'был бы рад', 'была бы рада')} увидеть доктора в грузовике до Хиллы.`
      )
  ],
  good: [
    (s, t) =>
      bi(
        `${t.short} thinks the world of the Doctor, though ${t.p} would never say so.`,
        `${ru.c(t)} о докторе самого высокого мнения, хоть никогда этого и не скажет.`
      ),
    (s, t) =>
      bi(
        `${t.short} speaks up for the Doctor whenever the rest of us grumble.`,
        `${ru.c(t)} всякий раз заступается за доктора, когда мы все ворчим.`
      ),
    (s, t) => bi(`If it comes to it, ${t.short} will stand by the Doctor.`, `Если дойдёт до дела, ${ru.c(t)} будет на стороне доктора.`)
  ]
};
function thinksGossip(s, pool, sure, heard) {
  const t = pickByLike(s, pool, coin() ? -1 : 1),
    l = likes(s.id, t.id),
    r = trustOf(t),
    real = r >= 2 ? 'good' : r <= -1 ? 'bad' : null;
  let v = real;
  if (!sure && !chance(TP(s).gossipTrue - RULES.gossip.likeBias * Math.abs(l))) {
    const lean = l > 0 ? 'good' : l < 0 || temperOf(s) === 'suspicious' ? 'bad' : null;
    v =
      real === null
        ? chance(RULES.gossip.inventBond)
          ? lean || pick(['good', 'bad'])
          : null
        : chance(RULES.gossip.flipBond)
          ? lean || (real === 'good' ? 'bad' : 'good')
          : null;
  }
  if (!v) return null; // (nothing worth saying)
  addTest(s.id, t.id, 'thinks', v);
  return { t, text: tellOne(`thinks-${v}${heard ? '-heard' : ''}`, (heard ? THINKS_HEARD : THINKS_SAID)[v])(s, t) };
}
// ---------- the night someone spent in your tent ----------
// Gossip about it (gossip.visit), from the morning the camp knows of it (people/visit.js) while she is still at the dig:
// at odds, × fade for each day after the first. Told badly, as a scandal (she hardly knows the Doctor), or kindly, as the
// speaker is inclined: badly at bad, + spite a step they dislike her, + jealous if they are sweet on you or on her, + foe
// a step they are against you, + their temperament's prudery (TEMPERS prude), + vows for a priest; − friend a step they
// like her, − ally a step they are past fond of you. Whoever hears it may make something of it, once each: of her, and
// of you (people/camp.js, STIRS.scandal).
const VISIT_SAID = {
  bad: [
    h =>
      bi(
        `You have not been here a week, Doctor, and ${h.short} is already in your tent. The camp is talking, and not kindly.`,
        `Вы здесь и недели нет, доктор, а ${ru.c(h)} уже у вас в палатке. Лагерь об этом говорит — и говорит недоброе.`
      ),
    h =>
      bi(
        `${h.short} hardly knows you, Doctor, and spent the night in your tent all the same. In my day a lady waited to be courted.`,
        `${ru.c(h)} вас почти не знает, доктор, и всё же провела ночь в вашей палатке. В моё время дама ждала, пока за ней поухаживают.`
      ),
    h =>
      bi(
        `People are saying ${h.short} did not wait to be asked twice. I only tell you what is said.`,
        `Говорят, ${ru.c(h, 'a')} не пришлось просить дважды. Я лишь передаю, что говорят.`
      )
  ],
  kind: [
    h =>
      bi(
        `${h.short}? Good for her, Doctor, and for you. Life is short out here, and shorter this season.`,
        `${ru.c(h)}? Тем лучше для неё, доктор, — и для вас. Жизнь здесь коротка, а в этот сезон и того короче.`
      ),
    h =>
      bi(
        `Never mind what they say about ${h.short}, Doctor. Half of them are only jealous.`,
        `Не слушайте, что говорят ${ru.ob(h)}, доктор: половина из них просто завидует.`
      )
  ]
};
// ... said to someone else, and overheard
const VISIT_HEARD = {
  bad: [
    h =>
      bi(
        `The Doctor has not been here a week, and ${h.short} is already in the Doctor’s tent. In my day a lady waited to be courted.`,
        `Доктор здесь и недели нет, а ${ru.c(h)} уже в докторской палатке. В моё время дама ждала, пока за ней поухаживают.`
      ),
    h =>
      bi(
        `${h.short} hardly knows the Doctor, and stays the night all the same. Well. Now we know what to think of her.`,
        `${ru.c(h)} доктора почти не знает — и всё же остаётся на ночь в докторской палатке. Что ж. Теперь мы знаем, что о ней думать.`
      ),
    h => bi(`Did you hear? ${h.short} did not wait to be asked twice.`, `Слыхали? ${ru.c(h, 'a')} не пришлось просить дважды.`)
  ],
  kind: [
    h =>
      bi(
        `${h.short} and the Doctor? Good for them. Life is short out here.`,
        `${ru.c(h)} и доктор? Тем лучше для них. Жизнь здесь коротка.`
      ),
    h => bi(`Let them talk about ${h.short}. Half of them are only jealous.`, `Пусть болтают ${ru.ob(h)}: половина из них просто завидует.`)
  ]
};
function visitGossip(s, not, heard) {
  const v = S.log && S.log.visit,
    G = RULES.gossip.visit;
  if (!v || !v.agreed || !v.morning || !S.chars[v.id]) return null;
  const h = C(v.id);
  if (!isFree(h) || h.id === s.id || not.includes(h.id) || !chance(G.odds * G.fade ** Math.max(0, S.day - v.day - 1))) return null;
  const l = likes(s.id, h.id),
    tr = trustOf(s),
    bad = chance(
      clamp(
        G.bad +
          G.spite * Math.max(0, -l) -
          G.friend * Math.max(0, l) +
          (flirtsWithYou(s) || flirtsWith(s.id, h.id) ? G.jealous : 0) +
          G.foe * Math.max(0, -tr) -
          G.ally * Math.max(0, tr - 2) +
          TP(s).prude +
          (VOWS.includes(s.id) ? G.vows : 0)
      )
    ),
    k = bad ? 'bad' : 'kind';
  addTest(s.id, h.id, 'scandal', k);
  return {
    t: h,
    text: tellOne(`visit-${k}${heard ? '-heard' : ''}`, (heard ? VISIT_HEARD : VISIT_SAID)[k])(h),
    hear: { kind: 'scandal', o: { by: s.id, about: h.id, bad } }
  };
}
const quoted = (lead, text) => lead + text + bi('”', '»');
// Gossip at breakfast, before everyone (those who hear it may take it up: people/camp.js, stir); and gossip overheard as
// you go about the dig, when two or more people are together (only the one it is told to hears it, but for you).
function breakfastGossip() {
  const pool = freeChars().filter(c => chance(TP(c).gossip));
  if (!pool.length) return '';
  const s = pick(pool),
    heavy = weighty('talk'),
    g = gossipLine(s, [], heavy);
  if (!g) return '';
  stirred('talk');
  return (
    `<p class="notice">${quoted(bi(`Over breakfast, ${s.short} says of ${g.t.short}: “`, `За завтраком ${ru.c(s)} говорит ${ru.ob(g.t)}: «`), g.text)}</p>` +
    (g.hear ? stir(g.hear.kind, { ...g.hear.o, heavy, before: true }) : '')
  );
}
function overheard(here) {
  if (here.length < 2) return '';
  const w = {};
  here.forEach(c => {
    w[c.id] = TP(c).gossip;
  });
  const s = C(wpick(w)),
    l = pick(here.filter(o => o.id !== s.id)),
    heavy = weighty('talk'),
    g = gossipLine(s, [l.id], heavy, true);
  if (!g) return '';
  stirred('talk');
  return (
    `<p class="notice">${quoted(bi(`As you go, you overhear ${s.short} telling ${l.short}: “`, `Уходя, вы слышите, как ${ru.c(s)} говорит ${ru.c(l, 'd')}: «`), g.text)}</p>` +
    (g.hear ? stir(g.hear.kind, { ...g.hear.o, heavy, only: [l.id] }) : '')
  );
}
// someone suspicious, or with a grudge, or sure of someone, blames another out loud: rightly now and then, mostly not
function breakfastBlame() {
  const free = freeChars(),
    grudge = c => free.some(o => o.id !== c.id && Ties.cannotBear(c.id, o.id));
  const pool = free.filter(c => temperOf(c) === 'suspicious' || grudge(c) || free.some(o => sus(c.id, o.id) >= RULES.scale.suspicion));
  if (!pool.length) return '';
  const s = pick(pool),
    seen = thiefSaw(s), // the thief who saw who did it mostly only hints (people/thief.js); now and then he says it aloud
    outright = !!seen && chance(RULES.thief.outright),
    others = free.filter(o => o.id !== s.id && (!seen || o.id !== seen.actor));
  let t;
  if (outright) t = C(seen.actor);
  else if (s.role === 'cult') {
    const inno = others.filter(o => o.role !== 'cult');
    t = busFor(s, others); // (the other of the cult, once it looks lost, by one ruthless enough)
    if (!t) {
      if (!inno.length || !chance(TP(s).frame)) return '';
      t = pickByLike(s, inno, -1);
    }
  } else t = innocentBlames(s, others);
  return t ? blameAloud(s, t) : '';
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
  addTest(s.id, t.id, 'distrust', 'cult');
  sayPublic(s.id, t.id, 'cult', 'blame');
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
  }</p>${stir('blame', { by: s.id, about: t.id, heavy })}`;
}
// ---------- what they say of their own feelings ----------
// A word in passing about someone they feel strongly about: fond of them, cannot stand them, or taken with them. True to
// their feelings, mostly (now and then a liar's or a light-headed one's word is the opposite of what they feel:
// talk.feelFalse × how untrue their gossip runs), except that nobody in the cult speaks of the other.
const FEEL_SAY = {
  like: [
    (c, t) =>
      bi(
        `${t.short} is the only one here who makes me laugh. Do not tell ${EP.him(t)} I said so.`,
        `${ru.c(t)} — единственный человек здесь, с кем мне бывает смешно. Только не говорите ${ru.gs(t, 'ему', 'ей')}, что я так ${ru.gs(c, 'сказал', 'сказала')}.`
      ),
    (c, t) =>
      bi(
        `If you want sense in this camp, talk to ${t.short}.`,
        `Если хотите услышать в этом лагере что-то здравое, поговорите с ${ru.c(t, 'i')}.`
      )
  ],
  dislike: [
    (c, t) =>
      bi(
        `Keep ${t.short} away from my tent, Doctor, and we will get on.`,
        `Держите ${ru.c(t, 'a')} подальше от моей палатки, доктор, и мы поладим.`
      ),
    (c, t) => bi(`${t.short} and I do not speak, if we can help it.`, `Мы с ${ru.c(t, 'i')} стараемся не разговаривать.`)
  ],
  flirt: [
    (c, t) =>
      bi(
        `${t.short}? Insufferable. And rather ${t.p === 'she' ? 'lovely' : 'handsome'}, I grant you.`,
        `${ru.c(t)}? ${ru.gs(t, 'Невыносим', 'Невыносима')}. И, признаю, ${ru.gs(t, 'весьма хорош собой', 'весьма хороша собой')}.`
      ),
    (c, t) => bi(`${t.short} is… good company. That is all I will say.`, `С ${ru.c(t, 'i')}… приятно поговорить. Больше я ничего не скажу.`)
  ]
};
// the face that goes with it, if the feeling shows in the face as well as in the words (as readily as a warm word from a
// friend, a cold one from someone against you, or a flirtatious look: RULES.manner)
const FEEL_FACE = { like: ['warm', 'smile'], dislike: ['cold', 'neutral'], flirt: ['coy', 'thoughtful'] };
const feelShows = k => ({ like: RULES.manner.warm[1], dislike: RULES.manner.cold[0], flirt: RULES.manner.flirt })[k];
function feelRemark(c) {
  const pool = freeChars().filter(o => o.id !== c.id && !cultPair(c, o));
  const taken = pool.filter(o => flirtsWith(c.id, o.id)),
    strong = pool.filter(o => Math.abs(likes(c.id, o.id)) >= 2);
  const t = taken.length && chance(RULES.flirt.feel) ? pick(taken) : strong.length ? pick(strong) : null;
  if (!t) return null;
  const own = flirtsWith(c.id, t.id) ? 'flirt' : Ties.fond(c.id, t.id) ? 'like' : 'dislike',
    k = chance((1 - TP(c).gossipTrue) * RULES.talk.feelFalse) ? (own === 'dislike' ? 'like' : 'dislike') : own;
  addTest(c.id, t.id, 'feel', k);
  const face = chance(Math.min(RULES.scale.most, feelShows(k) * showMul(c)))
    ? k === 'flirt'
      ? flirtFace(c)
      : FEEL_FACE[k][0]
    : FEEL_FACE[k][1];
  return { text: pick(FEEL_SAY[k])(c, t), face };
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
  S.sights.push({ night: n, id: c.id, where: sw.where, to: sw.to, cat: sw.cat, val: sawVal(sw) });
  return `<p class="notice">${bi(`Before breakfast, ${c.short} takes you aside. “I did not want to say it in front of the others.`, `Ещё до завтрака ${ru.c(c)} отводит вас в сторону. «Не ${ru.gs(c, 'хотел', 'хотела')} говорить при остальных.`)} ${sightLine(cl, sw, c)}${bi('”', '»')}</p>`;
}
// ---------- your name in their mouths ----------
const GOSSIP_YOU = {
  bad: [
    ['The Doctor bullies people and calls it science.', 'Доктор запугивает людей и называет это наукой.'],
    ['The Doctor trusts no one, and wants us all to know it.', 'Доктор никому не доверяет — и хочет, чтобы мы все это знали.'],
    ['Mark my words: the Doctor will hang the wrong man.', 'Попомните моё слово: доктор отправит на виселицу не того.'],
    ['The Doctor reads those tablets all night, and talks back to them.', 'Доктор ночи напролёт читает эти таблички — и отвечает им.']
  ],
  good: [
    ['Of all of us, only the Doctor is doing anything sensible.', 'Из всех нас только доктор делает хоть что-то разумное.'],
    ['The Doctor listens. Out here, that is rarer than water.', 'Доктор умеет слушать. Здесь это встретишь реже, чем воду.'],
    ['If anyone gets us out of this, it will be the Doctor.', 'Если кто нас отсюда и вытащит, так это доктор.']
  ]
};
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
// people talk about you, the more readily the stronger they feel about you, for you or against you as they feel (or,
// now and then, the other way: flip; the indifferent either way), and their friends listen (at most RULES.camp.cap of
// them, as at any public moment; bad talk a little more readily than good, and any talk more readily when it is heavy);
// a calculating cultist talks you down on purpose, whatever face it shows you
function gossipAboutYou() {
  const sly = c => c.role === 'cult' && temperOf(c) === 'calculating',
    U = RULES.rumours;
  const pool = freeChars();
  if (!pool.length) return '';
  const heavy = weighty('talk');
  stirred('talk');
  const w = {};
  pool.forEach(c => {
    w[c.id] = Math.abs(c.rapport) + U.talkBase;
  });
  const s = C(wpick(w)),
    // (the sly one's warm face does not quite cover it: slyWarm, a little readier than a friend's turn, flip)
    bad = Ties.against(s) ? !chance(U.flip) : Ties.cordial(s) ? chance(sly(s) ? U.slyWarm : U.flip) : sly(s) ? chance(U.slyBad) : coin(),
    line = pick(GOSSIP_YOU[bad ? 'bad' : 'good']),
    moved = [];
  freeChars()
    .filter(o => o.id !== s.id && Ties.fond(o.id, s.id))
    .forEach(o => {
      const p = (bad ? RULES.rumours.listenBad : RULES.rumours.listenGood) * (heavy ? RULES.camp.heavy : 1);
      if (moved.length < RULES.camp.cap && chance(Math.min(RULES.scale.most, p)) && nudge(o, bad ? -1 : 1)) moved.push(o.id);
    });
  S.rumors.push({ day: S.day, kind: bad ? 'bad' : 'good', by: s.id, up: bad ? [] : moved, down: bad ? moved : [] });
  return (
    `<p class="notice">${bi(`Over breakfast you catch ${s.short} talking about you: “${line[0]}”`, `За завтраком вы слышите, как ${ru.c(s)} говорит о вас: «${line[1]}»`)}</p>` +
    (bad ? trustNote([], moved) : trustNote(moved, []))
  );
}
// what you do to one person, their friends and enemies have heard by morning (the same deed to the same person, once)
function ripple(c, kind, strength = 1) {
  if (S.pending && !S.pending.some(r => r.kind === kind && r.about === c.id)) S.pending.push({ day: S.day, kind, about: c.id, strength });
}
const DEED_SAID = {
  pressed: c => [`that you pressed ${c.short} hard`, `что вы крепко надавили на ${ru.c(c, 'a')}`],
  confided: c => [`that you have taken ${c.short} into your confidence`, `что вы доверились ${ru.c(c, 'd')}`],
  visited: c => [`that ${c.short} spent the night in your tent`, `что ${ru.c(c)} провела ночь в вашей палатке`],
  diedInTent: c => [`that ${c.short} died in your tent`, `что ${ru.c(c)} умерла в вашей палатке`],
  turnedAway: c => [`that you would not let ${c.short} into your tent`, `что вы не пустили ${ru.c(c, 'a')} к себе в палатку`]
};
// how a deed done to someone moves each of the camp who hears of it (o: the one hearing; l: their liking for c; k: how
// hard it is talked of)
function deedMoves(kind, o, c, l, k = 1) {
  const U = RULES.rumours;
  // a death in your tent: her friends, and now and then anyone, think the less of you for it, the harder it is talked of
  if (kind === 'diedInTent') return chance(Math.min(RULES.scale.most, k * (Math.max(0, l) * U.visitFriend + U.diedAny))) ? -1 : 0;
  if (kind === 'pressed') return l >= 1 && chance(U.pressFriend * l) ? -1 : l <= -1 && chance(U.pressFoe) ? 1 : 0;
  if (kind === 'confided') return l >= 1 && chance(U.confideFriend * l) ? 1 : 0;
  // a night in your tent: a friend of hers takes it well or badly, as it falls; one taken with her, badly (rival); a
  // woman turned away: her friends think the less of you for it
  if (kind === 'visited') return flirtsWith(o.id, c.id) && chance(U.rival) ? -1 : l >= 1 && chance(U.visitFriend * l) ? pick([-1, 1]) : 0;
  return l >= 1 && chance(U.visitFriend * l) ? -1 : 0;
}
function rumorsOfYou() {
  if (!S.pending || !S.pending.length) return '';
  const net = {},
    said = [];
  S.pending.slice(0, RULES.rumours.told).forEach(r => {
    const c = C(r.about),
      up = [],
      down = [];
    freeChars()
      .filter(o => o.id !== c.id)
      .forEach(o => {
        const d = deedMoves(r.kind, o, c, likes(o.id, c.id), r.strength || 1);
        if (d && nudge(o, d)) {
          (d > 0 ? up : down).push(o.id);
          net[o.id] = (net[o.id] || 0) + d;
        }
      });
    if (!up.length && !down.length) return;
    S.rumors.push({ day: S.day, kind: r.kind, about: r.about, up, down });
    said.push(DEED_SAID[r.kind](c));
  });
  S.pending = [];
  const ids = Object.keys(net);
  if (!said.length) return '';
  stirred('talk', TENOR.stirs.rumour);
  return (
    `<p class="notice">${bi(`Word has got round the camp ${listNames(said.map(x => x[0]))}.`, `По лагерю разошлось, ${ru.list(said.map(x => x[1]))}.`)}</p>` +
    trustNote(
      ids.filter(id => net[id] > 0),
      ids.filter(id => net[id] < 0)
    )
  );
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
  who.forEach(c => {
    S.mourning[c.id] = { day: S.day, victim };
  });
  const last = S.stirs[S.stirs.length - 1],
    m = who.length ? C(wpick(Object.fromEntries(who.map(c => [c.id, likes(c.id, victim) ** 2])))) : null;
  if (!m || (last && last.kind === 'grief' && last.by === m.id)) return '';
  const v = C(victim);
  return `<p class="notice">${bi(...tellOne('hardest', SAY.hardest)(m, v))}</p>`;
}
// Sitting with someone who mourns the night's dead, the day it happened: it may comfort them, and they will not forget
// it.
function consoled(c) {
  const m = S.mourning && S.mourning[c.id];
  if (!m || m.day !== S.day || m.done || !chance(RULES.talk.comfort)) return null;
  m.done = true;
  trustUp(c);
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
    stir('grief', { about: victim }) +
    mourners(victim) +
    (suspectedBy(victim).length >= 2 && chance(RULES.morning.withhold) ? '' : settleSaid(victim, false)) +
    ontoSaid(victim)
  );
}
// The dead had named someone guilty before everyone (the last they named, if more than one, and still here), and now
// they are dead: someone says so aloud (camp.onto), whoever draws the line first. It may be what the cult killed them
// for, and it may be what it wanted the camp to think (game/night.js, chooseVictim): the line is the same either way.
function ontoSaid(victim) {
  const named = S.said.filter(x => x.by === victim && x.verdict === 'cult' && x.how !== 'vote' && isFree(C(x.about)));
  return named.length && chance(RULES.camp.onto.odds) ? stir('onto', { about: named.pop().about, dead: victim }) : '';
}
// The rest of breakfast: each one of the morning's extras, crowded out by those that came before it (game/tenor.js,
// room). victim: whoever the night took, if anyone.
function socialMorning(victim) {
  let h = chance(Math.min(1, room('talk') * visitTalk() * deedTalk())) ? brought(rumorsOfYou()) : ''; // (the more after a night visit, or the deed)
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
const breakfastTalk = k => (k === 'you' ? gossipAboutYou() : k === 'gossip' ? breakfastGossip() : breakfastBlame());
