// game/debrief.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function endFactors(id, r, haunt, won) {
  const F = [],
    f = S.fin;
  const x = {
    id: id,
    r: r,
    haunt: haunt,
    won: won,
    f: f,
    L: S.log,
    ward: S.wardOf[S.patron],
    G: GODS[S.patron].name,
    cultBelow:
      f &&
      !f.empty &&
      id !== 'emptied' &&
      (f.acts.length > 0 || ['sealed', 'banished', 'shot', 'burned', 'scarred'].includes(id) || id.indexOf('doom') === 0),
    add: (k, en, rus) => x.raw(k, bi(en, rus)),
    raw: (k, html) =>
      F.push(
        `<li class="${{ p: 'fx-plus', m: 'fx-minus', n: 'fx-note' }[k]}"><span class="fx-sign" aria-hidden="true">${k === 'p' ? '+' : k === 'm' ? '−' : '•'}</span><span>${html}</span></li>`
      )
  };
  [
    fxWayDown,
    fxCompany,
    fxTreachery,
    fxSeventhGate,
    fxBelow,
    fxSanctum,
    fxWard,
    fxCult,
    fxVerdict,
    fxCunning,
    fxSlips,
    fxMisfortune,
    fxSpite,
    fxFalseDreamer,
    fxDreamer,
    fxYourDreams,
    fxWatcher,
    fxThief,
    fxClaims,
    fxCamp,
    fxVictims,
    fxNights,
    fxDeed,
    fxVisit,
    fxNotebook,
    fxYourself,
    fxSeason
  ].forEach(step => step(x));
  return `<ul class="factors">${F.join('')}</ul>`;
}
const fxHier = c => (c.id === S.hierophant ? __text('wasTheHierophant') : ['', '']);
function fxWayDown({ f: f, r: r, G: G, add: add }) {
  if (!f) return;
  const fem = ru.gf(S.patron);
  if (f.why === 'priestless') add('n', ...TX.debrief.theRiteHadCome());
  else if (f.early) add('m', ...TX.debrief.theRiteOutranYou());
  if (!f.named) add('n', ...TX.debrief.youWentDownWithout());
  else if (r.namedOk) add('p', ...TX.debrief.youNamedBeforeYou(G));
  else add('m', ...TX.debrief.youNamedItWas(f, G, fem));
}
function fxCompany({ f: f, add: add }) {
  if (!f) return;
  const went = f.took || [];
  (f.offered || [])
    .filter(x => went.includes(x))
    .forEach(x => {
      const c = C(x);
      add(
        c.role === 'cult' ? 'm' : 'p',
        `${c.name} offered to come down with you before you asked${c.role === 'cult' ? ', and you let ' + EP.him(c) : ''}.`,
        __text('cult')
      );
    });
  if (!went.length) add('n', 'You went down alone.', __text('text2'));
  else add(went.every(x => C(x).role !== 'cult') ? 'p' : 'n', `${endNames(went)} went down with you.`, __text('text3'));
}
function fxTreachery({ f: f, r: r, add: add }) {
  if (!f) return;
  r.gate.forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add('p', ...TX.debrief.atTheFourthGate(c, h));
  });
  f.betrayed.forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add('m', ...TX.debrief.putAKnifeIn(c, h));
  });
  (f.turned || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add('m', ...TX.debrief.walkedDownBesideYou(c, h));
  });
  (f.cameBack || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add('m', ...TX.debrief.wasLeftBehindOn(c, h));
  });
  (f.heldBack || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    if ((f.stayedAway || []).includes(x)) add('p', ...TX.debrief.wasLeftBehindOn2(c, h));
    else add('p', ...TX.debrief.walkedDownBesideYou2(c, h));
  });
  if (f.stolen) add('m', ...TX.debrief.theTrueWardTaken(f));
  if (f.feint) add('n', ...TX.debrief.takenFromYouOn(f));
}
function fxSeventhGate({ f: f, ward: ward, add: add }) {
  if (!f) return;
  const g3 = f.g3;
  if (g3 && g3.kind === 'item') {
    if (g3.it === ward) add('m', ...TX.debrief.youLeftTheTrue(g3));
    else add('n', ...TX.debrief.youPaidTheSeventh(g3));
  }
  if (g3 && g3.kind === 'comp') {
    const c = C(g3.id);
    if (c.role === 'cult') add('m', ...TX.debrief.youAskedToHold(c));
    else if (g3.followed) add('n', ...TX.debrief.youAskedToHold2(c));
    else add('n', ...TX.debrief.stayedBehindToHold(c));
  }
  if (g3 && g3.kind === 'self') add('m', ...TX.debrief.youPaidTheSeventh2());
}
function fxBelow({ f: f, add: add }) {
  if (!f) return;
  (f.enc || []).forEach(e => {
    const n = GATE_N[e.gate];
    add(e.sign, `At the ${n.en} gate ${e.said[0]}.`, __text('text17'));
  });
}
function fxSanctum({ f: f, ward: ward, G: G, cultBelow: cultBelow, add: add }) {
  if (!f) return;
  f.acts.forEach(a => {
    if (a.kind === 'ward') {
      const it = a.it,
        g = S.godOfWard[it],
        A = ru.item(it, 'a');
      if (a.ok && g === S.patron) add('p', ...TX.debrief.youRaisedTheTrue(it, A));
      else if (a.ok) add('p', ...TX.debrief.youRaisedWhichNever(it, G, A));
      else if (g === S.patron) add('m', ...TX.debrief.youRaisedTheTrue2(it, A));
      else if (!g) add('m', ...TX.debrief.youRaisedNothingAt(it, A));
      else add('m', ...TX.debrief.youRaisedMadeAgainst(it, g, A));
    } else if (a.kind === 'rite') {
      if (a.ok && a.g !== S.patron) add('p', ...TX.debrief.youSpokeTheCounter(a, G));
      else if (a.ok) add('p', ...TX.debrief.youSpokeTheCounter2(G));
      else if (a.g === S.patron) add('m', ...TX.debrief.youSpokeTheCounter3(G));
      else add('m', ...TX.debrief.youSpokeTheCounter4(a));
    } else if (a.kind === 'shoot') {
      const c = C(a.id),
        h = fxHier(c);
      add(a.ok ? 'p' : 'm', ...TX.debrief.youShotAndThe(a, c, h));
    } else if (a.kind === 'none') add('n', ...TX.debrief.youHadNothingLeft());
    else add(a.ok ? 'p' : 'm', ...TX.debrief.youSetTheBitumen(a));
  });
  if (cultBelow && has(ward) && !f.acts.some(a => a.kind === 'ward' && a.it === ward)) add('m', ...TX.debrief.youCarriedTheTrue(ward));
}
function fxWard({ f: f, ward: ward, G: G, cultBelow: cultBelow, add: add }) {
  if (!S.log.charms.includes(ward)) add(cultBelow ? 'm' : 'n', ...TX.debrief.youNeverFoundThe(ward, G));
  else if (!f) add('n', ...TX.debrief.youHadFoundThe(ward, G));
}
function fxCult({ f: f, r: r, add: add }) {
  r.inq.forEach(a => {
    const c = C(a.id),
      h = fxHier(c);
    add('p', ...TX.debrief.youExposedAtThe(c, a, h));
  });
  const shotDead = f && f.acts.find(a => a.kind === 'shoot' && a.ok);
  r.cult
    .filter(
      x =>
        C(x).status === 'present' &&
        !(shotDead && shotDead.id === x) &&
        !(f && (f.betrayed.includes(x) || (f.turned || []).includes(x) || (f.cameBack || []).includes(x)))
    )
    .forEach(x => {
      const c = C(x);
      add('m', ...TX.debrief.wasNeverUnmasked(c, x));
    });
  r.wrong.forEach(a => {
    const c = C(a.id),
      what = {
        seer: __text('whoDreamedTrue'),
        warden: __text('whoHadBeenKeepingWatchOver'),
        smuggler: __text('aThiefButOnlyAThief'),
        bystander: __text('whoWasExactlyWhatSeemed')
      }[c.role];
    add('m', ...TX.debrief.onDayYouAccused(a, c, what));
  });
}
function fxVerdict({ add: add }) {
  S.log.refusedInq.forEach(a => {
    const c = C(a.id);
    add(
      'm',
      `On day ${a.day} the camp would not send ${c.name} away on the case you made${c.role === 'cult' ? `, and ${c.p} was one of them` : ''}.`,
      __text('aCult')
    );
  });
  if (S.log.walkedOut) add('m', ...TX.debrief.afterTheInquiryOn());
  (S.inquiries || []).forEach(v => {
    const x = C(v.id);
    v.back
      .concat(v.against)
      .map(C)
      .filter(o => o.role === 'cult')
      .forEach(o => {
        const backed = v.back.includes(o.id);
        if (x.role !== 'cult' && backed) add('n', ...TX.debrief.onDaySidedWith(v, o, x));
        else if (x.role === 'cult') add('n', ...TX.debrief.onDaySidedWith2(backed, v, o, x));
      });
  });
}
function fxCunning({ add: add }) {
  S.clues
    .filter(cl => cl.source === 'plant' && !cl.extra && !cl.pair)
    .forEach(cl => {
      const o = C(cl.owner),
        by = C(cl.by),
        seen = cl.status === 'planted',
        [on, onRu] = onNight(cl.day).map(capS);
      add(seen ? 'p' : 'n', ...TX.debrief.laidTraceAtThe(on, by, o, seen, onRu));
    });
  S.log.keptWatch.forEach(k => {
    const c = C(k.id);
    add('n', ...TX.debrief.sworeToWatchYour(c, k));
  });
  S.testimony
    .filter(t => t.kind === 'blurt' && C(t.from).role === 'cult')
    .forEach(t => {
      const c = C(t.from);
      add('p', ...TX.debrief.onDayLetSlip(t, c));
    });
  S.nights.forEach((rec, n) => {
    const c = rec && C(rec.actor),
      said = c && S.claims.find(x => x.night === n && x.id === c.id),
      [on, onRu] = onNight(n).map(capS);
    if (said && Record.wasThere(said)) add('n', ...TX.debrief.ownedBeingOutRather(on, c, said, onRu));
  });
  betrayalLines().forEach(([en, rus]) => add('n', en, rus));
  S.log.bus.forEach(b => {
    const c = C(b.by),
      o = C(b.about);
    add('n', ...TX.debrief.onDayNamedThe(b, c, o));
  });
  const WHEN = TX.debrief.inTheMorning();
  S.words
    .filter(w => w.heard && (w.kind === 'claim' || (w.verdict === 'cult' && C(w.about).role === 'cult')))
    .forEach(w => {
      const by = C(w.by),
        o = C(w.about),
        what = w.kind === 'claim' ? __text('dreamtTrue') : __text('hadDreamtGuilty'),
        when = w.at ? [`${WHEN[w.slot][0]}, ${LOCS[w.at].at}`, `${WHEN[w.slot][1]}, ${R(LOCS[w.at].at)}`] : __text('beforeBreakfast'),
        knew = w.knew.map(C),
        after = [];
      const night = Object.keys(S.nights || {})
        .map(Number)
        .find(d => d >= w.heardDay && S.nights[d] && S.nights[d].target === by.id && S.nights[d].why && S.nights[d].why.aside);
      if (night) after.push(TX.debrief.onNightTheCult(night, by));
      const [en, rus] =
        w.how === 'overheard' ? TX.debrief.onDayToldYou(w, when, by, what, knew) : TX.debrief.onDayToldYou2(w, when, by, what);
      add('n', [en, ...after.map(a => a[0])].join(' '), [rus, ...after.map(a => a[1])].join(' '));
    });
  const WAY_SAID = {
    inquisitor: TX.debrief.thatYouWouldHave(),
    confidant: __text('thatYouTellEverythingToEveryone'),
    scholar: TX.debrief.thatYouReadThe(),
    delver: __text('thatYouDigForGoldNot'),
    sleuth: TX.debrief.thatOneOfYour()
  };
  (S.log.ways || []).forEach(w => {
    const s = C(w.by),
      what = WAY_SAID[w.k];
    add('n', ...TX.debrief.onDayTheCult(w, what, s));
  });
  S.log.doubts.forEach(w => add('n', ...TX.debrief.onDayTheCult(w, TX.debrief.doubtSaid(C(w.about), w.k), C(w.by))));
  S.plots.forEach(p => {
    const d = C(p.id),
      took = Object.values(S.nights || {}).some(r => r && r.target === p.id && r.why && r.why.later === p.day);
    if (p.kind === 'later' && p.done && !took) add('n', ...TX.debrief.meantLater(p, d));
    else if (p.kind === 'discredit' && p.done && !p.said) add('n', ...TX.debrief.meantDiscredit(p, d));
    else if (p.kind === 'frame') add('n', ...TX.debrief.meantFrame(p, d));
    else if (p.kind === 'letBe') add('n', ...TX.debrief.meantLetBe(p, d));
  });
  Object.entries(S.turned || {})
    .filter(([, t]) => t.day != null)
    .sort(([, a], [, b]) => a.day - b.day)
    .forEach(([k, t]) => {
      const [en, rus] = {
        sleuth: TX.debrief.youLivedAtThe(),
        inquisitor: TX.debrief.youCalledInquiryAfter(),
        confidant: TX.debrief.youLeanedOnYour(),
        scholar: TX.debrief.yourLampBurnedLate(),
        delver: TX.debrief.youDugWhereIt(),
        quiet: __text('youSatStillAndItGrew')
      }[k];
      add('n', ...TX.debrief.fromDayTheCult(t, en, rus));
    });
  S.log.staged.forEach(x => {
    const c = C(x.id),
      cult = c.role === 'cult';
    add('n', ...TX.debrief.onDayOwnedUp(x, c, cult));
  });
}
function fxSpite({ add: add }) {
  S.log.spite.forEach(x => {
    const c = C(x.id),
      him = EP.him(c);
    const s = x.seen ? C(x.seen) : null;
    add(x.ok ? 'm' : 'n', ...TX.debrief.onNightItWas(x, c, s, him));
  });
}
function fxSlips({ add: add }) {
  (S.log.slips || []).forEach(x => {
    const c = C(x.id),
      o = x.with && x.with !== 'you' ? C(x.with) : null,
      what = {
        cult: __text('theCult'),
        thief: __text('theTabletsThatWentToBaghdad'),
        romance: __text('nightsWithI'),
        unrequited: o ? TX.debrief.feelingsForWhoDid(c, o) : __text('feelingsForYou'),
        none: __text('onlyFear')
      }[x.secret];
    add(x.secret === 'cult' ? 'p' : 'n', ...TX.debrief.pressedOnDayLet(x, c, what));
  });
}
function fxMisfortune({ add: add }) {
  S.testimony
    .filter(t => t.kind === 'tip' && C(t.about).role !== 'smuggler')
    .forEach(t => {
      const c = C(t.from),
        o = C(t.about);
      add('n', ...TX.debrief.onDayToldYou3(t, c, o));
    });
  S.testimony
    .filter(t => t.kind === 'blurt' && C(t.from).role !== 'cult')
    .forEach(t => {
      const c = C(t.from),
        found = t.verdict.split(':')[1] === 'found';
      add('n', ...TX.debrief.onDaySeemedTo(t, c, found));
    });
  S.clues
    .filter(cl => cl.source === 'stray' && !cl.extra && !cl.pair)
    .forEach(cl => {
      const o = C(cl.owner),
        seen = cl.status === 'stray',
        [on, onRu] = onNight(cl.day).map(capS);
      add('n', ...TX.debrief.theTraceAtThe(on, o, seen, onRu));
    });
  S.clues
    .filter(cl => cl.misread)
    .forEach(cl => {
      const o = C(cl.owner),
        [on, onRu] = onNight(cl.day).map(capS);
      add('n', ...TX.debrief.cult(cl, on, o, onRu));
    });
  S.nights.forEach((rec, n) => {
    if (!rec) return;
    const asked = id => S.claims.some(x => x.night === n && x.id === id),
      [on, onRu] = onNight(n).map(capS);
    (rec.afraid || []).filter(asked).forEach(id => {
      const c = C(id),
        there = wasAbout(rec, id);
      add('n', ...TX.debrief.liedAboutWhereHad(on, c, there, onRu));
    });
    (rec.secret || []).filter(asked).forEach(id => {
      const c = C(id),
        t = rec.truth[id];
      add('n', ...TX.debrief.saidHadBeenAsleep(on, c, t, onRu));
    });
    Object.keys(rec.saw)
      .filter(id => rec.saw[id].made && S.sights.some(x => x.night === n && x.id === id))
      .forEach(id => {
        const c = C(id);
        add('n', ...TX.debrief.saidHadSeenSomeone(on, c, onRu));
      });
  });
}
function betrayalLines() {
  return S.betrayals.map(b => {
    const k = C(b.by),
      v = C(b.victim),
      heard = TX.debrief.whoHeardItToo(v);
    return b.saved === 'luck'
      ? TX.debrief.onNightCameFor(b, k, v, heard)
      : b.saved
        ? TX.debrief.onNightCameFor2(b, k, v, heard)
        : TX.debrief.onNightKilled(b, k, v, heard);
  });
}
function fxFalseDreamer({ r: r, add: add }) {
  S.order
    .map(C)
    .filter(c => c.role === 'cult')
    .forEach(dec => {
      const told = S.testimony.filter(t => t.from === dec.id && DREAM_KINDS.includes(t.kind));
      if (!told.length) return;
      const guilty = t => t.verdict.split(':')[0] === 'cult',
        lies = told.filter(t => guilty(t) !== (C(t.about).role === 'cult')),
        fooled = r.wrong.some(a => lies.some(t => t.about === a.id && guilty(t))),
        g = (m, f) => ru.gs(dec, m, f);
      const said =
        lies.length === told.length
          ? TX.debrief.everyDreamToldWas(dec, g)
          : lies.length
            ? TX.debrief.notEveryDreamTold(dec, g)
            : TX.debrief.everyDreamToldWas2(dec, g);
      add('m', ...TX.debrief.youActedOnOne(said, fooled));
    });
}
const DREAM_KINDS = ['vision', 'veiled'];
function fxDreamer({ add: add }) {
  const seer = S.order.map(C).find(c => c.role === 'seer');
  if (seer)
    seer.visions
      .filter(v => v.told && (v.veil || v.muddied || v.dark))
      .forEach(v => {
        const t = C(v.about);
        if (v.veil) add('n', ...TX.debrief.theFaceUnseenWas(seer, t, TRAITS[v.veil].vals[t.traits[v.veil]].clue));
        if (v.dark) add('n', ...TX.debrief.dreamtTheGodHand(seer, t));
        else if (v.muddied) add('n', ...TX.debrief.oneOfDreamsWas(seer, t, v));
      });
  if (seer) {
    const told = S.testimony.filter(t => t.from === seer.id && DREAM_KINDS.includes(t.kind)).length;
    if (told) add('p', ...TX.debrief.dreamedTrueAndTold(seer, told));
    else if (seer.status === 'taken') add('n', ...TX.debrief.dreamedTrueButThe(seer));
    else add('n', ...TX.debrief.dreamedTrueButNever(seer));
  }
}
function fxYourDreams({ raw: raw }) {
  const Y = S.you;
  if (!Y) return;
  Y.dreams.forEach(d => raw('n', __text('yourDreamNight') + d.html + (d.true ? __text('itWasSo') : __text('itWasNotSo'))));
}
function fxWatcher({ L: L, add: add }) {
  const watcher = S.order.map(C).find(c => c.role === 'warden');
  if (watcher) {
    const saves = L.guarded.filter(g => !g.you).length + L.attacks.filter(a => a.how === 'guard').length;
    if (saves) add('p', ...TX.debrief.keptWatchInThe(watcher, saves));
    else if (watcher.status === 'taken') add('n', ...TX.debrief.keptWatchOverThe(watcher));
    else add('n', ...TX.debrief.keptWatchOverThe2(watcher));
  }
}
function fxThief({ add: add }) {
  const smug = S.order.map(C).find(c => c.role === 'smuggler');
  if (smug && S.witness.length) {
    const w = S.witnessTold ? S.witness.filter(x => x.actor === S.witnessTold).pop() : S.witness[S.witness.length - 1],
      a = C(w.actor),
      when = w.night ? __text('onNight') : __text('theNightCraneDied'),
      sure = S.witnessTold && w.told ? THIEF_TOLD[w.told](smug) : null;
    if (w.real && w.real !== w.actor) add('m', ...TX.debrief.thoughtSawNearThe(smug, a, when, sure, w));
    else if (S.witnessTold) add('p', ...TX.debrief.sawNearTheScene(smug, a, when, sure));
    else add('n', ...TX.debrief.sawNearTheScene2(smug, a, when));
  }
}
const THIEF_TOLD = {
  sure: c => __text('readyToSwearToIt'),
  fairly: c => __text('allButSureOfIt'),
  unsure: c => __text('thoughNotSureOfIt')
};
function claimEnd(c) {
  const cl = claimOf(c),
    d = cl.recanted,
    g = (m, f) => ru.gs(c, m, f),
    He = EP.He(c),
    on = g(__text('text4'), __text('text5'));
  if (d == null) return cl.role !== trueClaim(c) && cl.role !== 'evade' ? __text('keptToItToTheEnd') : ['', ''];
  return (
    {
      pressed: __text('youBrokeTheStoryOnDay'),
      trust: TX.debrief.toldYouTheTruth(He, d, c, on, g),
      confess: TX.debrief.cameCleanOfOwn(He, c, d, on, g),
      aside: TX.debrief.cameCleanToYou(He, c, d, on, g),
      public: TX.debrief.confessedBeforeTheWhole(He, d, on, g),
      retreat: cl.how !== 'aside' ? TX.debrief.tookItBackBefore(He, d, on, g) : TX.debrief.quietlyTookItBack(He, d, on, g)
    }[c.role === 'cult' && ['confess', 'aside', 'public'].includes(cl.how) ? 'retreat' : cl.how] || __text('tookItBackOnDay')
  );
}
function fxClaims({ L: L, add: add }) {
  S.order
    .map(C)
    .filter(c => claimOf(c).said != null)
    .forEach(c => {
      const cl = claimOf(c),
        was = cl.recanted != null ? cl.was || cl.role : cl.role,
        d = cl.recanted,
        g = (m, f) => ru.gs(c, m, f),
        on = g(__text('text6'), __text('text7')),
        N = capS(ru.cf(c));
      const back = claimEnd(c);
      const part = r => (r === 'seer' ? __text('toDreamTrue') : __text('toKeepWatch'));
      if (cl.why === 'truth' && (c.role === 'seer' || c.role === 'warden'))
        add('p', __text('seerTheDreamerTheWatcherTold'), __text('seer'));
      else if (cl.why === 'conceal' && (c.role === 'seer' || c.role === 'warden')) {
        const seer = c.role === 'seer',
          unasked = cl.claimed === false,
          en = unasked
            ? seer
              ? `${c.name} never spoke of dreaming true, for fear of the knife.`
              : `${c.name} never spoke of keeping watch: a watcher works better unseen.`
            : was === 'evade'
              ? seer
                ? `${c.name} would not say whether ${c.p} dreamed: ${c.p} could not lie, and dared not tell.`
                : `${c.name} would not say whether ${c.p} kept watch, and would not lie about it either.`
              : seer
                ? `${c.name} denied being the Dreamer, for fear of the knife.`
                : `${c.name} denied keeping watch: a watcher works better unseen.`;
        const rus = unasked
          ? seer
            ? __text('text8')
            : __text('text9')
          : was === 'evade'
            ? seer
              ? __text('text10')
              : __text('text11')
            : seer
              ? __text('text12')
              : __text('text13');
        add(d != null ? 'p' : 'n', en + back[0], rus + back[1]);
      } else if (was && was !== 'none' && was !== 'evade' && was !== trueClaim(c)) {
        const pt = part(was),
          why =
            cl.why === 'deceit'
              ? __text('aLieToldToDeceiveYou')
              : cl.heat
                ? TX.debrief.aLieToldIn(c, g)
                : cl.why === 'liked'
                  ? __text('aLieToldToBeLiked')
                  : TX.debrief.aCoverForNight();
        add(cl.why === 'liked' ? 'n' : 'm', ...TX.debrief.claimed(c, pt, why, back, N, g));
      }
    });
  if (L.cultTruth) add('n', ...TX.debrief.evenTheCultTold(L));
}
function fxCamp({ f: f, r: r, add: add }) {
  if (r.friends.length || r.enemies.length) {
    const fr = r.friends,
      en = r.enemies,
      parts = [];
    if (fr.length) parts.push(__text('trustedYou'));
    if (en.length) parts.push(__text('couldNotStandYou'));
    add(fr.length > en.length ? 'p' : en.length > fr.length ? 'm' : 'n', ...TX.debrief.byTheEnd(parts));
  }
  const warmed = Gossip.record().reduce((n, x) => n + x.up.length, 0),
    turned = Gossip.record().reduce((n, x) => n + x.down.length, 0);
  if (warmed && turned) add(warmed > turned ? 'p' : turned > warmed ? 'm' : 'n', ...TX.debrief.talkAboutYouAround(warmed, turned));
  else if (warmed) add('p', ...TX.debrief.talkAboutYouAround2(warmed));
  else if (turned) add('m', ...TX.debrief.talkAboutYouAround3(turned));
  if (f && f.refused && f.refused.length) add('m', ...TX.debrief.wouldNotGoDown(f));
  S.order
    .map(C)
    .filter(c => c.status === 'present' && Suspicion.suspected(c.id))
    .slice(0, 2)
    .forEach(c => {
      const by = Suspicion.suspectedBy(c.id);
      add(
        'n',
        `By the end, ${endNames(by)} suspected ${c.name}${c.role === 'cult' ? ', and they were right' : ', wrongly'}.`,
        __text('aCult2')
      );
    });
  S.order
    .map(C)
    .filter(c => c.status === 'present' && Ties.sweetOnYou(c))
    .forEach(c => add('n', ...TX.debrief.hadASoftSpot(c)));
}
function fxVictims({ add: add }) {
  S.nights.forEach((rec, n) => {
    const v = rec && rec.why && S.chars[rec.target] ? C(rec.target) : null;
    if (!v || v.status !== 'taken' || v.takenDay !== n) return;
    const w = rec.why,
      by = w.by ? C(w.by) : null,
      of = w.of ? C(w.of) : null,
      seer = v.role === 'seer',
      say = {
        dreamer: seer
          ? w.aside
            ? TX.debrief.hadToldYouDreams(v)
            : TX.debrief.hadToldTheWhole(v)
          : w.aside
            ? TX.debrief.hadToldYouIn(v)
            : TX.debrief.hadMadeTooMuch(v),
        cannotBear: by && TX.debrief.couldNotBear(by, v),
        dislike: by && TX.debrief.hadNeverLiked(by, v),
        suspects: of && TX.debrief.hadBegunToSuspect(v, of),
        frame: of && TX.debrief.hadNamedBeforeEveryone(v, of),
        stood: __text('stoodByYou')
      }[w.kind];
    if (w.kind === 'power') add('m', ...TX.debrief.onNightWithNobody(n, v));
    else if (say) add('n', ...TX.debrief.theCultChoseOn(v, n, w.later != null ? TX.debrief.decidedOnNight(say, w.later) : say));
  });
}
const powerAt = n => !!(S.nights[n] && S.nights[n].power) || S.log.attacks.some(a => a.day === n && a.power);
function fxNights({ r: r, L: L, add: add }) {
  const taken = r.dead.slice().sort((a, b) => C(a).takenDay - C(b).takenDay),
    died = S.ended === 'death' && !S.fin,
    you = died && ['night', 'visit', 'spite', 'deed', 'wrist'].includes(S.hurtBy);
  if (taken.length) add('m', ...TX.debrief.theNightTook(taken, you));
  else if (you) add('n', ...TX.debrief.afterYouCameThe());
  else add(died ? 'n' : 'p', ...TX.debrief.afterYouCameThe2());
  L.attacks.forEach(a => {
    const pw = powerAt(a.day);
    if (a.how === 'hurt') add('m', ...TX.debrief.onNightThePower(pw, a));
    else if (a.how === 'bowl') add('p', ...TX.debrief.onNightTheIncantation(a));
    else if (a.how === 'revolver') add('n', ...TX.debrief.onNightYouFired(a));
    else if (a.how === 'woke') add('n', ...TX.debrief.onNightThePower2(pw, a));
  });
  L.quiet.forEach(d => {
    const low = L.low[d],
      a = low && low.about ? C(low.about) : null,
      why =
        low && low.why === 'heat' && a
          ? TX.debrief.theCampHadBegun(a)
          : low && low.why === 'after' && a
            ? TX.debrief.hadBeenUnmaskedThat(a)
            : low && low.why === 'ahead'
              ? TX.debrief.theRiteWasFar()
              : ['', ''];
    add('n', ...TX.debrief.onNightTheCult2(d, why));
  });
  L.kept.forEach(k => {
    const c = C(k.id),
      rec = S.nights[k.day],
      t = rec && rec.target && S.chars[rec.target] ? C(rec.target) : null,
      sp = L.spite.find(x => x.day === k.day),
      pw = powerAt(k.day);
    add('n', ...TX.debrief.theMorningAfterNight(k, c, sp, t, pw));
  });
  L.spared
    .filter(x => !x.away && !S.betrayals.some(b => b.day === x.day))
    .forEach(x => {
      const c = C(x.id),
        pw = powerAt(x.day);
      add('n', ...TX.debrief.onNightThePower3(pw, x, c));
    });
}
function fxDeed({ add: add }) {
  const d = S.log.deed;
  if (!d || !d.outcome) return;
  const t = C(d.id),
    g = (m, f) => ru.gs(t, m, f),
    what =
      t.role === 'cult'
        ? t.id === S.hierophant
          ? __text('wasOneOfThemAndThe')
          : __text('wasOneOfThem')
        : {
            seer: __text('dreamedTrue'),
            warden: __text('keptWatchOverTheCamp'),
            smuggler: __text('wasAThiefAndNoMore'),
            bystander: __text('wasExactlyWhatSeemed')
          }[t.role],
    was = __text('text14'),
    w = d.means === 'revolver' ? __text('withYourRevolver') : __text('withAKnife'),
    went = TX.debrief.onNightYouWent(d, t, w);
  if (d.outcome === 'killed') add(t.role === 'cult' ? 'n' : 'm', ...TX.debrief.andKilled(went, t, was, g));
  else if (d.outcome === 'failed') add('m', ...TX.debrief.wokeAndFoughtYou(went, t, was, g));
  else if (d.outcome === 'watched') add('n', ...TX.debrief.andTheWatcherDrove(went, d, was));
  else {
    const tr = S.nights[d.day] && S.nights[d.day].truth[t.id],
      mate = tr && tr.with && S.chars[tr.with] ? C(tr.with) : null,
      why = {
        watch: TX.debrief.wasSittingUpWith(t, g),
        errand: __text('wasOutDoingTheCultS'),
        thief: __text('wasOutRobbingTheDig'),
        tryst: mate ? __text('wasOutWithI') : __text('wasOut'),
        restless: TX.debrief.couldNotSleepAnd(t, g),
        gone: t.status === 'taken' && t.takenDay === d.day ? TX.debrief.theCultHadCome(t, g) : __text('wasAlreadyGone')
      }[d.away] || ['', ''];
    add('n', ...TX.debrief.andFoundItEmpty(went, why, was));
  }
  const seer = d.seenBy && C(d.seenBy);
  if (seer) add(d.caught === seer.id ? 'm' : 'n', ...TX.debrief.sawYouBetweenThe(seer, d));
  if (d.trace) add(d.linked ? 'm' : 'n', ...TX.debrief.aButtonFromYour(d));
  if (d.planted) {
    const o = C(d.plant.owner);
    add('n', ...TX.debrief.youLaidHabitBy(o, d));
  }
  const away = S.log.attacks.find(a => a.day === d.day && (a.how === 'out' || (a.how === 'guard' && a.out)));
  if (away && away.how === 'out') away.power ? add('n', ...TX.debrief.thatNightThePower()) : add('n', ...TX.debrief.thatNightTheCult());
  else if (away) away.power ? add('n', ...TX.debrief.thatNightThePower2()) : add('n', ...TX.debrief.thatNightTheCult2());
  if (d.vote) add(d.vote.passed ? 'm' : 'n', ...TX.debrief.onDayTheCamp(d));
}
function fxVisit({ add: add }) {
  const v = S.log.visit;
  if (!v) return;
  const h = C(v.id),
    cult = h.role === 'cult',
    was = cult ? __text('sheWasOneOfThem') : __text('sheWasWhatSheSeemed'),
    pw = powerAt(v.day),
    it = pw ? __text('thePowerBelow') : __text('theCult2');
  if (!v.agreed) {
    add(cult ? 'p' : 'n', ...TX.debrief.onTheEveningOf(v, h, was));
    return;
  }
  add('n', ...TX.debrief.onTheEveningOf2(v, h, was));
  if (v.struck === 'failed')
    S.ended === 'death' && S.hurtBy === 'wrist' ? add('m', ...TX.debrief.inTheSmallHours()) : add('p', ...TX.debrief.inTheSmallHours2());
  else if (cult && v.struck !== 'killed') add('n', __text('sheLetYouLiveThatNight'), __text('text15'));
  if (cult && S.log.attacks.some(a => a.day === v.day && a.power)) add('n', ...TX.debrief.withTheLastOf());
  if (v.out) add('n', ...TX.debrief.inTheNightShe());
  if (v.empty) add('n', ...TX.debrief.thatNightCameFor(it));
  if (v.found) add(v.found === 'dead' ? 'm' : 'n', ...TX.debrief.dead(v, it));
  if (v.spared) add('n', ...TX.debrief.thatNightWouldHave(it, v, h));
  if (v.through === 'her') add('m', ...TX.debrief.thatNightCameFor2(it, cult, pw));
  else if (v.through === 'hurt') add('n', ...TX.debrief.thatNightCameFor3(it, h, pw));
  if (v.chill) add('n', ...TX.debrief.theColdYouFelt(cult));
}
function fxNotebook({ r: r, add: add }) {
  if (r.mR + r.mW === 0) add('n', ...TX.debrief.youNeverMarkedAnyone());
  else add(r.mW === 0 ? 'p' : r.mW > r.mR ? 'm' : 'n', ...TX.debrief.youMarkedOfThe(r));
  if (r.first) add(r.first <= RULES.reckoning.earlyDay ? 'p' : 'n', ...TX.debrief.youExposedTheFirst(r));
  else if (!r.gate.length) add('m', ...TX.debrief.youNeverExposedAny());
}
function fxYourself({ haunt: haunt, won: won, r: r, L: L, add: add }) {
  if (haunt && (won || haunt === 2)) add('m', ...TX.debrief.whatYouReadAnd(won));
  if (!L.inq) add('n', ...TX.debrief.youNeverOnceCalled());
  if (!L.woundsTaken) add('p', ...TX.debrief.youCameThroughThe());
  else add('m', ...TX.debrief.youTookInThe(L));
  if (L.dread) add('m', ...TX.debrief.kuthaCameForYour(L));
  if (L.perils.length) add('m', ...TX.debrief.theDigItselfHurt(L));
  if (L.minNerve > 0 && L.minNerve <= RULES.reckoning.frayed) add('m', ...TX.debrief.yourNerveNearlyBroke(L));
  if (r.steady && L.minNerve > 0) add('p', ...TX.debrief.youEndedTheSeason());
  else if (S.nerve > 0 && S.nerve <= END_SAYS.rags && L.minNerve > RULES.reckoning.frayed) add('m', ...TX.debrief.youEndedTheSeason2());
}
const WAY_WORDS = __text('WAY_WORDS');
function natureSay() {
  const N = NATURE[S.aspectOf[S.patron]],
    ws = v => Object.keys(N).filter(w => N[w] === v),
    en = v => listNames(ws(v).map(w => WAY_WORDS[w][0])),
    rus = v => ru.list(ws(v).map(w => WAY_WORDS[w][1]));
  return TX.debrief.belowItFavouredAnd(en, rus);
}
function fxSeason({ add: add }) {
  add('n', ...tenorStory());
}
function endNumbers(r) {
  const L = S.log,
    sg = r.score > 0 ? '+' : r.score < 0 ? '−' : '',
    planted = S.clues.filter(cl => cl.source === 'plant' && !cl.extra && !cl.pair);
  const cells = __text('daysConversationsExposedWronglyAccusedInquiries');
  return `<div class="numbers">${cells.map(([v, en, rus]) => `<div class="num"><b>${v}</b><span>${bi(en, rus)}</span></div>`).join('')}</div>`;
}
function claimCell(c) {
  const cl = claimOf(c),
    g = (m, f) => ru.gs(c, m, f),
    hid = cl.why === 'conceal' && (c.role === 'seer' || c.role === 'warden');
  const role = cl.recanted != null && cl.was && cl.was !== 'none' ? cl.was : cl.role,
    staged = cl.recanted != null && cl.role !== trueClaim(c);
  const what = hid
    ? role === 'evade'
      ? __text('wouldNotSay')
      : __text('hidThePart')
    : staged && role === 'seer'
      ? __text('theDreamerThenTheWatcher')
      : role === 'seer'
        ? __text('theDreamer')
        : role === 'warden'
          ? __text('theWatcher')
          : role === 'evade'
            ? __text('wouldNotSay2')
            : null;
  if (!what) return '—';
  const why =
    cl.why === 'truth'
      ? ['true', __text('text16')]
      : cl.why === 'deceit'
        ? __text('toDeceive')
        : cl.heat
          ? __text('inATemper')
          : cl.why === 'reticent'
            ? __text('onPrinciple')
            : cl.why === 'liked'
              ? __text('toBeLiked')
              : c.role === 'seer'
                ? __text('forFear')
                : c.role === 'warden'
                  ? __text('toWatchUnseen')
                  : __text('asACover');
  const back =
    cl.recanted == null
      ? null
      : staged
        ? __text('aStagedConfession')
        : cl.how === 'confess' || cl.how === 'public' || cl.how === 'aside'
          ? __text('cameClean')
          : __text('tookItBack');
  return __text('text');
}
function fateText(c) {
  const b = S.betrayals.find(x => x.victim === c.id && !x.saved);
  if (!b) return statusText(c);
  const k = C(b.by);
  return __text('killedByNightG');
}
function scribeSaid() {
  const wrong = S.factKnown.map(i => S.facts[i]).filter(f => f.scribe);
  if (!wrong.length) return '';
  const one = wrong.length === 1,
    lines = wrong
      .map(
        f =>
          `<p class="lore">${bi('“', '«')}${f.text}${bi('”', '»')} ${__text('itShouldHaveSaid')} ${bi('“', '«')}${f.scribe}${bi('”', '»')}</p>`
      )
      .join('');
  return `<p>${bi(...TX.debrief.oneLineYouRead(one))}</p>` + lines;
}
function strayOmensSaid() {
  const odd = S.omenLog.filter(o => o.stray);
  if (!odd.length) return '';
  const fem = ru.gf(S.patron),
    one = odd.length === 1,
    en = odd.map(o => `${SIGN_POOL[o.si].short} (day ${o.day})`).join('; '),
    rus = odd.map(o => __text('text18')).join('; ');
  return `<p>${bi(...TX.debrief.notItsOwnAt(one, en, fem, rus))}</p>`;
}
const MANNER_OF = __text('MANNER_OF');
function mannerSaid() {
  const m = S.log.manner.map(x => {
    const [en, rus] = MANNER_OF[x.asp];
    return x.id === 'crane'
      ? bi(...TX.debrief.craneDeathWasIn(en, rus))
      : x.id === 'you'
        ? bi(...TX.debrief.theNightTheyCame(x, en, rus))
        : bi(...TX.debrief.theWayWasFound(x, en, rus));
  });
  const t = S.clues
    .filter(cl => cl.smudged)
    .map(cl => {
      const o = C(cl.owner),
        was = TRAITS[cl.cat].vals[cl.val].name,
        own = TRAITS[cl.cat].vals[cl.smudged].name;
      return bi(...TX.debrief.onTheTraceWas(cl, o, was, own));
    });
  return m
    .concat(t)
    .map(x => `<p>${x}</p>`)
    .join('');
}
const misreadSaid = () =>
  S.charms
    .filter(w => S.marksSeen && S.marksSeen[w] && S.marksSeen[w].some((m, i) => m !== S.marksOf[w][i]))
    .map(w => {
      const k = S.marksSeen[w].findIndex((m, i) => m !== S.marksOf[w][i]),
        was = CHARM_MARKS[S.marksSeen[w][k]],
        is = CHARM_MARKS[S.marksOf[w][k]];
      return `<p>${bi(...TX.debrief.youMisreadAMark(w, was, is))}</p>`;
    })
    .join('');
const misrememberedSaid = () =>
  S.glosses
    .filter(gl => gl.by === 'you' && S.titleOf[gl.e] !== gl.g)
    .map(gl => `<p>${bi(...TX.debrief.theOldTitleYou(gl))}</p>`)
    .join('');
const mienSaid = () =>
  S.testimony
    .filter(t => t.kind === 'mien' && t.verdict !== temperOf(t.from))
    .map(t => {
      const c = C(t.from);
      return `<p>${bi(...TX.debrief.youTookForWas(c, t))}</p>`;
    })
    .join('');
function misnotedSaid() {
  return castOrder(S.order)
    .map(C)
    .flatMap(c => CATS.filter(k => c.known[k] && c.known[k] !== c.traits[k]).map(k => [c, k]))
    .map(([c, k]) => {
      const was = TRAITS[k].vals[c.known[k]].name,
        is = TRAITS[k].vals[c.traits[k]].name;
      return `<p>${bi(...TX.debrief.whatYouNotedOf(c, was, is))}</p>`;
    })
    .join('');
}
function endTruth() {
  const g = GODS[S.patron],
    pw = S.wardOf[S.patron],
    fem = ru.gf(S.patron),
    named = S.fin && S.fin.named;
  const rows = castOrder(S.order)
    .map(C)
    .map(c => {
      const m = markOf(c),
        right = (m === 'foe' && c.role === 'cult') || (m === 'ally' && c.role !== 'cult'),
        wrong = (m === 'foe' && c.role !== 'cult') || (m === 'ally' && c.role === 'cult'),
        later = c.mark !== m ? ` <span class="dim">${bi(...TX.debrief.later(c))}</span>` : '';
      const role = c.id === S.hierophant ? 'Hierophant' : ROLE_NAMES[c.role],
        roleRu = RU_ROLE[c.id === S.hierophant ? 'hierophant' : c.role][ru.f(c) ? 1 : 0];
      return `<tr><td>${bi(c.name, capS(ru.cf(c)))}</td><td class="r-${c.role}">${bi(role, roleRu)}<span class="temper">${temperName(temperOf(c), c)}</span></td><td class="dim">${claimCell(c)}</td><td class="dim">${feelName(c)}</td><td>${m === '?' ? '—' : bi(MARKS[m], ruMark(c, m))} ${right ? '<span class="ok">✓</span>' : wrong ? '<span class="bad">✗</span>' : ''}${later}</td><td class="dim">${fateText(c)}</td></tr>`;
    })
    .join('');
  const tl = S.titlesOf[S.patron];
  return (
    bi(...TX.debrief.thePowerUnderKutha(g, named, tl, pw, fem)) +
    strayOmensSaid() +
    mannerSaid() +
    scribeSaid() +
    misreadSaid() +
    misrememberedSaid() +
    misnotedSaid() +
    mienSaid() +
    `<div class="tablewrap"><table><thead><tr><th>${__text('person')}</th><th>${__text('role')}</th><th>${__text('claimed')}</th><th>${__text('towardYou')}</th><th>${__text('yourMark')}</th><th>${__text('fate')}</th></tr></thead><tbody>${rows}</tbody></table></div>`
  );
}
