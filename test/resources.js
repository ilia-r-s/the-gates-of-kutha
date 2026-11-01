const { test } = require('node:test');
const assert = require('node:assert/strict');
const { GiB, budget, runQueue } = require('../tools/resources');
const normal = { total: 36 * GiB, available: 20 * GiB, parallelism: 14, performanceCores: 10, load: 2, pressure: 'normal' };

test('resource budget reserves desktop headroom and performance cores', () => {
  const p = budget(normal);
  assert.equal(p.ceiling, 5);
  assert.equal(p.reserve, 4 * GiB);
  assert.equal(p.memory, 16 * GiB);
  assert.equal(budget({ ...normal, load: 13 }).cpu, 1);
  assert.equal(budget({ ...normal, total: 2 * GiB, available: 1.5 * GiB, parallelism: 2, performanceCores: null }).cpu, 1);
});
test('JOBS only changes the CPU ceiling and never removes the memory guard', () => {
  const p = budget({ ...normal, available: 5 * GiB }, [], 64);
  assert.equal(p.cpu, 64);
  assert.equal(p.memory, GiB);
  assert.equal(budget({ ...normal, available: GiB }, [], 64).critical, true);
  for (const jobs of [0, -1, NaN, 1.5]) assert.throws(() => budget(normal, [], jobs), /positive integer/);
  assert.throws(() => budget({ ...normal, available: NaN }), /incomplete/);
});
test('a constrained queue completes every task once while limiting combined reservations', async () => {
  let active = 0,
    peak = 0;
  const seen = [],
    tasks = Array.from({ length: 9 }, (_, id) => ({ id }));
  const result = await runQueue(
    tasks,
    async task => {
      active++;
      peak = Math.max(peak, active);
      seen.push(task.id);
      await new Promise(resolve => setTimeout(resolve, 3));
      active--;
      return task.id;
    },
    { jobs: 64, probe: () => ({ ...normal, available: 6 * GiB }), pollMs: 1 }
  );
  assert.equal(peak, 2);
  assert.equal(result.completed, 9);
  assert.deepEqual(
    result.results,
    tasks.map(t => t.id)
  );
  assert.equal(new Set(seen).size, 9);
});
test('a memory warning pauses admission and resumes without dropping queued work', async () => {
  let warned = true,
    calls = 0;
  const events = [];
  const result = await runQueue([{ id: 1 }, { id: 2 }], async t => t.id, {
    probe: () => {
      calls++;
      if (calls > 2) warned = false;
      return { ...normal, pressure: warned ? 'warning' : 'normal' };
    },
    pollMs: 1,
    notice: e => events.push(e.kind)
  });
  assert.deepEqual(result.results, [1, 2]);
  assert.deepEqual(events, ['wait', 'resume']);
});
test('critical memory during work stops owned tasks and cannot report success', async () => {
  let samples = 0,
    release,
    stopped = 0;
  await assert.rejects(
    runQueue(
      [{}],
      () =>
        new Promise(resolve => {
          release = resolve;
        }),
      {
        probe: () => ({ ...normal, pressure: ++samples > 1 ? 'critical' : 'normal' }),
        pollMs: 1,
        stop: () => {
          stopped++;
          release(false);
        }
      }
    ),
    /incomplete/
  );
  assert.equal(stopped, 1);
});
test('persistent lack of headroom fails explicitly before starting any task', async () => {
  let executed = 0;
  await assert.rejects(
    runQueue(
      [{}],
      () => {
        executed++;
      },
      {
        probe: () => ({ ...normal, available: 4.5 * GiB }),
        pollMs: 1,
        waitMs: 3
      }
    ),
    /incomplete/
  );
  assert.equal(executed, 0);
});
test('rejected work aborts the queue and preserves the original failure', async () => {
  let stopped = false;
  await assert.rejects(
    runQueue(
      [{}, {}],
      () => {
        throw Error('deliberate test failure');
      },
      {
        jobs: 1,
        probe: () => normal,
        stop: () => {
          stopped = true;
        }
      }
    ),
    /deliberate test failure/
  );
  assert.equal(stopped, true);
});
