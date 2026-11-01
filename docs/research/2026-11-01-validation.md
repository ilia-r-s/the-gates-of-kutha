# 29.0.0 validation and measurement limits

1 November 2026. This record distinguishes exact-preservation work from approved
gameplay changes. The owner authorized release through the existing Pages workflow
after the final review and full checks. Original release fixtures are immutable;
29.0.0 fixtures are separate and their deliberate differences must be reviewed.

## Independent preservation checkpoints

| Work | Independent comparison | Evidence |
| --- | --- | --- |
| Recovery/maintenance | Original 48-season fingerprints, original bilingual golden/forced captures | [Recovery](../recovery.md); `test/fixtures/recovery.json` and original fixtures. |
| Uniform decisions | Frozen `bdc94645…`→`ac89fecf…`, 96 expeditions, 8,168 scenes, 130,684 traced draws; full state/output/SVG/choices/both streams exact | [Migration study](2026-11-01-uniform-decisions.md), `sim/framework.js`. |
| Knowledge query cleanup | 96 expeditions, 8,162 scenes, 130,650 draws/explanations; exact complete fingerprints | `.local/review/29/knowledge-cleanup/equivalence-96.json`. |
| Knowledge-read locality cleanup | `db61e986…`→`9a03cab5…`; same 96-case full preservation; guarded ordinary-actor role reads fail before and pass after | `role-locality-equivalence96.json` alongside the preceding report. |
| Default third-person path | `319212fd…`→`069b8da9…`, 48 expeditions, 4,230 scenes, 66,178 draws; exact SVG and full fingerprints | `test/viewpoint.js` plus local viewpoint comparison. Both continuous first person and repeated toggles preserve all 48 state/dice cases. |
| Final comment cleanup | `38a7c21b…`→`42344e38…`, 96 expeditions, 8,166 scenes, 130,932 draws; complete fingerprints, explanations and SVG exact | `.local/review/29/final-comment-equivalence.json`. This checkpoint differs from the fresh reaction study only by comments. |
| Viewpoint control repair | `42344e38…`→`d1731d80…`; the same 96 expeditions, 8,166 scenes and 130,932 draws remain exact | `release/viewpoint-label-equivalence.json` under the same local evidence directory. The bilingual button uses the existing shared label renderer; 138 control-layout measurements pass. |

The framework's summed instrumented expedition times are 2.726 s before and 2.717 s
after, excluding VM setup. A single sample does not establish a speedup. HTML grew
15,023 bytes (1.16%); sampled RSS was 299.4 MiB. The gain is one inspected/validated
resolution path and typed delegation, without normal-play policy serialization.
Later query cleanup times 2.825 s and 2.820 s are effectively unchanged.

The full framework checkpoint passed 38 steps twice: 72.87 s at three workers and
69.70 s at five. All 145 memory-pressure observations were normal; minimum available
memory was 17.16 and 15.91 GiB respectively. This fixed-order comparison is preliminary,
not a general throughput claim. The native Mac runner now uses an adaptive ceiling
of five, combined memory budgets and explicit incomplete failures. See
[the Mac workflow](2026-11-01-macos-workflow.md).

## Experiments, not strategic claims

The initial decision-loop validation completed 24 expeditions in each mode.
Shadow evaluation made 94 proposals and accepted none, retaining 24 exact baseline
fingerprints. The illustrative declarative policy accepted 96 proposals; replay
reproduced its inputs, records and complete fingerprints without querying a policy.
Two additional expeditions replayed 169 overridden player choices. These prove
infrastructure behavior, not policy superiority. Actual models/training remain
in the [future roadmap](../roadmap.md).

The four actor-knowledge repairs were then approved separately. Their 6,000-pair
study found no primary victory/doom interval excluding zero; that is not proof of
no effect. Artifact identities, all counts and uncertainty are in
[the actor-decision report](2026-11-01-actor-decisions.md).

Quieter-night, nature-reader and difficulty estimates retain the artifacts on
which they were measured. See [night pacing](2026-11-01-night-pacing.md),
[balance/nature](2026-11-01-balance-nature.md) and
[rare social histories](2026-11-01-rare-cult-behaviors.md). Conditional tactical
success does not establish natural-history frequency or experienced-human skill.

## The additional conversation audit

The new actual-reply family observes returned portrait expressions after real
`askOf` calls: eight topics × four predeclared categories. Positive includes
smile/warm/coy/smirk/wink/arch/demure/sultry; threatened is sad/fear; hostile is
angry/cold; neutral is neutral/thoughtful/surprised/glance. Denominators are actual
answered topics, not selected hidden branches or matched trust. Season clusters
and simultaneous intervals remain. A category result does not certify every
individual expression inside that category.

The first 20,000-expedition confirmation on `319212fd…`, seed 1052263, completed
283,543 actual replies and correctly failed: 70 comparisons inside, 2 outside,
28 insufficient, plus 2 descriptive sequence rows. Object-related threatened
expressions had LR 3.511, simultaneous interval 2.900–4.250. Distrust replies had
LR 0.405, interval 0.344–0.477. Existing families had no supported outside row.
This is a discovered defect, not a result to omit from the record.

Branch inspection found a large cult-only fear split in both spoken object
reactions and portraits. The distrust effect principally came from eyewitness
replies always rendered as fear through the old uneasy alias. Those reports now
use the same probabilistic recounting palette as other accounts. The owner
selected small, bounded object-specific biases grounded in the cultist's doctrine,
character and known signs, with distinct justified Dreamer/smuggler motivations.
The failed study remains `.local/review/29/final-fairness/tells-20000.json`.
The [repair and independent confirmation](2026-11-01-object-reactions.md) used
artifact `38a7c21b…`, seed 1483139 and 20,000 complete expeditions, with 282,995
actual replies: 73 checked rows inside the band, none supported outside and 27
insufficient, plus two descriptive sequence rows. Both previously supported
violations are now inside. Strict checking correctly exits 2 for the unresolved
comparisons; this is not universal fairness certification. The final comment cleanup
and subsequent control-width repair have the exact-preservation evidence above.

## Browser and presentation evidence

On artifact `9a03cab5…`, all 12 real-input usability tests pass in Chrome
156.0.8078.80 (14.36 s), using an isolated shared server. They cover language,
keyboard/modal focus, exact action-journal resume, both viewpoints, storage denial,
quota/stale tabs, 320 px layout and no-JavaScript behavior. Linked season codes stay
hidden in title/casebook/ending until the secret control is pressed. This run is
saved as `.local/review/29/viewpoint-ui-final.txt`.

The complete 12-test suite also passed on `38a7c21b…` in Firefox 157.0 (19.94 s)
and WebKit 27.2 (16.21 s), including viewpoint persistence and unavailable-font
layout in both languages. The latter check found and fixed an unwrappable audio
gesture label at 320 px before these successful runs. No tests were skipped.
After the final viewpoint-label repair, both engines also passed all 138
control-layout measurements and the affected keyboard/viewpoint and bilingual
narrow-screen tests, including unavailable fonts and the no-JavaScript fallback.
WebKit is not the Safari application, viewport emulation is not a physical phone,
and these checks do not constitute screen-reader certification. Browser launches
never use the known-crashing macOS sandbox path. No normal browser profile or
system crash-reporting setting is changed.

[Presentation evidence](2026-11-01-presentation.md) retains the measured 95.4%
reduction in translation string retention, art/music decisions and reproduction
commands. The README is recaptured from genuine final-build play in default
third person, with complete scene choices, a normal night and one gate companion.

## Release verification

The release document is **1,324,178 bytes**, SHA-256
`d1731d8001990090994853d1f79b59a9595f7af3bffc0c6710fdb84fff79735f`.
Its frozen local copy is `.local/review/29/release/final.html`.

- **43 full-suite steps including the build passed in 56.76 s**, with a peak of
  three guarded workers. This includes the complete Chrome usability suite,
  Node/Chrome parity, bilingual golden and forced captures, larger bots, seeded
  fuzzing, puzzle soundness and simulation, dice checks, actor knowledge, policy
  contracts, pacing, resource-failure handling, source/text audits, lint and format.
  Log: `.local/review/29/release/full-suite-release.log`. This is a single run, not a
  controlled speed comparison with earlier builds.
- The first final run caught language-dependent movement beside the new viewpoint
  button. Moving its label into the existing bilingual `CHROME`/`twin` path fixed
  it, removed the redundant private catalog and added the button to the layout
  test. The subsequent full suite is the successful run reported above.
- The original 48 fingerprints were reverified against the preserved artifact.
  The separate 29 fixture retains all 48 cases. Every bilingual golden seed still
  has 170 captures: eight seeds per language, all 11 captured fields. Every one of
  the original 411 forced scenario tags remains in each language; 189 rows are
  unchanged and 222 intentionally differ. No original fixture was overwritten.
  The earlier 29 checkpoint's 413 rows included two additional iterations of a
  variable late-descent route; this final route reaches gate seven sooner, with
  the loop bound and explicit encounter cases unchanged.
- All forced difference snippets and season summaries received an independent
  review. Differences follow authorized setup/actor/world draws, public speech,
  pacing, corrected continuity, selected prose and the new interface. First game
  differences start at the newly added knowledge acquisition; downstream endings
  need not match 28.5.2. The complete comparison is
  `.local/review/29/release/baseline-differences-final.json`.
- That review found an inherited coverage defect: a scenario labelled
  `visit-both-dead` could redirect the attack to another tent. The current-only
  forced setup now disables that redirection for explicitly requested player
  targets and asserts the agreed visit, exact outcome, both survival states and
  death/exposure results. All 11 routes pass in both languages; removing the
  setup fix makes the new assertions fail. The original branch still matches all
  411 original captures per language. No gameplay rule was changed for this repair.
- Final local policy checks completed 24 expeditions in each of baseline, shadow,
  declarative-policy and replay modes. Shadow made 93 proposals, accepted none and
  preserved all 24 baseline fingerprints. The illustrative policy accepted 93;
  replay reproduced every record and fingerprint. This validates infrastructure,
  not strategic superiority, and adds no learned behavior to normal play.
- All six README images were recaptured from genuine final-build choices and
  visually inspected. Routes live in `test/fixtures/pictures-29.0.0.json`: a
  complete first night with one omen, the actual casebook modal, default third
  person and Yusuf alone at the first gate. No prose, choices, roles or outcomes
  were fabricated for those images.
- The documentation/comment audit removed obsolete instructions and duplicated
  headers, consolidated useful research, and retained the future-learning roadmap.
  The unreferenced `social-shot.js` helper was removed: maintained notebook tools
  cover its purpose, and its old capture path targeted a closed overlay.
  All local links across the 27 Markdown files resolve. The dependency audit
  reports zero known vulnerabilities in the final lockfile; raw results remain
  `.local/review/29/npm-audit-final.json`.

Publication uses the existing [Pages workflow](../../.github/workflows/publish.yml),
which runs the full suite again before packaging and deployment. Its public run
history is available in [GitHub Actions](https://github.com/ilia-r-s/the-gates-of-kutha/actions/workflows/publish.yml).
The packaged page adds site metadata, so its byte hash differs from the standalone
game above. Earlier research figures remain tied to their named artifacts.
