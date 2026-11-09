const mongoose = require('mongoose');

const AgentMemorySchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null },
  execution: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', default: null },
  agent: { type: String, default: 'orchestrator' },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  confidence: { type: Number, default: 1 }
}, { timestamps: true });

AgentMemorySchema.index({ workflow: 1, key: 1 });

module.exports = mongoose.model('AgentMemory', AgentMemorySchema);
