// ===================== GOSSIP: what people say of each other, and of you =====================
// One machinery for talk. What the camp says of each other comes in kinds, tried in their order until one has something
// to say (KINDS: the thief's hint, a night in your tent, a flirtation, what someone thinks of you, a temperament, a
// friendship or a feud), each true or not by one model of how true a speaker's word runs (toldTrue, misread), and each
// told on a channel (CHANNELS: at breakfast before everyone, overheard as you go, in conversation with you). What is
// said of you is kept here too: breakfast talk of you (ofYou), and word of what you did to someone (wordOf), which the
// camp has by morning (rumours); both move the trust of those who hear (people/moments.js, Moments.hear), and the
// casebook tells them (told). Whatever is said of someone goes into your casebook as testimony, last, after the dice.
const Gossip = (() => {
  // ---------- the record ----------
  // the talk of you, as each morning had it (S.rumors: { day, kind, by or about, up, down }), and what you did to
  // someone, waiting for the morning (S.pending)
  function deal() {
    S.rumors = [];
    S.pending = [];
  }
  const record = () => S.rumors || [];

  // ---------- how true it is ----------
  // Whether a speaker tells it true: as true as they know it when the talk is heavy (sure); otherwise a die on the
  // truth, at their temperament's gossipTrue less gossip.likeBias a step of how strongly they feel about whom it is
  // about (bias), or, for the kinds that go wrong only now and then, a die on a slip, at how untrue their gossip runs ×
  // the kind's own rate (slip). A temperament and what someone thinks of you are told true at gossipTrue less the bias,
  // a friendship or a feud at gossipTrue; a flirtation is made up (flirt.invent), and a feeling of one's own turned
  // about (talk.feelFalse), at a slip.
  function toldTrue(s, { sure = false, bias = 0, slip = null } = {}) {
    if (sure) return true;
    if (slip != null) return !chance((1 - TP(s).gossipTrue) * slip);
    return chance(TP(s).gossipTrue - RULES.gossip.likeBias * bias);
  }
  // What it comes to when it is not told true: where there is nothing much to tell (real null), now and then something
  // made up (gossip.inventBond); where there is something, now and then turned about (gossip.flipBond); otherwise
  // nothing is said at all (null).
  const misread = (real, invented, turned) =>
    real === null ? (chance(RULES.gossip.inventBond) ? invented() : null) : chance(RULES.gossip.flipBond) ? turned() : null;

  // ---------- a temperament ----------
  // Of someone they feel strongly about, the more readily, either way (people/ties.js, pickByLike); told wrong, as the
  // speaker leans: someone they dislike, or anyone to the suspicious, a bad temper; someone they like, a good one; else
  // any other. Now and then an aside about one they are taken with (flirt.aside), or, hardly ever, about one they are
  // not (flirt.asideFalse): never between the two of the cult.
  function temperGossip(s, g) {
    const t = Ties.pickByLike(s, g.pool, coin() ? -1 : 1),
      l = Ties.likes(s.id, t.id),
      real = temperOf(t),
      v = toldTrue(s, { sure: g.sure, bias: Math.abs(l) })
        ? real
        : pick((l < 0 || temperOf(s) === 'suspicious' ? NEG : l > 0 ? POS : TEMPER_IDS).filter(k => k !== real));
    Record.testify(s.id, t.id, 'temper', v);
    const aside =
      !cultPair(s, t) && (Ties.sweetOn(s.id, t.id) ? chance(RULES.flirt.aside) : Ties.mayFlirt(s, t) && chance(RULES.flirt.asideFalse));
    return { t, text: tellOne('said-' + v, TEMPER_SAID[v])(t) + (aside ? flirtAside(t) : '') };
  }

  // ---------- a friendship or a feud ----------
  // Two of the camp, as the speaker sees them: close (their likings for each other come to gossip.bond or more) or at
  // odds (to −gossip.bond or less); told wrong, now and then made up or turned about (misread), else nothing said.
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
  function bondGossip(s, g) {
    const a = pick(g.pool),
      b = pick(g.pool.filter(o => o.id !== a.id)),
      real = Ties.likes(a.id, b.id) + Ties.likes(b.id, a.id);
    let close = real >= RULES.gossip.bond ? true : real <= -RULES.gossip.bond ? false : null;
    if (!toldTrue(s, { sure: g.sure }))
      close = misread(
        close,
        () => coin(),
        () => !close
      );
    if (close === null) return null; // nothing worth saying
    Record.testify(s.id, a.id, 'bond', (close ? 'close:' : 'feud:') + b.id);
    return { t: a, text: bondSay(a, b, close) };
  }

  // ---------- what someone thinks of you ----------
  // Gossip about what someone else thinks of you (gossip.you of the time it could be told): a strong feeling, for you
  // (trust 2 or more: good) or against you (−1 or less: bad), told true at the speaker's gossipTrue, the less so of
  // someone they feel strongly about (gossip.likeBias); when it is not, misreported, or made up where there is nothing
  // much either way, leaning as the speaker does (kind to a friend, hard on someone they dislike, the suspicious hard
  // on anyone), at the odds gossip about a friendship or a feud has (gossip.flipBond, inventBond). Your casebook's word
  // for their trust always tells the truth: gossip is only as true as the gossip.
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
        bi(
          `${t.short} speaks up for you whenever the others grumble.`,
          `${ru.c(t)} всякий раз заступается за вас, когда остальные ворчат.`
        ),
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
  function thinksGossip(s, g) {
    const t = Ties.pickByLike(s, g.pool, coin() ? -1 : 1),
      l = Ties.likes(s.id, t.id),
      real = Ties.friend(t) ? 'good' : Ties.against(t) ? 'bad' : null;
    let v = real;
    if (!toldTrue(s, { sure: g.sure, bias: Math.abs(l) })) {
      const lean = l > 0 ? 'good' : l < 0 || temperOf(s) === 'suspicious' ? 'bad' : null;
      v = misread(
        real,
        () => lean || pick(['good', 'bad']),
        () => lean || (real === 'good' ? 'bad' : 'good')
      );
    }
    if (!v) return null; // (nothing worth saying)
    Record.testify(s.id, t.id, 'thinks', v);
    return { t, text: tellOne(`thinks-${v}${g.heard ? '-heard' : ''}`, (g.heard ? THINKS_HEARD : THINKS_SAID)[v])(s, t) };
  }

  // ---------- the night someone spent in your tent ----------
  // Gossip about it (gossip.visit), from the morning the camp knows of it (people/visit.js) while she is still at the
  // dig: at odds, × fade for each day after the first. Told badly, as a scandal (she hardly knows the Doctor), or
  // kindly, as the speaker is inclined: badly at bad, + spite a step they dislike her, + jealous if they are sweet on
  // you or on her, + foe a step they are against you, + their temperament's prudery (TEMPERS prude), + vows for a
  // priest; − friend a step they like her, − ally a step they are past fond of you. Whoever hears it may make something
  // of it, once each: of her, and of you (people/moments.js, the scandal).
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
      h =>
        bi(`Let them talk about ${h.short}. Half of them are only jealous.`, `Пусть болтают ${ru.ob(h)}: половина из них просто завидует.`)
    ]
  };
  const TALKED_OF = odds('the camp talks of a night in your tent', [
      ['base', () => RULES.gossip.visit.odds],
      ['* fading, each day after the first', v => RULES.gossip.visit.fade ** Math.max(0, S.day - v.day - 1)]
    ]),
    TOLD_BADLY = odds('a night in your tent, told badly', [
      ['base', () => RULES.gossip.visit.bad],
      ['+ spite, a step they dislike her', (s, h, l) => RULES.gossip.visit.spite * Math.max(0, -l)],
      ['- a friend of hers, a step they like her', (s, h, l) => RULES.gossip.visit.friend * Math.max(0, l)],
      ['+ jealous, sweet on you or on her', (s, h) => (Ties.sweetOnYou(s) || Ties.sweetOn(s.id, h.id) ? RULES.gossip.visit.jealous : 0)],
      ['+ against you, a step', (s, h, l, tr) => RULES.gossip.visit.foe * Math.max(0, -tr)],
      ['- your friend, a step past warm', (s, h, l, tr) => RULES.gossip.visit.ally * Math.max(0, tr - RULES.ties.friend)],
      ['+ prudish by temperament', s => TP(s).prude],
      ['+ a priest', s => (Ties.vowed(s) ? RULES.gossip.visit.vows : 0)],
      ['clamp', () => [RULES.scale.least, RULES.scale.most]]
    ]);
  function visitGossip(s, g) {
    const v = S.log && S.log.visit;
    if (!v || !v.agreed || !v.morning || !S.chars[v.id]) return null;
    const h = C(v.id);
    if (!isFree(h) || h.id === s.id || g.not.includes(h.id) || !TALKED_OF.roll(v)) return null;
    const bad = TOLD_BADLY.roll(s, h, Ties.likes(s.id, h.id), Ties.trust(s)),
      k = bad ? 'bad' : 'kind';
    Record.testify(s.id, h.id, 'scandal', k);
    return {
      t: h,
      text: tellOne(`visit-${k}${g.heard ? '-heard' : ''}`, (g.heard ? VISIT_HEARD : VISIT_SAID)[k])(h),
      hear: { kind: 'scandal', o: { by: s.id, about: h.id, bad } }
    };
  }

  // ---------- the kinds, in the order they are tried ----------
  // Each kind: the odds it is tried at (none: always; nothing: it cannot be), what it says (null: nothing, and the next
  // kind is tried), and whether it is the last tried once it is (last). From what someone thinks of you on, the talk
  // needs someone to be about (pool: anyone but the speaker and those listening, or there is no gossip at all), and a
  // heavy moment's talk is true to what the speaker knows (sure).
  const KINDS = [
    // a thief who saw something hints at it (people/thief.js)
    {
      kind: 'hint',
      odds: (s, g) => (g.seen && !g.not.includes(g.seen.actor) ? RULES.thief.gossip : 0),
      say: (s, g) => thiefGossip(s, g.seen),
      last: true
    },
    // while the camp still talks of it, the night someone spent in your tent
    { kind: 'scandal', say: visitGossip },
    // who is sweet on whom (people/flirt.js)
    { kind: 'flirt', odds: () => RULES.flirt.gossip, say: (s, g) => flirtGossip(s, g.not, g.heard) },
    // what someone thinks of you
    { kind: 'thinks', pool: true, odds: () => RULES.gossip.you, say: thinksGossip },
    // a temperament; or, now and then, with two or more to talk about, a friendship or a feud
    { kind: 'temper', pool: true, odds: (s, g) => (g.pool.length < 2 ? null : RULES.gossip.temper), say: temperGossip, last: true },
    { kind: 'bond', pool: true, say: bondGossip, last: true }
  ];
  // One piece of gossip from s, about anyone but s and those listening (not); it goes into your casebook as testimony.
  // sure: the talk is heavy (it comes seldom in the season's mood, game/tenor.js), and true to what the speaker knows;
  // heard: said to someone else, and overheard. Returns { t: whom it is about, text, hear?: how those who hear it may
  // take it (people/moments.js, a row of its moments, and what it is told with) } or null (nothing worth saying).
  function line(s, not = [], sure = false, heard = false) {
    const g = { not, sure, heard, seen: thiefSaw(s), pool: freeChars().filter(o => o.id !== s.id && !not.includes(o.id)) };
    for (const K of KINDS) {
      if (K.pool && !g.pool.length) return null;
      const p = K.odds ? K.odds(s, g) : null;
      if (p != null && !chance(p)) continue;
      const said = K.say(s, g);
      if (said || K.last) return said || null;
    }
    return null;
  }

  // ---------- where it is told ----------
  // Each channel: who speaks (and to whom it is said, who is not talked of), whether the moment may be a heavy one (the
  // talk then true to what the speaker knows, and the season's talk stirred by it), whether it was said to someone else
  // and overheard, and how it is told.
  const CHANNELS = {
    // at breakfast, before everyone: whoever is in the mood to gossip this morning (each at their temperament's
    // gossip), one of them; those who hear it may take it up (people/moments.js)
    breakfast: {
      speaker: () => {
        const pool = freeChars().filter(c => chance(TP(c).gossip));
        return pool.length ? { s: pick(pool), not: [] } : null;
      },
      weighs: true,
      none: '',
      tell: (g, { s }, heavy) =>
        `<p class="notice">${quoted(bi(`Over breakfast, ${s.short} says of ${g.t.short}: “`, `За завтраком ${ru.c(s)} говорит ${ru.ob(g.t)}: «`), g.text)}</p>` +
        (g.hear ? Moments.stir(g.hear.kind, { ...g.hear.o, heavy, before: true }) : '')
    },
    // overheard as you go about the dig, two or more together: one of them, the readier to gossip the likelier, telling
    // another of them, and only that one hears it, but for you
    overheard: {
      speaker: here => {
        if (here.length < 2) return null;
        const w = {};
        here.forEach(c => {
          w[c.id] = TP(c).gossip;
        });
        const s = C(wpick(w)),
          l = pick(here.filter(o => o.id !== s.id));
        return { s, l, not: [l.id] };
      },
      weighs: true,
      heard: true,
      none: '',
      tell: (g, { s, l }, heavy) =>
        `<p class="notice">${quoted(bi(`As you go, you overhear ${s.short} telling ${l.short}: “`, `Уходя, вы слышите, как ${ru.c(s)} говорит ${ru.c(l, 'd')}: «`), g.text)}</p>` +
        (g.hear ? Moments.stir(g.hear.kind, { ...g.hear.o, heavy, only: [l.id] }) : '')
    },
    // in conversation with you, from one who likes to gossip (people/dialog.js tells it, and nobody else hears it)
    talk: {
      speaker: c => (chance(TP(c).gossip) ? { s: c, not: [] } : null),
      none: null,
      tell: g => g
    }
  };
  function speak(ch, ...args) {
    const K = CHANNELS[ch],
      who = K.speaker(...args);
    if (!who) return K.none;
    const heavy = K.weighs ? weighty('talk') : false,
      g = line(who.s, who.not, heavy, !!K.heard);
    if (!g) return K.none;
    if (K.weighs) stirred('talk');
    return K.tell(g, who, heavy);
  }

  // ---------- what they say of their own feelings ----------
  // A word in passing about someone they feel strongly about: fond of them, cannot stand them, or taken with them. True
  // to their feelings, mostly (now and then a liar's or a light-headed one's word is the opposite of what they feel:
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
      (c, t) =>
        bi(`${t.short} is… good company. That is all I will say.`, `С ${ru.c(t, 'i')}… приятно поговорить. Больше я ничего не скажу.`)
    ]
  };
  // the face that goes with it, if the feeling shows in the face as well as in the words (as readily as a warm word
  // from a friend, a cold one from someone against you, or a flirtatious look: RULES.manner)
  const FEEL_FACE = { like: ['warm', 'smile'], dislike: ['cold', 'neutral'], flirt: ['coy', 'thoughtful'] };
  const feelShows = k => ({ like: RULES.manner.warm[1], dislike: RULES.manner.cold[0], flirt: RULES.manner.flirt })[k];
  function feelRemark(c) {
    const pool = freeChars().filter(o => o.id !== c.id && !cultPair(c, o));
    const taken = pool.filter(o => Ties.sweetOn(c.id, o.id)),
      strong = pool.filter(o => Ties.close(c, o) || Ties.cannotBear(c, o));
    const t = taken.length && chance(RULES.flirt.feel) ? pick(taken) : strong.length ? pick(strong) : null;
    if (!t) return null;
    const own = Ties.sweetOn(c.id, t.id) ? 'flirt' : Ties.fond(c.id, t.id) ? 'like' : 'dislike',
      k = toldTrue(c, { slip: RULES.talk.feelFalse }) ? own : own === 'dislike' ? 'like' : 'dislike';
    Record.testify(c.id, t.id, 'feel', k);
    const face = chance(Math.min(RULES.scale.most, feelShows(k) * showMul(c)))
      ? k === 'flirt'
        ? flirtFace(c)
        : FEEL_FACE[k][0]
      : FEEL_FACE[k][1];
    return { text: pick(FEEL_SAY[k])(c, t), face };
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
  // People talk about you, the more readily the stronger they feel about you, for you or against you as they feel (or,
  // now and then, the other way: flip; the indifferent either way), and their friends listen (at most RULES.camp.cap of
  // them, as at any public moment, though once as many have, the rest are not asked; bad talk a little more readily
  // than good, and any talk more readily when it is heavy); a calculating cultist talks you down on purpose, whatever
  // face it shows you.
  const HEARS_TALK_OF_YOU = odds('hears talk of you', [
    ['base', bad => (bad ? RULES.rumours.listenBad : RULES.rumours.listenGood)],
    ['* heavy talk', (bad, heavy) => (heavy ? RULES.camp.heavy : 1)],
    ['cap', () => RULES.scale.most]
  ]);
  function ofYou() {
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
      said = pick(GOSSIP_YOU[bad ? 'bad' : 'good']),
      heard = Moments.hear(
        freeChars().filter(o => o.id !== s.id && Ties.fond(o.id, s.id)),
        () => ['trust', null, bad ? -1 : 1, HEARS_TALK_OF_YOU],
        { cap: RULES.camp.cap, rollWhenFull: false, args: () => [bad, heavy] }
      ).moved,
      moved = heard.length ? heard[0][3] : [];
    S.rumors.push({ day: S.day, kind: bad ? 'bad' : 'good', by: s.id, up: bad ? [] : moved, down: bad ? moved : [] });
    return (
      `<p class="notice">${bi(`Over breakfast you catch ${s.short} talking about you: “${said[0]}”`, `За завтраком вы слышите, как ${ru.c(s)} говорит о вас: «${said[1]}»`)}</p>` +
      (bad ? trustNote([], moved) : trustNote(moved, []))
    );
  }
  // What you do to one person, their friends and enemies have heard by morning (the same deed to the same person,
  // once).
  function wordOf(c, kind, strength = 1) {
    if (S.pending && !S.pending.some(r => r.kind === kind && r.about === c.id)) S.pending.push({ day: S.day, kind, about: c.id, strength });
  }
  const DEED_SAID = {
    pressed: c => [`that you pressed ${c.short} hard`, `что вы крепко надавили на ${ru.c(c, 'a')}`],
    confided: c => [`that you have taken ${c.short} into your confidence`, `что вы доверились ${ru.c(c, 'd')}`],
    visited: c => [`that ${c.short} spent the night in your tent`, `что ${ru.c(c)} провела ночь в вашей палатке`],
    diedInTent: c => [`that ${c.short} died in your tent`, `что ${ru.c(c)} умерла в вашей палатке`],
    turnedAway: c => [`that you would not let ${c.short} into your tent`, `что вы не пустили ${ru.c(c, 'a')} к себе в палатку`]
  };
  // how a deed done to someone moves each of the camp who hears of it (o: the one hearing; l: their liking for c; k:
  // how hard it is talked of)
  function deedMoves(kind, o, c, l, k = 1) {
    const U = RULES.rumours;
    // a death in your tent: her friends, and now and then anyone, think the less of you for it, the harder it is talked
    // of
    if (kind === 'diedInTent') return chance(Math.min(RULES.scale.most, k * (Math.max(0, l) * U.visitFriend + U.diedAny))) ? -1 : 0;
    if (kind === 'pressed') return l >= 1 && chance(U.pressFriend * l) ? -1 : l <= -1 && chance(U.pressFoe) ? 1 : 0;
    if (kind === 'confided') return l >= 1 && chance(U.confideFriend * l) ? 1 : 0;
    // a night in your tent: a friend of hers takes it well or badly, as it falls; one taken with her, badly (rival); a
    // woman turned away: her friends think the less of you for it
    if (kind === 'visited')
      return Ties.sweetOn(o.id, c.id) && chance(U.rival) ? -1 : l >= 1 && chance(U.visitFriend * l) ? pick([-1, 1]) : 0;
    return l >= 1 && chance(U.visitFriend * l) ? -1 : 0;
  }
  function rumours() {
    if (!S.pending || !S.pending.length) return '';
    const net = {},
      said = [];
    S.pending.slice(0, RULES.rumours.told).forEach(r => {
      const c = C(r.about),
        up = [],
        down = [];
      Moments.hear(
        freeChars().filter(o => o.id !== c.id),
        o => {
          const d = deedMoves(r.kind, o, c, Ties.likes(o.id, c.id), r.strength || 1); // (decided by its own dice)
          return d ? ['trust', null, d, null] : null;
        }
      ).steps.forEach(([id, , , d]) => {
        (d > 0 ? up : down).push(id);
        net[id] = (net[id] || 0) + d;
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
  // a piece of the talk of you, as the casebook tells it (ui/book.js)
  const told = r =>
    r.by
      ? r.kind === 'bad'
        ? bi(
            `${C(r.by).short} spoke against you at breakfast`,
            `${ru.c(r.by)} ${ru.gs(r.by, 'говорил', 'говорила')} о вас дурно за завтраком`
          )
        : bi(`${C(r.by).short} spoke well of you at breakfast`, `${ru.c(r.by)} ${ru.gs(r.by, 'хвалил', 'хвалила')} вас за завтраком`)
      : (([en, rus]) => bi(`Word got round ${en}`, `По лагерю разошлось, ${rus}`))(DEED_SAID[r.kind](C(r.about)));

  return { deal, record, toldTrue, misread, kinds: KINDS, line, speak, feelRemark, ofYou, wordOf, rumours, told };
})();
