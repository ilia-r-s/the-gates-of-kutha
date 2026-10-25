// The game in Node. The modules of src/, in build.js order, joined into one script as the page joins them, run in a VM
// context with the page stubbed: seasons are dealt and played without a browser, and the machineries can be tested on
// their own (test/trace.js; DEVELOPING.md, "Tests"). show() keeps the scene instead of painting it; the rules need
// nothing else of the page, and a season played here is the same, die for die, as in Chromium.
//   const k = kernel();              the working tree's game (kernel({ root }) for another copy of the repository)
//   k.start(seed, bg, hardcore)      deal a season and arrive
//   k.choices(), k.choose(i)         the scene's choices, and choosing one, as a click would
//   k.scene(lang), k.book(lang)      what the scene and the casebook's four tabs say, in English or Russian
//   k.season(seed, detail)           a whole season from its seed, step by step, with the dice of each step
//   k.run(code)                      anything else, evaluated in the game's own scope (S, RULES, …)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');

// an element that answers every question harmlessly
function stubElement() {
  return {
    addEventListener() {},
    removeEventListener() {},
    removeAttribute() {},
    setAttribute() {},
    getAttribute: () => null,
    hasAttribute: () => false,
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild() {},
    insertBefore() {},
    remove() {},
    contains: () => false,
    focus() {},
    blur() {},
    click() {},
    scrollIntoView() {},
    closest: () => null,
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
    style: {},
    dataset: {},
    children: [],
    firstChild: null,
    hidden: false,
    innerHTML: '',
    textContent: '',
    value: ''
  };
}

// the helpers the kernel keeps inside the game's scope (they read S, S_ui, LANG and the casebook as the page does)
const HELPERS = `
globalThis.__k = {
  start(seed, bg, hardcore) {
    newGame('Marlowe', bg, hardcore, seed);
    arrivalScene();
  },
  choices: () => (S_ui.scene && S_ui.scene.choices ? S_ui.scene.choices.length : 0),
  choose(i) {
    S_ui.scene.choices[i].fn();
  },
  ended: () => !!(S && S.ended),
  inLang(lang, f) {
    const keep = LANG;
    LANG = lang;
    try {
      return f();
    } finally {
      LANG = keep;
    }
  },
  scene(lang) {
    return this.inLang(lang, () => {
      const sc = S_ui.scene || {};
      const ch = (sc.choices || []).map(c => {
        const under = typeof c.sub === 'function' ? c.sub() : c.sub;
        return X(c.html || c.label + (under ? ' | ' + under : ''));
      });
      return [X(sc.kicker || ''), X(sc.title || ''), X(sc.sub || ''), X((sc.body || []).join('')), ch.join(' || ')].join('\\n');
    });
  },
  book(lang) {
    if (!S) return '';
    return this.inLang(lang, () => [bookPeople(), bookEvidence(), bookOmens(), bookKit()].map(h => X(h)).join('\\n'));
  },
  // FNV-1a over a string, twice over, as 16 hex digits: the same in Node and in the page
  hash(s) {
    let a = 0x811c9dc5,
      b = 0x050c5d1f;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193);
      b = Math.imul(b ^ c, 0x01000193) ^ (b >>> 13);
    }
    return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
  },
  // One season from its seed, played by a seeded choice among the scene's choices (the golden recordings' generator):
  // for each step, what the scene said in both languages (and every fifth step the casebook's four tabs), then the dice
  // thrown in answer to the choice; the ending page last. detail: keep the words and the dice themselves, each die with
  // the names of the functions that threw it (for test/trace.js diff).
  season(seed, detail = false, maxSteps = 1500) {
    let x = (seed * 7919 + 1) | 0;
    const choose = n => {
      x = (x + 0x6d2b79f5) | 0;
      let t = Math.imul(x ^ (x >>> 15), 1 | x);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
    };
    const said = n =>
      this.scene('en') + '\\n' + this.scene('ru') + (n % 5 === 0 ? '\\n' + this.book('en') + '\\n' + this.book('ru') : '');
    const plain = dice => JSON.stringify(dice.map(d => d.slice(0, 3)));
    TRACE = [];
    TRACE_WHO = detail;
    try {
      this.start(seed, ['philologist', 'soldier', 'occultist'][seed % 3], seed % 2 === 1);
      const deal = TRACE.splice(0),
        steps = [];
      for (let n = 0; n < maxSteps; n++) {
        const text = said(n),
          k = this.choices();
        if (S.ended || !k) {
          steps.push(detail ? [this.hash(text), '', 0, text, []] : [this.hash(text), '', 0]);
          break;
        }
        this.choose(choose(k));
        const dice = TRACE.splice(0);
        steps.push(detail ? [this.hash(text), this.hash(plain(dice)), dice.length, text, dice] : [this.hash(text), this.hash(plain(dice)), dice.length]);
      }
      return { seed, end: S.endId || null, deal: [this.hash(plain(deal)), deal.length], steps };
    } finally {
      TRACE = null;
      TRACE_WHO = false;
    }
  }
};
`;

function kernel({ root = ROOT, pageSeed = 1 } = {}) {
  const { SCRIPT } = require(path.join(root, 'build.js'));
  const read = f => {
    const s = fs.readFileSync(path.join(root, 'src', f), 'utf8');
    return s.endsWith('\n') ? s : s + '\n';
  };
  const doc = {
    querySelector: () => stubElement(),
    querySelectorAll: () => [],
    getElementById: () => stubElement(),
    createElement: () => stubElement(),
    addEventListener() {},
    removeEventListener() {},
    body: stubElement(),
    documentElement: stubElement(),
    activeElement: null,
    readyState: 'complete',
    title: ''
  };
  const ctx = {
    console,
    Date,
    JSON,
    Promise,
    Math: Object.create(Math), // (the music's Math.random, kept apart: it never touches the season's dice)
    document: doc,
    navigator: { userAgent: 'node', language: 'en' },
    location: { search: '', hash: '', href: '' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    performance: { now: () => 0 },
    __seed: pageSeed
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(SCRIPT.map(read).join(''), ctx, { filename: 'kutha.js' });
  vm.runInContext('show = sc => { S_ui.scene = sc; };' + HELPERS, ctx, { filename: 'kernel.js' });
  const k = ctx.__k;
  return {
    run: code => vm.runInContext(code, ctx),
    start: (seed, bg = 'philologist', hardcore = false) => k.start(seed, bg, hardcore),
    choices: () => k.choices(),
    choose: i => k.choose(i),
    ended: () => k.ended(),
    scene: (lang = 'en') => k.scene(lang),
    book: (lang = 'en') => k.book(lang),
    // the dice trace (core/random.js): on, with or without the names of who threw each die; off, giving back the dice
    trace(on, who = false) {
      if (on) return vm.runInContext(`TRACE = []; TRACE_WHO = ${!!who};`, ctx);
      const t = vm.runInContext('TRACE', ctx);
      vm.runInContext('TRACE = null; TRACE_WHO = false;', ctx);
      return t || [];
    },
    // the dice thrown since the last call, the trace staying on
    dice: () => vm.runInContext('TRACE ? TRACE.splice(0) : []', ctx),
    // a whole season from its seed, step by step (HELPERS, season)
    season: (seed, detail = false) => k.season(seed, detail)
  };
}

// the policy the trace plays by: a seeded choice among the scene's choices (the golden recordings' generator)
function chooser(seed) {
  let x = (seed * 7919 + 1) | 0;
  return n => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
}

module.exports = { kernel, chooser, HELPERS, ROOT };
