// Explicit capture/review for an authorized behavioral release. Never overwrites
// original expectations. Requires the preserved original artifact to verify the
// comparison rather than treating different hashes as an explanation.
// node test/baselines.js --original=<28-artifact> --file=<29-artifact> --out=review.json --write
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { gunzipSync } = require('node:zlib');
const assert = require('node:assert/strict');
const { openNode, args, FILE } = require('./lib/harness');
const { baseline } = require('./lib/baselines');
const { cases, caseId, play, fingerprint } = require('./lib/season');
const A = args({ original: '', file: FILE, out: '' });
if (!A.original || !A.out) throw Error('--original=<preserved-artifact> and --out=<review.json> are required');
const original = require(baseline('seasons', { version: 'original' }).file),
  destination = baseline('seasons', { record: true }),
  sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  first = (a, b) => {
    const i = a.findIndex((v, i) => JSON.stringify(v) !== JSON.stringify(b[i]));
    return i >= 0 ? i : a.length === b.length ? null : a.length;
  };
function transcripts(lang) {
  const read = (kind, version) => JSON.parse(gunzipSync(fs.readFileSync(baseline(kind, { lang, version }).file))),
    prior = read('golden', 'original'),
    current = read('golden', 'current'),
    index = rows => {
      const used = {};
      return new Map(rows.map(r => [r[0] + ':' + (used[r[0]] = (used[r[0]] || 0) + 1), r]));
    },
    before = index(read('forced', 'original')),
    after = index(read('forced', 'current')),
    snippet = (a, b) => {
      const text = s =>
          String(s ?? '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' '),
        x = text(a),
        y = text(b);
      let i = 0;
      while (i < Math.min(x.length, y.length) && x[i] === y[i]) i++;
      return [x.slice(Math.max(0, i - 60), i + 180), y.slice(Math.max(0, i - 60), i + 180)];
    },
    changed = [];
  for (const [key, row] of before) {
    const next = after.get(key);
    assert.ok(next, 'Original forced scenario removed: ' + key);
    if (JSON.stringify(row) === JSON.stringify(next)) continue;
    const field = first(row, next);
    changed.push({ scenario: key, field, text: snippet(row[field], next[field]) });
  }
  return {
    golden: Object.keys(prior).map(seed => {
      const a = prior[seed].rec,
        b = current[seed]?.rec;
      assert.ok(b && b.length === a.length, 'Golden sample count changed: ' + seed);
      const fields = {};
      a.forEach((r, i) =>
        Object.keys(r).forEach(k => {
          if (JSON.stringify(r[k]) !== JSON.stringify(b[i][k])) fields[k] = (fields[k] || 0) + 1;
        })
      );
      return { seed: +seed, steps: a.length, firstChanged: first(a, b), fields };
    }),
    forced: {
      before: before.size,
      after: after.size,
      identical: before.size - changed.length,
      added: [...after.keys()].filter(k => !before.has(k)),
      changed
    }
  };
}
async function main() {
  const report = { version: destination.version, originalArtifactSha256: sha(A.original), artifactSha256: sha(A.file), seasons: [] },
    fixture = {
      version: destination.version,
      referenceSha256: report.artifactSha256,
      originalReferenceSha256: original.referenceSha256,
      seasons: {}
    };
  for (const input of cases) {
    const originalGame = await openNode(null, { file: A.original }),
      currentGame = await openNode(null, { file: A.file });
    try {
      const before = await originalGame.page.evaluate(play, input),
        after = await currentGame.page.evaluate(play, input),
        key = caseId(input);
      assert.deepEqual(fingerprint(before), original.seasons[key], 'Preserved original artifact or historical driver changed: ' + key);
      assert.equal(after.ended, true, 'Unfinished current season ' + key);
      assert.deepEqual(originalGame.errors, []);
      assert.deepEqual(currentGame.errors, []);
      fixture.seasons[key] = fingerprint(after);
      const a = JSON.parse(before.state),
        b = JSON.parse(after.state),
        choice = first(before.trail, after.trail),
        die = first(before.dice, after.dice),
        action = (r, i) =>
          r.trail[i] ? { phase: r.trail[i][0], choice: r.trail[i][1][r.trail[i][2]], offered: r.trail[i][1].length } : null;
      report.seasons.push({
        case: key,
        ending: [a.ended, b.ended],
        steps: [before.trail.length, after.trail.length],
        dice: [before.dice.length, after.dice.length],
        changedFields: Object.keys(fixture.seasons[key]).filter(k => fixture.seasons[key][k] !== original.seasons[key][k]),
        stateFields: [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])),
        firstChoice: choice === null ? null : { index: choice, before: action(before, choice), after: action(after, choice) },
        firstDie: die === null ? null : { index: die, before: before.dice[die] || null, after: after.dice[die] || null }
      });
    } finally {
      await originalGame.page.close();
      await currentGame.page.close();
    }
  }
  if (A.transcripts) report.transcripts = Object.fromEntries(['en', 'ru'].map(lang => [lang, transcripts(lang)]));
  fs.mkdirSync(path.dirname(A.out), { recursive: true });
  fs.writeFileSync(A.out, JSON.stringify(report, null, 2) + '\n');
  if (A.write) {
    fs.mkdirSync(path.dirname(destination.file), { recursive: true });
    fs.writeFileSync(destination.file, JSON.stringify(fixture, null, 2) + '\n');
  }
  console.log(
    JSON.stringify({
      version: destination.version,
      seasons: cases.length,
      originalVerified: true,
      report: A.out,
      recorded: !!A.write,
      changes: report.seasons.filter(s => s.changedFields.length).length
    })
  );
}
main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
