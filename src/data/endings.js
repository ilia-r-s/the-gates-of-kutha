// data/endings.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const END_IDS = __text('END_IDS');
const END_OLD = __text('END_OLD');
const END_TITLES = __text('END_TITLES');
const END_CALM = __text('END_CALM');
const END_TRACE = __text('END_TRACE');
function nightDeath() {
  const v = S.log.visit,
    hers = !!v && v.day === S.day;
  if (hers && S.hurtBy === 'visit') return 'visit';
  if (hers && S.hurtBy === 'wrist') return 'wrist';
  if (hers && v.agreed && (v.through === 'you' || v.through === 'both')) return v.through;
  if (hers && v.agreed && v.through === 'hurt' && S.hurtBy === 'night') return 'screamed';
  if (S.hurtBy === 'deed' && S.log.deed) return 'deed';
  if (S.hurtBy === 'peril' || S.hurtBy === 'spite') return S.hurtBy;
  return 'taken';
}
const NIGHT_IN_BED = ['visit', 'wrist', 'screamed', 'deed', 'peril', 'spite'],
  NIGHT_FOUND = NIGHT_IN_BED.concat(['both']);
const PERIL_KILLED = __text('PERIL_KILLED');
const HEARSAY = __text('HEARSAY');
function hearsay() {
  const b = S.log.broke,
    ways = b && HEARSAY[b.k] ? HEARSAY[b.k](b) : [];
  return ways.length ? ways[Math.floor(hash01(S.salt, 'hearsay', b.k) * ways.length)] : null;
}
function endStory(id, how) {
  const E = ENDINGS,
    p = t => `<p>${t}</p>`,
    old = k => E[k].text.map(t => p(bi(t)));
  const f = S.fin,
    asp = S.aspectOf[S.patron],
    act = k => f && f.acts.find(a => a.kind === k && a.ok);
  switch (id) {
    case 'unopened': {
      const L = S.log.lastOne,
        c = L && C(L.id);
      return (!c ? [] : [p(L.how === 'night' ? __text('itWasTheLastOfThem') : __text('itWasTheLastOfThem2'))]).concat(old('exposed'));
    }
    case 'sealed': {
      const a = act('ward'),
        it = a ? a.it : S.wardOf[S.patron],
        [holds, after] = old('triumph');
      if (S.godOfWard[it] === S.patron) return [p(__text('youRaiseAboveYourHeadAnd')), holds, after];
      return [p(__text('itWasTheyWereYouRaise')), p(__text('somethingVastSettlesBackIntoThe')), after];
    }
    case 'banished': {
      const a = act('rite');
      if (a && a.g !== S.patron) return [p(__text('youSpeakTheCounterRiteAgainst')), p(__text('somethingBelowLetsGoOfThe'))];
      return [p(__text('youSpeakTheCounterRiteAs')), p(__text('somethingBelowLetsGoOfThe2'))];
    }
    case 'emptied': {
      const fin = S.fin || {},
        back = (fin.heldBack || []).filter(x => !(fin.stayedAway || []).includes(x))[0],
        away = (fin.stayedAway || [])[0],
        mine = S.order.map(C).find(c => c.role === 'cult' && c.takenBy === 'you'),
        lastUnmasked = Math.max(
          -1,
          ...S.log.accused.filter(a => a.right).map(a => a.day),
          ...(S.log.visit && S.log.visit.struck === 'failed' ? [S.log.visit.day] : [])
        ),
        buried = !!mine && mine.takenDay >= lastUnmasked,
        last = fin.caught
          ? __text('theLastVoiceItHadIs')
          : back
            ? __text('theLastVoiceItHadIs2')
            : away
              ? __text('theLastVoiceItHadWas')
              : buried
                ? __text('theLastVoiceItHadWas2')
                : __text('theLastOfItsVoicesIs');
      return [p(__text('theSeventhGateOpensOnAn') + last), p(__text('youPutTheBraziersOutOne'))];
    }
    case 'shot': {
      const a = act('shoot'),
        c = C(a ? a.id : S.hierophant);
      return [p(__text('theShotIsVeryLoudIn')), p(__text('youClimbOutWithTheRevolver'))];
    }
    case 'burned':
      return [p(__text('youKickTheBraziersOverInto')), p(__text('fromTheCampTheyWatchE'))];
    case 'scarred': {
      const a = how === 'ward' ? act('ward') : null,
        lead = a
          ? S.godOfWard[a.it] === S.patron
            ? __text('cracksCrackInYourHandAs')
            : __text('cracksCrackBindsBindInYour')
          : how === 'falter'
            ? __text('youHaveNothingLeftToRaise')
            : act('rite') && act('rite').g !== S.patron
              ? __text('yourVoiceGivesOutOnThe')
              : __text('yourVoiceGivesOutOnThe2');
      const g3 = S.fin.g3,
        with_ = loyal()
          .map(c => c.id)
          .concat(g3 && g3.kind === 'comp' && !g3.followed && C(g3.id).role !== 'cult' ? [g3.id] : []);
      return [p(lead + ' ' + bi(E.pyrrhic.text[0])), with_.length ? p(__text('youClimbOutWithIntoA')) : p(bi(E.pyrrhic.text[1]))];
    }
    case 'fallen-night': {
      const fr = Ties.friendsNow().sort((x, y) => y.rapport - x.rapport)[0],
        hm = C('hamid'),
        who = fr ? [fr.short, ru.c(fr)] : isFree(hm) ? ['Hamid', __text('text')] : __text('oneOfThePickmen'),
        tr = END_TRACE[asp] || END_TRACE.fire,
        museum = p(bi(E.death.text[1])),
        way = nightDeath(),
        none = !freeCult().length;
      const v = S.log.visit,
        h = v && C(v.id);
      if (way === 'visit') return [p(__text('cameToYourTentOnThat')), museum];
      if (way === 'wrist') return [p(__text('cameToYourTentOnThat2')), museum];
      if (way === 'you' || way === 'both') {
        const came = none ? __text('nobodyOfTheCultIsLeft2') : __text('theyComeForYouInThe2');
        return [p(way === 'you' ? __text('itTakesTheyTakeOnlyYou') : __text('inTheMorningFindsYourTent'))].concat(
          way === 'you' ? old('death') : [museum]
        );
      }
      if (way === 'screamed') {
        const came = none ? __text('somethingCameForYouInThe') : __text('theyCameForYouInThe');
        return [p(__text('cameToYourTentOnThat3')), museum];
      }
      const d = S.log.deed;
      if (way === 'deed') {
        const t = C(d.id);
        return [p(__text('youWentToSTentIn')), museum];
      }
      const danger = way === 'peril' && PERIL_KILLED[(S.log.perils[S.log.perils.length - 1] || {}).name];
      if (way === 'peril' || way === 'spite')
        return [p(way === 'peril' ? __text('inTheEndItIsNot') : __text('andTheCultHasOnlyTo')), museum];
      return [p(none ? __text('nobodyOfTheCultIsLeft') : __text('theyComeForYouInThe'))].concat(old('death'));
    }
    case 'fallen-below':
      return [p(fallBelow())].concat(old('death'));
    case 'bethlem': {
      const said = hearsay();
      return [p(__text('itIsTheTabletsThatDo')), ...(said ? [p(__text('atTheDigTheyTellIt'))] : []), p(bi(E.madness.text[1]))];
    }
    case 'canal': {
      const said = hearsay() || ['', ''];
      return [p(bi(E.madness.text[0])), p(__text('youHaveWrittenAHundredYards'))];
    }
    case 'counting':
      return [p(__text('somewhereBelowBetweenOneGateAnd')), p(__text('thePickmenFindYouAtNoon'))];
  }
  if (id === 'truck') {
    const d = S.log.deed,
      t = C(d.id),
      left = freeCult().length,
      lastDay = S.day >= RULES.start.days;
    return [
      p(__text('theCampPutsYouOnThe')),
      p(
        d.outcome === 'killed'
          ? t.role === 'cult'
            ? __text('inBaghdadTheyTryYouFor')
            : __text('inBaghdadTheyTryYouFor2')
          : __text('forWhatYouTriedToDo')
      ),
      p(left ? (lastDay ? __text('behindYouTheCampGoesOn') : __text('behindYouTheCampGoesOn2')) : __text('behindYouOnTheNightThe'))
    ];
  }
  const out = f && f.empty ? [p(__text('nobodyOfTheCultWasLeft'))] : f && f.early ? [p(__text('theRiteNeverNeededTheDark'))] : [];
  if (id === 'doom-fire') return out.concat([p(bi(E.doom.text[0]) + ' ' + __text('sevenStarsComeDownToMeet')), p(bi(E.doom.text[1]))]);
  if (id === 'doom-dust') return out.concat([p(__text('theRiteCompletesTheDustComes')), p(__text('byMorningEveryDoorBetweenThe'))]);
  if (id === 'doom-sea') return out.concat([p(__text('theRiteCompletesTheBlackWater')), p(__text('byTheNextNewMoonThe'))]);
  if (id === 'doom-plague') return out.concat([p(__text('theRiteCompletesTheClayOn')), p(__text('byTheNextNewMoonThere'))]);
  if (id === 'doom-madness') return out.concat([p(__text('theRiteCompletesInTheBronze')), p(__text('forADayAndANight'))]);
  return out.concat([p(__text('theRiteCompletesTheEmptyCradle')), p(__text('thatSpringNoChildIsBorn'))]);
}
const PASSAGE_HURT = { fire: 'fire', dust: 'grip', sea: 'grip', teeth: 'bite', plague: 'sickness', madness: 'maze' };
function fallBelow() {
  const f = S.fin || {},
    t = f.betrayed && f.betrayed.length ? C(f.betrayed[f.betrayed.length - 1]) : null,
    cause = f.cause === 'passage' ? PASSAGE_HURT[S.aspectOf[S.patron]] || 'grip' : f.cause;
  if (cause === 'knife' && t) return __text('sKnifeDoesItsWorkSlowly');
  if (cause === 'stair') return __text('theStepThatWasNotThere');
  if (cause === 'grip') return __text('whatTookHoldOfYouIn');
  if (cause === 'bite') return __text('theBiteFromTheWallWill');
  if (cause === 'sickness') return __text('byTheNextGateTheSores');
  if (cause === 'maze') return __text('afterTheWallTheTurnsDo');
  if (cause === 'fire') return __text('theBurnDoesNotStopAt');
  if (cause === 'wing') return __text('theStoneWingDoesNotLift');
  if (cause === 'rite') return __text('theRiteClosesOverWhatYou');
  return __text('somewhereBetweenTheGatesYourLamp');
}
const END_STYLE = __text('END_STYLE');
