// ===================== TIES: who likes whom, and how far each trusts you =====================
// The levels of feeling the rules ask about, each a question with its threshold in RULES.ties, so that "a friend" or
// "fond of" means one thing everywhere. Trust is each person's trust in you (c.rapport, from hostile to devoted);
// liking is one person's feeling toward another (people/social.js, likes, from cannot bear to close). A person or an
// id may be given wherever one is asked about.
const Ties = (() => {
  const id = x => (x && x.id) || x,
    feel = (a, b) => likes(id(a), id(b)),
    level = () => RULES.ties;
  return {
    // trust in you
    friend: c => c.rapport >= level().friend, // warm or devoted
    cordial: c => c.rapport >= level().cordial, // cordial, or warmer
    against: c => c.rapport <= level().against, // strained or hostile
    hostile: c => c.rapport <= level().hostile,
    // one person's liking for another
    fond: (a, b) => feel(a, b) >= level().fond,
    close: (a, b) => feel(a, b) >= level().close,
    dislikes: (a, b) => feel(a, b) <= level().dislike,
    cannotBear: (a, b) => feel(a, b) <= level().cannotBear
  };
})();
