# Working on The Gates of Kutha

## Scope and local tools

The project baseline is **28.5.2**, reconstructed from **28.5.1**. Cleanup, refactoring and dependency updates are
authorized. HTML bytes may change; game behavior, visible output and both seeded dice streams must remain identical. Do not commit, push,
publish or implement deferred 29.0.0 gameplay proposals without an explicit request. Speak to the owner in English.

Keep the Node distribution in Git-ignored `.local/node/`, never a system temporary folder. Use
`.local/node/bin/node` directly, or add `.local/node/bin` to PATH before npm. Keep the npm cache in
`.local/npm-cache/`. Project dependencies stay in the standard, ignored root `node_modules/` directory.

The build produces only `The Gates of Kutha.html`. GitHub Pages has one workflow: build, test, package and deploy.
There are no separate test workflows, automatic GitHub Releases, tags or artifact-host exports.

## Maintenance priorities

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
plans in `docs/plans/README.md`. Their contents are historical context, not authorization to implement proposals.
The original HTML and status snapshots were removed at the owner's request; their recovery fingerprint remains
in `test/fixtures/recovery.json`.

## Source and standing design rules

Modules share one script scope. Keyed prose and translation tables live in `src/text/**/*.json`. `__text('key')`
is a build-time macro relative to a module's catalog; `__text('path#key')` is explicit. Preserve lexical scope and
initialization order. No runtime catalog loader or third-party game libraries are needed.

The owner's design rules remain in force:

1. **Nothing is certain.** Outcomes use the seeded `chance` and amounts use `vary`. Chances stay between
   `RULES.scale.rarest` and `RULES.scale.surest` (currently 1–99%). Zero is for impossible events. Existing exceptions
   are documented in the historical rules; adding an exception requires the owner's direction.
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
   No character animation.
8. **Preserve the dice.** Seed, order and both streams are part of the game. Pictures, audio and rendering never
   consume game or prose dice. Use `Math.random` for presentation, or existing hash helpers for stable choices.
   Never remove a deliberately discarded roll or reorder rolls as a cleanup.
9. **Measure figures.** Published odds and balance figures come from fixed-seed scripts, never estimates. All tuning
   numbers belong in `src/rules.js`. Game rules emit events; `ui/cues.js` handles presentation.
10. **Keep the environment documented.** Update `REQUIREMENTS.md` when tools or verified browsers change. A deliberate
    future rule change also updates its documentation, version and measured figures; historical reports stay snapshots.

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
