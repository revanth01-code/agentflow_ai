const asyncHandler = require('../utils/asyncHandler');
const integrationService = require('../services/integrationService');

const list = asyncHandler(async (req, res) => {
  // TODO: Respond with the current user's integrations (without the encrypted secrets).
  res.status(501).json({ message: 'List integrations is not implemented yet' });
});

const upsert = asyncHandler(async (req, res) => {
  // TODO: Create or update the integration from req.body and respond with the safe record.
  res.status(501).json({ message: 'Save integration is not implemented yet' });
});

const status = asyncHandler(async (_req, res) => {
  // TODO: Respond with the per-provider setup mode (oauth-ready, webhook-ready, api-key).
  res.status(501).json({ message: 'Integration status is not implemented yet' });
});

const startOAuth = asyncHandler(async (req, res) => {
  // TODO: Respond with the provider consent URL for req.params.provider.
  res.status(501).json({ message: 'OAuth start is not implemented yet' });
});

const oauthCallback = async (req, res) => {
  // TODO: Exchange the authorization code, store the tokens, and redirect to the client.
  // TODO: Redirect to the OAuth error route when the exchange fails.
  res.status(501).json({ message: 'OAuth callback is not implemented yet' });
};

const oauthError = asyncHandler(async (req, res) => {
  // TODO: Redirect to the client integrations page with the error message.
  res.status(501).json({ message: 'OAuth error handling is not implemented yet' });
});

module.exports = { list, upsert, status, startOAuth, oauthCallback, oauthError };
