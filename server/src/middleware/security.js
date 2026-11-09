const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const allowedOrigins = [
  env.clientUrl,
  'http://localhost:3000'
].filter(Boolean);

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin === allowed || origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    callback(null, false);
  },
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
