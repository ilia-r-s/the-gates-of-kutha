// Remove generated deliverables; keep dependencies, local Node, caches and source assets intact.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, GAME_FILE } = require('../build');
for (const file of [GAME_FILE, '_site', 'test/shots']) {
  const target = path.join(ROOT, file);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`removed ${file}`);
  }
}
