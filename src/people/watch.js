// Promises to watch, sworn watchers and what they saw.
const Watch = (() => {
  function swear(c) {
    if (!S.sworn.includes(c.id)) S.sworn.push(c.id);
  }
  const swore = id => S.sworn.includes(id);
  const promises = () => S.sworn.filter(id => isFree(C(id)));
  function release() {
    S.sworn = [];
  }
  function choose({ watcher: w }) {
    if (inYourTent(w.id)) return null;
    const pool = [
      'player',
      ...freeChars()
        .filter(c => c.id !== w.id)
        .map(c => c.id)
    ];
    return swore(w.id) && Ties.friend(w) && chance(RULES.night.watchKept) ? 'player' : pick(pool);
  }
  const holds = (night, x) => night.guard === x && chance(RULES.night.watched),
    seen = () => chance(RULES.night.seen),
    spared = () => chance(RULES.night.spared);
  return { swear: swear, promises: promises, release: release, choose: choose, holds: holds, seen: seen, spared: spared };
})();
