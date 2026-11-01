#!/usr/bin/env node
// Inventory and candidates for an editorial pass. These are prompts for reading,
// not automatic judgments: quoted characters can lie, and a repeated line can fit.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../build');

function review() {
  const counts = { catalogs: 0, stringLeaves: 0, codeLeaves: 0, characters: 0 },
    byCatalog = {},
    candidates = [],
    repeated = new Map();
  const playerGender =
    /(?<![\p{L}])(?:вы|вам|ты)\s+(?:[^.!?\n]{0,35}\s)?(?:был|стал|сделал|пришёл|пошёл|увидел|сказал|готов|должен|один)(?![\p{L}])/iu;
  function leaf(text, ref, code = false) {
    counts.stringLeaves++;
    counts.characters += text.length;
    if (code) counts.codeLeaves++;
    if (playerGender.test(text)) candidates.push({ kind: 'possible-player-gender', ref, text });
    if (/\b(?:always|never|everyone|nobody|certainly)\b|всегда|никогда|все знают|несомненно/i.test(text) && text.length > 65)
      candidates.push({ kind: 'check-claim-versus-narrator-certainty', ref, text });
    if (text.length > 90 && !code) {
      const key = text.replace(/\s+/g, ' ').trim();
      if (!repeated.has(key)) repeated.set(key, []);
      repeated.get(key).push(ref);
    }
  }
  function visit(value, ref) {
    if (typeof value === 'string') return leaf(value, ref);
    if (Array.isArray(value)) return value.forEach((v, i) => visit(v, `${ref}.${i}`));
    if (!value || typeof value !== 'object') return;
    if ('$js' in value) return leaf(value.$js, ref, true);
    if ('$template' in value) return leaf(value.$template, ref);
    if ('$value' in value) return visit(value.$value, ref);
    if ('$call' in value) return visit(value.$args, ref);
    for (const [key, item] of Object.entries(value)) visit(item, ref ? `${ref}.${key}` : key);
  }
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(file);
        continue;
      }
      if (!entry.name.endsWith('.json')) continue;
      counts.catalogs++;
      const name = path
          .relative(path.join(ROOT, 'src/text'), file)
          .replace(/\\/g, '/')
          .replace(/\.json$/, ''),
        before = counts.stringLeaves;
      for (const [key, value] of Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))) visit(value, `${name}#${key}`);
      byCatalog[name] = counts.stringLeaves - before;
    }
  }
  walk(path.join(ROOT, 'src/text'));
  return {
    counts,
    byCatalog,
    candidates,
    repeated: [...repeated].filter(([, refs]) => refs.length > 1).map(([text, refs]) => ({ text, refs }))
  };
}
module.exports = { review };
if (require.main === module) {
  const r = review(),
    out = process.argv.find(a => a.startsWith('--out='))?.slice(6);
  if (out) fs.writeFileSync(out, JSON.stringify(r, null, 2) + '\n');
  console.log(
    JSON.stringify({ ...r.counts, candidates: r.candidates.length, repeatedPassages: r.repeated.length, ...(out ? { out } : {}) }, null, 2)
  );
}
