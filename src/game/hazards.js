function hazardCost(n, w, by, why) {
  const h = hurt(n, w, why);
  S.hurtBy = by;
  return h;
}
function perilNow(l, k = 1) {
  const PR = RULES.peril;
  if (!l) return '';
  const p = PR.base * tenorOf('peril') * (PR.at[l] || 1) * (S.slot === 1 ? PR.noon : 1) * k;
  if (!chance(p)) return '';
  const k2 = l !== 'camp' && S.slot === 1 && chance(PR.heat) ? 'heat' : l,
    { id: name, text } = pick(PERILS[k2]),
    [n, w] = PR.costs[name];
  S.log.perils.push({ day: S.day, k: k2, w: w, name: name });
  return `<p class="horror">${bi(...text)}</p>` + hazardCost(n, w, 'peril', { k: 'peril', name: name });
}
function spiteNight(k = 1, deed = null) {
  const SP = RULES.spite,
    who = shuffle(freeChars().filter(c => Ties.against(c))).find(c =>
      chance(SP.try * (Ties.hostile(c) ? SP.hate : 1) * SP.temper[temperOf(c)] * tenorOf('spite') * k)
    );
  if (!who) return '';
  const loot = ['brandy', 'torch', 'revolver'].filter(it => has(it) && !(it === 'revolver' && deed && deed.means === 'revolver')),
    kind = pick(['scorpion', 'water', 'lamp'].concat(loot.length ? ['theft'] : [])),
    rec = { day: S.day, id: who.id, kind: kind, ok: chance(SP.ok), caught: false };
  S.log.spite.push(rec);
  let h;
  if (rec.ok && kind === 'theft') {
    const it = pick(loot);
    lose(it);
    rec.it = it;
    h = `<p class="horror">${bi(...TX.hazards.goneFromYourKit(it))}</p>` + `<p class="loss">${__text('lost')}</p>`;
  } else if (rec.ok) {
    const [n, w] = SP.costs[kind];
    h = `<p class="horror">${bi(...SPITE[kind].ok)}</p>` + hazardCost(n, w, 'spite', { k: 'spite', kind: kind });
  } else h = `<p>${bi(...SPITE[kind].foiled)}</p>`;
  if (chance(SP.caught)) {
    const others = freeChars().filter(c => c.id !== who.id),
      seen = others.length && chance(SP.wrongFace) ? pick(others) : who;
    rec.caught = true;
    if (seen !== who) rec.seen = seen.id;
    Record.testify('you', seen.id, 'spite', kind);
    Record.journal(bi(...TX.hazards.wasAtYourTent(seen)));
    h += `<p class="notice">${bi(...TX.hazards.youWakeAsSomeone(seen))}</p>`;
  } else if (chance(SP.trace)) {
    const cl = Record.addTrace({ owner: who.id, cat: pick(CATS), source: 'spite', loc: 'camp', status: 'unverified' });
    h += bi(...TX.hazards.byYourTentPole(cl));
  }
  return h;
}
