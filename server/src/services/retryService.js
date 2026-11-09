const retryableCodes = new Set(['ETIMEDOUT', 'ECONNRESET', 'RATE_LIMIT', 'AUTH_EXPIRED', 'MALFORMED_RESPONSE', 'TIMEOUT']);

function classifyFailure(error = {}) {
  const msg = String(error?.message || error || '').toUpperCase();
  if (msg.includes('TIMEOUT') || msg.includes('ETIMEDOUT')) return 'TIMEOUT';
  if (msg.includes('429') || msg.includes('RATE')) return 'RATE_LIMIT';
  if (msg.includes('401') || msg.includes('AUTH') || msg.includes('TOKEN') || msg.includes('EXPIRED')) return 'AUTH_EXPIRED';
  if (msg.includes('MISSING') || msg.includes('REQUIRED')) return 'MISSING_FIELDS';
  if (msg.includes('JSON') || msg.includes('PARSE') || msg.includes('SYNTAX') || msg.includes('MALFORMED')) return 'MALFORMED_RESPONSE';
  return 'API_FAILURE';
}

function shouldRetry(error, attempt, maxRetries = 3) {
  if (attempt >= maxRetries) return false;
  const failureType = classifyFailure(error);
  return retryableCodes.has(failureType);
}

function backoffMs(attempt) {
  return Math.min(1000 * Math.pow(2, Math.max(0, attempt)), 30000);
}

module.exports = { classifyFailure, shouldRetry, backoffMs };
