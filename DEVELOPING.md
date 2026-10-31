# Developing The Gates of Kutha

Development starts from the single-commit **28.5.2 baseline** on `main`. The source was recovered from **28.5.1**,
first reproducing the preserved HTML byte for byte. Subsequent authorized
cleanup preserves behavior and seeded replays while allowing different HTML bytes. [The recovery record](docs/recovery.md)
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
npx playwright install chromium
```

Tests create isolated browser profiles and contexts. Normal tests block web fonts; screenshots serve pinned font
packages locally. `npm run clean` removes generated HTML, test screenshots and `_site`, keeping the local SDK and dependencies.

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
one GitHub workflow: build, run the full suite once, package and deploy Pages on `main` or manual dispatch. There are
no separate test workflows or automatic release/tag jobs. `node tools/site.js <base-url> _site` packages a local Pages
preview without deploying it; it adds site metadata and copies the one image that metadata uses.

## Reading and architecture

Read one declaration or text entry with `tools/show.js`. `--find fragment` searches symbol names and text keys without
printing their values; `--list` lists modules. `Namespace.method` finds private implementations inside shared systems.
A catalog path or `TX` namespace alone lists keys; `--all` explicitly prints the contents. Unique text keys also work
without a namespace. Avoid loading whole catalogs, built pages or long transcripts into an assistant's context.

`src/modules.json` sets the order of 64 modules sharing one script scope. Acorn checks declarations, including
destructuring, and rejects duplicate globals. The combined script is syntax-checked after text expansion. Terser
removes statically dead expressions and unused locals, and shortens local bindings while retaining global and function
names. Algebraic evaluation is disabled to preserve arithmetic and dice behavior. A content-keyed cache avoids
repeating minification within a build process; unchanged output files are left alone.

| Area | Responsibilities |
| --- | --- |
| `core/random.js`, `odds.js` | Game dice, independent prose dice, replay codes, traces and probability steps. |
| `core/text.js`, `catalog.js` | Bilingual tokens, grammar and text-factory initialization. |
| `rules.js` | Current tuning constants. |
| `data/`, `i18n/`, `world/` | Tables, translations, powers, signs, charms, tablets and deaths. |
| `game/state.js`, `record.js` | Dealing/state; evidence, testimony, traces and case strength. |
| `people/ties.js`, `suspicion.js` | Relationships, grief, hounding, suspicion and knowledge. |
| `people/moments.js`, `gossip.js` | Public reactions and private words travelling through camp. |
| `people/watch.js`, `parts.js` | Watch promises and role-specific claims, answers and strategies. |
| Other `people/` modules | Claims, pretences, visits, flirtation, faces, craft, alibis and dialogue. |
| Other `game/` modules | Days, inquiries, nights, dreams, hazards, descent and endings. |
| `ui/`, `page/` | Screens, casebook, SVG, audio, styles and the complete document template. |
| `text/` | Keyed prose, labels, translations and templates, read at build time. |

[AGENTS.md](AGENTS.md) contains the standing design rules and explicit requirements for aggressive refactoring,
shared gameplay foundations, execution efficiency and economical context use. Keep related mechanics on those shared
systems. `tools/audit.js` finds unused facade exports, passages and catalog entries, accounting for test consumers and
conservatively retaining dynamic access. Inspect callers before deleting anything; preserve both seeded streams.

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

The runner builds once, shares one browser server, and isolates contexts per browser check. Independent child
processes are bounded by CPU and free memory (at most eight by default); `JOBS` overrides this. Children use the
current `process.execPath`. Checks print timings and short failure reports; `--timings` also reports browser startup
and shutdown. Use targeted checks while editing, and the full suite before handoff after runtime or dependency changes.

On the development Mac with Node 26.13.0, Chrome 156 and eight workers, the full suite passed in **23.78 seconds**;
the source suite passed in **2.46 seconds**. These are local measurements, not CI timing guarantees.

| Checks | Coverage |
| --- | --- |
| `build.js` | Deterministic source-only output, text edits/missing keys, lexical expansion and global collisions. |
| `engine.js` | Prose dice, private knowledge, veiled dreams, Watcher retractions and all simulation policies. |
| `seeds.js` | 48 full seasons compared to immutable original-release fingerprints. |
| `lint.js`, `tools/audit.js` | Shared scope, rule keys, unused exports and orphan text. |
| `claims.js`, `social.js`, `gods.js`, `dooms.js` | Actual shipped script in Node, with retained sample counts/assertions. |
| `parity.js` | Chrome and Node independently compared to the original 48 seasons: choices, state, both dice streams and every traced game die. |
| `golden.js` | Original seeds and capture steps in both languages; full-field SHA-256 including SVG. |
| `forced.js` | Rare branches captured in both languages, plus leak scans. |
| `site.js` | Complete Pages document, metadata and minimal packaged files. |
| Other browser checks | Layout, ending art, seeded fuzzing, UI/dice independence, language switching and bots. |

The Node adapter executes shipped code and substitutes choice elements while omitting painting, layout and audio;
it does not reimplement rules. Browser checks stay in Chrome. `--engine=browser` or `KUTHA_ENGINE=browser` runs migrated
logic checks in the browser for diagnosis. Original quick/full sample counts remain intact.

Golden transcripts, forced captures and `test/fixtures/seasons.json` were recorded from the untouched original HTML.
Never rewrite them to pass a cleanup regression. `node test/golden.js dump --lang=ru --out=.local/transcript.json`
saves raw captures for diagnosis. Normal tests never write fixtures. `test/replay.js` reproduces a failing season code.

## Pictures for the README

```sh
npm run pictures
node test/pictures.js --only=talk,tablet
```

The script replays fixed, ordinary player choices in `test/fixtures/pictures.json`, using Chrome and local fonts.
It verifies each scene and expression, then photographs complete artwork, dialogue, decisions or notebook cards at
2× resolution. Crops omit the HUD and unrelated panels; the dawn image keeps one complete chapter, and the notebook
keeps two complete cards. Framing does not consume dice. Inspect every resulting PNG before using it. No roles,
outcomes or dialogue are fabricated for the images.

## Simulations and historical documents

`sim/balance.js` and `sim/tells.js` use Node by default; `--engine=browser` retains the browser path. Seeds, policies
and sample counts are unchanged. `sim/scan.js` scans the visible game in a browser. These scripts measure rather than
tune: do not alter rules to match historical percentages.

`RULES.md` and `docs/rulebook.md` are marked historical release-27 snapshots. Current numbers live in `src/rules.js`.
[Research](docs/research/README.md) and the [29.0.0 plan](docs/plans/README.md) are archived unchanged; the plan's gameplay
proposals remain deferred. Committing, pushing, deployment and publication require an explicit request.
