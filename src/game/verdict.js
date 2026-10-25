// ===================== THE CAMP'S VERDICT: an inquiry needs the camp behind it =====================
// You cannot send anyone away on your word alone. At an inquiry you lay out your case, and each of the camp makes up
// their own mind (RULES.verdict): what they already suspect, what you can show them, how far they trust you and how far
// they take your word, how fond they are of the one accused, how many the night has taken, how angry your inquiries
// have made them, and the mood in the tent that evening. The cult weighs it the same way, with a little of its own
// interest on top (CRAFT: push, defend, sacrifice). With too few on your side, or as many against it, the camp will not
// do it: the one accused stays, and holds it against you. At first most of the camp gives a newcomer the benefit of the
// doubt; each will take your word more readily once you have unmasked one of the cult, and less, by chance, once you
// have sent an innocent away. Each innocent sent away and each inquiry refused angers the camp, and for the next evening
// or two it wants more; each cultist unmasked calms it; an angry camp may hold no more inquiries, and the diggers then
// down tools for a day. Every hand raised is said before everyone, and remembered until the truth comes out
// (people/camp.js).

// ---------- the case you can make ----------
// From what you know: traces at the scenes that fit them, as far as you have seen their habits (a planted or a thief's
// trace, once seen for what it is, counts for nothing); someone passed in the dark who fits their habits; an account of
// a night belied by the very person they named; strong words against them (a slip, a slip of the tongue about the
// night, a witness), dreams of their guilt or innocence, a sworn watch slept through, a flinch at an old charm, a hint
// at their nights, distrust voiced by others. At most caseCap.
function caseAgainst(x) {
  const VR = RULES.verdict;
  let s =
    VR.sight * sightedAs(x).length + VR.lie * belied(x).length + VR.there * S.claims.filter(cl => cl.id === x.id && wasThere(cl)).length;
  S.clues.forEach(cl => {
    if (notAttackers(cl) || x.known[cl.cat] !== cl.val) return; // (as far as you have noted their habits)
    // (a trace by your tent pole tells of harm meant you in secret, not of the night's work: as much as being caught at it)
    s += cl.source === 'spite' ? VR.spite : cl.status === 'genuine' ? VR.genuine : VR.trace;
  });
  S.testimony
    .filter(t => t.about === x.id && !discredited(t))
    .forEach(t => {
      if (t.kind === 'slip' || t.kind === 'blurt' || t.kind === 'witness') s += VR.strong;
      else if (t.kind === 'vision') s += t.verdict === 'cult' ? VR.dream : -VR.dream;
      else if (t.kind === 'failwatch') s += VR.failwatch;
      else if (((t.kind === 'react' || t.kind === 'words') && t.verdict === 'fear') || t.kind === 'hint') s += VR.flinch;
      else if (t.kind === 'distrust') s += VR.distrust;
      else if (t.kind === 'spite') s += VR.spite;
    });
  return Math.max(0, Math.min(VR.caseCap, s));
}
// an account of a night that puts them, by their own word, where it happened (not the one attacked there)
const wasThere = cl => !cl.attacked && cl.loc !== 'camp' && !!S.nights[cl.night] && cl.loc === S.nights[cl.night].crimeLoc;
// sightings in the dark, by someone else, that fit what you know of someone's habits
const sightedAs = x => S.sights.filter(sg => sg.id !== x.id && x.known[sg.cat] === sg.val);
// what the camp no longer weighs: the word of one of the cult unmasked, and the dreams of someone who has owned that
// they never dreamed
function discredited(t) {
  const c = S.chars[t.from];
  return !!c && ((c.role === 'cult' && c.status === 'exposed') || (t.kind === 'vision' && claimOf(c).role !== 'seer'));
}
// the accounts someone gave of a night that the person they named does not bear out: they say they spent the evening
// with someone who, asked in turn, says otherwise (one who will not say where they were bears out nothing, and belies
// nothing either)
const belied = x =>
  S.claims.filter(cl => {
    if (cl.id !== x.id || !cl.with) return false;
    const o = S.claims.find(k => k.night === cl.night && k.id === cl.with);
    return o && o.loc !== 'evade' && o.with !== x.id;
  });
// the camp's mood, at the start of an inquiry, once it has begun to sour, or tires of inquiries that came to nothing
function angerSay() {
  const a = S.anger || 0,
    W = RULES.verdict.walkoutFrom;
  if (a >= W)
    return `<p class="warn">${bi('The camp’s patience is wearing thin. Send the wrong person away now, or ask too much of them, and there may be no more inquiries.', 'Терпение лагеря на исходе. Отошлите сейчас не того или потребуйте от них слишком многого — и дознаний может больше не быть.')}</p>`;
  if (a >= W / 2)
    return `<p class="warn">${bi('The camp is restless. They came, but not all of them meet your eye.', 'Лагерь неспокоен. Пришли все, но в глаза вам смотрят не все.')}</p>`;
  if (wearyOf())
    return `<p class="warn">${bi('They come slowly, and someone at the back says what the rest are thinking: another one, so soon?', 'Собираются нехотя, и кто-то сзади говорит вслух то, что думают остальные: опять, так скоро?')}</p>`;
  return '';
}

// ---------- how far each of the camp takes your word ----------
// Dealt with the season, without the dice: a newcomer's word to begin with, their temperament's, and who they are.
function dealWord() {
  const VR = RULES.verdict;
  S.standing = {};
  S.order.forEach(id => {
    S.standing[id] = VR.word + TP(C(id)).word + VR.wordSpread * (2 * hash01(S.salt, id, 'word') - 1);
  });
}
const word = o => (S.standing && S.standing[o.id]) || 0;
// Once the truth about the one accused is out (right: one of the cult unmasked; wrong: an innocent sent away; refused:
// the camp would not do it), each of the camp outside the cult may take your word more readily, or less, by chance
// (after a refused inquiry, only those who did not stand with you).
function weighWord(x, vote, outcome) {
  const VR = RULES.verdict;
  freeChars()
    .filter(o => o.id !== x.id && o.role !== 'cult' && !(outcome === 'refused' && vote.back.includes(o.id)))
    .forEach(o => {
      const backed = vote.back.includes(o.id);
      const [p, d] =
        outcome === 'right'
          ? [VR.proven + (backed ? VR.provenBacked : 0), VR.gain]
          : outcome === 'wrong'
            ? [
                VR.doubt +
                  (Ties.fond(o.id, x.id) ? VR.doubtFriend : 0) -
                  (backed ? VR.doubtShared : 0) -
                  (VR.doubtCase * vote.case) / VR.caseCap,
                -VR.loss
              ]
            : [VR.doubtRefused, -VR.lossRefused];
      if (chance(clamp(p))) S.standing[o.id] = Math.max(VR.wordMin, Math.min(VR.wordMax, word(o) + d));
    });
}

// ---------- the vote ----------
// How one of the camp outside the cult leans, before the evening's mood and their own whim (the thief who saw the
// accused at it is as sure as anyone can be, though he has said nothing: people/thief.js).
function leaning(o, x, cs) {
  const VR = RULES.verdict;
  return (
    (sawAtIt(o, x) ? RULES.scale.suspicion : sus(o.id, x.id)) +
    cs +
    VR.trust * o.rapport +
    word(o) -
    VR.like * likes(o.id, x.id) +
    VR.fear * Math.min(S.stats.taken, VR.fearCap) -
    VR.anger * (S.anger || 0) -
    VR.again * wearyOf()
  );
}
// the inquiries of the last few evenings that came to nothing, or sent an innocent away: the camp tires of them
const wearyOf = () =>
  S.inquiries.filter(v => v.day < S.day && v.day >= S.day - RULES.verdict.againDays && !(v.passed && C(v.id).role === 'cult')).length;
// The cult's own interest, on top of the leaning anyone in its place would show (so that its hands, counted over a
// season, look like everyone's): toward seeing an innocent sent away (push), the more once it has learned you lean on
// inquiries (people/cunning.js, cultTurns); toward sparing one of its own (defend); and one of its own who looks lost
// anyway it may give up outright (bus: the camp's good opinion is cheap at that price). By its craft, each.
function cultLean(o, x) {
  const k = craft(o),
    VC = RULES.verdict.cult;
  if (x.role !== 'cult') return VC.push * k.push * cultTurns('inquisitor');
  return looksLost(x) && chance(VC.bus * k.sacrifice) ? VC.give : -VC.defend * k.defend;
}
// The camp's hands, at an inquiry or when it sits in judgement on you (game/deed.js, youVote): each of the crowd leans
// (lean, then the evening's mood, the same for everyone in the tent, their own whim, and last what more they bring:
// extra), for it at hi or more, against it below lo, else silent; and anyone, now and then, raises a hand against their
// own leaning (contrary: no hand is ever sure). It passes with at least need of them for it, and more for it than
// against. With nobody left at the dig to raise a hand, it falls to the police corporal from Hillah, who takes your word,
// or not (alone): your word is for it at an inquiry, against it when the camp judges you (mine: 'for' or 'against').
// Returns { for, against, silent } (ids) and passed.
function handsRaised(crowd, lean, extra, hi, lo, mine) {
  const VR = RULES.verdict,
    out = { for: [], against: [], silent: [] },
    mood = VR.mood * tenorOf('swing') * (2 * rand() - 1);
  crowd.forEach(o => {
    const s = lean(o) + mood + VR.whim * (2 * rand() - 1) + extra(o);
    let v = s >= hi ? 'for' : s < lo ? 'against' : 'silent';
    if (chance(VR.contrary)) v = pick(['for', 'against', 'silent'].filter(h => h !== v));
    out[v].push(o.id);
  });
  if (crowd.length) out.passed = out.for.length >= Math.min(VR.need, crowd.length) && out.for.length > out.against.length;
  else {
    const taken = chance(VR.alone); // (the corporal takes your word)
    out.passed = mine === 'for' ? taken : !taken;
  }
  return out;
}
// Everyone free but the one accused: { back, against, silent } (ids), passed, and the case you made.
function campVote(x) {
  const VR = RULES.verdict,
    cs = caseAgainst(x),
    h = handsRaised(
      freeChars().filter(o => o.id !== x.id),
      o => leaning(o, x, cs),
      o => (o.role === 'cult' ? cultLean(o, x) : 0),
      VR.back,
      VR.against,
      'for'
    ),
    out = { back: h.for, against: h.against, silent: h.silent, case: cs, passed: h.passed };
  // every raised hand is said before everyone, and settled when the truth about the accused comes out
  out.back.forEach(id => sayPublic(id, x.id, 'cult', 'vote'));
  out.against.forEach(id => sayPublic(id, x.id, 'clean', 'vote'));
  S.inquiries.push({ day: S.day, id: x.id, back: out.back, against: out.against, silent: out.silent, passed: out.passed });
  return out;
}
// the hands, as you see them
function voteLine(v) {
  const n = ids => nameList(ids),
    nr = ids => nameListRu(ids);
  const nobody = !v.back.length && !v.against.length && !v.silent.length;
  // (with nobody left at the dig to raise a hand, it is the police corporal from Hillah who decides: campVote)
  if (nobody)
    return `<p class="notice">${bi(
      `You lay out your case. There is nobody left at the dig to raise a hand, and it falls to the police corporal from Hillah to decide.${v.passed ? ' He takes your word for it.' : ''}`,
      `Вы излагаете всё, что у вас есть. Поднять руку на раскопе уже некому, и решать приходится капралу из Хиллы.${v.passed ? ' Он верит вам на слово.' : ''}`
    )}</p>`;
  const en = [
      v.back.length ? `${n(v.back)} ${v.back.length > 1 ? 'side' : 'sides'} with you.` : 'Nobody sides with you.',
      v.against.length ? `${n(v.against)} ${v.against.length > 1 ? 'speak' : 'speaks'} against it.` : '',
      v.silent.length ? `${n(v.silent)} ${v.silent.length > 1 ? 'say' : 'says'} nothing.` : ''
    ],
    rus = [
      v.back.length ? `На вашей стороне: ${nr(v.back)}.` : 'На вашу сторону не встаёт никто.',
      v.against.length ? `Против: ${nr(v.against)}.` : '',
      v.silent.length ? `${v.silent.length > 1 ? 'Молчат' : 'Молчит'}: ${nr(v.silent)}.` : ''
    ];
  return `<p class="notice">${bi(
    'You lay out your case, and the camp gives its answer. ' + en.filter(Boolean).join(' '),
    'Вы излагаете всё, что у вас есть, и лагерь даёт ответ. ' + rus.filter(Boolean).join(' ')
  )}</p>`;
}

// ---------- the camp says no ----------
// The one accused stays, and holds it against you, whatever they are; the cult knows, if it was one of its own, that
// you are close. Someone speaks for the rest; you lose nerve, the camp grows angrier, and some of it may take your word
// less readily.
function refusedInquiry(x, v) {
  S.log.refusedInq.push({ id: x.id, day: S.day });
  weighWord(x, v, 'refused');
  pullTo('tongues', TENOR.pulls.refused);
  const grudge = grudgeOf(x);
  if (x.role === 'cult' && chance(RULES.verdict.alerts)) S.alerted = true;
  // who says it: the fondest of the accused among those who spoke against it, for all of them (or, the only one there
  // besides you and the accused, for themself); else, nobody having spoken against it, one of those who said nothing,
  // breaking the silence
  const likedBest = ids => ids.slice().sort((a, b) => likes(b, x.id) - likes(a, x.id))[0],
    against = likedBest(v.against),
    sp = C(against || likedBest(v.silent)),
    many = v.back.length + v.against.length + v.silent.length > 1,
    says = !sp
      ? null
      : against
        ? many
          ? [`${sp.short} says it for all of them:`, `${ru.c(sp)} говорит за всех:`]
          : [`${sp.short} says it plainly:`, `${ru.c(sp)} говорит прямо:`]
        : [`At last ${sp.short} breaks the silence:`, `Наконец ${ru.c(sp)} нарушает молчание:`];
  const wronged = S.log.accused.filter(a => !a.right).map(a => C(a.id));
  let line;
  if (wronged.length) {
    const w = wronged[wronged.length - 1];
    line = [
      `“You sent ${w.short} away on less. Not again, Doctor.”`,
      `«${capS(ru.c(w, 'a'))} вы отослали и с меньшим. Больше — нет, доктор».`
    ];
  } else if (!v.case)
    line = [
      `“You have nothing on ${x.short}, Doctor. Nothing any of us can see.”`,
      `«У вас ничего нет против ${ru.c(x, 'g')}, доктор. Ничего, что видели бы мы».`
    ];
  else
    line = pick(
      [
        ['“Not on that, Doctor. Not on what you have shown us.”', '«Не на этом основании, доктор. Не с тем, что вы нам показали».'],
        S.stats.taken
          ? [
              `“We have buried enough this week without burying ${x.short}’s good name as well.”`,
              `«Мы и так довольно хоронили на этой неделе, чтобы хоронить ещё и доброе имя ${ru.c(x, 'g')}».`
            ]
          : null
      ].filter(Boolean)
    );
  S.anger = (S.anger || 0) + vary(RULES.verdict.refused);
  return (
    `<p>${
      sp
        ? bi('The camp will not do it.', 'Лагерь на это не пойдёт.') + ' ' + bi(`${says[0]} ${line[0]}`, `${says[1]} ${line[1]}`)
        : // (nobody left to say it: campVote, voteLine)
          bi('He will not take anyone away on your word alone.', 'Никого не станет он увозить с одних ваших слов.')
    }</p>` +
    `<p>${
      grudge === 'none'
        ? bi(
            `${x.short} stays at the dig, and seems, strangely, to bear you no grudge for it.`,
            `${ru.c(x)} остаётся в лагере — и, как ни странно, будто бы не держит на вас зла.`
          )
        : grudge === 'half'
          ? bi(
              `${x.short} stays at the dig. It will be some time before ${x.p} can forgive you this.`,
              `${ru.c(x)} остаётся в лагере. Пройдёт немало времени, прежде чем ${ru.gs(x, 'он', 'она')} сможет вам это простить.`
            )
          : bi(`${x.short} stays at the dig, and will not forgive you this.`, `${ru.c(x)} остаётся в лагере — и этого вам не простит.`)
    }</p>` +
    hurt(RULES.inquiry.nerveRefused, 0) +
    walkoutIf()
  );
}
// One accused in vain holds it against you: for good, mostly (grudge); otherwise as one turned against you; now and then
// only a step, for they half understand (forgive; twice as readily for the honest and the conscientious, and for a
// friend); and, hardly ever (scale.rarest: nothing is certain), not at all.
// Returns how it went: 'none', 'half' (they half understood) or 'full'.
function grudgeOf(c) {
  const VR = RULES.verdict,
    soft = ['honest', 'conscientious'].includes(temperOf(c)) || Ties.friend(c);
  if (chance(RULES.scale.rarest)) return 'none';
  if (chance(VR.forgive * (soft ? 2 : 1))) {
    trustDown(c);
    return 'half';
  }
  c.rapport = chance(VR.grudge) ? -2 : Math.min(c.rapport, -1);
  return 'full';
}
// after an inquiry: the camp's anger moves, about so far; after a wrong one, an angry camp may hold no more
function angerAfter(right) {
  const VR = RULES.verdict;
  S.anger = Math.max(0, (S.anger || 0) + (right ? -vary(VR.right) : vary(VR.wrong)));
  return right ? '' : walkoutIf();
}
// after a day without an inquiry the camp's anger cools overnight, about so far (cool), but hardly ever below what it
// holds for the innocents sent away (forget: the night it lets go of that too); called at dawn, so the day that ended is
// yesterday
function coolOff() {
  const VR = RULES.verdict,
    a = S.anger || 0;
  if (S.inquiries.some(v => v.day === S.day - 1)) return;
  S.anger = Math.max(a - vary(VR.cool), chance(VR.forget) ? 0 : Math.min(a, VR.wrong * S.stats.wrong));
}
// A camp that walked out may think better of it at dawn (relent; the likelier the morning after a death): then it will
// hear you again. Returns the line that tells of it.
function relentAtDawn(death) {
  const VR = RULES.verdict;
  if (!S.walkout || S.walkout >= S.day || !chance(VR.relent + (death ? VR.relentDeath : 0))) return '';
  S.log.relented = S.day;
  S.walkout = null;
  // (Hamid, the foreman, if he is still at the dig; else the oldest of his pickmen)
  const hm = isFree(C('hamid'));
  return `<p class="event">${bi(
    `At breakfast ${hm ? 'Hamid comes' : 'the oldest of the pickmen comes'} to your tent, cap in hand. The men have talked again in the night: if you have something to put before them, they will hear it.`,
    `За завтраком к вашей палатке приходит ${hm ? 'Хамид' : 'самый старый из землекопов'}, комкая в руках шапку. Ночью люди снова всё обсудили: если вам есть что им сказать, они выслушают.`
  )}</p>`;
}
// After an inquiry that went against you, an angry camp may decide it has had enough: the angrier, the likelier, never
// certain. Then there are no more inquiries, and the next day the diggers do not dig (unless the season ends first).
function walkoutIf() {
  const VR = RULES.verdict,
    anger = S.anger || 0;
  if (S.walkout || anger < VR.walkoutFrom || !chance(Math.min(RULES.scale.most, (anger - VR.walkoutFrom + 1) * VR.walkoutStep))) return '';
  S.walkout = S.day;
  if (!S.log.walkedOut) S.log.walkedOut = S.day; // (the first walkout, kept for the ending even if the camp relents)
  const last = S.day >= RULES.start.days;
  if (!last) S.strikeDay = S.day + 1;
  // the foreman speaks for them, or whoever trusts you least (one of the cult would be glad to)
  const pool = freeChars(),
    sp = pool.find(c => c.id === 'hamid') || pool.sort((a, b) => a.rapport - b.rapport)[0];
  const strike = last
    ? ['', '']
    : [' Tomorrow, they say, the diggers will not dig.', ' А завтра, говорят они, землекопы не выйдут на работу.'];
  return (
    (sp
      ? `<p class="event">${bi(`That night ${sp.short} comes to your tent, and the others behind ${EP.him(sp)}. They have talked it over: there will be no more inquiries.${strike[0]}`, `Ночью к вашей палатке приходит ${ru.c(sp)}, а за ${ru.gs(sp, 'ним', 'ней')} — остальные. Они всё обсудили: больше никаких дознаний.${strike[1]}`)}</p>`
      : `<p class="event">${bi(`That night the diggers send word to your tent: there will be no more inquiries${last ? '' : ', and tomorrow they will not dig'}.`, `Ночью землекопы передают вам: больше никаких дознаний${last ? '' : ', а завтра они не выйдут на работу'}.`)}</p>`) +
    `<p class="loss">${bi(`No more inquiries${last ? '' : ' · the diggers mean to strike tomorrow'}`, `Больше никаких дознаний${last ? '' : ' · завтра землекопы грозят не выйти на работу'}`)}</p>`
  );
}
