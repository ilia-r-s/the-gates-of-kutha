// Run the shipped game's real code in an isolated VM. Only DOM painting, layout and sound are omitted.
// UI coverage stays in Chrome; test/parity.js checks choices, state and every die against Chrome.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fileURLToPath } = require('node:url');
const compiled = new Map();

function scriptFor(file) {
  if (file.startsWith('file:')) file = fileURLToPath(file);
  const stat = fs.statSync(file),
    key = `${file}:${stat.mtimeMs}:${stat.size}`;
  if (!compiled.has(key)) {
    const html = fs.readFileSync(file, 'utf8');
    const start = html.indexOf('<script>\n'),
      end = html.lastIndexOf('</script>');
    if (start < 0 || end < start) throw new Error(`No game script in ${file}`);
    compiled.clear();
    compiled.set(key, new vm.Script(html.slice(start + 9, end), { filename: file }));
  }
  return compiled.get(key);
}

const adapter = `
  // TextContent for the choice markup the game produces (no layout approximation).
  const __plain = html => String(html).replace(/<[^>]*>/g, '').replace(/&(#x[0-9a-f]+|#\\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (s,k) => k[0] === '#' ? String.fromCodePoint(k[1].toLowerCase() === 'x' ? parseInt(k.slice(2),16) : +k.slice(1)) :
      ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\\u00a0'})[k.toLowerCase()]);
  const __buttons = () => {
    const sc = S_ui.scene;
    return (sc?.choices || []).map((c,i) => {
      const under = typeof c.sub === 'function' ? c.sub() : c.sub;
      const html = X(c.html || '<span class="ch-key">'+(CHOICE_KEYS[i]||'')+'</span><span class="ch-label">'+c.label+'</span>'+
        (under ? '<span class="ch-sub">'+under+'</span>' : ''));
      return {textContent:__plain(html),innerHTML:html,dataset:{i:String(i)},click(){if(S_ui.scene===sc){if(typeof chooseScene==='function')chooseScene(i);else c.fn()}}};
    });
  };
  document.querySelectorAll = s => s === '#choices .choice' ? __buttons() : [];
  document.getElementById = id => {
    if(!['pname','pseed'].includes(id)||!S_ui.scene?.intro)return null;
    const html=X((S_ui.scene.body||[]).join(''));
    const match=new RegExp('id="'+id+'"[^>]*value="([^"]*)"').exec(html);
    return match ? {value:__plain(match[1]),focus(){},setAttribute(){}} : null;
  };
  show = sc => { S_ui.scene=sc; emit('scene',sc); };
  renderAll = paintScene = renderBook = () => {};
  setLang = l => { if(l==='en'||l==='ru')LANG=l; };
  sfx = musicChange = () => {};
`;

async function openNode({ file, seed = 4242, mathSeed = seed, lang = null, helpers = true } = {}) {
  const errors = [];
  let context = vm.createContext({
    __seed: seed,
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      }
    },
    location: { search: '', hash: '' },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {}
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {},
    setTimeout() {
      return 0;
    },
    clearTimeout() {},
    setInterval() {
      return 0;
    },
    clearInterval() {},
    requestAnimationFrame() {
      return 0;
    },
    console: {
      log() {},
      warn() {},
      error(...a) {
        errors.push(a.map(String).join(' '));
      }
    }
  });
  vm.runInContext('window = globalThis;', context);
  vm.runInContext(
    `{
    let m = (${JSON.stringify(mathSeed)} * 2654435761) >>> 0;
    Math.random = () => { m=(m+0x6d2b79f5)|0; let t=Math.imul(m^(m>>>15),1|m);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296; };
  }`,
    context
  );
  scriptFor(file).runInContext(context);
  vm.runInContext(adapter, context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'random.js'), 'utf8'), context);
  if (helpers) vm.runInContext(fs.readFileSync(path.join(__dirname, 'inpage.js'), 'utf8'), context);
  if (lang) vm.runInContext(`setLang(${JSON.stringify(lang)});`, context);
  const page = {
    async connectDecisions(options = {}) {
      if (!context) throw new Error('Node game already closed');
      if (!options || typeof options !== 'object' || Object.keys(options).some(k => !['policy', 'record'].includes(k)))
        throw new TypeError('Expected separate policy and record callbacks');
      const bridge = {};
      for (const kind of ['policy', 'record']) {
        const callback = options[kind];
        if (callback == null) continue;
        if (typeof callback !== 'function' || callback.constructor?.name === 'AsyncFunction')
          throw new TypeError('The decision ' + kind + ' callback must be synchronous');
        bridge[kind] = raw => {
          if (typeof raw !== 'string') throw new TypeError('The decision bridge accepts serialized JSON only');
          const result = callback(raw);
          if (result && typeof result.then === 'function') {
            // Suppress an abandoned promise's later rejection; it is never
            // awaited inside the synchronous game resolver.
            Promise.resolve(result).catch(() => {});
            throw new TypeError('The decision ' + kind + ' callback returned a promise');
          }
          if (kind === 'record') return undefined;
          if (result != null && typeof result !== 'string') throw new TypeError('The decision policy must return serialized JSON or null');
          return result ?? null;
        };
      }
      // These functions are created in the host realm. A policy sees one
      // immutable string, never the VM, S, a character object or the record sink.
      context.__decisionBridge = bridge;
      try {
        vm.runInContext('Decisions.connect(__decisionBridge);', context);
      } finally {
        delete context.__decisionBridge;
      }
    },
    async evaluate(fn, arg) {
      if (!context) throw new Error('Node game already closed');
      context.__argument = JSON.stringify(arg) ?? 'null';
      try {
        const result = await vm.runInContext(typeof fn === 'string' ? fn : `(${fn.toString()})(JSON.parse(__argument))`, context, {
          timeout: 300000
        });
        return result === undefined ? undefined : JSON.parse(JSON.stringify(result));
      } catch (error) {
        // A VM exception otherwise embeds the entire one-line shipped script.
        // Preserve the actual error and stack locations, not megabytes of source.
        if (error.stack)
          error.stack = String(error.stack)
            .split('\n')
            .filter(line => line.length < 1000 && !/^\s*\^\s*$/.test(line))
            .join('\n');
        throw error;
      } finally {
        delete context.__argument;
      }
    },
    async addScriptTag({ path: file }) {
      new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file }).runInContext(context);
    },
    async close() {
      context = null;
    }
  };
  return { page, errors };
}

module.exports = { openNode };
