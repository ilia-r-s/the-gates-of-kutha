// ===================== THE CASEBOOK: people, evidence, omens, kit =====================
// It records; the deductions are yours. Marks (ally, suspect) and the omen notebook's ticks are the player's own. It also
// joins things up for you: the habits that turn up at a scene, what has been said of each person, whom a trace or a
// sighting fits, accounts that disagree, two people claiming one part. Played hardcore, it does none of that, and keeps
// only the bare record.
const bare = () => !!(S && S.hardcore);
function renderBook() {
  document.querySelectorAll('.tab').forEach(t => {
    const on = t.dataset.tab === S_ui.tab;
    t.setAttribute('aria-selected', on);
    t.classList.toggle('on', on);
  });
  const p = $('#tabPanel');
  if (!S) {
    draw(
      p,
      X(
        `<p class="dim pad">${bi('Your casebook fills as you work: each person’s habits, the traces left at every attack, the signs, and what the tablets say.', 'Ваш журнал заполняется по ходу работы: привычки каждого, следы после каждого нападения, знамения и то, что говорят таблички.')}</p>`
      )
    );
    return;
  }
  draw(p, X({ people: bookPeople, evidence: bookEvidence, omens: bookOmens, kit: bookKit }[S_ui.tab]()));
}
// how someone stands toward you, in a word, from hostile to devoted (trust −2 to 3)
const TRUST_SAY = {
  '-2': ['hostile', 'враждебно'],
  '-1': ['strained', 'натянуто'],
  0: ['reserved', 'сдержанно'],
  1: ['cordial', 'приветливо'],
  2: ['warm', 'тепло'],
  3: ['devoted', 'преданно']
};
function trustWord(c) {
  const r = trustOf(c);
  return `<span class="${r < 0 ? 'bad' : r >= 2 ? 'good' : r === 0 ? 'dim' : ''}">${bi(...TRUST_SAY[r])}</span>`;
}
const MARKS = { '?': 'Unmarked', ally: 'Ally', foe: 'Suspect' };
const PLACE_SHORT = {
  camp: 'in camp',
  village: 'at the coffee-house',
  store: 'in the finds magazine',
  canal: 'by the canal',
  trench: 'in Trench B',
  ziggurat: 'on the ziggurat',
  cemetery: 'by the Parthian graves'
};
const PLACE_RU = {
  camp: 'в лагере',
  village: 'в кофейне',
  store: 'в хранилище находок',
  canal: 'у канала',
  trench: 'в траншее Б',
  ziggurat: 'на зиккурате',
  cemetery: 'у парфянских могил'
};
const nightLabel = n => (n === 0 ? bi('The night Crane died', 'Ночь гибели Крейна') : bi(`Night ${n}`, `Ночь ${n}`));
const dayLabel = d => bi(`Day ${d}`, `День ${d}`);
// How each kind of testimony about someone shows on their card: [chip style, words], or nothing. t is the testimony,
// a the person it is about, f the speaker's name, fr the speaker's id. A claim shows only as the latest one made; a claim
// taken back no longer shows once they have come clean.
const CHIPS = {
  vision: (t, a, f, fr) =>
    t.verdict === 'cult'
      ? ['bad', bi(`${f} dreamt them guilty`, `${ru.c(fr, 'd')} приснилось: ${ru.gs(a, 'виновен', 'виновна')}`)]
      : ['good', bi(`${f} dreamt them clean`, `${ru.c(fr, 'd')} приснилось: ${ru.gs(a, 'невиновен', 'невиновна')}`)],
  distrust: (t, a, f, fr) => ['', bi(`${f} distrusts them`, `${ru.c(fr)} ${ru.gs(a, 'ему', 'ей')} не доверяет`)],
  react: (t, a) =>
    t.verdict === 'fear'
      ? ['warnc', bi('Flinched at relics', ru.gs(a, 'Вздрогнул при виде находки', 'Вздрогнула при виде находки'))]
      : t.verdict === 'greed'
        ? ['', bi('Eyed relics like a dealer', ru.gs(a, 'Приценивался к находке', 'Приценивалась к находке'))]
        : ['dimc', bi('Calm at relics', 'Находки не тревожат')],
  words: (t, a) =>
    t.verdict === 'fear'
      ? ['warnc', bi('Flinched at the tablets’ words', ru.gs(a, 'Вздрогнул от слов с табличек', 'Вздрогнула от слов с табличек'))]
      : t.verdict === 'greed'
        ? [
            '',
            bi('Asked what the tablet would fetch', ru.gs(a, 'Спросил, сколько дадут за табличку', 'Спросила, сколько дадут за табличку'))
          ]
        : ['dimc', bi('Calm at the tablets’ words', 'Слова с табличек не тревожат')],
  slip: (t, a) => ['bad strong', bi('Let something slip', ru.gs(a, 'Проговорился', 'Проговорилась'))],
  blurt: (t, a) => [
    'bad strong',
    bi('Knew what only the attacker could', ru.gs(a, 'Знал то, что знал лишь нападавший', 'Знала то, что знал лишь нападавший'))
  ],
  chill: () => ['warnc', bi('A chill when they spoke', 'Холодок при разговоре')],
  spite: (t, a) => [
    'bad',
    bi(
      'Caught at your tent, meaning you harm',
      ru.gs(a, 'Пойман у вашей палатки: хотел вам навредить', 'Поймана у вашей палатки: хотела вам навредить')
    )
  ],
  thief: (t, a) => ['', bi('Admitted smuggling', ru.gs(a, 'Признался в контрабанде', 'Призналась в контрабанде'))],
  claim: (t, a) =>
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
                : bi('Claims no part', 'Говорит, что ни при чём')
        ],
  recant: (t, a) =>
    S.testimony.some(x => x.kind === 'confess' && x.from === a.id)
      ? null
      : ['warnc', bi('Took back a claim', ru.gs(a, 'Взял свои слова назад', 'Взяла свои слова назад'))],
  confess: (t, a) => ['warnc', bi('Came clean', ru.gs(a, 'Признался сам', 'Призналась сама'))],
  tell: (t, a) => ['warnc', bi('Answered too quickly', ru.gs(a, 'Ответил слишком поспешно', 'Ответила слишком поспешно'))],
  failwatch: (t, a) => ['bad', bi('Slept through a sworn watch', ru.gs(a, 'Проспал обещанный дозор', 'Проспала обещанный дозор'))],
  // what you make of them yourself, and what others say of them
  mien: (t, a) => ['dimc', bi('Seems: ', 'С виду: ') + temperName(t.verdict, a)],
  temper: (t, a, f, fr) => ['dimc', bi(`${f}: `, `${ru.c(fr)}: `) + temperName(t.verdict, a)],
  bond: (t, a, f, fr) => {
    const [k, b] = t.verdict.split(':');
    return [
      'dimc',
      k === 'close'
        ? bi(`${f}: close to ${C(b).short}`, `${ru.c(fr)}: дружит с ${ru.c(b, 'i')}`)
        : bi(`${f}: cannot bear ${C(b).short}`, `${ru.c(fr)}: не выносит ${ru.c(b, 'a')}`)
    ];
  },
  tip: (t, a, f, fr) => ['', bi(`${f}: sells tablets on the side`, `${ru.c(fr)}: приторговывает табличками`)],
  feel: (t, a, f, fr) => [
    'dimc',
    {
      like: bi(`${f}: fond of them`, `${ru.c(fr)}: ${ru.gs(fr, 'привязан', 'привязана')} к ${ru.gs(a, 'нему', 'ней')}`),
      dislike: bi(`${f}: cannot stand them`, `${ru.c(fr)}: ${ru.gs(a, 'его', 'её')} не выносит`),
      flirt: bi(`${f}: rather taken with them`, `${ru.c(fr)}: ${ru.gs(fr, 'увлечён', 'увлечена')} ${ru.gs(a, 'им', 'ею')}`)
    }[t.verdict]
  ],
  flirt: (t, a, f, fr) => [
    'dimc',
    t.verdict === 'you'
      ? bi(`${f}: sweet on you`, `${ru.c(fr)}: ${ru.gs(a, 'неравнодушен', 'неравнодушна')} к вам`)
      : bi(`${f}: sweet on ${C(t.verdict).short}`, `${ru.c(fr)}: ${ru.gs(a, 'неравнодушен', 'неравнодушна')} к ${ru.c(t.verdict, 'd')}`)
  ],
  hint: (t, a, f, fr) => ['warnc', bi(`${f} hints at their nights`, `${ru.c(fr)} намекает на ${ru.gs(a, 'его', 'её')} ночные прогулки`)],
  // what you saw for yourself
  quarrel: (t, a) => [
    'dimc',
    bi(`Quarrelled with ${C(t.verdict).short}`, `${ru.gs(a, 'Поссорился', 'Поссорилась')} с ${ru.c(t.verdict, 'i')}`)
  ],
  feast: (t, a) => [
    'dimc',
    bi(`Sat with ${C(t.verdict).short} at the feast`, `${ru.gs(a, 'Сидел', 'Сидела')} рядом с ${ru.c(t.verdict, 'i')} на пиру`)
  ],
  witness: (t, a, f, fr) => [
    'bad strong',
    bi(`${f} saw them near the scene`, `${ru.c(fr)} ${ru.gs(fr, 'видел', 'видела')} ${ru.gs(a, 'его', 'её')} у места нападения`)
  ]
};
function chipsAbout(id) {
  const a = C(id);
  return S.testimony
    .filter(t => t.about === id && CHIPS[t.kind])
    .map(t => CHIPS[t.kind](t, a, S.chars[t.from] ? C(t.from).short : '', t.from))
    .filter(Boolean)
    .map(([cls, words]) => `<span class="chip${cls ? ' ' + cls : ''}">${words}</span>`)
    .join('');
}
// the camp's view of someone: who suspects them in earnest, and whether what they said before everyone proved true
function campChips(c) {
  const by = suspectedBy(c.id),
    cr = credit(c.id);
  return (
    (by.length && isFree(c)
      ? `<span class="chip warnc">${bi(`Suspected by ${nameList(by)}`, `${ru.gs(c, 'Его', 'Её')} подозревают: ${nameListRu(by)}`)}</span>`
      : '') +
    (cr > 0
      ? `<span class="chip good">${bi('Proven right before the camp', ru.gs(c, 'Оказался прав перед всем лагерем', 'Оказалась права перед всем лагерем'))}</span>`
      : cr < 0
        ? `<span class="chip bad">${bi('Proven wrong before the camp', ru.gs(c, 'Оказался неправ перед всем лагерем', 'Оказалась неправа перед всем лагерем'))}</span>`
        : '')
  );
}
// what people say of each other (gossip, tips, their own feelings), and what is said of you
function sayingLine(t) {
  const a = C(t.about).short;
  // what you saw for yourself: a quarrel at breakfast, two who sat together at a feast
  if (t.kind === 'quarrel' || t.kind === 'feast')
    return t.kind === 'quarrel'
      ? bi(`${a} and ${C(t.verdict).short} quarrelled at breakfast`, `${ru.c(t.about)} и ${ru.c(t.verdict)} поссорились за завтраком`)
      : bi(`${a} and ${C(t.verdict).short} sat together at the feast`, `${ru.c(t.about)} и ${ru.c(t.verdict)} сидели рядом на пиру`);
  const f = C(t.from).short;
  if (t.kind === 'feel')
    return {
      like: bi(
        `${f} says ${C(t.from).p} is fond of ${a}`,
        `${ru.c(t.from)}: ${ru.gs(t.from, 'привязан', 'привязана')} к ${ru.c(t.about, 'd')}`
      ),
      dislike: bi(`${f} says ${C(t.from).p} cannot stand ${a}`, `${ru.c(t.from)}: терпеть не может ${ru.c(t.about, 'a')}`),
      flirt: bi(`${f} speaks of ${a} with a certain warmth`, `${ru.c(t.from)} говорит ${ru.ob(t.about)} с особой теплотой`)
    }[t.verdict];
  if (t.kind === 'flirt')
    return t.verdict === 'you'
      ? bi(`${f} says ${a} is sweet on you`, `${ru.c(t.from)}: ${ru.c(t.about)} ${ru.gs(t.about, 'неравнодушен', 'неравнодушна')} к вам`)
      : bi(
          `${f} says ${a} is sweet on ${C(t.verdict).short}`,
          `${ru.c(t.from)}: ${ru.c(t.about)} ${ru.gs(t.about, 'неравнодушен', 'неравнодушна')} к ${ru.c(t.verdict, 'd')}`
        );
  if (t.kind === 'hint')
    return bi(`${f} hints that ${a} is out at night`, `${ru.c(t.from)} намекает, что ${ru.c(t.about)} бродит по ночам`);
  if (t.kind === 'temper')
    return bi(
      `${f} says ${a} is ${TEMPER_NAMES[t.verdict][0]}`,
      `${ru.c(t.from)}: ${ru.c(t.about)} — ${TEMPER_NAMES[t.verdict][ru.f(t.about) ? 2 : 1]}`
    );
  if (t.kind === 'tip')
    return bi(`${f} says ${a} sells tablets on the side`, `${ru.c(t.from)}: ${ru.c(t.about)} приторговывает табличками`);
  const [k, b] = t.verdict.split(':');
  return k === 'close'
    ? bi(`${f} says ${a} and ${C(b).short} are thick as thieves`, `${ru.c(t.from)}: ${ru.c(t.about)} и ${ru.c(b)} — не разлей вода`)
    : bi(`${f} says ${a} cannot bear ${C(b).short}`, `${ru.c(t.from)}: ${ru.c(t.about)} терпеть не может ${ru.c(b, 'a')}`);
}
function rumorLine(r) {
  const what = r.by
    ? r.kind === 'bad'
      ? bi(
          `${C(r.by).short} spoke against you at breakfast`,
          `${ru.c(r.by)} ${ru.gs(r.by, 'говорил', 'говорила')} о вас дурно за завтраком`
        )
      : bi(`${C(r.by).short} spoke well of you at breakfast`, `${ru.c(r.by)} ${ru.gs(r.by, 'хвалил', 'хвалила')} вас за завтраком`)
    : (([en, rus]) => bi(`Word got round ${en}`, `По лагерю разошлось, ${rus}`))(DEED_SAID[r.kind](C(r.about)));
  const eff = [
    r.down.length ? bi(`cooler: ${nameList(r.down)}`, `охладели: ${nameListRu(r.down)}`) : '',
    r.up.length ? bi(`warmer: ${nameList(r.up)}`, `потеплели: ${nameListRu(r.up)}`) : ''
  ]
    .filter(Boolean)
    .join('; ');
  return what + (eff ? ` <span class="dim">(${eff})</span>` : '');
}
function bookPeople() {
  return castOrder(S.order)
    .map(C)
    .map(c => {
      const st = c.status === 'present' ? '' : `<div class="p-status">${statusText(c)}</div>`;
      const tr = CATS.map(k => {
        if (!c.known[k]) return `<span class="tr unk"><em>${bi(TRAITS[k].label)}</em> ?</span>`;
        // a trait found at a scene: the attacker's, as far as you know; or not, once you have seen it so (a thief's, an
        // earlier passer-by's, or planted)
        // (and one found by your tent pole, after harm meant you in the night: game/hazards.js)
        const all = S.clues.filter(cl => cl.cat === k && cl.val === c.known[k]),
          tent = all.filter(cl => cl.source === 'spite'),
          hits = all.filter(cl => cl.source !== 'spite'),
          real = hits.filter(cl => !notAttackers(cl));
        const cls = bare() ? '' : real.length ? ' hit' : hits.length || tent.length ? ' thiefhit' : '',
          where = (real.length ? real : hits).map(cl => `${nightLabel(cl.day)}, ${bi(LOCS[cl.loc].name)}`).join('; '),
          why =
            real.length || !hits.length
              ? ''
              : hits.some(cl => cl.status === 'planted')
                ? bi(' (a planted trace)', ' (подброшенный след)')
                : hits.some(cl => cl.status === 'stray')
                  ? bi(' (left there earlier)', ' (оставлен там раньше)')
                  : bi(' (a thief’s trace)', ' (след вора)'),
          title = [
            where ? bi('Also found at a scene: ', 'Также найдено на месте нападения: ') + where + why : '',
            tent.length
              ? bi('Found by your tent pole: ', 'Найдено у шеста вашей палатки: ') + tent.map(cl => nightLabel(cl.day)).join('; ')
              : ''
          ]
            .filter(Boolean)
            .join('. ');
        return `<span class="tr${cls}"${title && !bare() ? ` title="${title}"` : ''}><em>${bi(TRAITS[k].label)}</em> <span class="tv">${bi(TRAITS[k].vals[c.known[k]].name)}</span></span>`;
      }).join('');
      return `<div class="person s-${c.status}"><div class="p-head"><svg class="ava" viewBox="46 30 108 108" aria-hidden="true">${portrait(c.id, 'neutral', 0, `book-${c.id}-`)}</svg><div class="p-id"><div class="p-name">${bi(c.name, capS(ru.cf(c)))}${roleBadge(c)}</div><div class="p-job">${bi(c.job, ru.ch(c).job)} · <span class="trust">${bi('trust', 'доверие')} ${trustWord(c)}</span></div></div>
      <button type="button" class="mark m-${c.mark === '?' ? 'none' : c.mark}" data-mark="${c.id}" aria-label="${bi(`Your mark for ${c.short}: ${MARKS[c.mark]}. Click to change.`, `Ваша отметка для ${ru.c(c, 'g')}: ${ruMark(c).toLowerCase()}. Нажмите, чтобы изменить.`)}">${bi(MARKS[c.mark], ruMark(c))}</button></div>
      ${st}<div class="p-traits">${tr}</div><div class="p-chips">${bare() ? '' : campChips(c) + chipsAbout(c.id)}</div></div>`;
    })
    .join('');
}
// The evidence tab, section by section.
function bookEvidence() {
  return [evTraces, evWhereabouts, evSightings, evClaims, evTestimony, evNoticed, evSayings, evRumours, evInquiries, evCamp, evJournal]
    .map(section => section())
    .join('');
}
// Played hardcore, what you noticed of people yourself is kept here, in the order it happened, as plain record (played
// the usual way, it shows on their cards instead).
const NOTICED = {
  react: (t, a) =>
    t.verdict === 'fear'
      ? bi(`${a.short} flinched at something from the tell`, `${ru.c(a)} ${ru.gs(a, 'вздрогнул', 'вздрогнула')} при виде находки`)
      : t.verdict === 'greed'
        ? bi(`${a.short} weighed a find like a dealer`, `${ru.c(a)} ${ru.gs(a, 'приценивался', 'приценивалась')} к находке, как торговец`)
        : bi(`${a.short} took a find calmly`, `${ru.c(a)} спокойно ${ru.gs(a, 'отнёсся', 'отнеслась')} к находке`),
  words: (t, a) =>
    t.verdict === 'fear'
      ? bi(`${a.short} flinched at a line from the tablets`, `${ru.c(a)} ${ru.gs(a, 'вздрогнул', 'вздрогнула')} от строки с табличек`)
      : t.verdict === 'greed'
        ? bi(`${a.short} asked what the tablet would fetch`, `${ru.c(a)} ${ru.gs(a, 'спросил', 'спросила')}, сколько дадут за табличку`)
        : bi(`${a.short} read a line from the tablets calmly`, `${ru.c(a)} спокойно ${ru.gs(a, 'прочёл', 'прочла')} строку с табличек`),
  slip: (t, a) =>
    bi(
      `${a.short} let something slip when pressed`,
      `${ru.c(a)} ${ru.gs(a, 'проговорился', 'проговорилась')}, когда на ${ru.gs(a, 'него', 'неё')} надавили`
    ),
  blurt: (t, a) =>
    bi(
      `${a.short} knew something of a night that nobody had told`,
      `${ru.c(a)} ${ru.gs(a, 'знал', 'знала')} о ночи то, чего никто не рассказывал`
    ),
  chill: (t, a) => bi(`A chill as ${a.short} spoke`, `Холодок, пока говорил${ru.gs(a, '', 'а')} ${ru.c(a)}`),
  spite: (t, a) =>
    bi(
      `${a.short} was at your tent in the night, meaning you harm`,
      `${ru.c(a)} ${ru.gs(a, 'побывал', 'побывала')} ночью у вашей палатки, желая вам зла`
    ),
  tell: (t, a) => bi(`${a.short} answered too quickly`, `${ru.c(a)} ${ru.gs(a, 'ответил', 'ответила')} слишком поспешно`),
  failwatch: (t, a) =>
    bi(
      `${a.short} swore to watch your tent, and slept`,
      `${ru.c(a)} ${ru.gs(a, 'клялся', 'клялась')} стеречь вашу палатку — и ${ru.gs(a, 'проспал', 'проспала')}`
    ),
  mien: (t, a) => bi(`${a.short} seems: `, `${ru.c(a)}, с виду: `) + temperName(t.verdict, a)
};
function evNoticed() {
  if (!bare()) return '';
  const seen = S.testimony.filter(t => NOTICED[t.kind] && S.chars[t.about]);
  return seen.length
    ? `<h4>${bi('What you noticed', 'Что вы заметили')}</h4><ul class="tlog">${seen
        .slice()
        .reverse()
        .map(t => `<li><span class="c-day">${dayLabel(t.day)}</span> ${NOTICED[t.kind](t, C(t.about))}</li>`)
        .join('')}</ul>`
    : '';
}
// The traces left at each scene, newest first, and whom each could fit.
function evTraces() {
  let h = `<h4>${bi('Traces', 'Следы')}</h4>`;
  if (!S.clues.length)
    h += `<p class="dim">${bi('An attack in the night usually leaves a trace at the scene. Examine a scene the next day to test it.', 'Ночное нападение обычно оставляет на месте след. Осмотрите место на следующий день, чтобы его проверить.')}</p>`;
  h += S.clues
    .slice()
    .reverse()
    .map(cl => {
      // the night's dead too, marked so: one of the cult may have left a trace, and been killed by another since
      const pool = castOrder(S.order).map(C),
        nm = c => (c.status === 'taken' ? bi(`${c.short} (dead)`, `${ru.c(c)} (${ru.gs(c, 'погиб', 'погибла')})`) : bi(c.short, ru.c(c)));
      const fits = pool.filter(c => c.known[cl.cat] === cl.val);
      const unk = pool.filter(c => !c.known[cl.cat]);
      // (one found by your tent pole, after harm meant you in the night, is no scene, and nothing to examine:
      // game/hazards.js)
      const tent = cl.source === 'spite',
        where = tent ? bi('By your tent pole', 'У шеста вашей палатки') : bi(LOCS[cl.loc].name);
      const stt = tent
        ? ''
        : cl.status === 'genuine'
          ? `<span class="chip bad">${bi('Genuine', 'Подлинный')}</span>`
          : cl.status === 'thief'
            ? `<span class="chip">${bi('A thief’s', 'Воровской')}</span>`
            : cl.status === 'stray'
              ? `<span class="chip">${bi('Left earlier', 'Оставлен раньше')}</span>`
              : cl.status === 'planted'
                ? `<span class="chip warnc">${bi('Planted', 'Подброшен')}</span>`
                : `<span class="chip dimc">${bi('Unverified', 'Не проверен')}</span>`;
      if (bare())
        return `<div class="clue"><div class="c-top"><span class="c-day">${nightLabel(cl.day)} · ${where}</span>${stt}</div><div class="c-trace">${bi(TRAITS[cl.cat].vals[cl.val].clue)}</div></div>`;
      return `<div class="clue"><div class="c-top"><span class="c-day">${nightLabel(cl.day)} · ${where}</span>${stt}</div><div class="c-trace">${bi(TRAITS[cl.cat].vals[cl.val].clue)}</div>
      <div class="c-fit"><span>${bi('Fits:', 'Совпадения:')}</span> ${fits.length ? fits.map(nm).join(', ') : `<span class="dim">${bi('no one you know of', 'никого из известных вам')}</span>`}${unk.length ? ` <span class="dim">${bi('· unchecked: ', '· не проверены: ')}${unk.map(nm).join(', ')}</span>` : ''}</div></div>`;
    })
    .join('');
  return h;
}
// Where people say they were, night by night.
function evWhereabouts() {
  let h = '';
  const nights = [...new Set(S.claims.map(x => x.night))].sort((a, b) => b - a);
  h +=
    `<h4>${bi('Whereabouts', 'Кто где был')}</h4>` +
    (nights.length
      ? nights
          .map(
            n =>
              `<div class="wn"><div class="c-day">${nightLabel(n)}</div><ul class="tlog">${S.claims
                .filter(x => x.night === n)
                .map(x => `<li><b>${bi(C(x.id).short, ru.c(x.id))}</b>: ${whereabouts(x)}</li>`)
                .join('')}</ul>${beliedOn(n)}</div>`
          )
          .join('')
      : `<p class="dim">${bi('Ask people where they were, then compare their accounts.', 'Спрашивайте людей, где они были, и сравнивайте их рассказы.')}</p>`);
  return h;
}
// what someone said of a night: attacked where it happened, would not say, or where and with whom
function whereabouts(x) {
  if (x.attacked) return bi(`attacked ${LOCS[x.loc].at}`, `${ru.gs(x.id, 'на него напали', 'на неё напали')} ${ru.loc(x.loc, 'at')}`);
  if (x.loc === 'evade') return bi('would not say', ru.gs(x.id, 'не сказал', 'не сказала'));
  const there = !bare() && wasThere(x);
  return bi(
    `${PLACE_SHORT[x.loc]}${x.with ? ', with ' + C(x.with).short : ', alone'}${there ? ': where it happened' : ''}`,
    `${PLACE_RU[x.loc]}${x.with ? ', с ' + ru.c(x.with, 'i') : ru.gs(x.id, ', один', ', одна')}${there ? ': там, где всё случилось' : ''}`
  );
}
// the accounts of night n that the person named does not bear out
function beliedOn(n) {
  if (bare()) return '';
  return castOrder(S.order)
    .map(C)
    .flatMap(x =>
      belied(x)
        .filter(cl => cl.night === n)
        .map(cl => [x, C(cl.with)])
    )
    .map(
      ([x, p]) =>
        `<p class="warn">${bi(`${x.short} says ${x.p} was with ${p.short}; ${p.short} says otherwise.`, `${ru.c(x)} говорит, что ${ru.gs(x, 'был', 'была')} с ${ru.c(p, 'i')}; ${ru.c(p)} говорит иное.`)}</p>`
    )
    .join('');
}
// whom a sighting fits, of those whose habits you know
function sightFits(x) {
  if (bare()) return '';
  const fits = castOrder(S.order)
    .map(C)
    .filter(c => c.id !== x.id && c.known[x.cat] === x.val);
  return fits.length
    ? ` <span class="dim">${bi(`· fits ${listNames(fits.map(c => c.short))}`, `· подходит: ${ru.list(fits.map(c => ru.c(c)))}`)}</span>`
    : '';
}
// Whom people passed in the dark.
function evSightings() {
  let h = '';
  if (S.sights.length)
    h +=
      `<h4>${bi('Sightings', 'Кого видели в темноте')}</h4><ul class="tlog">` +
      S.sights
        .slice()
        .reverse()
        .map(
          x =>
            `<li><span class="c-day">${nightLabel(x.night)}</span> ${bi(`${C(x.id).short} passed someone near ${x.where === 'camp' ? 'your tent' : LOCS[x.where].ref}: ${WIT[x.val]}`, `${ru.c(x.id)} ${ru.gs(x.id, 'встретил', 'встретила')} кого-то у ${x.where === 'camp' ? 'вашей палатки' : ru.loc(x.where, 'gen')}: ${RU_WIT[x.val]}`)}${sightFits(x)}</li>`
        )
        .join('') +
      '</ul>';
  return h;
}
// Who claims which part in Crane's diary, and where two claim the same one.
function evClaims() {
  let h = '';
  // (each by the day their present claim was made: the day they took back an earlier one, if they did)
  const since = c => {
    const cl = claimOf(c);
    return cl.recanted != null && cl.claimed !== false ? cl.recanted : cl.said;
  };
  const said = castOrder(S.order)
    .map(C)
    .filter(c => claimOf(c).said != null)
    .sort((x, y) => since(x) - since(y));
  const claimPhrase = c => {
    const r = claimOf(c).role;
    return r === 'seer'
      ? bi(`says ${c.p} dreams true`, 'говорит, что видит вещие сны')
      : r === 'warden'
        ? bi(`says ${c.p} keeps watch at night`, 'говорит, что по ночам стоит на страже')
        : r === 'evade'
          ? bi(
              `will not say what part, if any, ${c.p} plays`,
              `не говорит, какая роль ${ru.gs(c, 'ему', 'ей')} отведена, если отведена вообще`
            )
          : bi(`says ${c.p} has no part in the diary`, `говорит, что ${ru.gs(c, 'непричастен', 'непричастна')} к дневнику`);
  };
  const backPhrase = c => {
    const cl = claimOf(c),
      d = cl.said;
    if (cl.recanted == null || cl.claimed === false) return ''; // (one who had said nothing before had nothing to take back)
    // before everyone, as anyone saw it (a cultist's retreat before everyone looks the same)
    return ` <span class="dim">${
      cl.how === 'confess' || cl.how === 'public' || cl.aloud
        ? bi(
            `(said otherwise on day ${d}, and came clean of it)`,
            `(в день ${d} ${ru.gs(c, 'говорил', 'говорила')} иное — и ${ru.gs(c, 'сам признался', 'сама призналась')} во лжи)`
          )
        : bi(
            `(said otherwise on day ${d}, and took it back)`,
            `(в день ${d} ${ru.gs(c, 'говорил', 'говорила')} иное — и ${ru.gs(c, 'отказался', 'отказалась')} от своих слов)`
          )
    }</span>`;
  };
  h +=
    `<h4>${bi('Claims', 'Кто кем себя называет')}</h4>` +
    (said.length
      ? `<ul class="tlog">${said.map(c => `<li><span class="c-day">${dayLabel(since(c))}</span> <b>${bi(c.short, ru.c(c))}</b> ${claimPhrase(c)}${backPhrase(c)}</li>`).join('')}</ul>`
      : `<p class="dim">${bi('Ask people about Crane’s diary. One of them dreams true, one keeps watch, one is a thief, and not everyone will tell you the truth.', 'Спрашивайте людей о дневнике Крейна. Один из них видит вещие сны, другой стоит на страже, третий — вор, и не каждый скажет вам правду.')}</p>`);
  [
    ['seer', 'dream true', 'видят вещие сны', 'one Dreamer', 'одного сновидца'],
    ['warden', 'keep watch', 'стоят на страже', 'one Watcher', 'одного стража']
  ].forEach(([r, en, rs, one, oneRu]) => {
    const who = said.filter(c => claimOf(c).role === r && isFree(c));
    if (who.length > 1 && !bare())
      h += `<p class="warn">${bi(`${listNames(who.map(c => c.short))} ${who.length === 2 ? 'both' : 'all'} say they ${en}. Crane’s diary names ${one}.`, `${capS(ru.list(who.map(c => ru.c(c))))} — ${who.length > 2 ? 'все' : who.every(ru.f) ? 'обе' : 'оба'} говорят, что ${rs}. Дневник Крейна называет ${oneRu}.`)}</p>`;
  });
  return h;
}
// Dreams told and distrust spoken, newest first.
function evTestimony() {
  let h = '';
  const ts = S.testimony.filter(t => t.kind === 'vision' || t.kind === 'distrust');
  h +=
    `<h4>${bi('Testimony', 'Показания')}</h4>` +
    (ts.length
      ? `<ul class="tlog">${ts
          .slice()
          .reverse()
          .map(
            t =>
              `<li><span class="c-day">${dayLabel(t.day)}</span> ${bi(
                `${C(t.from).short} ${t.kind === 'vision' ? (t.verdict === 'cult' ? 'dreamt guilty:' : 'dreamt clean:') : 'distrusts'} <b>${C(t.about).short}</b>`,
                t.kind === 'vision'
                  ? `${ru.c(t.from, 'd')} приснилось, что ${t.verdict === 'cult' ? ru.gs(t.about, 'виновен', 'виновна') : ru.gs(t.about, 'невиновен', 'невиновна')} <b>${ru.c(t.about)}</b>`
                  : `${ru.c(t.from)} не доверяет <b>${ru.c(t.about, 'd')}</b>`
              )}</li>`
          )
          .join('')}</ul>`
      : `<p class="dim">${bi('Ask people whom they distrust. Some will tell you about their dreams.', 'Спрашивайте людей, кому они не доверяют. Кто-то расскажет и о своих снах.')}</p>`);
  return h;
}
// What people say of each other: temper, liking, tips.
function evSayings() {
  let h = '';
  const says = S.testimony.filter(t => ['temper', 'bond', 'tip', 'feel', 'flirt', 'hint', 'quarrel', 'feast'].includes(t.kind));
  if (says.length)
    h += `<h4>${bi('What people say of each other', 'Что люди говорят друг о друге')}</h4><p class="dim rk-rules">${bi('Gossip is only as true as the gossip, and people are kind to their friends.', 'Сплетня правдива ровно настолько, насколько правдив сплетник, а к друзьям люди снисходительны.')}</p><ul class="tlog">${says
      .slice()
      .reverse()
      .map(t => `<li><span class="c-day">${dayLabel(t.day)}</span> ${sayingLine(t)}</li>`)
      .join('')}</ul>`;
  return h;
}
// What is said of you around the camp.
function evRumours() {
  let h = '';
  if (S.rumors && S.rumors.length)
    h += `<h4>${bi('What is said of you', 'Что говорят о вас')}</h4><ul class="tlog">${S.rumors
      .slice()
      .reverse()
      .map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${rumorLine(r)}</li>`)
      .join('')}</ul>`;
  return h;
}
// Every inquiry, newest first: whom you accused, how the camp's hands went, and what came of it (game/verdict.js).
function evInquiries() {
  const q = S.inquiries || [];
  if (!q.length) return '';
  const names = (ids, none) => (ids.length ? bi(nameList(ids), nameListRu(ids)) : none);
  const lines = q
    .slice()
    .reverse()
    .map(v => {
      const x = C(v.id),
        what = !v.passed
          ? bi('the camp refused', 'лагерь отказал')
          : x.status === 'exposed'
            ? bi('unmasked', 'разоблачение')
            : bi('sent away', ru.gs(x, 'отослан', 'отослана'));
      return `<li><span class="c-day">${dayLabel(v.day)}</span> ${bi(`${x.short}:`, `${ru.c(x)}:`)} ${what}. <span class="dim">${bi('With you', 'За')}: ${names(v.back, bi('nobody', 'никого'))}; ${bi('against', 'против')}: ${names(v.against, bi('nobody', 'никого'))}${v.silent.length ? `; ${bi('silent', 'молчали')}: ${names(v.silent, '')}` : ''}.</span></li>`;
    })
    .join('');
  return `<h4>${bi('Inquiries', 'Дознания')}</h4><ul class="tlog">${lines}</ul>${S.walkout ? `<p class="dim">${bi(`Since day ${S.walkout} the camp will hold no more inquiries.`, `С ${S.walkout}-го дня лагерь больше не собирается на дознания.`)}</p>` : ''}`;
}
// What the camp made of what happened before everyone, newest first (people/camp.js).
const STIR_SAID = {
  calledOut: (b, a) =>
    b
      ? [`${b.short} called you out over ${a.short}`, `${ru.c(b)} ${ru.gs(b, 'упрекнул', 'упрекнула')} вас из-за ${ru.c(a, 'g')}`]
      : [`Silence, when ${a.short} was sent away`, `Молчание, когда ${ru.c(a, 'a')} отослали`],
  praised: (b, a) =>
    b
      ? [
          `${b.short} praised you for unmasking ${a.short}`,
          `${ru.c(b)} ${ru.gs(b, 'похвалил', 'похвалила')} вас за разоблачение ${ru.c(a, 'g')}`
        ]
      : [`${a.short} unmasked`, `${ru.c(a)}: разоблачение`],
  grief: (b, a) =>
    b
      ? [`${b.short} grieved aloud for ${a.short}`, `${ru.c(b)} ${ru.gs(b, 'горевал', 'горевала')} ${ru.ob(a)} при всех`]
      : [`The camp mourned ${a.short}`, `Лагерь оплакивал ${ru.c(a, 'a')}`],
  sleptWatch: (b, a) => [`${a.short} slept through a sworn watch`, `${ru.c(a)} ${ru.gs(a, 'проспал', 'проспала')} обещанный дозор`],
  dreamt: (b, a) => [
    `${b.short} dreamt ${a.short} guilty, before everyone`,
    `${ru.c(b, 'd')} приснилось, что ${ru.c(a)} ${ru.gs(a, 'виновен', 'виновна')}, — сказано при всех`
  ],
  dreamtClean: (b, a) => [
    `${b.short} dreamt ${a.short} clean, before everyone`,
    `${ru.c(b, 'd')} приснилось, что ${ru.c(a)} ${ru.gs(a, 'невиновен', 'невиновна')}, — сказано при всех`
  ],
  blame: (b, a) => [`${b.short} blamed ${a.short} aloud`, `${ru.c(b)} при всех ${ru.gs(b, 'обвинил', 'обвинила')} ${ru.c(a, 'a')}`],
  song: (b, a) => [`The diggers sang of ${a.short}`, `Землекопы пели про ${ru.c(a, 'a')}`],
  confessed: (b, a) => [`${a.short} came clean before everyone`, `${ru.c(a)} ${ru.gs(a, 'признался', 'призналась')} при всех`],
  onto: (b, a) =>
    b
      ? [
          `${b.short} said aloud that the dead had named ${a.short}`,
          `${ru.c(b)} вслух ${ru.gs(b, 'напомнил', 'напомнила')}, что на ${ru.c(a, 'a')} указали ещё до этой смерти`
        ]
      : [`The camp remembered that the dead had named ${a.short}`, `Лагерь вспомнил, что на ${ru.c(a, 'a')} указали ещё до этой смерти`],
  planted: (b, a) => [`A trace of ${a.short}’s found by a tent`, `У палатки нашли след ${ru.c(a, 'g')}`],
  kept: (b, a) => [
    `${a.short} claimed to have seen someone off from your tent`,
    `${ru.c(a)} ${ru.gs(a, 'уверял', 'уверяла')}, что ${ru.gs(a, 'спугнул', 'спугнула')} кого-то у вашей палатки`
  ],
  // the night's dead the camp takes for innocent, rightly or not
  proven: (b, a) =>
    a.status === 'taken'
      ? [
          `The camp took ${a.short}’s death to bear ${b.short} out`,
          `Лагерь счёл, что смерть ${ru.c(a, 'g')} подтвердила правоту ${ru.c(b, 'g')}`
        ]
      : [
          `${b.short} was proven right about ${a.short}`,
          `${ru.c(b)} ${ru.gs(b, 'оказался прав', 'оказалась права')} насчёт ${ru.c(a, 'g')}`
        ],
  disproven: (b, a) =>
    a.status === 'taken'
      ? [
          `The camp took ${a.short}’s death to give ${b.short} the lie`,
          `Лагерь счёл, что смерть ${ru.c(a, 'g')} опровергла слова ${ru.c(b, 'g')}`
        ]
      : [
          `${b.short} was proven wrong about ${a.short}`,
          `${ru.c(b)} ${ru.gs(b, 'оказался неправ', 'оказалась неправа')} насчёт ${ru.c(a, 'g')}`
        ]
};
function stirLine(r) {
  const [en, rus] = STIR_SAID[r.kind](r.by && C(r.by), C(r.about));
  const eff = r.moved
    .map(([what, whom, d, ids, lvl]) => {
      if (what === 'trust')
        return d < 0
          ? bi(`cooler toward you: ${nameList(ids)}`, `охладели к вам: ${nameListRu(ids)}`)
          : bi(`warmer toward you: ${nameList(ids)}`, `потеплели к вам: ${nameListRu(ids)}`);
      const said = susSay(ids, C(whom), d, lvl);
      return bi(`${nameList(ids)} ${said[0]}`, `${nameListRu(ids)} ${said[1]}`);
    })
    .concat(r.after ? [r.after] : [])
    .join('; ');
  return bi(en, rus) + (eff ? ` <span class="dim">(${eff})</span>` : '');
}
function evCamp() {
  const seen = (S.stirs || []).filter(r => r.moved.length || r.after || r.spoke); // the moments that moved someone, or had a voice
  if (!seen.length) return '';
  return `<h4>${bi('What the camp makes of it', 'Что думает лагерь')}</h4><p class="dim rk-rules">${bi('What happens before everyone moves people, each in their own way: their trust in you, and whom they suspect.', 'Всё, что происходит при всех, задевает людей — каждого по-своему: их доверие к вам и их подозрения.')}</p><ul class="tlog">${seen
    .slice()
    .reverse()
    .map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${stirLine(r)}</li>`)
    .join('')}</ul>`;
}
// Your journal, newest first.
function evJournal() {
  let h = '';
  if (S.journal.length)
    h += `<h4>${bi('Journal', 'Дневник')}</h4><ul class="tlog">${S.journal
      .slice()
      .reverse()
      .map(j => `<li><span class="c-day">${dayLabel(j.day)}</span> ${j.t}</li>`)
      .join('')}</ul>`;
  return h;
}
const ROLE_SEEN = { cult: 'Cultist', smuggler: 'Smuggler', warden: 'Watcher', innocent: 'Not a cultist' };
function roleBadge(c) {
  const r = c.status === 'exposed' ? 'cult' : S.revealed && S.revealed[c.id];
  return r ? `<span class="rolebadge rb-${r}">${bi(ROLE_SEEN[r], RU_SEEN[r][ru.f(c) ? 1 : 0])}</span>` : '';
}
// ---------- the Omens tab: a notebook for the god puzzle. It records; the deduction is yours. ----------
const GM_SAY = ['unmarked', 'ruled in', 'ruled out'],
  GM_SAY_RU = ['без отметки', 'принято', 'исключено'];
// a mark you set yourself, on or off: "I saw this"
function gmToggle(key, label, aria) {
  const v = S.gm[key] || 0;
  return `<button type="button" class="gm${v ? ' on' : ''}" data-gm="${key}" data-toggle="1" aria-pressed="${v ? 'true' : 'false'}" aria-label="${aria}">${v ? '✓ ' : ''}${label}</button>`;
}
function gmChip(key, label, aria) {
  const v = S.gm[key] || 0;
  return `<button type="button" class="gm${v === 1 ? ' on' : v === 2 ? ' off' : ''}" data-gm="${key}" aria-label="${aria}: ${bi(GM_SAY[v], GM_SAY_RU[v])}. ${bi('Click to change.', 'Нажмите, чтобы изменить.')}">${v === 1 ? '✓ ' : ''}${label}</button>`;
}
function gmRow(lab, key, withNone, tag, extra) {
  const opts =
    S.gods.map(g => gmChip(`${key}:${g}`, bi(GODS[g].name), `${lab}, ${bi(GODS[g].name)}`)).join('') +
    (withNone ? gmChip(`${key}:none`, bi('Nothing', 'Никого'), `${lab}, ${bi('binds nothing', 'не связывает никого')}`) : '') +
    (extra || '');
  return `<div class="rk-row"><div class="rk-lab">${lab}${tag ? ` <span class="rk-tag">${tag}</span>` : ''}</div><div class="rk-opts">${opts}</div></div>`;
}
function bookOmens() {
  const seen = S.omenLog.map(o => ({ si: o.si, day: o.day, v: o.v || 0 }));
  const known = S.factKnown.map(i => S.facts[i]),
    reads = Object.values(S.readings);
  const fsigns = [...new Set(known.filter(f => f.sign != null).map(f => f.sign))],
    titles = titlesMet();
  const arts = S.charms.filter(w => has(w) || S.log.charms.includes(w) || reads.some(r => r.w === w));
  let h = `<h4>${bi('Your reckoning', 'Ваши выкладки')}</h4><p class="dim rk-rules">${bi('Every sign answers to two powers, and every power has four signs. In the tablets each power goes by two old titles, the signs are written as omen formulas, and the charms are known only by the marks they bear: match them to what you have seen and what you carry. Six old charms lie in the tell: four are wards, one against each power, and two bind nothing. Tap a name once to rule it in, again to rule it out.', 'Каждое знамение отвечает двум силам, и у каждой силы четыре знамения. В табличках у каждой силы два древних титула, знамения записаны как формулы предсказаний, а амулеты узнаются лишь по приметам, которые на них есть: сопоставьте их с тем, что вы видели и что носите с собой. В холме лежат шесть древних амулетов: четыре из них — обереги, по одному против каждой силы, а два не связывают никого. Нажмите на имя один раз, чтобы принять его, второй — чтобы исключить.')}</p><div class="reck">`;
  h += gmRow(bi('The power below Kutha', 'Сила под Кутой'), 'p', false);
  if (titles.length)
    h +=
      `<div class="rk-sec">${bi('Old titles', 'Древние титулы')}</div>` +
      titles.map(e => gmRow(bi(capS(ttEn(e)), capS(ttRu(e))), 't' + e, false)).join('');
  if (fsigns.length)
    h +=
      `<div class="rk-sec">${bi('Signs, as the tablets write them', 'Знамения, как их записывают таблички')}</div>` +
      fsigns
        .map(si =>
          gmRow(
            bi(`If ${fmlEn(si)}…`, `Если ${fmlRu(si)}…`),
            's' + si,
            false,
            null,
            gmToggle(
              'v' + si,
              bi('I saw this', 'Замечено'),
              bi(`Mark as seen: if ${fmlEn(si)}`, `Отметить как замеченное: если ${fmlRu(si)}`)
            )
          )
        )
        .join('');
  if (arts.length)
    h +=
      `<div class="rk-sec">${bi('Charms', 'Амулеты')}</div>` +
      arts.map(w => gmRow(bi(ITEMS[w].name), 'w' + w, true, has(w) ? bi('carried', 'при вас') : '')).join('');
  h += '</div>';
  h +=
    `<h4>${bi('Signs seen', 'Замеченные знамения')}</h4>` +
    (seen.length
      ? `<ul class="tlog">${seen.map(x => `<li><span class="c-day">${dayLabel(x.day)}</span> ${bi(SIGN_POOL[x.si].texts[x.v])}</li>`).join('')}</ul>`
      : `<p class="dim">${bi('None yet. Kutha shows them at dawn, and to those who search.', 'Пока ни одного. Кута являет их на рассвете — и тем, кто ищет.')}</p>`);
  h +=
    `<h4>${bi('The tablets', 'Таблички')}</h4>` +
    (known.length
      ? `<ul class="tlog">${known.map(f => `<li><span class="dingir" aria-hidden="true">𒀭</span>${f.text}</li>`).join('')}</ul>`
      : `<p class="dim">${bi('Nothing translated yet. Fragments turn up in the trench and the finds magazine.', 'Пока ничего не переведено. Обломки табличек попадаются в траншее и в хранилище находок.')}</p>`);
  if (S.glosses.length)
    h +=
      `<h4>${bi('What the titles mean', 'Что значат титулы')}</h4><p class="dim rk-rules">${bi('Anselm, Ilse and Zahrun know the old titles. A cultist would lie about the power below, and might about the others; even an honest memory can slip.', 'Ансельм, Ильза и Захрун знают древние титулы. Сектант солгал бы о силе под Кутой, а может, и о других; подвести может и честная память.')}</p><ul class="tlog">` +
      S.glosses.map(gl => `<li><span class="c-day">${dayLabel(gl.day)}</span> ${glossNote(gl)}</li>`).join('') +
      '</ul>';
  if (reads.length)
    h +=
      `<h4>${bi('Readings', 'Прочтения')}</h4><p class="dim rk-rules">${bi('Anselm and Ilse read the charms you show them. A cultist would read the ward that matters falsely, and perhaps the rest.', 'Ансельм и Ильза читают амулеты, которые вы им показываете. Сектант прочёл бы ложно оберег, который важен, — а может, и остальные.')}</p><ul class="tlog">` +
      reads.map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${readingNote(r)}</li>`).join('') +
      '</ul>';
  return h;
}
function bookKit() {
  let h = `<h4>${bi('Carried', 'При вас')}</h4>`;
  h += S.items.length
    ? S.items
        .map(
          it =>
            `<div class="item"><div class="i-name">${bi(ITEMS[it].name)}${ITEMS[it].ward ? ` <span class="chip">${bi('old charm', 'древний амулет')}</span>` : ''}</div><div class="i-desc">${bi(ITEMS[it].desc)}${ITEMS[it].ward ? ' ' + bi(...marksSee(it)) : ''}</div>${it === 'brandy' && !S.ended ? `<button type="button" class="mini" id="drinkBtn">${bi('Drink now · steadies your nerve', 'Выпить сейчас · успокаивает нервы')}</button>` : ''}</div>`
        )
        .join('')
    : `<p class="dim">${bi('Nothing yet. Search the site.', 'Пока ничего. Обыщите раскоп.')}</p>`;
  h += `<h4>${bi('Tablet fragments', 'Обломки табличек')}</h4><p>${S.fragments ? bi(`${S.fragments} waiting to be translated at camp.`, `Ждут перевода в лагере: ${S.fragments}.`) : bi('None waiting.', 'Переводить нечего.')}</p>`;
  h += `<h4>${bi('Your trade', 'Ваше ремесло')}</h4><p>${
    {
      philologist: bi('Philologist: translation comes easier.', 'Филолог: переводить легче.'),
      soldier: bi('Old soldier: pressing and examining come easier.', 'Ветеран: легче давить на людей и осматривать места.'),
      occultist: bi(
        'Occultist: now and then you feel a chill near one of the cult, and the rite favours you.',
        'Оккультист: порой рядом с кем-то из секты вас пробирает холод, и обряд к вам благосклонен.'
      )
    }[S.bg]
  }</p>`;
  h += searchedNote();
  return h;
}
// Where you have searched, and how often; and what a search still gives.
function searchedNote() {
  const done = LOC_IDS.filter(l => S.searched[l]);
  if (!done.length) return '';
  return `<h4>${bi('Searched', 'Обыскано')}</h4><ul class="tlog">${done
    .map(l => `<li><b>${bi(LOCS[l].name)}</b>: ${bi(enTimes(S.searched[l]), ruTimes(S.searched[l]))}</li>`)
    .join(
      ''
    )}</ul><p class="dim">${bi('A charm hidden in a place mostly turns up the first time you search it, and if not, perhaps the next. Tablets, signs, small finds and horrors keep turning up, at each place’s own odds, as often as you search.', 'Амулет, спрятанный в каком-то месте, чаще всего находится при первом же обыске, а если нет — быть может, при следующем. Таблички, знамения, мелкие находки и ужасы попадаются и дальше — в каждом месте по-своему, сколько бы вы ни искали.')}</p>`;
}
// The casebook's own buttons: your mark on someone (unmarked, ally, suspect, round again), a mark in the notebook, the
// brandy. The page is drawn afresh, at the same place; pressed from the keyboard, the same button keeps the focus.
function bookInit() {
  const p = document.getElementById('tabPanel');
  if (!p) return;
  p.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-mark],[data-gm],#drinkBtn');
    if (!b || !S) return;
    if (b.id === 'drinkBtn') {
      useBrandy();
      if (S.phase === 'plan') planScene();
      else renderAll();
      return;
    }
    const top = p.scrollTop,
      held = document.activeElement === b,
      [attr, k] = b.hasAttribute('data-mark') ? ['data-mark', b.dataset.mark] : ['data-gm', b.getAttribute('data-gm')];
    if (attr === 'data-mark') {
      const c = C(k);
      c.mark = c.mark === '?' ? 'ally' : c.mark === 'ally' ? 'foe' : '?';
      // the choices on screen that show your marks (an inquiry, who comes down with you) show the new one
      if (S_ui.scene && (S_ui.scene.choices || []).some(ch => typeof ch.sub === 'function')) paintScene(S_ui.scene);
    } else {
      S.gm[k] = b.hasAttribute('data-toggle') ? (S.gm[k] ? 0 : 1) : ((S.gm[k] || 0) + 1) % 3;
      if (typeof sfx === 'function') sfx('mark');
    }
    renderBook();
    p.scrollTop = top;
    if (held) {
      const nb = p.querySelector(`[${attr}="${k}"]`);
      if (nb) nb.focus({ preventScroll: true });
    }
  });
}
