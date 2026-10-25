// ===================== SUSPICION: who suspects whom, what was said aloud, who is closing in =====================
// One machinery for suspicion. It owns each one's suspicion of each other one (S.sus, from 0 to scale.suspicion, in the
// casebook's words: begins to wonder about them, suspects them in earnest, is all but sure: RULES.suspects); what was
// said before the whole camp, guilty or clean, until the truth about them comes out (S.said), and whose word has been
// proven so (S.credit); how far the camp suspects you yourself, after the deed (S.onYou); and whether the cult knows
// you are onto it (S.alerted). They are dealt once a season (deal), moved only through here (move, sayAloud, settle,
// suspectYou, clearYou, alertCult), and asked about by level, so that "suspects in earnest" means one thing everywhere.
// How lost one of the cult looks, and the seven ways the cult measures who is closing in on it, are read here too. A
// person or an id may be given wherever one is asked about.
const Suspicion = (() => {
  const id = x => (x && x.id) || x,
    lv = () => RULES.suspects;

  // ---------- dealing, once a season ----------
  function deal() {
    S.sus = {};
    S.order.forEach(a => {
      S.sus[a] = {};
    });
    S.said = [];
    S.credit = {};
    S.onYou = 0;
    S.alerted = false;
  }

  // ---------- who suspects whom ----------
  // how far a suspects b (0 if not at all)
  const level = (a, b) => {
    const i = id(a);
    return S.sus && S.sus[i] ? S.sus[i][id(b)] || 0 : 0;
  };
  // a's suspicion of b, a step (d), within the scale; false if it could not move
  function move(a, b, d) {
    const i = id(a),
      j = id(b),
      v = Math.max(0, Math.min(RULES.scale.suspicion, level(i, j) + d));
    if (v === level(i, j)) return false;
    S.sus[i][j] = v;
    return true;
  }
  const wonders = (a, b) => level(a, b) >= lv().wonder, // begins to wonder about them, or more
    onlyWonders = (a, b) => level(a, b) === lv().wonder, // no more than that
    earnest = (a, b) => level(a, b) >= lv().earnest, // suspects them in earnest
    sure = (a, b) => level(a, b) >= lv().sure; // all but sure of it
  // those still at the dig who suspect someone in earnest (their ids, in the season's order); suspected: by so many of
  // them that the camp's suspicion is on them (suspects.many)
  const suspectedBy = x =>
      freeChars()
        .filter(o => o.id !== id(x) && earnest(o, x))
        .map(o => o.id),
    suspected = x => suspectedBy(x).length >= lv().many;
  // whom someone suspects most, of a pool: in earnest only, and someone they are close to only when all but sure; the
  // more suspected first, then the less liked
  function mostSuspected(c, pool) {
    const top = pool
      .filter(o => level(c, o) >= (Ties.close(c, o) ? lv().sure : lv().earnest))
      .sort((a, b) => level(c, b) - level(c, a) || Ties.likes(c, a) - Ties.likes(c, b));
    return top[0] || null;
  }

  // ---------- said before everyone ----------
  // Said against someone (verdict 'cult': guilty) or for them ('clean'), before the whole camp, and how: a dream told
  // aloud ('dream'), a blame in words ('blame'), a hand raised at an inquiry ('vote'). Remembered until the truth about
  // them comes out (settle).
  function sayAloud(by, about, verdict, how) {
    S.said.push({ day: S.day, by, about, verdict, how, settled: false });
  }
  // Someone says before everyone that another is one of the cult, in so many words: their distrust goes on the record, and
  // it is said aloud (one writer for every blame said aloud: people/social.js, at breakfast; game/night.js, a dream called
  // a lie; people/moments.js, the dead had named them).
  function blame(by, about) {
    Record.testify(by, about, 'distrust', 'cult');
    sayAloud(by, about, 'cult', 'blame');
  }
  // whether someone has told a dream before everyone, this season
  const hasDreamtAloud = c => S.said.some(x => x.by === id(c) && x.how === 'dream');
  // the dreams someone told aloud that named one of the cult guilty (atLarge: one still at the dig)
  const dreamtCult = (c, atLarge) =>
    S.said.filter(
      x => x.by === id(c) && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult' && (!atLarge || isFree(C(x.about)))
    );
  // whether a named b guilty before everyone, in any way; whether anyone but one named b so
  const named = (a, b) => S.said.some(x => x.by === id(a) && x.about === id(b) && x.verdict === 'cult'),
    namedByOthers = (b, but) => S.said.some(x => x.about === id(b) && x.verdict === 'cult' && x.by !== id(but));
  // what someone has said before everyone in words of their own (a dream or a blame, not a raised hand) naming someone
  // guilty, in the order said
  const accusations = c => S.said.filter(x => x.by === id(c) && x.verdict === 'cult' && x.how !== 'vote');
  // whose word the camp has seen proven before everyone (above 0), or proven wrong (below)
  const credit = c => (S.credit && S.credit[id(c)]) || 0;
  // The truth about someone has come out (guilty, or not): everything said of them before everyone and not yet settled
  // is settled now, and each who said it gains a step of credit, or loses one, by the last thing they said of them.
  // Returns those last words, each with whether it was right, in the order each one first spoke (people/moments.js,
  // Moments.settle, tells it).
  function settle(about, guilty) {
    const last = new Map();
    S.said
      .filter(x => x.about === about && !x.settled)
      .forEach(x => {
        x.settled = true;
        last.set(x.by, x);
      });
    const all = [...last.values()].map(x => ({ x, right: (x.verdict === 'cult') === guilty }));
    all.forEach(({ x, right }) => {
      S.credit[x.by] = credit(x.by) + (right ? 1 : -1);
    });
    return all;
  }

  // ---------- the camp's suspicion of you, and the cult's alert ----------
  // How far the camp suspects you yourself, after the deed (game/deed.js; people/visit.js, a death in your tent talked
  // of): from 0 to scale.suspicion, and as a step, for the tables that go by steps. It rises and falls by amounts.
  const onYou = () => S.onYou || 0,
    youLevel = () => Math.min(RULES.scale.suspicion, Math.floor(onYou()));
  function suspectYou(n) {
    S.onYou = Math.min(RULES.scale.suspicion, onYou() + n);
  }
  function clearYou(n) {
    S.onYou = Math.max(0, onYou() - n);
  }
  // The cult learns, or guesses, that you are onto it, at odds p (people/dialog.js: you confided in one of it, or
  // pressed one of it; game/verdict.js: one of it accused in vain; game/deed.js: your deed): from then on it knows what
  // you are (game/night.js, chooseVictim).
  function alertCult(p) {
    if (chance(p)) S.alerted = true;
  }
  const cultAlerted = () => !!S.alerted;

  // ---------- how lost one of the cult looks, as the cult sees it ----------
  // Looks lost: some case against them, or the camp's suspicion on them (people/claims.js, cornerClaims and mateGamble;
  // people/dialog.js, busFor; game/verdict.js, cultLean). All but caught, more strongly: a strong case, the camp's
  // suspicion, or an inquiry into them the camp would not back; and clear: no case to speak of, nobody suspecting them
  // in earnest, no such inquiry (people/cunning.js, betrayal).
  const accusedInVain = c => S.log.refusedInq.some(r => r.id === id(c));
  const looksLost = c => Record.caseAgainst(c) >= RULES.verdict.someCase || suspected(c),
    caught = c => Record.caseAgainst(c) >= RULES.verdict.strongCase || suspected(c) || accusedInVain(c),
    clear = c => Record.caseAgainst(c) < RULES.verdict.someCase && !suspectedBy(c).length && !accusedInVain(c);

  // ---------- who is closing in on the cult: seven measures, each as it is ----------
  // Each place the cult weighs the danger it is in measures it in its own way, and each is kept exactly so here, side
  // by side (28.0.0's second phase makes them one model, each use keeping its own weights):
  const threat = {
    // 1. whom to name guilty in its dream (people/claims.js, closingIn): anyone, by each step of suspicion of one of it
    //    at large past the first, and by each dream they told aloud naming one of it guilty, at large or not
    closingIn: o => freeCult().reduce((a, k) => a + Math.max(0, level(o, k) - 1), 0) + dreamtCult(o, false).length,
    // 2. whom to come for (game/night.js, chooseVictim): the dreams someone told aloud naming one of it still at large
    harm: c => dreamtCult(c, true).length,
    // 3. whether to lie low (people/cunning.js, liesLow): whether any of them told such a dream
    threatened: pool => pool.some(c => dreamtCult(c, true).length > 0),
    // 4. whether to clear the other of it in its dream (people/claims.js, cultDream): the other suspected in earnest by
    //    anyone, or named guilty before everyone by anyone but the dreamer
    watched: (mate, by) => suspectedBy(mate).length > 0 || namedByOthers(mate, by),
    // 5. whom to blame, asked (people/dialog.js, whomToBlame): one who suspects it in earnest, or has said to you that
    //    they distrust it, or told you a dream of it guilty
    accuser: (o, c) =>
      earnest(o, c) ||
      S.testimony.some(
        t => t.from === o.id && t.about === c.id && (t.kind === 'distrust' || (t.kind === 'vision' && t.verdict === 'cult'))
      ),
    // 6. why it chose its victim (game/night.js, victimWhy): the first of it the victim suspected in earnest
    suspects: (v, cult) => cult.find(c => earnest(v, c)),
    // 7. whom to come for, by weight (people/social.js, victimWeights): × 1 + victims.suspects a step of the victim's
    //    suspicion of each of it
    weight: (v, k) => 1 + RULES.victims.suspects * level(v, k)
  };

  return {
    deal,
    level,
    move,
    wonders,
    onlyWonders,
    earnest,
    sure,
    suspectedBy,
    suspected,
    mostSuspected,
    sayAloud,
    blame,
    hasDreamtAloud,
    dreamtCult,
    named,
    namedByOthers,
    accusations,
    credit,
    settle,
    onYou,
    youLevel,
    suspectYou,
    clearYou,
    alertCult,
    cultAlerted,
    looksLost,
    caught,
    clear,
    threat
  };
})();
