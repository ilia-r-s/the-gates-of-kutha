// ===================== ENDINGS: nineteen ways out of Kutha, and how cleanly it was done =====================
// Which ending you reach depends on how the last fight went. What it says depends on the whole season: whom you
// exposed and whom you wronged, who died, how you went about it, what the power below was, and how much of Kutha
// you let into yourself (the debrief's own parts are in game/debrief.js). Nothing here throws the game's dice, so the
// next expedition is dealt exactly as before.
const endTitle = id => (END_OLD[id] ? bi(ENDINGS[END_OLD[id]].title) : bi(END_TITLES[id][0], END_TITLES[id][1]));
const endNames = ids => listNames(ids.map(id => C(id).name));
const endNamesRu = (ids, k = 'n') => ru.list(ids.map(id => ru.cf(C(id), k)));
function endingId(kind, how) {
  if (kind === 'exposed') return 'unopened';
  if (kind === 'expelled') return 'truck'; // (the camp sent you away for the deed: game/deed.js)
  if (kind === 'triumph') return how === 'ward' ? 'sealed' : how === 'rite' ? 'banished' : 'emptied';
  if (kind === 'pyrrhic') return how === 'shoot' ? 'shot' : how === 'fire' ? 'burned' : 'scarred';
  if (kind === 'death') return S.fin ? 'fallen-below' : 'fallen-night';
  if (kind === 'madness')
    return S.fin
      ? 'counting'
      : S.hurtBy === 'study' || (S.log.studyCost >= END_SAYS.study && S.log.studyCost > S.log.horrorNerve)
        ? 'bethlem'
        : 'canal';
  return 'doom-' + (S.aspectOf[S.patron] || 'fire');
}

// ---------- the reckoning: how cleanly it was done ----------
function endReckon() {
  const L = S.log,
    f = S.fin;
  const cult = S.order.filter(id => C(id).role === 'cult');
  const inq = L.accused.filter(a => a.right),
    wrong = L.accused.filter(a => !a.right);
  // (unmasked at the fourth gate; or in the night, by one who failed to kill you: people/visit.js)
  const night = cult.filter(id => C(id).status === 'exposed' && C(id).exposedHow === 'night'),
    gate = cult.filter(id => C(id).status === 'exposed' && !inq.some(a => a.id === id) && !night.includes(id));
  // the dead: all of them; and the night's (the cult's, or the power's own), not counting whoever you killed yourself,
  // which the deed counts on its own (game/deed.js)
  const dead = S.order.filter(id => C(id).status === 'taken'),
    taken = dead.filter(id => C(id).takenBy !== 'you');
  let mR = 0,
    mW = 0;
  S.order.forEach(id => {
    const m = markOf(C(id));
    if (m === '?') return;
    if ((m === 'foe') === (C(id).role === 'cult')) mR++;
    else mW++;
  });
  const first = inq.length ? Math.min(...inq.map(a => a.day)) : null;
  const named = f ? f.named : null,
    namedOk = !!named && named === S.patron;
  const hierX = C(S.hierophant).status === 'exposed';
  const failed = f ? f.acts.filter(a => a.ok === false).length : 0;
  // the people outside the cult still at the dig who trusted you by the end, and those who turned against you during the
  // season (someone who never liked you and still doesn't was not your doing; whom you sent away is counted as wronged)
  const atEnd = S.order.filter(id => C(id).role !== 'cult' && isFree(C(id)));
  const friends = atEnd.filter(id => C(id).rapport >= 2);
  const enemies = atEnd.filter(id => C(id).rapport <= -1 && C(id).rapport < (S.rap0 ? S.rap0[id] : 0));
  const W = RULES.reckoning,
    rep = Math.max(-W.reputation, Math.min(W.reputation, friends.length - enemies.length));
  // your body and mind: wounds you carry at the end, nerve steady at the end, nerve that once all but broke
  const steady = S.nerve >= Math.ceil(W.steady * S.nerveMax),
    frayed = L.minNerve <= W.frayed;
  // inquiries the camp would not back, and a camp that would hold no more
  const refused = L.refusedInq.length,
    walkout = !!S.log.walkedOut; // (a camp that walked out, even if it later relented)
  // the deed (game/deed.js): any attempt counts against you; one of the cult killed, for you; anyone else, heavily against
  const deed = L.deed && L.deed.outcome ? L.deed : null,
    blood = deed && deed.outcome === 'killed' ? deed.id : null,
    deedScore = deed ? -W.deed + (blood ? (C(blood).role === 'cult' ? W.deedCult : -W.deedInnocent) : 0) : 0;
  const score =
    W.inquiry * inq.length +
    W.gate * (gate.length + night.length) +
    (hierX ? W.hierophant : 0) -
    W.wrong * wrong.length -
    W.refused * refused -
    (walkout ? W.walkout : 0) -
    W.taken * taken.length +
    mR -
    mW +
    (named ? (namedOk ? W.named : -W.misnamed) : 0) +
    (first && first <= W.earlyDay ? W.early : 0) -
    W.wound * S.wounds +
    (steady ? 1 : 0) -
    (frayed ? 1 : 0) -
    failed +
    rep +
    (L.confess ? W.confession : 0) +
    deedScore;
  return {
    cult,
    inq,
    wrong,
    refused,
    walkout,
    gate,
    night,
    taken,
    dead,
    mR,
    mW,
    first,
    named,
    namedOk,
    hierX,
    failed,
    friends,
    enemies,
    rep,
    steady,
    frayed,
    blood,
    score
  };
}
const END_TIER = {
  clean: ['Clean work', 'Чистая работа'],
  steady: ['Honest work', 'Честная работа'],
  costly: ['A costly win', 'Дорогая победа'],
  ruinous: ['At any price', 'Любой ценой'],
  close: ['Within reach', 'Совсем рядом'],
  far: ['Out of your depth', 'Не по силам']
};
// (a win with blood on your hands is a costly one at best: game/deed.js)
const endTier = (won, s, t = RULES.reckoning.tiers, blood = false) =>
  won
    ? s >= t.clean && !blood
      ? 'clean'
      : s >= t.steady && !blood
        ? 'steady'
        : s >= t.costly
          ? 'costly'
          : 'ruinous'
    : s >= t.close
      ? 'close'
      : 'far';
// How it went, in one paragraph: a win, told by how clean it was; a near thing; or a rout; or a loss that came after
// the cult was finished (id: the ending).
function endConduct(won, tier, r, id) {
  const ward = S.wardOf[S.patron],
    found = S.log.charms.includes(ward),
    done = r.cult.every(x => C(x).status !== 'present'); // (none of it left at large: unmasked, or dead)
  return won
    ? endConductWon(tier, r, id)
    : done
      ? endConductDone(r, id)
      : tier === 'close'
        ? endConductClose(r, ward, found)
        : endConductFar(r, ward, found);
}
// A win: how it is remembered, how soon you had the first of them, who did not live to see it, whom you wronged, and
// what the camp made of you.
function endConductWon(tier, r, id) {
  const open = {
    clean: ['It was clean work, by any measure.', 'По любым меркам это была чистая работа.'],
    steady: [
      'It was not clean, but it was honest work, and most of it was done in daylight.',
      'Работа вышла не чистой, зато честной, и почти вся она делалась при свете дня.'
    ],
    costly: ['You won, and Kutha made you pay for it.', 'Вы победили, и Кута заставила вас за это заплатить.'],
    ruinous: [
      'It will be called a victory in the report, because the report will not say what it cost.',
      'В отчёте это назовут победой, потому что в отчёте не будет сказано, чего она стоила.'
    ]
  }[tier];
  const close = {
    clean: [
      'Years later, the people who were there still talk about that spring, and about you, in the low voice people keep for miracles.',
      'Годы спустя те, кто там был, всё ещё вспоминают ту весну — и вас — вполголоса, как вспоминают о чуде.'
    ],
    steady: [
      'The Trustees thank you in writing, which is more than they ever did for Crane.',
      'Попечители благодарят вас письменно — Крейна они не удостоили и этого.'
    ],
    costly: [
      'The Trustees call it a success. The people who were there do not call it anything.',
      'Попечители называют это успехом. Те, кто там был, никак это не называют.'
    ],
    ruinous: ['The rite was stopped. Very little else was.', 'Обряд остановлен. Мало что ещё удалось остановить.']
  }[tier];
  const t = r.dead,
    w = r.wrong.map(a => a.id);
  // (a shot, or the fire, kills whoever of the cult it takes: data/endings.js; those are not the night's dead)
  const dead = !t.length
    ? id === 'shot' || id === 'burned'
      ? bi('Apart from the cult, no one died at Kutha after you came.', 'Кроме сектантов, после вашего приезда в Куте никто не умер.')
      : bi('No one else died at Kutha after you came.', 'После вашего приезда в Куте больше никто не умер.')
    : t.length === 1
      ? bi(
          `${C(t[0]).name} did not live to see the end of it.`,
          `${capS(ru.cf(C(t[0])))} не ${ru.gs(C(t[0]), 'дожил', 'дожила')} до конца.`
        )
      : bi(`${endNames(t)} did not live to see the end of it.`, `${capS(endNamesRu(t))} не дожили до конца.`);
  // (and the names the camp would not hear: were they right?)
  const refusedWrong = S.log.refusedInq.some(a => C(a.id).role !== 'cult');
  const wronged = !w.length
    ? S.log.accused.length
      ? refusedWrong
        ? bi(
            'Everyone you sent away was one of them, though not every name you put to the camp was right.',
            'Все, кого вы отослали, были из них, хотя не каждое имя, что вы называли лагерю, было верным.'
          )
        : bi('Every accusation you made was true.', 'Каждое ваше обвинение оказалось верным.')
      : S.log.refusedInq.length
        ? bi('The camp never once let you send anyone away.', 'Лагерь так ни разу и не позволил вам никого отослать.')
        : bi('You never once stood up and named anyone.', 'Вы так ни разу и не решились никого назвать вслух.')
    : w.length === 1
      ? bi(
          `${C(w[0]).name} left the dig in disgrace for something ${C(w[0]).p} never did.`,
          `${capS(ru.cf(C(w[0])))} с позором ${ru.gs(C(w[0]), 'покинул', 'покинула')} раскопки за то, чего не ${ru.gs(C(w[0]), 'совершал', 'совершала')}.`
        )
      : bi(
          `${endNames(w)} left the dig in disgrace for things they never did.`,
          `${capS(endNamesRu(w))} с позором покинули раскопки за то, чего не совершали.`
        );
  const quick = !r.first
    ? ''
    : r.first < RULES.reckoning.earlyDay
      ? bi(
          `You had the first of them in irons by day ${r.first}, before the camp had learned to be afraid.`,
          `Первого из них вы заковали уже в день ${r.first} — прежде чем лагерь успел научиться бояться.`
        )
      : r.first > RULES.reckoning.earlyDay
        ? bi(`It took you until day ${r.first} to name the first of them.`, `Первого из них вы назвали лишь в день ${r.first}.`)
        : '';
  const camp =
    r.friends.length >= END_SAYS.friends
      ? bi('By the end, most of the camp would have followed you anywhere.', 'Под конец большая часть лагеря пошла бы за вами куда угодно.')
      : r.enemies.length >= END_SAYS.enemies
        ? bi('By the end, half the camp would not meet your eye.', 'Под конец половина лагеря избегала смотреть вам в глаза.')
        : '';
  return `<p>${bi(open[0], open[1])} ${quick ? quick + ' ' : ''}${dead} ${wronged} ${camp ? camp + ' ' : ''}${endBody(r)} ${bi(close[0], close[1])}</p>`;
}
// How you came out of it, body and mind: the wounds you carry, and your nerve.
function endBody(r) {
  const w = S.wounds,
    en =
      w === 0
        ? 'You came out of it unhurt'
        : w === 1
          ? 'You came out of it with a wound'
          : `You came out of it with ${['', 'one', 'two', 'three', 'four'][w]} wounds`,
    rus =
      w === 0
        ? 'Вы вышли из всего этого без единой царапины'
        : w === 1
          ? 'Вы вышли из всего этого с раной'
          : `Вы вышли из всего этого с ${['', 'одной', 'двумя', 'тремя', 'четырьмя'][w]} ранами`;
  const mind = r.steady
    ? r.frayed
      ? [
          ', and with your nerve whole again, though there was a night when it all but went.',
          ', и нервы ваши снова целы, хотя была ночь, когда они едва не сдали.'
        ]
      : [', and with your nerve whole.', ', и нервы ваши целы.']
    : r.frayed
      ? [', though there was a night when your nerve all but went.', ', хотя была ночь, когда нервы едва не сдали.']
      : [', and with your nerve shaken.', ', а нервы у вас расшатаны.'];
  return bi(en + mind[0], rus + mind[1]);
}
// A loss that came after the cult was finished, every one of it unmasked or dead: it was not the cult that beat you,
// but Kutha by itself, or the camp that sent you away for the deed (id: 'truck').
function endConductDone(r, id) {
  const ex = r.inq.map(a => a.id).concat(r.gate, r.night),
    had = ex.length
      ? bi(`You had unmasked ${endNames(ex)}.`, `Вы разоблачили ${endNamesRu(ex, 'a')}.`)
      : bi('None of them was unmasked, but none of them was left.', 'Никого из них вы не разоблачили, но и не осталось никого.'),
    then =
      id === 'truck'
        ? bi(
            'It was the camp that finished you, for the way you went about it.',
            'Вас погубил лагерь — за то, как вы этого добились.'
          )
        : bi(
            'Kutha did the rest by itself, as it had before there was anyone to serve it.',
            'Остальное Кута сделала сама — как делала и прежде, задолго до того, как появилось кому ей служить.'
          );
  return `<p>${bi('By the end there was nobody of the cult left at large, and it was not the cult that beat you.', 'Под конец на свободе не осталось никого из секты — и одолела вас не она.')} ${had} ${then}</p>`;
}
// A near thing: what you had, and how little was missing.
function endConductClose(r, ward, found) {
  const en = [],
    rus = [],
    ex = r.inq.map(a => a.id).concat(r.gate, r.night);
  if (ex.length) {
    en.push(`unmasked ${endNames(ex)}`);
    rus.push(`разоблачили ${endNamesRu(ex, 'a')}`);
  }
  if (r.namedOk) {
    en.push(`named ${GODS[S.patron].name} rightly`);
    rus.push(`верно назвали ${ru.god(S.patron, 'a')}`);
  }
  if (found) {
    en.push(`found ${theItem(ward)}, the one charm that mattered`);
    rus.push(`нашли ${ru.item(ward, 'a')} — единственный амулет, который имел значение`);
  }
  if (r.mR >= END_SAYS.marks) {
    en.push(`marked ${r.mR} of the seven truly`);
    rus.push(`верно отметили ${r.mR} ${ruN(r.mR, 'человека', 'человек', 'человек')} из семи`);
  }
  const mid = en.length
    ? bi(`You had ${listNames(en)}.`, `Вы ${ru.list(rus)}.`)
    : bi('You had come further than most.', 'Вы зашли дальше, чем большинство.');
  return `<p>${bi('It was closer than anyone will ever know.', 'Всё было куда ближе, чем кто-либо когда-нибудь узнает.')} ${mid} ${bi('One more day, one more right guess, and it would have been another story.', 'Ещё один день, ещё одна верная догадка — и это была бы совсем другая история.')}</p>`;
}
// A rout: up to three reasons why.
function endConductFar(r, ward, found) {
  const s = [];
  if (!r.inq.length && !r.gate.length && !r.night.length)
    s.push(bi('You never unmasked any of them in time.', 'Вы так и не разоблачили никого из них вовремя.'));
  if (r.named && !r.namedOk)
    s.push(
      bi(
        `You named ${GODS[r.named].name}, and it was ${GODS[S.patron].name}.`,
        `Вы назвали ${ru.god(r.named, 'a')}, а ${ru.gf(S.patron) ? 'это была' : 'это был'} ${ru.god(S.patron)}.`
      )
    );
  if (!found)
    s.push(
      bi(
        `${capS(theItem(ward))} lay ${LOCS[S.wardAt[ward]].at} all along.`,
        `${ru.Item(ward)} всё это время ${ru.ig(ward, 'лежал', 'лежала', 'лежало', 'лежали')} ${ru.loc(S.wardAt[ward], 'at')}.`
      )
    );
  if (r.wrong.length) {
    const w = r.wrong.map(a => a.id);
    s.push(
      bi(
        `${endNames(w)} paid for your mistakes.`,
        `За ваши ошибки ${w.length > 1 ? 'заплатили' : ru.gs(C(w[0]), 'заплатил', 'заплатила')} ${endNamesRu(w)}.`
      )
    );
  }
  if (r.taken.length >= 2)
    s.push(
      bi(
        `The night took ${endNames(r.taken)} while you were looking elsewhere.`,
        `Ночь забрала ${endNamesRu(r.taken, 'a')}, пока вы смотрели в другую сторону.`
      )
    );
  if (!s.length)
    s.push(bi('The odds turned against you, and stayed turned.', 'Удача отвернулась от вас — и так и не повернулась обратно.'));
  return `<p>${bi('You were never close.', 'Вы ни разу не были близки к разгадке.')} ${s.slice(0, 3).join(' ')} ${bi('Whatever was under Kutha hardly noticed you.', 'То, что таилось под Кутой, едва ли вас заметило.')}</p>`;
}

// ---------- the way you went about it ----------
// What a season counts toward each style; END_STYLE_W in rules.js says how much each thing weighs for which style.
function endStyleFacts(r) {
  const L = S.log,
    f = S.fin || {},
    acts = f.acts || [];
  return {
    press: L.press, // times you pressed someone
    accused: L.accused.length + L.refusedInq.length, // accusations before the camp, carried out or refused
    distrust: L.distrust, // times you asked whom someone distrusts
    enemies: r.enemies.length, // people outside the cult who turned against you
    faced: f.g2 === 'face' ? 1 : 0, // you turned to face the traitor on the stair
    shot: acts.some(a => a.kind === 'shoot') ? 1 : 0, // you fired at the rite
    rest: L.rest,
    backDown: L.backDown, // times you thought better of it: a talk, a translation, an inquiry
    slowStair: f.g1 === 'slow' ? 1 : 0, // you went slowly at the first gate
    unseen: f.g2 === 'listen' || f.g2 === 'blind' ? 1 : 0, // you passed the fourth gate listening, or walking blind
    neverAccused: L.accused.length + L.refusedInq.length ? 0 : 1,
    study: L.study, // translations attempted
    readings: L.readings, // charms read and titles glossed for you
    facts: S.factKnown.length, // tablet lines known
    rite: acts.some(a => a.kind === 'rite') ? 1 : 0, // you spoke the counter-rite
    examine: L.examine, // scenes examined
    night: L.night, // times you asked where someone was in the night
    sights: S.sights.length, // sightings heard
    marksRight: r.mR, // people marked rightly in your notebook
    diary: L.diary || 0, // times you asked about Crane's diary
    search: L.search, // searches
    charms: L.charms.length, // charms found
    confide: L.confide, // times you confided in someone
    about: L.about, // times you asked someone about themselves
    trust: S.order.reduce((s, id) => s + Math.max(0, C(id).rapport), 0), // all the trust in you at the end
    friends: r.friends.length, // people who trusted you at the end
    confess: L.confess, // pretences dropped openly, at breakfast or before the camp
    went: (f.took || []).length // companions who went down with you, whatever became of them below
  };
}
function endStyleScores(r) {
  const x = endStyleFacts(r),
    sc = {};
  Object.entries(END_STYLE_W).forEach(([style, w]) => {
    sc[style] = Object.keys(w).reduce((s, k) => s + w[k] * x[k], 0);
  });
  return sc;
}
function endStyle(r) {
  if (S.log.deed && S.log.deed.outcome === 'killed') return 'avenger'; // (the night you killed defines the season: game/deed.js)
  const sc = endStyleScores(r);
  let best = 'director',
    v = END_STYLE_MIN;
  Object.keys(END_STYLE_MU).forEach(k => {
    const z = (sc[k] - END_STYLE_MU[k]) / END_STYLE_SD[k];
    if (z > v) {
      v = z;
      best = k;
    }
  });
  return best;
}
// How much of Kutha got into you: horrors, the cost of reading, wounds in the night, the signs, the charms, the gate's price.
function endExposure() {
  const L = S.log,
    f = S.fin,
    W = END_HAUNT_W;
  return (
    W.horror * (L.horror + L.dread) +
    W.studyCost * L.studyCost +
    S.factKnown.length / W.factPer +
    W.wound * L.attacks.filter(a => a.how === 'hurt').length +
    S.omenSeen.length / W.signPer +
    L.charms.length / W.charmPer +
    (f && f.g3 && f.g3.kind === 'self' ? W.self : 0) +
    (S.bg === 'occultist' ? W.occultist : 0) +
    Math.max(0, W.nerveLow - L.minNerve)
  );
}
const endHaunt = () => {
  const x = endExposure();
  return x >= END_HAUNT[1] ? 2 : x >= END_HAUNT[0] ? 1 : 0;
};

// Which endings this reader has reached before: a convenience kept in this browser only, and silently skipped where storage is closed.
function endSeen(id) {
  try {
    const k = 'kutha.endings',
      a = JSON.parse(localStorage.getItem(k) || '[]').filter(x => END_IDS.includes(x));
    if (!a.includes(id)) a.push(id);
    localStorage.setItem(k, JSON.stringify(a));
    return a.length;
  } catch (e) {
    return null;
  }
}

// ---------- the ending itself ----------
function ending(kind, how) {
  emit('ending-start', kind);
  const id = endingId(kind, how); // read the moment before the phase changes
  S.ended = kind;
  S.endId = id;
  S.phase = 'end';
  const won = kind === 'exposed' || kind === 'triumph' || kind === 'pyrrhic';
  S.romance = romances(); // decided once, for the fates and the reasons below
  const r = endReckon(),
    tier = endTier(won, r.score, RULES.reckoning.tiers, !!r.blood),
    style = endStyle(r),
    asp = S.aspectOf[S.patron],
    st = END_STYLE[style],
    seen = endSeen(id);
  const mad = ['bethlem', 'canal', 'counting'].includes(id),
    haunt = mad ? 0 : endHaunt(),
    later = afterDeaths(), // (deaths that came later, decided once: game/fates.js; nobody is written to who is dead by then)
    last = yourLast(won, later); // (rarely, the end you chose: game/fates.js)
  const body = endStory(id, how);
  if (won && id !== 'burned') body.push(`<p>${bi(END_CALM[asp][0], END_CALM[asp][1])}</p>`);
  body.push(endConduct(won, tier, r, id));
  body.push(`<p>${bi(st[won ? 'win' : 'lose'][0], st[won ? 'win' : 'lose'][1])}</p>`);
  body.push(endSelf(r, won, last, later)); // (lost, only what the season left in you, if anything)
  if (!won && haunt === 2)
    body.push(
      `<p class="omen">${bi('By the end you could read the wedges in the dark, without a lamp. That should have told you something.', 'Под конец вы могли читать клинья в темноте, без лампы. Это должно было вас насторожить.')}</p>`
    );
  if (won && haunt === 1)
    body.push(
      `<p class="omen">${bi('Something of Kutha came home with you all the same. You do not sleep with the lamp out.', 'И всё же кое-что от Куты вернулось домой вместе с вами. Без лампы вы больше не спите.')}</p>`
    );
  if (won && haunt === 2)
    body.push(
      `<p class="omen">${bi('Something of Kutha came home with you, and it has not finished reading. On quiet nights you catch yourself tracing wedges on the tablecloth with a fingernail, and you have stopped asking what they say.', 'Кое-что от Куты вернулось домой вместе с вами — и оно ещё не дочитало. Тихими ночами вы ловите себя на том, что выводите ногтем клинья на скатерти, и уже не спрашиваете себя, что они значат.')}</p>`
    );
  body.push(lastSaid(last));
  body.push(
    `<div class="debrief"><h3>${bi('What became of them', 'Что стало с ними')}</h3>${endAfter(id, won, later)}` +
      `<h3>${bi('What shaped this ending', 'Что привело к этому финалу')}</h3>${endFactors(id, r, haunt, won)}` +
      `<h4>${bi(`Dr ${enName()}’s season in numbers`, `Сезон доктора ${ru.name()} в цифрах`)}</h4>${endNumbers(r)}` +
      (seen
        ? `<p class="dim">${bi(`Endings reached so far: ${seen} of ${END_IDS.length}.`, `Открыто финалов: ${seen} из ${END_IDS.length}.`)}</p>`
        : '') +
      `<h3>${bi('What was true', 'Как всё было на самом деле')}</h3>${endTruth()}</div>`
  );
  const n = END_IDS.indexOf(id) + 1,
    inBed = id === 'fallen-night' && NIGHT_IN_BED.includes(nightDeath()),
    how_ = won ? (kind === 'pyrrhic' ? ['a hard victory', 'трудная победа'] : ['victory', 'победа']) : ['defeat', 'поражение'];
  show({
    kicker: bi(
      `Ending ${n} of ${END_IDS.length} · ${how_[0]}${S.hardcore ? ' · by your own judgement' : ''}`,
      `Финал ${n} из ${END_IDS.length} · ${how_[1]}${S.hardcore ? ' · своим умом' : ''}`
    ),
    title: endTitle(id),
    sub: bi(`${END_TIER[tier][0]} · ${st.name[0]}`, `${END_TIER[tier][1]} · ${st.name[1]}`),
    // (a death in your own cot, with nothing torn open, at first light: data/endings.js, nightDeath)
    art: inBed
      ? { bg: 'end', end: id, aspect: asp, time: 'dawn', inBed: true }
      : { bg: 'end', end: id, aspect: asp, time: END_TIME[id] },
    body,
    choices: [
      {
        label: bi('Begin a new expedition', 'Начать новую экспедицию'),
        sub: bi('New roles, new traits, perhaps another god', 'Новые роли, новые привычки — быть может, и другой бог'),
        fn: introScene
      }
    ]
  });
  emit('ending', kind);
}
