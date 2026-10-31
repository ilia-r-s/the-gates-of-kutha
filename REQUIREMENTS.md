# Requirements

Environment for the recovered **28.5.1** source and subsequent cleanup.

## Playing

One HTML file: plain JavaScript, inline SVG and synthesized Web Audio, without runtime packages or a server.
The only outside requests are Google Fonts, with system-font fallbacks. Audio starts after a user gesture.
Local storage remembers sound preferences and reached endings; the game also works without storage.

Automated browser checks cover desktop and narrow/mobile viewports, both languages, mid-game switching and the
no-JavaScript fallback. Real phones, Firefox and Safari have not been verified in this recovery session.

## Development

| Tool | Version / selection |
| --- | --- |
| Node.js | **26.13.0 LTS**, pinned in `.nvmrc`, kept in ignored `.local/node/`. |
| npm | Bundled with the selected Node; `npm ci` installs the lockfile exactly. |
| Acorn | 8.19.0, for parsing, text expansion, audits and focused inspection. |
| Terser | 5.51.2, conservative compression and local binding mangling. |
| Playwright | 1.64.1, with installed Chrome or its own Chromium. |
| Browser verified locally | Google Chrome **156.0.8078.80**, macOS ARM64, isolated headless profiles. |
| CI browser | Chromium installed by pinned Playwright. |
| ESLint / globals | 10.14.0 / 17.13.0. |
| Prettier | 3.9.10. |
| Fontsource packages | Courier Prime, IM Fell English SC, Noto Sans Cuneiform, Spectral: 5.3.0. |

Dependencies are pinned in `package.json` and `package-lock.json`. Use the project-local Node and npm cache:

```sh
export PATH="$PWD/.local/node/bin:$PATH"
npm ci --cache .local/npm-cache
```

No global npm packages are needed. Standard npm resolution uses root `node_modules/`, also ignored. Keep the SDK,
caches and diagnostic output under `.local/` so temporary-directory cleanup cannot remove the development runtime.
See [DEVELOPING.md](DEVELOPING.md) for commands and [AGENTS.md](AGENTS.md) for maintenance requirements, including
shared gameplay foundations, aggressive refactoring, test performance and focused source/text tools.
