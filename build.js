#!/usr/bin/env node
// Builds the game from src/ into three files:
//   kutha.html            the artifact page (the artifact host adds the document skeleton)
//   standalone.html       the same game as a complete document, for opening straight from disk
//   Gates of Kutha.html   a copy of standalone.html, the file handed to players
// The game is one script made of the modules below, concatenated in order. Every module shares one global scope, so
// the build refuses two top-level declarations of the same name: a function declared twice would silently replace
// the first, which is how a sound effect once overwrote a picture.
// usage: node build.js [--check] [--debug] [--src=dir] [--out=dir]   (--check builds in memory and reports, writing
// nothing; --debug ships the script whole, comments and all)
// The module lists are exported for the tools that read the game as the browser does (test/lint.js).
const fs = require('fs'), path = require('path');
const opt = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const ROOT = __dirname, SRC = path.resolve(ROOT, opt('src') || 'src'), OUT = path.resolve(ROOT, opt('out') || '.');

// The page, then the script. Order matters only for code that runs as the script loads (tables built from other
// tables, the Russian tables laid over the English ones, the listeners that tie sound and pictures to the game).
const PAGE = ['page/head.html', 'page/style.css', 'page/body.html'];
const SCRIPT = [
  'core/random.js',      // the seeded dice
  'core/text.js',        // English and Russian text, and the grammar both need
  'rules.js',            // every number that decides how the game plays
  'core/odds.js',        // every chance written as named steps, each step's share told to the dice trace
  'data/world.js',       // people, powers, charms, places, events: the English tables
  'data/lines.js',       // what people say, as tables
  'data/dread.js',       // what finds you outside the tomb, and how the rite shows its progress
  'data/hazards.js',     // the dig's own dangers, and harm done in secret: the words
  'data/deaths.js',      // how the night's dead are found: the words
  'data/tenor.js',       // how the season's mood shows itself: the words
  'data/variety.js',     // more ways of saying what is said most often
  'world/powers.js',     // the powers below, their signs, titles and charms; the tablets
  'world/deaths.js',     // how the night's dead are found: put together
  'game/state.js',       // the state of a season and the small verbs on it
  'game/record.js',      // the record: testimony and its kinds, traces, accounts, sightings, the journal; the case
  'game/tenor.js',       // the season's mood: how much happens of itself, and how it drifts
  'people/ties.js',      // who likes whom, how far each trusts you, who is sweet on whom
  'people/suspicion.js', // who suspects whom, what was said before everyone, who is closing in on the cult
  'people/tempers.js',   // temperaments: how each person lies, blames and gossips
  'people/claims.js',    // who claims which part in Crane's diary
  'people/social.js',    // mornings: breakfast, grief, blame said aloud
  'people/pretences.js', // pretences dropped: pressed, trusted, of their own accord, before the camp
  'people/moments.js',   // public moments that move many at once, and who hears of a thing
  'people/gossip.js',    // what people say of each other, and of you
  'people/flirt.js',     // a light flirtation, now and then
  'people/visit.js',     // a visit to your tent as the evening ends, once a season at most
  'people/watch.js',     // promises to watch your tent, and the Watcher's nights
  'people/manner.js',    // what shows of a feeling, and what does not: greetings, faces, partings
  'people/thief.js',     // the thief as witness
  'people/cunning.js',   // the cult's craft: planted traces, kept promises, volunteers, the patient traitor
  'people/alibis.js',    // the nights: who was where, who saw what
  'people/dialog.js',    // everything you can say to someone, and what they answer
  'people/parts.js',     // each part's playbook: what the cult, the Dreamer, the Watcher, the thief and anyone do
  'game/day.js',         // the day: places, searching, translating, examining, resting
  'game/dread.js',       // horrors outside the tomb, and the scorched circle
  'game/hazards.js',     // the dig's own dangers by day, and harm done you in secret by night
  'game/inquiry.js',     // accusations before the camp
  'game/verdict.js',     // ... and whether the camp will back you
  'game/night.js',       // the night and the morning after
  'game/yourdreams.js',  // ... and your own dreams in it
  'game/deed.js',        // justice in your own hands, once a season
  'game/events.js',      // the day's news
  'game/finale.js',      // the descent and the rite
  'game/below.js',       // what waits between the gates
  'data/endings.js',     // the endings' words: stories and styles
  'data/fates.js',       // ... and what became of everyone, and of you
  'game/endings.js',     // how an ending is chosen and scored
  'game/fates.js',       // what the ending page tells first: what became of everyone, and of you
  'game/debrief.js',     // ... then the reasons, the numbers, the truth
  'ui/bus.js',           // game events, for sound and pictures to follow
  'ui/scene.js',         // the scene, the meters, the site plan
  'ui/talk.js',          // the conversation screen
  'ui/intro.js',         // the title screen and the arrival
  'ui/book.js',          // the casebook
  'ui/lang.js',          // the language switch
  'ui/art.js',           // portraits and scenes
  'ui/art-end.js',       // the endings' pictures
  'ui/audio.js',         // music and sound
  'ui/cues.js',          // which sounds and pictures follow which events
  'ui/boot.js',          // starting up, once the page is ready
  'i18n/ru-people.js',   // the Russian translation: names and grammar
  'i18n/ru-data.js',     // ... the world tables
  'i18n/ru-talk.js'      // ... conversation tables
];

module.exports = { PAGE, SCRIPT };
if (require.main === module) build().catch(e => { console.error('build failed: ' + e.message); process.exit(1); });

// The pages carry the script without its comments and spare whitespace (names and code untouched: no compression, no
// renaming), which keeps them small enough to publish; the commented source stays in src/. --debug keeps it whole.
async function shipped(script) {
  if (process.argv.includes('--debug')) return script;
  const { minify } = require('terser');
  const r = await minify(script, { compress: false, mangle: false, format: { comments: false, max_line_len: 1000 } });
  // the minifier writes invisible control characters as themselves: put them back as escapes
  return r.code.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
}

async function build() {
  const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
  const script = SCRIPT.map(f => { const s = read(f); return s.endsWith('\n') ? s : s + '\n'; }).join('');

  // top-level names, per module: functions declared twice are the silent kind of collision
  const declared = new Map(), problems = [];
  SCRIPT.forEach(f => read(f).split('\n').forEach((line, i) => {
    const m = line.match(/^(?:async\s+)?function\s*\*?\s*([\w$]+)/) || line.match(/^(?:const|let|var|class)\s+([\w$]+)/);
    if (!m) return;
    const at = `${f}:${i + 1}`;
    if (declared.has(m[1])) problems.push(`${m[1]} declared in ${declared.get(m[1])} and again in ${at}`);
    else declared.set(m[1], at);
  }));
  try { new Function(script); } catch (e) { problems.push('script does not parse: ' + e.message); }
  if (problems.length) { console.error('build failed:\n  ' + problems.join('\n  ')); process.exit(1); }

  if (process.argv.includes('--check')) { console.log(`ok: ${SCRIPT.length} modules, ${declared.size} top-level names, ${Buffer.byteLength(script)} bytes of script`); process.exit(0); }
  // the build's number, shown in the top panel: the version in package.json
  const version = require(path.join(ROOT, 'package.json')).version;
  const markup = PAGE.map(read).join('').replace(/\{\{version\}\}/g, version);
  if (/\{\{\w+\}\}/.test(markup)) { console.error('build failed: a {{placeholder}} the build does not fill'); process.exit(1); }
  const page = markup + '<script>\n' + (await shipped(script)) + '</script>\n';
  const standalone = '<!doctype html>\n<html lang="en">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + page + '</html>\n';
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'kutha.html'), page);
  fs.writeFileSync(path.join(OUT, 'standalone.html'), standalone);
  fs.writeFileSync(path.join(OUT, 'Gates of Kutha.html'), standalone);
  console.log(`built ${version}: ${SCRIPT.length} modules, ${declared.size} top-level names · kutha.html ${Buffer.byteLength(page)} B · standalone.html ${Buffer.byteLength(standalone)} B`);
}
