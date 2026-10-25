// ===================== THE INQUIRY: an accusation before the whole camp =====================
// Once an evening, at camp, while the camp will still sit through one (game/verdict.js). The camp gives its verdict;
// if it backs you, a cultist exposed sets the rite back, and an innocent sent away lets it gain. Beside each name, your
// mark; never how strong the case looks.
const markSay = c =>
  c.mark === 'foe'
    ? bi('You marked them a suspect', 'У вас на подозрении')
    : c.mark === 'ally'
      ? bi('You marked them an ally', ru.gs(c, 'Вы считаете его союзником', 'Вы считаете её союзницей'))
      : '';
function inquiryScene() {
  emit('inquiry');
  S.phase = 'inquiry';
  if (S.inqDay !== S.day) S.log.inq++; // called again the same evening after thinking better of it: the same inquiry
  S.inqDay = S.day;
  const ch = freeChars().map(c => ({
    label: bi(`Accuse ${c.name}`, `Обвинить ${ru.cf(c, 'a')}`),
    sub: () => markSay(c), // (as your mark stands; never how strong the case looks: that is for you to judge)
    cls: 'danger',
    fn: () => accuse(c.id)
  }));
  ch.push({
    label: bi('Think better of it', 'Передумать'),
    cls: 'minor',
    fn: () => {
      backedDown();
      goTo('camp');
    }
  });
  show({
    kicker: dayStamp(),
    title: bi('An inquiry', 'Дознание'),
    body: [
      `<p>${bi('You call the whole camp into the mess tent. Lamps, cigarette smoke, the wireless hissing in the corner. Everyone knows why they are here.', 'Вы собираете весь лагерь в столовой палатке. Лампы, табачный дым, шипение радиоприёмника в углу. Все знают, зачем их позвали.')}</p>${angerSay()}<p class="dim">${bi('Nobody is sent away on your word alone: the camp must back you, and a thin case, or a doctor it has stopped trusting, it may well refuse. A correct accusation exposes a cultist and sets the rite back. A wrong one sends an innocent away, costs you nerve and lets the rite gain ground. A refused one costs you nerve too, and whoever you accused in vain will not forget it; if they are of the cult, the cult may learn that you are close. Every innocent sent away, and every inquiry the camp refuses, angers it, and for an evening or two after it wants more before it backs you; anger it enough, and it may hold no more. One inquiry per evening.', 'Никого не отошлют по одному вашему слову: лагерь должен вас поддержать, а слабым уликам и доктору, которому перестали доверять, он может и отказать. Верное обвинение разоблачает сектанта и отбрасывает обряд назад. Неверное изгоняет невиновного, стоит вам нервов и даёт обряду набрать силу. Отвергнутое тоже стоит нервов, и тот, кого вы обвинили понапрасну, этого не забудет; а если это сектант, секта может понять, что вы близко. Каждый изгнанный невиновный и каждое дознание, которое лагерь отверг, его злят, и вечер-другой после этого ему нужно больше, чтобы вас поддержать; разозлите его довольно — и дознаний может больше не быть. Одно дознание за вечер.')}</p>`
    ],
    choices: ch
  });
}
function accuse(id) {
  const c = C(id);
  S.inquiryDone = true;
  S.act = 'accuse';
  // someone keeping up a story may come clean first, before everyone (people/pretences.js), so that the hands are raised
  // on what was said here; then the camp's verdict: if it will not do it, the one accused stays, and nothing is known for
  // certain
  const conf = inquiryConfession(),
    vote = campVote(c),
    hands = conf + voteLine(vote);
  if (!vote.passed) {
    emit('refused');
    endSlot(hands + refusedInquiry(c, vote), bi('The inquiry', 'Дознание'));
    return;
  }
  fixMark(c);
  S.revealed[id] = c.role === 'cult' ? 'cult' : c.role === 'smuggler' ? 'smuggler' : 'innocent';
  emit('accuse', c.role === 'cult');
  S.log.accused.push({ id, day: S.day, right: c.role === 'cult' });
  const out = c.role === 'cult' ? unmasked(c, vote, hands) : sentAway(c, vote);
  if (out != null) endSlot(hands + out, bi('The inquiry', 'Дознание'));
}
// One of the cult unmasked before the camp: the rite set back, perhaps a line of the liturgy shouted from the truck,
// and the camp's relief; those who stood with you trust you more for it. The last of them unmasked ends the season (and
// returns nothing).
function unmasked(c, vote, hands0 = '') {
  c.status = 'exposed';
  S.stats.right++;
  S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight));
  let out = bi(
    `<p>Under questioning, ${c.short} breaks. In ${c.pp} kit you find a cylinder seal cut with seven gates, still sticky with bitumen. ${c.short} is taken to Hillah under guard, laughing all the way to the lorry.</p>`,
    `<p>Под градом вопросов ${ru.c(c)} не выдерживает. В ${ru.gs(c, 'его', 'её')} вещах находится цилиндрическая печать с вырезанными на ней семью вратами, ещё липкая от битума. ${ru.c(c, 'a')} под конвоем увозят в Хиллу, и всю дорогу до грузовика слышен смех.</p>`
  );
  if (chance(RULES.inquiry.shout))
    out += lineOr(
      S.patron,
      bi(
        `<p>Before the lorry pulls away, ${c.short} shouts a line of the old liturgy at you across the yard:</p>`,
        `<p>Когда грузовик уже трогается, ${ru.c(c)} выкрикивает вам через двор строку древней литургии:</p>`
      ),
      ''
    );
  journal(
    bi(`${c.name} was exposed as a cultist.`, `${capS(ru.cf(c))}: ${ru.gs(c, 'разоблачён как сектант', 'разоблачена как сектантка')}.`)
  );
  if (!freeCult().length) {
    lastOfThem(bi(`Day ${S.day} · The inquiry`, `День ${S.day} · Дознание`), [hands0 + out]);
    return null;
  }
  // the camp takes it in: those who stood with you, then someone says so, and others warm to you; whatever was said of
  // them before everyone is settled
  weighWord(c, vote, 'right');
  pullTo('still', TENOR.pulls.right); // the camp breathes again
  return out + stoodWithYou(vote) + stir('praised', { about: c.id, backed: vote.back }) + settleSaid(c.id) + angerAfter(true);
}
// The last of the cult unmasked, at an inquiry or in the night (people/visit.js): the season is won, all but always; now
// and then the rite has gone too far to die with its priests (inquiry.tooLate, × tooLateNear once it is close), and the
// gate opens of itself, with nobody of the cult left to stand in the circle. kicker, body: the page so far, told again
// above it.
function lastOfThem(kicker, body) {
  if (chance(RULES.inquiry.tooLate * (S.doom >= RULES.start.doomWarn ? RULES.inquiry.tooLateNear : 1))) {
    show({
      kicker,
      title: bi('The gate is opening', 'Врата отворяются'),
      body: [
        ...body,
        `<p class="horror">${bi('The lorry is not out of sight when the ground under the camp gives a long shudder, like a sleeper turning over. At the foot of E-meslam the scorched circle splits open. The rite has come too far to die with its priests.', 'Грузовик ещё не скрылся из виду, когда земля под лагерем долго содрогается — как спящий, что переворачивается на другой бок. У подножия Э-меслама выжженный круг раскалывается. Обряд зашёл слишком далеко, чтобы умереть вместе со своими жрецами.')}</p>`
      ],
      choices: [{ label: bi('Go to the ziggurat', 'Идти к зиккурату'), cls: 'danger', fn: () => finaleIntro(true, 'priestless') }]
    });
    return;
  }
  ending('exposed');
}
// each who stood with you, now proven right with you, may trust you the more for it
function stoodWithYou(vote) {
  const ids = vote.back.filter(
    id => isFree(C(id)) && C(id).role !== 'cult' && C(id).rapport < RULES.scale.trustMax && chance(RULES.verdict.stood)
  );
  if (!ids.length) return '';
  ids.forEach(id => trustUp(C(id)));
  const many = ids.length > 1;
  return `<p class="gain">${bi(`${nameList(ids)} stood with you, and ${many ? 'trust' : 'trusts'} you more now`, `${nameListRu(ids)}: ${many ? 'были' : ru.gs(C(ids[0]), 'был', 'была')} на вашей стороне и теперь ${many ? 'доверяют' : 'доверяет'} вам больше`)}</p>`;
}
// An innocent sent away (or the thief, who is no cultist either): whoever you wronged will not forgive you, the rite
// gains, and the camp takes it hard, and some of it may take your word less readily. A thief sent away has nothing left
// to lose, and may name the one he saw.
function sentAway(c, vote) {
  grudgeOf(c);
  c.status = 'dismissed';
  S.stats.wrong++;
  S.doom += vary(RULES.inquiry.doomWrong);
  const watched = freeChars().length > 0; // (anyone left at the dig to see it: else the corporal took your word alone)
  let out =
    c.role === 'smuggler'
      ? bi(
          `<p>${c.short} is no cultist, only a thief. Under ${c.pp} bedroll are six tablets bound for the Baghdad market. ${c.short} is sent away. Somewhere on the mound, someone is pleased.</p>`,
          `<p>${ru.c(c)} — ${ru.gs(c, 'не сектант, а всего лишь вор', 'не сектантка, а всего лишь воровка')}. Под ${ru.gs(c, 'его', 'её')} походной постелью шесть табличек, приготовленных для багдадского рынка. ${ru.c(c, 'a')} отсылают прочь. Где-то на холме кто-то доволен.</p>`
        )
      : bi(
          `<p>${c.short} answers every question, and every answer is true. By the time you understand that, it is too late. ${c.short} leaves the dig in disgrace${watched ? ', and fewer people will meet your eye' : ''}.</p>`,
          `<p>${ru.c(c)} отвечает на каждый вопрос, и каждый ответ правдив. Когда вы это понимаете, уже слишком поздно. ${ru.c(c)} с позором покидает раскопки${watched ? ', а вам теперь всё реже смотрят в глаза' : ''}.</p>`
        ) + hurt(RULES.inquiry.nerveWrong, 0);
  journal(
    bi(`${c.name} was sent away after your inquiry.`, `${capS(ru.cf(c))}: ${ru.gs(c, 'отослан', 'отослана')} после вашего дознания.`)
  );
  if (c.role === 'smuggler' && thiefSaw(c) && chance(RULES.thief.sent))
    out += `<p class="event">${quoted(
      bi(`Before the lorry pulls away, ${c.short} turns to you. “`, `Перед тем как грузовик трогается, ${ru.c(c)} оборачивается к вам. «`),
      thiefNames(c, ['You want a murderer, Doctor? Then listen. ', 'Вам нужен убийца, доктор? Тогда слушайте. '])
    )}</p>`;
  // the camp takes it in: someone calls you out, others follow, or stand by you
  weighWord(c, vote, 'wrong');
  pullTo('tongues', TENOR.pulls.wrong); // the camp turns on itself
  return out + (watched ? stir('calledOut', { about: c.id, thief: c.role === 'smuggler' }) : '') + settleSaid(c.id) + angerAfter(false);
}
