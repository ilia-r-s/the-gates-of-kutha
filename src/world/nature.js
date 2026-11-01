// The same uncertain signs apply to everyone, without reading anybody's part.
// Only delivered observations enter the notebook. Rendering never rolls dice.
const NatureSigns = (() => {
  const scenes = __text('scenes'),
    luckWays = __text('luckWays'),
    ways = Object.keys(scenes),
    record = () => S.natureSigns || (S.natureSigns = []),
    probability = way => RULES.natureSigns.ordinary + RULES.natureSigns.signal * (NATURE[S.aspectOf[S.patron]][way] || 0);
  const arrives = Decisions.define({
      id: 'nature.arrives',
      action: 'deliver-sign',
      subject: 'world',
      object: (baseChance, channel) => channel,
      authority: 'world',
      knowledge: ['world-side sign-channel opportunity'],
      consequences: ['delivered observation'],
      probability: baseChance => baseChance
    }),
    image = Decisions.define({
      id: 'nature.image',
      action: 'resolve-sign-image',
      subject: () => S.patron,
      object: way => way,
      authority: 'world',
      knowledge: ['true nature generates a noisy image; this is not an NPC knowledge grant'],
      consequences: ['favorable or unfavorable image', 'journal entry'],
      probability
    });
  function tell(channel, way = null, person = null) {
    const baseChance = RULES.natureSigns.channel[channel],
      make = () => describe(channel, way, person);
    return ['omen', 'death', 'luck'].includes(channel)
      ? nightAtmosphere(baseChance, make)
      : arrives.roll(baseChance, channel)
        ? make()
        : '';
  }
  function describe(channel, way, person) {
    const K = RULES.natureSigns;
    if (!way) way = person ? K.temper[temperOf(person)] : pick(ways);
    if (!scenes[way]) return '';
    const good = image.roll(way),
      scene = scenes[way][good ? 'good' : 'bad'],
      en = scene[0],
      rus = scene[1],
      line =
        channel === 'tablet'
          ? __text('tablet')
          : channel === 'dream'
            ? __text('dream')
            : channel === 'death'
              ? __text('death')
              : channel === 'luck'
                ? __text('luck')
                : channel === 'action'
                  ? __text('action')
                  : __text('omen');
    const observation = { day: S.day, slot: S.slot, channel, way, good, by: person?.id || null, text: line };
    record().push(observation);
    if (channel === 'luck' && person) Knowledge.observedLuck(person, observation);
    Record.journal(line);
    return `<p class="${channel === 'dream' ? 'dream' : 'omen'}">${line}</p>`;
  }
  function action(kind) {
    // A conversation occupies one slot regardless of how many questions were
    // asked. Its last supported approach gets one sign opportunity on leaving.
    // Keep S.act as talk: it also describes the cause of harm during dialogue.
    if (kind === 'talk') kind = S.acts.findLast(a => a.day === S.day && a.slot === S.slot && RULES.natureSigns.action[a.kind])?.kind;
    return RULES.natureSigns.action[kind] ? tell('action', RULES.natureSigns.action[kind]) : '';
  }
  return { ways, record, probability, tell, action };
})();
