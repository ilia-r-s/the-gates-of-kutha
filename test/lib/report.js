// Share failure detection between standalone checks and the suite; printed JSON must never hide a failing exit code.
function hasFailures(value) {
  if (typeof value === 'string') {
    try {
      return hasFailures(JSON.parse(value));
    } catch {
      return /\b[1-9]\d* differences from\b|(?:^|\n)(?:leaks|missing|errors):\s*\[\s*[^\]\s]/.test(value);
    }
  }
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) =>
    ['errors', 'problems', 'nProblems', 'failing', 'stuck', 'missingRu', 'leakSteps', 'nMissing'].includes(key)
      ? Array.isArray(item)
        ? item.length > 0
        : typeof item === 'number'
          ? item > 0
          : Boolean(item)
      : hasFailures(item)
  );
}
module.exports = { hasFailures };
