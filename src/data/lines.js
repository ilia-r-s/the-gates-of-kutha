// ===================== LINES: what people say, as tables =====================
// The English of everyday conversation. Russian in i18n/ru-talk.js.
const GREET = {
  hamid: [
    'Doctor. The men are digging well today, God willing.',
    'Peace be upon you, Doctor. You want me?',
    'Doctor. The baskets are moving. What can I do for you?',
    'Ah, Doctor. Come out of the sun.'
  ],
  anselm: [
    'Ah, Doctor. Come, sit. The light is kind at this hour.',
    'Doctor. I was just copying a colophon. It can wait.',
    'Doctor. Pax tecum. You have the look of a question.',
    'Ah. Come in out of the glare, Doctor.'
  ],
  constance: [
    'Hold still. No, I’m joking. What is it?',
    'Doctor. You look like someone in want of a cigarette, and a little bad company. Sit.',
    'Doctor. Mind the tripod.',
    'There you are. I was about to photograph the flies for want of better subjects.'
  ],
  ashby: [
    'Doctor. Everything in order, I trust?',
    'Ah. The new director. What can I do for you?',
    'Doctor. Making progress, one hopes?',
    'Ah, Doctor. Sit, if you can find a chair that isn’t full of sand.'
  ],
  yusuf: [
    'Doctor! Sit, sit. Tea is coming.',
    'Doctor. Always a pleasure, rarely a profit.',
    'Doctor! Welcome, welcome. Are you buying, or asking?',
    'Doctor. Sit. In this heat even the merchants rest.'
  ],
  ilse: [
    'Doctor. I am busy, but go on.',
    'Yes? If it is about the tablets, they are in order.',
    'Doctor. You are standing in my light.',
    'Doctor. Quickly, please: the clay is drying.'
  ],
  zahrun: [
    'Peace to you, Doctor. Sit in the shade.',
    'Doctor. You have walked far in the heat.',
    'Doctor. May the Life be with you. Sit.',
    'Peace, Doctor. The silver can wait a little.'
  ]
};
// greetings from someone who has come to trust you (trust 2 or more), and from someone who has turned against you
const GREET_WARM = {
  hamid: [
    'Doctor! Sit, sit. I have saved you the shade.',
    'Ah, Doctor. The men ask after you. So do I.',
    'Doctor, my friend. Sit; the boy will bring tea.'
  ],
  anselm: [
    'Doctor, my friend. I was hoping you would come by.',
    'Ah, there you are. I have a colophon you will enjoy.',
    'Doctor! Just the person. I have been saving a riddle for you.'
  ],
  constance: [
    'There you are. I was beginning to miss the company.',
    'Doctor. Come and stand in my light. I mean that kindly.',
    'Doctor! Rescue me from the darkroom fumes for five minutes.'
  ],
  ashby: [
    'Doctor! Splendid. Sit down, there’s a drop of whisky left.',
    'Ah, Doctor. A friendly face at last, thank God.',
    'Doctor! Thank God. Come and save me from the Residency’s letters.'
  ],
  yusuf: [
    'Doctor, my friend! For you, the good tea.',
    'Doctor! I was just saying to myself: Yusuf, where is the Doctor?',
    'Doctor! My best customer, and I have sold you nothing.'
  ],
  ilse: [
    'Doctor. Good. I wanted someone sensible to talk to.',
    'Ah, it is you. Sit. I will make room.',
    'Doctor. Good, it is you. Sit; the others are all idiots today.'
  ],
  zahrun: [
    'Peace and light to you, Doctor. Sit by me.',
    'Doctor. The Great Life sends me good company today.',
    'Doctor, light of my afternoon. Sit, sit.'
  ]
};
const GREET_COLD = {
  hamid: ['Doctor. The men are busy. So am I.', 'What is it now?', 'Doctor. Be quick; the men are watching.'],
  anselm: ['Doctor. I am at my prayers. Be brief.', 'Yes? I have little time today.', 'Doctor. I will listen, since charity requires it.'],
  constance: [
    'Oh. It’s you.',
    'If this is another interrogation, I’d rather have the flies.',
    'Make it quick. The light won’t wait, and neither will I.'
  ],
  ashby: ['Doctor. I trust this is important.', 'Ah. You again.', 'Doctor. I have reports to write. One of them may be about you.'],
  yusuf: [
    'Doctor. The tea is finished, I am afraid.',
    'Business is slow today, Doctor. Very slow.',
    'Doctor. My prices have gone up. For you especially.'
  ],
  ilse: ['What do you want?', 'I have nothing to say to you, Doctor. But say what you came to say.', 'You again. Ask, then go.'],
  zahrun: ['Doctor. Say what you must.', 'You have come again. Speak, then.', 'Doctor. I am listening. That is all.']
};
// a woman with a soft spot for you, while she trusts you (people/flirt.js)
const GREET_FLIRT = {
  constance: [
    'There you are. I was beginning to think you had found someone else to bother.',
    'Doctor. You have dust on your collar. No, hold still. Let me.',
    'I have been saving the good light for you. Don’t waste it.'
  ],
  ilse: [
    'Doctor. I was looking for an excuse to stop working. You will do very well.',
    'You again. I find I do not mind.',
    'Sit down before someone else takes the chair. I kept it for you, though I will deny it.'
  ]
};
const SMALLTALK = {
  hamid: [
    'Thirty years I dig. Assur, Babylon, now here. The earth is the same everywhere. Only the masters change.',
    'My son wants to be a clerk in Baghdad. Clean hands. I tell him the earth is cleaner than a ledger.',
    'The men respect the mound. So do I. We dig carefully, we sing, we go home before dark.',
    'My wife says I love the trench more than I love her. I tell her the trench does not argue.'
  ],
  anselm: [
    'At the École we say a tablet is a letter that has waited for us. These have waited four thousand years.',
    'I came to the East for the languages and stayed for the silences.',
    'Most of what we find here is school work. Children copying signs, badly. It is very moving.',
    'People ask whether I miss having a wife. I tell them I am married to a dead language. She is very demanding.'
  ],
  constance: [
    'After Ypres, ruins are easy. They don’t move and they don’t ask you for anything.',
    'The light here is impossible. White at noon, gold at five, then gone like a blown lamp.',
    'My mother wanted me to marry a solicitor in Bath. I bought a Kodak instead.',
    'A colonel in Simla once proposed to me by heliograph. I signalled back that the light was poor.'
  ],
  ashby: [
    'Twelve years out here. One learns to like the heat, or one learns to drink.',
    'The High Commission wants a quiet season. So do I. Quiet seasons look marvellous in reports.',
    'I was at Ctesiphon in ’15. Don’t ask me about it, Doctor, if it’s all the same to you.',
    'My wife left me for a tea planter in Ceylon. Jolly good luck to the tea.'
  ],
  yusuf: [
    'My grandfather sold seals to the English, my father to the Germans. I sell to whoever pays in sterling.',
    'Baghdad is changing. A king, a parliament, motorcars. Old things go cheap.',
    'I translate for everyone and belong to no one. It is a restful way to live.',
    'In Baghdad three aunts are trying to marry me to three cousins. I came to the desert for the peace.'
  ],
  ilse: [
    'Koldewey taught me to dig mudbrick with a knife, like cutting cake. The English use shovels.',
    'My permit expires in May. After that I am a German woman in Iraq with no reason to be here.',
    'Crane was careless with his notes, but he could read a section. I will give him that.',
    'In Berlin they ask me why a woman would dig in the desert. I tell them the men here are four thousand years old, and quiet.'
  ],
  zahrun: [
    'Silver is honest. It tarnishes when it is lied to.',
    'My people baptise in living water. The canal is barely living, but it will do.',
    'In Amara my brother makes the bracelets. I make the rings. Rings are harder. They must close perfectly.',
    'Four times my mother has found me a bride in Amara. Four times I have found a reason to be in Baghdad.'
  ]
};
// Lines that joke about love and marriage: told with a sly face, mostly (people/manner.js).
const JOKES = new Set([
  'Doctor. You look like someone in want of a cigarette, and a little bad company. Sit.',
  'My wife says I love the trench more than I love her. I tell her the trench does not argue.',
  'People ask whether I miss having a wife. I tell them I am married to a dead language. She is very demanding.',
  'My mother wanted me to marry a solicitor in Bath. I bought a Kodak instead.',
  'A colonel in Simla once proposed to me by heliograph. I signalled back that the light was poor.',
  'My wife left me for a tea planter in Ceylon. Jolly good luck to the tea.',
  'In Baghdad three aunts are trying to marry me to three cousins. I came to the desert for the peace.',
  'In Berlin they ask me why a woman would dig in the desert. I tell them the men here are four thousand years old, and quiet.',
  'Four times my mother has found me a bride in Amara. Four times I have found a reason to be in Baghdad.'
]);
// Plain greetings in a hurry: after one of them, a third question allowed is not told as their being in no hurry today
// (ui/talk.js, talkAfter).
const HURRIED = new Set(['Doctor. I am busy, but go on.', 'Doctor. Quickly, please: the clay is drying.']);
const WIT = {
  hob: 'hobnails on the brick',
  riding: 'soft boots, riding boots I think',
  sandal: 'the hush of rope sandals',
  brogue: 'the click of town shoes',
  turkish: 'a Turkish cigarette',
  pipe: 'pipe smoke',
  cheroot: 'cheroot smoke',
  tumbak: 'the sweet smoke of a water-pipe',
  rose: 'attar of roses',
  hypo: 'hypo, the darkroom smell',
  bitumen: 'bitumen, like hot tar',
  carbolic: 'carbolic soap'
};
const SENSE = { prints: 'I heard', ash: 'I smelled', scent: 'I smelled' };
const REACT_SAY = {
  fear: ['Where did you find that?', 'Put it away, would you? The men talk.', 'Hm. Late, I think. Not very fine.'],
  calm: ['Remarkable. May I?', 'Look at the cutting. Somebody careful made this.', 'The museum will want that.'],
  greed: ['In Baghdad that would fetch forty pounds. In Paris, more.']
};
// ({it}, {they}: the thing set on the table, one or two of them)
const REACT_NOTE = {
  fear: [
    '{n} looks at {it} a moment too long, then away.',
    '{n} sets {it} down a little too carefully, as if {they} might wake.',
    '{n} does not touch {it}.'
  ],
  calm: [
    '{n} turns {it} over with ordinary curiosity.',
    '{n} holds {it} to the light the way a scholar would.',
    '{n} hands {it} back without much interest.'
  ],
  greed: ['{n} weighs {it} in one palm, like a dealer.']
};
// the same, for a line you copied from the tablets, shown in your notebook
const REACT_WORDS_SAY = {
  fear: ['Where did you copy that from?', 'Close the book, Doctor. Please.', 'That is better not read aloud, Doctor.'],
  calm: [
    'May I see? Your hand is hard to read.',
    'So that is what the tablets say. Or what you think they say.',
    'Crane used to fill notebooks like that.'
  ],
  greed: ['A tablet that says that much would fetch a good price in Baghdad.']
};
const REACT_WORDS_NOTE = {
  fear: [
    '{n} reads it a moment too long, then looks away.',
    '{n} pushes the notebook back across the table.',
    '{n} will not look at the page.'
  ],
  calm: [
    '{n} runs a finger along the line with ordinary curiosity.',
    '{n} reads it the way a scholar would.',
    '{n} hands the notebook back without much interest.'
  ],
  greed: ['{n} looks at the page the way a dealer looks at a price.']
};
const CONFIDE_SAY = [
  'I wondered when you would ask.',
  'Not here. But yes. Something is wrong in this place.',
  'I’m glad you told me. I thought it was only me.',
  'Then be careful whom else you tell.'
];
const CLAIM_YOU = [
  [
    'Crane wrote that one of you dreams true, and one keeps watch. Which, if either, are you?',
    'Крейн писал, что один из вас видит вещие сны, а другой стоит на страже. Кто из них вы — если кто-то?'
  ],
  [
    'Crane’s diary speaks of a Dreamer and a Watcher among you. Is either of them you?',
    'В дневнике Крейна говорится о сновидце и о страже. Не о вас ли речь?'
  ]
];
