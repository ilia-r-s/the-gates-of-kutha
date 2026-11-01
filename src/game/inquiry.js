const markSay = c => (c.mark === 'foe' ? __text('youMarkedThemASuspect') : c.mark === 'ally' ? __text('youMarkedThemAnAlly') : '');
function inquiryScene() {
  emit('inquiry');
  S.phase = 'inquiry';
  if (S.inqDay !== S.day) S.log.inq++;
  S.inqDay = S.day;
  const ch = freeChars().map(c => ({ label: __text('accuseA'), sub: () => markSay(c), cls: 'danger', fn: () => accuse(c.id) }));
  ch.push({
    label: __text('thinkBetterOfIt'),
    cls: 'minor',
    fn: () => {
      backedDown();
      goTo('camp');
    }
  });
  show({
    kicker: dayStamp(),
    title: __text('anInquiry'),
    body: [`<p>${bi(...TX.inquiry.youCallTheWhole())}</p>${angerSay()}<p class="dim">${bi(...TX.inquiry.nobodyIsSentAway())}</p>`],
    choices: ch
  });
}
function accuse(id) {
  const c = C(id);
  S.inquiryDone = true;
  S.act = 'accuse';
  const conf = inquiryConfession(),
    vote = campVote(c),
    hands = conf + voteLine(vote);
  if (!vote.passed) {
    emit('refused');
    endSlot(hands + refusedInquiry(c, vote), __text('theInquiry'));
    return;
  }
  fixMark(c);
  S.revealed[id] = c.role === 'cult' ? 'cult' : c.role === 'smuggler' ? 'smuggler' : 'innocent';
  emit('accuse', c.role === 'cult');
  S.log.accused.push({ id: id, day: S.day, right: c.role === 'cult' });
  const out = c.role === 'cult' ? unmasked(c, vote, hands) : sentAway(c, vote);
  if (out != null) endSlot(hands + out, __text('theInquiry2'));
}
function unmasked(c, vote, hands0 = '') {
  c.status = 'exposed';
  S.stats.right++;
  S.doom = Math.max(0, S.doom - vary(RULES.inquiry.doomRight));
  let out = bi(...TX.inquiry.underQuestioningBreaksIn(c));
  if (chance(RULES.inquiry.shout)) out += lineOr(S.patron, bi(...TX.inquiry.beforeTheLorryPulls(c)), '');
  Record.journal(__text('wasExposedAsACultist'));
  if (!freeCult().length) {
    lastOfThem(__text('dayTheInquiry'), [hands0 + out], c, 'inquiry');
    return null;
  }
  weighWord(c, vote, 'right');
  pullTo('still', TENOR.pulls.right);
  return out + stoodWithYou(vote) + Moments.stir('praised', { about: c.id, backed: vote.back }) + Moments.settle(c.id) + angerAfter(true);
}
function lastOfThem(kicker, body, c, how) {
  S.log.lastOne = { id: c.id, how: how };
  const watched = how === 'inquiry' ? [`<p>${bi(...TX.inquiry.theWholeCampComes())}</p>`] : [];
  if (chance(RULES.inquiry.tooLate * (S.doom >= RULES.start.doomWarn ? RULES.inquiry.tooLateNear : 1))) {
    show({
      kicker: kicker,
      title: __text('theGateIsOpening'),
      body: [...body, ...watched, `<p class="horror">${bi(...TX.inquiry.theLorryIsNot())}</p>`],
      choices: [{ label: __text('goToTheZiggurat'), cls: 'danger', fn: () => finaleIntro(true, 'priestless') }]
    });
    return;
  }
  momentBefore(
    {
      kicker: kicker,
      title: __text('theLastOfThem'),
      body: [
        ...body,
        ...watched,
        `<p>${how === 'inquiry' ? bi(...TX.inquiry.byEveningTheScorched()) : bi(...TX.inquiry.byNoonTheScorched())}</p>`
      ]
    },
    'exposed'
  );
}
function stoodWithYou(vote) {
  const ids = vote.back.filter(
    id => isFree(C(id)) && C(id).role !== 'cult' && C(id).rapport < RULES.scale.trustMax && chance(RULES.verdict.stood)
  );
  if (!ids.length) return '';
  ids.forEach(id => Ties.moveTrust(C(id), 1, 'deed'));
  const many = ids.length > 1;
  return `<p class="gain">${bi(...TX.inquiry.stoodWithYouAnd(ids, many))}</p>`;
}
function sentAway(c, vote) {
  grudgeOf(c);
  c.status = 'dismissed';
  S.stats.wrong++;
  S.doom += vary(RULES.inquiry.doomWrong);
  const watched = freeChars().length > 0;
  let out =
    c.role === 'smuggler'
      ? bi(...TX.inquiry.isNoCultistOnly(c))
      : bi(...TX.inquiry.answersEveryQuestionAnd(c, watched)) + hurt(RULES.inquiry.nerveWrong, 0, { k: 'wrong', id: c.id });
  Record.journal(bi(...TX.inquiry.wasSentAwayAfter(c)));
  if (c.role === 'smuggler' && thiefSaw(c) && chance(RULES.thief.sent))
    out += `<p class="event">${quoted(bi(...TX.inquiry.beforeTheLorryPulls2(c)), thiefNames(c, TX.inquiry.youWantAMurderer()))}</p>`;
  weighWord(c, vote, 'wrong');
  pullTo('tongues', TENOR.pulls.wrong);
  return (
    out +
    (watched ? Moments.stir('calledOut', { about: c.id, thief: c.role === 'smuggler' }) : '') +
    Moments.settle(c.id) +
    angerAfter(false)
  );
}
