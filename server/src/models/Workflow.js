const mongoose = require('mongoose');

// TODO: Define the node fields: id, type, label, category, position (x, y), config, status.
const NodeSchema = new mongoose.Schema({}, { _id: false });

// TODO: Define the edge fields: id, source, target, label, animated, condition.
const EdgeSchema = new mongoose.Schema({}, { _id: false });

// TODO: Define the fields: name, description, owner, status ('draft' | 'active' | 'paused' |
// TODO: 'archived'), trigger (type, config), nodes, edges, version, tags, lastExecutedAt.
// TODO: Add the compound index on owner + updatedAt.
const WorkflowSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);
