const { requestWithRetry } = require('./baseIntegration');

async function sendSlackMessage(token, channel, text) {
  // TODO: Post the message to the Slack chat.postMessage endpoint.
  throw new Error('Slack sendSlackMessage is not implemented yet');
}

module.exports = { sendSlackMessage };
