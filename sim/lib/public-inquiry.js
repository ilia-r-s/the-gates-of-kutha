// The policy reads offered labels and a printed second-voice sentence. It cannot
// inspect roles, internal influence records, suspicions or whether a vote is wrong.
(function (root) {
  function publicInquiry(random) {
    const human = __T.policies.human(random, /Ask where they were|Ask whom they distrust|Make conversation|Speak with/);
    let heardTarget = null;
    return buttons => {
      const o = __T.observe(buttons),
        lang = LANG;
      let body;
      try {
        LANG = 'en';
        body = String(X((S_ui.scene?.body || []).join(' '))).replace(/<[^>]*>/g, '');
      } finally {
        LANG = lang;
      }
      const heard = body.match(/returns to what [^.]+ said about ([^.]+)\. “There may be something in it\.”/);
      if (heard) heardTarget = heard[1];
      if (heardTarget) {
        const pick = re => buttons[o.choices.findIndex(c => re.test(c))];
        if (o.phase === 'plan' && o.slot === 2) {
          const camp = pick(/Expedition camp/);
          if (camp) return camp;
        }
        const inquiry = pick(/Convene an inquiry/);
        if (inquiry) return inquiry;
        if (o.phase === 'inquiry') {
          const target = buttons[o.choices.findIndex(c => /Accuse/.test(c) && c.includes(heardTarget))];
          if (target) return target;
          heardTarget = null;
        }
      }
      return human(buttons);
    };
  }
  root.__publicInquiry = publicInquiry;
})(globalThis);
