const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { isMemoryStore } = require('../config/db');
const { getLangGraphStatus } = require('../agents/orchestrator');
const { queues, queueNames } = require('../queues');

const health = asyncHandler(async (_req, res) => {
  // TODO: Report the database mode, redis configuration, queue names, queue mode,
  // TODO: AI provider readiness (OpenRouter, Gemini), and the LangGraph status.
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = { health };
