# Research and implementation evidence

Read [the current rules](../rules.md) for behavior, [the architecture guide](../architecture.md)
for ownership and workflows, and [the roadmap](../roadmap.md) for future work.
Reports below name their measured artifacts and sample plans. Historical percentages
are not current tuning constants; those live in `src/rules.js`. A research proposal
is not permission to change gameplay.

## Social deduction, manipulation and justified knowledge

| Question | Research | Implementation and checks |
| --- | --- | --- |
| What makes hidden-role reasoning interesting? | [Other hidden-role games](2026-10-24-hidden-role-games.md), [manipulation techniques](2026-10-27-manipulation-techniques.md), [new primary research](2026-11-01-social-deduction.md) | `people/influence.js`, `cunning.js`, `moments.js`; `test/cult.js`, `sim/tells.js`. The cult's objective is the rite, and strategic skill is the long-term ideal source of difficulty; probability tuning remains valid. |
| What may an actor know? | [Narrative/knowledge audit](2026-11-01-narrative-knowledge.md), [four approved actor repairs and paired outcomes](2026-11-01-actor-decisions.md) | `people/knowledge.js`, `pretences.js`, `dialog.js`, `game/night.js`; `test/knowledge.js`, `actor-reports.js`, `slips.js`, `sim/actor-knowledge.js`. |
| Can rare manipulation become a single tell? | [Rare social histories](2026-11-01-rare-cult-behaviors.md), [statistical verification](2026-11-01-verification.md) | `sim/tells.js` natural and conditional families, `test/verification.js`. Keep opportunities, season clusters and insufficient evidence. |
| Can reactions to objects expose a hidden role? | [Bounded motives and fresh confirmation](2026-11-01-object-reactions.md) | `people/reactions.js`, `Knowledge.objectBeliefs`; `test/object-reactions.js`, actual-reply families in `sim/tells.js`. Distinguish local probability bounds from observed fairness. |
| Should threat judgments be merged? | [Common-threat experiment](2026-11-01-common-threat.md) | Five distinct questions retained in `Suspicion.threat`; `sim/threat.js`. A common interface must not erase meaningful differences. |

## Atmosphere, clues and presentation

| Question | Research | Implementation and checks |
| --- | --- | --- |
| Do signs help choose actions below? | [Difficulty and nature signs](2026-11-01-balance-nature.md) | `world/nature.js`, `game/below.js`; `test/nature.js`, `sim/nature.js`, `sim/difficulty.js`. Six traceable channels, fallible interpretation; overall win benefit remains unestablished. |
| How can nights feel less crowded? | [Quieter nights](2026-11-01-night-pacing.md) | `NIGHT_ATMOSPHERE` in `game/tenor.js`; `test/night-pacing.js`, `sim/night-density.js`. Primary clues and required consequences remain. |
| Which prose changes preserve the voice? | [Bilingual editorial decisions](2026-11-01-editorial.md) | Keyed catalogs, `tools/text-review.js`; `test/narrative.js`, `expressions.js`, bilingual forced/golden captures. Includes approved before/after examples. |
| How are art, music and interface validated? | [Presentation and persistence](2026-11-01-presentation.md) | `ui/viewpoint.js`, `session.js`, `book.js`; `test/viewpoint.js`, `usability.js`, `pictures.js`; reproducible local art/audio tools. |

## Engineering, experiments and release evidence

| Question | Research | Implementation and checks |
| --- | --- | --- |
| Can shared decisions preserve the existing game? | [Uniform decision migration](2026-11-01-uniform-decisions.md) | `core/decisions.js`; `sim/framework.js`, `test/decisions.js`. Independent 96-expedition exact proof before separately authorized gameplay changes. |
| What is implemented for future learning? | [Migration/experiment contracts](2026-11-01-uniform-decisions.md), [future roadmap](../roadmap.md) | `sim/decisions.js`, typed tree adapter and accepted-result replay; `test/decision-policy.js`. No model/training in shipped gameplay. |
| How does the Mac remain responsive? | [Native macOS workflow](2026-11-01-macos-workflow.md) | `tools/resources.js`, `test/run.js`; `test/resources.js`. Adaptive admission, combined memory budgets and clean incomplete failures. |
| What passed, and what remains uncertain? | [29.0.0 validation](2026-11-01-validation.md) | Full suite, original-fixture preservation, current release fixtures, actual browser checks and artifact-specific measurements. |

## Historical mechanics

[The release-27 mechanics record](2026-10-25-mechanics-27.md) retains the detailed
old tables and design explanations. The duplicate old rulebook and completed
plans/reviews were removed after their useful evidence was consolidated here.
Earlier social-deduction reports retain their original citations and versions;
this index links their current implementation instead of rewriting old findings
as if they described today's build.

For focused inspection, search headings before reading a large report:

```sh
rg -n '^#{1,3} ' docs/research/2026-10-27-manipulation-techniques.md
node tools/show.js --find influence
node tools/show.js Knowledge.pressure
```

Store raw reports, sound exports and generated previews under ignored `.local/`.
Keep durable methods, artifact identities, limitations and reproduction commands
in these topic reports, without duplicating whole catalogs or simulation output.
