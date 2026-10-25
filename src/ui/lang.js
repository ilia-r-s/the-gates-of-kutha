// ===================== THE LANGUAGE SWITCH =====================
// English or Russian, at any moment: the page's own words, then the scene on screen, are repainted in place.
// The top panel and the casebook tabs never move when the language changes: their words are twins (below).

// Words that take the same room in both languages: every version sits in the same spot and only the current
// language's shows, so switching moves nothing. Ghosts are versions never shown (a button's other state), there only to
// hold the room. Each version may carry its own lang attribute: [text, lang].
function twin(en, rus, ghosts = []) {
  const v = (t, cls) => {
    const [s, l] = Array.isArray(t) ? t : [t, null];
    return `<span class="tw ${cls}"${l ? ` lang="${l}"` : ''}>${s}</span>`;
  };
  return `<span class="twin">${v(en, 'tw-en')}${v(rus, 'tw-ru')}${ghosts.map(g => v(g, 'tw-ghost')).join('')}</span>`;
}
const CHROME = [
  ['#nowPlaying', 'title', 'Now playing', 'Сейчас играет'],
  ['#meters', 'aria-label', 'Your condition', 'Ваше состояние'],
  [
    '#map',
    'aria-label',
    'Site plan of Tell Ibrahim showing the seven places you can visit',
    'План Телль-Ибрагима: семь мест, где можно побывать'
  ],
  [
    '.plan figcaption',
    'twin',
    'Tell Ibrahim, ancient Kutha · site plan, spring 1926 · initials show who is where',
    'Телль-Ибрагим, древняя Кута · план раскопа, весна 1926 · инициалы показывают, кто где'
  ],
  ['.casebook', 'aria-label', 'Casebook', 'Журнал']
];
function paintChrome() {
  CHROME.forEach(([sel, what, en, rus]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const v = LANG === 'ru' ? rus : en;
    if (what === 'twin') {
      // both at once, the hidden one holding the room: as many lines in either language
      if (!el.querySelector('.twin')) {
        el.innerHTML = twin([en, 'en'], [rus, 'ru']);
        el.firstChild.classList.add('wrap');
      }
    } else el.setAttribute(what, v);
  });
  document.title = LANG === 'ru' ? 'Врата Куты' : 'The Gates of Kutha';
  const b = document.getElementById('langBtn');
  if (b) {
    b.setAttribute('aria-label', LANG === 'ru' ? 'Switch to English' : 'Читать по-русски');
    b.lang = LANG === 'ru' ? 'en' : 'ru'; // (its name is in the language it switches to)
  }
}
function setLang(l) {
  if ((l !== 'en' && l !== 'ru') || l === LANG) return;
  const inp = document.getElementById('pname'),
    typed = inp ? inp.value : null,
    sd = document.getElementById('pseed'),
    code = sd ? sd.value : null;
  LANG = l;
  document.documentElement.setAttribute('lang', l);
  paintChrome();
  if (S_ui.scene) paintScene(S_ui.scene);
  const ni = document.getElementById('pname');
  if (ni && typed != null) ni.value = typed === 'Marlowe' || typed === 'Марлоу' ? (l === 'ru' ? 'Марлоу' : 'Marlowe') : typed;
  const si = document.getElementById('pseed');
  if (si && code != null) si.value = code;
  const svg = document.getElementById('map');
  if (svg) svg.removeAttribute('data-ready');
  renderAll();
  auButtons();
}
function langInit() {
  document.documentElement.setAttribute('lang', LANG); // (the artifact's page has no lang of its own)
  const box = document.querySelector('.sound');
  if (!box) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'snd';
  b.id = 'langBtn';
  b.innerHTML = twin(['Русский', 'ru'], ['English', 'en']); // the language you can switch to
  b.addEventListener('click', () => setLang(LANG === 'ru' ? 'en' : 'ru'));
  box.insertBefore(b, document.getElementById('nowPlaying'));
  paintChrome();
}
