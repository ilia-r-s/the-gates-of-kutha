// people/alibis.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const QUIET = ['canal', 'cemetery', 'ziggurat', 'trench'];
function planAlibis(n, crimeLoc, actorId, target = null, how = 'watch') {
  const rec = { crimeLoc: crimeLoc, actor: actorId, truth: {}, claim: {}, saw: {}, afraid: [], secret: [] };
  const gid = guestOn(n),
    guest = gid ? C(gid) : null,
    npcs = freeChars().filter(c => c !== guest),
    saved = npcs.find(c => c.id === target) || null,
    rest = npcs.filter(c => c !== saved),
    cult = rest.filter(c => c.role === 'cult'),
    smug = rest.find(c => c.role === 'smuggler'),
    inno = rest.filter(c => c.role !== 'cult' && c.role !== 'smuggler'),
    loose = rest.filter(c => c.role !== 'warden' && c.role !== 'smuggler'),
    crime = !!crimeLoc,
    out = crime && crimeLoc !== 'camp',
    toward = crimeLoc === 'camp' ? (how === 'away' && target && target !== 'player' ? target : 'player') : null,
    A = RULES.alibis;
  const attacked = (c, you = false) => {
    rec.truth[c.id] = rec.claim[c.id] = { loc: crimeLoc, with: null, attacked: true, how: how, ...(you ? { you: you } : {}) };
    if (actorId && !(you && how === 'watch') && chance(A.glimpse))
      rec.saw[c.id] = { who: actorId, cat: pick(CATS), where: crimeLoc, to: toward };
  };
  if (saved) attacked(saved);
  if (guest) {
    if (guest.id === target && how !== 'away') attacked(guest, true);
    else {
      rec.truth[guest.id] = { loc: guest.id === actorId ? crimeLoc : 'camp', with: null };
      rec.claim[guest.id] = chance(A.evadeNight) ? { loc: 'evade', with: null } : { loc: 'camp', with: null, you: true };
    }
  }
  if (smug) rec.truth[smug.id] = { loc: chance(A.smugglerIn) ? 'camp' : chance(A.smugglerStore) ? 'store' : 'canal', with: null };
  rest
    .filter(c => c.role !== 'smuggler')
    .forEach(c => {
      rec.truth[c.id] = { loc: c.role === 'warden' ? 'camp' : wpick(A.where), with: null };
    });
  const elsewhere = Object.fromEntries(Object.entries(A.where).filter(([k]) => !out || k !== crimeLoc));
  const lovers = trystOf(loose.filter(c => c.id !== actorId));
  if (lovers && chance(A.tryst)) {
    const L = pick(QUIET.filter(q => q !== crimeLoc));
    lovers.forEach((c, i) => {
      rec.truth[c.id] = { loc: L, with: lovers[1 - i].id };
      if (temperOf(c) !== 'honest' && chance(A.hide)) rec.secret.push(c.id);
    });
  }
  const pair = shuffle(loose.filter(c => !rec.truth[c.id].with));
  if (pair.length >= 2 && chance(A.pair)) {
    const a = pair[0],
      b = companyFor(a, pair.slice(1)),
      L = wpick(elsewhere);
    rec.truth[a.id] = { loc: L, with: b.id };
    rec.truth[b.id] = { loc: L, with: a.id };
  }
  if (out)
    loose.forEach(c => {
      if (!rec.truth[c.id].with && chance(A.astray)) rec.truth[c.id] = { loc: crimeLoc, with: null, astray: true };
    });
  const named = [];
  rest
    .filter(c => c.role !== 'smuggler')
    .forEach(c => {
      const t = rec.truth[c.id],
        fib = 1 - TP(c).truth;
      if (rec.secret.includes(c.id)) rec.claim[c.id] = { loc: 'camp', with: null };
      else if (chance(A.evadeNight)) rec.claim[c.id] = { loc: 'evade', with: null };
      else if (!t.with && t.loc !== 'camp' && chance(fib * (t.loc === crimeLoc ? A.fear : A.alibi))) {
        rec.claim[c.id] = { loc: 'camp', with: null };
        if (c.id !== actorId) rec.afraid.push(c.id);
        if (chance(A.fearFriend)) named.push(c);
      } else
        rec.claim[c.id] = chance(TP(c).lieSmall)
          ? t.with
            ? { loc: 'camp', with: null }
            : { loc: t.loc === 'camp' ? 'village' : 'camp', with: null }
          : t;
    });
  if (smug) {
    const truth = { loc: rec.truth[smug.id].loc, with: null },
      evade = {
        loc: 'evade',
        with: null
      };
    rec.claim[smug.id] =
      temperOf(smug) === 'honest'
        ? chance(A.thiefTruthHonest)
          ? truth
          : evade
        : chance(A.thiefTruth)
          ? truth
          : chance(A.thiefEvade)
            ? evade
            : { loc: 'camp', with: null };
    if (actorId && crime && out && chance(A.thiefMentions)) rec.saw[smug.id] = { who: actorId, cat: pick(CATS), where: crimeLoc };
  }
  cult.forEach(c => {
    if (crime && inno.length && chance(A.frame * TP(c).frame))
      rec.saw[c.id] = { who: Ties.pickByLike(c, inno, -1).id, cat: pick(CATS), where: crimeLoc, to: toward };
  });
  named.forEach(c => {
    const pool = rest.filter(o => o.id !== c.id);
    if (!pool.length) return;
    const f = companyFor(c, pool),
      L = wpick(elsewhere);
    rec.claim[c.id] = { loc: L, with: f.id };
    if (f.role === 'cult' ? chance(A.cultCover) : backs(f, c)) rec.claim[f.id] = { loc: L, with: c.id };
  });
  const about = loose.filter(c => out && c.id !== actorId && rec.truth[c.id].loc === crimeLoc);
  inno.forEach(c => {
    const t = rec.truth[c.id];
    if (!chance(t.loc === 'camp' ? A.sawFromCamp : A.sawOut)) return;
    let sw;
    if (smug && rec.truth[smug.id].loc === t.loc && chance(A.sawSmuggler))
      sw = { who: smug.id, cat: pick(CATS), where: t.loc, ...(t.loc === 'camp' ? { to: 'tents' } : {}) };
    else if (!crime) return;
    else {
      const w = actorId ? { [actorId]: 1 } : {};
      about.filter(o => o.id !== c.id && o.id !== t.with).forEach(o => (w[o.id] = A.seenAstray));
      if (!Object.keys(w).length) return;
      sw = { who: wpick(w), cat: pick(CATS), where: crimeLoc, to: toward };
    }
    if (chance(TP(c).mistake)) sw.val = pick(Object.keys(TRAITS[sw.cat].vals).filter(v => v !== C(sw.who).traits[sw.cat]));
    rec.saw[c.id] = sw;
  });
  inno.forEach(c => {
    if (!crime || rec.saw[c.id]) return;
    const pool = rest.filter(o => o.id !== c.id),
      t = pick([Suspicion.mostSuspected(c, pool), ...pool.filter(o => Ties.cannotBear(c.id, o.id))].filter(Boolean));
    if (t && chance(A.invent * TP(c).frame)) rec.saw[c.id] = { who: t.id, cat: pick(CATS), where: crimeLoc, made: true, to: toward };
  });
  if (!crime) Object.values(rec.claim).forEach(cl => (cl.calm = true));
  rec.thiefSeen = smug ? inno.filter(c => rec.saw[c.id] && !rec.saw[c.id].made && rec.saw[c.id].who === smug.id).map(c => c.id) : [];
  cult.forEach(c => {
    const t = rec.truth[c.id];
    if (smug && t && rec.truth[smug.id].loc === t.loc && chance(t.loc === 'camp' ? A.sawFromCamp : A.sawOut) && chance(A.sawSmuggler))
      rec.thiefSeen.push(c.id);
  });
  S.nights[n] = rec;
}
function companyFor(a, pool) {
  const w = {};
  pool.forEach(o => {
    w[o.id] = Math.max(RULES.likes.floor, 1 + RULES.likes.pull * Ties.likes(a.id, o.id));
  });
  return C(wpick(w));
}
const wasAbout = (rec, id) =>
  rec.crimeLoc !== 'camp' && id !== rec.target && id !== rec.actor && !!rec.truth[id] && rec.truth[id].loc === rec.crimeLoc;
function backs(p, c) {
  const l = Ties.likes(p.id, c.id),
    A = RULES.alibis;
  return chance(l >= 2 ? A.cover : l === 1 ? A.cover * A.coverLike : TP(p).mistake);
}
function trystOf(pool) {
  const pairs = Ties.eachWay(pool).filter(
    ([a, b]) =>
      a.id < b.id &&
      !cultPair(a, b) &&
      Ties.mayFlirt(a, b) &&
      (Ties.sweetOn(a.id, b.id) || Ties.sweetOn(b.id, a.id)) &&
      Ties.fond(a.id, b.id) &&
      Ties.fond(b.id, a.id)
  );
  return pick(pairs) || null;
}
const sawVal = sw => sw.val || C(sw.who).traits[sw.cat];
function crane0() {
  S.nights = [];
  S.claims = [];
  S.sights = [];
  planAlibis(0, 'ziggurat', S.hierophant);
  S.nights[0].target = 'crane';
  sceneTrace(0, 'ziggurat', C(S.hierophant), 'crane');
  S.craneHow = craneDeath();
  dreamsOfTheNight(0);
}
function alibiLine(cl, c, saw = false, up = null) {
  const w = cl.with && S.chars[cl.with] ? C(cl.with).short : null,
    wr = w ? ru.c(cl.with, 'i') : null;
  if (cl.you)
    return cl.attacked
      ? cl.how === 'luck'
        ? bi(...TX.alibis.youKnowWhereI(c))
        : bi(...TX.alibis.youKnowWhereI2(c))
      : bi(...TX.alibis.youKnowVeryWell(c));
  if (cl.attacked) return bi(...TX.alibis.youKnowWhereI3(cl, saw, c));
  if (cl.loc === 'evade') return c.role === 'smuggler' ? __text('outWhereIsMyOwnAffair') : bi(...TX.alibis.whereIWasIs(c));
  if (cl.loc === 'camp' && !w && claimOf(c).role === 'warden') return bi(...TX.alibis.upWithALamp(c));
  switch (cl.loc) {
    case 'village':
      return w ? bi(...TX.alibis.atTheCoffeeHouse(w, wr)) : bi(...TX.alibis.atTheCoffeeHouse2(c));
    case 'store':
      return w ? bi(...TX.alibis.inTheFindsMagazine(w, wr)) : bi(...TX.alibis.inTheFindsMagazine2(c));
    case 'canal':
      return w ? bi(...TX.alibis.walkingByTheCanal(w, wr, c, cl)) : bi(...TX.alibis.iWalkedAlongThe(c));
    case 'trench':
      return w ? bi(...TX.alibis.downInTrenchB(w, wr)) : bi(...TX.alibis.downInTrenchB2(c));
    case 'ziggurat':
      return w ? bi(...TX.alibis.upOnTheZiggurat(w, wr)) : bi(...TX.alibis.upOnTheZiggurat2(c));
    case 'cemetery':
      return w ? bi(...TX.alibis.outByTheParthian(w, wr)) : bi(...TX.alibis.outByTheParthian2());
    default: {
      if (w) return bi(...TX.alibis.inTheMessTent(w, wr));
      const k = (up == null ? c.role === 'warden' && watcherSpeaks(c) : up) ? 2 : saw || cl.calm ? pick([0, 2]) : pick([0, 1, 2]);
      return bi(...tellOne('inCamp-' + k, SAY.inCamp[k])(c));
    }
  }
}
const upAllNight = (cl, c) =>
  cl.loc === 'camp' &&
  !cl.with &&
  (claimOf(c).role === 'warden' || (c.role === 'warden' ? watcherSpeaks(c) : chance(RULES.alibis.upAnyway)));
const watcherSpeaks = c => chance(temperOf(c) === 'honest' ? RULES.scale.surest : RULES.alibis.watcherWords);
function sightLine(cl, sw, c, up = null) {
  const v = sawVal(sw),
    home = sw.where === 'camp',
    hers = home && sw.to && S.chars[sw.to] ? sw.to : null,
    where = hers ? `${C(hers).short}’s tent` : home ? 'your tent' : LOCS[sw.where].ref,
    wr = hers ? __text('g') : home ? __text('text') : ru.loc(sw.where, 'gen');
  const sense = sw.cat === 'prints' ? ru.gs(c, __text('text2'), __text('text3')) : ru.gs(c, __text('text4'), __text('text5')),
    [nf, nfRu] = tellOne('noFace', SAY.noFace)(c);
  if (cl.attacked) return __text('but');
  const awake = up == null ? upAllNight(cl, c) : up;
  if (home && sw.to === 'tents')
    return awake
      ? bi(...TX.alibis.aroundTwoSomeoneWas(nf, sw, v, nfRu, sense))
      : cl.loc === 'camp'
        ? bi(...TX.alibis.iWokeAroundTwo(nf, sw, v, c, nfRu, sense))
        : bi(...TX.alibis.onTheWayBack(sw, v, sense));
  if (awake) return bi(...TX.alibis.aroundTwoSomeoneWent(where, nf, sw, v, wr, nfRu, sense));
  return cl.loc === 'camp'
    ? bi(...TX.alibis.iWokeAroundTwo2(where, nf, sw, v, c, wr, nfRu, sense))
    : bi(...TX.alibis.onTheWayBack2(where, sw, v, wr, sense));
}
