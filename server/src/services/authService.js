const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

function signToken(user) {
  // TODO: Sign a JWT with the user id and email using env.jwtSecret and env.jwtExpiresIn.
  return '';
}

function sanitizeUser(user) {
  // TODO: Convert the document to a plain object and strip the password field.
  return null;
}

async function register({ name, email, password }) {
  // TODO: Normalize the email, reject duplicates with 409, hash the password in memory mode,
  // TODO: create the user, and return { user, token }.
  throw new ApiError(501, 'Register service is not implemented yet');
}

async function login({ email, password }) {
  // TODO: Look up the user in the memory store or MongoDB, compare the password,
  // TODO: stamp lastLoginAt, and return { user, token } or throw a 401.
  throw new ApiError(501, 'Login service is not implemented yet');
}

module.exports = { register, login, sanitizeUser };
