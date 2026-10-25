// ===================== RULES: the tables that decide how the game plays =====================
// The numbers that tune the game's systems, kept apart from the code that reads them. Change one here and the game
// changes; the code holds no tuning value of its own. RULES.md says in words what each of them does.

// ---------- the powers below: how the tablets are written ----------
// half: share of signs whose tablet line comes in two halves; rel: lean of the tablets toward what you are studying;
// title: share of references to a power made by an old title rather than by name
// lines: how many lines a translated fragment gives; apart / apartMax: how often two titles of different powers are
// stated to be different, and at most how many such lines; the rest choose between the ways a tablet line can be written;
// markShared: how many of the charms' marks two charms share; markBoth: how often the tablets name a charm by both its
// marks rather than by its own alone
// scribe: how often a line of the tablets is a scribe's error, and false (never told: world/powers.js, scribeErr); stray:
// how often a sign seen is not the power's at all, but one of another's, by coincidence (never told: game/day.js, nextOmen)
// patronLine: a line asked for about the power below is one; misread: one of a charm's marks misread; share: two charms in one place
const PUZ = { half: 0.5, rel: 0.6, title: 0.8, lines: 4, apart: 0.3, apartMax: 2, signIn: 0.5, halfIn: 0.5, nameBoth: 0.4, wardLine: [0.4, 0.75], wardPair: 0.6, markShared: 2, markBoth: 0.5, scribe: 0.01, stray: 0.01, patronLine: 0.9, misread: 0.01, share: 0.1 };

// ---------- the seven temperaments: everyone is dealt one each game, whatever their part in the story ----------
// claims:   hideSeer / hideWarden  a true Dreamer or Watcher keeps the part quiet (the honest only evade, never lie)
//           cover                  the smuggler claims to keep watch, to explain the nights out
//           liked                  claims a part that is not theirs, whoever they are: the cult as cover, anyone else to be
//                                  listened to (the same odds for both, so that a claim alone tells nothing of who makes it)
// truth:    truth                  a cultist tells the truth where the lie would not protect the cult
//           frame                  a cultist invents sightings and names innocents
//           strategic              a cultist tells a useful truth (a word about the thief, where it costs the cult nothing)
//           lieSmall               an innocent lies about small things (where they were, with whom)
//           mistake                misremembers what they saw or were taught
//           confess                daily chance of dropping a pretence, before anything presses them
//           tell                   a lie shows in the face
//           slip                   pressed hard and shaken, a cultist lets something slip (else turns it aside)
//           fear                   [cultist, anyone else]: flinches at an old charm
// dreams:   counter                named guilty in a dream told aloud, answers it with a dream naming the dreamer (rash, and
//                                  seen through: the calculating hardly ever; RULES.claims)
//           retort                 named guilty in a dream told aloud, calls it a lie before everyone
// talk:     gossip / gossipTrue    how often they talk about others, and how much of it is true
//           decline / blameAcc     will not name anyone / names a real cultist when asked whom they distrust
//           chat                   small talk warms them to you
// you:      confide                how readily they take your confidence
//           warm / sour            start the season well or ill disposed toward you
//           word                   how far they take your word at an inquiry, to begin with (the camp's verdict)
const TEMPERS = {
  honest:        { hideSeer: 0.2,  hideWarden: 0.3,  cover: 0.01,   liked: 0.01,    truth: 0.99,   frame: 0.01,   strategic: 0.05, lieSmall: 0.01,    mistake: 0.01,    confess: 0.45, tell: 0.6,  slip: 0.99,    fear: [0.6, 0.1],   gossip: 0.2,  gossipTrue: 0.95, decline: 0.45, blameAcc: 0.45, chat: 0.25, confide: 0,     warm: 0.01,   sour: 0.01, word: 0, counter: 0.01, retort: 0.8 },
  conscientious: { hideSeer: 0.35, hideWarden: 0.45, cover: 0.3, liked: 0.2,  truth: 0.7, frame: 0.4, strategic: 0.25, lieSmall: 0.01,    mistake: 0.01,    confess: 0.3,  tell: 0.5,  slip: 0.85, fear: [0.55, 0.15], gossip: 0.25, gossipTrue: 0.9,  decline: 0.3,  blameAcc: 0.4,  chat: 0.35, confide: 0.05,  warm: 0.1, sour: 0.01, word: 0.2, counter: 0.3, retort: 0.8 },
  liar:          { hideSeer: 0.5,  hideWarden: 0.55, cover: 0.8, liked: 0.65, truth: 0.01,   frame: 0.9, strategic: 0.1,  lieSmall: 0.35, mistake: 0.01,    confess: 0.03, tell: 0.12, slip: 0.55, fear: [0.35, 0.12], gossip: 0.4,  gossipTrue: 0.35, decline: 0.01,    blameAcc: 0.25, chat: 0.3,  confide: 0,     warm: 0.2, sour: 0.1, word: 0, counter: 1.3, retort: 1.1 },
  calculating:   { hideSeer: 0.5,  hideWarden: 0.55, cover: 0.7, liked: 0.45, truth: 0.6, frame: 0.9, strategic: 0.35, lieSmall: 0.12, mistake: 0.01,    confess: 0.05, tell: 0.08, slip: 0.35, fear: [0.25, 0.1],  gossip: 0.4,  gossipTrue: 0.55, decline: 0.1,  blameAcc: 0.3,  chat: 0.2,  confide: 0.1,   warm: 0.4, sour: 0.01, word: -0.2, counter: 0.2, retort: 0.5 },
  detached:      { hideSeer: 0.5,  hideWarden: 0.7,  cover: 0.4, liked: 0.1,  truth: 0.4, frame: 0.3, strategic: 0.1,  lieSmall: 0.01,    mistake: 0.05, confess: 0.12, tell: 0.25, slip: 0.75, fear: [0.3, 0.05],  gossip: 0.05, gossipTrue: 0.9,  decline: 0.6,  blameAcc: 0.3,  chat: 0.1,  confide: -0.15, warm: 0.01,   sour: 0.2, word: -0.3, counter: 0.3, retort: 0.4 },
  lightheaded:   { hideSeer: 0.3,  hideWarden: 0.4,  cover: 0.5, liked: 0.75, truth: 0.4, frame: 0.6, strategic: 0.1,  lieSmall: 0.05, mistake: 0.2,  confess: 0.25, tell: 0.45, slip: 0.95, fear: [0.5, 0.15],  gossip: 0.6,  gossipTrue: 0.65, decline: 0.01,    blameAcc: 0.3,  chat: 0.45, confide: 0.1,   warm: 0.3, sour: 0.01, word: 0.4, counter: 1.4, retort: 1.3 },
  suspicious:    { hideSeer: 0.7,  hideWarden: 0.75, cover: 0.4, liked: 0.3,  truth: 0.3, frame: 0.8, strategic: 0.1,  lieSmall: 0.01,    mistake: 0.01,    confess: 0.08, tell: 0.3,  slip: 0.7,  fear: [0.45, 0.25], gossip: 0.5,  gossipTrue: 0.6,  decline: 0.01,    blameAcc: 0.2,  chat: 0.15, confide: -0.25, warm: 0.01,   sour: 0.5, word: -0.5, counter: 0.99, retort: 1.6 }
};
const TEMPER_IDS = Object.keys(TEMPERS);

// ---------- how a feeling shows (people/manner.js) ----------
// shows: how readily a feeling shows in face and word (× the chances in RULES.manner): the honest and the light-headed
// wear theirs openly, the calculating and the detached hardly at all.
// mask: in the cult, a warm face put on for you without the feeling behind it, while it courts your trust
const MANNER = {
  honest:        { shows: 1.15, mask: 0.01 },
  conscientious: { shows: 0.9,  mask: 0.15 },
  liar:          { shows: 0.85, mask: 0.35 },
  calculating:   { shows: 0.6,  mask: 0.45 },
  detached:      { shows: 0.5,  mask: 0.1 },
  lightheaded:   { shows: 1.2,  mask: 0.2 },
  suspicious:    { shows: 1,    mask: 0.15 }
};
// the faces a feeling wears, by weight (or, for faces chosen without the dice, as a list to draw from):
// flirt        flirting (the light-headed wink more: wink becomes winkLight)
// joke         a joke about love and marriage (a priest's: jokeVows)
// warm, cold   a warm greeting, or a cold one (from someone hostile, angry at angry, else cold)
// mask         the cult's warm mask
// goodDay      a good day (at goodDay of the whims: the good faces), or else a bad one (the bad faces)
// castFlirt    faces drawn about the dig: someone sweet on you (at castFlirt × flirt × shows); castWhim: a whim
// suspected    someone the camp suspects, drawn about the dig (at suspected × shows): sad at sad, else afraid
// inquiry      faces at an inquiry: your friends, everyone else (shares, in order)
const FACES = {
  flirt: { coy: 4, smirk: 2, smile: 2, warm: 1, wink: 1 }, winkLight: 2,
  joke: { smirk: 3, smile: 2, coy: 1, wink: 1 }, jokeVows: { smirk: 2, smile: 2 },
  warm: { warm: 2, smile: 1 }, angry: 0.5, mask: { warm: 1, smile: 1 },
  goodDay: 0.6, good: { smile: 1, warm: 1 }, bad: { cold: 1, thoughtful: 1, sad: 1 },
  castFlirt: 0.6, castFlirtFaces: ['coy', 'coy', 'smile', 'smirk', 'wink'], castWhim: ['smile', 'thoughtful', 'sad', 'cold'],
  suspected: 0.6, sad: 0.5,
  inquiry: {
    friend:    [['sad', 0.65], ['thoughtful', 0.35]],
    other:     [['angry', 0.5], ['cold', 0.3], ['neutral', 0.2]]
  }
};

// ---------- the powers below, by their nature (game/below.js, game/finale.js) ----------
// What each power favours (+1) and will not abide (−1) in the one who comes down to it, by its nature: the burning one,
// the dust of the dead, the salt deep, the hungry teeth, the sixty sicknesses, the laughing dark. The ways of meeting a
// trial: bold, humble, truth (your own name, an honest answer), guile, haste, patience, offer (a gift, a libation),
// water, light, take (to eat, to read, to open what is not yours), refuse (to touch nothing), bronze (charms held up),
// word (the written or spoken formula), break, company (leaning on another: no power cares).
const NATURE = {
  fire:    { bold: 1, haste: 1, water: 1, word: 1, break: 1, patience: -1, humble: -1, light: -1, guile: -1 },
  dust:    { humble: 1, truth: 1, patience: 1, refuse: 1, offer: 1, bold: -1, guile: -1, haste: -1, take: -1, break: -1, light: -1 },
  sea:     { bold: 1, haste: 1, light: 1, word: 1, bronze: 1, water: -1, offer: -1, patience: -1, humble: -1, take: -1 },
  teeth:   { offer: 1, bronze: 1, guile: 1, light: 1, refuse: 1, truth: -1, bold: -1, haste: -1, take: -1 },
  plague:  { patience: 1, offer: 1, bronze: 1, break: 1, guile: 1, bold: -1, haste: -1, water: -1, take: -1, refuse: -1 },
  madness: { humble: 1, guile: 1, patience: 1, take: 1, break: 1, bold: -1, truth: -1, light: -1, refuse: -1, word: -1 }
};

// ---------- the cult's craft, by temperament (people/cunning.js) ----------
// plant      lays an innocent's trace at the scene instead of leaving its own
// volunteer  offers to come down with you
// patient    lets the fourth gate pass, and betrays you at the very end, in the sanctum
// sloppy     leaves a second trace at the scene
// tidy       leaves nothing else behind: a scene examined shows its trace genuine, and gives up no second one
// blurt      lets slip, the day after, something only the one who did it could know (asked about the night; half as
//            often in small talk)
// at an inquiry (game/verdict.js):
// push       sides with you against an innocent, to be rid of them
// defend     speaks against an inquiry into one of its own (and, in anyone who claims to dream, answers a dream told
//            against one they would protect with a clean one: RULES.claims)
// sacrifice  sides with you against one of its own whom the camp is sure of anyway, to look clean (and, dreaming, stands
//            apart from the other of it while that costs nothing: RULES.claims)
const CRAFT = {
  honest:        { plant: 0.01,    volunteer: 0.2,  patient: 0.01,    sloppy: 0.15, tidy: 0.15, blurt: 0.3,  push: 0.3,  defend: 0.8,  sacrifice: 0.05 },
  conscientious: { plant: 0.12, volunteer: 0.3,  patient: 0.1,  sloppy: 0.1,  tidy: 0.3,  blurt: 0.18, push: 0.4,  defend: 0.6,  sacrifice: 0.15 },
  liar:          { plant: 0.3,  volunteer: 0.45, patient: 0.25, sloppy: 0.06, tidy: 0.35, blurt: 0.1,  push: 0.6,  defend: 0.4,  sacrifice: 0.35 },
  calculating:   { plant: 0.38, volunteer: 0.55, patient: 0.4,  sloppy: 0.03, tidy: 0.5,  blurt: 0.05, push: 0.45, defend: 0.25, sacrifice: 0.55 },
  detached:      { plant: 0.15, volunteer: 0.2,  patient: 0.2,  sloppy: 0.08, tidy: 0.35, blurt: 0.12, push: 0.3,  defend: 0.3,  sacrifice: 0.2 },
  lightheaded:   { plant: 0.1,  volunteer: 0.4,  patient: 0.05, sloppy: 0.3,  tidy: 0.05, blurt: 0.35, push: 0.6,  defend: 0.7,  sacrifice: 0.1 },
  suspicious:    { plant: 0.22, volunteer: 0.25, patient: 0.15, sloppy: 0.1,  tidy: 0.3,  blurt: 0.15, push: 0.55, defend: 0.5,  sacrifice: 0.25 }
};

// ---------- sympathies ----------
// -2 cannot bear, -1 dislikes, 0 indifferent, 1 likes, 2 fond. Not always mutual. The two cultists lean toward each
// other, which gossip about friendships can give away.
const LIKE_W = { '-2': 0.08, '-1': 0.22, 0: 0.38, 1: 0.24, 2: 0.08 };

// ---------- the endings: the style of a season, and how much of Kutha came home with you ----------
// Your style is whatever you did unusually much of, measured against an ordinary season (its mean and spread);
// a season with nothing out of the ordinary is the field director's.
// What each style counts, and how much: what you did (from the season's log), what you knew and whom you had won over
// by the end, and how you went down the stair (game/endings.js, endStyleFacts, says what each name counts).
const END_STYLE_W = {
  inquisitor: { press: 2, accused: 2, distrust: 0.5, enemies: 0.5, faced: 2, shot: 2 },
  quiet:      { rest: 2, backDown: 2, slowStair: 1, unseen: 1, neverAccused: 2 },
  scholar:    { study: 2, readings: 1.5, facts: 0.3, rite: 2 },
  sleuth:     { examine: 2, night: 0.5, sights: 0.5, marksRight: 0.5, diary: 0.5 },
  delver:     { search: 2, charms: 0.5 },
  confidant:  { confide: 2, about: 1, trust: 0.5, friends: 1, confess: 0.5, went: 1 }
};
// (the mean and spread of 1,050 simulated seasons played the way a person plays, 150 by each persona of
// test/endstyle.js, build 26.1)
const END_STYLE_MU = { inquisitor: 3.8, quiet: 3.5, scholar: 4.3, sleuth: 7.5, delver: 9.6, confidant: 6.1 };
const END_STYLE_SD = { inquisitor: 3.1, quiet: 2.1, scholar: 3.2, sleuth: 3.0, delver: 4.6, confidant: 4.0 };
const END_STYLE_MIN = 0.75;
// ... and of what the cult can see of each way as the season goes (people/cunning.js, STYLE_SO_FAR), by the eve of the
// descent: the pace it reads you against (the mean and spread of the 680 of 1400 such seasons that came to the fifth
// night, 200 by each persona, build 26)
const READ_MU = { inquisitor: 3.9, quiet: 2.5, scholar: 4.2, sleuth: 8.1, delver: 11.1, confidant: 5.3 };
const READ_SD = { inquisitor: 3.0, quiet: 1.6, scholar: 3.2, sleuth: 3.0, delver: 4.6, confidant: 3.9 };
// exposure (horrors, reading, wounds, signs, charms...) at which Kutha follows you home: a little, and a great deal
const END_HAUNT = [7.5, 10.5];
// ... counting each horror (searching, or of its own accord), each nerve lost to reading, every factPer tablet lines
// known, each wound taken in the night, every signPer signs seen, every charmPer charms found, a memory left at the
// seventh gate, being an occultist, and each step your nerve fell below nerveLow
const END_HAUNT_W = { horror: 1, studyCost: 1, factPer: 5, wound: 1, signPer: 2, charmPer: 3, self: 2, occultist: 1, nerveLow: 3 };
// what the ending remarks on: friends enough that most of the camp would have followed you, enemies enough that half of
// it would not meet your eye, marks right enough to be worth saying, nerve at the end low enough to be in rags (but
// never fallen as low as frayed), and a madness from reading (it broke you, or cost at least study nerve, and more nerve
// than the horrors took)
const END_SAYS = { friends: 4, enemies: 3, marks: 3, rags: 3, study: 3 };

// ---------- the season's mood (game/tenor.js) ----------
// Every season has a mood, and the mood decides how often things happen of themselves, strand by strand: dread (horrors
// that find you, and the uncanny among the morning's news), talk (breakfast gossip and blame, talk overheard, dreams told
// aloud, remarks in passing, and the camp's own news: a quarrel, a feast, a song), news (the world outside: visitors,
// weather, the post); and the diggers' finds tray (finds), how much you notice of people's habits as you go (watch), how
// often the dead are the power's own work (taken), how far the evening's mood swings at an inquiry (swing); and the
// dangers that are no one's doing: the dig's own (peril: a collapse, a fall, bad water, the heat), and the harm someone
// who cannot stand you does you in secret (spite) (game/hazards.js). Each is × the usual. Talk and news ramp up over
// the first days (ramp, by day). Every mood carries its danger: the still have the dig's, the haunted their horrors,
// talk turns to spite, and the world outside brings its own.
// A season begins in a mood, by weight (start). Each dawn it may drift into a neighbouring mood (next: the neighbours,
// by weight) at drift, + pull for each thing since the last dawn that drew it elsewhere, − pull for each that held it
// where it is, never above driftMax; it drifts toward whatever drew it (a pull toward a mood that is no neighbour draws
// it toward uneasy, the way there). What draws it (pulls): each happening of a strand, toward that strand's mood (strand);
// a death at the cult's hands, toward talk (murder), the power's own touch, toward haunted (taken); the rite stirring,
// toward haunted, every dawn (rite); an innocent sent away, or an inquiry refused, toward talk (wrong, refused); one of
// the cult unmasked, toward still (right); a day when nothing happened of itself, toward still (calm).
// One thing brings another: each happening warms its strand by heat (× 1 + its warmth), and the warmth cools to cool of
// itself each dawn, never above heatMax. What happens seldom weighs more: at heavy × (1 − its strand's rate now) a
// happening is heavy: a horror one degree worse, news twice as strong, talk truer and more widely heard. The morning that
// the mood turns is told at told. Where talk or news runs above 1, a second item may come the same morning, at second × (its
// rate − 1, at most 1). Where dread runs above 1 the power shows itself more: a sign not yet seen may come as well, some
// mornings (omen × (dread's rate − 1)); and you grow used to its horrors, which now and then cost no nerve at all (numb ×
// (dread's rate − 1)). A quarrel may flare up again at breakfast, each morning at feud, until it has. A morning's extras
// (beyond the night, its trace and the day's sign) crowd one another out: each one already told × crowd on the next, so
// a morning brings one thing or two, seldom a heap, and what the mood favours comes first.
const TENOR = {
  moods: {
    still:   { dread: 0.55, talk: 0.35, news: 0.35, finds: 0.7, watch: 1.35, taken: 0.85, swing: 0.85, peril: 1.7, spite: 1.2 },
    uneasy:  { dread: 1.1,  talk: 0.8,  news: 0.6,  finds: 1,   watch: 1,    taken: 1,    swing: 1,    peril: 1,   spite: 1 },
    haunted: { dread: 1.8,  talk: 0.55, news: 0.45, finds: 1.25, watch: 0.9, taken: 1.35, swing: 1.1,  peril: 0.8, spite: 0.7 },
    tongues: { dread: 0.6,  talk: 2,    news: 0.5,  finds: 0.8, watch: 1.1,  taken: 0.9,  swing: 1.35, peril: 0.7, spite: 1.7 },
    world:   { dread: 0.75, talk: 0.7,  news: 2.2,  finds: 0.9, watch: 0.8,  taken: 1,    swing: 1,    peril: 1.3, spite: 0.8 }
  },
  start: { still: 3, uneasy: 3, haunted: 1.5, tongues: 1.5, world: 1.5 },
  next: {
    still:   { uneasy: 2.5, haunted: 1, world: 1, tongues: 0.6 },
    uneasy:  { still: 1, haunted: 1.5, tongues: 1.5, world: 1 },
    haunted: { uneasy: 2, still: 0.8, tongues: 0.8, world: 0.4 },
    tongues: { uneasy: 2, still: 0.5, world: 1, haunted: 0.7 },
    world:   { uneasy: 2, still: 1, tongues: 1, haunted: 0.5 }
  },
  drift: 0.15, pull: 0.1, driftMax: 0.7,
  pulls: { strand: 0.35, murder: 0.75, taken: 1, rite: 0.5, wrong: 1, refused: 0.5, right: 0.75, calm: 0.5 },
  heat: 0.25, cool: 0.5, heatMax: 1, heavy: 0.9, told: 0.7, second: 0.3,
  ramp: [0.7, 0.85, 1, 1, 1.1],
  omen: 0.25,                                   // a second sign the same morning, at omen × (dread's rate − 1)
  floor: 0.02,                                  // what the mood all but rules out stays possible: no rate − 1 or 1 − rate below this
  numb: 0.35,                                   // a horror costs no nerve at numb × (dread's rate − 1): you grow used to it
  feud: 0.4,                                    // after a quarrel, each morning: it flares up again at breakfast
  crowd: 0.45, crowdFav: 0.75                   // each extra a morning has brought already × the chance of the next
};

// ---------- everything else: the season, the day, the night, talk, gossip, the descent ----------
// Probabilities are chances between 0 and 1; weights are relative. None of them is ever shown on screen: the player
// is told what a choice risks, never the odds of it.
const RULES = {
  start: {
    days: 5,                                    // the season: days until the dark of the moon
    doom: 1, doomMax: 12, doomWarn: 8, doomStir: 5, // the rite: where it starts, where the gate opens, when you are warned
    slots: 3, nerve: 10, nerveOccultist: 8, wounds: 3, woundsSoldier: 4, fragments: 2, fragmentsPhilologist: 3,
    shortSlots: 2                               // a day cut short (a shamal, the diggers out): no evening at camp
  },
  // the scales: trust in you runs from trustMin (hostile) to trustMax (devoted), though talk alone, or the start of a
  // season, never makes anyone more than talkMax (fond); one person's suspicion of another runs from 0 to suspicion.
  // Whatever you try and whatever anyone decides is kept between least and most (clamp, core/random.js): nothing is
  // certain, nothing hopeless; only what is meant to be rare comes rarer (dread of its own accord early on, the wrong
  // charm or name that works all the same). And no die at all is ever surer than surest or rarer than rarest (chance):
  // no outcome is ever certain. How much nerve something costs or gives back, and how far the rite moves, varies by one
  // at spread (vary); a wound taken or healed, at graze. Nerve, wounds and trust are never told in numbers, only in
  // words; a loss of severe or more is told as a great one, and so is a gain of more than that.
  scale: { trustMin: -2, trustMax: 3, talkMax: 2, suspicion: 3, least: 0.05, most: 0.95, rarest: 0.01, surest: 0.99, spread: 0.25, graze: 0.1, severe: 2 },
  // where people spend a slot (weights); in the evening more of them come back to camp, and the cult goes to its work
  places: { camp: 3, trench: 3, store: 2, village: 2, ziggurat: 1, canal: 1.5, cemetery: 1 },
  evening: { camp: 2, cultZiggurat: 3, cultCemetery: 2 },
  // keeping away from someone you cannot bear; going where a fond friend is (the cult mostly does not seek out its own by day)
  company: { avoid: 0.8, follow: 0.25, cultApart: 0.85 },
  day: { noticeHabit: 0.35, misnote: 0.01, overhear: 0.25, brandy: 3, rest: 2 }, // misnote: a habit noticed is only that day's
  search: { more: 0.5, horrorWorse: 0.5, charm: 0.85, moreOdd: 0.3, twoFrags: 0.08 }, // charm: a charm hidden in a place turns up, each search of it; moreOdd: × nothing and horrors among what the same hole gives up after it; twoFrags: a fragment found in two pieces
  // translating a fragment (game/day.js): how readily it goes, and what it costs. The more of the tablets you know, the
  // more each new line weighs: a translation costs nerve at cost + costLine × each line you know already (at most
  // costMax; a philologist × costPhilologist), two at worse + worseLine × each line known; signs that would not come
  // clear cost nerve all the same at failCost; and each night the words may come back (game/dread.js), at linger × each
  // line you know (at most lingerMax).
  study: {
    odds: 0.62, philologist: 0.15, extraLine: 0.5, onTopic: 0.8, secondOnTopic: 0.5, crumble: 0.3,
    cost: 0.5, costLine: 0.03, costMax: 0.9, costPhilologist: 0.75, worse: 0.2, worseLine: 0.02, failCost: 0.4,
    linger: 0.012, lingerMax: 0.4,
    misremember: 0.01                           // the old title a philologist knows from the start is misremembered
  },
  // examining a scene: how readily it reads, a soldier's eye; whether another of the same person's traces turns up
  // beside a genuine one (more); and how often the scene misleads you (misread: an older trace looks fresh, or the reverse)
  examine: { odds: 0.7, soldier: 0.1, more: 0.6, misread: 0.15, misreadTwo: 0.2, smudge: 0.01, again: 0.2 }, // misreadTwo: × misread, two traces side by side; smudge: a trace not of its owner's own habit; again: a scene that would not read keeps something for another look
  // the rite set back by a cultist unmasked, gained by an innocent sent away (about so far: vary); the unmasked one's
  // last shout (shout); and the last of them unmasked too late to stop the rite (tooLate; × tooLateNear once it is close)
  inquiry: { doomRight: 2, doomWrong: 2, shout: 0.7, tooLate: 0.03, tooLateNear: 3, nerveWrong: 2, nerveRefused: 1 }, // (nerve: what an innocent sent away, and an inquiry refused, cost you)
  // the camp's verdict at an inquiry (game/verdict.js). Each of the camp weighs it: their own suspicion of the one
  // accused (0 to 3), + the case you lay out, + trust × their trust in you, + how far they take your word, − like ×
  // their liking for the one accused, + fear × the night's dead so far (at most fearCap), − anger × the camp's anger,
  // − again for each inquiry of the last againDays evenings that it refused or that sent an innocent away (the camp
  // tires of inquiries that come to nothing), ± up to mood (the evening's, the same for everyone in the tent) ± up to
  // whim (their own); at back or more they side
  // with you, below against they speak against it, between they say nothing. It passes with at least need on your
  // side, and more on it than against it. The cult raises its hands the way anyone in its place would (the same
  // leaning, from the suspicion it lets show), so that its hands, counted over a season, look like everyone's; its own
  // interest leans on them only a little (cult), by its craft (CRAFT: push, defend, sacrifice): toward seeing an innocent
  // sent away (push × craft push × how far it has learned you lean on inquiries: people/cunning.js, cultTurns), toward
  // sparing one of its own (defend × craft defend); and one of its own who looks lost anyway it may give up outright
  // (bus × craft sacrifice: then it leans give toward you). It counts its own as lost on a case of someCase or more (some
  // evidence, as it looks to you), or when two of the camp suspect them in earnest.
  // How far each takes your word: at first word, + their temperament's word, ± up to wordSpread (who they are); then,
  // each by chance, more by gain once a cultist is unmasked (proven; + provenBacked if they stood with you), less by
  // loss once an innocent is sent away (doubt; + doubtFriend if they liked the one sent away, − doubtShared if they
  // stood with you, − doubtCase × how strong your case was, out of caseCap), less by lossRefused once they have refused
  // an inquiry (doubtRefused); never below wordMin or above wordMax.
  // The case (at most caseCap): per trace at a scene that fits them (trace; examined and genuine: genuine), per strong
  // word against them (a slip, a slip of the tongue about the night, a witness: strong), per dream of their guilt
  // (dream; a dream of innocence takes as much away), per sworn watch slept through, per flinch at an old charm or hint
  // at their nights (flinch), per distrust voiced (distrust).
  // The camp's anger: + wrong for each innocent sent away, + refused for each inquiry it would not back, − right for
  // each cultist unmasked. After an inquiry that went against you, once it reaches walkoutFrom, the camp may hold no
  // more inquiries (at walkoutStep for each step of anger from walkoutFrom up), and then the diggers down tools the next
  // day. After a day without an inquiry it cools overnight by cool, but not below wrong for each innocent sent away but
  // on the night it lets go of that too (forget): the camp forgets a refused inquiry in time, if you give it time, and an
  // innocent sent away hardly ever.
  verdict: {
    trust: 0.5, like: 0.75, anger: 0.25, mood: 1, whim: 0.75, back: 1.8, against: 0.5, need: 2, fear: 0.15, fearCap: 4,
    word: 0.5, wordSpread: 0.4, wordMin: -1.5, wordMax: 2.5,
    proven: 0.5, provenBacked: 0.25, gain: 0.5,
    doubt: 0.45, doubtFriend: 0.3, doubtShared: 0.2, doubtCase: 0.3, loss: 0.75, doubtRefused: 0.2, lossRefused: 0.25,
    cult: { push: 0.6, defend: 0.45, bus: 0.5, give: 2.5 },
    trace: 1, genuine: 1.5, strong: 1.5, dream: 0.75, failwatch: 1, flinch: 0.5, distrust: 0.25, caseCap: 3,
    sight: 1, lie: 1,                           // a sighting that fits their known habits; an account of a night belied
    there: 0.5,                                 // an account of a night that puts them, by their own word, where it happened
    spite: 0.5,                                 // caught at your tent in the night, meaning you harm
    stood: 0.6,                                 // each who stood with you when you were right trusts you more, at this chance
    contrary: 0.02,                             // anyone, the cult too, may raise a hand against their own leaning: a whim, a slip
    alone: 0.8,                                 // with nobody left at the dig to raise a hand, the police corporal takes your word
    grudge: 0.9, alerts: 0.9,                   // one accused in vain holds it against you for good (else less); the cult learns of it
    forgive: 0.05,                              // ... or only a step's worth (twice as readily for the honest, the conscientious, a friend)
    forget: 0.05,                               // a night the camp's anger lets go even of the innocents sent away
    relent: 0.1, relentDeath: 0.15,             // each dawn a camp that walked out may hear you again (the more after a death)
    strike: 0.85,                               // the day after a walkout the diggers do strike (else Hamid talks them round)
    wrong: 2.5, refused: 1.5, right: 1, cool: 0.5, walkoutFrom: 3, walkoutStep: 0.2,
    again: 0.5, againDays: 2,                   // the camp tires of inquiries that came to nothing (see above)
    someCase: 1.25, strongCase: 2.5             // how a case looks to the cult (never told you): some evidence, a strong case
  },
  // horrors outside the tomb (game/dread.js): after anything you do by day, the chance that something finds you anyway:
  // base + day × (days gone) + doom × the rite's progress; at night, when nothing else came for you, × night.
  // tiers: the rite's progress at which they grow worse; worse: a middling one costs two nerve, not one; here: one of the
  // place you are in, rather than of anywhere
  dread: { base: 0.01, day: 0.006, doom: 0.005, night: 1, tiers: [4, 8], worse: 0.4, here: 0.5 },
  // the dig's own dangers (game/hazards.js): each slot out on the tell, at base × the season's peril × the place's (at),
  // × noon in the afternoon (when, at heat, it is the heat that has you)
  // what the morning's news does, all but always (game/events.js): the shamal blows itself out by noon (shamalPasses), or,
  // heavy, blows on the next day (dustAgain); the dealer's charm is a fake (fake), heavy, a second thing is real
  // (dealerMore); each at the coffee warms to you (coffee); the inspector is satisfied (satisfied); the lorry brings a
  // torch (torch), heavy, brandy (brandy); the dervish leaves a bowl (bowl); the one beside you at a feast warms to you
// (feast); the cable comes through garbled (garbled); a
  // quarrel or a feast is between any two at all (mislead); a heavy quarrel leaves each suspecting the other (heavySus);
  // the song is about anyone, at songAnyone against each one's suspicion by the camp, squared; a piece told already comes
  // again (again: × its weight), the wireless before the rite stirs (early: × its weight)
  events: {
    shamalPasses: 0.15, dustAgain: 0.75, fake: 0.2, dealerMore: 0.6, coffee: 0.75, satisfied: 0.2, torch: 0.85, brandy: 0.7,
    bowl: 0.85, feast: 0.75, garbled: 0.1, mislead: 0.04, heavySus: 0.75, songAnyone: 0.25, again: 0.1, early: 0.2
  },
  peril: { base: 0.05, noon: 1.3, heat: 0.4, afterHorror: 0.5, at: { trench: 1.4, ziggurat: 1.2, cemetery: 1.1, canal: 1, village: 0.8, store: 0.7, camp: 0.2 } },
  // harm done you in secret by night, by someone who cannot stand you (trust −1 or lower; hate: × for −2): at most one a
  // night, at try × hate × their temperament (temper; the honest hardly ever) × the season's spite; it lands at ok; they are
  // caught at it at caught, else leave a trace of themselves by your tent at trace
  spite: {
    try: 0.07, hate: 2, ok: 0.7, caught: 0.2, wrongFace: 0.05, trace: 0.35,  // wrongFace: the one you catch, taken for someone else
    temper: { honest: 0.01, conscientious: 0.3, liar: 1.3, calculating: 1, detached: 0.5, lightheaded: 0.7, suspicious: 1.4 }
  },
  night: {
    alerted: 0.55, enemy: 0.2,                  // the cult comes for you once you have confided in one of them / made an enemy of one
    holds: 0.5,                                 // ... × 1 − this on a night one of it swore to watch your tent (its cover)
    threat: 0.7,                                // ... or for a dreamer the camp has heard name one of it (the true Dreamer, as a rule)
    loud: 0.5, loudSpared: 0.3,                 // ... or for one loud with dreams; × loudSpared while those dreams have done it no harm
    revolver: 0.4, findsTray: 0.35, riteNote: 0.5,     // findsTray: × the mood's finds
    // nothing at night is sure: the Watcher drives off whoever comes for the one watched (watched), watches over you as
    // promised (watchKept), and is seen doing it (seen); the incantation bowl takes the blow (bowl); the true Dreamer
    // dreams (but for dreamless), and dreams true (dreamTrue); the power leaves its mark on one the cult killed (mark);
    // whoever comes for someone unguarded may yet fail, by luck (spared: the dogs, a light, a sleeper waking); and the
    // ground may hold no trace at all (swept)
    watched: 0.9, watchKept: 0.9, seen: 0.9, bowl: 0.9, dreamless: 0.03, dreamTrue: 0.95, mark: 0.9,
    spared: 0.03, swept: 0.03,
    // nor is the rest: it comes for you though you gave nothing away (you, + youDay for each day gone); a Dreamer who trusts
    // you or promised brings you the night's dream (seerTells); a death, the power's mark, an attack on you are in the
    // power's own manner (manner; otherwise another power's of the season, never told, and the ending tells it), and
    // Crane was the power's own work (craneTaken; otherwise the cult's, with its mark, mostly); a night that came for you
    // brings a horror or harm in secret only at calm × the usual (and harm in secret after both a horror and the words,
    // too); the incantation bowl breaks when it is used (bowlBreaks), whether or not it held; a sign of the power comes
    // with the dawn (dawnSign), one not yet seen as a rule (signAgain: the weight of one already seen, against 1)
    you: 0.01, youDay: 0.005, seerTells: 0.9, manner: 0.97, craneTaken: 0.7, calm: 0.3,
    rite: 1.3,                                  // the rite grows by about this much a night for each of the cult still at large
    bowlBreaks: 0.9, dawnSign: 0.95, signAgain: 0.05,
    where: { trench: 1, ziggurat: 1, cemetery: 1, canal: 1, store: 1, village: 0.3 }, // where the night takes anyone but you
    event: { news: 0.24, dread: 0.1, talk: 0.1 },      // the morning's news, by strand: × how often the strand comes now
    // the dead (world/deaths.js): taken by the power itself at taken + takenDay × (days gone) + takenRite × the rite's
    // progress, never above takenMax, so that most are the cult's own work; a murder in a way only that place allows
    // (handHere); the cult's signature besides (signed)
    taken: 0.15, takenDay: 0.04, takenRite: 0.2, takenMax: 0.45, handHere: 0.4, signed: 0.3,
    shaken: 0.55, shakenTrust: 0.15,            // a death shakes your nerve at shaken, + shakenTrust × how far they trusted you
    betray: 0.4,                                // × the killer's craft (sacrifice): one of the cult kills another (people/cunning.js)
    betrayLess: 0.3,                            // × that, on the first night; × that, if the killer is under any suspicion itself
    smugglerTrace: 0.25, smugglerTraceOut: 0.6, // the thief's trace at the scene instead of the cult's (more when he swore a watch)
    strayTrace: 0.55,                           // ... else, if anyone else had been there that day or night, theirs, from earlier
    seerAloud: 0.35, pretender: 0.25,           // who tells a dream at breakfast, unasked: the Dreamer; anyone who only says so
    // the nights the cult lies low and comes for no one (people/cunning.js, liesLow): odds × the season's patience (dealt
    // by weight), × (1 + heat for each who suspects in earnest the one of it most suspected), × after the night after one
    // of it was unmasked, × (1 + ahead) once the rite is far along (start.doomWarn), × threatened while someone the camp
    // heard dream one of it guilty lives, × spent for each such night already; never above max
    low: { odds: 0.04, patience: { 0.5: 1, 1: 2, 1.6: 1.5, 2.5: 1 }, heat: 0.35, after: 3, ahead: 1, threatened: 0.4, spent: 0.5, max: 0.4 },
    frame: 0.6,                                 // × the cult's best craft at planting: it comes for one who named an innocent guilty aloud
    priestless: 0.85,                           // with nobody of the cult left at large, the power below comes by itself, as it would
    thiefDark: 0.3,                             // the Dreamer dreams of the thief: the god's hand on the shoulder of one who robs it
    kept: 0.3                                   // the morning after, whoever swore to watch your tent says they saw someone off
  },
  // how the cult reads your way of hunting it (people/cunning.js, cultReads): how far past an ordinary season's pace you
  // have gone, in spreads (z of them is all the way), and how much more readily it then works against that way (gain);
  // the ending tells of a way the cult went at least told of the way against
  adapt: { z: 2, gain: 0.5, told: 0.5, idleRite: 0.6 }, // idleRite: × how far it has read you as sitting still, the rite grows faster
  // your own dreams (game/yourdreams.js), never explained: each season deals how often you dream (rate: the chance a
  // night brings one, by weight; 0 is a season without dreams) and how often a dream tells the truth (truth, by weight);
  // a night's dream is of one kind, by weight (kinds; one that cannot be dreamt that night is passed over); a dream of the
  // gates is now and then of yourself (self); a false dream of whom the night comes for shows someone when nobody is
  // coming (else yourself: youFalse), and nobody when someone is (else someone else: someoneFalse); a dream of what is to
  // come is only ever of what is sure, and true
  yourDreams: {
    rate: { 0.01: 2.5, 0.15: 2, 0.3: 2.5, 0.45: 2 },   // (a season of almost no dreams: never none for certain)
    truth: { 0.45: 1.5, 0.6: 2, 0.75: 2, 0.9: 1.5 },
    kinds: { verdict: 2.5, death: 1, likes: 2, habit: 1.5, part: 1, fear: 1, line: 0.7, gate: 0.4 },
    self: 0.12, youFalse: 0.25, someoneFalse: 0.7
  },
  // the nights (people/alibis.js): where the innocent spend them, and who spends one together; what anyone says of it, and
  // what they saw. fib: how far someone's temperament lets them lie (1 − truth).
  alibis: {
    smugglerStore: 0.5, where: { camp: 5, village: 2, store: 1, canal: 1, trench: 0.4, ziggurat: 0.4, cemetery: 0.3 }, pair: 0.6,
    tryst: 0.3, hide: 0.75,                     // two sweet on each other slip out together; each (not the honest) says they were in camp
    astray: 0.2,                                // someone alone was where it happened, by ill luck
    fear: 0.75, alibi: 0.08, fearFriend: 0.45,  // × fib: one who was there (alibi: one out alone) says they were in camp; or with a friend
    cultPair: 0.38, cover: 0.5,                 // a cultist claims an evening with someone alone (as often as anyone claims company); a fond friend who bends the truth backs it
    cultCover: 0.7,                             // a cultist named in a frightened alibi backs it: an alibi for itself
    bold: 0.2,                                  // the attacker owns being out near the place, rather than be caught lying
    frame: 0.72,                                // × the cultist's temperament: invents a sighting of an innocent
    invent: 0.12,                               // × temperament frame: one sure of someone, or who cannot bear them, says they saw them
    knew: 0.35,                                 // × craft blurt: one who found the body, or was there, lets slip what they know
    sawFromCamp: 0.16, sawOut: 0.5, sawSmuggler: 0.6,
    seenAstray: 0.8,                            // a witness glimpsed someone there by ill luck, rather than the attacker (1), at this
    // and nobody's night is sure: one attacked and saved glimpsed a habit of the attacker's (glimpse); the thief spends
    // the night in camp after all (smugglerIn), tells the truth of it (thiefTruth; the honest one: thiefTruthHonest, else
    // will not say), will not say (thiefEvade), lets fall what he saw (thiefMentions); anyone will not say where they
    // were (evadeNight); a friend who merely likes them backs a story (coverLike × cover); the Watcher hiding the part
    // speaks as the Watcher would (watcherWords); anyone alone in camp says they could not sleep (upAnyway)
    glimpse: 0.15, smugglerIn: 0.15, thiefTruth: 0.05, thiefTruthHonest: 0.2, thiefEvade: 0.1, thiefMentions: 0.05,
    evadeNight: 0.03, coverLike: 0.3, watcherWords: 0.5, upAnyway: 0.15
  },
  // the cult's craft beyond its temperament (people/cunning.js): it warms to you no more readily than anyone, unless you
  // are an occultist, whose interests it may half share (a little more readily in small talk, charm, and in taking your
  // confidence, listen); a planted trace seen for what it is may show the attacker's own beneath it; and since an offer
  // to come down with you from someone you hardly trust would look odd, it makes one less readily then (coldOffer × its
  // usual readiness)
  cunning: { charm: 0.08, listen: 0.05, underneath: 0.5, coldOffer: 0.15, suspectedOffer: 0.2, bus: 0.1 }, // suspectedOffer: × its offer, suspected in earnest by two; bus: × its sacrifice, it names the other of the cult once that one looks lost
  talk: {
    questions: 2,                               // questions to a conversation, before it has run its course
    longer: 0.08, shorter: 0.08,                // ... now and then one more, or one fewer
    warmth: 0.2,                                // making conversation warms anyone this much more readily, on top of chat
    comfort: 0.7,                               // sitting with someone who mourns the night's dead, the day it happened, comforts them
    company: 0.35,                              // making conversation with a friend (trust 2 or more) steadies your nerve a little
    press: 0.4, pressSoldier: 0.25, pressTrust: 0.05, pressAlerts: 0.5, pressCost: 0.9,   // pressCost: pressing costs trust, whoever they are
    cold: 0.6, refuse: 0.6, hostileSilence: 0.5,   // someone who has turned against you keeps it short, refuses a favour, will not name names
    scholarLine: 0.6, greed: 0.45, sourConfide: 0.5, dreamAnswer: 0.6, partingDream: 0.4,
    honestTip: 0.1, honestCultTip: 0.7, smugglerSight: 0.15, pressTip: 0.3,
    chillCult: 0.3, chillOther: 0.05, evadeNote: 0.5, tellTruthful: 0.06, tellSuspicious: 0.15, mien: 0.35, mienParting: 0.15,
    feel: 0.3,                                  // in small talk, a word about someone they feel strongly about
    withhold: 0.5, volunteer: 0.35,             // someone against you keeps a sighting back; a friend tells you one unasked
    nameSuspect: 0.6,                           // asked whom they distrust (or blaming aloud), they name whom they suspect most
    coldParting: 0.3,                           // someone against you turns away before you have gone
    // and nothing anyone says is sure: making conversation shows you one of their habits (habit); anyone eyes an old
    // charm like a dealer now and then (greedOther; the liar and the calculating twice as readily); a promise is made
    // when a Watcher or a Dreamer takes your confidence (promise); an innocent pressed hard says something that sounds
    // like the cult's own words (falseSlip; the thief: falseSlipThief); the cult pressed turns it aside onto the thief
    // (cultTip); a word about the thief names the wrong one (tipWrong); the Dreamer asked whom they distrust answers with
    // a dream (dreamTell; anyone who only claims to dream, the cult among them: dreamAnswer); people put things in their
    // temperament's own way (ownWay); anyone has a bad day, keeps it short
    // or refuses a favour (offDay × how readily they show it; × offDayFriend with a friend)
    habit: 0.65, greedOther: 0.04, promise: 0.85, falseSlip: 0.03, falseSlipThief: 0.1, cultTip: 0.75, tipWrong: 0.08,
    dreamTell: 0.85, ownWay: 0.75, offDay: 0.05, offDayFriend: 0.4,
    partingTrue: 0.6, partingUnpromised: 0.1,   // a dream told as you leave: by the true Dreamer; by a pretender who never promised you any
    mienWrong: 0.08,                            // your impression of someone's manner is wrong (÷ how readily their feelings show)
    feelFalse: 0.3                              // a word about their own feelings is the opposite (× how untrue their gossip runs)
  },
  // how feelings show (people/manner.js), × the temperament's shows: warmth at trust 1, 2 and 3; coldness at trust −1
  // and −2; a flirtatious look; a face out of keeping with any feeling (a whim, a good or bad day); a flirtatious joke
  // told with a sly face; a warm word in parting; a feeling held back that shows in the face all the same
  manner: { warm: [0.3, 0.7, 0.9], cold: [0.55, 0.85], flirt: 0.6, whim: 0.1, joke: 0.7, parting: 0.2, leak: 0.25 },
  // claims (people/claims.js) and dreams told aloud (game/night.js). Whoever does not hold a part may claim one, the cult
  // and everyone else alike (TEMPERS liked; the thief may claim the watch as his cover besides), the Dreamer's or the
  // Watcher's (likedSeer); one who has claimed nothing and begins to look lost may claim one late (cornered × liked, a
  // dawn), the cult as cover and anyone else in fear, and so may one named guilty in a dream told aloud, on the spot
  // (counterSpot). Asked about the diary, one with nothing to claim now and then will not say (evadeAny; the honest,
  // evadeHonest), whoever they are.
  // Made-up dreams: a pretender's names someone guilty (fakeGuilty): someone they dislike or suspect, or once another
  // has dreamt aloud, now and then that rival (atDreamer); else it clears a friend. The cult's own dreamer weighs what a
  // dream is for (people/claims.js, cultDream): to give up the other of it once that one looks lost (CRAFT sacrifice:
  // people/cunning.js, busFor); to clear the other of it once it is watched (shield × CRAFT defend); to name whoever is
  // closing in on it, a rival dreamer among them (frame × TEMPERS frame); otherwise it dreams as a pretender would, by
  // its likes and fears (guilty at fakeGuilty + cultGuilty, making up for the clean dreams it tells for the other of
  // it), but a guilty dream names the other of it, while that one is not watched, at distance × (½ + CRAFT sacrifice),
  // to stand apart from it at no cost.
  // What a guilty dream told aloud draws, there and then (answers, by temperament: TEMPERS counter, retort; CRAFT
  // defend): anyone else who claims to dream may answer for the one named with a clean dream (defend × CRAFT defend):
  // for a friend, or, for the cult, for the other of it; the one named, a dream of their own that names the dreamer: one
  // who already claims to dream (counter: [their first dream aloud, one already dreaming aloud]), × desperate when they
  // already look lost; one who claimed nothing, on the spot (counterSpot); the true Dreamer, what they dreamt of their
  // accuser, if they dreamt them guilty (counterTrue). Otherwise the one named may call it a lie before everyone
  // (retort). A false claim you break by pressing someone is given up at pressed + their TEMPERS confess, whoever they are.
  // A watch sworn over your tent and broken (people/claims.js, failedWatch) is owned up to, or denied, as the one who
  // swore it is tempered (slept: [own, deny]); otherwise not spoken of at all.
  claims: {
    likedSeer: 0.5, cornered: 0.12, fakeGuilty: 0.4, atDreamer: 0.3,
    shield: 0.8, frame: 0.9, distance: 0.55, cultGuilty: 0.04,
    defend: 0.35, counter: [0.1, 0.3], desperate: 2, counterSpot: 0.04, counterTrue: 0.5, retort: 0.3,
    retortLine: 0.75,                           // a retort in their temperament's own way (hot, cold, plain); else another's
    evadeAny: 0.03, evadeHonest: 0.15,          // asked about the diary, one with nothing to claim will not say; the honest, more often
    pressed: 0.45,
    slept: {
      honest: [0.95, 0.01], conscientious: [0.8, 0.05], liar: [0.25, 0.55], calculating: [0.45, 0.35],
      detached: [0.45, 0.1], lightheaded: [0.75, 0.1], suspicious: [0.4, 0.35]
    }
  },
  likes: { mutual: 0.6, pact: 0.6, pull: 0.45, floor: 0.15, toYou: { '-1': 0.15, 0: 0.7, 1: 0.15 } },
  // the night's victim: more likely your friend, less likely someone the cult likes, more likely someone who suspects one
  // of the cult (per step of suspicion), less likely someone the camp already suspects (per suspecter: a useful scapegoat)
  victims: { yourFriend: 0.25, cultLike: 0.35, floor: 0.1, suspects: 0.25, scapegoat: 0.12 },
  confide: { odds: 0.7, trust: 0.1, min: 0.15, max: 0.95, again: 0.15, alerts: 0.9 }, // again: less welcome for each confidence they already took; alerts: a cultist confided in tells the cult
  gossip: { temper: 0.65, likeBias: 0.08, inventBond: 0.3, flipBond: 0.5 },
  rumours: {
    pressFriend: 0.3, pressFoe: 0.15, confideFriend: 0.2,                       // × how much they like the one you pressed or confided in
    slyBad: 0.6, slyWarm: 0.3, listenBad: 0.4, listenGood: 0.35,              // the sly cultist's talk is bad (slyWarm: with a warm face on); friends listen
    flip: 0.15,                                                                // talk about you that goes against how they feel
    talkBase: 0.5,                                                             // who talks about you: weight |their trust in you| + this
    told: 3,                                                                   // at most this many things you did are talked of a morning
    visitFriend: 0.2, rival: 0.5,                                              // a night visit (people/visit.js): her friends, × liking; one taken with her
    diedAny: 0.05                                                              // a death in your tent: anyone at all thinks the less of you, × how hard it is talked of
  },
  // public moments (people/camp.js): for each onlooker, the base chance (p) of being moved, and what adds to it or takes
  // from it; odds: that anyone speaks up at all. At most cap onlookers are moved each way by one moment; a heavy one (it
  // came seldom in the season's mood) moves each onlooker × heavy as readily.
  camp: {
    cap: 3, heavy: 1.5,
    spoke: 0.9,                                 // the one who speaks up at a moment moves a step in their trust in you
    calledOut:   { odds: 0.75, p: 0.15, friend: 0.3, suspicious: 0.1, loyal: 0.15, suspected: 0.1, thief: 0.1, defend: 0.3 },
    praised:     { odds: 0.7, p: 0.12, doubted: 0.25, grudge: 0.25 },
    grief:       { odds: 0.3, p: 0, friend: 0.1, late: 0.01, confided: 0.15, progress: 0.1, bitter: 0.6, trusting: 0.25, loyal: 0.15 },
    sleptWatch:  { p: 0.25, dislike: 0.2, friend: 0.3, suspicious: 0.1 },
    dreamt:      { p: 0.15, believe: 0.25, credit: 0.15, dislike: 0.15, doubt: 0.15, back: 0.15, friend: 0.25, suspicious: 0.1, resent: 0.5, answer: [0.25, 0.1] },
    dreamtClean: { p: 0.25, believe: 0.2, credit: 0.15 },
    blame:       { p: 0.1, dislike: 0.2, believe: 0.15, credit: 0.15, back: 0.3, resent: 0.4 },
    song:        { p: 0.12, dislike: 0.2, suspicious: 0.1 },
    confessed:   { liar: 0.15, suspicious: 0.15, respect: 0.4 },
    proven:      { clear: 0.6 },
    disproven:   { p: 0.15, friend: 0.3 },
    planted:     { p: 0.3, dislike: 0.15, suspicious: 0.1 },
    onto:        { odds: 0.45, p: 0.2, dislike: 0.15, suspicious: 0.1, back: 0.2 },
    kept:        { p: 0.3 }
  },
  // flirtation (people/flirt.js): dealt at the start (a woman toward you; anyone toward a person of the other sex); shows
  // while her trust in you or their liking holds; then only now and then, in these places (face: an answer given with a
  // flirtatious look). romance: whether a flirtation ends in more, told in the epilogue (game/fates.js): for two of the
  // camp, a base chance (one-sided: half of it), more if both are fond of each other, more if neither suspects the
  // other, less if either does; for you, at her trust 2 and 3; and mourning, for one taken with someone the night took
  flirt: {
    you: 0.4, pair: 0.25, trust: 2, like: 1, greet: 0.35, parting: 0.2, gossip: 0.15, aside: 0.5, feel: 0.6, face: 0.25,
    invent: 0.3, asideFalse: 0.02,              // flirtation gossip made up (× how untrue the speaker's gossip runs); an aside about one they are not taken with
    romance: { pair: 0.3, fond: 0.2, clear: 0.1, doubt: 0.25, you: [0.25, 0.5], mourn: 0.6 }
  },
  // a night visit (people/visit.js): once a season, from day `from`, a woman with a soft spot for you who trusts you
  // (flirt.trust) may come to your tent as the evening ends, at odds + perDead × the night's dead so far (never above
  // max); turned away, she trusts you less (hurt; a second step less at hurtMore); if she stays and is of the cult, she
  // may try to kill you herself (strike), and mostly she does it (kills); otherwise the night goes as any night: coming
  // for her, the cult may know where she sleeps (found: and then, past the Watcher at your tent and luck, she dies beside
  // you in your sleep) or finds her own tent empty; coming for you, past the Watcher, the bowl, the revolver and luck, it
  // finds two (through: her dead, you, both, or only the usual harm). A death in your tent is talked of (talked); the
  // morning after, if you both live, she is gone before you wake (leaves) or still there, whatever she is; your nerve
  // may mend (mend) and she may trust you the more (warm); the camp talks the more readily (talk ×), and a flirtation
  // that came to this may come to more (love: + the romance odds, game/fates.js)
  visit: {
    from: 2, odds: 0.04, perDead: 0.02, max: 0.15, hurt: 0.9, hurtMore: 0.3, strike: 0.3, kills: 0.9,
    through: { her: 0.4, you: 0.25, both: 0.15, hurt: 0.2 }, mend: 0.6, warm: 0.5, talk: 2, love: 0.25,
    found: 0.5,                                 // the cult coming for her knows where she sleeps tonight (else it finds her tent empty)
    leaves: 0.45,                               // she is gone before you wake (one of the cult out on the night's work is not yet back)
    talked: { 0: 1, 1: 2, 2: 1 }                // how hard the camp talks of a death in your tent (by weight: hardly, readily, wildly)
  },
  // the deed (game/deed.js): once a season, from day `from` (not the last evening), of an evening in camp instead of an
  // inquiry. In the small hours, whoever you went for may be away (away: the one of the cult who did the night's work,
  // not yet back: errand; the thief still out at work; two lovers still out together; anyone up and about at that hour:
  // restless; and the cult's dead), about as often whoever they are: the Watcher over them, if still alive, drives you
  // off (night.watched) and may know you (knows); otherwise it is done at kill (by the means; + soldier), or they wake,
  // fight you off, and may know you (wakes). Someone sees you about at seen × the means' noise (or × quietly, if you never
  // reached them; the Watcher watching your tent sees you go); a trace of your own is left at trace, and the camp links
  // it to you at link; a trace you laid is seen for what it is at plantSeen (and then linked to you at plantLink); a shot
  // fired is laid at your door at shot. It costs you (cost: [nerve, wounds]: done; failed, fought off with a cut to show for
  // it; watched, driven off; away). The morning after, whoever knows
  // may tell the camp (tell: by their trust in you, hostile to devoted; + cultTells for the cult; + sure if they saw your
  // face), else hint at it (hint), else keep quiet; each thing the camp has against you raises its suspicion of you a
  // step (S.onYou, to 3); the cult, whoever you went for, learns or guesses it was you (cultKnows; × unseen if the camp has
  // nothing on you), as if you had confided in it; caught, the camp judges you at once; suspected at 2 or more, at vote
  // (by suspicion) that morning, and at later × vote each dawn after. Judged (judge): each leans by the camp's suspicion
  // of you (+ caught if someone saw you), + friend of the one you went for, + victim (the one you went for, alive), −
  // trust × trust in you, + the dead, + the camp's anger, + cult × craft push for the cult, ± mood and whim; at expel or
  // more they would send you away, below keep they speak for you; sent away, the season ends; else the camp angers
  // (angered) and lets the suspicion go a step (cleared). The camp talks the more the morning after (talk ×).
  deed: {
    from: 3, kill: { knife: 0.6, revolver: 0.85 }, soldier: 0.1, knows: 0.6, wakes: 0.45,
    seen: 0.18, quietly: 0.5, noise: { knife: 1, revolver: 2 }, trace: 0.3, link: 0.4, plantSeen: 0.3, plantLink: 0.3, shot: 0.35,
    cost: { done: [3, 0], failed: [2, 1], watched: [2, 0], away: [1, 0] }, cultKnows: 0.5, unseen: 0.4,   // cost: [nerve, wounds]
    tell: [0.6, 0.35, 0.15, 0.05], cultTells: 0.05, sure: 0.25, hint: 0.6,
    vote: [0, 0, 0.45, 0.75], later: 0.5,
    judge: { caught: 1, friend: 1, victim: 3, trust: 1, cult: 0.3, expel: 2.2, keep: 0.6 },
    away: { errand: 0.1, thief: 0.08, tryst: 0.6, restless: 0.08 },
    angered: 1, cleared: 1, talk: 2
  },
  // the thief as witness (people/thief.js): sees it (at random, where he was, where he came to rob); hints when asked whom
  // he distrusts and in gossip; names the one he saw when pressed (pressed), coming clean of his own accord, or sent away
  thief: { witness: 0.08, near: 0.5, robbed: 0.4, hint: 0.6, gossip: 0.5, own: 0.6, sent: 0.8, pressed: 0.9, sure: 0.95, outright: 0.1, again: 0.3 }, // sure: he saw the one who did it, not someone else in the dark; outright: asked whom he distrusts, he names the one he saw; again: having named one, he would name another he saw
  // coming clean of one's own accord (people/pretences.js); aside: of a morning, to you alone rather than before everyone
  confess: { hidden: 0.5, afterDeath: 0.12, trusting: 0.08, rival: 0.2, dreamt: 0.15, caught: 0.3, blamed: 0.1, cap: 0.75, publicly: 0.15, aside: 0.4,
    atTrust: 0.8, thief: 0.3, staged: 0.02 },   // atTrust: a hidden Dreamer or Watcher, devoted, comes clean (× 1 − half their hiding); thief: × confess, the thief owns the smuggling; staged: a liar or a calculating one who said they had no part stages a coming clean as the Watcher, a morning, whoever they are (the cult, to be trusted; anyone else, to be listened to)
  // the morning's talk (people/social.js): at talk × how often talk comes now; then what kind, by weight
  morning: { talk: 0.6, you: 0.35, gossip: 0.45, blame: 0.2, mourn: 0.9, withhold: 0.25 },   // mourn: one who liked the night's dead mourns them; withhold: the camp will not take the dead for innocent, two of it having suspected them
  readings: { mistakeGloss: 0.75, mistakeReading: 0.5, hideWard: 0.5, cultSlip: 0.03, mistakeNone: 0.3, cultNone: 0.2 }, // cultSlip: the cult's gloss or reading of the power below, true by a slip; mistakeNone: a mistaken reading says the charm binds nothing; cultNone: so does the cult's lie about another ward
  descent: {
    companion: 0.1, torch: 0.15,                // every gate is easier for each loyal companion, and with a torch
    stairSlow: 0.55, stairFast: 0.6, eyes: 0.5, blind: 0.65,
    traitor: 0.35, traitorTorch: 0.1, traitorOccultist: 0.15, traitorSuspected: 0.2, traitorBlind: 0.15,
    steal: 0.35, feint: 0.1,                    // a traitor who waited until the sanctum has taken the true ward from you first; feint:
                                                // another of your charms instead, to make you give up the rest (and, × steal, one
                                                // though you carry no ward), so that what burns is the ward only as a rule
    calm: [0.7, 0.3],                           // at the fourth gate, the first one with you walks calm: a cultist waiting, anyone else
    volunteerFriend: [0.05, 0.25, 0.5],         // offers to come down with you, unasked: someone who hardly knows you (trust 0),
                                                // likes you (1), a friend (2 or more); hardly ever one turned against you (foeOffers)
    afraid: 0.12, duty: 0.35, grit: 0.25,       // asked to come: too afraid (trust 0 or 1); comes all the same, out of duty, though
                                                // turned against you (the honest and conscientious); or though they cannot bear a companion
    ward: 0.55, wardNamed: 0.15, wardOccultist: 0.1,
    rite: 0.25, riteLine: 0.04, riteLines: 5, ritePhilologist: 0.15, riteOccultist: 0.15,
    steady: 5, nerve: 0.02, doom: 0.03, extraCultist: 0.07, favour: 0.06,   // favour: each good turn between the gates
    again: 0.08,                                // a ward or the rite tried after a first act failed: the first shook the circle
    // the desperate acts, last resorts that owe nothing to what you learned, and each to be tried once: a shot at the
    // hierophant (while one of the cult stands in the circle / more), and fire (+ per loyal companion, − per step of the
    // rite)
    shootOne: 0.25, shootMore: 0.06, fire: 0.06, fireCompanion: 0.04, fireDoom: 0.005,
    wrongWard: 0.03, wrongRite: 0.04,           // a charm against another power, the counter-rite against the wrong one
    cleanNerve: 6,                              // a first-try ward or rite is a clean win with this much nerve left and a wound to spare,
    cleanSure: 0.9, cleanLucky: 0.03,           // ... all but always; otherwise a clean win now and then all the same
    moreTime: [0.97, 0.05],                     // after an act fails, the rite leaves you time for another: after the first, the second
                                                // (after a third, hardly ever: scale.rarest)
    falters: 0.03,                              // with nothing left to try, the rite breaks of itself on its last line
    emptied: 0.97,                              // with nobody of the cult in the circle, the rite fails (else the power finishes it)
    gate7: { refuse: 0.05, small: 0.5, follow: 0.05, more: 0.05 }, // the seventh gate will not have a thing (small: a thing
                                                // that would cost you little, the bowl or the brandy); one left to hold it
                                                // follows; it takes more of you than you gave
    afraidFriend: 0.03,                         // asked to come down, a friend is too afraid all the same
    turn: 0.95, turnFond: 0.3,                  // the cult that came down with you takes its place in the circle (× 1 − turnFond if fond of you)
    offered: 0.97, foe: 0.03, foeOffers: 0.01,  // one who offered comes when it comes to it; asked, one who cannot stand you comes all
                                                // the same; offers unasked
    company: 1,                                 // nerve steadied at the top of the stair by each companion who goes down with you
    // what a step costs when it goes wrong, [nerve, wounds]: the first gate taken slowly or fast, the fourth met eye to eye
    // or walked blind, a traitor's knife (heard coming, as you listened: knifeHeard), part of yourself left at the seventh,
    // and an act in the sanctum that fails
    cost: {
      slowStair: [1, 0], fastStair: [0, 1], eyes: [1, 0], blind: [0, 1], knife: [2, 1], knifeHeard: [2, 0], self: [2, 0],
      ward: [1, 0], rite: [1, 0], shoot: [1, 1], fire: [1, 1]
    }
  },
  // What waits between the gates (game/below.js): each choice's own odds, before the power's nature and the season.
  // Then: nature, + this for each way the power favours and − for each it will not abide (NATURE); known, for knowing
  // what you face (the right name given at the first gate); signSeen, for each of its signs you have seen; at shaken
  // nerve or less your hands shake (− shake); − rite for each step of the rite past start.doomWarn; − harder, always
  // (the stair is no place for anyone); and twice: two things between a pair of gates rather than one. What single trials weigh: the judges, each cultist you unmasked
  // (judgedRight) and each innocent you sent away (judgedWrong); the voices, each of the night's dead (dead); the passage
  // and the leap, each wound you carry (wounded); a faltering companion who trusts you (trusted); the Seven, each sign
  // seen (sevenSigns).
  below: {
    nature: 0.22, known: 0.08, signSeen: 0.02, shaken: 4, shake: 0.15, rite: 0.025, twice: 0.25, harder: 0.06,
    judgedRight: 0.06, judgedWrong: 0.12, dead: 0.04, wounded: 0.08, trusted: 0.15, sevenSigns: 0.03,
    name: 0.55, lie: 0.55, push: 0.5,           // the gatekeeper
    bow: 0.55, eyesDown: 0.55, stare: 0.5,      // the judges of the dead
    eat: 0.5, pour: 0.55, touch: 0.6,           // the table laid for the dead
    answer: 0.5, deaf: 0.55, lead: 0.65,        // the voices
    through: 0.5, round: 0.6, torch: 0.6,       // the power's own passage
    feedDog: 0.55, callDog: 0.5, stepOver: 0.5, // the black dog
    feed: 0.55, douse: 0.55, coal: 0.5,         // the brazier
    rock: 0.55, gift: 0.55, peek: 0.45,         // the cradle
    satchel: 0.5, peace: 0.55,                  // the bones, and Crane's satchel
    pool: 0.55, breakPool: 0.5, noLook: 0.6,    // the black pool
    steady: 0.65, follow: 0.55,                 // a companion who falters
    charms: 0.5, wing: 0.5,                     // the winged bull: charms that are not the ward; squeezing past
    read: 0.55, finish: 0.5, smash: 0.45,       // the scribe's tablet
    count: 0.5, ring: 0.55, ringThrough: 0.5,   // the Seven
    wade: 0.5, libation: 0.55, leap: 0.5,       // the channel of salt water
    // and nothing below is sure either: what the dead and the clay would tell you, they tell (learn; Crane's notebook:
    // satchelLine); the black pool and the winged bull answer truly (truthful); a faltering companion talked down comes on
    // ([after it went well, after it went badly]); one sent back up goes (goesBack)
    learn: 0.95, satchelLine: 0.75, truthful: 0.95, comesOn: [0.9, 0.7], goesBack: 0.95
  },
  // what became of everyone (game/fates.js), told without the dice: how often someone's fate has no more to it (codaNone),
  // one more line (to codaOne), or two; for you, one line (youOne) or two; and what counts as reading that cost you dear
  // (read: nerve lost to it; lines: tablet lines known), or horrors that stayed with you (nerve the horrors took).
  // last: rarely, what the season left in you is more than you can carry, and in the end you end it yourself (yourLast):
  // base for anyone who came home, × mad if your mind broke (the quiet ward), else × frayed if your nerve all but broke;
  // × jail in a cell for the one you killed; × killedInnocent (or killedCult) for the one you killed; × wronged for each
  // innocent sent away on your word; × grief for each friend the night took; × tent if someone died beside you; × read,
  // × horrors as above; × friend for each friend who came through (up to three); × loved if someone loves you; at most
  // max. why: how much each reason weighs in which one tells it (wronged and friends: for each).
  // after: now and then one of the seven who came through does not come through what it left in them (afterDeaths): base
  // for each, × gone if you did not come home; × sent for one sent away in disgrace (not the thief), × dreamer for the
  // true Dreamer, × grief for one who grieved, × below for one who went down with you, × jailed for one of the cult in a
  // cell, × thief for the thief; at most max each, and at most `most` in an ending (the likeliest). why: how much each
  // reason weighs in which one tells it; chosen: how often, told by that reason, it was by their own hand (else a death
  // nobody can account for; a priest keeps his vows).
  fates: {
    codaNone: 0.3, codaOne: 0.75, youOne: 0.6, read: 3, lines: 18, horrors: 4,
    last: {
      base: 0.014, mad: 5, frayed: 2, jail: 1.5, killedInnocent: 3, killedCult: 1.5, wronged: 1.4, grief: 1.3, tent: 1.6,
      read: 1.5, horrors: 1.4, friend: 0.8, loved: 0.4, max: 0.25,
      why: { plain: 1, deed: 5, deedCult: 2, wronged: 2, friends: 1.5, tent: 3, tablets: 1.5, horrors: 1.2 }
    },
    after: {
      base: 0.045, gone: 1.3, sent: 3, dreamer: 2, grief: 1.6, below: 1.6, jailed: 2.5, thief: 1.5, max: 0.3, most: 2,
      why: { plain: 1, cult: 3, wronged: 3, dreams: 2, grief: 2, below: 2, thief: 2 },
      chosen: { plain: 0.45, cult: 0.5, wronged: 0.7, dreams: 0.4, grief: 0.7, below: 0, thief: 0 }
    }
  },
  // the reckoning: how cleanly a season was won or lost (the conduct score), and the tiers it falls into. Your body and
  // mind count too: each wound left at the end (wound), nerve at the end at least steady × its most (+1), and nerve that
  // ever fell as low as frayed (−1)
  reckoning: {
    inquiry: 3, gate: 2, hierophant: 2, wrong: 3, refused: 1, walkout: 2, taken: 2, named: 2, misnamed: 1, earlyDay: 3, early: 2,
    confession: 1, reputation: 2,
    wound: 1, steady: 0.7, frayed: 2,
    deed: 1, deedCult: 2, deedInnocent: 5,     // the deed (game/deed.js): any attempt; then one of the cult killed, or anyone else
    tiers: { clean: 10, steady: 5, costly: 0, close: 4 }
  }
};
