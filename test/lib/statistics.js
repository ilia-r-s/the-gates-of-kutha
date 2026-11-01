// Season-clustered inference: correlated observations inside a season are never
// counted as independent trials. See docs/research/2026-11-01-verification.md.
// Inverse standard-normal CDF (Acklam's rational approximation).
function normalQuantile(p) {
  if (!(p > 0 && p < 1)) throw new RangeError('A probability strictly between zero and one is required');
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
    b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
    c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
    d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742],
    poly = (coeffs, x) => coeffs.reduce((v, k) => v * x + k, 0);
  if (p < 0.02425 || p > 0.97575) {
    const q = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p));
    return ((p < 0.5 ? 1 : -1) * poly(c, q)) / (poly(d, q) * q + 1);
  }
  const q = p - 0.5,
    r = q * q;
  return (q * poly(a, r)) / (poly(b, r) * r + 1);
}

// Clopper–Pearson is reserved for independently generated scenarios with one
// Bernoulli observation per group. It is not a substitute for clustered inference.
function logGamma(x) {
  const c = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905, -0.13857109526572012,
    0.000009984369578019572, 0.00000015056327351493116
  ];
  let a = 0.99999999999980993;
  for (let i = 0; i < c.length; i++) a += c[i] / (x + i);
  const t = x + 6.5;
  return 0.9189385332046727 + (x - 0.5) * Math.log(t) - t + Math.log(a);
}
function betaFraction(a, b, x) {
  const tiny = 1e-300,
    guard = v => (Math.abs(v) < tiny ? tiny : v);
  let c = 1,
    d = 1 / guard(1 - ((a + b) * x) / (a + 1)),
    h = d;
  for (let m = 1; m <= 10000; m++) {
    let f = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 / guard(1 + f * d);
    c = guard(1 + f / c);
    h *= d * c;
    f = (-(a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 / guard(1 + f * d);
    c = guard(1 + f / c);
    const step = d * c;
    h *= step;
    if (Math.abs(step - 1) < 3e-14) return h;
  }
  throw Error('Incomplete beta fraction did not converge');
}
function betaCdf(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const scale = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  return x < (a + 1) / (a + b + 2) ? (scale * betaFraction(a, b, x)) / a : 1 - (scale * betaFraction(b, a, 1 - x)) / b;
}
function betaQuantile(p, a, b) {
  // Symmetry avoids subtraction of an extreme upper-tail probability in the CDF.
  if (p > 0.5) return 1 - betaQuantile(1 - p, b, a);
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    if (betaCdf(mid, a, b) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function binomialInterval(k, n, alpha = 0.05) {
  if (!Number.isSafeInteger(n) || n < 1 || n > 1000000 || !Number.isSafeInteger(k) || k < 0 || k > n || !(alpha >= 1e-12 && alpha < 1))
    throw RangeError('Validated exact-binomial domain: integer 0 <= successes <= trials <= 1000000, trials > 0, and 1e-12 <= alpha < 1');
  const tail = alpha / 2;
  return [
    k === 0 ? 0 : k === n ? Math.exp(Math.log(tail) / n) : betaQuantile(tail, k, n - k + 1),
    k === n ? 1 : k === 0 ? -Math.expm1(Math.log(tail) / n) : 1 - betaQuantile(tail, n - k, k + 1)
  ];
}

function rateRatio(clusters, { comparisons = 1, alpha = 0.05, band = [0.5, 2], method = 'cluster' } = {}) {
  if (!Number.isSafeInteger(comparisons) || comparisons < 1 || !(alpha > 0 && alpha < 1)) throw RangeError('Invalid inference family');
  if (!['cluster', 'paired-bernoulli'].includes(method)) throw Error('Unknown tell inference method');
  if (
    method === 'paired-bernoulli' &&
    clusters.some(r => r.length !== 4 || r[1] !== 1 || r[3] !== 1 || ![0, 1].includes(r[0]) || ![0, 1].includes(r[2]))
  )
    throw Error('Exact paired inference requires one Bernoulli observation per group in every independent scenario');
  const rows = clusters.filter(r => r[1] || r[3]),
    totals = rows.reduce((a, r) => a.map((n, i) => n + r[i]), [0, 0, 0, 0]),
    [ch, cn, ih, inn] = totals,
    ratio = cn && inn ? (ih ? ch / cn / (ih / inn) : ch ? Infinity : NaN) : NaN,
    events = [0, 2].map(i => rows.filter(r => r[i] > 0).length),
    nonEvents = [0, 2].map(i => rows.filter(r => r[i + 1] > r[i]).length),
    result = {
      totals,
      ratio,
      interval: [0, Infinity],
      clusters: rows.length,
      opportunityClusters: [1, 3].map(i => rows.filter(r => r[i] > 0).length),
      pairedClusters: rows.filter(r => r[1] > 0 && r[3] > 0).length,
      eventClusters: events,
      status: 'insufficient',
      reason: '',
      method
    };
  if (method === 'paired-bernoulli') {
    if (!rows.length) {
      result.reason = 'No independent scenarios';
      return result;
    }
    const cult = binomialInterval(ch, cn, alpha / (2 * comparisons)),
      innocent = binomialInterval(ih, inn, alpha / (2 * comparisons));
    result.interval = [cult[0] / innocent[1], innocent[0] ? cult[1] / innocent[0] : Infinity];
    const [lo, hi] = result.interval;
    result.probabilityIntervals = { cult, innocent };
    result.status = hi < band[0] || lo > band[1] ? 'outside' : lo >= band[0] && hi <= band[1] ? 'inside' : 'insufficient';
    if (result.status === 'insufficient') result.reason = 'Exact ratio interval crosses a fairness boundary';
    return result;
  }
  if (rows.length < 50 || events.some(n => n < 20) || nonEvents.some(n => n < 20)) {
    result.reason = 'Too few independent seasons with events or non-events for the cluster asymptotic interval';
    return result;
  }
  const influence = rows.map(([a, b, c, d]) => a / ch - b / cn - c / ih + d / inn),
    mean = influence.reduce((a, b) => a + b, 0) / rows.length,
    variance = (rows.length / (rows.length - 1)) * influence.reduce((sum, x) => sum + (x - mean) ** 2, 0),
    z = normalQuantile(1 - alpha / (2 * comparisons)),
    radius = z * Math.sqrt(variance),
    lo = Math.exp(Math.log(ratio) - radius),
    hi = Math.exp(Math.log(ratio) + radius);
  result.interval = [lo, hi];
  result.status = hi < band[0] || lo > band[1] ? 'outside' : lo >= band[0] && hi <= band[1] ? 'inside' : 'insufficient';
  if (result.status === 'insufficient') result.reason = 'Interval crosses a fairness boundary';
  return result;
}

function checkExit(results, allowInsufficient = false) {
  if (!results.length) return 2;
  return results.some(r => r.status === 'outside') ? 1 : !allowInsufficient && results.some(r => r.status === 'insufficient') ? 2 : 0;
}
module.exports = { normalQuantile, binomialInterval, rateRatio, checkExit };
