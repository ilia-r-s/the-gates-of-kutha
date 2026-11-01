function twin(en, rus, ghosts = []) {
  const v = (t, cls) => {
    const [s, l] = Array.isArray(t) ? t : [t, null];
    return `<span class="tw ${cls}"${l ? ` lang="${l}"` : ''}>${s}</span>`;
  };
  return `<span class="twin">${v(en, 'tw-en')}${v(rus, 'tw-ru')}${ghosts.map(g => v(g, 'tw-ghost')).join('')}</span>`;
}
const CHROME = __text('CHROME');
function paintChrome() {
  Viewpoint.paint();
  CHROME.forEach(([sel, what, en, rus]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const v = LANG === 'ru' ? rus : en;
    if (what === 'twin') {
      if (!el.querySelector('.twin')) {
        el.innerHTML = twin([en, 'en'], [rus, 'ru']);
        el.firstChild.classList.add('wrap');
      }
    } else el.setAttribute(what, v);
  });
  document.title = LANG === 'ru' ? __text('gameTitleRu') : 'The Gates of Kutha';
  const b = document.getElementById('langBtn');
  if (b) {
    b.setAttribute('aria-label', LANG === 'ru' ? 'Switch to English' : __text('switchToRussian'));
    b.lang = LANG === 'ru' ? 'en' : 'ru';
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
  if (ni && typed != null)
    ni.value =
      typed === 'Marlowe' || typed === __text('core/text#marloweRu') ? (l === 'ru' ? __text('core/text#marloweRu') : 'Marlowe') : typed;
  const si = document.getElementById('pseed'),
    sr = document.getElementById('seedRow');
  if (si && code != null) si.value = code;
  if (sr && seedOpen) sr.hidden = false;
  seedFeedback(seedInvalid);
  const svg = document.getElementById('map');
  if (svg) svg.removeAttribute('data-ready');
  renderAll();
  auButtons();
  Session.language();
}
function langInit() {
  document.documentElement.setAttribute('lang', LANG);
  const box = document.querySelector('.sound');
  if (!box) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.tabIndex = 0;
  b.className = 'snd';
  b.id = 'langBtn';
  b.innerHTML = twin([__text('russianLanguageName'), 'ru'], ['English', 'en']);
  b.addEventListener('click', () => setLang(LANG === 'ru' ? 'en' : 'ru'));
  box.insertBefore(b, document.getElementById('nowPlaying'));
  paintChrome();
}
