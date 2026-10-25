// The test suite, in one command.
//   node test/run.js          quick: build, lint, format, top panel, golden transcripts (en, ru), forced branches,
//                             claims, social layer, puzzle soundness, every ending, after a doom, the dice trace,
//                             the Node tests, seeded seasons, the dice rules, a Russian bot
//                             (about a minute and a half on two cores)
//   node test/run.js full     the same with more games, plus the random and cheating bots and the puzzle simulation
//   JOBS=n node test/run.js   how many steps run at once (one for each processor core unless told otherwise)
// The build comes first. The other steps then run side by side, the longest first, each in a process (and a browser)
// of its own, so running them together changes nothing in what any of them plays or finds. Each step is its own
// script (see the list below); run one alone to see its whole report.
const { spawn, spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const full = process.argv[2] === 'full';
const JOBS = Math.max(1, +process.env.JOBS || os.cpus().length);
const ROOT = path.join(__dirname, '..');
const node = (script, ...args) => ['node', [path.join(__dirname, script), ...args]];
// [name, command, what its report must say, about how many seconds it takes (to start the longest first)]
const STEPS = [
  ['lint', node('lint.js'), out => /^clean/m.test(out), 2],
  // (the code as Prettier lays it out: npm run format)
  [
    'format',
    ['node', [path.join(ROOT, 'node_modules', 'prettier', 'bin', 'prettier.cjs'), '--check', '.']],
    out => /All matched files use Prettier code style/.test(out),
    3
  ],
  ['top panel', node('topbar.js'), out => /"problems": 0/.test(out), 2],
  ['golden en', node('golden.js', 'check'), out => /identical/.test(out), 11],
  ['golden ru', node('golden.js', 'check', '--lang=ru'), out => /identical/.test(out), 11],
  ['forced en', node('forced.js', 'check'), out => /identical/.test(out), 1],
  ['forced ru', node('forced.js', 'check', '--lang=ru'), out => /identical/.test(out) && !/leaks:|missing:/.test(out), 1],
  ['russian leaks', node('golden.js', 'leaks', '60'), out => /"leakSteps": 0/.test(out) && /"nMissing": 0/.test(out), 11],
  ['claims', node('claims.js', full ? '400' : '150'), out => /"nProblems": 0/.test(out), 2],
  ['social layer', node('social.js', full ? '300' : '80'), out => /"nProblems": 0/.test(out), full ? 31 : 8],
  ['puzzle soundness', node('gods.js', full ? '400' : '150'), out => /"nProblems": 0/.test(out) && /"soloPins": 0/.test(out), full ? 6 : 3],
  ['every ending', node('endings.js'), out => /"problems": 0/.test(out), 12],
  ['after a doom', node('dooms.js', full ? '300' : '80'), out => /"problems": 0/.test(out), full ? 25 : 8],
  // (the dice trace: seasons played in Node, every die and every word as recorded; and, in full, the same seasons in
  // Chromium, which the Node kernel must agree with)
  ['dice trace', node('trace.js', 'check', ...(full ? [] : ['quick'])), out => /"differ": 0/.test(out), full ? 70 : 16],
  ['node tests', node('node.js'), out => /"failed": 0/.test(out), 2],
  ...(full ? [['node and browser', node('trace.js', 'browser'), out => /"differ": 0/.test(out), 12]] : []),
  // (seasons from their seeds, each scene scanned: the same seeds every run, so a failure replays by its code)
  [
    'seeded seasons',
    node('replay.js', `--fuzz=${full ? 240 : 60}`, '--from=C0DE-0001', '--pol=random'),
    out => /"failing": 0/.test(out),
    full ? 40 : 10
  ],
  ['dice rules', node('dice.js', full ? '120' : '40'), out => /"problems": 0/.test(out), full ? 30 : 16],
  ['russian bot', node('rubot.js', full ? '30' : '8'), out => /"problems": 0/.test(out), full ? 40 : 11],
  ...(full
    ? [
        ['bots', node('bot.js'), out => !/"stuck": [1-9]/.test(out) && !/"errors": \["/.test(out) && /"cheatOk": true/.test(out), 15],
        // (the logician pins the power about one season in five as the game deals the tablets: under one in ten, the
        // puzzle has come apart)
        ['puzzle simulation', node('puzzle.js', '200'), out => +((out.match(/"godPinned": "(\d+)%"/) || [])[1] || 0) >= 10, 4]
      ]
    : [])
];
const BUILD = ['build', ['node', [path.join(__dirname, '..', 'build.js')]], out => /^built [\d.]+:/m.test(out)];
const t0 = Date.now();
let failed = 0;
// a step's verdict, with the end of its report if it failed
function verdict([name, , ok], out, status, t) {
  const pass = status === 0 && ok(out) && !/"?errors"?: \[\s*"/.test(out);
  if (!pass) failed++;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${name.padEnd(18)} ${((Date.now() - t) / 1000).toFixed(0).padStart(4)}s`);
  if (!pass)
    console.log(
      out
        .split('\n')
        .slice(-25)
        .map(l => '     ' + l)
        .join('\n')
    );
  return pass;
}
function runStep(step) {
  const [cmd, args] = step[1],
    t = Date.now();
  return new Promise(done => {
    const p = spawn(cmd, args, { cwd: ROOT }),
      chunks = [];
    p.stdout.on('data', d => chunks.push(d));
    p.stderr.on('data', d => chunks.push(d));
    p.on('close', status => done(verdict(step, Buffer.concat(chunks).toString('utf8'), status, t)));
  });
}
(async () => {
  const b = spawnSync(BUILD[1][0], BUILD[1][1], { encoding: 'utf8' });
  if (!verdict(BUILD, (b.stdout || '') + (b.stderr || ''), b.status, t0)) process.exit(1);
  const queue = STEPS.slice().sort((x, y) => y[3] - x[3]);
  await Promise.all(
    Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
      while (queue.length) await runStep(queue.shift());
    })
  );
  console.log(`${failed ? failed + ' failed' : 'all passed'} in ${((Date.now() - t0) / 60000).toFixed(1)} min (${JOBS} at a time)`);
  process.exit(failed ? 1 : 0);
})();
