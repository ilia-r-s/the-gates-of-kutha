# Requirements

What the game needs to run, what it is built and tested with, and where it has been tested. Kept current with every
release (the project's rule: [RULES.md](RULES.md), "How the project is kept"). Last checked for build 27.1.3.

## Playing

- **One HTML page**, nothing to install and no server of its own: on GitHub Pages
  (https://ilia-r-s.github.io/the-gates-of-kutha/, the standalone page as `index.html`), as the file attached to each
  GitHub Release (`the-gates-of-kutha.html`), as `kutha.html` (the claude.ai artifact, whose host adds the document
  skeleton), or as `standalone.html` / `Gates of Kutha.html` opened straight from disk.
- **No libraries at run time.** The game is plain JavaScript: one script built from `src/` (`build.js`), no framework,
  no package, nothing loaded from a CDN. The one outside resource is its typefaces from Google Fonts (IM Fell English
  SC, Spectral, Courier Prime, and Noto Sans Cuneiform for the single sign 𒀭), with the system's own fonts in their
  place if those cannot load.
- **JavaScript must be on.** With it off, the page says so in both languages and shows nothing else (`<noscript>`).
- **Language level: ECMAScript 2020** (the newest feature in use is `??`; also arrow functions, `const`/`let`, template
  strings, spread and rest, default parameters, destructuring, `**`, `Array.prototype.flatMap`, `Object.fromEntries`,
  `String.prototype.padStart`). No modules, classes, `async`/`await` or private fields: every module shares one global
  scope, as the build concatenates them.
- **Browsers**: any current evergreen browser. To run at all: Chrome or Edge 80+, Firefox 72+, Safari 13.1+ (iOS 13.4+).
  For the layout exactly as designed: Chrome or Edge 108+, Firefox 101+, Safari 15.4+ (the `dvh` unit and
  `:focus-visible`); older browsers fall back gracefully.
- **Web platform used**: the DOM and inline SVG (every picture is drawn in code); the Web Audio API (`AudioContext`, or
  `webkitAudioContext` on older Safari) for all music and sound, which, as browsers require, waits for the first click,
  tap or key (the page says so where the track name goes); `localStorage`, only to remember the sound buttons and the
  endings reached (the game plays the same without it); `matchMedia`, for reduced motion and touch screens. Nothing is
  sent anywhere: no network requests but the fonts.
- **Screens**: from 360 CSS pixels wide (phones) upward; mouse, touch and keyboard.

## Building and testing

| Tool | Version used | Required | What for |
| --- | --- | --- | --- |
| Node.js | 22.22.0 | ^20.19.0, ^22.13.0 or ≥ 24 (`package.json` `engines`; `.nvmrc`) | the build, the tests and the simulators |
| npm | 10.9.4 | any that reads `package-lock.json` v3 | installing the tools below |
| eslint | 10.12.0 | exact (`devDependencies`) | `test/lint.js`, which reads the script as the browser does |
| globals | 17.13.0 | exact | the browser's global names, for the linter |
| playwright | 1.56.0 | exact | every browser test and simulator |
| Chromium (Playwright's own) | 141.0.7390.37 | the build that `playwright` 1.56.0 installs | the browser the tests drive, headless |
| prettier | 3.9.10 | exact | the code's layout (`npm run format`; the test suite checks it) |
| terser | 5.31.0 | exact | the build's minification |
| @fontsource/im-fell-english-sc, @fontsource/spectral, @fontsource/courier-prime, @fontsource/noto-sans-cuneiform | 5.3.0 | exact | the game's typefaces, served to the page only for the README's pictures (`test/pictures.js`); the game itself takes them from Google Fonts |

`package-lock.json` pins every package beneath these. Set up and check a fresh copy:

```
npm ci
npx playwright install chromium
node build.js
node test/run.js            # the quick suite; node test/run.js full for the whole of it
```

## Where it has been tested

- **Automated, on every build**: Playwright 1.56.0 driving headless Chromium 141.0.7390.37, on Ubuntu 24.04.5 LTS (Linux
  6.18, x86-64), Node 22.22.0. Desktop at 1280 × 900; the top panel at 1280, 820 and 390 pixels wide; phones at 360, 375
  and 414 pixels wide with touch emulated (mobile viewport, coarse pointer); English and Russian, and switching between
  them mid-game; seasons dealt from seeds and replayed from them (`test/replay.js`); JavaScript turned off.
- **On every push, by GitHub Actions** (`.github/workflows/tests.yml`): the whole suite (`node test/run.js full`) on
  GitHub's Ubuntu 24.04 runners, with Node at the version in `.nvmrc` and the Chromium that Playwright 1.56.0 installs;
  and again before each build on `main` is published (`.github/workflows/publish.yml`).
- **By eye**: the published artifact in desktop Chrome, through the Claude in Chrome extension (the browser's version
  was not recorded).
- **Not yet tested**: Firefox and Safari (WebKit), which the build environment does not have; real phones and tablets.
  Reports from them are welcome.
