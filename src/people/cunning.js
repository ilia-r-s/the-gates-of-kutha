// ===================== THE CULT'S CRAFT =====================
// The cult is clever, mostly. It lays an innocent's trace at the scene instead of its own. A cultist who swore to watch
// your tent keeps the promise, to be trusted for it. It courts you in small talk and takes your confidences gladly
// (people/dialog.js). It offers to come down with you, and the cleverest of it lets the fourth gate pass and betrays you
// at the very end (game/finale.js); it leaves nothing at the scene but the one trace, if it is careful. Not always, and
// not all of it: some of the cult are careless, and leave a second trace, or let slip the next day what only the one who
// did it could know. How much of each, by temperament: CRAFT in
// rules.js.
const craft = c => CRAFT[temperOf(c)];
// The trace at tonight's scene: an innocent's, laid there by the attacker: someone the attacker dislikes, never the one
// the night took (the more readily once the cult has seen you live at the scenes: cultTurns).
function framedBy(actor, target) {
  if (!chance(craft(actor).plant * cultTurns('sleuth'))) return null;
  const pool = freeChars().filter(o => o.role !== 'cult' && o.id !== target);
  return pool.length ? pickByLike(actor, pool, -1) : null;
}
const sloppy = actor => chance(craft(actor).sloppy);
// a careful attacker leaves nothing else at the scene for an examination to find
const tidy = actor => chance(craft(actor).tidy);
// whether someone looks lost, as the cult sees it: some evidence against them, or two of the camp suspecting them in
// earnest
const looksLost = c => caseAgainst(c) >= RULES.verdict.someCase || suspectedBy(c.id).length >= 2;
// Rarely, one of the cult kills another, to turn your eyes away: when the other is all but caught (a strong case
// against them, two of the camp suspecting them in earnest, or an accusation before everyone), a death among the
// suspected looks like the cult's work on an innocent. More readily the more ruthless the killer (RULES.night.betray ×
// craft: sacrifice), and seldom on the first night or by a killer under any suspicion itself (× night.betrayLess each).
// Returns { killer, victim } or null; the dice are thrown only when it could happen.
function betrayal(cult) {
  if (cult.length < 2) return null;
  const N = RULES.night,
    accused = k => S.log.refusedInq.some(r => r.id === k.id),
    caught = k => caseAgainst(k) >= RULES.verdict.strongCase || suspectedBy(k.id).length >= 2 || accused(k),
    clear = k => caseAgainst(k) < RULES.verdict.someCase && !suspectedBy(k.id).length && !accused(k);
  const victim = cult.find(caught),
    killer = victim && cult.find(k => k !== victim);
  if (!killer) return null;
  const less = (S.day < 2 ? N.betrayLess : 1) * (clear(killer) ? 1 : N.betrayLess);
  if (!chance(N.betray * craft(killer).sacrifice * less)) return null;
  return { killer, victim };
}

// ---------- how the cult reads you ----------
// The cult watches how you hunt it, and turns its craft against whatever you lean on (RULES.adapt): for each way of
// hunting (the styles the ending names: game/endings.js), how far beyond an ordinary season's pace you have gone so far
// (cultReads: 0 to 1). What it counts (STYLE_SO_FAR) is everything of the ending's count it could see for itself as the
// season goes (not what comes only below, nor your notebook's marks; nor the times you thought better of something,
// which it cannot see), against an ordinary season's pace of that same count (READ_MU, READ_SD: rules.js); cultTurns(k):
// how much more readily it works against that way, from 1 to 1 + adapt.gain. Against the one who lives at the scenes it
// lays more false traces and sweeps more ground (sleuth); against the one who calls inquiries it pushes harder for the
// innocent to go, and is quicker to come for an enemy (inquisitor); against the one who confides it takes the friends
// first (confidant); against the reader and the digger it comes for you (scholar, delver: a lamp burning late, someone
// poking at its hiding places); against the one who sits still it grows bold, lies low less, and hurries the rite (quiet:
// game/night.js). Never told; the ending tells it (S.turned: how far it went against each way, and from what day).
// f: how much of the season has gone (what a whole season of it would come to, counted so far as that).
const STYLE_SO_FAR = {
  inquisitor: L => 2 * L.press + 2 * (L.accused.length + L.refusedInq.length) + 0.5 * L.distrust + 0.5 * turnedNow(),
  quiet: (L, f) => 2 * L.rest + 2 * f * (L.accused.length + L.refusedInq.length ? 0 : 1),
  scholar: L => 2 * L.study + 1.5 * L.readings + 0.3 * S.factKnown.length,
  sleuth: L => 2 * L.examine + 0.5 * L.night + 0.5 * S.sights.length + 0.5 * (L.diary || 0),
  delver: L => 2 * L.search + 0.5 * L.charms.length,
  confidant: L => {
    const trust = freeChars().reduce((s, c) => s + Math.max(0, c.rapport), 0),
      friends = freeChars().filter(c => c.role !== 'cult' && c.rapport >= 2).length;
    return 2 * L.confide + L.about + 0.5 * trust + friends + 0.5 * L.confess;
  }
};
// those outside the cult still at the dig who have turned against you since the start (game/endings.js: enemies)
const turnedNow = () => freeChars().filter(c => c.role !== 'cult' && c.rapport <= -1 && c.rapport < (S.rap0 ? S.rap0[c.id] : 0)).length;
function cultReads(k) {
  const f = Math.max(1, S.day) / RULES.start.days,
    over = (STYLE_SO_FAR[k](S.log, f) - READ_MU[k] * f) / (READ_SD[k] * Math.sqrt(f));
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

// ---------- the nights it comes for no one ----------
// Whether the cult lies low tonight and comes for no one (night.low: why, for the ending). Now and then for no reason
// anyone will ever know (odds, × the season's patience, dealt unseen with the season: S.patience); more when the camp is
// closing in on one of it (heat, for each who suspects in earnest the one of it most suspected), the night after one of
// it was unmasked (after), and when the rite is far along and nothing need be risked (ahead); less while someone the camp
// has heard name one of it guilty is alive (threatened: that cannot wait), less for every night it has let pass already
// (spent, each), and less against one who sits still and hunts it little (÷ cultTurns quiet). Never above max.
function liesLow(night) {
  const Q = RULES.night.low,
    hot = night.cult.map(k => [k, suspectedBy(k.id).length]).sort((a, b) => b[1] - a[1])[0],
    caught = S.log.accused.find(a => a.right && a.day === S.day),
    ahead = S.doom >= RULES.start.doomWarn,
    threat = night.npcs.some(c =>
      S.said.some(x => x.by === c.id && x.how === 'dream' && x.verdict === 'cult' && C(x.about).role === 'cult' && isFree(C(x.about)))
    );
  const why = { heat: 1 + Q.heat * hot[1], after: caught ? Q.after : 1, ahead: ahead ? 1 + Q.ahead : 1 },
    p =
      (Q.odds * S.patience * why.heat * why.after * why.ahead * (threat ? Q.threatened : 1) * Q.spent ** S.log.quiet.length) /
      cultTurns('quiet');
  if (!chance(Math.min(Q.max, p))) return false;
  const k = Object.keys(why).sort((a, b) => why[b] - why[a])[0];
  night.low = why[k] > 1 ? { why: k, about: k === 'heat' ? hot[0].id : k === 'after' ? caught.id : null } : { why: 'none' };
  return true;
}

// ---------- what only the one who did it could know ----------
// Asked about the night before (or, half as often, in small talk), the one who did it may let slip a detail nobody has
// told the camp: once a night. So, less readily, may someone who knew it innocently: who found the body, or was there
// that night by ill luck (people/alibis.js); it sounds the same, and counts as much against them.
function blurt(c, n, scale = 1) {
  const rec = S.nights[n];
  if (!rec || rec.blurted) return null;
  const knew = rec.actor === c.id ? null : c.role !== 'cult' && (rec.finder === c.id ? 'found' : wasAbout(rec, c.id) ? 'there' : null);
  if ((rec.actor !== c.id && !knew) || !chance(craft(c).blurt * scale * (knew ? RULES.alibis.knew : 1))) return null;
  rec.blurted = true;
  addTest(c.id, c.id, 'blurt', knew ? `${n}:${knew}` : String(n));
  const v = rec.target && S.chars[rec.target] ? C(rec.target) : null;
  if (n === 0)
    return bi(
      `${c.short} speaks of the night Crane died as if ${c.p} had been there to see it, then stops, and begins again more carefully.`,
      `${ru.c(c)} говорит о ночи, когда погиб Крейн, так, будто ${ru.gs(c, 'видел', 'видела')} всё своими глазами, — потом осекается и начинает снова, осторожнее.`
    );
  // the night they came for you: in under the tent wall, or no further than the bowl (cracked, or brimming), or the
  // Watcher; or a night the whole camp knows of (your tent found empty and slashed, or someone with you in it), and then
  // only as if they had been there
  const att = (rec.target === 'player' && S.log.attacks.find(a => a.day === n)) || {},
    how = att.how,
    known = how === 'out' || how === 'visit' || (S.log.visit && S.log.visit.day === n && S.log.visit.agreed);
  if (how === 'bowl')
    return att.broke
      ? bi(
          `${c.short} asks whether you heard anything crack in the night. You have told no one about the bowl.`,
          `${ru.c(c)} спрашивает, не слышали ли вы ночью, как что-то треснуло. О чаше вы не говорили никому.`
        )
      : bi(
          `${c.short} asks whether you found the water under your bed black this morning. You have told no one about the bowl.`,
          `${ru.c(c)} спрашивает, не почернела ли к утру вода у вас под кроватью. О чаше вы не говорили никому.`
        );
  if (rec.target === 'player' && known)
    return bi(
      `${c.short} speaks of the night at your tent as if ${c.p} had been there to see it, then stops, and begins again more carefully.`,
      `${ru.c(c)} говорит о той ночи у вашей палатки так, будто ${ru.gs(c, 'видел', 'видела')} всё своими глазами, — потом осекается и начинает снова, осторожнее.`
    );
  if (rec.target === 'player' && how !== 'guard')
    return bi(
      `${c.short} asks whether you slept well, and glances at the place in the tent wall where they came in. You have shown that place to no one.`,
      `${ru.c(c)} спрашивает, хорошо ли вы спали, и бросает взгляд на то место в стенке палатки, где они вошли. Это место вы не показывали никому.`
    );
  if (v && v.status === 'taken')
    return pick([
      bi(
        `${c.short} says it must have happened before three, when the jackals stopped. Nobody has said when it happened.`,
        `${ru.c(c)} говорит, что это, должно быть, случилось до трёх, когда смолкли шакалы. Никто не говорил, когда это случилось.`
      ),
      bi(
        `${c.short} wonders aloud why anyone would carry ${v.short} so far from the tents. Nobody has said that ${v.short} was carried.`,
        `${ru.c(c)} вслух удивляется, зачем было нести ${ru.c(v, 'a')} так далеко от палаток. Никто не говорил, что ${ru.c(v, 'a')} несли.`
      )
    ]);
  return bi(
    `${c.short} asks who it was that drove them off last night, and then looks as if ${c.p} wishes ${c.p} had not asked.`,
    `${ru.c(c)} спрашивает, кто же прогнал их прошлой ночью, — и тут же жалеет, что ${ru.gs(c, 'спросил', 'спросила')}.`
  );
}

// ---------- the way down ----------
// Who offers to come down with you before you ask (two at most): once in a while someone who hardly knows you, now and
// then someone who likes you, often a friend; and the cult readily when it is not under suspicion (seldom when it is),
// though less readily when you hardly trust it, since that would look odd. Hardly anyone turned against you offers. They
// all look the same from where you stand.
function volunteers() {
  const v = freeChars().filter(c =>
    c.rapport < 0
      ? chance(RULES.descent.foeOffers) // (hardly ever, one turned against you)
      : c.role === 'cult'
        ? chance(
            craft(c).volunteer *
              (c.rapport ? 1 : RULES.cunning.coldOffer) *
              (suspectedBy(c.id).length < 2 ? 1 : RULES.cunning.suspectedOffer)
          )
        : chance(RULES.descent.volunteerFriend[Math.min(2, c.rapport)])
  );
  return shuffle(v)
    .slice(0, 2)
    .map(c => c.id);
}
const OFFER_SAY = [
  c =>
    bi(
      `${c.short} is already lacing up ${c.pp} boots. “You are not going down there alone, Doctor.”`,
      `${ru.c(c)} уже зашнуровывает ботинки. «Я не пущу вас туда в одиночку, доктор».`
    ),
  c =>
    bi(
      `${c.short} has a lamp lit before you can ask. “I’m coming. Don’t argue.”`,
      `${ru.c(c)} зажигает лампу прежде, чем вы успеваете попросить. «Я иду с вами. И не спорьте».`
    ),
  c =>
    bi(
      `${c.short} steps forward. “Two lamps are better than one, Doctor. Let me come.”`,
      `${ru.c(c)} выходит вперёд. «Две лампы лучше одной, доктор. Возьмите меня».`
    )
];
// Asked to come down, does someone come? Not someone who cannot stand you, unless duty is stronger than dislike; not
// alongside someone they cannot bear, unless they grit their teeth; and some who hardly know you are simply afraid.
// Anyone who offered comes. The cult answers as anyone would in its place (it does not give itself away by coming too
// readily, and would rather volunteer: volunteers).
function willCome(c) {
  const D = RULES.descent,
    k = temperOf(c);
  if ((S.fin.offered || []).includes(c.id) && chance(D.offered)) return { ok: true };
  const foe = S.fin.comp.map(C).find(o => likes(c.id, o.id) <= -2);
  if (c.rapport <= -2) return chance(D.foe) ? { ok: true, why: 'duty' } : { ok: false, why: 'you' };
  if (c.rapport === -1)
    return chance(k === 'honest' || k === 'conscientious' ? D.duty : D.foe) ? { ok: true, why: 'duty' } : { ok: false, why: 'you' };
  if (foe) return chance(D.grit) ? { ok: true, why: 'grit', foe } : { ok: false, why: 'foe', foe };
  if (chance(c.rapport <= 1 ? D.afraid : D.afraidFriend)) return { ok: false, why: 'afraid' }; // (a friend, seldom)
  return { ok: true };
}
// what they say, coming or not
function comeSay(c, w) {
  if (w.why === 'you')
    return bi(
      `<p>${c.short} will not come. “Not with you, Doctor. Not down there.”</p>`,
      `<p>${ru.c(c)} отказывается идти. «Только не с вами, доктор. Не туда».</p>`
    );
  if (w.why === 'foe' && !w.ok)
    return bi(
      `<p>${c.short} will not come. “Not with ${w.foe.short} at my back, Doctor.”</p>`,
      `<p>${ru.c(c)} отказывается идти. «Только не с ${ru.c(w.foe, 'i')} за спиной, доктор».</p>`
    );
  if (w.why === 'afraid')
    return pick([
      bi(
        `<p>${c.short} looks at the stair and goes grey. “I’m sorry, Doctor. Not down there. Not for anything.”</p>`,
        `<p>${ru.c(c)} смотрит на лестницу и сереет лицом. «Простите, доктор. Только не туда. Ни за что на свете».</p>`
      ),
      bi(
        `<p>${c.short} will not come. “I can’t. God forgive me, I can’t.”</p>`,
        `<p>${ru.c(c)} отказывается идти. «Не могу. Прости меня Господи — не могу».</p>`
      )
    ]);
  if (w.why === 'duty')
    return bi(
      `<p>${c.short} looks at you a long moment. “I don’t like you, Doctor. But I’ll not let you go down there alone.”</p>`,
      `<p>${ru.c(c)} долго смотрит на вас. «Вы мне не нравитесь, доктор. Но в одиночку я вас туда не отпущу».</p>`
    );
  if (w.why === 'grit')
    return bi(
      `<p>${c.short} looks at ${w.foe.short} and sets ${c.pp} jaw. “Very well. But I walk behind ${EP.him(w.foe)}, not in front.”</p>`,
      `<p>${ru.c(c)} смотрит на ${ru.c(w.foe, 'a')} и стискивает зубы. «Хорошо. Но я пойду позади ${ru.gs(w.foe, 'него', 'неё')}, а не впереди».</p>`
    );
  return '';
}
// A cultist behind you on the stair: strike at the fourth gate, or let it pass and wait for the sanctum.
const waits = t => chance(craft(t).patient);
// The end of the stair: whoever of the cult came down with you takes their place in the circle; one who waited may have
// taken the true ward from you on the way. Once, when you first reach the sanctum; returns who turned, and what you see.
function turnAtTheEnd() {
  const f = S.fin,
    none = { ids: [], html: '' };
  if (f.turnDone) return none;
  f.turnDone = true;
  // (one of the cult you asked to hold the seventh gate lets it fall shut behind you, and comes in all the same); and
  // now and then one of them, the likelier if fond of you, stops at the edge of the light and does not go to them
  const D = RULES.descent,
    held = f.g3 && f.g3.kind === 'comp' ? f.g3.id : null,
    cult = f.comp.map(C).filter(c => c.role === 'cult' && isFree(c) && (!f.left.includes(c.id) || c.id === held)),
    turned = cult.filter(c => chance(D.turn * (c.rapport >= 2 ? 1 - D.turnFond : 1)));
  // one of them you left behind on the way goes down to the circle by another way, all but always; now and then it does
  // not come at all (stayedAway)
  f.stayedAway = f.comp
    .map(C)
    .filter(c => c.role === 'cult' && isFree(c) && f.left.includes(c.id) && c.id !== held && !chance(D.turn))
    .map(c => c.id);
  f.heldBack = cult
    .filter(c => !turned.includes(c))
    .map(c => c.id)
    .concat(f.stayedAway);
  let h = f.heldBack
    .filter(id => !f.stayedAway.includes(id))
    .map(C)
    .map(t =>
      bi(
        `<p>${t.short} stops at the edge of the light, and looks at the circle a long time, and then at you. ${capS(t.p)} does not go to them.</p>`,
        `<p>${ru.c(t)} останавливается на краю света и долго смотрит на круг, а потом на вас — и не идёт к ним.</p>`
      )
    )
    .join('');
  if (!turned.length) return { ids: [], html: h };
  f.turned = turned.map(c => c.id);
  f.comp = f.comp.filter(id => !f.turned.includes(id));
  turned.forEach(t => {
    if (t.id === held)
      h += bi(
        '<p class="horror">Behind you the seventh gate swings shut. Nobody is holding it.</p>',
        '<p class="horror">Позади вас захлопываются седьмые врата. Никто их не держит.</p>'
      );
    h +=
      t.id === S.hierophant
        ? bi(
            `<p class="horror">${t.short} walks past you into the light and takes the place at the head of the circle, and the chanting rises to meet ${EP.him(t)}. The rite could not be finished without its hierophant. You brought ${EP.him(t)} down yourself.</p>`,
            `<p class="horror">${ru.c(t)} проходит мимо вас в круг света и встаёт во главе круга, и пение поднимается ${ru.gs(t, 'ему', 'ей')} навстречу. Без своего иерофанта обряд не мог завершиться. Вы сами ${ru.gs(t, 'привели его', 'привели её')} сюда.</p>`
          )
        : (f.offered || []).includes(t.id)
          ? bi(
              `<p class="horror">${t.short} walks past you into the light and takes a place in the circle. “I did say I would come down with you, Doctor.”</p>`,
              `<p class="horror">${ru.c(t)} проходит мимо вас в круг света и занимает место в круге. «Я ведь ${ru.gs(t, 'обещал', 'обещала')} спуститься с вами, доктор».</p>`
            )
          : bi(
              `<p class="horror">${t.short} walks past you into the light and takes a place in the circle. “You did ask me to come down with you, Doctor.”</p>`,
              `<p class="horror">${ru.c(t)} проходит мимо вас в круг света и занимает место в круге. «Вы ведь сами позвали меня с собой, доктор».</p>`
            );
  });
  const ward = S.wardOf[S.patron],
    thief = turned[0]; // (one who waited for the end is the first of the cult who came down with you)
  if (has(ward) && chance(RULES.descent.steal)) {
    lose(ward);
    f.stolen = ward;
    h += bi(
      `<p class="horror">You reach for ${theItem(ward)}, and your hand closes on nothing. Across the circle ${thief.short} holds ${V(ward, 'it', 'them')} up for you to see, and lets ${V(ward, 'it', 'them')} fall into the brazier.</p>`,
      `<p class="horror">Вы тянетесь за ${ru.item(ward, 'i')} — и рука сжимает пустоту. Через круг ${ru.c(thief)} поднимает ${ru.ig(ward, 'его', 'её', 'его', 'их')}, чтобы вы видели, и роняет в жаровню.</p>`
    );
  }
  return { ids: f.turned, html: h };
}
