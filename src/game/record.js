// Evidence, testimony, scene traces and the casebook record.
const Record = (() => {
  const SEEN = { quarrel: true, feast: true };
  function testify(from, about, kind, verdict) {
    const same = t => t.from === from && t.about === about && t.kind === kind && t.verdict === verdict;
    if (SEEN[kind]) {
      if (S.testimony.some(t => same(t) && t.day === S.day)) return;
    } else {
      const i = S.testimony.findIndex(same);
      if (i >= 0 && S.testimony[i].day === S.day) return;
      if (i >= 0) S.testimony.splice(i, 1);
    }
    S.testimony.push({ day: S.day, from: from, about: about, kind: kind, verdict: verdict });
  }
  const about = (c, f) => S.testimony.filter(t => t.about === c.id && f(t)).length;
  const KINDS = {
    vision: {
      chip: (t, a, f, fr) => (t.verdict === 'cult' ? ['bad', __text('dreamtGuiltyD')] : ['good', __text('dreamtCleanD')]),
      testimony: t => bi(...TX.record.cult(t)),
      weigh: t => (t.verdict === 'cult' ? RULES.verdict.dream : -RULES.verdict.dream)
    },
    veiled: {
      chip: () => null,
      testimony: t => bi(...TX.record.veiled(t)),
      habit: t => {
        const cat = t.verdict.split(':')[1];
        return { cat: cat, val: C(t.about).traits[cat] };
      }
    },
    distrust: {
      chip: (t, a, f, fr) => ['', __text('distrusts')],
      testimony: t => bi(...TX.record.distrusts(t)),
      weigh: () => RULES.verdict.distrust
    },
    react: {
      chip: (t, a) =>
        t.verdict === 'fear'
          ? ['warnc', __text('flinchedAtRelics')]
          : t.verdict === 'greed'
            ? ['', __text('eyedRelicsLikeADealer')]
            : ['dimc', __text('calmAtRelics')],
      noticed: (t, a) =>
        t.verdict === 'fear'
          ? bi(...TX.record.flinchedAtSomethingFrom(a))
          : t.verdict === 'greed'
            ? bi(...TX.record.weighedAFindLike(a))
            : __text('tookAFindCalmly'),
      weigh: t => (t.verdict === 'fear' ? RULES.verdict.flinch : null)
    },
    words: {
      chip: (t, a) =>
        t.verdict === 'fear'
          ? ['warnc', __text('flinchedAtTheTabletsWords')]
          : t.verdict === 'greed'
            ? ['', __text('askedWhatTheTabletWouldFetch')]
            : ['dimc', __text('calmAtTheTabletsWords')],
      noticed: (t, a) =>
        t.verdict === 'fear'
          ? bi(...TX.record.flinchedAtALine(a))
          : t.verdict === 'greed'
            ? bi(...TX.record.askedWhatTheTablet(a))
            : bi(...TX.record.readALineFrom(a)),
      weigh: t => (t.verdict === 'fear' ? RULES.verdict.flinch : null)
    },
    slip: {
      chip: (t, a) => ['bad strong', __text('letSomethingSlip')],
      noticed: (t, a) => bi(...TX.record.letSomethingSlipWhen(a)),
      weigh: () => RULES.verdict.slip
    },
    blurt: {
      chip: (t, a) => ['bad strong', __text('knewWhatOnlyTheAttackerCould')],
      noticed: (t, a) => bi(...TX.record.knewSomethingOfA(a)),
      weigh: () => RULES.verdict.strong
    },
    chill: { chip: (t, a) => ['warnc', __text('aChillWhenSpoke')], noticed: (t, a) => __text('aChillAsSpoke') },
    spite: {
      chip: (t, a) => ['bad', __text('caughtAtYourTentMeaningYou')],
      noticed: (t, a) => bi(...TX.record.wasAtYourTent(a)),
      weigh: () => RULES.verdict.spite
    },
    thief: { chip: (t, a) => ['', __text('admittedSmuggling')] },
    claim: {
      chip: (t, a) =>
        S.testimony.filter(x => x.kind === 'claim' && x.from === a.id).pop() !== t
          ? null
          : [
              '',
              t.verdict === 'seer'
                ? __text('claimsToDreamTrue')
                : t.verdict === 'warden'
                  ? __text('claimsToKeepWatch')
                  : t.verdict === 'evade'
                    ? __text('willNotSay')
                    : __text('claimsNoPart')
            ]
    },
    recant: {
      chip: (t, a) => (S.testimony.some(x => x.kind === 'confess' && x.from === a.id) ? null : ['warnc', __text('tookBackAClaim')])
    },
    confess: {
      chip: (t, a) => ['warnc', __text('cameClean')]
    },
    tell: { chip: (t, a) => ['warnc', __text('answeredTooQuickly')], noticed: (t, a) => __text('answeredTooQuickly2') },
    failwatch: {
      chip: (t, a) => ['bad', __text('sleptThroughASwornWatch')],
      noticed: (t, a) => bi(...TX.record.sworeToWatchYour(a)),
      weigh: () => RULES.verdict.failwatch
    },
    mien: {
      chip: (t, a) => ['dimc', __text('seems') + temperName(t.verdict, a)],
      noticed: (t, a) => __text('seems2') + temperName(t.verdict, a)
    },
    temper: {
      chip: (t, a, f, fr) => ['dimc', bi(`${f}: `, `${ru.c(fr)}: `) + temperName(t.verdict, a)],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return __text('saysIs');
      }
    },
    bond: {
      chip: (t, a, f, fr) => {
        const [k, b] = t.verdict.split(':');
        return ['dimc', k === 'close' ? __text('closeToI') : __text('cannotBearA')];
      },
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short,
          [k, b] = t.verdict.split(':');
        return k === 'close' ? bi(...TX.record.saysAndAreThick(f, a, b, t)) : bi(...TX.record.saysCannotBear(f, a, b, t));
      }
    },
    tip: {
      chip: (t, a, f, fr) => ['', __text('sellsTabletsOnTheSide')],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return bi(...TX.record.saysSellsTabletsOn(f, a, t));
      }
    },
    feel: {
      chip: (t, a, f, fr) => [
        'dimc',
        { like: __text('fondOf'), dislike: __text('cannotStand'), flirt: __text('ratherTakenWith') }[t.verdict]
      ],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return {
          like: bi(...TX.record.saysIsFondOf(f, t, a)),
          dislike: bi(...TX.record.saysCannotStand(f, t, a)),
          flirt: bi(...TX.record.speaksOfWithA(f, a, t))
        }[t.verdict];
      }
    },
    flirt: {
      chip: (t, a, f, fr) => ['dimc', t.verdict === 'you' ? __text('sweetOnYou') : __text('sweetOnD')],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'you' ? __text('saysIsSweetOnYou') : bi(...TX.record.saysIsSweetOn(f, a, t));
      }
    },
    hint: {
      chip: (t, a, f, fr) => ['warnc', __text('hintsAtNights')],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return __text('hintsThatIsOutAtNight');
      },
      weigh: () => RULES.verdict.flinch
    },
    thinks: {
      chip: (t, a, f, fr) => ['dimc', t.verdict === 'good' ? __text('onYourSide') : __text('againstYou')],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'good' ? __text('saysSpeaksWellOfYou') : __text('saysDoesNotTrustYou');
      }
    },
    scandal: {
      chip: (t, a, f, fr) =>
        t.verdict === 'bad' ? ['warnc', bi(...TX.record.gossipsAboutHerNight(f, fr))] : ['dimc', bi(...TX.record.isKindAboutHer(f, fr))],
      saying: t => {
        const a = C(t.about).short,
          f = C(t.from).short;
        return t.verdict === 'bad' ? bi(...TX.record.madeAScandalOf(f, a, t)) : bi(...TX.record.spokeKindlyOfNight(f, a, t));
      }
    },
    quarrel: {
      chip: (t, a) => ['dimc', __text('quarrelledWithI')],
      saying: t => {
        const a = C(t.about).short;
        return bi(...TX.record.andQuarrelledAtBreakfast(a, t));
      }
    },
    feast: {
      chip: (t, a) => ['dimc', bi(...TX.record.satWithAtThe(t, a))],
      saying: t => {
        const a = C(t.about).short;
        return bi(...TX.record.andSatTogetherAt(a, t));
      }
    },
    witness: {
      chip: (t, a, f, fr) =>
        ({
          sure: () => ['bad strong', __text('sawNearTheScene')],
          fairly: () => ['bad', bi(...TX.record.isAllButSure(f, t, a, fr))],
          unsure: () => ['dimc', bi(...TX.record.thinksSawNearThe(f, t, a, fr))]
        })[t.verdict](),
      weigh: t => RULES.verdict.witness[t.verdict]
    }
  };
  function addTrace(o) {
    emit('clue');
    const own = C(o.owner).traits[o.cat],
      smudged = chance(RULES.examine.smudge),
      cl = { id: S.clues.length, day: S.day, ...o, val: smudged ? pick(Object.keys(TRAITS[o.cat].vals).filter(v => v !== own)) : own };
    if (smudged) cl.smudged = own;
    S.clues.push(cl);
    return cl;
  }
  const ruledOut = cl => cl.status === 'thief' || cl.status === 'stray' || cl.status === 'planted';
  const STATUS = {
    genuine: { chip: () => `<span class="chip bad">${__text('genuine')}</span>` },
    thief: { chip: () => `<span class="chip">${__text('aThiefS')}</span>`, why: () => __text('aThiefSTrace') },
    stray: { chip: () => `<span class="chip">${__text('leftEarlier')}</span>`, why: () => __text('leftThereEarlier') },
    planted: { chip: () => `<span class="chip warnc">${__text('planted')}</span>`, why: () => __text('aPlantedTrace') },
    unverified: { chip: () => `<span class="chip dimc">${__text('unverified')}</span>` }
  };
  const addAccount = rec => S.claims.push(rec),
    addSighting = rec => S.sights.push(rec);
  function caseAgainst(x) {
    const VR = RULES.verdict;
    let s =
      VR.sight * sightedAs(x).length + VR.lie * belied(x).length + VR.there * S.claims.filter(cl => cl.id === x.id && wasThere(cl)).length;
    S.clues.forEach(cl => {
      if (ruledOut(cl) || x.known[cl.cat] !== cl.val) return;
      s += cl.source === 'spite' ? VR.spite : cl.status === 'genuine' ? VR.genuine : VR.trace;
    });
    S.testimony
      .filter(t => t.about === x.id && !discredited(t))
      .forEach(t => {
        const w = KINDS[t.kind] && KINDS[t.kind].weigh && KINDS[t.kind].weigh(t);
        if (w != null) s += w;
      });
    return Math.max(0, Math.min(VR.caseCap, s));
  }
  const wasThere = cl => !cl.attacked && cl.loc !== 'camp' && !!S.nights[cl.night] && cl.loc === S.nights[cl.night].crimeLoc;
  const sightedAs = x => S.sights.filter(sg => sg.id !== x.id && x.known[sg.cat] === sg.val);
  function discredited(t) {
    const c = S.chars[t.from];
    return !!c && ((c.role === 'cult' && c.status === 'exposed') || (t.kind === 'vision' && claimOf(c).role !== 'seer'));
  }
  const belied = x =>
    S.claims.filter(cl => {
      if (cl.id !== x.id || !cl.with) return false;
      const o = S.claims.find(k => k.night === cl.night && k.id === cl.with);
      return o && o.loc !== 'evade' && o.with !== x.id;
    });
  function journal(t) {
    S.journal.push({ day: S.day, t: t });
  }
  return {
    testify: testify,
    about: about,
    kind: k => KINDS[k],
    addTrace: addTrace,
    ruledOut: ruledOut,
    status: k => STATUS[k],
    addAccount: addAccount,
    addSighting: addSighting,
    caseAgainst: caseAgainst,
    wasThere: wasThere,
    belied: belied,
    journal: journal
  };
})();
