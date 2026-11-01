const EVENT_OK = {
  inspector: () => S.fragments > 0,
  wireless: () => S.doom >= RULES.start.doomStir,
  shamal: () => S.slotsToday === RULES.start.slots,
  cable: () => S.facts.some((f, i) => !S.factKnown.includes(i))
};
function morningEvent() {
  S.slotsToday = RULES.start.slots;
  let h = brought(strikeAtDawn()) + brought(dustAtDawn());
  const first = newsToday();
  if (!first) return h;
  h += brought(first.html);
  const s = first.strand;
  if (s !== 'dread' && chance(room(s) * TENOR.second * Math.min(1, Math.max(TENOR.floor, rateOf(s) - 1)))) {
    const more = newsToday(s, first.id);
    if (more) h += brought(more.html);
  }
  return h;
}
const EVENT_SOFT = { wireless: true };
function newsToday(of = null, not = null) {
  const ok = e => !EVENT_OK[e.id] || EVENT_OK[e.id](),
    pool = EVENTS.filter(e => e.id !== not && (!of || e.strand === of) && (ok(e) || EVENT_SOFT[e.id]));
  if (!pool.length) return null;
  const by = {};
  pool.forEach(e => {
    by[e.strand] = by[e.strand] || RULES.night.event[e.strand] * rateOf(e.strand) * room(e.strand);
  });
  if (!of && !chance(clamp(Object.values(by).reduce((a, b) => a + b, 0)))) return null;
  const strand = of || wpick(by),
    w = {};
  pool
    .filter(e => e.strand === strand)
    .forEach(e => {
      w[e.id] = (S.tenor.after[e.id] || 1) * (S.usedEvents.includes(e.id) ? RULES.events.again : 1) * (ok(e) ? 1 : RULES.events.early);
    });
  const which = wpick(w),
    ev = EVENTS.find(e => e.id === which),
    heavy = weighty(strand);
  S.usedEvents.push(ev.id);
  stirred(strand);
  Object.entries(ev.after || {}).forEach(([id, x]) => {
    S.tenor.after[id] = (S.tenor.after[id] || 1) * x;
  });
  return { strand: strand, id: ev.id, html: `<p class="event">${bi(ev.text)}</p>` + (EVENT_DO[ev.id] ? EVENT_DO[ev.id](heavy) : '') };
}
function strikeAtDawn() {
  if (S.strikeDay !== S.day) return '';
  if (!chance(RULES.verdict.strike)) {
    S.strikeDay = null;
    const hm = isFree(C('hamid'));
    return `<p class="event">${bi(...TX.events.atSunriseTheDiggers(hm))}</p>`;
  }
  return `<p class="event">${bi(...TX.events.theDiggersSitBy())}</p>${shortDay()}`;
}
function dustAtDawn() {
  if (S.tenor.dust !== S.day) return '';
  return `<p class="event">${bi(...TX.events.theShamalBlowsOn())}</p>${shortDay()}`;
}
function shortDay() {
  S.slotsToday = RULES.start.shortSlots;
  return `<p class="loss">${bi(...TX.events.onlyToday())}</p>`;
}
const actionsIn = n => TX.events.action(n);
const fragmentIn = (n = 1) =>
  `<p class="gain">${n > 2 ? bi(...TX.events.threeTabletFragmentsTo()) : n > 1 ? bi(...TX.events.twoTabletFragmentsTo()) : bi(...TX.events.aTabletFragmentTo())}</p>`;
function strongPair(sign, least) {
  const free = freeChars(),
    pairs = {},
    w = {};
  Ties.pairs(free).forEach(([a, b]) => {
    const k = a.id + ' ' + b.id,
      x = sign * (Ties.likes(a.id, b.id) + Ties.likes(b.id, a.id));
    pairs[k] = sign * Ties.likes(a.id, b.id) >= sign * Ties.likes(b.id, a.id) ? [a, b] : [b, a];
    if (x >= least) w[k] = x - least + 1;
  });
  const all = Object.keys(pairs);
  if (all.length && chance(RULES.events.mislead)) return pairs[pick(all)];
  return Object.keys(w).length ? pairs[wpick(w)] : null;
}
const uncanny = heavy => horrorCost(heavy ? RULES.harm.horrorHeavy : RULES.harm.horror, 'dread'),
  heartened = heavy => nerveNote(regain(heavy ? RULES.mend.newsHeavy : RULES.mend.news)),
  signSeen = heavy => omenP(nextOmen()) + (heavy ? horrorCost(RULES.harm.horror, 'dread') : '');
const EVENT_DO = {
  shamal: heavy => {
    if (chance(RULES.events.shamalPasses)) return `<p>${bi(...TX.events.byTheTimeThe())}</p>`;
    if (heavy && chance(RULES.events.dustAgain)) S.tenor.dust = S.day + 1;
    return shortDay();
  },
  telegram: heavy => {
    const h = hurt(heavy ? RULES.harm.telegramHeavy : RULES.harm.telegram, 0, { k: 'telegram' });
    S.hurtBy = 'news';
    return h;
  },
  aircraft: heartened,
  dealer: heavy => {
    const a = charmsToFind();
    const it = a.length ? pick(a) : minorItem();
    if (!it) return '';
    if (chance(RULES.events.fake)) return `<p>${bi(...TX.events.youTradeAFountain())}</p>`;
    gain(it);
    const charm = !!ITEMS[it].ward;
    if (charm) Record.journal(bi(...TX.events.tradedAFountainPen(it)));
    const more = heavy && chance(RULES.events.dealerMore) ? minorItem() : null;
    if (more) gain(more);
    return (
      `<p class="gain">${bi(...TX.events.youTradeAFountain2(it))}</p>` +
      (charm ? `<p class="dim">${bi(...marksSee(it))}</p>` : '') +
      (more ? `<p class="gain">${bi(...TX.events.andYourWatchFor(more))}</p>` : '')
    );
  },
  strike: signSeen,
  cable: heavy => {
    if (chance(RULES.events.garbled)) return `<p>${bi(...TX.events.theLineComesThrough())}</p>`;
    const l = learnFact(),
      l2 = heavy && l != null ? learnFact() : null;
    return (l != null ? factP(l) : '') + (l2 != null ? factP(l2) : '');
  },
  coffee: heavy => {
    const c = shuffle(freeChars().filter(o => o.rapport < RULES.scale.trustMax))
      .slice(0, heavy ? 2 : 1)
      .filter(() => chance(RULES.events.coffee));
    if (!c.length) return `<p>${bi(...TX.events.theTalkIsPleasant())}</p>`;
    c.forEach(x => Ties.moveTrust(x, 1, 'deed'));
    const ids = c.map(x => x.id),
      many = ids.length > 1;
    return `<p class="gain">${bi(...TX.events.satBesideYouAnd(ids, many, c))}</p>`;
  },
  mirage: uncanny,
  post: heartened,
  doctor: heavy => {
    if (!S.wounds)
      return `<p>${bi(...TX.events.heFindsNothingWrong())}</p>` + nerveNote(regain(heavy ? RULES.mend.newsHeavy : RULES.mend.news));
    return (
      (heal() ? `<p class="gain">${bi(...TX.events.heCleansAndStitches())}</p>` : `<p>${bi(...TX.events.heChangesYourDressings())}</p>`) +
      (heavy ? nerveNote(regain(RULES.mend.heavyMore)) : '')
    );
  },
  rain: heavy => {
    const n = vary(heavy ? 2 : 1, RULES.scale.graze);
    S.fragments += n;
    return n ? fragmentIn(n) : `<p>${__text('noneOfItIsWrittenOn')}</p>`;
  },
  inspector: heavy => {
    const n = Math.min(S.fragments, heavy ? 2 : 1);
    if (!n) return '';
    if (chance(RULES.events.satisfied)) return `<p>${bi(...TX.events.heCountsYourTablet())}</p>`;
    S.fragments -= n;
    return `<p class="loss">${bi(...TX.events.heTakesTwoTablet(n))}</p>`;
  },
  tent: uncanny,
  lorry: heavy => {
    let h = '';
    if (!has('torch') && chance(RULES.events.torch)) {
      gain('torch');
      h += `<p>${bi(...TX.events.amongTheBatteriesSomeone())}</p>` + gained('torch');
    } else h += nerveNote(regain(RULES.mend.lorry));
    if (heavy && !has('brandy') && chance(RULES.events.brandy)) {
      gain('brandy');
      h += `<p>${bi(...TX.events.andUnderTheParaffin())}</p>` + gained('brandy');
    }
    return h;
  },
  dervish: heavy => {
    if (has('bowl') || !chance(RULES.events.bowl)) return heartened(heavy);
    gain('bowl');
    return `<p>${bi(...TX.events.whenHeHasGone())}</p>` + gained('bowl') + (heavy ? nerveNote(regain(RULES.mend.heavyMore)) : '');
  },
  quarrel: heavy => {
    const p = strongPair(-1, 2);
    if (!p) return `<p>${__text('itBlowsOverByNoon')}</p>`;
    const [a, b] = p;
    Record.testify('you', a.id, 'quarrel', b.id);
    S.tenor.feud = {
      pair: [a.id, b.id],
      day: S.day
    };
    if (heavy) {
      if (chance(RULES.events.heavySus)) Suspicion.move(a.id, b.id, 1);
      if (chance(RULES.events.heavySus)) Suspicion.move(b.id, a.id, 1);
    }
    return (
      `<p class="notice">${bi(...TX.events.andTheyDoNot(a, b))}</p>` +
      (heavy ? `<p class="stir">${bi(...TX.events.byEveningEachOf())}</p>` : '')
    );
  },
  wedding: heavy => {
    const p = strongPair(1, 3);
    let h = '';
    if (p) {
      const [a, b] = p;
      Record.testify('you', a.id, 'feast', b.id);
      h = `<p class="notice">${bi(...TX.events.andSitTogetherAt(a, b))}</p>`;
      if (!heavy) return h;
    }
    const c = freeChars().filter(o => o.rapport < RULES.scale.trustMax);
    if (!c.length || !chance(RULES.events.feast)) return h;
    const x = pick(c);
    Ties.moveTrust(x, 1, 'deed');
    return h + `<p class="gain">${bi(...TX.events.satBesideYouAt(x))}</p>`;
  },
  bones: heavy => {
    const n = vary(heavy ? 2 : 1, RULES.scale.graze);
    S.fragments += n;
    return (n ? fragmentIn(n) : `<p>${bi(...TX.events.theTabletCrumblesTo())}</p>`) + uncanny(heavy);
  },
  wireless: uncanny,
  shadows: signSeen,
  well: uncanny,
  song: heavy => {
    const free = freeChars();
    if (free.length < 2) return '';
    const eyed = c => free.reduce((a, o) => a + Suspicion.level(o.id, c.id), 0),
      x = C(wpick(Object.fromEntries(free.map(c => [c.id, RULES.events.songAnyone + eyed(c) ** 2]))));
    return `<p class="notice">${bi(...TX.events.theVerseAboutIs(x))}</p>` + Moments.stir('song', { about: x.id, heavy: heavy });
  }
};
