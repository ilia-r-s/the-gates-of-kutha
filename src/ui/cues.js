function timeNow() {
  if (!S) return 'evening';
  if (S.phase === 'descent' || S.phase === 'sanctum') return 'deep';
  if (S.phase === 'night' || S.phase === 'finale') return 'night';
  return ['morning', 'afternoon', 'evening'][S.slot] || 'evening';
}
const FACE_OF = { uneasy: 'fear', stern: 'angry', grave: 'sad', sly: 'smirk' };
function moodNow() {
  const e = S && S.cv && S.cv.themE,
    m = FACE_OF[e] || e;
  return MOODS.includes(m) ? m : 'neutral';
}
const moodsOf = (ids, f) => Object.fromEntries(ids.map(id => [id, f(C(id))]));
function artFor(sc) {
  if (sc.art) return sc.art;
  if (!S) return { bg: 'vista', time: 'evening' };
  const time = ['morning', 'afternoon', 'evening'][S.slot] || 'evening';
  const here = l => (S.here[l] || []).filter(id => isFree(C(id)));
  switch (S.phase) {
    case 'plan':
      return { bg: 'vista', time: time };
    case 'loc':
      return { bg: S.loc, time: time, cast: here(S.loc), you: true, moods: moodsOf(here(S.loc), c => pictureFace(c, S.loc)) };
    case 'talk':
      return { bg: S.loc, time: time, talk: S.talkId, mood: moodNow() };
    case 'result':
      if (S.talkId) return { bg: S.loc || 'camp', time: time, talk: S.talkId, mood: moodNow() };
      return S.loc
        ? { bg: S.loc, time: time, cast: here(S.loc), you: true, moods: moodsOf(here(S.loc), c => pictureFace(c, S.loc)) }
        : { bg: 'camp', time: time };
    case 'inquiry': {
      const ids = freeChars().map(c => c.id);
      return { bg: 'camp', time: 'evening', cast: ids, moods: moodsOf(ids, c => pictureFace(c, 'camp')) };
    }
    case 'deed':
      return { bg: 'camp', time: 'evening' };
    case 'visit':
    case 'night':
      return { bg: 'camp', time: 'night' };
    case 'finale':
      return { bg: 'vista', time: 'night', cast: S.fin ? S.fin.comp : [] };
    case 'descent':
      return { bg: 'gate', time: 'deep', cast: S.fin ? withYou() : [] };
    case 'sanctum':
      return { bg: 'sanctum', time: 'deep', aspect: S.aspectOf[S.patron], cast: freeCult().map(c => c.id) };
    default:
      return { bg: 'vista', time: 'morning' };
  }
}
const won_ = kind => kind === 'exposed' || kind === 'triumph' || kind === 'pyrrhic';
let loreAt = 0,
  wasTalk = false;
listen('steps', () => sfx('steps'));
listen('item', () => sfx('item'));
listen('lore', () => {
  if (Date.now() - loreAt > 400) {
    loreAt = Date.now();
    sfx('lore');
  }
});
listen('omen', () => sfx('omen'));
listen('clue', () => sfx('clue'));
listen('hurt', (n, w) => {
  if (w) sfx('wound');
  else if (n) sfx('nerve');
});
listen('nightfall', () => sfx('night'));
listen('inquiry', () => sfx('gong'));
listen('accuse', right => sfx(right ? 'success' : 'fail'));
listen('refused', () => sfx('fail'));
listen('ask', k => {
  const s = { show: 'clink', press: 'thud', confide: 'soft' }[k];
  if (s) sfx(s);
});
function newThemes() {
  const playing = [AU.want, AU.cur && AU.cur.id].filter(Boolean);
  dealPlaylist(playing);
  if (playing.length) musicChange(AU.playlist[0], null, true);
  else AU.want = AU.playlist[0];
}
let themesDealt = false,
  seasonsBegun = 0;
listen('expedition', () => {
  newThemes();
  themesDealt = true;
});
listen('newgame', () => {
  if (themesDealt) themesDealt = false;
  else if (seasonsBegun) newThemes();
  seasonsBegun++;
});
listen('dawn', () => musicChange(trackNow(), 'daybreak'));
listen('descent', () => musicChange('deep', 'descent'));
listen('ending-start', kind => sfx(won_(kind) ? 'victory' : 'defeat'));
listen('ending', kind => musicChange(won_(kind) ? AU.playlist[0] : 'deep', null));
listen('scene', sc => {
  const talking = !!(S && S.phase === 'talk');
  if (talking && !wasTalk) sfx('open');
  else if (!talking && wasTalk) sfx('close');
  wasTalk = talking;
  const a = artFor(sc),
    el = document.getElementById('sceneArt');
  if (el) {
    let svg = '';
    try {
      svg = sceneSVG(a);
    } catch (e) {
      /* Optional browser feature or local preference storage. */
    }
    draw(el, svg);
    entrance(el, ART_IN);
  }
  const t = timeNow();
  setMood(t === 'deep' ? 'deep' : t === 'night' ? 'night' : t === 'evening' ? 'evening' : 'day');
});
