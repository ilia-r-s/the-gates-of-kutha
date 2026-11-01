const TEMPER_NAMES = __text('TEMPER_NAMES');
const temperOf = c => S.temper[typeof c === 'string' ? c : c.id];
const TP = c => TEMPERS[temperOf(c)];
const temperName = (k, c) => bi(TEMPER_NAMES[k][0], TEMPER_NAMES[k][ru.f(c) ? 2 : 1]);
const FEEL_NAMES = __text('FEEL_NAMES');
const feelName = c => {
  const f = FEEL_NAMES[Ties.trust(c)];
  return bi(f[0], f[ru.f(c) ? 2 : 1]);
};
function assignTempers() {
  S.temper = {};
  S.order.forEach(id => {
    S.temper[id] = pick(TEMPER_IDS);
  });
}
const TEMPER_SEE = {
  honest: [c => bi(...TX.tempers.tellsYouPlainlyWhat(c)), c => bi(...TX.tempers.answersEveryQuestionStraight(c))],
  conscientious: [c => bi(...TX.tempers.apologisesTwiceForKeeping(c)), c => bi(...TX.tempers.returnsAPencilBorrowed(c))],
  liar: [c => bi(...TX.tempers.tellsYouAStory(c)), c => bi(...TX.tempers.hasNeverBeenTo(c))],
  calculating: [c => bi(...TX.tempers.asksYouMoreQuestions(c)), c => bi(...TX.tempers.agreesWithEverythingYou(c))],
  detached: [c => bi(...TX.tempers.seemsToBeListening(c)), c => bi(...TX.tempers.answersWhatYouAsk(c))],
  lightheaded: [c => bi(...TX.tempers.startsThreeStoriesAnd(c)), c => bi(...TX.tempers.cannotRememberWhetherIt(c))],
  suspicious: [c => bi(...TX.tempers.keepsGlancingAtThe(c)), c => bi(...TX.tempers.wantsToKnowWhom(c))]
};
function mienNote(c, p = RULES.talk.mien) {
  if (S.testimony.some(t => t.kind === 'mien' && t.from === c.id) || !chance(p)) return null;
  const own = temperOf(c),
    k = chance(RULES.talk.mienWrong / MANNER[own].shows) ? pick(TEMPER_IDS.filter(x => x !== own)) : own;
  Record.testify(c.id, c.id, 'mien', k);
  return sayPick(TEMPER_SEE[k])(c);
}
const TEMPER_SAID = {
  honest: [
    t => bi(...TX.tempers.couldNotTellA(t)),
    t => bi(...TX.tempers.askAnythingYouLike(t)),
    t => bi(...TX.tempers.tellsTheTruthThe(t))
  ],
  conscientious: [
    t => bi(...TX.tempers.fretsOverEveryLittle(t)),
    t => bi(...TX.tempers.checksTheFindsRegister(t)),
    t => bi(...TX.tempers.ifAnythingGoesWrong(t))
  ],
  liar: [t => bi(...TX.tempers.doNotBelieveHalf(t)), t => bi(...TX.tempers.hasToldMeThree(t)), t => bi(...TX.tempers.liesTheWayA(t))],
  calculating: [
    t => bi(...TX.tempers.alwaysKnowsWhatYou(t)),
    t => bi(...TX.tempers.neverSaysAWord(t)),
    t => bi(...TX.tempers.isPleasantToEveryone(t))
  ],
  detached: [
    t => bi(...TX.tempers.livesSomewhereElseI(t)),
    t => bi(...TX.tempers.couldSitThroughAn(t)),
    t => bi(...TX.tempers.talkingToIsLike(t))
  ],
  lightheaded: [
    t => bi(...TX.tempers.wouldLoseHeadIf(t)),
    t => bi(...TX.tempers.laughsAtEverythingWhich(t)),
    t => bi(...TX.tempers.hasFallenInLove(t))
  ],
  suspicious: [
    t => bi(...TX.tempers.thinksWeAreAll(t)),
    t => bi(...TX.tempers.countsTheSpoonsAfter(t)),
    t => bi(...TX.tempers.sleepsWithAChair(t))
  ]
};
const NEG = ['liar', 'calculating', 'suspicious'],
  POS = ['honest', 'conscientious'];
