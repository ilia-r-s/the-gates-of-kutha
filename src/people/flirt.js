const flirtGreet = c => bi(tellOne('greetFlirt-' + c.id, GREET_FLIRT[c.id]));
const FLIRT_PARTING = [
  c => bi(...TX.flirt.holdsYourGazeA(c)),
  c => bi(...TX.flirt.watchesYouGoAnd(c)),
  c => bi(...TX.flirt.asYouLeaveStraightens(c))
];
const flirtAside = t => bi(...TX.flirt.andRatherISuppose(t));
const FLIRT_SAID = [(s, a, b) => bi(...TX.flirt.haveYouSeenHow(a, b)), (s, a, b) => bi(...TX.flirt.foundThreeReasonsTo(a, b))];
const FLIRT_SAID_YOU = [(s, a) => bi(...TX.flirt.hasASoftSpot(a)), (s, a) => bi(...TX.flirt.asksAfterYouWhen(a, s))];
const FLIRT_HEARD_YOU = [(s, a) => bi(...TX.flirt.hasASoftSpot2(a)), (s, a) => bi(...TX.flirt.asksAfterTheDoctor(a))];
function flirtGossip(s, not = [], heard = false) {
  const ok = id => id !== s.id && !not.includes(id),
    made = !Gossip.toldTrue(s, { slip: RULES.flirt.invent }),
    remembered = Knowledge.flirts(s).filter(([a, b]) => isFree(C(a)) && (b === 'you' || isFree(C(b)))),
    f = made
      ? Ties.eachWay(freeChars().map(c => c.id)).filter(
          ([a, b]) => ok(a) && ok(b) && Ties.mayFlirt(C(a), C(b)) && !remembered.some(([x, y]) => a === x && b === y)
        )
      : remembered.filter(([a, b]) => ok(a) && (b === 'you' || ok(b)));
  if (!f.length) return null;
  const [a, b] = pick(f),
    A = C(a);
  Record.testify(s.id, a, 'flirt', b);
  return { t: A, text: b === 'you' ? sayPick(heard ? FLIRT_HEARD_YOU : FLIRT_SAID_YOU)(s, A) : sayPick(FLIRT_SAID)(s, A, C(b)) };
}
