# How Kutha plays

Every number here lives in `src/rules.js` (named in `code`); change it there and the game changes. Chances are per event
unless stated otherwise. "Trust" is how a person feels about you, from −2 (hostile) to 3 (devoted); talk alone, or the
start of a season, never makes anyone more than fond (2); one person's suspicion of another runs from 0 to 3. The season
is `start.days` (5) days long.

The game itself never shows a probability. A choice tells you what it risks ("a bad step costs nerve", "if you named the
right power"), never its odds; the numbers below are for whoever tunes the game.

## Nothing is certain

The project's first rule: **nothing in the game is decided with certainty.** Every answer anyone gives, everything you
try, everything that happens of itself, and how much it costs or gives back, is a throw of the dice: often a
near-certain one (95%, 99%), never a sure one, and never a hopeless one.

- **No die is surer than 99% or rarer than 1%** (`scale.surest`, `scale.rarest`; `chance` in `core/random.js`). Odds of
  nothing at all are kept for what cannot happen (nothing to confess, nobody left to name, no charm in the place).
- **Odds made of many things** (a person's trust, the camp's mood, your trade) are kept between 5% and 95%
  (`scale.least`, `scale.most`; `clamp`). Only what is meant to be rare comes rarer: a horror of its own accord early in
  the season, the wrong charm or name that works all the same.
- **Amounts vary**: nerve lost or regained and each step the rite takes come out one more or one less now and then
  (`scale.spread`, 25%: half up, half down, never below nothing); a wound taken or healed, and a find counted in
  fragments, at `scale.graze` (10%). A cost of nothing stays nothing.

The rarest turns are never announced; the ending tells them. Among them: a tablet line that is a scribe's error, and
false (`PUZ.scribe`, 1% a line); a sign that is not the power's at all but another's, by coincidence (`PUZ.stray`, 1% a
sign); one of a charm's marks misread (`PUZ.misread`, 1%); a habit you noticed that was only that day's (`day.misnote`,
1%); a trace that was not its owner's own habit that night, a borrowed pair of boots, a cadged cigarette
(`examine.smudge`, 1%); the old title a philologist knows, misremembered (`study.misremember`, 1%); a death in another
power's manner than the one below (3%: all but `night.manner`); a Dreamer's dream that is muddied (5%), or a night
without one (3%); a night the cult lies low for no reason anyone will know (`night.low.odds`, 4%, × the season's
patience); an attack that fails by luck (`night.spared`, 3%); a scene swept clean (`night.swept`, 3%); the cult coming
for you for no reason you will ever know (`night.you`, 1% a night, more as the days go); a hand at an inquiry raised
against its owner's own leaning (`verdict.contrary`, 2%).

The exceptions, each for a reason:

1. **The calendar**: five days, three slots a day (two on a short day). It is the frame the season is played in.
2. **The counting**: the meters (nerve, wounds, the rite) and their limits (nerve at nothing is madness, wounds at the
   limit death, the rite at its end opens the gate), the word each meter shows (below) and the casebook's word for
   each person's trust, the ending's score, and which of the endings a season comes to, which follows from what
   happened. What they show is exactly what stands; the chance is in what happens, not in the arithmetic.
3. **A step of trust or suspicion is one step.** Both are short scales (trust from −2 to 3, suspicion from 0 to 3), and
   a step is their unit; whether anything moves is always a throw.
4. **The truth, once dealt.** The dice deal the cast's parts, temperaments, likes and habits, the power below, its
   signs, titles and ward; after that they are simply what is true. A cultist is a cultist; what anyone says about it is
   a throw.
5. **The inquiry's verdict.** Once the camp backs an inquiry, the accused's true part comes out (a seal in their kit, or
   every answer true). As in Mafia, where a player put out shows their card, this is what anchors the deduction: without
   it you could never learn whether you were getting anywhere, and the inquiry would be a coin tossed in the dark.
   Whether the camp backs you is a throw for every hand. So too with what you catch with your own eyes, once the throw
   to catch it has gone your way: one of the cult caught at your tent in the night, or turning on you below, is
   unmasked; the Watcher seen at your tent with the lamp is the Watcher.
6. **The cult never confesses to being the cult.** It may tell the truth about other things, slip, flinch, blurt what
   only the attacker knew, or be named by a witness; but its faith does not break of itself. One confession would end
   the mystery for nothing, and the cult is meant to be hard to find.
7. **Presentation**: faces in the pictures, the casebook's words, the ending page's wording, the epilogues, the music.
   These are fixed by the season without the dice (`hash01`), so that drawing or reading never changes what happens;
   they decide nothing.
8. **Who the people are.** A priest keeps his vows: Père Anselm flirts with nobody and pairs off with nobody. Flirtation
   in the camp is only between a man and a woman, and toward you comes only from the women at the dig. These are part
   of who the cast are, like their names.

## The season

- **Five days** of three slots each (morning, afternoon, evening), each followed by a night. Some days have only two
  (`start.shortSlots`: a shamal; the day after the camp walked out on your inquiries, when the diggers mostly will not
  dig), and then there is no evening at camp, and no inquiry.
- **A mood** of its own, which drifts as the season goes and decides how much happens of itself (below).
- **The rite** starts at `start.doom` (1) and the gate opens at `start.doomMax` (12). Every night adds about
  `night.rite` (1.3) for each cultist still free (now and then a step more or less), and more against one who sits still
  (`adapt.idleRite`: how the cult reads you, below). Exposing a cultist sets it back about `inquiry.doomRight` (2); a
  wrong accusation advances it about `inquiry.doomWrong` (2). From `start.doomStir` (5) the scorched circle at the foot
  of E-meslam is seen to widen now and then (`night.riteNote`); from `start.doomWarn` (8) you are warned every dawn, as
  the meter itself would tell you. If it completes, the descent begins at once.
- **You**: nerve `start.nerve` (10), wounds `start.wounds` (3). Nerve at zero: madness. Wounds at the limit: death.
  During play nerve, wounds and trust are never told in numbers, only in words ("your nerve frays", "you are badly
  wounded", "trusts you more now"); a loss of `scale.severe` (2) or more is told as a great one, and so is a gain of
  more than that. The meters (in words: below) and the casebook's word for each person's trust (hostile, strained,
  reserved, cordial, warm, devoted) show where you stand. Nerve comes back with rest, brandy, good news and now and then
  good company; a passing doctor may see to a wound. Exposing a cultist gives none back.
- **How you keep the casebook** is your reply to the Trustees' wire, the first thing a new expedition asks after who you
  are: "Accept stop God help me" (the usual way) or "Accept stop shall trust only my own judgement" (**hardcore**). It
  holds for the whole season; only the next expedition asks again. Played hardcore, the casebook keeps only the bare
  record of what you heard, saw and found: it does not mark the habits that turn up at a scene, file what is said of
  each person on their card, say whom a trace or a sighting fits, flag accounts that disagree, point out two people
  claiming one part, or show on a card who in the camp suspects that person in earnest. The casebook otherwise does all
  of these. Neither way does anything tell you how strong a case is (at an inquiry each name shows only your own mark).
  The ending notes a season played by your own judgement.
- **Backgrounds**
  - *Philologist*: translating is easier (+`study.philologist`) and costs less, a fragment sometimes gives an extra
    line, starts with 3 fragments and knows one old title (misremembered, once in a hundred seasons:
    `study.misremember`); the counter-rite is easier.
  - *Old soldier*: pressing is easier (+`talk.pressSoldier`), examining too (+`examine.soldier`), carries a revolver,
    and dies only at the fourth wound (`start.woundsSoldier`; anyone else at the third, `start.wounds`).
  - *Occultist*: talking with a cultist, may feel a chill (`talk.chillCult`, 30%, once a conversation), and now and then
    a false chill beside someone innocent (`talk.chillOther`, 5%), which the trade's own words in the Kit leave for you
    to find out. Wards and the rite are easier below; knows one tablet line; but has only `start.nerveOccultist` (8)
    nerve.

## The meters, in words

The top panel shows nerve, wounds and the rite as a word each, never as a number, and never says where a limit lies
(its tooltip says only what the limit means: "lose all of it and you go mad"). Each word covers a band, and its colour
darkens as things get worse. The bands are presentation, so they live with the screen (`METER_SAY` and `meterState` in
`ui/scene.js`), but the rite's keep step with what the dawns say of it:

| Meter | Its words, from best to worst |
| --- | --- |
| Nerve | *steady* (at least 85% of the most you can hold), *uneasy* (65%), *frayed* (45%), *shaking* (less), *near breaking* (2 left), *breaking* (1 left) |
| Wounds | *none*; *slight* (three or more still to spare: only an old soldier, after one); *serious* (two to spare); *grave* (one to spare) |
| The rite | *faint*; *stirring* from `start.doomStir` (5), when the scorched circle is first seen to widen; *growing* (6); *strong* (7); *close* from `start.doomWarn` (8), when every dawn warns you; *at the threshold* (a step short of the gate); *complete* |

## The season's mood

Every season has a mood (`TENOR` in `rules.js`, `game/tenor.js`): **still**, **uneasy**, **haunted**, **full of talk**
or **full of comings and goings**, dealt at the start (`TENOR.start`: still and uneasy 3 each, the others 1.5) and
drifting as the season goes. It decides how often things happen of themselves, strand by strand, × the usual
(`TENOR.moods`):

| Mood | Dread | Talk | News | Finds | Watch | Taken | Swing | Peril | Spite |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Still | 0.55 | 0.35 | 0.35 | 0.7 | 1.35 | 0.85 | 0.85 | 1.7 | 1.2 |
| Uneasy | 1.1 | 0.8 | 0.6 | 1 | 1 | 1 | 1 | 1 | 1 |
| Haunted | 1.8 | 0.55 | 0.45 | 1.25 | 0.9 | 1.35 | 1.1 | 0.8 | 0.7 |
| Full of talk | 0.6 | 2 | 0.5 | 0.8 | 1.1 | 0.9 | 1.35 | 0.7 | 1.7 |
| Full of comings and goings | 0.75 | 0.7 | 2.2 | 0.9 | 0.8 | 1 | 1 | 1.3 | 0.8 |

- **Dread**: horrors of their own accord, horrors when you search (up to twice as often), and the uncanny among the
  morning's news. Where dread runs above 1 the power shows itself more: a sign not yet seen may come with the morning's
  own (`TENOR.omen` × (its rate − 1)); and you grow used to its horrors, which now and then cost no nerve at all
  (`TENOR.numb` × (its rate − 1)). Where it runs at 1 or below, both still happen, if hardly ever (below).
- **Talk**: the morning's talk (`morning.talk`), talk overheard as you go (`day.overhear`), and, more softly, dreams
  told aloud, remarks in passing and flirtatious greetings; and the camp's own news (a quarrel, a feast, coffee with the
  headman, the diggers' song).
- **News**: the world outside: the weather, visitors, the post.
- **Finds**: the diggers' finds tray. **Watch**: how much you notice of people's habits as you go. **Taken**: how often
  the dead are the power's own work. **Swing**: how far the evening's mood swings at an inquiry.
- **Peril**: the dig's own dangers, which are nobody's doing (a collapse, a fall, bad water, a dog, a snake, the
  afternoon heat; below). **Spite**: harm done you in secret by night by someone who cannot stand you (below).
- Talk and news are quieter the first days (`TENOR.ramp`, by day).
- **Every mood has its danger.** A still season has the fewest horrors and the most accidents; a haunted one, the
  horrors and the power's own hand; a season full of talk turns to spite; one full of comings and goings brings the
  dig's own dangers as well as the world's news.

**One thing brings another.** Each happening warms its strand (`TENOR.heat`, at most `heatMax`; the warmth halves each
dawn, `cool`); some news makes other news likelier later (`after` in `EVENTS`: a dealer brings the inspector, rain lays
open a grave, a quarrel brings the diggers' song); and a quarrel may flare up again at a later breakfast (`TENOR.feud`).

**What comes seldom weighs more.** A happening of a strand running below 1 is heavy at `TENOR.heavy` × (1 − its rate): a
horror one degree worse; news twice as strong (two lines from the Museum, two fragments washed out, two people warmer
for the coffee, a shamal that blows a second day, a heavier blow from the Trustees); talk true to what the speaker
knows, and heard by more of the camp (× `camp.heavy`). Where talk or news runs high, a second piece may come the same
morning (`TENOR.second` × (its rate − 1)).

**Nothing is ruled out.** Wherever a strand's distance from 1 makes a chance (a second sign, a horror grown used to, a
heavy happening, a second piece of talk or news, the mood's turning), that distance is never taken as less than
`TENOR.floor` (2%): a still season may yet bring a second sign some morning, and a haunted one a heavy horror.

**A morning holds only so much.** Besides its core (the night, the trace, the sign, grief for the night's dead), each
thing a morning brings of itself (a second sign, a find, a dream told aloud, the morning's talk and news) leaves less
room for the next: each comes at `TENOR.crowd` (0.45) × its chance for every one already told that morning, or
`TENOR.crowdFav` (0.75) × when the mood favours it (its strand, or the finds, running above 1); and what the mood
favours is told first. So a busy morning is rare, and when it comes it is the mood's own kind of busy.

**The mood drifts.** Each dawn it may turn, at `TENOR.drift`, + `TENOR.pull` for each thing since the last dawn that
drew it elsewhere and − as much for each that held it, never above `driftMax` or below `TENOR.floor`. It turns into one
of its neighbours (`TENOR.next`, by weight: below), each weighted × (1 + whatever drew it there; a pull toward a mood
that is no neighbour counts toward unease, the way there). What draws it (`TENOR.pulls`): every happening, toward its
strand's mood; a murder, toward talk; the power's own touch on the dead, toward the haunted; the rite stirring (every
dawn from `start.doomStir`), toward the haunted; an innocent sent away, or an inquiry refused, toward talk; one of the
cult unmasked, toward stillness; a day when nothing happened of itself, toward stillness. Nothing says what the mood is:
you feel it in the camp as you arrive, in the nights and in the first light of each day (a day cut short by a strike or
the dust has its own), and a morning may tell of a turn (`TENOR.told`). The ending names the season's course.

| From | Into, by weight |
| --- | --- |
| Still | uneasy 2.5, haunted 1, comings and goings 1, talk 0.6 |
| Uneasy | still 1, haunted 1.5, talk 1.5, comings and goings 1 |
| Haunted | uneasy 2, still 0.8, talk 0.8, comings and goings 0.4 |
| Full of talk | uneasy 2, still 0.5, comings and goings 1, haunted 0.7 |
| Full of comings and goings | uneasy 2, still 1, talk 1, haunted 0.5 |

So no mood leads to one other mood only: a haunted season may calm down, or turn to talk, or to the world's news, and so
on, each by its own way.

## The cast

Seven people, dealt seven parts every game: **two cultists** (one is the hierophant), **the Dreamer** (dreams the truth
about one person each night, all but always, the night Crane died among them: a dream, true or invented, is the same
dream all that day), **the Watcher** (watches over someone each night), **the smuggler** (out at night on business of
their own), and **two innocents**. The parts are dealt before anything else in the season, by a fair shuffle of the
cast and nothing else (`dealParts`, `game/state.js`): any two of the seven may be the cult, each pair as likely as any
other (1 in 21), and which of the two is the hierophant is picked at the same moment. Which part each claims is their
own to decide, the cult's as anyone's (Claims in Crane's diary, below). Each also has three habits (boots, tobacco, scent) that match the traces left at attacks, a
**temperament**, and **likes and dislikes** for everyone, you included.

## A slot

Choose a place. Where people go is weighted by `places` (camp 3, trench 3, magazine 2, village 2, ziggurat 1, canal 1.5,
graves 1); in the evening `evening.camp` more at camp, and the cult to the ziggurat and the graves. People keep away
from someone they cannot bear (`company.avoid`) and now and then go where a fond friend already is (`company.follow`);
by day the cult mostly keeps clear of its own (`company.cultApart`), the better not to be seen together.

- **Talk** to someone there (below).
- **Search** the place: tablet fragments, signs, objects, horrors or nothing, by the place's own odds (`LOCS` in
  `data/world.js`), as often as you search it. A charm hidden there turns up at `search.charm` (85%) each search of it,
  so it may take another; and the same hole then often gives up something besides (`search.more`, 50%: anything a search
  may find, though nothing and horrors weigh only `search.moreOdd`, 0.3, of their usual). Now and then a fragment comes
  in two pieces of the same tablet (`search.twoFrags`, 8%). The site plan draws every search as a small test pit beside
  the place, and the Kit tab lists the places searched.
- **Examine** a fresh scene (`examine.odds` 70%): a genuine trace may give up a second habit of the attacker
  (`examine.more`, 60%, unless the attacker was tidy; a careless attacker's two traces are both shown genuine, and may
  give up a third); a smuggler's trace is shown to be a thief's; a trace left by someone who had been there earlier is
  shown to be older than the night; an innocent's trace laid by the cult is shown to be planted, and now and then the
  attacker's own is found beneath it (`cunning.underneath`). The scene can mislead you, too (`examine.misread`, 15%; ×
  `misreadTwo`, 0.2, when two traces lie side by side): the attacker's own trace taken for an older one, or an older one
  taken for the attacker's. A scene that will not read may keep something for another look (`examine.again`, 20%).
  Whatever turns up belongs to the night of the attack, not to the day you looked; and once in a hundred traces the
  habit it shows was not its owner's own that night (`examine.smudge`).
- **Translate** a fragment at camp (`study.odds` 62%): about `PUZ.lines` (4) lines (now and then three or five), leaning
  toward what you chose to look for; one line in a hundred is a scribe's error, and false (`PUZ.scribe`). Reading costs
  nerve, the more the more you know: about a point of it at `study.cost` (50%) + `study.costLine` (3%) for each line
  you knew already, at most `costMax` (90%; a philologist × `costPhilologist`, 0.75), and about two at `worse` (20%) +
  `worseLine` (2%) per line known; signs that will not come clear cost a point all the same at `failCost` (40%), and a
  failure may crumble the fragment (`crumble`, 30%). At night the words may come back to you (`study.linger`, 1.2% per
  line you know, at most `lingerMax`, 40%) for another point. So reading alone can drive you mad: the more of the
  tablets you know, the more each new line weighs.
- **Rest** at camp: about +`day.rest` (2) nerve. **Brandy**: about +`day.brandy` (3), no time.
- **Inquiry**, at camp in the evening, once a day, while the camp will still hold one: accuse anyone before the whole
  camp, if the camp will back you (below).
- **The deed**, once a season, at camp in the evening instead of an inquiry (even once the camp will hold no more of
  them): settle it yourself that night (below).

After an action you may notice someone's habit (`day.noticeHabit` × the mood's watch; once in a hundred, one of that day
only, which is not theirs: `day.misnote`) or overhear gossip (`day.overhear` × how often talk comes), and something may
find you whatever you were doing (below).

**The dig's own dangers.** After any slot the dig itself may hurt you, at `peril.base` (5%) × the season's peril × the
place's own (`peril.at`: the trench 1.4, the ziggurat 1.2, the graves 1.1, the canal 1, the village 0.8, the magazine
0.7, the camp itself 0.2), × `peril.noon` (1.3) of an afternoon, when out on the tell it is the heat that has you at
`peril.heat` (40%), and × `peril.afterHorror` (0.5) on a slot a horror already found you. Shoring that gives way, a
fall, a grave that opens under you, bad water, a snake, a pariah dog, a shelf of boxed tablets, a tent pole, the cook's
primus, the sun: mostly a wound, now and then nerve (the words are in `data/hazards.js`). A wound from them can kill
you, as any other.

## Horrors outside the tomb

The mound does not wait to be dug. After anything you do by day, a horror may come of its own accord: at `dread.base` +
`dread.day` × the days gone + `dread.doom` × the rite's progress, so rarely on the first morning (about 1.5%) and far
more often on the last (about 8%): about one a season, × how often dread comes in the season's mood. It belongs to the
place you are in or to anywhere (`dread.here`), and grows worse with the rite: one nerve while it is young; one or two
(`dread.worse`) from `dread.tiers[0]` (4); two from `dread.tiers[1]` (8), when the tell itself breathes; a degree worse
when dread comes seldom, and now and then nothing at all where it comes often (above). At night a horror of the night
may come too, at the same chance (× `dread.night`), seldom on a night that came for you (× `night.calm`, 0.3). None of
them is a sign of any power.

## The inquiry, and the camp's verdict

Nobody is sent away on your word alone. You lay out your case, and everyone else still at the dig raises a hand with
you, speaks against it, or says nothing; the hands are shown by name, and the casebook keeps every inquiry.

- **The case** you can make against someone (at most `verdict.caseCap`, 3): +`verdict.trace` (1) for each trace at a
  scene that fits a habit of theirs you have seen (+`verdict.genuine`, 1.5, if examined and genuine; a trace seen to be
  a thief's or planted counts for nothing), +`verdict.strong` (1.5) for each slip, slip of the tongue about the night or
  witness against them, ±`verdict.dream` (0.75) for each dream of their guilt or innocence, +`verdict.failwatch` (1) for
  a sworn watch slept through, +`verdict.flinch` (0.5) for a flinch at what you show them (an old charm, a find, the
  tablets' words) or a hint at their nights, +`verdict.sight` (1) for each sighting in the dark that fits a habit of
  theirs you have seen, +`verdict.lie` (1) for each account of a night that the person they said they were with does not
  bear out, +`verdict.there` (0.5) for each account of a night that puts them, by their own word, where it
  happened, +`verdict.spite` (0.5) for being caught at your tent in the night, meaning you harm, +`verdict.distrust`
  (0.25) for each distrust voiced. The camp no longer weighs the word of one of the cult unmasked, nor the dreams of
  someone who has owned that they never dreamed. Nothing tells you how strong your case is: that is yours to judge from
  the casebook.
- **Each of the camp**, the cult among them, weighs it: their own suspicion of the accused (0 to 3; the thief who saw
  them at it, 3) + the case + `verdict.trust` (0.5) × their trust in you + how far they take your word −
  `verdict.like` (0.75) × their liking for the accused + `verdict.fear` (0.15) × the night's dead so far (at most
  `fearCap`, 4) − `verdict.anger` (0.25) × the camp's anger − `verdict.again` (0.5) for each inquiry of the last
  `againDays` (2) evenings that it refused or that sent an innocent away (the camp tires of inquiries that come to
  nothing) ± up to `verdict.mood` (1) for the evening's mood, the same for everyone in the tent (× the season mood's
  swing) ± up to `verdict.whim` (0.75) of their own. At `verdict.back` (1.8) or more they side with you; below
  `verdict.against` (0.5) they speak against it; between, they say nothing. Now and then a hand goes the other way from
  its owner's leaning (`verdict.contrary`, 2%: a whim, a slip).
- **Your word.** At first most of the camp gives a newcomer the benefit of the doubt: `verdict.word` (0.5), + their
  temperament's `word` (the light-headed and conscientious readier, the suspicious, detached and calculating slower), ±
  up to `verdict.wordSpread` (0.4) for who they are. Then, each by chance: once one of the cult is unmasked, more by
  `verdict.gain` (0.5) at `verdict.proven` (+`provenBacked` if they stood with you); once an innocent is sent away, less
  by `verdict.loss` (0.75) at `verdict.doubt` (+`doubtFriend` if they liked the one sent away, − `doubtShared` if they
  stood with you, − `doubtCase` × how strong your case was); once they have refused an inquiry, less by `lossRefused` at
  `doubtRefused`; never below `wordMin` or above `wordMax`. So a first shot on a thin case often passes, lucky or not;
  after an innocent sent away the camp wants more, but not always; after one of the cult unmasked it takes your word
  more readily, but not always; and an inquiry every evening that comes to nothing soon gets nowhere.
- **The cult** raises its hands as anyone in its place would, from the suspicion it lets show, so that its hands,
  counted over a season, look like everyone's. Its own interest leans on them only a little (`verdict.cult`), by its
  craft (`CRAFT`): against an innocent, +`push` (0.6) × its craft's `push`, toward seeing them sent away, the more once
  it has read you as one who leans on inquiries (below); for one of its own, −`defend` (0.45) × its craft's `defend`.
  But one of its own who looks lost (a case of `verdict.someCase`, 1.25, or more, as it looks to you: "some evidence";
  or two of the camp suspecting them in earnest) it may give up outright, at `bus` (0.5) × its craft's `sacrifice`, and
  then leans `give` (2.5) toward you. So a real case against one of the cult may split the cult's own hands.
- **The verdict** passes with at least `verdict.need` (2) on your side and more on it than against it; with nobody left
  at the dig to raise a hand, it is the police corporal from Hillah who takes your word, or not (`verdict.alone`, 80%).
  Every raised hand is said before everyone and settled when the truth comes out: who was right gains credit, who was
  wrong is suspected by some of the camp.
- **Refused**, the accused stays, and holds it against you, whatever they are: for good as a rule (`verdict.grudge`,
  90%: trust −2), else as one turned against you (−1); now and then they half understand, and it costs only a step
  (`verdict.forgive`, 5%; twice as readily for the honest, the conscientious and a friend). If they are one of the cult,
  the cult knows you are close (`verdict.alerts`, 90%: as if you had confided in it). You lose about a point of nerve
  (`inquiry.nerveRefused`, 1).
- **Wrong**, someone outside the cult is sent away and holds it against you the same way; the rite gains about
  `inquiry.doomWrong` (2), the camp is angered (below), and you lose about two points of nerve (`inquiry.nerveWrong`,
  2), unless it was the thief (a thief caught is a thief caught, though it counts as a wrong accusation in everything
  else).
- **Proven right**, each of the camp who stood with you may trust you the more for it (`verdict.stood`). The one
  unmasked may shout a line of the old liturgy at you from the truck (`inquiry.shout`, 70%: a tablet line about the
  power below, all but always, `PUZ.patronLine`, 90%). Unmasking the last of the cult wins the season, all but always:
  now and then the rite has come too far to die with its priests, and the gate opens of itself (`inquiry.tooLate`, 3%; ×
  `tooLateNear`, 3, once the rite is close), and the descent begins that evening, with nobody of the cult left in the
  circle.
- **The camp's anger**: about +`verdict.wrong` (2.5) for each innocent sent away, about +`verdict.refused` (1.5) for
  each inquiry it refused, about −`verdict.right` (1) for each cultist unmasked. After a day without an inquiry it cools
  overnight by `verdict.cool` (0.5), but not below `verdict.wrong` for each innocent sent away, except on the rare night
  it lets go of that too (`verdict.forget`, 5%): the camp forgets a refused inquiry in time, if you give it time, and an
  innocent sent away hardly ever. The inquiry tells you when the camp is restless, when its patience is nearly gone, and
  when it is tired of inquiries that came to nothing. After an inquiry that went against you, from `verdict.walkoutFrom`
  (3) of anger, it may walk out, at `verdict.walkoutStep` (20%) for each step of anger from there, never certain: no
  more inquiries, and the next day the diggers do not dig (`verdict.strike`, 85%, else Hamid talks them round; two
  actions; not on the last day, which has no tomorrow). Each dawn after, a camp that walked out may think better of it
  and hear you again (`verdict.relent`, 10%, + `relentDeath`, 15%, the morning after a death).

In the build-26 simulations (How seasons end, below), about three inquiries in ten pass (30%), and as often against one
of the cult (29.5%) as against anyone else (30.5%).

## The deed: justice in your own hands

Once a season, of an evening at camp, you may settle it yourself instead of calling an inquiry (`RULES.deed`,
`game/deed.js`), from the third day (`deed.from`, 3), even once the camp will hold no more inquiries, but never on the
last evening, whose night belongs to the dark of the moon: "There is only one way to stop this." You choose whom (your
mark beside each name, never how strong the case looks), with what (your revolver, if you have it: sure, and loud; or a
knife from the cook-house: quiet, if your hand is steady), and whether to leave someone else's habit by the tent, as
you have noted it (so a habit noted wrongly points at whoever truly has it, or at nobody). The evening is spent, and
there is no inquiry. Nothing ever tells you whether you were right, but the ending.

The night goes as any night, by its own dice. In the small hours, after the cult has been, you go:

- **Away.** Whoever you went for is not in their tent, about as often whoever they are: dead already, at the cult's
  hands; the one of the cult who did the night's work, not back yet (`deed.away.errand`, 10%); the thief, still out at
  work (`away.thief`, 8%); two lovers, still out somewhere quiet (`away.tryst`, 60%); or anyone, up and about at that
  hour (`away.restless`, 8%). About a point of nerve (`deed.cost.away`: [nerve, wounds] 1, 0).
- **Watched.** The Watcher over them that night, if still alive, drives you off, all but always (`night.watched`, 90%),
  and may know you (`deed.knows`, 60%). About two points of nerve (`cost.watched`: 2, 0).
- **Done**, at `deed.kill` (a knife 60%, the revolver 85%; an old soldier +`soldier`, 10%). They are found at first
  light, dead in their cot, and mourned like any of the night's dead. About three points of nerve (`cost.done`: 3, 0).
- **Fought off.** Otherwise they wake and fight you off, and may have seen your face (`deed.wakes`, 45%). About two
  points of nerve, and a wound (`cost.failed`: 2, 1); if that wound is your last, the ending tells it.

Someone may pass you between the tents (`deed.seen`, 18%, × the means' `noise`: a knife 1, the revolver 2; × `quietly`,
0.5, if you never reached the cot); if the Watcher was watching your tent, it is the Watcher. Having reached the cot, you
may leave a trace of your own without knowing it (`deed.trace`, 30%: a horn button), besides any habit you laid. If the
cult came for you that night, it found your tent empty. If it was the last of the cult you killed, you carry on in the
dark, none the wiser, and the descent finds the circle empty.

**The morning after**, whoever knows it was you (the one who woke, or the Watcher who drove you off, if they knew you;
or whoever passed you) may tell the camp before breakfast (`deed.tell`, by their trust in you: 60% at −1 or lower, 35%
at 0, 15% at 1, 5% from a friend; + `cultTells`, 5%, from the cult; + `sure`, 25%, if they saw your face), else hint at
it (`deed.hint`, 60%), else keep it to themselves. The camp's suspicion of you runs from 0 to 3, and rises a step for
each thing it has against you: a hint; your button, linked to you (`deed.link`, 40%); your tent found empty the night
they came for you; a shot you fired, laid at your door (`deed.shot`, 35%); the habit you laid seen for what it was
(`deed.plantSeen`, 30%) and linked to you (`plantLink`, 30%). A habit not seen through is taken for its true owner's,
and the camp looks at them (`camp.planted`, below). If whoever you went for was away, nothing comes of it but, at most,
a hint (half a step). Otherwise the cult, whoever you went for, hears what the camp hears and guesses at what it does
not: it learns it was you (`deed.cultKnows`, 50%; × `unseen`, 0.4, if nobody told, hinted or tied your button to you),
and then knows what you are, as if you had confided in it. The camp talks the more readily that morning (× `deed.talk`,
2).

**The camp's judgement.** Told it was you, the camp judges you at once; suspecting you at 2 or more, it does so that
morning at `deed.vote` (45% at 2, 75% at 3), and at each later dawn at `later` (half) of that. Each of the camp leans by
its suspicion of you (+`judge.caught`, 1, if someone told), +`judge.friend` (1) for a friend of the one you went for,
the one you went for +`judge.victim` (3), if alive, −`judge.trust` (1) × their trust in you, +`verdict.fear` × the
night's dead so far, +`verdict.anger` × the camp's anger, +`judge.cult` (0.3) × the craft's `push` for the cult, ± the
evening's mood and their own whim, as at an inquiry. At `judge.expel` (2.2) or more they would send you away; below
`keep` (0.6) they speak for you; between, they say nothing. With at least `verdict.need` (2) for sending you away, and
more of them than speak for you, you are put on the truck to Hillah, and the season ends (*The Truck to Hillah*).
Otherwise you stay: the camp angers (+`deed.angered`, 1) and lets its suspicion of you go a step (`cleared`, 1), and
those who would have sent you away trust you less.

The ending counts the deed against you, and a killing names your style (Endings, below).

## Conversations

Two questions to a conversation (`talk.questions`), then you take your leave; now and then the talk runs to a third
(`talk.longer`, 8%) or is cut short after one (`talk.shorter`, 8%), and the page says so in words (one in no hurry today,
after the second question; one with little time today, after the first). Thinking better of it before you have asked
anything is no conversation. What you say, and much of what is said back, comes in several tellings, gone through in
turn so that nothing is said the same way twice running (`data/variety.js`; `tellOne`, `tellAt` in `core/text.js`:
chosen without the dice). Anyone, however they feel about you, may be having a bad day: they keep it short, refuse a favour or
will not name names (`talk.offDay`, 5%, × how readily their feelings show; × `offDayFriend`, 0.4, with a friend).

| Option | What it does |
| --- | --- |
| Make conversation | One of their habits, mostly (`talk.habit`, 65%); a scholar may share a tablet line (`talk.scholarLine`; one of the cult shares none about the power below or its ward); the talkative pass on gossip; you may glimpse their temperament (`talk.mien`); now and then a word about someone they feel strongly about (`talk.feel`, a little more or less often with the season's talk): fond of them, cannot stand them, or taken with them (true to their feelings, but for now and then the opposite, × how untrue their gossip runs: `talk.feelFalse`; and no cultist speaks of the other); small talk may warm them (temperament `chat` + `talk.warmth`; a cultist no more readily than anyone, except toward an occultist, whose interests it may half share: +`cunning.charm`); with someone mourning the night's dead, the day it happened, your company may comfort them instead (`talk.comfort`; trust +1, as far as devoted); with a friend (trust ≥ 2) it may steady your nerve a little (`talk.company`). Someone at trust ≤ −1 keeps it short, if they let it show (`talk.cold` × manner). |
| Where were you last night | Their account of the night and anything they saw (below). Someone at trust ≤ −1 may keep a sighting back (`talk.withhold`), though not well. |
| Crane's diary | The part they claim: Dreamer, Watcher, none, or (the honest, hiding something) no answer at all; now and then someone with nothing to claim will not say either, whoever they are (`claims.evadeAny`, 3%; the honest, `evadeHonest`, 15%). A liar may give themselves away (temperament `tell`). |
| Whom do you distrust | A dream, if they claim to dream (the Dreamer mostly, `talk.dreamTell`, 85%; a pretender now and then, `dreamAnswer`); otherwise a name, or a refusal, mostly in their temperament's own way (`talk.ownWay`). The innocent name whom they suspect most, if anyone in earnest (`talk.nameSuspect`), and a fond friend only on the strongest suspicion (or, hardly ever, out of sorts: `scale.rarest`). A thief who saw something hints at it (below). |
| What does this title mean | Anselm, Ilse and Zahrun gloss an old title. |
| Show something | How they take a charm (fear, calm, a dealer's greed: the thief's at `talk.greed`, anyone's now and then, `greedOther`, 4%, twice as readily the liar and the calculating); Anselm and Ilse read what a charm binds (a charm shown again is read as before). |
| Confide | Trust +1, if they take it (`confide.odds` 70% + 10% per trust + temperament; a cultist, an occultist's, +`cunning.listen`; −`confide.again` 15% for each confidence they have already taken). Whoever claims the watch, truly or not, and takes it at trust 2 or more swears to watch your tent, mostly (`talk.promise`, 85%); whoever claims to dream, at trust 1 or more, promises you their dreams as readily. A cultist confided in, whether it takes it or not, alerts the cult (`confide.alerts`, 90%). |
| Press | `talk.press` 40% + soldier + 5% per trust to shake something loose; it costs trust, whoever they are and whatever comes of it, all but always (`talk.pressCost`, 90%). Anyone shaken who keeps up a story they have told may give it up (`claims.pressed`, 45%, + the temperament's `confess`): a part claimed that is not theirs, the cult's in the same words as anyone's, or a true part hidden; the smuggler gives up the smuggling. A cultist, shaken, lets something slip at the temperament's `slip`; otherwise turns it aside: a word about the thief (mostly, when there is a thief to give: `talk.cultTip`, 75%; now and then naming someone else seen out at night, `tipWrong`, 8%), or the same indignation anyone pressed for nothing would show. Anyone else shaken with nothing of their own to give up may turn it aside the same way, now and then (`talk.pressTip`); and now and then an innocent, shaken, says something that sounds just like the cult's own words, out of fear (`talk.falseSlip`, 3%; the thief, `falseSlipThief`, 10%). |

Someone at trust ≤ −1 refuses favours (`talk.refuse`): no gloss, no reading, no name.

## Manner: what shows of a feeling

How someone feels about you does not always show, in the face or in what is said. Whether it shows depends on how strong
the feeling is (`manner.warm` at trust 1, 2 and 3; `manner.cold` at −1 and −2), on temperament (`MANNER.shows`: the
honest and the light-headed wear their feelings openly, the calculating and the detached hardly at all), and on the
moment: anyone may have a good or a bad day that has nothing to do with you (`manner.whim`). The casebook's word for
their trust is the one thing that tells you exactly (the counting, above).

- **Greetings.** Warm words from anyone who likes you (trust 1 or more) if it shows, cold ones from someone against you
  if it shows, otherwise an ordinary greeting, though a feeling held back may still show in the face (`manner.leak`). A
  good day greets you warmly and a bad one coldly, whatever they feel. A cultist courting your trust may put on a warm
  face it does not feel (`MANNER.mask`).
- **Faces.** Each answer's own expression is warmed or cooled by the feeling, when it shows. A lie that shows
  (temperament `tell`) shows on the face, as a practised liar's half-smile or anyone else's unease.
- **Flirting** looks coy mostly, but not always: a smile, a sly look, a wink. A joke about love and marriage
  (Constance's cigarette, a colonel's proposal by heliograph, three aunts and three cousins) is told with a sly face,
  mostly (`manner.joke`).
- **Partings.** As you leave, a lingering look from someone sweet on you (`flirt.parting`), a warm word from a friend
  (`manner.parting`), or a back turned by someone against you (`talk.coldParting`), each only if it shows.
- **About the dig** the same holds; those the camp suspects in earnest look worried, if it shows.

Faces drawn in pictures are decided without the dice, so drawing a picture again never changes the game.

## Traces and witnesses

Each attack leaves a trace of one habit of the attacker at the scene (the ground now and then holds none at all:
`night.swept`, 3%); or, at `night.smugglerTrace`, of the smuggler, out on their own business; or else, at
`night.strayTrace` (55%), if anyone else had been there that day (by the morning's placings) or that night by ill luck,
theirs, from earlier; or an innocent's, laid there by the cult (below). Unexamined, every trace looks alike, and habits
are shared: many in the camp wear the same boots or smoke the same tobacco. Where the night takes anyone but you is by
weight (`night.where`: the trench, the ziggurat, the graves, the canal and the magazine 1 each, the village 0.3).

Nobody's night is simple (`alibis`, `people/alibis.js`). On the night of each attack (and on a night the cult lay low,
everyone was somewhere all the same), everyone has an account. Friends spend the evening together (`pair`), wherever
anyone might be of an evening (`alibis.where`), but never where it happened out on the tell (whoever does the night's
work picks a place nobody is keeping company in); two who are sweet on each other may slip out somewhere quiet (`tryst`;
not there either) and, unless honest, swear they were asleep in camp (`hide`);
someone out alone may, by ill luck, have been where it happened (`astray`), be glimpsed there, or leave a trace there
earlier in the evening, and then lie about it out of fear (`fear` × how readily they lie; `alibi`, one out alone),
perhaps naming a friend as company (`fearFriend`), who may or may not bear it out (a cultist named so is glad of the
alibi and backs it, `cultCover`). The innocent otherwise tell the truth about their evening, except habitual liars
(temperament `lieSmall`). A cultist may claim an evening with someone who was alone (`cultPair`, 38%: so that the cult
claims company as often as anyone does), where that one truly was (never the Watcher, who keeps the camp, nor anyone
alone where it happened), so that the cult's evenings in company fall where anyone's do; a fond friend who bends the
truth easily may back the story up (`cover`); and now and then the attacker owns being out near the place,
rather than be caught lying (`bold`). Some saw someone pass in the dark and noticed one habit (`sawOut`, `sawFromCamp`):
the attacker, or whoever else was about there (`seenAstray`); the light-headed may misremember it (`mistake`); a cultist
who will frame an innocent invents a sighting (`frame` × temperament `frame`); and anyone sure of someone's guilt, or
who cannot bear them, may say they saw them too (`invent` × temperament `frame`). One who found the body, or was there
by ill luck, may let slip what nobody has told the camp, as the attacker may (`knew`): an innocent's slip looks like a
guilty one. A friend (trust 2 or more) who saw someone may tell you before breakfast, unasked (`talk.volunteer`).

And nobody's account is sure: one attacked and saved glimpsed a habit of the attacker's (`alibis.glimpse`, 15%); the
thief spends the night in camp after all (`smugglerIn`, 15%), tells the truth of his night (`thiefTruth`, 5%; an honest
one, `thiefTruthHonest`, 20%, else he will not say), will not say at all (`thiefEvade`, 10%), or lets fall what he saw
(`thiefMentions`, 5%); anyone may not say where they were (`evadeNight`, 3%); a friend who merely likes someone may back
their story too (`coverLike` × `cover`); the Watcher hiding the part speaks of the night as the Watcher would
(`watcherWords`, 50%); and anyone alone in camp may say they could not sleep (`upAnyway`, 15%).

So the innocent fall under suspicion as readily as the cult: they share its habits, lie out of fear or to hide a tryst,
were in the wrong place at the wrong time, and are seen, named and blamed. Now and then an innocent ends the season with
a case against them as strong as any cultist's.

**The thief as witness.** Out on his own business, the smuggler may see the attack: at `thief.witness` (8%) any night,
`thief.near` (50%) if he was where it happened, `thief.robbed` (40%) if his trace is at the scene. He says nothing (a
thief who saw a murder would be the next), and the camp sees nothing of it; but he hints: when you ask whom he distrusts
(`thief.hint`), and in his gossip (`thief.gossip`); and at an inquiry he votes against the one he saw as surely as
anyone who suspects them most; asked whom he distrusts, now and then he names them outright (`thief.outright`, 10%). The
one he saw is the one who did it, all but always (`thief.sure`, 95%; otherwise someone else about in the dark). When his
own story breaks, he names the one he saw, if they are still at large: mostly when you press him into admitting the
smuggling (`thief.pressed`, 90%); at `thief.own` when he comes clean of his own accord; at `thief.sent` when an inquiry
sends him away. Having named one, he names another he saw only seldom (`thief.again`, 30%).

## The cult's craft

The cult is clever, mostly, and some of it more than the rest (`CRAFT`, by temperament):

|  | Plants a trace | Offers to come down | Waits for the sanctum | Careless trace | Tidy scene | Slip of the tongue | Pushes an innocent out | Defends its own | Sacrifices its own |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Honest** | 1% | 20% | 1% | 15% | 15% | 30% | 30% | 80% | 5% |
| **Conscientious** | 12% | 30% | 10% | 10% | 30% | 18% | 40% | 60% | 15% |
| **A liar** | 30% | 45% | 25% | 6% | 35% | 10% | 60% | 40% | 35% |
| **Calculating** | 38% | 55% | 40% | 3% | 50% | 5% | 45% | 25% | 55% |
| **Detached** | 15% | 20% | 20% | 8% | 35% | 12% | 30% | 30% | 20% |
| **Light-headed** | 10% | 40% | 5% | 30% | 5% | 35% | 60% | 70% | 10% |
| **Suspicious** | 22% | 25% | 15% | 10% | 30% | 15% | 55% | 50% | 25% |

- **A planted trace** (`plant`): the attacker lays the trace of an innocent it dislikes (never of that night's victim).
  Unexamined, it looks like any other trace; examined, it shows for what it is.
- **A sworn watch.** One of the cult who claims the watch swears to watch your tent as anyone who claims it would
  (confided in, or staging a coming clean to you alone, at trust 2 or more: below). That night the cult is torn between
  its cover and what it knows of you (your confidences, an enemy among it), and acts on what it knows only half as
  readily (`night.holds`, 50%): no more and no less than it takes for a broken watch to say about as much of anyone who
  swore it, since one of the cult who swore it was mostly confided in, and so knows you. If nothing came for you, the
  ending counts the promise kept.
- **Courting you**: a warm face where there is no warmth (`MANNER.mask`), and the same indignation as anyone when
  pressed for nothing; but no readier trust than anyone's, except toward an occultist, whose interests the cult may half
  share: a little warmer in small talk (`cunning.charm`, 8%) and readier for your confidences (`cunning.listen`, 5%).
- **Careless** (`sloppy`): the attacker leaves a second trace of its own at the scene.
- **Tidy** (`tidy`): the attacker leaves nothing else behind. Examining its trace shows it genuine (unless the scene
  misleads you, above), and gives up no second trace.
- **A slip of the tongue** (`blurt`): asked about the night (half as often, in small talk), the one who did it lets slip
  something nobody has told the camp: when it happened, how the body lay, where they came in. Once a night.
- **Below**, it offers to come down with you before you ask (`volunteer`), seldom when two of the camp suspect it in
  earnest (× `cunning.suspectedOffer`, 0.2), and less readily when you hardly trust it (an offer from a near-stranger
  would look odd); and a patient one lets the fourth gate pass and betrays you at the very end (`patient`, below).
- **Under the bus**: once its partner looks lost, a cultist may name it before anyone else does, to look clean
  (`cunning.bus`, 0.1, × its craft's `sacrifice`): in a false dream, asked whom it distrusts, or blaming aloud at
  breakfast.
- **One of its own** (rarely): when one of the cult is all but caught (a strong case against them, two of the camp
  suspecting them in earnest, or an accusation before everyone), the other may kill them, at `night.betray` (0.4) ×
  `sacrifice`, × `night.betrayLess` (0.3) on the first night and × as much again if the killer is under any suspicion
  itself: a death among the suspected looks like the cult's work on an innocent. It is told like any murder by the
  cult's own hand, with a trace at the scene as on any night; the Watcher may happen to drive the killer off. Only the
  ending tells it for what it was.

## How the cult reads you

The cult watches how you hunt it, and turns its craft against whatever you lean on (`RULES.adapt`; `cultReads` and
`cultTurns` in `people/cunning.js`). For six of the ending's styles (below), it counts as much of that style's own count
as it can see for itself as the season goes (`STYLE_SO_FAR`: not what comes only below, nor your casebook's marks, nor
the times you thought better of something), and sets it against an ordinary season's pace of that same count by that
day (`READ_MU` × the share of the season gone, in spreads of `READ_SD` × the square root of that share). Its reading
runs from nothing, at an ordinary pace or slower, to the whole of it at `adapt.z` (2) spreads past; and it works
against that way the more readily, by up to `adapt.gain` (50%), as far as it reads you that day (its turn: × 1 to
1.5):

| You lean on | It counts | It turns |
| --- | --- | --- |
| The scenes (the detective) | scenes examined, nights asked about, sightings heard, the diary asked about | more planted traces and more ground swept (× its turn on `plant` and `night.swept`) |
| Inquiries (the inquisitor) | pressing, accusing (backed or refused), asking whom they distrust, those turned against you | pushes harder at an inquiry for an innocent to go (`verdict.cult.push`), and comes the quicker for you once you have made an enemy of it (`night.enemy`) |
| Your friends (the confidant) | confiding, asking about them, the trust and the friends you have, pretences dropped before the camp | takes those who trust you first (× its turn on `victims.yourFriend`) |
| The tablets (the scholar) | translating, readings and glosses, tablet lines known | comes for you for no reason you will ever know (× its turn on `night.you`): a lamp burning late |
| The ground (the digger) | searching, charms found | the same (the greater of the two turns): someone poking at its hiding places |
| Sitting still (the quiet guest) | resting, and never having accused anyone | grows bold: lies low less (÷ its turn), and the rite grows faster, × (1 + `adapt.idleRite`, 0.6, × (its turn − 1)), at most × 1.3 |

Nothing tells you. The ending says from which day it had your measure: the day its reading of a way first came to
`adapt.told` (half of it, a spread past an ordinary pace).

## The night

The night's page is told in parts, each under its own heading, so that what follows from what is plain: *In the
night* (how the evening ended, the night itself, your own dream if one comes), *At first light* (the dead and their
trace, the camp's grief, the sign, the scorched circle, the mood's turning), *At breakfast* (dreams and the morning's
talk) and *The day's news*. A part with nothing in it is not told; on the night the rite completes there is no
morning, only *Before dawn*.

**Nights it lies low.** Now and then the cult comes for no one (`night.low`; `liesLow` in `people/cunning.js`): at
`odds` (4%) × the season's patience (dealt unseen with the season: 0.5, 1, 1.6 or 2.5, by weight, `patience`), × (1 +
`heat`, 0.35, for each of the camp who suspects in earnest the one of it most suspected), × `after` (3) the night after
one of it was unmasked, × (1 + `ahead`, 1) once the rite has come to `start.doomWarn`; × `threatened` (0.4) while
someone the camp has heard dream one of it guilty is alive, since that cannot wait; × `spent` (0.5) for each such night
already; and ÷ how far it reads you as sitting still (above); never above `max` (40%). The morning finds everyone there,
and nobody believes it; the rite grows all the same. With nobody of the cult left at large (the last of it dead by your
own hand: below), the rite no longer grows, but the power below comes by itself, mostly (`night.priestless`, 85%), for
whom the cult would have chosen and as the cult would have come (the Watcher and luck may turn it as they would turn
anyone), so that the night tells nothing of who is left; the scene holds what any scene may (the thief's trace, or that
of someone who had been there earlier: anyone's, if nobody was about) but nothing of an attacker's own, and nobody saw an
attacker, though someone may have been seen about. The ending tells it. The
ending says why each quiet night was quiet, when it had a reason: the camp closing in on one of it, one of it unmasked
that evening, or the rite far enough along to risk nothing.

Otherwise it chooses its victim in this order: **you**, if you confided in a cultist (`night.alerted`, 55%) or made an
enemy of one (trust −1 or lower: `night.enemy`, 20%), half as readily on a night one of it swore to watch your tent
(`night.holds`, above), or
for no reason you will ever know (`night.you`, 1%, + `youDay`, 0.5%, for each day gone); otherwise, rarely, one of its
own (above); otherwise the dreamer the camp has heard name one of it guilty most often (`night.threat`, 70%: the true
Dreamer, as a rule, since it goes by what was dreamt, not by who dreams true); the last pretender to dream aloud at
breakfast (`night.loud`, 50%, × `loudSpared`, 0.3, while those dreams have done it no harm: a pretender naming the
innocent does its work for it); someone who has named an innocent guilty before everyone, in a dream or in blame aloud
(`night.frame`, 60%, × the best of it at planting a trace, `CRAFT.plant`), so that with them dead it is the one they
named whom the camp looks at; or anyone else, weighted toward those who stand by you (+`victims.yourFriend` per trust)
and away from those the cult likes (×(1 − `victims.cultLike` × like) per cultist), toward those who have begun to
suspect one of the cult (×(1 + `victims.suspects` × suspicion) per cultist), and away from those the camp already
suspects, who are of more use to the cult alive (×(1 − `victims.scapegoat`, 0.12, × how many suspect them)). Why it chose whom it chose
is kept for the ending.

The Watcher watches over you the night they promised to, if they trust you (≥ 2), all but always (`night.watchKept`,
90%); a promise is for that night only, the true Watcher's as anyone's, and another day needs another promise. Otherwise
the Watcher watches anyone at random (you among them, and the cult too: the Watcher cannot tell). The Watcher there drives off whoever comes, all but always (`night.watched`, 90%),
and is seen doing it at your tent (`night.seen`, 90%); someone unwatched may yet be spared by luck (`night.spared`, 3%:
the dogs, a light, a sleeper stirring). An attack on you is turned by the Watcher, by the incantation bowl
(`night.bowl`, 90%; it breaks as it is used, held or not, `bowlBreaks`, 90%, and is otherwise whole in the morning), by
the revolver (`night.revolver`, 40%: a point of nerve), or by waking in time (`night.spared`, 3%: a point of nerve);
otherwise you lose about 2 nerve and take a wound, in the power's own manner, all but always (`night.manner`, 97%). A
death shakes your nerve (about a point of it) at `night.shaken` (55%), +`night.shakenTrust` (15%) for each point of
trust the dead had in you. The night comes for you in one of three ways.

**Harm in secret.** Someone who cannot stand you (trust −1 or lower; the cult too, which can like you, hate you or have
a soft spot for you as anyone can) may do you a harm in secret: at most one a night, at `spite.try` (7%) × `hate` (2) at
trust −2 × their temperament (`spite.temper`: the honest hardly ever, 0.01; the suspicious and the liar most readily) ×
the season's spite; seldom on a night the cult came for you, or one that brought both a horror and the words (×
`night.calm`, 0.3). A scorpion in your boot (a wound), salt in your water (two nerve), your lamp oil watered (a nerve),
or a brandy, a torch or the revolver gone from your kit. It lands at `spite.ok` (70%); otherwise you find it in time.
Now and then they are caught at it (`spite.caught`, 20%: you see who it was, and it counts against them at an inquiry,
`verdict.spite`; in the grey light, now and then you take them for someone else, `spite.wrongFace`, 5%, and the ending
tells it), or leave a trace of themselves by your tent (`spite.trace`, 35%). A wound from it can kill you, as any other;
the words are in `data/hazards.js`.

**The words.** The tablet lines you know may come back to you in the night (above, `study.linger`), for a point of
nerve.

The dead are found where it happened (`world/deaths.js`, words in `data/deaths.js`), by someone or other (seven ways).
Mostly the cult did it with its own hands: one of eight ways anywhere, or (`night.handHere`, 40%) one of two ways only
that place allows, and the power's mark on the body all the same, mostly (`night.mark`, 90%; three for each nature of the power). But the
power below takes its own, in one of twelve ways in its own colour, at `night.taken` (15%) + `night.takenDay` (4%) for
each day gone + `night.takenRite` (20%) × the rite's progress, × the season mood's taken, never above `night.takenMax`
(45%): so most of the dead are always murdered, and the power's own hand shows more as the rite gathers strength. So a
death almost always tells something of the power below: it is in the power's own manner but for now and then another's
of the season (`night.manner`, 97%), never told, which the ending tells. Now and then (`night.signed`, 30%) the cult
leaves its signature besides (seven). In a season no state of the body is told twice while another is left. Crane, the
night before you came, was the power's own work as a rule (`night.craneTaken`, 70%), otherwise the cult's, like any
other death, and his scene holds a trace like any other.

**Onto them.** If the one the night took had named someone still at the dig guilty before everyone, someone may say so
aloud at first light, as half the camp is thinking it (`camp.onto`, 45%). It may be what the cult killed them for, and
it may be what it wanted the camp to think (above); the line is the same either way. It is a public moment (below).

**A watch sworn, and told of.** The morning after someone swore to watch your tent (one of the cult, a pretender, or the
true Watcher who watched it as promised) and nothing came for you, the one who swore may tell the camp at breakfast that
they saw someone off in the small hours (`night.kept`, 30%, as the morning has room): the cult, to be trusted for it;
anyone else, to be thanked, or because they heard something in the dark and believe it. Whoever doubted them may think
again (`camp.kept`, below). Nothing had come near your tent; the ending tells it.

At dawn the season's mood may turn (above). Then: the trace, perhaps a horror of the night (above), the scorched circle,
a sign of the power below, all but always (`night.dawnSign`, 95%: one not yet seen as a rule, an old one at
`night.signAgain`, 0.05, of the weight; each sign is told in three ways, the ones not yet heard first; where dread runs
high, perhaps a second sign; one sign in a hundred is not the power's at all, `PUZ.stray`), perhaps a charm from the
finds tray (`night.findsTray` × the mood's finds), the Dreamer's dream (of someone not yet dreamt of, never of whoever
the night came for; the night may bring none, `night.dreamless`, 3%; it is true at `night.dreamTrue`, 95%, else
muddied; brought to you before breakfast by a Dreamer who trusts you or promised, mostly, `night.seerTells`, 90%;
otherwise aloud at breakfast at `night.seerAloud`) and the dreams of anyone who only says they dream, the cult's as
readily (`night.pretender`), told aloud in no fixed order, so that who spoke first tells you nothing; the morning's talk
(below), and perhaps news, as often as its strand comes (`night.event`: news 0.24, the uncanny 0.1, the camp's own 0.1
a morning, each × its strand's rate and the room the morning has left, above). A piece of news
already told comes again only seldom (`events.again`, 0.1 of its weight); the voice on the wireless, before the rite
stirs, seldom (`events.early`, 0.2). What each piece does comes all but always, never always (`events`). The world
outside: a shamal (two slots today, and no evening; now and then it drops by noon, `shamalPasses`, 15%; heavy, it blows
on the next day, `dustAgain`, 75%); a telegram from the Trustees (about −1 nerve); RAF biplanes, the post from Hillah
(about +1 nerve); a dealer (a charm, or a small find; a fake now and then, `fake`, 20%; heavy, a second thing that is
real, `dealerMore`, 60%); a cable from the Museum (a tablet line; garbled now and then, `garbled`, 10%); a doctor from
Hinaidi (a wound seen to, mostly, or about +1 nerve); rain (about a fragment washed out, now and then none or two); an
inspector from Baghdad (takes a fragment, unless he is satisfied, `satisfied`, 20%); the supply lorry (a torch, `torch`,
85%, else about +1 nerve; heavy, a flask of brandy, `brandy`, 70%). The uncanny: the diggers refusing Trench B, and
seven shadows at noon (a sign each); a mirage, someone in your tent in the night, the village well gone bitter, a voice
on the wireless reading your name (about −1 nerve each); a grave of kneeling men (about a fragment, about −1 nerve); a
dervish (an incantation bowl, `bowl`, 85%, or about +1 nerve). The uncanny's cost is a horror's, which you may grow used
to (above). The camp's own: coffee with the headman (trust +1, `coffee`, 75%); a quarrel at breakfast (a feud shows); a
wedding feast (a friendship shows, or trust +1 for the one beside you, `feast`, 75%); the diggers' song about whoever
the camp eyes most (anyone at `songAnyone`, 0.25, against each one's suspicion by the camp, squared; the camp may eye
them the more). A quarrel or a feast is now and then between any two at all (`mislead`, 4%). Heavy, each does twice as
much, or worse (above); a heavy quarrel leaves each of the two suspecting the other (`heavySus`, 75%).

**The thief in the Dreamer's dreams.** The god knows who has robbed it: in a true dream of the thief, now and then its
hand is on the thief's shoulder (`night.thiefDark`, 30%), a guilty dream of one who is no cultist. The ending tells such
a dark dream, and a muddied one, for what it was, if it was told.

## Your own dreams

**A spoiler: the game never explains any of this.**

Now and then you dream yourself (`RULES.yourDreams`; `game/yourdreams.js`). Each season deals, unseen, how often a night
brings you a dream (`rate`: 1% at weight 2.5, 15% at 2, 30% at 2.5, 45% at 2) and how often a dream is true
(`truth`: 45% at weight 1.5, 60% at 2, 75% at 2, 90% at 1.5). A dream comes in the night, told before anything the
night has done is known, and goes into your journal. It is of one kind, by weight (`kinds`; a kind that cannot be
dreamt that night is passed over):

- **The gates** (2.5): someone still at the dig stands inside the seventh gate with the god's hand on their shoulder,
  or outside, weeping; now and then it is yourself (`self`, 12%).
- **Whom the night comes for** (1): someone, you, or nobody, tonight. A false one shows someone when nobody is coming
  (or you, at `youFalse`, 25%), and, when someone is, someone else (`someoneFalse`, 70%) or nobody.
- **Who cares for whom** (2): two of the camp, as they feel about each other; false, with one of the two feelings
  turned about.
- **A habit at an old scene** (1.5): the night of an attack gone by, and one habit left there: the attacker's, or one
  the attacker does not have.
- **A part someone keeps** (1): the Dreamer's, the Watcher's or the thief's (one someone at the dig still keeps), and
  who keeps it.
- **Whom someone lies awake for** (1): one who suspects another in earnest, or, false, one who does not (only once
  some of the camp do and some do not).
- **A line of the tablets** (0.7): read in the dream, as written, or changed as a scribe's error would change it.
- **The door** (0.4): from day 3, the door at the foot of the stair, standing open on the night the moon is dark, if
  nothing stops it first. It is only ever of what is sure, and always counted true.

Nothing says which dreams are true. The ending lists each dream, and whether it was so; a season without them says
nothing of them.

## Claims in Crane's diary

Crane's diary names a Dreamer and a Watcher. Each person decides once, as the season is dealt, what part to claim, by
part and temperament and nothing else (`assignClaims` in `people/claims.js`):

- **The Dreamer and the Watcher** claim their part, or hide it (temperament `hideSeer`, `hideWarden`): afraid of the
  knife, or because a watcher works better unseen. The honest evade the question rather than lie. Hidden parts come out
  at trust 3 (mostly: `confess.atTrust`, 80%, × 1 − half their hiding, a chance a day), under pressure, or of their own
  accord.
- **The smuggler** may claim the watch as a cover for their nights out (`cover`).
- **Everyone else**, the cult and the innocent alike (and a smuggler with no cover), may claim a part that is not
  theirs at their temperament's `liked`: the Dreamer's or the Watcher's, at even odds (`claims.likedSeer`, 0.5). The
  cult claims as cover, anyone else to be listened to; the odds are the same, so that a claim alone tells nothing of
  who makes it. The honest hardly ever claim what they are not.
- **Some will not say.** One with nothing to claim now and then will not answer at all (`claims.evadeAny`, 3%; the
  honest, `evadeHonest`, 15%), whoever they are.
- **Late claims.** One who has said nothing of the diary yet and begins to look lost (a case of `verdict.someCase` or
  more, or two of the camp suspecting them in earnest) may claim a part they never spoke of, a dawn at
  `claims.cornered` (0.12) × `liked`: the cult to cover itself, anyone else in fear. Nobody hears of it until they say
  it. One named guilty in a dream told aloud may claim to dream on the spot (below).

Measured over 700 seasons of build 26, a false claim to dream, once stated, came from the cult 51% of the time, from an
innocent 38% and from the thief 10%.

**Made-up dreams.** Whoever only says they dream makes a dream up once a day, and tells the same one again that day (at
breakfast, asked whom they distrust, or as you take your leave). A pretender's names someone guilty at
`claims.fakeGuilty` (40%): someone they dislike or suspect, dreaming their own fears, or, once another has dreamt
aloud, now and then that rival (`claims.atDreamer`, 30%); otherwise it clears a friend. One of the cult who claims to
dream weighs what a dream is for (`cultDream`):

- **Under the bus**: the other of it, once that one looks lost, named guilty by one ruthless enough (`cunning.bus`,
  0.1, × its craft's `sacrifice`). A true dream.
- **A shield**: the other of it, once it is watched (anyone suspects it in earnest, or someone else has named it guilty
  aloud), cleared (`claims.shield`, 0.8, × its craft's `defend`). A lie.
- **A frame**: whoever is closing in on it (anyone outside it who suspects one of it in earnest, or a dreamer heard to
  name one of it guilty; the more, the likelier) named guilty (`claims.frame`, 0.9, × its temperament's `frame`). A lie.
- **Otherwise** it dreams as a pretender would: a clean dream of a friend (the other of it among them), or, at
  `fakeGuilty` + `cultGuilty` (0.04, making up for the clean dreams it tells of the other of it), a guilty one. While
  the other of it is not watched, a guilty dream names it at `claims.distance` (0.55) × (½ + its `sacrifice`), to stand
  apart from it at no cost; else one it dislikes or fears, or a rival dreamer.

So the cult's dreams, taken together, look like anyone's.

**Dreams told aloud, and what they draw.** A guilty dream told at breakfast may be answered there and then (`claims`),
and every answer is told the same way, whoever gives it:

- **For one they would protect.** Anyone else who claims to dream may answer for the one named with a clean dream of
  their own ("Then we did not dream the same dream"): for a friend, or, in the cult, for the other of it; at
  `claims.defend` (35%) × `CRAFT.defend` by their temperament. The true Dreamer answers so only with a clean dream of
  them to tell, anyone else only with no dream told yet that day. Nobody answers for themselves this way.
- **A dream in answer.** The one named may answer with a dream of their own that names the dreamer. It is the oldest
  trick there is, and the camp knows it, so it is seldom done, and mostly by the rash (temperament `counter`: the
  light-headed 1.4, the liar 1.3, the suspicious 0.99; the calculating 0.2; the honest hardly ever, 0.01): one who
  already claims to dream, at `claims.counter` (10% for their first dream aloud, 30% for one already dreaming aloud), ×
  `desperate` (2) once they look lost anyway; one who claimed no part, the cult as anyone (but never the Watcher), may
  even claim to dream on the spot (`counterSpot`, 4%, × `counter`), a pretender from then on. The true Dreamer, named
  guilty, answers with what they dreamt of their accuser, if they dreamt them guilty (`counterTrue`, 50%). So an answer
  proves nothing by itself: the true Dreamer answers too. The camp distrusts it all the same: anyone not fond of the one
  who answers may suspect them for it (`camp.dreamt.answer`: +25% for a first dream aloud, +10% otherwise).
- **A lie, says the one named.** Otherwise they may call it a lie before everyone (`claims.retort`, 30%, × temperament
  `retort`: the suspicious most, the detached least), in anger, coldly or plainly as their temperament has it, mostly
  (`claims.retortLine`, 75%; else in another's way), whatever they are; the camp takes it as it takes blame aloud.

## Temperaments

Seven, dealt at random, whatever the part. The full table is `TEMPERS` in `rules.js`; in short:

|  | Lies | Truth from a cultist | Comes clean (per day) | Gossip: often · true | Names a real cultist |
| --- | --- | --- | --- | --- | --- |
| **Honest** | hardly ever, 1% (evades) | 99%, except about the cult | 45% | 20% · 95% | 45%, or declines |
| **Conscientious** | rarely | 70% | 30% | 25% · 90% | 40% |
| **A liar** | about anything | 1% | 3% | 40% · 35% | 25% |
| **Calculating** | when it pays | 60%, and strategic truths | 5% | 40% · 55% | 30%; points at accusers |
| **Detached** | seldom | 40% | 12% | 5% · 90% | 30%, or declines |
| **Light-headed** | to be liked; misremembers | 40% | 25% | 60% · 65% | 30% |
| **Suspicious** | to hide | 30% | 8% | 50% · 60% | 20%; blames aloud |

How they show: your own impression of a person's manner (true, but for now and then a wrong one, the likelier the less
their feelings show: `talk.mienWrong`, 8%, ÷ `MANNER.shows`), what others say of them (as true as the speaker), and
their behaviour (evasions, refusals, inconsistent accounts, tells). A cultist flinches at an old charm at the
temperament's `fear` (from 60% for the honest down to 25% for the calculating; an innocent now and then flinches too),
and lets something slip under pressure at its `slip`.

**The cult's truths.** A cultist lies about the power below and the ward that binds it, all but always (a true gloss or
reading by a slip, `readings.cultSlip`, 3%). About other powers the lie protects nothing, so it tells the truth at its
temperament's `truth`. A cultist pointing at the smuggler, a cultist pressed into a tip instead of a slip, a dream that
clears an innocent or gives up the other of it, a false claim given up: all true words the cult can spare. It gives a
claim up as any pretender comes clean: of a morning, to you alone or before everyone, pressed, or at an inquiry,
getting in first; in the same words, and the casebook records it the same way.

## Sympathies, gossip and rumours

- **Likes**, from −2 to 2 (`LIKE_W`), mutual at `likes.mutual`. The two cultists lean toward each other (`likes.pact`),
  which talk of friendships can give away. Choices that follow likes are weighted ×(1 + `likes.pull` × like).
- **Trust toward you** starts near zero, warmer for the calculating and light-headed, cooler for the suspicious (`warm`,
  `sour`; `likes.toYou`).
- **Gossip** (at breakfast, in conversation, overheard): a person's temperament (`gossip.temper`) or a friendship or
  feud, true at the speaker's `gossipTrue`, less so about those they feel strongly about (`gossip.likeBias`), and
  slanted toward the bad for the disliked; heavy talk (above) is true to what the speaker knows.
- **What you do gets round.** By morning, the friends of someone you pressed may cool (`rumours.pressFriend` × like),
  and the friends of someone you confided in may warm (the same deed to the same person is talked of once). An
  accusation at an inquiry is a public moment (below), taken up at once; a wrongly accused innocent hardly ever forgives
  you (above).
- **What is said of you.** Anyone may talk about you at breakfast, the more readily the more strongly they feel
  (|trust| + `rumours.talkBase`): as they feel, mostly, though now and then the other way (`rumours.flip`; the
  indifferent either way); their friends listen, bad talk a little more readily than good (`rumours.listenBad`,
  `rumours.listenGood`). A calculating cultist talks you down on purpose (`rumours.slyBad`; even behind a warm face, now
  and then: `slyWarm`). At most three things you did are talked of a morning (`rumours.told`).
- **The morning** brings, besides the rumours of what you did (the more readily after a night visit or the deed),
  grief for whoever the night took, perhaps a friend's sighting, perhaps one confession (the cult's false claims are
  given up the same way), perhaps an old quarrel flaring up (`TENOR.feud`), and, as often as talk comes (`morning.talk`
  × its rate), one of: talk about you, gossip, or blame aloud (`morning`); where talk runs high, now and then a second of
  another kind. Each but the grief only as the morning has room (above).
  Whoever liked the dead mourns them, mostly (`morning.mourn`, 90%), the one who liked them most the likeliest to take
  it hardest; and once two of the camp have suspected the dead, the camp now and then will not take them for innocent
  (`morning.withhold`, 25%).
- **Feelings move.** Someone accused before everyone may hold it against their accuser for good (below): they suspect
  them, and like them less.

## The camp: suspicion, and moments that move many at once

Everyone keeps their own count of whom they suspect, from 0 to 3, apart from whom they like. Some things happen before
the whole camp, and each of them is a **public moment**: every onlooker (everyone still at the dig, except whoever
started it and whoever it is about) gets one roll, and is moved one step or not at all. So one moment may leave the camp
unmoved, or move one, two or three people at once (`camp.cap`, 3, each way): in their trust in you, or in their
suspicion of each other. The one who speaks up at a moment is moved a step in their trust in you, all but always
(`camp.spoke`, 90%). A heavy moment (one that comes seldom in the season's mood) moves each onlooker × `camp.heavy` as
readily. In each row, `p` is every onlooker's chance, and the rest adds to it or takes from it. Suspicion is told by how
far it goes: someone begins to wonder about another (1), suspects them (2: in earnest), is all but sure (3); and on the
way down, is less sure, no longer suspects them in earnest, no longer suspects them at all.

| Moment | When | Who is moved, and how readily |
| --- | --- | --- |
| **Called out** (`calledOut`) | You sent an innocent away | One of their friends, the fonder the likelier, else someone honest or suspicious, speaks up (`odds` 75%) and trusts you less. Each onlooker cools at `p` 15%, +`friend` 30% if they liked the one sent away, +`suspicious` 10%, −`loyal` 15% if they trust you (2+), −`suspected` 10% if they had their doubts, −`thief` 10% if it was only a thief. Anyone who had suspected them in earnest stands by you instead (`defend` 30%). |
| **Praised** (`praised`) | You exposed a cultist | Someone who had suspected or disliked them says so (`odds` 70%) and warms to you. Each onlooker warms at `p` 12%, +`doubted` 25% if they had suspected or disliked the cultist; a friend of the exposed may not forgive you for being right (`grudge` 25%). |
| **Grief** (`grief`) | The night took someone | One of their friends, the fonder the likelier, may grieve aloud (`odds` 30%), and blames you a little, the less likely the more they trust you (`bitter` 60% − `trusting` 25% per point of trust); one who does not blame you asks you to put it right. Each onlooker cools at +`friend` 10% if they liked the dead, +`late` 1% for each day of the season gone, +`confided` 15% if you had confided in the dead, −`progress` 10% once you have exposed anyone, −`loyal` 15% if they trust you (≥ 2). Whoever liked the dead mourns that day, mostly (`morning.mourn`), and the one who takes it hardest is named. |
| **A watch slept through** (`sleptWatch`) | Someone swore to watch your tent, and slept | Each onlooker suspects them at `p` 25%, +`dislike` 20%, −`friend` 30%, +`suspicious` 10%. |
| **A dream aloud** (`dreamt`) | A dream told at breakfast names someone guilty | Each onlooker suspects the one named at `p` 15%, +`believe` 25% if they like the dreamer, +`credit` 15% for each time the dreamer has been proven right before everyone, +`dislike` 15% if they dislike the one named, −`doubt` 15% if they half suspect the dreamer. The friends of the one named, and those who already suspect the dreamer, suspect the dreamer instead (`back` 15%, +`friend` 25%, +`suspicious` 10%); so does anyone not fond of the dreamer when the dream only answers one that named them (+`answer`: 25% for a first dream aloud, 10% otherwise). The one named may hold it against the dreamer for good (`resent` 50%). |
| **A clean dream aloud** (`dreamtClean`) | A dream told at breakfast clears someone | Those who suspected them may think again: `p` 25%, +`believe` 20%, +`credit` 15% per proof. |
| **Blame aloud** (`blame`) | Someone says at breakfast that they do not trust another | As a dream, though fewer believe it (`p` 10%); a friend of the one blamed suspects the blamer (`back` 30%); the one blamed may hold it against them (`resent` 40%). |
| **The diggers' song** (`song`) | The diggers sing of whoever the camp eyes most (anyone, if nobody) | Each onlooker not fond of them may eye them the more: `p` 12%, +`dislike` 20%, +`suspicious` 10%. |
| **Coming clean** (`confessed`) | Someone drops a pretence before everyone | A friend who suspected them thinks the better of it (`respect` 40%); others see a liar (`liar` 15%, +`suspicious` 15%). |
| **Onto them** (`onto`) | The dead had named someone still here guilty before everyone | Someone says so aloud (`odds` 45%), the likelier the more they suspect the one named: blame aloud, as any. Each onlooker not fond of the one named suspects them at `p` 20%, +`dislike` 15%, +`suspicious` 10%; a friend of the one named suspects the speaker instead (`back` 20%); the one named may hold it against the speaker (as blame aloud, `resent` 40%). |
| **A habit by the tent** (`planted`) | The deed: a habit you laid is taken for its owner's | Each onlooker not fond of its owner suspects them at `p` 30%, +`dislike` 15%, +`suspicious` 10%. |
| **A watch told of** (`kept`) | Someone who swore to watch your tent says they saw someone off | Whoever doubted them may think again (`p` 30%). |
| **Proven right** (`proven`) | The truth bears out what someone said before everyone | Whoever suspected the speaker may think again (`clear` 60%). |
| **Proven wrong** (`disproven`) | The truth gives it the lie | Each onlooker suspects the speaker at `p` 15%, +`friend` 30% if they liked the one wronged. |

The truth about someone comes out, as the camp sees it, when they are exposed as a cultist, sent away after an inquiry,
or taken by the night (whom the camp takes for innocent, and is fooled when one of the cult has killed another).
Everything said of them before everyone is then settled: each speaker, once, on the last thing they said of them, is
proven right or wrong, and the camp remembers it (their `credit`), which makes their next dream or accusation more, or
less, believable; the camp takes up each speaker still at the dig, those proven wrong first, and hands raised the same
way at the same inquiry together.

Suspicion matters. Asked whom they distrust, and when they blame aloud, people name whom they suspect most; the cult
would rather take those who suspect one of its own, and spare those the camp already suspects (above). Your casebook
shows who suspects whom in earnest and whose word has been proven before the camp, and lists what the camp made of each
moment.

## Flirtation, and what came of it

A light touch. Dealt at the start: each woman may have a soft spot for you (`flirt.you` 40%), and anyone may for a
particular person of the other sex (`flirt.pair` 25%; between the camp, only a man and a woman), except Père Anselm, who
keeps his vows. The text never says whether you are a man or a woman. It shows only while the feeling holds (her trust
in you at `flirt.trust`, 2, or more; their liking at `flirt.like`, 1, or more) and comes back if the feeling does. Even
then, only now and then, and only as far as manner lets it show (above): in a greeting (`flirt.greet`), an answer given
with a flirtatious look (`flirt.face`), a look as you leave (`flirt.parting`), a word let slip when they talk of the
other (`flirt.aside`, `flirt.feel`; now and then about one they are not taken with at all, `flirt.asideFalse`, 2%), a
piece of gossip (`flirt.gossip`; made up now and then, `flirt.invent`, 30%, × how untrue the speaker's gossip runs).

Beyond a tryst of a night (above) and the night visit (below), it changes nothing in the game; now and then it comes to
more, told in the epilogue (`flirt.romance`). Two of the camp who both left Kutha free, one taken with the other and
the other at least liking them back: `pair` (30%; half that if only one of them was taken with the other), +`fond` if
they were fond of each other, +`clear` if neither suspected the other, −`doubt` if either suspected the other in
earnest; the fonder the pair, the more it comes to. A woman with a soft spot for you: at her trust 2, `you[0]` (25%);
at 3, `you[1]` (50%); more by `visit.love` (0.25) if she spent a night in your tent, and then she comes first;
otherwise she writes. No one has two romances, and nobody has one with the priest, however taken with him they were.
And someone taken with one the night took may mourn them (`mourn`). All of it is told in the epilogue and decided
without the dice (presentation, above).

## The night visit

Once a season at most, from day `visit.from` (2), a woman with a soft spot for you who has come to trust you
(`flirt.trust`, 2, or more) may come to your tent as the evening ends (`RULES.visit`; `people/visit.js`): afraid, she
says, that they may not see the light of day, and not wanting to spend the night alone. She comes at `visit.odds`
(4%) + `perDead` (2%) for each of the night's dead so far, never above `max` (15%), the fonder the likelier; never on
the night you go out yourself (the deed, above). An occultist may feel the cult's cold as she comes in, or a cold that
is only the night, as in any conversation (`talk.chillCult`, 30%; `chillOther`, 5%).

- **Sent back**, she trusts you less (`visit.hurt`, 90%; a second step less at `hurtMore`, 30%), and her friends think
  the less of you for it (`rumours.visitFriend`, 0.2, × liking).
- **She stays**, and if she is of the cult she may do the cult's work herself in the small hours (`visit.strike`, 30%;
  never on a night the cult lies low), and mostly she does it (`kills`, 90%): the season ends. If not, you catch her
  wrist in time, at the cost of about 2 nerve and a wound, and by first light she is in the truck to Hillah as one of
  them unmasked (the rite set back as at an inquiry; if she was the last of them, the season is won, all but always,
  as at an inquiry).
- **Otherwise the night goes as any night**, by its own dice. The cult coming for her may know where she sleeps
  tonight (`visit.found`, 50%): then it comes to your tent, past the Watcher if it is watched and past luck, and she
  dies beside you in your sleep (about 2 nerve); or it finds her own tent empty, nobody dies, and by breakfast the camp
  has worked out where she slept. Coming for you, past the Watcher, the bowl, the revolver and luck, it finds two of you
  (`visit.through`, by weight: her 0.4, you 0.25, both 0.15, or only the usual harm 0.2, as she screams and it flees).
  The last of the cult in your tent, who let you be, does not come for you that night: if it comes for anyone, it is
  someone else. One of the cult in your tent may slip out to do the night's work herself.
- **A death in your tent** is talked of (`visit.talked`, by weight: hardly 1, readily 2, wildly 1): her friends, and
  now and then anyone (`rumours.diedAny`, 5%), think the less of you, the more the harder it is talked of; talked of
  wildly, the camp's suspicion of you rises a step (it weighs only if you go out yourself: the deed, above).
- **The morning after**, if you both live, she is gone before you wake (`visit.leaves`, 45%) or still there, whatever
  she is: one who slipped out on the cult's work is back by then as often as anyone else stays, so the morning says
  nothing of what she is. Your nerve may mend (`visit.mend`, 60%: about a point), and she may trust you the more
  (`visit.warm`, 50%). The camp talks the more readily (× `visit.talk`, 2): a friend of hers takes it well or badly
  (`rumours.visitFriend` × liking), one taken with her badly (`rumours.rival`, 50%). A flirtation that came to this is
  likelier to come to more (above).

Nothing of it is ever explained; the ending tells what she was, and what the night held.

## Coming clean

A person keeping up a pretence (a part claimed that is not theirs, the cult's among them; a watch that was a smuggler's
cover; a true part hidden) may drop it any morning, of their own accord: temperament `confess`, plus `confess.rival` if
another claims the same part, `confess.dreamt` if a dream named them, `confess.caught` if a sworn watch failed,
`confess.blamed` if two or more distrust them, `confess.trusting` if they trust you; for a hidden part, half the
temperament's chance, more after a death. The smuggler owns the smuggling of his own accord too (`confess.thief`, 0.3
× the temperament's chance). Never more than `confess.cap` (75%) a day, so some keep a lie to the very end. Of a
morning it is said to you alone before breakfast (`confess.aside`, 40%) or before everyone, in the same words whoever
says it, and the casebook records it the same way. At an inquiry, with the camp watching, the chance is higher
(`confess.publicly`). Pressed and shaken, anyone gives up a story they have told at `claims.pressed` (45%) + their
temperament's `confess`; trust 3 brings a hidden part out, mostly (above).

The cult never comes clean as the cult (above). A false part it gives up as anyone does, at the same odds and in the
same words: a cover story dropped before it breaks, and the lie underneath goes on. And a coming clean may be staged: a
liar or a calculating one who told you they had no part (never the smuggler) may, some morning, come clean as the
Watcher (`confess.staged`, 2%), whoever they are: a new lie told in the very words of a true confession, the cult's to
be trusted, anyone else's to be listened to. Said to you alone by one who trusts you (2 or more), it comes with a
promise to watch your tent that night, as the Watcher's would: a false watch (the cult's lets you be, above; anyone
else's is slept through). Pressing never brings a staged confession out; the ending tells it.

## The powers below

Every season deals its own pantheon: four powers of eight (`PANTHEON` in `data/world.js`: Nergal, Ereshkigal, Tiamat,
Lamashtu, Namtar, Pazuzu, Kingu, Belet-Seri), one of them behind the cult. Eight signs of forty-eight are in play (eight
for each of the six natures: fire, dust, sea, teeth, plague and madness): each belongs to exactly two of the season's
powers, and each power has four, so no single sign names a power. A power takes the nature of the first of its signs:
its colour in the deaths, the nights and the sanctum, what it favours between the gates (below), and the doom that ends
the season if the rite completes. Six old charms of twelve lie in the tell, one to a place as a rule (two now and then
share one, and another place holds none: `PUZ.share`, 10%): four are wards (one per power), two bind nothing.

The tablets never speak plainly. Each power goes by two old titles (`TITLES` in `world/powers.js`: thirty-two, dealt
anew every season to any of the powers, so knowing the hymns tells you nothing). Every title is a real one, as the old
texts give it, and the code notes whose it was and where: Nergal's Meslamtaea ("the One Who Came Out of Meslam") and
"the King of Sunset"; Lamaštu's seven names ("the Sister of the Gods of the Streets", "She Who Kindles Fire"); Tiamat's
"Mother Hubur" (Enūma eliš); Neti's "the Chief Doorman of the Underworld" (Inana's Descent); Ḫumbaba's "the One Whose
Breath Is Death" (Gilgameš); the demon rābiṣu, "the Lurker"; and so on. Each power's own epithet (`GODS`) is one the
texts give it too (Tiamat, "She Who Bore Them All"; Namtar, "Vizier of the Underworld"; Bēlet-ṣēri, "Scribe of the
Underworld"). Signs are written as omen formulas; and a charm is never named, only known by its marks. Every charm bears two marks each season (`CHARM_MARKS`: seven notches,
a hair-crack, a smell of cedar, a fleck of gold and so on, fifteen in all): one that no other charm bears, and a second
that now and then another charm bears too (`PUZ.markShared` marks are shared so). The tablets name a charm by its own
mark alone, or by both (`PUZ.markBoth`), always the same way in a season: "what bears seven notches" means nothing until
you hold a charm and turn it over (the Kit, and the moment you come by it, say what it bears; one mark in a hundred is
misread, `PUZ.misread`, and the ending tells it). Every tablet line is true, but for the scribe's errors (`PUZ.scribe`,
1% a line, never told); no line alone names the power and its ward; all of them together pin everything down, a scribe's
error apart (`test/gods.js`). Glosses tie titles to powers (a cultist lies about the power below, all but always; the
light-headed may misremember); readings name two powers a charm may bind, one of them right (`readings`), though a
mistaken reading now and then says it binds nothing at all (`readings.mistakeNone`), and so does the cult's lie about
another ward, now and then (`cultNone`). A line about the power below (the unmasked cultist's shout; below, the table
laid for the dead, the voices, Crane's satchel, the scribe's tablet) is one that narrows it, all but always
(`PUZ.patronLine`, 90%; else any line at all).

The shape of the tablets: `PUZ` (how many signs come in halves, how much a fragment leans toward what you study, how
often a power is named by title, how many lines a fragment gives, how often two titles are said to belong to different
powers (`apart`, at most `apartMax` such lines), and how the lines are written).

## The descent

On the fifth night (or when the rite completes): **name a power**, choose **up to two companions**, then the gates. Each
gate is easier by `descent.companion` per loyal companion and `descent.torch` with a torch. What a step costs when it
goes wrong is in `descent.cost` ([nerve, wounds]). Each companion who goes down with you steadies you at the top of the
stair (`descent.company`, about 1 nerve each, whatever they are).

- **Who comes.** Before you ask, someone may offer: once in a while someone who hardly knows you
  (`descent.volunteerFriend[0]`), now and then someone who likes you (`[1]`), often a friend (`[2]`), hardly ever anyone
  turned against you (`descent.foeOffers`, 1%); and the cult readily (`CRAFT.volunteer`), though less readily when you
  hardly trust it, since that would look odd (× `cunning.coldOffer` at trust 0), and seldom once two of the camp suspect
  it in earnest (× `cunning.suspectedOffer`). Two at most, and they all look alike. Asked, anyone at trust −2 refuses,
  all but always (`descent.foe`, 3%, comes all the same); at −1 the honest and the conscientious may come, out of duty
  (`descent.duty`), anyone else hardly ever (`descent.foe`); someone who cannot bear a companion already chosen refuses,
  unless they grit their teeth (`descent.grit`); and someone who hardly knows you (trust 0 or 1) may simply be too
  afraid (`descent.afraid`), as now and then even a friend is (`descent.afraidFriend`, 3%). Anyone who offered comes,
  all but always (`descent.offered`, 97%); the cult, asked, answers as anyone would in its place.
- **The first gate**: slowly (`descent.stairSlow`, a patient way; failing costs about 1 nerve) or fast
  (`descent.stairFast`, a hasty way; a fall: a wound). Like every trial below, each goes as the power's nature has it
  (below).
- **The second or third gate**: something waits there (below).
- **The fourth gate**: a cultist behind you strikes (the first of them with you who will not wait). Turn and face them
  (`descent.traitor` + torch, occultist, companions, and `traitorSuspected` if you had marked them a suspect when the
  descent began, the less the more of the camp you had marked so: × 2 ÷ how many, at most whole) or keep walking and
  listen (less likely by `traitorBlind`, but you hear the knife coming). Caught, they are tied there until morning, and
  the rite is set back as at an inquiry. A patient one (`CRAFT.patient`) lets the gate pass, walks beside you calmer
  than most (the first one with you walks calm at `descent.calm`: 70% for one of the cult who waits, 30% for anyone
  else), and turns at the very end. A knife in the back costs about 2 nerve and a wound; heard coming, only the nerve
  (`descent.cost.knifeHeard`). Without a traitor's move, meet the eyes (`descent.eyes`, a bold way; failing: about 1
  nerve) or walk blind (`descent.blind`, a humble way; failing: a wound).
- **The fifth or sixth gate**: something else waits there.
- **The seventh gate** takes a price: a thing you carry, a companion who holds the gate, or about 2 nerve (a memory). It
  takes what it is given, all but always (`descent.gate7`): now and then it will not have a thing, and you must offer
  something else (`refuse`, 5%; a thing that would cost you little, the bowl or the brandy, as often as not: `small`,
  50%); a companion left to hold it follows you through as it swings shut (`follow`, 5%; never one of the cult, which
  has its own reasons); or it takes another memory, and about a nerve more (`more`, 5%).
- **The sanctum**: whoever of the cult came down with you takes a place in the circle, all but always (`descent.turn`,
  95%; × 1 − `turnFond`, 0.3, if fond of you: then it stops at the edge of the light and does not go to them), and one
  you left behind on the way comes down to it by another way at the same chance; one who waited may have taken the true
  ward from you on the way and burned it before your eyes (`descent.steal`). With nobody of the cult in the circle, the
  rite fails of itself, all but always (`descent.emptied`, 97%; else the power finishes it). Then raise a charm
  (`descent.ward`, 55%, + bonus, +`descent.wardNamed`, 15%, if you named its power; a charm against another power:
  `descent.wrongWard`, and a win that way is told for the luck it was), speak the counter-rite against the named power
  (`descent.rite`, 25%, + bonus + 4% per tablet line about it, up to five; the wrong power: `descent.wrongRite`,
  likewise), or one of the two desperate acts, last resorts that owe nothing to what you learned, each to be tried once:
  shoot the hierophant (`descent.shootOne`, 25%, if only one cultist is left, else `descent.shootMore`, 6%; a miss, and
  the revolver is torn from you) or set the bitumen alight (`descent.fire`, 6%, +4% per loyal companion, −0.5% per step
  of the rite; a fire that goes out is out). No act's chance down here is under 5% or over 95%, but the wrong charm's or the
  wrong name's. The bonus: companions (`descent.companion`, 10% each), nerve above 5 (`descent.nerve`, 2% a point; as
  much less for each point below), the favour you won between the gates (`descent.favour`, 6% each), less
  `descent.doom` (3%) for each step of the rite and `descent.extraCultist` (7%) for each cultist beyond one. A failed
  ward or rite costs about 1 nerve; a missed shot or a fire that goes out costs about a nerve and a wound. After a
  failure the rite leaves you time for another act, mostly after the first (`descent.moreTime[0]`, 97%), seldom after the
  second (`[1]`, 5%), hardly ever after that (`scale.rarest`); a second act after a failed one is a little likelier
  (`descent.again`: the first shook the circle, though it did not break it). With nothing left to try, you can only
  watch, and the rite completes, all but always: now and then it breaks of itself on its last line (`descent.falters`,
  3%), a hard victory. A ward or the rite on the first try, with `descent.cleanNerve` (6) nerve or more and a wound to
  spare, is a clean victory all but always (`descent.cleanSure`, 90%); any other success is a hard one, but for now and
  then a clean one all the same (`descent.cleanLucky`, 3%; never a shot or the fire).

**Between the gates** (`below`, `game/below.js`), one thing between the first gate and the fourth, and one between the
fourth and the seventh, drawn from what waits there and never the same twice; now and then two between a pair of gates
(`below.twice`, 25%). Fifteen in all: the gatekeeper in a garment of the power's own stuff (give your own name, Crane's,
or push past); the judges of the dead (bow, keep your eyes down, or stare back); a table laid for the dead (eat and
drink, and know something; pour out the water as an offering; or touch nothing); the voices of the dead, one of them
someone you knew (answer, and the dead tell what they know, all but always, `below.learn`, 95%; stop your ears; or let a
companion talk you past); the power's own passage (straight through; the long way round, while the rite gains; or by
electric light); a black dog on the stair; a brazier in a niche; a cradle rocking with nothing in it; Crane's satchel
among the cult's bones (a charm or a tablet line inside; his notebook's last page holds a line, mostly,
`below.satchelLine`, 75%); a black pool where your reflection stands a step behind you (it nods at the right name and
shakes its head at a wrong one, all but always: `below.truthful`, 95%); a companion whose nerve fails (talked down, they
come on, `below.comesOn`, 90% when it went well, 70% when it went badly; sent back up, they go, `goesBack`, 95%); a
winged bull that lowers its eyes before the ward against its master (all but always, `below.truthful`; now and then
before another charm, or none); a scribe's unfinished tablet; the Seven, standing in a row; a channel of salt water
across the way. Each choice has its price (nerve, a wound, time, a companion) or its gift (the favour of the place, a
tablet line, a charm, nerve back, a truth).

**No choice is right in itself.** Each is a way of meeting the thing (bold, humble, truthful, sly, hasty, patient,
giving, with water, with light, taking, refusing, with bronze, with the written word, breaking, leaning on another), and
the power below favours some ways and will not abide others, by its nature (`NATURE` in `rules.js`), so the same trial
asks for different things in different seasons, and the omens are the clue to what it asks:

| Nature | Favours | Will not abide |
| --- | --- | --- |
| Fire | bold, haste, water, the word, breaking | patience, humility, light, guile |
| Dust | humility, truth, patience, refusing, giving | boldness, guile, haste, taking, breaking, light |
| Sea | bold, haste, light, the word, bronze | water, giving, patience, humility, taking |
| Teeth | giving, bronze, guile, light, refusing | truth, boldness, haste, taking |
| Plague | patience, giving, bronze, breaking, guile | boldness, haste, water, taking, refusing |
| Madness | humility, guile, patience, taking, breaking | boldness, truth, light, refusing, the word |

A choice goes well at its own odds (`below.name`, `below.bow` and so on, mostly 45% to 65%), + `below.nature` (22%) for
each of its ways the power favours and − as much for each it will not abide (two at most either way), + `below.known`
(8%) if you named the power rightly, + `below.signSeen` (2%) for each of its signs you have seen, − `below.shake` (15%)
once your nerve is down to `below.shaken` (4), − `below.rite` (2.5%) for each step of the rite past `start.doomWarn`,
− `below.harder` (6%) always (the stair is no place for anyone), and whatever the trial itself weighs (the judges, your
conduct: each cultist you unmasked, each innocent you sent away; the voices, the night's dead, and for a companion
talking you past them, the loyal company beside them (`descent.companion`, 10% each); the passage and the channel, your
wounds; a faltering companion, their trust in you; the Seven, the signs you have seen). A way the power will not abide
costs a nerve more when it goes wrong.

## Endings

Nineteen endings, each with its own picture: the gate unopened (the whole of the cult unmasked above ground), three
clean victories below (sealed by the ward, banished by the rite, the sanctum emptied), three hard ones (a shot, fire, a
scarred rite), two deaths, three madnesses, six dooms (one per nature of the power below: plague's is *None to Bury
Them*, madness's *The Sleepwalkers*), and *The Truck to Hillah*, a defeat: the camp sent you away for the deed. How
you died, and who found you, follows what happened: below, or in the night, by the cult's hand, the dig's own dangers
or someone's spite.

- **The conduct score** (`reckoning`): +3 per cultist exposed at an inquiry, +2 per cultist taken down at the fourth
  gate or unmasked in the night (one who came to your tent and failed to kill you), +2 for the hierophant, −3 per wrong
  accusation, −1 per inquiry the camp refused, −2 if the camp ever walked out (even if it later thought better of it),
  −2 per death (but for whoever you killed yourself, whom the deed counts), ±1 per right or wrong mark in your casebook
  (as it stood when that person's part came out: exposed, sent away, taken by the night, revealed, or when you went
  down; a mark changed after the fact is hindsight and does not count), +2 for naming the power rightly (−1 wrongly), +2
  for a first exposure by day 3, − failed acts below, ± up to 2 for the camp's trust at the end (of those still at the
  dig, friends at trust ≥ 2 minus those turned against you at ≤ −1), +1 if anyone came clean before the camp. The deed:
  −`deed` (1) for going out at all, and, if you killed, +`deedCult` (2) for one of the cult or −`deedInnocent` (5) for
  anyone else. **Your body and mind count too**: −`wound` per wound you carry at the end, +1 if your nerve at the end
  is at least `steady` (70%) of the most you can hold, −1 if it ever fell as low as `frayed` (2). Its tier: clean ≥ 10,
  honest ≥ 5, costly ≥ 0, at any price below that (a win with blood on your hands is a costly one at best); when lost,
  within reach ≥ 4, else out of your depth. A won season's account says how you came out of it, body and mind, and what
  became of you afterwards.
- **The style** of your season is what you did unusually much of. Each style counts its own things with its own weights
  (`END_STYLE_W`: pressing and accusing for the inquisitor, resting and backing off for the quiet guest, translating for
  the scholar, examining scenes for the detective, searching for the digger, confiding and being trusted, and the
  companions who went down with you, for the confidant), and the counts are measured against an ordinary season's mean
  and spread (`END_STYLE_MU`, `END_STYLE_SD`, calibrated by `test/endstyle.js`). With nothing out of the ordinary
  (`END_STYLE_MIN`), you were the field director. A season in which you killed someone with your own hands (the deed)
  is the Avenger's, whatever else you did: eight styles in all.
- **Haunting**: horrors met (searching, and of their own accord), the cost of reading, tablet lines read, wounds taken
  in the night, signs seen, charms found, a memory paid to the seventh gate, nerve run low (and being an occultist) add
  up, each by its weight (`END_HAUNT_W`), to how much of Kutha came home with you (`END_HAUNT`). A madness is the
  Bethlem one when the reading broke you, or cost you at least three nerve (`END_SAYS.study`) and more than the horrors
  did.
- **What the account remarks on** (`END_SAYS`): a first exposure before or after the early day; most of the camp willing
  to follow you anywhere (four friends) or half of it unable to meet your eye (three enemies); three marks or more
  right; nerve at the end in rags (three or less, without ever having frayed).
- **The debrief** tells what became of everyone (several fates for each, by what became of them in the season or what
  they were, and what they made of you, told otherwise if you never came home; flirtations that came to more), every
  factor that shaped the ending (what waited between the gates and what you made of it, why the night chose each of its
  dead as it stood that night, why each quiet night was quiet, the cult's planted traces and kept promises, from which
  day the cult had your measure, the true Dreamer's muddied or dark dreams, your own dreams and whether each was so, the
  night someone came to your tent and the night you went out yourself, your wounds and your nerve among them, and the
  season's mood and how it turned), the season in numbers (nerve lost and regained, nerve at the end, planted traces
  seen through), and the truth: every part, temperament, claim and feeling toward you, and the marks by which the
  tablets knew the ward.
- **Epilogues.** Each person's fate is told by what became of them and what they made of you, and then, now and then, a
  line or two more (`fates.codaNone`: none; to `codaOne`: one; else two), drawn from everything that passed between you
  and them or that they did or suffered in the season, the weightier likelier (`FATE_CODA` in `data/fates.js`): grief
  you sat with them through, a confidence, pressing them, a watch they kept over you or a night they saved you, a body
  they found, a night they were where it happened or lied about out of fear, a tryst they kept quiet, a sighting they
  made up, the harm they did you in secret, the hands they raised at your inquiries, their word proven before the camp,
  going down with you or holding the seventh gate, a trace the cult laid to frame them, a dream told aloud, a thief's
  word kept; and for the cult, a soft spot for you, a friendship or a grudge, which outlast the cult itself. Your own
  epilogue is told the same way (`FATE_YOU_CODA`; `fates.youOne`: one line, else two): the reading that cost you
  (`fates.read` nerve lost to it, or `fates.lines` lines known), the dig's dangers and someone's spite, an innocent you
  sent away, the night you went to someone's tent, a friend the night took, a companion left below, the friends you
  kept, the horrors that stayed with you (`fates.horrors`). All of it is chosen without the dice, so the very same
  season is told the same way twice. Which of several words is told is fixed by the season, not by the dice, so the
  next expedition is dealt exactly as before.
- **The end you chose.** Rarely, what the season left in you is more than you can carry, and in the end you end it
  yourself (`fates.last`; `FATE_YOU_LAST`; never how, only that it was and something of why). Only if you came out of
  the season alive: `base` (1.4%) for anyone who came home, × `mad` (5) if your mind broke and the season left you in a
  quiet ward, else × `frayed` (2) if your nerve all but broke; × `jail` (1.5) in a cell in Baghdad for the one you
  killed; × `killedInnocent` (3) for one you killed who was no cultist, or `killedCult` (1.5) for one who was; ×
  `wronged` (1.4) for each innocent sent away on your word; × `grief` (1.3) for each friend the night took; × `tent`
  (1.6) if someone died beside you; × `read` (1.5) if the reading cost you dear; × `horrors` (1.4) if the horrors stayed
  with you; × `friend` (0.8) for each friend who came through, up to three; × `loved` (0.4) if someone loves you; at
  most `max` (25%). It is told by one of its reasons, the weightier likelier (`fates.last.why`), and told last of all;
  your other epilogue is then one line at most, and never the same thing. Measured on the bots: about 3½% of seasons,
  nearly all of them a mind that broke (about 8% of the madness endings), almost never a season won.
- **A death that came later.** Now and then one of the seven who came through the season does not come through what it
  left in them (`fates.after`; `FATE_AFTER`): by their own hand, or in a way nobody can account for. For each who is
  still at the dig, sent away, or of the cult in a cell: `base` (4.5%), × `gone` (1.3) if you did not come home, ×
  `sent` (3) for one sent away in disgrace (not the thief), × `dreamer` (2) for the true Dreamer, × `grief` (1.6) for one
  who grieved, × `below` (1.6) for one who went down with you, × `jailed` (2.5) for one of the cult in a cell, × `thief`
  (1.5) for the thief; at most `max` (30%) each, and at most `most` (2) in an ending, the likeliest. Told by one of its
  reasons, the weightier likelier (`fates.after.why`), and by their own hand at `fates.after.chosen` for that reason
  (none for one who went below, or the thief; never a priest, who keeps his vows); it is all that is told of them.
  Never one spoken for in a romance, never one of the cult still at large, never after a season the gate opened.
  Measured (2,100 seasons): one in about 18% of seasons (two in 1–2%), a third of them by their own hand.

## How seasons end

The odds of the outcomes on build 26.1, from 3,150 simulated seasons: bots that play the real page the way a person
might, in seven styles (each leaning toward one way of working, on top of the same sensible play), 450 seasons each,
every background and every season's mood as the dice dealt them. A person who reads the casebook well should do better
than these bots; one who plays carelessly, worse. The intervals are 95% (Wilson).

| Outcome | Odds (95% interval) |
| --- | --- |
| **Defeat** | **90.3% (89.3–91.3)** |
| — madness | 41.6% (39.9–43.3) |
| — death | 24.1% (22.7–25.7) |
| — the rite completes | 23.9% (22.4–25.4) |
| — sent away on the truck to Hillah | 0.7% (0.5–1.1) |
| **Hard victory** | **7.3% (6.5–8.3)** |
| **Clean victory** | **2.3% (1.8–2.9)** |

No style does markedly better than another: each one's defeats lie between 89.6% and 91.3%, within the noise from one
run to the next (450 seasons a style are good to about ±3 points). By background: the philologist 90.4%, the soldier
88.9%, the occultist 91.8% (the soldier dies least and sees the rite complete most; the occultist goes mad half the
time). By the power's nature, defeat lies between 88.8% (madness) and 91.4% (fire).

The style the ending names: the field director (nothing out of the ordinary) 19.5% of seasons; the delver 14.8%, the
scholar 13.5%, the inquisitor 13.4%, the confidant 13.4%, the quiet one 12.2%, the sleuth 11.4%; the avenger (the deed
done) 1.8%. Three seasons in four come to the descent (76%); a season sees about two and a half of the camp taken by
the night.

The end you chose comes in about 3½% of seasons, nearly all of them a mind that broke (about 8% of the madness endings);
a death that came later, in about 18% (two in 1–2%), a third of them by their own hand.
