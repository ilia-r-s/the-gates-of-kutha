# Difficulty and nature-sign validation — 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

These are fixed-seed runs of the shipped engine, through actual choices and the
actual finale. They are software experiments, not measurements of human players.
Neural networks and learned policies are outside this release.

## Integrated defence and night-pacing measurements

The follow-up artifact `bdc946452a26c9ec4606c057ab51eb501738d1727ffa220c9415edc9888db7a1`
includes the common-fondness defence repair and the selected separate atmospheric
budget. The following checks supersede the earlier artifact's figures for this
selected ruleset; historical experiments below retain their original meaning.

| Check | Result |
| --- | --- |
| Seven ordinary policies, 3,150 expeditions | 2,948 defeats (93.59%), 168 hard wins (5.33%), 34 clean wins (1.08%); all complete. |
| Careful mixed observer, 3,150 expeditions | 786 wins (24.95%). Against original 818, paired difference −1.02 percentage points, 95% interval −3.14 to +1.11. Against the earlier 29 artifact's 805, −0.60 points (−2.59 to +1.38). Neither comparison establishes a whole-version difficulty change. |
| Nature-sign reader versus ignoring signs, fresh seed 106661, 3,150 pairs | 785 versus 801 wins; −0.51 points (−1.45 to +0.44), 107 gained and 123 lost wins. All 6,300 complete; both descend 2,984 times. No established win-rate benefit. |

The new nature study delivers 10,497 signs, with 3,640 correct nonzero readings,
1,819 wrong and 2,279 about neutral ways. Reading changes 2,097 descent choices.
Channels: 5,142 action, 2,386 tablet, 930 omen, 777 luck, 788 dream and 474 death.
Fewer atmospheric nature images are an intended consequence of quieter nights;
primary patron clues and investigative evidence are assessed separately in the
[pacing report](2026-11-01-night-pacing.md). These are idealized software players,
not a human readability study. The results do not justify claiming that nature
signs improve victory odds.

Raw outputs are `.local/review/29/integrated-{balance,careful,nature}.json`;
`integrated-balance-comparison.json` records paired gained/lost wins. These jobs
execute 12,600 expeditions on the named artifact.

## Earlier release gameplay measurements

After the public-speech, camp-knowledge and conversation-sign repairs, gameplay
artifact `d6de7516…f1ef9f` was measured again. These results supersede candidate
figures for that earlier candidate; the integrated follow-up above is now newer.
The later `6f400585…7d409` build repairs guest-betrayal bookkeeping and its ending
explanation. Thirteen before/after branches preserve both dice, night prose and
all other state; no gameplay decision reads that ledger. These large studies
were not repeated on the later bytes. See the [final validation record](2026-11-01-validation.md).

| Final check | Result |
| --- | --- |
| Seven ordinary policies, 3,150 seasons | 2,954 defeats (93.8%), 157 hard wins (5.0%), 39 clean wins (1.2%); all complete. Madness remains frequent at 54.6%. |
| Careful mixed observer, 3,150 seasons | 805 wins (25.56%) versus 818 (25.97%) on 28.5.2. Paired difference −0.41 points, 95% interval −2.54 to +1.72: whole-version difficulty remains inconclusive. |
| Controlled pressure confirmation, fresh seed 90131, 3,150 pairs | Reviewed settings 821 wins; adopted settings 785. Difference −1.14 points (−2.01 to −0.28), with 79 gained and 115 lost wins. Attacks increase from 1,075 to 1,364. All 6,300 complete. |
| Nature-sign reader versus ignoring signs, seed 62701, 3,150 pairs | 824 versus 828 wins. Difference −0.13 points (−1.16 to +0.91): no established win-rate benefit. Both reach descent 2,973 times; reading changes 2,515 choices. |

Final nature runs deliver 18,506 signs: 753 dream images, 3,646 luck events,
2,415 tablet passages, 4,204 omens, 5,094 action signs and 2,394 death-site traces.
There are 5,841 correct nonzero readings, 2,889 wrong and 3,608 about neutral ways.
The reader's favorable/costly encounter counts are 1,647/4,170 versus 1,596/4,184;
favor is 1,364 versus 1,324. These descriptive differences do not establish an
overall advantage. The same ideal-reader and prior-distribution limitations below
apply.

| Final way | Correct | Wrong | Neutral | Tied |
| --- | ---: | ---: | ---: | ---: |
| Boldness | 310 | 160 | 0 | 17 |
| Humility | 412 | 210 | 331 | 91 |
| Truth | 343 | 173 | 498 | 107 |
| Guile | 756 | 411 | 226 | 186 |
| Haste | 659 | 338 | 176 | 132 |
| Patience | 1,163 | 494 | 352 | 381 |
| Offering | 207 | 119 | 168 | 13 |
| Water | 150 | 72 | 245 | 19 |
| Light | 280 | 137 | 75 | 17 |
| Taking | 253 | 127 | 99 | 16 |
| Refusal | 433 | 220 | 334 | 103 |
| Bronze | 159 | 74 | 223 | 12 |
| Words | 492 | 233 | 734 | 216 |
| Breaking | 224 | 121 | 147 | 16 |

Raw final output is `release-{balance,careful,nature,pressure}.json` under
`.local/review/29/`, with matching text logs and wall times. These four jobs play
18,900 complete expeditions. The remainder of this document records how the
candidate and the measurement policy were chosen, rather than replacing history
with the final numbers.

## Use a competent observation-only comparison

The original “human” simulation consulted hidden roles and the true patron/ward;
its historical win rates cannot evaluate deduction fairly. Current policies use
visible evidence, with hidden-answer guards. The first observer also neglected
health. A paired 6,300-expedition check showed that reacting to visible condition
words with brandy/rest raised wins by 9.62–13.24 percentage points across cult,
puzzle and mixed priorities. The [verification report](2026-11-01-verification.md)
records the methods. Low wins by a policy that ignores health are not evidence
that the cult can outthink a sophisticated person.

The careful observer is still limited. It recognizes a fixed vocabulary, does
not learn across games, and does not use all social strategies. It is a stronger
benchmark, not a substitute for experienced human playtesting.

## Adopted pressure change

After repairing direct-retaliation tells, compare the reviewed common target
lottery (base .06, .01 per elapsed day; adaptation gain .5) with base .08, .012
per elapsed day and adaptation gain .75. Alarm and observed-investigation
multipliers remain bounded; this does not restore the separate role-conditioned
retaliation branches. Each set has 3,150 paired seasons, cycling careful cult,
puzzle and mixed priorities and all three backgrounds.

| Seeds | Reviewed wins | Candidate wins | Paired change, percentage points (95% interval) | Player attacks, reviewed → candidate |
| --- | ---: | ---: | --- | ---: |
| 27449 + i × 2654435761, unsigned | 825 | 776 | −1.56 (−2.55 to −0.56) | 1,062 → 1,430 |
| Fresh 51701 + i × 2654435761 | 840 | 806 | −1.08 (−2.03 to −0.13) | 1,099 → 1,390 |

All 12,600 expeditions finished. The candidate lost 152 wins and gained 103 in
the first set; it lost 133 and gained 99 in the fresh set. Paired intervals use
the variance of each season's win difference. The increase is modest and
reproduced in the confirmation set. It is adopted under the owner's request for
more demanding survival and victory, subject to the separate tell checks.
Increasing attack frequency alone is not a measure of intelligence.

Against the preserved 28.5.2 runtime, the same careful mixed policy on 3,150 seeds
(1,050 each from 7001, 8001, 9001) won 818 times (25.97%); 29 won 769 (24.41%).
That whole-version difference is −1.56 points, with paired interval −3.66 to
+0.54. It is inconclusive. The controlled pressure comparison above supports a
modest tuning effect; it does not establish that every player finds the entire
new release harder. The same seed is a reproducible pairing, not a claim that
all intermediate events remain identical after changed dice consumption.

The old seven ordinary policies retain their 3,150 total sample count for
continuity. Current outcomes are 2,962 defeats (94.0%), 156 hard wins (5.0%) and
32 clean wins (1.0%). All finish. Their frequent madness (55.7%) makes them poor
proxies for attentive survival play; publish the careful observer beside them.

## Soldier comparison

On the preserved pre-knowledge candidate, 4,000 inquisitor-leaning soldier
seasons per variant gave 223 wins with the existing bonus, 224 without its
press bonus, and 225 with press reduced to .05 and examine increased to .15.
The latter increased successful examinations from 3,445 to 3,616. These tiny win
differences do not support a balance benefit. No soldier retuning was adopted;
the existing health/revolver/examination differences remain. This study is a
snapshot, not a final-release balance table or evidence that pressing is optimal.

An earlier pressure trial raised the old retaliation branches. It was rejected
when those branches proved to be single tells. Its temporary “alive” metric
used incorrect ending names and is not evidence; the field was removed from
the script. Only completed endings and the later controlled study above inform
the decision.

## What the nature signs convey

Each delivered sign has a noisy good/bad result for one way. Favored, neutral
and disfavored ways generate favorable images at .65, .50 and .35. The reader
tallies delivered signs and matches their meaning to visible choice text; it
does not consult the true nature while playing. Truth is read only afterwards
to score the inference. Zero tallies and neutral actual ways are reported
separately rather than silently counting them correct.

On fresh seed 62701, 3,150 paired final-rule expeditions delivered 18,492 signs:
4,321 omens, 3,724 ordinary-luck events, 5,067 action signs, 2,378 tablet passages,
766 dream images and 2,236 traces near deaths. For nonzero tallies about genuinely
favored/disfavored ways, the reader was right 5,896 times and wrong 2,872 times.
Another 3,595 nonzero tallies concerned neutral ways. Observations within one
expedition are correlated; do not treat all signs as independent trials.

| Way | Correct | Wrong | Neutral nature | Tied tally |
| --- | ---: | ---: | ---: | ---: |
| Boldness | 310 | 177 | 0 | 16 |
| Humility | 435 | 231 | 322 | 91 |
| Truth | 335 | 170 | 478 | 91 |
| Guile | 745 | 398 | 202 | 202 |
| Haste | 654 | 340 | 199 | 128 |
| Patience | 1,194 | 487 | 323 | 389 |
| Offering | 222 | 117 | 167 | 11 |
| Water | 155 | 77 | 244 | 14 |
| Light | 286 | 120 | 62 | 18 |
| Taking | 273 | 124 | 99 | 14 |
| Refusal | 428 | 214 | 330 | 102 |
| Bronze | 127 | 83 | 244 | 18 |
| Words | 527 | 231 | 770 | 203 |
| Breaking | 205 | 103 | 155 | 15 |

For every way, correct readings outnumber mistakes in this sample. This is not
a comparison with the best fixed prior: some ways are favored by more natures
than others. The script uses semantic labels in delivered records as an ideal
reader; whether a person understands each image still needs playtesting.

Both policies reached the descent in 2,974 expeditions. Reading signs changed
2,503 choices. Recorded favorable encounter outcomes were 1,625 versus 1,584;
costly outcomes 4,134 versus 4,136; accrued favor 1,381 versus 1,321. These are
descriptive totals, not independent-trial significance tests. Wins were 816
versus 809: +0.22 percentage points, paired 95% interval −0.86 to +1.31. An earlier
3,150-pair run similarly gave 811 versus 807 (+0.13, −0.91 to +1.16).
The signs carry partial, fallible information and sometimes change the descent;
a win-rate benefit has **not** been established. They are retained for the
owner's requested deductive channel, without advertising an unproven advantage.

## Reproduction

```sh
node sim/difficulty.js --study=pressure --seasons=3150 --seed=27449 --out=.local/review/pressure.json
node sim/difficulty.js --study=pressure --seasons=3150 --seed=51701 --out=.local/review/pressure-fresh.json
node sim/balance.js --pols=careful --seasons=1050 --seeds=7001,8001,9001 --out=.local/review/careful.json
node sim/balance.js --out=.local/review/balance.json
node sim/nature.js --seasons=3150 --seed=62701 --out=.local/review/nature.json
```

Local raw results are under `.local/review/29/`: `fair-pressure{,-fresh}.json`,
`careful-{baseline,candidate}.json`, `balance-release.json`, `nature-final.json`
(earlier run), `nature-release-fresh.json`, and `soldier.json`. Temporary preserved
HTMLs identify historical variants; new runs use the current shipped build.
`sim/difficulty.js` names the explicit comparison constants, so adopting a
variant does not silently turn a future experiment into two identical arms.
