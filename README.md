# The Gates of Kutha

A single-page Lovecraftian hidden-role mystery set at a 1926 excavation in Iraq. Seven people are at the dig. Two of them serve
something under the mound. You have five days to find them, work out which power they serve and what binds it, and stop
the rite. English is the game; Russian is a full translation that can be switched on at any moment. Each expedition
begins with your reply to the Trustees, which settles how your casebook is kept for the season: the usual way, which
joins up what you learn, or hardcore, which keeps only the bare record and leaves the rest to your own judgement. Every
season has a mood of its own (still, uneasy, haunted, full of talk, or full of comings and goings), which drifts as the
season goes and decides how much happens of itself: some seasons are quiet and close, others crowded with horrors,
quarrels or news.

The rules of the game, in words and with every number, are in [RULES.md](RULES.md), written for whoever tunes the game:
each number is named as it is in the code. [The Complete Rulebook](docs/rulebook.md) tells the same rules for a reader,
with how often each ending comes; it is a copy of the rulebook doc on claude.ai
(https://claude.ai/artifact/EkqSDY5vtcA6RnGVHxyUjf), taken at build 26.1.0.

## Building

```
npm install                   # the development tools: Playwright, Prettier, ESLint, Terser (the game itself needs nothing)
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
the top panel, beside the title ("build 26.1.0"), so a player can tell which build is on the screen; raise it with
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
| Title screen, arrival | `ui/intro.js`: `introScene` (who you are) → `replyScene` (your reply to the Trustees: the casebook kept the usual way, or hardcore, for the whole season) → `newGame` → `arrivalScene`. Played hardcore, `bare()` in `ui/book.js` leaves out everything the casebook would join up for you |
| Dealing a season | `game/state.js`: `newGame` → `dealParts` (the seven parts and the hierophant, first of all, by a fair shuffle) → `freshSeason`, `dealCast` (traces, temperaments), then `dealGods` (`world/powers.js`: `dealSigns`, `dealWards` (and each charm's riddle), `dealTitles`; `buildFacts` writes the tablets), `assignClaims`, `assignLikes`, `campInit`, `assignFlirts` (`people/`), `crane0` (the night Crane died), `dealWord` (how far each of the camp takes your word), `dealTenor` (the season's mood, `game/tenor.js`), `dealYourDreams` (how often you dream, and how true: `game/yourdreams.js`), and the cult's patience (`S.patience`: how readily it lies low) |
| A day, three slots | `game/day.js`: `startSlot` (`placeChars`) → `planScene` → `goTo` a place (`campActs` in camp) → search, translate, examine (`doExamine`: `traceGenuine`, `tracePlanted`, `traceThief`), rest, or `talk` (`ui/talk.js`: `meet`, `askThem`, `talkLeave`; `greeting`, `faceFor`, `parting` in `people/manner.js`, its faces in `FACES`; answers in `people/dialog.js`, `DIALOG`: small talk in `curtTalk`, `scholarTalk`, `smallTalk`; whom they distrust in `dreamToTell`, `whomToBlame`; pressed in `pressedCult`; owning up in `ownUp`, `OWN_UP`, `people/pretences.js`) → `endSlot` (and `dreadNow`, `game/dread.js`) |
| An inquiry | `game/inquiry.js`: `inquiryScene` (`markSay`: your mark beside each name; `angerSay`), `accuse` → the camp's verdict (`game/verdict.js`: `campVote` (each hand by `leaning`, with `word` and `wearyOf`), `caseAgainst` with `sightedAs` and `belied`; refused: `refusedInquiry`; `angerAfter`, `walkoutIf`; overnight `coolOff`) → `unmasked` (and `stoodWithYou`) or `sentAway`, then the camp's reaction (`stir` in `people/camp.js`) and `settleSaid` |
| The deed | `game/deed.js`, offered of an evening in `campActs`: `deedScene` (whom) → `deedMeans` → `deedPlant` → `deedSet`; in the small hours `deedNight` (`awayTonight`); the morning after `deedMorning`, at later dawns `deedDawn`, and the camp's judgement `youVote` |
| The night and the morning | `game/night.js`: `nightfall` (now and then `visitTonight` and `visitScene` first, `people/visit.js`) → `nightComes` → `resolveNight`, told in parts (`partsTold`): `theNight` (`liesLow` in `people/cunning.js`, or, with nobody of the cult left at large, the power below by itself (`night.priestless`), or `chooseVictim` (now and then `betrayal`: one of the cult kills another); `chooseWatch`, `dreamTonight`, `yourDream` (`game/yourdreams.js`), `guestStrikes`, `attackOnYou` or `attackOnThem` (`deathHow`, `deathText` in `world/deaths.js`) or `herNight`, `leaveTrace` (with `framedBy` and `sloppy` from `people/cunning.js`, and `thiefSees`), `deedNight`, `dreadNight` and `riteNote` (`game/dread.js`)), then `dawn` (the new day; `coolOff`; `driftTenor`, the season's mood turning, `game/tenor.js`), `visitMorning` and `theMorning` (`cornerClaims`, `griefFor` (with `mourners` and `ontoSaid`), the sign, `findsTray`, `keptSaid`, `breakfastDreams` (`dreamAloud`, `answerDream`), `socialMorning` in `people/social.js` (with `rumorsOfYou`, `morningConfession`, `feudAgain`, `breakfastTalk`; a mourner comforted in talk: `consoled`), `deedMorning`, `morningEvent` in `game/events.js` (`newsToday`, by strand)); each extra crowds out the next (`room`, `brought` in `game/tenor.js`), and the strands the mood favours come first → `startDay` |
| The descent | `game/finale.js`: `finaleIntro`, `companionScene` (`volunteers`, `willCome`), `gate1`, `between` (`game/below.js`), `gate2` (`gate2Traitor`, or `gate2Eyes` while a patient traitor `waits`), `between` again, `gate3`, `sanctum` (`sanctumBody`, `sanctumActs`; `turnAtTheEnd`), `finalAct` |
| The ending | `game/endings.js`: `ending` → `romances` (`game/fates.js`), `endingId`, `endReckon` (the score), `endConduct`, `endStyle`, `yourLast` and `endSelf`, `lastSaid`; then `endAfter` (`afterDeaths`, then `endFate` per person, `game/fates.js`) and `game/debrief.js`: `endFactors` (one `fx…` section per subject: the cult's dreams, the Dreamer, your own dreams, the Watcher, the thief, the deed and the night visit each have their own; `claimEnd` tells how a claim ended), `endNumbers`, `endTruth` (`fateText`); the cult's craft in `fxCunning` (`betrayalLines`); the words are in `data/endings.js` and `data/fates.js` |
| The screen | `ui/scene.js`: `show` → `paintScene` (the words), `entrance` (a short fade, through the Web Animations API, so the page is never laid out just to restart one), `renderAll` (`renderMeters`: the meters in words, `METER_SAY`; `renderMap`, `renderBook` in `ui/book.js`), `keepInView` (when the page is next drawn), and the `scene` event (`ui/cues.js`: the picture, `sceneSVG` in `ui/art.js`, and the sounds). Everything is put on the page through `draw`, which leaves alone what already shows exactly the same; every picture names its ids with a prefix of its own (the casebook, the scene, the ending), so the same picture always comes out the same |

The header of `game/state.js` lists every field of the season's state `S` and what it holds. Every number that tunes
the game is in `src/rules.js`: the scales trust and suspicion run on (`RULES.scale`), the chances and weights of every
rule, the faces people make (`FACES`), and what an ending counts and remarks on (`END_HAUNT_W`, `END_SAYS`).

## Code style

Formatted with Prettier (`.prettierrc.json`; `npm run format`). `src/rules.js` and `build.js` are laid out by hand as
tables with aligned comments, and left alone (`.prettierignore`). `test/lint.js` reads the script the way the browser
does, every module in one global scope, and reports, as `module:line`, any name used but never declared, declared but
never used, or hiding a name from an outer scope.

## Tests and simulators

All of them drive the built page in headless Chromium (Playwright); `test/lib/harness.js` opens pages and
`test/lib/inpage.js` holds the shared in-page helpers (text checks in both languages, play policies). A season is
played inside the page in one go, rather than a step at a time from outside, and the suite runs its steps side by
side, one for each processor core (each in its own process and browser, so nothing one step plays touches another).

```
node test/run.js              # the quick suite, about a minute on two cores                  (npm test)
node test/run.js full         # more games, the bots and the puzzle simulation: about two     (npm run test:full)
JOBS=1 node test/run.js       # one step at a time
```

| Script | What it checks |
| --- | --- |
| `lint.js` | The whole script as one: undefined names, unused names, locals hiding globals, and the usual slips. |
| `topbar.js` | The top panel and the casebook tabs keep their places when the language changes or the sound is switched off, at three widths. |
| `golden.js` | Seeded playthroughs that record everything a player can read, in English and in Russian. A refactor must leave them identical (`check`); a change to the game is re-recorded on purpose (`record`). `leaks` scans for untranslated text. |
| `forced.js` | The rare branches, forced: every piece of morning news as it comes and as it comes heavy, the season's moods (their arrivals, nights, first lights, turns and names, the season's course, growing used to horrors), the first light of a short day, a quarrel flaring up again and a pretender owning up in private, every horror outside the tomb and the scorched circle, every way a sign is told, a planted trace seen through, a careless night, a slip of the tongue, every inquiry outcome (the camp backing you, refusing you each way it can,
walking out, and the strike the next day; an evening after one that came to nothing), the night's dead in each kind of death, volunteers and every kind of refusal at the stair, a traitor below and one who waits until the end, everything that waits between the gates and every choice there (and one who falters when the other companion was left behind),
every way an act in the sanctum can fail and the sanctum with nothing left to try, the wrong charm that worked all the same (the ending and the debrief), confessions (the cult giving up a false part among them) and rumours, every kind of public moment, flirtation and its faces, the thief's hints and naming, every ending kind, the fates and romances, what becomes of you, every way each power takes its dead, the casebook and an inquiry played hardcore, one of the cult killing another (and once driven off), and the night visit and the deed, every way each turns; and the rarer turns of chance (a scribe's error, a stray sign, a habit misnoted, a death in another power's manner, a quiet night, a refusal half forgiven, the thief saying it aloud, a grave with nothing written in it, the dig's dangers wherever they leave a scar, and every uncertain turn below). Recorded per language like the golden transcripts. |
| `claims.js` | Claims in Crane's diary: the share of each kind of lie, how true each kind of dreamer is, confessions under trust and pressure. |
| `social.js` | The social layer over many talkative seasons: invariants (the honest hardly ever lie, counted as rare; the cult never confesses, suspicion stays in range, no public moment moves more than its cap, flirtation only across the sexes and never from a priest, the thief names only someone he saw, and a second only if he would, only the cult plants traces and lets slip what only the attacker knew, one of the cult dies only by another's hand, nobody has two romances, romances only between a
man and a woman and never with the priest, the accused never votes and a verdict passes only as the rules say, no
inquiry after the camp walked out, the cult taking a claim back before everyone only as a pretender would come clean), gossip accuracy by temperament, how many people each kind of public moment moves, how the cult's likes weigh on its victims, rumours, refusals, the cult's craft, who went down and what the cult did there, horrors outside the tomb, the camp's verdicts and the cult's hands at them. |
| `gods.js` | The puzzle is sound: every tablet line is true but for a scribe's error (each of which must be false), no line alone names the power, all of them together pin everything down; and how often a line is a scribe's error. |
| `endings.js` | Every one of the nineteen endings, forced, in both languages, each with its own picture. |
| `rubot.js` | Random play with the language flipping back and forth, read the way a person reads the page. |
| `bot.js` | A random clicker that must never get stuck, and a cheat who knows the cult and builds a case before accusing: it must never accuse an innocent, and must win by inquiry at least now and then (the camp backs a case, not a hunch). |
| `puzzle.js` | A logician who sees only the casebook: how often the power and its ward can be pinned down. Uses `solver.js`. |
| `endstyle.js` | Personas that lean one way, to calibrate the ending styles' constants in `rules.js`. |
| `rutalk.js` | Every conversation option with every person, in Russian, printed for proofreading. |
| `endshot.js`, `endsheet.js`, `faces.js`, `notebook.js`, `social-shot.js` | Screenshots into `test/shots/`, to look at (`faces.js`: every person in every mood). |
