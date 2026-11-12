const mongoose = require('mongoose');

const ExecutionSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflowSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
    default: 'PENDING'
  },
  currentNodeId: { type: String, default: null },
  startedAt: { type: Date },
  completedAt: { type: Date },
  durationMs: { type: Number, default: 0 },
  input: { type: mongoose.Schema.Types.Mixed, default: {} },
  output: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String, default: null },
  retryCount: { type: Number, default: 0 },
  traceId: { type: String, index: true, default: null },
  spanId: { type: String, default: null }
}, { timestamps: true });

ExecutionSchema.index({ workflow: 1, createdAt: -1 });

module.exports = mongoose.model('Execution', ExecutionSchema);
