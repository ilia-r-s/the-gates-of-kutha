function pressP(c) {
  const t = RULES.talk;
  return clamp(t.press + (S.bg === 'soldier' ? t.pressSoldier : 0) + (c ? t.pressTrust * c.rapport : 0));
}
const PRESS_COOPERATES = Decisions.define({
    id: 'dialog.press.cooperate',
    action: 'cooperate-under-pressure',
    subject: c => c.id,
    object: 'player',
    authority: 'actor',
    knowledge: ['personally pressed by the player', 'own trust and the player’s background'],
    consequences: ['cooperation', 'possible recantation or reply'],
    features: { trust: 'number', background: 'string' },
    observe: c => ({ trust: c.rapport, background: S.bg }),
    probability: pressP
  }),
  PRESS_TRUST = Decisions.define({
    id: 'dialog.press.trust',
    action: 'react-to-pressure',
    subject: c => c.id,
    object: 'player',
    authority: 'actor',
    knowledge: ['personally pressed by the player', 'own trust and temperament'],
    consequences: ['trust'],
    features: { trust: 'number', temper: 'string' },
    observe: c => ({ trust: c.rapport, temper: temperOf(c) }),
    probability: () => RULES.talk.pressCost,
    apply: (yes, c) => yes && Decisions.effect('trust', c, 'player', -1, 'deed')
  }),
  CONFIDENCE_SOURS = Decisions.define({
    id: 'dialog.confidence.sours',
    action: 'react-to-refused-confidence',
    subject: c => c.id,
    object: 'player',
    authority: 'actor',
    knowledge: ['own suspicious temperament and refused confidence'],
    consequences: ['trust'],
    probability: () => RULES.talk.sourConfide,
    apply: (yes, c) => yes && Decisions.effect('trust', c, 'player', -1)
  });
function showables() {
  const a = S.items.filter(x => CHARMS.includes(x)).map(x => ({ id: x, name: theItem(x), sub: __text('anOldCharmFromTheTell') }));
  if (has('bowl')) a.push({ id: 'bowl', name: theItem('bowl'), sub: __text('aramaicFarYoungerThanTheRest') });
  if (S.fragments)
    a.push({
      id: 'frag',
      name: 'an untranslated tablet fragment',
      rn: __text('untranslatedFragmentRu'),
      sub: __text('clayNoOneHasReadYet')
    });
  else if (S.factKnown.length)
    a.push({
      id: 'line',
      name: 'a line you copied from the tablets',
      rn: __text('copiedLineRu'),
      sub: __text('fromYourNotebook')
    });
  return a;
}
const showRu = (t, k) => (t.rn ? t.rn[k === 'a' ? 1 : 0] : ru.item(t.id, k));
const SCHOLARS = ['anselm', 'ilse'];
function canShow() {
  return showables().length > 0;
}
const offDay = c => chance(RULES.talk.offDay * showMul(c) * (Ties.cordial(c) ? RULES.talk.offDayFriend : 1));
function curtTalk(c, hostile = true) {
  const k = tellOne('curtSay', [0, 1]);
  return {
    you: bi(...tellOne('smallTalk', SAY.smallTalk)),
    youE: 'smile',
    them: bi(...TX.dialog.iHaveWorkTo(k)),
    themE: 'stern',
    intent: hostile ? 'firm' : 'weary',
    note: bi(...tellOne(hostile ? 'curtHostile' : 'curtOff', SAY.curt[hostile ? 'hostile' : 'off'])(c)),
    cool: true
  };
}
function talkNotes(c, ...said) {
  const habit = unknownCats(c).length && chance(RULES.talk.habit) ? reveal(c) : null,
    m = mienNote(c),
    friend = Ties.friend(c),
    comfort = consoled(c),
    w = !comfort && chance(TP(c).chat + RULES.talk.warmth + cultOf(c, 'charm')) && Ties.moveTrust(c, 1),
    steady = friend && chance(RULES.talk.company) && regain(RULES.mend.company);
  return [
    habit,
    ...said,
    m,
    comfort,
    w ? bi(...tellOne('warmer', SAY.warmer)) : null,
    steady ? bi(...TX.dialog.talkingWithSteadiesYou(c)) : null
  ]
    .filter(Boolean)
    .join(' ');
}
function scholarTalk(c) {
  const l = learnFact(undefined, undefined, c.role === 'cult' && !chance(RULES.readings.cultSlip));
  if (l == null) return null;
  const k = tellOne('scholarSay', [0, 1, 2]);
  const note = talkNotes(c, bi(...tellOne('copyLine', SAY.copyLine)));
  return {
    you: bi(...tellOne('askReading', SAY.askReading)),
    youE: 'neutral',
    them: bi(...TX.dialog.listenToThisOne(k, c)) + ' ' + bi('‘', '„') + S.facts[l].text + bi('’', '“'),
    themE: 'thoughtful',
    intent: 'studying',
    note: note
  };
}
const TALK_TONE = new Map([
  [SMALLTALK.ashby[2], 'reserved'],
  [SMALLTALK.constance[0], 'weary'],
  [SMALLTALK.ilse[1], 'weary'],
  [SMALLTALK.ilse[2], 'serious']
]);
function smallTalk(c) {
  const line = tellOne('small-' + c.id, SMALLTALK[c.id]);
  let them = bi(line);
  const g = Gossip.speak('talk', c);
  if (g) them += ' ' + __text('betweenOurselves') + g.text;
  const fr = !g && chance(RULES.talk.feel * talkSoft()) ? Gossip.feelRemark(c) : null;
  if (fr) them += ' ' + fr.text;
  const slip = blurt(c, S.day - 1, RULES.talk.blurtInPassing);
  const themE = fr ? fr.face : JOKES.has(line) && chance(RULES.manner.joke) ? jokeFace(c) : pick(['smile', 'neutral', 'thoughtful']);
  return {
    you: bi(...tellOne('smallTalk', SAY.smallTalk)),
    youE: 'smile',
    them: them,
    themE: themE,
    intent: fr ? null : TALK_TONE.get(line),
    note: talkNotes(c, slip) || null
  };
}
const DIALOG = {
  about: {
    label: () => __text('makeConversation'),
    sub: c => __text('workHabits'),
    run(c) {
      if (Ties.against(c) && chance(RULES.talk.cold * showMul(c))) return curtTalk(c);
      if (!Ties.against(c) && offDay(c)) return curtTalk(c, false);
      return (SCHOLARS.includes(c.id) && chance(RULES.talk.scholarLine) && scholarTalk(c)) || smallTalk(c);
    }
  },
  night: {
    label: () => (S.day === 1 ? bi(...TX.dialog.askWhereTheyWere()) : __text('askWhereTheyWereLastNight')),
    sub: c => bi(...TX.dialog.accountAndAnythingSaw(c)),
    off: c => S.claims.some(x => x.night === S.day - 1 && x.id === c.id),
    run(c) {
      const n = S.day - 1,
        rec = S.nights[n],
        cl = rec && rec.claim[c.id] ? rec.claim[c.id] : { loc: 'camp', with: null };
      const br = bristles(c);
      Ties.hound(c, RULES.hound.ask);
      if (br) return br;
      Record.addAccount({ night: n, id: c.id, loc: cl.loc, with: cl.with, attacked: !!cl.attacked });
      let note = null,
        seen = '',
        up = null;
      const sw = rec && rec.saw[c.id],
        told = S.sights.some(x => x.night === n && x.id === c.id);
      const slip = blurt(c, n);
      if (sw && S.chars[sw.who] && !told) {
        if (Ties.against(c) ? chance(RULES.talk.withhold) : offDay(c)) note = bi(...TX.dialog.answersAndYouHave(c));
        else {
          Record.addSighting({ night: n, id: c.id, where: sw.where, to: sw.to, cat: sw.cat, val: sawVal(sw) });
          if (!cl.attacked) up = upAllNight(cl, c);
          seen = ' ' + sightLine(cl, sw, c, up);
        }
      }
      const them = alibiLine(cl, c, !!sw, up) + seen;
      if (slip) note = note ? note + ' ' + slip : slip;
      let you;
      if (n === 0) you = bi(...tellOne('askCrane', SAY.askCrane));
      else you = bi(...tellOne('askNight', SAY.askNight));
      return {
        you: you,
        youE: 'neutral',
        them: them,
        themE: pick(['thoughtful', 'neutral']),
        intent: cl.attacked ? 'distressed' : 'recounting',
        note: note
      };
    }
  },
  show: {
    label: c => {
      const th = showables();
      return th.length === 1 ? __text('showDA') : __text('showSomethingD');
    },
    sub: c => (SCHOLARS.includes(c.id) ? bi(...TX.dialog.aScholarCanRead()) : __text('watchHowTakesIt')),
    off: () => !canShow(),
    run(c, id) {
      const th = showables(),
        t = th.find(x => x.id === id) || th[0],
        r = ObjectReactions.choose(c, t.id);
      const words = t.id === 'line';
      Record.testify(c.id, c.id, words ? 'words' : 'react', r);
      let them = bi(tellOne('react-' + (words ? 'words-' : '') + r, (words ? REACT_WORDS_SAY : REACT_SAY)[r])),
        cool = false;
      if (CHARMS.includes(t.id) && SCHOLARS.includes(c.id)) {
        if (Ties.against(c) ? chance(RULES.talk.refuse) : offDay(c)) {
          cool = true;
          them += ' ' + bi(...TX.dialog.andIAmNot(c));
        } else {
          const fresh = !S.readings[c.id + ':' + t.id],
            rd = scholarRead(c, t.id);
          them += ' ' + readingSay(rd);
          if (fresh) {
            S.log.readings++;
            Suspicion.sawYou('readings', S.loc, c);
            Record.journal(readingNote(rd));
          }
        }
      }
      const tn = sayPick((words ? REACT_WORDS_NOTE : REACT_NOTE)[r]),
        many = !!(ITEMS[t.id] && ITEMS[t.id].plural);
      return {
        you: bi(...tellOne('askShow', SAY.askShow)),
        youE: 'neutral',
        pre: bi(...TX.dialog.youSetOnThe(t)),
        them: them,
        themE: r === 'fear' ? 'uneasy' : r === 'greed' ? 'smile' : 'thoughtful',
        intent: cool ? 'firm' : r === 'fear' ? 'distressed' : r === 'calm' ? 'studying' : null,
        note: __text('themItTheyIt'),
        cool: cool
      };
    }
  },
  confide: {
    label: () => __text('confideYourSuspicions'),
    sub: () => bi(...TX.dialog.trustBothWaysRisky()),
    run(c) {
      const you = bi(...tellOne('confide', SAY.confide)),
        cordial = Ties.cordial(c);
      if (c.role === 'cult') Suspicion.alertCult(RULES.confide.alerts, [c], { kind: 'confidence', route: 'participant', at: S.loc });
      if (!TAKES_CONFIDENCE.roll(c)) {
        if (temperOf(c) === 'suspicious') CONFIDENCE_SOURS.run(c);
        const k = tellOne('confideNo', [0, 1]);
        return {
          you: you,
          youE: 'grave',
          them: bi(...TX.dialog.iWouldBeCareful(cordial ? 0 : k)),
          themE: 'stern',
          intent: cordial ? 'serious' : Ties.against(c) ? 'firm' : 'reserved',
          note: bi(...tellOne('nothingBack', SAY.nothingBack)(c))
        };
      }
      Ties.confide(c);
      Gossip.wordOf(c, 'confided');
      const tc = tellOne('confideSay', CONFIDE_SAY);
      let them = bi(tc, fmtR(R(tc), { s: c }));
      const cl = claimOf(c),
        rc = recantTrust(c);
      if (rc) them += ' ' + rc;
      else if (Ties.friend(c) && cl.role === 'warden') {
        sayClaim(c);
        if (chance(RULES.talk.promise)) {
          them += bi(...TX.dialog.leaveYourLampBurning());
          Watch.swear(c);
        } else them += bi(...TX.dialog.iWatchTheWhole());
      }
      if (!rc && !c.promised && Ties.cordial(c) && cl.role === 'seer' && chance(RULES.talk.promise)) {
        c.promised = true;
        sayClaim(c);
        claimToYou(c, S.loc);
        them += bi(...TX.dialog.iShouldTellYou());
      }
      return { you: you, youE: 'grave', them: them, themE: 'grave', intent: 'confiding' };
    }
  },
  press: {
    label: c => __text('press'),
    sub: () => __text('shakeSomethingLooseCostsTrust'),
    run(c) {
      const ok = PRESS_COOPERATES.roll(c),
        you = bi(...tellOne('askPress', SAY.askPress));
      S.log.presses.push({ day: S.day, id: c.id });
      Decisions.effect('hounding', c, 'player', RULES.hound.press);
      Gossip.wordOf(c, 'pressed');
      if (!S.log.pressedWho.includes(c.id)) S.log.pressedWho.push(c.id);
      const before = c.rapport;
      PRESS_TRUST.run(c);
      const rp = ok && c.role !== 'smuggler' && recantPressed(c);
      if (rp) return { you: you, youE: 'stern', them: rp, themE: 'uneasy', note: bi(...TX.dialog.hasTheGraceTo(c)) };
      return Parts.move(c, 'pressed')(c, ok, you, before);
    }
  }
};
for (const [action, entry] of Object.entries(DIALOG)) {
  entry.run = Decisions.define({
    id: 'player.dialog.' + action,
    action,
    subject: 'player',
    object: c => c.id,
    authority: 'actor',
    knowledge: ['player selected this conversation approach with the named person'],
    consequences: ['interlocutor response', 'action-specific records and reactions'],
    execute: entry.run
  }).run;
}
const BRISTLE = __text('againNoNotTodayDoctor');
function bristles(c) {
  const H = RULES.hound,
    p = Math.min(H.bristleMax, H.bristle * Ties.hounded(c) * TP(c).bristle);
  if (!chance(p)) return null;
  if (chance(p)) Ties.moveTrust(c, -1, 'deed');
  const [en, rus] = sayPick(BRISTLE)(c);
  return {
    you: bi(...tellOne('askNight', SAY.askNight)),
    youE: 'neutral',
    them: bi(en, rus.replace(/\{a\}/g, ru.gs(c, '', __text('feminineEndingRu')))),
    themE: 'cold',
    cool: true
  };
}
function secretOf(c) {
  const lovers = freeChars().filter(o => o.id !== c.id && Ties.sweetOn(c.id, o.id)),
    mutual = lovers.find(o => Ties.sweetOn(o.id, c.id)),
    vain = lovers.find(o => !Ties.sweetOn(o.id, c.id)),
    all = [
      c.role === 'cult' && { secret: 'cult' },
      c.role === 'smuggler' && S.revealed[c.id] !== 'smuggler' && { secret: 'thief' },
      mutual && { secret: 'romance', with: mutual.id },
      (vain || Ties.sweetOnYou(c)) && { secret: 'unrequited', with: vain ? vain.id : 'you' }
    ].filter(Boolean),
    B = RULES.slip.secret;
  return all.sort((a, b) => B[b.secret] - B[a.secret])[0] || { secret: 'none' };
}
const pressesOf = c => S.log.presses.filter(p => p.id === c.id).length - 1;
function pressFear(c) {
  const L = RULES.slip;
  return Math.min(
    1,
    ownLot(c, placeOf(c) || S.loc, Knowledge.pressure(c)).trouble +
      L.fearPressed * pressesOf(c) +
      Math.min(L.fearSeasonMax, L.fearSeason * Knowledge.knownPresses(c))
  );
}
const SLIPS = Decisions.define({
  id: 'dialog.slip',
  action: 'let-a-secret-slip',
  subject: c => c.id,
  object: 'player',
  authority: 'actor',
  knowledge: [
    'own secret, temperament, trust, previous questioning and received alarm',
    'accusations and pressure actually received, known grief and own public shame',
    'remembered cult membership and initiation calendar, updated by known public losses'
  ],
  consequences: ['secret revealed'],
  features: {
    secret: 'string',
    temper: 'string',
    pressure: 'number',
    fear: 'number',
    trust: 'number',
    previousPresses: 'number',
    alerted: 'boolean',
    alone: 'boolean',
    ritualExpectation: 'number'
  },
  observe: (c, s) => ({
    secret: s.secret,
    temper: temperOf(c),
    pressure: Knowledge.pressure(c),
    fear: pressFear(c),
    trust: Ties.trust(c),
    previousPresses: pressesOf(c),
    alerted: S.alerted.includes(c.id),
    alone: s.secret === 'cult' && Knowledge.cultCompany(c).length === 1,
    ritualExpectation: Knowledge.ritualExpectation(c)
  }),
  probability: odds('lets something slip, pressed', [
    ['base', (c, s) => RULES.slip.secret[s.secret]],
    ['* temperament', c => TP(c).slip],
    ['* received pressure', c => RULES.slip.pressure + RULES.slip.pressureHeard * Math.min(RULES.slip.pressureMax, Knowledge.pressure(c))],
    ['* shaken', c => RULES.slip.shaken + RULES.slip.shakenFear * pressFear(c)],
    ['* fear alone', (c, s) => (s.secret === 'none' ? 1 + RULES.slip.noneFear * pressFear(c) : 1)],
    ['* toward you', c => RULES.slip.trust[Ties.trust(c)]],
    ['* rehearsed', (c, s) => (s.secret === 'none' ? 1 : RULES.slip.rehearsed ** pressesOf(c))],
    ['* on guard', (c, s) => (s.secret === 'cult' && S.alerted.includes(c.id) ? RULES.slip.onGuard : 1)],
    ['* believed last member', (c, s) => (s.secret === 'cult' && Knowledge.cultCompany(c).length === 1 ? RULES.slip.last : 1)],
    [
      '* expected rite',
      (c, s) => (s.secret === 'cult' ? RULES.slip.expectationBase + RULES.slip.expectationMore * Knowledge.ritualExpectation(c) : 1)
    ],
    ['clamp', () => [RULES.scale.rarest, RULES.slip.max]]
  ])
});
const slips = (c, ok) => {
  if (!ok) return null;
  const s = secretOf(c);
  return SLIPS.roll(c, s) ? s : null;
};
function pressedThief(c, ok, you, before) {
  const s = slips(c, ok);
  if (s) return slipOut(c, you, s);
  if (!ok) return rebuff(c, you, before);
  Record.testify(c.id, c.id, 'thief', 'thief');
  S.revealed[c.id] = 'smuggler';
  fixMark(c);
  const cover = recantPressed(c),
    named = chance(RULES.thief.pressed) ? thiefNames(c) : '';
  return {
    you: you,
    youE: 'stern',
    them: bi(...TX.dialog.fineAFewTablets(c)) + (cover ? ' ' + cover : '') + (named ? ' ' + named : ''),
    themE: named ? 'uneasy' : 'grave'
  };
}
function pressedAnyone(c, ok, you, before) {
  const s = slips(c, ok);
  if (s) return slipOut(c, you, s);
  if (ok) {
    const smug = thiefKnownTo(c);
    if (smug && chance(RULES.talk.pressTip)) return turnAside(c, you, smug);
  }
  return rebuff(c, you, before);
}
function pressedCult(c, ok, you, before) {
  const s = slips(c, ok);
  if (s) return slipOut(c, you, s);
  const smug = ok && thiefKnownTo(c);
  if (smug && chance(RULES.talk.pressTip)) {
    S.log.cultTruth++;
    return turnAside(c, you, smug);
  }
  Suspicion.alertCult(RULES.talk.pressAlerts, [c], { kind: 'press', route: 'participant', at: S.loc });
  return rebuff(c, you, before);
}
const SLIP_LINES = [
  c => TX.dialog.iWasNotWhere(c),
  () => TX.dialog.nobodyWasMeantTo(),
  () => TX.dialog.ifTheOthersFound(),
  () => TX.dialog.youHaveNoIdea()
];
function slipOut(c, you, s) {
  Record.testify(c.id, c.id, 'slip', s.secret);
  S.log.slips.push({ day: S.day, id: c.id, secret: s.secret, with: s.with || null });
  return {
    you: you,
    youE: 'stern',
    them: bi(...sayPick(SLIP_LINES)(c)),
    themE: 'surprised',
    note: bi(...TX.dialog.stopsMidSentenceAnd(c))
  };
}
function thiefKnownTo(c) {
  if (!Object.values(S.nights || {}).some(rec => rec && (rec.thiefSeen || []).includes(c.id))) return null;
  return freeChars().find(o => o.role === 'smuggler' && o.id !== c.id && S.revealed[o.id] !== 'smuggler') || null;
}
function tipped(c, smug) {
  const seen = new Set();
  Object.values(S.nights || {}).forEach(rec => {
    const s = rec && rec.saw && rec.saw[c.id];
    if (s && !s.made && s.who !== smug.id && s.who !== c.id && isFree(C(s.who))) seen.add(s.who);
  });
  return seen.size && chance(RULES.talk.tipWrong) ? C(pick([...seen])) : smug;
}
function turnAside(c, you, smug) {
  smug = tipped(c, smug);
  Record.testify(c.id, smug.id, 'tip', 'thief');
  return {
    you: you,
    youE: 'stern',
    them: tipLine(smug),
    themE: 'neutral',
    intent: 'reserved',
    note: bi(...TX.dialog.answersSmoothlyAndYou(c))
  };
}
const PRESS_REBUFF = __text('howDareYouIHaveTold');
function rebuff(c, you, before) {
  const [en, rus] = tellOne('rebuff', PRESS_REBUFF)(c);
  return {
    you: you,
    youE: 'stern',
    them: bi(en, rus),
    themE: 'stern',
    cool: true,
    note:
      before > c.rapport
        ? bi(...tellOne('thinner', SAY.thinner))
        : c.rapport <= RULES.scale.trustMin
          ? bi(...TX.dialog.thereWasNoTrust())
          : bi(...TX.dialog.somehowItDoesNot())
  };
}
DIALOG.distrust = {
  label: () => __text('askWhomTheyDistrust'),
  sub: c => bi(...TX.dialog.suspicionsOrDreams(c)),
  run(c) {
    Ties.hound(c, RULES.hound.ask);
    const others = freeChars().filter(o => o.id !== c.id),
      you = bi(...tellOne('distrust', SAY.distrust));
    const say = (them, themE = 'stern') => ({ you: you, youE: 'neutral', them: them, themE: themE });
    if (!others.length) return say(__text('thereIsNobodyLeftToDistrust'), 'grave');
    if (Ties.against(c) ? chance(RULES.talk.hostileSilence) : offDay(c)) return { ...say(bi(...TX.dialog.ifThereWereI(c))), cool: true };
    const d = dreamToTell(c);
    if (d) return say(bi(...TX.dialog.iDreamtOfThe(d)), 'grave');
    const w = thiefSaw(c);
    if (w && chance(RULES.thief.outright)) return { ...say(thiefNames(c, TX.dialog.youWantToKnow()), 'uneasy'), intent: 'recounting' };
    if (w && chance(RULES.thief.hint)) {
      const h = thiefHint(c, w);
      return { ...say(h.them, 'uneasy'), intent: 'recounting', note: h.note };
    }
    const proof = () => ({ ...say(bi(...TX.dialog.iWillNotPut()), 'neutral'), intent: 'reserved' });
    if (chance(TP(c).decline))
      return (temperOf(c) === 'detached') === chance(RULES.talk.ownWay)
        ? { ...say(bi(...TX.dialog.iDoNotWatch()), 'neutral'), intent: 'weary' }
        : proof();
    const b = whomToBlame(c, others);
    if (b.tip) {
      const t = tipped(c, b.tip);
      Record.testify(c.id, t.id, 'tip', 'thief');
      return { ...say(tipLine(t), 'neutral'), intent: 'reserved' };
    }
    if (!b.target) return proof();
    Record.testify(c.id, b.target.id, 'distrust', 'cult');
    const td = pick(
      (temperOf(c) === 'honest') === chance(RULES.talk.ownWay) ? T.distrustVague : T.distrust.concat(T.distrustVague.slice(0, 2))
    );
    return say(
      bi(fmt(td, { t: b.target.short, tpp: b.target.pp }).replace(/^“|”$/g, ''), fmtR(R(td), { t: b.target, s: c })),
      Ties.dislikes(c.id, b.target.id) ? 'cold' : 'stern'
    );
  }
};
function dreamToTell(c) {
  if (c.role === 'seer' && claimOf(c).role === 'seer') return chance(RULES.talk.dreamTell) ? trueDream(c) : null;
  return claimsToDream(c) && chance(RULES.talk.dreamTell) ? dreamToYou(c, madeUpDream(c), S.loc) : null;
}
function whomToBlame(c, others) {
  const seen = thiefSaw(c);
  if (seen) others = others.filter(o => o.id !== seen.actor);
  const k = temperOf(c),
    tp = TP(c),
    known = thiefKnownTo(c),
    smug = known && others.includes(known) ? known : null;
  return Parts.move(c, 'name')(c, others, { k: k, tp: tp, smug: smug });
}
function cultNames(c, others, { k: k, tp: tp, smug: smug }) {
  if (smug && (k === 'honest' || k === 'conscientious') && chance(RULES.talk.honestTip)) {
    S.log.cultTruth++;
    return { tip: smug };
  }
  const mate = busFor(c, others);
  if (mate) return { target: mate };
  const inno = others.filter(o => o.role !== 'cult');
  return chance(tp.frame) && inno.length ? { target: innocentBlames(c, inno) } : {};
}
const anyoneNames = (c, others, { k: k, smug: smug }) =>
  smug && (k === 'honest' || k === 'conscientious') && chance(RULES.talk.honestTip) ? { tip: smug } : { target: innocentBlames(c, others) };
function busFor(c, others) {
  const mate = others.find(o => o.role === 'cult' && o.id !== c.id);
  if (!mate || !Suspicion.looksLost(mate) || !chance(RULES.cunning.bus * craft(c).sacrifice)) return null;
  S.log.bus.push({ day: S.day, by: c.id, about: mate.id });
  return mate;
}
function innocentBlames(c, others) {
  const top = Suspicion.mostSuspected(c, others),
    notFriends = others.filter(o => !Ties.close(c.id, o.id));
  if (top && chance(RULES.talk.nameSuspect)) return top;
  const pool = chance(RULES.scale.rarest) ? others : notFriends;
  return pool.length ? Ties.pickByLike(c, pool, -1) : null;
}
DIALOG.title = {
  label: () => __text('askWhatAnOldTitleMeans'),
  sub: c => bi(...TX.dialog.knowsTheNamesBehind(c)),
  off: c => !GLOSSERS.includes(c.id) || !titlesToAsk(c).length,
  run(c, e) {
    e = e || titlesToAsk(c)[0];
    const you = bi(...TX.dialog.whatDoesMeanThe(e));
    const hostile = Ties.against(c);
    if (hostile ? chance(RULES.talk.refuse) : offDay(c)) {
      return {
        you: you,
        youE: 'neutral',
        them: bi(...TX.dialog.lookItUpYourself()),
        themE: 'stern',
        cool: true,
        note: hostile ? bi(...TX.dialog.betweenTheTwoOf()) : bi(...TX.dialog.itIsNotA())
      };
    }
    const gl = glossBy(c, e),
      G = GODS[gl.g].name,
      Gr = k => ru.god(gl.g, k),
      Title = capS(ttEn(e)),
      TitleRu = capS(ttRu(e));
    Record.journal(glossNote(gl));
    S.log.readings++;
    Suspicion.sawYou('readings', S.loc, c);
    const them = {
      anselm: bi(...TX.dialog.thatIsTheKutha(Title, G, TitleRu, Gr)),
      ilse: bi(...TX.dialog.obviouslyIsTheCommonest(G, Title, Gr, TitleRu)),
      zahrun: bi(...TX.dialog.myGrandmotherStillSaid(Title, G, TitleRu, Gr))
    }[c.id];
    return { you: you, youE: 'neutral', them: them, themE: 'thoughtful', intent: 'studying', note: bi(...TX.dialog.youCopyItInto()) };
  }
};
DIALOG.diary = {
  label: () => __text('askAboutCraneSDiary'),
  sub: c => bi(...TX.dialog.aDreamerAWatcher(c)),
  off: c => claimOf(c).said != null,
  run(c) {
    const cl = claimOf(c),
      them = claimSay(c, cl.role);
    sayClaim(c);
    claimToYou(c, S.loc);
    const note = claimTell(c),
      sly = note && lying(c) && (temperOf(c) === 'liar' || temperOf(c) === 'calculating');
    return {
      you: bi(...tellOne('claimYou', [...CLAIM_YOU, ...SAY.claimYou])),
      youE: 'neutral',
      them: them,
      themE: sly ? 'sly' : note ? 'uneasy' : cl.role === 'none' ? 'neutral' : cl.role === 'evade' ? 'uneasy' : 'grave',
      note: note
    };
  }
};
function openTalk(c) {
  S.act = 'talk';
  return { g: greeting(c), owned: recantTrust(c) };
}
const ASKED_COUNTED = ['about', 'night', 'distrust', 'diary', 'confide', 'press'];
function askOf(c, conv, k, arg) {
  if (!conv.asked.length) {
    const RT = RULES.talk;
    S.log.talk++;
    conv.limit = RT.questions + (chance(RT.longer) ? 1 : chance(RT.shorter) ? -1 : 0);
  }
  conv.asked.push(k);
  if (ASKED_COUNTED.includes(k)) {
    S.log[k]++;
    Suspicion.sawYou(k, S.loc, c);
  }
  emit('ask', k);
  const r = DIALOG[k].run(c, arg);
  let chill = null;
  if (!conv.chill && S.bg === 'occultist') {
    conv.chill = true;
    if (chance(c.role === 'cult' ? RULES.talk.chillCult : RULES.talk.chillOther)) {
      chill = bi(...tellOne('chill', [x => [fmt(T.chill, P(x)), fmtR(R(T.chill), { n: x })], ...SAY.chill])(c));
      Record.testify(c.id, c.id, 'chill', 'cult');
    }
  }
  return { ...r, face: replyFace(c, r, k, conv.asked.length), chill: chill };
}
function leaveOf(c) {
  const dream = partingDream(c),
    mien = mienNote(c, RULES.talk.mienParting);
  return { dream: dream, mien: mien, last: parting(c) };
}
