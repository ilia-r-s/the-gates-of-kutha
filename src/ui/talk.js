// ===================== A CONVERSATION =====================
// Two questions to a conversation as a rule (RULES.talk.questions; now and then three, or one), chosen from what
// dialog.js offers; then you take your leave, and sometimes they tell you one more thing.
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
// The start of a conversation: their greeting (the slot's own: people/manner.js), and the truth from someone who hid
// their part and now trusts you. (It counts as a conversation once you ask something: thinking better of it before then
// is no conversation, and how long it would have run is not settled until the first question: askThem.)
function meet(c) {
  // (cool: a cold or hurried greeting, or a curt answer since, so that a third question allowed is not told as their
  // being in no hurry: talkAfter)
  const g = greeting(c),
    st = { asked: [], lines: [{ who: 'them', text: g.text }], chill: false, limit: null, cool: !!g.cool || c.rapport <= -1 };
  S.cv = { youE: 'neutral', themE: g.face, speaking: 'them' };
  S.act = 'talk';
  const rc = recantTrust(c);
  if (rc) {
    st.lines.push({ who: 'them', text: rc });
    S.cv.themE = 'grave';
  }
  return st;
}
// A question asked and answered, with whatever you notice as they answer; an occultist may feel a chill near them,
// once a conversation.
function askThem(c, st, k, arg) {
  if (!st.asked.length) {
    S.log.talk++;
    // two questions, as a rule; now and then they have time for a third, or none for a second (talk.longer, shorter)
    const RT = RULES.talk;
    st.limit = RT.questions + (chance(RT.longer) ? 1 : chance(RT.shorter) ? -1 : 0);
  }
  st.asked.push(k);
  S.log[k] = (S.log[k] || 0) + 1;
  emit('ask', k);
  const r = DIALOG[k].run(c, arg);
  if (r.cool) st.cool = true;
  st.lines.push({ who: 'you', text: r.you });
  if (r.pre) st.lines.push({ who: 'note', text: r.pre });
  st.lines.push({ who: 'them', text: r.them });
  if (r.note) st.lines.push({ who: 'note', text: r.note });
  if (!st.chill && S.bg === 'occultist') {
    st.chill = true;
    if (chance(c.role === 'cult' ? RULES.talk.chillCult : RULES.talk.chillOther)) {
      st.lines.push({
        who: 'note',
        text: bi(...tellOne('chill', [x => [fmt(T.chill, P(x)), fmtR(R(T.chill), { n: x })], ...SAY.chill])(c))
      });
      addTest(c.id, c.id, 'chill', 'cult');
    }
  }
  S.cv = { youE: r.youE, themE: faceFor(c, r.themE), speaking: 'them' };
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
// Taking your leave: a dream told in parting, perhaps, and a last look at them (people/manner.js); then the slot is spent.
function talkLeave(c, st) {
  const d = partingDream(c);
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
  const m = mienNote(c, RULES.talk.mienParting);
  if (m) st.lines.push({ who: 'note', text: m });
  const last = parting(c);
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
