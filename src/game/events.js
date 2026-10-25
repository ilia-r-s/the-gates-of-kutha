// ===================== THE DAY'S NEWS =====================
// Now and then a morning brings news: the world outside (visitors, weather, the post), the uncanny, or the camp's own
// doings. Each piece belongs to a strand of the season's mood (game/tenor.js), and comes as often as its strand comes
// now (RULES.night.event, by strand); when one strand runs high, a second piece may follow the same morning. What comes
// seldom comes heavy, and does twice as much. One piece makes some others likelier later (EVENTS: after). Each happens
// at most once a season, and some only when they can (the inspector needs something to take; the voice on the wireless
// comes only once the rite is well along; a shamal does not blow on a day the diggers are out anyway; the Museum's cable
// needs a line you have not read). A day has three slots unless the news takes one away. Told at dawn: S.day is already
// the new day. (Each happens once a season as a rule, and the wireless once the rite is well along: events.again, early.)
const EVENT_OK = {
  inspector: () => S.fragments > 0,
  wireless: () => S.doom >= RULES.start.doomStir,
  shamal: () => S.slotsToday === RULES.start.slots, // (not on a day cut short already)
  cable: () => S.facts.some((f, i) => !S.factKnown.includes(i))
};
function morningEvent() {
  S.slotsToday = RULES.start.slots;
  let h = brought(strikeAtDawn()) + brought(dustAtDawn());
  const first = newsToday();
  if (!first) return h;
  h += brought(first.html);
  // where talk or news runs high, a second piece of the same may follow (dread brings no second: its signs do that)
  const s = first.strand;
  if (s !== 'dread' && chance(room(s) * TENOR.second * Math.min(1, Math.max(TENOR.floor, rateOf(s) - 1)))) {
    const more = newsToday(s, first.id);
    if (more) h += brought(more.html);
  }
  return h;
}
// A piece of news, if one comes: of any strand, each as often as it comes now and as the morning has room for it
// (game/tenor.js); or (of: a strand) a second piece of that strand, which comes if any is left to come.
// A piece already told this season may come again, seldom (events.again); the voice on the wireless, seldom before the
// rite is stirring (events.early).
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
  return { strand, id: ev.id, html: `<p class="event">${bi(ev.text)}</p>` + (EVENT_DO[ev.id] ? EVENT_DO[ev.id](heavy) : '') };
}
// the day after the camp walked out on your inquiries, the diggers do not dig (game/verdict.js), as a rule
// (verdict.strike: otherwise Hamid, or the headman, talks them round); told at its dawn
function strikeAtDawn() {
  if (S.strikeDay !== S.day) return '';
  if (!chance(RULES.verdict.strike)) {
    S.strikeDay = null;
    const hm = isFree(C('hamid')); // (the foreman, if he is still at the dig; else the headman)
    return `<p class="event">${bi(
      `At sunrise the diggers are in the trenches after all, sullen and silent: ${hm ? 'Hamid has' : 'the headman has'} talked them round.`,
      `На рассвете землекопы всё-таки выходят в траншеи, хмурые и молчаливые: ${hm ? 'Хамиду' : 'старосте'} удалось их уговорить.`
    )}</p>`;
  }
  return `<p class="event">${bi('The diggers sit by their tents with their arms folded, and the trenches stand empty all day.', 'Землекопы сидят у своих палаток, скрестив руки, и траншеи весь день пустуют.')}</p>${shortDay()}`;
}
// the day after a heavy shamal, it blows on
function dustAtDawn() {
  if (S.tenor.dust !== S.day) return '';
  return `<p class="event">${bi('The shamal blows on. By noon you cannot see the tell from the tents.', 'Шамаль не стихает. К полудню из лагеря уже не видно холма.')}</p>${shortDay()}`;
}
// a day cut short (the diggers out, or the dust): fewer slots, and no evening at camp (the day's first light says which
// kind of day it is: game/tenor.js)
function shortDay() {
  S.slotsToday = RULES.start.shortSlots;
  return `<p class="loss">${bi(`Only ${actionsIn(S.slotsToday)[0]} today`, `Сегодня только ${actionsIn(S.slotsToday)[1]}`)}</p>`;
}
const actionsIn = n => [
  `${['no', 'one', 'two', 'three'][n]} action${n === 1 ? '' : 's'}`,
  ['ни одного действия', 'одно действие', 'два действия', 'три действия'][n]
];
const fragmentIn = (n = 1) =>
  `<p class="gain">${
    n > 2
      ? bi('Three tablet fragments to translate at camp', 'Три обломка табличек — перевести в лагере')
      : n > 1
        ? bi('Two tablet fragments to translate at camp', 'Два обломка табличек — перевести в лагере')
        : bi('A tablet fragment to translate at camp', 'Обломок таблички — перевести в лагере')
  }</p>`;
// two of the camp who feel strongly about each other, one way (−1: a bad pair, if bad enough) or the other, the stronger
// the likelier; now and then (events.mislead) any two at all, on a bad day or a good one. The one who feels it more
// comes first.
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
// What each piece of news does (heavy: twice as much, or worse), all but always (RULES.events: now and then the wind
// drops, the dealer's charm is a fake, the inspector is satisfied, the lorry brings nothing you can use...). Returns what
// it adds to the morning. The uncanny costs nerve as any horror does (game/dread.js: where dread comes often, you grow
// used to it).
const uncanny = heavy => horrorCost(heavy ? 2 : 1, 'dread'),
  heartened = heavy => nerveNote(regain(heavy ? 2 : 1)),
  signSeen = heavy => omenP(nextOmen()) + (heavy ? horrorCost(1, 'dread') : '');
const EVENT_DO = {
  shamal: heavy => {
    if (chance(RULES.events.shamalPasses))
      return `<p>${bi('By the time the tents are lashed down, the wind has dropped as suddenly as it rose. The day is yours after all.', 'Пока палатки крепят к земле, ветер стихает так же внезапно, как поднялся. День всё-таки ваш.')}</p>`;
    if (heavy && chance(RULES.events.dustAgain)) S.tenor.dust = S.day + 1; // and it blows on tomorrow
    return shortDay();
  },
  telegram: heavy => hurt(heavy ? 2 : 1, 0),
  aircraft: heartened,
  dealer: heavy => {
    const a = charmsToFind();
    const it = a.length ? pick(a) : minorItem();
    if (!it) return '';
    if (chance(RULES.events.fake))
      return `<p>${bi('You trade a fountain pen for the one thing on his donkey that looks right. By evening the paint is coming off on your fingers.', 'Вы выменяли на вечное перо единственную вещь с его ослика, которая выглядела настоящей. К вечеру краска сходит у вас на пальцы.')}</p>`;
    gain(it);
    // (a charm bought shows its marks as one dug up does, for the tablets know it by nothing else, and goes into the
    // journal as a find does)
    const charm = !!ITEMS[it].ward;
    if (charm)
      journal(
        bi(
          `Traded a fountain pen for ${theItem(it)} with a dealer passing through.`,
          `${ru.Item(it)} — ${ru.ig(it, 'выменян', 'выменяна', 'выменяно', 'выменяны')} на вечное перо у заезжего торговца.`
        )
      );
    const more = heavy && chance(RULES.events.dealerMore) ? minorItem() : null; // two of his things are not fakes
    if (more) gain(more);
    return (
      `<p class="gain">${bi(`You trade a fountain pen for ${V(it, 'it', 'them')}: ${ITEMS[it].name}`, `Вы выменяли ${ru.ig(it, 'его', 'её', 'его', 'их')} на вечное перо: ${R(ITEMS[it].name)}`)}</p>` +
      (charm ? `<p class="dim">${bi(...marksSee(it))}</p>` : '') +
      (more
        ? `<p class="gain">${bi(`And your watch for another: ${ITEMS[more].name}`, `А на часы — ещё одну вещь: ${R(ITEMS[more].name)}`)}</p>`
        : '')
    );
  },
  strike: signSeen,
  cable: heavy => {
    if (chance(RULES.events.garbled))
      return `<p>${bi('The line comes through garbled in transmission: half of it is groups of figures, and the rest is the word STOP.', 'Строка дошла искажённой: половина её — группы цифр, остальное — слово «ТЧК».')}</p>`;
    const l = learnFact(),
      l2 = heavy && l != null ? learnFact() : null; // Bloomsbury has read two lines
    return (l != null ? factP(l) : '') + (l2 != null ? factP(l2) : '');
  },
  coffee: heavy => {
    const c = shuffle(freeChars().filter(o => o.rapport < RULES.scale.trustMax))
      .slice(0, heavy ? 2 : 1)
      .filter(() => chance(RULES.events.coffee)); // (a cup of coffee warms most people, not all)
    if (!c.length)
      return `<p>${bi('The talk is pleasant, and goes nowhere in particular.', 'Разговор приятный и ни к чему особенному не ведёт.')}</p>`;
    c.forEach(x => Ties.moveTrust(x, 1, 'deed'));
    const ids = c.map(x => x.id),
      many = ids.length > 1;
    return `<p class="gain">${bi(`${nameList(ids)} sat beside you and talked, and ${many ? 'trust' : 'trusts'} you more now`, `${nameListRu(ids)}: долгий разговор за чашкой кофе. Теперь ${many ? 'они доверяют' : ru.gs(c[0], 'он доверяет', 'она доверяет')} вам больше`)}</p>`;
  },
  mirage: uncanny,
  post: heartened,
  // he sees to a wound (now and then two, or none that will mend sooner for it), or, with none to see to, to your nerves
  doctor: heavy => {
    if (!S.wounds)
      return (
        `<p>${bi('He finds nothing wrong with you that sleep would not mend, and prescribes it.', 'Он не находит у вас ничего такого, чего не вылечил бы сон, — и прописывает сон.')}</p>` +
        nerveNote(regain(heavy ? 2 : 1))
      );
    return (
      (heal()
        ? `<p class="gain">${bi('He cleans and stitches what needs stitching, and asks no questions. You are the better for it.', 'Он промывает и зашивает всё, что нужно зашить, и ни о чём не спрашивает. Вам становится легче.')}</p>`
        : `<p>${bi('He changes your dressings and says the wounds are healing as well as can be expected. They do not feel it.', 'Он меняет вам повязки и говорит, что раны заживают как положено. По ощущениям — нет.')}</p>`) +
      (heavy ? nerveNote(regain(1)) : '')
    );
  },
  rain: heavy => {
    const n = vary(heavy ? 2 : 1, RULES.scale.graze); // (as many as the rain uncovered: one or two, mostly)
    S.fragments += n;
    return n ? fragmentIn(n) : `<p>${bi('None of it is written on.', 'Ни на одном нет надписей.')}</p>`;
  },
  inspector: heavy => {
    const n = Math.min(S.fragments, heavy ? 2 : 1);
    if (!n) return '';
    if (chance(RULES.events.satisfied))
      return `<p>${bi('He counts your tablet fragments too, writes something in his book, and leaves them where they are.', 'Он пересчитывает и ваши обломки табличек, что-то записывает в книжку — и оставляет их на месте.')}</p>`;
    S.fragments -= n;
    return `<p class="loss">${bi(n > 1 ? 'He takes two tablet fragments back to Baghdad, “for safekeeping”.' : 'He takes a tablet fragment back to Baghdad, “for safekeeping”.', n > 1 ? 'Он увозит в Багдад два обломка табличек — «на хранение».' : 'Он увозит в Багдад обломок таблички — «на хранение».')}</p>`;
  },
  tent: uncanny,
  lorry: heavy => {
    let h = '';
    if (!has('torch') && chance(RULES.events.torch)) {
      gain('torch');
      h +=
        `<p>${bi('Among the batteries, someone has packed an electric torch.', 'Вместе с батарейками кто-то положил электрический фонарик.')}</p>` +
        gained('torch');
    } else h += nerveNote(regain(1));
    if (heavy && !has('brandy') && chance(RULES.events.brandy)) {
      gain('brandy');
      h +=
        `<p>${bi('And under the paraffin, a flask of brandy with no name on it.', 'А под керосином — фляжка бренди без имени владельца.')}</p>` +
        gained('brandy');
    }
    return h;
  },
  dervish: heavy => {
    if (has('bowl') || !chance(RULES.events.bowl)) return heartened(heavy);
    gain('bowl');
    return (
      `<p>${bi('When he has gone, you find an old bowl buried face down beside your tent pole.', 'Когда он уходит, вы находите у шеста своей палатки старую чашу, зарытую вверх дном.')}</p>` +
      gained('bowl') +
      (heavy ? nerveNote(regain(1)) : '')
    );
  },
  // a quarrel shows a feud for what it is (and may come up again at breakfast: TENOR.feud); a feast shows a friendship:
  // both seen by you, said by nobody. A heavy quarrel leaves the two suspecting each other.
  quarrel: heavy => {
    const p = strongPair(-1, 2);
    if (!p) return `<p>${bi('It blows over by noon.', 'К полудню всё утихает.')}</p>`;
    const [a, b] = p;
    addTest('you', a.id, 'quarrel', b.id);
    S.tenor.feud = [a.id, b.id];
    if (heavy) {
      if (chance(RULES.events.heavySus)) Suspicion.move(a.id, b.id, 1);
      if (chance(RULES.events.heavySus)) Suspicion.move(b.id, a.id, 1);
    }
    return (
      `<p class="notice">${bi(`${a.short} and ${b.short}. They do not speak to each other for the rest of the day.`, `${ru.c(a)} и ${ru.c(b)}. До конца дня они не говорят друг с другом ни слова.`)}</p>` +
      (heavy
        ? `<p class="stir">${bi('By evening each of them has something to say about where the other goes after dark.', 'К вечеру у каждого из них находится что сказать о том, куда другой ходит по ночам.')}</p>`
        : '')
    );
  },
  wedding: heavy => {
    const p = strongPair(1, 3);
    let h = '';
    if (p) {
      const [a, b] = p;
      addTest('you', a.id, 'feast', b.id);
      h = `<p class="notice">${bi(`${a.short} and ${b.short} sit together at the feast, and laugh at the same things.`, `${ru.c(a)} и ${ru.c(b)} сидят на пиру рядом и смеются над одним и тем же.`)}</p>`;
      if (!heavy) return h;
    }
    const c = freeChars().filter(o => o.rapport < RULES.scale.trustMax);
    if (!c.length || !chance(RULES.events.feast)) return h; // (a seat beside you at the feast warms most people, not all)
    const x = pick(c);
    Ties.moveTrust(x, 1, 'deed');
    return (
      h +
      `<p class="gain">${bi(`${x.short} sat beside you at the feast, and trusts you more now`, `${ru.c(x)} ${ru.gs(x, 'сидел', 'сидела')} рядом с вами на пиру и теперь доверяет вам больше`)}</p>`
    );
  },
  bones: heavy => {
    const n = vary(heavy ? 2 : 1, RULES.scale.graze); // (as many as lay among them: one or two, mostly)
    S.fragments += n;
    return (
      (n
        ? fragmentIn(n)
        : `<p>${bi('The tablet crumbles to dust as the pickmen lift it.', 'Едва землекопы поднимают табличку, она рассыпается в прах.')}</p>`) +
      uncanny(heavy)
    );
  },
  wireless: uncanny,
  shadows: signSeen,
  well: uncanny,
  // the diggers' song: whoever the camp already eyes, the likelier the more it eyes them (anyone, if nobody), and the
  // camp may eye them the more for it
  song: heavy => {
    const free = freeChars();
    if (free.length < 2) return '';
    const eyed = c => free.reduce((a, o) => a + Suspicion.level(o.id, c.id), 0),
      x = C(wpick(Object.fromEntries(free.map(c => [c.id, RULES.events.songAnyone + eyed(c) ** 2]))));
    return (
      `<p class="notice">${bi(`The verse about ${x.short} is not kind.`, `Куплет про ${ru.c(x, 'a')} — недобрый.`)}</p>` +
      stir('song', { about: x.id, heavy })
    );
  }
};
