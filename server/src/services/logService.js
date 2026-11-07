const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ExecutionLog = require('../models/ExecutionLog');
const { emitEvent } = require('../config/socket');

async function createLog({ execution, workflow, nodeId, agent, level = 'info', event, message, metadata = {} }) {
  // TODO: Persist the log entry, then emit it on the execution and workflow socket rooms.
  return null;
}

async function listLogs(filter = {}) {
  // TODO: Return the matching logs sorted by createdAt ascending.
  return [];
}

module.exports = { createLog, listLogs };
