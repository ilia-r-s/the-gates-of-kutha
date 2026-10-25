// ===================== THE POWERS BELOW: a deduction puzzle dealt anew every game =====================
// Four powers of the eight (data/world.js, PANTHEON) are in play each game, and eight signs of the forty-eight. Every sign
// belongs to exactly two powers and every power has four signs, so no single sign names a power. Six old charms of the
// twelve lie in the tell: four are wards (one per power), two bind nothing.
// The tablets never speak plainly. They call the powers by old titles (two each, dealt anew every game from thirty-two
// that belong to no power for good), they write the signs as omen formulas, and they know the charms only by their
// marks, dealt anew every game too. Glosses tie a title to a name, or only to another title; scholars can explain a title, and a
// cultist scholar explains it falsely.
// The answer comes from following the links: what you saw, its formula, the title, the gloss, the power.
const SHORTS = {
  fire: [
    'the Pleiades hang low over the mound',
    'children burn with fever and do not sweat',
    'the bricks are warm at dawn',
    'a lion roars where no lion lives',
    'a red star stands still over the mound',
    'smoke rises from an unburnt field',
    'the sun rises the colour of blood',
    'the well water comes up warm'
  ],
  dust: [
    'owls gather and face the mound',
    'dust falls from a clear sky',
    'the dead walk and eat dust',
    'every door stands open at dawn',
    'old graves are found open',
    'no bird sings at noon',
    'a shadow falls where no one stands',
    'the lamps burn and give no light'
  ],
  sea: [
    'the canal runs salt',
    'a horned serpent with legs is killed in the reeds',
    'the wind blows from all four quarters at once',
    'a scorpion with a man’s face comes up in the spoil',
    'fish fall from a clear sky',
    'the canal runs backwards',
    'frogs swarm up out of the canal',
    'a sea mist rises from dry ground'
  ],
  teeth: [
    'a dog and a pig lie suckling at nothing',
    'a comb and a spindle are left on a threshold',
    'a lion-headed visitor comes to a birth',
    'something with a donkey’s teeth gnaws the saddles',
    'a lamb is born with two heads',
    'the goats give blood with their milk',
    'dogs howl at the door of a woman in labour',
    'the nursing mothers’ milk dries up overnight'
  ],
  plague: [
    'flies cover the camp in a black cloud',
    'rats come out by day to die in the open',
    'the oxen sicken, with sores at their mouths',
    'the grain rots overnight',
    'a cough goes round the camp in the night',
    'fresh meat is fly-blown within hours',
    'dark spots come up on the skin overnight',
    'a cart with nothing in its shafts goes from door to door'
  ],
  madness: [
    'the whole camp dreams one dream',
    'the stamps on the bricks read backwards',
    'a mirror shows a stranger’s face',
    'sleepwalkers go round the mound',
    'someone laughs all night on the empty tell',
    'people forget their own names',
    'every clock stops at the same minute',
    'the same footsteps pass twice'
  ]
};
// the six natures, each with its words (data/world.js) and the short names of its signs; key: which it is
const ASPECTS = {};
Object.keys(ASPECT_TEXT).forEach(k => {
  ASPECTS[k] = { key: k, ...ASPECT_TEXT[k], short: SHORTS[k] };
});
// ---------- how the scribes wrote the signs: omen formulas, the protasis of "If ..." ----------
// (each is only ever read after "if", so in Russian two clauses joined by a single «и» take no comma between them:
// both hang on the one «если»)
const FORMULAS = {
  fire: [
    ['the Seven come down and sit upon the roof of the mountain', 'Семеро спускаются и садятся на кровлю горы'],
    ['the child burns and the water of its skin does not come out', 'дитя горит, а вода его кожи не выступает'],
    ['the brick is warm before the sun has touched it', 'кирпич тёпел прежде, чем его коснулось солнце'],
    ['the lord of the steppe roars where no lord of the steppe has lived', 'владыка степи рычит там, где владыки степи давно нет'],
    ['the red star stands still above the mountain and does not set', 'красная звезда стоит над горой недвижно и не заходит'],
    ['smoke goes up from a field that no fire has touched', 'от поля, которого не касался огонь, поднимается дым'],
    ['the sun comes up red as blood and is dim at noon', 'солнце восходит красным, как кровь, и в полдень тускнеет'],
    ['the water of the well is warm when it is drawn at dawn', 'вода колодца тепла, когда её черпают на рассвете']
  ],
  dust: [
    ['the birds of the night gather and turn their faces to the mountain', 'птицы ночи собираются и обращают лица к горе'],
    ['dust is poured out of a sky that has no cloud', 'с неба, где нет ни облака, сыплется прах'],
    ['those who sleep in the earth walk in the street with dust in their mouths', 'спящие в земле ходят по улице и рты их полны праха'],
    ['every door of the house is found open at the coming of the day', 'с приходом дня все двери дома находят открытыми'],
    [
      'the graves of the old dead are found open, and nothing is taken from them',
      'могилы древних мертвецов находят открытыми и ничего из них не взято'
    ],
    ['at the height of the day no bird is heard in the land', 'в разгар дня во всей земле не слышно ни одной птицы'],
    ['a shadow is seen upon the wall, and no one stands before it', 'на стене видна тень, а перед стеной никого нет'],
    ['the lamp burns in the house, and there is no light from it', 'в доме горит светильник и нет от него света']
  ],
  sea: [
    ['the sweet water turns bitter in its bed', 'сладкая вода становится горькой в своём русле'],
    ['men kill in the reeds a horned one that walks on feet', 'люди убивают в тростнике рогатого, что ходит на ногах'],
    ['the four winds rise together and pull the house four ways', 'четыре ветра встают разом и тянут дом на четыре стороны'],
    [
      'one with a scorpion’s tail and a man’s face comes up out of the earth',
      'из земли выходит тот, у кого хвост скорпиона и лицо человека'
    ],
    ['fish fall out of heaven upon the dry land', 'рыбы падают с неба на сушу'],
    ['the river turns and runs back toward its source', 'река поворачивает и бежит назад, к своему истоку'],
    ['the frogs come up out of the river and fill the houses', 'лягушки выходят из реки и наполняют дома'],
    ['a mist comes up out of the dry earth as out of the sea', 'из сухой земли поднимается туман, как из моря']
  ],
  teeth: [
    ['a dog and a black sow lie down together to suckle at nothing', 'собака и чёрная свинья ложатся рядом и сосут пустоту'],
    ['a woman’s gifts, a comb and a spindle, are left at the door', 'у порога оставлены гребень и веретено, дары для женщины'],
    ['one with a lion’s face comes to the bed of a woman in labour', 'к ложу роженицы приходит гостья с лицом львицы'],
    ['the teeth of an ass gnaw the leather of the horses', 'зубы осла грызут кожу конской сбруи'],
    ['a ewe gives birth, and the lamb has two heads', 'овца рожает и у ягнёнка две головы'],
    ['the she-goat gives blood together with her milk', 'коза даёт кровь вместе с молоком'],
    ['the dogs gather at the door of the woman in childbed and howl', 'псы собираются у дверей роженицы и воют'],
    ['the milk of the nursing women dries up in a single night', 'молоко кормящих жён иссякает за одну ночь']
  ],
  plague: [
    ['the flies come into the house like a cloud and cover it', 'мухи тучей влетают в дом и покрывают его'],
    ['the rats come out of their holes by day and die in the street', 'крысы средь бела дня выходят из нор и умирают на улице'],
    ['the oxen lie down in the field with sores upon their mouths and do not rise', 'волы ложатся в поле с язвами на губах и не встают'],
    ['the grain rots in the storehouse in a single night', 'зерно в житнице сгнивает за одну ночь'],
    ['a cough goes from house to house in the night, and no one is sick', 'ночью кашель ходит из дома в дом, а больных нет'],
    ['the flesh of a beast slaughtered at evening is full of worms by morning', 'мясо скотины, заколотой вечером, к утру полно червей'],
    ['black spots come out upon a man’s hands, and he does not sicken', 'на руках у человека выступают чёрные пятна, а он не заболевает'],
    [
      'a cart that no beast draws goes through the city by night and stops at the doors',
      'повозка, которую не тянет никакая скотина, ночью ездит по городу и останавливается у дверей'
    ]
  ],
  madness: [
    ['all the people of the house see one dream in a single night', 'все домочадцы в одну ночь видят один и тот же сон'],
    ['the writing on the bricks of the house reads backward', 'надписи на кирпичах дома читаются задом наперёд'],
    ['a man looks into the bronze and sees a face that is not his own', 'человек смотрится в бронзовое зеркало и видит чужое лицо'],
    [
      'the sleepers rise in the night and walk about the mountain with open eyes',
      'спящие встают ночью и с открытыми глазами ходят вокруг горы'
    ],
    ['laughter is heard upon the mountain all night, and no one is there', 'всю ночь на горе слышен смех, а там никого нет'],
    ['a man forgets his own name and asks it of his neighbour', 'человек забывает своё имя и спрашивает его у соседа'],
    ['the water-clock stops, and the hour does not pass', 'водяные часы останавливаются и час не проходит'],
    [
      'the footsteps of one man pass the door, and pass it again the same',
      'шаги одного человека проходят мимо двери — и снова проходят, точь-в-точь те же'
    ]
  ]
};
// every sign is told in several ways (texts); text is the first of them; formula: as the scribes wrote it
const SIGN_POOL = [];
Object.keys(ASPECTS).forEach(k =>
  ASPECTS[k].omens.forEach((t, i) =>
    SIGN_POOL.push({ texts: t, text: t[0], short: SHORTS[k][i], aspect: k, formula: FORMULAS[k][i][0], formulaRu: FORMULAS[k][i][1] })
  )
);
const ASP = g => ASPECTS[S.aspectOf[g]];
const patronSign = i => SIGN_POOL[S.signsOf[S.patron][i]];
const theItem = it => 'the ' + ITEMS[it].name.charAt(0).toLowerCase() + ITEMS[it].name.slice(1);
const V = (w, one, many) => (ITEMS[w].plural ? many : one); // the two clay figures are plural
const fmlEn = si => SIGN_POOL[si].formula,
  fmlRu = si => SIGN_POOL[si].formulaRu;
// ---------- old titles: thirty-two, two of them for each power in a season's tablets ----------
// The old titles of the powers, but none of them stays with its own power: the scribes of every age called the
// powers differently, and a season's tablets deal them anew, so knowing the hymns tells you nothing. Each is a real
// one, as the texts give it (whose it was, and where, beside it), though some were never a power's below; the
// Russian ones mix grammatical genders. en; ru: the Russian in six cases; of: the power below whose own name or
// epithet it is, if it is one of the eight. A season leaves out the titles of its own four (dealTitles), so that no
// gloss gives one power's very name to another standing beside it; and since the casebook names the four, leaving
// them out tells nothing.
const TITLES = {
  // Nergal's old name Meslamtaea, ‘he who has come out of Meslam’
  meslam: {
    of: 'nergal',
    en: 'the One Who Came Out of Meslam',
    ru: [
      'Вышедший из Меслама',
      'Вышедшего из Меслама',
      'Вышедшему из Меслама',
      'Вышедшего из Меслама',
      'Вышедшим из Меслама',
      'Вышедшем из Меслама'
    ]
  },
  // Nergal's own name, ‘lord of the great city’: the land of the dead
  greatCity: {
    of: 'nergal',
    en: 'the Lord of the Great City',
    ru: [
      'Владыка Великого Города',
      'Владыки Великого Города',
      'Владыке Великого Города',
      'Владыку Великого Города',
      'Владыкой Великого Города',
      'Владыке Великого Города'
    ]
  },
  // Nergal, in a Sumerian hymn to him (Nergal B)
  enlilSon: {
    of: 'nergal',
    en: 'the Awe-Inspiring Son of Enlil',
    ru: [
      'Грозный Сын Энлиля',
      'Грозного Сына Энлиля',
      'Грозному Сыну Энлиля',
      'Грозного Сына Энлиля',
      'Грозным Сыном Энлиля',
      'Грозном Сыне Энлиля'
    ]
  },
  // Nergal, who judges at sundown
  sunset: {
    of: 'nergal',
    en: 'the King of Sunset',
    ru: ['Царь Заката', 'Царя Заката', 'Царю Заката', 'Царя Заката', 'Царём Заката', 'Царе Заката']
  },
  // Ereshkigal's name, read as ‘lady of the great place’: the land of the dead
  greatPlace: {
    of: 'ereshkigal',
    en: 'the Lady of the Great Place',
    ru: [
      'Владычица Великого Места',
      'Владычицы Великого Места',
      'Владычице Великого Места',
      'Владычицу Великого Места',
      'Владычицей Великого Места',
      'Владычице Великого Места'
    ]
  },
  // Ereshkigal, as Inana calls her at the gate (Inana's Descent)
  elderSister: {
    of: 'ereshkigal',
    en: 'the Elder Sister',
    ru: ['Старшая Сестра', 'Старшей Сестры', 'Старшей Сестре', 'Старшую Сестру', 'Старшей Сестрой', 'Старшей Сестре']
  },
  // Ningišzida (gu-za-lá kur-ra)
  chairBearer: {
    en: 'the Chair-Bearer of the Netherworld',
    ru: [
      'Носитель Престола Подземного Царства',
      'Носителя Престола Подземного Царства',
      'Носителю Престола Подземного Царства',
      'Носителя Престола Подземного Царства',
      'Носителем Престола Подземного Царства',
      'Носителе Престола Подземного Царства'
    ]
  },
  // Neti, who keeps the seven gates (Inana's Descent)
  doorman: {
    en: 'the Chief Doorman of the Underworld',
    ru: [
      'Главный Привратник Преисподней',
      'Главного Привратника Преисподней',
      'Главному Привратнику Преисподней',
      'Главного Привратника Преисподней',
      'Главным Привратником Преисподней',
      'Главном Привратнике Преисподней'
    ]
  },
  // Tiamat (Enūma eliš I)
  glistening: {
    of: 'tiamat',
    en: 'the Glistening One',
    ru: ['Сверкающая', 'Сверкающей', 'Сверкающей', 'Сверкающую', 'Сверкающей', 'Сверкающей']
  },
  // Tiamat, who formed all things, the eleven monsters among them (Enūma eliš I)
  hubur: {
    of: 'tiamat',
    en: 'Mother Hubur',
    ru: ['Матерь Хубур', 'Матери Хубур', 'Матери Хубур', 'Матерь Хубур', 'Матерью Хубур', 'Матери Хубур']
  },
  // Erra, Nergal's other self (and the finale calls Nergal ‘called Erra’)
  carnage: {
    of: 'nergal',
    en: 'the Lord of Plague and Carnage',
    ru: [
      'Господин Мора и Резни',
      'Господина Мора и Резни',
      'Господину Мора и Резни',
      'Господина Мора и Резни',
      'Господином Мора и Резни',
      'Господине Мора и Резни'
    ]
  },
  // Gugalana, Ereshkigal's husband (Inana's Descent)
  bull: {
    en: 'the Great Bull of Heaven',
    ru: [
      'Великий Бык Небес',
      'Великого Быка Небес',
      'Великому Быку Небес',
      'Великого Быка Небес',
      'Великим Быком Небес',
      'Великом Быке Небес'
    ]
  },
  // the fourth of Lamaštu's seven names
  kindles: {
    of: 'lamashtu',
    en: 'She Who Kindles Fire',
    ru: ['Разжигающая Огонь', 'Разжигающей Огонь', 'Разжигающей Огонь', 'Разжигающую Огонь', 'Разжигающей Огонь', 'Разжигающей Огонь']
  },
  // the fifth of Lamaštu's seven names
  face: {
    of: 'lamashtu',
    en: 'the Goddess Whose Face Is Horrible',
    ru: [
      'Богиня Ужасного Лика',
      'Богини Ужасного Лика',
      'Богине Ужасного Лика',
      'Богиню Ужасного Лика',
      'Богиней Ужасного Лика',
      'Богине Ужасного Лика'
    ]
  },
  // the second of Lamaštu's seven names
  streets: {
    of: 'lamashtu',
    en: 'the Sister of the Gods of the Streets',
    ru: ['Сестра Богов Улиц', 'Сестры Богов Улиц', 'Сестре Богов Улиц', 'Сестру Богов Улиц', 'Сестрой Богов Улиц', 'Сестре Богов Улиц']
  },
  // the pāšittu, who takes the baby from its mother's lap (Atra-hasīs III)
  eradicator: {
    en: 'the Eradicator',
    ru: ['Искоренительница', 'Искоренительницы', 'Искоренительнице', 'Искоренительницу', 'Искоренительницей', 'Искоренительнице']
  },
  // Bēlet-ṣēri's own name
  steppe: {
    of: 'beletseri',
    en: 'the Lady of the Steppe',
    ru: ['Владычица Степи', 'Владычицы Степи', 'Владычице Степи', 'Владычицу Степи', 'Владычицей Степи', 'Владычице Степи']
  },
  // the third of Lamaštu's seven names
  sword: {
    of: 'lamashtu',
    en: 'the Sword That Strikes the Head',
    ru: [
      'Разящий Голову Меч',
      'Разящего Голову Меча',
      'Разящему Голову Мечу',
      'Разящий Голову Меч',
      'Разящим Голову Мечом',
      'Разящем Голову Мече'
    ]
  },
  // Nergal, in an Old Babylonian song: the Enlil of the land and of the underworld
  underworldEnlil: {
    of: 'nergal',
    en: 'the Enlil of the Underworld',
    ru: [
      'Энлиль Преисподней',
      'Энлиля Преисподней',
      'Энлилю Преисподней',
      'Энлиля Преисподней',
      'Энлилем Преисподней',
      'Энлиле Преисподней'
    ]
  },
  // ugallu, one of Tiamat's eleven (Enūma eliš I), later a doorkeeper of Nergal's
  storm: { en: 'the Great Storm', ru: ['Великая Буря', 'Великой Бури', 'Великой Буре', 'Великую Бурю', 'Великой Бурей', 'Великой Буре'] },
  // Pazuzu, in his own words on his statuettes
  hanbu: { of: 'pazuzu', en: 'the Son of Hanbu', ru: ['Сын Ханбу', 'Сына Ханбу', 'Сыну Ханбу', 'Сына Ханбу', 'Сыном Ханбу', 'Сыне Ханбу'] },
  // Ḫumbaba: ‘his voice is the Deluge, his speech is fire, his breath is death’ (Gilgameš)
  breath: {
    en: 'the One Whose Breath Is Death',
    ru: ['Дышащий Смертью', 'Дышащего Смертью', 'Дышащему Смертью', 'Дышащего Смертью', 'Дышащим Смертью', 'Дышащем Смертью']
  },
  // rābiṣu, the demon that lies in wait
  lurker: {
    en: 'the Lurker',
    ru: ['Подстерегающий', 'Подстерегающего', 'Подстерегающему', 'Подстерегающего', 'Подстерегающим', 'Подстерегающем']
  },
  // mušḫuššu, one of Tiamat's eleven (Enūma eliš I)
  snake: {
    en: 'the Furious Snake',
    ru: ['Яростный Змей', 'Яростного Змея', 'Яростному Змею', 'Яростного Змея', 'Яростным Змеем', 'Яростном Змее']
  },
  // Ningišzida (gúd-me-lám, in the god list An = Anum)
  splendour: {
    en: 'the Warrior of Splendour',
    ru: ['Воитель Сияния', 'Воителя Сияния', 'Воителю Сияния', 'Воителя Сияния', 'Воителем Сияния', 'Воителе Сияния']
  },
  // Ḫumbaba, whose fate Enlil made it to be (Gilgameš)
  terror: {
    en: 'the Terror of the People',
    ru: ['Ужас Людской', 'Ужаса Людского', 'Ужасу Людскому', 'Ужас Людской', 'Ужасом Людским', 'Ужасе Людском']
  },
  // Mammītum, who decrees destinies with the Anunnaki (Gilgameš X)
  destiny: {
    en: 'the Maker of Destiny',
    ru: [
      'Вершительница Судеб',
      'Вершительницы Судеб',
      'Вершительнице Судеб',
      'Вершительницу Судеб',
      'Вершительницей Судеб',
      'Вершительнице Судеб'
    ]
  },
  // Nergal (lugal-a-ab-ba)
  sea: { of: 'nergal', en: 'the King of the Sea', ru: ['Царь Моря', 'Царя Моря', 'Царю Моря', 'Царя Моря', 'Царём Моря', 'Царе Моря'] },
  // the sixth of Lamaštu's seven names
  irnina: {
    of: 'lamashtu',
    en: 'the Adopted Daughter of Irnina',
    ru: [
      'Приёмная Дочь Ирнины',
      'Приёмной Дочери Ирнины',
      'Приёмной Дочери Ирнины',
      'Приёмную Дочь Ирнины',
      'Приёмной Дочерью Ирнины',
      'Приёмной Дочери Ирнины'
    ]
  },
  // Nergal, in a Sumerian hymn to him (Nergal B)
  hero: {
    of: 'nergal',
    en: 'the Great Hero of the Lands',
    ru: [
      'Великий Герой Земель',
      'Великого Героя Земель',
      'Великому Герою Земель',
      'Великого Героя Земель',
      'Великим Героем Земель',
      'Великом Герое Земель'
    ]
  },
  // Qingu, as Tiamat raises him over her host (Enūma eliš I)
  spouse: {
    of: 'kingu',
    en: 'the Chosen Spouse',
    ru: ['Избранный Супруг', 'Избранного Супруга', 'Избранному Супругу', 'Избранного Супруга', 'Избранным Супругом', 'Избранном Супруге']
  },
  // Lamaštu, on an amulet in the Louvre (AO 8184)
  named: {
    of: 'lamashtu',
    en: 'the One Named by the Gods',
    ru: ['Наречённая Богами', 'Наречённой Богами', 'Наречённой Богами', 'Наречённую Богами', 'Наречённой Богами', 'Наречённой Богами']
  }
};
const TITLE_IDS = Object.keys(TITLES);
const tt = e => TITLES[e];
const ttEn = e => tt(e).en,
  ttRu = (e, k = 'n') => tt(e).ru[CASE[k]];
// a reference to a power, as a line makes it: by name ('g:tiamat') or by a title ('t:water')
const refGod = r => (r[0] === 'g' ? r.slice(2) : S.titleOf[r.slice(2)]);
const refEn = r => (r[0] === 'g' ? GODS[r.slice(2)].name : ttEn(r.slice(2)));
const refRu = (r, k = 'n') => (r[0] === 'g' ? ru.god(r.slice(2), k) : ttRu(r.slice(2), k));
const refTitle = r => (r[0] === 't' ? r.slice(2) : null);
const refOf = g => (chance(PUZ.title) ? 't:' + pick(S.titlesOf[g]) : 'g:' + g);
// ---------- how the scribes knew the charms: by their marks ----------
// Every charm bears marks of its own each season (S.marksOf: two each): one no other charm bears, and a second that now
// and then another charm bears as well. The tablets never name a charm; they know it only by its marks, always the same
// way in a season (S.refOf: its own mark alone, or both), so a line about "what bears seven notches" means nothing
// until you hold a charm and turn it over (the Kit, and the moment you come by it, say what it bears). Each mark: en,
// what the tablets say (vp, after "what") and what you see (see); ru, the same (the tablets' "вещь" + prep + ins).
// not: charms that could not bear it (the cone and the liver are all signs already; silver does not crack so; ochre wants
// grooves).
const CHARM_MARKS = {
  notches: {
    en: { vp: 'bears seven notches', see: 'seven notches cut along one edge' },
    ru: { prep: 'с', ins: 'семью зарубками', see: 'семь зарубок по краю' }
  },
  crack: {
    en: { vp: 'is cracked clean through', see: 'a hair-crack running clean through' },
    ru: { prep: 'с', ins: 'трещиной насквозь', see: 'тонкая трещина насквозь' },
    not: ['crescent']
  },
  cedar: {
    en: { vp: 'smells of cedar', see: 'a faint smell of cedar' },
    ru: { prep: 'с', ins: 'запахом кедра', see: 'слабый запах кедра' }
  },
  smoke: { en: { vp: 'smells of woodsmoke', see: 'a smell of woodsmoke' }, ru: { prep: 'с', ins: 'запахом дыма', see: 'запах дыма' } },
  sea: {
    en: { vp: 'smells of the sea', see: 'a smell of the sea, here, three hundred miles from it' },
    ru: { prep: 'с', ins: 'запахом моря', see: 'запах моря — здесь, за триста миль от него' }
  },
  bitumen: {
    en: { vp: 'is smeared with bitumen', see: 'a smear of old bitumen on one side' },
    ru: { prep: 'с', ins: 'мазком битума', see: 'мазок старого битума с одной стороны' }
  },
  ochre: {
    en: { vp: 'has red ochre in its grooves', see: 'red ochre worked into the grooves' },
    ru: { prep: 'с', ins: 'охрой в бороздках', see: 'красная охра в бороздках' },
    not: ['duck', 'crescent', 'fly']
  },
  gold: {
    en: { vp: 'bears a fleck of gold', see: 'a single fleck of gold leaf' },
    ru: { prep: 'с', ins: 'крупинкой золота', see: 'одна-единственная крупинка сусального золота' }
  },
  star: {
    en: { vp: 'bears a star on its underside', see: 'a star scratched on the underside' },
    ru: { prep: 'со', ins: 'звездой на изнанке', see: 'звезда, процарапанная на изнанке' }
  },
  wedges: {
    en: { vp: 'bears a line of tiny wedges', see: 'a line of wedges too small to read' },
    ru: { prep: 'со', ins: 'строкой мелких клиньев', see: 'строка клиньев, слишком мелких, чтобы прочесть' },
    not: ['cone', 'liver']
  },
  // (in Russian a participle before the noun, not a clause after it: a clause would want a closing comma wherever the
  // riddle runs on, and would swallow a second mark after it)
  chill: {
    en: { vp: 'stays cold at noon', see: 'a chill that does not leave it, even at noon' },
    ru: { prep: 'с', ins: 'не уходящим и в полдень холодом', see: 'холод, который не уходит и в полдень' }
  },
  weight: {
    en: { vp: 'weighs more than it should', see: 'heavier than the look of it' },
    ru: { prep: 'с', ins: 'весом не по размеру', see: 'тяжелее, чем кажется на вид' }
  },
  thread: {
    en: { vp: 'is tied with red thread', see: 'a knot of red thread tied round it' },
    ru: { prep: 'с', ins: 'узлом красной нити', see: 'узелок красной нити' }
  },
  chip: {
    en: { vp: 'is chipped at one edge', see: 'a chip out of one edge' },
    ru: { prep: 'со', ins: 'сколом на краю', see: 'скол на краю' }
  },
  worn: {
    en: { vp: 'is worn smooth on one side', see: 'worn smooth on one side, as if by thumbs' },
    ru: { prep: 'со', ins: 'стёртым до гладкости боком', see: 'один бок стёрт до гладкости, будто пальцами' }
  }
};
const CHARM_MARK_IDS = Object.keys(CHARM_MARKS);
// the tablets' "thing", in six cases (feminine, singular, as every mark-name is)
const VESHCH = ['вещь', 'вещи', 'вещи', 'вещь', 'вещью', 'вещи'];
// how the tablets name a charm this season: { en, ru (six cases) }, a thing, singular and (in Russian) feminine
function riddle(w) {
  const m = ((S.refOf && S.refOf[w]) || []).map(k => CHARM_MARKS[k]);
  if (!m.length) return { en: 'what was found', ru: VESHCH };
  return {
    en: 'what ' + m.map(x => x.en.vp).join(' and '),
    ru: VESHCH.map(v => `${v} ${m[0].ru.prep} ${m.map(x => x.ru.ins).join(' и ')}`)
  };
}
const rdEn = w => riddle(w).en,
  rdRu = (w, k = 'n') => riddle(w).ru[CASE[k]];
// The marks you read on a charm when you first come by it: its own, as a rule; now and then one of them misread (PUZ.misread:
// a worn mark taken for another; the ending tells it). Decided as you come by it (game/state.js, gain), and kept.
function readMarks(w) {
  const m = S.marksOf[w].slice();
  if (chance(PUZ.misread)) {
    const k = pick([0, 1]),
      other = CHARM_MARK_IDS.filter(x => !m.includes(x) && !(CHARM_MARKS[x].not || []).includes(w));
    if (other.length) m[k] = pick(other);
  }
  return m;
}
// what you see when you turn a charm over: its marks as you read them, as [English, Russian]
const marksSee = w => {
  const m = ((S.marksSeen && S.marksSeen[w]) || S.marksOf[w] || []).map(k => CHARM_MARKS[k]);
  return [capS(m.map(x => x.en.see).join('; ')) + '.', capS(m.map(x => x.ru.see).join('; ')) + '.'];
};
// The season's powers: which signs each shows, which charm wards each off and where it lies, and which two of its
// titles the tablets use. Then the tablets themselves.
function dealGods() {
  dealSigns(shuffle(S.gods));
  dealWards();
  dealTitles();
  S.readings = {};
  S.gm = {};
  S.glosses = [];
  buildFacts();
}
// Every two powers share one sign, and one extra pairing shares a second, so each power ends with four signs (G: the
// powers in a shuffled order). The deaths and dreams take the colour of one of the power's own signs.
function dealSigns(G) {
  const pairs = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3]
  ]
    .concat(
      pick([
        [
          [0, 1],
          [2, 3]
        ],
        [
          [0, 2],
          [1, 3]
        ],
        [
          [0, 3],
          [1, 2]
        ]
      ])
    )
    .map(e => [G[e[0]], G[e[1]]]);
  const signs = shuffle(SIGN_POOL.map((s, i) => i)).slice(0, pairs.length);
  S.signPair = {};
  S.signsOf = {};
  S.gods.forEach(g => {
    S.signsOf[g] = [];
  });
  signs.forEach((si, k) => {
    S.signPair[si] = pairs[k];
    pairs[k].forEach(g => S.signsOf[g].push(si));
  });
  S.gods.forEach(g => {
    S.signsOf[g] = shuffle(S.signsOf[g]);
  });
  S.aspectOf = {};
  S.gods.forEach(g => {
    S.aspectOf[g] = SIGN_POOL[S.signsOf[g][0]].aspect;
  });
}
// Six of the twelve charms are in the tell this season: one wards off each power, the other two are decoys. Every
// one lies somewhere to be searched for (one to a place, mostly), and bears marks of its own, by which the tablets know
// it (dealMarks).
function dealWards() {
  const wl = shuffle(CHARMS).slice(0, S.gods.length + 2), // the season's six: four wards, then two that bind nothing
    spots = shuffle(LOC_IDS.filter(l => LOCS[l].search));
  S.charms = CHARMS.filter(w => wl.includes(w)); // (in an order that tells nothing)
  dealMarks();
  S.wardOf = {};
  S.godOfWard = {};
  S.wardAt = {};
  S.decoys = wl.slice(S.gods.length);
  S.gods.forEach((g, i) => {
    S.wardOf[g] = wl[i];
    S.godOfWard[wl[i]] = g;
  });
  wl.forEach((w, i) => {
    S.wardAt[w] = spots[i];
  });
  // one to a place, as a rule; now and then two share one, and another place holds none (PUZ.share)
  if (chance(PUZ.share)) {
    const [a, b] = shuffle(wl);
    S.wardAt[a] = S.wardAt[b];
  }
}
// Each charm's marks this season, and the way the tablets know it: its own mark (borne by no other charm), and a second,
// which two of the charms share now and then (PUZ.markShared: how many marks are shared so); the tablets name a charm
// by its own mark alone, or by both (PUZ.markBoth).
function dealMarks() {
  // the first free mark that each of ws can bear (CHARM_MARKS: not), taken. With the tables as they stand there is
  // always one (fifteen marks, ten of them used, few forbidden); a table changed so that there is not must fail
  // loudly, not give a charm a mark it cannot bear
  const free = shuffle(CHARM_MARK_IDS),
    take = (...ws) => {
      const i = free.findIndex(m => ws.every(w => !(CHARM_MARKS[m].not || []).includes(w)));
      if (i < 0) throw new Error(`dealMarks: no mark left that ${ws.join(' and ')} can bear`);
      return free.splice(i, 1)[0];
    };
  S.marksOf = {};
  S.refOf = {};
  S.charms.forEach(w => {
    S.marksOf[w] = [take(w)];
  });
  const order = shuffle(S.charms);
  for (let k = 0; k < PUZ.markShared; k++) {
    const pair = order.splice(0, 2),
      m = take(...pair);
    pair.forEach(w => S.marksOf[w].push(m));
  }
  order.forEach(w => S.marksOf[w].push(take(w)));
  S.charms.forEach(w => {
    S.refOf[w] = chance(PUZ.markBoth) ? shuffle(S.marksOf[w]).slice() : [S.marksOf[w][0]];
  });
}
// The two titles each power goes by in this season's tablets, dealt from the thirty-two but for those of the season's
// own four (TITLES: of). At most eighteen are left out (Nergal's eight, Lamaštu's six, Tiamat's and Ereshkigal's two
// each), so fourteen at least are left for the eight a season needs.
function dealTitles() {
  const all = shuffle(TITLE_IDS.filter(e => !S.gods.includes(TITLES[e].of)));
  S.titlesOf = {};
  S.titleOf = {};
  S.gods.forEach((g, i) => {
    S.titlesOf[g] = all.slice(2 * i, 2 * i + 2);
    S.titlesOf[g].forEach(e => {
      S.titleOf[e] = g;
    });
  });
}
// Every fact is true, but for a scribe's error now and then (scribeErr). Sign lines hold references in `in`/`out`;
// glosses tie titles together ('gname': a title is a power; 'geq': two titles are one power; 'gneq': they are two);
// charm lines tie a charm to a sign, a power, a pair of powers, or to another charm. form: how the line is put (LINE,
// below); gods: whom it concerns (godsOf).
// Each line is written in both languages at once; the same random choice picks the wording in each. The tablets hold
// every line the fragments can give, shuffled; they are written in this order, the order the dice are thrown in.
function buildFacts() {
  const F = [];
  tabletSigns(F);
  tabletGlosses(F);
  tabletWards(F);
  tabletPair(F);
  tabletDecoys(F);
  S.facts = shuffle(F).map(f => (chance(PUZ.scribe) ? scribeErr(f) : f));
  S.factKnown = [];
}
// a line, in its words: each of its forms, from what it says (the same die picks the wording in both languages)
const LINE = {
  // under a sign: the two who wake (signIn2), the two who do not (signOut2), one who wakes (signIn1), one who does not
  // (signOut1). Said of the sign alone, never as "has never stirred": a reader who took that for always would rule out
  // the power below, which these lines name for other powers' signs as often as not.
  signIn2: ({ sign: si, in: [r1, r2] }) =>
    oneOf(
      [`If ${fmlEn(si)}: ${refEn(r1)} or ${refEn(r2)} is waking.`, `Если ${fmlRu(si)}, то пробуждается ${refRu(r1)} или ${refRu(r2)}.`],
      [
        `If ${fmlEn(si)}, the house of ${refEn(r1)} or the house of ${refEn(r2)} stands open.`,
        `Если ${fmlRu(si)}, то отворён дом ${refRu(r1, 'g')} или дом ${refRu(r2, 'g')}.`
      ]
    ),
  signOut2: ({ sign: si, out: [r1, r2] }) =>
    oneOf(
      [
        `If ${fmlEn(si)}: neither ${refEn(r1)} nor ${refEn(r2)} is waking.`,
        `Если ${fmlRu(si)}, то ни ${refRu(r1)}, ни ${refRu(r2)} не пробуждаются.`
      ],
      [
        `If ${fmlEn(si)}, it is not ${refEn(r1)} who wakes, and it is not ${refEn(r2)}.`,
        `Если ${fmlRu(si)}, то пробуждается не ${refRu(r1)} и не ${refRu(r2)}.`
      ]
    ),
  signIn1: ({ sign: si, in: [r] }) =>
    oneOf(
      [
        `If ${fmlEn(si)}: ${refEn(r)} is one of the two who wake.`,
        `Если ${fmlRu(si)}, то ${refRu(r)} — одна из двух сил, что пробуждаются.`
      ],
      [`If ${fmlEn(si)}, ${refEn(r)} is among the two who stir.`, `Если ${fmlRu(si)}, то среди двух пробудившихся сил есть и ${refRu(r)}.`]
    ),
  signOut1: ({ sign: si, out: [r] }) =>
    oneOf(
      [`If ${fmlEn(si)}: ${refEn(r)} is not among those who wake.`, `Если ${fmlRu(si)}, то ${refRu(r)} не пробуждается.`],
      [`If ${fmlEn(si)}, whatever wakes, it is not ${refEn(r)}.`, `Если ${fmlRu(si)}, то что бы ни пробудилось — это не ${refRu(r)}.`]
    ),
  // (no quotation marks of its own, in either language: a line is quoted whole, in the casebook and by the scholars
  // who share one, and marks inside it would nest a third deep, or the same kind twice)
  gname: ({ e, g }) =>
    oneOf(
      [`${capS(ttEn(e))} is one of the names of ${GODS[g].name}.`, `${capS(ttRu(e))} — одно из имён ${ru.god(g, 'g')}.`],
      [`${capS(ttEn(e))}: so the old hymns call ${GODS[g].name}.`, `${capS(ttRu(e))} — так древние гимны называют ${ru.god(g, 'a')}.`]
    ),
  geq: ({ e1, e2 }) =>
    oneOf(
      [
        `${capS(ttEn(e1))} and ${ttEn(e2)} are one power under two titles.`,
        `${capS(ttRu(e1))} и ${ttRu(e2)} — одна сила под двумя титулами.`
      ],
      [`Whoever calls on ${ttEn(e1)} calls also on ${ttEn(e2)}.`, `Кто взывает к ${ttRu(e1, 'd')}, взывает и к ${ttRu(e2, 'd')}.`]
    ),
  gneq: ({ e1, e2 }) =>
    oneOf(
      [`${capS(ttEn(e1))} is not ${ttEn(e2)}.`, `${capS(ttRu(e1))} — не ${ttRu(e2)}.`],
      [
        `Do not mistake ${ttEn(e1)} for ${ttEn(e2)}: they are two, and they hate each other.`,
        `Не путай ${ttRu(e1, 'a')} с ${ttRu(e2, 'i')}: это две силы, и они ненавидят друг друга.`
      ]
    ),
  ward: ({ ward: w, sign: si }) =>
    oneOf(
      [
        `${capS(rdEn(w))} binds one of the two who wake if ${fmlEn(si)}.`,
        `${capS(rdRu(w))} связывает одну из двух сил, что пробуждаются, если ${fmlRu(si)}.`
      ],
      [
        `If ${fmlEn(si)}, one of the two who stir fears ${rdEn(w)}.`,
        `Если ${fmlRu(si)}, то одна из двух пробудившихся сил боится ${rdRu(w, 'g')}.`
      ]
    ),
  wardor: ({ ward: w, refs: pr }) =>
    bi(
      `${capS(rdEn(w))} was made against ${refEn(pr[0])}, or else against ${refEn(pr[1])}.`,
      `${capS(rdRu(w))} сделана против ${refRu(pr[0], 'g')} — или же против ${refRu(pr[1], 'g')}.`
    ),
  wref: ({ ward: w, ref: rf }) =>
    oneOf(
      [`${capS(rdEn(w))} was made against ${refEn(rf)}.`, `${capS(rdRu(w))} сделана против ${refRu(rf, 'g')}.`],
      [`${capS(refEn(rf))} cannot pass ${rdEn(w)}.`, `${capS(refRu(rf))} не может миновать ${rdRu(w, 'a')}.`]
    ),
  notward: ({ ward: w, ref: rx }) =>
    oneOf(
      [`${capS(refEn(rx))} laughs at ${rdEn(w)}.`, `${capS(refRu(rx))} смеётся над ${rdRu(w, 'i')}.`],
      [`${capS(rdEn(w))} has no hold over ${refEn(rx)}.`, `${capS(rdRu(w))} не имеет власти над ${refRu(rx, 'i')}.`]
    ),
  // (the two riddles last: each may hold an "and" of its own, and set first they ran together)
  wpair: ({ wards: pr, ref: rf }) =>
    bi(
      `Of two things, one binds nothing at all, and the other binds ${refEn(rf)}: ${rdEn(pr[0])}, and ${rdEn(pr[1])}.`,
      `Из двух вещей одна не связывает никого, а другая связывает ${refRu(rf, 'a')}: ${rdRu(pr[0])} — и ${rdRu(pr[1])}.`
    ),
  // (why it binds nothing, in words that suit whatever the thing turns out to be: a seal, a foundation cone, a liver
  // model, two figures)
  decoy: ({ ward: w }) => {
    const [en, rus] = pick([
      ['No name was ever written into it, and nothing answers to it.', 'В неё не вписано ничьё имя, и ничто ей не отзывается.'],
      [
        'It was made for some other use, and no power has any part in it.',
        'Её делали для иной надобности, и никакой силе до неё нет дела.'
      ],
      ['Whoever made it meant it for luck, not for binding.', 'Мастер делал это на удачу, а не для того, чтобы кого-то связать.']
    ]);
    return bi(`${capS(rdEn(w))} binds no power at all. ${en}`, `${capS(rdRu(w))} не связывает никакой силы. ${rus}`);
  }
};
// Whom a line concerns (the tablets lean toward what you look for; what is said of the power below is a line about it;
// the counter-rite counts the lines about the power you named): under a sign, the two the sign wakes, whichever the
// line names; a gloss, the powers of its titles; any other charm line, the powers it names. Worked out from what the
// line says, so that a scribe's error is weighed by the same rule as a true line.
const godsOf = f =>
  f.kind === 'sign' || f.kind === 'ward'
    ? S.signPair[f.sign].slice()
    : f.kind === 'gname'
      ? [f.g]
      : f.kind === 'geq' || f.kind === 'gneq'
        ? [...new Set([S.titleOf[f.e1], S.titleOf[f.e2]])]
        : f.kind === 'wardor'
          ? f.refs.map(refGod)
          : f.kind === 'decoy'
            ? []
            : [refGod(f.ref)]; // wref, notward, wpair
// a line as the tablets hold it: what it says, whom it concerns, and its words
const inscribe = f => Object.assign(f, { gods: godsOf(f), text: LINE[f.form](f) });
// Under each omen two powers wake. Each sign gets one line naming both who wake (or two who do not), or two lines
// naming one each.
function tabletSigns(F) {
  Object.keys(S.signPair).forEach(k => {
    const si = +k,
      pr = shuffle(S.signPair[si]),
      [a, b] = pr,
      [o1, o2] = shuffle(S.gods.filter(g => !pr.includes(g)));
    const add = (form, inn, out) => F.push(inscribe({ kind: 'sign', form, sign: si, in: inn, out }));
    if (!chance(PUZ.half)) {
      if (chance(PUZ.signIn)) add('signIn2', [refOf(a), refOf(b)], []);
      else add('signOut2', [], [refOf(o1), refOf(o2)]);
    } else if (chance(PUZ.halfIn)) [a, b].forEach(g => add('signIn1', [refOf(g)], []));
    else [o1, o2].forEach(g => add('signOut1', [], [refOf(g)]));
  });
}
// Glosses: every title is tied to its power, directly or through its twin title; and a couple of titles are said to
// belong to different powers.
function tabletGlosses(F) {
  const gname = (e, g) => F.push(inscribe({ kind: 'gname', form: 'gname', e, g })),
    geq = (e1, e2) => F.push(inscribe({ kind: 'geq', form: 'geq', e1, e2 })),
    gneq = (e1, e2) => F.push(inscribe({ kind: 'gneq', form: 'gneq', e1, e2 }));
  S.gods.forEach(g => {
    const [e1, e2] = shuffle(S.titlesOf[g]);
    if (chance(PUZ.nameBoth)) {
      gname(e1, g);
      gname(e2, g);
    } else {
      geq(e1, e2);
      gname(pick([e1, e2]), g);
    }
  });
  {
    const all = shuffle(Object.keys(S.titleOf));
    let n = 0;
    for (let i = 0; i < all.length && n < PUZ.apartMax; i++)
      for (let j = i + 1; j < all.length && n < PUZ.apartMax; j++)
        if (S.titleOf[all[i]] !== S.titleOf[all[j]] && chance(PUZ.apart)) {
          gneq(all[i], all[j]);
          n++;
        }
  }
}
// The charms: each true ward is tied to one of its power's signs, and then to a second sign, to a pair of powers or to
// its power (by name or by a title); and every ward is said to have no hold over some other power (as every toy is
// too: tabletDecoys).
function tabletWards(F) {
  const WS = (w, si) => F.push(inscribe({ kind: 'ward', form: 'ward', ward: w, sign: si }));
  S.gods.forEach(g => {
    const w = S.wardOf[g],
      mine = S.signsOf[g],
      partner = si => S.signPair[si].find(x => x !== g);
    const s1 = pick(mine);
    WS(w, s1);
    const r = rand();
    if (r < PUZ.wardLine[0]) WS(w, pick(mine.filter(si => partner(si) !== partner(s1))));
    else if (r < PUZ.wardLine[1]) {
      const pr = shuffle([g, pick(S.gods.filter(y => y !== g && y !== partner(s1)))]).map(refOf);
      F.push(inscribe({ kind: 'wardor', form: 'wardor', ward: w, refs: pr }));
    } else {
      const rf = refOf(g);
      F.push(inscribe({ kind: 'wref', form: 'wref', ward: w, ref: rf }));
    }
    const gx = pick(S.gods.filter(x => x !== g)),
      rx = refOf(gx);
    F.push(inscribe({ kind: 'notward', form: 'notward', ward: w, ref: rx }));
  });
}
// Sometimes a line binds two charms together: one of them is a toy.
function tabletPair(F) {
  if (chance(PUZ.wardPair)) {
    const g = pick(S.gods),
      pr = shuffle([S.wardOf[g], pick(S.decoys)]),
      rf = refOf(g);
    F.push(inscribe({ kind: 'wpair', form: 'wpair', wards: pr, ref: rf }));
  }
}
// The toys bind no power at all; and each, like every ward, is said to have no hold over some power (true of a toy,
// which holds none), so that a line of that kind tells a ward from a toy no better than any other line does.
function tabletDecoys(F) {
  S.decoys.forEach(w => {
    F.push(inscribe({ kind: 'decoy', form: 'decoy', ward: w }));
    F.push(inscribe({ kind: 'notward', form: 'notward', ward: w, ref: refOf(pick(S.gods)) }));
  });
}
// A scribe's error: the line as it should have been written, gone wrong in one thing, so that it is false. Never told;
// the ending tells it (scribe: what it should have said, in its words).
function scribeErr(f) {
  const other = (g, but = []) => pick(S.gods.filter(x => x !== g && !but.includes(x))),
    wake = f.sign != null ? S.signPair[f.sign] : null,
    asleep = wake ? S.gods.filter(g => !wake.includes(g)) : null,
    gw = f.ward ? S.godOfWard[f.ward] : null,
    e = { ...f, in: f.in && f.in.slice(), out: f.out && f.out.slice(), refs: f.refs && f.refs.slice() };
  if (f.form === 'signIn2' || f.form === 'signIn1') e.in[pick([...e.in.keys()])] = refOf(pick(asleep));
  else if (f.form === 'signOut2' || f.form === 'signOut1') e.out[pick([...e.out.keys()])] = refOf(pick(wake));
  else if (f.form === 'gname') e.g = other(f.g);
  else if (f.form === 'geq') e.e2 = pick(S.titlesOf[other(S.titleOf[f.e1])]);
  else if (f.form === 'gneq') e.e2 = S.titlesOf[S.titleOf[f.e1]].find(x => x !== f.e1);
  else if (f.form === 'ward')
    e.sign = pick(
      Object.keys(S.signPair)
        .map(Number)
        .filter(si => !S.signPair[si].includes(gw))
    );
  else if (f.form === 'wardor') e.refs = f.refs.map(r => (refGod(r) === gw ? refOf(other(gw, f.refs.map(refGod))) : r));
  else if (f.form === 'wref') e.ref = refOf(other(gw));
  // a ward said to have no hold over its own power; a toy's line (it holds none, so naming another power could never
  // make it false) puts the named power's own ward in the toy's place
  else if (f.form === 'notward') {
    if (gw) e.ref = refOf(gw);
    else e.ward = S.wardOf[refGod(f.ref)];
  } else if (f.form === 'wpair') e.ref = refOf(other(refGod(f.ref)));
  else if (f.form === 'decoy') e.ward = pick(S.gods.map(g => S.wardOf[g]));
  return inscribe(Object.assign(e, { scribe: f.text }));
}
// ---------- what a line mentions ----------
const factRefs = f => (f.in || []).concat(f.out || [], f.refs || [], f.ref ? [f.ref] : []);
const factTitles = f => factRefs(f).map(refTitle).filter(Boolean).concat([f.e, f.e1, f.e2].filter(Boolean));
// The titles you have met: in lines you have read, in glosses and in readings.
function titlesMet() {
  const out = new Set();
  S.factKnown.forEach(i => factTitles(S.facts[i]).forEach(e => out.add(e)));
  (S.glosses || []).forEach(gl => out.add(gl.e));
  Object.values(S.readings || {}).forEach(r =>
    (r.refs || [])
      .map(refTitle)
      .filter(Boolean)
      .forEach(e => out.add(e))
  );
  return TITLE_IDS.filter(e => out.has(e));
}
// A tablet line you have not read. Translation goes better when you know what to look for: lines about the signs
// you have seen, the charms you carry and the titles you have met come up more often. A line said to be about the power
// below (a cultist's last shout, what waits between the gates: g, the power below) is one that ties it to another power
// too, so that it narrows the answer without giving it, all but always (PUZ.patronLine: now and then any line at all);
// when none such is left, there is none to tell.
const factWards = f => (f.ward ? [f.ward] : []).concat(f.wards || []);
const factsOn = t => S.facts.map((f, i) => i).filter(i => !S.factKnown.includes(i) && speaksOf(S.facts[i], t));
// whether a line speaks of t (a sign, a title or a ward)
const speaksOf = (f, t) => (t.sign != null ? f.sign === t.sign : t.title ? factTitles(f).includes(t.title) : factWards(f).includes(t.ward));
// Learning a line makes the sound of it. Asked as learnFact({ about, topic, hush }), or as before, learnFact(about,
// topic, hush): about, the power a line is wanted about (the power below: one that narrows it, readLine); topic, what
// you chose to look for in the clay; hush, a cultist sharing a line (people/dialog.js), who keeps back every line about
// the ward of the power below, the one thing that can stop the rite (aboutWard). The rest it shares as anyone would:
// had it kept back every line about its master, any scholar who quoted a line about a sign you had seen, which is the
// power's own all but always, would have been as good as cleared.
function learnFact(about, topic, hush = false) {
  const o = about && typeof about === 'object' ? about : { about, topic, hush },
    i = readLine(o.about, o.topic, !!o.hush);
  if (i != null) emit('lore');
  return i;
}
const aboutWard = f => factWards(f).includes(S.wardOf[S.patron]);
const aboutPatron = f => f.gods.includes(S.patron) || aboutWard(f);
const hintsPatron = f => aboutPatron(f) && f.gods.length >= 2;
function readLine(g, topic, hush = false) {
  if (topic) {
    const on = factsOn(topic);
    if (on.length) {
      const i = pick(on);
      S.factKnown.push(i);
      return i;
    }
  }
  const unknown = S.facts.map((f, i) => i).filter(i => !S.factKnown.includes(i) && !(hush && aboutWard(S.facts[i])));
  if (!unknown.length) return null;
  const seen = S.omenLog.map(o => o.si),
    met = titlesMet(),
    toPatron = g === S.patron && chance(PUZ.patronLine); // (asked for the power below: a line about it, all but always)
  const rel = toPatron
    ? unknown.filter(i => hintsPatron(S.facts[i]))
    : unknown.filter(i => {
        const f = S.facts[i];
        return (f.sign != null && seen.includes(f.sign)) || factWards(f).some(has) || factTitles(f).some(e => met.includes(e));
      });
  if (toPatron && !rel.length) return null;
  const i = (toPatron || chance(PUZ.rel)) && rel.length ? pick(rel) : pick(unknown);
  S.factKnown.push(i);
  return i;
}
const factP = i => `<p class="lore"><span class="dingir" aria-hidden="true">𒀭</span> ${bi('“', '«')}${S.facts[i].text}${bi('”', '»')}</p>`;
const factsAbout = g => S.factKnown.filter(i => S.facts[i].gods.includes(g)).length;
// ---------- people who know the old titles: Anselm, Ilse and Zahrun. A cultist names the wrong power. ----------
const GLOSSERS = ['anselm', 'ilse', 'zahrun'];
const titlesToAsk = c => titlesMet().filter(e => !S.glosses.some(gl => gl.by === c.id && gl.e === e));
// A cultist lies about the power below, all but always (a slip: readings.cultSlip). About the other powers the lie would
// protect nothing, so many tell the truth: the honest nearly always, the calculating to be believed later, the liar
// hardly ever. A light-headed scholar may simply misremember.
function glossBy(c, e) {
  const truth = S.titleOf[e],
    other = () => pick(S.gods.filter(x => x !== truth));
  let g = truth;
  if (c.role === 'cult') {
    if (truth === S.patron ? !chance(RULES.readings.cultSlip) : !chance(TP(c).truth)) g = other();
    else S.log.cultTruth++;
  } else if (chance(RULES.readings.mistakeGloss * TP(c).mistake)) g = other();
  const gl = { by: c.id, e, g, day: S.day };
  S.glosses.push(gl);
  return gl;
}
const glossNote = gl =>
  bi(
    `${gl.by === 'you' ? 'You know' : C(gl.by).short + ' says'}: “${ttEn(gl.e)}” is ${GODS[gl.g].name}.`,
    `${gl.by === 'you' ? 'Вы знаете' : ru.c(gl.by) + ' говорит'}: «${capS(ttRu(gl.e))}» — это ${ru.god(gl.g)}.`
  );
// Anselm and Ilse can read a charm. An honest reading gives two powers, one of them right, or says it binds nothing.
// A cultist reads it falsely, and hides the ward that matters most. Readings, too, name the powers by their titles.
function scholarRead(c, w) {
  const key = c.id + ':' + w;
  if (!S.readings[key]) {
    const g = S.godOfWard[w],
      honest = () => (g ? { gods: shuffle([g, pick(S.gods.filter(x => x !== g))]) } : { none: true }),
      wrong = () => ({ gods: shuffle(S.gods.filter(x => x !== g)).slice(0, 2) });
    let r;
    // an honest reading, unless a slip of memory; the cult reads the ward that matters falsely (but for a slip), and the
    // rest as it likes
    // (a mistaken reading, or a lie about a ward that is not the one that matters, may as well say it binds nothing)
    const RD = RULES.readings;
    if (c.role !== 'cult') r = chance(RD.mistakeReading * TP(c).mistake) ? (chance(RD.mistakeNone) ? { none: true } : wrong()) : honest();
    else if (g === S.patron ? chance(RD.cultSlip) : chance(TP(c).truth)) {
      S.log.cultTruth++;
      r = honest();
    } else if (g === S.patron ? chance(RD.hideWard) : chance(RD.cultNone)) r = { none: true };
    else r = wrong();
    if (r.gods) r.refs = r.gods.map(refOf);
    S.readings[key] = { by: c.id, w, day: S.day, ...r };
  }
  return S.readings[key];
}
// what a scholar says of a charm read (r: the reading); of one that binds nothing, in words that suit whatever the thing
// is, a seal or a foundation cone, a liver model or two clay figures
function readingSay(r) {
  if (r.none)
    return oneOf(
      [
        `There is no binding here. Whatever ${V(r.w, 'it was', 'they were')} made for, it was not for that.`,
        'Никакого заклятия здесь нет. Для чего бы это ни делали — только не для этого.'
      ],
      [
        `No binding at all. ${V(r.w, 'It is', 'They are')} just what ${V(r.w, 'it seems', 'they seem')}, nothing more.`,
        'Заклятия нет. Это ровно то, чем кажется, и не более.'
      ]
    );
  const [a, b] = r.refs;
  return oneOf(
    [
      `There is a binding here. The title is damaged, see: against ${refEn(a)}, or against ${refEn(b)}. I cannot say which.`,
      `Здесь наложено заклятие. Титул повреждён, видите? Против ${refRu(a, 'g')} — или против ${refRu(b, 'g')}. Не могу сказать, против кого именно.`
    ],
    [
      `A binding, yes. Against ${refEn(a)}, or against ${refEn(b)}. The sign is half gone.`,
      `Да, заклятие. Против ${refRu(a, 'g')} — или против ${refRu(b, 'g')}. Знак наполовину стёрт.`
    ]
  );
}
const readingNote = r =>
  bi(
    `${C(r.by).short}: ${theItem(r.w)} ${r.none ? V(r.w, 'binds', 'bind') + ' nothing' : `${V(r.w, 'binds', 'bind')} ${refEn(r.refs[0])} or ${refEn(r.refs[1])}`}.`,
    `${ru.c(r.by)}: ${ru.item(r.w)} ${r.none ? `не ${ru.ig(r.w, 'связывает', 'связывает', 'связывает', 'связывают')} никого` : `${ru.ig(r.w, 'связывает', 'связывает', 'связывает', 'связывают')} ${refRu(r.refs[0], 'a')} или ${refRu(r.refs[1], 'a')}`}.`
  );
