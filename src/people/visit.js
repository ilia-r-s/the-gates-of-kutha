function visitTonight() {
  const VR = RULES.visit;
  if (S.log.visit || S.day < VR.from || deedTonight()) return null;
  const may = freeChars().filter(Ties.sweetOnYou);
  if (!may.length || !chance(Math.min(VR.max, VR.odds + VR.perDead * S.stats.taken))) return null;
  return C(wpick(Object.fromEntries(may.map(c => [c.id, c.rapport]))));
}
function visitScene(h) {
  S.phase = 'visit';
  const chill = S.bg === 'occultist' && chance(h.role === 'cult' ? RULES.talk.chillCult : RULES.talk.chillOther);
  if (chill) Record.testify(h.id, h.id, 'chill', 'cult');
  show({
    kicker: bi(...TX.visit.dayOfLateEvening()),
    title: __text('aKnockAtTheTentPole'),
    art: { bg: 'camp', time: 'night', talk: h.id, mood: FACES.visit },
    body: [bi(...TX.visit.lateWhenTheCamp(h)) + (chill ? `<p class="note">${bi(...TX.visit.asSheStepsIn())}</p>` : '')],
    choices: [
      { label: __text('letHerStay'), fn: () => visitAnswer(h, true, chill) },
      { label: __text('sendHerBackToHerTent'), cls: 'minor', fn: () => visitAnswer(h, false, chill) }
    ]
  });
}
function visitAnswer(h, yes, chill) {
  const VR = RULES.visit;
  S.log.visit = { id: h.id, day: S.day, agreed: yes, chill: chill, hurt: 0, heard: [] };
  if (!yes) {
    if (chance(VR.hurt)) {
      Ties.moveTrust(h, -1, 'deed');
      S.log.visit.hurt++;
      if (chance(VR.hurtMore)) {
        Ties.moveTrust(h, -1, 'deed');
        S.log.visit.hurt++;
      }
    }
    Gossip.wordOf(h, 'turnedAway');
  }
  Record.journal(yes ? bi(...TX.visit.cameToYourTent(h)) : bi(...TX.visit.cameToYourTent2(h)));
  visitReply(h);
}
function visitReply(h) {
  const v = S.log.visit,
    no = { ...FACES.visitNo, angry: (FACES.visitNo.angry || 0) * (v.hurt ? FACES.visitHurt : 1) },
    face = v.agreed ? FACES.visitYes : slotPick(h, 'visitNo', no);
  show({
    kicker: bi(...TX.visit.dayOfLateEvening2()),
    title: __text('aKnockAtTheTentPole2'),
    art: { bg: 'camp', time: 'night', talk: h.id, mood: face },
    body: [visitSaid(h, v, face)],
    choices: [
      {
        label: v.agreed ? __text('putOutTheLamp') : __text('tryToSleep'),
        fn: nightComes
      }
    ]
  });
}
const guestOn = n => {
  const v = S.log && S.log.visit;
  return v && v.agreed && v.day === n && S.chars[v.id] && isFree(C(v.id)) ? v.id : null;
};
const visitGuest = () => (guestOn(S.day) ? C(guestOn(S.day)) : null);
const inYourTent = (id, n = S.day) => !!id && guestOn(n) === id;
const VISIT_NO = { sad: TX.visit.sheNodsAsIf(), surprised: TX.visit.sheStaresAtYou(), angry: TX.visit.herFaceShutsLike() };
function visitSaid(h, v, face) {
  return v.agreed ? bi(...TX.visit.staysSheLetsThe(h)) : bi(...TX.visit.youSendBackTo(h, face)) + (v.hurt ? trustNote([], [h.id]) : '');
}
function guestStrikes(night) {
  const h = night.guest,
    VR = RULES.visit;
  if (!h || h.role !== 'cult' || !chance(VR.strike)) return '';
  if (chance(VR.kills)) {
    S.log.visit.struck = 'killed';
    S.log.attacks.push({ day: S.day, how: 'visit' });
    killYou('visit');
    return '';
  }
  S.log.visit.struck = 'failed';
  night.guest = null;
  night.unmasked = h.id;
  h.status = 'exposed';
  h.exposedHow = 'night';
  S.stats.right++;
  S.revealed[h.id] = 'cult';
  fixMark(h);
  S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight));
  Record.journal(bi(...TX.visit.triedToKillYou(h)));
  const html = bi(...TX.visit.inTheSmallHours(h)) + hurt(...RULES.harm.blade, { k: 'blade', id: h.id });
  S.hurtBy = 'wrist';
  return html;
}
function herNight(night) {
  const h = night.guest;
  if (chance(RULES.visit.found)) {
    night.loc = 'camp';
    night.saved = Watch.holds(night, 'player') ? 'watch' : Watch.spared() ? 'luck' : null;
    recordBetrayal(night);
    if (night.saved === 'watch') {
      S.log.visit.found = 'watch';
      S.log.guarded.push({ day: S.day, id: h.id });
      return bi(...TX.visit.inTheSmallHours2(h));
    }
    if (night.saved === 'luck') {
      S.log.visit.found = 'luck';
      S.log.spared.push({ day: S.day, id: h.id });
      return bi(...TX.visit.inTheSmallHours3(h));
    }
    S.log.visit.found = 'dead';
    night.dead = h.id;
    takenInYourTent(h);
    return bi(...TX.visit.youWakeInThe(h)) + hurt(...RULES.harm.diedBeside, { k: 'herDeath', id: h.id });
  }
  night.saved = 'away';
  recordBetrayal(night);
  S.log.visit.empty = true;
  S.log.spared.push({ day: S.day, id: h.id, away: true });
  night.at = __text('outsideHerTent');
  night.found.push(bi(...TX.visit.someoneCameForIn(h)));
  return '';
}
function takenInYourTent(h) {
  fixMark(h);
  h.status = 'taken';
  h.takenDay = S.day;
  S.stats.taken++;
  const k = +wpick(RULES.visit.talked);
  S.log.visit.talked = k;
  if (k) Gossip.wordOf(h, 'diedInTent', k);
  if (k > 1) Suspicion.suspectYou(1);
  Record.journal(bi(...TX.visit.wasTakenInThe(h)));
}
function guestThrough(night, told) {
  const h = night.guest,
    way = wpick(RULES.visit.through);
  S.log.visit.through = way;
  const it = told();
  S.log.attacks.push({ day: S.day, how: way === 'hurt' ? 'hurt' : 'visit', k: way, power: !!night.power });
  if (way === 'her' || way === 'both') {
    night.dead = h.id;
    takenInYourTent(h);
  }
  if (way === 'you' || way === 'both') {
    killYou('night');
    return '';
  }
  Record.journal(__text('youWereAttackedInTheNight'));
  if (way === 'hurt') return it + bi(...TX.visit.screamsAndWhateverIt(h)) + hurt(...RULES.harm.screamed, { k: 'screamed', id: h.id });
  return it + bi(...TX.visit.itIsOverIn(h)) + hurt(...RULES.harm.tookHer, { k: 'herDeath', id: h.id });
}
function guestAccount(night) {
  const h = night.guest,
    rec = S.nights[S.day];
  if (h && rec && isFree(h) && rec.actor === h.id) S.log.visit.out = true;
}
function diedInTentSaid() {
  const v = S.log.visit;
  if (!v || v.day !== S.day - 1 || v.talked == null || !(v.found === 'dead' || v.through === 'her')) return '';
  const h = C(v.id);
  return `<p class="notice">${bi(...TX.visit.theCampSaysVery(h, v))}</p>`;
}
function visitMorning(night) {
  const v = S.log.visit;
  if (!v || !v.agreed || v.day !== S.day - 1 || v.morning) return '';
  v.morning = true;
  const h = C(v.id);
  if (!isFree(h)) return '';
  Gossip.wordOf(h, 'visited');
  const VR = RULES.visit,
    gone = chance(VR.leaves),
    mend = chance(VR.mend) ? regain(RULES.mend.visit) : 0,
    warm = chance(VR.warm) && h.rapport < RULES.scale.trustMax;
  if (warm) Ties.moveTrust(h, 1, 'deed');
  return (
    (gone ? bi(...TX.visit.whenYouWakeIs(h, mend)) : bi(...TX.visit.youWakeToFind(h, mend))) +
    nerveNote(mend) +
    (warm ? trustNote([h.id], []) : '')
  );
}
const visitTalk = () => (S.log.visit && S.log.visit.day === S.day - 1 ? RULES.visit.talk : 1);
