# Night pacing and the README — 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[29.0.0 validation](2026-11-01-validation.md) for that release's implementation and
checks. The subsequent [29.1.0 pacing and text review](2026-11-02-text-and-pacing.md)
has separate measurements. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

The owner asked for substantially fewer crowded nights and a quieter, genuine
README example. The old image combined a death, physical evidence, grief and
three separate supernatural passages. The underlying frequency, not only the
image, needed attention.

The adopted build is **29.0.0**, 1,294,433 bytes, SHA-256
`bdc946452a26c9ec4606c057ab51eb501738d1727ffa220c9415edc9888db7a1`.
Its unchanged primary dawn-clue opportunity is 0.95. Extra atmospheric passages
now share one consumed count and the existing `room()` formula. The primary
clue spends one unit; actual preceding night/first-light text or grief adds one
burden unit before extras. Only a delivered extra spends another unit.

`nightAtmosphere()` in `src/game/tenor.js` owns the shared roll and accounting.
The count is separate from investigation's existing crowd count: atmospheric
extras cannot use up the opportunities for finds or character testimony.
`theMorning()` receives text already produced by night resolution, rather than
charging for silent outcomes. Required deaths, traces, guest/deed consequences
and urgent rite warnings remain visible. Daytime action/tablet nature signs and
the player's dream retain their existing opportunities. No render or audio code
rolls these chances.

## Measured comparisons

`sim/night-density.js` plays complete expeditions through offered choices. Each
variant used seed 19073, 1,000 ordinary-human expeditions and 1,000 careful public
observer expeditions, cycling all three backgrounds. A seed is
`(19073 + Math.imul(index, 2654435761)) >>> 0`.

The diagnostic counts semantic generator results, separately from visible
paragraphs and English word counts. “Omen/nature” includes patron omens and all
delivered overnight nature additions. “Optional” additionally includes random
world events and hazards. A world event containing an additional omen contributes
both recognizable beats. Clues and consequences have separate categories.
Only displayed night scenes enter the density summaries; the morning comparison
excludes terminal scenes without a morning.

| Morning measure | Before | Adopted |
| --- | ---: | ---: |
| Displayed mornings | 6,615 | 6,644 |
| Three or more omen/nature passages | 1,901 (28.74%) | 156 (2.35%) |
| Four or more optional beats | 1,108 (16.75%) | 182 (2.74%) |
| Mean prose paragraphs, excluding headings | 10.03 | 9.26 |
| Exactly one optional beat | 1,268 (19.17%) | 3,265 (49.14%) |

Three-or-more omen stacks became **91.8% less frequent** in this comparison.
The reduction also holds in the diagnostic's busy-night class: death, an attack
on the player, an agreed guest visit or a player deed. Its three-omen count fell
from 1,721/5,620 (30.62%) to 132/5,613 (2.35%). A prevented attack on someone else
is not in that particular class.

The first broad prototype used the investigation crowd count for atmospheric
events too. It reduced stacks, but finds fell by roughly 60%. A separate
1,000-season public-evidence puzzle check reduced uniquely identified patrons
from 24% to 10%, and mean distinct signs from 3.2 to 1.9. That version was rejected.
An intermediate separate-count version still reduced the primary clue; it was
also rejected. The adopted version preserves that clue's priority.

| Natural clue count, ordinary / careful play | Before | Adopted |
| --- | ---: | ---: |
| Patron omen passages | 3,358 / 3,336 | 3,228 / 3,294 |
| Finds trays | 894 / 879 | 899 / 899 |
| Public character dream reports | 276 / 280 | 263 / 268 |
| Private character dream reports | 150 / 148 | 122 / 134 |
| Volunteered sightings | 69 / 73 | 74 / 82 |

The separate puzzle policy's reported, rounded figures retained 24% uniquely
identified patrons, 53% narrowed to two and 23% owning the relevant ward. Mean
fact lines remained 11.3; mean distinct signs changed from 3.2 to 3.1. Its win
rate changed from 15% to 14%; this diagnostic does not establish unchanged
overall difficulty. Whole trajectories can diverge after an intentional chance
change. Fresh balance and fairness studies remain separate evidence.

## Checks and reproduction

For each measured variant, the diagnostic replayed 24 expeditions per policy
without instrumentation. All 48 matched complete state, shared-reference shape,
final scene and both seeded streams. Instrumentation therefore does not create
the measured difference.

Three focused pacing tests check the actual seeded roll, separate budget,
observation recording, unchanged daytime/dream channels and a real eventful
route retaining its death and physical trace. The build, knowledge, narrative,
nature, pacing, cult, audit, lint and format checks passed together. Rendering
the new README image also left both dice unchanged.

```sh
.local/node/bin/node sim/night-density.js --seasons=1000 --seed=19073 --out=.local/review/29/night-density-clue-2000.json
.local/node/bin/node test/puzzle.js 1000 --seed=19073
.local/node/bin/node test/run.js --only=night-pacing,nature,cult,knowledge,narrative,audit,lint,format
.local/node/bin/node test/pictures.js --only=morning
```

Use the documented shared-browser connection for pictures in a restricted macOS
session; do not repeatedly launch Chrome inside that sandbox.

Local evidence under `.local/review/29/`:

- `night-density-baseline-2000.json` and `night-density-baseline.html`, hash
  `f12c21fa1f74bf6f2c1ee4856c1ac9bffeaefa36ca250de2e3da1be8a947a809`.
- `night-density-shared-2000.json`: rejected broad prototype, hash
  `cc8f39f14150f7da745f59448d0a02daa7c0be4a30a523b537a19c92d4259d00`.
- `night-density-atmosphere-2000.json`: rejected primary-clue suppression,
  hash `c2b5893e32b4e9607217f1a69efbc5f140d842c1e5d244d544cdc63317d27b10`.
- `night-density-clue-2000.json`, `night-density-comparison.json`,
  `night-clue-prototype/`, and `night-puzzle-{baseline,shared,clue}-1000.log`.
- `night-pacing-focused.log`, `night-pacing-integration.log`, and
  `normal-night-picture/`.

## Representative scene at this checkpoint

The selected checkpoint image used seed **4042296217**, background 2, normal difficulty, first
night. Its 14 real choice indices are
`[0,6,0,0,4,1,1,2,0,0,0,0,1,0]`, recorded in
the checkpoint fixture. The final release recaptures a genuine quiet route in
`test/fixtures/pictures-29.0.0.json`; its current `docs/images/morning.png` shows the complete
stage and continuation choice. No chapter or paragraph is hidden or cropped
away; the capture asserts unchanged scene text.

Hamid escapes an attack, a physical trace remains, the camp grows quieter, and
the herdsmen report one strange sign. There are five prose paragraphs and one
optional atmospheric passage. One passage is the most common measured class;
this is deliberately a quieter example, not a claim to represent the median
paragraph count. The original screenshot routes remain preserved separately.
