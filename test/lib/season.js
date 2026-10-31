const { createHash } = require('node:crypto');

function play({ seed, bg, hardcore, lang }) {
  sfx = musicChange = () => {};
  setLang(lang);
  TRACE = [];
  __T.start(bg, hardcore, seed);
  const policy = __T.policies.human(__T.lcg(seed ^ (bg + 1)));
  const trail = [];
  const ended = __T.play(
    buttons => {
      const chosen = policy(buttons) || buttons[0];
      trail.push([S.phase, buttons.map(b => b.textContent), buttons.indexOf(chosen)]);
      return chosen;
    },
    { maxSteps: 1500 }
  );
  const met = new Map();
  const state = JSON.stringify(S, function (key, value) {
    if (typeof value === 'string') return X(value);
    if (!value || typeof value !== 'object') return value;
    if (met.has(value)) return '#' + met.get(value);
    met.set(value, met.size);
    return value;
  });
  return { ended, trail, state, dice: TRACE, seed: _seed, words: _words };
}

const cases = [0, 3, 4242, 0xffffffff].flatMap(seed =>
  [0, 1, 2].flatMap(bg => [false, true].flatMap(hardcore => ['en', 'ru'].map(lang => ({ seed, bg, hardcore, lang }))))
);
const caseId = ({ seed, bg, hardcore, lang }) => [seed, bg, Number(hardcore), lang].join('/');
const fingerprint = result =>
  Object.fromEntries(Object.entries(result).map(([key, value]) => [key, createHash('sha256').update(JSON.stringify(value)).digest('hex')]));
module.exports = { play, cases, caseId, fingerprint };
