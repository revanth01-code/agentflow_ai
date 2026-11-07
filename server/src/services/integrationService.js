const axios = require('axios');
const jwt = require('jsonwebtoken');
const { isMemoryStore } = require('../config/db');
const env = require('../config/env');
const memoryStore = require('../utils/memoryStore');
const Integration = require('../models/Integration');
const { decrypt, encrypt } = require('../utils/crypto');

const googleOAuth = {
  gmail: {
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },
  'google-sheets': {
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  }
};

const slackScopes = ['chat:write', 'channels:read', 'groups:read'];

function safeIntegration(integration) {
  // TODO: Strip the encrypted access and refresh tokens before returning the record.
  return null;
}

async function listIntegrations(owner) {
  // TODO: Return the owner's integrations without the encrypted secrets.
  throw new Error('List integrations service is not implemented yet');
}

async function upsertIntegration(owner, payload) {
  // TODO: Encrypt the access token / webhook URL and the refresh token, then insert or
  // TODO: update the provider record for this owner and return the safe version.
  throw new Error('Save integration service is not implemented yet');
}

async function getIntegration(owner, provider) {
  // TODO: Return the raw integration record for the owner and provider.
  return null;
}

async function refreshGoogleAccessToken(owner, provider, refreshToken) {
  // TODO: Exchange the refresh token at the Google token endpoint and store the new token.
  throw new Error('Google token refresh is not implemented yet');
}

async function getProviderSecret(owner, provider) {
  // TODO: Load the connected integration, decrypt the tokens, refresh an expiring Google
  // TODO: token, and throw INTEGRATION_NOT_CONNECTED / MISSING_CREDENTIAL when unusable.
  throw new Error('Provider secret lookup is not implemented yet');
}

function callbackUrl(provider) {
  // TODO: Build the OAuth callback URL from env.apiBaseUrl.
  return '';
}

function oauthState(owner, provider) {
  // TODO: Sign a short-lived JWT carrying the owner and provider.
  return '';
}

function verifyOauthState(state, expectedProvider) {
  // TODO: Verify the state token and confirm it matches the expected provider.
  return {};
}

async function startOAuth(owner, provider) {
  // TODO: Build the Google or Slack consent URL (client id, redirect, scopes, state),
  // TODO: and raise a configuration error when the credentials are missing.
  throw new Error('OAuth start service is not implemented yet');
}

async function completeOAuth(provider, query) {
  // TODO: Verify the state, exchange the code for tokens at Google or Slack, store the
  // TODO: integration, and return the client redirect URL.
  throw new Error('OAuth completion service is not implemented yet');
}

function oauthStatus() {
  // TODO: Return the setup mode for each provider (oauth-ready, webhook-ready, api-key).
  return {};
}

module.exports = {
  listIntegrations,
  upsertIntegration,
  getProviderSecret,
  startOAuth,
  completeOAuth,
  oauthStatus
};
