// ===================== A VISIT IN THE NIGHT =====================
// Once a season at most, as the evening ends, a woman with a soft spot for you who has come to trust you may come to
// your tent: afraid, she says, that they may not see the light of day, and not wanting to be alone (RULES.visit). You
// may let her stay, or send her back; sent back, she trusts you less. If she stays, she may be of the cult, and then
// she may try to kill you herself, and mostly she does (if not, she is taken away, as one of them unmasked); otherwise
// the night goes as any night, by its own dice: the cult coming for her finds her tent empty; coming for you, past the
// Watcher, the bowl, the revolver and luck, it finds two of you (RULES.visit.through: her dead, you, both, or only the
// usual harm). The morning after, if you both live, your nerve may mend and her trust may grow. The camp talks of it
// either way, and from then on someone may tell it as gossip, badly or kindly, and whoever hears it may think the less
// or the better of her, and of you (people/gossip.js, a night in your tent; people/moments.js, the scandal); and a flirtation that
// came to this may come to more (game/fates.js). An occultist may feel the cult's
// cold as she comes in, or a cold that is only the night (as in any conversation). Nothing of it is ever explained: the
// ending tells what she was, and what the night held (game/debrief.js).

// whether someone comes tonight, and who: of the women at the dig who have a soft spot for you and trust you, the
// fonder the likelier; the likelier the more the night has taken
function visitTonight() {
  const VR = RULES.visit;
  if (S.log.visit || S.day < VR.from || deedTonight()) return null; // (not the night you go out yourself: game/deed.js)
  const may = freeChars().filter(Ties.sweetOnYou);
  if (!may.length || !chance(Math.min(VR.max, VR.odds + VR.perDead * S.stats.taken))) return null;
  return C(wpick(Object.fromEntries(may.map(c => [c.id, c.rapport]))));
}
// the knock at the tent pole, and your answer; her face as she hears it (the night follows: game/night.js, nightComes)
function visitScene(h) {
  S.phase = 'visit';
  emit('visit');
  const chill = S.bg === 'occultist' && chance(h.role === 'cult' ? RULES.talk.chillCult : RULES.talk.chillOther);
  if (chill) addTest(h.id, h.id, 'chill', 'cult');
  show({
    kicker: bi(`Day ${S.day} of ${RULES.start.days} · Late evening`, `День ${S.day} из ${RULES.start.days} · Поздний вечер`),
    title: bi('A knock at the tent pole', 'Стук по шесту палатки'),
    // (her face at your tent in the dark: not flirting, and the same whatever she is, FACES.visit)
    art: { bg: 'camp', time: 'night', talk: h.id, mood: FACES.visit },
    body: [
      bi(
        `<p>Late, when the camp has gone quiet, someone taps at your tent pole. It is ${h.short}, a shawl round her shoulders and no lamp. “Forgive me, Doctor. I could not sleep.” She looks past you, into the dark between the tents. “I am afraid we may not see the light of day. I would rather not spend this night alone.”</p>`,
        `<p>Поздно, когда лагерь уже затих, кто-то стучит по шесту вашей палатки. Это ${ru.c(h)} — шаль на плечах, лампы нет. «Простите, доктор. Я не могу уснуть». Она смотрит мимо вас, в темноту между палатками. «Боюсь, мы можем не увидеть рассвета. Я не хочу провести эту ночь одна».</p>`
      ) +
        (chill
          ? `<p class="note">${bi('As she steps in out of the dark, a cold goes through you that has nothing to do with the night.', 'Когда она шагает к вам из темноты, вас пробирает холод, который не имеет ничего общего с ночью.')}</p>`
          : '')
    ],
    choices: [
      { label: bi('Let her stay', 'Оставить её у себя'), fn: () => visitAnswer(h, true, chill) },
      { label: bi('Send her back to her tent', 'Отправить её обратно'), cls: 'minor', fn: () => visitAnswer(h, false, chill) }
    ]
  });
}
// Your answer: turned away, she trusts you less, mostly (two steps less, now and then); either way the camp will have
// heard of it by morning (people/social.js, ripple).
function visitAnswer(h, yes, chill) {
  const VR = RULES.visit;
  S.log.visit = { id: h.id, day: S.day, agreed: yes, chill, hurt: 0, heard: [] }; // (heard: who has made up their mind about it, told as gossip: people/moments.js, the scandal)
  if (!yes) {
    if (chance(VR.hurt)) {
      Ties.moveTrust(h, -1, 'deed');
      S.log.visit.hurt++;
      if (chance(VR.hurtMore)) {
        Ties.moveTrust(h, -1, 'deed');
        S.log.visit.hurt++;
      }
    }
    Gossip.wordOf(h, 'turnedAway');
  }
  journal(
    yes
      ? bi(
          `${h.name} came to your tent as the evening ended, and stayed.`,
          `Под конец вечера к вам в палатку ${ru.gs(h, 'пришёл', 'пришла')} ${ru.cf(h)} — и ${ru.gs(h, 'остался', 'осталась')}.`
        )
      : bi(
          `${h.name} came to your tent as the evening ended, and you sent her back.`,
          `Под конец вечера к вам в палатку ${ru.gs(h, 'пришёл', 'пришла')} ${ru.cf(h)}, и вы отправили её обратно.`
        )
  );
  visitReply(h);
}
// Her face as she hears your answer, fixed by the season (no dice): let her stay, and her look turns to heavy lids,
// whatever she is (FACES.visitYes); sent back, she stays as sad as she came, or stares as if she had not heard you right,
// or her face closes against you, the more readily the more it cost her (FACES.visitNo; × visitHurt for angry when she
// trusts you less for it). Then the night (game/night.js, nightComes).
function visitReply(h) {
  const v = S.log.visit,
    no = { ...FACES.visitNo, angry: (FACES.visitNo.angry || 0) * (v.hurt ? FACES.visitHurt : 1) },
    face = v.agreed ? FACES.visitYes : slotPick(h, 'visitNo', no);
  show({
    kicker: bi(`Day ${S.day} of ${RULES.start.days} · Late evening`, `День ${S.day} из ${RULES.start.days} · Поздний вечер`),
    title: bi('A knock at the tent pole', 'Стук по шесту палатки'),
    art: { bg: 'camp', time: 'night', talk: h.id, mood: face },
    body: [visitSaid(h, v, face)],
    choices: [{ label: v.agreed ? bi('Put out the lamp', 'Погасить лампу') : bi('Try to sleep', 'Попытаться уснуть'), fn: nightComes }]
  });
}
// the one who stays in your tent tonight, if she is still free to; on night n, her id (people/alibis.js)
const guestOn = n => {
  const v = S.log && S.log.visit;
  return v && v.agreed && v.day === n && S.chars[v.id] && isFree(C(v.id)) ? v.id : null;
};
const visitGuest = () => (guestOn(S.day) ? C(guestOn(S.day)) : null);
// whether id spent night n in your tent, and so was nowhere else that night: not keeping watch elsewhere, not out
// robbing the dig, not by your tent pole, not the first to come on a body at dawn (game/night.js, people/thief.js,
// world/deaths.js)
const inYourTent = (id, n = S.day) => !!id && guestOn(n) === id;
// how the evening ended, as her face has it (visitReply)
const VISIT_NO = {
  sad: ['She nods, as if she had known you would, and goes without a word.', 'Она кивает, будто знала, что так и будет, и уходит молча.'],
  surprised: [
    'She stares at you as if she had not heard you right; then she pulls the shawl tight and goes, and does not look back.',
    'Она смотрит на вас так, будто ослышалась; потом плотнее запахивает шаль и уходит, не оборачиваясь.'
  ],
  angry: [
    'Her face shuts like a door. She goes without a word, and does not look back.',
    'Её лицо захлопывается, как дверь. Она уходит молча и не оборачивается.'
  ]
};
function visitSaid(h, v, face) {
  return v.agreed
    ? bi(
        `<p>${h.short} stays. She lets the shawl slip from her shoulders, and some time later the lamp goes out.</p>`,
        `<p>${ru.c(h)} остаётся. Шаль соскальзывает с её плеч, и чуть позже лампа гаснет.</p>`
      )
    : bi(
        `<p>You send ${h.short} back to her tent as gently as you can. ${VISIT_NO[face][0]}</p>`,
        `<p>Вы отправляете ${ru.c(h, 'a')} обратно так мягко, как только можете. ${VISIT_NO[face][1]}</p>`
      ) + (v.hurt ? trustNote([], [h.id]) : '');
}
// One of the cult in your tent may do the cult's work herself (strike), and mostly she does it (kills: the season ends);
// if not, you have her wrist in time, and by first light she is on the lorry to Hillah, as one of them unmasked. Returns
// what the night tells, or '' if she lets you be.
function guestStrikes(night) {
  const h = night.guest,
    VR = RULES.visit;
  if (!h || h.role !== 'cult' || !chance(VR.strike)) return '';
  if (chance(VR.kills)) {
    S.log.visit.struck = 'killed';
    S.log.attacks.push({ day: S.day, how: 'visit' });
    killYou('visit');
    return '';
  }
  S.log.visit.struck = 'failed';
  night.guest = null;
  night.unmasked = h.id;
  h.status = 'exposed';
  h.exposedHow = 'night';
  S.stats.right++;
  S.revealed[h.id] = 'cult';
  fixMark(h);
  S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight));
  journal(
    bi(
      `${h.name} tried to kill you in the night, and was taken away.`,
      `${capS(ru.cf(h))} ${ru.gs(h, 'пытался', 'пыталась')} убить вас ночью, и ${ru.gs(h, 'его', 'её')} увезли.`
    )
  );
  const html =
    bi(
      `<p class="horror">In the small hours you wake to the cold of a blade at your throat, and catch ${h.short}’s wrist just in time. She does not cry out. By first light she is sitting in the back of the lorry to Hillah under guard, and in her kit they find a cylinder seal cut with seven gates.</p>`,
      `<p class="horror">Под утро вы просыпаетесь от холода лезвия у горла и успеваете перехватить запястье ${ru.c(h, 'g')}. Она не издаёт ни звука. На рассвете она уже сидит под охраной в кузове грузовика, идущего в Хиллу, а в её вещах находят цилиндрическую печать с вырезанными на ней семью вратами.</p>`
    ) + hurt(2, 1);
  S.hurtBy = 'wrist'; // (her blade, if that wound is the last: game/endings.js)
  return html;
}
// The cult came for her, as for anyone on any night. It may know where she sleeps tonight (found): then it comes to your
// tent, past the Watcher if he watches it (and his chance of turning anyone), and past luck, and she dies beside you in
// your sleep; or it finds her own tent empty, and nobody dies, and by breakfast the camp has worked out where she slept.
function herNight(night) {
  const h = night.guest,
    N = RULES.night;
  if (chance(RULES.visit.found)) {
    night.loc = 'camp'; // (your tent)
    if (night.guard === 'player' && chance(N.watched)) {
      night.saved = 'watch';
      S.log.visit.found = 'watch';
      S.log.guarded.push({ day: S.day, id: h.id });
      return bi(
        `<p>In the small hours you hear a scuffle outside your tent and a curse. By the time you get the flap open there is nobody there: only a lamp going away between the tents. ${h.short} has not woken.</p>`,
        `<p>Под утро у палатки слышны возня и чья-то ругань. Когда вы откидываете полог, снаружи уже никого нет — только лампа удаляется между палатками. ${ru.c(h)} так и не проснулась.</p>`
      );
    }
    if (chance(N.spared)) {
      night.saved = 'luck';
      S.log.visit.found = 'luck';
      S.log.spared.push({ day: S.day, id: h.id });
      return bi(
        `<p>In the small hours the dogs start up all along the lines, and someone runs past your tent and away into the dark. ${h.short} sits up, and you hold her until it is light.</p>`,
        `<p>Под утро по всему лагерю заходятся собаки, и кто-то пробегает мимо вашей палатки и исчезает в темноте. ${ru.c(h)} садится на койке, и вы держите её в руках до самого рассвета.</p>`
      );
    }
    S.log.visit.found = 'dead';
    night.dead = h.id;
    takenInYourTent(h);
    return (
      bi(
        `<p class="horror">You wake in the grey light with an arm gone numb under ${h.short}’s weight, and it is a long moment before you understand why she is so still.</p>`,
        `<p class="horror">Вы просыпаетесь в сером свете: рука затекла под тяжестью ${ru.c(h, 'g')}, — и проходит долгое мгновение, прежде чем вы понимаете, почему она так неподвижна.</p>`
      ) + hurt(2, 0)
    );
  }
  night.saved = 'away';
  S.log.visit.empty = true;
  S.log.spared.push({ day: S.day, id: h.id, away: true });
  night.at = ['outside her tent', 'у её палатки']; // (the scene: her tent, not yours)
  night.found.push(
    bi(
      `<p>Someone came for ${h.short} in the night, and found her tent empty: her cot had not been slept in. By breakfast the whole camp has worked out where she slept.</p>`,
      `<p>Ночью кто-то приходил за ${ru.c(h, 'i')} — и нашёл её палатку пустой: на её койке никто не спал. К завтраку весь лагерь уже догадался, где она провела ночь.</p>`
    )
  );
  return '';
}
// She dies in your tent (whoever the cult came for): the night's dead, and the camp will talk of where she died, some
// mornings a little and some a great deal (talked: how hard, by weight; the louder, the more it is laid at your door).
function takenInYourTent(h) {
  fixMark(h);
  h.status = 'taken';
  h.takenDay = S.day;
  S.stats.taken++;
  const k = +wpick(RULES.visit.talked);
  S.log.visit.talked = k;
  if (k) Gossip.wordOf(h, 'diedInTent', k);
  if (k > 1) Suspicion.suspectYou(1);
  journal(bi(`${h.name} was taken in the night, in your tent.`, `Ночь забрала ${ru.cf(h, 'a')} — в вашей палатке.`));
}
// The attack on your tent got through, and she was in it: who the night takes (RULES.visit.through), or only the usual
// harm. Returns what the night tells (nothing more, if you die: the ending tells it).
function guestThrough(night, it) {
  const h = night.guest,
    k = wpick(RULES.visit.through);
  S.log.visit.through = k;
  S.log.attacks.push({ day: S.day, how: k === 'hurt' ? 'hurt' : 'visit', k, power: !!night.power });
  if (k === 'her' || k === 'both') {
    night.dead = h.id;
    takenInYourTent(h);
  }
  if (k === 'you' || k === 'both') {
    killYou('night');
    return '';
  }
  journal(bi('You were attacked in the night.', 'Ночью на вас напали.'));
  if (k === 'hurt')
    return (
      it +
      bi(`<p>${h.short} screams, and whatever it was is gone.</p>`, `<p>${ru.c(h)} кричит, и то, что приходило, исчезает.</p>`) +
      hurt(2, 1)
    );
  return (
    it +
    bi(
      `<p class="horror">It is over in moments. Whoever it was is gone into the dark before you are on your feet, and when you can strike a match, ${h.short} lies beside you, and she is cold. They came for you, and took her instead.</p>`,
      `<p class="horror">Всё кончается за считаные мгновения. Тот, кто приходил, исчезает в темноте прежде, чем вы успеваете вскочить, а когда вы наконец чиркаете спичкой, ${ru.c(h)} лежит рядом с вами — и она уже холодна. Приходили за вами, а забрали её.</p>`
    ) +
    hurt(2, 0)
  );
}
// Whether the one in your tent slipped out of it tonight: one of the cult who did the night's work herself (night.guestOut:
// out at it, and back before you woke as often as anyone else stays the night: visitMorning). Where she was, in truth and
// by her own account, is settled with everyone's (people/alibis.js).
function guestAccount(night) {
  const h = night.guest,
    rec = S.nights[S.day];
  if (h && rec && isFree(h) && rec.actor === h.id) {
    night.guestOut = true;
    S.log.visit.out = true;
  }
}
// What the camp makes of a death in your tent, at first light: as loud as the talk of it runs (takenInYourTent).
function diedInTentSaid() {
  const v = S.log.visit;
  if (!v || v.day !== S.day - 1 || v.talked == null || !(v.found === 'dead' || v.through === 'her')) return '';
  const h = C(v.id);
  return `<p class="notice">${bi(
    [
      'The camp says very little about where she died, which is worse.',
      `By breakfast the whole camp knows where ${h.short} died.`,
      `By breakfast the camp is saying that ${h.short} died in your tent, and some of it is saying worse.`
    ][v.talked],
    [
      'О том, где она умерла, в лагере почти не говорят — и это хуже всего.',
      `К завтраку весь лагерь знает, где умерла ${ru.c(h)}.`,
      `К завтраку в лагере говорят, что ${ru.c(h)} умерла в вашей палатке, — а кое-кто говорит и похуже.`
    ][v.talked]
  )}</p>`;
}
// The morning after, if you both live: when you wake she is still beside you, or already gone (leaves), as the night
// went: one who slipped out in it on the cult's work is back before you wake as often as anyone else would have stayed,
// so that the morning says nothing of what she is. Your nerve may mend (mend), and she may trust you the more (warm),
// each by chance; and by breakfast the camp knows.
function visitMorning(night) {
  const v = S.log.visit;
  if (!v || !v.agreed || v.day !== S.day - 1 || v.morning) return '';
  v.morning = true;
  const h = C(v.id);
  if (!isFree(h)) return '';
  Gossip.wordOf(h, 'visited');
  const VR = RULES.visit,
    gone = chance(VR.leaves), // (out on the cult's work, she is back by then at 1 − leaves: the same)
    mend = chance(VR.mend) ? regain(1) : 0,
    warm = chance(VR.warm) && h.rapport < RULES.scale.trustMax;
  if (warm) Ties.moveTrust(h, 1, 'deed');
  return (
    (gone
      ? bi(
          `<p>When you wake, ${h.short} is gone, and the blanket on her side of the cot is cold. Nobody saw her go, and by breakfast everybody knows.${mend ? ' You slept, for once.' : ''}</p>`,
          `<p>Когда вы просыпаетесь, ${ru.c(h, 'g')} уже нет, и одеяло с её стороны остыло. Никто не видел, как она ушла, — и к завтраку об этом знают все.${mend ? ' Впервые за долгое время вы выспались.' : ''}</p>`
        )
      : bi(
          `<p>You wake to find ${h.short} still asleep beside you. She goes back to her own tent while the camp is at breakfast, and nobody looks at either of you, which is worse.${mend ? ' You slept, for once.' : ''}</p>`,
          `<p>Вы просыпаетесь — ${ru.c(h)} всё ещё спит рядом. Она возвращается к себе, пока лагерь завтракает, и никто не смотрит ни на неё, ни на вас, — что ещё хуже.${mend ? ' Впервые за долгое время вы выспались.' : ''}</p>`
        )) +
    nerveNote(mend) +
    (warm ? trustNote([h.id], []) : '')
  );
}
// the morning after a visit, the camp talks the more readily (people/social.js, socialMorning)
const visitTalk = () => (S.log.visit && S.log.visit.day === S.day - 1 ? RULES.visit.talk : 1);
