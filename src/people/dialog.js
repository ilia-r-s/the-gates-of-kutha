// ===================== WHAT YOU CAN SAY, AND WHAT THEY ANSWER =====================
// Each option is { label(c), sub(c), off(c)?, run(c, arg?) }; run returns the exchange: what you say (you, youE), what
// is set on the table (pre), the answer (them, themE) and what you notice (note).
// pressing works better on people who trust you: they would rather tell you than lose you
function pressP(c) {
  const t = RULES.talk;
  return clamp(t.press + (S.bg === 'soldier' ? t.pressSoldier : 0) + (c ? t.pressTrust * c.rapport : 0));
}
// what you can set on the table: every charm you carry, the bowl, and clay or copied lines
function showables() {
  const a = S.items
    .filter(x => CHARMS.includes(x))
    .map(x => ({ id: x, name: theItem(x), sub: bi('An old charm from the tell', 'Древний амулет с холма') }));
  if (has('bowl'))
    a.push({ id: 'bowl', name: theItem('bowl'), sub: bi('Aramaic, far younger than the rest', 'Арамейская, куда моложе прочих находок') });
  if (S.fragments)
    a.push({
      id: 'frag',
      name: 'an untranslated tablet fragment',
      rn: ['непереведённый обломок таблички', 'непереведённый обломок таблички'],
      sub: bi('Clay no one has read yet', 'Глина, которую ещё никто не прочёл')
    });
  else if (S.factKnown.length)
    a.push({
      id: 'line',
      name: 'a line you copied from the tablets',
      rn: ['строка, переписанная с табличек', 'строку, переписанную с табличек'],
      sub: bi('From your notebook', 'Из вашей записной книжки')
    });
  return a;
}
const showRu = (t, k) => (t.rn ? t.rn[k === 'a' ? 1 : 0] : ru.item(t.id, k));
const SCHOLARS = ['anselm', 'ilse'];
function canShow() {
  return showables().length > 0;
}
// ---------- making conversation ----------
// Anyone may have a bad day and keep it short, or refuse a favour, though they bear you no ill will (talk.offDay, as
// far as it shows: showMul; the less with a friend: offDayFriend).
const offDay = c => chance(RULES.talk.offDay * showMul(c) * (c.rapport >= 1 ? RULES.talk.offDayFriend : 1));
function curtTalk(c, hostile = true) {
  const k = tellOne('curtSay', [0, 1]);
  return {
    you: bi(...tellOne('smallTalk', SAY.smallTalk)),
    youE: 'smile',
    them: bi(
      ['I have work to do, Doctor.', 'Ask someone who likes talking.'][k],
      ['У меня работа, доктор.', 'Спросите кого-нибудь, кто любит поговорить.'][k]
    ),
    themE: 'stern',
    note: bi(...tellOne(hostile ? 'curtHostile' : 'curtOff', SAY.curt[hostile ? 'hostile' : 'off'])(c)),
    cool: true // (ui/talk.js: no 'in no hurry today' after this)
  };
}
// what you learn as you talk: one of their habits you did not know yet, mostly (talk.habit), then a glimpse of their manner; then, with
// someone who mourns the night's dead, the comfort of your company, or else perhaps warmer terms (as readily from the
// cult as from anyone, but a little more readily to an occultist: cultOf); and a friend's company may steady you a little
function talkNotes(c, ...said) {
  const habit = unknownCats(c).length && chance(RULES.talk.habit) ? reveal(c) : null,
    m = mienNote(c),
    friend = c.rapport >= 2,
    comfort = consoled(c),
    w = !comfort && chance(TP(c).chat + RULES.talk.warmth + cultOf(c, 'charm')) && nudge(c, 1),
    steady = friend && chance(RULES.talk.company) && regain(1);
  return [
    habit,
    ...said,
    m,
    comfort,
    w ? bi(...tellOne('warmer', SAY.warmer)) : null,
    steady ? bi(`Talking with ${c.short} steadies you a little.`, `Разговор с ${ru.c(c, 'i')} немного успокаивает вас.`) : null
  ]
    .filter(Boolean)
    .join(' ');
}
// a line from the tablets they are reading, if there is one you have not heard (one of the cult shares none about the
// power below or its ward, but for a slip: readings.cultSlip)
function scholarTalk(c) {
  const l = learnFact(undefined, undefined, c.role === 'cult' && !chance(RULES.readings.cultSlip));
  if (l == null) return null;
  const k = tellOne('scholarSay', [0, 1, 2]);
  const note = talkNotes(c, bi(...tellOne('copyLine', SAY.copyLine)));
  return {
    you: bi(...tellOne('askReading', SAY.askReading)),
    youE: 'neutral',
    them:
      bi(
        [
          'Listen to this one. It came out of Trench B yesterday:',
          'I copied this line this morning. It is very strange:',
          'Here, you will like this. A late copy, but clear:'
        ][k],
        [
          'Послушайте вот это. Вчера из траншеи Б:',
          `Сегодня утром ${ru.gs(c, 'переписал', 'переписала')} эту строку. Очень странная:`,
          'Вот, вам понравится. Поздний список, но чёткий:'
        ][k]
      ) +
      ' ' +
      bi('‘', '„') +
      S.facts[l].text +
      bi('’', '“'),
    themE: 'thoughtful',
    note
  };
}
// Small talk. The talkative pass on what they think of the others, true or not; or let slip how they feel about
// someone; the one who did it, talking idly, may say too much; and a flirtatious joke is told with a sly face, mostly.
function smallTalk(c) {
  const line = tellOne('small-' + c.id, SMALLTALK[c.id]);
  let them = bi(line);
  const g = chance(TP(c).gossip) ? gossipLine(c) : null;
  if (g) them += ' ' + bi('Between ourselves: ', 'Между нами: ') + g.text;
  const fr = !g && chance(RULES.talk.feel * talkSoft()) ? feelRemark(c) : null;
  if (fr) them += ' ' + fr.text;
  const slip = blurt(c, S.day - 1, 0.5);
  const themE = fr ? fr.face : JOKES.has(line) && chance(RULES.manner.joke) ? jokeFace(c) : pick(['smile', 'neutral', 'thoughtful']);
  return {
    you: bi(...tellOne('smallTalk', SAY.smallTalk)),
    youE: 'smile',
    them,
    themE,
    note: talkNotes(c, slip) || null
  };
}
// ---------- what you can say ----------
const DIALOG = {
  about: {
    label: () => bi('Make conversation', 'Завести разговор'),
    sub: () => bi('Their work, their habits', 'О работе, о привычках'),
    run(c) {
      // someone who has turned against you keeps it short, and gives nothing away: if they let it show
      if (c.rapport <= -1 && chance(RULES.talk.cold * showMul(c))) return curtTalk(c);
      if (c.rapport > -1 && offDay(c)) return curtTalk(c, false);
      // the two scholars are reading tablets too, and like to share a good line
      return (SCHOLARS.includes(c.id) && chance(RULES.talk.scholarLine) && scholarTalk(c)) || smallTalk(c);
    }
  },
  night: {
    label: () =>
      S.day === 1
        ? bi('Ask where they were the night Crane died', 'Спросить про ночь, когда погиб Крейн')
        : bi('Ask where they were last night', 'Спросить про прошлую ночь'),
    sub: c => bi('Their account, and anything they saw', ru.gs(c, 'Где был, с кем, что заметил', 'Где была, с кем, что заметила')),
    off: c => S.claims.some(x => x.night === S.day - 1 && x.id === c.id),
    run(c) {
      const n = S.day - 1,
        rec = S.nights[n],
        cl = rec && rec.claim[c.id] ? rec.claim[c.id] : { loc: 'camp', with: null };
      S.claims.push({ night: n, id: c.id, loc: cl.loc, with: cl.with, attacked: !!cl.attacked });
      let note = null,
        seen = '';
      const sw = rec && rec.saw[c.id],
        told = S.sights.some(x => x.night === n && x.id === c.id); // a friend may have told you before breakfast
      const slip = blurt(c, n); // the one who did it may let slip what only they could know
      if (sw && S.chars[sw.who] && !told) {
        // someone who has turned against you keeps what they saw to themself, though not well
        if (c.rapport <= -1 ? chance(RULES.talk.withhold) : offDay(c))
          note = bi(
            `${c.short} answers, and you have the feeling ${c.p} saw more than ${c.p} says.`,
            `${ru.c(c)} отвечает, но вам кажется, что ${ru.gs(c, 'он видел', 'она видела')} больше, чем говорит.`
          );
        else {
          S.sights.push({ night: n, id: c.id, where: sw.where, cat: sw.cat, val: sawVal(sw) });
          seen = ' ' + sightLine(cl, sw, c);
        }
      }
      const them = alibiLine(cl, c, !!sw) + seen; // (one who saw something, told or kept back, did not sleep through it)
      if (slip) note = note ? note + ' ' + slip : slip;
      let you;
      if (n === 0) you = bi(...tellOne('askCrane', SAY.askCrane));
      else you = bi(...tellOne('askNight', SAY.askNight));
      return { you, youE: 'neutral', them, themE: pick(['thoughtful', 'neutral']), note };
    }
  },
  show: {
    label: c => {
      const th = showables();
      return th.length === 1
        ? bi(`Show ${c.short} ${th[0].name}`, `Показать ${ru.c(c, 'd')} ${showRu(th[0], 'a')}`)
        : bi(`Show ${c.short} something`, `Показать ${ru.c(c, 'd')} что-нибудь`);
    },
    sub: c =>
      SCHOLARS.includes(c.id)
        ? bi('A scholar can read what a charm was made against', 'Учёный прочтёт, против кого сделан амулет')
        : bi('Watch how they take it', 'Посмотреть, как это примут'),
    off: () => !canShow(),
    run(c, id) {
      const th = showables(),
        t = th.find(x => x.id === id) || th[0],
        fear = TP(c).fear;
      // the cult fears the old charms, some cultists better hidden than others; the jumpy flinch at anything; the thief eyes
      // them like a dealer, and now and then so does anyone (talk.greedOther, twice as readily the liar and the calculating)
      const greedy = chance(
          c.role === 'smuggler' ? RULES.talk.greed : RULES.talk.greedOther * (['liar', 'calculating'].includes(temperOf(c)) ? 2 : 1)
        ),
        r = greedy ? 'greed' : chance(fear[c.role === 'cult' ? 0 : 1]) ? 'fear' : 'calm';
      // (a line from your notebook is not a thing to handle: words, not relics)
      const words = t.id === 'line';
      addTest(c.id, c.id, words ? 'words' : 'react', r);
      let them = bi(tellOne('react-' + (words ? 'words-' : '') + r, (words ? REACT_WORDS_SAY : REACT_SAY)[r])),
        cool = false;
      if (CHARMS.includes(t.id) && SCHOLARS.includes(c.id)) {
        if (c.rapport <= -1 ? chance(RULES.talk.refuse) : offDay(c)) {
          cool = true;
          them +=
            ' ' +
            bi(
              'And I am not here to read your trinkets for you, Doctor.',
              `И читать ваши безделушки я не ${ru.gs(c, 'нанимался', 'нанималась')}, доктор.`
            );
        } else {
          const fresh = !S.readings[c.id + ':' + t.id], // a charm shown again is read as before, and noted once
            rd = scholarRead(c, t.id);
          them += ' ' + readingSay(rd);
          if (fresh) {
            S.log.readings++;
            journal(readingNote(rd));
          }
        }
      }
      const tn = pick((words ? REACT_WORDS_NOTE : REACT_NOTE)[r]),
        many = !!(ITEMS[t.id] && ITEMS[t.id].plural);
      return {
        you: bi(...tellOne('askShow', SAY.askShow)),
        youE: 'neutral',
        pre: bi(`You set ${t.name} on the table between you.`, `Вы кладёте на стол ${showRu(t, 'a')}.`),
        them,
        themE: r === 'fear' ? 'uneasy' : r === 'greed' ? 'smile' : 'thoughtful',
        note: bi(fmt(tn, { ...P(c), it: many ? 'them' : 'it', they: many ? 'they' : 'it' }), fmtR(R(tn), { n: c })),
        cool
      };
    }
  },
  confide: {
    label: () => bi('Confide your suspicions', 'Поделиться подозрениями'),
    sub: () => bi('Trust, both ways. Risky if you are wrong', 'Доверие за доверие. Опасно, если вы ошиблись'),
    run(c) {
      const you = bi(...tellOne('confide', SAY.confide));
      if (c.role === 'cult' && chance(RULES.confide.alerts)) S.alerted = true;
      // not everyone wants your confidence: it depends how they feel about you, and who they are
      if (!chance(confideP(c))) {
        if (temperOf(c) === 'suspicious' && chance(RULES.talk.sourConfide)) nudge(c, -1);
        const k = tellOne('confideNo', [0, 1]);
        return {
          you,
          youE: 'grave',
          them: bi(
            ['I would be careful whom you tell that to, Doctor.', 'That is a great deal to put on a stranger, Doctor.'][k],
            ['Будьте осторожнее с тем, кому вы это рассказываете, доктор.', 'Слишком многое вы взваливаете на чужого человека, доктор.'][k]
          ),
          themE: 'stern',
          note: bi(...tellOne('nothingBack', SAY.nothingBack)(c))
        };
      }
      trustUp(c);
      S.confided[c.id] = (S.confided[c.id] || 0) + 1;
      if (!S.confidedIn.includes(c.id)) S.confidedIn.push(c.id);
      ripple(c, 'confided');
      const tc = tellOne('confideSay', CONFIDE_SAY);
      let them = bi(tc, fmtR(R(tc), { s: c }));
      // what they offer follows what they claim to be, true or not
      const cl = claimOf(c),
        rc = recantTrust(c);
      // (a promise, mostly: talk.promise; now and then a Watcher keeps it general)
      if (rc) them += ' ' + rc;
      else if (c.rapport >= 2 && cl.role === 'warden') {
        sayClaim(c);
        if (chance(RULES.talk.promise)) {
          them += bi(
            ' Leave your lamp burning tonight. I will be watching your tent.',
            ' Не гасите сегодня лампу. Я присмотрю за вашей палаткой.'
          );
          if (c.role === 'warden') {
            S.guardPromise = c.id;
          } else if (c.role === 'cult') S.falseGuard = c.id;
          else S.fakeGuard = c.id;
        } else
          them += bi(
            ' I watch the whole camp at night, Doctor, not one tent.',
            ' Ночью я присматриваю за всем лагерем, доктор, а не за одной палаткой.'
          );
      }
      if (!rc && !c.promised && c.rapport >= 1 && cl.role === 'seer' && chance(RULES.talk.promise)) {
        c.promised = true;
        sayClaim(c);
        them += bi(
          ' I should tell you: I dream, and I have always dreamed true. If I see anything, you will hear it first.',
          ' Скажу вам одно: мне снятся сны, и они всегда сбываются. Если я что-то увижу, вы узнаете об этом раньше всех.'
        );
      }
      return { you, youE: 'grave', them, themE: 'grave' };
    }
  },
  press: {
    label: c => bi('Press them', ru.gs(c, 'Надавить на него', 'Надавить на неё')),
    sub: () => bi('Shake something loose · costs trust', 'Вдруг что-то всплывёт · подорвёт доверие'),
    run(c) {
      const ok = chance(pressP(c)),
        you = bi(...tellOne('askPress', SAY.askPress));
      ripple(c, 'pressed');
      if (!S.log.pressedWho.includes(c.id)) S.log.pressedWho.push(c.id);
      const before = c.rapport;
      if (chance(RULES.talk.pressCost)) trustDown(c); // it costs trust, whoever they are and whatever comes of it, mostly
      // a story broken may be given up: a part claimed that is not theirs (the cult's as anyone's, in the same words), or
      // a true part hidden (people/claims.js, recantPressed); the thief's is given up with his trade (below)
      const rp = ok && c.role !== 'smuggler' && recantPressed(c);
      if (rp)
        return {
          you,
          youE: 'stern',
          them: rp,
          themE: 'uneasy',
          note: bi(`${c.short} has the grace to look ashamed.`, `${ru.c(c, 'd')} хватает совести смутиться.`)
        };
      if (c.role === 'cult') return pressedCult(c, ok, you, before);
      // shaken, an innocent may say something that sounds just like the cult's own words: fear, not guilt (talk.falseSlip;
      // the thief, with more to hide, the more readily)
      if (ok && chance(c.role === 'smuggler' ? RULES.talk.falseSlipThief : RULES.talk.falseSlip)) return slipOut(c, you);
      if (c.role === 'smuggler' && ok) {
        addTest(c.id, c.id, 'thief', 'thief');
        S.revealed[c.id] = 'smuggler';
        fixMark(c);
        const cover = recantPressed(c), // (a watch that was his cover, given up with it, mostly)
          named = chance(RULES.thief.pressed) ? thiefNames(c) : ''; // his story broken, he names the one he saw, mostly
        return {
          you,
          youE: 'stern',
          them:
            bi(
              'Fine. A few tablets went to Baghdad. Business. Not this. I swear it.',
              `Ладно. Несколько табличек ушли в Багдад. Дело есть дело. Но к этому я ${ru.gs(c, 'непричастен', 'непричастна')}, клянусь.`
            ) +
            (cover ? ' ' + cover : '') +
            (named ? ' ' + named : ''),
          themE: named ? 'uneasy' : 'grave'
        };
      }
      if (ok) {
        // nothing of their own to give up: someone else's secret, now and then
        const smug = unknownThief(c);
        if (smug && chance(RULES.talk.pressTip)) return turnAside(c, you, smug);
      }
      return rebuff(c, you, before);
    }
  }
};
// One of the cult, pressed: shaken, it may let something slip; the cleverer turn it aside: a true word about the thief,
// if there is one to give (as anyone with nothing of their own to give up may, now and then), or else the same
// indignation anyone would show (and, now and then, the cult takes note).
function pressedCult(c, ok, you, before) {
  if (ok && chance(TP(c).slip)) return slipOut(c, you);
  const smug = ok && chance(RULES.talk.cultTip) && unknownThief(c); // (mostly, when there is a thief to give)
  if (smug) {
    S.log.cultTruth++;
    return turnAside(c, you, smug);
  }
  if (chance(RULES.talk.pressAlerts)) S.alerted = true;
  return rebuff(c, you, before);
}
// something let slip, pressed hard: the cult's own words, or, from anyone else, words that sound just like them
function slipOut(c, you) {
  addTest(c.id, c.id, 'slip', 'cult');
  const k = pick([0, 1]);
  return {
    you,
    youE: 'stern',
    them: bi(
      ['We only took what was owed to the—', 'You don’t understand what is coming. None of us will need—'][k],
      ['Мы взяли лишь то, что причиталось Тому, кто —', 'Вы не понимаете, что грядёт. Никому из нас уже не понадобится —'][k]
    ),
    themE: 'surprised',
    note: bi(
      `${c.short} stops mid-sentence and looks at you very steadily.`,
      `${ru.c(c)} обрывает фразу на полуслове и смотрит на вас очень пристально.`
    )
  };
}
// the thief, while nobody knows him for one (anyone but c)
const unknownThief = c => freeChars().find(o => o.role === 'smuggler' && o.id !== c.id && S.revealed[o.id] !== 'smuggler');
// whom a word about the thief names: him, as a rule; now and then someone else seen out at night (talk.tipWrong)
function tipped(c, smug) {
  const pool = freeChars().filter(o => o.id !== c.id && o.id !== smug.id);
  return pool.length && chance(RULES.talk.tipWrong) ? pick(pool) : smug;
}
// a press turned aside with a word about the thief
function turnAside(c, you, smug) {
  smug = tipped(c, smug);
  addTest(c.id, smug.id, 'tip', 'thief');
  return {
    you,
    youE: 'stern',
    them: tipLine(smug),
    themE: 'neutral',
    note: bi(
      `${c.short} answers smoothly, and you notice the answer is about somebody else.`,
      `${ru.c(c)} отвечает гладко — и вы замечаете, что ответ касается кого-то другого.`
    )
  };
}
// Pressed for nothing, or by someone with nothing they will give up: the same rebuff, from the innocent and the cult alike.
const PRESS_REBUFF = [
  () => ['How dare you.', 'Да как вы смеете.'],
  () => ['I liked Crane. Remember that before you ask me again.', 'Мне нравился Крейн. Вспомните об этом, прежде чем спрашивать снова.'],
  c => ['I have told you what I know, Doctor.', `Я ${ru.gs(c, 'рассказал', 'рассказала')} вам всё, что знаю, доктор.`],
  () => [
    'Ask me again in that tone, Doctor, and you can dig your own trench.',
    'Спросите ещё раз таким тоном, доктор, — и будете копать свою траншею сами.'
  ]
];
// (before: their trust in you before you pressed them; at the lowest already, there was none left to lose; otherwise,
// now and then, they let it pass)
function rebuff(c, you, before) {
  const [en, rus] = tellOne('rebuff', PRESS_REBUFF)(c);
  return {
    you,
    youE: 'stern',
    them: bi(en, rus),
    themE: 'stern',
    cool: true,
    note:
      before > c.rapport
        ? bi(...tellOne('thinner', SAY.thinner))
        : c.rapport <= RULES.scale.trustMin
          ? bi('There was no trust left between you to lose.', 'Терять между вами уже нечего.')
          : bi(
              'Somehow it does not seem to have cost you anything between you. This time.',
              'Как ни странно, на ваших отношениях это, кажется, не сказалось. На этот раз.'
            )
  };
}
DIALOG.distrust = {
  label: () => bi('Ask whom they distrust', 'Спросить, кому здесь нельзя верить'),
  sub: () => bi('Their suspicions, or their dreams', 'Подозрения — или сны'),
  run(c) {
    const others = freeChars().filter(o => o.id !== c.id),
      you = bi(...tellOne('distrust', SAY.distrust));
    const say = (them, themE = 'stern') => ({ you, youE: 'neutral', them, themE });
    if (!others.length) return say(bi('There is nobody left to distrust.', 'Не доверять больше некому.'), 'grave');
    // some will not say: not to you (one turned against you, mostly; anyone on a bad day, now and then: offDay)
    if (c.rapport <= -1 ? chance(RULES.talk.hostileSilence) : offDay(c))
      return {
        ...say(
          bi(
            'If there were, I would not tell you, Doctor.',
            `Будь здесь такой человек — вам бы я не ${ru.gs(c, 'сказал', 'сказала')}, доктор.`
          )
        ),
        cool: true
      };
    // dreams first: the true Dreamer, those who pretend to dream, and the cult's false Dreamer
    const d = dreamToTell(c);
    if (d)
      return say(bi('I dreamt of the seven gates. ' + dreamEn(d.t, d.cult), 'Мне снились семь врат. ' + dreamRu(d.t, d.cult)), 'grave');
    // the thief who saw something will not say so, but hints at it; now and then he names them outright
    const w = thiefSaw(c);
    if (w && chance(RULES.thief.outright))
      return say(thiefNames(c, ['You want to know whom I distrust? Very well. ', 'Хотите знать, кому я не доверяю? Хорошо. ']), 'uneasy');
    if (w && chance(RULES.thief.hint)) {
      const h = thiefHint(c, w);
      return { ...say(h.them, 'uneasy'), note: h.note };
    }
    // or not without proof, or not about people at all (the detached mostly put it so)
    const proof = () =>
      say(
        bi('I will not put a name to it without proof, Doctor. I am sorry.', 'Без доказательств я никого не назову, доктор. Простите.'),
        'neutral'
      );
    if (chance(TP(c).decline))
      return (temperOf(c) === 'detached') === chance(RULES.talk.ownWay)
        ? say(bi('I do not watch other people. I find them tiring.', 'Я не слежу за другими людьми. Они меня утомляют.'), 'neutral')
        : proof();
    const b = whomToBlame(c, others);
    if (b.tip) {
      const t = tipped(c, b.tip);
      addTest(c.id, t.id, 'tip', 'thief');
      return say(tipLine(t), 'neutral');
    }
    if (!b.target) return proof();
    addTest(c.id, b.target.id, 'distrust', 'cult');
    // (the honest mostly keep to what they have seen; anyone may put it vaguely)
    const td = pick(
      (temperOf(c) === 'honest') === chance(RULES.talk.ownWay) ? T.distrustVague : T.distrust.concat(T.distrustVague.slice(0, 2))
    );
    return say(
      bi(fmt(td, { t: b.target.short, tpp: b.target.pp }).replace(/^“|”$/g, ''), fmtR(R(td), { t: b.target, s: c })),
      likes(c.id, b.target.id) <= -1 ? 'cold' : 'stern'
    );
  }
};
// A dream to answer with, if they dream or say they do (people/claims.js): the true Dreamer's latest, mostly
// (talk.dreamTell); anyone's who only says they dream, the cult's as any pretender's, now and then (talk.dreamAnswer).
function dreamToTell(c) {
  if (c.role === 'seer' && claimOf(c).role === 'seer') return chance(RULES.talk.dreamTell) ? trueDream(c) : null;
  const d = claimsToDream(c) && chance(RULES.talk.dreamAnswer) ? madeUpDream(c) : null;
  return d && tellDream(c, d);
}
// Whom they name, asked whom they distrust: { tip: the thief, named for what he is }, { target }, or {} (not without
// proof). The cult points away from itself: at the thief (a true word that costs it nothing), at whoever suspects it,
// or at someone it dislikes; an honest cultist hardly ever names an innocent (its frame); and no cultist names another,
// unless the other already looks lost and it is ruthless enough to let it go down (cunning.bus × its sacrifice). The
// innocent name whom they suspect most, if they suspect anyone in earnest; or a real cultist now and then, as their
// temperament allows; otherwise whomever they dislike, hardly ever a fond friend. The thief who saw who did it mostly only hints at
// them (people/thief.js, and the distrust answer above).
function whomToBlame(c, others) {
  const seen = thiefSaw(c);
  if (seen) others = others.filter(o => o.id !== seen.actor);
  const k = temperOf(c),
    tp = TP(c),
    inno = others.filter(o => o.role !== 'cult'),
    smug = others.find(o => o.role === 'smuggler' && S.revealed[o.id] !== 'smuggler');
  if (c.role === 'cult') {
    if (smug && chance(k === 'honest' ? RULES.talk.honestCultTip : tp.strategic)) {
      S.log.cultTruth++;
      return { tip: smug };
    }
    const mate = busFor(c, others);
    if (mate) return { target: mate };
    if (!chance(tp.frame) || !inno.length) return {};
    const accusers = inno.filter(
      o =>
        sus(o.id, c.id) >= 2 ||
        S.testimony.some(
          t => t.from === o.id && t.about === c.id && (t.kind === 'distrust' || (t.kind === 'vision' && t.verdict === 'cult'))
        )
    );
    return { target: k === 'calculating' && accusers.length ? pick(accusers) : pickByLike(c, inno, -1) };
  }
  if (smug && (k === 'honest' || k === 'conscientious') && chance(RULES.talk.honestTip)) return { tip: smug };
  return { target: innocentBlames(c, others) };
}
// the other of the cult, let go down to save the rest (the bus): only once it looks lost, and only by one ruthless
// enough (cunning.bus × its craft's sacrifice); recorded for the ending
function busFor(c, others) {
  const mate = others.find(o => o.role === 'cult' && o.id !== c.id);
  if (!mate || !looksLost(mate) || !chance(RULES.cunning.bus * craft(c).sacrifice)) return null;
  S.log.bus.push({ day: S.day, by: c.id, about: mate.id });
  return mate;
}
// whom one outside the cult blames, of others (asked, or aloud at breakfast): whom they suspect most, if anyone in
// earnest; or a real cultist now and then, as their temperament allows (the smuggler, out at night, a little more
// readily); otherwise whomever they dislike most; a fond friend only on the strongest suspicion, or hardly ever (rarest)
function innocentBlames(c, others) {
  const top = mostSuspected(c, others),
    notFriends = others.filter(o => likes(c.id, o.id) < 2),
    cultNotFriends = notFriends.filter(o => o.role === 'cult');
  if (top && chance(RULES.talk.nameSuspect)) return top;
  if (cultNotFriends.length && chance(TP(c).blameAcc + (c.role === 'smuggler' ? RULES.talk.smugglerSight : 0))) return pick(cultNotFriends);
  const pool = chance(RULES.scale.rarest) ? others : notFriends; // (hardly ever, out of sorts, even a fond friend)
  return pool.length ? pickByLike(c, pool, -1) : null;
}
DIALOG.title = {
  label: () => bi('Ask what an old title means', 'Спросить, что значит древний титул'),
  sub: () => bi('They know the names behind the titles. Unless they lie', 'Они знают, чьи это титулы. Если не лгут'),
  off: c => !GLOSSERS.includes(c.id) || !titlesToAsk(c).length,
  run(c, e) {
    e = e || titlesToAsk(c)[0];
    const you = bi(
      `What does ‘${ttEn(e)}’ mean? The title keeps turning up in the tablets.`,
      `Что значит „${ttRu(e)}“? Этот титул всё время попадается в табличках.`
    );
    const hostile = c.rapport <= -1;
    if (hostile ? chance(RULES.talk.refuse) : offDay(c)) {
      return {
        you,
        youE: 'neutral',
        them: bi('Look it up yourself, Doctor. I am not your dictionary.', 'Посмотрите сами, доктор. Я вам не словарь.'),
        themE: 'stern',
        cool: true,
        note: hostile
          ? bi('Between the two of you, trust is too thin for favours.', 'Между вами слишком мало доверия для одолжений.')
          : bi('It is not a good day to ask favours of anyone.', 'Сегодня не тот день, чтобы просить кого-то об одолжении.')
      };
    }
    const gl = glossBy(c, e),
      G = GODS[gl.g].name,
      Gr = k => ru.god(gl.g, k),
      Title = capS(ttEn(e)),
      TitleRu = capS(ttRu(e)); // inside speech, quotes nest as ‘…’ in English and „…“ in Russian
    journal(glossNote(gl));
    S.log.readings++;
    const them = {
      anselm: bi(
        `‘${Title}’? That is ${G}. The Kutha hymns use the title constantly; one grows tired of it.`,
        `„${TitleRu}“? Это ${Gr()}. В кутских гимнах этот титул встречается постоянно, от него даже устаёшь.`
      ),
      ilse: bi(
        `${G}. Obviously. ‘${Title}’ is the commonest title for ${G} in the late texts.`,
        `${Gr()}. Разумеется. „${TitleRu}“ — самый частый титул ${Gr('g')} в поздних текстах.`
      ),
      zahrun: bi(
        `My grandmother still said it. ‘${Title}’ is ${G}. We say it quietly, and never near water.`,
        `Моя бабушка ещё так говорила. „${TitleRu}“ — это ${Gr()}. Мы произносим это тихо и никогда — у воды.`
      )
    }[c.id];
    return {
      you,
      youE: 'neutral',
      them,
      themE: 'thoughtful',
      note: bi('You copy it into your notebook, under Omens.', 'Вы записываете это в книжку, во вкладку «Знамения».')
    };
  }
};
// the diary: a Dreamer, a Watcher, a thief
DIALOG.diary = {
  label: () => bi('Ask about Crane’s diary', 'Спросить о дневнике Крейна'),
  sub: () => bi('A Dreamer, a Watcher, a thief: which are they?', 'Сновидец, страж, вор: кто из них этот человек?'),
  off: c => claimOf(c).said != null,
  run(c) {
    const cl = claimOf(c),
      them = claimSay(c, cl.role);
    sayClaim(c);
    // a lie that shows, shows in the face too: a practised liar's half-smile, anyone else's unease
    const note = claimTell(c),
      sly = note && lying(c) && (temperOf(c) === 'liar' || temperOf(c) === 'calculating');
    return {
      you: bi(...tellOne('claimYou', [...CLAIM_YOU, ...SAY.claimYou])),
      youE: 'neutral',
      them,
      themE: sly ? 'sly' : note ? 'uneasy' : cl.role === 'none' ? 'neutral' : cl.role === 'evade' ? 'uneasy' : 'grave',
      note
    };
  }
};
