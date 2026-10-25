// ===================== A CONVERSATION =====================
// The conversation's screen: the questions dialog.js offers, asked and answered, and taking your leave. What happens in
// it is the rules' (people/dialog.js: openTalk, askOf, leaveOf); this shows it as it goes: two questions to a
// conversation as a rule (RULES.talk.questions; now and then three, or one); then you take your leave, and sometimes
// they tell you one more thing.
function titlePick(c, st, ask) {
  talkScene(
    c,
    st,
    bi(`<p class="dim">Which title will you ask ${c.short} about?</p>`, `<p class="dim">О каком титуле спросить ${ru.c(c, 'a')}?</p>`),
    titlesToAsk(c)
      .map(e => ({
        label: bi(`“${capS(ttEn(e))}”`, `«${capS(ttRu(e))}»`),
        sub: bi('A title from the tablets', 'Титул из табличек'),
        fn: () => ask('title', e)
      }))
      .concat([backToTalk(c, st)])
  );
}
const inQuotes = s => bi('“', '«') + s + bi('”', '»');
function lineHTML(l, c) {
  if (l.who === 'you') return `<p class="dim">${bi('You', 'Вы')}: ${inQuotes(l.text)}</p>`;
  if (l.who === 'them') return `<p>${bi(c.short, ru.c(c))}: ${inQuotes(l.text)}</p>`;
  return `<p class="notice">${l.text}</p>`;
}
const talkKicker = () => dayStamp() + ' · ' + bi(LOCS[S.loc].name);
// the conversation so far, as the screen shows it
const transcript = (c, st) => `<div class="transcript">${st.lines.map(l => lineHTML(l, c)).join('')}</div>`;
// the conversation's screen: whom you are talking with, the conversation so far and a line beneath it, and the choices
function talkScene(c, st, after, choices) {
  show({
    kicker: talkKicker(),
    title: bi(c.name, capS(ru.cf(c))),
    sub: bi(c.job, ru.ch(c).job),
    body: [transcript(c, st) + after],
    choices
  });
}
// from a choice among several (a title to ask about, a thing to show), back to the conversation
const backToTalk = (c, st) => ({ label: bi('Back to the conversation', 'Вернуться к разговору'), cls: 'minor', fn: () => talk(c.id, st) });
// The start of a conversation: their greeting, and the truth from someone who hid their part and now trusts you
// (people/dialog.js, openTalk). (It counts as a conversation once you ask something: thinking better of it before then
// is no conversation, and how long it would have run is not settled until the first question: askOf.) st: the
// conversation so far, its lines and how it stands (asked, limit, chill: askOf; cool: a cold or hurried greeting, or a
// curt answer since, so that a third question allowed is not told as their being in no hurry: talkAfter).
function meet(c) {
  const { g, owned } = openTalk(c),
    st = { asked: [], lines: [{ who: 'them', text: g.text }], chill: false, limit: null, cool: !!g.cool || Ties.against(c) };
  S.cv = { youE: 'neutral', themE: g.face, speaking: 'them' };
  if (owned) {
    st.lines.push({ who: 'them', text: owned });
    S.cv.themE = 'grave';
  }
  return st;
}
// A question asked and answered (people/dialog.js, askOf), with whatever you notice as they answer.
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
  if (st.asked.length) choices.push({ label: bi('Take your leave', 'Откланяться'), cls: 'minor', fn: () => talkLeave(c, st) });
  else
    choices.push({
      label: bi('Never mind', 'Неважно'),
      cls: 'minor',
      fn: () => {
        backedDown();
        goTo(S.loc);
      }
    });
  talkScene(c, st, talkAfter(c, st, over), choices);
}
// The line under the conversation: that it has run its course (and, if it was a short one, that they had little time
// today); or, the second question asked with a third still to come, as now and then there is, that they are in no hurry
// today (or, after a cold or hurried word, only that they have not sent you away yet). Told once a conversation, and the
// same each time the screen is drawn.
function talkAfter(c, st, over) {
  const Q = RULES.talk.questions,
    k = over ? (st.limit < Q ? 'shorter' : 'over') : st.limit > Q && st.asked.length >= Q ? (st.cool ? 'longerCool' : 'longer') : null;
  if (!k) return '';
  const said = (st.said = st.said || {}),
    t = said[k] || (said[k] = tellOne(k, SAY[k])(c));
  return `<p class="dim">${bi(...t)}</p>`;
}
// Taking your leave (people/dialog.js, leaveOf): a dream told in parting, perhaps, and a last look at them; then the
// slot is spent.
function talkLeave(c, st) {
  const { dream: d, mien: m, last } = leaveOf(c);
  if (d) {
    st.lines.push({
      who: 'them',
      text: bi(
        'Before you go. I dreamt of the seven gates. ' + dreamEn(d.t, d.cult),
        'Пока вы не ушли. Мне снились семь врат. ' + dreamRu(d.t, d.cult)
      )
    });
    S.cv = { youE: 'grave', themE: 'grave', speaking: 'them' };
  }
  if (m) st.lines.push({ who: 'note', text: m });
  if (last) {
    st.lines.push({ who: 'note', text: last[0] });
    S.cv.themE = last[1];
  }
  endSlot(transcript(c, st) + `<p class="dim">${bi(...leaveSay(last && last[2])(c))}</p>`, bi(c.name, capS(ru.cf(c))));
}
// how you take your leave, the next of its tellings that does not gainsay how they saw you go (kind: a back turned on
// you, cold; a walk to the light railway, walk: data/variety.js, leaveClash)
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
    bi(`<p class="dim">What will you set in front of ${c.short}?</p>`, `<p class="dim">Что вы положите перед ${ru.c(c, 'i')}?</p>`),
    showables()
      .map(t => ({ label: bi(capS(t.name), capS(showRu(t, 'n'))), sub: t.sub, fn: () => ask('show', t.id) }))
      .concat([backToTalk(c, st)])
  );
}
