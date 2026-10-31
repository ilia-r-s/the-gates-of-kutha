// game/fates.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const fateOf = (a, ...k) => hashPick(a, S.salt, ...k);
const fateRoll = (...k) => hash01(S.salt, ...k);
const sayFate = (line, ...about) => bi(...(typeof line === 'function' ? line(...about) : line));
const endPortrait = cid => portrait(cid, 'neutral', 0, `end-${cid}-`);
function romances() {
  const RF = RULES.flirt.romance,
    ok = c => c.status === 'present' && c.role !== 'cult',
    free = c => !Ties.vowed(c),
    people = S.order.map(C),
    out = { you: null, pairs: [], mourn: [] };
  const v = S.log.visit,
    stayed = c => !!v && v.agreed && v.id === c.id && !v.struck,
    her = people.filter(c => ok(c) && Ties.drawnToYou(c)).sort((a, b) => stayed(b) - stayed(a) || b.rapport - a.rapport)[0];
  if (
    her &&
    fateRoll(her.id, 'love') <
      RF.you[Math.min(RULES.scale.trustMax, her.rapport) - RULES.flirt.trust] + (stayed(her) ? RULES.visit.love : 0)
  )
    out.you = her.id;
  const spoken = new Set(out.you ? [out.you] : []),
    both = f =>
      Ties.pairs(people).forEach(([a, b]) => {
        const ab = Ties.sweetOn(a.id, b.id),
          ba = Ties.sweetOn(b.id, a.id);
        if ((ab || ba) && free(a) && free(b)) f(a, b, ab, ba);
      });
  both((a, b, ab, ba) => {
    if (!ok(a) || !ok(b) || Math.min(Ties.likes(a.id, b.id), Ties.likes(b.id, a.id)) < 1 || spoken.has(a.id) || spoken.has(b.id)) return;
    const fond = Ties.close(a.id, b.id) && Ties.close(b.id, a.id),
      doubt = Suspicion.earnest(a.id, b.id) || Suspicion.earnest(b.id, a.id),
      clear = !Suspicion.wonders(a.id, b.id) && !Suspicion.wonders(b.id, a.id);
    const p = (ab && ba ? RF.pair : RF.pair / 2) + (fond ? RF.fond : 0) + (clear ? RF.clear : 0) - (doubt ? RF.doubt : 0);
    if (fateRoll(a.id, b.id, 'pair') < p) {
      out.pairs.push({ a: a.id, b: b.id, strong: fond && ab && ba });
      spoken.add(a.id).add(b.id);
    }
  });
  both((a, b, ab, ba) =>
    [
      [a, b, ba],
      [b, a, ab]
    ].forEach(([dead, left, taken]) => {
      if (
        dead.status === 'taken' &&
        ok(left) &&
        taken &&
        !spoken.has(left.id) &&
        !spoken.has(dead.id) &&
        fateRoll(left.id, dead.id, 'mourn') < RF.mourn
      ) {
        out.mourn.push({ a: dead.id, b: left.id });
        spoken.add(left.id).add(dead.id);
      }
    })
  );
  return out;
}
function endAfter(id, won, later = afterDeaths()) {
  const f = S.fin,
    ctx = { id: id, won: won, shot: f && f.acts.find(a => a.kind === 'shoot' && a.ok), later: later, dooms: doomFates() };
  return (
    '<ul class="after">' +
    S.order
      .map(C)
      .map(c => endFate(c, ctx))
      .join('') +
    '</ul>'
  );
}
function endFate(c, ctx) {
  const { won: won } = ctx,
    gone = S.ended === 'madness' ? FATE_GONE.mad : S.ended === 'death' || S.ended === 'doom' ? FATE_GONE.dead : null,
    away = gone || (youInCell() ? FATE_GONE.jail : null),
    later = ctx.later && ctx.later[c.id],
    doom = ctx.dooms[c.id];
  if (later) return fateItem(c, 'gone', sayFate(FATE_AFTER[later.kind][later.k][later.line], c, later.d));
  if (doom && DOOM_GONE.has(doom.kind)) return fateItem(c, 'gone', doomSaid(c, doom));
  let t;
  if (c.status === 'taken') {
    const mine = c.takenBy === 'you',
      g = mine ? END_GRAVE[c.id][0] : fateOf(END_GRAVE[c.id], c.id, 'grave'),
      d = S.log.deed || {},
      inquest =
        S.ended === 'expelled'
          ? __text('theInquestNamedYou')
          : d.vote
            ? TX.fates.theCampSatIn()
            : d.caught || d.hinted || d.linked
              ? TX.fates.theInquestBlamedThe()
              : TX.fates.theInquestBlamedThe2();
    t = mine
      ? bi(...TX.fates.wasFoundDeadIn(c, inquest, g))
      : doom
        ? bi(...TX.fates.wasTakenOnNight(c)) + ' ' + doomSaid(c, doom)
        : bi(...TX.fates.wasTakenOnNight2(c, g));
  } else if (doom) t = doomSaid(c, doom);
  else if (c.status === 'exposed') t = sayFate(unmaskedFate(c).say, c);
  else if (c.status === 'dismissed')
    t = sayFate(
      fateOf(c.role === 'smuggler' ? (gone ? FATE.thiefSentGone : FATE.thiefSent) : gone ? FATE.dismissedGone : FATE.dismissed, c.id),
      c
    );
  else if (c.role === 'cult') t = endFateCult(c, ctx);
  else if (FATE[c.role]) t = sayFate(fateOf(FATE[c.role][won ? 'win' : 'lose'], c.id), c);
  else t = sayFate(fateOf(END_LIFE[c.id][won ? 'win' : 'lose'], c.id));
  const love = S.romance;
  if (c.status === 'present' && c.role !== 'cult') {
    if (love.you === c.id) t += ' ' + sayFate(away ? away.love : FATE_LOVE[c.id] || FATE_LOVE.any);
    else if (Ties.friend(c) && Ties.sweetOnYou(c)) t += ' ' + sayFate(away ? away.soft : FATE_SOFT[c.id] || FATE_SOFT.any);
    else if (Ties.friend(c))
      t +=
        ' ' +
        sayFate(
          fateOf(away ? (away === FATE_GONE.dead && Ties.vowed(c) ? away.friend.slice(0, 1) : away.friend) : FATE_FRIEND, c.id, 'friend'),
          c
        );
    else if (Ties.against(c)) t += ' ' + sayFate(fateOf(away ? away.enemy : FATE_ENEMY, c.id, 'enemy'), c);
  }
  love.pairs
    .filter(p => p.b === c.id && !(ctx.dooms[p.a] && DOOM_GONE.has(ctx.dooms[p.a].kind)))
    .forEach(p => {
      t += ' ' + sayFate(fateOf(FATE_PAIR[p.strong ? 'strong' : 'mild'], p.a, p.b), C(p.a), c);
    });
  love.mourn
    .filter(m => m.b === c.id)
    .forEach(m => {
      t += ' ' + sayFate(fateOf(FATE_MOURN, m.a, m.b), c, C(m.a));
    });
  t += codasOf(c, ctx);
  return fateItem(c, c.status === 'taken' ? 'gone' : '', t);
}
const unmaskedFate = c => fateOf(c.id === S.hierophant ? FATE.hierophant : FATE.exposed, c.id);
const fateItem = (c, cls, t) =>
  `<li class="${cls}"><svg class="ava" viewBox="46 30 108 108" aria-hidden="true">${endPortrait(c.id)}</svg><span>${t}</span></li>`;
function afterDeaths() {
  const A = RULES.fates.after,
    love = S.romance || { you: null, pairs: [], mourn: [] },
    spoken = new Set([love.you, ...love.pairs.flatMap(o => [o.a, o.b]), ...love.mourn.flatMap(o => [o.a, o.b])]),
    f = S.fin,
    home = ['exposed', 'triumph', 'pyrrhic', 'expelled'].includes(S.ended),
    out = [];
  if (S.ended === 'doom') return {};
  S.order.map(C).forEach(c => {
    const jailed = c.status === 'exposed';
    if (spoken.has(c.id) || !(jailed || ((isFree(c) || c.status === 'dismissed') && c.role !== 'cult'))) return;
    const why = jailed ? [] : [{ k: 'plain', d: null, w: A.why.plain }];
    let p = A.base * (home ? 1 : A.gone);
    const lay = (k, d, x) => {
      p *= x;
      if (!jailed || k === 'cult') why.push({ k: k, d: d, w: A.why[k] });
    };
    if (jailed) lay('cult', null, A.jailed);
    if (c.status === 'dismissed' && c.role !== 'smuggler') lay('wronged', null, A.sent);
    if (c.role === 'seer') lay('dreams', null, A.dreamer);
    const m = Ties.mourning(c);
    if (m && S.chars[m.victim] && C(m.victim).status === 'taken') lay('grief', C(m.victim), A.grief);
    if (f && ((f.took || []).includes(c.id) || (f.g3 && f.g3.kind === 'comp' && f.g3.id === c.id))) lay('below', null, A.below);
    if (c.role === 'smuggler') lay('thief', null, A.thief);
    const q = Math.min(A.max, p),
      roll = fateRoll(c.id, 'after');
    if (roll >= q) return;
    const o = drawCodas(why, 1, i => fateRoll(c.id, 'afterWhy', i))[0];
    const kind = fateRoll(c.id, 'afterKind') < (A.chosen[o.k] || 0) && !Ties.vowed(c) ? 'chosen' : 'strange',
      k = FATE_AFTER[kind][o.k] ? o.k : 'plain';
    out.push({ id: c.id, kind: kind, k: k, d: k === o.k ? o.d : null, by: roll / q });
  });
  const used = {};
  return Object.fromEntries(
    out
      .sort((a, b) => a.by - b.by)
      .slice(0, A.most)
      .map(o => {
        const n = FATE_AFTER[o.kind][o.k].length,
          u = (used[o.kind + o.k] = used[o.kind + o.k] || []);
        let i = Math.floor(fateRoll(o.id, 'afterLine') * n);
        while (u.includes(i) && u.length < n) i = (i + 1) % n;
        u.push(i);
        return [o.id, { ...o, line: i }];
      })
  );
}
const DOOM_GONE = new Set(['taken', 'helpedDied', 'joined', 'waits', 'freed']);
function doomAt(c) {
  const f = S.fin;
  if (c.status === 'dismissed') return 'away';
  if (f && (f.took || []).includes(c.id))
    return f.left.includes(c.id) || (f.g3 && f.g3.kind === 'comp' && f.g3.id === c.id) ? 'stair' : 'heart';
  return 'camp';
}
function doomLines(d, kind) {
  const by = DOOM_FATE[S.aspectOf[S.patron]];
  if (kind === 'unburied') return by.unburied;
  if (d.cell) return by.cell[kind] || [];
  if (d.cult) return kind === 'none' ? DOOM_CULT_NONE : by.cult[kind];
  if (kind === 'taken') return by.taken[doomBelow(d) ? 'below' : d.at];
  return by[kind] || [];
}
const doomBelow = d => d.at === 'heart' || d.at === 'stair';
const doomPool = (d, kind) => `${kind}:${d.cell ? 'cell' : d.cult ? 'cult' : kind === 'taken' ? (doomBelow(d) ? 'below' : d.at) : 'all'}`;
function doomMul(c, w, D, nat) {
  const M = D.mul,
    by = m => m && Object.keys(m).forEach(k => k in w && (w[k] *= m[k]));
  by(M[temperOf(c)]);
  by(M[c.role]);
  if (Ties.vowed(c)) by(M.vows);
  by(D.far.includes(c.id) ? M.far : M.near);
  if (Ties.friend(c)) by(M.friend);
  if (S.log.guarded.some(x => x.id === c.id)) by(M.guarded);
  const m = Ties.mourning(c);
  if (m && S.chars[m.victim] && C(m.victim).status === 'taken') by(M.grief);
  if (S.nights.some(rec => rec && (rec.afraid || []).includes(c.id))) by(M.afraid);
  if (S.nights.some(rec => rec && rec.target === c.id)) by(M.attacked);
  if (S.romance && S.romance.pairs.some(p => p.a === c.id || p.b === c.id)) by(M.pair);
  if (nat === 'madness' && c.role === 'seer') w.taken *= D.madDreamer;
}
const byWeight = (w, r) => weighted(Object.entries(w), r, { zero: 'skip', fallback: 'weighted' });
function doomFates() {
  if (S.ended !== 'doom') return {};
  const D = RULES.fates.doom,
    nat = S.aspectOf[S.patron],
    used = new Set(),
    left = (d, k) => doomLines(d, k).filter((l, i) => !used.has(`${doomPool(d, k)}:${i}`)).length,
    out = {};
  S.order.map(C).forEach(c => {
    let d;
    if (c.status === 'taken') {
      if (c.takenBy === 'you' || fateRoll(c.id, 'doomDead') >= D.unburied[nat]) return;
      d = { kind: 'unburied', at: 'dead' };
      if (!left(d, 'unburied')) return;
    } else {
      d = c.role === 'cult' ? (c.status === 'exposed' ? { cell: true } : { cult: true }) : { at: doomAt(c) };
      const w = { ...(d.cell ? D.cell : d.cult ? D.cult : D.at[d.at]) };
      if (d.at) doomMul(c, w, D, nat);
      const total = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach(k => {
        if (w[k] > 0) w[k] = Math.max(w[k], RULES.scale.rarest * total);
        const words = k === 'helped' ? left(d, 'helped') + left(d, 'helpedDied') : k === 'none' && !d.cult ? 1 : left(d, k);
        if (!words) w[k] = 0;
      });
      d.kind = byWeight(w, fateRoll(c.id, 'doom'));
      if (d.kind === 'helped' && (!left(d, 'helped') || (fateRoll(c.id, 'doomHelp') < D.helpedDies[nat] && left(d, 'helpedDied'))))
        d.kind = 'helpedDied';
      if (d.kind === 'none' && !d.cult) return;
    }
    const L = doomLines(d, d.kind),
      key = i => `${doomPool(d, d.kind)}:${i}`;
    let i = Math.floor(fateRoll(c.id, 'doomLine') * L.length);
    for (let n = 0; n < L.length && used.has(key(i)); n++) i = (i + 1) % L.length;
    used.add(key(i));
    out[c.id] = { ...d, line: i };
  });
  return out;
}
const doomSaid = (c, d) => sayFate(doomLines(d, d.kind)[d.line], c);
function endFateCult(c, { id: id, won: won, shot: shot }) {
  const n = c.name,
    N = capS(ru.cf(c)),
    he = c.p,
    He = EP.He(c),
    on = ru.gs(c, __text('text'), __text('text2'));
  const second = S.order.filter(x => C(x).role === 'cult' && C(x).status === 'present' && !(shot && shot.id === x)).indexOf(c.id) === 1;
  if (shot && shot.id === c.id) return bi(...TX.fates.diesWhereFellThe(n, he, N, c));
  if (id === 'burned') return second ? bi(...TX.fates.bodyIsTheOnly(n, c)) : bi(...TX.fates.isNeverFoundThe(n, c));
  if (won && second) return bi(...TX.fates.climbsOutOfThe(n, c));
  if (won) return bi(...TX.fates.isFoundBelowAt(n, He, c, on));
  if (second) return S.ended === 'expelled' ? bi(...TX.fates.writesToYouTo(n, he, N, c)) : bi(...TX.fates.writesToYourSister(n, he, N, c));
  return bi(...TX.fates.isNeverChargedWith(n, he, c, on));
}
function codaFacts(c, ctx) {
  const CW = RULES.fates.coda;
  const out = [],
    add = (k, g, d, w) => out.push({ k: k, g: g, d: d, w: w }),
    cult = c.role === 'cult',
    dead = c.status === 'taken',
    jailed = c.status === 'exposed',
    end = jailed ? unmaskedFate(c).end : null,
    cell = { trial: 'jailed', asylum: 'asylum' }[end] || null,
    alive = !dead && !jailed && !cult,
    home = !!ctx.won;
  const cf = Ties.comforted(c);
  if (cf.length && !dead) {
    if (alive) add('consoled', 'alive', C(cf[cf.length - 1]), CW.consoled);
    else if (cell) add('consoled', cell, C(cf[cf.length - 1]), CW.consoled);
  }
  if (Ties.confidedIn(c)) add('confided', cult ? 'cult' : dead ? 'dead' : 'alive', null, cult ? CW.confidedCult : CW.confided);
  if (S.log.pressedWho.includes(c.id) && (alive || cell)) add('pressed', alive ? 'alive' : cell, null, CW.pressed);
  if (c.role === 'warden' && S.log.attacks.some(a => a.how === 'guard') && (alive || dead))
    add('savedYou', alive ? 'alive' : 'dead', null, CW.savedYou);
  const g = S.log.guarded.filter(x => x.id === c.id).pop();
  if (g && alive) add('guarded', 'alive', g.day, CW.guarded);
  S.nights.forEach((rec, n) => {
    if (!rec || !alive) return;
    const at = rec.crimeLoc ? [LOCS[rec.crimeLoc].at, ru.loc(rec.crimeLoc, 'at')] : null;
    if (at && rec.finder === c.id && rec.target && S.chars[rec.target]) add('found', 'alive', { v: C(rec.target), at: at }, CW.found);
    else if (at && wasAbout(rec, c.id)) add('there', 'alive', { n: n, at: at }, CW.there);
    const asked = S.claims.some(x => x.night === n && x.id === c.id);
    if (home && asked && (rec.afraid || []).includes(c.id)) add('afraid', 'alive', n, CW.afraid);
    if ((rec.secret || []).includes(c.id) && rec.truth[c.id].with) add('secret', 'alive', { w: C(rec.truth[c.id].with), n: n }, CW.secret);
    const sw = rec.saw[c.id];
    if (sw && sw.made && S.sights.some(x => x.night === n && x.id === c.id)) add('invented', 'alive', C(sw.who), CW.invented);
  });
  const sp = S.log.spite.filter(x => x.id === c.id && (x.ok || x.caught)).pop();
  if (sp && alive) add('spite', 'alive', sp, CW.spite);
  if (alive)
    S.inquiries.forEach(v => {
      const x = C(v.id),
        k =
          v.back.includes(c.id) && v.passed
            ? x.role === 'cult'
              ? 'right'
              : 'wrong'
            : v.against.includes(c.id) && x.role === 'cult'
              ? 'shielded'
              : null;
      if (k) add('hand', 'alive', { x: x, k: k }, CW.hand);
    });
  if (alive && Suspicion.credit(c.id)) add('credit', 'alive', Math.sign(Suspicion.credit(c.id)), CW.credit);
  const f = S.fin;
  if (f && alive) {
    const held = f.g3 && f.g3.kind === 'comp' && f.g3.id === c.id;
    if (held || (f.took || []).includes(c.id)) add('below', 'alive', held ? 'held' : f.left.includes(c.id) ? 'left' : 'took', CW.below);
  }
  const pl = S.clues.find(cl => cl.source === 'plant' && cl.owner === c.id && !cl.extra);
  if (pl && alive) add('framed', 'alive', pl.day, CW.framed);
  if (alive && c.role === 'seer' && S.seerPublic) add('dreamer', 'alive', home, CW.dreamer);
  if (alive && c.role === 'smuggler' && S.witnessTold) add('told', 'alive', null, CW.told);
  if (cult && !dead && (!jailed || cell || end === 'fled')) {
    const g2 = cell || 'free',
      yours = home || S.ended === 'expelled',
      youLive = S.ended !== 'death' && S.ended !== 'doom',
      found = !jailed && S.ended === 'death' && !S.fin && NIGHT_FOUND.includes(nightDeath());
    if (Ties.drawnToYou(c) && (yours || (cell && youLive) || found)) add('cultSoft', g2, yours, CW.cultSoft);
    else if (Ties.friend(c)) add('cultFriend', g2, yours ? 'home' : S.ended === 'doom' ? 'doom' : 'lost', CW.cultFriend);
    else if (Ties.against(c) && cell) add('cultFoe', cell, null, CW.cultFoe);
  }
  const one = {};
  out
    .filter(o => FATE_CODA[o.k][o.g])
    .forEach(o => {
      one[o.k] = o;
    });
  return Object.values(one);
}
function drawCodas(list, n, roll) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const o = weighted(
      list.map(x => [x, x.w]),
      roll(i),
      { edge: 'closed', fallback: 'last' }
    );
    out.push(list.splice(list.indexOf(o), 1)[0]);
  }
  return out;
}
function codasOf(c, ctx) {
  const facts = codaFacts(c, ctx),
    roll = fateRoll(c.id, 'codas'),
    n = Math.min(facts.length, roll < RULES.fates.codaNone ? 0 : roll < RULES.fates.codaOne ? 1 : 2);
  return drawCodas(facts, n, i => fateRoll(c.id, 'coda', i))
    .map(o => ' ' + sayFate(fateOf(FATE_CODA[o.k][o.g], c.id, o.k), c, o.d))
    .join('');
}
function endSelf(r, won = true, last = null, later = {}) {
  const w = S.wounds,
    k = w && w >= S.woundsMax - 1 ? 'nearly' : w ? 'wounded' : r.frayed ? 'shaken' : 'whole',
    l = won ? fateOf(FATE_YOU[k], 'you') : null,
    rest = youCodas(won, last, later);
  return l || rest ? `<p>${l ? sayFate(l) : ''}${rest}</p>` : '';
}
const youInCell = () => S.ended === 'expelled' && !!S.log.deed && S.log.deed.outcome === 'killed';
const LAST_CODA = { deed: 'deed', wronged: 'wronged', friends: 'grave', tablets: 'read', horrors: 'horrors' };
const lastSaid = last => (last ? `<p>${sayFate(fateOf(FATE_YOU_LAST[last.k][last.where], 'you', 'lastLine'), last.d)}</p>` : '');
function yourLast(won, later = {}) {
  const L = S.log,
    F = RULES.fates.last,
    jailed = youInCell(),
    where = jailed ? 'jail' : won || S.ended === 'expelled' ? 'home' : S.ended === 'madness' ? 'mad' : null;
  if (!where) return null;
  const why = [{ k: 'plain', d: null, w: F.why.plain }];
  let p = F.base * (where === 'mad' ? F.mad : L.minNerve <= RULES.reckoning.frayed ? F.frayed : 1) * (jailed ? F.jail : 1);
  const lay = (k, d, x, w) => {
    p *= x;
    why.push({ k: k, d: d, w: w });
  };
  const t = L.deed && L.deed.outcome === 'killed' ? C(L.deed.id) : null;
  if (t)
    lay(
      'deed',
      { t: t, cult: t.role === 'cult' },
      t.role === 'cult' ? F.killedCult : F.killedInnocent,
      t.role === 'cult' ? F.why.deedCult : F.why.deed
    );
  const wronged = L.accused.filter(a => !a.right && C(a.id).role !== 'smuggler').map(a => C(a.id)),
    living = wronged.filter(x => !later[x.id]);
  if (wronged.length && living.length)
    lay('wronged', living[living.length - 1], F.wronged ** wronged.length, F.why.wronged * wronged.length);
  else if (wronged.length) p *= F.wronged ** wronged.length;
  const lost = Ties.friendsLost();
  if (lost.length) lay('friends', lost[lost.length - 1], F.grief ** lost.length, F.why.friends * lost.length);
  const v = L.visit;
  if (v && (v.found === 'dead' || v.through === 'her')) lay('tent', C(v.id), F.tent, F.why.tent);
  if (L.studyCost >= RULES.fates.read || S.factKnown.length >= RULES.fates.lines) lay('tablets', null, F.read, F.why.tablets);
  if (L.horrorNerve >= RULES.fates.horrors) lay('horrors', null, F.horrors, F.why.horrors);
  const friends = Ties.friendsNow().length;
  p *= F.friend ** Math.min(3, friends) * (S.romance && S.romance.you ? F.loved : 1);
  if (fateRoll('you', 'last') >= Math.min(F.max, p)) return null;
  const o = drawCodas(
    why.filter(x => FATE_YOU_LAST[x.k][where]),
    1,
    i => fateRoll('you', 'lastWhy', i)
  )[0];
  return { k: o.k, d: o.d, where: where };
}
function youCodas(won, last = null, later = {}) {
  const YW = RULES.fates.youCoda;
  const L = S.log,
    out = [],
    jailed = youInCell(),
    where = won || S.ended === 'expelled' ? 'home' : S.ended === 'madness' ? 'mad' : 'dead',
    tells = k =>
      jailed
        ? FATE_YOU_CODA[k].jail || (['peril', 'grave'].includes(k) ? null : FATE_YOU_CODA[k].home)
        : FATE_YOU_CODA[k][where] || (where !== 'home' ? FATE_YOU_CODA[k].gone : null),
    add = (k, d, w) => tells(k) && !(last && LAST_CODA[last.k] === k) && out.push({ k: k, d: d, w: w });
  if (L.studyCost >= RULES.fates.read || S.factKnown.length >= RULES.fates.lines) add('read', null, YW.read);
  const p = L.perils.filter(x => x.w || x.k === 'heat').pop();
  if (p) add('peril', p.k, YW.peril);
  const sp = L.spite.filter(x => x.ok || x.caught).pop();
  if (sp) add('spite', { c: C(sp.id), caught: sp.caught }, YW.spite);
  const wr = L.accused.filter(a => !a.right && !later[a.id]).pop();
  if (wr) add('wronged', C(wr.id), YW.wronged);
  const gr = Ties.friendsLost().pop();
  if (gr) add('grave', gr, YW.grave);
  const g3 = S.fin && S.fin.g3,
    left = S.fin ? S.fin.left.filter(id => !(g3 && g3.kind === 'comp' && g3.id === id) && C(id).role !== 'cult') : [],
    lb = left.length ? C(left[left.length - 1]) : null;
  if (lb) add('leftBelow', lb, YW.leftBelow);
  const fr = Ties.friendsNow().length;
  if (fr >= 2) add('friends', fr, YW.friends);
  if (L.horrorNerve >= RULES.fates.horrors) add('horrors', null, YW.horrors);
  if (L.deed && L.deed.outcome && L.deed.outcome !== 'away')
    add('deed', { t: C(L.deed.id), killed: L.deed.outcome === 'killed', gun: L.deed.means === 'revolver' }, YW.deed);
  const n = Math.min(out.length, last || fateRoll('you', 'codas') < RULES.fates.youOne ? 1 : 2);
  return drawCodas(out, n, i => fateRoll('you', 'coda', i))
    .map(o => ' ' + sayFate(fateOf(tells(o.k), 'you', o.k), o.d))
    .join('');
}
