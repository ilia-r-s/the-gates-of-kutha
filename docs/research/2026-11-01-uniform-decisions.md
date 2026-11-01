# Uniform decisions: migration contract

The owner authorized implementation after the rare-behavior repairs and quieter
nights. Those rules were frozen as artifact `bdc94645…`; the framework is now
integrated and independently compared with it below. Subsequent changes to game
rules require discussion with the owner. The contract and initial research are
retained to explain the design.

## Model

The owner's subject → action → optional object → consequence → probability model
needs three additional distinctions:

- **Context and eligibility:** when the action is available, and which prerequisites
  make a consequence possible. An impossible action is different from a possible
  action whose roll fails.
- **Knowledge and authority:** the deciding actor, the source of each relevant
  belief, and whether a step is an actor decision or world resolution. Confidence
  in a belief never establishes its truth.
- **Ordering and dependency:** one action can have several consequences, some
  conditional on earlier consequences. Preserve that dependency and its dice
  order; do not turn it into independent marginal probabilities.

Subjects include the player, an individual, the cult acting together, a supernatural
actor, and the world resolving an event. The object may be absent, the subject,
another person, a group, a place or an item. Consequences can affect another target
than the action's object: pressing Anselm can change his trust and then affect a
listener's opinion. Each consequence needs its own target, kind and amount where
applicable.

## Boundaries

Keep relationships in `Ties`, actor evidence and beliefs in `Knowledge` and
`Suspicion`, and delivered records in `Record`/`Moments`. The framework coordinates
these authoritative modules; it must not duplicate their state or replace
character-specific rules with one generic personality score.

Use a sparse list of named influences for each decision. An absent influence is
neutral. Share identical reads and arithmetic through small helpers, but preserve
different coefficients, gates and timing where the selected rules differ. Tuning
stays in `RULES`. Action definitions belong beside their feature, not in a second
copy of all game rules.

Evaluate an invoked rule against the current context in its existing order. Do
not continuously recalculate every possible subject/object pair. Do not evaluate
unselected branches, prefetch knowledge that may require a hearing roll, cache
probabilities across state changes, combine dependent rolls, or remove discarded
draws. Apply consequences synchronously in the original order. Existing journals
and presentation events retain their meaning and timing.

Preserve short-circuit boundaries, candidate insertion order and the exact point
where amounts are evaluated. In particular, an amount currently drawn before a
gate cannot be moved after it. Do not sort candidates through registry order,
batch relationship changes, or simplify nested `TRACE_WHY` handling during this
migration. A later actor can depend on an earlier actor's completed consequence.

Inspection must distinguish a static rule description from a live calculation.
Listing a rule must not acquire knowledge, consume dice or mutate the expedition.
Diagnostic records must not become player-visible odds or a second persisted
event history. Knowledge annotations help review; counterfactual tests are still
needed to detect forbidden truth reads.

The owner also authorized infrastructure for later neural experiments, equally
across actors. Observation and legal-action contracts must support current rules,
experimental policies and inspectable distilled rules through the same resolver.
Training labels and full-state evaluation belong to a separate tooling channel;
they are never implicitly included in an actor's observation. Keep policy RNG
separate from both game streams. Normal play must neither load a model nor create
training data by default. Learned behavior remains deferred.

## Research informing the design

The [SCXML specification's execution semantics](https://www.w3.org/TR/scxml/#SelectingTransitions)
make condition checks, explicit ordering and completion of one event before the
next part of a precise behavioral contract. The useful inference for Kutha is to
specify those details, not to import XML or a statechart dependency. A different
order would be a gameplay change even if the same formulas appeared in the code.

The [existing information-set research](2026-11-01-social-deduction.md) supplies
the complementary epistemic constraint: indistinguishable situations must not
produce different actor decisions merely because hidden truth changed. The
[earlier sparse-registry experiment](2026-11-01-social-deduction.md#sparse-influence-registry-experiment)
established exact replay for one probability only; it does not establish the
correctness or performance of the forthcoming migration.

For future experiment adapters, [Gymnasium's environment contract](https://gymnasium.farama.org/api/env/)
separates reset/step, observations, actions, evaluation information and termination
versus truncation. [PettingZoo's AEC contract](https://pettingzoo.farama.org/api/aec/)
models sequential multi-actor decisions and explicit legal-action masks. The
inference for Kutha is to preserve an ordered actor/decision boundary and separate
policy inputs from evaluation metadata. Neither library is required in the
shipped game; an external adapter can translate a small local contract later.

[VIPER policy extraction](https://arxiv.org/abs/1805.08328), by Bastani, Pu and
Solar-Lezama, extracts decision-tree policies guided by a neural policy and its
value estimates. Its demonstrations do not establish that a distilled Kutha
opponent will be fair or subtle. The relevant design lesson is to make policy
inputs and legal outputs explicit, retain teacher/baseline comparisons, and
represent distilled rules in a restricted inspectable format. No distillation
algorithm or neural runtime is selected for this release.

Counterfactual checks must cover action masks as well as observation fields.
For example, filtering a target list by a disappearance the deciding actor has
not heard about reveals hidden information even if the list contains no role
labels. Captured decisions need a once-only acceptance/rejection boundary;
fallback and shadow evaluation must not repeat acquisition or consume another
game draw. Experiment seeds, RNG states and privileged rewards are metadata,
never implicit policy features.

## Required evidence

Preserve an independent built artifact before migration. Compare complete state,
choices, visible English and Russian output, both final RNG states and the ordered
dice trace. Keep original-release fixtures immutable and do not regenerate the
selected 29 fixtures to accommodate a refactoring mismatch. Include meaningful
tests for conditional consequences, self/absent objects, late context changes,
knowledge boundaries and inspection without side effects. Measure runtime and
artifact-size effects after correctness; token/context efficiency remains the
first resource priority.

## Implemented migration and evidence

This section records the exact migration checkpoint. The owner later approved
repairing the four preserved knowledge paths; see the separate
[actor-decision study](2026-11-01-actor-decisions.md). Current contracts and counts
are in [the architecture guide](../architecture.md). Later gameplay changes do
not retroactively become part of this preservation proof.

`core/decisions.js` now owns one definition/dispatch contract. Definitions remain
beside their feature, with subject/action/optional object, authority and knowledge
metadata, an ordered probability or command resolver, and immediate consequences.
`core/odds.js` retains the original arithmetic and trace explanations. Relationship
effects delegate to their existing owners. The registry covers 56 definitions:
50 chance gates, five dialogue commands and one offered player-choice command.
Static inspection neither acquires knowledge nor consumes dice.

Seven explicitly audited observation contracts cover player choices, confidence,
pressure cooperation/trust, dream defence, inquiry support and collective cult
targeting. Four preserved rules remain labelled `legacy` and cannot expose model
observations: slips, abandoning a pretence, bringing a dream and keeping a dream
after a death. Their private-case/testimony or exact-rite dependencies need a
separate gameplay discussion. Lower-level random helpers are not all registry
entries; the migration is not a claim of a complete epistemic audit.

`test/lib/node.js` supplies a JSON-only trusted host bridge. Policies receive
versioned actor observations and legal outcomes/choices, not seeds, baseline
probabilities or evaluation labels. The resolver accepts a validated response
once, or null for the unchanged baseline; malformed/async/throwing responses fail
before the gate draw. Privileged outcome records use a separate channel. Named
trace cleanup was extended only for the new rejected-policy path, preventing a
failed experiment from annotating a later unrelated die.

The host JSON tree validator accepts typed comparisons, bounded logical branches
and probability/choice leaves, not executable code. `sim/decisions.js` runs
baseline, shadow, distilled and exact accepted-result replay modes against the
shipped engine, with bounded batches and resource checks. No neural dependency,
training algorithm or learned production behavior was added. Node VM is
[not a security boundary](https://nodejs.org/api/vm.html#vm-executing-javascript);
host callbacks are trusted. Future stateful policies need per-subject memory
isolation, and ordinary autosave is separate from experimental proposal replay.

`sim/framework.js` compared the independent 1,294,433-byte baseline with the
1,309,456-byte migrated artifact (`ac89fecf30d82a7ad11a051ba30fd853436b8ca8684497a80a32bd27f163b513`).
All **96 complete expeditions** matched: the 48 regression cases plus 48 fresh
cases from seed 79213, covering both languages and all backgrounds. Complete
state, offered choices, 8,168 rendered SVG/text scenes, 130,684 ordered dice,
their named explanations and both final streams are identical. No baseline
fixtures were rewritten for this migration. Rendering was also checked for
seeded-dice consumption. Proof: `.local/review/29/framework-proof.json`.

Alternating artifact order took 2.726 seconds before and 2.717 seconds after for
the summed instrumented expeditions; VM setup is excluded. This single run does
not establish a speedup. Sampled process RSS peaked at 299.4 MiB. The HTML grew
15,023 bytes (1.16%) for the contract and opt-in diagnostics. The architectural
benefit is one inspection/dispatch/validation path with no duplicate relationship
state or probability calculation, while keeping normal observations/logging off.

The local example loop completed 24 expeditions per mode (12 ordinary, 12 careful).
Shadow saw 1,874 actor inputs and 94 proposals, accepted none and preserved all
24 fingerprints. The illustrative tree applied 96 chance proposals; all 24
expeditions completed and replay reproduced every request, accepted result,
evaluation record and fingerprint without consulting a policy. Independent
tests also replayed 169 overridden player choices over two complete expeditions.
These are infrastructure checks, not evidence that the example improves cult
intelligence or meets fairness goals. Files: `decision-{baseline,shadow,distilled,replay}.json`
under `.local/review/29/`. The [architecture guide](../architecture.md) documents
the API, ownership, migration limits and future workflow.
