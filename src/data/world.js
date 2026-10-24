// ===================== THE WORLD: people, powers, charms, places, events =====================
// The English tables. Russian translations of them live in i18n/ru-*.js.
const CATS = ['prints', 'ash', 'scent'];
const TRAITS = {
  prints: {
    label: 'Prints',
    vals: {
      hob: { name: 'hobnailed boots', see: `{n}’s hobnailed boots ring on the baked brick.`, clue: 'the deep prints of hobnailed boots' },
      riding: {
        name: 'riding boots',
        see: `{n} wears soft riding boots, oiled against the dust.`,
        clue: 'the smooth prints of riding boots'
      },
      sandal: { name: 'rope sandals', see: `{n} pads about in rope-soled sandals.`, clue: 'the woven tread of rope-soled sandals' },
      brogue: { name: 'brogues', see: `{n}’s brogues are absurdly well polished for a dig.`, clue: 'the narrow prints of town brogues' }
    }
  },
  ash: {
    label: 'Ash',
    vals: {
      turkish: {
        name: 'Turkish cigarettes',
        see: `{n} smokes Turkish cigarettes, lighting each from the last.`,
        clue: 'the gold-tipped end of a Turkish cigarette'
      },
      pipe: { name: 'a pipe', see: `{n} knocks out a pipe against a tent pole.`, clue: 'a little heap of pipe dottle' },
      cheroot: { name: 'cheroots', see: `{n} chews the end of a black cheroot.`, clue: 'the chewed stub of a cheroot' },
      tumbak: {
        name: 'the water-pipe',
        see: `{n} smells of the coffee-house nargila, of tumbak and charcoal.`,
        clue: 'crumbs of tumbak, water-pipe tobacco'
      }
    }
  },
  scent: {
    label: 'Scent',
    vals: {
      rose: { name: 'attar of roses', see: `A breath of attar of roses follows {n}.`, clue: 'a lingering scent of attar of roses' },
      hypo: {
        name: 'photographic fixer',
        see: `{n}’s cuffs smell sharply of hypo, the darkroom fixer.`,
        clue: 'the sharp chemical smell of hypo'
      },
      bitumen: { name: 'bitumen', see: `There is black bitumen under {n}’s fingernails.`, clue: 'a smear of black bitumen' },
      carbolic: { name: 'carbolic soap', see: `{n} smells of carbolic soap, scrubbed almost raw.`, clue: 'the hospital smell of carbolic' }
    }
  }
};

const CHARS = [
  {
    id: 'hamid',
    name: 'Hamid al-Shergati',
    short: 'Hamid',
    init: 'HS',
    p: 'he',
    pp: 'his',
    job: 'Foreman of the Sherqati diggers',
    bio: [
      `Hamid learned to dig with the Germans at Assur before the war. He reads a trench section the way a banker reads a ledger.`,
      `“The men will dig anywhere but under the ziggurat after dark,” Hamid says. “I do not blame them.”`
    ]
  },
  {
    id: 'anselm',
    name: 'Père Anselm Duroc',
    short: 'Anselm',
    init: 'AD',
    p: 'he',
    pp: 'his',
    job: 'Epigrapher, École Biblique',
    bio: [
      `A Dominican from Jerusalem, Anselm reads Old Babylonian faster than you read the Times.`,
      `Anselm keeps a rosary and a copy of the Song of Erra in the same pocket, and will not say which he trusts more.`
    ]
  },
  {
    id: 'constance',
    name: 'Constance Pell',
    short: 'Constance',
    init: 'CP',
    p: 'she',
    pp: 'her',
    job: 'Expedition photographer',
    bio: [
      `Constance has photographed three wars and a Durbar. She says the mound is the only subject that will not sit still.`,
      `Her plates from last week show a figure on the ziggurat that nobody remembers standing there.`
    ]
  },
  {
    id: 'ashby',
    name: 'Major Lionel Ashby',
    short: 'Ashby',
    init: 'LA',
    p: 'he',
    pp: 'his',
    job: 'Political officer, Baghdad',
    bio: [
      `The High Commission sent Ashby to watch the dig. He says “jolly good” in a tone that means the opposite.`,
      `Ashby keeps the camp’s wireless set and the second key to the finds magazine.`
    ]
  },
  {
    id: 'yusuf',
    name: 'Yusuf Shamash',
    short: 'Yusuf',
    init: 'YS',
    p: 'he',
    pp: 'his',
    job: 'Interpreter and dealer',
    bio: [
      `A Baghdadi who knows the price of everything under the earth and most things above it.`,
      `Yusuf says he came for the tablets. He does not say for whom.`
    ]
  },
  {
    id: 'ilse',
    name: 'Dr Ilse Brandt',
    short: 'Ilse',
    init: 'IB',
    p: 'she',
    pp: 'her',
    job: 'Assyriologist',
    bio: [
      `Ilse dug at Babylon under Koldewey until the war ended it, and has not forgiven anyone for that.`,
      `Ilse sleeps beside the finds magazine, she says, to keep it safe from amateurs.`
    ]
  },
  {
    id: 'zahrun',
    name: 'Zahrun bar Sam',
    short: 'Zahrun',
    init: 'ZS',
    p: 'he',
    pp: 'his',
    job: 'Mandaean silversmith',
    bio: [
      `A silversmith from Amara, Zahrun washes in running water every dawn and prays to the Great Life.`,
      `Zahrun calls the mound “a house of darkness with its door ajar”.`
    ]
  }
];

const ROLE_NAMES = { cult: 'Cultist', seer: 'Dreamer', warden: 'Watcher', smuggler: 'Smuggler', bystander: 'Innocent' };

// The powers that may lie under Kutha, eight in all; four of them in any season (game/state.js, freshSeason), each by
// name and an epithet the old texts give it. What each is in a season, its nature, signs, titles and ward, is dealt
// anew (world/powers.js).
const PANTHEON = ['nergal', 'ereshkigal', 'tiamat', 'lamashtu', 'namtar', 'pazuzu', 'kingu', 'beletseri'];
const GODS = {
  // the god of Kutha, whose temple there was E-meslam; one with Erra in the Erra Epic
  nergal: {
    name: 'Nergal',
    title: 'Lord of Kutha, called Erra'
  },
  // her name, ‘lady of the great earth’: queen of the land of the dead (Inana's Descent)
  ereshkigal: {
    name: 'Ereshkigal',
    title: 'Queen of the Great Below'
  },
  // ‘Mummu-Tiamat, she who bore them all’ (Enūma eliš I)
  tiamat: {
    name: 'Tiamat',
    title: 'She Who Bore Them All'
  },
  // the first of her seven names, in the incantations against her
  lamashtu: {
    name: 'Lamashtu',
    title: 'Daughter of Anu'
  },
  // sukkal of the underworld, Ereshkigal's messenger, who looses the sixty diseases (Ishtar's Descent)
  namtar: {
    name: 'Namtar',
    title: 'Vizier of the Underworld'
  },
  // ‘son of Hanbu, king of the evil lilû-demons’, in his own words on his statuettes
  pazuzu: {
    name: 'Pazuzu',
    title: 'King of the Evil Wind-Demons'
  },
  // raised by Tiamat to lead her host, with the Tablet of Destinies on his breast (Enūma eliš I)
  kingu: {
    name: 'Kingu',
    title: 'Captain of the Host of Monsters'
  },
  // ṭupšarrat arallê, who kneels before Ereshkigal reading from her tablet (Gilgameš VII)
  beletseri: {
    name: 'Belet-Seri',
    title: 'Scribe of the Underworld'
  }
};
// The six natures a power can have in a season: the signs of each (eight), each told in three ways (the same sign,
// whichever way it is told); how the night comes for you in its colour; and what waits in the sanctum. A power takes
// the nature of the first of its signs (world/powers.js, dealSigns).
const ASPECT_TEXT = {
  fire: {
    omens: [
      [
        'The Pleiades hung so low over the mound last night that the workmen counted them aloud. Seven. Then nobody spoke.',
        'The village watchman swears the Pleiades sank so low last night that they sat on the top of the ziggurat, like birds on a roof.',
        'Before dawn the Pleiades stood just above the mound, near enough to cast shadows. The men would not look up.'
      ],
      [
        'A fever is running through the village. The children burn and do not sweat.',
        'In the village the children are hot as stones in the sun, and their skin stays dry. The midwife has never seen the like.',
        'Three more children down with the fever. They burn and burn, and there is not a drop of sweat on any of them.'
      ],
      [
        'At dawn the bricks of Trench B are warm to the touch, as if a kiln had burned beneath them all night.',
        'One of the pickmen lays his palm on the brick of Trench B at sunrise and snatches it back. The brick is warm, as if fired overnight.',
        'Before the sun is up, the bricks in the trench are warm enough to dry a wet cloth.'
      ],
      [
        'Something roared in the dry marsh before dawn. There has been no lion in Iraq for ten years.',
        'A lion roared in the night, close, from the dry marsh. Every dog in the village answered it, and then not one of them did.',
        'The herdsmen found a lion’s tracks in the dry marsh this morning, big as dinner plates. There has not been a lion here in ten years.'
      ],
      [
        'A red star hung over the ziggurat all night and did not move. The watchman says it was looking at him.',
        'The red star was back above the mound last night, low and swollen, and it did not wheel with the others.',
        'Before dawn a star the colour of a live coal stood over Trench B. The others went round; it stayed.'
      ],
      [
        'Smoke is rising from the barley by the canal, thin and steady, though nothing there is burning.',
        'The herdsmen walked through the smoking stubble this morning and found the ground cold and every stalk unburnt.',
        'All morning a field west of the tell smokes like a dying fire. When the boys run out to it, there is nothing to put out.'
      ],
      [
        'The sun came up red as a wound this morning, and stayed red until noon.',
        'At dawn the sun is the colour of blood, and at noon you can look straight at it.',
        'The men will not start work: the sun rose bloody, and the old ones say a day begun so is a day for burying.'
      ],
      [
        'The water from the camp well came up warm this morning, warm as blood, and smelled of hot iron.',
        'In the cold before dawn the bucket comes up out of the well steaming.',
        'The cook will not let anyone drink from the well: the water comes up warm, and in this country well water is never warm.'
      ]
    ],
    attack: [
      'You wake burning. Your blanket smoulders, and seven points of light circle the tent roof and go out.',
      'You wake with the air in the tent as hot as an oven, and something at the foot of the bed giving off heat like a kiln door.',
      'You wake to a hand on your chest, hot as a brand. When you strike a match, there is a blister on your skin in the shape of a palm.'
    ],
    sanctum:
      'Beneath the ziggurat the air shimmers with heat. Seven braziers ring a pit, and something in the pit is breathing fire, slowly, like a sleeper.'
  },
  dust: {
    omens: [
      [
        'Owls have come to roost along Trench B, dozens of them, silent, all facing the mound.',
        'At dusk the owls come again, more of them than yesterday, and settle in a line along the spoil heap, every face turned to the mound.',
        'The pickmen count forty owls on the edge of the trench this morning. Not one of them looks at the men. They are all looking at the mound.'
      ],
      [
        'Dust fell from a clear sky in the night, fine as flour and grey as a grave.',
        'A fine grey dust has settled on everything overnight, though the sky has been clear for a week.',
        'Out of a cloudless sky dust is falling, soft and grey, like ash from a fire nobody can see.'
      ],
      [
        'A workman swears his dead father walked past the coffee-house at midnight, eating dust.',
        'In the village they say the dead were walking last night, and that they stooped to eat the dust of the road.',
        'A woman swears her drowned brother stood at her door at midnight with his mouth full of dust, and would not come in.'
      ],
      [
        'Every tent flap in the camp stood open at dawn. The men counted seven.',
        'At first light every door in the dig-house stands open, though each was barred for the night.',
        'Every door and tent flap in the camp is found open this morning. Nobody heard a thing.'
      ],
      [
        'Three of the Parthian graves stood open at dawn, their slabs pushed aside from below. Nothing had been taken.',
        'The guards swear nobody came near the cemetery in the night. This morning two of the graves are open, and the earth around them is not disturbed.',
        'A grave the men sealed yesterday is open this morning. The bones inside have been laid out in a different order.'
      ],
      [
        'At noon every bird on the tell fell silent at once, the sparrows, the doves, the crows, and stayed silent for an hour.',
        'The noon silence again: not a bird, not an insect. The men put down their tools without being told.',
        'The birds in the palms by the canal stopped singing at midday, all together, as if a door had closed on them.'
      ],
      [
        'In the afternoon light a shadow lay across the wall of the dig-house, the shadow of a tall man, and nobody stood there.',
        'The pickmen point at the spoil heap: a shadow lies on it, long and thin, and nothing stands between it and the sun.',
        'At sunset there were nine shadows by the trench and eight men.'
      ],
      [
        'Last night the lamps in the mess tent burned with a flame you could see and a light you could not. Everyone sat in the dark around them.',
        'The night watchman’s lamp burned all night, he says, and lit nothing; he could not see his own hand by it.',
        'In the village every lamp burned low and grey last night, and the rooms stayed dark around them.'
      ]
    ],
    attack: [
      'You wake choking on dust. An owl sits on your chest, looking at you with human eyes.',
      'You wake under a weight of grey dust, heaped over you like a grave, and claw your way out of it in the dark.',
      'Something stands by your bed in the dark, smelling of the grave, and bends down to breathe dust into your mouth.'
    ],
    sanctum:
      'The seventh gate opens on a hall of grey dust. On a throne of clay sits a shape that is mostly darkness, and its eye is opening.'
  },
  sea: {
    omens: [
      [
        'The canal ran salt overnight. The fish float belly-up and the water tastes of the sea.',
        'The buffalo will not drink from the canal this morning. One of the boys tastes the water and spits: salt.',
        'Overnight the canal water has turned brackish and bitter, and a white crust lines the banks.'
      ],
      [
        'The men killed a horned serpent in the reeds. It had the legs of a lizard.',
        'The boys bring a dead thing out of the reeds on a stick: a horned snake with four short legs.',
        'Something horned was killed in the reeds at dawn. It was a serpent, the men say, and it walked.'
      ],
      [
        'A wind blew from all four quarters at once, and the tents strained four ways.',
        'All morning the wind blows from every side at once, and the dust devils on the tell spin both ways.',
        'The wind came from the north and the south and the east and the west together, and the tent ropes sang four notes.'
      ],
      [
        'A scorpion the size of a cat came up in the spoil. Its face was nearly a man’s.',
        'A scorpion as big as a cat crawled out of the spoil today. The men swear it had a man’s face.',
        'The men killed a great scorpion in the spoil heap. Not one of them will say what its face looked like.'
      ],
      [
        'It rained fish in the night, out of a clear sky. The camp is littered with them, small and silver and still alive.',
        'The boys are gathering fish off the roof of the dig-house. Nobody heard rain.',
        'At dawn sea fish lie gasping on the dry tell, three hundred miles from any sea.'
      ],
      [
        'For an hour this morning the canal ran backwards, north against the fall of the land, and then went on as before.',
        'The boatmen say the current turned in the night and carried their boats back upstream to where they started.',
        'Reeds and rubbish drift upstream past the camp all afternoon. The water is running back to where it came from.'
      ],
      [
        'Frogs came up out of the canal in the night, hundreds of them. They are in the tents, in the boots, in the water jars.',
        'The path from the canal is alive with frogs this morning, all going the same way: toward the mound.',
        'The village women are sweeping frogs out of their doors. They have never come up so far from the water.'
      ],
      [
        'At dawn a white mist rose out of the dry spoil and lay over the tell. It smelled of the sea.',
        'A fog came up out of the ground in the night, thick and salt, though no water has stood on this ground in a thousand years.',
        'The trench is full of mist this morning, cold and briny. The men come out of it with salt drying on their faces.'
      ]
    ],
    attack: [
      'You wake soaked in brine. Something cold and coiled is drawing back under the tent wall.',
      'You wake drowning, in a dry tent, and cough up seawater by the cupful.',
      'Water stands a foot deep on the floor of your tent, black and salt, and something in it brushes your hand.'
    ],
    sanctum:
      'The stair ends at black water, salt and moving, though there is no wind. Far out, something vast turns over, and the water rises a step.'
  },
  teeth: {
    omens: [
      [
        'At the foot of the mound a dog and a black pig lie as if suckling at something no one can see.',
        'A bitch and a black sow lie side by side at the foot of the mound, nursing at the empty air.',
        'The dog and the black pig are there again this morning, lying close as littermates, suckling at nothing.'
      ],
      [
        'Someone left a comb and a spindle on the threshold of your tent.',
        'A comb and a spindle lie on your threshold this morning, set out neatly, the way a gift is set out.',
        'Someone has left a woman’s comb and a spindle at the door of your tent. No one in the camp owns either.'
      ],
      [
        'A woman in the village lost her child in the night. The midwives speak of a lion-headed visitor.',
        'A child was born dead in the village. The mother says a woman with a lion’s head sat by the bed and would not leave.',
        'The midwives in the village are frightened. At last night’s birth, they say, a lion-headed woman came in uninvited.'
      ],
      [
        'Something with a donkey’s teeth gnawed through the saddles in the horse lines.',
        'The saddles in the horse lines have been gnawed to rags overnight, by teeth too broad for a dog’s: a donkey’s teeth.',
        'Something with flat, broad teeth gnawed through every saddle-girth in the horse lines. The donkeys were tethered all night.'
      ],
      [
        'A ewe in the village dropped a lamb with two heads in the night. Both mouths were open. Both were crying.',
        'The herdsmen bring a dead lamb to the camp in a sack: it has two heads, and one of them has teeth.',
        'A two-headed lamb was born at dawn and lived an hour. The village has already burned it.'
      ],
      [
        'The goats in the village gave milk this morning with blood in it, every one of them.',
        'The milk the village boy brings is pink. He says every goat in the village is milking blood.',
        'The milk curdles red in the pail as it is drawn. The women pour it out on the ground and will not say why.'
      ],
      [
        'All night the village dogs howled at the door of a woman near her time. Stones would not drive them off.',
        'The dogs gathered again at the house where a child is due, a dozen of them, silent until the lamp went out, then howling.',
        'The midwife came up to the camp for help: the dogs are howling at the door of the birthing-house, and they will not go.'
      ],
      [
        'In the village every nursing mother woke dry this morning, and the babies will not stop crying.',
        'The wet-nurse’s milk dried up overnight. She says something fed in the dark while she slept.',
        'The village women say their milk was taken in the night, every drop, by something small that did not cry.'
      ]
    ],
    attack: [
      'You wake to a weight on your chest and breath that stinks of the byre. Something with a lion’s face is bending over you.',
      'You wake to teeth in your arm, small and many, and a weight on the cot like a large dog’s that is not a dog.',
      'Something sits at the end of your cot in the dark, rocking and crooning, and when you move it bites.'
    ],
    sanctum:
      'The chamber reeks of milk and blood. Lion-headed shadows crawl the walls, and in the centre a cradle rocks with nothing in it. Yet.'
  },
  plague: {
    omens: [
      [
        'Flies came down on the camp in the night, so thick that the tents are black with them, and not one of them makes a sound.',
        'The cook serves breakfast under a cloth: the flies are on everything this morning, thick as soot, and they will not move for a hand.',
        'A black cloud of flies hangs over Trench B all morning. The men work inside it, and come out with flies in their hair and their mouths.'
      ],
      [
        'Rats are coming out into the lanes of the village by daylight, and dying there in the open.',
        'The waterboy counted forty dead rats between the village and the camp this morning, lying on their backs in the sun.',
        'In the night the rats came out of the walls of the dig-house and lay down in rows on the floor to die.'
      ],
      [
        'The oxen in the village are sick. They lie down in the fields with sores about their mouths, and will not get up.',
        'A murrain has come on the village herds overnight: the beasts stand with their heads hanging, and the flies are at their sores.',
        'The headman’s plough-oxen are dead in the stubble this morning, all six, swollen and covered in boils.'
      ],
      [
        'The barley in the village store-jars has rotted overnight. It comes out black and wet, and smells sweet.',
        'The cook opens a new sack of flour and drops it: inside it is grey with mould, and moving, though it came up from Hillah sealed a week ago.',
        'Every grain-pit in the village was opened this morning, and every one has gone soft and black. The smell carries to the camp.'
      ],
      [
        'All night a cough went round the camp, from tent to tent, as if it were being passed along. This morning nobody has so much as a cold.',
        'The watchman says the whole village was coughing in the dark last night, every house, and that it stopped all at once at the call to prayer.',
        'Someone coughed all night in the empty tent at the end of the lines, a dry, patient cough. At first light the tent was empty, and the blanket spotted black.'
      ],
      [
        'The mutton the cook hung in the shade last night is crawling with maggots this morning, though the sheep was killed at sunset.',
        'The meat for the men’s dinner went bad in an hour, in a covered pot, and the cook swears no fly could have got in.',
        'A sheep slaughtered at the coffee-house at dawn was fly-blown before the butcher had finished skinning it.'
      ],
      [
        'Three of the pickmen woke with black spots on their hands, each the size of a coin. By noon the spots had gone.',
        'Half the village has come out in spots overnight, dark as bruises, on the backs of the hands. Nobody feels ill.',
        'The waterboy holds out his arms to show you: they are speckled black from wrist to elbow, and he says it does not hurt.'
      ],
      [
        'A cart went through the village at midnight with nothing in its shafts to draw it. It stopped at three doors.',
        'The village women say the dead-cart came in the night: they heard its wheels go slowly from door to door, and nobody walked beside it.',
        'This morning there are cart-ruts down the lane between the houses, fresh and deep, and not a cart in the village has been out.'
      ]
    ],
    attack: [
      'You wake coughing, and cannot stop. When you strike a match the pillow is black with flies, and they rise all together and go out through the canvas.',
      'You wake to a hand stroking your neck, gently, as a doctor feels for the glands. Where it has touched, swellings come up as hard as walnuts.',
      'You wake to the creak of a cart stopping outside your tent, and to hands lifting you, quite gently, the way the dead are lifted.'
    ],
    sanctum:
      'The hall below smells sweet, like a sickroom, and sixty great jars stand in rows on its floor. Fifty-nine are sealed with clay. From the sixtieth, in the middle, flies come up like smoke.'
  },
  madness: {
    omens: [
      [
        'At breakfast it comes out that the whole camp dreamt the same dream last night, down to the colour of the walls.',
        'The cook and the waterboy tell the same dream, word for word: a white room with no door, and someone in it sitting with his back to them.',
        'In the village everyone dreamt one dream last night, the children too, and nobody will say what it was.'
      ],
      [
        'The stamps on the bricks of Trench B read backwards this morning, every one, as if seen in a mirror.',
        'One of the pickmen brings you a brick: the king’s stamp on it reads backwards, and so does the next, and the next.',
        'Every stamped brick on the spoil heap has its wedges turned the wrong way this morning, as if the whole tell had been turned inside out in the night.'
      ],
      [
        'The cook’s shaving mirror showed him a stranger this morning. He broke it, and now he shaves by feel.',
        'People in the camp are avoiding the looking-glass in the mess tent. The face in it is nearly theirs: a little older, and smiling when they are not.',
        'A pickman looked into his wife’s mirror at dawn and saw someone standing behind him. There was nobody there, and he will not go home.'
      ],
      [
        'Half the village walked in its sleep last night, round and round the foot of the mound in a long line, and none of them remembers it.',
        'At three in the morning the watchman found six of the diggers on the tell in their nightclothes, walking in step, with their eyes open.',
        'Two of the camp servants were missing from their beds at dawn. They were found on the ziggurat, barefoot, asleep on their feet.'
      ],
      [
        'Someone laughed out on the tell all night, low and steady. Nobody in the camp was missing, and nobody was there when the lamps came.',
        'Laughter woke the camp in the small hours: someone out by the trench, laughing quietly at something, on and on. The trench was empty.',
        'In the village they are afraid of the laughing. It comes from inside the walls of the houses, they say, and stops whenever a lamp is lit.'
      ],
      [
        'At roll-call three of the pickmen could not say their own names. By noon they had them back, and did not remember losing them.',
        'A woman in the village has forgotten her children’s names, and they hers. They sit together in the doorway, polite as strangers.',
        'The waterboy came to your tent this morning and asked you, very politely, who he was.'
      ],
      [
        'Every watch and clock in the camp stopped in the night at the same minute: twenty past three.',
        'Your own watch stopped at twenty past three last night, and so did everyone else’s. Wound, they tick; the hands do not move.',
        'The clock in the dig-house office has stopped at twenty past three, and so has every watch in the village, the cheap ones and the good.'
      ],
      [
        'At midnight footsteps crossed the camp from the mess tent to the trench. A minute later the same footsteps crossed again: the same stride, the same stumble at the same tent rope.',
        'The watchman heard someone walk past his fire in the night, stop, and go on. Then it all happened again, exactly the same, and again, until dawn.',
        'Everyone in the camp heard the footsteps last night: someone walking the lines between the tents, the same twenty paces over and over, and nobody there.'
      ]
    ],
    attack: [
      'You wake at the foot of the ziggurat in your nightclothes, with no memory of the walk, and your hands torn from digging at the brick.',
      'You wake to someone beside your cot counting aloud, slowly, in your own voice. When you reach for the matches, the counting stops, and something takes hold of your wrist.',
      'You wake laughing, and cannot stop, and laugh until something in your chest gives way; and all the while, somewhere in the dark, someone is laughing with you.'
    ],
    sanctum:
      'The last chamber is walled with mirrors of black bronze, and in every one of them you are already standing in the circle, laughing. In the middle stands a tall mirror that shows nothing at all.'
  }
};

// Twelve charms with neutral names, six of them in any season: four are wards, one against each power, and two bind
// nothing. Which six, and which is which, changes every game (world/powers.js, dealWards). Then the four ordinary finds.
const ITEMS = {
  seal: {
    name: 'Lapis cylinder seal',
    ward: true,
    desc: 'A little cylinder of blue lapis, pierced through. Rolled across your palm it leaves a hunter with a net and a crook.',
    find: 'In the sieve, a lapis cylinder seal, no longer than a finger joint. Rolled across your palm it leaves a hunter with a net and a crook.'
  },
  eye: {
    name: 'Obsidian eye-stone',
    ward: true,
    desc: 'A disc of black obsidian, polished like still water and ringed with white shell: an eye, wide open.',
    find: 'Under a fallen brick, a disc of black obsidian ringed with white shell. It looks like an eye that has never closed.'
  },
  cone: {
    name: 'Inscribed clay cone',
    ward: true,
    desc: 'A foundation cone, its rings of signs pressed by a careful hand: the name of a house, and a prayer that its walls stand.',
    find: 'A foundation cone, still driven like a nail into the mud mortar, its rings of signs pressed by a careful hand.'
  },
  figures: {
    name: 'Two clay figures',
    ward: true,
    plural: true,
    desc: 'Two small clay figures, sexless and smiling, no taller than your thumb.',
    find: 'Two little clay figures lie together in a niche, sexless and smiling.'
  },
  head: {
    name: 'Bronze demon head',
    ward: true,
    desc: 'A snarling bronze head the size of a walnut, pierced for a cord.',
    find: 'A bronze head the size of a walnut, snarling, pierced for a cord.'
  },
  plaque: {
    name: 'Shell-inlaid plaque',
    ward: true,
    desc: 'A plaque of white shell, inlaid with a seven-petalled rosette in blue lapis.',
    find: 'A plaque of white sea shell, its seven-petalled rosette still bright with lapis.'
  },
  liver: {
    name: 'Clay liver model',
    ward: true,
    desc: 'A clay model of a sheep’s liver, every lobe scored with little squares and signs: a diviner’s teaching piece.',
    find: 'Half buried in the spoil, a clay model of a sheep’s liver, every lobe scored with a diviner’s notes.'
  },
  crescent: {
    name: 'Silver crescent',
    ward: true,
    desc: 'A crescent of tarnished silver, horns up, on a scrap of chain.',
    find: 'Caught in the sieve, a little silver crescent, black with tarnish, horns up, a scrap of chain still through its loop.'
  },
  bell: {
    name: 'Bronze bell',
    ward: true,
    desc: 'A little bronze bell, its rim cast with crawling creatures. The clapper is gone.',
    find: 'In the ash of an old hearth, a little bronze bell with creatures crawling round its rim, and no clapper.'
  },
  duck: {
    name: 'Haematite duck-weight',
    ward: true,
    desc: 'A sleeping duck of polished haematite, its head laid back along its wing: a merchant’s weight.',
    find: 'Among the sherds, a sleeping duck of polished haematite, its head laid back along its wing: a merchant’s weight.'
  },
  bead: {
    name: 'Etched carnelian bead',
    ward: true,
    desc: 'A long barrel bead of red carnelian, etched round with white zigzags and pierced end to end.',
    find: 'In a crack in the mud brick, a long bead of red carnelian etched round with white zigzags.'
  },
  fly: {
    name: 'Agate fly',
    ward: true,
    desc: 'A fly of banded agate no bigger than a fingernail, pierced through the back for a cord.',
    find: 'At the bottom of a jar, a fly of banded agate no bigger than a fingernail, pierced for a cord.'
  },
  bowl: {
    name: 'Incantation bowl',
    desc: 'Aramaic spirals around a bound demon. Absorbs one attack on you at night.',
    find: `An Aramaic incantation bowl, buried face-down as such bowls always were, a demon bound in its spiral of text.`
  },
  brandy: {
    name: 'Flask of brandy',
    desc: 'Steadies your nerve. Drinking takes no time.',
    find: `A flask of brandy wrapped in a shirt, cached by someone who expected bad nights.`
  },
  torch: {
    name: 'Electric torch',
    desc: 'Helps you through the dark below.',
    find: `An electric torch with a fresh battery, left on a ledge by someone who meant to come back for it.`
  },
  revolver: {
    name: 'Service revolver',
    desc: 'Six rounds. May drive off a night attack, and has a use below.',
    find: `A service revolver in an oilcloth, six rounds in the cylinder. Crane’s, by the initials on the grip.`
  }
};
const CHARMS = ['seal', 'eye', 'cone', 'figures', 'head', 'plaque', 'liver', 'crescent', 'bell', 'duck', 'bead', 'fly'];
const MINOR = ['bowl', 'brandy', 'torch', 'revolver'];

// name: as a heading or label; ref: the same in the middle of a sentence; at: where something happened
const LOCS = {
  camp: {
    name: 'Expedition camp',
    ref: 'the camp',
    at: 'outside your tent',
    x: 330,
    y: 238,
    search: null,
    desc: [
      `Canvas tents around a mudbrick dig-house. Crane’s camp bed is still made up in the office. Nobody has wanted to sleep in it.`,
      `The cook’s fire, the smell of cardamom coffee, and the wireless aerial strung from a palm trunk.`
    ]
  },
  trench: {
    name: 'Trench B',
    ref: 'Trench B',
    at: 'in Trench B',
    x: 205,
    y: 158,
    search: { frag: 45, omen: 15, item: 15, horror: 15, none: 10 },
    desc: [
      `A deep cut through the eastern slope of the tell. Ash and mudbrick stripe the walls: three thousand years in a single section.`,
      `Baskets of spoil, the abandoned light railway, and a step trench going down further than the men like.`
    ]
  },
  ziggurat: {
    name: 'The ziggurat E-meslam',
    ref: 'the ziggurat E-meslam',
    at: 'at the foot of the ziggurat',
    x: 160,
    y: 96,
    search: { frag: 20, omen: 35, item: 15, horror: 25, none: 5 },
    desc: [
      `The ruined temple-tower of Nergal, a slumped mountain of brick. The bitumen between the courses still smells in the heat.`,
      `At the foot of E-meslam the ground is scorched in a circle no wider than a man’s outstretched arms.`
    ]
  },
  store: {
    name: 'Finds magazine',
    ref: 'the finds magazine',
    at: 'in the finds magazine',
    x: 298,
    y: 160,
    search: { frag: 50, omen: 5, item: 20, horror: 10, none: 15 },
    desc: [`The mudbrick storeroom where finds are numbered and shelved. Tablets sleep in cigar boxes, wrapped in cotton wool.`]
  },
  village: {
    name: 'Workmen’s village',
    ref: 'the workmen’s village',
    at: 'behind the coffee-house',
    x: 80,
    y: 238,
    search: { frag: 10, omen: 25, item: 35, horror: 5, none: 25 },
    desc: [`Reed-and-mud houses around a coffee-house, where the diggers drink sweet tea and trade rumours about the mound.`]
  },
  canal: {
    name: 'The Kutha canal',
    ref: 'the Kutha canal',
    at: 'on the canal bank',
    x: 48,
    y: 112,
    search: { frag: 10, omen: 30, item: 25, horror: 20, none: 15 },
    desc: [`The old Kutha canal, half silted, lined with reeds and water buffalo. Bathers come at dawn and leave before dusk.`]
  },
  cemetery: {
    name: 'Parthian graves',
    ref: 'the Parthian graves',
    at: 'among the Parthian graves',
    x: 288,
    y: 64,
    search: { frag: 20, omen: 30, item: 20, horror: 25, none: 5 },
    desc: [`Parthian slipper-coffins lie in rows just under the surface, glazed sea-green, each lid moulded like a face.`]
  }
};
const LOC_IDS = Object.keys(LOCS);

const HORROR = {
  trench: [
    `In the trench wall you uncover a hand of baked clay. It is warm, and it closes, slightly, on your fingers.`,
    `The section drawing you made yesterday has changed. A stair is drawn into it now, going down, in your own hand.`
  ],
  ziggurat: [
    `A brick shifts under your boot and you look into a space behind it. Something in there looks back.`,
    `For a moment the ziggurat has more terraces than it should, climbing into the white sky.`
  ],
  store: [`A tablet you numbered yesterday has new signs on it, freshly pressed. The clay is still wet.`],
  village: [`A child follows you down the lane, speaking Akkadian, a language dead for two thousand years.`],
  canal: [`Your reflection in the canal does not move when you do.`],
  cemetery: [`One of the slipper-coffins is empty, and its lid has been closed from the inside.`]
};
const FRAG_FIND = {
  any: [
    `You prise a fragment of unbaked tablet from the spoil, the signs as crisp as the day they were pressed.`,
    `Under a fallen brick lies a broken tablet, its edge inscribed in a cramped, hurried hand.`
  ],
  store: [`In a cigar box with no field number is a fragment someone hid here on purpose.`],
  village: [`A boy sells you a tablet fragment for two annas and runs off before you can ask where he found it.`]
};
const NOTHING = [
  `An hour of turning spoil brings up potsherds, a scorpion’s husk and nothing else.`,
  `You find nothing but heat, flies and the feeling of being watched.`
];

const EVENTS = [
  {
    id: 'shamal',
    strand: 'news',
    after: { rain: 2 },
    text: `A shamal is blowing out of the northwest, a wall of yellow dust. Work will stop early today.`
  },
  {
    id: 'telegram',
    strand: 'news',
    after: { post: 1.5, cable: 1.5 },
    text: `A rider from Hillah brings a telegram from the Trustees: PROGRESS REPORT OVERDUE STOP FUNDS UNDER REVIEW STOP.`
  },
  {
    id: 'aircraft',
    strand: 'news',
    text: `Two RAF biplanes pass low over the tell on their way to Hillah. The men wave. For an hour the world feels ordinary.`
  },
  {
    id: 'dealer',
    strand: 'news',
    after: { inspector: 3 },
    text: `A dealer from Hillah arrives with a donkey-load of “antiquities”. Most are fakes. Not all.`
  },
  {
    id: 'strike',
    strand: 'dread',
    after: { bones: 1.5 },
    text: `The diggers refuse to work Trench B. They say the earth is breathing. They are not wrong.`
  },
  {
    id: 'coffee',
    strand: 'talk',
    after: { wedding: 1.5 },
    text: `The village headman invites the expedition for coffee: bitter, cardamom, three cups by custom. Tongues loosen.`
  },
  {
    id: 'mirage',
    strand: 'dread',
    after: { shadows: 2 },
    text: `A mirage stands over the desert all morning: a city of seven tiers, its gates open.`
  },
  {
    id: 'cable',
    strand: 'news',
    text: `A cable from the British Museum, answering a question Crane sent in February. Someone in Bloomsbury has read a line from his squeeze of the temple foundation:`
  },
  {
    id: 'post',
    strand: 'news',
    text: `The post comes up from Hillah at last: a month of newspapers, and a letter from your sister, all about the weather in Kent.`
  },
  {
    id: 'doctor',
    strand: 'news',
    text: `The medical officer from Hinaidi stops at the camp on his rounds, looks at you over his spectacles, and opens his bag.`
  },
  {
    id: 'rain',
    strand: 'news',
    after: { bones: 2 },
    text: `Rain in the night, the first in months. By morning the spoil heaps have slumped, and the slope below Trench B is strewn with sherds washed clean.`
  },
  {
    id: 'inspector',
    strand: 'news',
    text: `An inspector from the Department of Antiquities arrives unannounced and counts the finds register twice.`
  },
  {
    id: 'tent',
    strand: 'dread',
    text: `Someone has been through your tent in the night. Nothing is missing that you can name, but your notebooks have been read, and put back in the wrong order.`
  },
  {
    id: 'lorry',
    strand: 'news',
    text: `The supply lorry from Baghdad gets through at last: tinned beef, paraffin, batteries, and three weeks of The Times.`
  },
  {
    id: 'dervish',
    strand: 'dread',
    text: `A wandering dervish stops at the camp, drinks a bowl of water, and blesses each tent in turn. At yours he stops, frowns, and blesses it twice.`
  },
  {
    id: 'quarrel',
    strand: 'talk',
    after: { song: 2 },
    text: `Two of the camp quarrel at breakfast, loudly, about nothing anyone can afterwards remember.`
  },
  {
    id: 'wedding',
    strand: 'talk',
    text: `A wedding in the village: drums all night, and in the morning the whole expedition is invited to eat.`
  },
  {
    id: 'bones',
    strand: 'dread',
    after: { wireless: 1.5, well: 1.5 },
    text: `The pickmen open a grave of men buried kneeling in a row, all of them facing the ziggurat. Among the bones lies a tablet.`
  },
  {
    id: 'wireless',
    strand: 'dread',
    text: `Between stations, the wireless picks up a voice reading out a list of names, slowly, in English. Yours is on it.`
  },
  {
    id: 'shadows',
    strand: 'dread',
    text: `At noon, for the space of a breath, E-meslam throws seven shadows, one from each of its stages, and all of them point the same way.`
  },
  {
    id: 'well',
    strand: 'dread',
    text: `The village well gives up water that tastes of copper and smoke. The headman says it did the same in his grandfather’s time, the summer the mound took a shepherd.`
  },
  {
    id: 'song',
    strand: 'talk',
    text: `The diggers have made up a song about the camp, and they sing it in the trench all morning.`
  }
];

const SLOT_NAMES = ['Morning', 'Afternoon', 'Evening'];
// the afternoon and the evening (the first light of a day is the season's mood's: data/tenor.js)
const SLOT_INTRO = {
  1: `The afternoon heat flattens everything. Even the flies are slow.`,
  2: `The light goes copper, then violet. Lamps are lit in the camp.`
};

const T = {
  chill: `As {n} speaks, the lamp gutters, and you feel a cold that has nothing to do with the night.`,
  distrust: [
    `“Watch {t}. I have seen a lamp go out to the mound after dark.”`,
    `“{t} knew Crane was dead before the runner came. Ask how.”`,
    `“{t} talks in sleep now, and not in any language I know.”`,
    `“{t} smiles too much. Since the tablets came up, {t} smiles too much.”`
  ],
  // the impressions of those who will not invent a fact (people/dialog.js)
  distrustVague: [
    `“I cannot give you a reason, Doctor. Only that I would not turn my back on {t}.”`,
    `“There is something about {t} since Crane died. I cannot put a name to it.”`,
    `“{t} smiles too much. Since the tablets came up, {t} smiles too much.”`
  ]
};

const STUDY_OK = [
  `By lamplight you work the signs out one by one, Anselm’s sign list propped against the lamp.`,
  `The wedges resolve into words. The words resolve into something you wish they had not.`
];
const STUDY_FAIL = [`The signs swim. After two hours you have a verb, a broken name, and a headache.`];
const STUDY_COST = [`When you blow out the lamp, the words keep going in the dark behind your eyes.`];
// a translation that costs you dearly; signs that would not come clear and cost you all the same; the words at night
const STUDY_COST_BAD = [
  `You read the last line twice, and the second time it reads you back. You do not remember putting out the lamp.`,
  `Somewhere in the third line your hand begins copying signs that are not on the clay. Stopping it takes a long time.`
];
const STUDY_FAIL_COST = [`You give it up near midnight, but the half-read signs go on rearranging themselves behind your eyes.`];
const WORDS_NIGHT = [
  `You dream in wedges. Someone reads to you all night, slowly, in a voice like a millstone, and when you wake your lips are still moving.`,
  `In the small hours you sit up and say four lines aloud before you know you are awake. You have never read them.`,
  `The lines you copied keep you company all night, saying themselves over in the dark.`
];
const EXAMINE_OK = [`You go over the ground on hands and knees, as you would a burial.`];
const EXAMINE_FAIL = [`The wind and the workmen have had the scene before you. Whatever it said, it says no longer.`];
const EXAMINE_THIEF = `Looking closer, that trace was made later, by someone rifling the scene for valuables. A thief’s, not the attacker’s.`;
const EXAMINE_STRAY = `Looking closer, that trace is older than the rest: the dust had settled on it before the struggle. Someone passed this way earlier. Not the attacker.`;

const GATES = {
  one: `Behind a loose brick panel at the foot of E-meslam, a stair goes down into the tell. The first gate is a doorway of baked brick stamped with a name you were warned never to read aloud.`,
  two: `At the fourth gate the walls are set with eyes of shell and lapis, the inlaid eyes of statues stolen long ago. They follow your light.`,
  seven: `At the seventh gate, as in the old poem, the gatekeeper asks a price. Something must be left behind.`
};

const ENDINGS = {
  exposed: {
    title: 'The Gate Unopened',
    text: [
      `With the last of them gone, the rite cannot be finished. The scorched circle at the foot of E-meslam cools and fades.`,
      `You fill in the stair with your own hands and write in the season’s report that Trench B “yielded little of interest”. Some nights you still count the Pleiades. There are seven. There are always seven.`
    ]
  },
  triumph: {
    title: 'The Sealing of Kutha',
    text: [
      `The ward holds. Something vast settles back into the dark like a sleeper rolling over, and the stair falls in behind you as you climb.`,
      `At dawn the tell is only a tell. You publish a careful monograph on Old Babylonian brick sizes and never dig again.`
    ]
  },
  pyrrhic: {
    title: 'What the Gate Kept',
    text: [
      `The rite breaks, but not cleanly. Fire and dust and screaming, and then a silence that goes on for a long time.`,
      `You climb out alone into a grey dawn. You write the season’s report yourself and leave out everything that was true.`
    ]
  },
  death: {
    title: 'Buried with the Kings',
    text: [
      `Your body is never found. The tell keeps you, as it keeps everything.`,
      `The British Museum records you as lost in “a collapse in Trench B”. Your notebooks are sent home to your sister unread.`
    ]
  },
  madness: {
    title: 'The Bethlem Tablets',
    text: [
      `They find you at dawn on the canal bank, pressing wedges into the wet clay with a reed.`,
      `You are shipped home to a quiet ward, where you fill notebook after notebook with signs nobody else can read. A visiting Assyriologist once read a page, and resigned the following week.`
    ]
  },
  doom: {
    title: 'The Long Night of Kutha',
    text: [
      `The rite completes. You see it rise: only the part of it that fits in the world, and that is enough.`,
      `When the RAF overflies Tell Ibrahim three days later, the pilots report a crater of glassy brick and a stair, going down.`
    ]
  }
};
