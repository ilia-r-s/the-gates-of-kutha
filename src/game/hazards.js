// ===================== WHAT ELSE MAY HURT YOU =====================
// Besides the cult and the power below, the dig has dangers of its own (perils): a collapse, a fall, a dog, a snake,
// bad water, the afternoon heat; the more in a still season, when nothing else stirs (the season's mood: peril). And
// someone who cannot stand you may do you a harm in secret by night (spite), the more where talk runs high: a scorpion
// in your boot, salt in your water, your lamp oil watered, something of yours gone. Now and then the harm is found in
// time; now and then one of them is caught at it, or leaves a trace of themselves by your tent, as the cult might. The
// words are in data/hazards.js; what happened is kept in S.log (perils, spite) for the ending.

// what a hazard costs: n nerve, w wounds; by: what to blame, should it end you (the ending says so: data/endings.js)
function hazardCost(n, w, by) {
  const h = hurt(n, w);
  S.hurtBy = by;
  return h;
}
// Now and then the dig itself hurts you (l: where you are: out on the tell mostly, seldom in camp; of an afternoon out on
// the tell, the heat may, anywhere); k: × the usual chance (less, after a horror the same hour).
function perilNow(l, k = 1) {
  const PR = RULES.peril;
  if (!l) return '';
  const p = PR.base * tenorOf('peril') * (PR.at[l] || 1) * (S.slot === 1 ? PR.noon : 1) * k;
  if (!chance(p)) return '';
  const k2 = l !== 'camp' && S.slot === 1 && chance(PR.heat) ? 'heat' : l,
    [en, rus, n, w] = pick(PERILS[k2]);
  S.log.perils.push({ day: S.day, k: k2, w });
  return `<p class="horror">${bi(en, rus)}</p>` + hazardCost(n, w, 'peril');
}
// By night, someone who cannot stand you may do you a harm, at most one a night: the likelier the more they hate you,
// as their temperament allows (the honest hardly ever), and as the season's mood has it (k: × the usual chance). deed:
// the deed you went out on tonight, if any (game/deed.js): a revolver you took with you is not in your kit to be taken.
function spiteNight(k = 1, deed = null) {
  const SP = RULES.spite,
    who = shuffle(freeChars().filter(c => Ties.against(c))).find(c =>
      chance(SP.try * (Ties.hostile(c) ? SP.hate : 1) * SP.temper[temperOf(c)] * tenorOf('spite') * k)
    );
  if (!who) return '';
  const loot = ['brandy', 'torch', 'revolver'].filter(it => has(it) && !(it === 'revolver' && deed && deed.means === 'revolver')),
    kind = pick(['scorpion', 'water', 'lamp'].concat(loot.length ? ['theft'] : [])),
    rec = { day: S.day, id: who.id, kind, ok: chance(SP.ok), caught: false };
  S.log.spite.push(rec);
  let h;
  if (rec.ok && kind === 'theft') {
    const it = pick(loot);
    lose(it);
    rec.it = it;
    h =
      `<p class="horror">${bi(`${capS(theItem(it))} ${V(it, 'is', 'are')} gone from your kit in the night. Nobody saw anything.`, `${ru.Item(it)} ${ru.ig(it, 'пропал', 'пропала', 'пропало', 'пропали')} из вашего снаряжения за ночь. Никто ничего не видел.`)}</p>` +
      `<p class="loss">${bi(`Lost: ${ITEMS[it].name}`, `Потеряно: ${R(ITEMS[it].name)}`)}</p>`;
  } else if (rec.ok) {
    const [en, rus, n, w] = SPITE[kind].ok;
    h = `<p class="horror">${bi(en, rus)}</p>` + hazardCost(n, w, 'spite');
  } else h = `<p>${bi(...SPITE[kind].foiled)}</p>`;
  // caught at it; or else, now and then, a trace of theirs by your tent
  if (chance(SP.caught)) {
    // whom you know them for in the grey light: them, as a rule; now and then someone else (wrongFace; the ending tells it)
    const others = freeChars().filter(c => c.id !== who.id),
      seen = others.length && chance(SP.wrongFace) ? pick(others) : who;
    rec.caught = true;
    if (seen !== who) rec.seen = seen.id;
    Record.testify('you', seen.id, 'spite', kind);
    Record.journal(
      bi(
        `${seen.name} was at your tent in the night, meaning you harm.`,
        `${capS(ru.cf(seen))} ${ru.gs(seen, 'побывал', 'побывала')} ночью у вашей палатки, желая вам зла.`
      )
    );
    h += `<p class="notice">${bi(`You wake as someone backs out of your tent, and in the grey light you know them: ${seen.short}. ${EP.He(seen)} does not look back.`, `Вы просыпаетесь, когда кто-то пятится из вашей палатки, и в сером свете узнаёте: ${ru.c(seen)}. ${ru.gs(seen, 'Он', 'Она')} не оглядывается.`)}</p>`;
  } else if (chance(SP.trace)) {
    const cl = Record.addTrace({ owner: who.id, cat: pick(CATS), source: 'spite', loc: 'camp', status: 'unverified' });
    h += bi(`<p>By your tent pole you find ${clueText(cl)}.</p>`, `<p>У шеста вашей палатки вы находите ${clueTextRu(cl)}.</p>`);
  }
  return h;
}
