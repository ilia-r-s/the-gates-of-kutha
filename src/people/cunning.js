// people/cunning.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const craft = c => CRAFT[temperOf(c)];
function framedBy(actor, target) {
  const pool = freeChars().filter(o => o.role !== 'cult' && o.id !== target && !inYourTent(o.id)),
    f = S.plots.find(p => p.kind === 'frame' && !p.done && S.day <= p.until && pool.some(o => o.id === p.id));
  if (f && chance(RULES.night.dreamers.framePlants)) {
    Object.assign(f, { done: true, used: S.day });
    return C(f.id);
  }
  if (!chance(craft(actor).plant * cultTurns('sleuth'))) return null;
  return pool.length ? Ties.pickByLike(actor, pool, -1) : null;
}
const sloppy = actor => chance(craft(actor).sloppy);
const tidy = actor => chance(craft(actor).tidy);
function betrayal(cult) {
  if (cult.length < 2) return null;
  const N = RULES.night,
    victim = cult.find(Suspicion.caught),
    killer = victim && cult.find(k => k !== victim);
  if (!killer) return null;
  const less = (S.day < 2 ? N.betrayLess : 1) * (Suspicion.clear(killer) ? 1 : N.betrayLess);
  if (!chance(N.betray * craft(killer).sacrifice * less)) return null;
  return { killer: killer, victim: victim };
}
const cultHeat = () => Math.max(0, ...freeCult().map(k => Suspicion.suspectedBy(k).length));
function dreamerDanger(c, heat = cultHeat()) {
  const K = RULES.night.dreamers,
    known = Suspicion.dreamsKnown(c);
  if (!known) return 0;
  const doubters = freeChars().filter(o => o.id !== c.id && o.role !== 'cult' && Suspicion.wonders(o, c)).length;
  return (
    known *
    clamp(1 + K.credit * Suspicion.credit(c), K.creditMin, K.creditMax) *
    Math.max(K.doubtMin, 1 - K.doubt * doubters) *
    (1 + K.heat * heat) *
    (Suspicion.threat.harm(c) > 0 ? K.named : 1)
  );
}
const decider = cult => cult.find(k => k.id === S.hierophant) || cult[0];
const dreamerAnswered = c => S.plots.some(p => p.id === c.id && !p.done && S.day <= p.until);
const dreamerWhy = (v, later = null) => ({
  kind: 'dreamer',
  ...(Suspicion.knownAloud(v) ? {} : { aside: true }),
  ...(later == null ? {} : { later: later })
});
function meetDreamer(night) {
  const K = RULES.night.dreamers,
    due = S.plots.find(p => p.kind === 'later' && !p.done && p.night === S.day);
  if (due) {
    due.done = true;
    const v = night.npcs.find(c => c.id === due.id);
    if (v && chance(K.keeps)) return { id: v.id, why: dreamerWhy(v, due.day) };
  }
  const heat = cultHeat(),
    weighed = night.npcs
      .filter(c => !dreamerAnswered(c))
      .map(c => [c, dreamerDanger(c, heat)])
      .filter(([, x]) => x > 0);
  if (!weighed.length || !night.cult.length) return null;
  const [v, x] = weighed.reduce((a, b) => (b[1] > a[1] ? b : a));
  if (!chance(Math.min(K.fearMax, K.fear * x))) return null;
  const by = decider(night.cult),
    cr = craft(by),
    w = {};
  Object.entries(K.answers).forEach(([a, [base, of]]) => (w[a] = base * (of ? cr[of] : 1)));
  const a = wpick(w);
  if (a === 'tonight') return { id: v.id, why: dreamerWhy(v) };
  const [lo, hi] = K.laterIn,
    n = a === 'later' ? S.day + pick(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)) : null;
  S.plots.push({ kind: a, id: v.id, day: S.day, by: by.id, night: n, until: n == null ? S.day + K.stands[a] : n, done: false });
  return null;
}
const closeSeen = v =>
  Math.min(
    RULES.scale.trustMax,
    RULES.cunning.close * Suspicion.knownActs(null, v) + Gossip.record().filter(r => r.kind === 'good' && r.by === v.id).length
  );
const enemiesSeen = () =>
  freeChars().filter(
    c =>
      c.role !== 'cult' &&
      (Moments.record().some(r => r.kind === 'complained' && r.by === c.id) || Gossip.record().some(r => r.kind === 'bad' && r.by === c.id))
  ).length;
function cultReads(k) {
  const f = Math.max(1, S.day) / RULES.start.days,
    over = (styleSeen(k, S.log, f) - READ_MU[k] * f) / (READ_SD[k] * Math.sqrt(f));
  return Math.max(0, Math.min(1, over / RULES.adapt.z));
}
function cultTurns(k) {
  const r = cultReads(k);
  if (r > 0 && S.turned) {
    const t = S.turned[k] || (S.turned[k] = { r: 0, day: null });
    t.r = Math.max(t.r, r);
    if (t.day == null && r >= RULES.adapt.told) t.day = S.day;
  }
  return 1 + RULES.adapt.gain * r;
}
function liesLow(night) {
  const Q = RULES.night.low,
    hot = night.cult.map(k => [k, Suspicion.suspectedBy(k.id).length]).sort((a, b) => b[1] - a[1])[0],
    caught = S.log.accused.find(a => a.right && a.day === S.day),
    ahead = S.doom >= RULES.start.doomWarn;
  const why = {
      heat: 1 + Q.heat * hot[1],
      after: caught ? Q.after : 1,
      ahead: ahead ? 1 + Q.ahead : 1
    },
    p = (Q.odds * S.patience * why.heat * why.after * why.ahead * Q.spent ** S.log.quiet.length) / cultTurns('quiet');
  if (!chance(Math.min(Q.max, p))) return false;
  const k = Object.keys(why).sort((a, b) => why[b] - why[a])[0];
  night.low = why[k] > 1 ? { why: k, about: k === 'heat' ? hot[0].id : k === 'after' ? caught.id : null } : { why: 'none' };
  return true;
}
function blurt(c, n, scale = 1) {
  const rec = S.nights[n];
  if (!rec || rec.blurted) return null;
  const knew = rec.actor === c.id ? null : rec.finder === c.id ? 'found' : wasAbout(rec, c.id) ? 'there' : null;
  if ((rec.actor !== c.id && !knew) || !chance(craft(c).blurt * scale * (knew ? RULES.alibis.knew : 1))) return null;
  rec.blurted = true;
  Record.testify(c.id, c.id, 'blurt', knew ? `${n}:${knew}` : String(n));
  const v = rec.target && S.chars[rec.target] ? C(rec.target) : null;
  if (n === 0) return bi(...TX.cunning.speaksOfTheNight(c));
  const att = (rec.target === 'player' && S.log.attacks.find(a => a.day === n)) || {},
    how = att.how,
    known = how === 'out' || how === 'visit' || (S.log.visit && S.log.visit.day === n && S.log.visit.agreed);
  if (how === 'bowl') return att.broke ? bi(...TX.cunning.asksWhetherYouHeard(c)) : bi(...TX.cunning.asksWhetherYouFound(c));
  if (rec.target === 'player' && known) return bi(...TX.cunning.speaksOfTheNight2(c));
  if (rec.target === 'player' && how !== 'guard') return bi(...TX.cunning.asksWhetherYouSlept(c));
  if (v && v.status === 'taken') return sayPick([bi(...TX.cunning.saysItMustHave(c)), bi(...TX.cunning.wondersAloudWhyAnyone(c, v))]);
  if (v && rec.saved === 'luck') return bi(...TX.cunning.saysItWasThe(c));
  if (v && rec.saved === 'away') return bi(...TX.cunning.asksWhetherAnyoneHas(c, v));
  if (v) return bi(...TX.cunning.saysWhoeverDroveThem(c));
  return bi(...TX.cunning.asksWhoItWas(c));
}
function volunteers() {
  const v = freeChars().filter(c =>
    Ties.against(c)
      ? chance(RULES.descent.foeOffers)
      : c.role === 'cult'
        ? chance(
            craft(c).volunteer * (c.rapport ? 1 : RULES.cunning.coldOffer) * (Suspicion.suspected(c) ? RULES.cunning.suspectedOffer : 1)
          )
        : chance(RULES.descent.volunteerFriend[Math.min(2, c.rapport)])
  );
  return shuffle(v)
    .slice(0, 2)
    .map(c => c.id);
}
const OFFER_SAY = [
  c => bi(...TX.cunning.isAlreadyLacingUp(c)),
  c => bi(...TX.cunning.hasALampLit(c)),
  c => bi(...TX.cunning.stepsForwardTwoLamps(c))
];
function willCome(c) {
  const D = RULES.descent,
    k = temperOf(c);
  if ((S.fin.offered || []).includes(c.id) && chance(D.offered)) return { ok: true };
  const foe = S.fin.comp.map(C).find(o => Ties.cannotBear(c.id, o.id));
  if (Ties.hostile(c)) return chance(D.foe) ? { ok: true, why: 'duty' } : { ok: false, why: 'you' };
  if (Ties.against(c))
    return chance(k === 'honest' || k === 'conscientious' ? D.duty : D.foe) ? { ok: true, why: 'duty' } : { ok: false, why: 'you' };
  if (foe) return chance(D.grit) ? { ok: true, why: 'grit', foe: foe } : { ok: false, why: 'foe', foe: foe };
  if (chance(!Ties.friend(c) ? D.afraid : D.afraidFriend)) return { ok: false, why: 'afraid' };
  return { ok: true };
}
function comeSay(c, w) {
  if (w.why === 'you') return bi(...TX.cunning.willNotComeNot(c));
  if (w.why === 'foe' && !w.ok) return bi(...TX.cunning.willNotComeNot2(c, w));
  if (w.why === 'afraid') return sayPick([bi(...TX.cunning.looksAtTheStair(c)), bi(...TX.cunning.willNotComeI(c))]);
  if (w.why === 'duty') return bi(...TX.cunning.looksAtYouA(c));
  if (w.why === 'grit') return bi(...TX.cunning.looksAtAndSets(c, w));
  return '';
}
const waits = t => chance(craft(t).patient);
function turnAtTheEnd() {
  const f = S.fin,
    none = { ids: [], html: '' };
  if (f.turnDone) return none;
  f.turnDone = true;
  const D = RULES.descent,
    held = f.g3 && f.g3.kind === 'comp' ? f.g3.id : null,
    cult = f.comp.map(C).filter(c => c.role === 'cult' && isFree(c) && (!f.left.includes(c.id) || c.id === held)),
    turned = cult.filter(c => chance(D.turn * (Ties.friend(c) ? 1 - D.turnFond : 1)));
  const behind = f.comp.map(C).filter(c => c.role === 'cult' && isFree(c) && f.left.includes(c.id) && c.id !== held);
  f.stayedAway = behind.filter(() => !chance(D.turn)).map(c => c.id);
  f.cameBack = behind.map(c => c.id).filter(id => !f.stayedAway.includes(id));
  f.heldBack = cult
    .filter(c => !turned.includes(c))
    .map(c => c.id)
    .concat(f.stayedAway);
  let h = f.heldBack
    .filter(id => !f.stayedAway.includes(id))
    .map(C)
    .map(t => bi(...TX.cunning.stopsAtTheEdge(t)))
    .join('');
  if (!turned.length) return { ids: [], html: h };
  f.turned = turned.map(c => c.id);
  f.comp = f.comp.filter(id => !f.turned.includes(id));
  turned.forEach(t => {
    if (t.id === held) h += bi(...TX.cunning.behindYouTheSeventh());
    h +=
      t.id === S.hierophant
        ? bi(...TX.cunning.walksPastYouInto(t))
        : (f.offered || []).includes(t.id)
          ? bi(...TX.cunning.walksPastYouInto2(t))
          : bi(...TX.cunning.walksPastYouInto3(t));
  });
  const ward = S.wardOf[S.patron],
    thief = turned[0],
    others = S.items.filter(it => ITEMS[it].ward && it !== ward),
    feint = () => (others.length ? pick(others) : null),
    burnt = has(ward)
      ? chance(D.steal)
        ? (others.length && chance(D.feint) && feint()) || ward
        : null
      : chance(D.steal * D.feint)
        ? feint()
        : null;
  if (burnt) {
    lose(burnt);
    if (burnt === ward) f.stolen = ward;
    else f.feint = burnt;
    h += bi(...TX.cunning.youReachForAnd(burnt, thief));
  }
  return { ids: f.turned, html: h };
}
