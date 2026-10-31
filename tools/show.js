#!/usr/bin/env node
// Read one declaration or text key. Keep large prose tables out of routine code changes.
const fs = require('node:fs');
const path = require('node:path');
const { parse, walk } = require('./syntax');
const { SCRIPT } = require('../src/modules.json');
const SRC = path.join(__dirname, '..', 'src');
const argv = process.argv.slice(2);
const find = argv.includes('--find');
const query = argv.find(s => !s.startsWith('--'));

function showText(ref) {
  let [file, key] = ref.split('#');
  let list = !key;
  if (ref.startsWith('TX.')) {
    const [, namespace, ...parts] = ref.split('.');
    const line = fs
      .readFileSync(path.join(SRC, 'core/catalog.js'), 'utf8')
      .split('\n')
      .find(s => s.startsWith(`TX.${namespace} =`));
    if (!line) throw new Error(`Unknown text namespace ${namespace}`);
    const target = line.match(/__text\('([^']+)'\)/)[1];
    [file, key] = target.split('#');
    key += parts.length ? '.' + parts.join('.') : '';
    list = !parts.length;
  }
  if (!/^[\w-]+(?:\/[\w-]+)*$/.test(file)) throw new Error('Use text/module#key or TX.module.key');
  const filename = path.join(SRC, 'text', file + '.json');
  let value = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (key)
    for (const part of key.split('.')) {
      if (!value || !Object.hasOwn(value, part)) throw new Error(`Missing text ${file}#${key}`);
      value = value[part];
    }
  if (list && !argv.includes('--all')) {
    const keys = Object.keys(value);
    console.log(`${path.relative(SRC, filename)}${key ? '#' + key : ''}:\n${keys.slice(0, 60).join('\n')}`);
    if (keys.length > 60) console.log(`${keys.length - 60} more keys; use --find to narrow the query`);
  } else console.log(`${path.relative(SRC, filename)}#${key || ''}\n${JSON.stringify(value, null, 2)}`);
}

function textMatches(fragment, partial) {
  const matches = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(file);
        continue;
      }
      if (!entry.name.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const module = path
        .relative(path.join(SRC, 'text'), file)
        .replace(/\\/g, '/')
        .replace(/\.json$/, '');
      const add = (key, name) => {
        if (partial ? name.toLowerCase().includes(fragment.toLowerCase()) : name === fragment)
          matches.push({ textRef: `${module}#${key}`, name });
      };
      for (const key of Object.keys(data)) {
        if (key === 'passages') for (const name of Object.keys(data.passages)) add('passages.' + name, name);
        else add(key, key);
      }
    }
  }
  visit(path.join(SRC, 'text'));
  return matches;
}

function main() {
  if (argv.includes('--list')) {
    console.log(SCRIPT.join('\n'));
    return;
  }
  if (!query)
    throw new Error('Usage: node tools/show.js symbol | Namespace.method | TX.module.key | module/path#key | --find fragment | --list');
  if (query.startsWith('TX.') || query.includes('#') || (query.includes('/') && fs.existsSync(path.join(SRC, 'text', query + '.json')))) {
    showText(query);
    return;
  }
  const parts = query.split('.');
  const namespace = parts.length > 1 ? parts[0] : null;
  const member = parts.at(-1);
  const matches = [];
  for (const file of SCRIPT) {
    const code = fs.readFileSync(path.join(SRC, file), 'utf8');
    if (find ? !code.toLowerCase().includes(member.toLowerCase()) : !code.includes(member)) continue;
    const ast = parse(code, { ecmaVersion: 2023, locations: true });
    let root = ast;
    if (namespace) {
      const owner = ast.body
        .filter(n => n.type === 'VariableDeclaration')
        .flatMap(n => n.declarations)
        .find(n => n.id.name === namespace);
      if (!owner) continue;
      root = owner.init;
      if (!find && root?.type === 'ObjectExpression') {
        let property;
        for (const part of parts.slice(1)) {
          property =
            root?.type === 'ObjectExpression' &&
            root.properties.find(p => p.type === 'Property' && !p.computed && (p.key.name ?? String(p.key.value)) === part);
          if (!property) break;
          root = property.value;
        }
        if (property) matches.push({ file, node: property, code, name: query });
        continue;
      }
    }
    walk(root, node => {
      if (!['FunctionDeclaration', 'VariableDeclarator', 'ClassDeclaration'].includes(node.type) || node.id?.type !== 'Identifier') return;
      const name = node.id.name;
      if (find ? !name.toLowerCase().includes(member.toLowerCase()) : name !== member) return;
      matches.push({ file, node, code, name });
      return false;
    });
  }
  if (find || !matches.length) matches.push(...textMatches(member, find));
  if (!matches.length) throw new Error(`No declaration or text key ${query}; use --find with part of its name`);
  if (find || matches.length > 1) {
    for (const { file, node, name, textRef } of matches.slice(0, 60))
      console.log(textRef ? `${name}  ${textRef}` : `${name}  src/${file}:${node.loc.start.line}`);
    if (matches.length > 60) console.log(`${matches.length - 60} more matches; narrow the query`);
  } else {
    if (matches[0].textRef) {
      showText(matches[0].textRef);
      return;
    }
    const { file, node, code } = matches[0];
    console.log(`src/${file}:${node.loc.start.line}\n${code.slice(node.start, node.end)}`);
  }
}
try {
  main();
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
