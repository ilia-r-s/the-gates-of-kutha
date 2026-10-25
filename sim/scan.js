// Plays many seasons with every policy and reports anything a reader should never meet, in both languages:
// markers and leaks (the shared scan), numbers on screen during play, English slips (doubled words, articles, spacing),
// gendered Russian for the player (вы + a singular past tense or short adjective), two choices with one label,
// talking with someone no longer free, people at a place who are not free, values out of range, stuck seasons, errors.
//   node sim/scan.js                    40 seasons with each of nine ways of playing (360), every fourth hardcore
//   node sim/scan.js --seasons=10 --pols=human,random --digits    (--digits: list every number shown during play)
// Exits 1 if anything a reader must never meet turns up (markers, leaks, stuck seasons, page errors, two choices with one
// label, talking with someone no longer free, values out of range); English slips and gendered Russian are listed to look
// at, since the patterns that find them also find a few lines that are right.
const { run, open, args } = require('../test/lib/harness');
const A = args({
  seasons: 40,
  pols: 'human,random,cheat,sleuth,confidant,quiet,inquisitor,scholar,delver',
  file: 'standalone',
  digits: false
});
const N = A.seasons,
  FILE = A.file,
  POLS = String(A.pols).split(',');
run(async browser => {
  const total = { seasons: 0, stuck: [], errors: [], bad: {}, digits: {}, en: {}, ru: {}, dup: {}, talk: {}, here: {}, range: {} };
  const merge = (into, from) =>
    Object.entries(from).forEach(([k, v]) => {
      const t = (into[k] = into[k] || { n: 0, ex: [] });
      t.n += v.n;
      v.ex.forEach(e => t.ex.length < 4 && t.ex.push(e));
    });
  for (const [pi, pol] of POLS.entries()) {
    const seed = 21001 + 17 * pi;
    const { page, errors } = await open(browser, { file: FILE, seed, mathSeed: seed });
    const r = await page.evaluate(
      ([N, pol]) => {
        window.sfx = () => {};
        window.musicChange = () => {};
        const res = { n: 0, stuck: [], bad: {}, digits: {}, en: {}, ru: {}, dup: {}, talk: {}, here: {}, range: {} };
        const add = (o, k, ex) => {
          o[k] = o[k] || { n: 0, ex: [] };
          o[k].n++;
          if (o[k].ex.length < 4 && !o[k].ex.includes(ex)) o[k].ex.push(ex);
        };
        const marks = [];
        __T.watchScenes(marks, new Set());
        const plain = s =>
          s
            .replace(/<\/?(b|i|em|strong|span|a)\b[^>]*>/g, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const render = (s, l) => {
          const keep = LANG;
          LANG = l;
          const t = plain(X(s));
          LANG = keep;
          return t;
        };
        const seen = new Set();
        const ctx = () => `${pol} g${res.n} day ${S.day} ${S.phase}`;
        const RU_PAST =
          /(?:^|[\s(«—])[Вв]ы\s+(?:(?:не|уже|ещё|тоже|так|почти|только|лишь|едва|вдруг|снова|опять|всё|все|сами)\s+)*([а-яё]+(?:л|ла|ло|лся|лась|лось))(?=[\s,.!?;:»)…—]|$)/g;
        const RU_SHORT =
          /(?:^|[\s(«—])[Вв]ы\s+(?:(?:не|уже|ещё|тоже|так|почти|совсем|слишком|всё|ещё)\s+)*(сам|сама|один|одна|должен|должна|готов|готова|уверен|уверена|рад|рада|прав|права|ранен|ранена|жив|жива|свободен|свободна|болен|больна|виноват|виновата|согласен|согласна|нужен|нужна|способен|способна|знаком|знакома|похож|похожа|одинок|одинока|занят|занята|счастлив|счастлива|устал|устала)(?=[\s,.!?;:»)…—]|$)/g;
        const checkText = (s, where) => {
          if (s == null) return;
          s = String(s);
          if (seen.has(s)) return;
          seen.add(s);
          const en = render(s, 'en'),
            ru = render(s, 'ru');
          if (!S || !S.ended) {
            [en, ru].forEach(t => {
              const m = t.match(/[^.!?]{0,40}\d[^.!?]{0,30}/g);
              if (m)
                m.forEach(
                  x => !/\b19[12]\d\b/.test(x) && add(res.digits, x.replace(/\d+/g, '#').trim().slice(0, 70), `${ctx()}: ${x.trim()}`)
                );
            });
          }
          let m;
          const dbl = /\b(\w+)\s+\1\b/gi;
          while ((m = dbl.exec(en)))
            if (!/^(that|had|is|very|far|long|on|more|no|again|knock|ha|hush)$/i.test(m[1]))
              add(res.en, 'doubled: ' + m[0].toLowerCase(), `${ctx()} ${where}: …${en.slice(Math.max(0, m.index - 40), m.index + 40)}…`);
          const art = /\b(a|an)\s+([A-Za-z]+)/g;
          while ((m = art.exec(en))) {
            const w = m[2].toLowerCase(),
              vow = /^[aeiou]/.test(w) && !/^(one|once|uni|use|usu|euro|eu|ewe|ur|uk)/.test(w),
              hush = /^(hour|honest|honou?r|heir)/.test(w);
            if ((m[1].toLowerCase() === 'a' && (vow || hush)) || (m[1].toLowerCase() === 'an' && !vow && !hush))
              add(res.en, `article: ${m[1]} ${w}`, `${ctx()} ${where}: …${en.slice(Math.max(0, m.index - 30), m.index + 40)}…`);
          }
          if (/\s[,.;:!?](?![.\d])/.test(en)) add(res.en, 'space before punctuation', `${ctx()} ${where}: ${en.slice(0, 120)}`);
          const run_ = /[a-z][.!?;,][A-Za-z]/g;
          while ((m = run_.exec(en)))
            if (!/e\.g|i\.e|a\.m|p\.m/.test(en.slice(m.index - 2, m.index + 3)))
              add(res.en, 'no space after punctuation', `${ctx()} ${where}: …${en.slice(Math.max(0, m.index - 30), m.index + 30)}…`);
          [RU_PAST, RU_SHORT].forEach(re => {
            re.lastIndex = 0;
            while ((m = re.exec(ru)))
              add(res.ru, 'вы + ' + m[1].toLowerCase(), `${ctx()} ${where}: …${ru.slice(Math.max(0, m.index - 40), m.index + 60)}…`);
          });
        };
        const o = window.show;
        window.show = sc => {
          [sc.kicker, sc.title, sc.sub, ...(sc.body || [])].forEach(x => checkText(x, 'body'));
          const labels = (sc.choices || []).map(c => {
            checkText(c.label, 'choice');
            checkText(typeof c.sub === 'function' ? c.sub() : c.sub, 'choice-sub');
            return render(c.label, 'en');
          });
          labels.forEach((l, i) => labels.indexOf(l) !== i && add(res.dup, l.slice(0, 60), ctx()));
          labels.forEach(l => {
            const t = l.match(/Speak with ([A-Z][\w' é-]+)/);
            if (!t) return;
            const c = CHARS.find(x => t[1].includes(x.short) || t[1].includes(x.name));
            if (c && !isFree(C(c.id))) add(res.talk, `${c.id} ${C(c.id).status}`, ctx());
          });
          o(sc);
        };
        const P = { random: __T.policies.random, cheat: __T.policies.cheat }[pol];
        const rnd = __T.lcg(91);
        const policy = P ? P(rnd) : __T.policies.human(rnd, pol === 'human' ? null : __T.LEANS[pol]);
        const each = () => {
          Object.entries(S.here || {}).forEach(([l, ids]) =>
            ids.forEach(
              id =>
                !isFree(C(id)) &&
                !['night', 'finale', 'descent', 'sanctum', 'end'].includes(S.phase) &&
                add(res.here, `${C(id).status} at ${l}`, ctx())
            )
          );
          S.order.forEach(id => {
            const c = C(id);
            if (!(c.rapport >= -2 && c.rapport <= 3)) add(res.range, 'rapport ' + c.rapport, ctx());
          });
          if (!Number.isFinite(S.nerve) || S.nerve < 0) add(res.range, 'nerve ' + S.nerve, ctx());
          if (S.day > RULES.start.days && !S.fin) add(res.range, 'day ' + S.day, ctx());
        };
        for (let g = 0; g < N; g++) {
          res.n = g;
          __T.start(g % 3, g % 4 === 3);
          if (!__T.play(policy, { maxSteps: 1500, each }))
            res.stuck.push(`${pol} g${g} day ${S.day} ${S.phase}: ${__T.buttons().length} buttons`);
        }
        marks.forEach(b => add(res.bad, b.slice(0, 80), b));
        res.n = N;
        return res;
      },
      [N, pol]
    );
    total.seasons += r.n;
    total.stuck.push(...r.stuck);
    total.errors.push(...errors.slice(0, 5).map(e => `${pol}: ${e}`));
    ['bad', 'digits', 'en', 'ru', 'dup', 'talk', 'here', 'range'].forEach(k => merge(total[k], r[k]));
    await page.close();
  }
  // the report: what must never happen first, then what is worth a look
  const show = (title, o) => {
    const ks = Object.entries(o).sort((a, b) => b[1].n - a[1].n);
    if (!ks.length) return [`${title}: none`];
    return [
      `${title}:`,
      ...ks
        .slice(0, 30)
        .flatMap(([k, v]) => [`  ${String(v.n).padStart(5)}  ${k}`, ...v.ex.slice(0, 2).map(e => `           ${e.slice(0, 200)}`)])
    ];
  };
  const must =
    ['bad', 'dup', 'talk', 'range'].reduce((a, k) => a + Object.keys(total[k]).length, 0) + total.stuck.length + total.errors.length;
  const out = [
    `${total.seasons} seasons, ${total.stuck.length} stuck, ${total.errors.length} page errors`,
    ...total.stuck.slice(0, 10).map(s => '  stuck: ' + s),
    ...total.errors.slice(0, 10).map(s => '  error: ' + s),
    ...show('Markers and leaks', total.bad),
    ...show('Two choices with one label', total.dup),
    ...show('Talking with someone no longer free', total.talk),
    ...show('Out of range', total.range),
    ...show('Someone not free still placed somewhere (not shown on screen)', total.here),
    ...show('English worth a look', total.en),
    ...show('Russian for the player worth a look (вы + a singular past or short form)', total.ru),
    ...(A.digits
      ? show('Numbers shown during play', total.digits)
      : [`Numbers shown during play: ${Object.keys(total.digits).length} patterns (--digits to list)`])
  ];
  console.log(out.join('\n'));
  if (must) process.exitCode = 1;
});
