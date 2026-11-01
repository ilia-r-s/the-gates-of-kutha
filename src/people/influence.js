// Ordinary camp voices carry influence. Roles affect bounded aims, never who gets
// a speaking opportunity. Effects and remembered sources use the shared records.
const CampInfluence = (() => {
  const records = () => S.log.influence || (S.log.influence = []),
    unused = c => !records().some(r => r.by === c.id && r.day === S.day),
    note = (kind, s, data, line) => {
      const rec = { kind, day: S.day, slot: S.slot, by: s.id, ...data };
      records().push(rec);
      Record.journal(line);
      return { rec, html: `<p class="notice">${line}</p>` };
    };
  const breakfastOpportunity = Decisions.define({
      id: 'influence.breakfast',
      action: 'open-breakfast-speaking-opportunity',
      subject: 'camp',
      authority: 'world',
      knowledge: ['common camp pacing and unused speakers'],
      consequences: ['one ordinary speaking opportunity'],
      probability: () => room('talk') * RULES.influence.breakfast
    }),
    inquiryOpportunity = Decisions.define({
      id: 'influence.inquiry.second',
      action: 'open-inquiry-echo-opportunity',
      subject: 'camp',
      authority: 'world',
      knowledge: ['the actual public inquiry and available speakers'],
      consequences: ['second voice'],
      probability: () => RULES.influence.inquirySecond
    }),
    steerOpportunity = Decisions.define({
      id: 'influence.inquiry.steer',
      action: 'open-friendly-intervention-opportunity',
      subject: 'camp',
      authority: 'world',
      knowledge: ['eligible unused friends at the public inquiry'],
      consequences: ['one intervention'],
      probability: () => RULES.influence.steer
    }),
    support = Decisions.define({
      id: 'influence.support',
      action: 'support-inquiry',
      subject: s => s.id,
      object: (s, x) => x.id,
      authority: 'actor',
      knowledge: ['own suspicion and role', 'fellow membership only when personally initiated'],
      consequences: ['public support or opposition', 'affinity-based persuasion'],
      features: { suspicion: 'number', role: 'string', targetCult: 'boolean?' },
      observe: (s, x) => ({ suspicion: Suspicion.level(s, x), role: s.role, targetCult: s.role === 'cult' ? x.role === 'cult' : null }),
      probability: (s, x) =>
        RULES.influence.supports +
        RULES.influence.suspicion * Suspicion.level(s, x) +
        (s.role === 'cult' ? RULES.influence.cultLean * (x.role === 'cult' ? -1 : 1) : 0)
    }),
    memory = Decisions.define({
      id: 'influence.recall.accurate',
      action: 'resolve-source-memory',
      subject: s => s.id,
      object: (s, r) => r.by,
      authority: 'world',
      knowledge: ['recorded actual source and genuinely earlier alternative speakers'],
      consequences: ['accurate or mistaken attribution'],
      probability: () => RULES.influence.remembers
    });
  function secondVoice(s, only = null) {
    const words = S.said.filter(
        x =>
          x.verdict === 'cult' &&
          x.by !== s.id &&
          x.about !== s.id &&
          x.day >= S.day - RULES.influence.fresh &&
          isFree(C(x.about)) &&
          isFree(C(x.by))
      ),
      targets = freeChars().filter(c => (!only || c.id === only.id) && words.some(x => x.about === c.id));
    if (!targets.length) return '';
    const t = C(
        wpick(
          boundedAim(
            targets,
            c => 1 + Suspicion.level(s, c),
            c => s.role === 'cult' && c.role !== 'cult',
            RULES.influence.aim
          )
        )
      ),
      source = words.filter(x => x.about === t.id).slice(-1)[0],
      f = C(source.by),
      line = __text('secondVoice'),
      { rec, html } = note('second', s, { about: t.id, source: f.id }, line);
    const reaction = Moments.blame('breakfast', s.id, t.id);
    rec.listeners = (Moments.last()?.moved || []).flatMap(m => m[3]);
    return html + reaction;
  }
  function evidenceDoubt(s) {
    const styles = Knowledge.styles(s);
    if (!styles.length) return '';
    const style = pick(styles),
      line = __text('evidenceDoubt');
    return note('doubt', s, { about: null, style }, line).html;
  }
  function recall(s) {
    const routes = records().filter(
      r =>
        r.kind === 'second' &&
        !r.recalled &&
        r.day < S.day &&
        (r.listeners || []).includes(s.id) &&
        isFree(C(r.by)) &&
        S.log.accused.some(a => a.id === r.about && !a.right && a.day >= r.day) &&
        S.inquiries.some(v => v.id === r.about && v.day >= r.day && v.back.includes(s.id))
    );
    if (!routes.length) return '';
    const r = pick(routes),
      vote = S.inquiries.find(v => v.id === r.about && v.day >= r.day && v.back.includes(s.id)),
      earlierWords = S.said.slice(0, vote.saidBeforeVote),
      alternatives = freeChars().filter(
        c =>
          c.id !== s.id &&
          c.id !== r.by &&
          earlierWords.some(x => x.by === c.id && x.about === r.about && x.verdict === 'cult' && x.day <= vote.day)
      ),
      f = alternatives.length && !memory.roll(s, r) ? pick(alternatives) : C(r.by),
      t = C(r.about),
      line = __text('rememberedSource');
    r.recalled = true;
    return note('recall', s, { about: t.id, source: f.id }, line).html;
  }
  function breakfast() {
    const pool = freeChars().filter(unused);
    if (!pool.length || !breakfastOpportunity.roll()) return '';
    const s = pick(pool),
      k = wpick(Object.fromEntries(['second', 'doubt', 'recall'].map(x => [x, RULES.influence[x]])));
    return { second: secondVoice, doubt: evidenceDoubt, recall }[k](s);
  }
  function inquiry(x) {
    const K = RULES.influence,
      voices = freeChars().filter(c => c.id !== x.id && unused(c)),
      echo = voices.length && inquiryOpportunity.roll() ? secondVoice(pick(voices), x) : '',
      pool = freeChars().filter(
        c => c.id !== x.id && Ties.friend(c) && unused(c) && !records().some(r => r.kind === 'steer' && r.by === c.id)
      );
    if (!pool.length || !steerOpportunity.roll()) return { html: echo, sway: () => 0 };
    const s = pick(pool),
      backsTarget = support.roll(s, x),
      line = backsTarget ? __text('steerFor') : __text('steerAgainst'),
      { html } = note('steer', s, { about: x.id, support: backsTarget }, line);
    return { html: echo + html, sway: c => (c.id !== s.id && Ties.fond(c, s) ? K.sway * (backsTarget ? 1 : -1) : 0) };
  }
  const caseFactor = () =>
    records().some(r => r.kind === 'doubt' && S.day - r.day <= RULES.influence.doubtDays) ? 1 - RULES.influence.doubtCase : 1;
  return { breakfast, inquiry, caseFactor, records };
})();
