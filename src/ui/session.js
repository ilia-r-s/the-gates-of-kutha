// One local expedition, reconstructed from player commands so scene closures and shared references survive.
const Session = (() => {
  const key = 'kutha.expedition',
    languageKey = 'kutha.language',
    release = '29.0.0',
    maxActions = 20000;
  const messages = __text('messages');
  let journal = null,
    stored = null,
    notice = null,
    depth = 0,
    replaying = false,
    ready = false,
    displaced = false,
    preferredLanguage = null;
  const tabs = ['people', 'evidence', 'omens', 'kit'];
  function paintNotice() {
    document.querySelectorAll('[data-session-notice]').forEach(el => {
      el.hidden = !notice;
      el.textContent = notice ? X(bi(...messages[notice])) : '';
    });
  }
  function warn(kind) {
    notice = kind;
    paintNotice();
  }
  function read(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      warn('unavailable');
      return null;
    }
  }
  function remove() {
    try {
      localStorage.removeItem(key);
    } catch {
      warn('unavailable');
    }
  }
  // Rendering can allocate different translation-token suffixes; compare the underlying English text.
  function checkpoint() {
    const seen = new Map();
    const sc = S_ui.scene || {};
    const value = JSON.stringify(
      { state: S, scene: [sc.kicker, sc.title, sc.sub, sc.body, (sc.choices || []).map(c => [c.label, c.html, c.cls])] },
      (k, v) => {
        if (typeof v === 'string')
          return v.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, t) => '\u0001' + t.split('\u0003')[0] + '\u0002');
        if (!v || typeof v !== 'object') return v;
        if (seen.has(v)) return '#' + seen.get(v);
        seen.set(v, seen.size);
        return v;
      }
    );
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return [_seed >>> 0, _words >>> 0, hash >>> 0];
  }
  function save() {
    if (!ready || replaying || !journal || !S || displaced) return;
    if (journal.actions.length > maxActions) {
      warn('unavailable');
      return;
    }
    try {
      // A second tab may have replaced or advanced this expedition. Do not silently overwrite it.
      if (stored !== null && localStorage.getItem(key) !== stored) {
        displaced = true;
        warn('anotherTab');
        return;
      }
      const data = { ...journal, lang: LANG, tab: S_ui.tab, seedOpen, check: checkpoint() };
      const raw = JSON.stringify(data);
      localStorage.setItem(key, raw);
      stored = raw;
      if (notice === 'unavailable') {
        notice = null;
        paintNotice();
      }
    } catch {
      warn('unavailable');
    }
  }
  function begin() {
    if (replaying) return;
    journal = { schema: 1, release, start: { name: S.name, bg: S.bg, hardcore: S.hardcore, seed: S.seed }, actions: [] };
    stored = null;
    displaced = false;
    notice = null;
    paintNotice();
  }
  function clear() {
    journal = null;
    stored = null;
    displaced = false;
    if (ready && !replaying) remove();
  }
  function act(command, f) {
    if (replaying || depth) return f();
    const before = journal;
    let result;
    depth++;
    try {
      result = f();
    } finally {
      depth--;
    }
    if (result !== false && journal && journal === before) {
      if (journal.actions.length >= maxActions) {
        displaced = true;
        warn('unavailable');
      } else journal.actions.push(command);
    }
    save();
    return result;
  }
  function validAction(a) {
    if (!Array.isArray(a)) return false;
    if (a[0] === 'choice') return a.length === 2 && Number.isInteger(a[1]) && a[1] >= 0 && a[1] < 100;
    if (a[0] === 'map') return a.length === 2 && LOC_IDS.includes(a[1]);
    if (a[0] === 'mark') return a.length === 2 && CHARS.some(c => c.id === a[1]);
    if (a[0] === 'note') return a.length === 2 && typeof a[1] === 'string' && /^[a-z0-9:-]{1,80}$/i.test(a[1]);
    return a.length === 1 && a[0] === 'drink';
  }
  function valid(data) {
    const start = data && data.start;
    return (
      data &&
      data.schema === 1 &&
      start &&
      typeof start.name === 'string' &&
      start.name.length > 0 &&
      start.name.length <= 24 &&
      ['philologist', 'soldier', 'occultist'].includes(start.bg) &&
      typeof start.hardcore === 'boolean' &&
      Number.isInteger(start.seed) &&
      start.seed >= 0 &&
      start.seed <= 0xffffffff &&
      Array.isArray(data.actions) &&
      data.actions.length <= maxActions &&
      data.actions.every(validAction) &&
      ['en', 'ru'].includes(data.lang) &&
      tabs.includes(data.tab) &&
      typeof data.seedOpen === 'boolean' &&
      Array.isArray(data.check) &&
      data.check.length === 3 &&
      data.check.every(n => Number.isInteger(n) && n >= 0 && n <= 0xffffffff)
    );
  }
  function restore() {
    const raw = read(key);
    if (!raw) return false;
    let data;
    try {
      if (raw.length > 2000000) throw new Error('size');
      data = JSON.parse(raw);
      if (!valid(data)) throw new Error('format');
      if (data.release !== release) {
        remove();
        warn('edition');
        return false;
      }
      if (!preferredLanguage) setLang(data.lang);
      replaying = true;
      const start = data.start;
      seedOpen = data.seedOpen;
      newGame(start.name, start.bg, start.hardcore, start.seed);
      arrivalScene();
      for (const a of data.actions) {
        const ok = a[0] === 'choice' ? chooseScene(a[1]) : a[0] === 'map' ? mapGo(a[1]) : bookAction(a);
        if (!ok) throw new Error('action');
      }
      if (JSON.stringify(checkpoint()) !== JSON.stringify(data.check)) throw new Error('checkpoint');
      journal = { schema: data.schema, release: data.release, start, actions: data.actions };
      stored = raw;
      S_ui.tab = data.tab;
    } catch {
      journal = null;
      remove();
      warn('damaged');
      return false;
    } finally {
      replaying = false;
    }
    show(S_ui.scene);
    paintNotice();
    return true;
  }
  function language() {
    if (!ready || replaying) return;
    preferredLanguage = LANG;
    try {
      localStorage.setItem(languageKey, LANG);
    } catch {
      warn('unavailable');
    }
    paintNotice();
    save();
  }
  function init() {
    const lang = read(languageKey);
    if (lang === 'en' || lang === 'ru') LANG = preferredLanguage = lang;
    ready = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) save();
    });
    addEventListener('pagehide', save);
  }
  listen('newgame', begin);
  return {
    get replaying() {
      return replaying;
    },
    init,
    restore,
    clear,
    act,
    save,
    language,
    paintNotice
  };
})();
