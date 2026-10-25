// ===================== FATES: what became of everyone, and of you =====================
// The first part of the ending's debrief: a line for each of the seven, by what became of them in the season (taken,
// exposed, sent away, still free in the cult) or else by what they were; what they made of you; and now and then a
// flirtation that came to more, the likelier the fonder they were of each other and the less they suspected each other
// (or, for a woman with a soft spot for you, the more she trusted you). Which of several lines is told, and whether a
// flirtation came to anything, is fixed by the season (hash01 on its salt), never by the dice, so the next expedition is
// dealt exactly as before. The words are in data/fates.js.
const fateOf = (a, ...k) => hashPick(a, S.salt, ...k);
const fateRoll = (...k) => hash01(S.salt, ...k);

// a portrait for the list, with ids of its own
const endPortrait = cid => portrait(cid, 'neutral', 0, `end-${cid}-`);
// The flirtations that came to more, decided once as the season ends: { you: the woman who loves you, or null; pairs:
// two of the camp who left Kutha together, one way or another (strong: both fond, both taken with each other); mourn:
// one taken with someone the night took, and spoken for by nobody else }.
function romances() {
  const RF = RULES.flirt.romance,
    ok = c => c.status === 'present' && c.role !== 'cult',
    free = c => !VOWS.includes(c.id), // a priest keeps his vows, whoever was taken with him
    people = S.order.map(C),
    out = { you: null, pairs: [], mourn: [] };
  // (one who spent a night in your tent, and lived, first, and the likelier: people/visit.js)
  const v = S.log.visit,
    stayed = c => !!v && v.agreed && v.id === c.id && !v.struck,
    her = people
      .filter(c => ok(c) && S.flirt[c.id] && S.flirt[c.id].you && c.rapport >= RULES.flirt.trust)
      .sort((a, b) => stayed(b) - stayed(a) || b.rapport - a.rapport)[0];
  if (
    her &&
    fateRoll(her.id, 'love') <
      RF.you[Math.min(RULES.scale.trustMax, her.rapport) - RULES.flirt.trust] + (stayed(her) ? RULES.visit.love : 0)
  )
    out.you = her.id;
  // nobody has two romances: the woman who loves you has none other, two of the camp pair off only if neither is spoken
  // for, and only someone spoken for by nobody mourns
  const spoken = new Set(out.you ? [out.you] : []),
    both = f =>
      people.forEach((a, i) =>
        people.slice(i + 1).forEach(b => {
          const ab = flirtsWith(a.id, b.id),
            ba = flirtsWith(b.id, a.id);
          if ((ab || ba) && free(a) && free(b)) f(a, b, ab, ba);
        })
      );
  both((a, b, ab, ba) => {
    if (!ok(a) || !ok(b) || Math.min(likes(a.id, b.id), likes(b.id, a.id)) < 1 || spoken.has(a.id) || spoken.has(b.id)) return;
    const fond = likes(a.id, b.id) >= 2 && likes(b.id, a.id) >= 2,
      doubt = sus(a.id, b.id) >= 2 || sus(b.id, a.id) >= 2,
      clear = !sus(a.id, b.id) && !sus(b.id, a.id);
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
        spoken.add(left.id).add(dead.id); // (nobody is mourned by two)
      }
    })
  );
  return out;
}
// What became of everyone afterwards, each with a portrait (later: the deaths that came later, afterDeaths).
function endAfter(id, won, later = afterDeaths()) {
  const f = S.fin,
    ctx = { id, won, shot: f && f.acts.find(a => a.kind === 'shoot' && a.ok), doom: id.indexOf('doom') === 0, later };
  return (
    '<ul class="after">' +
    S.order
      .map(C)
      .map(c => endFate(c, ctx))
      .join('') +
    '</ul>'
  );
}
// One person's afterwards: by what became of them in the season, else by what they were; what they made of you stays
// with them (told otherwise if you did not come home: dead, or in a quiet ward; or if you are in a cell in Baghdad, for
// the one you killed); and a flirtation that came to more is told with the second of the two.
function endFate(c, ctx) {
  const { won } = ctx,
    gone = S.ended === 'madness' ? FATE_GONE.mad : S.ended === 'death' || S.ended === 'doom' ? FATE_GONE.dead : null,
    away = gone || (youInCell() ? FATE_GONE.jail : null),
    later = ctx.later && ctx.later[c.id];
  // (a death that came later is all that is told of them: afterDeaths)
  if (later) return fateItem(c, 'gone', bi(...FATE_AFTER[later.kind][later.k][later.line](c, later.d)));
  let t;
  if (c.status === 'taken') {
    // (the one you killed yourself: game/deed.js; whatever the camp knew or guessed of it, the inquest in Baghdad has its
    // own word; and of the graves, one that says nothing of how they died)
    const mine = c.takenBy === 'you',
      g = mine ? END_GRAVE[c.id][0] : fateOf(END_GRAVE[c.id], c.id, 'grave'),
      d = S.log.deed || {},
      inquest =
        S.ended === 'expelled'
          ? ['The inquest named you.', 'Дознание назвало ваше имя.']
          : d.vote
            ? [
                'The camp sat in judgement on you and let you stay; the inquest in Baghdad blamed the cult, and let it go at that.',
                'Лагерь судил вас и позволил остаться; дознание в Багдаде списало всё на культ — и на том успокоилось.'
              ]
            : d.caught || d.hinted || d.linked
              ? ['The inquest blamed the cult. Not everyone at Kutha did.', 'Дознание списало всё на культ. В Куте так думали не все.']
              : [
                  'The inquest blamed the cult, and nobody ever asked you anything.',
                  'Дознание списало всё на культ, и вас так никто ни о чём и не спросил.'
                ];
    t = mine
      ? bi(
          `${c.name} was found dead in ${c.pp} tent on night ${c.takenDay}. ${inquest[0]} ${EP.He(c)} is buried ${g[0]}.`,
          `${capS(ru.cf(c, 'a'))} нашли ${ru.gs(c, 'мёртвым', 'мёртвой')} в ${ru.gs(c, 'его', 'её')} палатке в ночь ${c.takenDay}. ${inquest[1]} ${ru.gs(c, 'Его', 'Её')} хоронят ${g[1]}.`
        )
      : bi(
          `${c.name} was taken on night ${c.takenDay}. ${EP.He(c)} is buried ${g[0]}.`,
          `${capS(ru.cf(c))} ${ru.gs(c, 'погиб', 'погибла')} в ночь ${c.takenDay}. ${ru.gs(c, 'Его', 'Её')} хоронят ${g[1]}.`
        );
  } else if (c.status === 'exposed') t = unmaskedFate(c).say(c);
  else if (c.status === 'dismissed')
    t = fateOf(c.role === 'smuggler' ? (gone ? FATE.thiefSentGone : FATE.thiefSent) : gone ? FATE.dismissedGone : FATE.dismissed, c.id)(c);
  else if (c.role === 'cult') t = endFateCult(c, ctx);
  else if (FATE[c.role]) t = fateOf(FATE[c.role][won ? 'win' : 'lose'], c.id)(c);
  else {
    const l = fateOf(END_LIFE[c.id][won ? 'win' : 'lose'], c.id);
    t = bi(l[0], l[1]);
  }
  const love = S.romance;
  if (c.status === 'present' && c.role !== 'cult') {
    if (love.you === c.id) {
      const l = away ? away.love : FATE_LOVE[c.id] || FATE_LOVE.any;
      t += ' ' + bi(l[0], l[1]);
    } else if (c.rapport >= 2 && flirtsWithYou(c)) {
      const l = away ? away.soft : FATE_SOFT[c.id] || FATE_SOFT.any;
      t += ' ' + bi(l[0], l[1]);
    } else if (c.rapport >= 2)
      // (the second of the lines told when you did not come home has a child in it, and a priest keeps his vows)
      t +=
        ' ' +
        fateOf(away ? (away === FATE_GONE.dead && VOWS.includes(c.id) ? away.friend.slice(0, 1) : away.friend) : FATE_FRIEND, c.id, 'friend')(c);
    else if (c.rapport <= -1) t += ' ' + fateOf(away ? away.enemy : FATE_ENEMY, c.id, 'enemy')(c);
  }
  love.pairs
    .filter(p => p.b === c.id)
    .forEach(p => {
      t += ' ' + fateOf(FATE_PAIR[p.strong ? 'strong' : 'mild'], p.a, p.b)(C(p.a), c);
    });
  love.mourn
    .filter(m => m.b === c.id)
    .forEach(m => {
      t += ' ' + fateOf(FATE_MOURN, m.a, m.b)(c, C(m.a));
    });
  t += codasOf(c, ctx);
  return fateItem(c, c.status === 'taken' ? 'gone' : '', t);
}
// The fate told of one of the cult who was unmasked, and where it leaves them (end: in a cell to be tried, the asylum,
// fled, or dead before any trial: data/fates.js, FATE.exposed and FATE.hierophant)
const unmaskedFate = c => fateOf(c.id === S.hierophant ? FATE.hierophant : FATE.exposed, c.id);
// one of the list, with a portrait
const fateItem = (c, cls, t) =>
  `<li class="${cls}"><svg class="ava" viewBox="46 30 108 108" aria-hidden="true">${endPortrait(c.id)}</svg><span>${t}</span></li>`;
// ---------- a death that came later ----------
// Now and then one of the seven who came through the season does not come through what it left in them: a death by
// their own hand (chosen), or one nobody can account for (strange) (RULES.fates.after; the words: data/fates.js,
// FATE_AFTER). The likelier for one sent away in disgrace, the true Dreamer, one who grieved, one who went down with
// you, one of the cult in a cell, the thief and his tablets, and when you yourself did not come home; told by one of its
// reasons, the weightier likelier, and by their own hand or not as that reason has it. Never one spoken for in a
// romance (theirs is told otherwise), never a priest by his own hand, never one of the cult still at large, never after
// a season the gate opened, and at most RULES.fates.after.most in an ending: the likeliest; two told the same way are
// told in different words. Fixed by the season, without the dice: { id: { kind, k, d, line } }.
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
    // (one of the cult in a cell has no other reason told: it went nowhere else, so its grief or the stair it went down
    // weigh on it, but the words that would send it to a grave or an empty house are not for a prisoner)
    const why = jailed ? [] : [{ k: 'plain', d: null, w: A.why.plain }];
    let p = A.base * (home ? 1 : A.gone);
    const lay = (k, d, x) => {
      p *= x;
      if (!jailed || k === 'cult') why.push({ k, d, w: A.why[k] });
    };
    if (jailed) lay('cult', null, A.jailed);
    if (c.status === 'dismissed' && c.role !== 'smuggler') lay('wronged', null, A.sent);
    if (c.role === 'seer') lay('dreams', null, A.dreamer);
    const m = S.mourning && S.mourning[c.id];
    if (m && S.chars[m.victim] && C(m.victim).status === 'taken') lay('grief', C(m.victim), A.grief);
    if (f && ((f.took || []).includes(c.id) || (f.g3 && f.g3.kind === 'comp' && f.g3.id === c.id))) lay('below', null, A.below);
    if (c.role === 'smuggler') lay('thief', null, A.thief);
    const q = Math.min(A.max, p),
      roll = fateRoll(c.id, 'after');
    if (roll >= q) return;
    const o = drawCodas(why, 1, i => fateRoll(c.id, 'afterWhy', i))[0];
    const kind = fateRoll(c.id, 'afterKind') < (A.chosen[o.k] || 0) && !VOWS.includes(c.id) ? 'chosen' : 'strange',
      k = FATE_AFTER[kind][o.k] ? o.k : 'plain';
    out.push({ id: c.id, kind, k, d: k === o.k ? o.d : null, by: roll / q });
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
// A cultist still at large at the end: shot, lost in the fire, gone into the desert or the dark, or waiting.
function endFateCult(c, { id, won, shot, doom }) {
  const n = c.name,
    N = capS(ru.cf(c)),
    he = c.p,
    He = EP.He(c),
    on = ru.gs(c, 'он', 'она');
  const second = S.order.filter(x => C(x).role === 'cult' && C(x).status === 'present' && !(shot && shot.id === x)).indexOf(c.id) === 1;
  if (shot && shot.id === c.id)
    return bi(
      `${n} dies where ${he} fell. The inquest in Baghdad finds that you fired in self-defence, and does not ask what ${he} was wearing.`,
      `${N} умирает там, где ${ru.gs(c, 'упал', 'упала')}. Дознание в Багдаде признаёт, что вы стреляли, защищая свою жизнь, и не спрашивает, во что ${ru.gs(c, 'он был одет', 'она была одета')}.`
    );
  if (id === 'burned')
    return second
      ? bi(
          `${n}’s body is the only one they find, and there is not a mark of fire on it.`,
          `Тело ${ru.cf(c, 'g')} — единственное, что удаётся найти, и на нём нет ни единого следа огня.`
        )
      : bi(
          `${n} is never found. The fire under E-meslam burns for three days.`,
          `${capS(ru.cf(c, 'a'))} так и не находят. Огонь под Э-месламом горит три дня.`
        );
  if (won && second)
    return bi(
      `${n} climbs out of the mound at noon and walks south into the desert, and nobody thinks to stop ${EP.him(c)}.`,
      `В полдень ${ru.cf(c)} выбирается из холма и уходит на юг, в пустыню, — и никому не приходит в голову ${ru.gs(c, 'его', 'её')} остановить.`
    );
  if (won)
    return bi(
      `${n} is found below at dawn among the cold braziers, speaking a language dead for three thousand years. ${He} never speaks another.`,
      `На рассвете ${ru.cf(c, 'a')} находят внизу, среди остывших жаровен: ${on} говорит на языке, мёртвом уже три тысячи лет. Ни на каком другом ${on} больше не заговорит.`
    );
  if (doom)
    return second
      ? bi(
          `${n} kneels at the top of the stair to wait for it, and is not there in the morning.`,
          `${N} опускается на колени у верхней ступени и ждёт — а к утру ${ru.gs(c, 'его', 'её')} там уже нет.`
        )
      : bi(
          `${n} walks into the dark behind what rose, and is not seen again.`,
          `${N} уходит во тьму вслед за тем, что поднялось, и больше ${ru.gs(c, 'его', 'её')} никто не видит.`
        );
  // (sent away in disgrace, you are there to read it yourself)
  if (second)
    return S.ended === 'expelled'
      ? bi(
          `${n} writes to you to say how very sorry ${he} is that it ended as it did. It is a kind letter, and the postmark is Kutha.`,
          `${N} пишет вам, как ${ru.gs(c, 'ему', 'ей')} жаль, что всё так кончилось. Письмо очень доброе, а на штемпеле — Кута.`
        )
      : bi(
          `${n} writes to your sister to say how very sorry ${he} is. It is a kind letter, and the postmark is Kutha.`,
          `${N} пишет вашей сестре, как ${ru.gs(c, 'ему', 'ей')} жаль. Письмо очень доброе, а на штемпеле — Кута.`
        );
  return bi(
    `${n} is never charged with anything. When the next season opens, ${he} is still at Kutha, waiting.`,
    `${capS(ru.cf(c, 'd'))} так и не предъявляют никаких обвинений. Когда открывается следующий сезон, ${on} всё ещё в Куте — и ждёт.`
  );
}
// ---------- what each of them carried away from the season ----------
// Everything that passed between them and you, or that they did or suffered in the season, that the ending could tell
// of (FATE_CODA): { k, g (which of its tellings: alive, dead, jailed, free, cult), d (what it is about), w (how much it
// weighs) }.
function codaFacts(c, ctx) {
  const out = [],
    add = (k, g, d, w) => out.push({ k, g, d, w }),
    cult = c.role === 'cult',
    dead = c.status === 'taken',
    jailed = c.status === 'exposed',
    // (what else can be told of one unmasked follows where their fate leaves them: in a cell, to be tried, or in the
    // asylum; at large, for one who fled; nothing more, for one who died before any trial: unmaskedFate)
    end = jailed ? unmaskedFate(c).end : null,
    cell = { trial: 'jailed', asylum: 'asylum' }[end] || null,
    alive = !dead && !jailed && !cult, // still at the dig, or sent away
    home = !!ctx.won;
  const m = S.mourning && S.mourning[c.id];
  if (m && m.done && !dead) {
    if (alive) add('consoled', 'alive', C(m.victim), 3);
    else if (cell) add('consoled', cell, C(m.victim), 3);
  }
  if (S.confidedIn.includes(c.id)) add('confided', cult ? 'cult' : dead ? 'dead' : 'alive', null, cult ? 3 : 2);
  if (S.log.pressedWho.includes(c.id) && (alive || cell)) add('pressed', alive ? 'alive' : cell, null, 1.5);
  if (c.role === 'warden' && S.log.attacks.some(a => a.how === 'guard') && (alive || dead))
    add('savedYou', alive ? 'alive' : 'dead', null, 3);
  const g = S.log.guarded.filter(x => x.id === c.id).pop();
  if (g && alive) add('guarded', 'alive', g.day, 2.5);
  // (the nights as the innocent lived them: what one of the cult found or did is no grief of its own)
  S.nights.forEach((rec, n) => {
    if (!rec || !alive) return;
    const at = rec.crimeLoc ? [LOCS[rec.crimeLoc].at, ru.loc(rec.crimeLoc, 'at')] : null; // (none, a night the cult came for no one)
    if (at && rec.finder === c.id && rec.target && S.chars[rec.target]) add('found', 'alive', { v: C(rec.target), at }, 2);
    else if (at && wasAbout(rec, c.id)) add('there', 'alive', { n, at }, 2);
    const asked = S.claims.some(x => x.night === n && x.id === c.id);
    if (home && asked && (rec.afraid || []).includes(c.id)) add('afraid', 'alive', n, 3);
    if ((rec.secret || []).includes(c.id) && rec.truth[c.id].with) add('secret', 'alive', { w: C(rec.truth[c.id].with), n }, 3);
    const sw = rec.saw[c.id];
    if (sw && sw.made && S.sights.some(x => x.night === n && x.id === c.id)) add('invented', 'alive', C(sw.who), 2.5);
  });
  const sp = S.log.spite.filter(x => x.id === c.id && (x.ok || x.caught)).pop();
  if (sp && alive) add('spite', 'alive', sp, 3);
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
      if (k) add('hand', 'alive', { x, k }, 1.5);
    });
  if (alive && credit(c.id)) add('credit', 'alive', Math.sign(credit(c.id)), 1.5);
  const f = S.fin;
  if (f && alive) {
    const held = f.g3 && f.g3.kind === 'comp' && f.g3.id === c.id;
    if (held || (f.took || []).includes(c.id)) add('below', 'alive', held ? 'held' : f.left.includes(c.id) ? 'left' : 'took', 2.5);
  }
  const pl = S.clues.find(cl => cl.source === 'plant' && cl.owner === c.id && !cl.extra);
  if (pl && alive) add('framed', 'alive', pl.day, 3);
  if (alive && c.role === 'seer' && S.seerPublic) add('dreamer', 'alive', home, 2);
  if (alive && c.role === 'smuggler' && S.witnessTold) add('told', 'alive', null, 2.5);
  if (cult && !dead && (!jailed || cell || end === 'fled')) {
    // (yours: you came home, or were sent home; a letter from a cell needs you alive to keep it, and eyes are closed only
    // where you were found, by one still at the dig: data/endings.js, nightDeath)
    const g2 = cell || 'free',
      yours = home || S.ended === 'expelled',
      youLive = S.ended !== 'death' && S.ended !== 'doom',
      found = !jailed && S.ended === 'death' && !S.fin && NIGHT_FOUND.includes(nightDeath());
    if (S.flirt[c.id] && S.flirt[c.id].you && c.rapport >= RULES.flirt.trust && (yours || (cell && youLive) || found))
      add('cultSoft', g2, yours, 4);
    else if (c.rapport >= 2) add('cultFriend', g2, yours ? 'home' : S.ended === 'doom' ? 'doom' : 'lost', 3);
    else if (c.rapport <= -1 && cell) add('cultFoe', cell, null, 2);
  }
  // one of each kind that has a telling here, the latest (two bodies found, two hands raised, two nights out would be
  // told twice over in the same words)
  const one = {};
  out
    .filter(o => FATE_CODA[o.k][o.g])
    .forEach(o => {
      one[o.k] = o;
    });
  return Object.values(one);
}
// n of a list of { w, … }, the weightier likelier, each at most once; without the dice (roll(i): the i-th draw, fixed
// by the season)
function drawCodas(list, n, roll) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const total = list.reduce((a, o) => a + o.w, 0);
    let r = roll(i) * total,
      k = 0;
    while (k < list.length - 1 && (r -= list[k].w) > 0) k++;
    out.push(list.splice(k, 1)[0]);
  }
  return out;
}
// A line or two more about someone, now and then: picked from what applies, the weightier likelier, without the dice.
function codasOf(c, ctx) {
  const facts = codaFacts(c, ctx),
    roll = fateRoll(c.id, 'codas'),
    n = Math.min(facts.length, roll < RULES.fates.codaNone ? 0 : roll < RULES.fates.codaOne ? 1 : 2);
  return drawCodas(facts, n, i => fateRoll(c.id, 'coda', i))
    .map(o => ' ' + bi(...fateOf(FATE_CODA[o.k][o.g], c.id, o.k)(c, o.d)))
    .join('');
}
// What became of you: after a season won, by the wounds you carried home and how near your nerve came to breaking;
// then, won or lost, a line or two of what the season left in you (FATE_YOU_CODA): one only, and never the reason
// itself, if in the end it was more than you could carry (last: yourLast, told last of all: lastSaid).
// (later: the deaths that came later, afterDeaths)
function endSelf(r, won = true, last = null, later = {}) {
  const w = S.wounds,
    k = w && w >= S.woundsMax - 1 ? 'nearly' : w ? 'wounded' : r.frayed ? 'shaken' : 'whole',
    l = won ? fateOf(FATE_YOU[k], 'you') : null,
    rest = youCodas(won, last, later);
  return l || rest ? `<p>${l ? bi(l[0], l[1]) : ''}${rest}</p>` : '';
}
// tried in Baghdad for the one you killed: sent away for the deed, and the deed was a killing (game/deed.js)
const youInCell = () => S.ended === 'expelled' && !!S.log.deed && S.log.deed.outcome === 'killed';
// the end you chose, and which of the season's lines about you it already tells
const LAST_CODA = { deed: 'deed', wronged: 'wronged', friends: 'grave', tablets: 'read', horrors: 'horrors' };
// (its words drawn on a key of their own: the roll that chose it was below last.max, and would draw the first line only)
const lastSaid = last =>
  last ? `<p>${bi(...fateOf(FATE_YOU_LAST[last.k][last.where], 'you', 'lastLine')(last.d))}</p>` : '';
// ---------- the end you chose ----------
// Rarely, what the season left in you is more than you can carry, and in the end you end it yourself (RULES.fates.last;
// the words: data/fates.js, FATE_YOU_LAST): mostly after a mind that broke (the quiet ward), seldom after a season won,
// or in a cell; the likelier the more the season laid on you (the one you killed, above all if they were no cultist; the
// innocents you sent away; the friends the night took; someone who died beside you; the words you read; the horrors; a
// nerve that all but broke), and the less for each friend who came through and for someone who loves you. Told by one
// of its reasons, the weightier likelier, where the season left you. Nobody who is dead already, and never after a
// season the gate opened. Fixed by the season, without the dice: { k: the reason, d: what it is about, where } or null.
// (later: the deaths that came later, afterDeaths: nobody is written to who is dead by then)
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
    why.push({ k, d, w });
  };
  const t = L.deed && L.deed.outcome === 'killed' ? C(L.deed.id) : null;
  if (t)
    lay('deed', { t, cult: t.role === 'cult' }, t.role === 'cult' ? F.killedCult : F.killedInnocent, t.role === 'cult' ? F.why.deedCult : F.why.deed);
  // (each innocent sent away weighs on you, but it is told by the last of them still alive to be written to)
  const wronged = L.accused.filter(a => !a.right && C(a.id).role !== 'smuggler').map(a => C(a.id)),
    living = wronged.filter(x => !later[x.id]);
  if (wronged.length && living.length)
    lay('wronged', living[living.length - 1], F.wronged ** wronged.length, F.why.wronged * wronged.length);
  else if (wronged.length) p *= F.wronged ** wronged.length;
  const lost = S.order.map(C).filter(c => c.status === 'taken' && c.takenBy !== 'you' && c.rapport >= 2);
  if (lost.length) lay('friends', lost[lost.length - 1], F.grief ** lost.length, F.why.friends * lost.length);
  const v = L.visit;
  if (v && (v.found === 'dead' || v.through === 'her')) lay('tent', C(v.id), F.tent, F.why.tent);
  if (L.studyCost >= RULES.fates.read || S.factKnown.length >= RULES.fates.lines) lay('tablets', null, F.read, F.why.tablets);
  if (L.horrorNerve >= RULES.fates.horrors) lay('horrors', null, F.horrors, F.why.horrors);
  const friends = S.order.map(C).filter(c => isFree(c) && c.role !== 'cult' && c.rapport >= 2).length;
  p *= F.friend ** Math.min(3, friends) * (S.romance && S.romance.you ? F.loved : 1);
  if (fateRoll('you', 'last') >= Math.min(F.max, p)) return null;
  // (a reason with no telling where you are is not told there)
  const o = drawCodas(
    why.filter(x => FATE_YOU_LAST[x.k][where]),
    1,
    i => fateRoll('you', 'lastWhy', i)
  )[0];
  return { k: o.k, d: o.d, where };
}
// (later: the deaths that came later, afterDeaths: nobody is written to who is dead by then)
function youCodas(won, last = null, later = {}) {
  const L = S.log,
    out = [],
    // where the season left you: home (sent home in disgrace is home all the same), a cell in Baghdad (game/deed.js:
    // told there as at home, but for what a prisoner cannot do, go out in the heat or to a grave), or not: dead, or in a
    // quiet ward (gone: either)
    jailed = youInCell(),
    where = won || S.ended === 'expelled' ? 'home' : S.ended === 'madness' ? 'mad' : 'dead',
    tells = k =>
      jailed
        ? FATE_YOU_CODA[k].jail || (['peril', 'grave'].includes(k) ? null : FATE_YOU_CODA[k].home)
        : FATE_YOU_CODA[k][where] || (where !== 'home' ? FATE_YOU_CODA[k].gone : null),
    add = (k, d, w) => tells(k) && !(last && LAST_CODA[last.k] === k) && out.push({ k, d, w });
  if (L.studyCost >= RULES.fates.read || S.factKnown.length >= RULES.fates.lines) add('read', null, 3);
  const p = L.perils.filter(x => x.w || x.k === 'heat').pop();
  if (p) add('peril', p.k, 2);
  const sp = L.spite.filter(x => x.ok || x.caught).pop();
  if (sp) add('spite', { c: C(sp.id), caught: sp.caught }, 2);
  const wr = L.accused.filter(a => !a.right && !later[a.id]).pop();
  if (wr) add('wronged', C(wr.id), 3);
  const gr = S.order
    .map(C)
    .filter(c => c.status === 'taken' && c.rapport >= 2)
    .pop();
  if (gr) add('grave', gr, 2.5);
  // (one you left on the stair: not whoever held the seventh gate for you, nor one of the cult, who went to the circle)
  const g3 = S.fin && S.fin.g3,
    left = S.fin ? S.fin.left.filter(id => !(g3 && g3.kind === 'comp' && g3.id === id) && C(id).role !== 'cult') : [],
    lb = left.length ? C(left[left.length - 1]) : null;
  if (lb) add('leftBelow', lb, 2.5);
  const fr = S.order.map(C).filter(c => isFree(c) && c.role !== 'cult' && c.rapport >= 2).length;
  if (fr >= 2) add('friends', fr, 1.5);
  if (L.horrorNerve >= RULES.fates.horrors) add('horrors', null, 2);
  if (L.deed && L.deed.outcome && L.deed.outcome !== 'away')
    add('deed', { t: C(L.deed.id), killed: L.deed.outcome === 'killed', gun: L.deed.means === 'revolver' }, 4); // (game/deed.js)
  const n = Math.min(out.length, last || fateRoll('you', 'codas') < RULES.fates.youOne ? 1 : 2);
  return drawCodas(out, n, i => fateRoll('you', 'coda', i))
    .map(o => ' ' + bi(...fateOf(tells(o.k), 'you', o.k)(o.d)))
    .join('');
}
