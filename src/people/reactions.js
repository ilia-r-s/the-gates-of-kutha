// An object's effect on a person starts with shared temperament, then a small
// non-stacking motive from that person's own knowledge. These are associations,
// not access to the effective ward, the real nature, or the player's visions.
const ObjectReactions = (() => {
  const features = {
      temper: 'string',
      trust: 'number',
      god: 'string',
      nature: 'string',
      ward: 'boolean',
      natureFear: 'boolean',
      natureWant: 'boolean',
      badLuck: 'boolean',
      goodLuck: 'boolean',
      vision: 'boolean',
      trade: 'boolean',
      witness: 'boolean'
    },
    motives = {
      fear: [
        ['ward', 'ward', 'remembered ward of the god they worship'],
        ['nature', 'natureFear', 'remembered nature and visible object form'],
        ['luck', 'badLuck', 'own recent ill luck'],
        ['vision', 'vision', 'own troubling dream'],
        ['witness', 'witness', 'own remembered night glimpse'],
        ['distrust', null, 'own distrust of the person presenting it']
      ],
      greed: [
        ['trade', 'trade', 'own trade and visible portable valuables'],
        ['nature', 'natureWant', 'remembered nature and visible object form'],
        ['luck', 'goodLuck', 'own recent good luck']
      ]
    };
  const define = kind =>
    Decisions.define({
      id: 'dialog.object.' + kind,
      action: kind === 'greed' ? 'covet-presented-object' : 'fear-presented-object',
      subject: c => c,
      object: (c, item) => item,
      authority: 'actor',
      knowledge: [
        'visible: the presented object’s material, form and portability',
        'self: temperament, trust, trade, own visions and remembered glimpses',
        'received: fallible initiation doctrine, and only personally experienced delivered luck',
        'inference: associations to an object may be mistaken; motives do not stack'
      ],
      consequences: ['reaction', 'testimony', 'reply'],
      features,
      observe: (c, item, known = Knowledge.objectBeliefs(c, item)) => known.observation,
      probability: odds('reacts with ' + kind + ' to a shown object', [
        ['base', c => TP(c)[kind]],
        ...motives[kind].map(([key, field, source]) => [
          'floor ' + source,
          (c, item, known = Knowledge.objectBeliefs(c, item)) => {
            const o = known.observation,
              present = field ? o[field] : o.trust < 0;
            return TP(c)[kind] * (1 + RULES.objectReaction.bias * RULES.objectReaction[kind][key] * Number(present));
          }
        ])
      ])
    });
  const greed = define('greed'),
    fear = define('fear');
  return {
    choose(c, item) {
      const known = Knowledge.objectBeliefs(c, item);
      return greed.roll(c, item, known) ? 'greed' : fear.roll(c, item, known) ? 'fear' : 'calm';
    },
    probabilities(c, item) {
      const known = Knowledge.objectBeliefs(c, item),
        g = greed.p(c, item, known),
        f = fear.p(c, item, known);
      return { greed: g, fear: (1 - g) * f, calm: (1 - g) * (1 - f) };
    }
  };
})();
