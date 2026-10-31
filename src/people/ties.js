// Trust, sympathies, grief, hounding and relationships.
const Ties = (() => {
  const id = x => (x && x.id) || x,
    level = () => RULES.ties;
  const likes = (a, b) => {
    const i = id(a);
    return S.like && S.like[i] ? S.like[i][id(b)] || 0 : 0;
  };
  const hounded = c => (S.hounded && S.hounded[id(c)]) || 0;
  function hound(c, n) {
    S.hounded = S.hounded || {};
    S.hounded[id(c)] = Math.max(0, hounded(c) + n);
  }
  function easeHounding() {
    Object.keys(S.hounded || {}).forEach(k => {
      S.hounded[k] = Math.max(0, S.hounded[k] - RULES.hound.ease);
    });
  }
  const VOWS = ['anselm'],
    vowed = c => VOWS.includes(id(c));
  const mayFlirt = (a, b) => a.id !== b.id && a.p !== b.p && !vowed(a) && !vowed(b);
  const drawnToYou = c => !!(S.flirt && S.flirt[c.id] && S.flirt[c.id].you) && c.rapport >= RULES.flirt.trust,
    sweetOnYou = c => drawnToYou(c) && isFree(c),
    sweetOn = (a, b) => !!(S.flirt && S.flirt[id(a)] && S.flirt[id(a)][id(b)]) && likes(a, b) >= RULES.flirt.like;
  const pairs = list => list.flatMap((a, i) => list.slice(i + 1).map(b => [a, b])),
    eachWay = list => list.flatMap(a => list.filter(b => b !== a).map(b => [a, b]));
  function deal() {
    S.like = {};
    S.hounded = {};
    S.order.forEach(a => {
      S.like[a] = {};
    });
    pairs(S.order).forEach(([a, b]) => {
      const v = +wpick(LIKE_W),
        w = chance(RULES.likes.mutual) ? v : +wpick(LIKE_W);
      S.like[a][b] = v;
      S.like[b][a] = w;
    });
    S.rap0 = {};
    S.order.forEach(i => {
      const c = C(i),
        t = TP(c);
      let r = +wpick(RULES.likes.toYou);
      if (chance(t.warm)) r++;
      if (chance(t.sour)) r--;
      c.rapport = Math.max(RULES.scale.trustMin, Math.min(RULES.scale.talkMax, r));
      S.rap0[i] = c.rapport;
    });
    dealFlirts();
    S.mourning = {};
    S.comforted = {};
    S.confided = {};
    S.confidedIn = [];
  }
  function dealFlirts() {
    const F = RULES.flirt;
    S.flirt = {};
    S.order.forEach(a => {
      const me = C(a),
        f = (S.flirt[a] = { you: me.p === 'she' && chance(F.you) });
      if (vowed(a)) return;
      S.order.forEach(b => {
        if (b !== a && C(b).p !== me.p) f[b] = chance(F.pair);
      });
    });
  }
  function shiftLike(a, b, d) {
    const i = id(a),
      j = id(b);
    if (!S.like || !S.like[i]) return false;
    const v = Math.max(-2, Math.min(2, likes(i, j) + d));
    if (v === likes(i, j)) return false;
    S.like[i][j] = v;
    return true;
  }
  function moveTrust(c, d, by = 'talk') {
    const top = by === 'deed' ? RULES.scale.trustMax : RULES.scale.talkMax;
    if ((d > 0 && c.rapport >= top) || (d < 0 && c.rapport <= RULES.scale.trustMin)) return false;
    c.rapport += d;
    return true;
  }
  const setTrust = (c, v) => {
    c.rapport = Math.max(RULES.scale.trustMin, Math.min(RULES.scale.trustMax, v));
  };
  const mourning = c => S.mourning && S.mourning[id(c)];
  function mourn(c, victim) {
    S.mourning[id(c)] = { day: S.day, victim: victim };
  }
  function comfort(c) {
    const m = mourning(c);
    m.done = true;
    (S.comforted[id(c)] = S.comforted[id(c)] || []).push(m.victim);
    moveTrust(c, 1, 'deed');
  }
  const comforted = c => (S.comforted && S.comforted[id(c)]) || [];
  function confide(c) {
    moveTrust(c, 1, 'deed');
    S.confided[c.id] = (S.confided[c.id] || 0) + 1;
    if (!S.confidedIn.includes(c.id)) S.confidedIn.push(c.id);
  }
  const confidences = c => (S.confided && S.confided[id(c)]) || 0,
    confidedIn = c => !!S.confidedIn && S.confidedIn.includes(id(c));
  function pickByLike(from, pool, sign) {
    if (!pool.length) return null;
    const w = {};
    pool.forEach(o => {
      w[o.id] = Math.max(RULES.likes.floor, 1 + RULES.likes.pull * sign * likes(from, o));
    });
    return C(wpick(w));
  }
  function pastBetween(p, q) {
    const a = id(p),
      b = id(q),
      pair = t => (t.about === a && t.verdict === b) || (t.about === b && t.verdict === a);
    return {
      quarrels: S.testimony.filter(t => t.kind === 'quarrel' && pair(t)).length,
      feasts: S.testimony.filter(t => t.kind === 'feast' && pair(t)).length,
      suspects: Suspicion.level(a, b),
      accused: Suspicion.named(a, b),
      accusedBy: Suspicion.named(b, a)
    };
  }
  function flirtsNow() {
    const out = [];
    freeChars().forEach(a => {
      if (sweetOnYou(a)) out.push([a.id, 'you']);
      freeChars().forEach(b => {
        if (b.id !== a.id && sweetOn(a.id, b.id)) out.push([a.id, b.id]);
      });
    });
    return out;
  }
  const friend = c => c.rapport >= level().friend,
    against = c => c.rapport <= level().against;
  const friendsNow = () => freeChars().filter(c => c.role !== 'cult' && friend(c)),
    enemiesNow = () => freeChars().filter(c => c.role !== 'cult' && against(c) && c.rapport < (S.rap0 ? S.rap0[c.id] : 0)),
    friendsLost = () => S.order.map(C).filter(c => c.status === 'taken' && c.takenBy !== 'you' && friend(c));
  return {
    deal: deal,
    pairs: pairs,
    eachWay: eachWay,
    likes: likes,
    hounded: hounded,
    hound: hound,
    easeHounding: easeHounding,
    trust: c => Math.max(RULES.scale.trustMin, Math.min(RULES.scale.trustMax, c.rapport)),
    shiftLike: shiftLike,
    moveTrust: moveTrust,
    setTrust: setTrust,
    mourning: mourning,
    mourn: mourn,
    comfort: comfort,
    comforted: comforted,
    confide: confide,
    confidences: confidences,
    confidedIn: confidedIn,
    pickByLike: pickByLike,
    pastBetween: pastBetween,
    friend: friend,
    cordial: c => c.rapport >= level().cordial,
    against: against,
    hostile: c => c.rapport <= level().hostile,
    fond: (a, b) => likes(a, b) >= level().fond,
    close: (a, b) => likes(a, b) >= level().close,
    dislikes: (a, b) => likes(a, b) <= level().dislike,
    cannotBear: (a, b) => likes(a, b) <= level().cannotBear,
    vowed: vowed,
    mayFlirt: mayFlirt,
    drawnToYou: drawnToYou,
    sweetOnYou: sweetOnYou,
    sweetOn: sweetOn,
    flirtsNow: flirtsNow,
    friendsNow: friendsNow,
    enemiesNow: enemiesNow,
    friendsLost: friendsLost
  };
})();
