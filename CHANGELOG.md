# Changelog

Every build of _The Gates of Kutha_, newest first. The build number is set in `package.json` and shows in the game's
notebook. The single workflow tests pull requests and builds pushed to `main`; deployment is restricted to `main` non-PR events. Builds before
26.1.0 came before this repository.

## 29.1.0 — 2026-11-03

**Words in context.** Reviewed English and Russian prose against the scenes that deliver it. Morning signs no
longer describe an already-observed noon or afternoon, or move today's event to yesterday. Their notebook labels
and tablet formulas agree with the observations. Removed unsupported timing from morning grief, weather and
gossip; corrected Russian grammar, idioms and interpolated names, and brought recollections into line with the
scenes they recall. A quiet night no longer denies dreams or sabotage. The Russian actions are now
«Изучить место нападения» and «Обыскать местность». The project guideline puts spirit, voice and natural reading
ahead of literal translation, while preserving consequential facts, clues and uncertainty.

**More room in the morning.** Additional omen/nature passages and a second news event have lower chances;
rare doubles remain possible. Primary dawn clues, testimony, dreams and required consequences keep their
opportunities. In matched 1,024-expedition samples, multiple outdoor passages fell from 20.33% to 6.32% of
displayed mornings, and double news from 2.60% to 1.05%. The [review](docs/research/2026-11-02-text-and-pacing.md)
gives denominators, outcome checks and limitations. This is pacing adjustment, not a new cult strategy.

**The same session music.** The five daytime tracks and requested current track now travel with the expedition's
existing local save. Reloading or reopening restores the selection after replay without consuming either seeded
stream. Playback starts afresh when audio becomes available. Invalid or missing music fields have a validated
fallback. The pacing change makes 29.0.0 expedition saves incompatible with 29.1.0; the existing edition notice
explains this. Language, sound and viewpoint preferences remain independent.

**Verification.** Editorial/music preservation and intentional pacing differences have separate fixed-seed proofs.
The follow-up chronology review preserves all actions, non-text state and both streams in 48 regression seasons.
New 29.1.0 fixtures retain all original sample counts; published 29.0.0 and recovered original fixtures are
unchanged and protected against recording. The morning-density diagnostic counts each dream once. Browser
coverage includes closing every expedition tab and reopening it with the same music. README images were
recaptured from genuine default-view play. See the [release evidence](docs/research/2026-11-02-text-and-pacing.md#evidence-and-reproduction).

## 29.0.0 — 2026-11-01

**The scene and the notebook.** Illustration, story and choices lead the screen. Map, people, evidence, omens, kit
and settings open in a notebook overlay. Keyboard navigation, modal focus, narrow screens and both languages have
real-input coverage in Chrome, Firefox and WebKit. One current expedition resumes automatically with its language,
scene and both dice streams. Invalid codes and unavailable storage receive visible explanations. The owner-approved
frightened expression is distinct from surprise. After comparing the music exports, the owner selected the original
Bayati arrangement; the spacious variant and other art/music experiments remain local review material.
Third person remains the default, with first person selectable at any time in the casebook. Both preserve the
original right-hand character staging. The chosen view is remembered independently of the expedition.
Season-code fields, explanations and replay controls remain hidden until the secret title control is pressed;
linked codes no longer reveal them automatically. Fractional wounds and nerve loss now receive consistent
condition descriptions, and serious wounds are distinguished from grave ones.

**A subtler camp.** The cult's five threat decisions now use public opposition and dreams that actually reached it.
Shared camp influence supports second voices, evidence doubts grounded in witnessed activity, one-use friendly
intervention, a single planted item and fallible recollections of who influenced a wrong vote. Recalled sources must
have spoken before voting began; simultaneous co-votes cannot become earlier causes. Private alarm can
only nudge a shared attack lottery: direct retaliation had made conversations too revealing. New uncertain images
across six channels give partial clues to the power's favored ways.
Dream-defence eligibility now shares the fondness requirement across factions; any bounded cult preference uses
earlier public dreams and public danger instead of other people's private suspicions.
Additional overnight images share a separate atmospheric budget, making crowded nights much rarer while preserving
the main dawn clue, evidence finds and required consequences. The README uses a complete quieter night from genuine play.

**Limited points of view.** Actor memories distinguish observation, inference, doctrine and truth. Gossip cannot
read another person's private feelings; scholars interpret presented inscriptions; a cultist's ward doctrine can
be wrong. Public deed allegations follow available evidence, including possible false accusations. A distressed
expression no longer reads others' unspoken thoughts. A contradictory ending in which a dead companion fetched
help is corrected. Three owner-approved edits temper the Confidant and quiet-player endings and improve the Russian
line about dreams and heat. The standing guidelines explicitly require exceptionally subtle cult strategy and justified
knowledge for every actor, including supernatural cases.
They also state the cult's objective explicitly: completing the rite, with violence serving that objective.
After the exact framework migration, slips, abandoned pretences and dream-report decisions were separately
changed to use received pressure, audience-specific reports, remembered membership and justified ritual
expectations. Their paired outcome study is kept separate from the preservation proof.
Conversation portraits now follow the current reply rather than generic greeting warmth. A cautious friend does
not respond angrily to a confidence or call the player a stranger. Eyewitness accounts have varied recounting
expressions instead of a forced frightened face. Eleven further selected bilingual prose changes clarify signs,
choices and attribution while keeping the established voice; the Scholar ending no longer claims knowledge
the player did not demonstrate.
Object fear and greed now start from shared temperament odds, with small non-stacking motives from remembered
doctrine, personally delivered signs, dreams or smuggling concerns. Initiation beliefs about the power's nature can
be wrong. A fresh 20,000-expedition study finds no supported outside-band comparison after repairing two detected
expression tells; 27 comparisons remain inconclusive. Local probability bounds do not substitute for that measurement.

**Verification and maintenance.** Repaired the test-policy random generator, removed hidden answers from ordinary
simulated players and made puzzle evaluation play the real finale. Tell studies now report opportunities,
season-clustered uncertainty and supported failures; a health-aware observation-only player gives a stronger
benchmark. Original fixtures remain intact, with separate 29 expectations and reviewed differences. Hazard costs
move out of prose, vague catalog keys and dead paths are removed, and dynamic translations no longer accumulate
across expeditions. The minimatch advisory is resolved with a pinned tooling override. Pull requests use the same
full quality gate as publication.
The standing resource priorities are token/context efficiency first, speed second and storage third.
The browser harness prevents known macOS sandbox launches that caused Chrome crash alerts and supports reusing an
isolated test server. An indexed architecture guide explains the game lifecycle, system ownership and working methods.
Native macOS resource admission now reserves desktop headroom, adapts to memory pressure and bounds child heaps/output;
manual concurrency cannot waive memory safeguards. Pressure failures report incomplete checks instead of dropping coverage.
Superseded plans/reviews, the duplicate old rulebook and rejected full-height rendering are removed. Research is
organized by topic with current implementation/tests, and long-term learning work has one retained roadmap.

**One decision framework.** Named definitions share subject/action/optional object, knowledge authority,
ordered resolution and typed relationship effects. Migration preserves the selected gameplay, rendered scenes and
both seeded streams across 96 independent before/after expeditions. Audited observations support local baseline,
shadow, declarative-policy and accepted-result replay experiments for player, individual and collective-cult decisions.
The four initial legacy information paths were subsequently repaired under separate authorization. Normal play
loads no model or experiment policy; training and learned behavior remain deferred.

The [current rules](docs/rules.md), [research index](docs/research/README.md),
[editorial review](docs/research/2026-11-01-editorial.md) and
[presentation review](docs/research/2026-11-01-presentation.md) explain decisions and limits.
The [validation record](docs/research/2026-11-01-validation.md) collects final checks, measured results and remaining uncertainty.
Neural networks and learned actors remain deferred; the [roadmap](docs/roadmap.md) describes the next experimental stages.

## 28.5.2 — 2026-11-01

**Source recovery and maintenance.** Restored editable source for the recovered 28.5.1 game and prepared the cleaned
project for publication. This version establishes the single-commit baseline on `main`. Game rules, narrative output
and seeded outcomes are unchanged.

Removed unused facade methods and helpers, duplicate output formats, the artifact host wrapper and obsolete release
automation. The build now produces one complete `The Gates of Kutha.html`. Shared compiler tooling reuses parsed
syntax; conservative minification trims unused code and shortens local bindings. Gameplay and both seeded streams
remain covered by original-release baselines, including 48 complete seasons checked independently in Node and Chrome.

Updated development dependencies and their lockfile. Consolidated project rules in [AGENTS.md](AGENTS.md), with explicit
requirements for aggressive refactoring, shared gameplay foundations, execution efficiency and economical context use.
The local Node distribution and caches live in ignored `.local/`. Archived the surviving research and deferred plan;
refreshed the README and its genuine seeded gameplay pictures. No deferred 29.0.0 gameplay proposals were implemented.

## 28.5.1 — 2026-10-29

**Recovered locally on 2026-10-31.** Reconstructed editable source from the preserved HTML after the intervening
commits were lost. The initial rebuilt page was byte-identical (1,282,595 bytes; SHA-256 pinned in `test/fixtures/recovery.json`).
Prose, labels and translations now live in keyed JSON catalogs loaded at build time. Shared systems have separate
modules; targeted source/text inspection keeps routine edits small.

State-heavy checks and simulations use the shipped code in Node, verified against Chrome over 48 complete seasons.
The runner shares one browser, bounds workers by CPU/memory, and retains existing sample counts. Golden recordings
come from the preserved page and store SHA-256 field digests. The initial recovery made no gameplay changes and
was completed locally before publication of 28.5.2.
The intervening historical changelog entries could not be recovered verbatim; see [the recovery record](docs/recovery.md).

## 27.1.3 — 2026-10-25

**Changed.** The casebook's Kit shows the season's code, and what it is for, only once the season-code box on the title
screen has been opened; the ending page still shows it.

**For developers.** `test/forced.js` checks that the Kit shows the code once the box has been opened.

## 27.1.2 — 2026-10-25

**Changed.**

- The season-code box no longer shows on the title screen. A code in the page's address (`…/?seed=1A2B-3C4D`) still
  deals that season, and shows the box with the code filled in; _Play this season again_, at the end, needs no code at
  all. Whether the box can be opened any other way is left for you to find.
- The Omens notebook no longer opens with a paragraph explaining how signs, powers, titles and charms fit together; the
  reckoning starts straight with its rows.

**For developers.** `test/forced.js` checks the title screen's season-code box: out of sight, opened, and filled for a
code given.

## 27.1.1 — 2026-10-25

**Fixed.** On the title screen the season-code box starts in line with the surname box, in both languages; on a narrow
screen each label stands over its box, and the boxes still line up.

**For developers.** `test/dooms.js` plays on past the seasons asked for, to three times as many, until every way a doom
can go has turned up, so that an unlucky deal no longer fails the quick suite.

## 27.1.0 — 2026-10-25

**New in the game**

- **Season codes.** Every season is dealt and played from one seed, shown as a code such as `1A2B-3C4D` in the
  casebook's Kit and on the ending page. Type a code on the title screen, or open the page with `?seed=1A2B-3C4D`, and
  the same season is dealt again; the same choices play it the same way. _Play this season again_ at the end does it
  for you.
- **What someone thinks of you.** Gossip may now be about how another of the camp feels about you, true or not, told to
  you or overheard.
- **A night in your tent is talked about.** Told badly, as a scandal, or kindly, it may change what each hearer thinks
  of her and of you, by their temperament, their feelings and what has passed between them; told before her, she
  remembers who told it, and how.
- **After a doom.** When the gate opens, the epilogue tells what it did to each of the seven, by where the end found
  them: taken, marked, fled, stayed to help, joined it, freed from a cell, or untouched; the night's dead go unburied.
- **Faces.** Each person has a sly look of their own: a wink, a sidelong glance, an arched brow, heavy-lidded bedroom
  eyes, a look from under the lashes. The night visitor's face at the tent pole, and as you answer her.
- **On the page.** With JavaScript off, the page says so in both languages and how to turn it on. Until the browser
  lets sound play, the place where the music's name shows says that the music starts with your first click or tap.

**Balance.** Unchanged within noise: defeat 90.2%, hard victory 7.6%, clean victory 2.3% over 3,150 simulated seasons
(27.0.0: 90.0%, 7.8%, 2.2%). Every tell of the cult stays within a likelihood ratio of 0.5–2.

**Fixed.** Doom epilogues that could tell the same line twice in one ending, or read wrongly in Russian; staying to help
now happens to those below with you too.

**For developers.** `test/replay.js` plays any season code, or fuzzes thousands and names the failing ones;
`test/dooms.js`; `REQUIREMENTS.md`, `.nvmrc` and `engines`. The docs are reorganised: a README for players,
[DEVELOPING.md](DEVELOPING.md), the working rules (now [AGENTS.md](AGENTS.md)) and this changelog, with the README's pictures taken by
`test/pictures.js`. GitHub Actions run the tests on every push, and publish each build on `main` to GitHub Pages and as
a release.

## 27.0.0 — 2026-10-25

A review of the whole game in six areas (endings and the descent, nights and people, days and the screen, the tablets
puzzle, the language, the code and the docs): about 165 findings, about 150 of them fixed.

- Nine tells of the cult closed, each now within a likelihood ratio of 0.5–2: the shapes of night accounts, the
  courteous mask and greetings, the cult scholar's lines, dreams before breakfast, in parting and when asked, the
  confession at the accusation, the sanctum, study topics and stray signs.
- Eight more certainties became chances (among them the tent guest who spares you, the sanctum's feint, the camp's
  judgement of you, your own dreams).
- The counter-dream: the cult answers a dream for its partner mostly when rash, or when it pays, and then holds to its
  story.
- The code laid out by Prettier, which the test suite checks.
- Balance: defeat 90.0%, hard victory 7.8%, clean victory 2.2%.

## 26.1.0 — 2026-10-24

The first build in this repository, with the players' rulebook.
