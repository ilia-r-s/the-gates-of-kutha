let S = null;
const C = id => S.chars[id];
const isFree = c => c.status === 'present';
const freeChars = () => S.order.map(C).filter(isFree);
const castOrder = ids => CHARS.map(c => c.id).filter(id => ids.includes(id));
const freeCult = () => freeChars().filter(c => c.role === 'cult');
const eveningSlot = () => RULES.start.slots - 1,
  atEvening = () => S.slot === eveningSlot();
const has = it => S.items.includes(it);
function gain(it) {
  const had = has(it);
  if (!had) S.items.push(it);
  if (CHARMS.includes(it) && !(S.marksSeen = S.marksSeen || {})[it]) S.marksSeen[it] = readMarks(it);
  if (S.log && CHARMS.includes(it) && !S.log.charms.includes(it)) S.log.charms.push(it);
  if (!had) emit('item');
}
function lose(it) {
  S.items = S.items.filter(x => x !== it);
}
const charmsToFind = () => S.charms.filter(w => !S.log.charms.includes(w));
function dayStamp() {
  return __text('dayOf');
}
function fixMark(c) {
  if (!c.markAt) c.markAt = { mark: c.mark, day: S.day };
}
const markOf = c => (c.markAt ? c.markAt.mark : c.mark);
function backedDown() {
  S.act = null;
  const at = S.day + ':' + S.slot;
  if (S.backAt !== at) S.log.backDown++;
  S.backAt = at;
}
function newGame(name, bg, hardcore = false, seed = null) {
  resetSeasonText();
  const sd = seed == null ? newSeed() : seed >>> 0;
  reseed(sd);
  const dealt = dealParts();
  S = freshSeason(name, bg);
  S.seed = sd;
  S.hardcore = !!hardcore;
  S.nerve = S.nerveMax;
  S.log = freshLog();
  S.act = null;
  S.hurtBy = null;
  dealCast(dealt);
  dealGods();
  S.revealed = {};
  assignClaims();
  Ties.deal();
  Suspicion.deal();
  Moments.deal();
  Gossip.deal();
  Knowledge.deal();
  crane0();
  S.salt = Math.floor(rand() * 2147483648);
  dealWord();
  dealTenor();
  dealYourDreams();
  S.patience = +wpick(RULES.night.low.patience);
  S.turned = {};
  backgroundStart(bg);
  emit('newgame');
}
function freshSeason(name, bg) {
  const R0 = RULES.start,
    drawn = shuffle(PANTHEON).slice(0, 4),
    gods = PANTHEON.filter(g => drawn.includes(g));
  return {
    name: name || 'Marlowe',
    bg: bg,
    day: 1,
    slot: 0,
    slotsToday: R0.slots,
    doom: R0.doom,
    doomMax: R0.doomMax,
    nerveMax: bg === 'occultist' ? R0.nerveOccultist : R0.nerve,
    wounds: 0,
    woundsMax: bg === 'soldier' ? R0.woundsSoldier : R0.wounds,
    gods: gods,
    patron: pick(gods),
    chars: {},
    order: shuffle(CHARS.map(c => c.id)),
    items: bg === 'soldier' ? ['revolver'] : [],
    fragments: bg === 'philologist' ? R0.fragmentsPhilologist : R0.fragments,
    omenSeen: [],
    omenLog: [],
    omenTold: {},
    deathsTold: [],
    clues: [],
    testimony: [],
    journal: [],
    wardAt: {},
    searched: {},
    betrayals: [],
    plots: [],
    sworn: [],
    seerPublic: false,
    inquiryDone: false,
    inquiries: [],
    anger: 0,
    walkout: null,
    strikeDay: null,
    crime: null,
    loc: null,
    here: {},
    ended: null,
    phase: 'intro',
    usedEvents: [],
    stats: { right: 0, wrong: 0, taken: 0 },
    witness: [],
    witnessTold: null,
    witnessNamed: [],
    recantTried: {},
    told: {},
    fin: null
  };
}
function freshLog() {
  return {
    talk: 0,
    about: 0,
    night: 0,
    distrust: 0,
    diary: 0,
    confide: 0,
    press: 0,
    pressedWho: [],
    search: 0,
    study: 0,
    studyCost: 0,
    examine: 0,
    examineOk: 0,
    rest: 0,
    horror: 0,
    dread: 0,
    horrorNerve: 0,
    perils: [],
    broke: null,
    lastOne: null,
    spite: [],
    nerveLost: 0,
    nerveGained: 0,
    woundsTaken: 0,
    healed: 0,
    keptWatch: [],
    backDown: 0,
    inq: 0,
    readings: 0,
    confess: 0,
    cultTruth: 0,
    accused: [],
    refusedInq: [],
    attacks: [],
    guarded: [],
    spared: [],
    quiet: [],
    low: {},
    kept: [],
    brought: [],
    presses: [],
    slips: [],
    ways: [],
    doubts: [],
    visit: null,
    deed: null,
    manner: [],
    walkedOut: null,
    relented: null,
    bus: [],
    staged: [],
    charms: [],
    minNerve: S.nerve
  };
}
function dealParts() {
  const ids = shuffle(CHARS.map(c => c.id)),
    roles = ['cult', 'cult', 'seer', 'warden', 'smuggler', 'bystander', 'bystander'],
    parts = Object.fromEntries(ids.map((id, i) => [id, roles[i]]));
  return { parts: parts, hierophant: pick(ids.filter(id => parts[id] === 'cult')) };
}
function dealCast({ parts: parts, hierophant: hierophant }) {
  const ids = S.order;
  let tr;
  do {
    tr = ids.map(() => ({
      prints: pick(Object.keys(TRAITS.prints.vals)),
      ash: pick(Object.keys(TRAITS.ash.vals)),
      scent: pick(Object.keys(TRAITS.scent.vals))
    }));
  } while (new Set(tr.map(t => t.prints + t.ash + t.scent)).size < ids.length);
  ids.forEach((id, i) => {
    const base = CHARS.find(c => c.id === id);
    S.chars[id] = {
      ...base,
      role: parts[id],
      status: 'present',
      traits: tr[i],
      known: {},
      rapport: 0,
      mark: '?',
      visions: [],
      dreams: [],
      loc: null
    };
  });
  assignTempers();
  S.hierophant = hierophant;
}
function backgroundStart(bg) {
  if (bg === 'occultist') learnFact();
  if (bg === 'philologist') {
    const g = pick(S.gods),
      e = pick(S.titlesOf[g]);
    S.glosses.push({ by: 'you', e: e, g: chance(RULES.study.misremember) ? pick(S.gods.filter(x => x !== g)) : g, day: 1 });
  }
}
function hurt(n, w, why = null) {
  n = vary(n);
  w = vary(w, RULES.scale.graze);
  emit('hurt', n, w);
  const was = [S.nerve, S.wounds];
  S.nerve = Math.max(0, S.nerve - n);
  S.wounds = Math.min(S.woundsMax, S.wounds + w);
  if (S.log) {
    S.log.minNerve = Math.min(S.log.minNerve, S.nerve);
    S.log.nerveLost += was[0] - S.nerve;
    S.log.woundsTaken += S.wounds - was[1];
    S.hurtBy = S.phase === 'night' ? 'night' : S.fin && ['finale', 'descent', 'sanctum'].includes(S.phase) ? 'below' : S.act || 'day';
    if (was[0] > 0 && S.nerve <= 0) S.log.broke = { day: S.day, slot: S.slot, ...(why || { k: S.hurtBy }) };
  }
  const big = RULES.scale.severe,
    s = [],
    r = [];
  if (n) {
    s.push(n >= big ? 'Your nerve frays badly' : 'Your nerve frays');
    r.push(n >= big ? __text('nerveBreakingRu') : __text('nerveShakenRu'));
  }
  if (w) {
    s.push(w >= big ? 'You are badly wounded' : 'You are wounded');
    r.push(w >= big ? __text('woundsSevereRu') : __text('woundedRu'));
  }
  return s.length ? `<p class="loss">${bi(s.join(' · '), r.join(' · '))}</p>` : '';
}
function killYou(by) {
  if (S.log) S.log.woundsTaken += S.woundsMax - S.wounds;
  S.wounds = S.woundsMax;
  S.hurtBy = by;
}
function regain(n) {
  const g = Math.max(0, Math.min(vary(n), S.nerveMax - S.nerve));
  S.nerve += g;
  if (S.log) S.log.nerveGained += g;
  return g;
}
const nerveNote = g =>
  g
    ? `<p class="gain">${g > RULES.scale.severe ? __text('yourNerveSteadiesAGreatDeal') : g === RULES.scale.severe ? __text('yourNerveSteadies') : __text('yourNerveSteadiesALittle')}</p>`
    : '';
function heal() {
  const n = Math.min(S.wounds, vary(RULES.mend.wounds, RULES.scale.graze));
  S.wounds -= n;
  S.log.healed += n;
  return n;
}
function checkEnd() {
  if (S.ended) return true;
  if (S.wounds >= S.woundsMax) {
    ending('death');
    return true;
  }
  if (S.nerve <= 0) {
    ending('madness');
    return true;
  }
  return false;
}
function unknownCats(c) {
  return CATS.filter(k => !c.known[k]);
}
function reveal(c) {
  const cat = pick(unknownCats(c)),
    v = chance(RULES.day.misnote) ? pick(Object.keys(TRAITS[cat].vals).filter(x => x !== c.traits[cat])) : c.traits[cat];
  c.known[cat] = v;
  const see = TRAITS[cat].vals[v].see;
  return bi(fmt(see, { n: c.short }), fmtR(R(see), { n: c }));
}
function clueText(cl) {
  return `<b class="trace">${TRAITS[cl.cat].vals[cl.val].clue}</b>`;
}
function clueTextRu(cl) {
  return `<b class="trace">${R(TRAITS[cl.cat].vals[cl.val].clue)}</b>`;
}
