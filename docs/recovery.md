# Recovery of build 28.5.1

Recovered on 31 October 2026 from `The Gates of Kutha.html`. `status.md` supplied context only. The 29.0.0 gameplay
proposals were deferred. The checkout contained 27.1.3 source; a read-only Git audit found no unreachable commits.
This work reconstructs editable source and tooling, not lost history or commit metadata.

On 1 November 2026, the owner established **28.5.2** as a new baseline: one root commit on `main`, with the old
branches removed. The previous Git refs and release downloads were archived in Git-ignored `.local/backups/`
before the history rewrite. Historical notes below describe the recovery that preceded this baseline.

## Byte-identical milestone

The first recovered build matched the preserved HTML byte for byte:

```text
bytes:  1282595
SHA256: f723036d8e357b63a5456e04256f5efeba548bdf22e2df4095b07621c28fc11a
```

`test/fixtures/recovery.json` retains that historical fingerprint. The builder used editable modules, text catalogs
and the recovered document shell; it did not extract or copy an opaque script from the reference during normal builds.

The owner subsequently authorized cleanup that changes output bytes while preserving behavior and seeded replays.
The original input and status snapshots were then removed at the owner's request. The only current output is
**`The Gates of Kutha.html`**, generated and ignored by Git. It uses a native document template, conservative dead-code
removal and local variable mangling. Duplicate fragment/standalone outputs and the obsolete host wrapper are gone.
The current output is therefore not claimed to match the historical fingerprint above.

## Reconstruction

The shipped JavaScript retained identifiers and syntax. Declarations were matched to surviving modules and newer
shared systems separated into files. At the recovery milestone, 64 modules retained initialization/execution order,
rules, RNG streams, scenes, translations, SVG and audio. That cleanup removed unused interfaces without introducing
gameplay changes; the later authorized 29.0.0 changes have separate evidence.

The recovered prose, translation tables, labels and text expressions occupied 51 keyed JSON catalogs under `src/text/`,
expanded at their original expression positions during build. Formatting and module descriptions were restored. Original comments
and exact historical file boundaries cannot be recovered from a build that stripped comments. Missing tests and
narrative documentation are not claimed to be restored verbatim; surviving checks were adapted and critical contracts tested.

## Independent baselines

English/Russian golden and forced baselines were captured directly from the untouched original HTML, then checked
against the rebuilt game. The old 27.1.3 recordings were replaced because they describe different behavior. Golden
fields store SHA-256 digests of full captures, including SVG, reducing two compressed fixtures from about 7.2 MB to
360 KB while checking the same bytes and seeds. Raw captures remain available through `golden.js dump`.

Before runtime cleanup, 48 complete seasons were also captured from the original HTML in `test/fixtures/seasons.json`.
They cover all backgrounds, both languages and casebook modes, zero/max seeds, choice histories, final state, both
seeded streams and every traced game die. Node and Chrome independently compare against those fixed fingerprints.
These baselines must not be regenerated to make cleanup pass.

State-heavy checks and simulations execute actual shipped code in Node. Chrome retains layout, art, interactions,
seeded fuzzing and language checks. One shared browser and bounded workers reduce startup/memory costs. Existing
sample counts remain intact. Source-only build, text expansion, audit and Pages packaging have focused checks.
See [DEVELOPING.md](../DEVELOPING.md) for commands.

The development runtime is local Node 26.13.0 in ignored `.local/node/`; browser checks use installed Chrome
156.0.8078.80. Dependencies and caches are project-local. Nothing was installed system-wide.

## Historical documents

The [release-27 mechanics record](research/2026-10-25-mechanics-27.md) preserves the detailed historical rules. Current constants are in
`src/rules.js`; old simulation percentages are not fresh measurements of 28.5.1. Recreating missing narrative
documents or publication-scale balance studies is separate from reconstructing game bytes.

The original social-deduction and manipulation reports remain under [research/](research/README.md), alongside
new implementation studies. Completed plans, old reviews and the duplicate historical rulebook were removed at
the owner's request after useful evidence was consolidated. Long-term learning proposals live in the
[roadmap](roadmap.md). Research is context, not authorization to implement new rules.
