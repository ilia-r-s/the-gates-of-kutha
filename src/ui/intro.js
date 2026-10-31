// ui/intro.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function seedInAddress() {
  try {
    const m = /[?#&]seed=([0-9a-fA-F-]{1,12})/.exec(location.search + location.hash);
    return m ? parseSeed(m[1]) : null;
  } catch (e) {
    return null;
  }
}
let seedOpen = false;
function openSeed() {
  seedOpen = true;
  const row = document.getElementById('seedRow'),
    sd = document.getElementById('pseed');
  if (row) row.hidden = false;
  if (sd) sd.focus();
}
const seasonDays = () => {
  const n = RULES.start.days;
  return TX.intro.day(n);
};
function introScene(seed = seedInAddress()) {
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
    kicker: `${__text('baghdad')} <button type="button" id="seedKey" class="seedkey">·</button> ${__text('march')}`,
    kickerHtml: true,
    title: __text('theGatesOfKutha'),
    intro: true,
    body: [
      `<p>${bi(...TX.intro.professorAldousCraneDirector())}</p>`,
      `<p>${bi(...TX.intro.sevenPeopleAreStill())}</p>`,
      `<div class="namefield"><label for="pname">${__text('yourSurname')}</label><input id="pname" type="text" maxlength="24" value="${__text('marlowe')}" autocomplete="off"></div>`,
      `<div class="namefield" id="seedRow"${seedOpen ? '' : ' hidden'}><label for="pseed">${__text('seasonCode')}</label><input id="pseed" class="seed" type="text" maxlength="12" value="${seed == null ? '' : seedCode(seed)}" placeholder="${__text('aNewSeason')}" autocomplete="off" spellcheck="false"><span class="dim">${bi(...TX.intro.theCodeOfA())}</span></div>`,
      `<p class="dim">${__text('chooseWhoYouAre')}</p>`
    ],
    choices: bgs.map(b => ({
      label: b.name,
      html: `<span class="ch-label">${b.name}</span><span class="ch-sub">${b.blurb}</span><span class="ch-perk">${b.perk}</span>`,
      fn: () => {
        const el = document.getElementById('pname'),
          sd = document.getElementById('pseed');
        const nm = ((el && el.value) || 'Marlowe').trim().slice(0, 24) || 'Marlowe';
        replyScene(nm, b.id, sd ? parseSeed(sd.value) : null);
      }
    }))
  });
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
          wire('Accept stop God help me', __text('text')) +
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
