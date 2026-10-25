// ===================== THE DAY: three slots, seven places =====================
// Each slot you go somewhere and do one thing there: talk, search, examine a scene, translate, rest.
function placeChars() {
  S.here = {};
  LOC_IDS.forEach(l => {
    S.here[l] = [];
  });
  // in no fixed order, so that anyone may be the one who finds a friend already there, or someone to keep away from
  for (const c of shuffle(freeChars())) {
    const w = { ...RULES.places },
      E = RULES.evening;
    if (atEvening()) {
      w.camp += E.camp;
      if (c.role === 'cult') {
        w.ziggurat += E.cultZiggurat;
        w.cemetery += E.cultCemetery;
      }
    }
    let l = wpick(w);
    // people keep away from someone they cannot bear, and now and then go where a fond friend already is; the cult mostly
    // will not follow one of its own about, the better not to be seen together
    if (S.here[l].some(id => Ties.cannotBear(c.id, id)) && chance(RULES.company.avoid)) {
      delete w[l];
      l = wpick(w);
    } else {
      const apart = c.role === 'cult' && chance(RULES.company.cultApart);
      const fond = LOC_IDS.filter(at => S.here[at].some(id => Ties.close(c.id, id) && !(apart && C(id).role === 'cult')));
      if (fond.length && chance(RULES.company.follow)) l = pick(fond);
    }
    S.here[l].push(c.id);
    c.loc = l;
    // who went where today (a trace of theirs may be found there tonight: game/night.js)
    if (!S.visits || S.visits.day !== S.day) S.visits = { day: S.day, at: {} };
    const v = (S.visits.at[l] = S.visits.at[l] || []);
    if (!v.includes(c.id)) v.push(c.id);
  }
}
function startSlot() {
  placeChars();
  planScene();
}
function whoAt(l) {
  const ids = (S.here[l] || []).filter(id => isFree(C(id))),
    n = ids.map(c => C(c).short);
  return bi(n.length ? n.join(', ') : 'Nobody', ids.length ? ids.map(c => ru.c(c)).join(', ') : 'Никого');
}
function planScene() {
  S.talkId = null;
  S.phase = 'plan';
  S.loc = null;
  const choices = LOC_IDS.map(l => ({
    label: bi(LOCS[l].name),
    sub:
      whoAt(l) +
      (S.crime && S.crime.loc === l && !S.crime.examined
        ? S.day === 1
          ? bi(' · where Crane was found', ' · здесь нашли Крейна')
          : bi(' · scene of last night’s attack', ' · здесь напали этой ночью')
        : '') +
      (S.searched[l] ? searchedSay(S.searched[l]) : ''),
    fn: () => goTo(l)
  }));
  if (has('brandy'))
    choices.push({
      label: bi('Drink from the brandy flask', 'Глотнуть бренди из фляжки'),
      sub: bi('Steadies your nerve · takes no time', 'Успокаивает нервы · не отнимает времени'),
      cls: 'minor',
      fn: () => {
        useBrandy();
        planScene();
      }
    });
  show({
    kicker: dayStamp(),
    title: bi('Where will you go?', 'Куда теперь?'),
    body: [
      // (how the plan works is said on the first day only)
      bi(
        `<p>${slotIntro()[0]}</p>` +
          (S.day === 1
            ? `<p class="dim">Choose a place on the site plan or below. What you do there takes up the ${SLOT_NAMES[S.slot].toLowerCase()}.</p>`
            : ''),
        `<p>${slotIntro()[1]}</p>` +
          (S.day === 1
            ? `<p class="dim">Выберите место на плане раскопа или в списке ниже. То, чем вы там займётесь, отнимет ${RU_SLOT_SPAN[S.slot]}.</p>`
            : '')
      )
    ],
    choices
  });
}
// the time of day, as it looks: the first light in the season's mood, then the afternoon and the evening (each day's
// own, and none of them told twice in a season while another is left: core/text.js, tellAt)
const slotIntro = () => {
  if (!S.slot) return tenorDawn();
  const k = S.slot === 1 ? 'afternoon' : 'evening';
  return tellAt(k, [[SLOT_INTRO[S.slot], R(SLOT_INTRO[S.slot])], ...SAY[k]], S.day - 1);
};
function useBrandy() {
  if (!has('brandy')) return;
  lose('brandy');
  regain(RULES.day.brandy);
  journal(bi('You drank the brandy.', 'Вы выпили бренди.'));
}
function goTo(l) {
  const fresh = S.loc !== l;
  if (fresh) emit('steps');
  S.talkId = null;
  S.phase = 'loc';
  S.loc = l;
  const L = LOCS[l],
    ppl = (S.here[l] || []).map(C).filter(isFree),
    told = S.told;
  // (how the place looks, told otherwise from one visit to the place to the next, and that nobody else is there, from one
  // empty place to the next; the same while you stay: counted as you arrive)
  if (fresh) {
    told['at-' + l] = (told['at-' + l] || 0) + 1;
    if (!ppl.length) told.empty = (told.empty || 0) + 1;
  }
  const looks = tellAt('place-' + l, [...L.desc.map(d => [d, R(d)]), ...SAY.places[l]], (told['at-' + l] || 1) - 1),
    nobody = tellAt('nobody', SAY.nobody, (told.empty || 1) - 1);
  const body = [
    `<p>${bi(...looks)}</p>`,
    `<p class="dim">${ppl.length ? bi('Here: ' + listNames(ppl.map(c => c.name)) + '.', 'Здесь: ' + ru.list(ppl.map(c => ru.cf(c))) + '.') : bi(...nobody)}</p>`
  ];
  const ch = [];
  const crimeHere = S.crime && S.crime.loc === l && !S.crime.examined;
  if (crimeHere) {
    // (both traces, where a careless attacker left two, as the night's page told them)
    const cl = S.crime.clue,
      more = S.crime.more;
    body.push(
      more
        ? bi(
            `<p class="warn">${S.day === 1 ? 'Where Crane was found, two traces remain' : 'Last night’s traces are still here'}: ${clueText(cl)}, and beside it ${clueText(more)}.</p>`,
            `<p class="warn">${S.day === 1 ? 'Там, где нашли Крейна, остались следы' : 'Следы прошлой ночи всё ещё здесь'}: ${clueTextRu(cl)}, а рядом — ${clueTextRu(more)}.</p>`
          )
        : bi(
            `<p class="warn">${S.day === 1 ? 'Where Crane was found, a trace remains' : 'Last night’s trace is still here'}: ${clueText(cl)}.</p>`,
            `<p class="warn">${S.day === 1 ? 'Там, где нашли Крейна, остался след' : 'След прошлой ночи всё ещё здесь'}: ${clueTextRu(cl)}.</p>`
          )
    );
    ch.push({
      label: bi('Examine the scene', 'Осмотреть место'),
      sub: bi('Read the ground before the wind and the workmen do', 'Прочесть землю, пока её не замёл ветер и не затоптали рабочие'),
      fn: doExamine
    });
  }
  if (L.search)
    ch.push({
      label: bi('Search the area', 'Обыскать место'),
      sub:
        bi('Tablets, signs, objects, and whatever else is down there', 'Таблички, знамения, вещи — и всё прочее, что скрывает земля') +
        (S.searched[l] ? searchedSay(S.searched[l]) : ''),
      fn: () => doSearch(l)
    });
  ppl.forEach(c =>
    ch.push({ label: bi(`Speak with ${c.short}`, `Поговорить с ${ru.c(c, 'i')}`), sub: bi(c.job, ru.ch(c).job), fn: () => talk(c.id) })
  );
  if (l === 'camp') campActs(body, ch);
  ch.push({ label: bi('Go somewhere else', 'Пойти в другое место'), cls: 'minor', fn: planScene });
  show({ kicker: dayStamp(), title: bi(L.name), body, choices: ch });
}
// what only the camp offers: your tablets to translate, your tent, and in the evening an inquiry (unless the camp will
// hold no more), or the deed
function campActs(body, ch) {
  if (S.fragments > 0)
    ch.push({
      label: bi('Translate a tablet fragment', 'Перевести обломок таблички'),
      sub: bi(`${S.fragments} waiting`, `Ждут перевода: ${S.fragments}`),
      fn: studyPick
    });
  ch.push({
    label: bi('Rest in your tent', 'Отдохнуть в палатке'),
    sub: bi('Steadies your nerve', 'Успокаивает нервы'),
    fn: doRest
  });
  if (S.walkout)
    body.push(`<p class="dim">${bi('The camp will hold no more inquiries.', 'Лагерь больше не станет собираться на дознания.')}</p>`);
  else if (atEvening() && !S.inquiryDone && freeChars().length)
    ch.push({
      label: bi('Convene an inquiry', 'Созвать дознание'),
      sub: bi('Accuse someone before the whole camp', 'Обвинить кого-то перед всем лагерем'),
      cls: 'danger',
      fn: inquiryScene
    });
  // and, once a season, of an evening, instead of an inquiry: the deed (game/deed.js), whether or not the camp will
  // still hold an inquiry
  if (deedOffered())
    ch.push({
      label: bi('Settle it yourself, tonight', 'Взять всё в свои руки — этой ночью'),
      sub: bi('There is only one way to stop this', 'Остановить это можно только одним способом'),
      cls: 'danger',
      fn: deedScene
    });
  // (where inquiries are held is said until the first one; a short day's warning, always)
  if (S.slot < eveningSlot() && !S.walkout && (S.slotsToday <= RULES.start.shortSlots || !S.inquiries.length))
    body.push(
      S.slotsToday > RULES.start.shortSlots
        ? `<p class="dim">${bi('Inquiries can be held here in the evening.', 'Вечером здесь можно созвать дознание.')}</p>`
        : `<p class="dim">${bi('The day ends early: there will be no evening in camp today, and no inquiry.', 'День кончится рано: вечера в лагере сегодня не будет, а значит, и дознания.')}</p>`
    );
}
function endSlot(html, title) {
  let extra = '';
  if (S.loc) {
    const here = (S.here[S.loc] || []).map(C).filter(isFree),
      ppl = here.filter(c => unknownCats(c).length);
    if (ppl.length && chance(RULES.day.noticeHabit * tenorOf('watch'))) extra = `<p class="notice">${reveal(pick(ppl))}</p>`;
    if (here.length >= 2 && chance(RULES.day.overhear * rateOf('talk'))) extra += Gossip.speak('overheard', here);
  }
  // and now and then, whatever you were doing, something finds you; or, out on the tell, the dig itself hurts you
  const dread = dreadNow(S.loc);
  extra += dread + perilNow(S.loc, dread ? RULES.peril.afterHorror : 1);
  if (checkEnd()) return;
  S.phase = 'result';
  const last = S.slot >= S.slotsToday - 1;
  show({
    kicker: dayStamp(),
    title: title || bi('Afterwards', 'Потом'),
    body: [html + extra],
    choices: [{ label: last ? bi('Night falls', 'Опускается ночь') : bi('Continue', 'Дальше'), fn: advance }]
  });
}
function advance() {
  S.slot++;
  if (S.slot >= S.slotsToday) nightfall();
  else startSlot();
}

// ---------- searching, translating, resting, examining ----------
// One of the power's four signs, those not yet seen first, mostly; each told in a way not yet heard, while there is one. Now
// and then (PUZ.stray) a sign that is not the power's at all, of the others in play: a coincidence, told like any
// other, and never said to be one (the ending tells it); once seen, it may come again as any sign already seen may, so
// that a sign seen twice is no surer to be the power's own than one seen once. The log keeps each sign seen, once (si:
// which; i: which of the power's four, or stray); omenTold, the ways each was told (by i, or 's' and si for a stray).
function nextOmen() {
  emit('omen');
  const stray = Object.keys(S.signPair)
    .map(Number)
    .filter(si => !S.signsOf[S.patron].includes(si) && !S.omenLog.some(o => o.si === si));
  if (stray.length && chance(PUZ.stray)) {
    const si = pick(stray),
      v = pick(SIGN_POOL[si].texts.map((t, k) => k));
    S.omenLog.push({ day: S.day, si, v, stray: true });
    S.omenTold['s' + si] = [v];
    return SIGN_POOL[si].texts[v];
  }
  // of the power's own four, one not yet seen as a rule: one already seen, its own or a stray, weighs night.signAgain
  // against 1 (and with all four seen, every sign seen weighs alike)
  const unseen = [0, 1, 2, 3].filter(i => !S.omenSeen.includes(i)),
    again = unseen.length ? RULES.night.signAgain : 1,
    w = Object.fromEntries([0, 1, 2, 3].map(k => [k, unseen.includes(k) ? 1 : again]));
  S.omenLog.filter(o => o.stray).forEach(o => (w['s' + o.si] = again));
  const key = wpick(w),
    i = key[0] === 's' ? null : +key,
    sg = i == null ? SIGN_POOL[+key.slice(1)] : patronSign(i),
    heard = (S.omenTold[key] = S.omenTold[key] || []),
    ways = sg.texts.map((t, k) => k),
    fresh = ways.filter(k => !heard.includes(k)),
    v = pick(fresh.length ? fresh : ways);
  heard.push(v);
  if (i != null && !S.omenSeen.includes(i)) {
    S.omenSeen.push(i);
    S.omenLog.push({ day: S.day, i, si: S.signsOf[S.patron][i], v });
  }
  return sg.texts[v];
}
const omenP = t => `<p class="omen"><span class="dingir" aria-hidden="true">𒀭</span> ${bi(t)}</p>`;
function minorItem() {
  const a = MINOR.filter(x => !has(x));
  return a.length ? pick(a) : null;
}
// what you came by; a charm, turned over, shows its marks (world/powers.js), which are all the tablets know it by
const gained = it =>
  `<p class="gain">${bi(`Gained: ${ITEMS[it].name}`, `Получено: ${R(ITEMS[it].name)}`)}</p>` +
  (ITEMS[it].ward ? `<p class="dim">${bi(...marksSee(it))}</p>` : '');
// A charm hidden in a place turns up at search.charm each time the place is searched, so it may take another; besides,
// a place gives what it gives:
// fragments, signs, small finds, horrors or nothing, at its own odds, as often as it is searched (horrors as often as
// dread comes in the season's mood, up to twice as often: a horror warms it).
function doSearch(l) {
  S.act = 'search';
  S.log.search++;
  S.searched[l] = (S.searched[l] || 0) + 1;
  const hidden = charmsToFind().find(w => S.wardAt[w] === l),
    ward = hidden && chance(RULES.search.charm) ? hidden : null; // (it may take another search)
  let out = '';
  if (ward) {
    gain(ward);
    out = `<p>${bi(ITEMS[ward].find)}</p>` + gained(ward);
    journal(
      bi(
        `Found ${theItem(ward)} ${LOCS[l].at}.`,
        `${ru.Item(ward)} — ${ru.ig(ward, 'найден', 'найдена', 'найдено', 'найдены')} ${ru.loc(l, 'at')}.`
      )
    );
    if (chance(RULES.search.more)) out += searchFind(l, true); // the same hole often gives up more than one thing
  } else out = searchFind(l, false);
  endSlot(out, bi('Searching: ' + LOCS[l].name, 'Поиски: ' + ru.loc(l)));
}
// What a search gives besides a charm (more: what the same hole gives up after one, where nothing and horrors weigh
// search.moreOdd × theirs, and nothing more is no news).
function searchFind(l, more) {
  const weights = { ...LOCS[l].search };
  if (weights.horror) weights.horror *= Math.min(2, rateOf('dread'));
  if (more)
    ['none', 'horror'].forEach(k => {
      if (weights[k]) weights[k] *= RULES.search.moreOdd;
    });
  let kind = wpick(weights);
  if (more && kind === 'none') return '';
  const it = kind === 'item' ? minorItem() : null;
  if (kind === 'item' && !it) kind = 'frag';
  if (kind === 'frag') {
    const two = chance(RULES.search.twoFrags); // (now and then two pieces of the same tablet)
    S.fragments += two ? 2 : 1;
    let t;
    if (more) {
      const k = pick([0, 1]);
      t = bi(
        ['In the same hole lies a broken tablet, its signs still crisp.', 'Beside it, wrapped in rotten linen, is a fragment of tablet.'][
          k
        ],
        ['В той же яме лежит разбитая табличка, и знаки на ней всё ещё чёткие.', 'Рядом, в истлевшем полотне, — обломок таблички.'][k]
      );
    } else t = bi(tellOne('frag-' + (FRAG_FIND[l] ? l : 'any'), FRAG_FIND[l] || FRAG_FIND.any));
    if (two) t += ' ' + bi('Beside it lies a second piece of the same tablet.', 'Рядом лежит второй кусок той же таблички.');
    return `<p>${t}</p>${fragmentIn(two ? 2 : 1)}`;
  }
  if (kind === 'omen')
    return (
      `<p>${more ? bi('As you climb out, you see it.', 'Выбираясь из ямы, вы видите это.') : bi('You see it before you understand it.', 'Вы видите это прежде, чем понимаете.')}</p>` +
      omenP(nextOmen())
    );
  if (kind === 'item') {
    gain(it);
    return `<p>${bi(ITEMS[it].find)}</p>` + gained(it);
  }
  if (kind === 'horror') {
    S.log.horror++;
    const h = `<p class="horror">${bi(tellOne('horror-' + l, HORROR[l]))}</p>` + horrorCost(chance(RULES.search.horrorWorse) ? 2 : 1);
    stirred('dread', TENOR.stirs.horror);
    return h;
  }
  return `<p>${bi(tellOne('nothing', NOTHING))}</p>`;
}
function studyP() {
  return clamp(RULES.study.odds + (S.bg === 'philologist' ? RULES.study.philologist : 0));
}
// You choose what to look for in the clay: a sign you have seen, a charm you carry, an old title you have met. Every one
// of them, always, whether or not a line about it is left to find (if none is, the fragment says nothing about it): a
// list that dropped what was spent would tell how many lines the tablets hold about each, and a toy has fewer than a ward.
function studyTopics() {
  const t = [],
    seen = [];
  S.omenLog.forEach(o => {
    if (!seen.includes(o.si)) seen.push(o.si);
  });
  seen.forEach(si =>
    t.push({
      sign: si,
      label: bi(`Look for “${SIGN_POOL[si].short}”`, `Искать: «${R(SIGN_POOL[si].short)}»`),
      sub: bi('A sign you have seen', 'Знамение, которое вы видели')
    })
  );
  S.items
    .filter(w => CHARMS.includes(w))
    .forEach(w =>
      t.push({
        ward: w,
        label: bi(`Look for ${theItem(w)}`, `Искать ${ru.item(w, 'a')}`),
        sub: bi('A charm you carry. The scribes will not call it that', 'Амулет, который при вас. Писцы назовут его иначе')
      })
    );
  titlesMet().forEach(e =>
    t.push({
      title: e,
      label: bi(`Look for “${ttEn(e)}”`, `Искать: «${capS(ttRu(e))}»`),
      sub: bi('An old title you have met', 'Древний титул, который вам уже встречался')
    })
  );
  return t;
}
function studyPick() {
  const t = studyTopics();
  if (!t.length) {
    doStudy(null);
    return;
  }
  show({
    kicker: dayStamp(),
    title: bi('Translation', 'Перевод'),
    body: [`<p>${bi(...tellOne('read', SAY.read))}</p>`],
    choices: t
      .map(x => ({ label: x.label, sub: x.sub, fn: () => doStudy(x) }))
      .concat([
        {
          label: bi('Read it as it comes', 'Читать подряд'),
          sub: bi('Whatever the scribe chose to write', 'Что писец счёл нужным записать'),
          fn: () => doStudy(null)
        },
        {
          label: bi('Not now', 'Не сейчас'),
          cls: 'minor',
          fn: () => {
            backedDown();
            goTo('camp');
          }
        }
      ])
  });
}
function doStudy(topic) {
  let out;
  S.act = 'study';
  S.log.study++;
  if (chance(studyP())) {
    S.fragments--;
    const lines = [];
    const n = vary(PUZ.lines) + (S.bg === 'philologist' && chance(RULES.study.extraLine) ? 1 : 0); // each fragment is a short passage, of about four lines
    const hit = topic && chance(RULES.study.onTopic) ? learnFact(null, topic) : null;
    if (hit != null) {
      lines.push(hit);
      if (chance(RULES.study.secondOnTopic)) {
        const h2 = learnFact(null, topic);
        if (h2 != null) lines.push(h2);
      }
    }
    while (lines.length < n) {
      const l = learnFact();
      if (l == null) break;
      lines.push(l);
    }
    // (whether it spoke of what you were looking for, after all: lines drawn at large may well)
    const found = topic && lines.some(i => speaksOf(S.facts[i], topic));
    out =
      `<p>${bi(tellOne('studyOk', STUDY_OK))}</p>` +
      (topic
        ? `<p class="dim">${
            found
              ? bi('You find what you were looking for.', 'Вы находите то, что искали.')
              : lines.length
                ? bi(
                    'The fragment says nothing about it, but other lines come clear.',
                    'Об этом обломок молчит, зато проясняются другие строки.'
                  )
                : bi('The fragment says nothing about it.', 'Об этом обломок молчит.')
          }</p>`
        : '') +
      (lines.length
        ? lines.map(factP).join('') +
          `<p class="dim">${bi('Copied into your notebook, under Omens.', 'Переписано в записную книжку, во вкладку «Знамения».')}</p>`
        : `<p>${bi('Nothing you have not read before.', 'Ничего такого, чего вы не читали бы раньше.')}</p>`);
    // what it costs: the more you knew already, the likelier, and the worse
    const ST = RULES.study,
      known = S.factKnown.length - lines.length;
    if (chance(Math.min(ST.costMax, ST.cost + ST.costLine * known) * (S.bg === 'philologist' ? ST.costPhilologist : 1))) {
      const bad = chance(ST.worse + ST.worseLine * known);
      out += `<p>${bi(tellOne(bad ? 'studyCostBad' : 'studyCost', bad ? STUDY_COST_BAD : STUDY_COST))}</p>` + readingCost(bad ? 2 : 1);
    }
  } else {
    out = `<p>${bi(tellOne('studyFail', STUDY_FAIL))}</p>`;
    if (chance(RULES.study.failCost)) out += `<p>${bi(tellOne('studyFailCost', STUDY_FAIL_COST))}</p>` + readingCost(1);
    if (chance(RULES.study.crumble)) {
      S.fragments--;
      out += `<p class="loss">${bi('The fragment crumbles to powder in your hands.', 'Обломок рассыпается в пыль у вас в руках.')}</p>`;
    }
  }
  endSlot(out, bi('Translation', 'Перевод'));
}
function doRest() {
  S.act = 'rest';
  S.log.rest++;
  const g = regain(RULES.day.rest);
  endSlot(
    `<p>${bi('You lie on your camp bed with a wet cloth over your eyes until your hands stop shaking.', 'Вы лежите на походной кровати с мокрой тряпицей на глазах, пока руки не перестают дрожать.')}</p>${nerveNote(g)}`,
    bi('Rest', 'Отдых')
  );
}
function examineP() {
  return clamp(RULES.examine.odds + (S.bg === 'soldier' ? RULES.examine.soldier : 0));
}
const nightRu = d => (d === 0 ? 'В ночь гибели Крейна' : `Ночь ${d}`);
const nightEn = d => (d === 0 ? 'The night Crane died' : `Night ${d}`);
// Reading the scene: the attacker's trace, and another of the same person's beside it, unless the attacker was careful;
// a thief's, come to rob the place; someone's who had been there earlier; or an innocent's, laid there by the cult, and
// now and then the attacker's own beneath it. Now and then the ground misleads you (examine.misread): an older trace
// looks fresh, and anything of its owner's nearby looks the attacker's too; or the attacker's own looks older than it is.
function doExamine() {
  const cr = S.crime;
  cr.examined = true;
  S.act = 'examine';
  S.log.examine++;
  let out;
  if (chance(examineP())) {
    S.log.examineOk++;
    const src = cr.clue.source,
      misread = chance(RULES.examine.misread * (cr.more ? RULES.examine.misreadTwo : 1)), // (two side by side, seldom)
      read = misread
        ? src === 'cult'
          ? traceStray
          : traceGenuine
        : { cult: traceGenuine, plant: tracePlanted, stray: traceStray }[src] || traceThief;
    if (misread) cr.clue.misread = true;
    const found = read(cr, cr.clue);
    out = `<p>${bi(...tellOne('examine', [...EXAMINE_OK.map(t => [t, R(t)]), ...SAY.examine]))}</p>` + found;
  } else if (chance(RULES.examine.again)) {
    cr.examined = false; // (it keeps something for another look)
    out = `<p>${bi(
      'The light is wrong, and the ground will not read. There may be more to see another time.',
      'Свет не тот, и земля ничего не говорит. Возможно, в другой раз удастся разглядеть больше.'
    )}</p>`;
  } else out = `<p>${bi(tellOne('examineFail', EXAMINE_FAIL))}</p>`;
  endSlot(out, bi('The scene', 'Место нападения'));
}
// the attacker's own trace (both, if they were careless enough to leave two), and another of theirs nearby, unless
// they were careful (people/cunning.js); whatever turns up is dated to the night, not to the day you looked
function traceGenuine(cr, cl) {
  const two = !!cr.more;
  cl.status = 'genuine';
  if (two) cr.more.status = 'genuine';
  journal(
    two
      ? bi(
          `${nightEn(cl.day)}: both traces ${LOCS[cr.loc].at} were the attacker’s.`,
          `${nightRu(cl.day)}: оба следа ${R(LOCS[cr.loc].at)} оставил нападавший.`
        )
      : bi(
          `${nightEn(cl.day)}: the trace ${LOCS[cr.loc].at} was the attacker’s.`,
          `${nightRu(cl.day)}: след ${R(LOCS[cr.loc].at)} оставил нападавший.`
        )
  );
  const left = CATS.filter(k => k !== cl.cat && !(two && k === cr.more.cat)), // (one kind at least: there are three)
    c2 =
      tidy(C(cl.owner)) || !chance(RULES.examine.more)
        ? null
        : addClue({ owner: cl.owner, cat: pick(left), source: cl.source, extra: true, loc: cr.loc, status: 'genuine', day: cl.day });
  if (two)
    return c2
      ? bi(
          `<p>Both traces are genuine, and there is more: ${clueText(c2)}. All three belong to the same person.</p>`,
          `<p>Оба следа подлинные, и это не всё: ${clueTextRu(c2)}. Все три оставил один и тот же человек.</p>`
        )
      : bi(
          '<p>Both traces are genuine, and both belong to the same person. There is nothing else to find.</p>',
          '<p>Оба следа подлинные, и оставил их один и тот же человек. Больше здесь ничего нет.</p>'
        );
  return c2
    ? bi(
        `<p>The first trace is genuine, and there is more: ${clueText(c2)}. Both belong to the same person.</p>`,
        `<p>Первый след подлинный, и это не всё: ${clueTextRu(c2)}. Оба оставил один и тот же человек.</p>`
      )
    : bi(
        '<p>The trace is genuine. Whoever left it was careful, and left nothing else: not a thread, not a print, not a match.</p>',
        '<p>След подлинный. Тот, кто его оставил, был осторожен и больше ничего не оставил: ни нитки, ни отпечатка, ни спички.</p>'
      );
}
// an innocent's trace, laid there by the cult, and now and then the attacker's own beneath it
function tracePlanted(cr, cl) {
  cl.status = 'planted';
  journal(
    bi(
      `${nightEn(cl.day)}: the trace ${LOCS[cr.loc].at} was planted, to be found.`,
      `${nightRu(cl.day)}: след ${R(LOCS[cr.loc].at)} был подброшен, чтобы его нашли.`
    )
  );
  const under = chance(RULES.cunning.underneath)
    ? addClue({ owner: cl.by, cat: pick(CATS.filter(k => k !== cl.cat)), source: 'cult', loc: cr.loc, status: 'genuine', day: cl.day })
    : null;
  return (
    bi(
      `<p>Look again: ${clueText(cl)}. Nobody walked, or stood, or smoked there: the trace was put there on purpose, for you to find.</p>`,
      `<p>Присмотритесь ещё раз: ${clueTextRu(cl)}. Там никто не ходил, не стоял и не курил — след положили нарочно, чтобы вы его нашли.</p>`
    ) +
    (under
      ? bi(
          `<p>Beneath it, half scuffed away, is the real one: ${clueText(under)}.</p>`,
          `<p>Под ним, полустёртый, — настоящий: ${clueTextRu(under)}.</p>`
        )
      : '')
  );
}
// someone's who had been there earlier, by day, or that night by ill luck (or, the ground misleading you, the attacker's
// own, and then both of a careless attacker's two: they lie side by side)
function traceStray(cr, cl) {
  const two = !!cr.more;
  cl.status = 'stray';
  if (two) cr.more.status = 'stray';
  journal(
    two
      ? bi(
          `${nightEn(cl.day)}: someone had been ${LOCS[cr.loc].at} earlier. Neither trace was the attacker’s.`,
          `${nightRu(cl.day)}: кто-то побывал ${R(LOCS[cr.loc].at)} раньше. Оба следа оставил не нападавший.`
        )
      : bi(
          `${nightEn(cl.day)}: someone had been ${LOCS[cr.loc].at} earlier. That trace was not the attacker’s.`,
          `${nightRu(cl.day)}: кто-то побывал ${R(LOCS[cr.loc].at)} раньше. Этот след оставил не нападавший.`
        )
  );
  return `<p>${bi(two ? EXAMINE_STRAY_TWO : tellOne('examineStray', EXAMINE_STRAY))}</p>`;
}
// a thief's, come to rob the place
function traceThief(cr, cl) {
  cl.status = 'thief';
  journal(
    bi(
      `${nightEn(cl.day)}: a thief had been ${LOCS[cr.loc].at}. That trace was not the attacker’s.`,
      `${nightRu(cl.day)}: ${R(LOCS[cr.loc].at)} побывал вор. Этот след оставил не нападавший.`
    )
  );
  return `<p>${bi(tellOne('examineThief', EXAMINE_THIEF))}</p>`;
}
