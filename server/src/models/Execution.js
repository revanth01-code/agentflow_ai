const mongoose = require('mongoose');

// TODO: Define the fields: workflow, workflowSnapshot, status ('PENDING' | 'RUNNING' |
// TODO: 'COMPLETED' | 'FAILED' | 'RETRYING' | 'PAUSED' | 'CANCELLED'), currentNodeId,
// TODO: startedAt, completedAt, durationMs, input, output, error, retryCount.
// TODO: Add the compound index on workflow + createdAt.
const ExecutionSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Execution', ExecutionSchema);
