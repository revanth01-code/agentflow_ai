const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

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

module.exports = { register, login, me, updateAiKeys };
