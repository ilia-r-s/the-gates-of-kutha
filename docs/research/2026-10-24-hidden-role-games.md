# Lessons from other hidden-role games, applied to Kutha

Oct 24, 2026 · @Ilia

## Summary

Build 25.2 closes the cult's last loud tells: every behaviour measured below now shows up in the cult at between 0.68 and 1.53 times the rate it shows up in everyone else. Before, the worst was the inquiry vote: the other cultist sat silent through a mate's inquiry 2.65 times as often as anyone else, and almost never voted to send the mate away (0.12 times as often).

Four lessons from other hidden-role games drove the changes:

1. **A lie proves guilt only where honest people never lie.** Kutha already lets innocents lie; a false Dreamer claim now comes from the cult 51% of the time, against a 33% prior (two cultists among the six who could claim it falsely).
2. **The cult is caught by what it knows, not by how it acts.** People spot lies about 54% of the time; what gives the cult away is whom it clears, kills, defends and never votes against.
3. **The night kill is a clue.** A victim's suspicions point at the killers, so the kill needs the same balancing as the talk.
4. **Balance the range, as in poker.** Every visible action must be taken by both sides at similar rates; a scheme that always fires becomes a tell.

What changed: the cult votes the way anyone in its place would, with a small nudge; it sometimes kills an accuser so that the accused innocent looks guilty; it lies low for reasons that change with the season; and it learns your way of hunting it and works against it. All of it was measured in 700 simulated seasons before and after.

## What the research found

Across Mafia, Werewolf, Blood on the Clocktower, Secret Hitler, Avalon, Spyfall, Coup and poker, the hidden side wins by looking statistically ordinary, not by acting well.

- **Where honest players never lie, any lie is a confession.** Forum Mafia runs on [Eliminate All Liars](https://wiki.mafiascum.net/index.php?title=Eliminate_All_Liars); one guide calls any counter-claimer "95% likely Mafia" ([Smogon](https://www.smogon.com/smog/issue43/roles-of-mafia)). On the Japanese Werewolf boards, all 184 false Seers in contested games were on the wolves' side ([Sonoda & Toriumi 2017](https://www.ai-gakkai.or.jp/jsai2017/webprogram/2017/pdf/898.pdf)).
- **Blood on the Clocktower breaks that by design.** Good players are told not to feel bound by the truth, so a double claim only "usually" means one evil player ([Player Strategy](https://wiki.bloodontheclocktower.com/Player_Strategy), [Behind the Curtain #3](https://bloodontheclocktower.com/news/behind-the-curtain-3-strategy-beginner-intermediate-and-advanced)).
- **Lie detection is close to a coin toss.** People judge truth or lie correctly 54% of the time ([Bond & DePaulo 2006](https://assets.aclu.org/live/uploads/document/foia/2006-Personality-and-Social-Psychology-Review-Accuracy-of-Deception-Judgements.pdf)). Classifiers trained on 685 forum Mafia games reach an AUROC of only 0.59–0.68 ([Mafiascum Dataset](https://ar5iv.labs.arxiv.org/html/1811.07851)).
- **Liars who don't know the truth are trusted more.** On the Werewolf boards, real Seers were trusted 61% of the time, fake Seers who didn't know the wolves 43%, wolf fake Seers 24% (Sonoda & Toriumi, percentages computed from its counts).
- **The kill leaks.** When a Werewolf villager was killed, each player he had suspected was a wolf 57% of the time, against about 21% at random ([Lin et al. 2017](https://www.ai-gakkai.or.jp/jsai2017/webprogram/2017/pdf/433.pdf)).
- **The vote leaks.** Scum are "more hesitant to vote for one another" and jump late onto a doomed partner's wagon ([Mneme's Guide](https://wiki.mafiascum.net/index.php?title=Mneme's_Guide_to_Vote_Analysis)).
- **Poker already solved "same action, different hands".** Deception applies to whole strategies, not single plays ([Range Balancing](https://thepokerbank.com/strategy/concepts/range-balancing)); taking the right actions at the wrong frequencies is itself a leak ([GTO Wizard](https://www.pokernews.com/strategy/what-is-gto-poker-gto-wizard-breaks-down-the-fundamentals-52001.htm)).
- **A fixed strategy is a target standing still** ([Galfond](https://www.philgalfond.com/articles/why-i-m-more-exploitable-than-you)); varied opponents stop any one style from winning ([Xu et al.](https://arxiv.org/html/2310.18940v3)).

The working rule taken from this: for every behaviour the player can see, keep the ratio between its rate in the cult and its rate in everyone else between 0.5 and 2.

## Where Kutha stood before

The claims were already balanced after the fake-roles rework; the votes and the kill were not. Measured in build 25.1 over 700 seasons (100 each by seven bot personas: an ordinary player, a sleuth, a scholar, a quiet one, an inquisitor, a confidant and a digger):

| What the player can see | In the cult | In everyone else |
| --- | --- | --- |
| A guilty dream from a false Dreamer that turns out to name the cult | 31.7% | 49.4% |
| A night's victim suspected most someone who was of the cult | 57.1% | 41.1% (anyone else that night) |
| Someone the victim had named guilty aloud was of the cult | 75.8% | 43.4% (named by anyone else) |
| At an inquiry into a cultist, the other cultist voted to send them away | 5.6% | 47.8% |
| ... spoke against it | 43.1% | 32.8% |
| ... said nothing | 51.4% | 19.4% |
| At an inquiry into an innocent, voted to send them away | 44.0% | 25.8% |
| ... spoke against it | 11.4% | 39.6% |
| ... said nothing | 44.6% | 34.6% |

Two things were already fine. When the true Dreamer and someone else both claimed to dream, the true one spoke first 57% of the time, close to the 50% that makes order meaningless. The first person the cult killed was the true Dreamer 19.9% of the time, against 20% at random. The cult lay low on 3.1% of nights, always for the same two reasons.

## Verdicts

Of 27 ideas, 7 were applied or adapted in this build, 11 were already in the game, 7 were rejected and 2 wait for later.

| Idea | From | Verdict | For Kutha |
| --- | --- | --- | --- |
| Honest players lie too | Blood on the Clocktower | Already in | Innocents, the thief, the Watcher and the Dreamer all claim parts that are not theirs, by temperament |
| Claim nothing by default | Mafia | Already in | Most of the camp never claims a part |
| False dreams that ignore what the liar knows | Werewolf boards | Already in | The cult's false dreams follow the same rules as anyone's; it shields its mate or answers a threat only when that comes up |
| Cheap bus: give up a partner who is lost anyway | Mafia | Applied | A cultist may vote to send away a mate who looks lost |
| Split votes: no voting bloc | Mafia vote analysis | Applied | The cult raises its hands by the same leaning as anyone, plus a small nudge |
| Keep distance from the partner | Mafia | Already in | A cultist now and then dreams its own mate guilty |
| Pocket the player with an oath | Mafia (buddying) | Already in | A cultist may swear to watch your tent, and keep the watch |
| Claim credit for a save that never happened | Mafia no-kill gambit | Adapted | Anyone who swore to watch your tent may say they saw someone off; the ending tells the truth |
| A deliberate no-kill | Mafia, Town of Salem | Adapted | The cult lies low for reasons that change with the season, never a fixed once per game |
| Kill the information roles first | Blood on the Clocktower | Already in | A dreamer heard naming the cult is likelier to die, but not surely |
| Kill to frame | Mafia, Blood on the Clocktower | Applied | The cult may kill someone who named an innocent aloud, so the innocent looks guilty |
| Spare useful townies | Mafia scum guides | Already in | The cult spares loud false dreamers whose dreams do it no harm |
| The Miller: an innocent who reads guilty | Mafia | Applied | The god's hand may rest on the thief in the Dreamer's dreams |
| Unreliable information | Blood on the Clocktower | Already in | Muddied dreams, dreamless nights, misread traces |
| Simple majority, ties fail | Blood on the Clocktower | Already in | An inquiry needs two hands, and more for it than against |
| A fixed supermajority | Mafia variants | Rejected | The cult plus one friend would veto everything, and the veto would itself be a tell |
| A clock on refused votes | Secret Hitler | Already in | Refused inquiries anger the camp; it tires of them and may walk out |
| A price for a wrong elimination | Town of Salem | Already in | Sending an innocent away costs nerve, standing and the rite's ground (raised for hardcore) |
| A strategy portfolio | Poker; Xu et al. | Applied | The cult reads your way of hunting it and works against it |
| Eliminate All Liars as a policy | Mafia | Rejected | It must not work, and in Kutha it doesn't: half of all false Dreamers are innocent |
| Kill your own partner for credibility | Werewolf | Rejected | It halves a two-person cult; kept only as the rare betrayal of a mate all but caught |
| A vigilante or witch among the townsfolk | Mafia, Werewolf | Rejected | A second killer among the people would drown the kill as a clue; your own night act is the one exception |
| The Avalon assassin's last shot at the Dreamer | Avalon | Rejected | The Dreamer is a character, not the player, so it would punish no choice of yours |
| The Hunter's dying shot | Werewolf | Rejected | Parting dreams already exist; more dying accusations would sharpen the kill leak |
| A storyteller who helps the weaker side | Blood on the Clocktower | Rejected | A hidden director would make the ending less your own doing |
| Veiled early hints before a claim | Mafia | Not now | Worth adding: the true Dreamer hints before claiming, and the cult fakes the hints |
| A lie planted at the root of the case | Blood on the Clocktower | Not now | Needs a model of the case you are building; too blunt to do subtly yet |

## What was applied

Seven changes, each meant to look like ordinary camp behaviour from where you stand:

1. **The cult votes like anyone.** A cultist's hand at an inquiry comes from the same leaning as everyone's: its show of suspicion, the case, its trust in you, its liking for the accused, the dead, the camp's anger. On top sits a small nudge: toward sparing its own, toward sending an innocent away. A mate who looks lost anyway it may give up outright.
2. **Kill to frame.** Now and then the cult kills someone who named an innocent guilty before everyone, so that the innocent looks like the one who silenced them. Rare by design: 7 of 2,017 kills in the test.
3. **"Now they are dead."** After a death, if the dead had named someone aloud, someone may say so at breakfast. Whoever suspects the named one is likelier to say it, cult or not. The line is the same whether the cult killed for that reason or to frame.
4. **Quiet nights with reasons.** The cult lies low more when the camp closes in on one of it, the night after an unmasking, and when the rite is far along. It lies low less while a dreamer who named it is alive, and less with each quiet night spent. Each season deals its patience unseen. The ending says why each quiet night was quiet.
5. **A watch claimed but not kept.** The morning after a night someone swore to watch your tent and nothing came for you, they may say they saw someone off. The cult says it to be trusted, others to be thanked or because they heard dogs; the true Watcher says it as often. The ending tells what the night held.
6. **The god's hand on the thief.** When the true Dreamer dreams of the thief, the god's hand may rest on his shoulder: the god knows who robs it. Following the Dreamer blindly now sends a thief away now and then.
7. **The cult reads you.** It watches how you hunt it and works against your favourite way, by up to half again: more planted traces and swept ground against a scene-reader, harder pushing at inquiries against an inquisitor, your friends first against a confidant, attention on you against a reader or digger, boldness against a sitter. The ending says from which day it had your measure.

## Measured after

&#91;embedded content: Simulated: build 25.1 against build 25.2, 700 seasons each, 100 per bot persona\]

The vote tells moved most, because the cult's hands now come from the same leaning as everyone's. The rest held: a false Dreamer claim stated aloud comes from the cult 51% of the time (46% of claims ever held); the true Dreamer speaks first in 45% of double claims; the cult lies low on 5.8% of nights, in 21% of seasons.

## The cult's schemes now in the game

Every scheme fires by chance, only when its situation arises, and has an innocent counterpart that leaves the same trace at a similar rate.

| Scheme | When | What the cult does | What looks the same from an innocent |
| --- | --- | --- | --- |
| Pretend to a part | Any time, by temperament | Claims to dream or to watch, at the rate anyone of its temperament does | Innocents, the thief and the true Watcher claim parts too |
| Shield the mate | Its mate is suspected | Dreams the mate clean | A friend dreams a friend clean |
| Answer a threat | Someone dreamt one of it guilty | Dreams the accuser guilty, or claims a part on the spot | A named innocent hits back the same way |
| Keep its distance | Its mate is not watched | Now and then dreams its own mate guilty | A false dreamer names whoever they fear |
| Plant a trace | At the night's scene | Lays an innocent's habit there, more often against a player who reads scenes | The thief's trace, or a passer-by's from earlier |
| Keep a sworn watch | It swore to watch your tent | Lets you be that night | The true Watcher keeps the same watch |
| Claim a save (new) | The morning after a sworn watch | Says it saw someone off | Anyone who swore says it as often |
| Stage a coming clean | A liar or schemer who claimed nothing | "Owns up" to being the Watcher | Lying and calculating innocents stage it too |
| Give up the mate (vote form new) | The mate looks lost | Votes to send the mate away, or dreams the mate guilty | The camp piles onto a doomed suspect |
| Betray the mate | The mate is all but caught | Kills the mate; the death looks like the cult's work on an innocent | Seen from the camp, any death |
| Vote like anyone (new) | Every inquiry | Raises its hand by the camp's own leaning, with a small nudge | Every hand in the tent |
| Kill to frame (new) | Someone named an innocent aloud | Kills the accuser | The cult also kills accusers who were right |
| "Now they are dead" (new) | After a death | Anyone, the cult among them, says the dead had named someone | Whoever suspects the named one says it |
| Lie low (reasons new) | Heat on one of it, an unmasking, a rite far along | Comes for no one | Nights the cult lies low for no reason at all |
| Read the player (new) | All season | Works against your favourite way of hunting it | Seen from the camp, nothing |

## Sources

Pages opened by the research pass; percentages marked as computed were worked out from the papers' own counts. A few forum threads were blocked and are not cited.

- Mafia: [Eliminate All Liars](https://wiki.mafiascum.net/index.php?title=Eliminate_All_Liars), [Stop Fakeclaiming as Town!](https://wiki.mafiascum.net/index.php?title=Stop_Fakeclaiming_as_Town%21), [Follow the Cop](https://wiki.mafiascum.net/index.php?title=Follow_the_Cop), [Stop Bussing!](https://wiki.mafiascum.net/index.php?title=Stop_Bussing%21), [Calculated Inaction](https://wiki.mafiascum.net/index.php?title=How_to_Win_as_Mafia%3A_Calculated_Inaction), [No-kill gambit](https://wiki.mafiascum.net/index.php?title=No-kill_gambit), [Mneme's Guide to Vote Analysis](https://wiki.mafiascum.net/index.php?title=Mneme's_Guide_to_Vote_Analysis), [Godfather](https://wiki.mafiascum.net/index.php?title=Godfather), [Vigilante](https://wiki.mafiascum.net/index.php?title=Vigilante), [Smogon: roles of Mafia](https://www.smogon.com/smog/issue43/roles-of-mafia)
- Werewolf and Town of Salem: [Five Killer Moves](https://thesystemisdown.substack.com/p/5-werewolf-strategies), [Town of Salem strategies](https://town-of-salem.fandom.com/wiki/Strategies), [Town of Salem Vigilante](https://town-of-salem.fandom.com/wiki/Vigilante)
- Blood on the Clocktower: [Player Strategy](https://wiki.bloodontheclocktower.com/Player_Strategy), [Imp](https://wiki.bloodontheclocktower.com/Imp), [Poisoner](https://wiki.bloodontheclocktower.com/Poisoner), [Rules Explanation](https://wiki.bloodontheclocktower.com/Rules_Explanation), [Storyteller Advice](https://wiki.bloodontheclocktower.com/Storyteller_Advice), [Behind the Curtain #3](https://bloodontheclocktower.com/news/behind-the-curtain-3-strategy-beginner-intermediate-and-advanced)
- Secret Hitler, Avalon, Spyfall, Coup: [Unofficial Secret Hitler Strategy Guide](https://secrethitler.tartanllama.xyz/), [Secret Hitler rules](https://secrethitler.io/rules), [Resistance/Avalon AI analysis](https://markmywords.substack.com/p/resistance-and-avalon-strategy-analysis), [Critical Play: Spyfall](https://mechanicsofmagic.com/2024/04/09/critical-play-spyfall-36), [Yang, Shi & Han: Coup](https://escholarship.org/uc/item/0p3904t5)
- Poker: [Bluff (poker)](https://en.wikipedia.org/wiki/Bluff_%28poker%29), [Range Balancing](https://thepokerbank.com/strategy/concepts/range-balancing), [What is GTO poker](https://www.pokernews.com/strategy/what-is-gto-poker-gto-wizard-breaks-down-the-fundamentals-52001.htm), [Galfond: Why I'm more exploitable than you](https://www.philgalfond.com/articles/why-i-m-more-exploitable-than-you)
- Research: [Sonoda & Toriumi 2017](https://www.ai-gakkai.or.jp/jsai2017/webprogram/2017/pdf/898.pdf), [Lin et al. 2017](https://www.ai-gakkai.or.jp/jsai2017/webprogram/2017/pdf/433.pdf), [Mafiascum Dataset](https://ar5iv.labs.arxiv.org/html/1811.07851), [Bond & DePaulo 2006](https://assets.aclu.org/live/uploads/document/foia/2006-Personality-and-Social-Psychology-Review-Accuracy-of-Deception-Judgements.pdf), [Peskov et al.: deception in Diplomacy](https://people.mpi-sws.org/~cristian/Deception_in_conversations_files/deception-conversational-dataset.pdf), [Serota & Levine 2014](https://oakland.edu/Assets/upload/docs/News/2014/Serota-Levine-Prolific-Liars-2014.pdf), [Xu et al.](https://arxiv.org/html/2310.18940v3)
