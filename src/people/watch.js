// ===================== THE WATCH: promises to watch your tent, and the Watcher's nights =====================
// One machinery for the watch. Anyone who says they keep watch, and trusts you, may swear to watch your tent tonight
// (people/dialog.js; and coming clean: people/pretences.js): the true Watcher; one of the cult, who keeps it, mostly,
// to be trusted for it (game/night.js, the night's victim); or anyone else, who sleeps through it. The promises are one
// record (S.sworn: the latest of each kind, the Watcher's, the cult's and anyone else's), held to account the night they
// were made (game/night.js, theNight), the broken one told the morning after (people/claims.js, failedWatch). Each night
// the Watcher watches over someone (choose: you, if they promised it and trust you, mostly; otherwise anyone at all, you
// included, and the cult too); whoever comes for the one watched over is driven off, mostly (holds), and the Watcher is
// seen doing it, now and then (seen). Whatever the watch, now and then an attack fails by luck (spared).
const Watch = (() => {
  // ---------- promises ----------
  // which kind of promise someone's is: the true Watcher's, the cult's, or anyone else's
  const slotOf = c => (c.role === 'warden' ? 'warden' : c.role === 'cult' ? 'cult' : 'other');
  // someone swears to watch your tent tonight (as a promise of its kind, or of the kind given: one who stages coming
  // clean as the Watcher speaks as the Watcher would)
  function swear(c, slot = slotOf(c)) {
    S.sworn[slot] = c.id;
  }
  const sworn = slot => S.sworn[slot];
  function unswear(slot) {
    S.sworn[slot] = null;
  }

  // ---------- the night ----------
  // Whom the Watcher watches over tonight: you, if they promised it and trust you, mostly (night.watchKept); otherwise
  // anyone at all, you included, and the cult too, for the Watcher cannot tell. The Watcher who spent the night in your
  // tent watched nobody's.
  function choose({ watcher: w }) {
    if (inYourTent(w.id)) return null;
    const pool = [
      'player',
      ...freeChars()
        .filter(c => c.id !== w.id)
        .map(c => c.id)
    ];
    return sworn('warden') === w.id && Ties.friend(w) && chance(RULES.night.watchKept) ? 'player' : pick(pool);
  }
  // whoever comes tonight for the one the Watcher watches over (x: an id, or 'player') is driven off, mostly
  // (night.watched); the Watcher is seen doing it, now and then (night.seen); and whatever the watch, now and then an
  // attack fails by luck (night.spared)
  const holds = (night, x) => night.guard === x && chance(RULES.night.watched),
    seen = () => chance(RULES.night.seen),
    spared = () => chance(RULES.night.spared);

  return { slotOf, swear, sworn, unswear, choose, holds, seen, spared };
})();
