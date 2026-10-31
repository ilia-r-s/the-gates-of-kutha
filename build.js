#!/usr/bin/env node
// Compile shared-scope modules and keyed text into one self-contained HTML document.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parse, bindings } = require('./tools/syntax');
const { createTextLoader } = require('./tools/text');
const ROOT = __dirname;
const GAME_FILE = 'The Gates of Kutha.html';
let cachedSource, cachedScript;

function source(src = path.join(ROOT, 'src')) {
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'modules.json'), 'utf8'));
  const expand = createTextLoader(src);
  const declared = new Map();
  const modules = manifest.SCRIPT.map(file => {
    const raw = fs.readFileSync(path.join(src, file), 'utf8');
    const ast = parse(raw, { ecmaVersion: 2023, locations: true });
    for (const node of ast.body) {
      const names = node.type === 'VariableDeclaration' ? node.declarations.flatMap(d => bindings(d.id)) : bindings(node.id);
      for (const name of names) {
        const at = `${file}:${node.loc.start.line}`;
        if (declared.has(name)) throw new Error(`${name} declared in ${declared.get(name)} and again in ${at}`);
        declared.set(name, at);
      }
    }
    return { file, code: expand(raw, file, ast) };
  });
  const script = modules.map(m => (m.code.endsWith('\n') ? m.code : m.code + '\n')).join('');
  // Compile without executing: V8 validates expanded templates and the combined lexical scope.
  new vm.Script(script, { filename: 'compiled-game.js' });
  return { ...manifest, modules, script, declared, textFiles: expand.files };
}

async function shipped(script, debug = false) {
  if (debug) return script;
  if (script === cachedSource) return cachedScript;
  const { minify } = require('terser');
  const result = await minify(script, {
    compress: { defaults: false, dead_code: true, unused: true, side_effects: true, keep_fargs: true },
    mangle: { toplevel: false, keep_fnames: true },
    format: { comments: false }
  });
  cachedSource = script;
  cachedScript = result.code.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
  return cachedScript;
}

async function build({ src = path.join(ROOT, 'src'), out = ROOT, check = false, debug = false } = {}) {
  const loaded = source(src);
  const read = file => fs.readFileSync(path.join(src, file), 'utf8');
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  const fragments = Object.fromEntries(
    loaded.PAGE.map(file => {
      const content = read(file).replace(/\{\{version\}\}/g, version);
      if (/\{\{\w+\}\}/.test(content)) throw new Error(`unfilled placeholder in ${file}`);
      return [path.basename(file, path.extname(file)), content];
    })
  );
  fragments.script = await shipped(loaded.script, debug);
  const html = read('page/document.html').replace(/\{\{(\w+)\}\}/g, (_whole, key) => {
    if (!Object.hasOwn(fragments, key)) throw new Error(`unknown document placeholder ${key}`);
    return fragments[key];
  });
  if (!check) {
    fs.mkdirSync(out, { recursive: true });
    const dest = path.join(out, GAME_FILE);
    if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(Buffer.from(html))) fs.writeFileSync(dest, html);
  }
  return { html, version, modules: loaded.modules.length, names: loaded.declared.size, textFiles: loaded.textFiles.size };
}

module.exports = { ROOT, GAME_FILE, source, build };
if (require.main === module) {
  const opt = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  build({
    src: path.resolve(ROOT, opt('src') || 'src'),
    out: path.resolve(ROOT, opt('out') || '.'),
    check: process.argv.includes('--check'),
    debug: process.argv.includes('--debug')
  })
    .then(r =>
      console.log(
        `${process.argv.includes('--check') ? 'ok' : 'built'} ${r.version}: ${r.modules} modules, ${r.names} names, ${r.textFiles} text files · ${GAME_FILE} ${Buffer.byteLength(r.html)} B`
      )
    )
    .catch(e => {
      console.error('build failed: ' + e.message);
      process.exitCode = 1;
    });
}
