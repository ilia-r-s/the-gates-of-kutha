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
      return {textContent:__plain(html),innerHTML:html,dataset:{i:String(i)},click(){if(S_ui.scene===sc)c.fn()}};
    });
  };
  document.querySelectorAll = s => s === '#choices .choice' ? __buttons() : [];
  document.getElementById = id => {
    if(!['pname','pseed'].includes(id)||!S_ui.scene?.intro)return null;
    const html=X((S_ui.scene.body||[]).join(''));
    const match=new RegExp('id="'+id+'"[^>]*value="([^"]*)"').exec(html);
    return match ? {value:__plain(match[1]),focus(){}} : null;
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
  if (helpers) vm.runInContext(fs.readFileSync(path.join(__dirname, 'inpage.js'), 'utf8'), context);
  if (lang) vm.runInContext(`setLang(${JSON.stringify(lang)});`, context);
  const page = {
    async evaluate(fn, arg) {
      if (!context) throw new Error('Node game already closed');
      context.__argument = JSON.stringify(arg) ?? 'null';
      try {
        const result = await vm.runInContext(typeof fn === 'string' ? fn : `(${fn.toString()})(JSON.parse(__argument))`, context, {
          timeout: 300000
        });
        return result === undefined ? undefined : JSON.parse(JSON.stringify(result));
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
