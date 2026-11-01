// Shared local-work admission. Bounds are conservative reservations, not a guarantee
// against unrelated processes allocating memory between samples.
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const MiB = 1024 ** 2,
  GiB = 1024 ** 3;
const LIMITS = Object.freeze({
  automaticJobs: 5,
  nodeBytes: GiB,
  browserBytes: 2 * GiB,
  pollMs: 1000,
  waitMs: 30000,
  heapMiB: 512,
  outputBytes: 16 * MiB
});

function createProbe() {
  const parallelism = os.availableParallelism();
  const read = key => {
    try {
      return Number(execFileSync('/usr/sbin/sysctl', ['-n', key], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 500 }));
    } catch {
      return null;
    }
  };
  const performanceCores = process.platform === 'darwin' && process.arch === 'arm64' ? read('hw.perflevel0.physicalcpu') : null;
  let pressureAvailable = process.platform === 'darwin';
  return () => {
    const level = pressureAvailable ? read('kern.memorystatus_vm_pressure_level') : null;
    // This sysctl returns dispatch flags (1/2/4), not the kernel's internal enum.
    const pressure = { 1: 'normal', 2: 'warning', 4: 'critical' }[level] || null;
    if (pressureAvailable && pressure === null) pressureAvailable = false;
    return {
      total: os.totalmem(),
      available: process.availableMemory(),
      parallelism,
      performanceCores,
      load: os.loadavg()[0],
      pressure,
      pressureSource: pressure ? 'macOS sysctl' : 'unavailable; available-memory guard remains active'
    };
  };
}
const cost = task => task.memoryBytes ?? (task.browser ? LIMITS.browserBytes : LIMITS.nodeBytes);
function budget(sample, active = [], jobs = null) {
  if (
    ![sample.total, sample.available, sample.parallelism].every(Number.isFinite) ||
    sample.total <= 0 ||
    sample.available < 0 ||
    sample.parallelism < 1
  )
    throw Error('Resource guard could not read a valid memory/CPU budget; work is incomplete');
  if (jobs != null && (!Number.isSafeInteger(jobs) || jobs < 1)) throw Error('JOBS must be a positive integer');
  const reserve = Math.max(512 * MiB, Math.min(4 * GiB, sample.total * 0.15));
  const cores = sample.performanceCores > 0 ? Math.min(sample.performanceCores, sample.parallelism) : sample.parallelism;
  const ceiling = jobs ?? Math.max(1, Math.min(LIMITS.automaticJobs, cores - 2));
  const externalLoad = Math.max(0, (Number.isFinite(sample.load) ? sample.load : 0) - active.length);
  const cpu = jobs ?? Math.max(1, Math.min(ceiling, Math.floor(sample.parallelism - 2 - externalLoad)));
  const memory = Math.max(0, Math.min(sample.total / 2, sample.available - reserve));
  const reserved = active.reduce((n, task) => n + cost(task), 0);
  const critical = sample.pressure === 'critical' || sample.available < reserve / 2;
  const warning = sample.pressure === 'warning';
  return { reserve, ceiling, cpu, memory, reserved, critical, warning };
}

async function runQueue(
  tasks,
  execute,
  {
    jobs = process.env.JOBS ? Number(process.env.JOBS) : null,
    probe = createProbe(),
    pollMs = LIMITS.pollMs,
    waitMs = LIMITS.waitMs,
    stop = async () => {},
    notice = () => {},
    now = () => performance.now()
  } = {}
) {
  const queue = tasks.map((task, index) => ({ task, index })),
    active = new Map(),
    results = [];
  const stats = { completed: 0, peakWorkers: 0, waits: 0, minimumAvailable: Infinity };
  let blockedAt = null,
    error = null;
  for (const { task } of queue) if (!Number.isFinite(cost(task)) || cost(task) <= 0) throw Error('Invalid task memory reservation');
  const start = entry => {
    const promise = Promise.resolve().then(() => execute(entry.task));
    active.set(promise, entry);
    stats.peakWorkers = Math.max(stats.peakWorkers, active.size);
    promise
      .then(
        value => {
          results[entry.index] = value;
          stats.completed++;
        },
        failure => {
          error ||= failure;
        }
      )
      .finally(() => active.delete(promise));
  };
  try {
    while (queue.length || active.size) {
      if (error) throw error;
      const sample = probe(),
        plan = budget(
          sample,
          [...active.values()].map(e => e.task),
          jobs
        );
      stats.minimumAvailable = Math.min(stats.minimumAvailable, sample.available);
      if (plan.critical) throw Error('Resource guard stopped work before exhausting memory; checks are incomplete');
      let admitted = false;
      while (queue.length && active.size < plan.cpu && !plan.warning) {
        const next = queue[0];
        if (plan.reserved + cost(next.task) > plan.memory) break;
        queue.shift();
        plan.reserved += cost(next.task);
        start(next);
        admitted = true;
      }
      const blocked = queue.length && !admitted && (plan.warning || plan.reserved + cost(queue[0].task) > plan.memory);
      if (blocked && blockedAt === null) {
        blockedAt = now();
        stats.waits++;
        notice({ kind: 'wait', available: sample.available, reserve: plan.reserve, pressure: sample.pressure, active: active.size });
      } else if (!blocked && blockedAt !== null) {
        blockedAt = null;
        notice({ kind: 'resume' });
      }
      if (blocked && now() - blockedAt >= waitMs && (plan.warning || active.size === 0))
        throw Error('Resource guard could not obtain safe headroom within its wait limit; checks are incomplete');
      if (!queue.length && !active.size) break;
      let timer;
      await Promise.race([
        ...[...active.keys()].map(p => p.catch(() => {})),
        new Promise(resolve => {
          timer = setTimeout(resolve, pollMs);
        })
      ]);
      clearTimeout(timer);
    }
    if (error) throw error;
    return { results, ...stats };
  } catch (failure) {
    await stop(failure);
    await Promise.allSettled([...active.keys()]);
    throw failure;
  }
}

module.exports = { LIMITS, MiB, GiB, createProbe, budget, runQueue };
if (require.main === module) {
  const sample = createProbe()();
  console.log(
    JSON.stringify({ node: process.version, arch: process.arch, platform: process.platform, sample, budget: budget(sample) }, null, 2)
  );
}
