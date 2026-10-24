// ===================== YOUR OWN DREAMS =====================
// Now and then you dream yourself. Each season deals, unseen, how often you dream (it may be never) and how often a
// dream tells the truth (RULES.yourDreams); a dream comes in the night, before you know what the night has done. It may
// be of anyone, you among them: the gates and who stands where; whom the night comes for; who cares for whom; a habit
// at an old scene; a part someone keeps; whom someone lies awake for; a line of the tablets; and, only of what is already
// sure, what is to come, which is never false. Nothing says which dreams are true: only the ending (game/debrief.js).

function dealYourDreams() {
  const Y = RULES.yourDreams;
  S.you = { rate: +wpick(Y.rate), truth: +wpick(Y.truth), dreams: [] };
}
// the dreams, by kind: whether one can be dreamt tonight (can), and the dream itself (dream: true or false, as the dice
// said; returns { en, ru, about } or null when this one cannot be told that way after all)
const YOUR_DREAM = {
  // the seven gates, and who stands inside them: anyone still at the dig, or now and then yourself
  verdict: {
    can: () => true,
    dream(night, tru) {
      if (chance(RULES.yourDreams.self))
        return tru
          ? {
              en: 'You dream of the seven gates. You stand outside them, weeping, and cannot remember why.',
              ru: 'Вам снятся семь врат. Вы стоите снаружи и плачете и никак не можете вспомнить, о чём.'
            }
          : {
              en: 'You dream of the seven gates, and you are standing inside the seventh. A hand rests on your shoulder, heavy and warm, and you are glad of it.',
              ru: 'Вам снятся семь врат, и вы стоите за седьмыми. На плече у вас лежит рука, тяжёлая и тёплая, и вы ей рады.'
            };
      const t = pick(freeChars());
      if (!t) return null;
      const cult = (t.role === 'cult') === tru;
      return {
        about: t.id,
        en: cult
          ? `You dream of the seven gates. ${t.short} stands inside the seventh, and the god’s hand is on ${t.pp} shoulder.`
          : `You dream of the seven gates. ${t.short} stands outside them, weeping.`,
        ru: cult
          ? `Вам снятся семь врат. ${ru.c(t)} стоит за седьмыми, и рука бога лежит у ${ru.gs(t, 'него', 'неё')} на плече.`
          : `Вам снятся семь врат. ${ru.c(t)} стоит снаружи и плачет.`
      };
    }
  },
  // whom the night comes for tonight: someone, you, or nobody at all
  death: {
    can: () => true,
    dream(night, tru) {
      const t = night.target,
        others = freeChars().filter(c => c.id !== t),
        over = v => ({
          about: v.id,
          en: `You dream of something standing over ${v.short} in the dark, patient as a heron.`,
          ru: `Вам снится, что над ${ru.c(v, 'i')} в темноте стоит что-то — терпеливое, как цапля.`
        }),
        you = {
          en: 'You dream that you are standing outside your own tent in the dark, and something goes in past you without a sound.',
          ru: 'Вам снится, что вы стоите в темноте у собственной палатки, а что-то беззвучно проходит мимо вас внутрь.'
        },
        none = {
          en: 'You dream of the camp asleep, every lamp out, and nothing moving between the tents all night.',
          ru: 'Вам снится спящий лагерь: все лампы погашены, и всю ночь между палатками ничто не шевелится.'
        };
      if (tru) return !t ? none : t === 'player' ? you : over(C(t));
      if (!t) return others.length && !chance(RULES.yourDreams.youFalse) ? over(pick(others)) : you;
      return others.length && chance(RULES.yourDreams.someoneFalse) ? over(pick(others)) : none;
    }
  },
  // who cares for whom: two of them, as they feel about each other, or the other way about
  likes: {
    can: () => freeChars().length >= 2,
    dream(night, tru) {
      const [a, b] = shuffle(freeChars()).slice(0, 2),
        sign = v => (v >= 1 ? 1 : v <= -1 ? -1 : 0),
        flip = v => (v ? -v : pick([-1, 1]));
      let ab = sign(likes(a.id, b.id)),
        ba = sign(likes(b.id, a.id));
      if (!tru) [ab, ba] = chance(0.5) ? [flip(ab), ba] : [ab, flip(ba)];
      const [en, rus] =
        ab > 0 && ba > 0
          ? [
              `${a.short} and ${b.short} walk the edge of the canal together, deep in talk.`,
              `${ru.c(a)} и ${ru.c(b)} идут вдвоём по берегу канала, увлечённые разговором.`
            ]
          : ab > 0 && ba < 0
            ? [
                `${a.short} calls after ${b.short} across the camp, and ${b.short} walks on faster.`,
                `${ru.c(a)} окликает ${ru.c(b, 'a')} через весь лагерь, а ${ru.c(b)} только прибавляет шагу.`
              ]
            : ab < 0 && ba > 0
              ? [
                  `${b.short} calls after ${a.short} across the camp, and ${a.short} walks on faster.`,
                  `${ru.c(b)} окликает ${ru.c(a, 'a')} через весь лагерь, а ${ru.c(a)} только прибавляет шагу.`
                ]
              : ab < 0 && ba < 0
                ? [
                    `${a.short} and ${b.short} sit at one table with their backs to each other.`,
                    `${ru.c(a)} и ${ru.c(b)} сидят за одним столом, повернувшись друг к другу спиной.`
                  ]
                : ab > 0
                  ? [
                      `${a.short} calls after ${b.short} across the camp, and ${b.short} does not hear.`,
                      `${ru.c(a)} окликает ${ru.c(b, 'a')} через весь лагерь, а ${ru.c(b)} не слышит.`
                    ]
                  : ba > 0
                    ? [
                        `${b.short} calls after ${a.short} across the camp, and ${a.short} does not hear.`,
                        `${ru.c(b)} окликает ${ru.c(a, 'a')} через весь лагерь, а ${ru.c(a)} не слышит.`
                      ]
                    : ab < 0 || ba < 0
                      ? [
                          `${ab < 0 ? a.short : b.short} steps off the path to let ${ab < 0 ? b.short : a.short} pass, and spits.`,
                          `${ru.c(ab < 0 ? a : b)} сходит с тропы, пропуская ${ru.c(ab < 0 ? b : a, 'a')}, и сплёвывает.`
                        ]
                      : [
                          `${a.short} and ${b.short} pass each other on the path without a glance.`,
                          `${ru.c(a)} и ${ru.c(b)} проходят друг мимо друга по тропе, не взглянув.`
                        ];
      return { about: a.id, en: `You dream of the camp by day. ${en}`, ru: `Вам снится лагерь днём. ${rus}` };
    }
  },
  // a habit, seen at the scene of an old attack: the attacker's, or not
  habit: {
    can: () => pastScenes().length > 0,
    dream(night, tru) {
      const n = pick(pastScenes()),
        rec = S.nights[n],
        actor = C(rec.actor),
        cat = pick(CATS),
        val = tru ? actor.traits[cat] : pick(Object.keys(TRAITS[cat].vals).filter(v => v !== actor.traits[cat])),
        clue = TRAITS[cat].vals[val].clue,
        at = LOCS[rec.crimeLoc === 'camp' ? 'camp' : rec.crimeLoc];
      return {
        about: actor.id,
        en: `You dream of the night of an attack, ${at.at}: ${clue}, and nobody there.`,
        ru: `Вам снится ночь нападения, ${R(at.at)}: ${R(clue)}, и рядом никого.`
      };
    }
  },
  // a part someone keeps: the Dreamer's, the Watcher's, the thief's (of a part someone at the dig still keeps, so that
  // the dream can be true or false alike)
  part: {
    can: () => freeChars().length >= 2 && PARTS_DREAMT.some(r => freeChars().some(c => c.role === r)),
    dream(night, tru) {
      const role = pick(PARTS_DREAMT.filter(r => freeChars().some(c => c.role === r))),
        t = tru ? freeChars().find(c => c.role === role) : pick(freeChars().filter(c => c.role !== role));
      const say = {
        seer: [
          `You dream of ${t.short} asleep with ${t.pp} eyes open, and in ${t.pp} eyes the seven gates, very small.`,
          `Вам снится, что ${ru.c(t)} спит с открытыми глазами, и в глазах у ${ru.gs(t, 'него', 'неё')} — семь врат, совсем крошечных.`
        ],
        warden: [
          `You dream of a lamp going round and round the tents all night, and ${t.short}’s face above it.`,
          `Вам снится лампа, которая всю ночь кружит между палатками, и над ней — лицо ${ru.c(t, 'g')}.`
        ],
        smuggler: [
          `You dream of ${t.short}’s hands, black with the dust of the store crates, counting something by touch.`,
          `Вам снятся руки ${ru.c(t, 'g')}, чёрные от пыли складских ящиков: они что-то пересчитывают на ощупь.`
        ]
      }[role];
      return { about: t.id, en: say[0], ru: say[1] };
    }
  },
  // whom someone lies awake for: one who suspects another in earnest (only once someone does, and someone does not, so
  // that the dream can be true or false alike)
  fear: {
    can: () => {
      const p = fearPairs();
      return p.some(x => x[2]) && p.some(x => !x[2]);
    },
    dream(night, tru) {
      const [a, b] = pick(fearPairs().filter(x => x[2] === tru));
      return {
        about: a.id,
        en: `You dream of ${a.short} lying awake in the dark, listening for ${b.short}.`,
        ru: `Вам снится, что ${ru.c(a)} лежит без сна в темноте и прислушивается — не идёт ли ${ru.c(b)}.`
      };
    }
  },
  // a line of the tablets, read in the dream: a true one, or one the dream has changed
  line: {
    can: () => S.facts && S.facts.length > 0,
    dream(night, tru) {
      const f = pick(S.facts),
        shown = tru ? f : scribeErr(f);
      return {
        line: tru && !f.scribe, // (a dream of a line that was a scribe's error is false however it came)
        html:
          bi(
            'In your dream a tablet lies open on your knees, and you can read every wedge of it: “',
            'Во сне у вас на коленях лежит открытая табличка, и вы можете прочесть каждый клин: «'
          ) +
          shown.text +
          bi('”', '»')
      };
    }
  },
  // what is to come, and only what is already sure: the gate under the ziggurat, on the night the moon is dark, unless
  // something stops it first (it may open sooner, or never, and the dream is no less true for that)
  gate: {
    can: () => S.day >= 3 && S.day < RULES.start.days,
    dream() {
      const tomorrow = S.day === RULES.start.days - 1;
      return {
        sure: true,
        en: `You dream of the stair under the ziggurat, and of the door at the bottom of it, and you know, as one knows in dreams, that it will stand open ${tomorrow ? 'tomorrow night' : 'on the night the moon is dark'}, if nothing stops it first.`,
        ru: `Вам снится лестница под зиккуратом и дверь у её подножия, и вы знаете — как знают во сне, — что она будет открыта ${tomorrow ? 'завтрашней ночью' : 'в ночь новолуния'}, если ничто не остановит этого раньше.`
      };
    }
  }
};
// the parts a dream may show someone keeping
const PARTS_DREAMT = ['seer', 'warden', 'smuggler'];
// every two at the dig, one way about, and whether the first suspects the other in earnest
function fearPairs() {
  const out = [];
  freeChars().forEach(a => freeChars().forEach(b => a !== b && out.push([a, b, sus(a.id, b.id) >= 2])));
  return out;
}
// the nights there was an attack someone carried out, and you know where
const pastScenes = () =>
  Object.keys(S.nights || {})
    .map(Number)
    .filter(n => n < S.day && S.nights[n] && S.nights[n].actor && S.nights[n].crimeLoc && S.chars[S.nights[n].actor]);
// Tonight's dream, if you dream tonight: told before anything else the night has done (game/night.js); kept for the
// ending, and in your journal.
function yourDream(night) {
  if (!S.you || !chance(S.you.rate)) return '';
  const Y = RULES.yourDreams,
    kinds = Object.keys(Y.kinds).filter(k => YOUR_DREAM[k].can(night));
  for (let tries = 0; tries < 4 && kinds.length; tries++) {
    const w = Object.fromEntries(kinds.map(k => [k, Y.kinds[k]])),
      k = wpick(w),
      tru = chance(S.you.truth),
      d = YOUR_DREAM[k].dream(night, tru);
    if (!d) {
      kinds.splice(kinds.indexOf(k), 1);
      continue;
    }
    const truth = d.sure ? true : d.line != null ? d.line : tru,
      html = d.html || bi(d.en, d.ru); // (a dream's words, in both languages)
    S.you.dreams.push({ night: S.day, kind: k, true: truth, html });
    journal(html);
    emit('yourdream');
    return `<p class="dream">${html}</p>`;
  }
  return '';
}
