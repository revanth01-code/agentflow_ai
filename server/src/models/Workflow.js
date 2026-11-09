const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, default: '' },
  category: { type: String, default: '' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'idle' }
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  label: { type: String, default: '' },
  animated: { type: Boolean, default: false },
  condition: { type: String, default: '' }
}, { _id: false });

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  trigger: {
    type: { type: String, default: 'manual' },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  version: { type: Number, default: 1 },
  tags: [{ type: String }],
  lastExecutedAt: { type: Date }
}, { timestamps: true });

WorkflowSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);
