// ===================== THE FINALE: the descent and the rite =====================
// On the fifth night (or sooner, if the rite outruns you): name the power, choose who comes, pass the gates (the first,
// the fourth, the seventh, and what waits between them: game/below.js), and stop the rite with a ward, the counter-rite,
// a bullet or fire. No choice down here shows its odds: only what it risks.
const DESC = () => bi('The descent', 'Спуск');
// early: the rite outran you; why: 'priestless' when it came too far to die with the last of its priests (game/inquiry.js)
function finaleIntro(early, why = null) {
  const atNight = S.phase === 'night'; // (the last of the cult unmasked in the night, and the gate opened of itself)
  S.phase = 'finale';
  S.slot = 2;
  S.fin = {
    early,
    why,
    named: null,
    comp: [],
    left: [],
    tries: 0,
    betrayed: [],
    turned: [],
    heldBack: [],
    acts: [],
    enc: [],
    favour: 0,
    g1: null,
    g2: null,
    g3: null
  };
  S.order.map(C).forEach(fixMark); // below, the truth comes out: your marks stand as they were when you went down
  const body =
    why === 'priestless'
      ? [
          `<p class="horror">${bi('A stair goes down out of the split circle, breathing hot air that smells of old brick. Below, something is still chanting, though nobody is left to chant.', 'Из расколотого круга вниз уходит лестница, и снизу тянет горячим воздухом, пахнущим старым кирпичом. Внизу всё ещё что-то поёт, хотя петь уже некому.')}</p>`
        ]
      : early
        ? [
            `<p class="horror">${bi('The rite has outpaced you. Before dawn the scorched circle at the foot of E-meslam splits open, and a stair breathes up hot air that smells of old brick.', 'Обряд опередил вас. Перед рассветом выжженный круг у подножия Э-меслама раскалывается, и снизу, по ступеням, поднимается горячий воздух, пахнущий старым кирпичом.')}</p>`
          ]
        : [
            `<p>${bi('The fifth night is the dark of the moon. The camp is silent. A lamp is moving on the ziggurat, then it is gone, into the mound.', 'Пятая ночь — новолуние. Лагерь безмолвен. По зиккурату движется огонёк лампы — и исчезает, уходя в холм.')}</p>`
          ];
  body.push(
    `<p>${bi('Before you go down, you must decide what you are facing. Name the power behind the cult, and the old words and wards may answer you.', 'Прежде чем спуститься, решите, с чем вы имеете дело. Назовите силу, что стоит за культом, — и древние слова и обереги, быть может, отзовутся.')}</p>`
  );
  show({
    kicker:
      why === 'priestless'
        ? atNight
          ? bi(`Night ${S.day} · The gate opens`, `Ночь ${S.day} · Врата отворяются`)
          : bi(`Day ${S.day} · The gate opens`, `День ${S.day} · Врата отворяются`)
        : early
          ? bi(`Night ${S.day} · The gate opens`, `Ночь ${S.day} · Врата отворяются`)
          : bi(`Night ${RULES.start.days} · The dark of the moon`, `Ночь ${RULES.start.days} · Новолуние`),
    title: DESC(),
    body,
    choices: S.gods
      .map(g => ({
        label: bi(`Name ${GODS[g].name}`, `Назвать имя: ${ru.god(g)}`),
        sub: bi(GODS[g].title),
        fn: () => {
          S.fin.named = g;
          companionScene();
        }
      }))
      .concat([
        {
          label: bi('Name no power', 'Не называть никого'),
          sub: bi('Go down blind', 'Спуститься вслепую'),
          cls: 'minor',
          fn: companionScene
        }
      ])
  });
  emit('descent');
}
// Who comes with you: up to two. Some offer before you ask (a friend, mostly; or one of the cult, who looks no different:
// people/cunning.js, volunteers); some you ask will not come, or come though they would rather not (willCome).
function companionScene(said) {
  const f = S.fin;
  f.refused = f.refused || [];
  if (!f.offered) {
    f.offered = volunteers();
    said = (said || '') + f.offered.map(id => `<p>${pick(OFFER_SAY)(C(id))}</p>`).join('');
  }
  const avail = freeChars().filter(c => !f.comp.includes(c.id) && !f.refused.includes(c.id));
  const n = f.comp.length;
  if (!avail.length || n >= 2) {
    if (said)
      show({
        kicker: DESC(),
        title: bi('Who comes with you?', 'Кто пойдёт с вами?'),
        body: [said],
        choices: [{ label: bi('Go down', 'Спускаться'), fn: gate1 }]
      });
    else gate1();
    return;
  }
  const ask = c => {
    const w = willCome(c);
    if (!w.ok) f.refused.push(c.id);
    else f.comp.push(c.id);
    companionScene(comeSay(c, w));
  };
  const ch = avail
    .slice()
    .sort((a, b) => f.offered.includes(b.id) - f.offered.includes(a.id))
    .map(c => ({
      label: bi(`Take ${c.name}`, `Взять с собой ${ru.cf(c, 'a')}`),
      sub: () =>
        (f.offered.includes(c.id) ? bi('Offers to come · ', 'Вызывается идти · ') : '') + (markSay(c) || bi('Unmarked', 'Без отметки')),
      fn: () => ask(c)
    }));
  ch.push({ label: n ? bi('No one else', 'Больше никого') : bi('Go down alone', 'Спуститься в одиночку'), cls: 'minor', fn: gate1 });
  show({
    kicker: DESC(),
    title: n ? bi('One more?', 'Кто-нибудь ещё?') : bi('Who comes with you?', 'Кто пойдёт с вами?'),
    body: [
      (said || '') +
        `<p>${n ? bi(C(f.comp[0]).short + ' is lacing up boots and checking a lamp. Do you want anyone else?', `${ru.c(f.comp[0])} зашнуровывает ботинки и проверяет лампу. Взять ещё кого-нибудь?`) : bi('You can take up to two people down. Loyal company makes every step safer. A cultist at your back will betray you, sooner or later. Not everyone will follow you.', 'С собой можно взять не больше двоих. С верными спутниками каждый шаг безопаснее. Сектант за спиной рано или поздно вас предаст. И не каждый согласится пойти за вами.')}</p>`
    ],
    choices: ch
  });
}
// who is still with you below: whoever came down and was not left behind (the cult among them, if it came); and of
// them, those who are what they seem
const withYou = () => S.fin.comp.filter(id => !S.fin.left.includes(id));
function loyal() {
  return withYou()
    .map(C)
    .filter(c => c.role !== 'cult');
}
function gateBonus() {
  return RULES.descent.companion * loyal().length + (has('torch') ? RULES.descent.torch : 0);
}
// what a step that goes wrong costs (RULES.descent.cost), as the lines that say so; a nerve more if it was a way the
// power below will not abide (ways: game/below.js)
const costOf = (k, ways = []) => hurt(dearer(RULES.descent.cost[k][0], ways), RULES.descent.cost[k][1]);
function stepOn(html, next) {
  S.phase = 'descent';
  if (checkEnd()) return;
  show({ kicker: DESC(), title: bi('Below', 'Внизу'), body: [html], choices: [{ label: bi('Go on', 'Дальше'), fn: next }] });
}
// A step of the way down, taken one way or the other (S.fin[key] = val): it goes well, as the trials below do (base, and
// the ways it is taken in: game/below.js), or it costs you (RULES.descent.cost[cost]); cause: what to blame, should it
// end you. ok and fail are the words, each [English, Russian]. The odds are as they stand when the gate comes.
function riskStep({ key, val, base, ways, cost, cause, ok, fail }, next) {
  const p = trialP(base, ways, gateBonus());
  return () => {
    S.fin[key] = val;
    if (chance(p)) return stepOn(`<p>${bi(...ok)}</p>`, next);
    if (cause) S.fin.cause = cause;
    stepOn(`<p class="horror">${bi(...fail)}</p>` + costOf(cost, ways), next);
  };
}
function gate1() {
  S.phase = 'descent';
  S.fin.took = S.fin.comp.slice(); // who went down with you, whatever became of them below
  const comp = S.fin.comp.map(c => C(c).short),
    compRu = S.fin.comp.map(c => ru.c(c));
  // lamps behind you on the stair: each companion steadies you a little, whatever they are
  const lamps = comp.length
    ? bi(
        `<p>${comp.length > 1 ? 'Their lamps light' : 'A second lamp lights'} the stair at your back, and your hands are steadier.</p>`,
        `<p>${comp.length > 1 ? 'Их лампы освещают' : 'Вторая лампа освещает'} лестницу у вас за спиной, и руки уже не так дрожат.</p>`
      ) + nerveNote(regain(RULES.descent.company * comp.length))
    : '';
  const next = () => between('early', [2, 3], gate2);
  show({
    kicker: DESC(),
    title: bi('The first gate', 'Первые врата'),
    body: [
      bi(
        `<p>${comp.length ? 'With ' + listNames(comp) + ' behind you, you' : 'Alone, you'} cross the dark tell to the ziggurat.</p>`,
        `<p>${comp.length ? `Вы пересекаете тёмный холм и идёте к зиккурату; следом ${compRu.length > 1 ? 'идут' : 'идёт'} ${ru.list(compRu)}.` : 'В одиночку вы пересекаете тёмный холм и идёте к зиккурату.'}</p>`
      ) +
        lamps +
        `<p>${bi(GATES.one)}</p>`
    ],
    choices: [
      {
        label: bi('Go down slowly, feeling for each step', 'Спускаться медленно, нащупывая каждую ступень'),
        sub: bi('Careful; a bad step costs nerve', 'Осторожно; оступитесь — пострадают нервы'),
        fn: riskStep(
          {
            key: 'g1',
            val: 'slow',
            base: RULES.descent.stairSlow,
            ways: ['patience'],
            cost: 'slowStair',
            ok: [
              'Step by step, count by count. Two hundred and nine steps. You do not let yourself wonder who cut them.',
              'Ступень за ступенью, счёт за счётом. Двести девять ступеней. Вы запрещаете себе думать о том, кто их вырубил.'
            ],
            fail: [
              'Halfway down, the steps begin to feel soft, like the treads are breathing.',
              'На полпути ступени становятся мягкими, будто дышат.'
            ]
          },
          next
        )
      },
      {
        label: bi('Hurry down before your nerve fails', 'Сбежать вниз, пока не сдали нервы'),
        sub: bi('Quick; a bad step, and you fall', 'Быстро; оступитесь — упадёте'),
        fn: riskStep(
          {
            key: 'g1',
            val: 'hurry',
            base: RULES.descent.stairFast,
            ways: ['haste'],
            cost: 'fastStair',
            cause: 'stair',
            ok: [
              'You take the stair at a run and reach the bottom with your heart hammering, but whole.',
              'Вы сбегаете по лестнице и добираетесь до низа — сердце колотится, но вы целы.'
            ],
            fail: ['A step is not there. You fall a long way in the dark.', 'Ступени на месте не оказывается. Вы долго падаете в темноту.']
          },
          next
        )
      }
    ]
  });
}
// The fourth gate. A cultist among your companions makes their move here, or, if clever enough, lets it pass and waits
// for the very end (game/finale.js, sanctum); otherwise the walls are all eyes.
function gate2() {
  S.phase = 'descent';
  const cult = withYou()
      .map(C)
      .filter(c => c.role === 'cult' && isFree(c)),
    striker = cult.find(c => !waits(c)); // (each of them in turn: strike now, or let it pass and wait for the end)
  const next = () => between('late', [5, 6], gate3);
  if (striker) gate2Traitor(striker, next);
  else gate2Eyes(next);
}
// A cultist behind you on the stair: turn and face them, or keep walking and listen (you are less likely to catch them,
// but you hear the knife coming, and it costs you less). Your companions, a torch, the occultist's sense and your own
// suspicion all help (the more for having singled them out: one of only a few you marked a suspect).
function gate2Traitor(t, next) {
  const D = RULES.descent,
    foes = S.order.filter(id => markOf(C(id)) === 'foe').length,
    p = clamp(
      D.traitor +
        (has('torch') ? D.traitorTorch : 0) +
        (S.bg === 'occultist' ? D.traitorOccultist : 0) +
        (markOf(t) === 'foe' ? D.traitorSuspected * Math.min(1, 2 / foes) : 0) + // as you had marked them when the descent began
        D.companion * loyal().length
    );
  const res = (q, heard) => {
    let html;
    if (chance(q)) {
      t.status = 'exposed';
      S.fin.caught = t.id;
      S.stats.right++;
      S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight)); // (one of its voices gone, as at an inquiry)
      html = bi(
        `<p>You turn in time to see the knife. Flint, old, black with bitumen. You and ${t.short} go down together on the brick, and only you get up. ${t.short} will be tied here until morning, if there is a morning.</p>`,
        `<p>Вы оборачиваетесь как раз вовремя, чтобы увидеть нож. Кремнёвый, древний, чёрный от битума. Вы с ${ru.c(t, 'i')} вместе падаете на кирпич, но поднимаетесь только вы. ${ru.c(t)} останется здесь, связанн${ru.gs(t, 'ый', 'ая')}, до утра — если утро наступит.</p>`
      );
    } else {
      S.fin.betrayed.push(t.id);
      S.fin.cause = 'knife';
      html =
        (heard
          ? bi(
              `<p class="horror">You hear the step a moment too late, and turn as the knife comes: it opens your coat and goes no further. ${t.short} is past you before you can catch ${EP.him(t)}, murmuring the old words, and runs ahead into the dark, toward the chanting.</p>`,
              `<p class="horror">Вы слышите шаг на миг позже, чем нужно, и оборачиваетесь, когда нож уже летит: он распарывает вам куртку — и только. ${ru.c(t)} проскальзывает мимо прежде, чем вы успеваете ${ru.gs(t, 'его', 'её')} схватить, и, бормоча древние слова, убегает вперёд, во тьму, туда, откуда доносится пение.</p>`
            )
          : bi(
              `<p class="horror">The knife takes you under the ribs. ${t.short} steps past you, murmuring the old words, and runs ahead into the dark, toward the chanting.</p>`,
              `<p class="horror">Нож входит вам под рёбра. ${ru.c(t)} переступает через вас, бормоча древние слова, и убегает вперёд, во тьму, туда, откуда доносится пение.</p>`
            )) + costOf(heard ? 'knifeHeard' : 'knife');
    }
    S.fin.comp = S.fin.comp.filter(x => x !== t.id);
    stepOn(html, next);
  };
  show({
    kicker: DESC(),
    title: bi('The fourth gate', 'Четвёртые врата'),
    body: [
      `<p>${bi(GATES.two)}</p>` +
        bi(
          `<p>Behind you, ${t.short} has gone very quiet.</p>`,
          `<p>За вашей спиной ${ru.c(t)} совсем ${ru.gs(t, 'затих', 'затихла')}.</p>`
        )
    ],
    choices: [
      {
        label: bi(`Turn and face ${t.short}`, `Обернуться к ${ru.c(t, 'd')}`),
        sub: bi('Now, before it is too late', 'Сейчас, пока не поздно'),
        fn: () => {
          S.fin.g2 = 'face';
          res(p);
        }
      },
      {
        label: bi('Keep walking and listen', 'Идти дальше и прислушиваться'),
        sub: bi(
          'Let them think you have not noticed, and hear it coming',
          'Пусть думает, что вы ничего не заметили, — и услышать, когда начнётся'
        ),
        fn: () => {
          S.fin.g2 = 'listen';
          res(clamp(p - D.traitorBlind), true);
        }
      }
    ]
  });
}
// No traitor making a move: meet the eyes in the walls, or cover your light and walk blind. The first of those still
// with you takes the eyes calmly or not: a cultist waiting for the end mostly calm, anyone else mostly not, though
// some are calm by nature (RULES.descent.calm: [the cult, anyone]).
function gate2Eyes(next) {
  const c = withYou().map(C)[0],
    calm = c && chance(RULES.descent.calm[c.role === 'cult' ? 0 : 1]);
  show({
    kicker: DESC(),
    title: bi('The fourth gate', 'Четвёртые врата'),
    body: [
      `<p>${bi(GATES.two)}</p>` +
        (!c
          ? ''
          : calm
            ? bi(
                `<p>${c.short} walks at your shoulder, calm as a churchwarden, and holds the lamp higher when the eyes begin to move.</p>`,
                `<p>${ru.c(c)} идёт рядом с вами, ${ru.gs(c, 'спокойный', 'спокойная')}, как церковный староста, и поднимает лампу повыше, когда глаза начинают двигаться.</p>`
              )
            : bi(
                `<p>${c.short} walks at your shoulder, pale, and keeps the lamp low, as if the eyes might not notice it.</p>`,
                `<p>${ru.c(c)} идёт рядом с вами, ${ru.gs(c, 'бледный', 'бледная')}, и держит лампу пониже, словно глаза могут её не заметить.</p>`
              ))
    ],
    choices: [
      {
        label: bi('Meet the eyes and walk on', 'Выдержать их взгляд и идти дальше'),
        sub: bi('Hold your nerve, or lose it', 'Удержать самообладание — или потерять'),
        fn: riskStep(
          {
            key: 'g2',
            val: 'eyes',
            base: RULES.descent.eyes,
            ways: ['bold'],
            cost: 'eyes',
            ok: [
              'You stare back at a thousand dead eyes and walk on. They are only shell. They are only lapis.',
              'Вы смотрите в ответ тысяче мёртвых глаз и идёте дальше. Это всего лишь раковина. Это всего лишь лазурит.'
            ],
            fail: ['One of the eyes blinks.', 'Один из глаз моргает.']
          },
          next
        )
      },
      {
        label: bi('Cover your light and walk blind', 'Прикрыть свет и идти вслепую'),
        sub: bi('Trust your hands; something may take one', 'Довериться рукам; за руку может кто-то схватить'),
        fn: riskStep(
          {
            key: 'g2',
            val: 'blind',
            base: RULES.descent.blind,
            ways: ['humble'],
            cost: 'blind',
            cause: 'grip',
            ok: [
              'You walk with one hand on the wall, in perfect dark, until the wall ends.',
              'В кромешной тьме вы идёте, ведя рукой по стене, пока стена не кончается.'
            ],
            fail: [
              'In the dark, something with too many fingers takes your wrist and pulls.',
              'В темноте что-то, у чего слишком много пальцев, хватает вас за запястье и тянет.'
            ]
          },
          next
        )
      }
    ]
  });
}
// The seventh gate asks a price: a thing you carry, a companion to hold it, or part of yourself. It takes what it is
// given, all but always (descent.gate7): now and then it will not have a thing (and you must offer something else), a
// companion left to hold it follows you through after all, or it takes more of you than you offered.
function gate3(said = '') {
  S.phase = 'descent';
  const G7 = RULES.descent.gate7,
    spurned = S.fin.spurned || [];
  const ch = S.items
    .filter(it => !spurned.includes(it))
    .map(it => ({
      label: bi(`Leave ${theItem(it)}`, `Оставить ${ru.item(it, 'a')}`),
      sub: ITEMS[it].ward ? bi('An old charm. You might need it below', 'Древний амулет. Внизу может пригодиться') : bi(ITEMS[it].desc),
      fn: () => {
        if (!has(it)) return gate3(); // drunk, say, from the casebook while you stood here
        // (a thing that would cost you little it will not have, as often as not: it wants a price)
        if (chance(['bowl', 'brandy'].includes(it) ? G7.small : G7.refuse)) {
          S.fin.spurned = spurned.concat([it]);
          return gate3(
            `<p class="horror">${bi(`You set ${V(it, 'it', 'them')} down on the threshold. The gate does not open. After a while you pick ${V(it, 'it', 'them')} up again: it wants something else.`, 'Вы кладёте это на порог. Врата не открываются. Через какое-то время вы забираете вещь обратно: вратам нужно что-то другое.')}</p>`
          );
        }
        lose(it);
        S.fin.g3 = { kind: 'item', it };
        stepOn(
          `<p>${bi(`You set ${V(it, 'it', 'them')} down on the threshold. The gate opens.`, 'Вы кладёте это на порог. Врата открываются.')}</p>`,
          sanctum
        );
      }
    }));
  withYou()
    .map(C)
    .forEach(c =>
      ch.push({
        label: bi(`Ask ${c.short} to hold the gate`, `Попросить ${ru.c(c, 'a')} удержать врата`),
        sub: bi(
          'They stay behind, and their help with them',
          ru.gs(c, 'Он останется здесь, а с ним и его помощь', 'Она останется здесь, а с ней и её помощь')
        ),
        fn: () => {
          S.fin.g3 = { kind: 'comp', id: c.id };
          // (one of the cult may let it fall and come in all the same: people/cunning.js, turnAtTheEnd; anyone else, now
          // and then, follows you through as it swings shut)
          if (c.role !== 'cult' && chance(G7.follow)) {
            S.fin.g3.followed = true;
            return stepOn(
              bi(
                `<p>${c.short} sets ${c.pp} back against the gate. You are hardly through when it swings shut on its own, and ${c.short} is through with you, white to the lips. “It let go of me,” ${c.p} says. “It did not want me.”</p>`,
                `<p>${ru.c(c)} подпирает створку спиной. Едва вы проходите, как врата сами захлопываются — и ${ru.c(c)}, ${ru.gs(c, 'белый', 'белая')} как полотно, оказывается рядом с вами. «Оно меня отпустило, — говорит ${ru.gs(c, 'он', 'она')}. — Я ему не был${ru.gs(c, '', 'а')} нужн${ru.gs(c, 'ен', 'а')}».</p>`
              ),
              sanctum
            );
          }
          S.fin.left.push(c.id);
          stepOn(
            bi(
              `<p>${c.short} nods and sets ${c.pp} back against the gate. “Go,” ${c.p} says. “I will keep it open.”</p>`,
              `<p>${ru.c(c)} кивает и подпирает створку спиной. «Идите, — говорит ${ru.gs(c, 'он', 'она')}. — Я удержу».</p>`
            ),
            sanctum
          );
        }
      })
    );
  ch.push({
    label: bi('Leave part of yourself', 'Оставить часть себя'),
    sub: bi('A memory, and much of your nerve', 'Воспоминание — и немалая доля ваших нервов'),
    cls: 'danger',
    fn: () => {
      const more = chance(G7.more);
      S.fin.g3 = { kind: 'self', more };
      stepOn(
        `<p>${bi('You give it a memory: your mother’s voice. It takes it gently, and you cannot remember what you gave.', 'Вы отдаёте ему воспоминание — голос вашей матери. Оно берёт его бережно, и вы уже не можете вспомнить, что отдали.')}</p>` +
          (more
            ? `<p class="horror">${bi('Then it takes another, without asking, and you do not know which.', 'Потом берёт ещё одно — не спрашивая, и вы не знаете какое.')}</p>` +
              hurt(RULES.descent.cost.self[0] + 1, RULES.descent.cost.self[1]) // (the more it took, the more it cost)
            : costOf('self')),
        sanctum
      );
    }
  });
  show({ kicker: DESC(), title: bi('The seventh gate', 'Седьмые врата'), body: [said + `<p>${bi(GATES.seven)}</p>`], choices: ch });
}
// The odds of each last act: your company, your nerve, the rite's progress, how many of the cult stand in the circle,
// the favour you won between the gates, and a first act that failed. Never shown.
function sanctumOdds() {
  const f = S.fin,
    free = circle().length,
    l = loyal().length;
  const D = RULES.descent,
    bonus =
      D.companion * l +
      D.nerve * (S.nerve - D.steady) -
      D.doom * S.doom -
      D.extraCultist * Math.max(0, free - 1) +
      D.favour * (f.favour || 0) +
      (f.tries ? D.again : 0); // (the first act shook the circle, though it did not break it)
  return {
    ward: it => clamp(D.ward + bonus + (f.named === S.godOfWard[it] ? D.wardNamed : 0) + (S.bg === 'occultist' ? D.wardOccultist : 0)),
    rite: () =>
      clamp(
        D.rite +
          bonus +
          D.riteLine * Math.min(D.riteLines, factsAbout(f.named)) +
          (S.bg === 'philologist' ? D.ritePhilologist : 0) +
          (S.bg === 'occultist' ? D.riteOccultist : 0)
      ),
    shoot: () => clamp(free <= 1 ? D.shootOne : D.shootMore),
    fire: () => clamp(D.fire + D.fireCompanion * l - D.fireDoom * S.doom)
  };
}
// those of the cult in the circle: all still free, but any who came down with you and would not go to them
const circle = () => freeCult().filter(c => !(S.fin.heldBack || []).includes(c.id));
function sanctum() {
  S.phase = 'sanctum';
  const turned = turnAtTheEnd(); // the first time only: whoever of the cult came down with you takes their place
  const cult = circle();
  if (!cult.length) {
    // nobody of the cult in the circle: a rite with no voice to finish it fails, all but always (descent.emptied);
    // now and then the power finishes it itself
    S.fin.empty = true;
    ending(chance(RULES.descent.emptied) ? 'triumph' : 'doom');
    return;
  }
  const hier = cult.find(c => c.id === S.hierophant) || cult[0];
  show({ kicker: DESC(), title: bi('The sanctum', 'Святилище'), body: sanctumBody(cult, hier, turned), choices: sanctumActs(hier) });
}
// What you see: the power below; those already in the circle (the first time, the hierophant smiling at you, unless it
// came down with you; after a failed act, the chant going on); then, the first time, whoever of the cult came down with
// you, joining them.
function sanctumBody(cult, hier, turned) {
  const again = S.fin.tries > 0,
    waiting = cult.filter(c => !turned.ids.includes(c.id)),
    smiles = !again && !(S.fin.turned || []).includes(hier.id);
  const body = [
    `<p>${bi(ASP(S.patron).sanctum)}</p>` +
      (waiting.length
        ? bi(
            `<p>Around it, robed in the old way, ${waiting.length > 1 ? 'stand ' + listNames(waiting.map(c => c.name)) : 'stands ' + waiting[0].name}.${smiles ? ` ${hier.short} turns from the rite and smiles at you as if you were expected.` : again ? ' The chant has not faltered.' : ''}</p>`,
            `<p>Вокруг, в древних облачениях, ${waiting.length > 1 ? 'стоят ' + ru.list(waiting.map(c => ru.cf(c))) : 'стоит ' + ru.cf(waiting[0])}.${smiles ? ` ${ru.c(hier)} отворачивается от обряда и улыбается вам так, словно вас здесь ждали.` : again ? ' Пение не сбилось ни на миг.' : ''}</p>`
          )
        : '') +
      turned.html
  ];
  if (S.fin.tries)
    body.push(
      `<p class="warn">${bi('The rite goes on. You have time for one more act.', 'Обряд продолжается. Вы успеете сделать ещё что-то одно.')}</p>`
    );
  return body;
}
// What you can do: raise a charm (every charm reads the same: the label must not tell you which one is the ward), speak
// the counter-rite against the power you named, or one of the desperate acts, each once; or, with nothing left to try
// (no charm, no name, no revolver, the braziers spent), nothing, and the rite completes.
function sanctumActs(hier) {
  const f = S.fin,
    o = sanctumOdds(),
    ch = [];
  S.items
    .filter(it => ITEMS[it].ward)
    .forEach(it =>
      ch.push({
        label: bi(`Raise ${theItem(it)}`, `Поднять ${ru.item(it, 'a')}`),
        sub: f.named
          ? bi(
              `If ${V(it, 'it is', 'they are')} ${GODS[f.named].name}’s ward, and ${GODS[f.named].name} is here`,
              `Если это оберег против ${ru.god(f.named, 'g')} и здесь именно ${ru.gf(f.named) ? 'она' : 'он'}`
            )
          : bi(`If ${V(it, 'it is', 'they are')} the ward against what is here`, 'Если это оберег против того, что здесь'),
        fn: () => {
          f.acts.push({ kind: 'ward', it });
          finalAct(S.godOfWard[it] === S.patron ? o.ward(it) : RULES.descent.wrongWard, 'ward');
        }
      })
    );
  if (f.named)
    ch.push({
      label: bi(`Speak the counter-rite against ${GODS[f.named].name}`, `Прочесть контробряд против ${ru.god(f.named, 'g')}`),
      sub: bi('If you named the right power', 'Если вы назвали верную силу'),
      fn: () => {
        f.acts.push({ kind: 'rite', g: f.named });
        finalAct(f.named === S.patron ? o.rite() : RULES.descent.wrongRite, 'rite');
      }
    });
  const many = circle().length > 1; // (the circle, or the one alone in it)
  if (has('revolver'))
    ch.push({
      label: bi(`Shoot ${hier.short}`, `Выстрелить в ${ru.c(hier, 'a')}`),
      sub: bi(
        `A last resort: miss, and ${many ? 'they are' : `${hier.p} is`} on you`,
        `Крайнее средство: промахнётесь — и ${many ? 'они бросятся' : ru.gs(hier, 'он бросится', 'она бросится')} на вас`
      ),
      cls: 'danger',
      fn: () => {
        f.acts.push({ kind: 'shoot', id: hier.id });
        finalAct(o.shoot(), 'shoot');
      }
    });
  if (!f.acts.some(a => a.kind === 'fire'))
    ch.push({
      label: bi('Overturn the braziers into the bitumen', 'Опрокинуть жаровни в битум'),
      sub: bi('A last resort: the fire may spare the rite, and not you', 'Крайнее средство: огонь может пощадить обряд — но не вас'),
      cls: 'danger',
      fn: () => {
        f.acts.push({ kind: 'fire' });
        finalAct(o.fire(), 'fire');
      }
    });
  // with nothing left to try, you can only watch: the rite completes, all but always (descent.falters: it breaks of
  // itself, on its last line)
  if (!ch.length)
    ch.push({
      label: bi('There is nothing left to try', 'Больше нечего пробовать'),
      sub: bi('Stand and watch', 'Стоять и смотреть'),
      cls: 'danger',
      fn: () => {
        if (!chance(RULES.descent.falters)) return ending('doom');
        f.acts.push({ kind: 'none', ok: true });
        ending('pyrrhic', 'falter');
      }
    });
  return ch;
}
// how each act fails (act: what you did)
const FAILED = {
  ward: () =>
    bi(
      'The words fall dead in the hot air. Whatever you called on is not listening, or is not the one here.',
      'Слова падают замертво в горячем воздухе. То, к чему вы взывали, не слушает — или здесь не оно.'
    ),
  shoot: act => {
    const t = C(act.id),
      many = circle().length > 1; // (the others in the circle, or the one you shot at, alone)
    return bi(
      `The shot goes wide, or does not matter: ${t.short} does not even stumble, and ${many ? 'the robed figures are' : `${t.p} is`} on you before you can fire again. When ${many ? 'they let' : `${t.p} lets`} you go, the revolver is gone.`,
      `Пуля уходит мимо — или это ничего не меняет: ${ru.c(t)} даже не ${ru.gs(t, 'пошатнулся', 'пошатнулась')}, а ${many ? 'фигуры в облачениях набрасываются' : `${ru.gs(t, 'он набрасывается', 'она набрасывается')}`} на вас прежде, чем вы успеваете выстрелить снова. Когда вас отпускают, револьвера уже нет.`
    );
  },
  fire: () =>
    bi(
      'The bitumen catches, and the fire runs along it, and goes out as if a hand had closed on it. Your sleeve is still burning.',
      'Битум занимается, огонь бежит по нему — и гаснет, будто его сжала чья-то рука. А ваш рукав всё ещё горит.'
    )
};
FAILED.rite = FAILED.ward;
function finalAct(p, kind) {
  const act = S.fin.acts[S.fin.acts.length - 1];
  if (chance(p)) {
    if (act) act.ok = true;
    // a ward or the counter-rite at the first try, with nerve and a wound to spare, is a clean win, all but always
    // (cleanSure); otherwise now and then all the same (cleanLucky); a shot or the fire never
    const D = RULES.descent,
      whole = S.fin.tries === 0 && S.nerve >= D.cleanNerve && S.wounds < S.woundsMax - 1,
      clean = (kind === 'ward' || kind === 'rite') && chance(whole ? D.cleanSure : D.cleanLucky);
    ending(clean ? 'triumph' : 'pyrrhic', kind);
    return;
  }
  S.fin.tries++;
  if (act) act.ok = false;
  S.fin.cause = 'rite';
  if (kind === 'shoot') lose('revolver'); // taken from you when they let you go
  const h = costOf(kind);
  if (checkEnd()) return;
  // time for another act: mostly after the first that failed, seldom after the second, hardly ever after that
  if (!chance(RULES.descent.moreTime[S.fin.tries - 1] ?? RULES.scale.rarest)) {
    ending('doom');
    return;
  }
  show({
    kicker: DESC(),
    title: bi('It fails', 'Не вышло'),
    body: [`<p class="horror">${FAILED[kind](act)}</p>` + h],
    choices: [{ label: bi('One more act', 'Ещё одна попытка'), cls: 'danger', fn: sanctum }]
  });
}
function statusText(c) {
  if (c.status === 'taken')
    return c.takenBy === 'you'
      ? bi(`Killed by you, night ${c.takenDay}`, `${ru.gs(c, 'Убит', 'Убита')} вами в ночь ${c.takenDay}`)
      : bi(`Taken, night ${c.takenDay}`, `${ru.gs(c, 'Погиб', 'Погибла')} в ночь ${c.takenDay}`);
  if (c.status === 'exposed') return bi('Exposed', ru.gs(c, 'Разоблачён', 'Разоблачена'));
  if (c.status === 'dismissed') return bi('Sent away', ru.gs(c, 'Отослан', 'Отослана'));
  if (S.fin && S.fin.acts.some(a => a.kind === 'shoot' && a.ok && a.id === c.id))
    return bi('Shot below', ru.gs(c, 'Застрелен внизу', 'Застрелена внизу'));
  if (S.fin && (S.fin.betrayed.includes(c.id) || (S.fin.turned || []).includes(c.id)))
    return bi('Betrayed you', ru.gs(c, 'Предал вас', 'Предала вас'));
  if (c.role === 'cult') return bi('Never unmasked', ru.gs(c, 'Не разоблачён', 'Не разоблачена'));
  return bi('Survived', ru.gs(c, 'Выжил', 'Выжила'));
}
