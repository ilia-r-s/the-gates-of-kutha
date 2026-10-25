// Rare branches, forced: every piece of morning news, the horrors outside the tomb and the scorched circle, every way a
// sign is told, a planted trace seen through, a careless night, a slip of the tongue, every inquiry outcome, the early
// gate, volunteers and refusals at the stair, a traitor below and one who waits, everything that waits between the
// gates, the cult taking its place in the circle (the hierophant; one who offered to come; one you asked), the social
// layer's rarer turns (a confession before the camp, a cultist's retreat, rumours and gossip at breakfast), every kind
// of public moment, flirtation and its faces, the thief as witness, every ending, the fates (romances among them) and
// what becomes of you; every way each power takes its dead, the casebook and an inquiry played hardcore, and one of the
// cult killing another; the night visit, and the deed, every way each turns. Recorded per language, like the golden
// transcripts.
//   node test/forced.js record [--lang=ru]   record from the current build into test/golden/forced-<lang>.json.gz
//   node test/forced.js check  [--lang=ru]   replay and report every difference
//   SHOW=regex node test/forced.js check --lang=ru   also print the matching scenes, to read
// --page=path plays another build instead of standalone.html.
const fs = require('fs'),
  path = require('path'),
  zlib = require('zlib');
const { run, open, args, shownOnly } = require('./lib/harness');
const a = args({ lang: 'en' }),
  mode = a._[0] || 'check',
  FILE = path.join(__dirname, 'golden', `forced-${a.lang}.json.gz`);

const SCRIPT = () => {
  window.sfx = () => {};
  Object.assign(RULES.scale, { rarest: 0, surest: 1 }); // (exact dice: a branch forced here happens, or does not)
  const caps = [],
    q = s => document.querySelector(s);
  const cap = tag => {
    const tabs = ['people', 'evidence', 'omens', 'kit'].map(t => {
      S_ui.tab = t;
      renderBook();
      return q('#tabPanel').innerHTML;
    });
    caps.push([
      tag,
      q('#kicker').textContent + '|' + q('#sceneTitle').textContent + '|' + q('#sceneSub').textContent,
      q('#sceneText').innerHTML,
      [...document.querySelectorAll('#choices .choice')].map(e => e.innerHTML).join('|'),
      tabs.join('|'),
      q('#meters').innerHTML
    ]);
  };
  const capHtml = (tag, html) => caps.push([tag, X(html)]);
  const capState = (tag, v) => caps.push(['#' + tag, JSON.stringify(v)]); // (the state behind a scene: not shown, so not checked for leaks)
  const choose = re => {
    const c = S_ui.scene.choices.find(x => re.test(X(x.label)));
    if (!c) throw new Error('no choice ' + re);
    c.fn();
  };
  // try something that depends on the dice until it happens (the same way every run, the dice being seeded)
  const until = (f, n = 200) => {
    for (let i = 0; i < n; i++) {
      const r = f();
      if (r) return r;
    }
    throw new Error('never happened: ' + String(f).slice(0, 120));
  };
  // a season with the two clay figures among its charms, so that a charm that is two is told too
  until(() => {
    newGame('Marlowe', 'occultist');
    return S.charms.includes('figures');
  });
  arrivalScene();
  cap('arrival');
  startSlot();
  cap('plan');
  ['bowl', 'brandy', 'torch', 'revolver'].concat(S.charms).forEach(gain);
  cap('kit');
  // every piece of news, as it comes and as it comes heavy (game/events.js), and the shamal's second day
  EVENTS.forEach(ev => {
    S.usedEvents = [];
    [false, true].forEach(heavy => {
      S.fragments = 2;
      S.slotsToday = RULES.start.slots;
      capHtml('event-' + ev.id + (heavy ? '-heavy' : ''), bi(ev.text) + (EVENT_DO[ev.id] ? EVENT_DO[ev.id](heavy) : ''));
    });
  });
  // the rarer turns of the news: a grave whose tablet crumbles as it is lifted, or three fragments; a feast that warms nobody
  [
    ['bones-none', false, /crumbles to dust|рассыпается в прах/],
    ['bones-three', true, /Three tablet|Три обломка/]
  ].forEach(([tag, heavy, re]) =>
    capHtml(
      'event-' + tag,
      until(() => {
        S.nerve = S.nerveMax;
        const h = EVENT_DO.bones(heavy);
        return re.test(h) && h;
      }, 600)
    )
  );
  capHtml(
    'event-wedding-cold',
    until(() => {
      const h = EVENT_DO.wedding(true);
      return !/trusts you more|доверяет вам больше/.test(h) && h;
    })
  );
  S.tenor.dust = S.day;
  capHtml('dust', dustAtDawn() + bi(...tenorDawn()));
  S.tenor.dust = null;
  S.strikeDay = S.day;
  S.slotsToday = 2;
  capHtml('strike-light', bi(...tenorDawn()));
  S.strikeDay = null;
  S.slotsToday = RULES.start.slots;
  // the season's moods: their nights, first lights and turns, the season's course, and growing used to the horrors
  Object.keys(TENOR.moods).forEach(m =>
    capHtml(
      'tenor-' + m,
      ['night', 'dawn', 'turn']
        .flatMap(k => TENOR_SAY[k][m])
        .concat([TENOR_SAY.arrival[m], TENOR_SAY.name[m]])
        .map(l => bi(l[0], l[1]))
        .join('|')
    )
  );
  {
    const keepLog = S.tenor.log;
    S.tenor.log = [{ day: 1, mood: 'still' }];
    capHtml('tenor-story-one', bi(...tenorStory()));
    S.tenor.log = [
      { day: 1, mood: 'uneasy' },
      { day: 3, mood: 'haunted' },
      { day: 5, mood: 'tongues' }
    ];
    capHtml('tenor-story', bi(...tenorStory()));
    S.tenor.log = keepLog;
    const keepMood = S.tenor.mood,
      keepNumb = TENOR.numb;
    S.tenor.mood = 'haunted';
    TENOR.numb = 99;
    capHtml('numb', horrorCost(1));
    TENOR.numb = keepNumb;
    S.tenor.mood = keepMood;
    S.nerve = S.nerveMax;
  }
  // the social layer's rarer turns
  const people = S.order.map(C),
    pretender = people.find(c => c.role === 'bystander');
  S.claim[pretender.id] = { role: 'seer', why: 'liked', said: 1, recanted: null };
  capHtml(
    'confession',
    until(() => {
      S.claim[pretender.id].recanted = null;
      return inquiryConfession() || (S.inqConf = null);
    })
  );
  const dec = people.find(c => c.role === 'cult'),
    rival = people.find(c => c.role === 'seer');
  S.temper[dec.id] = 'calculating';
  S.claim[dec.id] = { role: 'seer', why: 'deceit', said: 1, recanted: null };
  S.claim[rival.id] = { role: 'seer', why: 'truth', said: 1, recanted: null };
  capHtml(
    'retreat',
    until(() => {
      S.claim[dec.id].recanted = null;
      S.claim[dec.id].role = 'seer';
      return morningConfession(dec); // (the cult drops a false part in the same words as anyone)
    })
  );
  people.forEach(c => {
    c.rapport = 2;
  });
  S.like[people[1].id][people[2].id] = 2;
  S.like[people[2].id][people[1].id] = 2;
  ripple(people[2], 'pressed');
  ripple(people[3], 'confided');
  capHtml(
    'rumours',
    until(() => {
      S.pending = [
        { day: 1, kind: 'pressed', about: people[2].id },
        { day: 1, kind: 'confided', about: people[3].id }
      ];
      return rumorsOfYou();
    })
  );
  capHtml(
    'gossip-you',
    until(() => gossipAboutYou())
  );
  capHtml(
    'gossip',
    until(() => breakfastGossip())
  );
  people.forEach(c => {
    S.temper[c.id] = 'suspicious';
  });
  capHtml(
    'blame',
    until(() => breakfastBlame())
  );
  // the thief who saw it, now and then saying so aloud at breakfast
  {
    const th = people.find(c => c.role === 'smuggler'),
      seenOne = people.find(c => c.role === 'cult'),
      keepW = S.witness,
      keepT = S.witnessTold;
    S.witness = [{ night: 1, actor: seenOne.id, real: seenOne.id, loc: 'canal' }];
    S.witnessTold = null;
    capHtml(
      'blame-thief-aloud',
      until(() => {
        const h = breakfastBlame();
        return h && h.includes(th.short) && h.includes(seenOne.short) && h;
      }, 2000)
    );
    S.witness = keepW;
    S.witnessTold = keepT;
  }
  // a quarrel that flares up again at breakfast; a pretender owning up to you alone before breakfast
  {
    const [a, b] = people.filter(c => c.role !== 'cult'),
      keepFeud = TENOR.feud,
      keepAside = RULES.confess.aside;
    TENOR.feud = 1;
    S.tenor.feud = [a.id, b.id];
    capHtml('feud', feudAgain());
    TENOR.feud = keepFeud;
    RULES.confess.aside = 1;
    capHtml(
      'confession-aside',
      until(() => {
        S.claim[pretender.id] = { role: 'seer', why: 'liked', said: 1, recanted: null };
        return morningConfession(pretender);
      })
    );
    RULES.confess.aside = keepAside;
  }
  // public moments: each tried until it moves someone, so the recorded scene shows what it can do
  const moved = h => /class="(loss|gain|stir)"/.test(h) && h;
  const [p0, p1, p2, p3] = people.filter(c => c.role !== 'cult');
  people.forEach(c => {
    S.like[c.id][p0.id] = 2;
    c.rapport = 1;
  });
  capHtml(
    'called-out',
    until(() => moved(stir('calledOut', { about: p0.id })))
  );
  capHtml(
    'called-out-thief',
    until(() => moved(stir('calledOut', { about: p1.id, thief: true })))
  );
  capHtml(
    'praised',
    until(() => moved(stir('praised', { about: dec.id })))
  );
  S.confidedIn.push(p0.id);
  capHtml(
    'grief',
    until(() => moved(stir('grief', { about: p0.id })))
  );
  capHtml(
    'slept-watch',
    until(() => moved(failedWatch(p2.id)))
  );
  capHtml(
    'dreamt',
    until(() => moved(dreamAloud(p1.id, p2.id, true)))
  );
  S.sus[p3.id][p2.id] = 2;
  capHtml(
    'dreamt-clean',
    until(() => moved(dreamAloud(p1.id, p2.id, false)))
  );
  // what a guilty dream told aloud may draw: a clean dream for the cult's own, a dream in answer (the camp distrusting
  // it, the more for a first dream aloud), a part claimed on the spot, and the three ways of calling it a lie
  {
    const keepClaims = { ...RULES.claims },
      keepTemper = { ...S.temper },
      keepClaim = { ...S.claim[p3.id] };
    capHtml('answer-for-other', answerWith(dec, { t: p2, cult: false }, p1, true));
    capHtml(
      'answer-first',
      until(() => moved(answerWith(p2, { t: p1, cult: true }, p1, false)))
    );
    capHtml(
      'answer-again',
      until(() => moved(answerWith(p2, { t: p1, cult: true }, p1, false)))
    );
    Object.assign(RULES.claims, { defend: 0, counterTrue: 0, counterSpot: 10, retort: 0 });
    const by = people.find(c => c.role === 'bystander' && c.id !== pretender.id && c.id !== p1.id),
      keepBy = { ...S.claim[by.id] };
    S.temper[by.id] = 'liar';
    capHtml(
      'answer-on-the-spot',
      until(() => {
        S.claim[by.id] = { role: 'none', why: 'truth', said: 1, recanted: null };
        by.dreamt = null;
        return answerDream(p1, { t: by, cult: true });
      })
    );
    capState('answer-on-the-spot', S.claim[by.id]);
    S.claim[by.id] = keepBy;
    Object.assign(RULES.claims, { counterSpot: 0, retort: 10 });
    ['suspicious', 'calculating', 'honest'].forEach(k => {
      S.temper[p3.id] = k;
      S.claim[p3.id] = { role: 'none', why: 'truth', said: 1, recanted: null };
      capHtml('retort-' + k, answerDream(p1, { t: p3, cult: true }));
    });
    Object.assign(RULES.claims, keepClaims);
    Object.assign(S.temper, keepTemper);
    S.claim[p3.id] = keepClaim;
  }
  capHtml(
    'confessed',
    until(() => moved(stir('confessed', { about: p3.id })))
  );
  people.forEach(c => {
    S.sus[c.id][p1.id] = 1;
  });
  capHtml(
    'proven',
    until(() => {
      S.said = [{ day: 2, by: p1.id, about: dec.id, verdict: 'cult', how: 'dream', settled: false }];
      return moved(settleSaid(dec.id));
    })
  );
  capHtml(
    'disproven',
    until(() => {
      S.said = [{ day: 2, by: p1.id, about: p2.id, verdict: 'cult', how: 'blame', settled: false }];
      return moved(settleSaid(p2.id));
    })
  );
  // what people say of their own feelings, and the light touch of flirtation
  const woman = people.find(c => c.p === 'she'),
    man = people.find(c => c.p === 'he' && !VOWS.includes(c.id));
  S.flirt[woman.id].you = true;
  S.flirt[man.id][woman.id] = true;
  S.like[man.id][woman.id] = 2;
  woman.rapport = 2;
  capHtml(
    'feel',
    until(() => feelRemark(man) && feelRemark(man).text)
  );
  capHtml(
    'flirt-gossip',
    until(() => (flirtGossip(p3, [man.id]) || {}).text)
  );
  capHtml(
    'flirt-greeting',
    until(() => (g => g.face === 'coy' && g.text)(greeting(woman)))
  );
  capHtml('flirt-parting', pick(FLIRT_PARTING)(woman));
  // a friend's sighting, unasked
  // (last night's: the night before this day)
  S.nights[S.day - 1] = S.nights[S.day - 1] || { claim: {}, saw: {}, truth: {} };
  S.nights[S.day - 1].saw[p3.id] = { who: dec.id, cat: 'ash', where: 'trench' };
  p3.rapport = 2;
  capHtml(
    'volunteer',
    until(() => volunteerSighting())
  );
  // the thief as witness: his hints, and the one he names
  const thief = people.find(c => c.role === 'smuggler');
  S.witness = [{ night: 1, actor: dec.id, loc: 'canal' }];
  S.witnessTold = null;
  capHtml('thief-hint', (h => h.them + ' ' + h.note)(thiefHint(thief, S.witness[0])));
  capHtml('thief-gossip', thiefGossip(thief, S.witness[0]).text);
  capHtml('thief-names', thiefNames(thief));
  // horrors outside the tomb, in each of their degrees; the scorched circle; every way the power's signs are told
  const keepDread = { ...RULES.dread },
    keepNight = RULES.night.riteNote;
  RULES.dread.base = 1;
  RULES.dread.here = 0.5;
  RULES.night.riteNote = 1;
  [1, 5, 9].forEach((d, t) => {
    S.doom = d;
    capHtml('dread-' + t, dreadNow('trench') + dreadNow('camp') + dreadNight());
    capHtml('rite-' + t, riteNote());
  });
  Object.assign(RULES.dread, keepDread);
  RULES.night.riteNote = keepNight;
  S.doom = 3;
  S.nerve = S.nerveMax;
  capHtml('omens', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(() => omenP(nextOmen())).join(''));
  // the cult's craft: an innocent's trace laid at the scene, and seen for what it is; a careless night; a slip of the tongue
  const actor = people.find(c => c.role === 'cult'),
    framed = people.find(c => c.role === 'bystander'),
    keepCraft = { ...CRAFT[temperOf(actor)] };
  Object.assign(CRAFT[temperOf(actor)], { plant: 1, sloppy: 0, blurt: 1 });
  const keepTrace = RULES.night.smugglerTrace,
    keepStray = RULES.night.strayTrace;
  Object.assign(RULES.night, { smugglerTrace: 0, strayTrace: 0 }); // (the cult's own night, no one else's trace)
  S.loc = 'trench';
  capHtml('planted-night', leaveTrace({ cult: [actor], target: p3.id, loc: 'trench', smugOut: false }));
  const keepExamine = RULES.examine.odds,
    keepMisread = RULES.examine.misread,
    keepUnder = RULES.cunning.underneath;
  Object.assign(RULES.examine, { odds: 1, misread: 0 }); // (seen through, and the real trace beneath it)
  RULES.cunning.underneath = 1;
  until(() => {
    S.crime.examined = false;
    S.clues.forEach(cl => {
      if (cl.source === 'plant') cl.status = 'unverified';
    });
    doExamine();
    return /class="trace"[^]*class="trace"/.test(S_ui.scene.body.join('')) && S_ui.scene.body;
  });
  cap('planted-seen');
  Object.assign(RULES.examine, { odds: keepExamine, misread: keepMisread });
  RULES.cunning.underneath = keepUnder;
  Object.assign(CRAFT[temperOf(actor)], { plant: 0, sloppy: 1 });
  capHtml('sloppy-night', leaveTrace({ cult: [actor], target: p3.id, loc: 'canal', smugOut: false }));
  Object.assign(RULES.night, { smugglerTrace: keepTrace, strayTrace: keepStray });
  S.claims = S.claims.filter(x => !(x.id === actor.id && x.night === S.day - 1));
  S.nights[S.day - 1] = { crimeLoc: 'canal', actor: actor.id, truth: {}, claim: {}, saw: {}, target: p3.id };
  p3.status = 'taken';
  capHtml('blurt', (r => r.them + ' ' + r.note)(DIALOG.night.run(actor)));
  p3.status = 'present';
  Object.assign(CRAFT[temperOf(actor)], keepCraft);
  // faces: a flirtatious joke, and the faces of flirting
  capHtml(
    'joke',
    until(() => {
      const g = greeting(C('constance'));
      return JOKES.has(g.text.replace(/[\u0001\u0002]/g, '')) && g.face !== 'neutral' && g.text + `<!-- ${g.face} -->`;
    })
  );
  // inquiries the camp backs (everyone outside the cult sides with you): against an innocent, the smuggler, a cultist
  S.slot = 2;
  S.loc = 'camp';
  const keepV = { ...RULES.verdict };
  RULES.verdict.back = -99;
  const inno = freeChars().find(c => c.role === 'bystander');
  inquiryScene();
  cap('inquiry');
  accuse(inno.id);
  cap('accuse-innocent');
  const smug = freeChars().find(c => c.role === 'smuggler');
  S.inquiryDone = false;
  S.anger = 0;
  accuse(smug.id);
  cap('accuse-smuggler');
  const cult1 = freeChars().find(c => c.role === 'cult');
  S.inquiryDone = false;
  S.anger = 0;
  accuse(cult1.id);
  cap('accuse-cult');
  // the camp's mood at an inquiry: restless, and nearly out of patience
  [2, 3].forEach(a => {
    S.anger = a;
    S.inquiryDone = false;
    inquiryScene();
    cap('inquiry-anger-' + a);
  });
  // inquiries the camp refuses (everyone outside the cult speaks against it): on nothing at all, on a case (each way it
  // is said), after an innocent was sent away; then once too often, and the camp walks out
  RULES.verdict.back = 99;
  RULES.verdict.against = 99;
  const doubted = freeChars().find(c => c.role !== 'cult'),
    keepKnown = doubted.known,
    keepAccused = S.log.accused,
    refuse = tag => {
      S.inquiryDone = false;
      S.anger = 0;
      S.walkout = null;
      S.nerve = S.nerveMax;
      accuse(doubted.id);
      cap(tag);
    };
  S.testimony = S.testimony.filter(t => t.about !== doubted.id);
  doubted.known = {};
  S.log.accused = [];
  refuse('refused-nothing');
  doubted.known = keepKnown;
  addTest(freeChars().find(c => c.id !== doubted.id).id, doubted.id, 'distrust', '');
  S.stats.taken = Math.max(1, S.stats.taken);
  // (each way it is said, in either language)
  [/Not on that|Не на этом основании/, /buried enough|довольно хоронили/].forEach(w =>
    until(() => {
      refuse('refused-case');
      return w.test(q('#sceneText').textContent) || (caps.pop() && false);
    })
  );
  S.log.accused = keepAccused;
  refuse('refused-after-wrong');
  // (now and then the one accused in vain half understands)
  until(() => {
    refuse('refused-forgiven');
    return /some time before|Пройдёт немало времени/.test(q('#sceneText').textContent) || (caps.pop() && false);
  }, 600);
  // (an angry camp walks out at a chance: tried until it does)
  until(() => {
    S.inquiryDone = false;
    S.walkout = null;
    S.strikeDay = null;
    S.anger = RULES.verdict.walkoutFrom + 4;
    S.nerve = S.nerveMax;
    accuse(doubted.id);
    return S.walkout;
  });
  cap('walkout');
  capHtml('strike-dawn', strikeAtDawn());
  goTo('camp');
  cap('camp-after-walkout');
  S.walkout = null;
  S.strikeDay = null;
  S.anger = 0;
  Object.assign(RULES.verdict, keepV);
  // the evening after an inquiry that came to nothing: the camp is tired of them
  {
    const keepInq = S.inquiries;
    S.inquiries = [{ day: S.day - 1, id: doubted.id, back: [], against: [], silent: [], passed: false }];
    S.inquiryDone = false;
    capHtml('inquiry-weary', angerSay());
    S.inquiries = keepInq;
  }
  // the night's dead: the power's touch; the cult's hand, anywhere and in one place only; with and without its signature
  const dead = freeChars().find(c => c.role !== 'cult'),
    finder = freeChars().find(c => c.id !== dead.id);
  [
    ['body', 0, null],
    ['hand', 1, 2],
    ['at:canal', 0, null],
    ['at:ziggurat', 1, null] // (bricked up: no signature goes with a body walled in)
  ].forEach(([kind, k, sign], i) =>
    capHtml(
      `death-${kind}-${k}`,
      deathText(dead, kind.startsWith('at:') ? kind.slice(3) : 'trench', { kind, k, mark: i % 3, f: finder.id, open: i * 2, sign })
    )
  );
  // every way each power takes its own
  const keepAsp = S.aspectOf[S.patron];
  Object.keys(DEATH_BODY).forEach(asp => {
    S.aspectOf[S.patron] = asp;
    DEATH_BODY[asp].forEach((t, k) =>
      capHtml(`taken-${asp}-${k}`, deathText(dead, 'trench', { kind: 'body', k, f: finder.id, open: k % DEATH_FOUND.length, sign: null }))
    );
  });
  S.aspectOf[S.patron] = keepAsp;
  // the casebook played hardcore: the bare record, nothing joined up; and an inquiry without the case words
  S.hardcore = true;
  cap('hardcore-casebook');
  S.inquiryDone = false;
  inquiryScene();
  cap('hardcore-inquiry');
  S.hardcore = false;
  // one of the cult kills another, to turn your eyes away (and once is driven off); the truth of it, told at the end
  {
    const [k1, k2] = S.order.map(C).filter(c => c.role === 'cult'),
      keep = {
        st: [k1.status, k2.status],
        known: k1.known,
        test: S.testimony,
        sights: S.sights,
        claims: S.claims,
        ref: S.log.refusedInq,
        day: S.day,
        al: S.alerted,
        fg: S.falseGuard,
        b: RULES.night.betray
      };
    k1.status = k2.status = 'present';
    k1.known = {};
    S.testimony = S.testimony.filter(t => t.about !== k1.id);
    S.sights = [];
    S.claims = [];
    S.order.forEach(id => S.sus[id] && (S.sus[id][k1.id] = 0));
    S.log.refusedInq = [{ id: k2.id, day: 1 }];
    S.day = Math.max(2, S.day);
    S.alerted = false;
    S.falseGuard = null;
    RULES.night.betray = 99;
    const night = saved => {
      k2.status = 'present';
      const n = { cult: [k1, k2], npcs: freeChars().filter(c => c.role !== 'cult'), loc: 'canal' };
      n.target = chooseVictim(n);
      if (n.target !== k2.id || n.betrayer !== k1.id) return null;
      n.guard = saved ? k2.id : null;
      return attackOnThem(n) + leaveTrace(n);
    };
    capHtml(
      'betrayal-saved',
      until(() => night(true))
    );
    capHtml(
      'betrayal',
      until(() => night(false))
    );
    capHtml(
      'betrayal-truth',
      betrayalLines()
        .map(l => bi(l[0], l[1]))
        .join(' ') +
        '|' +
        fateText(k2) +
        '|' +
        fateText(k1)
    );
    S.betrayals = [];
    [k1.status, k2.status] = keep.st;
    k1.known = keep.known;
    S.testimony = keep.test;
    S.sights = keep.sights;
    S.claims = keep.claims;
    S.log.refusedInq = keep.ref;
    S.day = keep.day;
    S.alerted = keep.al;
    S.falseGuard = keep.fg;
    RULES.night.betray = keep.b;
  }
  // a night with the rite complete: the gate opens early
  S.slot = 2;
  S.slotsToday = 3;
  S.doom = S.doomMax;
  nightfall();
  cap('early-night');
  finaleIntro(true);
  cap('finale-early');
  // who comes: two offer before they are asked; one will not come for you, one is too afraid, one comes out of duty
  const keepD = { ...RULES.descent };
  RULES.descent.volunteerFriend = [1, 1, 1];
  RULES.descent.afraid = 1;
  RULES.descent.duty = 1;
  S.order
    .map(C)
    .filter(c => c.role !== 'cult')
    .forEach(c => {
      c.status = 'present'; // (whatever the scenes above did to them: everyone outside the cult is asked)
    });
  freeChars().forEach(c => {
    c.rapport = c.role === 'cult' ? 1 : 0;
  });
  const keen = freeChars().find(c => c.role !== 'cult');
  keen.rapport = 2;
  choose(new RegExp(GODS[S.gods[1]].name + '|' + ru.god(S.gods[1]))); // (one of the season's four)
  cap('companions');
  const others = freeChars().filter(c => !S.fin.offered.includes(c.id) && c.role !== 'cult');
  const [sour, afraid, dutiful] = others;
  sour.rapport = -2;
  choose(new RegExp(sour.name + '|' + ru.cf(sour, 'a')));
  cap('refused');
  if (afraid) {
    choose(new RegExp(afraid.name + '|' + ru.cf(afraid, 'a')));
    cap('afraid');
  }
  if (dutiful) {
    dutiful.rapport = -1;
    S.temper[dutiful.id] = 'honest';
    S.fin.comp = [];
    choose(new RegExp(dutiful.name + '|' + ru.cf(dutiful, 'a')));
    cap('duty');
  }
  Object.assign(RULES.descent, keepD);
  // every way of saying no, or yes after all
  const asked = people.find(c => c.role !== 'cult'),
    foe = people.find(c => c.id !== asked.id);
  capHtml(
    'come-say',
    [
      { ok: false, why: 'you' },
      { ok: false, why: 'foe', foe },
      { ok: false, why: 'afraid' },
      { ok: false, why: 'afraid' },
      { ok: true, why: 'duty' },
      { ok: true, why: 'grit', foe }
    ]
      .map(w => comeSay(asked, w))
      .join('') + OFFER_SAY.map(f => f(asked)).join('')
  );
  const cult2 = freeChars().find(c => c.role === 'cult'),
    loyalOne = freeChars().find(c => c.role !== 'cult' && c.id !== sour.id);
  loyalOne.rapport = 2;
  S.fin.comp = [cult2.id, loyalOne.id];
  S.nerve = S.nerveMax - 3; // two lamps behind you steady you a little
  S.wounds = 0;
  gate1();
  cap('gate1');
  choose(/slowly|медленно/);
  cap('step1');
  S_ui.scene.choices[0].fn();
  cap('between-early');
  S_ui.scene.choices[0].fn();
  cap('between-early-result');
  const keepPatient = CRAFT[temperOf(cult2)].patient;
  CRAFT[temperOf(cult2)].patient = 0;
  S_ui.scene.choices[0].fn();
  cap('gate2-traitor');
  CRAFT[temperOf(cult2)].patient = keepPatient;
  S_ui.scene.choices[0].fn();
  cap('gate2-result');
  // on to the seventh gate, through whatever waits between, each scene as it comes
  for (let n = 1; n <= 8 && !/seventh gate|Седьмые врата/.test(X(S_ui.scene.title)); n++) {
    S.nerve = S.nerveMax;
    S.wounds = 0;
    S_ui.scene.choices[0].fn();
    cap('between-late-' + n);
  }
  if (!withYou().includes(loyalOne.id)) {
    S.fin.left = S.fin.left.filter(id => id !== loyalOne.id); // (still with you, to hold the gate)
    gate3();
  }
  cap('gate3');
  choose(/hold the gate|удержать врата/);
  cap('stepped');
  S_ui.scene.choices[0].fn();
  cap('sanctum');
  S.fin.tries = 0;
  finalAct(0, 'ward');
  cap('it-fails');
  // the desperate acts, failing: a shot that does not matter, a fire that goes out
  [
    ['shoot', { kind: 'shoot', id: S.hierophant }],
    ['fire', { kind: 'fire' }]
  ].forEach(([k, act]) => {
    S.fin.tries = 0;
    S.nerve = S.nerveMax;
    S.wounds = 0;
    S.fin.acts.push(act);
    finalAct(0, k);
    cap('it-fails-' + k);
  });
  // nothing left to try: no charm, no name, the revolver lost and the braziers spent
  const keepItems = S.items.slice(),
    keepNamed = S.fin.named;
  S.items = [];
  S.fin.named = null;
  S.fin.tries = 1;
  S.ended = null;
  C(S.hierophant).status = 'present'; // (one of the cult in the circle still, to watch finish it)
  S.fin.heldBack = [];
  sanctum();
  cap('sanctum-nothing-left');
  {
    // with nothing left to try, the rite breaks of itself on its last line
    const keepD = JSON.parse(JSON.stringify(RULES.descent));
    RULES.descent.falters = 1;
    choose(/nothing left to try|Больше нечего пробовать/);
    cap('nothing-left-falters');
    S.ended = null;
    // an empty circle, and the power that finishes the rite itself; then the empty hall, each way it came to be empty
    const keepHeld = S.fin.heldBack,
      keepTurn = S.fin.turnDone,
      cultIds = S.order.filter(id => C(id).role === 'cult');
    S.fin.heldBack = freeCult().map(c => c.id);
    S.fin.turnDone = true;
    RULES.descent.emptied = 0;
    sanctum();
    cap('empty-circle-doom');
    S.ended = null;
    S.fin.heldBack = keepHeld;
    S.fin.turnDone = keepTurn;
    capHtml(
      'emptied-ways',
      [
        { caught: cultIds[0], heldBack: [], stayedAway: [] },
        { caught: null, heldBack: [cultIds[0]], stayedAway: [] },
        { caught: null, heldBack: [cultIds[0]], stayedAway: [cultIds[0]] },
        { caught: null, heldBack: [], stayedAway: [] }
      ]
        .map(w => {
          const keep = { caught: S.fin.caught, heldBack: S.fin.heldBack, stayedAway: S.fin.stayedAway };
          Object.assign(S.fin, w);
          const h = endStory('emptied').join('');
          Object.assign(S.fin, keep);
          return h;
        })
        .join(' | ')
    );
    capHtml('falter-story', endStory('scarred', 'falter').join(''));
    Object.assign(RULES.descent, keepD);
  }
  S.items = keepItems;
  S.fin.named = keepNamed;
  // the wrong charm, and the rite broke all the same (RULES.descent.wrongWard): the ending and the debrief, with a
  // charm that is two (the clay figures) when it can be
  {
    const wrongIt = ['figures'].concat(S.charms).find(w => S.godOfWard[w] !== S.patron),
      r = endReckon();
    S.fin.acts = [{ kind: 'ward', it: wrongIt, ok: true }];
    ['sealed', 'scarred'].forEach(id => capHtml('lucky-' + id, endStory(id, 'ward').join('') + endFactors(id, r, 0, true)));
  }
  S.fin.acts = [];
  gain('revolver');
  // everything that waits between the gates, and every choice there (each from the same starting point)
  S.fin.comp = [loyalOne.id];
  S.fin.left = [];
  ['torch'].concat(S.charms.slice(0, 2)).forEach(gain);
  Object.keys(BELOW).forEach(k => {
    const E = BELOW[k];
    capHtml('below-' + k, E.text(GATE_N[2]));
    E.choices().forEach((ch, i) => {
      S.nerve = S.nerveMax;
      S.wounds = 0;
      S.fin.left = [];
      ['torch'].concat(S.charms.slice(0, 2)).forEach(gain);
      capHtml(`below-${k}-${i}`, ch.label + ' · ' + ch.sub + ' → ' + ch.go().html);
    });
  });
  // and below, nothing is sure either: the winged bull and the pool mistaken, the dead and the clay with nothing to
  // tell, Crane's notebook blank, a faltering companion who will not come on, or will not go back; the pool with no name
  {
    const keepB = JSON.parse(JSON.stringify(RULES.below)),
      reset = () => {
        S.nerve = S.nerveMax;
        S.wounds = 0;
        S.fin.left = [];
        S.fin.comp = [loyalOne.id];
        ['torch'].concat(S.charms.slice(0, 2)).forEach(gain);
        gain(S.wardOf[S.patron]);
      },
      play = (k, i) => {
        reset();
        return BELOW[k].choices()[i].go().html;
      };
    Object.assign(RULES.below, { truthful: 0, comesOn: [0, 0], goesBack: 0, learn: 0, satchelLine: 0 });
    S.fin.named = S.patron;
    capHtml('bull-errs', play('lamassu', 0));
    capHtml(
      'pool-lies',
      until(() => (h => /shakes its head|качает головой/.test(X(h)) && h)(play('pool', 0)))
    );
    capHtml('falter-stays', play('falter', 0));
    capHtml('falter-will-not-go', play('falter', 1));
    // (and with a second companion still beside you: you go on without the one who stays, not alone)
    const two = k => {
      reset();
      S.fin.comp = [loyalOne.id, freeChars().find(c => c.role !== 'cult' && c.id !== loyalOne.id).id];
      return BELOW.falter.choices()[k].go().html;
    };
    capHtml('falter-stays-two', two(0));
    capHtml('falter-will-not-go-two', two(1));
    capHtml('dead-tell-nothing', ['bread', 'voices', 'scribe'].map(k => play(k, 0)).join(' | '));
    capHtml(
      'satchel-blank',
      until(() => (h => /blank|пусты/.test(X(h)) && h)(play('bones', 0)))
    );
    S.fin.named = null;
    capHtml(
      'pool-unnamed',
      until(() => (h => /shrugs|пожимает/.test(X(h)) && h)(play('pool', 0)))
    );
    Object.assign(RULES.below, keepB);
    reset();
  }
  {
    // two went down, one stayed behind at the voices: the other falters, and sending them back leaves you alone
    const second = freeChars().find(c => c.role !== 'cult' && c.id !== loyalOne.id);
    S.fin.comp = [second.id, loyalOne.id];
    S.fin.left = [second.id];
    capHtml('below-falter-left', BELOW.falter.choices()[1].sub);
    S.fin.comp = [loyalOne.id];
    S.fin.left = [];
  }
  // the seventh gate will not have a thing; one left to hold it follows you through; it takes more of you than you gave
  {
    const keepG7 = { ...RULES.descent.gate7 };
    Object.assign(RULES.descent.gate7, { refuse: 1, small: 1, follow: 1, more: 1 });
    S.fin.spurned = [];
    S.fin.comp = [loyalOne.id];
    S.fin.left = [];
    gain('torch');
    S.nerve = S.nerveMax;
    gate3();
    S_ui.scene.choices[0].fn();
    cap('gate7-spurned');
    choose(/hold the gate|удержать врата/);
    cap('gate7-followed');
    S.fin.spurned = [];
    gate3();
    choose(/part of yourself|часть себя/);
    cap('gate7-more');
    Object.assign(RULES.descent.gate7, keepG7);
    S.fin.spurned = [];
    S.nerve = S.nerveMax;
  }
  // a traitor who waited, at the very end, with the true ward in your pocket
  const patient = freeChars().find(c => c.role === 'cult') || C(S.hierophant);
  patient.status = 'present';
  S.fin.comp = [patient.id];
  S.fin.turnDone = false;
  S.fin.patient = patient.id;
  S.fin.tries = 0;
  gain(S.wardOf[S.patron]);
  const keepSteal = RULES.descent.steal,
    keepTurn = RULES.descent.turn;
  Object.assign(RULES.descent, { steal: 1, turn: 1 }); // (it takes its place, whatever the dice: this is the scene recorded)
  S.nerve = S.nerveMax;
  S.wounds = 0;
  sanctum();
  cap('sanctum-turned');
  Object.assign(RULES.descent, { steal: keepSteal, turn: keepTurn });
  // the other of the cult, taking its place in the circle: one who offered to come down, and one you asked
  const other = S.order.map(C).find(c => c.role === 'cult' && c.id !== S.hierophant);
  if (other)
    [true, false].forEach(offered => {
      other.status = 'present';
      S.fin.comp = [other.id];
      S.fin.offered = offered ? [other.id] : [];
      S.fin.turnDone = false;
      S.fin.patient = null;
      S.fin.tries = 0;
      const keepTurn = RULES.descent.turn;
      RULES.descent.turn = 1;
      sanctum();
      cap(`sanctum-turned-${offered ? 'offered' : 'asked'}`);
      RULES.descent.turn = keepTurn;
    });
  // the fates: a woman who loves you, two of the camp who leave together, one who mourns; and what becomes of you
  const her = people.find(c => c.p === 'she');
  her.status = 'present';
  S.flirt[her.id].you = true;
  her.rapport = 3;
  const keepR = { ...RULES.flirt.romance };
  Object.assign(RULES.flirt.romance, { you: [1, 1], pair: 1, mourn: 1 });
  const him = people.find(c => c.p === 'he' && c.role !== 'cult' && !VOWS.includes(c.id) && c.id !== her.id),
    she2 = people.find(c => c.p === 'she' && c.id !== her.id);
  [him, she2].forEach(c => {
    c.status = 'present';
  });
  S.flirt[him.id][she2.id] = true;
  S.flirt[she2.id][him.id] = true;
  S.like[him.id][she2.id] = 2;
  S.like[she2.id][him.id] = 2;
  S.romance = romances();
  capHtml('fates', endAfter('sealed', true));
  Object.assign(RULES.flirt.romance, keepR);
  [
    [0, 9],
    [0, 1],
    [1, 9],
    [2, 9]
  ].forEach(([w, n], i) => {
    S.wounds = w;
    S.log.minNerve = n;
    capHtml('you-' + i, endSelf(endReckon()));
  });
  // what the dig's own dangers left you with, wherever they found you (every place a peril can happen, and the heat)
  capHtml(
    'you-peril',
    Object.keys(PERILS)
      .map(k => FATE_YOU_CODA.peril.home[0](k))
      .map(t => `<p>${bi(...t)}</p>`)
      .join('')
  );
  // nothing is certain: a scribe's error in the lines you read, a bowl that breaks and holds nothing, a press that
  // costs nothing between you, and one of the cult who will not go to the circle
  {
    const i = S.facts.findIndex(f => f.form === 'gname');
    S.facts[i] = scribeErr(S.facts[i]);
    S.factKnown = [i];
    capHtml('scribe-said', scribeSaid());
    const keepNight = { ...RULES.night };
    Object.assign(RULES.night, { watched: 0, bowl: 0, revolver: 0 });
    gain('bowl');
    capHtml('bowl-fails', attackOnYou({ guard: null, watcher: null }));
    // you wake in time; someone else is spared by luck; a scene swept clean
    RULES.night.spared = 1;
    capHtml('woke', attackOnYou({ guard: null, watcher: null }));
    const spare = people.find(c => c.role !== 'cult' && isFree(c)),
      cultAny = people.find(c => c.role === 'cult');
    capHtml('spared', attackOnThem({ target: spare.id, guard: null, loc: 'canal', betrayer: null }));
    Object.assign(RULES.night, { spared: 0, swept: 1 });
    capHtml('swept', leaveTrace({ cult: [cultAny], target: spare.id, loc: 'canal', smugOut: false }));
    Object.assign(RULES.night, keepNight);
    // a watch sworn and broken: owned up to, denied, or not spoken of
    const keepSlept = RULES.claims.slept[temperOf(spare)];
    [
      ['own', [1, 0]],
      ['deny', [0, 1]],
      ['avoid', [0, 0]]
    ].forEach(([k, odds]) => {
      RULES.claims.slept[temperOf(spare)] = odds;
      capHtml('slept-' + k, failedWatch(spare.id));
    });
    RULES.claims.slept[temperOf(spare)] = keepSlept;
    // a sign that was not the power's, and a habit that was only that day's, as the ending tells them
    const keepStray = PUZ.stray,
      keepMisnote = RULES.day.misnote;
    PUZ.stray = 1;
    capHtml('stray-sign', omenP(nextOmen()) + strayOmensSaid());
    PUZ.stray = keepStray;
    const noted = people.find(c => unknownCats(c).length),
      keepKnown = { ...noted.known };
    RULES.day.misnote = 1;
    capHtml('misnoted', reveal(noted) + misnotedSaid());
    RULES.day.misnote = keepMisnote;
    noted.known = keepKnown;
    // the doctor: a wound seen to, and one that will not mend the sooner for it
    const keepScale = { ...RULES.scale };
    S.wounds = 2;
    RULES.scale.graze = 0;
    capHtml('doctor-heals', EVENT_DO.doctor(false));
    RULES.scale.graze = 1;
    capHtml(
      'doctor-dressings',
      until(() => {
        S.wounds = 2;
        const h = EVENT_DO.doctor(false);
        return S.wounds === 2 && h;
      })
    );
    Object.assign(RULES.scale, keepScale);
    S.wounds = 0;
    // nothing is certain, in what people say and do: each rare turn forced, and the ending's account of them
    const R0 = JSON.parse(JSON.stringify(RULES)),
      restore = () => Object.keys(R0).forEach(k => (typeof R0[k] === 'object' ? Object.assign(RULES[k], R0[k]) : (RULES[k] = R0[k]))),
      inn = people.find(c => c.role === 'bystander' && isFree(c)) || people.find(c => c.role !== 'cult' && c.role !== 'smuggler'),
      thiefP = people.find(c => c.role === 'smuggler'),
      cultP = people.find(c => c.role === 'cult'),
      seerP = people.find(c => c.role === 'seer'),
      glosser = people.find(c => GLOSSERS.includes(c.id) && c.role !== 'cult') || C('anselm');
    [inn, thiefP, cultP, seerP, glosser].forEach(c => {
      c.status = 'present';
      c.rapport = 1;
    });
    Object.assign(RULES.talk, { falseSlip: 1, falseSlipThief: 1 });
    capHtml(
      'false-slip',
      until(() => (r => /mid-sentence|на полуслове/.test(X(r.note || '')) && r.them + ' ' + r.note)(DIALOG.press.run(inn)))
    );
    inn.rapport = 1; // (pressing cost trust, again and again)
    RULES.talk.tipWrong = 1;
    const tipT = tipped(inn, thiefP);
    addTest(inn.id, tipT.id, 'tip', 'thief');
    capHtml('tip-wrong', tipLine(tipT));
    RULES.talk.mienWrong = 99;
    S.testimony = S.testimony.filter(t => !(t.kind === 'mien' && t.from === glosser.id));
    capHtml('mien-wrong', mienNote(glosser, 1) + mienSaid());
    Object.assign(RULES.talk, { greedOther: 99, offDay: 0 });
    gain(S.charms[0]);
    capHtml('greed-other', (r => r.them + ' ' + r.note)(DIALOG.show.run(inn, S.charms[0])));
    RULES.talk.offDay = 99;
    inn.rapport = 1;
    glosser.rapport = 1;
    capHtml(
      'off-day',
      [DIALOG.about.run(inn), DIALOG.title.run(glosser, S.titlesOf[S.gods[0]][0])].map(r => r.them + ' ' + r.note).join(' | ')
    );
    restore();
    S.claim[seerP.id] = { role: 'seer', why: 'truth', said: 1, recanted: null };
    RULES.talk.dreamTell = 0;
    capHtml('dream-kept', (r => r.them)(DIALOG.distrust.run(seerP)));
    restore();
    S.witness = [{ night: 1, actor: cultP.id, real: cultP.id, loc: 'canal' }];
    S.witnessTold = null;
    S.revealed[thiefP.id] = null;
    RULES.thief.outright = 1;
    capHtml('thief-outright', (r => r.them)(DIALOG.distrust.run(thiefP)));
    restore();
    const wardenLike = people.find(c => c.role !== 'cult' && c.id !== thiefP.id && c.id !== seerP.id) || inn;
    S.claim[wardenLike.id] = { role: 'warden', why: 'liked', said: 1, recanted: null };
    wardenLike.rapport = 2;
    RULES.talk.promise = 0;
    capHtml(
      'promise-general',
      until(() => (r => /whole camp|за всем лагерем/.test(X(r.them)) && r.them)(DIALOG.confide.run(wardenLike)))
    );
    restore();
    capHtml(
      'night-accounts',
      [
        alibiLine({ loc: 'evade', with: null }, inn),
        alibiLine({ loc: 'evade', with: null }, thiefP),
        alibiLine({ loc: 'canal', with: null, attacked: true, how: 'luck' }, inn),
        alibiLine({ loc: 'canal', with: null, attacked: true, how: 'watch' }, inn, true) +
          ' ' +
          sightLine({ loc: 'canal', with: null, attacked: true }, { who: cultP.id, cat: 'prints', where: 'canal' }, inn)
      ].join(' | ')
    );
    // a coming clean staged by the cult; the thief owning up of his own accord; one of the cult giving up the other
    S.temper[cultP.id] = 'liar';
    S.claim[cultP.id] = { role: 'none', why: 'conceal', said: 1, recanted: null };
    capHtml('staged', comeClean(cultP, 'aside') + ' · ' + claimCell(cultP));
    S.claim[thiefP.id] = { role: 'none', why: 'conceal', said: 1, recanted: null };
    capHtml('thief-owns-up', comeClean(thiefP, 'confess'));
    S.log.bus.push({ day: S.day, by: cultP.id, about: (people.find(c => c.role === 'cult' && c.id !== cultP.id) || cultP).id });
    // the night: the cult lying low; a death and an attack in another power's manner; Crane by the cult's hand
    quietNight({ cult: freeCult(), low: null });
    capHtml('quiet-night', quietSaid());
    RULES.night.manner = 0;
    capHtml('other-manner', deathText(inn, 'canal', deathHow(inn, 'canal')) + ' | ' + attackOnYou({ guard: null, watcher: null }));
    const keepCrane = S.craneHow;
    Object.assign(RULES.night, { craneTaken: 0, manner: 1 });
    S.craneHow = craneDeath();
    capHtml('crane-by-hand', craneFound());
    S.craneHow = keepCrane;
    restore();
    // the bowl: holding and whole; failing and whole
    S.wounds = 0;
    gain('bowl');
    Object.assign(RULES.night, { watched: 0, bowl: 1, bowlBreaks: 0, revolver: 0, spared: 0 });
    capHtml('bowl-whole', attackOnYou({ guard: null, watcher: null }));
    capState('bowl-whole', has('bowl'));
    RULES.night.bowl = 0;
    capHtml('bowl-silent', attackOnYou({ guard: null, watcher: null }));
    restore();
    S.wounds = 0;
    S.nerve = S.nerveMax;
    // harm in secret, the one caught at it taken for someone else
    const sour2 = people.find(c => c.role !== 'cult' && c.id !== inn.id) || inn;
    sour2.rapport = -2;
    S.temper[sour2.id] = 'suspicious';
    Object.assign(RULES.spite, { try: 99, caught: 1, wrongFace: 1 });
    capHtml('spite-wrong-face', spiteNight());
    restore();
    sour2.rapport = 0;
    S.wounds = 0;
    S.nerve = S.nerveMax;
    // the dig in camp; a scene to look at again; a fragment in two pieces
    RULES.peril.base = 99;
    capHtml('peril-camp', perilNow('camp'));
    restore();
    S.wounds = 0;
    S.nerve = S.nerveMax;
    S.crime = { loc: 'trench', clue: S.clues[0], examined: false };
    S.loc = 'trench';
    Object.assign(RULES.examine, { odds: 0, again: 1 });
    const keepEnded = S.ended;
    S.ended = null;
    doExamine();
    capHtml('examine-again', S_ui.scene.body.join(''));
    capState('examine-again', S.crime.examined);
    S.ended = keepEnded;
    RULES.search.twoFrags = 1;
    capHtml(
      'two-fragments',
      until(() => (h => /second piece|второй кусок/.test(X(h)) && h)(searchFind('store', false)))
    );
    restore();
    // the news, turning out otherwise
    S.fragments = 2;
    S.nerve = S.nerveMax - 3;
    lose('torch');
    lose('bowl');
    Object.assign(RULES.events, { shamalPasses: 1, fake: 1, satisfied: 1, garbled: 1, coffee: 0, torch: 0, bowl: 0 });
    capHtml(
      'news-otherwise',
      ['shamal', 'dealer', 'inspector', 'cable', 'coffee', 'lorry', 'dervish'].map(k => EVENT_DO[k](false)).join(' | ')
    );
    RULES.scale.graze = 1;
    capHtml(
      'rain-nothing',
      until(() => (h => /written on|надписей/.test(X(h)) && h)(EVENT_DO.rain(false)))
    );
    restore();
    S.strikeDay = S.day;
    RULES.verdict.strike = 0;
    capHtml('strike-off', strikeAtDawn());
    capState('strike-off', S.strikeDay);
    const keepDay = S.day;
    S.day = 3;
    S.walkout = 2;
    S.log.walkedOut = 2;
    RULES.verdict.relent = 1;
    capHtml('relent', relentAtDawn(false));
    capState('relent', S.walkout);
    // (and with Hamid no longer at the dig: someone else speaks for the men)
    {
      const hm = C('hamid'),
        keepSt = hm.status;
      hm.status = 'taken';
      S.walkout = 2;
      S.strikeDay = S.day;
      capHtml('relent-no-hamid', relentAtDawn(false) + strikeAtDawn());
      hm.status = keepSt;
      S.strikeDay = null;
    }
    S.day = keepDay;
    restore();
    // the ending's account of all of it, and of the season's other surprises
    capHtml('factors-uncertain', endFactors('scarred', endReckon(), 0, true) + endTruth());
    S.nerve = S.nerveMax;
    S.wounds = 0;
    const pr = people.find(c => c.role !== 'cult' && isFree(c));
    pr.rapport = 1;
    capHtml('press-nothing-lost', rebuff(pr, bi('You know more.'), pr.rapport).note);
    const cultOne = people.find(c => c.role === 'cult' && isFree(c));
    if (cultOne) {
      const keepD = { ...RULES.descent };
      RULES.descent.turn = 0;
      S.fin = { comp: [cultOne.id], left: [], acts: [], betrayed: [], turned: [], heldBack: [], tries: 0, turnDone: false };
      capHtml('held-back', turnAtTheEnd().html);
      Object.assign(RULES.descent, keepD);
    }
  }
  {
    // the last of the cult unmasked too late: the gate opens of itself
    const keepFin = S.fin,
      keepMarks = S.order.map(id => C(id).markAt),
      keepPhase = S.phase;
    finaleIntro(true, 'priestless');
    cap('priestless');
    S.fin = keepFin;
    S.order.forEach((id, i) => {
      C(id).markAt = keepMarks[i];
    });
    S.phase = keepPhase;
  }
  ['exposed', 'triumph', 'pyrrhic', 'death', 'madness', 'doom'].forEach(k => {
    S.ended = null;
    ending(k, k === 'pyrrhic' ? 'shoot' : 'ward');
    cap('ending-' + k);
  });
  // the night visit (people/visit.js): the knock; sent back; she stays, and the cult comes for her (an empty tent) or
  // for you (she screams; she dies; you die; both), or she is of the cult and strikes herself (and fails, or does it)
  Object.assign(RULES.night, { watched: 0, spared: 0, bowl: 0, revolver: 0 });
  RULES.night.low.max = 0; // (the cult does not lie low)
  Object.assign(RULES.talk, { chillCult: 1, chillOther: 1 });
  const keepVictim = window.chooseVictim;
  const visit = (tag, cult, o) => {
    const h = until(() => {
      newGame('Marlowe', 'occultist');
      const w = S.order.map(C).find(c => c.p === 'she' && (c.role === 'cult') === cult);
      if (!w) return null;
      arrivalScene();
      S.day = 2;
      S.slot = S.slotsToday;
      S.flirt[w.id].you = true;
      w.rapport = 2;
      return w;
    });
    Object.assign(RULES.visit, {
      strike: o.strike || 0,
      kills: o.kills || 0,
      through: { [o.through || 'hurt']: 1 },
      hurt: 1,
      mend: 1,
      warm: 1,
      found: o.found || 0,
      leaves: o.leaves || 0,
      talked: { [o.talked || 1]: 1 }
    });
    window.chooseVictim = night => (o.target === 'her' ? h.id : o.target === 'player' ? 'player' : keepVictim(night));
    visitScene(h);
    if (o.no) cap('visit-knock');
    choose(o.no ? /Send her back|Отправить/ : /Let her stay|Оставить/);
    cap(tag);
    window.chooseVictim = keepVictim;
  };
  visit('visit-sent-back', false, { no: true });
  visit('visit-empty-tent', false, { target: 'her', leaves: 1 });
  visit('visit-found-dead', false, { target: 'her', found: 1, talked: 2 });
  visit('visit-screams', false, { target: 'player', through: 'hurt' });
  visit('visit-her-dead', false, { target: 'player', through: 'her' });
  visit('visit-you-dead', false, { target: 'player', through: 'you' });
  visit('visit-both-dead', false, { target: 'player', through: 'both' });
  visit('visit-strikes-fails', true, { strike: 1, kills: 0 });
  visit('visit-strikes', true, { strike: 1, kills: 1 });
  // the deed (game/deed.js): the evening's offer; whom, with what, and a trace to lay; then each way the night turns, the
  // camp's judgement (kept, or sent away: the ending)
  const keepWatch = window.chooseWatch;
  const deed = (tag, o) => {
    until(() => {
      newGame('Marlowe', 'soldier');
      arrivalScene();
      Object.assign(S, { day: 3, slot: 2, slotsToday: 3 });
      return freeChars().some(c => c.role === 'smuggler') && freeChars().some(c => c.role === 'warden');
    });
    const t = o.thief ? freeChars().find(c => c.role === 'smuggler') : freeChars().find(c => c.role !== 'smuggler' && c.role !== 'warden'),
      w = freeChars().find(c => c !== t);
    w.known[CATS[0]] = w.traits[CATS[0]];
    Object.assign(RULES.deed, {
      kill: { knife: o.kill || 0, revolver: o.kill || 0 },
      seen: o.seen || 0,
      tell: [1, 1, 1, 1].map(() => o.tell || 0),
      hint: o.hint || 0,
      trace: o.trace || 0,
      link: o.trace || 0,
      plantSeen: o.plantSeen || 0,
      away: { errand: 0, thief: o.thief ? 1 : 0, tryst: 0, restless: 0 },
      wakes: 0,
      knows: o.knows || 0
    });
    Object.assign(RULES.deed.judge, { expel: o.expel != null ? o.expel : 2.2 });
    RULES.alibis.smugglerIn = 0;
    RULES.night.watched = o.watched ? 1 : 0;
    // (the cult comes for you, if asked; else for someone other than the one you go for)
    window.chooseVictim = night => {
      night.why = { kind: 'none' };
      return o.you ? 'player' : freeChars().find(c => c.role !== 'cult' && c !== t).id;
    };
    RULES.deed.vote = o.novote ? [0, 0, 0, 0] : [0, 0, 0.45, 0.75];
    window.chooseWatch = o.watched ? () => t.id : keepWatch;
    goTo('camp');
    if (tag === 'deed-killed') cap('deed-offer');
    choose(/Settle it yourself|Взять всё в свои руки/);
    if (tag === 'deed-killed') cap('deed-whom');
    S_ui.scene.choices.find(x => X(x.label).includes(t.name) || X(x.label).includes(ru.cf(t, 'g'))).fn();
    if (tag === 'deed-killed') cap('deed-means');
    choose(/A knife|Нож/);
    if (tag === 'deed-killed') cap('deed-plant');
    choose(o.plant ? /Leave something|Оставить что-нибудь/ : /Leave nothing|Ничего чужого/);
    if (tag === 'deed-killed') cap('deed-wait');
    choose(/Night falls|Опускается ночь/);
    cap(tag);
    window.chooseVictim = keepVictim;
    window.chooseWatch = keepWatch;
  };
  deed('deed-killed', { kill: 1, plant: true });
  deed('deed-plant-seen', { kill: 1, plant: true, plantSeen: 1 });
  deed('deed-failed-hinted', { kill: 0, seen: 1, hint: 1, trace: 1, novote: true });
  deed('deed-failed-kept', { kill: 0, seen: 1, tell: 1, expel: 99 });
  deed('deed-failed-sent-away', { kill: 0, seen: 1, tell: 1, expel: -99 });
  deed('deed-watched', { watched: true, knows: 1 });
  deed('deed-away', { thief: true });
  deed('deed-cult-came', { kill: 1, you: true });
  // with nobody of the cult left at large, the power below comes by itself (game/night.js: priestless)
  {
    newGame('Marlowe', 'philologist');
    arrivalScene();
    Object.assign(S, { day: 3, slot: 2, slotsToday: 3 });
    S.order
      .map(C)
      .filter(c => c.role === 'cult')
      .forEach(c => {
        c.status = 'taken';
        c.takenDay = 2;
        c.takenBy = 'you';
      });
    const keepN = { ...RULES.night };
    Object.assign(RULES.night, { priestless: 1, watched: 0, spared: 0 });
    window.chooseVictim = night => {
      night.why = { kind: 'none' };
      return freeChars().find(c => c.role !== 'cult').id;
    };
    nightComes();
    cap('priestless-night');
    window.chooseVictim = keepVictim;
    Object.assign(RULES.night, keepN);
  }
  // a conversation with time for a third question, and one with time for only one (ui/talk.js: talkAfter)
  {
    newGame('Marlowe', 'soldier');
    arrivalScene();
    startSlot();
    const c = freeChars()[0],
      keepT = { ...RULES.talk };
    goTo('camp');
    Object.assign(RULES.talk, { longer: 1, shorter: 0 });
    talk(c.id);
    choose(/Make conversation|Завести разговор/);
    choose(/Ask whom they distrust|Спросить, кому здесь нельзя верить/);
    cap('talk-longer');
    Object.assign(RULES.talk, { longer: 0, shorter: 1 });
    talk(c.id);
    choose(/Make conversation|Завести разговор/);
    cap('talk-shorter');
    Object.assign(RULES.talk, keepT);
  }
  // the end you chose, every reason everywhere it is told, and a death that came later, both kinds for every reason, of
  // a man and of a woman (game/fates.js: the words are the season's to pick, so all of them are shown)
  {
    const all = S.order.map(C),
      him = all.find(c => c.p === 'he'),
      her = all.find(c => c.p === 'she'),
      L = FATE_YOU_LAST,
      d = { plain: null, deed: { t: him, cult: false }, wronged: her, friends: him, tent: her, tablets: null, horrors: null },
      say = t => `<p>${bi(...t)}</p>`;
    capHtml('you-last', Object.keys(L).map(k => Object.keys(L[k]).map(w => L[k][w].map(f => say(f(d[k]))).join('')).join('')).join(''));
    capHtml('you-last-deed', say(L.deed.home[0]({ t: her, cult: true })) + say(L.deed.home[0]({ t: her, cult: false })));
    capHtml(
      'after',
      Object.keys(FATE_AFTER)
        .map(kind =>
          Object.keys(FATE_AFTER[kind])
            .map(k => FATE_AFTER[kind][k].map(f => say(f(him, her)) + say(f(her, him))).join(''))
            .join('')
        )
        .join('')
    );
    // and both in an ending, as the ending tells them
    const keepF = JSON.parse(JSON.stringify(RULES.fates));
    Object.assign(RULES.fates.last, { base: 1, max: 1 });
    Object.assign(RULES.fates.after, { base: 1, max: 1 });
    S.ended = null;
    ending('madness', 'ward');
    cap('ending-last');
    RULES.fates = keepF;
  }
  return caps;
};

run(async browser => {
  const { page, errors } = await open(browser, {
    file: a.page || 'standalone',
    seed: 4242,
    lang: a.lang === 'ru' ? 'ru' : null,
    helpers: false
  });
  let caps = null;
  try {
    caps = await page.evaluate(SCRIPT);
  } catch (e) {
    errors.push(String(e.message).slice(0, 300));
  }
  const missing = a.lang === 'ru' ? await page.evaluate(() => [...MISSING]) : [];
  if (process.env.SHOW && caps)
    caps
      .filter(c => new RegExp(process.env.SHOW).test(c[0]))
      .forEach(c =>
        console.log(
          '\n=== ' +
            c[0] +
            '\n' +
            c
              .slice(1, 4)
              .join('\n')
              .replace(/<[^>]*>/g, '\n')
              .replace(/\n+/g, '\n')
        )
      );
  if (!caps) return { errors };
  if (mode === 'record') {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, zlib.gzipSync(JSON.stringify(caps)));
    return `recorded ${caps.length} forced scenes (${a.lang}); errors: ${JSON.stringify(errors)}`;
  }
  const gold = JSON.parse(zlib.gunzipSync(fs.readFileSync(FILE)).toString('utf8'));
  let diffs = 0;
  if (gold.length !== caps.length) {
    diffs++;
    console.log(`${gold.length} scenes recorded, ${caps.length} now`);
  }
  gold.forEach((c, i) => {
    const n = caps[i] || [];
    for (let j = 0; j < c.length; j++)
      if (String(c[j]) !== String(n[j])) {
        if (++diffs <= 5) {
          const was = String(c[j]),
            now = String(n[j]);
          let k = 0;
          while (k < was.length && was[k] === now[k]) k++;
          console.log(
            `${c[0]} part ${j}:\n  was …${was.slice(Math.max(0, k - 80), k + 100)}\n  now …${now.slice(Math.max(0, k - 80), k + 100)}`
          );
        }
      }
  });
  // Russian must be fully translated
  const leaks = [];
  if (a.lang === 'ru')
    caps.forEach(c => {
      if (c[0][0] === '#') return;
      const text = shownOnly(c.slice(1).join(' '), 'ru')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&[a-z]+;/g, ' '),
        words = text.match(/[A-Za-z][A-Za-z’'\-]+/g) || [];
      if (words.length) leaks.push([c[0], [...new Set(words)].slice(0, 10)]);
    });
  return (
    (diffs
      ? `${diffs} differences from the forced ${a.lang} recording`
      : `forced ${a.lang}: identical to the recording (${caps.length} scenes)`) +
    (leaks.length ? `\nleaks: ${JSON.stringify(leaks.slice(0, 10))}` : '') +
    (missing.length ? `\nmissing: ${JSON.stringify(missing.slice(0, 10))}` : '') +
    (errors.length ? `\nerrors: ${JSON.stringify(errors)}` : '')
  );
});
