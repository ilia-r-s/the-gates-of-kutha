// world/powers.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const ASPECTS = {};
Object.keys(ASPECT_TEXT).forEach(k => {
  ASPECTS[k] = { key: k, ...ASPECT_TEXT[k] };
});
const SIGN_POOL = [];
Object.keys(ASPECTS).forEach(k =>
  ASPECTS[k].signs.forEach(s => SIGN_POOL.push({ texts: s.texts, text: s.texts[0], short: s.short, aspect: k, formula: s.formula }))
);
const ASP = g => ASPECTS[S.aspectOf[g]];
const patronSign = i => SIGN_POOL[S.signsOf[S.patron][i]];
const theItem = it => 'the ' + ITEMS[it].name.charAt(0).toLowerCase() + ITEMS[it].name.slice(1);
const V = (w, one, many) => (ITEMS[w].plural ? many : one);
const fmlEn = si => SIGN_POOL[si].formula,
  fmlRu = si => R(SIGN_POOL[si].formula);
const TITLES = __text('TITLES');
const TITLE_IDS = Object.keys(TITLES);
const tt = e => TITLES[e];
const ttEn = e => tt(e).en,
  ttRu = (e, k = 'n') => tt(e).ru[CASE[k]];
const refGod = r => (r[0] === 'g' ? r.slice(2) : S.titleOf[r.slice(2)]);
const refEn = r => (r[0] === 'g' ? GODS[r.slice(2)].name : ttEn(r.slice(2)));
const refRu = (r, k = 'n') => (r[0] === 'g' ? ru.god(r.slice(2), k) : ttRu(r.slice(2), k));
const refTitle = r => (r[0] === 't' ? r.slice(2) : null);
const refOf = g => (chance(PUZ.title) ? 't:' + pick(S.titlesOf[g]) : 'g:' + g);
const CHARM_MARKS = {
  notches: { ...enRu(TX.powers.bearsSevenNotches()) },
  crack: { ...enRu(TX.powers.isCrackedCleanThrough()), not: ['crescent'] },
  cedar: { ...enRu(TX.powers.smellsOfCedar()) },
  smoke: { ...enRu(TX.powers.smellsOfWoodsmoke()) },
  sea: { ...enRu(TX.powers.smellsOfTheSea()) },
  bitumen: { ...enRu(TX.powers.isSmearedWithBitumen()) },
  ochre: { ...enRu(TX.powers.hasRedOchreIn()), not: ['duck', 'crescent', 'fly'] },
  gold: { ...enRu(TX.powers.bearsAFleckOf()) },
  star: { ...enRu(TX.powers.bearsAStarOn()) },
  wedges: { ...enRu(TX.powers.bearsALineOf()), not: ['cone', 'liver'] },
  chill: { ...enRu(TX.powers.staysColdAtNoon()) },
  weight: { ...enRu(TX.powers.weighsMoreThanIt()) },
  thread: { ...enRu(TX.powers.isTiedWithRed()) },
  chip: { ...enRu(TX.powers.isChippedAtOne()) },
  worn: { ...enRu(TX.powers.isWornSmoothOn()) }
};
const CHARM_MARK_IDS = Object.keys(CHARM_MARKS);
const VESHCH = __text('text');
function riddle(w) {
  const m = ((S.refOf && S.refOf[w]) || []).map(k => CHARM_MARKS[k]);
  if (!m.length) return { en: 'what was found', ru: VESHCH };
  const verb = vp => vp.split(' ')[0],
    en = m.map(x => x.en.vp).map((vp, i, all) => (i && verb(vp) === verb(all[0]) ? vp.slice(verb(vp).length + 1) : vp));
  return { en: 'what ' + en.join(' and '), ru: VESHCH.map(v => `${v} ${m[0].ru.prep} ${m.map(x => x.ru.ins).join(__text('text2'))}`) };
}
const rdEn = w => riddle(w).en,
  rdRu = (w, k = 'n') => riddle(w).ru[CASE[k]];
function readMarks(w) {
  const m = S.marksOf[w].slice();
  if (chance(PUZ.misread)) {
    const k = pick([0, 1]),
      other = CHARM_MARK_IDS.filter(x => !m.includes(x) && !(CHARM_MARKS[x].not || []).includes(w));
    if (other.length) m[k] = pick(other);
  }
  return m;
}
const marksSee = w => {
  const m = ((S.marksSeen && S.marksSeen[w]) || S.marksOf[w] || []).map(k => CHARM_MARKS[k]);
  return [capS(m.map(x => x.en.see).join('; ')) + '.', capS(m.map(x => x.ru.see).join('; ')) + '.'];
};
function dealGods() {
  dealSigns(shuffle(S.gods));
  dealWards();
  dealTitles();
  S.readings = {};
  S.gm = {};
  S.glosses = [];
  buildFacts();
}
function dealSigns(G) {
  const pairs = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3]
  ]
    .concat(
      pick([
        [
          [0, 1],
          [2, 3]
        ],
        [
          [0, 2],
          [1, 3]
        ],
        [
          [0, 3],
          [1, 2]
        ]
      ])
    )
    .map(e => [G[e[0]], G[e[1]]]);
  const signs = shuffle(SIGN_POOL.map((s, i) => i)).slice(0, pairs.length);
  S.signPair = {};
  S.signsOf = {};
  S.gods.forEach(g => {
    S.signsOf[g] = [];
  });
  signs.forEach((si, k) => {
    S.signPair[si] = pairs[k];
    pairs[k].forEach(g => S.signsOf[g].push(si));
  });
  S.gods.forEach(g => {
    S.signsOf[g] = shuffle(S.signsOf[g]);
  });
  S.aspectOf = {};
  S.gods.forEach(g => {
    S.aspectOf[g] = SIGN_POOL[S.signsOf[g][0]].aspect;
  });
}
function dealWards() {
  const wl = shuffle(CHARMS).slice(0, S.gods.length + 2),
    spots = shuffle(LOC_IDS.filter(l => LOCS[l].search));
  S.charms = CHARMS.filter(w => wl.includes(w));
  dealMarks();
  S.wardOf = {};
  S.godOfWard = {};
  S.wardAt = {};
  S.decoys = wl.slice(S.gods.length);
  S.gods.forEach((g, i) => {
    S.wardOf[g] = wl[i];
    S.godOfWard[wl[i]] = g;
  });
  wl.forEach((w, i) => {
    S.wardAt[w] = spots[i];
  });
  if (chance(PUZ.share)) {
    const [a, b] = shuffle(wl);
    S.wardAt[a] = S.wardAt[b];
  }
}
function dealMarks() {
  const free = shuffle(CHARM_MARK_IDS),
    take = (...ws) => {
      const i = free.findIndex(m => ws.every(w => !(CHARM_MARKS[m].not || []).includes(w)));
      if (i < 0) throw new Error(`dealMarks: no mark left that ${ws.join(' and ')} can bear`);
      return free.splice(i, 1)[0];
    };
  S.marksOf = {};
  S.refOf = {};
  S.charms.forEach(w => {
    S.marksOf[w] = [take(w)];
  });
  const order = shuffle(S.charms);
  for (let k = 0; k < PUZ.markShared; k++) {
    const pair = order.splice(0, 2),
      m = take(...pair);
    pair.forEach(w => S.marksOf[w].push(m));
  }
  order.forEach(w => S.marksOf[w].push(take(w)));
  S.charms.forEach(w => {
    S.refOf[w] = chance(PUZ.markBoth) ? sayShuffle(S.marksOf[w]).slice() : [S.marksOf[w][0]];
  });
}
function dealTitles() {
  const all = shuffle(TITLE_IDS.filter(e => !S.gods.includes(TITLES[e].of)));
  S.titlesOf = {};
  S.titleOf = {};
  S.gods.forEach((g, i) => {
    S.titlesOf[g] = all.slice(2 * i, 2 * i + 2);
    S.titlesOf[g].forEach(e => {
      S.titleOf[e] = g;
    });
  });
}
function buildFacts() {
  const F = [];
  tabletSigns(F);
  tabletGlosses(F);
  tabletWards(F);
  tabletPair(F);
  tabletDecoys(F);
  S.facts = shuffle(F).map(f => (chance(PUZ.scribe) ? scribeErr(f) : f));
  S.factKnown = [];
}
const LINE = {
  signIn2: ({ sign: si, in: [r1, r2] }) => oneOf(TX.powers.ifOrIsWaking(si, r1, r2), TX.powers.ifTheHouseOf(si, r1, r2)),
  signOut2: ({ sign: si, out: [r1, r2] }) => oneOf(TX.powers.ifNeitherNorIs(si, r1, r2), TX.powers.ifItIsNot(si, r1, r2)),
  signIn1: ({ sign: si, in: [r] }) => oneOf(TX.powers.ifIsOneOf(si, r), TX.powers.ifIsAmongThe(si, r)),
  signOut1: ({ sign: si, out: [r] }) => oneOf(TX.powers.ifIsNotAmong(si, r), TX.powers.ifWhateverWakesIt(si, r)),
  gname: ({ e: e, g: g }) => oneOf(TX.powers.isOneOfThe(e, g), TX.powers.soTheOldHymns(e, g)),
  geq: ({ e1: e1, e2: e2 }) => oneOf(TX.powers.andAreOnePower(e1, e2), TX.powers.whoeverCallsOnCalls(e1, e2)),
  gneq: ({ e1: e1, e2: e2 }) => __text('isNot'),
  ward: ({ ward: w, sign: si }) => oneOf(TX.powers.bindsOneOfThe(w, si), TX.powers.ifOneOfThe(si, w)),
  wardor: ({ ward: w, refs: pr }) => bi(...TX.powers.wasMadeAgainstOr(w, pr)),
  wref: ({ ward: w, ref: rf }) => oneOf(TX.powers.wasMadeAgainst(w, rf), TX.powers.cannotPass(rf, w)),
  notward: ({ ward: w, ref: rx }) => oneOf(TX.powers.laughsAt(rx, w), TX.powers.hasNoHoldOver(w, rx)),
  wpair: ({ wards: pr, ref: rf }) => bi(...TX.powers.ofTwoThingsOne(rf, pr)),
  decoy: ({ ward: w }) => {
    const [en, rus] = sayPick(TX.powers.noNameWasEver());
    return bi(...TX.powers.bindsNoPowerAt(w, en, rus));
  }
};
const godsOf = f =>
  f.kind === 'sign' || f.kind === 'ward'
    ? S.signPair[f.sign].slice()
    : f.kind === 'gname'
      ? [f.g]
      : f.kind === 'geq' || f.kind === 'gneq'
        ? [...new Set([S.titleOf[f.e1], S.titleOf[f.e2]])]
        : f.kind === 'wardor'
          ? f.refs.map(refGod)
          : f.kind === 'decoy'
            ? []
            : [refGod(f.ref)];
const inscribe = f => Object.assign(f, { gods: godsOf(f), text: LINE[f.form](f) });
function tabletSigns(F) {
  Object.keys(S.signPair).forEach(k => {
    const si = +k,
      pr = shuffle(S.signPair[si]),
      [a, b] = pr,
      [o1, o2] = shuffle(S.gods.filter(g => !pr.includes(g)));
    const add = (form, inn, out) => F.push(inscribe({ kind: 'sign', form: form, sign: si, in: inn, out: out }));
    if (!chance(PUZ.half)) {
      if (chance(PUZ.signIn)) add('signIn2', [refOf(a), refOf(b)], []);
      else add('signOut2', [], [refOf(o1), refOf(o2)]);
    } else if (chance(PUZ.halfIn)) [a, b].forEach(g => add('signIn1', [refOf(g)], []));
    else [o1, o2].forEach(g => add('signOut1', [], [refOf(g)]));
  });
}
function tabletGlosses(F) {
  const gname = (e, g) => F.push(inscribe({ kind: 'gname', form: 'gname', e: e, g: g })),
    geq = (e1, e2) => F.push(inscribe({ kind: 'geq', form: 'geq', e1: e1, e2: e2 })),
    gneq = (e1, e2) => F.push(inscribe({ kind: 'gneq', form: 'gneq', e1: e1, e2: e2 }));
  S.gods.forEach(g => {
    const [e1, e2] = shuffle(S.titlesOf[g]);
    if (chance(PUZ.nameBoth)) {
      gname(e1, g);
      gname(e2, g);
    } else {
      geq(e1, e2);
      gname(pick([e1, e2]), g);
    }
  });
  {
    const all = shuffle(Object.keys(S.titleOf));
    let n = 0;
    for (let i = 0; i < all.length && n < PUZ.apartMax; i++)
      for (let j = i + 1; j < all.length && n < PUZ.apartMax; j++)
        if (S.titleOf[all[i]] !== S.titleOf[all[j]] && chance(PUZ.apart)) {
          gneq(all[i], all[j]);
          n++;
        }
  }
}
function tabletWards(F) {
  const WS = (w, si) => F.push(inscribe({ kind: 'ward', form: 'ward', ward: w, sign: si }));
  S.gods.forEach(g => {
    const w = S.wardOf[g],
      mine = S.signsOf[g],
      partner = si => S.signPair[si].find(x => x !== g);
    const s1 = pick(mine);
    WS(w, s1);
    const r = rand();
    if (r < PUZ.wardLine[0]) WS(w, pick(mine.filter(si => partner(si) !== partner(s1))));
    else if (r < PUZ.wardLine[1]) {
      const pr = shuffle([g, pick(S.gods.filter(y => y !== g && y !== partner(s1)))]).map(refOf);
      F.push(inscribe({ kind: 'wardor', form: 'wardor', ward: w, refs: pr }));
    } else {
      const rf = refOf(g);
      F.push(inscribe({ kind: 'wref', form: 'wref', ward: w, ref: rf }));
    }
    const gx = pick(S.gods.filter(x => x !== g)),
      rx = refOf(gx);
    F.push(inscribe({ kind: 'notward', form: 'notward', ward: w, ref: rx }));
  });
}
function tabletPair(F) {
  if (chance(PUZ.wardPair)) {
    const g = pick(S.gods),
      pr = sayShuffle([S.wardOf[g], pick(S.decoys)]),
      rf = refOf(g);
    F.push(inscribe({ kind: 'wpair', form: 'wpair', wards: pr, ref: rf }));
  }
}
function tabletDecoys(F) {
  S.decoys.forEach(w => {
    F.push(inscribe({ kind: 'decoy', form: 'decoy', ward: w }));
    F.push(inscribe({ kind: 'notward', form: 'notward', ward: w, ref: refOf(pick(S.gods)) }));
  });
}
function scribeErr(f) {
  const other = (g, but = []) => pick(S.gods.filter(x => x !== g && !but.includes(x))),
    wake = f.sign != null ? S.signPair[f.sign] : null,
    asleep = wake ? S.gods.filter(g => !wake.includes(g)) : null,
    gw = f.ward ? S.godOfWard[f.ward] : null,
    e = { ...f, in: f.in && f.in.slice(), out: f.out && f.out.slice(), refs: f.refs && f.refs.slice() };
  if (f.form === 'signIn2' || f.form === 'signIn1') e.in[pick([...e.in.keys()])] = refOf(pick(asleep));
  else if (f.form === 'signOut2' || f.form === 'signOut1') e.out[pick([...e.out.keys()])] = refOf(pick(wake));
  else if (f.form === 'gname') e.g = other(f.g);
  else if (f.form === 'geq') e.e2 = pick(S.titlesOf[other(S.titleOf[f.e1])]);
  else if (f.form === 'gneq') e.e2 = S.titlesOf[S.titleOf[f.e1]].find(x => x !== f.e1);
  else if (f.form === 'ward')
    e.sign = pick(
      Object.keys(S.signPair)
        .map(Number)
        .filter(si => !S.signPair[si].includes(gw))
    );
  else if (f.form === 'wardor') e.refs = f.refs.map(r => (refGod(r) === gw ? refOf(other(gw, f.refs.map(refGod))) : r));
  else if (f.form === 'wref') e.ref = refOf(other(gw));
  else if (f.form === 'notward') {
    if (gw) e.ref = refOf(gw);
    else e.ward = S.wardOf[refGod(f.ref)];
  } else if (f.form === 'wpair') e.ref = refOf(other(refGod(f.ref)));
  else if (f.form === 'decoy') e.ward = pick(S.gods.map(g => S.wardOf[g]));
  return inscribe(Object.assign(e, { scribe: f.text }));
}
const factRefs = f => (f.in || []).concat(f.out || [], f.refs || [], f.ref ? [f.ref] : []);
const factTitles = f => factRefs(f).map(refTitle).filter(Boolean).concat([f.e, f.e1, f.e2].filter(Boolean));
function titlesMet() {
  const out = new Set();
  S.factKnown.forEach(i => factTitles(S.facts[i]).forEach(e => out.add(e)));
  (S.glosses || []).forEach(gl => out.add(gl.e));
  Object.values(S.readings || {}).forEach(r =>
    (r.refs || [])
      .map(refTitle)
      .filter(Boolean)
      .forEach(e => out.add(e))
  );
  return TITLE_IDS.filter(e => out.has(e));
}
const factWards = f => (f.ward ? [f.ward] : []).concat(f.wards || []);
const factsOn = t => S.facts.map((f, i) => i).filter(i => !S.factKnown.includes(i) && speaksOf(S.facts[i], t));
const speaksOf = (f, t) => (t.sign != null ? f.sign === t.sign : t.title ? factTitles(f).includes(t.title) : factWards(f).includes(t.ward));
function learnFact(about, topic, hush = false) {
  const o = about && typeof about === 'object' ? about : { about: about, topic: topic, hush: hush },
    i = readLine(o.about, o.topic, !!o.hush);
  if (i != null) emit('lore');
  return i;
}
const aboutWard = f => factWards(f).includes(S.wardOf[S.patron]);
const aboutPatron = f => f.gods.includes(S.patron) || aboutWard(f);
const hintsPatron = f => aboutPatron(f) && f.gods.length >= 2;
function readLine(g, topic, hush = false) {
  if (topic) {
    const on = factsOn(topic);
    if (on.length) {
      const i = pick(on);
      S.factKnown.push(i);
      return i;
    }
  }
  const unknown = S.facts.map((f, i) => i).filter(i => !S.factKnown.includes(i) && !(hush && aboutWard(S.facts[i])));
  if (!unknown.length) return null;
  const seen = S.omenLog.map(o => o.si),
    met = titlesMet(),
    toPatron = g === S.patron && chance(PUZ.patronLine);
  const rel = toPatron
    ? unknown.filter(i => hintsPatron(S.facts[i]))
    : unknown.filter(i => {
        const f = S.facts[i];
        return (f.sign != null && seen.includes(f.sign)) || factWards(f).some(has) || factTitles(f).some(e => met.includes(e));
      });
  if (toPatron && !rel.length) return null;
  const i = (toPatron || chance(PUZ.rel)) && rel.length ? pick(rel) : pick(unknown);
  S.factKnown.push(i);
  return i;
}
const factP = i => `<p class="lore"><span class="dingir" aria-hidden="true">𒀭</span> ${bi('“', '«')}${S.facts[i].text}${bi('”', '»')}</p>`;
const factsAbout = g => S.factKnown.filter(i => S.facts[i].gods.includes(g)).length;
const GLOSSERS = ['anselm', 'ilse', 'zahrun'];
const titlesToAsk = c => titlesMet().filter(e => !S.glosses.some(gl => gl.by === c.id && gl.e === e));
function glossBy(c, e) {
  const truth = S.titleOf[e],
    other = () => pick(S.gods.filter(x => x !== truth));
  let g = truth;
  if (c.role === 'cult') {
    if (truth === S.patron ? !chance(RULES.readings.cultSlip) : !chance(TP(c).truth)) g = other();
    else S.log.cultTruth++;
  } else if (chance(RULES.readings.mistakeGloss * TP(c).mistake)) g = other();
  const gl = { by: c.id, e: e, g: g, day: S.day };
  S.glosses.push(gl);
  return gl;
}
const glossNote = gl => bi(...TX.powers.is(gl));
function scholarRead(c, w) {
  const key = c.id + ':' + w;
  if (!S.readings[key]) {
    const g = S.godOfWard[w],
      honest = () => (g ? { gods: shuffle([g, pick(S.gods.filter(x => x !== g))]) } : { none: true }),
      wrong = () => ({ gods: shuffle(S.gods.filter(x => x !== g)).slice(0, 2) });
    let r;
    const RD = RULES.readings;
    if (c.role !== 'cult') r = chance(RD.mistakeReading * TP(c).mistake) ? (chance(RD.mistakeNone) ? { none: true } : wrong()) : honest();
    else if (g === S.patron ? chance(RD.cultSlip) : chance(TP(c).truth)) {
      S.log.cultTruth++;
      r = honest();
    } else if (g === S.patron ? chance(RD.hideWard) : chance(RD.cultNone)) r = { none: true };
    else r = wrong();
    if (r.gods) r.refs = r.gods.map(refOf);
    S.readings[key] = { by: c.id, w: w, day: S.day, ...r };
  }
  return S.readings[key];
}
function readingSay(r) {
  if (r.none) return oneOf(TX.powers.thereIsNoBinding(r), TX.powers.noBindingAtAll(r));
  const [a, b] = r.refs;
  return oneOf(TX.powers.thereIsABinding(a, b), TX.powers.aBindingYesAgainst(a, b));
}
const readingNote = r => bi(...TX.powers.binds(r));
