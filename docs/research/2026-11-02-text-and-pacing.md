# 29.1.0: text, morning pacing and session music — 2–3 November 2026

Work began against the published **29.0.0** artifact. The owner selected **lower
chances, allowing rare doubles**, rather than a hard limit on morning material.
After the context re-review on 3 November, the owner requested documentation,
commit, push and deployment as **29.1.0** through the existing Pages workflow.

## Language and continuity

The final review changes 127 catalog string entries across 28 catalogs. This includes
Russian grammar and idioms, English continuity, complete interpolated sentences,
and agreement between scenes and their later recollections. It does not claim
that automated checks can certify literary quality.

The standing translation guideline is now in `AGENTS.md` and `DEVELOPING.md`:
translations may depart from literal meaning to preserve the spirit, character
voice and natural reading. Consequential facts, clues, uncertainty and the stakes
of choices remain equivalent. Russian does not assign the player a sex.

Representative repairs:

| Problem | Repair |
| --- | --- |
| «Осмотреть место» and «Обыскать место» described two quite different actions almost identically. | «Изучить место нападения» and «Обыскать местность», with consistent help, headings and notebook entries. |
| Photographic “darkroom” became «тёмная комната». | «Фотолаборатория» in both the habit and its reported clue. |
| “Thinks little of” became «думает о них немного». | «Невысокого … о них мнения», retaining the interpolated person's pronoun. |
| «Вы здесь и недели нет» and «По лагерю разошлось» had broken sentence structure. | Natural complete Russian sentences. |
| A gift-in-the-cradle recap said the gift was returned, although the selected scene describes a tug at the coat. | Both language recaps now describe the actual scene. |
| The brazier recap attributed the disappearing shadow to the brazier. | Both recaps correctly identify the statue's shadow. |
| A doom ending said no child survived, while a possible helper epilogue explicitly saved one. | The ending allows that exceptional survivor. |
| Dawn signs described noon or afternoon as already observed; the first review wrongly moved them to yesterday. | Current observations now work at dawn and during daytime searches. Short labels and tablet formulas match; no new witness is invented. |
| A rumour said the investigator had been in camp less than a week, without a day limit in its caller. | Both languages omit that unsupported duration. |
| First-light grief and weather narrated the rest of the morning in advance. | They describe the condition now, without a future clock claim. |
| A quiet-night sentence said nothing happened despite dreams and omens. | Both languages describe the headcount without denying other events or sabotage. |
| A gunshot choice promised “Sure”. | It describes speed and noise without promising success. |

`src/text/game/day.json`, `ui/book.json` and `ui/scene.json` own the clearer Russian
action terminology. The rendered choices were checked together at 320 CSS pixels
with local fonts and no horizontal overflow.

The owner correctly challenged “Yesterday the sun came up red” in the first
review. `dawn` advances the date before generating the omen; `nextOmen` also
serves news and daytime searches. Its notebook entry records the day the clue
was encountered. Backdating the observation was not a justified repair. The
replacement reads “The sun came up red as a wound this morning. Its light is
strangely dim.” The corresponding tablet now describes a red sun giving little
light, without requiring a noon that has not happened.

The re-review checked every prior edit against its caller, sibling variants,
interpolated names and later recollections. It also removed inherited clock claims
from related morning passages, including grief visible in the README capture.
Genuine accounts of the preceding night remain. A Russian recap no longer says
an unseen presence was hiding; the scene only establishes that it was there.
The sea-doom line now unambiguously names the first victim without assigning a
male form to a woman. An unnecessary cartload rewrite was reverted.

`test/narrative.js` generates all 30 variants in the ten reviewed omen families,
checks their observation dates and later notebook rendering in both languages,
and checks morning news/grief for the repaired clock claims. It verifies that
reading these records consumes no dice. This is a regression guard, not an
automated literary judgment.

The editorial/music checkpoint was compared independently against the untouched
starting artifact in all 48 regression seasons. Every selected action, offered
choice count, phase, non-text state value, state/reference structure, complete
dice trace and final game/prose RNG cursor matched. Twelve stored-string differences
were the intended Constance/Yusuf greetings and brazier recollection. This proof
is separate from the intentional pacing change below.

A further comparison from the pre-recheck artifact to the final 29.1.0 artifact
preserves every selected action, choice count, phase, non-text state value,
reference shape, full dice trace and final RNG cursor across the same 48 seasons.
Its 48 stored-string differences are the bilingual bird-silence tablet formulas;
their clue identities and deductions are unchanged. The direct chronology test
also exercises the revised sun formula and every sibling variant.

## Quieter mornings

Multiple omens and two news events were supported by the existing soft pacing
rules. Different generators could add a primary omen, nature passages, a further
omen and world events. World events may themselves include an omen. Their
coexistence was real, not a duplicate-rendering error.

`room()` remains the shared decay formula. `NIGHT_ATMOSPHERE` supplies its own
`TENOR.nightCrowd` factor, now **0.18** instead of the general **0.45**. The
secondary news factor `TENOR.second` is **0.1**, previously **0.3**. Primary dawn
clue eligibility remains **0.95**, with the existing 1–99% chance bounds. Finds,
testimony, dreams and social opportunities retain their rules and separate
budget. Deaths, traces, warnings and consequences are delivered normally.

Four batches each used 128 fresh seeds and two policies (ordinary human and
careful public observer), cycling all three backgrounds within each batch.
Batch `b` starts at `(20261102 + Math.imul(b * 128, 2654435761)) >>> 0`; seed `i`
within a batch is `(start + Math.imul(i, 2654435761)) >>> 0`. Each variant therefore
contains **1,024 complete expeditions**. Changed trajectories can produce
different numbers of displayed mornings.

| Displayed morning measure | Before | Quieter settings |
| --- | ---: | ---: |
| Mornings | 3,389 | 3,417 |
| At least two outdoor omen/nature passages | 689 (20.33%) | 216 (6.32%) |
| At least three outdoor omen/nature passages | 27 (0.80%) | 6 (0.18%) |
| Two news events | 88 (2.60%) | 36 (1.05%) |
| Multiple omens and two news events together | 11 (0.32%) | 1 (0.03%) |
| Multiple actual dream reports | 59 (1.74%) | 57 (1.67%) |
| Mean prose paragraphs, excluding headings | 9.34 | 9.13 |

“Outdoor omen/nature” counts patron omens and nature's `omen`, `death` and `luck`
channels. An image embedded in the player's dream is not another outdoor passage.
News counts generated world events, including their different strands. Dream
counts include the player and private/public character reports, once per report.
The diagnostic previously double-counted a private dream because `dreamToYou`
calls `tellDream`; its scope tracking now avoids that and rejects duplicate
breakfast dreamers. The broader historical `omens` field remains available.

Each variant replayed **192 expeditions without instrumentation**; complete state,
reference shape, final scene and both streams matched. A further 128-expedition
check on the final artifact exercised the corrected counting and duplicate guard,
with 48 uninstrumented replays. Rumours, conversational responses and consequences
remain individually recorded in `beats`; they are not silently hidden to shorten
the scene.

Rare busy mornings remain possible. One measured example, seed **2064552932**,
occultist, careful observer, night 4, contains a player dream, hazard, death,
trace, warning, grief, two omen/nature passages, a conversation, post and rain.
Its 17 paragraphs remain visible. The change reduces optional stacking; it is
not a limit on the number of consequences a day can have.

## Outcome checks and baseline review

A separate fresh comparison used 256 matched seeds per strategy/recovery pair,
starting at **20261103** with the same seed stride: **1,536 expeditions per
variant**. Policies use public observations; hidden outcomes are scored only
after play. Three strategies were exercised, each with ordinary and careful
recovery from visible condition words.

| Policy | Player wins before → after, out of 256 | Rite-completion doom endings before → after |
| --- | ---: | ---: |
| Cult-focused, ordinary | 43 → 42 | 39 → 36 |
| Puzzle-focused, ordinary | 44 → 50 | 49 → 40 |
| Mixed, ordinary | 48 → 43 | 36 → 32 |
| Cult-focused, careful | 59 → 62 | 108 → 109 |
| Puzzle-focused, careful | 74 → 79 | 110 → 103 |
| Mixed, careful | 65 → 69 | 108 → 108 |

All expeditions finished. Paired approximate 95% intervals for the win-rate
changes all include zero; their endpoints range from about −5.9 to +6.9 percentage
points. This sample does not establish equal difficulty or prove the cult is
sufficiently intelligent. This is numerical pacing, not a new opponent strategy.

All 48 regression seasons first diverged at an authorized atmospheric/news
probability change; six finished with a different ending. New 29.1.0
fingerprints and bilingual transcripts were recorded after review. Published
29.0.0 and recovered original fixtures remain byte-for-byte untouched and cannot
be overwritten by recording tools. Transcript coverage
still contains eight seasons × 170 steps per language and 411 forced scenes per
language. No explicit forced state capture changed. The recorded morning
branches also show the intentional pacing differences: fewer optional passages
change later testimony and the notebook in some scenarios. Those are gameplay
differences, distinct from the follow-up wording corrections and version label.

Quieter mornings displaced two old fixed-route coverage examples. The reply
instrumentation test retains all original 64 expeditions and adds another 64,
covering all eight topics and both roles. The natural second-voice test retains
seed 413271940 and adds seed 3664299901, which reaches a real wrong vote and later
recall opportunity without steering from hidden state. Assertions and rare-branch
requirements remain in place.

## Session music

`Session.save()` stores the five distinct daytime track IDs and requested track
in the existing `kutha.expedition` record. `restorePlaylist()` validates them after
the command journal is replayed; no game or prose randomness is consumed. Saving
the requested track matters because the day can advance before the dawn cue.

Missing or malformed music fields use a valid local playlist and phase-appropriate
track, then save that fallback without discarding valid progress. This upgrades
same-edition saves without music fields. A loss ending falls back to `deep`; a successful ending to the first
daytime track. Playback starts at the beginning of the track after audio becomes
available. There is no second session store or saved audio clock position.

Node coverage includes replay phases, later days, ending, malformed/legacy music
data and both dice cursors. Browser coverage compares playlist and requested track
through every existing reload scenario, closes every expedition tab and reopens
it, and verifies actual playback after a gesture. Stale-tab and unavailable-storage
checks remain active.

The release guard is now 29.1.0. Because the pacing change alters replayed
trajectories, 29.0.0 saves are incompatible and receive the existing edition
notice. The optional-music fallback does not migrate journals across editions.
Language, sound, viewpoint and reached-ending preferences remain independent.

## Evidence and reproduction

All **43 full-suite steps passed in 45.39 seconds**, with peak concurrency of
five workers, on the final 29.1.0 artifact. This includes compiler/catalog checks,
source audit, lint/format, the dated-omen regression, full simulations, 48-season
Node/Chrome parity, bilingual golden/forced captures, pacing and persistence.
The **13 real-input usability tests also passed in Firefox (20.55 seconds) and
WebKit (17.49 seconds)**, including tab closure/reopening, playlist/track restoration,
actual playback after a gesture, incompatible editions and narrow bilingual layouts.

All six README images were recaptured in default third person and visually
inspected. The retained 29.0.0 routes still reach their checked scenes in 29.1.0;
no new route file or fabricated scene was needed. The morning capture contains
the complete night/morning report and the corrected grief sentence. The other
current documentation was reconciled with this release; earlier research remains
an explicitly historical record rather than receiving new measurement labels.

Earlier local checkpoints remain useful provenance: the initial full run took
46.25 seconds, and the final-title subset took 21.71 seconds. Their independent
48-season wording comparison preceded the additional chronology proof above.
These elapsed times are observations, not a speedup claim.

The full suite uses the existing resource guard, reserves 4 GiB for other work,
caps Node heaps and shares one isolated Chrome server. No speedup is claimed.
The Mac sandbox also denies that server's local WebSocket; browser checks must
connect from the approved unsandboxed process. Node-only diagnostics stay local
and sandboxed.

Local evidence is in `.local/review/translation/`:

- `before.html`: SHA-256 `d1731d8001990090994853d1f79b59a9595f7af3bffc0c6710fdb84fff79735f`.
- `editorial-final.html`, `editorial-proof-final.json`, `pacing-proof-final.json`:
  separate editorial preservation and authorized gameplay-difference reviews.
- `pacing-checkpoint.html`: measured artifact SHA-256
  `c302e5e7d897e7f03cd9b167878dbc257f39595c61ec1fe68816bfe08e934f43`.
  Later changes were wording corrections and the owner-selected action titles;
  chosen actions, non-text state and both seeded streams were checked separately.
- `measured-{before,after}-{0,1,2,3}.json`, `morning-comparison.json`,
  `observer-{before,after}.json`, and `density-count-check.json` retain denominators,
  semantic beats, actual routes and measurement provenance.
- `transcript-review.json`, `full-suite-final.log`, `final-label-checks.log` and `russian-actions.png`
  retain the earlier checkpoint's transcript differences, test results and narrow-screen review.
- `recheck-before.html`, `29.1.0.html` and `recheck-proof.json` preserve the
  independent chronology comparison. The earlier artifact's SHA-256 is
  `3c5e9f5368bff2c10308abbabb3ef462b7f487ea2f1a5ef860359d5eb4c016ff`.
- `reviewed-text-diff.json` and `release-review.json` inventory the final 127
  entries and verify unchanged published fixtures. `release-transcript-{en,ru}.json`
  records the reviewed visible differences; both languages retain 411 forced scenes
  and eight 170-step golden expeditions.
- `release-full-suite.log`, `release-firefox.log`, `release-webkit.log` and
  `release-pictures.log` record final release checks.

The final **29.1.0** game artifact is **1,324,532 bytes**, with SHA-256
`37b3cfcee04eb5ded802b2e2e4728c0bd6d9c6a41e0107f219c4fcf0cd1410dd`.

```sh
.local/node/bin/node sim/night-density.js --seasons=128 --seed=20261102 --verify=24 --out=.local/density.json
.local/node/bin/node sim/observer.js --seasons=256 --seed=20261103 --out=.local/observer.json
.local/node/bin/node test/run.js full
```

The first command reproduces one batch. Use the matching preserved artifact with
`--file=...` for before/after studies. Follow the documented unsandboxed browser
workflow for the full suite.
