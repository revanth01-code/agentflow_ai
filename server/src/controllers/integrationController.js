const asyncHandler = require('../utils/asyncHandler');
const integrationService = require('../services/integrationService');
const env = require('../config/env');

const list = asyncHandler(async (req, res) => {
  const data = await integrationService.listIntegrations(req.user);
  res.status(200).json(data);
});

const upsert = asyncHandler(async (req, res) => {
  const data = await integrationService.upsertIntegration(req.user, req.body);
  res.status(200).json(data);
});

const status = asyncHandler(async (_req, res) => {
  const data = integrationService.oauthStatus();
  res.status(200).json(data);
});

const startOAuth = asyncHandler(async (req, res) => {
  const url = await integrationService.startOAuth(req.user, req.params.provider);
  res.status(200).json({ url });
});

const disconnect = asyncHandler(async (req, res) => {
  const data = await integrationService.disconnectIntegration(req.user, req.params.provider);
  res.status(200).json(data);
});

const oauthCallback = async (req, res) => {
  try {
    const redirectUrl = await integrationService.completeOAuth(req.params.provider, req.query);
    res.redirect(redirectUrl);
  } catch (err) {
    res.redirect(`${env.clientUrl}/integrations?error=${encodeURIComponent(err.message)}`);
  }
};

const oauthError = asyncHandler(async (req, res) => {
  const error = req.query.error || 'OAuth authorization failed';
  res.redirect(`${env.clientUrl}/integrations?error=${encodeURIComponent(error)}`);
});

module.exports = { list, upsert, status, startOAuth, disconnect, oauthCallback, oauthError };
