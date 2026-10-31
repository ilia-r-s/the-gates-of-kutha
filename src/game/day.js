// game/day.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function placeChars() {
  S.here = {};
  LOC_IDS.forEach(l => {
    S.here[l] = [];
  });
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
    if (S.here[l].some(id => Ties.cannotBear(c.id, id)) && chance(RULES.company.avoid)) {
      delete w[l];
      l = wpick(w);
    } else {
      const fond = LOC_IDS.filter(at => S.here[at].some(id => Ties.close(c.id, id)));
      if (fond.length && chance(RULES.company.follow)) l = pick(fond);
    }
    S.here[l].push(c.id);
    c.loc = l;
    if (!S.visits || S.visits.day !== S.day) S.visits = { day: S.day, at: {} };
    const v = (S.visits.at[l] = S.visits.at[l] || []);
    if (!v.includes(c.id)) v.push(c.id);
  }
}
function startSlot() {
  placeChars();
  planScene();
}
function sceneMark(l) {
  const cr = S.crime,
    crane = S.day === 1;
  if (!cr || cr.loc !== l) return '';
  if (!cr.examined) return crane ? __text('whereCraneWasFound') : __text('sceneOfLastNightSAttack');
  if (cr.swept) return crane ? __text('whereCraneWasFoundSweptClean') : __text('sceneOfLastNightSAttack2');
  if (cr.bare) return crane ? __text('whereCraneWasFoundNothingTo') : __text('sceneOfLastNightSAttack3');
  return '';
}
function whoAt(l) {
  const ids = (S.here[l] || []).filter(id => isFree(C(id))),
    n = ids.map(c => C(c).short);
  return __text('nobody');
}
function planScene() {
  S.talkId = null;
  S.phase = 'plan';
  S.loc = null;
  const choices = LOC_IDS.map(l => ({
    label: bi(LOCS[l].name),
    sub: whoAt(l) + sceneMark(l) + (S.searched[l] ? searchedSay(S.searched[l]) : ''),
    fn: () => goTo(l)
  }));
  if (has('brandy'))
    choices.push({
      label: __text('drinkFromTheBrandyFlask'),
      sub: __text('steadiesYourNerveTakesNoTime'),
      cls: 'minor',
      fn: () => {
        useBrandy();
        planScene();
      }
    });
  show({ kicker: dayStamp(), title: __text('whereWillYouGo'), body: [bi(...TX.day.chooseAPlaceOn())], choices: choices });
}
const slotIntro = () => {
  if (!S.slot) return tenorDawn();
  const k = S.slot === 1 ? 'afternoon' : 'evening';
  return tellAt(k, [[SLOT_INTRO[S.slot], R(SLOT_INTRO[S.slot])], ...SAY[k]], S.day - 1);
};
function useBrandy() {
  if (!has('brandy')) return;
  lose('brandy');
  regain(RULES.day.brandy);
  Record.journal(__text('youDrankTheBrandy'));
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
  if (fresh) {
    told['at-' + l] = (told['at-' + l] || 0) + 1;
    if (!ppl.length) told.empty = (told.empty || 0) + 1;
  }
  const looks = tellAt('place-' + l, [...L.desc.map(d => [d, R(d)]), ...SAY.places[l]], (told['at-' + l] || 1) - 1),
    nobody = tellAt('nobody', SAY.nobody, (told.empty || 1) - 1);
  const body = [`<p>${bi(...looks)}</p>`, `<p class="dim">${ppl.length ? bi(...TX.day.here(ppl)) : bi(...nobody)}</p>`];
  const ch = [];
  const crimeHere = S.crime && S.crime.loc === l && !S.crime.examined;
  if (crimeHere) {
    const cl = S.crime.clue,
      more = S.crime.more;
    body.push(more ? bi(...TX.day.andBesideIt(cl, more)) : bi(...TX.day.whereCraneWasFound(cl)));
    ch.push({ label: __text('examineTheScene'), sub: bi(...TX.day.readTheGroundBefore()), fn: doExamine });
  } else if (S.crime && S.crime.loc === l && (S.crime.swept || S.crime.bare))
    body.push(bi(...(S.crime.swept ? TX.day.sceneSweptHere(S.day === 1) : TX.day.sceneEmptyHere(S.day === 1))));
  if (L.search)
    ch.push({
      label: __text('searchTheArea'),
      sub: bi(...TX.day.tabletsSignsObjectsAnd()) + (S.searched[l] ? searchedSay(S.searched[l]) : ''),
      fn: () => doSearch(l)
    });
  ppl.forEach(c => ch.push({ label: __text('speakWithI'), sub: bi(c.job, ru.ch(c).job), fn: () => talk(c.id) }));
  if (l === 'camp') campActs(body, ch);
  ch.push({ label: __text('goSomewhereElse'), cls: 'minor', fn: planScene });
  show({ kicker: dayStamp(), title: bi(L.name), body: body, choices: ch });
}
function campActs(body, ch) {
  if (S.fragments > 0) ch.push({ label: __text('translateATabletFragment'), sub: __text('waiting'), fn: studyPick });
  ch.push({ label: __text('restInYourTent'), sub: __text('steadiesYourNerve'), fn: doRest });
  if (S.walkout) body.push(`<p class="dim">${__text('theCampWillHoldNoMore')}</p>`);
  else if (atEvening() && !S.inquiryDone && freeChars().length)
    ch.push({
      label: __text('conveneAnInquiry'),
      sub: __text('accuseSomeoneBeforeTheWholeCamp'),
      cls: 'danger',
      fn: inquiryScene
    });
  if (deedOffered())
    ch.push({ label: __text('settleItYourselfTonight'), sub: __text('thereIsOnlyOneWayTo'), cls: 'danger', fn: deedScene });
  if (S.slot < eveningSlot() && !S.walkout && (S.slotsToday <= RULES.start.shortSlots || !S.inquiries.length))
    body.push(
      S.slotsToday > RULES.start.shortSlots
        ? `<p class="dim">${bi(...TX.day.inquiriesCanBeHeld())}</p>`
        : `<p class="dim">${bi(...TX.day.theDayEndsEarly())}</p>`
    );
}
function endSlot(html, title) {
  S.act = null;
  let extra = '';
  if (S.loc) {
    const here = (S.here[S.loc] || []).map(C).filter(isFree),
      ppl = here.filter(c => unknownCats(c).length);
    if (ppl.length && chance(RULES.day.noticeHabit * tenorOf('watch'))) extra = `<p class="notice">${reveal(pick(ppl))}</p>`;
    if (here.length >= 2 && chance(RULES.day.overhear * rateOf('talk'))) extra += Gossip.speak('overheard', here);
  }
  const dread = dreadNow(S.loc);
  extra += dread + perilNow(S.loc, dread ? RULES.peril.afterHorror : 1);
  if (checkEnd()) return;
  S.phase = 'result';
  const last = S.slot >= S.slotsToday - 1;
  show({
    kicker: dayStamp(),
    title: title || __text('afterwards'),
    body: [html + extra],
    choices: [{ label: last ? __text('nightFalls') : __text('continue'), fn: advance }]
  });
}
function advance() {
  S.slot++;
  if (S.slot >= S.slotsToday) nightfall();
  else startSlot();
}
function nextOmen() {
  emit('omen');
  const stray = Object.keys(S.signPair)
    .map(Number)
    .filter(si => !S.signsOf[S.patron].includes(si) && !S.omenLog.some(o => o.si === si));
  if (stray.length && chance(PUZ.stray)) {
    const si = pick(stray),
      v = sayPick(SIGN_POOL[si].texts.map((t, k) => k));
    S.omenLog.push({ day: S.day, si: si, v: v, stray: true });
    S.omenTold['s' + si] = [v];
    return SIGN_POOL[si].texts[v];
  }
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
    v = sayPick(fresh.length ? fresh : ways);
  heard.push(v);
  if (i != null && !S.omenSeen.includes(i)) {
    S.omenSeen.push(i);
    S.omenLog.push({ day: S.day, i: i, si: S.signsOf[S.patron][i], v: v });
  }
  return sg.texts[v];
}
const omenP = t => `<p class="omen"><span class="dingir" aria-hidden="true">𒀭</span> ${bi(t)}</p>`;
function minorItem() {
  const a = MINOR.filter(x => !has(x));
  return a.length ? pick(a) : null;
}
const gained = it => `<p class="gain">${__text('gained')}</p>` + (ITEMS[it].ward ? `<p class="dim">${bi(...marksSee(it))}</p>` : '');
function doSearch(l) {
  S.act = 'search';
  S.log.search++;
  Suspicion.sawYou('search', l);
  S.searched[l] = (S.searched[l] || 0) + 1;
  const hidden = charmsToFind().find(w => S.wardAt[w] === l),
    ward = hidden && chance(RULES.search.charm) ? hidden : null;
  let out = '';
  if (ward) {
    gain(ward);
    Suspicion.sawYou('charm', l);
    out = `<p>${bi(ITEMS[ward].find)}</p>` + gained(ward);
    Record.journal(__text('foundAt'));
    if (chance(RULES.search.more)) out += searchFind(l, true);
  } else out = searchFind(l, false);
  endSlot(out, __text('searching'));
}
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
    const two = chance(RULES.search.twoFrags);
    S.fragments += two ? 2 : 1;
    let t;
    if (more) {
      const k = sayPick([0, 1]);
      t = bi(...TX.day.inTheSameHole(k));
    } else t = bi(tellOne('frag-' + (FRAG_FIND[l] ? l : 'any'), FRAG_FIND[l] || FRAG_FIND.any));
    if (two) t += ' ' + bi(...TX.day.besideItLiesA());
    return `<p>${t}</p>${fragmentIn(two ? 2 : 1)}`;
  }
  if (kind === 'omen') return `<p>${more ? __text('asYouClimbOutYouSee') : __text('youSeeItBeforeYouUnderstand')}</p>` + omenP(nextOmen());
  if (kind === 'item') {
    gain(it);
    return `<p>${bi(ITEMS[it].find)}</p>` + gained(it);
  }
  if (kind === 'horror') {
    S.log.horror++;
    const h =
      `<p class="horror">${bi(tellOne('horror-' + l, HORROR[l]))}</p>` +
      horrorCost(chance(RULES.search.horrorWorse) ? RULES.harm.horrorHeavy : RULES.harm.horror);
    stirred('dread', TENOR.stirs.horror);
    return h;
  }
  return `<p>${bi(tellOne('nothing', NOTHING))}</p>`;
}
function studyP() {
  return clamp(RULES.study.odds + (S.bg === 'philologist' ? RULES.study.philologist : 0));
}
function studyTopics() {
  const t = [],
    seen = [];
  S.omenLog.forEach(o => {
    if (!seen.includes(o.si)) seen.push(o.si);
  });
  seen.forEach(si => t.push({ sign: si, label: __text('lookFor'), sub: __text('aSignYouHaveSeen') }));
  S.items.filter(w => CHARMS.includes(w)).forEach(w => t.push({ ward: w, label: __text('lookForA'), sub: bi(...TX.day.aCharmYouCarry()) }));
  titlesMet().forEach(e => t.push({ title: e, label: __text('lookFor2'), sub: __text('anOldTitleYouHaveMet') }));
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
    title: __text('translation'),
    body: [`<p>${bi(...tellOne('read', SAY.read))}</p>`],
    choices: t
      .map(x => ({ label: x.label, sub: x.sub, fn: () => doStudy(x) }))
      .concat([
        { label: __text('readItAsItComes'), sub: __text('whateverTheScribeChoseToWrite'), fn: () => doStudy(null) },
        {
          label: __text('notNow'),
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
  Suspicion.sawYou('study', S.loc);
  if (chance(studyP())) {
    S.fragments--;
    const lines = [];
    const n = vary(PUZ.lines) + (S.bg === 'philologist' && chance(RULES.study.extraLine) ? 1 : 0);
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
    const found = topic && lines.some(i => speaksOf(S.facts[i], topic));
    out =
      `<p>${bi(tellOne('studyOk', STUDY_OK))}</p>` +
      (topic
        ? `<p class="dim">${found ? __text('youFindWhatYouWereLooking') : lines.length ? bi(...TX.day.theFragmentSaysNothing()) : __text('theFragmentSaysNothingAboutIt')}</p>`
        : '') +
      (lines.length
        ? lines.map(factP).join('') + `<p class="dim">${bi(...TX.day.copiedIntoYourNotebook())}</p>`
        : `<p>${__text('nothingYouHaveNotReadBefore')}</p>`);
    const ST = RULES.study,
      known = S.factKnown.length - lines.length;
    if (chance(Math.min(ST.costMax, ST.cost + ST.costLine * known) * (S.bg === 'philologist' ? ST.costPhilologist : 1))) {
      const bad = chance(ST.worse + ST.worseLine * known);
      out += __text('studycostbadStudyCostPP') + readingCost(bad ? RULES.harm.readingHeavy : RULES.harm.reading);
    }
  } else {
    out = `<p>${bi(tellOne('studyFail', STUDY_FAIL))}</p>`;
    if (chance(RULES.study.failCost)) out += `<p>${bi(tellOne('studyFailCost', STUDY_FAIL_COST))}</p>` + readingCost(RULES.harm.reading);
    if (chance(RULES.study.crumble)) {
      S.fragments--;
      out += `<p class="loss">${bi(...TX.day.theFragmentCrumblesTo())}</p>`;
    }
  }
  endSlot(out, __text('translation2'));
}
function doRest() {
  S.act = 'rest';
  S.log.rest++;
  Suspicion.sawYou('rest', S.loc);
  const g = regain(RULES.day.rest);
  endSlot(`<p>${bi(...TX.day.youLieOnYour())}</p>${nerveNote(g)}`, __text('rest'));
}
function examineP() {
  return clamp(RULES.examine.odds + (S.bg === 'soldier' ? RULES.examine.soldier : 0));
}
const nightRu = d => (d === 0 ? __text('text') : __text('text2'));
const nightEn = d => (d === 0 ? 'The night Crane died' : `Night ${d}`);
function doExamine() {
  const cr = S.crime;
  cr.examined = true;
  S.act = 'examine';
  S.log.examine++;
  Suspicion.sawYou('examine', S.loc);
  let out;
  if (chance(examineP())) {
    S.log.examineOk++;
    const src = cr.clue.source,
      misread = chance(RULES.examine.misread * (cr.more ? RULES.examine.misreadTwo : 1)),
      read = misread
        ? src === 'cult'
          ? traceStray
          : traceGenuine
        : { cult: traceGenuine, plant: tracePlanted, stray: traceStray }[src] || traceThief;
    if (misread) cr.clue.misread = true;
    const found = read(cr, cr.clue);
    out = `<p>${bi(...tellOne('examine', [...EXAMINE_OK.map(t => [t, R(t)]), ...SAY.examine]))}</p>` + found;
  } else if (chance(RULES.examine.again)) {
    cr.examined = false;
    out = `<p>${bi(...TX.day.theLightIsWrong())}</p>`;
  } else out = `<p>${bi(tellOne('examineFail', EXAMINE_FAIL))}</p>`;
  endSlot(out, __text('theScene'));
}
function traceGenuine(cr, cl) {
  const two = !!cr.more;
  cl.status = 'genuine';
  if (two) cr.more.status = 'genuine';
  Record.journal(two ? bi(...TX.day.bothTracesWereThe(cl, cr)) : bi(...TX.day.theTraceWasThe(cl, cr)));
  const left = CATS.filter(k => k !== cl.cat && !(two && k === cr.more.cat)),
    c2 =
      tidy(C(cl.owner)) || !chance(RULES.examine.more)
        ? null
        : Record.addTrace({
            owner: cl.owner,
            cat: pick(left),
            source: cl.source,
            extra: true,
            loc: cr.loc,
            status: 'genuine',
            day: cl.day
          });
  if (two) return c2 ? bi(...TX.day.bothTracesAreGenuine(c2)) : bi(...TX.day.bothTracesAreGenuine2());
  return c2 ? bi(...TX.day.theFirstTraceIs(c2)) : bi(...TX.day.theTraceIsGenuine());
}
function tracePlanted(cr, cl) {
  cl.status = 'planted';
  if (cr.more) cr.more.status = 'planted';
  Record.journal(bi(...TX.day.theTraceWasPlanted(cl, cr)));
  const under = chance(RULES.cunning.underneath)
    ? Record.addTrace({
        owner: cl.by,
        cat: pick(CATS.filter(k => k !== cl.cat)),
        source: 'cult',
        loc: cr.loc,
        status: 'genuine',
        under: true,
        day: cl.day
      })
    : null;
  return (
    bi(...(cr.more ? TX.day.lookAgainBothPlanted(cl, cr.more) : TX.day.lookAgainNobodyWalked(cl))) +
    (under ? bi(...TX.day.beneathItHalfScuffed(under)) : '')
  );
}
function traceStray(cr, cl) {
  const two = !!cr.more;
  cl.status = 'stray';
  if (two) cr.more.status = 'stray';
  Record.journal(two ? bi(...TX.day.someoneHadBeenEarlier(cl, cr)) : bi(...TX.day.someoneHadBeenEarlier2(cl, cr)));
  return `<p>${bi(two ? EXAMINE_STRAY_TWO : tellOne('examineStray', EXAMINE_STRAY))}</p>`;
}
function traceThief(cr, cl) {
  cl.status = 'thief';
  if (cr.more) cr.more.status = 'thief';
  Record.journal(bi(...TX.day.aThiefHadBeen(cl, cr)));
  return cr.more ? bi(...TX.day.bothAThiefs()) : `<p>${bi(tellOne('examineThief', EXAMINE_THIEF))}</p>`;
}
