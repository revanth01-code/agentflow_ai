const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ExecutionLog = require('../models/ExecutionLog');
const { emitEvent } = require('../config/socket');

async function createLog({
  execution,
  workflow,
  nodeId,
  agent,
  level = 'info',
  event,
  message,
  metadata = {},
  traceId = null,
  spanId = null,
  parentSpanId = null,
  durationMs = null
}) {
  const logData = {
    execution: String(execution),
    workflow: String(workflow),
    nodeId: nodeId ? String(nodeId) : null,
    agent: agent || 'orchestrator',
    level: level || 'info',
    event: event || 'log',
    message: String(message || ''),
    traceId,
    spanId,
    parentSpanId,
    durationMs,
    metadata: metadata || {}
  };

  let saved;
  if (isMemoryStore()) {
    saved = memoryStore.insert('executionLogs', logData);
  } else {
    saved = await ExecutionLog.create(logData);
  }

  emitEvent(`execution:${execution}`, 'execution:log', saved);
  emitEvent(`workflow:${workflow}`, 'workflow:log', saved);
  return saved;
}

async function listLogs(filter = {}) {
  if (isMemoryStore()) {
    const logs = memoryStore.list('executionLogs', filter);
    return logs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  return ExecutionLog.find(filter).sort({ createdAt: 1 }).lean();
}

module.exports = { createLog, listLogs };
