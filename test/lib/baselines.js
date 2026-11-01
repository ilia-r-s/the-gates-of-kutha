// Original release fixtures are immutable. Intentional 29 changes have their own
// reviewed expectations; --baseline=original still selects the historical set.
const path = require('node:path');
const CURRENT = '29.0.0',
  ORIGINAL = '28.5.1';
function baseline(kind, { lang = 'en', version = process.env.KUTHA_BASELINE || 'current', record = false } = {}) {
  version = version === 'current' ? CURRENT : version === 'original' || version === '28.5.2' ? ORIGINAL : version;
  if (![ORIGINAL, CURRENT].includes(version)) throw Error('Unknown baseline ' + version);
  const original = version === ORIGINAL;
  if (record && original) throw Error('Original release fixtures are immutable; record a separate reviewed version');
  if (!['en', 'ru'].includes(lang)) throw Error('Unknown fixture language ' + lang);
  const name =
    kind === 'seasons' ? 'seasons.json' : kind === 'golden' ? lang + '.json.gz' : kind === 'forced' ? 'forced-' + lang + '.json.gz' : null;
  if (!name) throw Error('Unknown baseline kind ' + kind);
  const directory = kind === 'seasons' ? 'fixtures' : 'golden';
  return { version, original, file: path.join(__dirname, '..', directory, ...(original ? [] : [version]), name) };
}
module.exports = { CURRENT, ORIGINAL, baseline };
