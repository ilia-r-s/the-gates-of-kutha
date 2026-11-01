// A casebook reader. Decisions use offered actions and recorded evidence only.
// Requires solver.js and inpage.js. A heuristic player, not an optimal one.
window.__observer = (rnd, mode = 'mixed', { careful = false } = {}) => {
  const fallback = __T.policies.human(rnd, __T.LEANS.scholar);
  let key, solved;
  const evidence = () => {
    const next = JSON.stringify([S.gods, S.charms, S.factKnown, S.glosses, S.readings, S.omenLog, S.revealed]);
    if (next !== key) {
      key = next;
      solved = solve();
    }
    return solved;
  };
  const score = c => {
    if (S.revealed[c.id]) return -99;
    let n = 0;
    S.clues
      .filter(cl => !['thief', 'planted'].includes(cl.status) && c.known[cl.cat] === cl.val)
      .forEach(cl => {
        n += cl.status === 'genuine' ? 2 : 1;
      });
    S.testimony
      .filter(t => t.about === c.id)
      .forEach(t => {
        if (t.kind === 'slip' || t.kind === 'blurt') n += 3;
        if (t.kind === 'react' && t.verdict === 'fear') n++;
        if (t.kind === 'vision') n += t.verdict === 'cult' ? 1 : -1;
        if (t.kind === 'chill' || t.kind === 'failwatch') n++;
      });
    return n;
  };
  const en = value => {
    const old = LANG;
    try {
      LANG = 'en';
      return X(value).replace(/<[^>]*>/g, '');
    } finally {
      LANG = old;
    }
  };
  return bs => {
    const observation = __T.observe(bs),
      labels = observation.choices,
      find = re => bs[labels.findIndex(t => re.test(t))],
      match = label => bs[labels.indexOf(label)],
      byName = (prefix, name) => labels.findIndex(t => t.startsWith(prefix) && t.includes(en(name))),
      r = evidence(),
      free = freeChars(),
      suspects = free.map(c => ({ c, score: score(c) })).sort((a, b) => b.score - a.score),
      best = suspects[0],
      vague = Object.keys(r.titles).filter(e => r.titles[e].length > 1),
      glosser = free.find(c => GLOSSERS.includes(c.id) && titlesToAsk(c).some(e => vague.includes(e))),
      scholar = free.find(c => SCHOLARS.includes(c.id) && S.items.some(w => CHARMS.includes(w) && !S.readings[c.id + ':' + w]));
    // These are the notebook's visible words. Exact nerve is never an input.
    if (careful && /^(frayed|shaking|near breaking|breaking)$/.test(observation.condition?.nerve || '')) {
      if (S.phase === 'plan') return find(/Drink from the brandy/) || match(en(LOCS.camp.name)) || fallback(bs);
      if (S.phase === 'loc') return find(/Rest in your tent|Go somewhere else/) || fallback(bs);
      if (S.phase === 'talk') {
        const leave = find(/Take your leave|Back to the conversation/);
        if (leave) return leave;
      }
    }
    if (labels.some(t => /^Name /.test(t))) {
      const candidates = r.P.length ? r.P : S.gods;
      const options = candidates.map(g => bs[byName('Name ', GODS[g].name)]).filter(Boolean);
      if (options.length) return options[rnd.int(options.length)];
    }
    if (labels.some(t => /Raise the|counter-rite/.test(t))) {
      const attempts = S.fin?.acts || [],
        acts = S.items
          .filter(w => CHARMS.includes(w))
          .map(w => ({
            b: bs[byName('Raise ', ITEMS[w].name)],
            value: (r.wardP[w] || 0) / (1 + attempts.filter(a => a.it === w).length)
          }));
      acts.push({
        b: find(/counter-rite/),
        value: (r.P.length ? 1 / r.P.length : 0.25) / (1 + attempts.filter(a => a.kind === 'rite').length)
      });
      const chosen = acts.filter(a => a.b).sort((a, b) => b.value - a.value)[0];
      if (chosen) return chosen.b;
    }
    if (labels.some(t => /^Take /.test(t)) && ['finale', 'descent'].includes(S.phase)) {
      const allies = suspects
        .slice()
        .reverse()
        .map(({ c, score }) => ({ score, b: bs[byName('Take ', c.short)] }))
        .filter(a => a.b);
      return allies.find(a => a.score < 3)?.b || find(/Go down alone|No one else/) || fallback(bs);
    }
    if (S.phase === 'inquiry') return (best?.score >= 3 && bs[byName('Accuse ', best.c.name)]) || find(/Think better/) || fallback(bs);
    if (S.phase === 'plan') {
      let loc;
      if (S.crime && !S.crime.examined && (mode === 'cult' || (mode === 'mixed' && S.slot === 0))) loc = S.crime.loc;
      else if (S.fragments || (S.slot === 2 && best?.score >= 3 && !S.inquiryDone)) loc = 'camp';
      else if (glosser || scholar) loc = (glosser || scholar).loc;
      else {
        const unsearched = LOC_IDS.filter(l => LOCS[l].search && !S.searched[l]);
        loc = unsearched.length ? unsearched[rnd.int(unsearched.length)] : rnd() < 0.5 ? 'trench' : 'store';
      }
      return match(en(LOCS[loc].name)) || fallback(bs);
    }
    if (S.phase === 'loc') {
      const exam = find(/Examine the scene/),
        study = find(/Translate a tablet/),
        inquiry = find(/Convene an inquiry/);
      if (exam && mode !== 'puzzle') return exam;
      if (inquiry && best?.score >= 3) return inquiry;
      if (study) return study;
      const c = [glosser, scholar].find(c => c && (S.here[S.loc] || []).includes(c.id));
      if (c) return bs[byName('Speak with ', c.short)] || fallback(bs);
      return find(/Search the area|Rest in your tent/) || fallback(bs);
    }
    if (labels.some(t => /^Look for /.test(t))) {
      const topics = studyTopics(),
        useful = topics
          .filter(x => x.sign != null && r.P.length > 1)
          .concat(
            topics.filter(x => x.title && vague.includes(x.title)),
            topics.filter(x => x.ward && r.wardP[x.ward] > 0 && r.wardP[x.ward] < 1)
          );
      const options = useful.map(x => match(en(x.label))).filter(Boolean);
      return options.length ? options[rnd.int(options.length)] : find(/Read it as it comes/) || fallback(bs);
    }
    if (S.phase === 'talk') {
      const title = find(/Ask what an old title means/);
      if (title && S.talkId && titlesToAsk(C(S.talkId)).some(e => vague.includes(e))) return title;
      for (const e of vague) {
        const i = labels.findIndex(t => t.includes(capS(ttEn(e))));
        if (i >= 0) return bs[i];
      }
      const shown = S.items.filter(w => CHARMS.includes(w)).sort((a, b) => (r.wardP[b] || 0) - (r.wardP[a] || 0));
      for (const w of shown) {
        const i = labels.findIndex(t => t.toLowerCase().includes(en(ITEMS[w].name).toLowerCase()));
        if (i >= 0) return bs[i];
      }
      return find(/Show .*something|Ask where they were|Make conversation|Take your leave|Back to the conversation/) || fallback(bs);
    }
    return fallback(bs);
  };
};
