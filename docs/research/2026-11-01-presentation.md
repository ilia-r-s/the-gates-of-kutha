# Presentation, persistence and browser review

1 November 2026. The owner approved the
notebook overlay and the distinct frightened expression. After comparing the
exports, the owner chose the original Bayati arrangement. The other art and underground-music studies below remain
proposals; they are not part of the shipped game. Both third-person and first-person
views are now selected, with third person as default and a persistent casebook
toggle. The full-height activity experiment was rejected and its implementation
removed. The browser results below identify earlier checkpoints; the final
release checks are in [the validation record](2026-11-01-validation.md).

## Implemented and checked

The main view now gives the illustration, story and choices the available width.
Choices form two columns on a wide desktop and one on a phone. Map, people,
evidence, omens, kit and settings are in a notebook overlay. Serious condition
warnings remain in the scene. Settings sit above long notebook content, and the
close control remains visible while the notebook scrolls.

The overlay initially focuses its heading, contains Tab movement, closes with
Escape and restores focus to its opener. Map travel closes it and focuses the new
choices. Number shortcuts cannot choose a scene behind the overlay. Tabs use
roving focus, arrow wrapping, Home/End and a labelled panel. These follow the
[W3C modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and
[tabs patterns](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

WebKit testing exposed a macOS distinction: native buttons without an explicit
tab index can be skipped by ordinary Tab under the default keyboard setting.
Normal buttons now have `tabindex="0"`; notebook tabs retain their intentional
roving values. Apple's [Safari keyboard documentation](https://support.apple.com/en-bn/guide/safari/cpsh003/mac)
describes the system setting and Option-Tab behavior.

Season codes accept one to eight hexadecimal digits or exactly `FFFF-FFFF`, with
outer whitespace and letter case ignored. Invalid characters are not discarded,
and long values are not silently truncated. Typed and linked values remain
visible, with English/Russian validation feedback and a labelled reveal control.

One current expedition resumes from its seed, starting options and validated
command journal. Replaying the same choice/map/notebook/drink commands recreates
scene closures and shared state references; both dice streams and a state/scene
checkpoint must match. Rendering and audio are suppressed during replay. Language
is stored independently. Corrupt, incompatible, blocked or full storage produces
a usable title or current game with a localized explanation. A stale tab cannot
overwrite a newer save. A deliberate restart is available in the notebook, with
the safer “keep” choice initially focused.

Saving happens after completed actions, not just on page exit. The last reliable
lifecycle opportunity can be the transition to hidden, while storage access can
throw and persistence for `file:` URLs is not standardized. See
[visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)
and [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
The local-file tests pass in the engines below; that is not a guarantee for every
browser configuration, private session or file relocation.

## Evidence

| Check | Result |
| --- | --- |
| Real keyboard/pointer, modal, reload/continuation, storage failures, local fonts and no-JS | 10/10 in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2 |
| Browser suite wall time, three engines run concurrently | Chrome 11.17 s; Firefox 15.63 s; WebKit 11.98 s |
| Node parsing/cache/replay/music tests | 4/4; 12 complete expeditions across two seeds, three backgrounds and both modes; all eight track schedules |
| Notebook/topbar layout | 132 measurements, zero problems |
| Random bilingual UI play through the notebook overlay | 30 games × 140 steps; 238 language-button switches, all four tabs and 218 changed marks; zero problems |
| Original rules plus final presentation/resume/cache changes | All 48 original season fingerprints unchanged, including both dice streams |
| Source/catalog audit | No unused exports, passages, text or vague catalog keys |

The browser tests cover widths 320, 390, 820 and 1280 in both languages. They are
desktop engine tests with viewport emulation, not real phone or screen-reader
certification. Firefox uses `CFFIXED_USER_HOME` inside `.local/browser-state/` to
avoid the macOS application-data problem recorded in
[Playwright issue 42768](https://github.com/microsoft/playwright/issues/42768).
No real Firefox profile or OS privacy setting is modified.

The randomized language test now opens the notebook before using its controls,
reads the visible dialog and labels, and closes it before choosing a scene.
Reading `innerText` from the closed dialog in Chrome had included both hidden
language copies. A direct [visibility probe](../../.local/review/rubot-visibility-proof.json)
and [Russian notebook screenshot](../../.local/review/rubot-ru-notebook.png)
confirm the displayed notebook is translated; only its intentional “English”
language-switch control is English. The test checks rectangles and computed
visibility instead of reporting hidden content as a player-facing leak.

An independent integration review completed 64/64 expeditions and restored ten
checkpoints at the first newly encountered nature, influence or removal state.
It covered all six nature channels (luck 74, action 114, death 42, omen 91,
tablet 21, dream 13), influence steer/second/doubt, and taken/exposed characters,
with no replay errors or active removed speakers. This sample did not exercise
influence recall or dismissal. Reading the actual callers also found two nature
issues: press/confide were hidden behind the generic talk action, and one action
line described tent canvas at outdoor locations. Both were fixed and have
focused route coverage. The independent results are recorded in
[integration-replay-review.json](../../.local/review/integration-replay-review.json).

The final social-suite investigation distinguished incidental guest deaths from
intentional cult betrayals. Incidental deaths already have a visit/attack record
and matching debrief text. An intentional betrayal aimed at a guest had skipped
the betrayal ledger; the shared recorder now retains death, watch, luck and
empty-tent outcomes. The last has its own bilingual debrief line. All production
ledger readers are in the debrief, so this changes attribution rather than game
decisions. Thirteen forced branches compared with the preserved pre-fix build
retain identical game/prose dice, night text and state apart from the four newly
recorded guest-betrayal outcomes. The focused narrative regression also checks
the four pre-fix dice pairs and correct saved/dead attribution. See
[guest-betrayal-comparison.json](../../.local/review/29/guest-betrayal-comparison.json).

The translation cache now drops generated season text when starting a new game
or returning to the title. Static translations remain; missing-translation
diagnostics deliberately survive so later tests cannot hide earlier failures.
Across the same 200 original-rule expeditions and original test policy:

| Retained data | Original | With cleanup |
| --- | ---: | ---: |
| Translation/disambiguation entries after season 200 | 15,308 / 101 | 1,067 / 2 |
| String code units after season 200 | 3,007,643 | 138,211 |
| String code units after returning to title | 3,007,643 | 92,632 |

These count retained keys and values, not total JavaScript heap. The reduction
after season 200 is about 95.4%. Full logs are in the local files listed below.

## Visual and music decisions

| Source | Finding | Review proposal |
| --- | --- | --- |
| `src/ui/art.js`, `sceneSVG` | Night shading is applied before the cast, leaving figures in daylight color. | Art A tests a small cool tint on a portrait. Assess skin tone and eye readability; a production treatment would also need the player's figure considered. |
| `src/ui/art.js`, `BG.gate` | Regular nested arches have little foreground depth. | Art B adds low broken stone without adding symbols or clues. |
| `src/page/style.css`, `.scene-art` and illustration aspect ratio | On a 390 px screen the wide image is roughly 150 px high, limiting subtle facial detail. | Consider selective portrait framing only after reviewing which scene information it would hide. No cropping experiment is shipped. |
| `src/ui/audio.js`, `TRACKS.bayati` | The regular plucked phrases can compete with slow reading; this is a listening judgment, not a measured defect. | **Original selected after listening.** Music A tested a 0.52 s step with two-second phrase spaces. The owner preferred the original 0.44 s continuous arrangement, which is restored; both exports remain available. |
| `src/ui/audio.js`, `TRACKS.deep` | The regular repeated low pulse may become predictable. | Music B uses an uneven four-pulse pattern, retaining the drone, flute and bell. |

The approved fear change is confined to upper/lower eyelid definition and a tense
mouth with visible teeth. It preserves the head, costume, palette and linework,
and consumes no dice. The original comparison remains at
[fear-comparison.png](../../.local/review/fear-comparison.png).

Music previews use the actual synthesis code with a fixed presentation seed and
common gain, rendered as stereo WAVs through
[OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext).
The renderer checks for clipping and unchanged game/prose dice. These checks do
not substitute for the owner's listening judgment. Bayati's original timing is
restored in the live scheduler; the unused phrase-gap machinery is removed from
production. The spacious experiment now lives only in the review renderer. A Node
test checks the original timing across phrase boundaries, uninterrupted melody
steps and unchanged timing of all other tracks.

The requested 90-second export contains all eight production tracks, with Bayati
as `bayati-old.wav` (selected original) and `bayati-new.wav` (unselected spacious
experiment), plus `deep-experiment.wav` labelled as an
unshipped proposal. Each file is stereo 44.1 kHz/16-bit PCM. All ten WAV headers,
sizes and durations pass validation; peaks range from 0.099 to 0.229 with the
common gain of 2, no clipping or browser errors, and unchanged game/prose dice.
The set totals 158,760,440 bytes. `git check-ignore` confirms the output is ignored.

## Reproduction and local artifacts

The tracked [presentation renderer](../../tools/presentation-review.js) writes
only to the requested review directory. It captures genuine seed `0000-1092`
play for layout and labels the constructed art/music comparisons as studies.

```sh
.local/node/bin/node tools/presentation-review.js
.local/node/bin/node tools/presentation-review.js --only=art,music --out=.local/review
.local/node/bin/node tools/presentation-review.js --only=music --all-tracks --music-seconds=90 --out=.local/music/29.0.0
.local/node/bin/node test/usability-engine.js
.local/node/bin/node test/usability.js
PLAYWRIGHT_BROWSERS_PATH="$PWD/.local/browsers" KUTHA_BROWSER=firefox .local/node/bin/node test/usability.js
PLAYWRIGHT_BROWSERS_PATH="$PWD/.local/browsers" KUTHA_BROWSER=webkit .local/node/bin/node test/usability.js
.local/node/bin/node test/topbar.js
```

- [Art comparison](../../.local/review/art-studies.png) and [HTML](../../.local/review/art-studies.html).
- [Music players](../../.local/review/music-previews.html), [render measurements](../../.local/review/music-previews.json).
- [All 90-second tracks, including old/new Bayati](../../.local/music/29.0.0/index.html) and [export manifest](../../.local/music/29.0.0/manifest.json).
- [English desktop scene](../../.local/review/29-scene-en-desktop.png) and [Russian phone notebook](../../.local/review/29-notebook-ru-mobile.png); all eight language/view combinations are alongside them.
- [Renderer manifest](../../.local/review/presentation-review.json).
- Browser logs: `.local/review/usability-{chrome,firefox,webkit}-final.log`; Node: `.local/review/usability-engine-final.log`.
- Cache measurement: `.local/review/cache-comparison-final.json`; original-rules preservation: `.local/review/usability-baseline-final.log`.

Local artifacts are ignored output and must be regenerated in a fresh checkout.
The scripts and this decision record are the durable review material.

The six README images were recaptured from genuine 29.0.0 play and inspected at
full size. Current routes are in `test/fixtures/pictures-29.0.0.json`; the original
`pictures.json` remains untouched. The capture command defaults to current routes:

```sh
.local/node/bin/node test/pictures.js --out=.local/review/pictures-final
.local/node/bin/node test/pictures.js --fixture=test/fixtures/pictures.json --file=path/to/original-build.html --out=.local/review/original-pictures
```

The final routes and expected companions/expressions live in the versioned
fixture, rather than a second route list here. Current captures use the default
third-person view, complete scenes with choices, and the actual notebook modal.
No night prose is removed to make a busy night appear quieter. The first-gate
route brings only Yusuf. The script asserts that framing consumes neither die
and that season codes remain hidden. The release capture hash and inspection
results belong in [the validation record](2026-11-01-validation.md).
