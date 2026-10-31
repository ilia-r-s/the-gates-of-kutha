// Package the one built game for Pages. This command does not deploy or create releases.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, GAME_FILE } = require('../build');
const DESCRIPTION =
  'A choice-driven mystery at an archaeological dig. Tell Ibrahim, Iraq, 1926. Professor Crane is dead. Seven people remain, and something under the mound is listening.';
const ICON =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='#0e121b'/><path d='M32 9v46M9 32h46M15.7 15.7l32.6 32.6M48.3 15.7L15.7 48.3' stroke='#c9a44c' stroke-width='6' stroke-linecap='round'/></svg>";
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function site(base, dir) {
  if (!base || !dir) throw new Error('usage: node tools/site.js <base-url> <dir>');
  base = base.replace(/\/+$/, '');
  const page = fs.readFileSync(path.join(ROOT, GAME_FILE), 'utf8');
  const title = '<title>The Gates of Kutha</title>';
  if (!page.includes(title)) throw new Error(`${GAME_FILE}: title missing; build the game first`);
  const image = fs.readFileSync(path.join(ROOT, 'docs/images/title.png'));
  const head = [
    `<meta name="description" content="${attr(DESCRIPTION)}">`,
    `<link rel="canonical" href="${attr(base)}/">`,
    `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(ICON)}">`,
    '<meta name="theme-color" content="#0e121b">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="The Gates of Kutha">',
    `<meta property="og:description" content="${attr(DESCRIPTION)}">`,
    `<meta property="og:url" content="${attr(base)}/">`,
    `<meta property="og:image" content="${attr(base)}/images/title.png">`,
    `<meta property="og:image:width" content="${image.readUInt32BE(16)}">`,
    `<meta property="og:image:height" content="${image.readUInt32BE(20)}">`,
    '<meta name="twitter:card" content="summary_large_image">'
  ].join('\n');
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page.replace(title, `${title}\n${head}`));
  fs.writeFileSync(path.join(dir, 'images/title.png'), image);
}
module.exports = { site };
if (require.main === module) {
  try {
    site(...process.argv.slice(2));
    console.log('Pages site packaged.');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
