const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const corsMiddleware = cors({
  origin: env.clientUrl,
  credentials: true
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  corsMiddleware,
  helmetMiddleware: helmet(),
  rateLimiter: limiter
};
