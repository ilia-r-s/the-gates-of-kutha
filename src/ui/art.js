// ===================== ART: 90s cartoon portraits and scenes (inline SVG) =====================
const INK = '#2b1b24';
const pth = (d, f, sw = 3, x = '') =>
  `<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${x}/>`;
const ln = (d, c = INK, sw = 3, x = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${x}/>`;
const ell = (cx, cy, rx, ry, f, sw = 3, x = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${sw ? INK : 'none'}" stroke-width="${sw}"${x}/>`;
const rct = (x, y, w, h, f, sw = 3, e = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" stroke="${sw ? INK : 'none'}" stroke-width="${sw}" stroke-linejoin="round"${e}/>`;

const LOOKS = {
  hamid: {
    skin: '#b97a50',
    shade: '#965b3b',
    face: 'square',
    nose: 'broad',
    brows: 'thick',
    hairC: '#2b211c',
    fh: 'moustache',
    head: 'keffiyeh',
    body: 'jacket',
    bodyC: '#5a4636',
    bodyS: '#433224',
    collar: '#efe6d2'
  },
  anselm: {
    skin: '#f0c9a8',
    shade: '#d6a585',
    face: 'long',
    nose: 'long',
    brows: 'thin',
    hairC: '#8a6a4a',
    head: 'tonsure',
    glasses: 'pince',
    body: 'habit',
    bodyC: '#f4f0e6',
    bodyS: '#d8d0bd',
    acc: 'rosary'
  },
  constance: {
    skin: '#f5d3b8',
    shade: '#ddb093',
    face: 'oval',
    nose: 'button',
    brows: 'arched',
    hairC: '#9a4a2a',
    head: 'cloche',
    hatC: '#3f7f86',
    hatS: '#2c5f66',
    body: 'blouse',
    bodyC: '#ebe4f1',
    bodyS: '#cbc1d9',
    acc: 'camera',
    lips: '#b8434e'
  },
  ashby: {
    skin: '#f2c2a2',
    shade: '#d99c7c',
    face: 'round',
    nose: 'bulb',
    brows: 'bushy',
    hairC: '#c9a27a',
    browC: '#b08454',
    fh: 'walrus',
    head: 'pith',
    body: 'uniform',
    bodyC: '#a8905c',
    bodyS: '#8a7446',
    acc: 'ribbons'
  },
  yusuf: {
    skin: '#d29e74',
    shade: '#b17c56',
    face: 'oval',
    nose: 'straight',
    brows: 'arched',
    hairC: '#1f1a1a',
    fh: 'thin',
    head: 'sidara',
    body: 'suit',
    bodyC: '#3d4a6a',
    bodyS: '#2c3650',
    collar: '#f3efe4',
    tie: '#a3393a'
  },
  ilse: {
    skin: '#f3d6c0',
    shade: '#dab59c',
    face: 'long',
    nose: 'straight',
    brows: 'stern',
    hairC: '#4a3326',
    head: 'bob',
    glasses: 'round',
    body: 'field',
    bodyC: '#b9a47a',
    bodyS: '#9c8760',
    acc: 'pencil',
    lips: '#a8545a'
  },
  zahrun: {
    skin: '#c48a5e',
    shade: '#a26b45',
    face: 'oval',
    nose: 'broad',
    brows: 'thick',
    hairC: '#ebe7df',
    browC: '#d8d2c6',
    fh: 'full',
    head: 'turban',
    body: 'robe',
    bodyC: '#f6f3ec',
    bodyS: '#dcd6c8'
  }
};
const FACE = {
  oval: 'M100 46C132 46 140 70 140 96C140 126 124 144 100 144C76 144 60 126 60 96C60 70 68 46 100 46Z',
  long: 'M100 42C128 42 136 66 136 96C136 132 120 152 100 152C80 152 64 132 64 96C64 66 72 42 100 42Z',
  square: 'M100 46C134 46 142 64 142 92C142 122 136 142 100 145C64 142 58 122 58 92C58 64 66 46 100 46Z',
  round: 'M100 48C136 48 145 74 145 100C145 128 126 145 100 145C74 145 55 128 55 100C55 74 64 48 100 48Z'
};
const EARX = { oval: 60, long: 64, square: 58, round: 55 };
const TORSO = 'M16 236C18 188 50 162 100 160C150 162 182 188 184 236Z';

// ---------- the faces ----------
// neutral, smile, fear, angry; and warm, sad, thoughtful, surprised, cold, coy, smirk, wink. Every face is drawn from
// the same parts (eyes and lids, brows, mouth, cheeks), so each person keeps their own features in every mood.
const MOODS = ['neutral', 'smile', 'warm', 'coy', 'smirk', 'wink', 'thoughtful', 'surprised', 'sad', 'fear', 'cold', 'angry'];
// a lid across the top of the eye, filled with skin: lower toward the nose (angry) or toward the ear (sad), or level
const upperLid = (x, i, sk, inner, outer, bow) => {
  const yl = i ? inner : outer, // the left end of the lid: the outer corner (by the ear) of the eye on the left, the
    yr = i ? outer : inner; //    inner one (by the nose) of the eye on the right
  return (
    `<path d="M${x - 11} 82L${x + 11} 82L${x + 11} ${yr}Q${x} ${bow} ${x - 11} ${yl}Z" fill="${sk}"/>` +
    ln(`M${x - 10} ${yl - 1}Q${x} ${bow - 1} ${x + 10} ${yr - 1}`)
  );
};
// a lower lid pushed up by a smile: hard (smile) or soft (warm)
const lowerLid = (x, sk, top, bow, sw = 2.5) =>
  `<path d="M${x - 11} 108L${x - 11} ${top}Q${x} ${bow} ${x + 11} ${top}L${x + 11} 108Z" fill="${sk}"/>` +
  ln(`M${x - 10} ${top + 1}Q${x} ${bow + 1} ${x + 10} ${top + 1}`, INK, sw);
function eyes(m, lk, sk, lashes) {
  const wide = m === 'fear' || m === 'surprised',
    ry = wide ? 12 : 10.5,
    pr = wide ? 2.8 : 4;
  // where the pupils go: the thoughtful look up and away, the coy aside and down, the cold straight through you
  const dx = m === 'thoughtful' ? 3 : m === 'coy' ? -2.5 : 0,
    dy = m === 'thoughtful' ? -3 : m === 'cold' || m === 'coy' ? 2 : 0;
  let s = '';
  [84, 116].forEach((x, i) => {
    s +=
      ell(x, 94, 9, ry, '#fff', 3) +
      `<circle cx="${x + lk + dx}" cy="${95 + dy}" r="${pr}" fill="${INK}"/><circle cx="${x + lk + dx + 1.3}" cy="${93.4 + dy}" r="1.2" fill="#fff"/>`;
    if (m === 'angry') s += upperLid(x, i, sk, 93, 89, 88);
    if (m === 'sad') s += upperLid(x, i, sk, 88, 92, 87);
    if (m === 'cold') s += upperLid(x, i, sk, 92, 92, 90);
    if (m === 'coy')
      s += upperLid(x, i, sk, 91, 91, 87) + (lashes ? ln(i ? `M${x + 10} 90l4.5 -2.5` : `M${x - 10} 90l-4.5 -2.5`, INK, 2.5) : '');
    if (m === 'smile') s += lowerLid(x, sk, 99, 92);
    if (m === 'warm' || ((m === 'smirk' || m === 'wink') && i === 0)) s += lowerLid(x, sk, 101, 96);
    // a wink: the right eye shut in a smile, a lash at its corner for those who wear them
    if (m === 'wink' && i)
      s +=
        `<path d="M${x - 11} 81L${x + 11} 81L${x + 11} 107L${x - 11} 107Z" fill="${sk}"/>` +
        ln(`M${x - 10} 94Q${x} 101 ${x + 10} 94`, INK, 3) +
        (lashes ? ln(`M${x + 10} 94l4.5 -2`, INK, 2.5) : '');
  });
  return s;
}
function brows(m, L) {
  const w = { thin: 3, arched: 3.5, stern: 4.5, thick: 5.5, bushy: 7.5 }[L.brows] || 4;
  const c = L.browC || (L.brows === 'thick' ? L.hairC : INK);
  const B =
    {
      neutral: ['M73 80Q84 75 95 79', 'M105 79Q116 75 127 80'],
      smile: ['M73 77Q84 70 95 75', 'M105 75Q116 70 127 77'],
      warm: ['M73 78Q84 72 95 77', 'M105 77Q116 72 127 78'],
      fear: ['M73 80Q84 76 95 71', 'M105 71Q116 76 127 80'],
      sad: ['M73 81Q84 78 95 74', 'M105 74Q116 78 127 81'],
      angry: ['M73 73Q84 76 95 83', 'M105 83Q116 76 127 73'],
      thoughtful: ['M73 80Q84 78 95 81', 'M105 76Q116 67 127 74'],
      surprised: ['M73 74Q84 65 95 71', 'M105 71Q116 65 127 74'],
      cold: ['M73 81Q84 80 95 82', 'M105 82Q116 80 127 81'],
      coy: ['M73 79Q84 74 95 78', 'M105 76Q116 68 127 75'],
      smirk: ['M73 80Q84 77 95 80', 'M105 77Q116 69 127 76'],
      wink: ['M73 76Q84 68 95 74', 'M105 82Q116 79 127 84']
    }[m] || [];
  return ln(B[0], c, w) + ln(B[1], c, w);
}
const NOSE = {
  button: () => ln('M95 111Q100 118 105 111'),
  long: () => ln('M101 95L95 117Q100 122 107 117'),
  bulb: () => ell(100, 113, 10, 8.5, '#ec9a86', 3) + '<circle cx="96" cy="110" r="2.2" fill="#fff" opacity=".7"/>',
  straight: () => ln('M101 97L96 116L105 117'),
  broad: () => ln('M93 115Q100 121 107 115') + ln('M96 107Q93 113 96 116', INK, 2.5) + ln('M104 107Q107 113 104 116', INK, 2.5)
};
function mouth(m, L, my) {
  const y = 129 + my,
    lips = L.lips;
  // a closed mouth: a line, or for those who wear lipstick a thin filled shape of the same curve
  const shut = (a, b, c, d) =>
    lips
      ? pth(`M${a} ${b}Q${c} ${d} ${a + 2 * (c - a)} ${b}Q${c} ${(b + d) / 2} ${a} ${b}Z`, lips, 2.5)
      : ln(`M${a} ${b}Q${c} ${d} ${a + 2 * (c - a)} ${b}`);
  if (m === 'smile') return pth(`M86 ${y - 2}Q100 ${y + 13} 114 ${y - 2}Q100 ${y + 4} 86 ${y - 2}Z`, '#7a2632', 3);
  if (m === 'fear') return ell(100, y + 3, 5, 6, '#7a2632', 3);
  if (m === 'surprised') return ell(100, y + 4, 6.5, 8.5, '#7a2632', 3);
  if (m === 'angry') return ln(`M89 ${y + 5}Q100 ${y - 2} 111 ${y + 5}`);
  if (m === 'warm') return shut(88, y - 1, 100, y + 8);
  if (m === 'sad') return shut(91, y + 4, 100, y - 1);
  if (m === 'cold') return lips ? pth(`M91 ${y + 1}Q100 ${y + 3} 109 ${y + 1}Q100 ${y} 91 ${y + 1}Z`, lips, 2.5) : ln(`M91 ${y + 1}H109`);
  // the lopsided ones: a smile on one side only, a mouth pushed aside in thought
  if (m === 'coy')
    return lips ? pth(`M91 ${y}Q102 ${y + 7} 111 ${y - 3}Q102 ${y + 2} 91 ${y}Z`, lips, 2.5) : ln(`M91 ${y}Q102 ${y + 6} 111 ${y - 3}`);
  if (m === 'smirk')
    return lips
      ? pth(`M89 ${y + 2}Q101 ${y + 5} 112 ${y - 4}Q101 ${y + 2} 89 ${y + 2}Z`, lips, 2.5)
      : ln(`M89 ${y + 2}Q101 ${y + 5} 112 ${y - 4}`);
  if (m === 'wink')
    return lips ? pth(`M88 ${y}Q101 ${y + 9} 113 ${y - 4}Q101 ${y + 4} 88 ${y}Z`, lips, 2.5) : ln(`M88 ${y}Q101 ${y + 8} 113 ${y - 4}`);
  if (m === 'thoughtful')
    return lips
      ? pth(`M95 ${y + 2}Q103 ${y + 4} 110 ${y - 1}Q103 ${y + 1} 95 ${y + 2}Z`, lips, 2.5)
      : ln(`M95 ${y + 2}Q103 ${y + 3} 109 ${y - 1}`);
  return lips ? pth(`M90 ${y}Q100 ${y + 6} 110 ${y}Q100 ${y - 2} 90 ${y}Z`, lips, 2.5) : ln(`M90 ${y}Q100 ${y + 4} 110 ${y}`);
}
const FH = {
  moustache: L => pth('M85 124Q92 117 100 121Q108 117 115 124Q108 128 100 124.5Q92 128 85 124Z', L.hairC, 2.5),
  walrus: L => pth('M73 129Q83 112 100 120Q117 112 127 129Q117 133 108 126Q100 131 92 126Q83 133 73 129Z', L.hairC, 3),
  thin: L => ln('M88 123Q100 117 112 123', L.hairC, 3.5),
  full: L => pth('M84 125Q92 117 100 121Q108 117 116 125Q108 129 100 125Q92 129 84 125Z', L.hairC, 2.5)
};
const beard = L =>
  pth('M61 104C58 152 80 180 100 180C120 180 142 152 139 104C132 128 118 138 100 138C82 138 68 128 61 104Z', L.hairC, 3.5) +
  ln('M88 150Q92 160 90 170M112 150Q108 160 110 170M100 146V172', '#cfc8bb', 2);
const GL = '#9a7a3e';
const GLASSES = {
  round: () =>
    `<g fill="rgba(255,255,255,.18)" stroke="${GL}" stroke-width="2.5"><circle cx="84" cy="94" r="13"/><circle cx="116" cy="94" r="13"/></g>` +
    ln('M97 93Q100 89 103 93', GL, 2.5) +
    ln('M71 92L60 90M129 92L140 90', GL, 2.5),
  pince: () =>
    `<g fill="rgba(255,255,255,.18)" stroke="${GL}" stroke-width="2.2"><ellipse cx="84" cy="95" rx="11" ry="9"/><ellipse cx="116" cy="95" rx="11" ry="9"/></g>` +
    ln('M95 94Q100 90 105 94', GL, 2.2) +
    ln('M73 98Q66 132 82 160', '#c9a44c', 1.5)
};
const HEADS = {
  keffiyeh: {
    back: (L, u) => pth('M52 90C50 52 72 32 100 32C128 32 150 52 148 90L162 196L38 196Z', `url(#${u}k)`, 4),
    front: (L, u) =>
      pth('M57 96C52 56 74 37 100 37C126 37 148 56 143 96C136 72 120 63 100 63C80 63 64 72 57 96Z', `url(#${u}k)`, 4) +
      pth('M57 96L50 168L66 170L66 108Z', `url(#${u}k)`, 3) +
      pth('M143 96L150 168L134 170L134 108Z', `url(#${u}k)`, 3) +
      ln('M58 69Q100 46 142 69', '#1c1418', 7) +
      ln('M60 77Q100 55 140 77', '#1c1418', 6)
  },
  tonsure: {
    front: L =>
      pth('M62 102C57 78 66 60 81 54Q71 72 72 102Z', L.hairC, 3) +
      pth('M138 102C143 78 134 60 119 54Q129 72 128 102Z', L.hairC, 3) +
      ln('M80 52Q100 45 120 52', L.hairC, 4)
  },
  cloche: {
    back: L => pth('M54 92C46 128 54 150 74 152L78 96Z', L.hairC, 3.5) + pth('M146 92C154 128 146 150 126 152L122 96Z', L.hairC, 3.5),
    front: L =>
      pth('M53 94C48 52 72 33 100 33C128 33 152 52 147 94C140 82 126 74 100 74C74 74 60 82 53 94Z', L.hatC, 4) +
      `<path d="M55 84C70 72 130 72 145 84L146 91C130 79 70 79 54 91Z" fill="${L.hatS}"/>` +
      ell(137, 82, 7, 6, '#e9c46a', 2.5) +
      ell(137, 82, 2.5, 2.5, '#b8434e', 0)
  },
  pith: {
    front: L =>
      pth('M60 66C58 30 78 18 100 18C122 18 142 30 140 66Z', '#ece2c6', 4) +
      '<path d="M61 57H139V66H61Z" fill="#8c7a52"/>' +
      ell(100, 68, 58, 8, '#dccfae', 4) +
      ln('M72 46Q100 28 128 46', '#d6caa8', 3) +
      pth('M58 84Q55 98 59 108L64 90Z', L.hairC, 2.5) +
      pth('M142 84Q145 98 141 108L136 90Z', L.hairC, 2.5)
  },
  sidara: {
    back: L => pth('M60 98C58 72 66 60 78 58L76 102Z', L.hairC, 3) + pth('M140 98C142 72 134 60 122 58L124 102Z', L.hairC, 3),
    front: L =>
      pth('M64 72C70 54 130 54 136 72C120 64 80 64 64 72Z', L.hairC, 3) +
      pth('M66 60C72 40 128 40 134 60L130 68C118 59 82 59 70 68Z', '#22202a', 3.5) +
      ln('M100 43V63', '#4a4656', 2.5)
  },
  bob: {
    back: L => pth('M55 100C49 56 72 37 100 37C128 37 151 56 145 100L147 140L127 142L121 98L79 98L73 142L53 140Z', L.hairC, 4),
    front: L => pth('M59 90C60 56 82 45 100 45C118 45 140 56 141 90C130 74 114 67 100 72C86 67 70 74 59 90Z', L.hairC, 3.5)
  },
  turban: {
    back: L => pth('M60 98C58 84 62 78 66 76L68 104Z', L.hairC, 2.5) + pth('M140 98C142 84 138 78 134 76L132 104Z', L.hairC, 2.5),
    front: () =>
      pth('M54 84C48 48 74 30 100 30C126 30 152 48 146 84C134 74 118 70 100 70C82 70 66 74 54 84Z', '#f7f4ec', 4) +
      ln('M62 60Q100 41 138 60', '#d8d0bf', 3) +
      ln('M57 72Q100 54 143 72', '#d8d0bf', 3)
  }
};
const BODIES = {
  jacket: L => pth('M84 160L100 204L116 160Z', L.collar, 3) + ln('M100 204V236'),
  habit: L =>
    pth('M16 236C18 196 34 172 64 164L82 236Z', '#2c2a2e', 4) +
    pth('M184 236C182 196 166 172 136 164L118 236Z', '#2c2a2e', 4) +
    pth('M70 166Q100 150 130 166Q100 180 70 166Z', L.bodyS, 3),
  blouse: () => pth('M68 162L100 198L132 162L152 178L100 218L48 178Z', '#2f3f6a', 3.5) + ln('M58 174L100 208L142 174', '#f3efe4', 2),
  uniform: () =>
    ln('M66 166L150 236', '#6b4a2a', 9) +
    '<rect x="80" y="160" width="9" height="11" fill="#b8322f"/><rect x="111" y="160" width="9" height="11" fill="#b8322f"/>' +
    ln('M100 166V236', INK, 2.5) +
    '<circle cx="100" cy="190" r="2.6" fill="#d9b44a"/><circle cx="100" cy="212" r="2.6" fill="#d9b44a"/>',
  suit: L =>
    pth('M84 160L100 208L116 160Z', L.collar, 3) +
    pth('M96 166H104L107 200L100 210L93 200Z', L.tie, 2.5) +
    ln('M84 160L74 236M116 160L126 236') +
    ln('M70 180L84 196M130 180L116 196', INK, 2.5),
  field: L => pth('M84 160L100 190L116 160Z', '#b8463c', 3) + rct(56, 194, 22, 18, L.bodyS, 2.5) + rct(122, 194, 22, 18, L.bodyS, 2.5),
  robe: () => ln('M78 164Q100 190 122 164') + ln('M70 196Q80 216 76 236M130 196Q120 216 124 236', '#d8d0bf', 3)
};
const ACC = {
  rosary: () => ln('M72 170Q98 214 124 170', '#6b4a2a', 3, ' stroke-dasharray="0.1 6"') + ln('M98 204V220M92 210H104', '#6b4a2a', 3),
  camera: () =>
    ln('M80 166Q98 186 118 194', '#5a3b28', 4) +
    rct(110, 188, 42, 28, '#2e2b30', 3) +
    `<circle cx="131" cy="202" r="9" fill="#5f7590" stroke="${INK}" stroke-width="2.5"/><circle cx="128" cy="199" r="2.5" fill="#dfe8f2"/>`,
  ribbons: () =>
    '<rect x="50" y="190" width="8" height="6" fill="#b8322f"/><rect x="58" y="190" width="8" height="6" fill="#2d4f9a"/><rect x="66" y="190" width="8" height="6" fill="#e8d36a"/>' +
    ln('M50 190H74V196H50Z', INK, 1.5),
  pencil: () =>
    `<g transform="rotate(-28 141 76)">${rct(138, 56, 6, 38, '#f2c64b', 2.5)}<path d="M138 94L141 101L144 94Z" fill="#f0d9b5" stroke="${INK}" stroke-width="2"/></g>`
};

// One character bust in a 200 x 236 box. mood: one of MOODS. look: pupil shift. u: the prefix of its ids (its clip
// paths and patterns), its own on the page: the casebook, the scene and the ending each draw the same people, and a
// picture that is drawn again with the same prefix comes out the same, so it need not be drawn again (ui/scene.js, draw).
function portrait(id, mood = 'neutral', look = 0, u = `p-${id}-`) {
  const L = LOOKS[id];
  if (!L) return '';
  const sk = L.skin,
    sh = L.shade,
    my = L.face === 'long' ? 5 : 0,
    face = FACE[L.face],
    ex = EARX[L.face],
    H = HEADS[L.head] || {};
  let defs = `<clipPath id="${u}f"><path d="${face}"/></clipPath><clipPath id="${u}t"><path d="${TORSO}"/></clipPath>`;
  if (L.head === 'keffiyeh')
    defs += `<pattern id="${u}k" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#f3eee4"/><path d="M0 4.5H9M4.5 0V9" stroke="#c0343c" stroke-width="2"/></pattern>`;
  let s = `<defs>${defs}</defs>` + (H.back ? H.back(L, u) : '');
  s += pth('M85 132L85 170L115 170L115 132Z', sh, 4);
  s +=
    `<path d="${TORSO}" fill="${L.bodyC}"/><ellipse cx="172" cy="212" rx="52" ry="74" fill="${L.bodyS}" clip-path="url(#${u}t)"/>` +
    ln(TORSO, INK, 4) +
    BODIES[L.body](L);
  s += ell(ex, 100, 8, 12, sk, 3.5) + ell(200 - ex, 100, 8, 12, sk, 3.5);
  s +=
    `<path d="${face}" fill="${sk}"/><ellipse cx="${210 - ex}" cy="104" rx="30" ry="66" fill="${sh}" clip-path="url(#${u}f)"/>` +
    ln(face, INK, 4);
  // cheeks: a blush when coy, a little warmth when warm or winking
  const bl = mood === 'coy' ? [8.5, 5, '.75'] : mood === 'warm' || mood === 'wink' ? [7.5, 4.5, '.5'] : [7, 4, '.35'];
  s +=
    ell(78, 116 + my, bl[0], bl[1], '#e98b7d', 0, ` opacity="${bl[2]}"`) +
    ell(122, 116 + my, bl[0], bl[1], '#e98b7d', 0, ` opacity="${bl[2]}"`);
  s += eyes(mood, look, sk, !!L.lips) + brows(mood, L) + NOSE[L.nose]();
  if (L.fh === 'full') s += beard(L);
  s += mouth(mood, L, my) + (L.fh ? FH[L.fh](L) : '') + (L.glasses ? GLASSES[L.glasses]() : '');
  s += (H.front ? H.front(L, u) : '') + (L.acc ? ACC[L.acc](L) : '');
  return s;
}
// You, seen from behind: neutral figure in a sun helmet, in the coat of your trade.
const COAT = { philologist: '#7b6a4f', soldier: '#9c8a58', occultist: '#3e3a48' };
const coatOf = bg => COAT[bg] || COAT.philologist;
function playerBack(bg) {
  const coat = coatOf(bg);
  return (
    pth('M10 262C14 202 52 174 100 172C148 174 186 202 190 262Z', coat, 4) +
    pth('M84 150L84 178L116 178L116 150Z', '#d9a988', 4) +
    pth('M64 118C60 84 78 64 100 64C122 64 140 84 136 118C130 134 116 146 100 146C84 146 70 134 64 118Z', '#5a4636', 4) +
    pth('M60 92C58 50 78 34 100 34C122 34 142 50 140 92Z', '#ece2c6', 4) +
    '<path d="M61 82H139V92H61Z" fill="#8c7a52"/>' +
    ell(100, 93, 62, 11, '#dccfae', 4)
  );
}

// ---------- scene pieces ----------
const TIMES = {
  morning: { s1: '#8fc9e6', s2: '#f6e2b2', g: '#e4c68c', gs: '#caa66b', sun: '#fff1b8', dark: 0 },
  afternoon: { s1: '#5fb0e0', s2: '#bfe3f2', g: '#ebcf92', gs: '#cfae70', sun: '#fffbe0', dark: 0 },
  evening: { s1: '#4d4687', s2: '#f0a25c', g: '#c99868', gs: '#a77a50', sun: '#ffd27a', dark: 0.12 },
  night: { s1: '#0f1838', s2: '#2a3a6e', g: '#56587a', gs: '#43456a', sun: '#f3efd8', dark: 0.38 },
  deep: { s1: '#1a1218', s2: '#3a2620', g: '#5a3e30', gs: '#432c22', sun: '#ffb45e', dark: 0.15 }
};
const ground = (tm, y = 222) => `<path d="M0 ${y}Q200 ${y - 8} 400 ${y}T800 ${y}V340H0Z" fill="${tm.g}" stroke="${INK}" stroke-width="3"/>`;
const palm = (x, y, k = 1) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${pth('M-4 0Q-10 -60 4 -120L12 -120Q2 -60 6 0Z', '#8a6a44', 3)}${pth('M8 -120Q-30 -150 -62 -126Q-30 -136 8 -118Z', '#4f8a4a', 3)}${pth('M8 -120Q44 -152 78 -128Q42 -136 8 -118Z', '#4f8a4a', 3)}${pth('M8 -122Q-8 -168 -36 -172Q-12 -150 6 -118Z', '#5f9c55', 3)}${pth('M8 -122Q30 -170 58 -170Q30 -150 10 -118Z', '#5f9c55', 3)}</g>`;
const tent = (x, y, k = 1) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${pth('M-80 0L0 -86L80 0Z', '#f2e8d2', 3.5)}<path d="M0 -86L80 0H20Z" fill="#d8c9a8"/>${ln('M-80 0L0 -86L80 0', INK, 3.5)}${pth('M-16 0L0 -40L16 0Z', '#5a4636', 3)}${ln('M0 -86V-100')}</g>`;
const zig = (x, y, k = 1) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${pth('M-170 60L-150 20H-110L-96 -14H-56L-44 -44H44L56 -14H96L110 20H150L170 60Z', '#c9975e', 3.5)}<path d="M0 -44H44L56 -14H96L110 20H150L170 60H0Z" fill="#b5844f"/>${ln('M-170 60L-150 20H-110L-96 -14H-56L-44 -44H44L56 -14H96L110 20H150L170 60', INK, 3.5)}${ln('M-140 40H140M-100 6H100M-50 -28H50', '#9a6c3e', 2)}</g>`;
const flame = (x, y) =>
  pth(
    `M${x - 14} ${y - 2}Q${x - 16} ${y - 26} ${x} ${y - 44}Q${x + 2} ${y - 26} ${x + 14} ${y - 30}Q${x + 18} ${y - 12} ${x + 12} ${y - 2}Z`,
    '#f29a38',
    3
  ) + `<path d="M${x - 6} ${y - 4}Q${x - 6} ${y - 20} ${x + 2} ${y - 28}Q${x + 8} ${y - 14} ${x + 6} ${y - 4}Z" fill="#ffd65c"/>`;
const fire = (x, y) => ln(`M${x - 24} ${y + 4}L${x + 24} ${y - 4}M${x - 24} ${y - 4}L${x + 24} ${y + 4}`, '#5a3b28', 7) + flame(x, y);
const glow = (u, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${u}g)"/>`;
const basket = (x, y) => ell(x, y, 26, 12, '#c9a35c', 3) + ln(`M${x - 20} ${y - 4}Q${x} ${y + 6} ${x + 20} ${y - 4}`, '#8a6a34', 2);
const reeds = (x, y) =>
  ln(`M${x} ${y}q-6 -40 -2 -70M${x + 8} ${y}q4 -44 10 -64M${x + 16} ${y}q-2 -36 -10 -56M${x - 8} ${y}q-10 -30 -18 -44`, '#5d7f3a', 3.5) +
  ell(x - 2, y - 72, 3.5, 9, '#7a5233', 2) +
  ell(x + 18, y - 66, 3.5, 9, '#7a5233', 2);
const coffin = (x, y) =>
  ell(x, y, 54, 16, '#4f9e8c', 3) +
  ell(x - 30, y - 2, 18, 12, '#6fbfaa', 2.5) +
  ln(`M${x - 37} ${y - 5}h5M${x - 28} ${y - 5}h5M${x - 34} ${y + 3}q4 2 8 0`, INK, 2);
const robed = (x, y, k = 1) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${pth('M-18 0L-10 -56Q0 -74 10 -56L18 0Z', '#1d1418', 3)}<ellipse cx="0" cy="-52" rx="5" ry="6" fill="#3a2a2a"/></g>`;
const torch = (x, y) => ln(`M${x} ${y}V${y + 34}`, '#3a2a22', 6) + flame(x, y + 2);
function stars() {
  let s = '';
  for (let i = 0; i < 42; i++)
    s += `<circle cx="${(i * 97 + 31) % 800}" cy="${(i * 53 + 11) % 150}" r="${i % 5 ? 1 : 1.8}" fill="#fff" opacity="${0.45 + (i % 3) * 0.2}"/>`;
  return s;
}
function sky(tm, time) {
  const night = time === 'night',
    sun = time === 'evening' ? [620, 190, 34] : time === 'afternoon' ? [640, 60, 30] : night ? [660, 64, 22] : [140, 80, 30];
  return (
    `<circle cx="${sun[0]}" cy="${sun[1]}" r="${sun[2]}" fill="${tm.sun}"/>` +
    (night ? `<circle cx="${sun[0] + 9}" cy="${sun[1] - 6}" r="${sun[2]}" fill="${tm.s1}"/>` : '') +
    `<path d="M0 214Q120 196 240 210T480 206T800 212V340H0Z" fill="${tm.gs}" opacity=".7"/>`
  );
}
const BG = {
  vista: {
    draw: tm =>
      ground(tm, 226) +
      pth('M90 228C190 150 560 138 720 228Z', '#d7b276', 3.5) +
      zig(400, 168, 0.9) +
      palm(90, 230, 0.8) +
      palm(150, 236, 0.6) +
      tent(640, 240, 0.45) +
      tent(700, 246, 0.4) +
      ln('M0 300Q200 286 400 300T800 296', '#9cc4d6', 6, ' opacity=".7"'),
    lights: u => glow(u, 670, 236, 40)
  },
  camp: {
    draw: tm =>
      ground(tm) +
      rct(470, 150, 190, 80, '#d2ab78', 3.5) +
      '<path d="M565 150H660V230H565Z" fill="#b98f5e"/>' +
      ln('M470 150H660V230H470Z', INK, 3.5) +
      rct(500, 180, 34, 50, '#5a3b28', 3) +
      rct(590, 172, 30, 24, '#3a2a22', 3) +
      ln('M464 150H666', INK, 5) +
      palm(720, 232, 1.05) +
      tent(170, 236, 1) +
      tent(330, 238, 0.8) +
      ln('M726 108Q600 60 520 150', '#5a4a3a', 1.5) +
      fire(410, 262),
    lights: u => glow(u, 410, 248, 80) + glow(u, 605, 184, 36) + flame(410, 262)
  },
  trench: {
    draw: tm =>
      ground(tm, 160) +
      pth('M60 178H740V304H60Z', '#b8875a', 3.5) +
      [
        ['#a87a50', 196],
        ['#8f8a86', 214],
        ['#c49566', 232],
        ['#7d5a3c', 250],
        ['#b99068', 272]
      ]
        .map(([c, y]) => `<path d="M62 ${y}Q400 ${y - 6} 738 ${y}V${y + 12}Q400 ${y + 6} 62 ${y + 12}Z" fill="${c}"/>`)
        .join('') +
      pth('M0 178H60V304L0 340Z', '#9c7048', 3.5) +
      pth('M800 178H740V304L800 340Z', '#9c7048', 3.5) +
      pth('M0 340L60 304H740L800 340Z', '#7d5a3c', 3.5) +
      ln('M600 304L640 150M622 304L662 150M606 280H628M612 254H634M618 228H640M624 202H646M630 176H652', INK, 3.5) +
      basket(200, 318) +
      basket(256, 324) +
      ln('M80 164H440M80 172H440', '#5a4a3a', 3) +
      pth('M190 140H250L242 162H198Z', '#6a7380', 3) +
      ell(206, 166, 6, 6, '#333', 3) +
      ell(234, 166, 6, 6, '#333', 3)
  },
  ziggurat: {
    draw: tm =>
      ground(tm, 252) +
      zig(400, 142, 1.9) +
      pth('M380 256V218Q400 204 420 218V256Z', '#3a2a22', 3) +
      ell(400, 292, 92, 16, '#5b4234', 0, ' opacity=".55"') +
      palm(60, 262, 0.8) +
      palm(748, 268, 0.7)
  },
  store: {
    indoor: true,
    draw: (tm, u) =>
      `<defs><pattern id="${u}b" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#c9a272"/><path d="M0 19.5H40M0 9.5H40M20 0V10M0 10V20M40 10V20" stroke="#a9825a" stroke-width="1.5"/></pattern></defs><rect width="800" height="340" fill="url(#${u}b)"/>` +
      [96, 170, 244].map(y => rct(70, y, 660, 10, '#7a5536', 3)).join('') +
      [96, 170, 244]
        .map((y, r) =>
          [0, 1, 2, 3, 4, 5, 6, 7]
            .map(i => {
              const x = 86 + i * 80 + (r % 2) * 20;
              return i % 3 === r % 3
                ? `<rect x="${x}" y="${y - 22}" width="46" height="22" rx="6" fill="#b5895a" stroke="${INK}" stroke-width="2.5"/>${ln(`M${x + 8} ${y - 14}h8M${x + 22} ${y - 10}h14`, '#7a5536', 2)}`
                : rct(x, y - 26, 54, 26, ['#a8463a', '#3f7a5e', '#d6a85c'][i % 3], 2.5) + rct(x + 14, y - 19, 26, 10, '#f3ead6', 0);
            })
            .join('')
        )
        .join('') +
      pth('M120 300H680L704 340H96Z', '#8a5f3c', 3.5) +
      rct(300, 280, 200, 22, '#9b6c44', 3) +
      rct(410, 270, 20, 10, '#6b5a3a', 2.5) +
      ell(420, 254, 12, 16, '#ffe9a8', 2.5) +
      rct(412, 234, 16, 6, '#6b5a3a', 2.5),
    lights: u => glow(u, 420, 250, 130)
  },
  village: {
    draw: tm =>
      ground(tm, 236) +
      pth('M130 240V200Q130 128 250 126Q370 128 370 200V240Z', '#d9c08a', 3.5) +
      ln('M170 240V176M210 240V146M290 240V146M330 240V176', '#b89a62', 3) +
      pth('M228 240V206Q250 182 272 206V240Z', '#5a4636', 3) +
      rct(470, 170, 130, 68, '#d6ae7c', 3.5) +
      rct(506, 196, 26, 42, '#5a3b28', 3) +
      rct(556, 186, 22, 18, '#3a2a22', 3) +
      rct(610, 190, 100, 48, '#cfa676', 3.5) +
      palm(90, 244, 1) +
      palm(752, 246, 0.8) +
      rct(480, 270, 120, 10, '#8a5f3c', 3) +
      ln('M490 280V298M590 280V298') +
      ell(530, 262, 10, 8, '#3f6f8f', 2.5) +
      ell(552, 264, 6, 6, '#f3ead6', 2)
  },
  canal: {
    draw: tm =>
      ground(tm, 200) +
      `<path d="M0 236Q200 222 400 236T800 232V300Q600 286 400 300T0 296Z" fill="#5d9fc0" stroke="${INK}" stroke-width="3"/>` +
      ln('M80 258q20 -6 40 0M300 270q20 -6 40 0M520 262q20 -6 40 0M680 276q20 -6 40 0', '#cfe6f0', 3) +
      ell(580, 252, 54, 22, '#4a4a52', 3) +
      ell(528, 242, 20, 16, '#4a4a52', 3) +
      ln('M514 230q-14 -14 -2 -20M540 228q12 -12 2 -20', '#e8e0cc', 4) +
      '<circle cx="522" cy="240" r="2.5" fill="#fff"/>' +
      '<path d="M500 258H640V280H500Z" fill="#5d9fc0"/>' +
      ln('M500 258q70 6 140 0', '#cfe6f0', 3) +
      pth('M150 256Q240 278 330 256Q240 266 150 256Z', '#6b4a2a', 3) +
      ln('M280 260L310 170', '#8a6a44', 3) +
      reeds(60, 236) +
      reeds(740, 234) +
      reeds(430, 302) +
      palm(170, 206, 0.7)
  },
  cemetery: {
    draw: tm =>
      ground(tm, 210) +
      pth('M420 212C500 150 700 140 800 180V212Z', '#d7b276', 3) +
      [
        [140, 250],
        [262, 256],
        [384, 250],
        [506, 258],
        [200, 302],
        [330, 308],
        [460, 302],
        [590, 308]
      ]
        .map(([x, y]) => coffin(x, y))
        .join('') +
      ell(690, 292, 30, 10, '#a98a5a', 3) +
      ln('M666 292h48M672 287h36', '#6b5a3a', 1.5)
  },
  gate: {
    indoor: true,
    draw: () =>
      '<rect width="800" height="340" fill="#5a3e30"/>' +
      [0, 1, 2, 3]
        .map(i => {
          const w = 300 - i * 64,
            h = 280 - i * 52,
            x = 400 - w / 2,
            y = 340 - h - i * 10;
          return pth(
            `M${x} 340V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V340Z`,
            ['#8a6244', '#6e4c36', '#53392a', '#2c1e18'][i],
            4
          );
        })
        .join('') +
      ln('M362 304H438M370 318H430M378 330H422', '#6e4c36', 3) +
      torch(150, 150) +
      torch(650, 150),
    lights: u => glow(u, 150, 140, 90) + glow(u, 650, 140, 90) + flame(150, 152) + flame(650, 152)
  },
  sanctum: {
    indoor: true,
    draw: (tm, u, a) => {
      const c = SANC[a.aspect] || SANC.dust;
      return (
        `<rect width="800" height="340" fill="${c[0]}"/>` +
        pth('M150 340V170A250 160 0 0 1 650 170V340Z', 'rgba(0,0,0,.25)', 4) +
        `<ellipse cx="400" cy="296" rx="230" ry="30" fill="none" stroke="${c[1]}" stroke-width="3" opacity=".8"/><ellipse cx="400" cy="296" rx="150" ry="18" fill="${c[1]}" opacity=".18"/>` +
        [250, 550]
          .map(
            x => pth(`M${x - 26} 262H${x + 26}L${x + 16} 282H${x - 16}Z`, '#6b5a3a', 3) + ln(`M${x} 282V312`, '#3a2a22', 5) + flame(x, 262)
          )
          .join('')
      );
    },
    lights: u => glow(u, 250, 240, 90) + glow(u, 550, 240, 90) + glow(u, 400, 280, 140)
  }
};

// Full scene: { bg, time, cast:[ids], moods:{id:mood}, talk:id, mood, you, god; for an ending: end, aspect }; u: the
// prefix of its ids, its own on the page (one scene is shown at a time)
function sceneSVG(a, u = 'scene-') {
  const tm = TIMES[a.time] || TIMES.morning,
    B = BG[a.bg] || BG.vista;
  let s = `<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tm.s1}"/><stop offset="1" stop-color="${tm.s2}"/></linearGradient><radialGradient id="${u}g"><stop offset="0" stop-color="#ffd27a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="800" height="340" fill="url(#${u}s)"/>` + (B.indoor ? '' : sky(tm, a.time)) + B.draw(tm, u, a);
  if (tm.dark) s += `<rect width="800" height="340" fill="#0b1233" opacity="${tm.dark}"/>`;
  if (a.time === 'night' && !B.indoor) s += stars();
  if (B.lights && (B.indoor || a.time === 'night' || a.time === 'evening')) s += B.lights(u, a);
  if (a.bg === 'sanctum' && a.cast)
    a.cast.forEach((id, i) => {
      s += robed(330 + i * 70, 288, 1.1);
    });
  const bg = S ? S.bg : null;
  if (a.talk)
    s += `<g transform="translate(-6 128) scale(1.08)">${playerBack(bg)}</g><g transform="translate(470 18) scale(1.42)"><g>${portrait(a.talk, a.mood || 'neutral', -3, `${u}${a.talk}-`)}</g></g>`;
  else {
    const cast = a.bg === 'sanctum' ? [] : a.cast || [];
    const n = Math.min(cast.length, a.you ? 6 : 7), // (room for your back at the left, when you are in the picture)
      k = n > 4 ? 0.62 : 0.72;
    cast.slice(0, n).forEach((id, i) => {
      s += `<g transform="translate(${Math.round(786 - (n - i) * 164 * k)} ${Math.round(346 - 232 * k)}) scale(${k})">${portrait(id, (a.moods && a.moods[id]) || 'neutral', 0, `${u}${id}-`)}</g>`;
    });
    if (a.you) s += `<g transform="translate(-14 200) scale(.72)">${playerBack(bg)}</g>`;
  }
  return `<svg viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${s}</svg>`;
}
