// game/below.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const GATE_N = __text('GATE_N');
function favour(html, said) {
  S.fin.favour = (S.fin.favour || 0) + 1;
  return { html: html, sign: 'p', said: said };
}
function price(html, n, w, said, cause) {
  if (w) S.fin.cause = cause || 'grip';
  return { html: html + hurt(n, w, { k: 'below' }), sign: 'm', said: said };
}
const plain = (html, said, sign = 'n') => ({ html: html, sign: sign, said: said });
const steadied = () => nerveNote(regain(B_().steadied));
const pline = (en, rus) => `<p>${bi(en, rus)}</p>`,
  hline = (en, rus) => `<p class="horror">${bi(en, rus)}</p>`;
function lineOr(g, intro, none = intro, k = RULES.scale.surest) {
  const l = chance(k) ? learnFact(g) : null;
  return l != null ? intro + factP(l) : none;
}
const eaten = () => lineOr(S.patron, hline(...TX.below.theBreadTastesOf()), hline(...TX.below.theBreadTastesOf2()), B_().learn);
const answered = () => lineOr(S.patron, hline(...TX.below.youAnswerTheVoice()), hline(...TX.below.youAnswerTheVoice2()), B_().learn);
function lastDead() {
  const t = S.order
    .map(C)
    .filter(c => c.status === 'taken')
    .sort((a, b) => b.takenDay - a.takenDay)[0];
  return t ? { en: `${t.short}’s`, ru: __text('g') } : { en: 'Crane’s', ru: __text('text') };
}
const natureOf = ways =>
  Math.max(
    -2,
    Math.min(
      2,
      ways.reduce((a, w) => a + (NATURE[S.aspectOf[S.patron]][w] || 0), 0)
    )
  );
function trialP(base, ways, mod = 0) {
  const B = RULES.below,
    known = (S.fin && S.fin.named === S.patron ? B.known : 0) + B.signSeen * S.omenSeen.length;
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
const dearer = (n, ways) => n + (natureOf(ways) < 0 ? 1 : 0);
function paid(key, ways, html, said, cause) {
  const [n, w] = B_().cost[key];
  return price(html, dearer(n, ways), w, said, cause);
}
function attempt({ way: way, ways: ways, mod: mod = 0, well: well, badly: badly }) {
  return tried(B_()[way], ways, typeof mod === 'function' ? mod() : mod) ? well() : paid(way, ways, ...badly());
}
const trial = ({ label: label, sub: sub, ...t }) => ({ label: label, sub: sub, go: () => attempt(t) });
const by4 = o => o[S.aspectOf[S.patron]];
const B_ = () => RULES.below;
const falterer = () => C(hashPick(withYou(), S.salt, 'falter', S.day));
const BELOW = {
  neti: {
    when: 'early',
    text: n => {
      const g = by4({
        fire: __text('aGarmentOfAshStillWarm'),
        dust: __text('aGarmentOfDust'),
        sea: __text('aGarmentOfWetBlackWeed'),
        teeth: __text('aGarmentOfMattedHair'),
        plague: TX.below.aGarmentOfSoiled(),
        madness: __text('aGarmentOfBrokenLookingGlass')
      });
      return pline(...TX.below.atTheGateSomeone(n, g));
    },
    choices: () => [
      trial({
        label: __text('giveYourOwnName'),
        sub: __text('itWillKnowYouAfter'),
        way: 'name',
        ways: ['truth'],
        well: () => favour(pline(...TX.below.itRepeatsYourName()), TX.below.youGaveTheGatekeeper()),
        badly: () => [hline(...TX.below.itRepeatsYourName2()), TX.below.youGaveTheGatekeeper2()]
      }),
      trial({
        label: __text('giveCraneSName'),
        sub: __text('aLieToADoorkeeper'),
        way: 'lie',
        ways: ['guile'],
        well: () => plain(pline(...TX.below.itSaysNothingAnd()), TX.below.youGaveTheGatekeeper3()),
        badly: () => [hline(...TX.below.craneItSaysCrane()), TX.below.youGaveTheGatekeeper4()]
      }),
      trial({
        label: __text('sayNothingAndPushPast'),
        sub: __text('itMayNotLetYou'),
        way: 'push',
        ways: ['bold'],
        well: () => plain(pline(...TX.below.youWalkPastIt()), TX.below.youPushedPastThe()),
        badly: () => [hline(...TX.below.itsHandComesOut()), TX.below.youTriedToPush()]
      })
    ]
  },
  judges: {
    when: 'early',
    text: n => pline(...TX.below.beyondTheGateThe(n)),
    choices: () => {
      const weighed = B_().judgedRight * S.stats.right - B_().judgedWrong * S.stats.wrong;
      return [
        trial({
          label: bi(...TX.below.bowToEachOf()),
          sub: __text('slowAndHumbling'),
          way: 'bow',
          ways: ['humble', 'patience'],
          mod: weighed,
          well: () => favour(pline(...TX.below.youBowSevenTimes()), TX.below.youBowedToThe()),
          badly: () => [hline(...TX.below.youBowAndThe()), TX.below.youBowedToThe2()]
        }),
        trial({
          label: __text('walkPastWithYourEyesOn'),
          sub: __text('quickIfTheyAllowIt'),
          way: 'eyesDown',
          ways: ['haste'],
          mod: weighed,
          well: () => plain(pline(...TX.below.youCountTheBricks()), TX.below.youPassedTheJudges()),
          badly: () => [hline(...TX.below.oneOfThemSpeaks()), TX.below.oneOfTheJudges()]
        }),
        trial({
          label: __text('meetEachPaintedGazeInTurn'),
          sub: __text('letThemSeeWhomTheyJudge'),
          way: 'stare',
          ways: ['bold'],
          mod: weighed,
          well: () => favour(pline(...TX.below.youLookEachOf()), TX.below.youMetTheGaze()),
          badly: () => [hline(...TX.below.theSeventhDoesNot()), TX.below.oneOfTheJudges2()]
        })
      ];
    }
  },
  bread: {
    when: 'any',
    text: n => pline(...TX.below.inASideChamber(n)),
    choices: () => [
      trial({
        label: __text('eatAndDrink'),
        sub: __text('toKnowWhatTheDeadKnow'),
        way: 'eat',
        ways: ['take'],
        well: () => plain(eaten(), TX.below.youAteTheBread()),
        badly: () => __text('youAteTheBreadOfThe')
      }),
      trial({
        label: bi(...TX.below.pourTheWaterOut()),
        sub: __text('goodMannersBelow'),
        way: 'pour',
        ways: ['water', 'offer'],
        well: () => favour(pline(...TX.below.theFloorDrinksIt()), TX.below.youPouredOutThe()),
        badly: () => [pline(...TX.below.theWaterRunsAway()), TX.below.youPouredOutThe2()]
      }),
      trial({
        label: __text('touchNothing'),
        sub: __text('asTheWiseManDid'),
        way: 'touch',
        ways: ['refuse'],
        well: () => plain(pline(...TX.below.youLeaveTheTable()) + steadied(), TX.below.youLeftTheTable(), 'p'),
        badly: () => [hline(...TX.below.youLeaveTheTable2()), TX.below.youLeftTheTable2()]
      })
    ]
  },
  voices: {
    when: 'early',
    text: n => {
      const d = lastDead();
      return pline(...TX.below.pastTheGateThe(n, d));
    },
    choices: () => {
      const c = withYou().map(C)[0],
        louder = -B_().dead * S.stats.taken;
      const a = [
        trial({
          label: __text('answer'),
          sub: __text('theDeadDoNotLie'),
          way: 'answer',
          ways: ['truth', 'take'],
          mod: louder,
          well: () => plain(answered(), TX.below.youAnsweredTheVoices()),
          badly: () => __text('youAnsweredTheVoicesOfThe')
        }),
        trial({
          label: __text('stopYourEarsAndWalkOn'),
          sub: __text('doNotListen'),
          way: 'deaf',
          ways: ['refuse'],
          mod: louder,
          well: () => plain(pline(...TX.below.youHumAMusic()), TX.below.youWalkedPastThe()),
          badly: () => [hline(...TX.below.youHearItAnyway()), TX.below.theVoicesOfThe()]
        })
      ];
      if (c)
        a.push({
          label: __text('letTalkYouPastThem'),
          sub: bi(...TX.below.isSteadierThanYou(c)),
          go: () => {
            const beside = loyal().filter(x => x.id !== c.id).length;
            if (tried(B_().lead, ['company'], louder + RULES.descent.companion * beside))
              return plain(pline(...TX.below.takesYourArmAnd(c)) + steadied(), TX.below.talkedYouPastThe(c), 'p');
            S.fin.left.push(c.id);
            return plain(hline(...TX.below.stopsToAnswerThem(c)), TX.below.stoppedToAnswerThe(c), 'm');
          }
        });
      return a;
    }
  },
  passage: {
    when: 'any',
    text: n => {
      const t = by4({
        fire: TX.below.pastTheGateThe2(n),
        dust: TX.below.pastTheGateGrey(n),
        sea: TX.below.pastTheGateBlack(n),
        teeth: TX.below.pastTheGateThe3(n),
        plague: TX.below.pastTheGateThe4(n),
        madness: TX.below.pastTheGateThe5(n)
      });
      return pline(t[0], t[1]);
    },
    choices: () => {
      const hurtBy = by4({
          fire: TX.below.theHeatTakesThe(),
          dust: TX.below.somethingUnderTheDust(),
          sea: TX.below.somethingInTheWater(),
          teeth: TX.below.somethingInTheWall(),
          plague: TX.below.somethingBehindTheSheets(),
          madness: TX.below.atTheHundredthTurn()
        }),
        weak = -B_().wounded * S.wounds;
      const a = [
        trial({
          label: __text('goStraightThrough'),
          sub: __text('quickAndItMayHurt'),
          way: 'through',
          ways: ['bold', 'haste'],
          mod: weak,
          well: () => plain(pline(...TX.below.youGoThroughWith()), TX.below.youWentStraightThrough()),
          badly: () => [hline(...hurtBy), TX.below.thePowerOwnPassage(), 'passage']
        }),
        {
          label: __text('lookForAnotherWayRound'),
          sub: __text('slowerTheRiteWillNotWait'),
          go: () => {
            const step = vary(1);
            S.doom += step;
            const h =
              pline(...(step ? TX.below.youFindAnotherWay() : TX.below.youFindAnotherWay2())) +
              (step ? `<p class="loss">${step > 1 ? __text('theRiteDrawsMuchNearer') : __text('theRiteDrawsNearer')}</p>` : '');
            return attempt({
              way: 'round',
              ways: ['patience'],
              mod: weak,
              well: () => plain(h, step ? TX.below.youWentTheLong() : TX.below.youWentTheLong2(), step ? 'm' : 'n'),
              badly: () => [h + hline(...TX.below.halfwayAlongTheCrawl()), TX.below.youWentTheLong3()]
            });
          }
        }
      ];
      if (has('torch'))
        a.push({
          label: __text('lightTheWayWithTheTorch'),
          sub: bi(...TX.below.electricLightWhereNone()),
          go: () => {
            if (tried(B_().torch, ['light'])) return favour(pline(...TX.below.theElectricLightGoes()), TX.below.youLitThePower());
            lose('torch');
            return plain(hline(...TX.below.theTorchFlickersAnd()), TX.below.yourTorchDiedIn(), 'm');
          }
        });
      return a;
    }
  },
  dog: {
    when: 'early',
    text: n => pline(...TX.below.pastTheGateA(n)),
    choices: () => [
      trial({
        label: __text('offerItTheBreadInYour'),
        sub: __text('everyDogHasItsPrice'),
        way: 'feedDog',
        ways: ['offer'],
        well: () => favour(pline(...TX.below.itTakesTheBread()), TX.below.youFedTheBlack()),
        badly: () => [hline(...TX.below.itDoesNotLook()), TX.below.theBlackDogBelow(), 'grip']
      }),
      trial({
        label: __text('speakToItAsToA'),
        sub: __text('theOldWordsForAWatchdog'),
        way: 'callDog',
        ways: ['word'],
        well: () => plain(pline(...TX.below.atTheOldWords()), TX.below.youSpokeTheOld()),
        badly: () => [hline(...TX.below.itHearsYouOut()), TX.below.theBlackDogBelow2()]
      }),
      trial({
        label: __text('stepOverIt'),
        sub: __text('withoutASound'),
        way: 'stepOver',
        ways: ['bold'],
        well: () => plain(pline(...TX.below.youStepOverIt()), __text('youSteppedOverTheBlackDog')),
        badly: () => [hline(...TX.below.itWaitsUntilYou()), TX.below.theBlackDogBelow3(), 'grip']
      })
    ]
  },
  brazier: {
    when: 'any',
    text: n => {
      const f = by4({
        fire: ['white', __text('text2')],
        dust: __text('greyAndGivesNoWarmth'),
        sea: __text('greenLikeALampUnderWater'),
        teeth: __text('redAndSpitsLikeFat'),
        plague: TX.below.yellowAndFliesCrawl(),
        madness: __text('violetAndBurnsDownward')
      });
      return pline(...TX.below.pastTheGateA2(n, f));
    },
    choices: () => [
      trial({
        label: __text('feedTheFlameFromTheJar'),
        sub: __text('anOfferingAsThePriestsMade'),
        way: 'feed',
        ways: ['offer'],
        well: () => favour(pline(...TX.below.theFlameLeansTowards()), TX.below.youFedTheBrazier()),
        badly: () => __text('theBrazierBelowLeaptUpYour')
      }),
      trial({
        label: bi(...TX.below.putItOutWith()),
        sub: __text('darknessIsSaferPerhaps'),
        way: 'douse',
        ways: ['water'],
        well: () => favour(pline(...TX.below.theFlameGoesOut()), TX.below.youPutOutThe()),
        badly: () => [hline(...TX.below.theWaterTurnsTo()), TX.below.youTriedToPut()]
      }),
      trial({
        label: __text('takeACoalToLightYour'),
        sub: __text('fireFromBelowToSeeBelow'),
        way: 'coal',
        ways: ['light', 'take'],
        well: () => plain(pline(...TX.below.theCoalSitsIn()) + steadied(), TX.below.youTookACoal(), 'p'),
        badly: () => [hline(...TX.below.theCoalBurnsThrough()), TX.below.aCoalFromThe(), 'fire']
      })
    ]
  },
  cradle: {
    when: 'any',
    text: n => pline(...TX.below.inANichePast(n)),
    choices: () => [
      trial({
        label: __text('rockItAndHum'),
        sub: __text('whateverItIsLetItSleep'),
        way: 'rock',
        ways: ['humble', 'patience'],
        well: () => favour(pline(...TX.below.underYourHandThe()), TX.below.youRockedTheCradle()),
        badly: () => [hline(...TX.below.theBreathingStopsThen()), TX.below.somethingInTheCradle()]
      }),
      {
        label: __text('leaveSomethingOfYoursInIt'),
        sub: bi(...TX.below.aGiftAsThe()),
        go: () =>
          tried(B_().gift, ['offer'])
            ? favour(pline(...TX.below.youLayAButton()), TX.below.youLeftAGift())
            : plain(pline(...TX.below.youLayAButton2()), TX.below.youLeftAGift2(), 'm')
      },
      trial({
        label: __text('lookInside'),
        sub: __text('youHaveToKnow'),
        way: 'peek',
        ways: ['take', 'bold'],
        well: () =>
          price(
            lineOr(S.patron, pline(...TX.below.thereIsNothingIn()), pline(...TX.below.thereIsNothingIn2())),
            ...B_().cost.peekSeen,
            __text('youLookedIntoTheCradleBelow')
          ),
        badly: () => [hline(...TX.below.somethingInTheCradle2()), TX.below.somethingInTheCradle3(), 'grip']
      })
    ]
  },
  bones: {
    when: 'late',
    text: n => pline(...TX.below.pastTheGateA3(n)),
    choices: () => [
      {
        label: __text('openTheSatchel'),
        sub: __text('craneSByTheInitials'),
        go: () => {
          const missing = charmsToFind();
          if (missing.length && tried(B_().satchel, ['take'])) {
            const w = pick(missing);
            gain(w);
            return price(pline(...TX.below.insideCraneNotebookHis(w)) + gained(w), ...B_().cost.satchel, TX.below.youFoundInCrane(w));
          }
          return paid(
            'satchel',
            ['take'],
            lineOr(null, pline(...TX.below.insideCraneNotebookThe()), pline(...TX.below.insideCraneNotebookEvery()), B_().satchelLine),
            TX.below.youOpenedCraneSatchel()
          );
        }
      },
      {
        label: __text('leaveTheDeadInPeace'),
        sub: __text('theyHaveBeenDisturbedEnough'),
        go: () =>
          tried(B_().peace, ['refuse'])
            ? favour(pline(...TX.below.youLeaveThemAs()), TX.below.youLeftTheCult())
            : plain(pline(...TX.below.youGoOnThe()), __text('youLeftTheCultSDead'))
      }
    ]
  },
  pool: {
    when: 'late',
    text: n => pline(...TX.below.pastTheGateThe6(n)),
    choices: () => [
      {
        label: __text('lookCloser'),
        sub: __text('itMayKnowSomething'),
        go: () => {
          const f = S.fin;
          if (!f.named)
            return attempt({
              way: 'pool',
              ways: ['take'],
              well: () => plain(pline(...TX.below.yourReflectionLooksBack()), TX.below.yourReflectionInThe()),
              badly: () => [hline(...TX.below.yourReflectionLooksBack2()), TX.below.yourReflectionInThe2()]
            });
          if (!tried(B_().pool, ['take']))
            return paid('poolGrip', ['take'], hline(...TX.below.yourReflectionReachesUp()), TX.below.yourReflectionInThe3(), 'grip');
          const right = (f.named === S.patron) === chance(B_().truthful);
          return price(
            right ? hline(...TX.below.yourReflectionNodsSlowly()) : hline(...TX.below.yourReflectionShakesIts()),
            ...B_().cost.poolSeen,
            (right ? TX.below.yourReflectionInThe4() : TX.below.yourReflectionInThe5()).map(
              (x, i) => x + (right === (f.named === S.patron) ? '' : __text('andLied')[i])
            )
          );
        }
      },
      trial({
        label: __text('breakTheSurfaceWithYourBoot'),
        sub: __text('whateverItIs'),
        way: 'breakPool',
        ways: ['break'],
        well: () => plain(pline(...TX.below.theReflectionBreaksInto()), TX.below.youBrokeYourReflection()),
        badly: () => [hline(...TX.below.theReflectionBreaksInto2()), TX.below.youBrokeYourReflection2()]
      }),
      trial({
        label: bi(...TX.below.walkRoundItWith()),
        sub: __text('doNotLook'),
        way: 'noLook',
        ways: ['refuse'],
        well: () => plain(pline(...TX.below.youDoNotLook()), TX.below.youWalkedRoundThe()),
        badly: () => [hline(...TX.below.youDoNotLook2()), TX.below.yourReflectionFollowedYou()]
      })
    ]
  },
  falter: {
    when: 'late',
    ok: () => withYou().length > 0,
    text: n => {
      const c = falterer();
      return pline(...TX.below.pastTheGateStops(n, c));
    },
    choices: () => {
      const c = falterer(),
        him = EP.him(c);
      return [
        {
          label: __text('steady'),
          sub: __text('itWillCostYou'),
          go: () => {
            const well = tried(B_().steady, ['company'], Ties.friend(c) ? B_().trusted : 0);
            const cost = B_().cost[well ? 'steady' : 'steadyBadly'];
            if (chance(B_().comesOn[well ? 0 : 1]))
              return price(pline(...TX.below.youTalkDownStep(c)), ...cost, TX.below.youSteadiedWhenFaltered(c));
            S.fin.left.push(c.id);
            return price(hline(...TX.below.youTalkToFor(c, him)), ...cost, TX.below.youTriedToSteady(c));
          }
        },
        {
          label: __text('sendBackUp'),
          sub: withYou().length > 1 ? bi(...TX.below.willBeSafeAnd(c, him)) : bi(...TX.below.willBeSafeAnd2(c)),
          go: () => {
            const alone = withYou().length === 1;
            if (!chance(B_().goesBack)) return plain(pline(...TX.below.shakesHeadNoIs(c, alone)), TX.below.youSentBackUp(c));
            S.fin.left.push(c.id);
            return plain(pline(...TX.below.goesBackUpTowards(c)), TX.below.youSentBackUp2(c));
          }
        },
        {
          label: bi(...TX.below.goOnAndLet(him, c)),
          sub: __text('mayNot'),
          go: () => {
            if (tried(B_().follow, ['haste'], Ties.friend(c) ? B_().trusted : 0))
              return plain(pline(...TX.below.afterAWhileYou(c)), TX.below.falteredAndFollowedYou(c));
            S.fin.left.push(c.id);
            return plain(hline(`${c.short} does not follow.`, __text('text3')), TX.below.falteredAndDidNot(c), 'm');
          }
        }
      ];
    }
  },
  lamassu: {
    when: 'late',
    text: n => pline(...TX.below.pastTheGateA4(n)),
    choices: () => {
      const charms = S.items.filter(it => ITEMS[it].ward),
        one = charms.length === 1 ? charms[0] : null;
      const a = [];
      if (charms.length)
        a.push({
          label: one ? __text('holdUpTheCharmYouCarry') : __text('holdUpTheCharmsYouCarry'),
          sub: __text('theOldGuardiansKnowTheirOwn'),
          go: () => {
            const ward = S.wardOf[S.patron],
              w = chance(B_().truthful) ? (has(ward) ? ward : null) : pick(charms.filter(x => x !== ward).concat([null]));
            if (w) {
              Record.journal(bi(...TX.below.belowTheWingedBull(w)));
              return price(
                one ? pline(...TX.below.youHoldUpAnd(w)) : pline(...TX.below.oneByOneYou(w)),
                ...B_().cost.charmsBowed,
                w === ward ? TX.below.theWingedBullLowered(w) : TX.below.theWingedBullLowered2(w)
              );
            }
            Record.journal(one ? bi(...TX.below.belowTheWingedBull2(one)) : bi(...TX.below.belowTheWingedBull3()));
            const ok = tried(B_().charms, ['bronze']),
              [n, wounds] = B_().cost[ok ? 'charmsPast' : 'charms'];
            return price(
              (one ? pline(...TX.below.youHoldUpThe(one)) : pline(...TX.below.oneByOneYou2())) +
                (ok ? '' : hline(...TX.below.theWingShiftsAs())),
              ok ? n : dearer(n, ['bronze']),
              wounds,
              (one ? TX.below.theWingedBullDid(one) : TX.below.theWingedBullLowered3()).map(
                (x, i) => x + (has(ward) ? __text('thoughYouCarriedTheWard')[i] : '')
              ),
              'wing'
            );
          }
        });
      a.push(
        trial({
          label: __text('squeezePastUnderItsWing'),
          sub: __text('quickly'),
          way: 'wing',
          ways: ['bold', 'haste'],
          well: () => plain(pline(...TX.below.youSqueezePastThe()), __text('youSqueezedPastTheWingedBull')),
          badly: () => [hline(...TX.below.theWingComesDown()), TX.below.theWingedBullWing(), 'wing']
        })
      );
      return a;
    }
  },
  scribe: {
    when: 'any',
    text: n => pline(...TX.below.pastTheGateIn(n)),
    choices: () => [
      {
        label: __text('readWhatIsWritten'),
        sub: __text('itCostsWhatReadingCosts'),
        go: () => {
          const ok = tried(B_().read, ['take']),
            h = lineOr(null, pline(...TX.below.itIsALine()), pline(...TX.below.itIsYourOwn()), B_().learn);
          return ok
            ? plain(h, TX.below.youReadTheScribe())
            : { html: h + readingCost(dearer(B_().cost.read, ['take'])), sign: 'm', said: TX.below.youReadTheScribe2() };
        }
      },
      trial({
        label: __text('finishTheLine'),
        sub: __text('letYourHandDecide'),
        way: 'finish',
        ways: ['word'],
        well: () => favour(pline(...TX.below.yourHandWritesThe()), TX.below.youFinishedTheScribe()),
        badly: () => [hline(...TX.below.yourHandWritesYour()), TX.below.yourHandFinishedThe()]
      }),
      trial({
        label: __text('smashIt'),
        sub: __text('someThingsShouldNotBeFinished'),
        way: 'smash',
        ways: ['break'],
        well: () => favour(pline(...TX.below.theTabletBreaksLike()), TX.below.youSmashedTheScribe()),
        badly: () => [pline(...TX.below.theTabletBreaksLike2()), TX.below.youSmashedTheScribe2()]
      })
    ]
  },
  seven: {
    when: 'late',
    text: n => pline(...TX.below.pastTheGateSeven(n)),
    choices: () => {
      const known = B_().sevenSigns * S.omenSeen.length;
      return [
        trial({
          label: __text('countThemAloudOneToSeven'),
          sub: __text('asTheOldHymnsCountThe'),
          way: 'count',
          ways: ['word'],
          mod: known,
          well: () => favour(pline(...TX.below.atSevenTheRing()), TX.below.youCountedTheSeven()),
          badly: () => [hline(...TX.below.youCountSevenThen()), TX.below.youCountedTheSeven2()]
        }),
        trial({
          label: __text('edgeRoundThemAlongTheWall'),
          sub: __text('slowlyAndTouchingNobody'),
          way: 'ring',
          ways: ['patience'],
          mod: known,
          well: () => plain(pline(...TX.below.youEdgeRoundWith()), TX.below.youEdgedRoundThe()),
          badly: () => [hline(...TX.below.asYouPassThe()), TX.below.oneOfTheSeven()]
        }),
        trial({
          label: __text('walkStraightThroughTheRing'),
          sub: __text('theyAreOnlyFigures'),
          way: 'ringThrough',
          ways: ['bold'],
          mod: known,
          well: () => plain(pline(...TX.below.youWalkThroughThe()), TX.below.youWalkedStraightThrough()),
          badly: () => [hline(...TX.below.sevenHandsCloseOn()), TX.below.theSevenTookHold(), 'grip']
        })
      ];
    }
  },
  salt: {
    when: 'late',
    text: n => pline(...TX.below.pastTheGateThe7(n)),
    choices: () => [
      trial({
        label: __text('wadeAcross'),
        sub: __text('quicklyBeforeYouThinkAboutIt'),
        way: 'wade',
        ways: ['water', 'haste'],
        well: () => plain(pline(...TX.below.theWaterIsOnly()), __text('youWadedTheChannelOfBlack')),
        badly: () => [hline(...TX.below.halfwayAcrossTheBottom()), TX.below.theChannelOfBlack(), 'grip']
      }),
      trial({
        label: __text('pourALibationIntoItFirst'),
        sub: bi(...TX.below.aLittleOfYour()),
        way: 'libation',
        ways: ['offer', 'water'],
        well: () => favour(pline(...TX.below.theChannelStillsAnd()), TX.below.youPouredALibation()),
        badly: () => [hline(...TX.below.theChannelDrinksYour()), TX.below.theChannelOfBlack2()]
      }),
      trial({
        label: __text('takeARunAndLeapIt'),
        sub: __text('itIsNotSoVeryWide'),
        way: 'leap',
        ways: ['bold', 'haste'],
        mod: () => -B_().wounded * S.wounds,
        well: () => plain(pline(...TX.below.youLandOnThe()), __text('youLeaptTheChannelOfBlack')),
        badly: () => [hline(...TX.below.itIsWiderThan()), TX.below.youFellShortOf(), 'grip']
      })
    ]
  }
};
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
    title: __text('theGate'),
    body: [E.text(n)],
    choices: E.choices().map((ch, k) => ({
      label: ch.label,
      sub: ch.sub,
      fn: () => {
        const r = ch.go();
        f.enc.push({ id: id, gate: gate, k: k, sign: r.sign, said: r.said });
        stepOn(r.html, after);
      }
    }))
  });
}
