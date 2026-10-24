// ===================== CUES: what you hear and see when things happen =====================
// The pictures and sounds that follow the game's events (ui/bus.js). Nothing here changes the game.
function timeNow() {
  if (!S) return 'evening';
  if (S.phase === 'descent' || S.phase === 'sanctum') return 'deep';
  if (S.phase === 'night' || S.phase === 'finale') return 'night';
  return ['morning', 'afternoon', 'evening'][S.slot] || 'evening';
}
// the face of whoever you are talking to: what they say sets it (people/dialog.js), in words the art knows (art.js MOODS)
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
  // (the ending brings its own picture: ui/art-end.js)
  switch (S.phase) {
    case 'plan':
      return { bg: 'vista', time };
    case 'loc':
      return { bg: S.loc, time, cast: here(S.loc), moods: moodsOf(here(S.loc), castMood), you: true };
    case 'talk':
      return { bg: S.loc, time, talk: S.talkId, mood: moodNow() };
    case 'result':
      if (S.talkId) return { bg: S.loc || 'camp', time, talk: S.talkId, mood: moodNow() };
      return S.loc ? { bg: S.loc, time, cast: here(S.loc), moods: moodsOf(here(S.loc), castMood), you: true } : { bg: 'camp', time };
    case 'inquiry': {
      const ids = freeChars().map(c => c.id);
      return { bg: 'camp', time: 'evening', cast: ids, moods: moodsOf(ids, inquiryMood) };
    }
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
// ---------- sounds ----------
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
// ---------- music ----------
listen('newgame', () => {
  // A new expedition deals a new set of day themes, and whatever is playing (or about to: a change still under way, or
  // asked for while the sound slept) gives way to the first of them at once; the new set never opens with it.
  const playing = [AU.want, AU.cur && AU.cur.id].filter(Boolean);
  dealPlaylist(playing);
  if (playing.length) musicChange(AU.playlist[0], null, true);
  else AU.want = AU.playlist[0]; // nothing playing: the new season's first theme, when the sound wakes
});
listen('dawn', () => musicChange(trackNow(), 'daybreak'));
listen('descent', () => musicChange('deep', 'descent'));
listen('ending-start', kind => sfx(won_(kind) ? 'victory' : 'defeat'));
listen('ending', kind => musicChange(won_(kind) ? AU.playlist[0] : 'deep', null));
// ---------- every scene: its picture, a sound when a conversation opens or closes, and the music's mood ----------
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
      /* no picture rather than a broken page */
    }
    draw(el, svg);
    entrance(el, ART_IN);
  }
  const t = timeNow();
  setMood(t === 'deep' ? 'deep' : t === 'night' ? 'night' : t === 'evening' ? 'evening' : 'day');
});
