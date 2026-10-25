// ===================== THE PARTS: each part's playbook =====================
// What each part does where a part decides something: the cult, the Dreamer, the Watcher, the thief, and anyone, which
// is what a part does where it has nothing of its own (and what everyone else does). Each decision point takes the same
// arguments for every part; Parts.move(c, point) is c's own move there, or anyone's, and the game asks for it so. The
// moves live beside the words they are told in; this table is where a part's strategy can be read whole, and where a
// part is given a move of its own.
//
// Decided here, part by part:
//   claim      what they claim at the start, from their temperament (t) and whether they are honest (people/claims.js):
//              { role, why }
//   name       whom they name when you ask whom they distrust (people/dialog.js, whomToBlame): { tip } or { target }
//   nameAloud  whom they blame aloud at breakfast (people/social.js, breakfastBlame), or nobody
//   dream      the dream they make up for the day, if they say they dream (people/claims.js): { t, cult }, or nothing
//   pressed    what comes of it when you press them (people/dialog.js, press), once a story has not broken
//   lieLow     the cult: whether it comes for no one tonight (people/cunning.js, liesLow)
//   victim     the cult: whom it comes for (game/night.js, chooseVictim)
//   watch      the Watcher: whom they watch over tonight (people/watch.js)
//
// Decided elsewhere, for all parts at once, each part as the rules say there:
//   - giving a claim up, or staging one (people/pretences.js, pretence: what each part could come clean about; the odds
//     by case, DROPS_PRETENCE), claiming late (people/claims.js, cornerClaims), on the spot (game/night.js, answerDream);
//   - where they spend the night and what they say of it, what they saw, who backs whom (people/alibis.js, planAlibis:
//     the Watcher always in camp, the thief out on business, the cult's made-up sightings);
//   - a promise to watch your tent (people/watch.js: the Watcher's, the cult's, anyone else's);
//   - the Dreamer's visions and every dream told aloud, defended, answered or called a lie (game/night.js, people/claims.js:
//     cultDream, defenderOf, answerDream);
//   - what the cult does at night beyond its choice of victim: betrayal, the trace it lays or sweeps (people/cunning.js,
//     game/night.js), and the thief what he sees (people/thief.js);
//   - lore: the cult's lies about the power below (world/powers.js);
//   - the descent: who offers to come, who strikes and who turns (people/cunning.js, game/finale.js).
const Parts = (() => {
  const PLAYBOOK = {
    anyone: {
      claim: (c, t, honest) => CLAIM_AS.anyone(c, t, honest),
      name: (c, others, g) => anyoneNames(c, others, g),
      nameAloud: (s, others) => innocentBlames(s, others),
      dream: c => fakeDream(c),
      pressed: (c, ok, you, before) => pressedAnyone(c, ok, you, before)
    },
    cult: {
      claim: (c, t, honest) => CLAIM_AS.cult(c, t, honest),
      name: (c, others, g) => cultNames(c, others, g),
      nameAloud: (s, others) => cultNamesAloud(s, others),
      dream: c => cultDream(c),
      pressed: (c, ok, you, before) => pressedCult(c, ok, you, before),
      lieLow: night => liesLow(night),
      victim: night => chooseVictim(night)
    },
    seer: {
      claim: (c, t, honest) => CLAIM_AS.seer(c, t, honest)
    },
    warden: {
      claim: (c, t, honest) => CLAIM_AS.warden(c, t, honest),
      watch: night => Watch.choose(night)
    },
    smuggler: {
      claim: (c, t, honest) => CLAIM_AS.smuggler(c, t, honest),
      pressed: (c, ok, you, before) => pressedThief(c, ok, you, before)
    }
  };
  // someone's move at a decision point: their part's own, or anyone's
  const move = (c, point) => (PLAYBOOK[c.role] && PLAYBOOK[c.role][point]) || PLAYBOOK.anyone[point];
  return { playbook: PLAYBOOK, move, of: role => PLAYBOOK[role] };
})();
