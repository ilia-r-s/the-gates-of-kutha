// Actor knowledge is a remembered observation or a stated hypothesis, never a
// fresh read of someone else's private state. World-side setup supplies fallible
// pre-expedition memories; later records name a concrete public source and route.
const Knowledge = (() => {
  const id = c => c?.id || c,
    pair = (a, b) => [id(a), id(b)].sort().join(':'),
    entry = (value, source, route, day = S.day, slot = S.slot, confidence = 'tentative') => ({
      value,
      source,
      route,
      day,
      slot,
      confidence
    });
  function deal() {
    const K = RULES.knowledge;
    S.knowledge = { people: {}, inscriptions: { titles: { ...S.titleOf }, wards: { ...S.godOfWard } } };
    for (const a of S.order.map(C)) {
      const memory = (S.knowledge.people[a.id] = {
          temper: {},
          bonds: {},
          flirts: {},
          opinion: {},
          studies: {},
          actions: [],
          claims: {},
          losses: [],
          attacks: [],
          luck: [],
          doctrine: null
        }),
        others = S.order.map(C).filter(c => c.id !== a.id);
      for (const b of others) {
        const value = chance(K.temper) ? temperOf(b) : pick(TEMPER_IDS.filter(k => k !== temperOf(b)));
        memory.temper[b.id] = entry(value, 'work and meals before the expedition opened', 'personal recollection', 0, null);
      }
      for (let i = 0; i < others.length; i++)
        for (const b of others.slice(i + 1)) {
          const c = others[i],
            l = Ties.likes(c, b) + Ties.likes(b, c),
            actual = l >= RULES.gossip.bond ? true : l <= -RULES.gossip.bond ? false : null,
            value = chance(K.bond) ? actual : pick([true, false, null].filter(x => x !== actual));
          memory.bonds[pair(c, b)] = entry(value, 'company and quarrels in the earlier camp', 'personal recollection', 0, null);
        }
      for (const b of others) {
        const targets = others.filter(c => Ties.mayFlirt(b, c)).map(c => c.id);
        if (b.p === 'she' && !Ties.vowed(b)) targets.push('you');
        for (const target of targets) {
          const actual = target === 'you' ? Ties.sweetOnYou(b) : Ties.sweetOn(b, target),
            value = chance(K.flirt) ? actual : !actual;
          memory.flirts[b.id + ':' + target] = entry(
            value,
            target === 'you' ? 'the greeting at the player’s arrival' : 'looks and company in the earlier camp',
            'fallible reading of outward attention',
            target === 'you' ? 1 : 0,
            target === 'you' ? 0 : null
          );
        }
      }
      if (a.role === 'cult') {
        // Membership identifies the power the cult worships. Its inherited ward
        // and nature claims are fallible, even when confidently believed.
        const ward = chance(K.doctrine) ? S.wardOf[S.patron] : pick(S.charms.filter(w => w !== S.wardOf[S.patron])),
          nature = chance(K.natureDoctrine) ? S.aspectOf[S.patron] : pick(Object.keys(NATURE).filter(n => n !== S.aspectOf[S.patron]));
        memory.doctrine = entry(
          { power: S.patron, ward, nature, members: S.order.filter(k => C(k).role === 'cult'), deadline: RULES.start.days },
          'instructions received at initiation',
          'remembered doctrine',
          0,
          null,
          'assured'
        );
      }
    }
  }
  const memory = c => S.knowledge.people[id(c)],
    temper = (a, b) => memory(a).temper[id(b)],
    bond = (s, a, b) => memory(s).bonds[pair(a, b)],
    flirts = s =>
      Object.entries(memory(s).flirts)
        .filter(([, r]) => r.value)
        .map(([k]) => k.split(':')),
    doctrine = c => memory(c).doctrine;
  // Public words belong to their actual audience at the time they were spoken.
  // Inspecting this information never rolls for a new rumour or rereads truth.
  function publicWord(word) {
    Object.assign(word, {
      slot: S.slot,
      audience: freeChars().map(c => c.id),
      source: word.how === 'vote' ? 'the inquiry vote' : 'words spoken to the gathered camp',
      route: 'heard in person'
    });
  }
  function publicClaim(c, value) {
    for (const actor of freeChars())
      memory(actor).claims[id(c)] = { ...entry(value, id(c), 'claim heard in the gathered camp', S.day, S.slot, 'reported'), by: id(c) };
  }
  function publicLoss(victim) {
    for (const actor of freeChars()) {
      const losses = memory(actor).losses;
      if (!losses.some(r => r.value === id(victim)))
        losses.push(entry(id(victim), 'the announced death or disappearance', 'heard at the dawn gathering', S.day, S.slot, 'assured'));
    }
  }
  function experiencedAttack(about, actors) {
    for (const actor of actors.filter(Boolean))
      memory(actor).attacks.push(entry(id(about), 'the attempted night attack', 'personal participation', S.day, S.slot, 'assured'));
  }
  function observedLuck(c, sign) {
    // Only the named participant receives this experience. The player's private
    // salt images, dreams, tablet readings and death visions are not shared.
    memory(c).luck.push(
      entry(
        { way: sign.way, good: sign.good },
        'the outcome of their own act at the dawn gathering',
        'personal experience, interpreted as a possible sign',
        sign.day,
        sign.slot,
        'tentative'
      )
    );
  }
  function objectBeliefs(c, item) {
    const profile = RULES.objectReaction.objects[item];
    if (!profile) throw Error('No visible object association: ' + item);
    const faith = doctrine(c),
      nature = faith?.value.nature,
      tendencies = profile.ways.map(way => NATURE[nature]?.[way] || 0),
      luck = memory(c).luck.findLast(r => S.day - r.day <= RULES.objectReaction.recentDays),
      vision = c.visions.findLast(v => v.cult && !v.veil),
      trade = c.role === 'smuggler',
      witness = trade ? S.witness.at(-1) : null;
    const observation = {
      temper: temperOf(c),
      trust: Ties.trust(c),
      god: faith?.value.power || '',
      nature: nature || '',
      ward: faith?.value.ward === item,
      natureFear: tendencies.includes(-1),
      natureWant: tendencies.includes(1),
      badLuck: !!luck && !luck.value.good,
      goodLuck: !!luck && luck.value.good,
      vision: !!vision,
      trade: trade && profile.valuable,
      witness: !!witness
    };
    const basis = [
      entry(item, 'the visible material or form of the presented object', 'shown in this conversation', S.day, S.slot, 'assured')
    ];
    if (faith) basis.push(faith);
    if (luck) basis.push(luck);
    if (vision)
      basis.push(
        entry(vision.about, 'a troubling dream they remember', 'own dream, not confirmed truth', vision.night ?? null, null, 'believed')
      );
    if (trade) basis.push(entry('trade', 'their own smuggling trade', 'personal history', 0, null, 'assured'));
    if (witness) basis.push(entry(witness.actor, 'their remembered night glimpse', 'personal sighting', witness.night, null, witness.sure));
    return { observation, basis };
  }
  const knownLosses = c => memory(c).losses,
    lossToday = c => knownLosses(c).some(r => r.day === S.day),
    absent = (c, target) =>
      knownLosses(c).some(r => r.value === id(target)) ||
      S.inquiries.some(
        v => v.id === id(target) && v.passed && v.audience?.includes(id(c)) && S.log.accused.some(a => a.id === v.id && a.day === v.day)
      ),
    knownWords = c => {
      const actor = id(c),
        publicWords = S.said
          .filter(w => w.audience?.includes(actor))
          .map(w => ({
            by: w.by,
            about: w.about,
            kind: w.how,
            value: w.verdict,
            day: w.day,
            slot: w.slot,
            source: w.source,
            route: w.route,
            received: w.day,
            confidence: 'reported'
          })),
        privateWords = S.words
          .filter(w => w.by === actor || (w.heard === true && w.knew.includes(actor)))
          .map(w => ({
            by: w.by,
            about: w.about,
            kind: w.kind,
            value: w.verdict,
            day: w.day,
            slot: w.slot,
            source: 'a private statement by ' + w.by,
            route: w.by === actor ? 'own words' : w.how === 'overheard' ? 'recorded overhearing' : 'recorded passed-on report',
            received: w.by === actor ? w.day : w.heardDay,
            confidence: 'reported'
          }));
      return [...publicWords, ...privateWords];
    };
  function knownClaims(c) {
    const claims = { ...memory(c).claims };
    for (const w of knownWords(c).filter(report => ['claim', 'dream'].includes(report.kind))) {
      const old = claims[w.by];
      // A private claim record means a claim to dream, not a truthful role label.
      if (!old || w.day > old.day || (w.day === old.day && w.slot > old.slot)) claims[w.by] = { ...w, value: 'seer' };
    }
    return Object.values(claims).filter(w => !absent(c, w.by));
  }
  const accusers = (c, target = c) => [
      ...new Set(
        knownWords(c)
          .filter(w => w.by !== id(target) && w.about === id(target) && w.value === 'cult')
          .map(w => w.by)
      )
    ],
    pressure = c =>
      Math.max(accusers(c).length, 0, ...S.inquiries.filter(v => v.id === id(c) && v.audience?.includes(id(c))).map(v => v.case || 0)),
    playerPressure = c =>
      Math.min(RULES.scale.suspicion, new Set(S.rumors.filter(r => r.kind === 'bad' && r.heardBy?.includes(id(c))).map(r => r.by)).size),
    knownThreat = c => knownLosses(c).some(r => r.day === S.day) || memory(c).attacks.some(r => r.day >= S.day - 1);
  function knownPresses(c) {
    const witnessed = memory(c)
        .actions.filter(a => a.value === 'press' && a.with !== id(c))
        .map(a => [a.day, a.slot, a.with]),
      heard = S.rumors
        .filter(r => r.kind === 'pressed' && r.about !== id(c) && r.heardBy?.includes(id(c)))
        .map(r => [r.sourceDay, r.sourceSlot, r.about]);
    return new Set([...witnessed, ...heard].map(x => x.join(':'))).size;
  }
  function ritualExpectation(c) {
    const belief = doctrine(c);
    if (belief) return Math.max(0, Math.min(1, (S.day - 1) / belief.value.deadline));
    const troubling = c.visions.filter(v => v.cult && !v.veil).length;
    return Math.min(1, (knownLosses(c).length + troubling) / RULES.knowledge.dangerSignals);
  }
  const cultCompany = c => (doctrine(c)?.value.members || []).filter(k => !absent(c, k));
  function opinion(s, t) {
    const observations = (S.rumors || [])
      .filter(r => r.by === id(t) && ['good', 'bad'].includes(r.kind) && (r.heardBy || []).includes(id(s)))
      .map(r => ({
        value: r.kind,
        day: r.day,
        slot: 0,
        source: 'remark at breakfast',
        route: 'heard in person',
        key: 'remark:' + r.day + ':' + r.kind
      }));
    for (const v of S.inquiries || []) {
      const present = [...v.back, ...v.against, ...v.silent];
      if (!present.includes(id(s)) || !present.includes(id(t))) continue;
      const value = v.back.includes(id(t)) ? 'good' : v.against.includes(id(t)) ? 'bad' : null;
      if (value)
        observations.push({
          value,
          day: v.day,
          slot: 2,
          source: 'a vote at the inquiry',
          route: 'witnessed in the same council',
          key: 'vote:' + v.day + ':' + v.id
        });
    }
    const latest = observations.sort((a, b) => b.day - a.day || b.slot - a.slot)[0],
      old = memory(s).opinion[id(t)];
    if (!latest) return old || entry(null, 'no witnessed opinion of the player', 'unknown', 0, null);
    if (old?.key === latest.key) return old;
    // A supportive vote is evidence, not direct access to a voter's feelings.
    const value = chance(RULES.knowledge.opinion) ? latest.value : latest.value === 'good' ? 'bad' : 'good';
    return (memory(s).opinion[id(t)] = { ...entry(value, latest.source, latest.route, latest.day, latest.slot), key: latest.key });
  }
  function witnessAction(kind, at, participant = null) {
    const K = RULES.knowledge,
      withId = participant ? id(participant) : null,
      present = at ? (S.here[at] || []).filter(k => isFree(C(k))) : [],
      possible = [...new Set([...present, ...(withId && isFree(C(withId)) ? [withId] : [])])];
    for (const actor of possible) {
      const self = actor === withId,
        conversational = !!withId,
        p = self ? K.participant : conversational ? K.topic : K.activity;
      if (!chance(p)) continue;
      memory(actor).actions.push({
        ...entry(
          kind,
          conversational ? 'the topic of the player’s conversation' : 'the player’s activity at the same place',
          self ? 'participated in the conversation' : conversational ? 'overheard its topic nearby' : 'noticed in person'
        ),
        at: at || null,
        with: withId
      });
    }
  }
  const knownActions = c => memory(c).actions,
    styleBasis = (c, style) => knownActions(c).filter(a => RULES.knowledge.styles[style].includes(a.value)),
    styles = (c, allowed = ['sleuth', 'scholar', 'delver']) =>
      Object.entries(RULES.knowledge.styles)
        .filter(
          ([style]) =>
            allowed.includes(style) && new Set(styleBasis(c, style).map(a => a.day + ':' + a.slot)).size >= RULES.knowledge.repeated
        )
        .map(([style]) => style);
  function contacts(c) {
    const actions = knownActions(c).filter(a => a.with && a.with !== id(c) && isFree(C(a.with)));
    return [...new Set(actions.map(a => a.with))]
      .map(w => ({ id: w, basis: actions.filter(a => a.with === w) }))
      .filter(r => new Set(r.basis.map(a => a.day + ':' + a.slot)).size >= RULES.knowledge.repeated);
  }
  function outing(c, companion) {
    // A shared outing is the speaker's own experience. Anonymous glimpses name
    // traits, not faces: their world-side `who` field cannot identify a person.
    const day = S.day - 1,
      own = S.nights[day]?.truth[id(c)];
    return own && own.loc !== 'camp' && own.with === id(companion)
      ? { ...entry(id(companion), 'shared outing', 'personal participation', day, null, 'assured'), at: own.loc }
      : null;
  }
  const CREDENTIALS = {
    anselm: { title: 'epigraphic training at the École Biblique', ward: 'epigraphic training applied to ritual forms and marks' },
    ilse: { title: 'Assyriological study of divine names', ward: 'Assyriological study of ritual forms and marks' },
    zahrun: { title: 'Mandaean family tradition of divine titles' }
  };
  function study(c, kind, subject) {
    const credential = CREDENTIALS[id(c)]?.[kind];
    if (!credential) throw new Error('No established expertise for this interpretation');
    const inscriptions = S.knowledge.inscriptions;
    return {
      meaning: (kind === 'ward' ? inscriptions.wards[subject] : inscriptions.titles[subject]) || null,
      basis: entry(
        null,
        kind === 'ward' ? 'the form and marks of the presented charm' : 'the old title presented in conversation',
        credential
      )
    };
  }
  function rememberStudy(c, kind, subject, value, report, basis) {
    // Deliberate misreporting does not overwrite the speaker's own interpretation.
    memory(c).studies[kind + ':' + subject] = { ...basis, value, report };
  }
  return {
    deal,
    temper,
    bond,
    flirts,
    opinion,
    doctrine,
    study,
    rememberStudy,
    witnessAction,
    knownActions,
    styles,
    styleBasis,
    contacts,
    outing,
    publicWord,
    publicClaim,
    publicLoss,
    experiencedAttack,
    observedLuck,
    objectBeliefs,
    knownWords,
    knownClaims,
    knownLosses,
    lossToday,
    accusers,
    pressure,
    playerPressure,
    knownThreat,
    knownPresses,
    ritualExpectation,
    cultCompany
  };
})();
