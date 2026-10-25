// ===================== THE DEED: justice in your own hands =====================
// Once a season, of an evening in camp, instead of calling an inquiry, you may settle it yourself that night
// (RULES.deed): whom, with what, and whether to lay someone else's trace by them. The night goes as any night, by its own
// dice; in the small hours, after the cult has been, you go. Whoever you went for may be away on the night's business
// (the cult's own errand, the thief's, two lovers out together, or caught out by the cult somewhere else); the Watcher
// over them may drive you off, as off anyone, and may know you; otherwise it is done, mostly (the more surely with the
// revolver, and for a soldier), or they wake and fight you off, and may know you. Someone may see you about (the more
// after a shot); you may leave a trace of your own; a trace you laid of another's the camp may see for what it is. It
// costs your nerve, whatever comes of it. If the cult came for you tonight, it found your tent empty, and the camp will
// know you were out. By morning the camp has found what was done; whoever knows may say so, or hint, or keep it to
// themselves (by their trust in you), and the camp's suspicion of you grows (S.onYou); caught, or suspected enough, you
// are judged by the camp (youVote), which may put you on the lorry to Hillah (the ending: 'expelled'). Nothing ever
// tells you whether you were right, but the ending (game/debrief.js). If it was the last of the cult, you carry on in the
// dark, none the wiser.

// whether it can be done this evening: once a season, in camp, of an evening with no inquiry called (even if the camp
// will hold no more of them); not on the last evening, when the night belongs to the dark of the moon
const deedOffered = () =>
  !S.log.deed && atEvening() && !S.inquiryDone && freeChars().length > 0 && S.day >= RULES.deed.from && S.day < RULES.start.days;
// what goes through your head, before (never the same twice in a row)
const DEED_THOUGHTS = [
  [
    'The Trustees sent you to dig, not to judge. But the camp will not act, the police in Hillah would not believe a word of it, and every night the circle at the foot of the ziggurat burns a little blacker. There is only one way to stop this.',
    'Попечители прислали вас копать, а не судить. Но лагерь бездействует, полиция в Хилле не поверит ни единому слову, а круг у подножия зиккурата с каждой ночью чернеет всё сильнее. Остановить это можно только одним способом.'
  ],
  [
    'You have read enough of the tablets to know how this ends if nobody ends it first. No inquiry will do it in time. There is only one way to stop this, and nobody else is going to do it.',
    'Вы прочли довольно табличек, чтобы знать, чем всё кончится, если никто не положит этому конец раньше. Никакое дознание не успеет. Остановить это можно только одним способом — и никто, кроме вас, этого не сделает.'
  ],
  [
    'Crane is dead. The night keeps its count. Somewhere in this camp someone sleeps soundly who should not be sleeping at all. There is only one way to stop this.',
    'Крейн мёртв. Ночь ведёт свой счёт. Где-то в этом лагере крепко спит тот, кому вообще не следовало бы спать. Остановить это можно только одним способом.'
  ]
];
// The evening: whom (your mark beside each name, never how strong the case looks)
function deedScene() {
  emit('deed');
  S.phase = 'deed';
  const th = DEED_THOUGHTS[(S.day + S.salt) % DEED_THOUGHTS.length];
  show({
    kicker: dayStamp(),
    title: bi('Only one way', 'Единственный способ'),
    body: [
      `<p>${bi(th[0], th[1])}</p><p class="dim">${bi('Once this season, and only tonight. Whatever you do in the dark, nobody will tell you whether you were right.', 'Один раз за сезон — и только этой ночью. Что бы вы ни сделали в темноте, никто не скажет вам, правы ли вы были.')}</p>`
    ],
    choices: freeChars()
      .map(c => ({
        label: bi(`Go to ${c.name}’s tent tonight`, `Ночью пойти к палатке ${ru.cf(c, 'g')}`),
        sub: () => markSay(c),
        cls: 'danger',
        fn: () => deedMeans(c)
      }))
      .concat([{ label: bi('Think better of it', 'Передумать'), cls: 'minor', fn: () => (backedDown(), goTo('camp')) }])
  });
}
// with what: the revolver, if you have it (surer, and louder), or a knife from the cook-house
function deedMeans(t) {
  const ch = [];
  if (has('revolver'))
    ch.push({
      label: bi('Your revolver', 'Ваш револьвер'),
      sub: bi('Sure, and loud', 'Наверняка — но громко'),
      cls: 'danger',
      fn: () => deedPlant(t, 'revolver')
    });
  ch.push(
    {
      label: bi('A knife from the cook-house', 'Нож с кухни'),
      sub: bi('Quiet, if your hand is steady', 'Тихо — если рука не дрогнет'),
      cls: 'danger',
      fn: () => deedPlant(t, 'knife')
    },
    { label: bi('Think better of it', 'Передумать'), cls: 'minor', fn: () => (backedDown(), goTo('camp')) }
  );
  show({
    kicker: dayStamp(),
    title: bi('Only one way', 'Единственный способ'),
    body: [`<p>${bi(`${t.name}, then. With what?`, `Значит, ${ru.cf(t)}. Чем?`)}</p>`],
    choices: ch
  });
}
// and whether to lay someone else's trace there: a habit of theirs, as you have noted it (so a habit noted wrongly
// points at whoever truly has it, or at nobody)
function deedPlant(t, means) {
  const can = freeChars()
    .filter(o => o.id !== t.id)
    .flatMap(o => CATS.filter(k => o.known[k]).map(k => ({ o, cat: k, val: o.known[k] })));
  const named = new Set(), // (one habit of each, so that no two choices read alike: the first of theirs the shuffle turns up)
    some = shuffle(can)
      .filter(p => !named.has(p.o.id) && named.add(p.o.id))
      .slice(0, 4);
  show({
    kicker: dayStamp(),
    title: bi('Only one way', 'Единственный способ'),
    body: [
      `<p>${bi('One more thing. Whatever is found by the tent in the morning, the camp will read, the way you read the scenes yourself.', 'И ещё одно. Что бы утром ни нашли у палатки, лагерь станет это читать — так же, как вы сами читаете места нападений.')}</p>`
    ],
    choices: some
      .map(p => ({
        label: bi(`Leave something of ${p.o.short}’s`, `Оставить что-нибудь от ${ru.c(p.o, 'g')}`),
        sub: bi(TRAITS[p.cat].vals[p.val].name),
        fn: () => deedSet(t, means, p)
      }))
      .concat([
        { label: bi('Leave nothing of anyone’s', 'Ничего чужого не оставлять'), fn: () => deedSet(t, means, null) },
        { label: bi('Think better of it', 'Передумать'), cls: 'minor', fn: () => (backedDown(), goTo('camp')) }
      ])
  });
}
// It is settled: the evening is spent (no inquiry tonight), and you wait for the camp to sleep.
function deedSet(t, means, plant) {
  S.inquiryDone = true;
  S.act = 'deed';
  S.log.deed = { day: S.day, id: t.id, means, plant: plant ? { owner: plant.o.id, cat: plant.cat, val: plant.val } : null };
  journal(bi(`You resolved to go to ${t.name}’s tent in the night.`, `Вы решили ночью пойти к палатке ${ru.cf(t, 'g')}.`));
  endSlot(
    bi(
      `<p>You eat with the others and say very little. Afterwards you sit in your tent with the lamp out and listen to the camp go to sleep, one voice at a time.</p>`,
      `<p>Вы ужинаете со всеми и почти не говорите. Потом сидите у себя в палатке, погасив лампу, и слушаете, как лагерь засыпает — голос за голосом.</p>`
    ),
    bi('Waiting for the dark', 'В ожидании темноты')
  );
}
// the deed planned for tonight, if any
const deedTonight = () => (S.log.deed && S.log.deed.day === S.day && !S.log.deed.outcome ? S.log.deed : null);

// ---------- the small hours ----------
// whether whoever you went for is away from their tent at that hour (RULES.deed.away): dead already (the cult's work,
// out in the dark); the one of the cult who did tonight's work, not back yet (errand); the thief, still out at work;
// two lovers, still out somewhere quiet; or anyone at all, up and about at that hour as people are (restless). Each by
// chance, and all of it about as likely whoever they are, so that an empty tent says nothing of who sleeps in it.
function awayTonight(night, t) {
  const A = RULES.deed.away,
    rec = S.nights[S.day],
    tr = rec && rec.truth[t.id];
  if (!isFree(t)) return 'gone';
  if (rec && rec.actor === t.id && chance(A.errand)) return 'errand';
  if (tr && tr.loc !== 'camp' && t.role === 'smuggler' && chance(A.thief)) return 'thief';
  if (tr && tr.with && rec.actor !== t.id && QUIET.includes(tr.loc) && chance(A.tryst)) return 'tryst'; // (its evening is not where it went)
  return chance(A.restless) ? 'restless' : null;
}
// Tonight's deed, after the cult has been: what you went through (the night's page), and what the morning will find
// (night.found). The camp's suspicion, who saw, and the judgement come in the morning (deedMorning).
function deedNight(night) {
  const d = deedTonight();
  if (!d) return '';
  const D = RULES.deed,
    t = C(d.id),
    away = awayTonight(night, t),
    noise = D.noise[d.means];
  let h = '';
  if (away) {
    d.outcome = 'away';
    d.away = away;
    h = bi(
      `<p>In the small hours you reach ${t.short}’s tent. It is empty, the cot cold. Wherever ${t.short} is at this hour, ${t.p} is not asleep.</p>`,
      `<p>Под утро вы добираетесь до палатки ${ru.c(t, 'g')}. Она пуста, койка холодна. Где бы ${ru.c(t)} ни ${ru.gs(t, 'был', 'была')} в этот час, ${ru.gs(t, 'он', 'она')} не спит.</p>`
    );
    h += hurt(...D.cost.away);
  } else if (night.guard === t.id && night.watcher && isFree(night.watcher) && chance(RULES.night.watched)) {
    d.outcome = 'watched';
    d.knewBy = chance(D.knows) ? night.watcher.id : null;
    S.log.guarded.push({ day: S.day, id: t.id, you: true });
    h = bi(
      `<p>You are a step from ${t.short}’s tent when a lamp comes up out of the dark and someone shouts. You run, and do not stop until you are inside your own tent with the flap tied.</p>`,
      `<p>Вы в шаге от палатки ${ru.c(t, 'g')}, когда из темноты поднимается лампа и кто-то кричит. Вы бежите и останавливаетесь, только завязав за собой полог собственной палатки.</p>`
    );
    // (first light tells it once, if the watcher had driven the cult off from the same one already)
    if (!(night.target === t.id && night.saved === 'watch')) night.found.push(watchedOff(t));
    h += hurt(...D.cost.watched);
  } else if (chance(clamp(D.kill[d.means] + (S.bg === 'soldier' ? D.soldier : 0)))) {
    d.outcome = 'killed';
    fixMark(t);
    t.status = 'taken';
    t.takenDay = S.day;
    t.takenBy = 'you';
    S.stats.taken++;
    night.deedDead = t.id;
    journal(bi(`You killed ${t.name} in the night.`, `Ночью вы убили ${ru.cf(t, 'a')}.`));
    h =
      d.means === 'revolver'
        ? bi(
            `<p>One shot. Dogs all over the camp, lamps coming on, and you are back inside your own tent before the first of them reaches ${t.short}’s.</p>`,
            `<p>Один выстрел. Собаки по всему лагерю, загорающиеся лампы — а вы уже у себя в палатке прежде, чем первый из них добегает до палатки ${ru.c(t, 'g')}.</p>`
          )
        : bi(
            `<p>${t.short} does not wake. It is quicker than you thought, and much quieter, and afterwards you cannot make your hands stop.</p>`,
            `<p>${ru.c(t)} не просыпается. Всё выходит быстрее, чем вы думали, и куда тише, — а потом вы никак не можете унять дрожь в руках.</p>`
          );
    night.found.push(
      d.means === 'revolver'
        ? bi(
            `<p class="horror">At first light they find ${t.short} dead in ${t.pp} cot, shot through the heart. Half the camp heard the shot; nobody saw who fired it.</p>`,
            `<p class="horror">На рассвете ${ru.c(t, 'a')} находят ${ru.gs(t, 'мёртвым', 'мёртвой')} на койке, с пулей в сердце. Выстрел слышала половина лагеря; кто стрелял, не видел никто.</p>`
          )
        : bi(
            `<p class="horror">At first light ${t.short} is found dead in ${t.pp} cot, the blanket pulled up as if against the cold. It was a knife, and not the power’s way at all.</p>`,
            `<p class="horror">На рассвете ${ru.c(t, 'a')} находят ${ru.gs(t, 'мёртвым', 'мёртвой')} на койке, одеяло подтянуто, будто от холода. Это был нож — и совсем не почерк той силы.</p>`
          )
    );
    h += hurt(...D.cost.done);
  } else {
    d.outcome = 'failed';
    d.knewBy = chance(D.wakes) ? t.id : null;
    h =
      d.means === 'revolver'
        ? bi(
            `<p>${t.short} wakes as you raise the revolver and seizes it by the barrel, and the shot goes into the tent pole. You wrench free and are out and away in the dark before the lamps come on, and you do not know whether ${t.p} saw your face.</p>`,
            `<p>${ru.c(t)} просыпается, когда вы поднимаете револьвер, и хватается за ствол — пуля уходит в шест палатки. Вы вырываетесь и исчезаете в темноте прежде, чем загораются лампы, — и не знаете, ${ru.gs(t, 'видел', 'видела')} ли ${ru.gs(t, 'он', 'она')} ваше лицо.</p>`
          )
        : bi(
            `<p>${t.short} wakes as you reach the cot, and fights like an animal. You get away in the dark with the knife still in your hand, and you do not know whether ${t.p} saw your face.</p>`,
            `<p>${ru.c(t)} просыпается, едва вы подходите к койке, и дерётся как зверь. Вы уходите в темноту с ножом в руке — и не знаете, ${ru.gs(t, 'видел', 'видела')} ли ${ru.gs(t, 'он', 'она')} ваше лицо.</p>`
          );
    night.found.push(
      bi(
        `<p>${t.short} comes to breakfast with ${d.means === 'revolver' ? 'a powder burn across one palm' : 'a cut across one hand'}, and tells anyone who will listen that someone came into ${t.pp} tent in the night ${d.means === 'revolver' ? 'and fired at ' + EP.him(t) + ' in the dark' : 'with a knife'}.</p>`,
        `<p>${ru.c(t)} приходит к завтраку ${d.means === 'revolver' ? 'с пороховым ожогом на ладони' : 'с порезанной рукой'} и рассказывает всем, кто готов слушать, что ночью кто-то забрался к ${ru.gs(t, 'нему', 'ней')} в палатку ${d.means === 'revolver' ? `и выстрелил в ${ru.gs(t, 'него', 'неё')} в темноте` : 'с ножом'}.</p>`
      )
    );
    h += hurt(...D.cost.failed);
    S.hurtBy = 'deed'; // (if that wound is the last: game/endings.js)
  }
  const reached = d.outcome === 'killed' || d.outcome === 'failed';
  // someone about at that hour (the more after a shot), or the Watcher who was watching your tent
  const pool = freeChars().filter(o => o.id !== t.id);
  if (pool.length && chance(clamp(D.seen * (reached ? noise : D.quietly))))
    d.seenBy = (night.guard === 'player' && night.watcher && isFree(night.watcher) ? night.watcher : pick(pool)).id;
  if (d.seenBy)
    h += bi(
      '<p>On the way back you pass someone between the tents. Neither of you says a word.</p>',
      '<p>На обратном пути вы проходите мимо кого-то между палатками. Ни один из вас не произносит ни слова.</p>'
    );
  if (reached) {
    d.trace = chance(D.trace); // (a trace of your own: you do not notice it)
    if (d.plant) {
      d.planted = true;
      const clue = TRAITS[d.plant.cat].vals[d.plant.val].clue,
        o = C(d.plant.owner);
      h += bi(
        `<p>You leave ${clue} by the tent flap, as ${o.short} would, for the first who comes to find.</p>`,
        `<p>У полога палатки вы оставляете ${R(clue)} — так, как сделал${ru.gs(o, '', 'а')} бы ${ru.c(o)}: пусть первый, кто придёт, найдёт.</p>`
      );
    }
  }
  // (the cult came for you while you were out: your tent found empty and slashed; or the Watcher by it drove it off, and
  // knows your tent was empty, mostly, and is seen, as at any night's watch: night.seen)
  if (night.youOut === 'guarded') {
    const w = night.watcher,
      seen = chance(RULES.night.seen);
    if (seen) {
      S.revealed[w.id] = 'warden';
      fixMark(w);
      if (!d.knewBy && !d.seenBy) d.seenBy = w.id;
    }
    h += seen
      ? bi(
          `<p>When you get back, ${w.short} is sitting by your tent with a lamp. “Someone came for you,” ${w.p} says, and looks at your empty cot, and then at you. “They went away again.”</p>`,
          `<p>Когда вы возвращаетесь, у вашей палатки с лампой сидит ${ru.c(w)}. «За вами приходили, — говорит ${ru.gs(w, 'он', 'она')} и смотрит на вашу пустую койку, а потом на вас. — Они ушли».</p>`
        )
      : bi(
          '<p>When you get back, the ground outside your tent is scuffed, and a lamp is going away between the tents.</p>',
          '<p>Когда вы возвращаетесь, земля у вашей палатки истоптана, а между палатками удаляется лампа.</p>'
        );
  } else if (night.youOut)
    h += bi(
      '<p>When you get back, your tent has been slashed open from top to bottom and your cot torn apart. Whoever came for you tonight found nobody in it.</p>',
      '<p>Когда вы возвращаетесь, ваша палатка распорота сверху донизу, а койка разломана. Тот, кто приходил за вами этой ночью, никого в ней не застал.</p>'
    );
  emit('deed-done', d.outcome);
  return h;
}

// ---------- the morning after ----------
// What the camp makes of it, by breakfast: whoever knows it was you may say so (caught), hint at it, or keep it to
// themselves, by their trust in you (the cult more readily against you); a trace of yours the camp may link to you; your
// tent found empty the night someone was attacked, and a shot when everyone knows you carry a revolver, are noticed;
// a trace you laid is seen for what it is, or taken for its owner's. Caught, or suspected enough, the camp judges you.
function deedMorning() {
  const d = S.log.deed;
  if (!d || d.day !== S.day - 1 || d.morning) return '';
  d.morning = true;
  const D = RULES.deed,
    t = C(d.id),
    happened = d.outcome === 'killed' || d.outcome === 'failed' || d.outcome === 'watched';
  let h = '';
  const up = n => {
    S.onYou = Math.min(RULES.scale.suspicion, (S.onYou || 0) + n);
  };
  // whoever knows: the one you went for, the Watcher who drove you off, or someone you passed
  const knower = d.knewBy ? C(d.knewBy) : d.seenBy ? C(d.seenBy) : null;
  if (knower && isFree(knower)) {
    const surely = !!d.knewBy, // (they saw your face; a passer-by only saw you about)
      tell = clamp(
        D.tell[Math.max(0, Math.min(3, knower.rapport + 1))] + (knower.role === 'cult' ? D.cultTells : 0) + (surely ? D.sure : 0)
      );
    if (happened && chance(tell)) {
      d.caught = knower.id;
      h += bi(
        `<p class="notice">Before breakfast ${knower.short} stands up in the mess tent and says it in front of everyone: “It was the Doctor. ${surely ? 'I saw your face.' : 'I saw you, between the tents, in the small hours.'}”</p>`,
        `<p class="notice">Перед завтраком ${ru.c(knower)} встаёт в столовой палатке и говорит это при всех: «Это были вы, доктор. ${surely ? 'Я видел' + ru.gs(knower, '', 'а') + ' ваше лицо.' : 'Я видел' + ru.gs(knower, '', 'а') + ' вас между палатками под утро.'}»</p>`
      );
    } else if (chance(D.hint)) {
      d.hinted = knower.id;
      up(happened ? D.onYou.hinted : D.onYou.hintedNothing);
      const hm = C('hamid'),
        asked = knower.id !== hm.id && isFree(hm) ? ['Hamid', 'Хамида'] : ['the cook', 'повара'];
      h += bi(
        `<p class="notice">${knower.short} watches you over breakfast and says nothing. Later you hear ${knower.p} asked ${asked[0]} whether the Doctor sleeps well these nights.</p>`,
        `<p class="notice">${ru.c(knower)} весь завтрак смотрит на вас и молчит. Позже вы узнаёте, что ${ru.gs(knower, 'он спрашивал', 'она спрашивала')} ${asked[1]}, хорошо ли доктор спит в последние ночи.</p>`
      );
    }
  }
  if (happened && d.trace && chance(D.link)) {
    d.linked = true;
    up(D.onYou.linked);
    h += bi(
      `<p class="notice">Someone found a horn button by ${t.short}’s tent. By noon the whole camp has looked at your jacket.</p>`,
      `<p class="notice">У палатки ${ru.c(t, 'g')} кто-то нашёл роговую пуговицу. К полудню весь лагерь уже посмотрел на вашу куртку.</p>`
    );
  }
  if (happened && S.log.attacks.some(a => a.day === d.day && a.how === 'out')) {
    up(D.onYou.out);
    h += bi(
      `<p class="notice">The whole camp knows your tent was empty last night when they came for you. Nobody asks where you were. Everyone wonders.</p>`,
      `<p class="notice">Весь лагерь знает, что прошлой ночью, когда за вами пришли, ваша палатка была пуста. Никто не спрашивает, где вы были. Все гадают.</p>`
    );
  }
  if ((d.outcome === 'killed' || d.outcome === 'failed') && d.means === 'revolver' && chance(D.shot)) up(D.onYou.shot);
  if (d.planted) {
    const owners = freeChars().filter(o => o.traits[d.plant.cat] === d.plant.val && o.id !== t.id);
    const sp = pick(freeChars().filter(o => o.id !== t.id));
    if (sp && chance(D.plantSeen)) {
      d.plantSeen = sp.id;
      if (chance(D.plantLink)) up(D.onYou.plantLink);
      h += bi(
        `<p class="notice">${sp.short} looks for a long time at what was left by ${t.short}’s tent, and says it was put there for someone to find.</p>`,
        `<p class="notice">${ru.c(sp)} долго разглядывает то, что нашли у палатки ${ru.c(t, 'g')}, и говорит, что это подбросили, чтобы кто-нибудь нашёл.</p>`
      );
    } else if (owners.length) {
      const o = owners.find(x => x.id === d.plant.owner) || owners[0]; // (whoever truly has that habit, the one you meant first)
      d.plantTook = o.id;
      h += stir('planted', { about: o.id, at: t.id, cat: d.plant.cat });
    }
  }
  // the cult hears what the camp hears, and guesses at what it does not, whoever it was you went for: once it knows or
  // guesses it was you, it knows what you are (as if you had confided in it)
  if (happened && chance(D.cultKnows * (d.caught || d.hinted || d.linked ? 1 : D.unseen))) S.alerted = true;
  if (d.caught) return h + youVote();
  // (suspected at 2 or more: below that the table's odds are nothing, and no die is thrown)
  if (happened && chance(D.vote[Math.min(3, Math.floor(S.onYou || 0))])) return h + youVote();
  return h;
}
// at a later dawn, a camp that suspects you enough may still sit in judgement on you
function deedDawn() {
  const d = S.log.deed;
  if (!d || !d.morning || d.judged || S.ended) return '';
  return chance(RULES.deed.later * RULES.deed.vote[Math.min(3, Math.floor(S.onYou || 0))]) ? youVote() : '';
}
// The camp sits in judgement on you. Each takes a side (RULES.deed.judge): how sure the camp is it was you (S.onYou,
// and more if someone saw you), a friend of the one you went for (and the one you went for, if alive), less for each
// step of trust in you; the dead so far, the camp's anger, the evening's mood and their own whim; the cult leans on it
// a little (to be rid of you), as it leans at any inquiry. At least need of them, and more than speak for you, and you
// are put on the lorry to Hillah: the season ends (game/verdict.js, handsRaised: with nobody left at the dig, the police
// corporal from Hillah decides, and takes your word, mostly). Otherwise you stay: those who would have sent you away
// trust you the less, mostly (sour), the camp is the angrier, about so far (angered), and suspects you about a step less
// (cleared).
function youVote() {
  const d = S.log.deed,
    J = RULES.deed.judge,
    VR = RULES.verdict,
    crowd = freeChars(),
    cs = (S.onYou || 0) + (d.caught ? J.caught : 0),
    h = handsRaised(
      crowd,
      o =>
        cs +
        (Ties.fond(o.id, d.id) ? J.friend : 0) +
        (o.id === d.id ? J.victim : 0) -
        J.trust * o.rapport +
        VR.fear * Math.min(S.stats.taken, VR.fearCap) +
        VR.anger * (S.anger || 0) +
        (o.role === 'cult' ? J.cult * craft(o).push : 0),
      () => 0,
      J.expel,
      J.keep,
      'against'
    ),
    out = { expel: h.for, keep: h.against, silent: h.silent, passed: h.passed };
  d.judged = S.day;
  d.vote = { expel: out.expel, keep: out.keep, silent: out.silent, passed: out.passed, day: S.day };
  const corporal = !crowd.length; // (nobody left to judge you: handsRaised)
  const hands = corporal
    ? `<p class="notice">${bi(
        'There is nobody left at the dig to sit in judgement on you, and it falls to the police corporal from Hillah to decide. He takes your word for it.',
        'Судить вас на раскопе уже некому, и решать приходится капралу из Хиллы. Он верит вам на слово.'
      )}</p>`
    : `<p class="notice">${bi(
        'The camp sits in judgement on you in the mess tent. ' +
          [
            out.expel.length ? `${nameList(out.expel)} would put you on the lorry to Hillah.` : 'Nobody would put you on the lorry.',
            out.keep.length ? `${nameList(out.keep)} ${out.keep.length > 1 ? 'speak' : 'speaks'} for you.` : '',
            out.silent.length ? `${nameList(out.silent)} ${out.silent.length > 1 ? 'say' : 'says'} nothing.` : ''
          ]
            .filter(Boolean)
            .join(' '),
        'Лагерь собирается в столовой палатке, чтобы решить вашу судьбу. ' +
          [
            out.expel.length ? `Отправить вас грузовиком в Хиллу: ${nameListRu(out.expel)}.` : 'Отправлять вас в Хиллу не хочет никто.',
            out.keep.length ? `За вас: ${nameListRu(out.keep)}.` : '',
            out.silent.length ? `${out.silent.length > 1 ? 'Молчат' : 'Молчит'}: ${nameListRu(out.silent)}.` : ''
          ]
            .filter(Boolean)
            .join(' ')
      )}</p>`;
  if (out.passed) {
    ending('expelled');
    return '';
  }
  // (each who would have sent you away, mostly, if their trust in you can sink any lower)
  const sour = out.expel.map(C).filter(o => o.rapport > RULES.scale.trustMin && chance(RULES.deed.sour));
  sour.forEach(o => Ties.moveTrust(o, -1, 'deed'));
  S.anger = (S.anger || 0) + vary(RULES.deed.angered);
  S.onYou = Math.max(0, (S.onYou || 0) - vary(RULES.deed.cleared));
  return (
    hands +
    (corporal
      ? ''
      : `<p class="notice">${bi('The camp will not send you away. Not today.', 'Лагерь не станет вас отсылать. Не сегодня.')}</p>`) +
    trustNote(
      [],
      sour.map(o => o.id)
    )
  );
}
// the morning after the deed, the camp talks the more readily (people/social.js, socialMorning)
const deedTalk = () => (S.log.deed && S.log.deed.day === S.day - 1 ? RULES.deed.talk : 1);
