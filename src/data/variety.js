// ===================== MORE WAYS OF SAYING THE SAME THING =====================
// The lines the game says most often, each in several tellings, so that nothing is said the same way twice running
// (core/text.js: tellOne, tellAt). Each [English, Russian], or a function of a person (and what it is about) returning
// one. The first telling of each is still where it always was (the tables, or the code that says it); these are the
// others.
const SAY = {
  // the afternoon and the evening, at the head of the site plan (data/world.js: SLOT_INTRO)
  afternoon: [
    [
      'Noon has come and gone, and the heat has not. The pickmen eat in the shade of the spoil heaps and say nothing.',
      'Полдень миновал, а зной — нет. Землекопы едят в тени отвалов и молчат.'
    ],
    [
      'The afternoon lies on the tell like a weight. Even the dogs have crawled under the lorry.',
      'Послеполуденный зной лежит на телле, как груз. Даже собаки забрались под грузовик.'
    ],
    [
      'Heat-shimmer over the plain: the ziggurat seems to float a hand’s breadth above it. Nobody moves faster than they must.',
      'Над равниной дрожит марево: зиккурат будто парит над ней на ладонь от земли. Никто не двигается быстрее, чем нужно.'
    ],
    [
      'The worst of the heat. The flag over the dig-house hangs straight down, and the water in the chatti is as warm as tea.',
      'Самый зной. Флаг над домом экспедиции висит отвесно, а вода в глиняном кувшине тёплая, как чай.'
    ],
    [
      'The afternoon. Shadows shrink to nothing under the baskets, and the canal smells of mud and buffalo.',
      'Послеполуденный час. Тени под корзинами съёживаются в ничто, а от канала пахнет илом и буйволами.'
    ],
    [
      'By the afternoon the wind drops, and the dust it carried settles on everything, the tablets included.',
      'К середине дня ветер стихает, и пыль, которую он нёс, оседает на всё подряд — и на таблички тоже.'
    ]
  ],
  evening: [
    [
      'The sun goes down behind the palms, fast, as it does here. The pickmen file off the tell, singing.',
      'Солнце садится за пальмы — быстро, как здесь водится. Землекопы гуськом спускаются с телля и поют.'
    ],
    [
      'Evening. The cook is beating something in a copper pan, and the first bats are out over the trenches.',
      'Вечер. Повар что-то взбивает в медной миске, а над траншеями уже носятся первые летучие мыши.'
    ],
    [
      'The heat breaks all at once. From the village comes the call to prayer, and the smell of dung fires.',
      'Жара спадает разом. Из деревни доносится призыв к молитве и запах кизячных костров.'
    ],
    [
      'The ziggurat goes from gold to rust to black while you watch, and the lamps come on one by one along the tents.',
      'Пока вы смотрите, зиккурат из золотого становится ржавым, а потом чёрным, и вдоль палаток одна за другой зажигаются лампы.'
    ],
    [
      'Dusk comes up out of the trenches before it comes down from the sky. The camp lights its lamps early these days.',
      'Сумерки поднимаются из траншей раньше, чем спускаются с неба. В последнее время в лагере рано зажигают лампы.'
    ],
    [
      'Evening, and a cool wind off the canal. Somebody has the wireless on: dance music from Cairo, faint as a memory.',
      'Вечер, с канала тянет прохладой. Кто-то включил радио: танцевальная музыка из Каира, едва слышная, как воспоминание.'
    ]
  ],
  // what each place looks like as you come to it (data/world.js: LOCS, desc)
  places: {
    camp: [
      [
        'The camp by day: guy-ropes, washing on a line, a tin bath by the cook-house. Crane’s things are still boxed in the office.',
        'Лагерь при свете дня: растяжки, бельё на верёвке, жестяная ванна у кухни. Вещи Крейна так и стоят в ящиках в конторе.'
      ],
      [
        'Tents, a mudbrick dig-house, and the long table under the awning where the finds are washed. The wireless mutters to itself.',
        'Палатки, глинобитный дом экспедиции и длинный стол под навесом, где моют находки. Радио что-то бормочет само себе.'
      ]
    ],
    trench: [
      [
        'Trench B, cut in steps down the slope. The section shows burnt layers like the lines of a ledger.',
        'Траншея Б, уступами врезанная в склон. В разрезе видны прослойки гари, как строчки в гроссбухе.'
      ],
      [
        'The deep trench. At the bottom it is cool, and quiet, and the sky is a strip of blue very far up.',
        'Глубокая траншея. На дне прохладно и тихо, а небо — узкая синяя полоска где-то очень высоко.'
      ]
    ],
    ziggurat: [
      [
        'E-meslam, Nergal’s house in the old texts: now a mountain of slumped brick, with kites circling the top.',
        'Э-меслам, дом Нергала из древних текстов: теперь гора осевшего кирпича, и над вершиной кружат коршуны.'
      ],
      [
        'The ziggurat’s flank, stepped and broken. Every course of brick is stamped with a king’s name, and the kings are all long dead.',
        'Склон зиккурата, ступенчатый и разрушенный. На каждом ряду кирпича оттиснуто имя царя, и все эти цари давно мертвы.'
      ]
    ],
    store: [
      [
        'The finds magazine: shelves to the roof, labels in Crane’s hand, and the dry smell of old clay.',
        'Магазин находок: полки до потолка, ярлыки почерком Крейна и сухой запах старой глины.'
      ],
      [
        'Inside the storeroom it is dim and cool. Something on a high shelf ticks as the clay settles.',
        'В кладовой сумрачно и прохладно. Где-то на верхней полке что-то потрескивает: оседает глина.'
      ]
    ],
    village: [
      [
        'The workmen’s village: dogs, children, smoke, and old men on the coffee-house bench who watch you all the way past.',
        'Деревня землекопов: собаки, дети, дым и старики на скамье у кофейни, которые провожают вас взглядом до самого поворота.'
      ],
      [
        'Mud walls, palm-trunk beams, a donkey tethered at every door. The coffee-house gramophone plays the same record all day.',
        'Глинобитные стены, балки из пальмовых стволов, у каждой двери привязан осёл. Граммофон в кофейне весь день крутит одну и ту же пластинку.'
      ]
    ],
    canal: [
      [
        'The canal bank: reeds taller than a man, a buffalo up to its eyes in the water, and a heron that will not be hurried.',
        'Берег канала: тростник выше человеческого роста, буйвол по самые глаза в воде и цапля, которую не поторопишь.'
      ],
      [
        'Slow brown water between banks of cracked mud. The village women come here for water, and do not stay.',
        'Медленная бурая вода между берегами из растрескавшейся глины. Деревенские женщины приходят сюда за водой и не задерживаются.'
      ]
    ],
    cemetery: [
      [
        'The Parthian graves: green-glazed lids just under the sand, and here and there a hollow where one has been opened.',
        'Парфянские могилы: зелёные глазурованные крышки прямо под песком, а кое-где — впадины там, где гроб уже вскрыли.'
      ],
      [
        'Row on row of slipper-coffins, the faces on their lids worn smooth by the wind. Nobody from the village comes here after noon.',
        'Ряды гробов-«башмаков»; ветер стёр лица на их крышках почти до гладкости. После полудня из деревни сюда никто не ходит.'
      ]
    ]
  },
  // a place with nobody else in it
  nobody: [
    ['Nobody else is here.', 'Больше здесь никого нет.'],
    ['There is nobody else about.', 'Больше вокруг никого.'],
    ['You have the place to yourself.', 'Здесь никого, кроме вас.'],
    ['Nobody else is in sight.', 'Больше никого не видно.'],
    ['Not a soul here but you.', 'Ни души, кроме вас.']
  ],
  // a conversation that has run its course (ui/talk.js); one with time for a third question, after the second; one
  // with time for only the one
  over: [
    () => ['The conversation has run its course.', 'Разговор исчерпан.'],
    c => [
      `${c.short} has said all ${c.p} means to say today.`,
      `${ru.c(c)} ${ru.gs(c, 'сказал', 'сказала')} сегодня всё, что ${ru.gs(c, 'собирался', 'собиралась')}.`
    ],
    c => [`There is nothing more to be had from ${c.short} today.`, `Больше от ${ru.c(c, 'g')} сегодня ничего не добиться.`],
    c => [
      `${c.short} glances at the work waiting, and you take the hint.`,
      `${ru.c(c)} поглядывает на ждущую работу, и вы понимаете намёк.`
    ],
    () => ['The talk has gone as far as it will go today.', 'Сегодня разговор дальше не пойдёт.']
  ],
  longer: [
    c => [`${c.short} is in no hurry today.`, `${ru.c(c)} сегодня никуда не торопится.`],
    c => [`${c.short} lingers, as if there were more to say.`, `${ru.c(c)} медлит, будто хочет сказать что-то ещё.`],
    c => [
      `${c.short} settles in: there is time for one more question.`,
      `${ru.c(c)} устраивается поудобнее: время ещё на один вопрос есть.`
    ]
  ],
  // ... the same, after a cold or hurried word (ui/talk.js, st.cool): only that they have not sent you away yet
  longerCool: [
    c => [
      `${c.short} has not sent you away yet: there is time for one more question.`,
      `${ru.c(c)} всё ещё не ${ru.gs(c, 'прогнал', 'прогнала')} вас: время ещё на один вопрос есть.`
    ],
    c => [
      `${c.short} says nothing more, but does not turn away either: there is time for one more question.`,
      `${ru.c(c)} больше ничего не говорит, но и не отворачивается: время ещё на один вопрос есть.`
    ],
    c => [
      `For all that, ${c.short} is still there: there is time for one more question.`,
      `И всё же ${ru.c(c)} никуда не уходит: время ещё на один вопрос есть.`
    ]
  ],
  shorter: [
    c => [`${c.short} has little time today.`, `У ${ru.c(c, 'g')} сегодня мало времени.`],
    c => [`${c.short} is already turning back to the work.`, `${ru.c(c)} уже снова поворачивается к работе.`],
    c => [`That is all the time ${c.short} has for you today.`, `Больше времени у ${ru.c(c, 'g')} для вас сегодня нет.`]
  ],
  // you take your leave (leaveClash, by place in the list: the partings each telling would gainsay, as ui/talk.js tells
  // them after the parting look: their going back to what they were doing, or a nod on your way, after a back turned on
  // you; a nod, or your leaving them where you found them, after they walked you to the light railway)
  leaveClash: [[], [], [], ['cold'], ['cold', 'walk'], ['walk']],
  leave: [
    c => [`You leave ${c.short} to ${c.pp} thoughts.`, `Вы оставляете ${ru.c(c, 'a')} наедине с ${ru.gs(c, 'его', 'её')} мыслями.`],
    c => [`You leave ${c.short} to ${c.pp} work.`, `Вы оставляете ${ru.c(c, 'a')} за работой.`],
    c => [`You let ${c.short} be.`, `Вы оставляете ${ru.c(c, 'a')} в покое.`],
    c => [
      `${c.short} goes back to what ${c.p} was doing before you came.`,
      `${ru.c(c)} возвращается к тому, чем ${ru.gs(c, 'был занят', 'была занята')} до вашего прихода.`
    ],
    c => [`You take your leave, and ${c.short} nods you on your way.`, `Вы прощаетесь, и ${ru.c(c)} кивает вам на прощание.`],
    c => [`You leave ${c.short} where you found ${EP.him(c)}.`, `Вы оставляете ${ru.c(c, 'a')} там же, где ${ru.gs(c, 'его', 'её')} нашли.`]
  ],
  // a talk that warmed them to you (said as it happens: the conversation may well go on); pressing them that cooled them
  warmer: [
    ['The talk has brought you a little closer.', 'Разговор вас немного сблизил.'],
    ['Something between you has eased.', 'Что-то между вами оттаяло.'],
    ['You are on something more like friendly terms now.', 'Теперь вы почти на дружеской ноге.'],
    ['Things are warmer between you now.', 'Отношения между вами стали теплее.']
  ],
  thinner: [
    ['Whatever trust there was between you is thinner now.', 'То доверие, что было между вами, истончилось.'],
    ['That has not gone unnoticed between you.', 'Это не прошло для ваших отношений бесследно.'],
    ['You can feel the trust go out of the conversation.', 'Вы чувствуете, как из разговора уходит доверие.'],
    ['Whatever was warm between you has cooled.', 'То тёплое, что было между вами, остыло.']
  ],
  // one who keeps it short: against you, or on a bad day
  curt: {
    hostile: [
      c => [`${c.short} keeps it short. Something stands between you.`, `${ru.c(c)} отвечает коротко. Между вами что-то стоит.`],
      c => [`${c.short} answers in as few words as ${c.p} can.`, `${ru.c(c)} отвечает как можно короче.`],
      c => [`${c.short} will not look at you for long.`, `${ru.c(c)} старается на вас не смотреть.`],
      () => ['The coolness between you is plain in every word.', 'Холодок между вами слышен в каждом слове.']
    ],
    off: [
      c => [`${c.short} keeps it short today, and you do not know why.`, `${ru.c(c)} сегодня отвечает коротко, и вы не знаете почему.`],
      c => [`${c.short} is somewhere else today, and does not say where.`, `${ru.c(c)} сегодня мыслями где-то далеко — и не говорит где.`],
      c => [
        `${c.short} is short with you today. Perhaps it is the heat.`,
        `${ru.c(c)} сегодня с вами ${ru.gs(c, 'немногословен', 'немногословна')}. Может быть, жара.`
      ],
      c => [
        `Something is wrong with ${c.short} today, and it is not you, or not only you.`,
        `С ${ru.c(c, 'i')} сегодня что-то не так — и дело не в вас, или не только в вас.`
      ]
    ]
  },
  // a confidence not taken
  nothingBack: [
    c => [`${c.short} hears you out, and gives you nothing back.`, `${ru.c(c)} выслушивает вас — и ничего не даёт взамен.`],
    c => [`${c.short} listens, and keeps ${c.pp} own counsel.`, `${ru.c(c)} слушает — и оставляет свои мысли при себе.`],
    c => [`${c.short} takes it all in, and says nothing to the purpose.`, `${ru.c(c)} всё выслушивает и не говорит ничего по существу.`],
    c => [`Your confidence goes into ${c.short} like water into sand.`, `Ваше доверие уходит в ${ru.c(c, 'a')}, как вода в песок.`]
  ],
  // what you say: confiding; making conversation; asking whom they distrust, where they were, what they make of a
  // thing, what they are keeping back, and which part of Crane's diary is theirs
  confide: [
    [
      'I don’t believe Crane’s death was an accident. I need someone I can trust.',
      'Я не верю, что Крейн погиб случайно. Мне нужен человек, которому можно доверять.'
    ],
    [
      'I think Crane was killed, and I think whoever did it is still here. I need someone on my side.',
      'Я думаю, Крейна убили — и тот, кто это сделал, всё ещё здесь. Мне нужен кто-то на моей стороне.'
    ],
    [
      'Can I tell you something, in confidence? I don’t think we are all what we seem.',
      'Можно сказать вам кое-что по секрету? Мне кажется, не все здесь те, за кого себя выдают.'
    ],
    [
      'I am going to trust you with something. Please don’t make me regret it.',
      'Я хочу кое-что вам доверить. Пожалуйста, не заставляйте меня об этом пожалеть.'
    ],
    [
      'There is something wrong at this dig, and I can’t face it alone.',
      'На этих раскопках что-то неладно, и в одиночку мне с этим не справиться.'
    ]
  ],
  smallTalk: [
    ['How are you finding the season?', 'Как вам этот сезон?'],
    ['Tell me how you came to be at Kutha.', 'Расскажите, как вы оказались в Куте.'],
    ['You look tired. Is it the heat?', 'У вас усталый вид. Жара?'],
    ['How are you bearing up?', 'Как вы держитесь?'],
    ['You’ve been quiet today. A penny for your thoughts?', 'Вы сегодня молчаливы. О чём задумались?'],
    ['Sit with me a moment. How are things?', 'Посидите со мной минутку. Как дела?']
  ],
  distrust: [
    ['Is there anyone here you don’t trust?', 'Есть здесь кто-нибудь, кому вы не доверяете?'],
    ['Who here would you keep an eye on?', 'За кем бы вы здесь присматривали?'],
    [
      'If you had to name one person to watch, who would it be?',
      'Если бы пришлось назвать одного человека, за которым стоит присматривать, — кто бы это был?'
    ],
    ['Between ourselves: who here worries you?', 'Между нами: кто здесь вас тревожит?'],
    ['Whom would you not turn your back on?', 'К кому вы не стали бы поворачиваться спиной?']
  ],
  askNight: [
    ['Where were you last night?', 'Где вы были прошлой ночью?'],
    ['I have to ask everyone. Where were you last night?', 'Мне приходится спрашивать всех. Где вы были прошлой ночью?'],
    ['Last night: where were you, and with whom?', 'Прошлой ночью — где вы были и с кем?'],
    ['Forgive me. I am asking everyone where they were last night.', 'Простите. Я спрашиваю всех, где они были прошлой ночью.'],
    ['Tell me about last night. Where were you?', 'Расскажите о прошлой ночи. Где вы были?']
  ],
  askCrane: [
    ['Where were you the night Crane died?', 'Где вы были в ночь, когда погиб Крейн?'],
    ['The night Crane died: where were you?', 'В ночь, когда погиб Крейн, — где вы были?'],
    ['I am asking everyone about the night Crane died. Where were you?', 'Я спрашиваю всех о ночи, когда погиб Крейн. Где вы были?'],
    ['Tell me about the night Crane died. Where were you?', 'Расскажите о ночи, когда погиб Крейн. Где вы были?']
  ],
  askReading: [
    ['What are you reading at the moment?', 'Что вы сейчас читаете?'],
    ['Found anything worth reading lately?', 'Нашли в последнее время что-нибудь стоящее?'],
    ['What is on your table today?', 'Что у вас сегодня на столе?'],
    ['Anything new from the tablets?', 'Что-нибудь новое в табличках?']
  ],
  copyLine: [
    ['You copy the line into your notebook.', 'Вы переписываете строку в записную книжку.'],
    ['You write the line down, word for word.', 'Вы записываете строку слово в слово.'],
    ['You take the line down in your notebook.', 'Вы заносите строку в записную книжку.'],
    ['The line goes into your notebook.', 'Строка отправляется в вашу записную книжку.']
  ],
  askShow: [
    ['What do you make of this?', 'Что скажете об этом?'],
    ['Have you seen anything like this before?', 'Вам доводилось видеть что-нибудь подобное?'],
    ['Tell me what you see here.', 'Скажите, что вы здесь видите.'],
    ['I would like your opinion of this.', 'Мне бы хотелось узнать ваше мнение об этом.']
  ],
  askPress: [
    ['You’re not telling me everything about that night.', 'Вы рассказываете мне о той ночи не всё.'],
    ['I think you know more than you’ve said.', 'По-моему, вы знаете больше, чем говорите.'],
    [
      'There is something you are keeping back. I would rather hear it from you.',
      'Вы что-то недоговариваете. Лучше бы мне услышать это от вас.'
    ],
    ['Let us try that again, and this time the whole of it.', 'Давайте ещё раз — и на этот раз всё целиком.']
  ],
  claimYou: [
    [
      'Crane believed someone here dreams true, and someone keeps watch. Is that you?',
      'Крейн считал, что кто-то здесь видит вещие сны, а кто-то стоит на страже. Это не вы?'
    ],
    [
      'The last page of Crane’s diary: a Dreamer and a Watcher. Which are you, if either?',
      'Последняя страница дневника Крейна: тот, кто видит сны, и тот, кто стоит на страже. Кто из них вы — если вообще кто-то из них?'
    ]
  ],
  // examining a scene; sitting down to a fragment
  examine: [
    [
      'You read the ground the way you were taught, a hand’s breadth at a time.',
      'Вы читаете землю так, как вас учили, — по ладони за раз.'
    ],
    [
      'You crouch over the ground with a lens and a trowel, and take your time.',
      'Вы склоняетесь над землёй с лупой и совком и не торопитесь.'
    ],
    [
      'You make the workmen stand back, and go over every mark in the dust on your knees.',
      'Вы велите рабочим отойти и на коленях осматриваете каждую отметину в пыли.'
    ],
    [
      'Slowly, as Crane taught half the diggers in Iraq: brush, look, brush again.',
      'Медленно, как Крейн учил землекопов по всему Ираку: кисть, взгляд, снова кисть.'
    ]
  ],
  read: [
    [
      'You unwrap the fragment and set the lamp close. Most of it will be omens and incantations, one copied after another. Knowing what to look for helps.',
      'Вы разворачиваете обломок и придвигаете лампу. Почти наверняка там окажутся знамения и заклинания, переписанные одно за другим. Лучше знать, что ищешь.'
    ],
    [
      'You clear the table, unwrap the fragment and prop your sign list open beside it. Most tablets are copies of copies. Knowing what to look for helps.',
      'Вы расчищаете стол, разворачиваете обломок и раскрываете рядом знаковый список. Большинство табличек — списки со списков. Лучше знать, что ищешь.'
    ],
    [
      'The fragment comes out of its cotton wool still smelling of the trench. Omens, mostly, if it is like the others. Knowing what to look for helps.',
      'Обломок выходит из ваты, всё ещё пахнущий траншеей. Если он похож на остальные, там в основном знамения. Лучше знать, что ищешь.'
    ],
    [
      'You trim the wick and turn the fragment to the light until the wedges throw shadows. Knowing what to look for helps.',
      'Вы подрезаете фитиль и поворачиваете обломок к свету, пока клинья не начинают отбрасывать тени. Лучше знать, что ищешь.'
    ]
  ],
  // the one who takes the night's death hardest (m: them; v: the dead)
  hardest: [
    (m, v) => [`${m.short} takes ${v.short}’s death hardest.`, `Тяжелее всех смерть ${ru.c(v, 'g')} переносит ${ru.c(m)}.`],
    (m, v) => [
      `${m.short} sits apart all morning, and will not speak of ${v.short}.`,
      `${ru.c(m)} всё утро сидит в стороне и не хочет говорить ${ru.ob(v)}.`
    ],
    (m, v) => [
      `It is ${m.short} who weeps for ${v.short}, and does not care who sees.`,
      `Это ${ru.c(m)} плачет по ${ru.c(v, 'd')} и не заботится о том, кто это видит.`
    ],
    (m, v) => [
      `${m.short} keeps going back to where ${v.short} was found, and standing there.`,
      `${ru.c(m)} всё возвращается туда, где нашли ${ru.c(v, 'a')}, и подолгу там стоит.`
    ],
    (m, v) => [`${v.short}’s death falls hardest on ${m.short}.`, `Смерть ${ru.c(v, 'g')} тяжелее всего ударила по ${ru.c(m, 'd')}.`]
  ],
  // what an occultist feels near one of them (ui/talk.js: the first is T.chill)
  chill: [
    c => [
      `Something cold passes over you as ${c.short} talks, like the shadow of a wing.`,
      `Пока ${ru.c(c)} говорит, по вам пробегает холод — будто тень от крыла.`
    ],
    c => [
      `For a moment, near ${c.short}, your breath shows white in the heat.`,
      `На миг рядом с ${ru.c(c, 'i')} ваше дыхание в этой жаре вырывается белым паром.`
    ],
    c => [
      `The hair rises on your arms while ${c.short} is speaking, and settles when ${c.p} stops.`,
      `Пока ${ru.c(c)} говорит, у вас на руках поднимаются волоски — и опускаются, когда ${ru.gs(c, 'он', 'она')} замолкает.`
    ]
  ],
  // a face not seen in the night, as one who saw someone tells it (c: who tells it)
  noFace: [
    () => ['No face in that dark.', 'Лица в такой темноте не разглядеть.'],
    () => ['Too dark to see a face.', 'Слишком темно, чтобы разглядеть лицо.'],
    () => ['I could not tell you who.', 'Кто это был — сказать не могу.'],
    () => ['Not the face, no; it was too dark for that.', 'Лица — нет, для этого было слишком темно.']
  ],
  // where they say they were, in camp: asleep, mostly; early to bed; in camp (c: who says it)
  inCamp: [
    [
      c => [
        'In my tent. Asleep, mostly. The jackals saw to the rest.',
        `В своей палатке. ${ru.gs(c, 'Спал', 'Спала')}, по большей части. Об остальном позаботились шакалы.`
      ],
      c => [
        'Asleep in my tent, more or less. The dogs kept waking me.',
        `${ru.gs(c, 'Спал', 'Спала')} у себя в палатке — более или менее. Собаки то и дело будили.`
      ],
      c => [
        'In my tent. I slept badly, but I slept.',
        `В своей палатке. ${ru.gs(c, 'Спал', 'Спала')} плохо, но всё-таки ${ru.gs(c, 'спал', 'спала')}.`
      ]
    ],
    [
      c => [
        'I turned in early. I heard nothing until the shouting.',
        `Я рано ${ru.gs(c, 'лёг', 'легла')}. Ничего не ${ru.gs(c, 'слышал', 'слышала')}, пока не поднялся крик.`
      ],
      c => [
        'In bed before the lamps were out. I heard nothing at all.',
        `${ru.gs(c, 'Лёг', 'Легла')} ещё до того, как погасили лампы. Ничего не ${ru.gs(c, 'слышал', 'слышала')}.`
      ],
      c => [
        'I went to bed early and slept like a stone until the shouting.',
        `Рано ${ru.gs(c, 'лёг', 'легла')} и ${ru.gs(c, 'спал как убитый', 'спала как убитая')}, пока не поднялся крик.`
      ]
    ],
    [
      () => ['In camp, all night.', 'В лагере, всю ночь.'],
      () => ['Here, in camp. Where else would I be?', 'Здесь, в лагере. Где же ещё?'],
      () => ['In camp, Doctor. All night.', 'В лагере, доктор. Всю ночь.']
    ]
  ]
};
