# Bilingual prose and continuity review

All eleven proposals below were selected by the owner and applied for 29.0.0. The owner's direction
is to preserve the present voice and distinguish inconsistencies from taste.
Q01 has an actual-play counterexample; Q09 repairs an incorrect Russian verb. The remaining changes are selected editorial choices, not runtime defects. This carries forward the earlier
P04/P05 review of prophetic narration and nature-sign readability.

Read a source entry with `node tools/show.js <catalog>#<key>`. English and Russian
are considered independently. Placeholders below are the catalog's exact template
expressions, not suggested player-facing text. English/Russian production catalogs now contain the selected wording. The Q03 Russian frame uses «возле» with the existing genitive name form.

## Coverage and method

The catalog inventory covers all current text files. `node tools/text-review.js`
reports its counts; `--out=.local/review/editorial.json` writes exact keyed
candidates for focused inspection. The first pass covered 54 catalogs, 7,959
string leaves including 357 code templates, and about 560,000 characters.
Those are source leaves, not counts of rendered sentences or unique passages.
Automatic certainty/gender flags require interpretation: a lying character's
claim is not a factual assertion by the narrator. Ten possible Russian player
gender matches in the initial scan were inspected and were contextual false
positives, not ten defects.

Manual reading sampled the introduction, character voices, claims, social
reactions, descent encounters, success/failure endings, personal epilogues and
new nature/influence passages. Runtime checks additionally cover both languages,
forced rare scenes, seeded seasons and cross-character outcome combinations.
The visual review uses genuine seeded play and the existing SVG system. The
review distinguishes observed defects, hypotheses requiring reproduction and
editorial choices; it does not turn taste into a test failure.

## Objective issues and their treatment

| ID | Finding | Evidence / treatment |
| --- | --- | --- |
| E01 | Introductory prose guaranteed that friends hear about every act by morning. | `ui/intro#passages.theyArePeopleToo` now says “may hear”; Russian likewise uses «могут узнать». This matches fallible information routes. |
| E02 | A victim-choice debrief asserted a private suspicion when the rule now knows only a public accusation. | `game/debrief#passages.hadBegunToSuspect` now describes speaking against someone. Belief and outward conduct remain distinct. |
| E03 | One ending could make a companion fetch help after their own epilogue killed them on the stair. | Reproduced in 13 of 3,000 original-baseline seasons; seeds 2310328743 and 1883032546 are examples. Rescue codas now exclude doom-lost companions; all six doom natures and both languages have a regression. |
| E04 | A person's troubled face reacted to other people's unspoken suspicions and private dislike. | `ownLot` now uses public statements and the subject's own grief/affinities. Private-state counterfactual checks cover the boundary. |
| E05 | Current fear and surprise were almost the same face. | The owner approved the side-by-side candidate with tense lower lids and a braced mouth. The approved SVG change is included; character shapes and palette remain. |
| E06 | The permanent HUD competed with the illustration, story and choices. | At the owner's request, map, conditions, people, evidence, omens, kit and settings move into an accessible notebook overlay. Urgent condition prose remains in the scene. |
| E07 | Long desktop choice lists pushed most actions far below the illustration. | Two columns on wide screens; one column on phones. Keyboard order follows document order. |
| E08 | A seed-code typo silently produced another valid expedition. | Strict shared parsing plus visible bilingual feedback. The seed control has an accessible name. |
| E09 | Map selection lost keyboard focus, and casebook tabs lacked the expected keyboard/ARIA relationships. | Stable focus, roving tabs, panel labels, actual keyboard/pointer tests and modal return focus. |
| E10 | Reload erased the expedition and selected language. | One automatic local expedition with action replay, both dice streams and state/scene verification. Corruption, storage denial and stale tabs receive feedback. |
| E11 | A resume-only design removed the ordinary way to start over. | The notebook now offers a deliberate new-expedition action with an in-game discard confirmation. |
| E12 | Numeric hazard costs were stored with translated prose; 89 top-level text/textN keys obscured their meaning. | Costs moved to `RULES`; catalog keys are semantic and the audit rejects vague keys. Narrative values were preserved except the separately listed corrections. |
| E13 | Historical rule documents could be mistaken for current mechanics. | Preserve them as snapshots and point to current 29.0.0 rules, measured results and source constants. |
| E14 | Cult retaliation after confiding or pressing was a strong single tell. | A 2,000-season measurement gave attack rate ratios above three. A shared bounded targeting rule replaces separate direct-retaliation branches; timing rows retain fatal nights and uncertainty. |
| E15 | Gossip, ward theft and evidence doubts could read information unavailable to the actor. | Fallible memories, witnessed-action records, presented inscriptions and cult doctrine now separate belief from truth. See the actor-by-actor knowledge audit. |
| E16 | One planting attempt could create two corroborating planted items. | Reproduced at seed 41 in the 100-season regression; each actor is now limited to one item. |
| E17 | A wrong-vote recollection could blame someone who spoke only after the vote. | The remembered-source alternatives are restricted to statements available by the vote, with a counterexample regression. |
| E18 | Deed testimony depended on the secret success of the player's attempt. | The witness now infers from a sighting and public aftermath; another cause can produce a false accusation. Unseen private guilt alone produces no report. |
| E19 | Honest-temperament cultists were conspicuously quiet. | A 20,000-season run found LR 0.254 for public speech, with an adjusted interval wholly below 0.5. The reproduced cause, a second cult-only framing filter after the common speaker selection, is removed. |
| E20 | Ordinary camp commentary could select topics and a supposed friend using the cult's information and private rapport. | Speaker-specific witnessed activities and observed contacts replace those paths. Dreams must be public before a cult plot can nudge their discussion; speaking opportunities are shared and preferences bounded. |
| E21 | A supernatural/no-actor aftermath used the cult's investigative adaptation when deciding whether a trace was swept. | Only an actual cult actor can use that modifier. A regression that rejects access to cult information fails on the old call and passes after the fix. |
| E22 | Pressing and confiding were configured to produce nature signs, but the conversation action never reached either branch. | The last supported approach in the current conversation gets one opportunity on leaving. Actual seeded choice routes cover both, while preserving the conversation's harm classification. |
| E23 | An action sign described tent canvas at the canal. | Reproduced by the first canal search at seed 8. The shared English/Russian passage now describes heat and breathing, without assuming a particular location. |
| E24 | An intentional betrayal of a cult guest could disappear from the ending's explanation. | The tent-visit route bypassed the betrayal ledger. A shared recorder now covers death, protection, luck and an empty tent; the last has its own bilingual explanation. Thirteen before/after branches preserve both dice, night prose and all other state. Incidental guest deaths remain distinct from deliberate betrayal. |
| E25 | A recalled source could be a simultaneous co-voter who never spoke before voting began. | The same-day cutoff admitted votes added after the decision. Each inquiry now records the preceding public-speech boundary; recall uses that prefix. A real-vote regression fails on the earlier build and passes after the repair. |
| E26 | A cult Dreamer could defend a fellow cultist without the fondness required of an innocent defender, and assess safety using other actors' private suspicions. | The pre-repair conditional study found a rate ratio of 6.49 after natural quarrel selection. Both factions now require fondness and a common base; the bounded cult preference requires an earlier public dream and public safety. Fresh confirmation finds no supported departure; the actual-quarrel aggregate is 1.181 (0.675–2.064), still narrowly inconclusive. All four conditional tactical comparisons are inside the band. See the rare-behavior report for natural-play gaps. |
| E27 | Independent omen paths piled several supernatural images beside attacks, deaths and grief, including in the README image. | A separate atmospheric budget retains the primary deduction clue and required consequences. Three-or-more-omen mornings fell from 28.74% to 2.35% in 2,000 expeditions; a rejected prototype had starved clues. The README now shows a complete quieter seeded night with one omen. |


## Q01 — A Scholar win can claim knowledge the player demonstrably lacked

Source: `data/endings#END_STYLE.scholar.win`.

**Original EN:** “You beat it with grammar. Long nights over the tablets, the lamp
turned low, the sign list propped against the inkpot: in the end you knew its name
and its nature better than the people who served it.”

**Original RU:** «Вы одолели его грамматикой. Долгие ночи над табличками,
привёрнутая лампа, список знаков, прислонённый к чернильнице, — в конце концов вы
знали его имя и природу лучше тех, кто ему служил».

**Proposed EN:** “Long nights over the tablets, the lamp turned low, the sign list
propped against the inkpot. You came out of Kutha alive. Some of those lines still
need translating.”

**Proposed RU:** «Долгие ночи над табличками, привёрнутая лампа, список знаков у
чернильницы. Из Куты удалось вернуться. Некоторые строки ещё предстоит перевести».

**Reason and evidence:** The Scholar classification measures an approach to the
expedition; it does not guarantee correct identification or a linguistic victory.
In the frozen `bdc94645…` artifact, genuine routes at seed **774553871**, background
1, win by burning after naming Kingu against Namtar. Seed **4225124915**, background
2, wins scarred after naming Pazuzu against Ereshkigal. The final offered choice
was followed through to the ending in **both languages**, and both display the
original Scholar claim. The alternative preserves the lamp/sign-list image and
leaves the actual winning action to the preceding ending paragraph.

The bounded diagnostic played 256 scholar-policy expeditions, found ten wins and
eight Scholar wins; this is a counterexample search, not a prevalence estimate.
Routes are in `.local/review/29/editorial-scholar-check.json`; rendered confirmation
is in `editorial-scholar-rendered.json`. Recheck the routes after intentional rule
changes. An alternative decision is to retain the original only for an explicitly
qualified outcome, with the proposed paragraph as the general Scholar ending.

## Q02 — Let the salt image remain an interpretation

Source: `world/nature#omen`.

**Original EN:** `At first light a patch of salt on the ground looks like a little scene. ${en} A passing shadow breaks it up.`

**Original RU:** `На рассвете пятно соли на земле складывается в маленькую сцену. ${rus} Проходящая тень разрушает её.`

**Proposed EN:** `At first light, you make out shapes in a patch of salt. ${en} A shadow passes; you cannot find the shapes again.`

**Proposed RU:** `На рассвете в пятне соли проступают очертания. ${rus} Проходит тень — и снова различить их уже не удаётся.`

**Reason:** “A little scene” makes the outdoor channel sound like a neatly staged
miniature, while Russian “разрушает” suggests the shadow physically destroys it.
This version keeps the same clue sentence but puts its fleeting interpretation
in the observer's experience. It does not change the sign's reliability or add a
new draw. Tablets and dreams can remain more legible.

## Q03 — Remove a layer of explanation from the dust image

Source: `world/nature#death`.

**Original EN:** `In the disturbed dust near ${person.short} there is a shape you cannot help reading as a picture. ${en}`

**Original RU:** `Во взрытой пыли возле ${ru.c(person, "g")} видна фигура, в которой невольно читается картинка. ${rus}`

**Proposed EN:** `In the disturbed dust beside ${person.short}, you seem to make out this: ${en}`

**Proposed RU:** `В потревоженной пыли возле ${ru.c(person, "g")} будто проступает вот что: ${rus}`

**Reason:** The current frame explains a shape, its interpretation and a picture
before the image itself begins. Russian «взрытая пыль» is especially heavy. The
shorter frame preserves uncertainty and proximity to the victim; it does not
claim that someone deliberately drew the picture or identify a culprit.

## Q04 — Keep the ordinary details without promising universal good luck

Source: the positive conditional clause in `world/nature#luck`. The named person's
preceding action and the negative alternative would remain unchanged.

**Original EN clause:** “For once, everything that follows goes easily: a sound
rope, a steady flame, a cup without grit.”

**Original RU clause:** «И дальше всё ладится: верёвка крепка, огонь ровен, в чашке
нет песка».

**Proposed EN clause:** “The rope holds, the flame burns steadily, and there is no
grit in the cup.”

**Proposed RU clause:** «Верёвка держит, пламя не дрожит, на дне чашки нет песка».

**Reason:** The three practical details belong to the camp's voice. “Everything
that follows” can sound like a promise about later play; the proposed sentence
reports only the illustrated small successes. This is a scope edit, not a new
luck mechanic or another reduction in clue frequency.

## Q05 — The judges' word can haunt the present instead of guaranteeing a lifetime

Source: `game/below#passages.oneOfThemSpeaks` (earlier P04).

**Original EN:** “One of them speaks a single word as you pass. You do not know
the word. You will hear it for the rest of your life.”

**Original RU:** «Когда вы проходите, один из них произносит единственное слово.
Вы не знаете этого слова. Вы будете слышать его до конца жизни».

**Proposed EN:** “One of them speaks a single word as you pass. You do not know
the word. It goes on sounding after the mouth is shut.”

**Proposed RU:** «Когда вы проходите, один из них произносит единственное слово.
Вы не знаете этого слова. Рот уже закрылся, а слово всё ещё звучит».

**Reason:** A prophetic narrator is an intentional possible style, not a bug.
The player may nevertheless die shortly afterward. The alternative keeps a
specific uncanny effect without inviting an expectation of a long later life.
Retaining the original is reasonable if prophecy is the chosen narrative voice.

## Q06 — Bring the cradle's button consequence into the current scene

Source: `game/below#passages.youLayAButton2` (earlier P04).

**Original EN:** “You lay a button from your coat in the cradle. In the morning,
if there is a morning, you will find it sewn back on, and you will not sleep for
a week.”

**Original RU:** «Вы кладёте в колыбель пуговицу с пальто. Утром — если утро
наступит — вы найдёте её пришитой обратно и неделю не сможете спать».

**Proposed EN:** “You lay a button from your coat in the cradle. As you turn away,
something tugs at the cloth where the button used to be.”

**Proposed RU:** «Вы кладёте в колыбель пуговицу с пальто. Когда вы отворачиваетесь,
что-то тянет за ткань там, где была пуговица».

**Reason:** This trades the future week's insomnia for a present physical echo.
The existing “if there is a morning” is a good line; choosing the new version
means deliberately giving it up here, not treating it as an error. No inventory
change or additional consequence is proposed.

## Q07 — Make the reading choice's stakes intelligible

Source: `game/below#itCostsWhatReadingCosts`, beneath
`game/below#readWhatIsWritten` (“Read what is written” / «Прочесть написанное»).

**Original EN:** “It costs what reading costs”

**Original RU:** «Обойдётся, как всякое чтение»

**Proposed EN:** “May reveal something; may shake your nerve”

**Proposed RU:** «Может что-то подсказать — и пошатнуть самообладание»

**Reason:** The original has a pleasing cadence but explains little to a player
who does not already know the reading mechanic. The actual scribe branch can
deliver information and can call `readingCost`, which affects nerve. The proposed
hint names those stakes without odds, numbers or a claim of guaranteed insight.

## Q08 — Sending a companion back does not have to promise safety

Sources: `game/below#passages.willBeSafeAnd` and `willBeSafeAnd2`.

**Original EN templates:**

- `${EP.He(c)} will be safe, and you will go on without ${him}`
- `${EP.He(c)} will be safe, and you will be alone`

**Original RU templates:**

- `${ru.gs(c,"Он","Она")} будет в безопасности, а вы пойдёте дальше без ${ru.gs(c,"него","неё")}`
- `${ru.gs(c,"Он","Она")} будет в безопасности, а вы — одни`

**Proposed EN templates:**

- `If ${c.p} goes, you will continue without ${him}`
- `If ${c.p} goes, you will be alone`

**Proposed RU templates:**

- `Если ${ru.gs(c,"он уйдёт","она уйдёт")}, дальше придётся идти без ${ru.gs(c,"него","неё")}`
- `Если ${ru.gs(c,"он уйдёт","она уйдёт")}, дальше придётся идти в одиночку`

**Reason:** The offered action can be refused; its implementation also does not
establish a universal future-safety guarantee. The revision states the immediate
tradeoff and preserves the absence of player gender. This is not a claim that the
companion's current outcome bookkeeping is broken.

## Q09 — One Russian recap verb has the wrong everyday meaning

Source: `game/below#passages.oneOfTheJudges2`.

**Original EN, retain:** “one of the judges of the dead stared you down”

**Original RU:** «один из судей мёртвых пересмотрел вас»

**Proposed RU:** «вы не выдержали взгляда одного из судей мёртвых»

**Reason:** «Пересмотрел» normally suggests looking again or revising a decision,
not winning a contest of staring. The revised recap conveys the English event
without an invented contest verb. No English rewrite is needed.

## Q10 — Let the event supply the horror before explaining that it is worse

Two related passages illustrate one stylistic choice; it is not necessary to
remove every narrator's judgment.

Source: `game/below#passages.youBowAndThe`.

**Original EN:** “You bow, and the last of them bows back, and that is worse than
anything.”

**Original RU:** «Вы кланяетесь, и последний из них кланяется вам в ответ, — и это
хуже всего».

**Proposed EN:** “You bow. The last of them bows back, exactly as low.”

**Proposed RU:** «Вы кланяетесь. Последний из судей отвечает поклоном — таким же
низким».

Source: `game/below#passages.theTabletBreaksLike2`.

**Original EN:** “The tablet breaks like any clay. Nothing else happens, which
is somehow worse; and then, behind you, the scratch of a stylus begins again.”

**Original RU:** «Табличка бьётся, как любая глина. Больше ничего не происходит —
и от этого почему-то хуже; а потом за спиной снова начинает скрести палочка писца».

**Proposed EN:** “The tablet breaks like any clay. For a while, nothing happens.
Then, behind you, a stylus begins to scratch again.”

**Proposed RU:** «Табличка бьётся, как любая глина. Некоторое время ничего не
происходит. Потом за спиной снова начинает скрести палочка писца».

**Reason:** The bowed clay figure and resumed writing already create unease.
Removing the evaluative clause allows them to land without instructing the
reader's reaction. The short, plain rhythm remains.

## Q11 — Attribute the gatekeeper's claim when recalling it

Source: `game/below#passages.youGaveTheGatekeeper4`.

**Original EN:** “you gave the gatekeeper Crane’s name, and learned he was still below”

**Original RU:** «вы назвали привратнику имя Крейна и узнали, что Крейн всё ещё внизу»

**Proposed EN:** “you gave the gatekeeper Crane’s name, and it told you Crane was still below”

**Proposed RU:** «вы назвали привратнику имя Крейна, и тот сказал, что Крейн всё ещё внизу»

**Reason:** The scene establishes what the gatekeeper says. It does not resolve
what “still here” means for Crane. This revision retains the unsettling claim
without turning a creature's words into independently confirmed knowledge.
It is an attribution proposal, not proof that the creature is lying.

## Motifs worth keeping

- `world/nature#scenes.truth.bad`: the name returning with teeth. Its anatomical
  impossibility is the image, not a mistranslation to normalize away.
- `game/below#passages.youCountSevenThen`: a voice behind the player saying
  “eight” / «восемь». The short extra count does the work without explanation.
- `game/below#passages.theWingComesDown`: stone that is “only stone” and very
  heavy. The practical understatement makes the supernatural threat tangible.
- `world/nature#tablet`: a damaged line and a missing next sign. This supports
  interpretation without explaining the hidden mechanic.
- Confident, evasive or mistaken character statements should remain possible.
  Do not soften every claim into a hedge; attribute it to the speaker and keep
  the narrator's factual obligations separate.

This was a focused follow-up, not a claim that every procedural combination has
received human literary review. Keyed English/Russian pairs were changed together. Review deliberate transcript differences without rewriting older baselines; runtime branches remain covered by the forced-scene and narrative checks.

## Earlier selected rewrites

The Confidant ending no longer claims every betrayal was detected. Its conclusion describes enough people standing with the player. The Russian heat-and-dreams line is «все эти сны — от жары». The quiet-player ending says the last evening came before certainty. These three changes were separately approved before this follow-up. Deliberate character mistakes, confidence and lies remain possible; an attributed statement is not narrator-confirmed truth.
