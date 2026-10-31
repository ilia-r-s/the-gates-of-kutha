// ui/talk.js: recovered build 28.5.1. See tools/show.js for individual declarations.
function titlePick(c, st, ask) {
  talkScene(
    c,
    st,
    bi(...TX.talk.whichTitleWillYou(c)),
    titlesToAsk(c)
      .map(e => ({ label: bi(`“${capS(ttEn(e))}”`, `«${capS(ttRu(e))}»`), sub: __text('aTitleFromTheTablets'), fn: () => ask('title', e) }))
      .concat([backToTalk(c, st)])
  );
}
const inQuotes = s => bi('“', '«') + s + bi('”', '»');
function lineHTML(l, c) {
  if (l.who === 'you') return __text('youPClassDimP');
  if (l.who === 'them') return `<p>${bi(c.short, ru.c(c))}: ${inQuotes(l.text)}</p>`;
  return `<p class="notice">${l.text}</p>`;
}
const talkKicker = () => dayStamp() + ' · ' + bi(LOCS[S.loc].name);
const transcript = (c, st) => `<div class="transcript">${st.lines.map(l => lineHTML(l, c)).join('')}</div>`;
function talkScene(c, st, after, choices) {
  show({
    kicker: talkKicker(),
    title: bi(c.name, capS(ru.cf(c))),
    sub: bi(c.job, ru.ch(c).job),
    body: [transcript(c, st) + after],
    choices: choices
  });
}
const backToTalk = (c, st) => ({ label: __text('backToTheConversation'), cls: 'minor', fn: () => talk(c.id, st) });
function meet(c) {
  const { g: g, owned: owned } = openTalk(c),
    st = { asked: [], lines: [{ who: 'them', text: g.text }], chill: false, limit: null, cool: !!g.cool || Ties.against(c) };
  S.cv = { youE: 'neutral', themE: owned ? 'grave' : g.face, speaking: 'them' };
  if (owned) st.lines.push({ who: 'them', text: owned });
  return st;
}
function askThem(c, st, k, arg) {
  const r = askOf(c, st, k, arg);
  if (r.cool) st.cool = true;
  st.lines.push({ who: 'you', text: r.you });
  if (r.pre) st.lines.push({ who: 'note', text: r.pre });
  st.lines.push({ who: 'them', text: r.them });
  if (r.note) st.lines.push({ who: 'note', text: r.note });
  if (r.chill) st.lines.push({ who: 'note', text: r.chill });
  S.cv = { youE: r.youE, themE: r.face, speaking: 'them' };
  talk(c.id, st);
}
function talk(id, st) {
  const c = C(id);
  S.phase = 'talk';
  S.talkId = id;
  if (!st) st = meet(c);
  const opts = ['about', 'night', 'distrust', 'diary', 'show', 'title', 'confide', 'press']
    .filter(k => DIALOG[k])
    .filter(k => !st.asked.includes(k) && !(DIALOG[k].off && DIALOG[k].off(c)));
  const ask = (k, arg) => askThem(c, st, k, arg),
    over = st.limit != null && st.asked.length >= st.limit;
  const choices = !over
    ? opts.map(k => ({
        label: DIALOG[k].label(c),
        sub: DIALOG[k].sub(c),
        fn: () =>
          k === 'show' && showables().length > 1
            ? showPick(c, st, ask)
            : k === 'title' && titlesToAsk(c).length > 1
              ? titlePick(c, st, ask)
              : ask(k)
      }))
    : [];
  if (st.asked.length) choices.push({ label: __text('takeYourLeave'), cls: 'minor', fn: () => talkLeave(c, st) });
  else
    choices.push({
      label: __text('neverMind'),
      cls: 'minor',
      fn: () => {
        backedDown();
        goTo(S.loc);
      }
    });
  talkScene(c, st, talkAfter(c, st, over), choices);
}
function talkAfter(c, st, over) {
  const Q = RULES.talk.questions,
    k = over ? (st.limit < Q ? 'shorter' : 'over') : st.limit > Q && st.asked.length >= Q ? (st.cool ? 'longerCool' : 'longer') : null;
  if (!k) return '';
  const said = (st.said = st.said || {}),
    t = said[k] || (said[k] = tellOne(k, SAY[k])(c));
  return `<p class="dim">${bi(...t)}</p>`;
}
function talkLeave(c, st) {
  const { dream: d, mien: m, last: last } = leaveOf(c);
  if (d) {
    st.lines.push({ who: 'them', text: bi(...TX.talk.beforeYouGoI(d)) });
    S.cv = { youE: 'grave', themE: 'grave', speaking: 'them' };
  }
  if (m) st.lines.push({ who: 'note', text: m });
  if (last) {
    st.lines.push({ who: 'note', text: last[0] });
    S.cv.themE = last[1];
  }
  endSlot(transcript(c, st) + `<p class="dim">${bi(...leaveSay(last && last[2])(c))}</p>`, bi(c.name, capS(ru.cf(c))));
}
function leaveSay(kind) {
  let say = tellOne('leave', SAY.leave);
  for (let i = 1; i < SAY.leave.length && kind && (SAY.leaveClash[SAY.leave.indexOf(say)] || []).includes(kind); i++)
    say = tellOne('leave', SAY.leave);
  return say;
}
function showPick(c, st, ask) {
  talkScene(
    c,
    st,
    bi(...TX.talk.whatWillYouSet(c)),
    showables()
      .map(t => ({ label: bi(capS(t.name), capS(showRu(t, 'n'))), sub: t.sub, fn: () => ask('show', t.id) }))
      .concat([backToTalk(c, st)])
  );
}
