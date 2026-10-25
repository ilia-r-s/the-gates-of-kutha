// ===================== THE CAMP: suspicion, and moments that move many at once =====================
// Everyone keeps their own count of whom they suspect, from 0 to 3, apart from whom they like. Some things happen
// before the whole camp: an accusation at an inquiry, a dream told at breakfast, a watch slept through, a death. Each of
// these is a public moment, and every onlooker reacts on their own, or not at all: so one moment may move nobody, one
// person, or several at once (at most RULES.camp.cap each way), in their trust in you or in their suspicion of each
// other. What is said against someone before everyone is remembered (S.said); when the truth comes out, those who said it
// are believed again, or are not (S.credit), and those who had suspected them think again.

function campInit() {
  S.sus = {};
  S.order.forEach(a => {
    S.sus[a] = {};
  });
  S.said = [];
  S.stirs = [];
  S.credit = {};
  S.confidedIn = [];
  S.confided = {};
  S.mourning = {};
}
const sus = (a, b) => (S.sus && S.sus[a] ? S.sus[a][b] || 0 : 0);
function suspect(a, b, d) {
  const v = Math.max(0, Math.min(RULES.scale.suspicion, sus(a, b) + d));
  if (v === sus(a, b)) return false;
  S.sus[a][b] = v;
  return true;
}
// who in the camp suspects someone in earnest
const suspectedBy = id =>
  freeChars()
    .filter(o => o.id !== id && sus(o.id, id) >= 2)
    .map(o => o.id);
// whose word the camp has seen proven before everyone (above 0), or proven wrong (below)
const credit = id => (S.credit && S.credit[id]) || 0;
// whom someone suspects most, of a pool: in earnest only, and a friend only on the strongest suspicion
function mostSuspected(c, pool) {
  const top = pool
    .filter(o => sus(c.id, o.id) >= (likes(c.id, o.id) >= 2 ? RULES.scale.suspicion : 2))
    .sort((a, b) => sus(c.id, b.id) - sus(c.id, a.id) || likes(c.id, a.id) - likes(c.id, b.id));
  return top[0] || null;
}
// said against someone, or for them, before the whole camp: remembered until the truth about them comes out
function sayPublic(by, about, verdict, how) {
  S.said.push({ day: S.day, by, about, verdict, how, settled: false });
}

// ---------- a public moment ----------
// kind names a row of STIRS (below) and of RULES.camp; o = { by, about, ... }. Every onlooker (everyone free, except
// whoever started it and whoever it is about; o.only: those of them it was told to, if it was told to some only) gets a
// roll for each reaction it may draw from them, as a rule one: trust in you up or down, suspicion of someone up or down,
// or liking for someone up or down (a heavy moment, one that comes seldom in the season's mood, moves each onlooker ×
// RULES.camp.heavy as readily). A reaction whose odds come to nothing or less stays possible, at the rarest
// (RULES.scale.rarest): nobody's reaction is ever sure. Returns the moment as the camp sees it, opening line and all (the
// opening knows who was moved; o.told: the opening has been told already, with others').
function stir(kind, o) {
  const K = STIRS[kind],
    pr = RULES.camp[kind],
    cap = RULES.camp.cap;
  const sp = K.speaker ? K.speaker(o, pr) : null;
  const look = shuffle(
    freeChars().filter(c => c.id !== o.about && c.id !== o.by && (!sp || c.id !== sp.id) && (!o.only || o.only.includes(c.id)))
  );
  const moved = []; // [what, whom, change, [ids], how far suspicion now goes (for suspicion)]
  if (sp && K.spoke) K.spoke(sp, o, pr);
  look.forEach(l => {
    const rs = K.react(l, o, pr); // [what, whom, change, chance], a list of them, or null
    (rs && Array.isArray(rs[0]) ? rs : [rs]).forEach(r => {
      if (!r || !chance(Math.min(RULES.scale.most, Math.max(RULES.scale.rarest, r[3]) * (o.heavy ? RULES.camp.heavy : 1)))) return;
      const [what, whom, d] = r,
        same = moved.filter(x => x[0] === what && x[1] === whom && x[2] === d);
      if (same.reduce((n, x) => n + x[3].length, 0) >= cap) return; // as many as the cap move the same way, and no more
      if (!(what === 'trust' ? nudge(l, d) : what === 'like' ? likeShift(l.id, whom, d) : suspect(l.id, whom, d))) return;
      const lvl = what === 'sus' ? sus(l.id, whom) : null,
        g = same.find(x => x[4] === lvl);
      if (g) g[3].push(l.id);
      else moved.push([what, whom, d, [l.id], lvl]);
    });
  });
  const after = K.after ? K.after(o, pr) : null; // something only the one it was about does
  const record = { day: S.day, kind, by: o.by || (sp && sp.id) || null, about: o.about || null, spoke: !!sp, moved };
  if (after) record.after = after;
  if (K.keep) Object.assign(record, K.keep(o)); // (what the casebook needs to tell it: ui/book.js, STIR_SAID)
  S.stirs.push(record);
  return (K.open && !o.told ? K.open(sp, o, record) : '') + stirNote(record, !!K.quiet || !sp);
}
// what the onlookers did, in a line each; when nobody moved, a moment someone spoke up in says so, the rest say nothing
function stirNote(r, quiet) {
  const lines = r.moved.map(([what, whom, d, ids, lvl]) => {
    if (what === 'trust') return d < 0 ? trustNote([], ids) : trustNote(ids, []);
    const [en, rus] = what === 'like' ? likeSay(ids, C(whom), d) : susSay(ids, C(whom), d, lvl);
    return `<p class="stir">${bi(`${nameList(ids)} ${en}`, `${nameListRu(ids)} ${rus}`)}</p>`;
  });
  if (r.after) lines.push(`<p class="stir">${r.after}</p>`);
  if (!lines.length && !quiet) lines.push(`<p class="stir">${bi('Nobody else takes it up.', 'Больше никто ничего не говорит.')}</p>`);
  return lines.join('');
}
// a change in suspicion, as far as it now goes (0 to 3; in earnest from 2): what the ids now make of w, after their
// names, as [English, Russian]
function susSay(ids, w, d, lvl) {
  const many = ids.length > 1,
    v = (one, more) => (many ? more : one),
    g = (m, f, pl) => (many ? pl : ru.gs(C(ids[0]), m, f));
  if (d > 0)
    return lvl >= RULES.scale.suspicion
      ? [`${v('is', 'are')} all but sure it is ${w.short} now`, `теперь почти ${g('уверен', 'уверена', 'уверены')}, что это ${ru.c(w)}`]
      : lvl >= 2
        ? [`${v('suspects', 'suspect')} ${w.short} now`, `теперь ${v('подозревает', 'подозревают')} ${ru.c(w, 'a')}`]
        : [`${v('begins', 'begin')} to wonder about ${w.short}`, `${v('начинает', 'начинают')} присматриваться к ${ru.c(w, 'd')}`];
  return lvl >= 2
    ? [`${v('is', 'are')} less sure it is ${w.short} now`, `уже не так ${g('уверен', 'уверена', 'уверены')}, что это ${ru.c(w)}`]
    : lvl === 1
      ? [
          `no longer ${v('suspects', 'suspect')} ${w.short} in earnest`,
          `больше не ${v('подозревает', 'подозревают')} ${ru.c(w, 'a')} всерьёз`
        ]
      : [
          `no longer ${v('suspects', 'suspect')} ${w.short} at all`,
          `больше ни в чём не ${v('подозревает', 'подозревают')} ${ru.c(w, 'a')}`
        ];
}
// a change in someone's liking for w, after their names, as [English, Russian]
function likeSay(ids, w, d) {
  const many = ids.length > 1;
  return d < 0
    ? [`${many ? 'think' : 'thinks'} the less of ${w.short} now`, `теперь хуже ${many ? 'думают' : 'думает'} ${ru.ob(w)}`]
    : [`${many ? 'think' : 'thinks'} the better of ${w.short} now`, `теперь лучше ${many ? 'думают' : 'думает'} ${ru.ob(w)}`];
}
// one reaction, one way or the other (down, the less: −1; up, the more: +1), as the reasons each way weigh against each
// other; with no reason either way, the way it would go of itself (d), at the rarest (stir)
function eitherWay(what, whom, down, up, d) {
  const t = Math.max(0, down) + Math.max(0, up);
  return [what, whom, t > 0 ? (chance(Math.max(0, down) / t) ? -1 : 1) : d, t];
}
const ofPair = (l, x) => likes(l.id, x); // how an onlooker feels about someone
const isSusp = l => temperOf(l) === 'suspicious';
// of those who might speak up for or about x, one, the fonder of x the likelier (for: the fond ones' weight, by liking)
const fondest = (pool, x) => (pool.length ? C(wpick(Object.fromEntries(pool.map(c => [c.id, ofPair(c, x) ** 2 || 0.5])))) : null);
// the one who spoke up moves a step in their trust in you, mostly (camp.spoke)
const spokeStep = (sp, d) => chance(RULES.camp.spoke) && nudge(sp, d);

// ---------- the moments: who speaks, and how each onlooker may take it ----------
const STIRS = {
  // you sent an innocent away: their friend calls you out, or someone honest or suspicious does; others may follow, or
  // stand by you if they had suspected the one sent away themselves
  calledOut: {
    speaker: (o, pr) => {
      const pool = freeChars().filter(c => c.id !== o.about),
        friend = fondest(
          pool.filter(c => ofPair(c, o.about) >= 1),
          o.about
        );
      const sp = friend || pick(pool.filter(c => temperOf(c) === 'honest' || isSusp(c)));
      return sp && chance(pr.odds) ? sp : null;
    },
    spoke: sp => spokeStep(sp, -1),
    react: (l, o, pr) =>
      sus(l.id, o.about) >= 2
        ? ['trust', null, 1, pr.defend]
        : [
            'trust',
            null,
            -1,
            pr.p +
              (ofPair(l, o.about) >= 1 ? pr.friend : 0) +
              (isSusp(l) ? pr.suspicious : 0) -
              (l.rapport >= 2 ? pr.loyal : 0) -
              (sus(l.id, o.about) === 1 ? pr.suspected : 0) -
              (o.thief ? pr.thief : 0)
          ],
    open: (sp, o) => {
      const a = C(o.about);
      if (!sp)
        return `<p class="notice">${bi(`As ${a.short} is led away, nobody says a word, which is worse.`, `Когда ${ru.c(a, 'a')} уводят, никто не произносит ни слова, и это хуже всего.`)}</p>`;
      const k = pick(o.thief ? [3] : [0, 1, 2]),
        line = [
          [`“You have ruined ${a.short} for nothing, Doctor.”`, `«Вы погубили ${ru.c(a, 'a')} ни за что, доктор».`],
          ['“Who is next, Doctor? Any of us, it seems.”', '«Кто следующий, доктор? Похоже, любой из нас».'],
          ['“I hope you sleep well tonight, Doctor.”', '«Надеюсь, вы сегодня хорошо выспитесь, доктор».'],
          [
            '“A thief, Doctor. You have caught a thief. Bravo.”',
            `«${ru.gs(a, 'Вора', 'Воровку')}, доктор. Вы поймали ${ru.gs(a, 'вора', 'воровку')}. Браво».`
          ]
        ][k];
      return `<p class="notice">${bi(`As ${a.short} is led away, ${sp.short} turns on you in front of everyone: ${line[0]}`, `Когда ${ru.c(a, 'a')} уводят, ${ru.c(sp)} при всех набрасывается на вас: ${line[1]}`)}</p>`;
    }
  },
  // you exposed a cultist: someone who had suspected them says so (or one of the cult, to be seen on the right side);
  // those who doubted them warm to you, and a friend of the exposed may not forgive you for being right, unless they
  // raised a hand with you against them themselves (o.backed: game/inquiry.js)
  praised: {
    speaker: (o, pr) => {
      const pool = freeChars().filter(c => c.id !== o.about);
      const sp =
        pick(pool.filter(c => sus(c.id, o.about) >= 1 || ofPair(c, o.about) <= -1)) ||
        pick(pool.filter(c => c.rapport >= 1 && ofPair(c, o.about) < 1));
      return sp && chance(pr.odds) ? sp : null;
    },
    spoke: sp => spokeStep(sp, 1),
    react: (l, o, pr) =>
      ofPair(l, o.about) >= 1
        ? (o.backed || []).includes(l.id)
          ? null
          : ['trust', null, -1, pr.grudge]
        : ['trust', null, 1, pr.p + (sus(l.id, o.about) >= 1 || ofPair(l, o.about) <= -1 ? pr.doubted : 0)],
    open: (sp, o) => {
      const a = C(o.about);
      if (!sp)
        return `<p class="notice">${bi('When the lorry has gone, the camp goes back to its supper without a word.', 'Когда грузовик уезжает, лагерь молча возвращается к ужину.')}</p>`;
      const k = pick([0, 1]),
        line = [
          [
            `“You were right about ${a.short}, Doctor. God help us, you were right.”`,
            `«Вы были правы насчёт ${ru.c(a, 'g')}, доктор. Помоги нам Бог, вы были правы».`
          ],
          [
            '“Well done, Doctor. I did not think you had it in you.”',
            `«Отлично, доктор. Не ${ru.gs(sp, 'думал', 'думала')}, что вы на такое способны».`
          ]
        ][k];
      return `<p class="notice">${bi(`When the lorry has gone, ${sp.short} says, for everyone to hear: ${line[0]}`, `Когда грузовик уезжает, ${ru.c(sp)} говорит во всеуслышание: ${line[1]}`)}</p>`;
    }
  },
  // the night took someone: their friend grieves aloud (a friend in the cult too, whatever it feels), and the camp
  // wonders what you are doing about it
  grief: {
    speaker: (o, pr) => {
      const friend = fondest(
        freeChars().filter(c => ofPair(c, o.about) >= 1),
        o.about
      );
      return friend && chance(pr.odds) ? friend : null;
    },
    // a mourner blames you for it, the less likely the more they trust you; or turns to you to put it right
    spoke: (sp, o, pr) => {
      o.bitter = chance(clamp(pr.bitter - pr.trusting * sp.rapport));
      if (o.bitter) nudge(sp, -1);
    },
    react: (l, o, pr) => [
      'trust',
      null,
      -1,
      pr.p +
        (ofPair(l, o.about) >= 1 ? pr.friend : 0) +
        pr.late * (S.day - 1) +
        (S.confidedIn && S.confidedIn.includes(o.about) ? pr.confided : 0) -
        (S.stats.right ? pr.progress : 0) -
        (l.rapport >= 2 ? pr.loyal : 0)
    ],
    quiet: true,
    // nobody grieving aloud: then only if the camp's mood moved, a word to say why
    open: (sp, o, r) => {
      const v = C(o.about);
      if (!sp)
        return r.moved.length
          ? `<p class="notice">${bi(`The camp mourns ${v.short}, and some of it looks at you.`, `Лагерь оплакивает ${ru.c(v, 'a')}, и кое-кто смотрит на вас.`)}</p>`
          : '';
      const k = pick([0, 1]),
        line = (
          o.bitter
            ? [
                [
                  `“${v.short} is dead, and the Doctor is still asking questions.”`,
                  `«${ru.c(v)} ${ru.gs(v, 'мёртв', 'мертва')}, а доктор всё задаёт вопросы».`
                ],
                ['“How many more of us, Doctor?”', '«Скольких ещё из нас, доктор?»']
              ]
            : [
                ['“Find whoever did this, Doctor. Whatever it takes.”', '«Найдите того, кто это сделал, доктор. Чего бы это ни стоило».'],
                ['“Not one more of us, Doctor. Promise me that.”', '«Больше ни одного из нас, доктор. Пообещайте мне».']
              ]
        )[k];
      return `<p class="notice">${bi(`${sp.short} has not touched breakfast. ${line[0]}`, `${ru.c(sp)} не ${ru.gs(sp, 'притронулся', 'притронулась')} к завтраку. ${line[1]}`)}</p>`;
    }
  },
  // someone swore to watch your tent and slept: the camp hears of it, and wonders why
  sleptWatch: {
    react: (l, o, pr) => [
      'sus',
      o.about,
      1,
      pr.p + (ofPair(l, o.about) <= -1 ? pr.dislike : 0) - (ofPair(l, o.about) >= 1 ? pr.friend : 0) + (isSusp(l) ? pr.suspicious : 0)
    ],
    quiet: true,
    open: (sp, o) => {
      const a = C(o.about);
      return `<p class="notice">${
        o.how === 'deny'
          ? bi(
              `By breakfast the whole camp knows that ${a.short} swore to watch your tent, and that something came past all the same.`,
              `К завтраку весь лагерь знает, что ${ru.c(a)} ${ru.gs(a, 'клялся', 'клялась')} стеречь вашу палатку — и что кто-то всё равно прошёл.`
            )
          : bi(
              `By breakfast the whole camp knows that ${a.short} swore to watch your tent, and slept.`,
              `К завтраку весь лагерь знает, что ${ru.c(a)} ${ru.gs(a, 'клялся', 'клялась')} стеречь вашу палатку — и ${ru.gs(a, 'проспал', 'проспала')}.`
            )
      }</p>`;
    }
  },
  // a dream told aloud that names someone guilty: some believe it and suspect the one named; the friends of the one
  // named, and those who already doubt the dreamer, suspect the dreamer instead, and so does anyone not fond of the
  // dreamer when the dream only answers one that named them (the more if it is their first dream aloud: answer); the one
  // named may never forgive it
  dreamt: {
    react: (l, o, pr) => {
      if (ofPair(l, o.about) >= 1 || sus(l.id, o.by) >= 2 || (o.answer && ofPair(l, o.by) < 1))
        return [
          'sus',
          o.by,
          1,
          pr.back +
            (ofPair(l, o.about) >= 1 ? pr.friend : 0) +
            (isSusp(l) ? pr.suspicious : 0) +
            (o.answer ? pr.answer[o.answer.first ? 0 : 1] : 0)
        ];
      return [
        'sus',
        o.about,
        1,
        pr.p +
          (ofPair(l, o.by) >= 1 ? pr.believe : 0) +
          pr.credit * credit(o.by) +
          (ofPair(l, o.about) <= -1 ? pr.dislike : 0) -
          (sus(l.id, o.by) === 1 ? pr.doubt : 0)
      ];
    },
    after: (o, pr) => resent(o.about, o.by, pr.resent),
    quiet: true
  },
  // a dream told aloud that clears someone: those who suspected them may think again, if they believe the dreamer
  dreamtClean: {
    react: (l, o, pr) =>
      sus(l.id, o.about) >= 1 ? ['sus', o.about, -1, pr.p + (ofPair(l, o.by) >= 1 ? pr.believe : 0) + pr.credit * credit(o.by)] : null,
    quiet: true
  },
  // someone says out loud that they do not trust another: much as a dream, though fewer believe it
  blame: {
    react: (l, o, pr) => {
      if (ofPair(l, o.about) >= 1) return ['sus', o.by, 1, pr.back];
      return [
        'sus',
        o.about,
        1,
        pr.p + (ofPair(l, o.about) <= -1 ? pr.dislike : 0) + (ofPair(l, o.by) >= 1 ? pr.believe : 0) + pr.credit * credit(o.by)
      ];
    },
    after: (o, pr) => resent(o.about, o.by, pr.resent),
    quiet: true
  },
  // the diggers sing of someone: those who are not fond of them may eye them the more for it
  song: {
    react: (l, o, pr) =>
      ofPair(l, o.about) >= 1
        ? ['sus', o.about, 1, 0] // (a friend, hardly ever)
        : ['sus', o.about, 1, pr.p + (ofPair(l, o.about) <= -1 ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
    quiet: true
  },
  // someone comes clean before everyone: a friend thinks the better of them for it, others see a liar
  confessed: {
    react: (l, o, pr) =>
      ofPair(l, o.about) >= 1
        ? sus(l.id, o.about) >= 1
          ? ['sus', o.about, -1, pr.respect]
          : null
        : ['sus', o.about, 1, pr.liar + (isSusp(l) ? pr.suspicious : 0)],
    quiet: true
  },
  // the dead had named someone guilty before everyone, and now they are dead (people/social.js, ontoSaid): someone says
  // so aloud, whoever suspects the one named the more likely; those not fond of the one named may suspect them the more
  // for it, and their friends suspect the speaker
  onto: {
    speaker: (o, pr) => {
      const pool = freeChars().filter(c => c.id !== o.about);
      return pool.length ? C(wpick(Object.fromEntries(pool.map(c => [c.id, 1 + sus(c.id, o.about)])))) : null;
    },
    spoke: (sp, o) => {
      o.by = sp.id;
      addTest(sp.id, o.about, 'distrust', 'cult'); // (blame aloud, as any: people/social.js, blameAloud)
      sayPublic(sp.id, o.about, 'cult', 'blame');
    },
    react: (l, o, pr) =>
      !o.by
        ? null
        : ofPair(l, o.about) >= 1
          ? ['sus', o.by, 1, pr.back]
          : ['sus', o.about, 1, pr.p + (ofPair(l, o.about) <= -1 ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
    after: o => (o.by ? resent(o.about, o.by, RULES.camp.blame.resent) : null),
    open: (sp, o) => {
      if (!sp) return '';
      const a = C(o.about),
        d = C(o.dead);
      return `<p class="notice">${bi(
        `${sp.short} says what half the camp is thinking. “${d.short} named ${a.short} before all of us. And now ${d.short} is dead.”`,
        `${ru.c(sp)} говорит вслух то, о чём думает пол-лагеря. «${ru.c(d)} при всех ${ru.gs(d, 'назвал', 'назвала')} ${ru.c(a, 'a')}. И вот ${ru.c(d)} ${ru.gs(d, 'мёртв', 'мертва')}».`
      )}</p>`;
    },
    quiet: true
  },
  // a trace found by the tent of one who was attacked in the night (game/deed.js: one you laid there): those not fond
  // of the one whose habit it is may suspect them for it
  planted: {
    react: (l, o, pr) =>
      ofPair(l, o.about) >= 1
        ? null
        : ['sus', o.about, 1, pr.p + (ofPair(l, o.about) <= -1 ? pr.dislike : 0) + (isSusp(l) ? pr.suspicious : 0)],
    open: (sp, o) => {
      const a = C(o.at);
      return `<p class="notice">${bi(
        `By ${a.short}’s tent the camp finds ${TRAITS[o.cat].vals[C(o.about).traits[o.cat]].clue}, and looks at ${C(o.about).short}.`,
        `У палатки ${ru.c(a, 'g')} лагерь находит ${R(TRAITS[o.cat].vals[C(o.about).traits[o.cat]].clue)} — и смотрит на ${ru.c(C(o.about), 'a')}.`
      )}</p>`;
    },
    quiet: true
  },
  // someone who swore to watch your tent says, the morning after, that they saw someone off (game/night.js, keptSaid):
  // whoever doubted them may think again
  kept: {
    react: (l, o, pr) => (sus(l.id, o.about) >= 1 ? ['sus', o.about, -1, pr.p] : null),
    quiet: true
  },
  // the truth bore out what someone had said before everyone (or the camp takes it so: the night's dead it takes for
  // innocent): whoever doubted them may think again
  proven: {
    react: (l, o, pr) => (sus(l.id, o.by) >= 1 ? ['sus', o.by, -1, pr.clear] : null),
    open: (sp, o) => {
      const b = C(o.by),
        a = C(o.about);
      const so =
        a.status === 'taken'
          ? [
              `The camp takes ${a.short}’s death for proof that ${b.short} was right.`,
              `Лагерь видит в смерти ${ru.c(a, 'g')} доказательство того, что ${ru.c(b)} ${ru.gs(b, 'был прав', 'была права')}.`
            ]
          : [`${b.short} was right.`, `И ${ru.c(b)} ${ru.gs(b, 'был прав', 'была права')}.`];
      return o.verdict === 'cult'
        ? `<p class="notice">${bi(`${b.short} said it before everyone on day ${o.day}: ${a.short} was one of them. ${so[0]}`, `В день ${o.day} ${ru.c(b)} ${ru.gs(b, 'сказал', 'сказала')} это при всех: ${ru.c(a)} — ${ru.gs(a, 'один', 'одна')} из них. ${so[1]}`)}</p>`
        : `<p class="notice">${bi(`${b.short} said before everyone on day ${o.day} that ${a.short} was not one of them. ${so[0]}`, `В день ${o.day} ${ru.c(b)} при всех ${ru.gs(b, 'сказал', 'сказала')}, что ${ru.c(a)} не из них. ${so[1]}`)}</p>`;
    },
    quiet: true
  },
  // the night a woman spent in your tent, told as gossip, badly or kindly (people/social.js, visitGossip): before
  // everyone at breakfast (o.before), or to one of the camp (o.only). Each who hears it makes up their mind once
  // (S.log.visit.heard), about her and about you, by their temperament, a priest's vows, how they feel about her, the
  // speaker and you, jealousy, and what has passed between them and her (RULES.camp.scandal). Told before her, she holds
  // it against one who told it badly, or warms to one who told it kindly; and it shows in her face that day.
  scandal: {
    react: (l, o, pr) => {
      const v = S.log.visit,
        heard = (v.heard = v.heard || []);
      if (heard.includes(l.id)) return null;
      heard.push(l.id);
      const h = o.about,
        lh = ofPair(l, h),
        ls = ofPair(l, o.by),
        hi = pastBetween(l.id, h),
        prude = TP(l).prude + (VOWS.includes(l.id) ? pr.vows : 0),
        easy = pr.easy * Math.max(0, -prude),
        believe = pr.believe * ls + pr.credit * credit(o.by),
        past = pr.quarrel * hi.quarrels + pr.suspect * hi.suspects + (hi.accused || hi.accusedBy ? pr.named : 0) - pr.feast * hi.feasts,
        jealous = flirtsWithYou(l) || flirtsWith(l.id, h) ? pr.jealous : 0;
      const her = o.bad
          ? eitherWay(
              'like',
              h,
              pr.cool + believe + prude + past + pr.dislike * Math.max(0, -lh) - pr.friend * Math.max(0, lh),
              pr.rally * Math.max(0, lh) + pr.spurn * Math.max(0, -ls) + easy,
              -1
            )
          : eitherWay(
              'like',
              h,
              pr.coolKind + prude + past + pr.dislike * Math.max(0, -lh),
              pr.warm + believe + pr.friend * Math.max(0, lh) + easy,
              1
            ),
        you = eitherWay(
          'trust',
          null,
          (o.bad ? pr.youCool + believe : pr.youCoolKind) + prude + jealous - pr.loyal * Math.max(0, l.rapport - 1),
          pr.youWarm + easy + (o.bad ? pr.spurn * Math.max(0, -ls) : pr.glad * Math.max(0, lh)),
          o.bad ? -1 : 1
        );
      return [her, you];
    },
    after: (o, pr) => {
      if (!o.before) return null;
      const h = C(o.about),
        s = C(o.by);
      if (!isFree(h) || !isFree(s)) return null;
      if (!o.bad)
        return chance(pr.thanks) && likeShift(h.id, s.id, 1)
          ? bi(`${h.short} gives ${s.short} a grateful look`, `${ru.c(h)} с благодарностью смотрит на ${ru.c(s, 'a')}`)
          : null;
      S.log.visit.shamed = S.day; // (and it shows in her face today: people/manner.js, shamed)
      return chance(pr.hurt) && likeShift(h.id, s.id, -1)
        ? bi(`${h.short} will not look at ${s.short}`, `${ru.c(h)} не смотрит на ${ru.c(s, 'a')}`)
        : null;
    },
    keep: o => ({ bad: !!o.bad, to: o.only ? o.only[0] : null }),
    quiet: true
  },
  // the truth gave the lie to what someone had said before everyone (or the camp takes it so): the friends of the one
  // wronged suspect them now
  disproven: {
    react: (l, o, pr) => ['sus', o.by, 1, pr.p + (ofPair(l, o.about) >= 1 && o.verdict === 'cult' ? pr.friend : 0)],
    open: (sp, o) => {
      const b = C(o.by),
        a = C(o.about);
      if (o.verdict !== 'cult')
        return `<p class="notice">${bi(`On day ${o.day} ${b.short} had sworn before everyone that ${a.short} was not one of them.`, `В день ${o.day} ${ru.c(b)} при всех ${ru.gs(b, 'клялся', 'клялась')}, что ${ru.c(a)} не из них.`)}</p>`;
      return a.status === 'taken'
        ? `<p class="notice">${bi(`${a.short} is dead, and on day ${o.day} ${b.short} had called ${EP.him(a)} one of them, before everyone.`, `${ru.c(a)} ${ru.gs(a, 'мёртв', 'мертва')}, а ведь в день ${o.day} ${ru.c(b)} при всех ${ru.gs(b, 'назвал', 'назвала')} ${ru.gs(a, 'его', 'её')} ${ru.gs(a, 'одним', 'одной')} из них.`)}</p>`
        : `<p class="notice">${bi(`On day ${o.day} ${b.short} had called ${a.short} one of them, before everyone. ${a.short} was nothing of the kind.`, `В день ${o.day} ${ru.c(b)} при всех ${ru.gs(b, 'назвал', 'назвала')} ${ru.c(a, 'a')} ${ru.gs(a, 'одним', 'одной')} из них. Ничего подобного.`)}</p>`;
    },
    quiet: true
  }
};
// hands raised at an inquiry (game/verdict.js) the same way on the same day (ids), for sending someone away or
// against it, borne out or not (for the night's dead, as the camp takes it)
function voteProven(ids, a, o, right) {
  const b = C(ids[0]),
    many = ids.length > 1,
    n = nameList(ids),
    nr = nameListRu(ids),
    when = o.day === S.day ? '' : ` on day ${o.day}`,
    whenRu = o.day === S.day ? '' : ` в день ${o.day}`;
  const did =
    o.verdict === 'cult'
      ? [
          `${n} raised ${many ? 'their hands' : 'a hand'} against ${a.short}${when}.`,
          `${nr} ${many ? 'подняли' : ru.gs(b, 'поднял', 'подняла')} руку против ${ru.c(a, 'g')}${whenRu}.`
        ]
      : [
          `${n} spoke up for ${a.short}${when}.`,
          `${nr} ${many ? 'вступились' : ru.gs(b, 'вступился', 'вступилась')} за ${ru.c(a, 'a')}${whenRu}.`
        ];
  const they = many ? ['they were right', 'они были правы'] : [`${b.short} was right`, `${ru.c(b)} ${ru.gs(b, 'был прав', 'была права')}`];
  const then =
    a.status === 'taken'
      ? right
        ? [
            `The camp takes ${a.short}’s death for proof that ${they[0]}.`,
            `Лагерь видит в смерти ${ru.c(a, 'g')} доказательство того, что ${they[1]}.`
          ]
        : [`Now ${a.short} is dead.`, `А теперь ${ru.c(a)} ${ru.gs(a, 'мёртв', 'мертва')}.`]
      : right
        ? [`${capS(they[0])}.`, `И ${they[1]}.`]
        : o.verdict === 'cult'
          ? a.role === 'smuggler'
            ? [`${a.short} was no cultist.`, `А ${ru.c(a)} ${ru.gs(a, 'не был сектантом', 'не была сектанткой')}.`]
            : [`${a.short} was innocent.`, `А ${ru.c(a)} ни в чём не ${ru.gs(a, 'был виноват', 'была виновата')}.`]
          : [`${a.short} was one of them.`, `А ${ru.c(a)} ${ru.gs(a, 'был одним', 'была одной')} из них.`];
  return `<p class="notice">${bi(`${did[0]} ${then[0]}`, `${did[1]} ${then[1]}`)}</p>`;
}
// the one accused before everyone may hold it against whoever accused them, and suspect them back
function resent(who, of, p) {
  const c = C(who),
    by = C(of);
  if (!isFree(c) || !chance(p)) return null;
  suspect(c.id, by.id, 1);
  likeShift(c.id, by.id, -1);
  return bi(`${c.short} will not look at ${by.short}`, `${ru.c(c)} не смотрит на ${ru.c(by, 'a')}`);
}
// The truth about someone is out, as the camp sees it (exposed as a cultist, or proven innocent: sent away after an
// inquiry, or taken by the night). Whatever was said of them before everyone is settled now: each speaker is proven
// right or wrong, once, on the last thing they said, and the camp takes up each one still here, those proven wrong
// first (hands raised the same way the same day are told together). guilty: what the camp now holds them to have
// been; the night's dead it takes for innocent, and is fooled when one of the cult killed another (people/cunning.js).
function settleSaid(id, guilty = C(id).role === 'cult') {
  const a = C(id),
    last = new Map();
  S.said
    .filter(x => x.about === id && !x.settled)
    .forEach(x => {
      x.settled = true;
      last.set(x.by, x);
    });
  const all = [...last.values()].map(x => ({ x, right: (x.verdict === 'cult') === guilty }));
  all.forEach(({ x, right }) => {
    S.credit[x.by] = credit(x.by) + (right ? 1 : -1);
  });
  const hands = x => x.how === 'vote',
    here = all.filter(({ x }) => isFree(C(x.by))).sort((p, q) => p.right - q.right || hands(q.x) - hands(p.x) || p.x.day - q.x.day);
  const told = new Set();
  let h = '';
  here.forEach(({ x, right }) => {
    const k = `${x.verdict}:${x.day}`;
    if (hands(x) && !told.has(k)) {
      told.add(k);
      h += voteProven(
        here.filter(y => hands(y.x) && `${y.x.verdict}:${y.x.day}` === k).map(y => y.x.by),
        a,
        x,
        right
      );
    }
    h += stir(right ? 'proven' : 'disproven', { by: x.by, about: id, verdict: x.verdict, day: x.day, how: x.how, told: hands(x) });
  });
  return h;
}
// a dream told before everyone at breakfast: remembered, and taken up by the camp
// answer: a dream told to answer one that named the dreamer ({ first: their first dream aloud }), which the camp
// distrusts (STIRS.dreamt)
function dreamAloud(by, about, guilty, answer = null) {
  sayPublic(by, about, guilty ? 'cult' : 'clean', 'dream');
  return stir(guilty ? 'dreamt' : 'dreamtClean', { by, about, answer });
}
