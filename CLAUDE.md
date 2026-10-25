# CLAUDE.md

Working notes for Claude Code, and for anyone else, on _The Gates of Kutha_. Read them before changing anything. The
details live in the documents they point to: [DEVELOPING.md](DEVELOPING.md) has the map of the documents, the code's
layout, the tests and the release steps; [RULES.md](RULES.md) has every rule of the game with the names the code gives
its numbers.

## The project

A single-page Lovecraftian hidden-role mystery set at a 1926 dig in Iraq, in English and Russian. One HTML page, one
script built from `src/` (the modules `build.js` lists, concatenated into one global scope), no libraries at run time.
The owner directs the design; Claude writes the code, the pictures (SVG drawn in code), the music (Web Audio), the text
in both languages, the tests and the documents. Talk to the owner in English.

## Rules that always hold

The owner's standing instructions. None of them changes unless the owner says so.

1. **Nothing is certain.** Every outcome, answer and amount is a throw of the dice, never a certainty, however likely:
   `chance` never rolls surer than `RULES.scale.surest` (99%) or rarer than `scale.rarest` (1%), and amounts vary
   (`vary`). Exceptions are very rare, each with a serious reason, and are listed at the top of RULES.md ("Nothing is
   certain"); a new one needs the owner's word.
2. **Nothing is shown as a number.** No probability ever appears in play, and nerve, wounds, trust and the rite are
   told in words, never as numbers or limits. A choice says what it risks, never its chances.
3. **Both languages, always.** Every visible string goes through `bi(en, ru)`, or through the tables in `src/i18n/`; the
   Russian is a translation in its own right. The language can change at any moment, and every scene must read rightly
   in both.
4. **Who the people are.** The player's character is never given a sex, in either language. Romance in the camp is only
   between a man and a woman, and toward you only from the women at the dig; Père Anselm keeps his vows.
5. **No single tell.** Each thing the cult does differently from the innocent stays within a likelihood ratio of about
   0.5–2 (`node sim/tells.js`), so that the cult is found by reasoning over many things, never by counting one.
6. **Mysteries stay mysteries.** Never explain to the player how their own dreams work, nor anything else the game keeps
   hidden; truths come out in the ending's debrief.
7. **The look.** Keep the established style (v2: the 90s-cartoon portraits and scenes, drawn as SVG in code, on the
   page's night, lapis and gold). No character animation.
8. **The dice are part of the game.** A season is determined by its seed (`S.seed`), and its dice are thrown in a fixed
   order. Pictures, music and the screen never throw them (`Math.random`, or `hash01` on `S.salt` for choices that must
   not). A refactor leaves every recorded playthrough identical (`node test/golden.js check`, `node test/forced.js
   check`, each also with `--lang=ru`); a change to the game is re-recorded on purpose (`record`), and the difference
   read to be sure it is only the change intended.
9. **Every figure comes from a script.** Odds published in RULES.md, the rulebook or the changelog are the output of
   `sim/` or `test/` scripts run from fixed seeds, so anyone can run them again and get the same numbers.
10. **The environment is written down.** [REQUIREMENTS.md](REQUIREMENTS.md) gives every tool and version, and where the
    game has and has not been tested; it is brought up to date at every release.

## Working on the code

- `node build.js` builds `kutha.html` (the claude.ai artifact), `standalone.html` and `Gates of Kutha.html`;
  `node test/run.js` is the quick suite, `node test/run.js full` the whole of it; `npm run format` lays the code out
  (Prettier; `src/rules.js` and `build.js` are laid out by hand). The suite checks the layout and lints the script.
- Every tuning number lives in `src/rules.js`; English text tables in `src/data/`, their Russian in `src/i18n/`. Game
  code never draws or plays anything: it calls `emit(event)`, and `ui/cues.js` turns events into pictures and sound.
- A rule that changes changes RULES.md (and the rulebook doc) in the same commit; a figure that changes is measured
  again, never estimated.
- A season that goes wrong is replayed by its code: `node test/replay.js 1A2B-3C4D` (DEVELOPING.md, "Seasons and
  seeds").

## Releasing a build

1. Raise `version` in `package.json` (the middle number for new features or rules, the first for big or risky changes,
   the last for fixes alone).
2. `node test/run.js full` passes; the recordings are identical, or re-recorded on purpose and read.
3. `node sim/balance.js`: its figures go into RULES.md ("How seasons end", and the measured lines under Endings) and the
   rulebook ("How often each ending comes"); `node sim/tells.js`: every tell between 0.5 and 2.
4. The rulebook is a doc on claude.ai (doc `6f65a238-51b3-4c59-8a88-3de6de3d8326`,
   https://claude.ai/artifact/EkqSDY5vtcA6RnGVHxyUjf): bring it up to date with targeted edits, then export it over
   `docs/rulebook.md`.
5. REQUIREMENTS.md; a CHANGELOG.md section for the version (it becomes the release notes); the README's pictures
   (`node test/pictures.js`) when the screens they show changed, each looked at before it is committed.
6. Commit on the build's branch (committer `Claude <noreply@anthropic.com>`, with the attribution lines the session
   gives) and push it: the _Tests_ workflow must pass.
7. Fast-forward `main` to the branch and push: the _Publish_ workflow puts the game on GitHub Pages
   (https://ilia-r-s.github.io/the-gates-of-kutha/) and makes the release `v<version>`. Open the live page to check it.
8. Republish the claude.ai artifact from `kutha.html` (https://claude.ai/artifact/MNvZTKZjAiefFQdAghxAJa), and note
   the release in the claude.ai project _The Gates of Kutha_.
9. Leave no untracked files behind.
