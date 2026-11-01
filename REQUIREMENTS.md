# Requirements

Environment for local **29.0.0** development from the recovered **28.5.1** source and **28.5.2** maintenance baseline.

## Playing

One HTML file: plain JavaScript, inline SVG and synthesized Web Audio, without runtime packages or a server.
The only outside requests are Google Fonts, with system-font fallbacks. Audio starts after a user gesture.
Local storage remembers sound preferences, viewpoint, reached endings, language and one current expedition. The game remains
playable without storage, with a localized explanation that it cannot resume. Relocating the HTML or using a private
session can change storage availability; file-URL persistence is browser-specific.

Automated browser checks cover desktop and narrow/mobile viewports, both languages, mid-game switching and the
no-JavaScript fallback. Real-input usability/resume checks run in Chrome, Firefox and WebKit; the
[validation record](docs/research/2026-11-01-validation.md) identifies tested artifacts and counts. Real phones,
screen readers and the Safari application have not been verified; narrow viewports and Playwright WebKit are not
substitutes for those checks.

Saves stay in the browser profile and origin; the HTML and GitHub Pages deployment are not modified by play.
Separate profiles/devices have independent expeditions. Tabs sharing the same profile/site share the one save,
with stale-tab protection against overwriting newer progress. A linked seed can reproduce the starting arrangement
without sharing subsequent choices or progress. Season-code controls remain hidden until explicitly revealed.

## Development

| Tool | Version / selection |
| --- | --- |
| Verified development Mac | macOS **27.2**, Apple **M4 Max**, 10 performance + 4 efficiency CPU cores, **36 GiB** unified memory, **32 GPU cores**, Metal supported. |
| Node.js | **26.13.0 LTS**, pinned in `.nvmrc`, kept in ignored `.local/node/`. |
| Local architecture | Node is a native Mach-O ARM64 binary; no Rosetta/container wrapper. Existing Xcode **27.2** is selected; no new native build dependency was introduced. |
| npm | Bundled with the selected Node; `npm ci` installs the lockfile exactly. |
| Acorn | 8.19.0, for parsing, text expansion, audits and focused inspection. |
| Terser | 5.51.2, conservative compression and local binding mangling. |
| Playwright | 1.64.1, with installed Chrome or its managed engines in `.local/browsers/`. |
| Browser verified locally | Google Chrome **156.0.8078.80**, macOS ARM64, isolated headless profiles. |
| Additional verified engines | Playwright Firefox **157.0** (build 1555), WebKit **27.2** (build 2370). |
| CI browser | Chromium installed by pinned Playwright. |
| ESLint / globals | 10.14.0 / 17.13.0. |
| Prettier | 3.9.10. |
| minimatch override | **11.0.1**, replaces the vulnerable transitive 10.2.6; compiler/lint/full-suite compatibility checked. |
| Fontsource packages | Courier Prime, IM Fell English SC, Noto Sans Cuneiform, Spectral: 5.3.0. |

Dependencies are pinned in `package.json` and `package-lock.json`. Use the project-local Node and npm cache:

```sh
export PATH="$PWD/.local/node/bin:$PATH"
npm ci --cache .local/npm-cache
```

No global npm packages are needed. Standard npm resolution uses root `node_modules/`, also ignored. Keep the SDK,
caches and diagnostic output under `.local/` so temporary-directory cleanup cannot remove the development runtime.
On this macOS version, the Firefox harness isolates application-data bookkeeping with `CFFIXED_USER_HOME` under
`.local/browser-state/firefox`; it never uses the owner's Firefox profile. Details and reproduction commands are in
the [presentation/browser record](docs/research/2026-11-01-presentation.md).
Chrome launches inside Codex's macOS `seatbelt` sandbox were verified to abort in
`_RegisterApplication` before loading the game, producing system crash alerts. The
harness now rejects that launch before spawning Chrome. Browser checks use an
approved unsandboxed process and isolated profiles; a shared `KUTHA_BROWSER_WS`
can be reused without launching another browser. Ordinary terminal and CI use are
unchanged. Node simulations do not require this permission.
Adaptive resource admission uses Node's available-memory API plus optional macOS
topology/pressure probes. `tools/resources.js` reserves interactive headroom;
`JOBS` cannot disable memory safeguards. On this Mac the reserve is 4 GiB, with
1 GiB per Node job and 2 GiB per browser job as conservative combined reservations.
See the [native workflow audit](docs/research/2026-11-01-macos-workflow.md) for
measurements, pressure behavior and future GPU/unified-memory contracts.
No neural runtime, MLX, PyTorch or training dependency is required or installed by this work.
See [DEVELOPING.md](DEVELOPING.md) for commands and [AGENTS.md](AGENTS.md) for maintenance requirements, including
shared gameplay foundations, aggressive refactoring, test performance and focused source/text tools.

Optional independent numerical validation used the existing `/usr/local/bin/Rscript`, R **4.6.0 (2026-04-24)**,
with base `stats::binom.test` and `stats::qbeta`. It checked the rare-scenario confidence bounds against 756 reference
cases. R is not needed to build, play or run the project's tests; no R package or dependency was installed.
