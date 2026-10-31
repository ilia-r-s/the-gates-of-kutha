// ui/scene.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const S_ui = { tab: 'people', scene: null };
const $ = s => document.querySelector(s);
const MAPLBL = __text('MAPLBL');
const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null,
  reduceMotion = () => !!(motionQuery && motionQuery.matches);
function show(sc) {
  S_ui.scene = sc;
  paintScene(sc);
  const st = $('#stage');
  st.classList.toggle('is-intro', !!sc.intro);
  entrance(st, RISE);
  renderAll();
  keepInView(st);
  emit('scene', sc);
}
const RISE = [
    [
      { opacity: 0.6, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'none' }
    ],
    { duration: 350, easing: 'ease-out' }
  ],
  ART_IN = [[{ opacity: 0.55 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' }];
const entering = new WeakMap();
function entrance(el, [frames, timing]) {
  if (!el.animate) return;
  try {
    const was = entering.get(el),
      still = reduceMotion();
    if (was && was.pending && !still) return;
    if (was) was.cancel();
    if (!still) entering.set(el, el.animate(frames, timing));
  } catch (e) {
    /* Optional browser feature or local preference storage. */
  }
}
let viewCheck = false;
function keepInView(st) {
  if (viewCheck) return;
  viewCheck = true;
  requestAnimationFrame(() => {
    viewCheck = false;
    if (st.getBoundingClientRect().top < 0) st.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
  });
}
const drawn = new WeakMap();
function draw(el, html) {
  if (drawn.get(el) === html) return;
  drawn.set(el, html);
  el.innerHTML = html;
}
function paintScene(sc) {
  if (sc.kickerHtml) $('#kicker').innerHTML = X(sc.kicker);
  else $('#kicker').textContent = X(sc.kicker || '');
  $('#sceneTitle').textContent = X(sc.title || '');
  const sub = $('#sceneSub');
  sub.textContent = X(sc.sub || '');
  sub.hidden = !sc.sub;
  $('#sceneText').innerHTML = X((sc.body || []).join(''));
  const box = $('#choices'),
    held = box.contains(document.activeElement);
  box.innerHTML = '';
  (sc.choices || []).forEach((c, i) => {
    const b = document.createElement('button'),
      under = typeof c.sub === 'function' ? c.sub() : c.sub;
    b.type = 'button';
    b.className = 'choice ' + (c.cls || '');
    b.dataset.i = i;
    b.innerHTML = X(
      c.html ||
        `<span class="ch-key">${CHOICE_KEYS[i] || ''}</span><span class="ch-label">${c.label}</span>${under ? `<span class="ch-sub">${under}</span>` : ''}`
    );
    b.addEventListener('click', e => {
      if (S_ui.scene !== sc || e.detail > 1) return;
      c.fn();
    });
    box.appendChild(b);
  });
  if (held && box.firstChild)
    box.firstChild.focus({
      preventScroll: true
    });
}
const CHOICE_KEYS = '1234567890';
function renderAll() {
  const on = !!S;
  document.body.classList.toggle('no-game', !on);
  renderMeters();
  renderMap();
  renderBook();
}
const METER_SAY = __text('METER_SAY');
function meterState() {
  const f = S.nerve / S.nerveMax,
    left = S.woundsMax - S.wounds,
    d = S.doom,
    { doomStir: stirs, doomWarn: warn } = RULES.start,
    step = (warn - stirs) / 3;
  const nerve = S.nerve <= 1 ? 5 : S.nerve === 2 ? 4 : f >= 0.85 ? 0 : f >= 0.65 ? 1 : f >= 0.45 ? 2 : 3,
    wounds = !S.wounds ? 0 : left >= 3 ? 1 : left === 2 ? 2 : 3,
    far =
      d >= S.doomMax ? 6 : d >= S.doomMax - 1 ? 5 : d >= warn ? 4 : d >= stirs + 2 * step ? 3 : d >= stirs + step ? 2 : d >= stirs ? 1 : 0,
    rite = wonEnding(S.ended) ? 7 : far;
  return { nerve: [nerve, [0, 1, 2, 2, 3, 3][nerve]], wounds: [wounds, wounds], rite: [rite, [0, 0, 1, 2, 2, 3, 3, 0][rite]] };
}
function meterWord(k, i) {
  const all = METER_SAY[k],
    [en, rus] = all[i];
  return twin(
    en,
    rus,
    all.flatMap(w => w).filter(w => w !== en && w !== rus)
  );
}
function renderMeters() {
  const m = $('#meters');
  if (!S) {
    draw(m, '');
    return;
  }
  const st = meterState(),
    one = (k, label, title) =>
      `<div class="meter" title="${title}"><span class="m-label">${label}</span><span class="m-say m-${st[k][1]}">${meterWord(k, st[k][0])}</span></div>`;
  draw(
    m,
    X(
      one('nerve', twin('Nerve', __text('text')), __text('nerveLoseAllOfItAnd')) +
        one('wounds', twin('Wounds', __text('text2')), __text('woundsTooManyAndYouDie')) +
        one('rite', twin('The rite', __text('text3')), bi(...TX.scene.theRiteWhenIt()))
    )
  );
}
function mapBase() {
  let g = '';
  for (let i = 0; i <= 8; i++) g += `<line class="grid" x1="${i * 50}" y1="0" x2="${i * 50}" y2="300"/>`;
  for (let j = 0; j <= 6; j++) g += `<line class="grid" x1="0" y1="${j * 50}" x2="400" y2="${j * 50}"/>`;
  'ABCDEFGH'.split('').forEach((L, i) => {
    g += `<text class="gridlbl" x="${i * 50 + 25}" y="10" text-anchor="middle">${L}</text>`;
  });
  for (let j = 1; j <= 6; j++) g += `<text class="gridlbl" x="4" y="${j * 50 - 22}">${j}</text>`;
  g += `<path class="canal" d="M30 0 C62 60 14 118 48 168 S36 258 64 300"/><path class="canal2" d="M42 0 C74 60 26 118 60 168 S48 258 76 300"/>`;
  [
    [150, 96, 0.35],
    [118, 74, 0.5],
    [84, 52, 0.65],
    [48, 30, 0.8]
  ].forEach(([rx, ry, o], k) => {
    g += `<ellipse class="contour ${k === 0 ? 'outer' : ''}" cx="205" cy="128" rx="${rx}" ry="${ry}" transform="rotate(-8 205 128)" style="opacity:${o}"/>`;
  });
  g += `<g transform="rotate(14 160 96)"><rect class="feat" x="141" y="77" width="38" height="38"/><rect class="feat" x="151" y="87" width="18" height="18"/></g>`;
  g += `<rect class="feat cut" x="186" y="152" width="40" height="11" transform="rotate(-20 205 158)"/>`;
  g += `<rect class="feat" x="287" y="150" width="22" height="16"/>`;
  [
    [318, 246],
    [334, 250],
    [350, 244],
    [326, 228]
  ].forEach(([x, y]) => {
    g += `<path class="feat" d="M${x - 6} ${y} L${x} ${y - 9} L${x + 6} ${y} Z"/>`;
  });
  [
    [68, 246],
    [80, 252],
    [92, 244],
    [74, 230],
    [94, 232],
    [62, 236]
  ].forEach(([x, y]) => {
    g += `<rect class="feat" x="${x - 4}" y="${y - 4}" width="8" height="7"/>`;
  });
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) g += `<ellipse class="feat" cx="${272 + c * 11}" cy="${56 + r * 9}" rx="4" ry="2.5"/>`;
  [
    [22, 60],
    [14, 140],
    [80, 190],
    [26, 210],
    [96, 270],
    [10, 270]
  ].forEach(([x, y]) => {
    g += `<path class="palm" d="M${x - 5} ${y}h10M${x} ${y - 5}v10M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8"/>`;
  });
  g += __text('nGTransformTranslatePathClass');
  g += `<g transform="translate(300 286)"><path class="scale" d="M0 0h80M0 -4v8M40 -4v8M80 -4v8"/><text class="gridlbl" x="0" y="-7" text-anchor="middle">0</text><text class="gridlbl" x="40" y="-7" text-anchor="middle">50</text><text class="gridlbl" x="80" y="-7" text-anchor="middle">${__text('m')}</text></g>`;
  return `<g class="base">${g}</g><g id="mapDyn"></g>`;
}
const TIP = 'title';
function renderMap() {
  const svg = $('#map');
  if (!svg.getAttribute('data-ready')) {
    svg.innerHTML = X(mapBase());
    svg.setAttribute('data-ready', '1');
  }
  const dyn = svg.querySelector('#mapDyn');
  const clickable = S && (S.phase === 'plan' || S.phase === 'loc');
  svg.classList.toggle('live', !!clickable);
  let h = '';
  LOC_IDS.forEach(l => {
    const L = LOCS[l],
      here = S && S.here[l] ? S.here[l].map(C).filter(isFree) : [];
    const cur = S && S.loc === l,
      crime = S && S.crime && S.crime.loc === l && !S.crime.examined,
      dug = (S && S.searched[l]) || 0;
    const lx = L.x > 340 ? -10 : 10,
      anchor = L.x > 340 ? 'end' : 'start';
    const name = bi(L.name) + (dug ? searchedSay(dug) : '');
    const go = clickable && !(cur && S.phase === 'loc');
    h += `<g class="loc ${cur ? 'cur' : ''}" data-loc="${l}" ${go ? `tabindex="0" role="button" aria-label="${__text('goTo')}${dug ? searchedSay(dug) : ''}"` : ''}>\n      <${TIP}>${name}</${TIP}><circle class="hit" cx="${L.x}" cy="${L.y}" r="18"/><circle class="mk" cx="${L.x}" cy="${L.y}" r="6"/>\n      <text class="loclbl" x="${L.x + lx}" y="${L.y - 8}" text-anchor="${anchor}">${bi(MAPLBL[l])}</text>\n      ${crime ? `<path class="crime" d="M${L.x - 13} ${L.y - 13}l6 6m0 -6l-6 6"/>` : ''}\n      ${testPits(L, dug)}\n      ${here.map((c, i) => `<g class="tok"><circle cx="${L.x - (here.length - 1) * 8 + i * 16}" cy="${L.y + 17}" r="7.5"/><text x="${L.x - (here.length - 1) * 8 + i * 16}" y="${L.y + 19.6}" text-anchor="middle">${bi(c.init, ru.ch(c).init)}</text></g>`).join('')}\n    </g>`;
  });
  draw(dyn, X(h));
}
function testPits(L, n) {
  let s = '';
  for (let i = 0; i < Math.min(3, n); i++) s += `<rect class="pit" x="${L.x - 17 - i * 7}" y="${L.y - 2.5}" width="5" height="5"/>`;
  return s;
}
const searchedSay = n => __text('searched');
function mapGo(l) {
  if (!S || !(S.phase === 'plan' || S.phase === 'loc')) return;
  if (S.phase === 'loc' && S.loc === l) return;
  goTo(l);
}
function initUI() {
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => {
      const changed = S_ui.tab !== t.dataset.tab;
      S_ui.tab = t.dataset.tab;
      renderBook();
      if (changed) $('#tabPanel').scrollTop = 0;
    })
  );
  $('#kicker').addEventListener('click', e => {
    if (e.target.closest('#seedKey')) openSeed();
  });
  const svg = $('#map');
  svg.addEventListener('click', e => {
    const g = e.target.closest('[data-loc]');
    if (g && e.detail <= 1) mapGo(g.getAttribute('data-loc'));
  });
  svg.addEventListener('keydown', e => {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat) return;
    const g = e.target.closest('[data-loc]');
    if (g) {
      e.preventDefault();
      mapGo(g.getAttribute('data-loc'));
    }
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const n = e.key.length === 1 ? CHOICE_KEYS.indexOf(e.key) : -1;
    if (n >= 0) {
      const b = document.querySelectorAll('#choices .choice')[n];
      if (b) {
        e.preventDefault();
        b.click();
      }
    }
  });
  introScene();
}
