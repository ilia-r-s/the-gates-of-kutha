# Subtle opponents and justified knowledge, 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

Research used during 29.0.0 development. The owner's priorities are an exceptionally
subtle, manipulative cult capable of defeating sophisticated players, fair
evidence, and a justified point of view for every actor. Neural networks and
learned actors are explicitly deferred to a later release.

## What the earlier reports contribute

The [hidden-role games report](2026-10-24-hidden-role-games.md) argues for innocent
alternative explanations, mixed strategies and ordinary voting behavior. The
[manipulation report](2026-10-27-manipulation-techniques.md) adds bounded targeting,
influence through the camp, style-based counters, source attribution, and pair,
timing and consistency checks. Its historical measurements are not current
measurements and its real-world analogies are not evidence that a particular game
rule works. They generate hypotheses to test in Kutha.

## Additional primary research

- [Information Set Monte Carlo Tree Search, Cowling, Powley and Whitehouse (2012)](https://eprints.whiterose.ac.uk/id/eprint/75048/1/CowlingPowleyWhitehouse2012.pdf)
  explains the error of choosing different actions in hidden states that a player
  cannot distinguish (strategy fusion). The corresponding Kutha check is a
  counterfactual information test: hold the actor's observations and beliefs fixed,
  change inaccessible truth, and require the same decision distribution. This is
  useful even with hand-written rules and no search or learning algorithm.
- [DeepRole, Serrino et al. (2019)](https://arxiv.org/html/1906.02330v1) combines
  belief reasoning with search and evaluates against several kinds of opponents.
  The paper does not establish convergence for multi-player CFR. For Kutha, the
  useful lesson is to evaluate strategic behavior against a diverse policy set;
  one bot's win rate cannot certify intelligence or concealment.
- [AvalonBench, Light et al. (2023)](https://arxiv.org/abs/2310.05036) supplies
  explicit game environments and rule-based baselines. Its evaluated language
  agents did not automatically outperform the simpler bots. More elaborate
  machinery is not evidence of a better opponent.
- [GRAIL, Rahimirad et al. (2026 revision)](https://arxiv.org/html/2506.17788v2)
  separates structured belief inference from language. Its limitations explicitly
  distinguish detecting deception from generating persuasive deception, and
  note repetitive communication against humans. This supports Kutha's separation
  of actor beliefs, decisions and prose, but does not validate a deceptive Kutha
  policy. Its calibration and evaluation methods also need examination rather
  than automatic adoption.

These are design inferences from the papers, not claims that an Avalon algorithm
transfers unchanged to this single-player narrative game. No model, training
dependency or external inference service is introduced.

## Implemented hypotheses

| Question | Local implementation | Required evidence |
| --- | --- | --- |
| Can a cultist read someone else's unspoken suspicion? | No. The five threat settings use public statements, presented inquiry cases and dreams with an actual hearing route. | Counterfactual changes to private suspicion must not affect the decision. |
| Would one danger number make every decision clearer? | Experiment only; retain the reviewed five. | [12,600-season study](2026-11-01-common-threat.md), active-case fidelity and 20 paired debriefs. |
| Can a public act have a goal without becoming a tell? | Shared speaking opportunities; target weight can receive at most the named aim multiplier. | Counts and clustered intervals, including targets and pairs. A mathematical weight bound alone does not certify observational fairness. |
| Can ordinary people carry a cultist's influence? | Second voices use `Moments`; a friend can spend influence at one inquiry; doubts affect the presented case regardless of hidden truth. | Source records, role-swapping checks and both innocent and cult uses of the channel. |
| Can a misleading source be traced? | A previously influenced wrong voter may remember a public source; memory can be wrong. | Records must precede the vote and known outcome; no retroactive invented source. |
| Can the cult plant evidence without an escalating script? | Each actor can make one deliberate scene plant; ordinary stray traces and the thief remain alternative causes. | Rare-branch tests and actual tell denominators. |
| Can players infer a power's preferences? | Uncertain signs in delivered omens, ordinary luck, actions, tablet readings, dreams and deaths. | `sim/nature.js`: observed-way accuracy, mistakes, neutral cases and paired actual finales. |

## Sparse influence registry experiment

`sim/influences.js` expresses the existing confidence-taking odds through six
named influence entries. Each entry states whose information it reads. It compiles
to the existing `odds` framework; evaluation order and trace labels remain the
same. Across 48 actual seasons the complete state, both dice streams and traces
were identical to the direct implementation. Five alternating runs of 500,000
evaluations measure overhead on this machine; results are recorded in the release
validation record.

This small experiment establishes feasibility for that decision only. It does
not justify routing every rule through a new abstraction, nor does a `knows`
annotation enforce an information boundary. The shipped code retains the small
existing framework. New influence mechanics reuse `Moments`, `Suspicion`, `Ties`
and `Record`; an all-purpose second rules engine is not added.

## Evaluation boundaries

The repaired ordinary policy no longer knows hidden roles or solutions. The
observer solves from recorded evidence and plays the real finale. Neither is an
optimal player or a substitute for experienced human playtesting. Low player win
rates alone do not demonstrate subtle strategy: random damage can produce them
too. Compare adaptive decisions, evidence use, sacrifice and exposure costs,
paired seeds, fresh seeds and several play styles.

Sparse and zero-event tell rows remain unproven, not passes. Pair and clock checks
are necessary because independently ordinary-looking actions can form an obvious
joint pattern. The [verification method](2026-11-01-verification.md) reports these
limits explicitly. Historical reports remain snapshots.
