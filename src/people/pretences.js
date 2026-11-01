function pretence(c) {
  const cl = claimOf(c);
  if (!cl || cl.recanted != null) return null;
  if (c.role === 'seer' || c.role === 'warden') return cl.role === c.role ? null : 'hid-' + c.role;
  if (cl.said == null) return null;
  if (c.role === 'smuggler' && cl.role === 'warden' && cl.why === 'conceal') return 'cover';
  if (cl.role === 'seer' || cl.role === 'warden') return 'liked-' + cl.role;
  if (c.role === 'smuggler' && S.revealed[c.id] !== 'smuggler') return 'thief';
  return cl.role === 'none' && stages(c) ? 'staged' : null;
}
const stages = c => c.role !== 'smuggler' && ['liar', 'calculating'].includes(temperOf(c));
const rivalClaim = c => Knowledge.knownClaims(c).some(w => w.by !== c.id && w.value === claimOf(c).role),
  dreamtAgainst = c => Knowledge.knownWords(c).some(w => w.kind === 'dream' && w.about === c.id && w.value === 'cult'),
  ownFailedWatch = c => S.testimony.some(t => t.from === c.id && t.about === c.id && t.kind === 'failwatch');
const DROPS_PRETENCE = Decisions.define({
  id: 'pretence.drop',
  action: 'drop-pretence',
  authority: 'actor',
  subject: c => c,
  knowledge: [
    'self: role, claim, previous defence, temperament and trust in the player',
    'received public claims and accusations, or private words with an established hearing route',
    'own failed watch and deaths actually announced to the speaker'
  ],
  consequences: ['claim', 'testimony', 'journal'],
  features: {
    occasion: 'string',
    pretence: 'string',
    temper: 'string',
    trust: 'number',
    rival: 'boolean',
    dreamtAgainst: 'boolean',
    failedWatch: 'boolean',
    accusers: 'number',
    knownDeath: 'boolean',
    defendedCult: 'boolean'
  },
  observe: (c, occasion = 'consider') => ({
    occasion,
    pretence: pretence(c) || 'none',
    temper: temperOf(c),
    trust: c.rapport,
    rival: rivalClaim(c),
    dreamtAgainst: dreamtAgainst(c),
    failedWatch: ownFailedWatch(c),
    accusers: Knowledge.accusers(c).length,
    knownDeath: Knowledge.lossToday(c),
    defendedCult: c.role === 'cult' && !!claimOf(c).stood
  }),
  probability: (c, occasion = 'consider') => {
    if (occasion === 'inquiry' && pretence(c) === 'staged') return 0;
    const p = PRETENCE_BASE.p(c);
    if (!(p > 0)) return 0;
    return occasion === 'morning' ? room('talk') * p : occasion === 'inquiry' ? Math.min(RULES.confess.cap, p + RULES.confess.publicly) : p;
  }
});
const PRETENCE_BASE = byCase(
  'drops a pretence',
  c => {
    const k = pretence(c);
    return !k ? 'none' : k === 'staged' || k === 'thief' ? k : k.indexOf('hid') === 0 && !saidDream(c) ? 'hidden' : 'false part';
  },
  {
    none: odds('nothing to drop', [['base', () => 0]]),
    staged: odds('stages coming clean, as the Watcher', [['base', () => RULES.confess.staged]]),
    thief: odds('owns his trade', [
      ['base', c => TP(c).confess * RULES.confess.thief],
      ['+ trusts you', c => (Ties.friend(c) ? RULES.confess.trusting : 0)],
      ['cap', () => RULES.confess.cap]
    ]),
    hidden: odds('owns the part it hid', [
      ['base', c => TP(c).confess * RULES.confess.hidden],
      ['+ a death announced today', c => (Knowledge.lossToday(c) ? RULES.confess.afterDeath : 0)],
      ['+ trusts you', c => (Ties.friend(c) ? RULES.confess.trusting : 0)],
      ['cap', () => RULES.confess.cap]
    ]),
    'false part': odds('drops a part it claimed', [
      ['base', c => TP(c).confess],
      ['+ another claims the part', c => (rivalClaim(c) ? RULES.confess.rival : 0)],
      ['+ heard a dream against them', c => (dreamtAgainst(c) ? RULES.confess.dreamt : 0)],
      ['+ knows their own failed watch', c => (ownFailedWatch(c) ? RULES.confess.caught : 0)],
      ['+ heard two or more accusers', c => (Knowledge.accusers(c).length >= RULES.suspects.many ? RULES.confess.blamed : 0)],
      ['+ trusts you', c => (Ties.friend(c) ? RULES.confess.trusting : 0)],
      ['cap', () => RULES.confess.cap],
      ['* holds a story told for the other of the cult', c => (c.role === 'cult' && claimOf(c).stood ? Math.min(1, TP(c).counter) : 1)]
    ])
  }
);
function comeClean(c, how) {
  let k = pretence(c);
  if (!k) return null;
  if (k === 'liked-seer' && stages(c) && chance(RULES.confess.stagedDream)) k = 'staged';
  const cl = claimOf(c),
    was = cl.role,
    claimed = cl.said != null,
    lied = was === 'none' && claimed,
    evaded = was === 'evade' && claimed,
    feigned = was === 'seer' && claimed;
  cl.recanted = S.day;
  cl.how = how;
  cl.was = was;
  cl.claimed = claimed;
  if (!claimed) cl.said = S.day;
  cl.role = k === 'staged' ? 'warden' : trueClaim(c);
  if (k === 'staged') cl.why = c.role === 'cult' ? 'deceit' : 'liked';
  else if (c.role === 'cult') S.log.cultTruth++;
  if (claimed) Record.testify(c.id, c.id, 'recant', was);
  Record.testify(c.id, c.id, 'claim', cl.role);
  const open = how === 'confess' || how === 'public';
  if (open) {
    Knowledge.publicClaim(c, cl.role);
    Record.testify(c.id, c.id, 'confess', String(S.day));
    S.log.confess++;
  }
  return ownUp(c, k, how, { open: open, lied: lied, evaded: evaded, feigned: feigned });
}
const saidDream = c => claimsToDream(c) && claimOf(c).said != null;
function ownUp(c, k, how, { open: open, lied: lied, evaded: evaded, feigned: feigned }) {
  const g = (m, f) => ru.gs(c, m, f);
  return OWN_UP[k](c, how, {
    open: open,
    lied: lied,
    evaded: evaded,
    feigned: feigned,
    g: g,
    N: c.name,
    Nr: capS(ru.cf(c)),
    adm: g(__text('confessedMasculineRu'), __text('confessedFeminineRu'))
  });
}
function ownsTrade(c) {
  Record.testify(c.id, c.id, 'thief', 'thief');
  S.revealed[c.id] = 'smuggler';
  fixMark(c);
  return thiefSaw(c) && chance(RULES.thief.own) ? ' ' + thiefNames(c) : '';
}
const OWN_UP = {
  staged: (c, how, ctx) => {
    S.log.staged.push({ day: S.day, id: c.id });
    return OWN_UP['hid-warden'](c, how, ctx);
  },
  thief: (c, how, { g: g, N: N, Nr: Nr, adm: adm }) => {
    Record.journal(__text('admittedToSmuggling'));
    const named = ownsTrade(c);
    return bi(...TX.pretences.iShouldTellYou(g)) + named;
  },
  'hid-seer': (c, how, { open: open, lied: lied, evaded: evaded, g: g, N: N, Nr: Nr, adm: adm }) => {
    c.promised = true;
    if (open) S.seerPublic = true;
    else claimToYou(c, how === 'aside' ? null : S.loc);
    Record.journal(__text('admittedToBeingTheDreamer'));
    if (how === 'pressed') return bi(...TX.pretences.enoughYesIDream(g));
    if (how === 'trust' || how === 'aside')
      return lied
        ? bi(...TX.pretences.doctorAWordWhen(g))
        : evaded
          ? bi(...TX.pretences.doctorAWordWhen2(g))
          : bi(...TX.pretences.doctorAWordThere(g));
    return bi(...TX.pretences.iAmTheOne());
  },
  'hid-warden': (c, how, { lied: lied, evaded: evaded, feigned: feigned, g: g, N: N, Nr: Nr, adm: adm }) => {
    if ((how === 'trust' || how === 'aside') && Ties.friend(c)) Watch.swear(c);
    Record.journal(feigned ? bi(...TX.pretences.tookBackTheDream(N, Nr, adm, g)) : __text('admittedToKeepingWatch'));
    if (how === 'pressed')
      return feigned
        ? bi(...TX.pretences.veryWellINever(g))
        : lied
          ? bi(...TX.pretences.veryWellIKeep(g))
          : bi(...TX.pretences.veryWellIKeep2(g));
    if (how === 'trust' || how === 'aside') {
      const yours = Ties.friend(c) ? __text('tonightIWillKeepItBy') : ['', ''];
      return feigned
        ? bi(...TX.pretences.iNeverDreamedI(yours, g))
        : lied
          ? bi(...TX.pretences.whatIToldYou(yours, g))
          : evaded
            ? bi(...TX.pretences.iWouldNotAnswer(yours, g))
            : bi(...TX.pretences.youShouldKnowI(yours));
    }
    return feigned ? bi(...TX.pretences.iNeverDreamedAll(g)) : bi(...TX.pretences.iHaveBeenKeeping(g));
  },
  cover: (c, how, { g: g, N: N, Nr: Nr, adm: adm }) => {
    Record.journal(bi(...TX.pretences.admittedTheNightWatch(N, Nr, adm)));
    if (how === 'pressed') return bi(...TX.pretences.andTheNightWatch(g));
    const named = ownsTrade(c);
    return bi(...TX.pretences.theNightWatchWas(g)) + named;
  },
  'liked-seer': (c, how) => {
    dropNote(c, 'seer');
    return how === 'pressed' ? bi(...TX.pretences.allRightIDon()) : dropSay(c, 'seer');
  },
  'liked-warden': (c, how) => {
    dropNote(c, 'warden');
    return how === 'pressed' ? bi(...TX.pretences.fineIDonT()) : dropSay(c, 'warden');
  }
};
const DROP_SAY = {
  seer: [g => bi(...TX.pretences.iHaveToSay(g)), g => bi(...TX.pretences.aboutMyDreamsI(g))],
  warden: [g => bi(...TX.pretences.iNeverKeptWatch(g)), g => bi(...TX.pretences.iSaidIKeep(g))]
};
const dropSay = (c, role) => sayPick(DROP_SAY[role])((m, f) => ru.gs(c, m, f));
function dropNote(c, role) {
  const g = (m, f) => ru.gs(c, m, f);
  Record.journal(role === 'seer' ? bi(...TX.pretences.tookBackTheClaim(c, g)) : bi(...TX.pretences.tookBackTheClaim2(c, g)));
}
const morningLead = (c, aside) => (aside ? bi(...TX.pretences.beforeBreakfastTakesYou(c)) : bi(...TX.pretences.beforeBreakfastIsOver(c)));
const inquiryLead = c => bi(...TX.pretences.beforeYouCanLay(c));
function morningConfession(c) {
  const aside = chance(RULES.confess.aside);
  return (
    `<p class="event">${quoted(morningLead(c, aside), comeClean(c, aside ? 'aside' : 'confess'))}</p>` +
    (aside ? '' : Moments.stir('confessed', { about: c.id }))
  );
}
function inquiryConfession() {
  if (S.inqConf === S.day) return '';
  S.inqConf = S.day;
  const c = shuffle(freeChars()).find(o => DROPS_PRETENCE.roll(o, 'inquiry'));
  if (!c) return '';
  return `<p class="event">${quoted(inquiryLead(c), comeClean(c, 'public'))}</p>` + Moments.stir('confessed', { about: c.id });
}
