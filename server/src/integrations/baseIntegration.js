const axios = require('axios');
const { decrypt } = require('../utils/crypto');

function providerError(error) {
  // TODO: Normalize the provider error into a single Error with status, code,
  // TODO: and the raw provider response attached.
  return error;
}

async function requestWithRetry({ method = 'GET', url, token, data, headers = {}, retries = 3 }) {
  // TODO: Send the request with the decrypted bearer token, retry 5xx and 429 responses
  // TODO: with a growing delay, and throw the normalized provider error when it fails.
  throw new Error('Provider request helper is not implemented yet');
}

module.exports = { requestWithRetry };
