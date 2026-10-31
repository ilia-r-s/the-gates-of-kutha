// Role-specific claims, answers and strategies.
const Parts = (() => {
  const PLAYBOOK = {
    anyone: {
      claim: (c, t, honest) => CLAIM_AS.anyone(c, t, honest),
      name: (c, others, g) => anyoneNames(c, others, g),
      nameAloud: (s, others) => innocentBlames(s, others),
      dream: c => fakeDream(c),
      pressed: (c, ok, you, before) => pressedAnyone(c, ok, you, before)
    },
    cult: {
      claim: (c, t, honest) => CLAIM_AS.cult(c, t, honest),
      name: (c, others, g) => cultNames(c, others, g),
      nameAloud: (s, others) => cultNamesAloud(s, others),
      dream: c => cultDream(c),
      pressed: (c, ok, you, before) => pressedCult(c, ok, you, before),
      lieLow: night => liesLow(night),
      victim: night => chooseVictim(night)
    },
    seer: { claim: (c, t, honest) => CLAIM_AS.seer(c, t, honest) },
    warden: {
      claim: (c, t, honest) => CLAIM_AS.warden(c, t, honest),
      watch: night => Watch.choose(night)
    },
    smuggler: {
      claim: (c, t, honest) => CLAIM_AS.smuggler(c, t, honest),
      pressed: (c, ok, you, before) => pressedThief(c, ok, you, before)
    }
  };
  const move = (c, point) => (PLAYBOOK[c.role] && PLAYBOOK[c.role][point]) || PLAYBOOK.anyone[point];
  return { move: move, of: role => PLAYBOOK[role] };
})();
