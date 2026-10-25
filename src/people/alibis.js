// ===================== THE NIGHTS: who was where, who claims what, who saw what =====================
// Planned the moment each attack happens; told to you when you ask. target: whoever the night came for; if they are
// still here (the Watcher drove the attacker off), they were where it happened, and say so. On a night the cult came for
// no one (crimeLoc null), everyone was somewhere all the same, and only the thief was worth seeing.
// Nobody's night is simple. Friends spend the evening together; two who are sweet on each other may slip out somewhere
// quiet and swear they were asleep; someone out alone may, by ill luck, have been where it happened, and be glimpsed
// there, or leave a trace there earlier in the evening (game/night.js), and then lie about it out of fear, perhaps
// naming a friend who does not bear it out, unless the friend covers for them (a cultist named so is glad of an alibi).
// The cult's evenings are dealt like anyone's, and told the same way: the one of it who did the night's work went out
// to it later, and its account of the evening is its cover, borne out by whoever it spent the evening with as often as
// anyone's is; now and then it owns being out near the place, as anyone there by ill luck might. Witnesses glimpse
// whoever was about; the light-headed misremember; and anyone sure of someone, or who cannot bear them, may say they saw
// them, as the cult says it of the innocent.
const QUIET = ['canal', 'cemetery', 'ziggurat', 'trench']; // where two go to be alone
function planAlibis(n, crimeLoc, actorId, target = null, how = 'watch') {
  // (afraid: those who lied out of fear; secret: lovers who kept quiet; for the ending's account of the season)
  const rec = { crimeLoc, actor: actorId, truth: {}, claim: {}, saw: {}, afraid: [], secret: [] };
  const gid = guestOn(n),
    guest = gid ? C(gid) : null, // (who spent the night in your tent: below)
    npcs = freeChars().filter(c => c !== guest),
    saved = npcs.find(c => c.id === target) || null,
    rest = npcs.filter(c => c !== saved),
    cult = rest.filter(c => c.role === 'cult'),
    smug = rest.find(c => c.role === 'smuggler'),
    inno = rest.filter(c => c.role !== 'cult' && c.role !== 'smuggler'),
    // whoever might spend the evening anywhere, alone or with a friend: everyone but the thief, out on his own business,
    // and the Watcher, who keeps the camp; the cult among them, the one of it who did the night's work too (its evening
    // is what it tells; the work came after)
    loose = rest.filter(c => c.role !== 'warden' && c.role !== 'smuggler'),
    crime = !!crimeLoc,
    out = crime && crimeLoc !== 'camp', // (the night they came for you, it happened in camp)
    // where it happened, in camp: your tent, as a rule; her own tent, the night they came for one who slept in yours
    toward = crimeLoc === 'camp' ? (how === 'away' && target && target !== 'player' ? target : 'player') : null,
    A = RULES.alibis;
  // the one who was attacked and lived says so (how: the Watcher, or luck), and now and then glimpsed one of the
  // attacker's habits (glimpse), unless they slept through it
  const attacked = (c, you = false) => {
    rec.truth[c.id] = rec.claim[c.id] = { loc: crimeLoc, with: null, attacked: true, how, ...(you ? { you } : {}) };
    if (actorId && !(you && how === 'watch') && chance(A.glimpse))
      rec.saw[c.id] = { who: actorId, cat: pick(CATS), where: crimeLoc, to: toward };
  };
  if (saved) attacked(saved);
  // the one who spent the night in your tent (people/visit.js) was there with you, by her own account, whoever she is;
  // in truth too, unless she was the one out doing the night's work, or they came for her in your tent and she lived
  // (if they found her own tent empty, nobody came near her). Now and then she will not say, as anyone may.
  if (guest) {
    if (guest.id === target && how !== 'away') attacked(guest, true);
    else {
      rec.truth[guest.id] = { loc: guest.id === actorId ? crimeLoc : 'camp', with: null };
      rec.claim[guest.id] = chance(A.evadeNight) ? { loc: 'evade', with: null } : { loc: 'camp', with: null, you: true };
    }
  }
  if (smug) rec.truth[smug.id] = { loc: chance(A.smugglerIn) ? 'camp' : chance(A.smugglerStore) ? 'store' : 'canal', with: null };
  rest
    .filter(c => c.role !== 'smuggler')
    .forEach(c => {
      rec.truth[c.id] = { loc: c.role === 'warden' ? 'camp' : wpick(A.where), with: null };
    });
  // where nobody was out together that night: where it happened (whoever does the night's work picks a place nobody is
  // keeping company in)
  const elsewhere = Object.fromEntries(Object.entries(A.where).filter(([k]) => !out || k !== crimeLoc));
  // two who are sweet on each other, out together somewhere quiet; mostly they keep it to themselves (not the one doing
  // the night's work, who had other business)
  const lovers = trystOf(loose.filter(c => c.id !== actorId));
  if (lovers && chance(A.tryst)) {
    const L = pick(QUIET.filter(q => q !== crimeLoc));
    lovers.forEach((c, i) => {
      rec.truth[c.id] = { loc: L, with: lovers[1 - i].id };
      if (temperOf(c) !== 'honest' && chance(A.hide)) rec.secret.push(c.id);
    });
  }
  // friends, mostly, spend the evening together, wherever anyone might (the one of the cult who goes out later as readily
  // as anyone: an evening in company is the best cover there is, and true as far as it goes)
  const pair = shuffle(loose.filter(c => !rec.truth[c.id].with));
  if (pair.length >= 2 && chance(A.pair)) {
    const a = pair[0],
      b = companyFor(a, pair.slice(1)),
      L = wpick(elsewhere);
    rec.truth[a.id] = { loc: L, with: b.id };
    rec.truth[b.id] = { loc: L, with: a.id };
  }
  // by ill luck, someone alone was where it happened (for the one who did the night's work, its evening was out there)
  if (out)
    loose.forEach(c => {
      if (!rec.truth[c.id].with && chance(A.astray)) rec.truth[c.id] = { loc: crimeLoc, with: null, astray: true };
    });
  // what each says of their evening, the cult as anyone: the truth, mostly; but lovers keep their secret, habitual liars
  // lie even when it costs them, and fear makes a liar of many who were out alone, the more if they were where it
  // happened: they were in camp, they say, or with a friend (named below). The one who did the night's work tells its
  // evening the same way: what it hides is the rest of the night, and a lie about where it was, if it tells one, is its
  // cover rather than fear (not counted among the afraid). Now and then anyone will not say at all.
  const named = [];
  rest
    .filter(c => c.role !== 'smuggler')
    .forEach(c => {
      const t = rec.truth[c.id],
        fib = 1 - TP(c).truth;
      if (rec.secret.includes(c.id)) rec.claim[c.id] = { loc: 'camp', with: null };
      else if (chance(A.evadeNight)) rec.claim[c.id] = { loc: 'evade', with: null };
      else if (!t.with && t.loc !== 'camp' && chance(fib * (t.loc === crimeLoc ? A.fear : A.alibi))) {
        rec.claim[c.id] = { loc: 'camp', with: null };
        if (c.id !== actorId) rec.afraid.push(c.id);
        if (chance(A.fearFriend)) named.push(c);
      } else
        rec.claim[c.id] = chance(TP(c).lieSmall)
          ? t.with
            ? { loc: 'camp', with: null }
            : { loc: t.loc === 'camp' ? 'village' : 'camp', with: null }
          : t;
    });
  // the thief says he was in his tent; an honest one will not lie about it, and mostly will not say either; now and then
  // anyone of them tells the truth, or will not say; and now and then he lets fall what he saw (thiefMentions)
  if (smug) {
    const truth = { loc: rec.truth[smug.id].loc, with: null },
      evade = { loc: 'evade', with: null };
    rec.claim[smug.id] =
      temperOf(smug) === 'honest'
        ? chance(A.thiefTruthHonest)
          ? truth
          : evade
        : chance(A.thiefTruth)
          ? truth
          : chance(A.thiefEvade)
            ? evade
            : { loc: 'camp', with: null };
    if (actorId && crime && out && chance(A.thiefMentions)) rec.saw[smug.id] = { who: actorId, cat: pick(CATS), where: crimeLoc };
  }
  // the cult's sightings: only those who will frame an innocent invent one, and they pick someone they dislike
  cult.forEach(c => {
    if (crime && inno.length && chance(A.frame * TP(c).frame))
      rec.saw[c.id] = { who: pickByLike(c, inno, -1).id, cat: pick(CATS), where: crimeLoc, to: toward };
  });
  // an alibi made up out of fear names a friend, anywhere but where it happened; the friend may back it (one of the cult
  // gladly: it is an alibi for itself), or, asked, say otherwise
  named.forEach(c => {
    const pool = rest.filter(o => o.id !== c.id);
    if (!pool.length) return;
    const f = companyFor(c, pool),
      L = wpick(elsewhere);
    rec.claim[c.id] = { loc: L, with: f.id };
    if (f.role === 'cult' ? chance(A.cultCover) : backs(f, c)) rec.claim[f.id] = { loc: L, with: c.id };
  });
  // what was seen in the night: the thief, by those out where he was (in camp, only that someone was moving about the
  // tents); else whoever was about where it happened, the attacker or someone there by ill luck
  const about = loose.filter(c => out && c.id !== actorId && rec.truth[c.id].loc === crimeLoc);
  inno.forEach(c => {
    const t = rec.truth[c.id];
    if (!chance(t.loc === 'camp' ? A.sawFromCamp : A.sawOut)) return;
    let sw;
    if (smug && rec.truth[smug.id].loc === t.loc && chance(A.sawSmuggler))
      sw = { who: smug.id, cat: pick(CATS), where: t.loc, ...(t.loc === 'camp' ? { to: 'tents' } : {}) };
    else if (!crime) return;
    else {
      // (whoever was about: the attacker, or someone there by ill luck; and with no attacker of flesh, only them)
      const w = actorId ? { [actorId]: 1 } : {};
      about.filter(o => o.id !== c.id && o.id !== t.with).forEach(o => (w[o.id] = A.seenAstray));
      if (!Object.keys(w).length) return;
      sw = { who: wpick(w), cat: pick(CATS), where: crimeLoc, to: toward };
    }
    // the light-headed misremember what they saw
    if (chance(TP(c).mistake)) sw.val = pick(Object.keys(TRAITS[sw.cat].vals).filter(v => v !== C(sw.who).traits[sw.cat]));
    rec.saw[c.id] = sw;
  });
  // one who is sure of someone, or cannot bear them, may say they saw them, to make the camp listen
  inno.forEach(c => {
    if (!crime || rec.saw[c.id]) return;
    const pool = rest.filter(o => o.id !== c.id),
      t = pick([mostSuspected(c, pool), ...pool.filter(o => likes(c.id, o.id) <= -2)].filter(Boolean));
    if (t && chance(A.invent * TP(c).frame)) rec.saw[c.id] = { who: t.id, cat: pick(CATS), where: crimeLoc, made: true, to: toward };
  });
  // (on a night nothing came for anyone, nobody heard any shouting: people/alibis.js, alibiLine)
  if (!crime) Object.values(rec.claim).forEach(cl => (cl.calm = true));
  S.nights[n] = rec;
}
// whom someone spends an evening with, of a pool: a friend the likelier, as anyone's choices follow their likes; but the
// cult keeps no closer company with its own by night than with anyone else (by day it keeps clear of it altogether:
// company.cultApart), so that whom it was with says nothing of what it is
function companyFor(a, pool) {
  const w = {};
  pool.forEach(o => {
    w[o.id] = Math.max(RULES.likes.floor, 1 + RULES.likes.pull * (cultPair(a, o) ? 0 : likes(a.id, o.id)));
  });
  return C(wpick(w));
}
// whether id was out where it happened that night, by ill luck (not the one attacked, nor the one who did it; one of
// the cult who was not at the night's work may have been there by ill luck as anyone may)
const wasAbout = (rec, id) =>
  rec.crimeLoc !== 'camp' && id !== rec.target && id !== rec.actor && !!rec.truth[id] && rec.truth[id].loc === rec.crimeLoc;
// a fond friend who would bend the truth (or misremember it) backs up p's story of an evening with c; one who merely
// likes them, now and then (coverLike); anyone else only by misremembering
function backs(p, c) {
  const l = likes(p.id, c.id),
    A = RULES.alibis;
  return chance(l >= 2 ? A.cover : l === 1 ? A.cover * A.coverLike : TP(p).mistake);
}
// two of them sweet on each other (one taken with the other, who likes them back), if any: one such pair, at random (a
// priest keeps his vows, whoever is taken with him)
function trystOf(pool) {
  const pairs = [];
  pool.forEach(a =>
    pool.forEach(b => {
      if (
        a.id < b.id &&
        mayFlirt(a, b) &&
        (flirtsWith(a.id, b.id) || flirtsWith(b.id, a.id)) &&
        likes(a.id, b.id) >= 1 &&
        likes(b.id, a.id) >= 1
      )
        pairs.push([a, b]);
    })
  );
  return pick(pairs) || null;
}
const sawVal = sw => sw.val || C(sw.who).traits[sw.cat];
// The night Crane died, at the foot of the ziggurat: the hierophant's work, and the scene as any night's (game/night.js:
// sceneTrace); how he was found (world/deaths.js); and the Dreamer's dream of it, unless the night brought none
// (people/claims.js).
function crane0() {
  S.nights = [];
  S.claims = [];
  S.sights = [];
  planAlibis(0, 'ziggurat', S.hierophant);
  S.nights[0].target = 'crane';
  sceneTrace(0, 'ziggurat', C(S.hierophant), 'crane');
  S.craneHow = craneDeath();
  if (!chance(RULES.night.dreamless)) dreamTonight(freeChars().find(c => c.role === 'seer'));
}
// c is the one speaking; saw: they will go on to tell of someone they passed in the night
function alibiLine(cl, c, saw = false) {
  const w = cl.with && S.chars[cl.with] ? C(cl.with).short : null,
    wr = w ? ru.c(cl.with, 'i') : null;
  // the one who spent the night in your tent (people/visit.js): you know where she was, and she says so; if they came
  // for her there, she slept through it (the Watcher), or heard the dogs and someone running (luck)
  if (cl.you)
    return cl.attacked
      ? cl.how === 'luck'
        ? bi(
            'You know where I was, Doctor: with you. I heard the dogs, and someone running past the tent, and that is all.',
            `Вы знаете, где я ${ru.gs(c, 'был', 'была')}, доктор: с вами. Я ${ru.gs(c, 'слышал', 'слышала')} собак и чьи-то шаги мимо палатки — и больше ничего.`
          )
        : bi(
            'You know where I was, Doctor: with you. I slept through all of it, and I am glad I did.',
            `Вы знаете, где я ${ru.gs(c, 'был', 'была')}, доктор: с вами. Я всё ${ru.gs(c, 'проспал', 'проспала')} — и ${ru.gs(c, 'рад', 'рада')} этому.`
          )
      : bi('You know very well where I was, Doctor.', `Вы прекрасно знаете, где я ${ru.gs(c, 'был', 'была')}, доктор.`);
  if (cl.attacked)
    return bi(
      `You know where I was: ${LOCS[cl.loc].at}, when someone came for me out of the dark. ${cl.how === 'luck' ? 'Then the dogs woke the camp, and they ran.' : 'Then someone else drove them off.'}${saw ? '' : ' I saw neither face.'}`,
      `Вы знаете, где я ${ru.gs(c, 'был', 'была')}: ${R(LOCS[cl.loc].at)}, когда кто-то набросился на меня из темноты. ${cl.how === 'luck' ? 'Потом собаки перебудили лагерь, и он убежал.' : 'Потом кто-то другой его прогнал.'}${saw ? '' : ` Ни одного лица я не ${ru.gs(c, 'разглядел', 'разглядела')}.`}`
    );
  if (cl.loc === 'evade')
    return c.role === 'smuggler'
      ? bi('Out. Where is my own affair, Doctor.', 'Не в лагере. Где — моё дело, доктор.')
      : bi(
          'Where I was is my own affair, Doctor. It has nothing to do with this.',
          `Где я ${ru.gs(c, 'был', 'была')} — моё дело, доктор. К этому оно отношения не имеет.`
        );
  // whoever owns the Watcher's part, true or false, says they kept the watch (the Watcher hiding it: below)
  if (cl.loc === 'camp' && !w && claimOf(c).role === 'warden')
    return bi(
      'Up with a lamp, as always, walking between the tents until first light.',
      `${ru.gs(c, 'Не спал', 'Не спала')}, как всегда: с лампой ходил${ru.gs(c, '', 'а')} между палатками до рассвета.`
    );
  switch (cl.loc) {
    case 'village':
      return w
        ? bi(
            `At the coffee-house with ${w}. Backgammon, three glasses of tea, then the walk back.`,
            `В кофейне, с ${wr}. Нарды, три стакана чая, потом пешком назад.`
          )
        : bi(
            'At the coffee-house until they put the lamps out. I walked back alone.',
            `В кофейне, пока не погасили лампы. Назад ${ru.gs(c, 'шёл один', 'шла одна')}.`
          );
    case 'store':
      return w
        ? bi(
            `In the finds magazine with ${w}, numbering sherds. Dull work. It passes the night.`,
            `В хранилище находок, с ${wr}: нумеровали черепки. Работа скучная, зато ночь проходит.`
          )
        : bi(
            'In the finds magazine, numbering sherds until my lamp ran dry.',
            `В хранилище находок: ${ru.gs(c, 'нумеровал', 'нумеровала')} черепки, пока в лампе не кончилось масло.`
          );
    case 'canal':
      return w
        ? bi(
            `Walking by the canal with ${w}. Neither of us could sleep.`,
            `Гуляли с ${wr} вдоль канала. Нам ${ru.f(c) && ru.f(cl.with) ? 'обеим' : 'обоим'} не спалось.`
          )
        : bi('I walked along the canal. I could not sleep.', `${ru.gs(c, 'Бродил', 'Бродила')} вдоль канала. Не спалось.`);
    case 'trench':
      return w
        ? bi(
            `Down in Trench B with ${w}, looking at the shoring by lamplight. The men had been careless with it.`,
            `Внизу, в траншее Б, с ${wr}: смотрели при лампе крепления. Рабочие с ними небрежны.`
          )
        : bi(
            'Down in Trench B. The shoring worried me, so I went to look at it by lamplight.',
            `Внизу, в траншее Б. Меня беспокоили крепления, и я ${ru.gs(c, 'пошёл', 'пошла')} взглянуть на них при лампе.`
          );
    case 'ziggurat':
      return w
        ? bi(
            `Up on the ziggurat with ${w}. You can see the whole plain from up there by moonlight.`,
            `Наверху, на зиккурате, с ${wr}. Оттуда при луне видна вся равнина.`
          )
        : bi(
            'Up on the ziggurat, alone. You can see the whole plain from up there by moonlight.',
            `Наверху, на зиккурате, ${ru.gs(c, 'один', 'одна')}. Оттуда при луне видна вся равнина.`
          );
    case 'cemetery':
      return w
        ? bi(
            `Out by the Parthian graves with ${w}. It was quiet there. Do not ask me more.`,
            `У парфянских могил, с ${wr}. Там было тихо. Больше не спрашивайте.`
          )
        : bi(
            'Out by the Parthian graves. I do not sleep well, and the dead are quiet company.',
            'У парфянских могил. Я плохо сплю, а мёртвые — тихая компания.'
          );
    default: {
      if (w)
        return bi(
          `In the mess tent with ${w}, playing cards until the lamp gave out. Then bed.`,
          `В столовой палатке, с ${wr}: играли в карты, пока не погасла лампа. Потом спать.`
        );
      // (one who woke in the night did not sleep through it; the Watcher, hiding the part, never slept, and says no
      // more than the truth, as anyone might; and on a night nothing came for anyone, nobody heard any shouting: calm)
      // (the honest Watcher all but always says just that; anyone else, now and then: watcherWords)
      const k =
        c.role === 'warden' && chance(temperOf(c) === 'honest' ? RULES.scale.surest : RULES.alibis.watcherWords)
          ? 2
          : saw || cl.calm
            ? pick([0, 2])
            : pick([0, 1, 2]);
      // (in one of several ways of saying the same thing: data/variety.js)
      return bi(...tellOne('inCamp-' + k, SAY.inCamp[k])(c));
    }
  }
}
// who was awake all night in camp, by their own account or in truth: one who owns the Watcher's part, and the Watcher
// (hiding the part, mostly as one would: watcherWords); now and then anyone else alone in camp who could not sleep
// (upAnyway)
const upAllNight = (cl, c) =>
  cl.loc === 'camp' &&
  !cl.with &&
  (claimOf(c).role === 'warden' || (c.role === 'warden' ? chance(RULES.alibis.watcherWords) : chance(RULES.alibis.upAnyway)));
// someone passed in the night, as one who saw them tells it; cl: their own account of the night. In camp (sw.to): toward
// your tent, the night they came for you; toward the tent of one who slept in yours, the night they came for her there;
// or only about the tents (the thief, staying in camp)
function sightLine(cl, sw, c) {
  const v = sawVal(sw),
    home = sw.where === 'camp',
    hers = home && sw.to && S.chars[sw.to] ? sw.to : null,
    where = hers ? `${C(hers).short}’s tent` : home ? 'your tent' : LOCS[sw.where].ref,
    wr = hers ? `палатки ${ru.c(hers, 'g')}` : home ? 'вашей палатки' : ru.loc(sw.where, 'gen');
  const sense = sw.cat === 'prints' ? ru.gs(c, 'слышал', 'слышала') : ru.gs(c, 'почувствовал', 'почувствовала'),
    [nf, nfRu] = tellOne('noFace', SAY.noFace)(c);
  if (cl.attacked) return bi(`${nf} But ${SENSE[sw.cat]} ${WIT[v]}.`, `${nfRu} Но я ${sense} ${RU_WIT[v]}.`);
  if (home && sw.to === 'tents')
    return upAllNight(cl, c)
      ? bi(
          `Around two, someone was moving about between the tents without a lamp. ${nf} But ${SENSE[sw.cat]} ${WIT[v]}.`,
          `Около двух кто-то бродил между палатками без лампы. ${nfRu} Но я ${sense} ${RU_WIT[v]}.`
        )
      : cl.loc === 'camp'
        ? bi(
            `I woke around two. Someone went past my tent, and on between the tents. ${nf} But ${SENSE[sw.cat]} ${WIT[v]}.`,
            `Я ${ru.gs(c, 'проснулся', 'проснулась')} около двух. Кто-то прошёл мимо моей палатки и дальше, между палатками. ${nfRu} Но я ${sense} ${RU_WIT[v]}.`
          )
        : bi(
            `On the way back I passed someone between the tents. Too dark for a face. ${SENSE[sw.cat]} ${WIT[v]}, though.`,
            `На обратном пути мне попался кто-то между палатками. Лица в темноте не разглядеть. Зато я ${sense} ${RU_WIT[v]}.`
          );
  if (upAllNight(cl, c))
    return bi(
      `Around two, someone went past the tents towards ${where}. ${nf} But ${SENSE[sw.cat]} ${WIT[v]}.`,
      `Около двух кто-то прошёл мимо палаток в сторону ${wr}. ${nfRu} Но я ${sense} ${RU_WIT[v]}.`
    );
  return cl.loc === 'camp'
    ? bi(
        `I woke around two. Someone went past my tent towards ${where}. ${nf} But ${SENSE[sw.cat]} ${WIT[v]}.`,
        `Я ${ru.gs(c, 'проснулся', 'проснулась')} около двух. Кто-то прошёл мимо моей палатки в сторону ${wr}. ${nfRu} Но я ${sense} ${RU_WIT[v]}.`
      )
    : bi(
        `On the way back I passed someone heading for ${where}. Too dark for a face. ${SENSE[sw.cat]} ${WIT[v]}, though.`,
        `На обратном пути мне попался кто-то, кто шёл в сторону ${wr}. Лица в темноте не разглядеть. Зато я ${sense} ${RU_WIT[v]}.`
      );
}
