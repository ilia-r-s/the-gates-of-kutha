// game/yourdreams.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function dealYourDreams() {
  const Y = RULES.yourDreams;
  S.you = { rate: +wpick(Y.rate), truth: +wpick(Y.truth), dreams: [] };
}
const YOUR_DREAM = {
  verdict: {
    can: () => true,
    dream(night, tru) {
      if (chance(RULES.yourDreams.self))
        return tru ? { ...enRu(TX.yourdreams.youDreamOfThe()) } : { ...enRu(TX.yourdreams.youDreamOfThe2()) };
      const t = pick(freeChars());
      if (!t) return null;
      const cult = (t.role === 'cult') === tru;
      return { about: t.id, ...enRu(TX.yourdreams.youDreamOfThe3(cult, t)) };
    }
  },
  death: {
    can: () => true,
    dream(night, tru) {
      const t = night.target,
        others = freeChars().filter(c => c.id !== t),
        over = v => ({ about: v.id, ...enRu(TX.yourdreams.youDreamOfSomething(v)) }),
        you = { ...enRu(TX.yourdreams.youDreamThatYou()) },
        none = {
          ...enRu(TX.yourdreams.youDreamOfThe4())
        };
      if (tru) return !t ? none : t === 'player' ? you : over(C(t));
      if (!t) return others.length && !chance(RULES.yourDreams.youFalse) ? over(pick(others)) : you;
      return others.length && chance(RULES.yourDreams.someoneFalse) ? over(pick(others)) : none;
    }
  },
  likes: {
    can: () => freeChars().length >= 2,
    dream(night, tru) {
      const [a, b] = shuffle(freeChars()).slice(0, 2),
        lean = (x, y) => (Ties.fond(x, y) ? 1 : Ties.dislikes(x, y) ? -1 : 0),
        flip = v => (v ? -v : pick([-1, 1]));
      let ab = lean(a, b),
        ba = lean(b, a);
      if (!tru) [ab, ba] = coin() ? [flip(ab), ba] : [ab, flip(ba)];
      const [en, rus] =
        ab > 0 && ba > 0
          ? TX.yourdreams.andWalkTheEdge(a, b)
          : ab > 0 && ba < 0
            ? TX.yourdreams.callsAfterAcrossThe(a, b)
            : ab < 0 && ba > 0
              ? TX.yourdreams.callsAfterAcrossThe2(b, a)
              : ab < 0 && ba < 0
                ? TX.yourdreams.andSitAtOne(a, b)
                : ab > 0
                  ? TX.yourdreams.callsAfterAcrossThe3(a, b)
                  : ba > 0
                    ? TX.yourdreams.callsAfterAcrossThe4(b, a)
                    : ab < 0 || ba < 0
                      ? TX.yourdreams.stepsOffThePath(ab, a, b)
                      : TX.yourdreams.andPassEachOther(a, b);
      return { about: a.id, en: __text('youDreamOfTheCampBy'), ru: __text('text') };
    }
  },
  habit: {
    can: () => pastScenes().length > 0,
    dream(night, tru) {
      const n = pick(pastScenes()),
        rec = S.nights[n],
        actor = C(rec.actor),
        cat = pick(CATS),
        val = tru ? actor.traits[cat] : pick(Object.keys(TRAITS[cat].vals).filter(v => v !== actor.traits[cat])),
        clue = TRAITS[cat].vals[val].clue,
        at = LOCS[rec.crimeLoc];
      return { about: actor.id, ...enRu(TX.yourdreams.youDreamOfThe5(at, clue)) };
    }
  },
  part: {
    can: () => freeChars().length >= 2 && PARTS_DREAMT.some(r => freeChars().some(c => c.role === r)),
    dream(night, tru) {
      const role = pick(PARTS_DREAMT.filter(r => freeChars().some(c => c.role === r))),
        t = tru ? freeChars().find(c => c.role === role) : pick(freeChars().filter(c => c.role !== role));
      const say = {
        seer: TX.yourdreams.youDreamOfAsleep(t),
        warden: TX.yourdreams.youDreamOfA(t),
        smuggler: TX.yourdreams.youDreamOfHands(t)
      }[role];
      return { about: t.id, en: say[0], ru: say[1] };
    }
  },
  fear: {
    can: () => {
      const p = fearPairs();
      return p.some(x => x[2]) && p.some(x => !x[2]);
    },
    dream(night, tru) {
      const [a, b] = pick(fearPairs().filter(x => x[2] === tru));
      return { about: a.id, ...enRu(TX.yourdreams.youDreamOfLying(a, b)) };
    }
  },
  line: {
    can: () => S.facts && S.facts.length > 0,
    dream(night, tru) {
      const f = pick(S.facts),
        shown = tru ? f : scribeErr(f);
      return { line: tru && !f.scribe, html: bi(...TX.yourdreams.inYourDreamA()) + shown.text + bi('”', '»') };
    }
  },
  gate: {
    can: () => S.day >= 3 && S.day < RULES.start.days,
    dream() {
      const tomorrow = S.day === RULES.start.days - 1;
      return { sure: true, ...enRu(TX.yourdreams.youDreamOfThe6(tomorrow)) };
    }
  }
};
const PARTS_DREAMT = ['seer', 'warden', 'smuggler'];
const fearPairs = () => Ties.eachWay(freeChars()).map(([a, b]) => [a, b, Suspicion.earnest(a.id, b.id)]);
const pastScenes = () =>
  Object.keys(S.nights || {})
    .map(Number)
    .filter(n => n < S.day && S.nights[n] && S.nights[n].actor && S.nights[n].crimeLoc && S.chars[S.nights[n].actor]);
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
      html = d.html || bi(d.en, d.ru);
    S.you.dreams.push({ night: S.day, kind: k, true: truth, html: html });
    Record.journal(html);
    return `<p class="dream">${html}</p>`;
  }
  return '';
}
