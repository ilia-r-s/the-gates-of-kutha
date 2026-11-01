// Test-only randomness. Never advances either of the game's seeded streams.
// Mulberry32 uses explicit 32-bit multiplication; integer choices use the full output,
// not the damaged low bits of a floating-point linear congruential generator.
(function (root) {
  function random(seed) {
    let state = seed >>> 0;
    const next = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.int = n => {
      if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('A choice needs a positive integer size');
      return Math.floor(next() * n);
    };
    return next;
  }
  // The original release's fingerprint driver deliberately keeps its original
  // generator. New coverage and balance measurements must use random instead.
  function legacyLcg(seed) {
    let x = seed >>> 0;
    return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  }
  const api = { random, legacyLcg };
  if (typeof module !== 'undefined') module.exports = api;
  else root.__testRandom = api;
})(globalThis);
