const mongoose = require('mongoose');

// TODO: Define the fields: workflow, execution, agent, key, value, confidence.
const AgentMemorySchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('AgentMemory', AgentMemorySchema);
