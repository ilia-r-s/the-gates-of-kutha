function seedAddressValue() {
  try {
    const m = /(?:^|[?#&])seed=([^&#]*)/.exec(location.search + location.hash);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1].replace(/\+/g, ' '));
    } catch {
      return m[1];
    }
  } catch {
    return null;
  }
}
function seedInAddress() {
  return parseSeed(seedAddressValue());
}
let seedOpen = false,
  seedInvalid = false;
function openSeed() {
  seedOpen = true;
  const row = document.getElementById('seedRow'),
    sd = document.getElementById('pseed');
  if (row) row.hidden = false;
  const key = document.getElementById('seedKey');
  if (key) key.setAttribute('aria-expanded', 'true');
  if (sd) sd.focus();
}
function seedFeedback(invalid) {
  seedInvalid = invalid;
  const input = document.getElementById('pseed'),
    error = document.getElementById('seedError');
  if (input) input.setAttribute('aria-invalid', String(invalid));
  if (error) {
    error.hidden = !invalid;
    error.textContent = invalid ? X(__text('invalidSeasonCode')) : '';
  }
}
const seasonDays = () => {
  const n = RULES.start.days;
  return TX.intro.day(n);
};
function introScene(seed = seedInAddress()) {
  const code = !arguments.length && seed === null ? seedAddressValue() || '' : seed == null ? '' : seedCode(seed);
  Session.clear();
  resetSeasonText();
  S = null;
  S_ui.tab = 'people';
  const bgs = [
    {
      id: 'philologist',
      name: __text('philologist'),
      blurb: bi(...TX.intro.youReadCuneiformThe()),
      perk: bi(...TX.intro.translatesMoreSurelyReads())
    },
    { id: 'soldier', name: __text('oldSoldier'), blurb: bi(...TX.intro.youWereAtKut()), perk: bi(...TX.intro.pressesHarderReadsA()) },
    { id: 'occultist', name: __text('occultist'), blurb: bi(...TX.intro.aLapsedMemberOf()), perk: bi(...TX.intro.nowAndThenFeels()) }
  ];
  show({
    kicker: `${__text('baghdad')} <button tabindex="0" type="button" id="seedKey" class="seedkey" aria-label="${__text('showSeasonCode')}" aria-controls="seedRow" aria-expanded="${seedOpen}">·</button> ${__text('march')}`,
    kickerHtml: true,
    title: __text('theGatesOfKutha'),
    intro: true,
    body: [
      `<p>${bi(...TX.intro.professorAldousCraneDirector())}</p>`,
      `<p>${bi(...TX.intro.sevenPeopleAreStill())}</p>`,
      `<div class="namefield"><label for="pname">${__text('yourSurname')}</label><input id="pname" type="text" maxlength="24" value="${__text('marlowe')}" autocomplete="off"></div>`,
      `<div class="namefield" id="seedRow"${seedOpen ? '' : ' hidden'}><label for="pseed">${__text('seasonCode')}</label><input id="pseed" class="seed" type="text" value="${esc(code)}" placeholder="${__text('aNewSeason')}" autocomplete="off" spellcheck="false" aria-describedby="seedHelp seedError" aria-invalid="false"><span class="dim" id="seedHelp">${bi(...TX.intro.theCodeOfA())}</span><span class="dim" id="seedError" role="alert" hidden></span></div>`,
      `<p class="dim">${__text('chooseWhoYouAre')}</p>`
    ],
    choices: bgs.map(b => ({
      label: b.name,
      html: `<span class="ch-label">${b.name}</span><span class="ch-sub">${b.blurb}</span><span class="ch-perk">${b.perk}</span>`,
      fn: () => {
        const el = document.getElementById('pname'),
          sd = document.getElementById('pseed');
        const nm = ((el && el.value) || 'Marlowe').trim().slice(0, 24) || 'Marlowe';
        const entered = sd ? sd.value.trim() : '',
          parsed = parseSeed(entered);
        if (seedOpen && entered && parsed === null) {
          seedFeedback(true);
          openSeed();
          return;
        }
        replyScene(nm, b.id, parsed);
      }
    }))
  });
  seedFeedback(!!code && parseSeed(code) === null);
  Session.paintNotice();
}
function replyScene(name, bg, seed = null) {
  const go = hardcore => () => {
    newGame(name, bg, hardcore, seed);
    arrivalScene();
  };
  const wire = (en, rus) => `<span class="ch-label wire">${bi(en, rus)}</span>`;
  show({
    kicker: __text('baghdadMarch'),
    title: __text('yourReply'),
    intro: true,
    art: { bg: 'vista', time: 'night' },
    body: [
      `<p>${bi(...TX.intro.theTrusteesWantTheir())}</p>`,
      `<p>${bi(...TX.intro.craneReportsToThem())}</p>`,
      `<p class="dim">${bi(...TX.intro.howeverYouAnswerIt())}</p>`
    ],
    choices: [
      {
        label: __text('acceptStopGodHelpMe'),
        html:
          wire('Accept stop God help me', __text('acceptWireRu')) +
          `<span class="ch-sub">${bi(...TX.intro.yourCasebookWillFile())}</span>` +
          `<span class="ch-perk">${__text('theUsualWay')}</span>`,
        fn: go(false)
      },
      {
        label: bi(...TX.intro.acceptStopShallTrust()),
        html:
          wire(...TX.intro.acceptStopShallTrust2()) +
          `<span class="ch-sub">${bi(...TX.intro.yourCasebookWillKeep())}</span>` +
          `<span class="ch-perk">${__text('hardcoreForTheWholeExpedition')}</span>`,
        fn: go(true)
      }
    ]
  });
}
function replaySeason() {
  const { name: name, bg: bg, hardcore: hardcore, seed: seed } = S;
  S_ui.tab = 'people';
  newGame(name, bg, hardcore, seed);
  arrivalScene();
}
function arrivalScene() {
  show({
    kicker: __text('tellIbrahimDay'),
    title: __text('arrival'),
    body: [
      `<p>${bi(...TX.intro.theFordFromHillah())} ${craneFound()} ${bi(...TENOR_SAY.arrival[tenorMood()])}</p>`,
      `<p>${bi(...TX.intro.hisDiaryIsOn())}</p>`,
      `<blockquote class="diary">${bi(...TX.intro.twoOfThemHear())}</blockquote>`,
      `<p>${bi(...TX.intro.youHaveLearnTheir())}</p>`,
      `<p>${bi(...TX.intro.theyArePeopleToo())}</p>`,
      `<p class="dim">${S.hardcore ? bi(...TX.intro.yourCasebookKeepsOnly()) : bi(...TX.intro.yourCasebookKeepsEverything())}</p>`
    ],
    choices: [
      {
        label: __text('walkOutOntoTheTell'),
        fn: startSlot
      }
    ]
  });
}
