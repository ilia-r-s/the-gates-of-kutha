// ===================== THE ENDINGS' WORDS: nineteen stories, eight styles =====================
// (what became of everyone afterwards is in data/fates.js)
const END_IDS = [
  'unopened',
  'sealed',
  'banished',
  'emptied',
  'shot',
  'burned',
  'scarred',
  'fallen-night',
  'fallen-below',
  'bethlem',
  'canal',
  'counting',
  'doom-fire',
  'doom-dust',
  'doom-sea',
  'doom-teeth',
  'doom-plague',
  'doom-madness',
  'truck'
];
const END_OLD = {
  unopened: 'exposed',
  sealed: 'triumph',
  scarred: 'pyrrhic',
  'fallen-below': 'death',
  bethlem: 'madness',
  'doom-fire': 'doom'
};
const END_TITLES = {
  banished: ['The Last Word', 'Последнее слово'],
  emptied: ['The Empty Sanctum', 'Пустое святилище'],
  shot: ['One Shot in the Dark', 'Выстрел во тьме'],
  burned: ['Fire on the Mound', 'Огонь над холмом'],
  'fallen-night': ['Taken in the Night', 'Ночь забрала и вас'],
  canal: ['Clay and Reed', 'Глина и тростник'],
  counting: ['Two Hundred and Nine Steps', 'Двести девять ступеней'],
  'doom-dust': ['The Grey Country', 'Серая страна'],
  'doom-sea': ['The Salt Deep Rises', 'Солёная бездна поднимается'],
  'doom-teeth': ['The Cradle Rocks', 'Колыбель качается'],
  'doom-plague': ['None to Bury Them', 'Хоронить некому'],
  'doom-madness': ['The Sleepwalkers', 'Лунатики'],
  truck: ['The Truck to Hillah', 'Грузовик до Хиллы']
};

// ---------- the story ----------
const END_CALM = {
  fire: [
    'By noon the bricks of Trench B are as cold as any brick in March.',
    'К полудню кирпичи в траншее Б холодны, как и положено кирпичу в марте.'
  ],
  dust: [
    'By morning the owls have left Trench B, and the dust on the tents is only dust.',
    'К утру совы покидают траншею Б, и пыль на палатках — просто пыль.'
  ],
  sea: [
    'By noon the canal runs sweet again. The fishermen in the village do not ask why, and you do not tell them.',
    'К полудню вода в канале снова пресная. Деревенские рыбаки не спрашивают почему, а вы не рассказываете.'
  ],
  teeth: [
    'That morning, in the village, a woman gives birth to a loud, red, entirely ordinary child.',
    'Тем же утром в деревне женщина рожает громкого, красного, совершенно обыкновенного младенца.'
  ],
  plague: [
    'By evening the flies have gone from the camp, and in the village the sick are sitting up and asking for bread.',
    'К вечеру мухи покидают лагерь, а в деревне больные садятся в постели и просят хлеба.'
  ],
  madness: [
    'That night the whole camp sleeps without dreaming, and in the morning everyone answers to their own name.',
    'Той ночью весь лагерь спит без снов, а утром каждый откликается на своё имя.'
  ]
};
const END_TRACE = {
  fire: [
    'the canvas burned through in a dozen places, as if someone had pressed hot coins to it',
    'холст прожжён в десятке мест, будто к нему прикладывали раскалённые монеты'
  ],
  dust: ['an owl on the ridge-pole, and grey dust on the pillow', 'на коньке палатки сидит сова, и подушка седая от пыли'],
  sea: ['a pool of seawater beside it', 'рядом с ней стоит лужа морской воды'],
  teeth: ['around the cot, the prints of something like a lioness', 'вокруг койки — следы, похожие на львиные'],
  plague: [
    'the pillow black with flies, and a sweet smell inside, like a sickroom’s',
    'подушка черна от мух, и внутри стоит сладкий запах, как в комнате больного'
  ],
  madness: [
    'your shaving mirror turned to the wall, and your name written across the canvas again and again, backwards, in your own hand',
    'ваше зеркальце для бритья повёрнуто к стене, и по всему холсту снова и снова, задом наперёд, вашей же рукой написано ваше имя'
  ]
};
function endStory(id, how) {
  const E = ENDINGS,
    p = t => `<p>${t}</p>`,
    old = k => E[k].text.map(t => p(bi(t)));
  const f = S.fin,
    asp = S.aspectOf[S.patron],
    act = k => f && f.acts.find(a => a.kind === k && a.ok);
  switch (id) {
    case 'unopened':
      return old('exposed');
    case 'sealed': {
      const a = act('ward'),
        it = a ? a.it : S.wardOf[S.patron],
        [holds, after] = old('triumph');
      if (S.godOfWard[it] === S.patron)
        return [
          p(
            bi(
              `You raise ${theItem(it)} above your head, and the old binding remembers what it was made for.`,
              `Вы поднимаете над головой ${ru.item(it, 'a')}, и древнее заклятие вспоминает, ради чего его сотворили.`
            )
          ),
          holds,
          after
        ];
      // the wrong charm, now and then, and the rite breaks all the same (RULES.descent.wrongWard): no ward held
      return [
        p(
          bi(
            `You raise ${theItem(it)} above your head. ${V(it, 'It was', 'They were')} never made for what is here, and for a long moment nothing happens. Then the chant falters all the same, as if whatever was rising had simply lost interest in you.`,
            `Вы поднимаете над головой ${ru.item(it, 'a')}. Это никогда не делалось против того, что здесь, и долгое мгновение ничего не происходит. А потом пение всё же сбивается — будто то, что поднималось, просто потеряло к вам интерес.`
          )
        ),
        p(
          bi(
            'Something vast settles back into the dark like a sleeper rolling over, and the stair falls in behind you as you climb.',
            'Нечто огромное оседает обратно во тьму, как спящий, перевернувшийся на другой бок, и лестница обрушивается у вас за спиной, пока вы поднимаетесь.'
          )
        ),
        after
      ];
    }
    case 'banished': {
      const a = act('rite');
      if (a && a.g !== S.patron)
        // the counter-rite against the wrong power, and the rite breaks all the same (RULES.descent.wrongRite)
        return [
          p(
            bi(
              `You speak the counter-rite against ${GODS[a.g].name}, and it is the wrong name; you know it by the second line. You go on anyway. The chant falters, though nothing you say should have made it falter, and the last word is yours.`,
              `Вы читаете контробряд против ${ru.god(a.g, 'g')} — и это не то имя; вы понимаете это уже на второй строке. Но продолжаете. Пение сбивается, хотя ничто из сказанного вами не должно было его сбить, и последнее слово остаётся за вами.`
            )
          ),
          p(
            bi(
              'Something below lets go of the world, slowly, like a hand unclenching. You never find out why, and you never stop asking.',
              'Нечто внизу отпускает мир — медленно, как разжимается кулак. Почему, вы так и не узнаёте — и так и не перестаёте спрашивать.'
            )
          )
        ];
      return [
        p(
          bi(
            `You speak the counter-rite as the tablets taught you, every line in its place, and call ${GODS[S.patron].name} by the name the scribes used only when they were afraid. The chant falters. One by one the celebrants’ voices crack, and the last word is yours.`,
            `Вы читаете контробряд так, как научили таблички, — строку за строкой, ничего не упуская, — и зовёте ${ru.god(S.patron, 'a')} тем именем, которым писцы ${ru.gf(S.patron) ? 'её' : 'его'} называли, лишь когда им было страшно. Пение сбивается. Голоса служителей ломаются один за другим, и последнее слово остаётся за вами.`
          )
        ),
        p(
          bi(
            'Something below lets go of the world, slowly, like a hand unclenching. You climb out at dawn with the words still on your tongue, and for the rest of your life you never say them again, not even to yourself.',
            'Нечто внизу отпускает мир — медленно, как разжимается кулак. На рассвете вы выбираетесь наверх, и слова всё ещё лежат у вас на языке. До конца жизни вы больше ни разу их не произнесёте — даже про себя.'
          )
        )
      ];
    }
    case 'emptied': {
      // why the circle was empty: the last of them bound at the fourth gate, standing beside you and not going to it, gone
      // back up the stair when you sent them, or on the road to Hillah already, unmasked (game/inquiry.js)
      // (or dead by your own hand, the last of them to go: game/deed.js)
      const fin = S.fin || {},
        back = (fin.heldBack || []).filter(x => !(fin.stayedAway || []).includes(x))[0],
        away = (fin.stayedAway || [])[0],
        mine = S.order.map(C).find(c => c.role === 'cult' && c.takenBy === 'you'),
        lastUnmasked = Math.max(
          -1,
          ...S.log.accused.filter(a => a.right).map(a => a.day),
          ...(S.log.visit && S.log.visit.struck === 'failed' ? [S.log.visit.day] : [])
        ),
        buried = !!mine && mine.takenDay >= lastUnmasked,
        last = fin.caught
          ? bi(
              'the last voice it had is lying bound at the fourth gate, still murmuring a verse it will never reach.',
              'а последний голос, что у него был, лежит связанным у четвёртых врат и всё бормочет стих, до которого ему уже не дойти.'
            )
          : back
            ? bi(
                `the last voice it had is standing beside you at the edge of the light, and will not go to it.`,
                `а последний голос, что у него был, стоит рядом с вами на краю света и не идёт к нему.`
              )
            : away
              ? bi(
                  'the last voice it had was left behind on the stair, and has not come down.',
                  'а последний голос, что у него был, остался позади на лестнице и так и не спустился.'
                )
              : buried
                ? bi(
                    'the last voice it had is in the ground at Kutha, and you put it there.',
                    'а последний голос, что у него был, лежит в земле Куты — и положили его туда вы.'
                  )
                : bi(
                    'the last of its voices is on the road to Hillah under guard. It came this far on its own, and there is nobody to finish it.',
                    'а последний из его голосов едет под конвоем по дороге в Хиллу. Обряд зашёл так далеко сам по себе — и завершить его некому.'
                  );
      return [
        p(
          bi(
            'The seventh gate opens on an empty hall. The braziers burn for no one. A rite needs a voice to finish it, and ',
            'Седьмые врата открываются в пустой зал. Жаровни горят ни для кого. Обряду нужен голос, чтобы завершиться, '
          ) + last
        ),
        p(
          bi(
            'You put the braziers out one by one and wait in the dark until the brick goes quiet. When you climb out, the stars are paling, and the camp dogs have gone back to barking at ordinary things.',
            'Вы гасите жаровни одну за другой и ждёте в темноте, пока кирпич не затихнет. Когда вы выбираетесь наверх, звёзды уже бледнеют, а лагерные собаки снова лают на обычные вещи.'
          )
        )
      ];
    }
    case 'shot': {
      const a = act('shoot'),
        c = C(a ? a.id : S.hierophant);
      return [
        p(
          bi(
            `The shot is very loud in the old dark. ${c.short} folds over the brazier, and the chanting stops in the middle of a word. A rite is a sentence, and no one else down here knows how it ends.`,
            `Выстрел оглушительно гремит в древней тьме. ${ru.c(c)} складывается пополам над жаровней, и пение обрывается на полуслове. Обряд — это фраза, и никто больше здесь, внизу, не знает, чем она кончается.`
          )
        ),
        p(
          bi(
            `You climb out with the revolver still in your hand and one round fewer in it. There will be an inquest in Baghdad, and you will tell it the truth, or as much of the truth as a court can hear: that ${c.name} came at you in the dark, and you fired.`,
            `Вы выбираетесь наверх с револьвером в руке — в барабане на один патрон меньше. В Багдаде будет дознание, и вы расскажете правду — ту её часть, которую способен выслушать суд: ${ru.cf(c)} ${ru.gs(c, 'бросился', 'бросилась')} на вас в темноте, и вы выстрелили.`
          )
        )
      ];
    }
    case 'burned':
      return [
        p(
          bi(
            'You kick the braziers over into the bitumen. The fire runs up the walls as if it had only been waiting for leave, and the chant turns to screaming, and then to nothing.',
            'Вы опрокидываете жаровни в битум. Огонь взбегает по стенам, будто только и ждал позволения, и пение переходит в крик, а потом — в ничто.'
          )
        ),
        p(
          bi(
            'From the camp they watch E-meslam burn until noon. The bitumen in its old brick smoulders for three days, as it must have the night the old city fell. You came out of it. Nobody can say how, and you will not.',
            'Из лагеря видно, как Э-меслам горит до полудня. Битум в его древней кладке тлеет ещё три дня — так же, должно быть, как в ту ночь, когда пал древний город. Вы оттуда вышли. Как — не может сказать никто, а вы не скажете.'
          )
        )
      ];
    case 'scarred': {
      const a = how === 'ward' ? act('ward') : null,
        lead = a
          ? S.godOfWard[a.it] === S.patron
            ? bi(
                `${capS(theItem(a.it))} ${V(a.it, 'cracks', 'crack')} in your hand as the binding takes hold.`,
                `${ru.Item(a.it)} ${ru.ig(a.it, 'трескается', 'трескается', 'трескается', 'трескаются')} у вас в руке — но заклятие успевает схватиться.`
              )
            : // the wrong charm, and the rite broke all the same (RULES.descent.wrongWard)
              bi(
                `${capS(theItem(a.it))} ${V(a.it, 'cracks', 'crack')} in your hand and ${V(a.it, 'binds', 'bind')} nothing; but the chant falters all the same.`,
                `${ru.Item(a.it)} ${ru.ig(a.it, 'трескается', 'трескается', 'трескается', 'трескаются')} у вас в руке и ничего не ${ru.ig(a.it, 'сковывает', 'сковывает', 'сковывает', 'сковывают')} — но пение всё равно сбивается.`
              )
          : how === 'falter'
            ? bi(
                'You have nothing left to raise and nothing left to say. You stand in the light and watch, and on the very last line the hierophant’s voice cracks, and does not mend.',
                'Вам больше нечего поднять и нечего сказать. Вы стоите в круге света и смотрите — и на самой последней строке голос иерофанта срывается и уже не возвращается.'
              )
            : bi(
                'Your voice gives out on the last line, but the last line is spoken.',
                'На последней строке голос вам изменяет, но последняя строка произнесена.'
              );
      const g3 = S.fin.g3,
        with_ = loyal()
          .map(c => c.id)
          .concat(g3 && g3.kind === 'comp' && !g3.followed && C(g3.id).role !== 'cult' ? [g3.id] : []); // (and whoever held the seventh gate)
      return [
        p(lead + ' ' + bi(E.pyrrhic.text[0])),
        with_.length
          ? p(
              bi(
                `You climb out with ${listNames(with_.map(x => C(x).short))} into a grey dawn. You write the season’s report yourself and leave out everything that was true.`,
                `Вместе с ${ru.list(with_.map(x => ru.c(x, 'i')))} вы выбираетесь наверх, в серый рассвет. Отчёт за сезон вы пишете сами и опускаете в нём всё, что было правдой.`
              )
            )
          : p(bi(E.pyrrhic.text[1]))
      ];
    }
    case 'fallen-night': {
      // found by the friend who trusted you most, if one is left; else by the foreman, or a pickman
      const fr = S.order
          .map(C)
          .filter(c => isFree(c) && c.role !== 'cult' && c.rapport >= 2)
          .sort((x, y) => y.rapport - x.rapport)[0],
        hm = C('hamid'),
        who = fr ? [fr.short, ru.c(fr)] : isFree(hm) ? ['Hamid', 'Хамид'] : ['one of the pickmen', 'один из землекопов'],
        tr = END_TRACE[asp] || END_TRACE.fire,
        // (where they found you, only how the Museum put it: where they did not, the tell kept you)
        museum = p(bi(E.death.text[1]));
      // the one who came to your tent that evening (people/visit.js): she was of the cult and did it herself; or she
      // tried and you caught her wrist, but not her blade; or the cult came for you and found two of you
      const v = S.log.visit,
        h = v && v.day === S.day && C(v.id);
      if (h && S.hurtBy === 'visit')
        return [
          p(
            bi(
              `${h.name} came to your tent on that last evening, afraid, she said, that you might not see the light of day. She was one of them. In the small hours she did the cult’s work herself, quietly, and at breakfast she was the first to weep.`,
              `${capS(ru.cf(h))} пришла к вам в палатку в тот последний вечер — боялась, по её словам, что вы не увидите рассвета. Она была одной из них. Под утро она сама, тихо, сделала то, что было поручено культом, а за завтраком первой заплакала.`
            )
          ),
          museum
        ];
      if (h && S.hurtBy === 'wrist')
        return [
          p(
            bi(
              `${h.name} came to your tent on that last evening, and she was one of them. You caught her wrist in time, but not her blade. By the time the truck takes her away at first light, ${who[0]} is sitting by your cot, and then there is no need to sit there any longer.`,
              `${capS(ru.cf(h))} пришла к вам в палатку в тот последний вечер — и она была одной из них. Её запястье вы перехватили вовремя, но не её клинок. К тому времени, как на рассвете её увозит грузовик, у вашей койки уже сидит ${who[1]} — и потом сидеть там больше незачем.`
            )
          ),
          museum
        ];
      if (h && v.agreed && (v.through === 'you' || v.through === 'both'))
        return [
          p(
            v.through === 'you'
              ? bi(
                  `They come for you in the night, and find two of you in the tent. They take only you. ${h.short} lives to tell it, and for a long time does not tell it to anyone.`,
                  `Они приходят за вами ночью и находят в палатке двоих. Забирают только вас. ${ru.c(h)} остаётся жива, чтобы рассказать об этом, — и ещё очень долго никому не рассказывает.`
                )
              : bi(
                  `They come for you in the night, and find two of you in the tent. In the morning ${who[0]} finds your tent torn open and the two of you on the cot, and ${tr[0]}.`,
                  `Они приходят за вами ночью и находят в палатке двоих. Утром ${who[1]} находит вашу палатку распоротой, вас обоих — на койке, а ${tr[1]}.`
                )
          )
        ].concat(v.through === 'you' ? old('death') : [museum]);
      // the night you went out yourself (game/deed.js): whoever you went for woke, and fought
      const d = S.log.deed;
      if (S.hurtBy === 'deed' && d) {
        const t = C(d.id);
        return [
          p(
            bi(
              `You went to ${t.name}’s tent in the small hours, and ${t.short} woke, and fought. The cut does not look like much by lamplight. By morning it has gone bad, as wounds do out here, and before noon ${who[0]} is sitting by your cot, and then there is no need to sit there any longer.`,
              `Под утро вы пошли к палатке ${ru.cf(t, 'g')}, а ${ru.c(t)} ${ru.gs(t, 'проснулся', 'проснулась')} и ${ru.gs(t, 'дрался', 'дралась')}. При свете лампы порез кажется пустяком. К утру рана воспаляется, как это здесь бывает, а до полудня у вашей койки уже сидит ${who[1]} — и потом сидеть там больше незачем.`
            )
          ),
          museum
        ];
      }
      // not always the cult: the dig itself, or someone in the camp who could not stand you (game/hazards.js)
      if (S.hurtBy === 'peril' || S.hurtBy === 'spite')
        return [
          p(
            S.hurtBy === 'peril'
              ? bi(
                  `In the end it is not the cult that kills you, but the dig. The wound goes bad, as wounds do out here; by midnight you are burning, and before dawn ${who[0]} is sitting by your cot, and then there is no need to sit there any longer.`,
                  `В конце концов вас убивает не культ, а сами раскопки. Рана воспаляется, как это здесь бывает; к полуночи вы горите в жару, а перед рассветом у вашей койки сидит ${who[1]} — и потом сидеть там больше незачем.`
                )
              : bi(
                  `In the end it is not the cult that kills you. Someone in the camp who could not stand you does you one harm too many in the night, and the cult has only to wait. In the morning ${who[0]} finds you, and the camp agrees that nobody saw anything.`,
                  `В конце концов вас убивает не культ. Кто-то в лагере, кто вас не выносил, причиняет вам ночью ещё один, последний вред, и культу остаётся только ждать. Утром вас находит ${who[1]}, и лагерь сходится на том, что никто ничего не видел.`
                )
          ),
          museum
        ];
      return [
        p(
          bi(
            `They come for you in the night, and this time nothing stands between you and them. In the morning ${who[0]} finds your tent torn open, your cot empty, and ${tr[0]}.`,
            `Они приходят за вами ночью, и на этот раз между вами и ними никого нет. Утром ${who[1]} находит вашу палатку распоротой, койку — пустой, а ${tr[1]}.`
          )
        )
      ].concat(old('death'));
    }
    case 'fallen-below':
      return [p(fallBelow())].concat(old('death'));
    case 'bethlem':
      return [
        p(
          bi(
            'It is the tablets that do it in the end. One evening the wedges stop turning into words and start turning into you, and by dawn you have filled the margins of Crane’s diary with lines nobody taught you.',
            'В конце концов вас доконали таблички. Однажды вечером клинья перестают складываться в слова и начинают складываться в вас, и к рассвету поля дневника Крейна исписаны строками, которым вас никто не учил.'
          )
        ),
        p(bi(E.madness.text[1]))
      ];
    case 'canal':
      return [
        p(bi(E.madness.text[0])),
        p(
          bi(
            'You have written a hundred yards of the bank, and the water has not touched a line. You do not know any of the people who lead you away, though they all seem to know you. In Baghdad they call it sunstroke.',
            'Вы исписали берег на сотню ярдов, и вода не тронула ни строки. Вы не узнаёте никого из тех, кто уводит вас прочь, хотя вас, похоже, знают все. В Багдаде это называют солнечным ударом.'
          )
        )
      ];
    case 'counting':
      return [
        p(
          bi(
            'Somewhere below, between one gate and the next, you start counting the steps, and you cannot stop. Two hundred and nine down. Two hundred and nine up. Two hundred and nine down.',
            'Где-то внизу, между одними вратами и другими, вы начинаете считать ступени — и уже не можете остановиться. Двести девять вниз. Двести девять вверх. Двести девять вниз.'
          )
        ),
        p(
          bi(
            'The pickmen find you at noon, sitting on the lowest step with your lamp long out, counting. You thank them very politely and ask them not to interrupt; you are nearly at the end. In the hospital at Hillah you are still counting, and the number has grown.',
            'Землекопы находят вас в полдень: вы сидите на нижней ступени, лампа давно погасла, и вы считаете. Вы очень вежливо благодарите их и просите не перебивать — вы почти дошли до конца. В больнице в Хилле вы всё ещё считаете, и число стало больше.'
          )
        )
      ];
  }
  // sent away by the camp for what you did, or tried to do, in the night (game/deed.js)
  if (id === 'truck') {
    const d = S.log.deed,
      t = C(d.id),
      left = freeCult().length; // (of the cult still at the dig when you go)
    return [
      p(
        bi(
          'The camp puts you on the truck to Hillah at noon, under the eye of a police corporal who will not look at you, with your notebooks in a sack at your feet. Nobody waves.',
          'В полдень лагерь сажает вас в грузовик до Хиллы под присмотром полицейского капрала, который старается на вас не смотреть; записные книжки лежат в мешке у ваших ног. Никто не машет вам вслед.'
        )
      ),
      p(
        d.outcome === 'killed'
          ? t.role === 'cult'
            ? bi(
                `In Baghdad they try you for the murder of ${t.name}. The court hears a great deal about cults and seven gates, believes none of it, and finds against you, with a recommendation to mercy on account of the heat. Nobody ever searches ${t.short}’s kit.`,
                `В Багдаде вас судят за убийство ${ru.cf(t, 'g')}. Суд долго слушает про культы и семь врат, не верит ни слову и выносит вам обвинительный приговор, рекомендуя снисхождение по причине жары. Вещи ${ru.cf(t, 'g')} так никто и не обыскивает.`
              )
            : bi(
                `In Baghdad they try you for the murder of ${t.name}, and they are right to. You say very little in your own defence. There is not much to say.`,
                `В Багдаде вас судят за убийство ${ru.cf(t, 'g')} — и судят по праву. В свою защиту вы говорите очень мало. Сказать почти нечего.`
              )
          : bi(
              `For what you tried to do to ${t.name}, the Trustees dismiss you by telegram, and the police in Baghdad are content to see you onto a ship.`,
              `За то, что вы пытались сделать с ${ru.cf(t, 'i')}, Попечители увольняют вас телеграммой, а багдадская полиция довольствуется тем, что провожает вас на пароход.`
            )
      ),
      p(
        left
          ? bi(
              'Behind you the camp goes on without you for the nights that are left. On the last of them the moon is dark.',
              'Лагерь живёт без вас те ночи, что ещё остались. В последнюю из них наступает новолуние.'
            )
          : bi(
              'Behind you, on the night the moon is dark, nothing at all happens at Kutha. Nobody ever tells you why.',
              'А в Куте, в ночь новолуния, не происходит ровным счётом ничего. Почему — вам так никто и не объяснит.'
            )
      )
    ];
  }
  // the rite completes: what rises depends on what it is
  // (with nobody of the cult left in the circle, it finished itself: game/finale.js, sanctum)
  const out =
    f && f.empty
      ? [
          p(
            bi(
              'Nobody of the cult was left to finish the rite, and it finished itself. It had come too far to need a voice.',
              'Из секты не осталось никого, кто довершил бы обряд, — и он довершил себя сам. Он зашёл слишком далеко, чтобы нуждаться в голосе.'
            )
          )
        ]
      : f && f.early
        ? [
            p(
              bi(
                'The rite never needed the dark of the moon. It needed only to be left alone long enough, and it was.',
                'Обряду вовсе не было нужно новолуние. Ему нужно было лишь, чтобы его достаточно долго не трогали, — и его не тронули.'
              )
            )
          ]
        : [];
  if (id === 'doom-fire')
    return out.concat([
      p(
        bi(E.doom.text[0]) +
          ' ' +
          bi(
            'Seven stars come down to meet it, low enough to set the palms alight, and the plain bakes like a kiln.',
            'Семь звёзд спускаются ему навстречу — так низко, что вспыхивают пальмы, — и равнина обжигается, как печь.'
          )
      ),
      p(bi(E.doom.text[1]))
    ]);
  if (id === 'doom-dust')
    return out.concat([
      p(
        bi(
          'The rite completes. The dust comes up the stair first, then the owls, then the dead of every grave between Kutha and Babylon, walking north with their mouths full of clay.',
          'Обряд свершается. Первой по лестнице поднимается пыль, за ней — совы, а за ними — мертвецы из всех могил между Кутой и Вавилоном; они идут на север, и рты у них набиты глиной.'
        )
      ),
      p(
        bi(
          'By morning every door between the two rivers stands open. The aircraft sent out from Hinaidi report the villages empty and the roads full of grey walkers who do not look up at the engines.',
          'К утру все двери между двумя реками стоят настежь. Самолёты, высланные из Хинайди, докладывают: деревни пусты, а дороги полны серых путников, которые даже не поднимают голов на гул моторов.'
        )
      )
    ]);
  if (id === 'doom-sea')
    return out.concat([
      p(
        bi(
          'The rite completes. The black water comes up the stair a step at a time, patient as a tide, and then it is not a stair any more.',
          'Обряд свершается. Чёрная вода поднимается по лестнице ступень за ступенью, терпеливо, как прилив, — и вот это уже не лестница.'
        )
      ),
      p(
        bi(
          'By the next new moon the Euphrates runs salt as far as Hillah. Pilots out of Hinaidi report a lake where Kutha stood, the top of E-meslam standing out of it like an island, and something very large turning slowly beneath.',
          'К следующему новолунию Евфрат солонеет до самой Хиллы. Лётчики из Хинайди докладывают об озере на месте Куты: вершина Э-меслама торчит из воды, как остров, а под ней медленно поворачивается что-то очень большое.'
        )
      )
    ]);
  if (id === 'doom-plague')
    return out.concat([
      p(
        bi(
          'The rite completes. The clay on the fifty-nine sealed jars cracks all together, and the flies pour out of them and go up the stair like smoke up a chimney.',
          'Обряд свершается. Глина на пятидесяти девяти запечатанных кувшинах трескается разом, и мухи валят из них и уходят вверх по лестнице, как дым в трубу.'
        )
      ),
      p(
        bi(
          'By the next new moon there is sickness in every village between the two rivers, sixty kinds of it, and the doctors can put a name to none of them. The medical officer from Hinaidi drives out with a lorry-load of carbolic and does not come back. The men sent after him find the lanes empty, the dead laid out in rows before the doors, and none to bury them.',
          'К следующему новолунию по всем деревням между двумя реками гуляет мор — шестьдесят хворей, и ни одной из них врачи не могут назвать. Военный врач из Хинайди выезжает туда с грузовиком карболки и не возвращается. Посланные за ним находят улицы пустыми, мёртвых — уложенными рядами у дверей, а хоронить их некому.'
        )
      )
    ]);
  if (id === 'doom-madness')
    return out.concat([
      p(
        bi(
          'The rite completes. In the bronze walls your reflections stop laughing, all at once; then they step out of the mirrors and go up the stair without you, and not one of them looks back.',
          'Обряд свершается. В бронзовых стенах ваши отражения разом перестают смеяться, а потом выходят из зеркал и уходят вверх по лестнице без вас, и ни одно не оглядывается.'
        )
      ),
      p(
        bi(
          'By morning nobody in the camp can remember their own name. By the new moon every clock between the two rivers has stopped at twenty past three, and the last pilot to come back from over Baghdad reports the streets full of people in their nightclothes, standing quite still with their eyes open, smiling at something only they can see.',
          'К утру никто в лагере не может вспомнить собственного имени. К новолунию все часы между двумя реками стоят на двадцати минутах четвёртого, а последний лётчик, вернувшийся из полёта над Багдадом, докладывает: улицы полны людей в ночных рубашках — они стоят не шелохнувшись, с открытыми глазами и улыбаются чему-то, что видно только им.'
        )
      )
    ]);
  return out.concat([
    p(
      bi(
        'The rite completes. The empty cradle stops rocking, because it is not empty any more.',
        'Обряд свершается. Пустая колыбель перестаёт качаться — потому что она больше не пуста.'
      )
    ),
    p(
      bi(
        'That spring no child is born alive in the villages along the canal. The midwives hang bronze heads over every door and leave combs and spindles on the thresholds, and in the mornings the combs are gone. The Health Service in Baghdad calls it an epidemic and sends quinine.',
        'Той весной в деревнях вдоль канала не рождается ни одного живого ребёнка. Повитухи вешают над каждой дверью бронзовые головы и оставляют на порогах гребни и веретёна, а по утрам гребней уже нет. Санитарная служба в Багдаде объявляет эпидемию и присылает хинин.'
      )
    )
  ]);
}

// How the tell kept you: by what hurt you last below (S.fin.cause).
function fallBelow() {
  const f = S.fin || {},
    t = f.betrayed && f.betrayed.length ? C(f.betrayed[f.betrayed.length - 1]) : null;
  if (f.cause === 'knife' && t)
    return bi(
      `${t.short}’s knife does its work slowly. You sit down on the threshold of the fourth gate to rest a moment, and the eyes in the walls watch you do it.`,
      `Нож ${ru.c(t, 'g')} делает своё дело не спеша. Вы присаживаетесь на порог четвёртых врат — передохнуть минутку, — и глаза в стенах смотрят, как вы садитесь.`
    );
  if (f.cause === 'stair')
    return bi(
      'The step that was not there is the last thing you are sure of. After that there is only the stair, going on down without you.',
      'Ступень, которой не оказалось на месте, — последнее, в чём вы уверены. Дальше — только лестница, уходящая вниз уже без вас.'
    );
  if (f.cause === 'grip' || f.cause === 'passage')
    return bi(
      'What took hold of you in the dark does not let go. You feel it draw you, quite gently, toward a door you had not seen.',
      'То, что схватило вас в темноте, не отпускает. Вы чувствуете, как оно — почти бережно — тянет вас к двери, которой вы прежде не замечали.'
    );
  if (f.cause === 'fire')
    return bi(
      'The burn does not stop at the skin. It goes on down into you, step by step, the way the stair went down into the tell, and at the bottom of it there is no more of you.',
      'Ожог не останавливается на коже. Он уходит вглубь вас, ступень за ступенью, как лестница уходила в глубь холма, — и на дне его вас уже нет.'
    );
  if (f.cause === 'wing')
    return bi(
      'The stone wing does not lift again. Under it the dark is very close and very heavy, and after a while it is all there is.',
      'Каменное крыло больше не поднимается. Под ним тьма совсем близко и очень тяжела — и вскоре, кроме неё, ничего не остаётся.'
    );
  if (f.cause === 'rite')
    return bi(
      'The rite closes over what you did, and over you. The last thing you see is the celebrants stepping aside to make room for you in the circle.',
      'Обряд смыкается над тем, что вы сделали, — и над вами. Последнее, что вы видите: служители расступаются, освобождая вам место в круге.'
    );
  return bi(
    'Somewhere between the gates your lamp goes out. You do not feel the brick close over you; you feel only that the dark has become very patient.',
    'Где-то между вратами гаснет ваша лампа. Вы не чувствуете, как над вами смыкается кирпич, — чувствуете лишь, что тьма стала очень терпеливой.'
  );
}

// ---------- the way you went about it ----------
const END_STYLE = {
  // the one who went out in the dark and settled it themselves (game/deed.js)
  avenger: {
    name: ['The Avenger', 'Мститель'],
    win: [
      'In the end you did what no inquiry would: you went out in the dark and settled it yourself. It worked, or something did. You will spend the rest of your life not quite sure which, and not quite sure it was you who went.',
      'В конце концов вы сделали то, на что не решилось бы ни одно дознание: вышли в темноту и решили всё сами. Это сработало — или сработало что-то другое. Всю оставшуюся жизнь вы так и не будете до конца уверены, что именно, — и что в ту ночь к палатке шли именно вы.'
    ],
    lose: [
      'You took it into your own hands at Kutha, and found out how little a pair of hands can hold.',
      'В Куте вы взяли всё в свои руки — и узнали, как мало способна удержать пара рук.'
    ]
  },
  inquisitor: {
    name: ['The Inquisitor', 'Инквизитор'],
    win: [
      'You did it the hard way: questions that left marks, accusations made out loud, never once looking away. It worked. Nobody who was at Kutha will ever be quite comfortable in a room with you again, and you find you can live with that.',
      'Вы шли напролом: вопросы, после которых оставались синяки, обвинения вслух, ни разу не отведённый взгляд. И это сработало. Никому из тех, кто был в Куте, уже не будет по-настоящему уютно в одной комнате с вами, — и вы обнаруживаете, что с этим можно жить.'
    ],
    lose: [
      'You pushed at every door in Kutha, and in the end one of them pushed back.',
      'В Куте вы толкали каждую дверь — и в конце концов одна из них толкнула в ответ.'
    ]
  },
  quiet: {
    name: ['The Quiet Guest', 'Тихий гость'],
    win: [
      'You never raised your voice at Kutha. You kept your lamp low, your counsel to yourself and your hand off the table, and when the time came you were the last thing the rite was watching for.',
      'В Куте вы ни разу не повысили голоса. Вы не поднимали лампу, держали мысли при себе и не открывали карт — и когда настал час, обряд меньше всего ждал удара именно от вас.'
    ],
    lose: [
      'You waited for certainty at Kutha. It does not come to people who wait for it.',
      'В Куте вы ждали уверенности. Она не приходит к тем, кто её ждёт.'
    ]
  },
  scholar: {
    name: ['The Scholar', 'Книжник'],
    win: [
      'You beat it with grammar. Long nights over the tablets, the lamp turned low, the sign list propped against the inkpot: in the end you knew its name and its nature better than the people who served it.',
      'Вы одолели его грамматикой. Долгие ночи над табличками, привёрнутая лампа, список знаков, прислонённый к чернильнице, — в конце концов вы знали его имя и природу лучше тех, кто ему служил.'
    ],
    lose: [
      'You read more of the old words than anyone alive. Some of them, it turns out, were reading you.',
      'Вы прочли больше древних слов, чем кто-либо из живущих. Некоторые из них, как выяснилось, читали вас.'
    ]
  },
  sleuth: {
    name: ['The Detective', 'Сыщик'],
    win: [
      'You solved Kutha the way one solves a murder at a country house: footprints, cigarette ends, who was where at midnight and who says so. Scotland Yard would have been proud of you. Scotland Yard would not have believed a word of the rest.',
      'Вы раскрыли Куту так, как раскрывают убийство в загородной усадьбе: отпечатки подошв, окурки, кто где был в полночь и кто это подтвердит. Скотленд-Ярд гордился бы вами. Правда, всему остальному Скотленд-Ярд не поверил бы ни на слово.'
    ],
    lose: [
      'You read every footprint on the tell. The thing beneath it does not leave footprints.',
      'Вы прочли каждый след на холме. А то, что под ним, следов не оставляет.'
    ]
  },
  delver: {
    name: ['The Digger', 'Копатель'],
    win: [
      'You trusted the earth more than the people standing on it, and the earth repaid you. Half the season’s finds register is in your hand, and the most important find of all is not in it.',
      'Земле вы доверяли больше, чем людям, что по ней ходят, — и земля отплатила вам. Половина описи находок за сезон написана вашей рукой, а самой важной находки в ней нет вовсе.'
    ],
    lose: [
      'You dug where Crane told you not to, and then deeper. The tell gave you everything you asked for.',
      'Вы копали там, где Крейн велел не копать, — а потом ещё глубже. Телль дал вам всё, о чём вы просили.'
    ]
  },
  confidant: {
    name: ['The Confidant', 'Наперсник'],
    win: [
      'You won Kutha one conversation at a time: cups of coffee, confidences given and returned, the long talks after supper. When it mattered, the people you had trusted stood with you, and the ones you should not have trusted had long since given themselves away.',
      'Вы выиграли Куту разговор за разговором: чашки кофе, доверие за доверие, долгие беседы после ужина. Когда пришёл час, те, кому вы поверили, встали рядом с вами, а те, кому верить не следовало, давно уже себя выдали.'
    ],
    lose: [
      'You trusted the people of Kutha, and most of them deserved it. Most was not enough.',
      'Вы доверились людям Куты, и большинство из них этого заслуживало. Большинства оказалось мало.'
    ]
  },
  director: {
    name: ['The Field Director', 'Начальник раскопок'],
    win: [
      'You ran Kutha the way Crane ought to have: a little of everything, nothing to excess, and an eye on all of it. Nobody will ever write a book about how you did it, which is exactly how you wanted it.',
      'Вы вели Куту так, как следовало бы вести её Крейну: всего понемногу, ничего сверх меры — и за всем зоркий глаз. Никто никогда не напишет книгу о том, как вам это удалось, — ровно так, как вы и хотели.'
    ],
    lose: [
      'You did a little of everything at Kutha, and none of it was quite enough.',
      'В Куте вы делали всего понемногу — и ничего из этого не хватило.'
    ]
  }
};
