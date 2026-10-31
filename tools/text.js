// Build-time text templates. No loader or catalog files are shipped to the browser.
const fs = require('node:fs');
const path = require('node:path');
const { parse, walk } = require('./syntax');

function expression(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(expression).join(',') + ']';
  if (Object.hasOwn(value, '$js')) {
    if (Object.keys(value).length !== 1 || typeof value.$js !== 'string') throw new Error('invalid $js template');
    return value.$js;
  }
  if (Object.hasOwn(value, '$template')) {
    if (Object.keys(value).length !== 1 || typeof value.$template !== 'string') throw new Error('invalid $template');
    return '`' + value.$template + '`';
  }
  if (Object.hasOwn(value, '$call')) {
    if (!['bi', 'oneOf'].includes(value.$call) || !Array.isArray(value.$args) || Object.keys(value).length !== 2)
      throw new Error('invalid text call');
    return value.$call + '(' + value.$args.map(expression).join(',') + ')';
  }
  if (Object.hasOwn(value, '$args')) {
    if (
      !Array.isArray(value.$args) ||
      !value.$args.every(p => typeof p === 'string') ||
      !Object.hasOwn(value, '$value') ||
      Object.keys(value).length !== 2
    )
      throw new Error('invalid text factory');
    return '(' + value.$args.join(',') + ')=>(' + expression(value.$value) + ')';
  }
  return (
    '({' +
    Object.entries(value)
      .map(([key, item]) => JSON.stringify(key) + ':' + expression(item))
      .join(',') +
    '})'
  );
}

function createTextLoader(src) {
  const files = new Map();
  const expand = (code, module, ast = null) => {
    if (!code.includes('__text')) return code;
    const changes = [];
    walk(ast || parse(code, { ecmaVersion: 2023 }), node => {
      if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier' || node.callee.name !== '__text') return;
      if (node.arguments.length !== 1 || node.arguments[0].type !== 'Literal' || typeof node.arguments[0].value !== 'string')
        throw new Error(`${module}: __text needs one literal key`);
      const ref = node.arguments[0].value;
      const [file, key] = ref.includes('#') ? ref.split('#') : [module.replace(/\.js$/, ''), ref];
      if (!/^[\w-]+(?:\/[\w-]+)*$/.test(file) || !/^[\w.-]+$/.test(key || '') || ref.split('#').length > 2)
        throw new Error(`${module}: invalid text reference ${ref}`);
      const filename = path.join(src, 'text', file + '.json');
      if (!files.has(filename)) files.set(filename, JSON.parse(fs.readFileSync(filename, 'utf8')));
      let value = files.get(filename);
      for (const part of key.split('.')) {
        if (!value || !Object.hasOwn(value, part)) throw new Error(`${module}: missing text ${file}#${key}`);
        value = value[part];
      }
      changes.push({ start: node.start, end: node.end, value: '(' + expression(value) + ')' });
      return false;
    });
    for (const change of changes.sort((a, b) => b.start - a.start))
      code = code.slice(0, change.start) + change.value + code.slice(change.end);
    return code;
  };
  expand.files = files;
  return expand;
}

module.exports = { createTextLoader, expression };
