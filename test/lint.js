// Lints the game's script as the browser sees it: every module in build order, sharing one global scope. In that
// scope a misspelt name is not an error until the line runs, a function nobody calls is never noticed, and a local
// that happens to share a global's name hides it without a word, so this reads the whole script at once and reports,
// as module:line, names used and never declared, names declared and never used, locals hiding an outer name, the
// usual slips, and any number read from the rules tables that is not there.  usage: node test/lint.js
const fs = require('fs'),
  path = require('path');
const { Linter } = require('eslint');
const globals = require('globals');
const { PAGE, SCRIPT } = require('../build.js');

const SRC = path.join(__dirname, '..', 'src');
let code = '';
const where = []; // line of the whole script -> module:line
SCRIPT.forEach(f => {
  let s = fs.readFileSync(path.join(SRC, f), 'utf8');
  if (!s.endsWith('\n')) s += '\n';
  s.split('\n')
    .slice(0, -1)
    .forEach((_, i) => where.push(`${f}:${i + 1}`));
  code += s;
});
// the page's own markup may call the script from inline handlers: those names count as used
const markup = PAGE.filter(f => f.endsWith('.html'))
  .map(f => fs.readFileSync(path.join(SRC, f), 'utf8'))
  .join('\n');

const rules = {
  'no-undef': 'error',
  'no-unused-vars': ['error', { vars: 'all', args: 'none', caughtErrors: 'none' }],
  'no-redeclare': 'error',
  'no-const-assign': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-shadow-restricted-names': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-fallthrough': 'error',
  'no-unreachable': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-unsafe-negation': 'error',
  'no-cond-assign': ['error', 'except-parens'],
  'no-sparse-arrays': 'error',
  'no-empty': 'error',
  'no-loss-of-precision': 'error',
  'valid-typeof': 'error',
  'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions' }]
};

const found = new Linter()
  .verify(code, [{ languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: globals.browser }, rules }])
  .filter(m => {
    const name = m.ruleId === 'no-unused-vars' && (m.message.match(/'([^']+)'/) || [])[1];
    return !(name && new RegExp(`\\b${name}\\b`).test(markup));
  });
// Every number the code reads from the rules tables (RULES.night.riteNote, FACES.angry, TP(c).chat ...) must be there:
// a key misspelt, or lost inside a comment, reads as undefined, and a chance of undefined is silently never.
const vm = require('vm'),
  tables = vm.createContext({});
vm.runInContext(
  fs.readFileSync(path.join(SRC, 'rules.js'), 'utf8') +
    ';this.T = { RULES, FACES, PUZ, END_HAUNT_W, END_SAYS, END_STYLE_MU, END_STYLE_SD, MANNER, TEMPER: TEMPERS.honest, CRAFT: CRAFT.honest };',
  tables
);
code.split('\n').forEach((whole, i) => {
  const line = whole.replace(/(^|\s)\/\/.*$/, ''); // (not in comments)
  const reads = [
    ...[...line.matchAll(/\b(RULES|FACES|PUZ|END_HAUNT_W|END_SAYS)((?:\.[A-Za-z_]\w*)+)/g)].map(m => [m[1], m[2].slice(1).split('.')]),
    ...[...line.matchAll(/\bTP\([^()]*(?:\([^()]*\))?[^()]*\)\.(\w+)/g)].map(m => ['TEMPER', [m[1]]]),
    ...[...line.matchAll(/\bcraft\([^()]*\)\.(\w+)/g)].map(m => ['CRAFT', [m[1]]])
  ];
  reads.forEach(([table, keys]) => {
    let o = tables.T[table];
    for (const k of keys) {
      if (o == null || typeof o !== 'object' || Array.isArray(o)) break; // past the table into the value itself
      if (!(k in o)) {
        found.push({ ruleId: 'rules', line: i + 1, message: `${table}.${keys.join('.')} is not in src/rules.js` });
        break;
      }
      o = o[k];
    }
  });
});
const byRule = {};
found.forEach(m => (byRule[m.ruleId || 'parse'] = byRule[m.ruleId || 'parse'] || []).push(`${where[m.line - 1]}  ${m.message}`));
Object.entries(byRule).forEach(([rule, lines]) => console.log(`${rule} (${lines.length})\n  ${lines.join('\n  ')}`));
console.log(found.length ? `${found.length} problems` : `clean: ${SCRIPT.length} modules`);
process.exit(found.length ? 1 : 0);
