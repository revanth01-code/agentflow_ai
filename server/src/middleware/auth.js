const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');

async function auth(req, _res, next) {
  // TODO: Read the Bearer token from the authorization header and reject with 401 when missing.
  // TODO: Verify the token, load the user from the memory store or MongoDB, and set req.user.
  next();
}

module.exports = auth;
