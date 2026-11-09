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
  if (!integration) return null;
  const obj = typeof integration.toObject === 'function' ? integration.toObject() : { ...integration };
  delete obj.encryptedAccessToken;
  delete obj.encryptedRefreshToken;
  delete obj.__v;
  if (obj._id) obj._id = String(obj._id);
  return obj;
}

async function listIntegrations(owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const list = memoryStore.list('integrations', { owner: ownerId });
    return list.map(safeIntegration);
  }
  const list = await Integration.find({ owner: ownerId }).lean();
  return list.map(safeIntegration);
}

async function upsertIntegration(owner, payload = {}) {
  const ownerId = String(owner._id || owner);
  const provider = payload.provider;
  if (!provider) throw new Error('Provider is required');

  const rawToken = payload.accessToken || payload.token || payload.webhookUrl || '';
  const encryptedAccessToken = rawToken ? encrypt(rawToken) : null;
  const encryptedRefreshToken = payload.refreshToken ? encrypt(payload.refreshToken) : null;

  const data = {
    owner: ownerId,
    provider,
    status: payload.status || 'connected',
    scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
    encryptedAccessToken,
    encryptedRefreshToken,
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    lastError: null
  };

  if (isMemoryStore()) {
    const existing = memoryStore.findOne('integrations', { owner: ownerId, provider });
    let saved;
    if (existing) {
      saved = memoryStore.update('integrations', existing._id, data);
    } else {
      saved = memoryStore.insert('integrations', data);
    }
    return safeIntegration(saved);
  }

  const saved = await Integration.findOneAndUpdate(
    { owner: ownerId, provider },
    data,
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return safeIntegration(saved);
}

async function getIntegration(owner, provider) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    return memoryStore.findOne('integrations', { owner: ownerId, provider });
  }
  return Integration.findOne({ owner: ownerId, provider }).lean();
}

async function refreshGoogleAccessToken(owner, provider, refreshToken) {
  const decryptedRefresh = refreshToken.includes(':') ? decrypt(refreshToken) : refreshToken;
  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    refresh_token: decryptedRefresh,
    grant_type: 'refresh_token'
  });

  const { access_token, expires_in } = response.data;
  const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);
  const encryptedAccessToken = encrypt(access_token);

  await upsertIntegration(owner, {
    provider,
    accessToken: access_token,
    refreshToken: decryptedRefresh,
    expiresAt,
    status: 'connected'
  });

  return access_token;
}

async function getProviderSecret(owner, provider) {
  const integration = await getIntegration(owner, provider);
  if (!integration || integration.status !== 'connected') {
    throw new Error(`INTEGRATION_NOT_CONNECTED: Provider ${provider} is not connected.`);
  }

  if (provider === 'gmail' || provider === 'google-sheets') {
    if (integration.expiresAt && new Date(integration.expiresAt) <= new Date()) {
      if (integration.encryptedRefreshToken) {
        return refreshGoogleAccessToken(owner, provider, integration.encryptedRefreshToken);
      }
    }
  }

  if (!integration.encryptedAccessToken) {
    throw new Error(`MISSING_CREDENTIAL: No token configured for ${provider}.`);
  }

  return decrypt(integration.encryptedAccessToken);
}

function callbackUrl(provider) {
  return `${env.apiBaseUrl}/api/integrations/oauth/${provider}/callback`;
}

function oauthState(owner, provider) {
  const ownerId = String(owner._id || owner);
  return jwt.sign({ owner: ownerId, provider }, env.jwtSecret, { expiresIn: '15m' });
}

function verifyOauthState(state, expectedProvider) {
  try {
    const decoded = jwt.verify(state, env.jwtSecret);
    if (decoded.provider !== expectedProvider) {
      throw new Error('OAuth state provider mismatch');
    }
    return decoded;
  } catch (err) {
    throw new Error(`Invalid OAuth state: ${err.message}`);
  }
}

async function startOAuth(owner, provider) {
  const state = oauthState(owner, provider);
  const redirectUri = callbackUrl(provider);

  if (provider === 'gmail' || provider === 'google-sheets') {
    if (!env.googleClientId) {
      throw new Error('Google Client ID is not configured in server environment');
    }
    const scopes = googleOAuth[provider]?.scopes || [];
    const params = new URLSearchParams({
      client_id: env.googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (provider === 'slack') {
    if (!env.slackClientId) {
      throw new Error('Slack Client ID is not configured in server environment');
    }
    const params = new URLSearchParams({
      client_id: env.slackClientId,
      scope: slackScopes.join(','),
      redirect_uri: redirectUri,
      state
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  throw new Error(`OAuth not supported for provider: ${provider}`);
}

async function completeOAuth(provider, query = {}) {
  const { code, state, error } = query;
  if (error) {
    return `${env.clientUrl}/integrations?error=${encodeURIComponent(error)}`;
  }
  if (!code || !state) {
    return `${env.clientUrl}/integrations?error=${encodeURIComponent('Missing OAuth code or state')}`;
  }

  try {
    const { owner } = verifyOauthState(state, provider);
    const redirectUri = callbackUrl(provider);

    if (provider === 'gmail' || provider === 'google-sheets') {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token, expires_in, scope } = tokenRes.data;
      const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

      await upsertIntegration(owner, {
        provider,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scopes: scope ? scope.split(' ') : [],
        status: 'connected'
      });

      return `${env.clientUrl}/integrations?connected=${provider}`;
    }

    if (provider === 'slack') {
      const tokenRes = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          code,
          client_id: env.slackClientId,
          client_secret: env.slackClientSecret,
          redirect_uri: redirectUri
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (!tokenRes.data.ok) {
        throw new Error(tokenRes.data.error || 'Slack OAuth failed');
      }

      const { access_token, scope } = tokenRes.data;
      await upsertIntegration(owner, {
        provider,
        accessToken: access_token,
        scopes: scope ? scope.split(',') : [],
        status: 'connected'
      });

      return `${env.clientUrl}/integrations?connected=slack`;
    }

    return `${env.clientUrl}/integrations?error=${encodeURIComponent('Unsupported provider')}`;
  } catch (err) {
    return `${env.clientUrl}/integrations?error=${encodeURIComponent(err.message)}`;
  }
}

function oauthStatus() {
  return {
    gmail: env.googleClientId ? 'oauth-ready' : 'not-configured',
    'google-sheets': env.googleClientId ? 'oauth-ready' : 'not-configured',
    slack: env.slackClientId ? 'oauth-ready' : 'not-configured',
    discord: 'webhook-ready',
    gemini: env.geminiApiKey ? 'api-key' : 'not-configured',
    openrouter: env.openRouterApiKey ? 'api-key' : 'not-configured'
  };
}

module.exports = {
  listIntegrations,
  upsertIntegration,
  getProviderSecret,
  startOAuth,
  completeOAuth,
  oauthStatus
};
