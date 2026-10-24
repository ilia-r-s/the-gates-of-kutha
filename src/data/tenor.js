// ===================== THE SEASON'S MOOD: its words =====================
// How each mood (game/tenor.js) shows itself: the camp as you arrive, the night before the morning, the first light of
// a day, and the morning it turns into another. And the moods by name, for the ending. Each line is [English, Russian].
const TENOR_SAY = {
  // the camp as you arrive, the morning after Crane was found
  arrival: {
    still: [
      'The camp is very quiet. The workmen go about their work without a word.',
      'В лагере очень тихо. Рабочие делают своё дело молча.'
    ],
    uneasy: [
      'The workmen have not stopped talking about it, and they stop when you come near.',
      'Рабочие только об этом и говорят — и умолкают, едва вы подходите.'
    ],
    haunted: [
      'The workmen will not dig near the ziggurat today, and not one of them will say why.',
      'Рабочие сегодня не станут копать у зиккурата — и ни один не говорит почему.'
    ],
    tongues: [
      'The whole camp is talking about it at once, and everyone has a different story.',
      'Весь лагерь говорит об этом разом, и у каждого своя история.'
    ],
    world: [
      'There is already a policeman from Hillah at the camp, and a man from a Baghdad newspaper on the way.',
      'В лагере уже полицейский из Хиллы, а из Багдада едет газетчик.'
    ]
  },
  // the night, as it opens the morning's page
  night: {
    still: [
      ['The night is very still. Even the dogs in the village are silent.', 'Ночь совершенно тиха. Молчат даже деревенские собаки.'],
      [
        'No wind at all. You can hear the canal moving in the dark, a mile off.',
        'Ни ветерка. Слышно, как в темноте, за милю отсюда, течёт канал.'
      ],
      [
        'The camp goes to bed early and says nothing. The lamps go out one by one.',
        'Лагерь рано ложится спать и молчит. Лампы гаснут одна за другой.'
      ]
    ],
    uneasy: [
      ['The jackals start up after midnight, then stop all at once.', 'После полуночи заводят свой вой шакалы — и разом смолкают.'],
      [
        'Someone walks between the tents long after midnight, stops, and walks on.',
        'Далеко за полночь кто-то ходит между палатками: останавливается и идёт дальше.'
      ],
      [
        'A lamp burns late in the mess tent. Low voices, then nothing.',
        'В столовой палатке допоздна горит лампа. Негромкие голоса, потом тишина.'
      ]
    ],
    haunted: [
      [
        'You sleep badly. Somewhere a reed pipe plays a tune with too many notes.',
        'Вы плохо спите. Где-то тростниковая дудка выводит мелодию, в которой слишком много нот.'
      ],
      [
        'The dogs howl at the mound all night, and in the morning none of them will go near it.',
        'Всю ночь собаки воют на холм, а утром ни одна не подходит к нему близко.'
      ],
      [
        'Twice in the night the canvas of your tent draws in, like a breath, though there is no wind.',
        'Дважды за ночь полотно вашей палатки втягивается внутрь, словно делает вдох, хотя ветра нет.'
      ],
      [
        'Towards dawn the lamp in your tent burns low and blue, though there is oil enough.',
        'К рассвету лампа в вашей палатке горит низким синим пламенем, хотя масла в ней довольно.'
      ]
    ],
    tongues: [
      [
        'Voices from the mess tent until late: an argument, then laughter that goes on too long.',
        'До поздней ночи из столовой палатки доносятся голоса: спор, потом смех — слишком долгий.'
      ],
      [
        'Someone is crying in one of the tents. By morning nobody will say who.',
        'В одной из палаток кто-то плачет. Утром никто не скажет кто.'
      ],
      [
        'Whispering outside your tent, and your name in it. When you lift the flap, there is no one.',
        'Шёпот у вашей палатки, и в нём ваше имя. Когда вы откидываете полог, снаружи никого.'
      ]
    ],
    world: [
      [
        'Headlights on the Hillah road long after midnight, and an engine that does not stop.',
        'Далеко за полночь на дороге из Хиллы — фары и шум мотора, который так и не стихает.'
      ],
      [
        'A dog barks in the village, then another, then all of them: riders passing in the dark.',
        'В деревне лает собака, потом другая, потом все разом: в темноте проезжают всадники.'
      ],
      [
        'The wind changes in the night and brings the smell of rain from somewhere far off.',
        'Ночью меняется ветер и приносит запах дождя откуда-то издалека.'
      ]
    ]
  },
  // the first light of each day, at the head of the site plan
  dawn: {
    still: [
      [
        'The sun is up and already hot. The diggers work in silence: you can hear every pick.',
        'Солнце уже высоко и печёт. Землекопы работают молча: слышен каждый удар кирки.'
      ],
      [
        'The sun is up and already hot. Nothing moves on the plain but the heat.',
        'Солнце уже высоко и печёт. На равнине не движется ничего, кроме зноя.'
      ],
      [
        'First light, and already the heat stands on the tell. The pickmen swing in time, and nobody speaks.',
        'Едва рассвело, а на телле уже стоит жара. Землекопы машут кирками в такт, и никто не разговаривает.'
      ],
      [
        'Morning. The canal is a strip of beaten copper, and the only sound is the baskets going up and down.',
        'Утро. Канал — полоса кованой меди, и слышно только, как поднимают и опускают корзины.'
      ],
      [
        'The sun clears the palms, and the shadows of the tents shorten while you watch. A quiet morning.',
        'Солнце встаёт над пальмами, и тени палаток укорачиваются прямо на глазах. Тихое утро.'
      ]
    ],
    uneasy: [
      [
        'The sun is up and already hot. The diggers’ songs carry from the tell.',
        'Солнце только встало, а уже печёт. С телля доносятся песни землекопов.'
      ],
      ['The sun is up and already hot. The diggers sing, but not for long.', 'Солнце уже высоко и печёт. Землекопы поют — но недолго.'],
      [
        'Morning, bright and hot. The pickmen sing as they climb the tell, though one or two do not join in.',
        'Утро, яркое и жаркое. Землекопы поют, поднимаясь на телль, хотя кое-кто не подпевает.'
      ],
      [
        'The sun is a hand’s breadth high. Someone in the trench laughs, too loudly, and the others go quiet.',
        'Солнце поднялось на ладонь. Кто-то в траншее смеётся слишком громко, и остальные умолкают.'
      ],
      [
        'Morning. The diggers are at work early, and keep glancing at the ziggurat between baskets.',
        'Утро. Землекопы рано взялись за работу и между корзинами всё поглядывают на зиккурат.'
      ]
    ],
    haunted: [
      [
        'The sun is up, but the light is thin and grey. The diggers work without singing, and keep looking over their shoulders.',
        'Солнце взошло, но свет жидкий и серый. Землекопы работают без песен и то и дело оглядываются.'
      ],
      [
        'The sun is up, and the mound throws a shadow longer than it should.',
        'Солнце взошло, а холм отбрасывает тень длиннее, чем положено.'
      ],
      [
        'Dawn comes up the colour of ash. A dog howls in the village, and goes on howling after the sun is up.',
        'Рассвет цвета пепла. В деревне воет собака — и не умолкает, даже когда солнце уже взошло.'
      ],
      [
        'Morning, but the birds are silent. The diggers file up the tell in a close knot, as if for warmth.',
        'Утро, но птицы молчат. Землекопы поднимаются на телль тесной кучкой, будто греясь друг о друга.'
      ],
      [
        'The sun is up. For a moment, as it clears the ziggurat, the light seems to come from the wrong side.',
        'Солнце взошло. На миг, когда оно поднимается над зиккуратом, кажется, что свет падает не с той стороны.'
      ]
    ],
    tongues: [
      [
        'The sun is up and already hot. In the trench they are arguing again, and stop when you come near.',
        'Солнце уже высоко и печёт. В траншее опять спорят — и замолкают, стоит вам подойти.'
      ],
      [
        'The sun is up and already hot. Two of the pickmen fall silent as you pass, and laugh behind your back.',
        'Солнце уже высоко и печёт. Двое землекопов умолкают, когда вы проходите мимо, и смеются вам в спину.'
      ],
      [
        'Morning. By the tea urn three people stop talking at once as you come up.',
        'Утро. У самовара трое разом замолкают, когда вы подходите.'
      ],
      [
        'The sun is up and the talk is already going. You hear your own name twice on the way to the trench.',
        'Солнце взошло, а разговоры уже идут вовсю. Пока вы идёте к траншее, дважды слышите своё имя.'
      ],
      [
        'Morning. The pickmen work in twos and threes, heads together, and break apart when the foreman shouts.',
        'Утро. Землекопы работают по двое-трое, склонив головы друг к другу, и расходятся, стоит старшине крикнуть.'
      ]
    ],
    world: [
      [
        'The sun is up and already hot. A plume of dust on the Hillah road: someone else is coming.',
        'Солнце уже высоко и печёт. Над дорогой из Хиллы столб пыли: к лагерю опять кто-то едет.'
      ],
      [
        'The sun is up and already hot. Somewhere a motor horn, and the diggers straighten up to look.',
        'Солнце уже высоко и печёт. Где-то гудит клаксон, и землекопы распрямляются, чтобы посмотреть.'
      ],
      [
        'Morning, and the post-boy from Hillah already at the gate, with letters nobody expected.',
        'Утро, а у ворот уже посыльный из Хиллы — с письмами, которых никто не ждал.'
      ],
      [
        'The sun is up. A string of camels passes on the skyline, and the diggers stop to count them.',
        'Солнце взошло. По горизонту тянется караван верблюдов, и землекопы бросают работу, чтобы их сосчитать.'
      ],
      [
        'Morning. An aeroplane drones over from Hinaidi, very high, and the whole tell stops to look up.',
        'Утро. Со стороны Хинайди, очень высоко, гудит аэроплан, и весь телль задирает головы.'
      ]
    ]
  },
  // the first light of a short day, whatever the mood: the diggers will not dig, or the dust stops them
  short: {
    strike: ['The sun is up and already hot. The trenches stand empty.', 'Солнце уже высоко и печёт. Траншеи пусты.'],
    dust: [
      'The sun is a white coin behind the dust, and the tents strain at their ropes.',
      'Солнце — белая монетка за пеленой пыли, палатки рвутся с растяжек.'
    ]
  },
  // the morning the mood turns into another (not always told)
  turn: {
    still: [
      [
        'Something has gone out of the camp overnight. People speak little, and quietly.',
        'За ночь из лагеря что-то ушло. Говорят мало и негромко.'
      ],
      [
        'The camp is quieter this morning, as if it had agreed on something in the night.',
        'Этим утром в лагере тише, будто ночью все о чём-то договорились.'
      ]
    ],
    uneasy: [
      [
        'The camp wakes on edge. People look up too quickly when someone passes.',
        'Лагерь просыпается настороженным. Стоит кому-то пройти мимо, все слишком быстро поднимают глаза.'
      ],
      ['Nobody slept well, and nobody says so.', 'Никто толком не спал, и никто об этом не говорит.']
    ],
    haunted: [
      [
        'The tell feels nearer this morning, as if it had moved in the night.',
        'Этим утром холм кажется ближе, будто ночью он сдвинулся с места.'
      ],
      [
        'The birds have left the mound. Not one of them sings over it this morning.',
        'Птицы покинули холм. Этим утром над ним не поёт ни одна.'
      ]
    ],
    tongues: [
      [
        'By breakfast everyone is talking at once, and not all of it to each other’s faces.',
        'К завтраку говорят все разом — и не всегда в лицо друг другу.'
      ],
      [
        'Something has loosened tongues overnight. Every tent has an opinion.',
        'За ночь что-то развязало языки. У каждой палатки теперь своё мнение.'
      ]
    ],
    world: [
      [
        'The world outside has remembered Kutha: the road is busy from first light.',
        'Внешний мир вспомнил о Куте: с рассвета на дороге оживлённо.'
      ],
      [
        'From first light there are strangers about the camp, and news from everywhere.',
        'С рассвета вокруг лагеря чужие люди, и новости отовсюду.'
      ]
    ]
  },
  // the moods by name, as the ending tells the season's course
  name: {
    still: ['still', 'тихим'],
    uneasy: ['uneasy', 'тревожным'],
    haunted: ['haunted', 'жутким'],
    tongues: ['full of talk', 'полным пересудов'],
    world: ['full of comings and goings', 'суетным']
  }
};
