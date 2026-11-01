# Object reactions and reply fairness

The owner selected small, bounded differences in reactions to particular objects, based on a person's own knowledge,
beliefs and circumstances. This replaces the old direct role multipliers. It is an intentional gameplay change after
the exact decision-framework migration, not a claim that the earlier seeded streams remain unchanged.

## Defect and selected repair

The preceding 20,000-expedition check, seed `1052263`, measured artifact
`319212fd7f5fd22f391f47fcd4c03255b1c9c3092cdb2122881ee599973e2a0e`. Its 102-row family had 70 checked rows inside
the 0.5–2 likelihood-ratio band, two supported outside, 28 insufficient, and two additional descriptive sequence rows.

| Actual reply category and topic | Cult events / replies | Innocent events / replies | Cult / innocent ratio | Simultaneous interval |
| --- | ---: | ---: | ---: | ---: |
| Threatened / show | 804 / 2,805 | 434 / 5,316 | 3.511 | [2.900, 4.250] |
| Threatened / distrust | 554 / 22,847 | 2,527 / 42,179 | 0.405 | [0.344, 0.477] |
| Positive / show | 107 / 2,805 | 548 / 5,316 | 0.370 | [0.259, 0.529] |

The positive/show interval crossed the lower boundary: it was insufficient evidence, rather than a third supported
violation. Inspection nevertheless found a direct source of the skew: smuggler greed was 0.45, against 0.04 for
everyone else. The old temperament fear arrays also multiplied the cult's reaction to a shown object directly.

The distrust defect had a separate source. An eyewitness account or hint from the smuggler required an uneasy face,
although recounting a sighting need not imply fear. Both actual report forms now use the existing probabilistic
`recounting` expression palette. This changes their presentation, retaining their testimony and game/prose rolls.
The bilingual regression in `test/actor-reports.js` exercises both real report routes.

## Shared rules and actor knowledge

`src/people/reactions.js` defines `dialog.object.greed` and `dialog.object.fear` through the existing `Decisions` and
`odds` systems. `DIALOG.show` uses the shared resolver. Greed is tested first; fear is tested only when greed fails.
The old role-indexed fear arrays and separate smuggler/other greed constants are removed.

Every temperament supplies an ordinary greed base between 0.10 and 0.14 and fear base between 0.16 and 0.22.
`RULES.objectReaction` contains the object associations, motive weights, recent-memory window and 0.25 maximum
multiplier budget. A named `floor` step applies each candidate influence; taking the maximum means motives cannot
stack. The greatest permitted multiplier is 1.25. The strongest currently authored greed motive uses only 0.8 of
that budget, so its actual maximum is 0.168.

`Knowledge.objectBeliefs(person, item)` returns primitive observations and a separate provenance list. It uses:

| Input | Source and delivery | Limitation |
| --- | --- | --- |
| Object | Material, shape and portability of the item shown in this conversation | Authored associations to ways are hypotheses, not knowledge of the effective ward. All 15 showable items have explicit associations. |
| Temperament and trust | The actor's own temperament and relationship with the player | No other person's private rapport or suspicion is queried. |
| God, ward and nature doctrine | Remembered instructions received at initiation, recorded at day 0 | The ward and nature beliefs can be confidently wrong. They never refresh from world truth. |
| Recent luck | The named participant's own act in an actually delivered dawn luck passage | Only that participant receives the record. The player's omen, death, tablet, dream and action imagery stays private. The window is one day. |
| Troubling vision | A vision that this person actually remembers | Its correctness flags and other people's dreams are not inputs. The recorded night identifies its source time. |
| Trade | The smuggler's own occupation and the object's visible value | This changes motivation within the same shared budget. |
| Night glimpse | The unique smuggler's own remembered sighting | The remembered actor and confidence may be mistaken; the underlying real actor is not consulted. |

Fear can be nudged by a remembered ward, adverse nature association, bad luck, troubling vision, night glimpse or
own distrust. Greed can be nudged by trade, a favorable nature association or good luck. The observations contain no
actual patron, effective ward, hidden nature, rite meter, private player dream or global suspicion grid. Reading
them consumes no dice. `Knowledge.observedLuck` is called only after an actual named luck passage is delivered.

Nature doctrine is newly acquired with accuracy 0.65. Each of the two initiates receives one chance draw; a mistaken
belief also requires a pick among the other natures. Thus setup gains two to four game draws, and later outcomes for
the same seed can change. This acquisition is explicitly separate from the earlier exact framework migration.

The conservative bounds after the greed-first composition are:

| Final reaction | Minimum | Maximum | Maximum / minimum |
| --- | ---: | ---: | ---: |
| Greed | 0.100000 | 0.175000 | 1.750 |
| Fear | 0.132000 | 0.247500 | 1.875 |
| Calm | 0.598125 | 0.756000 | 1.264 |

Any mixture of the authored contexts remains within these bounds. They bound the raw reaction, not every downstream
portrait or arbitrary external experiment policy. The actual reply measurements below check the resulting displayed
categories separately.

The small shared-framework extension recognizes named `floor` and `cap` operators. Existing operator names and
their evaluation order are unchanged. A focused test checks the prior operators, named forms, deliberately
discarded rolls and the final roll. This API extension is distinct from the authorized reaction-probability change.

## Validation and fresh confirmation

The integrated pre-reaction artifact is preserved locally as
`.local/review/29/object-reaction/before.html`, SHA-256
`954602f4cbe7374e8bee3f804dd4df27052f46ab65f70e382b86acdffcf3e768`.
The tested candidate is `candidate.html` in the same directory, 1,324,358 bytes, SHA-256
`38a7c21bc137ddda7e89e577adfe2188ec58a5348652ebd289f0e42a729fb491`.

The first stage comprised 32 passing focused tests, followed by all 12 verification tests. New reaction coverage
includes 105 temperament/object contexts, 336 actor/object contexts with inaccessible inputs replaced by throwing
getters, 256 acquired doctrine memories containing both correct and mistaken beliefs, all six sign-delivery
channels, actual bilingual show replies through the policy bridge, and the one-or-two-gate conditional draw order.
The existing 64 complete-expedition instrumentation comparisons and all eight public topics remain in verification.
An independent source review found no knowledge or probability-bound defect.

A 2,000-expedition pilot used fresh seed `1268119` on the candidate: 43 rows inside, none outside, 57 insufficient,
plus the two descriptive sequence rows. It completed 28,564 actual replies. No probabilities were adjusted after
this pilot. The confirmation used a separate, predeclared seed `1483139`, the same `public-inquiry` policy and the
same 102-row family. No comparison, sample count or 0.5–2 limit was removed or relaxed.

All 20,000 confirmation expeditions completed, producing 282,995 actual replies. The result is **73 checked rows
inside, none supported outside, and 27 insufficient**, plus two descriptive sequence diagnostics. The strict
`--check` exit was **2**, correctly distinguishing insufficient evidence from a full pass. There are 125 observed
exact-mood/topic/role count keys for descriptive inspection; these were not added as post hoc confirmatory tests.

| Actual reply category and topic | Cult events / replies | Innocent events / replies | Cult / innocent ratio | Simultaneous interval |
| --- | ---: | ---: | ---: | ---: |
| Threatened / show | 349 / 2,864 | 619 / 5,218 | 1.027 | [0.824, 1.280] |
| Threatened / distrust | 588 / 22,878 | 1,336 / 41,674 | 0.802 | [0.674, 0.954] |
| Positive / show | 302 / 2,864 | 503 / 5,218 | 1.094 | [0.860, 1.391] |

Each interval uses the whole expedition as its cluster and the existing Bonferroni allocation over the fixed
family, with a simultaneous 95% coverage target. These cluster intervals are asymptotic. Sparse rows keep the
explicit insufficient classification, including zero-event rows; the method and its limits are described in
[the verification report](2026-11-01-verification.md). The old and new table rows use different seeds and artifacts:
they are fairness checks, not a paired estimate of changes in victory or survival.

The 27 insufficient rows comprise seven reply categories, four influence occurrence/source rows, ten pair rows,
five dream-answer/steering rows, and second-voice backlash. Important nonzero reply limits remain hostile/show
1.506 [0.957, 2.370] and threatened/press 0.429 [0.249, 0.740]. Neither interval supports a violation or a full
within-band conclusion. Five other reply rows have no events in either group. The exact sad/press count is 0 cult
versus 54 innocent; source review locates that palette in the smuggler's explicit confession, after the same action
publicly records the smuggler's identity. It is not an additional undisclosed portrait-only clue. General
category-level checking is still not certification of every exact portrait, history or player policy.

The run used one Node process with a 512 MiB V8 heap setting, 500-season batches, admission checks and streaming raw
output. Sampled peaks were 395,098,736 bytes of heap and 671,055,872 bytes RSS. No samples were skipped. The raw
42 MiB report retains every event/opportunity count and season cluster in
`.local/review/29/object-reaction/confirmation-20000.json`; `summary.json` lists the key rows and every insufficient
row. `pilot-2000.json`, `contracts.json` and the companion logs retain the earlier evidence.

## Reproduction and seeded coverage

Run the focused checks with the project Node distribution:

```sh
.local/node/bin/node --test test/object-reactions.js test/actor-reports.js test/slips.js test/decisions.js
.local/node/bin/node --test test/verification.js
.local/node/bin/node --max-old-space-size=512 sim/tells.js 20000 --seed=1483139 \
  --policy=public-inquiry --file=.local/review/29/object-reaction/candidate.html \
  --batch=500 --check --out=.local/review/29/object-reaction/reproduction.json --progress
```

`test/run.js` and `test:source` include `object-reactions`. The registry now has 58 definitions: 46 actor and 12
world definitions, with no legacy-authority definitions; 52 chance, five command and one choice mode. Thirteen
definitions have audited external observations, including the two new reaction gates. This is not a claim that
every remaining actor call site is exposed to an external policy.

The setup draw legitimately moved rare seeded routes. The constructed history checks now use seeds `3701569910`
for accurate recall and `1310020443` for a genuinely earlier alternative source; both exercise a real day-2 vote
followed by a day-3 recall. The natural public-policy route uses seed `413271940`, background 0: Ilse seconds the
accusation against Ashby on day 4, a real wrongful dismissal follows, and three listeners are eligible at the next
gathering. The search used the unchanged observable policy and retained the chronology, listener, actual ballot,
wrong-dismissal and bilingual assertions. Search evidence is in `conditional-search.json` and `recall-search.json`
beside the measurement artifacts.

The current-release forced greed setup uses the common temperament base only for that branch, restores it
immediately, and asserts the actual greed reply and testimony. The original-release branch is unchanged. These
are coverage adaptations, not relaxed outcomes or replacement of the immutable original fixtures.
