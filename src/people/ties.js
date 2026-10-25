// ===================== TIES: who likes whom, and how far each trusts you =====================
// One machinery for the feelings between people. It owns each one's liking for each other one (S.like, from cannot
// bear, −2, to close, 2), each one's trust in you (c.rapport, from hostile, −2, to devoted, 3, in the casebook's words:
// hostile, strained, reserved, cordial, warm, devoted; S.rap0, as each arrived), who is sweet on whom (S.flirt), whom
// each mourns (S.mourning) and the confidences you have made (S.confided, S.confidedIn). They are dealt once a season
// (deal), moved only through here (shiftLike, moveTrust, setTrust, mourn, comfort, confide), and asked about by level
// (friend, fond, …: RULES.ties), so that "a friend" or "fond of" means one thing everywhere. A person or an id may be
// given wherever one is asked about. Every two of the camp are walked one way, in the list's order (pairs, eachWay).
const Ties = (() => {
  const id = x => (x && x.id) || x,
    level = () => RULES.ties;
  // a's liking for b (0 if none was dealt)
  const likes = (a, b) => {
    const i = id(a);
    return S.like && S.like[i] ? S.like[i][id(b)] || 0 : 0;
  };
  // Père Anselm keeps his vows: never sweet on anyone, nor anyone's romance
  const VOWS = ['anselm'],
    vowed = c => VOWS.includes(id(c));
  // a man and a woman, neither of them the priest: two who could be taken with each other at all
  const mayFlirt = (a, b) => a.id !== b.id && a.p !== b.p && !vowed(a) && !vowed(b);
  // A woman's streak toward you, dealt her, holding while her trust in you does (flirt.trust), wherever she is now (the
  // epilogue: game/fates.js); sweet on you: showing so, she being still at the dig. Sweet on another: the streak dealt
  // toward them, holding while the liking does (flirt.like).
  const drawnToYou = c => !!(S.flirt && S.flirt[c.id] && S.flirt[c.id].you) && c.rapport >= RULES.flirt.trust,
    sweetOnYou = c => drawnToYou(c) && isFree(c),
    sweetOn = (a, b) => !!(S.flirt && S.flirt[id(a)] && S.flirt[id(a)][id(b)]) && likes(a, b) >= RULES.flirt.like;

  // ---------- every two of a list ----------
  // Each pair once, in the list's order: the first with each after it, then the second with each after it, and so on
  // (where each pair throws a die, the order the dice are thrown in); and each way about: each in turn with every
  // other, in the list's order.
  const pairs = list => list.flatMap((a, i) => list.slice(i + 1).map(b => [a, b])),
    eachWay = list => list.flatMap(a => list.filter(b => b !== a).map(b => [a, b]));

  // ---------- dealing, once a season ----------
  // Everyone's liking for everyone else, a pair at a time in the season's order (each way at once, or each its own; the
  // two of the cult a little fonder of each other, by their pact); then each one's trust in you as they arrive, by
  // temperament; then the flirtations: each woman may have a streak toward you, and anyone toward a particular person of
  // the other sex, the priest excepted. (The order is the order of the dice.)
  function deal() {
    S.like = {};
    S.order.forEach(a => {
      S.like[a] = {};
    });
    pairs(S.order).forEach(([a, b]) => {
      const v = +wpick(LIKE_W),
        w = chance(RULES.likes.mutual) ? v : +wpick(LIKE_W),
        pact = cultPair(C(a), C(b)) && chance(RULES.likes.pact) ? 1 : 0;
      S.like[a][b] = Math.min(2, v + pact);
      S.like[b][a] = Math.min(2, w + pact);
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
    // (the talk of you, kept by the gossip: people/social.js)
    S.rumors = [];
    S.pending = [];
    dealFlirts();
    S.mourning = {};
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

  // ---------- moving them ----------
  // a's liking for b, a step (d), as far as cannot bear or close; false if it could not move (people/camp.js)
  function shiftLike(a, b, d) {
    const i = id(a),
      j = id(b);
    if (!S.like || !S.like[i]) return false;
    const v = Math.max(-2, Math.min(2, likes(i, j) + d));
    if (v === likes(i, j)) return false;
    S.like[i][j] = v;
    return true;
  }
  // Someone's trust in you moves a step (d, +1 or −1) if it can: by talk (the chat, rumours, a public moment) never
  // past warm (scale.talkMax: talk alone never makes anyone devoted), by what happens (by 'deed') as far as devoted;
  // down, as far as hostile. True if it moved.
  function moveTrust(c, d, by = 'talk') {
    const top = by === 'deed' ? RULES.scale.trustMax : RULES.scale.talkMax;
    if ((d > 0 && c.rapport >= top) || (d < 0 && c.rapport <= RULES.scale.trustMin)) return false;
    c.rapport += d;
    return true;
  }
  // someone's trust in you set outright (a grudge: game/verdict.js), within the scale
  const setTrust = (c, v) => {
    c.rapport = Math.max(RULES.scale.trustMin, Math.min(RULES.scale.trustMax, v));
  };

  // ---------- grief and confidences ----------
  // Whom someone mourns, and since when ({ day, victim, done: you sat with them }), if anyone; a new grief takes the
  // place of the last (people/social.js, mourners and consoled; game/fates.js). Comforted, they will not forget it: a
  // step of trust, by deed.
  const mourning = c => S.mourning && S.mourning[id(c)];
  function mourn(c, victim) {
    S.mourning[id(c)] = { day: S.day, victim };
  }
  function comfort(c) {
    mourning(c).done = true;
    moveTrust(c, 1, 'deed');
  }
  // Someone takes your confidence, and trusts you a step more for it, by deed (people/dialog.js; the odds:
  // people/social.js, TAKES_CONFIDENCE); how many they have taken; whether you ever confided in them.
  function confide(c) {
    moveTrust(c, 1, 'deed');
    S.confided[c.id] = (S.confided[c.id] || 0) + 1;
    if (!S.confidedIn.includes(c.id)) S.confidedIn.push(c.id);
  }
  const confidences = c => (S.confided && S.confided[id(c)]) || 0,
    confidedIn = c => !!S.confidedIn && S.confidedIn.includes(id(c));

  // ---------- asking about them ----------
  // someone from a pool, leaning toward those the chooser feels strongly about: sign −1 seeks out the disliked, +1 the
  // liked (none from an empty pool, and no die)
  function pickByLike(from, pool, sign) {
    if (!pool.length) return null;
    const w = {};
    pool.forEach(o => {
      w[o.id] = Math.max(RULES.likes.floor, 1 + RULES.likes.pull * sign * likes(from, o));
    });
    return C(wpick(w));
  }
  // What has passed between two of the camp, as far as anyone could see: quarrels between them and feasts they sat
  // through together (game/events.js), how far a suspects b (people/camp.js), and whether either named the other guilty
  // before everyone (S.said: accused, a named b; accusedBy, b named a). An old score colours how someone takes what they
  // hear (people/camp.js, STIRS.scandal).
  function pastBetween(p, q) {
    const a = id(p),
      b = id(q),
      pair = t => (t.about === a && t.verdict === b) || (t.about === b && t.verdict === a),
      named = (x, y) => S.said.some(z => z.by === x && z.about === y && z.verdict === 'cult');
    return {
      quarrels: S.testimony.filter(t => t.kind === 'quarrel' && pair(t)).length,
      feasts: S.testimony.filter(t => t.kind === 'feast' && pair(t)).length,
      suspects: sus(a, b),
      accused: named(a, b),
      accusedBy: named(b, a)
    };
  }
  // every flirtation showing just now among those still at the dig: [who, whom], whom being 'you' or a person's id
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
  // Your friends: those outside the cult still at the dig who trust you warmly or more; your enemies: those outside it
  // still here who have turned against you since the start (someone who never liked you and still does not was not your
  // doing); friends lost: those who trusted you so whom the night took (not one dead by your own hand: game/deed.js).
  // For the ending, and for the cult's reading of you as the season goes (people/cunning.js).
  const friend = c => c.rapport >= level().friend,
    against = c => c.rapport <= level().against;
  const friendsNow = () => freeChars().filter(c => c.role !== 'cult' && friend(c)),
    enemiesNow = () => freeChars().filter(c => c.role !== 'cult' && against(c) && c.rapport < (S.rap0 ? S.rap0[c.id] : 0)),
    friendsLost = () => S.order.map(C).filter(c => c.status === 'taken' && c.takenBy !== 'you' && friend(c));

  return {
    deal,
    pairs,
    eachWay,
    likes,
    trust: c => Math.max(RULES.scale.trustMin, Math.min(RULES.scale.trustMax, c.rapport)),
    shiftLike,
    moveTrust,
    setTrust,
    mourning,
    mourn,
    comfort,
    confide,
    confidences,
    confidedIn,
    pickByLike,
    pastBetween,
    // the levels (RULES.ties): trust in you
    friend,
    cordial: c => c.rapport >= level().cordial, // cordial, or warmer
    against, // strained or hostile
    hostile: c => c.rapport <= level().hostile,
    // ... and one person's liking for another
    fond: (a, b) => likes(a, b) >= level().fond,
    close: (a, b) => likes(a, b) >= level().close,
    dislikes: (a, b) => likes(a, b) <= level().dislike,
    cannotBear: (a, b) => likes(a, b) <= level().cannotBear,
    // who is sweet on whom, as it shows just now (RULES.flirt: the feeling must hold too)
    vowed,
    mayFlirt,
    drawnToYou,
    sweetOnYou,
    sweetOn,
    flirtsNow,
    friendsNow,
    enemiesNow,
    friendsLost
  };
})();
