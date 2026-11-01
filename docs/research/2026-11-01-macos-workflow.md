# Native macOS workflow — 1 November 2026

The owner requested a workflow that uses the current Mac effectively while
remaining responsive and avoiding memory overcommit. The local tools already run
natively; the main gap was admission control for concurrent tests. No software,
driver, system setting or model was installed for this audit. No serial number or
device identifier was collected.

## Observed environment

| Resource | Verified locally |
| --- | --- |
| Host | macOS 27.2, Apple M4 Max |
| CPU | 10 performance cores and 4 efficiency cores; 14 logical cores |
| Memory | 36 GiB unified memory |
| GPU | Apple M4 Max, 32 GPU cores, Metal supported |
| Node | 26.13.0, `arm64`; the local binary is Mach-O ARM64 |
| npm / Playwright / Prettier | 11.20.0 / 1.64.1 / 3.9.10 |
| Developer tools | Existing Xcode 27.2, build 27B52 |
| Browsers | Existing isolated Chrome 156.0.8078.80; previously verified Firefox 157 and WebKit 27.2 |

The core split came from read-only `hw.perflevel*` queries; the GPU inventory
selected only model, core count and Metal support from `system_profiler`.
The normal memory-pressure flag was 1 and swap usage was zero in that sample.
The raw non-identifying record is `.local/review/29/macos-inventory.json`.

A paired reading reported **3.05 GiB free** through `os.freemem()` but **19.44 GiB
available** through `process.availableMemory()`. The old runner used free pages,
subtracting 1 GiB and assuming 384 MiB per worker, with a ceiling of eight. That
could unnecessarily constrain a Mac with reclaimable memory, and the decision
never changed during a run. Node's available-memory API is stable in the pinned
runtime. Apple explains that memory pressure also depends on swap, wired memory
and cached files; free pages alone do not describe it.
([Node API](https://nodejs.org/api/process.html#processavailablememory),
[Apple memory guidance](https://support.apple.com/guide/activity-monitor/view-memory-usage-actmntr1004/mac))

## Implemented admission control

`tools/resources.js` is shared host tooling, outside the game. `test/run.js` uses
it before work and while children run. The complete check list, sample counts,
seeds, assertions and failure codes remain in place.

- Automatic CPU concurrency leaves two performance-core slots when that topology
  is readable, otherwise uses available parallelism, and retains a ceiling of
  five. External load can reduce admissions. This is a concurrency allowance,
  not core pinning or a guarantee that particular cores remain idle.
- The memory reserve scales with machine size and is capped at 4 GiB; it is 4 GiB
  on this Mac. The combined in-flight reservation is at most half physical memory
  and must fit below currently available memory minus that reserve. A Node check
  reserves 1 GiB; a browser check reserves 2 GiB for its client and browser work.
- One-second checks stop new admissions on memory warning. Critical pressure or
  available memory below half the reserve aborts owned work. An unrelieved wait
  without safe progress fails explicitly after 30 seconds. Interrupted work is
  incomplete, never passed with a smaller sample.
- `JOBS` overrides only CPU concurrency. It cannot remove memory reservations or
  the pressure guard. Test children have a 512 MiB V8 old-space limit, the existing
  five-minute step timeout, and a 16 MiB output-buffer bound. A limit failure fails
  the check; termination escalates only for the runner's own child processes.
- Borrowed browser servers remain borrowed. The runner disconnects its children
  and closes only a server it created; it does not touch the owner's browser.

These are conservative engineering limits, not measured per-test peak footprints
or an assertion that five workers are optimal. The complete suite passed with
the heap bound in both bounded runs below. A V8 limit is
not a total-process limit, and browser/GPU allocations share system memory. The
guard reduces risk; unrelated applications can allocate between samples, so no
absolute OS-wide out-of-memory guarantee is possible.

On macOS the optional pressure query returns dispatch flags **1/2/4**, not the
kernel's separate internal pressure enumeration. That distinction was checked
against Apple's source. When the sandbox denies this query, the helper reports
pressure as unavailable and continues its available-memory guard; it does not
pretend the system is normal. A denied topology probe likewise falls back to
Node's parallelism information.
([Apple conversion code](https://github.com/apple-oss-distributions/xnu/blob/main/bsd/kern/kern_memorystatus_notify.c),
[Apple pressure flags](https://github.com/apple-oss-distributions/xnu/blob/main/bsd/sys/event_private.h))

Seven injected-pressure tests check normal reservations, manual concurrency,
load reduction, exact task completion, warning/recovery, critical cancellation,
persistent low headroom and failed work. They passed in approximately 30 ms,
without allocating pressure-producing memory. A thousand fallback probe samples
took 2.15 ms in the sandbox; the permitted sysctl path is a separate cost.

```sh
.local/node/bin/node tools/resources.js
.local/node/bin/node test/resources.js
JOBS=3 .local/node/bin/node test/run.js full --timings
```

## Workflows retained and follow-up measurements

The shipped JavaScript already executes in native Node for state checks and
simulations. The runner builds once, sorts longer independent checks first and
shares one isolated browser. Reusing these paths is more useful than introducing
another engine or porting the game to GPU kernels. No local `/proc`, `nproc`,
Linux Chrome path, `xvfb` or Linux Node-distribution assumption was found in the
current commands. Ubuntu remains the intentional GitHub Pages CI host.

Chrome cannot be launched inside this Codex macOS sandbox: earlier attempts
aborted during application registration. The harness now refuses that operation
before spawning a browser. Continue using the approved isolated server through
`KUTHA_BROWSER_WS`; do not print its endpoint, repeatedly retry the sandbox
launch, or change system crash-reporting settings. The existing Firefox profile
isolation and local font routing also remain in force.

Apple's scheduler places work across performance and efficiency cores according
to workload, system state and QoS. Leave scheduling to macOS rather than forcing
affinity or raising process priority. If a future native helper has sustained
background work, choose an appropriate QoS class and measure it. The current
Node tools do not add a native QoS shim merely for this audit.
([Apple CPU/QoS guidance](https://developer.apple.com/news/?id=vk3m204o))

The stable framework artifact
`ac89fecf30d82a7ad11a051ba30fd853436b8ca8684497a80a32bd27f163b513`
was then tested with three and five workers, sequentially against the same
existing isolated Chrome server, with no simultaneous large study. Both runs
completed all **38 steps including the build**, with unchanged full-suite counts
and no failures. Resource samples were taken once per second.

| CPU allowance | Runner wall time | Observed peak workers | Lowest available memory | Highest one-minute load | Pressure samples |
| --- | ---: | ---: | ---: | ---: | --- |
| `JOBS=3` | 72.87 s | 3 | 17.16 GiB | 6.05 | 74 normal |
| `JOBS=5` | 69.70 s | 5 | 15.91 GiB | 8.69 | 71 normal |

Five workers finished 4.3% sooner in this pair. There was only one run at each
setting, in fixed order; cache state, system activity and the lagging load average
limit the inference. This does not establish an optimal worker count or an
advantage from using all cores. The automatic ceiling is conservatively **five**,
with further reductions for load and memory; `JOBS=3` remains a useful explicit
choice during other interactive work. The 512 MiB child heap and output limits
passed the real suite. No whole-machine stress benchmark was needed.

The logs are `.local/review/29/full-jobs-3.log` and `full-jobs-5.log`; the artifact
hash, elapsed times and per-second samples are retained in
`.local/review/29/resource-benchmark.json`. An earlier integration run of 54.72 s
used a different check set and is not a speedup baseline. These measurements are
a snapshot of the frozen framework build, not of later intentional game tuning.
Future throughput claims should alternate order and repeat the paired runs.

Long simulations should continue using the existing shipped-code adapter and
bounded batches. Their host must also check available headroom between batches,
stream bounded diagnostics and mark interrupted work incomplete. A standalone
simulation is not automatically protected merely because the test runner is;
that host integration must be explicit. Do not start another large experiment
beside a full regression run simply because more cores exist.

## Future learning and GPU contract

No GPU framework is needed by today's game, tests or build. Future model work
remains separate and requires its own measured experiment. Preserve the Node
engine as the environment and exact seeded reference, and send only the audited
serialized actor observations to a model process. Do not silently replace the
game's ordered floating-point decisions or either random stream.

MLX can execute on the CPU and GPU against the same memory pool. Its own example
also shows why small operations can be CPU-bound by GPU dispatch overhead. This
supports testing a batched policy/model workload, rather than assuming this
branch-heavy JavaScript engine benefits from a GPU rewrite.
([MLX unified memory](https://ml-explore.github.io/mlx/build/html/usage/unified_memory.html))

The future host budget must include environment workers, browser processes,
model weights, activations, optimizer state, caches and rollout storage together.
Start with bounded batches and one model process. Record backend/version, device,
dtype, independent policy seed, peak memory, time and failures. Compare against
the CPU/reference path before adopting anything. PyTorch's MPS backend is another
possible route for a later model with existing PyTorch code; availability must be
checked on the installed build, not inferred from the GPU's name.
([Apple MPS overview](https://developer.apple.com/metal/pytorch/))

Metal's recommended working-set size is a performance guideline, not permission
to consume that amount alongside other work. MLX's memory limit is also a
guideline, and its documented default can exceed the device's recommended working
set. A future integration therefore needs explicit allocation/cache limits,
live host pressure checks and an orderly failure path; it must not rely on a
library default as an OS safety boundary.
([Metal working-set guidance](https://developer.apple.com/documentation/metal/mtldevice/recommendedmaxworkingsetsize),
[MLX memory limit](https://ml-explore.github.io/mlx/build/html/python/_autosummary/mlx.core.set_memory_limit.html),
[MLX cache limit](https://ml-explore.github.io/mlx/build/html/python/_autosummary/mlx.core.set_cache_limit.html))
