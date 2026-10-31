// ui/book.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const bare = () => !!(S && S.hardcore);
function renderBook() {
  document.querySelectorAll('.tab').forEach(t => {
    const on = t.dataset.tab === S_ui.tab;
    t.setAttribute('aria-selected', on);
    t.classList.toggle('on', on);
  });
  const p = $('#tabPanel');
  if (!S) {
    draw(p, X(`<p class="dim pad">${bi(...TX.book.yourCasebookFillsAs())}</p>`));
    return;
  }
  draw(p, X({ people: bookPeople, evidence: bookEvidence, omens: bookOmens, kit: bookKit }[S_ui.tab]()));
}
const TRUST_SAY = __text('TRUST_SAY');
function trustWord(c) {
  const r = Ties.trust(c);
  return `<span class="${r < 0 ? 'bad' : r >= 2 ? 'good' : r === 0 ? 'dim' : ''}">${bi(...TRUST_SAY[r])}</span>`;
}
const MARKS = __text('MARKS');
const PLACE_SHORT = __text('PLACE_SHORT');
const PLACE_RU = __text('PLACE_RU');
const nightLabel = n => (n === 0 ? __text('theNightCraneDied') : __text('night'));
const dayLabel = d => __text('day');
function chipsAbout(id) {
  const a = C(id);
  return S.testimony
    .filter(t => t.about === id && Record.kind(t.kind))
    .map(t => Record.kind(t.kind).chip(t, a, S.chars[t.from] ? C(t.from).short : '', t.from))
    .filter(Boolean)
    .map(([cls, words]) => `<span class="chip${cls ? ' ' + cls : ''}">${words}</span>`)
    .join('');
}
function campChips(c) {
  const by = Suspicion.suspectedBy(c.id),
    cr = Suspicion.credit(c.id);
  return (
    (by.length && isFree(c) ? `<span class="chip warnc">${__text('suspectedBy')}</span>` : '') +
    (cr > 0
      ? `<span class="chip good">${__text('provenRightBeforeTheCamp')}</span>`
      : cr < 0
        ? `<span class="chip bad">${__text('provenWrongBeforeTheCamp')}</span>`
        : '')
  );
}
function rumorLine(r) {
  const what = Gossip.told(r);
  const eff = [r.down.length ? __text('cooler') : '', r.up.length ? __text('warmer') : ''].filter(Boolean).join('; ');
  return what + (eff ? ` <span class="dim">(${eff})</span>` : '');
}
function bookPeople() {
  return castOrder(S.order)
    .map(C)
    .map(c => {
      const st = c.status === 'present' ? '' : `<div class="p-status">${statusText(c)}</div>`;
      const tr = CATS.map(k => {
        if (!c.known[k]) return `<span class="tr unk"><em>${bi(TRAITS[k].label)}</em> ?</span>`;
        const all = S.clues.filter(cl => cl.cat === k && cl.val === c.known[k]),
          tent = all.filter(cl => cl.source === 'spite'),
          hits = all.filter(cl => cl.source !== 'spite'),
          real = hits.filter(cl => !Record.ruledOut(cl));
        const cls = bare() ? '' : real.length ? ' hit' : hits.length || tent.length ? ' thiefhit' : '',
          where = (real.length ? real : hits).map(cl => `${nightLabel(cl.day)}, ${bi(LOCS[cl.loc].name)}`).join('; '),
          why =
            real.length || !hits.length
              ? ''
              : Record.status(
                  hits.some(cl => cl.status === 'planted') ? 'planted' : hits.some(cl => cl.status === 'stray') ? 'stray' : 'thief'
                ).why(),
          title = [
            where ? __text('alsoFoundAtAScene') + where + why : '',
            tent.length ? __text('foundByYourTentPole') + tent.map(cl => nightLabel(cl.day)).join('; ') : ''
          ]
            .filter(Boolean)
            .join('. ');
        return `<span class="tr${cls}"${title && !bare() ? ` title="${title}"` : ''}><em>${bi(TRAITS[k].label)}</em> <span class="tv">${bi(TRAITS[k].vals[c.known[k]].name)}</span></span>`;
      }).join('');
      return `<div class="person s-${c.status}"><div class="p-head"><svg class="ava" viewBox="46 30 108 108" aria-hidden="true">${portrait(c.id, 'neutral', 0, `book-${c.id}-`)}</svg><div class="p-id"><div class="p-name">${bi(c.name, capS(ru.cf(c)))}${roleBadge(c)}</div><div class="p-job">${bi(c.job, ru.ch(c).job)} · <span class="trust">${__text('trust')} ${trustWord(c)}</span></div></div>\n      <button type="button" class="mark m-${c.mark === '?' ? 'none' : c.mark}" data-mark="${c.id}" aria-label="${bi(...TX.book.yourMarkForClick(c))}">${bi(MARKS[c.mark], ruMark(c))}</button></div>\n      ${st}<div class="p-traits">${tr}</div><div class="p-chips">${bare() ? '' : campChips(c) + chipsAbout(c.id)}</div></div>`;
    })
    .join('');
}
function bookEvidence() {
  return [evTraces, evWhereabouts, evSightings, evClaims, evTestimony, evNoticed, evSayings, evRumours, evInquiries, evCamp, evJournal]
    .map(section => section())
    .join('');
}
function evNoticed() {
  if (!bare()) return '';
  const seen = S.testimony.filter(t => (Record.kind(t.kind) || {}).noticed && S.chars[t.about]);
  return seen.length
    ? `<h4>${__text('whatYouNoticed')}</h4><ul class="tlog">${seen
        .slice()
        .reverse()
        .map(t => `<li><span class="c-day">${dayLabel(t.day)}</span> ${Record.kind(t.kind).noticed(t, C(t.about))}</li>`)
        .join('')}</ul>`
    : '';
}
function evTraces() {
  let h = `<h4>${__text('traces')}</h4>`;
  const empty = (S.nights || []).map((rec, n) => (rec && rec.scene ? { n: n, ...rec.scene } : null)).filter(Boolean);
  if (!S.clues.length && !empty.length) h += `<p class="dim">${bi(...TX.book.anAttackInThe())}</p>`;
  const emptyCard = sc =>
    `<div class="clue"><div class="c-top"><span class="c-day">${nightLabel(sc.n)} · ${bi(LOCS[sc.loc].name)}</span><span class="chip dimc">${sc.how === 'swept' ? __text('sweptClean') : __text('noTrace')}</span></div><div class="c-trace dim">${bi(...(sc.how === 'swept' ? TX.book.sweptScene() : TX.book.emptyScene()))}</div></div>`;
  const scenes = [];
  S.clues.forEach((cl, i) => {
    const tent = cl.source === 'spite',
      sc = !bare() && !tent && scenes.find(x => !x.tent && x.day === cl.day && x.loc === cl.loc);
    if (sc) {
      sc.cls.push(cl);
      sc.i = i;
    } else scenes.push({ day: cl.day, loc: cl.loc, tent: tent, i: i, cls: [cl] });
  });
  h += [...scenes, ...empty.map(sc => ({ day: sc.n, i: -1, sc: sc }))]
    .sort((a, b) => b.day - a.day || b.i - a.i)
    .map(sc => (sc.sc ? emptyCard(sc.sc) : sceneCard(sc)))
    .join('');
  return h;
}
const traceChip = cl => (cl.source === 'spite' ? '' : (Record.status(cl.status) || Record.status('unverified')).chip());
function sceneCard(sc) {
  const one = sc.cls.length === 1,
    where = sc.tent ? __text('byYourTentPole') : bi(LOCS[sc.loc].name);
  return `<div class="clue"><div class="c-top"><span class="c-day">${nightLabel(sc.day)} · ${where}</span>${one ? traceChip(sc.cls[0]) : ''}</div>${sc.cls.map(cl => `<div class="c-tr"><span class="c-trace">${bi(TRAITS[cl.cat].vals[cl.val].clue)}</span>${one ? '' : `<span class="c-acts">${traceChip(cl)}</span>`}</div>` + (bare() ? '' : `<div class="c-fit">${habitFits(cl.cat, cl.val)}</div>${sameHabit(cl)}`)).join('')}</div>`;
}
function sameHabit(cl) {
  const same = S.clues.filter(o => o !== cl && o.cat === cl.cat && o.val === cl.val);
  return same.length ? `<div class="c-fit c-same">${bi(...TX.book.theSameHabitAs(same))}</div>` : '';
}
function habitFits(cat, val) {
  const pool = castOrder(S.order).map(C),
    nm = c => (c.status === 'taken' ? __text('dead') : bi(c.short, ru.c(c))),
    fits = pool.filter(c => c.known[cat] === val),
    unk = pool.filter(c => !c.known[cat]);
  return `<span>${__text('fits')}</span> ${fits.length ? fits.map(nm).join(', ') : `<span class="dim">${__text('noOneYouKnowOf')}</span>`}${unk.length ? ` <span class="dim">${__text('unchecked')}${unk.map(nm).join(', ')}</span>` : ''}`;
}
function evWhereabouts() {
  let h = '';
  const nights = [...new Set(S.claims.map(x => x.night))].sort((a, b) => b - a);
  h +=
    `<h4>${__text('whereabouts')}</h4>` +
    (nights.length
      ? nights
          .map(
            n =>
              `<div class="wn"><div class="c-day">${nightLabel(n)}</div><ul class="tlog">${S.claims
                .filter(x => x.night === n)
                .map(x => `<li><b>${bi(C(x.id).short, ru.c(x.id))}</b>: ${whereabouts(x)}</li>`)
                .join('')}</ul>${beliedOn(n)}</div>`
          )
          .join('')
      : `<p class="dim">${bi(...TX.book.askPeopleWhereThey())}</p>`);
  return h;
}
function whereabouts(x) {
  if (x.attacked) return __text('attackedAt');
  if (x.loc === 'evade') return __text('wouldNotSay');
  const there = !bare() && Record.wasThere(x);
  return bi(...TX.book.with(x, there));
}
function beliedOn(n) {
  if (bare()) return '';
  return castOrder(S.order)
    .map(C)
    .flatMap(x =>
      Record.belied(x)
        .filter(cl => cl.night === n)
        .map(cl => [x, C(cl.with)])
    )
    .map(([x, p]) => `<p class="warn">${bi(...TX.book.saysWasWithSays(x, p))}</p>`)
    .join('');
}
function sightFits(x) {
  if (bare()) return '';
  const fits = castOrder(S.order)
    .map(C)
    .filter(c => c.id !== x.id && c.known[x.cat] === x.val);
  return fits.length ? ` <span class="dim">${bi(...TX.book.fits(fits))}</span>` : '';
}
const sightWhere = x =>
  x.where !== 'camp'
    ? __text('nearGen')
    : x.to === 'tents'
      ? __text('aboutTheTents')
      : x.to && S.chars[x.to]
        ? __text('nearSTentG')
        : __text('nearYourTent');
function evSightings() {
  let h = '';
  if (S.sights.length)
    h +=
      `<h4>${__text('sightings')}</h4><ul class="tlog">` +
      S.sights
        .slice()
        .reverse()
        .map(x => {
          const [at, atRu] = sightWhere(x);
          return `<li><span class="c-day">${nightLabel(x.night)}</span> ${bi(...TX.book.passedSomeone(x, at, atRu))}${sightFits(x)}</li>`;
        })
        .join('') +
      '</ul>';
  return h;
}
function evClaims() {
  let h = '';
  const since = c => {
    const cl = claimOf(c);
    return cl.recanted != null && cl.claimed !== false ? cl.recanted : cl.said;
  };
  const said = castOrder(S.order)
    .map(C)
    .filter(c => claimOf(c).said != null)
    .sort((x, y) => since(x) - since(y));
  const claimPhrase = c => {
    const r = claimOf(c).role;
    return r === 'seer'
      ? __text('saysDreamsTrue')
      : r === 'warden'
        ? __text('saysKeepsWatchAtNight')
        : r === 'evade'
          ? bi(...TX.book.willNotSayWhat(c))
          : __text('saysHasNoPartInThe');
  };
  const backPhrase = c => {
    const cl = claimOf(c),
      d = cl.said;
    if (cl.recanted == null || cl.claimed === false) return '';
    return ` <span class="dim">${cl.how === 'confess' || cl.how === 'public' ? bi(...TX.book.saidOtherwiseOnDay(d, c)) : bi(...TX.book.saidOtherwiseOnDay2(d, c))}</span>`;
  };
  h +=
    `<h4>${__text('claims')}</h4>` +
    (said.length
      ? `<ul class="tlog">${said.map(c => `<li><span class="c-day">${dayLabel(since(c))}</span> <b>${bi(c.short, ru.c(c))}</b> ${claimPhrase(c)}${backPhrase(c)}</li>`).join('')}</ul>`
      : `<p class="dim">${bi(...TX.book.askPeopleAboutCrane())}</p>`);
  __text('seerDreamTrueOneDreamerWarden').forEach(([r, en, rs, one, oneRu]) => {
    const who = said.filter(c => claimOf(c).role === r && isFree(c));
    if (who.length > 1 && !bare()) h += `<p class="warn">${bi(...TX.book.sayTheyCraneDiary(who, en, one, rs, oneRu))}</p>`;
  });
  return h;
}
function evTestimony() {
  let h = '';
  const ts = S.testimony.filter(t => (Record.kind(t.kind) || {}).testimony),
    fits = t => {
      const K = Record.kind(t.kind),
        hb = !bare() && K.habit && K.habit(t);
      return hb ? `<div class="c-fit">${habitFits(hb.cat, hb.val)}</div>` : '';
    };
  h +=
    `<h4>${__text('testimony')}</h4>` +
    (ts.length
      ? `<ul class="tlog">${ts
          .slice()
          .reverse()
          .map(t => `<li><span class="c-day">${dayLabel(t.day)}</span> ${Record.kind(t.kind).testimony(t)}${fits(t)}</li>`)
          .join('')}</ul>`
      : `<p class="dim">${bi(...TX.book.askPeopleWhomThey())}</p>`);
  return h;
}
function evSayings() {
  let h = '';
  const says = S.testimony.filter(t => (Record.kind(t.kind) || {}).saying);
  if (says.length)
    h += `<h4>${__text('whatPeopleSayOfEachOther')}</h4><p class="dim rk-rules">${bi(...TX.book.gossipIsOnlyAs())}</p><ul class="tlog">${says
      .slice()
      .reverse()
      .map(t => `<li><span class="c-day">${dayLabel(t.day)}</span> ${Record.kind(t.kind).saying(t)}</li>`)
      .join('')}</ul>`;
  return h;
}
function evRumours() {
  let h = '';
  if (Gossip.record().length)
    h += `<h4>${__text('whatIsSaidOfYou')}</h4><ul class="tlog">${Gossip.record()
      .slice()
      .reverse()
      .map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${rumorLine(r)}</li>`)
      .join('')}</ul>`;
  return h;
}
function evInquiries() {
  const q = S.inquiries || [];
  if (!q.length) return '';
  const names = (ids, none) => (ids.length ? bi(nameList(ids), nameListRu(ids)) : none);
  const lines = q
    .slice()
    .reverse()
    .map(v => {
      const x = C(v.id),
        what = !v.passed ? __text('theCampRefused') : x.status === 'exposed' ? __text('unmasked') : __text('sentAway');
      return `<li><span class="c-day">${dayLabel(v.day)}</span> ${bi(`${x.short}:`, `${ru.c(x)}:`)} ${what}. <span class="dim">${__text('withYou')}: ${names(v.back, __text('nobody'))}; ${__text('against')}: ${names(v.against, __text('nobody2'))}${v.silent.length ? `; ${__text('silent')}: ${names(v.silent, '')}` : ''}.</span></li>`;
    })
    .join('');
  return `<h4>${__text('inquiries')}</h4><ul class="tlog">${lines}</ul>${S.walkout ? `<p class="dim">${bi(...TX.book.sinceDayTheCamp())}</p>` : ''}`;
}
function stirLine(r) {
  const [en, rus] = Moments.told(r);
  const eff = r.moved
    .map(([what, whom, d, ids, lvl]) => {
      if (what === 'trust') return d < 0 ? __text('coolerTowardsYou') : __text('warmerTowardsYou');
      const said = Moments.movedSaid(what, ids, whom, d, lvl);
      return bi(`${nameList(ids)} ${said[0]}`, `${nameListRu(ids)} ${said[1]}`);
    })
    .concat(r.after ? [r.after] : [])
    .join('; ');
  return bi(en, rus) + (eff ? ` <span class="dim">(${eff})</span>` : '');
}
function evCamp() {
  const seen = Moments.record().filter(r => r.moved.length || r.after || r.spoke);
  if (!seen.length) return '';
  return `<h4>${__text('whatTheCampMakesOfIt')}</h4><p class="dim rk-rules">${bi(...TX.book.whatHappensBeforeEveryone())}</p><ul class="tlog">${seen
    .slice()
    .reverse()
    .map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${stirLine(r)}</li>`)
    .join('')}</ul>`;
}
function evJournal() {
  let h = '';
  if (S.journal.length)
    h += `<h4>${__text('journal')}</h4><ul class="tlog">${S.journal
      .slice()
      .reverse()
      .map(j => `<li><span class="c-day">${dayLabel(j.day)}</span> ${j.t}</li>`)
      .join('')}</ul>`;
  return h;
}
const ROLE_SEEN = { cult: 'Cultist', smuggler: 'Smuggler', warden: 'Watcher', innocent: 'Not a cultist' };
function roleBadge(c) {
  const r = c.status === 'exposed' ? 'cult' : S.revealed && S.revealed[c.id];
  return r ? `<span class="rolebadge rb-${r}">${bi(ROLE_SEEN[r], RU_SEEN[r][ru.f(c) ? 1 : 0])}</span>` : '';
}
const GM_SAY = ['unmarked', 'ruled in', 'ruled out'],
  GM_SAY_RU = __text('text');
function gmToggle(key, label, aria) {
  const v = S.gm[key] || 0;
  return `<button type="button" class="gm${v ? ' on' : ''}" data-gm="${key}" data-toggle="1" aria-pressed="${v ? 'true' : 'false'}" aria-label="${aria}">${v ? '✓ ' : ''}${label}</button>`;
}
function gmChip(key, label, aria) {
  const v = S.gm[key] || 0;
  return `<button type="button" class="gm${v === 1 ? ' on' : v === 2 ? ' off' : ''}" data-gm="${key}" aria-label="${aria}: ${bi(GM_SAY[v], GM_SAY_RU[v])}. ${__text('clickToChange')}">${v === 1 ? '✓ ' : ''}${label}</button>`;
}
function gmRow(lab, key, { none: none = false, tag: tag = '', extra: extra = '' } = {}) {
  const opts =
    S.gods.map(g => gmChip(`${key}:${g}`, bi(GODS[g].name), `${lab}, ${bi(GODS[g].name)}`)).join('') +
    (none ? gmChip(`${key}:none`, __text('nothing'), `${lab}, ${__text('bindsNothing')}`) : '') +
    extra;
  return `<div class="rk-row"><div class="rk-lab">${lab}${tag ? ` <span class="rk-tag">${tag}</span>` : ''}</div><div class="rk-opts">${opts}</div></div>`;
}
function bookOmens() {
  const seen = S.omenLog.map(o => ({ si: o.si, day: o.day, v: o.v || 0 }));
  const known = S.factKnown.map(i => S.facts[i]),
    reads = Object.values(S.readings);
  const fsigns = [...new Set(known.filter(f => f.sign != null).map(f => f.sign))],
    titles = titlesMet();
  const arts = S.charms.filter(w => has(w) || S.log.charms.includes(w) || reads.some(r => r.w === w));
  let h = `<h4>${__text('yourReckoning')}</h4><div class="reck">`;
  h += gmRow(__text('thePowerBelowKutha'), 'p');
  if (titles.length)
    h += `<div class="rk-sec">${__text('oldTitles')}</div>` + titles.map(e => gmRow(bi(capS(ttEn(e)), capS(ttRu(e))), 't' + e)).join('');
  if (fsigns.length)
    h +=
      `<div class="rk-sec">${__text('signsAsTheTabletsWriteThem')}</div>` +
      fsigns.map(si => gmRow(__text('if'), 's' + si, { extra: gmToggle('v' + si, __text('iSawThis'), __text('markAsSeenIf')) })).join('');
  if (arts.length)
    h +=
      `<div class="rk-sec">${__text('charms')}</div>` +
      arts.map(w => gmRow(bi(ITEMS[w].name), 'w' + w, { none: true, tag: has(w) ? __text('carried') : '' })).join('');
  h += '</div>';
  h +=
    `<h4>${__text('signsSeen')}</h4>` +
    (seen.length
      ? `<ul class="tlog">${seen.map(x => `<li><span class="c-day">${dayLabel(x.day)}</span> ${bi(SIGN_POOL[x.si].texts[x.v])}</li>`).join('')}</ul>`
      : `<p class="dim">${bi(...TX.book.noneYetKuthaShows())}</p>`);
  h +=
    `<h4>${__text('theTablets')}</h4>` +
    (known.length
      ? `<ul class="tlog">${known.map(f => `<li><span class="dingir" aria-hidden="true">𒀭</span>${f.text}</li>`).join('')}</ul>`
      : `<p class="dim">${bi(...TX.book.nothingTranslatedYetFragments())}</p>`);
  if (S.glosses.length)
    h +=
      `<h4>${__text('whatTheTitlesMean')}</h4><p class="dim rk-rules">${bi(...TX.book.anselmIlseAndZahrun())}</p><ul class="tlog">` +
      S.glosses.map(gl => `<li><span class="c-day">${dayLabel(gl.day)}</span> ${glossNote(gl)}</li>`).join('') +
      '</ul>';
  if (reads.length)
    h +=
      `<h4>${__text('readings')}</h4><p class="dim rk-rules">${bi(...TX.book.anselmAndIlseRead())}</p><ul class="tlog">` +
      reads.map(r => `<li><span class="c-day">${dayLabel(r.day)}</span> ${readingNote(r)}</li>`).join('') +
      '</ul>';
  return h;
}
function bookKit() {
  let h = `<h4>${__text('carried2')}</h4>`;
  h += S.items.length
    ? S.items
        .map(
          it =>
            `<div class="item"><div class="i-name">${bi(ITEMS[it].name)}${ITEMS[it].ward ? ` <span class="chip">${__text('oldCharm')}</span>` : ''}</div><div class="i-desc">${bi(ITEMS[it].desc)}${ITEMS[it].ward ? ' ' + bi(...marksSee(it)) : ''}</div>${it === 'brandy' && !S.ended ? `<button type="button" class="mini" id="drinkBtn">${__text('drinkNowSteadiesYourNerve')}</button>` : ''}</div>`
        )
        .join('')
    : `<p class="dim">${__text('nothingYetSearchTheSite')}</p>`;
  h += `<h4>${__text('tabletFragments')}</h4><p>${S.fragments ? bi(...TX.book.waitingToBeTranslated()) : __text('noneWaiting')}</p>`;
  h += `<h4>${__text('yourTrade')}</h4><p>${{ philologist: bi(...TX.book.philologistTranslationComesEasier()), soldier: bi(...TX.book.oldSoldierPressingAnd()), occultist: bi(...TX.book.occultistNowAndThen()) }[S.bg]}</p>`;
  h += searchedNote();
  if (seedOpen)
    h += `<h4>${__text('season')}</h4><p><span class="seedcode">${seedCode(S.seed)}</span> <span class="dim">${bi(...TX.book.givenOnTheTitle())}</span></p>`;
  return h;
}
function searchedNote() {
  const done = LOC_IDS.filter(l => S.searched[l]);
  if (!done.length) return '';
  return `<h4>${__text('searched')}</h4><ul class="tlog">${done.map(l => `<li><b>${bi(LOCS[l].name)}</b>: ${bi(enTimes(S.searched[l]), ruTimes(S.searched[l]))}</li>`).join('')}</ul><p class="dim">${bi(...TX.book.aCharmHiddenIn())}</p>`;
}
function bookInit() {
  const p = document.getElementById('tabPanel');
  if (!p) return;
  p.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-mark],[data-gm],#drinkBtn');
    if (!b || !S) return;
    if (b.id === 'drinkBtn') {
      useBrandy();
      if (S.phase === 'plan') planScene();
      else renderAll();
      return;
    }
    const top = p.scrollTop,
      held = document.activeElement === b,
      [attr, k] = b.hasAttribute('data-mark') ? ['data-mark', b.dataset.mark] : ['data-gm', b.getAttribute('data-gm')];
    if (attr === 'data-mark') {
      const c = C(k);
      c.mark = c.mark === '?' ? 'ally' : c.mark === 'ally' ? 'foe' : '?';
      if (S_ui.scene && (S_ui.scene.choices || []).some(ch => typeof ch.sub === 'function')) paintScene(S_ui.scene);
    } else {
      S.gm[k] = b.hasAttribute('data-toggle') ? (S.gm[k] ? 0 : 1) : ((S.gm[k] || 0) + 1) % 3;
      sfx('mark');
    }
    renderBook();
    p.scrollTop = top;
    if (held) {
      const nb = p.querySelector(`[${attr}="${k}"]`);
      if (nb) nb.focus({ preventScroll: true });
    }
  });
}
