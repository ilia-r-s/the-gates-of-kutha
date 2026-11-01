# Actor-known pressure and beliefs

1 November 2026. This is the separately approved gameplay pass after the exact
[uniform-framework migration](2026-11-01-uniform-decisions.md). The owner selected
actor-known pressure and beliefs for the four previously preserved information
paths. It is not part of the migration's exact-behavior claim.

## Rules and information routes

`dialog.slip`, `pretence.drop`, `night.dream.bring` and `night.dream.keep` now use
the actor's own circumstances and received information. `Knowledge` owns pure
queries; public announcements record their audience and source when delivered.
Private claims, hidden investigation strength and exact rite progress are not
substituted for an actor's belief.

- Slips use received accusations, a presented inquiry, the actor's own previous
  questioning and witnessed/received reports of other questioning. Membership is
  remembered from initiation, reduced by known losses or witnessed removal.
- Abandoning a pretence uses known contradictions, personally delivered public
  claims and the actor's own failed watch. It cannot read the investigator's
  private case ledger or another character's currently private claim.
- Bringing or keeping a dream uses the actor's own trust, promises, earlier
  reports, known losses/attacks and received pressure. Announced deaths become
  known at their actual announcement, not merely because the night record exists.
- A cultist's ritual expectation uses a remembered doctrine/calendar. Other
  actors infer danger from announced losses and their own troubling unveiled
  visions. Changing exact hidden rite progress alone cannot change those beliefs.

Confidence can be wrong. These sources justify a decision input; they do not
make the input correct, confer shared private knowledge, or guarantee an action.
The actor registry has no remaining `legacy` definitions. There are 44 actor and
12 world definitions, with eleven audited policy observations; unexported actor
code still requires review before being offered to experiments.

## Counterfactual and preservation checks

`test/actor-reports.js` and `test/slips.js` vary inaccessible facts, audience,
delivery time, own memories, public pressure and known membership independently.
They check both invariance to unavailable truth and sensitivity to legitimate
new evidence. Pure queries cannot settle hearing or consume either die.

Three subsequent cleanups project known public words onto their actual actor
fields, remove a redundant role check from possessed visions, and remove the
unused morning victim argument. Across 96 complete expeditions, the cleanup
preserves state, output, 8,162 scene SVGs, 130,650 traced draws/explanations and
both final streams. Instrumented times 2.825 versus 2.820 seconds are effectively
unchanged. Report: `.local/review/29/knowledge-cleanup/equivalence-96.json`.

## Paired outcome study

`sim/actor-knowledge.js` compares the frozen framework artifact `ac89fecf…`
with the actor-only artifact `d7810e06…`. Six thousand pairs (12,000 actual
expeditions) use four policies, 1,500 fresh seeds each from seed 667819, across
all backgrounds. Sixteen instrumentation checks preserve complete fingerprints
before measurement. One 512 MiB Node worker checks resource admission between
bounded batches of 24; no samples are dropped.

The predeclared primary family has eight comparisons: victory and observed doom
for each policy. Conservative simultaneous paired risk-difference intervals use
exact binomial bounds on discordant gains and losses. Even zero discordance
retains uncertainty.

| Policy | Wins before → after | Difference, percentage points | Simultaneous interval |
| --- | ---: | ---: | ---: |
| Ordinary | 78 → 77 | −0.067 | −1.019 to 0.888 |
| Careful | 402 → 407 | 0.333 | −1.395 to 2.056 |
| Inquisitor | 75 → 77 | 0.133 | −0.776 to 1.037 |
| Confidant | 104 → 109 | 0.333 | −0.841 to 1.498 |

Observed doom counts are respectively 300→302, 651→635, 265→262 and 361→365;
their simultaneous intervals also include zero. This does not establish unchanged
outcomes or improved strength. It rules out neither small harms nor small gains.

Descriptive event totals: slips 114→98, brought dreams 775→801, public dreams
766→788 and public confessions 1,513→1,583. These are exploratory counts, not
additional independently confirmed primary findings. Full report and compact
paired rows are in `.local/review/29/actor-knowledge/paired-6000.json` and
`paired-6000-rows.json` (4,999,709 bytes).

Later conversation, prose and condition-display fixes are separate. In particular,
correcting fractional condition words can change a careful observer's choice even
though damage math is unchanged. Do not relabel these artifact-specific totals
as final-build win rates. Current code and sources are linked from
[the architecture guide](../architecture.md).
