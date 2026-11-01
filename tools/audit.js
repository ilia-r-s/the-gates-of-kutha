#!/usr/bin/env node
// Conservative static audit: retain dynamically accessed namespaces, and include test/simulation consumers.
const fs = require('node:fs');
const path = require('node:path');
const { parse, walk } = require('./syntax');
const { source, ROOT } = require('../build');

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? ['golden', 'shots', 'fixtures'].includes(entry.name)
        ? []
        : jsFiles(file)
      : entry.name.endsWith('.js')
        ? [file]
        : [];
  });
}
function chain(node) {
  const parts = [];
  while (node.type === 'MemberExpression') {
    const key = node.computed ? (node.property.type === 'Literal' ? String(node.property.value) : '*') : node.property.name;
    parts.unshift(key);
    node = node.object;
  }
  return node.type === 'Identifier' ? [node.name, ...parts] : [];
}
function audit() {
  const loaded = source(),
    ast = parse(loaded.script, { ecmaVersion: 2023 });
  const facades = new Map();
  for (const declaration of ast.body)
    if (declaration.type === 'VariableDeclaration')
      for (const item of declaration.declarations) {
        const init = item.init;
        if (
          item.id.type !== 'Identifier' ||
          init?.type !== 'CallExpression' ||
          init.callee.type !== 'ArrowFunctionExpression' ||
          init.callee.body.type !== 'BlockStatement'
        )
          continue;
        const returned = init.callee.body.body.findLast(n => n.type === 'ReturnStatement')?.argument;
        if (returned?.type === 'ObjectExpression')
          facades.set(
            item.id.name,
            returned.properties.filter(p => p.type === 'Property' && !p.computed).map(p => p.key.name ?? String(p.key.value))
          );
      }
  const namespaces = new Set([...facades.keys(), 'TX']);
  const reads = new Map(),
    dynamic = new Set();
  const use = (root, key) => {
    if (!reads.has(root)) reads.set(root, new Set());
    reads.get(root).add(key);
  };
  const scan = tree =>
    walk(tree, (node, parent, field) => {
      if (node.type === 'MemberExpression') {
        if (parent?.type === 'MemberExpression' && parent.object === node) return;
        if (parent?.type === 'AssignmentExpression' && parent.left === node && chain(node)[0] === 'TX') return;
        const [root, first, second] = chain(node);
        if (!namespaces.has(root)) return;
        if (root === 'TX') {
          if (!first || first === '*') dynamic.add('TX');
          else if (!second || second === '*') dynamic.add('TX.' + first);
          else use('TX.' + first, second);
        } else if (first === '*') dynamic.add(root);
        else if (first) use(root, first);
      }
      if (node.type !== 'Identifier' || !namespaces.has(node.name)) return;
      if ((parent?.type === 'MemberExpression' && parent.object === node) || field === 'id' || (field === 'key' && !parent.computed))
        return;
      dynamic.add(node.name);
    });
  scan(ast);
  for (const file of [...jsFiles(path.join(ROOT, 'test')), ...jsFiles(path.join(ROOT, 'sim'))])
    scan(parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 2023, sourceType: 'script' }));
  const unusedExports = [];
  for (const [name, keys] of facades)
    if (!dynamic.has(name)) for (const key of keys) if (!reads.get(name)?.has(key)) unusedExports.push(name + '.' + key);
  const unusedPassages = [];
  for (const node of ast.body) {
    const assignment = node.type === 'ExpressionStatement' && node.expression;
    if (assignment?.type !== 'AssignmentExpression' || assignment.right.type !== 'ObjectExpression') continue;
    const [root, name] = chain(assignment.left);
    if (root !== 'TX' || dynamic.has('TX') || dynamic.has('TX.' + name)) continue;
    for (const prop of assignment.right.properties) {
      const key = prop.key.name ?? prop.key.value;
      if (!reads.get('TX.' + name)?.has(key)) unusedPassages.push('TX.' + name + '.' + key);
    }
  }
  const catalogKeys = new Map();
  for (const file of loaded.SCRIPT) {
    const raw = fs.readFileSync(path.join(ROOT, 'src', file), 'utf8');
    if (!raw.includes('__text')) continue;
    walk(parse(raw, { ecmaVersion: 2023 }), node => {
      if (node.type !== 'CallExpression' || node.callee.name !== '__text' || typeof node.arguments[0]?.value !== 'string') return;
      const ref = node.arguments[0].value;
      const [name, key] = ref.includes('#') ? ref.split('#') : [file.replace(/\.js$/, ''), ref];
      if (!catalogKeys.has(name)) catalogKeys.set(name, new Set());
      catalogKeys.get(name).add(key.split('.')[0]);
    });
  }
  const unusedText = [],
    vagueText = [];
  function checkCatalogs(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkCatalogs(file);
        continue;
      }
      if (!entry.name.endsWith('.json')) continue;
      const name = path
        .relative(path.join(ROOT, 'src/text'), file)
        .replace(/\\/g, '/')
        .replace(/\.json$/, '');
      for (const key of Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')))) {
        if (!catalogKeys.get(name)?.has(key)) unusedText.push(name + '#' + key);
        if (/^text\d*$/.test(key)) vagueText.push(name + '#' + key);
      }
    }
  }
  checkCatalogs(path.join(ROOT, 'src/text'));
  return { unusedExports, unusedPassages, unusedText, vagueText, dynamic: [...dynamic].sort() };
}
module.exports = { audit };
if (require.main === module) {
  const result = audit();
  console.log(JSON.stringify(result, null, 2));
  if (
    process.argv.includes('--check') &&
    (result.unusedExports.length || result.unusedPassages.length || result.unusedText.length || result.vagueText.length)
  )
    process.exitCode = 1;
}
