// ===================== THE DEBRIEF: what the ending page tells =====================
// What became of everyone, every reason the season ended as it did, the season in numbers, and the truth: every part,
// temperament, claim and feeling. Which ending it is, and how it is scored, is decided in game/endings.js. Nothing here
// throws the game's dice.

// ---------- why it ended as it did ----------
// The reasons behind the ending, one line each, for you or against you, told in this order: the way down, what waited
// between the gates and what you did at the bottom (if you went down), the ward, the cult and its craft, the innocent
// who looked guilty, the Dreamer and
// the Watcher, what people claimed to be, the camp and you, why the night chose whom it chose, the dead and the nights,
// your notebook, you yourself, body and mind, and the season's mood (game/tenor.js).
function endFactors(id, r, haunt, won) {
  const F = [],
    f = S.fin;
  const x = {
    id,
    r,
    haunt,
    won,
    f,
    L: S.log,
    ward: S.wardOf[S.patron],
    G: GODS[S.patron].name,
    // the cult was still down there with you at the bottom
    cultBelow:
      f &&
      !f.empty &&
      id !== 'emptied' &&
      (f.acts.length > 0 || ['sealed', 'banished', 'shot', 'burned', 'scarred'].includes(id) || id.indexOf('doom') === 0),
    add: (k, en, rus) => x.raw(k, bi(en, rus)),
    // a line already in both languages (html)
    raw: (k, html) =>
      F.push(
        `<li class="${{ p: 'fx-plus', m: 'fx-minus', n: 'fx-note' }[k]}"><span class="fx-sign" aria-hidden="true">${k === 'p' ? '+' : k === 'm' ? '−' : '•'}</span><span>${html}</span></li>`
      )
  };
  [
    fxWayDown,
    fxCompany,
    fxTreachery,
    fxSeventhGate,
    fxBelow,
    fxSanctum,
    fxWard,
    fxCult,
    fxVerdict,
    fxCunning,
    fxMisfortune,
    fxSpite,
    fxFalseDreamer,
    fxDreamer,
    fxYourDreams,
    fxWatcher,
    fxThief,
    fxClaims,
    fxCamp,
    fxVictims,
    fxNights,
    fxDeed,
    fxVisit,
    fxNotebook,
    fxYourself,
    fxSeason
  ].forEach(step => step(x));
  return `<ul class="factors">${F.join('')}</ul>`;
}
// " He was the hierophant.", after a line about one of the cult
const fxHier = c =>
  c.id === S.hierophant ? [` ${EP.He(c)} was the hierophant.`, ` ${ru.gs(c, 'Он был', 'Она была')} иерофантом.`] : ['', ''];
// The way down: the night it opened, and the power you named.
function fxWayDown({ f, r, G, add }) {
  if (!f) return;
  const fem = ru.gf(S.patron);
  if (f.why === 'priestless')
    add(
      'n',
      'The rite had come too far to die with its priests: the gate opened of itself as the last of them was taken away.',
      'Обряд зашёл слишком далеко, чтобы умереть вместе со своими жрецами: врата открылись сами, едва увезли последнего из них.'
    );
  else if (f.early)
    add(
      'm',
      `The rite outran you: the gate opened on night ${S.day}, before the dark of the moon.`,
      `Обряд вас опередил: врата открылись в ночь ${S.day}, ещё до новолуния.`
    );
  if (!f.named) add('n', 'You went down without naming any power.', 'Вы спустились вниз, так и не назвав ни одной силы.');
  else if (r.namedOk)
    add(
      'p',
      `You named ${G} before you went down, and you were right.`,
      `Перед спуском вы назвали ${ru.god(S.patron, 'a')} — и не ошиблись.`
    );
  else
    add(
      'm',
      `You named ${GODS[f.named].name}. It was ${G}.`,
      `Вы назвали ${ru.god(f.named, 'a')}. А ${fem ? 'это была' : 'это был'} ${ru.god(S.patron)}.`
    );
}
// Who went down with you (whatever became of them below), and who had offered to before you asked.
function fxCompany({ f, add }) {
  if (!f) return;
  const went = f.took || [];
  (f.offered || [])
    .filter(x => went.includes(x))
    .forEach(x => {
      const c = C(x);
      add(
        c.role === 'cult' ? 'm' : 'p',
        `${c.name} offered to come down with you before you asked${c.role === 'cult' ? ', and you let ' + EP.him(c) : ''}.`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'вызвался', 'вызвалась')} идти с вами прежде, чем вы попросили${c.role === 'cult' ? ', — и вы ' + ru.gs(c, 'его', 'её') + ' взяли' : ''}.`
      );
    });
  if (!went.length) add('n', 'You went down alone.', 'Вы спустились в одиночку.');
  else
    add(
      went.every(x => C(x).role !== 'cult') ? 'p' : 'n',
      `${endNames(went)} went down with you.`,
      `С вами ${went.length > 1 ? 'спустились' : ru.gs(C(went[0]), 'спустился', 'спустилась')} ${endNamesRu(went)}.`
    );
}
// The cult on the stair: one you took down at the fourth gate, a knife in your back there, one who walked beside you
// to the end and joined the circle, one you left behind who joined it all the same, and the true ward taken from you
// on the way.
function fxTreachery({ f, r, add }) {
  if (!f) return;
  r.gate.forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add(
      'p',
      `At the fourth gate you turned in time, and took ${c.name} down.${h[0]}`,
      `У четвёртых врат вы обернулись вовремя и скрутили ${ru.cf(c, 'a')}.${h[1]}`
    );
  });
  f.betrayed.forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add(
      'm',
      `${c.name} put a knife in you at the fourth gate.${h[0]}`,
      `У четвёртых врат ${ru.cf(c)} ${ru.gs(c, 'всадил', 'всадила')} в вас нож.${h[1]}`
    );
  });
  (f.turned || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add(
      'm',
      `${c.name} walked down beside you all the way, and at the end took a place in the cult’s circle.${h[0]}`,
      `${capS(ru.cf(c))} ${ru.gs(c, 'шёл', 'шла')} рядом с вами всю дорогу вниз, а в конце ${ru.gs(c, 'занял', 'заняла')} место в круге секты.${h[1]}`
    );
  });
  (f.cameBack || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    add(
      'm',
      `${c.name} was left behind on the way down, but went down to the circle by another way, and took ${c.pp} place in it.${h[0]}`,
      `${capS(ru.cf(c))} ${ru.gs(c, 'остался', 'осталась')} позади на пути вниз, но другой дорогой ${ru.gs(c, 'спустился', 'спустилась')} к кругу и ${ru.gs(c, 'занял', 'заняла')} в нём своё место.${h[1]}`
    );
  });
  (f.heldBack || []).forEach(x => {
    const c = C(x),
      h = fxHier(c);
    if ((f.stayedAway || []).includes(x))
      add(
        'p',
        `${c.name} was left behind on the way down, and never took the place the circle kept for ${EP.him(c)}.${h[0]}`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'остался', 'осталась')} позади на пути вниз и так и не ${ru.gs(c, 'занял', 'заняла')} места, которое ${ru.gs(c, 'ему', 'ей')} оставили в круге.${h[1]}`
      );
    else
      add(
        'p',
        `${c.name} walked down beside you all the way, and at the end would not take the place the circle kept for ${EP.him(c)}.${h[0]}`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'шёл', 'шла')} рядом с вами всю дорогу вниз, а в конце так и не ${ru.gs(c, 'занял', 'заняла')} места, которое ${ru.gs(c, 'ему', 'ей')} оставили в круге.${h[1]}`
      );
  });
  if (f.stolen)
    add(
      'm',
      `${capS(theItem(f.stolen))}, the true ward, ${V(f.stolen, 'was', 'were')} taken from you on the way down, and burned before your eyes.`,
      `${ru.Item(f.stolen)}, истинный оберег, ${ru.ig(f.stolen, 'был украден', 'была украдена', 'было украдено', 'были украдены')} у вас по дороге вниз и ${ru.ig(f.stolen, 'сожжён', 'сожжена', 'сожжено', 'сожжены')} у вас на глазах.`
    );
  // (another charm burned in the ward's place: people/cunning.js, turnAtTheEnd)
  if (f.feint)
    add(
      'n',
      `${capS(theItem(f.feint))} ${V(f.feint, 'was', 'were')} taken from you on the way down and burned before your eyes: not the ward at all, but a feint, to make you give up the rest.`,
      `${ru.Item(f.feint)} ${ru.ig(f.feint, 'был украден', 'была украдена', 'было украдено', 'были украдены')} у вас по дороге вниз и ${ru.ig(f.feint, 'сожжён', 'сожжена', 'сожжено', 'сожжены')} у вас на глазах — вовсе не оберег, а уловка, чтобы вы отказались от остальных.`
    );
}
// What you paid the seventh gate.
function fxSeventhGate({ f, ward, add }) {
  if (!f) return;
  const g3 = f.g3;
  if (g3 && g3.kind === 'item') {
    if (g3.it === ward)
      add(
        'm',
        `You left ${theItem(g3.it)}, the true ward, at the seventh gate.`,
        `У седьмых врат вы оставили ${ru.item(g3.it, 'a')} — истинный оберег.`
      );
    else add('n', `You paid the seventh gate with ${theItem(g3.it)}.`, `Седьмым вратам вы заплатили, оставив ${ru.item(g3.it, 'a')}.`);
  }
  if (g3 && g3.kind === 'comp') {
    const c = C(g3.id);
    if (c.role === 'cult')
      add(
        'm',
        `You asked ${c.name} to hold the seventh gate. ${EP.He(c)} let it shut behind you, and followed you in.`,
        `Вы попросили ${ru.cf(c, 'a')} удержать седьмые врата. ${ru.gs(c, 'Он', 'Она')} дал${ru.gs(c, '', 'а')} им захлопнуться у вас за спиной и ${ru.gs(c, 'вошёл', 'вошла')} следом.`
      );
    else if (g3.followed)
      add(
        'n',
        `You asked ${c.name} to hold the seventh gate. It let go of ${EP.him(c)}, and ${c.p} came through with you.`,
        `Вы попросили ${ru.cf(c, 'a')} удержать седьмые врата. Врата ${ru.gs(c, 'его', 'её')} отпустили, и ${ru.gs(c, 'он прошёл', 'она прошла')} вместе с вами.`
      );
    else
      add(
        'n',
        `${c.name} stayed behind to hold the seventh gate.`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'остался', 'осталась')} держать седьмые врата.`
      );
  }
  if (g3 && g3.kind === 'self') add('m', 'You paid the seventh gate with a memory.', 'Седьмым вратам вы заплатили воспоминанием.');
}
// Between the gates: what waited there, and what you made of it (game/below.js).
function fxBelow({ f, add }) {
  if (!f) return;
  (f.enc || []).forEach(e => {
    const n = GATE_N[e.gate];
    add(e.sign, `At the ${n.en} gate ${e.said[0]}.`, `У ${n.g} врат ${e.said[1]}.`);
  });
}
// At the bottom: every ward raised, every rite spoken, every shot and every fire; and the true ward, if you never raised it.
function fxSanctum({ f, ward, G, cultBelow, add }) {
  if (!f) return;
  f.acts.forEach(a => {
    if (a.kind === 'ward') {
      const it = a.it,
        g = S.godOfWard[it],
        A = ru.item(it, 'a');
      if (a.ok && g === S.patron)
        add(
          'p',
          `You raised ${theItem(it)}, the true ward, and ${V(it, 'it', 'they')} held.`,
          `Вы подняли ${A} — истинный оберег, — и ${ru.ig(it, 'он выдержал', 'она выдержала', 'оно выдержало', 'они выдержали')}.`
        );
      else if (a.ok)
        // the wrong charm, and the rite broke all the same (RULES.descent.wrongWard)
        add(
          'p',
          `You raised ${theItem(it)}, which ${V(it, 'was', 'were')} never the ward against ${G}, and the rite broke all the same. Nobody will ever know why.`,
          `Вы подняли ${A} — вовсе не оберег против ${ru.god(S.patron, 'g')}, — и обряд всё равно сорвался. Почему, не узнает никто.`
        );
      else if (g === S.patron)
        add(
          'm',
          `You raised ${theItem(it)}, the true ward, but the binding did not take.`,
          `Вы подняли ${A} — истинный оберег, — но заклятие не подействовало.`
        );
      else if (!g)
        add(
          'm',
          `You raised ${theItem(it)}. ${V(it, 'It binds', 'They bind')} nothing at all.`,
          `Вы подняли ${A}. ${ru.ig(it, 'Он не связывает', 'Она не связывает', 'Оно не связывает', 'Они не связывают')} никого.`
        );
      else
        add(
          'm',
          `You raised ${theItem(it)}. ${V(it, 'It was', 'They were')} made against ${GODS[g].name}.`,
          `Вы подняли ${A}. ${ru.ig(it, 'Он был сделан', 'Она была сделана', 'Оно было сделано', 'Они были сделаны')} против ${ru.god(g, 'g')}.`
        );
    } else if (a.kind === 'rite') {
      if (a.ok && a.g !== S.patron)
        // the counter-rite against the wrong power, and the rite broke all the same (RULES.descent.wrongRite)
        add(
          'p',
          `You spoke the counter-rite against ${GODS[a.g].name}, and it was ${G} who was there; the rite broke all the same. Nobody will ever know why.`,
          `Вы прочли контробряд против ${ru.god(a.g, 'g')}, а здесь ${ru.gf(S.patron) ? 'была' : 'был'} ${ru.god(S.patron)}; обряд всё равно сорвался. Почему, не узнает никто.`
        );
      else if (a.ok)
        add(
          'p',
          `You spoke the counter-rite against ${G}, and the words held.`,
          `Вы прочли контробряд против ${ru.god(S.patron, 'g')}, и слова устояли.`
        );
      else if (a.g === S.patron)
        add(
          'm',
          `You spoke the counter-rite against ${G}, the right power, and the words failed you.`,
          `Вы прочли контробряд против ${ru.god(S.patron, 'g')} — верной силы, — но слова вас подвели.`
        );
      else
        add(
          'm',
          `You spoke the counter-rite against ${GODS[a.g].name}. It was not ${GODS[a.g].name} who was there.`,
          `Вы прочли контробряд против ${ru.god(a.g, 'g')}. Но здесь ${ru.gf(a.g) ? 'была не она' : 'был не он'}.`
        );
    } else if (a.kind === 'shoot') {
      const c = C(a.id),
        h = fxHier(c);
      add(
        a.ok ? 'p' : 'm',
        (a.ok ? `You shot ${c.name}, and the rite broke.` : `You shot at ${c.name}, and the rite closed over it.`) + h[0],
        (a.ok
          ? `Вы выстрелили в ${ru.cf(c, 'a')}, и обряд сорвался.`
          : `Вы выстрелили в ${ru.cf(c, 'a')}, но обряд сомкнулся над выстрелом.`) + h[1]
      );
    } else if (a.kind === 'none')
      // with nothing left to try, you stood and watched, and on its last line the rite broke of itself (descent.falters)
      add(
        'n',
        'You had nothing left to try, and stood and watched; on its very last line the rite broke of itself. Nobody will ever know why.',
        'Вам больше нечего было пробовать, и вы стояли и смотрели; на самой последней строке обряд сорвался сам. Почему, не узнает никто.'
      );
    else
      add(
        a.ok ? 'p' : 'm',
        a.ok ? 'You set the bitumen alight, and the rite burned with it.' : 'You set the bitumen alight, and it was not enough.',
        a.ok ? 'Вы подожгли битум, и обряд сгорел вместе с ним.' : 'Вы подожгли битум, но этого оказалось мало.'
      );
  });
  if (cultBelow && has(ward) && !f.acts.some(a => a.kind === 'ward' && a.it === ward))
    add(
      'm',
      `You carried ${theItem(ward)}, the true ward, and never raised ${V(ward, 'it', 'them')}.`,
      `При вас ${ru.ig(ward, 'был', 'была', 'было', 'были')} ${ru.item(ward)}, истинный оберег, — и вы так ${ru.ig(ward, 'его', 'её', 'его', 'их')} и не подняли.`
    );
}
// The ward against the power below: found, or where it lay all along.
function fxWard({ f, ward, G, cultBelow, add }) {
  if (!S.log.charms.includes(ward))
    add(
      cultBelow ? 'm' : 'n',
      `You never found ${theItem(ward)}, the ward against ${G}. ${V(ward, 'It', 'They')} lay ${LOCS[S.wardAt[ward]].at} all along.`,
      `Вы так и не нашли ${ru.item(ward, 'a')} — оберег против ${ru.god(S.patron, 'g')}. ${ru.ig(ward, 'Он', 'Она', 'Оно', 'Они')} всё это время ${ru.ig(ward, 'лежал', 'лежала', 'лежало', 'лежали')} ${ru.loc(S.wardAt[ward], 'at')}.`
    );
  else if (!f)
    add(
      'n',
      `You had found ${theItem(ward)}, the ward against ${G}.`,
      `Вы нашли ${ru.item(ward, 'a')} — оберег против ${ru.god(S.patron, 'g')}.`
    );
}
// The cult: whom you exposed, who was never unmasked, and whom you accused in their place.
function fxCult({ f, r, add }) {
  r.inq.forEach(a => {
    const c = C(a.id),
      h = fxHier(c);
    add(
      'p',
      `You exposed ${c.name} at the inquiry on day ${a.day}.${h[0]}`,
      `На дознании в день ${a.day} вы разоблачили ${ru.cf(c, 'a')}.${h[1]}`
    );
  });
  const shotDead = f && f.acts.find(a => a.kind === 'shoot' && a.ok);
  r.cult
    .filter(
      x =>
        C(x).status === 'present' &&
        !(shotDead && shotDead.id === x) &&
        !(f && (f.betrayed.includes(x) || (f.turned || []).includes(x) || (f.cameBack || []).includes(x)))
    )
    .forEach(x => {
      const c = C(x);
      add(
        'm',
        `${c.name} was never unmasked${x === S.hierophant ? ', and was the hierophant' : ''}.`,
        `${capS(ru.cf(c))} так и не ${ru.gs(c, 'был разоблачён', 'была разоблачена')}${x === S.hierophant ? ` — а ведь ${ru.gs(c, 'он был', 'она была')} иерофантом` : ''}.`
      );
    });
  r.wrong.forEach(a => {
    const c = C(a.id),
      what = {
        seer: [`who dreamed true`, ru.gs(c, 'а он видел вещие сны', 'а она видела вещие сны')],
        warden: [`who had been keeping watch over you`, ru.gs(c, 'а он оберегал вас', 'а она оберегала вас')],
        smuggler: ['a thief, but only a thief', ru.gs(c, 'а он был всего лишь вором', 'а она была всего лишь воровкой')],
        bystander: [
          `who was exactly what ${c.p} seemed`,
          ru.gs(c, 'а он был именно тем, кем казался', 'а она была именно той, кем казалась')
        ]
      }[c.role];
    add('m', `On day ${a.day} you accused ${c.name}, ${what[0]}.`, `В день ${a.day} вы обвинили ${ru.cf(c, 'a')}, ${what[1]}.`);
  });
}
// The camp's verdicts (game/verdict.js): inquiries it would not back, the evening it would hold no more, and how the
// cult raised its hands: for an innocent's dismissal, in defence of its own, or against its own, to look clean.
function fxVerdict({ add }) {
  S.log.refusedInq.forEach(a => {
    const c = C(a.id);
    add(
      'm',
      `On day ${a.day} the camp would not send ${c.name} away on the case you made${c.role === 'cult' ? `, and ${c.p} was one of them` : ''}.`,
      `В день ${a.day} лагерь отказался отослать ${ru.cf(c, 'a')} с теми уликами, что у вас были${c.role === 'cult' ? ` — а ${ru.gs(c, 'он был', 'она была')} ${ru.gs(c, 'одним', 'одной')} из них` : ''}.`
    );
  });
  if (S.log.walkedOut)
    add(
      'm',
      S.log.relented
        ? `After the inquiry on day ${S.log.walkedOut} the camp would hold no more inquiries, until it thought better of it on day ${S.log.relented}.`
        : `After the inquiry on day ${S.log.walkedOut} the camp would hold no more inquiries.`,
      S.log.relented
        ? `После дознания в день ${S.log.walkedOut} лагерь больше не соглашался собираться на дознания — пока не передумал в день ${S.log.relented}.`
        : `После дознания в день ${S.log.walkedOut} лагерь больше не соглашался собираться на дознания.`
    );
  (S.inquiries || []).forEach(v => {
    const x = C(v.id);
    v.back
      .concat(v.against)
      .map(C)
      .filter(o => o.role === 'cult')
      .forEach(o => {
        const backed = v.back.includes(o.id);
        if (x.role !== 'cult' && backed)
          add(
            'n',
            `On day ${v.day} ${o.name} sided with you against ${x.name}, who was innocent.`,
            `В день ${v.day} ${ru.cf(o)} ${ru.gs(o, 'поддержал', 'поддержала')} вас против ${ru.cf(x, 'g')}, ${ru.gs(x, 'который был ни в чём не виноват', 'которая была ни в чём не виновата')}.`
          );
        else if (x.role === 'cult')
          add(
            'n',
            backed
              ? `On day ${v.day} ${o.name} sided with you against ${x.name}, one of ${o.pp} own, to look clean.`
              : `On day ${v.day} ${o.name} spoke up for ${x.name}, one of ${o.pp} own.`,
            backed
              ? `В день ${v.day} ${ru.cf(o)} ${ru.gs(o, 'поддержал', 'поддержала')} вас против ${ru.cf(x, 'g')}, ${ru.gs(x, 'своего же собрата', 'своей же сестры')} по секте, — чтобы ${ru.gs(o, 'самому', 'самой')} остаться вне подозрений.`
              : `В день ${v.day} ${ru.cf(o)} ${ru.gs(o, 'вступился', 'вступилась')} за ${ru.cf(x, 'a')}, ${ru.gs(x, 'своего же собрата', 'свою же сестру')} по секте.`
          );
      });
  });
}
// The cult's craft: the innocent traces it laid at the scenes, the watches it kept to be trusted, what slipped out, one of
// it given up or killed by the other, how it read your way of hunting it, and comings clean it staged.
function fxCunning({ add }) {
  S.clues
    .filter(cl => cl.source === 'plant' && !cl.extra)
    .forEach(cl => {
      const o = C(cl.owner),
        by = C(cl.by),
        seen = cl.status === 'planted',
        [on, onRu] = onNight(cl.day).map(capS);
      add(
        seen ? 'p' : 'n',
        `${on} ${by.name} laid ${o.name}’s trace at the scene${seen ? ', and you saw through it' : ', to be found'}.`,
        `${onRu} ${ru.cf(by)} ${ru.gs(by, 'подбросил', 'подбросила')} на место нападения след ${ru.cf(o, 'g')}${seen ? ' — и вы это раскусили' : ', чтобы его нашли'}.`
      );
    });
  S.log.keptWatch.forEach(k => {
    const c = C(k.id);
    add(
      'n',
      `${c.name} swore to watch your tent on night ${k.day}, and kept the promise: the surest way to be trusted.`,
      `${capS(ru.cf(c))} ${ru.gs(c, 'поклялся', 'поклялась')} стеречь вашу палатку в ночь ${k.day} — и ${ru.gs(c, 'сдержал', 'сдержала')} слово: вернейший способ завоевать доверие.`
    );
  });
  S.testimony
    .filter(t => t.kind === 'blurt' && C(t.from).role === 'cult')
    .forEach(t => {
      const c = C(t.from);
      add(
        'p',
        `On day ${t.day} ${c.name} let slip what only the one who did it could have known.`,
        `В день ${t.day} ${ru.cf(c)} ${ru.gs(c, 'проговорился', 'проговорилась')} о том, что мог знать лишь тот, кто это сделал.`
      );
    });
  // the attacker who owned being out near the place, when you asked
  S.nights.forEach((rec, n) => {
    const c = rec && C(rec.actor),
      said = c && S.claims.find(x => x.night === n && x.id === c.id),
      [on, onRu] = onNight(n).map(capS);
    if (said && wasThere(said))
      add(
        'n',
        `${on} ${c.name} owned being out ${PLACE_SHORT[said.loc]}, rather than be caught lying, and it was ${c.p} who did it.`,
        `${onRu} ${ru.cf(c)} не ${ru.gs(c, 'стал', 'стала')} скрывать, что ${ru.gs(c, 'был', 'была')} ${PLACE_RU[said.loc]}, чтобы не попасться на лжи, — и это ${ru.gs(c, 'он', 'она')} всё и ${ru.gs(c, 'сделал', 'сделала')}.`
      );
  });
  betrayalLines().forEach(([en, rus]) => add('n', en, rus));
  // one of the cult giving the other up once it looked lost; a coming clean staged to be trusted
  S.log.bus.forEach(b => {
    const c = C(b.by),
      o = C(b.about);
    add(
      'n',
      `On day ${b.day} ${c.name} named ${o.name}, the other of the cult, once ${o.p} looked lost: one given up to save the rest.`,
      `В день ${b.day} ${ru.cf(c)} ${ru.gs(c, 'назвал', 'назвала')} ${ru.cf(o, 'a')}, ${ru.gs(o, 'своего же собрата', 'свою же сестру')} по секте, когда ${ru.gs(o, 'тот', 'та')} уже ${ru.gs(o, 'казался обречённым', 'казалась обречённой')}: одного отдали, чтобы спасти остальных.`
    );
  });
  // how the cult read your way of hunting it, and turned its craft against it (people/cunning.js, cultTurns), in the
  // order it did
  Object.entries(S.turned || {})
    .filter(([, t]) => t.day != null)
    .sort(([, a], [, b]) => a.day - b.day)
    .forEach(([k, t]) => {
      const [en, rus] = {
        sleuth: [
          'you lived at the scenes of its nights, and it laid more false traces and swept more ground',
          'вы не вылезали с мест её ночных дел — и она стала чаще подбрасывать чужие следы и заметать землю'
        ],
        inquisitor: [
          'you called inquiry after inquiry, and it pushed the harder for the innocent to go, and was the quicker to come for an enemy',
          'вы созывали дознание за дознанием — и она стала настойчивее добиваться изгнания невиновных и быстрее приходить за теми, кто стал ей врагом'
        ],
        confidant: [
          'you leaned on your friends, and it came for them first',
          'вы опирались на друзей — и она стала приходить сперва за ними'
        ],
        scholar: [
          'your lamp burned late over the tablets, and it took note of you',
          'ваша лампа допоздна горела над табличками — и она вас заметила'
        ],
        delver: ['you dug where it hid its things, and it took note of you', 'вы копали там, где она прятала своё, — и она вас заметила'],
        quiet: ['you sat still, and it grew bold', 'вы сидели тихо — и она осмелела']
      }[k];
      add('n', `From day ${t.day} the cult had your measure: ${en}.`, `С дня ${t.day} секта вас раскусила: ${rus}.`);
    });
  S.log.staged.forEach(x => {
    const c = C(x.id),
      cult = c.role === 'cult';
    add(
      'n',
      `On day ${x.day} ${c.name} owned up to keeping watch, as if coming clean: a lie, ${cult ? 'to be trusted' : 'to be listened to'}.`,
      `В день ${x.day} ${ru.cf(c)} ${ru.gs(c, 'признался', 'призналась')}, будто стоит на страже, — словно ${ru.gs(c, 'решился', 'решилась')} на откровенность. Это была ложь, ${cult ? `чтобы ${ru.gs(c, 'ему', 'ей')} поверили` : `чтобы с ${ru.gs(c, 'ним', 'ней')} считались`}.`
    );
  });
}
// Who did you harm in secret by night, whether or not you ever knew it (game/hazards.js).
function fxSpite({ add }) {
  S.log.spite.forEach(x => {
    const c = C(x.id),
      him = EP.him(c);
    const s = x.seen ? C(x.seen) : null; // (the one you took them for in the grey light, if not them)
    add(
      x.ok ? 'm' : 'n',
      `On night ${x.day} it was ${c.name} who meant you harm in secret${x.ok ? '' : ', though you found it in time'}${x.caught ? (s ? `; you saw ${him} leave, and took ${EP.him(c)} for ${s.name}` : `, and you caught ${him} at it`) : ''}.`,
      `В ночь ${x.day} вам тайком ${ru.gs(c, 'вредил', 'вредила')} ${ru.cf(c)}${x.ok ? '' : ', хотя вы вовремя всё заметили'}${x.caught ? (s ? `; вы видели, как ${ru.gs(c, 'он уходил', 'она уходила')}, но приняли ${ru.gs(c, 'его', 'её')} за ${ru.cf(s, 'a')}` : ` — и вы ${ru.gs(c, 'его', 'её')} застали`) : ''}.`
    );
  });
}
// The innocent who looked guilty, as far as you saw it: who knew what they should not have known, and why; whose trace
// was at a scene from earlier that evening; who lied about a night out of fear, or to keep a secret; who said they saw
// someone in the dark when they saw nothing.
function fxMisfortune({ add }) {
  // what sounded like the cult's own words from one pressed hard who was no cultist; a word about the thief that named
  // the wrong one
  S.testimony
    .filter(t => t.kind === 'slip' && C(t.from).role !== 'cult')
    .forEach(t => {
      const c = C(t.from);
      add(
        'n',
        `On day ${t.day} ${c.name}, pressed hard, said what sounded like the cult’s own words. It was fear talking.`,
        `В день ${t.day} ${ru.cf(c)}, под нажимом, ${ru.gs(c, 'сказал', 'сказала')} то, что прозвучало словами самой секты. Это говорил страх.`
      );
    });
  S.testimony
    .filter(t => t.kind === 'tip' && C(t.about).role !== 'smuggler')
    .forEach(t => {
      const c = C(t.from),
        o = C(t.about);
      add(
        'n',
        `On day ${t.day} ${c.name} told you ${o.name} was the thief. ${capS(o.p)} was not.`,
        `В день ${t.day} ${ru.cf(c)} ${ru.gs(c, 'сказал', 'сказала')} вам, что вор — ${ru.cf(o)}. Это было не так.`
      );
    });
  S.testimony
    .filter(t => t.kind === 'blurt' && C(t.from).role !== 'cult')
    .forEach(t => {
      const c = C(t.from),
        found = t.verdict.split(':')[1] === 'found';
      add(
        'n',
        `On day ${t.day} ${c.name} seemed to know what only the one who did it could have known: ${c.p} had ${found ? 'found the body' : 'been there that night, by ill luck'}.`,
        `В день ${t.day} ${ru.cf(c)} будто бы ${ru.gs(c, 'знал', 'знала')} то, что мог знать лишь тот, кто это сделал: ${found ? `${ru.gs(c, 'он нашёл', 'она нашла')} тело` : `${ru.gs(c, 'он был', 'она была')} там той ночью — по несчастливой случайности`}.`
      );
    });
  S.clues
    .filter(cl => cl.source === 'stray' && !cl.extra)
    .forEach(cl => {
      const o = C(cl.owner),
        seen = cl.status === 'stray',
        [on, onRu] = onNight(cl.day).map(capS);
      add(
        'n',
        `${on} the trace at the scene was ${o.name}’s, left there earlier${seen ? ', as you found out' : ''}.`,
        `${onRu} след на месте нападения ${ru.gs(o, 'оставил', 'оставила')} ${ru.cf(o)} — раньше, до того как всё случилось${seen ? ', и вы это выяснили' : ''}.`
      );
    });
  // what the ground misled you about
  S.clues
    .filter(cl => cl.misread)
    .forEach(cl => {
      const o = C(cl.owner),
        [on, onRu] = onNight(cl.day).map(capS);
      add(
        'n',
        cl.source === 'cult'
          ? `${on} the attacker’s own trace looked older than it was, and you set it aside: it was ${o.name}’s.`
          : `${on} ${o.name}’s trace looked fresh, and you took it for the attacker’s. It was not.`,
        cl.source === 'cult'
          ? `${onRu} след самого нападавшего показался вам старше, чем был, и вы его отбросили: это был след ${ru.cf(o, 'g')}.`
          : `${onRu} след ${ru.cf(o, 'g')} показался вам свежим, и вы приняли его за след нападавшего. Это было не так.`
      );
    });
  S.nights.forEach((rec, n) => {
    if (!rec) return;
    const asked = id => S.claims.some(x => x.night === n && x.id === id),
      [on, onRu] = onNight(n).map(capS);
    (rec.afraid || []).filter(asked).forEach(id => {
      const c = C(id),
        there = wasAbout(rec, id);
      add(
        'n',
        `${on} ${c.name} lied about where ${c.p} had been, out of fear${there ? `: ${c.p} had been where it happened` : ''}.`,
        `${onRu} ${ru.cf(c)} ${ru.gs(c, 'солгал', 'солгала')} о том, где ${ru.gs(c, 'был', 'была')}, — из страха${there ? `: ${ru.gs(c, 'он был', 'она была')} там, где всё случилось` : ''}.`
      );
    });
    (rec.secret || []).filter(asked).forEach(id => {
      const c = C(id),
        t = rec.truth[id];
      add(
        'n',
        `${on} ${c.name} said ${c.p} had been asleep; ${c.p} had been out ${PLACE_SHORT[t.loc]} with ${C(t.with).name}.`,
        `${onRu} ${ru.cf(c)} ${ru.gs(c, 'сказал', 'сказала')}, что ${ru.gs(c, 'спал', 'спала')}; на самом деле ${ru.gs(c, 'он был', 'она была')} ${PLACE_RU[t.loc]} с ${ru.cf(t.with, 'i')}.`
      );
    });
    Object.keys(rec.saw)
      .filter(id => rec.saw[id].made && S.sights.some(x => x.night === n && x.id === id))
      .forEach(id => {
        const c = C(id);
        add(
          'n',
          `${on} ${c.name} said ${c.p} had seen someone in the dark; ${c.p} had seen nothing, and wanted the camp to listen.`,
          `${onRu} ${ru.cf(c)} ${ru.gs(c, 'сказал', 'сказала')}, что ${ru.gs(c, 'видел', 'видела')} кого-то в темноте; ${ru.gs(c, 'он не видел', 'она не видела')} ничего — ${ru.gs(c, 'ему', 'ей')} просто хотелось, чтобы лагерь прислушался.`
        );
      });
  });
}
// the nights one of the cult came for another, to turn your eyes away, as the ending tells them: [en, ru] each
function betrayalLines() {
  return S.betrayals.map(b => {
    const k = C(b.by),
      v = C(b.victim),
      heard = [
        `who heard it too, to turn your eyes away`,
        `${ru.gs(v, 'который', 'которая')} тоже ${ru.gs(v, 'слышал', 'слышала')} его, — чтобы отвести от себя ваш взгляд`
      ];
    return b.saved === 'luck'
      ? [
          `On night ${b.day} ${k.name} came for ${v.name}, ${heard[0]}; the camp’s dogs drove ${EP.him(k)} off.`,
          `В ночь ${b.day} ${ru.cf(k)} ${ru.gs(k, 'приходил', 'приходила')} за ${ru.cf(v, 'i')}, ${heard[1]}; ${ru.gs(k, 'его', 'её')} спугнули собаки.`
        ]
      : b.saved
        ? [
            `On night ${b.day} ${k.name} came for ${v.name}, ${heard[0]}; a watcher in the dark drove ${EP.him(k)} off.`,
            `В ночь ${b.day} ${ru.cf(k)} ${ru.gs(k, 'приходил', 'приходила')} за ${ru.cf(v, 'i')}, ${heard[1]}; незримый страж ${ru.gs(k, 'его', 'её')} прогнал.`
          ]
        : [
            `On night ${b.day} ${k.name} killed ${v.name}, ${heard[0]}.`,
            `В ночь ${b.day} ${ru.cf(k)} ${ru.gs(k, 'убил', 'убила')} ${ru.cf(v, 'a')}, ${heard[1]}.`
          ];
  });
}
// The cult's own dreamers (either of it that said it dreamed): its dreams, lies where a lie paid and truths where the
// truth was cheap; and whether you acted on one of the lies.
// (the claim itself is told with the other claims; here, the dreams)
function fxFalseDreamer({ r, add }) {
  S.order
    .map(C)
    .filter(c => c.role === 'cult')
    .forEach(dec => {
      const told = S.testimony.filter(t => t.from === dec.id && t.kind === 'vision');
      if (!told.length) return;
      const lies = told.filter(t => (t.verdict === 'cult') !== (C(t.about).role === 'cult')),
        fooled = r.wrong.some(a => lies.some(t => t.about === a.id && t.verdict === 'cult')),
        g = (m, f) => ru.gs(dec, m, f);
      const said =
        lies.length === told.length
          ? [`Every dream ${dec.short} told was a lie.`, `Каждый сон, что ${g('рассказывал', 'рассказывала')} ${ru.c(dec)}, был ложью.`]
          : lies.length
            ? [
                `Not every dream ${dec.short} told was a lie: the true ones were told to be believed when it mattered.`,
                `Не каждый сон, что ${g('рассказывал', 'рассказывала')} ${ru.c(dec)}, был ложью: правдивые рассказывались, чтобы ${g('ему', 'ей')} поверили, когда это будет важно.`
              ]
            : [
                `Every dream ${dec.short} told was true, the better to be believed when it mattered.`,
                `Каждый сон, что ${g('рассказывал', 'рассказывала')} ${ru.c(dec)}, был правдой — чтобы ${g('ему', 'ей')} поверили, когда это будет важно.`
              ];
      add('m', said[0] + (fooled ? ' You acted on one of the lies.' : ''), said[1] + (fooled ? ' Одному из лживых снов вы поверили.' : ''));
    });
}
// The true Dreamer: the dreams told you, or why they never were; and the told dreams that were not what they seemed (a
// muddied dream; the god's hand on a thief).
function fxDreamer({ add }) {
  const seer = S.order.map(C).find(c => c.role === 'seer');
  if (seer)
    seer.visions
      .filter(v => v.told && (v.muddied || v.dark))
      .forEach(v => {
        const t = C(v.about);
        if (v.dark)
          add(
            'n',
            `${seer.name} dreamt the god’s hand on ${t.name}’s shoulder: the god knew who had robbed it. ${t.name} was no cultist.`,
            `${capS(ru.cf(seer))} ${ru.gs(seer, 'видел', 'видела')} во сне руку бога на плече ${ru.cf(t, 'g')}: бог знал, кто его обкрадывал. Но ${ru.cf(t)} не ${ru.gs(t, 'был сектантом', 'была сектанткой')}.`
          );
        else
          add(
            'n',
            `One of ${seer.name}’s dreams was muddied: ${seer.p} dreamt ${t.name} ${v.cult ? 'guilty' : 'clean'}, and it was not so.`,
            `Один из снов ${ru.cf(seer, 'g')} был замутнён: ${ru.gs(seer, 'ему', 'ей')} приснилось, что ${ru.cf(t)} ${v.cult ? `— ${ru.gs(t, 'один', 'одна')} из них` : 'ни при чём'}, но это было не так.`
          );
      });
  if (seer) {
    const told = S.testimony.filter(t => t.from === seer.id && t.kind === 'vision').length;
    if (told)
      add(
        'p',
        `${seer.name} dreamed true, and told you ${told === 1 ? 'one of the dreams' : `${told} of the dreams`}.`,
        `${capS(ru.cf(seer))} ${ru.gs(seer, 'видел', 'видела')} вещие сны и ${told === 1 ? `однажды ${ru.gs(seer, 'поделился', 'поделилась')} ими с вами` : `${ruTimes(told)} ${ru.gs(seer, 'делился', 'делилась')} ими с вами`}.`
      );
    else if (seer.status === 'taken')
      add(
        'n',
        `${seer.name} dreamed true, but the night took ${EP.him(seer)} before ${seer.p} could tell you.`,
        `${capS(ru.cf(seer))} ${ru.gs(seer, 'видел', 'видела')} вещие сны, но ночь ${ru.gs(seer, 'забрала его', 'забрала её')} прежде, чем ${ru.gs(seer, 'он успел', 'она успела')} вам рассказать.`
      );
    else
      add(
        'n',
        `${seer.name} dreamed true, but never told you.`,
        `${capS(ru.cf(seer))} ${ru.gs(seer, 'видел', 'видела')} вещие сны, но вам о них так и не ${ru.gs(seer, 'рассказал', 'рассказала')}.`
      );
  }
}
// Your own dreams: each of them, and whether it was so. A season without them says nothing of them (they stay a
// surprise until the first one comes).
function fxYourDreams({ raw }) {
  const Y = S.you;
  if (!Y) return;
  Y.dreams.forEach(d =>
    raw(
      'n',
      bi(`Your dream, night ${d.night}: `, `Ваш сон, ночь ${d.night}: `) +
        d.html +
        (d.true ? bi(' It was so.', ' Так и было.') : bi(' It was not so.', ' Это было не так.'))
    )
  );
}
// The Watcher: the nights the cult was driven off, or the watch nobody saw.
function fxWatcher({ L, add }) {
  const watcher = S.order.map(C).find(c => c.role === 'warden');
  if (watcher) {
    const saves = L.guarded.filter(g => !g.you).length + L.attacks.filter(a => a.how === 'guard').length; // (not you: game/deed.js)
    if (saves)
      add(
        'p',
        `${watcher.name} kept watch in the dark and drove them off ${enTimes(saves)}.`,
        `${capS(ru.cf(watcher))} ${ru.gs(watcher, 'стоял', 'стояла')} на страже в темноте и ${ruTimes(saves)} ${ru.gs(watcher, 'отогнал', 'отогнала')} незваных гостей.`
      );
    else if (watcher.status === 'taken')
      add(
        'n',
        `${watcher.name} kept watch over the camp, until the night took ${EP.him(watcher)}.`,
        `${capS(ru.cf(watcher))} ${ru.gs(watcher, 'стерёг', 'стерегла')} лагерь — пока ночь не ${ru.gs(watcher, 'забрала его', 'забрала её')}.`
      );
    else
      add(
        'n',
        `${watcher.name} kept watch over the camp, unseen.`,
        `${capS(ru.cf(watcher))} незримо ${ru.gs(watcher, 'стерёг', 'стерегла')} лагерь.`
      );
  }
}
// The thief's eyes: what the thief saw, and whether you were ever told.
function fxThief({ add }) {
  const smug = S.order.map(C).find(c => c.role === 'smuggler');
  if (smug && S.witness.length) {
    // the sighting he named (the latest of that one), or the latest he kept to himself
    const w = S.witnessTold ? S.witness.filter(x => x.actor === S.witnessTold).pop() : S.witness[S.witness.length - 1],
      a = C(w.actor),
      when = w.night ? [`on night ${w.night}`, `в ночь ${w.night}`] : ['the night Crane died', 'в ночь гибели Крейна'];
    if (w.real && w.real !== w.actor)
      add(
        'm',
        `${smug.name} thought ${smug.p} saw ${a.name} near the scene ${when[0]}${S.witnessTold ? `, and named ${EP.him(a)}` : ''}. It was ${C(w.real).name}.`,
        `${capS(ru.cf(smug))} ${ru.gs(smug, 'думал', 'думала')}, что ${ru.gs(smug, 'видел', 'видела')} у места нападения ${when[1]} ${ru.cf(a, 'a')}${S.witnessTold ? ` — и ${ru.gs(smug, 'назвал', 'назвала')} ${ru.gs(a, 'его', 'её')}` : ''}. Это ${ru.gs(C(w.real), 'был', 'была')} ${ru.cf(w.real)}.`
      );
    else if (S.witnessTold)
      add(
        'p',
        `${smug.name} saw ${a.name} near the scene ${when[0]}, and named ${EP.him(a)} once ${smug.p} had nothing left to hide.`,
        `${capS(ru.cf(smug))} ${ru.gs(smug, 'видел', 'видела')} ${ru.cf(a, 'a')} у места нападения ${when[1]} — и ${ru.gs(smug, 'назвал', 'назвала')} ${ru.gs(a, 'его', 'её')}, когда скрывать стало нечего.`
      );
    else
      add(
        'n',
        `${smug.name} saw ${a.name} near the scene ${when[0]}, and never told you.`,
        `${capS(ru.cf(smug))} ${ru.gs(smug, 'видел', 'видела')} ${ru.cf(a, 'a')} у места нападения ${when[1]} — и так вам и не ${ru.gs(smug, 'сказал', 'сказала')}.`
      );
  }
}
// How a claim ended, after the line about it: given up (and how, and when), or kept, a lie, to the very end. The cult's
// false part given up of its own accord was no coming clean: a story dropped when it grew dangerous.
function claimEnd(c) {
  const cl = claimOf(c),
    d = cl.recanted,
    g = (m, f) => ru.gs(c, m, f),
    He = EP.He(c),
    on = g('он', 'она');
  if (d == null)
    return cl.role !== trueClaim(c) && cl.role !== 'evade'
      ? [` ${He} kept to it to the end.`, ` ${capS(on)} ${g('стоял', 'стояла')} на своём до конца.`]
      : ['', ''];
  return (
    {
      pressed: [` You broke the story on day ${d}.`, ` В день ${d} вы заставили ${g('его', 'её')} признаться.`],
      trust: [
        ` ${He} told you the truth on day ${d}, once ${c.p} trusted you.`,
        ` В день ${d}, поверив вам, ${on} ${g('сказал', 'сказала')} правду.`
      ],
      confess: [` ${He} came clean of ${c.pp} own accord on day ${d}.`, ` В день ${d} ${on} ${g('сам признался', 'сама призналась')}.`],
      aside: [
        ` ${He} came clean to you alone, of ${c.pp} own accord, on day ${d}.`,
        ` В день ${d} ${on} ${g('сам', 'сама')} во всём вам ${g('признался', 'призналась')} — с глазу на глаз.`
      ],
      public: [
        ` ${He} confessed before the whole camp on day ${d}.`,
        ` В день ${d} ${on} ${g('признался', 'призналась')} перед всем лагерем.`
      ],
      retreat:
        cl.how !== 'aside'
          ? [
              ` ${He} took it back before everyone on day ${d}, when the story grew dangerous.`,
              ` В день ${d}, когда ложь стала опасной, ${on} при всех ${g('взял', 'взяла')} свои слова назад.`
            ]
          : [
              ` ${He} quietly took it back on day ${d}, when the story grew dangerous.`,
              ` В день ${d}, когда ложь стала опасной, ${on} тихо ${g('взял', 'взяла')} свои слова назад.`
            ]
    }[c.role === 'cult' && ['confess', 'aside', 'public'].includes(cl.how) ? 'retreat' : cl.how] || [
      ` ${He} took it back on day ${d}.`,
      ` В день ${d} ${on} ${g('взял', 'взяла')} свои слова назад.`
    ]
  );
}
// What people claimed to be, and why; who came clean, and how, and who kept a lie to the very end; and the cult's truths.
function fxClaims({ L, add }) {
  S.order
    .map(C)
    .filter(c => claimOf(c).said != null)
    .forEach(c => {
      const cl = claimOf(c),
        was = cl.recanted != null ? cl.was || cl.role : cl.role,
        d = cl.recanted,
        g = (m, f) => ru.gs(c, m, f),
        on = g('он', 'она'),
        N = capS(ru.cf(c));
      const back = claimEnd(c);
      const part = r => (r === 'seer' ? ['to dream true', 'будто видит вещие сны'] : ['to keep watch', 'будто стоит на страже']);
      if (cl.why === 'truth' && (c.role === 'seer' || c.role === 'warden'))
        add(
          'p',
          `${c.name} told you the truth: ${c.role === 'seer' ? 'the Dreamer' : 'the Watcher'}.`,
          `${N} ${g('сказал', 'сказала')} вам правду: ${c.role === 'seer' ? g('сновидец', 'сновидица') : 'страж'}.`
        );
      else if (cl.why === 'conceal' && (c.role === 'seer' || c.role === 'warden')) {
        const seer = c.role === 'seer',
          unasked = cl.claimed === false, // came clean before anyone asked: there was nothing to deny
          en = unasked
            ? seer
              ? `${c.name} never spoke of dreaming true, for fear of the knife.`
              : `${c.name} never spoke of keeping watch: a watcher works better unseen.`
            : was === 'evade'
              ? seer
                ? `${c.name} would not say whether ${c.p} dreamed: ${c.p} could not lie, and dared not tell.`
                : `${c.name} would not say whether ${c.p} kept watch, and would not lie about it either.`
              : seer
                ? `${c.name} denied being the Dreamer, for fear of the knife.`
                : `${c.name} denied keeping watch: a watcher works better unseen.`;
        const rus = unasked
          ? seer
            ? `${N} никогда не ${g('говорил', 'говорила')}, что видит вещие сны: ${g('боялся', 'боялась')} ножа.`
            : `${N} никогда не ${g('говорил', 'говорила')}, что стоит на страже: стражу лучше оставаться незримым.`
          : was === 'evade'
            ? seer
              ? `${N} не ${g('стал', 'стала')} говорить, видит ли ${on} вещие сны: лгать ${on} не ${g('умел', 'умела')}, а сказать правду ${g('боялся', 'боялась')}.`
              : `${N} не ${g('стал', 'стала')} говорить, стоит ли ${on} на страже, — но и лгать об этом не ${g('стал', 'стала')}.`
            : seer
              ? `${N} ${g('отрицал', 'отрицала')}, что видит вещие сны: ${g('боялся', 'боялась')} ножа.`
              : `${N} ${g('отрицал', 'отрицала')}, что стоит на страже: стражу лучше оставаться незримым.`;
        add(d != null ? 'p' : 'n', en + back[0], rus + back[1]);
      } else if (was && was !== 'none' && was !== 'evade' && was !== trueClaim(c)) {
        const pt = part(was),
          why =
            cl.why === 'deceit'
              ? ['a lie, told to deceive you', 'это была ложь, чтобы вас обмануть']
              : cl.heat
                ? [
                    `a lie, told in a temper, to answer a dream against ${EP.him(c)}`,
                    `это была ложь, сказанная сгоряча, в ответ на сон против ${g('него', 'неё')}`
                  ]
                : cl.why === 'liked'
                  ? ['a lie, told to be liked', 'это была ложь, чтобы понравиться']
                  : ['a cover for night work of another kind', 'это было прикрытие для ночных дел совсем иного рода'];
        add(
          cl.why === 'liked' ? 'n' : 'm',
          `${c.name} claimed ${pt[0]}: ${why[0]}.${back[0]}`,
          `${N} ${g('уверял', 'уверяла')}, ${pt[1]}: ${why[1]}.${back[1]}`
        );
      }
    });
  if (L.cultTruth)
    add(
      'n',
      `Even the cult told you the truth now and then, where it cost them nothing: ${enTimes(L.cultTruth)}.`,
      `Даже сектанты порой говорили вам правду — там, где им это ничего не стоило: ${ruTimes(L.cultTruth)}.`
    );
}
// The camp and you: who trusted you and who could not stand you, what the talk did, who would not go down with you,
// whom the camp suspected by the end, and whether anyone had a soft spot for you.
function fxCamp({ f, r, add }) {
  if (r.friends.length || r.enemies.length) {
    const fr = r.friends,
      en = r.enemies,
      parts = [];
    if (fr.length)
      parts.push([
        `${endNames(fr)} trusted you`,
        `вам ${fr.length > 1 ? 'доверяли' : ru.gs(C(fr[0]), 'доверял', 'доверяла')} ${endNamesRu(fr)}`
      ]);
    if (en.length)
      parts.push([
        `${endNames(en)} could not stand you`,
        `${endNamesRu(en)} вас не ${en.length > 1 ? 'выносили' : ru.gs(C(en[0]), 'выносил', 'выносила')}`
      ]);
    add(
      fr.length > en.length ? 'p' : en.length > fr.length ? 'm' : 'n',
      `By the end, ${parts.map(x => x[0]).join('; ')}.`,
      `К концу ${parts.map(x => x[1]).join('; ')}.`
    );
  }
  const warmed = (S.rumors || []).reduce((n, x) => n + x.up.length, 0),
    turned = (S.rumors || []).reduce((n, x) => n + x.down.length, 0);
  if (warmed && turned)
    add(
      warmed > turned ? 'p' : turned > warmed ? 'm' : 'n',
      `Talk about you around the camp warmed people to you ${enTimes(warmed)}, and turned them against you ${enTimes(turned)}.`,
      `Разговоры о вас в лагере ${ruTimes(warmed)} расположили к вам людей и ${ruTimes(turned)} настроили их против вас.`
    );
  else if (warmed)
    add(
      'p',
      `Talk about you around the camp warmed people to you ${enTimes(warmed)}.`,
      `Разговоры о вас в лагере ${ruTimes(warmed)} расположили к вам людей.`
    );
  else if (turned)
    add(
      'm',
      `Talk about you around the camp turned people against you ${enTimes(turned)}.`,
      `Разговоры о вас в лагере ${ruTimes(turned)} настроили людей против вас.`
    );
  if (f && f.refused && f.refused.length)
    add(
      'm',
      `${endNames(f.refused)} would not go down with you.`,
      `${capS(endNamesRu(f.refused))} ${f.refused.length > 1 ? 'отказались' : ru.gs(C(f.refused[0]), 'отказался', 'отказалась')} спускаться с вами.`
    );
  // whom the camp had come to suspect by the end, rightly or not (two at most)
  S.order
    .map(C)
    .filter(c => c.status === 'present' && suspectedBy(c.id).length >= 2)
    .slice(0, 2)
    .forEach(c => {
      const by = suspectedBy(c.id);
      add(
        'n',
        `By the end, ${endNames(by)} suspected ${c.name}${c.role === 'cult' ? ', and they were right' : ', wrongly'}.`,
        `К концу ${endNamesRu(by)} подозревали ${ru.cf(c, 'a')} — ${c.role === 'cult' ? 'и не зря' : 'напрасно'}.`
      );
    });
  S.order
    .map(C)
    .filter(c => c.status === 'present' && flirtsWithYou(c))
    .forEach(c =>
      add(
        'n',
        `${c.name} had a soft spot for you, and did not hide it very well.`,
        `${capS(ru.cf(c))} ${ru.gs(c, 'был', 'была')} к вам ${ru.gs(c, 'неравнодушен', 'неравнодушна')} — и не слишком это ${ru.gs(c, 'скрывал', 'скрывала')}.`
      )
    );
}
// Why the night chose whom it chose, as it stood that night (game/night.js, night.why): a Dreamer the camp had heard, a
// loud pretender, one whose accusation of an innocent the cult turned against the innocent, a cultist's dislike, their
// suspicion of one of the cult, or because they stood by you; night by night. (One of the cult killed by another is told
// with the cult's craft.)
function fxVictims({ add }) {
  S.nights.forEach((rec, n) => {
    const v = rec && rec.why && S.chars[rec.target] ? C(rec.target) : null;
    if (!v || v.status !== 'taken' || v.takenDay !== n) return;
    const w = rec.why,
      by = w.by ? C(w.by) : null,
      of = w.of ? C(w.of) : null,
      say = {
        dreamer: [
          `${v.short} had told the whole camp ${v.pp} dreams`,
          `${ru.c(v)} ${ru.gs(v, 'рассказывал', 'рассказывала')} свои сны всему лагерю`
        ],
        loud: [
          `${v.short} had made too much of dreaming true`,
          `${ru.c(v)} слишком громко ${ru.gs(v, 'говорил', 'говорила')} о вещих снах`
        ],
        cannotBear: by && [
          `${by.name} could not bear ${EP.him(v)}`,
          `${ru.cf(by)} ${ru.gs(v, 'его', 'её')} терпеть не ${ru.gs(by, 'мог', 'могла')}`
        ],
        dislike: by && [
          `${by.name} had never liked ${EP.him(v)}`,
          `${ru.cf(by)} ${ru.gs(v, 'его', 'её')} всегда ${ru.gs(by, 'недолюбливал', 'недолюбливала')}`
        ],
        suspects: of && [
          `${v.short} had begun to suspect ${of.name}`,
          `${ru.c(v)} ${ru.gs(v, 'начал', 'начала')} подозревать ${ru.cf(of, 'a')}`
        ],
        frame: of && [
          `${v.short} had named ${of.name} before everyone, and with ${v.short} dead, it was ${of.name} the camp would look at`,
          `${ru.c(v)} при всех ${ru.gs(v, 'назвал', 'назвала')} ${ru.cf(of, 'a')}, и со смертью ${ru.c(v, 'g')} лагерь стал бы смотреть на ${ru.cf(of, 'a')}`
        ],
        stood: [`${v.short} stood by you`, `${ru.c(v)} ${ru.gs(v, 'был', 'была')} на вашей стороне`]
      }[w.kind];
    if (w.kind === 'power')
      add(
        'm',
        `On night ${n}, with nobody of the cult left at large, the power below came for ${v.name} by itself.`,
        `В ночь ${n}, когда на свободе не осталось никого из секты, сила из-под земли сама пришла за ${ru.cf(v, 'i')}.`
      );
    else if (say) add('n', `The cult chose ${v.name} on night ${n}: ${say[0]}.`, `Сектанты выбрали ${ru.cf(v, 'a')} в ночь ${n}: ${say[1]}.`);
  });
}
// Whether what came on night n was the power below, come by itself (game/night.js: with nobody of the cult left at
// large, priestless; or for you, while the last of it lay in your tent, visit.spares), as the night recorded it: its
// scene (leaveTrace), or whatever came for you (S.log.attacks), the night that killed you among them.
const powerAt = n => !!(S.nights[n] && S.nights[n].power) || S.log.attacks.some(a => a.day === n && a.power);
// The dead, and the nights they came for you (or the power below came, by itself).
function fxNights({ r, L, add }) {
  // (and at the last, you: dead in the night, whatever did it; the dig itself by day is no night's doing)
  const taken = r.dead.slice().sort((a, b) => C(a).takenDay - C(b).takenDay),
    died = S.ended === 'death' && !S.fin,
    you = died && ['night', 'visit', 'spite', 'deed', 'wrist'].includes(S.hurtBy);
  if (taken.length)
    add(
      'm',
      `The night took ${listNames(taken.map(x => `${C(x).name} (night ${C(x).takenDay}${C(x).takenBy === 'you' ? ', by your hand' : ''})`))}${you ? ', and at the last, you' : ''}.`,
      `Ночь забрала ${ru.list(taken.map(x => `${ru.cf(C(x), 'a')} (ночь ${C(x).takenDay}${C(x).takenBy === 'you' ? ', вашей рукой' : ''})`))}${you ? ', а под конец и вас' : ''}.`
    );
  else if (you) add('n', 'After you came, the night took no one but you.', 'После вашего приезда ночь не забрала никого, кроме вас.');
  else add(died ? 'n' : 'p', 'After you came, the night took no one.', 'После вашего приезда ночь не забрала никого.');
  L.attacks.forEach(a => {
    const pw = powerAt(a.day);
    if (a.how === 'hurt')
      add(
        'm',
        pw
          ? `On night ${a.day} the power below came for you by itself, and you bled for it.`
          : `On night ${a.day} they came for you, and you bled for it.`,
        pw
          ? `В ночь ${a.day} сила из-под земли сама пришла за вами — и вы поплатились кровью.`
          : `В ночь ${a.day} они пришли за вами — и вы поплатились кровью.`
      );
    else if (a.how === 'bowl')
      add(
        'p',
        a.broke
          ? `On night ${a.day} the incantation bowl under your bed broke in your place.`
          : `On night ${a.day} the incantation bowl under your bed caught what came for you, and was whole in the morning, full of black water.`,
        a.broke
          ? `В ночь ${a.day} заклинательная чаша под вашей кроватью раскололась вместо вас.`
          : `В ночь ${a.day} заклинательная чаша под вашей кроватью поймала то, что приходило за вами, а утром оказалась цела и полна чёрной воды.`
      );
    else if (a.how === 'revolver')
      add(
        'n',
        `On night ${a.day} you fired into the dark at something under the tent wall.`,
        `В ночь ${a.day} вы стреляли в темноту — во что-то, проскользнувшее под стенку палатки.`
      );
    else if (a.how === 'woke')
      add(
        'n',
        pw
          ? `On night ${a.day} the power below came for you by itself, and you woke in time.`
          : `On night ${a.day} they came for you, and you woke in time.`,
        pw
          ? `В ночь ${a.day} сила из-под земли сама пришла за вами — но вы вовремя проснулись.`
          : `В ночь ${a.day} они пришли за вами — но вы вовремя проснулись.`
      );
  });
  L.quiet.forEach(d => {
    const low = L.low[d],
      a = low && low.about ? C(low.about) : null,
      why =
        low && low.why === 'heat' && a
          ? [
              `: the camp had begun to look hard at ${a.name}, and it let the night go by`,
              `: лагерь начал пристально присматриваться к ${ru.cf(a, 'd')}, и она переждала эту ночь`
            ]
          : low && low.why === 'after' && a
            ? [
                `: ${a.name} had been unmasked that evening, and it lay low`,
                `: в тот вечер ${ru.gs(a, 'был разоблачён', 'была разоблачена')} ${ru.cf(a)}, и она затаилась`
              ]
            : low && low.why === 'ahead'
              ? [': the rite was far along, and it would risk nothing', ': обряд зашёл далеко, и рисковать она не хотела']
              : ['', ''];
    add('n', `On night ${d} the cult came for no one${why[0]}.`, `В ночь ${d} секта ни за кем не пришла${why[1]}.`);
  });
  L.kept.forEach(k => {
    const c = C(k.id),
      rec = S.nights[k.day],
      t = rec && rec.target && S.chars[rec.target] ? C(rec.target) : null,
      sp = L.spite.find(x => x.day === k.day); // (someone else came to your tent that night, meaning you harm)
    add(
      'n',
      `The morning after night ${k.day}, ${c.name} said ${c.p} had seen someone off from your tent. ${sp ? 'The cult had not come near it, though someone else had, meaning you harm' : 'Nothing had come near it'}${t ? `: that night the cult came for ${t.name}` : ''}.`,
      `Наутро после ночи ${k.day} ${ru.cf(c)} ${ru.gs(c, 'уверял', 'уверяла')}, будто ${ru.gs(c, 'спугнул', 'спугнула')} кого-то у вашей палатки. ${sp ? 'Секта к ней не подходила — а вот кто-то другой подходил, желая вам зла' : 'Никто к ней и не подходил'}${t ? `: в ту ночь секта приходила за ${ru.cf(t, 'i')}` : ''}.`
    );
  });
  L.spared
    .filter(x => !x.away && !S.betrayals.some(b => b.day === x.day))
    .forEach(x => {
      const c = C(x.id),
        pw = powerAt(x.day);
      add(
        'n',
        pw
          ? `On night ${x.day} the power below came for ${c.name} by itself, and the camp’s dogs woke everyone first.`
          : `On night ${x.day} they came for ${c.name}, and the camp’s dogs woke everyone first.`,
        pw
          ? `В ночь ${x.day} сила из-под земли сама пришла за ${ru.cf(c, 'i')}, но собаки перебудили лагерь раньше.`
          : `В ночь ${x.day} они пришли за ${ru.cf(c, 'i')}, но собаки перебудили лагерь раньше.`
      );
    });
}
// The night you went out yourself (game/deed.js): whom, with what, what they were and what came of it; who saw you, what
// you left by the tent, the cult at your own tent while you were out, and the camp's judgement.
function fxDeed({ add }) {
  const d = S.log.deed;
  if (!d || !d.outcome) return;
  const t = C(d.id),
    g = (m, f) => ru.gs(t, m, f),
    what =
      t.role === 'cult'
        ? t.id === S.hierophant
          ? ['was one of them, and the hierophant', g('был одним из них — и иерофантом', 'была одной из них — и иерофантом')]
          : ['was one of them', g('был одним из них', 'была одной из них')]
        : {
            seer: ['dreamed true', g('видел вещие сны', 'видела вещие сны')],
            warden: ['kept watch over the camp', g('стерёг лагерь', 'стерегла лагерь')],
            smuggler: ['was a thief, and no more', g('был всего лишь вором', 'была всего лишь воровкой')],
            bystander: [`was exactly what ${t.p} seemed`, g('был именно тем, кем казался', 'была именно той, кем казалась')]
          }[t.role],
    was = [` ${EP.He(t)} ${what[0]}.`, ` ${g('Он', 'Она')} ${what[1]}.`],
    w = d.means === 'revolver' ? ['with your revolver', 'с револьвером'] : ['with a knife', 'с ножом'],
    went = [`On night ${d.day} you went to ${t.name}’s tent ${w[0]}`, `В ночь ${d.day} вы пошли к палатке ${ru.cf(t, 'g')} ${w[1]}`];
  if (d.outcome === 'killed')
    add(
      t.role === 'cult' ? 'n' : 'm',
      `${went[0]}, and killed ${EP.him(t)}.${was[0]}`,
      `${went[1]} и ${g('убили его', 'убили её')}.${was[1]}`
    );
  else if (d.outcome === 'failed')
    add(
      'm',
      `${went[0]}; ${t.p} woke and fought you off.${was[0]}`,
      `${went[1]}, но ${g('он проснулся и отбился', 'она проснулась и отбилась')}.${was[1]}`
    );
  else if (d.outcome === 'watched')
    add(
      'n',
      `${went[0]}, and the Watcher drove you off${d.knewBy ? ', and knew you' : ''}.${was[0]}`,
      `${went[1]}, но страж прогнал вас${d.knewBy ? ' — и узнал' : ''}.${was[1]}`
    );
  else {
    const tr = S.nights[d.day] && S.nights[d.day].truth[t.id],
      mate = tr && tr.with && S.chars[tr.with] ? C(tr.with) : null,
      why = {
        errand: [`${t.p} was out doing the cult’s work`, `${g('он', 'она')} делал${g('', 'а')} в ту ночь работу секты`],
        thief: [`${t.p} was out robbing the dig`, `${g('он', 'она')} обворовывал${g('', 'а')} раскоп`],
        tryst: mate
          ? [`${t.p} was out with ${mate.name}`, `${g('он был', 'она была')} где-то с ${ru.cf(mate, 'i')}`]
          : [`${t.p} was out`, `${g('его', 'её')} не было в лагере`],
        restless: [
          `${t.p} could not sleep, and was up and about, as people are at that hour`,
          `${g('ему', 'ей')} не спалось, и ${g('он бродил', 'она бродила')} где-то поблизости, как это бывает в такой час`
        ],
        gone:
          t.status === 'taken' && t.takenDay === d.day
            ? [`the cult had come for ${EP.him(t)} first, out in the dark`, `секта раньше вас нашла ${g('его', 'её')} в темноте`]
            : [`${t.p} was already gone`, `${g('его', 'её')} уже не было`]
      }[d.away] || ['', ''];
    add('n', `${went[0]}, and found it empty: ${why[0]}.${was[0]}`, `${went[1]} и нашли её пустой: ${why[1]}.${was[1]}`);
  }
  const seer = d.seenBy && C(d.seenBy);
  if (seer)
    add(
      d.caught === seer.id ? 'm' : 'n',
      `${seer.name} saw you between the tents that night${d.caught === seer.id ? ', and told the camp' : d.hinted === seer.id ? ', and hinted at it' : `, and kept it to ${EP.him(seer)}self`}.`,
      `${capS(ru.cf(seer))} ${ru.gs(seer, 'видел', 'видела')} вас той ночью между палатками${d.caught === seer.id ? ' — и рассказал' + ru.gs(seer, '', 'а') + ' лагерю' : d.hinted === seer.id ? ' — и намекал' + ru.gs(seer, '', 'а') + ' на это' : ' — и ' + ru.gs(seer, 'промолчал', 'промолчала')}.`
    );
  if (d.trace)
    add(
      d.linked ? 'm' : 'n',
      `A button from your jacket was found by the tent${d.linked ? ', and the camp knew whose it was' : ''}.`,
      `У палатки нашли пуговицу от вашей куртки${d.linked ? ' — и лагерь понял, чья она' : ''}.`
    );
  if (d.planted) {
    const o = C(d.plant.owner);
    add(
      'n',
      `You laid ${o.name}’s habit by the tent: ${d.plantSeen ? `${C(d.plantSeen).name} saw it for what it was` : d.plantTook ? `the camp took it for ${C(d.plantTook).name}’s` : 'nobody made anything of it'}.`,
      `У палатки вы оставили след привычки ${ru.cf(o, 'g')}: ${d.plantSeen ? `${ru.cf(d.plantSeen)} ${ru.gs(C(d.plantSeen), 'понял', 'поняла')}, что его подбросили` : d.plantTook ? `лагерь счёл его следом ${ru.cf(d.plantTook, 'g')}` : 'никто не придал ему значения'}.`
    );
  }
  // (what came for you while you were out: it found your tent empty, or the Watcher by it drove it off: game/night.js)
  const away = S.log.attacks.find(a => a.day === d.day && (a.how === 'out' || (a.how === 'guard' && a.out)));
  if (away && away.how === 'out')
    away.power
      ? add(
          'n',
          'That night the power below came for you by itself, and found your tent empty.',
          'В ту ночь сила из-под земли сама приходила за вами — и нашла вашу палатку пустой.'
        )
      : add(
          'n',
          'That night the cult came for you, and found your tent empty.',
          'В ту ночь секта приходила за вами — и нашла вашу палатку пустой.'
        );
  else if (away)
    away.power
      ? add(
          'n',
          'That night the power below came for you by itself while you were out, and the Watcher drove it off from your empty tent.',
          'В ту ночь, пока вас не было, сила из-под земли сама приходила за вами — и Страж прогнал её от вашей пустой палатки.'
        )
      : add(
          'n',
          'That night the cult came for you while you were out, and the Watcher drove it off from your empty tent.',
          'В ту ночь, пока вас не было, культ приходил за вами — и Страж прогнал его от вашей пустой палатки.'
        );
  if (d.vote)
    add(
      d.vote.passed ? 'm' : 'n',
      `On day ${d.vote.day} the camp sat in judgement on you, and ${d.vote.passed ? 'sent you away' : 'let you stay'}.`,
      `В день ${d.vote.day} лагерь решал вашу судьбу — и ${d.vote.passed ? 'отослал вас прочь' : 'позволил остаться'}.`
    );
}
// The evening someone came to your tent (people/visit.js): what she was, what you answered, and what the night held.
function fxVisit({ add }) {
  const v = S.log.visit;
  if (!v) return;
  const h = C(v.id),
    cult = h.role === 'cult',
    was = cult ? [' She was one of them.', ' Она была одной из них.'] : [' She was what she seemed.', ' Она была той, кем казалась.'],
    // (what came that night: the cult, or the power below by itself; either feminine in Russian, «секта», «сила»)
    pw = powerAt(v.day),
    it = pw ? ['the power below', 'сила из-под земли'] : ['the cult', 'секта'];
  if (!v.agreed) {
    add(
      cult ? 'p' : 'n',
      `On the evening of day ${v.day} ${h.name} came to your tent, and you sent her back.${was[0]}`,
      `Вечером дня ${v.day} к вам в палатку пришла ${ru.cf(h)}, и вы отправили её обратно.${was[1]}`
    );
    return;
  }
  add(
    'n',
    `On the evening of day ${v.day} ${h.name} came to your tent, and stayed the night.${was[0]}`,
    `Вечером дня ${v.day} к вам в палатку пришла ${ru.cf(h)} и осталась на ночь.${was[1]}`
  );
  if (v.struck === 'failed')
    S.ended === 'death' && S.hurtBy === 'wrist'
      ? add(
          'm',
          'In the small hours she tried to kill you. You caught her wrist in time, but not her blade.',
          'Под утро она попыталась вас убить. Её руку вы перехватили вовремя — но не её клинок.'
        )
      : add(
          'p',
          'In the small hours she tried to kill you, and you caught her wrist in time.',
          'Под утро она попыталась вас убить, но вы вовремя перехватили её руку.'
        );
  else if (cult && v.struck !== 'killed') add('n', 'She let you live that night.', 'В ту ночь она оставила вас в живых.');
  // (she was the last of the cult at large, and what came for you was the power below: game/night.js, visit.spares)
  if (cult && S.log.attacks.some(a => a.day === v.day && a.power))
    add(
      'n',
      'With the last of the cult beside you, it was the power below that came for you that night, by itself.',
      'Пока последняя из секты была рядом с вами, в ту ночь за вами пришла сама сила из-под земли.'
    );
  if (v.out)
    add(
      'n',
      'In the night she slipped out of your tent and did the cult’s work herself, while you slept.',
      'Ночью, пока вы спали, она выскользнула из вашей палатки и сама сделала работу секты.'
    );
  if (v.empty)
    add(
      'n',
      `That night ${it[0]} came for her, and found her tent empty.`,
      `В ту ночь ${it[1]} приходила за ней — и нашла её палатку пустой.`
    );
  if (v.found)
    add(
      v.found === 'dead' ? 'm' : 'n',
      v.found === 'dead'
        ? `That night ${it[0]} came for her, knew where she slept, and killed her beside you in your sleep.`
        : v.found === 'watch'
          ? `That night ${it[0]} came for her at your tent, and the Watcher drove it off.`
          : `That night ${it[0]} came for her at your tent, and the dogs woke the camp first.`,
      v.found === 'dead'
        ? `В ту ночь ${it[1]} приходила за ней, знала, где она спит, — и убила её рядом с вами, пока вы спали.`
        : v.found === 'watch'
          ? `В ту ночь ${it[1]} приходила за ней к вашей палатке — и страж её прогнал.`
          : `В ту ночь ${it[1]} приходила за ней к вашей палатке — но собаки перебудили лагерь раньше.`
    );
  if (v.through === 'her')
    add('m', `That night ${it[0]} came for you, and took her instead.`, `В ту ночь ${it[1]} приходила за вами — а забрала её.`);
  else if (v.through === 'hurt')
    add(
      'n',
      `That night ${it[0]} came for you; she screamed, and it fled.`,
      `В ту ночь ${it[1]} приходила за вами; ${ru.c(h)} закричала, и ${pw ? 'сила отступила' : 'сектанты бежали'}.`
    );
  if (v.chill)
    add(
      'n',
      cult ? 'The cold you felt as she came in was the cult’s.' : 'The cold you felt as she came in was only the night.',
      cult
        ? 'Холод, который вы почувствовали, когда она вошла, был холодом секты.'
        : 'Холод, который вы почувствовали, когда она вошла, был всего лишь ночным холодом.'
    );
}
// Your notebook: the marks you made, and when you exposed the first of them.
function fxNotebook({ r, add }) {
  if (r.mR + r.mW === 0)
    add('n', 'You never marked anyone before their part came out.', 'Вы так никого и не отметили до того, как правда о них вышла наружу.');
  else
    add(
      r.mW === 0 ? 'p' : r.mW > r.mR ? 'm' : 'n',
      `You marked ${r.mR} of the seven rightly${r.mW ? ` and ${r.mW} wrongly` : ''}, before each one’s part came out.`,
      `Вы верно отметили ${r.mR} из семи${r.mW ? `, неверно — ${r.mW}` : ''}, ещё до того, как правда о каждом вышла наружу.`
    );
  if (r.first)
    add(
      r.first <= RULES.reckoning.earlyDay ? 'p' : 'n',
      `You exposed the first of them on day ${r.first}.`,
      `Первого из них вы разоблачили в день ${r.first}.`
    );
  else if (!r.gate.length)
    add('m', 'You never exposed any of them in daylight.', 'Ни одного из них вы так и не разоблачили при свете дня.');
}
// You yourself: what came home with you, the inquiries you never called, your wounds and your nerve.
function fxYourself({ haunt, won, r, L, add }) {
  if (haunt && (won || haunt === 2))
    add(
      'm',
      won ? 'What you read and saw at Kutha came home with you.' : 'You let more of Kutha into you than anyone should.',
      won
        ? 'Прочитанное и увиденное в Куте вернулось домой вместе с вами.'
        : 'Вы впустили в себя больше Куты, чем следует кому бы то ни было.'
    );
  if (!L.inq) add('n', 'You never once called the camp to an inquiry.', 'Вы ни разу не созвали лагерь на дознание.');
  if (!L.woundsTaken) add('p', 'You came through the season without a wound.', 'Вы прошли весь сезон без единой раны.');
  else
    add(
      'm',
      `You took ${L.woundsTaken === 1 ? 'a wound' : `${L.woundsTaken} wounds`} in the season${L.healed ? `, and had ${['one', 'two', 'three'][L.healed - 1] || L.healed} seen to by a doctor` : ''}.`,
      `За сезон вы получили ${L.woundsTaken === 1 ? 'рану' : `${L.woundsTaken} ${ruN(L.woundsTaken, 'рану', 'раны', 'ран')}`}${L.healed ? `, и ${['одну', 'две', 'три'][L.healed - 1] || L.healed} вам залечил врач` : ''}.`
    );
  if (L.dread)
    add(
      'm',
      `Kutha came for your nerve of its own accord ${enTimes(L.dread)}, whatever you were doing.`,
      `Кута ${ruTimes(L.dread)} сама добралась до ваших нервов — чем бы вы ни были заняты.`
    );
  if (L.perils.length)
    add('m', `The dig itself hurt you ${enTimes(L.perils.length)}.`, `Сами раскопки ${ruTimes(L.perils.length)} причинили вам вред.`);
  if (L.minNerve > 0 && L.minNerve <= RULES.reckoning.frayed)
    add(
      'm',
      `Your nerve nearly broke: at its lowest it stood at ${L.minNerve}.`,
      `Нервы едва не сдали: однажды их оставалось всего ${L.minNerve}.`
    );
  if (r.steady && L.minNerve > 0) add('p', 'You ended the season with your nerve steady.', 'Сезон вы закончили с крепкими нервами.');
  else if (S.nerve > 0 && S.nerve <= END_SAYS.rags && L.minNerve > RULES.reckoning.frayed)
    add('m', 'You ended the season with your nerve in rags.', 'Сезон вы закончили с расшатанными в клочья нервами.');
}
// what the power below favoured in those who came down to it, and what it would not abide (NATURE, rules.js), as
// [English, Russian]
const WAY_WORDS = {
  bold: ['boldness', 'дерзость'],
  humble: ['humility', 'смирение'],
  truth: ['the truth', 'правда'],
  guile: ['lies', 'ложь'],
  haste: ['haste', 'спешка'],
  patience: ['patience', 'терпение'],
  offer: ['gifts', 'дары'],
  water: ['water', 'вода'],
  light: ['light', 'свет'],
  take: ['taking what is not yours', 'взятое без спроса'],
  refuse: ['refusal', 'отказ'],
  bronze: ['bronze', 'бронза'],
  word: ['the written word', 'письменное слово'],
  break: ['breaking things', 'разрушение']
};
function natureSay() {
  const N = NATURE[S.aspectOf[S.patron]],
    ws = v => Object.keys(N).filter(w => N[w] === v),
    en = v => listNames(ws(v).map(w => WAY_WORDS[w][0])),
    rus = v => ru.list(ws(v).map(w => WAY_WORDS[w][1]));
  return [
    `<p>Below, it favoured ${en(1)}, and would not abide ${en(-1).replace(/ and ([^,]*)$/, ' or $1')}.</p>`,
    `<p>Внизу ${ru.gf(S.patron) ? 'ей' : 'ему'} были по нраву ${rus(1)}; не по нраву — ${rus(-1)}.</p>`
  ];
}
// what kind of season it was, and how it turned
function fxSeason({ add }) {
  add('n', ...tenorStory());
}
// ---------- the season in numbers, and the truth ----------
function endNumbers(r) {
  const L = S.log,
    sg = r.score > 0 ? '+' : r.score < 0 ? '−' : '';
  const cells = [
    [S.day, 'Days', 'Дни'],
    [L.talk, 'Conversations', 'Разговоры'],
    [S.stats.right, 'Exposed', 'Разоблачены'],
    [r.wrong.length, 'Wrongly accused', 'Обвинены зря'],
    [r.refused, 'Inquiries refused', 'Дознаний отвергнуто'],
    [S.stats.taken, 'Taken by the night', 'Забрала ночь'],
    [`${L.examineOk}/${L.examine}`, 'Scenes read', 'Прочитаны следы'],
    [L.search, 'Searches', 'Поиски'],
    [`${L.charms.length}/6`, 'Charms found', 'Найдены амулеты'],
    [S.factKnown.length, 'Tablet lines', 'Строки с табличек'],
    [`${S.omenSeen.length}/4`, 'Signs seen', 'Знамения'],
    [L.horror + L.dread, 'Horrors', 'Ужасы'],
    [L.attacks.length, 'Attacks on you', 'Нападения на вас'],
    [`${S.nerve}/${S.nerveMax}`, 'Nerve at the end', 'Нервы в конце'],
    [`${L.minNerve}/${S.nerveMax}`, 'Lowest nerve', 'Нервы: минимум'],
    [L.nerveLost, 'Nerve lost', 'Нервов потеряно'],
    [L.nerveGained, 'Nerve regained', 'Нервов восстановлено'],
    [`${S.wounds}/${S.woundsMax}`, 'Wounds', 'Раны'],
    [
      `${S.clues.filter(cl => cl.status === 'planted').length}/${S.clues.filter(cl => cl.source === 'plant').length}`,
      'Planted traces seen',
      'Раскрыто подброшенных следов'
    ],
    [`${r.mR}/7`, 'Marked rightly', 'Верные отметки'],
    [L.confess, 'Confessions aloud', 'Признания вслух'],
    [r.friends.length, 'Trusted you', 'Доверяли вам'],
    [r.enemies.length, 'Turned against you', 'Против вас'],
    [sg + Math.abs(r.score), 'Conduct', 'Поведение']
  ];
  return `<div class="numbers">${cells.map(([v, en, rus]) => `<div class="num"><b>${v}</b><span>${bi(en, rus)}</span></div>`).join('')}</div>`;
}
// what each person chose to claim at the start, whether you heard it or not
function claimCell(c) {
  const cl = claimOf(c),
    g = (m, f) => ru.gs(c, m, f),
    hid = cl.why === 'conceal' && (c.role === 'seer' || c.role === 'warden');
  const role = cl.recanted != null && cl.was && cl.was !== 'none' ? cl.was : cl.role; // (a staged confession: the part it claimed)
  const what = hid
    ? role === 'evade'
      ? ['would not say', `${g('уклонялся', 'уклонялась')} от ответа`]
      : ['hid the part', `${g('скрывал', 'скрывала')} свою роль`]
    : role === 'seer'
      ? ['the Dreamer', g('сновидец', 'сновидица')]
      : role === 'warden'
        ? ['the Watcher', 'страж']
        : role === 'evade'
          ? ['would not say', `${g('уклонялся', 'уклонялась')} от ответа`]
          : null;
  if (!what) return '—';
  const why =
    cl.why === 'truth'
      ? ['true', 'правда']
      : cl.why === 'deceit'
        ? ['to deceive', 'чтобы обмануть']
        : cl.heat
          ? ['in a temper', 'сгоряча']
          : cl.why === 'reticent'
            ? ['on principle', 'из принципа']
            : cl.why === 'liked'
              ? ['to be liked', 'чтобы понравиться']
              : c.role === 'seer'
                ? ['for fear', 'из страха']
                : c.role === 'warden'
                  ? ['to watch unseen', 'чтобы стеречь незримо']
                  : ['as a cover', 'для прикрытия'];
  const back =
    cl.recanted == null
      ? null
      : cl.was === 'none' && cl.role !== trueClaim(c)
        ? ['a staged confession', g('разыграл признание', 'разыграла признание')]
        : cl.how === 'confess' || cl.how === 'public' || cl.how === 'aside'
          ? ['came clean', g('признался', 'призналась')]
          : ['took it back', g('отказался', 'отказалась')];
  return bi(`${what[0]} · ${why[0]}${back ? ' · ' + back[0] : ''}`, `${what[1]} · ${why[1]}${back ? ' · ' + back[1] : ''}`);
}
// What became of someone, as the truth tells it: one of the cult killed by another is told so only now.
function fateText(c) {
  const b = S.betrayals.find(x => x.victim === c.id && !x.saved);
  if (!b) return statusText(c);
  const k = C(b.by);
  return bi(`Killed by ${k.short}, night ${b.day}`, `${ru.gs(c, 'Убит', 'Убита')} рукой ${ru.c(k, 'g')} в ночь ${b.day}`);
}
// The scribes' errors among the lines you read: what the tablet said, and what it should have said (world/powers.js,
// scribeErr). Nothing told you, until now.
function scribeSaid() {
  const wrong = S.factKnown.map(i => S.facts[i]).filter(f => f.scribe);
  if (!wrong.length) return '';
  const one = wrong.length === 1,
    lines = wrong
      .map(
        f =>
          `<p class="lore">${bi('“', '«')}${f.text}${bi('”', '»')} ${bi('It should have said:', 'А следовало:')} ${bi('“', '«')}${f.scribe}${bi('”', '»')}</p>`
      )
      .join('');
  return (
    `<p>${bi(one ? 'One line you read was a scribe’s error, and false:' : 'Some lines you read were scribes’ errors, and false:', one ? 'Одна из прочитанных вами строк — ошибка писца, и она лжёт:' : 'Несколько прочитанных вами строк — ошибки писцов, и они лгут:')}</p>` +
    lines
  );
}
// The signs you saw that were not the power's at all, but another's, by coincidence (game/day.js, nextOmen): nothing
// told you, until now.
function strayOmensSaid() {
  const odd = S.omenLog.filter(o => o.stray);
  if (!odd.length) return '';
  const fem = ru.gf(S.patron),
    one = odd.length === 1,
    en = odd.map(o => `${SIGN_POOL[o.si].short} (day ${o.day})`).join('; '),
    rus = odd.map(o => `${R(SIGN_POOL[o.si].short)} (день ${o.day})`).join('; ');
  return `<p>${bi(
    `${one ? 'One sign you saw was' : 'Some signs you saw were'} not its own at all, but ${one ? 'a coincidence' : 'coincidences'}: ${en}.`,
    `${one ? 'Одно из замеченных вами знамений было' : 'Некоторые из замеченных вами знамений были'} вовсе не ${fem ? 'её' : 'его'}, а ${one ? 'простым совпадением' : 'простыми совпадениями'}: ${rus}.`
  )}</p>`;
}
// What came in another power's manner than the power below's own (world/deaths.js, mannerOf), and the traces that were
// not their owners' own habits (game/state.js, addClue).
const MANNER_OF = {
  fire: ['the burning one', 'огненной силы'],
  dust: ['the dust of the dead', 'праха мёртвых'],
  sea: ['the salt deep', 'солёной бездны'],
  teeth: ['the hungry teeth', 'голодных зубов'],
  plague: ['the sixty sicknesses', 'шестидесяти хворей'],
  madness: ['the laughing dark', 'смеющейся тьмы']
};
function mannerSaid() {
  const m = S.log.manner.map(x => {
    const [en, rus] = MANNER_OF[x.asp];
    return x.id === 'crane'
      ? bi(
          `Crane’s death was in another power’s manner, not its own: that of ${en}.`,
          `Смерть Крейна несла почерк другой силы, а не этой: ${rus}.`
        )
      : x.id === 'you'
        ? bi(
            `The night they came for you, night ${x.day}, it came in another power’s manner: that of ${en}.`,
            `В ночь ${x.day}, когда пришли за вами, всё было в манере другой силы: ${rus}.`
          )
        : bi(
            `The way ${C(x.id).name} was found on night ${x.day} was another power’s manner, not its own: that of ${en}.`,
            `То, как нашли ${ru.cf(C(x.id), 'a')} в ночь ${x.day}, несло почерк другой силы, а не этой: ${rus}.`
          );
  });
  const t = S.clues
    .filter(cl => cl.smudged)
    .map(cl => {
      const o = C(cl.owner),
        was = TRAITS[cl.cat].vals[cl.val].name,
        own = TRAITS[cl.cat].vals[cl.smudged].name;
      return bi(
        `On ${cl.day === 0 ? 'the night Crane died' : `night ${cl.day}`} the trace ${LOCS[cl.loc].at} was ${o.name}’s, though not ${o.pp} habit: ${was}, only that night. ${capS(o.pp)} own: ${own}.`,
        `${cl.day === 0 ? 'В ночь гибели Крейна' : `В ночь ${cl.day}`} след ${R(LOCS[cl.loc].at)} оставил${ru.gs(o, '', 'а')} ${ru.cf(o)}, хотя это не ${ru.gs(o, 'его', 'её')} привычка: ${R(was)} — только в ту ночь. На самом деле — ${R(own)}.`
      );
    });
  return m
    .concat(t)
    .map(x => `<p>${x}</p>`)
    .join('');
}
// The marks you misread on a charm (world/powers.js, readMarks).
const misreadSaid = () =>
  S.charms
    .filter(w => S.marksSeen && S.marksSeen[w] && S.marksSeen[w].some((m, i) => m !== S.marksOf[w][i]))
    .map(w => {
      const k = S.marksSeen[w].findIndex((m, i) => m !== S.marksOf[w][i]),
        was = CHARM_MARKS[S.marksSeen[w][k]],
        is = CHARM_MARKS[S.marksOf[w][k]];
      return `<p>${bi(
        `You misread a mark on ${theItem(w)}: what you took for ${was.en.see} was ${is.en.see}.`,
        `Вы неверно прочли примету на предмете «${R(ITEMS[w].name)}»: то, что вы приняли за «${was.ru.see}», было на самом деле «${is.ru.see}».`
      )}</p>`;
    })
    .join('');
// The old title you knew from your studies, if you misremembered it (game/state.js, backgroundStart).
const misrememberedSaid = () =>
  S.glosses
    .filter(gl => gl.by === 'you' && S.titleOf[gl.e] !== gl.g)
    .map(
      gl =>
        `<p>${bi(
          `The old title you knew from your studies, “${ttEn(gl.e)}”, was ${GODS[S.titleOf[gl.e]].name}’s, not ${GODS[gl.g].name}’s: you misremembered it.`,
          `Древний титул, знакомый вам по прежним занятиям, «${ttRu(gl.e)}», принадлежал ${ru.god(S.titleOf[gl.e], 'd')}, а не ${ru.god(gl.g, 'd')}: память вас подвела.`
        )}</p>`
    )
    .join('');
// The people whose manner you read wrongly (people/tempers.js, mienNote).
const mienSaid = () =>
  S.testimony
    .filter(t => t.kind === 'mien' && t.verdict !== temperOf(t.from))
    .map(t => {
      const c = C(t.from);
      return `<p>${bi(
        `You took ${c.name} for ${TEMPER_NAMES[t.verdict][0]}; ${c.p} was ${TEMPER_NAMES[temperOf(c)][0]}.`,
        `Вам показалось, что ${ru.cf(c)} — ${TEMPER_NAMES[t.verdict][ru.f(c) ? 2 : 1]}; на самом деле — ${TEMPER_NAMES[temperOf(c)][ru.f(c) ? 2 : 1]}.`
      )}</p>`;
    })
    .join('');
// The habits you noted that were only that day's, not theirs (game/state.js, reveal).
function misnotedSaid() {
  return castOrder(S.order)
    .map(C)
    .flatMap(c => CATS.filter(k => c.known[k] && c.known[k] !== c.traits[k]).map(k => [c, k]))
    .map(([c, k]) => {
      const was = TRAITS[k].vals[c.known[k]].name,
        is = TRAITS[k].vals[c.traits[k]].name;
      return `<p>${bi(
        `What you noted of ${c.name} was not ${c.pp} habit, only that day’s: ${was}. ${capS(c.pp)} own: ${is}.`,
        `То, что вы заметили за ${ru.cf(c, 'i')}, было не привычкой, а случайностью того дня: ${R(was)}. На самом деле — ${R(is)}.`
      )}</p>`;
    })
    .join('');
}
function endTruth() {
  const g = GODS[S.patron],
    pw = S.wardOf[S.patron],
    fem = ru.gf(S.patron),
    named = S.fin && S.fin.named;
  const rows = castOrder(S.order)
    .map(C)
    .map(c => {
      // the mark that counts is the one that stood when their part came out; a later change is shown, not counted
      const m = markOf(c),
        right = (m === 'foe' && c.role === 'cult') || (m === 'ally' && c.role !== 'cult'),
        wrong = (m === 'foe' && c.role !== 'cult') || (m === 'ally' && c.role === 'cult'),
        later =
          c.mark !== m
            ? ` <span class="dim">${bi(`(later: ${MARKS[c.mark].toLowerCase()})`, `(потом: ${ruMark(c).toLowerCase()})`)}</span>`
            : '';
      const role = c.id === S.hierophant ? 'Hierophant' : ROLE_NAMES[c.role],
        roleRu = RU_ROLE[c.id === S.hierophant ? 'hierophant' : c.role][ru.f(c) ? 1 : 0];
      return `<tr><td>${bi(c.name, capS(ru.cf(c)))}</td><td class="r-${c.role}">${bi(role, roleRu)}<span class="temper">${temperName(temperOf(c), c)}</span></td><td class="dim">${claimCell(c)}</td><td class="dim">${feelName(c)}</td><td>${m === '?' ? '—' : bi(MARKS[m], ruMark(c, m))} ${right ? '<span class="ok">✓</span>' : wrong ? '<span class="bad">✗</span>' : ''}${later}</td><td class="dim">${fateText(c)}</td></tr>`;
    })
    .join('');
  const tl = S.titlesOf[S.patron];
  return (
    bi(
      `<p>The power under Kutha was <b>${g.name}</b>, ${g.title}. ${named ? (named === S.patron ? 'You named it correctly.' : `You named ${GODS[named].name}.`) : ''} The tablets called it ${ttEn(tl[0])} and ${ttEn(tl[1])}. Its ward, ${theItem(pw)} (“${rdEn(pw)}” in this season’s tablets), ${V(pw, 'was', 'were')} hidden ${LOCS[S.wardAt[pw]].at}${has(pw) ? `, and you had ${V(pw, 'it', 'them')}` : ''}. ${capS(theItem(S.decoys[0]))} and ${theItem(S.decoys[1])} bound nothing.</p>
    <p>Its four signs: ${S.signsOf[S.patron].map(si => SIGN_POOL[si].short).join('; ')}.</p>${natureSay()[0]}`,
      `<p>Под Кутой ${fem ? 'таилась' : 'таился'} <b>${ru.god(S.patron)}</b>, ${R(g.title).charAt(0).toLowerCase() + R(g.title).slice(1)}. ${named ? (named === S.patron ? `Вы назвали ${fem ? 'её' : 'его'} верно.` : `Вы назвали другое имя: ${ru.god(named)}.`) : ''} В табличках ${fem ? 'её' : 'его'} называли так: «${ttRu(tl[0])}» и «${ttRu(tl[1])}». Оберегом против ${fem ? 'неё' : 'него'} был${ru.ig(pw, '', 'а', 'о', 'и')} ${ru.item(pw)} (в табличках этого сезона — «${rdRu(pw)}»); ${ru.ig(pw, 'он лежал', 'она лежала', 'оно лежало', 'они лежали')} ${ru.loc(S.wardAt[pw], 'at')}${has(pw) ? ` — и ${ru.ig(pw, 'был', 'была', 'было', 'были')} при вас` : ''}. ${ru.Item(S.decoys[0])} и ${ru.item(S.decoys[1])} не связывали никого.</p>
    <p>${fem ? 'Её' : 'Его'} четыре знамения: ${S.signsOf[S.patron].map(si => R(SIGN_POOL[si].short)).join('; ')}.</p>${natureSay()[1]}`
    ) +
    strayOmensSaid() +
    mannerSaid() +
    scribeSaid() +
    misreadSaid() +
    misrememberedSaid() +
    misnotedSaid() +
    mienSaid() +
    `<div class="tablewrap"><table><thead><tr><th>${bi('Person', 'Человек')}</th><th>${bi('Role', 'Роль')}</th><th>${bi('Claimed', 'Заявленная роль')}</th><th>${bi('Toward you', 'К вам')}</th><th>${bi('Your mark', 'Ваша отметка')}</th><th>${bi('Fate', 'Судьба')}</th></tr></thead><tbody>${rows}</tbody></table></div>`
  );
}
