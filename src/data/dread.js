// ===================== DREAD: what finds you outside the tomb, and the rite's progress =====================
// Horrors that come of themselves, whatever you are doing (game/dread.js), in three degrees as the rite gains: some of
// them anywhere, some only in one place, some at night. None of them is a sign of any power: they are what the mound
// does to the people on it. And the scorched circle at the foot of E-meslam, widening as the rite gains. Each line is
// [English, Russian].
const DREAD = {
  any: [
    [
      [
        'For a moment every sound on the tell stops at once: the picks, the songs, the flies. Then it all begins again, as if nothing had happened.',
        'На миг все звуки на холме смолкают разом: кирки, песни, мухи. Потом всё начинается снова, будто ничего не было.'
      ],
      ['Your shadow is a moment late in following you.', 'Ваша тень следует за вами с опозданием на мгновение.'],
      [
        'Someone calls your name from just behind you, in Crane’s voice. There is no one there.',
        'Кто-то окликает вас по имени прямо у вас за спиной — голосом Крейна. Там никого нет.'
      ],
      [
        'A procession of black ants crosses your path in perfect order, and every one of them is carrying a grain of brick.',
        'Через вашу тропу движется процессия чёрных муравьёв — в безупречном порядке, и каждый несёт крупинку кирпича.'
      ]
    ],
    [
      [
        'The ground under your feet gives, like a held breath let go, and then is firm again.',
        'Земля у вас под ногами подаётся, как отпущенный наконец вдох, — и снова становится твёрдой.'
      ],
      [
        'There is a word scratched in the dust on your boots, in cuneiform, in a hand you know to be your own.',
        'В пыли на ваших сапогах нацарапано слово — клинописью, и почерк, вы знаете, ваш собственный.'
      ],
      [
        'For an hour you cannot remember Crane’s face. Then you cannot stop seeing it.',
        'Целый час вы не можете вспомнить лицо Крейна. Потом не можете перестать его видеть.'
      ]
    ],
    [
      [
        'The tell is breathing. You can see it now: the whole mound rising and falling, slow as a sleeper. Nobody else seems to notice.',
        'Холм дышит. Теперь вы это видите: весь холм медленно поднимается и опускается, как спящий. Больше никто, кажется, этого не замечает.'
      ],
      [
        'For a moment the sky over E-meslam is not the sky, but a ceiling, very far up, painted to look like one.',
        'На миг небо над Э-месламом перестаёт быть небом: это потолок, очень высоко, расписанный под небо.'
      ],
      [
        'Every shadow on the dig points the same way, toward the ziggurat, whatever the sun has to say about it.',
        'Все тени на раскопе указывают в одну сторону — на зиккурат, что бы ни говорило на этот счёт солнце.'
      ]
    ]
  ],
  at: {
    camp: [
      [
        [
          'In the mess tent the cards from last night’s game have been laid out again, in a pattern no game uses.',
          'В столовой палатке карты со вчерашней игры снова разложены — так, как их не раскладывают ни в одной игре.'
        ]
      ],
      [
        [
          'Your camp bed has been made up with the sheet folded the old way, as Crane folded his. Nobody will own to it.',
          'Вашу походную кровать кто-то застелил, загнув простыню по-старинному, как загибал свою Крейн. Никто в этом не признаётся.'
        ]
      ],
      [
        [
          'When you lift the flap, your tent is much deeper than it is wide, and at the far end something is lighting a lamp.',
          'Вы откидываете полог: палатка внутри куда глубже, чем шире, и в дальнем её конце кто-то зажигает лампу.'
        ]
      ]
    ],
    trench: [
      [
        [
          'A pick left standing in the trench has fallen over in the night, and lies pointing at the ziggurat.',
          'Кирка, оставленная в траншее, ночью упала и теперь лежит, указывая на зиккурат.'
        ]
      ],
      [
        [
          'From the bottom of the step trench comes the sound of someone else digging, very slowly, from below.',
          'Со дна ступенчатой траншеи доносится звук: кто-то ещё копает — очень медленно, снизу.'
        ]
      ],
      [
        [
          'There is a face in the section wall now: three thousand years of ash and brick, arranged into one long face, eyes shut.',
          'В стенке разреза теперь есть лицо: три тысячи лет золы и кирпича сложились в одно длинное лицо с закрытыми глазами.'
        ]
      ]
    ],
    ziggurat: [
      [
        [
          'A brick on the third terrace bears a fingerprint. The clay is four thousand years old; the print is fresh.',
          'На кирпиче третьего уступа — отпечаток пальца. Глине четыре тысячи лет, а отпечаток свежий.'
        ]
      ],
      [
        [
          'Halfway up the ziggurat there is a door in the brick where there was no door yesterday. When you look again, there is none.',
          'На полпути к вершине зиккурата в кладке видна дверь, которой вчера не было. Вы смотрите снова — двери нет.'
        ]
      ],
      [
        [
          'Voices come out of the brick, chanting, very far down. You know the words. You have been translating them.',
          'Из кирпича доносятся голоса: где-то далеко внизу поют. Вы знаете эти слова. Вы их переводили.'
        ]
      ]
    ],
    store: [
      [
        ['One of the cigar boxes on the shelf is ticking softly, like a clock.', 'Одна из сигарных коробок на полке тихо тикает, как часы.']
      ],
      [['The tablets on the top shelf have all been turned to face the wall.', 'Все таблички на верхней полке повёрнуты лицом к стене.']],
      [
        [
          'Every tablet in the magazine bears the same line now. You will not write down what it says.',
          'Теперь на каждой табличке в хранилище одна и та же строка. Что в ней сказано, вы записывать не станете.'
        ]
      ]
    ],
    village: [
      [
        [
          'The coffee-house falls silent as you pass, and every man in it turns to watch you, all at once, in the same way.',
          'Когда вы проходите мимо, кофейня смолкает, и все до одного поворачиваются вам вслед — разом и одинаково.'
        ]
      ],
      [
        [
          'A girl in the lane is singing a lullaby in a language you have only ever read on clay.',
          'Девочка в переулке поёт колыбельную на языке, который вы встречали только на глине.'
        ]
      ],
      [
        [
          'The villagers have hung blue beads over every door, and they will not look at you at all.',
          'Над каждой дверью в деревне висят синие бусы от сглаза, и на вас никто даже не смотрит.'
        ]
      ]
    ],
    canal: [
      [
        [
          'The reeds lean toward you as you pass, though there is not a breath of wind.',
          'Тростник клонится к вам, когда вы проходите, хотя нет ни ветерка.'
        ]
      ],
      [
        [
          'Something long and pale moves under the water against the current, and the buffalo will not go near it.',
          'Под водой что-то длинное и бледное движется против течения, и буйволы не подходят к нему.'
        ]
      ],
      [
        [
          'The canal has stopped. Not frozen: stopped, the water standing in the middle of a ripple.',
          'Канал остановился. Не замёрз — остановился: вода застыла посреди ряби.'
        ]
      ]
    ],
    cemetery: [
      [
        [
          'The faces moulded on the coffin lids seem to have turned a little toward the path.',
          'Лица, вылепленные на крышках гробов, будто бы слегка повернулись к тропе.'
        ]
      ],
      [
        [
          'There is a fresh grave among the Parthian rows, the earth still loose. No one has died.',
          'Среди парфянских рядов — свежая могила, земля ещё рыхлая. Никто не умирал.'
        ]
      ],
      [
        [
          'All the lids in the nearest row stand open, and the moulded faces on them are looking up at you.',
          'Все крышки в ближнем ряду открыты, и вылепленные на них лица смотрят на вас снизу вверх.'
        ]
      ]
    ]
  },
  night: [
    [
      [
        'You wake at three to the sound of someone breathing in the tent with you. When you light the lamp, the breathing stops, a moment later than it should.',
        'Вы просыпаетесь в три часа: в палатке кто-то дышит рядом с вами. Когда вы зажигаете лампу, дыхание смолкает — на мгновение позже, чем следовало бы.'
      ],
      [
        'All night something walks round and round your tent, never quite touching the ropes.',
        'Всю ночь что-то ходит и ходит вокруг вашей палатки, ни разу не задев растяжек.'
      ]
    ],
    [
      [
        'You dream of a stair going down, and wake with brick dust under your fingernails.',
        'Вам снится лестница, уходящая вниз, и вы просыпаетесь с кирпичной пылью под ногтями.'
      ],
      [
        'In the night you come to yourself at the foot of the ziggurat, barefoot, with no memory of the walk.',
        'Ночью вы приходите в себя у подножия зиккурата — босиком, не помня, как туда шли.'
      ]
    ],
    [
      [
        'All night the ground under your camp bed knocks, softly: three times, and then three again, like someone asking to be let in.',
        'Всю ночь земля под вашей кроватью тихонько стучит: три раза — и снова три, как стучит тот, кто просит впустить.'
      ],
      [
        'You wake to find the whole camp asleep on its feet, every one of them, facing the ziggurat. By dawn none of them remembers a thing.',
        'Вы просыпаетесь и видите: весь лагерь спит стоя, все до одного, лицом к зиккурату. К рассвету никто ничего не помнит.'
      ]
    ]
  ]
};
// the scorched circle at the foot of E-meslam: stirring (from RULES.start.doomStir), and close (from doomWarn)
const RITE_NOTE = {
  stir: [
    [
      'The scorched circle at the foot of E-meslam is a hand’s breadth wider this morning.',
      'Выжженный круг у подножия Э-меслама за ночь стал шире на ладонь.'
    ],
    [
      'The pickmen have moved their tea-fire away from the ziggurat. The ground there hums, they say, like a hive.',
      'Землекопы перенесли свой костёр для чая подальше от зиккурата. Земля там гудит, говорят они, как улей.'
    ]
  ],
  warn: [
    [
      'The scorched circle at the foot of E-meslam has widened again. The rite is close.',
      'Выжженный круг у подножия Э-меслама снова стал шире. Обряд близок.'
    ],
    [
      'The scorched circle has reached the lowest course of E-meslam. The diggers will not cross the camp after dark. The rite is close.',
      'Выжженный круг дошёл до нижнего ряда кладки Э-меслама. После заката землекопы не переходят лагерь. Обряд близок.'
    ],
    [
      'In the night the scorched circle split along one side, and a breath comes out of the crack that smells of old brick. The rite is close.',
      'Ночью выжженный круг треснул с одного края, и из трещины тянет дыханием, пахнущим старым кирпичом. Обряд близок.'
    ]
  ]
};
