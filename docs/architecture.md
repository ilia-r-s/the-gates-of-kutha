# Architecture and working guide

This is the developer's map of *The Gates of Kutha*. Start here to understand the
whole program, then follow the relevant section instead of reading the generated
HTML. The game is one local, bilingual, seeded narrative simulation. It has no
server, runtime catalog loader or external game engine.

**Status:** 29.1.0 builds on 29.0.0's actor knowledge, camp influence,
scene-first presentation and automatic resume, with contextual text repairs,
rarer additional morning passages and saved session music. The uniform decision
framework's independent preservation proof precedes the separately authorized gameplay changes.
See the [future roadmap](roadmap.md), [29.0.0 verification](research/2026-11-01-validation.md)
and [29.1.0 review](research/2026-11-02-text-and-pacing.md). Neural inference,
training and adoption of learned behavior remain deferred.

## Reading routes

| Task | Read first | Then inspect |
| --- | --- | --- |
| Understand one expedition | [Lifecycle](#one-expeditions-lifecycle) | `newGame`, `startSlot`, `resolveNight`, `finaleIntro` |
| Change a person's behavior | [Actor knowledge](#truth-belief-and-actor-knowledge), [decisions](#actions-probabilities-and-consequences) | `Knowledge`, `Ties`, `Suspicion`, the feature's function |
| Add a consequence or clue | [Records](#records-and-public-consequences) | `Record`, `Moments`, the relevant `RULES` entry |
| Change prose or appearance | [Presentation](#presentation-and-language) | One text key, `artFor`, `paintScene`, `ui/cues.js` |
| Work on saves or replay | [Persistence](#persistence-and-replay) | `Session.act`, `Session.checkpoint`, `test/usability-engine.js` |
| Run work safely on this Mac | [Resource policy](#local-resources-and-macos) | `tools/resources.js`, `test/run.js`, `REQUIREMENTS.md` |
| Refactor without changing play | [Verification workflow](#change-and-verification-workflow) | `test/lib/season.js`, baseline and parity checks |
| Prepare learned or distilled policies | [Experiments](#experiments-learning-and-distilled-rules) | [Decision contract](research/2026-11-01-uniform-decisions.md), observer and tell tooling |

Commands below assume `.local/node/bin` is on `PATH`; setup is in
[DEVELOPING.md](../DEVELOPING.md). Use `node tools/show.js --find fragment`, then
`node tools/show.js Namespace.method` or a precise text key. Each lookup prints
its source path. `src/modules.json` is the authoritative build order.

## Program structure and ownership

The source modules share one JavaScript script scope. They are concatenated in a
fixed order, expanded from keyed text catalogs and minified conservatively into
`The Gates of Kutha.html`. They are not ES modules. Moving an initializer can
change which declarations exist when it runs; moving a text expression can change
its lexical bindings. The compiler checks collisions and expanded syntax.

| Owner | Authoritative responsibility | Must not become |
| --- | --- | --- |
| `game/state.js` | Expedition creation, characters and base state | A second presentation state store |
| `core/random.js` | Game/prose dice and low-level sampling | A rendering random source |
| `core/odds.js` | Ordered probability arithmetic and its diagnostic explanation | A source of tuning values |
| `core/decisions.js` | Named action contracts, ordered resolution, immediate typed consequences and opt-in policy/record channels | A duplicate of domain state or a scheduler that reorders actions |
| `rules.js` | Numerical tuning and chance/amount bounds | A prose catalog |
| `people/ties.js` | Directed liking, trust, hounding, grief and attraction | Public knowledge of private feelings |
| `people/knowledge.js` | Acquired observations, fallible memories, studies and doctrine | A fresh read of inaccessible truth |
| `people/suspicion.js` | Individual suspicions, public allegations and justified cult hearing | An omniscient common suspicion score |
| `game/record.js` | Evidence, testimony, sightings, journal and presented case | Proof that every testimony is correct |
| `people/moments.js` | Public statements, listener reactions and recorded social consequences | An automatic broadcast of private conversation |
| `people/influence.js` | Second voices, evidence doubts, inquiry intervention and source recall | A parallel relationship or evidence engine |
| `people/parts.js` | Role-specific behavior dispatch with ordinary fallbacks | Permission for every role to read every secret |
| `game/tenor.js` | Camp mood and crowding of optional material | A filter hiding required consequences |
| `game/day.js`, `night.js`, `finale.js`, `below.js` | Expedition progression and world resolution | A presentation-only simulation |
| `ui/scene.js`, `book.js`, `art.js`, `audio.js`, `cues.js` | Rendering, notebook, SVG, sound and presentation events | A consumer of gameplay/prose dice |
| `ui/session.js` | One persisted expedition and validated command replay | A serializer of JavaScript closures |
| `src/text/` | English/Russian wording and text factories | An unreviewed store of hidden tuning |

`S` is the authoritative current expedition. It contains both hidden world truth
and acquired information, so handing all of `S` to an actor or model would violate
the design. `S_ui` holds the current scene and notebook selection. Scene choices
contain callbacks; they are rebuilt by replay rather than serialized. Other
module-local values include the two RNG states, text caches and presentation
state. A complete replay check therefore compares more than `S` alone.

## One expedition's lifecycle

1. **Creation.** `newGame` resets season text, sets the seed, deals roles and world
   facts, creates character claims and relationships, supplies initial fallible
   memories, then deals mood, dreams and background-specific resources. The order
   is part of the seed contract. Setup can know truth when generating a noisy
   memory; the resulting actor later receives the stored memory, not truth.
2. **Day.** `startSlot` places available people and presents the plan. Travel,
   examination, conversation, reading and searches expose choices through scene
   objects. Actions update their owning systems and consume time where their
   existing rule specifies. A conversation may contain several questions within
   one occupied slot; do not assume every click advances time.
3. **Inquiry and deeds.** Public cases and votes use the evidence the player has
   presented plus each person's relationships and beliefs. Records distinguish
   an accusation, its support and the later outcome. Private deeds have their own
   witnesses and aftermath; secret success alone does not authorize testimony.
4. **Night.** `resolveNight` calls the ordered `NIGHT_STEPS`: selection and watches,
   dreams, guest actions, attacks, deeds, rite progression and aftermath. It can
   end the expedition before morning. Deferred first-light prose is evaluated at
   its established point; changing that point can consume different prose dice.
5. **Dawn and breakfast.** Day/time advance, temporary pressure eases, consequences
   and evidence are delivered, then optional camp voices and news occur. A death,
   physical trace, guest/deed consequence or urgent rite warning must not vanish
   merely because optional atmosphere is crowded. `NIGHT_ATMOSPHERE` uses the
   shared `room()` decay formula with its own count and `TENOR.nightCrowd` factor;
   investigation and testimony keep their separate, less restrictive budget.
   `TENOR.second` controls the extra world-news opportunity, without a hard cap.
6. **Finale and ending.** The date or rite can force the descent. Companions,
   equipment, acquired clues and chosen approaches affect real encounters and
   the final attempt. Endings and the debrief explain actual recorded outcomes;
   only this retrospective narrator may reveal the appropriate hidden truth.

The cult's objective is completion of the rite. Killing everyone is not its win
condition or a measure of intelligence. Every strategy must be judged against
ritual progress/completion, exposure and the player's ability to interfere.

## Truth, belief and actor knowledge

There are three different questions: what happened, what someone believes
happened, and what was said about it. Keep all three separate. A testimony can be
sincere and wrong; a knowledgeable speaker can lie; an accurate vision can be
concealed or disbelieved.

`Knowledge` entries carry a value, source, route, day/slot and confidence. Initial
memories are probabilistically generated from earlier camp life. Later knowledge
comes through recorded participation, presence, public words or a specified
hearing route. Some getters settle a new inference or rumour probabilistically.
Calling such a getter for a tooltip, preview or model observation can therefore
change play. Inspection should read already acquired records unless the actual
decision explicitly reaches the acquisition step.

Relationships are directed: A liking B does not imply B likes A. Trust toward the
player, affinity toward another person, attraction, hounding, grief and suspicion
serve different purposes. They belong in their existing owners even when a shared
decision rule reads several of them.

Actor decisions may use only their own information and justified hypotheses.
World resolution may use truth to determine consequences. Supernatural actors
are not exempt: a particular vision or divine perception needs an explicit
eligibility, accuracy and failure rule. The cult knows its membership and its
initiation beliefs, but those beliefs can be wrong. Ordinary actors cannot borrow
the cult's knowledge through a shared helper.

The [knowledge audit](research/2026-11-01-narrative-knowledge.md) lists concrete
sources and tested boundaries. To test a boundary, hold the actor's observations
fixed and change inaccessible truth. Their observations, legal alternatives and
choice distribution must remain unchanged. Legal-action filtering itself can
leak secrets even when the observation fields look clean.

`ObjectReactions` provides a worked example of this boundary: it receives an actor
and a visible item, reads `Knowledge.objectBeliefs`, then resolves greed followed
conditionally by fear through two named decisions. The primitive observation and
its provenance are separate. Small named `floor` influences take a maximum instead
of stacking; the shared odds evaluator still visits them in order. Remembered
doctrine and personally delivered luck can be wrong or incomplete. Neither the
observation nor the formula rereads the actual hidden ward/nature or player-only
signs. See [the implementation and tests](research/2026-11-01-object-reactions.md).

## Actions, probabilities and consequences

The uniform model is subject, action, optional object, context, eligibility,
knowledge basis, ordered influences and consequences. A consequence has its own
target, kind, amount if any, probability and dependency on prior results. The
[migration record](research/2026-11-01-uniform-decisions.md) records the implementation,
coverage boundaries and exact-preservation evidence.

`Decisions.define` registers a definition beside its owning feature. Its required
fields are `id`, `action`, `subject`, `authority` and `knowledge`, with an optional
`object`. An entity can be a stable ID or a function resolved at the actual call;
the object can be absent or the subject itself. Each definition has one resolver:
`probability` for a chance gate, or `execute` for a command. A probability may be
an existing `odds(...)` plan or a function evaluated once at invocation. Optional
`apply(result, ...args)` executes its dependent consequences immediately.

Definitions retain the feature's arguments instead of copying all context into
a universal state object. Eligibility and candidate selection remain at their
existing call sites. Consequence descriptions are static review metadata; actual
effects still run through the authoritative owners. `Decisions.effect` delegates
trust, directed liking, suspicion and hounding to `Ties`/`Suspicion`, preserving
their clamps, modes, return values and timing. It neither redraws amounts nor
batches effects. Use the domain owner for other consequence types until a shared
operation has an actual second caller.

`Decisions.descriptions()` is safe static inspection. In contrast, a rule's `.p()`
can execute knowledge acquisition inside an existing formula: it is not a safe
tooltip or model-input getter. `.roll()` resolves the gate and `.run()` also
applies the definition's dependent effect/command.

The current registry contains **58 definitions**: 52 chance gates, five dialogue
commands and one offered-choice command. These cover named odds, listener
reactions, dialogue, camp influence, dreams, theft, cult targeting, atmospheric
delivery, nature signs and descent trials. Lower-level random selection and
amount helpers remain in the existing engine; this is not a claim that every
`chance` call has been migrated or epistemically audited.

Authority is explicit: `actor` is a person's decision, `world` resolves an event,
and `legacy` marks a preserved rule with unresolved information/scheduling
questions. The owner subsequently approved repairing all four preserved paths:
`dialog.slip`, `pretence.drop`, `night.dream.bring` and `night.dream.keep`.
They now use received pressure, audience-specific claims/losses, witnessed
questioning and remembered doctrine or personal visions. The registry contains
46 actor, 12 world and no legacy definitions. Neither world nor any future
legacy definition can expose a policy observation. See the separate
[actor-decision comparison](research/2026-11-01-actor-decisions.md); it changes
gameplay after the migration, rather than weakening that migration's proof.

The existing probability core evaluates named arithmetic steps in order. `chance`
applies the common chance bounds and consumes a game draw only for a positive
input. `vary` models amounts using its established draws. These helpers do not
choose which information an actor is entitled to use; that is the calling rule's
responsibility. A formula's raw result and the final clamped chance can differ.

Keep alternatives and consequences ordered. A short-circuited branch must remain
unvisited; a weighted candidate pool must retain insertion order; a roll currently
discarded still advances the stream. A later listener can respond to a relationship
change made by an earlier listener. Neither parallel evaluation nor batching writes
is a semantics-preserving cleanup by default.

Game and prose randomness are separate. Text choice uses `sayPick` and related
helpers; rendering uses presentation randomness or stable hashes. Diagnostic
inspection, screenshots, audio and training logs must never consume either seeded
stream. The optional dice trace is evidence about actual calls, not another RNG.

### Worked example: pressing Anselm

The initiating subject is the player, the action is pressing, and Anselm is the
object. `DIALOG.press` first resolves cooperation using the current press rule,
then creates the player's line, records the pressure, updates hounding and gossip,
and resolves a separate possible trust cost. A successful response may lead to a
recantation or a role-specific reply through `Parts`.

Those are conditional consequences, not one universal “Anselm gets angry” roll.
Anselm becomes the subject of the nested reply decision. His own trust and beliefs
can affect that response; other people's private suspicions cannot. A probability
change, a reordered trust cost or a new emotional consequence would change play
and needs discussion after the initial framework migration.

The outer command is `player.dialog.press`. Nested definitions
`dialog.press.cooperate` and `dialog.press.trust` name Anselm as their subject
and the player as their object. Their observation contracts expose his own trust,
temperament where relevant, and the player's background, without a camp-state
dump. Focused inspection: `DIALOG.press`, `PRESS_COOPERATES`, `PRESS_TRUST`,
`pressP`, `Ties.hound`, `recantPressed` and `Parts.move`.

### Worked example: a second voice at breakfast

`CampInfluence.secondVoice` finds an actual recent public accusation and selects
an eligible target. Both factions use the same opportunity. A bounded cult aim
can bias the target among existing alternatives. It records speaker, target and
source, then calls the ordinary `Moments.blame` listener rules.

The resulting listeners can later join a wrongful inquiry. On a subsequent day,
an eligible listener can remember an earlier source, accurately or mistakenly.
The inquiry stores the public-speech boundary before voting begins, so a
simultaneous co-voter cannot retroactively become the cause of the vote. This
chain explains why event provenance and chronology are gameplay state.

### Worked example: a nature sign

`NatureSigns.tell` first resolves whether that channel delivers a sign, chooses
its subject where needed, then resolves its favorable/unfavorable image from the
power's nature. This is world resolution. The delivered text and channel enter
the journal; the player receives noisy evidence, never an exact nature score.
An NPC does not automatically acquire that information merely because it exists
in `S.natureSigns`.

## Records and public consequences

`Record` owns evidence and case construction. `Suspicion` owns statements and
belief changes. `Moments` selects listeners, applies each person's reaction and
stores the resulting public moment. `CampInfluence` refers to those records when
it needs a later causal link. Extend the authoritative owner before creating a
parallel log with similar but incompatible meanings.

Public and private are properties of a route, not merely of the speaker's role.
A private answer needs a witnessed conversation or later rumour before the cult
can act on it. A failed inquiry is public information; the true role secretly
assigned at setup is not. Ending explanations can inspect the final record, but
must not invent a betrayal, rescue or knowledge transfer that never occurred.

Game events and presentation events are also different. Gameplay records can
affect later decisions. The `ui/bus.js` events consumed by `ui/cues.js` trigger
sound and imagery; they must not secretly perform additional game decisions.

## Presentation and language

A scene is a data object with heading/body/art and ordered choices. `show` stores
it and paints it; `chooseScene` executes the selected callback through the session
boundary. The illustration, prose and choices lead the screen. Secondary map,
people, evidence, omens, kit and settings live in the notebook overlay, which owns
focus, tab navigation, Escape and return focus. This is the implemented
scene-first interface. Third person is the default; the casebook can switch to
first person at any point. `ui/viewpoint.js` owns that local presentation preference
and the alternate drawings. Both retain the original right-hand character
positions and scale. First person permits contextually justified hands or held
objects. The rejected full-height activity renderer is removed.

Visible prose lives in keyed `src/text/**/*.json` catalogs. `__text` is expanded
at build time in the original lexical scope. `bi`/translated tables preserve both
languages so switching does not replay an action. Russian wording never assigns
the player a sex. Translate for spirit, character voice and natural reading while
preserving consequential facts, uncertainty and clues. Trace the actual delivery context:
`dawn` advances the day before `theMorning` calls `nextOmen`, which also serves
daytime searches and news. `omenLog.day` records when the clue was encountered;
`bookOmens` retains that date and passage. A first-light observation cannot already
know noon's outcome. Keep its short label and tablet formula consistent without
inventing yesterday's event or a witness; genuine preceding-night reports remain valid.
Dynamic translation caches reset between expeditions.

SVG portraits/scenes are code-native. `artFor` derives a presentation description;
audio scheduling and mood mapping are separate. Neither changes world state or
seeded randomness. README images come from actual seeded play using
the retained `test/fixtures/pictures-29.0.0.json` routes, recaptured for 29.1.0 by `test/pictures.js`; never
fabricate a quieter outcome by deleting event text from a capture. Reply expression
palettes follow the current utterance's explicit intent, independent of its
greeting. Serious refusals cannot become cheerful merely through high trust;
cordial confidence refusals are cautious rather than angry and do not call a
friend a stranger. Palette weights use owned relationships and received pressure,
with stable presentation randomness. Old response draws remain in their original
order so this composition cannot change the plot.

Condition words use continuous threshold bands: fractional wounds cannot skip
from slight to grave, and decreasing nerve cannot appear to improve the condition.
The condition warning distinguishes serious wounds from grave ones. These are
display rules; damage, healing and death thresholds are unchanged. Season-code
fields, explanations and replay choices stay hidden until the title's secret dot
is pressed. A valid linked code can deal a season silently; an unrevealed malformed
link does not expose code diagnostics or block ordinary play.

## Persistence and replay

`Session` saves one current expedition as start parameters plus accepted player
commands. Replay reconstructs scene closures and shared references by running
those commands through the real game. A checkpoint includes normalized state,
scene and both RNG positions. Language/notebook preferences and the five-track
session playlist and requested track are restored too. Audio validates the
optional music data and restores the track after replay, without
replaying sound cues or consuming either seeded stream. A same-edition save without a
playlist, or one with invalid playlist data, keeps the fresh page's valid selection
and saves it with the expedition. If the requested track is missing or invalid,
audio selects it from the current day and phase. Playback restarts the track rather than saving
an audio-clock position; the global music/effect toggles remain local preferences.

Only the outer completed action is appended. Replay suppresses presentation
events and does not append another journal. Invalid schemas, incompatible/corrupt
saves, unavailable storage and stale tabs have explicit handling. A stale tab
cannot overwrite a newer expedition. Do not replace this with a raw JSON dump of
`S`: callbacks and other runtime state would be lost.
The release identifier is 29.1.0. The changed pacing means 29.0.0 command journals
are incompatible and receive the existing other-edition notice. Music-field fallback
does not bypass this version guard or checkpoint validation.

For later experimental policies, replay must use the accepted policy result,
never query the model again. Decision schemas and build/rule identity belong in
experiment metadata, separate from actor observations. A build identifier or
seed can reveal hidden state if inadvertently exposed as a policy feature.
This is implemented in the separate experiment journal. Ordinary `Session`
autosave records player commands, not overridden NPC proposals, and is not an
experimental-policy save format.

## Experiments, learning and distilled rules

The owner requires equal architectural support for all actors. Models are not
part of normal gameplay. Prepare interchangeable policy boundaries rather
than adding a special cult-only engine or a training dependency to the game.

The implemented local loop is: capture an actor's legitimate observation and legal choices;
ask a selected policy for a proposal; validate it; apply it through the same world
resolver; record the accepted result and evaluation separately. Current rules
remain the baseline and fallback. Shadow evaluation must not rerun current rules
or consume another game draw. The current bridge is synchronous and rejects
Promises. A future asynchronous adapter needs an explicit suspended-decision
protocol and once-only acceptance; it is not implemented by this release.

### Implemented policy boundary

Thirteen definitions currently expose audited primitive observations:
`player.choice`, `dialog.confidence`, `dialog.press.cooperate`,
`dialog.press.trust`, `claims.defend`, `influence.support` and
`cult.target.player`, `dialog.slip`, `pretence.drop`, `night.dream.bring` and
`night.dream.keep`, `dialog.object.greed` and `dialog.object.fear`.
These demonstrate player, individual and collective-cult
decisions through one interface. Other actors use the same contract when their
specific knowledge and action masks are audited; equal architectural support
does not mean every decision already has an experimental adapter.

Each audited definition declares `features` and a pure `observe` function.
Primitive types are number, string, boolean and nullable boolean. Observation
reads happen after the original baseline formula has acquired its normal
information, never as eager prefetch. A cult member's `targetCult` can describe
known membership; an ordinary actor receives null. The cult-target observation
reads already settled hearing records, not a new hearing roll.

The policy receives a JSON string with `schema: 1`, decision ID, subject, action,
optional object and observation. Chance requests add `mode: "chance"`, the legal
`apply`/`skip` outcomes and common bounds. Choice requests add `mode: "choice"`
and currently offered `{id, label}` alternatives. `player.choice` supplies the
displayed scene in the selected language and excludes setup/ending debriefs.
No expedition seed, dice state, baseline probability, private state or evaluation
reward is included in the input. Static descriptors are the single source of
feature allowlists used by the external validator.

A null response retains the original rule exactly. A chance response is
`{"schema":1,"decision":"dialog.press.cooperate","probability":0.4}`;
a choice response supplies an offered string `choice` ID instead of probability.
Invalid identities, extra fields, illegal choices, nonfinite/out-of-bounds
probabilities, asynchronous results and exceptions fail the experiment before
the gate draw. They do not silently masquerade as successful baseline runs.
The normal rule's formula still runs once; accepted probability replaces its
gate, not its eligibility or subsequent consequence resolver.

`Decisions.connect({policy, record})` installs separate trusted tooling channels.
The Node adapter's `page.connectDecisions` calls host callbacks with JSON strings,
never live VM objects. This reduces accidental access to game state; Node's VM
is **not a security sandbox** for hostile executable code. Only the restricted
JSON tree evaluator accepts an external rule artifact. Record callbacks are
privileged evaluators and must not feed their fields back into an actor policy.
One host controller receives requests from several subjects. The current tree
policy is stateless. A future recurrent/stateful adapter must maintain separate
memory for each subject, with the cult collective an explicitly shared subject;
otherwise one actor's private observation could leak into another actor's policy.
The bridge does not enforce that memory isolation automatically. The current
player adapter also covers scene text/labels, not notebook navigation, images or
all informational UI commands; those need explicit observation/action contracts.

Chance records include the actual baseline, accepted probability/result and
ordered influence explanation. Command records occur before nested consequences
with `phase: "selected"`: they record an attempt, not guaranteed success. Normal
play has neither callback installed, so it performs no observation construction,
JSON logging or model work. These records are not another persisted game history.

### Running and replaying experiments

`sim/decisions.js` implements `baseline`, `shadow`, `distilled` and `replay` modes.
The baseline is record-only; shadow records proposals but returns null to the
game; distilled mode applies a validated local JSON rule; replay supplies stored
accepted results without querying a policy. Build identity and the complete
contract must match for replay/comparison. Reports separate actor requests and
proposals from privileged decisions/outcomes, and compare whole-expedition
fingerprints rather than only win counts. See [commands](../DEVELOPING.md#local-decision-experiments).

The restricted tree format supports typed comparisons and bounded logical
branches, with at most 64 rules, 512 nodes and depth 12. Leaves provide a bounded
probability or offered choice. It has no JavaScript evaluation, arbitrary field
lookup, network calls or model dependency. This is an application/validation
format for future distilled rules, not a trained policy or a distillation algorithm.

Experiments run headlessly against the shipped engine. The current tree evaluator
is deterministic; simulated-player RNG is separate from both game streams. A
future stochastic policy must declare its own seed and record every accepted
proposal. Keep episode metadata, policy inputs and privileged
labels/rewards distinct. Label a terminated expedition differently from a test
stopped at a step limit. Use fixed training/evaluation seed partitions and fresh
confirmation sets; do not tune repeatedly against the claimed holdout.

Distillation means extracting inspectable rules from an experimental policy and
measuring whether those rules retain the useful behavior. It does not make the
result automatically fair, knowledgeable or strategically sound. Validate a
restricted declarative vocabulary, action legality, finite values and schema
compatibility. Do not execute arbitrary code from a rule artifact. Compare both
local decisions and complete expeditions against the source policy and existing
rules, including epistemic counterfactuals and rare opportunities.

Measure success against each actor's legitimate objectives. For the cult, rite
completion matters; deaths alone do not. Include concealment, exposure, supported
single tells and stronger observation-only opponents. Do not equate an extremely
low player win rate with a subtle opponent.

## Local resources and macOS

The verified native toolchain is documented in [REQUIREMENTS.md](../REQUIREMENTS.md)
and the [Mac workflow audit](research/2026-11-01-macos-workflow.md). Use native
ARM64 Node and the installed tools; no Linux container or Rosetta wrapper is
needed for this project. GitHub-hosted CI remains portable Linux and is a
separate environment, not a reason to retain local container assumptions.

`tools/resources.js` centralizes admission, CPU allowance, available-memory
headroom and pressure checks. `test/run.js` uses it for the build, browser launch
and test workers. It reserves interactive capacity, pauses new jobs on warning,
and stops owned work on critical pressure; incomplete checks fail. `JOBS` may
change the CPU ceiling but never disables memory protection. Child heaps and
collected output are bounded. Resource tests inject pressure signals rather than
stressing the user's Mac to exhaustion.

`sim/decisions.js` bounds each saved batch to 256 expeditions and 16 MiB of compact
records, checks headroom between expeditions and fails rather than calling a
partial batch complete. Existing standalone studies remain sequential; admit
large parallel batches through the shared helper. Do not run several independent
queues as though each owned the entire machine.

Future Metal/MLX/MPS adapters must declare CPU and GPU/unified-memory reservations
to the same scheduler and release resources on stop. No GPU backend is installed
or selected by this work. A shared reservation is a conservative forecast,
not a guarantee against unrelated applications exhausting memory between samples.

## Change and verification workflow

1. Read `AGENTS.md`, locate the authoritative implementation and identify whether
   the requested change is preservation work or an authorized gameplay change.
   Historical research is context, not authorization.
2. Reproduce the defect or define the invariant with an independent baseline.
   Use a focused test for a substantive behavior change; do not mirror the code
   with an assertion that merely repeats its formula.
3. Edit the owning modules and keyed prose, retaining scope/order. For intentional
   rules, update tuning, current rule documentation and measured figures. Preserve
   historical reports as snapshots.
4. Build once, run affected checks in Node, and use real browsers for focus, layout,
   SVG, input, language and storage. The Node adapter runs the shipped script; it
   substitutes DOM drawing, not game rules.
5. For refactoring, compare the frozen artifact against complete state, choices,
   English/Russian output, both RNG states and traced dice. Do not recapture
   fixtures to bless an unexplained mismatch.
6. For authorized gameplay changes, review differences before recording the
   separate 29 fixture set. Original 48-season, golden and forced fixtures stay
   immutable. Preserve sample counts and rare-branch assertions.
7. Run source/catalog audit, pinned formatting and the full suite before handoff
   after runtime/dependency changes. Update this guide when ownership or workflow
   changes. Report what became simpler, evidence, measured cost and uncertainty.

`sim/tells.js` reports supported violations separately from insufficient evidence.
Conditional rare scenarios answer a different question from actual-play rates;
report both denominators. A local multiplier bound does not prove observational
fairness after survival, opportunity and competing-target selection. See the
[verification method](research/2026-11-01-verification.md) and
[rare-behavior study](research/2026-11-01-rare-cult-behaviors.md).

Optimize token/context use first, speed second, storage third, subject to
correctness and required coverage. Keep detailed raw diagnostics in ignored
`.local/`, durable checks in `test/`/`sim/`, and concise findings in indexed docs.
Do not introduce repeated builds/browser launches, duplicate state or giant
unindexed transcripts. Publication requires an explicit request; the owner has
authorized the 29.1.0 release after logical corrections, documentation and final checks.
