// ===================== THE DEAD: the words for how the night's victims are found =====================
// world/deaths.js puts them together: who finds the body and when (DEATH_FOUND), at the place of the attack, and in
// what state: the power's own touch (DEATH_BODY, by the power's aspect), or the cult's own hand (DEATH_HAND, or a way
// only one place allows, DEATH_HAND_AT) with the power's mark on the body all the same (DEATH_MARK); now and then the
// cult's signature besides (DEATH_SIGN). Lines are [English, Russian]; a state reads on from "found in Trench B, ...",
// in Russian from "находят в траншее Б: ...".

// ---------- who finds them, and when: (the dead, where, someone else of the camp or null) → [en, ru] ----------
const DEATH_FOUND = [
  (v, at) => [`At first light ${v.name} is found ${at}`, `На рассвете ${ru.cf(v, 'a')} находят ${at}`],
  (v, at) => [`The waterboy finds ${v.name} ${at} at first light`, `На рассвете мальчик-водонос находит ${ru.cf(v, 'a')} ${at}`],
  (v, at, f) =>
    f && [`${f.short} finds ${v.name} ${at} just after dawn`, `Вскоре после рассвета ${ru.c(f)} находит ${ru.cf(v, 'a')} ${at}`],
  (v, at) => [
    `The pickmen going up for the morning shift find ${v.name} ${at}`,
    `Землекопы, идущие на утреннюю смену, находят ${ru.cf(v, 'a')} ${at}`
  ],
  (v, at) => [
    `${v.name} does not come to breakfast. They find ${EP.him(v)} ${at}`,
    `${capS(ru.cf(v))} не приходит к завтраку. ${ru.gs(v, 'Его', 'Её')} находят ${at}`
  ],
  (v, at) => [
    `At dawn the camp’s dogs will not stop howling. They have found ${v.name} ${at}`,
    `На рассвете лагерные собаки воют не переставая. Это они нашли ${ru.cf(v, 'a')} ${at}`
  ],
  (v, at, f) =>
    f && [
      `${f.short} goes looking for ${v.short} at breakfast, and finds ${EP.him(v)} ${at}`,
      `За завтраком ${ru.c(f)} идёт искать ${ru.c(v, 'a')} — и находит ${ru.gs(v, 'его', 'её')} ${at}`
    ]
];

// ---------- the power's own touch, by aspect ----------
const DEATH_BODY = {
  fire: [
    ['skin hot as kiln brick, though the night was cold', 'кожа горячая, как кирпич из печи, хотя ночь была холодной'],
    ['curled like a sleeper in a ring of scorched earth', 'тело свернулось, как у спящего, посреди круга выжженной земли'],
    ['burned hollow from within, though the clothes are not even singed', 'тело выгорело изнутри, а одежда даже не опалена'],
    [
      'face turned up, the eyes boiled white, as if something very bright had passed close overhead',
      'лицо обращено к небу, глаза сварились добела, будто совсем низко пронеслось что-то ослепительно яркое'
    ],
    [
      'black as a burnt brick from the waist down, and the dust around not even warm',
      'от пояса вниз тело чёрное, как обожжённый кирпич, а пыль вокруг даже не тёплая'
    ],
    [
      'the eyes open, and in each of them a point of flame still burning, that goes out as the sun comes up',
      'глаза открыты, и в каждом ещё теплится огонёк — и гаснет, когда встаёт солнце'
    ],
    [
      'flushed red as with a fever, and the sweat on the brow dried to a white crust',
      'лицо красное, как в горячке, а пот на лбу высох белой коркой'
    ],
    ['every hair burned away to the scalp, and the face beneath untouched', 'все волосы сгорели дотла, а лицо под ними не тронуто'],
    [
      'laid out on the bare brick as on a griddle, and the brick still too hot to touch',
      'тело лежит на голом кирпиче, как на сковороде, и кирпич до сих пор не тронуть рукой'
    ],
    ['with seven blisters across the chest, set out like the Pleiades', 'на груди семь волдырей, расположенных, как Плеяды'],
    [
      'the hands black to the wrists, as if held in a fire, and the fingers still closed on nothing',
      'кисти рук черны до запястий, будто их держали в огне, и пальцы всё ещё сжимают пустоту'
    ],
    [
      'the lips and tongue scorched black, as if from a mouthful of live coals',
      'губы и язык обожжены дочерна, будто во рту были раскалённые угли'
    ]
  ],
  dust: [
    ['eyes open, mouth packed with grey dust', 'глаза открыты, рот забит серой пылью'],
    [
      'laid out straight as for a burial, hands folded, a film of grey dust over the open eyes',
      'тело вытянуто, как для погребения, руки сложены, открытые глаза подёрнуты серой пылью'
    ],
    [
      'half buried in fine grey dust that no wind could have heaped there',
      'тело наполовину засыпано тонкой серой пылью — такой холм не намёл бы никакой ветер'
    ],
    [
      'cold as grave clay, with grey earth under every fingernail, as if they had dug their way somewhere in the night',
      'тело холодное, как могильная глина, и под каждым ногтем серая земля, будто ночью кто-то прокапывал себе куда-то путь'
    ],
    [
      'dried out like a body from an old tomb, light as straw, though supper was only a few hours ago',
      'тело высохло, как мумия из древней гробницы, и лёгкое, как солома, — а ведь ужин был всего несколько часов назад'
    ],
    [
      'sitting upright against a wall in the posture of the dead on the old seals, a clay cup in one hand',
      'тело сидит, прислонившись к стене, в позе мертвецов на древних печатях, с глиняной чашей в руке'
    ],
    [
      'the face grey and dry as unfired clay, and cracked across like a tablet left in the sun',
      'лицо серое и сухое, как необожжённая глина, и растрескалось, как табличка, забытая на солнце'
    ],
    [
      'with three owls on the ground beside, watching, and they do not fly off when the men come',
      'рядом на земле сидят три совы, смотрят и не улетают, когда подходят люди'
    ],
    [
      'the mouth stopped with grey earth, and the hands folded over a clay cup full of the same dust',
      'рот забит серой землёй, а руки сложены на глиняной чаше, полной той же пыли'
    ],
    [
      'the eyes gone white as a blind man’s, with grey dust lying in them that will not blow away',
      'глаза побелели, как у слепого, и в них лежит серая пыль, которую никак не сдуть'
    ],
    [
      'stripped of every ornament, ring, watch, the very buttons, as the dead are stripped at the seven gates',
      'на теле не осталось ничего — ни кольца, ни часов, ни даже пуговиц: так обирают мёртвых у семи врат'
    ],
    [
      'curled up like a child in a burial jar, though there is no jar',
      'тело свернулось, как ребёнок в погребальном кувшине, хотя никакого кувшина нет'
    ]
  ],
  sea: [
    ['drowned, the lungs full of seawater, three hundred miles from the sea', 'в лёгких морская вода, а до моря триста миль'],
    [
      'soaked to the skin and crusted with salt, though the ground all around is bone dry',
      'одежда промокла насквозь и покрыта коркой соли, хотя земля вокруг суха, как кость'
    ],
    [
      'drowned, with weed from no river in Iraq wound about the throat',
      'в лёгких вода, а горло обмотано водорослями, каких нет ни в одной реке Ирака'
    ],
    [
      'face down in a hollow of the earth no bigger than a washbasin, and the hollow full of brine',
      'лицом вниз, в ямке размером с умывальный таз, и ямка полна рассола'
    ],
    ['fish scales in the hair, and a live crab under the tongue', 'в волосах рыбья чешуя, а под языком — живой краб'],
    [
      'the skin wrinkled white as if after days in water, and the boots full of sand from no river',
      'кожа сморщенная и белая, будто после многих дней в воде, а в ботинках песок, какого нет ни в одной реке'
    ],
    [
      'cold and glistening as a fish on a slab, and smelling of the open sea',
      'тело холодное и блестит, как рыба на прилавке, и пахнет открытым морем'
    ],
    ['the mouth and nose full of black sand, and the sand still wet', 'рот и нос забиты чёрным песком, и песок всё ещё мокрый'],
    [
      'at the end of a wet track that starts from nowhere, as if something had crawled up out of the dry ground and gone back into it',
      'к телу тянется мокрый след — ниоткуда, будто что-то выползло из сухой земли и ушло обратно'
    ],
    [
      'stung all over in rings, like a jellyfish’s welts, the skin bleached white by salt',
      'всё тело в ожогах, кольцами, как от медузы, а кожа выбелена солью'
    ],
    [
      'bound round and round with a rope of kelp so tight it has cut into the skin',
      'тело обвито жгутом бурых водорослей так туго, что он врезался в кожу'
    ],
    [
      'with the marks of a scorpion’s sting on the throat, each as wide as a thumb',
      'на горле следы скорпионьего жала, каждый шириной в большой палец'
    ]
  ],
  teeth: [
    ['throat torn by teeth that were not a dog’s', 'горло разорвано зубами, и зубы эти не собачьи'],
    [
      'the body marked all over with small bites, as if something hungry had fed there all night',
      'всё тело в мелких укусах, словно всю ночь к нему припадало что-то голодное'
    ],
    [
      'with a lion’s pugmarks pacing a circle all around, and none of them leading away',
      'вокруг кругами ходят следы львиных лап, и ни один не ведёт прочь'
    ],
    ['the face gnawed, and the stink of a byre hanging over everything', 'лицо обглодано, и надо всем висит смрад хлева'],
    [
      'mauled as if by a lion, and all round, in the dust, the prints of bare feet with talons',
      'тело растерзано, будто львом, а вокруг, в пыли, — отпечатки босых ног с когтями'
    ],
    [
      'a cradle-rope wound round the throat, and milk spilled on the ground beside, already soured',
      'на шее петлёй — верёвка от колыбели, а рядом на земле разлито молоко, уже прокисшее'
    ],
    ['the throat bitten through by broad flat teeth: a donkey’s teeth', 'горло прокушено широкими плоскими зубами — ослиными'],
    [
      'a comb and a spindle laid neatly on the breast, the way a gift is laid out',
      'на груди аккуратно, как подношение, лежат гребень и веретено'
    ],
    [
      'with the prints of a dog and a black sow trodden close all round, and milk spilled where there was no milk to spill',
      'вокруг тесно натоптаны следы собаки и чёрной свиньи, и разлито молоко — там, где молоку неоткуда было взяться'
    ],
    [
      'still burning with fever in death, the skin dry and hot, and on the cheek the faint print of a lion’s paw',
      'даже мёртвое тело горит в лихорадке, кожа сухая и горячая, а на щеке — слабый отпечаток львиной лапы'
    ],
    [
      'the hair combed out in the night and plaited with great care, and the throat torn open',
      'волосы ночью кто-то расчесал и бережно заплёл, а горло разорвано'
    ],
    [
      'curled up in a ring of gnawed bones, none of them human, and all of them fresh',
      'тело свернулось посреди кольца обглоданных костей — ни одной человеческой, и все свежие'
    ]
  ],
  plague: [
    [
      'swollen at the neck and under the arms with buboes as big as hens’ eggs, and the flies already at them',
      'на шее и под мышками вздулись бубоны величиной с куриное яйцо, и на них уже сидят мухи'
    ],
    [
      'wasted to skin and bone in a single night, so that one man carries the body back to camp alone',
      'тело за одну ночь иссохло до костей — в лагерь его уносит один человек, без всякой помощи'
    ],
    [
      'spotted black from head to foot, as if splashed with ink',
      'всё тело с головы до ног в чёрных пятнах, будто его забрызгали чернилами'
    ],
    [
      'under a blanket of flies so thick that it seems to rise and fall, though the breathing has long stopped',
      'тело под таким плотным покровом мух, что он словно поднимается и опускается, хотя дыхание давно остановилось'
    ],
    [
      'the mouth and nostrils crawling with maggots, though death came only an hour before',
      'во рту и в ноздрях кишат черви, хотя смерть пришла всего час назад'
    ],
    [
      'the skin covered in open sores, every one of them weeping, and a sweet smell over everything, like a sickroom’s',
      'кожа в открытых язвах, и все они сочатся, а надо всем стоит сладкий запах, как в комнате больного'
    ],
    [
      'curled on the ground with a hand pressed over the mouth, as if to keep a cough in, and black spittle between the fingers',
      'тело скорчилось на земле, ладонь прижата ко рту, словно чтобы удержать кашель, а между пальцами — чёрная слюна'
    ],
    [
      'wrapped in a sheet as if made ready for the dead-cart, and beside the body the deep ruts of a cart that no one in the camp owns',
      'тело завёрнуто в простыню, словно приготовлено для телеги за мёртвыми, а рядом — глубокие колеи от телеги, какой в лагере ни у кого нет'
    ],
    [
      'the eyes milky and the lips black, and dead rats lying all round in a ring, every one on its back',
      'глаза помутнели, губы почернели, а вокруг кольцом лежат дохлые крысы, все кверху брюхом'
    ],
    [
      'the belly swollen tight as a drum, and the skin gone the yellow of old tallow',
      'живот вздут, как барабан, а кожа стала жёлтой, как старое свечное сало'
    ],
    [
      'the face and hands covered in boils, and every boil opened neatly, as if lanced by a careful hand',
      'лицо и руки в нарывах, и каждый нарыв аккуратно вскрыт, будто ланцетом в заботливой руке'
    ],
    [
      'the fingers and toes gone black to the second joint, as with a gangrene that should have taken weeks',
      'пальцы на руках и ногах почернели до второй фаланги, как от гангрены, которой понадобились бы недели'
    ]
  ],
  madness: [
    [
      'the face fixed in a wide smile, the eyes open, and the cheeks still wet, as if from laughing',
      'на лице застыла широкая улыбка, глаза открыты, а щёки ещё мокрые — будто от смеха'
    ],
    [
      'in nightclothes and barefoot, the soles of the feet worn through to the bone, as if from walking all night',
      'в ночной рубашке, босиком, а ступни стёрты до кости, как после целой ночи ходьбы'
    ],
    [
      'a shaving mirror in one hand, gripped so hard that the fingers have to be prised open, and the glass cracked into a star',
      'в руке зеркальце для бритья, и пальцы сжаты так, что их приходится разжимать силой, а стекло треснуло звездой'
    ],
    [
      'the fingers raw, and the same name scratched a hundred times into the earth all round, spelled a different way each time',
      'пальцы стёрты в кровь, а вокруг на земле сто раз нацарапано одно и то же имя — и каждый раз по-разному'
    ],
    [
      'a watch in each hand, and both stopped at twenty past three',
      'в каждой руке по часам, и те и другие остановились на двадцати минутах четвёртого'
    ],
    [
      'the forehead broken from beating it on the ground, and on the face a look of great relief',
      'лоб разбит — им бились о землю, — а на лице выражение огромного облегчения'
    ],
    [
      'the eyes put out, carefully, with the thumbs, as if to stop them seeing something',
      'глаза выдавлены — бережно, большими пальцами, будто затем, чтобы они чего-то больше не видели'
    ],
    [
      'a notebook clutched to the chest, every page of it filled with the same line, written backwards',
      'к груди прижата записная книжка, и каждая её страница исписана одной и той же строкой — задом наперёд'
    ],
    [
      'at the centre of a ring of footprints trodden round and round all night, every print made by the same bare feet',
      'посреди кольца следов, протоптанного за ночь, и каждый след оставлен одними и теми же босыми ногами'
    ],
    [
      'huddled tight as if hiding from something, the eyes screwed shut and the fingers in the ears',
      'тело сжалось в комок, будто от чего-то пряталось, глаза зажмурены, пальцы заткнуты в уши'
    ],
    [
      'the boots on the wrong feet and the coat on inside out, buttoned with great care',
      'ботинки надеты не на ту ногу, а куртка вывернута наизнанку и старательно застёгнута'
    ],
    [
      'the lips still moving, as if counting under the breath, for an hour after the heart has stopped',
      'губы ещё целый час после того, как остановилось сердце, шевелятся, будто что-то считают про себя'
    ]
  ]
};

// ---------- the power's mark on a body the cult killed with its own hands, by aspect ----------
const DEATH_MARK = {
  fire: [
    ['and the ground beneath is baked as hard as a kiln floor', 'а земля под телом спеклась, как под в печи'],
    ['and the skin is hot to the touch, hours after', 'и кожа горячая на ощупь, хотя прошли часы'],
    ['and seven small burns run in a line down the spine', 'и вдоль позвоночника цепочкой тянутся семь маленьких ожогов']
  ],
  dust: [
    [
      'and grey dust lies over everything, finer than any dust on the tell',
      'и всё вокруг покрыто серой пылью — тоньше любой пыли на холме'
    ],
    ['and the mouth is full of grey earth', 'и рот набит серой землёй'],
    ['and an owl’s feather has been laid on the breast', 'и на грудь положено совиное перо']
  ],
  sea: [
    ['and the clothes are soaked with salt water, though the ground is dry', 'и одежда пропитана солёной водой, хотя земля вокруг сухая'],
    ['and there is sea-wrack tangled in the hair', 'и в волосах запутались морские водоросли'],
    ['and the lips are crusted white with salt', 'и губы покрыты белой коркой соли']
  ],
  teeth: [
    ['and something has gnawed the fingers since', 'а потом что-то обглодало пальцы'],
    ['and a lion’s pugmarks circle the body, leading nowhere', 'и вокруг тела кругом идут львиные следы, ведущие в никуда'],
    ['and the stink of a byre hangs over everything', 'и надо всем висит смрад хлева']
  ],
  plague: [
    ['and flies have settled on the face so thickly that it cannot be seen', 'и на лицо село столько мух, что его не видно'],
    ['and the skin has come out in black spots since', 'а кожа с тех пор покрылась чёрными пятнами'],
    ['and a sweet smell hangs over everything, like a sickroom’s', 'и надо всем стоит сладкий запах, как в комнате больного']
  ],
  madness: [
    ['and the face is fixed in a broad smile', 'и на лице застыла широкая улыбка'],
    ['and the watch on the wrist has stopped at twenty past three', 'и часы на запястье остановились на двадцати минутах четвёртого'],
    [
      'and the clothes have been put on inside out since, and buttoned with care',
      'а одежду с тех пор надели наизнанку и аккуратно застегнули'
    ]
  ]
};

// ---------- the cult's own hand: anywhere, and only in one place ----------
const DEATH_HAND = [
  ['the throat cut with a flint knife, black with bitumen', 'горло перерезано кремнёвым ножом, чёрным от битума'],
  ['a cord of braided black wool still knotted at the throat', 'на шее всё ещё затянут шнур из чёрной плетёной шерсти'],
  ['the skull broken with a brick stamped with Nebuchadnezzar’s name', 'череп проломлен кирпичом с клеймом Навуходоносора'],
  [
    'a single small wound under the ribs, neat as a seal’s impression, and hardly any blood',
    'под рёбрами одна-единственная маленькая рана, аккуратная, как оттиск печати, и почти нет крови'
  ],
  [
    'the face pressed down into a basin of wet clay, as a scribe smooths a tablet',
    'лицо вдавлено в таз с мокрой глиной — так писец разглаживает табличку'
  ],
  [
    'the wrists bound with reed rope, in knots no digger ties',
    'запястья связаны тростниковой верёвкой — такими узлами не вяжет ни один землекоп'
  ],
  [
    'a tent peg driven through one hand into the ground, as if to keep the body from going anywhere',
    'одна ладонь пробита палаточным колышком и пригвождена к земле — будто затем, чтобы тело никуда не ушло'
  ],
  ['a tea glass beside the body that smells of bitter almonds', 'рядом с телом стакан из-под чая, пахнущий горьким миндалём']
];
const DEATH_HAND_AT = {
  trench: [
    [
      'under a fall of earth from the section wall; but the shoring was sawn through',
      'под обвалившейся стенкой разреза; но крепь подпилена'
    ],
    [
      'face down at the bottom of the step trench, the pick still in the back',
      'лицом вниз на дне ступенчатой траншеи, и в спине всё ещё торчит кирка'
    ]
  ],
  ziggurat: [
    [
      'as if fallen from the third terrace; but the neck was broken before the fall',
      'похоже, падение с третьего уступа; но шея была сломана ещё до падения'
    ],
    [
      'in a niche of the lowest course, bricked up in haste, the mortar still wet',
      'в нише нижнего ряда кладки, наскоро заложенной кирпичом, и раствор ещё не высох'
    ]
  ],
  store: [
    [
      'under a fallen shelf of tablets, though the shelf was bolted to the wall',
      'под рухнувшим стеллажом с табличками, хотя стеллаж был привинчен к стене'
    ],
    ['locked in a packing crate, the lid nailed down from outside', 'в упаковочном ящике, крышка которого заколочена снаружи']
  ],
  canal: [
    ['face down in the water, the ankles tied together with reed rope', 'лицом вниз в воде, лодыжки связаны тростниковой верёвкой'],
    [
      'among the reeds, held under by someone who knelt on the back: the knee-marks are still in the mud',
      'в тростнике: кто-то держал под водой, встав коленом на спину, — следы колен остались в иле'
    ]
  ],
  cemetery: [
    [
      'laid in an open slipper-coffin, the lid propped beside it as if for later',
      'в открытом гробу-башмаке, а крышка прислонена рядом, будто её собирались закрыть потом'
    ],
    ['in a grave dug fresh in the night, only the face left uncovered', 'в могиле, выкопанной ночью, и не засыпано одно только лицо']
  ]
};

// ---------- the cult's signature, now and then ----------
const DEATH_SIGN = [
  [
    'In one palm someone has pressed a cylinder seal cut with seven gates.',
    'В ладонь вложена цилиндрическая печать с семью вырезанными вратами.'
  ],
  [
    'Seven wedges have been cut into the forehead, neatly, by a hand that knew the signs.',
    'На лбу аккуратно вырезаны семь клиньев — рукой, знающей знаки.'
  ],
  [
    'A lamp burns beside the body, and no one in the camp will own it.',
    'Рядом с телом горит лампа, и никто в лагере не признаёт её своей.'
  ],
  [
    'The boots have been taken off and set side by side, toes toward the ziggurat.',
    'Ботинки сняты и поставлены рядом, носками к зиккурату.'
  ],
  ['Someone has closed the eyes and laid a sherd on each lid.', 'Кто-то закрыл мёртвые глаза и положил на каждое веко по черепку.'],
  ['Around the body the ground has been swept clean, in a perfect circle.', 'Вокруг тела земля чисто выметена — идеальным кругом.'],
  ['Beside one hand a sign is scratched in the dust: the old sign for a gate.', 'У руки в пыли нацарапан знак — древний знак врат.']
];
