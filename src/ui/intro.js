// ===================== THE TITLE SCREEN, AND THE ARRIVAL =====================
// a season's code in the page's address (…#seed=1A2B-3C4D, or ?seed=), to deal that season
function seedInAddress() {
  try {
    const m = /[?#&]seed=([0-9a-fA-F-]{1,12})/.exec(location.search + location.hash);
    return m ? parseSeed(m[1]) : null;
  } catch (e) {
    return null;
  }
}
// The title screen: your name, your background, and, if you have one, the code of a season to play again (else a new one).
// seed: a code to offer in the field.
function introScene(seed = seedInAddress()) {
  S = null;
  S_ui.tab = 'people';
  const bgs = [
    {
      id: 'philologist',
      name: bi('Philologist', 'Филолог'),
      blurb: bi(
        'You read cuneiform the way other people read the racing form.',
        'Клинопись вы читаете так, как другие читают программку скачек.'
      ),
      perk: bi(
        'Translates more surely · reads more of each fragment · starts with 3 fragments · knows one old title',
        'Переводит увереннее · больше строк с каждого обломка · 3 обломка с самого начала · знает один древний титул'
      )
    },
    {
      id: 'soldier',
      name: bi('Old soldier', 'Ветеран'),
      blurb: bi(
        'You were at Kut in 1916 and walked out on the march north. You do not talk about Kut.',
        'В шестнадцатом году вы были в Кут-эль-Амаре и пережили марш пленных на север. О Куте вы не рассказываете.'
      ),
      perk: bi(
        'Presses harder · reads a scene better · revolver · can take one more wound than most',
        'Давит сильнее · лучше читает следы · револьвер · выдержит на одну рану больше других'
      )
    },
    {
      id: 'occultist',
      name: bi('Occultist', 'Оккультист'),
      blurb: bi(
        'A lapsed member of a London hermetic order. You feel what others cannot, and it costs you.',
        'Когда-то вы состояли в лондонском герметическом ордене. Вы чувствуете то, чего не чувствуют другие, и платите за это.'
      ),
      perk: bi(
        'Now and then feels a chill near cultists · the rite comes easier · knows one tablet line · less nerve to spare',
        'Порой холодок рядом с сектантами · обряд даётся легче · одна строка с табличек · нервы сдают быстрее'
      )
    }
  ];
  show({
    kicker: bi('Baghdad · March 1926', 'Багдад · март 1926'),
    title: bi('The Gates of Kutha', 'Врата Куты'),
    intro: true,
    body: [
      `<p>${bi('Professor Aldous Crane, director of the British expedition to Tell Ibrahim, the ancient city of Kutha, is dead. The Trustees have wired you to take over the season and to close the dig before the dark of the moon, five days from now.', 'Профессор Олдос Крейн, глава британской экспедиции на Телль-Ибрагим — холм, под которым спит древняя Кута, — мёртв. Попечители телеграфируют вам: принять сезон и закрыть раскоп до новолуния. До него пять дней.')}</p>`,
      `<p>${bi('Seven people are still at the camp. Crane’s last diary entry says that two of them serve something under the mound, and that it wants to come up.', 'В лагере остаются семь человек. Последняя запись в дневнике Крейна гласит, что двое из них служат чему-то под холмом — и что оно хочет выйти наверх.')}</p>`,
      `<div class="namefield"><label for="pname">${bi('Your surname', 'Ваша фамилия')}</label><input id="pname" type="text" maxlength="24" value="${bi('Marlowe', 'Марлоу')}" autocomplete="off"></div>`,
      `<div class="namefield"><label for="pseed">${bi('Season code', 'Код сезона')}</label><input id="pseed" class="seed" type="text" maxlength="12" value="${seed == null ? '' : seedCode(seed)}" placeholder="${bi('a new season', 'новый сезон')}" autocomplete="off" spellcheck="false"><span class="dim">${bi('The code of a season deals it again, whoever you are.', 'Код сезона сдаёт его заново, кем бы вы ни были.')}</span></div>`,
      `<p class="dim">${bi('Choose who you are:', 'Кто вы?')}</p>`
    ],
    choices: bgs.map(b => ({
      label: b.name,
      html: `<span class="ch-label">${b.name}</span><span class="ch-sub">${b.blurb}</span><span class="ch-perk">${b.perk}</span>`,
      fn: () => {
        const el = document.getElementById('pname'),
          sd = document.getElementById('pseed');
        const nm = ((el && el.value) || 'Marlowe').trim().slice(0, 24) || 'Marlowe';
        replyScene(nm, b.id, sd ? parseSeed(sd.value) : null);
      }
    }))
  });
}
// Your reply to the Trustees' wire, which fixes how you will keep your casebook for the whole season: the usual way, which
// files what you learn under the names it concerns and marks whatever fits, or the bare record and nothing joined up
// (hardcore: ui/book.js). There is no changing it until the next expedition.
function replyScene(name, bg, seed = null) {
  const go = hardcore => () => {
    newGame(name, bg, hardcore, seed);
    arrivalScene();
  };
  const wire = (en, rus) => `<span class="ch-label wire">${bi(en, rus)}</span>`;
  show({
    kicker: bi('Baghdad · March 1926', 'Багдад · март 1926'),
    title: bi('Your reply', 'Ваш ответ'),
    intro: true,
    art: { bg: 'vista', time: 'night' },
    body: [
      `<p>${bi('The Trustees want their answer tonight. The boy from the telegraph office waits at the door, cap in hand, while you write it.', 'Попечители ждут ответа сегодня же. Мальчишка с телеграфа ждёт у двери, комкая в руках фуражку, пока вы пишете.')}</p>`,
      `<p>${bi('Crane’s reports to them were models of method: every word he heard filed under the name it concerned, every trace set against every habit. It did not save him.', 'Отчёты Крейна были образцом методичности: каждое услышанное слово подшито к имени, которого оно касается, каждый след сверен с каждой привычкой. Его это не спасло.')}</p>`,
      `<p class="dim">${bi('However you answer, it holds until the season is over.', 'Как бы вы ни ответили, так и будет до конца сезона.')}</p>`
    ],
    choices: [
      {
        label: bi('Accept stop God help me', 'Принимаю тчк помоги мне Бог'),
        html:
          wire('Accept stop God help me', 'Принимаю тчк помоги мне Бог') +
          `<span class="ch-sub">${bi('Your casebook will file what you learn under the names it concerns, and mark whatever fits.', 'Журнал будет подшивать всё, что вы узнаёте, к именам, которых это касается, и отмечать всё, что сходится.')}</span>` +
          `<span class="ch-perk">${bi('The usual way', 'Обычный режим')}</span>`,
        fn: go(false)
      },
      {
        label: bi('Accept stop shall trust only my own judgement', 'Принимаю тчк полагаюсь лишь на собственное суждение'),
        html:
          wire('Accept stop shall trust only my own judgement', 'Принимаю тчк полагаюсь лишь на собственное суждение') +
          `<span class="ch-sub">${bi('Your casebook will keep only the bare record of what you hear, see and find, and join nothing up for you.', 'Журнал будет хранить лишь голые записи о том, что вы слышали, видели и нашли, и ничего не станет сопоставлять за вас.')}</span>` +
          `<span class="ch-perk">${bi('Hardcore · for the whole expedition', 'Хардкор · на всю экспедицию')}</span>`,
        fn: go(true)
      }
    ]
  });
}
// the season just ended, dealt again: the same seed, name, background and casebook (game/endings.js)
function replaySeason() {
  const { name, bg, hardcore, seed } = S;
  S_ui.tab = 'people';
  newGame(name, bg, hardcore, seed);
  arrivalScene();
}
function arrivalScene() {
  show({
    kicker: bi('Tell Ibrahim · Day 1', 'Телль-Ибрагим · День 1'),
    title: bi('Arrival', 'Прибытие'),
    body: [
      `<p>${bi(`The Ford from Hillah drops you, Dr ${enName()}, at the camp at dawn.`, `На рассвете «форд» из Хиллы высаживает вас, доктор ${ru.name()}, у лагеря.`)} ${craneFound()} ${bi(...TENOR_SAY.arrival[tenorMood()])}</p>`,
      `<p>${bi('His diary is on the office table. The last page is written in a hand that shakes:', 'Его дневник лежит на столе в конторе. Последняя страница исписана дрожащей рукой:')}</p>`,
      `<blockquote class="diary">${bi('Two of them hear it. One of them dreams true, and one keeps watch, God bless them both. One is a thief, but only a thief. The rest are what they seem. I cannot tell which is which, and the rite will be finished at the dark of the moon.', 'Двое из них слышат его. Один видит вещие сны, другой стоит на страже, благослови Господь обоих. Один — вор, но не более чем вор. Прочие — те, кем кажутся. Я не могу понять, кто есть кто, а в новолуние обряд свершится.')}</blockquote>`,
      `<p>${bi('You have five days. Learn their habits. Ask where each of them was at night, and set their accounts against one another. Ask, too, who they say they are: not everyone who claims a part in Crane’s diary is telling the truth. Read the traces the attacks leave, translate the tablets, and watch the land itself: Kutha shows what is stirring under it, though no sign belongs to one power alone. The tablets will not make it easy. They call the powers by old titles borrowed from other gods and other ages, a lord’s or a lady’s alike, and speak in riddles, and no tablet tells the whole of anything. Accuse the cultists at an evening inquiry, or go down and stop the rite yourself.', 'У вас пять дней. Изучите их привычки. Выясните, где каждый был ночью, и сверьте рассказы. Спросите и о том, кем каждый себя называет: не всякий, кто приписывает себе место в дневнике Крейна, говорит правду. Читайте следы, что остаются после нападений, переводите таблички и следите за самой землёй: Кута выдаёт то, что шевелится в её недрах, — только ни одно знамение не принадлежит одной-единственной силе. Таблички не облегчат вам задачу: они называют силы древними титулами, заимствованными у других богов и других веков, — титулами владык и владычиц без разбора, — говорят загадками, и ни одна не расскажет всего. Обвините сектантов на вечернем дознании — или спуститесь вниз и остановите обряд сами.')}</p>`,
      `<p>${bi('They are people, too. Some are honest to a fault and some lie for the pleasure of it; some will take to you and some will not, and all of them talk, about you and about each other. Gossip is only as good as the gossip. Whatever you do to one of them, their friends will have heard by morning.', 'И все они — люди. Кто-то честен до безрассудства, а кто-то лжёт из любви к искусству; кто-то к вам расположится, а кто-то нет, — и все они говорят: о вас и друг о друге. Сплетня стоит ровно столько, сколько сплетник. А о том, как вы обошлись с одним из них, к утру узнают его друзья.')}</p>`,
      `<p class="dim">${
        S.hardcore
          ? bi(
              'Your casebook keeps only what you hear, see and find; putting it together is up to you. Mark each person as an ally or a suspect as you go. Roles and the power below are dealt anew every game.',
              'Журнал хранит лишь то, что вы слышали, видели и нашли; сопоставлять — вам самим. Отмечайте по ходу дела, кто вам союзник, а кто под подозрением. В каждой игре роли — и сила под холмом — новые.'
            )
          : bi(
              'Your casebook keeps everything you learn. Mark each person as an ally or a suspect as you go. Roles and the power below are dealt anew every game.',
              'Журнал хранит всё, что вы узнаёте. Отмечайте по ходу дела, кто вам союзник, а кто под подозрением. В каждой игре роли — и сила под холмом — новые.'
            )
      }</p>`
    ],
    choices: [{ label: bi('Walk out onto the tell', 'Выйти на холм'), fn: startSlot }]
  });
}
