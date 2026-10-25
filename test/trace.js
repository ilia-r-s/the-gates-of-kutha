// The dice trace. Seasons dealt from fixed seeds are played in Node (test/lib/kernel.js) by a seeded choice among each
// scene's choices; every die thrown is written down (core/random.js, TRACE) with what each scene, and every fifth step
// the casebook, says in both languages. A change that must not change play leaves every step of every season identical;
// a change to the game is recorded again on purpose, and the difference read (CLAUDE.md, rule 8).
//   node test/trace.js record                  record into test/golden/trace.json.gz
//   node test/trace.js check [quick]           play again and compare (quick: the golden seeds and 40 more)
//   node test/trace.js diff --base=<ref> [--seed=n]
//                                              play the seasons in <ref>'s code and in the working tree side by side,
//                                              and show the first step that differs: its words, or its dice and who
//                                              threw them
//   node test/trace.js why --seed=n [--name=…] every die of one season rolled on odds written as steps (core/odds.js),
//                                              with each step's share
//   node test/trace.js browser                 some of the same seasons played in Chromium: the kernel must agree
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const { kernel, HELPERS, ROOT } = require('./lib/kernel');

const FILE = path.join(__dirname, 'golden', 'trace.json.gz');
const GOLD = [11, 23, 37, 41, 59, 73, 97, 131];
const MORE = Array.from({ length: 200 }, (_, i) => 1000 + i);
const mode = process.argv[2] || 'check';
const opt = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const seedsFor = quick => GOLD.concat(quick ? MORE.slice(0, 40) : MORE);

// where two plays of one season first part: null if nowhere
function compare(a, b) {
  if (a.deal[0] !== b.deal[0]) return { seed: a.seed, at: 'the deal', what: `the dice (${a.deal[1]}, then ${b.deal[1]})` };
  for (let i = 0; i < Math.max(a.steps.length, b.steps.length); i++) {
    const x = a.steps[i],
      y = b.steps[i];
    if (!x || !y) return { seed: a.seed, at: `step ${i}`, what: `the season's length (${a.steps.length}, then ${b.steps.length} steps)` };
    if (x[0] !== y[0]) return { seed: a.seed, step: i, at: `step ${i}`, what: 'the words on the screen' };
    if (x[1] !== y[1]) return { seed: a.seed, step: i, at: `step ${i}`, what: `the dice (${x[2]}, then ${y[2]})` };
  }
  if (a.end !== b.end) return { seed: a.seed, at: 'the end', what: `${a.end}, then ${b.end}` };
  return null;
}

// the working tree as it was at a git ref, played by a kernel of its own
function kernelAt(ref) {
  if (!/^[\w./~^@{}-]+$/.test(ref)) throw new Error('not a git ref: ' + ref);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-base-'));
  const tar = execFileSync('git', ['-C', ROOT, 'archive', ref, 'build.js', 'src'], { maxBuffer: 1 << 28 });
  execFileSync('tar', ['-x', '-C', dir], { input: tar });
  return kernel({ root: dir });
}

// the first step two detailed plays part at, shown: the words (the first line that differs), or the dice (the first die
// that differs, the two before it, and who threw each)
function explain(a, b) {
  const d = compare(a, b);
  if (!d || d.step == null) return d;
  const [x, y] = [a.steps[d.step], b.steps[d.step]];
  if (x[0] !== y[0]) {
    const p = x[3].split('\n'),
      q = y[3].split('\n');
    const i = p.findIndex((l, j) => l !== q[j]);
    return { ...d, then: (p[i] || '').slice(0, 400), now: (q[i] || '').slice(0, 400) };
  }
  const i = x[4].findIndex((e, j) => !y[4][j] || JSON.stringify(e.slice(0, 3)) !== JSON.stringify(y[4][j].slice(0, 3)));
  const show = (dice, j) => dice.slice(Math.max(0, j - 2), j + 1).map(e => dieSaid(e) + `   [${e[3]}]`);
  return { ...d, die: i, then: show(x[4], i < 0 ? x[4].length : i), now: show(y[4], i < 0 ? y[4].length : i) };
}

const report = r => console.log(JSON.stringify(r, null, 1));
// a die as the trace keeps it: its kind, what it was asked and what came up, and the odds it was rolled on, step by
// step, when they were written as odds (core/odds.js)
const num = v => (typeof v === 'number' ? +v.toPrecision(6) : JSON.stringify(v));
const dieSaid = e =>
  `${e[0]} ${JSON.stringify(e[1])} → ${JSON.stringify(e[2])}` +
  (e.why
    ? `   ${e.why[0]}: ${e.why
        .slice(1)
        .map(([label, v]) => `${label} ${num(v)}`)
        .join(', ')}`
    : '');

if (mode === 'record') {
  const k = kernel(),
    seasons = seedsFor(false).map(s => k.season(s));
  fs.writeFileSync(FILE, zlib.gzipSync(JSON.stringify({ seasons })));
  report({
    recorded: seasons.length,
    steps: seasons.reduce((n, s) => n + s.steps.length, 0),
    dice: seasons.reduce((n, s) => n + s.steps.reduce((m, x) => m + x[2], s.deal[1]), 0)
  });
} else if (mode === 'check') {
  const rec = new Map(JSON.parse(zlib.gunzipSync(fs.readFileSync(FILE))).seasons.map(s => [s.seed, s]));
  const k = kernel(),
    seeds = seedsFor(process.argv[3] === 'quick');
  const differ = seeds.map(s => compare(rec.get(s), k.season(s))).filter(Boolean);
  report({ seasons: seeds.length, differ: differ.length, first: differ.slice(0, 5) });
} else if (mode === 'diff') {
  const base = kernelAt(opt('base') || 'HEAD'),
    now = kernel();
  const seeds = opt('seed') ? [+opt('seed')] : seedsFor(false);
  const s = seeds.find(x => compare(base.season(x), now.season(x)));
  report(
    s == null ? { seasons: seeds.length, differ: 0 } : { seasons: seeds.length, first: explain(base.season(s, true), now.season(s, true)) }
  );
} else if (mode === 'why') {
  // every die of one season rolled on odds written as steps, with its steps (--name: only odds whose name has it)
  const k = kernel(),
    s = k.season(+opt('seed') || GOLD[0], true),
    only = opt('name');
  const dice = [];
  s.steps.forEach((x, i) =>
    (x[4] || []).forEach(e => e.why && (!only || e.why[0].includes(only)) && dice.push(`step ${i}: ${dieSaid(e)}`))
  );
  report({ seed: s.seed, rolled: dice.length, dice: dice.slice(0, +opt('max') || 40) });
} else if (mode === 'browser') {
  const { run, open } = require('./lib/harness');
  run(async browser => {
    const { page, errors } = await open(browser, { seed: 1 });
    await page.evaluate(h => {
      window.sfx = () => {};
      (0, eval)(h);
    }, HELPERS);
    const k = kernel(),
      differ = [],
      seeds = GOLD.concat(MORE.slice(0, 12));
    for (const s of seeds) {
      // (a fresh record of the endings reached, as the kernel has: the ending page counts them)
      const inPage = await page.evaluate(seed => (localStorage.clear(), __k.season(seed)), s);
      const d = compare(inPage, k.season(s));
      if (d) differ.push(d);
    }
    return { seasons: seeds.length, differ: differ.length, first: differ.slice(0, 5), errors: errors.slice(0, 5) };
  });
} else {
  console.error('usage: node test/trace.js record | check [quick] | diff --base=<ref> [--seed=n] | why --seed=n [--name=] | browser');
  process.exit(2);
}
