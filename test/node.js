// Tests in Node: each file in test/node/ holds named checks run on the game loaded in Node without a browser
// (test/lib/kernel.js), each on a game of its own, in milliseconds. They test the machineries one at a time: their
// odds against the rules, their levels and their bounds.
//   node test/node.js            every file
//   node test/node.js odds       one file (test/node/odds.js)
const fs = require('fs');
const path = require('path');
const { kernel } = require('./lib/kernel');
const dir = path.join(__dirname, 'node'),
  only = process.argv[2];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && (!only || f === only + '.js'));
let n = 0;
const failed = [];
for (const f of files) {
  for (const [name, t] of Object.entries(require(path.join(dir, f)))) {
    n++;
    try {
      t(kernel());
    } catch (e) {
      failed.push(`${f.replace(/\.js$/, '')}: ${name}: ${String(e.message).slice(0, 400)}`);
    }
  }
}
console.log(JSON.stringify({ tests: n, failed: failed.length, failures: failed.slice(0, 20) }, null, 1));
