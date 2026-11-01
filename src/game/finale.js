const DESC = () => __text('theDescent');
function finaleIntro(early, why = null) {
  const atNight = S.phase === 'night';
  S.phase = 'finale';
  S.slot = 2;
  S.doom = Math.min(S.doom, S.doomMax);
  S.fin = {
    early: early,
    why: why,
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
  S.order.map(C).forEach(fixMark);
  const body =
    why === 'priestless'
      ? [`<p class="horror">${bi(...TX.finale.aStairGoesDown())}</p>`]
      : early
        ? [`<p class="horror">${bi(...TX.finale.theRiteHasOutpaced())}</p>`]
        : [`<p>${bi(...TX.finale.theFifthNightIs())}</p>`];
  body.push(`<p>${bi(...TX.finale.beforeYouGoDown())}</p>`);
  show({
    kicker:
      why === 'priestless'
        ? atNight
          ? __text('nightTheGateOpens')
          : __text('dayTheGateOpens')
        : early
          ? __text('nightTheGateOpens2')
          : bi(...TX.finale.nightTheDarkOf()),
    title: DESC(),
    body: body,
    choices: S.gods
      .map(g => ({
        label: __text('name'),
        sub: bi(GODS[g].title),
        fn: () => {
          S.fin.named = g;
          companionScene();
        }
      }))
      .concat([{ label: __text('nameNoPower'), sub: __text('goDownBlind'), cls: 'minor', fn: companionScene }])
  });
  emit('descent');
}
function companionScene(said) {
  const f = S.fin;
  f.refused = f.refused || [];
  if (!f.offered) {
    f.offered = volunteers();
    said = (said || '') + f.offered.map(id => `<p>${sayPick(OFFER_SAY)(C(id))}</p>`).join('');
  }
  const avail = freeChars().filter(c => !f.comp.includes(c.id) && !f.refused.includes(c.id));
  const n = f.comp.length;
  if (!avail.length || n >= 2) {
    if (said) show({ kicker: DESC(), title: __text('whoComesWithYou'), body: [said], choices: [{ label: __text('goDown'), fn: gate1 }] });
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
      label: __text('takeA'),
      sub: () => (f.offered.includes(c.id) ? __text('offersToCome') : '') + (markSay(c) || __text('unmarked')),
      fn: () => ask(c)
    }));
  ch.push({ label: n ? __text('noOneElse') : __text('goDownAlone'), cls: 'minor', fn: gate1 });
  show({
    kicker: DESC(),
    title: n ? __text('oneMore') : __text('whoComesWithYou2'),
    body: [(said || '') + `<p>${n ? bi(...TX.finale.isLacingUpBoots(f)) : bi(...TX.finale.youCanTakeUp())}</p>`],
    choices: ch
  });
}
const withYou = () => S.fin.comp.filter(id => !S.fin.left.includes(id));
function loyal() {
  return withYou()
    .map(C)
    .filter(c => c.role !== 'cult');
}
function gateBonus() {
  return RULES.descent.companion * loyal().length + (has('torch') ? RULES.descent.torch : 0);
}
const costOf = (k, ways = []) => hurt(dearer(RULES.descent.cost[k][0], ways), RULES.descent.cost[k][1], { k: 'below' });
function stepOn(html, next) {
  S.phase = 'descent';
  if (checkEnd()) return;
  show({ kicker: DESC(), title: __text('below'), body: [html], choices: [{ label: __text('goOn'), fn: next }] });
}
function riskStep({ key: key, val: val, base: base, ways: ways, cost: cost, cause: cause, ok: ok, fail: fail }, next) {
  return () => {
    S.fin[key] = val;
    if (DESCENT_TRIAL.roll(base, ways, gateBonus())) return stepOn(`<p>${bi(...ok)}</p>`, next);
    if (cause) S.fin.cause = cause;
    stepOn(`<p class="horror">${bi(...fail)}</p>` + costOf(cost, ways), next);
  };
}
function gate1() {
  S.phase = 'descent';
  S.fin.took = S.fin.comp.slice();
  const comp = S.fin.comp.map(c => C(c).short),
    compRu = S.fin.comp.map(c => ru.c(c));
  const lamps = comp.length ? bi(...TX.finale.theStairAtYour(comp)) + nerveNote(regain(RULES.descent.company * comp.length)) : '';
  const next = () => between('early', [2, 3], gate2);
  show({
    kicker: DESC(),
    title: __text('theFirstGate'),
    body: [bi(...TX.finale.crossTheDarkTell(comp, compRu)) + lamps + `<p>${bi(GATES.one)}</p>`],
    choices: [
      {
        label: __text('goDownSlowlyFeelingForEach'),
        sub: __text('carefulABadStepCostsNerve'),
        fn: riskStep(
          {
            key: 'g1',
            val: 'slow',
            base: RULES.descent.stairSlow,
            ways: ['patience'],
            cost: 'slowStair',
            ok: TX.finale.stepByStepCount(),
            fail: TX.finale.halfwayDownTheSteps()
          },
          next
        )
      },
      {
        label: __text('hurryDownBeforeYourNerveFails'),
        sub: __text('quickABadStepAndYou'),
        fn: riskStep(
          {
            key: 'g1',
            val: 'hurry',
            base: RULES.descent.stairFast,
            ways: ['haste'],
            cost: 'fastStair',
            cause: 'stair',
            ok: TX.finale.youTakeTheStair(),
            fail: TX.finale.aStepIsNot()
          },
          next
        )
      }
    ]
  });
}
function gate2() {
  S.phase = 'descent';
  const cult = withYou()
      .map(C)
      .filter(c => c.role === 'cult' && isFree(c)),
    striker = cult.find(c => !waits(c));
  const next = () => between('late', [5, 6], gate3);
  if (striker) gate2Traitor(striker, next);
  else gate2Eyes(next);
}
function gate2Traitor(t, next) {
  const D = RULES.descent,
    foes = S.order.filter(id => markOf(C(id)) === 'foe').length,
    p = () =>
      clamp(
        D.traitor +
          (has('torch') ? D.traitorTorch : 0) +
          (S.bg === 'occultist' ? D.traitorOccultist : 0) +
          (markOf(t) === 'foe' ? D.traitorSuspected * Math.min(1, 2 / foes) : 0) +
          D.companion * loyal().length
      );
  const res = (q, heard) => {
    let html;
    if (chance(q)) {
      t.status = 'exposed';
      S.fin.caught = t.id;
      S.stats.right++;
      S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight));
      html = bi(...TX.finale.youTurnInTime(t));
    } else {
      S.fin.betrayed.push(t.id);
      S.fin.cause = 'knife';
      html = (heard ? bi(...TX.finale.youHearTheStep(t)) : bi(...TX.finale.theKnifeTakesYou(t))) + costOf(heard ? 'knifeHeard' : 'knife');
    }
    S.fin.comp = S.fin.comp.filter(x => x !== t.id);
    stepOn(html, next);
  };
  show({
    kicker: DESC(),
    title: __text('theFourthGate'),
    body: [`<p>${bi(GATES.two)}</p>` + bi(...TX.finale.behindYouHasGone(t))],
    choices: [
      {
        label: __text('turnAndFaceD'),
        sub: __text('nowBeforeItIsTooLate'),
        fn: () => {
          S.fin.g2 = 'face';
          res(p());
        }
      },
      {
        label: __text('keepWalkingAndListen'),
        sub: bi(...TX.finale.letThemThinkYou()),
        fn: () => {
          S.fin.g2 = 'listen';
          res(clamp(p() - D.traitorBlind), true);
        }
      }
    ]
  });
}
function gate2Eyes(next) {
  const c = withYou().map(C)[0],
    calm = c && chance(RULES.descent.calm[c.role === 'cult' ? 0 : 1]);
  show({
    kicker: DESC(),
    title: __text('theFourthGate2'),
    body: [
      `<p>${bi(GATES.two)}</p>` + (!c ? '' : calm ? bi(...TX.finale.walksAtYourShoulder(c)) : bi(...TX.finale.walksAtYourShoulder2(c)))
    ],
    choices: [
      {
        label: __text('meetTheEyesAndWalkOn'),
        sub: __text('holdYourNerveOrLoseIt'),
        fn: riskStep(
          {
            key: 'g2',
            val: 'eyes',
            base: RULES.descent.eyes,
            ways: ['bold'],
            cost: 'eyes',
            ok: TX.finale.youStareBackAt(),
            fail: __text('oneOfTheEyesBlinks')
          },
          next
        )
      },
      {
        label: __text('coverYourLightAndWalkBlind'),
        sub: bi(...TX.finale.trustYourHandsSomething()),
        fn: riskStep(
          {
            key: 'g2',
            val: 'blind',
            base: RULES.descent.blind,
            ways: ['humble'],
            cost: 'blind',
            cause: 'grip',
            ok: TX.finale.youWalkWithOne(),
            fail: TX.finale.inTheDarkSomething()
          },
          next
        )
      }
    ]
  });
}
function gate3(said = '') {
  S.phase = 'descent';
  const G7 = RULES.descent.gate7,
    spurned = S.fin.spurned || [];
  const ch = S.items
    .filter(it => !spurned.includes(it) && it !== 'torch')
    .map(it => ({
      label: __text('leaveA'),
      sub: ITEMS[it].ward ? __text('anOldCharmYouMightNeed') : bi(ITEMS[it].desc),
      fn: () => {
        if (!has(it)) return gate3();
        if (chance(['bowl', 'brandy'].includes(it) ? G7.small : G7.refuse)) {
          S.fin.spurned = spurned.concat([it]);
          return gate3(`<p class="horror">${bi(...TX.finale.youSetDownOn(it))}</p>`);
        }
        lose(it);
        S.fin.g3 = { kind: 'item', it: it };
        stepOn(`<p>${bi(...TX.finale.youSetDownOn2(it))}</p>`, sanctum);
      }
    }));
  withYou()
    .map(C)
    .forEach(c =>
      ch.push({
        label: __text('askToHoldTheGateA'),
        sub: bi(...TX.finale.staysBehindAndHelp(c)),
        fn: () => {
          S.fin.g3 = { kind: 'comp', id: c.id };
          if (c.role !== 'cult' && chance(G7.follow)) {
            S.fin.g3.followed = true;
            return stepOn(bi(...TX.finale.setsBackAgainstThe(c)), sanctum);
          }
          S.fin.left.push(c.id);
          stepOn(bi(...TX.finale.nodsAndSetsBack(c)), sanctum);
        }
      })
    );
  ch.push({
    label: __text('leavePartOfYourself'),
    sub: __text('aMemoryAndMuchOfYour'),
    cls: 'danger',
    fn: () => {
      const more = chance(G7.more);
      S.fin.g3 = { kind: 'self', more: more };
      stepOn(
        `<p>${bi(...TX.finale.youGiveItA())}</p>` +
          (more
            ? `<p class="horror">${bi(...TX.finale.thenItTakesAnother())}</p>` + hurt(...RULES.descent.cost.selfMore, { k: 'below' })
            : costOf('self')),
        sanctum
      );
    }
  });
  show({ kicker: DESC(), title: __text('theSeventhGate'), body: [said + `<p>${bi(GATES.seven)}</p>`], choices: ch });
}
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
      (f.tries ? D.again : 0);
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
const circle = () => freeCult().filter(c => !(S.fin.heldBack || []).includes(c.id));
function sanctum() {
  S.phase = 'sanctum';
  const turned = turnAtTheEnd();
  const cult = circle();
  if (!cult.length) {
    S.fin.empty = true;
    ending(chance(RULES.descent.emptied) ? 'triumph' : 'doom');
    return;
  }
  const hier = cult.find(c => c.id === S.hierophant) || cult[0];
  show({ kicker: DESC(), title: __text('theSanctum'), body: sanctumBody(cult, hier, turned), choices: sanctumActs(hier) });
}
function sanctumBody(cult, hier, turned) {
  const again = S.fin.tries > 0,
    waiting = cult.filter(c => !turned.ids.includes(c.id)),
    smiles = !again && !(S.fin.turned || []).includes(hier.id);
  const body = [
    `<p>${bi(ASP(S.patron).sanctum)}</p>` +
      (waiting.length ? bi(...TX.finale.aroundItRobedIn(waiting, smiles, hier, again)) : '') +
      turned.html
  ];
  if (S.fin.tries) body.push(`<p class="warn">${bi(...TX.finale.theRiteGoesOn())}</p>`);
  return body;
}
function sanctumActs(hier) {
  const f = S.fin,
    o = () => sanctumOdds(),
    ch = [];
  S.items
    .filter(it => ITEMS[it].ward)
    .forEach(it =>
      ch.push({
        label: __text('raiseA'),
        sub: f.named ? bi(...TX.finale.ifWardAndIs(it, f)) : bi(...TX.finale.ifTheWardAgainst(it)),
        fn: () => {
          f.acts.push({ kind: 'ward', it: it });
          finalAct(S.godOfWard[it] === S.patron ? o().ward(it) : RULES.descent.wrongWard, 'ward');
        }
      })
    );
  if (f.named)
    ch.push({
      label: bi(...TX.finale.speakTheCounterRite(f)),
      sub: __text('ifYouNamedTheRightPower'),
      fn: () => {
        f.acts.push({ kind: 'rite', g: f.named });
        finalAct(f.named === S.patron ? o().rite() : RULES.descent.wrongRite, 'rite');
      }
    });
  const many = circle().length > 1;
  if (has('revolver'))
    ch.push({
      label: __text('shootA'),
      sub: bi(...TX.finale.aLastResortMiss(many, hier)),
      cls: 'danger',
      fn: () => {
        f.acts.push({ kind: 'shoot', id: hier.id });
        finalAct(o().shoot(), 'shoot');
      }
    });
  if (!f.acts.some(a => a.kind === 'fire'))
    ch.push({
      label: bi(...TX.finale.overturnTheBraziersInto()),
      sub: bi(...TX.finale.aLastResortThe()),
      cls: 'danger',
      fn: () => {
        f.acts.push({ kind: 'fire' });
        finalAct(o().fire(), 'fire');
      }
    });
  if (!ch.length)
    ch.push({
      label: __text('thereIsNothingLeftToTry'),
      sub: __text('standAndWatch'),
      cls: 'danger',
      fn: () => {
        if (!chance(RULES.descent.falters)) return ending('doom');
        f.acts.push({ kind: 'none', ok: true });
        ending('pyrrhic', 'falter');
      }
    });
  return ch;
}
const FAILED = {
  ward: act => bi(...TX.finale.youHoldUpTo(act)),
  rite: () => bi(...TX.finale.theWordsFallDead()),
  shoot: act => {
    const t = C(act.id),
      many = circle().length > 1;
    return bi(...TX.finale.theShotGoesWide(t, many));
  },
  fire: () => bi(...TX.finale.theBitumenCatchesAnd())
};
function finalAct(p, kind) {
  const act = S.fin.acts[S.fin.acts.length - 1];
  if (chance(p)) {
    if (act) act.ok = true;
    const D = RULES.descent,
      whole = S.fin.tries === 0 && S.nerve >= D.cleanNerve && S.wounds < S.woundsMax - 1,
      clean = (kind === 'ward' || kind === 'rite') && chance(whole ? D.cleanSure : D.cleanLucky);
    ending(clean ? 'triumph' : 'pyrrhic', kind);
    return;
  }
  S.fin.tries++;
  if (act) act.ok = false;
  S.fin.cause = 'rite';
  if (kind === 'shoot') lose('revolver');
  const h = costOf(kind);
  if (checkEnd()) return;
  const failed = { kicker: DESC(), title: __text('itFails'), body: [`<p class="horror">${FAILED[kind](act)}</p>` + h] };
  if (!chance(RULES.descent.moreTime[S.fin.tries - 1] ?? RULES.scale.rarest)) {
    failed.body.push(`<p class="horror">${bi(...TX.finale.thereIsNoTime())}</p>`);
    momentBefore(failed, 'doom');
    return;
  }
  show({ ...failed, choices: [{ label: __text('oneMoreAct'), cls: 'danger', fn: sanctum }] });
}
function statusText(c) {
  if (c.status === 'taken') return c.takenBy === 'you' ? __text('killedByYouNight') : __text('takenNight');
  if (c.status === 'exposed') return __text('exposed');
  if (c.status === 'dismissed') return __text('sentAway');
  if (S.fin && S.fin.acts.some(a => a.kind === 'shoot' && a.ok && a.id === c.id)) return __text('shotBelow');
  if (S.fin && [S.fin.betrayed, S.fin.turned || [], S.fin.cameBack || []].some(l => l.includes(c.id))) return __text('betrayedYou');
  if (c.role === 'cult') return __text('neverUnmasked');
  return __text('survived');
}
