# Kutha 29.0.0: a plan

Oct 26, 2026 · @Ilia

29.0.0 reviews the sve ways the cult judges who is closing in on it (a seventh went in 28.3.1, and a sixth, threatened, in 28.5.0, each with the tell it made), keeping or fixing each with a written reason, and studies whether one measure could serve them all. It comes after 28.3.0, 28.3.1 and 28.3.2 and builds on them (planned as 28.3.0, it moved to 28.4.0 when the owner's list of 27 October became 28.3.0, and became 29.0.0 on 28 October, the owner's word, for all it now holds; its small items went into 28.4.0 and 28.5.0). This is the plan; nothing is implemented yet.

## The six today

The cult weighs who is closing in on it in six places, one model with six settings (`people/suspicion.js`, `THREAT`). As they stand after 28.3.1:

**Since 28.5.0 there are five.** The sixth, threatened (whether the cult lies low less while a dream naming one of it is known), went with the tell it made: a quiet night after a guilty dream told aloud said that the dream had named an innocent (0.37). What follows was written of the six; the review covers the five that remain.

| # | Decision (setting, where) | The question | What it counts | How it uses it |
| --- | --- | --- | --- | --- |
| 1 | Whom it names guilty in its own dream (`closingIn`, `people/claims.js`) | Who is closing in on us? | Each step of suspicion past the first, toward any of it at large; dreams naming one of it at large, told aloud or known to it | A weighted pick |
| 2 | Whom it comes for first (`harm`, `game/night.js`) | Which dreamer must die? | Dreams naming one of it at large, told aloud or known to it | The one with the most, at 70%, unless it comes for you or one of its own |
| 3 | Whether it lies low (`threatened`, `people/cunning.js`) | Can it afford to wait? | Anyone alive with such a dream | Lies low at × 0.4 |
| 4 | Whether to clear its partner in a dream (`watched`, `people/claims.js`) | Is the partner watched? | Anyone suspecting the partner in earnest; anyone but its own dreamer naming the partner guilty before everyone | Yes or no |
| 5 | Why it chose its victim (`suspects`, `game/night.js`) | What did the victim know? | The first of it the victim suspected in earnest | One name, told in the ending |
| 6 | How likely each is to be its victim (`weight`, `people/social.js`) | All else equal, whom to take? | Every step of suspicion toward any of it | × (1 + 0.25 a step) |

All six assume the cult can read how far anyone suspects it. Dreams told aloud are heard by all; dreams told you in private reach it only as 28.2.0 has it, and words of distrust told you in private no longer reach it (28.3.1).

## 1. The review

Each of the six is judged by the same three questions, then kept or fixed, with its reason written down.

1. **Does what it counts fit its question?** A weight can be graded; a yes or no needs a threshold; a story names one.
2. **Could the cult know it?** What it sees, what is said aloud, what it overhears; never what it was not there for.
3. **Where two settings ask the same question, do they count the same?** The same question counted two ways is a fix; different questions counted differently are fine.

**Where to look first:**

- All six read how far each person suspects the cult. The game has always let it read faces; the review either says so as a rule, or limits it to suspicion shown in earnest or said aloud.
- No. 2 comes first for dreamers alone; suspicion counts only through the weights (No. 7). Should one who suspects it in earnest, with no dream, ever be its first pick?
- Three thresholds of suspicion: past the first step (No. 1), every step (No. 7), in earnest (Nos. 4–6). Each may fit its question; the review says why.
- No. 4 counts accusations made aloud but not private words it knows of; No. 5 the other way round. Is there a reason, or is it the same question?

**What comes of it.** A setting kept gets its reason beside it. A setting fixed goes as any fix: a test that fails first, the recordings made again and read, the tells measured.

**Where the reasons go.** RULES.md and the rulebook (a table of the six with a "why" for each), the code's comment over `THREAT`, and a node test that every setting carries its reason (each setting in `THREAT` gains a `why`).

## 2. The one-measure study

One danger score for each person, read by all six decisions: built as an experiment beside the six, measured, and adopted only if it plays better.

**The score.** How dangerous person o is to the cult, summed over each of it still at large, k:

```latex
D(o) = \sum_{k \in \text{cult at large}} \left( a\,s_{ok} + b\,d_{ok} + c\,p_{ok} + e\,n_{ok} \right)
```

Here s is the steps of o's suspicion of k; d the dreams o told naming k, aloud or known to the cult; p the private words against k it knows of; n the times o named k guilty before everyone (blame or vote). D(o, k) is the term for one of the cult, k, alone.

| Decision | How it would read the score |
| --- | --- |
| 1. Whom it names guilty in its own dream | A weighted pick by D(o) |
| 2. Whom it comes for first | The highest D(o), 70% of nights |
| 3. Whether it lies low | Anyone with D(o) at a threshold or above: lies low at × 0.4 |
| 4. Whether to clear its partner | Anyone's D(o, partner) at the threshold or above |
| 5. Why it chose its victim | The one of it the victim's score was highest for |
| 6. How likely each is to be its victim | × (1 + a share of D(o)) |

**The experiment.**

- Built on a scratch branch behind one setting; nothing ships unless it is adopted.
- The weights a, b, c, e and the threshold are fitted first to reproduce today's choices as closely as they can, over recorded seasons. So the study measures one measure, not a retuning.
- Measured both ways from fixed seeds: `sim/balance.js` (the published 3,150 and fresh seeds) and `sim/tells.js`.
- The cult's behaviour, both ways: how often it comes first for a dreamer, and for one who suspects it with no dream; the true Dreamer's survival; the nights it lies low.
- Read side by side: the ending's account of why the cult chose whom it chose, from 20 seasons played both ways, to judge whether its choices read more sensibly.

## 3. A tell carried over from 28.2.0: fixed in 28.3.1

Found and fixed in 28.3.1, on the owner's word of 27 October: a bug, an unintended consequence of complexity. Taken apart on 2,000 seasons, the 2.46 the row then measured was two things. The camp names the cult more often than anyone, and rightly: naming at random would already have given 1.51, which the row counted again. And pair by pair, one of the cult named back someone who had named it 1.70 times as often as anyone did (47.8% against 28.2%). That was the tell, made by two of the cult's habits: the calculating cultist named whoever had spoken against it, and the cult framed by dislike alone, where anyone names whom they suspect most. Taking away the first alone left the row at 2.10. The fix: the cult names, and blames aloud, as anyone does; and a word of distrust told you in private reaches the cult no more, since that habit was the one use it made of such a word. `sim/tells.js` now measures naming back pair by pair: 1.27 (95% 0.87–1.85) for a word told you in private, 1.07 (0.61–1.90) for one said aloud.

- [x] Find its source in `sim/tells.js`, taking away one reason at a time why the cult and the innocent name whom they distrust, and say what it is.
- [x] Fix it there, as any fix: a test that fails first, the recordings made again and read.
- [x] Measured again on 2,000 seasons: within 0.5–2, and no other tell pushed out.

## Deciding

The owner chooses from the study's results; my recommendation comes with them.

| If the study shows | Then |
| --- | --- |
| Every tell within 0.5–2, the balance within noise, and the cult's choices reading better | Adopt the one measure: one score, read six ways. 29.0.0. |
| A shift in the balance or in the cult's priorities that the owner wants | Adopt it, with the new figures. 29.0.0. |
| No gain, or a tell past 2 | Keep the reviewed six. 29.0.0 if a fix from the review changes play; otherwise a patch of 28.4, the reasons and their tests alone. |

## Order of work and release

29.0.0 starts when the owner says so, after 28.5.0 (released locally on 29 October), and stays off GitHub until the owner allows pushing again.

1. Branch `build-28-3` from `build-28-2`.
2. The review: each of the six judged and its reason written; each fix its own commit, with its test failing first and its recordings read.
3. Done in 28.3.1: the tell carried over from 28.2.0, found at its source and fixed (section 3).
4. The study, on a scratch branch: its results to the owner, with a recommendation.
5. The owner's choice built in, if it changes anything.
6. `sim/tells.js` and `sim/balance.js`; RULES.md and the rulebook; CHANGELOG, REQUIREMENTS, DEVELOPING; the version.
7. `node test/run.js full`; the commit; the claude.ai copy; the project's status note.

## Also in 29.0.0 (the owner's word, 27 October)

29.0.0 carries, beside the threat review above, a thorough review of the whole game and the cult's discreet schemes from the research report ([Manipulation techniques, applied to Kutha](https://claude.ai/artifact/9Mxj9JKCjKn5i2RriJnoWz)). Each change in its own commit, a bug's test failing first, every recording changed only on purpose and read.

**1. A thorough review of everything**, in five parts, run two at a time to keep the cost down, each finding checked before it is acted on:

| Part | What it covers |
| --- | --- |
| Code | Every module, not only the new: edge cases (the dead, the exposed, the away, the last of the cult, day 1 and day 5, hardcore, a season begun again), state written outside its owner, the season's dice against the words' and the slot's, anything that can throw |
| Words | Every line in both languages: grammar and idiom, the player never given a sex, gender agreement, names and cases, nothing shown as a number, nothing that gives the cult away before the ending |
| Documents | RULES.md, the rulebook, DEVELOPING, CLAUDE.md, the README and the changelog against the code, number by number |
| Code health | Dead keys and functions, ownership, odds as named steps, tables over branches, tests for every machinery, slow spots |
| Design and tells | Every observable the cult could do differently, measured or shown role-blind; exploits; whether any style is clearly better |

**What the camp knows** (audited in 28.3.2, the owner's word: "naming a cultist correctly with some probability is a magic skill; it belongs to the Dreamer, not to simple folk"). 28.3.2 removed the hunch that named a real cultist and the tips that named the thief unseen, wrote rule 14 (nobody knows what they could not know), and listed every read of someone's hidden part in `test/node/knowledge.js` with whose knowledge it is. The review keeps that list true, and looks for knowledge without a source that is not a read of a part (what someone could not have seen or heard).

**2. Bug fixes and refactoring** from that review, and these already noted:

- Done in 28.5.0: a complaint of your questions eases the one who made it by two steps of being hounded, so that they complain again only if you keep at them.
- Done in 28.3.1: the tell carried since 28.2.0 (section 3).
- Done in 28.3.1: `package-lock.json` carries the build's version again, raised with `package.json` at each release.
- Done in 28.5.0: at a won ending the top panel says the rite was stopped, however far it had come, not that it was complete.
- Done in 28.3.2: nobody names one of the cult on a hunch. The camp's word had given the cult away (named by the innocent 2.34 times as often as anyone; the one named most after three days of the cult about half the time). `sim/tells.js` now watches how the cult is named.
- Done early, with 28.3.3: the occultist's chill weighed again and kept, 25% beside one of the cult and 5% beside anyone else, once a conversation (the owner's word: a peculiar gift, not a way to win). On scratch runs, a bot that follows its chills won 29% with it and 29% without (42% with a perfect chill), and even talking every slot found one of the cult by day 3 in 56% of seasons; a chill at the first meeting with each person (60% and 8%) was set aside as an edge over the soldier. Your own dreams are dealt alike for every background.
- Measured in 28.5.0 on 12,000 seasons, 1.42 (95% 1.23–1.64), and kept, as the owner said. Before: within earshot of a dream told you in private, its dreamer taken soon after, 1.95 on 2,000 seasons of 28.3.2 (95% 1.41–2.69; 1.43 on 28.3.1's): the cult acting on what it overhears. Measure it on more seasons, and if it holds near 2, weigh how readily the cult comes for a dreamer it knows only so.
- Done in 28.3.3: the breakfast that stopped the game (the sleuth's talk of your ways, with nobody left at the dig to say it but the friend it is about).
- Done in 28.3.4: the press (the owner's word, 27 October): 30% for anyone (40%), the old soldier +15 (+25), trust 2 points a step (5); and the more they trust you, the readier something slips (the hostile had slipped most). The simulators' inquisitors press again: their lean had matched no press button since 25 October, and test/bot.js now checks every lean.
- To weigh in 29.0.0 (the owner's word, 28 October, kept here): the old soldier's edge (the owner's principle: he may win more by his health and his eye for a scene, never by pressing left and right; deduction not insanely better). On scratch runs of 28.3.3, 4,000 soldier seasons a variant (about ±1 point): 9.7% won as he is, 7.8% without the revolver, 8.6% without the fourth wound, 9.3% without the examine bonus, 9.8% without the press bonus (nothing measurable, even for a bot that presses three times a season). Measure again on 28.3.4, and decide whether the examine bonus should carry more of his edge.
- Done in 28.3.5: the music no longer turns as you arrive (the owner's report).
- Measured on 28 October (scratch runs): the line naming who takes a night's death hardest falls on the cult less often than its share (per head 0.55 to 0.72 by playing style; `sim/tells.js` 0.67 on 600 seasons), because the cult kills those it likes least. To watch: the inquisitor's 0.55.
- Measured on 28 October (scratch runs, 5,000 seasons): a false dreamer who speaks out is of the cult 51% to 58% of the time, the cult being 48% to 50% of the living who could pretend then; per morning, a cult pretender speaks out 1.0 to 1.3 times as often as an innocent one; an innocent pretender who speaks out is taken the next night 25% to 35% of the time, the cult's own never (the cult does not kill its own). To research in 29.0.0 (the owner's word, 28 October): a cult that spares noisy innocent pretenders more (`night.loudSpared`), their noise being its gain.
- In 28.5.0 (the owner's word, 28 October): the Watcher pretends to dream as often as anyone (it never did); a swept scene stays marked on the plan, is told at the place, and is noted in the Evidence tab; your own marks on the traces (taken out again in 28.5.1, the owner's word: of no use for now), with the facts the casebook keeps about them. In 28.4.0: the long passages moved out of the code into keyed text files by topic, and CLAUDE.md's guideline to read only what a task needs.
- To do in 29.0.0 (the owner's word, 29 October): redraw the frightened face, which looks much like the surprised one (wide eyes, small pupils, a small open mouth), and **show the new drawing to the owner for approval before it is built**. Since 28.5.1 trouble about one's own lot and an ordinary bad day show a sad face, so the frightened face is left only to someone afraid in a conversation.
- To do in 29.0.0, when the figures are measured again: drop the die kept in `faceFor` (`people/manner.js`) by 28.5.1. It once picked a bad day's face among four and now picks nothing; it is thrown only so that every season's dice, and every figure published for 28.5.0, stayed as they were.

**3. The cult's discreet schemes** (the report's eight rules), each built only with its tell measured:

- **Budget the aim:** whatever the cult points at (a victim, a rumour, a doubt) leans toward its interest only so far, with deliberate misses and harmless targets.
- **The second voice:** agreeing with an innocent who already suspects the wrong person, at breakfast and at inquiries, at the same rate as anyone seconds a suspicion.
- **Discredit the evidence, by style:** doubts that a trace, a reading or a find is what it seems, fired by your way of hunting, never by which evidence is true, and voiced by innocent sceptics as often.
- **Earn trust, spend it once:** against a confidant, a cultist friend steering one inquiry.
- **One planted item, then silence;** an act only once, disguised as something natural, with innocent causes of the same kind.
- **The misled who speak up:** someone a rumour misled into a wrong vote may later name who told them.
- **Keep the pair and the clock ordinary:** new rows in `sim/tells.js` for the two of the cult acting on the same target or theme the same day, for each one's share of the talk just after a death, an inquiry or the scandal, and for how steady the cult's results are.

**4. The figures, the rulebook and every document** measured and brought up to date at the release, as for each build.

## What the power below wishes, told in play (the owner's request, 28 October)

The owner's words: whatever the power likes or dislikes should show throughout the game, "in certain omens, or certain bad or good luck among the characters with various traits"; "we currently have no idea at all what the power wishes the people to be like", and it should leak into play, "so you could at least partly try to deduce". Today the trials below turn on the power's nature (`NATURE`: the ways it favours and the ways it will not abide), and play tells almost nothing of it: the manner of the deaths shows its aspect, mostly, but nothing in play ties an aspect to the ways it asks for.

**The aim.** By the descent, a player who watched for it can name some of what the power favours and some of what it will not abide: never all of it, never surely. A bot that reads the signs should be right more often than chance on each way, and wrong now and then.

**Channels to weigh**, each a row in a table by nature, each measured:

- **Luck by temperament.** People whose temperament leans to a way the power favours fare a little better by day (a find, a narrow escape, a sound night's sleep); those whose way it will not abide, a little worse (a fall in the trench, a lamp that will not stay lit, a bad night told at breakfast). Told as ordinary camp luck, never as a judgment; the cult's luck as anyone's, so that luck says nothing of who is of it (rule 5).
- **Your own ways by day.** What you do (pressing, resting, searching in haste, giving a charm away, reading late) now and then draws a small sign of favour or disfavour: nerve steadied or frayed, a sign at dawn.
- **Omens.** Some of each power's dawn signs speak to its ways (the canal rising for one that loves water, lamps failing for one that hates light).
- **Tablets.** Now and then a line of what the power rewards or punishes, in the old words, with a scribe's error now and then, as for any line.
- **Your dreams.** A dream of the gates may show a way met with favour or refused, never explained (rule 6).
- **The deaths.** The power's manner already shows its aspect; its touch on the cult's work might show what it scorns.

**Bounds.** Told in words, never numbers (rule 2); never explained in play, and told in full in the debrief (rule 6); the season's dice in a fixed order, the words' own dice for how it is put (rule 8); nothing of it different for the cult (rule 5); nobody in the camp knows the power's wishes, though anyone may remark on luck (rule 14).

**Measured by** a bot that tallies each way's good and bad luck and meets the trials by the ways it judged favoured, against one that ignores the signs: how often it is right on each way, and what that does to the descent. The signs should be worth something, never decisive.

## Research: one framework for every decision (the owner's word, 29 October)

The owner's words: "some new general framework on how everything influences everything", which "should not change the gameplay" but "provide a uniform way of thinking on all sorts of probabilities": a subject (every actor in the game, the power below included: the one who makes a decision), an object (every actor too: the one the decision affects), and all the probabilistic consequences it can have with everyone and everything; every decision passes through it before it is probabilistically approved or not. To research, not to build at once.

**Today.** Every decision is already odds built from named steps and a roll (`core/odds.js`), but each table chooses its own factors by hand: trust in one, temperament in another, grief in a third. The same tie can weigh in one decision and not count in the next, and nothing makes them agree.

**The idea, as understood.**

- The subject: whoever decides (anyone at the dig, the cult as one, the power below, the world itself), with only what it could know (rule 14).
- The object: whoever or whatever the decision falls on (you, a person, a trace, a dream).
- The act and its consequences: who sees or hears of it, and what it moves (trust, suspicion, grief, the rite), each consequence a decision of its own, through the same gate.
- One registry of influences: how each thing between a subject and an object pushes the odds (liking, trust, fear, suspicion, grief, temperament, craft, the rite, the season's mood), each stated once and used wherever it applies, neutral by default.
- One gate: every decision's odds assembled from the registry, then rolled, the same way for everyone.

**Questions to answer.**

- Can today's odds be written through it with the same numbers, die for die (every recording identical), as 28.0.0 did with the odds framework?
- How to keep "everything influences everything" sparse and readable: most pairs neutral, a few named influences for each kind of act.
- Can it keep the project's rules by construction: each influence saying whose knowledge it reads (rule 14), and the tells it could make foreseen before they are measured (rule 5)?
- How it shows in the dice trace (rule 11), and what it costs in speed, in Node and on the page.
- Where it could later change play, if the owner wants it: the power below as a subject (its wishes, above), and consequences that are missing today.

**Bounds.** Nothing in how the game plays changes until the owner says so: the framework first, measured against today's game.

## Research: actors that learn to play (the owner's word, 29 October)

The owner's idea, to research and not to build at once: every actor a neural network with its own skills and knowledge (the true Dreamer knowing its dreams are mostly true, and having them at the odds the rules already give), each with one goal, to survive; and it is not always rational to stay silent, since the cult may already be closing in, or it may be statistically likely that one is the next to be taken. Describe to each network the possible actions, its part, its skills and the knowledge open to it; let them play, so that complex strategies emerge; then distill rules from what they learned.

**How it could be done.**

- The game as an environment: each decision point the code already has (the cult's night choice, a claim, a dream told or kept, a blame aloud, a vote, a promise to watch) becomes a step where an actor sees only what it could know (rule 14) and picks among the moves its part allows.
- Learning by self-play, many actors at once (multi-agent reinforcement learning), the cult rewarded for the rite and its own survival, everyone else for surviving and the cult unmasked; hidden-role games of this kind have been learned before by self-play and regret-minimising methods (poker, Diplomacy, The Resistance).
- Distilling: from the trained players, the situations where they act differently from today's rules, written back as odds and named steps (rule 13), then checked as every rule is: the tells kept between 0.5 and 2 (rule 5), the season's odds measured (rule 9).
- A first step small enough for a CPU: the decisions of one part only (when the true Dreamer, or a pretender, speaks or keeps silent), small networks or tables, against today's rules for everyone else.

**What it needs.** This environment has 2 processor cores (Intel Xeon, 2.8 GHz), 7.8 GB of memory, no graphics processor, and about 29 GB of disk; the game in Node plays roughly ten seasons a second on each core. That is enough for the small first step, not for learning the whole game, which takes millions of seasons: that would need a machine with many cores or a GPU (below). The owner's laptop (MacBook Pro, Apple M4 Max, 36 GB) should be enough, by estimate, to be timed first: small networks train well on its GPU (PyTorch's Metal backend, or MLX), and its 14 cores (10 of them fast) should play roughly 10 to 20 times as many seasons an hour as this environment, a million seasons in an hour or two; the first step in hours, learning every part's choices days of computing per experiment. All of it can be done in Node (the owner's question): the game plays there already, in worker threads across the cores, and small networks train well enough in JavaScript on the CPU (TensorFlow.js, or a small network of our own); only training on the Mac's GPU would need Python (PyTorch on Metal, or MLX), Node playing the seasons and the trained network brought back into Node. Start in Node; add Python only if the networks outgrow the CPU.

## A step to consider: moving to the owner's laptop (the owner's word, 29 October)

If this environment's resources are too few for 29.0.0 (above all for the research above), carry the work over to Claude Code on the owner's laptop: the chat's decisions and plans (they live in the claude.ai project, its status page and these plan docs, which a new session can read), and the repository. Nothing has gone to GitHub since 27.1.3, at the owner's word, so the repository moves either by the queued pushes (when the owner allows them) or as a git bundle sent as a file, with every branch and the local `main`; then the suite run there once, to see that the laptop's tools and versions match REQUIREMENTS.md.
