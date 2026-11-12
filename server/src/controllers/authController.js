const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const jwt = require('jsonwebtoken');

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('agentflow_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  setAuthCookie(res, result.token);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setAuthCookie(res, result.token);
  res.status(200).json(result);
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

const updateAiKeys = asyncHandler(async (req, res) => {
  const keys = await authService.updateAiKeys(req.user, {
    geminiApiKey: req.body.geminiApiKey,
    openrouterApiKey: req.body.openrouterApiKey
  });
  res.status(200).json({ message: 'AI provider keys updated', ...keys });
});

const google = asyncHandler(async (_req, res) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new ApiError(503, 'Google authentication is not configured', {
      code: 'GOOGLE_AUTH_NOT_CONFIGURED'
    });
  }

  const state = jwt.sign({ purpose: 'google-auth' }, env.jwtSecret, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: authService.googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    throw new ApiError(400, 'Google authorization response is incomplete', {
      code: 'GOOGLE_AUTH_RESPONSE_INVALID'
    });
  }

  const decoded = jwt.verify(state, env.jwtSecret);
  if (decoded.purpose !== 'google-auth') {
    throw new ApiError(400, 'Invalid Google authentication state', {
      code: 'GOOGLE_AUTH_STATE_INVALID'
    });
  }

  const result = await authService.loginWithGoogle(code);
  res.redirect(`${env.clientUrl}/auth/google/callback?token=${encodeURIComponent(result.token)}`);
});

module.exports = { register, login, me, updateAiKeys, google, googleCallback };
