# Developing The Gates of Kutha

The current release is **29.0.0**, developed from the single-commit
**28.5.2 baseline** on `main`. The source was recovered from **28.5.1**,
first reproducing the preserved HTML byte for byte. Subsequent authorized
cleanup preserves behavior and seeded replays while allowing different HTML bytes. Intentional 29 gameplay changes
have separate versioned fixtures; original recordings remain historical evidence. [The recovery record](docs/recovery.md)
documents both milestones. The build reads editable source, catalogs and package metadata; it needs no reference HTML.

## Setup

Keep Node **26.13.0 LTS** (`.nvmrc`) in Git-ignored `.local/node/`. Dependencies use npm's standard root `node_modules/`;
the npm cache stays inside the project too. Nothing needs installing system-wide or keeping in `/private/tmp`.

```sh
export PATH="$PWD/.local/node/bin:$PATH"
npm ci --cache .local/npm-cache
npm run build
npm run test:source       # compiler, catalogs and state checks; no browser
npm test                  # browser checks too
npm run test:full         # larger counts, random/cheating bots and puzzle simulation
```

Tests use Playwright's Chromium when installed, otherwise local Google Chrome on macOS. Select a browser explicitly,
or install Playwright's alternative, with:

```sh
KUTHA_BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test
PLAYWRIGHT_BROWSERS_PATH="$PWD/.local/browsers" npx playwright install chromium firefox webkit
PLAYWRIGHT_BROWSERS_PATH="$PWD/.local/browsers" KUTHA_BROWSER=firefox node test/usability.js
PLAYWRIGHT_BROWSERS_PATH="$PWD/.local/browsers" KUTHA_BROWSER=webkit node test/usability.js
```

Tests create isolated browser profiles and contexts. Normal tests block web fonts; screenshots serve pinned font
packages locally. `npm run clean` removes generated HTML, test screenshots and `_site`, keeping the local SDK and dependencies.

In Codex's macOS sandbox, browser launches fail before the game loads and can
trigger system crash dialogs. The harness blocks that known failure before
starting Chrome. Run browser checks through an approved unsandboxed process;
`KUTHA_BROWSER_WS` lets the runner and standalone checks reuse its isolated test
server. The runner does not close a borrowed server. Keep Node checks sandboxed.

```sh
node build.js --check                  # compile in memory; write nothing
node build.js --debug --out=.local/debug
node test/run.js --only=build-tests,seeds,claims
JOBS=2 node test/run.js full --timings
node tools/show.js --find dream
node tools/show.js dreamsOfTheNight
node tools/show.js Suspicion.dreamsKnown
node tools/show.js RULES.visit.from
node tools/show.js TX.dialog.stopsMidSentenceAnd
node tools/show.js ui/intro#yourSurname
npm run audit
```

The only build output is **`The Gates of Kutha.html`**, a complete playable document. It is ignored by Git. There is
one GitHub workflow: build and run the full suite for `main` pushes, pull requests and manual dispatch. Packaging and
Pages deployment require `main` and a non-PR event. There are
no separate test workflows or automatic release/tag jobs. `node tools/site.js <base-url> _site` packages a local Pages
preview without deploying it; it adds site metadata and copies the one image that metadata uses.

## Reading and architecture

Read the [architecture and working guide](docs/architecture.md) for the complete
game lifecycle, state ownership, actor knowledge, decision/consequence model,
presentation, persistence and experiment workflows. It includes worked examples
and a subsystem index for human and LLM contributors; this document is the command
and tooling reference.

Read one declaration or text entry with `tools/show.js`. `--find fragment` searches symbol names and text keys without
printing their values; `--list` lists modules. `Namespace.method` finds private implementations inside shared systems.
A catalog path or `TX` namespace alone lists keys; `--all` explicitly prints the contents. Unique text keys also work
without a namespace. Avoid loading whole catalogs, built pages or long transcripts into an assistant's context.

`src/modules.json` sets the order of the modules sharing one script scope. Acorn checks declarations, including
destructuring, and rejects duplicate globals. The combined script is syntax-checked after text expansion. Terser
removes statically dead expressions and unused locals, and shortens local bindings while retaining global and function
names. Algebraic evaluation is disabled to preserve arithmetic and dice behavior. A content-keyed cache avoids
repeating minification within a build process; unchanged output files are left alone.

| Area | Responsibilities |
| --- | --- |
| `core/random.js`, `odds.js` | Game dice, independent prose dice, replay codes, traces and probability steps. |
| `core/decisions.js` | Shared action/subject/object contracts, ordered resolution, typed effects and optional serialized policy/record channels. |
| `core/text.js`, `catalog.js` | Bilingual tokens, grammar and text-factory initialization. |
| `rules.js` | Current tuning constants. |
| `data/`, `i18n/`, `world/` | Tables, translations, powers, signs, charms, tablets and deaths. |
| `game/state.js`, `record.js` | Dealing/state; evidence, testimony, traces and case strength. |
| `people/ties.js`, `suspicion.js` | Relationships, grief, hounding, suspicion and knowledge. |
| `people/knowledge.js`, `influence.js` | Actor-specific observations, fallible memories/doctrine, public influence and remembered sources. |
| `people/reactions.js`, `manner.js` | Bounded object-reaction motives and conversation expressions from justified actor context. |
| `world/nature.js` | Uncertain delivered signs of the power's favored ways, recorded through the shared journal. |
| `people/moments.js`, `gossip.js` | Public reactions and private words travelling through camp. |
| `people/watch.js`, `parts.js` | Watch promises and role-specific claims, answers and strategies. |
| Other `people/` modules | Claims, pretences, visits, flirtation, faces, craft, alibis and dialogue. |
| Other `game/` modules | Days, inquiries, nights, dreams, hazards, descent and endings. |
| `ui/`, `page/` | Screens, casebook, SVG, audio, styles and the complete document template. |
| `ui/session.js` | One local expedition, validated action replay, language, stale-tab protection and storage feedback. |
| `ui/viewpoint.js` | Persisted third/first-person choice and alternate SVG, isolated from gameplay and both dice. |
| `text/` | Keyed prose, labels, translations and templates, read at build time. |

[AGENTS.md](AGENTS.md) contains the standing design rules and explicit requirements for aggressive refactoring,
shared gameplay foundations, execution efficiency and economical context use. Keep related mechanics on those shared
systems. `tools/audit.js` finds unused facade exports, passages and catalog entries, accounting for test consumers and
conservatively retaining dynamic access. It also rejects vague `text`/`textN` catalog keys. Inspect callers before
deleting anything; preserve both seeded streams in cleanup. `npm run review:text -- --out=.local/review/text.json`
inventories every catalog and writes keyed editorial candidates. Its flags require human interpretation; they are
not automatic errors or permission to rewrite a character's voice.

## Text catalogs

`__text('key')` reads `src/text/<module-path>.json` at build time. `__text('people/dialog#passages')` selects an explicit
catalog. Expansion takes place at the original expression, preserving lexical scope without runtime lookup calls.
Missing keys, malformed references/templates and syntax errors fail the build.

Most values are ordinary JSON. Tagged values preserve expressions that need their surrounding scope:

| Tag | Meaning |
| --- | --- |
| `{"$template": "Hello ${name}"}` | Template literal with escapes and interpolation. |
| `{"$args": ["name"], "$value": ["Hello", "Здравствуйте"]}` | Text factory returning a value. |
| `{"$call": "bi", "$args": ["Hello", "Здравствуйте"]}` | Bilingual call; `oneOf` is also supported. |
| `{"$js": "expression"}` | Expression or factory needing lexical scope. |

Catalogs are trusted source templates. Preserve logic identifiers and expressions during prose edits. Keep both
languages valid. `TX.<namespace>.<key>` is the runtime API, initialized in the recovered order. Compiler, text expansion,
audit and symbol inspection share `tools/syntax.js` rather than maintaining independent parsers or walkers.

## Tests and performance

The runner builds once, shares one browser server, and isolates contexts per browser check. `tools/resources.js`
admits workers adaptively using available memory and current pressure, reserving desktop headroom and CPU capacity.
The automatic ceiling is five; on the verified Mac it reserves two performance cores and 4 GiB of memory for other
work. `JOBS` changes the CPU ceiling only, never memory protection. Combined reservations account for Node/browser
work; warning pauses admission and critical pressure stops owned work with an incomplete failure. Children use the
current `process.execPath`, a 512 MiB V8 heap limit and bounded 16 MiB diagnostic output. These reservations are
conservative forecasts, not a guarantee against unrelated applications exhausting memory.
Checks print timings and short failure reports; `--timings` also reports browser startup and shutdown.
Use targeted checks while editing, and the full suite before handoff after runtime or dependency changes.
`node tools/resources.js` prints a compact current budget. The [native Mac audit](docs/research/2026-11-01-macos-workflow.md)
records hardware, tools, limits and benchmark evidence; do not run several large independent queues concurrently.

The previous 28.5.2 baseline completed the full suite in about 24 seconds on the development Mac. Current timings
and added coverage are recorded in the [29 validation record](docs/research/2026-11-01-validation.md); the larger checks are not directly comparable. The measured
translation-cache reduction and unchanged original-rule fingerprints are in the
[presentation review](docs/research/2026-11-01-presentation.md).
The selected pre-framework checkpoint passed all 35 steps in 54.72 seconds with three workers. Later framework/resource
checks add coverage; consult the validation record for the current result instead of comparing unlike suites as a speedup.

| Checks | Coverage |
| --- | --- |
| `build.js` | Deterministic source-only output, text edits/missing keys, lexical expansion and global collisions. |
| `resources.js` | Injected headroom/pressure scenarios, bounded admission and honest incomplete failures without actual memory stress. |
| `decisions.js`, `decision-policy.js` | Lazy definitions, exact fallback, actor inputs, legal responses, typed effects, counterfactuals, declarative validation and accepted-result replay. |
| `engine.js` | Prose dice, private knowledge, veiled dreams, Watcher retractions and all simulation policies. |
| `verification.js`, `knowledge.js`, `cult.js`, `nature.js`, `narrative.js`, `hazards.js` | Test randomness, hidden-answer guards, actor provenance, schemes, uncertain signs, ending continuity and prose-free hazard costs. |
| `usability-engine.js`, `usability.js` | Codes, translation retention, action replay and real browser input/storage/modal behavior. |
| `seeds.js` | 48 full seasons compared to the separately reviewed 29 expectations; original-release fingerprints remain immutable. |
| `lint.js`, `tools/audit.js` | Shared scope, rule keys, unused exports and orphan text. |
| `claims.js`, `social.js`, `gods.js`, `dooms.js` | Actual shipped script in Node, with retained sample counts/assertions. |
| `parity.js` | Chrome and Node independently compared to the same reviewed 48 seasons: choices, state, both dice streams and every traced game die. |
| `golden.js` | Original seeds and capture steps in both languages, with separate release fixtures; full-field SHA-256 including SVG. |
| `forced.js` | Rare branches captured in both languages, plus leak scans. |
| `site.js` | Complete Pages document, metadata and minimal packaged files. |
| Other browser checks | Layout, ending art, seeded fuzzing, UI/dice independence, language switching and bots. |

The Node adapter executes shipped code and substitutes choice elements while omitting painting, layout and audio;
it does not reimplement rules. The runner shares Chrome/Chromium by default; `KUTHA_BROWSER` selects Firefox or WebKit
for both the runner and standalone checks. A WebKit run is not a test of the Safari application or a real phone.
`--engine=browser` or `KUTHA_ENGINE=browser` runs migrated
logic checks in the browser for diagnosis. Original quick/full sample counts remain intact.

Golden transcripts, forced captures and `test/fixtures/seasons.json` were recorded from the untouched original HTML.
Never rewrite them to pass a cleanup regression. `node test/golden.js dump --lang=ru --out=.local/transcript.json`
saves raw captures for diagnosis. Normal tests never write fixtures. `test/replay.js` reproduces a failing season code.

`test/lib/baselines.js` selects the current 29 fixture directories or the immutable original set. Golden/forced
commands accept `--baseline=original`; `KUTHA_BASELINE=original` selects it for seed/parity checks against a preserved
original artifact. Recording into the original set is refused. For an authorized behavioral release,
`node test/baselines.js --original=<preserved-28.html> --file=<candidate.html> --out=.local/review/differences.json --write`
first verifies all original fingerprints independently, then records the new set and reports first choice/die
differences and changed state fields. Inspect that report; a different hash alone is not an explanation.

## Pictures for the README

```sh
npm run pictures
node test/pictures.js --only=talk,tablet
```

The script replays fixed, ordinary player choices in `test/fixtures/pictures-29.0.0.json`, using Chrome and local fonts.
The original routes remain in `test/fixtures/pictures.json`; `--fixture=<path>` selects another preserved set.
It verifies each scene and expression, then photographs complete artwork, dialogue, decisions or notebook cards at
2× resolution. Crops omit the HUD and unrelated panels; the dawn image keeps one complete chapter, and the notebook
keeps two complete cards. Framing does not consume dice. Inspect every resulting PNG before using it. No roles,
outcomes or dialogue are fabricated for the images.

## Simulations and historical documents

`sim/balance.js` and `sim/tells.js` use Node by default; `--engine=browser` retains the browser path. Original sample
counts remain. The repaired policy RNG and observation-only policies intentionally invalidate historical balance
estimates; do not relabel old figures as current. `--pols=careful` uses visible evidence and condition words, including
rest and brandy. `sim/observer.js` compares the health-aware policy with its earlier version; `sim/nature.js` compares
delivered-sign reading with ignoring those signs through the actual finale. `sim/difficulty.js`, `sim/threat.js` and
`sim/influences.js` are paired experiments; none writes tuning back automatically. `sim/scan.js` scans visible play.

`sim/tells.js 2000 --seed=4242 --check` reports raw opportunities, season-clustered intervals and multiplicity-adjusted
decisions. Exit 1 is a supported out-of-band tell; exit 2 means insufficient evidence. The full runner explicitly uses
`--allow-insufficient` while still failing supported tells. An inconclusive rare row is not certified fair.

Conditional checks use `--scenarios=rare`, `--scenarios=history` or `--scenarios=defence-tactic`; natural follow-up uses
`--policy=public-inquiry`. They answer different questions and must retain their opportunity denominators.
The exact paired-Bernoulli method requires one independent focal observation per role per scenario, up to 1,000,000
trials and effective alpha at least 10⁻¹². Other observations retain season-clustered inference. See the
[rare-behavior report](docs/research/2026-11-01-rare-cult-behaviors.md) for declared seeds, sample counts and remaining gaps.
`sim/night-density.js` measures delivered morning material, including normal and busy nights; its paired method and
selected atmospheric budget are documented in the [night-pacing report](docs/research/2026-11-01-night-pacing.md).

`node tools/presentation-review.js` creates labelled art/music proposals and real-play layout captures under
`.local/review/`; see the [presentation review](docs/research/2026-11-01-presentation.md). It never modifies production assets.

`node tools/first-person-review.js` creates static composition comparisons. `node tools/viewpoint-preview.js` builds
two complete, isolated playable alternatives under `.local/preview/29-viewpoints/`; open its `index.html` to compare.
Both copies use the shipped `Viewpoint` renderer and share seeded gameplay, with separate storage namespaces.
The main game offers the same two views in the casebook, with third person as default. Comparison generation
is separate from the single production HTML build; no duplicate art implementation is kept in the tools.

## Local decision experiments

Build once, then run the shipped engine through a serialized host policy boundary:

```sh
node sim/decisions.js --mode=baseline --out=.local/review/baseline.json
node sim/decisions.js --mode=shadow --policy=sim/policies/example.json --against=.local/review/baseline.json --out=.local/review/shadow.json
node sim/decisions.js --mode=distilled --policy=sim/policies/example.json --against=.local/review/baseline.json --out=.local/review/trial.json
node sim/decisions.js --mode=replay --input=.local/review/trial.json --out=.local/review/replayed.json
node sim/framework.js --before=.local/review/29/rare-integrated.html --out=.local/review/framework-proof.json
```

The first four default to 12 expeditions for each of the ordinary and careful opponents; use `--seasons`, `--seed`
and `--opponents` for explicit disjoint batches. `--file` selects an artifact; comparisons/replay require matching
artifact and schema. The illustrative JSON tree is a validator example, not selected tuning or a trained policy.
Baseline records existing decisions, shadow rejects every proposal while checking exact unchanged play, distilled
mode applies validated proposals locally, and replay uses accepted records without another policy call. Output keeps
actor inputs separate from privileged evaluation, including observed rite completion instead of treating any death
as cult victory. Batches are bounded to 256 expeditions and 16 MiB compact records, with resource checks and explicit
incomplete failures. No experiment edits source or changes normal-game policy.

The [architecture guide](docs/architecture.md#experiments-learning-and-distilled-rules) documents the thirteen currently
audited contracts, feature types, strict response checks, unexported boundaries and per-actor memory requirement
for future stateful adapters. `sim/framework.js` compares a frozen independent artifact with current state, visible
scenes/SVG, choices, ordered dice/explanations and final streams over the 48 standard and 48 fresh expeditions.

The [release-27 mechanics snapshot](docs/research/2026-10-25-mechanics-27.md) retains the detailed historical tables;
the duplicate rulebook and obsolete plans/reviews have been removed. Current numbers live in `src/rules.js`, with
29 changes explained in [the current rules companion](docs/rules.md). Earlier [research](docs/research/README.md)
retains its measured artifacts and limitations; completed plans were consolidated into current rules, research and
the [future roadmap](docs/roadmap.md). Neural networks and learned actors remain deferred. Committing, pushing,
deployment and publication require an explicit request; the owner has authorized the checked 29.0.0 release.
