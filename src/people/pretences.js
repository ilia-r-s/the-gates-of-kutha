// ===================== PRETENCES, AND COMING CLEAN =====================
// What someone pretends or hides that they could come clean about, and the ways it comes out: under pressure, out of
// trust, of their own accord at breakfast, or before the whole camp at an inquiry. A part claimed that is not theirs is
// given up the same way and in the same words by anyone, the cult among them: for the cult, a cover story dropped
// before it breaks, and the lie underneath goes on.

// What someone pretends or hides that they could come clean about: a part they claimed and do not have (the cult's
// claims too: liked-seer, liked-warden, as anyone's), the part they have and hid, the smuggler's watch that was a cover,
// or the smuggling he kept quiet. And one more lie of the same shape: a liar or a calculating one who told you they had
// no part may stage a coming clean, as the Watcher (staged), whoever they are: the cult to be trusted, anyone else to be
// listened to.
function pretence(c) {
  const cl = claimOf(c);
  if (!cl || cl.recanted != null) return null;
  if (c.role === 'seer' || c.role === 'warden') return cl.role === c.role ? null : 'hid-' + c.role;
  if (cl.said == null) return null;
  if (c.role === 'smuggler' && cl.role === 'warden' && cl.why === 'conceal') return 'cover';
  if (cl.role === 'seer' || cl.role === 'warden') return 'liked-' + cl.role;
  if (c.role === 'smuggler' && S.revealed[c.id] !== 'smuggler') return 'thief';
  return cl.role === 'none' && c.role !== 'smuggler' && ['liar', 'calculating'].includes(temperOf(c)) ? 'staged' : null;
}
// whether someone else still here has spoken a claim to the same part
const rivalClaim = c => freeChars().some(o => o.id !== c.id && claimOf(o).role === claimOf(c).role && claimOf(o).said != null);
// The chance someone drops a pretence of their own accord tomorrow morning. It is never certain: some keep a lie to
// the very end. It grows when the story is in danger (someone else claims the same part, a dream named them, a
// sworn watch failed, people say they are lying) and when they have come to trust you.
function confessChance(c, takenToday) {
  const k = pretence(c);
  if (!k) return 0;
  const tp = TP(c),
    about = f => S.testimony.filter(t => t.about === c.id && f(t)).length;
  const K = RULES.confess;
  // one of the cult that answered a dream for the other of it (game/night.js, answerWith) holds to its story: dropped,
  // it would undo the answer and give the two of them away; only the rash let it go as readily as anyone (TEMPERS
  // counter, at most 1)
  const held = c.role === 'cult' && claimOf(c).stood ? Math.min(1, tp.counter) : 1;
  if (k === 'staged') return K.staged;
  if (k === 'thief') return Math.min(K.cap, tp.confess * K.thief + (c.rapport >= 2 ? K.trusting : 0));
  if (k.indexOf('hid') === 0)
    return Math.min(K.cap, tp.confess * K.hidden + (takenToday ? K.afterDeath : 0) + (c.rapport >= 2 ? K.trusting : 0));
  return (
    held *
    Math.min(
      K.cap,
      tp.confess +
        (rivalClaim(c) ? K.rival : 0) +
        (about(t => t.kind === 'vision' && t.verdict === 'cult') ? K.dreamt : 0) +
        (about(t => t.kind === 'failwatch') ? K.caught : 0) +
        (about(t => t.kind === 'distrust') >= 2 ? K.blamed : 0) +
        (c.rapport >= 2 ? K.trusting : 0)
    )
  );
}
// Someone drops a pretence: their claim is set right and the camp's record notes it; ownUp says what it means and what
// they say. how = pressed (you broke the story), trust (they trust you enough), aside (of their own accord, to you alone
// before breakfast), confess (of their own accord, before everyone at breakfast) or public (before the whole camp, at
// an inquiry).
function comeClean(c, how) {
  const k = pretence(c);
  if (!k) return null;
  const cl = claimOf(c),
    was = cl.role,
    claimed = cl.said != null, // they had told you something before; else there is nothing to take back
    lied = was === 'none' && claimed,
    evaded = was === 'evade' && claimed;
  cl.recanted = S.day;
  cl.how = how;
  cl.was = was;
  cl.claimed = claimed;
  if (!claimed) cl.said = S.day;
  cl.role = k === 'staged' ? 'warden' : trueClaim(c); // (a staged coming clean is a new lie: the Watcher)
  if (k === 'staged') cl.why = c.role === 'cult' ? 'deceit' : 'liked';
  else if (c.role === 'cult') S.log.cultTruth++; // (a false part given up by the cult: a truth, if a calculated one)
  if (claimed) addTest(c.id, c.id, 'recant', was);
  addTest(c.id, c.id, 'claim', cl.role);
  const open = how === 'confess' || how === 'public';
  if (open) {
    addTest(c.id, c.id, 'confess', String(S.day));
    S.log.confess++;
  }
  return ownUp(c, k, how, { open, lied, evaded });
}
// What owning up to each kind of pretence means, and what they say: a hidden Dreamer or Watcher owns the part, the
// smuggler's watch turns out to be a cover, a pretender admits to wanting to be listened to or thought well of. Each
// kind (OWN_UP) does what owning up means, notes it in your journal, and returns what they say; ctx = { open, lied,
// evaded, g (their Russian gender), N and Nr (their name, in English and Russian), adm (Russian "admitted") }.
function ownUp(c, k, how, { open, lied, evaded }) {
  const g = (m, f) => ru.gs(c, m, f);
  return OWN_UP[k](c, how, { open, lied, evaded, g, N: c.name, Nr: capS(ru.cf(c)), adm: g('признался', 'призналась') });
}
// The thief owns his trade: it goes on the record, his part comes out on his card (and your mark on it freezes), and
// now and then he says what he saw out there at night (thief.own); returns what he adds, if anything.
function ownsTrade(c) {
  addTest(c.id, c.id, 'thief', 'thief');
  S.revealed[c.id] = 'smuggler';
  fixMark(c);
  return thiefSaw(c) && chance(RULES.thief.own) ? ' ' + thiefNames(c) : '';
}
const OWN_UP = {
  // one who said they had no part owns up to keeping watch, in the very words the true Watcher would use; and swears, as
  // a Watcher would, to watch your tent tonight if you trust each other enough: a false watch (the cult's, or a
  // pretender's, who will sleep through it)
  staged: (c, how, ctx) => {
    S.log.staged.push({ day: S.day, id: c.id });
    const said = OWN_UP['hid-warden'](c, how, ctx);
    if (S.guardPromise === c.id) {
      S.guardPromise = null;
      if (c.rapport >= 2) {
        if (c.role === 'cult') S.falseGuard = c.id;
        else S.fakeGuard = c.id;
      }
    }
    return said;
  },
  // the thief who kept his business quiet owns it, and perhaps what he saw (as when the night watch was his cover)
  thief: (c, how, { g, N, Nr, adm }) => {
    journal(bi(`${N} admitted to smuggling.`, `${Nr} ${adm} в контрабанде.`));
    const named = ownsTrade(c);
    return (
      bi(
        'I should tell you myself, before someone else does. I have been moving crates at night: a few tablets for the Baghdad market. That is all it was.',
        `Лучше уж я сам${g('', 'а')} скажу, пока не сказал кто-нибудь другой. По ночам я ${g('перетаскивал', 'перетаскивала')} ящики: несколько табличек для багдадского рынка. Только и всего.`
      ) + named
    );
  },
  'hid-seer': (c, how, { open, lied, evaded, g, N, Nr, adm }) => {
    c.promised = true;
    if (open) S.seerPublic = true;
    journal(bi(`${N} admitted to being the Dreamer.`, `${Nr} ${adm}, что ${g('он — сновидец', 'она — сновидица')}.`));
    if (how === 'pressed')
      return bi(
        'Enough. Yes, I dream. I kept it to myself because people here who dream do not last.',
        `Довольно. Да, мне снятся сны. Я ${g('молчал', 'молчала')}, потому что здесь те, кто видит сны, долго не живут.`
      );
    if (how === 'trust' || how === 'aside')
      return lied
        ? bi(
            'Doctor, a word. When you asked about Crane’s diary, I lied to you. I am the one who dreams. I was afraid: people here who dream do not last.',
            `Доктор, на пару слов. Когда вы спрашивали о дневнике Крейна, я вам ${g('солгал', 'солгала')}. Сны вижу я. Мне было страшно: здесь те, кто видит сны, долго не живут.`
          )
        : evaded
          ? bi(
              'Doctor, a word. When you asked about Crane’s diary, I would not answer. I am the one who dreams. I was afraid: people here who dream do not last.',
              `Доктор, на пару слов. Когда вы спрашивали о дневнике Крейна, я не ${g('стал', 'стала')} отвечать. Сны вижу я. Мне было страшно: здесь те, кто видит сны, долго не живут.`
            )
          : bi(
              'Doctor, a word. There is something I have told no one. I am the one who dreams. I was afraid: people here who dream do not last.',
              `Доктор, на пару слов. Я никому этого не ${g('говорил', 'говорила')}. Сны вижу я. Мне было страшно: здесь те, кто видит сны, долго не живут.`
            );
    return bi(
      'I am the one who dreams. I am done hiding it; hiding has kept no one safe.',
      'Сны вижу я. Хватит прятаться — это никого не уберегло.'
    );
  },
  'hid-warden': (c, how, { lied, evaded, g, N, Nr, adm }) => {
    if (how === 'trust' || how === 'aside') {
      S.guardPromise = c.id;
    }
    journal(bi(`${N} admitted to keeping watch.`, `${Nr} ${adm}, что стоит на страже.`));
    if (how === 'pressed')
      return lied
        ? bi(
            'Very well. I keep watch. I said otherwise because a watcher everyone knows about is no use to anyone.',
            `Хорошо. Я стою на страже. Я ${g('говорил', 'говорила')} иначе, потому что от стража, о котором все знают, никакого толку.`
          )
        : bi(
            'Very well. I keep watch. I kept it quiet because a watcher everyone knows about is no use to anyone.',
            `Хорошо. Я стою на страже. Я об этом ${g('молчал', 'молчала')}, потому что от стража, о котором все знают, никакого толку.`
          );
    if (how === 'trust' || how === 'aside') {
      // (tonight they watch over your tent, if they trust you enough: a promise for one night, as any: game/night.js)
      const yours =
        c.rapport >= 2 ? [' Tonight I will keep it by your tent.', ' Этой ночью я посижу с ней у вашей палатки.'] : ['', ''];
      return lied
        ? bi(
            `What I told you before was not the truth. I sit up every night with a lamp, walking between the tents.${yours[0]}`,
            `То, что я вам ${g('говорил', 'говорила')} раньше, — неправда. Я каждую ночь сижу с лампой, хожу между палатками.${yours[1]}`
          )
        : evaded
          ? bi(
              `I would not answer you before. I sit up every night with a lamp, walking between the tents.${yours[0]}`,
              `Раньше я не ${g('стал', 'стала')} вам отвечать. Я каждую ночь сижу с лампой, хожу между палатками.${yours[1]}`
            )
          : bi(
              `You should know: I sit up every night with a lamp, walking between the tents.${yours[0]}`,
              `Вам стоит знать: я каждую ночь сижу с лампой, хожу между палатками.${yours[1]}`
            );
    }
    return bi(
      'I have been keeping watch all along. You may as well know it.',
      `Я всё это время ${g('стоял', 'стояла')} на страже. Пора вам это знать.`
    );
  },
  // the smuggler's night watch was a cover: pressed, only that; otherwise the whole of it, and perhaps what was seen
  cover: (c, how, { g, N, Nr, adm }) => {
    journal(bi(`${N} admitted the night watch was a cover for smuggling.`, `${Nr} ${adm}, что ночной дозор прикрывал контрабанду.`));
    if (how === 'pressed')
      return bi(
        'And the night watch was a story. I was moving crates.',
        `А ночной дозор — это сказка. Я ${g('перетаскивал', 'перетаскивала')} ящики.`
      );
    const named = ownsTrade(c);
    return (
      bi(
        'The night watch was a story. I was moving crates: a few tablets for the Baghdad market. Better you hear it from me.',
        `Ночной дозор — это сказка. Я ${g('перетаскивал', 'перетаскивала')} ящики: несколько табличек для багдадского рынка. Лучше уж вы услышите это от меня.`
      ) + named
    );
  },
  'liked-seer': (c, how) => {
    if (S.loud === c.id) S.loud = null;
    dropNote(c, 'seer');
    return how === 'pressed'
      ? bi(
          'All right! I don’t dream. I wanted someone in this camp to listen to me for once.',
          'Ладно! Никаких снов я не вижу. Мне просто хотелось, чтобы в этом лагере хоть раз кто-нибудь меня выслушал.'
        )
      : dropSay(c, 'seer');
  },
  'liked-warden': (c, how) => {
    dropNote(c, 'warden');
    return how === 'pressed'
      ? bi(
          'Fine. I don’t keep watch. I sleep like everyone else. I wanted you to think well of me.',
          'Хорошо. Никакого дозора я не несу. Сплю, как все. Мне хотелось, чтобы вы были обо мне лучшего мнения.'
        )
      : dropSay(c, 'warden');
  }
};
// Giving up a false claim to dream or to keep watch, unpressed: the same words and the same note in your journal in
// anyone's mouth, a pretender's or a cultist's, so that they alone tell nothing.
const DROP_SAY = {
  seer: [
    g =>
      bi(
        'I have to say something. I don’t dream, not true dreams. I said I did because nobody here ever listens to me.',
        `Мне нужно кое-что сказать. Никаких вещих снов я не вижу. Я так ${g('говорил', 'говорила')}, потому что меня здесь никто никогда не слушает.`
      ),
    g =>
      bi(
        'About my dreams. I may have been dreaming my own fears. Forget what I said.',
        `Насчёт моих снов. Возможно, мне снились мои собственные страхи. Забудьте, что я ${g('говорил', 'говорила')}.`
      )
  ],
  warden: [
    g =>
      bi(
        'I never kept watch. I said I did so you would think well of me. I am ashamed of it.',
        `Никакого дозора я не ${g('нёс', 'несла')}. Я так ${g('говорил', 'говорила')}, чтобы обо мне думали лучше. Мне стыдно.`
      ),
    g =>
      bi(
        'I said I keep watch. I sat up one night with a lamp, that is all. I should not have made more of it.',
        `Я ${g('говорил', 'говорила')}, что стою на страже. Я ${g('просидел', 'просидела')} с лампой одну ночь, только и всего. Не стоило раздувать из этого больше.`
      )
  ]
};
const dropSay = (c, role) => pick(DROP_SAY[role])((m, f) => ru.gs(c, m, f));
function dropNote(c, role) {
  const g = (m, f) => ru.gs(c, m, f);
  journal(
    role === 'seer'
      ? bi(`${c.name} took back the claim to dream true.`, `${capS(ru.cf(c))} ${g('отказался', 'отказалась')} от слов о вещих снах.`)
      : bi(`${c.name} took back the claim to keep watch.`, `${capS(ru.cf(c))} ${g('отказался', 'отказалась')} от слов о ночном дозоре.`)
  );
}
// how a pretence is dropped of a morning, the same for anyone: to you alone, or before everyone (RULES.confess.aside)
const morningLead = (c, aside) =>
  aside
    ? bi(`Before breakfast, ${c.short} takes you aside. “`, `Ещё до завтрака ${ru.c(c)} отводит вас в сторону. «`)
    : bi(`Before breakfast is over, ${c.short} stands up. “`, `Завтрак ещё не закончен, когда ${ru.c(c)} встаёт. «`);
const inquiryLead = c =>
  bi(`Before anyone else can speak, ${c.short} stands up. “`, `Прежде чем кто-нибудь успевает заговорить, ${ru.c(c)} встаёт. «`);
// a pretender drops a pretence of their own accord at breakfast: to you alone, or before everyone
function morningConfession(c) {
  const aside = chance(RULES.confess.aside);
  return (
    `<p class="event">${quoted(morningLead(c, aside), comeClean(c, aside ? 'aside' : 'confess'))}</p>` +
    (aside ? '' : stir('confessed', { about: c.id }))
  );
}
// at an inquiry, with the whole camp watching, one keeping up a story may get in first (the cult's among them)
function inquiryConfession() {
  if (S.inqConf === S.day) return '';
  S.inqConf = S.day;
  const c = shuffle(freeChars()).find(o => {
    const p = confessChance(o, false);
    return p > 0 && chance(Math.min(RULES.confess.cap, p + RULES.confess.publicly));
  });
  if (!c) return '';
  return `<p class="event">${quoted(inquiryLead(c), comeClean(c, 'public'))}</p>` + stir('confessed', { about: c.id });
}
