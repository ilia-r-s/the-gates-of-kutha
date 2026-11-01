// What each person has seen or heard, and whom they suspect.
const Suspicion = (() => {
  const id = x => (x && x.id) || x,
    lv = () => RULES.suspects;
  function deal() {
    S.sus = {};
    S.order.forEach(a => {
      S.sus[a] = {};
    });
    S.said = [];
    S.credit = {};
    S.onYou = 0;
    S.alerted = [];
    S.alerts = [];
    S.words = [];
    S.acts = [];
  }
  const level = (a, b) => {
    const i = id(a);
    return S.sus && S.sus[i] ? S.sus[i][id(b)] || 0 : 0;
  };
  function move(a, b, d) {
    const i = id(a),
      j = id(b),
      v = Math.max(0, Math.min(RULES.scale.suspicion, level(i, j) + d));
    if (v === level(i, j)) return false;
    S.sus[i][j] = v;
    return true;
  }
  const wonders = (a, b) => level(a, b) >= lv().wonder,
    onlyWonders = (a, b) => level(a, b) === lv().wonder,
    earnest = (a, b) => level(a, b) >= lv().earnest,
    sure = (a, b) => level(a, b) >= lv().sure;
  const suspectedBy = x =>
      freeChars()
        .filter(o => o.id !== id(x) && earnest(o, x))
        .map(o => o.id),
    suspected = x => suspectedBy(x).length >= lv().many;
  function mostSuspected(c, pool) {
    const top = pool
      .filter(o => level(c, o) >= (Ties.close(c, o) ? lv().sure : lv().earnest))
      .sort((a, b) => level(c, b) - level(c, a) || Ties.likes(c, a) - Ties.likes(c, b));
    return top[0] || null;
  }
  function sayAloud(by, about, verdict, how) {
    const word = { day: S.day, by: by, about: about, verdict: verdict, how: how, settled: false };
    Knowledge.publicWord(word);
    S.said.push(word);
  }
  function blame(by, about) {
    Record.testify(by, about, 'distrust', 'cult');
    sayAloud(by, about, 'cult', 'blame');
  }
  const hasDreamtAloud = c => S.said.some(x => x.by === id(c) && x.how === 'dream');

  const named = (a, b) => S.said.some(x => x.by === id(a) && x.about === id(b) && x.verdict === 'cult');
  const accusations = c => S.said.filter(x => x.by === id(c) && x.verdict === 'cult' && x.how !== 'vote');
  const credit = c => (S.credit && S.credit[id(c)]) || 0;
  function settle(about, guilty) {
    const last = new Map();
    S.said
      .filter(x => x.about === about && !x.settled && x.verdict !== 'veiled')
      .forEach(x => {
        x.settled = true;
        last.set(x.by, x);
      });
    const all = [...last.values()].map(x => ({ x: x, right: (x.verdict === 'cult') === guilty }));
    all.forEach(({ x: x, right: right }) => {
      S.credit[x.by] = credit(x.by) + (right ? 1 : -1);
    });
    return all;
  }
  const onYou = () => S.onYou || 0,
    youLevel = () => Math.min(RULES.scale.suspicion, Math.floor(onYou()));
  function suspectYou(n) {
    S.onYou = Math.min(RULES.scale.suspicion, onYou() + n);
  }
  function clearYou(n) {
    S.onYou = Math.max(0, onYou() - n);
  }
  function alertCult(p, who, source) {
    if (!source) throw new Error('An alarm needs a source');
    if (chance(p)) {
      who.forEach(c => S.alerted.includes(c.id) || S.alerted.push(c.id));
      S.alerts.push({ day: S.day, slot: S.slot, knew: who.map(c => c.id), source });
    }
  }
  const cultAlerted = () => S.alerted.some(k => isFree(C(k)));
  function toldYou(by, about, kind, at, verdict = null) {
    const there = at ? (S.here[at] || []).filter(x => x !== id(by) && isFree(C(x)) && C(x).role === 'cult') : [];
    S.words.push({
      day: S.day,
      slot: S.slot,
      at: at || null,
      by: id(by),
      about: id(about),
      kind: kind,
      verdict: verdict,
      there: there,
      heard: null,
      knew: []
    });
  }
  const gossipy = c => TP(c).gossip / (S.order.reduce((a, x) => a + TP(x).gossip, 0) / S.order.length);
  function heard(w) {
    if (w.heard === null) {
      const K = RULES.cunning;
      if (w.self) Object.assign(w, { how: 'self', heard: true, knew: [w.with], heardDay: w.day });
      else if (w.there.length) Object.assign(w, { how: 'overheard', heard: chance(K.overhear), knew: w.there, heardDay: w.day });
      else if (S.day > w.day)
        Object.assign(w, {
          how: 'rumour',
          heard: chance(K.rumour * (w.by ? gossipy(w.by) : 1)),
          knew: freeCult().map(c => c.id),
          heardDay: S.day
        });
      else return false;
    }
    return w.heard && w.knew.some(x => isFree(C(x)));
  }
  function sawYou(kind, at, w = null) {
    Knowledge.witnessAction(kind, at, w);
    const there = at ? (S.here[at] || []).filter(x => isFree(C(x)) && C(x).role === 'cult') : [],
      i = w ? id(w) : null;
    S.acts.push({
      day: S.day,
      slot: S.slot,
      at: at || null,
      kind: kind,
      by: i,
      with: i,
      self: !!i && there.includes(i),
      there: there,
      heard: null,
      knew: []
    });
  }
  const knownActs = (kind, w = null) =>
    (S.acts || []).filter(a => (!kind || a.kind === kind) && (!w || a.with === id(w)) && heard(a)).length;
  const wordsOf = (o, k, kind) => S.words.filter(w => w.by === id(o) && w.about === id(k) && (!kind || w.kind === kind));
  const dreamKey = x => `${x.by} ${x.about} ${x.verdict}`;
  function dreamsKnown(c) {
    const i = id(c),
      cl = claimOf(i);
    if (cl && cl.recanted != null && cl.was === 'seer' && OPEN.includes(cl.how)) return 0;
    const known = new Set(S.said.filter(x => x.by === i && x.how === 'dream').map(dreamKey));
    S.words.filter(w => w.by === i && w.kind === 'dream').forEach(w => known.has(dreamKey(w)) || (heard(w) && known.add(dreamKey(w))));
    if (known.size) return known.size;
    const claimed = ownedOpenly(i) || S.words.some(w => w.by === i && w.kind === 'claim' && heard(w));
    return claimed ? RULES.cunning.claim : 0;
  }
  const OPEN = ['confess', 'public'],
    ownedOpenly = c => {
      const cl = claimOf(id(c));
      return !!cl && cl.role === 'seer' && cl.recanted != null && OPEN.includes(cl.how);
    },
    knownAloud = c => hasDreamtAloud(c) || ownedOpenly(c);
  const accusedInVain = c => S.log.refusedInq.some(r => r.id === id(c));
  // A private suspicion is not a visible expression. Only words spoken in camp,
  // an inquiry's presented case, or a dream actually overheard can inform the cult.
  const publicWords = (o, k) => S.said.filter(x => x.by === id(o) && x.about === id(k) && x.verdict === 'cult'),
    shown = (o, k) => Math.min(RULES.scale.suspicion, new Set(publicWords(o, k).map(x => `${x.day}:${x.how}`)).size),
    exposure = k => freeChars().filter(o => o.id !== id(k) && shown(o, k) > 0),
    presentedCase = c => Math.max(0, ...S.inquiries.filter(v => v.id === id(c)).map(v => v.case || 0));
  const looksLost = c => presentedCase(c) >= RULES.verdict.someCase || exposure(c).length >= lv().many,
    caught = c => presentedCase(c) >= RULES.verdict.strongCase || exposure(c).length >= lv().many || accusedInVain(c),
    clear = c => presentedCase(c) < RULES.verdict.someCase && !exposure(c).length && !accusedInVain(c);
  const THREAT_PARTS = {
    steps: shown,
    accusations: (o, k) =>
      new Set(
        publicWords(o, k)
          .filter(x => x.how !== 'dream')
          .map(x => `${x.day}:${x.how}`)
      ).size,
    earnest: (o, k) => (shown(o, k) ? 1 : 0),
    dreams: (o, k) => {
      const known = new Set(
        S.said.filter(x => x.by === id(o) && x.how === 'dream' && x.verdict === 'cult' && x.about === id(k)).map(dreamKey)
      );
      wordsOf(o, k, 'dream')
        .filter(w => w.verdict === 'cult')
        .forEach(w => known.has(dreamKey(w)) || (heard(w) && known.add(dreamKey(w))));
      return known.size;
    }
  };
  const THREAT_OVER = { atLarge: () => freeCult() };
  const against = (parts, o, k) => parts.reduce((a, [part]) => a + THREAT_PARTS[part](o, k), 0);
  const THREAT_FORMS = {
    count: (t, o) => t.parts.reduce((a, [part, over]) => a + THREAT_OVER[over]().reduce((b, k) => b + THREAT_PARTS[part](o, k), 0), 0),
    first: (t, o, list) => list.find(k => against(t.parts, o, k) > 0),
    weight: (t, o, k) => t.base + t.per() * against(t.parts, o, k),
    watched: (t, k, but) => freeChars().some(o => o.id !== id(k) && o.id !== id(but) && against(t.parts, o, k) > 0)
  };
  // Different decisions retain different questions. The common-score alternative
  // is measured in sim/threat.js, not silently substituted for these five settings.
  const THREAT = {
    closingIn: {
      form: 'count',
      parts: [
        ['accusations', 'atLarge'],
        ['dreams', 'atLarge']
      ],
      why: 'Frame people who have actually advanced a case; one dream is counted once, not again as an accusation.',
      knows: 'Public accusations and guilty dreams heard publicly or by the existing overhearing and rumour routes.'
    },
    harm: {
      form: 'count',
      parts: [['dreams', 'atLarge']],
      why: 'A dream response concerns a claimed source of recurring information; ordinary accusers remain eligible through victim weights.',
      knows: 'Only distinct guilty dreams that were public or reached a living cultist through a recorded route.'
    },
    watched: {
      form: 'watched',
      parts: [['earnest']],
      why: 'A protective story needs an existing public case, not an invisible suspicion or certainty about the accusation.',
      knows: 'An accusation or vote spoken aloud by somebody other than the speaker making the protective claim.'
    },
    suspects: {
      form: 'first',
      parts: [['earnest']],
      why: 'The debrief names a public accuser’s target as a reason; it does not invent knowledge of private beliefs.',
      knows: 'The same public accusations and votes used by the ordinary victim weight.'
    },
    weight: {
      form: 'weight',
      parts: [['steps']],
      base: 1,
      per: () => RULES.victims.suspects,
      why: 'Repeated public opposition adds graded danger to the ordinary victim lottery without making death certain.',
      knows: 'Distinct public occasions of accusation, capped at the suspicion scale; no private belief grid.'
    }
  };
  const threat = {};
  Object.entries(THREAT).forEach(([name, t]) => {
    threat[name] = (...args) => THREAT_FORMS[t.form](t, ...args);
  });
  threat.shown = shown;
  threat.exposure = exposure;
  threat.explain = () => Object.fromEntries(Object.entries(THREAT).map(([k, t]) => [k, { why: t.why, knows: t.knows }]));
  return {
    deal: deal,
    level: level,
    shown: shown,
    move: move,
    wonders: wonders,
    onlyWonders: onlyWonders,
    earnest: earnest,
    sure: sure,
    suspectedBy: suspectedBy,
    suspected: suspected,
    mostSuspected: mostSuspected,
    sayAloud: sayAloud,
    blame: blame,
    hasDreamtAloud: hasDreamtAloud,
    named: named,
    accusations: accusations,
    credit: credit,
    settle: settle,
    onYou: onYou,
    youLevel: youLevel,
    suspectYou: suspectYou,
    clearYou: clearYou,
    alertCult: alertCult,
    cultAlerted: cultAlerted,
    toldYou: toldYou,
    sawYou: sawYou,
    knownActs: knownActs,
    dreamsKnown: dreamsKnown,
    knownAloud: knownAloud,
    looksLost: looksLost,
    caught: caught,
    clear: clear,
    threat: threat
  };
})();
