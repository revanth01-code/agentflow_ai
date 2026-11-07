const { requestWithRetry } = require('./baseIntegration');

function base64Url(value) {
  // TODO: Base64url encode the value for the Gmail raw message field.
  return '';
}

async function listMessages(token, query = 'newer_than:1d') {
  // TODO: Call the Gmail messages list endpoint with the search query.
  throw new Error('Gmail listMessages is not implemented yet');
}

async function sendEmail(token, { to, subject = 'AI Operations Automation', body = '', cc, bcc }) {
  // TODO: Require a recipient, build the MIME headers and body, and post the encoded
  // TODO: message to the Gmail send endpoint.
  throw new Error('Gmail sendEmail is not implemented yet');
}

module.exports = { listMessages, sendEmail };
