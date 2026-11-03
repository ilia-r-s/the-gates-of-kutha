# Honest simulation and tell measurements, 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

29.0.0 repair of the verification tooling. These measurements describe the named
policy and seed set, not a population of human players. Historical reports remain
unchanged. The original release's 48 fingerprints still use their original
`legacy.human` policy and `legacy.lcg`; new tests use the shared Mulberry32 generator
in `test/lib/random.js`. Floating-point LCG output modulo a small integer had almost
eliminated several UI branches. The regression check exercises every bucket for
2, 3, 4, 6, 8, 10 and 13 choices; the Russian UI bot also reports actual tab visits,
language switches, marks and choice indices.

## Observable player policies

The ordinary human policy reads offered choices, calendar and carried fragments.
It no longer chooses accusations, powers or wards from the hidden answers. It uses
the English translation of the offered actions in either UI language, without
rendering or consuming game/prose dice. The observer additionally reasons over the
recorded casebook using `test/solver.js`; evidence can be mistaken. Both are
heuristics. `test/verification.js` replaces roles, patron and ward assignments, plus
private knowledge, action, suspicion, affinity and attraction ledgers, with throwing
getters during decisions, checks both languages and verifies unchanged
dice through actual seasons including descent and sanctum. The optional careful
observer uses only the notebook's displayed nerve words: when frayed or worse it
uses free brandy if offered, otherwise goes to camp and rests. Numerical health
getters are blocked in a targeted recovery-choice test. The original observer
remains available as a benchmark; `sim/observer.js` pairs both variants separately
under cult, puzzle and mixed priorities. `sim/balance.js --pols=careful` selects the
careful mixed policy. A heuristic that ignores survival cues is not evidence that
the cult can defeat sophisticated play.

On the preserved post-knowledge/pre-pressure-fix artifact, 1,050 paired seeds per
mode (`--seed=19073`) produced the following actual wins. Every expedition ended.
The intervals are ordinary paired-mean 95% intervals for the change in win rate,
reported separately by mode; they are not simultaneous intervals and are not
claims about real human skill.

| Priority | Original observer wins | Careful observer wins | Change, percentage points (95% interval) | Madness, original → careful |
| --- | ---: | ---: | ---: | ---: |
| Cult | 159/1,050 | 260/1,050 | +9.62 (+6.57 to +12.67) | 635 → 174 |
| Puzzle | 153/1,050 | 292/1,050 | +13.24 (+10.13 to +16.34) | 605 → 155 |
| Mixed | 142/1,050 | 260/1,050 | +11.24 (+8.34 to +14.14) | 649 → 177 |

The careful policy chose rest 2,167/2,243/2,206 times and brandy 12/24/12 times;
the original chose neither in this cohort. This establishes the value of using
the already displayed survival cues, not optimality. The local report
`observer-careful-19073.json` includes raw paired rows and the artifact hash.
Fresh-seed and final-runtime measurements must be reported separately.

`test/puzzle.js 200 --seed=4242` plays the real choices from the intro to an actual
ending in the shipped engine. It neither skips nights/gates nor estimates victory
from hidden odds. It reports gate and final-action coverage and fails on stuck
seasons. `sim/balance.js` supports `--pols=observer`; its default seven policies keep
the 3,150-season sample. Each policy uses the same explicit season seeds, allowing
paired comparisons between rules. A stuck season now produces a failing exit.

## Tell inference

`sim/tells.js 2000 --seed=4242 --check --out=counts.json` prints successes and
opportunities for each group, a pooled cult/innocent rate ratio, its interval,
independent season count and the count of seasons containing events. The JSON also
keeps every season's counts. Counts within a season are correlated: the same
characters, nights, ties and events appear repeatedly. Treating all those rows as
independent would overstate precision. We use a cluster-robust delta-method
interval for the log rate ratio, clustering both groups jointly by season. For
season totals `(a,b,c,d)` and pooled totals `(A,B,C,D)`, its influence is
`a/A - b/B - c/C + d/D`; the variance is the sum of squared centered influences,
multiplied by `G/(G-1)`. This follows the large-cluster sandwich principle described
by [Cameron and Miller (2015)](https://faculty.econ.ucdavis.edu/faculty/cameron/research/Cameron_Miller_JHR_2015_February.pdf).

Intervals are Bonferroni-adjusted over every reported comparison, targeting 95%
simultaneous coverage. This addresses looking across many tells, not selective
reruns after inspecting a result. See [NIST's account of Bonferroni intervals](https://itl.nist.gov/div898/handbook/prc/section4/prc473.htm).

This is an asymptotic method, not an exact guarantee. We conservatively withhold
it unless there are 50 eligible seasons and at least 20 seasons with events and
20 with non-events in each group. Those cutoffs are operational safeguards, not a
statistical theorem. Sparse and zero-event rows receive the uninformative interval
`[0,infinity]` and status `insufficient`. No artificial half-event is added. A zero
innocent count with positive cult count prints an infinite point ratio, never
silently `n/a`. Withholding inference sacrifices power: a real rare leak may need
many more seasons or a dedicated experiment. Binomial zero-event methods cannot
simply be applied to correlated opportunities; [Möller and Ahrenfeldt (2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8196730/)
explain why ordinary bootstrap and ad hoc continuity corrections are problematic
at zero events.

Status `outside` means the whole adjusted interval lies below 0.5 or above 2;
`inside` means the whole interval lies within that band; otherwise evidence is
insufficient. `--check` exits 1 for a supported violation, 2 for insufficient
measurement, and 0 only for all-inside. `--allow-insufficient` permits exit 0 for
incomplete evidence while preserving the printed status; it never suppresses a
supported violation. The full suite uses that option so its finite sample does
not falsely certify rare tells as fair.

The `pressure` family records actual confide/press conversations and whether a
cult attack reached the player that night. Its denominator is one distinct
conversant/action/night exposure with that night actually played. It includes
fatal nights and visits; a death never silently removes an exposure. Multiple
conversations on one night share an outcome, which is another reason to cluster
by season. The harm/death counter includes direct damaging attacks and fatal
guest attacks; it does not count a frightened awakening as bodily harm. These
are observable associations, not causal estimates of the effect of a confidence.
The policy can select different people in different circumstances.

On the post-knowledge, pre-retaliation-fix 29.0.0 build, 2,000 seasons at seed 4242
found a supported pressure tell: attack after confiding was 145/278 for cult
conversants versus 100/608 for innocents, LR 3.17 [2.39, 4.21]; attack after pressing
was 138/308 versus 79/563, LR 3.19 [2.36, 4.31]. Harm/death ratios were 3.23
[2.24, 4.65] and 3.48 [2.36, 5.11]. These simultaneous intervals cover the four
pressure rows in that run. This finding motivates a shared, bounded targeting
rule; it is not a final-release fairness result. Counts are in the local
`pressure-2000.json` report and the corrected runtime requires a fresh run.

After replacing direct role-conditioned retaliation with a bounded shared
targeting rule, the 2,000-season pressure+nature smoke produced 7 inside,
0 outside and 2 insufficient rows. Attack ratios after confiding/pressing were
1.04 [0.56, 1.91] and 1.06 [0.57, 1.97]; harm/death still needs more data.
This nine-comparison check is a repair check, not the final all-family run.

## Pair and clock additions

The original nights, dreams, faces and answers retain their sampling counts.
New counters compare all-cult and all-innocent pairs' public statements about the
same target/verdict on the same day, stratifying by close, hostile and other ties
at the first observed scene that day. Mixed pairs are excluded. They also compare
public accusations/defences per person-day by temperament; activity after a death,
inquiry or scandal versus other days; named rumour speakers and whether their
rumour changed a hearer. The older method-allegation and dream-doubt records are
counted separately from the new influence channels. Public blame records add a
visible listener-change rate per accusation and two complementary outcomes for
actors with at least two accusations: all listener outcomes alike versus varied.
“Changed” means a printed reaction in `Moments.record().moved`, not a correct
accusation or a successful private plan. These rows cluster whole seasons and can
remain sparse. Private speech and unprinted belief changes do not count as public
statements. Instrumentation reads records without advancing dice.

These are opportunity-conditioned observables, not a claim that a player saw
every recorded potential alibi. Aggregate pair results can still hide narrower
contexts; days absent because a season ended contribute no opportunities. The
blame rows make one kind of outcome consistency observable; they are not a complete
variance study of inquiry wins or silenced accusers. Future claims of fairness must
name those limits rather than infer them from a passing individual-tell table.

Large runs use fresh Node contexts every 1,000 seasons (`--batch`). Global seed
indices, the original `ceil(N/2)` face scenarios, and season cluster identifiers
are retained. A 51-season all-family run in one batch and three batches of 17 had
identical counts, ratios, intervals and statuses. This bounds each VM operation
without reducing samples or changing which seasons are measured.

## Speech finding and repair

The 20,000-season diagnostic at seed 51701 found a supported honest-speech tell:
77/24,488 cult person-days versus 572/46,268 innocent person-days, LR 0.254
[0.172, 0.377], among 52 simultaneous comparisons. An extra cult-only
`TP(s).frame` filter discarded already granted public opportunities; its honest
setting was 0.01. The isolated 3,150-season `sim/speech.js` comparison retained
targets and ordinary opportunities while removing that filter: honest speech rose
from 16/3,810 to 34/3,808 cult person-days; innocent speech was 94/7,441 versus
97/7,433. The remaining difference also includes real Dreamers in the innocent
group; it is not evidence that every statement should have identical targets.

The repair removes the private-framing filter from a public speaking turn.
Honest people can express a real grievance without inventing an eyewitness claim.
Firsthand wording now requires a recorded personal outing. The related older
method/dream channels use shared opportunities and a bounded cult style/target
preference, with actor-specific observation records; see the
[knowledge audit](2026-11-01-narrative-knowledge.md).

The 2,000-season repair smoke at seed 4242 produced 57 rows: 27 inside, zero outside,
30 insufficient. Honest speech was 23/2,520 versus 58/4,665, LR 0.734
[0.318, 1.697], still insufficient at this sample. Visible blame effects were
128/193 versus 199/310, LR 1.033 [0.829, 1.287]. Old method/dream channels and
repeated-blame consistency remain sparse. These are intermediate checks; the final
confirmation uses untouched seed 80791 and all 20,000 seasons.

## Initial complete confirmation

The measured artifact below completed 20,000 seasons at seed 80791, plus the retained
10,000 fresh face scenarios: **47 of 57 comparisons supported inside the band,
zero supported outside, ten insufficient**. All intervals below are season-clustered
and adjusted simultaneously across the 57 rows. The raw local report is
`.local/review/29/tells-final-80791-20000.json`; it records the artifact hash, all
opportunities/events and every season cluster. This seed set was not used to tune
the speech repair.

| Observable | Cult events/opportunities | Innocent events/opportunities | Rate ratio (simultaneous interval) |
| --- | ---: | ---: | --- |
| Honest public accusation/defence per day | 225/25,517 | 592/46,532 | 0.693 (0.531–0.905) |
| Conscientious public accusation/defence per day | 310/24,982 | 587/46,234 | 0.977 (0.769–1.242) |
| Attack that night after confiding | 368/2,934 | 646/5,803 | 1.127 (0.921–1.378) |
| Attack that night after pressing | 388/3,017 | 642/5,796 | 1.161 (0.952–1.416) |
| Harm/death after confiding | 261/2,934 | 419/5,803 | 1.232 (0.960–1.580) |
| Harm/death after pressing | 259/3,017 | 418/5,796 | 1.190 (0.928–1.527) |
| Public blame changed a visible listener | 1,220/2,029 | 2,146/3,281 | 0.919 (0.853–0.991) |
| All outcomes alike, actors with at least two public blames | 70/135 | 111/198 | 0.925 (0.653–1.310) |
| Varied outcomes, actors with at least two public blames | 65/135 | 87/198 | 1.096 (0.734–1.637) |
| Older dream doubt per person-day | 107/176,116 | 181/326,074 | 1.095 (0.728–1.645) |
| Nature luck observed per person-day | 9,302/176,116 | 14,809/326,074 | 1.163 (1.113–1.215) |
| Good outcome, conditional on nature luck | 4,665/9,302 | 7,407/14,809 | 1.003 (0.959–1.048) |
| Bad outcome, conditional on nature luck | 4,637/9,302 | 7,402/14,809 | 0.997 (0.954–1.043) |

The ten remaining rows are not certified fair. Pretender dream answers occurred
in only 8 cult and 12 innocent seasons; recall, named recalled sources and all
three same-influence-theme pair strata had zero events. They require a policy
that actually reaches those circumstances. Steer occurrence was 139/176,116 versus
148/326,074, LR 1.739 (1.174–2.576); the subset steering against a cult suspect was
too sparse (12/35 versus 47/88). Older method allegations were 54/176,116 versus
77/326,074, LR 1.298 (0.719–2.344). Hostile pairs making the same public verdict
were 182/20,778 versus 687/118,581, LR 1.512 (1.140–2.005), just crossing the
upper boundary. No cutoff was relaxed to relabel any of these rows.

The reported command exits zero with the explicit `--allow-insufficient` option;
strict `--check` still exits 2. These results support the measured repairs and one
observable consistency measure. They do not establish universal fairness across
every policy, rare context, player inference or correlated sequence of events.

## Fixed baseline check

On the preserved 28.5.2 artifact, 2,000 seasons at seed 4242 produced 31 tell rows:
22 supported inside, 0 supported outside, 9 insufficient. The rare dream-answer
row remains an evidence request rather than a balance correction. Reproduce with
`--file=<preserved-artifact>`; counts were retained locally in
`.local/review/tells29-2000.json`. Current gameplay changes require a new run, not
reuse of this baseline result.

## Separate 29.0.0 expectations and reviewed differences

The original files in `test/golden/` and `test/fixtures/seasons.json` are unchanged.
That release's expectations live under their respective `29.0.0/` directories.
The later [29.1.0 review](2026-11-02-text-and-pacing.md) preserves them and records a separate set. Recording
with the original selector is rejected. Both `test/seeds.js` and `test/parity.js`
accept `--page=<artifact> --baseline=original`; golden/forced tests accept the same
selectors. Against the preserved 28.5.2 artifact, all 48 original fingerprints,
both eight-season golden transcripts and all 411 forced scenes in each language
were reproduced exactly after the harness changes.

`test/baselines.js --original=<28-artifact> --file=<29-artifact> --out=<review.json>
--transcripts` verifies all original fingerprints before reporting current
differences. `--write` separately records current season expectations. The report
includes ending, choice/dice counts, first differing choice and die, changed state
fields, per-season golden field counts, and the first readable difference for each
changed forced scenario. Repeated scenario names are indexed by occurrence; no
original scenario may silently disappear.

The gameplay artifact used for the 20,000-season measurement has SHA-256
`d6de7516c808a1413877bedb2badb4602c66bac9afed8f572cc59f783ff1ef9f`.
This identifies the measured bytes; a later narrative-bookkeeping correction must
be distinguished from that artifact rather than silently assigning it the result.
The subsequent bookkeeping checkpoint is 1,294,153 bytes, SHA-256
`6f400585d905c9e87b38a5a6adfbfe908ab9b3573d105fe36d2389a88c37d409`.
It adds the missing intentional-betrayal record when a guest is targeted in the
player's tent, including the empty-tent debrief. Only debrief/fate explanation
reads that ledger. Four forced branch comparisons preserve exact pre-fix game and
prose dice. All 48 checkpoint fingerprints, both eight-season golden transcripts and
all 413 forced scenes per language remain identical after this repair; no further
fixture rewrite was needed. The 20,000-season study was not rerun on those later
bytes. Its outcome evidence is retained with that explicit, tested scope.
All 48 checkpoint expeditions finish and all differ intentionally from 28.5.2. Their
first differing die is the new 0.75 prior-temperament inference in `Knowledge.deal`
(indices 343, 329, 333 and 309 for seeds 0, 3, 4242 and 4294967295). This added
setup work shifts subsequent game/prose outcomes; the first offered-location
difference is step 1 in every case. For example, seed 0/philologist/normal/English
changes the Trench B company from Constance/Zahrun to Yusuf/Ashby and runs 76 steps
instead of 37. It still ends in death. These tiny historical-driver cases are
regression anchors, not balance evidence.

The reviewed differences fall into explicit categories:

- New actor memories and hearing records, public rather than private exposure,
  bounded targeting, shared speech opportunities and doctrine-based theft.
- New uncertain nature observations and the corrected press/confide observation
  route; their seeded draws also change later scenes.
- Notebook-overlay markup, season-code validation/focus, approved editorial
  corrections and the dead-companion continuity fix.
- Forced scenario setup now establishes actual planting eligibility and clears
  the intended betrayer's public exposure, while the original selector retains
  the historical setup exactly. Deed scenes also temporarily remove their internal
  clamp/background/role modifiers, then explicitly assert kill/fail/watch/away,
  planted-trace recognition, hint versus direct allegation and keep/expel outcomes.
  Setting a nominal kill chance to one had not actually guaranteed that branch
  under the internal 0.95 clamp; the readable diff exposed the mislabeled capture.

Each golden language retains eight seeds and 170 snapshots per seed (1,360 each).
The new forced capture retains all original scenario names and adds
`between-late-4` and `between-late-5`: the changed initial season now selects a
six-entry late-encounter table. Differences in ordinary hazards, reaction text,
names, clues and outcomes follow the changed seeded state, not a rewritten
historical expectation. A new snapshot by itself is not evidence of correctness;
the focused actor, narration, hazard, source, dice, parity and real-browser checks
establish the specific contracts described above.

After the scoped forced-deed correction, all 413 current forced scenes reproduce
exactly in each language; all 411 original scenes also reproduce exactly. The
comparison contains 197 identical and 214 changed original scenarios per language,
plus the two additions. The local readable report is
`.local/review/29/baseline-differences-final.json`.
