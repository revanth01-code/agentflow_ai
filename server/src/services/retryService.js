const retryableCodes = new Set(['ETIMEDOUT', 'ECONNRESET', 'RATE_LIMIT', 'AUTH_EXPIRED', 'MALFORMED_RESPONSE']);

function classifyFailure(error = {}) {
  // TODO: Inspect the error message and return TIMEOUT, RATE_LIMIT, AUTH_EXPIRED,
  // TODO: MISSING_FIELDS, MALFORMED_RESPONSE, or API_FAILURE.
  return 'API_FAILURE';
}

function shouldRetry(error, attempt, maxRetries = 3) {
  // TODO: Allow a retry while the attempt is below maxRetries and the failure is retryable.
  return false;
}

function backoffMs(attempt) {
  // TODO: Return the exponential backoff delay, capped at 30000 ms.
  return 0;
}

module.exports = { classifyFailure, shouldRetry, backoffMs };
