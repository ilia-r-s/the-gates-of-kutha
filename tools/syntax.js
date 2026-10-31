// Shared AST plumbing for the compiler, inspection and dead-code checks.
const { parse } = require('acorn');
function walk(node, visit, parent = null, key = null) {
  if (!node || typeof node !== 'object' || !node.type) return;
  if (visit(node, parent, key) === false) return;
  for (const [field, value] of Object.entries(node)) {
    if (Array.isArray(value)) value.forEach(child => walk(child, visit, node, field));
    else if (value && typeof value === 'object') walk(value, visit, node, field);
  }
}
function bindings(node) {
  if (!node) return [];
  if (node.type === 'Identifier') return [node.name];
  if (node.type === 'RestElement') return bindings(node.argument);
  if (node.type === 'AssignmentPattern') return bindings(node.left);
  if (node.type === 'ArrayPattern') return node.elements.flatMap(bindings);
  if (node.type === 'ObjectPattern') return node.properties.flatMap(p => bindings(p.value || p.argument));
  return [];
}
module.exports = { parse, walk, bindings };
