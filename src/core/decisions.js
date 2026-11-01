// Ordered decisions, typed consequences and an opt-in serialized experiment boundary.
// Definitions own no expedition state. Normal play uses the existing probability
// and consequence owners; observation/logging never reruns a probability formula.
const Decisions = (() => {
  const schema = 1,
    rules = new Map();
  let policy = null,
    record = null,
    sequence = 0;
  const entity = (value, args) => {
    const x = typeof value === 'function' ? value(...args) : value;
    return x == null ? null : typeof x === 'string' ? x : x.id;
  };
  const describe = spec => ({
    id: spec.id,
    mode: spec.probability ? 'chance' : spec.offer ? 'choice' : 'command',
    action: spec.action,
    authority: spec.authority,
    knowledge: [...spec.knowledge],
    consequences: [...(spec.consequences || [])],
    influences: [...(spec.probability?.steps || [])],
    features: { ...spec.features },
    experiment: !!spec.observe && !!(spec.probability || spec.offer)
  });
  function define(spec) {
    if (!spec.id || rules.has(spec.id) || !spec.action || !['actor', 'world', 'legacy'].includes(spec.authority) || !spec.knowledge?.length)
      throw Error('Invalid or duplicate decision: ' + spec.id);
    if (spec.subject == null || (!spec.probability && !spec.execute)) throw Error('Incomplete decision: ' + spec.id);
    if (spec.probability && spec.execute) throw Error('A decision must have one resolver: ' + spec.id);
    if (spec.offer && (!spec.observe || !spec.execute || typeof spec.accept !== 'function' || typeof spec.selection !== 'function'))
      throw Error('Incomplete choice contract: ' + spec.id);
    if (spec.authority !== 'actor' && spec.observe) throw Error('Only audited actor decisions can expose a policy observation: ' + spec.id);
    if (
      spec.observe &&
      (!spec.features || Object.values(spec.features).some(t => !['number', 'string', 'boolean', 'boolean?'].includes(t)))
    )
      throw Error('Missing or invalid observation contract: ' + spec.id);
    rules.set(spec.id, spec);
    const probability = spec.probability,
      p = (...args) => (typeof probability === 'function' ? probability(...args) : probability.p(...args)),
      roll = (...args) =>
        typeof probability === 'function' ? resolveChance(spec, probability(...args), args) : probability.rollFor(spec, ...args);
    return {
      id: spec.id,
      name: probability?.name || spec.action,
      ...(probability ? { p, roll } : {}),
      run(...args) {
        if (spec.execute) return command(spec, args);
        const yes = roll(...args);
        return spec.apply ? spec.apply(yes, ...args) : yes;
      }
    };
  }
  function observation(spec, args) {
    const value = spec.observe(...args);
    if (
      !value ||
      Array.isArray(value) ||
      Object.keys(value).length !== Object.keys(spec.features).length ||
      Object.entries(spec.features).some(([key, type]) => {
        const v = value[key];
        return type === 'boolean?' ? v !== null && typeof v !== 'boolean' : typeof v !== type || (type === 'number' && !Number.isFinite(v));
      })
    )
      throw Error('Invalid actor observation: ' + spec.id);
    return value;
  }
  function response(spec, request, field) {
    const raw = policy(JSON.stringify(request));
    if (raw == null) return null;
    if (typeof raw !== 'string') throw Error('Policy must return serialized JSON or null: ' + spec.id);
    const result = JSON.parse(raw);
    if (
      !result ||
      result.schema !== schema ||
      result.decision !== spec.id ||
      Object.keys(result).some(k => !['schema', 'decision', field].includes(k))
    )
      throw Error('Invalid policy response: ' + spec.id);
    return result;
  }
  function command(spec, args) {
    if (!policy && !record) return spec.execute(...args);
    const subject = entity(spec.subject, args),
      object = entity(spec.object, args),
      baseline = spec.selection ? spec.selection(...args) : null;
    let accepted = null,
      chosen = args;
    if (policy && spec.offer && (!spec.canExperiment || spec.canExperiment(...args))) {
      const choices = spec.offer(...args),
        request = {
          schema,
          mode: 'choice',
          decision: spec.id,
          subject,
          action: spec.action,
          object,
          observation: observation(spec, args),
          choices
        };
      accepted = response(spec, request, 'choice');
      if (accepted) {
        if (typeof accepted.choice !== 'string' || !choices.some(c => c.id === accepted.choice))
          throw Error('Policy chose an unavailable action: ' + spec.id);
        chosen = spec.accept(accepted.choice, ...args);
      }
    }
    // Record the accepted selection before nested consequences make their own
    // requests. This is an attempted command, not a claim that it will succeed.
    if (record)
      record(
        JSON.stringify({
          schema,
          mode: spec.offer ? 'choice' : 'command',
          phase: 'selected',
          sequence: sequence++,
          decision: spec.id,
          subject,
          action: spec.action,
          object,
          authority: spec.authority,
          baseline,
          selected: accepted?.choice ?? baseline,
          accepted
        })
      );
    return spec.execute(...chosen);
  }
  function resolveChance(spec, baseline, args, why = null) {
    if (!policy && !record) return chance(baseline);
    const subject = entity(spec.subject, args),
      object = entity(spec.object, args);
    let probability = baseline,
      accepted = null;
    // Only explicitly audited observations can reach an external actor policy.
    // No episode seed, RNG state, baseline odds or privileged label is an input.
    if (policy && spec.observe && baseline > 0) {
      const request = {
          schema,
          mode: 'chance',
          decision: spec.id,
          subject,
          action: spec.action,
          object,
          observation: observation(spec, args),
          outcomes: ['apply', 'skip'],
          bounds: [RULES.scale.rarest, RULES.scale.surest]
        },
        result = response(spec, request, 'probability');
      if (result) {
        if (!Number.isFinite(result.probability) || result.probability < RULES.scale.rarest || result.probability > RULES.scale.surest)
          throw Error('Invalid policy response: ' + spec.id);
        probability = result.probability;
        accepted = result;
      }
    }
    const result = chance(probability);
    if (record)
      record(
        JSON.stringify({
          schema,
          mode: 'chance',
          sequence: sequence++,
          decision: spec.id,
          subject,
          action: spec.action,
          object,
          authority: spec.authority,
          baseline,
          probability,
          result,
          accepted,
          influences: why,
          day: S?.day ?? null,
          slot: S?.slot ?? null
        })
      );
    return result;
  }
  // These operations keep their existing clamping, caps and return values.
  // They are applied immediately, so later listeners see earlier consequences.
  function effect(kind, subject, object, amount, mode) {
    if (kind === 'trust') return Ties.moveTrust(typeof subject === 'string' ? C(subject) : subject, amount, mode);
    if (kind === 'like') return Ties.shiftLike(subject, object, amount);
    if (kind === 'suspicion') return Suspicion.move(subject, object, amount);
    if (kind === 'hounding') return Ties.hound(subject, amount);
    throw Error('Unknown consequence: ' + kind);
  }
  // Trusted host tooling supplies separate JSON-only policy and evaluator channels.
  // A callback authored in the game's own scope is not a security boundary.
  function connect(options = {}) {
    for (const k of ['policy', 'record'])
      if (options[k] != null && typeof options[k] !== 'function') throw Error('Invalid ' + k + ' bridge');
    policy = options.policy || null;
    record = options.record || null;
    sequence = 0;
  }
  return {
    schema,
    define,
    draw: resolveChance,
    effect,
    connect,
    descriptions: () => [...rules.values()].map(describe),
    get recording() {
      return !!record;
    }
  };
})();
