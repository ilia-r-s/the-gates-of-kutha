// ===================== BETWEEN THE GATES =====================
// Seven gates, as in the old poem. You meet the first, the fourth and the seventh (game/finale.js); between them, one
// thing or two each time, drawn at random from what waits below: the gatekeeper, the judges of the dead, a table laid
// for the dead, the voices, the power's own passage, a black dog, a brazier, a cradle, Crane's bones, a black pool, a
// companion's nerve failing, a winged bull, a scribe's unfinished tablet, the Seven, a channel of salt water. Each asks
// a choice, and each choice has its price or its gift: nerve, a wound, a charm or a tablet line, the favour of the
// place (it helps at the very end), time (the rite gains), or a companion.
// No choice is right in itself. Each is a way of meeting the thing (bold, humble, truthful, sly, hasty, patient, giving,
// with water, with light, taking, refusing, with bronze, with the written word, breaking, leaning on another), and the
// power below favours some ways and will not abide others, by its nature (NATURE, rules.js): so the same trial asks
// for different things in different seasons. The season weighs too: whether you know what you face (the right name at
// the gate, its signs seen), your nerve, the rite's strength, and what each trial weighs of its own (your conduct before
// the judges, the dead before their voices, your wounds in the passage). A way the power will not abide costs more when
// it goes wrong. What happened is kept in S.fin.enc for the ending.
const GATE_N = {
  2: { en: 'second', n: 'Вторые', g: 'вторых', i: 'вторыми' },
  3: { en: 'third', n: 'Третьи', g: 'третьих', i: 'третьими' },
  5: { en: 'fifth', n: 'Пятые', g: 'пятых', i: 'пятыми' },
  6: { en: 'sixth', n: 'Шестые', g: 'шестых', i: 'шестыми' }
};
// What a choice comes to: a gift of the place's favour, a price in nerve or wounds (what hurt you, if it was a wound),
// or neither. Each carries the line the ending will remember it by.
function favour(html, said) {
  S.fin.favour = (S.fin.favour || 0) + 1;
  return { html, sign: 'p', said };
}
function price(html, n, w, said, cause) {
  if (w) S.fin.cause = cause || 'grip';
  return { html: html + hurt(n, w), sign: 'm', said };
}
const plain = (html, said, sign = 'n') => ({ html, sign, said });
// nerve that comes back below, now and then
const steadied = n => nerveNote(regain(n));
const pline = (en, rus) => `<p>${bi(en, rus)}</p>`,
  hline = (en, rus) => `<p class="horror">${bi(en, rus)}</p>`;
// a tablet line (one that narrows the power below, if g is the power below: world/powers.js), after the paragraph that
// brings it; with none left to tell, or now and then none told after all (k: the chance one is; all but always unless
// said otherwise), the paragraph none
function lineOr(g, intro, none = intro, k = RULES.scale.surest) {
  const l = chance(k) ? learnFact(g) : null;
  return l != null ? intro + factP(l) : none;
}
// the most recent of the night's dead, or Crane
function lastDead() {
  const t = S.order
    .map(C)
    .filter(c => c.status === 'taken')
    .sort((a, b) => b.takenDay - a.takenDay)[0];
  return t ? { en: `${t.short}’s`, ru: `голос ${ru.c(t, 'g')}` } : { en: 'Crane’s', ru: 'голос Крейна' };
}
// ---------- what the power below favours, and what it will not abide ----------
// how well a way of meeting a trial sits with the power below: −2 to +2 (the sum of its ways)
const natureOf = ways =>
  Math.max(
    -2,
    Math.min(
      2,
      ways.reduce((a, w) => a + (NATURE[S.aspectOf[S.patron]][w] || 0), 0)
    )
  );
// The chance a choice goes well: its own odds (base), the power's nature, and the season (mod: what this trial weighs).
function trialP(base, ways, mod = 0) {
  const B = RULES.below,
    known = (S.fin && S.fin.named === S.patron ? B.known : 0) + B.signSeen * S.omenSeen.length; // (the power's own signs seen: a stray sign teaches nothing of it)
  return clamp(
    base +
      B.nature * natureOf(ways) +
      known +
      mod -
      (S.nerve <= B.shaken ? B.shake : 0) -
      B.rite * Math.max(0, S.doom - RULES.start.doomWarn) -
      B.harder
  );
}
const tried = (base, ways, mod = 0) => chance(trialP(base, ways, mod));
// what a choice costs when it goes wrong: n nerve, and one more if the power will not abide that way
const dearer = (n, ways) => n + (natureOf(ways) < 0 ? 1 : 0);
// the place's own touch on you, by the power's nature
const by4 = o => o[S.aspectOf[S.patron]];
const B_ = () => RULES.below;
// Which of those still with you falters, if one does: any of them, the cult's own too (its fear is as real as anyone's
// down here, or a fair copy of it), fixed for the encounter without the dice.
const falterer = () => C(hashPick(withYou(), S.salt, 'falter', S.day));
// Each: when it can come (early: between the first gate and the fourth; late: between the fourth and the seventh),
// whether it can come at all, what you see (n: which gate), and the choices.
const BELOW = {
  neti: {
    when: 'early',
    text: n => {
      const g = by4({
        fire: ['a garment of ash, still warm', 'одеяние из пепла, ещё тёплого'],
        dust: ['a garment of dust', 'одеяние из пыли'],
        sea: ['a garment of wet black weed', 'одеяние из мокрых чёрных водорослей'],
        teeth: ['a garment of matted hair', 'одеяние из свалявшихся волос'],
        plague: ['a garment of soiled linen, black with flies', 'одеяние из грязного полотна, чёрного от мух'],
        madness: ['a garment of broken looking-glass', 'одеяние из осколков зеркала']
      });
      return pline(
        `At the ${n.en} gate someone is sitting in the niche beside the door, wrapped to the eyes in ${g[0]}. It does not move. It asks, in a voice like a page turning: “Who are you, who come down?”`,
        `У ${n.g} врат в нише у двери сидит нечто, по самые глаза закутанное в ${g[1]}. Оно не шевелится. Голосом, похожим на шорох переворачиваемой страницы, оно спрашивает: «Кто ты, что спускаешься ко мне?»`
      );
    },
    choices: () => [
      {
        label: bi('Give your own name', 'Назвать своё имя'),
        sub: bi('It will know you, after', 'После этого оно будет вас знать'),
        go: () =>
          tried(B_().name, ['truth'])
            ? favour(
                pline(
                  'It repeats your name slowly, as if writing it down. The door opens. Somewhere below, you are expected now.',
                  'Оно медленно повторяет ваше имя, будто записывает. Дверь открывается. Где-то внизу вас теперь ждут.'
                ),
                ['you gave the gatekeeper your own name, and were remembered', 'вы назвали привратнику своё имя, и вас запомнили']
              )
            : price(
                hline(
                  'It repeats your name in your mother’s voice, and laughs, and the door opens.',
                  'Оно повторяет ваше имя голосом вашей матери, смеётся — и дверь открывается.'
                ),
                dearer(1, ['truth']),
                0,
                ['you gave the gatekeeper your own name, and it laughed', 'вы назвали привратнику своё имя, и тот рассмеялся']
              )
      },
      {
        label: bi('Give Crane’s name', 'Назвать имя Крейна'),
        sub: bi('A lie, to a doorkeeper', 'Солгать привратнику'),
        go: () =>
          tried(B_().lie, ['guile'])
            ? plain(
                pline(
                  'It says nothing, and the door opens, and you do not like how easily.',
                  'Оно молчит, и дверь открывается, — и вам не нравится, как легко.'
                ),
                ['you gave the gatekeeper Crane’s name, and were let by', 'вы назвали привратнику имя Крейна, и вас пропустили']
              )
            : price(
                hline(
                  '“Crane,” it says. “Crane came down already. Crane is still here.” The door opens.',
                  '«Крейн, — говорит оно. — Крейн уже спускался. Крейн всё ещё здесь». Дверь открывается.'
                ),
                dearer(1, ['guile']),
                0,
                [
                  'you gave the gatekeeper Crane’s name, and learned he was still below',
                  'вы назвали привратнику имя Крейна и узнали, что Крейн всё ещё внизу'
                ]
              )
      },
      {
        label: bi('Say nothing, and push past', 'Промолчать и пройти мимо'),
        sub: bi('It may not let you', 'Оно может и не пустить'),
        go: () =>
          tried(B_().push, ['bold'])
            ? plain(
                pline(
                  'You walk past it, and it lets you, and you feel it turn its head to watch you go.',
                  'Вы проходите мимо, и оно пропускает вас, — и вы чувствуете, как оно поворачивает голову вам вслед.'
                ),
                ['you pushed past the gatekeeper without a word', 'вы молча прошли мимо привратника']
              )
            : price(
                hline(
                  'Its hand comes out of its wrappings and closes on your arm, and lets go only when you have bled.',
                  'Из-под покрова высовывается рука, смыкается на вашей руке и отпускает, лишь когда у вас выступает кровь.'
                ),
                dearer(0, ['bold']),
                1,
                ['you tried to push past the gatekeeper, and bled for it', 'вы попытались пройти мимо привратника и поплатились кровью']
              )
      }
    ]
  },
  // the judges weigh you as well as your manners: every innocent you sent away, and every one of the cult you unmasked
  judges: {
    when: 'early',
    text: n =>
      pline(
        `Beyond the ${n.en} gate the passage is lined with seated figures of baked clay, the judges of the dead, hands folded, eyes painted black. As your lamp passes each of them, it turns its head.`,
        `За ${n.i} вратами вдоль прохода сидят фигуры из обожжённой глины — судьи мёртвых, со сложенными руками и чёрными нарисованными глазами. Когда свет вашей лампы проходит мимо, каждая поворачивает голову.`
      ),
    choices: () => {
      const weighed = B_().judgedRight * S.stats.right - B_().judgedWrong * S.stats.wrong;
      return [
        {
          label: bi('Bow to each of them, as the old priests did', 'Поклониться каждому, как кланялись древние жрецы'),
          sub: bi('Slow, and humbling', 'Медленно и смиренно'),
          go: () =>
            tried(B_().bow, ['humble', 'patience'], weighed)
              ? favour(
                  pline(
                    'You bow seven times. By the last, the heads have stopped turning. You have been weighed, and let pass.',
                    'Вы кланяетесь семь раз. К последнему поклону головы перестают поворачиваться. Вас взвесили — и пропустили.'
                  ),
                  ['you bowed to the judges of the dead, and were let pass', 'вы поклонились судьям мёртвых, и вас пропустили']
                )
              : price(
                  hline(
                    'You bow, and the last of them bows back, and that is worse than anything.',
                    'Вы кланяетесь, и последний из них кланяется вам в ответ, — и это хуже всего.'
                  ),
                  dearer(1, ['humble', 'patience']),
                  0,
                  [
                    'you bowed to the judges of the dead, and the last of them bowed back',
                    'вы поклонились судьям мёртвых, и последний поклонился вам в ответ'
                  ]
                )
        },
        {
          label: bi('Walk past with your eyes on the floor', 'Пройти мимо, не поднимая глаз'),
          sub: bi('Quick, if they allow it', 'Быстро — если они позволят'),
          go: () =>
            tried(B_().eyesDown, ['haste'], weighed)
              ? plain(
                  pline(
                    'You count the bricks of the floor instead, and when you look up, the judges are behind you.',
                    'Вместо этого вы считаете кирпичи пола, а когда поднимаете глаза, судьи уже позади.'
                  ),
                  ['you passed the judges of the dead without looking up', 'вы прошли мимо судей мёртвых, не поднимая глаз']
                )
              : price(
                  hline(
                    'One of them speaks a single word as you pass. You do not know the word. You will hear it for the rest of your life.',
                    'Когда вы проходите, один из них произносит единственное слово. Вы не знаете этого слова. Вы будете слышать его до конца жизни.'
                  ),
                  dearer(1, ['haste']),
                  0,
                  [
                    'one of the judges of the dead spoke a word to you as you passed',
                    'один из судей мёртвых сказал вам слово, когда вы проходили'
                  ]
                )
        },
        {
          label: bi('Meet each painted gaze in turn', 'Выдержать взгляд каждого'),
          sub: bi('Let them see whom they judge', 'Пусть видят, кого судят'),
          go: () =>
            tried(B_().stare, ['bold'], weighed)
              ? favour(
                  pline(
                    'You look each of them in the eye. One by one the painted eyes look away first.',
                    'Вы смотрите в глаза каждому. Один за другим нарисованные глаза отводят взгляд первыми.'
                  ),
                  [
                    'you met the gaze of the judges of the dead, and they looked away',
                    'вы выдержали взгляд судей мёртвых, и они отвели глаза'
                  ]
                )
              : price(
                  hline(
                    'The seventh does not look away. It goes on looking at you after you have passed, through the back of your head.',
                    'Седьмой не отводит глаз. Он смотрит на вас и после того, как вы прошли, — сквозь затылок.'
                  ),
                  dearer(1, ['bold']),
                  0,
                  ['one of the judges of the dead stared you down', 'один из судей мёртвых пересмотрел вас']
                )
        }
      ];
    }
  },
  bread: {
    when: 'any',
    text: n =>
      pline(
        `In a side chamber past the ${n.en} gate a table has been laid, as if for a guest who is expected: a loaf, a jar of water, a cup of beer, all fresh. In the old story, a wise man was offered the bread and water of the dead, and would not touch them.`,
        `В боковом покое за ${n.i} вратами накрыт стол — будто для гостя, которого ждут: хлеб, кувшин воды, чаша пива, всё свежее. В древнем сказании мудрецу поднесли хлеб и воду смерти, и он к ним не притронулся.`
      ),
    choices: () => [
      {
        label: bi('Eat and drink', 'Есть и пить'),
        sub: bi('To know what the dead know', 'Чтобы знать то, что знают мёртвые'),
        go: () => {
          const ok = tried(B_().eat, ['take']),
            h = lineOr(
              S.patron,
              hline(
                'The bread tastes of ash, and the water of nothing at all. For a moment you know the power below the way its servants know it.',
                'Хлеб отдаёт золой, а вода ничем. На миг вы знаете силу внизу так, как знают её слуги.'
              ),
              hline(
                'The bread tastes of ash, and the water of nothing at all. For a moment you almost know something, and then it is gone.',
                'Хлеб отдаёт золой, а вода ничем. На миг вы почти что-то понимаете — и всё ускользает.'
              ),
              B_().learn
            );
          return ok
            ? plain(h, ['you ate the bread of the dead, and it let you be', 'вы отведали хлеба мёртвых, и он вас не тронул'])
            : price(h, dearer(1, ['take']), 0, ['you ate the bread of the dead', 'вы отведали хлеба мёртвых']);
        }
      },
      {
        label: bi('Pour the water out on the floor, as an offering', 'Вылить воду на пол — как возлияние'),
        sub: bi('Good manners, below', 'Хорошие манеры — внизу'),
        go: () =>
          tried(B_().pour, ['water', 'offer'])
            ? favour(
                pline(
                  'The floor drinks it as you watch. Something below has noticed your manners.',
                  'Пол впитывает воду у вас на глазах. Что-то внизу оценило ваши манеры.'
                ),
                [
                  'you poured out the water of the dead as an offering, and it was taken',
                  'вы совершили возлияние водой мёртвых, и его приняли'
                ]
              )
            : price(
                pline(
                  'The water runs away down a crack in the floor, toward the sound of chanting, and the chanting rises to meet it.',
                  'Вода убегает в трещину в полу — туда, откуда доносится пение, и пение поднимается ей навстречу.'
                ),
                dearer(0, ['water', 'offer']),
                0,
                [
                  'you poured out the water of the dead, and the chanting rose to meet it',
                  'вы совершили возлияние водой мёртвых, и пение поднялось ей навстречу'
                ]
              )
      },
      {
        label: bi('Touch nothing', 'Ни к чему не прикасаться'),
        sub: bi('As the wise man did', 'Как поступил мудрец'),
        go: () =>
          tried(B_().touch, ['refuse'])
            ? plain(
                pline(
                  'You leave the table as you found it. Behind you a chair scrapes back, as if someone had been waiting to sit down. You walk on steadier for having refused.',
                  'Вы оставляете стол таким, каким его нашли. За спиной скрипит отодвинутый стул — будто кто-то ждал, чтобы сесть. Отказавшись, вы идёте дальше твёрже.'
                ) + steadied(1),
                ['you left the table of the dead untouched', 'вы не притронулись к столу мёртвых'],
                'p'
              )
            : price(
                hline(
                  'You leave the table as you found it. Behind you a chair scrapes back, and someone sits down to eat what you would not, and laughs with its mouth full.',
                  'Вы оставляете стол таким, каким его нашли. За спиной скрипит отодвинутый стул: кто-то садится есть то, чего не стали вы, и смеётся с набитым ртом.'
                ),
                dearer(1, ['refuse']),
                0,
                [
                  'you left the table of the dead untouched, and someone else sat down to it',
                  'вы не притронулись к столу мёртвых, и за него сел кто-то другой'
                ]
              )
      }
    ]
  },
  // the more of the camp the night has taken, the louder the dead
  voices: {
    when: 'early',
    text: n => {
      const d = lastDead();
      return pline(
        `Past the ${n.en} gate the passage fills with voices coming up from below. You know one of them. It is ${d.en}, and it is calling you by name.`,
        `За ${n.i} вратами проход наполняется голосами, что поднимаются снизу. Один из них вам знаком: это ${d.ru}, и он зовёт вас по имени.`
      );
    },
    choices: () => {
      const c = withYou().map(C)[0], // the first of those still with you, whatever they are
        louder = -B_().dead * S.stats.taken;
      const a = [
        {
          label: bi('Answer', 'Ответить'),
          sub: bi('The dead do not lie', 'Мёртвые не лгут'),
          go: () => {
            const ok = tried(B_().answer, ['truth', 'take'], louder),
              h = lineOr(
                S.patron,
                hline(
                  'You answer. The voice tells you something, quickly, as if afraid of being overheard:',
                  'Вы отвечаете. Голос торопливо, будто боясь, что подслушают, говорит вам:'
                ),
                hline(
                  'You answer. The voice only says your name again, more sadly.',
                  'Вы отвечаете. Голос лишь снова, печальнее, произносит ваше имя.'
                ),
                B_().learn
              );
            return ok
              ? plain(h, ['you answered the voices of the dead, and they let you go', 'вы ответили голосам мёртвых, и они вас отпустили'])
              : price(h, dearer(1, ['truth', 'take']), 0, ['you answered the voices of the dead', 'вы ответили голосам мёртвых']);
          }
        },
        {
          label: bi('Stop your ears and walk on', 'Заткнуть уши и идти дальше'),
          sub: bi('Do not listen', 'Не слушать'),
          go: () =>
            tried(B_().deaf, ['refuse'], louder)
              ? plain(
                  pline(
                    'You hum a music-hall song with your hands over your ears until the voices are behind you.',
                    'Зажав уши, вы напеваете куплет из мюзик-холла, пока голоса не остаются позади.'
                  ),
                  ['you walked past the voices of the dead with your ears stopped', 'вы прошли мимо голосов мёртвых, заткнув уши']
                )
              : price(
                  hline(
                    'You hear it anyway, through your hands: the voice tells you how it died.',
                    'Вы всё равно слышите — сквозь ладони: голос рассказывает вам, как он умер.'
                  ),
                  dearer(1, ['refuse']),
                  0,
                  ['the voices of the dead got through to you', 'голоса мёртвых до вас всё-таки добрались']
                )
        }
      ];
      if (c)
        a.push({
          label: bi(`Let ${c.short} talk you past them`, `Пусть ${ru.c(c)} уведёт вас мимо них`),
          sub: bi(
            `${c.short} is steadier than you are, unless ${c.p} stops to answer them`,
            `${ru.c(c)} держится твёрже вас — если только не остановится им ответить`
          ),
          go: () => {
            const beside = loyal().filter(x => x.id !== c.id).length; // (loyal company besides C helps, as at the gates)
            if (tried(B_().lead, ['company'], louder + RULES.descent.companion * beside))
              return plain(
                pline(
                  `${c.short} takes your arm and talks loudly about the price of paraffin until the voices are gone.`,
                  `${ru.c(c)} берёт вас под руку и громко рассуждает о ценах на керосин, пока голоса не стихают.`
                ) + steadied(1),
                [`${c.name} talked you past the voices of the dead`, `${ru.cf(c)} ${ru.gs(c, 'увёл', 'увела')} вас мимо голосов мёртвых`],
                'p'
              );
            S.fin.left.push(c.id);
            return plain(
              hline(
                `${c.short} stops to answer them, and will not come on. You go on without ${EP.him(c)}.`,
                `${ru.c(c)} останавливается, чтобы ответить им, и дальше не идёт. Вы идёте без ${ru.gs(c, 'него', 'неё')}.`
              ),
              [
                `${c.name} stopped to answer the voices of the dead, and stayed`,
                `${ru.cf(c)} ${ru.gs(c, 'остановился', 'остановилась')} ответить голосам мёртвых и там и ${ru.gs(c, 'остался', 'осталась')}`
              ],
              'm'
            );
          }
        });
      return a;
    }
  },
  // the power's own passage, in its own colour; the more you are already hurt, the harder to come through
  passage: {
    when: 'any',
    text: n => {
      const t = by4({
        fire: [
          `Past the ${n.en} gate the passage glows like the mouth of a kiln, and the air coming out of it is too hot to breathe.`,
          `За ${n.i} вратами проход светится, как жерло обжиговой печи, и воздух оттуда слишком горяч, чтобы дышать.`
        ],
        dust: [
          `Past the ${n.en} gate grey dust lies knee-deep in the passage, soft as flour, and something under it moves when your lamp moves.`,
          `За ${n.i} вратами проход по колено засыпан серой пылью, мягкой, как мука, и что-то под ней шевелится, когда шевелится ваша лампа.`
        ],
        sea: [
          `Past the ${n.en} gate black water fills the passage to the waist, salt and cold, and it is moving, though there is no current.`,
          `За ${n.i} вратами проход по пояс залит чёрной водой — солёной, холодной, — и она движется, хотя течения нет.`
        ],
        teeth: [
          `Past the ${n.en} gate the walls of the passage are gnawed deep by many teeth, and the marks are fresh.`,
          `За ${n.i} вратами стены прохода глубоко изгрызены множеством зубов, и следы свежие.`
        ],
        plague: [
          `Past the ${n.en} gate the passage is hung with grey sheets, one behind another, like the curtains round a sickbed, and the air between them is sweet and loud with flies.`,
          `За ${n.i} вратами проход завешен серыми простынями, одна за другой, как занавеси вокруг постели больного, и воздух между ними сладок и гудит от мух.`
        ],
        madness: [
          `Past the ${n.en} gate the passage turns back on itself, again and again, and every turn is the same turn, with the same scratch on the same brick.`,
          `За ${n.i} вратами проход то и дело поворачивает назад, и каждый поворот — тот же самый, с той же царапиной на том же кирпиче.`
        ]
      });
      return pline(t[0], t[1]);
    },
    choices: () => {
      const hurtBy = by4({
          fire: ['The heat takes the skin off your hands.', 'Жар сдирает кожу с ваших ладоней.'],
          dust: ['Something under the dust takes hold of your ankle and pulls.', 'Что-то под пылью хватает вас за лодыжку и тянет.'],
          sea: [
            'Something in the water wraps itself about your leg and pulls you under, and then lets you go.',
            'Что-то в воде обвивает вашу ногу, утягивает вас под воду — и отпускает.'
          ],
          teeth: ['Something in the wall bites, once, as you pass.', 'Что-то в стене кусает — один раз, когда вы проходите мимо.'],
          plague: [
            'Something behind the sheets coughs in your face, and by the time you are through, your hands are covered in sores.',
            'Что-то за простынями кашляет вам в лицо, и, пока вы пробираетесь насквозь, руки у вас покрываются язвами.'
          ],
          madness: [
            'At the hundredth turn you walk into the wall, hard, and for a while you cannot remember which way you were going, or why.',
            'На сотом повороте вы с размаху налетаете на стену и какое-то время не можете вспомнить, куда шли и зачем.'
          ]
        }),
        weak = -B_().wounded * S.wounds;
      const a = [
        {
          label: bi('Go straight through', 'Идти напролом'),
          sub: bi('Quick, and it may hurt', 'Быстро — и может быть больно'),
          go: () =>
            tried(B_().through, ['bold', 'haste'], weak)
              ? plain(
                  pline(
                    'You go through with your head down and come out the other side whole.',
                    'Вы проходите, опустив голову, и выходите с той стороны без единой царапины.'
                  ),
                  ['you went straight through the power’s own passage', 'вы прошли напролом сквозь проход, сотворённый самой силой']
                )
              : price(
                  hline(...hurtBy),
                  dearer(0, ['bold', 'haste']),
                  1,
                  ['the power’s own passage hurt you as you went through', 'проход, сотворённый самой силой, ранил вас'],
                  'passage'
                )
        },
        {
          label: bi('Look for another way round', 'Искать обходной путь'),
          sub: bi('Slower; the rite will not wait', 'Дольше, а обряд ждать не станет'),
          go: () => {
            const step = vary(1); // (how far the rite gets on while you crawl: a step, as a rule)
            S.doom += step;
            const h =
              pline(
                ...(step
                  ? [
                      'You find another way, through a crawl so narrow you have to leave your breath behind. It takes an hour. Below, the chanting has grown louder.',
                      'Вы находите другой путь — лаз такой узкий, что дыхание приходится оставить позади. На это уходит час. Пение внизу стало громче.'
                    ]
                  : [
                      'You find another way, through a crawl so narrow you have to leave your breath behind. It takes an hour, and yet below the chanting is no louder than it was.',
                      'Вы находите другой путь — лаз такой узкий, что дыхание приходится оставить позади. На это уходит час, и всё же пение внизу не стало громче.'
                    ])
              ) +
              (step
                ? `<p class="loss">${step > 1 ? bi('The rite draws much nearer', 'Обряд стремительно приближается') : bi('The rite draws nearer', 'Обряд всё ближе')}</p>`
                : '');
            return tried(B_().round, ['patience'], weak)
              ? plain(
                  h,
                  step
                    ? ['you went the long way round, and the rite gained on you', 'вы пошли в обход, и обряд выиграл время']
                    : ['you went the long way round, and the rite did not gain on you', 'вы пошли в обход, и обряд не выиграл ни минуты'],
                  step ? 'm' : 'n'
                )
              : price(
                  h +
                    hline(
                      'Halfway along, the crawl tightens on you like a fist, and lets you go only when you have stopped struggling.',
                      'На полпути лаз сжимается вокруг вас, как кулак, и отпускает, только когда вы перестаёте биться.'
                    ),
                  dearer(1, ['patience']),
                  0,
                  ['you went the long way round, and the crawl closed on you', 'вы пошли в обход, и лаз сомкнулся вокруг вас']
                );
          }
        }
      ];
      if (has('torch'))
        a.push({
          label: bi('Light the way with the torch', 'Осветить путь фонариком'),
          sub: bi(
            'Electric light, where none has ever been; the torch may not last',
            'Электрический свет — там, где его никогда не бывало; но фонарик может и не выдержать'
          ),
          go: () => {
            if (tried(B_().torch, ['light']))
              return favour(
                pline(
                  'The electric light goes into the passage like a knife, and whatever was there draws back from it.',
                  'Электрический свет входит в проход, как нож, и то, что там было, отступает перед ним.'
                ),
                [
                  'you lit the power’s own passage with an electric torch, and it drew back',
                  'вы осветили электрическим фонариком проход, сотворённый самой силой, и оно отступило'
                ]
              );
            lose('torch');
            return plain(
              hline(
                'The torch flickers, and dies, and does not come back. You go through in the dark.',
                'Фонарик мигает, гаснет и больше не загорается. Вы проходите в темноте.'
              ),
              ['your torch died in the power’s own passage', 'ваш фонарик погас в проходе, сотворённом самой силой'],
              'm'
            );
          }
        });
      return a;
    }
  },
  dog: {
    when: 'early',
    text: n =>
      pline(
        `Past the ${n.en} gate a lean black dog lies across the way, its chin on its paws, watching you. It does not get up.`,
        `За ${n.i} вратами поперёк прохода лежит поджарый чёрный пёс, положив морду на лапы, и смотрит на вас. Он не встаёт.`
      ),
    choices: () => [
      {
        label: bi('Offer it the bread in your pocket', 'Предложить ему хлеб из кармана'),
        sub: bi('Every dog has its price', 'У всякого пса своя цена'),
        go: () =>
          tried(B_().feedDog, ['offer'])
            ? favour(
                pline(
                  'It takes the bread from your hand, gently, and moves aside, and does not watch you go.',
                  'Он осторожно берёт хлеб с вашей ладони, отходит в сторону и не смотрит вам вслед.'
                ),
                ['you fed the black dog below, and it let you by', 'вы накормили чёрного пса внизу, и он вас пропустил']
              )
            : price(
                hline(
                  'It does not look at the bread. It looks at your hand, and then it takes the hand instead.',
                  'На хлеб он не смотрит. Он смотрит на вашу руку — и хватает вместо хлеба её.'
                ),
                dearer(0, ['offer']),
                1,
                ['the black dog below took your hand instead of the bread', 'чёрный пёс внизу схватил вас за руку вместо хлеба'],
                'grip'
              )
      },
      {
        label: bi('Speak to it, as to a dog at a gate', 'Заговорить с ним, как с привратным псом'),
        sub: bi('The old words for a watchdog', 'Старые слова для сторожевого пса'),
        go: () =>
          tried(B_().callDog, ['word'])
            ? plain(
                pline(
                  'At the old words its ears go back, and it lays its head down again, and lets you step over it.',
                  'Услышав старые слова, он прижимает уши, снова кладёт голову на лапы и даёт вам перешагнуть через себя.'
                ),
                [
                  'you spoke the old words to the black dog below, and it let you by',
                  'вы сказали чёрному псу внизу старые слова, и он вас пропустил'
                ]
              )
            : price(
                hline(
                  'It hears you out, and then it answers, in words, and you will not repeat them.',
                  'Он выслушивает вас до конца, а потом отвечает — словами, и повторять их вы не станете.'
                ),
                dearer(1, ['word']),
                0,
                ['the black dog below answered you in words', 'чёрный пёс внизу ответил вам словами']
              )
      },
      {
        label: bi('Step over it', 'Перешагнуть через него'),
        sub: bi('Without a sound', 'Беззвучно'),
        go: () =>
          tried(B_().stepOver, ['bold'])
            ? plain(
                pline(
                  'You step over it. It does not stir, but you feel its eyes between your shoulders for a long time.',
                  'Вы перешагиваете через него. Он не шевелится, но вы ещё долго чувствуете его взгляд между лопаток.'
                ),
                ['you stepped over the black dog below', 'вы перешагнули через чёрного пса внизу']
              )
            : price(
                hline('It waits until you are over it. Then it bites.', 'Он ждёт, пока вы перешагнёте. Потом кусает.'),
                dearer(0, ['bold']),
                1,
                ['the black dog below bit you as you stepped over it', 'чёрный пёс внизу укусил вас, когда вы через него перешагивали'],
                'grip'
              )
      }
    ]
  },
  brazier: {
    when: 'any',
    text: n => {
      const f = by4({
        fire: ['white', 'белым'],
        dust: ['grey, and gives no warmth', 'серым и не греет'],
        sea: ['green, like a lamp under water', 'зелёным, как лампа под водой'],
        teeth: ['red, and spits like fat', 'красным и плюётся, как жир'],
        plague: ['yellow, and flies crawl about in it unharmed', 'жёлтым, и в нём невредимыми ползают мухи'],
        madness: ['violet, and burns downward', 'лиловым и тянется вниз']
      });
      return pline(
        `Past the ${n.en} gate a brazier burns in a niche before a statue whose face has been chiselled away. The flame is ${f[0]}. Beside it stands a jar of oil.`,
        `За ${n.i} вратами в нише перед статуей со стёсанным лицом горит жаровня. Пламя горит ${f[1]}. Рядом стоит кувшин с маслом.`
      );
    },
    choices: () => [
      {
        label: bi('Feed the flame from the jar', 'Подлить масла в огонь'),
        sub: bi('An offering, as the priests made', 'Приношение, как у жрецов'),
        go: () =>
          tried(B_().feed, ['offer'])
            ? favour(
                pline(
                  'The flame leans toward you, as if in thanks, and the statue lets you by.',
                  'Пламя клонится к вам, будто в благодарность, и статуя пропускает вас.'
                ),
                ['you fed the brazier below, and were let by', 'вы подлили масла в жаровню внизу, и вас пропустили']
              )
            : price(
                hline(
                  'The flame leaps up the length of your arm before you can step back.',
                  'Пламя взбегает по вашей руке прежде, чем вы успеваете отступить.'
                ),
                dearer(0, ['offer']),
                1,
                ['the brazier below leapt up your arm', 'пламя жаровни внизу взбежало по вашей руке'],
                'fire'
              )
      },
      {
        label: bi('Put it out with the water in your flask', 'Залить его водой из фляги'),
        sub: bi('Darkness is safer, perhaps', 'Темнота, пожалуй, безопаснее'),
        go: () =>
          tried(B_().douse, ['water'])
            ? favour(
                pline(
                  'The flame goes out with a sound like a held breath let go, and the statue’s shadow goes out with it.',
                  'Пламя гаснет со звуком отпущенного вдоха, и вместе с ним гаснет тень статуи.'
                ),
                ['you put out the brazier below, and its shadow with it', 'вы погасили жаровню внизу, а с ней и её тень']
              )
            : price(
                hline('The water turns to steam and comes back at your face.', 'Вода обращается паром и бьёт вам в лицо.'),
                dearer(1, ['water']),
                0,
                ['you tried to put out the brazier below, and it scalded you', 'вы пытались погасить жаровню внизу и обварились']
              )
      },
      {
        label: bi('Take a coal to light your way', 'Взять уголь, чтобы освещать путь'),
        sub: bi('Fire from below, to see below by', 'Огонь снизу — чтобы видеть внизу'),
        go: () =>
          tried(B_().coal, ['light', 'take'])
            ? plain(
                pline(
                  'The coal sits in your palm without burning, a small red eye, and by its light the next passage is only a passage.',
                  'Уголь лежит у вас на ладони и не жжёт — маленький красный глаз, и в его свете следующий проход оказывается просто проходом.'
                ) + steadied(1),
                ['you took a coal from the brazier below to light your way', 'вы взяли уголь из жаровни внизу, чтобы освещать путь'],
                'p'
              )
            : price(
                hline('The coal burns through your glove, and through your hand.', 'Уголь прожигает перчатку — и ладонь.'),
                dearer(0, ['light', 'take']),
                1,
                ['a coal from the brazier below burned through your hand', 'уголь из жаровни внизу прожёг вам ладонь'],
                'fire'
              )
      }
    ]
  },
  cradle: {
    when: 'any',
    text: n =>
      pline(
        `In a niche past the ${n.en} gate a cradle of woven reed rocks by itself, slowly. Something in it is breathing.`,
        `В нише за ${n.i} вратами сама собой медленно качается колыбель из плетёного тростника. В ней что-то дышит.`
      ),
    choices: () => [
      {
        label: bi('Rock it, and hum', 'Покачать её и напеть'),
        sub: bi('Whatever it is, let it sleep', 'Что бы это ни было — пусть спит'),
        go: () =>
          tried(B_().rock, ['humble', 'patience'])
            ? favour(
                pline(
                  'Under your hand the breathing slows, and deepens, into sleep.',
                  'Под вашей рукой дыхание замедляется, становится глубже — и переходит в сон.'
                ),
                ['you rocked the cradle below until what was in it slept', 'вы качали колыбель внизу, пока то, что в ней, не уснуло']
              )
            : price(
                hline(
                  'The breathing stops. Then something in the cradle begins to hum with you.',
                  'Дыхание обрывается. Потом что-то в колыбели начинает напевать вместе с вами.'
                ),
                dearer(1, ['humble', 'patience']),
                0,
                ['something in the cradle below hummed with you', 'что-то в колыбели внизу напевало вместе с вами']
              )
      },
      {
        label: bi('Leave something of yours in it', 'Оставить в ней что-нибудь своё'),
        sub: bi('A gift, as the old women did: a comb, a spindle, a button', 'Дар, как оставляли старухи: гребень, веретено, пуговицу'),
        go: () =>
          tried(B_().gift, ['offer'])
            ? favour(
                pline(
                  'You lay a button from your coat in the cradle. It stops rocking, and you are let go, the way one lets go of something paid for.',
                  'Вы кладёте в колыбель пуговицу с пальто. Колыбель перестаёт качаться, и вас отпускают — так отпускают то, за что заплачено.'
                ),
                ['you left a gift in the cradle below, and were let go', 'вы оставили дар в колыбели внизу, и вас отпустили']
              )
            : plain(
                pline(
                  'You lay a button from your coat in the cradle. In the morning, if there is a morning, you will find it sewn back on, and you will not sleep for a week.',
                  'Вы кладёте в колыбель пуговицу с пальто. Утром — если утро наступит — вы найдёте её пришитой обратно и неделю не сможете спать.'
                ),
                ['you left a gift in the cradle below, and it was given back', 'вы оставили дар в колыбели внизу, и его вернули'],
                'm'
              )
      },
      {
        label: bi('Look inside', 'Заглянуть внутрь'),
        sub: bi('You have to know', 'Вам нужно знать'),
        go: () => {
          if (tried(B_().peek, ['take', 'bold']))
            return price(
              lineOr(
                S.patron,
                pline(
                  'There is nothing in the cradle but a fold of linen, warm, and a smell of milk. Pinned to the linen is a scrap of clay:',
                  'В колыбели только сложенная пелёнка, тёплая, и запах молока. К пелёнке приколот обломок глины:'
                ),
                pline(
                  'There is nothing in the cradle but a fold of linen, warm, and a smell of milk.',
                  'В колыбели только сложенная пелёнка, тёплая, и запах молока.'
                )
              ),
              1,
              0,
              ['you looked into the cradle below', 'вы заглянули в колыбель внизу']
            );
          return price(
            hline(
              'Something in the cradle has teeth, and it was waiting for a face.',
              'У того, что в колыбели, есть зубы, и оно ждало лица.'
            ),
            dearer(0, ['take', 'bold']),
            1,
            ['something in the cradle below bit you when you looked in', 'что-то в колыбели внизу укусило вас, когда вы заглянули'],
            'grip'
          );
        }
      }
    ]
  },
  bones: {
    when: 'late',
    text: n =>
      pline(
        `Past the ${n.en} gate, a side chamber is full of bones, laid out in rows: the cult’s offerings of other seasons. On top of the nearest heap lies a canvas satchel with the initials A. C.`,
        `За ${n.i} вратами боковой покой полон костей, разложенных рядами: подношения культа в иные сезоны. На ближайшей груде лежит брезентовая сумка с вытисненными на ней инициалами О. К.`
      ),
    choices: () => [
      {
        label: bi('Open the satchel', 'Открыть сумку'),
        sub: bi('Crane’s, by the initials', 'Судя по инициалам, Крейна'),
        go: () => {
          const missing = charmsToFind(),
            n = dearer(1, ['take']);
          if (missing.length && tried(B_().satchel, ['take'])) {
            const w = pick(missing);
            gain(w);
            return price(
              pline(
                `Inside: Crane’s notebook, his spare spectacles, and ${theItem(w)}, wrapped in a handkerchief.`,
                `Внутри: записная книжка Крейна, его запасные очки и ${ru.item(w)}, завёрнут${ru.ig(w, 'ый', 'ая', 'ое', 'ые')} в носовой платок.`
              ) + gained(w),
              1,
              0,
              [`you found ${theItem(w)} in Crane’s satchel, among the bones`, `среди костей, в сумке Крейна, вы нашли ${ru.item(w, 'a')}`]
            );
          }
          return price(
            lineOr(
              null,
              pline(
                'Inside: Crane’s notebook. The last page is a line from the tablets, copied in a hand that shook:',
                'Внутри: записная книжка Крейна. На последней странице — строка с табличек, переписанная дрожащей рукой:'
              ),
              pline('Inside: Crane’s notebook, every page of it blank.', 'Внутри: записная книжка Крейна, и все страницы в ней пусты.'),
              B_().satchelLine
            ),
            n,
            0,
            ['you opened Crane’s satchel among the bones', 'среди костей вы открыли сумку Крейна']
          );
        }
      },
      {
        label: bi('Leave the dead in peace', 'Оставить мёртвых в покое'),
        sub: bi('They have been disturbed enough', 'Их и так потревожили довольно'),
        go: () =>
          tried(B_().peace, ['refuse'])
            ? favour(
                pline(
                  'You leave them as they lie. As you go, you have the feeling of being thanked.',
                  'Вы оставляете их лежать как есть. Уходя, вы чувствуете, будто вас поблагодарили.'
                ),
                [
                  'you left the cult’s dead in peace, and were thanked for it',
                  'вы оставили мёртвых культа в покое, и вас за это поблагодарили'
                ]
              )
            : plain(pline('You go on. The bones do not care either way.', 'Вы идёте дальше. Костям всё равно.'), [
                'you left the cult’s dead in peace',
                'вы оставили мёртвых культа в покое'
              ])
      }
    ]
  },
  pool: {
    when: 'late',
    text: n =>
      pline(
        `Past the ${n.en} gate the passage opens on a pool of still black water. In it you can see yourself, standing a step behind where you stand.`,
        `За ${n.i} вратами проход выводит к пруду со стоячей чёрной водой. В ней вы видите себя — на шаг позади того места, где стоите.`
      ),
    choices: () => [
      {
        label: bi('Look closer', 'Всмотреться'),
        sub: bi('It may know something', 'Может, оно что-то знает'),
        go: () => {
          const f = S.fin;
          if (!f.named)
            return tried(B_().pool, ['take'])
              ? plain(
                  pline(
                    'Your reflection looks back at you, waiting for a name you never gave; then it shrugs, and is only a reflection.',
                    'Ваше отражение смотрит на вас и ждёт имени, которого вы так и не назвали; потом пожимает плечами — и становится просто отражением.'
                  ),
                  [
                    'your reflection in the black pool waited for a name you never gave, and let it go',
                    'ваше отражение в чёрном пруду ждало имени, которого вы так и не назвали, и не стало настаивать'
                  ]
                )
              : price(
                  hline(
                    'Your reflection looks back at you, waiting for a name you never gave.',
                    'Ваше отражение смотрит на вас и ждёт имени, которого вы так и не назвали.'
                  ),
                  dearer(1, ['take']),
                  0,
                  [
                    'your reflection in the black pool waited for a name you never gave',
                    'ваше отражение в чёрном пруду ждало имени, которого вы так и не назвали'
                  ]
                );
          if (!tried(B_().pool, ['take']))
            return price(
              hline(
                'Your reflection reaches up out of the water and takes hold of your wrist.',
                'Ваше отражение тянется из воды и хватает вас за запястье.'
              ),
              dearer(0, ['take']),
              1,
              ['your reflection in the black pool took hold of you', 'ваше отражение в чёрном пруду схватило вас'],
              'grip'
            );
          // it nods at the right name and shakes its head at a wrong one, all but always (below.truthful)
          const right = (f.named === S.patron) === chance(B_().truthful);
          return price(
            right
              ? hline(
                  'Your reflection nods, slowly, as if you had said the right name.',
                  'Ваше отражение медленно кивает — будто вы назвали верное имя.'
                )
              : hline(
                  'Your reflection shakes its head, slowly, as if you had said the wrong name.',
                  'Ваше отражение медленно качает головой — будто вы назвали не то имя.'
                ),
            1,
            0,
            (right
              ? [
                  'your reflection in the black pool nodded at the name you had given',
                  'ваше отражение в чёрном пруду кивнуло названному вами имени'
                ]
              : [
                  'your reflection in the black pool shook its head at the name you had given',
                  'ваше отражение в чёрном пруду покачало головой, услышав названное вами имя'
                ]
            ).map((x, i) => x + (right === (f.named === S.patron) ? '' : [', and lied', ' — и солгало'][i]))
          );
        }
      },
      {
        label: bi('Break the surface with your boot', 'Разбить гладь сапогом'),
        sub: bi('Whatever it is', 'Что бы это ни было'),
        go: () =>
          tried(B_().breakPool, ['break'])
            ? plain(
                pline(
                  'The reflection breaks into rings, and the rings go out, and there is nobody in the water any more.',
                  'Отражение разбивается на круги, круги расходятся — и в воде больше никого нет.'
                ),
                ['you broke your reflection in the black pool, and it was gone', 'вы разбили своё отражение в чёрном пруду, и оно исчезло']
              )
            : price(
                hline(
                  'The reflection breaks into rings, and every ring has your face in it.',
                  'Отражение разбивается на круги, и в каждом круге — ваше лицо.'
                ),
                dearer(1, ['break']),
                0,
                ['you broke your reflection in the black pool', 'вы разбили своё отражение в чёрном пруду']
              )
      },
      {
        label: bi('Walk round it with your eyes on the wall', 'Обойти его, глядя в стену'),
        sub: bi('Do not look', 'Не смотреть'),
        go: () =>
          tried(B_().noLook, ['refuse'])
            ? plain(
                pline(
                  'You do not look. For the rest of the way down you do not look at anything that shines.',
                  'Вы не смотрите. До самого низа вы не смотрите ни на что блестящее.'
                ),
                ['you walked round the black pool without looking', 'вы обошли чёрный пруд, не глядя в него']
              )
            : price(
                hline(
                  'You do not look, but halfway round you hear it step out of the water behind you, and follow.',
                  'Вы не смотрите, но на полпути слышите, как оно выходит из воды у вас за спиной — и идёт следом.'
                ),
                dearer(1, ['refuse']),
                0,
                ['your reflection followed you out of the black pool', 'ваше отражение вышло за вами из чёрного пруда']
              )
      }
    ]
  },
  falter: {
    when: 'late',
    ok: () => withYou().length > 0,
    text: n => {
      const c = falterer();
      return pline(
        `Past the ${n.en} gate ${c.short} stops dead and will not go on. “I can’t,” ${c.p} says. “I can hear it, Doctor. It knows my name.” ${c.short} is shaking.`,
        `За ${n.i} вратами ${ru.c(c)} замирает на месте и не может идти дальше. «Не могу, — ${ru.gs(c, 'говорит он', 'говорит она')}. — Я слышу его, доктор. Оно знает моё имя». ${ru.c(c)} дрожит.`
      );
    },
    choices: () => {
      const c = falterer(),
        him = EP.him(c);
      return [
        {
          label: bi(`Steady ${him}`, ru.gs(c, 'Успокоить его', 'Успокоить её')),
          sub: bi('It will cost you', 'Это вам дорого обойдётся'),
          go: () => {
            const well = tried(B_().steady, ['company'], c.rapport >= 2 ? B_().trusted : 0);
            // talked down, they come on, mostly (the less if it went badly); else they stay where they stand
            if (chance(B_().comesOn[well ? 0 : 1]))
              return price(
                pline(
                  `You talk ${c.short} down, step by step, and give away more of your own nerve than you can spare. ${c.short} comes on.`,
                  `Шаг за шагом вы успокаиваете ${ru.c(c, 'a')} и отдаёте больше собственного мужества, чем можете себе позволить. ${ru.c(c)} идёт дальше.`
                ),
                well ? 1 : 2,
                0,
                [
                  `you steadied ${c.name} when ${c.p} faltered`,
                  `вы успокоили ${ru.cf(c, 'a')}, когда ${ru.gs(c, 'он дрогнул', 'она дрогнула')}`
                ]
              );
            S.fin.left.push(c.id);
            return price(
              hline(
                `You talk to ${c.short} for a long time, and give away more of your own nerve than you can spare. It is no use. ${c.short} sits down against the wall with ${c.pp} eyes shut, and you go on ${withYou().length > 0 ? 'without ' + him : 'alone'}.`,
                `Вы долго говорите с ${ru.c(c, 'i')} и отдаёте больше собственного мужества, чем можете себе позволить. Без толку: ${ru.c(c)} садится у стены, закрыв глаза, и дальше вы идёте ${withYou().length > 0 ? 'без ' + ru.gs(c, 'него', 'неё') : 'одни'}.`
              ),
              well ? 1 : 2,
              0,
              [
                `you tried to steady ${c.name} when ${c.p} faltered, and could not`,
                `вы пытались успокоить ${ru.cf(c, 'a')}, когда ${ru.gs(c, 'он дрогнул', 'она дрогнула')}, — и не смогли`
              ]
            );
          }
        },
        {
          label: bi(`Send ${him} back up`, ru.gs(c, 'Отправить его наверх', 'Отправить её наверх')),
          sub:
            withYou().length > 1
              ? bi(
                  `${EP.He(c)} will be safe, and you will go on without ${him}`,
                  `${ru.gs(c, 'Он', 'Она')} будет в безопасности, а вы пойдёте дальше без ${ru.gs(c, 'него', 'неё')}`
                )
              : bi(`${EP.He(c)} will be safe, and you will be alone`, `${ru.gs(c, 'Он', 'Она')} будет в безопасности, а вы — одни`),
          go: () => {
            // (all but always: now and then they will not leave you, and come on after all)
            const alone = withYou().length === 1; // (nobody else would be left with you down here)
            if (!chance(B_().goesBack))
              return plain(
                pline(
                  `${c.short} shakes ${c.pp} head. “${alone ? 'And leave you down here alone' : 'And go back up without you'}? No.” ${capS(c.p)} is still shaking, but ${c.p} comes on.`,
                  `${ru.c(c)} качает головой. «${alone ? 'И оставить вас здесь одних' : 'И вернуться наверх без вас'}? Нет». ${ru.gs(c, 'Его', 'Её')} всё ещё трясёт, но ${ru.gs(c, 'он идёт', 'она идёт')} дальше.`
                ),
                [
                  `you sent ${c.name} back up when ${c.p} faltered, and ${c.p} would not go`,
                  `вы отправили ${ru.cf(c, 'a')} наверх, когда ${ru.gs(c, 'он дрогнул', 'она дрогнула')}, но ${ru.gs(c, 'он не ушёл', 'она не ушла')}`
                ]
              );
            S.fin.left.push(c.id);
            return plain(
              pline(
                `${c.short} goes back up toward the light, and you listen to ${c.pp} footsteps for a long time.`,
                `${ru.c(c)} уходит наверх, к свету, и вы долго слушаете ${ru.gs(c, 'его', 'её')} шаги.`
              ),
              [
                `you sent ${c.name} back up when ${c.p} faltered`,
                `вы отправили ${ru.cf(c, 'a')} наверх, когда ${ru.gs(c, 'он дрогнул', 'она дрогнула')}`
              ]
            );
          }
        },
        {
          label: bi(`Go on, and let ${him} follow if ${c.p} can`, 'Идти дальше: пусть идёт следом, если сможет'),
          sub: bi(`${EP.He(c)} may not`, `${ru.gs(c, 'Он', 'Она')} может и не пойти`),
          go: () => {
            if (tried(B_().follow, ['haste'], c.rapport >= 2 ? B_().trusted : 0))
              return plain(
                pline(
                  `After a while you hear ${c.pp} footsteps behind you again.`,
                  `Через некоторое время вы снова слышите за спиной ${ru.gs(c, 'его', 'её')} шаги.`
                ),
                [
                  `${c.name} faltered, and followed you after all`,
                  `${ru.cf(c)} ${ru.gs(c, 'дрогнул', 'дрогнула')}, но всё же ${ru.gs(c, 'пошёл', 'пошла')} за вами`
                ]
              );
            S.fin.left.push(c.id);
            return plain(
              hline(`${c.short} does not follow.`, `${ru.c(c)} не идёт за вами.`),
              [
                `${c.name} faltered, and did not follow you`,
                `${ru.cf(c)} ${ru.gs(c, 'дрогнул', 'дрогнула')} и не ${ru.gs(c, 'пошёл', 'пошла')} за вами`
              ],
              'm'
            );
          }
        }
      ];
    }
  },
  lamassu: {
    when: 'late',
    text: n =>
      pline(
        `Past the ${n.en} gate a winged bull with a man’s face fills the passage, cut from a single block, its beard curled in rows. Its eyes follow your lamp, and they are not stone.`,
        `За ${n.i} вратами проход загораживает крылатый бык с человеческим лицом, высеченный из цельной глыбы, с бородой, завитой рядами. Его глаза следят за вашей лампой, и они не каменные.`
      ),
    choices: () => {
      const charms = S.items.filter(it => ITEMS[it].ward),
        one = charms.length === 1 ? charms[0] : null; // (a single charm is held up, not one by one)
      const a = [];
      if (charms.length)
        a.push({
          label: one
            ? bi('Hold up the charm you carry', 'Показать ему амулет, что при вас')
            : bi('Hold up the charms you carry', 'Показать ему амулеты, что при вас'),
          sub: bi('The old guardians know their own', 'Древние стражи узнают своё'),
          go: () => {
            // the old guardian lowers its eyes before its master's enemy, all but always (below.truthful); now and then
            // before another of the charms, or none
            const ward = S.wardOf[S.patron],
              w = chance(B_().truthful) ? (has(ward) ? ward : null) : pick(charms.filter(x => x !== ward).concat([null]));
            if (w) {
              journal(
                bi(
                  `Below, the winged bull lowered its eyes before ${theItem(w)}.`,
                  `Внизу крылатый бык опустил глаза перед ${ru.item(w, 'i')}.`
                )
              );
              return price(
                one
                  ? pline(
                      `You hold up ${theItem(w)}, and the bull lowers its eyes, as before an old enemy of its master, and lets you by.`,
                      `Вы поднимаете ${ru.item(w, 'a')}, и бык опускает глаза — как перед давним врагом своего господина — и пропускает вас.`
                    )
                  : pline(
                      `One by one you hold them up. At ${theItem(w)} the bull lowers its eyes, as before an old enemy of its master, and lets you by.`,
                      `Вы поднимаете их один за другим. Перед ${ru.item(w, 'i')} бык опускает глаза — как перед давним врагом своего господина — и пропускает вас.`
                    ),
                1,
                0,
                w === ward
                  ? [`the winged bull lowered its eyes before ${theItem(w)}`, `крылатый бык опустил глаза перед ${ru.item(w, 'i')}`]
                  : [
                      `the winged bull lowered its eyes before ${theItem(w)}, which was not the ward`,
                      `крылатый бык опустил глаза перед ${ru.item(w, 'i')} — хотя оберегом было не это`
                    ]
              );
            }
            journal(
              one
                ? bi(
                    `Below, the winged bull did not lower its eyes before ${theItem(one)}.`,
                    `Внизу крылатый бык не опустил глаз перед ${ru.item(one, 'i')}.`
                  )
                : bi(
                    'Below, the winged bull lowered its eyes before none of the charms you carried.',
                    'Внизу крылатый бык не опустил глаз ни перед одним из ваших амулетов.'
                  )
            );
            const ok = tried(B_().charms, ['bronze']);
            return price(
              (one
                ? pline(
                    `You hold up ${theItem(one)}. The bull does not lower its eyes, and you squeeze past under its wing.`,
                    `Вы поднимаете ${ru.item(one, 'a')}. Бык не опускает глаз, и вы протискиваетесь под его крылом.`
                  )
                : pline(
                    'One by one you hold them up. The bull lowers its eyes before none of them, and you squeeze past under its wing.',
                    'Вы поднимаете их один за другим. Бык не опускает глаз ни перед одним, и вы протискиваетесь под его крылом.'
                  )) +
                (ok
                  ? ''
                  : hline(
                      'The wing shifts as you pass, and the stone is very heavy.',
                      'Когда вы проходите, крыло сдвигается, а камень очень тяжёл.'
                    )),
              ok ? 1 : dearer(1, ['bronze']),
              ok ? 0 : 1,
              (one
                ? [
                    `the winged bull did not lower its eyes before ${theItem(one)}`,
                    `крылатый бык не опустил глаз перед ${ru.item(one, 'i')}`
                  ]
                : [
                    'the winged bull lowered its eyes before none of your charms',
                    'крылатый бык не опустил глаз ни перед одним из ваших амулетов'
                  ]
              ).map((x, i) => x + (has(ward) ? [`, though you carried the ward`, ' — хотя оберег был при вас'][i] : '')),
              'wing'
            );
          }
        });
      a.push({
        label: bi('Squeeze past under its wing', 'Протиснуться под его крылом'),
        sub: bi('Quickly', 'Быстро'),
        go: () =>
          tried(B_().wing, ['bold', 'haste'])
            ? plain(
                pline(
                  'You squeeze past. The stone feathers are soft as real ones.',
                  'Вы протискиваетесь мимо. Каменные перья мягкие, как настоящие.'
                ),
                ['you squeezed past the winged bull', 'вы протиснулись мимо крылатого быка']
              )
            : price(
                hline(
                  'The wing comes down. It is only stone, and it is very heavy.',
                  'Крыло опускается. Это всего лишь камень, и он очень тяжёлый.'
                ),
                dearer(0, ['bold', 'haste']),
                1,
                ['the winged bull’s wing came down on you', 'крыло крылатого быка обрушилось на вас'],
                'wing'
              )
      });
      return a;
    }
  },
  scribe: {
    when: 'any',
    text: n =>
      pline(
        `Past the ${n.en} gate, in a niche, a tablet lies half written, a reed stylus beside it, and the clay is still wet.`,
        `За ${n.i} вратами в нише лежит недописанная табличка, рядом тростниковая палочка для письма, и глина ещё влажная.`
      ),
    choices: () => [
      {
        label: bi('Read what is written', 'Прочесть написанное'),
        sub: bi('It costs what reading costs', 'Обойдётся, как всякое чтение'),
        go: () => {
          const ok = tried(B_().read, ['take']),
            h = lineOr(
              null,
              pline(
                'It is a line you know from other clay, written fresh:',
                'Это строка, знакомая вам по другим табличкам, только написанная заново:'
              ),
              pline('It is your own name, in cuneiform, and today’s date.', 'Это ваше имя, клинописью, и сегодняшнее число.'),
              B_().learn
            );
          return ok
            ? plain(h, ['you read the scribe’s unfinished tablet', 'вы прочли недописанную табличку писца'])
            : {
                html: h + readingCost(dearer(1, ['take'])),
                sign: 'm',
                said: [
                  'you read the scribe’s unfinished tablet, and it read you',
                  'вы прочли недописанную табличку писца, и она прочла вас'
                ]
              };
        }
      },
      {
        label: bi('Finish the line', 'Дописать строку'),
        sub: bi('Let your hand decide', 'Пусть решит рука'),
        go: () =>
          tried(B_().finish, ['word'])
            ? favour(
                pline(
                  'Your hand writes the last signs before you can stop it. The writing is good. Something below is pleased.',
                  'Рука дописывает последние знаки прежде, чем вы успеваете её остановить. Написано хорошо. Что-то внизу одобряет.'
                ),
                ['you finished the scribe’s line, and something below was pleased', 'вы дописали строку писца, и что-то внизу это одобрило']
              )
            : price(
                hline(
                  'Your hand writes your own name, and the date, and you cannot make it stop.',
                  'Рука пишет ваше имя, и число, и вы не можете её остановить.'
                ),
                dearer(1, ['word']),
                0,
                ['your hand finished the scribe’s line with your own name', 'ваша рука дописала строку писца вашим собственным именем']
              )
      },
      {
        label: bi('Smash it', 'Разбить её'),
        sub: bi('Some things should not be finished', 'Иное лучше не дописывать'),
        go: () =>
          tried(B_().smash, ['break'])
            ? favour(
                pline(
                  'The tablet breaks like any clay. Far below, the chanting falters, and takes a while to find its place again.',
                  'Табличка бьётся, как любая глина. Далеко внизу пение сбивается и не сразу находит прежний лад.'
                ),
                ['you smashed the scribe’s tablet, and the chanting below faltered', 'вы разбили табличку писца, и пение внизу сбилось']
              )
            : price(
                pline(
                  'The tablet breaks like any clay. Nothing else happens, which is somehow worse; and then, behind you, the scratch of a stylus begins again.',
                  'Табличка бьётся, как любая глина. Больше ничего не происходит — и от этого почему-то хуже; а потом за спиной снова начинает скрести палочка писца.'
                ),
                dearer(0, ['break']),
                0,
                ['you smashed the scribe’s tablet, and it was begun again', 'вы разбили табличку писца, и её начали заново']
              )
      }
    ]
  },
  // the Seven, as the old hymns count them: the more of the power's signs you have seen, the better you know its servants
  seven: {
    when: 'late',
    text: n =>
      pline(
        `Past the ${n.en} gate seven figures stand in a ring across the passage, their backs to you, their heads bowed. The only way on is through them.`,
        `За ${n.i} вратами поперёк прохода кольцом стоят семь фигур, спиной к вам, склонив головы. Дальше пути нет — только сквозь них.`
      ),
    choices: () => {
      const known = B_().sevenSigns * S.omenSeen.length;
      return [
        {
          label: bi('Count them aloud, one to seven', 'Пересчитать их вслух, от одного до семи'),
          sub: bi('As the old hymns count the Seven', 'Как считают Семерых древние гимны'),
          go: () =>
            tried(B_().count, ['word'], known)
              ? favour(
                  pline(
                    'At “seven” the ring opens, as if you had said a password.',
                    'На слове «семь» кольцо размыкается, словно вы назвали пароль.'
                  ),
                  ['you counted the Seven aloud, and the ring opened', 'вы пересчитали Семерых вслух, и кольцо разомкнулось']
                )
              : price(
                  hline(
                    'You count seven. Then a voice behind you says “eight”.',
                    'Вы насчитываете семь. Потом голос у вас за спиной говорит: «восемь».'
                  ),
                  dearer(1, ['word']),
                  0,
                  ['you counted the Seven aloud, and there were eight', 'вы пересчитали Семерых вслух, и их оказалось восемь']
                )
        },
        {
          label: bi('Edge round them, along the wall', 'Обойти их вдоль стены'),
          sub: bi('Slowly, and touching nobody', 'Медленно, никого не задев'),
          go: () =>
            tried(B_().ring, ['patience'], known)
              ? plain(
                  pline(
                    'You edge round with your back to the wall. None of them turns.',
                    'Вы пробираетесь вдоль стены, прижавшись к ней спиной. Ни одна фигура не оборачивается.'
                  ),
                  ['you edged round the Seven along the wall', 'вы обошли Семерых вдоль стены']
                )
              : price(
                  hline(
                    'As you pass the last of them, it turns its head all the way round to look at you.',
                    'Когда вы проходите мимо последней, она поворачивает голову к вам — до конца, кругом.'
                  ),
                  dearer(1, ['patience']),
                  0,
                  ['one of the Seven turned its head to watch you pass', 'одна из Семерых повернула голову вам вслед']
                )
        },
        {
          label: bi('Walk straight through the ring', 'Пройти прямо сквозь кольцо'),
          sub: bi('They are only figures', 'Это всего лишь фигуры'),
          go: () =>
            tried(B_().ringThrough, ['bold'], known)
              ? plain(
                  pline(
                    'You walk through the ring. They are only figures, after all.',
                    'Вы проходите сквозь кольцо. Это и правда всего лишь фигуры.'
                  ),
                  ['you walked straight through the ring of the Seven', 'вы прошли прямо сквозь кольцо Семерых']
                )
              : price(
                  hline(
                    'Seven hands close on you at once, and let go one by one.',
                    'Семь рук разом смыкаются на вас — и отпускают одна за другой.'
                  ),
                  dearer(0, ['bold']),
                  1,
                  ['the Seven took hold of you as you walked through them', 'Семеро схватили вас, когда вы проходили сквозь их кольцо'],
                  'grip'
                )
        }
      ];
    }
  },
  salt: {
    when: 'late',
    text: n =>
      pline(
        `Past the ${n.en} gate the floor is white with salt, and a channel of black water runs across it, too wide to step and too dark to see the bottom.`,
        `За ${n.i} вратами пол бел от соли, и поперёк него бежит канал чёрной воды — слишком широкий, чтобы перешагнуть, и слишком тёмный, чтобы разглядеть дно.`
      ),
    choices: () => [
      {
        label: bi('Wade across', 'Перейти вброд'),
        sub: bi('Quickly, before you think about it', 'Быстро, пока не успели подумать'),
        go: () =>
          tried(B_().wade, ['water', 'haste'])
            ? plain(pline('The water is only to your knees, and only cold.', 'Вода вам только по колено — и всего лишь холодная.'), [
                'you waded the channel of black water',
                'вы перешли вброд канал чёрной воды'
              ])
            : price(
                hline('Halfway across the bottom is not there any more.', 'На полпути дна под ногами больше нет.'),
                dearer(0, ['water', 'haste']),
                1,
                ['the channel of black water took you under', 'канал чёрной воды утянул вас на дно'],
                'grip'
              )
      },
      {
        label: bi('Pour a libation into it first', 'Сначала совершить возлияние'),
        sub: bi('A little of your water, to the water below', 'Немного вашей воды — воде внизу'),
        go: () =>
          tried(B_().libation, ['offer', 'water'])
            ? favour(
                pline(
                  'The channel stills, and narrows, and you step across it dry-shod.',
                  'Канал успокаивается, сужается, и вы переступаете его, не замочив ног.'
                ),
                [
                  'you poured a libation into the channel of black water, and it let you over',
                  'вы совершили возлияние в канал чёрной воды, и он вас пропустил'
                ]
              )
            : price(
                hline(
                  'The channel drinks your water and rises, and you cross it to the waist.',
                  'Канал выпивает вашу воду и поднимается, и вы переходите его по пояс.'
                ),
                dearer(1, ['offer', 'water']),
                0,
                ['the channel of black water drank your libation and rose', 'канал чёрной воды выпил ваше возлияние и поднялся']
              )
      },
      {
        label: bi('Take a run, and leap it', 'Разбежаться и перепрыгнуть'),
        sub: bi('It is not so very wide', 'Не так уж он и широк'),
        go: () =>
          tried(B_().leap, ['bold', 'haste'], -B_().wounded * S.wounds)
            ? plain(
                pline(
                  'You land on the far side on your hands and knees, and the salt bites your palms.',
                  'Вы приземляетесь на той стороне на четвереньки, и соль кусает ладони.'
                ),
                ['you leapt the channel of black water', 'вы перепрыгнули канал чёрной воды']
              )
            : price(
                hline('It is wider than it looks. It is much wider than it looks.', 'Он шире, чем кажется. Гораздо шире, чем кажется.'),
                dearer(0, ['bold', 'haste']),
                1,
                ['you fell short of the channel of black water', 'вы не допрыгнули через канал чёрной воды'],
                'grip'
              )
      }
    ]
  }
};
// One thing between two gates, or now and then two (RULES.below.twice): drawn from what can come there (early or late),
// never twice in one descent; told at the gate it waits behind (gates: the two it can be).
function between(stage, gates, next, two = null) {
  const f = S.fin;
  f.enc = f.enc || [];
  const pool = Object.keys(BELOW).filter(
    k => (BELOW[k].when === stage || BELOW[k].when === 'any') && !f.enc.some(e => e.id === k) && (!BELOW[k].ok || BELOW[k].ok())
  );
  if (!pool.length) {
    next();
    return;
  }
  const both = two === null ? chance(RULES.below.twice) : two,
    id = pick(pool),
    gate = both ? gates[0] : pick(gates),
    n = GATE_N[gate],
    E = BELOW[id],
    after = both ? () => between(stage, gates.slice(1), next, false) : next;
  S.phase = 'descent';
  show({
    kicker: DESC(),
    title: bi(`The ${n.en} gate`, `${n.n} врата`),
    body: [E.text(n)],
    choices: E.choices().map((ch, k) => ({
      label: ch.label,
      sub: ch.sub,
      fn: () => {
        const r = ch.go();
        f.enc.push({ id, gate, k, sign: r.sign, said: r.said });
        stepOn(r.html, after);
      }
    }))
  });
}
