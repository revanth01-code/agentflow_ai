async function validationAgent({ node, output }) {
  const missing = [];
  const data = output?.data || output || {};
  const config = node?.config || {};

  if (node?.type === 'send-email') {
    if (!config.to && !data.to) missing.push('to');
  } else if (node?.type === 'send-slack-message') {
    if (!config.channel && !data.channel) missing.push('channel');
  } else if (node?.type === 'send-discord-message') {
    if (!config.content && !config.message && !data.content && !data.message) {
      missing.push('content');
    }
  }

  const valid = missing.length === 0;
  return {
    agent: 'validation',
    valid,
    missing,
    decision: valid
      ? `Validated node ${node?.id || ''} output successfully`
      : `Validation failed: missing fields [${missing.join(', ')}]`
  };
}

module.exports = validationAgent;
