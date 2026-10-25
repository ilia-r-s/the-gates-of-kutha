// ===================== ART: a picture for every ending, drawn in the same hand as the scenes =====================
Object.assign(TIMES, {
  dawn: { s1: '#e6b39f', s2: '#f7e3bf', g: '#dcbc8c', gs: '#c49d6a', sun: '#fff0c8', dark: 0 },
  grey: { s1: '#8b909a', s2: '#cdc6ba', g: '#ab9f8b', gs: '#928674', sun: '#ebe7df', dark: 0.06 },
  blaze: { s1: '#230b09', s2: '#9a3317', g: '#5c2a1a', gs: '#45201a', sun: '#ffd08a', dark: 0.06 },
  ash: { s1: '#6f6b73', s2: '#aca79f', g: '#8e8882', gs: '#78726c', sun: '#dcd8d0', dark: 0.08 },
  brine: { s1: '#0c2830', s2: '#2c666b', g: '#3a5858', gs: '#2d4646', sun: '#d7efe6', dark: 0.12 },
  pall: { s1: '#2e2b18', s2: '#c2ae5a', g: '#958856', gs: '#7c7046', sun: '#efe2a8', dark: 0.12 },
  dream: { s1: '#160f2a', s2: '#563a6c', g: '#4a3e5e', gs: '#3b324e', sun: '#efe6cf', dark: 0.2 }
});
const G1 = (x, y, k, body, r = 0) => `<g transform="translate(${x} ${y})${r ? ` rotate(${r})` : ''} scale(${k})">${body}</g>`;
const brick = (x, y, w = 16, h = 9, c = '#b5844f') => rct(x, y, w, h, c, 2);
const rubble = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-60 0Q-30 -26 0 -30Q34 -26 60 0Z', '#a8774a', 3) + brick(-34, -14) + brick(-12, -22) + brick(10, -12) + brick(28, -7, 14, 8)
  );
const helmet = (x, y, k = 1, r = 0) =>
  G1(
    x,
    y,
    k,
    pth('M-24 0C-26 -26 -12 -36 0 -36C12 -36 26 -26 24 0Z', '#ece2c6', 3) +
      '<path d="M-23 -7H23V0H-23Z" fill="#8c7a52"/>' +
      ell(0, 1, 32, 7, '#dccfae', 3),
    r
  );
const lamp = (x, y, k = 1, lit = true, r = 0) =>
  G1(
    x,
    y,
    k,
    ln('M-14 -46Q0 -64 14 -46', INK, 3) +
      rct(-16, -8, 32, 10, '#6b5a3a', 3) +
      pth('M-12 -8C-18 -24 -12 -40 0 -40C12 -40 18 -24 12 -8Z', lit ? '#ffe9a8' : '#d8d2c0', 3) +
      rct(-10, -46, 20, 7, '#6b5a3a', 2.5) +
      (lit ? '<ellipse cx="0" cy="-22" rx="4" ry="8" fill="#f29a38"/>' : ''),
    r
  );
const wedgeMark = (x, y, r = 0, c = INK, k = 1) =>
  G1(x, y, k, `<path d="M0 -5L0 5L9 0Z" fill="${c}"/><path d="M8 0H19" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`, r);
const smoke = (x, y, k = 1, c = '#3a3036', o = 0.85) =>
  G1(
    x,
    y,
    k,
    `<g opacity="${o}">${ell(0, 0, 34, 24, c, 3)}${ell(-26, -30, 26, 20, c, 3)}${ell(18, -44, 30, 22, c, 3)}${ell(-8, -76, 24, 18, c, 3)}</g>`
  );
const wisp = (x, y, c = '#cfc8bf') => ln(`M${x} ${y}q-8 -12 0 -24q8 -12 0 -24`, c, 2.5, ' opacity=".7"');
const bird = (x, y, k = 1) => ln(`M${x - 9 * k} ${y}q${5 * k} ${-6 * k} ${9 * k} 0q${4 * k} ${-6 * k} ${9 * k} 0`, INK, 2.5);
const lorry = () =>
  pth('M-96 -44H8V0H-96Z', '#6b7a4a', 3) +
  ln('M-96 -44V-58M-56 -44V-58M-16 -44V-58M-96 -58H-16', INK, 3) +
  pth('M8 -60H48L64 -32V0H8Z', '#7d8c56', 3) +
  rct(18, -54, 26, 18, '#bfe0ea', 2.5) +
  rct(56, -14, 10, 8, '#e8d36a', 2) +
  ell(-66, 2, 14, 14, '#2b2b2b', 3) +
  ell(-66, 2, 5, 5, '#8a8a8a', 2) +
  ell(38, 2, 14, 14, '#2b2b2b', 3) +
  ell(38, 2, 5, 5, '#8a8a8a', 2);
const guardFig = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-12 0L-9 -30Q0 -36 9 -30L12 0Z', '#9c8a58', 3) +
      ell(0, -40, 8, 9, '#d9a988', 3) +
      pth('M-11 -44C-11 -56 11 -56 11 -44Z', '#ece2c6', 2.5) +
      ell(0, -44, 15, 3.5, '#dccfae', 2.5) +
      ln('M10 -28L22 -50', '#5a3b28', 3)
  );
const owl = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-14 0C-18 -22 -12 -36 0 -36C12 -36 18 -22 14 0Z', '#8c8478', 3) +
      ell(-6, -24, 5.5, 5.5, '#f2e6b0', 2) +
      ell(6, -24, 5.5, 5.5, '#f2e6b0', 2) +
      '<circle cx="-6" cy="-24" r="2" fill="#2b1b24"/><circle cx="6" cy="-24" r="2" fill="#2b1b24"/>' +
      pth('M-2 -18L0 -14L2 -18Z', '#d9a24a', 1.5) +
      ln('M-12 -34L-8 -40M12 -34L8 -40', INK, 2.5)
  );
const deadFig = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-14 0L-10 -48Q0 -58 10 -48L14 0Z', '#9a958f', 3) +
      ell(0, -60, 9, 10, '#b3aea8', 3) +
      '<circle cx="-3" cy="-61" r="1.6" fill="#2b1b24"/><circle cx="4" cy="-61" r="1.6" fill="#2b1b24"/>' +
      ln('M8 -40L18 -26', INK, 3)
  );
const coil = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-40 0Q-20 -42 0 0Z', '#1f4a48', 3) +
      pth('M10 0Q30 -34 50 0Z', '#1f4a48', 3) +
      pth('M60 0Q72 -26 86 -18Q94 -12 88 -2Z', '#1f4a48', 3) +
      ln('M80 -20L74 -36M86 -16L92 -32', '#cfd6c2', 3) +
      '<circle cx="84" cy="-12" r="2.2" fill="#d6f2e4"/>'
  );
const cradle = (x, y, k = 1, r = 0) =>
  G1(
    x,
    y,
    k,
    ln('M-38 6Q0 26 38 6', '#6b4a2a', 5) +
      pth('M-30 0V-26H30V0Q0 10 -30 0Z', '#b98f5e', 3) +
      ln('M-30 -26Q-22 -42 0 -40', '#6b4a2a', 4) +
      `<path d="M-24 -20H24V-6Q0 2 -24 -6Z" fill="#f3ead6"/>`,
    r
  );
const comb = (x, y, k = 1) => G1(x, y, k, rct(-14, -6, 28, 6, '#e8dcc0', 2) + ln('M-11 0V7M-6 0V7M-1 0V7M4 0V7M9 0V7', INK, 1.6));
const spindle = (x, y, k = 1, r = -12) =>
  G1(x, y, k, ln('M-22 0H22', '#8a6a44', 3) + ell(-6, 0, 7, 5, '#c9a35c', 2) + ln('M-2 -3Q8 -8 18 -3', '#e8e0cc', 2), r);
const lionShadow = (x, y, k = 1) => {
  let m = '';
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2,
      r = i % 2 ? 78 : 104;
    m += (i ? 'L' : 'M') + Math.round(Math.cos(a) * r) + ' ' + Math.round(Math.sin(a) * r * 0.9);
  }
  return G1(
    x,
    y,
    k,
    `<g opacity=".62" fill="#120a14">` +
      `<path d="${m}Z"/>` +
      '<path d="M-52 -18Q-56 40 -30 70Q0 92 30 70Q56 40 52 -18Q30 -46 0 -46Q-30 -46 -52 -18Z"/>' +
      '<path d="M-36 66L-26 96L-14 70L-4 100L6 72L16 100L26 70L36 96L44 62Z"/>' +
      '</g>' +
      '<ellipse cx="-20" cy="2" rx="6" ry="4" fill="#ffcf6a" opacity=".8"/><ellipse cx="20" cy="2" rx="6" ry="4" fill="#ffcf6a" opacity=".8"/>'
  );
};
const dog = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    ln('M-30 -8Q-48 -12 -50 -26', '#8a6a44', 4) +
      ell(0, -11, 32, 12, '#b48a5a', 3) +
      ln('M-18 -2H-6M8 -2H22', INK, 3) +
      ell(34, -24, 13, 11, '#b48a5a', 3) +
      pth('M42 -24Q56 -22 56 -16Q52 -12 42 -14Z', '#c99d6c', 2.5) +
      pth('M26 -32L22 -46L34 -34Z', '#8a6a44', 2.5) +
      '<circle cx="38" cy="-27" r="2" fill="#2b1b24"/><circle cx="56" cy="-18" r="2" fill="#2b1b24"/>'
  );
const pig = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    ln('M-32 -14q-8 -4 -6 -10q4 -4 4 2', '#4a3f45', 3) +
      ell(0, -12, 32, 14, '#3a3036', 3) +
      ln('M-18 -2H-6M8 -2H22', INK, 3) +
      ell(34, -18, 12, 11, '#3a3036', 3) +
      ell(46, -16, 6, 7, '#5a4c54', 2.5) +
      '<circle cx="44" cy="-17" r="1.4" fill="#e8b4a0"/><circle cx="48" cy="-15" r="1.4" fill="#e8b4a0"/>' +
      pth('M26 -26L24 -38L34 -28Z', '#4a3f45', 2.5) +
      '<circle cx="36" cy="-22" r="1.8" fill="#e8b4a0"/>'
  );
const cot = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    rct(-60, -14, 120, 10, '#7a6a4a', 3) +
      ln('M-56 -4L-62 14M56 -4L62 14M-30 -4L-36 14M30 -4L36 14', '#5a4a34', 3) +
      pth('M-58 -14Q-50 -22 -36 -18H54V-14Z', '#e8e0cc', 2.5)
  );
const revolverArt = (x, y, k = 1, r = -10) =>
  G1(
    x,
    y,
    k,
    pth('M-40 -10H30V4H-40Z', '#3a3a40', 3) +
      pth('M-8 -16H22V10H-8Z', '#2e2e34', 3) +
      pth('M18 4Q30 10 26 34H12Q10 18 6 10Z', '#6b4a2a', 3) +
      ln('M0 10Q2 22 10 22', INK, 2.5),
    r
  );
const robeHeap = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-46 0Q-40 -20 -10 -16Q12 -28 34 -12Q50 -6 46 0Z', ROBE, 3) +
      pth('M10 -20Q24 -40 38 -26Q40 -16 30 -12Z', ROBE, 2.5) +
      ln('M-30 -6Q-6 -14 18 -6M-8 -16Q4 -10 10 -2', ROBE_HI, 2)
  );
const ROBE = '#2a1c22',
  ROBE_HI = '#4a3640';
const fallenRobed = (x, y, k = 1, dir = 1) =>
  G1(
    x,
    y,
    k,
    `<g transform="scale(${dir} 1)">` +
      pth('M-40 0Q-44 -20 -22 -24L26 -20Q46 -18 50 0Z', ROBE, 3) +
      ln('M-20 -12Q4 -16 30 -10', ROBE_HI, 2) +
      pth('M-36 -4Q-62 -6 -64 -26Q-62 -44 -44 -40Q-30 -34 -28 -18Z', ROBE, 3) +
      '<ellipse cx="-52" cy="-24" rx="6" ry="7" fill="#120a0e"/>' +
      ell(58, -4, 7, 4.5, '#c79a78', 2.5) +
      '</g>'
  );
const kneelRobed = (x, y, k = 1, dir = 1) =>
  G1(
    x,
    y,
    k,
    `<g transform="scale(${dir} 1)">` +
      pth('M-30 0Q-36 -34 -4 -42Q22 -44 30 -20L34 0Z', ROBE, 3) +
      ln('M-16 -8Q-12 -28 6 -34', ROBE_HI, 2) +
      pth('M16 -34Q40 -40 48 -16Q44 -4 28 -6Z', ROBE, 3) +
      '<ellipse cx="38" cy="-16" rx="4.5" ry="6" fill="#120a0e"/>' +
      '</g>'
  );
const rays = (x, y, n, r1, r2, c, w = 4) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2,
      rr = i % 2 ? r2 * 0.7 : r2;
    s += `<path d="M${Math.round(x + Math.cos(a) * r1)} ${Math.round(y + Math.sin(a) * r1)}L${Math.round(x + Math.cos(a) * rr)} ${Math.round(y + Math.sin(a) * rr)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity=".75"/>`;
  }
  return s;
};
const tallies = (x, y, n, c = '#2b1b24') => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5),
      j = i % 5,
      gx = x + g * 34,
      row = Math.floor(g / 6);
    s +=
      j < 4
        ? ln(`M${gx - row * 204 + j * 6} ${y + row * 30}v18`, c, 2)
        : ln(`M${gx - row * 204 - 4} ${y + row * 30 + 14}L${gx - row * 204 + 24} ${y + row * 30 + 4}`, c, 2);
  }
  return s;
};
const wedgeRows = (x, y, cols, rowsN, c = '#5a3e2a', gap = 22) => {
  let s = '';
  for (let r = 0; r < rowsN; r++)
    for (let i = 0; i < cols; i++) s += wedgeMark(x + i * gap + (r % 2) * 9, y + r * 16, (i * 37 + r * 53) % 2 ? 0 : 90, c, 0.8);
  return s;
};
// flies, n of them, scattered over an ellipse about (x, y): the same flies every time the picture is drawn
const flies = (x, y, rx, ry, n, c = INK) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + (i % 7) * 0.5,
      d = Math.sqrt(((i * 53) % n) / n + 0.5 / n);
    s += `<circle cx="${Math.round(x + Math.cos(a) * d * rx)}" cy="${Math.round(y + Math.sin(a) * d * ry)}" r="${i % 4 ? 1.6 : 2.4}" fill="${c}"/>`;
  }
  return s;
};
// a great storage jar of the kind the sixty sicknesses are kept in below: sealed with clay, or open
const jar = (x, y, k = 1, open = false, c = '#a8774a') =>
  G1(
    x,
    y,
    k,
    pth('M-20 0Q-38 -8 -38 -38Q-36 -64 -16 -70V-78H16V-70Q36 -64 38 -38Q38 -8 20 0Z', c, 3) +
      ln('M-35 -48Q0 -40 35 -48M-37 -28Q0 -20 37 -28', '#6b4a2a', 2) +
      (open ? ell(0, -78, 15, 4.5, '#1a1410', 2.5) : pth('M-17 -78Q-14 -92 0 -92Q14 -92 17 -78Z', '#c9b48a', 2.5))
  );
// one of the dead, sewn into a sheet; and the cart that comes for them, its shafts on the ground and nothing to draw it
const shroud = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-36 -15C-44 -22 -57 -16 -55 -6C-53 2 -44 4 -36 1L40 1Q51 0 51 -6Q51 -12 40 -13Z', '#e6dfc8', 3) +
      ln('M-36 -15V1M-6 -14V1M24 -13V1', '#9a8f74', 2.5)
  );
const deadCart = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    ln('M46 -44L128 -2M46 -34L124 4', '#4a3424', 5) +
      pth('M-74 -64Q-62 -86 -34 -80Q-14 -94 10 -82Q38 -88 46 -64Z', '#e6dfc8', 3) +
      ln('M-46 -78Q-44 -70 -46 -64M-8 -86Q-6 -74 -8 -64M22 -82Q24 -72 22 -64', '#9a8f74', 2.5) +
      pth('M-82 -64H52V-34H-82Z', '#8a6440', 3) +
      ln('M-82 -49H52M-50 -64V-34M-16 -64V-34M18 -64V-34', '#6b4a2a', 2) +
      ell(-14, -27, 27, 27, '#6b4a2a', 3) +
      ln('M-14 -52V-2M-39 -27H11M-32 -45L4 -9M-32 -9L4 -45', '#3a2a1e', 2.5) +
      ell(-14, -27, 6, 6, '#3a2a1e', 2)
  );
const rat = (x, y, k = 1, dir = 1) =>
  G1(
    x,
    y,
    k,
    `<g transform="scale(${dir} 1)">` +
      ln('M-16 -5Q-34 -4 -44 -14', '#6a5a52', 2.5) +
      ell(0, -8, 18, 8.5, '#5a4c48', 2.5) +
      ell(17, -10, 9, 6.5, '#5a4c48', 2.5) +
      ell(12, -16, 4, 4, '#8a7a72', 2) +
      '<circle cx="20" cy="-11" r="1.5" fill="#e8d8c8"/>' +
      ln('M-8 0V1M8 0V1', INK, 2.5) +
      '</g>'
  );
// a sleepwalker in a nightshirt, barefoot, walking with the arms held out and the eyes wide open (to the left; dir −1: right)
const sleeper = (x, y, k = 1, dir = 1) =>
  G1(
    x,
    y,
    k,
    `<g transform="scale(${dir} 1)">` +
      ell(-9, 0, 6, 2.6, '#d9b89a', 2) +
      ell(8, 0, 6, 2.6, '#d9b89a', 2) +
      pth('M-12 -2L-8 -50Q2 -58 9 -50L13 -2Z', '#ece6f2', 3) +
      pth('M2 -49L-32 -47L-32 -40L2 -40Z', '#ece6f2', 2.5) +
      ell(-35, -43.5, 4.5, 3.5, '#d9b89a', 2) +
      ell(0, -62, 9, 10, '#d9b89a', 3) +
      pth('M-3 -72Q11 -74 10 -60Q9 -54 4 -55Q7 -66 -3 -72Z', '#3a2a2a', 2) +
      `<circle cx="-4.5" cy="-63" r="2.2" fill="#fff"/><circle cx="-5.3" cy="-63" r="1.1" fill="${INK}"/>` +
      ln('M-8.5 -61L-10.5 -57.5L-8 -57', INK, 1.6) +
      '</g>'
  );
// a clock face stopped at twenty past three
const stopClock = (x, y, r) => {
  const at = (deg, len) =>
    `${Math.round(x + Math.sin((deg * Math.PI) / 180) * len)} ${Math.round(y - Math.cos((deg * Math.PI) / 180) * len)}`;
  let s = ell(x, y, r, r, '#efe6cf', 3);
  for (let i = 0; i < 12; i++) s += ln(`M${at(i * 30, r * 0.74)}L${at(i * 30, r * 0.9)}`, INK, i % 3 ? 1.5 : 2.5);
  return (
    s +
    ln(`M${x} ${y}L${at(100, r * 0.5)}`, INK, 3.5) +
    ln(`M${x} ${y}L${at(120, r * 0.76)}`, INK, 2.5) +
    `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`
  );
};
// the mirrors of the sanctum: the tall one in the middle, which shows nothing, and the small ones in the walls, which show
// you, in the circle already (st: awake, sinking, gone)
const bronzeMirror = (x, y, k, st) =>
  G1(
    x,
    y,
    k,
    pth('M-28 0H28L18 -10H-18Z', '#8a6a3a', 3) +
      ln('M0 -10V-40', '#6b4a2a', 7) +
      ell(0, -96, 40, 58, '#b8873a', 3.5) +
      ell(0, -96, 31, 48, st === 'gone' ? '#4a3a32' : st === 'sinking' ? '#3a2850' : '#120a1a', 2.5) +
      (st === 'awake'
        ? ln('M-18 -122Q-4 -134 12 -128M-22 -100Q-6 -112 14 -104M-16 -76Q0 -86 18 -80', '#d07cf0', 2, ' opacity=".45"')
        : st === 'sinking'
          ? ln('M-6 -142L2 -112L-6 -96L6 -66', '#d07cf0', 2, ' opacity=".6"')
          : ln('M-2 -96L-24 -128M-2 -96L18 -136M-2 -96L28 -88M-2 -96L12 -56M-2 -96L-26 -70', INK, 2))
  );
const wallMirror = (x, y, st) =>
  ell(x, y, 17, 24, '#8a6a3a', 3) +
  ell(x, y, 12, 19, '#1c1226', 2) +
  (st === 'gone'
    ? ''
    : `<g opacity="${st === 'awake' ? 0.85 : 0.35}" fill="#e8d8f0">${ell(x, y - 8, 3.5, 4, '#e8d8f0', 0)}<path d="M${x - 5} ${y + 12}L${x - 3} ${y - 3}H${x + 3}L${x + 5} ${y + 12}Z"/></g>`);
const handMirror = (x, y, k = 1, r = 0) =>
  G1(
    x,
    y,
    k,
    ln('M0 6V26', '#6b4a2a', 5) + ell(0, -8, 13, 16, '#b8873a', 3) + ell(0, -8, 9, 12, '#cfc8e0', 2) + ln('M-4 -16L2 -6L-2 2', INK, 1.5),
    r
  );
// a line of handwriting too small and too wrong to read: tall loops, small loops, humps and joins
const SCRAWL = [
  ['c4 -2 5 -12 2 -12c-3 0 -2 10 2 12', 4],
  ['c3 -1 4 -5 1 -5c-3 0 -2 5 2 5', 3],
  ['c1 -5 4 -5 4 0', 4],
  ['q2 2 4 0', 4]
];
const scrawl = (x, y, w) => {
  let d = `M${x} ${y}`;
  for (let i = 0, at = 0; at < w; i++) {
    const [seg, dx] = SCRAWL[[0, 1, 2, 2, 1, 3, 1, 0, 2, 3][i % 10]];
    d += seg;
    at += dx;
  }
  return ln(d, INK, 1.5, ' opacity=".65"');
};
// the sanctum's colours by the power's nature: [the dark, the light] (ui/art.js too)
const SANC = {
  fire: ['#4a2418', '#ff8a3a'],
  dust: ['#33303f', '#cfc8e0'],
  sea: ['#143640', '#5fd0c8'],
  teeth: ['#45202a', '#ff9a8a'],
  plague: ['#2f3418', '#c6d45a'],
  madness: ['#2b1838', '#d07cf0']
};
const brazier = (x, lit) =>
  pth(`M${x - 26} 262H${x + 26}L${x + 16} 282H${x - 16}Z`, '#6b5a3a', 3) +
  ln(`M${x} 282V312`, '#3a2a22', 5) +
  (lit ? flame(x, 262) : wisp(x, 256));
// The power's own furniture, in three states: awake, sinking, gone.
function endMotif(asp, st) {
  if (asp === 'fire')
    return (
      `<ellipse cx="400" cy="300" rx="96" ry="16" fill="#1a0c08" stroke="${INK}" stroke-width="3"/>` +
      (st === 'awake'
        ? '<ellipse cx="400" cy="296" rx="80" ry="10" fill="#ff8a3a" opacity=".85"/>'
        : st === 'sinking'
          ? [340, 372, 410, 446].map((x, i) => `<circle cx="${x}" cy="${298 - (i % 2) * 3}" r="3" fill="#ff8a3a"/>`).join('')
          : '')
    );
  if (asp === 'dust')
    return (
      (st === 'gone' ? '' : pth('M352 296V220H448V296Z', '#6e6670', 3) + pth('M340 230H460V244H340Z', '#857d88', 3)) +
      (st === 'awake'
        ? '<ellipse cx="400" cy="250" rx="34" ry="44" fill="#16121c"/><ellipse cx="400" cy="238" rx="9" ry="5" fill="#cfc8e0"/>'
        : st === 'sinking'
          ? [384, 396, 410, 404, 390]
              .map((x, i) => `<circle cx="${x}" cy="${262 - i * 8}" r="${3 - i * 0.4}" fill="#16121c" opacity=".7"/>`)
              .join('')
          : pth('M318 300Q352 262 400 258Q448 262 482 300Z', '#9a93a0', 3) +
            rct(362, 266, 22, 12, '#857d88', 2.5) +
            rct(414, 272, 26, 10, '#857d88', 2.5))
    );
  if (asp === 'sea') {
    const top = st === 'awake' ? 262 : st === 'sinking' ? 300 : 326;
    return (
      `<path d="M150 ${top}Q275 ${top - 8} 400 ${top}T650 ${top}V340H150Z" fill="#0a1c22" stroke="${INK}" stroke-width="3"/>` +
      ln(`M200 ${top + 12}q20 -6 40 0M380 ${top + 16}q20 -6 40 0M540 ${top + 10}q20 -6 40 0`, '#5fd0c8', 2.5, ' opacity=".6"')
    );
  }
  // the sixty jars: the one in the middle open, and its flies going up like smoke; sinking, they settle; gone, it is sealed
  if (asp === 'plague')
    return (
      [300, 342, 458, 500].map((x, i) => jar(x, 266 - (i % 2) * 6, 0.42, false, '#8a6440')).join('') +
      jar(400, 302, 1, st !== 'gone') +
      (st === 'awake'
        ? `<g opacity=".22">${ell(402, 196, 30, 22, '#14140a', 0)}${ell(390, 150, 40, 26, '#14140a', 0)}${ell(410, 100, 50, 28, '#14140a', 0)}</g>` +
          flies(400, 150, 64, 84, 70)
        : st === 'sinking'
          ? '<path d="M390 226Q384 200 392 170H408Q416 200 410 226Z" fill="#14140a" opacity=".3"/>' + flies(400, 196, 16, 26, 26)
          : flies(400, 316, 90, 9, 12, '#14140a'))
    );
  // the tall mirror that shows nothing, and the small ones in the walls, where you stand in the circle already
  if (asp === 'madness')
    return (
      [
        [205, 178],
        [285, 128],
        [515, 128],
        [595, 178]
      ]
        .map(([x, y]) => wallMirror(x, y, st))
        .join('') + bronzeMirror(400, 302, 1, st)
    );
  return (
    cradle(400, 300, 1.1, st === 'awake' ? -12 : 0) +
    (st === 'awake' ? ln('M352 270q-10 -10 -4 -22M448 270q10 -10 4 -22', '#ff9a8a', 2.5, ' opacity=".7"') : '')
  );
}
function sancBase(a, o = {}) {
  const c = SANC[a.aspect] || SANC.dust;
  return (
    `<rect width="800" height="340" fill="${c[0]}"/>` +
    pth('M150 340V170A250 160 0 0 1 650 170V340Z', 'rgba(0,0,0,.25)', 4) +
    `<ellipse cx="400" cy="296" rx="230" ry="30" fill="none" stroke="${c[1]}" stroke-width="3" opacity="${o.ring == null ? 0.8 : o.ring}"${o.broken ? ' stroke-dasharray="70 30"' : ''}/><ellipse cx="400" cy="296" rx="150" ry="18" fill="${c[1]}" opacity="${o.pool == null ? 0.18 : o.pool}"/>` +
    endMotif(a.aspect, o.motif || 'awake') +
    [250, 550]
      .filter(x => x !== o.tipped)
      .map(x => brazier(x, o.lit))
      .join('')
  );
}
const youBg = () => (S ? S.bg : null);
const youBack = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">${playerBack(youBg())}</g>`;
// the arm raised from the right shoulder; the charm sits at (163, 8) in the figure's own units
const youRaise = (x, y, k) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${playerBack(youBg())}${pth('M134 200Q158 124 166 50L200 56Q192 134 180 216Z', coatOf(youBg()), 4)}${ln('M167 66L198 71', INK, 3)}${ell(184, 38, 14, 15, '#d9a988', 3.5)}<circle cx="184" cy="10" r="12" fill="#fff6d6" stroke="${INK}" stroke-width="3"/></g>`;
const zigGrey = (x, y, k) => zig(x, y, k).replace('#c9975e', '#a6a09a').replace('#b5844f', '#8f8a85').replace('#9a6c3e', '#77726d');
const serpent = (x, y, k = 1) =>
  G1(
    x,
    y,
    k,
    pth('M-160 0Q-140 -36 -120 0Z', '#1f4a48', 3) +
      pth('M-100 0Q-70 -66 -40 0Z', '#1f4a48', 3) +
      pth('M-18 0Q-6 -60 2 -96Q10 -128 44 -132Q72 -132 80 -110Q82 -96 66 -92L40 -88Q28 -80 26 -50Q24 -20 30 0Z', '#1f4a48', 3) +
      ln('M-84 -44l-6 -12M-70 -50l0 -13M-56 -44l6 -12M6 -100l-12 -6M12 -74l-12 -4', '#2e6a66', 3) +
      ln('M48 -128L36 -158M64 -126L70 -156', '#d8dccb', 4) +
      '<circle cx="58" cy="-114" r="3.4" fill="#d6f2e4"/>' +
      ln('M72 -96Q60 -98 52 -94', INK, 2.5)
  );
// Each picture: draw(tm, u, a) paints over the sky gradient; lights(u, a) adds glows above the darkening veil.
// you, small, sitting up in the back of a lorry: your coat, your face, your helmet
const youSmall = (x, y, k = 1) =>
  G1(x, y, k, pth('M-12 0L-10 -28Q0 -34 10 -28L12 0Z', coatOf(youBg()), 3) + ell(0, -38, 8, 9, '#d9a988', 3) + helmet(0, -44, 0.42));
// someone of the camp, far off, standing to watch
const watcherFar = (x, y, k = 1) => G1(x, y, k, pth('M-6 0L-4 -18Q0 -22 4 -18L6 0Z', '#e8dcc0', 2) + ell(0, -24, 3.5, 4, '#c9946f', 2));
const END_ART = {
  // the camp puts you on the truck to Hillah: the tell behind, the camp watching, a guard beside you in the back
  truck: {
    draw: (tm, u) =>
      sky(tm, 'morning') +
      ground(tm, 232) +
      pth('M30 236C110 196 290 188 380 236Z', '#d7b276', 3.5) +
      zig(206, 194, 0.56) +
      tent(420, 246, 0.44) +
      tent(470, 250, 0.38) +
      watcherFar(444, 252, 1) +
      watcherFar(458, 254, 0.94) +
      watcherFar(500, 256, 0.9) +
      palm(764, 242, 0.8) +
      `<path d="M0 304Q400 272 800 262V278Q400 288 0 322Z" fill="#ecd9a9" stroke="${INK}" stroke-width="2.5"/>` +
      [0, 1, 2, 3].map(i => ell(470 - i * 38, 286 + i * 4, 30 - i * 4, 14 - i * 2, '#e8d4a8', 0, ` opacity="${0.8 - i * 0.17}"`)).join('') +
      `<g transform="translate(590 292) scale(0.95)">${lorry()}${youSmall(-70, -44, 0.62)}${guardFig(-36, -44, 0.7)}</g>` +
      bird(300, 70) +
      bird(330, 84, 0.8)
  },
  unopened: {
    draw: (tm, u) =>
      sky(tm, 'morning') +
      ground(tm, 230) +
      `<path d="M0 322Q190 284 400 272T800 258V268Q600 274 400 286T0 340Z" fill="#ecd9a9" stroke="${INK}" stroke-width="2.5"/>` +
      pth('M330 232C400 176 640 168 720 232Z', '#d7b276', 3.5) +
      zig(530, 176, 0.72) +
      rubble(530, 230, 0.8) +
      palm(80, 238, 0.72) +
      palm(130, 244, 0.5) +
      tent(690, 250, 0.42) +
      tent(746, 256, 0.36) +
      [0, 1, 2, 3]
        .map(i => ell(330 + i * 34, 282 - i * 6, 26 - i * 3, 13 - i * 2, '#e8d4a8', 0, ` opacity="${0.75 - i * 0.15}"`))
        .join('') +
      // in the lorry, as many robed figures as there were of the cult unmasked (one may have killed the other)
      `<g transform="translate(236 300) scale(-0.95 0.95)">${lorry()}${robed(-74, -44, 0.62)}${S && S.order.filter(id => C(id).role === 'cult' && C(id).status === 'exposed').length > 1 ? robed(-46, -44, 0.62) : ''}${guardFig(-20, -44, 0.7)}</g>` +
      bird(250, 70) +
      bird(282, 84, 0.8)
  },
  sealed: {
    draw: (tm, u, a) =>
      sancBase(a, { lit: false, motif: 'gone', ring: 0.5, pool: 0.08 }) +
      fallenRobed(196, 318, 1, 1) +
      fallenRobed(626, 314, 1, -1) +
      fallenRobed(520, 334, 0.9, 1),
    lights: (u, a) => glow(u, 411, 126, 200) + rays(411, 126, 22, 30, 150, '#fff3c4') + youRaise(260, 118, 0.82)
  },
  banished: {
    draw: (tm, u, a) =>
      sancBase(a, { lit: false, motif: 'sinking', ring: 0.6 }) +
      kneelRobed(300, 314, 1, 1) +
      kneelRobed(520, 312, 1, -1) +
      kneelRobed(430, 334, 0.9, -1),
    lights: (u, a) => {
      let w = '';
      for (let i = 0; i < 13; i++) {
        const t = Math.PI * (1.08 + i * 0.068);
        w += wedgeMark(Math.round(400 + Math.cos(t) * 230), Math.round(214 + Math.sin(t) * 150), Math.round(t * 57) + 90, '#ffd27a', 1.5);
      }
      return glow(u, 400, 120, 160) + w + youBack(-6, 156, 0.96);
    }
  },
  emptied: {
    draw: (tm, u, a) =>
      sancBase(a, { lit: false, motif: 'gone', pool: 0.1 }) + robeHeap(300, 310, 1) + robeHeap(470, 316, 0.9) + robeHeap(560, 300, 0.8),
    lights: u => glow(u, 150, 292, 110) + lamp(150, 318, 1.1, true)
  },
  shot: {
    draw: (tm, u, a) =>
      sancBase(a, { lit: true, motif: 'sinking', broken: true, tipped: 550 }) +
      G1(560, 300, 1, pth('M-26 0H26L16 20H-16Z', '#6b5a3a', 3), 64) +
      [586, 604, 620, 596].map((x, i) => `<circle cx="${x}" cy="${318 + (i % 2) * 6}" r="${3 + (i % 2)}" fill="#ff8a3a"/>`).join('') +
      fallenRobed(470, 322, 1.15, -1) +
      `<rect width="800" height="340" fill="#5a0a0a" opacity=".14"/>`,
    lights: () => revolverArt(110, 286, 1.6) + wisp(176, 262, '#e8e0d8') + wisp(188, 250, '#e8e0d8')
  },
  burned: {
    draw: (tm, u) =>
      sky(tm, 'night') +
      ground(tm, 236) +
      stars() +
      pth('M150 238C250 170 560 160 660 238Z', '#3a2a24', 3.5) +
      zig(400, 176, 1.05) +
      `<rect x="0" y="0" width="800" height="340" fill="#1a0806" opacity=".35"/>` +
      smoke(420, 92, 1.3) +
      smoke(470, 40, 1.1, '#2a2226', 0.75) +
      smoke(380, 20, 0.9, '#2a2226', 0.6) +
      tent(690, 262, 0.5) +
      tent(750, 268, 0.42) +
      palm(70, 262, 0.8),
    lights: u =>
      glow(u, 400, 170, 220) +
      glow(u, 400, 210, 130) +
      [
        [300, 214],
        [360, 184],
        [440, 182],
        [500, 214],
        [400, 146],
        [330, 236],
        [470, 236]
      ]
        .map(([x, y]) => G1(x, y, 1.5, flame(0, 0)))
        .join('') +
      [
        [350, 120],
        [460, 104],
        [512, 150],
        [292, 160],
        [420, 70]
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#ffd65c"/>`)
        .join('')
  },
  scarred: {
    draw: (tm, u) =>
      sky(tm, 'morning') +
      ground(tm, 238) +
      pth('M300 240C380 186 640 176 730 240Z', '#b9a487', 3.5) +
      zig(520, 192, 0.8) +
      pth('M492 156L520 172L506 196L532 222L512 240H478L496 214L480 190Z', '#3a2a22', 3) +
      rubble(470, 244, 0.9) +
      rubble(600, 246, 0.7) +
      rct(70, 262, 120, 40, '#a8946f', 3) +
      lamp(214, 300, 0.9, false) +
      youBack(30, 130, 0.62) +
      bird(300, 80) +
      bird(330, 96, 0.8) +
      bird(620, 70, 0.7)
  },
  'fallen-night': {
    // a.inBed: you died in your own cot, of a bad wound, a blade, or spite (data/endings.js, nightDeath), and nothing came
    // through the canvas: the tent whole, a sheet drawn up over the cot, the lamp still burning at first light, and none
    // of the power's marks
    draw: (tm, u, a) =>
      a.inBed
        ? sky(tm, 'morning') +
          ground(tm, 232) +
          tent(150, 248, 0.6) +
          palm(730, 240, 0.9) +
          tent(380, 270, 1.35) +
          cot(560, 300, 0.9) +
          shroud(562, 284, 0.92) +
          lamp(470, 316, 0.8, true) +
          helmet(660, 318, 0.7, -10)
        : sky(tm, 'night') +
      ground(tm, 232) +
      stars() +
      tent(150, 248, 0.6) +
      palm(730, 240, 0.9) +
      G1(
        380,
        270,
        1.35,
        pth('M-80 0L0 -86L80 0Z', '#f2e8d2', 3.5) +
          '<path d="M0 -86L80 0H20Z" fill="#d8c9a8"/>' +
          pth('M-10 -60L8 -40L-4 -22L14 -6L2 0H-40L-22 -24L-36 -40Z', '#1c1420', 3) +
          ln('M0 -86V-104')
      ) +
      cot(560, 300, 0.9) +
      lamp(250, 312, 0.9, false, -78) +
      helmet(480, 318, 0.8, 18) +
      ({
        fire: [
          [330, 218],
          [356, 196],
          [392, 206],
          [420, 236],
          [350, 250],
          [404, 176],
          [430, 214]
        ]
          .map(([x, y]) => ell(x, y, 7, 5, '#3a1a10', 2) + `<circle cx="${x}" cy="${y}" r="2" fill="#ff8a3a"/>`)
          .join(''),
        dust: ell(380, 300, 110, 12, '#b8b2aa', 0, ' opacity=".8"') + owl(380, 132, 0.9),
        sea: ell(450, 318, 90, 12, '#9cc8cf', 3) + ln('M520 318q40 -2 70 6t70 4', '#9cc8cf', 5, ' opacity=".7"'),
        teeth:
          [
            [300, 318],
            [330, 326],
            [600, 322],
            [630, 330]
          ]
            .map(
              ([x, y]) =>
                `<g fill="${INK}" opacity=".7"><ellipse cx="${x}" cy="${y}" rx="5" ry="4"/><circle cx="${x - 5}" cy="${y - 6}" r="2"/><circle cx="${x}" cy="${y - 8}" r="2"/><circle cx="${x + 5}" cy="${y - 6}" r="2"/></g>`
            )
            .join('') + ln('M380 116l-6 6m6 -6l6 6', INK, 3),
        plague: flies(386, 226, 60, 44, 44) + flies(522, 283, 24, 6, 12),
        madness: handMirror(300, 320, 0.9, -70) + scrawl(404, 226, 36) + scrawl(406, 240, 48) + scrawl(408, 254, 60)
      }[a.aspect] || ''),
    lights: (u, a) => (a.inBed ? glow(u, 470, 298, 46) : glow(u, 250, 300, 40))
  },
  'fallen-below': {
    draw: () =>
      '<rect width="800" height="340" fill="#2e2018"/>' +
      [0, 1, 2, 3]
        .map(i => {
          const w = 300 - i * 64,
            h = 280 - i * 52,
            x = 400 - w / 2,
            y = 340 - h - i * 10;
          return pth(
            `M${x} 340V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V340Z`,
            ['#5a4030', '#45301f', '#33241a', '#1a120e'][i],
            4
          );
        })
        .join('') +
      ln('M330 300H470M342 314H458M354 328H446', '#5a4030', 3) +
      ln('M150 150V184M650 150V184', '#3a2a22', 6) +
      ell(150, 148, 7, 6, '#24160f', 2.5) +
      wisp(150, 138, '#8a7a6a') +
      helmet(410, 312, 0.9, -8) +
      G1(300, 324, 1, rct(-22, -8, 44, 16, '#3a3a40', 3) + ell(24, 0, 6, 9, '#e8e4c8', 2.5), -6),
    lights: u =>
      `<path d="M330 320L130 250L150 340Z" fill="#fff5c8" opacity=".14"/>` + glow(u, 650, 150, 30) + G1(650, 152, 0.5, flame(0, 0))
  },
  bethlem: {
    draw: (tm, u) =>
      `<defs><pattern id="${u}w" width="44" height="30" patternUnits="userSpaceOnUse"><rect width="44" height="30" fill="#b8c2a6"/>${wedgeMark(6, 9, 0, '#7d846f', 0.7)}${wedgeMark(26, 22, 90, '#7d846f', 0.7)}${wedgeMark(30, 6, 0, '#7d846f', 0.6)}</pattern></defs><rect width="800" height="340" fill="url(#${u}w)"/>` +
      pth('M0 260H800V340H0Z', '#8b8170', 3) +
      rct(470, 50, 150, 120, '#9aa3ad', 4) +
      ln('M500 50V170M530 50V170M560 50V170M590 50V170', '#4a4a52', 4) +
      ln('M470 110H620', '#4a4a52', 4) +
      rct(80, 230, 230, 22, '#e8e4dc', 3) +
      ln('M86 252V300M304 252V300M80 230V196', '#4a4a52', 5) +
      pth('M86 230Q90 212 120 214H170V230Z', '#f4f1ea', 2.5) +
      rct(560, 236, 130, 14, '#7a5536', 3) +
      ln('M572 250V300M678 250V300', '#5a3e2a', 5) +
      lamp(650, 236, 0.8, true) +
      [0, 1, 2, 3, 4]
        .map(i => rct(574 + (i % 2) * 6, 226 - i * 9, 52, 9, ['#3f5f7a', '#7a3f3f', '#5a6a3a', '#3f5f7a', '#6a5a7a'][i], 2))
        .join('') +
      [
        [360, 300],
        [410, 312],
        [452, 296]
      ]
        .map(
          ([x, y]) =>
            rct(x, y, 40, 26, '#f3efe4', 2.5) + wedgeMark(x + 8, y + 9, 0, '#5a4a3a', 0.6) + wedgeMark(x + 20, y + 17, 90, '#5a4a3a', 0.6)
        )
        .join(''),
    lights: u => glow(u, 650, 216, 70)
  },
  canal: {
    draw: (tm, u) =>
      sky(tm, 'morning') +
      ground(tm, 196) +
      `<path d="M0 226Q200 214 400 226T800 222V262Q600 250 400 262T0 258Z" fill="#7ab3cc" stroke="${INK}" stroke-width="3"/>` +
      ln('M90 242q20 -6 40 0M330 248q20 -6 40 0M600 240q20 -6 40 0', '#e2f0f4', 3) +
      `<g transform="translate(545 265.3) scale(.15 -.15)" opacity=".55">${playerBack(null)
        .replace(/fill="#[0-9a-f]{6}"/g, 'fill="#2f5470"')
        .replace(/stroke="#2b1b24"/g, 'stroke="none"')}</g>` +
      reeds(40, 228) +
      reeds(760, 226) +
      palm(700, 200, 0.6) +
      `<path d="M0 262Q200 252 400 262T800 260V340H0Z" fill="#8a6a4c" stroke="${INK}" stroke-width="3"/>` +
      wedgeRows(70, 284, 30, 3, '#4a3424', 22) +
      ln('M420 330L520 300', '#a8864a', 5) +
      helmet(640, 318, 0.75, -14)
  },
  counting: {
    draw: () =>
      '<rect width="800" height="340" fill="#1e1612"/>' +
      [0, 1, 2, 3, 4, 5, 6]
        .map(i => {
          const w = 520 - i * 70,
            h = 320 - i * 40,
            x = 400 - w / 2,
            y = 340 - h;
          return pth(
            `M${x} 340V${y + Math.min(w / 2, h - 10)}A${w / 2} ${Math.min(w / 2, h - 10)} 0 0 1 ${x + w} ${y + Math.min(w / 2, h - 10)}V340Z`,
            ['#5a3e30', '#4e3529', '#432d23', '#38261e', '#2e1f18', '#241812', '#1a110c'][i],
            3.5
          );
        })
        .join('') +
      [0, 1, 2, 3, 4, 5, 6, 7].map(i => ln(`M${400 - 120 + i * 13} ${330 - i * 8}H${400 + 120 - i * 13}`, '#6e4c36', 2.5)).join('') +
      tallies(40, 70, 38, '#c9a272') +
      tallies(640, 90, 23, '#c9a272'),
    lights: u => glow(u, 400, 250, 40) + `<circle cx="400" cy="252" r="4" fill="#ffe9a8"/>`
  },
  'doom-fire': {
    draw: (tm, u) =>
      ground(tm, 210) +
      [
        [150, 74, 9],
        [176, 62, 7],
        [196, 84, 8],
        [172, 96, 6],
        [214, 66, 6],
        [226, 92, 7],
        [204, 108, 5]
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9c0"/>`)
        .join('') +
      zig(620, 172, 0.6) +
      ln('M600 140L612 160L596 176M650 150L640 170', '#ff8a3a', 3) +
      `<ellipse cx="380" cy="282" rx="210" ry="44" fill="#2a1410" stroke="#cfe8f0" stroke-width="5"/><ellipse cx="380" cy="282" rx="190" ry="36" fill="#140806"/>` +
      ln('M330 262H430M340 274H420M350 286H410M360 298H400', '#5c2a1a', 3) +
      ln('M60 236L150 250L190 240M560 250L640 236L720 246M90 300L170 312', '#ff8a3a', 3.5),
    lights: u => glow(u, 180, 84, 70) + glow(u, 380, 270, 120) + ln('M60 236L150 250L190 240M560 250L640 236L720 246', '#ffd65c', 1.5)
  },
  'doom-dust': {
    draw: (tm, u) =>
      ground(tm, 222) +
      pth('M380 226C450 170 640 160 740 226Z', '#9a948d', 3.5) +
      zigGrey(570, 180, 0.62) +
      rct(70, 160, 130, 66, '#a9a39b', 3.5) +
      rct(118, 186, 30, 40, '#16121c', 3) +
      rct(210, 182, 70, 44, '#a39d95', 3.5) +
      G1(300, 230, 0.7, pth('M-80 0L0 -86L80 0Z', '#c8c2b8', 3.5) + pth('M-20 0L0 -40L20 0Z', '#16121c', 3)) +
      ln('M250 230V170M610 230V180', '#6b6560', 4) +
      owl(250, 170, 0.8) +
      owl(610, 180, 0.7) +
      [
        [350, 290],
        [420, 300],
        [500, 286],
        [560, 302],
        [640, 292]
      ]
        .map(([x, y], i) => deadFig(x, y, 0.9 - (i % 2) * 0.1))
        .join('') +
      Array.from(
        { length: 60 },
        (v, i) => `<circle cx="${(i * 131 + 17) % 800}" cy="${(i * 71 + 23) % 330}" r="${i % 3 ? 1.4 : 2.2}" fill="#e8e4dc" opacity=".55"/>`
      ).join('')
  },
  'doom-sea': {
    draw: (tm, u) =>
      sky(tm, 'night') +
      stars() +
      zig(400, 200, 1.05) +
      `<path d="M0 196Q200 186 400 196T800 192V340H0Z" fill="#103a40" stroke="${INK}" stroke-width="3"/>` +
      ln(
        'M40 222q24 -6 48 0M180 250q24 -6 48 0M520 236q24 -6 48 0M640 270q24 -6 48 0M90 300q24 -6 48 0M420 296q24 -6 48 0',
        '#5fb8b0',
        3,
        ' opacity=".7"'
      ) +
      serpent(600, 262, 1.0) +
      coil(110, 296, 0.7) +
      ln('M669 210v8M664 226v8M672 242v6M666 256v5', '#d7efe6', 3, ' opacity=".6"'),
    lights: u => `<circle cx="660" cy="64" r="22" fill="#d7efe6" opacity=".25"/>`
  },
  'doom-teeth': {
    draw: (tm, u) =>
      sky(tm, 'night') +
      stars() +
      ground(tm, 240) +
      pth('M80 244V190Q80 120 230 118Q380 120 380 190V244Z', '#8a7a62', 3.5) +
      pth('M200 244V208Q230 182 260 208V244Z', '#120c10', 3) +
      rct(450, 160, 160, 84, '#857456', 3.5) +
      rct(496, 196, 30, 48, '#120c10', 3) +
      palm(720, 248, 0.8) +
      lionShadow(300, 140, 0.95) +
      cradle(230, 266, 0.8, -10) +
      comb(510, 252, 0.9) +
      spindle(548, 254, 0.9) +
      dog(380, 316, 0.9) +
      pig(470, 322, 0.9),
    lights: u => glow(u, 230, 250, 40)
  },
  // the flies going up from the mound like smoke, the dead laid out before the doors, and the cart with nothing to draw it
  'doom-plague': {
    draw: tm =>
      sky(tm, 'pall') +
      ground(tm, 238) +
      pth('M400 242C470 190 660 180 770 242Z', '#8c8150', 3.5) +
      zig(600, 196, 0.6) +
      '<path d="M588 172Q566 130 582 98Q560 70 574 40Q560 14 600 4Q644 14 630 40Q646 70 622 98Q638 132 614 172Z" fill="#1a1a0e" opacity=".26"/>' +
      flies(600, 152, 14, 12, 14) +
      flies(600, 112, 24, 18, 22) +
      flies(602, 72, 34, 24, 32) +
      flies(600, 30, 44, 22, 30) +
      pth('M30 250V200Q30 140 150 138Q270 140 270 200V250Z', '#a89868', 3.5) +
      pth('M126 250V214Q150 192 174 214V250Z', '#16120c', 3) +
      rct(290, 184, 110, 66, '#a08f62', 3.5) +
      rct(322, 210, 26, 40, '#16120c', 3) +
      rct(364, 196, 20, 16, '#2a2216', 2.5) +
      shroud(122, 274, 0.95) +
      shroud(134, 294, 1) +
      shroud(148, 316, 1.05) +
      flies(156, 252, 64, 12, 18) +
      deadCart(520, 318, 0.95) +
      flies(500, 214, 44, 14, 12) +
      rat(700, 326, 0.8, -1) +
      palm(742, 252, 0.62),
    lights: u => glow(u, 374, 204, 26) + rct(364, 196, 20, 16, '#f2d48a', 2.5)
  },
  // the tell hanging upside down in the sky, a moon that is a clock stopped at twenty past three, and the sleepers
  'doom-madness': {
    draw: tm =>
      sky(tm, 'dream') +
      stars() +
      stopClock(140, 80, 30) +
      `<g opacity=".38" transform="translate(0 266) scale(1 -1)">${zig(400, 200, 0.95).replace('#c9975e', '#a48cc4').replace('#b5844f', '#8c74ae').replace('#9a6c3e', '#6e5a90')}</g>` +
      ground(tm, 244) +
      pth('M220 248C300 196 500 190 580 248Z', '#6a5a78', 3.5) +
      zig(400, 200, 0.95) +
      tent(90, 262, 0.5) +
      tent(150, 268, 0.42) +
      tent(712, 262, 0.5) +
      [
        [190, 302, 0.9],
        [262, 318, 1],
        [336, 300, 0.88],
        [412, 320, 1.04],
        [488, 304, 0.92],
        [566, 322, 1.02],
        [640, 306, 0.9]
      ]
        .map(([x, y, k]) => sleeper(x, y, k))
        .join(''),
    lights: u => glow(u, 140, 80, 64)
  }
};
// The light each ending is seen in.
const END_TIME = {
  unopened: 'dawn',
  sealed: 'deep',
  banished: 'deep',
  emptied: 'deep',
  shot: 'deep',
  burned: 'blaze',
  scarred: 'grey',
  'fallen-night': 'night',
  'fallen-below': 'deep',
  bethlem: 'grey',
  canal: 'morning',
  counting: 'deep',
  'doom-fire': 'blaze',
  'doom-dust': 'ash',
  'doom-sea': 'brine',
  'doom-teeth': 'night',
  'doom-plague': 'pall',
  'doom-madness': 'dream',
  truck: 'morning'
};
// sceneSVG draws the picture, lays the time's veil over it, then asks for its lights
BG.end = {
  indoor: true,
  draw: (tm, u, a) => (END_ART[a.end] || END_ART.unopened).draw(tm, u, a),
  lights: (u, a) => {
    const e = END_ART[a.end] || END_ART.unopened;
    return e.lights ? e.lights(u, a) : '';
  }
};
