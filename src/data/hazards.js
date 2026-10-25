// ===================== WHAT ELSE MAY HURT YOU: the words =====================
// The dig's own dangers, place by place, and the afternoon heat anywhere out on the tell (game/hazards.js): each
// [English, Russian, nerve, wounds]. And the harm done you in secret by night by someone who cannot stand you: each kind
// as it lands, and as you find it in time. Each line is [English, Russian].
const PERILS = {
  trench: [
    [
      'The shoring gives way as you climb down into Trench B, and a cartload of spoil comes down after you.',
      'Крепление подаётся, когда вы спускаетесь в траншею Б, и следом за вами обрушивается целая тачка земли.',
      0,
      1
    ],
    [
      'A pickman’s swing comes round as you pass behind him in the narrow cut. He is very sorry. You are bleeding.',
      'Кирка землекопа описывает дугу как раз тогда, когда вы проходите у него за спиной в узкой траншее. Ему очень жаль. У вас идёт кровь.',
      0,
      1
    ]
  ],
  ziggurat: [
    [
      'A course of baked brick turns under your foot on the flank of the ziggurat, and you fall the height of a man onto the rubble.',
      'Ряд обожжённого кирпича поворачивается у вас под ногой на склоне зиккурата, и вы падаете с высоты человеческого роста на щебень.',
      0,
      1
    ],
    [
      'On the top terrace a gust takes your hat, and very nearly you. You lie flat on the hot brick until your heart slows.',
      'На верхнем уступе порыв ветра срывает с вас шляпу — и едва не уносит вас самих. Вы лежите ничком на горячем кирпиче, пока сердце не уймётся.',
      2,
      0
    ]
  ],
  cemetery: [
    [
      'A Parthian grave gives way under you. You go in to the waist among the bones, and something down there bites.',
      'Парфянская могила проваливается под вами. Вы уходите по пояс в кости, и что-то там, внизу, кусает.',
      1,
      1
    ],
    [
      'The light goes while you are still among the graves, and it is an hour before you find the path again, an hour of stepping on what gives.',
      'Свет уходит, пока вы ещё среди могил, и проходит час, прежде чем вы снова находите тропу, — час шагов по тому, что проседает под ногой.',
      1,
      0
    ]
  ],
  canal: [
    [
      'You drink from your bottle and taste the canal in it. By evening you are shaking with fever, and the tell will not keep still.',
      'Вы пьёте из фляги и чувствуете в воде канал. К вечеру вас бьёт лихорадка, и холм никак не желает стоять на месте.',
      2,
      0
    ],
    [
      'A water snake comes up out of the reeds at your ankle, quick as a thrown rope.',
      'Водяная змея бросается из тростника к вашей лодыжке, быстрая, как брошенная верёвка.',
      0,
      1
    ]
  ],
  village: [
    [
      'A pariah dog comes at you from behind a mud wall, silent, and has hold of your calf before anyone can drive it off.',
      'Бродячий пёс молча бросается на вас из-за глинобитной стены и вцепляется в икру, прежде чем кто-нибудь успевает его отогнать.',
      0,
      1
    ],
    [
      'An old woman at the well tells you, kindly, that everyone who comes to dig at Tell Ibrahim dies of it. She says it the way one gives directions.',
      'Старуха у колодца ласково говорит вам, что все, кто приезжает копать Телль-Ибрагим, от этого умирают. Говорит так, как объясняют дорогу.',
      1,
      0
    ]
  ],
  store: [
    [
      'A shelf of boxed tablets comes down as you reach past it. You get your arm up in time, more or less.',
      'Полка с ящиками табличек обрушивается, когда вы тянетесь мимо неё. Руку вы подставить успеваете — более или менее.',
      0,
      1
    ],
    [
      'The magazine door swings to behind you and the bar drops outside. It is an hour before anyone hears you knocking, and the boxes of bones are very close in the dark.',
      'Дверь хранилища захлопывается у вас за спиной, и снаружи падает засов. Проходит час, прежде чем кто-нибудь слышит ваш стук, а ящики с костями в темноте совсем рядом.',
      1,
      0
    ]
  ],
  camp: [
    [
      'A tent pole gives way in the afternoon wind and brings the wet canvas down on you, pole and all.',
      'Палаточный шест не выдерживает послеполуденного ветра и обрушивает на вас мокрый брезент — вместе с собой.',
      0,
      1
    ],
    [
      'The cook’s primus flares as you pass the kitchen tent, and takes the skin off the back of your hand.',
      'Примус повара вспыхивает, когда вы проходите мимо кухонной палатки, и обжигает вам тыльную сторону ладони.',
      0,
      1
    ]
  ],
  heat: [
    [
      'By three in the afternoon the heat has you. The tell swims, the men’s voices come from very far away, and you are sick behind a spoil heap.',
      'К трём часам дня жара берёт своё. Холм плывёт, голоса рабочих доносятся откуда-то издалека, и вас выворачивает за отвалом.',
      2,
      0
    ],
    [
      'The sun finds the back of your neck and stays there. You lose an hour in the shade of the dig-house, unable to remember what you came for.',
      'Солнце находит ваш затылок и не отпускает. Целый час вы сидите в тени дома экспедиции и не можете вспомнить, зачем пришли.',
      1,
      0
    ]
  ]
};
// harm done in secret: as it lands ([English, Russian, nerve, wounds]), and as you find it in time
const SPITE = {
  scorpion: {
    ok: [
      'When you pull on your boot in the morning, something in the toe stings, twice. You left that boot upside down on the tent pole. Someone turned it over.',
      'Утром, когда вы натягиваете сапог, в носке что-то жалит — дважды. Вы оставляли этот сапог вверх подошвой на шесте палатки. Кто-то его перевернул.',
      0,
      1
    ],
    foiled: [
      'You shake out your boots from habit, and a scorpion drops out of one of them. You left them upside down on the tent pole. Someone turned them over.',
      'По привычке вы вытряхиваете сапоги, и из одного выпадает скорпион. Вы оставляли их вверх подошвой на шесте палатки. Кто-то их перевернул.'
    ]
  },
  water: {
    ok: [
      'Someone has salted the water in your jar. You find out at the second mouthful, and are sick until noon.',
      'Воду в вашем кувшине кто-то засолил. Вы понимаете это со второго глотка и до полудня мучаетесь тошнотой.',
      2,
      0
    ],
    foiled: [
      'The water in your jar tastes of salt. You spit it out in time. Someone has been in your tent.',
      'Вода в вашем кувшине отдаёт солью. Вы вовремя её выплёвываете. Кто-то побывал у вас в палатке.'
    ]
  },
  lamp: {
    ok: [
      'Your lamp will not stay lit: someone has watered the oil. You spend the small hours in the dark, listening to the tell.',
      'Ваша лампа никак не хочет гореть: кто-то разбавил масло водой. Предрассветные часы вы проводите в темноте, прислушиваясь к холму.',
      1,
      0
    ],
    foiled: [
      'In the small hours your lamp gutters and spits: someone has watered the oil. There is a spare tin under your cot, and you sit up with it until morning.',
      'Под утро ваша лампа начинает трещать и гаснуть: кто-то разбавил масло водой. Под койкой у вас есть запасная жестянка, и до утра вы сидите со светом.'
    ]
  },
  theft: {
    foiled: [
      'Someone has been through your kit in the night, though nothing is missing that you can find.',
      'Ночью кто-то рылся в вашем снаряжении, хотя пропажи вы не находите.'
    ]
  }
};
