// What the Publish workflow (.github/workflows/publish.yml) puts out, from the built pages (node build.js):
//   node .github/publish.js site <base-url> <dir>   the GitHub Pages site: the standalone page as index.html, with a
//                                                   description, an icon and a picture for link previews, and the
//                                                   README's pictures beside it
//   node .github/publish.js notes <version>         that version's section of CHANGELOG.md, as release notes
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [what, ...rest] = process.argv.slice(2);

const DESCRIPTION =
  'A Lovecraftian hidden-role mystery in one web page. Iraq, 1926: seven people are still at the dig, and two of them serve something under the mound. In English and Russian.';
// the eight-pointed star of the brand (the sign of a god, as the page draws it beside the title)
const ICON =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='#0e121b'/>" +
  "<path d='M32 9v46M9 32h46M15.7 15.7l32.6 32.6M48.3 15.7L15.7 48.3' stroke='#c9a44c' stroke-width='6' stroke-linecap='round'/></svg>";
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function site(base, dir) {
  if (!base || !dir) throw new Error('usage: node .github/publish.js site <base-url> <dir>');
  base = base.replace(/\/+$/, '');
  const page = fs.readFileSync(path.join(ROOT, 'standalone.html'), 'utf8'),
    title = '<title>The Gates of Kutha</title>';
  if (!page.includes(title)) throw new Error('standalone.html: no title to put the description after (node build.js first)');
  const head = [
    `<meta name="description" content="${attr(DESCRIPTION)}">`,
    `<link rel="canonical" href="${base}/">`,
    `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(ICON)}">`,
    '<meta name="theme-color" content="#0e121b">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="The Gates of Kutha">',
    `<meta property="og:description" content="${attr(DESCRIPTION)}">`,
    `<meta property="og:url" content="${base}/">`,
    `<meta property="og:image" content="${base}/images/title.png">`,
    '<meta property="og:image:width" content="1280">',
    '<meta property="og:image:height" content="800">',
    '<meta name="twitter:card" content="summary_large_image">'
  ].join('\n');
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page.replace(title, `${title}\n${head}`));
  const pics = path.join(ROOT, 'docs', 'images');
  fs.readdirSync(pics)
    .filter(f => /\.(png|jpe?g|webp)$/.test(f))
    .forEach(f => fs.copyFileSync(path.join(pics, f), path.join(dir, 'images', f)));
  console.log(`site in ${dir}: index.html and ${fs.readdirSync(path.join(dir, 'images')).length} pictures, for ${base}/`);
}

function notes(version) {
  if (!version) throw new Error('usage: node .github/publish.js notes <version>');
  const lines = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8').split('\n'),
    at = lines.findIndex(l => l.startsWith(`## ${version} `) || l === `## ${version}`);
  if (at < 0) throw new Error(`CHANGELOG.md has no section for ${version}`);
  const end = lines.findIndex((l, i) => i > at && l.startsWith('## '));
  // (links between the documents, made absolute: the notes are read on the release's page, not beside the files; and
  // each paragraph and list item on one line, since a release page keeps every line break of its notes)
  const unwrap = text =>
    text
      .split(/\n{2,}/)
      .map(block =>
        block
          .split('\n')
          .reduce((out, line) => {
            if (!out.length || /^\s*([-*]|\d+\.)\s/.test(line)) out.push(line);
            else out[out.length - 1] += ' ' + line.trim();
            return out;
          }, [])
          .join('\n')
      )
      .join('\n\n');
  const body = unwrap(
    lines
      .slice(at + 1, end < 0 ? lines.length : end)
      .join('\n')
      .trim()
  ).replace(/\]\((?!https?:|#)([^)]+)\)/g, `](https://github.com/ilia-r-s/the-gates-of-kutha/blob/v${version}/$1)`);
  process.stdout.write(
    `${body}\n\n---\n\n[Play it in your browser](https://ilia-r-s.github.io/the-gates-of-kutha/) · ` +
      'download `the-gates-of-kutha.html` below and open it in any current browser · ' +
      `[the rulebook](https://github.com/ilia-r-s/the-gates-of-kutha/blob/v${version}/docs/rulebook.md)\n`
  );
}

if (what === 'site') site(...rest);
else if (what === 'notes') notes(...rest);
else {
  console.error('usage: node .github/publish.js site <base-url> <dir> | notes <version>');
  process.exit(2);
}
