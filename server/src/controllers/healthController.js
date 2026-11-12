const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { isMemoryStore } = require('../config/db');
const { getLangGraphStatus } = require('../agents/orchestrator');
const { queues, queueNames } = require('../queues');

const health = asyncHandler(async (_req, res) => {
  const isRedisConnected = Boolean(env.redisUrl);
  const queueMode = queues.workflowExecutionQueue.fallback ? 'in-memory' : 'bullmq-redis';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      mode: isMemoryStore() ? 'memory-fallback' : 'mongodb',
      connected: !isMemoryStore()
    },
    redis: {
      configured: isRedisConnected,
      mode: isRedisConnected ? 'connected' : 'disabled'
    },
    queues: {
      mode: queueMode,
      names: queueNames
    },
    aiProviders: {
      openRouter: 'user-managed',
      gemini: 'user-managed'
    },
    langGraph: getLangGraphStatus()
  });
});

module.exports = { health };
