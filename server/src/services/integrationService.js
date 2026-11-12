const axios = require('axios');
const jwt = require('jsonwebtoken');
const { isMemoryStore } = require('../config/db');
const env = require('../config/env');
const memoryStore = require('../utils/memoryStore');
const Integration = require('../models/Integration');
const { decrypt, encrypt } = require('../utils/crypto');
const ApiError = require('../utils/apiError');

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
const discordScopes = ['identify'];

function configurationError(provider, missing) {
  return new ApiError(
    503,
    `OAuth is not configured for ${provider}. Missing server environment variable(s): ${missing.join(', ')}`,
    { code: 'INTEGRATION_CONFIG_MISSING', provider, missing }
  );
}

function redirectUri(provider) {
  const configured = {
    gmail: env.googleRedirectUri,
    'google-sheets': env.googleSheetsRedirectUri,
    slack: env.slackRedirectUri,
    discord: env.discordRedirectUri
  }[provider];

  return configured;
}

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

async function disconnectIntegration(owner, provider) {
  const ownerId = String(owner._id || owner);
  const integration = await getIntegration(ownerId, provider);
  if (!integration) return { provider, disconnected: true };

  const tokenValue = integration.encryptedRefreshToken || integration.encryptedAccessToken;
  const token = tokenValue ? decrypt(tokenValue) : null;

  try {
    if (token && (provider === 'gmail' || provider === 'google-sheets')) {
      await axios.post('https://oauth2.googleapis.com/revoke', null, { params: { token } });
    } else if (token && provider === 'slack') {
      await axios.post('https://slack.com/api/auth.revoke', null, {
        params: { token },
        validateStatus: (status) => status < 500
      });
    } else if (token && provider === 'discord') {
      await axios.post('https://discord.com/api/oauth2/token/revoke', new URLSearchParams({
        token,
        client_id: env.discordClientId || '',
        client_secret: env.discordClientSecret || ''
      }).toString(), {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        validateStatus: (status) => status < 500
      });
    }
  } catch (error) {
    console.warn(`OAuth token revocation failed for ${provider}: ${error.message}`);
  }

  if (isMemoryStore()) {
    memoryStore.remove('integrations', integration._id);
  } else {
    await Integration.deleteOne({ owner: ownerId, provider });
  }
  return { provider, disconnected: true };
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
    throw new ApiError(400, `Provider ${provider} is not connected.`, {
      code: 'INTEGRATION_NOT_CONNECTED',
      provider
    });
  }

  if (provider === 'gmail' || provider === 'google-sheets') {
    if (integration.expiresAt && new Date(integration.expiresAt) <= new Date()) {
      if (integration.encryptedRefreshToken) {
        return refreshGoogleAccessToken(owner, provider, integration.encryptedRefreshToken);
      }
    }
  }

  if (!integration.encryptedAccessToken) {
    throw new ApiError(400, `No credential is configured for ${provider}.`, {
      code: 'MISSING_CREDENTIAL',
      provider
    });
  }

  return decrypt(integration.encryptedAccessToken);
}

function callbackUrl(provider) {
  return redirectUri(provider);
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
    const missing = [];
    if (!env.googleClientId) missing.push('GOOGLE_CLIENT_ID');
    if (!env.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!redirectUri) missing.push(provider === 'gmail' ? 'GOOGLE_REDIRECT_URI' : 'GOOGLE_SHEETS_REDIRECT_URI');
    if (missing.length) {
      throw configurationError(provider, missing);
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
    const missing = [];
    if (!env.slackClientId) missing.push('SLACK_CLIENT_ID');
    if (!env.slackClientSecret) missing.push('SLACK_CLIENT_SECRET');
    if (!redirectUri) missing.push('SLACK_REDIRECT_URI');
    if (missing.length) {
      throw configurationError(provider, missing);
    }
    const params = new URLSearchParams({
      client_id: env.slackClientId,
      scope: slackScopes.join(','),
      redirect_uri: redirectUri,
      state
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  if (provider === 'discord') {
    const missing = [];
    if (!env.discordClientId) missing.push('DISCORD_CLIENT_ID');
    if (!env.discordClientSecret) missing.push('DISCORD_CLIENT_SECRET');
    if (!redirectUri) missing.push('DISCORD_REDIRECT_URI');
    if (missing.length) {
      throw configurationError(provider, missing);
    }
    const params = new URLSearchParams({
      client_id: env.discordClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: discordScopes.join(' '),
      state
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
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

    if (provider === 'discord') {
      const tokenRes = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: env.discordClientId,
          client_secret: env.discordClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, scope } = tokenRes.data;
      await upsertIntegration(owner, {
        provider,
        accessToken,
        refreshToken,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        scopes: scope ? scope.split(' ') : discordScopes,
        status: 'connected'
      });

      return `${env.clientUrl}/integrations?connected=discord`;
    }

    return `${env.clientUrl}/integrations?error=${encodeURIComponent('Unsupported provider')}`;
  } catch (err) {
    return `${env.clientUrl}/integrations?error=${encodeURIComponent(err.message)}`;
  }
}

function oauthStatus() {
  return {
    gmail: env.googleClientId && env.googleClientSecret && env.googleRedirectUri ? 'oauth-ready' : 'not-configured',
    'google-sheets':
      env.googleClientId && env.googleClientSecret && env.googleSheetsRedirectUri ? 'oauth-ready' : 'not-configured',
    slack: env.slackClientId && env.slackClientSecret && env.slackRedirectUri ? 'oauth-ready' : 'not-configured',
    discord:
      env.discordClientId && env.discordClientSecret && env.discordRedirectUri
        ? 'oauth-ready'
        : env.discordBotToken
          ? 'webhook-ready'
          : 'not-configured',
    gemini: 'user-managed',
    openrouter: 'user-managed'
  };
}

module.exports = {
  listIntegrations,
  upsertIntegration,
  getIntegration,
  disconnectIntegration,
  getProviderSecret,
  startOAuth,
  completeOAuth,
  oauthStatus
};
