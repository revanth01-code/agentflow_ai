const { Queue } = require('bullmq');
const { getRedisConnection } = require('./redis');

const queueNames = {
  workflowExecution: 'workflow-execution-queue',
  retry: 'retry-queue',
  notification: 'notification-queue',
  aiProcessing: 'AI-processing-queue',
  logging: 'logging-queue'
};

function createQueue(name) {
  // TODO: Return a real BullMQ Queue when a Redis connection is available and keep this
  // TODO: in-memory fallback object otherwise.
  return {
    name,
    fallback: true,
    add: async (_jobName, data) => ({ id: `memory-${Date.now()}`, data })
  };
}

const queues = {
  workflowExecutionQueue: createQueue(queueNames.workflowExecution),
  retryQueue: createQueue(queueNames.retry),
  notificationQueue: createQueue(queueNames.notification),
  aiProcessingQueue: createQueue(queueNames.aiProcessing),
  loggingQueue: createQueue(queueNames.logging)
};

module.exports = { queueNames, queues };
