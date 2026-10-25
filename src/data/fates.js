// ===================== THE FATES' WORDS: what became of them, and of you =====================
// For each of the seven, by what became of them in the season (taken, exposed, sent away) or what they were (the
// Dreamer, the Watcher, the thief, the innocent): several fates, of which game/fates.js tells one, fixed for the season.
// Then what they made of you, the flirtations that came to more, and what became of you yourself. Lines are
// [English, Russian], or functions of the person (or two) they are about.

// ---------- the dead: where they are buried ----------
const END_GRAVE = {
  hamid: [
    [
      'at Sherqat, within sight of the old German spoil heaps where he learned to dig',
      'в Шергате, откуда видны старые немецкие отвалы, на которых он когда-то учился копать'
    ],
    [
      'at Sherqat. His men carry him the whole way, and sing the digging songs over the grave',
      'в Шергате. Его люди несут его всю дорогу на руках и поют над могилой рабочие песни'
    ]
  ],
  anselm: [
    [
      'in the Dominican plot in Jerusalem, under a stone cut in Latin and in Akkadian',
      'на доминиканском кладбище в Иерусалиме, под камнем с надписью на латыни и по-аккадски'
    ],
    [
      'at Kutha, at his own written wish: a little way from the tell, facing it',
      'в Куте — по его собственному письменному распоряжению: чуть поодаль от холма, лицом к нему'
    ]
  ],
  constance: [
    [
      'in the British cemetery in Baghdad. Her last plates are never developed',
      'на британском кладбище в Багдаде. Последние её пластинки так никто и не проявит'
    ],
    [
      'in Baghdad. Her camera goes into the grave with her: nobody wants to know what is on the plate inside it',
      'в Багдаде. Камеру кладут в гроб вместе с ней: никому не хочется знать, что осталось на пластинке внутри'
    ]
  ],
  ashby: [
    [
      'in the North Gate cemetery in Baghdad, with full honours and a closed coffin',
      'на британском кладбище у Северных ворот Багдада, с воинскими почестями, в закрытом гробу'
    ],
    [
      'in Baghdad. The High Commission records the cause of death as heatstroke, and files the rest',
      'в Багдаде. Верховный комиссариат записывает причиной смерти тепловой удар, а остальное подшивает в папку'
    ]
  ],
  yusuf: [
    [
      'in Baghdad. His family will never say what he was doing so far south',
      'в Багдаде. Его родные так никогда и не скажут, что он делал так далеко на юге'
    ],
    [
      'in the family plot at Kadhimiya. His ledgers are buried with him, at his brother’s insistence',
      'на семейном участке в Казимии. По настоянию брата вместе с ним хоронят и его конторские книги'
    ]
  ],
  ilse: [
    [
      'at Babylon, within sight of Koldewey’s trenches, as she would have wished',
      'в Вавилоне, неподалёку от раскопов Кольдевея, — как она сама бы того пожелала'
    ],
    ['in Baghdad, under a stone she would have called badly cut', 'в Багдаде, под камнем, который она сама назвала бы скверно вытесанным']
  ],
  zahrun: [
    ['at Amara, beside running water, as his faith requires', 'в Амаре, у проточной воды, как того требует его вера'],
    [
      'at Amara. His brother finishes the ring he left half made, and buries it with him',
      'в Амаре. Брат доделывает кольцо, которое тот оставил незаконченным, и кладёт его в могилу'
    ]
  ]
};

// ---------- the innocent who lived: afterwards, if the season was won, or lost ----------
const END_LIFE = {
  hamid: {
    win: [
      [
        'Hamid digs at Kutha again the next spring, but never after dark, and never under the ziggurat.',
        'Следующей весной Хамид снова копает в Куте — но никогда после заката и никогда под зиккуратом.'
      ],
      [
        'Hamid takes his share of the season’s pay home to Sherqat and buys his son the clerk’s desk he wanted. Clean hands, after all.',
        'Хамид везёт свою долю жалованья домой, в Шергат, и покупает сыну конторку, о которой тот мечтал. В конце концов — чистые руки.'
      ]
    ],
    lose: [
      [
        'Hamid takes his men home to Sherqat and will not say the name of Kutha again.',
        'Хамид уводит своих людей домой, в Шергат, и больше не произносит имени Куты.'
      ],
      [
        'Hamid never digs again. He keeps sheep at Sherqat, and will not plough the field nearest the old mound.',
        'Хамид больше никогда не копает. Он пасёт овец в Шергате и не пашет поле, что ближе всех к старому холму.'
      ]
    ]
  },
  anselm: {
    win: [
      [
        'Père Anselm goes back to Jerusalem and burns his copy of the Song of Erra. He keeps the rosary.',
        'Отец Ансельм возвращается в Иерусалим и сжигает свой список «Песни об Эрре». Чётки он оставляет.'
      ],
      [
        'Père Anselm publishes a short, dry note on the Kutha hymns. In the margin of his own copy, in pencil, he has written: Deo gratias.',
        'Отец Ансельм публикует короткую сухую заметку о кутских гимнах. На полях собственного экземпляра он пишет карандашом: «Благодарение Богу».'
      ]
    ],
    lose: [
      [
        'Every year, at the dark of the moon, Père Anselm says a Mass for the dead of Kutha, and will not say whom he counts among them.',
        'Каждый год в новолуние отец Ансельм служит мессу по усопшим Куты и не говорит, кого он к ним причисляет.'
      ],
      [
        'Père Anselm asks to be sent to a house of his order in the Atlas, where there is nothing older than the Romans.',
        'Отец Ансельм просит отправить его в обитель своего ордена в Атласских горах, где нет ничего древнее римлян.'
      ]
    ]
  },
  constance: {
    win: [
      [
        'Constance Pell develops her plates in Baghdad. The figure on the ziggurat is gone from every one of them.',
        'Констанс Пелл проявляет свои пластинки в Багдаде. Фигура на зиккурате исчезла со всех до единой.'
      ],
      [
        'Constance Pell’s photographs of Kutha hang in a gallery in Bond Street. The catalogue calls them serene.',
        'Фотографии Куты работы Констанс Пелл висят в галерее на Бонд-стрит. В каталоге их называют безмятежными.'
      ]
    ],
    lose: [
      [
        'Constance Pell’s last plates appear in the Illustrated London News as ‘A Mirage in Mesopotamia’. Nobody looks at them twice, except the people who were there.',
        'Последние снимки Констанс Пелл выходят в «Иллюстрейтед Лондон ньюс» под заголовком «Мираж в Месопотамии». Никто не разглядывает их дважды — кроме тех, кто там был.'
      ],
      [
        'Constance Pell gives up photography. After Kutha, she says, she could never again be sure what the camera would see.',
        'Констанс Пелл бросает фотографию. После Куты, говорит она, уже нельзя быть уверенной, что увидит камера.'
      ]
    ]
  },
  ashby: {
    win: [
      [
        'Major Ashby’s report to the High Commission runs to a single line: ‘Nothing to report. Jolly good.’',
        'Доклад майора Эшби Верховному комиссариату умещается в одну строку: «Докладывать не о чем. Превосходно».'
      ],
      [
        'Major Ashby is decorated for ‘tact in a delicate situation’, and never learns what the situation was.',
        'Майора Эшби награждают орденом «за такт в деликатных обстоятельствах», и он так и не узнаёт, что это были за обстоятельства.'
      ]
    ],
    lose: [
      [
        'Major Ashby asks to be posted to Aden, and never mentions Iraq again.',
        'Майор Эшби просит перевести его в Аден и больше никогда не упоминает об Ираке.'
      ],
      [
        'Major Ashby drinks himself out of the service in two years. He talks of Kutha only when he is very drunk, and then only to dogs.',
        'За два года майор Эшби спивается и уходит со службы. О Куте он говорит, только когда сильно пьян, — и то лишь собакам.'
      ]
    ]
  },
  yusuf: {
    win: [
      [
        'Yusuf Shamash opens a shop on Rashid Street. Nothing from Kutha is for sale there, at any price.',
        'Юсуф Шамаш открывает лавку на улице Рашида. Ничего из Куты там не продаётся — ни за какие деньги.'
      ],
      [
        'Yusuf Shamash becomes the most respected dealer in Baghdad by refusing, loudly and in public, to handle anything from Kutha.',
        'Юсуф Шамаш становится самым уважаемым торговцем древностями в Багдаде — громко и прилюдно отказываясь брать что-либо из Куты.'
      ]
    ],
    lose: [
      [
        'Yusuf Shamash sells everything he owns within the week and takes ship for Bombay.',
        'За неделю Юсуф Шамаш распродаёт всё, что у него есть, и отплывает в Бомбей.'
      ],
      [
        'Yusuf Shamash burns his whole stock in the courtyard of his house, and his neighbours talk about it for years.',
        'Юсуф Шамаш сжигает во дворе своего дома весь свой товар, до последней вещицы, и соседи потом годами об этом судачат.'
      ]
    ]
  },
  ilse: {
    win: [
      [
        'Dr Brandt publishes the Kutha tablets in 1929, all but three, which she says were lost in transit.',
        'В двадцать девятом году доктор Брандт публикует таблички из Куты — все, кроме трёх: по её словам, они пропали при перевозке.'
      ],
      [
        'Dr Brandt is offered a chair in Berlin on the strength of the Kutha season, and turns it down to go on digging.',
        'После сезона в Куте доктору Брандт предлагают кафедру в Берлине, и она отказывается, чтобы продолжать копать.'
      ]
    ],
    lose: [
      [
        'Dr Brandt takes the Kutha tablets to Berlin. Afterwards no one at the Museum can find them, and she cannot remember where she put them.',
        'Доктор Брандт увозит таблички из Куты в Берлин. Потом их не может отыскать никто в музее, а сама она не помнит, куда их положила.'
      ],
      [
        'Dr Brandt never publishes the Kutha tablets. Her notes on them are found after her death, written in a script no one can read.',
        'Доктор Брандт так и не публикует таблички из Куты. После её смерти находят её заметки о них — написанные письмом, которого никто не может прочесть.'
      ]
    ]
  },
  zahrun: {
    win: [
      [
        'Zahrun bar Sam goes home to Amara, washes in the river at dawn, and gives thanks to the Great Life for your sake.',
        'Захрун бар Сам возвращается в Амару, на рассвете омывается в реке и благодарит Великую Жизнь — за вас.'
      ],
      [
        'Zahrun bar Sam goes back to his rings in Amara. For a year, every one he makes is closed with a tiny wedge, pressed into the silver like a seal.',
        'Захрун бар Сам возвращается к своим кольцам в Амаре. Целый год на каждом кольце, что он делает, стоит крошечный клин, вдавленный в серебро, как печать.'
      ]
    ],
    lose: [
      [
        'Zahrun bar Sam goes home to Amara and no longer washes in the river. He says the water has changed.',
        'Захрун бар Сам возвращается в Амару и больше не омывается в реке. Он говорит, что вода стала другой.'
      ],
      [
        'Zahrun bar Sam leaves Amara for the marshes, and his family hears from him only at the New Year, by boat.',
        'Захрун бар Сам уходит из Амары в болота, и родные получают от него весточку лишь на Новый год, с лодкой.'
      ]
    ]
  }
};

// ---------- by what they were, or what became of them ----------
const FATE = {
  seer: {
    win: [
      c => bi(`${c.name} never dreams of the seven gates again.`, `${capS(ru.cf(c, 'd'))} больше никогда не снятся семь врат.`),
      c =>
        bi(
          `${c.name} dreams once more, the night before the boat sails from Basra: the seven gates are shut, and someone is sweeping the steps.`,
          `Ещё один раз, в ночь перед отплытием из Басры, ${ru.cf(c, 'd')} снится сон: семь врат заперты, и кто-то подметает ступени.`
        ),
      c =>
        bi(
          `${c.name} stops dreaming altogether, and says it is like being let out of a locked room.`,
          `${capS(ru.cf(c))} совсем перестаёт видеть сны и говорит, что это похоже на то, как если бы ${ru.gs(c, 'его', 'её')} выпустили из запертой комнаты.`
        )
    ],
    lose: [
      c =>
        bi(
          `${c.name} dreams of the seven gates every night for the rest of ${c.pp} life, and they are always open.`,
          `До конца жизни ${ru.cf(c, 'd')} каждую ночь снятся семь врат, и они всегда открыты.`
        ),
      c =>
        bi(
          `${c.name} writes down every dream from then on, in ledgers. The ledgers fill a shelf, and every page is the same gate.`,
          `С тех пор ${ru.cf(c)} записывает каждый сон в конторские книги. Книги занимают целую полку, и на каждой странице одни и те же врата.`
        )
    ]
  },
  warden: {
    win: [
      c =>
        bi(
          `${c.name} keeps watch over the camp until the last lorry leaves, and only then sleeps.`,
          `${capS(ru.cf(c))} стережёт лагерь, пока не уходит последний грузовик, и только тогда позволяет себе уснуть.`
        ),
      c =>
        bi(
          `${c.name} sleeps for two days on the boat home, and wakes up laughing.`,
          `На пароходе домой ${ru.cf(c)} спит двое суток подряд — и просыпается со смехом.`
        )
    ],
    lose: [
      c =>
        bi(
          `${c.name} kept watch to the end. It was not enough, and ${c.p} knows it.`,
          `${capS(ru.cf(c))} ${ru.gs(c, 'стоял', 'стояла')} на страже до конца. Этого оказалось мало, и ${ru.gs(c, 'он', 'она')} это знает.`
        ),
      c =>
        bi(
          `Years later ${c.name} still sits up at night with a lamp, though there is nothing left to watch for.`,
          `И годы спустя ${ru.cf(c)} по ночам сидит с лампой, хотя стеречь уже нечего.`
        )
    ]
  },
  smuggler: {
    win: [
      c =>
        bi(
          `${c.name} sails from Basra in June with two crates marked ‘pottery, broken’.`,
          `В июне ${ru.cf(c)} отплывает из Басры с двумя ящиками, помеченными «черепки».`
        ),
      c =>
        bi(
          `${c.name} sells the last of the Kutha tablets to a collector in New York, and does not sleep well for a month.`,
          `${capS(ru.cf(c))} продаёт последние таблички из Куты коллекционеру в Нью-Йорке и целый месяц плохо спит.`
        )
    ],
    lose: [
      c =>
        bi(
          `${c.name} is gone from Kutha before anyone thinks to ask, and so are the best tablets in the magazine.`,
          `${capS(ru.cf(c))} исчезает из Куты прежде, чем кто-нибудь успевает спохватиться, — а с ${ru.gs(c, 'ним', 'ней')} и лучшие таблички из хранилища.`
        ),
      c =>
        bi(
          `${c.name} tries to sell a Kutha tablet in Aleppo. The buyer looks at it for a long time, hands it back, and will not take it at any price.`,
          `${capS(ru.cf(c))} пытается продать табличку из Куты в Алеппо. Покупатель долго её разглядывает, возвращает — и не берёт ни за какие деньги.`
        )
    ]
  },
  // an innocent sent away after your inquiry
  dismissed: [
    c =>
      bi(
        `${c.name} leaves Iraq that summer, and never answers your letters.`,
        `Тем же летом ${ru.cf(c)} уезжает из Ирака и не отвечает на ваши письма.`
      ),
    c =>
      bi(
        `${c.name} is cleared by the inquest in Baghdad, too late for it to matter. ${EP.He(c)} sends you a copy of the verdict without a covering letter.`,
        `Дознание в Багдаде снимает с ${ru.cf(c, 'g')} все подозрения — слишком поздно, чтобы это что-то значило. ${ru.gs(c, 'Он', 'Она')} присылает вам копию заключения без сопроводительного письма.`
      ),
    c =>
      bi(
        `Every year on the anniversary ${c.name} sends you a telegram of two words: STILL INNOCENT.`,
        `Каждый год в годовщину ${ru.cf(c)} шлёт вам телеграмму из двух слов: ${ru.gs(c, 'ПО-ПРЕЖНЕМУ НЕВИНОВЕН', 'ПО-ПРЕЖНЕМУ НЕВИНОВНА')}.`
      )
  ],
  // ... when you did not come home: dead, or in a quiet ward
  dismissedGone: [
    c =>
      bi(
        `${c.name} leaves Iraq that summer, and never speaks of Kutha again.`,
        `Тем же летом ${ru.cf(c)} уезжает из Ирака и больше никогда не говорит о Куте.`
      ),
    c =>
      bi(
        `${c.name} is cleared by the inquest in Baghdad, too late for it to matter to anyone.`,
        `Дознание в Багдаде снимает с ${ru.cf(c, 'g')} все подозрения — слишком поздно, чтобы это хоть для кого-то что-то значило.`
      )
  ],
  // the thief, sent away
  thiefSent: [
    c =>
      bi(
        `${c.name} is sent away in disgrace. In 1931 six tablets from Kutha turn up at a dealer’s in Paris.`,
        `${capS(ru.cf(c, 'a'))} с позором отсылают прочь. В тридцать первом году шесть табличек из Куты всплывают у парижского антиквара.`
      ),
    c =>
      bi(
        `${c.name} is back in Baghdad within the month, selling seals in the Suq al-Saray, and nods to you when you pass.`,
        `Не прошло и месяца, как ${ru.cf(c)} снова в Багдаде, торгует печатями на рынке Сук-ас-Сарай и кивает вам, когда вы проходите мимо.`
      )
  ],
  thiefSentGone: [
    c =>
      bi(
        `${c.name} is sent away in disgrace. In 1931 six tablets from Kutha turn up at a dealer’s in Paris.`,
        `${capS(ru.cf(c, 'a'))} с позором отсылают прочь. В тридцать первом году шесть табличек из Куты всплывают у парижского антиквара.`
      ),
    c =>
      bi(
        `${c.name} is back in Baghdad within the month, selling seals in the Suq al-Saray as if nothing had happened.`,
        `Не прошло и месяца, как ${ru.cf(c)} снова в Багдаде и торгует печатями на рынке Сук-ас-Сарай — как ни в чём не бывало.`
      )
  ],
  // one of the cult, unmasked (not the hierophant), and the hierophant: each with where it leaves them (end: 'trial',
  // in a cell to be tried; 'asylum'; 'fled'; 'dead' before any trial), which decides what else can be told of them
  // (game/fates.js, codaFacts)
  exposed: [
    {
      end: 'trial',
      say: c =>
        bi(
          `${c.name} is tried in Baghdad for Crane’s murder. Through the whole trial ${c.p} says nothing at all, except once, in Akkadian.`,
          `${capS(ru.cf(c, 'a'))} судят в Багдаде за убийство Крейна. За весь процесс ${ru.gs(c, 'он', 'она')} не произносит ни слова — лишь однажды, по-аккадски.`
        )
    },
    {
      end: 'asylum',
      say: c =>
        bi(
          `${c.name} is sent to the asylum in Baghdad, where ${c.p} spends the days pressing wedges into the bread.`,
          `${capS(ru.cf(c, 'a'))} отправляют в багдадскую лечебницу для душевнобольных, где ${ru.gs(c, 'он', 'она')} целыми днями выдавливает клинья на хлебе.`
        )
    },
    {
      end: 'fled',
      say: c =>
        bi(
          `${c.name} slips the guards on the train at Samarra and is never seen again. The guards swear the carriage door was locked.`,
          `Под Самаррой ${ru.cf(c)} ускользает от конвоя прямо из поезда, и больше ${ru.gs(c, 'его', 'её')} никто не видит. Конвойные клянутся, что дверь вагона была заперта.`
        )
    }
  ],
  hierophant: [
    {
      end: 'dead',
      say: c =>
        bi(
          `${c.name}, the hierophant, dies in the lock-up at Hillah before the trial. The guards say ${c.p} died smiling.`,
          `${capS(ru.cf(c))}, иерофант культа, умирает в арестантской Хиллы, не дождавшись суда. Стражники говорят, что ${ru.gs(c, 'он умер', 'она умерла')} с улыбкой.`
        )
    },
    {
      end: 'trial',
      say: c =>
        bi(
          `${c.name}, the hierophant, is tried in Baghdad and condemned. Asked for any last words, ${c.p} gives a date, a month and a year, and will not explain them.`,
          `${capS(ru.cf(c, 'a'))}, иерофанта культа, судят в Багдаде и приговаривают. На просьбу сказать последнее слово ${ru.gs(c, 'он', 'она')} называет число, месяц и год — и ничего не объясняет.`
        )
    }
  ]
};

// ---------- what they made of you ----------
const FATE_FRIEND = [
  c =>
    bi(
      `${EP.He(c)} writes to you every Christmas for the rest of ${c.pp} life.`,
      `До конца жизни ${ru.gs(c, 'он', 'она')} пишет вам к каждому Рождеству.`
    ),
  c =>
    bi(
      `Whenever you publish, ${c.p} is the first to write, and the most generous.`,
      `Всякий раз, когда вы что-то публикуете, ${ru.gs(c, 'он пишет вам первым', 'она пишет вам первой')} — и щедрее всех.`
    ),
  c =>
    bi(
      `${EP.He(c)} keeps a photograph of the whole camp on ${c.pp} desk, and you are in the middle of it.`,
      `На письменном столе у ${ru.gs(c, 'него', 'неё')} стоит фотография всего лагеря, и вы на ней — в самой середине.`
    )
];
const FATE_ENEMY = [
  c =>
    bi(
      `${EP.He(c)} never says your name again, if ${c.p} can help it.`,
      `Вашего имени ${ru.gs(c, 'он', 'она')} старается больше не произносить.`
    ),
  c =>
    bi(
      `${EP.He(c)} savages your monograph in the Journal of the Royal Asiatic Society, and signs it.`,
      `${ru.gs(c, 'Он', 'Она')} разносит вашу монографию в пух и прах в «Журнале Королевского азиатского общества» — и подписывается.`
    ),
  c =>
    bi(
      `When your name comes up at dinner, ${c.p} changes the subject to the weather, every time.`,
      `Когда за обедом заходит речь о вас, ${ru.gs(c, 'он', 'она')} всякий раз переводит разговор на погоду.`
    )
];
// a woman with a soft spot for you, who trusted you, when it came to no more than that
const FATE_SOFT = {
  constance: [
    'She sends you a print of a photograph she took of you at Kutha when you were not looking. On the back, in pencil: “Hold still.”',
    'Она присылает вам отпечаток снимка, который сделала в Куте, когда вы на неё не смотрели. На обороте карандашом: «Замрите».'
  ],
  ilse: [
    'She sends you an offprint every year, inscribed “To the only sensible person at Kutha”. The inscriptions grow longer.',
    'Каждый год она присылает вам оттиск своей статьи с надписью «Единственному здравомыслящему человеку в Куте». Надписи становятся всё длиннее.'
  ],
  any: [
    'She writes to you every Christmas, and once, in 1931, asks whether you ever think of Kutha. You do.',
    'Она пишет вам к каждому Рождеству, а однажды, в тридцать первом, спрашивает, вспоминаете ли вы Куту. Вы вспоминаете.'
  ]
};
// ... and when it came to more
const FATE_LOVE = {
  constance: [
    'In the autumn she comes to London “for the Museum”, and does not go back. The Trustees send a teapot for a wedding present; she photographs it, and the two of you, with the timer.',
    'Осенью она приезжает в Лондон «по делам музея» — и не уезжает обратно. Попечители присылают на свадьбу чайник; она фотографирует его — и вас вдвоём — с автоспуском.'
  ],
  ilse: [
    'In 1928 she writes from Berlin to ask whether she should stay there, or come to England. You write back one word. She comes.',
    'В двадцать восьмом она пишет из Берлина и спрашивает, остаться ли ей там или приехать в Англию. Вы отвечаете одним словом. Она приезжает.'
  ],
  any: [
    'In the spring of 1927 the two of you are married, quietly. The only guest from Kutha is the only one who is not surprised.',
    'Весной двадцать седьмого вы тихо венчаетесь. Единственный гость из Куты — единственный, кто ничуть не удивлён.'
  ]
};
// two of the camp who were taken with each other: a little more than a flirtation, and a good deal more
const FATE_PAIR = {
  mild: [
    (a, b) =>
      bi(
        `For the rest of the season ${a.short} and ${b.short} are seen together at the Alwiyah Club, and nobody from Kutha is surprised.`,
        `До конца сезона ${ru.c(a)} и ${ru.c(b)} часто бывают вместе в клубе «Альвия», и никого из Куты это не удивляет.`
      ),
    (a, b) =>
      bi(
        `${a.short} and ${b.short} write to each other for the rest of their lives, and neither of them marries anyone else.`,
        `${ru.c(a)} и ${ru.c(b)} переписываются до конца жизни, и ни один из них так ни с кем другим и не связывает судьбу.`
      )
  ],
  strong: [
    (a, b) =>
      bi(
        `${a.short} and ${b.short} leave Iraq on the same boat, in neighbouring cabins, and come ashore at Marseilles arm in arm.`,
        `${ru.c(a)} и ${ru.c(b)} уплывают из Ирака на одном пароходе, в соседних каютах, а в Марселе сходят на берег под руку.`
      ),
    (a, b) =>
      bi(
        `A year later ${a.short} and ${b.short} are married in Beirut. On the back of every invitation, in ${a.short}’s hand: “Kutha has a great deal to answer for.”`,
        `Через год ${ru.c(a)} и ${ru.c(b)} играют свадьбу в Бейруте. На обороте каждого приглашения рукой ${ru.c(a, 'g')}: «Куте за многое придётся ответить».`
      )
  ]
};
// one who was taken with someone the night took
const FATE_MOURN = [
  (b, a) =>
    bi(
      `${b.short} wears black for ${a.short} until the end of the season, though nobody had known there was anything to mourn.`,
      `${ru.c(b)} носит траур по ${ru.c(a, 'd')} до конца сезона, хотя никто и не знал, что было что оплакивать.`
    ),
  (b, a) =>
    bi(
      `${b.short} goes back to ${a.short}’s grave once a year, alone, and will not say why.`,
      `Раз в год ${ru.c(b)} в одиночку приходит на могилу ${ru.c(a, 'g')} и не говорит зачем.`
    )
];

// ... when you did not come home from Kutha: dead (or gone with the rite), or shut away in a quiet ward
const FATE_GONE = {
  dead: {
    love: [
      'She never marries. On the anniversary she puts on the dress she meant to be married in, and goes nowhere in it.',
      'Она так и не выходит замуж. В годовщину она надевает платье, в котором собиралась венчаться, — и никуда в нём не идёт.'
    ],
    soft: [
      'She keeps the last photograph anyone took of you at Kutha, and shows it to no one.',
      'Она хранит последний снимок, сделанный с вас в Куте, и никому его не показывает.'
    ],
    friend: [
      c =>
        bi(
          `${EP.He(c)} writes to your sister every year on the day you were lost.`,
          `Каждый год, в день, когда вас не стало, ${ru.gs(c, 'он', 'она')} пишет вашей сестре.`
        ),
      c => bi(`${EP.He(c)} names a child after you.`, `${ru.gs(c, 'Он', 'Она')} называет в вашу честь ребёнка.`)
    ],
    enemy: [
      c =>
        bi(
          `At your memorial ${c.p} says that you went looking for it, and found it.`,
          `На вашей панихиде ${ru.gs(c, 'он', 'она')} говорит, что вы сами этого искали — и нашли.`
        )
    ]
  },
  mad: {
    love: [
      'She comes to the quiet ward every Sunday. Some Sundays you know her.',
      'Каждое воскресенье она приходит к вам в тихую палату. Иногда вы её узнаёте.'
    ],
    soft: [
      'She sends you a card every Christmas. The nurses read it to you, twice.',
      'Она присылает вам открытку к каждому Рождеству. Сёстры читают её вам вслух — дважды.'
    ],
    friend: [
      c =>
        bi(
          `${EP.He(c)} visits you once a month, and reads you the newspapers.`,
          `Раз в месяц ${ru.gs(c, 'он', 'она')} навещает вас и читает вам газеты.`
        ),
      c =>
        bi(
          `${EP.He(c)} pays for your room in the quiet ward, and never tells anyone.`,
          `${ru.gs(c, 'Он', 'Она')} оплачивает вашу палату — и никому об этом не говорит.`
        )
    ],
    enemy: [c => bi(`${EP.He(c)} never once visits.`, `${ru.gs(c, 'Он', 'Она')} ни разу вас не навещает.`)]
  },
  // ... or tried in Baghdad for the one you killed, and kept in the prison there (game/deed.js): nobody marries a
  // prisoner, or reads a prisoner's monographs
  jail: {
    love: [
      'She comes out to Baghdad for the trial, and stays. Every week, for as long as they let her, she visits you in the prison and talks of England.',
      'Она приезжает в Багдад на суд — и остаётся. Каждую неделю, пока ей позволяют, она навещает вас в тюрьме и рассказывает об Англии.'
    ],
    soft: [
      'She writes to you in the prison at Baghdad every week, and never once asks what you did.',
      'Она пишет вам в багдадскую тюрьму каждую неделю — и ни разу не спрашивает, что вы сделали.'
    ],
    friend: [
      c =>
        bi(
          `${EP.He(c)} writes to you in the prison at Baghdad every month, and sends the newspapers.`,
          `Раз в месяц ${ru.gs(c, 'он', 'она')} пишет вам в багдадскую тюрьму и присылает газеты.`
        ),
      c =>
        bi(
          `${EP.He(c)} speaks for you at the trial, and is not believed, and does not stop.`,
          `На суде ${ru.gs(c, 'он', 'она')} говорит в вашу защиту, ${ru.gs(c, 'ему', 'ей')} не верят — а ${ru.gs(c, 'он', 'она')} всё не умолкает.`
        )
    ],
    enemy: [
      c =>
        bi(
          `At your trial ${c.p} gives evidence in a level voice, and does not once look at you.`,
          `На суде ${ru.gs(c, 'он', 'она')} даёт показания ровным голосом и ни разу на вас не смотрит.`
        )
    ]
  }
};

// ---------- what became of you ----------
// after a season won: by your wounds, and how near your nerve came to breaking
const FATE_YOU = {
  whole: [
    [
      'You come home without a scratch. Your sister says you look rested, and you let her think so.',
      'Вы возвращаетесь домой без единой царапины. Сестра говорит, что у вас отдохнувший вид, и вы не спорите.'
    ],
    [
      'You come home whole, sleep for a day and a night, and go to the Museum on Monday as if nothing had happened.',
      'Вы возвращаетесь домой без единой царапины, спите сутки напролёт, а в понедельник идёте в музей, будто ничего не случилось.'
    ]
  ],
  shaken: [
    [
      'You come home without a mark on you. It is a year before you can sleep a night through.',
      'Вы возвращаетесь домой без единой отметины. Проходит год, прежде чем вам удаётся проспать ночь напролёт.'
    ],
    [
      'There is not a mark on you, and your hands shake until Christmas. You take up the piano, to give them something to do.',
      'На вас нет ни отметины, а руки дрожат до самого Рождества. Вы садитесь за фортепиано — чтобы им было чем заняться.'
    ]
  ],
  wounded: [
    [
      'The surgeon at Hinaidi stitches you up and asks no questions. The scars ache when the weather turns, and whenever anyone says Kutha.',
      'Хирург в Хинайди зашивает вас и ни о чём не спрашивает. Шрамы ноют к перемене погоды — и всякий раз, когда кто-нибудь произносит «Кута».'
    ],
    [
      'You carry Kutha home in your body: a stiffness in the shoulder, a scar you explain as a fall in a trench. It is not a lie, quite.',
      'Вы увозите Куту домой в собственном теле: скованное плечо, шрам, о котором вы говорите, что упали в траншею. Это не совсем ложь.'
    ]
  ],
  nearly: [
    [
      'You were one wound from the tell keeping you. You walk with a stick for a year, and keep the stick afterwards.',
      'Ещё одна рана — и телль оставил бы вас себе. Год вы ходите с тростью, а потом оставляете её себе на память.'
    ],
    [
      'You spend the summer in hospital at Hinaidi, and the nurses learn not to ask about the marks. One of them is the shape of a hand.',
      'Лето вы проводите в госпитале в Хинайди, и сёстры быстро учатся не спрашивать о шрамах. Один из них — в форме ладони.'
    ]
  ]
};

// "on night n", as the ending says it ([English, Russian], in the middle of a sentence): to the code the night Crane
// died is night 0, but nobody at Kutha ever called it that (ui/book.js, nightLabel)
const onNight = n => (n === 0 ? ['on the night Crane died', 'в ночь гибели Крейна'] : [`on night ${n}`, `в ночь ${n}`]);

// ---------- what each of them carried away from the season ----------
// After their fate, now and then a line or two more, drawn from what passed between them and you, or what they did or
// suffered that season (game/fates.js decides which apply, and picks among them without the dice). Each: a function of
// the person and what it is about (d), returning [English, Russian]; some by what became of them (alive: still at the
// dig, or sent away; dead; jailed: one of the cult, exposed, in a cell to be tried; asylum: exposed, and shut away in the
// asylum instead; free: one of the cult still at large, or fled).
const FATE_CODA = {
  // you sat with them in their grief (d: the one they mourned)
  consoled: {
    alive: [
      (c, d) => [
        `${c.short} never forgot the hour you sat with ${EP.him(c)} after ${d.short} died.`,
        `${ru.c(c)} так и не ${ru.gs(c, 'забыл', 'забыла')} того часа, что вы просидели с ${ru.gs(c, 'ним', 'ней')} после смерти ${ru.c(d, 'g')}.`
      ],
      (c, d) => [
        `Every year, on the day ${d.short} died, a letter comes from ${c.short}. It never says much.`,
        `Каждый год, в день смерти ${ru.c(d, 'g')}, от ${ru.c(c, 'g')} приходит письмо. Написано в нём всегда немного.`
      ]
    ],
    jailed: [
      (c, d) => [
        `In the prison at Baghdad ${c.short} asks for nothing but paper, and writes to you once, to thank you for the hour after ${d.short} died.`,
        `В багдадской тюрьме ${ru.c(c)} не просит ничего, кроме бумаги, и пишет вам лишь однажды — поблагодарить за час, проведённый с ${ru.gs(c, 'ним', 'ней')} после смерти ${ru.c(d, 'g')}.`
      ]
    ],
    asylum: [
      (c, d) => [
        `From the asylum in Baghdad ${c.short} writes to you once, in a clear hand, to thank you for the hour after ${d.short} died.`,
        `Из багдадской лечебницы ${ru.c(c)} пишет вам лишь однажды — ясным, ровным почерком, — чтобы поблагодарить за час, проведённый с ${ru.gs(c, 'ним', 'ней')} после смерти ${ru.c(d, 'g')}.`
      ]
    ]
  },
  // you confided your suspicions in them
  confided: {
    alive: [
      c => [
        `${c.short} kept what you confided at Kutha, and kept it to the end.`,
        `${ru.c(c)} ${ru.gs(c, 'сохранил', 'сохранила')} в тайне то, что вы доверили ${ru.gs(c, 'ему', 'ей')} в Куте, — до самого конца.`
      ]
    ],
    dead: [
      c => [
        `${c.short} died knowing what you had confided, and told no one.`,
        `${ru.c(c)} ${ru.gs(c, 'умер', 'умерла')}, зная то, что вы ${ru.gs(c, 'ему', 'ей')} доверили, и никому не ${ru.gs(c, 'сказал', 'сказала')}.`
      ]
    ],
    cult: [
      c => [
        `${c.short} told the others every word you confided, the same night.`,
        `${ru.c(c)} в ту же ночь ${ru.gs(c, 'пересказал', 'пересказала')} остальным каждое слово, которое вы ${ru.gs(c, 'ему', 'ей')} доверили.`
      ]
    ]
  },
  // you pressed them hard
  pressed: {
    alive: [
      c => [
        `${c.short} never quite forgave the afternoon you pressed ${EP.him(c)}.`,
        `${ru.c(c)} так до конца и не ${ru.gs(c, 'простил', 'простила')} вам того дня, когда вы на ${ru.gs(c, 'него', 'неё')} надавили.`
      ],
      c => [
        `When your name comes up, ${c.short} remembers the afternoon you pressed ${EP.him(c)}, and changes the subject.`,
        `Когда речь заходит о вас, ${ru.c(c)} вспоминает тот день, когда вы на ${ru.gs(c, 'него', 'неё')} надавили, — и переводит разговор.`
      ]
    ],
    jailed: [
      c => [
        `At the trial ${c.short} tells the court how you pressed ${EP.him(c)}, as though it were the worst thing done at Kutha that spring.`,
        `На суде ${ru.c(c)} рассказывает, как вы на ${ru.gs(c, 'него', 'неё')} давили, — будто это худшее, что случилось в Куте той весной.`
      ]
    ]
  },
  // the Watcher who drove them off from your tent
  savedYou: {
    alive: [
      c => [
        `${c.short} never mentions the night ${c.p} stood outside your tent with a lamp. You do, every Christmas, in a letter.`,
        `${ru.c(c)} никогда не вспоминает ту ночь, когда ${ru.gs(c, 'стоял', 'стояла')} с лампой у вашей палатки. Вспоминаете вы — в письме к каждому Рождеству.`
      ]
    ],
    dead: [
      c => [
        `You never thanked ${c.short} for the night ${c.p} stood outside your tent with a lamp. There was no time.`,
        `Вы так и не поблагодарили ${ru.c(c, 'a')} за ту ночь, когда ${ru.gs(c, 'он стоял', 'она стояла')} с лампой у вашей палатки. Не успели.`
      ]
    ]
  },
  // the Watcher drove the attacker off from them (d: the night)
  guarded: {
    alive: [
      (c, d) => [
        `${c.short} owes ${c.pp} life to whoever stood in the dark with a lamp on night ${d}, and never learns who it was.`,
        `${ru.c(c)} ${ru.gs(c, 'обязан', 'обязана')} жизнью тому, кто в ночь ${d} стоял во тьме с лампой, — и так и не узнаёт, кто это был.`
      ]
    ]
  },
  // they found one of the night's dead (d: { v, at })
  found: {
    alive: [
      (c, d) => [
        `${c.short} found ${d.v.short} ${d.at[0]}, and still sees it when ${c.p} closes ${c.pp} eyes.`,
        `${ru.c(c)} ${ru.gs(c, 'нашёл', 'нашла')} ${ru.c(d.v, 'a')} ${d.at[1]} — и до сих пор видит это, закрывая глаза.`
      ]
    ]
  },
  // they were out where it happened, by ill luck (d: { n, at })
  there: {
    alive: [
      (c, d) => [
        `${c.short} never tells anyone what ${c.p} was doing ${d.at[0]} ${onNight(d.n)[0]}.`,
        `${ru.c(c)} никому не рассказывает, что ${ru.gs(c, 'делал', 'делала')} ${d.at[1]} ${onNight(d.n)[1]}.`
      ]
    ]
  },
  // they lied to you about a night, out of fear (d: the night)
  afraid: {
    alive: [
      (c, d) => [
        `Years later ${c.short} writes to tell you that ${c.p} lied to you about ${d ? `night ${d}` : 'the night Crane died'}. ${EP.He(c)} had been out, and had seen nothing, and had been afraid.`,
        `Годы спустя ${ru.c(c)} пишет вам, что ${ru.gs(c, 'солгал', 'солгала')} вам о ${d ? `ночи ${d}` : 'ночи гибели Крейна'}: ${ru.gs(c, 'он был', 'она была')} не в лагере, ничего не ${ru.gs(c, 'видел', 'видела')} и очень ${ru.gs(c, 'боялся', 'боялась')}.`
      ]
    ]
  },
  // they slipped out with someone they were sweet on, and kept it quiet (d: { w, n })
  secret: {
    alive: [
      (c, d) => [
        `${c.short} and ${d.w.short} never told anyone where they had been ${onNight(d.n)[0]}.`,
        `${ru.c(c)} и ${ru.c(d.w)} так никому и не сказали, где были ${onNight(d.n)[1]}.`
      ]
    ]
  },
  // they said they saw someone in the dark, and saw nobody (d: whom they named)
  invented: {
    alive: [
      (c, d) => [
        `${c.short} still swears ${c.p} saw ${d.short} in the dark that night. ${EP.He(c)} saw no one.`,
        `${ru.c(c)} до сих пор клянётся, что ${ru.gs(c, 'видел', 'видела')} в ту ночь в темноте ${ru.c(d, 'a')}. ${ru.gs(c, 'Он', 'Она')} никого не ${ru.gs(c, 'видел', 'видела')}.`
      ]
    ]
  },
  // they did you harm in secret (d: what they did)
  spite: {
    alive: [
      (c, d) =>
        d.caught
          ? [`${c.short} never looks you in the eye again.`, `${ru.c(c)} больше ни разу не смотрит вам в глаза.`]
          : d.it
            ? [
                `${c.short} keeps ${theItem(d.it)} for the rest of ${c.pp} life, and never once uses ${V(d.it, 'it', 'them')}.`,
                `${ru.c(c)} до конца жизни хранит ${ru.item(d.it, 'a')} и ни разу ${ru.ig(d.it, 'им', 'ею', 'им', 'ими')} не пользуется.`
              ]
            : [
                `${c.short} never tells anyone about the night ${c.p} came to your tent.`,
                `${ru.c(c)} никому не рассказывает о той ночи, когда ${ru.gs(c, 'приходил', 'приходила')} к вашей палатке.`
              ]
    ]
  },
  // how their hand went at an inquiry (d: { x: the accused, k: 'right' | 'wrong' | 'shielded' })
  hand: {
    alive: [
      (c, d) =>
        d.k === 'right'
          ? [
              `${c.short} tells the story of the evening ${d.x.short} was unmasked at every dinner for twenty years.`,
              `Двадцать лет подряд ${ru.c(c)} рассказывает на каждом званом обеде историю того вечера, когда разоблачили ${ru.c(d.x, 'a')}.`
            ]
          : d.k === 'wrong'
            ? [
                `${c.short} raised ${c.pp} hand against ${d.x.short} with you, and never forgave ${c.p === 'she' ? 'herself' : 'himself'}.`,
                `${ru.c(c)} ${ru.gs(c, 'поднял', 'подняла')} руку против ${ru.c(d.x, 'g')} вместе с вами — и так и не ${ru.gs(c, 'простил', 'простила')} себе этого.`
              ]
            : [
                `${c.short} never admits that ${c.p} raised ${c.pp} hand for ${d.x.short}.`,
                `${ru.c(c)} так и не признаётся, что ${ru.gs(c, 'поднял', 'подняла')} руку в защиту ${ru.c(d.x, 'g')}.`
              ]
    ]
  },
  // what they said before the whole camp was proven, or undone (d: 1 or −1)
  credit: {
    alive: [
      (c, d) =>
        d > 0
          ? [
              `At Kutha, for the rest of ${c.pp} life, people listen when ${c.short} speaks.`,
              `В Куте до конца ${ru.gs(c, 'его', 'её')} дней ${ru.c(c, 'a')} слушают, когда ${ru.gs(c, 'он', 'она')} говорит.`
            ]
          : [
              `${c.short} said a thing before the whole camp that the truth undid, and never spoke before a crowd again.`,
              `${ru.c(c)} однажды ${ru.gs(c, 'сказал', 'сказала')} при всём лагере то, что правда потом опровергла, — и больше никогда не ${ru.gs(c, 'говорил', 'говорила')} на людях.`
            ]
    ]
  },
  // they went down with you (d: 'took' | 'left' | 'held')
  below: {
    alive: [
      (c, d) =>
        d === 'held'
          ? [
              `${c.short} held the seventh gate for you. ${EP.He(c)} still has the marks on ${c.pp} hands.`,
              `${ru.c(c)} ${ru.gs(c, 'держал', 'держала')} для вас седьмые врата. Следы на ладонях у ${ru.gs(c, 'него', 'неё')} остались до сих пор.`
            ]
          : d === 'left'
            ? [
                `${c.short} turned back on the stair below, and does not forgive ${c.p === 'she' ? 'herself' : 'himself'}.`,
                `${ru.c(c)} ${ru.gs(c, 'повернул', 'повернула')} назад на лестнице внизу — и не может себе этого простить.`
              ]
            : [
                `${c.short} went down the stair with you, and never speaks of what was under the ziggurat.`,
                `${ru.c(c)} ${ru.gs(c, 'спускался', 'спускалась')} с вами по той лестнице — и никогда не говорит о том, что было под зиккуратом.`
              ]
    ]
  },
  // an innocent whose trace the cult laid at a scene (d: the night)
  framed: {
    alive: [
      (c, d) => [
        `${c.short} never learns that the trace at the scene ${onNight(d)[0]} was laid there to hang ${EP.him(c)}.`,
        `${ru.c(c)} так и не узнаёт, что след на месте нападения ${onNight(d)[1]} подбросили, чтобы погубить ${ru.gs(c, 'его', 'её')}.`
      ]
    ]
  },
  // the Dreamer who dreamed aloud (d: whether the season was won): of the telling, not the dreaming, which the
  // Dreamer's own fate tells already (FATE.seer)
  dreamer: {
    alive: [
      (c, d) =>
        d
          ? [
              `${c.short} never again tells a dream aloud, not even a kind one.`,
              `${ru.c(c)} больше никогда не рассказывает снов вслух — даже добрых.`
            ]
          : [
              `${c.short} has stopped telling anyone what ${c.p} dreams.`,
              `${ru.c(c)} больше никому не рассказывает, что ${ru.gs(c, 'ему', 'ей')} снится.`
            ]
    ]
  },
  // the thief who named the one he saw
  told: {
    alive: [
      c => [
        `${c.short} sells the story of what ${c.p} saw to a Baghdad newspaper, which does not print it.`,
        `${ru.c(c)} продаёт историю о том, что ${ru.gs(c, 'видел', 'видела')}, багдадской газете, — и та её не печатает.`
      ]
    ]
  },
  // one of the cult with a soft spot for you (d: whether you came home; if not, you died where you could be found)
  cultSoft: {
    jailed: [
      c => [
        `From the women’s prison in Baghdad ${c.short} writes to you once. You never open the letter, and never throw it away.`,
        `Из женской тюрьмы в Багдаде ${ru.c(c)} пишет вам один-единственный раз. Вы так и не вскрываете письмо — и так и не выбрасываете его.`
      ]
    ],
    asylum: [
      c => [
        `From the asylum in Baghdad ${c.short} writes to you once. You never open the letter, and never throw it away.`,
        `Из багдадской лечебницы ${ru.c(c)} пишет вам один-единственный раз. Вы так и не вскрываете письмо — и так и не выбрасываете его.`
      ]
    ],
    free: [
      (c, d) =>
        d
          ? [
              `Once a year a parcel comes for you with no name on it: a comb, a spindle, a pressed flower from the desert.`,
              `Раз в год вам приходит посылка без имени отправителя: гребень, веретено, засушенный цветок из пустыни.`
            ]
          : [`At the very end, it was ${c.short} who closed your eyes.`, `В самом конце именно ${ru.c(c)} закрыла вам глаза.`]
    ]
  },
  // one of the cult who came to like you (d: 'home', you came home; 'doom', the rite was done; 'lost', you did not come
  // home, and the rite was never done)
  cultFriend: {
    jailed: [
      c => [`At the trial ${c.short} asks for you, and for no one else.`, `На суде ${ru.c(c)} просит позвать вас — и никого больше.`]
    ],
    asylum: [
      c => [`In the asylum ${c.short} asks for you, and for no one else.`, `В лечебнице ${ru.c(c)} просит позвать вас — и никого больше.`]
    ],
    free: [
      (c, d) =>
        d === 'home'
          ? [
              `${c.short} sends you a card every New Year, from a different country each time, unsigned.`,
              `Каждый Новый год ${ru.c(c)} присылает вам открытку — всякий раз из другой страны и без подписи.`
            ]
          : d === 'doom'
            ? [
                `${c.short} is said to have wept, once, when the rite was done. Nobody can say for whom.`,
                `Говорят, когда обряд свершился, ${ru.c(c)} ${ru.gs(c, 'заплакал', 'заплакала')} — один-единственный раз. Никто не может сказать, по ком.`
              ]
            : [
                `${c.short} is said to have wept, once, at the news of you. Nobody can say for whom.`,
                `Говорят, узнав о вас, ${ru.c(c)} ${ru.gs(c, 'заплакал', 'заплакала')} — один-единственный раз. Никто не может сказать, по ком.`
              ]
    ]
  },
  // one of the cult who could not stand you
  cultFoe: {
    jailed: [c => [`${c.short} laughs when your name is read out in court.`, `Когда в суде зачитывают ваше имя, ${ru.c(c)} смеётся.`]]
  }
};
// what became of you, besides: the things the season left in you, by what you did and what was done to you; each a
// function of what it is about (d), returning [English, Russian]; told if you came home (home; jail: tried in Baghdad
// for the one you killed, where what has no telling of its own is told as at home, unless a cell rules it out:
// game/fates.js, youCodas), or if you did not (dead; mad: in a quiet ward; gone: either)
const FATE_YOU_CODA = {
  // the night you went out yourself (game/deed.js; d: whom, and whether you killed them)
  deed: {
    home: [
      d =>
        d.killed
          ? [
              `You never speak of the night you went to ${d.t.short}’s tent. Some nights you are back there, and the cot is never empty.`,
              `Вы никогда не говорите о ночи, когда пошли к палатке ${ru.c(d.t, 'g')}. Иногда по ночам вы снова там — и койка никогда не бывает пустой.`
            ]
          : d.gun
            ? [
                'You give the revolver to the Museum’s night porter, and never ask what he did with it.',
                'Револьвер вы отдаёте ночному сторожу музея и никогда не спрашиваете, что он с ним сделал.'
              ]
            : [
                'You keep the knife from the cook-house in a drawer at home, and never open the drawer.',
                'Нож с кухни вы держите дома в ящике стола — и никогда этот ящик не открываете.'
              ],
      d =>
        d.killed
          ? [
              'In 1934 a man from the Hillah police calls at your lodgings, very politely, about an old matter at Kutha. You give him tea. He goes away again, and does not come back, and you wait for him for years.',
              'В тридцать четвёртом к вам на квартиру заходит человек из полиции Хиллы — очень вежливо, по старому делу о Куте. Вы поите его чаем. Он уходит и больше не возвращается, а вы ждёте его годами.'
            ]
          : [
              `You write to ${d.t.short} once, years later, and tear the letter up before the post.`,
              `Однажды, годы спустя, вы пишете ${ru.c(d.t, 'd')} — и рвёте письмо, не дойдя до почты.`
            ]
    ],
    jail: [
      d => [
        `In the prison at Baghdad you never speak of the night you went to ${d.t.short}’s tent. Some nights you are back there, and the cot is never empty.`,
        `В багдадской тюрьме вы никогда не говорите о ночи, когда пошли к палатке ${ru.c(d.t, 'g')}. Иногда по ночам вы снова там — и койка никогда не бывает пустой.`
      ]
    ],
    dead: [
      d => [
        `What you did on the night you went to ${d.t.short}’s tent goes into the ground with you.`,
        `То, что вы сделали в ночь, когда пошли к палатке ${ru.c(d.t, 'g')}, уходит в землю вместе с вами.`
      ]
    ],
    mad: [
      d => [
        `You tell the nurses about the night you went to ${d.t.short}’s tent. They write it down with everything else you imagine.`,
        `Сёстрам вы рассказываете о ночи, когда пошли к палатке ${ru.c(d.t, 'g')}. Они записывают это вместе со всем остальным, что вам мерещится.`
      ]
    ]
  },
  // reading that cost you dear
  read: {
    home: [
      () => [
        'You never read cuneiform again. You give your sign lists to the Museum, and walk the long way round the Assyrian rooms.',
        'Вы больше никогда не читаете клинопись. Свои знаковые списки вы отдаёте музею и обходите ассирийские залы стороной.'
      ],
      () => [
        'You read cuneiform for the rest of your life, and nothing else, and do not let anyone see what you write in the margins.',
        'До конца жизни вы читаете клинопись — и ничего больше — и никому не показываете, что пишете на полях.'
      ]
    ],
    jail: [
      () => [
        'In the prison at Baghdad they let you keep one book. It is a sign list, and you do not let anyone see what you write in the margins.',
        'В багдадской тюрьме вам разрешают оставить одну книгу. Это список клинописных знаков, и никто не видит, что вы пишете на полях.'
      ]
    ],
    // (after the Museum's word that the notebooks went home unread: data/world.js, ENDINGS.death)
    gone: [
      () => [
        'Your sister reads one page of your notebooks, and burns the rest in the kitchen range.',
        'Сестра читает одну страницу ваших записных книжек, а остальные сжигает в кухонной плите.'
      ]
    ]
  },
  // what the dig itself did to you (d: where, or the heat); not about the wound itself, which the lines on how you came
  // home tell already (FATE_YOU)
  peril: {
    home: [
      d =>
        d === 'heat'
          ? [
              'You never again go out without a hat, and in high summer you feel the tell swim, a little, behind your eyes.',
              'Вы больше никогда не выходите без шляпы, и в разгар лета холм ещё чуть-чуть плывёт у вас перед глазами.'
            ]
          : d === 'camp'
            ? [
                'Of everything at Kutha, it is the camp itself that left you a scar: you still flinch at the hiss of a primus, and at a tent pole creaking in the wind.',
                'Из всего, что было в Куте, шрам вам оставил сам лагерь: вы до сих пор вздрагиваете от шипения примуса и от скрипа палаточного шеста на ветру.'
              ]
            : [
                `Of everything at Kutha, it is ${PERIL_SAID[d][0]} you remember most often, and there is a mercy in that.`,
                `Из всего, что было в Куте, чаще всего вы вспоминаете ${PERIL_SAID[d][1]} — и в этом есть своё милосердие.`
              ]
    ]
  },
  // harm done you in secret (d: who, and whether you caught them)
  spite: {
    home: [
      d =>
        d.caught
          ? [
              `You never learn why ${d.c.short} hated you so.`,
              `Вы так и не узнаёте, за что ${ru.c(d.c)} так вас ${ru.gs(d.c, 'ненавидел', 'ненавидела')}.`
            ]
          : [
              'You never learn who came to your tent in the night. You lock your door now, even at home.',
              'Вы так и не узнаёте, кто приходил ночью к вашей палатке. Теперь вы запираете дверь — даже дома.'
            ]
    ],
    jail: [
      d =>
        d.caught
          ? [
              `You never learn why ${d.c.short} hated you so.`,
              `Вы так и не узнаёте, за что ${ru.c(d.c)} так вас ${ru.gs(d.c, 'ненавидел', 'ненавидела')}.`
            ]
          : [
              'You never learn who came to your tent in the night. In the prison at Baghdad you sleep with your back to the wall.',
              'Вы так и не узнаёте, кто приходил ночью к вашей палатке. В багдадской тюрьме вы спите, прижавшись спиной к стене.'
            ]
    ]
  },
  // an innocent you sent away (d: them)
  wronged: {
    home: [
      d => [
        `Every spring you write to ${d.short}, whom you sent away from Kutha. No answer ever comes.`,
        `Каждую весну вы пишете ${ru.c(d, 'd')}, ${ru.gs(d, 'которого', 'которую')} отослали из Куты. Ответа так и не приходит.`
      ]
    ]
  },
  // a friend the night took (d: them; not every grave is in Iraq: END_GRAVE)
  grave: {
    home: [
      d => [
        `Whenever you can, you go to ${d.short}’s grave, and stay longer than you meant to.`,
        `Всякий раз, когда удаётся, вы приходите на могилу ${ru.c(d, 'g')} — и задерживаетесь дольше, чем собирались.`
      ]
    ]
  },
  // companions you left below (d: them)
  leftBelow: {
    home: [
      d => [
        `You dream of the stair under E-meslam, and of ${d.short} on it, turning back.`,
        `Вам снится лестница под Э-месламом и ${ru.c(d)} на ней — ${ru.gs(d, 'повернувший', 'повернувшая')} назад.`
      ]
    ],
    dead: [
      d => [
        `${d.short} waited at the top of the stair until noon, and then went for help, which did not come.`,
        `${ru.c(d)} ${ru.gs(d, 'ждал', 'ждала')} у верхней ступени до полудня, а потом ${ru.gs(d, 'пошёл', 'пошла')} за помощью, которая так и не пришла.`
      ]
    ],
    mad: [
      d => [
        `It was ${d.short}, waiting at the top of the stair, who sent the pickmen down for you at noon.`,
        `Это ${ru.c(d)}, ${ru.gs(d, 'ждавший', 'ждавшая')} у верхней ступени, в полдень ${ru.gs(d, 'послал', 'послала')} за вами вниз землекопов.`
      ]
    ]
  },
  // friends who came through (d: how many)
  friends: {
    home: [
      d => [
        d >= 3
          ? 'Letters come from Kutha for years, from more people than you would have thought.'
          : 'For years a letter or two comes from Kutha every winter.',
        d >= 3
          ? 'Письма из Куты приходят годами — от большего числа людей, чем вы могли бы подумать.'
          : 'Годами каждую зиму из Куты приходит письмо-другое.'
      ]
    ]
  },
  // horrors that stayed with you
  horrors: {
    home: [
      () => [
        'You do not like the dark now, or sudden quiet, or the sound of anything gnawing.',
        'Теперь вы не любите темноты, внезапной тишины и звука, с которым что-нибудь грызёт.'
      ]
    ],
    dead: [
      () => [
        'At the service for you in Bloomsbury your sister keeps a lamp lit beside her through the whole of it, and will not say why.',
        'На панихиде по вам в Блумсбери сестра всё время держит рядом зажжённую лампу — и не говорит зачем.'
      ]
    ],
    mad: [
      () => [
        'They leave a light on for you all night on the ward. You asked them to, once, and they remember.',
        'Всю ночь у вас в палате горит свет. Однажды вы об этом попросили, и там помнят.'
      ]
    ]
  }
};
// what the dig hurt you with, as you would remember it afterwards: [English, Russian (accusative)]
const PERIL_SAID = {
  trench: ['the shoring in Trench B', 'крепления в траншее Б'],
  ziggurat: ['a fall from the flank of the ziggurat', 'падение со склона зиккурата'],
  cemetery: ['a Parthian grave', 'парфянскую могилу'],
  canal: ['the canal', 'канал'],
  village: ['a village dog', 'деревенского пса'],
  store: ['a falling shelf of tablets', 'рухнувшую полку с табличками']
};

// ---------- the end you chose ----------
// Rarely, what the season left in you is more than you can carry, and in the end you end it yourself (game/fates.js,
// yourLast). Told by its reason (plain: no more than the season itself; deed: the one you killed, d: { t, cult };
// wronged: an innocent you sent away, d; friends: a friend the night took, d; tent: the one who died beside you, d;
// tablets: the words you read; horrors: what you saw), where the season left you (home: home, or sent home in
// disgrace; mad: a quiet ward; jail: the prison at Baghdad, for the one you killed). Each a function of d, returning
// [English, Russian]. Never how: only that it was, and something of why.
const FATE_YOU_LAST = {
  plain: {
    home: [
      () => [
        'In the end it is not the tell that finishes you. It is a wet Tuesday in Bloomsbury, years later, with nothing at all the matter. The coroner says ‘while the balance of the mind was disturbed’, and your sister never forgives him the word ‘balance’.',
        'В конце концов вас губит не телль. Вас губит дождливый вторник в Блумсбери, годы спустя, когда ничего особенного не случилось. Коронер пишет: «в состоянии нарушенного душевного равновесия», — и сестра так и не прощает ему слова «равновесие».'
      ],
      () => [
        'You last longer than you expected to, and not as long as your sister hoped. When they find you, every clock in the flat has been stopped at a little after three in the morning, the hour the dogs at Kutha used to start.',
        'Вас хватает дольше, чем вы ждали сами, и меньше, чем надеялась сестра. Когда вас находят, все часы в квартире остановлены на четвёртом часу ночи — в тот час, когда в Куте начинали выть собаки.'
      ]
    ],
    mad: [
      () => [
        'In the quiet ward you are calm for a long time, calm enough that they stop watching you so closely. The night they stop, you go down the last stair by yourself.',
        'В тихой палате вы долго остаётесь спокойны — так спокойны, что за вами перестают присматривать. В ту ночь, когда перестают, вы сами спускаетесь по последней лестнице.'
      ],
      () => [
        'The doctors call it a good spring: you eat, you sleep, you speak of going home. In May the inquest is short and kind, and says nothing of the gate.',
        'Врачи называют эту весну удачной: вы едите, спите, говорите о возвращении домой. В мае дознание оказывается коротким и милосердным — и ни словом не упоминает о вратах.'
      ]
    ],
    jail: [
      () => [
        'In the prison at Baghdad you are allowed paper. You write the whole of Kutha down for the court, every gate of it, sign it, and do not wait for the court.',
        'В багдадской тюрьме вам позволяют бумагу. Вы записываете для суда всю Куту, все её врата до единых, ставите подпись — и суда не дожидаетесь.'
      ],
      () => [
        'The trial is set for the autumn. You are not there for it. The warder who found you says that the evening before you had seemed almost at peace.',
        'Суд назначен на осень. Вас на нём уже нет. Надзиратель, который вас нашёл, говорит, что накануне вечером у вас был почти умиротворённый вид.'
      ]
    ]
  },
  deed: {
    home: [
      d =>
        d.cult
          ? [
              `You were right about ${d.t.short}. It ought to have been enough. But ${d.t.short} comes back to the tent every night all the same, and one night, years later, you go to ${EP.him(d.t)} instead.`,
              `Насчёт ${ru.c(d.t, 'g')} вы не ошиблись. Этого должно было хватить. Но ${ru.c(d.t)} всё равно каждую ночь возвращается в ту палатку, и однажды ночью, годы спустя, вы сами идёте к ${ru.gs(d.t, 'нему', 'ней')}.`
            ]
          : [
              `${d.t.short} was never of the cult. You come to know it slowly, the way you once learned a dead language, and once you know it you cannot unknow it. The coroner says ‘while the balance of the mind was disturbed’. It was not disturbed. It was only clear.`,
              `${ru.c(d.t)} никогда не ${ru.gs(d.t, 'был сектантом', 'была сектанткой')}. Вы понимаете это медленно — так, как когда-то учили мёртвый язык, — а поняв, уже не можете забыть. Коронер пишет: «в состоянии помрачения рассудка». Рассудок не был помрачён. Он был ясен.`
            ]
    ],
    mad: [
      d => [
        `In the quiet ward you ask the nurses every night whether ${d.t.short} is asleep yet. One night you go to see for yourself, the only way left to you.`,
        `В тихой палате вы каждую ночь спрашиваете сестёр, спит ли уже ${ru.c(d.t)}. Однажды ночью вы идёте посмотреть сами — единственным путём, который вам остался.`
      ]
    ],
    jail: [
      d => [
        `In the prison at Baghdad you dream of ${d.t.short}’s tent every night. One morning before the hearing the warders find you, and the court is spared its trouble.`,
        `В багдадской тюрьме вам каждую ночь снится палатка ${ru.c(d.t, 'g')}. Однажды утром, ещё до слушания, надзиратели находят вас, и суду больше не о чем хлопотать.`
      ]
    ]
  },
  wronged: {
    home: [
      d => [
        `Every spring you write to ${d.short}, and no answer comes. One spring you stop. Your sister, who finds you, finds the last letter too, unsent, with ‘forgive me’ crossed out and written again until the nib went through the paper.`,
        `Каждую весну вы пишете ${ru.c(d, 'd')}, и ответа не приходит. Однажды весной вы перестаёте. Сестра, которая вас находит, находит и последнее письмо, неотправленное: «простите меня» в нём зачёркнуто и написано снова, пока перо не прорвало бумагу.`
      ]
    ],
    mad: [
      d => [
        `In the quiet ward you write to ${d.short} every day, and the letters are never posted. When the letters stop, the nurses know before they open the door.`,
        `В тихой палате вы каждый день пишете ${ru.c(d, 'd')}, и письма так никто и не отправляет. Когда письма прекращаются, сёстры всё понимают ещё до того, как открывают дверь.`
      ]
    ]
  },
  friends: {
    home: [
      d => [
        `You go back once, to ${d.short}’s grave, and do not come home from it. Your sister is sent your things, and a letter, unfinished, that begins: ‘I cannot leave ${EP.him(d)} out there alone.’`,
        `Однажды вы едете к могиле ${ru.c(d, 'g')} — и домой уже не возвращаетесь. Сестре присылают ваши вещи и неоконченное письмо, которое начинается словами: «Не могу оставить ${ru.gs(d, 'его', 'её')} там ${ru.gs(d, 'одного', 'одну')}».`
      ]
    ],
    mad: [
      d => [
        `In the quiet ward you talk to ${d.short} every evening. One evening, the nurses say, ${d.short} must have answered, because you went.`,
        `В тихой палате вы каждый вечер разговариваете с ${ru.c(d, 'i')}. Однажды вечером, говорят сёстры, ${ru.c(d)}, должно быть, ${ru.gs(d, 'ответил', 'ответила')} — потому что вы ушли.`
      ]
    ]
  },
  tent: {
    home: [
      d => [
        `After Kutha you sleep sitting up, with the lamp lit, listening for ${d.short}’s breathing beside you. One night you hear it, and put out the lamp, and go to ${EP.him(d)}.`,
        `После Куты вы спите сидя, с зажжённой лампой, и прислушиваетесь, не дышит ли рядом ${ru.c(d)}. Однажды ночью вы слышите это дыхание — гасите лампу и идёте к ${ru.gs(d, 'нему', 'ней')}.`
      ]
    ],
    mad: [
      d => [
        `In the quiet ward you keep half the bed for ${d.short}. One morning the nurses find the whole of it made up, very neatly, and you gone where ${d.short} went.`,
        `В тихой палате вы оставляете половину кровати для ${ru.c(d, 'g')}. Однажды утром сёстры находят её всю аккуратно застеленной, а вы уже ушли туда же, куда ${ru.gs(d, 'ушёл', 'ушла')} ${ru.c(d)}.`
      ]
    ]
  },
  tablets: {
    home: [
      () => [
        'You go on reading the wedges after you come home, more slowly every year, as if to make them last. The night you finish the last tablet, you do not open another book. The coroner says ‘while the balance of the mind was disturbed’, which is not how the tablet put it.',
        'Вернувшись домой, вы продолжаете читать клинья — год от года всё медленнее, словно растягивая их. В ту ночь, когда дочитана последняя табличка, вы больше не открываете ни одной книги. Коронер пишет: «в состоянии помрачения рассудка», — табличка выразилась бы иначе.'
      ]
    ],
    mad: [
      () => [
        'In the quiet ward they take away your pencils, so you press the wedges into the plaster with a fingernail. When the last line is finished, so are you. The doctors cannot read it, and are glad of it.',
        'В тихой палате у вас отбирают карандаши, и вы вдавливаете клинья в штукатурку ногтем. Когда дописана последняя строка, обрывается и ваша жизнь. Врачи прочесть её не могут — и рады этому.'
      ]
    ],
    jail: [
      () => [
        'In the prison at Baghdad you scratch the last line of the liturgy into the wall of the cell, and when it is finished, so are you. The warders whitewash it twice, and it comes through both times.',
        'В багдадской тюрьме вы выцарапываете на стене камеры последнюю строку литургии, и когда она дописана, обрывается и ваша жизнь. Надзиратели дважды её забеливают, и дважды она проступает снова.'
      ]
    ]
  },
  horrors: {
    home: [
      () => [
        'For years you sleep with the lamp lit. One winter night you put it out yourself, quite deliberately, and are not afraid of the dark any more, or of anything. Your sister finds the lamp cold in the morning, and you colder.',
        'Годами вы спите при зажжённой лампе. Однажды зимней ночью вы сами, совершенно сознательно, гасите её — и больше не боитесь ни темноты, ни чего-либо вообще. Утром сестра находит лампу остывшей, а вас — холоднее лампы.'
      ]
    ],
    mad: [
      () => [
        'In the quiet ward they leave a light on for you all night. One evening you ask them, very calmly, to put it out, and they think it is a good sign. In the morning they know what it was.',
        'В тихой палате для вас всю ночь горит свет. Однажды вечером вы очень спокойно просите его погасить, и там решают, что это добрый знак. Утром там понимают, что это было.'
      ]
    ]
  }
};

// ---------- a death that came later ----------
// Now and then one of the seven who came through the season does not come through what it left in them (game/fates.js,
// afterDeaths): by their own hand (chosen), or in a way nobody can account for (strange). Told by why (wronged: sent
// away in disgrace; grief: the one they mourned, d; dreams: the true Dreamer; below: one who went down with you; cult:
// one of the cult in a cell; thief: the thief and his tablets; plain: no more than the season itself), in place of all
// else about them. Each a function of the person and d, returning [English, Russian].
const FATE_AFTER = {
  chosen: {
    wronged: [
      c => [
        `${c.name} never works on a dig again. Two years after Kutha ${c.p} dies by ${c.pp} own hand in a rented room, and on the table is a letter to you that ${c.p} never posted.`,
        `${capS(ru.cf(c))} больше никогда не работает на раскопках. Через два года после Куты ${ru.gs(c, 'он сводит', 'она сводит')} счёты с жизнью в съёмной комнате; на столе лежит письмо вам, которое ${ru.gs(c, 'он так и не отправил', 'она так и не отправила')}.`
      ],
      c => [
        `${c.name} could bear the disgrace, ${c.p} said, but not the way people were kind about it. ${EP.He(c)} lasts a winter. At the inquest nobody mentions Kutha, and everyone thinks of it.`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'говорил', 'говорила')}, что ${ru.gs(c, 'вынес', 'вынесла')} бы позор, но не то, как все были к ${ru.gs(c, 'нему', 'ней')} добры. ${ru.gs(c, 'Его', 'Её')} хватает на одну зиму. На дознании никто не упоминает Куту — и все о ней думают.`
      ]
    ],
    grief: [
      (c, d) => [
        `${c.name} never gets over ${d.short}. On the first anniversary ${c.p} goes out to Kutha, to the place where ${d.short} was found, and does not come home; the pickmen who find ${EP.him(c)} there say only that ${c.p} had chosen the place.`,
        `${capS(ru.cf(c))} так и не ${ru.gs(c, 'оправился', 'оправилась')} после смерти ${ru.c(d, 'g')}. В первую годовщину ${ru.gs(c, 'он едет', 'она едет')} в Куту, туда, где нашли ${ru.c(d, 'a')}, и домой уже не возвращается; землекопы, которые ${ru.gs(c, 'его', 'её')} там находят, говорят только, что место ${ru.gs(c, 'он выбрал сам', 'она выбрала сама')}.`
      ],
      (c, d) => [
        `${c.name} keeps ${d.short}’s things for a year, unopened. When ${c.p} opens them at last, ${c.p} writes three letters, one of them to you, and is gone by ${c.pp} own hand before the week is out.`,
        `Целый год ${ru.cf(c)} хранит вещи ${ru.c(d, 'g')} нераспакованными. Когда наконец ${ru.gs(c, 'он их открывает', 'она их открывает')}, ${ru.gs(c, 'он пишет', 'она пишет')} три письма, одно из них вам, — и не проходит недели, как ${ru.gs(c, 'он сам уходит', 'она сама уходит')} из жизни.`
      ]
    ],
    dreams: [
      c => [
        `${c.name} still dreams of the gates every night, and they are always open. In the end ${c.p} puts a stop to the dreams the only way there is.`,
        `${capS(ru.cf(c))} по-прежнему каждую ночь видит во сне врата, и они всегда открыты. В конце концов ${ru.gs(c, 'он', 'она')} прекращает эти сны единственным способом, какой есть.`
      ]
    ],
    cult: [
      c => [
        `${c.name} does not wait for the trial in Baghdad. In the cell they find seven gates scratched into the plaster, and ${EP.him(c)} beneath the seventh, gone through the only one ${c.p} could reach.`,
        `${capS(ru.cf(c))} не дожидается суда в Багдаде. В камере на штукатурке находят семь выцарапанных врат, а под седьмыми — ${ru.gs(c, 'его самого', 'её саму')}: ${ru.gs(c, 'он ушёл', 'она ушла')} в единственные, до которых ${ru.gs(c, 'смог', 'смогла')} дотянуться.`
      ],
      // (a second, so that both of the cult, in their cells, are never told in the same words: game/fates.js)
      c => [
        `${c.name} gives no trouble in the lock-up at Hillah, and asks for nothing but a lamp left burning. The night before ${c.p} is to be taken to Baghdad, ${c.p} asks for it to be put out, and by morning ${c.p} has gone the only way left open to ${EP.him(c)}.`,
        `${capS(ru.cf(c))} не доставляет хлопот в арестантской Хиллы и просит лишь не гасить ${ru.gs(c, 'ему', 'ей')} лампу. Накануне перевода в Багдад ${ru.gs(c, 'он', 'она')} просит её погасить, а к утру ${ru.gs(c, 'его', 'её')} уже нет: ${ru.gs(c, 'он ушёл', 'она ушла')} единственным путём, какой ${ru.gs(c, 'ему', 'ей')} оставался.`
      ]
    ],
    plain: [
      c => [
        `${c.name} goes home and seems well enough, for a year. Then ${c.p} gives away ${c.pp} books, writes three short letters, and is gone by ${c.pp} own hand before the fourth is finished.`,
        `${capS(ru.cf(c))} возвращается домой и год держится вполне сносно. Потом ${ru.gs(c, 'он раздаёт', 'она раздаёт')} свои книги, пишет три коротких письма — и, не дописав четвёртого, ${ru.gs(c, 'сам уходит', 'сама уходит')} из жизни.`
      ],
      c => [
        `Kutha follows ${c.name} home. ${EP.He(c)} lasts until the winter. The family asks the doctor to write something kind on the certificate, and he does.`,
        `Кута следует за ${ru.cf(c, 'i')} до самого дома. ${ru.gs(c, 'Его', 'Её')} хватает до зимы. Родные просят врача написать в свидетельстве что-нибудь милосердное, и он пишет.`
      ]
    ]
  },
  strange: {
    below: [
      c => [
        `Three years after Kutha ${c.name} is found at the foot of a stair in an empty house in Baghdad, without a mark on ${EP.him(c)}. The house has no cellar, and the stair goes down.`,
        `Через три года после Куты ${ru.cf(c, 'a')} находят у подножия лестницы в пустом доме в Багдаде — без единой отметины. Подвала в доме нет, а лестница ведёт вниз.`
      ],
      c => [
        `${c.name} dies in ${c.pp} sleep the next summer. The doctor who signs the certificate cannot account for the brick dust in ${c.pp} lungs.`,
        `Следующим летом ${ru.cf(c)} умирает во сне. Врач, подписывающий свидетельство, не может объяснить, откуда у ${ru.gs(c, 'него', 'неё')} в лёгких кирпичная пыль.`
      ]
    ],
    dreams: [
      c => [
        `${c.name} writes down every dream from then on, in ledgers. The last entry is dated a year to the day after Kutha, and says only: ‘They are open. I am going through.’ Nobody has seen ${EP.him(c)} since.`,
        `С тех пор ${ru.cf(c)} записывает каждый сон в конторские книги. Последняя запись сделана ровно через год после Куты, день в день, и в ней только: «Они открыты. Я иду». С тех пор ${ru.gs(c, 'его', 'её')} никто не видел.`
      ],
      c => [
        `${c.name} dies in ${c.pp} sleep the following winter, with ${c.pp} eyes open. The doctor says the heart. The nurse who closes the eyes says nothing, and asks to be moved to another ward.`,
        `Следующей зимой ${ru.cf(c)} умирает во сне с открытыми глазами. Врач говорит — сердце. Сиделка, которая закрывает ${ru.gs(c, 'ему', 'ей')} глаза, ничего не говорит и просит перевести её в другую палату.`
      ]
    ],
    cult: [
      c => [
        `${c.name} is found in ${c.pp} cell in Hillah before the trial, cold, and smiling. The guards swear the door was never opened. On the floor, in the dust, are seven circles, one inside another.`,
        `Ещё до суда ${ru.cf(c, 'a')} находят в камере в Хилле — ${ru.gs(c, 'холодного и улыбающегося', 'холодную и улыбающуюся')}. Стражники клянутся, что дверь ни разу не открывали. На полу, в пыли, — семь кругов, один в другом.`
      ],
      c => [
        `${c.name} dies in the prison at Baghdad of a fever the prison doctor cannot name. Everyone in ${c.pp} wing dreams of seven gates that night, and none of them will speak of it.`,
        `${capS(ru.cf(c))} умирает в багдадской тюрьме от лихорадки, которой тюремный врач не может подобрать названия. В ту ночь всем в ${ru.gs(c, 'его', 'её')} крыле снятся семь врат, и никто об этом не говорит.`
      ]
    ],
    thief: [
      c => [
        `${c.name} is found dead in a hotel room in Aleppo, among the packing straw. The tablet ${c.p} had come to sell is gone, and ${c.pp} mouth is full of wet clay.`,
        `${capS(ru.cf(c, 'a'))} находят ${ru.gs(c, 'мёртвым', 'мёртвой')} в гостиничном номере в Алеппо, среди упаковочной соломы. Табличка, которую ${ru.gs(c, 'он приехал', 'она приехала')} продать, исчезла, а рот у ${ru.gs(c, 'него', 'неё')} забит сырой глиной.`
      ],
      c => [
        `${c.name} drowns in a room on the third floor of a dry house in Damascus. The police call the water a mystery, and the salt in it a greater one.`,
        `${capS(ru.cf(c))} тонет в комнате на третьем этаже сухого дома в Дамаске. Полиция называет воду загадкой, а соль в ней — загадкой ещё большей.`
      ]
    ],
    plain: [
      c => [
        `${c.name} goes home and is dead within the year, of what the doctors call the heart. Nobody explains the circle scorched into the floorboards where ${c.p} was found.`,
        `${capS(ru.cf(c))} возвращается домой и не проживает и года: врачи говорят — сердце. Никто не может объяснить выжженный в половицах круг там, где ${ru.gs(c, 'его', 'её')} нашли.`
      ],
      c => [
        `${c.name} walks out of ${c.pp} house one autumn evening, and is found three days later at the foot of a ruin ${c.p} had never visited, face down, towards the east.`,
        `Однажды осенним вечером ${ru.cf(c)} выходит из дома, а через три дня ${ru.gs(c, 'его', 'её')} находят у подножия развалин, где ${ru.gs(c, 'он', 'она')} никогда не ${ru.gs(c, 'бывал', 'бывала')}, — лицом вниз, головой к востоку.`
      ]
    ]
  }
};
