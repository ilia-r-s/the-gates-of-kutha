# Developing The Gates of Kutha

How the game is built, laid out, tested, measured and published. The game is one HTML page with one script, and no
other files: nothing here is needed to play it.

## The documents

| Document | For | What it holds |
| --- | --- | --- |
| [README.md](README.md) | players and visitors | what the game is, its pictures, where to play it |
| [docs/rulebook.md](docs/rulebook.md) | players who want every rule | the complete rulebook: every rule and probability, and how often each ending comes (spoilers); a copy of the rulebook doc on claude.ai (https://claude.ai/artifact/EkqSDY5vtcA6RnGVHxyUjf), taken at each release |
| [RULES.md](RULES.md) | whoever tunes the game | every rule in words and with every number, each named as it is in the code; the project's own rules (Nothing is certain; How the project is kept) |
| [DEVELOPING.md](DEVELOPING.md) | developers | this file: building, the code's layout, tests, simulators, pictures, publishing |
| [REQUIREMENTS.md](REQUIREMENTS.md) | everyone | what the game needs to run; every tool and version it is built and tested with; where it has been tested, and where not yet |
| [CHANGELOG.md](CHANGELOG.md) | everyone | every build and what it changed; each section is that build's release notes |
| [CLAUDE.md](CLAUDE.md) | Claude Code, and anyone else working on the code | the project's standing rules and the release checklist, in short, with pointers here |

Each fact lives in one of them, and the others point to it. A change to the game brings the documents that describe it
up to date in the same commit.

## Seasons and seeds

Every season is dealt and played from a seed of its own (`core/random.js`; `S.seed`), written as a code like `1A2B-3C4D`
on the ending page (and in the casebook's Kit, once the box below has been opened): given after the page's address
(`?seed=1A2B-3C4D` or `#seed=1A2B-3C4D`), which shows the title screen's season-code box with it filled in, or typed
into that box, it deals the same season again, whoever you play it as, and the same choices play it the same way. The
box is out of sight until asked for: the dot in the title screen's dateline ("Baghdad · March 1926") is a button that
opens it (`ui/intro.js`, `openSeed`), and it stays open on later title screens until the page is loaded again. The tests
and simulators deal their seasons from seeds too: `node test/replay.js 1A2B-3C4D` plays one season from its code and
prints it as a player reads it, and `node test/replay.js --fuzz=300 --from=1A2B-3C4D` plays three hundred, scans every
scene, and names the codes that went wrong.

## Building

```
nvm use                       # Node at the version in .nvmrc (any version in package.json's engines will do)
npm ci                        # the development tools, at the versions in REQUIREMENTS.md (the game itself needs nothing)
npx playwright install chromium   # the browser the tests drive
node build.js                 # src/ → kutha.html, standalone.html, Gates of Kutha.html      (npm run build)
node build.js --debug         # the same, with the script whole, comments and all, for reading a stack trace
node build.js --check         # build in memory only: parse the script, refuse duplicate global names
node test/lint.js             # read the whole script for undefined, unused and hidden names   (npm run lint)
```

The game is one HTML page with one script, and no other files: every picture is drawn as SVG by `src/ui/art.js` and
`src/ui/art-end.js`, and the music and sounds are synthesized as they play, through Web Audio, by `src/ui/audio.js`
(only the fonts come from Google Fonts). `build.js` lists the modules in the order they are concatenated. All
modules share one global scope, so the build refuses a name declared twice at top level: a second function of the same
name would otherwise silently replace the first. The pages carry the script without its comments and spare whitespace
(Terser, with no compression and no renaming: the code runs exactly as written), which keeps the page small enough for
the artifact host to accept; the tests play these same pages. The build also stamps the version in `package.json` into
the top panel, beside the title ("build 27.1.0"), so a player can tell which build is on the screen; raise it with
each release.

- `kutha.html` is the artifact page (the artifact host adds the document skeleton).
- `standalone.html` is the same page as a complete document, for opening from disk.
- `Gates of Kutha.html` is a copy of `standalone.html`, the file handed to players.

## Source layout

| Folder | What lives there |
| --- | --- |
| `src/page/` | The page: head (fonts, the main style sheet), extra styles, body. |
| `src/core/` | `random.js`: the seeded dice. `text.js`: the two languages (`bi`, `X`, `R`, `zipRU`), Russian cases and genders, English pronouns, lists and counts. |
| `src/rules.js` | Every tuning number: the temperaments table, sympathies, the puzzle's shape, the odds of every action, the ending styles. |
| `src/data/` | The English tables: the world (`world.js`: people, the powers with their signs and attacks, charms, places, the morning's news), conversation lines (`lines.js`), horrors outside the tomb and the scorched circle (`dread.js`), the dig's own dangers and harm done in secret (`hazards.js`), how the night's dead are found (`deaths.js`, with their Russian), how the season's mood shows itself (`tenor.js`, with its Russian), more ways of saying what is said most often (`variety.js`, with its Russian: gone through in turn, never the same telling twice running, by `tellOne` and `tellAt` in `core/text.js`), the endings' words (`endings.js`), what became of everyone (`fates.js`, with the rare end you chose, `FATE_YOU_LAST`, and the deaths that came later, `FATE_AFTER`). |
| `src/world/` | `powers.js`: the powers below, their signs, titles and charms; the tablets, glosses and readings (the deduction puzzle). `deaths.js`: how the night's dead are found, put together. |
| `src/game/` | The season: `state.js` (state and its small verbs), `tenor.js` (the season's mood: how much happens of itself, how heavily, and how the mood drifts), `day.js`, `dread.js` (horrors that come of themselves), `hazards.js` (the dig's own dangers by day, and harm done you in secret by night), `inquiry.js` and `verdict.js` (whether the camp will back you), `night.js`, `yourdreams.js` (your own dreams in the night, never explained), `deed.js` (justice in your own hands, once a season), `events.js` (the day's news), `finale.js` (the descent), `below.js` (what waits between the gates), `endings.js` (which ending, and how cleanly it was done), `fates.js` (what became of everyone, and of you), `debrief.js` (the reasons, the numbers, the truth). |
| `src/people/` | `tempers.js`, `claims.js`, `social.js` (likes, gossip, rumours, mornings), `pretences.js` (coming clean), `camp.js` (who suspects whom, and public moments that move several people at once), `flirt.js`, `visit.js` (a visit to your tent as the evening ends, once a season at most), `manner.js` (what shows of a feeling: greetings, faces, partings), `thief.js` (the thief as witness), `cunning.js` (the cult's craft: planted traces, kept promises, volunteers, the patient traitor, slips, the nights it lies low, how it reads your way of hunting it, and now and then one of its own killed to turn your eyes away), `alibis.js` (the nights), `dialog.js` (everything you can say). |
| `src/ui/` | The screen: `scene.js`, `talk.js`, `intro.js`, `book.js` (casebook), `lang.js` (and `twin`: words that take the same room in both languages, so nothing moves when the language changes), `art.js` (portraits in twelve moods, and scenes), `art-end.js`, `audio.js`; `bus.js` and `cues.js` (events, and the sounds and pictures that follow them); `boot.js`. |
| `src/i18n/` | The Russian translation of the English tables, laid over them by structure. |

Five rules hold the code together:

1. **The rules never draw or play anything.** Game code calls `emit(event)`; `ui/cues.js` listens and plays the sound,
   paints the picture or changes the music. Sound and pictures use `Math.random`, never the game's dice, so they can
   never change what happens.
2. **Every visible string is bilingual.** `bi(en, ru)` makes a token that `X()` renders in the current language, so a
   scene can be repainted in the other language at any moment. Tables of English text are translated by the matching
   tables in `src/i18n/`.
3. **Every tuning number is in `rules.js`.** No odds are ever shown on screen: a choice says what it risks, never its
   chances.
4. **The dice are thrown in a fixed order.** A season is fully determined by its seed, which is what lets the recorded
   playthroughs catch any change in behaviour. Functions that deal or resolve something (`newGame`, `resolveNight`,
   `buildFacts`) are split into named steps that run in the order the dice are thrown; reorder them and every recorded
   season replays differently. Choices that must not throw the dice (a face in a picture, which may be redrawn at any
   moment; a word chosen for the ending page) are fixed by the season instead (`hash01` on `S.salt`).
5. **Nothing is certain.** Every answer, every action's result, everything that happens of itself and how much it
   costs or gives is a throw of the dice: `chance` never rolls surer than `RULES.scale.surest` (99%) or rarer than
   `scale.rarest` (1%), and amounts vary (`vary`). Odds of nothing at all are only for what cannot happen. The few
   exceptions, and the reason for each, are listed at the top of [RULES.md](RULES.md).

## Reading the code

A season, in the order it happens:

| Stage | Where |
| --- | --- |
| Title screen, arrival | `ui/intro.js`: `introScene` (who you are, and the season's code if you give one: `seedInAddress` reads it from the page's address) → `replyScene` (your reply to the Trustees: the casebook kept the usual way, or hardcore, for the whole season) → `newGame` → `arrivalScene`. Played hardcore, `bare()` in `ui/book.js` leaves out everything the casebook would join up for you |
| Dealing a season | `game/state.js`: `newGame` (the dice from the season's seed: `reseed`, the seed from `newSeed` unless a code was given) → `dealParts` (the seven parts and the hierophant, first of all, by a fair shuffle) → `freshSeason`, `dealCast` (traces, temperaments), then `dealGods` (`world/powers.js`: `dealSigns`, `dealWards` (and each charm's riddle), `dealTitles`; `buildFacts` writes the tablets), `assignClaims`, `assignLikes`, `campInit`, `assignFlirts` (`people/`), `crane0` (the night Crane died), the salt (`S.salt`: what is chosen without the dice), `dealWord` (how far each of the camp takes your word), `dealTenor` (the season's mood, `game/tenor.js`), `dealYourDreams` (how often you dream, and how true: `game/yourdreams.js`), the cult's patience (`S.patience`: how readily it lies low), and last of all `backgroundStart` (what your background gives you: last, so that a seed deals the same season whatever background you choose) |
| A day, three slots | `game/day.js`: `startSlot` (`placeChars`) → `planScene` → `goTo` a place (`campActs` in camp) → search, translate, examine (`doExamine`: `traceGenuine`, `tracePlanted`, `traceThief`), rest, or `talk` (`ui/talk.js`: `meet`, `askThem`, `talkLeave`, showing what `openTalk`, `askOf` and `leaveOf` in `people/dialog.js` decide; `greeting`, `faceFor`, `parting` in `people/manner.js`, its faces in `FACES`; answers in `people/dialog.js`, `DIALOG`: small talk in `curtTalk`, `scholarTalk`, `smallTalk`; whom they distrust in `dreamToTell`, `whomToBlame`; pressed in `pressedCult`; owning up in `ownUp`, `OWN_UP`, `people/pretences.js`) → `endSlot` (and `dreadNow`, `game/dread.js`) |
| An inquiry | `game/inquiry.js`: `inquiryScene` (`markSay`: your mark beside each name; `angerSay`), `accuse` → the camp's verdict (`game/verdict.js`: `campVote` (each hand by `leaning`, with `word` and `wearyOf`), `caseAgainst` with `sightedAs` and `belied`; refused: `refusedInquiry`; `angerAfter`, `walkoutIf`; overnight `coolOff`) → `unmasked` (and `stoodWithYou`) or `sentAway`, then the camp's reaction (`stir` in `people/camp.js`) and `settleSaid` |
| The deed | `game/deed.js`, offered of an evening in `campActs`: `deedScene` (whom) → `deedMeans` → `deedPlant` → `deedSet`; in the small hours `deedNight` (`awayTonight`); the morning after `deedMorning`, at later dawns `deedDawn`, and the camp's judgement `youVote` |
| The night and the morning | `game/night.js`: `nightfall` (now and then `visitTonight` and `visitScene` first, `people/visit.js`; with the rite complete already, straight to `finaleIntro`) → `nightComes` → `resolveNight`, told in parts (`partsTold`): `theNight` (`liesLow` in `people/cunning.js`, or, with nobody of the cult left at large, the power below by itself (`night.priestless`), or `chooseVictim` (now and then `betrayal`: one of the cult kills another); `chooseWatch`, `yourDream` (`game/yourdreams.js`), `guestStrikes`, `attackOnYou` or `attackOnThem` (`deathHow`, `deathText` in `world/deaths.js`) or `herNight`, `leaveTrace` (with `framedBy` and `sloppy` from `people/cunning.js`, and `thiefSees`), `deedNight`, `dreamTonight` (the Dreamer's dream, once the night has done its work), `dreadNight` and `riteNote` (`game/dread.js`)), then `dawn` (the new day; `coolOff` and `relentAtDawn` in `game/verdict.js`; `driftTenor`, the season's mood turning, `game/tenor.js`), `visitMorning` and `theMorning` (`cornerClaims`, `griefFor` (with `mourners` and `ontoSaid`), the sign, `findsTray`, `keptSaid`, `breakfastDreams` (`dreamAloud`, `answerDream`), `socialMorning` in `people/social.js` (with `rumorsOfYou`, `morningConfession`, `feudAgain`, `breakfastTalk`; a mourner comforted in talk: `consoled`), `deedMorning`, `morningEvent` in `game/events.js` (`newsToday`, by strand)); each extra crowds out the next (`room`, `brought` in `game/tenor.js`), and the strands the mood favours come first → `startDay` |
| The descent | `game/finale.js`: `finaleIntro`, `companionScene` (`volunteers`, `willCome`), `gate1`, `between` (`game/below.js`), `gate2` (`gate2Traitor`, or `gate2Eyes` while a patient traitor `waits`), `between` again, `gate3`, `sanctum` (`sanctumBody`, `sanctumActs`; `turnAtTheEnd`), `finalAct` |
| The ending | `game/endings.js`: `ending` → `romances` (`game/fates.js`), `endingId`, `endReckon` (the score), `endConduct`, `endStyle`, `yourLast` and `endSelf`, `lastSaid`; then `endAfter` (`afterDeaths`, then `endFate` per person, `game/fates.js`) and `game/debrief.js`: `endFactors` (one `fx…` section per subject: the cult's dreams, the Dreamer, your own dreams, the Watcher, the thief, the deed and the night visit each have their own; `claimEnd` tells how a claim ended), `endNumbers`, `endTruth` (`fateText`); the cult's craft in `fxCunning` (`betrayalLines`); the words are in `data/endings.js` and `data/fates.js` |
| The screen | `ui/scene.js`: `show` → `paintScene` (the words), `entrance` (a short fade, through the Web Animations API, so the page is never laid out just to restart one), `renderAll` (`renderMeters`: the meters in words, `METER_SAY`; `renderMap`, `renderBook` in `ui/book.js`), `keepInView` (when the page is next drawn), and the `scene` event (`ui/cues.js`: the picture, `sceneSVG` in `ui/art.js`, and the sounds). Everything is put on the page through `draw`, which leaves alone what already shows exactly the same; every picture names its ids with a prefix of its own (the casebook, the scene, the ending), so the same picture always comes out the same |

The header of `game/state.js` lists every field of the season's state `S` and what it holds. Every number that tunes
the game is in `src/rules.js`: the scales trust and suspicion run on (`RULES.scale`), the chances and weights of every
rule, the faces people make (`FACES`), and what an ending counts and remarks on (`END_HAUNT_W`, `END_SAYS`).

## Code style

Formatted with Prettier (`.prettierrc.json`; `npm run format`), which the test suite checks. `src/rules.js` and `build.js` are laid out by hand as
tables with aligned comments, and left alone (`.prettierignore`). `test/lint.js` reads the script the way the browser
does, every module in one global scope, and reports, as `module:line`, any name used but never declared, declared but
never used, or hiding a name from an outer scope.

## Tests and simulators

Most of them drive the built page in headless Chromium (Playwright); `test/lib/harness.js` opens pages and
`test/lib/inpage.js` holds the shared in-page helpers (text checks in both languages, play policies). The rest run the
game in Node: `test/lib/kernel.js` loads the modules of `src/` as the page joins them into a VM with the page stubbed,
deals and plays seasons there (a season in a tenth of a second or less), and `test/trace.js browser` keeps it honest
against Chromium, die for die and word for word. A season is
played inside the page in one go, rather than a step at a time from outside, and the suite runs its steps side by
side, one for each processor core (each in its own process and browser, so nothing one step plays touches another).

```
node test/run.js              # the quick suite, about a minute and a half on two cores       (npm test)
node test/run.js full         # more games, the bots and the puzzle simulation: about three   (npm run test:full)
JOBS=1 node test/run.js       # one step at a time
```

| Script | What it checks |
| --- | --- |
| `lint.js` | The whole script as one: undefined names, unused names, locals hiding globals, the usual slips, and any number read from the rules tables that is not there (read directly, or through a local name for a table). |
| `dice.js` | Rules 4 and 5 above, checked as the game runs: a season played with the language switched, every casebook tab opened and everything repainted before every click (the ending's page too) plays out word for word as one played plainly, throws no die and leaves the state untouched; the ending throws no die; and the dice keep to their caps (`scale.surest`, `scale.rarest`; `vary`, `clamp`). |
| `topbar.js` | The top panel and the casebook tabs keep their places when the language changes or the sound is switched off, at three widths. |
| `trace.js` | The dice trace: 208 seasons from fixed seeds (the golden ones and 200 more) played in Node by a seeded choice among each scene's choices, every die thrown (`core/random.js`, `TRACE`: its kind, its odds, what came up) and every word of every scene in both languages, and of the casebook every fifth step, against the recording (`check`; `record`). A change that must not change play leaves it identical; `diff --base=<git ref>` plays each season in that ref's code and in the working tree side by side and shows the first step that parts: the words, or the die and who threw it. `browser` plays twenty of the seasons in Chromium, which the Node kernel must agree with. |
| `golden.js` | Seeded playthroughs that record everything a player can read, in English and in Russian. A refactor must leave them identical (`check`); a change to the game is re-recorded on purpose (`record`). `leaks` scans for untranslated text. |
| `forced.js` | The rare branches, forced: every piece of morning news as it comes and as it comes heavy, the season's moods (their arrivals, nights, first lights, turns and names, the season's course, growing used to horrors), the first light of a short day, a quarrel flaring up again and a pretender owning up in private, every horror outside the tomb and the scorched circle, every way a sign is told, a planted trace seen through, a careless night, a slip of the tongue, every inquiry outcome (the camp backing you, refusing you each way it can, walking out, and the strike the next day; an evening after one that came to nothing), the night's dead in each kind of death, volunteers and every kind of refusal at the stair, a traitor below and one who waits until the end, everything that waits between the gates and every choice there (and one who falters when the other companion was left behind), every way an act in the sanctum can fail and the sanctum with nothing left to try, the wrong charm that worked all the same (the ending and the debrief), confessions (the cult giving up a false part among them) and rumours, every kind of public moment, flirtation and its faces, the thief's hints and naming, every ending kind, the fates and romances, what becomes of you, every way each power takes its dead, the casebook and an inquiry played hardcore, one of the cult killing another (and once driven off), and the night visit and the deed, every way each turns; and the rarer turns of chance (a scribe's error, a stray sign, a habit misnoted, a death in another power's manner, a quiet night, a refusal half forgiven, the thief saying it aloud, a grave with nothing written in it, the dig's dangers wherever they leave a scar, and every uncertain turn below). Recorded per language like the golden transcripts. |
| `claims.js` | Claims in Crane's diary: the share of each kind of lie, how true each kind of dreamer is, confessions under trust and pressure. |
| `social.js` | The social layer over many talkative seasons: invariants (the honest hardly ever lie, counted as rare; the cult never confesses, suspicion stays in range, no public moment moves more than its cap, flirtation only across the sexes and never from a priest, the thief names only someone he saw, and a second only if he would, only the cult plants traces and lets slip what only the attacker knew, one of the cult dies only by another's hand, nobody has two romances, romances only between a man and a woman and never with the priest, the accused never votes and a verdict passes only as the rules say, no inquiry after the camp walked out, the cult taking a claim back before everyone only as a pretender would come clean), gossip accuracy by temperament, how many people each kind of public moment moves, how the cult's likes weigh on its victims, rumours, refusals, the cult's craft, who went down and what the cult did there, horrors outside the tomb, the camp's verdicts and the cult's hands at them. |
| `gods.js` | The puzzle is sound: every tablet line is true but for a scribe's error (each of which must be false), no line alone names the power, all of them together pin everything down; and how often a line is a scribe's error. |
| `endings.js` | Every one of the nineteen endings, forced, in both languages, each with its own picture. |
| `dooms.js` | After a doom: every line of what it did to each of the seven, for each of them, in both languages; then doom endings forced from half-played seasons, every nature in turn: the epilogue scanned, nobody told twice, no line told twice, the dead told as dead, and every way it can go turning up, counted by where the end found each of them (when a way has not come in the seasons asked for, it plays on, to three times as many, until it has). |
| `replay.js` | Seasons from their seeds: one season played from its code and printed as a player reads it, or many (`--fuzz=N`, their seeds dealt from one code), every scene and casebook page scanned in both languages and page errors caught; the codes that went wrong are named, to replay one by one. |
| `rubot.js` | Random play with the language flipping back and forth, read the way a person reads the page. |
| `bot.js` | A random clicker that must never get stuck, and a cheat who knows the cult and builds a case before accusing: it must never accuse an innocent, and must win by inquiry at least now and then (the camp backs a case, not a hunch). |
| `puzzle.js` | A logician who sees only the casebook: how often the power and its ward can be pinned down. Uses `solver.js`. |
| `endstyle.js` | Personas that lean one way, to calibrate the ending styles' constants in `rules.js`. |
| `rutalk.js` | Every conversation option with every person, in Russian, printed for proofreading. |
| `endshot.js`, `endsheet.js`, `faces.js`, `notebook.js`, `social-shot.js` | Screenshots into `test/shots/`, to look at (`faces.js`: every person in every mood). |
| `pictures.js` | The README's pictures, into `docs/images/` (below). |

## Simulations

The measurements behind the numbers in [RULES.md](RULES.md) and the rulebook, run on the built page with the same
harness and play policies as the tests (`test/lib/`). They report rather than pass or fail, except where noted.

```
node sim/balance.js           # how seasons end: 7 ways of playing × 150 seasons × 3 seeds (3,150), about 5 minutes
node sim/scan.js              # 360 seasons scanned for anything a reader should never meet
node sim/tells.js             # what each thing people do says about the cult, as likelihood ratios
```

| Script | What it measures |
| --- | --- |
| `balance.js` | The odds of defeat, a hard win and a clean win, with Wilson 95% intervals; how the defeats come; every ending's odds. The figures in RULES.md ("How seasons end") and the rulebook ("How often each ending comes") are its output. `--rules='{…}'` plays the same with numbers in `rules.js` changed; `--by=mood,power,bg,style` breaks the results down; `--out=` writes every season as JSON. |
| `scan.js` | Many seasons with every policy, in both languages: markers and untranslated text, numbers on screen during play, English slips, gendered Russian for the player, two choices with one label, talking with someone no longer free, values out of range, stuck seasons, page errors. Exits 1 if anything a reader must never meet turns up; the slips and the Russian are listed to look at, since the patterns that find them also find a few lines that are right. |
| `tells.js` | For each thing a player can see (night accounts, dreams told, faces and greetings at trust 0 and 1, answering a dream for the one it named), its rate among the cult and among the innocent, and the likelihood ratio between them. The game keeps every single tell between about 0.5 and 2, so that the cult is found by reasoning over many things, never by counting one. |

## Pictures for the README

`node test/pictures.js` takes the README's pictures into `docs/images/`, from fixed seeds and fixed choices, with the
game's own typefaces served from the `@fontsource` packages (the tests block web fonts; here they are wanted), so the
same build takes the same pictures. Retake them when the screens they show change, and look at each one before
committing it: a picture for players must not give a season's secrets away.

## Publishing a build

1. **A build is a version.** Raise `version` in `package.json` (the build stamps it into the top panel): a new feature
   or a change to the rules raises the middle number, a big or risky change the first (27.1.0, then 28.0.0), a fix
   alone the last.
2. **The documents, in the same commit as the code:** RULES.md (the rules, and "How seasons end" from `node
   sim/balance.js`), the tells (`node sim/tells.js`: every one between 0.5 and 2), the rulebook doc on claude.ai and its
   copy in `docs/rulebook.md`, REQUIREMENTS.md, CHANGELOG.md (a section for the new version, which becomes its release
   notes), and the README's pictures if the screens they show changed.
3. **The whole suite passes:** `node test/run.js full`.
4. **Push the branch.** The _Tests_ workflow (`.github/workflows/tests.yml`) runs the whole suite on every push and
   pull request, on the Node version in `.nvmrc` and the Chromium that Playwright installs.
5. **Bring `main` up to the branch and push it.** The _Publish_ workflow (`.github/workflows/publish.yml`) runs the
   suite again, puts the game on GitHub Pages (https://ilia-r-s.github.io/the-gates-of-kutha/, a season code works
   there as `?seed=1A2B-3C4D`), and, when this version has no release yet, tags it `v` + the version and makes a GitHub
   Release with the game as one file (`the-gates-of-kutha.html`) and the version's section of CHANGELOG.md as its
   notes. It can also be run by hand (Actions, _Publish_, _Run workflow_). `.github/site.js` puts the site together: the
   standalone page as `index.html`, with a description and a picture for link previews.
6. **The copy on claude.ai** (https://claude.ai/artifact/MNvZTKZjAiefFQdAghxAJa) is republished from `kutha.html`.
