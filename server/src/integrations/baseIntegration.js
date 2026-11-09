const axios = require('axios');
const { decrypt } = require('../utils/crypto');

function providerError(error) {
  const status = error.response?.status || 500;
  const code = error.code || (status === 429 ? 'RATE_LIMIT' : status === 401 ? 'AUTH_EXPIRED' : 'API_FAILURE');
  const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Provider request failed';
  const err = new Error(message);
  err.status = status;
  err.code = code;
  err.rawResponse = error.response?.data;
  return err;
}

async function requestWithRetry({ method = 'GET', url, token, data, headers = {}, retries = 3 }) {
  const decryptedToken = token && typeof token === 'string' && token.includes(':') ? decrypt(token) : token;
  const authHeaders = decryptedToken ? { Authorization: `Bearer ${decryptedToken}` } : {};

  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          ...authHeaders,
          ...headers
        },
        timeout: 15000
      });
      return response.data;
    } catch (err) {
      lastError = providerError(err);
      const status = lastError.status;
      if (attempt < retries - 1 && (status >= 500 || status === 429)) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

module.exports = { requestWithRetry, providerError };
