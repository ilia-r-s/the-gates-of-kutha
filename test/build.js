// Source-only reproducible builds. Historical recovery bytes remain recorded in fixtures/recovery.json;
// cleanup may change the HTML while the golden and seeded replay baselines remain fixed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { build, source, ROOT, GAME_FILE } = require('../build');

test('build one complete HTML reproducibly, from source alone', async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-build-'));
  try {
    const result = await build({ out });
    const actual = fs.readFileSync(path.join(out, GAME_FILE));
    assert.deepEqual(fs.readdirSync(out), [GAME_FILE]);
    assert.equal(actual.toString('utf8'), result.html);
    assert.equal((await build({ check: true })).html, result.html);
    assert.ok(!result.html.includes('__text('));
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});

test('text is a real build input: edits propagate; missing keys fail; the reference is unnecessary', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-source-'));
  const src = path.join(temp, 'src');
  try {
    fs.cpSync(path.join(ROOT, 'src'), src, { recursive: true });
    const before = await build({ src, check: true, debug: true });
    const file = path.join(src, 'text/ui/intro.json');
    const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
    catalog.passages.professorAldousCraneDirector.$value[0] += ' RECOVERY-TEXT-EDIT';
    fs.writeFileSync(file, JSON.stringify(catalog));
    const changed = await build({ src, check: true, debug: true });
    assert.ok(changed.html.includes('RECOVERY-TEXT-EDIT'));
    assert.notEqual(createHash('sha256').update(changed.html).digest('hex'), createHash('sha256').update(before.html).digest('hex'));
    delete catalog.passages;
    fs.writeFileSync(file, JSON.stringify(catalog));
    await assert.rejects(build({ src, check: true, debug: true }), /missing text ui\/intro#passages/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('text expansion respects JavaScript tokens, lexical scope, and all global bindings', () => {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'kutha-input-'));
  try {
    fs.mkdirSync(path.join(src, 'text'));
    fs.writeFileSync(path.join(src, 'modules.json'), JSON.stringify({ PAGE: [], SCRIPT: ['sample.js'] }));
    fs.writeFileSync(
      path.join(src, 'text/sample.json'),
      JSON.stringify({ greeting: { $args: ['name'], $value: { $template: 'Hello ${name} ${suffix}' } } })
    );
    fs.writeFileSync(
      path.join(src, 'sample.js'),
      `const suffix='!';const greet=__text('greeting');const literal="__text('missing')"; // __text('missing')\nthis.result=greet('Marlowe');`
    );
    const loaded = source(src),
      context = vm.createContext({});
    vm.runInContext(loaded.script, context);
    assert.equal(context.result, 'Hello Marlowe !');
    fs.appendFileSync(path.join(src, 'sample.js'), '\nfunction duplicate(){}\nfunction duplicate(){}');
    assert.throws(() => source(src), /duplicate declared/);
    fs.writeFileSync(path.join(src, 'modules.json'), JSON.stringify({ PAGE: [], SCRIPT: ['sample.js', 'second.js'] }));
    fs.writeFileSync(path.join(src, 'sample.js'), 'const { a, b: [nested] } = {a:1,b:[2]};');
    fs.writeFileSync(path.join(src, 'second.js'), 'var nested;');
    assert.throws(() => source(src), /nested declared/);
    fs.writeFileSync(path.join(src, 'sample.js'), "__text('../outside#key');");
    assert.throws(() => source(src), /invalid text reference/);
  } finally {
    fs.rmSync(src, { recursive: true, force: true });
  }
});
