const mongoose = require('mongoose');

const ExecutionLogSchema = new mongoose.Schema({
  execution: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', required: true },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  nodeId: { type: String, default: null },
  agent: { type: String, default: null },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  event: { type: String, default: '' },
  message: { type: String, required: true },
  traceId: { type: String, index: true, default: null },
  spanId: { type: String, default: null },
  parentSpanId: { type: String, default: null },
  durationMs: { type: Number, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ExecutionLogSchema.index({ execution: 1, createdAt: 1 });

module.exports = mongoose.model('ExecutionLog', ExecutionLogSchema);
