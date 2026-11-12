const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const allowedOrigins = [
  env.clientUrl,
  'https://agentflow-ai-omega.vercel.app',
  'http://localhost:3000'
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    callback(new Error(`CORS origin not allowed: ${origin}`));
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
