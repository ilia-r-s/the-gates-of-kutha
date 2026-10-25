// ===================== THE THIEF AS WITNESS =====================
// Out on his own business at night, the smuggler may see who did it: more likely if he was where it happened, or came
// to rob the place afterwards. He says nothing (a thief who saw a murder would be the next one), and nothing shows of it
// in the camp's eyes; but he hints: when you ask whom he distrusts (now and then naming them outright), and in his
// gossip; and at an inquiry he votes as one who knows (game/verdict.js). When his own story breaks (pressed into
// admitting the smuggling, coming clean of his own accord, or sent away after an inquiry), he names the one he saw; once
// he has named one, seldom another.
const FROM_EN = {
  camp: 'the camp',
  trench: 'Trench B',
  ziggurat: 'the ziggurat',
  store: 'the finds magazine',
  village: 'the village',
  canal: 'the canal',
  cemetery: 'the Parthian graves'
};
// the night n: was the thief there to see it? (his trace at the scene means he came to rob it before it was cold; and one
// who spent the night in your tent saw nothing out on the tell)
function thiefSees(n, loc, actorId, robbed) {
  const smug = freeChars().find(c => c.role === 'smuggler'),
    rec = S.nights[n];
  if (!smug || inYourTent(smug.id, n) || !rec || !rec.truth[smug.id] || rec.truth[smug.id].attacked || loc === 'camp') return; // (attacked: he saw neither face)
  const th = RULES.thief,
    p = rec.truth[smug.id].loc === loc ? th.near : robbed ? th.robbed : th.witness;
  if (!chance(p)) return;
  // the one he saw: the one who did it, all but always; now and then someone else about in the dark (real: who it was)
  const others = freeChars().filter(c => c.id !== smug.id && c.id !== actorId && c.id !== rec.target),
    seen = chance(th.sure) || !others.length ? actorId : pick(others).id;
  S.witness.push({ night: n, actor: seen, real: actorId, loc });
}
// whether c is the thief who saw x at it
const sawAtIt = (c, x) => c.role === 'smuggler' && S.witness.some(w => w.actor === x.id);
// what he saw and has not told, if the one he saw is still at large: the latest such night (once he has named one, only
// if he would name another: S.witnessMore, decided as he names each; and never one he has named already)
const thiefSaw = c =>
  c.role === 'smuggler' && (!S.witnessTold || S.witnessMore)
    ? S.witness
        .filter(w => isFree(C(w.actor)) && !S.witnessNamed.includes(w.actor))
        .slice(-1)
        .pop() || null
    : null;
// a hint, when you ask whom he distrusts
function thiefHint(c, w) {
  const a = C(w.actor),
    k = pick([0, 1]);
  addTest(c.id, a.id, 'distrust', 'cult');
  return {
    them: bi(
      [
        `If I were you, Doctor, I would ask ${a.short} where ${a.p} walks after midnight. I say nothing more.`,
        `${a.short} sleeps very little, for an honest ${a.p === 'she' ? 'woman' : 'man'}. That is all.`
      ][k],
      [
        `На вашем месте, доктор, я бы ${ru.gs(c, 'спросил', 'спросила')} ${ru.c(a, 'a')}, где ${ru.gs(a, 'он', 'она')} гуляет после полуночи. Больше я ничего не скажу.`,
        `Для ${ru.gs(a, 'честного человека', 'честной женщины')} ${ru.c(a)} слишком мало спит. Только и всего.`
      ][k]
    ),
    note: bi(
      `${c.short} says it lightly, and does not quite meet your eye.`,
      `${ru.c(c)} говорит это небрежно — и не вполне смотрит вам в глаза.`
    )
  };
}
// a hint in his gossip
function thiefGossip(c, w) {
  const a = C(w.actor),
    k = pick([0, 1]);
  addTest(c.id, a.id, 'hint', 'night');
  return {
    t: a,
    text: bi(
      [
        `${a.short} keeps very late hours for someone with nothing to do at night.`,
        `Ask ${a.short} why ${a.pp} boots were muddy the morning after. I would.`
      ][k],
      [
        `Для человека, которому нечего делать по ночам, ${ru.c(a)} слишком поздно ложится.`,
        `Спросите ${ru.c(a, 'a')}, почему наутро у ${ru.gs(a, 'него', 'неё')} сапоги были в грязи. Я бы ${ru.gs(c, 'спросил', 'спросила')}.`
      ][k]
    )
  };
}
// when he saw it, as he would say it
function nightAgo(n) {
  const k = S.day - n;
  if (n === 0) return ['the night Crane died', 'в ночь, когда погиб Крейн,'];
  if (k <= 1) return ['last night', 'прошлой ночью'];
  if (k === 2) return ['two nights ago', 'позапрошлой ночью'];
  return [`${k} nights ago`, `${k} ${ruN(k, 'ночь', 'ночи', 'ночей')} назад`];
}
// his story broken, he names the one he saw. lead: what he says first, if anything. The naming is remembered in the
// casebook, and he names nobody twice.
function thiefNames(c, lead = ['', '']) {
  const w = thiefSaw(c);
  if (!w) return '';
  const a = C(w.actor),
    [en, rus] = nightAgo(w.night);
  S.witnessTold = a.id;
  S.witnessNamed.push(a.id);
  S.witnessMore = chance(RULES.thief.again); // (whether he would name another he saw, later)
  addTest(c.id, a.id, 'witness', 'cult');
  journal(
    bi(
      `${c.name} saw ${a.name} near the scene ${en}, and said so at last.`,
      `${capS(ru.cf(c))} ${ru.gs(c, 'видел', 'видела')} ${ru.cf(a, 'a')} у места нападения ${rus} — и наконец ${ru.gs(c, 'сказал', 'сказала')} об этом.`
    )
  );
  return bi(
    `${lead[0]}And since we are telling the truth: ${en}${w.night === 0 ? ',' : ''} I saw ${a.short} coming back from ${FROM_EN[w.loc]}, before the shouting started. I said nothing. I did not want to end like Crane.`,
    `${lead[1]}И раз уж мы говорим правду: ${rus} я ${ru.gs(c, 'видел', 'видела')}, как ${ru.c(a)} ${ru.gs(a, 'возвращался', 'возвращалась')} ${ru.loc(w.loc, 'from')} — ещё до того, как поднялся крик. Я ${ru.gs(c, 'промолчал', 'промолчала')}. Мне не хотелось кончить как Крейн.`
  );
}
