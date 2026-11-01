// A local presentation preference. Third person preserves the original renderer;
// changing viewpoint never advances the expedition or either seeded stream.
const Viewpoint = (() => {
  const key = 'kutha.viewpoint';
  let mode = 'third',
    restore = null;
  function firstPerson() {
    const originals = Object.fromEntries(['truck', 'sealed', 'fallen-night'].map(k => [k, { ...END_ART[k] }]));
    END_ART.sealed.lights = u => glow(u, 411, 126, 200) + rays(411, 126, 22, 30, 150, '#fff3c4');
    // Looking back from the lorry. Vehicle boards are scenery, not a held
    // object; the visible person is the guard travelling with the player.
    END_ART.truck.draw = tm =>
      sky(tm, 'morning') +
      ground(tm, 232) +
      pth('M190 236C290 194 480 186 590 236Z', '#d7b276', 3.5) +
      zig(392, 196, 0.5) +
      tent(230, 244, 0.4) +
      tent(288, 248, 0.34) +
      watcherFar(248, 249, 0.9) +
      palm(686, 238, 0.65) +
      `<path d="M348 240L82 340H718L452 240Z" fill="#ecd9a9" stroke="${INK}" stroke-width="3"/>` +
      [0, 1, 2, 3].map(i => ell(400 + i * 9, 248 + i * 18, 26 + i * 22, 7 + i * 3, '#e8d4a8', 0, ' opacity=".45"')).join('') +
      pth('M0 340V230L74 250V340Z', '#78583e', 4) +
      pth('M800 340V230L726 250V340Z', '#78583e', 4) +
      ln('M6 266L72 280M6 308L72 318M794 266L728 280M794 308L728 318', '#b2946d', 4) +
      pth('M74 322H726L800 340H0Z', '#78583e', 4) +
      ln('M120 330H680', '#b2946d', 3) +
      guardFig(666, 354, 2.5) +
      bird(330, 80, 0.8);
    END_ART['fallen-night'].draw = (tm, u, a) => {
      const torn = !a.inBed,
        trace =
          {
            fire: [
              [184, 124],
              [212, 146],
              [178, 206],
              [222, 250],
              [142, 278]
            ]
              .map(([x, y]) => ell(x, y, 7, 5, '#3a1a10', 2) + `<circle cx="${x}" cy="${y}" r="2" fill="#ff8a3a"/>`)
              .join(''),
            dust: ell(400, 300, 110, 12, '#b8b2aa', 0, ' opacity=".8"') + owl(330, 162, 0.7),
            sea: ell(450, 318, 90, 12, '#9cc8cf', 3) + ln('M520 318q40 -2 70 6t70 4', '#9cc8cf', 5, ' opacity=".7"'),
            teeth:
              [
                [240, 314],
                [275, 326],
                [520, 314],
                [560, 328]
              ]
                .map(
                  ([x, y]) =>
                    `<g fill="${INK}" opacity=".7"><ellipse cx="${x}" cy="${y}" rx="5" ry="4"/><circle cx="${x - 5}" cy="${y - 6}" r="2"/><circle cx="${x}" cy="${y - 8}" r="2"/><circle cx="${x + 5}" cy="${y - 6}" r="2"/></g>`
                )
                .join('') + ln('M218 134l-6 6m6 -6l6 6', INK, 3),
            plague: flies(186, 218, 52, 40, 40) + flies(430, 282, 30, 9, 12),
            madness: handMirror(182, 320, 0.9, -70) + scrawl(166, 126, 36) + scrawl(164, 140, 48) + scrawl(162, 154, 60)
          }[a.aspect] || '';
      return (
        sky(tm, a.inBed ? 'morning' : 'night') +
        BG.camp.draw(tm, u, a) +
        pth('M0 0H800V340H690L400 62L110 340H0Z', '#786d63', 4) +
        pth('M0 0L400 62L110 340H0Z', '#59524f', 4) +
        ln('M400 62L400 0M400 62L690 340M24 24L342 72M776 24L458 72', '#3c3431', 4) +
        (torn ? pth('M180 152L234 176L208 204L248 232L210 258L150 298L180 244L150 218L180 190Z', '#15121c', 3) : '') +
        rct(58, 280, 104, 60, '#72563e', 3) +
        lamp(112, 280, 0.75, false, torn ? -78 : 0) +
        (torn ? trace : '') +
        `<rect width="800" height="340" fill="#0b1233" opacity="${a.inBed ? '.07' : '.18'}"/>`
      );
    };
    END_ART['fallen-night'].lights = () => '';

    return () => {
      for (const [k, value] of Object.entries(originals)) END_ART[k] = value;
    };
  }
  function paint() {
    const button = document.getElementById('viewpointBtn');
    if (!button) return;
    button.setAttribute('aria-pressed', String(mode === 'first'));
  }
  function set(value, persist = true) {
    if (value !== 'first' && value !== 'third') return false;
    if (value !== mode) {
      if (restore) restore();
      restore = value === 'first' ? firstPerson() : null;
      mode = value;
    }
    if (persist) {
      try {
        localStorage.setItem(key, mode);
      } catch {
        /* The preference still works for this page. */
      }
    }
    paint();
    const art = document.getElementById('sceneArt');
    if (art && S_ui.scene && !Session.replaying) draw(art, sceneSVG(artFor(S_ui.scene)));
    return true;
  }
  function init(fallback = 'third') {
    let saved = null;
    try {
      saved = localStorage.getItem(key);
    } catch {
      /* Use the visible default when storage is unavailable. */
    }
    set(saved === 'first' || saved === 'third' ? saved : fallback, false);
    document.getElementById('viewpointBtn').addEventListener('click', () => set(mode === 'first' ? 'third' : 'first'));
  }
  return {
    init,
    paint,
    set,
    get mode() {
      return mode;
    }
  };
})();
