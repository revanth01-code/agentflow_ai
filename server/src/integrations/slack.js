const { requestWithRetry } = require('./baseIntegration');

async function sendSlackMessage(token, channel, text) {
  if (!channel) throw new Error('Slack channel is required');
  const url = 'https://slack.com/api/chat.postMessage';
  return requestWithRetry({
    method: 'POST',
    url,
    token,
    data: { channel, text }
  });
}

module.exports = { sendSlackMessage };
