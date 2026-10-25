// ===================== TEMPERAMENTS: how each person lies, blames and talks =====================
// Everyone is dealt a temperament each game, whatever their part in the story. It decides how readily they lie and
// whom they blame, whether a liar can keep a story going to the end, and how much of what they say about others is
// true; and how a cultist goes about it: an honest cultist lies only where the cult needs a lie, a calculating one
// tells the truth whenever the truth serves.
// The seven temperaments and their numbers are in rules.js. Here: their names, dealing them, and how they show: in a
// person's manner, and in what others say of them.
const TEMPER_NAMES = {
  honest: ['honest', 'прямодушный', 'прямодушная'],
  conscientious: ['conscientious', 'совестливый', 'совестливая'],
  liar: ['a liar', 'лгун', 'лгунья'],
  calculating: ['calculating', 'расчётливый', 'расчётливая'],
  detached: ['detached', 'отстранённый', 'отстранённая'],
  lightheaded: ['light-headed', 'легкомысленный', 'легкомысленная'],
  suspicious: ['suspicious', 'мнительный', 'мнительная']
};
const temperOf = c => S.temper[typeof c === 'string' ? c : c.id];
const TP = c => TEMPERS[temperOf(c)];
const temperName = (k, c) => bi(TEMPER_NAMES[k][0], TEMPER_NAMES[k][ru.f(c) ? 2 : 1]);
// how someone feels about you, in a word
const FEEL_NAMES = {
  3: ['devoted', 'предан', 'предана'],
  2: ['fond', 'расположен', 'расположена'],
  1: ['friendly', 'дружелюбен', 'дружелюбна'],
  0: ['indifferent', 'равнодушен', 'равнодушна'],
  '-1': ['cool', 'холоден', 'холодна'],
  '-2': ['hostile', 'враждебен', 'враждебна']
};
const feelName = c => {
  const f = FEEL_NAMES[trustOf(c)];
  return bi(f[0], f[ru.f(c) ? 2 : 1]);
};
function assignTempers() {
  S.temper = {};
  S.order.forEach(id => {
    S.temper[id] = pick(TEMPER_IDS);
  });
}
// ---------- what you notice of someone's manner, once, if you talk long enough ----------
const TEMPER_SEE = {
  honest: [
    c =>
      bi(
        `${c.short} tells you plainly what ${c.p} thinks of your trench sections, which is not much.`,
        `${ru.c(c)} прямо говорит, что думает о ваших разрезах траншеи, — а думает ${ru.gs(c, 'он', 'она')} о них немного.`
      ),
    c =>
      bi(
        `${c.short} answers every question straight, even the ones that cost ${EP.him(c)} something.`,
        `${ru.c(c)} отвечает на каждый вопрос прямо — даже на те, что ${ru.gs(c, 'ему', 'ей')} чего-то стоят.`
      )
  ],
  conscientious: [
    c =>
      bi(
        `${c.short} apologises twice for keeping you waiting, though you were not kept waiting.`,
        `${ru.c(c)} дважды извиняется, что ${ru.gs(c, 'заставил', 'заставила')} вас ждать, хотя вы и не ждали.`
      ),
    c =>
      bi(
        `${c.short} returns a pencil borrowed from you on the first day, sharpened.`,
        `${ru.c(c)} возвращает карандаш, взятый у вас в первый день, — заточенным.`
      )
  ],
  liar: [
    c =>
      bi(
        `${c.short} tells you a story about Basra. By the end of it, it happened in Mosul, to somebody else.`,
        `${ru.c(c)} рассказывает вам историю про Басру. К концу рассказа всё это случилось уже в Мосуле и не с ${ru.gs(c, 'ним', 'ней')}.`
      ),
    c =>
      bi(
        `${c.short} has never been to Egypt, ${c.p} says, and then describes Shepheard’s Hotel down to the carpets.`,
        `${ru.c(c)} уверяет, что никогда не ${ru.gs(c, 'бывал', 'бывала')} в Египте, — а потом описывает отель «Шепердс» вплоть до ковров.`
      )
  ],
  calculating: [
    c =>
      bi(
        `${c.short} asks you more questions than you ask ${EP.him(c)}, and listens very closely to the answers.`,
        `${ru.c(c)} задаёт вам больше вопросов, чем вы ${ru.gs(c, 'ему', 'ей')}, и очень внимательно слушает ответы.`
      ),
    c =>
      bi(
        `${c.short} agrees with everything you say, a moment before you say it.`,
        `${ru.c(c)} соглашается со всем, что вы говорите, — за мгновение до того, как вы это скажете.`
      )
  ],
  detached: [
    c =>
      bi(
        `${c.short} seems to be listening to something much farther off than you.`,
        `${ru.c(c)} будто прислушивается к чему-то, что гораздо дальше вас.`
      ),
    c =>
      bi(
        `${c.short} answers what you ask and not a word more, and never asks why you asked.`,
        `${ru.c(c)} отвечает ровно на то, о чём вы спросили, — ни словом больше — и никогда не спрашивает зачем.`
      )
  ],
  lightheaded: [
    c => bi(`${c.short} starts three stories and finishes none of them.`, `${ru.c(c)} начинает три истории и не заканчивает ни одной.`),
    c =>
      bi(
        `${c.short} cannot remember whether it was Tuesday or Wednesday, and decides it does not matter.`,
        `${ru.c(c)} не может вспомнить, был это вторник или среда, и решает, что это неважно.`
      )
  ],
  suspicious: [
    c =>
      bi(`${c.short} keeps glancing at the tent flap while you talk.`, `Пока вы говорите, ${ru.c(c)} то и дело косится на полог палатки.`),
    c =>
      bi(
        `${c.short} wants to know whom else you have spoken to today, and in what order.`,
        `${ru.c(c)} хочет знать, с кем ещё вы сегодня говорили — и в каком порядке.`
      )
  ]
};
// Your impression of someone's manner, once: true to their temperament, mostly; now and then you read them wrong
// (talk.mienWrong, the more readily the less their feelings show: MANNER.shows), and the ending says so.
function mienNote(c, p = RULES.talk.mien) {
  if (S.testimony.some(t => t.kind === 'mien' && t.from === c.id) || !chance(p)) return null;
  const own = temperOf(c),
    k = chance(RULES.talk.mienWrong / MANNER[own].shows) ? pick(TEMPER_IDS.filter(x => x !== own)) : own;
  addTest(c.id, c.id, 'mien', k);
  return pick(TEMPER_SEE[k])(c);
}
// ---------- gossip: what people say of each other, true or slanted by their likes ----------
// (three ways each, told in turn without repeats: core/text.js, tellOne)
const TEMPER_SAID = {
  honest: [
    t =>
      bi(
        `${t.short}? ${EP.He(t)} could not tell a lie to save ${t.pp} life.`,
        `${ru.c(t)}? ${ru.gs(t, 'Он', 'Она')} и ради спасения жизни не ${ru.gs(t, 'смог', 'смогла')} бы солгать.`
      ),
    t =>
      bi(
        `Ask ${t.short} anything you like. You will get the answer, whether you wanted it or not.`,
        `Спросите ${ru.c(t, 'a')} о чём угодно — получите ответ, хотите вы того или нет.`
      ),
    t =>
      bi(
        `${t.short} tells the truth the way other people sneeze: without meaning to, and at the worst moment.`,
        `${ru.c(t)} говорит правду так, как другие чихают: невольно и в самый неподходящий момент.`
      )
  ],
  conscientious: [
    t =>
      bi(
        `${t.short} frets over every little thing. Asks forgiveness for the weather.`,
        `${ru.c(t)} изводится из-за каждой мелочи. ${ru.gs(t, 'Готов', 'Готова')} просить прощения за погоду.`
      ),
    t =>
      bi(
        `${t.short} checks the finds register three times before bed, and once more in the night.`,
        `${ru.c(t)} трижды сверяет журнал находок перед сном — и ещё раз ночью.`
      ),
    t =>
      bi(
        `If anything goes wrong at Kutha, ${t.short} will be sure it was ${t.pp} fault.`,
        `Что бы ни стряслось в Куте, ${ru.c(t)} будет ${ru.gs(t, 'уверен', 'уверена')}, что это ${ru.gs(t, 'его', 'её')} вина.`
      )
  ],
  liar: [
    t =>
      bi(
        `Do not believe half of what ${t.short} tells you. ${EP.He(t)} does not believe it either.`,
        `Не верьте и половине того, что вам рассказывает ${ru.c(t)}. ${ru.gs(t, 'Он', 'Она')} и ${ru.gs(t, 'сам', 'сама')} в это не верит.`
      ),
    t =>
      bi(
        `${t.short} has told me three different stories about the war. All of them were good.`,
        `${ru.c(t)} ${ru.gs(t, 'рассказывал', 'рассказывала')} мне о войне три разные истории. И все три — хорошие.`
      ),
    t =>
      bi(
        `${t.short} lies the way a cat steals: not for need, for practice.`,
        `${ru.c(t)} лжёт, как кошка ворует: не от нужды, а для практики.`
      )
  ],
  calculating: [
    t =>
      bi(
        `${t.short} always knows what you want to hear. That is the dangerous kind.`,
        `${ru.c(t)} всегда знает, что вы хотите услышать. Таких-то и стоит опасаться.`
      ),
    t =>
      bi(
        `${t.short} never says a word that has not been weighed first. You can hear the scales.`,
        `${ru.c(t)} не скажет ни слова, не взвесив его. Так и слышно, как скрипят весы.`
      ),
    t =>
      bi(
        `${t.short} is pleasant to everyone. Ask yourself what it buys ${EP.him(t)}.`,
        `${ru.c(t)} со всеми ${ru.gs(t, 'любезен', 'любезна')}. Спросите себя, что это ${ru.gs(t, 'ему', 'ей')} даёт.`
      )
  ],
  detached: [
    t =>
      bi(
        `${t.short} lives somewhere else, I think. Only the body comes to dinner.`,
        `${ru.c(t)}, по-моему, живёт где-то в другом месте. К ужину приходит только тело.`
      ),
    t =>
      bi(
        `${t.short} could sit through an earthquake and ask afterwards whether anything had happened.`,
        `${ru.c(t)} ${ru.gs(t, 'мог', 'могла')} бы просидеть землетрясение, а потом спросить, не случилось ли чего.`
      ),
    t =>
      bi(
        `Talking to ${t.short} is like writing to someone abroad: the answer comes, eventually.`,
        `Говорить с ${ru.c(t, 'i')} — всё равно что писать за границу: ответ приходит, но не сразу.`
      )
  ],
  lightheaded: [
    t =>
      bi(
        `${t.short} would lose ${t.pp} head if it were not fixed on, God bless ${EP.him(t)}.`,
        `${ru.c(t)} и голову бы где-нибудь ${ru.gs(t, 'забыл', 'забыла')}, не будь она пришита, — храни ${ru.gs(t, 'его', 'её')} Господь.`
      ),
    t =>
      bi(
        `${t.short} laughs at everything, which is a gift out here, if a tiring one.`,
        `${ru.c(t)} смеётся надо всем — здесь это дар, пусть и утомительный.`
      ),
    t =>
      bi(
        `${t.short} has fallen in love with Kutha three times this week, and out of it twice.`,
        `${ru.c(t)} за эту неделю трижды ${ru.gs(t, 'влюблялся', 'влюблялась')} в Куту и дважды ${ru.gs(t, 'остывал', 'остывала')}.`
      )
  ],
  suspicious: [
    t =>
      bi(
        `${t.short} thinks we are all in it together. Probably thinks it of you.`,
        `${ru.c(t)} думает, что мы все тут заодно. Наверное, и про вас так думает.`
      ),
    t =>
      bi(
        `${t.short} counts the spoons after every meal. Twice, lately.`,
        `${ru.c(t)} после каждой трапезы пересчитывает ложки. В последнее время — дважды.`
      ),
    t =>
      bi(
        `${t.short} sleeps with a chair against the tent pole. Ask ${EP.him(t)} why, if you like being looked at.`,
        `${ru.c(t)} спит, приставив стул к шесту палатки. Спросите ${ru.gs(t, 'его', 'её')} почему — если любите, когда на вас так смотрят.`
      )
  ]
};
const NEG = ['liar', 'calculating', 'suspicious'],
  POS = ['honest', 'conscientious'];
