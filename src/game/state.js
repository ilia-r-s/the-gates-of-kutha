// ===================== THE SEASON: its state, and the small verbs on it =====================
// S holds everything about the game in progress; newGame deals a fresh one. Nothing here draws on the screen.
//   name, bg                        your name and background (philologist, soldier, occultist)
//   day, slot, slotsToday, phase    the calendar, and what the screen is doing (plan, loc, talk, result, inquiry,
//                                   night, finale, descent, sanctum, end); loc, here: where you are, where everyone is;
//                                   visits: where everyone went today (game/day.js); talkId, cv: whom you are talking
//                                   with, and both faces (ui/talk.js)
//   nerve, wounds, doom (+ ...Max)  your condition, and the rite's progress; act, hurtBy: what you are doing, and what
//                                   hurt you last (for the ending)
//   chars{id}, order                the seven: role, status, traits, known (what you took their habits to be),
//                                   rapport (trust in you), mark, markAt (your mark when their part became certain),
//                                   visions, greeted (how they greet you this slot, settled once a slot:
//                                   people/manner.js); order: the seven in a new order each season, so that no one comes
//                                   first by habit (the casebook lists them in the cast's own order: castOrder)
//   temper, like, rap0              temperaments, sympathies, and trust at the start (people/tempers.js, social.js)
//   sus, said, credit, stirs        who suspects whom; what was said before everyone, and whose word has been proven;
//                                   the camp's public moments (people/camp.js); confidedIn: whom you have confided in
//   flirt                           flirtatious streaks dealt at the start (people/flirt.js)
//   witness, witnessTold, witnessNamed   what the thief saw; whom he named last, and everyone he has named;
//                                   witnessMore: whether he would name another he saw (people/thief.js)
//   recantTried                     the day each hidden Dreamer or Watcher last had their chance to come clean to a
//                                   friend (people/claims.js, recantTrust)
//   claim, revealed                 what each claims in Crane's diary; what you know for certain (badges)
//   gods, patron, aspectOf, titlesOf, titleOf, signsOf, signPair, charms, wardOf, wardAt, godOfWard, decoys, marksOf,
//   refOf, facts, factKnown         the season's four powers (of eight) and the one below, the season's six charms (of
//                                   twelve) and the tablets (world/powers.js); glosses, readings, gm; marksSeen: the
//                                   marks you read on each charm as you came by it (gain, below)
//   clues, crime, testimony, journal, nights, claims, sights, rumors, pending    what you have learned, and heard
//                                   (a clue's source: cult, thief, stray: someone's who had been there earlier, or
//                                   plant: an innocent's trace laid by the cult); nights: each night's truth, accounts
//                                   and sightings, and who lied out of fear or kept a secret (people/alibis.js)
//   items, fragments, omenSeen, omenLog, omenTold, searched, usedEvents     (omenTold: the ways each sign was told)
//   told                            how far each list of everyday tellings has been gone through (core/text.js, tellOne)
//   hierophant, alerted, falseGuard, fakeGuard, guardPromise, seerPublic, loud   the cult's game (guardPromise: the
//                                   true Watcher's promise to watch your tent tonight); betrayals:
//                                   the nights one of the cult came for another; patience: how readily it lies low this
//                                   season; turned: how far it has turned its craft against your way of hunting it
//                                   (people/cunning.js)
//   you                             your own dreams: how often, how true, and the dreams (game/yourdreams.js)
//   onYou                           how far the camp suspects you yourself, after the deed (game/deed.js)
//   craneHow, deathsTold            how Crane was found; how the dead were found, Crane among them (world/deaths.js)
//   mourning                        who is grieving whom, since when (people/social.js)
//   tenor                           the season's mood: mood, heat, pull, quiet, log; after (news made likelier by news),
//                                   feud (a quarrel that may flare up again), dust (a shamal's second day) (game/tenor.js)
//   salt                            fixes the choices made without the dice (faces, fates)
//   hardcore                        the casebook keeps only the bare record (chosen in your reply to the Trustees, ui/intro.js)
//   fin                             the descent: named, comp (who is with you), took (who went down with you), left,
//                                   refused, offered, betrayed (a knife at the fourth gate), turned (joined the rite at
//                                   the end), stolen (the ward burned before your eyes), feint (another charm burned in
//                                   its place), enc (between the gates), favour, cause (what hurt you last), acts,
//                                   g1..g3, tries, early
//   romance                         the flirtations that came to more, decided as the season ends (game/fates.js)
//   inquiries, anger, walkout       every inquiry and how the camp voted; the camp's anger at your inquiries (it cools
//                                   overnight); the day it would hold no more (and strikeDay: the diggers' day off after);
//                                   standing: how far each of the camp takes your word (game/verdict.js); inquiryDone,
//                                   inqDay, inqConf: today's inquiry, counted once an evening (game/inquiry.js)
//   log, stats                      what you did, for the ending (backAt: the slot you last thought better of
//                                   something in); ended, endId: how the season ended (game/endings.js)
let S = null;
const C = id => S.chars[id];
const isFree = c => c.status === 'present';
const freeChars = () => S.order.map(C).filter(isFree);
// ids in the cast's own order, as the casebook and the ending list them
const castOrder = ids => CHARS.map(c => c.id).filter(id => ids.includes(id));
const freeCult = () => freeChars().filter(c => c.role === 'cult');
// Your friends: those outside the cult still at the dig who trust you (2 or more); your enemies: those outside it still
// here who have turned against you since the start (someone who never liked you and still does not was not your doing);
// friends lost: those who trusted you whom the night took (not one dead by your own hand: game/deed.js). For the ending,
// and for the cult's reading of you as the season goes (people/cunning.js).
const friendsNow = () => freeChars().filter(c => c.role !== 'cult' && c.rapport >= 2),
  enemiesNow = () => freeChars().filter(c => c.role !== 'cult' && c.rapport <= -1 && c.rapport < (S.rap0 ? S.rap0[c.id] : 0)),
  friendsLost = () => S.order.map(C).filter(c => c.status === 'taken' && c.takenBy !== 'you' && c.rapport >= 2);
const has = it => S.items.includes(it);
function gain(it) {
  const had = has(it);
  if (!had) S.items.push(it);
  if (CHARMS.includes(it) && !(S.marksSeen = S.marksSeen || {})[it]) S.marksSeen[it] = readMarks(it); // (read once, as you come by it)
  if (S.log && CHARMS.includes(it) && !S.log.charms.includes(it)) S.log.charms.push(it);
  if (!had) emit('item');
}
function lose(it) {
  S.items = S.items.filter(x => x !== it);
}
// the charms you have yet to come by, wherever they lie (once had, a charm is not found again)
const charmsToFind = () => S.charms.filter(w => !S.log.charms.includes(w));
function dayStamp() {
  return bi(`Day ${S.day} of ${RULES.start.days} · ${SLOT_NAMES[S.slot]}`, ru.dayStamp());
}
// Your mark on someone stands as it was the moment their part became certain (exposed, sent away, taken by the night,
// revealed, or the descent begun): what you mark afterwards is hindsight, and the reckoning does not count it.
function fixMark(c) {
  if (!c.markAt) c.markAt = { mark: c.mark, day: S.day };
}
const markOf = c => (c.markAt ? c.markAt.mark : c.mark); // the mark the reckoning counts
function journal(t) {
  S.journal.push({ day: S.day, t });
}
// you thought better of it (a talk, a translation, an inquiry): counted once a slot, however often you turn back
function backedDown() {
  const at = S.day + ':' + S.slot;
  if (S.backAt !== at) S.log.backDown++;
  S.backAt = at;
}
// A new season, dealt in this order (the dice are thrown in this order): the parts, first of all (dealParts); the
// powers and the one below (freshSeason); the cast's habits and temperaments (dealCast); the powers' signs, wards and
// titles, and the tablets (dealGods); what people claim (assignClaims), whom they like (assignLikes; campInit throws
// none), the flirtations (assignFlirts); what your background gives you (backgroundStart); the night Crane died
// (crane0); the salt that fixes the choices made without the dice; how far each of the camp takes your word (dealWord,
// by the salt); the season's mood (dealTenor); your own dreams (dealYourDreams); and the cult's patience.
// hardcore: the casebook keeps only the bare record, with nothing joined up for you (ui/book.js)
function newGame(name, bg, hardcore = false) {
  const dealt = dealParts();
  S = freshSeason(name, bg);
  S.hardcore = !!hardcore;
  S.nerve = S.nerveMax;
  S.log = freshLog();
  S.act = null;
  S.hurtBy = null;
  dealCast(dealt);
  dealGods();
  S.revealed = {};
  assignClaims();
  assignLikes();
  campInit();
  assignFlirts();
  backgroundStart(bg);
  crane0();
  S.salt = Math.floor(rand() * 2147483648);
  dealWord();
  dealTenor();
  dealYourDreams();
  S.patience = +wpick(RULES.night.low.patience); // (how readily the cult lies low this season: people/cunning.js, liesLow)
  S.turned = {}; // (how far the cult has turned its craft against your way of hunting it: people/cunning.js, cultTurns)
  S.onYou = 0; // (how far the camp suspects you yourself, after the deed: game/deed.js)
  emit('newgame');
}
// The season before anything else is dealt: the clock, your nerve, wounds, kit and fragments by background, the power
// below, and empty notebooks. state.js's header says what each field is for.
function freshSeason(name, bg) {
  const R0 = RULES.start,
    drawn = shuffle(PANTHEON).slice(0, 4), // four powers a season: the tablets' puzzle is built for four (world/powers.js)
    gods = PANTHEON.filter(g => drawn.includes(g)); // (in an order that tells nothing)
  return {
    name: name || 'Marlowe',
    bg,
    day: 1,
    slot: 0,
    slotsToday: R0.slots,
    doom: R0.doom,
    doomMax: R0.doomMax,
    nerveMax: bg === 'occultist' ? R0.nerveOccultist : R0.nerve,
    wounds: 0,
    woundsMax: bg === 'soldier' ? R0.woundsSoldier : R0.wounds,
    gods,
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
    alerted: false,
    betrayals: [],
    falseGuard: null,
    guardPromise: null,
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
// How the season is played, counted for the ending and the debrief.
function freshLog() {
  return {
    talk: 0, // conversations; and the questions counted (people/dialog.js, ASKED_COUNTED)
    about: 0,
    night: 0,
    distrust: 0,
    diary: 0,
    confide: 0,
    press: 0,
    pressedWho: [], // whom you pressed (people/dialog.js), for what became of them
    search: 0,
    study: 0,
    studyCost: 0,
    examine: 0,
    examineOk: 0,
    rest: 0,
    horror: 0,
    dread: 0,
    horrorNerve: 0, // nerve the horrors took (searching, and of their own accord)
    perils: [], // the dig's own dangers that hurt you: { day, k (where, or the heat), w (wounds) } (game/hazards.js)
    spite: [], // harm done you in secret: { day, id, kind, ok, caught, it }
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
    attacks: [], // the nights something came for you: { day, how, power: the power below, come by itself } (game/night.js)
    guarded: [],
    spared: [],
    quiet: [],
    low: {}, // why the cult lay low, by night, when it had a reason (people/cunning.js, liesLow)
    kept: [], // the mornings someone said they had seen someone off from your tent: { day, id }
    visit: null, // someone who came to your tent as the evening ended (people/visit.js): { id, day, agreed, ... }
    deed: null, // the night you went out yourself (game/deed.js): { day, id, means, plant, outcome, ... }
    manner: [],
    walkedOut: null, // the day the camp first walked out on your inquiries (game/verdict.js), whether or not it relented
    relented: null,
    bus: [],
    staged: [],
    charms: [],
    minNerve: S.nerve
  };
}
// The cast: seven people shuffled into the parts (two of the cult, the Dreamer, the Watcher, the smuggler and two
// bystanders), no two leaving the same traces; their temperaments; and which of the cult is the hierophant. Who claims
// what is theirs to decide, the cult's as anyone's (people/claims.js).
// The seven parts, dealt before anything else in the season and by nothing but chance, a fair shuffle of the cast: two
// of the cult (and which of the two leads it), the Dreamer, the Watcher, the thief, and two who are only themselves.
// Any two of the seven may be the cult, each pair as likely as any other; nothing about anyone weighs on it.
function dealParts() {
  const ids = shuffle(CHARS.map(c => c.id)),
    roles = ['cult', 'cult', 'seer', 'warden', 'smuggler', 'bystander', 'bystander'],
    parts = Object.fromEntries(ids.map((id, i) => [id, roles[i]]));
  return { parts, hierophant: pick(ids.filter(id => parts[id] === 'cult')) };
}
// The cast, with the parts already dealt: everyone's habits (no two alike in all three), then their temperaments.
function dealCast({ parts, hierophant }) {
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
    S.chars[id] = { ...base, role: parts[id], status: 'present', traits: tr[i], known: {}, rapport: 0, mark: '?', visions: [], loc: null };
  });
  assignTempers();
  S.hierophant = hierophant;
}
// What your background gives you to begin with, beyond the numbers: the occultist knows one thing about the powers
// already, the philologist one of their titles (misremembered, now and then: study.misremember; the ending tells it).
function backgroundStart(bg) {
  if (bg === 'occultist') learnFact();
  if (bg === 'philologist') {
    const g = pick(S.gods),
      e = pick(S.titlesOf[g]);
    S.glosses.push({ by: 'you', e, g: chance(RULES.study.misremember) ? pick(S.gods.filter(x => x !== g)) : g, day: 1 });
  }
}

// ---------- harm, and the end of it ----------
function hurt(n, w) {
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
  }
  // told in words, never in numbers: the meters show how much (and a great loss is told as one)
  const big = RULES.scale.severe,
    s = [],
    r = [];
  if (n) {
    s.push(n >= big ? 'Your nerve frays badly' : 'Your nerve frays');
    r.push(n >= big ? 'Нервы сильно сдают' : 'Нервы сдают');
  }
  if (w) {
    s.push(w >= big ? 'You are badly wounded' : 'You are wounded');
    r.push(w >= big ? 'Вы тяжело ранены' : 'Вы ранены');
  }
  return s.length ? `<p class="loss">${bi(s.join(' · '), r.join(' · '))}</p>` : '';
}
// the night takes you outright (by: what did it, for the ending): no wound to spare (game/endings.js tells it)
function killYou(by) {
  if (S.log) S.log.woundsTaken += S.woundsMax - S.wounds;
  S.wounds = S.woundsMax;
  S.hurtBy = by;
}
// nerve coming back (a rest, a drink, good news), up to the most you can hold; returns how much came back
function regain(n) {
  const g = Math.max(0, Math.min(vary(n), S.nerveMax - S.nerve));
  S.nerve += g;
  if (S.log) S.log.nerveGained += g;
  return g;
}
// nerve that came back, in words: a little, some (RULES.scale.severe), or a great deal; nothing, if none did
const nerveNote = g =>
  g
    ? `<p class="gain">${
        g > RULES.scale.severe
          ? bi('Your nerve steadies a great deal', 'Нервы заметно успокаиваются')
          : g === RULES.scale.severe
            ? bi('Your nerve steadies', 'Нервы успокаиваются')
            : bi('Your nerve steadies a little', 'Нервы немного успокаиваются')
      }</p>`
    : '';
// wounds seen to (by a doctor passing through): one, as a rule (RULES.scale.graze); how many were
function heal() {
  const n = Math.min(S.wounds, vary(1, RULES.scale.graze));
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

// ---------- traits, traces and testimony ----------
function unknownCats(c) {
  return CATS.filter(k => !c.known[k]);
}
// One of someone's habits you had not noted, noted now (known: what you took it to be): theirs, but for now and then
// (RULES.day.misnote) one that was only that day's, a borrowed pair of boots, a cadged cigarette (the ending tells it).
function reveal(c) {
  const cat = pick(unknownCats(c)),
    v = chance(RULES.day.misnote) ? pick(Object.keys(TRAITS[cat].vals).filter(x => x !== c.traits[cat])) : c.traits[cat];
  c.known[cat] = v;
  const see = TRAITS[cat].vals[v].see;
  return bi(fmt(see, { n: c.short }), fmtR(R(see), { n: c }));
}
// a trace seen not to be the attacker's: a thief's, someone's who passed earlier, or planted
const notAttackers = cl => cl.status === 'thief' || cl.status === 'stray' || cl.status === 'planted';
function clueText(cl) {
  return `<b class="trace">${TRAITS[cl.cat].vals[cl.val].clue}</b>`;
}
function clueTextRu(cl) {
  return `<b class="trace">${R(TRAITS[cl.cat].vals[cl.val].clue)}</b>`;
}
// A trace: of its owner's habit, but for now and then (examine.smudge) one that was not theirs, a borrowed pair of boots,
// a cadged cigarette, as they were that night (the ending tells it).
function addClue(o) {
  emit('clue');
  const own = C(o.owner).traits[o.cat],
    smudged = chance(RULES.examine.smudge),
    cl = { id: S.clues.length, day: S.day, ...o, val: smudged ? pick(Object.keys(TRAITS[o.cat].vals).filter(v => v !== own)) : own };
  if (smudged) cl.smudged = own;
  S.clues.push(cl);
  return cl;
}
function addTest(from, about, kind, verdict) {
  if (S.testimony.some(t => t.from === from && t.about === about && t.kind === kind && t.verdict === verdict)) return;
  S.testimony.push({ day: S.day, from, about, kind, verdict });
}
