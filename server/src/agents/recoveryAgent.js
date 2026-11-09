const { classifyFailure, backoffMs } = require('../services/retryService');

async function recoveryAgent({ error, attempt = 0 }) {
  const category = classifyFailure(error);
  const msg = String(error?.message || error || '').toLowerCase();
  const alwaysEscalate =
    msg.includes('credential') ||
    msg.includes('permission') ||
    msg.includes('forbidden') ||
    msg.includes('integration') ||
    msg.includes('not connected') ||
    msg.includes('invalid email');

  if (alwaysEscalate || attempt >= 3) {
    return {
      agent: 'recovery',
      category,
      action: 'escalate',
      delayMs: 0,
      fallback: 'Manual intervention required or verify integration credentials.'
    };
  }

  const delay = backoffMs(attempt);
  return {
    agent: 'recovery',
    category,
    action: 'retry_with_backoff',
    delayMs: delay,
    fallback: `Auto-retry scheduled in ${delay}ms`
  };
}

module.exports = recoveryAgent;
