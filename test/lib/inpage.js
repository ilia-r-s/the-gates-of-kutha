// Helpers that run inside the game page (installed by harness.open as window.__T): leak scans for both languages,
// clicking, and the play policies the simulators share.
window.__T = (() => {
  // ---------- text checks ----------
  // Render a piece of game text in both languages and report anything a reader should never see: raw markers, template
  // syntax, undefined values, English left in the Russian, Russian in the English, stray spaces before punctuation.
  const plain = s => s.replace(/<\/?(b|i|em|strong|span)\b[^>]*>/g, '').replace(/<[^>]*>/g, ' ');
  function scan(s, where, bad, seen) {
    if (s == null) return;
    s = String(s);
    if (seen) {
      if (seen.has(s)) return;
      seen.add(s);
    }
    ['en', 'ru'].forEach(l => {
      const keep = LANG;
      LANG = l;
      const t = plain(X(s));
      LANG = keep;
      if (/[\u0001\u0002\u0003]|undefined|NaN|\bnull\b|\{[a-z.:]+\}|\[object/.test(t))
        bad.push(`${where} marker (${l}): ${t.slice(0, 140)}`);
      // (a season's code, 1A2B-3C4D, is written the same in both languages)
      if (l === 'ru' && /[A-Za-z]{3,}/.test(t.replace(/Dr |Marlowe|\b[0-9A-F]{4}-[0-9A-F]{4}\b/g, '')))
        bad.push(`${where} latin in ru: ${t.slice(0, 140)}`);
      if (l === 'en' && /[А-Яа-яЁё]/.test(t)) bad.push(`${where} cyrillic in en: ${t.slice(0, 140)}`);
      if (l === 'ru' && /\s[,.]|«\s|\s»/.test(t)) bad.push(`${where} spacing in ru: ${t.slice(0, 140)}`);
    });
  }
  // every scene the game shows, scanned as it is shown
  function watchScenes(bad, seen) {
    const o = window.show;
    window.show = sc => {
      [
        sc.kicker,
        sc.title,
        sc.sub,
        ...(sc.body || []),
        ...(sc.choices || []).flatMap(c => [c.label, typeof c.sub === 'function' ? c.sub() : c.sub])
      ].forEach(x => scan(x, 'scene:' + (S ? S.phase : '-'), bad, seen));
      o(sc);
    };
  }
  const scanBook = (bad, seen) =>
    ['people', 'evidence', 'omens', 'kit'].forEach(t => {
      S_ui.tab = t;
      scan({ people: bookPeople, evidence: bookEvidence, omens: bookOmens, kit: bookKit }[t](), 'book ' + t, bad, seen);
    });

  // ---------- clicking ----------
  const buttons = () => [...document.querySelectorAll('#choices .choice')];
  const text = b => b.textContent;
  // a new season: a background, then the casebook kept the default way (hardcore: true for the bare record); seed: the
  // season's own (core/random.js), else a new one from the page's stream
  const start = (bg = 0, hardcore = false, seed = null) => {
    introScene(seed);
    buttons()[bg].click();
    buttons()[hardcore ? 1 : 0].click();
  };
  const AWAY = /Go somewhere else|Never mind|Think better/;

  // ---------- policies: given the buttons on screen, which one to press ----------
  // A seeded generator for the policies, so simulations repeat.
  const lcg = seed => {
    let x = seed >>> 0;
    return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  };
  const weighted = (bs, w, rnd) => {
    let r = rnd() * w.reduce((a, c) => a + c, 0),
      k = 0;
    while (k < w.length - 1 && (r -= w[k]) > 0) k++;
    return bs[k];
  };
  // random: anything but the ways back out, mostly
  const random = rnd => bs => {
    const pool = bs.filter(b => !AWAY.test(text(b)));
    return pool.length && rnd() < 0.9 ? pool[Math.floor(rnd() * pool.length)] : bs[Math.floor(rnd() * bs.length)];
  };
  // human: the way a person tends to play, with an optional lean (a pattern of buttons pressed five times as often)
  const HUMAN = [
    [/Examine the scene/, () => 8],
    [/Search the area/, () => 1.5],
    [/Translate a tablet/, () => 3],
    [/Ask where they were/, () => 3.5],
    [/Make conversation/, () => 2],
    [/Ask whom they distrust/, () => 1.5],
    [/Take your leave/, () => 0.5],
    [/Never mind|Think better|Not now/, () => 0.2],
    [/Look for/, () => 2],
    [/Name no power/, () => 0.5],
    [/counter-rite/, () => 2],
    [/scene of last|where Crane/, () => 6],
    [/Drink from the brandy/, () => 0.3],
    [/Go somewhere else/, () => 0.3],
    [/Rest in your tent/, () => (S.nerve <= 4 ? 3 : 0.6)],
    [/Convene an inquiry/, () => (S.day >= 3 ? 3 : 0.3)]
  ];
  function humanWeight(b, all) {
    const t = text(b);
    if (/Speak with/.test(t)) return 4.5 / all.filter(o => /Speak with/.test(text(o))).length;
    for (const [re, w] of HUMAN) if (re.test(t)) return w();
    if (/^.?Accuse /.test(t)) {
      const c = freeChars().find(x => t.includes(x.name));
      return c && c.role === 'cult' ? 3 : 1;
    }
    if (/^.?Name /.test(t)) return t.includes('Name ' + GODS[S.patron].name) ? 3 : 1;
    if (/Raise the/.test(t))
      return S.items.filter(i => ITEMS[i].ward).some(i => t.toLowerCase().includes(ITEMS[i].name.toLowerCase()) && i === S.wardOf[S.patron])
        ? 2
        : 1;
    if (S.phase === 'plan' && /Expedition camp/.test(t))
      return (S.slot === 2 && S.day >= 3 ? 3 : 0) + (S.fragments ? 1.5 : 0) + (S.nerve <= 4 ? 1.5 : 0) + 1;
    if (S.phase === 'plan') {
      const l = LOC_IDS.find(x => t.includes(LOCS[x].name));
      if (l) return 1 + 0.5 * (S.here[l] || []).filter(id => isFree(C(id))).length;
    }
    return 1;
  }
  const human =
    (rnd, lean = null) =>
    bs =>
      weighted(
        bs,
        bs.map(b => humanWeight(b, bs) * (lean && lean.test(text(b)) ? 5 : 1)),
        rnd
      );
  const LEANS = {
    inquisitor: /Press them|Convene an inquiry|Accuse|Turn and face|Ask whom they distrust/,
    quiet: /Rest in your tent|Never mind|Think better|Not now|Go down slowly|Cover your light|Keep walking/,
    scholar: /Translate a tablet|Look for|Read it as it comes|Show (Anselm|Ilse)|Speak with (Anselm|Ilse)|counter-rite/,
    sleuth: /Examine the scene|Ask where they were|scene of last|where Crane/,
    delver: /Search the area/,
    confidant: /Confide|Make conversation|^1?Take [A-Z]/
  };
  // the cheat: knows the cult, and makes a case against it the camp can back before calling an inquiry (the camp will
  // not send anyone away on nothing, game/verdict.js): it examines every scene, keeps company with the cult to learn its
  // habits, and accuses only one of the cult, on a case worth laying out; otherwise it plays like a person
  const cheat = rnd => {
    const h = human(rnd),
      ACCUSE = /Convene an inquiry|^.?Accuse/;
    return bs => {
      const find = re => bs.find(b => re.test(text(b)));
      const best = freeCult()
        .map(c => [c, Record.caseAgainst(c)])
        .sort((a, b) => b[1] - a[1])[0];
      const ready = !!best && best[1] >= 1.25 && !S.walkout && !S.inquiryDone;
      if (S.phase === 'inquiry') return (ready && bs.find(b => text(b).includes(best[0].name))) || find(/Think better/);
      if (S.phase === 'plan') {
        if (S.slot === 2 && ready) return find(/Expedition camp/);
        const scene = S.crime && !S.crime.examined && find(/scene of last|where Crane/);
        if (scene) return scene;
        const l = LOC_IDS.find(x => (S.here[x] || []).some(id => C(id).role === 'cult' && isFree(C(id))));
        const go = l && bs.find(b => text(b).includes(LOCS[l].name));
        if (go) return go;
      }
      if (S.phase === 'loc') {
        if (S.loc === 'camp' && S.slot === 2 && ready) return find(/Convene an inquiry/);
        const ex = S.crime && !S.crime.examined && S.loc === S.crime.loc && find(/Examine the scene/);
        if (ex) return ex;
        const c = freeCult().find(k => (S.here[S.loc] || []).includes(k.id));
        const talk = c && find(new RegExp('Speak with ' + c.short));
        if (talk) return talk;
      }
      const b = h(bs);
      return ACCUSE.test(text(b)) ? bs.find(x => !ACCUSE.test(text(x))) || b : b;
    };
  };
  // play one season to its end with a policy; returns false if the game got stuck
  function play(policy, { maxSteps = 700, each = null } = {}) {
    for (let s = 0; s < maxSteps && !S.ended; s++) {
      const bs = buttons();
      if (!bs.length) return false;
      if (each) each(s);
      (policy(bs) || bs[0]).click();
    }
    return !!S.ended;
  }
  return { scan, watchScenes, scanBook, buttons, start, play, lcg, policies: { random, human, cheat }, LEANS };
})();
