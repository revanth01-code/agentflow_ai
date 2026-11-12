const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');
const env = require('../config/env');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const { encrypt } = require('../utils/crypto');

function signToken(user) {
  const userId = user._id ? String(user._id) : user.id;
  return jwt.sign(
    { id: userId, email: user.email, role: user.role || 'operator' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function googleRedirectUri() {
  return env.googleAuthRedirectUri || `${env.apiBaseUrl}/api/auth/google/callback`;
}

async function loginWithGoogle(code) {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new ApiError(503, 'Google authentication is not configured', {
      code: 'GOOGLE_AUTH_NOT_CONFIGURED'
    });
  }

  let tokenResponse;
  try {
    const body = new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code'
    });
    tokenResponse = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000
    });
  } catch (_err) {
    throw new ApiError(502, 'Google authentication code exchange failed', {
      code: 'GOOGLE_AUTH_EXCHANGE_FAILED'
    });
  }

  let profile;
  try {
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      timeout: 15000
    });
    profile = profileResponse.data;
  } catch (_err) {
    throw new ApiError(502, 'Google profile lookup failed', {
      code: 'GOOGLE_PROFILE_FAILED'
    });
  }

  const email = String(profile.email || '').trim().toLowerCase();
  if (!email || profile.verified_email === false) {
    throw new ApiError(400, 'Google did not provide a verified email address', {
      code: 'GOOGLE_EMAIL_NOT_VERIFIED'
    });
  }

  const googleId = String(profile.id || '');
  let user;
  if (isMemoryStore()) {
    user = memoryStore.findOne('users', { email });
    if (user) {
      user = memoryStore.update('users', user._id, { googleId, lastLoginAt: new Date().toISOString() });
    } else {
      const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = memoryStore.insert('users', {
        name: profile.name || email.split('@')[0],
        email,
        password,
        googleId,
        role: 'operator',
        lastLoginAt: new Date().toISOString()
      });
    }
  } else {
    user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (user) {
      user.googleId = googleId || user.googleId;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        password: crypto.randomBytes(32).toString('hex'),
        googleId,
        role: 'operator',
        lastLoginAt: new Date()
      });
    }
  }

  return { user: sanitizeUser(user), token: signToken(user) };
}

function sanitizeUser(user) {
  if (!user) return null;
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.geminiApiKey;
  delete obj.openrouterApiKey;
  delete obj.__v;
  if (obj._id) {
    obj._id = String(obj._id);
  }
  return obj;
}

async function register({ name, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!name || !normalizedEmail || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  if (isMemoryStore()) {
    const existing = memoryStore.findOne('users', { email: normalizedEmail });
    if (existing) {
      throw new ApiError(409, 'User already exists with this email');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const created = memoryStore.insert('users', {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'operator',
      lastLoginAt: new Date().toISOString()
    });
    const sanitized = sanitizeUser(created);
    const token = signToken(created);
    return { user: sanitized, token };
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'User already exists with this email');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'operator',
    lastLoginAt: new Date()
  });

  const sanitized = sanitizeUser(user);
  const token = signToken(user);
  return { user: sanitized, token };
}

async function login({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  if (isMemoryStore()) {
    const user = memoryStore.findOne('users', { email: normalizedEmail });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const lastLoginAt = new Date().toISOString();
    const updated = memoryStore.update('users', user._id, { lastLoginAt }) || user;
    const sanitized = sanitizeUser(updated);
    const token = signToken(updated);
    return { user: sanitized, token };
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const sanitized = sanitizeUser(user);
  const token = signToken(user);
  return { user: sanitized, token };
}

async function updateAiKeys(owner, { geminiApiKey, openrouterApiKey }) {
  const ownerId = String(owner._id || owner);
  const updates = {};
  if (geminiApiKey !== undefined) updates.geminiApiKey = String(geminiApiKey);
  if (openrouterApiKey !== undefined) updates.openrouterApiKey = String(openrouterApiKey);

  if (isMemoryStore()) {
    const updated = memoryStore.update('users', ownerId, Object.fromEntries(
      Object.entries(updates).map(([field, value]) => [field, value ? encrypt(value) : ''])
    ));
    if (!updated) throw new ApiError(404, 'User not found');
    return {
      geminiConfigured: Boolean(updated.geminiApiKey),
      openrouterConfigured: Boolean(updated.openrouterApiKey)
    };
  } else {
    const user = await User.findById(ownerId).select('+geminiApiKey +openrouterApiKey');
    if (!user) throw new ApiError(404, 'User not found');
    for (const [field, value] of Object.entries(updates)) {
      user[field] = value;
    }
    await user.save();
    return {
      geminiConfigured: Boolean(user.geminiApiKey),
      openrouterConfigured: Boolean(user.openrouterApiKey)
    };
  }
}

module.exports = { register, login, loginWithGoogle, updateAiKeys, sanitizeUser, signToken, googleRedirectUri };
