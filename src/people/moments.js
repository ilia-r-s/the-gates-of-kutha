// Public moments: who hears, reacts and remembers.
const Moments = (() => {
  function hear(hearers, react, { cap: cap = Infinity, rollWhenFull: rollWhenFull = true, args: args = () => [] } = {}) {
    const moved = [],
      steps = [];
    hearers.forEach(h => {
      const rs = react(h);
      (rs && Array.isArray(rs[0]) ? rs : [rs]).forEach(r => {
        if (!r) return;
        const [what, whom, d, chanceOf] = r,
          same = () => moved.filter(x => x[0] === what && x[1] === whom && x[2] === d),
          full = () => same().reduce((n, x) => n + x[3].length, 0) >= cap;
        if (!rollWhenFull && full()) return;
        if (chanceOf && !chanceOf.roll(...args(h), ...r.slice(4))) return;
        if (rollWhenFull && full()) return;
        if (!(what === 'trust' ? Ties.moveTrust(h, d) : what === 'like' ? Ties.shiftLike(h.id, whom, d) : Suspicion.move(h.id, whom, d)))
          return;
        const lvl = what === 'sus' ? Suspicion.level(h.id, whom) : null,
          g = same().find(x => x[4] === lvl);
        if (g) g[3].push(h.id);
        else moved.push([what, whom, d, [h.id], lvl]);
        steps.push([h.id, what, whom, d]);
      });
    });
    return { moved: moved, steps: steps };
  }
  function deal() {
    S.stirs = [];
  }
  const record = () => S.stirs || [],
    last = () => S.stirs[S.stirs.length - 1];
  function stir(kind, o) {
    const K = ROWS[kind],
      pr = RULES.camp[kind],
      cap = RULES.camp.cap;
    const sp = K.speaker ? K.speaker(o, pr) : null;
    const look = shuffle(
      freeChars().filter(c => c.id !== o.about && c.id !== o.by && (!sp || c.id !== sp.id) && (!o.only || o.only.includes(c.id)))
    );
    if (sp && K.spoke) K.spoke(sp, o, pr);
    const { moved: moved } = hear(look, l => K.react(l, o, pr, K.odds), { cap: cap, args: l => [l, o, pr] });
    const after = K.after ? K.after(o, pr) : null;
    const r = { day: S.day, kind: kind, by: o.by || (sp && sp.id) || null, about: o.about || null, spoke: !!sp, moved: moved };
    if (after) r.after = after;
    if (K.keep) Object.assign(r, K.keep(o));
    S.stirs.push(r);
    return (K.open && !o.told ? K.open(sp, o, r) : '') + stirNote(r, !!K.quiet || !sp);
  }
  const told = r => ROWS[r.kind].told(r.by && C(r.by), C(r.about), r);
  function stirNote(r, quiet) {
    const lines = r.moved.map(([what, whom, d, ids, lvl]) => {
      if (what === 'trust') return d < 0 ? trustNote([], ids) : trustNote(ids, []);
      const [en, rus] = movedSaid(what, ids, whom, d, lvl);
      return `<p class="stir">${bi(`${nameList(ids)} ${en}`, `${nameListRu(ids)} ${rus}`)}</p>`;
    });
    if (r.after) lines.push(`<p class="stir">${r.after}</p>`);
    if (!lines.length && !quiet) lines.push(`<p class="stir">${__text('nobodyElseTakesItUp')}</p>`);
    return lines.join('');
  }
  function susSay(ids, w, d, lvl) {
    const L = RULES.suspects,
      many = ids.length > 1,
      v = (one, more) => (many ? more : one),
      g = (m, f, pl) => (many ? pl : ru.gs(C(ids[0]), m, f));
    if (d > 0)
      return lvl >= L.sure ? TX.moments.allButSureIt(v, w, g) : lvl >= L.earnest ? TX.moments.now(v, w) : TX.moments.toWonderAbout(v, w);
    return lvl >= L.earnest
      ? TX.moments.lessSureItIs(v, w, g)
      : lvl === L.wonder
        ? TX.moments.noLongerInEarnest(v, w)
        : TX.moments.noLongerAtAll(v, w);
  }
  const movedSaid = (what, ids, whom, d, lvl) => (what === 'like' ? likeSay(ids, C(whom), d) : susSay(ids, C(whom), d, lvl));
  function likeSay(ids, w, d) {
    const many = ids.length > 1;
    return d < 0 ? TX.moments.theLessOfNow(many, w) : TX.moments.theBetterOfNow(many, w);
  }
  function eitherWay(on, what, whom, down, up, d) {
    const dn = Math.max(0, down),
      u = Math.max(0, up),
      t = dn + u;
    return [what, whom, !t ? d : !u ? -1 : !dn ? 1 : chance(dn / t) ? -1 : 1, on, t];
  }
  const ofPair = (l, x) => Ties.likes(l.id, x);
  const isSusp = l => temperOf(l) === 'suspicious';
  const fondest = (pool, x) =>
    pool.length ? C(wpick(Object.fromEntries(pool.map(c => [c.id, ofPair(c, x) ** 2 || RULES.camp.fondestLeast])))) : null;
  const spokeStep = (sp, d) => chance(RULES.camp.spoke) && Ties.moveTrust(sp, d);
  const TAIL = [
    ['floor', () => RULES.scale.rarest],
    ['* a heavy moment', (l, o) => (o.heavy ? RULES.camp.heavy : 1)],
    ['cap', () => RULES.scale.most]
  ];
  const moment = (name, steps) => odds(name, steps.concat(TAIL));
  const FOND = ['+ fond of them', (l, o, pr) => (Ties.fond(l, o.about) ? pr.friend : 0)],
    NOT_FOND = ['- fond of them', (l, o, pr) => (Ties.fond(l, o.about) ? pr.friend : 0)],
    DISLIKES = ['+ dislikes them', (l, o, pr) => (Ties.dislikes(l, o.about) ? pr.dislike : 0)],
    SUSPICIOUS = ['+ suspicious by temperament', (l, o, pr) => (isSusp(l) ? pr.suspicious : 0)],
    BELIEVES = ['+ fond of the one who spoke', (l, o, pr) => (Ties.fond(l, o.by) ? pr.believe : 0)],
    CREDIT = ['+ what the one who spoke has been proven', (l, o, pr) => pr.credit * Suspicion.credit(o.by)],
    LOYAL = ['- your friend', (l, o, pr) => (Ties.friend(l) ? pr.loyal : 0)];
  const ROWS = {
    complained: {
      odds: {
        sides: moment('complained: thinks the less of you', [
          ['base', (l, o, pr) => pr.p],
          ['+ hounded too', (l, o, pr) => (Ties.hounded(l) >= pr.from ? pr.hounded : 0)],
          ['+ fond of the one complaining', (l, o, pr) => (Ties.fond(l, o.by) ? pr.friend : 0)],
          ['- your friend', (l, o, pr) => (Ties.friend(l) ? pr.loyal : 0)]
        ])
      },
      react: (l, o, pr, on) => ['trust', null, -1, on.sides],
      quiet: true,
      open: (sp, o) => {
        const c = C(o.by),
          k = sayPick([0, 1, 2]),
          line = TX.moments.whereWereYouWhom(c)[k];
        return `<p class="notice">${bi(...TX.moments.overBreakfastSaysTo(c, line))}</p>`;
      },
      told: b => TX.moments.complainedBeforeEveryoneThat(b)
    },
    calledOut: {
      speaker: (o, pr) => {
        const pool = freeChars().filter(c => c.id !== o.about),
          friend = fondest(
            pool.filter(c => Ties.fond(c, o.about)),
            o.about
          );
        const sp = friend || pick(pool.filter(c => temperOf(c) === 'honest' || isSusp(c)));
        return sp && chance(pr.odds) ? sp : null;
      },
      spoke: sp => spokeStep(sp, -1),
      odds: {
        defends: moment('called out: had suspected them, and stands by you', [['base', (l, o, pr) => pr.defend]]),
        cools: moment('called out: cools to you', [
          ['base', (l, o, pr) => pr.p],
          FOND,
          SUSPICIOUS,
          LOYAL,
          ['- had only begun to wonder about them', (l, o, pr) => (Suspicion.onlyWonders(l.id, o.about) ? pr.suspected : 0)],
          ['- only a thief', (l, o, pr) => (o.thief ? pr.thief : 0)]
        ])
      },
      react: (l, o, pr, on) => (Suspicion.earnest(l.id, o.about) ? ['trust', null, 1, on.defends] : ['trust', null, -1, on.cools]),
      open: (sp, o) => {
        const a = C(o.about);
        if (!sp) return `<p class="notice">${bi(...TX.moments.asIsLedAway(a))}</p>`;
        const k = sayPick(o.thief ? [3] : [0, 1, 2]),
          line = TX.moments.youHaveRuinedFor(a)[k];
        return `<p class="notice">${bi(...TX.moments.asIsLedAway2(a, sp, line))}</p>`;
      },
      told: (b, a) => (b ? TX.moments.calledYouOutOver(b, a) : TX.moments.silenceWhenWasSent(a))
    },
    praised: {
      speaker: (o, pr) => {
        const pool = freeChars().filter(c => c.id !== o.about);
        const sp =
          pick(pool.filter(c => Suspicion.wonders(c.id, o.about) || Ties.dislikes(c, o.about))) ||
          pick(pool.filter(c => Ties.cordial(c) && !Ties.fond(c, o.about)));
        return sp && chance(pr.odds) ? sp : null;
      },
      spoke: sp => spokeStep(sp, 1),
      odds: {
        grudge: moment('praised: a friend of theirs holds it against you', [['base', (l, o, pr) => pr.grudge]]),
        warms: moment('praised: warms to you', [
          ['base', (l, o, pr) => pr.p],
          ['+ had doubted them', (l, o, pr) => (Suspicion.wonders(l.id, o.about) || Ties.dislikes(l, o.about) ? pr.doubted : 0)]
        ])
      },
      react: (l, o, pr, on) =>
        Ties.fond(l, o.about) ? ((o.backed || []).includes(l.id) ? null : ['trust', null, -1, on.grudge]) : ['trust', null, 1, on.warms],
      open: (sp, o) => {
        const a = C(o.about);
        if (!sp) return `<p class="notice">${bi(...TX.moments.whenTheLorryHas())}</p>`;
        const k = sayPick([0, 1]),
          line = TX.moments.youWereRightAbout(a, sp)[k];
        return `<p class="notice">${bi(...TX.moments.whenTheLorryHas2(sp, line))}</p>`;
      },
      told: (b, a) => (b ? TX.moments.praisedYouForUnmasking(b, a) : __text('unmasked'))
    },
    grief: {
      speaker: (o, pr) => {
        const friend = fondest(
          freeChars().filter(c => Ties.fond(c, o.about)),
          o.about
        );
        return friend && chance(pr.odds) ? friend : null;
      },
      spoke: (sp, o, pr) => {
        o.bitter = chance(clamp(pr.bitter - pr.trusting * sp.rapport));
        if (o.bitter) Ties.moveTrust(sp, -1);
      },
      odds: {
        cools: moment('grief: cools to you', [
          ['base', (l, o, pr) => pr.p],
          FOND,
          ['+ the days gone', (l, o, pr) => pr.late * (S.day - 1)],
          ['+ you had confided in the dead', (l, o, pr) => (Ties.confidedIn(o.about) ? pr.confided : 0)],
          ['- you have unmasked one of it', (l, o, pr) => (S.stats.right ? pr.progress : 0)],
          LOYAL
        ])
      },
      react: (l, o, pr, on) => ['trust', null, -1, on.cools],
      quiet: true,
      open: (sp, o, r) => {
        const v = C(o.about);
        if (!sp) return r.moved.length ? `<p class="notice">${bi(...TX.moments.theCampMournsAnd(v))}</p>` : '';
        const k = sayPick([0, 1]),
          line = (o.bitter ? TX.moments.isDeadAndThe(v) : TX.moments.findWhoeverDidThis())[k];
        return `<p class="notice">${bi(...TX.moments.hasNotTouchedBreakfast(sp, line))}</p>`;
      },
      told: (b, a) => (b ? TX.moments.grievedAloudFor(b, a) : __text('theCampMournedA'))
    },
    sleptWatch: {
      odds: { eyes: moment('slept on a watch: eyes them', [['base', (l, o, pr) => pr.p], DISLIKES, NOT_FOND, SUSPICIOUS]) },
      react: (l, o, pr, on) => ['sus', o.about, 1, on.eyes],
      quiet: true,
      open: (sp, o) => {
        const a = C(o.about);
        return `<p class="notice">${o.how === 'deny' ? bi(...TX.moments.byBreakfastTheWhole(a)) : bi(...TX.moments.byBreakfastTheWhole2(a))}</p>`;
      },
      told: (b, a) => TX.moments.sleptThroughASworn(a)
    },
    dreamt: {
      odds: {
        back: moment('a dream aloud: suspects the dreamer instead', [
          ['base', (l, o, pr) => pr.back],
          FOND,
          SUSPICIOUS,
          ['+ it only answers one that named the dreamer', (l, o, pr) => (o.answer ? pr.answer[o.answer.first ? 0 : 1] : 0)]
        ]),
        believes: moment('a dream aloud: suspects the one named', [
          ['base', (l, o, pr) => pr.p],
          BELIEVES,
          CREDIT,
          DISLIKES,
          ['- had begun to wonder about the dreamer', (l, o, pr) => (Suspicion.onlyWonders(l.id, o.by) ? pr.doubt : 0)]
        ])
      },
      react: (l, o, pr, on) =>
        Ties.fond(l, o.about) || Suspicion.earnest(l.id, o.by) || (o.answer && !Ties.fond(l, o.by))
          ? ['sus', o.by, 1, on.back]
          : ['sus', o.about, 1, on.believes],
      after: (o, pr) => resent(o.about, o.by, pr.resent),
      quiet: true,
      told: (b, a) => TX.moments.dreamtGuiltyBeforeEveryone(b, a)
    },
    dreamtClean: {
      odds: { thinksAgain: moment('a clean dream aloud: thinks again', [['base', (l, o, pr) => pr.p], BELIEVES, CREDIT]) },
      react: (l, o, pr, on) => (Suspicion.wonders(l.id, o.about) ? ['sus', o.about, -1, on.thinksAgain] : null),
      quiet: true,
      told: (b, a) => TX.moments.dreamtCleanBeforeEveryone(b, a)
    },
    blame: {
      odds: {
        back: moment('a blame aloud: suspects the one who said it', [['base', (l, o, pr) => pr.back]]),
        believes: moment('a blame aloud: suspects the one named', [['base', (l, o, pr) => pr.p], DISLIKES, BELIEVES, CREDIT])
      },
      react: (l, o, pr, on) => (Ties.fond(l, o.about) ? ['sus', o.by, 1, on.back] : ['sus', o.about, 1, on.believes]),
      after: (o, pr) => resent(o.about, o.by, pr.resent),
      quiet: true,
      told: (b, a) => __text('blamedAloudA')
    },
    song: {
      odds: {
        friend: moment('the song: a friend of theirs eyes them, hardly ever', [['base', () => 0]]),
        eyes: moment('the song: eyes them', [['base', (l, o, pr) => pr.p], DISLIKES, SUSPICIOUS])
      },
      react: (l, o, pr, on) => ['sus', o.about, 1, Ties.fond(l, o.about) ? on.friend : on.eyes],
      quiet: true,
      told: (b, a) => __text('theDiggersSangOfA')
    },
    confessed: {
      odds: {
        respect: moment('came clean: a friend thinks the better of them', [['base', (l, o, pr) => pr.respect]]),
        liar: moment('came clean: sees a liar', [['base', (l, o, pr) => pr.liar], SUSPICIOUS])
      },
      react: (l, o, pr, on) =>
        Ties.fond(l, o.about) ? (Suspicion.wonders(l.id, o.about) ? ['sus', o.about, -1, on.respect] : null) : ['sus', o.about, 1, on.liar],
      quiet: true,
      told: (b, a) => __text('cameCleanBeforeEveryone')
    },
    onto: {
      speaker: (o, pr) => {
        const pool = freeChars().filter(c => c.id !== o.about);
        return pool.length ? C(wpick(Object.fromEntries(pool.map(c => [c.id, 1 + Suspicion.level(c.id, o.about)])))) : null;
      },
      spoke: (sp, o) => {
        o.by = sp.id;
        o.heavy = weighty('talk');
        blame('dead', sp.id, o.about);
      },
      odds: {
        back: moment('the dead had named them: suspects the one who says so', [['base', (l, o, pr) => pr.back]]),
        eyes: moment('the dead had named them: eyes them', [['base', (l, o, pr) => pr.p], DISLIKES, SUSPICIOUS])
      },
      react: (l, o, pr, on) => (!o.by ? null : Ties.fond(l, o.about) ? ['sus', o.by, 1, on.back] : ['sus', o.about, 1, on.eyes]),
      after: o => (o.by ? resent(o.about, o.by, RULES.camp.blame.resent) : null),
      open: (sp, o) => {
        if (!sp) return '';
        const a = C(o.about),
          d = C(o.dead);
        return `<p class="notice">${bi(...TX.moments.saysWhatHalfThe(sp, d, a))}</p>`;
      },
      quiet: true,
      told: (b, a) => (b ? TX.moments.saidAloudThatThe(b, a) : TX.moments.theCampRememberedThat(a))
    },
    planted: {
      odds: {
        eyes: moment('a trace by a tent: eyes the one whose habit it is', [['base', (l, o, pr) => pr.p], DISLIKES, SUSPICIOUS])
      },
      react: (l, o, pr, on) => (Ties.fond(l, o.about) ? null : ['sus', o.about, 1, on.eyes]),
      open: (sp, o) => {
        const a = C(o.at);
        return `<p class="notice">${bi(...TX.moments.byTentTheCamp(a, o))}</p>`;
      },
      quiet: true,
      told: (b, a) => TX.moments.aTraceOfFound(a)
    },
    kept: {
      odds: { thinksAgain: moment('a watch kept: thinks again', [['base', (l, o, pr) => pr.p]]) },
      react: (l, o, pr, on) => (Suspicion.wonders(l.id, o.about) ? ['sus', o.about, -1, on.thinksAgain] : null),
      quiet: true,
      told: (b, a) => TX.moments.claimedToHaveSeen(a)
    },
    proven: {
      odds: { thinksAgain: moment('proven right: thinks again of the one who said it', [['base', (l, o, pr) => pr.clear]]) },
      react: (l, o, pr, on) => (Suspicion.wonders(l.id, o.by) ? ['sus', o.by, -1, on.thinksAgain] : null),
      open: (sp, o) => {
        const b = C(o.by),
          a = C(o.about);
        const so = a.status === 'taken' ? TX.moments.theCampTakesDeath(a, b) : __text('wasRight');
        return o.verdict === 'cult'
          ? `<p class="notice">${bi(...TX.moments.saidItBeforeEveryone(b, o, a, so))}</p>`
          : `<p class="notice">${bi(...TX.moments.saidBeforeEveryoneOn(b, o, a, so))}</p>`;
      },
      quiet: true,
      told: (b, a) => (a.status === 'taken' ? TX.moments.theCampTookDeath(a, b) : TX.moments.wasProvenRightAbout(b, a))
    },
    scandal: {
      odds: {
        her: moment('a night in your tent, told: what they think of her', [['base', (l, o, pr, t) => t]]),
        you: moment('a night in your tent, told: their trust in you', [['base', (l, o, pr, t) => t]])
      },
      react: (l, o, pr, on) => {
        const v = S.log.visit,
          heard = (v.heard = v.heard || []);
        if (heard.includes(l.id)) return null;
        heard.push(l.id);
        const h = o.about,
          lh = ofPair(l, h),
          ls = ofPair(l, o.by),
          hi = Ties.pastBetween(l.id, h),
          prude = TP(l).prude + (Ties.vowed(l) ? pr.vows : 0),
          easy = pr.easy * Math.max(0, -prude),
          believe = pr.believe * ls + pr.credit * Suspicion.credit(o.by),
          past = pr.quarrel * hi.quarrels + pr.suspect * hi.suspects + (hi.accused || hi.accusedBy ? pr.named : 0) - pr.feast * hi.feasts,
          jealous = Ties.sweetOnYou(l) || Ties.sweetOn(l.id, h) ? pr.jealous : 0;
        const her = o.bad
            ? eitherWay(
                on.her,
                'like',
                h,
                pr.cool + believe + prude + past + pr.dislike * Math.max(0, -lh) - pr.friend * Math.max(0, lh),
                pr.rally * Math.max(0, lh) + pr.spurn * Math.max(0, -ls) + easy,
                -1
              )
            : eitherWay(
                on.her,
                'like',
                h,
                pr.coolKind + prude + past + pr.dislike * Math.max(0, -lh),
                pr.warm + believe + pr.friend * Math.max(0, lh) + easy,
                1
              ),
          you = eitherWay(
            on.you,
            'trust',
            null,
            (o.bad ? pr.youCool + believe : pr.youCoolKind) + prude + jealous - pr.loyal * Math.max(0, l.rapport - 1),
            pr.youWarm + easy + (o.bad ? pr.spurn * Math.max(0, -ls) : pr.glad * Math.max(0, lh)),
            o.bad ? -1 : 1
          );
        return [her, you];
      },
      after: (o, pr) => {
        if (!o.before) return null;
        const h = C(o.about),
          s = C(o.by);
        if (!isFree(h) || !isFree(s)) return null;
        if (!o.bad) return chance(pr.thanks) && Ties.shiftLike(h.id, s.id, 1) ? bi(...TX.moments.givesAGratefulLook(h, s)) : null;
        S.log.visit.shamed = S.day;
        return chance(pr.hurt) && Ties.shiftLike(h.id, s.id, -1) ? bi(...TX.moments.willNotLookAt(h, s)) : null;
      },
      keep: o => ({ bad: !!o.bad, to: o.only ? o.only[0] : null }),
      quiet: true,
      told: (b, a, r) =>
        r.bad
          ? r.to
            ? TX.moments.madeAScandalOf(b, a, r)
            : TX.moments.madeAScandalOf2(b, a)
          : r.to
            ? TX.moments.spokeKindlyOfNight(b, a, r)
            : TX.moments.spokeKindlyOfNight2(b, a)
    },
    disproven: {
      odds: {
        eyes: moment('proven wrong: suspects the one who said it', [
          ['base', (l, o, pr) => pr.p],
          ['+ fond of the one wronged', (l, o, pr) => (Ties.fond(l, o.about) && o.verdict === 'cult' ? pr.friend : 0)]
        ])
      },
      react: (l, o, pr, on) => ['sus', o.by, 1, on.eyes],
      open: (sp, o) => {
        const b = C(o.by),
          a = C(o.about);
        if (o.verdict !== 'cult') return `<p class="notice">${bi(...TX.moments.onDayHadSworn(o, b, a))}</p>`;
        return a.status === 'taken'
          ? `<p class="notice">${bi(...TX.moments.isDeadAndOn(a, o, b))}</p>`
          : `<p class="notice">${bi(...TX.moments.onDayHadCalled(o, b, a))}</p>`;
      },
      quiet: true,
      told: (b, a) => (a.status === 'taken' ? TX.moments.theCampTookDeath2(a, b) : TX.moments.wasProvenWrongAbout(b, a))
    }
  };
  function voteProven(ids, a, o, right) {
    const b = C(ids[0]),
      many = ids.length > 1,
      n = nameList(ids),
      nr = nameListRu(ids),
      when = o.day === S.day ? '' : ` on day ${o.day}`,
      whenRu = o.day === S.day ? '' : __text('text');
    const did = o.verdict === 'cult' ? TX.moments.raisedAgainst(n, many, a, when, nr, b, whenRu) : __text('spokeUpForA');
    const they = many ? __text('theyWereRight') : __text('wasRight2');
    const then =
      a.status === 'taken'
        ? right
          ? TX.moments.theCampTakesDeath2(a, they)
          : __text('nowIsDead')
        : right
          ? __text('text2')
          : o.verdict === 'cult'
            ? a.role === 'smuggler'
              ? __text('wasNoCultist')
              : __text('wasInnocent')
            : __text('wasOneOfThem');
    return `<p class="notice">${bi(`${did[0]} ${then[0]}`, `${did[1]} ${then[1]}`)}</p>`;
  }
  function resent(who, of, p) {
    const c = C(who),
      by = C(of);
    if (!isFree(c) || !chance(p)) return null;
    const sus = Suspicion.move(c.id, by.id, 1),
      like = Ties.shiftLike(c.id, by.id, -1);
    return sus || like ? bi(...TX.moments.willNotLookAt2(c, by)) : null;
  }
  function settle(id, guilty = C(id).role === 'cult') {
    const a = C(id),
      all = Suspicion.settle(id, guilty);
    const hands = x => x.how === 'vote',
      here = all.filter(({ x: x }) => isFree(C(x.by))).sort((p, q) => p.right - q.right || hands(q.x) - hands(p.x) || p.x.day - q.x.day);
    const handsTold = new Set();
    let h = '';
    here.forEach(({ x: x, right: right }) => {
      const k = `${x.verdict}:${x.day}`;
      if (hands(x) && !handsTold.has(k)) {
        handsTold.add(k);
        h += voteProven(
          here.filter(y => hands(y.x) && `${y.x.verdict}:${y.x.day}` === k).map(y => y.x.by),
          a,
          x,
          right
        );
      }
      h += stir(right ? 'proven' : 'disproven', { by: x.by, about: id, verdict: x.verdict, day: x.day, how: x.how, told: hands(x) });
    });
    return h;
  }
  function dreamAloud(by, about, guilty, answer = null, veil = null) {
    Suspicion.sayAloud(by, about, veil ? 'veiled' : guilty ? 'cult' : 'clean', 'dream');
    return veil ? '' : stir(guilty ? 'dreamt' : 'dreamtClean', { by: by, about: about, answer: answer });
  }
  const BLAMES = { breakfast: { moment: true }, retort: { moment: true }, dead: { moment: false } };
  function blame(kind, by, about, say = () => '') {
    const how = BLAMES[kind],
      heavy = how.moment && weighty('talk');
    stirred('talk');
    Suspicion.blame(by, about);
    const words = say();
    return words + (how.moment ? stir('blame', { by: by, about: about, heavy: heavy }) : '');
  }
  return {
    deal: deal,
    record: record,
    last: last,
    stir: stir,
    hear: hear,
    settle: settle,
    dreamAloud: dreamAloud,
    blame: blame,
    told: told,
    movedSaid: movedSaid
  };
})();
