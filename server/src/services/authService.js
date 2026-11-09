const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

function signToken(user) {
  const userId = user._id ? String(user._id) : user.id;
  return jwt.sign(
    { id: userId, email: user.email, role: user.role || 'operator' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
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

module.exports = { register, login, sanitizeUser, signToken };
