const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { site } = require('../tools/site');
const { ROOT } = require('../build');

test('Pages package contains the game, share metadata and only the image it uses', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-pages-'));
  try {
    site('https://example.test/kutha///', out);
    assert.deepEqual(fs.readdirSync(out).sort(), ['images', 'index.html']);
    assert.deepEqual(fs.readdirSync(path.join(out, 'images')), ['title.png']);
    const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert.ok(html.includes('<link rel="canonical" href="https://example.test/kutha/">'));
    assert.ok(html.includes('https://example.test/kutha/images/title.png'));
    assert.ok(html.includes('<script>'));
    const image = fs.readFileSync(path.join(ROOT, 'docs/images/title.png'));
    assert.deepEqual(fs.readFileSync(path.join(out, 'images/title.png')), image);
    assert.ok(html.includes(`<meta property="og:image:width" content="${image.readUInt32BE(16)}">`));
    assert.ok(html.includes(`<meta property="og:image:height" content="${image.readUInt32BE(20)}">`));
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
