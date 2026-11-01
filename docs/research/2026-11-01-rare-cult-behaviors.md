# Rare cult behaviors and stronger checks — 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

The owner selected this follow-up after the first complete local 29.0.0 run.
Its purpose is to exercise the ten inconclusive comparisons, check the situations
a player can actually encounter, and find reproducible defects. The previous
20,000-season report remains a historical measurement; a targeted scenario cannot
retroactively turn one of its sparse rows into a pass.

## Methods and additional research

There are two distinct questions: how often a situation arises during an
expedition, and how an actor behaves once its prerequisites exist. Both matter.
Targeted fixtures answer the second; actual-play policies provide evidence about
the first. Keep their counts, denominators and conclusions separate.

[Art Owen's importance-sampling chapter](https://artowen.su.domains/mc/Ch-var-is.pdf)
explains why ordinary simulation may miss rare regions and why oversampling a
region requires a probability adjustment before estimating the original
population. Our application is conservative: these constructed cohorts are
labelled conditional tests, not weighted estimates of whole-expedition rates.
No sampling weights are invented for a fixture whose natural frequency is unknown.

The [NIST explanation of Bonferroni intervals](https://itl.nist.gov/div898/handbook/prc/section4/prc473.htm)
provides the simultaneous-coverage argument for a preselected finite family.
Keep the existing 0.5–2 single-tell band and season-clustered inference. Declare
the comparisons and sample sizes before confirmation; diagnostic cohorts may
guide repairs, but confirmation uses fresh seeds. Multiple-comparison adjustment
does not repair selection bias or make an approximate interval exact.

For constructed cohorts with one Bernoulli opportunity per role in each
independent scenario, zero events need not make a structural role-only path
unmeasurable. [NIST's exact binomial method](https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/exacbici.htm)
inverts the binomial tails; its independent 20/25 example gives a 95% interval
of approximately 0.592962–0.9316878. The
[official R documentation](https://www.stat.math.ethz.ch/R-manual/R-devel/library/stats/html/binom.test.html)
identifies this as the conservative Clopper–Pearson procedure. Simultaneous
probability bounds can bound their ratio without assuming the two roles within
a scenario are independent. This method must reject multiple correlated
opportunities per role in one scenario; it does not replace clustered inference
for ordinary expeditions.

An independent numerical review used existing R 4.6.0 base `binom.test` and
`qbeta` as references. It exposed an extreme-tail precision problem before the
new method was used for conclusions. After correction, all 756 reference cases
agree within 1.282×10⁻⁹ for `binom.test` and 2.056×10⁻¹² for direct-tail `qbeta`.
The local `binomial-independent-review.json` and `binomial-domain-review.json`
under `.local/review/29/` retain the reports and reproduction scripts. R remains
an optional independent check, not a project dependency.

These are applications of the sources to Kutha, not claims that either source
validates its game rules. Long sequences may legitimately accumulate evidence;
new sequence diagnostics must describe the actual recognizable pattern rather
than treating every combined likelihood above two as a defect.

## Opportunity audit

- The three old zero-event influence-pair rows count matching themes on the same
  day. With one breakfast and one inquiry, only two second voices can match that
  day; two doubts, recollections or steering interventions cannot. Repetition
  across days was not measured by those rows.
- Recall needs a second voice, a visibly affected listener, that listener backing
  a passed wrongful inquiry, a later breakfast, and a surviving source. The
  breakfast must then select the eligible listener and recall action.
- In 2,000 ordinary expeditions, 97 earlier-second/listener candidates narrowed
  to 21 affected listeners, 17 with a live source and zero wrongful-dismissal
  opportunities. A public-text policy following a heard second voice to an
  evening inquiry on the same seeds created 17 matching inquiries, ten actual
  second-voice pairs and one eligible recall speaker. The random recall choice
  did not fire. This establishes an opportunity gap, not unreachable mechanics.
  The ten repeated-second events include mixed-role pairs; they do not establish
  observations in every cult/innocent relationship stratum.
  Raw evidence: `.local/review/29/rare-opportunities.json`.

## Reproduced chronology defect

The alternative remembered-source pool previously accepted any accusation from
the same day or earlier. `campVote` appends simultaneous votes to the speech
record, so a co-voter who had never spoken before voting could be remembered as
the person who introduced the suspicion. This is a concrete source-order defect,
not evidence that mistaken memories should disappear.

The inquiry now records the public-speech prefix just before voting begins,
after its influence preface. Recall alternatives must come from that prefix.
A real-vote regression fails on the preserved runtime by naming Hamid and passes
after the repair by retaining the actual earlier source. The separate next-day
regression remains. The field is `S.inquiries[].saidBeforeVote`; it records no
hidden fact and consumes no dice. Removing an invalid alternative can change a
later recall's choice and dice, which is an intentional knowledge-boundary fix.
Across the 48 regression seasons, 16 inquiries gain this boundary. Removing only
that new metadata from the comparison leaves complete state, offered choices,
every traced game die and both final dice states identical. Evidence is in
`.local/review/29/recall-boundary-seasons.json`.

## Follow-up measurements

The pre-repair confirmation used 30,000 fresh conditional seeds from 909071,
artifact `6c2b8526…` (1,294,076 bytes), and 30 declared comparisons. It found ten
inside, ten outside and ten inconclusive. The ten departures describe one
underlying defence mechanism, not ten independent bugs.

After the engine's actual quarrel selection, with natural affinities and its
misleading/fond branch retained, cult pretenders defended the other participant
273 times in 17,000 opportunities; innocent pretenders did so 85 times in 34,366.
The rate ratio is 6.493, simultaneous clustered interval 4.230–9.966. The
cult-target subset is 28.014 (15.571–50.399). These contexts supply a pretender
claim and incoming dream accusation: they measure a conditional mechanism,
not how frequently the complete sequence arises in ordinary expeditions.

The culprit was the eligibility rule: an innocent needed fondness, while a
cultist could defend a partner regardless. A second, previously untested path
also read other actors' private suspicions when deciding whether the speaker
could risk that defence. The repair gives all pretenders the same fondness gate
and base chance. A cultist may make a bounded 0.35 tactical adjustment for a
friend/partner under public pressure, after publicly claiming dreams and while
remaining publicly clear. Private suspicion cannot alter this choice. The old
strong temperament-based suppression for cult partners is removed. Regressions
failed before these changes and pass afterward; fresh confirmation awaits the
owner-requested night-density adjustment so both are measured together.

The same 30,000 history contexts produced 29,997 actual wrongful dismissals,
29,984 actual next breakfasts, 6,699 eligible recall actors and 63 recollections:
51 accurate sources and 12 mistaken attributions to genuinely earlier speakers.
The six steering comparisons and witnessed-method occurrence were inside the
band. Recall/source and same-day pair subsets remained inconclusive.

A separate 20,000-expedition public-inquiry policy, also from seed 909071, had
43 checked rows and two descriptive sequence rows: 19 inside, zero outside,
24 inconclusive. It produced actual repeated second voices but no recall or
pretender-defence opportunity following an actual public feud. A separate
3,000-season diagnostic from seed 263167 found one cult method statement using
a recorded adaptation plan; this establishes reachability, not its fairness.
The constructed method cohort does not itself advance planned adaptation. The
single-focal defence stimuli likewise supply claims without prior public dreams;
the repaired tactical boost has a focused regression and needs natural-play
coverage, rather than silently changing those frozen stimuli.

Raw files are `rare-confirmation-30000.json`, `public-confirmation-20000.json`
and `method-planning-diagnostic.json` under `.local/review/29/`. They remain
unchanged snapshots. Post-repair seeds and larger real-history checks are
reported in the integrated checkpoint below.

## Integrated post-repair confirmation

The selected artifact is `bdc946452a26c9ec4606c057ab51eb501738d1727ffa220c9415edc9888db7a1`
(1,294,433 bytes), including the narrower night-atmosphere adjustment. Seeds,
cohorts and comparison families were declared before these fresh confirmations.
The compact design/report and full raw reports are retained in
`.local/review/29/rare-validation-design.json` and `rare-integrated-summary.json`.

| Cohort | Samples / seed | Inside | Outside | Insufficient |
| --- | --- | ---: | ---: | ---: |
| Conditional rare scenarios | 30,000 / 612269 | 11 | 0 | 19 |
| Actual wrong-vote/night histories under conditional stimuli | 120,000 / 271828183 | 6 | 0 | 1 |
| Natural public-inquiry expeditions, all families | 20,000 / 390041, plus 10,000 face contexts | 50 | 0 | 18 |
| Publicly eligible tactical dream defence | 12,000 / 1847293 | 4 | 0 | 0 |

Intervals are simultaneous within each declared cohort, not a pooled global
claim over all four studies. Strict check mode exits 2 for the three cohorts with
insufficient rows and 0 for tactical defence. No supported post-repair departure
was found; insufficient rows are not converted into passes.

After actual quarrel selection, the aggregate defence ratio falls from the
pre-repair 6.493 to **1.181**, interval **0.675–2.064**. It narrowly remains
inconclusive. The fond controls yield 5,388 defences in 30,000 opportunities for
each faction: ratio 1.000, interval 0.921–1.086. Non-fond zero/zero cells remain
statistically insufficient; code regressions establish their shared eligibility
rule rather than pretending zero events estimate a likelihood ratio.

The tactical cohort supplies the actual public prerequisites for the bounded
cult preference, then tests both a single focal defender and competing eligible
pretenders. For a cult target, the ratios are 1.355 (1.227–1.496) and 1.375
(1.223–1.547). Innocent-target controls are 1.000 (0.897–1.115) and 0.946
(0.833–1.073). All four satisfy the declared band in these conditional contexts.

The larger history cohort produces 119,982 wrongful dismissals, 119,935 actual
next breakfasts and 26,533 eligible recall actors; 47 histories end during the
real night. There are **262 recollections**: 201 accurate and 61 attributing the
influence to a different but genuinely earlier speaker. Recall ratio is 0.866
(0.612–1.225); named-source attribution is 1.022 (0.728–1.435). All three same-day
second-voice pair strata are inside. The backlash-only recall subset remains
insufficient (0.458–1.192).

Natural play still gives much weaker reachability coverage: one prior-public-feud
defence opportunity, no defence there, and no recollections in 20,000 expeditions.
Two across-day sequence diagnostics are descriptive and sparse, not subject to
the single-tell band. The earlier exploratory method-adaptation observation is
reachability evidence only. Conditional successes cannot be pooled into these
natural rates or establish strategic strength against sophisticated humans.

The exact paired-Bernoulli path is validated for at most 1,000,000 trials and
effective alpha at least 10⁻¹², with one focal Bernoulli observation per role per
independent scenario. It rejects dependent/multiple opportunities. The existing
season-clustered method remains authoritative for naturally dependent events.
The 756 independent R comparisons and their numerical domain remain unchanged.

Raw final files are `rare-integrated-30000.json`, `history-integrated-120000.json`,
`public-integrated-20000.json` and `tactical-integrated-12000.json`. Subsequent
framework migration has separate exact-preservation evidence; it does not
retroactively turn a sparse fairness row into a conclusive result.
