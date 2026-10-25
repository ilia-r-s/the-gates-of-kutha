// ===================== FLIRTATION: a light touch, now and then =====================
// Dealt once, at the start of a season, with the rest of the ties (people/ties.js: Ties.deal, and asked about there):
// each woman may have a flirtatious streak toward you, and anyone may toward a particular person of the other sex. It
// shows only while the feeling holds (her trust in you; their liking for the other) and comes back if the feeling does;
// and even then only now and then: in a greeting, a look as you leave, a word that slips out about the other, a piece of
// gossip. Père Anselm keeps his vows. It may come to more: two who are sweet on each other may slip out together of a
// night (people/alibis.js), a woman sweet on you may come to your tent (people/visit.js), and either may come to a
// romance in the epilogue (game/fates.js).
// ---------- how it shows ----------
const flirtGreet = c => bi(tellOne('greetFlirt-' + c.id, GREET_FLIRT[c.id]));
const FLIRT_PARTING = [
  c =>
    bi(`${c.short} holds your gaze a moment longer than ${c.p} needs to.`, `${ru.c(c)} задерживает на вас взгляд чуть дольше, чем нужно.`),
  c =>
    bi(
      `${c.short} watches you go, and does not pretend otherwise.`,
      `${ru.c(c)} смотрит вам вслед и не делает вид, что смотрит куда-то ещё.`
    ),
  c =>
    bi(
      `As you leave, ${c.short} straightens your collar, as if it were the most natural thing in the world.`,
      `На прощание ${ru.c(c)} поправляет вам воротник — так, будто это самое естественное дело на свете.`
    )
];
// a word let slip about the one they are taken with, when they talk about them
const flirtAside = t =>
  bi(
    ` And rather ${t.p === 'she' ? 'lovely' : 'handsome'}, I suppose.`,
    ` И, надо признать, ${ru.gs(t, 'весьма хорош собой', 'весьма хороша собой')}.`
  );
// gossip about it, from someone else: about two of them, or about one of them and you
const FLIRT_SAID = [
  (s, a, b) =>
    bi(
      `Have you seen how ${a.short} looks at ${b.short}? Like a cat at a cream jug.`,
      `Вы видели, как ${ru.c(a)} смотрит на ${ru.c(b, 'a')}? Как кошка на сметану.`
    ),
  (s, a, b) =>
    bi(
      `${a.short} found three reasons to walk past ${b.short}’s tent yesterday. Three.`,
      `Вчера ${ru.c(a)} ${ru.gs(a, 'нашёл', 'нашла')} три повода пройти мимо палатки ${ru.c(b, 'g')}. Три.`
    )
];
const FLIRT_SAID_YOU = [
  (s, a) =>
    bi(
      `${a.short} has a soft spot for you, Doctor. The whole camp can see it, except you.`,
      `${ru.c(a)} к вам ${ru.gs(a, 'неравнодушен', 'неравнодушна')}, доктор. Это видит весь лагерь — кроме вас.`
    ),
  (s, a) =>
    bi(
      `${a.short} asks after you when you are not there. I thought you should know.`,
      `${ru.c(a)} спрашивает о вас, когда вас нет рядом. Я ${ru.gs(s, 'подумал', 'подумала')}, вам стоит это знать.`
    )
];
// ... said of you to someone else, and overheard
const FLIRT_HEARD_YOU = [
  (s, a) =>
    bi(
      `${a.short} has a soft spot for the Doctor. The whole camp can see it, except the Doctor.`,
      `${ru.c(a)} к доктору ${ru.gs(a, 'неравнодушен', 'неравнодушна')}. Это видят все в лагере, кроме доктора.`
    ),
  (s, a) =>
    bi(
      `${a.short} asks after the Doctor whenever the Doctor is not about.`,
      `${ru.c(a)} всё спрашивает о докторе, стоит доктору отлучиться.`
    )
];
// a piece of gossip about a flirtation, if there is one the speaker can talk about; it goes into the casebook. heard:
// said to someone else, and overheard
// (true to what is going on, mostly; now and then made up, as the speaker's gossip runs untrue: flirt.invent, and only of
// two who could: a man and a woman, never the priest)
function flirtGossip(s, not = [], heard = false) {
  const ok = id => id !== s.id && !not.includes(id),
    made = !Gossip.toldTrue(s, { slip: RULES.flirt.invent }),
    f = made
      ? Ties.eachWay(freeChars().map(c => c.id)).filter(([a, b]) => ok(a) && ok(b) && Ties.mayFlirt(C(a), C(b)) && !Ties.sweetOn(a, b))
      : Ties.flirtsNow().filter(([a, b]) => ok(a) && (b === 'you' || ok(b)));
  if (!f.length) return null;
  const [a, b] = pick(f),
    A = C(a);
  addTest(s.id, a, 'flirt', b);
  return { t: A, text: b === 'you' ? pick(heard ? FLIRT_HEARD_YOU : FLIRT_SAID_YOU)(s, A) : pick(FLIRT_SAID)(s, A, C(b)) };
}
