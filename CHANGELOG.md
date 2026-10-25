# Changelog

Every build of _The Gates of Kutha_, newest first. The build number is set in `package.json` and shows in the game's
top panel. Each build pushed to `main` is published on GitHub Pages and as a GitHub Release, with its section of this
file as the release notes (`.github/workflows/publish.yml`). Builds before 26.1.0 came before this repository.

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
[DEVELOPING.md](DEVELOPING.md), [CLAUDE.md](CLAUDE.md) and this changelog, with the README's pictures taken by
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
