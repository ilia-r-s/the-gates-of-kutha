// One build, one shared browser, isolated contexts per test. Logic-only checks use the shipped code in Node.
// node test/run.js [full] [--only=build-tests,parity,...]    JOBS=n overrides CPU concurrency, never memory protection.
const { spawn } = require('node:child_process');
const path = require('node:path');
const { chromium, firefox, webkit } = require('playwright');
const { ROOT, browserOptions } = require('./lib/harness');
const { hasFailures } = require('./lib/report');
const { LIMITS, GiB, createProbe, budget, runQueue } = require('../tools/resources');
const full = process.argv.includes('full');
const opt = name => process.argv.find(s => s.startsWith(`--${name}=`))?.slice(name.length + 3);
const selection = opt('only')?.split(',');
const JOBS = process.env.JOBS ? Number(process.env.JOBS) : null;
const probe = createProbe(),
  initialBudget = budget(probe(), [], JOBS);
const step = (name, file, args, ok, weight = 1, browser = false) => ({ name, file, args, ok, weight, browser });
const zero = key => out => new RegExp(`"${key}": 0`).test(out);
const identical = out => /identical/.test(out) && !/leaks:|missing:|errors:/.test(out);
let steps = [
  step('build-tests', 'test/build.js', [], out => /\bfail 0\b/.test(out)),
  step('resources', 'test/resources.js', [], out => /\bfail 0\b/.test(out)),
  step('viewpoint', 'test/viewpoint.js', [], out => /\bfail 0\b/.test(out), 3),
  step('verification', 'test/verification.js', [], out => /\bfail 0\b/.test(out), 2),
  step('decisions', 'test/decisions.js', [], out => /\bfail 0\b/.test(out)),
  step('decision-policy', 'test/decision-policy.js', [], out => /\bfail 0\b/.test(out), 2),
  step('knowledge', 'test/knowledge.js', [], out => /\bfail 0\b/.test(out)),
  step('actor-reports', 'test/actor-reports.js', [], out => /\bfail 0\b/.test(out)),
  step('object-reactions', 'test/object-reactions.js', [], out => /\bfail 0\b/.test(out)),
  step('slips', 'test/slips.js', [], out => /\bfail 0\b/.test(out)),
  step('expressions', 'test/expressions.js', [], out => /\bfail 0\b/.test(out)),
  step('narrative', 'test/narrative.js', [], out => /\bfail 0\b/.test(out)),
  step('nature', 'test/nature.js', [], out => /\bfail 0\b/.test(out)),
  step('night-pacing', 'test/night-pacing.js', [], out => /\bfail 0\b/.test(out)),
  step('hazards', 'test/hazards.js', [], out => /\bfail 0\b/.test(out)),
  step('cult', 'test/cult.js', [], out => /\bfail 0\b/.test(out)),
  step('engine', 'test/engine.js', [], out => /\bfail 0\b/.test(out)),
  step('usability-engine', 'test/usability-engine.js', [], out => /\bfail 0\b/.test(out), 3),
  step('seeds', 'test/seeds.js', [], out => /\bfail 0\b/.test(out), 2),
  step('audit', 'tools/audit.js', ['--check'], out => /\"unusedExports\": \[\]/.test(out)),
  step('site', 'test/site.js', [], out => /\bfail 0\b/.test(out)),
  step('lint', 'test/lint.js', [], out => /^clean/m.test(out)),
  step(
    'format',
    'node_modules/prettier/bin/prettier.cjs',
    ['--check', 'src', 'test', 'sim', 'tools', 'build.js', 'package.json', 'package-lock.json', '.github'],
    out => /All matched files use Prettier code style/.test(out)
  ),
  step('top-panel', 'test/topbar.js', [], zero('problems'), 2, true),
  step('usability', 'test/usability.js', [], out => /\bfail 0\b/.test(out), 8, true),
  step('golden-en', 'test/golden.js', ['check'], identical, 10, true),
  step('golden-ru', 'test/golden.js', ['check', '--lang=ru'], identical, 10, true),
  step('forced-en', 'test/forced.js', ['check'], identical, 3, true),
  step('forced-ru', 'test/forced.js', ['check', '--lang=ru'], identical, 3, true),
  step('russian-leaks', 'test/golden.js', ['leaks', '60'], out => zero('leakSteps')(out) && zero('nMissing')(out), 10, true),
  step('claims', 'test/claims.js', [full ? '400' : '150'], zero('nProblems')),
  step('social', 'test/social.js', [full ? '300' : '80'], zero('nProblems'), 2),
  step('puzzle-soundness', 'test/gods.js', [full ? '400' : '150'], out => zero('nProblems')(out) && zero('soloPins')(out), 4),
  step('endings', 'test/endings.js', [], zero('problems'), 4, true),
  step('dooms', 'test/dooms.js', [full ? '300' : '80'], zero('problems'), 2),
  step('seeded-seasons', 'test/replay.js', [`--fuzz=${full ? 240 : 60}`, '--from=C0DE-0001', '--pol=random'], zero('failing'), 12, true),
  step('dice', 'test/dice.js', [full ? '120' : '40'], zero('problems'), 15, true),
  step('russian-bot', 'test/rubot.js', [full ? '30' : '8'], zero('problems'), 8, true),
  step('parity', 'test/parity.js', [], zero('problems'), 12, true),
  ...(full
    ? [
        step('bots', 'test/bot.js', [], out => !/"stuck": [1-9]/.test(out) && /"cheatOk": true/.test(out), 10, true),
        step(
          'puzzle-simulation',
          'test/puzzle.js',
          ['200'],
          out => Number(out.match(/"godPinned": "(\d+)%"/)?.[1]) >= 10 && zero('stuck')(out),
          4
        ),
        step('tell-fairness', 'sim/tells.js', ['2000', '--seed=4242', '--check', '--allow-insufficient'], out => /"outside":0/.test(out), 8)
      ]
    : [])
];
if (selection) {
  for (const name of selection)
    if (!steps.some(s => s.name === name)) throw new Error(`Unknown check ${name}. Available: ${steps.map(s => s.name).join(',')}`);
  steps = steps.filter(s => selection.includes(s.name));
}

const t0 = performance.now();
const running = new Set();
let failed = 0,
  server,
  peakWorkers = 0;
function terminate(child) {
  child.kill('SIGTERM');
  const timer = setTimeout(() => child.kill('SIGKILL'), 2000);
  timer.unref();
  child.once('close', () => clearTimeout(timer));
}
function stopRunning() {
  for (const child of running) terminate(child);
}
async function guarded(tasks, execute = runStep) {
  const result = await runQueue(tasks, execute, {
    jobs: JOBS,
    probe,
    stop: stopRunning,
    notice: event => {
      if (event.kind === 'wait')
        console.log(
          `resource guard: waiting for headroom (${(event.available / GiB).toFixed(1)} GiB available; ${(event.reserve / GiB).toFixed(1)} GiB reserved for other work)`
        );
    }
  });
  peakWorkers = Math.max(peakWorkers, result.peakWorkers);
  return result.results;
}
function runStep(s) {
  return new Promise(resolve => {
    const start = performance.now(),
      chunks = [];
    let bytes = 0,
      overflow = false;
    const child = spawn(process.execPath, [`--max-old-space-size=${LIMITS.heapMiB}`, path.join(ROOT, s.file), ...s.args], {
      cwd: ROOT,
      env: { ...process.env, ...(server ? { KUTHA_BROWSER_WS: server.wsEndpoint() } : {}) },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    running.add(child);
    const timer = setTimeout(() => terminate(child), 5 * 60 * 1000);
    const collect = b => {
      if (overflow) return;
      bytes += b.length;
      if (bytes > LIMITS.outputBytes) {
        overflow = true;
        chunks.push(Buffer.from('\nResource guard: test output exceeded its bounded buffer; check is incomplete.\n'));
        terminate(child);
      } else chunks.push(b);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', e => chunks.push(Buffer.from(e.message)));
    child.on('close', status => {
      clearTimeout(timer);
      running.delete(child);
      const output = Buffer.concat(chunks).toString('utf8');
      const pass = status === 0 && !overflow && s.ok(output) && !hasFailures(output);
      if (!pass) failed++;
      console.log(`${pass ? 'ok  ' : 'FAIL'} ${s.name.padEnd(20)} ${((performance.now() - start) / 1000).toFixed(2)}s`);
      if (!pass)
        console.log(
          output
            .split('\n')
            .slice(-32)
            .map(l => '  ' + l)
            .join('\n')
        );
      resolve(pass);
    });
  });
}
async function main() {
  console.log(
    `resources: up to ${initialBudget.ceiling} workers; ${(initialBudget.reserve / GiB).toFixed(1)} GiB reserved for other work; adaptive memory protection`
  );
  const [built] = await guarded([step('build', 'build.js', [], out => /^built /m.test(out))]);
  if (!built) return;
  try {
    if (steps.some(s => s.browser) && !process.env.KUTHA_BROWSER_WS) {
      const launchAt = performance.now(),
        options = browserOptions(),
        name = process.env.KUTHA_BROWSER || 'chromium';
      await guarded([{ name: 'browser launch', browser: true }], async () => {
        server = await { chromium, firefox, webkit }[name].launchServer(options);
      });
      if (process.argv.includes('--timings')) console.log(`browser launch ${((performance.now() - launchAt) / 1000).toFixed(2)}s`);
      console.log(`browser: ${options.executablePath || 'Playwright ' + name}`);
    } else if (steps.some(s => s.browser)) console.log('browser: existing isolated test server');
    const queue = steps.sort((a, b) => b.weight - a.weight);
    await guarded(queue);
  } finally {
    stopRunning();
    if (server) {
      const closingAt = performance.now();
      await server.close();
      if (process.argv.includes('--timings')) console.log(`browser shutdown ${((performance.now() - closingAt) / 1000).toFixed(2)}s`);
    }
  }
  console.log(
    `${failed ? failed + ' failed' : 'all passed'} in ${((performance.now() - t0) / 1000).toFixed(2)}s (peak ${peakWorkers} workers)`
  );
}
main()
  .then(() => {
    process.exitCode = failed ? 1 : 0;
  })
  .catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
