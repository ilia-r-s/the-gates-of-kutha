# Narrative continuity and actor knowledge, 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

This review preserves the established voice. It distinguishes reproduced defects
from fictional premises that still need an explicit, actor-specific justification.
A hidden-state read is not automatically wrong: the world must resolve what is
true, while an actor needs a route by which it could know or believe something.
The standing actor-point-of-view rule is stricter than the old implementation.

## Reproduced and fixed

1. **A dead companion also went for help.** In 3,000 fixed seasons on the preserved
   28.5.2 artifact, 13 player codas said that the companion left on the stair waited
   until noon and fetched help, while that companion's doom account said they died
   there. Seed 2310328743 named Yusuf, caught by the rising light halfway up;
   1883032546 named Zahrun, drowned on the stair; 1415717069 named Constance, who
   never came up before the crater was overflown. `game/fates.js::youCodas` ignored
   `doomFates` when adding `leftBelow`. The fix excludes companions whose existing
   doom result precludes their subsequent action. `test/narrative.js` failed first;
   80 seeds across all six natures and both languages now check the contradiction,
   surviving rescue codas, and unchanged game/prose dice.
2. **An expression reacted to thoughts nobody had expressed.** In
   `people/manner.js::ownLot`, the subject's distress read everyone else's private
   suspicion and dislike. On seeds 0, 1 and 3, with no public words, changing only
   other people's private suspicion changed Anselm/Ashby/Hamid from neutral to sad
   and their distress weight from 0 to 0.9. The fix reads distinct public occasions
   of accusation through `Suspicion.shown`; unsupported reverse-private dislike
   pressure and its three tuning fields were removed. Own grief and affection for
   nearby friends remain the subject's own experiences. `test/knowledge.js`
   counterfactually changes private suspicion and affinity across 48 seeds, checks
   invariant expressions, then verifies that actual public accusations can matter.
3. **The debrief inferred a private belief from a public act.** The reviewed
   `victimWhy` uses public accusations and votes, while the old line said someone
   had begun privately to suspect the target. English and Russian now say that the
   victim had spoken against the target (`TX.debrief.hadSpokenAgainst`). This states
   what the recorded event establishes, without treating a strategic or pressured
   vote as proof of belief.
4. **A simulated player knew the hidden solution.** The old human policy chose
   real cultists, the true patron and its ward. It is preserved only for immutable
   original fingerprints. Current human/observer policies have throwing-getter
   checks against hidden answers and language/dice-invariance checks; see the
   [verification report](2026-11-01-verification.md).
5. **A witness's allegation depended on the player's inaccessible guilt.**
   `deedKnown` used the secret `happened` flag when deciding whether someone who
   merely saw the player outside would accuse them. It now uses an eyewitness's
   recognition or a recorded public morning aftermath: a body, a visible injury,
   or the report of an approach to a guarded tent. Another person's violent death
   can also lead to a mistaken accusation after the player's aborted outing.
   Across 96 paired seeded cases, changing only the actual perpetrator preserves
   the allegation and dice; a sighting without discovered violence cannot turn
   into an explicit crime accusation. `deedCultHears` separately requires public
   testimony or a linked trace, with a recorded route; the unsupported unseen-deed
   shortcut was removed.
6. **Innocent speakers borrowed the cult's observation ledger.** The evidence-doubt
   channel used `cultReads` even for innocent speakers. `Knowledge.witnessAction`
   now records only present observers or the conversation participant, with a
   source, route, day, slot and place. `Knowledge.styles` requires repeated observed
   occasions before the speaker can identify a player habit. Tests block all role
   getters during observation and block `S.acts` during the actor's assessment;
   absent actors learn nothing and repeat assessment consumes no dice.
7. **A public accusation invented a firsthand sighting.** `blameAloud` chose
   “I saw … go out after dark” from temperament and one roll, without an observation.
   Night glimpses contain anonymous traits; their hidden `who` field does not tell
   the witness a name. The existing wording roll is retained, but firsthand wording
   now requires the speaker's own recorded outing with the named companion.
   Otherwise the existing “I do not trust …” judgment is used. The public record
   stores the claim type and its source/route/day/place. Across 288 actual accusations,
   changing an anonymous sighting's hidden identity cannot change the utterance;
   an actual shared outing can support it, without changing either dice count.
8. **Ordinary speakers delivered private cult countermeasures.** `wayTalk` selected
   a method from the cult ledger and then allowed any camp member to say it;
   `doubtTalk` could similarly give a private discredit plot to an innocent speaker.
   Both now use a common speech opportunity. A method allegation requires that
   speaker's repeated observations. A dream doubt requires a recent public dream;
   a private plot waits until the dream is public. Cult intent can bias only the
   eligible style/target by a bounded 1.35 multiplier. It cannot create a separate
   public speaking rate or an innocent mouthpiece. The style, observed contact,
   public dream and any coordinated plan retain their distinct source/time records.
   Four extra knowledge tests cover shared speech, sightings, 160 personal-style
   scenarios and 96 ordinary/coordinated dream scenarios.
9. **A targeted betrayal could disappear from the ending.** When a cultist targeted
   another cultist who was visiting the player, the guest-resolution path omitted
   the betrayal ledger used by the debrief. The shared `recordBetrayal` helper now
   records death, rescue by a Watcher, escape by luck and absence. The last has an
   explicit empty-tent explanation in both languages. Four branch tests preserve
   the exact pre-fix game/prose dice and verify the matching debrief. An incidental
   cult guest's death in an attack aimed at the player is distinct from a deliberate
   attack on that guest and is not mislabeled a targeted betrayal.

Two associated claims exceeded those sources: the scholar line claimed to have
heard curses read aloud at night, and the sleuth line asserted that a private
friend had gone out by night. Their English/Russian wording now describes repeated
tablet reading and observed conversations respectively. The latter uses two
distinct witnessed conversation occasions, not another character's private rapport.
The debrief describes those same allegations. These are objective knowledge fixes,
not a general rewrite of the voice.

The phrase “had never liked” was investigated rather than rewritten on intuition.
The 3,000-season scan did not find a displayed dislike reason for a pair that
started positively. This is not a proof over all states; there is no reproduced
continuity defect supporting a prose change yet.

## Actor cases and the remaining evidence gaps

| Decision and actor | Source and route actually represented | Timing, inference and limits |
| --- | --- | --- |
| Ordinary person names a suspect | Their own `S.sus` row and their own relationship preferences, `innocentBlames` | At the conversation/breakfast choice. Other roles are unnecessary; 32 seeded calls pass with all other roles replaced by throwing getters. This guards one decision, not all dialogue. |
| Watcher selects whom to guard | Own promise, own rapport, available people, `Watch.choose` | At the night assignment. Promise can fail; no target-role lookup is needed. 32 calls pass hidden-role guards. |
| Dreamer retells a dream | Stored `visions` entry, its subject, verdict and told flag | A later conversation retells the recorded belief, not newly inspected truth. 32 calls pass other-role guards. `dreamTonight` is the separate world-side generator: living, not-yet-dreamt subjects; seeded accuracy; smuggler confusion; possible veiling. These circumstances must remain explicit when the dream rules change. |
| Cult responds to danger | Public accusations; dreams actually public or recorded as overheard/later rumour | Five reviewed threat settings state why they use each source. Tests alter private belief while holding observed words fixed. A shared score was studied and rejected as unsupported by improvement; see the [paired study](2026-11-01-common-threat.md). |
| Claimed Dreamer defends an accused person | Their own fondness and vision/day allowance; a cultist also knows fellow members, the target's public danger and their own public dream/accusation record | The follow-up removes a private `S.sus` safety check. Changing other actors' unspoken suspicions leaves the tactical chance unchanged; public accusations can remove its bounded boost. A true seer still needs their own clear innocent vision. Conditional and actual-play fairness are measured separately in the [rare-behavior study](2026-11-01-rare-cult-behaviors.md). |
| A person tips off the player about the smuggler | `thiefKnownTo` requires that person's identifier in a night's `thiefSeen` record; `tipped` can misidentify | The source is a recorded sighting, not automatic access to the hidden role. The role read resolves which witnessed smuggler the record referred to. More explicit subject identifiers in that record would make this boundary easier to inspect. |
| Scholar interprets a charm or old title | The presented object's physical form/marks or the title spoken in conversation; `Knowledge.study` requires Anselm's epigraphic training, Ilse's Assyriology, or Zahrun's family tradition (titles only) | The physical inscription dictionary is fixed when the expedition is dealt. It is separate from current supernatural truth. `scholarRead` and `glossBy` retain their existing seeded misreading and deliberate-report probabilities; the source, credential, day and slot are recorded. Cult belief about the worshipped power comes from initiation. Private interpretation is stored separately from the report, so a lie does not become the speaker's belief. 320 reports pass with current patron/ward/title truth getters blocked; unqualified interpretations are rejected. This narrowly models these presented subjects, not general scholarly omniscience. |
| A betraying cultist chooses a charm to destroy | Remembered doctrine received at initiation, plus the physically carried charms | Each cultist's doctrinal ward can be wrong even with assured confidence. Selection consults that memory; only subsequent world resolution compares the stolen charm with the true ward. The debrief distinguishes a mistaken theft from an intentional feint. 160 paired trials change hidden ward truth while holding belief and circumstances fixed and preserve action/dice. |
| Gossip about temperament, bonds, attraction, or feelings toward the player | Cached fallible recollections of earlier work/meals, company/quarrels, outward attention, and the arrival greeting; later opinion hypotheses require a breakfast remark heard in person or a shared inquiry vote | Each impression records source, route and time. A private conversation or changing affinity no longer updates another person's knowledge immediately. New opinion hypotheses are inferred once and remembered; supporting a vote is evidence of an attitude, not proof of the voter's private feelings. 4,800 gossip decisions pass throwing-getter guards for others' temperament, rapport, affinity and attraction, covering all four gossip subjects. |
| A person doubts the player's investigative method | Their own cached observations of examining, questioning, studying/reading or searching/finding objects | Present observers notice physical activity with probability 0.65; nearby listeners hear conversational topics with probability 0.25; the participant recalls a topic with probability 0.99. These role-blind figures are fictional tuning parameters. Two distinct day/slot occasions establish a tentative habit; repeated questions within one conversation do not add occasions. No private answer, found clue's correctness, or cult-only rumour enters this assessment. |
| A person makes an older method allegation or casts doubt on a Dreamer | `Knowledge.styleBasis` and, when naming a contact, that speaker's witnessed conversations; a dream doubt cites the target's recent public dream | The ordinary speaker cannot read `S.acts`, `S.turned` or `S.plots` in the regression tests. Cult intent nudges a target among already justified alternatives, never the speaking opportunity. Default evidence-doubt styles remain the original three; the older method channel also recognizes personally witnessed pressing/confiding. |
| Nature signs and supernatural encounters | World nature determines noisy signs; descent rules resolve actual danger | World resolution may use hidden nature. Which signs a supernatural actor knows, and why, is a distinct decision-level question. The new signs are observations available to the player, not permission to expose exact hidden nature in choices. |
| Debrief and epilogue narrator | Completed expedition's actual roles, outcomes, dreams and fates | Post-ending truth is intentionally revealed. This permits truth reads but does not permit contradictions between two accounts of the same event. |

The ordinary-role guards cover 96 decisions in total; the additional cases above
guard the newly repaired paths. They do not certify all cult strategies or every supernatural encounter. Fresh
strong-player and coordination/timing studies remain necessary. A probabilistic
rule can still be an omniscient actor rule if it reads inaccessible truth before
randomizing its response.

## Source inventory and inspection boundary

The broad scan found 278 matching source lines across 34 files at this point in
development for `.role`, `.patron`, `.wardOf` and `.godOfWard` outside the tuning
file. Some matches are writes or public claim records rather than secret reads.
Each matched line was inspected and grouped below; the extra private-belief scan
found the expression defect above. This is a reproducible inspection inventory,
not a claim that every information route has been modeled or proved correct.
Subsequent changes alter these historical inventory counts.

A separate scan of every `cultReads`/`cultTurns` caller found the older method
channel above and `sceneTrace` applying cult adaptation even when no cult actor
could have swept the scene. The latter now uses the ordinary aftermath chance
when `actor` is absent, with a focused test that blocks the cult ledger. Remaining
callers are explicit cult choices: victim targeting, planting, verdict pressure,
lying low and the cult's rite. This caller review does not substitute for the
individual source and hearing rules used by `cultReads` itself.

This table records the pre-repair inspection snapshot rather than silently replacing
its counts after fixes. The new `people/knowledge.js` contains world-side initialization
reads which generate fallible prior memories, and actor-side accessors which retrieve
those records. At that checkpoint its five tuning probabilities lived in `RULES.knowledge`: temper 0.75,
bond 0.65, outward attraction 0.85, later opinion inference 0.8, doctrine 0.85. These
are fictional model parameters, not researched estimates of human accuracy. Setup
intentionally adds seeded draws in 29.0.0; neither stream is claimed identical to
28.5.2 after this authorized behavior change. Prior memories are static unless an
explicit later source updates the relevant belief. That conservatism can make gossip
outdated, but prevents unexplained live access to someone else's private state.

## Editorial decision

`data/endings#END_STYLE.confidant.win` says: “When it mattered, the people you had
trusted stood with you, and the ones you should not have trusted had long since
given themselves away.” The Russian makes the same unconditioned claim: “Когда
пришёл час, те, кому вы поверили, встали рядом с вами, а те, кому верить не следовало,
давно уже себя выдали.” Style selection measures conversation activity, not whether
the final companions supported the player or whether cult membership was revealed
early.

In 3,000 fixed post-knowledge seasons, 205 wins included 127 Confidant endings.
Seed 1401185385 (soldier) brought both cultists; Anselm was exposed below and Zahrun
turned at the sanctum, after which the player won by fire. Seed 169512216
(philologist) had confided in cultist Ashby and brought Ashby and Yusuf; Ashby held
back and the player won by fire. These establish that the paragraph is broader
than its selection condition supports, although “gave themselves away” can also
be read loosely as a retrospective judgment.

The owner approved the restrained replacement recorded as P01 in the
[editorial review](2026-11-01-editorial.md): “When it mattered, enough of
those conversations held. You would spend years wondering which of the others
had been sincere.” The corresponding Russian is applied too. The new paragraph
does not claim that every trusted companion supported the player or that every
cultist was recognized early.

The generic `FATE_LOVE.any` wedding paragraph, with its “only guest from Kutha”,
was unreachable: the only eligible player romances are Constance and Ilse, each
with a specific coda. The dead fallback and catalog entry were removed rather
than rewriting an impossible branch; a test checks every eligible character has
a specific coda.

`rg -n '\.role\b|\.patron\b|\.wardOf\b|\.godOfWard\b' src --glob '*.js' --glob '!rules.js'`

| File | Matching lines | Context inspected |
| --- | ---: | --- |
| data/endings.js | 10 | Resolved ending prose; actual final acts and outcomes. |
| game/below.js | 9 | World nature, encounter resolution, learned lines; supernatural source rules need case review. |
| game/day.js | 3 | Cult behavior and world omen generation. |
| game/debrief.js | 55 | Post-ending truth, claim-vs-role explanation, private/public dream routes. |
| game/deed.js | 3 | Witness circumstances, cult reporting/vote behavior. |
| game/endings.js | 10 | Ending selection, scoring and debrief. |
| game/fates.js | 26 | Epilogue truth and cross-coda consistency; reproduced fix above. |
| game/finale.js | 9 | Companions, betrayal and true success resolution. |
| game/inquiry.js | 9 | Post-verdict revelations and effects. |
| game/night.js | 20 | Role assignment to night tasks, dream generation, victim selection, outcomes. |
| game/record.js | 1 | Previously exposed cultist/recanted dream claim credibility. |
| game/state.js | 1 | Hidden-role query helper; callers require their own justification. |
| game/verdict.js | 4 | Own cult membership/partner knowledge and resolved past verdicts. |
| game/yourdreams.js | 4 | Probabilistic world-generated player dreams; separate from player decision knowledge. |
| people/alibis.js | 12 | Own role, generated movements, witnesses and claims. |
| people/claims.js | 20 | Public claim vs own role; dream records; cult partner knowledge. |
| people/cunning.js | 7 | Partner knowledge, known dream danger, betrayal; ward premise gap above. |
| people/dialog.js | 16 | Own-role behavior, witnessed thief, scholarship and actor-local suspicion. |
| people/gossip.js | 1 | Own-role bias; other hidden inputs found by the separate traits/ties scan. |
| people/influence.js | 2 | Cult actor's own/partner membership; own suspicion for bounded targeting. |
| people/moments.js | 2 | Resolved revelations and public reactions. |
| people/parts.js | 1 | Dispatch on actor's own role. |
| people/pretences.js | 13 | Own role vs maintained claim and recantation. |
| people/social.js | 3 | Own/partner membership, social targeting and role dispatch. |
| people/suspicion.js | 3 | Hearing-route assignment and public claim handling; private-grid fix reviewed separately. |
| people/thief.js | 3 | Smuggler's actual night movements and own witness record. |
| people/ties.js | 2 | Post-ending clean-friend/enemy aggregation. |
| people/visit.js | 2 | Guest's own role and world attack resolution. |
| ui/art-end.js | 1 | Already exposed cultists in ending illustration. |
| ui/book.js | 2 | Public claims, not actual hidden roles. |
| ui/cues.js | 1 | Cult visible in the revealed sanctum. |
| world/deaths.js | 3 | World-side manner-of-death generation. |
| world/nature.js | 1 | World-side noisy signs. |
| world/powers.js | 19 | Deal, puzzle truth, world facts; scholar knowledge premise gaps above. |
