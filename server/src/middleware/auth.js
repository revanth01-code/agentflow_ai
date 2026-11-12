const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');
const { sanitizeUser } = require('../services/authService');

async function auth(req, _res, next) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.headers.cookie
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('agentflow_token='))
    ?.slice('agentflow_token='.length);
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

  if (!token) {
    return next(new ApiError(401, 'Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    let user;
    if (isMemoryStore()) {
      user = memoryStore.findOne('users', { _id: decoded.id });
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return next(new ApiError(401, 'User not found or session expired'));
    }

    req.user = sanitizeUser(user);
    next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = auth;
