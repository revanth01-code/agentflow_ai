const mongoose = require('mongoose');

// TODO: Define the fields: execution, workflow, nodeId, agent,
// TODO: level ('info' | 'warning' | 'error' | 'success'), event, message, metadata.
const ExecutionLogSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ExecutionLog', ExecutionLogSchema);
