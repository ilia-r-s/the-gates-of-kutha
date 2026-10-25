// ===================== THE NIGHT, AND THE MORNING AFTER =====================
// The cult strikes, the watcher watches, the dreamer dreams, the rite grows; then dawn (when the season's mood may turn,
// game/tenor.js): the sign, the finds, breakfast, the news. The night may be your last, and then no morning comes; nor
// does one when the rite completes in the night. Completed already as night falls (an innocent sent away at the evening's
// inquiry: game/inquiry.js), it does not wait for the night: the gate opens, and the descent begins.
function nightfall() {
  emit('nightfall');
  if (S.day >= RULES.start.days) {
    finaleIntro(false);
    return;
  }
  if (S.doom >= S.doomMax) {
    finaleIntro(true); // (which keeps the rite at its top: game/finale.js)
    return;
  }
  // now and then someone comes to your tent as the evening ends (people/visit.js); the night follows your answer
  const her = visitTonight();
  if (her) visitScene(her);
  else nightComes();
}
function nightComes() {
  S.phase = 'night';
  const n = S.day,
    out = resolveNight();
  if (S.ended || !out) return; // (the season ended in the night, or the gate opened of itself: game/inquiry.js)
  const early = S.doom >= S.doomMax;
  show({
    kicker: early
      ? bi(`Night ${n} · Before dawn`, `Ночь ${n} · До рассвета`)
      : bi(`Night ${n} · Dawn of day ${n + 1}`, `Ночь ${n} · Рассвет дня ${n + 1}`),
    title: early ? bi('The gate is opening', 'Врата отворяются') : bi('Night, and morning', 'Ночь и утро'),
    body: out,
    choices: [
      {
        label: early ? bi('Go to the ziggurat', 'Идти к зиккурату') : bi(`Begin day ${n + 1}`, `Начать день ${n + 1}`),
        cls: early ? 'danger' : '',
        fn: early ? () => finaleIntro(true) : startDay
      }
    ]
  });
}
// The night and, unless it ends the season or the rite completes in it, the morning after: the lines the page tells
// (none, if the season ended), each under a word that says when it happened, so that what follows from what is plain: the
// night itself; at first light, what the night left (the dead and their trace, the camp's grief for them, the sign, the
// rite); breakfast; and the day's news. A part with nothing in it is not told. Returns null if the night ended the
// season, or the page it told was its own (the last of the cult unmasked in it: game/inquiry.js, lastOfThem).
function resolveNight() {
  const night = theNight();
  if (checkEnd()) return null;
  const parts = [[bi('In the night', 'Ночью'), night.out]];
  // the last of the cult unmasked in the night (people/visit.js): the season is won, all but always. (The last of it dead
  // by your own hand, and you carry on in the dark, none the wiser: game/deed.js.)
  if (night.unmasked && !freeCult().length && !S.ended) {
    lastOfThem(bi(`Night ${S.day} · Before dawn`, `Ночь ${S.day} · До рассвета`), partsTold(parts));
    return null;
  }
  if (S.doom < S.doomMax) {
    const turn = dawn(night),
      after = visitMorning(night), // (before breakfast, where the camp talks of it: people/visit.js)
      m = theMorning(night);
    if (checkEnd()) return null;
    parts.push(
      [bi('At first light', 'На рассвете'), [after, ...night.found, diedInTentSaid(), m.grief, turn, ...m.first]],
      [bi('At breakfast', 'За завтраком'), m.breakfast],
      [bi('The day’s news', 'Новости дня'), m.news]
    );
  } else parts.push([bi('Before dawn', 'До рассвета'), night.found]);
  return partsTold(parts);
}
// the parts of a night as the page tells them: each under its word, and none with nothing in it
const partsTold = parts =>
  parts.flatMap(([head, lines]) => {
    const said = lines.filter(Boolean);
    return said.length ? [`<p class="part">${head}</p>`, ...said] : [];
  });
// The new day begins at dawn, before breakfast: what the morning brings is that day's. The camp's anger cools after a
// day without an inquiry, and a camp that walked out may think better of it (game/verdict.js); and the season's mood
// may turn (returns the lines that tell of it, if any).
function dawn(night) {
  S.day++;
  S.slot = 0;
  S.inquiryDone = false;
  coolOff();
  const death = !!night.dead || !!night.deedDead || (!!night.target && night.target !== 'player' && C(night.target).status === 'taken');
  return driftTenor() + relentAtDawn(death);
}
function startDay() {
  startSlot();
  emit('dawn');
}
// The night, step by step, then the morning. The steps run in this order because the dice are thrown in this order:
// change the order and every recorded season replays differently.
function theNight() {
  const swore = id => (id && isFree(C(id)) ? id : null); // a promise only the one still at the dig can keep, or break
  const night = {
    out: [tenorNight()], // the night itself (how the evening ended, if someone came to your tent, is told before it: people/visit.js)
    found: [], // what first light finds: the dead and their trace, or nobody missing
    cult: freeCult(),
    npcs: freeChars().filter(c => c.role !== 'cult'),
    falseGuard: swore(S.falseGuard), // one of the cult swore to watch your tent tonight (kept, mostly, like anyone's)
    // someone swore to watch your tent tonight: one of the cult, one who only says they keep watch, or the true Watcher
    // (whose broken promise is told as anyone's)
    sworn: swore(S.falseGuard) || swore(S.fakeGuard) || swore(S.guardPromise),
    smugOut: !!swore(S.fakeGuard) && C(S.fakeGuard).role === 'smuggler' // ... and it was the smuggler, out on business
  };
  const out = night.out,
    N = RULES.night;
  // now and then the cult lies low and comes for no one, for reasons of its own (people/cunning.js, liesLow); with
  // nobody of it left at large, the power below comes by itself, mostly (priestless), for whom the cult would have chosen
  // and as the cult would have come, so that the night tells nothing of who is left
  night.guest = visitGuest(); // (one who came to your tent as the evening ended, and stayed: people/visit.js)
  night.power = !night.cult.length && chance(N.priestless);
  night.quiet = !night.power && (!night.cult.length || liesLow(night));
  night.target = night.quiet ? null : chooseVictim(night);
  if (night.power && night.target !== 'player') night.why = { kind: 'power' };
  // (the last of the cult in your tent lets you be, as often as not, and if it comes for anyone tonight, it is someone
  // else; otherwise the power below comes for you by itself, as on a night with nobody of the cult left at large, so
  // that a night that came for you says nothing of what she is: visit.spares)
  if (night.target === 'player' && night.guest && night.guest.role === 'cult' && night.cult.length === 1 && night.npcs.length) {
    if (chance(RULES.visit.spares)) {
      night.target = wpick(victimWeights(night.npcs));
      night.why = victimWhy(C(night.target), night.cult);
    } else {
      night.power = true;
      night.why = { kind: 'power' };
    }
  }
  if (night.falseGuard && night.target !== 'player') S.log.keptWatch.push({ day: S.day, id: night.falseGuard });
  S.falseGuard = null;
  S.fakeGuard = null;
  night.watcher = night.npcs.find(c => c.role === 'warden');
  night.guard = night.watcher ? chooseWatch(night) : null;
  night.promised = S.guardPromise; // (the true Watcher's promise is for tonight, like anyone's)
  S.guardPromise = null;
  night.seer = night.npcs.find(c => c.role === 'seer');
  night.loc = wpick(N.where); // (where the night takes anyone but you)
  night.deed = deedTonight(); // (you go out tonight yourself: game/deed.js)
  out.push(yourDream(night)); // (before anything the night has done is known: game/yourdreams.js)
  // in the small hours, one of the cult in your tent may do the cult's work herself (not on a night it lies low)
  if (!night.quiet) out.push(guestStrikes(night));
  if (S.wounds >= S.woundsMax) return night;
  night.cult = freeCult(); // (she may be one of them taken away; the last of them, and the season is won at dawn)
  if (night.unmasked && !night.cult.length) return night;
  // (whoever it came for may have been taken away before it came: the one in your tent, unmasked)
  if (night.target && night.target !== 'player' && !isFree(C(night.target))) {
    night.target = null;
    night.foiled = true;
  }
  if (night.quiet || night.foiled) quietNight(night);
  else if (night.target === 'player' && night.deed) {
    // you were out: whatever came found your tent empty, and you find it so when you get back; unless the Watcher by it
    // drove it off first, all but always, and then the Watcher knows your tent was empty (game/deed.js); one who only
    // swore to watch it slept, as on any night
    night.loc = 'camp';
    if (night.guard === 'player' && chance(N.watched)) {
      night.youOut = 'guarded';
      S.log.attacks.push({ day: S.day, how: 'guard', out: true, power: !!night.power });
    } else {
      night.youOut = true;
      S.log.attacks.push({ day: S.day, how: 'out', power: !!night.power });
    }
    night.found.push(leaveTrace(night));
    if (night.youOut === true && night.sworn && night.guard !== 'player') night.found.push(failedWatch(night.sworn));
  } else if (night.target === 'player') {
    night.loc = 'camp';
    out.push(attackOnYou(night));
    if (S.wounds >= S.woundsMax) return night;
    // (first light finds the scene by your tent; and by breakfast the camp knows that whoever swore to watch it did not,
    // unless they spent the night in it)
    night.found.push(leaveTrace(night));
    if (night.sworn && night.guard !== 'player' && !inYourTent(night.sworn)) night.found.push(failedWatch(night.sworn));
  } else if (night.guest && night.target === night.guest.id) {
    night.loc = 'camp'; // (her own tent, or yours: she was in yours)
    out.push(herNight(night));
    night.found.push(leaveTrace(night));
  } else night.found.push(attackOnThem(night), leaveTrace(night));
  guestAccount(night); // (whether the one in your tent slipped out on the cult's work: people/visit.js)
  out.push(deedNight(night)); // (in the small hours, after the cult has been, you go yourself: game/deed.js)
  // the Dreamer's dream of the night, of someone still here at first light (now and then a night without dreams)
  night.vision = night.seer && isFree(night.seer) && !chance(N.dreamless) ? dreamTonight(night.seer) : null;
  if (night.quiet || night.foiled) night.found.unshift(quietSaid()); // (what first light finds, the deed told)
  // the rite grows by those of the cult still at large come the dawn, so much each, about; and the faster the longer you
  // sit still and leave it be (people/cunning.js, cultTurns: quiet)
  const idle = 1 + RULES.adapt.idleRite * (cultTurns('quiet') - 1);
  freeCult().forEach(() => {
    S.doom += vary(RULES.night.rite * idle);
  });
  // the night is not always over when the cult has been: a horror, the words you have read, or someone who cannot stand
  // you (not all three at once, and seldom any of it on a night that came for you: calm)
  const calm = night.target === 'player' ? N.calm : 1,
    dread = dreadNight(calm),
    words = wordsAtNight();
  out.push(dread, words, spiteNight(calm * (dread && words ? N.calm : 1), night.deed));
  night.found.push(riteNote()); // (the scorched circle, as first light shows it)
  return night;
}
// A night the cult came for no one: it lay low (S.log.quiet; and why, if it had a reason: S.log.low), or whoever it came
// for had been taken away first (foiled), or there was nobody of it left at large to come; the rite grew all the same, by
// whatever of it is left. Everyone was somewhere, all the same (people/alibis.js).
function quietNight(night) {
  S.crime = null;
  if (night.cult.length && !night.foiled) {
    S.log.quiet.push(S.day);
    if (night.low) S.log.low[S.day] = night.low;
  }
  planAlibis(S.day, null, null);
}
// What first light finds after such a night: everyone there; unless the night was not so quiet after all, and what it
// held is told instead (your own deed, or the one in your tent taken away).
function quietSaid() {
  const d = S.log.deed,
    v = S.log.visit;
  if ((d && d.day === S.day && d.outcome && d.outcome !== 'away') || (v && v.day === S.day && v.struck === 'failed')) return '';
  return bi(
    '<p>Nothing comes in the night. At first light the camp counts itself twice over, and everyone is there. Nobody believes it.</p>',
    '<p>Ночью ничего не происходит. На рассвете лагерь дважды пересчитывает себя — все на месте. И никто в это не верит.</p>'
  );
}
// The morning: the grief for the night's dead, if any (people/social.js, griefFor), and the day's sign (all but always);
// then the morning's extras, each less likely for every one already told (game/tenor.js: room): where dread runs high
// a sign not yet seen may come as well; the finds tray; the dreams and talk at breakfast; the news. What the season's
// mood favours is weighed first, and the rest makes room for it; each is told in its own part of the morning
// (resolveNight): { grief, first: signs, breakfast: dreams and talk, news: the finds tray and the news }.
function theMorning(night) {
  S.tenor.crowd = 0;
  cornerClaims(); // (one who has begun to look lost may claim a part by now: people/claims.js)
  // (the cult's dead, or the one who died in your tent; one it came for and missed, and you then killed, is grieved for
  // once, as yours)
  const v0 = night.target && night.target !== 'player' && C(night.target),
    victim = night.dead || (v0 && v0.status === 'taken' && v0.takenBy !== 'you' ? v0.id : null),
    m = {
      grief: (victim ? griefFor(victim) : '') + (night.deedDead ? griefFor(night.deedDead) : ''),
      first: [chance(RULES.night.dawnSign) ? omenP(nextOmen()) : ''],
      // (what the camp makes of the deed, and whether it judges you: the morning after, or at a later dawn: game/deed.js)
      breakfast: [S.log.deed && S.log.deed.day === S.day - 1 ? deedMorning() : deedDawn()],
      news: []
    };
  if (S.ended) return m;
  const parts = {
    dread: () =>
      m.first.push(
        S.omenSeen.length < 4 && chance(room('dread') * TENOR.omen * Math.max(TENOR.floor, rateOf('dread') - 1))
          ? brought(omenP(nextOmen()))
          : ''
      ),
    finds: () => m.news.unshift(findsTray()),
    // what the camp says over breakfast: dreams, then about you, about each other, and the lies that will not hold
    talk: () => m.breakfast.push(keptSaid(night) + breakfastDreams(night).join('') + socialMorning(victim)),
    news: () => m.news.push(morningEvent())
  };
  const order = Object.keys(parts),
    first = order.filter(k => TENOR.moods[S.tenor.mood][k] > 1);
  first.concat(order.filter(k => !first.includes(k))).forEach(k => parts[k]());
  return m;
}
// Whom the cult comes for: you, if you have given yourself away to it (and now and then for no reason you will ever know,
// the more as the season goes); otherwise a dreamer the camp has heard name one of it guilty (the true Dreamer, as a
// rule: it goes by what was dreamt, not by who dreams true), a loud dreamer (mostly spared while their dreams do it no
// harm: a pretender naming the innocent does the cult's work for it), one who has named an innocent guilty before
// everyone (so that the innocent looks like the one who silenced them), or anyone, leaning toward the people who stand by
// you and away from the ones the cult likes. On a night one of it swore to watch your tent, it is torn between its cover
// and what it knows of you, and acts on what it knows the less readily (holds): no more and no less than it takes for a
// broken watch to say about as much of anyone who swore it (one who swore it, of the cult, was mostly confided in, and
// so knows you). How it has read your way of hunting it leans on some of this (people/cunning.js, cultTurns). Why it
// chose whom it chose is kept for the ending (night.why).
function chooseVictim(night) {
  const N = RULES.night,
    { cult, npcs } = night,
    holds = night.falseGuard ? 1 - N.holds : 1;
  if (S.alerted && chance(N.alerted * holds)) return 'player'; // you confided in one of them, or it has guessed you
  if (cult.some(k => Ties.against(k)) && chance(N.enemy * holds * cultTurns('inquisitor'))) return 'player'; // you made an enemy of one
  // or for no reason you will ever know (the more if you read late or dig where it hides things: people/cunning.js)
  if (chance((N.you + N.youDay * (S.day - 1)) * Math.max(cultTurns('scholar'), cultTurns('delver')))) return 'player';
  const b = betrayal(cult); // now and then one of their own (people/cunning.js)
  if (b) {
    night.betrayer = b.killer.id;
    night.why = { kind: 'betrayal' };
    return b.victim.id;
  }
  // how many of the dreams someone has told aloud named one of the cult guilty, still at large
  const harm = c =>
    S.said.filter(x => x.by === c.id && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult' && isFree(C(x.about)))
      .length;
  const threat = npcs.filter(c => harm(c) > 0).sort((x, y) => harm(y) - harm(x))[0],
    loud = S.loud && npcs.find(c => c.id === S.loud);
  if (threat && chance(N.threat)) {
    night.why = { kind: threat.role === 'seer' ? 'dreamer' : 'loud' };
    return threat.id;
  }
  if (loud && chance(N.loud * (harm(loud) ? 1 : N.loudSpared))) {
    night.why = { kind: 'loud' };
    return loud.id;
  }
  // or one who has named an innocent guilty before everyone: with them dead, it is the one they named the camp will look
  // at (frame × the craft at planting of the best of it at that)
  const named = c =>
      S.said.filter(x => x.by === c.id && x.verdict === 'cult' && x.how !== 'vote' && isFree(C(x.about)) && C(x.about).role !== 'cult'),
    accuser = pick(npcs.filter(c => named(c).length));
  if (accuser && cult.length && chance(N.frame * Math.max(...cult.map(k => craft(k).plant)))) {
    night.why = { kind: 'frame', of: named(accuser).pop().about };
    return accuser.id;
  }
  if (!npcs.length) return 'player';
  const t = wpick(victimWeights(npcs));
  night.why = victimWhy(C(t), cult);
  return t;
}
// What most likely made the cult choose someone, as it stood that night: one of it could not bear them or never liked
// them, they had begun to suspect one of it, or they stood by you; or nothing in particular.
function victimWhy(v, cult) {
  const k = cult.filter(c => Ties.dislikes(c.id, v.id)).sort((a, b) => Ties.likes(a.id, v.id) - Ties.likes(b.id, v.id))[0];
  if (k) return { kind: Ties.cannotBear(k.id, v.id) ? 'cannotBear' : 'dislike', by: k.id };
  const s = cult.find(c => sus(v.id, c.id) >= 2);
  if (s) return { kind: 'suspects', of: s.id };
  return Ties.friend(v) ? { kind: 'stood' } : { kind: 'none' };
}
// The Watcher watches over you the night they promised to, if they trust you, mostly; otherwise over anyone at all, you
// included, and the cult too: the Watcher cannot tell. The Watcher who spent the night in your tent watched nobody's.
function chooseWatch({ watcher: w }) {
  if (inYourTent(w.id)) return null;
  const pool = [
    'player',
    ...freeChars()
      .filter(c => c.id !== w.id)
      .map(c => c.id)
  ];
  return S.guardPromise === w.id && Ties.friend(w) && chance(RULES.night.watchKept) ? 'player' : pick(pool);
}
// The Dreamer dreams of someone not yet dreamt of who is still here at first light (whom the night came for and missed
// as readily as anyone: a made-up dream may be of them too), and the dream is true, almost always (muddied: the one that
// is not); but the god knows who has robbed it, and now and then its hand is on the thief's shoulder too (dark: a dream
// of guilt, and no cultist). The ending tells both.
function dreamTonight(seer) {
  const cand = freeChars().filter(c => c.id !== seer.id && !seer.visions.some(v => v.about === c.id));
  if (!cand.length) return null;
  const t = pick(cand),
    clear = chance(RULES.night.dreamTrue),
    dark = clear && t.role === 'smuggler' && chance(RULES.night.thiefDark),
    vision = { about: t.id, cult: dark || (t.role === 'cult') === clear, ...(clear ? {} : { muddied: true }), ...(dark ? { dark } : {}) };
  seer.visions.push(vision);
  return vision;
}
// They come for you: the Watcher, the incantation bowl or the revolver may turn them; otherwise you pay for it (and so
// may one who came to your tent tonight).
function attackOnYou(night) {
  const { guard, watcher: w } = night;
  const N = RULES.night;
  if (guard === 'player' && chance(N.watched)) {
    S.log.attacks.push({ day: S.day, how: 'guard', power: !!night.power });
    if (!chance(N.seen))
      return bi(
        `<p>In the small hours you hear a scuffle outside your tent and a curse. By the time you get the flap open there is nobody there: only a lamp going away between the tents.</p>`,
        `<p>Под утро у палатки слышны возня и чья-то ругань. Когда вы откидываете полог, снаружи уже никого нет — только лампа удаляется между палатками.</p>`
      );
    S.revealed[w.id] = 'warden';
    fixMark(w);
    return bi(
      `<p>In the small hours you hear a scuffle outside your tent and a curse. When you get the flap open, ${w.short} is standing there with a lamp. “Someone came for you,” ${w.p} says. “They will not come again tonight.”</p>`,
      `<p>Под утро у палатки слышны возня и чья-то ругань. Когда вы откидываете полог, снаружи с лампой в руке стоит ${ru.c(w)}. «За вами приходили, — говорит ${ru.gs(w, 'он', 'она')}. — Сегодня больше не придут».</p>`
    );
  }
  let pre = ''; // (a bowl that held nothing)
  if (has('bowl')) {
    // the bowl breaks as it is used, mostly, whether it holds or not (bowlBreaks); now and then it is whole in the morning
    const held = chance(N.bowl),
      broke = chance(N.bowlBreaks);
    if (broke) lose('bowl');
    if (held) {
      S.log.attacks.push({ day: S.day, how: 'bowl', broke, power: !!night.power });
      return broke
        ? bi(
            `<p>In the night the incantation bowl under your bed cracks clean in two. Whatever came for you is trapped in the pieces, or was.</p>`,
            `<p>Ночью заклинательная чаша под вашей кроватью раскалывается ровно надвое. То, что приходило за вами, теперь заперто в осколках — или было заперто.</p>`
          )
        : bi(
            `<p>In the morning the incantation bowl under your bed is full to the brim with black water, and whole. You did not hear anything come, or go.</p>`,
            `<p>Утром заклинательная чаша под вашей кроватью полна до краёв чёрной водой — и цела. Вы не слышали, чтобы кто-то приходил или уходил.</p>`
          );
    }
    pre = broke
      ? bi(
          `<p>In the night the incantation bowl under your bed cracks clean in two, and whatever came for you is not in the pieces.</p>`,
          `<p>Ночью заклинательная чаша под вашей кроватью раскалывается надвое — но того, что приходило за вами, в осколках нет.</p>`
        )
      : bi(
          `<p>The incantation bowl under your bed does not so much as ring.</p>`,
          `<p>Заклинательная чаша под вашей кроватью даже не звякает.</p>`
        );
  }
  if (has('revolver') && chance(N.revolver)) {
    S.log.attacks.push({ day: S.day, how: 'revolver', power: !!night.power });
    return (
      pre +
      bi(
        `<p>Something slides under the tent wall in the dark. You fire twice. In the morning there is no blood.</p>`,
        `<p>В темноте под стенку палатки что-то проскальзывает. Вы стреляете дважды. Наутро крови нет.</p>`
      ) +
      hurt(1, 0)
    );
  }
  // and now and then you wake in time, and whatever it was goes
  if (chance(N.spared)) {
    S.log.attacks.push({ day: S.day, how: 'woke', power: !!night.power });
    return (
      pre +
      bi(
        `<p>You wake in the dark, sure that someone is standing over your bed. You strike a match. Nobody: only the tent flap, stirring, and the pariah dogs barking away down the lines. You do not sleep again.</p>`,
        `<p>Вы просыпаетесь в темноте с уверенностью, что кто-то стоит над вашей кроватью. Чиркаете спичкой. Никого — только колышется полог да где-то в конце лагеря заходятся лаем бродячие собаки. Больше вы не спите.</p>`
      ) +
      hurt(1, 0)
    );
  }
  const asp = mannerOf(); // (in the power's own manner, all but always)
  if (asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: S.day, id: 'you', asp });
  const it = `<p class="horror">${bi(
    tellOne(
      'attack-' + asp,
      ASPECTS[asp].attack.filter((t, k) => tellableNow((ASPECTS[asp].attackEcho || [])[k]))
    )
  )}</p>`;
  if (night.guest) return pre + guestThrough(night, it); // (and she was in your tent: people/visit.js)
  S.log.attacks.push({ day: S.day, how: 'hurt', power: !!night.power });
  const html = pre + it + hurt(2, 1);
  journal(bi('You were attacked in the night.', 'Ночью на вас напали.'));
  return html;
}
// one the night came for and a watcher in the dark saved, as first light tells it (the cult's coming, or your own)
const watchedOff = v =>
  bi(
    `<p>Someone came for ${v.short} in the night, but a watcher in the dark drove them off.</p>`,
    `<p>Ночью кто-то приходил за ${ru.c(v, 'i')}, но незримый страж прогнал незваных гостей.</p>`
  );
// They come for someone else: the Watcher may be there, or luck (spared: the dogs, a light, a sleeper stirring);
// otherwise the night takes them, and they are found where it happened, in one of the power's ways. It shakes you,
// most likely if they had come to trust you. (saved: 'watch' or 'luck', if they live)
function attackOnThem(night) {
  const N = RULES.night,
    { target, guard, loc, betrayer } = night,
    v = C(target);
  const saved = guard === target && chance(N.watched) ? 'watch' : chance(N.spared) ? 'luck' : null; // (the Watcher there, and in time)
  night.saved = saved;
  if (betrayer) S.betrayals.push({ day: S.day, by: betrayer, victim: v.id, saved });
  if (saved === 'watch') {
    S.log.guarded.push({ day: S.day, id: v.id });
    return watchedOff(v);
  }
  if (saved) {
    S.log.spared.push({ day: S.day, id: v.id });
    return bi(
      `<p>Someone came for ${v.short} in the night. The pariah dogs set up a howl, ${v.short} shouted, and by the time anyone came running there was nobody to be seen.</p>`,
      `<p>Ночью кто-то приходил за ${ru.c(v, 'i')}. Бродячие собаки подняли вой, ${ru.c(v)} ${ru.gs(v, 'закричал', 'закричала')} — и когда люди сбежались, вокруг уже никого не было.</p>`
    );
  }
  fixMark(v);
  v.status = 'taken';
  v.takenDay = S.day;
  S.stats.taken++;
  const how = deathHow(v, loc, !!betrayer);
  if (how.asp !== S.aspectOf[S.patron]) S.log.manner.push({ day: S.day, id: v.id, asp: how.asp });
  const own = how.kind === 'body', // the power's own touch draws the season's mood toward the haunted; a murder, toward talk
    shaken = chance(clamp(RULES.night.shaken + RULES.night.shakenTrust * Math.max(0, v.rapport))),
    html = `<p class="horror">${deathText(v, loc, how)}</p>` + (shaken ? hurt(1, 0) : '');
  pullTo(own ? 'haunted' : 'tongues', own ? TENOR.pulls.taken : TENOR.pulls.murder);
  journal(bi(`${v.name} was taken in the night.`, `Ночь забрала ${ru.cf(v, 'a')}.`));
  night.finder = how.f; // (who found them knows what the body looked like: people/cunning.js, blurt)
  return html;
}
// The night leaves a trace at the scene: the attacker's own, and, if the attacker is careless, a second of theirs; or
// now and then the smuggler's, out on business of his own; or an innocent's, laid there by the attacker
// (people/cunning.js); or, rarely, none at all (swept). Everyone's account of the night is settled here too
// (people/alibis.js), and why the cult chose whom it chose.
function leaveTrace({ cult, target, loc, smugOut, betrayer, why, finder, saved, at, guest, power }) {
  // (one of the cult in your tent does not come at you from outside it as well: the other does; and the power below,
  // come by itself, is nobody: priestless)
  const by = guest && target === 'player' ? cult.filter(k => k !== guest) : cult,
    actor = betrayer ? C(betrayer) : power ? null : pick(by.length ? by : cult);
  planAlibis(S.day, loc, actor ? actor.id : null, target, saved || 'watch');
  const rec = S.nights[S.day];
  rec.target = target;
  rec.why = why || null;
  rec.finder = finder || null;
  rec.saved = saved || null; // (how the one it came for lived, if they did: people/cunning.js, blurt)
  rec.power = !!power; // (the power below, come by itself: the ending tells it, game/debrief.js)
  return sceneTrace(S.day, loc, actor, target, smugOut, at);
}
// What the scene of night n holds (its accounts planned already), the night Crane died among them: what the page tells
// (at: where it was, if not where the place is told to be: [English, Russian]). With no attacker of flesh (actor null:
// the power below, come by itself), the scene holds what any scene may but nothing of an attacker's own: the thief's, or
// the trace of someone who had been there earlier (anyone's, if nobody was about), or nothing.
function sceneTrace(n, loc, actor, target, smugOut = false, at = null) {
  const N = RULES.night,
    rec = S.nights[n],
    smug = freeChars().find(c => c.role === 'smuggler' && c.id !== target && c.id !== guestOn(n)), // (not out if in your tent)
    [atEn, atRu] = at || [LOCS[loc].at, R(LOCS[loc].at)];
  // now and then the scene holds nothing at all: the ground swept behind them (nothing to examine)
  if (chance(N.swept * cultTurns('sleuth'))) {
    S.crime = { loc, clue: null, examined: true, swept: true };
    if (actor) thiefSees(n, loc, actor.id, false);
    return bi(
      `<p>At the scene, ${atEn}, there is nothing to find. Someone has swept the ground with a palm frond, carefully, all the way back to the path.</p>`,
      `<p>На месте нападения, ${atRu}, искать нечего. Кто-то тщательно подмёл землю пальмовой ветвью — до самой тропы.</p>`
    );
  }
  // the thief's, come to rob the place; or someone's who was there earlier, by day or that night by ill luck
  // (people/alibis.js), before it happened; or an innocent's, laid there by the attacker
  const thief = smug && chance(smugOut ? N.smugglerTraceOut : N.smugglerTrace),
    byDay = n === S.day && loc !== 'camp' && S.visits && S.visits.day === S.day ? S.visits.at[loc] || [] : [],
    there = Object.keys(rec.truth).filter(id => (!actor || id !== actor.id) && id !== target && (wasAbout(rec, id) || byDay.includes(id))),
    anyone = actor ? [] : freeChars().filter(c => c.id !== target && c.id !== guestOn(n)),
    stray = thief ? null : there.length && (!actor || chance(N.strayTrace)) ? C(pick(there)) : anyone.length ? pick(anyone) : null,
    framed = thief || stray || !actor ? null : framedBy(actor, target),
    src = thief ? smug : stray || framed || actor;
  if (!src) {
    S.crime = { loc, clue: null, examined: true, swept: true };
    return bi(`<p>At the scene, ${atEn}, there is nothing to find.</p>`, `<p>На месте нападения, ${atRu}, искать нечего.</p>`);
  }
  const clue = addClue({
    owner: src.id,
    cat: pick(CATS),
    source: thief ? 'thief' : stray ? 'stray' : framed ? 'plant' : 'cult',
    loc,
    status: 'unverified',
    by: actor ? actor.id : null,
    day: n
  });
  S.crime = { loc, clue, examined: false };
  if (actor && src === actor && sloppy(actor))
    S.crime.more = addClue({
      owner: actor.id,
      cat: pick(CATS.filter(k => k !== clue.cat)),
      source: 'cult',
      loc,
      status: 'unverified',
      by: actor.id,
      careless: true,
      day: n
    });
  if (actor) thiefSees(n, loc, actor.id, !!thief);
  const more = S.crime.more;
  return bi(
    `<p>At the scene, ${atEn}, you find ${clueText(clue)}${more ? `, and beside it ${clueText(more)}` : ''}.</p>`,
    `<p>На месте нападения, ${atRu}, вы находите ${clueTextRu(clue)}${more ? `, а рядом — ${clueTextRu(more)}` : ''}.</p>`
  );
}
// Now and then the diggers bring in a charm you have not found yourself.
function findsTray() {
  const unfound = charmsToFind();
  if (!unfound.length || !chance(room('finds') * RULES.night.findsTray * tenorOf('finds'))) return '';
  const w = pick(unfound),
    fm = C('hamid'),
    who = isFree(fm) ? 'Hamid' : 'One of the pickmen';
  gain(w);
  journal(
    bi(
      `The diggers brought in ${theItem(w)} from ${LOCS[S.wardAt[w]].ref}.`,
      `Землекопы принесли ${ru.item(w, 'a')} ${ru.loc(S.wardAt[w], 'from')}.`
    )
  );
  return brought(
    bi(
      `<p>${who} brings you the finds tray from yesterday’s spoil. Among the sherds, cleaned and labelled: ${theItem(w)}, from ${LOCS[S.wardAt[w]].ref}.</p>`,
      `<p>${isFree(fm) ? 'Хамид' : 'Один из землекопов'} приносит вам лоток с находками из вчерашнего отвала. Среди черепков, отмытых и подписанных, — ${ru.item(w)}, ${ru.loc(S.wardAt[w], 'from')}.</p>`
    ) + gained(w)
  );
}
// The morning after a night someone swore to watch your tent and nothing came for you, the one who swore it may tell the
// camp they saw someone off (kept): the cult to be trusted for it, anyone else to be thanked, or because they heard
// something in the dark and believe it; the true Watcher, if they did watch as promised, as readily. Whoever doubted them
// may think again (people/camp.js). The ending tells what the night truly held.
function keptSaid(night) {
  const id = night.target === 'player' ? null : night.sworn,
    a = id && C(id);
  // (not one who spent the night in your tent, nor the true Watcher who watched elsewhere after all)
  if (!a || !isFree(a) || inYourTent(id, S.day - 1) || (a === night.watcher && night.guard !== 'player')) return ''; // (told at dawn: last night's)
  if (!chance(room('talk') * RULES.night.kept)) return '';
  S.log.kept.push({ day: S.day - 1, id });
  return (
    brought(
      bi(
        `<p>At breakfast ${a.short} tells anyone who will listen that ${a.p} sat up by your tent half the night. “Somewhere after two, someone came along the lines without a lamp. When I stood up, they went away.”</p>`,
        `<p>За завтраком ${ru.c(a)} рассказывает всем, кто готов слушать, что полночи ${ru.gs(a, 'просидел', 'просидела')} у вашей палатки. «Где-то после двух кто-то шёл вдоль палаток без лампы. Когда я ${ru.gs(a, 'встал', 'встала')}, он ушёл».</p>`
      )
    ) + stir('kept', { about: id })
  );
}
// Dreams told at breakfast (people/claims.js), by everyone who says they dream and by the same odds, the true Dreamer and
// anyone who only says so alike, the cult among them: brought to you before breakfast by one who promised you their
// dreams or trusts you, mostly (seerTells), or else told aloud to everyone (dreamAloud), as the morning has room. The
// true Dreamer's is the night's vision, if the night brought one; anyone else's, the day's made-up dream. A Dreamer who
// hides the gift keeps the dreams to themself.
function breakfastDreams({ seer, vision }) {
  const N = RULES.night,
    out = [],
    told = []; // who dreams aloud this morning, and what: told in no order that would give the true Dreamer away
  freeChars()
    .filter(c => claimOf(c).role === 'seer')
    .forEach(c => {
      const own = c.role === 'seer';
      if (own && (c !== seer || !vision)) return; // (the night brought the Dreamer nothing to tell)
      // the dream itself, once it is to be told: the vision, or one made up for the day
      const dream = () => {
        if (!own) return madeUpDream(c);
        vision.told = true;
        c.dreamt = { day: S.day, d: { t: C(vision.about), cult: vision.cult } }; // (told today: people/claims.js, dreamtToday)
        return c.dreamt.d;
      };
      if ((Ties.cordial(c) || c.promised) && chance(N.seerTells)) {
        const d = dream();
        if (!d) return;
        tellDream(c, d);
        const [en, rus] = dreamSaid(c, d);
        out.push(
          brought(
            bi(
              `<p>${c.short} finds you before breakfast, hollow-eyed. ${en}</p>`,
              `<p>${ru.c(c)} находит вас ещё до завтрака — с запавшими, бессонными глазами. ${rus}</p>`
            )
          )
        );
      } else if (chance(room('talk') * N.dreamAloud * talkSoft())) {
        const d = dream();
        if (!d) return;
        if (own) S.seerPublic = true;
        S.loud = c.id; // (the last to dream aloud: game/night.js, chooseVictim)
        told.push(brought([c, d]));
      }
    });
  shuffle(told).forEach(([c, d], i) => {
    const [en, rus] = dreamSaid(c, tellDream(c, d));
    out.push(
      i
        ? bi(`<p>Then ${c.short} speaks up. ${en}</p>`, `<p>Следом слово берёт ${ru.c(c)}. ${rus}</p>`)
        : bi(`<p>At breakfast, ${c.short} speaks up. ${en}</p>`, `<p>За завтраком слово берёт ${ru.c(c)}. ${rus}</p>`),
      dreamAloud(c.id, d.t.id, d.cult),
      answerDream(c, d)
    );
  });
  return out;
}
// What a dream told aloud that names someone guilty may draw, there and then (RULES.claims). Anyone else who claims to
// dream may answer for the one named with a clean dream of their own (people/claims.js, defenderOf): a friend's, the
// true Dreamer's, or the cult's for the other of it (its best answer, since nobody answers for themselves), all told
// alike. Otherwise the one named may answer with a dream of their own that names the dreamer, which is the oldest trick
// there is, and the camp knows it: so only seldom, and mostly the rash (TEMPERS counter), the more readily once they
// look lost anyway; one who claimed no part may even claim one on the spot, the cult as anyone. The true Dreamer, named
// guilty, answers with what they dreamt of their accuser, if they dreamt them guilty. Or the one named calls it a lie
// before everyone (TEMPERS retort), whatever they are. Every answer is told the same way, whoever gives it.
function answerDream(c, d) {
  const t = d.t,
    K = RULES.claims;
  if (!d.cult || !isFree(t)) return '';
  const def = defenderOf(t, c);
  if (def) {
    if (def.role === 'seer') def.visions.filter(v => v.about === t.id && !v.cult).forEach(v => (v.told = true));
    return answerWith(def, { t, cult: false }, c, true);
  }
  let a = null;
  if (t.role === 'seer') {
    const v = claimOf(t).role === 'seer' && t.visions.filter(x => x.about === c.id && x.cult).pop();
    if (v && chance(K.counterTrue)) {
      v.told = true;
      a = { t: c, cult: true };
    }
  } else if (claimsToDream(t)) {
    if (!dreamtToday(t) && chance(K.counter[aloudBefore(t) ? 1 : 0] * TP(t).counter * (looksLost(t) ? K.desperate : 1)))
      a = { t: c, cult: true };
  } else if (claimOf(t).role === 'none' && t.role !== 'warden' && chance(K.counterSpot * TP(t).counter)) {
    claimOnTheSpot(t);
    a = { t: c, cult: true };
  }
  if (a) return answerWith(t, a, c, false);
  return chance(K.retort * TP(t).retort) ? retortAloud(t, c) : '';
}
// an answer in a dream, told before everyone: who answers (a), the dream (d), to whose dream (c); for: on another's
// behalf, a dream that the one named is clean
function answerWith(a, d, c, forOther) {
  const first = !aloudBefore(a);
  // (one of the cult that answers for the other of it holds to its story from now on: people/pretences.js)
  if (forOther && a.role === 'cult' && d.t.role === 'cult') claimOf(a).stood = d.t.id;
  dreamNow(a, d);
  return (
    (forOther
      ? bi(
          `<p>${a.short} shakes ${a.pp} head. “Then we did not dream the same dream. I dreamt of the seven gates too: ${dreamEn(d.t, false)}”</p>`,
          `<p>${ru.c(a)} качает головой. «Значит, нам снились разные сны. Мне тоже снились семь врат: ${dreamRu(d.t, false)}»</p>`
        )
      : bi(
          `<p>${a.short} is on ${a.pp} feet before ${c.short} has finished. “I dreamt of the seven gates too. ${dreamEn(d.t, d.cult)}”</p>`,
          `<p>${ru.c(a)} вскакивает, не дав ${ru.c(c, 'd')} договорить. «Мне тоже снились семь врат. ${dreamRu(d.t, d.cult)}»</p>`
        )) + dreamAloud(a.id, d.t.id, d.cult, forOther ? null : { first })
  );
}
// named guilty, someone calls the dream a lie before everyone: the hot-tempered in anger, the cold coldly, the
// truthful plainly
function retortAloud(t, c) {
  addTest(t.id, c.id, 'distrust', 'cult');
  sayPublic(t.id, c.id, 'cult', 'blame');
  // (the hot-tempered mostly in anger, the cold mostly coldly, the truthful mostly plainly: claims.retortLine)
  const keyed = ['suspicious', 'liar', 'lightheaded'].includes(temperOf(t)) ? 0 : ['calculating', 'detached'].includes(temperOf(t)) ? 1 : 2,
    way = chance(RULES.claims.retortLine) ? keyed : pick([0, 1, 2].filter(k => k !== keyed)),
    line =
      way === 0
        ? bi(
            `<p class="notice">${t.short} is on ${t.pp} feet. “That is a lie, and ${c.short} knows it.”</p>`,
            `<p class="notice">${ru.c(t)} вскакивает. «Это ложь, и ${ru.c(c)} это знает».</p>`
          )
        : way === 1
          ? bi(
              `<p class="notice">${t.short} does not look up from ${t.pp} plate. “Dream what you like. I know where I was.”</p>`,
              `<p class="notice">${ru.c(t)} не поднимает глаз от тарелки. «Пусть снится что угодно. Я знаю, где ${ru.gs(t, 'был', 'была')}».</p>`
            )
          : bi(
              `<p class="notice">“That is not true,” ${t.short} says quietly. “I swear it is not.”</p>`,
              `<p class="notice">«Это неправда, — тихо говорит ${ru.c(t)}. — Клянусь, неправда».</p>`
            );
  return line + stir('blame', { by: t.id, about: c.id });
}
