# Current rules companion — 29.1.0

This describes 29.1.0's systems and
their knowledge boundaries. The complete tuning table is `src/rules.js`, browsable
with `node tools/show.js RULES.night.target`, for example. The older
[mechanics record](research/2026-10-25-mechanics-27.md) remains a historical snapshot;
its percentages and removed setting names are not current specifications.
Measured play is reported separately from configured probabilities.

See the [local validation record](research/2026-11-01-validation.md) for release checks
and the [balance/sign study](research/2026-11-01-balance-nature.md) for measured play.

## What remains fundamental

Five days, the seven-person camp, hidden roles, uncertain dreams, evening
inquiries, the descent and the established endings remain the structure.
Probabilities use the seeded game stream; wording has its own seeded stream.
Presentation and audio use neither. Chances still respect the 1–99% bounds,
with zero reserved for impossible events and the existing documented structural
exceptions. Meters and probabilities are not shown as numbers during play.

Both languages work throughout; Russian does not assign the player a sex.
The established relationships, Anselm's vows, SVG style and palette remain.

The inherited structural exceptions to stochastic outcomes remain explicit:
the calendar and legal actions; arithmetic, limits and descriptive condition
bands; fixed truth after dealing; unit trust/suspicion changes; a successful
inquiry's revealed verdict and already witnessed unmasking; no voluntary cult
confession; cast identities/relationships; and presentation that uses separate
stable randomness. They do not grant a character knowledge of hidden truth.
The cult seeks successful rite completion, not elimination of everyone; a murder
is useful primarily when it advances that objective.
The notebook hides secondary information behind an overlay while illustration,
story and choices occupy the main screen. Urgent condition words remain visible.

## Whose information a decision can use

Every actor needs a source, route and time for information or a plausible
hypothesis. World resolution can use the hidden truth to decide what happens;
an actor cannot acquire that truth merely because its decision is randomized.
Confidence, including religious faith or confidence in a dream, is not accuracy.
See the [knowledge audit](research/2026-11-01-narrative-knowledge.md) for inspected
cases, counterfactual tests and limits of coverage.

`Knowledge` records fallible earlier-camp impressions of temperament, bonds and
outward attraction. Later opinions require a witnessed remark or inquiry vote.
Scholars interpret presented titles/marks through established credentials and
retain their interpretation separately from a possible deliberate misreport.
Cult initiation supplies fallible ward and nature doctrines. Stealing a charm
follows the remembered ward belief; object reactions may reflect either belief.
World resolution determines whether the object really was the ward.

Player actions can create actor-specific memories only for people present or
participating. A second observed occasion is needed before evidence-doubt prose
attributes an investigative style. A private belief change cannot silently
update another person's knowledge. Public allegations may be mistaken: seeing
the player between tents and seeing a morning aftermath can support suspicion,
but the witness never checks whether the player secretly caused the harm.

## The five cult threat decisions

| Decision | Evidence and reason |
| --- | --- |
| `closingIn` | Public non-dream accusations and distinct guilty dreams that reached the cult. Frame somebody who advanced a case; do not count one dream twice. |
| `harm` | Distinct known guilty dreams. This chooses a response to recurring claimed insight; ordinary accusers remain eligible in victim weights. |
| `watched` | Public accusations/votes by somebody other than the protective speaker. A protective story needs a visible case, not private suspicion. |
| `suspects` | The same public opposition used by victim weights. The ending can name what the victim said, without inventing their private thoughts. |
| `weight` | Distinct public occasions of opposition, capped at the suspicion scale. Add graded danger while retaining other possible victims. |

The [common-score study](research/2026-11-01-common-threat.md) tested replacing
these with one measure on separate fitting and fresh seeds. It showed no outcome
benefit, so the reviewed five remain. Unification for its own sake is not a
reason to discard their distinct purposes.

## Discreet influence

`CampInfluence` uses the existing public speech, suspicion, relationship and
journal systems. Innocents and cultists share speaking opportunities. Role can
nudge an eligible target's weight by at most `influence.aim` (0.35); it does not
make a particular person speak or create an impossible alternative.

- A second voice repeats an actual recent public accusation and can move
  listeners through the ordinary `Moments.blame` rules.
- Doubts about evidence respond to that speaker's observed investigative style,
  never to whether the evidence is secretly true. A recent doubt discounts the
  presented case by `influence.doubtCase` (0.15), regardless of its target.
- A friend may spend influence on one inquiry per expedition. Other people
  respond through their own affinity for the speaker. Support can be sincere,
  misguided or strategic.
- Each actor may plant one item. Natural stray objects and thief traces retain
  the same visible channel; a plant cannot create a second corroborating item.
- A listener who joined a wrong public vote may later name an actual earlier
  source. Memory can be mistaken, but alternatives must have spoken before voting
  began. The recorded speech boundary excludes simultaneous co-votes and later statements.
- A known outspoken dreamer whose reported dreams do not threaten the cult may
  be spared a little more often. This reads reported dreams, not the true role.

Older style allegations and dream doubts follow the same principle. Speakers
need their own repeated observations or a public dream. Cult plans may nudge a
known target/style by 0.35, but do not create an extra speaking opportunity or
put private cult knowledge into an ordinary person's mouth. A named firsthand
accusation requires the speaker's own recorded shared outing; otherwise the
line expresses distrust rather than an invented observation.

A claimed Dreamer can defend a publicly accused person only through the same
fondness requirement for either faction. A genuine seer additionally needs their
own clear, unveiled innocent vision; a pretender must still have a dream available
that day. All eligible defenders use the same temperament-adjusted base chance.
A cult defender can increase that chance by at most `claims.defendAim` (0.35)
when a fellow cultist faces a public threat and the defender has already spoken
about dreams publicly without being publicly compromised. The decision uses
public accusations and dream reports, never other actors' private suspicions.
Competition among eligible claimants still needs measured fairness checks;
the local probability bound alone does not establish the resulting rate ratio.

Shared opportunities and bounded weights are design constraints, not proofs of
fairness after survival and target selection. `sim/tells.js` measures individual
acts, targets, listeners, pairs, temperaments and timing; insufficient rare
samples are reported as such.

## Reactions to a shown object

Fear and greed begin with shared temperament odds. Small non-stacking motives may
reflect a cult initiate's remembered god, fallible ward/nature doctrine and visible
object associations; a Dreamer's own troubling vision; a smuggler's trade or remembered
night sighting; or the person's own trust and recently delivered luck. No actor
consults the player's private signs or the true hidden nature to choose a reaction.
Greed resolves first and fear only if greed fails. The common multiplier budget is
at most 1.25; all values and associations live in `RULES.objectReaction`.

Initiation nature doctrine has 0.65 accuracy and adds two to four setup draws.
Local bounds cover the raw reaction, while displayed expressions need separate
measurement. The [reaction study](research/2026-11-01-object-reactions.md) records
the repaired tells, the fresh 20,000-expedition results and the remaining
inconclusive comparisons. An expression is evidence to combine with other evidence,
not a certificate of someone's role.

## Pressure without a direct retaliation tell

The original separate hostility/alarm branches made an attack after confiding
or pressing more than three times as likely when the interlocutor was a cultist
in the measured sample. They are replaced by one shared player-target lottery.
Its base is 0.08 plus 0.012 per elapsed day (`RULES.night.target`); observed investigation and
alarm can multiply the common rate only within explicit bounds. Hostility and
alarm do not stack. False-watch commitments still reduce that chance.

Observed-style adaptation uses `adapt.gain = 0.75`. The two settings were tested
together against the reviewed 0.06/0.01 target rate and 0.5 adaptation gain, using
paired health-aware players and then a fresh seed set. This is a modest pressure
increase, not a claim that maximizing attacks makes the cult more intelligent.

Alarms retain who learned what, from a direct conversation, public inquiry or
reported deed evidence. The cult may react, but one predictable retaliation
must not reveal the interlocutor's part. This requirement takes priority over
raising raw attack counts.

The cult's objective is completion of the rite. Violence, deception and alliances
are means toward that objective, with exposure and lost cooperation as costs.
Keeping an innocent useful or declining an attack can be strategically preferable;
a higher death count does not by itself establish a better opponent.

## Signs of the power's wishes

The same `NatureSigns` system supplies omens, dreams, tablet fragments, traces
near deaths, ordinary luck linked to temperament, and signs after player acts.
Delivered observations are journaled with day, channel and subject. They never
read the subject's cult membership. The power's true nature enters world-side
sign generation, not an NPC's unexplained knowledge.

For a given way, a favorable image has configured probability 0.65 when favored,
0.35 when disfavored, and 0.50 when neutral. These are noisy fictional signs,
not claims that salt, dreams or faith reliably reveal truth. At this bound,
mixing temperaments alone cannot make favorable/unfavorable luck a likelihood
ratio above 0.65/0.35; actual delivered-opportunity tells are also measured.

All fourteen ways are represented. Luck and action signs are narrative events;
they do not add a second hidden health cost. The existing encounter rules still
resolve the consequences below. The debrief states the true favored/disfavored
ways. `sim/nature.js` reports per-way observations, mistakes, ties and neutral
cases, plus actual descent outcomes against the same observer ignoring signs.
Pressing/confiding use the last supported question in the current conversation,
with one sign opportunity on leaving, not an extra opportunity for every question.
An ideal scripted reader does not establish that humans find every metaphor
clear. The owner selected a [bilingual readability pass](research/2026-11-01-editorial.md)
that simplifies sign framing without changing the clues or their reliability.

## Quieter nights

Additional morning omens and nature images share a separate atmospheric count,
using the shared diminishing crowd formula with a decay of `TENOR.nightCrowd`
(0.18 per delivered passage or burden unit). Investigation keeps its existing
0.45 decay, or 0.75 for the favoured strand. The primary dawn clue keeps its
original opportunity and then spends one unit; already delivered night events
and grief add a burden before optional extras are considered. Only delivered
passages spend further units. The secondary news multiplier is `TENOR.second`
(0.1). The ordinary chance bounds still apply: doubles remain possible, with no
hard cap. An omen within a world event remains part of that event.

Finds, character testimony and ordinary social opportunities retain their separate
budget. Deaths, physical traces, guest/deed consequences and urgent rite warnings
are still shown. The owner selected lower chances with rare doubles on 2 November.
In matched 1,024-expedition samples, multiple outdoor omen/nature passages fell
from 689/3,389 displayed mornings to 216/3,417; double news fell from 88 to 36.
See the [current review](research/2026-11-02-text-and-pacing.md) for definitions,
other policies and limits, and the [earlier pacing report](research/2026-11-01-night-pacing.md)
for the separate initial change and rejected prototypes.

## Resuming and reproducibility

One current expedition is saved locally after completed actions. A validated
command journal restores closures, both dice streams and the exact scene/state;
the expedition's five-track playlist and requested track are saved with it.
Playback restarts that track after audio becomes available; its playback position
is not saved. A same-edition save without music data receives a valid playlist on first
restore. Language is preserved independently. Incompatible or corrupt saves fail visibly.
A stale tab cannot overwrite a newer expedition. A deliberate new expedition
is available in the notebook. No save synchronization or server is involved.

29.0.0 deliberately changed setup and gameplay dice order, including new
knowledge/sign/influence decisions and removal of the old discarded face roll.
29.1.0 separately reduces atmospheric/news probabilities. A season code is reproducible
within this edition; it does not promise the same expedition as 29.0.0 or 28.5.2.
The existing save-version guard rejects a 29.0.0 command journal with a visible explanation.
Published original and 29.0.0 fixtures stay intact; reviewed 29.1.0 expectations are separate.
The editorial/music preservation proof is independent of the pacing comparison; the
follow-up chronology fixes preserve the selected actions, non-text state and both streams
in all 48 regression seasons. See the [release review](research/2026-11-02-text-and-pacing.md).

Neural networks and learned actors are explicitly deferred. The owner-authorized
uniform framework now names 58 decisions and shares action/resolution/effect
contracts. Its initial migration preserved the selected rules, output and both
seeded streams exactly. Thirteen audited observations support isolated local policy
experiments; normal play uses the authored rules. After exact migration, the owner separately approved
four actor-information repairs: slips, abandoning a pretence, and bringing or
keeping dreams. These use received pressure, known claims/losses and justified
ritual expectations, not the investigator's private ledger or exact hidden rite
progress. The [paired study](research/2026-11-01-actor-decisions.md) reports their
effects and uncertainty separately from migration preservation.
See the [migration evidence](research/2026-11-01-uniform-decisions.md) and
[architecture guide](architecture.md). Art and music alternatives remain labelled
proposals unless the owner selects them; the frightened expression is approved.

## Presentation choices

The casebook offers third person (default) and first person at any time, preserving
the original right-hand character staging. The selected viewpoint is local and
does not affect gameplay, dialogue, either die or the current expedition. Full-height
activity figures are not included. The original Bayati arrangement remains selected.

Reply faces follow the current utterance and owned circumstances rather than a
cached greeting. A friend may decline a confidence cautiously, but that refusal
does not receive an angry face or call the player a stranger. The acceptance and
trust rules are unchanged. A grave line is not forced to look cheerful by trust.

Wound and nerve descriptions use continuous bands, including fractional grazes.
Serious wounds need attention; only grave wounds receive the grave warning.
Damage/healing arithmetic is unchanged. Season-code information stays hidden in
the title, notebook and ending until the secret dot on the title is pressed.
A URL can select a season without revealing its code or replay controls.
