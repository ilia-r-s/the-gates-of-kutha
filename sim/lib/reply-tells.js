// Observe actual conversation replies once, after the shipped resolver returns.
// Roles are offline outcome labels, never inputs to the player's policy.
(function (root) {
  const topics = ['about', 'night', 'show', 'confide', 'press', 'distrust', 'title', 'diary'],
    categories = {
      positive: ['smile', 'warm', 'coy', 'smirk', 'wink', 'arch', 'demure', 'sultry'],
      threatened: ['sad', 'fear'],
      hostile: ['angry', 'cold'],
      neutral: ['neutral', 'thoughtful', 'surprised', 'glance']
    },
    name = (topic, category) => `actual reply expression ${category} / ${topic}`,
    rows = topics.flatMap(topic => Object.keys(categories).map(category => name(topic, category))),
    categoryOf = mood => Object.keys(categories).find(category => categories[category].includes(mood));
  function install(counts, aliases, moods) {
    for (const mood of moods) if (!categoryOf(mood)) throw Error('Unclassified rendered reply mood: ' + mood);
    for (const row of rows) counts.ensure(row);
    const original = root.askOf,
      coverage = {},
      observed = {};
    if (typeof original !== 'function') throw Error('Actual reply instrumentation requires askOf');
    const increment = key => (coverage[key] = (coverage[key] || 0) + 1);
    root.askOf = function (c, conv, topic) {
      const reply = original.apply(this, arguments);
      if (!topics.includes(topic)) throw Error('Undeclared actual reply topic: ' + topic);
      // This is moodNow's normalization, using the shipped alias and mood tables.
      // Never call faceFor/replyFace again or temporarily alter the conversation.
      const raw = aliases[reply.face] || reply.face,
        mood = moods.includes(raw) ? raw : 'neutral',
        category = categoryOf(mood),
        group = c.role === 'cult' ? 'cult' : 'innocent',
        key = topic + '/' + group;
      observed[key] = (observed[key] || 0) + 1;
      increment('actual replies');
      increment('actual replies/' + key);
      increment('actual reply categories/' + category);
      // Descriptive exact-mood totals, not additional confirmatory comparisons.
      increment('actual reply moods/' + key + '/' + mood);
      if (mood !== raw) increment('actual reply render fallbacks');
      for (const candidate of Object.keys(categories)) counts.add(name(topic, candidate), group, candidate === category);
      return reply;
    };
    return {
      coverage,
      stop() {
        root.askOf = original;
        for (const topic of topics)
          for (const group of ['cult', 'innocent']) {
            const total = observed[topic + '/' + group] || 0,
              counted = Object.keys(categories).map(category => counts.table[name(topic, category)].totals[group] || [0, 0]);
            if (counted.some(([, n]) => n !== total) || counted.reduce((n, [hits]) => n + hits, 0) !== total)
              throw Error('Actual reply opportunities or exclusive categories were lost: ' + topic + '/' + group);
          }
      }
    };
  }
  const api = { topics, categories, rows, categoryOf, install };
  if (typeof module !== 'undefined') module.exports = api;
  else root.__replyTells = api;
})(globalThis);
