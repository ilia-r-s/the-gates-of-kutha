// Engine invariants: separate prose dice, sourced cult knowledge, veiled dreams and playable policies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openNode } = require('./lib/harness');

async function check(body) {
  const { page, errors } = await openNode(null, { seed: 4242 });
  try {
    assert.deepEqual(await page.evaluate(body), []);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

test('prose variations cannot change the season dice or contaminate its trace', () =>
  check(() => {
    const bad = [];
    for (let seed = 0; seed < 32; seed++) {
      reseed(seed);
      const state = _seed,
        words = _words;
      TRACE = [];
      for (let n = 0; n < 20; n++) {
        sayPick(['a', 'b', 'c']);
        sayChance(0.5);
        sayShuffle([1, 2, 3]);
      }
      if (_seed !== state || TRACE.length) bad.push(`prose changed game dice at seed ${seed}`);
      if (_words === words) bad.push(`prose did not use its own dice at seed ${seed}`);
      const afterWords = [rand(), chance(0.5), pick([1, 2, 3])];
      reseed(seed);
      const plain = [rand(), chance(0.5), pick([1, 2, 3])];
      if (JSON.stringify(afterWords) !== JSON.stringify(plain)) bad.push(`season changed at seed ${seed}`);
    }
    TRACE = null;
    return bad;
  }));

test('private dreams and actions reach the cult only by observation or a later rumour', () =>
  check(() => {
    const bad = [];
    newGame('Marlowe', 'philologist', false, 23);
    RULES.scale.surest = 1;
    RULES.cunning.overhear = RULES.cunning.rumour = 1;
    const seer = freeChars().find(c => c.role === 'seer'),
      target = freeCult()[0];
    S.claim[seer.id] = { role: 'seer', said: S.day, recanted: null };
    S.here = { camp: [] };
    Suspicion.toldYou(seer, target, 'dream', 'camp', 'cult');
    Suspicion.sawYou('scholar', 'camp');
    const seed = _seed;
    if (Suspicion.dreamsKnown(seer) || Suspicion.knownActs('scholar')) bad.push('unobserved private knowledge leaked immediately');
    if (_seed !== seed) bad.push('unobserved same-day knowledge threw dice');
    S.day++;
    if (Suspicion.dreamsKnown(seer) !== 1 || Suspicion.knownActs('scholar') !== 1)
      bad.push('later rumour did not carry the private knowledge');
    const heard = _seed;
    Suspicion.dreamsKnown(seer);
    Suspicion.knownActs('scholar');
    if (_seed !== heard) bad.push('a settled hearing was rolled again');
    Suspicion.sayAloud(seer.id, target.id, 'cult', 'dream');
    if (Suspicion.dreamsKnown(seer) !== 1) bad.push('one dream counted twice, private and public');
    S.here.camp = freeCult().map(c => c.id);
    Suspicion.toldYou(seer, seer, 'dream', 'camp', 'clean');
    if (Suspicion.dreamsKnown(seer) !== 2) bad.push('an overheard dream was lost');
    return bad;
  }));

test('veiled dreams name a habit, carry no clear accusation, and Watchers can retract a dream claim', () =>
  check(() => {
    const bad = [];
    newGame('Marlowe', 'philologist', false, 37);
    const seer = freeChars().find(c => c.role === 'seer'),
      target = freeCult()[0],
      watcher = freeChars().find(c => c.role === 'warden');
    S.claim[seer.id] = { role: 'seer', said: S.day, recanted: null };
    S.testimony = [];
    S.clues = [];
    S.sights = [];
    S.claims = [];
    const before = Record.caseAgainst(target),
      dream = { t: target, cult: true, veil: CATS[0] };
    tellDream(seer, dream);
    if (S.testimony.some(t => t.kind === 'vision') || !S.testimony.some(t => t.kind === 'veiled'))
      bad.push('veiled dream stored as a clear vision');
    if (Record.caseAgainst(target) !== before) bad.push('veiled dream became a direct accusation');
    const words = dreamSaid(seer, dream).join(' ');
    if (words.includes(target.name) || words.includes(target.short)) bad.push('veiled dream named its subject');
    S.claim[watcher.id] = { role: 'seer', why: 'liked', said: S.day, recanted: null };
    comeClean(watcher, 'pressed');
    if (claimOf(watcher).role !== 'warden' || claimOf(watcher).was !== 'seer')
      bad.push('Watcher did not own the watch after retracting dreams');
    return bad;
  }));

test('every simulation policy completes seasons, and the inquisitor recognizes the current press labels', () =>
  check(() => {
    const bad = [];
    for (const [name, lean] of Object.entries(__T.LEANS)) {
      for (let game = 0; game < 6; game++) {
        __T.start(game % 3, game % 2 === 0, 4242 + game);
        if (name === 'inquisitor')
          for (const c of freeChars()) {
            if (!lean.test(X(DIALOG.press.label(c)))) bad.push(`inquisitor misses press choice for ${c.id}`);
          }
        const policy = __T.policies.human(__T.rng(100 + game), lean);
        if (!__T.play(policy, { maxSteps: 1500 })) bad.push(`${name} stuck in seed ${S.seed}`);
      }
    }
    return bad;
  }));
