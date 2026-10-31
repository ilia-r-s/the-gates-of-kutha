// One build, one shared browser, isolated contexts per test. Logic-only checks use the shipped code in Node.
// node test/run.js [full] [--only=build-tests,parity,...]    JOBS=n overrides the CPU/memory-aware default.
const { spawn } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { ROOT, browserOptions } = require('./lib/harness');
const { hasFailures } = require('./lib/report');
const full = process.argv.includes('full');
const opt = name => process.argv.find(s => s.startsWith(`--${name}=`))?.slice(name.length + 3);
const selection = opt('only')?.split(',');
const memoryJobs = Math.max(1, Math.floor((os.freemem() - 1024 ** 3) / (384 * 1024 ** 2)));
const JOBS = process.env.JOBS ? Number(process.env.JOBS) : Math.max(1, Math.min(os.availableParallelism(), memoryJobs, 8));
if (!Number.isInteger(JOBS) || JOBS < 1) throw new Error('JOBS must be a positive integer');
const step = (name, file, args, ok, weight = 1, browser = false) => ({ name, file, args, ok, weight, browser });
const zero = key => out => new RegExp(`"${key}": 0`).test(out);
const identical = out => /identical/.test(out) && !/leaks:|missing:|errors:/.test(out);
let steps = [
  step('build-tests', 'test/build.js', [], out => /\bfail 0\b/.test(out)),
  step('engine', 'test/engine.js', [], out => /\bfail 0\b/.test(out)),
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
        step('puzzle-simulation', 'test/puzzle.js', ['200'], out => Number(out.match(/"godPinned": "(\d+)%"/)?.[1]) >= 10, 4, true)
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
  server;
function runStep(s) {
  return new Promise(resolve => {
    const start = performance.now(),
      chunks = [];
    const child = spawn(process.execPath, [path.join(ROOT, s.file), ...s.args], {
      cwd: ROOT,
      env: { ...process.env, ...(server ? { KUTHA_BROWSER_WS: server.wsEndpoint() } : {}) },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    running.add(child);
    const timer = setTimeout(() => child.kill('SIGTERM'), 5 * 60 * 1000);
    child.stdout.on('data', b => chunks.push(b));
    child.stderr.on('data', b => chunks.push(b));
    child.on('error', e => chunks.push(Buffer.from(e.message)));
    child.on('close', status => {
      clearTimeout(timer);
      running.delete(child);
      const output = Buffer.concat(chunks).toString('utf8');
      const pass = status === 0 && s.ok(output) && !hasFailures(output);
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
  if (!(await runStep(step('build', 'build.js', [], out => /^built /m.test(out))))) return;
  try {
    if (steps.some(s => s.browser)) {
      const launchAt = performance.now();
      server = await chromium.launchServer(browserOptions());
      if (process.argv.includes('--timings')) console.log(`browser launch ${((performance.now() - launchAt) / 1000).toFixed(2)}s`);
      console.log(`browser: ${browserOptions().executablePath || 'Playwright Chromium'}; ${JOBS} workers`);
    }
    const queue = steps.sort((a, b) => b.weight - a.weight);
    await Promise.all(
      Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
        while (queue.length) await runStep(queue.shift());
      })
    );
  } finally {
    for (const child of running) child.kill('SIGTERM');
    if (server) {
      const closingAt = performance.now();
      await server.close();
      if (process.argv.includes('--timings')) console.log(`browser shutdown ${((performance.now() - closingAt) / 1000).toFixed(2)}s`);
    }
  }
  console.log(`${failed ? failed + ' failed' : 'all passed'} in ${((performance.now() - t0) / 1000).toFixed(2)}s (${JOBS} workers)`);
}
main()
  .then(() => {
    process.exitCode = failed ? 1 : 0;
  })
  .catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
