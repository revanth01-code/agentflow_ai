const { classifyFailure, backoffMs } = require('../services/retryService');

async function recoveryAgent({ error, attempt }) {
  // TODO: Classify the failure, decide between 'escalate' and 'retry_with_backoff'
  // TODO: (integration, credential, and permission errors always escalate), and return
  // TODO: the backoff delay plus the fallback strategy.
  return { agent: 'recovery', category: 'API_FAILURE', action: 'escalate', delayMs: 0, fallback: '' };
}

module.exports = recoveryAgent;
