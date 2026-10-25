// ===================== THE RECORD: what you have learned, and what it weighs =====================
// One machinery for the record of a season, as you could know it: testimony (what someone said or showed about someone,
// of a kind: S.testimony), the traces found at the scenes (S.clues), the accounts people gave of each night (S.claims)
// and the sightings in the dark (S.sights), and your journal (S.journal). Testimony comes in kinds, each a row of one
// registry (KINDS): its chip on the card of the one it is about, its line in the casebook's lists, and its weight in
// the case against someone; the casebook reads the registry (ui/book.js), the camp weighs the case (caseAgainst:
// game/verdict.js), and the cult reads it too, as it sees it (people/suspicion.js). A new kind of testimony is a new
// row, and nothing else. The record starts empty with the season (game/state.js, freshSeason), the accounts and
// sightings with the night Crane died (people/alibis.js, crane0).
const Record = (() => {
  // ---------- testimony ----------
  // What someone said or showed about someone (from, about: an id, or 'you'), of a kind, and which way (verdict): kept
  // once, whatever the day (the same word said again keeps its first day).
  function testify(from, about, kind, verdict) {
    if (S.testimony.some(t => t.from === from && t.about === about && t.kind === kind && t.verdict === verdict)) return;
    S.testimony.push({ day: S.day, from, about, kind, verdict });
  }
  // how many testimonies about someone answer a test
  const about = (c, f) => S.testimony.filter(t => t.about === c.id && f(t)).length;

  // ---------- the kinds of testimony ----------
  // Each kind: its chip on the card of the one it is about (chip(t, a, f, fr): [style, words], or nothing; t the
  // testimony, a the person it is about, f the speaker's name, fr the speaker's id), and where it has them, its line
  // among what you noticed yourself (noticed: kept so when played hardcore, in place of the chips), among the testimony
  // (dreams told and distrust spoken), or among what people say of each other (saying); and its weight in the case
  // against the one it is about (weigh: what it adds, or nothing). A claim shows only as the latest one made; a claim
  // taken back no longer shows once they have come clean.
  const KINDS = {
    // (at the end, a false dreamer's dreams and the true Dreamer's are told: game/debrief.js, fxFalseDreamer,
    // fxDreamer)
    vision: {
      chip: (t, a, f, fr) =>
        t.verdict === 'cult'
          ? ['bad', bi(`${f} dreamt ${EP.him(a)} guilty`, `${ru.c(fr, 'd')} приснилось: ${ru.gs(a, 'виновен', 'виновна')}`)]
          : ['good', bi(`${f} dreamt ${EP.him(a)} clean`, `${ru.c(fr, 'd')} приснилось: ${ru.gs(a, 'невиновен', 'невиновна')}`)],
      testimony: t =>
        bi(
          `${C(t.from).short} ${t.verdict === 'cult' ? 'dreamt guilty:' : 'dreamt clean:'} <b>${C(t.about).short}</b>`,
          `${ru.c(t.from, 'd')} приснилось, что ${t.verdict === 'cult' ? ru.gs(t.about, 'виновен', 'виновна') : ru.gs(t.about, 'невиновен', 'невиновна')} <b>${ru.c(t.about)}</b>`
        ),
      weigh: t => (t.verdict === 'cult' ? RULES.verdict.dream : -RULES.verdict.dream)
    },
    distrust: {
      chip: (t, a, f, fr) => ['', bi(`${f} distrusts ${EP.him(a)}`, `${ru.c(fr)} ${ru.gs(a, 'ему', 'ей')} не доверяет`)],
      testimony: t =>
        bi(`${C(t.from).short} distrusts <b>${C(t.about).short}</b>`, `${ru.c(t.from)} не доверяет <b>${ru.c(t.about, 'd')}</b>`),
      weigh: () => RULES.verdict.distrust
    },
    react: {
      chip: (t, a) =>
        t.verdict === 'fear'
          ? ['warnc', bi('Flinched at relics', ru.gs(a, 'Вздрогнул при виде находки', 'Вздрогнула при виде находки'))]
          : t.verdict === 'greed'
            ? ['', bi('Eyed relics like a dealer', ru.gs(a, 'Приценивался к находке', 'Приценивалась к находке'))]
            : ['dimc', bi('Calm at relics', 'Находки не тревожат')],
      noticed: (t, a) =>
        t.verdict === 'fear'
          ? bi(`${a.short} flinched at something from the tell`, `${ru.c(a)} ${ru.gs(a, 'вздрогнул', 'вздрогнула')} при виде находки`)
          : t.verdict === 'greed'
            ? bi(
                `${a.short} weighed a find like a dealer`,
                `${ru.c(a)} ${ru.gs(a, 'приценивался', 'приценивалась')} к находке, как торговец`
              )
            : bi(`${a.short} took a find calmly`, `${ru.c(a)} спокойно ${ru.gs(a, 'отнёсся', 'отнеслась')} к находке`),
      weigh: t => (t.verdict === 'fear' ? RULES.verdict.flinch : null)
    },
    words: {
      chip: (t, a) =>
        t.verdict === 'fear'
          ? ['warnc', bi('Flinched at the tablets’ words', ru.gs(a, 'Вздрогнул от слов с табличек', 'Вздрогнула от слов с табличек'))]
          : t.verdict === 'greed'
            ? [
                '',
                bi(
                  'Asked what the tablet would fetch',
                  ru.gs(a, 'Спросил, сколько дадут за табличку', 'Спросила, сколько дадут за табличку')
                )
              ]
            : ['dimc', bi('Calm at the tablets’ words', 'Слова с табличек не тревожат')],
      noticed: (t, a) =>
        t.verdict === 'fear'
          ? bi(`${a.short} flinched at a line from the tablets`, `${ru.c(a)} ${ru.gs(a, 'вздрогнул', 'вздрогнула')} от строки с табличек`)
          : t.verdict === 'greed'
            ? bi(`${a.short} asked what the tablet would fetch`, `${ru.c(a)} ${ru.gs(a, 'спросил', 'спросила')}, сколько дадут за табличку`)
            : bi(`${a.short} read a line from the tablets calmly`, `${ru.c(a)} спокойно ${ru.gs(a, 'прочёл', 'прочла')} строку с табличек`),
      weigh: t => (t.verdict === 'fear' ? RULES.verdict.flinch : null)
    },
    // (at the end, an innocent's slip is told among the misfortunes: game/debrief.js, fxMisfortune)
    slip: {
      chip: (t, a) => ['bad strong', bi('Let something slip', ru.gs(a, 'Проговорился', 'Проговорилась'))],
      noticed: (t, a) =>
        bi(
          `${a.short} let something slip when pressed`,
          `${ru.c(a)} ${ru.gs(a, 'проговорился', 'проговорилась')}, когда на ${ru.gs(a, 'него', 'неё')} надавили`
        ),
      weigh: () => RULES.verdict.strong
    },
    // (at the end, the cult's is told among its craft, an innocent's among the misfortunes: game/debrief.js, fxCunning,
    // fxMisfortune)
    blurt: {
      chip: (t, a) => [
        'bad strong',
        bi('Knew what only the attacker could', ru.gs(a, 'Знал то, что знал лишь нападавший', 'Знала то, что знал лишь нападавший'))
      ],
      noticed: (t, a) =>
        bi(
          `${a.short} knew something of a night that nobody had told`,
          `${ru.c(a)} ${ru.gs(a, 'знал', 'знала')} о ночи то, чего никто не рассказывал`
        ),
      weigh: () => RULES.verdict.strong
    },
    // (at the end, told with the night in your tent: game/debrief.js, fxVisit)
    chill: {
      chip: (t, a) => ['warnc', bi(`A chill when ${a.p} spoke`, 'Холодок при разговоре')],
      noticed: (t, a) => bi(`A chill as ${a.short} spoke`, `Холодок, пока говорил${ru.gs(a, '', 'а')} ${ru.c(a)}`)
    },
    // (at the end, told with the harm meant you: game/debrief.js, fxSpite)
    spite: {
      chip: (t, a) => [
        'bad',
        bi(
          'Caught at your tent, meaning you harm',
          ru.gs(a, 'Пойман у вашей палатки: хотел вам навредить', 'Поймана у вашей палатки: хотела вам навредить')
        )
      ],
      noticed: (t, a) =>
        bi(
          `${a.short} was at your tent in the night, meaning you harm`,
          `${ru.c(a)} ${ru.gs(a, 'побывал', 'побывала')} ночью у вашей палатки, желая вам зла`
        ),
      weigh: () => RULES.verdict.spite
    },
    thief: {
      chip: (t, a) => ['', bi('Admitted smuggling', ru.gs(a, 'Признался в контрабанде', 'Призналась в контрабанде'))]
    },
    // (at the end, told with the parts claimed: game/debrief.js, fxClaims, claimEnd)
    claim: {
      chip: (t, a) =>
        S.testimony.filter(x => x.kind === 'claim' && x.from === a.id).pop() !== t
          ? null
          : [
              '',
              t.verdict === 'seer'
                ? bi('Claims to dream true', 'Говорит, что видит вещие сны')
                : t.verdict === 'warden'
                  ? bi('Claims to keep watch', 'Говорит, что стоит на страже')
                  : t.verdict === 'evade'
                    ? bi('Will not say', ru.gs(a, 'Уклонился от ответа', 'Уклонилась от ответа'))
                    : bi('Claims no part', ru.gs(a, 'Говорит, что дневник не о нём', 'Говорит, что дневник не о ней'))
            ]
    },
    // (at the end, told with the parts claimed: game/debrief.js, fxClaims)
    recant: {
      chip: (t, a) =>
        S.testimony.some(x => x.kind === 'confess' && x.from === a.id)
          ? null
          : ['warnc', bi('Took back a claim', ru.gs(a, 'Взял свои слова назад', 'Взяла свои слова назад'))]
    },
    // (at the end, told with the parts claimed: game/debrief.js, fxClaims)
    confess: {
      chip: (t, a) => ['warnc', bi('Came clean', ru.gs(a, 'Признался сам', 'Призналась сама'))]
    },
    tell: {
      chip: (t, a) => ['warnc', bi('Answered too quickly', ru.gs(a, 'Ответил слишком поспешно', 'Ответила слишком поспешно'))],
      noticed: (t, a) => bi(`${a.short} answered too quickly`, `${ru.c(a)} ${ru.gs(a, 'ответил', 'ответила')} слишком поспешно`)
    },
    failwatch: {
      chip: (t, a) => ['bad', bi('Slept through a sworn watch', ru.gs(a, 'Проспал обещанный дозор', 'Проспала обещанный дозор'))],
      noticed: (t, a) =>
        bi(
          `${a.short} swore to watch your tent, and slept`,
          `${ru.c(a)} ${ru.gs(a, 'клялся', 'клялась')} стеречь вашу палатку — и ${ru.gs(a, 'проспал', 'проспала')}`
        ),
      weigh: () => RULES.verdict.failwatch
    },
    // what you make of them yourself, and what others say of them
    // (at the end, a temperament you misread is told: game/debrief.js, mienSaid)
    mien: {
      chip: (t, a) => ['dimc', bi('Seems: ', 'С виду: ') + temperName(t.verdict, a)],
      noticed: (t, a) => bi(`${a.short} seems: `, `${ru.c(a)}, с виду: `) + temperName(t.verdict, a)
    },
    temper: {
      chip: (t, a, f, fr) => ['dimc', bi(`${f}: `, `${ru.c(fr)}: `) + temperName(t.verdict, a)],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return bi(
          `${f} says ${a} is ${TEMPER_NAMES[t.verdict][0]}`,
          `${ru.c(t.from)}: ${ru.c(t.about)} — ${TEMPER_NAMES[t.verdict][ru.f(t.about) ? 2 : 1]}`
        );
      }
    },
    bond: {
      chip: (t, a, f, fr) => {
        const [k, b] = t.verdict.split(':');
        return [
          'dimc',
          k === 'close'
            ? bi(`${f}: close to ${C(b).short}`, `${ru.c(fr)}: дружит с ${ru.c(b, 'i')}`)
            : bi(`${f}: cannot bear ${C(b).short}`, `${ru.c(fr)}: не выносит ${ru.c(b, 'a')}`)
        ];
      },
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short,
          [k, b] = t.verdict.split(':');
        return k === 'close'
          ? bi(`${f} says ${a} and ${C(b).short} are thick as thieves`, `${ru.c(t.from)}: ${ru.c(t.about)} и ${ru.c(b)} — не разлей вода`)
          : bi(`${f} says ${a} cannot bear ${C(b).short}`, `${ru.c(t.from)}: ${ru.c(t.about)} терпеть не может ${ru.c(b, 'a')}`);
      }
    },
    // (at the end, a tip against one who is no thief is told among the misfortunes: game/debrief.js, fxMisfortune)
    tip: {
      chip: (t, a, f, fr) => ['', bi(`${f}: sells tablets on the side`, `${ru.c(fr)}: приторговывает табличками`)],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return bi(`${f} says ${a} sells tablets on the side`, `${ru.c(t.from)}: ${ru.c(t.about)} приторговывает табличками`);
      }
    },
    feel: {
      chip: (t, a, f, fr) => [
        'dimc',
        {
          like: bi(`${f}: fond of ${EP.him(a)}`, `${ru.c(fr)}: ${ru.gs(fr, 'привязан', 'привязана')} к ${ru.gs(a, 'нему', 'ней')}`),
          dislike: bi(`${f}: cannot stand ${EP.him(a)}`, `${ru.c(fr)}: ${ru.gs(a, 'его', 'её')} не выносит`),
          flirt: bi(`${f}: rather taken with ${EP.him(a)}`, `${ru.c(fr)}: ${ru.gs(fr, 'увлечён', 'увлечена')} ${ru.gs(a, 'им', 'ею')}`)
        }[t.verdict]
      ],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return {
          like: bi(
            `${f} says ${C(t.from).p} is fond of ${a}`,
            `${ru.c(t.from)}: ${ru.gs(t.from, 'привязан', 'привязана')} к ${ru.c(t.about, 'd')}`
          ),
          dislike: bi(`${f} says ${C(t.from).p} cannot stand ${a}`, `${ru.c(t.from)}: терпеть не может ${ru.c(t.about, 'a')}`),
          flirt: bi(`${f} speaks of ${a} with a certain warmth`, `${ru.c(t.from)} говорит ${ru.ob(t.about)} с особой теплотой`)
        }[t.verdict];
      }
    },
    flirt: {
      chip: (t, a, f, fr) => [
        'dimc',
        t.verdict === 'you'
          ? bi(`${f}: sweet on you`, `${ru.c(fr)}: ${ru.gs(a, 'неравнодушен', 'неравнодушна')} к вам`)
          : bi(`${f}: sweet on ${C(t.verdict).short}`, `${ru.c(fr)}: ${ru.gs(a, 'неравнодушен', 'неравнодушна')} к ${ru.c(t.verdict, 'd')}`)
      ],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'you'
          ? bi(
              `${f} says ${a} is sweet on you`,
              `${ru.c(t.from)}: ${ru.c(t.about)} ${ru.gs(t.about, 'неравнодушен', 'неравнодушна')} к вам`
            )
          : bi(
              `${f} says ${a} is sweet on ${C(t.verdict).short}`,
              `${ru.c(t.from)}: ${ru.c(t.about)} ${ru.gs(t.about, 'неравнодушен', 'неравнодушна')} к ${ru.c(t.verdict, 'd')}`
            );
      }
    },
    hint: {
      chip: (t, a, f, fr) => [
        'warnc',
        bi(`${f} hints at ${a.pp} nights`, `${ru.c(fr)} намекает на ${ru.gs(a, 'его', 'её')} ночные прогулки`)
      ],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return bi(`${f} hints that ${a} is out at night`, `${ru.c(t.from)} намекает, что ${ru.c(t.about)} бродит по ночам`);
      },
      weigh: () => RULES.verdict.flinch
    },
    // what someone else says this one thinks of you (people/gossip.js); and of the night she spent in your tent
    thinks: {
      chip: (t, a, f, fr) => [
        'dimc',
        t.verdict === 'good'
          ? bi(`${f}: on your side`, `${ru.c(fr)}: на вашей стороне`)
          : bi(`${f}: against you`, `${ru.c(fr)}: ${ru.gs(a, 'настроен', 'настроена')} против вас`)
      ],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'good'
          ? bi(`${f} says ${a} speaks well of you`, `${ru.c(t.from)}: ${ru.c(t.about)} хорошо о вас отзывается`)
          : bi(`${f} says ${a} does not trust you`, `${ru.c(t.from)}: ${ru.c(t.about)} вам не доверяет`);
      }
    },
    scandal: {
      chip: (t, a, f, fr) =>
        t.verdict === 'bad'
          ? ['warnc', bi(`${f} gossips about her night in your tent`, `${ru.c(fr)} сплетничает о её ночи в вашей палатке`)]
          : ['dimc', bi(`${f} is kind about her night in your tent`, `${ru.c(fr)} по-доброму говорит о её ночи в вашей палатке`)],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'bad'
          ? bi(
              `${f} made a scandal of ${a}’s night in your tent`,
              `${ru.c(t.from)} ${ru.gs(t.from, 'раздул', 'раздула')} скандал из ночи, которую ${ru.c(t.about)} провела в вашей палатке`
            )
          : bi(
              `${f} spoke kindly of ${a}’s night in your tent`,
              `${ru.c(t.from)} по-доброму ${ru.gs(t.from, 'отозвался', 'отозвалась')} о ночи, которую ${ru.c(t.about)} провела в вашей палатке`
            );
      }
    },
    // what you saw for yourself
    quarrel: {
      chip: (t, a) => [
        'dimc',
        bi(`Quarrelled with ${C(t.verdict).short}`, `${ru.gs(a, 'Поссорился', 'Поссорилась')} с ${ru.c(t.verdict, 'i')}`)
      ],
      saying: t => {
        const a = C(t.about).short;
        return bi(
          `${a} and ${C(t.verdict).short} quarrelled at breakfast`,
          `${ru.c(t.about)} и ${ru.c(t.verdict)} поссорились за завтраком`
        );
      }
    },
    feast: {
      chip: (t, a) => [
        'dimc',
        bi(`Sat with ${C(t.verdict).short} at the feast`, `${ru.gs(a, 'Сидел', 'Сидела')} рядом с ${ru.c(t.verdict, 'i')} на пиру`)
      ],
      saying: t => {
        const a = C(t.about).short;
        return bi(`${a} and ${C(t.verdict).short} sat together at the feast`, `${ru.c(t.about)} и ${ru.c(t.verdict)} сидели рядом на пиру`);
      }
    },
    // (at the end, the thief's word is told with him: game/debrief.js, fxThief)
    witness: {
      chip: (t, a, f, fr) => [
        'bad strong',
        bi(`${f} saw ${EP.him(a)} near the scene`, `${ru.c(fr)} ${ru.gs(fr, 'видел', 'видела')} ${ru.gs(a, 'его', 'её')} у места нападения`)
      ],
      weigh: () => RULES.verdict.strong
    }
  };

  // ---------- traces ----------
  // A trace: of its owner's habit, but for now and then (examine.smudge) one that was not theirs, a borrowed pair of
  // boots, a cadged cigarette, as they were that night (the ending tells it).
  function addTrace(o) {
    emit('clue');
    const own = C(o.owner).traits[o.cat],
      smudged = chance(RULES.examine.smudge),
      cl = { id: S.clues.length, day: S.day, ...o, val: smudged ? pick(Object.keys(TRAITS[o.cat].vals).filter(v => v !== own)) : own };
    if (smudged) cl.smudged = own;
    S.clues.push(cl);
    return cl;
  }
  // a trace seen not to be the attacker's: a thief's, someone's who passed earlier, or planted
  const ruledOut = cl => cl.status === 'thief' || cl.status === 'stray' || cl.status === 'planted';
  // what a trace has been seen to be, in words: its chip among the traces, and why it fits nobody's night, on a card
  const STATUS = {
    genuine: { chip: () => `<span class="chip bad">${bi('Genuine', 'Подлинный')}</span>` },
    thief: { chip: () => `<span class="chip">${bi('A thief’s', 'Воровской')}</span>`, why: () => bi(' (a thief’s trace)', ' (след вора)') },
    stray: {
      chip: () => `<span class="chip">${bi('Left earlier', 'Оставлен раньше')}</span>`,
      why: () => bi(' (left there earlier)', ' (оставлен там раньше)')
    },
    planted: {
      chip: () => `<span class="chip warnc">${bi('Planted', 'Подброшен')}</span>`,
      why: () => bi(' (a planted trace)', ' (подброшенный след)')
    },
    unverified: { chip: () => `<span class="chip dimc">${bi('Unverified', 'Не проверен')}</span>` }
  };

  // ---------- accounts of nights, and sightings ----------
  // what someone said of where they were a night, and with whom (when you asked them: people/dialog.js); what someone
  // saw in the dark, told you (asked, or of their own accord before breakfast: people/social.js)
  const addAccount = rec => S.claims.push(rec),
    addSighting = rec => S.sights.push(rec);

  // ---------- the case against someone ----------
  // From what you know: traces at the scenes that fit them, as far as you have seen their habits (a planted or a
  // thief's trace, once seen for what it is, counts for nothing); someone passed in the dark who fits their habits; an
  // account of a night belied by the very person they named; strong words against them (a slip, a slip of the tongue
  // about the night, a witness), dreams of their guilt or innocence, a sworn watch slept through, a flinch at an old
  // charm, a hint at their nights, distrust voiced by others. At most caseCap.
  function caseAgainst(x) {
    const VR = RULES.verdict;
    let s =
      VR.sight * sightedAs(x).length + VR.lie * belied(x).length + VR.there * S.claims.filter(cl => cl.id === x.id && wasThere(cl)).length;
    S.clues.forEach(cl => {
      if (ruledOut(cl) || x.known[cl.cat] !== cl.val) return; // (as far as you have noted their habits)
      // (a trace by your tent pole tells of harm meant you in secret, not of the night's work: as much as being caught
      // at it)
      s += cl.source === 'spite' ? VR.spite : cl.status === 'genuine' ? VR.genuine : VR.trace;
    });
    S.testimony
      .filter(t => t.about === x.id && !discredited(t))
      .forEach(t => {
        const w = KINDS[t.kind] && KINDS[t.kind].weigh && KINDS[t.kind].weigh(t); // (by its kind's weight, if it has one)
        if (w != null) s += w;
      });
    return Math.max(0, Math.min(VR.caseCap, s));
  }
  // an account of a night that puts them, by their own word, where it happened (not the one attacked there)
  const wasThere = cl => !cl.attacked && cl.loc !== 'camp' && !!S.nights[cl.night] && cl.loc === S.nights[cl.night].crimeLoc;
  // sightings in the dark, by someone else, that fit what you know of someone's habits
  const sightedAs = x => S.sights.filter(sg => sg.id !== x.id && x.known[sg.cat] === sg.val);
  // what the camp no longer weighs: the word of one of the cult unmasked, and the dreams of someone who has owned that
  // they never dreamed
  function discredited(t) {
    const c = S.chars[t.from];
    return !!c && ((c.role === 'cult' && c.status === 'exposed') || (t.kind === 'vision' && claimOf(c).role !== 'seer'));
  }
  // the accounts someone gave of a night that the person they named does not bear out: they say they spent the evening
  // with someone who, asked in turn, says otherwise (one who will not say where they were bears out nothing, and belies
  // nothing either)
  const belied = x =>
    S.claims.filter(cl => {
      if (cl.id !== x.id || !cl.with) return false;
      const o = S.claims.find(k => k.night === cl.night && k.id === cl.with);
      return o && o.loc !== 'evade' && o.with !== x.id;
    });
  // ---------- your journal ----------
  function journal(t) {
    S.journal.push({ day: S.day, t });
  }

  return {
    testify,
    about,
    kind: k => KINDS[k],
    kinds: () => Object.keys(KINDS),
    addTrace,
    ruledOut,
    status: k => STATUS[k],
    addAccount,
    addSighting,
    caseAgainst,
    wasThere,
    sightedAs,
    discredited,
    belied,
    journal
  };
})();
