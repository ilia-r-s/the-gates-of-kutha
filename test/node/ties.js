// The levels of feeling (people/ties.js, RULES.ties): each question answers as its threshold says, at every level.
const assert = require('assert');

module.exports = {
  'trust in you, at every level from hostile to devoted'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]), out = [];
      for (let t = -2; t <= 3; t++) {
        c.rapport = t;
        out.push([t, Ties.friend(c), Ties.cordial(c), Ties.against(c), Ties.hostile(c)]);
      }
      return out;
    })()`);
    assert.deepStrictEqual(r, [
      [-2, false, false, true, true],
      [-1, false, false, true, false],
      [0, false, false, false, false],
      [1, false, true, false, false],
      [2, true, true, false, false],
      [3, true, true, false, false]
    ]);
  },
  'liking, at every level from cannot bear to close, by person or by id'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const a = C(S.order[0]), b = C(S.order[1]), out = [];
      for (let l = -2; l <= 2; l++) {
        S.like[a.id][b.id] = l;
        out.push([l, Ties.fond(a, b), Ties.close(a.id, b.id), Ties.dislikes(a, b.id), Ties.cannotBear(a.id, b)]);
      }
      return out;
    })()`);
    assert.deepStrictEqual(r, [
      [-2, false, false, true, true],
      [-1, false, false, true, false],
      [0, false, false, false, false],
      [1, true, false, false, false],
      [2, true, true, false, false]
    ]);
  },
  'the levels are read from RULES when asked'(k) {
    const r = k.value(`(() => {
      newGame('Marlowe', 'soldier', false, 3);
      const c = C(S.order[0]);
      c.rapport = 1;
      const before = Ties.friend(c);
      RULES.ties.friend = 1;
      const after = Ties.friend(c);
      RULES.ties.friend = 2;
      return [before, after];
    })()`);
    assert.deepStrictEqual(r, [false, true]);
  }
};
