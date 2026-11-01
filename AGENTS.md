# Working on The Gates of Kutha

## Scope and local tools

The previous baseline is **28.5.2**, reconstructed from **28.5.1**. The owner has authorized local **29.0.0** work:
the review fixes, archived gameplay plan, smarter and subtler cult, automatic resume, and a scene-first layout with
a notebook overlay. Current behavior is described in [the rules](docs/rules.md); future work is in
[the roadmap](docs/roadmap.md). Neural networks and learned actors are
explicitly deferred from gameplay. The owner has authorized preparing interfaces and local experiment infrastructure
for later learning, evaluation, rule distillation and application, with equal support for all actors' decisions.
Cleanup must still preserve behavior and both dice streams; authorized gameplay changes need
separate, reviewed baseline differences. The owner has now explicitly requested release of **29.0.0** after the
agreed work and a further rigorous optimization/refactoring/test/review/bugfix pass. That authorizes committing,
pushing and publishing this release through the existing workflow once those checks are complete; unrelated releases
still need an explicit request. Speak to the owner in English.

The uniform decision framework's initial migration preserved its selected gameplay baseline, visible output and
both seeded streams exactly. Keep that independent proof separate from later gameplay changes. The owner then
approved the four actor-information repairs (slips, abandoning a pretence, bringing/keeping dreams), the selected
bilingual editorial rewrites, and small, bounded object-reaction biases grounded in remembered doctrine, observed
signs and individual circumstances. Dreamers and smugglers may have different justified motives. Greeting expressions
must not freeze later replies, and expressions must fit what is said without making sincerity or hidden roles certain.
Measure intentional changes and retain uncertainty. Further gameplay changes and subjective rewrites still require
discussion and selection; cleanup alone does not authorize them.

Keep the Node distribution in Git-ignored `.local/node/`, never a system temporary folder. Use
`.local/node/bin/node` directly, or add `.local/node/bin` to PATH before npm. Keep the npm cache in
`.local/npm-cache/`. Project dependencies stay in the standard, ignored root `node_modules/` directory.

The build produces only `The Gates of Kutha.html`. GitHub Pages has one workflow: build, test, package and deploy.
There are no separate test workflows, automatic GitHub Releases, tags or artifact-host exports.

On this Mac, launching Chrome inside Codex's `seatbelt` sandbox aborts during application registration and displays
"Chrome quit unexpectedly" alerts. Do not retry sandboxed browser launches. Use the approved unsandboxed browser
test process with an isolated profile, sharing its `KUTHA_BROWSER_WS` across checks where possible; Node-only work
stays sandboxed. The harness refuses known sandboxed launches before starting a browser. Never change system crash
reporting settings or touch the owner's normal browser/profile to conceal an automation failure.

## Maintenance priorities

**Develop for the verified local Mac environment.** Audit inherited container assumptions, use native tools and
measure the current CPU, memory and browser workflow before choosing concurrency or optimization. The owner selected
adaptive resource use that keeps the Mac responsive. Reserve interactive capacity, bound memory-heavy jobs and make
explicit stress/throughput overrides opt-in. Prepare future Apple-accelerated experiment adapters without coupling
the browser game or its rules to a particular training backend. Keep environment facts and measured workflows in
`REQUIREMENTS.md` and developer documentation; do not replace evidence with assumptions about available resources.

**Prevent out-of-memory failures and OS instability.** Adaptive usage is mandatory, not an optional fast mode. Never
knowingly overcommit memory or run an unbounded workload that can exhaust the Mac. Budget CPU workers, browser
processes and future GPU/training allocations together, including unified memory, and retain headroom for macOS
and interactive applications. Check pressure before admitting expensive work and during long runs; reduce further
admissions, wait, or stop a job safely when headroom is inadequate. Prefer bounded batches, streaming diagnostics
and explicit per-job limits over accumulating whole datasets in memory. A manual concurrency override does not
waive memory protections. Preserve required coverage by resuming safely or reporting an incomplete run; never hide
an OOM or convert skipped samples into a passing result. No allocation forecast can guarantee against unrelated
processes exhausting memory, so the workflow must also handle pressure and allocation failures explicitly.

**Resource optimization order: token/context efficiency first, execution speed second, storage footprint third.**
Apply this order throughout implementation, research, testing, documentation and tooling. Prefer focused lookups,
compact reports and reusable authoritative modules; then remove repeated computation and I/O; then reduce stored
output and duplication. Do not save storage or runtime at the cost of needlessly larger context. Correctness,
required coverage and the applicable gameplay/dice-preservation contract remain constraints, not tradeoffs.

Treat these as ongoing requirements, including during ordinary feature work:

1. **Refactor aggressively.** Remove dead code, obsolete compatibility paths, redundant files and duplicated logic.
   Simplify awkward interfaces and consolidate overlapping implementations now rather than deferring cleanup to a
   numbered release. Check callers, dynamic access and regression evidence before removal.
2. **Use uniform, shared frameworks for major gameplay features.** Related mechanics should use consistent data shapes,
   rule resolution, event recording and presentation hooks. Extend the existing shared systems before creating a
   parallel implementation. Consolidate repeated behavior into small, explicit helpers; preserve meaningful
   differences between mechanics and avoid speculative abstractions or a new dependency when local code suffices.
3. **Optimize execution, with tests first.** Measure expensive work and remove repeated parsing, builds, browser
   launches and unnecessary I/O. Use the shipped engine in Node for state checks, bounded parallelism for independent
   work, and real browsers for browser behavior. Retain sample counts, assertions, rare branches and independent
   baselines. A speedup that weakens coverage or changes either seeded stream is a regression.
4. **Design for economical context use.** Keep code modular, prose in keyed catalogs and routine inspection available
   through focused commands. Maintain `tools/show.js` and the source/text audit as the code evolves. Prefer symbol/key
   lookup, targeted diffs and concise failure reports over reading whole files, generated HTML, catalogs or transcripts.
   Keep one authoritative implementation and document each tool where a future contributor will find it.

Keep the repository clean as work progresses. Remove superseded implementations, rejected mechanics, obsolete
plans/reviews and redundant files once useful evidence is transferred. Keep substantial mechanics/manipulation
research organized by topic, with implementation and test references; keep long-term learning plans in the roadmap.
Do not retain a second live rulebook or a rejected experiment's runtime merely for historical interest. Preserve
independent regression fixtures and useful measurement provenance; large local experiments belong in `.local/`.

For substantial changes, record what became simpler, the measured performance effect when relevant, and the checks
that establish preserved behavior. These requirements do not authorize deferred gameplay changes.

## Read only what the task needs

Start with `node tools/show.js --find <fragment>`, then one function, system method or text entry:

```sh
node tools/show.js dreamsOfTheNight
node tools/show.js Suspicion.dreamsKnown
node tools/show.js RULES.visit.from
node tools/show.js TX.dialog.stopsMidSentenceAnd
node tools/show.js ui/intro#yourSurname
```

`src/modules.json` lists build order; `DEVELOPING.md` explains architecture and commands. Avoid reading whole
catalogs, built HTML or long rule documents for routine edits. Research is indexed in `docs/research/README.md`;
future work is in `docs/roadmap.md`. Research and proposals are context, not authorization to implement new rules.
The original HTML and status snapshots were removed at the owner's request; their recovery fingerprint remains
in `test/fixtures/recovery.json`.

## Source and standing design rules

Modules share one script scope. Keyed prose and translation tables live in `src/text/**/*.json`. `__text('key')`
is a build-time macro relative to a module's catalog; `__text('path#key')` is explicit. Preserve lexical scope and
initialization order. No runtime catalog loader or third-party game libraries are needed.

The owner's design rules remain in force:

1. **Nothing is certain.** Outcomes use the seeded `chance` and amounts use `vary`. Chances stay between
   `RULES.scale.rarest` and `RULES.scale.surest` (currently 1–99%). Zero is for impossible events. Existing exceptions
   are documented in `docs/rules.md`; adding an exception requires the owner's direction.
2. **No probabilities or meters as numbers in play.** Nerve, wounds, trust and the rite are described in words.
   Choices describe what is at stake, without revealing odds.
3. **Both languages work throughout.** Every visible string uses `bi` or translated tables. The player can switch
   language at any point. Russian is an independent translation and never assigns the player a sex.
4. **Preserve the characters.** Camp romance is between a man and a woman; only women direct it toward the player.
   Pere Anselm keeps his vows.
5. **No single tell.** A visible behavior's cult/innocent likelihood ratio should stay around 0.5–2. Verify with
   `sim/tells.js`; the cult is found by reasoning over many observations.
6. **Keep mysteries hidden.** Do not explain the player's dreams or other secret mechanics during play. The ending's
   debrief reveals what it should.
7. **Preserve the look.** The established SVG portraits/scenes, night/lapis/gold palette and cartoon style stay.
   No character animation. The owner permits experiments and proposals for expressions, scenes, ending pictures,
   character designs and music while preserving the overall feel. Present subjective alternatives for selection;
   the 29.0.0 frightened-expression preview has been explicitly approved. Audio remains presentation-only.
   Both viewpoints are selected for release: third person keeps the original semi-first-person, over-the-shoulder
   composition by default; the player may switch to first person at any time in the casebook. Persist this local
   presentation preference without altering the expedition, language, or either seeded stream. Occasional hands,
   weapons, artifacts or tablets may appear when the scene supports them; first person does not require hiding
   the protagonist completely.
   After seeing the full-height/activity experiment, the owner rejected it: keep the original third-person appearance
   and right-hand figure staging, with first person compositionally similar. Do not apply full-height activity scenes.
   Expressions should fit the current interaction and may probabilistically reflect the actor's own relationships,
   trust, received criticism, rumours and perceived danger. Peer pressure can make sadness more likely without making
   it certain. Additional presentation choices use separate stable randomness and never consult hidden role/rite truth
   merely to draw a person. Further subjective artwork changes remain proposals until selected.
8. **Preserve the dice.** Seed, order and both streams are part of the game. Pictures, audio and rendering never
   consume game or prose dice. Use `Math.random` for presentation, or existing hash helpers for stable choices.
   Never remove a deliberately discarded roll or reorder rolls as a cleanup.
9. **Measure figures.** Published odds and balance figures come from fixed-seed scripts, never estimates. All tuning
   numbers belong in `src/rules.js`. Game rules emit events; `ui/cues.js` handles presentation.
10. **Keep the environment documented.** Update `REQUIREMENTS.md` when tools or verified browsers change. A deliberate
    future rule change also updates its documentation, version and measured figures; historical reports stay snapshots.
11. **The cult is an exceptional strategic opponent.** It must act exceptionally subtly, manipulatively and
    intelligently, and be capable of defeating sophisticated players. It adapts to observable player conduct,
    works through believable camp relationships and misinformation, balances immediate gain against exposure,
    and varies its choices instead of repeating a detectable script. This is a standing design requirement,
    not a claim that the current build has already met it. Validate it against strong observation-only players
    across fresh fixed seeds and several strategies. Measure individual acts, targets, pairs, timing and outcome
    consistency; report uncertainty and weak coverage. Cleverness never grants knowledge without a source,
    guaranteed success, or a decisive single tell. Difficulty must reward careful reasoning while leaving
    credible ways for the cult to mislead even an experienced investigator.
    **The long-term ideal is difficulty primarily from intelligent opposition.** Aim toward the cult's justified
    reasoning, adaptation, timing, restraint, believable deception and coordination in pursuit of the rite.
    This is an aspirational direction, not a ban on probability tuning or a claim that today's cult is already
    sufficiently intelligent. Numerical balancing, including odds, costs and ritual pace, remains a valid way
    to create challenge while its strategy develops. Randomness also preserves uncertainty and varied outcomes.
    Distinguish a strategy improvement from numerical tuning when reporting a change, measure both against
    strong observation-only players, and preserve fair evidence and credible counterplay.
    **Its objective is the successful completion of the rite, not killing everyone as in Mafia.** Evaluate every
    social-deduction rule, manipulation, alliance, sacrifice and act of violence through that objective. Murders
    matter primarily when they advance the rite or remove a justified obstacle to it; death counts are not a success
    metric. Delay, concealment, preserving useful innocents, misleading an investigator, or declining an attack may
    be better than killing. Weigh expected ritual progress and completion against exposure, disrupted cooperation
    and the player's ability to stop the rite, using only the cult's justified knowledge and beliefs.
12. **Preserve the voice when reviewing content.** Check both languages, plot continuity, character consistency,
    pictures and mechanics. Fix objective defects; list subjective concerns with concrete examples and proposed
    rewrites for the owner's decision before changing the established voice.
13. **Every actor has a justified, limited point of view.** An actor may decide only from information they possess
    or hypotheses they can plausibly form from it, never from inaccessible ground truth. This applies to every
    person, the cult acting together, and supernatural actors. For each decision, identify the actor, the source
    of knowledge, how it reached them, when it became available, and why their inference or confidence fits those
    circumstances. Distinguish observation, hearsay, memory, inference, faith and privileged supernatural insight;
    confidence is not correctness. A Dreamer may trust a dream and cultists may trust beliefs about their god,
    but neither is a blanket license for omniscience. Dreams, magic and other special knowledge require an explicit,
    case-specific rule: eligible subjects, relevant circumstances and influences, probabilistic accuracy and failure
    modes, with evidence in code/tests and design documentation. Private beliefs and conversations do not become
    common knowledge without a justified route. World resolution may use hidden truth to determine what happens;
    an actor's decision may use that truth only when that actor has a justified means of knowing it. Audit these
    boundaries and test that changing inaccessible facts cannot change the actor's choice distribution.
14. **Prepare every decision system for future learning and rule distillation.** Support all actors equally:
    the player, individuals, the cult as a group and justified supernatural decision-makers. Keep actor observations,
    legal actions, policy selection and world consequence resolution separate. Define versioned, compact observation
    and action contracts with explicit knowledge sources; hidden evaluation labels never become policy inputs by
    accident. Reuse the same action/resolution path for current rules, experimental policies and later distilled rules.
    Keep the current hand-authored policy as a reproducible baseline and fallback without extra draws. Experiments
    need isolated policy randomness, fixed seeds, recorded rule/schema versions and replayable outcomes; neither
    game nor prose dice may be consumed by logging, inspection or training machinery. Evaluate ritual completion,
    justified information use, concealment and fair evidence across multiple opponents, not death counts alone.
    Distilled rules must be inspectable, validated and compared against the source policy and baseline before adoption.
    Favor small local adapters and headless runs; do not add model dependencies, training or network inference to
    shipped gameplay merely to prepare for them. Actual learned behavior remains deferred and requires discussion.
15. **Explain the complete architecture and workflows.** Maintain an indexed guide reachable from `DEVELOPING.md`
    that lets a new human or LLM contributor understand the game's state, actor knowledge, action/rule resolution,
    probability and consequences, records, presentation, persistence, compilation, tests and research workflow.
    Include worked examples, module ownership, invariants and focused inspection commands. Explain experiment,
    learning and distilled-rule integration contracts, explicitly distinguishing implemented behavior from planned
    extensions. Update this guide alongside structural changes; link authoritative rules and examples instead of
    duplicating whole catalogs or tuning tables. Readers should be able to find one subsystem without loading the
    whole guide.

## Verification and maintenance

Use `npm run test:source` for compiler, catalog, audit and state checks without a browser. `npm test` includes real UI
coverage; `npm run test:full` retains larger sample counts and bots. Select affected steps with
`node test/run.js --only=seeds,engine`; run the full suite before handoff after runtime or dependency changes.

Logic tests/simulations execute the shipped script in Node. Real Chrome covers UI, layout, SVG and language changes;
Node/Chrome parity remains mandatory. Preserve all assertions, sample counts and failure exit codes.

Golden transcripts, forced scenes and the 48-season fingerprints were captured from the original release. Do not
rewrite them to accommodate cleanup regressions. Intentional gameplay changes require explicit authorization and
reviewed baseline differences. Inspect a failing season by its code with `test/replay.js`; save large diagnostic
captures to a file instead of flooding the terminal.

Run `npm run audit` to find unused facade exports and text entries; account for dynamic access and test consumers
before deleting code. Format changed source with the pinned Prettier. Keep shared compiler/test helpers small,
include focused tests for substantive changes, and document measured performance rather than guessing.

## Project presentation

The README is part of the game's artistic presentation: voice, atmosphere and real in-game images, rather than a
sales feature list or an implementation report. Do not advertise translation support or model/provider credits in
it or its screenshots. Credit the owner's display name, **Ilia R.S.**, linked to the profile. Keep technical build,
research and recovery details in developer documentation. README images are captured from genuine seeded play.
Recapture them using the current default third-person interface before a release. Keep season-code information
hidden in the title, casebook and ending until the player explicitly presses the secret reveal control; a seeded
URL must not expose it automatically.
